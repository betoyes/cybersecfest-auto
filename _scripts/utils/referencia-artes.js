'use strict';

/** Artes ouro SuperAgent — nunca re-renderizar arte.html; thumb pode ser recomposto */
const REFERENCIA_OURO = [
  'patrocinador-1782039190901', // #1
  'evento-1782045624931',       // #2
  'blog-1782058741657',         // #3
];

function isReferenciaOuro(slug) {
  return REFERENCIA_OURO.includes(slug);
}

module.exports = { REFERENCIA_OURO, isReferenciaOuro };
