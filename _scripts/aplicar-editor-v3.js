'use strict';

/**
 * Aplica / repara editor visual v3.1 (alinhamento + salvar).
 * Re-renderiza HTML a partir do layout quando o canvas foi corrompido no upgrade.
 */

const fs   = require('fs');
const path = require('path');

const { renderLayout }       = require('./utils/layouts.js');
const { wrapWithEditor }     = require('./utils/editor-wrap.js');
const { extractEditorState } = require('./utils/editor-state.js');
const { gerarThumbComposto } = require('./utils/thumb-composto.js');
const { resolveCtaPill }            = require('./utils/cta-pill.js');
const { getLayoutPadraoState }      = require('./utils/template-padroes.js');
const { isReferenciaOuro }          = require('./utils/referencia-artes.js');

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
  m = html.match(/id="art-bg-img"[^>]+src="data:image\/[^;]+;base64,([^"]+)"/);
  if (m) return m[1];
  throw new Error('fundo.png ou base64 no arte.html não encontrado');
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

  const ctaMatch = oldHtml.match(/id="el-cta"[^>]*>([^<]+)/);
  const ctaVisual = arte.cta_visual
    || (ctaMatch ? ctaMatch[1].trim() : '')
    || resolveCtaPill({ layout, tipoPost: arte.tipo });

  const savedState  = extractEditorState(oldHtml);
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
  return html;
}

async function main() {
  const artes = JSON.parse(fs.readFileSync(ARTes_JSON, 'utf8'));
  const regenThumb = process.argv.includes('--thumb');
  const force = process.argv.includes('--force');

  for (const arte of artes) {
    const slug     = arte.slug;
    const slugDir  = path.join(ARTES_DIR, slug);
    const artePath = path.join(slugDir, 'arte.html');
    if (!fs.existsSync(artePath)) continue;

    if (isReferenciaOuro(slug)) {
      console.log(`⏭ ouro (skip): ${slug}`);
      continue;
    }

    let html = fs.readFileSync(artePath, 'utf8');
    if (!force && !needsUpgrade(html)) {
      console.log(`✅ ok: ${slug}`);
      continue;
    }

    html = rebuildArteHtml(arte, slugDir);
    fs.writeFileSync(artePath, html);
    console.log(`🔧 editor v3.1 re-render: ${slug} (layout ${detectLayout(arte, html)})`);

    if (regenThumb) {
      try {
        await gerarThumbComposto(artePath, path.join(slugDir, 'thumb.png'));
        console.log(`📸 thumb: ${slug}`);
      } catch (e) {
        console.warn(`⚠️  thumb ${slug}:`, e.message);
      }
    }
  }

  console.log('\n✅ Editor v3.1 aplicado');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
