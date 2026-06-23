'use strict';

/**
 * Rotação de layouts: ordem ALEATÓRIA, sem repetição até esgotar o pool do tipo.
 * Modelo "baralho embaralhado" — quando todos foram usados, embaralha de novo.
 */

const DEFAULT_ROTACAO = {
  blog:        ['C', 'M', 'N', 'O'],
  evento:      ['E', 'L', 'J', 'P'],
  palestrante: ['D', 'G', 'K'],
  patrocinador:['F', 'I', 'B', 'Q'],
  cidade:      ['A', 'H', 'J'],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPool(tipoPost, rotacaoLayouts) {
  const pool = (rotacaoLayouts && rotacaoLayouts[tipoPost]) || DEFAULT_ROTACAO[tipoPost];
  if (!pool?.length) return DEFAULT_ROTACAO.blog;
  return pool.map(l => String(l).toUpperCase());
}

/**
 * Reconstrói restantes do ciclo atual a partir do historico_recente (migração).
 */
function bootstrapRestantes(tipoPost, pool, historico) {
  const recent = (historico || [])
    .filter(h => h.tipo_post === tipoPost && h.layout)
    .map(h => String(h.layout).toUpperCase());

  if (!recent.length) return shuffle(pool);

  const usedInCycle = [];
  for (let i = recent.length - 1; i >= 0; i--) {
    const L = recent[i];
    if (!pool.includes(L)) continue;
    if (usedInCycle.includes(L)) break;
    usedInCycle.unshift(L);
    if (usedInCycle.length >= pool.length) break;
  }

  const usedSet = new Set(usedInCycle);
  const restantes = pool.filter(l => !usedSet.has(l));
  if (restantes.length === 0) return shuffle(pool);
  return shuffle(restantes);
}

/**
 * Escolhe o próximo layout do tipo.
 * @returns {{ layout: string, layoutCiclos: object, meta: object }}
 */
function pickNextLayout(tipoPost, { rotacaoLayouts, layoutCiclos, historicoRecente } = {}) {
  const pool = getPool(tipoPost, rotacaoLayouts);
  const ciclos = { ...(layoutCiclos || {}) };

  let restantes = (ciclos[tipoPost] || [])
    .map(l => String(l).toUpperCase())
    .filter(l => pool.includes(l));

  let novoCiclo = false;

  if (restantes.length === 0) {
    if (!layoutCiclos?.[tipoPost]?.length && historicoRecente?.length) {
      restantes = bootstrapRestantes(tipoPost, pool, historicoRecente);
    } else {
      restantes = shuffle(pool);
      novoCiclo = true;
    }
  }

  const layout = restantes.shift();
  ciclos[tipoPost] = restantes;

  const cicloCompleto = restantes.length === 0;

  return {
    layout,
    layoutCiclos: ciclos,
    meta: {
      tipoPost,
      pool,
      restantesApos: restantes,
      novoCiclo,
      cicloCompleto,
    },
  };
}

module.exports = {
  DEFAULT_ROTACAO,
  shuffle,
  getPool,
  pickNextLayout,
  bootstrapRestantes,
};
