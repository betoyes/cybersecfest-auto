/**
 * CybersecFEST Effects Preview Lab — app principal
 */
(function () {
  'use strict';

  if (!window.EffectsCatalog) {
    var msg = '🚨 window.EffectsCatalog não carregou! effects-data.js falhou.';
    console.error(msg);
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#c00;color:#fff;padding:16px 20px;font:14px monospace;';
    box.textContent = msg;
    document.body && document.body.prepend(box);
    return;
  }

  const REMOVED_HARD = new Set([
    'headline-echo', 'mesh-radar-field', 'mesh-firewall-wall', 'signal-strobe',
    'logo-light-trace', 'logo-scan-entry', 'cta-target-lock', 'cta-glass-sweep',
    'cta-breach-open', 'pixel-break', 'focus-flare', 'logo-pixel-resolve', 'screen-slice',
  ]);

  const catalog = window.EffectsCatalog;
  const removedIds = catalog.REMOVED_EFFECT_IDS || REMOVED_HARD;
  const CATALOG_VERSION = catalog.CATALOG_VERSION || '20260627b';

  catalog.EFFECTS = catalog.EFFECTS.filter((e) => !removedIds.has(e.id));
  catalog.byId = function byId(id) {
    if (removedIds.has(id)) return null;
    return catalog.EFFECTS.find((e) => e.id === id) || null;
  };
  catalog.byCategory = function byCategory(cat) {
    return catalog.EFFECTS.filter((e) => e.category === cat);
  };

  const {
    EFFECTS, COMBOS, CATEGORIES, STORAGE_KEY, CURATED_APPROVALS = {},
    LEGACY_STORAGE_KEYS = [],
  } = catalog;

  let mainTl = null;
  let speed = 1;
  let phaseTickerFn = null;
  let approvals = loadApprovals();
  let showRejectedCatalog = false;
  let showApprovedSection = false;
  let catalogFilter = 'all';
  let lastRun = { type: 'idle', label: '' };

  const BUILDER_KEYS = [
    { key: 'opening', label: 'Abertura', cat: 'opening' },
    { key: 'background', label: 'Background', cat: 'background' },
    { key: 'logo', label: 'Logo', cat: 'logo' },
    { key: 'mesh', label: 'Malha', cat: 'mesh' },
    { key: 'signal', label: 'Sinal', cat: 'signal' },
    { key: 'text', label: 'Headline', cat: 'text' },
    { key: 'keyword', label: 'Palavra-chave', cat: 'keyword' },
    { key: 'cta', label: 'CTA', cat: 'cta' },
    { key: 'transition', label: 'Transição', cat: 'transition' },
    { key: 'finish', label: 'Acabamento', cat: 'finish' },
    { key: 'social', label: 'Social Impact', cat: 'social-impact' },
    { key: 'svgfx', label: 'SVG Motion', cat: 'svg-motion' },
    { key: 'depth', label: 'Depth / Focus', cat: 'depth-focus' },
    { key: 'amdmesh', label: 'Animated Mesh', cat: 'animated-mesh-depth' },
  ];

  const COMBO_SLOTS = {
    opening: { at: 0, phase: 'opening' },
    background: { at: 0.4, phase: 'opening' },
    logo: { at: 0.75, phase: 'logo' },
    mesh: { at: 1.2, phase: 'mesh' },
    signal: { at: 1.85, phase: 'mesh' },
    text: { at: 2.5, phase: 'headline' },
    keyword: { at: 3.15, phase: 'headline' },
    cta: { at: 4.9, phase: 'cta' },
    transition: { at: 6.4, phase: 'transition' },
    finish: { at: 7.0, phase: 'transition' },
    social: { at: 1.55, phase: 'mesh' },
    svgfx: { at: 1.0, phase: 'mesh' },
    depth: { at: 0.2, phase: 'opening' },
    amdmesh: { at: 1.2, phase: 'mesh' },
  };

  const V2 = window.__effectsV2 || {};

  function $(sel) { return document.querySelector(sel); }
  function $all(sel) { return [...document.querySelectorAll(sel)]; }

  function initMeshPaths() {
    $all('#fx-mesh-lines path').forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    const link = $('#fx-mesh-link');
    if (link) {
      const len = link.getTotalLength();
      link.style.strokeDasharray = len;
      link.style.strokeDashoffset = len;
    }
  }

  function applyStates(states) {
    Object.entries(states).forEach(([selector, vars]) => {
      gsap.set(selector, vars);
    });
  }
  window.__fxApply = applyStates;

  function applyV2Reset() {
    if (V2.resetV2) applyStates(V2.resetV2);
    document.getElementById('fx-hud-brackets')?.classList.remove('is-logo', 'is-cta');
  }

  function hardResetTweens() {
    if (mainTl) {
      mainTl.kill();
      mainTl = null;
    }
    if (phaseTickerFn) {
      gsap.ticker.remove(phaseTickerFn);
      phaseTickerFn = null;
    }
    gsap.killTweensOf('#fx-scene, #fx-scene *');
    $all('#fx-scene [data-fx-wave]').forEach((el) => el.remove());
  }

  function resetMeshPaths() {
    initMeshPaths();
    $all('#fx-mesh-lines path').forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
      p.style.opacity = '0';
    });
    const link = $('#fx-mesh-link');
    if (link) {
      const len = link.getTotalLength();
      link.style.strokeDasharray = String(len);
      link.style.strokeDashoffset = String(len);
      link.style.opacity = '0';
    }
  }

  function meshPathLength(el) {
    return el.getTotalLength();
  }

  function setMeshPathsHidden() {
    gsap.set('#fx-mesh-lines path', {
      strokeDashoffset: (i, el) => meshPathLength(el),
      opacity: 0,
    });
    const link = $('#fx-mesh-link');
    if (link) {
      gsap.set(link, {
        strokeDashoffset: meshPathLength(link),
        opacity: 0,
      });
    }
  }

  function animateMeshDraw(tl, at, opts = {}) {
    const paths = $all('#fx-mesh-lines path');
    const opacity = opts.opacity ?? 0.6;
    const duration = opts.duration ?? 0.35;
    const stagger = opts.stagger ?? 0.05;
    const delay = opts.delay ?? 0;

    tl.set('#fx-mesh', { opacity: 1 }, at);
    paths.forEach((path, i) => {
      const len = meshPathLength(path);
      tl.set(path, { strokeDashoffset: len, opacity: 0 }, at + delay);
      tl.to(path, {
        strokeDashoffset: 0,
        opacity,
        duration,
        ease: opts.ease || 'power3.out',
      }, at + delay + i * stagger);
    });
  }

  function showIdleState() {
    hardResetTweens();
    resetMeshPaths();
    applyStates({
      '#fx-blackout': { opacity: 0 },
      '#fx-bg-wrap': { opacity: 1, scale: 1.05, x: 0, y: 0 },
      '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
      '#fx-startup-flash': { x: '110%', opacity: 0 },
      '#fx-light-sweep': { x: '-80%', opacity: 0 },
      '#fx-impact-flash': { opacity: 0 },
      '#fx-signal-distortion': { opacity: 0, skewX: 0 },
      '#fx-mesh': { opacity: 0, scale: 1, x: 0, y: 0 },
      '#fx-mesh-nodes .fx-mesh-node': { scale: 1, opacity: 0.9 },
      '#fx-signal-dot': { opacity: 0, attr: { cx: 760, cy: 80 } },
      '#fx-scan-h': { y: -20, opacity: 0 },
      '#fx-scan-v': { left: -20, opacity: 0 },
      '#fx-scan-d': { opacity: 0, x: 0 },
      '#fx-logo': { clipPath: 'inset(0 0% 0 0)' },
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        y: 0, x: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)',
      },
      '#fx-impact-word': { textShadow: '0 0 0 rgba(20,168,244,0)' },
      '#fx-headline': { x: 0 },
      '#fx-divider': { scaleX: 1 },
      '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
      '#fx-cta-outline': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      '#fx-cta-pulse': { scale: 1, opacity: 0 },
      '#fx-cta': { opacity: 0, scale: 1, y: 0 },
      '#fx-cta-arrow': { x: 0, opacity: 0 },
    });
    applyV2Reset();
    clearPhases();
  }

  function resetPreview(quiet) {
    showIdleState();
    if (!quiet) setStatus('Preview resetado.');
  }

  function prepareComboStart() {
    hardResetTweens();
    resetMeshPaths();
    setMeshPathsHidden();
    applyStates({
      '#fx-blackout': { opacity: 1 },
      '#fx-bg-wrap': { opacity: 0, scale: 1.18, x: 0, y: 0 },
      '#fx-bg': { filter: 'brightness(0.2) saturate(0.8)' },
      '#fx-startup-flash': { x: '110%', opacity: 0 },
      '#fx-light-sweep': { x: '-80%', opacity: 0 },
      '#fx-impact-flash': { opacity: 0 },
      '#fx-signal-distortion': { opacity: 0, skewX: 0 },
      '#fx-mesh': { opacity: 0, scale: 1, x: 0, y: 0 },
      '#fx-mesh-nodes .fx-mesh-node': { scale: 0, opacity: 0 },
      '#fx-signal-dot': { opacity: 0, attr: { cx: 760, cy: 80 } },
      '#fx-mesh-link': { opacity: 0 },
      '#fx-scan-h': { y: -20, opacity: 0 },
      '#fx-scan-v': { left: -20, opacity: 0 },
      '#fx-scan-d': { opacity: 0, x: 0 },
      '#fx-logo': { clipPath: 'inset(0 100% 0 0)' },
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        y: 70, opacity: 0, clipPath: 'inset(100% 0 0 0)', scale: 1, filter: 'blur(0px)',
      },
      '#fx-impact-word': { textShadow: '0 0 0 rgba(20,168,244,0)' },
      '#fx-headline': { x: 0 },
      '#fx-divider': { scaleX: 0 },
      '#fx-subtitle': { opacity: 0, filter: 'blur(6px)', y: 12 },
      '#fx-cta-outline': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      '#fx-cta-pulse': { scale: 1, opacity: 0 },
      '#fx-cta': { opacity: 0, scale: 0.9, y: 0 },
      '#fx-cta-arrow': { x: -20, opacity: 0 },
    });
    applyV2Reset();
    clearPhases();
  }

  const SOLO_PREPARE = {
    'blackout-strike'() {
      applyStates({
        '#fx-blackout': { opacity: 1 },
        '#fx-bg-wrap': { opacity: 0, scale: 1.18 },
        '#fx-bg': { filter: 'brightness(0.2) saturate(0.8)' },
        '#fx-startup-flash': { x: '110%', opacity: 0 },
        '#fx-signal-distortion': { opacity: 0, skewX: 0 },
      });
    },

    'light-sweep-reveal'() {
      applyStates({
        '#fx-blackout': { opacity: 0 },
        '#fx-bg-wrap': { opacity: 0, scale: 1.12 },
        '#fx-light-sweep': { x: '-90%', opacity: 0 },
      });
    },

    'mask-rise'() {
      applyStates({
        '#fx-blackout': { opacity: 0 },
        '#fx-bg-wrap': { opacity: 1, scale: 1.05 },
        '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
        '#fx-logo': { clipPath: 'inset(0 0% 0 0)' },
        '#fx-divider': { scaleX: 1 },
        '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
          y: 70, opacity: 0, clipPath: 'inset(100% 0 0 0)', scale: 1, filter: 'blur(0px)',
        },
      });
    },

    'impact-word'() {
      applyStates({
        '#fx-blackout': { opacity: 0 },
        '#fx-bg-wrap': { opacity: 1, scale: 1.05 },
        '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
        '#fx-logo': { clipPath: 'inset(0 0% 0 0)' },
        '#fx-divider': { scaleX: 1 },
        '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
        '#fx-mesh': { opacity: 1 },
        '#fx-mesh-nodes .fx-mesh-node': { scale: 1, opacity: 0.9 },
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-5': {
          y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)',
        },
        '#fx-row-4': { y: 70, opacity: 0, scale: 1.15, filter: 'blur(6px)', clipPath: 'inset(0% 0 0 0)' },
        '#fx-impact-flash': { opacity: 0 },
        '#fx-impact-word': { textShadow: '0 0 0 rgba(20,168,244,0)' },
      });
      setMeshPathsHidden();
    },

    'mesh-network-flow'() {
      applyStates({
        '#fx-blackout': { opacity: 0 },
        '#fx-bg-wrap': { opacity: 1, scale: 1.05 },
        '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
        '#fx-logo': { clipPath: 'inset(0 0% 0 0)' },
        '#fx-divider': { scaleX: 1 },
        '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
          y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)',
        },
        '#fx-mesh': { opacity: 1 },
        '#fx-mesh-nodes .fx-mesh-node': { scale: 0, opacity: 0 },
        '#fx-signal-dot': { opacity: 0, attr: { cx: 760, cy: 80 } },
      });
      setMeshPathsHidden();
    },

    'mesh-city-map'() {
      applyStates({
        '#fx-blackout': { opacity: 0 },
        '#fx-bg-wrap': { opacity: 1, scale: 1.05 },
        '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
        '#fx-logo': { clipPath: 'inset(0 0% 0 0)' },
        '#fx-divider': { scaleX: 1 },
        '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
          y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)',
        },
        '#fx-mesh': { opacity: 0, y: 20, scale: 0.97 },
        '#fx-mesh-nodes .fx-mesh-node': { opacity: 0, scale: 0.5 },
      });
      setMeshPathsHidden();
    },

    'logo-wipe'() {
      applyStates({
        '#fx-blackout': { opacity: 0 },
        '#fx-bg-wrap': { opacity: 1, scale: 1.05 },
        '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
        '#fx-logo': { clipPath: 'inset(0 100% 0 0)' },
        '#fx-divider': { scaleX: 1 },
        '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
          y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)',
        },
      });
    },

    'cta-access-unlock'() {
      applyStates({
        '#fx-blackout': { opacity: 0 },
        '#fx-bg-wrap': { opacity: 1, scale: 1.05 },
        '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
        '#fx-logo': { clipPath: 'inset(0 0% 0 0)' },
        '#fx-divider': { scaleX: 1 },
        '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
          y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)',
        },
        '#fx-cta-outline': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
        '#fx-cta-pulse': { scale: 1, opacity: 0 },
        '#fx-cta': { opacity: 0, scale: 0.75, y: 0 },
        '#fx-cta-arrow': { x: -20, opacity: 0 },
      });
    },

    'cta-signal-arrival'() {
      applyStates({
        '#fx-blackout': { opacity: 0 },
        '#fx-bg-wrap': { opacity: 1, scale: 1.05 },
        '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
        '#fx-logo': { clipPath: 'inset(0 0% 0 0)' },
        '#fx-divider': { scaleX: 1 },
        '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
          y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)',
        },
        '#fx-mesh': { opacity: 1 },
        '#fx-mesh-nodes .fx-mesh-node': { scale: 1, opacity: 0.9 },
        '#fx-signal-dot': { opacity: 0, attr: { cx: 920, cy: 895 } },
        '#fx-cta': { opacity: 0, scale: 0.9, y: 0 },
        '#fx-cta-arrow': { x: -16, opacity: 0 },
      });
      setMeshPathsHidden();
    },

    'scan-beam'() {
      applyStates({
        '#fx-blackout': { opacity: 0 },
        '#fx-bg-wrap': { opacity: 1, scale: 1.05 },
        '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
        '#fx-logo': { clipPath: 'inset(0 0% 0 0)' },
        '#fx-divider': { scaleX: 1 },
        '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
          y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)',
        },
        '#fx-mesh': { opacity: 1 },
        '#fx-mesh-nodes .fx-mesh-node': { scale: 1, opacity: 0.9 },
        '#fx-scan-h': { y: -20, opacity: 0 },
        '#fx-scan-v': { left: -20, opacity: 0 },
        '#fx-scan-d': { opacity: 0, x: 0 },
      });
      gsap.set('#fx-mesh-lines path', { opacity: 0.5 });
    },

    ...(V2.SOLO_PREPARE || {}),
  };

  function prepareSoloBase(effectId) {
    hardResetTweens();
    resetMeshPaths();
    applyStates({
      '#fx-startup-flash': { x: '110%', opacity: 0 },
      '#fx-light-sweep': { x: '-80%', opacity: 0 },
      '#fx-impact-flash': { opacity: 0 },
      '#fx-signal-distortion': { opacity: 0, skewX: 0 },
      '#fx-mesh': { opacity: 0, scale: 1, x: 0, y: 0 },
      '#fx-mesh-nodes .fx-mesh-node': { scale: 1, opacity: 0.9 },
      '#fx-signal-dot': { opacity: 0, attr: { cx: 760, cy: 80 } },
      '#fx-scan-h': { y: -20, opacity: 0 },
      '#fx-scan-v': { left: -20, opacity: 0 },
      '#fx-scan-d': { opacity: 0, x: 0 },
      '#fx-logo': { clipPath: 'inset(0 0% 0 0)' },
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        y: 0, x: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)',
      },
      '#fx-impact-word': { textShadow: '0 0 0 rgba(20,168,244,0)' },
      '#fx-headline': { x: 0 },
      '#fx-divider': { scaleX: 1 },
      '#fx-subtitle': { opacity: 1, filter: 'blur(0px)', y: 0 },
      '#fx-cta-outline': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      '#fx-cta-pulse': { scale: 1, opacity: 0 },
      '#fx-cta': { opacity: 0, scale: 1, y: 0 },
      '#fx-cta-arrow': { x: 0, opacity: 0 },
    });
    clearPhases();
    applyV2Reset();
    const prepare = SOLO_PREPARE[effectId];
    if (prepare) prepare();
  }

  function prepareComboBase() {
    prepareComboStart();
  }

  /* ── Effect builders ── */
  const Effects = {
    'blackout-strike'(tl, at) {
      tl.set('#fx-blackout', { opacity: 1 }, at);
      tl.fromTo('#fx-startup-flash',
        { x: '110%', opacity: 0 },
        { x: '-45%', opacity: 1, duration: 0.14, ease: 'power4.in' },
        at + 0.02
      );
      tl.to('#fx-startup-flash', { opacity: 0, duration: 0.1 }, at + 0.16);
      tl.fromTo('#fx-signal-distortion',
        { opacity: 0, skewX: 0 },
        { opacity: 0.9, skewX: -5, duration: 0.05 },
        at + 0.06
      );
      tl.to('#fx-signal-distortion', { opacity: 0, skewX: 0, duration: 0.07 }, at + 0.11);
      tl.to('#fx-blackout', { opacity: 0, duration: 0.18, ease: 'power2.out' }, at + 0.1);
      tl.fromTo('#fx-bg-wrap',
        { opacity: 0, scale: 1.18 },
        { opacity: 1, scale: 1.05, duration: 0.35, ease: 'power3.out' },
        at + 0.12
      );
      tl.fromTo('#fx-bg',
        { filter: 'brightness(0.2)' },
        { filter: 'brightness(1.05)', duration: 0.3, ease: 'power2.out' },
        at + 0.12
      );
    },

    'light-sweep-reveal'(tl, at) {
      tl.set('#fx-blackout', { opacity: 0 }, at);
      tl.set('#fx-bg-wrap', { opacity: 0 }, at);
      tl.set('#fx-light-sweep', { skewX: -8 }, at);
      tl.fromTo('#fx-light-sweep',
        { x: '-90%', opacity: 0 },
        { x: '120%', opacity: 0.85, duration: 0.65, ease: 'power2.inOut' },
        at
      );
      tl.fromTo('#fx-bg-wrap',
        { opacity: 0, scale: 1.12 },
        { opacity: 1, scale: 1.04, duration: 0.55, ease: 'power3.out' },
        at + 0.15
      );
      tl.to('#fx-light-sweep', { opacity: 0, duration: 0.2 }, at + 0.55);
    },

    'mask-rise'(tl, at) {
      tl.fromTo('#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5',
        { y: 70, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
        { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.38, stagger: 0.1, ease: 'power4.out' },
        at
      );
    },

    'impact-word'(tl, at) {
      tl.fromTo('#fx-row-4',
        { y: 70, opacity: 0, scale: 1.15, filter: 'blur(6px)' },
        { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.22, ease: 'power4.out' },
        at
      );
      tl.fromTo('#fx-impact-flash', { opacity: 0 }, { opacity: 0.9, duration: 0.05 }, at);
      tl.to('#fx-impact-flash', { opacity: 0, duration: 0.18 }, at + 0.05);
      tl.to('#fx-impact-word', {
        textShadow: '0 0 32px rgba(20,168,244,1), 0 0 60px rgba(20,168,244,0.4)',
        duration: 0.12,
      }, at);
      tl.to('#fx-impact-word', { textShadow: '0 0 0 rgba(20,168,244,0)', duration: 0.3 }, at + 0.15);
      tl.to('#fx-headline', { x: 4, duration: 0.03 }, at + 0.02);
      tl.to('#fx-headline', { x: -3, duration: 0.03 }, at + 0.05);
      tl.to('#fx-headline', { x: 2, duration: 0.03 }, at + 0.08);
      tl.to('#fx-headline', { x: 0, duration: 0.06 }, at + 0.11);
      tl.to('#fx-mesh', { opacity: 1, duration: 0.15 }, at);
      tl.fromTo('#fx-mesh-nodes .fx-mesh-node',
        { scale: 1.8, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.2, stagger: 0.04, ease: 'power2.out' },
        at + 0.05
      );
    },

    'mesh-network-flow'(tl, at) {
      animateMeshDraw(tl, at, { opacity: 0.6, duration: 0.35, stagger: 0.05 });
      tl.fromTo('#fx-mesh-nodes .fx-mesh-node',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.15, stagger: 0.04, ease: 'back.out(2)' },
        at + 0.2
      );
      tl.set('#fx-signal-dot', { attr: { cx: 760, cy: 80 }, opacity: 0 }, at);
      tl.to('#fx-signal-dot', { opacity: 1, duration: 0.05 }, at + 0.35);
      tl.to('#fx-signal-dot', { attr: { cx: 820, cy: 335 }, duration: 0.2, ease: 'none' }, at + 0.35);
      tl.to('#fx-signal-dot', { attr: { cx: 860, cy: 595 }, duration: 0.22, ease: 'none' }, at + 0.55);
      tl.to('#fx-signal-dot', { attr: { cx: 920, cy: 895 }, duration: 0.2, ease: 'none' }, at + 0.77);
      tl.to('#fx-signal-dot', { opacity: 0, duration: 0.1 }, at + 0.95);
    },

    'mesh-city-map'(tl, at) {
      tl.fromTo('#fx-mesh',
        { opacity: 0, y: 20, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' },
        at
      );
      animateMeshDraw(tl, at + 0.1, { opacity: 0.45, duration: 0.7, stagger: 0.08, ease: 'power2.out' });
      tl.fromTo('#fx-mesh-nodes .fx-mesh-node',
        { opacity: 0, scale: 0.5 },
        { opacity: 0.85, scale: 1, duration: 0.25, stagger: 0.05, ease: 'power2.out' },
        at + 0.5
      );
    },

    'logo-wipe'(tl, at) {
      tl.fromTo('#fx-logo',
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.42, ease: 'power4.out' },
        at
      );
    },

    'cta-access-unlock'(tl, at) {
      tl.set('#fx-cta-outline', { opacity: 1, clipPath: 'inset(0 100% 0 0)' }, at);
      tl.to('#fx-cta-outline',
        { clipPath: 'inset(0 0% 0 0)', duration: 0.35, ease: 'power3.inOut' },
        at
      );
      tl.fromTo('#fx-cta',
        { scale: 0.75, opacity: 0 },
        { scale: 1.04, opacity: 1, duration: 0.28, ease: 'power3.out' },
        at + 0.28
      );
      tl.to('#fx-cta', { scale: 1, duration: 0.15, ease: 'power2.inOut' }, at + 0.56);
      tl.fromTo('#fx-cta-pulse',
        { scale: 0.5, opacity: 0.8 },
        { scale: 2, opacity: 0, duration: 0.55, ease: 'power2.out' },
        at + 0.32
      );
      tl.fromTo('#fx-cta-arrow',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.2, ease: 'power4.out' },
        at + 0.5
      );
    },

    'cta-signal-arrival'(tl, at) {
      tl.set('#fx-mesh', { opacity: 1 }, at);
      const link = $('#fx-mesh-link');
      if (!link) return;
      const len = meshPathLength(link);
      tl.set(link, { strokeDashoffset: len, opacity: 0 }, at);
      tl.to(link, {
        strokeDashoffset: 0,
        opacity: 0.7,
        duration: 0.55,
        ease: 'power2.inOut',
      }, at);
      tl.set('#fx-signal-dot', { attr: { cx: 920, cy: 895 }, opacity: 0 }, at);
      tl.to('#fx-signal-dot', { opacity: 1, duration: 0.05 }, at);
      tl.to('#fx-signal-dot', { attr: { cx: 620, cy: 1020 }, duration: 0.28, ease: 'none' }, at);
      tl.to('#fx-signal-dot', { attr: { cx: 340, cy: 1120 }, duration: 0.25, ease: 'none' }, at + 0.28);
      tl.to('#fx-signal-dot', { opacity: 0, duration: 0.1 }, at + 0.5);
      tl.fromTo('#fx-cta',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.25, ease: 'power3.out' },
        at + 0.45
      );
      tl.fromTo('#fx-cta-arrow',
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.18, ease: 'power3.out' },
        at + 0.55
      );
    },

    'scan-beam'(tl, at, opts) {
      const mode = opts?.scanMode || 'horizontal';
      if (mode === 'vertical') {
        tl.fromTo('#fx-scan-v',
          { left: -40, opacity: 0 },
          { left: 1120, opacity: 0.75, duration: 0.45, ease: 'power3.inOut' },
          at
        );
        tl.to('#fx-scan-v', { opacity: 0, duration: 0.12 }, at + 0.45);
      } else if (mode === 'diagonal') {
        tl.fromTo('#fx-scan-d',
          { opacity: 0, x: '-40%' },
          { opacity: 0.7, x: '40%', duration: 0.5, ease: 'power2.inOut' },
          at
        );
        tl.to('#fx-scan-d', { opacity: 0, duration: 0.15 }, at + 0.5);
      } else {
        tl.fromTo('#fx-scan-h',
          { y: -20, opacity: 0 },
          { y: 1370, opacity: 0.7, duration: 0.42, ease: 'power3.inOut' },
          at
        );
        tl.to('#fx-scan-h', { opacity: 0, duration: 0.1 }, at + 0.42);
      }
    },

    ...(V2.Effects || {}),
  };

  function addNetworkBurst(tl, at) {
    const wave = document.createElement('div');
    wave.setAttribute('data-fx-wave', '1');
    wave.style.cssText = 'position:absolute;z-index:4;width:60px;height:60px;border-radius:50%;border:2px solid rgba(20,168,244,0.6);top:42%;left:78%;transform:translate(-50%,-50%);pointer-events:none;';
    $('#fx-scene').appendChild(wave);
    tl.fromTo(wave, { scale: 0, opacity: 0.8 }, { scale: 9, opacity: 0, duration: 0.7, ease: 'power2.out' }, at);
    tl.call(() => wave.remove(), null, at + 0.75);
  }

  function buildTimeline(onComplete) {
    return gsap.timeline({
      paused: true,
      onComplete,
    });
  }

  function runSolo(effectId) {
    if (REMOVED_HARD.has(effectId)) {
      setStatus('Este efeito foi removido do catálogo.');
      return;
    }
    const fx = EffectsCatalog.byId(effectId);
    if (!fx || !fx.implemented || !Effects[effectId]) {
      setStatus(fx && !fx.implemented
        ? `Efeito <strong>${fx.label}</strong> ainda não implementado no preview.`
        : 'Efeito não encontrado.');
      return;
    }

    prepareSoloBase(effectId);
    const dur = Math.max(5, Math.min(9, fx.soloDuration + 2));
    mainTl = buildTimeline(() => setStatus(`Efeito <strong>${fx.label}</strong> concluído.`));

    Effects[effectId](mainTl, 0.25, { scanMode: 'horizontal' });

    if (effectId === 'mesh-network-flow') addNetworkBurst(mainTl, 0.55);
    if (effectId === 'signal-chain-reaction') { /* self-contained */ }

    const pad = Math.max(0.8, dur - mainTl.duration());
    mainTl.to({}, { duration: pad });
    playTimeline(mainTl, mainTl.duration(), fx.phase);
    lastRun = { type: 'solo', label: fx.label, replay: () => runSolo(effectId) };
    setStatus(`Reproduzindo <strong>${fx.label}</strong>…`);
    highlightCard(effectId);
  }

  function runCombination(picks, label, totalDuration) {
    prepareComboBase();
    const dur = totalDuration || 8;
    mainTl = buildTimeline(() => setStatus(`Combinação <strong>${label}</strong> concluída.`));

    BUILDER_KEYS.forEach(({ key }) => {
      const id = picks[key];
      if (!id || !Effects[id]) return;
      const slot = COMBO_SLOTS[key] || { at: 0, phase: 'opening' };
      const opts = key === 'transition' ? { scanMode: picks.scanMode || 'horizontal' } : {};
      if (key === 'text' && id === 'impact-word') {
        Effects['mask-rise'](mainTl, Math.max(0, slot.at - 0.55));
        Effects[id](mainTl, slot.at, opts);
      } else if (key === 'text' && id === 'headline-fragment-assemble') {
        Effects['mask-rise'](mainTl, Math.max(0, slot.at - 0.4));
        Effects[id](mainTl, slot.at, opts);
      } else {
        Effects[id](mainTl, slot.at, opts);
      }
      if (id === 'mesh-network-flow') addNetworkBurst(mainTl, slot.at + 0.4);
    });

    mainTl.fromTo('#fx-divider', { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: 'power4.out' }, 5.0);
    mainTl.fromTo('#fx-subtitle',
      { opacity: 0, filter: 'blur(6px)', y: 12 },
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.5, ease: 'power3.out' },
      5.2
    );

    const end = Math.max(dur, mainTl.duration());
    const pad = Math.max(0.5, end - mainTl.duration());
    mainTl.to({}, { duration: pad });
    playTimeline(mainTl, mainTl.duration(), 'combo');
    lastRun = {
      type: 'combo',
      label,
      replay: () => runCombination(picks, label, totalDuration),
    };
    setStatus(`Executando <strong>${label}</strong>…`);
  }

  function playTimeline(tl, duration, mode) {
    tl.timeScale(speed);
    tl.restart(true);
    startPhaseTracker(tl, duration, mode);
  }

  function startPhaseTracker(tl, duration, mode) {
    if (phaseTickerFn) {
      gsap.ticker.remove(phaseTickerFn);
      phaseTickerFn = null;
    }

    const bounds = mode === 'solo'
      ? { opening: [0, 0.3], logo: [0.3, 0.5], mesh: [0.5, 0.7], headline: [0.7, 0.85], cta: [0.85, 0.95], transition: [0.95, 1] }
      : {
          opening: [0, 0.12],
          logo: [0.08, 0.2],
          mesh: [0.15, 0.4],
          headline: [0.35, 0.58],
          cta: [0.55, 0.78],
          transition: [0.75, 0.92],
        };

    const updatePhases = () => {
      if (!mainTl) return;
      const p = Math.min(1, mainTl.time() / duration);
      Object.entries(bounds).forEach(([ph, [a, b]]) => {
        const el = document.querySelector(`.phase-seg[data-phase="${ph}"]`);
        if (!el) return;
        el.classList.remove('active', 'done');
        if (p >= b) el.classList.add('done');
        else if (p >= a) el.classList.add('active');
      });
    };

    phaseTickerFn = updatePhases;
    gsap.ticker.add(phaseTickerFn);

    const userComplete = tl.eventCallback('onComplete');
    tl.eventCallback('onComplete', () => {
      if (phaseTickerFn) {
        gsap.ticker.remove(phaseTickerFn);
        phaseTickerFn = null;
      }
      $all('.phase-seg').forEach((el) => { el.classList.remove('active'); el.classList.add('done'); });
      if (userComplete) userComplete();
    });
  }

  function clearPhases() {
    $all('.phase-seg').forEach((el) => el.classList.remove('active', 'done'));
  }

  function setStatus(html) {
    const el = $('#preview-status');
    if (el) el.innerHTML = html;
  }

  function highlightCard(id) {
    $all('.effect-card').forEach((c) => c.classList.remove('is-playing'));
    const card = document.querySelector(`.effect-card[data-id="${id}"]`);
    if (card) {
      card.classList.add('is-playing');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /* ── Approvals ── */
  function loadApprovals() {
    try {
      let stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!Object.keys(stored).length) {
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          const legacy = JSON.parse(localStorage.getItem(legacyKey) || '{}');
          if (Object.keys(legacy).length) {
            stored = legacy;
            break;
          }
        }
      }
      const validIds = new Set(EFFECTS.map((e) => e.id));
      const removed = REMOVED_HARD;
      const cleaned = {};
      Object.entries(stored).forEach(([id, status]) => {
        if (removed.has(id)) return;
        if (validIds.has(id) || id.startsWith('combo:')) cleaned[id] = status;
      });
      const merged = { ...cleaned, ...CURATED_APPROVALS };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
      return merged;
    } catch {
      const fallback = { ...CURATED_APPROVALS };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }
  }

  function saveApprovals() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(approvals));
    updateApprovalUI();
  }

  function setApproval(id, status) {
    if (status === null) delete approvals[id];
    else approvals[id] = status;
    saveApprovals();
  }

  function updateApprovalUI() {
    let approved = 0;
    let rejected = 0;
    Object.values(approvals).forEach((v) => {
      if (v === 'approved') approved++;
      if (v === 'rejected') rejected++;
    });
    $('#count-approved').textContent = approved;
    $('#count-rejected').textContent = rejected;

    $all('.effect-card').forEach((card) => {
      const id = card.dataset.id;
      card.classList.remove('is-approved', 'is-rejected', 'is-playing');
      const st = approvals[id];
      if (st === 'approved') card.classList.add('is-approved');
      if (st === 'rejected') card.classList.add('is-rejected');
      const btnA = card.querySelector('[data-action="approve"]');
      const btnR = card.querySelector('[data-action="reject"]');
      const btnC = card.querySelector('[data-action="clear"]');
      if (btnA) btnA.className = 'btn btn-sm' + (st === 'approved' ? ' btn-approved' : '');
      if (btnA) btnA.textContent = st === 'approved' ? 'Aprovado' : 'Aprovar';
      if (btnR) btnR.className = 'btn btn-sm' + (st === 'rejected' ? ' btn-rejected' : '');
      if (btnR) btnR.textContent = st === 'rejected' ? 'Reprovado' : 'Reprovar';
      if (btnC) btnC.hidden = !st;
    });
  }

  function exportCatalog() {
    const approvedEffects = EFFECTS
      .filter((e) => approvals[e.id] === 'approved')
      .map((e) => ({
        id: e.id,
        category: e.category,
        label: e.label,
        intensity: e.intensity,
        durationSuggested: e.durationSuggested,
      }));

    const approvedCombos = COMBOS
      .filter((c) => approvals[`combo:${c.id}`] === 'approved')
      .map((c) => ({
        id: c.id,
        label: c.label,
        effects: c.effects,
        duration: c.duration,
      }));

    const payload = {
      generatedAt: new Date().toISOString(),
      approvedEffects,
      approvedCombos,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'effects-catalog-approved.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus(`Exportado: <strong>${approvedEffects.length}</strong> efeitos, <strong>${approvedCombos.length}</strong> combos.`);
  }

  /* ── UI build ── */
  function isEffectArchived(id) {
    return REMOVED_HARD.has(id);
  }

  function isEffectApproved(id) {
    return approvals[id] === 'approved';
  }

  function isEffectRejected(id) {
    return approvals[id] === 'rejected';
  }

  function isEffectPending(fx) {
    if (isEffectArchived(fx.id)) return false;
    if (isEffectRejected(fx.id)) return false;
    if (isEffectApproved(fx.id)) return false;
    return true;
  }

  function matchesCatalogFilter(fx) {
    if (catalogFilter === 'all') return true;
    return fx.category === catalogFilter;
  }

  function isMainCatalogEffect(fx) {
    if (isEffectArchived(fx.id)) return false;
    if (!matchesCatalogFilter(fx)) return false;
    if (isEffectApproved(fx.id)) return false;
    if (isEffectRejected(fx.id)) return showRejectedCatalog;
    return true;
  }

  function approvedEffectsList() {
    return EFFECTS.filter((e) => !isEffectArchived(e.id) && isEffectApproved(e.id));
  }

  function assertCatalogClean() {
    REMOVED_HARD.forEach((id) => {
      document.querySelectorAll(`.effect-card[data-id="${id}"]`).forEach((el) => el.remove());
    });
  }

  function updateEffectsCount() {
    const pending = EFFECTS.filter(isEffectPending).length;
    const approved = approvedEffectsList().length;
    const rejected = EFFECTS.filter((e) => isEffectRejected(e.id)).length;
    const el = $('#effects-count');
    if (!el) return;
    const parts = [`${pending} em revisão`];
    if (approved > 0 && !showApprovedSection) {
      parts.push(`${approved} aprovados fechados`);
    }
    if (rejected > 0 && !showRejectedCatalog) {
      parts.push(`${rejected} reprovados ocultos`);
    }
    el.textContent = parts.join(' · ');

    const toggleRejected = $('#btn-toggle-rejected');
    if (toggleRejected) {
      toggleRejected.textContent = showRejectedCatalog
        ? 'Ocultar reprovados'
        : `Mostrar reprovados (${rejected})`;
      toggleRejected.hidden = rejected === 0;
    }

    const toggleApproved = $('#btn-toggle-approved');
    const approvedWrap = $('#effects-approved-wrap');
    if (toggleApproved) {
      toggleApproved.textContent = showApprovedSection
        ? `Ocultar aprovados (${approved})`
        : `Abrir aprovados (${approved})`;
      toggleApproved.hidden = approved === 0;
      toggleApproved.setAttribute('aria-expanded', showApprovedSection ? 'true' : 'false');
    }
    if (approvedWrap) {
      approvedWrap.classList.toggle('is-open', showApprovedSection && approved > 0);
    }
  }

  function createEffectCard(fx, cat) {
    const implemented = true;
    const st = approvals[fx.id];
    const card = document.createElement('article');
    card.className = 'effect-card'
      + (fx.featured ? ' is-featured' : '')
      + (st === 'approved' ? ' is-approved' : '')
      + (st === 'rejected' ? ' is-rejected' : '')
      + (implemented ? '' : ' is-planned');
    card.dataset.id = fx.id;
    const statusBadge = implemented
      ? '<span class="effect-badge implemented">preview</span>'
      : '<span class="effect-badge planned">em breve</span>';
    const featuredBadge = fx.featured ? '<span class="effect-badge featured">destaque</span>' : '';
    const curatedBadge = fx.curated === 'approved'
      ? '<span class="effect-badge curated-approved">curado ✓</span>'
      : '';
    card.innerHTML = `
      <div class="effect-card-top">
        <div>
          <div class="effect-name">${fx.label}</div>
          <div class="effect-id">${fx.id}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          ${statusBadge}
          ${curatedBadge}
          ${featuredBadge}
          <span class="effect-badge intensity-${fx.intensity}">${fx.intensity}</span>
        </div>
      </div>
      <p class="effect-desc">${fx.description}</p>
      <div class="effect-meta">
        <span>${cat.label}</span>
        <span>${fx.durationSuggested}</span>
      </div>
      <div class="effect-actions">
        <button type="button" class="btn btn-sm btn-primary" data-action="view" ${implemented ? '' : 'disabled'}>Ver efeito</button>
        <button type="button" class="btn btn-sm" data-action="repeat" ${implemented ? '' : 'disabled'}>Repetir</button>
      </div>
      <div class="effect-approval">
        <button type="button" class="btn btn-sm" data-action="approve">Aprovar</button>
        <button type="button" class="btn btn-sm" data-action="reject">Reprovar</button>
        <button type="button" class="btn btn-sm btn-ghost" data-action="clear" hidden>Limpar</button>
      </div>
    `;

    if (implemented) {
      card.querySelector('[data-action="view"]').onclick = () => runSolo(fx.id);
      card.querySelector('[data-action="repeat"]').onclick = () => runSolo(fx.id);
    }
    card.querySelector('[data-action="approve"]').onclick = () =>
      setApproval(fx.id, approvals[fx.id] === 'approved' ? null : 'approved');
    card.querySelector('[data-action="reject"]').onclick = () =>
      setApproval(fx.id, approvals[fx.id] === 'rejected' ? null : 'rejected');
    card.querySelector('[data-action="clear"]').onclick = () => setApproval(fx.id, null);

    return card;
  }

  function renderCategoryGrid(root, filterFn) {
    CATEGORIES.forEach((cat) => {
      const items = EffectsCatalog.byCategory(cat.id).filter(filterFn);
      if (!items.length) return;

      const title = document.createElement('h3');
      title.className = 'category-title';
      title.textContent = cat.label;
      root.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'cards-grid';
      items.forEach((fx) => grid.appendChild(createEffectCard(fx, cat)));
      root.appendChild(grid);
    });
  }

  function renderCatalogTabs() {
    const root = $('#catalog-tabs');
    if (!root) return;
    root.innerHTML = '';
    const tabs = [{ id: 'all', label: 'Todos' }, ...CATEGORIES];
    tabs.forEach(({ id, label }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'catalog-tab'
        + (id === catalogFilter ? ' active' : '')
        + (id === 'social-impact' ? ' is-social' : '')
        + (id === 'svg-motion' ? ' is-svg' : '')
        + (id === 'depth-focus' ? ' is-depth' : '')
        + (id === 'animated-mesh-depth' ? ' is-mesh' : '');
      btn.textContent = label;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', id === catalogFilter ? 'true' : 'false');
      btn.onclick = () => {
        catalogFilter = id;
        renderCatalogTabs();
        renderCatalog();
      };
      root.appendChild(btn);
    });
  }

  function renderCatalog() {
    const root = $('#effects-catalog');
    root.innerHTML = '';
    renderCategoryGrid(root, isMainCatalogEffect);

    const approvedRoot = $('#effects-catalog-approved');
    if (approvedRoot) {
      approvedRoot.innerHTML = '';
      if (showApprovedSection) {
        renderCategoryGrid(approvedRoot, (fx) => (
          !isEffectArchived(fx.id) && isEffectApproved(fx.id) && matchesCatalogFilter(fx)
        ));
      }
    }

    assertCatalogClean();
    updateEffectsCount();
    updateApprovalUI();
  }

  function renderBuilder() {
    const grid = $('#builder-grid');
    grid.innerHTML = '';
    BUILDER_KEYS.forEach(({ key, label, cat }) => {
      const field = document.createElement('div');
      field.className = 'builder-field';
      const options = EffectsCatalog.byCategory(cat)
        .filter((e) => e.implemented && isEffectPending(e))
        .map((e) => `<option value="${e.id}">${e.label}</option>`)
        .join('');
      field.innerHTML = `
        <label for="builder-${key}">${label}</label>
        <select id="builder-${key}">
          <option value="">— nenhum —</option>
          ${options}
        </select>
      `;
      grid.appendChild(field);
    });
  }

  function renderCombos() {
    const grid = $('#combo-buttons');
    if (!grid) return;
    grid.innerHTML = '';
    COMBOS.forEach((combo) => {
      const card = document.createElement('div');
      card.className = 'combo-card';

      const title = document.createElement('div');
      title.className = 'combo-card-title';
      title.textContent = combo.label;

      const desc = document.createElement('div');
      desc.className = 'combo-card-desc';
      desc.textContent = combo.description;

      const slots = Object.keys(combo.effects);
      const tags = document.createElement('div');
      tags.className = 'combo-card-tags';
      tags.innerHTML = slots.map(s => `<span class="combo-tag">${s}</span>`).join('');

      const playBtn = document.createElement('button');
      playBtn.type = 'button';
      playBtn.className = 'combo-card-play';
      playBtn.textContent = '▶ Executar';
      playBtn.onclick = () => {
        document.querySelectorAll('.combo-card.is-playing').forEach(el => el.classList.remove('is-playing'));
        card.classList.add('is-playing');
        runCombination(combo.effects, combo.label, combo.duration);
      };

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(tags);
      card.appendChild(playBtn);
      grid.appendChild(card);
    });
  }

  function getBuilderPicks() {
    const picks = {};
    BUILDER_KEYS.forEach(({ key }) => {
      const sel = $(`#builder-${key}`);
      picks[key] = sel?.value || null;
    });
    picks.scanMode = 'horizontal';
    return picks;
  }

  function fitStageScale() {
    const scaler = $('#stage-scaler');
    const stage = $('#preview-stage');
    if (!scaler || !stage) return;
    const w = scaler.clientWidth;
    const scale = w / 1080;
    stage.style.transform = `scale(${scale})`;
  }

  function bindControls() {
    $('#btn-replay').onclick = () => {
      if (lastRun.replay) lastRun.replay();
      else setStatus('Nenhuma animação para repetir.');
    };
    $('#btn-reset').onclick = () => {
      resetPreview();
      lastRun = { type: 'idle', label: '' };
    };
    const btnExport = $('#btn-export');
    if (btnExport) btnExport.onclick = exportCatalog;

    $all('#speed-group [data-speed]').forEach((btn) => {
      btn.onclick = () => {
        speed = Number(btn.dataset.speed);
        $all('#speed-group .btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (mainTl) mainTl.timeScale(speed);
      };
    });

    window.addEventListener('resize', fitStageScale);
  }

  function showFatalError(err) {
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#ff003a;color:#fff;padding:16px 20px;font:14px/1.5 monospace;white-space:pre-wrap;word-break:break-all;';
    box.textContent = '🚨 ERRO JavaScript em init():\n' + err.message + '\n\n' + (err.stack || '');
    document.body.prepend(box);
    const el = document.getElementById('effects-count');
    if (el) el.textContent = 'ERRO — veja banner vermelho no topo';
  }

  function loadPostCanvas() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) return;

    /* Ativa modo post: CSS post-mode cuida de inset, object-position, overlay e content */
    const stage = $('#preview-stage');
    if (stage) stage.classList.add('post-mode');

    /* Atualiza labels do canvas */
    const h2 = $('.preview-col-head h2');
    if (h2) h2.textContent = 'Post selecionado';
    const head = $('.preview-col-head p');
    if (head) head.textContent = slug;

    const eyebrow = $('#lab-eyebrow');
    if (eyebrow) eyebrow.textContent = `Motion Lab · ${slug}`;

    /* thumb.png (1080×1350) já contém o post completo — fundo + texto + logos */
    const bg = $('#fx-bg');
    if (bg) {
      bg.src = `../artes/${slug}/thumb.png?t=${Date.now()}`;
      bg.onerror = () => { bg.src = `../artes/${slug}/arte.html`; };
      bg.removeAttribute('style'); /* remove quaisquer inline styles anteriores */
    }

    /* Torna fundo visível no idle sem zoom (inset já é 0 via post-mode) */
    const bgWrap = $('#fx-bg-wrap');
    if (bgWrap) gsap.set(bgWrap, { opacity: 1, scale: 1, x: 0, y: 0 });
  }

  function init() {
    try {
      /* limpa apenas chaves legadas — nunca apaga aprovações atuais */
      LEGACY_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));

      if (V2.initLayers) V2.initLayers();
      initMeshPaths();
      showIdleState();
      loadPostCanvas(); /* async — roda em paralelo, atualiza canvas quando pronto */
      setStatus('Pronto — selecione um combo.');
      renderCombos();
      bindControls();
      fitStageScale();
      const params = new URLSearchParams(window.location.search);
      if (!params.get('slug')) {
        const eyebrow = $('#lab-eyebrow');
        if (eyebrow && CATALOG_VERSION) eyebrow.textContent = `Motion Library v2 · ${CATALOG_VERSION}`;
      }
      const comboCount = $('#combo-count');
      if (comboCount) comboCount.textContent = `${COMBOS.length} combos`;
      const comboHeader = $('#combo-count-header');
      if (comboHeader) comboHeader.textContent = `${COMBOS.length} combos aprovados`;
    } catch (err) {
      console.error('[init] CRASH:', err);
      showFatalError(err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
