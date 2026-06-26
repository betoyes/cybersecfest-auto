'use strict';

const SANDBOX_SLUG = 'evento-1782143777641';

function isSandbox(slug) {
  return String(slug || '').trim() === SANDBOX_SLUG;
}

function assertSandbox(slug) {
  if (!isSandbox(slug)) {
    throw new Error(`Motion só no post sandbox (${SANDBOX_SLUG}). Replicar depois de validar.`);
  }
}

module.exports = { SANDBOX_SLUG, isSandbox, assertSandbox };
