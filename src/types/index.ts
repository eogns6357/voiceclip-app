/**
 * 지원되는 입력 언어 (자동 감지)
 */
export type InputLanguage = 'ko' | 'en' | 'ja' | 'zh-CN' | 'fr-FR' | 'hi-IN';

/**
 * 지원되는 출력 언어 (사용자 선택)
 */
export type OutputLanguage = 'en' | 'ja' | 'zh-CN' | 'fr-FR' | 'hi-IN';

/**
 * 언어 코드와 표시명 매핑
 */
export const LANGUAGE_NAMES: Record<InputLanguage | OutputLanguage, string> = {
  ko: 'Korean',
  en: 'English',
  ja: 'Japanese',
  'zh-CN': 'Chinese',
  'fr-FR': 'French',
  'hi-IN': 'Hindi',
};

/**
 * API 응답 타입
 */
export interface TranslationResponse {
  originalText: string;
  detectedLanguage: InputLanguage;
  translatedText: string;
  audioBase64: string;
}

/**
 * API 에러 응답 타입
 */
export interface ErrorResponse {
  error: string;
  message: string;
}

