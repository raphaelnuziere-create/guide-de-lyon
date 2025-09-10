// Application JavaScript Enhanced - Guide de Lyon v6
class GuideAppEnhanced {
    constructor() {
        this.currentLanguage = 'fr';
        this.translations = this.loadTranslations();
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupLanguageSelector();
        this.setupSmoothScrolling();
        this.setupSearchForm();
        this.setupSectorCards();
        this.setupLazyLoading();
        this.setupScrollAnimations();
        this.setupNewsletterForm();
        this.setupSocialTracking();
        this.initWeatherUpdate();
    }

    // Traductions multi-langues
    loadTranslations() {
        return {
            fr: {
                search_placeholder: "Rechercher un établissement, un événement...",
                search_button: "Rechercher",
                events_title: "Événements à Lyon",
                directory_title: "Annuaire par secteur",
                news_title: "Actualités",
                newsletter_title: "Restez informé avec notre newsletter",
                newsletter_subtitle: "Choisissez la fréquence qui vous convient",
                newsletter_daily: "Quotidien",
                newsletter_weekly: "Hebdomadaire", 
                newsletter_monthly: "Mensuel",
                newsletter_daily_desc: "Chaque matin : événements du jour, météo Lyon, actualités fraîches",
                newsletter_weekly_desc: "Événements de la semaine à venir, actualités, articles de blog",
                newsletter_monthly_desc: "Portrait du mois lyonnais, dossiers exclusifs, sélection premium",
                email_placeholder: "Votre email",
                subscribe_button: "S'inscrire",
                privacy_notice: "Nous respectons votre vie privée. Désabonnement en un clic.",
                companies: "Entreprises",
                events_month: "Événements/mois",
                visitors_month: "Visiteurs/mois",
                satisfaction: "Satisfaction"
            },
            en: {
                search_placeholder: "Search establishments, events...",
                search_button: "Search",
                events_title: "Events in Lyon",
                directory_title: "Business Directory",
                news_title: "Latest News",
                newsletter_title: "Stay informed with our newsletter",
                newsletter_subtitle: "Choose the frequency that suits you",
                newsletter_daily: "Daily",
                newsletter_weekly: "Weekly",
                newsletter_monthly: "Monthly",
                newsletter_daily_desc: "Every morning: daily events, Lyon weather, fresh news",
                newsletter_weekly_desc: "Upcoming week events, news, blog articles",
                newsletter_monthly_desc: "Lyon monthly portrait, exclusive features, premium selection",
                email_placeholder: "Your email",
                subscribe_button: "Subscribe",
                privacy_notice: "We respect your privacy. One-click unsubscribe.",
                companies: "Companies",
                events_month: "Events/month",
                visitors_month: "Visitors/month",
                satisfaction: "Satisfaction"
            },
            it: {
                search_placeholder: "Cerca attività, eventi...",
                search_button: "Cerca",
                events_title: "Eventi a Lione",
                directory_title: "Elenco Attività",
                news_title: "Ultime Notizie",
                newsletter_title: "Rimani informato con la nostra newsletter",
                newsletter_subtitle: "Scegli la frequenza che ti conviene",
                newsletter_daily: "Quotidiano",
                newsletter_weekly: "Settimanale",
                newsletter_monthly: "Mensile",
                newsletter_daily_desc: "Ogni mattina: eventi del giorno, meteo Lione, notizie fresche",
                newsletter_weekly_desc: "Eventi della settimana prossima, notizie, articoli blog",
                newsletter_monthly_desc: "Ritratto mensile di Lione, contenuti esclusivi, selezione premium",
                email_placeholder: "La tua email",
                subscribe_button: "Iscriviti",
                privacy_notice: "Rispettiamo la tua privacy. Cancellazione con un clic.",
                companies: "Aziende",
                events_month: "Eventi/mese",
                visitors_month: "Visitatori/mese", 
                satisfaction: "Soddisfazione"
            },
            cn: {
                search_placeholder: "搜索商家、活动...",
                search_button: "搜索",
                events_title: "里昂活动",
                directory_title: "商家名录",
                news_title: "最新资讯",
                newsletter_title: "订阅我们的通讯",
                newsletter_subtitle: "选择适合您的频率",
                newsletter_daily: "每日",
                newsletter_weekly: "每周",
                newsletter_monthly: "每月",
                newsletter_daily_desc: "每天早上：当日活动，里昂天气，最新资讯",
                newsletter_weekly_desc: "下周活动，新闻，博客文章",
                newsletter_monthly_desc: "里昂月度精选，独家内容，优质推荐",
                email_placeholder: "您的邮箱",
                subscribe_button: "订阅",
                privacy_notice: "我们尊重您的隐私。一键取消订阅。",
                companies: "企业",
                events_month: "活动/月",
                visitors_month: "访客/月",
                satisfaction: "满意度"
            }
        };
    }

    // Sélecteur de langue
    setupLanguageSelector() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.switchLanguage(lang);
                
                // Update active state
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;
        const translations = this.translations[lang];
        
        // Update text content
        const elements = {
            '.search-input': 'search_placeholder',
            '.search-button span': 'search_button',
            '.events-section .section-title': 'events_title',
            '.directory-section .section-title': 'directory_title',
            '.news-section .section-title': 'news_title',
            '.newsletter-title': 'newsletter_title',
            '.newsletter-subtitle': 'newsletter_subtitle',
            '.newsletter-email': 'email_placeholder',
            '.newsletter-submit': 'subscribe_button',
            '.newsletter-privacy': 'privacy_notice'
        };

        Object.entries(elements).forEach(([selector, key]) => {
            const element = document.querySelector(selector);
            if (element) {
                if (element.tagName === 'INPUT') {
                    element.placeholder = translations[key];
                } else {
                    element.textContent = translations[key];
                }
            }
        });

        // Update trust indicators labels
        document.querySelectorAll('.trust-label').forEach((label, index) => {
            const keys = ['companies', 'events_month', 'visitors_month', 'satisfaction'];
            if (keys[index]) {
                label.textContent = translations[keys[index]];
            }
        });

        // Store language preference
        localStorage.setItem('guide_lyon_lang', lang);
    }

    // Newsletter form enhanced
    setupNewsletterForm() {
        const form = document.querySelector('.newsletter-form');
        const radios = document.querySelectorAll('.newsletter-radio');
        
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = form.querySelector('.newsletter-email').value;
                const selectedFrequency = document.querySelector('.newsletter-radio:checked')?.value || 'weekly';
                
                if (this.validateEmail(email)) {
                    this.subscribeNewsletter(email, selectedFrequency);
                } else {
                    this.showNotification('Email invalide', 'error');
                }
            });
        }

        // Newsletter option animations
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                // Add selection animation
                const label = radio.nextElementSibling;
                label.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    label.style.transform = '';
                }, 200);
            });
        });
    }

    async subscribeNewsletter(email, frequency) {
        try {
            // Simulate API call
            await this.delay(1000);
            
            this.showNotification(`Inscription réussie ! Vous recevrez notre newsletter ${frequency}.`, 'success');
            
            // Reset form
            document.querySelector('.newsletter-form').reset();
            
            // Analytics
            this.trackEvent('newsletter_subscribe', { frequency, email_domain: email.split('@')[1] });
            
        } catch (error) {
            this.showNotification('Erreur lors de l\'inscription. Veuillez réessayer.', 'error');
        }
    }

    // Enhanced weather update
    initWeatherUpdate() {
        this.updateWeatherData();
        // Update weather every 30 minutes
        setInterval(() => this.updateWeatherData(), 30 * 60 * 1000);
    }

    async updateWeatherData() {
        try {
            // Simulate weather API call
            const weatherData = await this.fetchWeatherData();
            this.updateWeatherDisplay(weatherData);
        } catch (error) {
            console.log('Weather update failed, using default data');
        }
    }

    async fetchWeatherData() {
        // Simulate API call with realistic Lyon weather data
        await this.delay(500);
        
        const baseTemp = Math.floor(Math.random() * 15) + 8; // 8-23°C
        return {
            today: {
                morning: baseTemp,
                afternoon: baseTemp + Math.floor(Math.random() * 6) + 3,
                icon: ['🌤️', '☀️', '⛅', '🌥️'][Math.floor(Math.random() * 4)]
            },
            tomorrow: {
                morning: baseTemp + Math.floor(Math.random() * 4) - 2,
                afternoon: baseTemp + Math.floor(Math.random() * 6) + 2,
                icon: ['☀️', '⛅', '🌤️'][Math.floor(Math.random() * 3)]
            },
            dayAfter: {
                morning: baseTemp + Math.floor(Math.random() * 6) - 3,
                afternoon: baseTemp + Math.floor(Math.random() * 8),
                icon: ['🌧️', '⛅', '🌤️', '🌦️'][Math.floor(Math.random() * 4)]
            }
        };
    }

    updateWeatherDisplay(data) {
        const weatherItems = document.querySelectorAll('.weather-item');
        
        if (weatherItems.length >= 3) {
            // Update today
            const todayIcon = weatherItems[0].querySelector('.weather-icon');
            const todayMorning = weatherItems[0].querySelector('.temp-morning');
            const todayAfternoon = weatherItems[0].querySelector('.temp-afternoon');
            
            if (todayIcon) todayIcon.textContent = data.today.icon;
            if (todayMorning) todayMorning.textContent = `Matin: ${data.today.morning}°C`;
            if (todayAfternoon) todayAfternoon.textContent = `Après-midi: ${data.today.afternoon}°C`;
            
            // Update tomorrow
            const tomorrowIcon = weatherItems[1].querySelector('.weather-icon');
            const tomorrowMorning = weatherItems[1].querySelector('.temp-morning');
            const tomorrowAfternoon = weatherItems[1].querySelector('.temp-afternoon');
            
            if (tomorrowIcon) tomorrowIcon.textContent = data.tomorrow.icon;
            if (tomorrowMorning) tomorrowMorning.textContent = `Matin: ${data.tomorrow.morning}°C`;
            if (tomorrowAfternoon) tomorrowAfternoon.textContent = `Après-midi: ${data.tomorrow.afternoon}°C`;
            
            // Update day after
            const dayAfterIcon = weatherItems[2].querySelector('.weather-icon');
            const dayAfterMorning = weatherItems[2].querySelector('.temp-morning');
            const dayAfterAfternoon = weatherItems[2].querySelector('.temp-afternoon');
            
            if (dayAfterIcon) dayAfterIcon.textContent = data.dayAfter.icon;
            if (dayAfterMorning) dayAfterMorning.textContent = `Matin: ${data.dayAfter.morning}°C`;
            if (dayAfterAfternoon) dayAfterAfternoon.textContent = `Après-midi: ${data.dayAfter.afternoon}°C`;
        }
    }

    // Social media tracking
    setupSocialTracking() {
        document.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = link.href.includes('facebook') ? 'facebook' : 'instagram';
                this.trackEvent('social_click', { platform });
            });
        });
    }

    // Enhanced mobile menu
    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.nav-menu');

        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
                
                // Animate hamburger
                this.animateHamburger(toggle);
            });
        }
    }

    animateHamburger(toggle) {
        const spans = toggle.querySelectorAll('span');
        spans.forEach((span, index) => {
            span.style.transition = 'all 0.3s ease';
            if (toggle.classList.contains('active')) {
                switch(index) {
                    case 0:
                        span.style.transform = 'rotate(45deg) translate(6px, 6px)';
                        break;
                    case 1:
                        span.style.opacity = '0';
                        break;
                    case 2:
                        span.style.transform = 'rotate(-45deg) translate(6px, -6px)';
                        break;
                }
            } else {
                span.style.transform = '';
                span.style.opacity = '';
            }
        });
    }

    // Enhanced search with suggestions
    setupSearchForm() {
        const form = document.querySelector('.search-form');
        const input = document.querySelector('.search-input');

        if (form && input) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = input.value.trim();
                if (query) {
                    this.performSearch(query);
                }
            });

            // Enhanced suggestions with debouncing
            input.addEventListener('input', this.debounce((e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.showSearchSuggestions(query);
                } else {
                    this.hideSearchSuggestions();
                }
            }, 300));

            // Close suggestions on click outside
            document.addEventListener('click', (e) => {
                if (!form.contains(e.target)) {
                    this.hideSearchSuggestions();
                }
            });
        }
    }

    async showSearchSuggestions(query) {
        const suggestions = await this.getSearchSuggestions(query);
        
        if (suggestions.length > 0) {
            this.renderSuggestions(suggestions);
        }
    }

    async getSearchSuggestions(query) {
        // Simulate API call with realistic suggestions
        await this.delay(200);
        
        const suggestions = [
            'Restaurant Paul Bocuse',
            'Musée des Confluences', 
            'Parc de la Tête d\'Or',
            'Vieux Lyon',
            'Basilique Notre-Dame de Fourvière',
            'Place Bellecour',
            'Traboules du Vieux Lyon',
            'Hôtel de Ville',
            'Opéra de Lyon',
            'Marché de la Croix-Rousse'
        ];

        return suggestions.filter(s => 
            s.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }

    // Enhanced sector cards with parallax
    setupSectorCards() {
        document.querySelectorAll('.sector-card').forEach(card => {
            card.addEventListener('click', () => {
                const sector = card.dataset.sector;
                this.trackEvent('sector_click', { sector });
                window.location.href = `/annuaire/${sector}`;
            });

            // Parallax hover effect
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                const rotateY = (x - 0.5) * 15;
                const rotateX = (0.5 - y) * 15;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });
    }

    // Enhanced scroll animations with intersection observer
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Staggered animation for grids
                    if (entry.target.classList.contains('news-item') || 
                        entry.target.classList.contains('sector-card')) {
                        const delay = Array.from(entry.target.parentNode.children)
                                         .indexOf(entry.target) * 100;
                        entry.target.style.animationDelay = `${delay}ms`;
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px 0px'
        });

        // Observe elements with staggered animations
        document.querySelectorAll('.sector-card, .news-item, .trust-item, .newsletter-option').forEach(el => {
            observer.observe(el);
        });
    }

    // Utility functions
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    trackEvent(event, data) {
        // Enhanced analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', event, data);
        }
        
        // Local analytics
        console.log('Event tracked:', event, data);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Enhanced lazy loading with fade-in animation
    setupLazyLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        img.style.opacity = '0';
                        
                        img.onload = () => {
                            img.style.transition = 'opacity 0.3s ease';
                            img.style.opacity = '1';
                        };
                        
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    performSearch(query) {
        this.trackEvent('search', { query });
        window.location.href = `/recherche?q=${encodeURIComponent(query)}`;
    }

    renderSuggestions(suggestions) {
        let container = document.querySelector('.search-suggestions');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'search-suggestions';
            container.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border-radius: 0 0 12px 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                z-index: 10;
                max-height: 200px;
                overflow-y: auto;
            `;
            document.querySelector('.search-container').appendChild(container);
        }

        container.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-item" data-query="${suggestion}" style="
                padding: 12px 20px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background 0.2s ease;
            ">${suggestion}</div>`
        ).join('');

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-item')) {
                document.querySelector('.search-input').value = e.target.dataset.query;
                this.hideSearchSuggestions();
                this.performSearch(e.target.dataset.query);
            }
        });
    }

    hideSearchSuggestions() {
        const container = document.querySelector('.search-suggestions');
        if (container) {
            container.remove();
        }
    }
}

// Add CSS animations
const enhancedStyles = `
<style>
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.animate-in {
    animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.suggestion-item:hover {
    background: #f8f9fa !important;
}

@media (max-width: 768px) {
    .nav-menu.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        border-radius: 0 0 12px 12px;
    }
}
</style>
`;

// Inject enhanced styles
document.head.insertAdjacentHTML('beforeend', enhancedStyles);

// Initialize enhanced app
document.addEventListener('DOMContentLoaded', () => {
    new GuideAppEnhanced();
});