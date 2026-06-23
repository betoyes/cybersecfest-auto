'use strict';

/**
 * Repara artes quebradas (pipeline local) alinhando ao padrão SuperAgent:
 * - HTML com layout CSS completo + badge LAYOUT X
 * - thumb.png composto (fundo + overlay + texto)
 */

const fs   = require('fs');
const path = require('path');

const { renderLayout }       = require('./utils/layouts.js');
const { wrapWithEditor }     = require('./utils/editor-wrap.js');
const { gerarThumbComposto } = require('./utils/thumb-composto.js');

const ROOT      = path.join(__dirname, '..');
const ARTES_DIR = path.join(ROOT, 'artes');
const ARTes_JSON = path.join(ROOT, 'artes.json');

/** Referências corretas — não re-renderizar HTML, só thumb se pedido */
const REFERENCIA = new Set([
  'blog-1782058741657',
  'blog-1782058840735',
  'evento-1782045624931'
]);

/** Slugs com HTML quebrado a re-renderizar */
const REPARAR_HTML = new Set([
  'blog-1782085374136',
  'blog-1782085638864',
  'blog-1782087418412',
  'patrocinador-1782039190901'
]);

/** Thumbs compostos (inclui referências para modal da galeria) */
const REPARAR_THUMB = new Set([
  'blog-1782085374136',
  'blog-1782085638864',
  'blog-1782087418412',
  'patrocinador-1782039190901',
  'evento-1782045624931'
]);

function readFundoBase64(slugDir) {
  const fundo = path.join(slugDir, 'fundo.png');
  if (fs.existsSync(fundo)) {
    return fs.readFileSync(fundo).toString('base64');
  }
  const html = fs.readFileSync(path.join(slugDir, 'arte.html'), 'utf8');
  let m = html.match(/id="art-bg-img"[^>]+src="data:image\/[^;]+;base64,([^"]+)"/);
  if (m) return m[1];
  m = html.match(/background-image:url\('data:image\/[^;]+;base64,([^']+)'\)/);
  if (m) return m[1];
  throw new Error('fundo.png ou base64 no arte.html não encontrado — rode regenerar-fundo.js');
}

function detectLayout(html, arte) {
  if (arte?.layout) return arte.layout.toUpperCase();
  const m = html.match(/LAYOUT ([A-Q])|Layout ([A-Q]) ·/i);
  if (m) return (m[1] || m[2]).toUpperCase();
  if (arte?.tipo === 'patrocinador') return 'F';
  if (arte?.tipo === 'evento') return 'E';
  return 'C';
}

function repararPatrocinador(slugDir, slug) {
  const artePath = path.join(slugDir, 'arte.html');
  let html       = fs.readFileSync(artePath, 'utf8');
  const b64    = readFundoBase64(slugDir);

  html = html.replace(
    /background-image:url\('(?!data:)[^']+'\)/,
    `background-image:url('data:image/png;base64,${b64}')`
  );

  if (!html.includes('badge-layout')) {
    html = html.replace(
      '  <div class="city-vertical">Brasil · 2026</div>',
      '  <div class="badge-layout">LAYOUT F</div>\n  <div class="city-vertical">Brasil · 2026</div>'
    );
    if (!html.includes('.badge-layout{')) {
      html = html.replace(
        '</style>',
        `.badge-layout{position:absolute;bottom:22px;right:14px;background:rgba(20,168,244,0.18);border:1px solid rgba(20,168,244,0.35);color:#14A8F4;font-family:'Montserrat',sans-serif;font-size:9px;font-weight:600;padding:3px 8px;border-radius:4px;letter-spacing:1px;z-index:3}\n</style>`
      );
    }
  }

  fs.writeFileSync(artePath, html);
  console.log(`🔧 patrocinador: fundo base64 + badge — ${slug}`);
}

function repararPipeline(slugDir, slug, arte) {
  const layout = detectLayout('', arte);
  const b64    = readFundoBase64(slugDir);

  const simpleHtml = renderLayout(layout, {
    imageBase64:     b64,
    headline:        arte.headline,
    subtitulo:       arte.subtitulo || '',
    palavrasAzuis:   arte.palavras_azuis || '',
    nomePalestrante: arte.nome_palestrante || '',
    cargoEmpresa:    arte.cargo_empresa || ''
  });

  const html = wrapWithEditor(simpleHtml, {
    layout,
    headline: arte.headline,
    slug
  });

  fs.writeFileSync(path.join(slugDir, 'arte.html'), html);
  console.log(`🎨 re-render: ${slug} — layout ${layout}`);
}

async function main() {
  const artes = JSON.parse(fs.readFileSync(ARTes_JSON, 'utf8'));
  const only  = process.argv.slice(2);

  for (const arte of artes) {
    const slug    = arte.slug;
    if (only.length && !only.includes(slug)) continue;

    const slugDir = path.join(ARTES_DIR, slug);
    if (!fs.existsSync(slugDir)) continue;

    if (REPARAR_HTML.has(slug)) {
      if (slug === 'patrocinador-1782039190901') {
        repararPatrocinador(slugDir, slug);
      } else {
        repararPipeline(slugDir, slug, arte);
      }
    } else if (!REFERENCIA.has(slug)) {
      console.log(`⏭️  skip html: ${slug}`);
    }

    if (REPARAR_THUMB.has(slug) || (only.includes(slug) && only.includes('--thumb'))) {
      const artePath = path.join(slugDir, 'arte.html');
      const thumbPath = path.join(slugDir, 'thumb.png');
      try {
        await gerarThumbComposto(artePath, thumbPath);
        const kb = Math.round(fs.statSync(thumbPath).size / 1024);
        console.log(`📸 thumb composto: ${slug} (${kb} KB)`);
      } catch (e) {
        console.error(`⚠️  thumb ${slug}:`, e.message);
      }
    }
  }

  console.log('\n✅ Reparo concluído');
}

main().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
