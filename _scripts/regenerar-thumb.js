'use strict';

require('./load-env.js');

const { getJSON, putFile, putBinary } = require('./utils/storage.js');
const { generateImage }               = require('./utils/llm.js');
const { buildImagePrompt }            = require('./utils/imagem-prompt.js');
const { renderLayout }                = require('./utils/layouts.js');
const { wrapWithEditor }              = require('./utils/editor-wrap.js');

async function regenerar(slug) {
  const artesFile = await getJSON('artes.json');
  if (!artesFile) throw new Error('artes.json não encontrado');

  const arte = artesFile.data.find(a => a.slug === slug);
  if (!arte) throw new Error(`Arte não encontrada: ${slug}`);
  if (!arte.layout) throw new Error(`Arte ${slug} sem layout registrado`);

  console.log(`🔄 Regenerando fundo: ${slug} (layout ${arte.layout})`);

  const prompt = buildImagePrompt({
    tipo:           arte.tipo,
    layout:         arte.layout,
    contextoVisual: arte.contexto_visual || ''
  });

  const imgBuffer   = await generateImage(prompt, { tipo: arte.tipo, layout: arte.layout });
  const imageBase64 = imgBuffer.toString('base64');
  const simpleHtml  = renderLayout(arte.layout, {
    imageBase64,
    headline:        arte.headline,
    subtitulo:       arte.subtitulo,
    palavrasAzuis:   arte.palavras_azuis,
    nomePalestrante: arte.nome_palestrante,
    cargoEmpresa:    arte.cargo_empresa,
  });

  const html = wrapWithEditor(simpleHtml, {
    layout:   arte.layout,
    headline: arte.headline,
    slug
  });

  const base = `artes/${slug}`;
  await putBinary(`${base}/fundo.png`, imgBuffer, `regen fundo ${slug}`);
  await putFile(`${base}/arte.html`, html, `regen arte ${slug}`);

  console.log(`✅ ${slug} atualizado — fundo sem texto (${imgBuffer.length} bytes)`);
}

const slug = process.argv[2] || 'blog-1782085374136';
regenerar(slug).catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
