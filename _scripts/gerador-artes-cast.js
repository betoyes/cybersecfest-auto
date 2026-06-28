'use strict';

/**
 * Gerador de Artes — CYBERSEC.CAST
 * Mesmo pipeline do gerador-artes.js, mas:
 * - buildCastImagePrompt (indigo/violet, estúdio de podcast)
 * - renderLayoutForBrand (troca cores/fonte/logo para CAST)
 * - Slugs prefixados cast-
 * - Grava em artes-cast.json + _brands/cyberseccast/temas.json
 * - Layout pool CAST-específico
 */

require('./load-env.js');

const fs   = require('fs');
const path = require('path');

const { getJSON, putFile, putBinary, putJSON, REPO_ROOT, isLocal, ensureDir } = require('./utils/storage.js');
const { generateText, generateImage }    = require('./utils/llm.js');
const { getReferencePartsForGenerationCast } = require('./utils/reference-images.js');
const { CAST_STYLE_REF_INSTRUCTION }         = require('../_brands/cyberseccast/imagem-prompt.js');
const { validateLayout }                 = require('./utils/imagem-prompt.js');
const { buildCastImagePrompt }           = require('../_brands/cyberseccast/imagem-prompt.js');
const CAST_BRAND                         = require('../_brands/cyberseccast/brand.js');
const { renderLayoutForBrand }           = require('./utils/brand-renderer.js');
const { normalizePalavrasAzuis }         = require('./utils/palavras-azuis.js');
const { enforceHeadlineText }            = require('./utils/headline-rules.js');
const { wrapWithEditor }                 = require('./utils/editor-wrap.js');
const { gerarThumbComposto }             = require('./utils/thumb-composto.js');
const { getLayoutPadraoState }           = require('./utils/template-padroes.js');
const { resolveCtaPill }                 = require('./utils/cta-pill.js');

// Pool de layouts por tipo CAST (mapeado para os que funcionam melhor com podcast)
const CAST_LAYOUT_POOL = {
  episodio:  ['C', 'M', 'N', 'G'],
  convidado: ['D', 'G', 'K', 'F'],
  insight:   ['A', 'H', 'L', 'J'],
};

function pickCastLayout(tipoPost, historico = []) {
  const pool = CAST_LAYOUT_POOL[tipoPost] || CAST_LAYOUT_POOL.episodio;
  const recentLayouts = historico
    .filter(h => h.tipo_post === tipoPost)
    .slice(-pool.length)
    .map(h => h.layout);
  // evitar repetição imediata
  const available = pool.filter(l => !recentLayouts.includes(l));
  const candidates = available.length ? available : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── Legenda CAST via LLM ─────────────────────────────────────────
async function gerarLegendaCast(angulo, briefing, tipoPost) {
  const system = `Você é produtor editorial sênior do CYBERSEC.CAST — podcast executivo de cibersegurança.
Tom: intelectual, íntimo, provocador. Público: CISOs, CIOs, CTOs, CEOs, VPs.
REGRAS: 7–12 linhas de corpo, frases curtas, uma ideia por linha. CTA ✅ + hashtags (10–15). Nunca começar com "O CYBERSEC.CAST".`;

  const prompt = `Crie uma legenda ${angulo === 'FOMO' ? 'com gancho de urgência/exclusividade' : 'com gancho intelectual/provocador'} para o briefing de podcast:

${briefing}

7–12 linhas de corpo, frases curtas. CTA ✅ mencionando CYBERSEC.CAST + Spotify/YouTube. 10–15 hashtags relevantes.
Retorne APENAS a legenda, sem marcações.`;

  return generateText(prompt, system, 0.85, 2048);
}

async function scoreLegenda(legenda) {
  const prompt = `Avalie esta legenda para podcast executivo de cibersegurança (LinkedIn/Instagram).
Critérios (0-2 cada): 1) Gancho intelectual/provocador  2) Tom íntimo e exclusivo  3) CTA claro  4) Hashtags  5) Fluidez
Responda APENAS com um número inteiro de 0 a 10.

LEGENDA:
${legenda}`;
  const raw = await generateText(prompt, '', 0.1);
  const n   = parseInt(raw.match(/\d+/)?.[0] || '7', 10);
  return Math.min(10, Math.max(0, n));
}

// ── Main: gerar arte CAST completa (fase visual) ─────────────────
async function gerarArteCast({
  tipoPost, headline, subtitulo, palavrasAzuis,
  contextoVisual, legendaAprovada = null,
  layoutOverride = null, publicacao = 'normal',
  propostaId = null, angulo = null, ctaVisual = null,
}) {
  console.log(`\n🎙️  CAST — Gerador de Artes · tipo: ${tipoPost}${publicacao === 'backup' ? ' · backup' : ''}`);

  const headlineEnforced = enforceHeadlineText(headline);
  headline = headlineEnforced.headline;
  headlineEnforced.warnings.forEach(w => console.log(`   ⚠️  ${w}`));

  const palavrasAzuisNorm = normalizePalavrasAzuis(headline, palavrasAzuis);
  if (palavrasAzuisNorm !== String(palavrasAzuis || '').trim()) {
    console.log(`   🟣 palavras_azuis ajustadas: "${palavrasAzuis || ''}" → "${palavrasAzuisNorm}"`);
    palavrasAzuis = palavrasAzuisNorm;
  }

  // 1. Carregar temas CAST
  const temasPath = path.join(REPO_ROOT, '_brands/cyberseccast/temas.json');
  const temas = JSON.parse(fs.readFileSync(temasPath, 'utf8'));

  // 2. Determinar layout
  const layout = layoutOverride
    ? String(layoutOverride).toUpperCase()
    : pickCastLayout(tipoPost, temas.historico_recente || []);
  validateLayout(layout);
  console.log(`📐 CAST Layout: ${layout}`);

  const slug     = `cast-${tipoPost}-${Date.now()}`;
  const basePath = `artes/${slug}`;
  const timestamp = new Date().toISOString();

  if (isLocal && ensureDir) {
    ensureDir(basePath);
    console.log(`📁 Pasta CAST criada: ${basePath}/`);
  }

  // 3. Gerar imagem IA com identidade CAST (indigo/violet, podcast)
  console.log('🖼️  CAST — Gerando imagem IA (estilo indigo #6366f1, podcast executivo)...');
  const imgPrompt = buildCastImagePrompt({ tipo: tipoPost, layout, contextoVisual, slug });
  const castRefs  = getReferencePartsForGenerationCast({ max: 3 });
  if (castRefs.paths.length) {
    console.log(`   📎 CAST refs: ${castRefs.paths.map(p => path.basename(p)).join(', ')}`);
  }
  // _styleInstruction substitui o STYLE_REF_INSTRUCTION do FEST dentro de generateImageNanoBanana
  // para evitar instrução dupla (FEST cyan + CAST indigo) que confunde o modelo
  const imgBuffer = await generateImage(imgPrompt, {
    tipo: tipoPost, layout, contextoVisual,
    useReferences: false,
    _referenceParts: castRefs.parts,
    _styleInstruction: castRefs.parts.length ? CAST_STYLE_REF_INSTRUCTION : null,
  });
  if (!imgBuffer?.length || imgBuffer.length < 500) {
    throw new Error(`Imagem CAST inválida (${imgBuffer?.length || 0} bytes)`);
  }
  const imageBase64 = imgBuffer.toString('base64');

  console.log(`💾 Salvando fundo.png (${Math.round(imgBuffer.length / 1024)} KB)...`);
  await putBinary(`${basePath}/fundo.png`, imgBuffer, `[CAST] fundo: ${slug}`);

  // 4. Legenda — aprovada pela proposta ou A/B automático
  let legendaSelecionada;
  let varianteSelecionada;
  let scoreA = null;
  let scoreB = null;

  if (legendaAprovada?.trim()) {
    console.log('✍️  CAST — Legenda pré-aprovada (proposta)');
    legendaSelecionada  = legendaAprovada.trim();
    varianteSelecionada = 'aprovada';
  } else {
    console.log('✍️  CAST — Gerando legendas A/B...');
    const briefingCtx = `${headline}\n${subtitulo || ''}`;
    let legendaA = await gerarLegendaCast('FOMO', briefingCtx, tipoPost);
    let legendaB = await gerarLegendaCast('intelectual', briefingCtx, tipoPost);
    scoreA = await scoreLegenda(legendaA);
    scoreB = await scoreLegenda(legendaB);
    if (scoreA < 7) { legendaA = await gerarLegendaCast('FOMO', briefingCtx, tipoPost); scoreA = await scoreLegenda(legendaA); }
    if (scoreB < 7) { legendaB = await gerarLegendaCast('intelectual', briefingCtx, tipoPost); scoreB = await scoreLegenda(legendaB); }
    varianteSelecionada = scoreA >= scoreB ? 'A' : 'B';
    legendaSelecionada  = scoreA >= scoreB ? legendaA : legendaB;
    console.log(`✅ CAST Legenda ${varianteSelecionada} selecionada (A:${scoreA} B:${scoreB})`);
  }

  // 5. Gerar HTML com brand tokens CAST (indigo, Inter, Space Mono, logo CAST)
  console.log('🏗️  CAST — Gerando HTML com brand CAST...');
  const ctaPayload = (ctaVisual || '').trim() || null;

  let html = renderLayoutForBrand(slug, {
    layout,          // obrigatório: renderLayoutForBrand usa arte.layout
    imageBase64,
    headline,
    subtitulo,
    palavrasAzuis,
    tipoPost,
    cta: ctaPayload,
    ctaVisual: ctaPayload,
  }, CAST_BRAND);
  html = wrapWithEditor(html, {
    layout,
    headline,
    slug,
    palavrasAzuis,
    editorState: getLayoutPadraoState(layout) || undefined,
    formato: 'feed_vertical',
  });

  console.log(`📤 Salvando: ${slug}`);
  await putFile(`${basePath}/arte.html`, html, `[CAST] arte: ${slug} — layout ${layout}`);

  // Thumbnail
  const arteFullPath  = path.join(REPO_ROOT, basePath, 'arte.html');
  const thumbFullPath = path.join(REPO_ROOT, basePath, 'thumb.png');
  try {
    await gerarThumbComposto(arteFullPath, thumbFullPath);
    console.log('📸 CAST thumb gerado');
  } catch (e) {
    console.warn(`⚠️  CAST thumb falhou (${e.message}) — usando fundo IA como thumb`);
    await putBinary(`${basePath}/thumb.png`, imgBuffer, `[CAST] thumb: ${slug}`);
  }

  // index.html individual com brand CAST
  const indexHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:title" content="${headline}">
<title>${headline} — CYBERSEC.CAST</title>
<style>body{margin:0;background:#07060f;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#f0eeff;}
iframe{border:none;width:540px;height:675px;}
a{color:#6366f1;text-decoration:none;margin-top:16px;display:block;text-align:center;}
</style>
</head>
<body>
<iframe src="arte.html?embed"></iframe>
<a href="../../cast/">← CYBERSEC.CAST Galeria</a>
</body>
</html>`;
  await putFile(`${basePath}/index.html`, indexHtml, `[CAST] index: ${slug}`);

  // 6. Atualizar artes-cast.json
  const artesFile = await getJSON('artes-cast.json');
  const artes     = artesFile ? artesFile.data : [];
  const ctaResolvido = resolveCtaPill({ cta: ctaPayload, ctaVisual: ctaPayload, tipoPost, layout });
  artes.push({
    slug,
    tipo: tipoPost,
    headline,
    palavras_azuis: palavrasAzuis || '',
    subtitulo: subtitulo || '',
    layout,
    legenda: legendaSelecionada,
    legenda_variante: varianteSelecionada,
    contexto_visual: contextoVisual || '',
    ...(ctaResolvido ? { cta_visual: ctaResolvido } : {}),
    publicacao: publicacao === 'backup' ? 'backup' : 'normal',
    ...(propostaId ? { proposta_id: propostaId } : {}),
    ...(angulo ? { angulo_editorial: angulo } : {}),
    image_path: `${basePath}/thumb.png`,
    html_path:  `${basePath}/arte.html`,
    created_at: timestamp,
    brand: 'cyberseccast',
  });
  await putJSON('artes-cast.json', artes, `[CAST] artes-cast.json: add ${slug}`, artesFile?.sha);

  // 7. Atualizar historico_recente em temas CAST
  const hist = temas.historico_recente || [];
  hist.push({ tipo_post: tipoPost, layout, slug, data: timestamp.slice(0, 10) });
  if (hist.length > 20) hist.splice(0, hist.length - 20);
  temas.historico_recente = hist;
  fs.writeFileSync(temasPath, JSON.stringify(temas, null, 2) + '\n');

  console.log(`\n🎉 CAST Arte criada!`);
  console.log(`   Slug:    ${slug}`);
  console.log(`   Layout:  ${layout}`);
  console.log(`   Legenda: ${varianteSelecionada}${scoreA != null ? ` (A:${scoreA} B:${scoreB})` : ''}`);

  return { slug, layout, tipoPost, varianteSelecionada, scoreA, scoreB };
}

module.exports = { gerarArteCast };
