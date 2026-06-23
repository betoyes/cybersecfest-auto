// CybersecFEST — Gerador de Artes (autônomo)
// Versão standalone — sem CREAO, sem interação humana
// Roda via GitHub Actions ou chamado pelo pipeline.js
'use strict';

require('./load-env.js');

const fs   = require('fs');
const path = require('path');

const { getJSON, putFile, putBinary, putJSON, REPO, REPO_ROOT, isLocal, ensureDir } = require('./utils/storage.js');
const { generateText, generateImage }                = require('./utils/llm.js');
const { buildImagePrompt, getLayoutImageRules, validateLayout, REFERENCE_ARTES } = require('./utils/imagem-prompt.js');
const { renderLayout }                               = require('./utils/layouts.js');
const { normalizePalavrasAzuis }                     = require('./utils/palavras-azuis.js');
const { enforceHeadlineText }                        = require('./utils/headline-rules.js');
const { wrapWithEditor }                             = require('./utils/editor-wrap.js');
const { gerarThumbComposto }                         = require('./utils/thumb-composto.js');
const { pickNextLayout }                             = require('./utils/layout-rotacao.js');
const { buildReferenciaCopyBlock, REGRAS_LEGENDA } = require('./utils/referencia-copy.js');
const { getLayoutPadraoState }                       = require('./utils/template-padroes.js');
const { resolveCtaPill }                             = require('./utils/cta-pill.js');

// ── Score de legenda via LLM ─────────────────────────────────────
async function scoreLegenda(legenda) {
  const prompt = `Avalie esta legenda de post para evento de cybersegurança executivo no Brasil.
Critérios (0-2 cada): 1) Gancho forte na 1ª frase  2) Clareza executiva  3) CTA presente  4) Hashtags  5) Fluidez
Responda APENAS com um número inteiro de 0 a 10.

LEGENDA:
${legenda}`;
  const raw = await generateText(prompt, '', 0.1);
  const n   = parseInt(raw.match(/\d+/)?.[0] || '7', 10);
  return Math.min(10, Math.max(0, n));
}

// ── Gerar uma legenda ────────────────────────────────────────────
async function gerarLegenda(angulo, briefing, tipoPost) {
  const refBlock = buildReferenciaCopyBlock(tipoPost);
  const system = `Você é copywriter sênior do CybersecFEST — evento executivo de cibersegurança do Brasil.
Tom: aspiracional, FOMO, gatilhos de pertencimento. Público: CISOs, CIOs, CTOs, CEOs, VPs.
REGRAS: legendas no padrão mediano dos exemplos abaixo (${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas de corpo). Nunca começar com "O CybersecFEST". Sem clichês técnicos.`;

  const prompt = `${refBlock}

Crie uma legenda ${angulo === 'FOMO' ? 'com gancho emocional/urgência (FOMO)' : 'com gancho aspiracional/conquista'} para o briefing:

${briefing}

Mesmo tamanho dos exemplos ouro (${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas de corpo, frases curtas). CTA ✅ + hashtags.
Retorne APENAS a legenda.`;

  return generateText(prompt, system, 0.85, 2048);
}

// ── Gerar imagem IA — SOMENTE cena visual, nunca headline/copy ───
async function gerarImagemPrompt(tipoPost, layoutLetter, contextoVisual, slug = '', cidade = '') {
  return buildImagePrompt({ tipo: tipoPost, layout: layoutLetter, contextoVisual, slug, cidade });
}

// ── Main: gerar arte completa (fase 2 — visual) ─────────────────
async function gerarArte({ tipoPost, headline, subtitulo, palavrasAzuis,
  nomePalestrante, cargoEmpresa, contextoVisual, cidade,
  layoutOverride = null, briefingCompleto = null,
  legendaAprovada = null, publicacao = 'normal', propostaId = null, angulo = null,
  cta = null, ctaVisual = null, formato = 'feed_vertical' }) {

  console.log(`\n🎨 Gerador de Artes — fase visual · tipo: ${tipoPost}${publicacao === 'backup' ? ' · backup' : ''}`);

  const headlineEnforced = enforceHeadlineText(headline);
  headline = headlineEnforced.headline;
  headlineEnforced.warnings.forEach(w => console.log(`   ⚠️  ${w}`));

  const palavrasAzuisNorm = normalizePalavrasAzuis(headline, palavrasAzuis);
  if (palavrasAzuisNorm !== String(palavrasAzuis || '').trim()) {
    console.log(`   🔵 palavras_azuis ajustadas: "${palavrasAzuis || ''}" → "${palavrasAzuisNorm}"`);
    palavrasAzuis = palavrasAzuisNorm;
  }

  // 1. Carregar temas.json
  const temasFile = await getJSON('temas.json');
  if (!temasFile) throw new Error('temas.json não encontrado no repo');
  const temas = temasFile.data;

  // 2. Determinar layout (rotação aleatória sem repetição até esgotar pool)
  let layoutMeta = null;
  let layoutCiclos = temas.layout_ciclos || {};
  let layout;

  if (layoutOverride) {
    layout = layoutOverride;
  } else {
    const pick = pickNextLayout(tipoPost, {
      rotacaoLayouts:   temas.rotacao_layouts,
      layoutCiclos,
      historicoRecente: temas.historico_recente,
    });
    layout       = pick.layout;
    layoutCiclos = pick.layoutCiclos;
    layoutMeta   = pick.meta;
  }

  validateLayout(layout);
  const imageRules = getLayoutImageRules(layout);
  if (layoutMeta) {
    console.log(`📐 Layout: ${layout} (aleatório · pool [${layoutMeta.pool.join(',')}] · restantes: [${layoutMeta.restantesApos.join(',') || '—'}]${layoutMeta.novoCiclo ? ' · novo ciclo' : ''})`);
  } else {
    console.log(`📐 Layout: ${layout} (override manual)`);
  }
  console.log(`   Foco imagem: ${imageRules.focusId}`);

  const slug      = `${tipoPost}-${Date.now()}`;
  const basePath  = `artes/${slug}`;
  const timestamp = new Date().toISOString();

  if (isLocal && ensureDir) {
    ensureDir(basePath);
    console.log(`📁 Pasta criada: ${basePath}/`);
  }

  // 3. Gerar imagem IA (regras rígidas por layout)
  console.log('🖼️  Gerando imagem IA (regras rígidas A–Q + Lei do Azul #14A8F4)...');
  console.log(`   Grande referência DS: ${REFERENCE_ARTES.join(' + ')}`);
  const imgPrompt = await gerarImagemPrompt(tipoPost, layout, contextoVisual, slug, cidade);
  console.log(`   Zonas livres: ${imageRules.clearZones.length} regra(s) aplicadas`);
  if (contextoVisual?.trim()) console.log(`   Contexto visual: ${contextoVisual.trim().slice(0, 120)}`);
  if (cidade?.trim()) console.log(`   Cidade: ${cidade.trim()}`);
  const imgBuffer = await generateImage(imgPrompt, { tipo: tipoPost, layout, contextoVisual, cidade });
  if (!imgBuffer?.length || imgBuffer.length < 500) {
    throw new Error(`Imagem IA inválida (${imgBuffer?.length || 0} bytes) — verifique API keys`);
  }
  const imageBase64 = imgBuffer.toString('base64');

  console.log(`💾 Salvando fundo.png (${Math.round(imgBuffer.length / 1024)} KB)...`);
  await putBinary(`${basePath}/fundo.png`, imgBuffer, `[SuperAgent] fundo: ${slug}`);

  // 4. Legenda — aprovada pelo humano ou A/B automático (legado)
  let legendaSelecionada;
  let varianteSelecionada;
  let scoreA = null;
  let scoreB = null;

  if (legendaAprovada && legendaAprovada.trim()) {
    console.log('✍️  Legenda pré-aprovada (sem A/B automático)');
    legendaSelecionada  = legendaAprovada.trim();
    varianteSelecionada = 'aprovada';
  } else {
    console.log('✍️  Gerando legendas A/B...');
    const briefingCtx = briefingCompleto || `${headline}\n${subtitulo || ''}`;

    let legendaA = await gerarLegenda('FOMO', briefingCtx, tipoPost);
    let legendaB = await gerarLegenda('aspiracional', briefingCtx, tipoPost);

    scoreA = await scoreLegenda(legendaA);
    scoreB = await scoreLegenda(legendaB);

    if (scoreA < 7) {
      console.log(`⚠️  Score A = ${scoreA} < 7 — reescrevendo...`);
      legendaA = await gerarLegenda('FOMO', briefingCtx, tipoPost);
      scoreA   = await scoreLegenda(legendaA);
    }
    if (scoreB < 7) {
      console.log(`⚠️  Score B = ${scoreB} < 7 — reescrevendo...`);
      legendaB = await gerarLegenda('aspiracional', briefingCtx, tipoPost);
      scoreB   = await scoreLegenda(legendaB);
    }

    varianteSelecionada = scoreA >= scoreB ? 'A' : 'B';
    legendaSelecionada  = scoreA >= scoreB ? legendaA : legendaB;
    console.log(`✅ Legenda ${varianteSelecionada} selecionada (A:${scoreA} B:${scoreB})`);
  }

  // 5. Gerar HTML
  console.log('🏗️  Gerando HTML...');

  const ctaPayload = (ctaVisual || cta || '').trim() || null;

  let html = renderLayout(layout, {
    imageBase64,
    headline,
    subtitulo,
    palavrasAzuis,
    nomePalestrante,
    cargoEmpresa,
    tipoPost,
    cta: ctaPayload,
    ctaVisual: ctaPayload,
  });
  html = wrapWithEditor(html, {
    layout,
    headline,
    slug,
    palavrasAzuis,
    editorState: getLayoutPadraoState(layout) || undefined,
    formato,
  });

  console.log(`📤 ${isLocal ? 'Salvando localmente' : 'Fazendo upload'}: ${slug}`);

  await putFile(`${basePath}/arte.html`, html, `[SuperAgent] arte: ${slug} — layout ${layout}`);

  const arteFullPath = path.join(REPO_ROOT, basePath, 'arte.html');
  const thumbFullPath = path.join(REPO_ROOT, basePath, 'thumb.png');
  try {
    await gerarThumbComposto(arteFullPath, thumbFullPath);
    console.log('📸 thumb composto gerado');
  } catch (e) {
    console.warn(`⚠️  thumb composto falhou (${e.message}) — salvando imagem IA crua`);
    await putBinary(`${basePath}/thumb.png`, imgBuffer, `[SuperAgent] thumb: ${slug}`);
  }

  // index.html individual
  const indexHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:title" content="${headline}">
<title>${headline} — CybersecFEST</title>
<style>body{margin:0;background:#02050A;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;color:#F6F8FF;}
iframe{border:none;width:540px;height:675px;}
a{color:#14A8F4;text-decoration:none;margin-top:16px;display:block;text-align:center;}
</style>
</head>
<body>
<iframe src="arte.html?embed"></iframe>
<a href="../../index.html#arte=${slug}">← Galeria</a>
</body>
</html>`;
  await putFile(`${basePath}/index.html`, indexHtml, `[SuperAgent] index: ${slug}`);

  const ctaResolvido = resolveCtaPill({ cta: ctaPayload, ctaVisual: ctaPayload, tipoPost, layout });

  // 7. Atualizar artes.json
  const artesFile = await getJSON('artes.json');
  const artes     = artesFile ? artesFile.data : [];
  artes.push({
    slug, tipo: tipoPost, headline, palavras_azuis: palavrasAzuis || '',
    subtitulo: subtitulo || '', cidade: cidade || '', formato: formato || 'feed_vertical',
    layout, legenda: legendaSelecionada, legenda_variante: varianteSelecionada,
    contexto_visual: contextoVisual || '',
    ...(ctaResolvido ? { cta_visual: ctaResolvido } : {}),
    publicacao: publicacao === 'backup' ? 'backup' : 'normal',
    ...(propostaId ? { proposta_id: propostaId } : {}),
    ...(angulo ? { angulo_editorial: angulo } : {}),
    image_rules: {
      layout,
      focus: imageRules.focusId,
      focus_en: imageRules.focusEn,
      clear_zones: imageRules.clearZones,
    },
    image_path: `${basePath}/thumb.png`,
    html_path:  `${basePath}/arte.html`,
    created_at: timestamp
  });
  await putJSON('artes.json', artes, `[SuperAgent] artes.json: add ${slug}`, artesFile?.sha);

  // 8. Atualizar historico_recente em temas.json
  const hist = temas.historico_recente || [];
  hist.push({ tipo_post: tipoPost, layout, slug, data: timestamp.slice(0,10) });
  if (hist.length > 20) hist.splice(0, hist.length - 20);
  temas.historico_recente = hist;
  if (!layoutOverride) temas.layout_ciclos = layoutCiclos;
  await putJSON('temas.json', temas, `[SuperAgent] temas.json: rotacao ${layout}`, temasFile.sha);

  console.log(`\n🎉 Arte ${isLocal ? 'salva localmente' : 'publicada'}!`);
  console.log(`   Slug:    ${slug}`);
  console.log(`   Layout:  ${layout}`);
  console.log(`   Legenda: ${varianteSelecionada}${scoreA != null ? ` (A:${scoreA} B:${scoreB})` : ''}`);
  if (isLocal) {
    console.log(`   Galeria: http://localhost:${process.env.PORT || 8765}/`);
    console.log(`   Arquivo: ${REPO_ROOT}/artes/${slug}/`);
  } else {
    console.log(`   URL:     https://cybersecfest-auto.vercel.app/artes/${slug}/`);
  }

  return { slug, layout, tipoPost, varianteSelecionada, scoreA, scoreB };
}

module.exports = { gerarArte };

// Execução direta via CLI (usado pelo GitHub Actions se chamado isoladamente)
if (require.main === module) {
  const args = Object.fromEntries(
    process.argv.slice(2).map(a => a.split('=')).filter(p => p.length === 2)
  );
  gerarArte({
    tipoPost:       args.tipo || 'blog',
    headline:       args.headline || 'Cibersegurança é estratégia',
    subtitulo:      args.subtitulo || '',
    palavrasAzuis:  args.palavras_azuis || '',
    contextoVisual: args.contexto || 'Leader in a dark executive meeting room',
    cidade:         args.cidade || 'BH e SP'
  }).catch(e => { console.error('❌', e.message); process.exit(1); });
}
