# Google Analytics 4 CTA 추적 가이드

## 개요
이 문서는 MentorMatch Korea 랜딩페이지에서 CTA(Call-to-Action) 버튼과 사용자 행동을 추적하기 위한 Google Analytics 4 설정 가이드입니다.

## 설정된 이벤트

### 1. 페이지 조회 이벤트
- **이벤트명**: `page_view`
- **자동 트리거**: 페이지 로드 시
- **추가 매개변수**:
  - `page_title`: "MentorMatch Korea - Landing Page"
  - `page_location`: 현재 URL
  - `user_type`: 사용자 유형 (custom dimension)

### 2. CTA 클릭 이벤트
- **이벤트명**: `cta_click`
- **트리거**: CTA 버튼 클릭 시
- **매개변수**:
  - `button_text`: 버튼 텍스트
  - `button_location`: 버튼 위치
  - `button_type`: 버튼 유형 (primary/secondary)

### 3. 서비스 선택 이벤트
- **이벤트명**: `service_selection`
- **트리거**: 서비스 버튼 클릭 시
- **매개변수**:
  - `service_type`: 선택된 서비스 유형
  - `language`: 현재 언어 설정

### 4. 언어 변경 이벤트
- **이벤트명**: `language_change`
- **트리거**: 언어 버튼 클릭 시
- **매개변수**:
  - `previous_language`: 이전 언어
  - `new_language`: 새로운 언어

### 5. 모달 열기 이벤트
- **이벤트명**: `modal_open`
- **트리거**: 모달 창 열기 시
- **매개변수**:
  - `modal_type`: 모달 유형
  - `trigger_element`: 트리거한 요소

## GA4 Property 정보
- **Measurement ID**: G-NGW6S380X9
- **GTM ID**: GTM-PCJJCHFR

## 구현된 추적 기능

### 1. 전환 퍼널 추적
```javascript
conversionFunnel: {
    page_view: 0,     // 페이지 조회
    cta_click: 0,     // CTA 클릭
    modal_open: 0,    // 모달 열기
    form_start: 0,    // 폼 시작
    form_submit: 0    // 폼 제출
}
```

### 2. 히트맵 데이터 수집
- 클릭 위치 추적
- 스크롤 깊이 측정
- 체류 시간 기록

### 3. A/B 테스트 지원
- 다양한 CTA 문구 테스트
- 색상 및 위치 변형 테스트
- 성과 비교 분석

## 대시보드 설정 권장사항

### 1. 주요 KPI
- 페이지 조회수
- CTA 클릭률
- 전환율
- 평균 체류 시간

### 2. 사용자 세그먼트
- 언어별 사용자
- 트래픽 소스별
- 디바이스별 행동 패턴

### 3. 목표 설정
- 목표 1: CTA 클릭 (마이크로 전환)
- 목표 2: 모달 열기 (중간 전환)
- 목표 3: 폼 제출 (최종 전환)

## 데이터 분석 포인트

### 1. 주요 질문
- 어떤 CTA가 가장 효과적인가?
- 언어별 전환율 차이는?
- 모바일 vs 데스크톱 성과는?

### 2. 개선 방향
- 저성과 CTA 개선
- 사용자 경험 최적화
- 전환 장벽 제거

## 정기 리포트 권장사항
- **일간**: 트래픽 및 전환 모니터링
- **주간**: 트렌드 분석 및 성과 리뷰
- **월간**: 종합 성과 분석 및 최적화 계획