# MentorMatch Korea - Foreign Mentor & Safe Part-time Job Matching Landing Page

A landing page for demand validation of professional mentoring services and legal, safe part-time job matching platform for international students and expats in Korea.

🌐 **Live Demo**: [https://yeaaaaaaaaap.github.io/Foreigner-P2P-Mentor-Job-Service/](https://yeaaaaaaaaap.github.io/Foreigner-P2P-Mentor-Job-Service/)

## 🚀 주요 기능

### 🌍 다국어 지원
- **기본 언어**: English (영어 우선)
- 한국어/영어 완전 지원
- 언어 선택 시 실시간 전환
- 브라우저 언어 설정 자동 감지

### 🎯 수요 검증을 위한 핵심 섹션
- **히어로 섹션**: 강력한 가치 제안과 명확한 CTA
- **서비스 구분**: 멘토링 지원 vs 일자리 지원 명확한 분리
- **이메일 사전예약**: 고급 모달을 통한 리드 캡처
- **합법성 체크 위저드**: 페이크도어 CTA로 관심도 측정
- **검증 공고**: 안전한 일자리 미리보기 (페이크도어)
- **FAQ 탭**: 멘토링/일자리별 질문 분리

### 📊 고급 이벤트 트래킹 & 분석
- 모든 클릭 이벤트 추적
- 이메일 사전예약 완료율 측정
- 서비스별 선택률 분석
- 페이지 체류 시간 분석
- 섹션별 조회수 추적
- 언어별 사용자 행동 분석
- A/B 테스트 성과 측정

### 🧪 A/B 테스트 기능
- 히어로 헤드라인 변형 (A: 기본, B: 대안)
- CTA 버튼 텍스트 변형
- 50:50 랜덤 분할 테스트
- 변형별 성과 측정

### 🎨 고급 UI/UX 디자인
- **글래스모피즘 효과**: 현대적인 반투명 디자인
- **고급 애니메이션**: 스크롤 기반 페이드인 효과
- **그라데이션 디자인**: 브랜드 일관성 있는 색상
- **반응형 디자인**: 모든 디바이스 최적화
- **인터랙티브 요소**: 호버 효과 및 마이크로 애니메이션

## 📁 파일 구조

```
├── index.html          # 메인 HTML 파일
├── styles.css          # CSS 스타일시트
├── script.js           # JavaScript 기능
└── README.md           # 프로젝트 설명서
```

## 🛠️ 설치 및 실행

### 로컬 개발
```bash
# 저장소 클론
git clone https://github.com/yeaaaaaaaaaap/Foreigner-P2P-Mentor-Job-Service.git
cd Foreigner-P2P-Mentor-Job-Service

# 의존성 설치
npm install

# 로컬 서버 실행
npm start
```

### GitHub Pages 배포
```bash
# GitHub Pages에 배포
npm run deploy
```

### 수동 배포
1. 파일들을 웹 서버에 업로드
2. `index.html`을 브라우저에서 열기
3. 개발자 도구 콘솔에서 트래킹 데이터 확인 가능

## 📊 트래킹 데이터 확인

브라우저 개발자 도구 콘솔에서 다음 명령어 사용:

```javascript
// 전체 트래킹 데이터 확인
getTrackingData()

// 트래킹 데이터 초기화
clearTrackingData()
```

## 🎯 수요 검증 지표

### 주요 KPI
- **이메일 캡처율**: 폼 제출 완료율
- **CTA 클릭률**: 각 버튼별 클릭률
- **페이지 체류시간**: 사용자 관심도 측정
- **섹션별 조회수**: 관심 있는 서비스 파악
- **A/B 테스트 결과**: 최적화된 메시지 확인

### 측정 가능한 이벤트
- `page_view`: 페이지 방문
- `language_change`: 언어 전환
- `ab_test_start`: A/B 테스트 시작
- `click`: 일반 클릭 이벤트
- `hero_cta_click`: 히어로 CTA 클릭
- `legality_check_click`: 합법성 체크 클릭
- `wizard_cta_click`: 위저드 CTA 클릭
- `jobs_cta_click`: 일자리 보기 클릭
- `form_submission`: 폼 제출
- `faq_open`: FAQ 열기
- `section_view`: 섹션 조회
- `modal_show`: 모달 표시
- `page_exit`: 페이지 이탈

## 🎨 디자인 특징

### 색상 팔레트
- Primary: #007bff (파란색)
- Secondary: #28a745 (초록색)
- Accent: #ffd700 (금색)
- Background: #f8f9fa (연한 회색)

### 폰트
- 한국어: Noto Sans KR
- 영어: Inter
- 아이콘: Font Awesome 6

### 애니메이션
- 스크롤 기반 페이드인 효과
- 호버 시 카드 리프트 효과
- 부드러운 전환 애니메이션

## 📱 반응형 브레이크포인트

- **데스크톱**: 1200px 이상
- **태블릿**: 768px - 1199px
- **모바일**: 767px 이하

## ⚠️ 면책 조항

본 서비스는 법률 자문 서비스가 아닙니다. 제공되는 정보는 일반적인 안내 목적이며, 구체적인 법적 문제에 대해서는 반드시 자격을 갖춘 법률 전문가와 상담하시기 바랍니다.

## 🔧 커스터마이징

### A/B 테스트 변형 추가
`script.js`의 `initializeABTest()` 함수에서 새로운 변형 추가 가능

### 이벤트 트래킹 추가
`trackEvent()` 함수를 사용하여 새로운 이벤트 추적 가능

### 언어 추가
HTML의 `data-ko`, `data-en` 속성과 JavaScript의 언어 처리 로직 수정

## 📈 성과 측정 가이드

1. **이메일 캡처율**: 5% 이상 목표
2. **CTA 클릭률**: 2% 이상 목표
3. **페이지 체류시간**: 2분 이상 목표
4. **A/B 테스트**: 통계적 유의성 확인 후 승자 선택

## 🚀 다음 단계

1. 실제 백엔드 API 연동
2. 이메일 마케팅 자동화 설정
3. 고급 분석 도구 연동 (Google Analytics, Mixpanel 등)
4. 실제 멘토링 및 일자리 매칭 서비스 개발

---

**개발자**: AI Assistant  
**버전**: 1.0.0  
**최종 업데이트**: 2024년
