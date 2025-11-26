# 배포 가이드 (Deployment Guide)

VoiceClip 앱을 온라인에 배포하는 방법을 안내합니다.

> 💡 **초보자용 가이드**: 중학생도 이해할 수 있는 쉬운 설명이 필요하시면 [VERCEL_GUIDE.md](./VERCEL_GUIDE.md)를 참고하세요!

## 💰 무료 배포 가능!

**모든 추천 플랫폼은 무료 티어를 제공합니다!** 개인 프로젝트나 소규모 사용에는 충분합니다.

## 🚀 배포 옵션 (모두 무료 티어 제공)

### 1. Vercel (추천 - 가장 쉬움) ⭐ 무료

Vercel은 Next.js를 만든 회사에서 제공하는 플랫폼으로, Next.js 앱 배포에 최적화되어 있습니다.

**무료 티어 혜택:**
- ✅ 무제한 개인 프로젝트
- ✅ 무제한 대역폭
- ✅ 자동 HTTPS
- ✅ 자동 배포 (GitHub 연동)
- ✅ 커스텀 도메인 지원
- ✅ 월 100GB 대역폭
- ✅ 월 6,000분 빌드 시간

**제한사항:**
- 팀 프로젝트는 유료
- 엔터프라이즈 기능은 유료

#### 단계별 가이드

1. **Git 저장소 준비**
   ```bash
   # Git 저장소 초기화 (아직 안 했다면)
   git init
   git add .
   git commit -m "Initial commit"
   
   # GitHub에 저장소 생성 후 연결
   git remote add origin https://github.com/your-username/voice-translation-app.git
   git push -u origin main
   ```

2. **Vercel 계정 생성 및 배포**
   - [Vercel](https://vercel.com)에 가입 (GitHub 계정으로 간편 가입 가능)
   - "New Project" 클릭
   - GitHub 저장소 선택
   - 프로젝트 설정:
     - Framework Preset: Next.js (자동 감지됨)
     - Root Directory: `./` (기본값)
     - Build Command: `npm run build` (자동 설정됨)
     - Output Directory: `.next` (자동 설정됨)

3. **환경 변수 설정**
   
   ⚠️ **중요**: 환경 변수는 절대 코드에 직접 작성하지 마세요!
   
   Vercel 대시보드에서 프로젝트 설정 → Environment Variables에 다음 변수 추가:
   
   ```
   SPEECH_KEY=your_azure_speech_key
   SPEECH_REGION=your_azure_speech_region
   AZURE_OPENAI_KEY=your_azure_openai_key
   AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
   AZURE_OPENAI_DEPLOYMENT=your_azure_openai_deployment
   ```
   
   **GitHub Secrets와의 차이:**
   - GitHub Secrets는 GitHub Actions에서만 사용 가능
   - Vercel은 자체 환경 변수 시스템 사용 (GitHub Secrets와 별개)
   - 둘 다 안전하지만, Vercel 배포 시에는 Vercel 환경 변수를 사용해야 함

4. **배포 완료**
   - 배포가 완료되면 자동으로 URL이 생성됩니다 (예: `your-app.vercel.app`)
   - 커밋할 때마다 자동으로 재배포됩니다

#### Vercel CLI 사용 (선택사항)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

### 2. Netlify ⭐ 무료

Netlify도 Next.js 배포를 잘 지원합니다.

**무료 티어 혜택:**
- ✅ 무제한 사이트
- ✅ 월 100GB 대역폭
- ✅ 월 300분 빌드 시간
- ✅ 자동 HTTPS
- ✅ 커스텀 도메인 지원

**제한사항:**
- 대역폭 초과 시 유료
- 빌드 시간 초과 시 유료

1. **GitHub 저장소 준비** (위와 동일)

2. **Netlify 배포**
   - [Netlify](https://www.netlify.com)에 가입
   - "Add new site" → "Import an existing project"
   - GitHub 저장소 선택
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **환경 변수 설정**
   - Site settings → Environment variables에서 설정

---

### 3. Railway ⭐ 무료 (제한적)

Railway는 간단한 배포와 함께 데이터베이스도 제공합니다.

**무료 티어 혜택:**
- ✅ 월 $5 크레딧 (충분한 사용량)
- ✅ 자동 HTTPS
- ✅ 쉬운 배포

**제한사항:**
- 크레딧 소진 시 유료
- 일부 기능 제한

1. **Railway 배포**
   - [Railway](https://railway.app)에 가입
   - "New Project" → "Deploy from GitHub repo"
   - 저장소 선택
   - 환경 변수 설정

---

### 4. Render ⭐ 무료

Render도 무료 티어를 제공합니다.

**무료 티어 혜택:**
- ✅ 무료 웹 서비스
- ✅ 자동 HTTPS
- ✅ 커스텀 도메인 지원

**제한사항:**
- 15분 비활성 시 슬리프 모드 (첫 요청 시 느린 시작)
- 제한된 리소스

1. **Render 배포**
   - [Render](https://render.com)에 가입
   - "New Web Service" → GitHub 저장소 연결
   - Build command: `npm run build`
   - Start command: `npm start`

---

## ⚙️ 환경 변수 설정

### 🔒 보안 주의사항

**절대 하지 말아야 할 것:**
- ❌ 코드에 API 키를 직접 작성
- ❌ `.env` 파일을 Git에 커밋
- ❌ GitHub에 평문으로 키 업로드

**올바른 방법:**
- ✅ 배포 플랫폼의 환경 변수 기능 사용 (Vercel, Netlify 등)
- ✅ GitHub Secrets는 GitHub Actions에서만 사용
- ✅ `.env.local` 파일은 로컬에서만 사용하고 Git에 커밋하지 않음

### 환경 변수 목록

배포 전에 반드시 다음 환경 변수를 설정해야 합니다:

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `SPEECH_KEY` | Azure Speech Service 키 | `abc123...` |
| `SPEECH_REGION` | Azure Speech Service 리전 | `koreacentral` |
| `AZURE_OPENAI_KEY` | Azure OpenAI 키 | `def456...` |
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI 엔드포인트 | `https://your-resource.openai.azure.com` |
| `AZURE_OPENAI_DEPLOYMENT` | Azure OpenAI 배포 이름 | `gpt-4o` |

## 📝 배포 전 체크리스트

- [ ] 환경 변수가 모두 설정되었는지 확인
- [ ] `npm run build`가 로컬에서 성공하는지 확인
- [ ] Git 저장소에 코드가 푸시되었는지 확인
- [ ] `.env.local` 파일이 Git에 커밋되지 않았는지 확인 (`.gitignore` 확인)

## 🔒 보안 주의사항

- **절대 환경 변수를 Git에 커밋하지 마세요!**
- `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다
- 배포 플랫폼의 환경 변수 설정 기능을 사용하세요

## 🐛 문제 해결

### 빌드 실패 시

```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인 및 수정
```

### 환경 변수 관련 에러

- 배포 플랫폼의 환경 변수 설정을 다시 확인
- 변수명이 정확한지 확인 (대소문자 구분)
- 재배포 후 브라우저 캐시 삭제

## 📚 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Azure Speech Service 문서](https://learn.microsoft.com/azure/ai-services/speech-service/)

