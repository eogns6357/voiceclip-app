'use client';

import { useState, useRef, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { OutputLanguage, LANGUAGE_NAMES, TranslationResponse, ErrorResponse } from '@/types';
import { speechToTextInBrowser } from '@/lib/azure-speech-client';

/**
 * 메인 페이지 컴포넌트
 * 음성 녹음, 번역, TTS 재생 기능을 제공합니다.
 */
export default function Home() {
  const [targetLanguage, setTargetLanguage] = useState<OutputLanguage>('en');
  const [originalText, setOriginalText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [speechConfig, setSpeechConfig] = useState<{ key: string; region: string } | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // 언어 코드를 이미지 파일명으로 매핑 (작은 아이콘용)
  const getCharacterImage = (lang: OutputLanguage | string): string => {
    const imageMap: Record<string, string> = {
      'en': '/img/English.png',
      'ja': '/img/Japenese.png',
      'zh-CN': '/img/Chinese.png',
      'fr-FR': '/img/French.png',
      'hi-IN': '/img/Hindi.png',
    };
    return imageMap[lang] || '/img/translation_man.png';
  };

  // 언어 코드를 큰 이미지 파일명으로 매핑 (일러스트 영역용)
  const getCharacterBigImage = (lang: OutputLanguage | string): string => {
    const imageMap: Record<string, string> = {
      'en': '/img/English_big.png',
      'ja': '/img/Japenese_big.png',
      'zh-CN': '/img/Chinese_big.png',
      'fr-FR': '/img/French_big.png',
      'hi-IN': '/img/Hindi_big.png',
    };
    return imageMap[lang] || '/img/translation_man.png';
  };

  // Speech Service 설정 로드
  useEffect(() => {
    fetch('/api/speech-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.key && data.region) {
          setSpeechConfig({ key: data.key, region: data.region });
        }
      })
      .catch((err) => {
        console.error('Failed to load speech config:', err);
        setError('Failed to initialize speech service');
      });
  }, []);

  const {
    isRecording,
    audioBlob,
    error: recorderError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  /**
   * 녹음된 오디오를 브라우저에서 STT 수행 후 서버로 번역 요청
   */
  const handleTranslate = async () => {
    if (!audioBlob) {
      setError('No audio recorded. Please record audio first.');
      return;
    }

    if (!speechConfig) {
      setError('Speech service is not initialized. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setOriginalText('');
    setTranslatedText('');
    setDetectedLanguage('');
    setAudioBase64(null);

    try {
      // Step 1: 브라우저에서 STT 수행
      const sttResult = await speechToTextInBrowser(
        audioBlob,
        speechConfig.key,
        speechConfig.region
      );

      if (!sttResult.text || !sttResult.detectedLanguage) {
        throw new Error('Failed to recognize speech or detect language');
      }

      setOriginalText(sttResult.text);
      setDetectedLanguage(sttResult.detectedLanguage);

      // Step 2: 서버로 번역 및 TTS 요청
      const response = await fetch('/api/translate-and-speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: sttResult.text,
          detectedLanguage: sttResult.detectedLanguage,
          targetLanguage: targetLanguage,
        }),
      });

      const data: TranslationResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.message || 'Translation failed');
      }

      const translationData = data as TranslationResponse;
      setTranslatedText(translationData.translatedText);
      setAudioBase64(translationData.audioBase64);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 번역된 음성 재생
   */
  const handlePlayAudio = () => {
    if (audioBase64 && audioRef.current) {
      // Base64를 Data URL로 변환 (MP3 형식)
      const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;
      audioRef.current.src = audioDataUrl;
      audioRef.current.load();
      audioRef.current.play().catch((err) => {
        console.error('Failed to play audio:', err);
        setError('Failed to play audio. Please try again.');
      });
    }
  };

  /**
   * 녹음 시작 핸들러
   */
  const handleStartRecording = async () => {
    setError(null);
    clearRecording();
    await startRecording();
  };

  /**
   * 녹음 중지
   */
  const handleStopRecording = () => {
    stopRecording();
  };

  // audioBlob이 업데이트되고 녹음이 중지되면 자동으로 번역 수행
  useEffect(() => {
    if (audioBlob && !isRecording && !isProcessing) {
      // 이전 번역 결과를 초기화하지 않고 자동 번역 수행
      handleTranslate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, isRecording]);

  /**
   * 언어 변경 시 번역만 다시 수행 (STT는 건너뛰고 기존 텍스트 사용)
   */
  const handleTranslateForLanguageChange = async () => {
    if (!originalText || !detectedLanguage) {
      // 원문이 없으면 전체 번역 수행
      await handleTranslate();
      return;
    }

    if (!speechConfig) {
      setError('Speech service is not initialized. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setTranslatedText('');
    setAudioBase64(null);

    try {
      // 기존 원문과 감지된 언어를 사용하여 번역만 수행
      const response = await fetch('/api/translate-and-speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalText: originalText,
          detectedLanguage: detectedLanguage,
          targetLanguage: targetLanguage,
        }),
      });

      const data: TranslationResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.message || 'Translation failed');
      }

      const translationData = data as TranslationResponse;
      setTranslatedText(translationData.translatedText);
      setAudioBase64(translationData.audioBase64);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // targetLanguage가 변경되면 번역만 다시 수행 (초기화하지 않음)
  useEffect(() => {
    if (audioBlob && !isRecording && !isProcessing && originalText && detectedLanguage) {
      // 원문이 있으면 번역만 다시 수행
      handleTranslateForLanguageChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLanguage]);

  /**
   * 모든 데이터 초기화
   */
  const handleReset = () => {
    setOriginalText('');
    setTranslatedText('');
    setDetectedLanguage('');
    setAudioBase64(null);
    setError(null);
    clearRecording();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-gray-800 dark:text-white">
            VoiceClip
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            Create by K, Voice Translation App
          </p>
        </div>

        {/* 메인 컨텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* 왼쪽: 일러스트 및 언어 선택 */}
          <div className="space-y-6">
            {/* 언어별 캐릭터 선택 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              {/* <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4 text-center">
                Select Target Language
              </div> */}
              <div className="flex justify-center gap-4 flex-wrap">
                {(['en', 'ja', 'zh-CN', 'fr-FR', 'hi-IN'] as OutputLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setTargetLanguage(lang)}
                    disabled={isProcessing || isRecording}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200 ${
                      targetLanguage === lang
                        ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                    } ${isProcessing || isRecording ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={LANGUAGE_NAMES[lang]}
                  >
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={getCharacterImage(lang)}
                        alt={LANGUAGE_NAMES[lang]}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // 이미지가 없으면 기본 이미지 사용
                          (e.target as HTMLImageElement).src = '/img/translation_man.png';
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {LANGUAGE_NAMES[lang]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 일러스트 영역 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center w-full">
                {/* 캐릭터 일러스트 - 선택된 언어에 따라 변경 */}
                <div className="relative w-[330px] h-[330px] md:w-[394px] md:h-[394px] mx-auto mb-6 bg-white dark:bg-white rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300">
                  <img
                    key={targetLanguage}
                    src={getCharacterBigImage(targetLanguage)}
                    alt={`${LANGUAGE_NAMES[targetLanguage]} Character`}
                    className="w-full h-full object-contain transition-opacity duration-300"
                    onError={(e) => {
                      // 이미지가 없으면 기본 이미지 사용
                      (e.target as HTMLImageElement).src = '/img/translation_man.png';
                    }}
                  />
                </div>
                
                {/* 문구와 녹음 버튼 */}
                <div className="flex items-center justify-center gap-4 mb-2">
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                    음성을 녹음하여 번역하세요
                  </p>
                  
                  {/* 녹음 버튼 */}
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      disabled={isProcessing}
                      className="w-16 h-16 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95 border-4 border-green-300 dark:border-green-700 flex-shrink-0"
                      title="Start Recording"
                    >
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecording}
                      className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center animate-pulse hover:scale-110 active:scale-95 border-4 border-red-300 dark:border-red-700 flex-shrink-0"
                      title="Stop Recording"
                    >
                      <div className="w-6 h-6 bg-white rounded-sm"></div>
                    </button>
                  )}
                </div>
                
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Record your voice to translate
                </p>
                
                {/* 번역은 자동으로 수행되므로 버튼 제거 */}
                {isProcessing && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm font-medium">Processing translation...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* 오른쪽: 번역 텍스트 표시 영역 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 min-h-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Translation Result
                  </h2>
                  {(originalText || translatedText || detectedLanguage) && (
                    <button
                      onClick={handleReset}
                      disabled={isProcessing || isRecording}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Reset all data"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Reset
                    </button>
                  )}
                </div>
                
                {recorderError && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-700 dark:text-red-300 text-sm">
                    {recorderError}
                  </div>
                )}

                {error && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="text-red-700 dark:text-red-300 font-medium">Error:</div>
                    <div className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</div>
                  </div>
                )}

                {/* 감지된 언어 */}
                {detectedLanguage && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detected Language:
                    </div>
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {LANGUAGE_NAMES[detectedLanguage as keyof typeof LANGUAGE_NAMES] || detectedLanguage}
                    </div>
                  </div>
                )}

                {/* 원문 텍스트 */}
                {originalText && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Text:
                    </div>
                    <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-md p-4 min-h-[60px] text-base leading-relaxed">
                      {originalText}
                    </div>
                  </div>
                )}

                {/* 번역 텍스트 */}
                {translatedText && (
                  <div className="mb-4">
                    {/* <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Translated Text ({LANGUAGE_NAMES[targetLanguage]}):
                    </div> */}
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Translated Text:
                    </div>
                    <div className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-md p-4 min-h-[100px] text-base leading-relaxed">
                      {translatedText}
                    </div>
                    {audioBase64 && (
                      <button
                        onClick={handlePlayAudio}
                        className="mt-4 w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        Play Translation
                      </button>
                    )}
                  </div>
                )}

                {/* 빈 상태 메시지 */}
                {!detectedLanguage && !originalText && !translatedText && !error && (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        />
                      </svg>
                      <p className="text-sm">번역 결과가 여기에 표시됩니다</p>
                      <p className="text-xs mt-1">Translation results will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* 숨겨진 오디오 엘리먼트 */}
        <audio ref={audioRef} className="hidden" />
      </div>
    </main>
  );
}
