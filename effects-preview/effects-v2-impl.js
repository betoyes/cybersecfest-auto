/**
 * CybersecFEST Motion Library v2 — implementações GSAP
 */
(function (global) {
  'use strict';

  function pathLen(el) {
    if (typeof el.getTotalLength !== 'function') return 0;
    return el.getTotalLength();
  }

  function initAltMeshPaths() {
    /* usa path.fx-signal-route para evitar pegar o <div> homônimo do animated-mesh */
    document.querySelectorAll('#fx-neural-lines path, #fx-circuit-lines path, path.fx-signal-route').forEach((p) => {
      const len = pathLen(p);
      if (!len) return;
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    });
  }

  function initPowerGrid() {
    const grid = document.getElementById('fx-power-grid');
    if (!grid || grid.childElementCount) return;
    for (let i = 0; i < 48; i++) {
      const cell = document.createElement('span');
      grid.appendChild(cell);
    }
  }

  function initLogoPixels() {
    const wrap = document.getElementById('fx-logo-pixels');
    if (!wrap || wrap.childElementCount) return;
    for (let i = 0; i < 80; i++) {
      const cell = document.createElement('span');
      wrap.appendChild(cell);
    }
  }

  function initHlFragments() {
    const root = document.getElementById('fx-hl-fragments');
    if (!root || root.childElementCount) return;
    for (let i = 0; i < 24; i++) {
      const f = document.createElement('div');
      f.className = 'fx-hl-frag';
      root.appendChild(f);
    }
  }

  function initDataPackets() {
    const root = document.getElementById('fx-data-packets');
    if (!root || root.childElementCount) return;
    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'fx-data-packet';
      p.dataset.i = String(i);
      root.appendChild(p);
    }
  }

  function drawAltPaths(tl, selector, at, opts = {}) {
    const paths = [...document.querySelectorAll(selector)];
    const opacity = opts.opacity ?? 0.55;
    const duration = opts.duration ?? 0.4;
    const stagger = opts.stagger ?? 0.06;
    paths.forEach((path, i) => {
      const len = pathLen(path);
      tl.set(path, { strokeDashoffset: len, opacity: 0 }, at);
      tl.to(path, { strokeDashoffset: 0, opacity, duration, ease: opts.ease || 'power3.out' }, at + i * stagger);
    });
  }

  function soloVisible(applyStates) {
    applyStates({
      '#fx-blackout': { opacity: 0 },
      '#fx-bg-wrap': { opacity: 1, scale: 1.05 },
      '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
      '#fx-logo': { clipPath: 'inset(0 0% 0 0)', opacity: 1 },
      '#fx-logo-pixels span': { opacity: 0, scale: 0.3 },
      '#fx-divider': { scaleX: 1 },
      '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)', x: 0,
      },
    });
  }

  const resetV2 = {
    '#fx-portal-reveal': { opacity: 0, clipPath: 'inset(0 50% 0 50%)' },
    '#fx-power-grid': { opacity: 0 },
    '#fx-power-grid span': { opacity: 0, scale: 0.6 },
    '#fx-energy-wipe': { opacity: 0, x: '-120%' },
    '#fx-frame-punch-flash': { opacity: 0 },
    '#fx-scene': { scale: 1, x: 0, y: 0 },
    '#fx-mesh-neural, #fx-mesh-shield, #fx-mesh-circuit': { opacity: 0 },
    '#fx-neural-nodes .fx-neural-node, #fx-circuit-nodes .fx-circuit-node': { scale: 0, opacity: 0 },
    '#fx-shield-poly': { opacity: 0, attr: { 'stroke-width': 1.2 } },
    '#fx-signal-route': { opacity: 0 },
    '#fx-hl-fragments .fx-hl-frag': { opacity: 0, scale: 0.4, x: 0, y: 0 },
    '#fx-keyword-stamp': { opacity: 0, scale: 1.8, rotation: -8 },
    '#fx-data-packets .fx-data-packet': { opacity: 0, x: 0, y: 0 },
    '#fx-cta-energy .fx-cta-el-top': { attr: { width: 0 } },
    '#fx-cta-energy .fx-cta-el-right': { attr: { height: 0, y: 0 } },
    '#fx-cta-energy .fx-cta-el-bottom': { attr: { width: 0, x: 400 } },
    '#fx-cta-energy .fx-cta-el-left': { attr: { height: 0, y: 80 } },
  };

  const SOLO_PREPARE = {
    'portal-reveal'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-blackout': { opacity: 1 },
        '#fx-bg-wrap': { opacity: 0 },
        '#fx-portal-reveal': { opacity: 1, clipPath: 'inset(0 50% 0 50%)' },
      });
    },
    'grid-power-on'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-blackout': { opacity: 1 },
        '#fx-bg-wrap': { opacity: 0 },
        '#fx-power-grid': { opacity: 1 },
        '#fx-power-grid span': { opacity: 0, scale: 0.6 },
      });
    },
    'headline-slam'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
          y: -50, opacity: 0, scale: 1.2, clipPath: 'inset(0% 0 0 0)',
        },
      });
    },
    'headline-fragment-assemble'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': { opacity: 0 },
        '#fx-hl-fragments .fx-hl-frag': { opacity: 0, scale: 0.4 },
      });
    },
    'keyword-stamp'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-keyword-stamp': { opacity: 0, scale: 1.8, rotation: -8 },
      });
    },
    'mesh-neural-flow'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-mesh-neural': { opacity: 1 },
        '#fx-neural-nodes .fx-neural-node': { scale: 0, opacity: 0 },
      });
      initAltMeshPaths();
    },
    'mesh-polygon-shield'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-mesh-shield': { opacity: 1 },
        '#fx-shield-poly': { opacity: 0, attr: { 'stroke-width': 0.5 } },
      });
    },
    'mesh-circuit-board'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-mesh-circuit': { opacity: 1 },
        '#fx-circuit-nodes .fx-circuit-node': { scale: 0, opacity: 0 },
      });
      initAltMeshPaths();
    },
    'signal-route'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-mesh': { opacity: 1 },
        '#fx-signal-route': { opacity: 0 },
        '#fx-signal-dot': { opacity: 0, attr: { cx: 760, cy: 80 } },
        '#fx-cta': { opacity: 0, scale: 0.9 },
      });
      initAltMeshPaths();
    },
    'signal-chain-reaction'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-mesh-neural': { opacity: 1 },
        '#fx-neural-nodes .fx-neural-node': { scale: 0, opacity: 0 },
      });
    },
    'cta-energy-frame'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-cta': { opacity: 0, scale: 0.9 },
        '#fx-cta-arrow': { opacity: 0, x: -16 },
      });
    },
    'cta-data-transfer'() {
      soloVisible(global.__fxApply);
      global.__fxApply({
        '#fx-mesh': { opacity: 1 },
        '#fx-cta': { opacity: 0, scale: 0.85 },
        '#fx-data-packets .fx-data-packet': { opacity: 0 },
      });
    },
    'frame-punch'() {
      soloVisible(global.__fxApply);
      global.__fxApply({ '#fx-scene': { scale: 1 }, '#fx-frame-punch-flash': { opacity: 0 } });
    },
    'energy-wipe'() {
      soloVisible(global.__fxApply);
      global.__fxApply({ '#fx-energy-wipe': { opacity: 0, x: '-120%' } });
    },
  };

  const Effects = {
    'portal-reveal'(tl, at) {
      tl.set('#fx-blackout', { opacity: 1 }, at);
      tl.set('#fx-portal-reveal', { opacity: 1, clipPath: 'inset(0 50% 0 50%)' }, at);
      tl.to('#fx-portal-reveal', { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power4.inOut' }, at + 0.05);
      tl.fromTo('#fx-bg-wrap',
        { opacity: 0, scale: 1.14 },
        { opacity: 1, scale: 1.05, duration: 0.5, ease: 'power3.out' },
        at + 0.2
      );
      tl.to('#fx-blackout', { opacity: 0, duration: 0.35, ease: 'power2.out' }, at + 0.25);
      tl.to('#fx-portal-reveal', { opacity: 0, duration: 0.25 }, at + 0.55);
    },

    'grid-power-on'(tl, at) {
      tl.set('#fx-blackout', { opacity: 1 }, at);
      tl.set('#fx-power-grid', { opacity: 1 }, at);
      tl.fromTo('#fx-power-grid span',
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.08, stagger: { amount: 0.45, from: 'random' }, ease: 'power2.out' },
        at + 0.05
      );
      tl.to('#fx-power-grid span', { opacity: 0, duration: 0.2, stagger: 0.01 }, at + 0.55);
      tl.to('#fx-power-grid', { opacity: 0, duration: 0.15 }, at + 0.65);
      tl.to('#fx-blackout', { opacity: 0, duration: 0.3, ease: 'power2.out' }, at + 0.5);
      tl.fromTo('#fx-bg-wrap',
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1.05, duration: 0.45, ease: 'power3.out' },
        at + 0.55
      );
    },

    'headline-slam'(tl, at) {
      tl.fromTo('#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5',
        { y: -50, opacity: 0, scale: 1.2 },
        { y: 0, opacity: 1, scale: 1, duration: 0.22, stagger: 0.08, ease: 'back.out(2.5)' },
        at
      );
    },

    'headline-fragment-assemble'(tl, at) {
      const frags = [...document.querySelectorAll('#fx-hl-fragments .fx-hl-frag')];
      const rows = ['#fx-row-1', '#fx-row-2', '#fx-row-3', '#fx-row-4', '#fx-row-5'];
      const positions = [
        { l: 68, t: 380, w: 80, h: 28 }, { l: 120, t: 380, w: 100, h: 28 },
        { l: 68, t: 450, w: 90, h: 28 }, { l: 160, t: 450, w: 70, h: 28 },
        { l: 68, t: 520, w: 60, h: 28 }, { l: 130, t: 520, w: 80, h: 28 },
        { l: 68, t: 590, w: 110, h: 28 }, { l: 180, t: 590, w: 90, h: 28 },
        { l: 68, t: 660, w: 70, h: 28 }, { l: 140, t: 660, w: 100, h: 28 },
        { l: 68, t: 730, w: 85, h: 28 }, { l: 155, t: 730, w: 75, h: 28 },
        { l: 68, t: 800, w: 95, h: 28 }, { l: 165, t: 800, w: 65, h: 28 },
        { l: 68, t: 870, w: 70, h: 28 }, { l: 140, t: 870, w: 80, h: 28 },
        { l: 68, t: 940, w: 100, h: 28 }, { l: 170, t: 940, w: 70, h: 28 },
        { l: 68, t: 1010, w: 80, h: 28 }, { l: 150, t: 1010, w: 90, h: 28 },
        { l: 90, t: 420, w: 50, h: 20 }, { l: 200, t: 480, w: 45, h: 20 },
        { l: 100, t: 560, w: 55, h: 20 }, { l: 210, t: 620, w: 40, h: 20 },
      ];
      frags.forEach((el, i) => {
        const p = positions[i % positions.length];
        gsap.set(el, { left: p.l, top: p.t, width: p.w, height: p.h });
      });
      tl.set(rows.join(', '), { opacity: 0 }, at);
      tl.fromTo(frags,
        { opacity: 0, scale: 0.3, x: () => gsap.utils.random(-40, 40), y: () => gsap.utils.random(-30, 30) },
        { opacity: 0.85, scale: 1, x: 0, y: 0, duration: 0.18, stagger: 0.03, ease: 'power3.out' },
        at
      );
      tl.to(frags, { opacity: 0, scale: 0.2, duration: 0.12, stagger: 0.02 }, at + 0.55);
      tl.fromTo(rows.join(', '),
        { opacity: 0, y: 12, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.28, stagger: 0.07, ease: 'power4.out' },
        at + 0.62
      );
    },

    'keyword-stamp'(tl, at) {
      const stamp = document.getElementById('fx-keyword-stamp');
      const target = document.querySelector('#fx-row-1 .fx-blue');
      if (stamp && target) {
        const r = target.getBoundingClientRect();
        const stage = document.getElementById('preview-stage').getBoundingClientRect();
        const scale = 1080 / stage.width;
        stamp.textContent = 'C-LEVELS';
        gsap.set(stamp, {
          left: (r.left - stage.left) * scale - 8,
          top: (r.top - stage.top) * scale - 28,
        });
      }
      tl.fromTo('#fx-impact-flash', { opacity: 0 }, { opacity: 0.7, duration: 0.04 }, at);
      tl.to('#fx-impact-flash', { opacity: 0, duration: 0.12 }, at + 0.04);
      tl.fromTo('#fx-keyword-stamp',
        { opacity: 0, scale: 1.8, rotation: -12 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.2, ease: 'back.out(3)' },
        at
      );
      tl.to('#fx-row-1 .fx-blue', {
        textShadow: '0 0 24px rgba(20,168,244,1)',
        duration: 0.1,
      }, at);
      tl.to('#fx-row-1 .fx-blue', { textShadow: '0 0 0 rgba(20,168,244,0)', duration: 0.25 }, at + 0.15);
      tl.to('#fx-keyword-stamp', { opacity: 0, scale: 0.8, duration: 0.15, ease: 'power2.in' }, at + 0.45);
    },

    'mesh-neural-flow'(tl, at) {
      tl.set('#fx-mesh-neural', { opacity: 1 }, at);
      drawAltPaths(tl, '#fx-neural-lines path', at, { opacity: 0.5, duration: 0.45, stagger: 0.08 });
      tl.fromTo('#fx-neural-nodes .fx-neural-node',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.18, stagger: 0.05, ease: 'back.out(2)' },
        at + 0.35
      );
      tl.set('#fx-signal-dot', { attr: { cx: 720, cy: 120 }, opacity: 0 }, at);
      tl.to('#fx-signal-dot', { opacity: 1, duration: 0.05 }, at + 0.4);
      tl.to('#fx-signal-dot', { attr: { cx: 780, cy: 340 }, duration: 0.18, ease: 'none' }, at + 0.4);
      tl.to('#fx-signal-dot', { attr: { cx: 860, cy: 520 }, duration: 0.2, ease: 'none' }, at + 0.58);
      tl.to('#fx-signal-dot', { attr: { cx: 880, cy: 860 }, duration: 0.22, ease: 'none' }, at + 0.78);
      tl.to('#fx-signal-dot', { opacity: 0, duration: 0.1 }, at + 0.98);
    },

    'mesh-polygon-shield'(tl, at) {
      const polys = [...document.querySelectorAll('#fx-shield-poly')];
      tl.set('#fx-mesh-shield', { opacity: 1 }, at);
      polys.forEach((poly, i) => {
        const t = at + i * 0.11;
        tl.set(poly, { opacity: 0, attr: { 'stroke-width': 0.4, stroke: 'rgba(20,168,244,0.35)' } }, at);
        tl.to(poly, { opacity: 0.9, duration: 0.32, ease: 'power3.out' }, t);
        tl.to(poly, { attr: { 'stroke-width': 2.4, stroke: 'rgba(20,168,244,0.95)' }, duration: 0.22, ease: 'power2.out' }, t + 0.08);
        tl.to(poly, { opacity: 0.45, duration: 0.35, ease: 'power2.inOut' }, t + 0.55);
      });
    },

    'mesh-circuit-board'(tl, at) {
      tl.set('#fx-mesh-circuit', { opacity: 1 }, at);
      drawAltPaths(tl, '#fx-circuit-lines path', at, { opacity: 0.55, duration: 0.5, stagger: 0.12, ease: 'power2.out' });
      tl.fromTo('#fx-circuit-nodes .fx-circuit-node',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.12, stagger: 0.06, ease: 'power2.out' },
        at + 0.4
      );
    },

    'signal-route'(tl, at) {
      const route = document.getElementById('fx-signal-route');
      if (!route) return;
      const len = pathLen(route);
      tl.set('#fx-mesh', { opacity: 1 }, at);
      tl.set(route, { strokeDashoffset: len, opacity: 0.6 }, at);
      tl.to(route, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, at);
      tl.set('#fx-signal-dot', { attr: { cx: 760, cy: 80 }, opacity: 0 }, at);
      tl.to('#fx-signal-dot', { opacity: 1, duration: 0.05 }, at);
      tl.to('#fx-signal-dot', { attr: { cx: 340, cy: 1120 }, duration: 0.65, ease: 'none' }, at);
      tl.to('#fx-signal-dot', { opacity: 0, duration: 0.08 }, at + 0.62);
      tl.fromTo('#fx-cta',
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 0.28, ease: 'power3.out' },
        at + 0.55
      );
    },

    'signal-chain-reaction'(tl, at) {
      tl.set('#fx-mesh-neural', { opacity: 1 }, at);
      const nodes = [...document.querySelectorAll('#fx-neural-nodes .fx-neural-node')];
      nodes.forEach((node, i) => {
        tl.fromTo(node,
          { scale: 0, opacity: 0 },
          { scale: 1.4, opacity: 1, duration: 0.12, ease: 'power2.out' },
          at + i * 0.12
        );
        tl.to(node, { scale: 1, duration: 0.15, ease: 'power2.inOut' }, at + i * 0.12 + 0.12);
        if (i > 0) {
          tl.fromTo(`#fx-neural-lines path:nth-child(${Math.min(i, 4)})`,
            { opacity: 0.2 },
            { opacity: 0.6, duration: 0.1 },
            at + i * 0.12
          );
        }
      });
    },

    'cta-energy-frame'(tl, at) {
      tl.set('#fx-cta-energy .fx-cta-el-top', { attr: { width: 0, x: 0, y: 2 } }, at);
      tl.set('#fx-cta-energy .fx-cta-el-right', { attr: { height: 0, x: 398, y: 0 } }, at);
      tl.set('#fx-cta-energy .fx-cta-el-bottom', { attr: { width: 0, x: 400, y: 78 } }, at);
      tl.set('#fx-cta-energy .fx-cta-el-left', { attr: { height: 0, x: 0, y: 80 } }, at);
      tl.to('#fx-cta-energy .fx-cta-el-top', { attr: { width: 400 }, duration: 0.2, ease: 'power2.inOut' }, at);
      tl.to('#fx-cta-energy .fx-cta-el-right', { attr: { height: 80, y: 0 }, duration: 0.15, ease: 'power2.inOut' }, at + 0.18);
      tl.to('#fx-cta-energy .fx-cta-el-bottom', { attr: { width: 400, x: 0 }, duration: 0.2, ease: 'power2.inOut' }, at + 0.3);
      tl.to('#fx-cta-energy .fx-cta-el-left', { attr: { height: 80, y: 0 }, duration: 0.15, ease: 'power2.inOut' }, at + 0.48);
      tl.fromTo('#fx-cta',
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'power3.out' },
        at + 0.35
      );
      tl.fromTo('#fx-cta-arrow',
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.18, ease: 'power4.out' },
        at + 0.5
      );
    },

    'cta-data-transfer'(tl, at) {
      const packets = [...document.querySelectorAll('#fx-data-packets .fx-data-packet')];
      const origins = [
        { x: 820, y: 200 }, { x: 900, y: 400 }, { x: 760, y: 600 },
        { x: 880, y: 750 }, { x: 700, y: 350 }, { x: 940, y: 550 },
      ];
      packets.forEach((p, i) => {
        const o = origins[i % origins.length];
        gsap.set(p, { left: o.x, top: o.y, opacity: 0 });
      });
      tl.set('#fx-mesh', { opacity: 1 }, at);
      tl.set('#fx-cta', { opacity: 0 }, at);
      packets.forEach((p, i) => {
        tl.to(p, { opacity: 1, duration: 0.05 }, at + i * 0.1);
        tl.to(p, { left: 200, top: 1180, duration: 0.35, ease: 'power2.inOut' }, at + i * 0.1);
        tl.to(p, { opacity: 0, duration: 0.08 }, at + i * 0.1 + 0.32);
      });
      tl.fromTo('#fx-cta',
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1.05, duration: 0.22, ease: 'power3.out' },
        at + 0.55
      );
      tl.to('#fx-cta', { scale: 1, duration: 0.12 }, at + 0.77);
      tl.fromTo('#fx-cta-pulse',
        { scale: 0.6, opacity: 0.7 },
        { scale: 2.2, opacity: 0, duration: 0.45, ease: 'power2.out' },
        at + 0.6
      );
    },

    'frame-punch'(tl, at) {
      tl.to('#fx-scene', { scale: 1.04, duration: 0.06, ease: 'power4.in' }, at);
      tl.fromTo('#fx-frame-punch-flash', { opacity: 0 }, { opacity: 0.85, duration: 0.04 }, at);
      tl.to('#fx-frame-punch-flash', { opacity: 0, duration: 0.14 }, at + 0.04);
      tl.to('#fx-scene', { scale: 1, duration: 0.2, ease: 'power3.out' }, at + 0.06);
    },

    'energy-wipe'(tl, at) {
      tl.set('#fx-energy-wipe', { opacity: 1, x: '-120%' }, at);
      tl.to('#fx-energy-wipe', { x: '120%', duration: 0.55, ease: 'power3.inOut' }, at);
      tl.to('#fx-energy-wipe', { opacity: 0, duration: 0.15 }, at + 0.5);
    },
  };

  global.__effectsV2 = {
    Effects,
    SOLO_PREPARE,
    resetV2,
    initLayers() {
      initPowerGrid();
      initLogoPixels();
      initHlFragments();
      initDataPackets();
      initAltMeshPaths();
    },
  };
})(typeof window !== 'undefined' ? window : global);
