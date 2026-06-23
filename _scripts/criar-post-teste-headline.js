'use strict';

/**
 * Gera um post local de teste com headline 10 palavras / 5 linhas.
 * Uso: node criar-post-teste-headline.js
 */

const fs = require('fs');
const path = require('path');

const { renderLayout } = require('./utils/layouts.js');
const { wrapWithEditor } = require('./utils/editor-wrap.js');
const { gerarThumbComposto } = require('./utils/thumb-composto.js');
const { getLayoutPadraoState } = require('./utils/template-padroes.js');
const {
  enforceHeadlineCopy,
  wordCount,
  plainHeadline,
  MAX_HEADLINE_WORDS,
  MAX_HEADLINE_LINES,
} = require('./utils/headline-rules.js');

const ROOT = path.join(__dirname, '..');
const ARTES_JSON = path.join(ROOT, 'artes.json');
const REF_FUNDO = path.join(ROOT, 'artes/blog-1782236441882/fundo.png');

async function main() {
  const headlineRaw = 'Quem lidera<br>decide agora<br>o futuro<br>da cyber<br>no Brasil';
  const palavrasAzuis = 'lidera, futuro';
  const subtitulo = 'Teste das regras de headline: dez palavras em cinco linhas.';
  const layout = 'C';
  const slug = `blog-${Date.now()}`;
  const slugDir = path.join(ROOT, 'artes', slug);

  const enforced = enforceHeadlineCopy({ headline: headlineRaw, palavrasAzuis, layout });
  const { headline, palavrasAzuis: pa } = enforced;
  const lines = headline.split(/<br\s*\/?>/i).filter(Boolean);

  console.log('Headline:', headline);
  console.log('Palavras:', wordCount(headline), `(máx ${MAX_HEADLINE_WORDS})`);
  console.log('Linhas:', lines.length, `(máx ${MAX_HEADLINE_LINES})`);
  console.log('Palavras azuis:', pa);

  if (wordCount(headline) !== 10) throw new Error(`Esperado 10 palavras, obteve ${wordCount(headline)}`);
  if (lines.length !== 5) throw new Error(`Esperado 5 linhas, obteve ${lines.length}`);

  if (!fs.existsSync(REF_FUNDO)) throw new Error('fundo de referência ausente: blog-1782236441882');

  fs.mkdirSync(slugDir, { recursive: true });
  fs.copyFileSync(REF_FUNDO, path.join(slugDir, 'fundo.png'));
  const b64 = fs.readFileSync(REF_FUNDO).toString('base64');

  const simpleHtml = renderLayout(layout, {
    imageBase64: b64,
    headline,
    subtitulo,
    palavrasAzuis: pa,
    tipoPost: 'blog',
    layout,
  });

  const artePath = path.join(slugDir, 'arte.html');
  fs.writeFileSync(artePath, wrapWithEditor(simpleHtml, {
    layout,
    headline: plainHeadline(headline),
    slug,
    editorState: getLayoutPadraoState(layout) || undefined,
  }));

  fs.writeFileSync(path.join(slugDir, 'index.html'), `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${plainHeadline(headline)} — CybersecFEST</title>
<style>body{margin:0;background:#02050a}iframe{width:100vw;height:100vh;border:0}a{position:fixed;bottom:12px;left:12px;color:#14A8F4;font:12px Montserrat,sans-serif}</style>
</head>
<body>
<iframe src="arte.html?embed"></iframe>
<a href="../../index.html#arte=${slug}">← Galeria</a>
</body>
</html>`);

  await gerarThumbComposto(artePath, path.join(slugDir, 'thumb.png'));

  const artes = JSON.parse(fs.readFileSync(ARTES_JSON, 'utf8'));
  artes.push({
    slug,
    tipo: 'blog',
    headline: plainHeadline(headline),
    palavras_azuis: pa,
    subtitulo,
    cidade: 'BH e SP',
    formato: 'feed_vertical',
    layout,
    legenda: 'Post de teste — validação headline 10 palavras / 5 linhas.\n\n✅ Abra no editor para inspecionar as quebras e o destaque azul.\n\n#CybersecFEST #Teste #HeadlineRules',
    legenda_variante: 'teste',
    publicacao: 'backup',
    angulo_editorial: 'Teste headline-rules',
    image_path: `artes/${slug}/thumb.png`,
    html_path: `artes/${slug}/arte.html`,
    created_at: new Date().toISOString(),
  });
  fs.writeFileSync(ARTES_JSON, JSON.stringify(artes, null, 2) + '\n');

  const snippet = fs.readFileSync(artePath, 'utf8').match(/id="el-title"[^>]*>([\s\S]*?)<\/div>/);
  console.log('\n✅ Post de teste criado');
  console.log('   Slug:', slug);
  console.log('   Título HTML:', (snippet && snippet[1] || '').trim());
  console.log('   URL:  http://127.0.0.1:8765/#arte=' + slug);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
