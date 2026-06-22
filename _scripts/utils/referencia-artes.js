'use strict';

/** Artes ouro SuperAgent — nunca re-renderizar arte.html; thumb pode ser recomposto */
const REFERENCIA_OURO = [
  'patrocinador-1782039190901', // #1
  'evento-1782045624931',       // #2
  'blog-1782058741657',         // #3
];

/** Bússola visual para novos posts — tonalidade azul fantástica */
const GRANDE_REFERENCIA_VISUAL = [
  'patrocinador-1782039190901', // #1 — grid + glow ciano
  'evento-1782045624931',       // #2 — backlight + skyline
];

function isReferenciaOuro(slug) {
  return REFERENCIA_OURO.includes(slug);
}

function isGrandeReferencia(slug) {
  return GRANDE_REFERENCIA_VISUAL.includes(slug);
}

module.exports = {
  REFERENCIA_OURO,
  GRANDE_REFERENCIA_VISUAL,
  isReferenciaOuro,
  isGrandeReferencia,
};
