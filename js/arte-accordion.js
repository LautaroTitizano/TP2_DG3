/* ══════════════════════════════════════════════════════════════════
   ARTE — SCROLL ACCORDION ("El arte detrás del sonido")
   ══════════════════════════════════════════════════════════════════
   Cómo está armado:

   1) La sección completa se "pinnea" en pantalla con ScrollTrigger
      (pin:true) durante una distancia de scroll de N pantallas (una
      por etapa). Mientras dura el pin, la página no se mueve: lo que
      avanza es el índice activo, calculado a partir del progreso del
      pin (0→1 repartido entre las 4 etapas). Sólo una etapa está
      abierta a la vez — abrir una cierra automáticamente las demás.
      En mobile (<901px) no hay pin: la sección fluye normal.

   2) La altura del panel (.arte__item-body) SIEMPRE se anima con
      GSAP hacia un valor en píxeles medido en el momento (nunca
      "height:auto" animado, eso no es posible en CSS puro). El
      contenido interno entra con opacity + translateY + blur.

   3) El número gigante de la izquierda no hace un simple fade: sale
      con blur+translateY hacia arriba y el número nuevo entra desde
      abajo también con blur — un crossfade con textura, no un corte.

   4) La "cuerda de guitarra": la línea corta bajo el título activo
      (.arte__item-title-underline) nace en scaleX(0) y se suelta con
      ease elástico — se tensa y vibra una sola vez, nunca en loop.
      El ícono "+" desaparece del todo en la etapa activa (no hace
      falta un ícono de "cerrar": abrir otra etapa ya la reemplaza).

   5) accesibilidad: cada header es un <button> real con
      aria-expanded, así que Enter/Espacio funcionan solos. El click
      llama a la misma función que usa el scroll, así que ambos
      caminos son 100% equivalentes.
   ══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const section = document.querySelector('.arte');
  if (!section) return;

  const items  = Array.from(section.querySelectorAll('.arte__item'));
  const numEl  = document.getElementById('arteNum');
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  let activeIndex = 0;

  /* ── Utilidad: alto real del contenido de una etapa ── */
  function measure(item){
    const inner = item.querySelector('.arte__item-inner');
    return inner ? inner.getBoundingClientRect().height : 0;
  }

  /* ── La "cuerda de guitarra": la línea corta bajo el título activo
     nace en scaleX(0) y se suelta con ease elástico — como una
     cuerda que se tensa y vibra hasta asentarse. Una sola vez, nunca
     en loop. `grow=false` la retrae rápido (cuando deja de estar
     activa/hovereada). ── */
  function plingUnderline(item, grow){
    const underline = item.querySelector('.arte__item-title-underline');
    if (!underline) return;
    if (!hasGSAP){ underline.style.transform = grow ? 'scaleX(1)' : 'scaleX(0)'; return; }
    gsap.killTweensOf(underline);
    if (grow){
      gsap.fromTo(underline, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'elastic.out(1, 0.4)' });
    } else {
      gsap.to(underline, { scaleX: 0, duration: .3, ease: 'power2.in' });
    }
  }

  /* ── Número gigante: crossfade con blur + translateY ── */
  function setNumber(index){
    if (!numEl) return;
    const next = String(index + 1).padStart(2, '0');
    if (numEl.textContent.trim() === next) return;

    if (!hasGSAP){ numEl.textContent = next; return; }

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
  }

  /* ── Abre `index`, cierra el resto. Punto de entrada único, lo llaman
     tanto el ScrollTrigger como el click/tap y el teclado. ── */
  function openItem(index){
    if (index === activeIndex && items[index].classList.contains('arte__item--active')) return;
    activeIndex = index;

    items.forEach((item, i) => {
      const header = item.querySelector('.arte__item-header');
      const body   = item.querySelector('.arte__item-body');
      const inner  = item.querySelector('.arte__item-inner');
      const isTarget = i === index;

      header.setAttribute('aria-expanded', String(isTarget));
      item.classList.toggle('arte__item--active', isTarget);
      plingUnderline(item, isTarget);

      if (isTarget){
        const h = measure(item);
        if (hasGSAP){
          gsap.to(body, { height: h, duration: .7, ease: 'power3.out' });
          gsap.fromTo(inner,
            { opacity: 0, y: 26, filter: 'blur(6px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: .6, delay: .12, ease: 'power2.out' }
          );
        } else {
          body.style.height = h + 'px';
        }
      } else if (hasGSAP){
        gsap.to(body, { height: 0, duration: .5, ease: 'power2.inOut' });
      } else {
        body.style.height = '0px';
      }
    });

    setNumber(index);
  }

  /* ── Estado inicial: la primera etapa ya viene marcada como activa
     en el HTML (para que se vea bien sin JS); acá sólo le damos su
     alto real en píxeles para que GSAP pueda animar desde ahí. ── */
  function openFirstImmediately(){
    const first = items[0];
    const body = first.querySelector('.arte__item-body');
    const h = measure(first);
    if (hasGSAP){
      gsap.set(body, { height: h });
      gsap.set(first.querySelector('.arte__item-title-underline'), { scaleX: 1 });
    } else {
      body.style.height = h + 'px';
    }
  }

  /* ══ Scroll — la sección se "pinnea" (queda fija en pantalla) y el
     scroll interno recorre las 4 etapas, como en Basic/Dept: mientras
     dura el pin, la página no avanza — lo que avanza es el índice
     activo, calculado a partir del progreso del pin (0 → 1). ══ */
  if (hasScrollTrigger){
    // matchMedia: el pin sólo tiene sentido en pantallas de escritorio,
    // donde existen las dos columnas. En mobile la sección fluye normal.
    const mm = gsap.matchMedia();

    mm.add('(min-width: 901px)', () => {
      const distance = window.innerHeight * items.length; // 1 "pantalla" de scroll por etapa

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

      // Cleanup que gsap.matchMedia ejecuta solo si la media query deja
      // de cumplirse (p. ej. la ventana se achica a mobile en vivo).
      return () => pinTrigger.kill();
    });

    window.addEventListener('resize', () => {
      ScrollTrigger.refresh();
      const activeItem = items[activeIndex];
      if (activeItem){
        gsap.set(activeItem.querySelector('.arte__item-body'), { height: measure(activeItem) });
      }
    });
  }

  /* ══ Click / teclado — control manual, siempre disponible ══ */
  items.forEach((item, i) => {
    const header = item.querySelector('.arte__item-header');

    header.addEventListener('click', () => openItem(i));

    /* ══ Foco por hover: atenúa las demás etapas (no en touch) ══ */
    header.addEventListener('mouseenter', () => {
      if (!window.matchMedia('(hover: hover)').matches) return;
      items.forEach((other, j) => {
        if (j !== i) other.classList.add('arte__item--dimmed');
      });
      if (!item.classList.contains('arte__item--active')) plingUnderline(item, true);
    });
    header.addEventListener('mouseleave', () => {
      items.forEach(other => other.classList.remove('arte__item--dimmed'));
      if (!item.classList.contains('arte__item--active')) plingUnderline(item, false);
    });
  });

  /* Esperamos a que la tipografía/layout esté asentado antes de medir
     alturas reales (evita medir de más o de menos por un reflow tardío). */
  if (document.readyState === 'complete') openFirstImmediately();
  else window.addEventListener('load', openFirstImmediately);

})();
