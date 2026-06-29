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

  /* ── 10. TV STATIC — ruido animado sobre todo el sitio (post-hero) ── */
  const staticCanvas = document.getElementById('tvStatic');

  if (staticCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const sCtx = staticCanvas.getContext('2d');

    // Ajustar el tamaño del canvas al viewport
    const resizeStatic = () => {
      // Usamos resolución reducida (÷3) para mejor rendimiento y grano más visible
      staticCanvas.width  = Math.ceil(window.innerWidth  / 3);
      staticCanvas.height = Math.ceil(window.innerHeight / 3);
    };
    resizeStatic();
    window.addEventListener('resize', resizeStatic, { passive: true });

    // Velocidad 9 → FRAME_SKIP = 10 - 9 = 1 (casi cada frame)
    const FRAME_SKIP = 1;
    let sFrame = 0;

    const drawStatic = () => {
      const w = staticCanvas.width;
      const h = staticCanvas.height;
      if (!w || !h) return;
      const imageData = sCtx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255 | 0;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 255;
      }
      sCtx.putImageData(imageData, 0, 0);
    };

    // El canvas debe ser visible sólo cuando ya pasamos el hero
    const hero = document.querySelector('.hero');
    const showStaticOnScroll = () => {
      if (!hero) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      staticCanvas.style.visibility = heroBottom <= 0 ? 'visible' : 'hidden';
    };
    window.addEventListener('scroll', showStaticOnScroll, { passive: true });
    showStaticOnScroll();

    (function loop() {
      if (++sFrame % FRAME_SKIP === 0) drawStatic();
      requestAnimationFrame(loop);
    })();
  }

  /* ── 11. SELECTOR DE CURSOS — filtros ─────────────────── */
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
          // re-trigger reveal animation
          card.classList.remove('visible');
          setTimeout(() => card.classList.add('visible'), 50);
        } else {
          card.dataset.hidden = true;
        }
      });
    });
  });

  /* ── 12. MODAL — detalle de curso ──────────────────────── */
  const modal        = document.getElementById('cursoModal');
  const modalBackdrop = modal?.querySelector('.curso-modal__backdrop');
  const modalClose   = modal?.querySelector('.curso-modal__close');

  // Datos de cada curso
  const cursosData = {
    'guitarra-clasica-inicial': {
      title:    'Guitarra Clásica<br>Nivel Inicial',
      nivel:    'Inicial',
      nivelClass: 'nivel-inicial',
      duracion: '12 semanas',
      cupos:    '8 alumnos',
      inicio:   'Agosto 2025',
      img:      'assets/images/curso_01.jpg',
      desc:     'El programa más completo del taller. Construís tu propia guitarra clásica de principio a fin, aprendiendo cada etapa del oficio con acompañamiento personalizado. No se requiere experiencia previa.',
      temario:  ['Selección y secado de maderas','Construcción de tapa harmónica','Aros y fondo: doblado y ensamble','Tallado y encolado del mástil','Instalación de trastes y cejuela','Lacado nitrocelulósico y acabado','Puesta a punto y regulación final'],
    },
    'guitarra-acustica-intermedio': {
      title:    'Guitarra Acústica<br>Nivel Intermedio',
      nivel:    'Intermedio',
      nivelClass: 'nivel-intermedio',
      duracion: '10 semanas',
      cupos:    '6 alumnos',
      inicio:   'Septiembre 2025',
      img:      'assets/images/curso_02.jpg',
      desc:     'Diseñado para quienes ya tienen nociones del oficio. Profundizamos en acústica aplicada, diseño de bracings, tapas delgadas y técnicas de lacado avanzadas.',
      temario:  ['Acústica aplicada a la luthería','Bracings: patrones y efectos sonoros','Tapas de espesor variable','Técnicas de encolado en frío','Lacado y pulido de alta calidad','Ajuste de acción y afinación'],
    },
    'lutheria-electrica': {
      title:    'Luthería<br>Eléctrica',
      nivel:    'Avanzado',
      nivelClass: 'nivel-avanzado',
      duracion: '8 semanas',
      cupos:    '6 alumnos',
      inicio:   'Octubre 2025',
      img:      'assets/images/curso_03.jpg',
      desc:     'Construí tu propia guitarra eléctrica sólida o semi-hollow incluyendo enrutado de pastillas, electrónica básica y ajuste de puente flotante.',
      temario:  ['Diseño de cuerpos sólidos y semi-hollow','Enrutado de cavidades y puentes','Instalación de pastillas y controles','Cableado y electrónica básica','Pinturas sólidas y metalflake','Ajuste de puente Floyd Rose y hasta'],
    },
    'reparacion-restauracion': {
      title:    'Reparación<br>& Restauración',
      nivel:    'Restauración',
      nivelClass: 'nivel-restauracion',
      duracion: '6 semanas',
      cupos:    '10 alumnos',
      inicio:   'Julio 2025',
      img:      'assets/images/proceso_03.jpg',
      desc:     'Aprendé a diagnosticar, reparar y devolver la vida a instrumentos dañados. Desde grietas y deformaciones hasta refrets completos y ajustes de mástil.',
      temario:  ['Diagnóstico de patologías comunes','Reparación de grietas y fracturas','Reemplazo y nivelación de trastes','Ajuste y enderezado de mástiles','Restauración de acabados originales','Configuración profesional de la acción'],
    },
  };

  const openModal = (cursoId) => {
    const data = cursosData[cursoId];
    if (!data || !modal) return;

    // Poblar modal
    modal.querySelector('#modalImg').src        = data.img;
    modal.querySelector('#modalImg').alt        = data.title.replace('<br>', ' ');
    modal.querySelector('#modalTitle').innerHTML = data.title;
    const nivelEl = modal.querySelector('#modalNivel');
    nivelEl.textContent  = data.nivel;
    nivelEl.className    = `selector-card__nivel ${data.nivelClass}`;
    modal.querySelector('#modalDuracion').textContent = data.duracion;
    modal.querySelector('#modalCupos').textContent    = data.cupos;
    modal.querySelector('#modalInicio').textContent   = data.inicio;
    modal.querySelector('#modalDesc').textContent     = data.desc;

    const temarioEl = modal.querySelector('#modalTemario');
    temarioEl.innerHTML = data.temario
      .map(item => `<li>${item}</li>`)
      .join('');

    // Mostrar
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('open'));
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 500);
  };

  // Delegar click en botones de selector-card
  document.querySelector('.selector-cursos__list')?.addEventListener('click', e => {
    const btn = e.target.closest('.selector-card__btn');
    if (!btn) return;
    const card = btn.closest('.selector-card');
    openModal(card?.dataset.curso);
  });

  modalBackdrop?.addEventListener('click', closeModal);
  modalClose?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  /* ── 13. MADERAS — carrusel drag + nav + progreso ─────── */
  const maderasStage   = document.getElementById('maderasStage');
  const maderasPrev    = document.getElementById('maderasPrev');
  const maderasNext    = document.getElementById('maderasNext');
  const maderasIdxEl   = document.getElementById('maderasIdx');
  const maderasProgress= document.getElementById('maderasProgress');
  const maderasDragHint= document.getElementById('maderasDragHint');

  if (maderasStage) {
    const slides   = maderasStage.querySelectorAll('.madera-slide');
    const total    = slides.length;
    let   hasScrolled = false;

    // Actualizar índice y barra de progreso
    const updateMaderasUI = () => {
      const scrollLeft = maderasStage.scrollLeft;
      const maxScroll  = maderasStage.scrollWidth - maderasStage.clientWidth;
      const progress   = maxScroll > 0 ? scrollLeft / maxScroll : 0;

      // Progreso
      if (maderasProgress) {
        maderasProgress.style.width = (progress * 100) + '%';
      }

      // Índice activo (slide visible a la izquierda del viewport del stage)
      let activeIdx = 0;
      slides.forEach((slide, i) => {
        const slideLeft = slide.offsetLeft - maderasStage.offsetLeft;
        if (scrollLeft >= slideLeft - 40) activeIdx = i;
      });
      if (maderasIdxEl) {
        maderasIdxEl.textContent = String(activeIdx + 1).padStart(2, '0');
      }

      // Ocultar drag hint al primer scroll
      if (!hasScrolled && scrollLeft > 10) {
        hasScrolled = true;
        maderasDragHint?.classList.add('hidden');
      }
    };

    maderasStage.addEventListener('scroll', updateMaderasUI, { passive: true });
    updateMaderasUI();

    // Botones prev/next — desplazan un slide
    const scrollToSlide = (dir) => {
      const slideW = slides[0]?.offsetWidth + 24 || 504;
      maderasStage.scrollBy({ left: dir * slideW, behavior: 'smooth' });
    };
    maderasPrev?.addEventListener('click', () => scrollToSlide(-1));
    maderasNext?.addEventListener('click', () => scrollToSlide(1));

    // Drag mouse
    let mDown = false, mStartX = 0, mScrollLeft = 0;
    maderasStage.addEventListener('mousedown', e => {
      mDown = true;
      maderasStage.style.userSelect = 'none';
      mStartX = e.pageX - maderasStage.offsetLeft;
      mScrollLeft = maderasStage.scrollLeft;
    });
    ['mouseleave','mouseup'].forEach(ev =>
      maderasStage.addEventListener(ev, () => { mDown = false; maderasStage.style.userSelect = ''; })
    );
    maderasStage.addEventListener('mousemove', e => {
      if (!mDown) return;
      e.preventDefault();
      const x = e.pageX - maderasStage.offsetLeft;
      maderasStage.scrollLeft = mScrollLeft - (x - mStartX) * 1.3;
    });

    // Touch drag
    let tStartX = 0, tScrollLeft = 0;
    maderasStage.addEventListener('touchstart', e => {
      tStartX = e.touches[0].pageX;
      tScrollLeft = maderasStage.scrollLeft;
    }, { passive: true });
    maderasStage.addEventListener('touchmove', e => {
      maderasStage.scrollLeft = tScrollLeft - (e.touches[0].pageX - tStartX);
    }, { passive: true });

    // Animar barras al entrar el stage en viewport
    const barsObs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            maderasStage.classList.add('bars-visible');
            barsObs.unobserve(maderasStage);
          }
        });
      },
      { threshold: 0.15 }
    );
    barsObs.observe(maderasStage);
  }

});
