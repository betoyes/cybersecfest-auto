'use strict';

/**
 * Brand-aware layout renderer.
 * Chama renderLayout() e aplica substituições de tokens para marcas adicionais.
 * Abordagem aditiva pura — renderLayout() não é modificado.
 */

const { renderLayout } = require('./layouts.js');
const { assetDataUri } = require('./embed-assets.js');

/**
 * Substitui o logo CybersecFEST pelo logo da marca no HTML gerado.
 * O logo é embutido como base64 data URI.
 */
function swapLogo(html, newLogoAsset) {
  const festLogoUri = assetDataUri('logo-cyberfest.png');
  const castLogoUri = assetDataUri(newLogoAsset);
  if (!castLogoUri || festLogoUri === castLogoUri) return html;
  return html.split(festLogoUri).join(castLogoUri);
}

/**
 * Move o logo principal do canto superior DIREITO para o ESQUERDO para o CAST.
 * Layout A usa .logo-bar{right:30px} — substituição direta de string, sem CSS injection.
 * Outros layouts já posicionam o logo à esquerda no fluxo do conteúdo.
 */
function moveCastLogoToLeft(html) {
  const TARGET = '.logo-bar{position:absolute;top:24px;right:30px;z-index:3;}';
  if (!html.includes(TARGET)) {
    // CSS do layout A mudou — logo pode estar mal posicionado. Atualizar TARGET em brand-renderer.js.
    process.stderr.write('[brand-renderer] moveCastLogoToLeft: string CSS não encontrada — logo pode estar mal posicionado\n');
  }
  return html.replace(TARGET, '.logo-bar{position:absolute;top:24px;left:34px;z-index:3;}');
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
 * @param {object} arte — mesma estrutura de artes.json (deve conter arte.layout)
 * @param {object} brand — módulo de _brands/{id}/brand.js (ou null = CybersecFEST)
 * @returns {string} HTML completo da arte com tokens da marca aplicados
 */
function renderLayoutForBrand(slug, arte, brand = null) {
  void slug;
  const html = renderLayout(arte.layout || 'C', arte);

  if (!brand || brand.id === 'cybersecfest') return html;

  let result = html;

  // 1. trocar tokens de cor + fonte (ordem importa — rgba antes de hex)
  result = applyTokenReplacements(result, brand.token_replacements || []);

  // 2. trocar logo
  if (brand.logo_asset) {
    result = swapLogo(result, brand.logo_asset);
  }

  // 3. mover logo para esquerda (layout A posiciona à direita por padrão)
  result = moveCastLogoToLeft(result);

  // Eco logos: mantém os mesmos do CybersecFEST (devops, iam, alcatraz)
  // conforme solicitado pelo usuário — não substituir

  return result;
}

module.exports = { renderLayoutForBrand };
