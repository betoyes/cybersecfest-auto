'use strict';

const fs   = require('fs');
const path = require('path');
const { REFERENCIA_OURO } = require('./referencia-artes.js');

const ARTes_PATH = path.join(__dirname, '../../artes.json');

/** Posts reais aprovados — calibração editorial (pipeline-orquestrador) */
const EXEMPLOS_SKILL = [
  {
    id: 'skill-1',
    tipo: 'evento',
    titulo: 'Gancho provocador',
    legenda: `Enquanto você lê isso, alguém está sendo atacado.

Ameaças evoluem.
Regulações apertam.
Orçamentos encolhem.
E a pergunta que ninguém quer responder em público: A sua empresa está realmente preparada?
Ela precisa ser feita em voz alta.

O CyberSecFest São Paulo 2026 é onde C-Levels e líderes de tecnologia param, debatem
e constroem respostas reais para os desafios que já estão na sua mesa.

🔹 Não é mais um evento de tecnologia.
🔹 É a maior confraria cyber do Brasil.
🔹 As vagas para quem decide são limitadas.

A cadeira é sua. Por quanto tempo ainda?

✅ Confirme sua presença agora: [link]`,
  },
  {
    id: 'skill-3',
    tipo: 'blog',
    titulo: 'Pergunta que incomoda',
    legenda: `A pergunta no Board mudou de "Estamos seguros?" para "Quão rápido conseguimos recuperar a operação?"

O CISO moderno não gerencia apenas firewalls.
Ele gerencia o risco financeiro e a continuidade da empresa.

Se você lidera segurança em uma grande organização, sabe:
os desafios reais não estão nos manuais.
Eles são resolvidos na troca com quem enfrenta as mesmas dores.

É por isso que existe o CyberSecFest.
Não é evento de palestras. É confraria de líderes.
Conversas francas. Benchmarking real. Networking de alto nível.

⚠️ Vagas estritamente limitadas para garantir o nível do debate.

✅ Faça sua inscrição: [link]`,
  },
  {
    id: 'skill-4',
    tipo: 'blog',
    titulo: 'Tema técnico estratégico',
    legenda: `O "hype" da IA generativa passou.
O desafio real de 2026 é outro.

A liderança de cibersegurança já entendeu: o próximo passo está na Agentic AI —
agentes autônomos que tomam decisões operacionais por conta própria.

Mas com a autonomia, vêm as perguntas críticas:
🔹 Como garantir que um agente autônomo não vaze dados confidenciais?
🔹 Como blindar modelos contra data poisoning?
🔹 Como auditar identidades e acessos de não-humanos?

No CyberSecFest, vamos debater a governança prática desse cenário.

Escolha a sua edição:
🔹 CyberSecFest São Paulo — Outubro.
🔹 CyberSecFest Belo Horizonte — Novembro.

✅ Garanta sua cadeira: [link]`,
  },
  {
    id: 'skill-6',
    tipo: 'patrocinador',
    titulo: 'Anúncio parceiro',
    legenda: `✨ Novo parceiro Emerald Confirmado!

A IAM Experts chega ao CyberSecFest SP 2026 como parceira Cota Emerald.

Identidade é hoje a porta de entrada nº1 dos ataques cibernéticos.
No CyberSecFest, a IAM Experts traz os debates que sua empresa precisa responder AGORA.

🔹 28 de outubro, 2026.
🔹 São Paulo.
🔹 Os maiores especialistas e C-Levels do Brasil, em um só lugar.

⚠️ Vagas limitadas.

👉 Garanta sua vaga agora: [link]`,
  },
];

let artesCache = null;

function loadArtes() {
  if (artesCache) return artesCache;
  try {
    artesCache = JSON.parse(fs.readFileSync(ARTes_PATH, 'utf8'));
  } catch {
    artesCache = [];
  }
  return artesCache;
}

/** Regras editoriais — espelham _agents/pipeline-orquestrador/SKILL.md */
const REGRAS_LEGENDA = {
  linhasCorpoIdeal: [6, 12],
  linhasCorpoMax: 15,
  charsMin: 320,
  charsMax: 1200,
};

function contarChars(s) {
  return (s || '').trim().length;
}

function contarLinhasCorpo(legenda) {
  const parts = String(legenda || '').split(/\n\s*\n/);
  const corpo = parts[0] || '';
  return corpo.split('\n').filter(l => l.trim()).length;
}

function legendaDentroDoPadrao(legenda) {
  const chars = contarChars(legenda);
  const linhas = contarLinhasCorpo(legenda);
  return chars >= REGRAS_LEGENDA.charsMin
    && chars <= REGRAS_LEGENDA.charsMax
    && linhas >= REGRAS_LEGENDA.linhasCorpoIdeal[0]
    && linhas <= REGRAS_LEGENDA.linhasCorpoMax;
}

function tiposCompat(tipoPost) {
  const t = (tipoPost || 'blog').toLowerCase();
  if (t === 'palestrante') return ['palestrante', 'blog', 'evento'];
  return [t, 'blog', 'evento', 'patrocinador'];
}

function pickArtesReferencia(tipoPost, max = 3) {
  const artes = loadArtes().filter(a => a.legenda && contarChars(a.legenda) >= 400);
  const tipos = tiposCompat(tipoPost);
  const ouro = new Set(REFERENCIA_OURO);

  const score = (a) => {
    let s = contarChars(a.legenda);
    if (ouro.has(a.slug)) s += 5000;
    const ti = tipos.indexOf(a.tipo);
    if (ti >= 0) s += (tipos.length - ti) * 200;
    return s;
  };

  return [...artes].sort((a, b) => score(b) - score(a)).slice(0, max);
}

function pickSkillExemplos(tipoPost, max = 2) {
  const tipos = tiposCompat(tipoPost);
  const scored = EXEMPLOS_SKILL.map(ex => {
    const ti = tipos.indexOf(ex.tipo);
    return { ex, s: ti >= 0 ? (tipos.length - ti) * 100 + contarChars(ex.legenda) : contarChars(ex.legenda) };
  });
  return scored.sort((a, b) => b.s - a.s).slice(0, max).map(x => x.ex);
}

function formatArteExemplo(arte, i) {
  const hl = (arte.headline || '').replace(/\n/g, ' / ');
  return `── Exemplo ${i} · ARTE OURO (${arte.tipo}) · ${contarLinhasCorpo(arte.legenda)} linhas corpo ──
Headline: ${hl}
Subtítulo: ${arte.subtitulo || '—'}
Legenda (copie TOM, RITMO e TAMANHO — frases curtas, uma ideia por linha):
"""
${arte.legenda.trim()}
"""`;
}

function formatSkillExemplo(ex, i) {
  return `── Exemplo ${i} · POST APROVADO (${ex.tipo}) · ${contarLinhasCorpo(ex.legenda)} linhas · ${ex.titulo} ──
"""
${ex.legenda.trim()}
"""`;
}

function regrasLegendaBlock() {
  return [
    'REGRAS DE TAMANHO (pipeline-orquestrador — posts MEDIANOS, não longos):',
    `• Corpo: ${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas ideais (máx. ${REGRAS_LEGENDA.linhasCorpoMax})`,
    '• Frases curtas. Uma ideia por linha. Proibido bloco denso de parágrafo.',
    '• Emojis: 🔹 listas · ✅ CTA · ⚠️ urgência — com moderação',
    '• Linha vazia antes do CTA · linha vazia antes das hashtags',
    '• 10–15 hashtags relevantes',
    '',
  ].join('\n');
}

/**
 * Bloco de calibração editorial para injetar em prompts LLM.
 */
function buildReferenciaCopyBlock(tipoPost, opts = {}) {
  const maxArtes = opts.maxArtes ?? 2;
  const maxSkill = opts.maxSkill ?? 2;
  const artes = pickArtesReferencia(tipoPost, maxArtes);
  const skills = pickSkillExemplos(tipoPost, maxSkill);

  const parts = [
    '═══ REFERÊNCIAS OURO — CALIBRE DE TOM, RITMO E TAMANHO ═══',
    regrasLegendaBlock(),
    'Use os exemplos abaixo como régua. Não copie frases — copie espírito e formatação.',
    '',
  ];

  let n = 1;
  for (const a of artes) {
    parts.push(formatArteExemplo(a, n++));
    parts.push('');
  }
  for (const ex of skills) {
    parts.push(formatSkillExemplo(ex, n++));
    parts.push('');
  }

  if (artes.length) {
    const mediaLinhas = Math.round(
      artes.reduce((s, a) => s + contarLinhasCorpo(a.legenda), 0) / artes.length
    );
    parts.push(`Referência ouro: ~${mediaLinhas} linhas de corpo (padrão mediano CybersecFEST).`);
  }

  return parts.join('\n');
}

function getMinLegendaChars() {
  return REGRAS_LEGENDA.charsMin;
}

module.exports = {
  buildReferenciaCopyBlock,
  getMinLegendaChars,
  legendaDentroDoPadrao,
  contarLinhasCorpo,
  REGRAS_LEGENDA,
  pickArtesReferencia,
  loadArtes,
  EXEMPLOS_SKILL,
};
