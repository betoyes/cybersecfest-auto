'use strict';

/**
 * Gerador de propostas editoriais para o CYBERSEC.CAST.
 * Mesmo fluxo do gerar-propostas.js mas com:
 * - Voz editorial do podcast (intelectual, íntimo, provocador)
 * - Tipos: episodio | convidado | insight
 * - Cenário visual: estúdio de podcast, entrevistas executivas
 * - Store isolado: propostas-cast.json
 */

require('./load-env.js');

const { generateText } = require('./utils/llm.js');
const {
  enforceHeadlineText,
  normalizePalavrasAzuis,
} = require('./utils/headline-rules.js');
const {
  CAST_AUDIENCIA_SYSTEM,
  CAST_PATROCINADORES_SYSTEM,
  CAST_TEMPORADA_SYSTEM,
} = require('../_agents/cast-estrategista/system-prompt.js');

// Versão CAST do bloco de regras de headline — cor roxo/indigo (#6366f1) em vez de azul FEST
const CAST_HEADLINE_PROMPT_BLOCK = `REGRAS OBRIGATÓRIAS DE HEADLINE (CAST):
- Máximo 10 palavras no total (contagem única, mesmo com quebras)
- Quebra visual: até 5 linhas com <br> — padrão: "Decisões que<br>definem<br>o futuro"
- Nunca começa com "O CyberSec.CAST" ou "O CYBERSEC.CAST"
- palavras_azuis: 1–3 palavras QUE EXISTEM LITERALMENTE na headline, separadas por vírgula (destaque roxo #6366f1 na arte)

REGRAS OBRIGATÓRIAS DE LEGENDA:
- PROIBIDO inventar nomes de pessoas, empresas, episódios, estatísticas ou casos específicos
- PROIBIDO referenciar episódios com número ("Ep. 12", "episódio dessa semana") — o número não existe ainda
- PROIBIDO frases como "conversei com um CISO que...", "nossa convidada revelou que...", "em nosso último episódio..."
- A legenda DEVE ser conceitual e provocativa — fala sobre uma TENSÃO ou DILEMA universal do executivo de segurança, sem ancorar em fato que o autor não conhece
- Use "você" diretamente: provocar o leitor, não narrar um episódio fictício
- O CYBERSEC.CAST pode ser citado no final como chamada, nunca como âncora de um fato inventado`;
const {
  loadStore, saveStore, newId, getLoteAguardando, countBanco, BANCO_MAX,
} = require('./utils/propostas-store-cast.js');
const {
  legendaDentroDoPadrao,
  contarLinhasCorpo,
  contarChars,
  getMinLegendaChars,
  buildReferenciaCopyBlock,
  REGRAS_LEGENDA,
} = require('./utils/referencia-copy-cast.js');

// Exemplos ouro de legenda do CYBERSEC.CAST
// REGRA: sem nomes, sem episódios numerados, sem casos fictícios — sempre conceitual e provocativo
const EXEMPLOS_LEGENDA_CAST = `
EXEMPLO 1 (episódio — ângulo: dilema universal):
Tem uma pergunta que todo CISO evita.

Não por insegurança.
Por responsabilidade.

Quando o incidente acontece — e ele vai acontecer —
o que você diria ao board?

Não existe resposta certa.
Existe o executivo que já pensou nisso antes.
E o que vai improvisar na hora errada.

Esse é o tipo de conversa que só acontece no CYBERSEC.CAST.

✅ Novo episódio disponível no Spotify e YouTube.

#cibersegurança #CISO #liderança #podcast #cyberseccast #segurançadainformação #gestãoderiscos #tecnologia #executivos #brasil

---
EXEMPLO 2 (convidado — ângulo: tensão de carreira):
Segurança é a única área onde você é avaliado pelo que NÃO aconteceu.

Sem incidente, sem aplauso.
Com incidente, toda culpa é sua.

Esse é o paradoxo de liderar um time de cibersegurança no Brasil em 2025.

Como você constrói autoridade num ambiente assim?
Como você convence o board antes do breach, não depois?

É sobre isso que o CYBERSEC.CAST existe para conversar.

✅ Ouça agora no CYBERSEC.CAST.

#cibersegurança #zerotrust #podcast #CISO #segurança #liderança #brasil #cyberseccast
`.trim();

// Configurações por objetivo
const OBJETIVO_CONFIG = {
  audiencia: {
    label:      'Engajamento de Audiência',
    publicoAlvo:'CISOs, CIOs, CTOs, CEOs, VPs de Tecnologia — os OUVINTES do podcast.',
    missao:     'Gerar conteúdo que faça o ouvinte parar o scroll e sentir que a conversa é para ele.',
    angulos:    ['Provocação intelectual', 'Dilema universal do CISO', 'Tensão de carreira em segurança', 'Insight contra-intuitivo', 'Tendência não óbvia'],
    ctasSuger:  'OUÇA AGORA, NOVO EPISÓDIO, OUÇA GRÁTIS, DESCUBRA',
    legendaTom: 'Fala diretamente com o executivo de segurança — íntimo, como se fosse uma conversa exclusiva entre pares. SEM referenciar episódios, nomes ou casos fictícios.',
  },
  patrocinadores: {
    label:      'Captação de Patrocinadores',
    publicoAlvo:'Empresas de tecnologia e segurança que buscam posicionamento de marca junto ao C-Level.',
    missao:     'Mostrar o CYBERSEC.CAST como canal premium de acesso ao tomador de decisão — ROI em visibilidade, credibilidade e relacionamento.',
    angulos:    ['ROI em visibilidade', 'Acesso direto ao C-Level', 'Co-autoria de conteúdo', 'Autoridade no setor', 'Diferenciação de marca'],
    ctasSuger:  'PATROCINE, SEJA PARCEIRO, FALE CONOSCO, RESERVE SUA VAGA',
    legendaTom: 'Fala com o diretor de marketing ou vendas da empresa parceira — tom consultivo, orientado a resultado e diferenciação.',
  },
  temporada: {
    label:      'Lançamento de Temporada',
    publicoAlvo:'Audiência atual e novos ouvintes que ainda não conhecem o CYBERSEC.CAST.',
    missao:     'Gerar antecipação, curiosidade e senso de que algo importante está chegando.',
    angulos:    ['Novo começo', 'O que vem por aí', 'Convidados confirmados', 'Missão da temporada', 'Por que ouvir agora'],
    ctasSuger:  'NOVA TEMPORADA, EM BREVE, CONHEÇA, ASSINE JÁ',
    legendaTom: 'Tom de revelação — como um bastidor exclusivo que o leitor recebe antes de todo mundo.',
  },
};

function getCastObjetivoConfig(objetivo) {
  return OBJETIVO_CONFIG[objetivo] || OBJETIVO_CONFIG.audiencia;
}

function buildCastSystemPrompt(objetivo) {
  if (objetivo === 'patrocinadores') return CAST_PATROCINADORES_SYSTEM;
  if (objetivo === 'temporada')      return CAST_TEMPORADA_SYSTEM;
  return CAST_AUDIENCIA_SYSTEM;
}

async function gerarRotasLLM(tipoPost, temas, temaLivre = '', opts = {}, historicoArtes = '') {
  const objetivo   = opts.objetivo || 'audiencia';
  const cfg        = getCastObjetivoConfig(objetivo);
  const systemPrompt = buildCastSystemPrompt(objetivo);

  const historico = (temas.historico_recente || [])
    .slice(-5)
    .map(h => `- ${h.tipo_post} (${h.data})`)
    .join('\n') || 'Nenhum ainda.';

  const temasGrade = (temas.temas_grade || []).slice(0, 8).join(', ') || 'Zero Trust, IAM, Resposta a Incidentes, IA na Segurança, LGPD, Governança de Riscos';

  // Quando há briefing, ele vai no TOPO do prompt — antes de qualquer instrução genérica
  const temaHeader = temaLivre
    ? `🎯 BRIEFING DO USUÁRIO — PRIORIDADE ABSOLUTA:\n"${temaLivre}"\nTODAS as 3 propostas DEVEM tratar exclusivamente deste tema. Ignore qualquer sugestão genérica abaixo que conflite com este briefing.\n\n`
    : '';
  const temaExtra = ''; // mantido vazio — temaHeader já carrega o briefing no topo

  const extraLong = opts.forceLong
    ? `\nATENÇÃO: tentativa anterior fora do padrão. Cada legenda DEVE ter ${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas de corpo.\n`
    : '';

  const tipoPtBR = tipoPost === 'episodio' ? 'novo episódio'
    : tipoPost === 'convidado' ? 'apresentação de convidado'
    : 'post de insight';

  const isComercial = objetivo === 'patrocinadores';

  const legendaInstrucao = isComercial
    ? `Estrutura obrigatória: 1) Gancho com tensão de mercado (2–3 linhas) → 2) Insight sobre como decisões B2B realmente acontecem (3–4 linhas) → 3) Valor de presença em contextos de confiança (2–3 linhas) → 4) Conexão com CyberSec.CAST / CyberSecFest / I AM TECH DAY (1–2 linhas) → 5) Diferencial da plataforma (1–2 linhas) → 6) CTA institucional discreto ✅ (1 linha) → hashtags (4–8).`
    : `Estrutura: gancho 2–3 linhas → desenvolvimento 4–6 linhas → posicionamento CYBERSEC.CAST 1–2 linhas → CTA ✅ → hashtags (10–15)`;

  const refBlock = buildReferenciaCopyBlock(objetivo, { maxArtes: 2, maxSkill: 2 });
  const historicoArtesLine = historicoArtes
    ? `\nArtes aprovadas recentemente (evite repetir tom/estrutura): ${historicoArtes}`
    : '';

  const prompt = isComercial
    ? `${temaHeader}${CAST_HEADLINE_PROMPT_BLOCK}

${refBlock}

Crie EXATAMENTE 3 posts de LinkedIn DISTINTOS para CAPTAÇÃO DE PATROCÍNIO do CyberSec.CAST.
${extraLong}
Cada post deve usar um tipo diferente de abordagem:
- Rota A: Post de tese comercial (tensão de mercado → insight → valor de contexto → CTA discreto)
- Rota B: Post sobre público decisor e relacionamento B2B (quem assiste → como percepção se forma → presença de marca → CTA)
- Rota C: Post sobre ecossistema (CyberSecFest + I AM TECH DAY + CAST como plataforma integrada → CTA)

Histórico recente (evite repetir ângulos): ${historico}${historicoArtesLine}

Marque UMA rota como "recomendada": true.

RETORNE APENAS JSON válido (sem markdown):
{
  "propostas": [
    {
      "angulo": "nome do ângulo (3-6 palavras)",
      "recomendada": false,
      "headline": "máx 10 palavras; impacto estratégico; use <br> para quebra natural",
      "palavras_azuis": "1-3 palavras DA HEADLINE para destacar, vírgula",
      "subtitulo": "1 frase, 12-20 palavras — a tese central para o patrocinador",
      "cta_visual": "máx 4 palavras UPPERCASE. Ex: SEJA PARCEIRO, PATROCINE, FALE CONOSCO, RESERVE SUA VAGA",
      "contexto_visual": "cena do estúdio CAST: ambiente executivo escuro, iluminação indigo/violet, mesa de entrevista ou reunião de lideranças — SEM texto visível, SEM produto de marca",
      "layout_sugerido": "letra A–Q: use C/M/N para conteúdo gráfico/abstrato, D/G/K/F se há pessoa ou convidado, H/L/J para insight ou dado visual",
      "legenda": "Post completo para LinkedIn. ${legendaInstrucao} Frases curtas. Uma ideia por linha. Tom institucional, consultivo. Sem anúncio. Sem escassez. Sem métricas de vaidade."
    }
  ]
}`
    : `${temaHeader}${CAST_HEADLINE_PROMPT_BLOCK}

${refBlock}

Crie EXATAMENTE 3 rotas editoriais DISTINTAS para um post de ${tipoPtBR} do CYBERSEC.CAST.
OBJETIVO: ${cfg.label} — ${cfg.missao}
Ângulos sugeridos: ${cfg.angulos.join(', ')}.
CTAs visuais adequados: ${cfg.ctasSuger}.
Tom da legenda: ${cfg.legendaTom}
${extraLong}
CONTEXTO DO PODCAST:
- Temas da grade: ${temasGrade}
- Histórico recente (evitar repetir ângulos): ${historico}${historicoArtesLine}

Marque UMA proposta como "recomendada": true.

RETORNE APENAS JSON válido (sem markdown):
{
  "propostas": [
    {
      "angulo": "nome do ângulo (3-6 palavras)",
      "recomendada": false,
      "headline": "máx 10 palavras, impacto intelectual; use <br> para quebras se couber",
      "palavras_azuis": "1-3 palavras DA HEADLINE para destacar, vírgula",
      "subtitulo": "1 frase completa, 12-20 palavras",
      "cta_visual": "máx 4 palavras UPPERCASE. Opções: ${cfg.ctasSuger}",
      "contexto_visual": "cena fotográfica do podcast: ambiente (estúdio escuro, vidro, mesa profissional), iluminação (indigo LED, violet rim), quem (host, convidado, mesa de entrevista) — SEM texto na cena",
      "layout_sugerido": "letra A–Q: use C/M/N para conteúdo gráfico/abstrato, D/G/K/F se há pessoa ou convidado, H/L/J para insight ou dado visual",
      "legenda": "LEGENDA pronta para LinkedIn/Instagram — ${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas de corpo, frases curtas, uma ideia por linha. ${legendaInstrucao}"
    }
  ]
}`;

  const raw = await generateText(prompt, systemPrompt, 0.88, 4096);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('LLM não retornou JSON de propostas CAST: ' + raw.slice(0, 200));

  const parsed = JSON.parse(match[0]);
  const list = parsed.propostas || parsed.rotas;
  if (!Array.isArray(list) || list.length < 1) throw new Error('JSON sem array propostas');

  const propostas = list.slice(0, 3).map((p, i) => {
    const { headline } = enforceHeadlineText(p.headline || '');
    return {
      id: newId('cast-prop'),
      tipo_post: tipoPost,
      angulo: p.angulo || `Rota ${i + 1}`,
      recomendada: !!p.recomendada,
      headline,
      palavras_azuis: normalizePalavrasAzuis(headline, p.palavras_azuis || ''),
      subtitulo: p.subtitulo || '',
      cta_visual: (p.cta_visual || '').trim(),
      contexto_visual: p.contexto_visual || '',
      layout_sugerido: /^[A-Q]$/i.test(p.layout_sugerido || '') ? String(p.layout_sugerido).toUpperCase() : null,
      legenda: p.legenda || '',
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

async function expandirLegendaCast(proposta, objetivo) {
  const sys = buildCastSystemPrompt(objetivo);
  const minChars = getMinLegendaChars();
  const linhasAtual = contarLinhasCorpo(proposta.legenda);
  const charsAtual  = contarChars(proposta.legenda);
  const prompt = `A legenda abaixo está CURTA (${linhasAtual} linhas corpo · ${charsAtual} chars). Precisa de mínimo ${REGRAS_LEGENDA.linhasCorpoIdeal[0]} linhas e ${minChars} chars.

HEADLINE: ${proposta.headline}
ÂNGULO: ${proposta.angulo}
LEGENDA ATUAL:
"""
${proposta.legenda}
"""

Reescreva APENAS a legenda. Aprofunde o dilema, adicione linhas de tensão e concretize a chamada para ação. Retorne SOMENTE a legenda expandida, sem JSON.`;

  const raw = await generateText(prompt, sys, 0.82, 1200);
  if (raw && raw.trim().length > charsAtual) proposta.legenda = raw.trim();
  return proposta;
}

async function gerarRotasComValidacao(tipoPost, temas, temaLivre = '', objetivo = 'audiencia', historicoArtes = '') {
  const { linhasCorpoIdeal } = REGRAS_LEGENDA;
  console.log(`   CAST calibração: ${linhasCorpoIdeal[0]}–${linhasCorpoIdeal[1]} linhas · ${getMinLegendaChars()} chars mín · objetivo: ${objetivo}`);

  // Passo 1: geração normal
  let propostas = await gerarRotasLLM(tipoPost, temas, temaLivre, { objetivo }, historicoArtes);
  let fora = propostas.filter(p => !legendaDentroDoPadrao(p.legenda));

  // Passo 2: se há legendas fora do padrão, regenera lote com forceLong
  if (fora.length) {
    console.log(`⚠️  CAST passo 2: ${fora.length} legenda(s) fora do padrão — regenerando lote com forceLong...`);
    propostas = await gerarRotasLLM(tipoPost, temas, temaLivre, { objetivo, forceLong: true }, historicoArtes);
    fora = propostas.filter(p => !legendaDentroDoPadrao(p.legenda));
  }

  // Passo 3: expande individualmente as que ainda estão curtas
  if (fora.length) {
    console.log(`⚠️  CAST passo 3: expandindo ${fora.length} legenda(s) individualmente...`);
    for (const p of fora) {
      await expandirLegendaCast(p, objetivo);
    }
  }

  propostas.forEach(p => {
    const ok = legendaDentroDoPadrao(p.legenda);
    console.log(`   · ${p.angulo}: ${contarLinhasCorpo(p.legenda)} linhas · ${contarChars(p.legenda)} chars${p.recomendada ? ' ★' : ''}${ok ? '' : ' ⚠️ fora'}`);
  });

  return propostas;
}

/**
 * Gera lote com 3 propostas editoriais CAST e salva em propostas-cast.json
 */
async function criarLotePropostasCast({ tipoPost, objetivo = 'audiencia', tema = '', temas }) {
  const { data, sha } = await loadStore();

  if (getLoteAguardando(data)) {
    throw new Error('Já existe um lote CAST aguardando aprovação. Revise as propostas pendentes.');
  }
  if (countBanco(data) >= BANCO_MAX) {
    throw new Error(`Banco CAST cheio (${BANCO_MAX}). Consuma reservas antes de novas propostas.`);
  }

  const cfg = getCastObjetivoConfig(objetivo);

  // Feedback loop: histórico de artes aprovadas para evitar repetição
  let historicoArtes = '';
  try {
    const fs   = require('fs');
    const path = require('path');
    const artesPath = path.join(__dirname, '..', 'artes-cast.json');
    if (fs.existsSync(artesPath)) {
      const artes = JSON.parse(fs.readFileSync(artesPath, 'utf8'));
      historicoArtes = buildHistoricoArtesBlock(artes);
      if (historicoArtes) console.log(`   Histórico CAST: ${Math.min(artes.length, 10)} artes aprovadas para contexto`);
    }
  } catch { /* não crítico — prossegue sem histórico */ }

  console.log(`📝 CAST — Fase 1: gerando 3 rotas [${cfg.label}] (só texto)...`);
  let propostas = await gerarRotasComValidacao(tipoPost, temas, tema, objetivo, historicoArtes);

  // Detecção de similaridade — aviso não-bloqueante
  try {
    const { marcarSimilares } = require('./utils/similaridade.js');
    const { getEmbedding }    = require('./utils/llm.js');
    const fs   = require('fs');
    const path = require('path');
    const artesPath = path.join(__dirname, '..', 'artes-cast.json');
    if (fs.existsSync(artesPath)) {
      const artes = JSON.parse(fs.readFileSync(artesPath, 'utf8')).slice(0, 10);
      propostas = await marcarSimilares(propostas, artes, getEmbedding);
    }
  } catch (e) {
    console.warn('⚠️  Similaridade: erro geral (não crítico):', e.message);
  }

  const lote = {
    id: newId('cast-lote'),
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

  console.log(`✅ CAST lote ${lote.id} — ${propostas.length} propostas aguardando aprovação`);
  return lote;
}

function buildHistoricoArtesBlock(artes) {
  if (!artes || !artes.length) return '';
  return artes.slice(0, 10).map(a => {
    const tipo   = a.tipo   || 'episodio';
    const layout = a.layout || 'C';
    const hl     = (a.headline || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').slice(0, 3).join(' ');
    return `${tipo}/${layout}: '${hl}'`;
  }).join('; ');
}

module.exports = { criarLotePropostasCast };
