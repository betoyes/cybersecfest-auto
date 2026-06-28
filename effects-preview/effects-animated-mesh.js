/**
 * CybersecFEST — Animated Meshes, Patterns & Depth
 * v20260627d
 *
 * 20 malhas principais + 10 enhancers.
 * Motor: GSAP + SVG inline gerado por JS.
 * Regras: reset completo entre previews, sem loops infinitos, sem backdrop-filter central.
 */
(function (global) {
  'use strict';

  const V2 = global.__effectsV2;
  if (!V2) return;
  const apply = global.__fxApply || (() => {});
  const W = 1080, H = 1350;

  /* ═══ SVG helpers ═══ */

  function mkSVG(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    el.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible';
    el.appendChild(svg);
    return svg;
  }

  function el(tag, attrs = {}) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    return e;
  }

  function line(x1, y1, x2, y2, cls = '') {
    return el('line', { x1, y1, x2, y2, class: cls });
  }

  function circle(cx, cy, r, cls = '') {
    return el('circle', { cx, cy, r, class: cls });
  }

  function path(d, cls = '') {
    return el('path', { d, class: cls, fill: 'none' });
  }

  function poly(points, cls = '') {
    return el('polygon', { points, class: cls });
  }

  function dashLen(el) {
    try { return el.getTotalLength(); } catch { return 200; }
  }

  function prepareDash(p) {
    const len = dashLen(p);
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    return len;
  }

  /* ═══ soloBase ═══ */

  function soloBase() {
    apply({
      '#fx-blackout': { opacity: 0 },
      '#fx-bg-wrap': { opacity: 1, scale: 1.05, x: 0, y: 0, filter: 'blur(0px) brightness(0.95)' },
      '#fx-bg': { filter: 'brightness(0.95) saturate(1)' },
      '#fx-scene': { scale: 1, x: 0, y: 0 },
      '#fx-logo': { clipPath: 'inset(0 0% 0 0)', opacity: 1, filter: 'blur(0px)' },
      '#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5': {
        y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)', x: 0,
      },
      '#fx-cta': { opacity: 0, scale: 1, filter: 'blur(0px)' },
      /* amd layers */
      '#fx-constellation, #fx-neural-depth, #fx-cmd-grid, #fx-laser-grid, #fx-circuit-map': { opacity: 0 },
      '#fx-hex-shield, #fx-radar-field, #fx-topographic, #fx-data-rain, #fx-wave-particles': { opacity: 0 },
      '#fx-city-link-depth, #fx-polygon-fracture, #fx-orbital-hud, #fx-firewall-wall': { opacity: 0 },
      '#fx-digital-fabric, #fx-mesh-ripple, #fx-amd-signal-route, #fx-node-chain': { opacity: 0 },
      '#fx-depth-fabric, #fx-hud-pattern': { opacity: 0 },
    });
  }

  /* ═══ RESET ═══ */

  const AMD_RESET = {
    '#fx-constellation': { opacity: 0 },
    '#fx-neural-depth': { opacity: 0 },
    '#fx-cmd-grid': { opacity: 0 },
    '#fx-laser-grid': { opacity: 0 },
    '#fx-circuit-map': { opacity: 0 },
    '#fx-hex-shield': { opacity: 0 },
    '#fx-radar-field': { opacity: 0 },
    '#fx-topographic': { opacity: 0 },
    '#fx-data-rain': { opacity: 0 },
    '#fx-wave-particles': { opacity: 0 },
    '#fx-city-link-depth': { opacity: 0 },
    '#fx-polygon-fracture': { opacity: 0 },
    '#fx-orbital-hud': { opacity: 0 },
    '#fx-firewall-wall': { opacity: 0 },
    '#fx-digital-fabric': { opacity: 0 },
    '#fx-mesh-ripple': { opacity: 0 },
    '#fx-amd-signal-route': { opacity: 0 },
    '#fx-node-chain': { opacity: 0 },
    '#fx-depth-fabric': { opacity: 0 },
    '#fx-hud-pattern': { opacity: 0 },
    '#fx-bg-wrap': { filter: 'brightness(0.95)', scale: 1.05 },
    '#fx-scene': { scale: 1, x: 0, y: 0 },
  };

  /* ═══════════════════════════════════════════════════
     INIT functions — generate SVG content per effect
     ═══════════════════════════════════════════════════ */

  function initConstellation() {
    const svg = mkSVG('fx-constellation');
    if (!svg) return;
    // ~24 nodes scattered in right 60% of canvas
    const nodes = [
      [720,180],[820,240],[760,340],[900,320],[840,420],[780,510],[940,460],
      [860,580],[760,640],[900,700],[820,780],[700,720],[760,860],[880,840],
      [940,920],[800,940],[720,1000],[860,1040],[780,1120],[920,1080],[700,500],
      [660,620],[700,840],[950,640],
    ];
    const g = el('g', { class: 'amd-constellation' });
    svg.appendChild(g);
    // lines first (behind nodes)
    const lineIdx = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],
      [10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],
      [5,8],[1,4],[9,13],[20,5],[20,21],[21,11],[22,13],[23,7]];
    lineIdx.forEach(([a, b]) => {
      const ln = line(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1], 'amd-cline');
      g.appendChild(ln);
    });
    // signal dot on one path
    const dot = circle(nodes[0][0], nodes[0][1], 4, 'amd-sig-dot');
    g.appendChild(dot);
    // nodes
    nodes.forEach(([cx, cy], i) => {
      const c = circle(cx, cy, i % 5 === 0 ? 5 : 3, 'amd-node');
      g.appendChild(c);
    });
  }

  function initNeuralDepth() {
    const svg = mkSVG('fx-neural-depth');
    if (!svg) return;
    const g = el('g', { class: 'amd-neural' });
    svg.appendChild(g);
    // curved organic paths
    const paths = [
      'M680,200 C750,260 820,200 860,300 S940,420 880,500 S820,620 760,700',
      'M760,160 C820,220 760,320 820,400 S900,500 860,620 S800,720 740,800',
      'M640,300 C700,360 680,460 740,540 S800,640 760,760 S720,860 680,940',
      'M900,280 C940,340 920,460 880,540 S840,640 880,740 S920,840 900,940',
      'M720,440 C780,480 820,560 800,640 S780,720 820,800 S860,880 840,960',
    ];
    const colors = ['#14A8F4', '#5dc8f7', '#14A8F4', '#8ddcff', '#14A8F4'];
    paths.forEach((d, i) => {
      const p = path(d, 'amd-nline');
      p.style.stroke = colors[i % colors.length];
      p.style.opacity = `${0.3 + (i % 3) * 0.1}`;
      g.appendChild(p);
    });
    // signal dots on each path
    paths.forEach(() => {
      const d = circle(0, 0, 5, 'amd-neural-dot');
      g.appendChild(d);
    });
    // nodes at intersections
    const npts = [[720,440],[760,540],[800,640],[840,740],[860,540],[820,640],[780,740],
      [760,160],[820,300],[880,420],[760,700],[820,800],[880,940],[680,300],[740,460]];
    npts.forEach(([cx, cy], i) => {
      const c = circle(cx, cy, i % 4 === 0 ? 6 : 3.5, 'amd-node');
      g.appendChild(c);
    });
  }

  function initCmdGrid() {
    const svg = mkSVG('fx-cmd-grid');
    if (!svg) return;
    const g = el('g', { class: 'amd-cmdgrid' });
    svg.appendChild(g);
    // vertical lines
    for (let x = 540; x <= W; x += 60) {
      g.appendChild(line(x, 0, x, H, 'amd-gline'));
    }
    // horizontal lines
    for (let y = 0; y <= H; y += 60) {
      g.appendChild(line(540, y, W, y, 'amd-gline'));
    }
    // block highlights (4 random rectangles)
    [[600,120,120,120],[720,300,180,60],[660,480,120,120],[780,600,180,60]].forEach(([x,y,w,h]) => {
      const r = el('rect', { x, y, width: w, height: h, class: 'amd-ghighlight' });
      g.appendChild(r);
    });
    // HUD corners
    [[540,0],[W,0],[540,H],[W,H]].forEach(([cx,cy]) => {
      const c = circle(cx, cy, 4, 'amd-hud-dot');
      g.appendChild(c);
    });
  }

  function initLaserGrid() {
    const svg = mkSVG('fx-laser-grid');
    if (!svg) return;
    const g = el('g', { class: 'amd-laser' });
    svg.appendChild(g);
    const vp = [W/2, H * 0.45]; // vanishing point
    // perspective lines fanning from vp
    const angles = [-60,-45,-30,-15,0,15,30,45,60];
    angles.forEach(deg => {
      const rad = (deg * Math.PI) / 180;
      const ex = vp[0] + Math.sin(rad) * 900;
      const ey = vp[1] + Math.cos(rad) * 900;
      const ln = line(vp[0], vp[1], ex, ey, 'amd-laser-line');
      g.appendChild(ln);
    });
    // horizontal crosslines at depths
    [0.55,0.65,0.75,0.85,0.95,1.05,1.2].forEach(t => {
      const y = vp[1] + t * 600;
      const spread = t * 500;
      g.appendChild(line(vp[0] - spread, y, vp[0] + spread, y, 'amd-laser-h'));
    });
    // signal dot
    const dot = circle(vp[0], vp[1] + 300, 5, 'amd-sig-dot');
    g.appendChild(dot);
  }

  function initCircuitMap() {
    const svg = mkSVG('fx-circuit-map');
    if (!svg) return;
    const g = el('g', { class: 'amd-circuit' });
    svg.appendChild(g);
    // orthogonal circuit traces
    const traces = [
      'M620,200 H780 V320 H900 V440',
      'M680,200 V400 H820 V520 H960',
      'M620,320 H700 V480 H840 V600',
      'M780,320 V480 H900 V600 H820 V720',
      'M620,480 H760 V600 H880 V720 H820',
      'M680,600 V720 H800 V840 H920',
      'M700,720 H840 V840 H760 V960',
      'M820,720 V840 H940 V960',
      'M620,840 H740 V960 H860 V1080',
      'M780,840 V1000 H900 V1080',
    ];
    traces.forEach(d => {
      const p = path(d, 'amd-circuit-trace');
      g.appendChild(p);
    });
    // nodes at trace ends/junctions
    const nodes = [
      [780,200],[900,320],[900,440],[960,200],[840,320],[900,520],
      [880,440],[820,520],[760,600],[880,600],[820,720],[940,720],
      [800,840],[920,840],[860,960],[940,960],[860,1080],[900,1080],
    ];
    nodes.forEach(([cx,cy]) => {
      g.appendChild(circle(cx, cy, 4, 'amd-cnode'));
    });
    // signal dot
    g.appendChild(circle(620, 200, 5, 'amd-sig-dot'));
  }

  function initHexShield() {
    const svg = mkSVG('fx-hex-shield');
    if (!svg) return;
    const g = el('g', { class: 'amd-hex' });
    svg.appendChild(g);
    function hexPoints(cx, cy, r) {
      return Array.from({length:6}, (_,i) => {
        const a = (i * 60 - 30) * Math.PI / 180;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(' ');
    }
    const r = 68, cols = 5, rows = 7;
    const dx = r * Math.sqrt(3), dy = r * 1.5;
    const ox = 540, oy = 60;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = ox + col * dx + (row % 2 === 1 ? dx / 2 : 0);
        const cy = oy + row * dy;
        if (cx > W + 20) continue;
        const h = poly(hexPoints(cx, cy, r - 4), 'amd-hex-cell');
        g.appendChild(h);
      }
    }
    // wave energy band
    const wave = el('rect', { x: 540, y: -20, width: W - 540, height: 20, class: 'amd-hex-wave' });
    g.appendChild(wave);
  }

  function initRadarField() {
    const svg = mkSVG('fx-radar-field');
    if (!svg) return;
    const g = el('g', { class: 'amd-radar' });
    svg.appendChild(g);
    const cx = 780, cy = 540;
    // rings
    [120,240,360,480].forEach(r => {
      g.appendChild(el('circle', { cx, cy, r, class: 'amd-radar-ring' }));
    });
    // cross lines
    g.appendChild(line(cx - 480, cy, cx + 480, cy, 'amd-radar-cross'));
    g.appendChild(line(cx, cy - 480, cx, cy + 480, 'amd-radar-cross'));
    // sweep line (rotates)
    const sweep = line(cx, cy, cx + 480, cy, 'amd-radar-sweep');
    sweep.style.transformOrigin = `${cx}px ${cy}px`;
    g.appendChild(sweep);
    // detected points
    const pts = [[cx+200,cy-100],[cx-80,cy+180],[cx+150,cy+240],[cx-200,cy-60],[cx+300,cy+80]];
    pts.forEach(([px, py]) => {
      const p = circle(px, py, 5, 'amd-radar-point');
      const ring = el('circle', { cx: px, cy: py, r: 5, class: 'amd-radar-ping' });
      g.appendChild(ring);
      g.appendChild(p);
    });
  }

  function initTopographic() {
    const svg = mkSVG('fx-topographic');
    if (!svg) return;
    const g = el('g', { class: 'amd-topo' });
    svg.appendChild(g);
    // wavy horizontal lines — each with slight vertical offset variation
    const numLines = 20;
    const spacing = H / (numLines + 2);
    for (let i = 0; i < numLines; i++) {
      const y = spacing + i * spacing;
      const amp = 20 + (i % 5) * 8;
      const d = `M0,${y} ` + Array.from({length:12}, (_, j) => {
        const x = j * (W / 11);
        const wave = Math.sin((j + i * 0.6) * 0.9) * amp;
        return `L${x},${y + wave}`;
      }).join(' ');
      const opacity = 0.12 + (i % 4) * 0.06;
      const ln = path(d, 'amd-topo-line');
      ln.style.opacity = String(opacity);
      g.appendChild(ln);
    }
  }

  function initDataRain() {
    const svg = mkSVG('fx-data-rain');
    if (!svg) return;
    const g = el('g', { class: 'amd-rain' });
    svg.appendChild(g);
    const cols = 14;
    const colW = (W - 540) / cols;
    for (let c = 0; c < cols; c++) {
      const x = 540 + c * colW + colW / 2;
      const segments = Math.floor(4 + (c % 4));
      for (let s = 0; s < segments; s++) {
        const y1 = 80 + s * (H / segments * 0.8);
        const y2 = y1 + 40 + (c % 3) * 20;
        const ln = line(x, y1, x, y2, 'amd-rain-bar');
        ln.style.opacity = `${0.15 + (s % 3) * 0.1}`;
        g.appendChild(ln);
      }
      // glowing lead dot
      const dotY = 80 + (c * 73) % (H - 200);
      g.appendChild(circle(x, dotY, 2.5, 'amd-rain-dot'));
    }
  }

  function initWaveParticles() {
    const svg = mkSVG('fx-wave-particles');
    if (!svg) return;
    const g = el('g', { class: 'amd-wave-field' });
    svg.appendChild(g);
    const cols = 16, rows = 20;
    const cw = (W - 500) / cols, rh = H / (rows + 2);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = 500 + c * cw + cw / 2;
        const cy = rh + r * rh;
        const dot = circle(cx, cy, 2, 'amd-wave-dot');
        dot.dataset.col = String(c);
        dot.dataset.row = String(r);
        g.appendChild(dot);
      }
    }
  }

  function initCityLinkDepth() {
    const svg = mkSVG('fx-city-link-depth');
    if (!svg) return;
    const g = el('g', { class: 'amd-city' });
    svg.appendChild(g);
    // hotspot nodes (representing city points)
    const hots = [
      [700,220],[820,180],[920,260],[780,360],[900,440],[840,540],
      [720,500],[780,620],[900,600],[840,720],[760,800],[880,780],[920,900],
    ];
    const conns = [[0,1],[1,2],[0,3],[1,3],[2,4],[3,4],[4,5],[5,6],[5,7],
      [6,7],[7,8],[8,9],[9,10],[9,11],[10,11],[11,12]];
    conns.forEach(([a,b]) => {
      g.appendChild(line(hots[a][0],hots[a][1],hots[b][0],hots[b][1],'amd-city-link'));
    });
    // signal dot
    g.appendChild(circle(hots[0][0], hots[0][1], 5, 'amd-sig-dot'));
    hots.forEach(([cx,cy], i) => {
      const r = i % 3 === 0 ? 8 : 5;
      g.appendChild(circle(cx, cy, r, i % 3 === 0 ? 'amd-city-hub' : 'amd-node'));
    });
  }

  function initPolygonFracture() {
    const svg = mkSVG('fx-polygon-fracture');
    if (!svg) return;
    const g = el('g', { class: 'amd-poly' });
    svg.appendChild(g);
    const tris = [
      '600,200 720,180 660,300','720,180 840,200 780,320','840,200 920,260 860,380',
      '600,300 660,300 630,420','660,300 780,320 720,440','780,320 860,380 820,500',
      '600,420 630,420 600,540','630,420 720,440 660,560','720,440 820,500 780,620',
      '600,540 660,560 620,680','660,560 780,620 720,740','780,620 860,680 820,800',
      '600,680 620,680 600,800','620,680 720,740 660,860','720,740 820,800 780,920',
    ];
    tris.forEach(points => {
      const p = poly(points, 'amd-poly-tri');
      g.appendChild(p);
    });
  }

  function initOrbitalHUD() {
    const svg = mkSVG('fx-orbital-hud');
    if (!svg) return;
    const g = el('g', { class: 'amd-orbital' });
    svg.appendChild(g);
    const cx = 780, cy = 540;
    // partial arcs — use circle arcs via stroke-dasharray trick
    [140,220,320].forEach((r, i) => {
      const circ = el('circle', { cx, cy, r, class: 'amd-orbit-arc' });
      const full = 2 * Math.PI * r;
      circ.style.strokeDasharray = `${full * (0.4 + i * 0.15)} ${full}`;
      circ.style.transform = `rotate(${-60 + i * 30}deg)`;
      circ.style.transformOrigin = `${cx}px ${cy}px`;
      g.appendChild(circ);
    });
    // orbit dots
    [[cx + 140, cy],[cx, cy - 220],[cx - 320, cy]].forEach(([ox,oy]) => {
      g.appendChild(circle(ox, oy, 5, 'amd-orbit-dot'));
    });
    // center
    g.appendChild(circle(cx, cy, 10, 'amd-orbit-center'));
    // HUD data tick marks
    for (let a = 0; a < 360; a += 30) {
      const r = (a % 90 === 0) ? 340 : 330;
      const rad = (a * Math.PI) / 180;
      const x1 = cx + 320 * Math.cos(rad), y1 = cy + 320 * Math.sin(rad);
      const x2 = cx + r * Math.cos(rad), y2 = cy + r * Math.sin(rad);
      g.appendChild(line(x1, y1, x2, y2, 'amd-orbit-tick'));
    }
  }

  function initFirewallWall() {
    const svg = mkSVG('fx-firewall-wall');
    if (!svg) return;
    const g = el('g', { class: 'amd-fw' });
    svg.appendChild(g);
    const cols = 9, rows = 15;
    const bw = (W - 540) / cols - 4, bh = H / rows - 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 540 + c * (bw + 4), y = r * (bh + 6);
        const blk = el('rect', { x, y, width: bw, height: bh, class: 'amd-fw-block' });
        g.appendChild(blk);
      }
    }
    // signal pulse line that gets "blocked"
    const signal = line(0, H/2, W, H/2, 'amd-fw-signal');
    g.appendChild(signal);
    // shield line
    const shield = line(540, 0, 540, H, 'amd-fw-shield');
    g.appendChild(shield);
  }

  function initDigitalFabric() {
    const svg = mkSVG('fx-digital-fabric');
    if (!svg) return;
    const g = el('g', { class: 'amd-fabric' });
    svg.appendChild(g);
    // diagonal threads going NW→SE and NE→SW
    const step = 80;
    for (let i = -5; i < 20; i++) {
      const x = 540 + i * step;
      g.appendChild(line(x, 0, x + H * 0.4, H, 'amd-fabric-thread'));
    }
    for (let i = -5; i < 20; i++) {
      const x = 540 + i * step;
      g.appendChild(line(x, H, x + H * 0.4, 0, 'amd-fabric-thread amd-fabric-alt'));
    }
    // intersection glow dots (sampled)
    const isects = [[700,200],[780,280],[860,360],[940,440],[700,360],[780,440],
      [860,520],[940,600],[700,520],[780,600],[860,680],[940,760],[700,680],
      [780,760],[860,840],[940,920]];
    isects.forEach(([cx,cy]) => {
      g.appendChild(circle(cx, cy, 3, 'amd-fabric-node'));
    });
  }

  function initMeshRipple() {
    const svg = mkSVG('fx-mesh-ripple');
    if (!svg) return;
    const g = el('g', { class: 'amd-ripple' });
    svg.appendChild(g);
    const cx = 780, cy = 540;
    const cols = 10, rows = 14, gw = 50, gh = 45;
    const ox = cx - cols * gw / 2, oy = cy - rows * gh / 2;
    for (let r = 0; r <= rows; r++) {
      const pts = Array.from({length: cols + 1}, (_, c) => {
        return `${ox + c * gw},${oy + r * gh}`;
      }).join(' ');
      g.appendChild(el('polyline', { points: pts, class: 'amd-ripple-line' }));
    }
    for (let c = 0; c <= cols; c++) {
      const pts = Array.from({length: rows + 1}, (_, r) => {
        return `${ox + c * gw},${oy + r * gh}`;
      }).join(' ');
      g.appendChild(el('polyline', { points: pts, class: 'amd-ripple-line' }));
    }
    // ripple rings
    [80,160,240].forEach(r => {
      g.appendChild(el('circle', { cx, cy, r, class: 'amd-ripple-ring' }));
    });
  }

  function initSignalRoute() {
    const svg = mkSVG('fx-amd-signal-route');
    if (!svg) return;
    const g = el('g', { class: 'amd-sroute' });
    svg.appendChild(g);
    const routeD = 'M640,200 H820 V320 H900 V480 H840 V600 H780 V720 H820 V840 H760 V960 H700 V1080';
    const route = path(routeD, 'amd-route-path');
    g.appendChild(route);
    const dot = circle(640, 200, 6, 'amd-sig-dot');
    g.appendChild(dot);
    // branch paths
    ['M820,320 H960','M900,480 H980','M840,600 H960','M780,720 H940'].forEach(d => {
      g.appendChild(path(d, 'amd-route-branch'));
    });
  }

  function initNodeChain() {
    const svg = mkSVG('fx-node-chain');
    if (!svg) return;
    const g = el('g', { class: 'amd-chain' });
    svg.appendChild(g);
    const nodes = [
      [780,140], [680,260],[880,280],[740,400],[860,420],[800,540],
      [700,640],[880,640],[760,760],[840,780],[780,900],[780,1040],
    ];
    const conns = [[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[5,6],[5,7],[6,8],[7,9],[8,10],[9,10],[10,11]];
    conns.forEach(([a,b]) => {
      g.appendChild(line(nodes[a][0],nodes[a][1],nodes[b][0],nodes[b][1],'amd-chain-link'));
    });
    const dot = circle(nodes[0][0], nodes[0][1], 6, 'amd-sig-dot');
    g.appendChild(dot);
    nodes.forEach(([cx,cy], i) => {
      const r = i === 0 ? 10 : i % 3 === 0 ? 7 : 5;
      g.appendChild(circle(cx, cy, r, 'amd-chain-node'));
    });
  }

  function initDepthFabric() {
    // 3 layered constellation-like patterns at different scales
    const svg = mkSVG('fx-depth-fabric');
    if (!svg) return;
    const layers = [
      { opacity: 0.08, scale: 1.2, cls: 'amd-dfab-far' },
      { opacity: 0.14, scale: 1.0, cls: 'amd-dfab-mid' },
      { opacity: 0.22, scale: 0.8, cls: 'amd-dfab-near' },
    ];
    layers.forEach(({ cls }) => {
      const g = el('g', { class: cls });
      svg.appendChild(g);
      // simple grid of faint lines
      for (let x = 560; x < W; x += 90) g.appendChild(line(x, 0, x, H, 'amd-dfab-vline'));
      for (let y = 0; y < H; y += 90) g.appendChild(line(560, y, W, y, 'amd-dfab-hline'));
    });
  }

  function initHudPattern() {
    const svg = mkSVG('fx-hud-pattern');
    if (!svg) return;
    const g = el('g', { class: 'amd-hud-pat' });
    svg.appendChild(g);
    // four corners
    const corners = [[40,40],[W-40,40],[40,H-40],[W-40,H-40]];
    const sizes = [24,24,24,24];
    corners.forEach(([x,y], i) => {
      const s = sizes[i];
      const dx = x < W/2 ? 1 : -1, dy = y < H/2 ? 1 : -1;
      g.appendChild(line(x, y, x + dx * s, y, 'amd-hud-corner-line'));
      g.appendChild(line(x, y, x, y + dy * s, 'amd-hud-corner-line'));
    });
    // micro scan lines
    for (let y = 100; y < H; y += 200) {
      const ln = line(40, y, 300, y, 'amd-hud-micro');
      g.appendChild(ln);
    }
    // small marks
    [[140,60],[200,60],[260,60]].forEach(([x,y]) => {
      g.appendChild(circle(x, y, 2, 'amd-hud-mark'));
    });
  }

  /* ═══════════════════════════════════════════════════
     SOLO PREPARE — reset scene before each effect demo
     ═══════════════════════════════════════════════════ */

  function meshPrepare(layerId) {
    return function () {
      soloBase();
      apply({
        [layerId]: { opacity: 0 },
        '#fx-bg-wrap': { filter: 'blur(0px) brightness(0.85)', scale: 1.06 },
      });
    };
  }

  const SOLO_PREPARE = {
    'constellation-field-depth': function () {
      meshPrepare('#fx-constellation')();
      initConstellation();
    },
    'neural-network-flow-depth': function () {
      meshPrepare('#fx-neural-depth')();
      initNeuralDepth();
    },
    'command-grid-depth': function () {
      meshPrepare('#fx-cmd-grid')();
      initCmdGrid();
    },
    'laser-grid-perspective-depth': function () {
      meshPrepare('#fx-laser-grid')();
      initLaserGrid();
    },
    'circuit-board-map-depth': function () {
      meshPrepare('#fx-circuit-map')();
      initCircuitMap();
    },
    'hex-shield-field-depth': function () {
      meshPrepare('#fx-hex-shield')();
      initHexShield();
    },
    'radar-sweep-field-depth': function () {
      meshPrepare('#fx-radar-field')();
      initRadarField();
    },
    'topographic-lines-depth': function () {
      meshPrepare('#fx-topographic')();
      initTopographic();
    },
    'data-rain-columns-depth': function () {
      meshPrepare('#fx-data-rain')();
      initDataRain();
    },
    'wave-particle-field-depth': function () {
      meshPrepare('#fx-wave-particles')();
      initWaveParticles();
    },
    'city-link-map-depth': function () {
      meshPrepare('#fx-city-link-depth')();
      initCityLinkDepth();
    },
    'polygon-fracture-depth': function () {
      meshPrepare('#fx-polygon-fracture')();
      initPolygonFracture();
    },
    'orbital-hud-system-depth': function () {
      meshPrepare('#fx-orbital-hud')();
      initOrbitalHUD();
    },
    'firewall-wall-depth': function () {
      meshPrepare('#fx-firewall-wall')();
      initFirewallWall();
    },
    'digital-fabric-depth': function () {
      meshPrepare('#fx-digital-fabric')();
      initDigitalFabric();
    },
    'mesh-ripple-reactive': function () {
      meshPrepare('#fx-mesh-ripple')();
      initMeshRipple();
    },
    'signal-route-depth': function () {
      meshPrepare('#fx-amd-signal-route')();
      initSignalRoute();
    },
    'node-chain-reaction-depth': function () {
      meshPrepare('#fx-node-chain')();
      initNodeChain();
    },
    'depth-fabric-parallax': function () {
      meshPrepare('#fx-depth-fabric')();
      initDepthFabric();
    },
    'hud-corners-pattern-depth': function () {
      meshPrepare('#fx-hud-pattern')();
      initHudPattern();
    },
    /* enhancers */
    'mesh-focus-pull': function () {
      soloBase();
      apply({ '#fx-bg-wrap': { filter: 'blur(10px) brightness(0.8)', scale: 1.08 } });
    },
    'mesh-blur-resolve': function () { soloBase(); apply({ '#fx-constellation': { opacity: 1 }, '#fx-bg-wrap': { filter: 'blur(6px) brightness(0.8)' } }); initConstellation(); },
    'mesh-depth-parallax': function () { soloBase(); initConstellation(); apply({ '#fx-constellation': { opacity: 1 } }); },
    'mesh-soft-glow': function () { soloBase(); apply({ '#fx-logo-glow': { opacity: 0 } }); },
    'mesh-scan-activation': function () { soloBase(); apply({ '#fx-scan-h': { y: -20, opacity: 0 } }); },
    'mesh-bokeh-back': function () { soloBase(); },
    'mesh-edge-softness': function () { soloBase(); apply({ '#fx-tilt-shift-top, #fx-tilt-shift-bot': { opacity: 0 } }); },
    'mesh-camera-dolly': function () { soloBase(); apply({ '#fx-bg-wrap': { scale: 1.0 } }); },
    'mesh-rack-focus': function () { soloBase(); apply({ '#fx-bg-wrap': { filter: 'blur(8px) brightness(0.85)' } }); },
    'mesh-pulse-wave': function () { soloBase(); initMeshRipple(); apply({ '#fx-mesh-ripple': { opacity: 0 } }); },
  };

  /* ═══════════════════════════════════════════════════
     EFFECTS — GSAP timelines
     ═══════════════════════════════════════════════════ */

  const Effects = {

    'constellation-field-depth'(tl, at) {
      initConstellation();
      tl.to('#fx-constellation', { opacity: 1, duration: 0.3 }, at);
      tl.to('.amd-cline', { strokeDasharray: '120 9999', strokeDashoffset: 0, opacity: 0.4,
        duration: 0.6, stagger: 0.025, ease: 'power2.out' }, at);
      tl.from('.amd-node', { opacity: 0, scale: 0, duration: 0.2, stagger: 0.03,
        transformOrigin: 'center center', ease: 'back.out(2)' }, at + 0.3);
      // signal traversal
      const dot = document.querySelector('#fx-constellation .amd-sig-dot');
      if (dot) {
        const nodes = [...document.querySelectorAll('#fx-constellation .amd-node')];
        if (nodes.length > 4) {
          const pts = [nodes[0],nodes[2],nodes[5],nodes[8],nodes[11]];
          pts.forEach((n, i) => {
            const cx = parseFloat(n.getAttribute('cx')), cy = parseFloat(n.getAttribute('cy'));
            tl.to(dot, { attr: { cx, cy }, duration: 0.28, ease: 'power1.inOut' }, at + 0.8 + i * 0.28);
            tl.to(n, { attr: { r: 7 }, duration: 0.08 }, at + 0.8 + i * 0.28);
            tl.to(n, { attr: { r: 3 }, duration: 0.2 }, at + 0.88 + i * 0.28);
          });
        }
      }
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', scale: 1.05, duration: 0.8, ease: 'power2.out' }, at + 0.1);
    },

    'neural-network-flow-depth'(tl, at) {
      initNeuralDepth();
      tl.to('#fx-neural-depth', { opacity: 1, duration: 0.3 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.8, ease: 'power2.out' }, at + 0.1);
      // draw paths
      tl.to('.amd-nline', {
        strokeDasharray(i, el) { return `${dashLen(el)} 9999`; },
        strokeDashoffset: 0, duration: 0.7, stagger: 0.12, ease: 'power2.out',
        onStart() { document.querySelectorAll('.amd-nline').forEach(p => { const l = dashLen(p); p.style.strokeDasharray = `${l} 9999`; p.style.strokeDashoffset = String(l); }); },
      }, at);
      tl.from('.amd-node', { opacity: 0, scale: 0, duration: 0.2, stagger: 0.04,
        transformOrigin: 'center center', ease: 'back.out(1.8)' }, at + 0.4);
      // signal dots travel paths
      const paths = [...document.querySelectorAll('#fx-neural-depth .amd-nline')];
      const sigDots = [...document.querySelectorAll('#fx-neural-depth .amd-neural-dot')];
      paths.forEach((p, i) => {
        const dot = sigDots[i];
        if (!dot) return;
        // Traverse via getPointAtLength fallback
        gsap.set(dot, { opacity: 0 });
        tl.to(dot, { opacity: 1, duration: 0.05 }, at + 0.8 + i * 0.2);
        const steps = 12;
        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          try {
            const total = dashLen(p);
            const pt = p.getPointAtLength(t * total);
            tl.to(dot, { attr: { cx: pt.x, cy: pt.y }, duration: 0.8 / steps, ease: 'none' },
              at + 0.85 + i * 0.2 + (s * 0.8 / steps));
          } catch {}
        }
        tl.to(dot, { opacity: 0, duration: 0.1 }, at + 1.6 + i * 0.2);
      });
    },

    'command-grid-depth'(tl, at) {
      initCmdGrid();
      tl.to('#fx-cmd-grid', { opacity: 1, duration: 0.2 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.7, ease: 'power2.out' }, at);
      tl.from('.amd-gline', { opacity: 0, duration: 0.4, stagger: 0.02, ease: 'power2.out' }, at);
      tl.from('.amd-ghighlight', { opacity: 0, scale: 0.8, duration: 0.25, stagger: 0.1,
        transformOrigin: 'center center', ease: 'back.out(1.5)' }, at + 0.5);
      tl.from('.amd-hud-dot', { opacity: 0, scale: 0, duration: 0.2, stagger: 0.08,
        transformOrigin: 'center center' }, at + 0.35);
    },

    'laser-grid-perspective-depth'(tl, at) {
      initLaserGrid();
      tl.to('#fx-laser-grid', { opacity: 1, duration: 0.25 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.8, ease: 'power2.out' }, at);
      tl.from('.amd-laser-line', { opacity: 0, scaleY: 0, duration: 0.4, stagger: 0.04,
        transformOrigin: 'center 45%', ease: 'power3.out' }, at);
      tl.from('.amd-laser-h', { opacity: 0, scaleX: 0, duration: 0.3, stagger: 0.06,
        transformOrigin: 'center center', ease: 'power2.out' }, at + 0.3);
      // subtle push-in
      tl.to('#fx-bg-wrap', { scale: 1.06, duration: 2.0, ease: 'power1.inOut' }, at + 0.2);
      // signal crossing
      const dot = document.querySelector('#fx-laser-grid .amd-sig-dot');
      if (dot) {
        tl.fromTo(dot, { attr: { cx: 200, cy: 800 } }, { attr: { cx: 900, cy: 500 }, opacity: 1, duration: 0.8, ease: 'power2.in' }, at + 0.8);
        tl.to(dot, { opacity: 0, duration: 0.15 }, at + 1.5);
      }
    },

    'circuit-board-map-depth'(tl, at) {
      initCircuitMap();
      tl.to('#fx-circuit-map', { opacity: 1, duration: 0.25 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.7, ease: 'power2.out' }, at);
      // draw traces
      tl.add(() => {
        document.querySelectorAll('.amd-circuit-trace').forEach(p => {
          const l = dashLen(p);
          p.style.strokeDasharray = `${l} 9999`;
          p.style.strokeDashoffset = String(l);
        });
      }, at);
      tl.to('.amd-circuit-trace', { strokeDashoffset: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out' }, at + 0.05);
      tl.from('.amd-cnode', { opacity: 0, scale: 0, duration: 0.15, stagger: 0.04,
        transformOrigin: 'center center', ease: 'back.out(2)' }, at + 0.5);
      // signal dot runs first trace
      const dot = document.querySelector('#fx-circuit-map .amd-sig-dot');
      const firstTrace = document.querySelector('#fx-circuit-map .amd-circuit-trace');
      if (dot && firstTrace) {
        tl.to(dot, { opacity: 1, duration: 0.05 }, at + 0.1);
        const steps = 14;
        for (let s = 0; s <= steps; s++) {
          try {
            const total = dashLen(firstTrace);
            const pt = firstTrace.getPointAtLength((s / steps) * total);
            tl.to(dot, { attr: { cx: pt.x, cy: pt.y }, duration: 1.0 / steps, ease: 'none' },
              at + 0.15 + (s * 1.0 / steps));
          } catch {}
        }
        tl.to(dot, { opacity: 0, duration: 0.12 }, at + 1.1);
      }
    },

    'hex-shield-field-depth'(tl, at) {
      initHexShield();
      tl.to('#fx-hex-shield', { opacity: 1, duration: 0.2 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.7 }, at);
      tl.from('.amd-hex-cell', { opacity: 0, scale: 0.6, duration: 0.25, stagger: 0.015,
        transformOrigin: 'center center', ease: 'back.out(1.5)' }, at);
      // energy wave traversal
      tl.fromTo('.amd-hex-wave',
        { y: -20, opacity: 0.7 },
        { y: H + 20, opacity: 0.5, duration: 1.2, ease: 'power1.inOut' }, at + 0.4);
      tl.to('.amd-hex-wave', { opacity: 0, duration: 0.15 }, at + 1.5);
      // highlight some cells after wave
      tl.to('.amd-hex-cell:nth-child(3n+1)', { opacity: 0.55, duration: 0.2, stagger: 0.04 }, at + 0.9);
    },

    'radar-sweep-field-depth'(tl, at) {
      initRadarField();
      tl.to('#fx-radar-field', { opacity: 1, duration: 0.3 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.8 }, at);
      tl.from('.amd-radar-ring', { opacity: 0, scale: 0.3, duration: 0.35, stagger: 0.1,
        transformOrigin: '780px 540px', ease: 'power3.out' }, at);
      tl.from('.amd-radar-cross', { opacity: 0, duration: 0.2, stagger: 0.08 }, at + 0.3);
      // sweep rotation
      const sweep = document.querySelector('.amd-radar-sweep');
      if (sweep) {
        tl.to(sweep, { rotation: 360, duration: 2.0, ease: 'none',
          transformOrigin: '780px 540px' }, at + 0.5);
      }
      // points ping in
      tl.from('.amd-radar-point', { opacity: 0, scale: 0, duration: 0.15, stagger: 0.2,
        transformOrigin: 'center center', ease: 'back.out(3)' }, at + 0.8);
      tl.to('.amd-radar-ping', { scale: 3, opacity: 0, duration: 0.5, stagger: 0.2,
        transformOrigin: 'center center' }, at + 1.0);
    },

    'topographic-lines-depth'(tl, at) {
      initTopographic();
      tl.to('#fx-topographic', { opacity: 1, duration: 0.3 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.8 }, at);
      tl.add(() => {
        document.querySelectorAll('.amd-topo-line').forEach(p => {
          const l = dashLen(p);
          p.style.strokeDasharray = `${l} 9999`;
          p.style.strokeDashoffset = String(l);
        });
      }, at);
      tl.to('.amd-topo-line', { strokeDashoffset: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' }, at + 0.05);
      // subtle drift
      tl.to('.amd-topo-line', { x: 20, duration: 3.0, ease: 'sine.inOut' }, at + 0.8);
    },

    'data-rain-columns-depth'(tl, at) {
      initDataRain();
      tl.to('#fx-data-rain', { opacity: 1, duration: 0.3 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.7 }, at);
      tl.from('.amd-rain-bar', { opacity: 0, y: -30, duration: 0.3, stagger: 0.03, ease: 'power2.out' }, at);
      // dots fall with different delays
      tl.to('.amd-rain-dot', { y: 400, opacity: 0.9, duration: 1.4, stagger: 0.1,
        ease: 'power1.in', repeat: 0 }, at + 0.2);
      tl.to('.amd-rain-dot', { opacity: 0, duration: 0.3 }, at + 1.5);
    },

    'wave-particle-field-depth'(tl, at) {
      initWaveParticles();
      tl.to('#fx-wave-particles', { opacity: 1, duration: 0.3 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.8 }, at);
      tl.from('.amd-wave-dot', { opacity: 0, scale: 0, duration: 0.2, stagger: 0.005,
        transformOrigin: 'center center', ease: 'power2.out' }, at);
      // wave displacement by column
      const cols = 16;
      for (let c = 0; c < cols; c++) {
        const dots = [...document.querySelectorAll(`.amd-wave-dot[data-col="${c}"]`)];
        tl.to(dots, { y: -15 * Math.sin(c * 0.5), duration: 0.8, ease: 'sine.inOut' }, at + 0.4 + c * 0.05);
        tl.to(dots, { y: 0, duration: 0.8, ease: 'sine.inOut' }, at + 1.2 + c * 0.05);
      }
    },

    'city-link-map-depth'(tl, at) {
      initCityLinkDepth();
      tl.to('#fx-city-link-depth', { opacity: 1, duration: 0.3 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.8 }, at);
      tl.from('.amd-city-link', { opacity: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }, at);
      tl.from('.amd-node, .amd-city-hub', { opacity: 0, scale: 0, duration: 0.2, stagger: 0.06,
        transformOrigin: 'center center', ease: 'back.out(2)' }, at + 0.3);
      // signal traversal
      const dot = document.querySelector('#fx-city-link-depth .amd-sig-dot');
      const links = [...document.querySelectorAll('#fx-city-link-depth .amd-city-link')];
      if (dot && links.length > 0) {
        tl.to(dot, { opacity: 1, duration: 0.05 }, at + 0.6);
        links.slice(0,6).forEach((ln, i) => {
          const x1 = parseFloat(ln.getAttribute('x1')), y1 = parseFloat(ln.getAttribute('y1'));
          const x2 = parseFloat(ln.getAttribute('x2')), y2 = parseFloat(ln.getAttribute('y2'));
          tl.fromTo(dot, { attr: { cx: x1, cy: y1 } }, { attr: { cx: x2, cy: y2 }, duration: 0.22, ease: 'power1.inOut' }, at + 0.65 + i * 0.22);
        });
        tl.to(dot, { opacity: 0, duration: 0.15 }, at + 2.0);
      }
    },

    'polygon-fracture-depth'(tl, at) {
      initPolygonFracture();
      tl.to('#fx-polygon-fracture', { opacity: 1, duration: 0.2 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.6 }, at);
      tl.from('.amd-poly-tri', { opacity: 0, scale: 0, x: () => (Math.random()-0.5)*60,
        y: () => (Math.random()-0.5)*60, duration: 0.22, stagger: 0.04,
        transformOrigin: 'center center', ease: 'back.out(1.8)' }, at);
      // pulse flash
      tl.to('.amd-poly-tri:nth-child(3n)', { opacity: 0.85, duration: 0.08, stagger: 0.03 }, at + 0.8);
      tl.to('.amd-poly-tri:nth-child(3n)', { opacity: 0.3, duration: 0.25 }, at + 0.9);
    },

    'orbital-hud-system-depth'(tl, at) {
      initOrbitalHUD();
      tl.to('#fx-orbital-hud', { opacity: 1, duration: 0.3 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.8 }, at);
      tl.from('.amd-orbit-arc', { strokeDasharray: '0 9999', duration: 0.6, stagger: 0.15, ease: 'power3.out' }, at);
      tl.from('.amd-orbit-dot, .amd-orbit-center', { opacity: 0, scale: 0, duration: 0.2, stagger: 0.08,
        transformOrigin: 'center center', ease: 'back.out(2)' }, at + 0.5);
      tl.from('.amd-orbit-tick', { opacity: 0, duration: 0.2, stagger: 0.01 }, at + 0.4);
      // slow rotation of outer arc
      tl.to('.amd-orbit-arc:nth-child(3)', { rotation: 40, duration: 2.0, ease: 'power1.inOut',
        transformOrigin: '780px 540px' }, at + 0.5);
    },

    'firewall-wall-depth'(tl, at) {
      initFirewallWall();
      tl.to('#fx-firewall-wall', { opacity: 1, duration: 0.2 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.7 }, at);
      tl.from('.amd-fw-block', { opacity: 0, y: -20, duration: 0.2, stagger: 0.01, ease: 'power3.out' }, at);
      // signal approaches shield
      const sig = document.querySelector('.amd-fw-signal');
      if (sig) {
        tl.fromTo(sig, { x: -W, opacity: 0.8 }, { x: 0, opacity: 0.8, duration: 0.5, ease: 'power2.in' }, at + 0.6);
        tl.to(sig, { opacity: 0, duration: 0.1 }, at + 1.05);
      }
      // shield pulse
      tl.to('.amd-fw-shield', { opacity: 1, filter: 'drop-shadow(0 0 12px #14A8F4)', duration: 0.15 }, at + 1.0);
      tl.to('.amd-fw-shield', { opacity: 0.5, filter: 'drop-shadow(0 0 4px #14A8F4)', duration: 0.4 }, at + 1.15);
      // blocks react
      tl.to('.amd-fw-block', { opacity: 0.75, duration: 0.08, stagger: { each: 0.005, from: 'start' } }, at + 1.0);
      tl.to('.amd-fw-block', { opacity: 0.3, duration: 0.3 }, at + 1.1);
    },

    'digital-fabric-depth'(tl, at) {
      initDigitalFabric();
      tl.to('#fx-digital-fabric', { opacity: 1, duration: 0.35 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.9 }, at);
      tl.from('.amd-fabric-thread', { opacity: 0, duration: 0.4, stagger: 0.02, ease: 'power2.out' }, at);
      tl.from('.amd-fabric-node', { opacity: 0, scale: 0, duration: 0.15, stagger: 0.04,
        transformOrigin: 'center center', ease: 'back.out(2)' }, at + 0.4);
      // slow drift
      tl.to('.amd-fabric-thread', { x: 8, duration: 2.5, ease: 'sine.inOut' }, at + 0.5);
      tl.to('.amd-fabric-alt', { x: -8, duration: 2.5, ease: 'sine.inOut' }, at + 0.5);
    },

    'mesh-ripple-reactive'(tl, at) {
      initMeshRipple();
      tl.to('#fx-mesh-ripple', { opacity: 1, duration: 0.25 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.7 }, at);
      tl.from('.amd-ripple-line', { opacity: 0, duration: 0.4, stagger: 0.02, ease: 'power2.out' }, at);
      // ripple rings expand from center
      tl.from('.amd-ripple-ring', { attr: { r: 5 }, opacity: 0.9, duration: 0.7, stagger: 0.2,
        ease: 'power2.out' }, at + 0.3);
      tl.to('.amd-ripple-ring', { opacity: 0, duration: 0.4, stagger: 0.15 }, at + 1.0);
      // grid distortion via y offset on alternating lines
      const hlines = [...document.querySelectorAll('.amd-ripple-line')];
      hlines.slice(0,8).forEach((ln, i) => {
        tl.to(ln, { y: (i % 2 === 0 ? 8 : -8), duration: 0.4, ease: 'sine.inOut' }, at + 0.5 + i * 0.04);
        tl.to(ln, { y: 0, duration: 0.5, ease: 'sine.inOut' }, at + 0.9 + i * 0.04);
      });
    },

    'signal-route-depth'(tl, at) {
      initSignalRoute();
      tl.to('#fx-amd-signal-route', { opacity: 1, duration: 0.25 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.7 }, at);
      const route = document.querySelector('.amd-route-path');
      if (route) {
        const l = dashLen(route);
        gsap.set(route, { strokeDasharray: l, strokeDashoffset: l, opacity: 1 });
        tl.to(route, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' }, at);
      }
      tl.from('.amd-route-branch', { opacity: 0, duration: 0.2, stagger: 0.15, ease: 'power2.out' }, at + 0.4);
      // signal dot on route
      const dot = document.querySelector('#fx-amd-signal-route .amd-sig-dot');
      if (dot && route) {
        tl.to(dot, { opacity: 1, duration: 0.05 }, at + 0.1);
        const steps = 14;
        for (let s = 0; s <= steps; s++) {
          try {
            const total = dashLen(route);
            const pt = route.getPointAtLength((s / steps) * total);
            tl.to(dot, { attr: { cx: pt.x, cy: pt.y }, duration: 1.2 / steps, ease: 'none' },
              at + 0.15 + (s * 1.2 / steps));
          } catch {}
        }
        tl.to(dot, { opacity: 0, duration: 0.12 }, at + 1.25);
      }
      // CTA reveal at route end
      tl.fromTo('#fx-cta', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' }, at + 1.1);
    },

    'node-chain-reaction-depth'(tl, at) {
      initNodeChain();
      tl.to('#fx-node-chain', { opacity: 1, duration: 0.25 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.8 }, at);
      tl.from('.amd-chain-link', { opacity: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' }, at);
      const nodes = [...document.querySelectorAll('.amd-chain-node')];
      // chain activation
      nodes.forEach((n, i) => {
        tl.fromTo(n, { opacity: 0, attr: { r: 3 } },
          { opacity: 1, attr: { r: n.getAttribute('r') || 5 }, duration: 0.15, ease: 'back.out(2)' },
          at + 0.3 + i * 0.14);
        tl.to(n, { filter: 'drop-shadow(0 0 8px #14A8F4)', duration: 0.08 }, at + 0.36 + i * 0.14);
        tl.to(n, { filter: 'drop-shadow(0 0 3px #14A8F4)', duration: 0.35 }, at + 0.44 + i * 0.14);
      });
      // signal dot
      const dot = document.querySelector('#fx-node-chain .amd-sig-dot');
      if (dot && nodes.length > 3) {
        tl.to(dot, { opacity: 1, duration: 0.05 }, at + 0.3);
        nodes.slice(0, 6).forEach((n, i) => {
          const cx = parseFloat(n.getAttribute('cx')), cy = parseFloat(n.getAttribute('cy'));
          tl.to(dot, { attr: { cx, cy }, duration: 0.14, ease: 'power2.inOut' }, at + 0.3 + i * 0.14);
        });
        tl.to(dot, { opacity: 0, duration: 0.12 }, at + 1.3);
      }
    },

    'depth-fabric-parallax'(tl, at) {
      initDepthFabric();
      tl.to('#fx-depth-fabric', { opacity: 1, duration: 0.4 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.9 }, at);
      // three layers at different parallax speeds
      tl.from('.amd-dfab-far', { opacity: 0, x: -30, duration: 0.8, ease: 'power2.out' }, at);
      tl.to('.amd-dfab-far', { x: 15, duration: 3.0, ease: 'sine.inOut' }, at + 0.5);
      tl.from('.amd-dfab-mid', { opacity: 0, x: -20, duration: 0.8, ease: 'power2.out' }, at + 0.1);
      tl.to('.amd-dfab-mid', { x: 8, duration: 2.5, ease: 'sine.inOut' }, at + 0.5);
      tl.from('.amd-dfab-near', { opacity: 0, x: -10, duration: 0.8, ease: 'power2.out' }, at + 0.2);
      tl.to('.amd-dfab-near', { x: 3, duration: 2.0, ease: 'sine.inOut' }, at + 0.5);
    },

    'hud-corners-pattern-depth'(tl, at) {
      initHudPattern();
      tl.to('#fx-hud-pattern', { opacity: 1, duration: 0.3 }, at);
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.7 }, at);
      tl.from('.amd-hud-corner-line', { opacity: 0, scaleX: 0, scaleY: 0, duration: 0.2, stagger: 0.06,
        transformOrigin: '50% 50%', ease: 'power3.out' }, at);
      tl.from('.amd-hud-micro', { opacity: 0, scaleX: 0, duration: 0.25, stagger: 0.1,
        transformOrigin: 'left center', ease: 'power2.out' }, at + 0.3);
      tl.from('.amd-hud-mark', { opacity: 0, scale: 0, duration: 0.15, stagger: 0.06,
        transformOrigin: 'center center', ease: 'back.out(2)' }, at + 0.4);
    },

    /* ═══ ENHANCERS ═══ */

    'mesh-focus-pull'(tl, at) {
      tl.fromTo('#fx-bg-wrap',
        { filter: 'blur(10px) brightness(0.8)', scale: 1.08 },
        { filter: 'blur(0px) brightness(1)', scale: 1.05, duration: 0.7, ease: 'power2.out' }, at);
      tl.from('#fx-row-1, #fx-row-2, #fx-row-3, #fx-row-4, #fx-row-5',
        { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power3.out' }, at + 0.3);
    },
    'mesh-blur-resolve'(tl, at) {
      tl.to('#fx-bg-wrap', { filter: 'blur(0px) brightness(1)', duration: 0.6, ease: 'power2.out' }, at);
      tl.to('.amd-cline, .amd-node', { opacity: 0.7, duration: 0.4, stagger: 0.02, ease: 'power2.out' }, at + 0.1);
    },
    'mesh-depth-parallax'(tl, at) {
      tl.to('#fx-bg-wrap', { x: -12, scale: 1.08, duration: 2.5, ease: 'sine.inOut' }, at);
      tl.to('#fx-content', { x: 6, duration: 2.5, ease: 'sine.inOut' }, at);
    },
    'mesh-soft-glow'(tl, at) {
      tl.to('#fx-logo-glow', { opacity: 0.5, duration: 0.3, ease: 'power2.out' }, at);
      tl.to('#fx-logo-glow', { opacity: 0.2, duration: 1.0, ease: 'sine.inOut' }, at + 0.4);
    },
    'mesh-scan-activation'(tl, at) {
      tl.fromTo('#fx-scan-h', { y: -20, opacity: 0 }, { y: 1370, opacity: 0.6, duration: 0.8, ease: 'power2.inOut' }, at);
      tl.to('#fx-scan-h', { opacity: 0, duration: 0.1 }, at + 0.78);
    },
    'mesh-bokeh-back'(tl, at) {
      const bokeh = document.getElementById('fx-bokeh-field');
      if (bokeh) {
        tl.to(bokeh, { opacity: 0.7, duration: 0.5, ease: 'power2.out' }, at);
        tl.to(bokeh, { opacity: 0, duration: 0.6, ease: 'power2.in' }, at + 1.5);
      }
    },
    'mesh-edge-softness'(tl, at) {
      tl.to('#fx-tilt-shift-top', { opacity: 0.5, duration: 0.45, ease: 'power2.out' }, at);
      tl.to('#fx-tilt-shift-bot', { opacity: 0.4, duration: 0.45, ease: 'power2.out' }, at + 0.05);
    },
    'mesh-camera-dolly'(tl, at) {
      tl.fromTo('#fx-bg-wrap', { scale: 1.0 }, { scale: 1.07, duration: 2.5, ease: 'power1.inOut' }, at);
      tl.fromTo('#fx-content', { scale: 0.98 }, { scale: 1, duration: 2.0, ease: 'power1.inOut' }, at);
    },
    'mesh-rack-focus'(tl, at) {
      tl.fromTo('#fx-bg-wrap', { filter: 'blur(8px) brightness(0.85)' },
        { filter: 'blur(0px) brightness(1)', duration: 0.6, ease: 'power2.out' }, at);
      tl.fromTo('#fx-logo', { filter: 'blur(4px)' }, { filter: 'blur(0px)', duration: 0.35, ease: 'power3.out' }, at + 0.2);
      tl.fromTo('#fx-cta', { opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power3.out' }, at + 0.5);
    },
    'mesh-pulse-wave'(tl, at) {
      initMeshRipple();
      tl.to('#fx-mesh-ripple', { opacity: 0.7, duration: 0.3 }, at);
      tl.from('.amd-ripple-ring', { attr: { r: 10 }, opacity: 0.9, duration: 0.6, stagger: 0.18, ease: 'power2.out' }, at);
      tl.to('.amd-ripple-ring', { opacity: 0, duration: 0.4, stagger: 0.15 }, at + 0.8);
      tl.to('#fx-mesh-ripple', { opacity: 0, duration: 0.3 }, at + 1.3);
    },
  };

  /* ═══ Register ═══ */

  Object.assign(V2.Effects, Effects);
  Object.assign(V2.SOLO_PREPARE, SOLO_PREPARE);
  Object.assign(V2.resetV2, AMD_RESET);

  function initAMDLayers() {
    /* nothing needed up-front — init functions called on SOLO_PREPARE */
  }

  const baseInit = V2.initLayers;
  V2.initLayers = function initAMDAll() {
    if (baseInit) baseInit();
    initAMDLayers();
  };

})(typeof window !== 'undefined' ? window : global);
