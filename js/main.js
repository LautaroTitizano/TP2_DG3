/* ============================================================
   TRASTES — JavaScript principal (Exposed Grid system)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 0. HERO — título con efecto de tipeo ──────────────── */
  const heroTitle = document.querySelector('.hero__title[data-typewriter]');
  if (heroTitle) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lines = [];
    try { lines = JSON.parse(heroTitle.dataset.typewriter); } catch (e) { lines = []; }
    const fullText = heroTitle.getAttribute('aria-label') || lines.join(' ');

    if (reduceMotion || !lines.length) {
      heroTitle.innerHTML = lines.map((l, i) =>
        `<span class="typed-line${i === lines.length - 1 ? ' accent' : ''}">${l}</span>`
      ).join('');
    } else {
      heroTitle.innerHTML = '';
      heroTitle.classList.add('typing-active');
      heroTitle.setAttribute('role', 'text');

      const speed = 42;      // ms por caracter
      const linePause = 140; // pausa entre líneas
      let lineIndex = 0, charIndex = 0;
      let currentLineEl = null;
      let cursorEl = null;

      const startLine = () => {
        currentLineEl = document.createElement('span');
        currentLineEl.className = 'typed-line' + (lineIndex === lines.length - 1 ? ' accent' : '');
        cursorEl = document.createElement('span');
        cursorEl.className = 'typed-cursor';
        cursorEl.textContent = '\u00A0';
        currentLineEl.appendChild(cursorEl);
        heroTitle.appendChild(currentLineEl);
        charIndex = 0;
        typeChar();
      };

      const typeChar = () => {
        const line = lines[lineIndex];
        if (charIndex < line.length) {
          cursorEl.insertAdjacentText('beforebegin', line[charIndex]);
          charIndex++;
          setTimeout(typeChar, speed);
        } else {
          lineIndex++;
          if (lineIndex < lines.length) {
            setTimeout(startLine, linePause);
          } else {
            setTimeout(() => { cursorEl.remove(); heroTitle.classList.remove('typing-active'); }, 900);
          }
        }
      };

      setTimeout(startLine, 300);
    }
  }

  /* ── 0.5 NAV MOBILE — menú hamburguesa ─────────────────── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks   = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    const openMenu = () => {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'Cerrar menú');
      navLinks.classList.add('is-open');
      document.body.classList.add('nav-open');
    };
    const closeMenu = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú');
      navLinks.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    };
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        navToggle.focus();
      }
    });
    // Si la pantalla vuelve a escritorio con el menú abierto, lo cerramos
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) closeMenu();
    });
  }

  /* ── 1. NAV: scroll effect ─────────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 2. REVEAL on scroll ───────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObs.observe(el));

  /* ── 3. EL ARTE DETRÁS DEL SONIDO — Acordeón (una sola apertura) ── */
  const arteItems = document.querySelectorAll('.arte__item');
  arteItems.forEach(item => {
    const header = item.querySelector('.arte__item-header');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      arteItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.arte__item-header').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
      }
    });

    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); header.click(); }
    });
  });

  /* ── 4. MAPA DE GUITARRA — hotspots interactivos ───────── */
  const hotspots   = document.querySelectorAll('.hotspot');
  const panelEmpty = document.querySelector('.mapa__panel-empty');
  const panels     = document.querySelectorAll('.mapa__panel-content');

  const activateHotspot = (target) => {
    hotspots.forEach(h => h.setAttribute('aria-pressed', h.dataset.part === target ? 'true' : 'false'));
    panels.forEach(p => p.classList.toggle('active', p.dataset.part === target));
    if (panelEmpty) panelEmpty.style.display = 'none';
  };

  hotspots.forEach(h => {
    h.addEventListener('click', () => activateHotspot(h.dataset.part));
  });
  // Activar el primero por defecto en escritorio
  if (hotspots.length && window.innerWidth > 900) {
    activateHotspot(hotspots[0].dataset.part);
  }

  /* ── 6. VIDEO — luce como póster, reproduce al hacer clic ─ */
  const videoWrapper = document.querySelector('.video-wrapper');
  const videoEl      = document.querySelector('.video-wrapper video');
  if (videoWrapper && videoEl) {
    videoWrapper.addEventListener('click', () => {
      if (videoEl.paused) {
        videoEl.muted = false;
        videoEl.play().catch(() => { videoEl.muted = true; videoEl.play(); });
      } else {
        videoEl.pause();
      }
    });
  }

  /* ── 7. CURSOS — drag scroll (carrusel) ────────────────── */
  const rail = document.querySelector('.cursos__rail');
  if (rail) {
    let isDown = false, startX = 0, scrollLeft = 0;
    rail.addEventListener('mousedown', e => {
      isDown = true; rail.style.userSelect = 'none';
      startX = e.pageX - rail.offsetLeft; scrollLeft = rail.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach(ev =>
      rail.addEventListener(ev, () => { isDown = false; rail.style.userSelect = ''; })
    );
    rail.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      rail.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  }

  /* ── 8. STATS — count-up compacto ──────────────────────── */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(update);
  };
  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const item = e.target;
        item.classList.add('visible');
        const valEl = item.querySelector('.stat-item__value[data-target]');
        if (valEl) countUp(valEl);
        statsObs.unobserve(item);
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.stat-item').forEach(el => statsObs.observe(el));

  /* ── 9. PROCESO steps — línea de tiempo con nota musical ─ */
  const procesoStepsWrap = document.querySelector('.proceso__steps');
  const procesoSteps = document.querySelectorAll('.proceso__step');
  if (procesoStepsWrap && procesoSteps.length) {
    procesoSteps.forEach(step => {
      step.addEventListener('click', () => {
        const wasActive = step.classList.contains('active');
        procesoSteps.forEach(s => s.classList.remove('active'));
        if (!wasActive) {
          step.classList.add('active');
          procesoStepsWrap.classList.add('has-active');
        } else {
          procesoStepsWrap.classList.remove('has-active');
        }
      });
    });
  }

  /* ── 10. PÚAS DE MADERA — panel "código" abre/cierra ───── */
  const pickCards = document.querySelectorAll('.pick-card');
  const toggleEnabled = window.matchMedia('(hover: none)').matches;
  pickCards.forEach(card => {
    card.addEventListener('click', () => {
      const wasOpen = card.classList.contains('open');
      pickCards.forEach(c => c.classList.remove('open'));
      if (!wasOpen) card.classList.add('open');
    });
  });

  /* ── 11. GALERÍA — lightbox simple ─────────────────────── */
  const galeriaItems = document.querySelectorAll('.galeria-item');
  if (galeriaItems.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox__inner">
        <button class="lightbox__close" aria-label="Cerrar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <img class="lightbox__img" src="" alt="">
      </div>`;
    document.body.appendChild(lightbox);
    Object.assign(lightbox.style, {
      position: 'fixed', inset: 0, background: 'rgba(17,17,17,0.95)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: 0, pointerEvents: 'none', transition: 'opacity .25s ease',
    });
    const lbInner = lightbox.querySelector('.lightbox__inner');
    Object.assign(lbInner.style, { position: 'relative', maxWidth: '90vw', maxHeight: '90svh' });
    const lbImg = lightbox.querySelector('.lightbox__img');
    Object.assign(lbImg.style, { display: 'block', maxWidth: '100%', maxHeight: '90svh', objectFit: 'contain' });
    const lbClose = lightbox.querySelector('.lightbox__close');
    Object.assign(lbClose.style, { position: 'absolute', top: '-44px', right: 0, background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' });

    const openLightbox = (src) => {
      lbImg.src = src;
      lightbox.style.opacity = 1;
      lightbox.style.pointerEvents = 'all';
      document.body.style.overflow = 'hidden';
    };
    const closeLightbox = () => {
      lightbox.style.opacity = 0;
      lightbox.style.pointerEvents = 'none';
      document.body.style.overflow = '';
    };
    galeriaItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (img) openLightbox(img.src);
      });
    });
    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ── 12. GRANO SUTIL + LUZ QUE SIGUE EL MOUSE ──────────── */
  /* Reemplaza el antiguo efecto "TV" (ruido + scanlines). Ahora es un grano
     fijo muy sutil, más una luz difuminada que aparece al pasar el cursor. */
  function createGrainAndSpotlight(section) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  

    // Luz difuminada que sigue el mouse
    const spot = document.createElement('div');
    spot.className = 'mouse-spot';
    spot.setAttribute('aria-hidden', 'true');
    section.appendChild(spot);
    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      spot.style.setProperty('--mx', x + '%');
      spot.style.setProperty('--my', y + '%');
      spot.classList.add('active');
    });
    section.addEventListener('mouseleave', () => spot.classList.remove('active'));
  }
  const statSection = document.querySelector('.stats');
  const videoSection2 = document.querySelector('.video-section');
  if (statSection) createGrainAndSpotlight(statSection);
  if (videoSection2) createGrainAndSpotlight(videoSection2);

  /* ── 13. FAQ — Acordeón ─────────────────────────────────── */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq__answer').style.setProperty('--ans-h', '0px');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.setProperty('--ans-h', answer.scrollHeight + 'px');
      }
    });
  });

  /* ── 13.5 TESTIMONIOS — carrusel horizontal con botones ── */
  const testiTrack = document.getElementById('testimonios-track');
  const testiPrev  = document.getElementById('testi-prev');
  const testiNext  = document.getElementById('testi-next');
  if (testiTrack && testiPrev && testiNext) {
    const scrollByCard = (dir) => {
      const card = testiTrack.querySelector('.testimonio-card');
      const gap = 1; // separación entre columnas (background visible como línea)
      const amount = card ? card.getBoundingClientRect().width + gap : testiTrack.clientWidth * 0.8;
      testiTrack.scrollBy({ left: dir * amount, behavior: 'smooth' });
    };
    const updateButtons = () => {
      const max = testiTrack.scrollWidth - testiTrack.clientWidth - 2;
      testiPrev.disabled = testiTrack.scrollLeft <= 0;
      testiNext.disabled = testiTrack.scrollLeft >= max;
    };
    testiPrev.addEventListener('click', () => scrollByCard(-1));
    testiNext.addEventListener('click', () => scrollByCard(1));
    testiTrack.addEventListener('scroll', updateButtons, { passive: true });
    testiTrack.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); scrollByCard(-1); }
    });
    window.addEventListener('resize', updateButtons);
    updateButtons();
  }

  /* ── 14. SELECTOR DE CURSOS — filtros ──────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const selectorCards = document.querySelectorAll('.selector-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      selectorCards.forEach(card => {
        const nivel = card.dataset.nivel;
        if (filter === 'all' || nivel === filter) {
          delete card.dataset.hidden;
          card.classList.remove('visible');
          setTimeout(() => card.classList.add('visible'), 50);
        } else {
          card.dataset.hidden = true;
        }
      });
    });
  });

  /* Nota: las cards de "Ver detalles" son enlaces <a> normales (misma pestaña),
     así el botón "atrás" del navegador funciona como en cualquier sitio. */

});
