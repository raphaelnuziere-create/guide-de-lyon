// Application JavaScript principal - Guide de Lyon
class GuideApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupSearchForm();
        this.setupSectorCards();
        this.setupLazyLoading();
        this.setupScrollAnimations();
    }

    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.nav-menu');

        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
            });
        }
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

            // Suggestions de recherche
            input.addEventListener('input', this.debounce((e) => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.showSearchSuggestions(query);
                } else {
                    this.hideSearchSuggestions();
                }
            }, 300));
        }
    }

    performSearch(query) {
        // Redirection vers la page de recherche avec le terme
        window.location.href = `/recherche?q=${encodeURIComponent(query)}`;
    }

    showSearchSuggestions(query) {
        // Mock suggestions - à remplacer par un appel API réel
        const suggestions = [
            'Restaurant français Lyon',
            'Événements culturels',
            'Bars à vin',
            'Fitness center',
            'Shopping Confluence'
        ].filter(s => s.toLowerCase().includes(query.toLowerCase()));

        if (suggestions.length > 0) {
            this.renderSuggestions(suggestions);
        }
    }

    renderSuggestions(suggestions) {
        let container = document.querySelector('.search-suggestions');
        
        if (!container) {
            container = document.createElement('div');
            container.className = 'search-suggestions';
            document.querySelector('.search-container').appendChild(container);
        }

        container.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-item" data-query="${suggestion}">${suggestion}</div>`
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

    setupSectorCards() {
        document.querySelectorAll('.sector-card').forEach(card => {
            card.addEventListener('click', () => {
                const sector = card.dataset.sector;
                window.location.href = `/annuaire/${sector}`;
            });

            // Animation hover avec parallax
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                
                const rotateY = (x - 0.5) * 10;
                const rotateX = (0.5 - y) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    setupLazyLoading() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
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

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px 0px'
        });

        // Observer les éléments à animer
        document.querySelectorAll('.sector-card, .news-item, .trust-item').forEach(el => {
            observer.observe(el);
        });
    }

    // Utilitaire debounce
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

    // Gestion du cache local
    static setCache(key, data, expiry = 3600000) { // 1 heure par défaut
        const item = {
            data: data,
            timestamp: Date.now(),
            expiry: expiry
        };
        localStorage.setItem(`guide_lyon_${key}`, JSON.stringify(item));
    }

    static getCache(key) {
        const item = localStorage.getItem(`guide_lyon_${key}`);
        if (!item) return null;

        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp > parsed.expiry) {
            localStorage.removeItem(`guide_lyon_${key}`);
            return null;
        }

        return parsed.data;
    }

    // Performance monitoring
    measurePerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perf = performance.timing;
                    const loadTime = perf.loadEventEnd - perf.navigationStart;
                    console.log(`Page load time: ${loadTime}ms`);
                    
                    // Envoyer les métriques (remplacer par votre endpoint)
                    this.sendAnalytics('page_load_time', loadTime);
                }, 0);
            });
        }
    }

    sendAnalytics(event, value) {
        // Mock analytics - remplacer par Google Analytics, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                'custom_parameter': value
            });
        }
    }
}

// Service Worker pour le cache
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Styles pour les animations CSS
const animationStyles = `
<style>
.search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    z-index: 10;
}

.suggestion-item {
    padding: 12px 20px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    transition: background 0.2s ease;
}

.suggestion-item:hover {
    background: #f8f9fa;
}

.suggestion-item:last-child {
    border-bottom: none;
    border-radius: 0 0 12px 12px;
}

.sector-card, .news-item, .trust-item {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.sector-card.animate-in, .news-item.animate-in, .trust-item.animate-in {
    opacity: 1;
    transform: translateY(0);
}

.sector-card:nth-child(1) { transition-delay: 0.1s; }
.sector-card:nth-child(2) { transition-delay: 0.2s; }
.sector-card:nth-child(3) { transition-delay: 0.3s; }
.sector-card:nth-child(4) { transition-delay: 0.4s; }

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
    
    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
    }
    
    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(6px, -6px);
    }
}
</style>
`;

// Injecter les styles
document.head.insertAdjacentHTML('beforeend', animationStyles);

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    new GuideApp();
});