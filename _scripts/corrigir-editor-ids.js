'use strict';

/**
 * Corrige IDs do canvas + script do editor v3 em artes legadas (evento, patrocinador).
 */

const fs   = require('fs');
const path = require('path');

const { normalizeCanvas }  = require('./utils/editor-wrap.js');
const { editorV3Script }   = require('./utils/editor-v3-script.js');

const ROOT      = path.join(__dirname, '..');
const ARTES_DIR = path.join(ROOT, 'artes');
const ARTes_JSON = path.join(ROOT, 'artes.json');

function detectLayout(arte, html) {
  if (arte.layout) return arte.layout.toUpperCase();
  const m = html.match(/LAYOUT ([A-N])|Layout ([A-N]) ·/i);
  if (m) return (m[1] || m[2]).toUpperCase();
  if (arte.tipo === 'patrocinador') return 'F';
  if (arte.tipo === 'evento') return 'E';
  return 'C';
}

function fixArteHtml(html, slug, layout) {
  const canvasMatch = html.match(
    /(<div class="art-canvas" id="the-canvas">)([\s\S]*?)(<\/div>\s*<div class="ci")/
  );
  if (canvasMatch) {
    const fixed = normalizeCanvas(canvasMatch[2].trim(), layout);
    html = html.replace(canvasMatch[0], canvasMatch[1] + fixed + canvasMatch[3]);
  }

  // Atualiza script se não tiver fallbacks de seletor
  if (!html.includes('logo-img,.logo-cyberfest')) {
    html = html.replace(
      /<script>\(function\(\)\{[\s\S]*?\}\)\(\);<\/script>/,
      `<script>${editorV3Script(slug)}<\/script>`
    );
  }

  return html;
}

function main() {
  const artes = JSON.parse(fs.readFileSync(ARTes_JSON, 'utf8'));

  for (const arte of artes) {
    const slug     = arte.slug;
    const artePath = path.join(ARTES_DIR, slug, 'arte.html');
    if (!fs.existsSync(artePath)) continue;

    let html   = fs.readFileSync(artePath, 'utf8');
    const before = html;
    const layout = detectLayout(arte, html);
    html = fixArteHtml(html, slug, layout);

    if (html !== before) {
      fs.writeFileSync(artePath, html);
      console.log(`🔧 IDs + script corrigidos: ${slug}`);
    } else {
      console.log(`✅ ok: ${slug}`);
    }
  }

  console.log('\n✅ Painel Elementos corrigido');
}

main();
