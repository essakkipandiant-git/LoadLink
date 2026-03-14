// LoadLink — Main Script
document.addEventListener('DOMContentLoaded', () => {

    // --- Authentication Navigation Logic ---
    const currentUserStr = localStorage.getItem('currentUser');
    const navLogin = document.getElementById('nav-login');
    const navUserMenu = document.getElementById('nav-user-menu');
    const userDisplay = document.getElementById('user-display');
    const navLogout = document.getElementById('nav-logout');

    if (currentUserStr) {
        const user = JSON.parse(currentUserStr);
        if (navLogin) navLogin.classList.add('hidden');
        if (navUserMenu) navUserMenu.classList.remove('hidden');
        if (userDisplay) {
            userDisplay.innerText = user.name;
            userDisplay.parentElement.style.cursor = 'pointer';
            userDisplay.parentElement.addEventListener('click', () => window.location.href = 'profile.html');
        }
    } else {
        if (navLogin) navLogin.classList.remove('hidden');
        if (navUserMenu) navUserMenu.classList.add('hidden');

        // Session Guard for posting pages
        const guardedPages = ['post-load.html', 'post-vehicle.html', 'profile.html'];
        const currentPath = window.location.pathname;
        if (guardedPages.some(page => currentPath.includes(page))) {
            window.location.href = 'login.html';
        }
    }

    if (navLogout) {
        navLogout.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.reload();
        });
    }

    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }

        themeToggleBtn.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            }
        });
    }

    // --- Scroll Animations (Intersection Observer) ---
    const fadeElements = document.querySelectorAll('.fade-up');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // --- Accordion Logic ---
    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(acc => {
        acc.addEventListener('click', function() {
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== this.parentElement) item.classList.remove('active');
            });
            this.parentElement.classList.toggle('active');
        });
    });

    // --- Animated Counters ---
    const counters = document.querySelectorAll('.counter');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.innerText = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };

            requestAnimationFrame(updateCounter);
        });
    }

    if (counters.length > 0) {
        const statsSection = document.getElementById('stats-section');
        if (statsSection) {
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounters();
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            counterObserver.observe(statsSection);
        }
    }

    // --- Testimonial Carousel ---
    const carouselCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let autoSlideInterval;

    function goToSlide(index) {
        carouselCards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        if (carouselCards[index]) carouselCards[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % carouselCards.length;
        goToSlide(next);
    }

    if (carouselCards.length > 0) {
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                clearInterval(autoSlideInterval);
                goToSlide(parseInt(dot.getAttribute('data-index')));
                autoSlideInterval = setInterval(nextSlide, 5000);
            });
        });

        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    // --- Mobile Hamburger Menu ---
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navLinks.classList.toggle('mobile-open');
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navLinks.classList.remove('mobile-open');
            });
        });
    }

    // --- Navbar scroll effect ---
    const header = document.getElementById('main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
});
