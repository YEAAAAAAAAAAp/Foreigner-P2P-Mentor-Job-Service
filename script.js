// GitHub Pages base href ?§Ï†ï (Î∞∞Ìè¨ ?òÍ≤Ω?êÏÑúÎß?
if (window.location.hostname === 'yeaaaaaaaaaap.github.io') {
    const baseElement = document.createElement('base');
    baseElement.href = '/Foreigner-P2P-Mentor-Job-Service/';
    document.head.insertBefore(baseElement, document.head.firstChild);
}

// ?ÑÏó≠ Î≥Ä?òÏ? ?êÎü¨ Ï≤òÎ¶¨
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

// ?ÑÏó≠ ?êÎü¨ Ï≤òÎ¶¨
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    // ?êÎü¨ Ï∂îÏ†Å (?§Ï†ú ?¥ÏòÅ ?òÍ≤Ω?êÏÑú???êÎü¨ Î°úÍπÖ ?úÎπÑ?§Î°ú ?ÑÏÜ°)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: event.error?.message || 'Unknown error',
            fatal: false
        });
    }
});

// Promise rejection Ï≤òÎ¶¨
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: 'Promise rejection: ' + (event.reason?.message || 'Unknown'),
            fatal: false
        });
    }
});

// ?†Ìã∏Î¶¨Ìã∞ ?®Ïàò??
const utils = {
    // ?àÏ†Ñ???îÏÜå ?†ÌÉù
    safeQuerySelector: function(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn('Invalid selector:', selector, error);
            return null;
        }
    },
    
    // ?àÏ†Ñ???¥Î≤§??Î¶¨Ïä§??Ï∂îÍ?
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
    
    // ?îÎ∞î?¥Ïä§ ?®Ïàò
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
    
    // ?∞Î°ú?Ä ?®Ïàò
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

// CTA ?ïÏùò Î∞??∞ÏÑ†?úÏúÑ
const CTA_DEFINITIONS = {
    // Primary CTAs (ÏµúÏö∞???ÑÌôò Î™©Ìëú)
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

// DOM Î°úÎìú ?ÑÎ£å ???§Ìñâ
document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeApp();
        setupPerformanceMonitoring();
        setupAccessibilityFeatures();
    } catch (error) {
        console.error('Error during app initialization:', error);
        // Í∏∞Î≥∏ Í∏∞Îä•ÎßåÏù¥?ºÎèÑ ?ôÏûë?òÎèÑÎ°?fallback
        setupBasicFeatures();
    }
});

// ?±Îä• Î™®Îãà?∞ÎßÅ ?§Ï†ï
function setupPerformanceMonitoring() {
    if ('performance' in window) {
        // ?òÏù¥ÏßÄ Î°úÎìú ?úÍ∞Ñ Ï∏°Ï†ï
        window.addEventListener('load', utils.debounce(function() {
            const loadTime = performance.now();
            console.log('Page load time:', loadTime + 'ms');
            
            // GA4???±Îä• ?∞Ïù¥???ÑÏÜ°
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    event_category: 'performance',
                    value: Math.round(loadTime)
                });
            }
            
            // Core Web Vitals Ï∏°Ï†ï
            measureCoreWebVitals();
        }, 100));
    }
}

// Core Web Vitals Ï∏°Ï†ï
function measureCoreWebVitals() {
    if ('web-vital' in window) {
        // ?¥Î? ?ºÏù¥Î∏åÎü¨Î¶¨Í? Î°úÎìú??Í≤ΩÏö∞
        return;
    }
    
    // LCP (Largest Contentful Paint) Ï∏°Ï†ï
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

// ?ëÍ∑º??Í∏∞Îä• ?§Ï†ï
function setupAccessibilityFeatures() {
    // ?§Î≥¥???§ÎπÑÍ≤åÏù¥??ÏßÄ??
    setupKeyboardNavigation();
    
    // ?¨Ïª§???∏Îû© ?§Ï†ï
    setupFocusTraps();
    
    // ?§ÌÅ¨Î¶?Î¶¨Îçî ÏßÄ??
    setupScreenReaderSupport();
}

// ?§Î≥¥???§ÎπÑÍ≤åÏù¥???§Ï†ï
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // ESC ?§Î°ú Î™®Îã¨ ?´Í∏∞
        if (e.key === 'Escape') {
            const openModal = utils.safeQuerySelector('.modal.active');
            if (openModal) {
                closeModal(openModal);
            }
        }
        
        // Tab ???úÌôò ?§ÎπÑÍ≤åÏù¥??
        if (e.key === 'Tab') {
            handleTabNavigation(e);
        }
    });
}

// Í∏∞Î≥∏ Í∏∞Îä• ?§Ï†ï (fallback)
function setupBasicFeatures() {
    // Í∏∞Î≥∏?ÅÏù∏ ?∏Ïñ¥ ?ÑÌôò Í∏∞Îä•
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        utils.safeAddEventListener(btn, 'click', function() {
            const lang = this.getAttribute('data-lang');
            if (lang) {
                switchLanguage(lang);
            }
        });
    });
    
    // Í∏∞Î≥∏?ÅÏù∏ CTA Î≤ÑÌäº Í∏∞Îä•
    const ctaButtons = document.querySelectorAll('.cta-btn');
    ctaButtons.forEach(btn => {
        utils.safeAddEventListener(btn, 'click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action') || 'contact';
            handleBasicCTA(action);
        });
    });
}

// ??Ï¥àÍ∏∞??
function initializeApp() {
    try {
        initializeLanguage();
        initializeABTest();
        initializeServiceSelector();
        initializeEventTracking();
        initializeCTATracking(); // CTA ?ÑÏö© ?∏Îûò??Ï∂îÍ?
        initializeFAQ();
        initializeFAQTabs();
        initializeScrollAnimations();
        initializeFormHandling();
        initializeModal();
        initializeMobileMenu();
        
        // ?òÏù¥ÏßÄ Î∑??∏Îûò??(?ÑÌôò ?ºÎÑê ?úÏûë)
        trackEvent('page_view', { 
            page: 'landing',
            category: 'page_view',
            label: 'landing_page_load'
        });
        
        // ?ÑÌôò ?ºÎÑê ?úÏûë??Í∏∞Î°ù
        trackingData.conversionFunnel.page_view++;
        
        // ?úÍ∞Ñ Ï∂îÏ†Å ?úÏûë
        startTimeTracking();
        
        console.log('MentorMatch Korea app initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        // Í∏∞Î≥∏ Í∏∞Îä•?Ä Í≥ÑÏÜç ?ëÎèô?òÎèÑÎ°???
    }
}

// ===== CTA ?ÑÏö© Í≥†Í∏â ?∏Îûò???úÏä§??=====

// CTA ?∏Îûò??Ï¥àÍ∏∞??
function initializeCTATracking() {
    // Î™®Îì† CTA Î≤ÑÌäº??Í≥†Í∏â ?∏Îûò???§Ï†ï
    Object.keys(CTA_DEFINITIONS).forEach(ctaId => {
        const element = document.getElementById(ctaId);
        if (element) {
            setupCTATracking(element, ctaId);
        }
    });
    
    // ?¥Îûò??Í∏∞Î∞ò CTA Î≤ÑÌäº?§ÎèÑ Ï∂îÍ?
    const ctaButtons = document.querySelectorAll('.cta-btn');
    ctaButtons.forEach((button, index) => {
        const ctaId = button.id || `cta-${index}`;
        if (!CTA_DEFINITIONS[ctaId]) {
            // ?ôÏ†Å CTA ?ïÏùò ?ùÏÑ±
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

// CTA Í∞úÎ≥Ñ ?∏Îûò???§Ï†ï
function setupCTATracking(element, ctaId) {
    if (!element || !ctaId) return;
    
    const ctaConfig = CTA_DEFINITIONS[ctaId];
    
    // ÎßàÏö∞???¥Î≤§???∏Îûò??
    element.addEventListener('mouseenter', () => {
        trackCTAInteraction(ctaId, 'hover', {
            timestamp: Date.now(),
            position: getElementPosition(element)
        });
    });
    
    element.addEventListener('mouseleave', () => {
        trackCTAInteraction(ctaId, 'hover_end');
    });
    
    // ?¥Î¶≠ ?¥Î≤§???∏Îûò??(Í∏∞Ï°¥ ?¥Î¶≠ Î¶¨Ïä§?àÎ≥¥??Î®ºÏ? ?§Ìñâ)
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
    }, true); // Capture phaseÎ°??§Ìñâ
    
    // Impression ?∏Îûò??(Î∑∞Ìè¨?∏Ïóê ?§Ïñ¥????
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

// CTA ?¥Î¶≠ ?ÑÏö© ?∏Îûò??
function trackCTAClick(ctaId, clickData) {
    const ctaConfig = CTA_DEFINITIONS[ctaId] || {};
    
    // ?ÑÌôò ?ºÎÑê ?ÖÎç∞?¥Ìä∏
    trackingData.conversionFunnel.cta_click++;
    trackingData.ctaClicks[ctaId] = (trackingData.ctaClicks[ctaId] || 0) + 1;
    
    // GA4 Enhanced E-commerce ?¥Î≤§??
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
    
    // GA4 ?¥Î≤§???ÑÏÜ°
    if (typeof gtag !== 'undefined') {
        gtag('event', 'cta_click', {
            event_category: 'cta_engagement',
            event_label: ctaConfig.name || ctaId,
            value: ctaConfig.value || 1,
            custom_parameters: eventData
        });
        
        // Enhanced Ecommerce ?ÑÌôò ?¥Î≤§??
        gtag('event', 'conversion', {
            send_to: 'G-NGW6S380X9',
            value: ctaConfig.value || 1,
            currency: 'KRW',
            transaction_id: sessionId + '_' + ctaId + '_' + Date.now()
        });
    }
    
    // CTA ?∏ÌÑ∞?ôÏÖò ?àÏä§?†Î¶¨ ?Ä??
    ctaInteractions.push({
        ctaId: ctaId,
        action: 'click',
        timestamp: Date.now(),
        data: clickData,
        config: ctaConfig
    });
    
    // ?àÌä∏Îß??∞Ïù¥???òÏßë
    heatmapData.push({
        x: clickData.mousePosition?.x,
        y: clickData.mousePosition?.y,
        element: ctaId,
        timestamp: Date.now(),
        value: ctaConfig.value
    });
    
    console.log('CTA Click Tracked:', ctaId, eventData);
}

// CTA ?∏ÌÑ∞?ôÏÖò ?∏Îûò??(?∏Î≤Ñ, ?§ÌÅ¨Î°???
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
    
    // GA4 ?¥Î≤§???ÑÏÜ°
    if (typeof gtag !== 'undefined') {
        gtag('event', `cta_${action}`, {
            event_category: 'cta_interaction',
            event_label: eventData.event_label,
            custom_parameters: eventData
        });
    }
    
    // Î°úÏª¨ ?∞Ïù¥???Ä??
    ctaInteractions.push({
        ctaId: ctaId,
        action: action,
        timestamp: Date.now(),
        data: data
    });
}

// ?îÏÜå???òÏù¥ÏßÄ ???ÑÏπò Í≥ÑÏÇ∞
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // ?òÏù¥ÏßÄ???¥Îäê ?πÏÖò???àÎäîÏßÄ ?êÎã®
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

// ===== CTA ?ÑÌôò Î∂ÑÏÑù Î∞?ÏµúÏ†Å???®Ïàò??=====

// CTA ?ÑÌôò ?ÑÎ£å ?∏Îûò??
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
    
    // GA4 ?ÑÌôò ?¥Î≤§??
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

// A/B ?åÏä§???±Í≥º Î∂ÑÏÑù
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
    
    // GA4 A/B ?åÏä§???¥Î≤§??
    if (typeof gtag !== 'undefined') {
        gtag('event', 'ab_test_interaction', {
            event_category: 'ab_testing',
            event_label: performanceData.event_label,
            custom_parameters: performanceData
        });
    }
    
    console.log('A/B Test Performance:', performanceData);
}

// CTA ?±Í≥º Î∂ÑÏÑù Î¶¨Ìè¨???ùÏÑ±
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
    
    // Í∞?CTAÎ≥??±Í≥º Í≥ÑÏÇ∞
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

// ?§ÏãúÍ∞?CTA ÏµúÏ†Å??Í∂åÏû•?¨Ìï≠
function getCTAOptimizationRecommendations() {
    const report = generateCTAPerformanceReport();
    const recommendations = [];
    
    // ??? ?±Í≥º CTA ?ùÎ≥Ñ
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
    
    // ?ÑÌôò ?ºÎÑê Î∂ÑÏÑù
    if (report.metrics.cta_to_conversion_rate < 0.2) {
        recommendations.push({
            type: 'funnel_optimization',
            issue: 'Low CTA to conversion rate',
            suggestion: 'Optimize form or reduce friction points',
            current_rate: report.metrics.cta_to_conversion_rate,
            target_rate: 0.3
        });
    }
    
    // A/B ?åÏä§???±Í≥º ÎπÑÍµê
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

// ?∏Ïñ¥ Ï¥àÍ∏∞??
function initializeLanguage() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const elements = document.querySelectorAll('[data-ko], [data-en]');
    
    // ?∏Ïñ¥ Î≤ÑÌäº ?¥Î≤§??Î¶¨Ïä§??
    langButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedLang = this.getAttribute('data-lang');
            switchLanguage(selectedLang);
        });
    });
    
    // Í∏∞Î≥∏ ?∏Ïñ¥ ?§Ï†ï (?ÅÏñ¥Î°?Î≥ÄÍ≤?
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    switchLanguage(savedLang);
}

// ?∏Ïñ¥ ?ÑÌôò
function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    // ?∏Ïñ¥ Î≤ÑÌäº ?ÅÌÉú ?ÖÎç∞?¥Ìä∏
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // ?çÏä§???ÖÎç∞?¥Ìä∏
    document.querySelectorAll('[data-ko], [data-en]').forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // ?òÏù¥ÏßÄ ?úÎ™© ?ÖÎç∞?¥Ìä∏
    if (lang === 'ko') {
        document.title = '?∏Íµ≠??Î©òÌÜ† & ?àÏ†Ñ???®Í∏∞?åÎ∞î Îß§Ïπ≠ | MentorMatch Korea';
    } else {
        document.title = 'Foreign Mentor & Safe Part-time Job Matching | MentorMatch Korea';
    }
    
    // ?∏Ïñ¥ Î≥ÄÍ≤??¥Î≤§???∏Îûò??
    trackEvent('language_change', { language: lang });
}

// A/B ?åÏä§??Ï¥àÍ∏∞??
function initializeABTest() {
    // A/B ?åÏä§??Î≥Ä??Í≤∞Ï†ï (50:50 ÎπÑÏú®)
    abTestVariant = Math.random() < 0.5 ? 'A' : 'B';
    
    // Î≥Ä?ïÏóê ?∞Î•∏ ?§Ì????ÅÏö©
    document.body.classList.add(`ab-test-variant-${abTestVariant.toLowerCase()}`);
    
    // ?àÏñ¥Î°??§Îìú?ºÏù∏ A/B ?åÏä§??
    if (abTestVariant === 'B') {
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            if (currentLanguage === 'ko') {
                heroTitle.textContent = '?úÍµ≠?êÏÑú ?±Í≥µ?òÎäî ?∏Íµ≠?∏ÏùÑ ?ÑÌïú ?πÎ≥Ñ??Í∏∞Ìöå';
            } else {
                heroTitle.textContent = 'Special Opportunities for Internationals to Succeed in Korea';
            }
        }
    }
    
    // CTA Î≤ÑÌäº ?çÏä§??A/B ?åÏä§??
    const ctaButtons = document.querySelectorAll('.cta-btn.primary');
    ctaButtons.forEach(button => {
        if (abTestVariant === 'B') {
            if (currentLanguage === 'ko') {
                button.textContent = 'ÏßÄÍ∏?Î∞îÎ°ú ?úÏûë?òÍ∏∞';
            } else {
                button.textContent = 'Start Right Now';
            }
        }
    });
    
    // A/B ?åÏä§???úÏûë ?¥Î≤§???∏Îûò??
    trackEvent('ab_test_start', { 
        variant: abTestVariant,
        test_name: 'hero_headline_cta'
    });
}

// ?úÎπÑ???†ÌÉù Ï¥àÍ∏∞??
function initializeServiceSelector() {
    const serviceButtons = document.querySelectorAll('.service-btn');
    const mentorSection = document.getElementById('mentor-support');
    const jobSection = document.getElementById('job-support');
    
    serviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const selectedService = this.getAttribute('data-service');
            
            // Î™®Îì† Î≤ÑÌäº?êÏÑú active ?¥Îûò???úÍ±∞
            serviceButtons.forEach(btn => btn.classList.remove('active'));
            // ?¥Î¶≠??Î≤ÑÌäº??active ?¥Îûò??Ï∂îÍ?
            this.classList.add('active');
            
            // ?¥Îãπ ?πÏÖò?ºÎ°ú ?§ÌÅ¨Î°?
            if (selectedService === 'mentor' && mentorSection) {
                mentorSection.scrollIntoView({ behavior: 'smooth' });
            } else if (selectedService === 'job' && jobSection) {
                jobSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // ?úÎπÑ???†ÌÉù ?¥Î≤§???∏Îûò??
            trackEvent('service_selection', {
                service: selectedService,
                language: currentLanguage,
                ab_variant: abTestVariant
            });
        });
    });
}

// FAQ ??Ï¥àÍ∏∞??
function initializeFAQTabs() {
    const faqTabs = document.querySelectorAll('.faq-tab');
    const faqSections = document.querySelectorAll('.faq-section');
    
    faqTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            
            // Î™®Îì† ??óê??active ?¥Îûò???úÍ±∞
            faqTabs.forEach(t => t.classList.remove('active'));
            // ?¥Î¶≠????óê active ?¥Îûò??Ï∂îÍ?
            this.classList.add('active');
            
            // Î™®Îì† ?πÏÖò ?®Í∏∞Í∏?
            faqSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // ?†ÌÉù???πÏÖò ?úÏãú
            const targetSection = document.getElementById(`faq-${tabType}`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
            
            // FAQ ???ÑÌôò ?¥Î≤§???∏Îûò??
            trackEvent('faq_tab_switch', {
                tab: tabType,
                language: currentLanguage
            });
        });
    });
}

// Î™®Î∞î??Î©îÎâ¥ Ï¥àÍ∏∞??
function initializeMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
            
            // Î™®Î∞î??Î©îÎâ¥ ?†Í? ?¥Î≤§???∏Îûò??
            trackEvent('mobile_menu_toggle', {
                language: currentLanguage,
                action: navMenu.classList.contains('active') ? 'open' : 'close'
            });
        });
        
        // Î©îÎâ¥ ÎßÅÌÅ¨ ?¥Î¶≠ ??Î™®Î∞î??Î©îÎâ¥ ?´Í∏∞
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
        
        // ?∏Î? ?¥Î¶≠ ??Î™®Î∞î??Î©îÎâ¥ ?´Í∏∞
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }
}

// ?¥Î≤§???∏Îûò??Ï¥àÍ∏∞??
function initializeEventTracking() {
    // Î™®Îì† CTA Î≤ÑÌäº???¥Î¶≠ ?∏Îûò??Ï∂îÍ?
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
    
    // ?πÎ≥Ñ??CTA Î≤ÑÌäº??
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

// FAQ Ï¥àÍ∏∞??
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Î™®Îì† FAQ ?ÑÏù¥???´Í∏∞
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // ?¥Î¶≠???ÑÏù¥?úÎßå ?¥Í∏∞
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

// ?§ÌÅ¨Î°??†ÎãàÎ©îÏù¥??Ï¥àÍ∏∞??
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // ÏßÄ???†ÎãàÎ©îÏù¥?òÏùÑ ?ÑÌïú timeout
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                
                // ?πÏÖò Î∑??∏Îûò??
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
    
    // ?†ÎãàÎ©îÏù¥???Ä???îÏÜå??Í¥ÄÏ∞?
    const animatedElements = document.querySelectorAll(`
        .feature-card, .job-card, .mentor-feature, .faq-item, 
        .service-card, .stat, .floating-card, .section-header
    `);
    
    animatedElements.forEach((el, index) => {
        // ?§Ïñë???†ÎãàÎ©îÏù¥???¥Îûò???ÅÏö©
        if (index % 3 === 0) {
            el.classList.add('fade-in');
        } else if (index % 3 === 1) {
            el.classList.add('slide-in-left');
        } else {
            el.classList.add('slide-in-right');
        }
        
        observer.observe(el);
    });
    
    // ?àÏñ¥Î°??πÏÖò ?πÎ≥Ñ ?†ÎãàÎ©îÏù¥??
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .service-selector, .hero-cta, .hero-stats');
    heroElements.forEach((el, index) => {
        el.classList.add('fade-in');
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 200);
    });
}

// ??Ï≤òÎ¶¨ Ï¥àÍ∏∞??
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
                showNotification('?¨Î∞îÎ•??¥Î©î??Ï£ºÏÜåÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.', 'error');
            }
        });
    }
}

// ?¥Î©î???†Ìö®??Í≤Ä??
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

// ?¥Î¶Ñ ?†Ìö®??Í≤Ä??
function validateName(name) {
    if (!name || typeof name !== 'string') {
        return false;
    }
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 50;
}

// Íµ?? ?†Ìö®??Í≤Ä??
function validateCountry(country) {
    if (!country || typeof country !== 'string') {
        return false;
    }
    const trimmedCountry = country.trim();
    return trimmedCountry.length >= 2 && trimmedCountry.length <= 50;
}

// ???úÏ∂ú
function submitForm(email, interest) {
    // ?ÑÌôò ?ºÎÑê ?ÖÎç∞?¥Ìä∏
    trackingData.conversionFunnel.form_submit++;
    
    // CTA ?ÑÌôò ?ÑÎ£å ?∏Îûò??
    trackCTAConversion(interest, {
        email: email,
        conversionValue: CTA_DEFINITIONS['hero-cta']?.value || 100
    });
    
    // ?§Ï†ú Íµ¨ÌòÑ?êÏÑú???úÎ≤ÑÎ°??∞Ïù¥???ÑÏÜ°
    console.log('Form submitted:', { email, interest, language: currentLanguage });
    
    // GA4 Enhanced Conversion ?¥Î≤§??
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
        email_hash: btoa(email).substr(0, 8), // ?µÎ™Ö?îÎêú ?¥Î©î???¥Ïãú
        language: currentLanguage,
        ab_test_variant: abTestVariant,
        session_id: sessionId,
        funnel_completion_time: Date.now() - trackingData.startTime,
        
        // User Journey
        total_cta_clicks: Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0),
        cta_interaction_count: ctaInteractions.length,
        page_time_before_conversion: Date.now() - trackingData.startTime
    };
    
    // GA4 ?¥Î≤§???ÑÏÜ°
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
    
    // ?¥Î≤§???∏Îûò??(Í∏∞Ï°¥)
    trackEvent('form_submission', {
        email: email,
        interest: interest,
        language: currentLanguage,
        ab_variant: abTestVariant
    });
    
    // ?úÎπÑ?§Î≥Ñ ÎßûÏ∂§ Î©îÏãúÏßÄ
    let successMessage, modalTitle, modalText;
    
    if (interest === 'mentoring') {
        successMessage = currentLanguage === 'ko' 
            ? 'Î©òÌÜ†Îß??†Ï≤≠???ÑÎ£å?òÏóà?µÎãà?? Í≥??∞ÎùΩ?úÎ¶¨Í≤†Ïäµ?àÎã§.' 
            : 'Mentoring application completed! We will contact you soon.';
        modalTitle = currentLanguage === 'ko' ? 'Î©òÌÜ†Îß??†Ï≤≠ ?ÑÎ£å' : 'Mentoring Application Complete';
        modalText = currentLanguage === 'ko' 
            ? 'Í∞êÏÇ¨?©Îãà?? 24?úÍ∞Ñ ?¥Ïóê Î©òÌÜ†Îß??ÅÎã¥???ÑÌï¥ ?¥Î©î?ºÎ°ú ?∞ÎùΩ?úÎ¶¨Í≤†Ïäµ?àÎã§.' 
            : 'Thank you! We will contact you via email within 24 hours for mentoring consultation.';
    } else if (interest === 'jobs') {
        successMessage = currentLanguage === 'ko' 
            ? '?ºÏûêÎ¶??†Ï≤≠???ÑÎ£å?òÏóà?µÎãà?? Í≥??∞ÎùΩ?úÎ¶¨Í≤†Ïäµ?àÎã§.' 
            : 'Job application completed! We will contact you soon.';
        modalTitle = currentLanguage === 'ko' ? '?ºÏûêÎ¶??†Ï≤≠ ?ÑÎ£å' : 'Job Application Complete';
        modalText = currentLanguage === 'ko' 
            ? 'Í∞êÏÇ¨?©Îãà?? 24?úÍ∞Ñ ?¥Ïóê ?àÏ†Ñ???ºÏûêÎ¶?Í∏∞ÌöåÎ•??¥Î©î?ºÎ°ú ?àÎÇ¥?úÎ¶¨Í≤†Ïäµ?àÎã§.' 
            : 'Thank you! We will contact you via email within 24 hours with safe job opportunities.';
    } else {
        successMessage = currentLanguage === 'ko' 
            ? '?†Ï≤≠???ÑÎ£å?òÏóà?µÎãà?? Í≥??∞ÎùΩ?úÎ¶¨Í≤†Ïäµ?àÎã§.' 
            : 'Application completed! We will contact you soon.';
        modalTitle = currentLanguage === 'ko' ? '?†Ï≤≠ ?ÑÎ£å' : 'Application Complete';
        modalText = currentLanguage === 'ko' 
            ? 'Í∞êÏÇ¨?©Îãà?? 24?úÍ∞Ñ ?¥Ïóê ?¥Î©î?ºÎ°ú ?∞ÎùΩ?úÎ¶¨Í≤†Ïäµ?àÎã§.' 
            : 'Thank you! We will contact you via email within 24 hours.';
    }
    
    // ?±Í≥µ Î©îÏãúÏßÄ ?úÏãú
    showNotification(successMessage, 'success');
    
    // ??Î¶¨ÏÖã
    document.getElementById('email-form').reset();
    
    // Î™®Îã¨ ?úÏãú
    showModal(modalTitle, modalText);
}

// Î™®Îã¨ Ï¥àÍ∏∞??
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
    
    // ?¥Î©î???¨Ï†Ñ?àÏïΩ ??Ï≤òÎ¶¨
    const emailModalForm = document.getElementById('email-modal-form');
    if (emailModalForm) {
        emailModalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEmailPreRegistration();
        });
    }
}

// Î™®Îã¨ ?úÏãú
function showModal(title, text, modalId = 'modal') {
    const modal = document.getElementById(modalId);
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    
    if (modalId === 'modal') {
        if (modalTitle) modalTitle.textContent = title;
        if (modalText) modalText.textContent = text;
    }
    
    modal.style.display = 'block';
    
    // CTA ?ÑÌôò ?ºÎÑê ?ÖÎç∞?¥Ìä∏
    trackingData.conversionFunnel.modal_open++;
    
    // Í≥†Í∏â Î™®Îã¨ ?∏Îûò??
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
    
    // GA4 ?¥Î≤§???ÑÏÜ°
    if (typeof gtag !== 'undefined') {
        gtag('event', 'modal_open', {
            event_category: 'cta_funnel',
            event_label: modalData.event_label,
            value: modalId === 'email-modal' ? 50 : 20, // Î¶¨Îìú Ï∫°Ï≤ò Î™®Îã¨?Ä ???íÏ? Í∞ÄÏπ?
            custom_parameters: modalData
        });
    }
    
    // Î™®Îã¨ ?úÏãú ?¥Î≤§???∏Îûò??(Í∏∞Ï°¥)
    trackEvent('modal_show', {
        title: title,
        modal_id: modalId,
        language: currentLanguage
    });
    
    console.log('Modal Tracking:', modalData);
}

// ?¥Î©î???¨Ï†Ñ?àÏïΩ Î™®Îã¨ ?úÏãú
function showEmailModal() {
    const emailModal = document.getElementById('email-modal');
    emailModal.style.display = 'block';
    
    // CTA ?ÑÌôò ?ºÎÑê ?ÖÎç∞?¥Ìä∏ (???úÏûë)
    trackingData.conversionFunnel.form_start++;
    
    // Í≥†Í∏â ?¥Î©î??Î™®Îã¨ ?∏Îûò??
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
        value: 75, // ?¥Î©î??Ï∫°Ï≤ò Í∞ÄÏπ?
        currency: 'KRW'
    };
    
    // GA4 ?¥Î≤§???ÑÏÜ°
    if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', { // ?ÑÌôò ?ºÎÑê???úÏûë?êÏúºÎ°??¨Ïö©
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
    
    // ?¥Î©î??Î™®Îã¨ ?úÏãú ?¥Î≤§???∏Îûò??(Í∏∞Ï°¥)
    trackEvent('email_modal_show', {
        language: currentLanguage,
        ab_variant: abTestVariant
    });
    
    console.log('Email Modal Tracking:', emailModalData);
}

// ?ÑÌôò ?ïÎ•† Í≥ÑÏÇ∞ (Î®∏Ïã†?¨Îãù ?§Ì????àÏ∏°)
function calculateConversionProbability() {
    const timeOnPage = Date.now() - trackingData.startTime;
    const ctaClicks = Object.values(trackingData.ctaClicks).reduce((a, b) => a + b, 0);
    const interactions = ctaInteractions.length;
    
    // Í∞ÑÎã®???êÏàò Í∏∞Î∞ò ?ïÎ•† Í≥ÑÏÇ∞
    let probability = 0.1; // Í∏∞Î≥∏ 10%
    
    // ?úÍ∞Ñ ?îÏÜå (30Ï¥??¥ÏÉÅ Ï≤¥Î•ò??Ï¶ùÍ?)
    if (timeOnPage > 30000) probability += 0.2;
    if (timeOnPage > 60000) probability += 0.1;
    
    // ?∏ÌÑ∞?ôÏÖò ?îÏÜå
    if (ctaClicks > 0) probability += 0.3;
    if (ctaClicks > 1) probability += 0.2;
    if (interactions > 3) probability += 0.1;
    
    // A/B ?åÏä§??Î≥Ä?ïÎ≥Ñ Ï°∞Ï†ï
    if (abTestVariant === 'B') probability += 0.05;
    
    return Math.min(probability, 0.9); // ÏµúÎ? 90%
}

// Î™®Îã¨ ?®Í∏∞Í∏?
function hideModal(modalId = 'modal') {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    
    // Î™®Îã¨ ?´Í∏∞ ?¥Î≤§???∏Îûò??
    trackEvent('modal_close', {
        modal_id: modalId,
        language: currentLanguage
    });
}

// ?¥Î©î???¨Ï†Ñ?àÏïΩ Ï≤òÎ¶¨
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
    
    // ?†Ìö®??Í≤Ä??
    if (!validateEmail(email)) {
        showNotification(
            currentLanguage === 'ko' 
                ? '?¨Î∞îÎ•??¥Î©î??Ï£ºÏÜåÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.' 
                : 'Please enter a valid email address.',
            'error'
        );
        return;
    }
    
    if (!validateName(name)) {
        showNotification(
            currentLanguage === 'ko' 
                ? '?¥Î¶Ñ??2-50???¨Ïù¥Î°??ÖÎ†•?¥Ï£º?∏Ïöî.' 
                : 'Please enter a name between 2-50 characters.',
            'error'
        );
        return;
    }
    
    if (!validateCountry(country)) {
        showNotification(
            currentLanguage === 'ko' 
                ? 'Íµ??Î•?2-50???¨Ïù¥Î°??ÖÎ†•?¥Ï£º?∏Ïöî.' 
                : 'Please enter a country between 2-50 characters.',
            'error'
        );
        return;
    }
    
    if (!service) {
        showNotification(
            currentLanguage === 'ko' 
                ? 'Í¥Ä???úÎπÑ?§Î? ?†ÌÉù?¥Ï£º?∏Ïöî.' 
                : 'Please select a service interest.',
            'error'
        );
        return;
    }
    
    // ?¥Î©î???¨Ï†Ñ?àÏïΩ ?¥Î≤§???∏Îûò??
    trackEvent('email_preregistration', {
        email: email,
        name: name,
        service: service,
        country: country,
        language: currentLanguage,
        ab_variant: abTestVariant
    });
    
    // ?±Í≥µ Î©îÏãúÏßÄ ?úÏãú
    showNotification(
        currentLanguage === 'ko' 
            ? '?¨Ï†Ñ?àÏïΩ???ÑÎ£å?òÏóà?µÎãà?? ?úÎπÑ???§Ìîà ??Í∞Ä??Î®ºÏ? ?∞ÎùΩ?úÎ¶¨Í≤†Ïäµ?àÎã§.' 
            : 'Pre-registration completed! We will contact you first when our service opens.',
        'success'
    );
    
    // ??Î¶¨ÏÖã
    form.reset();
    
    // Î™®Îã¨ ?´Í∏∞
    hideModal('email-modal');
    
    // ?±Í≥µ Î™®Îã¨ ?úÏãú
    showModal(
        currentLanguage === 'ko' ? '?¨Ï†Ñ?àÏïΩ ?ÑÎ£å' : 'Pre-registration Complete',
        currentLanguage === 'ko' 
            ? 'Í∞êÏÇ¨?©Îãà?? ?úÎπÑ???§Ìîà ??Í∞Ä??Î®ºÏ? ?¥Î©î?ºÎ°ú ?∞ÎùΩ?úÎ¶¨Í≤†Ïäµ?àÎã§.' 
            : 'Thank you! We will contact you first via email when our service opens.'
    );
}

// ?åÎ¶º ?úÏãú
function showNotification(message, type = 'info') {
    // Í∞ÑÎã®???åÎ¶º Íµ¨ÌòÑ (?§Ï†úÎ°úÎäî ???ïÍµê???åÎ¶º ?úÏä§???¨Ïö©)
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

// ?úÍ∞Ñ Ï∂îÏ†Å ?úÏûë
function startTimeTracking() {
    setInterval(() => {
        trackingData.timeOnPage = Date.now() - trackingData.startTime;
    }, 1000);
}

// ?¥Î≤§???∏Îûò??
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
    
    // GA4 ?¥Î≤§???ÑÏÜ°
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: data.category || 'engagement',
            event_label: data.label || eventName,
            value: data.value || 1,
            custom_parameters: data
        });
    }
    
    // ÏΩòÏÜî??Î°úÍ∑∏ (Í∞úÎ∞ú??
    console.log('Event tracked:', eventData);
    
    // Î°úÏª¨ ?§ÌÜ†Î¶¨Ï????Ä??(Î∞±ÏóÖ??
    const events = JSON.parse(localStorage.getItem('trackingEvents') || '[]');
    events.push(eventData);
    
    // ÏµúÍ∑º 100Í∞??¥Î≤§?∏Îßå ?†Ï?
    if (events.length > 100) {
        events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('trackingEvents', JSON.stringify(events));
    
    // ?¥Î¶≠ Ïπ¥Ïö¥???ÖÎç∞?¥Ìä∏
    if (trackingData.clicks[eventName]) {
        trackingData.clicks[eventName]++;
    } else {
        trackingData.clicks[eventName] = 1;
    }
}

// ?òÏù¥ÏßÄ ?∏Î°ú????ÏµúÏ¢Ö ?∞Ïù¥???ÑÏÜ°
window.addEventListener('beforeunload', function() {
    // ÏµúÏ¢Ö ?¥Î≤§???∏Îûò??
    trackEvent('page_exit', {
        time_on_page: trackingData.timeOnPage,
        total_clicks: Object.keys(trackingData.clicks).length,
        language: currentLanguage,
        ab_variant: abTestVariant
    });
});

// CTA Î≤ÑÌäº ?¥Î≤§???∏Îì§???µÌï©
document.addEventListener('click', function(e) {
    const target = e.target;
    const buttonText = target.textContent.trim();
    
    // ?¥Î©î???¨Ï†Ñ?àÏïΩ Î™®Îã¨???úÏãú?¥Ïïº ?òÎäî Î≤ÑÌäº??
    const emailModalButtons = [
        'Get Started',
        'Apply for Free Consultation',
        'Apply for Mentoring',
        'Apply for Jobs',
        'Pre-register Now',
        'Start Right Now'
    ];
    
    // ?¥Î©î???¨Ï†Ñ?àÏïΩ Î™®Îã¨ ?úÏãú
    if (emailModalButtons.some(text => buttonText.includes(text)) || 
        target.classList.contains('cta-btn') && 
        (buttonText.includes('Get Started') || buttonText.includes('Apply') || buttonText.includes('Start'))) {
        e.preventDefault();
        showEmailModal();
        return;
    }
    
    // ?πÏ†ï IDÎ•?Í∞ÄÏß?Î≤ÑÌäº??
    if (target.id === 'hero-cta' || target.id === 'mentor-cta') {
        e.preventDefault();
        showEmailModal();
        return;
    }
    
    // ?©Î≤ï??Ï≤¥ÌÅ¨ ?ÑÏ???
    if (target.id === 'legality-check' || target.id === 'wizard-cta') {
        e.preventDefault();
        showModal(
            currentLanguage === 'ko' ? '?©Î≤ï??Ï≤¥ÌÅ¨ ?ÑÏ??? : 'Legality Check Wizard',
            currentLanguage === 'ko' 
                ? '?ÑÏû¨ ?úÎπÑ?§Î? Ï§ÄÎπ?Ï§ëÏûÖ?àÎã§. ?¥Î©î?ºÎ°ú ?∞ÎùΩ?úÎ¶¨Î©?Ï≤¥ÌÅ¨ ?ÑÍµ¨Î•??úÍ≥µ?¥ÎìúÎ¶¨Í≤†?µÎãà??' 
                : 'We are currently preparing this service. We will provide the check tool via email when we contact you.'
        );
        return;
    }
    
    // Í≤ÄÏ¶?Í≥µÍ≥† Î≥¥Í∏∞
    if (target.id === 'jobs-cta') {
        e.preventDefault();
        showModal(
            currentLanguage === 'ko' ? 'Í≤ÄÏ¶ùÎêú ?ºÏûêÎ¶? : 'Verified Jobs',
            currentLanguage === 'ko' 
                ? '?ÑÏû¨ ?úÎπÑ?§Î? Ï§ÄÎπ?Ï§ëÏûÖ?àÎã§. ?¥Î©î?ºÎ°ú ?∞ÎùΩ?úÎ¶¨Î©?Í≤ÄÏ¶ùÎêú ?ºÏûêÎ¶?Î™©Î°ù???úÍ≥µ?¥ÎìúÎ¶¨Í≤†?µÎãà??' 
                : 'We are currently preparing this service. We will provide a list of verified jobs via email when we contact you.'
        );
        return;
    }
});

// CSS ?†ÎãàÎ©îÏù¥??Ï∂îÍ?
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

// Í∞úÎ∞ú???ÑÍµ¨???®Ïàò??(?ÑÎ°ú?ïÏÖò?êÏÑú???úÍ±∞)
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
        // ?åÏä§???¥Î¶≠ ?úÎ??àÏù¥??
        element.click();
        console.log('CTA click simulated');
        
        // ?±Í≥º Î¶¨Ìè¨??Ï∂úÎ†•
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
    
    // 1. ?òÏù¥ÏßÄ Î∑?(?¥Î? ?ÑÎ£å)
    console.log('??Page view tracked');
    
    // 2. CTA ?∏Î≤Ñ ?úÎ??àÏù¥??
    setTimeout(() => {
        trackCTAInteraction('hero-cta', 'hover');
        console.log('??CTA hover simulated');
    }, 1000);
    
    // 3. CTA ?¥Î¶≠ ?úÎ??àÏù¥??
    setTimeout(() => {
        const heroBtn = document.getElementById('hero-cta');
        if (heroBtn) {
            heroBtn.click();
            console.log('??CTA click simulated');
        }
    }, 2000);
    
    // 4. ???úÏ∂ú ?úÎ??àÏù¥??(3Ï¥???
    setTimeout(() => {
        trackCTAConversion('mentoring', {
            email: 'test@example.com',
            conversionValue: 100
        });
        console.log('??Conversion simulated');
        
        // ÏµúÏ¢Ö Î¶¨Ìè¨??
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

// CTA A/B ?åÏä§??Í≤∞Í≥º Î∂ÑÏÑù
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

