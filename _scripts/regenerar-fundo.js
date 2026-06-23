'use strict';

/**
 * Regenera APENAS o fundo fotográfico (sem texto) e recompõe arte.html + thumb.
 * Usa os 3 uploads do usuário como referência de padrão.
 */

require('./load-env.js');

const fs   = require('fs');
const path = require('path');

const { generateImage }      = require('./utils/llm.js');
const { buildImagePrompt, validateLayout, getLayoutImageRules } = require('./utils/imagem-prompt.js');
const { renderLayout }       = require('./utils/layouts.js');
const { wrapWithEditor }     = require('./utils/editor-wrap.js');
const { extractEditorState } = require('./utils/editor-state.js');
const { gerarThumbComposto } = require('./utils/thumb-composto.js');

const ROOT       = path.join(__dirname, '..');
const ARTES_DIR  = path.join(ROOT, 'artes');
const ARTes_JSON = path.join(ROOT, 'artes.json');

/** Referências SuperAgent — nunca regenerar */
const REFERENCIA = new Set([
  'blog-1782058741657',
  'evento-1782045624931'
]);

/** Artes pipeline com desvio do Design System */
const REGENERAR = new Set([
  'blog-1782058840735',
  'blog-1782085374136',
  'blog-1782085638864',
  'blog-1782087418412'
]);

function detectLayout(arte) {
  if (arte.layout) return arte.layout.toUpperCase();
  if (arte.tipo === 'evento') return 'E';
  if (arte.tipo === 'patrocinador') return 'F';
  return 'C';
}

function montarArte(slugDir, slug, arte, imageBase64) {
  const layout = detectLayout(arte);
  const artePath = path.join(slugDir, 'arte.html');
  const editorState = fs.existsSync(artePath)
    ? extractEditorState(fs.readFileSync(artePath, 'utf8'))
    : null;

  const simpleHtml = renderLayout(layout, {
    imageBase64,
    headline:        arte.headline,
    subtitulo:       arte.subtitulo || '',
    palavrasAzuis:   arte.palavras_azuis || '',
    nomePalestrante: arte.nome_palestrante || '',
    cargoEmpresa:    arte.cargo_empresa || '',
  });

  const html = wrapWithEditor(simpleHtml, {
    layout,
    headline: arte.headline,
    slug,
    editorState,
  });

  fs.writeFileSync(artePath, html);
  console.log(`📝 HTML recomposto: ${slug} (layout ${layout}) — editor preservado`);
}

async function regenerarFundo(arte) {
  const slug    = arte.slug;
  const slugDir = path.join(ARTES_DIR, slug);
  const layout  = detectLayout(arte);
  validateLayout(layout);
  const rules   = getLayoutImageRules(layout);

  const prompt = buildImagePrompt({
    tipo:           arte.tipo,
    layout,
    contextoVisual: arte.contexto_visual || '',
    slug:           arte.slug,
    cidade:         arte.cidade || 'BH',
  });

  console.log(`\n🖼️  Regenerando fundo limpo: ${slug}`);
  console.log(`   Layout ${layout} · foco: ${rules.focusId}`);
  console.log(`   Prompt (visual only): ${prompt.slice(0, 140)}…`);

  const imgBuffer = await generateImage(prompt, {
    tipo:           arte.tipo,
    layout,
    contextoVisual: arte.contexto_visual || '',
    cidade:         arte.cidade || 'BH',
  });
  const imageBase64 = imgBuffer.toString('base64');

  if (imgBuffer.length < 5000) {
    throw new Error(`Imagem muito pequena (${imgBuffer.length} bytes) — verifique API keys`);
  }

  // Salva fundo cru separado — nunca reutilizar thumb composto como fundo
  fs.mkdirSync(slugDir, { recursive: true });
  fs.writeFileSync(path.join(slugDir, 'fundo.png'), imgBuffer);
  console.log(`💾 fundo.png salvo (${Math.round(imgBuffer.length / 1024)} KB)`);

  montarArte(slugDir, slug, arte, imageBase64);

  const artePath  = path.join(slugDir, 'arte.html');
  const thumbPath = path.join(slugDir, 'thumb.png');
  await gerarThumbComposto(artePath, thumbPath);
  console.log(`📸 thumb composto: ${Math.round(fs.statSync(thumbPath).size / 1024)} KB`);
}

async function main() {
  const artes  = JSON.parse(fs.readFileSync(ARTes_JSON, 'utf8'));
  const only   = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const forced = only.length > 0;

  for (const arte of artes) {
    if (REFERENCIA.has(arte.slug)) {
      console.log(`✅ referência intacta: ${arte.slug}`);
      continue;
    }
    if (!forced && !REGENERAR.has(arte.slug)) continue;
    if (forced && !only.includes(arte.slug)) continue;

    await regenerarFundo(arte);
  }

  console.log('\n✅ Fundos regenerados — texto exclusivamente no HTML');
}

main().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
