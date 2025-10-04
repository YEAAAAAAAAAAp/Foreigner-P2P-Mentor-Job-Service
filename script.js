// 전역 변수
let currentLanguage = 'en';
let abTestVariant = null;
let trackingData = {
    pageViews: 0,
    clicks: {},
    formSubmissions: 0,
    timeOnPage: 0,
    startTime: Date.now()
};

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 앱 초기화
function initializeApp() {
    try {
        initializeLanguage();
        initializeABTest();
        initializeServiceSelector();
        initializeEventTracking();
        initializeFAQ();
        initializeFAQTabs();
        initializeScrollAnimations();
        initializeFormHandling();
        initializeModal();
        initializeMobileMenu();
        
        // 페이지 뷰 트래킹
        trackEvent('page_view', { 
            page: 'landing',
            category: 'page_view',
            label: 'landing_page_load'
        });
        
        // 시간 추적 시작
        startTimeTracking();
        
        console.log('MentorMatch Korea app initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        // 기본 기능은 계속 작동하도록 함
    }
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
    // 실제 구현에서는 서버로 데이터 전송
    console.log('Form submitted:', { email, interest, language: currentLanguage });
    
    // 이벤트 트래킹
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
    
    // 모달 표시 이벤트 트래킹
    trackEvent('modal_show', {
        title: title,
        modal_id: modalId,
        language: currentLanguage
    });
}

// 이메일 사전예약 모달 표시
function showEmailModal() {
    const emailModal = document.getElementById('email-modal');
    emailModal.style.display = 'block';
    
    // 이메일 모달 표시 이벤트 트래킹
    trackEvent('email_modal_show', {
        language: currentLanguage,
        ab_variant: abTestVariant
    });
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
        events: JSON.parse(localStorage.getItem('trackingEvents') || '[]')
    };
};

window.clearTrackingData = function() {
    localStorage.removeItem('trackingEvents');
    trackingData = {
        pageViews: 0,
        clicks: {},
        formSubmissions: 0,
        timeOnPage: 0,
        startTime: Date.now()
    };
    console.log('Tracking data cleared');
};
