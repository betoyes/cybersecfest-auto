// HTML layout templates A–N — cybersecfest-auto
// Each function returns a complete arte.html string
'use strict';

const BASE_ASSETS = 'https://raw.githubusercontent.com/betoyes/cybersecfest-auto/main/assets';

// Wrap palavras_azuis in blue spans
function hi(text, words) {
  if (!words || !text) return text || '';
  const list = words.split(',').map(w => w.trim()).filter(Boolean);
  let r = text;
  for (const w of list) {
    const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
    r = r.replace(re, '<span style="color:#14A8F4">$1</span>');
  }
  return r;
}

const LOGO = `<img src="${BASE_ASSETS}/logo-cyberfest.png" style="display:block;">`;

function ecosystem(pos = 'left', bottom = 22, left = 42) {
  const style = pos === 'center'
    ? `left:50%;transform:translateX(-50%);justify-content:center;`
    : `left:${left}px;`;
  return `
<div style="position:absolute;bottom:${bottom}px;${style}display:flex;align-items:center;gap:12px;">
  <img src="${BASE_ASSETS}/logo-devops.webp" style="height:33px;filter:brightness(0) invert(1);">
  <img src="${BASE_ASSETS}/logo-iam.webp"    style="height:33px;filter:brightness(0) invert(1);">
  <img src="${BASE_ASSETS}/logo-alcatraz.webp" style="height:33px;filter:brightness(0) invert(1);">
</div>`;
}

function wrap(css, inner) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@700&family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;}
.canvas{position:relative;width:540px;height:675px;background:#02050A;overflow:hidden;}
${css}
</style>
</head>
<body><div class="canvas">${inner}</div></body>
</html>`;
}

function img64(b64) {
  return `<img src="data:image/png;base64,${b64}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">`;
}

// ── Layout C — Subtítulo ao Lado (blog) ──────────────────────────
function C({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:right;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to right,rgba(2,5,10,.97) 0%,rgba(2,5,10,.15) 100%);}
.ct{position:absolute;top:0;left:0;width:52%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:40px 32px;}
.lg{width:140px;margin-bottom:28px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:32px;line-height:1.18;color:#F6F8FF;}
.sb{margin-top:16px;border-left:2px solid #14A8F4;padding-left:12px;font-family:'Montserrat',sans-serif;font-size:13.5px;color:#D5D8ED;line-height:1.4;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="ct">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>
${ecosystem('left',22,42)}`);
}

// ── Layout M — Pull Quote (blog) ──────────────────────────────────
function M({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(2,5,10,.88);}
.gr{position:absolute;bottom:0;left:0;width:100%;height:40%;background:linear-gradient(to top,rgba(2,5,10,.95),transparent);}
.ct{position:absolute;bottom:80px;left:0;right:0;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 40px;}
.lg{width:120px;margin-bottom:20px;}
.bar{width:48px;height:4px;background:#14A8F4;margin-bottom:16px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:38px;line-height:1.1;color:#F6F8FF;max-width:80%;}
.sb{margin-top:12px;font-family:'Montserrat',sans-serif;font-size:14px;color:#D5D8ED;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="gr"></div>
<div class="ct">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  <div class="bar"></div>
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>
${ecosystem('center',22)}`);
}

// ── Layout N — Acento Diagonal (blog) ────────────────────────────
function N({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:top right;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(160deg,rgba(2,5,10,.05) 0%,rgba(2,5,10,.65) 45%,rgba(2,5,10,.97) 100%);}
.db{position:absolute;width:3px;height:180px;background:#14A8F4;top:40%;left:36px;transform:rotate(-15deg);}
.ct{position:absolute;bottom:0;left:0;padding:0 42px 80px;}
.lg{width:110px;margin-bottom:20px;display:block;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:30px;line-height:1.2;color:#F6F8FF;max-width:60%;}
.sb{margin-top:10px;font-family:'Montserrat',sans-serif;font-size:12.5px;color:#94A0B8;border-bottom:1px solid #14A8F4;padding-bottom:8px;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="db"></div>
<div class="ct">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>
${ecosystem('left',22,42)}`);
}

// ── Layout E — CTA Pill (evento) ─────────────────────────────────
function E({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;right:0;width:55%;height:100%;object-fit:cover;object-position:right;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to right,rgba(2,5,10,.96) 0%,rgba(2,5,10,.10) 65%);}
.ct{position:absolute;top:0;left:0;width:50%;height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:40px 36px;}
.lg{width:130px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:28px;line-height:1.2;color:#F6F8FF;}
.pill{display:inline-block;background:#14A8F4;color:#02050A;font-weight:700;font-family:'Montserrat',sans-serif;font-size:13px;padding:8px 20px;border-radius:24px;margin-top:16px;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="ct">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  <div>
    <div class="hl">${hi(hl,pa)}</div>
    <div class="pill">${sub||'Garanta seu acesso'}</div>
  </div>
  <div></div>
</div>
${ecosystem('left',22,36)}`);
}

// ── Layout L — L Invertido + Traços (evento) ─────────────────────
function L({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(2,5,10,.82);}
.hb{position:absolute;top:38%;left:0;width:100%;height:3px;background:#14A8F4;}
.vb{position:absolute;top:0;left:44px;width:3px;height:38%;background:#14A8F4;}
.tc{position:absolute;top:0;left:0;height:38%;display:flex;align-items:center;padding-left:60px;}
.lg{width:110px;}
.bc{position:absolute;top:38%;left:0;right:0;padding:20px 44px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:34px;line-height:1.1;color:#F6F8FF;margin-top:10px;}
.sb{margin-top:12px;font-family:'Montserrat',sans-serif;font-size:13px;color:#D5D8ED;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="hb"></div>
<div class="vb"></div>
<div class="tc"><img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png"></div>
<div class="bc">
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>
${ecosystem('left',20,44)}`);
}

// ── Layout J — 3 Blocos (evento/cidade) ──────────────────────────
function J({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(2,5,10,.80);}
.tb{position:absolute;top:0;left:0;width:100%;height:30%;background:rgba(2,5,10,.95);display:flex;align-items:center;padding:0 40px;}
.lg{width:120px;}
.bb{position:absolute;bottom:0;left:0;width:100%;height:30%;background:rgba(2,5,10,.95);display:flex;flex-direction:column;justify-content:center;padding:0 40px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:28px;line-height:1.2;color:#F6F8FF;}
.sb{margin-top:8px;font-family:'Montserrat',sans-serif;font-size:12px;color:#D5D8ED;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="tb"><img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png"></div>
<div class="bb">
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>
${ecosystem('left',8,40)}`);
}

// ── Layout D — Diagonal (palestrante) ────────────────────────────
function D({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa, nomePalestrante: np, cargoEmpresa: ce }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:70% center;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(125deg,rgba(2,5,10,.98) 0%,rgba(2,5,10,.80) 45%,rgba(2,5,10,.05) 100%);}
.dl{position:absolute;top:33%;left:0;width:100%;height:1px;background:#14A8F4;opacity:.4;transform:rotate(-12deg);}
.ct{position:absolute;top:0;left:0;width:55%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:40px;}
.lg{width:110px;margin-bottom:20px;}
.sp{font-family:'Montserrat',sans-serif;font-weight:600;font-size:12px;color:#14A8F4;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:30px;line-height:1.2;color:#F6F8FF;}
.cg{margin-top:10px;font-family:'Montserrat',sans-serif;font-size:11px;color:#94A0B8;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="dl"></div>
<div class="ct">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  ${np?`<div class="sp">${np}</div>`:''}
  <div class="hl">${hi(hl,pa)}</div>
  ${ce?`<div class="cg">${ce}</div>`:sub?`<div class="cg">${sub}</div>`:''}
</div>
${ecosystem('left',22,40)}`);
}

// ── Layout G — Magazine Cover (palestrante) ───────────────────────
function G({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa, nomePalestrante: np }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom,rgba(2,5,10,.85) 0%,rgba(2,5,10,.2) 40%,rgba(2,5,10,.9) 100%);}
.tc{position:absolute;top:30px;left:0;right:0;display:flex;justify-content:center;}
.lg{width:120px;}
.bc{position:absolute;bottom:80px;left:0;right:0;text-align:center;padding:0 40px;}
.sp{font-family:'Montserrat',sans-serif;font-weight:600;font-size:11px;color:#14A8F4;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:32px;line-height:1.15;color:#F6F8FF;}
.sb{margin-top:10px;font-family:'Montserrat',sans-serif;font-size:13px;color:#D5D8ED;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="tc"><img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png"></div>
<div class="bc">
  ${np?`<div class="sp">${np}</div>`:''}
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>
${ecosystem('center',22)}`);
}

// ── Layout K — Tríptico (palestrante) ────────────────────────────
function K({ imageBase64: b, headline: hl, palavrasAzuis: pa, nomePalestrante: np, cargoEmpresa: ce }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;object-position:center;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(2,5,10,.78);}
.v1{position:absolute;top:0;left:33%;width:2px;height:100%;background:#14A8F4;opacity:.5;}
.v2{position:absolute;top:0;left:66%;width:2px;height:100%;background:#14A8F4;opacity:.5;}
.ct{position:absolute;top:0;left:0;width:33%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:24px 20px;}
.lg{width:90px;margin-bottom:16px;}
.sp{font-family:'Montserrat',sans-serif;font-weight:600;font-size:10px;color:#14A8F4;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:22px;line-height:1.2;color:#F6F8FF;}
.cg{margin-top:8px;font-family:'Montserrat',sans-serif;font-size:10px;color:#94A0B8;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="v1"></div>
<div class="v2"></div>
<div class="ct">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  ${np?`<div class="sp">${np}</div>`:''}
  <div class="hl">${hi(hl,pa)}</div>
  ${ce?`<div class="cg">${ce}</div>`:''}
</div>
${ecosystem('left',22,20)}`);
}

// ── Layout F — Coluna Lateral Sólida (patrocinador) ───────────────
function F({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;left:38%;width:62%;height:100%;object-fit:cover;object-position:center;}
.lc{position:absolute;top:0;left:0;width:38%;height:100%;background:#14A8F4;display:flex;flex-direction:column;justify-content:center;padding:30px 24px;}
.lg{width:120px;filter:brightness(0);}
.hl{margin-top:20px;font-family:'Ubuntu',sans-serif;font-weight:700;font-size:26px;line-height:1.2;color:#02050A;}
.sb{margin-top:12px;font-family:'Montserrat',sans-serif;font-size:11px;color:#02050A;opacity:.8;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="lc">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>
${ecosystem('left',22,42)}`);
}

// ── Layout I — Coluna Sólida Direita (patrocinador) ───────────────
function I({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:62%;height:100%;object-fit:cover;object-position:center;}
.rc{position:absolute;top:0;right:0;width:38%;height:100%;background:#14A8F4;display:flex;flex-direction:column;justify-content:center;padding:30px 24px;}
.lg{width:110px;filter:brightness(0);}
.hl{margin-top:20px;font-family:'Ubuntu',sans-serif;font-weight:700;font-size:24px;line-height:1.2;color:#02050A;}
.sb{margin-top:12px;font-family:'Montserrat',sans-serif;font-size:11px;color:#02050A;opacity:.8;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="rc">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>
${ecosystem('left',22,20)}`);
}

// ── Layout B — Mirror Split (patrocinador) ────────────────────────
function B({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;right:0;width:55%;height:100%;object-fit:cover;object-position:left;}
.ov{position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(to right,rgba(2,5,10,.98) 40%,rgba(2,5,10,.1) 100%);}
.ct{position:absolute;top:0;left:0;width:52%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:40px 36px;}
.lg{width:120px;margin-bottom:24px;}
.ac{width:40px;height:3px;background:#14A8F4;margin-bottom:16px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:28px;line-height:1.2;color:#F6F8FF;}
.sb{margin-top:14px;font-family:'Montserrat',sans-serif;font-size:12px;color:#D5D8ED;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="ov"></div>
<div class="ct">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  <div class="ac"></div>
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>
${ecosystem('left',22,36)}`);
}

// ── Layout A — Banda Superior (cidade) ───────────────────────────
function A({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;bottom:0;left:0;width:100%;height:65%;object-fit:cover;}
.tb{position:absolute;top:0;left:0;width:100%;height:35%;background:#02050A;border-bottom:3px solid #14A8F4;display:flex;align-items:center;padding:0 40px;gap:24px;}
.lg{width:130px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:28px;line-height:1.2;color:#F6F8FF;}
.sb{position:absolute;bottom:80px;left:40px;font-family:'Montserrat',sans-serif;font-size:14px;color:#D5D8ED;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="tb">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  <div class="hl">${hi(hl,pa)}</div>
</div>
${sub?`<div class="sb">${sub}</div>`:''}
${ecosystem('left',20,40)}`);
}

// ── Layout H — Rodapé Luminoso (cidade) ──────────────────────────
function H({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg{position:absolute;top:0;left:0;width:100%;height:72%;object-fit:cover;object-position:center top;}
.bb{position:absolute;bottom:0;left:0;width:100%;height:32%;background:#02050A;border-top:3px solid #14A8F4;display:flex;flex-direction:column;justify-content:center;padding:0 40px;}
.lg{width:100px;margin-bottom:8px;}
.hl{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:26px;line-height:1.2;color:#F6F8FF;}
.sb{margin-top:6px;font-family:'Montserrat',sans-serif;font-size:12px;color:#D5D8ED;}
`, `
<img class="bg" src="data:image/png;base64,${b}">
<div class="bb">
  <img class="lg" src="${BASE_ASSETS}/logo-cyberfest.png">
  <div class="hl">${hi(hl,pa)}</div>
  ${sub?`<div class="sb">${sub}</div>`:''}
</div>`);
}

// ── Registry ─────────────────────────────────────────────────────
const LAYOUTS = { A, B, C, D, E, F, G, H, I, J, K, L, M, N };

function renderLayout(letter, params) {
  const fn = LAYOUTS[letter.toUpperCase()];
  if (!fn) throw new Error(`Layout "${letter}" não encontrado. Disponíveis: ${Object.keys(LAYOUTS).join(',')}`);
  return fn(params);
}

module.exports = { renderLayout };
