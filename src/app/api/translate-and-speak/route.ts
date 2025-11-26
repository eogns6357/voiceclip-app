import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/azure-speech';
import { translateText } from '@/lib/azure-openai';
import { TranslationResponse, ErrorResponse } from '@/types';

/**
 * POST /api/translate-and-speak
 * 
 * STT는 브라우저에서 수행되므로, 서버는 번역과 TTS만 처리합니다.
 * 
 * @param request - Next.js 요청 객체 (JSON body: originalText, detectedLanguage, targetLanguage)
 * @returns 번역 결과 및 TTS 오디오 (Base64)
 */
export async function POST(request: NextRequest) {
  try {
    // 환경 변수 검증
    const speechKey = process.env.SPEECH_KEY;
    const speechRegion = process.env.SPEECH_REGION;
    const openAIKey = process.env.AZURE_OPENAI_KEY;
    const openAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const openAIDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;

    if (!speechKey || !speechRegion) {
      const errorResponse: ErrorResponse = {
        error: 'Configuration Error',
        message: 'Azure Speech Service credentials are not configured',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    if (!openAIKey || !openAIEndpoint || !openAIDeployment) {
      const errorResponse: ErrorResponse = {
        error: 'Configuration Error',
        message: 'Azure OpenAI credentials are not configured',
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // JSON body 파싱
    const body = await request.json();
    const { originalText, detectedLanguage, targetLanguage } = body;

    if (!originalText) {
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        message: 'Original text is required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!detectedLanguage) {
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        message: 'Detected language is required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!targetLanguage) {
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        message: 'Target language is required',
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Step 1: 번역 (Azure OpenAI)
    // 입력 언어와 출력 언어가 같으면 번역 건너뛰기
    let translatedText: string;
    if (detectedLanguage === targetLanguage) {
      translatedText = originalText;
      console.log(`Input and output languages are the same (${detectedLanguage}), skipping translation`);
    } else {
      translatedText = await translateText(
        originalText,
        detectedLanguage,
        targetLanguage,
        {
          key: openAIKey,
          endpoint: openAIEndpoint,
          deployment: openAIDeployment,
        }
      );
      console.log(`Translated from ${detectedLanguage} to ${targetLanguage}: "${originalText}" -> "${translatedText}"`);
    }

    // Step 2: TTS (Text-to-Speech)
    const audioBase64 = await textToSpeech(
      translatedText,
      targetLanguage,
      {
        key: speechKey,
        region: speechRegion,
      }
    );

    // 응답 반환
    const response: TranslationResponse = {
      originalText: originalText,
      detectedLanguage: detectedLanguage as any,
      translatedText: translatedText,
      audioBase64: audioBase64,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Translation API Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      message: errorMessage,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

