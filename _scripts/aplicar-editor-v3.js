'use strict';

/**
 * Aplica editor visual v3 (referência blog-1782058741657) em artes com painel incompleto.
 */

const fs   = require('fs');
const path = require('path');

const { wrapWithEditor }     = require('./utils/editor-wrap.js');
const { gerarThumbComposto } = require('./utils/thumb-composto.js');

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

async function main() {
  const artes = JSON.parse(fs.readFileSync(ARTes_JSON, 'utf8'));
  const regenThumb = process.argv.includes('--thumb');

  for (const arte of artes) {
    const slug     = arte.slug;
    const artePath = path.join(ARTES_DIR, slug, 'arte.html');
    if (!fs.existsSync(artePath)) continue;

    let html = fs.readFileSync(artePath, 'utf8');
    if (html.includes('ep-tag')) {
      console.log(`✅ já v3: ${slug}`);
      continue;
    }

    const layout = detectLayout(arte, html);
    html = wrapWithEditor(html, { layout, headline: arte.headline, slug });
    fs.writeFileSync(artePath, html);
    console.log(`🔧 editor v3 aplicado: ${slug} (layout ${layout})`);

    if (regenThumb) {
      try {
        await gerarThumbComposto(artePath, path.join(ARTES_DIR, slug, 'thumb.png'));
        console.log(`📸 thumb: ${slug}`);
      } catch (e) {
        console.warn(`⚠️  thumb ${slug}:`, e.message);
      }
    }
  }

  console.log('\n✅ Editor v3 aplicado');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
