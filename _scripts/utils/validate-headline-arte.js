'use strict';

const {
  wordCount,
  plainHeadline,
  MAX_HEADLINE_WORDS,
  MAX_HEADLINE_LINES,
  normalizePalavrasAzuis,
  hasLineBreaks,
} = require('./headline-rules.js');

function lineCount(headline) {
  const h = String(headline || '');
  if (hasLineBreaks(h)) {
    return h.split(/<br\s*\/?>|\n/i).map(l => l.trim()).filter(Boolean).length;
  }
  return 1;
}

function validateHeadlineArte(arte) {
  const alertas = [];
  const headline = arte.headline || '';
  const pa = arte.palavras_azuis || '';
  const wc = wordCount(headline);
  const lc = lineCount(headline);

  if (!headline.trim()) {
    alertas.push('headline vazia');
    return alertas;
  }

  if (wc > MAX_HEADLINE_WORDS) {
    alertas.push(`headline com ${wc} palavras (máx ${MAX_HEADLINE_WORDS})`);
  }
  if (lc > MAX_HEADLINE_LINES) {
    alertas.push(`headline com ${lc} linhas (máx ${MAX_HEADLINE_LINES})`);
  }

  if (pa) {
    const normalized = normalizePalavrasAzuis(headline, pa);
    const req = pa.split(',').map(w => w.trim()).filter(Boolean);
    const got = normalized.split(',').map(w => w.trim()).filter(Boolean);
    for (const w of req) {
      const plain = plainHeadline(headline).toLowerCase();
      if (!plain.includes(w.toLowerCase()) && !got.some(g => g.toLowerCase() === w.toLowerCase())) {
        alertas.push(`palavras_azuis "${w}" não está na headline`);
      }
    }
  }

  return alertas;
}

module.exports = { validateHeadlineArte, lineCount };
