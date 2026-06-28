'use strict';

/**
 * Gerador de Campanha — CYBERSEC.CAST
 * Equivalente ao gerar-campanha.js do CybersecFEST, mas com:
 * - Tipos CAST: episodio | convidado | insight
 * - Objetivos: patrocinadores | engajamento | temporada
 * - Tom: intelectual, íntimo, provocador (podcast executivo C-Level)
 * - Store isolado: propostas-cast.json
 * - Sem campo "cidade" (podcast não tem localização fixa)
 */

require('./load-env.js');

const { generateText }  = require('./utils/llm.js');
const {
  loadStore, saveStore, newId, getLoteAguardando, countBanco, BANCO_MAX,
} = require('./utils/propostas-store-cast.js');
const {
  enforceHeadlineText,
  normalizePalavrasAzuis,
} = require('./utils/headline-rules.js');

const CAST_HEADLINE_PROMPT_BLOCK = `REGRAS OBRIGATÓRIAS DE HEADLINE (CAST):
- Máximo 10 palavras no total (contagem única, mesmo com quebras)
- Quebra visual: até 5 linhas com <br> — padrão: "Decisões que<br>definem<br>o futuro"
- Nunca começa com "O CyberSec.CAST" ou "O CYBERSEC.CAST"
- palavras_azuis: 1–3 palavras QUE EXISTEM LITERALMENTE na headline, separadas por vírgula (destaque roxo #6366f1 na arte)`;

// ── Presets de campanha CAST ─────────────────────────────────────

const CAST_CAMPANHA_PRESETS = {
  patrocinadores: {
    label: 'Captação de Patrocinadores',
    angulos: ['ROI em visibilidade', 'Acesso ao C-Level', 'Co-autoria de conteúdo', 'Autoridade no setor', 'Diferenciação de marca'],
    tipos_base: ['insight', 'convidado', 'episodio'],
  },
  engajamento: {
    label: 'Engajamento de Audiência',
    angulos: ['Provocação intelectual', 'Bastidores da decisão', 'Lição de crise real', 'Tendência não óbvia', 'Insight de carreira'],
    tipos_base: ['episodio', 'insight', 'convidado'],
  },
  temporada: {
    label: 'Lançamento de Temporada',
    angulos: ['Novo começo', 'O que vem por aí', 'Convidados confirmados', 'Missão da temporada', 'Por que ouvir agora'],
    tipos_base: ['episodio', 'convidado', 'insight'],
  },
};

function getCastCampanhaPreset(objetivo) {
  return CAST_CAMPANHA_PRESETS[objetivo] || CAST_CAMPANHA_PRESETS.engajamento;
}

function planoTiposCastCampanha(objetivo, quantidade) {
  const preset = getCastCampanhaPreset(objetivo);
  const base = preset.tipos_base;
  const tipos = [];
  for (let i = 0; i < quantidade; i++) tipos.push(base[i % base.length]);
  return tipos;
}

function ctaParaTipoCast(tipo, objetivo) {
  const mapa = {
    episodio:  { patrocinadores: 'PATROCINE', engajamento: 'OUÇA AGORA', temporada: 'NOVA TEMPORADA' },
    convidado: { patrocinadores: 'SEJA PARCEIRO', engajamento: 'CONHEÇA O CONVIDADO', temporada: 'NOVO CONVIDADO' },
    insight:   { patrocinadores: 'FALE CONOSCO', engajamento: 'SAIBA MAIS', temporada: 'EM BREVE' },
  };
  return mapa[tipo]?.[objetivo] || 'OUÇA AGORA';
}

// ── Validação de legenda (espelha REGRAS_LEGENDA do FEST) ────────

const CAST_REGRAS_LEGENDA = { linhasCorpoIdeal: [7, 12], linhasCorpoMax: 15, charsMin: 300, charsMax: 2200 };

function legendaDentroDoPadrao(legenda) {
  const linhas = (legenda || '').split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length;
  const chars  = (legenda || '').length;
  return chars >= CAST_REGRAS_LEGENDA.charsMin
    && chars <= CAST_REGRAS_LEGENDA.charsMax
    && linhas >= CAST_REGRAS_LEGENDA.linhasCorpoIdeal[0]
    && linhas <= CAST_REGRAS_LEGENDA.linhasCorpoMax;
}

async function expandirLegendaCast(proposta, tipo) {
  const system = `Você é produtor editorial sênior do CYBERSEC.CAST — podcast executivo de cibersegurança.
Tom: intelectual, íntimo, provocador. Público: CISOs, CIOs, CTOs, CEOs.`;
  const prompt = `Reescreva a legenda abaixo para o tipo "${tipo}" do CYBERSEC.CAST, mantendo o mesmo ângulo mas com ${CAST_REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${CAST_REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas de corpo + CTA ✅ + hashtags (10-15).

HEADLINE: ${proposta.headline}
ÂNGULO: ${proposta.angulo}
LEGENDA ORIGINAL:
${proposta.legenda}

Retorne APENAS a legenda reescrita, sem explicações.`;
  const nova = await generateText(prompt, system, 0.85, 2048);
  return { ...proposta, legenda: nova.trim() };
}

// ── Gerador principal de campanha CAST ──────────────────────────

async function gerarPecasCampanhaLLMCast({ objetivo, quantidade, tema, temas, tiposPlanejados }) {
  const preset = getCastCampanhaPreset(objetivo);
  const n = tiposPlanejados.length;
  const historico = (temas.historico_recente || []).slice(-5)
    .map(h => `- ${h.tipo_post} (${h.data})`).join('\n') || 'Nenhum ainda.';
  const temasGrade = (temas.temas_grade || []).slice(0, 8).join(', ');
  const temaExtra = tema ? `\nBRIEFING DA CAMPANHA (prioridade máxima):\n${tema}\n` : '';

  const pecasSpec = tiposPlanejados.map((tipo, i) => {
    const angulo = preset.angulos[i % preset.angulos.length];
    const cta    = ctaParaTipoCast(tipo, objetivo);
    return `Peça ${i + 1}: tipo=${tipo}, CTA sugerido="${cta}", ângulo sugerido="${angulo}"`;
  }).join('\n');

  const system = `Produtor editorial sênior do CYBERSEC.CAST — podcast executivo de cibersegurança.
Objetivo desta campanha: ${preset.label}.
Tom: intelectual, íntimo, provocador. Público: CISOs, CIOs, CTOs, CEOs, VPs.
Crie ${n} peças DISTINTAS e coesas. PROIBIDO: clichês de hacking, "O CYBERSEC.CAST" no início da headline, tom sensacionalista.`;

  const prompt = `${temaExtra}
${CAST_HEADLINE_PROMPT_BLOCK}

OBJETIVOS DA CAMPANHA: ${preset.label} (${objetivo})
TEMAS DA GRADE: ${temasGrade}
Evitar repetir: ${historico}

PLANO DE PEÇAS (siga cada tipo na ordem):
${pecasSpec}

Crie EXATAMENTE ${n} peças editoriais DISTINTAS para a campanha CYBERSEC.CAST.

RETORNE APENAS JSON válido (sem markdown):
{
  "propostas": [
    {
      "angulo": "3-6 palavras",
      "tipo_post": "episodio|convidado|insight",
      "recomendada": false,
      "headline": "máx 10 palavras, impacto intelectual; use <br> para quebras",
      "palavras_azuis": "1-3 palavras DA HEADLINE para destacar",
      "subtitulo": "1 frase completa, 12-20 palavras",
      "cta_visual": "máx 4 palavras UPPERCASE. Ex: OUÇA AGORA, EP 42, NOVO EPISÓDIO",
      "contexto_visual": "cena fotográfica: estúdio escuro, iluminação indigo/violet, quem está na cena, SEM texto na imagem",
      "legenda": "${CAST_REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${CAST_REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas de corpo + CTA ✅ mencionando CYBERSEC.CAST + 10-15 hashtags"
    }
  ]
}`;

  const raw = await generateText(prompt, system, 0.88, 8192);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('LLM não retornou JSON de campanha CAST');

  const parsed = JSON.parse(match[0]);
  const list = parsed.propostas || [];
  if (!list.length) throw new Error('Campanha CAST sem propostas');

  return list.slice(0, n).map((p, i) => {
    const tipo = tiposPlanejados[i] || p.tipo_post || 'episodio';
    const { headline } = enforceHeadlineText(p.headline || '');
    return {
      id:             newId('cast-prop'),
      angulo:         p.angulo || preset.angulos[i % preset.angulos.length],
      tipo_post:      tipo,
      recomendada:    !!p.recomendada,
      headline,
      palavras_azuis: normalizePalavrasAzuis(headline, p.palavras_azuis || ''),
      subtitulo:      p.subtitulo || '',
      cta_visual:     (p.cta_visual || ctaParaTipoCast(tipo, objetivo)).trim(),
      contexto_visual:p.contexto_visual || '',
      legenda:        p.legenda || '',
    };
  });
}

/**
 * Cria um lote de campanha CAST e salva em propostas-cast.json.
 * @param {object} opts
 * @param {string} opts.objetivo   — patrocinadores | engajamento | temporada
 * @param {number} opts.quantidade — 3–10
 * @param {string} opts.tema       — briefing livre (opcional)
 * @param {object} opts.temas      — conteúdo de _brands/cyberseccast/temas.json
 */
async function criarLoteCampanhaCast({ objetivo = 'engajamento', quantidade = 5, tema = '', temas }) {
  const { data, sha } = await loadStore();

  if (getLoteAguardando(data)) {
    throw new Error('Já existe um lote CAST aguardando aprovação. Revise ou rejeite antes de nova campanha.');
  }
  if (countBanco(data) >= BANCO_MAX) {
    throw new Error(`Banco CAST cheio (${BANCO_MAX}). Consuma reservas antes de nova campanha.`);
  }

  const q = Math.min(Math.max(Number(quantidade) || 5, 3), 10);
  const tiposPlanejados = planoTiposCastCampanha(objetivo, q);
  const preset = getCastCampanhaPreset(objetivo);

  console.log(`\n📣 CAST Campanha — ${preset.label} · ${q} peças · tipos: [${tiposPlanejados.join(',')}]`);

  let propostas = await gerarPecasCampanhaLLMCast({ objetivo, quantidade: q, tema, temas, tiposPlanejados });

  // Expandir legendas fora do padrão
  const fora = propostas.filter(p => !legendaDentroDoPadrao(p.legenda));
  if (fora.length) {
    console.log(`⚠️  CAST: ${fora.length} legenda(s) fora do padrão — ajustando...`);
    propostas = await Promise.all(propostas.map(async p => {
      if (legendaDentroDoPadrao(p.legenda)) return p;
      return expandirLegendaCast(p, p.tipo_post || 'episodio');
    }));
  }

  // Garantir exatamente uma recomendada
  let seenRec = false;
  propostas.forEach(p => {
    if (p.recomendada && !seenRec) seenRec = true;
    else p.recomendada = false;
  });
  if (!seenRec) propostas[0].recomendada = true;

  const lote = {
    id:            newId('cast-lote'),
    status:        'aguardando_aprovacao',
    modo:          'campanha',
    objetivo,
    quantidade:    q,
    tipo_post:     tiposPlanejados[0],
    tema_briefing: tema || null,
    criado_em:     new Date().toISOString(),
    propostas,
  };

  data.lotes = data.lotes || [];
  data.lotes.push(lote);
  await saveStore(data, sha);

  console.log(`✅ CAST Campanha ${lote.id} — ${propostas.length} rotas aguardando aprovação`);
  return lote;
}

module.exports = { criarLoteCampanhaCast, getCastCampanhaPreset, planoTiposCastCampanha, ctaParaTipoCast };
