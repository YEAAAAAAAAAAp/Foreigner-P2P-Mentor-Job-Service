# 배포 가이드 (Deployment Guide)

## 🚀 GitHub Pages 배포

### 1. 저장소 생성 및 설정

1. GitHub에서 새 저장소 생성: `mentormatch-korea/landing-page`
2. 저장소를 로컬로 클론:
   ```bash
   git clone https://github.com/mentormatch-korea/landing-page.git
   cd landing-page
   ```

### 2. 파일 업로드

1. 모든 프로젝트 파일을 저장소에 복사
2. 변경사항 커밋 및 푸시:
   ```bash
   git add .
   git commit -m "Initial commit: Landing page for MentorMatch Korea"
   git push origin main
   ```

### 3. GitHub Pages 활성화

1. GitHub 저장소 페이지로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션에서 **Deploy from a branch** 선택
5. **Branch**를 `main`으로 설정
6. **Folder**를 `/ (root)`로 설정
7. **Save** 클릭

### 4. 자동 배포 설정

GitHub Actions를 사용한 자동 배포가 이미 설정되어 있습니다:

- `main` 브랜치에 푸시할 때마다 자동으로 GitHub Pages에 배포
- 워크플로우 파일: `.github/workflows/deploy.yml`

### 5. 커스텀 도메인 설정 (선택사항)

1. 도메인을 구매한 후 DNS 설정
2. `CNAME` 파일에 도메인 추가: `mentormatch-korea.com`
3. GitHub Pages 설정에서 **Custom domain** 입력

## 🔧 로컬 개발 환경

### 필수 요구사항
- Node.js 18+ 
- npm 또는 yarn

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 로컬 서버 실행 (포트 3000)
npm start

# 미리보기 서버 실행 (포트 8080)
npm run preview
```

## 📊 배포 후 확인사항

### 1. 기능 테스트
- [ ] 언어 전환 (한국어/영어)
- [ ] 서비스 선택 (멘토링/일자리)
- [ ] 이메일 사전예약 모달
- [ ] FAQ 탭 전환
- [ ] 반응형 디자인

### 2. 성능 확인
- [ ] 페이지 로딩 속도
- [ ] 이미지 최적화
- [ ] 모바일 최적화

### 3. 분석 도구 연동
- [ ] Google Analytics 설정
- [ ] 이벤트 트래킹 확인
- [ ] A/B 테스트 데이터 수집

## 🛠️ 문제 해결

### 일반적인 문제들

1. **GitHub Pages가 업데이트되지 않음**
   - GitHub Actions 로그 확인
   - 캐시 클리어 후 재배포

2. **이미지가 표시되지 않음**
   - 이미지 경로 확인
   - 파일명 대소문자 확인

3. **JavaScript 오류**
   - 브라우저 콘솔에서 오류 확인
   - 파일 경로 및 문법 검사

### 지원 및 문의
- 이슈 등록: [GitHub Issues](https://github.com/mentormatch-korea/landing-page/issues)
- 이메일: support@mentormatch-korea.com

## 📈 성과 측정

### 주요 지표
- **이메일 사전예약률**: 목표 5% 이상
- **페이지 체류시간**: 목표 2분 이상
- **서비스 선택률**: 멘토링 vs 일자리
- **A/B 테스트 결과**: 헤드라인 및 CTA 최적화

### 분석 도구
- Google Analytics 4
- Google Tag Manager
- Hotjar (사용자 행동 분석)
- Mixpanel (이벤트 트래킹)
