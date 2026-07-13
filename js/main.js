/* ══════════════════════════════════════════════════════════════════
   TRASTES — main.js
   Interacciones: nav, reveal on scroll, mapa de guitarra, acordeón
   "el arte" (GSAP), galería acordeón + cursor magnético, testimonios,
   FAQ, video, contador de stats.
   ══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  /* ── Utilidad: colapsar/expandir con altura real ─────────────── */
  function expand(el){
    el.style.height = el.scrollHeight + 'px';
  }
  function collapse(el){
    el.style.height = '0px';
  }

  /* ══ 1. NAV — fondo al hacer scroll + menú mobile ═══════════════ */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileClose');

  const onScrollNav = () => {
    if (!nav) return;
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  };
  document.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  function openMobileMenu(){
    mobileMenu.classList.add('mobile-menu--open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }
  function closeMobileMenu(){
    mobileMenu.classList.remove('mobile-menu--open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }
  if (burger && mobileMenu){
    burger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('mobile-menu--open');
      isOpen ? closeMobileMenu() : openMobileMenu();
    });
    mobileClose && mobileClose.addEventListener('click', closeMobileMenu);
    mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  /* ══ 2. REVEAL ON SCROLL — IntersectionObserver ═════════════════ */
  const revealEls = document.querySelectorAll('.reveal, .clip-reveal');
  if ('IntersectionObserver' in window && revealEls.length){
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('reveal--visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('reveal--visible'));
  }

  /* ══ 3. MAPA DE LA GUITARRA — click cambia info adyacente ══════ */
  const parteButtons = document.querySelectorAll('.parte__btn');
  const componentesImage = document.getElementById('componentesImage');

  function setActiveParte(btn){
    parteButtons.forEach(b => {
      const item = b.closest('.parte');
      const body = item.querySelector('.parte__body');
      const isTarget = b === btn;
      item.classList.toggle('parte--active', isTarget);
      b.setAttribute('aria-expanded', String(isTarget));
      if (isTarget){
        expand(body);
      } else {
        collapse(body);
      }
    });
  }

  parteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveParte(btn);
      const src = btn.getAttribute('data-image');
      if (src && componentesImage && componentesImage.getAttribute('src') !== src){
        componentesImage.style.opacity = '0';
        window.setTimeout(() => {
          componentesImage.setAttribute('src', src);
          componentesImage.style.opacity = '1';
        }, 180);
      }
    });
  });
  const initialActive = document.querySelector('.parte--active .parte__btn');
  if (initialActive) setActiveParte(initialActive);

  /* ══ 4. ARTE — SCROLL ACCORDION OPTIMIZADO (GSAP + CUERDA) ══════ */
  const section = document.querySelector('.arte');
  if (section) {
    const items = Array.from(section.querySelectorAll('.arte__item'));
    const numEl = document.getElementById('arteNum');
    const hasGSAP = typeof window.gsap !== 'undefined';
    const hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

    if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    let activeIndex = 0;

    const measure = (item) => {
      const inner = item.querySelector('.arte__item-inner');
      return inner ? inner.getBoundingClientRect().height : 0;
    };

    const setBow = (path, y) => {
      path.setAttribute('d', `M0,12 Q50,${12 + y} 100,12`);
    };

    const pluckLine = (lineEl) => {
      if (!hasGSAP || !lineEl) return;
      const path = lineEl.querySelector('path');
      if (!path) return;
      const proxy = { y: 0 };
      gsap.killTweensOf(proxy);
      gsap.timeline()
        .to(proxy, { y: -7, duration: .08, ease: 'power2.out', onUpdate: () => setBow(path, proxy.y) })
        .to(proxy, { y: 0, duration: 1.2, ease: 'elastic.out(1, 0.35)', onUpdate: () => setBow(path, proxy.y) });
    };

    const setNumber = (index) => {
      if (!numEl) return;
      const next = String(index + 1).padStart(2, '0');
      if (numEl.textContent.trim() === next) return;
      if (!hasGSAP) { numEl.textContent = next; return; }

      gsap.to(numEl, {
        opacity: 0, y: -18, filter: 'blur(8px)', duration: .35, ease: 'power2.in',
        onComplete: () => {
          numEl.textContent = next;
          gsap.fromTo(numEl,
            { opacity: 0, y: 18, filter: 'blur(8px)' },
            { opacity: .08, y: 0, filter: 'blur(0px)', duration: .55, ease: 'power2.out' }
          );
        }
      });
    };

    const openItem = (index) => {
      if (index === activeIndex && items[index].classList.contains('arte__item--active')) return;
      activeIndex = index;

      items.forEach((item, i) => {
        const header = item.querySelector('.arte__item-header');
        const body   = item.querySelector('.arte__item-body');
        const inner  = item.querySelector('.arte__item-inner');
        const isTarget = i === index;

        header.setAttribute('aria-expanded', String(isTarget));
        item.classList.toggle('arte__item--active', isTarget);

        if (isTarget) {
          const h = measure(item);
          if (hasGSAP) {
            gsap.to(body, { height: h, duration: .7, ease: 'power3.out' });
            gsap.fromTo(inner,
              { opacity: 0, y: 26, filter: 'blur(6px)' },
              { opacity: 1, y: 0, filter: 'blur(0px)', duration: .6, delay: .12, ease: 'power2.out' }
            );
          } else {
            body.style.height = h + 'px';
          }
        } else if (hasGSAP) {
          gsap.to(body, { height: 0, duration: .5, ease: 'power2.inOut' });
        } else {
          body.style.height = '0px';
        }
      });

      setNumber(index);
      pluckLine(items[index].querySelector('.arte__item-line'));
    };

    const openFirstImmediately = () => {
      const first = items[0];
      const body = first.querySelector('.arte__item-body');
      const h = measure(first);
      if (hasGSAP) gsap.set(body, { height: h });
      else body.style.height = h + 'px';
    };

    if (hasScrollTrigger) {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 901px)', () => {
        const distance = window.innerHeight * items.length;
        const pinTrigger = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(items.length - 1, Math.floor(self.progress * items.length));
            openItem(idx);
          }
        });
        return () => pinTrigger.kill();
      });

      window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
        const activeItem = items[activeIndex];
        if (activeItem) {
          gsap.set(activeItem.querySelector('.arte__item-body'), { height: measure(activeItem) });
        }
      });
    }

    items.forEach((item, i) => {
      const header = item.querySelector('.arte__item-header');
      header.addEventListener('click', () => openItem(i));

      header.addEventListener('mouseenter', () => {
        if (!window.matchMedia('(hover: hover)').matches) return;
        items.forEach((other, j) => {
          if (j !== i) other.classList.add('arte__item--dimmed');
        });
        const line = item.querySelector('.arte__item-line');
        if (line) line.classList.add('arte__item-line--lit');
        pluckLine(line);
      });

      header.addEventListener('mouseleave', () => {
        items.forEach(other => other.classList.remove('arte__item--dimmed'));
        const line = item.querySelector('.arte__item-line');
        if (line) line.classList.remove('arte__item-line--lit');
      });
    });

    if (document.readyState === 'complete') openFirstImmediately();
    else window.addEventListener('load', openFirstImmediately);
  }

  /* ══ 5. GALERÍA — acordeón horizontal + cursor magnético ═══════ */
  const galeriaAccordion = document.getElementById('galeriaAccordion');
  const galeriaCursor = document.getElementById('galeriaCursor');
  const galeriaCols = document.querySelectorAll('.galeria-col');

  function setGaleriaBackgrounds(){
    galeriaCols.forEach(col => {
      const bg = col.querySelector('.galeria-col__bg');
      const img = col.getAttribute('data-img');
      if (bg && img) bg.style.backgroundImage = `url("${img}")`;
    });
  }
  setGaleriaBackgrounds();

  function activateCol(col){
    galeriaCols.forEach(c => c.classList.toggle('is-active', c === col));
  }
  function deactivateAll(){
    galeriaCols.forEach(c => c.classList.remove('is-active'));
  }

  galeriaCols.forEach(col => {
    col.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover)').matches) activateCol(col);
    });
    col.addEventListener('click', () => {
      const isActive = col.classList.contains('is-active');
      isActive ? deactivateAll() : activateCol(col);
    });
    col.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        const isActive = col.classList.contains('is-active');
        isActive ? deactivateAll() : activateCol(col);
      }
    });
    const closeBtn = col.querySelector('.galeria-col__close');
    closeBtn && closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deactivateAll();
    });
  });

  if (galeriaCols.length && window.matchMedia('(hover: hover)').matches){
    activateCol(galeriaCols[0]);
  }

  if (galeriaAccordion && galeriaCursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    let rafId = null;
    let targetX = 0, targetY = 0, curX = 0, curY = 0;

    function loopCursor(){
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      galeriaCursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%,-50%) scale(1)`;
      rafId = requestAnimationFrame(loopCursor);
    }

    galeriaAccordion.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      galeriaCursor.style.display = 'block';
      galeriaCursor.classList.add('galeria__cursor--visible');
      if (!rafId) loopCursor();
    });
    galeriaAccordion.addEventListener('mouseleave', () => {
      galeriaCursor.classList.remove('galeria__cursor--visible');
    });
  }

  /* ══ 6. TESTIMONIOS — carrusel con controles + dots ═════════════ */
  const carousel = document.getElementById('testimoniosCarousel');
  const prevBtn = document.getElementById('testimoniosPrev');
  const nextBtn = document.getElementById('testimoniosNext');
  const dotsWrap = document.getElementById('testimoniosDots');

  if (carousel){
    const cards = Array.from(carousel.querySelectorAll('.testimonio-card'));

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonios__dot';
      dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
      dot.addEventListener('click', () => scrollToCard(i));
      dotsWrap && dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

    function scrollToCard(i){
      const card = cards[i];
      if (!card) return;
      carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
    }

    function updateDots(){
      const scrollLeft = carousel.scrollLeft;
      let closest = 0;
      let closestDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs(card.offsetLeft - carousel.offsetLeft - scrollLeft);
        if (dist < closestDist){ closestDist = dist; closest = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('testimonios__dot--active', i === closest));
    }

    carousel.addEventListener('scroll', () => {
      window.clearTimeout(carousel._t);
      carousel._t = window.setTimeout(updateDots, 80);
    }, { passive: true });

    prevBtn && prevBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -(cards[0].offsetWidth + 20), behavior: 'smooth' });
    });
    nextBtn && nextBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: cards[0].offsetWidth + 20, behavior: 'smooth' });
    });

    updateDots();
  }

  /* ══ 7. FAQ — acordeón ═══════════════════════════════════════════ */
  document.querySelectorAll('.faq__item').forEach(item => {
    const question = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq__question[aria-expanded="true"]').forEach(q => {
        if (q !== question){
          q.setAttribute('aria-expanded', 'false');
          collapse(q.closest('.faq__item').querySelector('.faq__answer'));
        }
      });
      question.setAttribute('aria-expanded', String(!isOpen));
      isOpen ? collapse(answer) : expand(answer);
    });
  });

  /* ══ 8. VIDEO DEL TALLER ═════════════════════════════════════════ */
  document.querySelectorAll('.video-wrapper').forEach(wrapper => {
    const video = wrapper.querySelector('video');
    if (!video) return;

    let userPaused = false;

    function play(){
      video.play().catch(() => {});
      wrapper.classList.add('is-playing');
    }
    function pause(){
      video.pause();
      wrapper.classList.remove('is-playing');
    }
    function toggle(){
      if (video.paused){ userPaused = false; play(); }
      else { userPaused = true; pause(); }
    }

    wrapper.addEventListener('mouseenter', () => {
      if (!userPaused) play();
    });
    wrapper.addEventListener('click', toggle);
    wrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggle();
      }
    });
  });

  /* ══ 8b. VIDEO-SECTION — inversión de color al ocupar toda la pantalla ══ */
  const videoSection = document.querySelector('.video-section');
  if (videoSection && 'IntersectionObserver' in window){
    const videoSectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        videoSection.classList.toggle('is-inview', entry.intersectionRatio >= 0.98);
      });
    }, { threshold: [0, 0.5, 0.98, 1] });
    videoSectionObserver.observe(videoSection);
  }

  /* ══ 9. STATS — contador numérico al entrar en viewport ═════════ */
  const statValues = document.querySelectorAll('.stat-item__value');
  if ('IntersectionObserver' in window && statValues.length){
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statValues.forEach(el => statObserver.observe(el));
  }

  function animateCount(el){
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400;
    const start = performance.now();

    function frame(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(frame);
  }

  /* ══ 10. PARALLAX SUAVE ══════════════════════════════════════════ */
  const parallaxTargets = document.querySelectorAll('.arte__item-image img, .curso-card__image img');
  if (parallaxTargets.length && window.matchMedia('(prefers-reduced-motion: no-preference)').matches){
    let ticking = false;
    function updateParallax(){
      const vh = window.innerHeight;
      parallaxTargets.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const centerOffset = (rect.top + rect.height / 2 - vh / 2) / vh;
        img.style.transform = `translateY(${centerOffset * 18}px) scale(1.08)`;
      });
      ticking = false;
    }
    document.addEventListener('scroll', () => {
      if (!ticking){
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

})();