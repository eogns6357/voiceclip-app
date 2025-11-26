# 빠른 시작 가이드

## 🚀 실행 방법

### 1단계: 프로젝트 디렉토리로 이동

```bash
cd /Users/admin/workspace/voice-translation-app
```

### 2단계: 의존성 패키지 설치

```bash
npm install
```

이 명령은 `package.json`에 정의된 모든 패키지를 설치합니다:
- Next.js 14
- React 18
- Azure Speech SDK
- Azure OpenAI SDK
- TypeScript
- Tailwind CSS

### 3단계: 환경 변수 설정

프로젝트 루트 디렉토리에 `.env.local` 파일을 생성하세요:

```bash
# 터미널에서 파일 생성
touch .env.local
```

그리고 다음 내용을 입력하세요:

```env
# Azure Speech Service
SPEECH_KEY=여기에_스피치_키_입력
SPEECH_REGION=여기에_리전_입력 (예: koreacentral, eastus)

# Azure OpenAI
AZURE_OPENAI_KEY=여기에_오픈AI_키_입력
AZURE_OPENAI_ENDPOINT=https://여기에_리소스명.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=여기에_모델_배포명_입력 (예: gpt-4o, gpt-4)
```

**중요**: 
- `.env.local` 파일은 Git에 커밋되지 않습니다 (보안)
- 실제 Azure 리소스의 키와 엔드포인트를 입력해야 합니다

### 4단계: 개발 서버 실행

```bash
npm run dev
```

성공하면 다음과 같은 메시지가 표시됩니다:

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in X.XXs
```

### 5단계: 브라우저에서 접속

브라우저를 열고 다음 주소로 접속하세요:

**http://localhost:3000**

## 📱 사용 방법

1. **타깃 언어 선택**: 페이지 상단의 드롭다운에서 번역할 언어를 선택합니다.
2. **녹음 시작**: "Start Recording" 버튼을 클릭합니다.
   - 브라우저에서 마이크 권한을 요청하면 "허용"을 클릭하세요.
3. **말하기**: 마이크에 말을 합니다 (예: "안녕하세요")
4. **녹음 중지**: "Recording..." 버튼을 클릭하여 녹음을 중지합니다.
5. **번역 실행**: "Translate & Speak" 버튼을 클릭합니다.
6. **결과 확인**: 
   - 감지된 언어가 표시됩니다
   - 원문 텍스트가 표시됩니다
   - 번역된 텍스트가 표시됩니다
7. **음성 재생**: "Play Translation" 버튼을 클릭하여 번역된 음성을 듣습니다.

## 🔧 문제 해결

### 포트 3000이 이미 사용 중인 경우

다른 포트로 실행하려면:

```bash
PORT=3001 npm run dev
```

또는 `package.json`의 scripts를 수정:

```json
"dev": "next dev -p 3001"
```

### 마이크 권한 오류

- **Chrome/Edge**: 주소창 왼쪽의 자물쇠 아이콘 클릭 → 사이트 설정 → 마이크 권한 확인
- **Safari**: Safari 설정 → 웹사이트 → 마이크 권한 확인
- **Firefox**: 주소창 왼쪽 아이콘 클릭 → 권한 → 마이크 확인

### Azure 인증 오류

`.env.local` 파일의 값들이 올바른지 확인:
- 키가 정확한지
- 엔드포인트 URL이 올바른 형식인지 (끝에 `/` 포함)
- 배포 모델 이름이 정확한지

### 패키지 설치 오류

```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📦 프로덕션 빌드

프로덕션 환경에서 실행하려면:

```bash
# 빌드
npm run build

# 실행
npm start
```

## 🛑 서버 중지

터미널에서 `Ctrl + C`를 눌러 서버를 중지할 수 있습니다.

