/**
 * CybersecFEST — Impacto Social / CapCut-inspired (reinterpretação premium)
 */
(function (global) {
  'use strict';

  const V2 = global.__effectsV2;
  if (!V2) return;

  const apply = global.__fxApply || (() => {});

  function soloBase() {
    apply({
      '#fx-blackout': { opacity: 0 },
      '#fx-bg-wrap': { opacity: 1, scale: 1.05, x: 0, y: 0, rotation: 0 },
      '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
      '#fx-scene': { scale: 1, x: 0, y: 0, rotation: 0 },
      '#fx-logo': { clipPath: 'inset(0 0% 0 0)', opacity: 1, filter: 'blur(0px)' },
      '#fx-divider': { scaleX: 1 },
      '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)', x: 0,
      },
      '#fx-impact-word': { textShadow: '0 0 0 rgba(20,168,244,0)' },
      '#fx-headline': { x: 0, y: 0 },
      '#fx-cta': { opacity: 0, scale: 1, x: 0, y: 0 },
      '#fx-cta-arrow': { opacity: 0, x: -16 },
      '#fx-cta-outline': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      '#fx-cta-pulse': { scale: 1, opacity: 0 },
      '#fx-cta-slide-track': { opacity: 0 },
    });
  }

  function initPixelDissolve() {
    const el = document.getElementById('fx-pixel-dissolve');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 64; i++) {
      const p = document.createElement('span');
      el.appendChild(p);
    }
  }

  function initMosaicSlice() {
    const el = document.getElementById('fx-mosaic-slice');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span');
      el.appendChild(s);
    }
  }

  function initPaperTear() {
    const el = document.getElementById('fx-paper-tear');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('span');
      el.appendChild(p);
    }
  }

  function initRipples() {
    const el = document.getElementById('fx-ripple-signal');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 2; i++) {
      const r = document.createElement('span');
      el.appendChild(r);
    }
  }

  function layoutPixelDissolve(target) {
    const root = document.getElementById('fx-pixel-dissolve');
    if (!root) return;
    const cells = [...root.children];
    const scene = document.getElementById('fx-scene');
    const el = document.querySelector(target);
    if (!scene || !el) return;
    const sr = scene.getBoundingClientRect();
    const tr = el.getBoundingClientRect();
    if (!sr.width) return;
    const sx = 1080 / sr.width;
    const sy = 1350 / sr.height;
    const left = (tr.left - sr.left) * sx;
    const top = (tr.top - sr.top) * sy;
    const w = tr.width * sx;
    const h = tr.height * sy;
    const cols = 8;
    const rows = 8;
    const cw = w / cols;
    const ch = h / rows;
    cells.forEach((cell, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      if (row >= rows) {
        cell.style.opacity = '0';
        return;
      }
      cell.style.left = `${left + col * cw}px`;
      cell.style.top = `${top + row * ch}px`;
      cell.style.width = `${cw - 1}px`;
      cell.style.height = `${ch - 1}px`;
    });
  }

  function shakeTarget(tl, at, selector, opts = {}) {
    const amp = opts.amp ?? 4;
    const dur = opts.duration ?? 0.14;
    const step = dur / 5;
    tl.to(selector, { x: amp, duration: step, ease: 'none' }, at);
    tl.to(selector, { x: -amp * 0.75, duration: step, ease: 'none' }, at + step);
    tl.to(selector, { x: amp * 0.5, duration: step, ease: 'none' }, at + step * 2);
    tl.to(selector, { x: -amp * 0.35, duration: step, ease: 'none' }, at + step * 3);
    tl.to(selector, { x: 0, y: 0, duration: step, ease: 'power2.out' }, at + step * 4);
  }

  const SOCIAL_RESET = {
    '#fx-vhs-rgb': { opacity: 0, x: 0 },
    '#fx-vhs-noise': { opacity: 0 },
    '#fx-pixel-dissolve': { opacity: 0 },
    '#fx-pixel-dissolve span': { opacity: 0, scale: 0.2 },
    '#fx-mosaic-slice': { opacity: 0 },
    '#fx-mosaic-slice span': { scaleY: 1, scaleX: 1, opacity: 1 },
    '#fx-paper-tear': { opacity: 0 },
    '#fx-paper-tear span': { opacity: 0, x: 0, y: 0, rotation: 0 },
    '#fx-cta-slide-track': { opacity: 0, x: -120 },
    '#fx-cta-slide-lock': { opacity: 0 },
    '#fx-pulse-ring': { opacity: 0, scale: 0.5 },
    '#fx-orbit-text': { opacity: 0, rotation: 0 },
    '#fx-ripple-signal': { opacity: 0 },
    '#fx-ripple-signal span': { scale: 0, opacity: 0 },
    '#fx-flag-wave': { opacity: 0, skewY: 0 },
    '#fx-flip-panel': { opacity: 0, rotationY: -90 },
    '#fx-static-interference': { opacity: 0 },
    '#fx-signal-distortion': { opacity: 0, skewX: 0, x: 0 },
  };

  const SOLO_PREPARE = {
    'vhs-signal-cut'() {
      soloBase();
      apply({
        '#fx-bg-wrap': { opacity: 1 },
        '#fx-vhs-rgb': { opacity: 0, x: 0 },
        '#fx-vhs-noise': { opacity: 0 },
        '#fx-signal-distortion': { opacity: 0, skewX: 0, x: 0 },
      });
    },
    'pixel-dissolve-reveal'() {
      soloBase();
      apply({
        '#fx-logo': { opacity: 0 },
        '#fx-pixel-dissolve': { opacity: 1 },
        '#fx-pixel-dissolve span': { opacity: 0, scale: 0.15 },
      });
      layoutPixelDissolve('#fx-logo');
    },
    'screen-shake-hit'() {
      soloBase();
      apply({
        '#fx-row-4': { opacity: 1 },
        '#fx-impact-word': { textShadow: '0 0 24px rgba(20,168,244,0.8)' },
        '#fx-headline': { x: 0, y: 0 },
        '#fx-impact-flash': { opacity: 0 },
      });
    },
    'mosaic-slice-transition'() {
      soloBase();
      initMosaicSlice();
      apply({
        '#fx-bg-wrap': { opacity: 0 },
        '#fx-mosaic-slice': { opacity: 1 },
        '#fx-mosaic-slice span': { scaleY: 1, opacity: 1 },
      });
    },
    'paper-tear-tech'() {
      soloBase();
      initPaperTear();
      apply({
        '#fx-row-4, #fx-row-5': { opacity: 0 },
        '#fx-paper-tear': { opacity: 1 },
        '#fx-paper-tear span': { opacity: 1, x: 0, y: 0 },
      });
    },
    'button-slide-unlock'() {
      soloBase();
      apply({
        '#fx-cta-slide-track': { opacity: 1, x: -120 },
        '#fx-cta-slide-lock': { opacity: 1 },
        '#fx-cta': { opacity: 0, x: -40 },
        '#fx-cta-outline': { opacity: 0 },
        '#fx-cta-arrow': { opacity: 0, x: -24 },
      });
    },
    'pulse-beat'() {
      soloBase();
      apply({
        '#fx-cta': { opacity: 1 },
        '#fx-pulse-ring': { opacity: 0, scale: 0.6 },
      });
    },
    'curved-text-orbit'() {
      soloBase();
      apply({
        '#fx-orbit-text': { opacity: 0, rotation: -28 },
      });
    },
    'water-ripple-signal'() {
      soloBase();
      initRipples();
      apply({
        '#fx-mesh': { opacity: 1 },
        '#fx-ripple-signal': { opacity: 1 },
        '#fx-ripple-signal span': { scale: 0, opacity: 0 },
      });
      gsap.set('#fx-mesh-lines path', { opacity: 0.45 });
    },
    'flag-wave-data'() {
      soloBase();
      apply({
        '#fx-flag-wave': { opacity: 0, skewY: 0 },
        '#fx-energy-wipe': { opacity: 0 },
      });
    },
    'flip-panel-reveal'() {
      soloBase();
      apply({
        '#fx-subtitle': { opacity: 0 },
        '#fx-flip-panel': { opacity: 1, rotationY: -88, transformPerspective: 900 },
      });
    },
    'static-interference'() {
      soloBase();
      apply({
        '#fx-static-interference': { opacity: 0 },
        '#fx-signal-distortion': { opacity: 0, x: 0 },
      });
    },
  };

  const Effects = {
    'vhs-signal-cut'(tl, at) {
      tl.set('#fx-vhs-rgb', { opacity: 1 }, at);
      tl.fromTo('#fx-vhs-rgb',
        { x: -18, opacity: 0.85 },
        { x: 14, opacity: 0.9, duration: 0.04, ease: 'none' },
        at
      );
      tl.to('#fx-vhs-rgb', { x: -8, opacity: 0.7, duration: 0.03, ease: 'none' }, at + 0.04);
      tl.to('#fx-vhs-rgb', { x: 0, opacity: 0, duration: 0.06 }, at + 0.07);
      tl.fromTo('#fx-vhs-noise',
        { opacity: 0 },
        { opacity: 0.55, duration: 0.03 },
        at
      );
      tl.to('#fx-vhs-noise', { opacity: 0, duration: 0.08 }, at + 0.05);
      tl.fromTo('#fx-signal-distortion',
        { opacity: 0, skewX: 0, x: 0 },
        { opacity: 0.75, skewX: -4, x: 12, duration: 0.04 },
        at + 0.02
      );
      tl.to('#fx-signal-distortion', { opacity: 0, skewX: 0, x: 0, duration: 0.07 }, at + 0.06);
      tl.to('#fx-bg', { filter: 'brightness(1.15) saturate(1.1)', duration: 0.04 }, at + 0.02);
      tl.to('#fx-bg', { filter: 'brightness(0.95) saturate(1)', duration: 0.1 }, at + 0.06);
    },

    'pixel-dissolve-reveal'(tl, at, opts) {
      const target = opts?.target || '#fx-logo';
      layoutPixelDissolve(target);
      const cells = [...document.querySelectorAll('#fx-pixel-dissolve span')];
      tl.set('#fx-pixel-dissolve', { opacity: 1 }, at);
      tl.set(target, { opacity: 0 }, at);
      cells.forEach((cell, i) => {
        if (!cell.style.left) return;
        tl.fromTo(cell,
          { opacity: 0, scale: 0.1 },
          { opacity: 0.95, scale: 1, duration: 0.08, ease: 'power2.out' },
          at + (i % 8) * 0.02 + Math.floor(i / 8) * 0.025
        );
        tl.to(cell, { opacity: 0, duration: 0.06 }, at + 0.35 + i * 0.008);
      });
      tl.to(target, { opacity: 1, duration: 0.2, ease: 'power2.out' }, at + 0.42);
      tl.to('#fx-pixel-dissolve', { opacity: 0, duration: 0.1 }, at + 0.55);
    },

    'screen-shake-hit'(tl, at, opts) {
      const target = opts?.target || '#fx-headline';
      tl.fromTo('#fx-impact-flash', { opacity: 0 }, { opacity: 0.75, duration: 0.03 }, at);
      tl.to('#fx-impact-flash', { opacity: 0, duration: 0.1 }, at + 0.03);
      shakeTarget(tl, at, target, { amp: 4, duration: 0.14 });
      if (target === '#fx-headline' || !opts?.target) {
        tl.to('#fx-impact-word', {
          textShadow: '0 0 36px rgba(20,168,244,1)',
          duration: 0.06,
        }, at);
        tl.to('#fx-impact-word', { textShadow: '0 0 0 rgba(20,168,244,0)', duration: 0.2 }, at + 0.08);
      }
    },

    'mosaic-slice-transition'(tl, at) {
      const slices = [...document.querySelectorAll('#fx-mosaic-slice span')];
      tl.set('#fx-mosaic-slice', { opacity: 1 }, at);
      tl.set('#fx-bg-wrap', { opacity: 0 }, at);
      slices.forEach((s, i) => {
        tl.set(s, { scaleY: 1, transformOrigin: 'center center' }, at);
        tl.to(s, { scaleY: 0, duration: 0.12, ease: 'power4.in' }, at + i * 0.04);
      });
      tl.fromTo('#fx-bg-wrap',
        { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1.05, duration: 0.35, ease: 'power3.out' },
        at + 0.35
      );
      tl.to('#fx-mosaic-slice', { opacity: 0, duration: 0.15 }, at + 0.55);
      slices.forEach((s, i) => {
        tl.set(s, { scaleY: 1 }, at + 0.7);
      });
    },

    'paper-tear-tech'(tl, at) {
      const parts = [...document.querySelectorAll('#fx-paper-tear span')];
      tl.set('#fx-paper-tear', { opacity: 1 }, at);
      parts.forEach((p, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        tl.fromTo(p,
          { opacity: 1, x: 0, y: 0, rotation: 0 },
          { x: dir * (40 + i * 18), y: -20 - i * 8, rotation: dir * (6 + i * 2), opacity: 0, duration: 0.28, ease: 'power3.in' },
          at + i * 0.05
        );
      });
      tl.fromTo('#fx-row-4, #fx-row-5',
        { opacity: 0, y: 24, clipPath: 'inset(100% 0 0 0)' },
        { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.32, stagger: 0.08, ease: 'power4.out' },
        at + 0.22
      );
      tl.to('#fx-paper-tear', { opacity: 0, duration: 0.15 }, at + 0.5);
    },

    'button-slide-unlock'(tl, at) {
      tl.set('#fx-cta-slide-track', { opacity: 1, x: -120 }, at);
      tl.set('#fx-cta-slide-lock', { opacity: 1 }, at);
      tl.to('#fx-cta-slide-track', { x: 0, duration: 0.38, ease: 'power3.out' }, at);
      tl.to('#fx-cta-slide-lock', { opacity: 0, duration: 0.12 }, at + 0.28);
      tl.fromTo('#fx-cta',
        { opacity: 0, x: -36, scale: 0.92 },
        { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: 'power3.out' },
        at + 0.22
      );
      tl.fromTo('#fx-cta-outline',
        { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.28, ease: 'power2.inOut' },
        at + 0.18
      );
      tl.fromTo('#fx-cta-arrow',
        { x: -24, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.2, ease: 'power4.out' },
        at + 0.42
      );
      tl.fromTo('#fx-cta-pulse',
        { scale: 0.5, opacity: 0.75 },
        { scale: 2.2, opacity: 0, duration: 0.45, ease: 'power2.out' },
        at + 0.38
      );
      tl.to('#fx-cta-slide-track', { opacity: 0, duration: 0.2 }, at + 0.55);
    },

    'pulse-beat'(tl, at, opts) {
      const target = opts?.target || '#fx-cta';
      tl.set('#fx-pulse-ring', { opacity: 1 }, at);
      tl.fromTo(target,
        { scale: 1 },
        { scale: 1.06, duration: 0.08, ease: 'power2.out' },
        at
      );
      tl.to(target, { scale: 1, duration: 0.12, ease: 'power2.inOut' }, at + 0.08);
      tl.fromTo('#fx-pulse-ring',
        { scale: 0.5, opacity: 0.85, left: '52px', top: '1145px' },
        { scale: 2.8, opacity: 0, duration: 0.4, ease: 'power2.out' },
        at
      );
      tl.to(target, {
        boxShadow: '0 0 28px rgba(20,168,244,0.55)',
        duration: 0.06,
      }, at);
      tl.to(target, { boxShadow: '0 0 0 rgba(20,168,244,0)', duration: 0.25 }, at + 0.1);
    },

    'curved-text-orbit'(tl, at) {
      tl.set('#fx-orbit-text', { opacity: 1 }, at);
      tl.fromTo('#fx-orbit-text',
        { rotation: -32, opacity: 0 },
        { rotation: 18, opacity: 0.85, duration: 0.9, ease: 'power2.inOut' },
        at
      );
      tl.to('#fx-orbit-text', { opacity: 0, rotation: 28, duration: 0.35, ease: 'power2.in' }, at + 0.75);
    },

    'water-ripple-signal'(tl, at) {
      const ripples = [...document.querySelectorAll('#fx-ripple-signal span')];
      tl.set('#fx-ripple-signal', { opacity: 1 }, at);
      ripples.forEach((r, i) => {
        tl.set(r, { left: '78%', top: '42%', scale: 0, opacity: 0.8 }, at + i * 0.22);
        tl.to(r, { scale: 5.5, opacity: 0, duration: 0.55, ease: 'power2.out' }, at + i * 0.22);
      });
      tl.to('#fx-ripple-signal', { opacity: 0, duration: 0.15 }, at + 0.75);
    },

    'flag-wave-data'(tl, at) {
      tl.set('#fx-flag-wave', { opacity: 1 }, at);
      tl.fromTo('#fx-flag-wave',
        { skewY: 0, x: '-10%' },
        { skewY: 4, x: '8%', duration: 0.22, ease: 'sine.inOut' },
        at
      );
      tl.to('#fx-flag-wave', { skewY: -2, x: '4%', duration: 0.18, ease: 'sine.inOut' }, at + 0.22);
      tl.to('#fx-flag-wave', { skewY: 0, x: '0%', opacity: 0, duration: 0.2 }, at + 0.38);
      tl.fromTo('#fx-energy-wipe',
        { opacity: 0.6, x: '-80%' },
        { x: '80%', opacity: 0, duration: 0.35, ease: 'power2.inOut' },
        at + 0.08
      );
    },

    'flip-panel-reveal'(tl, at, opts) {
      const target = opts?.target || '#fx-subtitle';
      tl.set('#fx-flip-panel', { opacity: 1, rotationY: -88, transformPerspective: 900 }, at);
      tl.to('#fx-flip-panel', { rotationY: 0, duration: 0.28, ease: 'power3.out' }, at);
      tl.to('#fx-flip-panel', { opacity: 0, duration: 0.12 }, at + 0.28);
      tl.fromTo(target,
        { opacity: 0, y: 16, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.32, ease: 'power3.out' },
        at + 0.18
      );
    },

    'static-interference'(tl, at) {
      tl.fromTo('#fx-static-interference',
        { opacity: 0 },
        { opacity: 0.85, duration: 0.03 },
        at
      );
      tl.to('#fx-static-interference', { opacity: 0.4, duration: 0.04, ease: 'steps(3)' }, at + 0.03);
      tl.to('#fx-static-interference', { opacity: 0, duration: 0.06 }, at + 0.07);
      tl.fromTo('#fx-signal-distortion',
        { opacity: 0, x: 0 },
        { opacity: 0.6, x: 8, duration: 0.04 },
        at + 0.02
      );
      tl.to('#fx-signal-distortion', { opacity: 0, x: 0, duration: 0.06 }, at + 0.06);
    },
  };

  function initSocialLayers() {
    initPixelDissolve();
    initMosaicSlice();
    initPaperTear();
    initRipples();
    const orbit = document.getElementById('fx-orbit-text');
    if (orbit && !orbit.textContent) {
      orbit.innerHTML = '<span class="fx-orbit-label">SIGNAL DETECTED</span><span class="fx-orbit-label alt">NETWORK ACTIVE</span>';
    }
    const mosaic = document.querySelectorAll('#fx-mosaic-slice span');
    mosaic.forEach((s, i) => {
      s.style.flex = '1';
      s.style.background = i % 2 === 0 ? '#02050A' : '#010308';
      s.style.borderBottom = '1px solid rgba(20,168,244,0.15)';
    });
    const tear = document.querySelectorAll('#fx-paper-tear span');
    const tearGeom = [
      { left: '12%', top: '58%', width: '38%', height: '6%' },
      { left: '28%', top: '62%', width: '32%', height: '5%' },
      { left: '18%', top: '66%', width: '42%', height: '4%' },
      { left: '8%', top: '70%', width: '48%', height: '5%' },
      { left: '22%', top: '74%', width: '36%', height: '4%' },
      { left: '14%', top: '78%', width: '40%', height: '5%' },
    ];
    tear.forEach((p, i) => {
      const g = tearGeom[i] || tearGeom[0];
      Object.assign(p.style, {
        position: 'absolute',
        background: 'linear-gradient(135deg, rgba(20,168,244,0.35), rgba(2,5,10,0.95))',
        border: '1px solid rgba(20,168,244,0.55)',
        clipPath: 'polygon(0 0, 100% 0, 92% 100%, 4% 100%)',
        ...g,
      });
    });
  }

  Object.assign(V2.Effects, Effects);
  Object.assign(V2.SOLO_PREPARE, SOLO_PREPARE);
  Object.assign(V2.resetV2, SOCIAL_RESET);

  const baseInit = V2.initLayers;
  V2.initLayers = function initSocialAll() {
    if (baseInit) baseInit();
    initSocialLayers();
  };
})(typeof window !== 'undefined' ? window : global);
