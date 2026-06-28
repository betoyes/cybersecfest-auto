/**
 * CybersecFEST — Anime.js-inspired / SVG Motion
 *
 * Motor: GSAP (sem MotionPathPlugin nem MorphSVGPlugin).
 * Inspirado nas capacidades do Anime.js: motion paths, stagger,
 * morph, spring, split-text — reinterpretados em GSAP puro.
 *
 * Fallback de motion path: getPointAtLength() sobre SVGPathElement.
 * Fallback de morph: animação coordenada de nós/grupos SVG.
 */
(function (global) {
  'use strict';

  const V2 = global.__effectsV2;
  if (!V2) return;

  const apply = global.__fxApply || (() => {});

  /* ─── helpers ─── */

  function soloBase() {
    apply({
      '#fx-blackout': { opacity: 0 },
      '#fx-bg-wrap': { opacity: 1, scale: 1.05, x: 0, y: 0 },
      '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
      '#fx-scene': { scale: 1, x: 0, y: 0 },
      '#fx-logo': { clipPath: 'inset(0 0% 0 0)', opacity: 1 },
      '#fx-divider': { scaleX: 1 },
      '#fx-subtitle': { opacity: 1, y: 0, filter: 'blur(0px)' },
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)', x: 0,
      },
      '#fx-impact-word': { textShadow: '0 0 0 rgba(20,168,244,0)' },
      '#fx-headline': { x: 0, y: 0 },
      '#fx-cta': { opacity: 0, scale: 1, x: 0, y: 0 },
      '#fx-cta-arrow': { opacity: 0, x: -16 },
      '#fx-cta-outline': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      '#fx-cta-pulse': { scale: 1, opacity: 0 },
    });
  }

  /* Traverses an SVGPathElement over `duration` seconds using getPointAtLength */
  function runnerOnPath(tl, dotEl, pathEl, at, dur) {
    if (!pathEl || !dotEl) return;
    const total = pathEl.getTotalLength();
    const proxy = { t: 0 };
    tl.set(dotEl, { opacity: 1 }, at);
    tl.to(proxy, {
      t: total,
      duration: dur,
      ease: 'power2.inOut',
      onUpdate() {
        const pt = pathEl.getPointAtLength(proxy.t);
        gsap.set(dotEl, { x: pt.x, y: pt.y });
      },
    }, at);
    tl.to(dotEl, { opacity: 0, duration: 0.12 }, at + dur - 0.05);
  }

  /* Init helpers */

  function initSvgNet() {
    const root = document.getElementById('fx-svg-net');
    if (!root || root.childElementCount) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1080 1350');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.width = svg.style.height = '100%';

    /* paths for line-draw */
    const pathDefs = [
      'M620 180 L780 140 L900 220 L860 380 L720 420 L620 340 Z',
      'M780 140 L860 380 L920 540 L840 680',
      'M620 340 L720 420 L720 580 L640 720',
      'M860 380 L920 540 L980 700 L900 860',
      'M720 580 L840 540 L920 700 L860 860 L720 820',
      'M640 720 L720 820 L680 960',
    ];
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.id = 'fx-svgnet-lines';
    pathDefs.forEach((d, i) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      p.setAttribute('class', 'fx-svgnet-line');
      p.id = `fx-svgnet-path-${i}`;
      g.appendChild(p);
    });

    /* nodes */
    const nodes = [[780, 140], [860, 380], [920, 540], [720, 420], [720, 580], [840, 540], [640, 720], [720, 820], [860, 860]];
    const ng = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ng.id = 'fx-svgnet-nodes';
    nodes.forEach(([cx, cy]) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', cx);
      c.setAttribute('cy', cy);
      c.setAttribute('r', '4');
      c.setAttribute('class', 'fx-svgnet-node');
      ng.appendChild(c);
    });

    /* runner dot */
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.id = 'fx-svgnet-dot';
    dot.setAttribute('r', '6');
    dot.setAttribute('class', 'fx-svgnet-dot');

    svg.appendChild(g);
    svg.appendChild(ng);
    svg.appendChild(dot);
    root.appendChild(svg);

    /* init dash offsets */
    [...g.querySelectorAll('path')].forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = String(len);
      p.style.strokeDashoffset = String(len);
    });
  }

  function initStaggerGrid() {
    const el = document.getElementById('fx-stagger-grid');
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 80; i++) {
      const d = document.createElement('span');
      el.appendChild(d);
    }
  }

  function initNodeField() {
    const el = document.getElementById('fx-node-field');
    if (!el || el.childElementCount) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1080 1350');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.width = svg.style.height = '100%';
    /* 12 nodes in right-hand area */
    const positions = [
      [700,200],[820,160],[920,260],[760,340],[860,440],[940,540],
      [720,500],[800,620],[900,700],[680,680],[760,780],[860,860],
    ];
    const lines = [[0,1],[1,2],[0,3],[1,3],[2,4],[3,4],[4,5],[3,6],[6,7],[4,7],[5,8],[7,8],[6,9],[9,10],[10,11],[7,11]];
    const lg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    lg.id = 'fx-nf-lines';
    lines.forEach(([a, b]) => {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', positions[a][0]); l.setAttribute('y1', positions[a][1]);
      l.setAttribute('x2', positions[b][0]); l.setAttribute('y2', positions[b][1]);
      l.setAttribute('class', 'fx-nf-line');
      lg.appendChild(l);
    });
    const ng = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ng.id = 'fx-nf-nodes';
    positions.forEach(([cx, cy], i) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', '5');
      c.setAttribute('class', 'fx-nf-node'); c.dataset.idx = i;
      ng.appendChild(c);
    });
    svg.appendChild(lg); svg.appendChild(ng);
    el.appendChild(svg);
  }

  function initOrbitRing() {
    const el = document.getElementById('fx-orbit-ring');
    if (!el || el.childElementCount) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1080 1350');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.width = svg.style.height = '100%';

    const cx = 220, cy = 675;
    const radii = [120, 190, 260];
    radii.forEach((r, i) => {
      const arc = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      arc.setAttribute('cx', cx); arc.setAttribute('cy', cy); arc.setAttribute('r', r);
      arc.setAttribute('class', 'fx-orbit-arc');
      arc.id = `fx-orbit-arc-${i}`;
      const len = 2 * Math.PI * r;
      arc.style.strokeDasharray = `${len * 0.6} ${len * 0.4}`;
      arc.style.strokeDashoffset = String(len * 0.6);
      svg.appendChild(arc);
    });

    /* tracer dot */
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.id = 'fx-orbit-dot';
    dot.setAttribute('r', '5');
    dot.setAttribute('class', 'fx-orbit-dot');
    svg.appendChild(dot);

    el.appendChild(svg);
  }

  function initShapeMorph() {
    const el = document.getElementById('fx-shape-morph');
    if (!el) return;
    el.innerHTML = `
      <svg viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="width:100%;height:100%">
        <defs>
          <clipPath id="fx-morph-clip">
            <rect id="fx-morph-rect" x="68" y="620" width="0" height="140" rx="4"/>
          </clipPath>
        </defs>
        <rect id="fx-morph-bg" x="68" y="620" width="460" height="140" rx="4"
          fill="rgba(20,168,244,0.06)" stroke="rgba(20,168,244,0.4)" stroke-width="1.5" opacity="0"/>
        <text id="fx-morph-text" x="298" y="700" text-anchor="middle" dominant-baseline="middle"
          font-family="Ubuntu, sans-serif" font-weight="700" font-size="42" letter-spacing="4"
          fill="#F6F8FF" clip-path="url(#fx-morph-clip)" opacity="0">CONFRARIA</text>
        <polygon id="fx-morph-hex" class="fx-morph-hex"
          points="298,620 398,645 398,720 298,745 198,720 198,645"
          fill="rgba(20,168,244,0.12)" stroke="rgba(20,168,244,0.6)" stroke-width="1.5" opacity="0"/>
      </svg>`;
  }

  function initScanCursor() {
    const el = document.getElementById('fx-scan-cursor');
    if (!el) return;
    el.style.cssText += 'position:absolute;inset:0;z-index:20;pointer-events:none;overflow:hidden;opacity:0;';
  }

  /* ─── SOLO PREPARE ─── */

  const SOLO_PREPARE = {
    'svg-line-draw'() {
      soloBase();
      apply({
        '#fx-svg-net': { opacity: 1 },
        '#fx-svgnet-nodes .fx-svgnet-node': { opacity: 0 },
      });
      initSvgNet();
      document.querySelectorAll('#fx-svgnet-lines path').forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
        gsap.set(p, { opacity: 0 });
      });
    },
    'path-signal-runner'() {
      soloBase();
      initSvgNet();
      apply({
        '#fx-svg-net': { opacity: 1 },
        '#fx-svgnet-dot': { opacity: 0 },
      });
      document.querySelectorAll('#fx-svgnet-lines path').forEach((p) => {
        gsap.set(p, { strokeDashoffset: 0, opacity: 0.4 });
      });
      gsap.set('#fx-svgnet-nodes .fx-svgnet-node', { opacity: 0.7 });
    },
    'mesh-morph'() {
      soloBase();
      apply({
        '#fx-mesh': { opacity: 1 },
        '#fx-mesh-nodes .fx-mesh-node': { opacity: 0.9 },
      });
    },
    'grid-stagger-wave'() {
      soloBase();
      initStaggerGrid();
      apply({
        '#fx-stagger-grid': { opacity: 1 },
        '#fx-stagger-grid span': { opacity: 0, scale: 0.4 },
      });
    },
    'node-field-pulse'() {
      soloBase();
      initNodeField();
      apply({
        '#fx-node-field': { opacity: 1 },
        '#fx-nf-nodes .fx-nf-node': { opacity: 0.7, scale: 1 },
        '#fx-nf-lines .fx-nf-line': { opacity: 0.3 },
      });
    },
    'shape-morph-reveal'() {
      soloBase();
      initShapeMorph();
      apply({
        '#fx-shape-morph': { opacity: 1 },
        '#fx-morph-bg': { opacity: 0 },
        '#fx-morph-text': { opacity: 0 },
        '#fx-morph-hex': { opacity: 0.9 },
        '#fx-row-4': { opacity: 0 },
      });
      gsap.set('#fx-morph-rect', { attr: { width: 0 } });
    },
    'orbit-system'() {
      soloBase();
      initOrbitRing();
      apply({
        '#fx-orbit-ring': { opacity: 1 },
        '#fx-orbit-arc-0, #fx-orbit-arc-1, #fx-orbit-arc-2': { opacity: 0 },
        '#fx-orbit-dot': { opacity: 0 },
      });
    },
    'spring-pop'() {
      soloBase();
      apply({
        '#fx-cta': { opacity: 1, scale: 0.01 },
        '#fx-cta-outline': { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
      });
    },
    'split-text-stagger'() {
      soloBase();
      apply({
        '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
          opacity: 0, y: 32, clipPath: 'inset(100% 0 0 0)',
        },
      });
    },
    'scan-draw'() {
      soloBase();
      initScanCursor();
      apply({
        '#fx-scan-cursor': { opacity: 0 },
        '#fx-cta': { opacity: 0 },
        '#fx-cta-outline': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
        '#fx-divider': { scaleX: 0 },
        '#fx-subtitle': { opacity: 0 },
      });
    },
  };

  /* ─── RESET ─── */

  const SVG_RESET = {
    '#fx-svg-net': { opacity: 0 },
    '#fx-svgnet-dot': { opacity: 0, x: 0, y: 0 },
    '#fx-stagger-grid': { opacity: 0 },
    '#fx-stagger-grid span': { opacity: 0, scale: 0.4 },
    '#fx-node-field': { opacity: 0 },
    '#fx-shape-morph': { opacity: 0 },
    '#fx-orbit-ring': { opacity: 0 },
    '#fx-scan-cursor': { opacity: 0 },
  };

  /* ─── EFFECTS ─── */

  const Effects = {

    /* 1. SVG Line Draw ─── stagger stroke-dashoffset */
    'svg-line-draw'(tl, at) {
      initSvgNet();
      tl.set('#fx-svg-net', { opacity: 1 }, at);
      const paths = [...document.querySelectorAll('#fx-svgnet-lines path')];
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        tl.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 }, at);
        tl.to(p, {
          strokeDashoffset: 0, opacity: 0.65,
          duration: 0.55, ease: 'power3.out',
        }, at + i * 0.12);
      });
      const nodes = [...document.querySelectorAll('#fx-svgnet-nodes .fx-svgnet-node')];
      nodes.forEach((n, i) => {
        tl.fromTo(n, { opacity: 0, scale: 0, transformOrigin: 'center center' },
          { opacity: 1, scale: 1, duration: 0.18, ease: 'back.out(2.5)' },
          at + 0.25 + i * 0.06);
      });
    },

    /* 2. Path Signal Runner ─── dot traverses paths via getPointAtLength */
    'path-signal-runner'(tl, at) {
      initSvgNet();
      tl.set('#fx-svg-net', { opacity: 1 }, at);
      document.querySelectorAll('#fx-svgnet-lines path').forEach((p) => {
        tl.set(p, { strokeDashoffset: 0, opacity: 0.35 }, at);
      });
      tl.set('#fx-svgnet-nodes .fx-svgnet-node', { opacity: 0.7 }, at);

      const dot = document.getElementById('fx-svgnet-dot');
      /* run across paths 0,1,3 in sequence */
      const runPaths = [0, 1, 3].map((i) => document.getElementById(`fx-svgnet-path-${i}`));
      let cursor = at;
      runPaths.forEach((path) => {
        if (!path) return;
        const dur = 0.35;
        runnerOnPath(tl, dot, path, cursor, dur);
        cursor += dur + 0.05;
      });
    },

    /* 3. Mesh Morph ─── coordinates shift to "reshape" the network */
    'mesh-morph'(tl, at) {
      tl.set('#fx-mesh', { opacity: 1 }, at);
      /* move nodes to a different configuration */
      const nodeTargets = [
        { x: 40, y: -20 }, { x: -30, y: 15 }, { x: 25, y: 40 },
        { x: -20, y: -35 }, { x: 35, y: -10 }, { x: -40, y: 20 },
      ];
      const nodes = [...document.querySelectorAll('#fx-mesh-nodes .fx-mesh-node')];
      nodes.forEach((n, i) => {
        const t = nodeTargets[i % nodeTargets.length];
        tl.to(n, { x: t.x, y: t.y, scale: 1.3, opacity: 1, duration: 0.55, ease: 'power2.inOut' }, at + i * 0.06);
        tl.to(n, { x: 0, y: 0, scale: 1, duration: 0.45, ease: 'elastic.out(1,0.75)' }, at + 0.55 + i * 0.04);
      });
      /* redraw mesh lines during morph */
      const paths = [...document.querySelectorAll('#fx-mesh-lines path')];
      paths.forEach((p, i) => {
        const len = p.getTotalLength();
        tl.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 }, at);
        tl.to(p, { strokeDashoffset: 0, opacity: 0.55, duration: 0.5, ease: 'power2.out' }, at + 0.1 + i * 0.08);
      });
      tl.fromTo('#fx-mesh', { scale: 0.96 }, { scale: 1, duration: 0.8, ease: 'power2.out' }, at);
    },

    /* 4. Grid Stagger Wave ─── 3 variants: L→R, center-out, diagonal */
    'grid-stagger-wave'(tl, at, opts) {
      initStaggerGrid();
      tl.set('#fx-stagger-grid', { opacity: 1 }, at);
      const cells = [...document.querySelectorAll('#fx-stagger-grid span')];
      const cols = 10;
      const rows = 8;
      const mode = opts?.waveMode || 'ltr';

      function delay(i) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        if (mode === 'ltr') return col * 0.028 + row * 0.01;
        if (mode === 'center') {
          const dc = Math.abs(col - 4.5);
          const dr = Math.abs(row - 3.5);
          return Math.sqrt(dc * dc + dr * dr) * 0.038;
        }
        /* diagonal */
        return (col + row) * 0.025;
      }

      cells.forEach((c, i) => {
        if (i >= cols * rows) return;
        tl.fromTo(c,
          { opacity: 0, scale: 0.3, y: 8 },
          { opacity: 0.75, scale: 1, y: 0, duration: 0.22, ease: 'power3.out' },
          at + delay(i));
      });
      tl.to('#fx-stagger-grid span', { opacity: 0, duration: 0.5, stagger: 0.01 }, at + 1.1);
    },

    /* 5. Node Field Pulse ─── waves of glow emanate from root node */
    'node-field-pulse'(tl, at) {
      initNodeField();
      tl.set('#fx-node-field', { opacity: 1 }, at);
      const nodes = [...document.querySelectorAll('#fx-nf-nodes .fx-nf-node')];
      tl.set(nodes, { opacity: 0.4, scale: 1 }, at);
      tl.set('#fx-nf-lines .fx-nf-line', { opacity: 0.25 }, at);

      /* wave from root (index 0) outward by distance */
      const positions = [
        [0,0],[1,0],[2,1],[1,1],[2,2],[3,2],
        [1,2],[2,3],[3,3],[1,3],[2,4],[3,4],
      ];
      nodes.forEach((n, i) => {
        const dist = Math.sqrt(positions[i][0] ** 2 + positions[i][1] ** 2);
        const delay = dist * 0.18;
        tl.to(n, { opacity: 1, scale: 1.8, duration: 0.14, ease: 'power2.out' }, at + delay);
        tl.to(n, { scale: 1.1, opacity: 0.85, duration: 0.25, ease: 'elastic.out(1,0.5)' }, at + delay + 0.14);
        tl.to(n, { scale: 1, opacity: 0.7, duration: 0.3, ease: 'power2.in' }, at + delay + 0.4);

        /* ripple ring per node */
        const scene = document.getElementById('fx-scene');
        if (scene) {
          const svg = n.closest('svg');
          const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          ring.setAttribute('cx', n.getAttribute('cx'));
          ring.setAttribute('cy', n.getAttribute('cy'));
          ring.setAttribute('r', '5');
          ring.setAttribute('fill', 'none');
          ring.setAttribute('stroke', 'rgba(20,168,244,0.55)');
          ring.setAttribute('stroke-width', '1.5');
          ring.setAttribute('data-fx-wave', '1');
          if (svg) svg.appendChild(ring);
          tl.fromTo(ring, { attr: { r: 5 }, opacity: 0.7 },
            { attr: { r: 28 }, opacity: 0, duration: 0.5, ease: 'power2.out' },
            at + delay);
          tl.call(() => ring.remove(), null, at + delay + 0.55);
        }
      });
    },

    /* 6. Shape Morph Reveal ─── hex → rect → text reveal */
    'shape-morph-reveal'(tl, at) {
      initShapeMorph();
      tl.set('#fx-shape-morph', { opacity: 1 }, at);
      tl.set('#fx-morph-hex', { opacity: 0.9 }, at);
      tl.set('#fx-morph-bg', { opacity: 0 }, at);
      /* hex pulsates then morphs into rect */
      tl.to('#fx-morph-hex', { scale: 1.05, duration: 0.15, ease: 'power2.out', transformOrigin: '298px 682px' }, at);
      tl.to('#fx-morph-hex', { opacity: 0, duration: 0.22, ease: 'power2.in' }, at + 0.18);
      /* rect expands */
      tl.to('#fx-morph-bg', { opacity: 1, duration: 0.18, ease: 'power2.out' }, at + 0.25);
      tl.to('#fx-morph-rect', { attr: { width: 460 }, duration: 0.35, ease: 'power3.out' }, at + 0.28);
      /* text fades in via clip */
      tl.to('#fx-morph-text', { opacity: 1, duration: 0.25, ease: 'power2.out' }, at + 0.48);
      /* glow on border */
      tl.to('#fx-morph-bg', {
        attr: { stroke: 'rgba(20,168,244,0.85)' }, duration: 0.2,
      }, at + 0.55);
      tl.to('#fx-morph-bg', {
        attr: { stroke: 'rgba(20,168,244,0.4)' }, duration: 0.5,
      }, at + 0.75);
      /* reveal word in main headline */
      tl.to('#fx-row-4', { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: 0.3, ease: 'power3.out' }, at + 0.6);
      tl.to('#fx-shape-morph', { opacity: 0, duration: 0.35 }, at + 0.95);
    },

    /* 7. Orbit System ─── arcs reveal then tracer sweeps each */
    'orbit-system'(tl, at) {
      initOrbitRing();
      tl.set('#fx-orbit-ring', { opacity: 1 }, at);

      const arcs = [0, 1, 2].map((i) => document.getElementById(`fx-orbit-arc-${i}`));
      const dot = document.getElementById('fx-orbit-dot');
      const cx = 220, cy = 675;
      const radii = [120, 190, 260];

      arcs.forEach((arc, i) => {
        if (!arc) return;
        const len = 2 * Math.PI * radii[i];
        const partial = len * 0.6;
        tl.set(arc, { strokeDasharray: `${partial} ${len - partial}`, strokeDashoffset: partial, opacity: 0 }, at);
        tl.to(arc, { strokeDashoffset: 0, opacity: 0.55 - i * 0.1, duration: 0.5, ease: 'power3.out' }, at + i * 0.18);
      });

      /* tracer dot on middle orbit */
      if (dot) {
        const r = radii[1];
        const startAngle = -Math.PI * 0.5;
        const proxy = { angle: startAngle };
        tl.set(dot, { opacity: 1 }, at + 0.4);
        tl.to(proxy, {
          angle: startAngle + Math.PI * 1.2,
          duration: 0.9, ease: 'power2.inOut',
          onUpdate() {
            gsap.set(dot, {
              x: cx + r * Math.cos(proxy.angle),
              y: cy + r * Math.sin(proxy.angle),
            });
          },
        }, at + 0.4);
        tl.to(dot, { opacity: 0, duration: 0.15 }, at + 1.25);
      }

      tl.to('#fx-orbit-ring', { opacity: 0, duration: 0.4 }, at + 1.6);
    },

    /* 8. Spring Pop ─── elastic entry in 3 intensities */
    'spring-pop'(tl, at, opts) {
      const target = opts?.target || '#fx-cta';
      const mode = opts?.springMode || 'medium';
      const easeMap = {
        soft:   'elastic.out(1, 0.9)',
        medium: 'elastic.out(1, 0.65)',
        punch:  'elastic.out(1.2, 0.5)',
      };
      const ease = easeMap[mode] || easeMap.medium;

      tl.fromTo(target,
        { scale: 0.01, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.65, ease },
        at);
      tl.fromTo('#fx-cta-outline',
        { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.25, ease: 'power2.inOut' },
        at + 0.25);
      tl.fromTo('#fx-cta-arrow',
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.2, ease: 'power3.out' },
        at + 0.4);
    },

    /* 9. Split Text Stagger ─── rows reveal per line (word/char modes deferred) */
    'split-text-stagger'(tl, at, opts) {
      const mode = opts?.splitMode || 'line';
      const rows = ['#fx-row-1', '#fx-row-2', '#fx-row-3', '#fx-row-4', '#fx-row-5'];

      if (mode === 'line') {
        rows.forEach((sel, i) => {
          tl.fromTo(sel,
            { y: 36, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
            { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.34, ease: 'power4.out' },
            at + i * 0.1);
        });
      } else if (mode === 'word') {
        /* stagger by row with extra offset between rows */
        rows.forEach((sel, i) => {
          tl.fromTo(sel,
            { x: -24, opacity: 0, filter: 'blur(4px)' },
            { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power3.out' },
            at + i * 0.14);
        });
      } else {
        /* char: zoom-scale in */
        rows.forEach((sel, i) => {
          tl.fromTo(sel,
            { scale: 1.4, opacity: 0, filter: 'blur(6px)' },
            { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power3.out' },
            at + i * 0.12);
        });
      }
    },

    /* 10. Scan Draw ─── scanline reveals elements and "draws" CTA */
    'scan-draw'(tl, at) {
      initScanCursor();
      const cursor = document.getElementById('fx-scan-cursor');

      /* create or reuse the scan line bar */
      let bar = document.getElementById('fx-scan-cursor-bar');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'fx-scan-cursor-bar';
        bar.style.cssText = 'position:absolute;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,rgba(20,168,244,0.95),rgba(255,255,255,0.4),rgba(20,168,244,0.95),transparent);box-shadow:0 0 14px rgba(20,168,244,0.8);top:-3px;';
        if (cursor) cursor.appendChild(bar);
      }

      tl.set(cursor, { opacity: 1 }, at);
      tl.set(bar, { top: -3 }, at);

      /* sweep from top to bottom */
      tl.to(bar, { top: 1350, duration: 0.9, ease: 'power2.inOut' }, at);

      /* elements activate as scan passes over them */
      tl.fromTo('#fx-divider', { scaleX: 0 }, { scaleX: 1, duration: 0.2, ease: 'power3.out' }, at + 0.22);
      tl.fromTo('#fx-subtitle',
        { opacity: 0, filter: 'blur(4px)' },
        { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, at + 0.38);
      tl.fromTo('#fx-cta-outline',
        { opacity: 1, clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.32, ease: 'power3.inOut' }, at + 0.55);
      tl.fromTo('#fx-cta',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.28, ease: 'power3.out' }, at + 0.62);
      tl.fromTo('#fx-cta-arrow',
        { x: -16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.18, ease: 'power4.out' }, at + 0.75);

      tl.to(cursor, { opacity: 0, duration: 0.25 }, at + 0.88);
    },
  };

  /* ─── Init all layers ─── */

  function initSvgMotionLayers() {
    initSvgNet();
    initStaggerGrid();
    initNodeField();
    initShapeMorph();
    initOrbitRing();
    initScanCursor();

    /* position stagger grid cells */
    const cells = [...document.querySelectorAll('#fx-stagger-grid span')];
    const cols = 10, rows = 8;
    const cw = 46, ch = 42;
    const ox = 590, oy = 120;
    cells.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      c.style.left = `${ox + col * cw}px`;
      c.style.top = `${oy + row * ch}px`;
      c.style.width = `${cw - 3}px`;
      c.style.height = `${ch - 3}px`;
    });
  }

  /* ─── Register ─── */

  Object.assign(V2.Effects, Effects);
  Object.assign(V2.SOLO_PREPARE, SOLO_PREPARE);
  Object.assign(V2.resetV2, SVG_RESET);

  const baseInit = V2.initLayers;
  V2.initLayers = function initSvgAll() {
    if (baseInit) baseInit();
    initSvgMotionLayers();
  };

})(typeof window !== 'undefined' ? window : global);
