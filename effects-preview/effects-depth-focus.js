/**
 * CybersecFEST — Depth, Blur, Focus & Lens Effects
 *
 * Motor: GSAP + CSS filters.
 * Regras:
 *  - Nunca manter blur em texto por mais de 0.25s
 *  - Sempre restaurar filter/opacity/transform no reset
 *  - Sem loops infinitos
 *  - backdrop-filter com fallback para rgba semiopaco
 */
(function (global) {
  'use strict';

  const V2 = global.__effectsV2;
  if (!V2) return;

  const apply = global.__fxApply || (() => {});

  /* ─── tiny helpers ─── */

  function b(px) { return `blur(${px}px)`; }
  function br(v)  { return `brightness(${v})`; }

  /* intensity multiplier: soft=0.5, medium=1, impact=1.8 */
  function im(opts) {
    const m = { soft: 0.5, medium: 1, impact: 1.8 };
    return m[opts?.intensity] ?? 1;
  }

  /* blur amount: low=2px, medium=5px, high=10px — scaled by intensity */
  function blurPx(opts, base) {
    const ba = opts?.blurAmount;
    const raw = ba === 'low' ? 2 : ba === 'high' ? 10 : (base ?? 5);
    return raw * im(opts);
  }

  function soloBase() {
    apply({
      '#fx-blackout': { opacity: 0 },
      '#fx-bg-wrap': { opacity: 1, scale: 1.05, x: 0, y: 0 },
      '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
      '#fx-scene': { scale: 1, x: 0, y: 0 },
      '#fx-logo': { clipPath: 'inset(0 0% 0 0)', opacity: 1, filter: 'blur(0px)' },
      '#fx-divider': { scaleX: 1 },
      '#fx-subtitle': { opacity: 1, y: 0, filter: 'blur(0px)' },
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)', x: 0,
      },
      '#fx-impact-word': { textShadow: '0 0 0 transparent' },
      '#fx-headline': { x: 0, y: 0, filter: 'blur(0px)' },
      '#fx-cta': { opacity: 0, scale: 1, filter: 'blur(0px)' },
      '#fx-cta-arrow': { opacity: 0, x: -16 },
      '#fx-cta-outline': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      '#fx-cta-pulse': { scale: 1, opacity: 0 },
      /* depth layers */
      '#fx-radial-focus': { opacity: 0 },
      '#fx-bokeh-field': { opacity: 0 },
      '#fx-glass-panel': { opacity: 0 },
      '#fx-depth-fog': { opacity: 0, x: 0 },
      '#fx-lens-flare': { opacity: 0, scale: 1 },
      '#fx-aperture-ring': { opacity: 0 },
      '#fx-tilt-shift-top, #fx-tilt-shift-bot': { opacity: 0 },
      '#fx-frosted-wipe-strip': { opacity: 0, x: '-110%' },
      '#fx-optic-brackets': { opacity: 0 },
    });
  }

  /* ─── DOM init ─── */

  function initBokeh() {
    const el = document.getElementById('fx-bokeh-field');
    if (!el || el.childElementCount) return;
    const data = [
      { x: 72, y: 18, r: 55, op: 0.4 }, { x: 84, y: 36, r: 38, op: 0.35 },
      { x: 65, y: 60, r: 48, op: 0.25 }, { x: 91, y: 72, r: 30, op: 0.38 },
      { x: 78, y: 52, r: 22, op: 0.45 }, { x: 60, y: 28, r: 36, op: 0.28 },
      { x: 88, y: 10, r: 26, op: 0.32 }, { x: 70, y: 82, r: 42, op: 0.20 },
    ];
    data.forEach((d) => {
      const dot = document.createElement('div');
      dot.className = 'fx-bokeh-dot';
      dot.style.left = `${d.x}%`;
      dot.style.top = `${d.y}%`;
      dot.style.width = dot.style.height = `${d.r}px`;
      dot.style.opacity = '0';
      dot.dataset.maxop = String(d.op);
      el.appendChild(dot);
    });
  }

  function initAperture() {
    const el = document.getElementById('fx-aperture-ring');
    if (!el || el.childElementCount) return;
    el.innerHTML = `<svg viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" style="width:100%;height:100%;display:block">
      <defs>
        <mask id="fx-apt-mask">
          <rect width="1080" height="1350" fill="white"/>
          <polygon id="fx-apt-inner"
            points="540,475 640,510 672,620 608,710 472,710 408,620 440,510"
            fill="black"/>
        </mask>
      </defs>
      <rect id="fx-apt-bg" width="1080" height="1350" fill="#02050A" mask="url(#fx-apt-mask)" opacity="0"/>
      <polygon id="fx-apt-border"
        points="540,475 640,510 672,620 608,710 472,710 408,620 440,510"
        fill="none" stroke="rgba(20,168,244,0.7)" stroke-width="1.5" opacity="0"/>
    </svg>`;
  }

  function initOpticBrackets() {
    const el = document.getElementById('fx-optic-brackets');
    if (!el) return;
    el.innerHTML = `
      <div class="fx-ob-corner fx-ob-tl"></div>
      <div class="fx-ob-corner fx-ob-tr"></div>
      <div class="fx-ob-corner fx-ob-bl"></div>
      <div class="fx-ob-corner fx-ob-br"></div>
      <div class="fx-ob-scanline" id="fx-ob-scan"></div>`;
  }

  /* ─── RESET ─── */

  const DF_RESET = {
    '#fx-bg-wrap':  { filter: 'brightness(0.95)' },
    '#fx-bg':       { filter: 'brightness(0.95) saturate(1)' },
    '#fx-scene':    { scale: 1, x: 0, y: 0, filter: 'blur(0px)' },
    '#fx-logo':     { filter: 'blur(0px)' },
    '#fx-headline': { filter: 'blur(0px)' },
    '#fx-subtitle': { filter: 'blur(0px)' },
    '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': { filter: 'blur(0px)' },
    '#fx-cta':      { filter: 'blur(0px)' },
    '#fx-radial-focus':   { opacity: 0 },
    '#fx-bokeh-field':    { opacity: 0 },
    '#fx-glass-panel':    { opacity: 0 },
    '#fx-depth-fog':      { opacity: 0, x: 0 },
    '#fx-lens-flare':     { opacity: 0, scale: 1 },
    '#fx-aperture-ring':  { opacity: 0 },
    '#fx-tilt-shift-top': { opacity: 0 },
    '#fx-tilt-shift-bot': { opacity: 0 },
    '#fx-frosted-wipe-strip': { opacity: 0, x: '-110%' },
    '#fx-optic-brackets': { opacity: 0 },
  };

  /* ─── SOLO PREPARE ─── */

  const SOLO_PREPARE = {
    'focus-pull'() {
      soloBase();
      apply({ '#fx-bg-wrap': { filter: `blur(8px) brightness(0.85)`, scale: 1.1 },
              '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': { opacity: 0, y: 20 } });
    },
    'blur-resolve'() {
      soloBase();
      apply({ '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': { filter: 'blur(12px)', opacity: 0.3 } });
    },
    'motion-blur-swipe'() {
      soloBase();
      apply({ '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': { x: -120, filter: 'blur(18px)', opacity: 0 } });
    },
    'radial-focus-lock'() { soloBase(); },
    'blur-flash-hit'() { soloBase(); apply({ '#fx-cta': { opacity: 1 } }); },
    'zoom-blur-punch'() { soloBase(); },
    'edge-softness'() { soloBase(); },
    'background-defocus-reveal'() {
      soloBase();
      apply({ '#fx-bg-wrap': { filter: 'blur(18px) brightness(0.7)', scale: 1.1 },
              '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': { opacity: 0 } });
    },
    'scan-focus-reveal'() {
      soloBase();
      apply({ '#fx-bg-wrap': { filter: 'blur(6px) brightness(0.8)' },
              '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': { filter: 'blur(5px)', opacity: 0.4 } });
    },
    'bokeh-pulse'() {
      soloBase();
      initBokeh();
      apply({ '#fx-bokeh-field': { opacity: 1 },
              '#fx-bokeh-field .fx-bokeh-dot': { opacity: 0 } });
    },
    'glass-blur-panel'() { soloBase(); apply({ '#fx-cta': { opacity: 1 } }); },
    'signal-stabilize'() {
      soloBase();
      apply({ '#fx-scene': { filter: 'blur(4px)' },
              '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': { filter: 'blur(3px)' } });
    },
    'chromatic-focus-shift'() { soloBase(); },
    'focus-breath'() { soloBase(); apply({ '#fx-cta': { opacity: 1 } }); },
    'camera-dolly-in'() {
      soloBase();
      apply({ '#fx-bg-wrap': { scale: 1.0, filter: 'brightness(0.85)' } });
    },
    'camera-dolly-out'() {
      soloBase();
      apply({ '#fx-bg-wrap': { scale: 1.22 } });
    },
    'tilt-shift-depth'() { soloBase(); apply({ '#fx-tilt-shift-top, #fx-tilt-shift-bot': { opacity: 0 } }); },
    'mask-blur-reveal'() {
      soloBase();
      apply({ '#fx-logo': { filter: 'blur(10px)', opacity: 0.3, clipPath: 'inset(0 60% 0 0)' } });
    },
    'frosted-glass-wipe'() {
      soloBase();
      apply({ '#fx-frosted-wipe-strip': { opacity: 0, x: '-110%' } });
    },
    'focus-snap'() {
      soloBase();
      apply({ '#fx-cta': { opacity: 1, filter: 'blur(8px)' } });
    },
    'depth-fog-roll'() { soloBase(); apply({ '#fx-depth-fog': { opacity: 0, x: '40%' } }); },
    'lens-flare-focus'() { soloBase(); },
    'aperture-open'() {
      soloBase();
      initAperture();
      apply({ '#fx-aperture-ring': { opacity: 1 }, '#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5': { opacity: 0 } });
      gsap.set('#fx-apt-bg', { opacity: 1 });
      gsap.set('#fx-apt-border', { opacity: 0 });
      /* collapse hex to center */
      gsap.set('#fx-apt-inner', {
        attr: { points: '540,615 540,620 540,625 540,620 540,615 540,620 540,615' },
      });
    },
    'headline-focus-stack'() {
      soloBase();
      apply({
        '#fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': { filter: 'blur(6px)', opacity: 0.5 },
        '#fx-row-1': { filter: 'blur(0px)', opacity: 1 },
      });
    },
    'cta-focus-lock'() {
      soloBase();
      apply({
        '#fx-cta': { opacity: 1 },
        '#fx-radial-focus': { opacity: 0 },
        '#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5': { filter: 'blur(0px)', opacity: 1 },
      });
    },
    'logo-lens-reveal'() {
      soloBase();
      apply({ '#fx-logo': { filter: 'blur(14px) brightness(0.7)', opacity: 0.5 } });
    },
    'micro-defocus-shock'() { soloBase(); },
    'optic-scan-focus'() {
      soloBase();
      initOpticBrackets();
      apply({
        '#fx-scene': { filter: 'blur(2px)' },
        '#fx-optic-brackets': { opacity: 0 },
        '#fx-cta': { opacity: 0, filter: 'blur(4px)' },
      });
    },
    'soft-focus-glow'() { soloBase(); apply({ '#fx-cta': { opacity: 1 } }); },
    'whip-pan-blur'() { soloBase(); },
  };

  /* ─── EFFECTS ─── */

  const Effects = {

    'focus-pull'(tl, at, opts) {
      const mult = im(opts);
      /* bg sharpens */
      tl.to('#fx-bg-wrap', {
        filter: 'blur(0px) brightness(1)', scale: 1.05,
        duration: 0.55, ease: 'power2.out',
      }, at);
      /* headline enters sharp */
      tl.fromTo('#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power3.out' },
        at + 0.25);
      /* focus migrates to CTA */
      tl.to('#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5', {
        filter: `blur(${1.5 * mult}px)`, opacity: 0.7, duration: 0.35, ease: 'power2.inOut',
      }, at + 0.95);
      tl.fromTo('#fx-cta',
        { opacity: 0, scale: 0.92, filter: `blur(${4 * mult}px)` },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power3.out' },
        at + 0.98);
      tl.fromTo('#fx-cta-arrow', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2 }, at + 1.2);
      /* restore headline */
      tl.to('#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5', { filter: 'blur(0px)', opacity: 1, duration: 0.25 }, at + 1.3);
    },

    'blur-resolve'(tl, at, opts) {
      const bpx = blurPx(opts, 12);
      tl.fromTo('#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5',
        { filter: `blur(${bpx}px)`, opacity: 0.3 },
        { filter: 'blur(0px)', opacity: 1, duration: 0.45, stagger: 0.07, ease: 'power3.out' },
        at);
      tl.fromTo('#fx-divider', { scaleX: 0 }, { scaleX: 1, duration: 0.2 }, at + 0.25);
      tl.fromTo('#fx-subtitle',
        { filter: `blur(${bpx * 0.5}px)`, opacity: 0 },
        { filter: 'blur(0px)', opacity: 1, duration: 0.35, ease: 'power2.out' },
        at + 0.35);
    },

    'motion-blur-swipe'(tl, at, opts) {
      const dir = opts?.direction === 'right' ? 1 : -1;
      const bpx = blurPx(opts, 18);
      const dist = 120 * im(opts);
      tl.fromTo('#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5',
        { x: dir * dist, filter: `blur(${bpx}px)`, opacity: 0 },
        { x: 0, filter: 'blur(0px)', opacity: 1, duration: 0.38, stagger: 0.06, ease: 'power4.out' },
        at);
    },

    'radial-focus-lock'(tl, at, opts) {
      tl.set('#fx-radial-focus', { opacity: 0 }, at);
      tl.to('#fx-radial-focus', { opacity: im(opts) * 0.6, duration: 0.4, ease: 'power2.out' }, at);
      /* lock HUD */
      tl.fromTo('#fx-hud-brackets', { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.2 }, at + 0.2);
      tl.to('#fx-radial-focus', { opacity: im(opts) * 0.35, duration: 0.6, ease: 'power1.inOut' }, at + 0.6);
    },

    'blur-flash-hit'(tl, at, opts) {
      const bpx = blurPx(opts, 5);
      tl.fromTo('#fx-impact-flash', { opacity: 0 }, { opacity: 0.85, duration: 0.03 }, at);
      tl.to('#fx-impact-flash', { opacity: 0, duration: 0.09 }, at + 0.03);
      tl.to('#fx-scene', { filter: `blur(${bpx}px)`, duration: 0.04 }, at + 0.02);
      tl.to('#fx-scene', { filter: 'blur(0px)', duration: 0.1, ease: 'power2.out' }, at + 0.06);
      tl.to('#fx-cta', { filter: 'blur(0px)', scale: 1.06, duration: 0.05 }, at + 0.08);
      tl.to('#fx-cta', { scale: 1, duration: 0.15, ease: 'power2.out' }, at + 0.13);
    },

    'zoom-blur-punch'(tl, at, opts) {
      const bpx = blurPx(opts, 6);
      const sc = 1 + 0.05 * im(opts);
      tl.to('#fx-scene', { scale: sc, filter: `blur(${bpx}px)`, duration: 0.08, ease: 'power4.in' }, at);
      tl.fromTo('#fx-frame-punch-flash', { opacity: 0 }, { opacity: 0.7, duration: 0.04 }, at + 0.02);
      tl.to('#fx-frame-punch-flash', { opacity: 0, duration: 0.12 }, at + 0.06);
      tl.to('#fx-scene', { scale: 1.05, filter: 'blur(0px)', duration: 0.22, ease: 'power3.out' }, at + 0.08);
    },

    'edge-softness'(tl, at, opts) {
      const op = 0.5 * im(opts);
      tl.to('#fx-tilt-shift-top', { opacity: op, duration: 0.5, ease: 'power2.out' }, at);
      tl.to('#fx-tilt-shift-bot', { opacity: op * 0.8, duration: 0.5, ease: 'power2.out' }, at + 0.05);
      tl.to('.fx-vignette', { opacity: 0.9, duration: 0.5 }, at);
    },

    'background-defocus-reveal'(tl, at, opts) {
      const bpx = blurPx(opts, 18);
      tl.fromTo('#fx-bg-wrap',
        { filter: `blur(${bpx}px) brightness(0.7)`, scale: 1.1 },
        { filter: 'blur(0px) brightness(1)', scale: 1.05, duration: 0.65, ease: 'power2.out' },
        at);
      tl.fromTo('#fx-bg', { filter: 'brightness(0.7) saturate(0.7)' },
        { filter: 'brightness(1) saturate(1)', duration: 0.5, ease: 'power2.out' }, at + 0.1);
      tl.fromTo('#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5',
        { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out' }, at + 0.35);
    },

    'scan-focus-reveal'(tl, at, opts) {
      const bpx = blurPx(opts, 6);
      /* scan line descends */
      tl.to('#fx-scan-h', { y: -20, opacity: 0 }, at);
      tl.fromTo('#fx-scan-h',
        { y: -20, opacity: 0 },
        { y: 1370, opacity: 0.7, duration: 0.6, ease: 'power2.inOut' },
        at);
      /* elements resolve as scan passes */
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.5, ease: 'power2.out' }, at + 0.15);
      tl.to('#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5', {
        filter: 'blur(0px)', opacity: 1, duration: 0.35, stagger: 0.08, ease: 'power3.out',
      }, at + 0.25);
      tl.to('#fx-scan-h', { opacity: 0, duration: 0.1 }, at + 0.58);
    },

    'bokeh-pulse'(tl, at, opts) {
      initBokeh();
      const dots = [...document.querySelectorAll('#fx-bokeh-field .fx-bokeh-dot')];
      tl.set('#fx-bokeh-field', { opacity: 1 }, at);
      dots.forEach((d, i) => {
        const maxop = parseFloat(d.dataset.maxop ?? 0.35) * im(opts);
        tl.fromTo(d, { opacity: 0, scale: 0.6 },
          { opacity: maxop, scale: 1 + 0.1 * i % 3, duration: 0.5 + i * 0.05, ease: 'power2.out' },
          at + i * 0.08);
        tl.to(d, { scale: 1.05 + 0.06 * (i % 3), duration: 0.8, ease: 'sine.inOut' }, at + 0.5 + i * 0.06);
        tl.to(d, { opacity: 0, duration: 0.6, ease: 'power2.in' }, at + 1.6 + i * 0.04);
      });
      tl.to('#fx-bokeh-field', { opacity: 0, duration: 0.2 }, at + 2.4);
    },

    'glass-blur-panel'(tl, at) {
      tl.set('#fx-glass-panel', { opacity: 0, y: 12, scale: 0.97 }, at);
      tl.to('#fx-glass-panel', { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out' }, at);
      tl.fromTo('#fx-cta',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.28, ease: 'power3.out' }, at + 0.12);
      tl.fromTo('#fx-cta-outline',
        { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.25, ease: 'power2.inOut' }, at + 0.18);
      tl.fromTo('#fx-cta-arrow', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.18 }, at + 0.35);
      tl.to('#fx-glass-panel', { opacity: 0, duration: 0.3 }, at + 1.0);
    },

    'signal-stabilize'(tl, at, opts) {
      const bpx = blurPx(opts, 4);
      const amp = 6 * im(opts);
      /* wobble + blur */
      tl.to('#fx-scene', { filter: `blur(${bpx}px)`, duration: 0.05 }, at);
      tl.to('#fx-scene', { x: amp, duration: 0.04 }, at + 0.04);
      tl.to('#fx-scene', { x: -amp * 0.7, duration: 0.04 }, at + 0.08);
      tl.to('#fx-scene', { x: amp * 0.4, duration: 0.04 }, at + 0.12);
      tl.to('#fx-scene', { x: -amp * 0.2, duration: 0.04 }, at + 0.16);
      tl.to('#fx-scene', { x: 0, filter: 'blur(0px)', duration: 0.25, ease: 'power3.out' }, at + 0.2);
      /* subtle blue resolve glow */
      tl.to('#fx-holographic-bloom', { opacity: 0.4, duration: 0.15 }, at + 0.28);
      tl.to('#fx-holographic-bloom', { opacity: 0, duration: 0.35 }, at + 0.45);
    },

    'chromatic-focus-shift'(tl, at, opts) {
      const shift = 12 * im(opts);
      /* VHS-like RGB split then converge */
      tl.set('#fx-vhs-rgb', { opacity: 1, x: 0 }, at);
      tl.fromTo('#fx-vhs-rgb', { x: -shift, opacity: 0.9 }, { x: shift, opacity: 0.8, duration: 0.06 }, at);
      tl.to('#fx-vhs-rgb', { x: -shift * 0.5, duration: 0.04 }, at + 0.06);
      tl.to('#fx-vhs-rgb', { x: 0, opacity: 0, duration: 0.08, ease: 'power2.out' }, at + 0.1);
      /* sharp resolve */
      tl.to('#fx-bg', { filter: 'brightness(1.05) saturate(1.1)', duration: 0.05 }, at + 0.06);
      tl.to('#fx-bg', { filter: 'brightness(0.95) saturate(1)', duration: 0.18 }, at + 0.11);
    },

    'focus-breath'(tl, at, opts) {
      const bpx = 1.5 * im(opts);
      const sc = 1 + 0.012 * im(opts);
      tl.to('#fx-cta', { scale: sc, filter: `blur(${bpx}px)`, duration: 0.4, ease: 'sine.inOut' }, at);
      tl.to('#fx-cta', { scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'sine.inOut' }, at + 0.4);
      tl.to('#fx-logo', { scale: sc * 0.998, filter: `blur(${bpx * 0.5}px)`, duration: 0.45, ease: 'sine.inOut' }, at + 0.08);
      tl.to('#fx-logo', { scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'sine.inOut' }, at + 0.5);
    },

    'camera-dolly-in'(tl, at, opts) {
      const sc = 1 + 0.08 * im(opts);
      tl.fromTo('#fx-bg-wrap',
        { scale: 1.0, filter: 'brightness(0.85)' },
        { scale: sc, filter: 'brightness(1)', duration: 2.5 * (im(opts) < 1 ? 1 : 1), ease: 'power1.inOut' },
        at);
      tl.fromTo('#fx-content',
        { scale: 0.98 },
        { scale: 1, duration: 2.0, ease: 'power1.inOut' }, at);
    },

    'camera-dolly-out'(tl, at, opts) {
      const scFrom = 1 + 0.1 * im(opts);
      tl.fromTo('#fx-bg-wrap',
        { scale: scFrom },
        { scale: 1.05, duration: 2.0, ease: 'power2.out' }, at);
      tl.fromTo('#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5',
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.55, stagger: 0.1, ease: 'power3.out' }, at + 0.4);
    },

    'tilt-shift-depth'(tl, at, opts) {
      const op = 0.65 * im(opts);
      tl.to('#fx-tilt-shift-top', { opacity: op, duration: 0.45, ease: 'power2.out' }, at);
      tl.to('#fx-tilt-shift-bot', { opacity: op * 0.85, duration: 0.45, ease: 'power2.out' }, at + 0.05);
      /* center stays crisp — already default */
      tl.to('#fx-tilt-shift-top, #fx-tilt-shift-bot', { opacity: op * 0.6, duration: 0.8, ease: 'sine.inOut' }, at + 0.8);
    },

    'mask-blur-reveal'(tl, at, opts) {
      const bpx = blurPx(opts, 10);
      tl.fromTo('#fx-logo',
        { filter: `blur(${bpx}px)`, opacity: 0.4, clipPath: 'inset(0 60% 0 0)' },
        { filter: 'blur(0px)', opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power3.out' },
        at);
      tl.fromTo('#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5',
        { clipPath: 'inset(0 80% 0 0)', filter: `blur(${bpx * 0.5}px)`, opacity: 0.3 },
        { clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)', opacity: 1, duration: 0.45, stagger: 0.07, ease: 'power4.out' },
        at + 0.15);
    },

    'frosted-glass-wipe'(tl, at) {
      tl.set('#fx-frosted-wipe-strip', { opacity: 1, x: '-110%' }, at);
      tl.to('#fx-frosted-wipe-strip', { x: '110%', duration: 0.55, ease: 'power3.inOut' }, at);
      tl.to('#fx-frosted-wipe-strip', { opacity: 0, duration: 0.1 }, at + 0.5);
      tl.fromTo('#fx-cta',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.28, ease: 'power3.out' }, at + 0.28);
      tl.fromTo('#fx-cta-outline',
        { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.25, ease: 'power2.inOut' }, at + 0.22);
      tl.fromTo('#fx-cta-arrow', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.18 }, at + 0.4);
    },

    'focus-snap'(tl, at, opts) {
      const bpx = blurPx(opts, 8);
      tl.to('#fx-cta', { filter: `blur(${bpx}px)`, duration: 0.04 }, at);
      tl.fromTo('#fx-impact-flash', { opacity: 0 }, { opacity: 0.55, duration: 0.03 }, at + 0.02);
      tl.to('#fx-impact-flash', { opacity: 0, duration: 0.08 }, at + 0.05);
      tl.to('#fx-cta', { filter: 'blur(0px)', duration: 0.12, ease: 'power4.out' }, at + 0.06);
      tl.fromTo('#fx-cta-pulse',
        { scale: 0.6, opacity: 0.75 },
        { scale: 2.2, opacity: 0, duration: 0.4, ease: 'power2.out' }, at + 0.08);
    },

    'depth-fog-roll'(tl, at, opts) {
      const op = 0.45 * im(opts);
      tl.set('#fx-depth-fog', { opacity: 0, x: '30%' }, at);
      tl.to('#fx-depth-fog', { opacity: op, x: '0%', duration: 1.2, ease: 'power2.out' }, at);
      tl.to('#fx-depth-fog', { x: '-20%', duration: 1.8, ease: 'sine.inOut' }, at + 1.2);
      tl.to('#fx-depth-fog', { opacity: 0, duration: 0.8, ease: 'power2.in' }, at + 2.2);
    },

    'lens-flare-focus'(tl, at, opts) {
      const op = 0.7 * im(opts);
      tl.set('#fx-lens-flare', { opacity: 0, scale: 0.4 }, at);
      tl.to('#fx-lens-flare', { opacity: op, scale: 1.2, duration: 0.12, ease: 'power4.out' }, at);
      tl.to('#fx-lens-flare', { opacity: op * 0.4, scale: 1.6, duration: 0.22, ease: 'power2.out' }, at + 0.12);
      tl.to('#fx-lens-flare', { opacity: 0, scale: 2.2, duration: 0.4, ease: 'power2.in' }, at + 0.32);
      tl.fromTo('#fx-logo',
        { filter: 'blur(8px)', opacity: 0.5 },
        { filter: 'blur(0px)', opacity: 1, duration: 0.35, ease: 'power3.out' }, at + 0.12);
    },

    'aperture-open'(tl, at) {
      initAperture();
      tl.set('#fx-aperture-ring', { opacity: 1 }, at);
      /* expand hex from center */
      const pts = '540,475 640,510 672,620 608,710 472,710 408,620 440,510';
      tl.to('#fx-apt-inner', { attr: { points: pts }, duration: 0.35, ease: 'power3.out' }, at);
      tl.to('#fx-apt-border', { opacity: 1, duration: 0.2 }, at + 0.1);
      /* reveal content */
      tl.fromTo('#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.35, stagger: 0.08, ease: 'power3.out' }, at + 0.25);
      /* aperture fades */
      tl.to('#fx-apt-bg', { opacity: 0, duration: 0.35 }, at + 0.4);
      tl.to('#fx-aperture-ring', { opacity: 0, duration: 0.2 }, at + 0.7);
    },

    'headline-focus-stack'(tl, at, opts) {
      const bpx = blurPx(opts, 6);
      const rows = ['#fx-row-1', '#fx-row-2', '#fx-row-3', '#fx-row-4', '#fx-row-5'];
      /* each row comes into focus in turn */
      rows.forEach((sel, i) => {
        /* bring into focus */
        tl.to(sel, { filter: 'blur(0px)', opacity: 1, duration: 0.22, ease: 'power3.out' }, at + i * 0.22);
        /* blur next row slightly before it gets its turn */
        if (i > 0) {
          tl.to(rows[i - 1], { filter: `blur(${bpx * 0.4}px)`, opacity: 0.7, duration: 0.2, ease: 'power2.inOut' }, at + i * 0.22 + 0.1);
        }
      });
      /* restore all at end */
      tl.to(rows.join(','), { filter: 'blur(0px)', opacity: 1, duration: 0.35, ease: 'power2.out' }, at + rows.length * 0.22 + 0.15);
    },

    'cta-focus-lock'(tl, at, opts) {
      const bpx = 1.8 * im(opts);
      /* slight blur on non-CTA elements */
      tl.to('#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5',
        { filter: `blur(${bpx}px)`, opacity: 0.65, duration: 0.4, ease: 'power2.inOut' }, at);
      tl.to('#fx-logo', { filter: `blur(${bpx * 0.5}px)`, opacity: 0.75, duration: 0.4 }, at);
      /* CTA sharpens and gets focus ring */
      tl.fromTo('#fx-cta',
        { filter: `blur(${bpx * 2}px)`, opacity: 0.5 },
        { filter: 'blur(0px)', opacity: 1, duration: 0.38, ease: 'power3.out' }, at);
      tl.fromTo('#fx-cta-outline',
        { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.28, ease: 'power2.inOut' }, at + 0.12);
      tl.fromTo('#fx-cta-pulse',
        { scale: 0.6, opacity: 0.8 },
        { scale: 2.2, opacity: 0, duration: 0.55, ease: 'power2.out' }, at + 0.22);
      tl.fromTo('#fx-cta-arrow', { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2 }, at + 0.32);
      /* restore blur after a beat */
      tl.to('#fx-row-1,#fx-row-2,#fx-row-3,#fx-row-4,#fx-row-5,#fx-logo', { filter: 'blur(0px)', opacity: 1, duration: 0.3 }, at + 0.8);
    },

    'logo-lens-reveal'(tl, at, opts) {
      const bpx = blurPx(opts, 14);
      tl.fromTo('#fx-logo',
        { filter: `blur(${bpx}px) brightness(0.6)`, opacity: 0.4 },
        { filter: 'blur(0px) brightness(1)', opacity: 1, duration: 0.55, ease: 'power3.out' },
        at);
      tl.to('#fx-logo-glow', { opacity: 0.7, duration: 0.18 }, at + 0.1);
      tl.to('#fx-logo-glow', { opacity: 0, duration: 0.4 }, at + 0.4);
      /* optional scanline across logo */
      tl.fromTo('#fx-scan-h',
        { y: -20, opacity: 0 },
        { y: 260, opacity: 0.5, duration: 0.35, ease: 'power2.inOut' }, at + 0.08);
      tl.to('#fx-scan-h', { opacity: 0, duration: 0.08 }, at + 0.38);
    },

    'micro-defocus-shock'(tl, at, opts) {
      const bpx = Math.min(3 * im(opts), 5);
      tl.to('#fx-scene', { filter: `blur(${bpx}px)`, duration: 0.04, ease: 'none' }, at);
      tl.fromTo('#fx-frame-punch-flash', { opacity: 0 }, { opacity: 0.55, duration: 0.03 }, at + 0.01);
      tl.to('#fx-frame-punch-flash', { opacity: 0, duration: 0.1 }, at + 0.04);
      tl.to('#fx-scene', { filter: 'blur(0px)', duration: 0.12, ease: 'power3.out' }, at + 0.05);
    },

    'optic-scan-focus'(tl, at) {
      initOpticBrackets();
      const brackets = document.getElementById('fx-optic-brackets');
      const scan = document.getElementById('fx-ob-scan');

      tl.set(brackets, { opacity: 1 }, at);
      tl.set('.fx-ob-corner', { scale: 1.2, opacity: 0 }, at);
      tl.to('.fx-ob-corner', { scale: 1, opacity: 1, duration: 0.18, stagger: 0.05 }, at);
      if (scan) {
        tl.fromTo(scan, { top: '5%', opacity: 0 }, { top: '95%', opacity: 0.7, duration: 0.7, ease: 'power2.inOut' }, at + 0.1);
        tl.to(scan, { opacity: 0, duration: 0.1 }, at + 0.75);
      }
      /* elements come into focus as scan passes */
      tl.to('#fx-scene', { filter: 'blur(0px)', duration: 0.5, ease: 'power2.out' }, at + 0.3);
      tl.fromTo('#fx-cta',
        { opacity: 0, filter: 'blur(4px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power3.out' }, at + 0.55);
      tl.to(brackets, { opacity: 0, duration: 0.2 }, at + 0.9);
    },

    'soft-focus-glow'(tl, at, opts) {
      const op = 0.55 * im(opts);
      /* warm glow then resolve */
      tl.to('#fx-logo-glow', { opacity: op, duration: 0.25, ease: 'power2.out' }, at);
      tl.to('#fx-logo', { filter: `blur(${1 * im(opts)}px)`, duration: 0.12 }, at);
      tl.to('#fx-logo', { filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, at + 0.12);
      tl.to('#fx-cta', { opacity: 1, filter: 'blur(0px)', duration: 0.28, ease: 'power3.out' }, at + 0.15);
      tl.fromTo('#fx-cta-outline',
        { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.25, ease: 'power2.inOut' }, at + 0.2);
      tl.to('#fx-logo-glow', { opacity: 0, duration: 0.5 }, at + 0.5);
    },

    'whip-pan-blur'(tl, at, opts) {
      const bpx = blurPx(opts, 22);
      const dir = opts?.direction === 'left' ? 1 : -1;
      /* scene whips */
      tl.to('#fx-scene', { x: dir * 40, filter: `blur(${bpx}px)`, duration: 0.1, ease: 'power4.in' }, at);
      tl.to('#fx-scene', { x: -dir * 15, filter: `blur(${bpx * 0.5}px)`, duration: 0.08, ease: 'none' }, at + 0.1);
      tl.to('#fx-scene', { x: 0, filter: 'blur(0px)', duration: 0.14, ease: 'power3.out' }, at + 0.18);
    },
  };

  /* ─── Init all ─── */

  function initDepthLayers() {
    initBokeh();
    initAperture();
    initOpticBrackets();
  }

  /* ─── Register ─── */

  Object.assign(V2.Effects, Effects);
  Object.assign(V2.SOLO_PREPARE, SOLO_PREPARE);
  Object.assign(V2.resetV2, DF_RESET);

  const baseInit = V2.initLayers;
  V2.initLayers = function initDepthAll() {
    if (baseInit) baseInit();
    initDepthLayers();
  };

})(typeof window !== 'undefined' ? window : global);
