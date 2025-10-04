# GA4 CTA 트래킹 가이드

## 📊 구현된 고급 CTA 트래킹 시스템

### 🎯 주요 기능

1. **CTA 정의 및 우선순위 시스템**
   - 각 CTA별 비즈니스 가치 및 우선순위 설정
   - 7개 핵심 CTA 추적 (hero-cta, mentor-cta, job-cta 등)

2. **전환 퍼널 분석**
   - page_view → cta_click → modal_open → form_start → form_submit
   - 각 단계별 전환율 측정

3. **Enhanced Ecommerce 이벤트**
   - 모든 CTA 클릭을 가치 기반으로 측정
   - 전환 완료시 purchase 이벤트 발송

4. **A/B 테스트 통합**
   - 변형별 CTA 성과 비교
   - 실시간 성과 분석

### 🔧 GA4 이벤트 구조

#### 핵심 이벤트들:
- `cta_click`: CTA 클릭 추적
- `cta_hover`: CTA 호버 인터랙션
- `modal_open`: 모달 오픈 (전환 퍼널)
- `lead_capture_start`: 이메일 모달 오픈
- `conversion`: 최종 전환 완료
- `ab_test_interaction`: A/B 테스트 성과

#### 매개변수들:
- `cta_id`: CTA 식별자
- `cta_name`: CTA 이름
- `cta_type`: primary/secondary/service/tool
- `cta_goal`: 비즈니스 목표
- `cta_value`: 비즈니스 가치 (KRW)
- `ab_test_variant`: A/B 테스트 변형
- `session_id`: 세션 추적
- `funnel_step`: 전환 퍼널 단계

### 📈 사용 방법

#### 개발자 콘솔에서 테스트:
```javascript
// CTA 성과 리포트 조회
window.getCTAPerformanceReport()

// 최적화 권장사항 조회
window.getCTAOptimizationRecommendations()

// 특정 CTA 테스트
window.testCTATracking('hero-cta')

// 완전한 사용자 여정 시뮬레이션
window.simulateUserJourney()

// A/B 테스트 결과 분석
window.analyzeABTestResults()

// 히트맵 데이터 조회
window.getCTAHeatmapData()
```

### 🎨 GA4 대시보드 설정

#### 권장 커스텀 이벤트:
1. **CTA 클릭율 분석**
   - 이벤트: cta_click
   - 차원: cta_name, cta_type, ab_test_variant
   - 측정항목: 이벤트 수, 고유 이벤트 수

2. **전환 퍼널 분석**
   - 이벤트: page_view → cta_click → modal_open → conversion
   - 측정항목: 각 단계별 전환율

3. **A/B 테스트 성과**
   - 이벤트: ab_test_interaction
   - 차원: ab_test_variant
   - 측정항목: 클릭율, 전환율

### 🚀 최적화 알고리즘

시스템이 자동으로 분석하는 항목들:
- CTA 클릭율이 5% 미만인 고우선순위 CTA 식별
- 전환 퍼널에서 이탈률이 높은 지점 파악
- A/B 테스트 변형별 성과 비교
- 사용자 행동 패턴 기반 개선점 제안

### 📊 비즈니스 인사이트

1. **CTA 가치 측정**: 각 CTA의 비즈니스 가치를 KRW로 환산
2. **ROI 계산**: 마케팅 비용 대비 CTA 성과 측정
3. **사용자 여정 최적화**: 전환까지의 경로 분석
4. **개인화 기회**: 사용자 행동에 따른 맞춤형 CTA 제안

### 🔒 개인정보 보호

- 이메일은 해시화하여 저장
- 세션 기반 익명 추적
- GDPR 준수 설계
- 사용자 동의 기반 트래킹