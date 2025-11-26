import { OpenAIClient } from '@azure/openai';
import { AzureKeyCredential } from '@azure/core-auth';

/**
 * Azure OpenAI 설정
 */
interface OpenAIConfig {
  key: string;
  endpoint: string;
  deployment: string;
}

/**
 * Azure OpenAI를 사용한 텍스트 번역
 * @param text - 번역할 텍스트
 * @param sourceLanguage - 원본 언어 코드
 * @param targetLanguage - 대상 언어 코드
 * @param config - Azure OpenAI 설정
 * @returns 번역된 텍스트
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  config: OpenAIConfig
): Promise<string> {
  const credential = new AzureKeyCredential(config.key);
  const client = new OpenAIClient(config.endpoint, credential);

  const languageNames: Record<string, string> = {
    ko: 'Korean',
    en: 'English',
    ja: 'Japanese',
    'zh-CN': 'Chinese',
    'fr-FR': 'French',
    'hi-IN': 'Hindi',
  };

  const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
  const targetLangName = languageNames[targetLanguage] || targetLanguage;

  // 더 명확한 번역 프롬프트
  const prompt = `You are a professional translator. Translate the following text from ${sourceLangName} to ${targetLangName}.

Rules:
- Only return the translated text
- Do not add any explanations, comments, or formatting
- Preserve the meaning and tone
- If the text is already in ${targetLangName}, return it as is

Text to translate:
${text}

Translated text:`;

  try {
    const response = await client.getChatCompletions(config.deployment, [
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const translatedText = response.choices[0]?.message?.content?.trim();
    
    if (!translatedText) {
      throw new Error('No translation result received');
    }

    return translatedText;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Translation failed: ${error.message}`);
    }
    throw new Error('Translation failed: Unknown error');
  }
}

