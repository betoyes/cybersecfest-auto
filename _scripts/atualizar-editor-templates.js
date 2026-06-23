'use strict';

/** Reaplica editor v3 nos templates da galeria (preserva editor-state + fundo). */
const fs = require('fs');
const path = require('path');
const { renderLayout } = require('./utils/layouts.js');
const { wrapWithEditor } = require('./utils/editor-wrap.js');
const { extractEditorState } = require('./utils/editor-state.js');
const { gerarThumbComposto } = require('./utils/thumb-composto.js');
const { getLayoutPadraoState, getLayoutPadraoCopy } = require('./utils/template-padroes.js');

const ROOT = path.join(__dirname, '..');
const MANIFEST = path.join(ROOT, 'galeria-templates/manifest.json');

function readFundoBase64(dir) {
  return fs.readFileSync(path.join(dir, 'fundo.png')).toString('base64');
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const copy = manifest.copy || {};

(async () => {
for (const arte of manifest.artes || []) {
  const dir = path.join(ROOT, 'galeria-templates/artes', arte.slug);
  const oldHtml = fs.readFileSync(path.join(dir, 'arte.html'), 'utf8');
  const padraoCopy = getLayoutPadraoCopy(arte.layout);
  const padraoState = getLayoutPadraoState(arte.layout);
  const editorState = padraoState ?? extractEditorState(oldHtml);
  const b64 = readFundoBase64(dir);
  const headline = padraoCopy?.headline ?? copy.headline ?? arte.headline;
  const subtitulo = padraoCopy?.subtitulo ?? copy.subtitulo ?? arte.subtitulo;
  const palavrasAzuis = padraoCopy?.palavras_azuis ?? copy.palavras_azuis ?? arte.palavras_azuis;
  const simple = renderLayout(arte.layout, {
    imageBase64: b64,
    headline,
    subtitulo,
    palavrasAzuis,
    nomePalestrante: copy.nomePalestrante || 'Ana Ribeiro',
    cargoEmpresa: copy.cargoEmpresa || 'CISO · Empresa líder',
  });
  const html = wrapWithEditor(simple, {
    layout: arte.layout,
    headline,
    slug: arte.slug,
    editorState,
    back: '../../index.html',
  });
  fs.writeFileSync(path.join(dir, 'arte.html'), html, 'utf8');
  try {
    await gerarThumbComposto(path.join(dir, 'arte.html'), path.join(dir, 'thumb.png'));
    console.log('✓', arte.slug, '+ thumb');
  } catch (e) {
    console.log('✓', arte.slug, `(thumb: ${e.message})`);
  }
}

console.log('\nEditor v3 atualizado nos templates da galeria.');
})();
