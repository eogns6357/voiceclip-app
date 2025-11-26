import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

/**
 * Azure Speech Service 설정
 */
interface SpeechConfig {
  key: string;
  region: string;
}

/**
 * STT 결과 타입
 */
export interface STTResult {
  text: string;
  detectedLanguage: string;
}

/**
 * Azure Speech Service를 사용한 음성 인식 (STT) 및 자동 언어 감지
 * @param audioBuffer - 오디오 데이터 버퍼
 * @param config - Azure Speech Service 설정
 * @returns STT 결과 (텍스트 및 감지된 언어)
 */
export async function speechToText(
  audioBuffer: Buffer,
  config: SpeechConfig
): Promise<STTResult> {
  return speechToTextWithSDK(audioBuffer, config);
}

/**
 * Azure Speech SDK를 사용한 STT
 */
async function speechToTextWithSDK(
  audioBuffer: Buffer,
  config: SpeechConfig
): Promise<STTResult> {
  const speechConfig = sdk.SpeechConfig.fromSubscription(config.key, config.region);
  
  // 자동 언어 감지 설정
  const autoDetectSourceLanguageConfig = sdk.AutoDetectSourceLanguageConfig.fromLanguages([
    'ko-KR',
    'en-US',
    'ja-JP',
    'zh-CN',
    'fr-FR',
    'hi-IN',
  ]);

  // 오디오 스트림 생성
  // Node.js 환경에서는 포맷을 명시적으로 지정하지 않고 기본 스트림 사용
  const pushStream = sdk.AudioInputStream.createPushStream();
  
  try {
    // 오디오 데이터를 스트림에 쓰기
    // Buffer를 ArrayBuffer로 변환
    const arrayBuffer = audioBuffer.buffer.slice(
      audioBuffer.byteOffset,
      audioBuffer.byteOffset + audioBuffer.byteLength
    ) as ArrayBuffer;
    pushStream.write(arrayBuffer);
    pushStream.close();
  } catch (error) {
    pushStream.close();
    throw new Error(`Failed to write audio to stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

  // 인식기 생성
  // 타입 단언을 사용하여 SDK의 타입 정의 문제 해결
  const recognizer = new (sdk.SpeechRecognizer as any)(
    speechConfig,
    autoDetectSourceLanguageConfig,
    audioConfig
  );

  return new Promise((resolve, reject) => {
    let detectedLanguage = '';
    let recognizedText = '';
    let isResolved = false;

    const cleanup = () => {
      if (!isResolved) {
        recognizer.close();
      }
    };

    recognizer.recognized = (_s: unknown, e: sdk.SpeechRecognitionEventArgs) => {
      if (e.result.reason === sdk.ResultReason.RecognizedSpeech && e.result.text) {
        recognizedText = e.result.text;
        
        // 감지된 언어 추출
        const autoDetectResult = sdk.AutoDetectSourceLanguageResult.fromResult(e.result);
        if (autoDetectResult) {
          detectedLanguage = autoDetectResult.language;
        }
      }
    };

    recognizer.canceled = (_s: unknown, e: sdk.SpeechRecognitionCanceledEventArgs) => {
      cleanup();
      if (e.errorCode !== sdk.CancellationErrorCode.NoError) {
        isResolved = true;
        reject(new Error(`Speech recognition canceled: ${e.errorDetails || e.errorCode}`));
      }
    };

    recognizer.sessionStopped = () => {
      cleanup();
      if (!isResolved) {
        isResolved = true;
        if (recognizedText) {
          // 언어 코드를 짧은 형식으로 변환 (예: 'ko-KR' -> 'ko')
          const shortLang = detectedLanguage.split('-')[0] || 'en';
          resolve({
            text: recognizedText,
            detectedLanguage: shortLang,
          });
        } else {
          reject(new Error('No speech recognized'));
        }
      }
    };

    // 타임아웃 설정 (10초)
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        recognizer.stopContinuousRecognitionAsync(
          () => {
            cleanup();
            if (recognizedText) {
              const shortLang = detectedLanguage.split('-')[0] || 'en';
              resolve({
                text: recognizedText,
                detectedLanguage: shortLang,
              });
            } else {
              reject(new Error('Speech recognition timeout'));
            }
          },
          (err: Error) => {
            cleanup();
            reject(err);
          }
        );
      }
    }, 10000);

    recognizer.startContinuousRecognitionAsync(
      () => {
        // 인식 시작 후 잠시 대기하여 결과 수집
        setTimeout(() => {
          if (!isResolved) {
            recognizer.stopContinuousRecognitionAsync(
              () => {
                clearTimeout(timeout);
                cleanup();
                if (!isResolved) {
                  isResolved = true;
                  if (recognizedText) {
                    const shortLang = detectedLanguage.split('-')[0] || 'en';
                    resolve({
                      text: recognizedText,
                      detectedLanguage: shortLang,
                    });
                  } else {
                    reject(new Error('No speech recognized'));
                  }
                }
              },
              (err: Error) => {
                clearTimeout(timeout);
                cleanup();
                if (!isResolved) {
                  isResolved = true;
                  reject(err);
                }
              }
            );
          }
        }, 3000); // 3초 대기
      },
      (err: Error) => {
        clearTimeout(timeout);
        cleanup();
        if (!isResolved) {
          isResolved = true;
          reject(err);
        }
      }
    );
  });
}

/**
 * Azure Speech Service를 사용한 텍스트를 음성으로 변환 (TTS)
 * @param text - 변환할 텍스트
 * @param language - 출력 언어 코드
 * @param config - Azure Speech Service 설정
 * @returns Base64로 인코딩된 오디오 데이터
 */
export async function textToSpeech(
  text: string,
  language: string,
  config: SpeechConfig
): Promise<string> {
  const speechConfig = sdk.SpeechConfig.fromSubscription(config.key, config.region);
  
  // 언어에 따른 음성 설정
  const languageToVoice: Record<string, string> = {
    en: 'en-US-GuyNeural', // 남성 음성 - 깊고 강한 톤
    ja: 'ja-JP-AoiNeural', // 여성 음성 - 밝고 활기찬 톤
    'zh-CN': 'zh-CN-XiaoxuanNeural', // 여성 음성 - 명확하고 선명한 톤
    'fr-FR': 'fr-FR-AlainNeural', // 남성 음성 - 부드럽고 친근한 톤
    'hi-IN': 'hi-IN-SwaraNeural', // 여성 음성 - 부드럽고 친근한 톤
  };

  const voiceName = languageToVoice[language] || languageToVoice.en;
  speechConfig.speechSynthesisVoiceName = voiceName;
  
  // 오디오 포맷 설정 (WAV 형식)
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          // 오디오를 Base64로 변환
          const audioData = Buffer.from(result.audioData);
          const base64Audio = audioData.toString('base64');
          synthesizer.close();
          resolve(base64Audio);
        } else {
          synthesizer.close();
          reject(new Error(`Speech synthesis failed: ${result.reason}`));
        }
      },
      (error) => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}

