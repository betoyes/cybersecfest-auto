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
  HEADLINE_PROMPT_BLOCK,
  enforceHeadlineText,
  normalizePalavrasAzuis,
} = require('./utils/headline-rules.js');
const {
  loadStore, saveStore, newId, getLoteAguardando, countBanco, BANCO_MAX,
} = require('./utils/propostas-store-cast.js');

// Legenda mediana: 7–12 linhas de corpo, frases curtas, tom íntimo/executivo
const LEGENDA_LINHAS_IDEAL = [7, 12];
const LEGENDA_MAX_CHARS    = 2200;

function contarLinhasCorpo(legenda) {
  return (legenda || '').split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length;
}

function legendaDentroDoPadrao(legenda) {
  const linhas = contarLinhasCorpo(legenda);
  return linhas >= LEGENDA_LINHAS_IDEAL[0] && linhas <= LEGENDA_LINHAS_IDEAL[1];
}

// Exemplos ouro de legenda do CYBERSEC.CAST
const EXEMPLOS_LEGENDA_CAST = `
EXEMPLO 1 (episódio):
Tem uma pergunta que todo CISO evita.

Não por insegurança.
Por responsabilidade.

Quando o incidente acontece — e ele vai acontecer —
o que você diria ao board?

No episódio dessa semana, conversei com um CISO que passou por isso.
Ele não só sobreviveu. Ele virou referência.

Esse é o tipo de conversa que só acontece no CYBERSEC.CAST.

✅ Novo episódio disponível no Spotify e YouTube.

#cibersegurança #CISO #liderança #podcast #cyberseccast #segurançadainformação #gestãoderiscos #tecnologia #executivos #brasil

---
EXEMPLO 2 (convidado):
Quando um profissional de segurança passa 20 anos no mercado,
acumula mais cicatrizes do que cases de sucesso.

E é exatamente por isso que vale ouvir.

Convidamos alguém que viveu de perto as transformações da área:
de firewall a Zero Trust, de compliance a cultura.

A conversa foi honesta.
Sem filtro de marketing.
Sem discurso de keynote.

Só o que funciona — e o que não funciona — na prática.

✅ Ouça agora no CYBERSEC.CAST.

#cibersegurança #zerotrust #podcast #CISO #segurança #technologia #liderança #brasil #cyberseccast
`.trim();

const CAST_SYSTEM_PROMPT = `Você é produtor editorial sênior do CYBERSEC.CAST — O Podcast de Referência em Cibersegurança para Executivos C-Level do Brasil.

TOM: Intelectual, íntimo, provocador. O ouvinte sente que está numa conversa exclusiva entre líderes — não num evento ou palco.
PÚBLICO: CISOs, CIOs, CTOs, CEOs, VPs de Tecnologia, Diretores de Segurança.

PROIBIDO: clichês de hacker/segurança (cadeados, crânios, Matrix), linguagem técnica-acadêmica, exagero sensacionalista, "vulnerabilidades", frases genéricas de evento corporativo, começar com "O CYBERSEC.CAST".

CONTEÚDO: episódios de entrevista, insights de liderança, decisões difíceis que só CISOs enfrentam, cybersegurança como vantagem competitiva.`;

async function gerarRotasLLM(tipoPost, temas, temaLivre = '', opts = {}) {
  const historico = (temas.historico_recente || [])
    .slice(-5)
    .map(h => `- ${h.tipo_post} (${h.data})`)
    .join('\n') || 'Nenhum ainda.';

  const temasGrade = (temas.temas_grade || []).slice(0, 8).join(', ') || 'Zero Trust, IAM, Resposta a Incidentes, IA na Segurança, LGPD, Governança de Riscos';

  const temaExtra = temaLivre
    ? `\nBRIEFING DO USUÁRIO (prioridade máxima — use como direção central do episódio):\n${temaLivre}\n`
    : '';

  const extraLong = opts.forceLong
    ? `\nATENÇÃO: tentativa anterior fora do padrão. Cada legenda DEVE ter ${LEGENDA_LINHAS_IDEAL[0]}–${LEGENDA_LINHAS_IDEAL[1]} linhas de corpo.\n`
    : '';

  const tipoPtBR = tipoPost === 'episodio' ? 'novo episódio'
    : tipoPost === 'convidado' ? 'apresentação de convidado'
    : 'post de insight';

  const prompt = `${EXEMPLOS_LEGENDA_CAST}

---

${HEADLINE_PROMPT_BLOCK}

Crie EXATAMENTE 3 rotas editoriais DISTINTAS para um post de ${tipoPtBR} do CYBERSEC.CAST.
Cada rota deve ter um ÂNGULO diferente (ex.: provocação intelectual, bastidores da decisão, lição de crise real, insight de carreira, tendência não óbvia).
${temaExtra}${extraLong}
CONTEXTO DO PODCAST:
- Temas da grade: ${temasGrade}
- Histórico recente (evitar repetir ângulos): ${historico}

Marque UMA proposta como "recomendada": true.

RETORNE APENAS JSON válido (sem markdown):
{
  "propostas": [
    {
      "angulo": "nome do ângulo (3-6 palavras)",
      "recomendada": false,
      "headline": "máx 10 palavras, impacto intelectual; use <br> para quebras se couber",
      "palavras_azuis": "1-3 palavras DA HEADLINE para destacar, vírgula",
      "subtitulo": "1 frase completa, 12-20 palavras — o que o ouvinte vai descobrir",
      "cta_visual": "opcional — máx 4 palavras UPPERCASE para pill na arte. Ex: NOVO EPISÓDIO, OUÇA AGORA, EP 42. Omita se não encaixar.",
      "contexto_visual": "cena fotográfica do podcast: ambiente (estúdio escuro, vidro, mesa profissional), iluminação (indigo LED, violet rim), quem (host, convidado, mesa de entrevista) — SEM texto na cena, SEM palavras da headline",
      "legenda": "LEGENDA pronta para LinkedIn/Instagram — padrão dos exemplos ouro: ${LEGENDA_LINHAS_IDEAL[0]}–${LEGENDA_LINHAS_IDEAL[1]} linhas de corpo, frases curtas, uma ideia por linha. Estrutura: gancho 2–3 linhas → desenvolvimento 4–6 linhas → posicionamento CYBERSEC.CAST 1–2 linhas → CTA ✅ → hashtags (10–15)"
    }
  ]
}`;

  const raw = await generateText(prompt, CAST_SYSTEM_PROMPT, 0.88, 4096);
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

async function gerarRotasComValidacao(tipoPost, temas, temaLivre = '') {
  console.log(`   CAST calibração: ${LEGENDA_LINHAS_IDEAL[0]}–${LEGENDA_LINHAS_IDEAL[1]} linhas corpo`);
  let propostas = await gerarRotasLLM(tipoPost, temas, temaLivre);
  let fora = propostas.filter(p => !legendaDentroDoPadrao(p.legenda));

  if (fora.length) {
    console.log(`⚠️  CAST: ${fora.length} legenda(s) fora do padrão — regenerando lote...`);
    propostas = await gerarRotasLLM(tipoPost, temas, temaLivre, { forceLong: true });
    fora = propostas.filter(p => !legendaDentroDoPadrao(p.legenda));
  }

  propostas.forEach(p => {
    const linhas = contarLinhasCorpo(p.legenda);
    const chars  = (p.legenda || '').length;
    console.log(`   · ${p.angulo}: ${linhas} linhas · ${chars} chars${p.recomendada ? ' ★' : ''}`);
  });

  return propostas;
}

/**
 * Gera lote com 3 propostas editoriais CAST e salva em propostas-cast.json
 */
async function criarLotePropostasCast({ tipoPost, tema = '', temas }) {
  const { data, sha } = await loadStore();

  if (getLoteAguardando(data)) {
    throw new Error('Já existe um lote CAST aguardando aprovação. Revise as propostas pendentes.');
  }
  if (countBanco(data) >= BANCO_MAX) {
    throw new Error(`Banco CAST cheio (${BANCO_MAX}). Consuma reservas antes de novas propostas.`);
  }

  console.log('📝 CAST — Fase 1: gerando 3 rotas editoriais (só texto)...');
  const propostas = await gerarRotasComValidacao(tipoPost, temas, tema);

  const lote = {
    id: newId('cast-lote'),
    status: 'aguardando_aprovacao',
    tipo_post: tipoPost,
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

module.exports = { criarLotePropostasCast };
