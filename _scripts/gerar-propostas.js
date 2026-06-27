'use strict';

const { generateText } = require('./utils/llm.js');
const {
  FEST_AUDIENCIA_SYSTEM,
  FEST_PATROCINADORES_SYSTEM,
  FEST_CONVITE_SYSTEM,
} = require('../_agents/fest-estrategista/system-prompt.js');
const { FEST_KNOWLEDGE } = require('../_agents/fest-estrategista/knowledge.js');
const { buildReferenciaCopyBlock, getMinLegendaChars, legendaDentroDoPadrao, contarLinhasCorpo, REGRAS_LEGENDA } = require('./utils/referencia-copy.js');
const { suggestCtaExamples } = require('./utils/cta-pill.js');
const {
  HEADLINE_PROMPT_BLOCK,
  enforceHeadlineText,
  normalizePalavrasAzuis,
} = require('./utils/headline-rules.js');
const {
  loadStore, saveStore, newId, getLoteAguardando, countBanco, BANCO_MAX,
} = require('./utils/propostas-store.js');

function contarCharsLegenda(legenda) {
  return (legenda || '').trim().length;
}

async function expandirLegenda(proposta, tipoPost) {
  const refBlock = buildReferenciaCopyBlock(tipoPost);
  const linhasAtual = contarLinhasCorpo(proposta.legenda);
  const system = `Copywriter sênior CybersecFEST. Ajuste legendas fora do padrão mediano (6–12 linhas de corpo). Mantenha o ângulo e headline. Tom executivo, FOMO, frases curtas — uma ideia por linha.`;
  const prompt = `${refBlock}

LEGENDA ATUAL (${linhasAtual} linhas corpo — meta ${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]}):
"""
${proposta.legenda}
"""

Ângulo: ${proposta.angulo}
Headline: ${proposta.headline}

Reescreva no padrão mediano: ${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas de corpo, frases curtas, CTA com ✅, 10–15 hashtags.
Retorne APENAS o texto da legenda.`;

  const expandida = await generateText(prompt, system, 0.75, 2048);
  return { ...proposta, legenda: expandida.trim() };
}

async function gerarRotasLLM(tipoPost, temas, temaLivre = '', opts = {}) {
  const minChars = opts.minChars ?? getMinLegendaChars();
  const refBlock = buildReferenciaCopyBlock(tipoPost);
  const historico = (temas.historico_recente || [])
    .slice(-5)
    .map(h => `- ${h.tipo_post} (${h.data})`)
    .join('\n') || 'Nenhum ainda.';

  const temasGrade = temas.evento?.temas_grade?.join(', ') || FEST_KNOWLEDGE.temas_grade.join(', ');
  const marcas     = temas.evento?.marcas_participantes?.slice(0, 6).join(', ')
    || FEST_KNOWLEDGE.edicoes_2026.flatMap(e => e.empresas_anteriores).join(', ');

  // Persona correta por objetivo
  const objetivo = opts.objetivo || 'audiencia';
  const system = objetivo === 'patrocinadores'
    ? FEST_PATROCINADORES_SYSTEM
    : objetivo === 'convite'
      ? FEST_CONVITE_SYSTEM
      : FEST_AUDIENCIA_SYSTEM;

  // Briefing do usuário no TOPO — prioridade absoluta
  const temaHeader = temaLivre
    ? `🎯 BRIEFING DO USUÁRIO — PRIORIDADE ABSOLUTA:\n"${temaLivre}"\nTODAS as 3 propostas DEVEM tratar exclusivamente deste tema. Ignore sugestões genéricas abaixo que conflitem com este briefing.\n\n`
    : '';
  const temaExtra = ''; // mantido vazio — temaHeader carrega o briefing no topo

  const extraLong = opts.forceLong
    ? `\nATENÇÃO: tentativa anterior fora do padrão. Cada legenda DEVE ter ${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas de corpo — calibre pelos exemplos ouro abaixo.\n`
    : '';

  const ctaExemplos = suggestCtaExamples(tipoPost).join(', ');

  const prompt = `${temaHeader}${refBlock}

${HEADLINE_PROMPT_BLOCK}

Crie EXATAMENTE 3 rotas editoriais DISTINTAS para um post do CybersecFEST 2026.
Cada rota deve ter um ÂNGULO diferente (ex.: FOMO de exclusividade, confraria vs palco, ROI para patrocinador, risco estratégico, etc.).
${temaExtra}${extraLong}
CONTEXTO:
- Tipo editorial interno: ${tipoPost}
- Edições: BH (Nov 2026) e SP (Out 2026)
- Marcas: ${marcas}
- Grade: ${temasGrade}
- Evitar repetir: ${historico}

Marque UMA proposta como "recomendada": true (as outras false).

RETORNE APENAS JSON válido (sem markdown):
{
  "propostas": [
    {
      "angulo": "nome curto do ângulo (3-6 palavras)",
      "recomendada": false,
      "headline": "máx 10 palavras, impacto manifesto; use <br> para até 5 linhas se couber",
      "palavras_azuis": "1-3 palavras DA HEADLINE, vírgula",
      "subtitulo": "1 frase completa de convite, 15-25 palavras",
      "cta_visual": "opcional — mensagem curta para pill CTA na arte (máx 4 palavras, UPPERCASE). Exemplos: ${ctaExemplos}. Use quando couber inscrição, patrocínio ou urgência. Omita ou string vazia se não aplicável.",
      "contexto_visual": "descrição DETALHADA da cena fotográfica (80-200 palavras): quem/o quê, onde (cidade + marco se pedido), luz, atmosfera — SEM texto na cena. Se o briefing pedir ponto turístico, cite o monumento explicitamente (ex: MASP na Av. Paulista, Copan, Ibirapuera, Theatro Municipal)",
      "legenda": "LEGENDA pronta para LinkedIn — padrão mediano dos exemplos ouro (${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas de corpo, máx. ${REGRAS_LEGENDA.linhasCorpoMax}). Estrutura: gancho 2–3 linhas → tensão 3–5 linhas → CybersecFEST como resposta 2–3 linhas → linha vazia → CTA ✅ → linha vazia → 10–15 hashtags",
      "cidade": "BH e SP"
    }
  ]
}`;

  const raw = await generateText(prompt, system, 0.88, 4096);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('LLM não retornou JSON de propostas: ' + raw.slice(0, 200));

  const parsed = JSON.parse(match[0]);
  const list = parsed.propostas || parsed.rotas;
  if (!Array.isArray(list) || list.length < 1) throw new Error('JSON sem array propostas');

  const propostas = list.slice(0, 3).map((p, i) => {
    const { headline } = enforceHeadlineText(p.headline || '');
    return {
      id: newId('prop'),
      angulo: p.angulo || `Rota ${i + 1}`,
      recomendada: !!p.recomendada,
      headline,
      palavras_azuis: normalizePalavrasAzuis(headline, p.palavras_azuis || ''),
      subtitulo: p.subtitulo || '',
      cta_visual: (p.cta_visual || '').trim(),
      contexto_visual: p.contexto_visual || '',
      legenda: p.legenda || '',
      cidade: p.cidade || 'BH e SP',
    };
  });

  let seenRec = false;
  propostas.forEach(p => {
    if (p.recomendada && !seenRec) seenRec = true;
    else p.recomendada = false;
  });
  if (!seenRec) propostas[0].recomendada = true;

  return propostas;
}

async function gerarRotasComValidacao(tipoPost, temas, temaLivre = '', objetivo = 'audiencia') {
  const minChars = getMinLegendaChars();
  console.log(`   Calibração copy: ${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas corpo · exemplos artes.json + SKILL`);

  let propostas = await gerarRotasLLM(tipoPost, temas, temaLivre, { minChars, objetivo });
  let fora = propostas.filter(p => !legendaDentroDoPadrao(p.legenda));

  if (fora.length) {
    console.log(`⚠️  ${fora.length} legenda(s) fora do padrão — regenerando lote...`);
    propostas = await gerarRotasLLM(tipoPost, temas, temaLivre, { forceLong: true, minChars, objetivo });
    fora = propostas.filter(p => !legendaDentroDoPadrao(p.legenda));
  }

  if (fora.length) {
    console.log(`⚠️  Ajustando ${fora.length} legenda(s) individualmente...`);
    propostas = await Promise.all(propostas.map(async p => {
      if (legendaDentroDoPadrao(p.legenda)) return p;
      return expandirLegenda(p, tipoPost);
    }));
  }

  propostas.forEach(p => {
    console.log(`   · ${p.angulo}: ${contarLinhasCorpo(p.legenda)} linhas · ${contarCharsLegenda(p.legenda)} chars`);
  });
  return propostas;
}

/**
 * Gera lote com 3 propostas de texto e salva em propostas.json
 */
async function criarLotePropostas({ tipoPost, tema = '', temas, objetivo = 'audiencia' }) {
  const { data, sha } = await loadStore();

  if (getLoteAguardando(data)) {
    throw new Error('Já existe um lote aguardando aprovação. Revise as propostas pendentes.');
  }
  if (countBanco(data) >= BANCO_MAX) {
    throw new Error(`Banco cheio (${BANCO_MAX}). Consuma ou gere visual de reservas antes de novas propostas.`);
  }

  console.log('📝 Fase 1 — gerando 3 rotas editoriais (só texto)...');
  const propostas = await gerarRotasComValidacao(tipoPost, temas, tema, objetivo);

  const lote = {
    id: newId('lote'),
    status: 'aguardando_aprovacao',
    tipo_post: tipoPost,
    objetivo,
    tema_briefing: tema || null,
    criado_em: new Date().toISOString(),
    propostas,
  };

  data.lotes = data.lotes || [];
  data.lotes.push(lote);
  await saveStore(data, sha);

  console.log(`✅ Lote ${lote.id} — ${propostas.length} propostas aguardando aprovação`);
  return lote;
}

module.exports = { criarLotePropostas, gerarRotasLLM, expandirLegenda };
