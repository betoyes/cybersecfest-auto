// HTML layout templates A–Q — cybersecfest-auto
// Alinhados à biblioteca de referência (layout-A.html … layout-N.html)
'use strict';

const { assetDataUri } = require('./embed-assets.js');
const { CTA_PILL_CSS, ctaPillBlock, ctaPillOptional } = require('./cta-pill.js');
const {
  normalizePalavrasAzuis,
  enforceHeadlineText,
  prepareHeadlineForLayout,
} = require('./headline-rules.js');

function hi(text, words) {
  if (!words || !text) return text || '';
  const list = words.split(',').map(w => w.trim()).filter(Boolean);
  let r = text;
  for (const w of list) {
    const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    r = r.replace(re, '<span style="color:#14A8F4">$1</span>');
  }
  return r;
}

const LOGO_SRC = () => assetDataUri('logo-cyberfest.png');

const SHARED = `
.headline{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:29px;line-height:1.08;text-transform:uppercase;color:#F6F8FF;letter-spacing:-0.01em;}
.subtitle{font-family:'Montserrat',sans-serif;font-weight:400;font-style:normal;font-size:12px;line-height:1.65;color:#D5D8ED;letter-spacing:0.01em;}
.dh{width:36px;height:2px;background:linear-gradient(90deg,#14A8F4,transparent);}
.lg,.logo-img{height:64px;width:auto;max-width:220px;display:block;object-fit:contain;}
.eco-img{height:30px;width:auto;object-fit:contain;filter:brightness(0) invert(1);opacity:0.75;max-width:90px;}
.eco-img-sm{height:24px;width:auto;object-fit:contain;filter:brightness(0) invert(1);opacity:0.68;max-width:80px;}
.eco-sep{width:1px;height:22px;background:rgba(246,248,255,0.15);flex-shrink:0;}
.eco-row{display:flex;align-items:center;gap:16px;padding-top:10px;border-top:1px solid rgba(246,248,255,0.1);}
.eco-col{display:flex;flex-direction:column;gap:10px;padding-top:10px;border-top:1px solid rgba(246,248,255,0.1);}
.eco-panel .eco-row{border-top:none;padding-top:0;}
${CTA_PILL_CSS}
`;

function ecoRow(align = 'flex-start') {
  const devops = assetDataUri('logo-devops.webp');
  const iam    = assetDataUri('logo-iam.webp');
  const alca   = assetDataUri('logo-alcatraz.webp');
  return `<div id="el-eco" class="eco-row" style="justify-content:${align}">
  <img class="eco-img" src="${devops}" alt="">
  <div class="eco-sep"></div>
  <img class="eco-img" src="${iam}" alt="">
  <div class="eco-sep"></div>
  <img class="eco-img" src="${alca}" alt="">
</div>`;
}

function ecoColSm() {
  const devops = assetDataUri('logo-devops.webp');
  const iam    = assetDataUri('logo-iam.webp');
  const alca   = assetDataUri('logo-alcatraz.webp');
  return `<div id="el-eco" class="eco-col">
  <img class="eco-img-sm" src="${devops}" alt="">
  <img class="eco-img-sm" src="${iam}" alt="">
  <img class="eco-img-sm" src="${alca}" alt="">
</div>`;
}

function ecoInPanel(mode = 'row') {
  const devops = assetDataUri('logo-devops.webp');
  const iam    = assetDataUri('logo-iam.webp');
  const alca   = assetDataUri('logo-alcatraz.webp');
  if (mode === 'col') {
    return `<div id="el-eco" class="eco-panel eco-col">
      <img class="eco-img-sm" src="${devops}" alt="">
      <img class="eco-img-sm" src="${iam}" alt="">
      <img class="eco-img-sm" src="${alca}" alt="">
    </div>`;
  }
  return `<div id="el-eco" class="eco-panel">
    <div class="eco-row" style="border-top:none;padding-top:0;">
      <img class="eco-img" src="${devops}" alt=""><div class="eco-sep"></div>
      <img class="eco-img" src="${iam}" alt=""><div class="eco-sep"></div>
      <img class="eco-img" src="${alca}" alt="">
    </div>
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
${SHARED}
${css}
</style>
</head>
<body><div class="canvas">${inner}</div></body>
</html>`;
}

// ── A — Banda Superior / Texto Base (padrão oficial — ver layout-padroes.json) ──
function A({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.img-band{position:absolute;top:0;left:0;right:0;height:55%;overflow:hidden;z-index:0;}
.img-band img{width:100%;height:100%;object-fit:cover;object-position:center 25%;}
.img-fade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(2,5,10,0.15) 0%,rgba(2,5,10,0) 35%,rgba(2,5,10,1) 100%);}
.logo-bar{position:absolute;top:24px;right:30px;z-index:3;}
.text-band{position:absolute;left:0;right:0;bottom:0;height:48%;background:#02050A;display:flex;flex-direction:column;justify-content:space-between;padding:20px 30px 26px 34px;z-index:2;}
.headline-a{font-size:31px;}
.subtitle-a{max-width:360px;}
`, `
<div class="img-band">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
  <div class="img-fade"></div>
</div>
<div class="logo-bar"><img class="logo-img lg" id="el-logo" src="${LOGO_SRC()}" alt="CybersecFEST"></div>
<div class="text-band">
  <div>
    <div class="headline headline-a" id="el-title">${hi(hl, pa)}</div>
    <div class="dh" style="margin:12px 0;"></div>
    ${sub ? `<div class="subtitle subtitle-a" id="el-sub">${sub}</div>` : ''}
  </div>
  <div style="display:flex;justify-content:flex-end;">${ecoRow('flex-end')}</div>
</div>`);
}

// ── B — Mirror Split (padrão oficial — ver layout-padroes.json) ─────
function B({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.img-left-b{position:absolute;left:0;top:0;bottom:0;width:260px;overflow:hidden;z-index:1;}
.img-left-b img{width:100%;height:100%;object-fit:cover;object-position:center;}
.img-left-b-fade{position:absolute;inset:0;background:linear-gradient(to right,rgba(2,5,10,0) 45%,rgba(2,5,10,0.7) 75%,rgba(2,5,10,1) 100%),linear-gradient(to top,rgba(2,5,10,0.5) 0%,rgba(2,5,10,0) 28%);}
.divider-v-b{position:absolute;left:259px;top:44px;bottom:44px;width:1px;z-index:3;background:linear-gradient(to bottom,transparent,rgba(20,168,244,0.45) 20%,rgba(20,168,244,0.45) 80%,transparent);}
.right-panel-b{position:absolute;right:0;top:0;bottom:0;width:281px;background:#02050A;display:flex;flex-direction:column;justify-content:space-between;padding:32px 28px 26px 22px;z-index:2;}
.hl-b{font-size:26px;margin-bottom:14px;}
.sb-b{max-width:205px;margin-top:12px;font-size:12px;}
.eco-panel-b{margin-left:-6px;padding-right:2px;}
.eco-panel-b .eco-row{gap:8px;}
.eco-panel-b .eco-img{height:26px;max-width:72px;}
`, `
<div class="img-left-b">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
  <div class="img-left-b-fade"></div>
</div>
<div class="divider-v-b"></div>
<div class="right-panel-b">
  <img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="" style="max-width:160px;">
  <div>
    <div class="headline hl hl-b" id="el-title">${hi(hl, pa)}</div>
    <div class="dh"></div>
    ${sub ? `<div class="subtitle sb sb-b" id="el-sub">${sub}</div>` : ''}
  </div>
  <div id="el-eco" class="eco-panel eco-panel-b">
    <div class="eco-row" style="border-top:none;padding-top:0;">
      <img class="eco-img" src="${assetDataUri('logo-devops.webp')}" alt=""><div class="eco-sep"></div>
      <img class="eco-img" src="${assetDataUri('logo-iam.webp')}" alt=""><div class="eco-sep"></div>
      <img class="eco-img" src="${assetDataUri('logo-alcatraz.webp')}" alt="">
    </div>
  </div>
</div>`);
}

// ── C — Subtítulo ao Lado (padrão oficial — ver layout-padroes.json) ──
function C({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.art-bg-c{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:right center;z-index:0;}
.art-ov-c{position:absolute;inset:0;z-index:1;background:linear-gradient(to right,rgba(2,5,10,0.97) 0%,rgba(2,5,10,0.93) 44%,rgba(2,5,10,0.28) 66%,rgba(2,5,10,0) 100%),linear-gradient(to top,rgba(2,5,10,0.75) 0%,rgba(2,5,10,0) 30%);}
.art-cnt-c{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;padding:32px 30px 26px 34px;}
.inline-row{display:flex;align-items:flex-start;gap:0;}
.headline-c{font-size:29px;max-width:48%;line-height:1.08;flex-shrink:0;}
.vsep-c{width:1px;align-self:stretch;margin:5px 18px;flex-shrink:0;background:linear-gradient(to bottom,rgba(20,168,244,0.7) 0%,rgba(20,168,244,0.2) 100%);}
.sub-c{font-size:11.5px;line-height:1.7;padding-top:5px;word-break:keep-all;}
`, `
<img id="art-bg" class="bg art-bg-c" src="data:image/png;base64,${b}" alt="">
<div id="art-overlay" class="ov art-ov-c"></div>
<div class="art-cnt-c">
  <div><img class="lg" id="el-logo" src="${LOGO_SRC()}" alt=""></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:10px 0;">
    <div class="inline-row">
      <div class="headline headline-c hl" id="el-title">${hi(hl, pa)}</div>
      ${sub ? `<div class="vsep-c"></div><div class="subtitle sub-c sb" id="el-sub">${sub}</div>` : ''}
    </div>
  </div>
  <div style="max-width:65%;">${ecoRow('flex-start')}</div>
</div>`);
}

// ── D — Diagonal (padrão oficial — ver layout-padroes.json) ───────
function D({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa, nomePalestrante: np }) {
  return wrap(`
.art-bg-d{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;z-index:0;}
.art-overlay-d{position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse at center,rgba(2,5,10,0) 20%,rgba(2,5,10,0.25) 55%,rgba(2,5,10,0.92) 100%),linear-gradient(135deg,rgba(2,5,10,0.92) 0%,rgba(2,5,10,0) 40%,rgba(2,5,10,0) 60%,rgba(2,5,10,0.92) 100%);}
.art-content-d{position:absolute;inset:0;z-index:2;padding:32px 30px 26px 34px;}
.top-left{position:absolute;top:32px;left:34px;max-width:52%;}
.logo-d{margin-bottom:14px;}
.headline-d{font-size:28px;line-height:1.1;}
.bottom-right{position:absolute;bottom:26px;right:30px;text-align:right;max-width:52%;}
.subtitle-d{font-size:12px;max-width:240px;margin-left:auto;margin-bottom:14px;}
.divider-d{width:36px;height:2px;background:linear-gradient(90deg,transparent,#14A8F4);margin:0 0 13px auto;}
.sp{font-family:'Montserrat',sans-serif;font-weight:600;font-size:11px;color:#14A8F4;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;}
`, `
<img id="art-bg" class="bg art-bg-d" src="data:image/png;base64,${b}" alt="">
<div id="art-overlay" class="ov art-overlay-d"></div>
<div class="art-content-d">
  <div class="top-left">
    <div class="logo-d"><img class="lg" id="el-logo" src="${LOGO_SRC()}" alt=""></div>
    ${np ? `<div class="sp">${np}</div>` : ''}
    <div class="headline headline-d hl" id="el-title">${hi(hl, pa)}</div>
  </div>
  <div class="bottom-right">
    ${sub ? `<div class="subtitle subtitle-d sb" id="el-sub">${sub}</div>` : ''}
    <div class="divider-d"></div>
    ${ecoRow('flex-end')}
  </div>
</div>`);
}

// ── E — CTA Pill (padrão oficial — ver layout-padroes.json) ───────
function E(params) {
  const { imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa } = params;
  return wrap(`
.art-bg-e{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:right center;z-index:0;}
.art-overlay-e{position:absolute;inset:0;z-index:1;background:linear-gradient(to right,rgba(2,5,10,0.95) 0%,rgba(2,5,10,0.85) 38%,rgba(2,5,10,0.25) 60%,rgba(2,5,10,0) 100%),linear-gradient(to top,rgba(2,5,10,0.75) 0%,rgba(2,5,10,0) 35%);}
.art-content-e{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;padding:32px 30px 26px 34px;}
.center-e{flex:1;display:flex;flex-direction:column;justify-content:center;max-width:56%;padding:12px 0;}
.headline-e{margin-bottom:16px;}
.subtitle-e{max-width:240px;}
.divider-e{margin-bottom:13px;}
.bottom-e{max-width:72%;display:flex;flex-direction:column;gap:10px;}
.bottom-e .cta-pill{margin-top:0;}
`, `
<img id="art-bg" class="bg art-bg-e" src="data:image/png;base64,${b}" alt="">
<div id="art-overlay" class="ov art-overlay-e"></div>
<div class="art-content-e">
  <div><img class="lg" id="el-logo" src="${LOGO_SRC()}" alt=""></div>
  <div class="center-e">
    <div class="headline headline-e hl" id="el-title">${hi(hl, pa)}</div>
    <div class="dh divider-e"></div>
    ${sub ? `<div class="subtitle subtitle-e sb" id="el-sub">${sub}</div>` : ''}
  </div>
  <div class="bottom-e">
    ${ctaPillBlock(params)}
    ${ecoRow('flex-start')}
  </div>
</div>`);
}

// ── F — Painel Lateral Escuro (padrão oficial — ver layout-padroes.json) ──
function F({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.left-col{position:absolute;left:0;top:0;bottom:0;width:220px;background:#02050A;display:flex;flex-direction:column;justify-content:space-between;padding:32px 24px 26px 30px;z-index:2;}
.divider-v{position:absolute;left:220px;top:0;bottom:0;width:1px;z-index:3;background:linear-gradient(to bottom,transparent 0%,rgba(20,168,244,0.5) 15%,rgba(20,168,244,0.5) 85%,transparent 100%);}
.right-img{position:absolute;left:221px;top:0;right:0;bottom:0;z-index:1;}
.right-img>img{width:100%;height:100%;object-fit:cover;object-position:center;}
.right-img-fade{position:absolute;inset:0;background:linear-gradient(to right,rgba(2,5,10,0.55) 0%,rgba(2,5,10,0.1) 25%,rgba(2,5,10,0) 50%);}
.right-img-bottom{position:absolute;bottom:0;left:0;right:0;height:120px;background:linear-gradient(to top,rgba(2,5,10,0.5) 0%,rgba(2,5,10,0) 100%);}
.hl-f{font-size:28px;}
.divider-h{width:28px;height:2px;margin:14px 0;background:linear-gradient(90deg,#14A8F4,transparent);}
.sb-f{font-size:11px;line-height:1.7;}
.eco-panel-f{width:100%;max-width:100%;overflow:visible;}
.eco-panel-f .eco-row{gap:5px;border-top:1px solid rgba(246,248,255,0.1);padding-top:10px;}
.eco-panel-f .eco-img{height:22px;max-width:48px;opacity:0.65;}
.eco-panel-f .eco-sep{height:16px;}
`, `
<div class="left-col">
  <div><img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="" style="max-width:160px;"></div>
  <div>
    <div class="headline hl hl-f" id="el-title">${hi(hl, pa)}</div>
    <div class="divider-h"></div>
    ${sub ? `<div class="subtitle sb sb-f" id="el-sub">${sub}</div>` : ''}
  </div>
  <div id="el-eco" class="eco-panel eco-panel-f">
    <div class="eco-row" style="border-top:none;padding-top:0;">
      <img class="eco-img" src="${assetDataUri('logo-devops.webp')}" alt=""><div class="eco-sep"></div>
      <img class="eco-img" src="${assetDataUri('logo-iam.webp')}" alt=""><div class="eco-sep"></div>
      <img class="eco-img" src="${assetDataUri('logo-alcatraz.webp')}" alt="">
    </div>
  </div>
</div>
<div class="divider-v"></div>
<div class="right-img">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
  <div class="right-img-fade"></div>
  <div class="right-img-bottom"></div>
</div>`);
}

// ── G — Magazine Cover (padrão oficial — ver layout-padroes.json) ─
function G({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa, nomePalestrante: np }) {
  return wrap(`
.art-bg-g{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 20%;z-index:0;}
.art-ov-g{position:absolute;inset:0;z-index:1;background:linear-gradient(to bottom,rgba(2,5,10,0.85) 0%,rgba(2,5,10,0.08) 28%,rgba(2,5,10,0.08) 56%,rgba(2,5,10,0.95) 100%),linear-gradient(to right,rgba(2,5,10,0.55) 0%,rgba(2,5,10,0) 30%,rgba(2,5,10,0) 70%,rgba(2,5,10,0.55) 100%);}
.g-stack{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:30px 34px 26px;text-align:center;}
.g-logo-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;}
.g-logo-line{width:48px;height:1px;background:linear-gradient(90deg,transparent,rgba(20,168,244,0.6),transparent);}
.g-center-line{width:60px;height:1px;background:linear-gradient(90deg,transparent,#14A8F4,transparent);margin:0 auto 14px;}
.sb-g{max-width:300px;text-align:center;}
.eco-g{width:100%;justify-content:center;}
.sp{font-family:'Montserrat',sans-serif;font-weight:600;font-size:11px;color:#14A8F4;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;}
`, `
<img id="art-bg" class="bg art-bg-g" src="data:image/png;base64,${b}" alt="">
<div id="art-overlay" class="ov art-ov-g"></div>
<div class="g-stack">
  <div class="g-logo-wrap">
    <img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="">
    <div class="g-logo-line"></div>
  </div>
  <div>
    ${np ? `<div class="sp">${np}</div>` : ''}
    <div class="headline hl" id="el-title" style="text-align:center;margin-bottom:18px;">${hi(hl, pa)}</div>
    <div class="g-center-line"></div>
    ${sub ? `<div class="subtitle sb sb-g" id="el-sub">${sub}</div>` : ''}
  </div>
  <div class="eco-row eco-g" id="el-eco" style="justify-content:center;width:100%;">
    <img class="eco-img" src="${assetDataUri('logo-devops.webp')}" alt="">
    <div class="eco-sep"></div>
    <img class="eco-img" src="${assetDataUri('logo-iam.webp')}" alt="">
    <div class="eco-sep"></div>
    <img class="eco-img" src="${assetDataUri('logo-alcatraz.webp')}" alt="">
  </div>
</div>`);
}

// ── H — Rodapé Luminoso (padrão oficial — ver layout-padroes.json) ─
function H({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.img-top-h{position:absolute;top:0;left:0;right:0;height:420px;overflow:hidden;z-index:1;}
.img-top-h img{width:100%;height:100%;object-fit:cover;object-position:center 25%;}
.img-top-fade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(2,5,10,0.20) 0%,rgba(2,5,10,0) 25%,rgba(2,5,10,0) 62%,rgba(2,5,10,1) 100%);}
.img-top-fade-top{position:absolute;top:0;left:0;right:0;height:80px;background:linear-gradient(to bottom,rgba(2,5,10,0.55),rgba(2,5,10,0));}
.logo-float-h{position:absolute;top:26px;left:30px;z-index:10;}
.footer-h{position:absolute;bottom:0;left:0;right:0;height:256px;background:#02050A;border-top:1px solid rgba(20,168,244,0.22);display:flex;align-items:stretch;z-index:2;}
.footer-left-h{flex:1;display:flex;flex-direction:column;justify-content:center;padding:22px 22px 24px 30px;border-right:1px solid rgba(20,168,244,0.15);}
.footer-right-h{width:136px;display:flex;flex-direction:column;justify-content:center;padding:20px 22px;gap:12px;}
.tag-h{font-family:'Montserrat',sans-serif;font-size:7px;font-weight:700;letter-spacing:0.28em;color:rgba(20,168,244,0.45);text-transform:uppercase;margin-bottom:4px;}
.sb-h{font-size:11.5px;max-width:270px;}
`, `
<div class="img-top-h">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
  <div class="img-top-fade"></div>
  <div class="img-top-fade-top"></div>
</div>
<div class="logo-float-h"><img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="" style="max-width:200px;"></div>
<div class="footer-h">
  <div class="footer-left-h">
    <div class="headline hl" id="el-title" style="font-size:29px;margin-bottom:12px;">${hi(hl, pa)}</div>
    <div class="dh" style="margin-bottom:11px;"></div>
    ${sub ? `<div class="subtitle sb sb-h" id="el-sub">${sub}</div>` : ''}
  </div>
  <div class="footer-right-h">
    <div class="tag-h">Realização</div>
    ${ecoColSm()}
  </div>
</div>`);
}

// ── I — Painel Direito Escuro ─────────────────────────────────────
function I({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.img-left{position:absolute;left:0;top:0;bottom:0;width:321px;overflow:hidden;z-index:1;}
.img-left img{width:100%;height:100%;object-fit:cover;object-position:center;}
.img-left-fade{position:absolute;inset:0;background:linear-gradient(to right,rgba(2,5,10,0) 50%,rgba(2,5,10,0.6) 80%,rgba(2,5,10,1) 100%),linear-gradient(to top,rgba(2,5,10,0.4) 0%,rgba(2,5,10,0) 25%);}
.dv-i{position:absolute;left:320px;top:0;bottom:0;width:1px;z-index:3;background:linear-gradient(to bottom,transparent 0%,rgba(20,168,244,0.5) 12%,rgba(20,168,244,0.5) 88%,transparent 100%);}
.right-panel{position:absolute;right:0;top:0;bottom:0;width:220px;background:#02050A;display:flex;flex-direction:column;justify-content:space-between;padding:32px 28px 40px 22px;z-index:2;}
.hl-i{font-size:26px;margin-bottom:14px;}
.sb-i{font-size:11px;line-height:1.65;}
.eco-panel-i{padding-top:0;margin-bottom:6px;}
.eco-panel-i.eco-col,.eco-col-i{gap:12px;}
.tag-i{font-family:'Montserrat',sans-serif;font-size:7px;font-weight:700;letter-spacing:0.28em;color:rgba(20,168,244,0.45);text-transform:uppercase;margin-bottom:4px;}
.eco-footer-i{display:flex;flex-direction:column;}
`, `
<div class="img-left">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
  <div class="img-left-fade"></div>
</div>
<div class="dv-i"></div>
<div class="right-panel">
  <div><img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="" style="max-width:160px;"></div>
  <div>
    <div class="headline hl hl-i" id="el-title">${hi(hl, pa)}</div>
    <div class="dh"></div>
    ${sub ? `<div class="subtitle sb sb-i" id="el-sub">${sub}</div>` : ''}
  </div>
  <div class="eco-footer-i">
    <div class="tag-i">Realização</div>
    <div id="el-eco" class="eco-col eco-col-i">
      <img class="eco-img-sm" src="${assetDataUri('logo-devops.webp')}" alt="">
      <img class="eco-img-sm" src="${assetDataUri('logo-iam.webp')}" alt="">
      <img class="eco-img-sm" src="${assetDataUri('logo-alcatraz.webp')}" alt="">
    </div>
  </div>
</div>`);
}

// ── J — 3 Blocos ──────────────────────────────────────────────────
function J(params) {
  const { imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa } = params;
  return wrap(`
.blk-top{position:absolute;top:0;left:0;right:0;height:17%;background:#02050A;display:flex;align-items:center;justify-content:space-between;padding:0 28px 0 30px;border-bottom:1px solid rgba(20,168,244,0.2);z-index:2;}
.tag-j{font-family:'Montserrat',sans-serif;font-size:7px;font-weight:700;letter-spacing:0.3em;color:rgba(20,168,244,0.5);text-transform:uppercase;}
.blk-mid{position:absolute;top:17%;left:0;right:0;height:44%;overflow:hidden;z-index:1;}
.blk-mid img{width:100%;height:100%;object-fit:cover;object-position:center 35%;}
.blk-mid-fade{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(2,5,10,0.45) 0%,rgba(2,5,10,0) 30%,rgba(2,5,10,0) 68%,rgba(2,5,10,0.55) 100%);}
.blk-bot{position:absolute;bottom:0;left:0;right:0;height:41%;background:#02050A;display:flex;flex-direction:column;justify-content:space-between;padding:18px 28px 24px 30px;border-top:1px solid rgba(20,168,244,0.2);z-index:2;}
.sb-j{max-width:320px;font-size:11.5px;}
.lg-j{height:46px;}
`, `
<div class="blk-top">
  <img class="lg lg-j" id="el-logo" src="${LOGO_SRC()}" alt="">
  <div class="tag-j">Cibersegurança · Estratégia · Liderança</div>
</div>
<div class="blk-mid">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
  <div class="blk-mid-fade"></div>
</div>
<div class="blk-bot">
  <div>
    <div class="headline hl" id="el-title" style="font-size:29px;margin-bottom:10px;">${hi(hl, pa)}</div>
    <div class="dh" style="margin-bottom:9px;"></div>
    ${sub ? `<div class="subtitle sb sb-j" id="el-sub">${sub}</div>` : ''}
    ${ctaPillOptional(params)}
  </div>
  ${ecoRow('flex-end')}
</div>`);
}

// ── K — Tríptico ──────────────────────────────────────────────────
function K({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.panel-left-k{position:absolute;left:0;top:0;bottom:0;width:168px;background:#02050A;display:flex;flex-direction:column;justify-content:space-between;padding:28px 18px 26px 24px;z-index:2;}
.div-k1{position:absolute;left:168px;top:0;bottom:0;width:1px;z-index:3;background:linear-gradient(to bottom,transparent,rgba(20,168,244,0.45) 12%,rgba(20,168,244,0.45) 88%,transparent);}
.img-mid-k{position:absolute;left:169px;top:0;bottom:0;width:203px;overflow:hidden;z-index:1;}
.img-mid-k img{width:100%;height:100%;object-fit:cover;object-position:center;}
.img-mid-fade-k{position:absolute;inset:0;background:linear-gradient(to right,rgba(2,5,10,0.55) 0%,rgba(2,5,10,0) 22%,rgba(2,5,10,0) 78%,rgba(2,5,10,0.55) 100%);}
.div-k2{position:absolute;left:372px;top:0;bottom:0;width:1px;z-index:3;background:linear-gradient(to bottom,transparent,rgba(20,168,244,0.45) 12%,rgba(20,168,244,0.45) 88%,transparent);}
.panel-right-k{position:absolute;right:0;top:0;bottom:0;width:167px;background:#02050A;display:flex;flex-direction:column;justify-content:space-between;padding:28px 22px 26px 18px;z-index:2;}
.hl-k{font-size:24px;}
.year-k{font-family:'Montserrat',sans-serif;font-size:7px;font-weight:700;letter-spacing:0.28em;color:rgba(20,168,244,0.45);writing-mode:vertical-rl;}
.sb-k{font-size:10.5px;line-height:1.7;max-width:140px;margin-top:10px;}
.tag-k{font-family:'Montserrat',sans-serif;font-size:7px;font-weight:700;letter-spacing:0.28em;color:rgba(20,168,244,0.45);text-transform:uppercase;margin-bottom:4px;}
.eco-footer-k{display:flex;flex-direction:column;gap:0;}
.eco-col-k{gap:12px;}
`, `
<div class="panel-left-k">
  <img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="" style="max-width:160px;">
  <div class="headline hl hl-k" id="el-title">${hi(hl, pa)}</div>
  <div class="year-k">2025</div>
</div>
<div class="div-k1"></div>
<div class="img-mid-k">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
  <div class="img-mid-fade-k"></div>
</div>
<div class="div-k2"></div>
<div class="panel-right-k">
  <div></div>
  <div>
    <div class="dh"></div>
    ${sub ? `<div class="subtitle sb sb-k" id="el-sub">${sub}</div>` : ''}
  </div>
  <div class="eco-footer-k">
    <div class="tag-k">Realização</div>
    <div id="el-eco" class="eco-col eco-col-k">
      <img class="eco-img-sm" src="${assetDataUri('logo-devops.webp')}" alt="">
      <img class="eco-img-sm" src="${assetDataUri('logo-iam.webp')}" alt="">
      <img class="eco-img-sm" src="${assetDataUri('logo-alcatraz.webp')}" alt="">
    </div>
  </div>
</div>`);
}

// ── L — L Invertido + Traços Diagonais ────────────────────────────
function L(params) {
  const { imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa } = params;
  return wrap(`
.bar-top-l{position:absolute;top:0;left:0;right:0;height:88px;background:#02050A;z-index:5;border-bottom:1px solid rgba(20,168,244,0.2);display:flex;align-items:center;justify-content:space-between;padding:0 28px;}
.lg-l{height:52px;max-width:180px;}
.eco-top-l{display:flex;align-items:center;gap:14px;}
.img-mid-l{position:absolute;top:88px;left:0;right:0;height:342px;overflow:hidden;z-index:1;}
.img-mid-l img{width:100%;height:100%;object-fit:cover;object-position:center;}
.img-mid-fade-l{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(2,5,10,0.35) 0%,rgba(2,5,10,0) 18%,rgba(2,5,10,0) 70%,rgba(2,5,10,0.9) 100%);}
.diag-lines-l{position:absolute;top:88px;left:0;right:0;height:342px;z-index:4;pointer-events:none;overflow:hidden;}
.diag-lines-l svg{width:100%;height:100%;}
.base-l{position:absolute;bottom:0;left:0;right:0;height:245px;background:#02050A;z-index:3;display:flex;flex-direction:column;justify-content:center;padding:24px 30px 28px 34px;}
.sb-l{max-width:340px;}
`, `
<div class="bar-top-l">
  <img class="lg lg-l" id="el-logo" src="${LOGO_SRC()}" alt="">
  <div class="eco-top-l" id="el-eco">
    <img class="eco-img-sm" src="${assetDataUri('logo-devops.webp')}" alt="">
    <div class="eco-sep" style="height:18px;"></div>
    <img class="eco-img-sm" src="${assetDataUri('logo-iam.webp')}" alt="">
    <div class="eco-sep" style="height:18px;"></div>
    <img class="eco-img-sm" src="${assetDataUri('logo-alcatraz.webp')}" alt="">
  </div>
</div>
<div class="img-mid-l">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
  <div class="img-mid-fade-l"></div>
</div>
<div class="diag-lines-l">
  <svg viewBox="0 0 540 342" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <line x1="0" y1="310" x2="540" y2="270" stroke="rgba(20,168,244,0.45)" stroke-width="1"/>
    <line x1="0" y1="326" x2="540" y2="286" stroke="rgba(20,168,244,0.18)" stroke-width="0.7"/>
  </svg>
</div>
<div class="base-l">
  <div class="headline hl" id="el-title" style="font-size:29px;margin-bottom:13px;">${hi(hl, pa)}</div>
  <div class="dh" style="margin-bottom:11px;"></div>
  ${sub ? `<div class="subtitle sb sb-l" id="el-sub">${sub}</div>` : ''}
  ${ctaPillOptional(params)}
</div>`);
}

// ── M — Pull Quote ────────────────────────────────────────────────
function M({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.art-bg-m{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:right center;z-index:0;}
.art-ov-m{position:absolute;inset:0;z-index:1;background:linear-gradient(to right,rgba(2,5,10,0.97) 0%,rgba(2,5,10,0.88) 45%,rgba(2,5,10,0.35) 70%,rgba(2,5,10,0) 100%),linear-gradient(to top,rgba(2,5,10,0.80) 0%,rgba(2,5,10,0) 35%);}
.art-cnt-m{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;justify-content:space-between;padding:32px 30px 26px 34px;}
.quote-open{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:110px;line-height:0.7;color:rgba(20,168,244,0.18);letter-spacing:-4px;margin-bottom:-20px;}
.quote-close{font-family:'Ubuntu',sans-serif;font-weight:700;font-size:55px;line-height:1;color:rgba(20,168,244,0.18);letter-spacing:-2px;text-align:left;max-width:300px;}
.hl-m{font-size:26px;max-width:300px;position:relative;z-index:1;margin-bottom:6px;}
.sb-m{max-width:260px;}
`, `
<img id="art-bg" class="bg art-bg-m" src="data:image/png;base64,${b}" alt="">
<div id="art-overlay" class="ov art-ov-m"></div>
<div class="art-cnt-m">
  <img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="">
  <div>
    <div class="quote-open">"</div>
    <div class="headline hl hl-m" id="el-title">${hi(hl, pa)}</div>
    <div class="quote-close">"</div>
    <div class="dh" style="margin:14px 0 10px;"></div>
    ${sub ? `<div class="subtitle sb sb-m" id="el-sub">${sub}</div>` : ''}
  </div>
  ${ecoRow('flex-start')}
</div>`);
}

// ── N — Acento Diagonal ───────────────────────────────────────────
function N({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.bg-l2{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:right center;z-index:0;}
.ov-l2{position:absolute;inset:0;z-index:1;background:linear-gradient(to right,rgba(2,5,10,0.97) 0%,rgba(2,5,10,0.88) 42%,rgba(2,5,10,0.28) 65%,rgba(2,5,10,0) 100%),linear-gradient(to top,rgba(2,5,10,0.7) 0%,rgba(2,5,10,0) 35%);}
.diag-stripe{position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;}
.diag-stripe svg{width:100%;height:100%;}
.cnt-l2{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;justify-content:space-between;padding:32px 30px 26px 34px;}
.hl-l2{font-size:29px;max-width:56%;margin-bottom:16px;}
.sub-l2{max-width:240px;}
`, `
<img id="art-bg" class="bg bg-l2" src="data:image/png;base64,${b}" alt="">
<div id="art-overlay" class="ov ov-l2"></div>
<div class="diag-stripe">
  <svg viewBox="0 0 540 675" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <polygon points="180,0 220,0 420,675 380,675" fill="rgba(20,168,244,0.07)"/>
    <line x1="180" y1="0" x2="380" y2="675" stroke="rgba(20,168,244,0.35)" stroke-width="1"/>
    <line x1="220" y1="0" x2="420" y2="675" stroke="rgba(20,168,244,0.20)" stroke-width="0.5"/>
  </svg>
</div>
<div class="cnt-l2">
  <div><img class="lg" id="el-logo" src="${LOGO_SRC()}" alt=""></div>
  <div>
    <div class="headline hl hl-l2" id="el-title">${hi(hl, pa)}</div>
    <div class="dh" style="margin-bottom:13px;"></div>
    ${sub ? `<div class="subtitle sb sub-l2" id="el-sub">${sub}</div>` : ''}
  </div>
  ${ecoRow('flex-start')}
</div>`);
}

// ── O — Holofote (radial spotlight, conteúdo centrado) ────────────
function O(params) {
  const { imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa } = params;
  return wrap(`
.art-bg-o{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 65%;z-index:0;}
.art-ov-o{position:absolute;inset:0;z-index:1;background:radial-gradient(ellipse 95% 72% at 50% 68%,rgba(2,5,10,0) 0%,rgba(2,5,10,0.35) 52%,rgba(2,5,10,0.94) 100%),linear-gradient(to top,rgba(2,5,10,0.88) 0%,rgba(2,5,10,0.12) 42%,rgba(2,5,10,0.5) 100%);}
.cnt-o{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;padding:28px 32px 24px;}
.logo-wrap-o{display:flex;flex-direction:column;align-items:center;gap:10px;}
.logo-line-o{width:52px;height:1px;background:linear-gradient(90deg,transparent,#14A8F4,transparent);}
.spot-o{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;text-align:center;width:100%;max-width:92%;padding-bottom:6px;}
.hl-o{font-size:30px;text-align:center;margin-bottom:14px;}
.sb-o{max-width:310px;text-align:center;}
.dh-o{margin:0 auto 12px;}
.eco-o{width:100%;justify-content:center;border-top:1px solid rgba(246,248,255,0.1);padding-top:10px;}
`, `
<img id="art-bg" class="bg art-bg-o" src="data:image/png;base64,${b}" alt="">
<div id="art-overlay" class="ov art-ov-o"></div>
<div class="cnt-o">
  <div class="logo-wrap-o">
    <img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="">
    <div class="logo-line-o"></div>
  </div>
  <div class="spot-o">
    <div class="headline hl hl-o" id="el-title">${hi(hl, pa)}</div>
    <div class="dh dh-o"></div>
    ${sub ? `<div class="subtitle sb sb-o" id="el-sub">${sub}</div>` : ''}
    ${ctaPillOptional(params)}
  </div>
  <div class="eco-row eco-o" id="el-eco" style="justify-content:center;">
    <img class="eco-img" src="${assetDataUri('logo-devops.webp')}" alt="">
    <div class="eco-sep"></div>
    <img class="eco-img" src="${assetDataUri('logo-iam.webp')}" alt="">
    <div class="eco-sep"></div>
    <img class="eco-img" src="${assetDataUri('logo-alcatraz.webp')}" alt="">
  </div>
</div>`);
}

// ── P — Moldura (margem escura + janela de imagem + rodapé) ────────
function P(params) {
  const { imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa } = params;
  return wrap(`
.frame-inset-p{position:absolute;inset:22px;z-index:0;overflow:hidden;border-radius:2px;}
.frame-inset-p img{width:100%;height:100%;object-fit:cover;object-position:center;}
.frame-ov-p{position:absolute;inset:22px;z-index:1;background:linear-gradient(to top,rgba(2,5,10,0.97) 0%,rgba(2,5,10,0.55) 32%,rgba(2,5,10,0.08) 58%);border-radius:2px;pointer-events:none;}
.corner-p{position:absolute;width:16px;height:16px;border-color:rgba(20,168,244,0.55);border-style:solid;z-index:4;}
.corner-tl-p{top:14px;left:14px;border-width:2px 0 0 2px;}
.corner-tr-p{top:14px;right:14px;border-width:2px 2px 0 0;}
.corner-bl-p{bottom:14px;left:14px;border-width:0 0 2px 2px;}
.corner-br-p{bottom:14px;right:14px;border-width:0 2px 2px 0;}
.logo-p{position:absolute;top:34px;left:38px;z-index:3;}
.footer-p{position:absolute;left:22px;right:22px;bottom:22px;z-index:3;padding:20px 26px 22px 28px;display:flex;flex-direction:column;gap:10px;}
.hl-p{font-size:27px;}
.sb-p{max-width:100%;}
`, `
<div class="corner-p corner-tl-p"></div>
<div class="corner-p corner-tr-p"></div>
<div class="corner-p corner-bl-p"></div>
<div class="corner-p corner-br-p"></div>
<div class="frame-inset-p">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
</div>
<div class="frame-ov-p"></div>
<div class="logo-p"><img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="" style="max-width:130px;"></div>
<div class="footer-p">
  <div class="headline hl hl-p" id="el-title">${hi(hl, pa)}</div>
  <div class="dh"></div>
  ${sub ? `<div class="subtitle sb sb-p" id="el-sub">${sub}</div>` : ''}
  ${ctaPillOptional(params)}
  ${ecoRow('flex-start')}
</div>`);
}

// ── Q — Asa Dupla (foto nas laterais + pilar central) ─────────────
function Q({ imageBase64: b, headline: hl, subtitulo: sub, palavrasAzuis: pa }) {
  return wrap(`
.art-bg-q{position:absolute;inset:0;z-index:0;}
.art-bg-q img{width:100%;height:100%;object-fit:cover;object-position:center;}
.wing-fade-q{position:absolute;inset:0;z-index:1;background:linear-gradient(to right,rgba(2,5,10,0.1) 0%,rgba(2,5,10,0.98) 27%,rgba(2,5,10,0.98) 73%,rgba(2,5,10,0.1) 100%);}
.pillar-q{position:absolute;top:0;bottom:0;left:50%;transform:translateX(-50%);width:252px;background:#02050A;z-index:2;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:30px 20px 26px;text-align:center;border-left:1px solid rgba(20,168,244,0.22);border-right:1px solid rgba(20,168,244,0.22);}
.wing-line-q{position:absolute;top:10%;bottom:10%;width:1px;z-index:3;background:linear-gradient(to bottom,transparent,rgba(20,168,244,0.5) 14%,rgba(20,168,244,0.5) 86%,transparent);}
.wing-l-q{left:calc(50% - 126px);}
.wing-r-q{left:calc(50% + 126px);}
.hl-q{font-size:24px;text-align:center;}
.sb-q{font-size:11px;line-height:1.65;text-align:center;}
.tag-q{font-family:'Montserrat',sans-serif;font-size:7px;font-weight:700;letter-spacing:0.28em;color:rgba(20,168,244,0.45);text-transform:uppercase;margin-bottom:4px;}
.eco-col-q{align-items:center;gap:12px;border-top:1px solid rgba(246,248,255,0.1);padding-top:10px;}
`, `
<div class="art-bg-q">
  <img id="art-bg" class="bg" src="data:image/png;base64,${b}" alt="">
</div>
<div class="wing-fade-q"></div>
<div class="wing-line-q wing-l-q"></div>
<div class="wing-line-q wing-r-q"></div>
<div class="pillar-q">
  <img class="lg" id="el-logo" src="${LOGO_SRC()}" alt="" style="max-width:148px;">
  <div>
    <div class="headline hl hl-q" id="el-title">${hi(hl, pa)}</div>
    <div class="dh" style="margin:12px auto;"></div>
    ${sub ? `<div class="subtitle sb sb-q" id="el-sub">${sub}</div>` : ''}
  </div>
  <div>
    <div class="tag-q">Realização</div>
    <div id="el-eco" class="eco-col eco-col-q">
      <img class="eco-img-sm" src="${assetDataUri('logo-devops.webp')}" alt="">
      <img class="eco-img-sm" src="${assetDataUri('logo-iam.webp')}" alt="">
      <img class="eco-img-sm" src="${assetDataUri('logo-alcatraz.webp')}" alt="">
    </div>
  </div>
</div>`);
}

const LAYOUTS = { A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q };

function renderLayout(letter, params) {
  const layout = letter.toUpperCase();
  const fn = LAYOUTS[layout];
  if (!fn) throw new Error(`Layout "${letter}" não encontrado. Disponíveis: ${Object.keys(LAYOUTS).join(',')}`);

  const { headline: trimmed } = enforceHeadlineText(params.headline);
  const headline = prepareHeadlineForLayout(trimmed, layout);
  const palavrasAzuis = normalizePalavrasAzuis(headline, params.palavrasAzuis);

  return fn({ ...params, headline, palavrasAzuis, layout });
}

function getLayoutCss(letter) {
  const html = renderLayout(letter, {
    imageBase64: 'x',
    headline: 'H',
    subtitulo: 'S',
    palavrasAzuis: '',
  });
  const m = html.match(/<style>([\s\S]*?)<\/style>/i);
  if (!m) return '';
  const css = m[1];
  const canvasRule = css.match(/\.canvas\{[^}]*\}/);
  if (!canvasRule) return css.trim();
  const idx = css.indexOf(canvasRule[0]) + canvasRule[0].length;
  return css.slice(idx).trim();
}

module.exports = { renderLayout, getLayoutCss };
