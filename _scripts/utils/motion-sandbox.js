'use strict';

const SANDBOX_SLUG = 'evento-1782143777641';

function isSandbox(slug) {
  return !!String(slug || '').trim();
}

function assertSandbox(_slug) {
  // Motion liberado universalmente — assertSandbox mantida por compatibilidade mas não bloqueia
}

module.exports = { SANDBOX_SLUG, isSandbox, assertSandbox };
