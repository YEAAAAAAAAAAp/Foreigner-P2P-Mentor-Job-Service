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

// ?�역 ?�러 처리
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    // ?�러 추적 (?�제 ?�영 ?�경?�서???�러 로깅 ?�비?�로 ?�송)
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

// ?�틸리티 ?�수??
const utils = {
    // ?�전???�소 ?�택
    safeQuerySelector: function(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn('Invalid selector:', selector, error);
            return null;
        }
    },
    
    // ?�전???�벤??리스??추�?
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
    
    // ?�바?�스 ?�수
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
    
    // ?�로?� ?�수
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

// CTA ?�의 �??�선?�위
const CTA_DEFINITIONS = {
    // Primary CTAs (최우???�환 목표)
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

// DOM 로드 ?�료 ???�행
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
        setupPerformanceMonitoring();
        setupAccessibilityFeatures();
    } catch (error) {
        console.error('Error during app initialization:', error);
        // 기본 기능만이?�도 ?�작?�도�?fallback
        setupBasicFeatures();
    }
});

// ?�능 모니?�링 ?�정
function setupPerformanceMonitoring() {
    if ('performance' in window) {
        // ?�이지 로드 ?�간 측정
        window.addEventListener('load', utils.debounce(function() {
            const loadTime = performance.now();
            console.log('Page load time:', loadTime + 'ms');
            
            // GA4???�능 ?�이???�송
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
        // ?��? ?�이브러리�? 로드??경우
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

// ?�근??기능 ?�정
function setupAccessibilityFeatures() {
    // ?�보???�비게이??지??
    setupKeyboardNavigation();
    
    // ?�커???�랩 ?�정
    setupFocusTraps();
    
    // ?�크�?리더 지??
    setupScreenReaderSupport();
}

// ?�보???�비게이???�정
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // ESC ?�로 모달 ?�기
        if (e.key === 'Escape') {
            const openModal = utils.safeQuerySelector('.modal.active');
            if (openModal) {
                closeModal(openModal);
            }
        }
        
        // Tab ???�환 ?�비게이??
        if (e.key === 'Tab') {
            handleTabNavigation(e);
        }
    });
}

// 기본 기능 ?�정 (fallback)
function setupBasicFeatures() {
    // 기본?�인 ?�어 ?�환 기능
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        utils.safeAddEventListener(btn, 'click', function() {
            const lang = this.getAttribute('data-lang');
            if (lang) {
                switchLanguage(lang);
            }
        });
    });
    
    // 기본?�인 CTA 버튼 기능
    const ctaButtons = document.querySelectorAll('.cta-btn');
    ctaButtons.forEach(btn => {
        utils.safeAddEventListener(btn, 'click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action') || 'contact';
            handleBasicCTA(action);
        });
    });
}

// ??초기??
function initializeApp() {
    try {
        initializeLanguage();
        initializeABTest();
        initializeServiceSelector();
        initializeEventTracking();
        initializeCTATracking(); // CTA ?�용 ?�래??추�?
        initializeFAQ();
        initializeFAQTabs();
        initializeScrollAnimations();
        initializeFormHandling();
        initializeModal();
        initializeMobileMenu();
        
        // ?�이지 �??�래??(?�환 ?�널 ?�작)
        trackEvent('page_view', { 
            page: 'landing',
            category: 'page_view',
            label: 'landing_page_load'
        });
        
        // ?�환 ?�널 ?�작??기록
        trackingData.conversionFunnel.page_view++;
        
        // ?�간 추적 ?�작
        startTimeTracking();
        
        console.log('MentorMatch Korea app initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        // 기본 기능?� 계속 ?�동?�도�???
    }
}

// ===== CTA ?�용 고급 ?�래???�스??=====

// CTA ?�래??초기??
function initializeCTATracking() {
    // 모든 CTA 버튼??고급 ?�래???�정
    Object.keys(CTA_DEFINITIONS).forEach(ctaId => {
        const element = document.getElementById(ctaId);
        if (element) {
            setupCTATracking(element, ctaId);
        }
    });
    
    // ?�래??기반 CTA 버튼?�도 추�?
    const ctaButtons = document.querySelectorAll('.cta-btn');
    ctaButtons.forEach((button, index) => {
        const ctaId = button.id || `cta-${index}`;
        if (!CTA_DEFINITIONS[ctaId]) {
            // ?�적 CTA ?�의 ?�성
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

// CTA 개별 ?�래???�정
function setupCTATracking(element, ctaId) {
    if (!element || !ctaId) return;
    
    const ctaConfig = CTA_DEFINITIONS[ctaId];
    
    // 마우???�벤???�래??
    element.addEventListener('mouseenter', () => {
        trackCTAInteraction(ctaId, 'hover', {
            timestamp: Date.now(),
            position: getElementPosition(element)
        });
    });
    
    element.addEventListener('mouseleave', () => {
        trackCTAInteraction(ctaId, 'hover_end');
    });
    
    // ?�릭 ?�벤???�래??(기존 ?�릭 리스?�보??먼�? ?�행)
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
    }, true); // Capture phase�??�행
    
    // Impression ?�래??(뷰포?�에 ?�어????
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

// CTA ?�릭 ?�용 ?�래??
function trackCTAClick(ctaId, clickData) {
    const ctaConfig = CTA_DEFINITIONS[ctaId] || {};
    
    // ?�환 ?�널 ?�데?�트
    trackingData.conversionFunnel.cta_click++;
    trackingData.ctaClicks[ctaId] = (trackingData.ctaClicks[ctaId] || 0) + 1;
    
    // GA4 Enhanced E-commerce ?�벤??
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
    
    // GA4 ?�벤???�송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', {
            event_category: 'cta_engagement',
            event_label: ctaConfig.name || ctaId,
            value: ctaConfig.value || 1,
            custom_parameters: eventData
        });
        
        // Enhanced Ecommerce ?�환 ?�벤??
        gtag('event', 'conversion', {
            send_to: 'G-NGW6S380X9',
            value: ctaConfig.value || 1,
            currency: 'KRW',
            transaction_id: sessionId + '_' + ctaId + '_' + Date.now()
        });
    }
    
    // CTA ?�터?�션 ?�스?�리 ?�??
    ctaInteractions.push({
        ctaId: ctaId,
        action: 'click',
        timestamp: Date.now(),
        data: clickData,
        config: ctaConfig
    });
    
    // ?�트�??�이???�집
    heatmapData.push({
        x: clickData.mousePosition?.x,
        y: clickData.mousePosition?.y,
        element: ctaId,
        timestamp: Date.now(),
        value: ctaConfig.value
    });
    
    console.log('CTA Click Tracked:', ctaId, eventData);
}

// CTA ?�터?�션 ?�래??(?�버, ?�크�???
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
    
    // GA4 ?�벤???�송
    if (typeof gtag !== 'undefined') {
        gtag('event', `cta_${action}`, {
            event_category: 'cta_interaction',
            event_label: eventData.event_label,
            custom_parameters: eventData
        });
    }
    
    // 로컬 ?�이???�??
    ctaInteractions.push({
        ctaId: ctaId,
        action: action,
        timestamp: Date.now(),
        data: data
    });
}

// ?�소???�이지 ???�치 계산
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // ?�이지???�느 ?�션???�는지 ?�단
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

// ===== CTA ?�환 분석 �?최적???�수??=====

// CTA ?�환 ?�료 ?�래??
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
    
    // GA4 ?�환 ?�벤??
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

// A/B ?�스???�과 분석
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
    
    // GA4 A/B ?�스???�벤??
    if (typeof gtag !== 'undefined') {
        gtag('event', 'ab_test_interaction', {
            event_category: 'ab_testing',
            event_label: performanceData.event_label,
            custom_parameters: performanceData
        });
    }
    
    console.log('A/B Test Performance:', performanceData);
}

// CTA ?�과 분석 리포???�성
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
    
    // �?CTA�??�과 계산
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

// ?�시�?CTA 최적??권장?�항
function getCTAOptimizationRecommendations() {
    const report = generateCTAPerformanceReport();
    const recommendations = [];
    
    // ??? ?�과 CTA ?�별
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
    
    // ?�환 ?�널 분석
    if (report.metrics.cta_to_conversion_rate < 0.2) {
        recommendations.push({
            type: 'funnel_optimization',
            issue: 'Low CTA to conversion rate',
            suggestion: 'Optimize form or reduce friction points',
            current_rate: report.metrics.cta_to_conversion_rate,
            target_rate: 0.3
        });
    }
    
    // A/B ?�스???�과 비교
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

// ?�어 초기??
function initializeLanguage() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const elements = document.querySelectorAll('[data-ko], [data-en]');
    
    // ?�어 버튼 ?�벤??리스??
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedLang = this.getAttribute('data-lang');
            switchLanguage(selectedLang);
        });
    });
    
    // 기본 ?�어 ?�정 (?�어�?변�?
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    switchLanguage(savedLang);
}

// ?�어 ?�환
function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // ?�어 버튼 ?�태 ?�데?�트
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // ?�스???�데?�트
    document.querySelectorAll('[data-ko], [data-en]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // ?�이지 ?�목 ?�데?�트
    if (lang === 'ko') {
        document.title = '?�국??멘토 & ?�전???�기?�바 매칭 | MentorMatch Korea';
    } else {
        document.title = 'Foreign Mentor & Safe Part-time Job Matching | MentorMatch Korea';
    }
    
    // ?�어 변�??�벤???�래??
    trackEvent('language_change', { language: lang });
}

// A/B ?�스??초기??
function initializeABTest() {
    // A/B ?�스??변??결정 (50:50 비율)
    abTestVariant = Math.random() < 0.5 ? 'A' : 'B';
    
    // 변?�에 ?�른 ?��????�용
    document.body.classList.add(`ab-test-variant-${abTestVariant.toLowerCase()}`);
    
    // ?�어�??�드?�인 A/B ?�스??
    if (abTestVariant === 'B') {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            if (currentLanguage === 'ko') {
                heroTitle.textContent = '?�국?�서 ?�공?�는 ?�국?�을 ?�한 ?�별??기회';
            } else {
                heroTitle.textContent = 'Special Opportunities for Internationals to Succeed in Korea';
            }
        }
    }
    
    // CTA 버튼 ?�스??A/B ?�스??
    const ctaButtons = document.querySelectorAll('.cta-btn.primary');
    ctaButtons.forEach(button => {
        if (abTestVariant === 'B') {
            if (currentLanguage === 'ko') {
                button.textContent = '지�?바로 ?�작?�기';
            } else {
                button.textContent = 'Start Right Now';
            }
        }
    });
    
    // A/B ?�스???�작 ?�벤???�래??
    trackEvent('ab_test_start', { 
        variant: abTestVariant,
        test_name: 'hero_headline_cta'
    });
}

// ?�비???�택 초기??
function initializeServiceSelector() {
    const serviceButtons = document.querySelectorAll('.service-btn');
    const mentorSection = document.getElementById('mentor-support');
    const jobSection = document.getElementById('job-support');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedService = this.getAttribute('data-service');
            
            // 모든 버튼?�서 active ?�래???�거
            serviceButtons.forEach(btn => btn.classList.remove('active'));
            // ?�릭??버튼??active ?�래??추�?
            this.classList.add('active');
            
            // ?�당 ?�션?�로 ?�크�?
            if (selectedService === 'mentor' && mentorSection) {
                mentorSection.scrollIntoView({ behavior: 'smooth' });
            } else if (selectedService === 'job' && jobSection) {
                jobSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // ?�비???�택 ?�벤???�래??
            trackEvent('service_selection', {
                service: selectedService,
                language: currentLanguage,
                ab_variant: abTestVariant
            });
        });
    });
}

// FAQ ??초기??
function initializeFAQTabs() {
    const faqTabs = document.querySelectorAll('.faq-tab');
    const faqSections = document.querySelectorAll('.faq-section');
    
    faqTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            
            // 모든 ??��??active ?�래???�거
            faqTabs.forEach(t => t.classList.remove('active'));
            // ?�릭????�� active ?�래??추�?
            this.classList.add('active');
            
            // 모든 ?�션 ?�기�?
            faqSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // ?�택???�션 ?�시
            const targetSection = document.getElementById(`faq-${tabType}`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // FAQ ???�환 ?�벤???�래??
            trackEvent('faq_tab_switch', {
                tab: tabType,
                language: currentLanguage
            });
        });
    });
}

// 모바??메뉴 초기??
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            
            // 모바??메뉴 ?��? ?�벤???�래??
            trackEvent('mobile_menu_toggle', {
                language: currentLanguage,
                action: navMenu.classList.contains('active') ? 'open' : 'close'
            });
        });
        
        // 메뉴 링크 ?�릭 ??모바??메뉴 ?�기
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
        
        // ?��? ?�릭 ??모바??메뉴 ?�기
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }
}

// ?�벤???�래??초기??
function initializeEventTracking() {
    // 모든 CTA 버튼???�릭 ?�래??추�?
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
    
    // ?�별??CTA 버튼??
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

// FAQ 초기??
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // 모든 FAQ ?�이???�기
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // ?�릭???�이?�만 ?�기
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

// ?�크�??�니메이??초기??
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 지???�니메이?�을 ?�한 timeout
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                
                // ?�션 �??�래??
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
    
    // ?�니메이???�???�소??관�?
    const animatedElements = document.querySelectorAll(`
        .feature-card, .job-card, .mentor-feature, .faq-item, 
        .service-card, .stat, .floating-card, .section-header
    `);
    
    animatedElements.forEach((el, index) => {
        // ?�양???�니메이???�래???�용
        if (index % 3 === 0) {
            el.classList.add('fade-in');
        } else if (index % 3 === 1) {
            el.classList.add('slide-in-left');
        } else {
            el.classList.add('slide-in-right');
        }
        
        observer.observe(el);
    });
    
    // ?�어�??�션 ?�별 ?�니메이??
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .service-selector, .hero-cta, .hero-stats');
    heroElements.forEach((el, index) => {
        el.classList.add('fade-in');
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 200);
    });
}

// ??처리 초기??
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
                showNotification('?�바�??�메??주소�??�력?�주?�요.', 'error');
            }
        });
    }
}

// ?�메???�효??검??
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// ?�름 ?�효??검??
function validateName(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 50;
}

// �?? ?�효??검??
function validateCountry(country) {
    if (!country || typeof country !== 'string') {
        return false;
    }
    const trimmedCountry = country.trim();
    return trimmedCountry.length >= 2 && trimmedCountry.length <= 50;
}

// ???�출
function submitForm(email, interest) {
    // ?�환 ?�널 ?�데?�트
    trackingData.conversionFunnel.form_submit++;
    
    // CTA ?�환 ?�료 ?�래??
    trackCTAConversion(interest, {
        email: email,
        conversionValue: CTA_DEFINITIONS['hero-cta']?.value || 100
    });
    
    // ?�제 구현?�서???�버�??�이???�송
    console.log('Form submitted:', { email, interest, language: currentLanguage });
    
    // GA4 Enhanced Conversion ?�벤??
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
        email_hash: btoa(email).substr(0, 8), // ?�명?�된 ?�메???�시
        language: currentLanguage,
        ab_test_variant: abTestVariant,
        session_id: sessionId,
        funnel_completion_time: Date.now() - trackingData.startTime,
        
        // User Journey
        total_cta_clicks: Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0),
        cta_interaction_count: ctaInteractions.length,
        page_time_before_conversion: Date.now() - trackingData.startTime
    };
    
    // GA4 ?�벤???�송
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
    
    // ?�벤???�래??(기존)
    trackEvent('form_submission', {
        email: email,
        interest: interest,
        language: currentLanguage,
        ab_variant: abTestVariant
    });
    
    // ?�비?�별 맞춤 메시지
    let successMessage, modalTitle, modalText;
    
    if (interest === 'mentoring') {
        successMessage = currentLanguage === 'ko' 
            ? '멘토�??�청???�료?�었?�니?? �??�락?�리겠습?�다.' 
            : 'Mentoring application completed! We will contact you soon.';
        modalTitle = currentLanguage === 'ko' ? '멘토�??�청 ?�료' : 'Mentoring Application Complete';
        modalText = currentLanguage === 'ko' 
            ? '감사?�니?? 24?�간 ?�에 멘토�??�담???�해 ?�메?�로 ?�락?�리겠습?�다.' 
            : 'Thank you! We will contact you via email within 24 hours for mentoring consultation.';
    } else if (interest === 'jobs') {
        successMessage = currentLanguage === 'ko' 
            ? '?�자�??�청???�료?�었?�니?? �??�락?�리겠습?�다.' 
            : 'Job application completed! We will contact you soon.';
        modalTitle = currentLanguage === 'ko' ? '?�자�??�청 ?�료' : 'Job Application Complete';
        modalText = currentLanguage === 'ko' 
            ? '감사?�니?? 24?�간 ?�에 ?�전???�자�?기회�??�메?�로 ?�내?�리겠습?�다.' 
            : 'Thank you! We will contact you via email within 24 hours with safe job opportunities.';
    } else {
        successMessage = currentLanguage === 'ko' 
            ? '?�청???�료?�었?�니?? �??�락?�리겠습?�다.' 
            : 'Application completed! We will contact you soon.';
        modalTitle = currentLanguage === 'ko' ? '?�청 ?�료' : 'Application Complete';
        modalText = currentLanguage === 'ko' 
            ? '감사?�니?? 24?�간 ?�에 ?�메?�로 ?�락?�리겠습?�다.' 
            : 'Thank you! We will contact you via email within 24 hours.';
    }
    
    // ?�공 메시지 ?�시
    showNotification(successMessage, 'success');
    
    // ??리셋
    document.getElementById('email-form').reset();
    
    // 모달 ?�시
    showModal(modalTitle, modalText);
}

// 모달 초기??
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
    
    // ?�메???�전?�약 ??처리
    const emailModalForm = document.getElementById('email-modal-form');
    if (emailModalForm) {
        emailModalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEmailPreRegistration();
        });
    }
}

// 모달 ?�시
function showModal(title, text, modalId = 'modal') {
    const modal = document.getElementById(modalId);
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    
    if (modalId === 'modal') {
        if (modalTitle) modalTitle.textContent = title;
        if (modalText) modalText.textContent = text;
    }
    
    modal.style.display = 'block';
    
    // CTA ?�환 ?�널 ?�데?�트
    trackingData.conversionFunnel.modal_open++;
    
    // 고급 모달 ?�래??
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
    
    // GA4 ?�벤???�송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'modal_open', {
            event_category: 'cta_funnel',
            event_label: modalData.event_label,
            value: modalId === 'email-modal' ? 50 : 20, // 리드 캡처 모달?� ???��? 가�?
            custom_parameters: modalData
        });
    }
    
    // 모달 ?�시 ?�벤???�래??(기존)
    trackEvent('modal_show', {
        title: title,
        modal_id: modalId,
        language: currentLanguage
    });
    
    console.log('Modal Tracking:', modalData);
}

// ?�메???�전?�약 모달 ?�시
function showEmailModal() {
    const emailModal = document.getElementById('email-modal');
    emailModal.style.display = 'block';
    
    // CTA ?�환 ?�널 ?�데?�트 (???�작)
    trackingData.conversionFunnel.form_start++;
    
    // 고급 ?�메??모달 ?�래??
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
        value: 75, // ?�메??캡처 가�?
        currency: 'KRW'
    };
    
    // GA4 ?�벤???�송
    if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', { // ?�환 ?�널???�작?�으�??�용
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
    
    // ?�메??모달 ?�시 ?�벤???�래??(기존)
    trackEvent('email_modal_show', {
        language: currentLanguage,
        ab_variant: abTestVariant
    });
    
    console.log('Email Modal Tracking:', emailModalData);
}

// ?�환 ?�률 계산 (머신?�닝 ?��????�측)
function calculateConversionProbability() {
    const timeOnPage = Date.now() - trackingData.startTime;
    const ctaClicks = Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0);
    const interactions = ctaInteractions.length;
    
    // 간단???�수 기반 ?�률 계산
    let probability = 0.1; // 기본 10%
    
    // ?�간 ?�소 (30�??�상 체류??증�?)
    if (timeOnPage > 30000) probability += 0.2;
    if (timeOnPage > 60000) probability += 0.1;
    
    // ?�터?�션 ?�소
    if (ctaClicks > 0) probability += 0.3;
    if (ctaClicks > 1) probability += 0.2;
    if (interactions > 3) probability += 0.1;
    
    // A/B ?�스??변?�별 조정
    if (abTestVariant === 'B') probability += 0.05;
    
    return Math.min(probability, 0.9); // 최�? 90%
}

// 모달 ?�기�?
function hideModal(modalId = 'modal') {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    
    // 모달 ?�기 ?�벤???�래??
    trackEvent('modal_close', {
        modal_id: modalId,
        language: currentLanguage
    });
}

// ?�메???�전?�약 처리
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
    
    // ?�효??검??
    if (!validateEmail(email)) {
        showNotification(
            currentLanguage === 'ko' 
                ? '?�바�??�메??주소�??�력?�주?�요.' 
                : 'Please enter a valid email address.',
            'error'
        );
        return;
    }
    
    if (!validateName(name)) {
        showNotification(
            currentLanguage === 'ko' 
                ? '?�름??2-50???�이�??�력?�주?�요.' 
                : 'Please enter a name between 2-50 characters.',
            'error'
        );
        return;
    }
    
    if (!validateCountry(country)) {
        showNotification(
            currentLanguage === 'ko' 
                ? '�??�?2-50???�이�??�력?�주?�요.' 
                : 'Please enter a country between 2-50 characters.',
            'error'
        );
        return;
    }
    
    if (!service) {
        showNotification(
            currentLanguage === 'ko' 
                ? '관???�비?��? ?�택?�주?�요.' 
                : 'Please select a service interest.',
            'error'
        );
        return;
    }
    
    // ?�메???�전?�약 ?�벤???�래??
    trackEvent('email_preregistration', {
        email: email,
        name: name,
        service: service,
        country: country,
        language: currentLanguage,
        ab_variant: abTestVariant
    });
    
    // ?�공 메시지 ?�시
    showNotification(
        currentLanguage === 'ko' 
            ? '?�전?�약???�료?�었?�니?? ?�비???�픈 ??가??먼�? ?�락?�리겠습?�다.' 
            : 'Pre-registration completed! We will contact you first when our service opens.',
        'success'
    );
    
    // ??리셋
    form.reset();
    
    // 모달 ?�기
    hideModal('email-modal');
    
    // ?�공 모달 ?�시
    showModal(
        currentLanguage === 'ko' ? '?�전?�약 ?�료' : 'Pre-registration Complete',
        currentLanguage === 'ko' 
            ? '감사?�니?? ?�비???�픈 ??가??먼�? ?�메?�로 ?�락?�리겠습?�다.' 
            : 'Thank you! We will contact you first via email when our service opens.'
    );
}

// ?�림 ?�시
function showNotification(message, type = 'info') {
    // 간단???�림 구현 (?�제로는 ???�교???�림 ?�스???�용)
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

// ?�간 추적 ?�작
function startTimeTracking() {
    setInterval(() => {
        trackingData.timeOnPage = Date.now() - trackingData.startTime;
    }, 1000);
}

// ?�벤???�래??
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
    
    // GA4 ?�벤???�송
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: data.category || 'engagement',
            event_label: data.label || eventName,
            value: data.value || 1,
            custom_parameters: data
        });
    }
    
    // 콘솔??로그 (개발??
    console.log('Event tracked:', eventData);
    
    // 로컬 ?�토리�????�??(백업??
    const events = JSON.parse(localStorage.getItem('trackingEvents') || '[]');
    events.push(eventData);
    
    // 최근 100�??�벤?�만 ?��?
    if (events.length > 100) {
        events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('trackingEvents', JSON.stringify(events));
    
    // ?�릭 카운???�데?�트
    if (trackingData.clicks[eventName]) {
        trackingData.clicks[eventName]++;
    } else {
        trackingData.clicks[eventName] = 1;
    }
}

// ?�이지 ?�로????최종 ?�이???�송
window.addEventListener('beforeunload', function() {
    // 최종 ?�벤???�래??
    trackEvent('page_exit', {
        time_on_page: trackingData.timeOnPage,
        total_clicks: Object.keys(trackingData.clicks).length,
        language: currentLanguage,
        ab_variant: abTestVariant
    });
});

// CTA 버튼 ?�벤???�들???�합
document.addEventListener('click', function(e) {
    const target = e.target;
    const buttonText = target.textContent.trim();
    
    // ?�메???�전?�약 모달???�시?�야 ?�는 버튼??
    const emailModalButtons = [
        'Get Started',
        'Apply for Free Consultation',
        'Apply for Mentoring',
        'Apply for Jobs',
        'Pre-register Now',
        'Start Right Now'
    ];
    
    // ?�메???�전?�약 모달 ?�시
    if (emailModalButtons.some(text => buttonText.includes(text)) || 
        target.classList.contains('cta-btn') && 
        (buttonText.includes('Get Started') || buttonText.includes('Apply') || buttonText.includes('Start'))) {
        e.preventDefault();
        showEmailModal();
        return;
    }
    
    // ?�정 ID�?가�?버튼??
    if (target.id === 'hero-cta' || target.id === 'mentor-cta') {
        e.preventDefault();
        showEmailModal();
        return;
    }
    
    // 합법성 체크 위자드
    if (target.id === 'legality-check' || target.id === 'wizard-cta') {
        e.preventDefault();
        showModal(
            currentLanguage === 'ko' ? '합법성 체크 위자드' : 'Legality Check Wizard',
            currentLanguage === 'ko' 
                ? '현재 서비스를 준비중입니다. 이메일로 연락드릴때 체크 도구를 제공해드리겠습니다' 
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
                ? '현재 서비스를 준비중입니다. 이메일로 연락드릴때 검증된 일자리 목록을 제공해드리겠습니다' 
                : 'We are currently preparing this service. We will provide a list of verified jobs via email when we contact you.'
        );
        return;
    }
});

// CSS ?�니메이??추�?
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

// 개발???�구???�수??(?�로?�션?�서???�거)
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
        // ?�스???�릭 ?��??�이??
        element.click();
        console.log('CTA click simulated');
        
        // ?�과 리포??출력
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
    
    // 1. ?�이지 �?(?��? ?�료)
    console.log('??Page view tracked');
    
    // 2. CTA ?�버 ?��??�이??
    setTimeout(() => {
        trackCTAInteraction('hero-cta', 'hover');
        console.log('??CTA hover simulated');
    }, 1000);
    
    // 3. CTA ?�릭 ?��??�이??
    setTimeout(() => {
        const heroBtn = document.getElementById('hero-cta');
        if (heroBtn) {
            heroBtn.click();
            console.log('??CTA click simulated');
        }
    }, 2000);
    
    // 4. ???�출 ?��??�이??(3�???
    setTimeout(() => {
        trackCTAConversion('mentoring', {
            email: 'test@example.com',
            conversionValue: 100
        });
        console.log('??Conversion simulated');
        
        // 최종 리포??
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

// CTA A/B ?�스??결과 분석
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

console.log('?? Advanced CTA Tracking System Loaded!');
console.log('Available functions:');
console.log('- window.getCTAPerformanceReport()');
console.log('- window.getCTAOptimizationRecommendations()');
console.log('- window.testCTATracking(ctaId)');
console.log('- window.simulateUserJourney()');
console.log('- window.analyzeABTestResults()');
console.log('- window.getCTAHeatmapData()');
console.log('- window.clearTrackingData()');

