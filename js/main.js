/* ===================================
   ARK Construction v2 — Main JavaScript
   Premium Scroll Experience (Deniot-style)
   =================================== */

document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('header');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Shared scroll state (outer scope for anchor nav integration) ---
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isDesktopInertia = !isTouchDevice && window.innerWidth > 768 && !prefersReducedMotion;
    let scrollTarget = window.scrollY;
    let scrollCurrent = window.scrollY;
    let scrollTicking = false;

    // --- Header scroll effect ---
    const handleHeaderScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // --- Mobile menu ---
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    const navLinks = nav.querySelectorAll('.nav__link');

    burger.addEventListener('click', () => {
        burger.classList.toggle('burger--active');
        nav.classList.toggle('nav--open');
        document.body.style.overflow = nav.classList.contains('nav--open') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('burger--active');
            nav.classList.remove('nav--open');
            document.body.style.overflow = '';
        });
    });

    const navCta = nav.querySelector('.nav__cta a');
    if (navCta) {
        navCta.addEventListener('click', () => {
            burger.classList.remove('burger--active');
            nav.classList.remove('nav--open');
            document.body.style.overflow = '';
        });
    }

    // --- Smooth scroll for anchor links (integrated with inertia) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                const headerHeight = header.offsetHeight;
                const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;

                if (isDesktopInertia) {
                    // Use inertia system — set scrollTarget, animation loop handles the rest
                    scrollTarget = Math.max(0, Math.min(
                        targetPos,
                        document.documentElement.scrollHeight - window.innerHeight
                    ));
                    if (!scrollTicking) {
                        scrollTicking = true;
                        requestAnimationFrame(smoothStep);
                    }
                } else {
                    window.scrollTo({ top: targetPos, behavior: 'smooth' });
                }
            }
        });
    });

    // --- Reveal system (replaces data-aos) ---
    if (!prefersReducedMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const el = entry.target;
                const parent = el.parentElement;
                const siblings = parent ? Array.from(parent.children).filter(
                    c => c.hasAttribute('data-reveal')
                ) : [];

                const index = siblings.indexOf(el);
                const staggerDelay = index >= 0 ? index * 120 : 0;

                setTimeout(() => {
                    el.classList.add('is-visible');
                }, staggerDelay);

                revealObserver.unobserve(el);
            });
        }, {
            threshold: 0.08,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('[data-reveal]').forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Reduced motion: show everything immediately
        document.querySelectorAll('[data-reveal]').forEach(el => {
            el.classList.add('is-visible');
        });
    }

    // --- Scroll-triggered background color gradient ---
    const bgSections = document.querySelectorAll('[data-bg]');

    if (bgSections.length) {
        const hexToRgb = (hex) => {
            const h = hex.replace('#', '');
            return [
                parseInt(h.substring(0, 2), 16),
                parseInt(h.substring(2, 4), 16),
                parseInt(h.substring(4, 6), 16)
            ];
        };

        const rgbToHex = (r, g, b) => {
            return '#' + [r, g, b].map(v =>
                Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')
            ).join('');
        };

        const isDark = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) < 128;

        let waypoints = [];

        const buildWaypoints = () => {
            const totalHeight = document.documentElement.scrollHeight;
            waypoints = Array.from(bgSections).map(sec => ({
                position: sec.offsetTop / totalHeight,
                color: sec.dataset.bg
            }));
        };

        buildWaypoints();
        window.addEventListener('resize', buildWaypoints);

        const initColor = hexToRgb(bgSections[0].dataset.bg);
        let currentR = initColor[0], currentG = initColor[1], currentB = initColor[2];
        let bgAnimating = false;

        const getTargetColor = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const t = scrollable > 0 ? window.scrollY / scrollable : 0;

            let prev = waypoints[0];
            let next = waypoints[waypoints.length - 1];

            for (let i = 0; i < waypoints.length - 1; i++) {
                if (t >= waypoints[i].position && t <= waypoints[i + 1].position) {
                    prev = waypoints[i];
                    next = waypoints[i + 1];
                    break;
                }
            }

            const range = next.position - prev.position;
            const linearT = range > 0 ? (t - prev.position) / range : 0;
            const easedT = linearT * linearT * (3 - 2 * linearT);

            const a = hexToRgb(prev.color);
            const b = hexToRgb(next.color);
            return [
                a[0] + (b[0] - a[0]) * easedT,
                a[1] + (b[1] - a[1]) * easedT,
                a[2] + (b[2] - a[2]) * easedT
            ];
        };

        const BG_INERTIA = 0.025; // Slower bg transition (was 0.035)

        const animateColor = () => {
            const [targetR, targetG, targetB] = getTargetColor();

            currentR += (targetR - currentR) * BG_INERTIA;
            currentG += (targetG - currentG) * BG_INERTIA;
            currentB += (targetB - currentB) * BG_INERTIA;

            document.body.style.backgroundColor = rgbToHex(currentR, currentG, currentB);

            if (isDark(currentR, currentG, currentB)) {
                header.classList.add('header--dark');
            } else {
                header.classList.remove('header--dark');
            }

            if (Math.abs(targetR - currentR) > 0.5 ||
                Math.abs(targetG - currentG) > 0.5 ||
                Math.abs(targetB - currentB) > 0.5) {
                requestAnimationFrame(animateColor);
            } else {
                bgAnimating = false;
            }
        };

        const startBgAnimation = () => {
            if (!bgAnimating) {
                bgAnimating = true;
                requestAnimationFrame(animateColor);
            }
        };

        document.body.classList.add('scroll-gradient-active');
        document.body.style.backgroundColor = rgbToHex(currentR, currentG, currentB);
        window.addEventListener('scroll', startBgAnimation, { passive: true });
    }

    // --- Heavy inertia scroll (desktop only) ---
    if (isDesktopInertia) {
        const SCROLL_EASE = 0.045; // Heavier feel (was 0.075)
        const MAX_DELTA = 150;     // Clamp wildly different mouse/trackpad values

        window.addEventListener('wheel', (e) => {
            e.preventDefault();

            // Normalize deltaY across different input devices
            let delta = e.deltaY;
            if (e.deltaMode === 1) delta *= 40;  // DOM_DELTA_LINE
            if (e.deltaMode === 2) delta *= 800; // DOM_DELTA_PAGE
            delta = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, delta));

            scrollTarget += delta;
            scrollTarget = Math.max(0, Math.min(
                scrollTarget,
                document.documentElement.scrollHeight - window.innerHeight
            ));

            if (!scrollTicking) {
                scrollTicking = true;
                requestAnimationFrame(smoothStep);
            }
        }, { passive: false });

        function smoothStep() {
            scrollCurrent += (scrollTarget - scrollCurrent) * SCROLL_EASE;
            window.scrollTo(0, scrollCurrent);

            if (Math.abs(scrollTarget - scrollCurrent) > 0.5) {
                requestAnimationFrame(smoothStep);
            } else {
                scrollTicking = false;
            }
        }

        // Sync on keyboard/programmatic scroll
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                scrollTarget = window.scrollY;
                scrollCurrent = window.scrollY;
            }
        }, { passive: true });
    }

    // --- Section scroll-fade (focus effect) ---
    // Disabled on mobile (<768px) because per-scroll opacity writes were causing
    // repaint jitter inside horizontal carousels (Marina 1705, 1712).
    const fadeSections = document.querySelectorAll('[data-scroll-fade]');

    if (fadeSections.length && !prefersReducedMotion && window.innerWidth >= 768) {
        const updateSectionFade = () => {
            const viewportCenter = window.scrollY + window.innerHeight / 2;

            fadeSections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionCenter = sectionTop + sectionHeight / 2;
                const distance = Math.abs(viewportCenter - sectionCenter);
                const maxDistance = window.innerHeight;

                // 1.0 when centered, 0.85 when far away
                const opacity = Math.max(0.85, 1 - (distance / maxDistance) * 0.15);
                section.style.opacity = opacity;
            });
        };

        window.addEventListener('scroll', updateSectionFade, { passive: true });
        updateSectionFade();
    }

    // --- Active nav link highlight on scroll ---
    const sections = document.querySelectorAll('section[id]');

    const highlightNav = () => {
        const scrollPos = window.scrollY + header.offsetHeight + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');
            const link = nav.querySelector(`a[href="#${id}"]`);

            if (link) {
                if (scrollPos >= top && scrollPos < bottom) {
                    link.classList.add('nav__link--active');
                } else {
                    link.classList.remove('nav__link--active');
                }
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });

    // --- Phone input mask ---
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value[0] === '7' || value[0] === '8') {
                    value = value.substring(0, 11);
                    let formatted = '+7';
                    if (value.length > 1) formatted += ' (' + value.substring(1, 4);
                    if (value.length > 4) formatted += ') ' + value.substring(4, 7);
                    if (value.length > 7) formatted += '-' + value.substring(7, 9);
                    if (value.length > 9) formatted += '-' + value.substring(9, 11);
                    e.target.value = formatted;
                }
            }
        });

        phoneInput.addEventListener('focus', (e) => {
            if (!e.target.value) {
                e.target.value = '+7';
            }
        });
    }

    // --- Contact form handler ---
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = contactForm.querySelector('#name').value.trim();
            const phone = contactForm.querySelector('#phone').value.trim();
            const phoneDigits = phone.replace(/\D/g, '');

            if (!name || name.length < 2) {
                contactForm.querySelector('#name').focus();
                return;
            }

            if (phoneDigits.length !== 11) {
                contactForm.querySelector('#phone').focus();
                return;
            }

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;

            // TODO: отправка на Formspree/EmailJS
            btn.textContent = 'Заявка отправлена!';
            btn.style.backgroundColor = 'var(--color-success)';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);
        });
    }

    // Parallax hero-фото: при скролле контент едет обычной скоростью,
    // а фоновая картинка сильно медленнее — создаёт ощущение "тяжести" фона
    const heroBgImg = document.querySelector('.hero__bg-img');
    if (heroBgImg && !prefersReducedMotion) {
        let parallaxTarget = 0;
        let parallaxCurrent = 0;
        let parallaxRafId = null;

        const updateHeroParallax = () => {
            // Smooth interpolation к целевому значению — тяжёлый "инерционный" скролл
            parallaxCurrent += (parallaxTarget - parallaxCurrent) * 0.12;
            heroBgImg.style.transform = `translate3d(0, ${parallaxCurrent}px, 0)`;
            if (Math.abs(parallaxTarget - parallaxCurrent) > 0.1) {
                parallaxRafId = requestAnimationFrame(updateHeroParallax);
            } else {
                parallaxRafId = null;
            }
        };

        const onScroll = () => {
            parallaxTarget = window.scrollY * 0.18;
            if (!parallaxRafId) {
                parallaxRafId = requestAnimationFrame(updateHeroParallax);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Page scrubber — тонкий вертикальный ползунок слева (запрос Николая 1587)
    const scrubber = document.querySelector('.page-scrubber');
    const scrubberTrack = scrubber ? scrubber.querySelector('.page-scrubber__track') : null;
    const scrubberThumb = scrubber ? scrubber.querySelector('.page-scrubber__thumb') : null;
    if (scrubber && scrubberTrack && scrubberThumb) {
        const updateScrubberFromScroll = () => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const pct = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
            scrubberThumb.style.top = `${pct * 100}%`;
            scrubber.classList.toggle('is-visible', window.scrollY > 200);
        };
        window.addEventListener('scroll', updateScrubberFromScroll, { passive: true });
        updateScrubberFromScroll();

        // Inertial interpolation: target follows finger, page catches up smoothly
        // (Nikolai 1715 — don't snap, ease towards the drag point)
        let targetScroll = window.scrollY;
        let scrubRaf = null;
        const scrubTick = () => {
            const current = window.scrollY;
            const diff = targetScroll - current;
            if (Math.abs(diff) < 0.5) {
                window.scrollTo(0, targetScroll);
                scrubRaf = null;
                return;
            }
            window.scrollTo(0, current + diff * 0.18);
            scrubRaf = requestAnimationFrame(scrubTick);
        };

        const scrollToClientY = (clientY) => {
            const rect = scrubberTrack.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            targetScroll = pct * maxScroll;
            if (!scrubRaf) scrubRaf = requestAnimationFrame(scrubTick);
        };

        let isDragging = false;
        const onTouchStart = (e) => {
            isDragging = true;
            scrubber.classList.add('is-dragging');
            if (e.touches && e.touches[0]) scrollToClientY(e.touches[0].clientY);
        };
        const onTouchMove = (e) => {
            if (!isDragging || !e.touches || !e.touches[0]) return;
            scrollToClientY(e.touches[0].clientY);
        };
        const onTouchEnd = () => {
            isDragging = false;
            scrubber.classList.remove('is-dragging');
        };
        scrubber.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd);

        scrubber.addEventListener('click', (e) => {
            scrollToClientY(e.clientY);
        });
    }

    // Navigation FAB — плавающая кнопка "в начало" (запрос Марины 1584, 1598)
    const navFab = document.querySelector('.nav-fab');
    const navFabTop = document.querySelector('.nav-fab__btn--top');
    if (navFab && navFabTop) {
        const navFabToggle = () => {
            navFab.classList.toggle('is-visible', window.scrollY > 400);
        };
        window.addEventListener('scroll', navFabToggle, { passive: true });
        navFabToggle();

        navFabTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});
