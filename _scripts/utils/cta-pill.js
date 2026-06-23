'use strict';

/** Pill CTA do Layout E — componente reutilizável em artes (mensagens, CTAs visuais). */

const CTA_PILL_CSS = `
.cta-pill{display:inline-flex;align-items:center;width:fit-content;background:rgba(20,168,244,0.10);border:1px solid rgba(20,168,244,0.45);color:#14A8F4;font-family:'Montserrat',sans-serif;font-size:8.5px;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;padding:8px 16px;margin-top:10px;}
.pill-arrow{margin-left:10px;font-size:12px;}
`;

const LAYOUT_E_DEFAULT = 'INSCRIÇÕES ABERTAS';

const CTA_SUGGESTIONS = {
  evento: ['INSCRIÇÕES ABERTAS', 'GARANTA SEU LUGAR', 'VAGAS LIMITADAS', 'RESERVE SEU LUGAR'],
  patrocinador: ['SEJA PATROCINADOR', 'PATROCINE 2026', 'GARANTA SUA PRESENÇA'],
  palestrante: ['CONFIRA A AGENDA', 'PALESTRANTES 2026'],
  blog: ['SAIBA MAIS', 'LEIA O ARTIGO'],
  cidade: ['BH E SP 2026', 'DUAS EDIÇÕES'],
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Resolve o texto da pill: explícito > default do Layout E.
 * @param {{ cta?: string, ctaVisual?: string, tipoPost?: string, layout?: string }} opts
 */
function resolveCtaPill({ cta, ctaVisual, tipoPost, layout } = {}) {
  const explicit = (ctaVisual || cta || '').trim();
  if (explicit) return explicit;
  if (String(layout || '').toUpperCase() === 'E') return LAYOUT_E_DEFAULT;
  return null;
}

/**
 * HTML da pill (vazio se sem texto).
 * @param {string} text
 * @param {{ showArrow?: boolean, id?: string }} [opts]
 */
function ctaPillHtml(text, { showArrow = true, id = 'el-cta' } = {}) {
  const label = (text || '').trim();
  if (!label) return '';
  const arrow = showArrow ? ' <span class="pill-arrow">→</span>' : '';
  const idAttr = id ? ` id="${id}"` : '';
  return `<div class="cta-pill"${idAttr}>${escapeHtml(label)}${arrow}</div>`;
}

/**
 * Bloco pronto para injetar em layouts.
 * @param {object} params — cta, ctaVisual, tipoPost, layout
 * @param {{ force?: boolean }} [opts] — force: true mantém default no Layout E
 */
function ctaPillBlock(params = {}) {
  const text = resolveCtaPill(params);
  if (!text) return '';
  return ctaPillHtml(text);
}

/** Pill opcional — só quando há cta_visual explícito (layouts além de E). */
function ctaPillOptional(params = {}) {
  if (!(params.ctaVisual || params.cta)) return '';
  return ctaPillHtml(resolveCtaPill(params));
}

function suggestCtaExamples(tipoPost) {
  return CTA_SUGGESTIONS[tipoPost] || CTA_SUGGESTIONS.evento;
}

module.exports = {
  CTA_PILL_CSS,
  LAYOUT_E_DEFAULT,
  CTA_SUGGESTIONS,
  resolveCtaPill,
  ctaPillHtml,
  ctaPillBlock,
  ctaPillOptional,
  suggestCtaExamples,
};
