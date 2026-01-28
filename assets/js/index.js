// FloodShield Central - Home Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Ensure body is visible on page load
    document.body.style.opacity = '1';
    document.body.style.pointerEvents = 'auto';

    // Initialize Lucide icons
    lucide.createIcons();

    // Add smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetUrl = this.getAttribute('href');
            window.location.href = targetUrl;
        });
    });

    // Add hover effects for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // SOS Button functionality
    const sosBtn = document.querySelector('.sos-btn');
    if (sosBtn) {
        sosBtn.addEventListener('click', function() {
            if (confirm('Bạn có muốn gọi khẩn cấp 115?')) {
                // Simulate emergency call
                alert('Đang kết nối với trung tâm cấp cứu...');
                // In real implementation, this would trigger emergency protocols
            }
        });
    }

    // Mobile menu toggle (small screens)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const headerEl = document.querySelector('header.header-glass');
    if (mobileMenuBtn && headerEl) {
        mobileMenuBtn.addEventListener('click', function() {
            headerEl.classList.toggle('nav-open');
            const expanded = headerEl.classList.contains('nav-open');
            mobileMenuBtn.setAttribute('aria-expanded', expanded);
            // re-create icons inside dynamically shown menu if needed
            lucide.createIcons();
        });

        // Close menu by clicking outside
        document.addEventListener('click', function(e) {
            if (headerEl.classList.contains('nav-open')) {
                const withinHeader = e.target.closest('header.header-glass');
                if (!withinHeader) {
                    headerEl.classList.remove('nav-open');
                    mobileMenuBtn.setAttribute('aria-expanded', false);
                }
            }
        });

        // Close menu with ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (headerEl.classList.contains('nav-open')) {
                    headerEl.classList.remove('nav-open');
                    mobileMenuBtn.setAttribute('aria-expanded', false);
                }
            }
        });
    }

    // Mobile bottom nav: active state & SOS handler
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        const items = bottomNav.querySelectorAll('.bottom-nav-item');
        const current = window.location.pathname.split('/').pop() || 'index.html';

        items.forEach(el => {
            const href = el.getAttribute('href');
            if (href && href === current) {
                el.classList.add('active');
            }

            el.addEventListener('click', function(e) {
                // SOS is a button (no href)
                if (this.classList.contains('sos-bottom-btn')) return;

                if (href) {
                    e.preventDefault();
                    // Fade and navigate for consistency with feature nav
                    document.body.style.opacity = '0';
                    document.body.style.transition = 'opacity 0.25s ease';
                    setTimeout(() => { window.location.href = href; }, 250);
                }
            });
        });

        const sosBtnBottom = bottomNav.querySelector('.sos-bottom-btn');
        if (sosBtnBottom) {
            sosBtnBottom.addEventListener('click', function() {
                if (confirm('Bạn có muốn gọi khẩn cấp 115?')) {
                    alert('Đang kết nối với trung tâm cấp cứu...');
                }
            });
        }
    }

    // Add loading animation for feature cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        // ESC key to go back or close modals
        if (e.key === 'Escape') {
            // Handle escape key if needed
        }

        // Number keys to navigate to features (1-6)
        const key = parseInt(e.key);
        if (key >= 1 && key <= 6) {
            const features = [
                'map.html',
                'report.html',
                'alert.html',
                'chatbot.html',
                'guide.html',
                'dashboard.html'
            ];
            window.location.href = features[key - 1];
        }
    });

    // Add service worker for offline functionality (if needed)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            // Register service worker for offline capabilities
            // navigator.serviceWorker.register('/sw.js');
        });
    }

    // Add performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
        });
    }

    // Add accessibility features
    const focusableElements = document.querySelectorAll('a, button');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #60a5fa';
            this.style.outlineOffset = '2px';
        });

        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });

    // Add theme toggle functionality (if needed in future)
    function toggleTheme() {
        const body = document.body;
        const isDark = body.classList.contains('dark-theme');

        if (isDark) {
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark-theme');
    }

    // Add error handling for failed resource loads
    window.addEventListener('error', function(e) {
        console.error('Resource failed to load:', e.target.src || e.target.href);
    });

    // Add online/offline detection
    window.addEventListener('online', function() {
        console.log('Connection restored');
        // Could show a notification to user
    });

    window.addEventListener('offline', function() {
        console.log('Connection lost');
        // Could show offline mode notification
    });
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add smooth page transitions
document.addEventListener('click', function(e) {
    console.log('Click detected on:', e.target);
    const featureCard = e.target.closest('.feature-card');
    console.log('Feature card found:', featureCard);

    if (featureCard && featureCard.tagName === 'A') {
        console.log('Preventing default for link:', featureCard.href);
        e.preventDefault();
        const href = featureCard.getAttribute('href');

        if (href && href !== '#') {
            console.log('Navigating to:', href);
            // Add fade out effect
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.3s ease';

            setTimeout(() => {
                window.location.href = href;
            }, 300);
        }
    }
});