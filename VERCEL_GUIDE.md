# 🚀 Vercel로 웹사이트 게시하기 (초보자용 가이드)

## 📖 이 가이드는 뭔가요?

VoiceClip 앱을 인터넷에 올려서 누구나 사용할 수 있게 만드는 방법을 설명합니다.
마치 유튜브에 영상을 올리면 누구나 볼 수 있는 것처럼, 코드를 Vercel에 올리면 누구나 사용할 수 있어요!

---

## 🎯 전체 과정 요약 (3단계)

1. **코드를 GitHub에 올리기** (코드 보관함에 저장)
2. **Vercel에 연결하기** (웹사이트 만들기)
3. **환경 변수 설정하기** (비밀번호 입력하기)

총 소요 시간: 약 10분

---

## 📝 준비물

- ✅ 컴퓨터에 설치된 VoiceClip 앱 코드
- ✅ GitHub 계정 (없으면 만들어야 함)
- ✅ Vercel 계정 (GitHub로 간단히 만들 수 있음)
- ✅ Azure 키들 (SPEECH_KEY, SPEECH_REGION 등)

---

## 1단계: GitHub에 코드 올리기

### GitHub가 뭔가요?
- 코드를 보관하는 무료 창고 같은 곳
- 다른 사람들과 코드를 공유할 수 있음
- Vercel이 여기서 코드를 가져가서 웹사이트를 만듦

### 1-1. GitHub 계정 만들기

1. [github.com](https://github.com) 접속
2. "Sign up" 클릭
3. 이메일, 비밀번호 입력하고 계정 만들기
4. 이메일 인증하기

### 1-2. 새 저장소 만들기

1. GitHub에 로그인
2. 오른쪽 위 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 이름 입력 (예: `voiceclip-app`)
4. "Public" 선택 (무료로 사용하려면)
5. "Create repository" 클릭

### 1-3. ⚠️ 중요! API 키 확인하기 (반드시 먼저 확인!)

**GitHub에 올리기 전에 반드시 확인해야 할 것:**

1. **코드에 API 키가 직접 쓰여있지 않은지 확인**
   - 코드에 `abc123...` 같은 키가 직접 쓰여있으면 안 돼요!
   - `process.env.SPEECH_KEY`처럼 환경 변수를 사용해야 해요

2. **.env.local 파일이 Git에 포함되지 않았는지 확인**

터미널에서 다음 명령어를 실행하세요:

```bash
# 프로젝트 폴더로 이동
cd /Users/admin/workspace/voice-translation-app

# .env.local 파일이 Git에 포함되지 않았는지 확인
git status | grep .env

# 만약 아무것도 안 나오면 안전해요!
# 만약 .env 파일이 나오면 위험하니 알려주세요!
```

**확인 결과:**
- ✅ `.env.local` 파일이 목록에 안 나오면 → 안전! 계속 진행
- ❌ `.env.local` 파일이 목록에 나오면 → 위험! 먼저 수정 필요

### 1-4. 코드를 GitHub에 올리기

터미널(명령어 창)을 열고 다음 명령어를 입력하세요:

```bash
# 1. 프로젝트 폴더로 이동
cd /Users/admin/workspace/voice-translation-app

# 2. Git 초기화 (이미 했다면 건너뛰기)
git init

# 3. 모든 파일 추가
git add .

# 4. 첫 번째 저장 (커밋)
git commit -m "첫 번째 버전"

# 5. GitHub 저장소 연결 (your-username을 본인 GitHub 아이디로 변경)
git remote add origin https://github.com/your-username/voiceclip-app.git

# 6. GitHub에 올리기 (푸시)
git branch -M main
git push -u origin main
```

**중요:** 
- `your-username`을 본인의 GitHub 아이디로 바꿔야 해요!
- 예: `https://github.com/kimstudent/voiceclip-app.git`

**첫 번째 푸시 시:**
- GitHub 로그인 창이 뜰 수 있어요
- 로그인하면 자동으로 올라갑니다

**⚠️ 마지막 확인:**
GitHub에 올라가기 전에 한 번 더 확인하세요:

```bash
# 올라갈 파일 목록 확인
git status

# .env 파일이 있는지 확인 (없어야 해요!)
git status | grep -i env
```

만약 `.env` 관련 파일이 보이면:
1. 터미널에서 `Ctrl + C` 눌러서 중단
2. `.gitignore` 파일 확인
3. 문제 해결 후 다시 시도

### 1-5. 확인하기

GitHub 웹사이트에서 본인 저장소로 가서 파일들이 올라갔는지 확인하세요!

---

## 2단계: Vercel에 연결하기

### Vercel이 뭔가요?
- 웹사이트를 무료로 만들어주는 도구
- Next.js 앱을 만든 회사에서 만든 서비스
- 코드를 받아서 자동으로 웹사이트로 만들어줌

### 2-1. Vercel 계정 만들기

1. [vercel.com](https://vercel.com) 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 클릭 (가장 쉬움!)
4. GitHub 로그인하면 자동으로 Vercel 계정이 만들어짐

### 2-2. 새 프로젝트 만들기

1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. "Import Git Repository" 클릭
3. 방금 만든 GitHub 저장소 선택
4. "Import" 클릭

### 2-3. 프로젝트 설정

Vercel이 자동으로 설정을 감지해요:
- **Framework Preset**: Next.js (자동 선택됨)
- **Root Directory**: `./` (그대로 두기)
- **Build Command**: `npm run build` (자동 설정됨)
- **Output Directory**: `.next` (자동 설정됨)

**그냥 "Deploy" 버튼을 클릭하세요!**

### 2-4. 첫 배포 완료! (하지만 아직 작동 안 함)

배포가 완료되면 URL이 생겨요:
- 예: `voiceclip-app.vercel.app`
- 하지만 아직 환경 변수를 설정하지 않아서 작동하지 않아요!

---

## 3단계: 환경 변수 설정하기 (가장 중요!)

### 환경 변수가 뭔가요?
- 앱이 작동하는데 필요한 비밀번호 같은 것
- Azure 키들이 여기에 들어가요
- 코드에 직접 쓰면 안 되고, 여기에만 써야 해요!

### 3-1. 환경 변수 추가하기

1. Vercel 대시보드에서 방금 만든 프로젝트 클릭
2. 위쪽 메뉴에서 "Settings" 클릭
3. 왼쪽 메뉴에서 "Environment Variables" 클릭
4. "Add New" 버튼 클릭

### 3-2. 각 변수 하나씩 추가하기

다음 5개를 하나씩 추가하세요:

#### 1번째: SPEECH_KEY
- **Key**: `SPEECH_KEY`
- **Value**: 본인의 Azure Speech Service 키 (복사해서 붙여넣기)
- **Environment**: Production, Preview, Development 모두 체크
- "Save" 클릭

#### 2번째: SPEECH_REGION
- **Key**: `SPEECH_REGION`
- **Value**: 본인의 Azure Speech Service 리전 (예: `koreacentral`)
- **Environment**: 모두 체크
- "Save" 클릭

#### 3번째: AZURE_OPENAI_KEY
- **Key**: `AZURE_OPENAI_KEY`
- **Value**: 본인의 Azure OpenAI 키
- **Environment**: 모두 체크
- "Save" 클릭

#### 4번째: AZURE_OPENAI_ENDPOINT
- **Key**: `AZURE_OPENAI_ENDPOINT`
- **Value**: 본인의 Azure OpenAI 엔드포인트 (예: `https://your-resource.openai.azure.com`)
- **Environment**: 모두 체크
- "Save" 클릭

#### 5번째: AZURE_OPENAI_DEPLOYMENT
- **Key**: `AZURE_OPENAI_DEPLOYMENT`
- **Value**: 본인의 Azure OpenAI 배포 이름 (예: `gpt-4o`)
- **Environment**: 모두 체크
- "Save" 클릭

### 3-3. 재배포하기

환경 변수를 추가한 후에는 다시 배포해야 해요:

1. 위쪽 메뉴에서 "Deployments" 클릭
2. 가장 최근 배포 옆에 "..." (점 3개) 클릭
3. "Redeploy" 클릭
4. "Redeploy" 확인

또는 더 간단하게:
1. "Deployments" 탭으로 가기
2. 최근 배포 옆에 "Redeploy" 버튼 클릭

---

## 4단계: 완료! 확인하기

### 4-1. 웹사이트 접속하기

배포가 완료되면:
1. Vercel 대시보드에서 프로젝트 클릭
2. "Domains" 섹션에서 URL 확인 (예: `voiceclip-app.vercel.app`)
3. URL 클릭하거나 브라우저에 입력해서 접속

### 4-2. 테스트하기

1. 웹사이트가 열리는지 확인
2. 마이크 권한 허용
3. 녹음 테스트
4. 번역 테스트

**만약 에러가 나면:**
- 환경 변수가 제대로 설정되었는지 확인
- 재배포가 완료되었는지 확인 (몇 분 걸릴 수 있어요)

---

## 🎉 완료!

이제 누구나 인터넷에서 VoiceClip 앱을 사용할 수 있어요!

---

## 📌 자주 묻는 질문 (FAQ)

### Q1. 비용이 얼마나 드나요?
**A:** 완전 무료예요! 개인 프로젝트는 무료로 사용할 수 있어요.

### Q2. 코드를 수정하면 어떻게 되나요?
**A:** GitHub에 코드를 올리면 (push) 자동으로 Vercel이 새 버전을 배포해요!

### Q3. URL을 바꿀 수 있나요?
**A:** 네! Settings → Domains에서 커스텀 도메인을 추가할 수 있어요.

### Q4. 환경 변수를 실수로 잘못 입력했어요
**A:** Settings → Environment Variables에서 수정하거나 삭제할 수 있어요. 수정 후 재배포하면 돼요.

### Q5. 배포가 실패했어요
**A:** 
- 환경 변수가 모두 설정되었는지 확인
- 로컬에서 `npm run build`가 성공하는지 확인
- Vercel의 "Logs" 탭에서 에러 메시지 확인

---

## 🆘 도움이 필요해요?

1. **Vercel 문서**: [vercel.com/docs](https://vercel.com/docs)
2. **GitHub 가이드**: [guides.github.com](https://guides.github.com)
3. **에러 메시지 확인**: Vercel 대시보드 → Deployments → 실패한 배포 → Logs

---

## ✅ 체크리스트

배포 전에 확인하세요:

- [ ] GitHub 계정 만들기
- [ ] GitHub에 코드 올리기
- [ ] Vercel 계정 만들기
- [ ] Vercel에 프로젝트 연결
- [ ] 환경 변수 5개 모두 추가
- [ ] 재배포 완료
- [ ] 웹사이트 접속해서 테스트

---

**축하합니다! 🎊 이제 여러분의 앱이 인터넷에 살아있어요!**

