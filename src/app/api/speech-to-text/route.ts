import { NextRequest, NextResponse } from 'next/server';
import { ErrorResponse } from '@/types';

/**
 * POST /api/speech-to-text
 * 
 * 서버 측에서 Azure Speech Service REST API를 사용하여 STT를 수행합니다.
 * REST API를 사용하여 SDK의 문제를 회피합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION;

    if (!speechKey || !speechRegion) {
      const errorResponse: ErrorResponse = {
        error: 'Configuration Error',
        message: 'Azure Speech Service credentials are not configured',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        message: 'Audio file is required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 오디오를 ArrayBuffer로 변환
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // Azure Speech Service REST API 사용
    // 순차적으로 여러 언어를 시도하여 자동 언어 감지
    // 동시 요청 제한을 피하기 위해 순차 처리
    const languages = ['ko-KR', 'en-US', 'ja-JP', 'zh-CN', 'fr-FR', 'hi-IN'];
    
    let bestResult: any = null;
    let bestConfidence = 0;
    const errors: string[] = [];

    // 순차적으로 각 언어 시도
    for (const lang of languages) {
      try {
        const endpoint = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${lang}&format=detailed`;
        
        // 파일 확장자 확인하여 Content-Type 설정
        const fileName = audioFile.name.toLowerCase();
        let contentType = 'audio/wav; codecs=audio/pcm; samplerate=16000';
        
        if (fileName.endsWith('.webm')) {
          // WebM인 경우 WAV로 변환되었거나, 원본을 시도
          contentType = 'audio/wav; codecs=audio/pcm; samplerate=16000';
        } else if (fileName.endsWith('.wav')) {
          contentType = 'audio/wav; codecs=audio/pcm; samplerate=16000';
        }
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': speechKey,
            'Content-Type': contentType,
            'Accept': 'application/json',
          },
          body: audioBuffer,
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit 에러인 경우 잠시 대기 후 재시도
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          const errorText = await response.text();
          errors.push(`${lang}: HTTP ${response.status}: ${errorText}`);
          continue;
        }

        const data = await response.json();
        
        // 디버깅을 위한 로그
        console.log(`[STT] ${lang} response:`, {
          status: data.RecognitionStatus,
          hasDisplayText: !!data.DisplayText,
          hasText: !!data.Text,
          displayText: data.DisplayText,
          text: data.Text,
          confidence: data.Confidence,
        });
        
        if (data.RecognitionStatus === 'Success') {
          // DisplayText 또는 Text 필드 확인
          const recognizedText = data.DisplayText || data.Text || '';
          
          if (recognizedText.trim()) {
            const confidence = data.Confidence || 0;
            
            // 첫 번째 성공한 결과를 사용하거나, 더 높은 신뢰도 결과가 있으면 교체
            if (!bestResult || confidence > bestConfidence) {
              bestResult = {
                language: lang,
                text: recognizedText.trim(),
                confidence: confidence,
              };
              bestConfidence = confidence;
            }
            
            // 신뢰도가 높으면 (0.8 이상) 바로 사용
            if (confidence >= 0.8) {
              break;
            }
          } else {
            // Success이지만 텍스트가 없는 경우
            errors.push(`${lang}: Success but no text returned`);
          }
        } else {
          errors.push(`${lang}: ${data.RecognitionStatus}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${lang}: ${errorMessage}`);
        // 계속 다음 언어 시도
        continue;
      }
    }

    if (!bestResult || !bestResult.text) {
      console.error('STT Errors:', errors);
      console.error('Audio buffer size:', audioBuffer.length, 'bytes');
      throw new Error(`No speech recognized. Tried languages: ${languages.join(', ')}. ${errors.length > 0 ? 'Errors: ' + errors.slice(0, 3).join(', ') : 'All languages returned Success but no text.'}`);
    }
    
    console.log('STT Success:', {
      language: bestResult.language,
      text: bestResult.text,
      confidence: bestResult.confidence,
    });

    // 언어 코드를 짧은 형식으로 변환
    const shortLang = bestResult.language.split('-')[0] || 'en';

    return NextResponse.json({
      text: bestResult.text,
      detectedLanguage: shortLang,
    });
  } catch (error) {
    console.error('STT API Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      message: errorMessage,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

