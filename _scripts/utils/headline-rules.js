'use strict';

/**
 * Regras obrigatórias de headline — CybersecFEST
 * Fonte única: prompts LLM + enforce no pipeline + quebra por layout em renderLayout().
 */

const MAX_HEADLINE_WORDS = 10;
const MAX_HEADLINE_LINES = 5;
const MAX_PALAVRAS_AZUIS = 3;

/** Coluna estreita ou título + subtítulo lado a lado */
const TIGHT_HEADLINE_LAYOUTS = new Set(['C', 'E', 'F', 'I']);

/** Headlines centralizadas em bloco largo */
const CENTERED_HEADLINE_LAYOUTS = new Set(['G', 'L', 'M', 'N']);

const STOP = new Set([
  'o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'que', 'onde', 'com', 'para', 'se', 'um', 'uma', 'e', 'ou', 'ao', 'aos', 'à', 'às',
]);

const HEADLINE_PROMPT_BLOCK = `REGRAS OBRIGATÓRIAS DE HEADLINE:
- Máximo ${MAX_HEADLINE_WORDS} palavras no total (contagem única, mesmo com quebras)
- Quebra visual: até ${MAX_HEADLINE_LINES} linhas com <br> quando couber na arte (padrão: "O encontro que<br>redefine<br>cyber no Brasil")
- Nunca começa com "O CybersecFEST"
- palavras_azuis: ${MAX_PALAVRAS_AZUIS === 3 ? '1–3' : MAX_PALAVRAS_AZUIS} palavras QUE EXISTEM LITERALMENTE na headline, separadas por vírgula (destaque azul #14A8F4 na arte)`;

function stripAccents(s) {
  return String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function plainHeadline(headline) {
  return String(headline || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(headline) {
  return plainHeadline(headline).split(/\s+/).filter(Boolean).length;
}

function hasLineBreaks(headline) {
  return /<br\s*\/?>|\n/.test(String(headline || ''));
}

function stripCybersecfestPrefix(headline) {
  let h = String(headline || '').trim();
  if (h.toLowerCase().startsWith('o cybersecfest')) {
    h = h.replace(/^o cybersecfest\s*/i, '');
  }
  return h;
}

function normalizeLineBreaks(headline) {
  return String(headline || '').replace(/\n/g, '<br>').trim();
}

function breakPlainIntoLines(plain, maxLines = MAX_HEADLINE_LINES) {
  const words = plain.split(/\s+/).filter(Boolean);
  if (words.length <= 4) return plain;
  let n = 2;
  if (words.length > 8) n = 4;
  else if (words.length > 6) n = 3;
  n = Math.min(maxLines, n);
  const per = Math.ceil(words.length / n);
  const lines = [];
  for (let i = 0; i < words.length; i += per) {
    lines.push(words.slice(i, i + per).join(' '));
  }
  return lines.join('<br>');
}

function trimToMaxWords(headline, max = MAX_HEADLINE_WORDS) {
  const plain = plainHeadline(headline);
  const words = plain.split(/\s+/).filter(Boolean);
  if (words.length <= max) return normalizeLineBreaks(headline);
  return words.slice(0, max).join(' ');
}

/** Garante que palavras_azuis existam na headline (como no texto original). */
function normalizePalavrasAzuis(headline, palavrasAzuis) {
  const plain = plainHeadline(headline);
  if (!plain) return '';

  const headlineWords = plain.split(/\s+/).filter(Boolean);
  const requested = String(palavrasAzuis || '')
    .split(',')
    .map(w => w.trim())
    .filter(Boolean);

  const matched = [];
  for (const w of requested) {
    const wNorm = stripAccents(w);
    const actual = headlineWords.find(hw => stripAccents(hw) === wNorm)
      || headlineWords.find(hw => stripAccents(hw).includes(wNorm) && wNorm.length >= 4);
    if (actual && !matched.includes(actual)) matched.push(actual);
  }

  if (matched.length) return matched.slice(0, MAX_PALAVRAS_AZUIS).join(', ');

  const candidates = headlineWords
    .filter(w => w.length > 3 && !STOP.has(stripAccents(w)))
    .sort((a, b) => b.length - a.length);

  return candidates.slice(0, 2).join(', ');
}

function enforceHeadlineText(headline) {
  const warnings = [];
  let h = stripCybersecfestPrefix(headline);
  h = normalizeLineBreaks(h);

  const before = wordCount(h);
  if (before > MAX_HEADLINE_WORDS) {
    warnings.push(`headline truncada de ${before} para ${MAX_HEADLINE_WORDS} palavras`);
    h = trimToMaxWords(h, MAX_HEADLINE_WORDS);
  }

  return { headline: h, warnings };
}

function prepareHeadlineForLayout(headline, layout) {
  const L = String(layout || 'C').toUpperCase();
  let h = normalizeLineBreaks(headline);
  if (!h) return '';

  if (hasLineBreaks(h)) {
    const lines = h.split(/<br\s*\/?>/i).map(l => l.trim()).filter(Boolean);
    if (lines.length > MAX_HEADLINE_LINES) {
      h = lines.slice(0, MAX_HEADLINE_LINES).join('<br>');
    }
    return h;
  }

  const plain = plainHeadline(h);
  const words = plain.split(/\s+/).filter(Boolean);
  const needsBreak = TIGHT_HEADLINE_LAYOUTS.has(L)
    ? (plain.length > 28 || words.length > 4)
    : CENTERED_HEADLINE_LAYOUTS.has(L)
      ? (plain.length > 32 || words.length > 5)
      : (plain.length > 36 || words.length > 6);

  if (!needsBreak) return h;

  const maxLines = TIGHT_HEADLINE_LAYOUTS.has(L)
    ? Math.min(3, MAX_HEADLINE_LINES)
    : MAX_HEADLINE_LINES;
  return breakPlainIntoLines(plain, maxLines);
}

function enforceHeadlineCopy({ headline, palavrasAzuis, layout } = {}) {
  const { headline: trimmed, warnings } = enforceHeadlineText(headline);
  const headlineForLayout = layout
    ? prepareHeadlineForLayout(trimmed, layout)
    : trimmed;
  const pa = normalizePalavrasAzuis(headlineForLayout, palavrasAzuis);

  if (pa !== String(palavrasAzuis || '').trim() && String(palavrasAzuis || '').trim()) {
    warnings.push(`palavras_azuis ajustadas: "${palavrasAzuis}" → "${pa}"`);
  }

  return { headline: headlineForLayout, palavrasAzuis: pa, warnings };
}

module.exports = {
  MAX_HEADLINE_WORDS,
  MAX_HEADLINE_LINES,
  MAX_PALAVRAS_AZUIS,
  HEADLINE_PROMPT_BLOCK,
  plainHeadline,
  wordCount,
  hasLineBreaks,
  stripCybersecfestPrefix,
  normalizePalavrasAzuis,
  enforceHeadlineText,
  prepareHeadlineForLayout,
  enforceHeadlineCopy,
};
