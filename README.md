# Voice Translation App - Hotel Front Desk PoC

실시간 음성 번역 애플리케이션 (Proof of Concept) - 호텔 프론트데스크용

## 개요

이 프로젝트는 실시간 음성 번역 애플리케이션입니다. 
브라우저 마이크로 음성을 녹음하고, Azure Speech Service를 사용하여 음성을 텍스트로 변환(STT)하고 자동 언어를 감지한 후, Azure OpenAI를 통해 번역하고, 다시 Azure Speech Service로 음성으로 변환(TTS)하여 재생합니다.

## 주요 기능

- **자동 언어 감지**: 입력 언어를 자동으로 감지 (한국어, 영어, 일본어, 중국어, 프랑스어, 힌디어)
- **다국어 번역**: 5개 언어로 번역 지원 (영어, 일본어, 중국어, 프랑스어, 힌디어)
- **음성 인식 (STT)**: Azure Speech Service를 사용한 고품질 음성 인식
- **음성 합성 (TTS)**: 번역된 텍스트를 자연스러운 음성으로 변환
- **실시간 처리**: REST API 기반의 빠른 번역 처리

## 기술 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, React Hooks
- **Backend**: Next.js API Routes
- **STT/TTS**: Azure Speech Service SDK
- **번역**: Azure OpenAI (GPT-4o 또는 GPT-4.1)
- **오디오 녹음**: MediaRecorder API

## 프로젝트 구조

```
voice-translation-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── translate-and-speak/
│   │   │       └── route.ts          # 번역 API 엔드포인트
│   │   ├── globals.css               # 전역 스타일
│   │   ├── layout.tsx                # 루트 레이아웃
│   │   └── page.tsx                  # 메인 페이지
│   ├── hooks/
│   │   └── useAudioRecorder.ts       # 오디오 녹음 커스텀 훅
│   ├── lib/
│   │   ├── azure-speech.ts           # Azure Speech Service 유틸
│   │   └── azure-openai.ts           # Azure OpenAI 유틸
│   └── types/
│       └── index.ts                  # TypeScript 타입 정의
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
# Azure Speech Service
SPEECH_KEY=YOUR_SPEECH_KEY
SPEECH_REGION=YOUR_REGION

# Azure OpenAI
AZURE_OPENAI_KEY=YOUR_OPENAI_KEY
AZURE_OPENAI_ENDPOINT=YOUR_ENDPOINT
AZURE_OPENAI_DEPLOYMENT=YOUR_MODEL_NAME
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 사용 방법

1. **타깃 언어 선택**: 드롭다운에서 번역할 언어를 선택합니다.
2. **녹음 시작**: "Start Recording" 버튼을 클릭하여 마이크 권한을 허용하고 녹음을 시작합니다.
3. **녹음 종료**: "Recording..." 버튼을 클릭하여 녹음을 중지합니다.
4. **번역 수행**: "Translate & Speak" 버튼을 클릭하여 번역을 수행합니다.
5. **결과 확인**: 
   - 감지된 언어가 표시됩니다.
   - 원문 텍스트가 표시됩니다.
   - 번역된 텍스트가 표시됩니다.
6. **음성 재생**: "Play Translation" 버튼을 클릭하여 번역된 음성을 재생합니다.

## API 엔드포인트

### POST /api/translate-and-speak

오디오 파일을 받아 STT → 번역 → TTS를 수행합니다.

**요청:**
- `audio`: 오디오 파일 (Blob, FormData)
- `targetLanguage`: 대상 언어 코드 (예: "en", "ja", "zh-CN", "fr-FR", "hi-IN")

**응답:**
```json
{
  "originalText": "원문 텍스트",
  "detectedLanguage": "ko",
  "translatedText": "Translated text",
  "audioBase64": "base64 인코딩된 오디오 데이터"
}
```

**에러 응답:**
```json
{
  "error": "Error Type",
  "message": "Error message"
}
```

## 지원 언어

### 입력 언어 (자동 감지)
- 한국어 (ko)
- 영어 (en)
- 일본어 (ja)
- 중국어 (zh-CN)
- 프랑스어 (fr-FR)
- 힌디어 (hi-IN)

### 출력 언어 (사용자 선택)
- 영어 (en)
- 일본어 (ja)
- 중국어 (zh-CN)
- 프랑스어 (fr-FR)
- 힌디어 (hi-IN)

## 주요 컴포넌트 및 함수

### useAudioRecorder Hook

브라우저 마이크를 사용한 오디오 녹음 기능을 제공하는 커스텀 훅입니다.

```typescript
const {
  isRecording,
  audioBlob,
  error,
  startRecording,
  stopRecording,
  clearRecording,
} = useAudioRecorder();
```

### Azure Speech Service 함수

- `speechToText()`: 음성을 텍스트로 변환하고 자동 언어 감지
- `textToSpeech()`: 텍스트를 음성으로 변환

### Azure OpenAI 함수

- `translateText()`: 텍스트를 지정된 언어로 번역

## 주의사항

1. **마이크 권한**: 브라우저에서 마이크 접근 권한이 필요합니다.
2. **HTTPS**: 프로덕션 환경에서는 HTTPS가 필요합니다 (마이크 접근 권한).
3. **Azure 리소스**: Azure Speech Service와 Azure OpenAI 리소스가 필요합니다.
4. **오디오 형식**: 현재 WebM 형식으로 녹음되며, Azure Speech Service는 다양한 형식을 지원합니다.

## 배포

온라인에 앱을 배포하여 다른 사람들이 사용할 수 있게 만들 수 있습니다.

### 빠른 배포 (Vercel 추천 - 완전 무료! 💰)

**Vercel은 무료 티어를 제공하며, 개인 프로젝트에는 충분합니다!**

1. **GitHub에 코드 업로드**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # GitHub에 새 저장소 생성 후
   git remote add origin https://github.com/your-username/voice-translation-app.git
   git push -u origin main
   ```

2. **Vercel에 배포**
   - [vercel.com](https://vercel.com) 접속 및 가입 (GitHub 계정으로 간편 가입)
   - "New Project" 클릭 → GitHub 저장소 선택
   - 환경 변수 설정 (아래 참고)
   - "Deploy" 클릭

3. **환경 변수 설정**
   Vercel 프로젝트 설정 → Environment Variables에 추가:
   - `SPEECH_KEY`
   - `SPEECH_REGION`
   - `AZURE_OPENAI_KEY`
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_OPENAI_DEPLOYMENT`

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

## 문제 해결

### 마이크 권한 오류
- 브라우저 설정에서 마이크 권한을 확인하세요.
- HTTPS 환경에서 실행하세요 (로컬 개발은 localhost에서도 가능).

### Azure 인증 오류
- 환경 변수가 올바르게 설정되었는지 확인하세요.
- Azure 리소스의 키와 엔드포인트가 정확한지 확인하세요.

### 번역 실패
- Azure OpenAI 리소스가 활성화되어 있는지 확인하세요.
- 배포 모델 이름이 올바른지 확인하세요.

### 배포 관련
- 빌드 실패 시 로컬에서 `npm run build` 테스트
- 환경 변수가 모두 설정되었는지 확인
- `.env.local` 파일이 Git에 커밋되지 않았는지 확인

## 라이선스

이 프로젝트는 PoC(Proof of Concept) 목적으로 제작되었습니다.

