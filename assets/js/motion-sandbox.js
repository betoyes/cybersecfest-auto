/**
 * Motion disponível para todos os posts.
 * O SANDBOX_SLUG é mantido como referência histórica, mas isSandbox()
 * agora retorna true para qualquer slug não-vazio.
 */
(function (global) {
  'use strict';

  const SANDBOX_SLUG = 'evento-1782143777641';

  function isSandbox(slug) {
    return !!String(slug || '').trim();
  }

  global.MotionSandbox = {
    slug: SANDBOX_SLUG,
    label: 'Motion universal — todos os posts',
    isSandbox,
  };
})(typeof window !== 'undefined' ? window : global);
