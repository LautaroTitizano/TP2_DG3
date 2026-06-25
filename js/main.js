/* ============================================================
   LUTHERIA — JavaScript principal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. NAV: scroll effect ─────────────────────────────── */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 2. REVEAL on scroll ───────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach(el => revealObs.observe(el));

  /* ── 3. ARTE DETRÁS DEL SONIDO — Acordeón ─────────────── */
  const arteItems = document.querySelectorAll('.arte__item');

  arteItems.forEach(item => {
    const header = item.querySelector('.arte__item-header');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Cerrar todos
      arteItems.forEach(i => i.classList.remove('open'));

      // Abrir el seleccionado si estaba cerrado
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  /* ── 4. VIDEO SECTION — dark mode on scroll ────────────── */
  const videoSection = document.querySelector('.video-section');

  if (videoSection) {
    const videoObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          videoSection.classList.toggle('dark-mode', e.isIntersecting);
        });
      },
      { threshold: 0.35 }
    );
    videoObs.observe(videoSection);
  }

  /* ── 5. VIDEO — play/pause toggle ─────────────────────── */
  const videoWrapper = document.querySelector('.video-wrapper');
  const videoEl      = document.querySelector('.video-wrapper video');
  const playBtn      = document.querySelector('.video-play-btn');

  if (videoWrapper && videoEl && playBtn) {
    videoWrapper.addEventListener('click', () => {
      if (videoEl.paused) {
        videoEl.play();
        playBtn.style.opacity = '0';
      } else {
        videoEl.pause();
        playBtn.style.opacity = '1';
      }
    });
    videoEl.addEventListener('ended', () => {
      playBtn.style.opacity = '1';
    });
  }

  /* ── 6. CURSOS — drag scroll (carrusel) ────────────────── */
  const rail = document.querySelector('.cursos__rail');
  if (rail) {
    let isDown = false, startX = 0, scrollLeft = 0;

    rail.addEventListener('mousedown', e => {
      isDown = true;
      rail.style.userSelect = 'none';
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach(ev =>
      rail.addEventListener(ev, () => { isDown = false; rail.style.userSelect = ''; })
    );
    rail.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - rail.offsetLeft;
      const walk = (x - startX) * 1.4;
      rail.scrollLeft = scrollLeft - walk;
    });

    // Touch support
    let touchStartX = 0, touchScrollLeft = 0;
    rail.addEventListener('touchstart', e => {
      touchStartX   = e.touches[0].pageX;
      touchScrollLeft = rail.scrollLeft;
    }, { passive: true });
    rail.addEventListener('touchmove', e => {
      const x    = e.touches[0].pageX;
      const walk = touchStartX - x;
      rail.scrollLeft = touchScrollLeft + walk;
    }, { passive: true });
  }

  /* ── 7. STATS — count-up animation ────────────────────── */
  const statValues = document.querySelectorAll('.stat-item__value[data-target]');

  const countUp = (el) => {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const duration = 1800;
    const start    = performance.now();

    const update = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const ease     = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current  = Math.round(ease * target * 10) / 10;
      el.textContent = prefix + current + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = prefix + target + suffix;
    };
    requestAnimationFrame(update);
  };

  const statsObs = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const item = e.target;
          item.classList.add('visible');
          const valEl = item.querySelector('.stat-item__value[data-target]');
          if (valEl) countUp(valEl);
          statsObs.unobserve(item);
        }
      });
    },
    { threshold: 0.25 }
  );
  document.querySelectorAll('.stat-item').forEach(el => statsObs.observe(el));

  /* ── 8. PROCESO steps — hover highlight ───────────────── */
  document.querySelectorAll('.proceso__step').forEach(step => {
    step.addEventListener('mouseenter', () => {
      document.querySelectorAll('.proceso__step').forEach(s =>
        s.style.opacity = '0.4'
      );
      step.style.opacity = '1';
    });
    step.addEventListener('mouseleave', () => {
      document.querySelectorAll('.proceso__step').forEach(s =>
        s.style.opacity = '1'
      );
    });
  });

  /* ── 9. GALERÍA — lightbox simple ─────────────────────── */
  const galeriaItems = document.querySelectorAll('.galeria-item');

  // Crear overlay
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

  // Estilos inline del lightbox
  Object.assign(lightbox.style, {
    position: 'fixed', inset: 0, background: 'rgba(40,38,37,0.95)',
    zIndex: 9999, display: 'flex', alignItems: 'center',
    justifyContent: 'center', opacity: 0, pointerEvents: 'none',
    transition: 'opacity 0.35s ease',
  });
  const lbInner = lightbox.querySelector('.lightbox__inner');
  Object.assign(lbInner.style, {
    position: 'relative', maxWidth: '90vw', maxHeight: '90svh',
  });
  const lbImg = lightbox.querySelector('.lightbox__img');
  Object.assign(lbImg.style, {
    display: 'block', maxWidth: '100%', maxHeight: '90svh',
    objectFit: 'contain', borderRadius: '12px',
  });
  const lbClose = lightbox.querySelector('.lightbox__close');
  Object.assign(lbClose.style, {
    position: 'absolute', top: '-44px', right: 0,
    background: 'transparent', border: 'none', color: '#fff',
    cursor: 'pointer', padding: '8px',
  });

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

  /* ── 10. HERO — parallax leve ─────────────────────────── */
  const heroImg = document.querySelector('.hero__image img');
  if (heroImg && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroImg.style.transform = `translateY(${y * 0.15}px)`;
    }, { passive: true });
  }

});
