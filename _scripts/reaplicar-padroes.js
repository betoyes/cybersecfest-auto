'use strict';

/**
 * Reaplica diagramação oficial (layout-padroes.json) nas artes publicadas.
 * Preserva fundo.png, copy e estado do editor salvo; usa padrão do layout quando existir.
 *
 * Uso:
 *   node reaplicar-padroes.js           # só artes que precisam upgrade v3.1
 *   node reaplicar-padroes.js --force   # todas (exceto ouro)
 *   node reaplicar-padroes.js --thumb   # regenera thumb.png
 *   node reaplicar-padroes.js --ouro    # inclui artes de referência ouro
 */

const fs   = require('fs');
const path = require('path');

const { renderLayout }              = require('./utils/layouts.js');
const { wrapWithEditor }            = require('./utils/editor-wrap.js');
const { extractEditorState }        = require('./utils/editor-state.js');
const { resolveCtaPill }            = require('./utils/cta-pill.js');
const { gerarThumbComposto }        = require('./utils/thumb-composto.js');
const { isReferenciaOuro }          = require('./utils/referencia-artes.js');
const { getLayoutPadraoState }      = require('./utils/template-padroes.js');

const ROOT       = path.join(__dirname, '..');
const ARTES_DIR  = path.join(ROOT, 'artes');
const ARTes_JSON = path.join(ROOT, 'artes.json');

function detectLayout(arte, html) {
  if (arte.layout) return arte.layout.toUpperCase();
  const m = html.match(/LAYOUT ([A-Q])|Layout ([A-Q]) ·/i);
  if (m) return (m[1] || m[2]).toUpperCase();
  if (arte.tipo === 'patrocinador') return 'F';
  if (arte.tipo === 'evento') return 'E';
  return 'C';
}

function readFundoBase64(slugDir) {
  const fundo = path.join(slugDir, 'fundo.png');
  if (fs.existsSync(fundo)) {
    return fs.readFileSync(fundo).toString('base64');
  }
  const html = fs.readFileSync(path.join(slugDir, 'arte.html'), 'utf8');
  let m = html.match(/background-image:url\('data:image\/[^;]+;base64,([^']+)'\)/);
  if (m) return m[1];
  m = html.match(/id="art-bg"[^>]+src="data:image\/[^;]+;base64,([^"]+)"/);
  if (m) return m[1];
  throw new Error('fundo.png ou base64 no arte.html não encontrado');
}

function extractCtaFromHtml(html) {
  const m = html.match(/id="el-cta"[^>]*>([^<]+)/);
  return m ? m[1].trim() : '';
}

function needsUpgrade(html) {
  if (!html.includes('btnSave') || !html.includes('ttaseg')) return true;
  if (!/\/\* Layout [A-Q] \*\//.test(html)) return true;
  if (!html.includes('id="ctaSection"')) return true;
  if (!html.includes('v3.1')) return true;
  return false;
}

function rebuildArteHtml(arte, slugDir) {
  const oldHtml = fs.readFileSync(path.join(slugDir, 'arte.html'), 'utf8');
  const layout  = detectLayout(arte, oldHtml);
  const b64     = readFundoBase64(slugDir);

  const ctaVisual = arte.cta_visual
    || extractCtaFromHtml(oldHtml)
    || resolveCtaPill({ layout, tipoPost: arte.tipo, ctaVisual: arte.cta_visual });

  const savedState = extractEditorState(oldHtml);
  const padraoState = getLayoutPadraoState(layout);
  const editorState = savedState || padraoState || undefined;

  const simpleHtml = renderLayout(layout, {
    imageBase64:     b64,
    headline:        arte.headline,
    subtitulo:       arte.subtitulo || '',
    palavrasAzuis:   arte.palavras_azuis || '',
    nomePalestrante: arte.nome_palestrante || '',
    cargoEmpresa:    arte.cargo_empresa || '',
    ctaVisual:       ctaVisual || undefined,
    tipoPost:        arte.tipo,
    layout,
  });

  const html = wrapWithEditor(simpleHtml, {
    layout,
    headline: arte.headline,
    slug:     arte.slug,
    editorState,
  });

  if (!html) throw new Error('wrapWithEditor falhou');
  return { html, layout };
}

async function main() {
  const artes = JSON.parse(fs.readFileSync(ARTes_JSON, 'utf8'));
  const regenThumb = process.argv.includes('--thumb');
  const force      = process.argv.includes('--force');
  const incluirOuro = process.argv.includes('--ouro');

  let atualizadas = 0;
  let puladas = 0;

  for (const arte of artes) {
    const slug     = arte.slug;
    const slugDir  = path.join(ARTES_DIR, slug);
    const artePath = path.join(slugDir, 'arte.html');
    if (!fs.existsSync(artePath)) continue;

    if (!incluirOuro && isReferenciaOuro(slug)) {
      console.log(`⏭ ouro (skip): ${slug}`);
      puladas += 1;
      continue;
    }

    const oldHtml = fs.readFileSync(artePath, 'utf8');
    if (!force && !needsUpgrade(oldHtml)) {
      console.log(`✅ ok: ${slug}`);
      puladas += 1;
      continue;
    }

    const { html, layout } = rebuildArteHtml(arte, slugDir);
    fs.writeFileSync(artePath, html);
    atualizadas += 1;
    console.log(`🔧 padrão reaplicado: ${slug} (layout ${layout})`);

    if (regenThumb) {
      try {
        await gerarThumbComposto(artePath, path.join(slugDir, 'thumb.png'));
        console.log(`   📸 thumb: ${slug}`);
      } catch (e) {
        console.warn(`   ⚠️  thumb ${slug}:`, e.message);
      }
    }
  }

  console.log(`\n✅ Reaplicar padrões — ${atualizadas} atualizada(s), ${puladas} sem mudança`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
