/**
 * CybersecFEST Motion Library v2 — efeitos restantes (catálogo completo)
 */
(function (global) {
  'use strict';

  const V2 = global.__effectsV2;
  if (!V2) return;

  const apply = global.__fxApply || (() => {});

  function soloVisible() {
    apply({
      '#fx-blackout': { opacity: 0 },
      '#fx-bg-wrap': { opacity: 1, scale: 1.05, x: 0, y: 0, rotation: 0 },
      '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
      '#fx-logo': { clipPath: 'inset(0 0% 0 0)', opacity: 1, filter: 'blur(0px)' },
      '#fx-logo-pixels span': { opacity: 0, scale: 0.3 },
      '#fx-divider': { scaleX: 1 },
      '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)', x: 0,
      },
      '#fx-cta': { opacity: 0, scale: 1 },
      '#fx-cta-arrow': { opacity: 0, x: -16 },
    });
  }

  function rowsHidden() {
    apply({
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)',
      },
    });
  }

  function initShutter() {
    const el = document.getElementById('fx-shutter');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      el.appendChild(s);
    }
  }

  function initMeshRain() {
    const el = document.getElementById('fx-mesh-rain');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 42; i++) {
      const d = document.createElement('span');
      d.className = 'fx-rain-drop';
      el.appendChild(d);
    }
  }

  function initMeshFirewall() {
    const el = document.getElementById('fx-mesh-firewall');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 14; i++) {
      const b = document.createElement('span');
      el.appendChild(b);
    }
  }

  function initMeshLaser() {
    const el = document.getElementById('fx-mesh-laser');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 12; i++) {
      const l = document.createElement('span');
      el.appendChild(l);
    }
  }

  function initPixelBreak() {
    const el = document.getElementById('fx-pixel-break');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('span');
      el.appendChild(p);
    }
  }

  function initDataBurst() {
    const el = document.getElementById('fx-data-burst');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('span');
      el.appendChild(p);
    }
  }

  function initFinishCode() {
    const el = document.getElementById('fx-finish-code');
    if (el && !el.textContent) {
      el.textContent = '0x7F2A // auth.token.verify\nmesh.sync(true)\nSOC.alert.level=2\nfirewall.breach=false\nnode.handshake OK\npayload.encrypt(AES-256)';
    }
    const alt = document.getElementById('fx-finish-code-alt');
    if (alt && !alt.textContent) {
      alt.textContent = 'def scan_network():\n  yield node.id\n  sync.mesh(v2)\n# threat.null';
    }
  }

  function positionKeywordUnder() {
    const word = document.getElementById('fx-impact-word');
    const under = document.getElementById('fx-keyword-under');
    const scene = document.getElementById('fx-scene');
    if (!word || !under || !scene) return;
    const sceneRect = scene.getBoundingClientRect();
    const wordRect = word.getBoundingClientRect();
    if (!sceneRect.width) return;
    const sx = 1080 / sceneRect.width;
    const sy = 1350 / sceneRect.height;
    const left = (wordRect.left - sceneRect.left) * sx;
    const top = (wordRect.bottom - sceneRect.top) * sy + 6;
    const width = Math.max(wordRect.width * sx, 120);
    under.style.left = `${left}px`;
    under.style.top = `${top}px`;
    under.style.width = `${width}px`;
    under.style.height = '4px';
  }

  function positionKeywordBox() {
    const word = document.getElementById('fx-impact-word');
    const box = document.getElementById('fx-keyword-box');
    const scene = document.getElementById('fx-scene');
    if (!word || !box || !scene) return;
    const sceneRect = scene.getBoundingClientRect();
    const wordRect = word.getBoundingClientRect();
    if (!sceneRect.width) return;
    const sx = 1080 / sceneRect.width;
    const sy = 1350 / sceneRect.height;
    const padX = 14;
    const padY = 8;
    const left = (wordRect.left - sceneRect.left) * sx - padX;
    const top = (wordRect.top - sceneRect.top) * sy - padY;
    const width = wordRect.width * sx + padX * 2;
    const height = wordRect.height * sy + padY * 2;
    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
  }

  const REST_RESET = {
    '#fx-radar-opening': { opacity: 0 },
    '#fx-radar-opening .fx-radar-arm': { rotation: 0, transformOrigin: '540px 675px' },
    '#fx-mesh-radar': { opacity: 0 },
    '#fx-radar-sweep': { rotation: 0, transformOrigin: '820px 420px' },
    '#fx-mesh-rain': { opacity: 0 },
    '#fx-mesh-rain .fx-rain-drop': { opacity: 0, y: 0, x: 0, clearProps: 'top' },
    '#fx-mesh-firewall': { opacity: 0 },
    '#fx-mesh-firewall span': { opacity: 0, scaleY: 0 },
    '#fx-mesh-laser': { opacity: 0 },
    '#fx-mesh-laser span': { opacity: 0, scaleX: 0 },
    '#fx-blue-map': { opacity: 0 },
    '#fx-focus-window': { opacity: 0, clipPath: 'circle(0% at 72% 45%)' },
    '#fx-shutter': { opacity: 0 },
    '#fx-shutter span': { scaleY: 1 },
    '#fx-data-burst': { opacity: 0 },
    '#fx-data-burst span': { opacity: 0, scale: 0 },
    '#fx-pixel-break': { opacity: 0 },
    '#fx-pixel-break span': { opacity: 0 },
    '#fx-hud-brackets': { opacity: 0 },
    '#fx-hud-brackets .fx-hud-corner': { scale: 0, opacity: 0 },
    '#fx-keyword-box': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
    '#fx-keyword-under': { scaleX: 0, opacity: 0, x: 0 },
    '#fx-logo-glow': { opacity: 0 },
    '#fx-cta-glass': { opacity: 0, x: '-100%' },
    '#fx-holographic-bloom': { opacity: 0, x: 0 },
    '#fx-ambient-flicker': { opacity: 0 },
    '#fx-depth-shift': { opacity: 0, x: 0 },
    '#fx-finish-smoke': { opacity: 0, y: 0, x: 0, scale: 1 },
    '#fx-finish-code': { opacity: 0, y: 10, x: 0 },
    '#fx-finish-code-alt': { opacity: 0, y: 10, x: 0 },
    '#fx-edge-energy': { opacity: 0 },
    '#fx-headline': { filter: 'none' },
  };

  const REST_SOLO = {
    'radar-sweep'() {
      soloVisible();
      apply({ '#fx-blackout': { opacity: 1 }, '#fx-bg-wrap': { opacity: 0 }, '#fx-radar-opening': { opacity: 1 } });
    },
    'data-burst'() {
      soloVisible();
      apply({ '#fx-blackout': { opacity: 1 }, '#fx-bg-wrap': { opacity: 0 }, '#fx-data-burst': { opacity: 1 } });
    },
    'shutter-slice'() {
      soloVisible();
      apply({ '#fx-blackout': { opacity: 1 }, '#fx-bg-wrap': { opacity: 0 }, '#fx-shutter': { opacity: 1 } });
    },
    'photo-depth-tilt'() { soloVisible(); },
    'blue-light-map'() { soloVisible(); apply({ '#fx-blue-map': { opacity: 0 } }); },
    'focus-window'() { soloVisible(); apply({ '#fx-focus-window': { opacity: 1, clipPath: 'circle(0% at 72% 45%)' } }); },
    'digital-zoom-lock'() { soloVisible(); apply({ '#fx-bg-wrap': { scale: 1.35 } }); },
    'freeze-frame-punch'() { soloVisible(); apply({ '#fx-bg': { filter: 'brightness(0.95)' } }); },
    'headline-split-reveal'() { soloVisible(); rowsHidden(); },
    'headline-wave-stagger'() { soloVisible(); rowsHidden(); },
    'headline-lock-on'() { soloVisible(); rowsHidden(); apply({ '#fx-hud-brackets': { opacity: 0 } }); document.getElementById('fx-hud-brackets')?.classList.remove('is-logo', 'is-cta'); },
    'keyword-energy-box'() { soloVisible(); apply({ '#fx-keyword-box': { opacity: 0 } }); positionKeywordBox(); },
    'keyword-scan-pass'() { soloVisible(); apply({ '#fx-scan-h': { y: 400, opacity: 0 } }); },
    'keyword-glow-hit'() { soloVisible(); },
    'keyword-understrike'() {
      soloVisible();
      apply({
        '#fx-keyword-under': { scaleX: 0, opacity: 0, x: 0 },
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-5': { y: 0, opacity: 1 },
        '#fx-row-4': { y: 0, opacity: 1 },
      });
      positionKeywordUnder();
    },
    'mesh-laser-grid'() { soloVisible(); apply({ '#fx-mesh-laser': { opacity: 1 } }); },
    'mesh-data-rain'() { soloVisible(); apply({ '#fx-mesh-rain': { opacity: 1 } }); },
    'signal-packet-burst'() { soloVisible(); apply({ '#fx-mesh-neural': { opacity: 1 }, '#fx-data-packets .fx-data-packet': { opacity: 0 } }); },
    'signal-intercept'() { soloVisible(); apply({ '#fx-mesh': { opacity: 1 }, '#fx-signal-dot': { opacity: 0, attr: { cx: 760, cy: 80 } } }); },
    'logo-hud-lock'() { soloVisible(); apply({ '#fx-logo': { opacity: 0 }, '#fx-hud-brackets': { opacity: 0 } }); document.getElementById('fx-hud-brackets')?.classList.add('is-logo'); },
    'logo-glow-reveal'() { soloVisible(); apply({ '#fx-logo': { opacity: 0 }, '#fx-logo-glow': { opacity: 1 } }); },
    'cta-press-pulse'() { soloVisible(); apply({ '#fx-cta': { opacity: 1, scale: 1 } }); },
    'holographic-glow'() { soloVisible(); apply({ '#fx-headline': { filter: 'none', x: 0 }, '#fx-logo': { filter: 'none' }, '#fx-holographic-bloom': { opacity: 0 } }); },
    'blue-smoke'() { soloVisible(); apply({ '#fx-finish-smoke': { opacity: 0, y: 20, x: 0, scale: 1.05 } }); },
    'floating-code'() { soloVisible(); apply({ '#fx-finish-code': { opacity: 0, y: 20, x: 10 }, '#fx-finish-code-alt': { opacity: 0, y: 16, x: -8 } }); },
    'edge-energy'() { soloVisible(); apply({ '#fx-edge-energy': { opacity: 0 } }); },
    'ambient-flicker'() { soloVisible(); apply({ '#fx-ambient-flicker': { opacity: 0 }, '#fx-bg': { filter: 'brightness(0.95) saturate(1)' } }); },
    'depth-shadow-shift'() { soloVisible(); apply({ '.fx-vignette': { opacity: 0.85 }, '#fx-depth-shift': { opacity: 0, x: 0 } }); },
  };

  const REST_EFFECTS = {
    'radar-sweep'(tl, at) {
      tl.set('#fx-blackout', { opacity: 1 }, at);
      tl.set('#fx-radar-opening', { opacity: 1 }, at);
      tl.fromTo('#fx-radar-opening .fx-radar-arm',
        { rotation: 0, transformOrigin: '540px 675px' },
        { rotation: 360, duration: 1.1, ease: 'none' },
        at
      );
      tl.fromTo('#fx-blue-map', { opacity: 0 }, { opacity: 0.4, duration: 0.5 }, at + 0.3);
      tl.to('#fx-blackout', { opacity: 0, duration: 0.4 }, at + 0.55);
      tl.fromTo('#fx-bg-wrap', { opacity: 0, scale: 1.14 }, { opacity: 1, scale: 1.05, duration: 0.5 }, at + 0.5);
      tl.to('#fx-radar-opening', { opacity: 0, duration: 0.3 }, at + 0.95);
      tl.to('#fx-blue-map', { opacity: 0.2, duration: 0.4 }, at + 0.9);
    },

    'data-burst'(tl, at) {
      const parts = [...document.querySelectorAll('#fx-data-burst span')];
      tl.set('#fx-blackout', { opacity: 1 }, at);
      tl.set('#fx-data-burst', { opacity: 1 }, at);
      parts.forEach((p, i) => gsap.set(p, { left: 520, top: 640, opacity: 0, scale: 0 }));
      tl.to(parts, {
        opacity: 1, scale: () => gsap.utils.random(1.2, 2.2), duration: 0.14, stagger: 0.015,
        x: () => gsap.utils.random(-340, 340), y: () => gsap.utils.random(-280, 280),
        ease: 'power3.out',
      }, at + 0.04);
      tl.fromTo('#fx-frame-punch-flash', { opacity: 0 }, { opacity: 0.5, duration: 0.06 }, at + 0.12);
      tl.to('#fx-frame-punch-flash', { opacity: 0, duration: 0.15 }, at + 0.18);
      tl.to(parts, { opacity: 0, scale: 0.1, duration: 0.25, stagger: 0.008 }, at + 0.38);
      tl.to('#fx-blackout', { opacity: 0, duration: 0.3 }, at + 0.32);
      tl.fromTo('#fx-bg-wrap', { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1.05, duration: 0.45 }, at + 0.35);
      tl.to('#fx-data-burst', { opacity: 0, duration: 0.1 }, at + 0.55);
    },

    'shutter-slice'(tl, at) {
      const strips = [...document.querySelectorAll('#fx-shutter span')];
      tl.set('#fx-blackout', { opacity: 1 }, at);
      tl.set('#fx-shutter', { opacity: 1 }, at);
      strips.forEach((s, i) => {
        gsap.set(s, { scaleY: 1, transformOrigin: 'center center', background: i % 2 ? '#0a1628' : '#000' });
      });
      tl.to(strips, { scaleY: 0, duration: 0.14, stagger: 0.045, ease: 'power4.in' }, at + 0.05);
      tl.fromTo('#fx-frame-punch-flash', { opacity: 0 }, { opacity: 0.35, duration: 0.05 }, at + 0.2);
      tl.to('#fx-frame-punch-flash', { opacity: 0, duration: 0.12 }, at + 0.25);
      tl.to('#fx-blackout', { opacity: 0, duration: 0.28 }, at + 0.38);
      tl.fromTo('#fx-bg-wrap', { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1.05, duration: 0.42 }, at + 0.32);
      tl.to('#fx-shutter', { opacity: 0, duration: 0.1 }, at + 0.55);
    },

    'photo-depth-tilt'(tl, at) {
      tl.fromTo('#fx-bg-wrap',
        { x: -22, y: 14, rotation: -1.1, scale: 1.1 },
        { x: 14, y: -10, rotation: 0.6, scale: 1.06, duration: 2.8, ease: 'sine.inOut' },
        at
      );
      tl.to('#fx-bg', { filter: 'brightness(0.98) saturate(1.08)', duration: 1.4, ease: 'sine.inOut' }, at);
    },

    'blue-light-map'(tl, at) {
      tl.set('#fx-blue-map', { opacity: 0 }, at);
      tl.to('#fx-blue-map', { opacity: 0.95, duration: 1.0, ease: 'power2.out' }, at);
      tl.to('#fx-bg', { filter: 'brightness(1.08) saturate(1.22)', duration: 1.0 }, at);
      tl.to('#fx-blue-map', { opacity: 0.55, duration: 0.6, ease: 'power2.inOut' }, at + 1.0);
    },

    'focus-window'(tl, at) {
      tl.set('#fx-focus-window', { opacity: 1, clipPath: 'circle(0% at 72% 45%)' }, at);
      tl.to('#fx-focus-window', { clipPath: 'circle(36% at 72% 45%)', duration: 0.65, ease: 'power3.out' }, at);
      tl.to('#fx-bg', { filter: 'brightness(1.12) saturate(1.1)', duration: 0.5 }, at + 0.15);
      tl.to('#fx-focus-window', { opacity: 0, duration: 0.4 }, at + 0.8);
      tl.to('#fx-bg', { filter: 'brightness(0.95) saturate(1)', duration: 0.35 }, at + 0.85);
    },

    'digital-zoom-lock'(tl, at) {
      tl.fromTo('#fx-bg-wrap',
        { scale: 1.55, x: 55, y: -28 },
        { scale: 1.05, x: 0, y: 0, duration: 0.72, ease: 'power4.out' },
        at
      );
      tl.fromTo('#fx-bg',
        { filter: 'brightness(0.55) blur(3px) saturate(0.9)' },
        { filter: 'brightness(0.95) blur(0px) saturate(1)', duration: 0.55 },
        at + 0.08
      );
      tl.fromTo('#fx-frame-punch-flash', { opacity: 0 }, { opacity: 0.45, duration: 0.05 }, at + 0.48);
      tl.to('#fx-frame-punch-flash', { opacity: 0, duration: 0.15 }, at + 0.53);
    },

    'freeze-frame-punch'(tl, at) {
      tl.to('#fx-bg', { filter: 'brightness(0.35) saturate(0)', duration: 0.03 }, at);
      tl.fromTo('#fx-frame-punch-flash', { opacity: 0, scale: 0.9 }, { opacity: 0.85, scale: 1.15, duration: 0.05 }, at);
      tl.to('#fx-scene', { x: 4, duration: 0.03 }, at + 0.02);
      tl.to('#fx-scene', { x: -3, duration: 0.03 }, at + 0.05);
      tl.to('#fx-scene', { x: 0, duration: 0.04 }, at + 0.08);
      tl.to('#fx-frame-punch-flash', { opacity: 0, scale: 1.3, duration: 0.14 }, at + 0.05);
      tl.to('#fx-bg', { filter: 'brightness(0.95) saturate(1)', duration: 0.22 }, at + 0.08);
    },

    'headline-split-reveal'(tl, at) {
      tl.fromTo('#fx-row-1, #fx-row-3, #fx-row-5',
        { clipPath: 'inset(50% 0 50% 0)', opacity: 0, y: 12 },
        { clipPath: 'inset(0% 0 0% 0)', opacity: 1, y: 0, duration: 0.4, stagger: 0.09, ease: 'power4.out' },
        at
      );
      tl.fromTo('#fx-row-2, #fx-row-4',
        { clipPath: 'inset(0 50% 0 50%)', opacity: 0, x: 16 },
        { clipPath: 'inset(0 0% 0 0%)', opacity: 1, x: 0, duration: 0.4, stagger: 0.09, ease: 'power4.out' },
        at + 0.14
      );
    },

    'headline-wave-stagger'(tl, at) {
      tl.fromTo('#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5',
        { y: 45, opacity: 0, scale: 0.88, filter: 'blur(4px)' },
        { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.38, stagger: 0.11, ease: 'power3.out' },
        at
      );
    },

    'headline-lock-on'(tl, at) {
      tl.set('#fx-hud-brackets', { opacity: 1 }, at);
      tl.fromTo('#fx-hud-brackets .fx-hud-corner',
        { scale: 0, opacity: 0 },
        { scale: 1.15, opacity: 1, duration: 0.22, stagger: 0.05, ease: 'back.out(2.5)' },
        at
      );
      tl.to('#fx-hud-brackets .fx-hud-corner', { scale: 1, duration: 0.12, stagger: 0.03 }, at + 0.22);
      tl.fromTo('#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5',
        { y: 28, opacity: 0, filter: 'blur(3px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.35, stagger: 0.07, ease: 'power3.out' },
        at + 0.38
      );
      tl.to('#fx-hud-brackets', { opacity: 0, duration: 0.25 }, at + 0.75);
    },

    'keyword-energy-box'(tl, at) {
      positionKeywordBox();
      tl.set('#fx-keyword-box', { opacity: 1 }, at);
      tl.fromTo('#fx-keyword-box',
        { clipPath: 'inset(0 100% 0 0)', boxShadow: '0 0 0 transparent' },
        { clipPath: 'inset(0 0% 0 0)', boxShadow: '0 0 24px rgba(20,168,244,0.7)', duration: 0.35, ease: 'power3.inOut' },
        at
      );
      tl.to('#fx-impact-word', { textShadow: '0 0 28px rgba(20,168,244,1)', scale: 1.04, duration: 0.12 }, at + 0.22);
      tl.to('#fx-impact-word', { textShadow: '0 0 0 transparent', scale: 1, duration: 0.25 }, at + 0.38);
      tl.to('#fx-keyword-box', { opacity: 0, duration: 0.22 }, at + 0.55);
    },

    'keyword-scan-pass'(tl, at) {
      positionKeywordUnder();
      const under = document.getElementById('fx-keyword-under');
      const scanY = under ? parseFloat(under.style.top) - 18 : 400;
      tl.fromTo('#fx-scan-h',
        { y: scanY - 30, opacity: 0 },
        { y: scanY + 40, opacity: 0.95, duration: 0.4, ease: 'power2.inOut' },
        at
      );
      tl.to('#fx-impact-word', { textShadow: '0 0 24px rgba(20,168,244,0.95)', duration: 0.1 }, at + 0.18);
      tl.to('#fx-impact-word', { textShadow: '0 0 0 transparent', duration: 0.22 }, at + 0.32);
      tl.to('#fx-scan-h', { opacity: 0, duration: 0.12 }, at + 0.38);
    },

    'keyword-glow-hit'(tl, at) {
      tl.to('#fx-impact-word', {
        textShadow: '0 0 40px rgba(20,168,244,1), 0 0 80px rgba(20,168,244,0.5)',
        scale: 1.08, duration: 0.08, ease: 'power2.out',
      }, at);
      tl.fromTo('#fx-impact-flash', { opacity: 0 }, { opacity: 0.6, duration: 0.04 }, at);
      tl.to('#fx-impact-flash', { opacity: 0, duration: 0.15 }, at + 0.04);
      tl.to('#fx-impact-word', { textShadow: '0 0 0 transparent', scale: 1, duration: 0.25 }, at + 0.1);
    },

    'keyword-understrike'(tl, at) {
      positionKeywordUnder();
      const under = document.getElementById('fx-keyword-under');
      const width = under?.offsetWidth || 180;
      tl.set('#fx-keyword-under', { opacity: 1, scaleX: 0, x: 0, transformOrigin: 'left center' }, at);
      tl.to('#fx-impact-word', { textShadow: '0 0 20px rgba(20,168,244,0.85)', duration: 0.12 }, at);
      tl.to('#fx-keyword-under', { scaleX: 1, duration: 0.28, ease: 'power3.out' }, at);
      tl.to('#fx-keyword-under', {
        boxShadow: '0 0 18px rgba(20,168,244,0.95)',
        duration: 0.15,
      }, at + 0.18);
      tl.to('#fx-keyword-under', {
        scaleX: 0.22, x: width * 0.68, opacity: 0, duration: 0.24, ease: 'power2.in',
      }, at + 0.4);
      tl.to('#fx-impact-word', { textShadow: '0 0 0 transparent', duration: 0.2 }, at + 0.48);
    },

    'mesh-laser-grid'(tl, at) {
      const lines = [...document.querySelectorAll('#fx-mesh-laser span')];
      tl.set('#fx-mesh-laser', { opacity: 1 }, at);
      tl.fromTo(lines,
        { opacity: 0, scaleX: 0, transformOrigin: 'left center' },
        { opacity: 0.95, scaleX: 1, duration: 0.18, stagger: 0.05, ease: 'power2.out' },
        at
      );
      tl.to(lines, { opacity: 0.45, duration: 0.35, stagger: 0.03 }, at + 0.55);
    },

    'mesh-data-rain'(tl, at) {
      const drops = [...document.querySelectorAll('#fx-mesh-rain .fx-rain-drop')];
      drops.forEach((d, i) => {
        const col = i % 14;
        const row = Math.floor(i / 14);
        gsap.set(d, {
          left: 590 + col * 32 + (row % 3) * 6,
          top: -30 - (row % 6) * 45,
          opacity: 0,
          y: 0,
          x: 0,
          height: 28 + (i % 5) * 14,
        });
      });
      tl.set('#fx-mesh-rain', { opacity: 1 }, at);
      tl.to(drops, {
        y: 1380,
        opacity: 0.85,
        duration: () => gsap.utils.random(0.7, 1.3),
        stagger: { amount: 0.75, from: 'random' },
        ease: 'none',
      }, at);
      tl.to(drops, { opacity: 0, duration: 0.25 }, at + 1.1);
    },

    'signal-packet-burst'(tl, at) {
      const packets = [...document.querySelectorAll('#fx-data-packets .fx-data-packet')];
      tl.set('#fx-mesh-neural', { opacity: 1 }, at);
      packets.forEach((p, i) => {
        const ang = (i / packets.length) * Math.PI * 2;
        gsap.set(p, { left: 780, top: 340, opacity: 0, scale: 1 });
        tl.to(p, { opacity: 1, scale: 1.8, duration: 0.05 }, at);
        tl.to(p, {
          left: 780 + Math.cos(ang) * 220,
          top: 340 + Math.sin(ang) * 170,
          scale: 1,
          duration: 0.42, ease: 'power2.out',
        }, at);
        tl.to(p, { opacity: 0, scale: 0.4, duration: 0.14 }, at + 0.36);
      });
    },

    'signal-intercept'(tl, at) {
      tl.set('#fx-mesh', { opacity: 1 }, at);
      tl.set('#fx-hud-brackets', { opacity: 1 }, at);
      document.getElementById('fx-hud-brackets')?.classList.add('is-cta');
      tl.set('#fx-signal-dot', { attr: { cx: 760, cy: 80 }, opacity: 0, scale: 1 }, at);
      tl.to('#fx-signal-dot', { opacity: 1, duration: 0.05 }, at);
      tl.to('#fx-signal-dot', { attr: { cx: 860, cy: 520 }, duration: 0.38, ease: 'none' }, at);
      tl.fromTo('#fx-hud-brackets .fx-hud-corner',
        { scale: 0.6, opacity: 0 },
        { scale: 1.2, opacity: 1, duration: 0.1, stagger: 0.03 },
        at + 0.28
      );
      tl.fromTo('#fx-impact-flash', { opacity: 0 }, { opacity: 0.9, duration: 0.05 }, at + 0.32);
      tl.to('#fx-impact-flash', { opacity: 0, duration: 0.18 }, at + 0.37);
      tl.to('#fx-signal-dot', { scale: 2, opacity: 0, duration: 0.12 }, at + 0.33);
      tl.to('#fx-hud-brackets', { opacity: 0, duration: 0.2 }, at + 0.45);
    },

    'logo-hud-lock'(tl, at) {
      tl.set('#fx-logo', { opacity: 0 }, at);
      tl.set('#fx-hud-brackets', { opacity: 1 }, at);
      document.getElementById('fx-hud-brackets')?.classList.add('is-logo');
      tl.fromTo('#fx-hud-brackets .fx-hud-corner',
        { scale: 0, opacity: 0 },
        { scale: 1.2, opacity: 1, duration: 0.2, stagger: 0.04, ease: 'back.out(2.5)' },
        at
      );
      tl.to('#fx-hud-brackets .fx-hud-corner', { scale: 1, duration: 0.1, stagger: 0.02 }, at + 0.2);
      tl.fromTo('#fx-impact-flash', { opacity: 0 }, { opacity: 0.45, duration: 0.04 }, at + 0.18);
      tl.to('#fx-impact-flash', { opacity: 0, duration: 0.12 }, at + 0.22);
      tl.fromTo('#fx-logo',
        { opacity: 0, scale: 0.88, filter: 'blur(3px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power3.out' },
        at + 0.28
      );
      tl.to('#fx-hud-brackets', { opacity: 0, duration: 0.22 }, at + 0.55);
    },

    'cta-press-pulse'(tl, at) {
      tl.set('#fx-cta', { opacity: 1 }, at);
      tl.to('#fx-cta', { scale: 0.88, duration: 0.07, ease: 'power2.in' }, at);
      tl.to('#fx-cta', { scale: 1.1, duration: 0.12, ease: 'power2.out' }, at + 0.07);
      tl.to('#fx-cta', { scale: 1, duration: 0.14, ease: 'power2.inOut' }, at + 0.19);
      tl.fromTo('#fx-cta-pulse',
        { scale: 0.6, opacity: 0.85 },
        { scale: 2.4, opacity: 0, duration: 0.5, ease: 'power2.out' },
        at + 0.06
      );
      tl.fromTo('#fx-frame-punch-flash', { opacity: 0 }, { opacity: 0.35, duration: 0.04 }, at + 0.08);
      tl.to('#fx-frame-punch-flash', { opacity: 0, duration: 0.12 }, at + 0.12);
    },

    'holographic-glow'(tl, at) {
      tl.set('#fx-holographic-bloom', { opacity: 0, x: 0 }, at);
      tl.to('#fx-holographic-bloom', { opacity: 1, x: 8, duration: 0.14, ease: 'power2.out' }, at);
      tl.to('#fx-headline', {
        filter: 'drop-shadow(4px 0 rgba(255,50,90,0.55)) drop-shadow(-4px 0 rgba(20,168,244,0.7)) drop-shadow(0 0 28px rgba(20,168,244,0.55))',
        x: -3,
        duration: 0.14,
      }, at);
      tl.to('#fx-logo', {
        filter: 'drop-shadow(2px 0 rgba(255,50,90,0.4)) drop-shadow(-2px 0 rgba(20,168,244,0.5))',
        duration: 0.14,
      }, at);
      tl.to('#fx-holographic-bloom', { opacity: 0.65, x: -6, duration: 0.4, ease: 'sine.inOut' }, at + 0.16);
      tl.to('#fx-headline', { filter: 'none', x: 0, duration: 0.45, ease: 'power2.out' }, at + 0.22);
      tl.to('#fx-logo', { filter: 'none', duration: 0.4 }, at + 0.28);
      tl.to('#fx-holographic-bloom', { opacity: 0, x: 0, duration: 0.4 }, at + 0.6);
    },

    'blue-smoke'(tl, at) {
      tl.fromTo('#fx-finish-smoke',
        { opacity: 0, y: 40, scale: 1.08, x: 0 },
        { opacity: 0.78, y: 0, scale: 1, duration: 1.5, ease: 'power2.out' },
        at
      );
      tl.to('#fx-finish-smoke', { x: 16, duration: 2.4, ease: 'sine.inOut' }, at + 0.7);
      tl.to('#fx-finish-smoke', { opacity: 0.55, y: -14, duration: 1.3, ease: 'sine.inOut' }, at + 1.8);
    },

    'floating-code'(tl, at) {
      tl.fromTo('#fx-finish-code',
        { opacity: 0, y: 28, x: 14 },
        { opacity: 0.72, y: 0, x: 0, duration: 1.0, ease: 'power2.out' },
        at
      );
      tl.fromTo('#fx-finish-code-alt',
        { opacity: 0, y: 20, x: -10 },
        { opacity: 0.5, y: 0, x: 0, duration: 1.1, ease: 'power2.out' },
        at + 0.15
      );
      tl.to('#fx-finish-code', { y: -22, x: -10, duration: 2.6, ease: 'sine.inOut' }, at + 1.0);
      tl.to('#fx-finish-code-alt', { y: -16, x: 8, duration: 2.8, ease: 'sine.inOut' }, at + 1.1);
      tl.to('#fx-finish-code, #fx-finish-code-alt', { opacity: 0.4, duration: 0.8, ease: 'sine.inOut' }, at + 2.2);
    },

    'edge-energy'(tl, at) {
      tl.set('#fx-edge-energy', { opacity: 1 }, at);
      tl.fromTo('#fx-edge-energy',
        { opacity: 0, scale: 1.02 },
        { opacity: 1, scale: 1, duration: 0.14, ease: 'power2.out' },
        at
      );
      tl.to('#fx-edge-energy', { opacity: 0.35, duration: 0.2, ease: 'power2.in' }, at + 0.18);
      tl.to('#fx-edge-energy', { opacity: 0.9, duration: 0.1, ease: 'power2.out' }, at + 0.32);
      tl.to('#fx-edge-energy', { opacity: 0, duration: 0.4, ease: 'power2.in' }, at + 0.42);
    },

    'ambient-flicker'(tl, at) {
      tl.set('#fx-ambient-flicker', { opacity: 0 }, at);
      tl.to('#fx-bg', { filter: 'brightness(0.8) saturate(1.08)', duration: 0.1 }, at);
      tl.to('#fx-ambient-flicker', { opacity: 0.85, duration: 0.08 }, at);
      tl.to('#fx-bg', { filter: 'brightness(1.1) saturate(1.15)', duration: 0.14 }, at + 0.1);
      tl.to('#fx-ambient-flicker', { opacity: 0.4, duration: 0.1 }, at + 0.1);
      tl.to('#fx-bg', { filter: 'brightness(0.86) saturate(1)', duration: 0.1 }, at + 0.24);
      tl.to('#fx-ambient-flicker', { opacity: 0.7, duration: 0.08 }, at + 0.24);
      tl.to('#fx-bg', { filter: 'brightness(1.06) saturate(1.1)', duration: 0.16 }, at + 0.34);
      tl.to('#fx-ambient-flicker', { opacity: 0.2, duration: 0.25 }, at + 0.5);
      tl.to('#fx-bg', { filter: 'brightness(0.95) saturate(1)', duration: 0.3 }, at + 0.55);
    },

    'depth-shadow-shift'(tl, at) {
      tl.set('#fx-depth-shift', { opacity: 0, x: 0 }, at);
      tl.to('.fx-vignette', { opacity: 1, duration: 1.1, ease: 'power2.inOut' }, at);
      tl.to('#fx-depth-shift', { opacity: 0.62, x: 18, duration: 1.1, ease: 'power2.inOut' }, at);
      tl.to('.fx-vignette', { opacity: 0.7, duration: 1.1, ease: 'power2.inOut' }, at + 1.1);
      tl.to('#fx-depth-shift', { opacity: 0.28, x: -12, duration: 1.1, ease: 'power2.inOut' }, at + 1.1);
    },
  };

  function initRestLayers() {
    initShutter();
    initMeshRain();
    initMeshFirewall();
    initMeshLaser();
    initPixelBreak();
    initDataBurst();
    initFinishCode();
    const rain = document.querySelectorAll('#fx-mesh-rain .fx-rain-drop');
    rain.forEach((d, i) => {
      const col = i % 14;
      const row = Math.floor(i / 14);
      d.style.left = `${590 + col * 32 + (row % 3) * 6}px`;
      d.style.top = `${-30 - (row % 6) * 45}px`;
      d.style.height = `${28 + (i % 5) * 14}px`;
    });
    const fw = document.querySelectorAll('#fx-mesh-firewall span');
    fw.forEach((b, i) => {
      b.style.left = `${600 + i * 28}px`;
      b.style.bottom = '0';
      b.style.height = `${120 + (i % 4) * 40}px`;
    });
    const laser = document.querySelectorAll('#fx-mesh-laser span');
    laser.forEach((l, i) => {
      l.style.top = `${180 + i * 55}px`;
      l.style.left = '580px';
      l.style.width = `${200 + (i % 3) * 80}px`;
    });
    const box = document.getElementById('fx-keyword-box');
    if (box) positionKeywordBox();
    positionKeywordUnder();
  }

  V2.positionKeywordUnder = positionKeywordUnder;

  Object.assign(V2.Effects, REST_EFFECTS);
  Object.assign(V2.SOLO_PREPARE, REST_SOLO);
  Object.assign(V2.resetV2, REST_RESET);

  const baseInit = V2.initLayers;
  V2.initLayers = function initAllLayers() {
    if (baseInit) baseInit();
    initRestLayers();
  };
})(typeof window !== 'undefined' ? window : global);
