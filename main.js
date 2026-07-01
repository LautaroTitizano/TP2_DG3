/* ============================================================
   TRASTES — JavaScript principal (Exposed Grid system)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

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

  /* ── 5. VIDEO SECTION — modo oscuro al hacer scroll ────── */
  const videoSection = document.querySelector('.video-section');
  if (videoSection) {
    const videoObs = new IntersectionObserver((entries) => {
      entries.forEach(e => videoSection.classList.toggle('dark-mode', e.isIntersecting));
    }, { threshold: 0.35 });
    videoObs.observe(videoSection);
  }

  /* ── 6. VIDEO — play/pause ─────────────────────────────── */
  const videoWrapper = document.querySelector('.video-wrapper');
  const videoEl      = document.querySelector('.video-wrapper video');
  const playBtn      = document.querySelector('.video-play-btn');
  if (videoWrapper && videoEl && playBtn) {
    videoWrapper.addEventListener('click', () => {
      if (videoEl.paused) { videoEl.play(); playBtn.style.opacity = '0'; }
      else { videoEl.pause(); playBtn.style.opacity = '1'; }
    });
    videoEl.addEventListener('ended', () => { playBtn.style.opacity = '1'; });
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

  /* ── 12. RUIDO TÉCNICO — solo en secciones oscuras ─────── */
  function createDarkStatic(section) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'dark-static-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    section.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const resize = () => {
      canvas.width = Math.ceil(section.offsetWidth / 4);
      canvas.height = Math.ceil(section.offsetHeight / 4);
    };
    resize();
    canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.02;mix-blend-mode:screen;`;
    let isVisible = false, animId = null;
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      if (!w || !h) return;
      const imgData = ctx.createImageData(w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255 | 0;
        d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.fillStyle = 'rgba(0,0,0,0.36)';
      for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    };
    const loop = () => { if (isVisible) { draw(); animId = requestAnimationFrame(loop); } };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        isVisible = e.isIntersecting;
        if (isVisible) { resize(); draw(); animId = requestAnimationFrame(loop); }
        else if (animId) cancelAnimationFrame(animId);
      });
    }, { threshold: 0.05 });
    obs.observe(section);
    window.addEventListener('resize', () => { if (isVisible) resize(); }, { passive: true });
  }
  const statSection = document.querySelector('.stats');
  const videoSection2 = document.querySelector('.video-section');
  if (statSection) createDarkStatic(statSection);
  if (videoSection2) createDarkStatic(videoSection2);

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
