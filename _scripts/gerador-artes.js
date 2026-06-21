// CybersecFEST — Gerador de Artes (autônomo)
// Versão standalone — sem CREAO, sem interação humana
// Roda via GitHub Actions ou chamado pelo pipeline.js
'use strict';

const { getJSON, putFile, putBinary, putJSON, REPO } = require('./utils/github.js');
const { generateText, generateImage }                = require('./utils/llm.js');
const { renderLayout }                               = require('./utils/layouts.js');

const ROTATION = {
  blog:        ['C','M','N'],
  evento:      ['E','L','J'],
  palestrante: ['D','G','K'],
  patrocinador:['F','I','B'],
  cidade:      ['A','H','J']
};

// ── Determinar próximo layout ────────────────────────────────────
function nextLayout(tipoPost, historico) {
  const seq    = ROTATION[tipoPost] || ['C','M','N'];
  const recent = (historico || []).filter(h => h.tipo_post === tipoPost);
  if (!recent.length) return seq[0];
  const last = recent[recent.length - 1].layout;
  const idx  = seq.indexOf(last);
  return seq[(idx + 1) % seq.length];
}

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
  const system = `Você é copywriter sênior do CybersecFEST — evento executivo de cibersegurança do Brasil.
Tom: aspiracional, FOMO, gatilhos de pertencimento. Público: CISOs, CIOs, CTOs, CEOs, VPs.
REGRAS: posts curtos (6-12 linhas). Nunca começar com "O CybersecFEST". Sem clichês técnicos.
Estrutura: gancho → tensão → CybersecFEST como resposta → CTA + link + hashtags (10-15 tags).`;

  const prompt = `Crie uma legenda ${angulo === 'FOMO' ? 'com gancho emocional/urgência (FOMO)' : 'com gancho aspiracional/conquista'} para o seguinte briefing:

${briefing}

Formato: corpo do post + linha em branco + CTA com ✅ + linha em branco + hashtags.
Máximo 12 linhas de corpo.`;

  return generateText(prompt, system, 0.85);
}

// ── Gerar imagem IA com prompt otimizado ─────────────────────────
async function gerarImagemPrompt(briefing, layoutLetter, contextoVisual) {
  const focusMap = {
    A:'top third',B:'left',C:'right third',D:'center-right',E:'right',
    F:'center',G:'center',H:'upper center',I:'left',J:'center',
    K:'center',L:'center',M:'right',N:'right'
  };
  const focus = focusMap[layoutLetter] || 'center';
  return `Dark cinematic professional photography. ${contextoVisual || briefing}.
Subject positioned in the ${focus} of frame. Ultra dark background #02050A.
High contrast dramatic lighting. No text, no logos, no watermarks.
Photorealistic, 8K, executive atmosphere, premium corporate event in Brazil.`;
}

// ── Main: gerar arte completa ─────────────────────────────────────
async function gerarArte({ tipoPost, headline, subtitulo, palavrasAzuis,
  nomePalestrante, cargoEmpresa, contextoVisual, cidade,
  layoutOverride = null, briefingCompleto = null }) {

  console.log(`\n🎨 Gerador de Artes — tipo: ${tipoPost}`);

  // 1. Carregar temas.json
  const temasFile = await getJSON('temas.json');
  if (!temasFile) throw new Error('temas.json não encontrado no repo');
  const temas = temasFile.data;

  // 2. Determinar layout
  const layout = layoutOverride || nextLayout(tipoPost, temas.historico_recente);
  console.log(`📐 Layout selecionado: ${layout}`);

  // 3. Gerar imagem IA
  console.log('🖼️  Gerando imagem IA...');
  const imgPrompt = await gerarImagemPrompt(briefingCompleto || headline, layout, contextoVisual);
  const imgBuffer = await generateImage(imgPrompt);
  const imageBase64 = imgBuffer.toString('base64');

  // 4. Gerar legendas A/B
  console.log('✍️  Gerando legendas A/B...');
  const briefingCtx = briefingCompleto || `${headline}\n${subtitulo || ''}`;

  let legendaA = await gerarLegenda('FOMO', briefingCtx, tipoPost);
  let legendaB = await gerarLegenda('aspiracional', briefingCtx, tipoPost);

  let scoreA = await scoreLegenda(legendaA);
  let scoreB = await scoreLegenda(legendaB);

  // Reescrever se score < 7
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

  // Auto-selecionar legenda com maior score
  const varianteSelecionada = scoreA >= scoreB ? 'A' : 'B';
  const legendaSelecionada  = scoreA >= scoreB ? legendaA : legendaB;
  console.log(`✅ Legenda ${varianteSelecionada} selecionada (A:${scoreA} B:${scoreB})`);

  // 5. Gerar HTML
  console.log('🏗️  Gerando HTML...');
  const html = renderLayout(layout, {
    imageBase64,
    headline,
    subtitulo,
    palavrasAzuis,
    nomePalestrante,
    cargoEmpresa
  });

  // 6. Slug e upload
  const slug      = `${tipoPost}-${Date.now()}`;
  const basePath  = `artes/${slug}`;
  const timestamp = new Date().toISOString();
  console.log(`📤 Fazendo upload: ${slug}`);

  await putFile(`${basePath}/arte.html`, html, `[SuperAgent] arte: ${slug} — layout ${layout}`);
  await putBinary(`${basePath}/thumb.png`, imgBuffer, `[SuperAgent] thumb: ${slug}`);

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
<a href="/">← Galeria</a>
</body>
</html>`;
  await putFile(`${basePath}/index.html`, indexHtml, `[SuperAgent] index: ${slug}`);

  // 7. Atualizar artes.json
  const artesFile = await getJSON('artes.json');
  const artes     = artesFile ? artesFile.data : [];
  artes.push({
    slug, tipo: tipoPost, headline, palavras_azuis: palavrasAzuis || '',
    subtitulo: subtitulo || '', cidade: cidade || '', formato: 'feed_vertical',
    layout, legenda: legendaSelecionada, legenda_variante: varianteSelecionada,
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
  await putJSON('temas.json', temas, `[SuperAgent] temas.json: rotacao ${layout}`, temasFile.sha);

  console.log(`\n🎉 Arte publicada!`);
  console.log(`   Slug:    ${slug}`);
  console.log(`   Layout:  ${layout}`);
  console.log(`   Legenda: ${varianteSelecionada} (score ${Math.max(scoreA,scoreB)}/10)`);
  console.log(`   URL:     https://cybersecfest-auto.vercel.app/artes/${slug}/`);

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
