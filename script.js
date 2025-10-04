// GitHub Pages base href 설정 (배포 환경에서만)
if (window.location.hostname === 'yeaaaaaaaaaap.github.io') {
    const baseElement = document.createElement('base');
    baseElement.href = '/Foreigner-P2P-Mentor-Job-Service/';
    document.head.insertBefore(baseElement, document.head.firstChild);
}

// 전역 변수와 에러 처리
let currentLanguage = 'en';
let abTestVariant = null;
let sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
let ctaInteractions = [];
let heatmapData = [];
let trackingData = {
    pageViews: 0,
    clicks: {},
    formSubmissions: 0,
    timeOnPage: 0,
    startTime: Date.now(),
    ctaClicks: {},
    conversionFunnel: {
        page_view: 0,
        cta_click: 0,
        modal_open: 0,
        form_start: 0,
        form_submit: 0
    }
};

// 전역 에러 처리
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    // 에러 추적 (실제 운영 환경에서는 에러 로깅 서비스로 전송)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error?.message || 'Unknown error',
            fatal: false
        });
    }
});

// Promise rejection 처리
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: 'Promise rejection: ' + (event.reason?.message || 'Unknown'),
            fatal: false
        });
    }
});

// 유틸리티 함수들
const utils = {
    // 안전한 요소 선택
    safeQuerySelector: function(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn('Invalid selector:', selector, error);
            return null;
        }
    },
    
    // 안전한 이벤트 리스너 추가
    safeAddEventListener: function(element, event, handler, options = {}) {
        if (!element || typeof handler !== 'function') {
            console.warn('Invalid element or handler for event listener');
            return false;
        }
        
        try {
            element.addEventListener(event, handler, options);
            return true;
        } catch (error) {
            console.error('Error adding event listener:', error);
            return false;
        }
    },
    
    // 디바운스 함수
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },
    
    // 쓰로틀 함수
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// CTA 정의 및 우선순위
const CTA_DEFINITIONS = {
    // Primary CTAs (최우선 전환 목표)
    'hero-cta': {
        name: 'Hero Main CTA',
        type: 'primary',
        goal: 'lead_generation',
        position: 'hero',
        priority: 1,
        value: 100
    },
    'hero-secondary-cta': {
        name: 'Hero Secondary CTA',
        type: 'secondary',
        goal: 'legality_check',
        position: 'hero',
        priority: 2,
        value: 50
    },
    
    // Service CTAs
    'mentor-cta': {
        name: 'Mentor Service CTA',
        type: 'service',
        goal: 'mentor_signup',
        position: 'services',
        priority: 3,
        value: 80
    },
    'job-cta': {
        name: 'Job Service CTA',
        type: 'service',
        goal: 'job_signup',
        position: 'services',
        priority: 3,
        value: 80
    },
    
    // Modal CTAs
    'legality-check': {
        name: 'Legality Check',
        type: 'tool',
        goal: 'tool_usage',
        position: 'hero',
        priority: 4,
        value: 30
    },
    'wizard-cta': {
        name: 'Wizard Start',
        type: 'tool',
        goal: 'wizard_complete',
        position: 'job-section',
        priority: 5,
        value: 40
    },
    'jobs-cta': {
        name: 'View Jobs',
        type: 'browse',
        goal: 'job_browse',
        position: 'job-section',
        priority: 6,
        value: 20
    },
    
    // Navigation CTAs
    'nav-cta': {
        name: 'Navigation CTA',
        type: 'primary',
        goal: 'lead_generation',
        position: 'navigation',
        priority: 2,
        value: 90
    }
};

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
        setupPerformanceMonitoring();
        setupAccessibilityFeatures();
    } catch (error) {
        console.error('Error during app initialization:', error);
        // 기본 기능만이라도 동작하도록 fallback
        setupBasicFeatures();
    }
});

// 성능 모니터링 설정
function setupPerformanceMonitoring() {
    if ('performance' in window) {
        // 페이지 로드 시간 측정
        window.addEventListener('load', utils.debounce(function() {
            const loadTime = performance.now();
            console.log('Page load time:', loadTime + 'ms');
            
            // GA4에 성능 데이터 전송
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    event_category: 'performance',
                    value: Math.round(loadTime)
                });
            }
            
            // Core Web Vitals 측정
            measureCoreWebVitals();
        }, 100));
    }
}

// Core Web Vitals 측정
function measureCoreWebVitals() {
    if ('web-vital' in window) {
        // 이미 라이브러리가 로드된 경우
        return;
    }
    
    // LCP (Largest Contentful Paint) 측정
    if ('PerformanceObserver' in window) {
        try {
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'lcp', {
                        event_category: 'web_vitals',
                        value: Math.round(lastEntry.startTime)
                    });
                }
            });
            
            lcpObserver.observe({entryTypes: ['largest-contentful-paint']});
        } catch (error) {
            console.warn('LCP measurement not supported:', error);
        }
    }
}

// 접근성 기능 설정
function setupAccessibilityFeatures() {
    // 키보드 네비게이션 지원
    setupKeyboardNavigation();
    
    // 포커스 트랩 설정
    setupFocusTraps();
    
    // 스크린 리더 지원
    setupScreenReaderSupport();
}

// 키보드 네비게이션 설정
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // ESC 키로 모달 닫기
        if (e.key === 'Escape') {
            const openModal = utils.safeQuerySelector('.modal.active');
            if (openModal) {
                closeModal(openModal);
            }
        }
        
        // Tab 키 순환 네비게이션
        if (e.key === 'Tab') {
            handleTabNavigation(e);
        }
    });
}

// 기본 기능 설정 (fallback)
function setupBasicFeatures() {
    // 기본적인 언어 전환 기능
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        utils.safeAddEventListener(btn, 'click', function() {
            const lang = this.getAttribute('data-lang');
            if (lang) {
                switchLanguage(lang);
            }
        });
    });
    
    // 기본적인 CTA 버튼 기능
    const ctaButtons = document.querySelectorAll('.cta-btn');
    ctaButtons.forEach(btn => {
        utils.safeAddEventListener(btn, 'click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action') || 'contact';
            handleBasicCTA(action);
        });
    });
}

// 앱 초기화
function initializeApp() {
    try {
        initializeLanguage();
        initializeABTest();
        initializeServiceSelector();
        initializeEventTracking();
        initializeCTATracking(); // CTA 전용 트래킹 추가
        initializeFAQ();
        initializeFAQTabs();
        initializeScrollAnimations();
        initializeFormHandling();
        initializeModal();
        initializeMobileMenu();
        
        // 페이지 뷰 트래킹 (전환 퍼널 시작)
        trackEvent('page_view', { 
            page: 'landing',
            category: 'page_view',
            label: 'landing_page_load'
        });
        
        // 전환 퍼널 시작점 기록
        trackingData.conversionFunnel.page_view++;
        
        // 시간 추적 시작
        startTimeTracking();
        
        console.log('MentorMatch Korea app initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        // 기본 기능은 계속 작동하도록 함
    }
}

// ===== CTA 전용 고급 트래킹 시스템 =====

// CTA 트래킹 초기화
function initializeCTATracking() {
    // 모든 CTA 버튼에 고급 트래킹 설정
    Object.keys(CTA_DEFINITIONS).forEach(ctaId => {
        const element = document.getElementById(ctaId);
        if (element) {
            setupCTATracking(element, ctaId);
        }
    });
    
    // 클래스 기반 CTA 버튼들도 추가
    const ctaButtons = document.querySelectorAll('.cta-btn');
    ctaButtons.forEach((button, index) => {
        const ctaId = button.id || `cta-${index}`;
        if (!CTA_DEFINITIONS[ctaId]) {
            // 동적 CTA 정의 생성
            CTA_DEFINITIONS[ctaId] = {
                name: button.textContent.trim() || `CTA ${index + 1}`,
                type: button.classList.contains('primary') ? 'primary' : 'secondary',
                goal: 'general_cta',
                position: getElementPosition(button),
                priority: 10,
                value: button.classList.contains('primary') ? 70 : 40
            };
        }
        setupCTATracking(button, ctaId);
    });
    
    console.log('CTA Tracking initialized for', Object.keys(CTA_DEFINITIONS).length, 'CTAs');
}

// CTA 개별 트래킹 설정
function setupCTATracking(element, ctaId) {
    if (!element || !ctaId) return;
    
    const ctaConfig = CTA_DEFINITIONS[ctaId];
    
    // 마우스 이벤트 트래킹
    element.addEventListener('mouseenter', () => {
        trackCTAInteraction(ctaId, 'hover', {
            timestamp: Date.now(),
            position: getElementPosition(element)
        });
    });
    
    element.addEventListener('mouseleave', () => {
        trackCTAInteraction(ctaId, 'hover_end');
    });
    
    // 클릭 이벤트 트래킹 (기존 클릭 리스너보다 먼저 실행)
    element.addEventListener('click', (e) => {
        const clickData = {
            timestamp: Date.now(),
            position: getElementPosition(element),
            scrollPosition: window.pageYOffset,
            viewportSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            mousePosition: {
                x: e.clientX,
                y: e.clientY
            },
            ctaText: element.textContent.trim(),
            ctaConfig: ctaConfig
        };
        
        trackCTAClick(ctaId, clickData);
    }, true); // Capture phase로 실행
    
    // Impression 트래킹 (뷰포트에 들어올 때)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                trackCTAInteraction(ctaId, 'impression', {
                    visibility: entry.intersectionRatio,
                    boundingRect: entry.boundingClientRect
                });
            }
        });
    }, { threshold: [0.1, 0.5, 0.9] });
    
    observer.observe(element);
}

// CTA 클릭 전용 트래킹
function trackCTAClick(ctaId, clickData) {
    const ctaConfig = CTA_DEFINITIONS[ctaId] || {};
    
    // 전환 퍼널 업데이트
    trackingData.conversionFunnel.cta_click++;
    trackingData.ctaClicks[ctaId] = (trackingData.ctaClicks[ctaId] || 0) + 1;
    
    // GA4 Enhanced E-commerce 이벤트
    const eventData = {
        event_name: 'cta_click',
        event_category: 'cta_engagement',
        event_label: ctaConfig.name || ctaId,
        
        // Custom Parameters
        cta_id: ctaId,
        cta_name: ctaConfig.name,
        cta_type: ctaConfig.type,
        cta_goal: ctaConfig.goal,
        cta_position: ctaConfig.position,
        cta_priority: ctaConfig.priority,
        cta_value: ctaConfig.value,
        
        // User Context
        language: currentLanguage,
        ab_test_variant: abTestVariant,
        session_id: sessionId,
        
        // Interaction Context
        time_on_page: Date.now() - trackingData.startTime,
        scroll_depth: Math.round((window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100),
        click_position_x: clickData.mousePosition?.x,
        click_position_y: clickData.mousePosition?.y,
        viewport_width: clickData.viewportSize?.width,
        viewport_height: clickData.viewportSize?.height,
        
        // Business Metrics
        value: ctaConfig.value || 1,
        currency: 'KRW'
    };
    
    // GA4 이벤트 전송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', {
            event_category: 'cta_engagement',
            event_label: ctaConfig.name || ctaId,
            value: ctaConfig.value || 1,
            custom_parameters: eventData
        });
        
        // Enhanced Ecommerce 전환 이벤트
        gtag('event', 'conversion', {
            send_to: 'G-NGW6S380X9',
            value: ctaConfig.value || 1,
            currency: 'KRW',
            transaction_id: sessionId + '_' + ctaId + '_' + Date.now()
        });
    }
    
    // CTA 인터랙션 히스토리 저장
    ctaInteractions.push({
        ctaId: ctaId,
        action: 'click',
        timestamp: Date.now(),
        data: clickData,
        config: ctaConfig
    });
    
    // 히트맵 데이터 수집
    heatmapData.push({
        x: clickData.mousePosition?.x,
        y: clickData.mousePosition?.y,
        element: ctaId,
        timestamp: Date.now(),
        value: ctaConfig.value
    });
    
    console.log('CTA Click Tracked:', ctaId, eventData);
}

// CTA 인터랙션 트래킹 (호버, 스크롤 등)
function trackCTAInteraction(ctaId, action, data = {}) {
    const ctaConfig = CTA_DEFINITIONS[ctaId] || {};
    
    const eventData = {
        event_name: `cta_${action}`,
        event_category: 'cta_interaction',
        event_label: `${ctaConfig.name || ctaId}_${action}`,
        
        cta_id: ctaId,
        cta_name: ctaConfig.name,
        interaction_type: action,
        language: currentLanguage,
        ab_test_variant: abTestVariant,
        session_id: sessionId,
        ...data
    };
    
    // GA4 이벤트 전송
    if (typeof gtag !== 'undefined') {
        gtag('event', `cta_${action}`, {
            event_category: 'cta_interaction',
            event_label: eventData.event_label,
            custom_parameters: eventData
        });
    }
    
    // 로컬 데이터 저장
    ctaInteractions.push({
        ctaId: ctaId,
        action: action,
        timestamp: Date.now(),
        data: data
    });
}

// 요소의 페이지 내 위치 계산
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 페이지의 어느 섹션에 있는지 판단
    const sections = ['hero', 'services', 'mentor-support', 'job-support', 'faq'];
    let position = 'unknown';
    
    for (const sectionName of sections) {
        const section = document.getElementById(sectionName);
        if (section) {
            const sectionRect = section.getBoundingClientRect();
            const sectionTop = sectionRect.top + scrollTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const elementTop = rect.top + scrollTop;
            
            if (elementTop >= sectionTop && elementTop <= sectionBottom) {
                position = sectionName;
                break;
            }
        }
    }
    
    return position;
}

// ===== CTA 전환 분석 및 최적화 함수들 =====

// CTA 전환 완료 트래킹
function trackCTAConversion(conversionType, data = {}) {
    const conversionValue = data.conversionValue || 100;
    
    const conversionData = {
        event_name: 'cta_conversion',
        event_category: 'conversion',
        event_label: `conversion_${conversionType}`,
        
        // Conversion Details
        conversion_type: conversionType,
        conversion_value: conversionValue,
        currency: 'KRW',
        
        // User Journey Analysis
        session_id: sessionId,
        language: currentLanguage,
        ab_test_variant: abTestVariant,
        
        // CTA Performance Metrics
        total_cta_clicks: Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0),
        cta_interactions_before_conversion: ctaInteractions.length,
        time_to_conversion: Date.now() - trackingData.startTime,
        
        // Funnel Analysis
        funnel_page_view: trackingData.conversionFunnel.page_view,
        funnel_cta_click: trackingData.conversionFunnel.cta_click,
        funnel_modal_open: trackingData.conversionFunnel.modal_open,
        funnel_form_start: trackingData.conversionFunnel.form_start,
        
        ...data
    };
    
    // GA4 전환 이벤트
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
            transaction_id: sessionId + '_conversion_' + Date.now(),
            value: conversionValue,
            currency: 'KRW',
            items: [{
                item_id: conversionType,
                item_name: `CTA Conversion - ${conversionType}`,
                category: 'cta_conversion',
                quantity: 1,
                price: conversionValue
            }]
        });
    }
    
    console.log('CTA Conversion Tracked:', conversionData);
}

// A/B 테스트 성과 분석
function trackABTestPerformance(ctaId, action = 'click') {
    if (!abTestVariant) return;
    
    const performanceData = {
        event_name: 'ab_test_performance',
        event_category: 'ab_testing',
        event_label: `${abTestVariant}_${ctaId}_${action}`,
        
        // A/B Test Details
        ab_test_variant: abTestVariant,
        ab_test_name: 'hero_cta_optimization',
        cta_id: ctaId,
        action: action,
        
        // Performance Context
        session_id: sessionId,
        language: currentLanguage,
        timestamp: Date.now(),
        
        // User Behavior
        time_on_page: Date.now() - trackingData.startTime,
        scroll_depth: Math.round((window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100),
        
        // CTA Context
        cta_config: CTA_DEFINITIONS[ctaId] || {}
    };
    
    // GA4 A/B 테스트 이벤트
    if (typeof gtag !== 'undefined') {
        gtag('event', 'ab_test_interaction', {
            event_category: 'ab_testing',
            event_label: performanceData.event_label,
            custom_parameters: performanceData
        });
    }
    
    console.log('A/B Test Performance:', performanceData);
}

// CTA 성과 분석 리포트 생성
function generateCTAPerformanceReport() {
    const report = {
        session_summary: {
            session_id: sessionId,
            duration: Date.now() - trackingData.startTime,
            language: currentLanguage,
            ab_variant: abTestVariant,
            timestamp: new Date().toISOString()
        },
        
        cta_performance: {},
        conversion_funnel: { ...trackingData.conversionFunnel },
        interaction_timeline: [...ctaInteractions],
        heatmap_data: [...heatmapData],
        
        metrics: {
            total_cta_clicks: Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0),
            unique_ctas_clicked: Object.keys(trackingData.ctaClicks).length,
            conversion_rate: trackingData.conversionFunnel.form_submit / trackingData.conversionFunnel.page_view,
            cta_to_conversion_rate: trackingData.conversionFunnel.form_submit / trackingData.conversionFunnel.cta_click,
            average_time_to_first_cta: ctaInteractions.length > 0 ? ctaInteractions[0].timestamp - trackingData.startTime : 0
        }
    };
    
    // 각 CTA별 성과 계산
    Object.keys(CTA_DEFINITIONS).forEach(ctaId => {
        const ctaClicks = trackingData.ctaClicks[ctaId] || 0;
        const ctaInteractions = ctaInteractions.filter(i => i.ctaId === ctaId);
        
        report.cta_performance[ctaId] = {
            clicks: ctaClicks,
            interactions: ctaInteractions.length,
            click_rate: ctaClicks / trackingData.conversionFunnel.page_view,
            config: CTA_DEFINITIONS[ctaId],
            first_interaction: ctaInteractions.length > 0 ? ctaInteractions[0].timestamp : null,
            interaction_types: ctaInteractions.reduce((acc, i) => {
                acc[i.action] = (acc[i.action] || 0) + 1;
                return acc;
            }, {})
        };
    });
    
    return report;
}

// 실시간 CTA 최적화 권장사항
function getCTAOptimizationRecommendations() {
    const report = generateCTAPerformanceReport();
    const recommendations = [];
    
    // 낮은 성과 CTA 식별
    Object.entries(report.cta_performance).forEach(([ctaId, performance]) => {
        if (performance.click_rate < 0.05 && performance.config.priority <= 3) {
            recommendations.push({
                type: 'low_performance',
                cta_id: ctaId,
                issue: 'Low click rate for high-priority CTA',
                suggestion: 'Consider changing position, text, or design',
                current_rate: performance.click_rate,
                expected_rate: 0.1
            });
        }
    });
    
    // 전환 퍼널 분석
    if (report.metrics.cta_to_conversion_rate < 0.2) {
        recommendations.push({
            type: 'funnel_optimization',
            issue: 'Low CTA to conversion rate',
            suggestion: 'Optimize form or reduce friction points',
            current_rate: report.metrics.cta_to_conversion_rate,
            target_rate: 0.3
        });
    }
    
    // A/B 테스트 성과 비교
    if (abTestVariant && ctaInteractions.length > 10) {
        recommendations.push({
            type: 'ab_test_insight',
            variant: abTestVariant,
            suggestion: 'Sufficient data collected for A/B test analysis',
            interactions: ctaInteractions.length
        });
    }
    
    return recommendations;
}

// 언어 초기화
function initializeLanguage() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const elements = document.querySelectorAll('[data-ko], [data-en]');
    
    // 언어 버튼 이벤트 리스너
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedLang = this.getAttribute('data-lang');
            switchLanguage(selectedLang);
        });
    });
    
    // 기본 언어 설정 (영어로 변경)
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    switchLanguage(savedLang);
}

// 언어 전환
function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // 언어 버튼 상태 업데이트
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // 텍스트 업데이트
    document.querySelectorAll('[data-ko], [data-en]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // 페이지 제목 업데이트
    if (lang === 'ko') {
        document.title = '외국인 멘토 & 안전한 단기알바 매칭 | MentorMatch Korea';
    } else {
        document.title = 'Foreign Mentor & Safe Part-time Job Matching | MentorMatch Korea';
    }
    
    // 언어 변경 이벤트 트래킹
    trackEvent('language_change', { language: lang });
}

// A/B 테스트 초기화
function initializeABTest() {
    // A/B 테스트 변형 결정 (50:50 비율)
    abTestVariant = Math.random() < 0.5 ? 'A' : 'B';
    
    // 변형에 따른 스타일 적용
    document.body.classList.add(`ab-test-variant-${abTestVariant.toLowerCase()}`);
    
    // 히어로 헤드라인 A/B 테스트
    if (abTestVariant === 'B') {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            if (currentLanguage === 'ko') {
                heroTitle.textContent = '한국에서 성공하는 외국인을 위한 특별한 기회';
            } else {
                heroTitle.textContent = 'Special Opportunities for Internationals to Succeed in Korea';
            }
        }
    }
    
    // CTA 버튼 텍스트 A/B 테스트
    const ctaButtons = document.querySelectorAll('.cta-btn.primary');
    ctaButtons.forEach(button => {
        if (abTestVariant === 'B') {
            if (currentLanguage === 'ko') {
                button.textContent = '지금 바로 시작하기';
            } else {
                button.textContent = 'Start Right Now';
            }
        }
    });
    
    // A/B 테스트 시작 이벤트 트래킹
    trackEvent('ab_test_start', { 
        variant: abTestVariant,
        test_name: 'hero_headline_cta'
    });
}

// 서비스 선택 초기화
function initializeServiceSelector() {
    const serviceButtons = document.querySelectorAll('.service-btn');
    const mentorSection = document.getElementById('mentor-support');
    const jobSection = document.getElementById('job-support');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedService = this.getAttribute('data-service');
            
            // 모든 버튼에서 active 클래스 제거
            serviceButtons.forEach(btn => btn.classList.remove('active'));
            // 클릭한 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 해당 섹션으로 스크롤
            if (selectedService === 'mentor' && mentorSection) {
                mentorSection.scrollIntoView({ behavior: 'smooth' });
            } else if (selectedService === 'job' && jobSection) {
                jobSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // 서비스 선택 이벤트 트래킹
            trackEvent('service_selection', {
                service: selectedService,
                language: currentLanguage,
                ab_variant: abTestVariant
            });
        });
    });
}

// FAQ 탭 초기화
function initializeFAQTabs() {
    const faqTabs = document.querySelectorAll('.faq-tab');
    const faqSections = document.querySelectorAll('.faq-section');
    
    faqTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            
            // 모든 탭에서 active 클래스 제거
            faqTabs.forEach(t => t.classList.remove('active'));
            // 클릭한 탭에 active 클래스 추가
            this.classList.add('active');
            
            // 모든 섹션 숨기기
            faqSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // 선택된 섹션 표시
            const targetSection = document.getElementById(`faq-${tabType}`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // FAQ 탭 전환 이벤트 트래킹
            trackEvent('faq_tab_switch', {
                tab: tabType,
                language: currentLanguage
            });
        });
    });
}

// 모바일 메뉴 초기화
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            
            // 모바일 메뉴 토글 이벤트 트래킹
            trackEvent('mobile_menu_toggle', {
                language: currentLanguage,
                action: navMenu.classList.contains('active') ? 'open' : 'close'
            });
        });
        
        // 메뉴 링크 클릭 시 모바일 메뉴 닫기
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
        
        // 외부 클릭 시 모바일 메뉴 닫기
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }
}

// 이벤트 트래킹 초기화
function initializeEventTracking() {
    // 모든 CTA 버튼에 클릭 트래킹 추가
    document.querySelectorAll('.cta-btn, .nav-link').forEach(element => {
        element.addEventListener('click', function(e) {
            const elementText = this.textContent.trim();
            const elementClass = this.className;
            
            trackEvent('click', {
                element: elementText,
                class: elementClass,
                href: this.href || null,
                ab_variant: abTestVariant
            });
        });
    });
    
    // 특별한 CTA 버튼들
    const specialCTAs = {
        'hero-cta': 'hero_cta_click',
        'legality-check': 'legality_check_click',
        'wizard-cta': 'wizard_cta_click',
        'jobs-cta': 'jobs_cta_click',
        'mentor-cta': 'mentor_cta_click'
    };
    
    Object.keys(specialCTAs).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', function() {
                trackEvent(specialCTAs[id], {
                    ab_variant: abTestVariant,
                    language: currentLanguage
                });
            });
        }
    });
}

// FAQ 초기화
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // 모든 FAQ 아이템 닫기
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // 클릭한 아이템만 열기
            if (!isActive) {
                item.classList.add('active');
                trackEvent('faq_open', {
                    question: question.querySelector('h3').textContent,
                    language: currentLanguage
                });
            }
        });
    });
}

// 스크롤 애니메이션 초기화
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 지연 애니메이션을 위한 timeout
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                
                // 섹션 뷰 트래킹
                const sectionId = entry.target.id;
                if (sectionId) {
                    trackEvent('section_view', {
                        section: sectionId,
                        language: currentLanguage
                    });
                }
            }
        });
    }, observerOptions);
    
    // 애니메이션 대상 요소들 관찰
    const animatedElements = document.querySelectorAll(`
        .feature-card, .job-card, .mentor-feature, .faq-item, 
        .service-card, .stat, .floating-card, .section-header
    `);
    
    animatedElements.forEach((el, index) => {
        // 다양한 애니메이션 클래스 적용
        if (index % 3 === 0) {
            el.classList.add('fade-in');
        } else if (index % 3 === 1) {
            el.classList.add('slide-in-left');
        } else {
            el.classList.add('slide-in-right');
        }
        
        observer.observe(el);
    });
    
    // 히어로 섹션 특별 애니메이션
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .service-selector, .hero-cta, .hero-stats');
    heroElements.forEach((el, index) => {
        el.classList.add('fade-in');
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 200);
    });
}

// 폼 처리 초기화
function initializeFormHandling() {
    const emailForm = document.getElementById('email-form');
    
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const interest = document.getElementById('interest').value;
            
            if (validateEmail(email)) {
                submitForm(email, interest);
            } else {
                showNotification('올바른 이메일 주소를 입력해주세요.', 'error');
            }
        });
    }
}

// 이메일 유효성 검사
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// 이름 유효성 검사
function validateName(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 50;
}

// 국가 유효성 검사
function validateCountry(country) {
    if (!country || typeof country !== 'string') {
        return false;
    }
    const trimmedCountry = country.trim();
    return trimmedCountry.length >= 2 && trimmedCountry.length <= 50;
}

// 폼 제출
function submitForm(email, interest) {
    // 전환 퍼널 업데이트
    trackingData.conversionFunnel.form_submit++;
    
    // CTA 전환 완료 트래킹
    trackCTAConversion(interest, {
        email: email,
        conversionValue: CTA_DEFINITIONS['hero-cta']?.value || 100
    });
    
    // 실제 구현에서는 서버로 데이터 전송
    console.log('Form submitted:', { email, interest, language: currentLanguage });
    
    // GA4 Enhanced Conversion 이벤트
    const conversionData = {
        event_name: 'form_submission',
        event_category: 'conversion',
        event_label: `form_submit_${interest}`,
        
        // Enhanced Ecommerce
        value: CTA_DEFINITIONS['hero-cta']?.value || 100,
        currency: 'KRW',
        transaction_id: sessionId + '_form_' + Date.now(),
        
        // Custom Parameters
        form_type: interest,
        email_hash: btoa(email).substr(0, 8), // 익명화된 이메일 해시
        language: currentLanguage,
        ab_test_variant: abTestVariant,
        session_id: sessionId,
        funnel_completion_time: Date.now() - trackingData.startTime,
        
        // User Journey
        total_cta_clicks: Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0),
        cta_interaction_count: ctaInteractions.length,
        page_time_before_conversion: Date.now() - trackingData.startTime
    };
    
    // GA4 이벤트 전송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'conversion', {
            send_to: 'G-NGW6S380X9',
            value: conversionData.value,
            currency: 'KRW',
            transaction_id: conversionData.transaction_id
        });
        
        gtag('event', 'form_submission', {
            event_category: 'conversion',
            event_label: conversionData.event_label,
            value: conversionData.value,
            custom_parameters: conversionData
        });
    }
    
    // 이벤트 트래킹 (기존)
    trackEvent('form_submission', {
        email: email,
        interest: interest,
        language: currentLanguage,
        ab_variant: abTestVariant
    });
    
    // 서비스별 맞춤 메시지
    let successMessage, modalTitle, modalText;
    
    if (interest === 'mentoring') {
        successMessage = currentLanguage === 'ko' 
            ? '멘토링 신청이 완료되었습니다! 곧 연락드리겠습니다.' 
            : 'Mentoring application completed! We will contact you soon.';
        modalTitle = currentLanguage === 'ko' ? '멘토링 신청 완료' : 'Mentoring Application Complete';
        modalText = currentLanguage === 'ko' 
            ? '감사합니다! 24시간 내에 멘토링 상담을 위해 이메일로 연락드리겠습니다.' 
            : 'Thank you! We will contact you via email within 24 hours for mentoring consultation.';
    } else if (interest === 'jobs') {
        successMessage = currentLanguage === 'ko' 
            ? '일자리 신청이 완료되었습니다! 곧 연락드리겠습니다.' 
            : 'Job application completed! We will contact you soon.';
        modalTitle = currentLanguage === 'ko' ? '일자리 신청 완료' : 'Job Application Complete';
        modalText = currentLanguage === 'ko' 
            ? '감사합니다! 24시간 내에 안전한 일자리 기회를 이메일로 안내드리겠습니다.' 
            : 'Thank you! We will contact you via email within 24 hours with safe job opportunities.';
    } else {
        successMessage = currentLanguage === 'ko' 
            ? '신청이 완료되었습니다! 곧 연락드리겠습니다.' 
            : 'Application completed! We will contact you soon.';
        modalTitle = currentLanguage === 'ko' ? '신청 완료' : 'Application Complete';
        modalText = currentLanguage === 'ko' 
            ? '감사합니다! 24시간 내에 이메일로 연락드리겠습니다.' 
            : 'Thank you! We will contact you via email within 24 hours.';
    }
    
    // 성공 메시지 표시
    showNotification(successMessage, 'success');
    
    // 폼 리셋
    document.getElementById('email-form').reset();
    
    // 모달 표시
    showModal(modalTitle, modalText);
}

// 모달 초기화
function initializeModal() {
    const modal = document.getElementById('modal');
    const emailModal = document.getElementById('email-modal');
    const closeBtns = document.querySelectorAll('.close');
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modalToClose = this.closest('.modal');
            if (modalToClose) {
                hideModal(modalToClose.id);
            }
        });
    });
    
    [modal, emailModal].forEach(modalElement => {
        if (modalElement) {
            modalElement.addEventListener('click', function(e) {
                if (e.target === modalElement) {
                    hideModal(modalElement.id);
                }
            });
        }
    });
    
    // 이메일 사전예약 폼 처리
    const emailModalForm = document.getElementById('email-modal-form');
    if (emailModalForm) {
        emailModalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEmailPreRegistration();
        });
    }
}

// 모달 표시
function showModal(title, text, modalId = 'modal') {
    const modal = document.getElementById(modalId);
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    
    if (modalId === 'modal') {
        if (modalTitle) modalTitle.textContent = title;
        if (modalText) modalText.textContent = text;
    }
    
    modal.style.display = 'block';
    
    // CTA 전환 퍼널 업데이트
    trackingData.conversionFunnel.modal_open++;
    
    // 고급 모달 트래킹
    const modalData = {
        event_name: 'modal_open',
        event_category: 'cta_funnel',
        event_label: `modal_${modalId}_${title.replace(/\s+/g, '_').toLowerCase()}`,
        
        // Modal Details
        modal_id: modalId,
        modal_title: title,
        modal_type: modalId === 'email-modal' ? 'lead_capture' : 'information',
        
        // User Journey
        session_id: sessionId,
        language: currentLanguage,
        ab_test_variant: abTestVariant,
        time_to_modal: Date.now() - trackingData.startTime,
        
        // CTA Context
        cta_clicks_before_modal: Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0),
        last_cta_clicked: ctaInteractions.length > 0 ? ctaInteractions[ctaInteractions.length - 1].ctaId : null,
        
        // Funnel Position
        funnel_step: 'modal_open',
        funnel_progress: trackingData.conversionFunnel.modal_open / trackingData.conversionFunnel.page_view
    };
    
    // GA4 이벤트 전송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'modal_open', {
            event_category: 'cta_funnel',
            event_label: modalData.event_label,
            value: modalId === 'email-modal' ? 50 : 20, // 리드 캡처 모달은 더 높은 가치
            custom_parameters: modalData
        });
    }
    
    // 모달 표시 이벤트 트래킹 (기존)
    trackEvent('modal_show', {
        title: title,
        modal_id: modalId,
        language: currentLanguage
    });
    
    console.log('Modal Tracking:', modalData);
}

// 이메일 사전예약 모달 표시
function showEmailModal() {
    const emailModal = document.getElementById('email-modal');
    emailModal.style.display = 'block';
    
    // CTA 전환 퍼널 업데이트 (폼 시작)
    trackingData.conversionFunnel.form_start++;
    
    // 고급 이메일 모달 트래킹
    const emailModalData = {
        event_name: 'lead_capture_modal_open',
        event_category: 'lead_generation',
        event_label: 'email_preregistration_modal',
        
        // Lead Capture Context
        modal_type: 'lead_capture',
        capture_method: 'email_preregistration',
        
        // User Journey Analysis
        session_id: sessionId,
        language: currentLanguage,
        ab_test_variant: abTestVariant,
        time_to_lead_capture: Date.now() - trackingData.startTime,
        
        // CTA Performance Context
        cta_clicks_before_capture: Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0),
        triggering_cta: ctaInteractions.length > 0 ? ctaInteractions[ctaInteractions.length - 1].ctaId : 'unknown',
        
        // Funnel Metrics
        funnel_step: 'form_start',
        conversion_probability: calculateConversionProbability(),
        
        // Business Value
        value: 75, // 이메일 캡처 가치
        currency: 'KRW'
    };
    
    // GA4 이벤트 전송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', { // 전환 퍼널의 시작점으로 사용
            currency: 'KRW',
            value: 75,
            items: [{
                item_id: 'email_capture',
                item_name: 'Email Pre-registration',
                category: 'lead_generation',
                quantity: 1,
                price: 75
            }]
        });
        
        gtag('event', 'lead_capture_start', {
            event_category: 'lead_generation',
            event_label: 'email_modal_open',
            value: 75,
            custom_parameters: emailModalData
        });
    }
    
    // 이메일 모달 표시 이벤트 트래킹 (기존)
    trackEvent('email_modal_show', {
        language: currentLanguage,
        ab_variant: abTestVariant
    });
    
    console.log('Email Modal Tracking:', emailModalData);
}

// 전환 확률 계산 (머신러닝 스타일 예측)
function calculateConversionProbability() {
    const timeOnPage = Date.now() - trackingData.startTime;
    const ctaClicks = Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0);
    const interactions = ctaInteractions.length;
    
    // 간단한 점수 기반 확률 계산
    let probability = 0.1; // 기본 10%
    
    // 시간 요소 (30초 이상 체류시 증가)
    if (timeOnPage > 30000) probability += 0.2;
    if (timeOnPage > 60000) probability += 0.1;
    
    // 인터랙션 요소
    if (ctaClicks > 0) probability += 0.3;
    if (ctaClicks > 1) probability += 0.2;
    if (interactions > 3) probability += 0.1;
    
    // A/B 테스트 변형별 조정
    if (abTestVariant === 'B') probability += 0.05;
    
    return Math.min(probability, 0.9); // 최대 90%
}

// 모달 숨기기
function hideModal(modalId = 'modal') {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    
    // 모달 닫기 이벤트 트래킹
    trackEvent('modal_close', {
        modal_id: modalId,
        language: currentLanguage
    });
}

// 이메일 사전예약 처리
function handleEmailPreRegistration() {
    const form = document.getElementById('email-modal-form');
    if (!form) {
        console.error('Email modal form not found');
        return;
    }
    
    const formData = new FormData(form);
    
    const email = formData.get('email');
    const name = formData.get('name');
    const service = formData.get('service');
    const country = formData.get('country');
    
    // 유효성 검사
    if (!validateEmail(email)) {
        showNotification(
            currentLanguage === 'ko' 
                ? '올바른 이메일 주소를 입력해주세요.' 
                : 'Please enter a valid email address.',
            'error'
        );
        return;
    }
    
    if (!validateName(name)) {
        showNotification(
            currentLanguage === 'ko' 
                ? '이름을 2-50자 사이로 입력해주세요.' 
                : 'Please enter a name between 2-50 characters.',
            'error'
        );
        return;
    }
    
    if (!validateCountry(country)) {
        showNotification(
            currentLanguage === 'ko' 
                ? '국가를 2-50자 사이로 입력해주세요.' 
                : 'Please enter a country between 2-50 characters.',
            'error'
        );
        return;
    }
    
    if (!service) {
        showNotification(
            currentLanguage === 'ko' 
                ? '관심 서비스를 선택해주세요.' 
                : 'Please select a service interest.',
            'error'
        );
        return;
    }
    
    // 이메일 사전예약 이벤트 트래킹
    trackEvent('email_preregistration', {
        email: email,
        name: name,
        service: service,
        country: country,
        language: currentLanguage,
        ab_variant: abTestVariant
    });
    
    // 성공 메시지 표시
    showNotification(
        currentLanguage === 'ko' 
            ? '사전예약이 완료되었습니다! 서비스 오픈 시 가장 먼저 연락드리겠습니다.' 
            : 'Pre-registration completed! We will contact you first when our service opens.',
        'success'
    );
    
    // 폼 리셋
    form.reset();
    
    // 모달 닫기
    hideModal('email-modal');
    
    // 성공 모달 표시
    showModal(
        currentLanguage === 'ko' ? '사전예약 완료' : 'Pre-registration Complete',
        currentLanguage === 'ko' 
            ? '감사합니다! 서비스 오픈 시 가장 먼저 이메일로 연락드리겠습니다.' 
            : 'Thank you! We will contact you first via email when our service opens.'
    );
}

// 알림 표시
function showNotification(message, type = 'info') {
    // 간단한 알림 구현 (실제로는 더 정교한 알림 시스템 사용)
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 시간 추적 시작
function startTimeTracking() {
    setInterval(() => {
        trackingData.timeOnPage = Date.now() - trackingData.startTime;
    }, 1000);
}

// 이벤트 트래킹
function trackEvent(eventName, data = {}) {
    const eventData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        language: currentLanguage,
        ab_variant: abTestVariant,
        url: window.location.href,
        user_agent: navigator.userAgent,
        ...data
    };
    
    // GA4 이벤트 전송
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: data.category || 'engagement',
            event_label: data.label || eventName,
            value: data.value || 1,
            custom_parameters: data
        });
    }
    
    // 콘솔에 로그 (개발용)
    console.log('Event tracked:', eventData);
    
    // 로컬 스토리지에 저장 (백업용)
    const events = JSON.parse(localStorage.getItem('trackingEvents') || '[]');
    events.push(eventData);
    
    // 최근 100개 이벤트만 유지
    if (events.length > 100) {
        events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('trackingEvents', JSON.stringify(events));
    
    // 클릭 카운트 업데이트
    if (trackingData.clicks[eventName]) {
        trackingData.clicks[eventName]++;
    } else {
        trackingData.clicks[eventName] = 1;
    }
}

// 페이지 언로드 시 최종 데이터 전송
window.addEventListener('beforeunload', function() {
    // 최종 이벤트 트래킹
    trackEvent('page_exit', {
        time_on_page: trackingData.timeOnPage,
        total_clicks: Object.keys(trackingData.clicks).length,
        language: currentLanguage,
        ab_variant: abTestVariant
    });
});

// CTA 버튼 이벤트 핸들러 통합
document.addEventListener('click', function(e) {
    const target = e.target;
    const buttonText = target.textContent.trim();
    
    // 이메일 사전예약 모달을 표시해야 하는 버튼들
    const emailModalButtons = [
        'Get Started',
        'Apply for Free Consultation',
        'Apply for Mentoring',
        'Apply for Jobs',
        'Pre-register Now',
        'Start Right Now'
    ];
    
    // 이메일 사전예약 모달 표시
    if (emailModalButtons.some(text => buttonText.includes(text)) || 
        target.classList.contains('cta-btn') && 
        (buttonText.includes('Get Started') || buttonText.includes('Apply') || buttonText.includes('Start'))) {
        e.preventDefault();
        showEmailModal();
        return;
    }
    
    // 특정 ID를 가진 버튼들
    if (target.id === 'hero-cta' || target.id === 'mentor-cta') {
        e.preventDefault();
        showEmailModal();
        return;
    }
    
    // 합법성 체크 위저드
    if (target.id === 'legality-check' || target.id === 'wizard-cta') {
        e.preventDefault();
        showModal(
            currentLanguage === 'ko' ? '합법성 체크 위저드' : 'Legality Check Wizard',
            currentLanguage === 'ko' 
                ? '현재 서비스를 준비 중입니다. 이메일로 연락드리면 체크 도구를 제공해드리겠습니다.' 
                : 'We are currently preparing this service. We will provide the check tool via email when we contact you.'
        );
        return;
    }
    
    // 검증 공고 보기
    if (target.id === 'jobs-cta') {
        e.preventDefault();
        showModal(
            currentLanguage === 'ko' ? '검증된 일자리' : 'Verified Jobs',
            currentLanguage === 'ko' 
                ? '현재 서비스를 준비 중입니다. 이메일로 연락드리면 검증된 일자리 목록을 제공해드리겠습니다.' 
                : 'We are currently preparing this service. We will provide a list of verified jobs via email when we contact you.'
        );
        return;
    }
});

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
`;
document.head.appendChild(style);

// 개발자 도구용 함수들 (프로덕션에서는 제거)
window.getTrackingData = function() {
    return {
        trackingData,
        abTestVariant,
        currentLanguage,
        sessionId,
        ctaInteractions,
        heatmapData,
        events: JSON.parse(localStorage.getItem('trackingEvents') || '[]')
    };
};

window.getCTAPerformanceReport = function() {
    return generateCTAPerformanceReport();
};

window.getCTAOptimizationRecommendations = function() {
    return getCTAOptimizationRecommendations();
};

window.testCTATracking = function(ctaId = 'hero-cta') {
    console.log('Testing CTA tracking for:', ctaId);
    const element = document.getElementById(ctaId);
    if (element) {
        // 테스트 클릭 시뮬레이션
        element.click();
        console.log('CTA click simulated');
        
        // 성과 리포트 출력
        setTimeout(() => {
            console.log('Performance Report:', generateCTAPerformanceReport());
            console.log('Recommendations:', getCTAOptimizationRecommendations());
        }, 1000);
    } else {
        console.error('CTA element not found:', ctaId);
    }
};

window.simulateUserJourney = function() {
    console.log('Simulating complete user journey...');
    
    // 1. 페이지 뷰 (이미 완료)
    console.log('✓ Page view tracked');
    
    // 2. CTA 호버 시뮬레이션
    setTimeout(() => {
        trackCTAInteraction('hero-cta', 'hover');
        console.log('✓ CTA hover simulated');
    }, 1000);
    
    // 3. CTA 클릭 시뮬레이션
    setTimeout(() => {
        const heroBtn = document.getElementById('hero-cta');
        if (heroBtn) {
            heroBtn.click();
            console.log('✓ CTA click simulated');
        }
    }, 2000);
    
    // 4. 폼 제출 시뮬레이션 (3초 후)
    setTimeout(() => {
        trackCTAConversion('mentoring', {
            email: 'test@example.com',
            conversionValue: 100
        });
        console.log('✓ Conversion simulated');
        
        // 최종 리포트
        setTimeout(() => {
            console.log('=== FINAL JOURNEY REPORT ===');
            console.log(generateCTAPerformanceReport());
            console.log('=== OPTIMIZATION RECOMMENDATIONS ===');
            console.log(getCTAOptimizationRecommendations());
        }, 500);
    }, 3000);
};

window.clearTrackingData = function() {
    localStorage.removeItem('trackingEvents');
    trackingData = {
        pageViews: 0,
        clicks: {},
        formSubmissions: 0,
        timeOnPage: 0,
        startTime: Date.now(),
        ctaClicks: {},
        conversionFunnel: {
            page_view: 0,
            cta_click: 0,
            modal_open: 0,
            form_start: 0,
            form_submit: 0
        }
    };
    ctaInteractions.length = 0;
    heatmapData.length = 0;
    console.log('All tracking data cleared');
};

// CTA A/B 테스트 결과 분석
window.analyzeABTestResults = function() {
    const interactions = ctaInteractions.filter(i => i.action === 'click');
    const variantA = interactions.filter(i => i.abVariant === 'A');
    const variantB = interactions.filter(i => i.abVariant === 'B');
    
    const analysis = {
        total_interactions: interactions.length,
        variant_a: {
            clicks: variantA.length,
            rate: variantA.length / (variantA.length + variantB.length),
            ctas: variantA.reduce((acc, i) => {
                acc[i.ctaId] = (acc[i.ctaId] || 0) + 1;
                return acc;
            }, {})
        },
        variant_b: {
            clicks: variantB.length,
            rate: variantB.length / (variantA.length + variantB.length),
            ctas: variantB.reduce((acc, i) => {
                acc[i.ctaId] = (acc[i.ctaId] || 0) + 1;
                return acc;
            }, {})
        },
        recommendation: variantB.length > variantA.length ? 'Variant B performs better' : 'Variant A performs better'
    };
    
    console.log('A/B Test Analysis:', analysis);
    return analysis;
};

// Real-time CTA heatmap data
window.getCTAHeatmapData = function() {
    return heatmapData.map(point => ({
        x: point.x,
        y: point.y,
        value: point.value,
        element: point.element,
        timestamp: new Date(point.timestamp).toISOString()
    }));
};

console.log('🚀 Advanced CTA Tracking System Loaded!');
console.log('Available functions:');
console.log('- window.getCTAPerformanceReport()');
console.log('- window.getCTAOptimizationRecommendations()');
console.log('- window.testCTATracking(ctaId)');
console.log('- window.simulateUserJourney()');
console.log('- window.analyzeABTestResults()');
console.log('- window.getCTAHeatmapData()');
console.log('- window.clearTrackingData()');

