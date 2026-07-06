/* ============================================================
   TRASTES — main.js v3.0
   Vanilla JS · sin librerías externas
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ══════════════════════════════════════════════════════════
   1. NAV + HERO — switch claro/oscuro por scroll
      La imagen aparece al bajar ~100px, no al salir del hero
   ══════════════════════════════════════════════════════════ */
const HERO_DARK_THRESHOLD = 100; // px de scroll para activar estado oscuro

const applyHeroState = () => {
  const scrolled = window.scrollY > HERO_DARK_THRESHOLD;
  document.body.classList.toggle('hero-dark', scrolled);
};

// Aplica el estado inicial sin esperar scroll
applyHeroState();

// Escucha el scroll con passive:true para no bloquear el render
window.addEventListener('scroll', applyHeroState, { passive: true });

  /* ══════════════════════════════════════════════════════════
   2. MENÚ HAMBURGUESA MOBILE — reemplazar el bloque completo
   ══════════════════════════════════════════════════════════ */
const burger      = document.getElementById('navBurger');
const mobileMenu  = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const mobileLinks = document.querySelectorAll('.mobile-menu__link');

if (burger && mobileMenu) {

  const openMenu = () => {
    mobileMenu.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
    if (mobileClose) mobileClose.focus();
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    burger.focus();
  };

  /* Toggle al hacer clic en el burger */
  burger.addEventListener('click', (e) => {
    e.stopPropagation(); /* evita que el click llegue al document */
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  /* Botón cerrar interno */
  if (mobileClose) {
    mobileClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
    });
  }

  /* Cierre al hacer clic en cualquier enlace del menú */
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  /* Cierre con Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });

  /* Cierre al hacer clic FUERA del menú (no en el burger ni en el propio menú) */
  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !burger.contains(e.target)
    ) {
      closeMenu();
    }
  });

  /* El menú en sí: stopPropagation para que un clic dentro no lo cierre */
  mobileMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}
  /* ══════════════════════════════════════════════════════════
     3. REVEAL on scroll
     ══════════════════════════════════════════════════════════ */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(el => revealObs.observe(el));
  }

  /* ══════════════════════════════════════════════════════════
     4. EL ARTE DETRÁS DEL SONIDO — Acordeón (una apertura)
     ══════════════════════════════════════════════════════════ */
  const arteItems = document.querySelectorAll('.arte__item');
  arteItems.forEach(item => {
    const header = item.querySelector('.arte__item-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Cierra todos
      arteItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.arte__item-header')?.setAttribute('aria-expanded', 'false');
      });
      // Abre el clickeado si estaba cerrado
      if (!isOpen) {
        item.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
      }
    });

    header.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); header.click(); }
    });
  });

  /* ══════════════════════════════════════════════════════════
     5. MAPA DE LA GUITARRA — Hotspots interactivos
        Activa el primero por defecto en desktop
     ══════════════════════════════════════════════════════════ */
  const hotspots   = document.querySelectorAll('.hotspot');
  const panelEmpty = document.querySelector('.mapa__panel-empty');
  const mapPanels  = document.querySelectorAll('.mapa__panel-content');

  const activateHotspot = (part) => {
    hotspots.forEach(h => {
      h.setAttribute('aria-pressed', h.dataset.part === part ? 'true' : 'false');
    });
    mapPanels.forEach(p => {
      p.classList.toggle('active', p.dataset.part === part);
    });
    if (panelEmpty) panelEmpty.style.display = 'none';
  };

  hotspots.forEach(h => {
    h.addEventListener('click', () => activateHotspot(h.dataset.part));
    h.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateHotspot(h.dataset.part); }
    });
  });

  // Activa el primero por defecto en desktop
  if (hotspots.length && window.innerWidth >= 900) {
    activateHotspot(hotspots[0].dataset.part);
  }

  /* ══════════════════════════════════════════════════════════
     6. VIDEO — play/pause al hacer clic (sin botón visible)
        Muestra la imagen si no hay video disponible
     ══════════════════════════════════════════════════════════ */
  const videoWrapper = document.querySelector('.video-wrapper');
  const videoEl      = videoWrapper?.querySelector('video');
  const videoThumb   = videoWrapper?.querySelector('.video-thumb');

  if (videoWrapper && videoEl) {
    // Si el video no tiene src válido, muestra la imagen de fallback
    videoEl.addEventListener('error', () => {
      videoEl.style.display = 'none';
      if (videoThumb) videoThumb.style.display = 'block';
    });

    const toggleVideo = () => {
      if (videoEl.paused) {
        videoEl.play().catch(() => {
          // Si no puede reproducir, no hace nada (queda como póster)
        });
      } else {
        videoEl.pause();
      }
    };

    videoWrapper.addEventListener('click', toggleVideo);
    videoWrapper.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleVideo(); }
    });
  }

  /* ══════════════════════════════════════════════════════════
     7. CURSOS — drag scroll en rail horizontal
     ══════════════════════════════════════════════════════════ */
  const rail = document.querySelector('.cursos__rail');
  if (rail) {
    let isDown = false, startX = 0, scrollLeft = 0;

    rail.addEventListener('mousedown', e => {
      isDown = true;
      rail.style.cursor = 'grabbing';
      startX     = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
    });
    ['mouseleave', 'mouseup'].forEach(ev =>
      rail.addEventListener(ev, () => { isDown = false; rail.style.cursor = ''; })
    );
    rail.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      rail.scrollLeft = scrollLeft - (x - startX) * 1.4;
    });
  }

  /* ══════════════════════════════════════════════════════════
     8. STATS — count-up al entrar en viewport
     ══════════════════════════════════════════════════════════ */
  const countUp = (el) => {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const duration = 1400;
    const startTime = performance.now();

    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(ease * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(update);
  };

  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        const valEl = e.target.querySelector('.stat-item__value[data-target]');
        if (valEl) countUp(valEl);
        statsObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.stat-item').forEach(el => statsObs.observe(el));

  /* ══════════════════════════════════════════════════════════
     9. PROCESO — steps interactivos (click para destacar)
     ══════════════════════════════════════════════════════════ */
  const procesoWrap  = document.querySelector('.proceso__steps');
  const procesoSteps = document.querySelectorAll('.proceso__step');

  if (procesoWrap && procesoSteps.length) {
    procesoSteps.forEach(step => {
      step.addEventListener('click', () => {
        const wasActive = step.classList.contains('active');
        procesoSteps.forEach(s => s.classList.remove('active'));
        if (!wasActive) {
          step.classList.add('active');
          procesoWrap.classList.add('has-active');
        } else {
          procesoWrap.classList.remove('has-active');
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     10. PÚAS DE MADERA — panel desplegable (click toggle)
         En dispositivos táctiles: click abre/cierra
         En desktop con hover: el CSS maneja la interacción
     ══════════════════════════════════════════════════════════ */
  const pickCards    = document.querySelectorAll('.pick-card');
  const isTouchDevice = window.matchMedia('(hover: none)').matches;

  pickCards.forEach(card => {
    card.addEventListener('click', () => {
      if (!isTouchDevice) return; // En desktop el hover del CSS es suficiente
      const wasOpen = card.classList.contains('open');
      pickCards.forEach(c => c.classList.remove('open'));
      if (!wasOpen) card.classList.add('open');
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const wasOpen = card.classList.contains('open');
        pickCards.forEach(c => c.classList.remove('open'));
        if (!wasOpen) card.classList.add('open');
      }
    });
  });

  /* ══════════════════════════════════════════════════════════
     11. GALERÍA — Acordeón horizontal (estilo video_effects)
         - Cursor personalizado que sigue el mouse
         - Hover: columna se expande + aparece imagen
         - Click: columna se abre a full con contenido
         - Mobile: comportamiento desactivado
     ══════════════════════════════════════════════════════════ */
  const galeriaAccordion = document.getElementById('galeriaAccordion');
  const galeriaCursor    = document.getElementById('galeriaCursor');
  const galeriaCols      = document.querySelectorAll('.galeria-col');

  if (galeriaAccordion && galeriaCols.length) {

    // Asigna imágenes de fondo a cada columna desde data-img
    galeriaCols.forEach(col => {
      const img = col.dataset.img;
      if (img) {
        const bg = col.querySelector('.galeria-col__bg');
        if (bg) bg.style.backgroundImage = `url('${img}')`;
      }
      // FIX: precargar la imagen y hacerla visible al hover sin esperar al CSS
    if (img) {
      const bg = col.querySelector('.galeria-col__bg');
      if (bg) {
        bg.style.backgroundImage = `url('${img}')`;
        // Precarga para evitar flash blanco
        const preload = new Image();
        preload.src = img;
      }
    }
    });

    // Cursor personalizado (solo desktop)
    if (galeriaCursor && window.matchMedia('(hover: hover)').matches) {
      galeriaAccordion.addEventListener('mouseenter', () => {
        galeriaCursor.classList.add('visible');
        document.body.style.cursor = 'none';
      });
      galeriaAccordion.addEventListener('mouseleave', () => {
        galeriaCursor.classList.remove('visible');
        document.body.style.cursor = '';
      });
      galeriaAccordion.addEventListener('mousemove', e => {
        galeriaCursor.style.left = e.clientX + 'px';
        galeriaCursor.style.top  = e.clientY + 'px';
      });
    }

    // Click: abre la columna seleccionada
    galeriaCols.forEach(col => {
      col.addEventListener('click', e => {
        // Si ya está activa y se hace clic en el botón cerrar
        if (e.target.closest('.galeria-col__close')) {
          col.classList.remove('active');
          return;
        }
        // Si ya está activa: cerrar
        if (col.classList.contains('active')) {
          col.classList.remove('active');
          return;
        }
        // Cerrar cualquier otra activa y abrir esta
        galeriaCols.forEach(c => c.classList.remove('active'));
        col.classList.add('active');
      });

      // Accesibilidad teclado
      col.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          col.click();
        }
        if (e.key === 'Escape') {
          col.classList.remove('active');
          col.focus();
        }
      });
    });

    // Cerrar con clic fuera
    document.addEventListener('click', e => {
      if (!e.target.closest('.galeria-col')) {
        galeriaCols.forEach(c => c.classList.remove('active'));
      }
    });

    // Cerrar con Escape global
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') galeriaCols.forEach(c => c.classList.remove('active'));
    });
  }

  /* ══════════════════════════════════════════════════════════
     12. TESTIMONIOS — Carrusel con scroll-snap + botones + dots
     ══════════════════════════════════════════════════════════ */
  const carousel     = document.getElementById('testimoniosCarousel');
  const btnPrev      = document.getElementById('testimoniosPrev');
  const btnNext      = document.getElementById('testimoniosNext');
  const dotsWrap     = document.getElementById('testimoniosDots');
  const testimonios  = document.querySelectorAll('.testimonio-card');

  if (carousel && testimonios.length) {
    let currentIndex = 0;

    // Crea dots
    const dots = [];
    if (dotsWrap) {
      testimonios.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'testimonios__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
        dot.addEventListener('click', () => scrollToCard(i));
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    const updateDots = (index) => {
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    };

    const scrollToCard = (index) => {
      const card = testimonios[index];
      if (!card) return;
      carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
      currentIndex = index;
      updateDots(index);
    };

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        currentIndex = Math.max(0, currentIndex - 1);
        scrollToCard(currentIndex);
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        currentIndex = Math.min(testimonios.length - 1, currentIndex + 1);
        scrollToCard(currentIndex);
      });
    }

    // Sync dots con scroll
    const syncDots = () => {
      const scrollCenter = carousel.scrollLeft + carousel.offsetWidth / 2;
      testimonios.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        if (Math.abs(scrollCenter - cardCenter) < card.offsetWidth / 2) {
          currentIndex = i;
          updateDots(i);
        }
      });
    };

    carousel.addEventListener('scroll', syncDots, { passive: true });
  }

  /* ══════════════════════════════════════════════════════════
     13. FAQ — Acordeón
     ══════════════════════════════════════════════════════════ */
  const faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Cierra todos
      faqItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq__question')?.setAttribute('aria-expanded', 'false');
        i.querySelector('.faq__answer')?.style.setProperty('--ans-h', '0px');
      });

      // Abre el clickeado
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.setProperty('--ans-h', answer.scrollHeight + 'px');
      }
    });
  });

  /* ══════════════════════════════════════════════════════════
     14. MADERAS — drag scroll horizontal (mobile)
     ══════════════════════════════════════════════════════════ */
  const picksGrid = document.querySelector('.picks__grid');
  if (picksGrid) {
    let isDown = false, startX = 0, scrollLeft = 0;

    picksGrid.addEventListener('mousedown', e => {
      isDown = true;
      startX     = e.pageX - picksGrid.offsetLeft;
      scrollLeft = picksGrid.scrollLeft;
      picksGrid.style.cursor = 'grabbing';
    });
    ['mouseleave', 'mouseup'].forEach(ev =>
      picksGrid.addEventListener(ev, () => { isDown = false; picksGrid.style.cursor = ''; })
    );
    picksGrid.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      picksGrid.scrollLeft = scrollLeft - (e.pageX - picksGrid.offsetLeft - startX) * 1.2;
    });
  }

  /* ══════════════════════════════════════════════════════════
     15. NAV LINKS — highlight de la sección activa
     ══════════════════════════════════════════════════════════ */
  const sections   = document.querySelectorAll('section[id]');
  const navLinks   = document.querySelectorAll('.nav__links a[href^="#"]');

  if (sections.length && navLinks.length) {
    const sectionObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          navLinks.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => sectionObs.observe(s));
  }

  /* ══════════════════════════════════════════════════════════
     16. SMOOTH SCROLL — todos los anchors internos
     ══════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '64');
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

});