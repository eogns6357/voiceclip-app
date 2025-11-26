/**
 * 브라우저에서 사용하는 Azure Speech Service REST API 클라이언트
 * STT (Speech-to-Text) 기능을 제공합니다.
 */

import { convertWebmToWav } from './audio-converter';

/**
 * STT 결과 타입
 */
export interface STTResult {
  text: string;
  detectedLanguage: string;
}

/**
 * 브라우저에서 Azure Speech Service REST API를 사용한 음성 인식 (STT)
 * @param audioBlob - 오디오 Blob 데이터 (WebM 형식)
 * @param speechKey - Azure Speech Service 키
 * @param speechRegion - Azure Speech Service 리전
 * @returns STT 결과 (텍스트 및 감지된 언어)
 */
export async function speechToTextInBrowser(
  audioBlob: Blob,
  speechKey: string,
  speechRegion: string
): Promise<STTResult> {
  try {
    // WebM을 WAV로 변환
    let wavBlob: Blob;
    try {
      wavBlob = await convertWebmToWav(audioBlob);
    } catch (conversionError) {
      // 변환 실패 시 원본 사용
      console.warn('WebM to WAV conversion failed, using original:', conversionError);
      wavBlob = audioBlob;
    }
    
    const formData = new FormData();
    formData.append('audio', wavBlob, 'recording.wav');
    
    // 서버 측 STT API 호출
    const response = await fetch('/api/speech-to-text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.text || !data.detectedLanguage) {
      throw new Error('No speech recognized');
    }

    return {
      text: data.text,
      detectedLanguage: data.detectedLanguage,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Speech recognition failed: ${errorMessage}`);
  }
}
