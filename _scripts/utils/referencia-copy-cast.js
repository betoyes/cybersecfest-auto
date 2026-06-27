'use strict';

const fs   = require('fs');
const path = require('path');

const ARTES_PATH = path.join(__dirname, '../../artes-cast.json');

// Exemplos ouro fixos — usados como régua de tom e ritmo quando artes-cast.json está vazio
const EXEMPLOS_SKILL = [
  {
    tipo: 'audiencia',
    titulo: 'Dilema do CISO — fio da navalha',
    legenda: `Tem uma pergunta que todo CISO evita.

Não por insegurança.
Por responsabilidade.

Quando o incidente acontece — e ele vai acontecer —
o que você diria ao board?

Não existe resposta certa.
Existe o executivo que já pensou nisso antes.
E o que vai improvisar na hora errada.

É sobre isso que o CYBERSEC.CAST existe para conversar.

✅ Novo episódio disponível no Spotify e YouTube.

#cibersegurança #CISO #liderança #podcast #cyberseccast #segurançadainformação #gestãoderiscos #tecnologia #executivos #brasil`,
  },
  {
    tipo: 'audiencia',
    titulo: 'Paradoxo da segurança invisível',
    legenda: `Segurança é a única área onde você é avaliado pelo que NÃO aconteceu.

Sem incidente, sem aplauso.
Com incidente, toda culpa é sua.

Esse é o paradoxo de liderar um time de cibersegurança no Brasil em 2025.

Como você constrói autoridade num ambiente assim?
Como você convence o board antes do breach, não depois?

É sobre isso que o CYBERSEC.CAST existe para conversar.

✅ Ouça agora no Spotify e YouTube.

#cibersegurança #zerotrust #podcast #CISO #segurança #liderança #brasil #cyberseccast`,
  },
  {
    tipo: 'patrocinadores',
    titulo: 'Decisão de compra B2B — onde ela acontece',
    legenda: `A decisão de comprar sua solução de segurança não começa na sua proposta comercial.

Começa na conversa que o CIO teve na semana passada.
No podcast que o CISO ouviu no trânsito.
No conteúdo que ficou na cabeça — antes de você aparecer.

É aí que o CYBERSEC.CAST atua.

Não como mídia. Como presença no momento de formação de opinião.

Seu concorrente já está lá.

✅ Fale com a gente: contato@devopsbootcamp.net

#B2B #cibersegurança #marketing #patrocínio #cyberseccast #CISO #tecnologia`,
  },
];

let artesCache = null;

function loadArtes() {
  if (artesCache) return artesCache;
  try {
    artesCache = JSON.parse(fs.readFileSync(ARTES_PATH, 'utf8'));
  } catch {
    artesCache = [];
  }
  return artesCache;
}

const REGRAS_LEGENDA = {
  linhasCorpoIdeal: [6, 12],
  linhasCorpoMax:   15,
  charsMin:         320,
  charsMax:         1400,
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
  const chars  = contarChars(legenda);
  const linhas = contarLinhasCorpo(legenda);
  return chars  >= REGRAS_LEGENDA.charsMin
      && chars  <= REGRAS_LEGENDA.charsMax
      && linhas >= REGRAS_LEGENDA.linhasCorpoIdeal[0]
      && linhas <= REGRAS_LEGENDA.linhasCorpoMax;
}

function getMinLegendaChars() { return REGRAS_LEGENDA.charsMin; }

function pickArtesReferencia(objetivo, max = 2) {
  const artes = loadArtes().filter(a => a.legenda && contarChars(a.legenda) >= 300);
  if (!artes.length) return [];
  const score = (a) => {
    let s = contarChars(a.legenda);
    if (a.objetivo === objetivo) s += 3000;
    return s;
  };
  return [...artes].sort((a, b) => score(b) - score(a)).slice(0, max);
}

function pickSkillExemplos(objetivo, max = 2) {
  return EXEMPLOS_SKILL
    .filter(e => !objetivo || e.tipo === objetivo || e.tipo === 'audiencia')
    .slice(0, max);
}

function regrasLegendaBlock() {
  return [
    'REGRAS DE TAMANHO (CYBERSEC.CAST — posts executivos, densos mas legíveis):',
    `• Corpo: ${REGRAS_LEGENDA.linhasCorpoIdeal[0]}–${REGRAS_LEGENDA.linhasCorpoIdeal[1]} linhas ideais (máx. ${REGRAS_LEGENDA.linhasCorpoMax})`,
    '• Frases curtas. Uma ideia por linha. Proibido bloco denso de parágrafo.',
    '• Emojis: ✅ CTA · ⚠️ urgência — com moderação, nunca em tom de marketing barato',
    '• Linha vazia antes do CTA · linha vazia antes das hashtags',
    '• 8–15 hashtags relevantes ao tema',
    '',
  ].join('\n');
}

function formatArteExemplo(arte, i) {
  const hl = (arte.headline || '').replace(/\n/g, ' / ');
  return `── Exemplo ${i} · ARTE APROVADA (${arte.objetivo || 'audiencia'}) · ${contarLinhasCorpo(arte.legenda)} linhas corpo ──
Headline: ${hl}
Subtítulo: ${arte.subtitulo || '—'}
Legenda (copie TOM, RITMO e TAMANHO):
"""
${arte.legenda.trim()}
"""`;
}

function formatSkillExemplo(ex, i) {
  return `── Exemplo ${i} · POST OURO (${ex.tipo}) · ${contarLinhasCorpo(ex.legenda)} linhas · ${ex.titulo} ──
"""
${ex.legenda.trim()}
"""`;
}

/**
 * Bloco de calibração editorial para injetar em prompts LLM do CAST.
 */
function buildReferenciaCopyBlock(objetivo, opts = {}) {
  const maxArtes = opts.maxArtes ?? 2;
  const maxSkill = opts.maxSkill ?? 2;
  const artes    = pickArtesReferencia(objetivo, maxArtes);
  const skills   = pickSkillExemplos(objetivo, maxSkill);

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

  parts.push('═══ FIM DAS REFERÊNCIAS ═══');
  return parts.join('\n');
}

module.exports = {
  REGRAS_LEGENDA,
  contarChars,
  contarLinhasCorpo,
  legendaDentroDoPadrao,
  getMinLegendaChars,
  buildReferenciaCopyBlock,
};
