'use strict';

/**
 * Brand-aware layout renderer.
 * Chama renderLayout() normalmente (CybersecFEST) e aplica substituição de tokens
 * para outras marcas. Abordagem aditiva pura — renderLayout() não é modificado.
 */

const { renderLayout } = require('./layouts.js');
const { assetDataUri } = require('./embed-assets.js');

/**
 * Substitui o logo CybersecFEST pelo logo CAST no HTML gerado.
 * O logo é embutido como base64 data URI, então precisamos trocar a URI inteira.
 */
function swapLogo(html, newLogoAsset) {
  const festLogoUri = assetDataUri('logo-cyberfest.png');
  const castLogoUri = assetDataUri(newLogoAsset);
  if (!castLogoUri || festLogoUri === castLogoUri) return html;
  return html.split(festLogoUri).join(castLogoUri);
}

/**
 * Remove o bloco de logos do ecossistema (DevOps, IAM, Alcatraz)
 * que são específicos do CybersecFEST.
 * O elemento tem id="el-eco" em todos os layouts.
 */
function removeEcoLogos(html) {
  // Remove o elemento completo com id="el-eco" (pode estar em div, etc.)
  return html.replace(/<[^>]+id="el-eco"[^>]*>[\s\S]*?<\/[^>]+>/g, '');
}

/**
 * Aplica as substituições de tokens de cor/fonte definidas no brand.js.
 */
function applyTokenReplacements(html, replacements) {
  let result = html;
  for (const [from, to] of replacements) {
    result = result.split(from).join(to);
  }
  return result;
}

/**
 * Renderiza um layout com as configurações de uma marca específica.
 *
 * @param {string} slug
 * @param {object} arte — mesma estrutura de artes.json
 * @param {object} brand — módulo de _brands/{id}/brand.js (ou null = CybersecFEST)
 * @returns {string} HTML completo da arte com tokens da marca aplicados
 */
function renderLayoutForBrand(slug, arte, brand = null) {
  const html = renderLayout(slug, arte);

  if (!brand || brand.id === 'cybersecfest') return html;

  let result = html;

  // 1. trocar tokens de cor + fonte (ordem importa — rgba antes de hex)
  result = applyTokenReplacements(result, brand.token_replacements || []);

  // 2. trocar logo
  if (brand.logo_asset) {
    result = swapLogo(result, brand.logo_asset);
  }

  // 3. remover logos de ecossistema do CybersecFEST
  result = removeEcoLogos(result);

  return result;
}

module.exports = { renderLayoutForBrand };
