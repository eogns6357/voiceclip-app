# 보안 가이드 (Security Guide)

## 🔐 환경 변수 관리

### GitHub Secrets 사용 가능 여부

**짧은 답변:**
- GitHub Secrets는 **GitHub Actions**에서만 사용 가능합니다
- Vercel, Netlify 같은 배포 플랫폼에서는 **직접 사용할 수 없습니다**
- 각 플랫폼은 자체 환경 변수 시스템을 사용합니다

### 올바른 환경 변수 관리 방법

#### 1. 로컬 개발 환경

```bash
# .env.local 파일 생성 (Git에 커밋하지 않음)
SPEECH_KEY=your_key_here
SPEECH_REGION=your_region
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_ENDPOINT=your_endpoint
AZURE_OPENAI_DEPLOYMENT=your_deployment
```

**확인사항:**
- ✅ `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- ✅ Git에 커밋되지 않았는지 확인: `git status`로 확인

#### 2. Vercel 배포 시

**Vercel 대시보드에서 설정:**
1. 프로젝트 선택
2. Settings → Environment Variables
3. 각 변수 추가 (Production, Preview, Development 선택 가능)

**GitHub Secrets는 사용하지 않습니다!** Vercel은 자체 환경 변수 시스템을 사용합니다.

#### 3. GitHub Actions 사용 시 (선택사항)

만약 GitHub Actions로 CI/CD를 설정한다면:

```yaml
# .github/workflows/deploy.yml
env:
  SPEECH_KEY: ${{ secrets.SPEECH_KEY }}
  SPEECH_REGION: ${{ secrets.SPEECH_REGION }}
  # ...
```

**GitHub Secrets 설정:**
1. 저장소 Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 이름과 값 입력

**하지만:** Vercel 자동 배포를 사용하면 GitHub Actions가 필요 없습니다!

## 🚫 절대 하지 말아야 할 것

### ❌ 코드에 직접 작성

```typescript
// 절대 이렇게 하지 마세요!
const SPEECH_KEY = "abc123..."; // ❌
```

### ❌ .env 파일을 Git에 커밋

```bash
# .env 파일이 커밋되지 않았는지 확인
git status
git log --all --full-history -- .env
```

### ❌ GitHub에 평문으로 업로드

- README.md에 키 작성 ❌
- 코드 주석에 키 작성 ❌
- 이슈나 PR에 키 공유 ❌

## ✅ 안전한 방법

### 1. .gitignore 확인

```bash
# .gitignore에 다음이 포함되어 있는지 확인
.env*.local
.env
```

### 2. 환경 변수 검증

코드에서 환경 변수가 없을 때 에러를 표시하도록 작성되어 있습니다:

```typescript
if (!speechKey || !speechRegion) {
  return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
}
```

### 3. 배포 전 확인

```bash
# 로컬에서 빌드 테스트
npm run build

# 환경 변수 없이 빌드하면 에러가 나야 정상
```

## 🔍 키가 유출된 경우

만약 실수로 키를 Git에 커밋했다면:

1. **즉시 키 교체**
   - Azure Portal에서 새 키 생성
   - 기존 키 삭제 또는 비활성화

2. **Git 히스토리에서 제거** (고급)
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **새 저장소 생성** (가장 안전)
   - 새 저장소에 코드 업로드
   - 모든 키 교체

## 📋 체크리스트

배포 전 확인사항:

- [ ] `.env.local` 파일이 `.gitignore`에 포함됨
- [ ] `.env` 관련 파일이 Git에 커밋되지 않음
- [ ] 코드에 하드코딩된 키가 없음
- [ ] 배포 플랫폼에 모든 환경 변수가 설정됨
- [ ] 로컬에서 빌드가 성공함
- [ ] 배포 후 앱이 정상 작동함

## 💡 추가 팁

### 환경 변수 템플릿

`.env.example` 파일을 만들어서 (키 없이) 커밋할 수 있습니다:

```env
# .env.example
SPEECH_KEY=your_azure_speech_key_here
SPEECH_REGION=your_azure_speech_region
AZURE_OPENAI_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_DEPLOYMENT=your_azure_openai_deployment
```

이렇게 하면 다른 개발자가 어떤 환경 변수가 필요한지 알 수 있습니다.

