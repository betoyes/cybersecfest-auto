'use strict';

const { escHtml } = require('./escape.js');

const FONT_FACES = `
      @font-face {
        font-family: 'Ubuntu';
        font-style: normal;
        font-weight: 700;
        src: url('assets/fonts/Ubuntu-Bold.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 400;
        src: url('assets/fonts/Montserrat-Regular.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 600;
        src: url('assets/fonts/Montserrat-SemiBold.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Montserrat';
        font-style: normal;
        font-weight: 700;
        src: url('assets/fonts/Montserrat-Bold.woff2') format('woff2');
      }`;

const BASE_CSS = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        width: 1080px; height: 1350px; overflow: hidden;
        background: #02050A; font-family: 'Montserrat', sans-serif; color: #F6F8FF;
      }
      #root { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: #02050A; }
      .scene { position: absolute; inset: 0; overflow: hidden; }
      .bg-img {
        position: absolute; inset: -8%; width: 116%; height: 116%;
        object-fit: cover; object-position: 62% 50%; transform-origin: 62% 50%;
      }
      .overlay {
        position: absolute; inset: 0; z-index: 2;
        /* Esquerda 100% sólida para cobrir texto baked no thumb.png;
           transição suave entre 55% e 78% para revelar o personagem à direita */
        background: linear-gradient(to right, #02050a 0%, #02050a 55%, rgba(2,5,10,0.18) 78%, rgba(2,5,10,0) 100%),
          linear-gradient(to top, rgba(2,5,10,0.75) 0%, rgba(2,5,10,0) 35%);
      }
      .grain {
        position: absolute; inset: 0; z-index: 8; opacity: 0.04; pointer-events: none;
        mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      }
      .panel {
        position: absolute; inset: 0; z-index: 5;
        display: flex; flex-direction: column; justify-content: space-between;
        padding: 64px 60px 52px 68px;
      }
      .top { display: flex; flex-direction: column; }
      .logo { height: 128px; width: auto; max-width: 440px; object-fit: contain; object-position: left center; margin-bottom: 32px; }
      .label { font-size: 18px; letter-spacing: 0.25em; color: #14A8F4; text-transform: uppercase; margin-bottom: 28px; font-weight: 700; }
      .center { flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 58%; padding: 20px 0; }
      .headline {
        font-family: 'Ubuntu', sans-serif; font-weight: 700; font-size: 58px; line-height: 1.08;
        text-transform: uppercase; color: #F6F8FF; margin-bottom: 32px; letter-spacing: -0.01em;
      }
      .hl-row { display: block; overflow: hidden; }
      .hl-inner { display: inline-block; }
      .blue { color: #14A8F4; }
      .divider { width: 72px; height: 4px; background: linear-gradient(90deg, #14A8F4, transparent); margin-bottom: 26px; transform-origin: left center; }
      .subtitle { font-size: 24px; line-height: 1.65; color: #D5D8ED; max-width: 480px; }
      .bottom { display: flex; flex-direction: column; gap: 24px; max-width: 65%; }
      .cta {
        display: inline-block; width: fit-content;
        background: rgba(20,168,244,0.13); border: 1px solid rgba(20,168,244,0.38);
        color: #14A8F4; font-size: 14px; font-weight: 700; letter-spacing: 0.22em;
        text-transform: uppercase; padding: 10px 24px;
      }
      .eco { display: flex; align-items: center; gap: 32px; padding-top: 20px; border-top: 1px solid rgba(246,248,255,0.1); }
      .eco img { height: 60px; width: auto; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.88; }
      .eco-sep { width: 1px; height: 28px; background: rgba(246,248,255,0.12); }`;

function escRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyBlueWords(text, palavras) {
  let out = escHtml(text);
  for (const w of palavras) {
    if (!w) continue;
    out = out.replace(new RegExp(`(${escRegex(w)})`, 'gi'), '<span class="blue">$1</span>');
  }
  return out;
}

function headlineRows(headline, palavrasAzuis) {
  const words = String(palavrasAzuis || '').split(',').map(s => s.trim()).filter(Boolean);
  const plain = String(headline || '').replace(/<br\s*\/?>/gi, '\n').replace(/\s+/g, ' ').trim();
  const lines = plain.split(/\n|(?<=[.!?])\s+/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    const parts = plain.split(/\s+/);
    const size = Math.max(1, Math.ceil(parts.length / 4));
    const rows = [];
    for (let i = 0; i < parts.length; i += size) {
      rows.push(applyBlueWords(parts.slice(i, i + size).join(' '), words));
    }
    return rows.slice(0, 5);
  }
  return lines.map(l => applyBlueWords(l, words));
}

function rowsHtml(rows) {
  return rows.map((html, i) =>
    `<span class="hl-row"><span class="hl-inner" id="row-${i + 1}">${html}</span></span>`
  ).join('\n              ');
}

function wrapDoc({ title, compositionId, duration, extraCss, bodyInner, timelineJs }) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1350" />
    <title>${escHtml(title)}</title>
    <style>${FONT_FACES}${BASE_CSS}${extraCss || ''}</style>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  </head>
  <body>
    <div id="root" data-composition-id="${compositionId}" data-start="0" data-width="1080" data-height="1350" data-duration="${duration}">
      <section id="scene" class="clip scene" data-start="0" data-duration="${duration}" data-track-index="1">
${bodyInner}
        <div class="grain"></div>
      </section>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${timelineJs}
      window.__timelines['${compositionId}'] = tl;
    </script>
  </body>
</html>
`;
}

function panelBlock(ctx, rows) {
  return `
        <img class="bg-img" id="bg" src="assets/fundo.png" alt="" />
        <div class="overlay" id="overlay"></div>
        <div class="panel">
          <div class="top">
            <img class="logo" id="logo" src="assets/logo-cyberfest.png" alt="CybersecFEST" />
            <div class="label" id="label">${escHtml(ctx.label)}</div>
          </div>
          <div class="center">
            <h1 class="headline">${rowsHtml(rows)}</h1>
            <div class="divider" id="divider"></div>
            <p class="subtitle" id="subtitle">${escHtml(ctx.subtitulo)}</p>
          </div>
          <div class="bottom">
            <div class="cta" id="cta">${escHtml(ctx.cta)}</div>
            <div class="eco" id="eco">
              <img src="assets/logo-devops.webp" alt="" /><div class="eco-sep"></div>
              <img src="assets/logo-iam.webp" alt="" /><div class="eco-sep"></div>
              <img src="assets/logo-alcatraz.webp" alt="" />
            </div>
          </div>
        </div>`;
}

function buildEntrancePremium(ctx) {
  const rows = headlineRows(ctx.headline, ctx.palavrasAzuis);
  const d = 6.5;
  const rowCount = rows.length;
  const tl = [];
  tl.push(`      tl.fromTo('#bg', { scale: 1.18, x: 30, filter: 'brightness(0.55) saturate(0.85)' }, { scale: 1.06, x: 0, filter: 'brightness(1) saturate(1)', duration: ${d}, ease: 'none' }, 0);`);
  tl.push(`      tl.from('#overlay', { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0.1);`);
  tl.push(`      tl.from('#logo', { y: -24, opacity: 0, duration: 0.55, ease: 'power3.out' }, 0.35);`);
  tl.push(`      tl.from('#label', { letterSpacing: '0.45em', opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.55);`);
  let t = 0.85;
  for (let i = 1; i <= rowCount; i++) {
    tl.push(`      tl.from('#row-${i}', { y: '110%', duration: 0.52, ease: 'expo.out' }, ${t.toFixed(2)});`);
    t += 0.22;
  }
  tl.push(`      tl.from('#divider', { scaleX: 0, duration: 0.45, ease: 'power4.inOut' }, ${(t + 0.35).toFixed(2)});`);
  tl.push(`      tl.from('#subtitle', { y: 18, opacity: 0, duration: 0.65, ease: 'power2.out' }, ${(t + 0.55).toFixed(2)});`);
  tl.push(`      tl.from('#cta', { y: 28, opacity: 0, duration: 0.5, ease: 'back.out(1.6)' }, ${(t + 1.2).toFixed(2)});`);
  tl.push(`      tl.from('#eco img', { y: 20, opacity: 0, duration: 0.38, stagger: 0.08, ease: 'power2.out' }, ${(t + 1.55).toFixed(2)});`);
  return {
    preset: 'entrance-premium-6s',
    compositionId: 'entrance-premium-6s',
    duracao_s: d,
    html: wrapDoc({
      title: `CybersecFEST — ${ctx.headline.slice(0, 40)} · Motion`,
      compositionId: 'entrance-premium-6s',
      duration: d,
      bodyInner: panelBlock(ctx, rows),
      timelineJs: tl.join('\n'),
    }),
  };
}

function buildKineticSwipe(ctx) {
  const rows = headlineRows(ctx.headline, ctx.palavrasAzuis);
  const d = 7;
  const extraCss = `
      .accent-line { position: absolute; left: 0; top: 0; width: 4px; height: 100%; background: linear-gradient(180deg, transparent, #14A8F4 30%, #14A8F4 70%, transparent); z-index: 4; transform-origin: top center; }
      .flash { position: absolute; inset: 0; z-index: 11; background: rgba(20,168,244,0.15); opacity: 0; pointer-events: none; }`;
  const bodyInner = `
        <img class="bg-img" id="bg" src="assets/fundo.png" alt="" />
        <div class="overlay" id="overlay"></div>
        <div class="accent-line" id="accent-line"></div>
        <div class="flash" id="flash"></div>
        <div class="panel">
          <div class="top">
            <img class="logo" id="logo" src="assets/logo-cyberfest.png" alt="CybersecFEST" />
            <div class="label" id="label">${escHtml(ctx.label)}</div>
          </div>
          <div class="center">
            <h1 class="headline">${rowsHtml(rows)}</h1>
            <div class="divider" id="divider"></div>
            <p class="subtitle" id="subtitle">${escHtml(ctx.subtitulo)}</p>
          </div>
          <div class="bottom">
            <div class="cta" id="cta">${escHtml(ctx.cta)}</div>
            <div class="eco" id="eco">
              <img src="assets/logo-devops.webp" alt="" /><div class="eco-sep"></div>
              <img src="assets/logo-iam.webp" alt="" /><div class="eco-sep"></div>
              <img src="assets/logo-alcatraz.webp" alt="" />
            </div>
          </div>
        </div>`;
  const tl = [];
  tl.push(`      tl.fromTo('#bg', { scale: 1.25, x: -40, filter: 'brightness(0.5)' }, { scale: 1.08, x: 20, filter: 'brightness(1)', duration: ${d}, ease: 'none' }, 0);`);
  tl.push(`      tl.from('#accent-line', { scaleY: 0, duration: 0.7, ease: 'expo.inOut' }, 0.2);`);
  tl.push(`      tl.to('#flash', { opacity: 0.5, duration: 0.05 }, 0.45);`);
  tl.push(`      tl.to('#flash', { opacity: 0, duration: 0.3 }, 0.5);`);
  let t = 0.55;
  rows.forEach((_, i) => {
    tl.push(`      tl.from('#row-${i + 1}', { x: '-110%', opacity: 0, duration: 0.48, ease: 'power4.out' }, ${t.toFixed(2)});`);
    t += 0.18;
  });
  tl.push(`      tl.from('#divider', { scaleX: 0, duration: 0.4, ease: 'power3.inOut' }, ${t.toFixed(2)});`);
  tl.push(`      tl.from('#subtitle', { x: 40, opacity: 0, duration: 0.55, ease: 'power2.out' }, ${(t + 0.2).toFixed(2)});`);
  tl.push(`      tl.from('#cta', { scale: 0.85, opacity: 0, duration: 0.45, ease: 'back.out(2)' }, ${(t + 0.75).toFixed(2)});`);
  tl.push(`      tl.from('#eco img', { opacity: 0, duration: 0.35, stagger: 0.07, ease: 'power2.out' }, ${(t + 1.05).toFixed(2)});`);
  return {
    preset: 'kinetic-swipe-7s',
    compositionId: 'kinetic-swipe-7s',
    duracao_s: d,
    html: wrapDoc({
      title: `CybersecFEST — Kinetic Swipe · Motion`,
      compositionId: 'kinetic-swipe-7s',
      duration: d,
      extraCss,
      bodyInner,
      timelineJs: tl.join('\n'),
    }),
  };
}

function buildConfrariaLite(ctx) {
  const rows = headlineRows(ctx.headline, ctx.palavrasAzuis);
  const d = 8;
  const extraCss = `
      .orb { position: absolute; width: 520px; height: 520px; border-radius: 50%; background: radial-gradient(circle, rgba(20,168,244,0.12) 0%, transparent 70%); z-index: 1; left: -80px; top: 260px; }
      .hud { position: absolute; inset: 48px; z-index: 4; pointer-events: none; }
      .hud-corner { position: absolute; width: 28px; height: 28px; border: 1px solid rgba(20,168,244,0.35); }
      .hud-tl { top: 0; left: 0; border-right: none; border-bottom: none; }
      .hud-tr { top: 0; right: 0; border-left: none; border-bottom: none; }
      .hud-bl { bottom: 0; left: 0; border-right: none; border-top: none; }
      .hud-br { bottom: 0; right: 0; border-left: none; border-top: none; }`;
  const bodyInner = `
        <img class="bg-img" id="bg" src="assets/fundo.png" alt="" />
        <div class="overlay" id="overlay"></div>
        <div class="orb" id="orb"></div>
        <div class="hud">
          <div class="hud-corner hud-tl" id="hud-tl"></div>
          <div class="hud-corner hud-tr" id="hud-tr"></div>
          <div class="hud-corner hud-bl" id="hud-bl"></div>
          <div class="hud-corner hud-br" id="hud-br"></div>
        </div>
        <div class="panel">
          <div class="top">
            <img class="logo" id="logo" src="assets/logo-cyberfest.png" alt="CybersecFEST" />
            <div class="label" id="label">${escHtml(ctx.label)}</div>
          </div>
          <div class="center">
            <h1 class="headline">${rowsHtml(rows)}</h1>
            <div class="divider" id="divider"></div>
            <p class="subtitle" id="subtitle">${escHtml(ctx.subtitulo)}</p>
          </div>
          <div class="bottom">
            <div class="cta" id="cta">${escHtml(ctx.cta)}</div>
            <div class="eco" id="eco">
              <img src="assets/logo-devops.webp" alt="" /><div class="eco-sep"></div>
              <img src="assets/logo-iam.webp" alt="" /><div class="eco-sep"></div>
              <img src="assets/logo-alcatraz.webp" alt="" />
            </div>
          </div>
        </div>`;
  const tl = [];
  tl.push(`      tl.fromTo('#bg', { scale: 1.2, filter: 'brightness(0.45)' }, { scale: 1.05, filter: 'brightness(1)', duration: ${d}, ease: 'none' }, 0);`);
  ['#hud-tl', '#hud-tr', '#hud-bl', '#hud-br'].forEach((sel, i) => {
    tl.push(`      tl.from('${sel}', { scale: 0.5, opacity: 0, duration: 0.4, ease: 'back.out(2)' }, ${(0.3 + i * 0.08).toFixed(2)});`);
  });
  tl.push(`      tl.fromTo('#orb', { opacity: 0.3, scale: 0.9 }, { opacity: 0.9, scale: 1.05, duration: 5, ease: 'sine.inOut' }, 0.5);`);
  tl.push(`      tl.from('#logo', { opacity: 0, y: -20, duration: 0.5, ease: 'power3.out' }, 0.65);`);
  let t = 1.0;
  rows.forEach((_, i) => {
    tl.push(`      tl.from('#row-${i + 1}', { y: '100%', rotationX: -40, opacity: 0, duration: 0.55, ease: 'expo.out' }, ${t.toFixed(2)});`);
    t += 0.28;
  });
  tl.push(`      tl.from('#divider', { scaleX: 0, duration: 0.5, ease: 'power4.inOut' }, ${t.toFixed(2)});`);
  tl.push(`      tl.from('#subtitle', { clipPath: 'inset(0 100% 0 0)', duration: 0.75, ease: 'power2.inOut' }, ${(t + 0.25).toFixed(2)});`);
  tl.push(`      tl.from('#cta', { y: 24, opacity: 0, duration: 0.5, ease: 'expo.out' }, ${(t + 0.9).toFixed(2)});`);
  tl.push(`      tl.from('#eco img', { y: 16, opacity: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, ${(t + 1.25).toFixed(2)});`);
  return {
    preset: 'confraria-lite-8s',
    compositionId: 'confraria-lite-8s',
    duracao_s: d,
    html: wrapDoc({
      title: `CybersecFEST — Confraria Lite · Motion`,
      compositionId: 'confraria-lite-8s',
      duration: d,
      extraCss,
      bodyInner,
      timelineJs: tl.join('\n'),
    }),
  };
}

const PRESETS = {
  'entrance-premium-6s': buildEntrancePremium,
  'kinetic-swipe-7s': buildKineticSwipe,
  'confraria-lite-8s': buildConfrariaLite,
};

const PRESET_CATALOG = [
  {
    id: 'entrance-premium-6s',
    nome: 'Entrada premium',
    label: 'entrada',
    duracao_s: 6.5,
    descricao: 'Ken Burns suave no fundo, headline sobe em stagger, CTA com bounce.',
    auto: true,
  },
  {
    id: 'kinetic-swipe-7s',
    nome: 'Kinetic swipe',
    label: 'swipe',
    duracao_s: 7,
    descricao: 'Headline entra pela esquerda, flash azul e linha lateral.',
    auto: true,
  },
  {
    id: 'confraria-lite-8s',
    nome: 'Confraria HUD',
    label: 'hud',
    duracao_s: 8,
    descricao: 'Cantos HUD, orb atmosférico e headline com rotação 3D leve.',
    auto: true,
  },
  {
    id: 'confraria-signal',
    nome: 'Confraria Signal',
    label: 'signal',
    duracao_s: 9,
    descricao: 'Grid, scan HUD, parallax duplo e CTA com shine — preset premium manual.',
    auto: false,
  },
];

const PRESET_IDS = Object.keys(PRESETS);

function getPresetMeta(id) {
  return PRESET_CATALOG.find(p => p.id === id) || null;
}

function listPresets(usedPresets = []) {
  const used = new Set((usedPresets || []).filter(Boolean));
  return PRESET_CATALOG.map(p => ({
    ...p,
    used: used.has(p.id),
  }));
}

function resolvePresetId(requested, usedPresets) {
  if (requested && PRESETS[requested]) return requested;
  return pickSurpresaPreset(usedPresets);
}

function pickSurpresaPreset(usedPresets) {
  const used = new Set((usedPresets || []).filter(Boolean));
  const available = PRESET_IDS.filter(id => !used.has(id));
  const pool = available.length ? available : PRESET_IDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildFromPreset(presetId, ctx) {
  const fn = PRESETS[presetId];
  if (!fn) throw new Error('Preset desconhecido: ' + presetId);
  return fn(ctx);
}

function arteToContext(arte) {
  const tipo = arte.tipo || 'blog';
  const labels = {
    patrocinador: 'Patrocínio · 2026',
    evento: 'Evento · 2026',
    blog: 'CybersecFEST · Confraria',
  };
  const ctas = {
    patrocinador: 'Seja patrocinador 2026',
    evento: arte.cta_visual || 'Garanta sua vaga',
    blog: arte.cta_visual || 'Inscrições abertas',
  };
  return {
    headline: arte.headline || '',
    palavrasAzuis: arte.palavras_azuis || '',
    subtitulo: arte.subtitulo || '',
    label: labels[tipo] || labels.blog,
    cta: ctas[tipo] || ctas.blog,
    tipo,
    layout: arte.layout || 'C',
  };
}

function applyAjustesHtml(html, instrucoes) {
  let out = html;
  const t = String(instrucoes || '').toLowerCase();
  let factor = 1;
  if (/lent|devagar|slow|mais tempo/.test(t)) factor = 1.32;
  if (/rápid|rapido|fast|aceler/.test(t)) factor = 0.74;
  if (factor !== 1) {
    out = out.replace(/duration:\s*([\d.]+)/g, (_, n) => {
      const v = Math.min(12, parseFloat(n) * factor);
      return `duration: ${v.toFixed(2)}`;
    });
  }
  if (/menos glitch|sem glitch|remove glitch/.test(t)) {
    out = out.replace(/^\s*tl\.[^\n]*flash[^\n]*\n/gm, '');
    out = out.replace(/<div class="flash"[^>]*><\/div>\s*/g, '');
  }
  if (/cta.*antes|antes.*cta|cta cedo/.test(t)) {
    out = out.replace(/(tl\.from\('#cta',[^)]+\)),\s*([\d.]+)\)/g, (m, a, time) => {
      const nt = Math.max(0.5, parseFloat(time) - 0.8);
      return `${a}, ${nt.toFixed(2)})`;
    });
  }
  if (/headline.*lent|texto.*lent|titulo.*lent/.test(t)) {
    out = out.replace(/(tl\.from\('#row-\d+',[^)]+\)),\s*([\d.]+)\)/g, (m, a, time) => {
      const nt = parseFloat(time) * 1.25;
      return `${a}, ${nt.toFixed(2)})`;
    });
  }
  if (/mais zoom|ken burns/.test(t)) {
    out = out.replace(/scale: 1\.(\d+)/g, (m, d) => `scale: 1.${Math.min(9, parseInt(d, 10) + 2)}`);
  }
  return out;
}

module.exports = {
  PRESET_IDS,
  PRESET_CATALOG,
  pickSurpresaPreset,
  buildFromPreset,
  arteToContext,
  applyAjustesHtml,
  headlineRows,
  listPresets,
  getPresetMeta,
  resolvePresetId,
};
