# Google Analytics 4 CTA 추적 가이드

## 설정된 이벤트 목록

### 1. 페이지 성능 추적
- `page_load_time`: 페이지 로딩 시간
- `page_view`: 페이지 뷰 (자동)

### 2. CTA 버튼 추적
- `cta_click`: CTA 버튼 클릭
  - button_name: 버튼 이름
  - button_type: primary/secondary
  - language: 사용자 언어
  - page_section: 버튼 위치

### 3. 폼 제출 추적
- `form_submit`: 폼 제출
  - form_type: mentoring/jobs
  - language: 사용자 언어
  - email_domain: 이메일 도메인

### 4. 사용자 상호작용
- `language_change`: 언어 변경
- `modal_open`: 모달 창 열기
- `scroll_depth`: 스크롤 깊이 (25%, 50%, 75%, 100%)

### 5. 에러 추적
- `exception`: JavaScript 에러
  - description: 에러 설명
  - fatal: 치명적 여부

## GA4 대시보드에서 확인할 메트릭

1. **전환율**
   - 페이지 뷰 대비 폼 제출률
   - CTA 클릭 대비 폼 제출률

2. **사용자 행동**
   - 언어별 사용자 분포
   - 스크롤 깊이 분석
   - 페이지 체류 시간

3. **성능 메트릭**
   - 페이지 로딩 시간
   - JavaScript 에러율

## 커스텀 이벤트 예시

```javascript
// 멘토링 신청 완료
gtag('event', 'conversion', {
  event_category: 'mentoring',
  event_label: 'application_complete',
  value: 1,
  language: currentLanguage
});

// 일자리 관심 표시
gtag('event', 'engagement', {
  event_category: 'jobs',
  event_label: 'interest_shown',
  language: currentLanguage
});
```

## 업데이트 내역
- 2025-10-05: 초기 설정 및 CTA 추적 구현
- GA4 Tracking ID: G-NGW6S380X9