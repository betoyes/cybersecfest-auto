'use strict';

const { generateText } = require('./utils/llm.js');
const { buildReferenciaCopyBlock, legendaDentroDoPadrao, REGRAS_LEGENDA } = require('./utils/referencia-copy.js');
const { planoTiposCampanha, getCampanhaPreset, ctaParaTipo, planoFormatosCampanha } = require('./utils/campanha-presets.js');
const {
  loadStore, saveStore, newId, getLoteAguardando, countBanco, BANCO_MAX,
} = require('./utils/propostas-store.js');
const { expandirLegenda } = require('./gerar-propostas.js');
const {
  HEADLINE_PROMPT_BLOCK,
  enforceHeadlineText,
  normalizePalavrasAzuis,
} = require('./utils/headline-rules.js');

async function gerarPecasCampanhaLLM({ objetivo, quantidade, tema, temas, tiposPlanejados, formatosPlanejados }) {
  const preset = getCampanhaPreset(objetivo);
  const n = tiposPlanejados.length;
  const refBlock = buildReferenciaCopyBlock('evento');
  const historico = (temas.historico_recente || []).slice(-5)
    .map(h => `- ${h.tipo_post} (${h.data})`).join('\n') || 'Nenhum ainda.';
  const marcas = temas.evento?.marcas_participantes?.slice(0, 6).join(', ') || 'Itaú, XP, Natura';
  const temaExtra = tema ? `\nBRIEFING DA CAMPANHA (prioridade):\n${tema}\n` : '';

  const pecasSpec = tiposPlanejados.map((tipo, i) => {
    const fmt = formatosPlanejados?.[i] || 'feed_vertical';
    return `Peça ${i + 1}: tipo=${tipo}, formato=${fmt}, CTA sugerido=${ctaParaTipo(tipo, objetivo)}, ângulo sugerido=${preset.angulos[i % preset.angulos.length]}`;
  }).join('\n');

  const system = `Copywriter sênior CybersecFEST. Campanha coesa com ${n} peças DISTINTAS.
Tom aspiracional, FOMO, público C-Level. PROIBIDO clichês de hacking e "O CybersecFEST" no início de headline.`;

  const prompt = `${refBlock}
${temaExtra}
${HEADLINE_PROMPT_BLOCK}

OBJETIVO DA CAMPANHA: ${preset.label} (${objetivo})
Crie EXATAMENTE ${n} peças editoriais DISTINTAS para a campanha CybersecFEST 2026.

PLANO DE TIPOS (siga cada tipo na peça correspondente):
${pecasSpec}

Marcas: ${marcas}
Evitar repetir: ${historico}

RETORNE APENAS JSON:
{
  "propostas": [
    {
      "angulo": "3-6 palavras",
      "tipo_post": "blog|evento|patrocinador|palestrante|cidade",
      "recomendada": false,
      "headline": "máx 10 palavras; use <br> para até 5 linhas",
      "palavras_azuis": "1-3 palavras DA HEADLINE",
      "subtitulo": "15-25 palavras",
      "cta_visual": "máx 4 palavras UPPERCASE",
      "contexto_visual": "cena fotográfica 80-200 palavras",
      "legenda": "${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas corpo + CTA ✅ + hashtags",
      "cidade": "BH e SP"
    }
  ]
}`;

  const raw = await generateText(prompt, system, 0.88, 8192);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('LLM não retornou JSON de campanha');

  const parsed = JSON.parse(match[0]);
  const list = parsed.propostas || [];
  if (!list.length) throw new Error('Campanha sem propostas');

  return list.slice(0, n).map((p, i) => {
    const tipo = tiposPlanejados[i] || p.tipo_post || 'blog';
    const { headline } = enforceHeadlineText(p.headline || '');
    return {
      id: newId('prop'),
      angulo: p.angulo || preset.angulos[i % preset.angulos.length],
      tipo_post: tipo,
      recomendada: !!p.recomendada,
      headline,
      palavras_azuis: normalizePalavrasAzuis(headline, p.palavras_azuis || ''),
      subtitulo: p.subtitulo || '',
      cta_visual: (p.cta_visual || ctaParaTipo(tipo, objetivo)).trim(),
      contexto_visual: p.contexto_visual || '',
      legenda: p.legenda || '',
      cidade: p.cidade || 'BH e SP',
      formato: formatosPlanejados?.[i] || p.formato || 'feed_vertical',
    };
  });
}

async function criarLoteCampanha({ objetivo = 'inscricoes', quantidade = 5, tema = '', temas }) {
  const { data, sha } = await loadStore();

  if (getLoteAguardando(data)) {
    throw new Error('Já existe um lote aguardando aprovação. Revise ou rejeite antes de nova campanha.');
  }
  if (countBanco(data) >= BANCO_MAX) {
    throw new Error(`Banco cheio (${BANCO_MAX}). Consuma reservas antes de nova campanha.`);
  }

  const q = Math.min(Math.max(Number(quantidade) || 5, 3), 10);
  const tiposPlanejados = planoTiposCampanha(objetivo, q);
  const formatosPlanejados = planoFormatosCampanha(q);
  const preset = getCampanhaPreset(objetivo);

  console.log(`📣 Campanha — ${preset.label} · ${q} peças · tipos: [${tiposPlanejados.join(',')}] · formatos: [${formatosPlanejados.join(',')}]`);

  let propostas = await gerarPecasCampanhaLLM({ objetivo, quantidade: q, tema, temas, tiposPlanejados, formatosPlanejados });

  const fora = propostas.filter(p => !legendaDentroDoPadrao(p.legenda));
  if (fora.length) {
    console.log(`⚠️  ${fora.length} legenda(s) fora do padrão — ajustando...`);
    propostas = await Promise.all(propostas.map(async p => {
      if (legendaDentroDoPadrao(p.legenda)) return p;
      return expandirLegenda(p, p.tipo_post || 'blog');
    }));
  }

  let seenRec = false;
  propostas.forEach(p => {
    if (p.recomendada && !seenRec) seenRec = true;
    else p.recomendada = false;
  });
  if (!seenRec) propostas[0].recomendada = true;

  const lote = {
    id: newId('lote'),
    status: 'aguardando_aprovacao',
    modo: 'campanha',
    objetivo,
    quantidade: q,
    tipo_post: tiposPlanejados[0],
    tema_briefing: tema || null,
    criado_em: new Date().toISOString(),
    propostas,
  };

  data.lotes = data.lotes || [];
  data.lotes.push(lote);
  await saveStore(data, sha);

  console.log(`✅ Campanha ${lote.id} — ${propostas.length} rotas aguardando aprovação`);
  return lote;
}

module.exports = { criarLoteCampanha, gerarPecasCampanhaLLM };
