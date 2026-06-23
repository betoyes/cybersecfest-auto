'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const GALLERY_ROOT = path.join(ROOT, 'galeria-templates');
const MANIFEST_PATH = path.join(GALLERY_ROOT, 'manifest.json');
const EMBED_PATH = path.join(GALLERY_ROOT, 'manifest.embed.js');
const PADROES_PATH = path.join(GALLERY_ROOT, 'layout-padroes.json');

function isTemplateSlug(slug) {
  return /^template-[a-q]$/i.test(String(slug || ''));
}

function layoutFromTemplateSlug(slug) {
  const m = String(slug || '').match(/^template-([a-q])$/i);
  return m ? m[1].toUpperCase() : null;
}

function readPadroes() {
  if (!fs.existsSync(PADROES_PATH)) return { version: 1, layouts: {} };
  try {
    return JSON.parse(fs.readFileSync(PADROES_PATH, 'utf8'));
  } catch {
    return { version: 1, layouts: {} };
  }
}

function writePadroes(data) {
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(PADROES_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function writeManifestEmbed(manifest) {
  fs.writeFileSync(EMBED_PATH, `window.__TPL_MANIFEST__=${JSON.stringify(manifest)};\n`, 'utf8');
}

function resolveTemplatePaths(slug) {
  const base = path.join(GALLERY_ROOT, 'artes', slug);
  return {
    isTemplate: true,
    layout: layoutFromTemplateSlug(slug),
    artePath: path.join(base, 'arte.html'),
    thumbPath: path.join(base, 'thumb.png'),
  };
}

function resolveArtePaths(slug) {
  if (isTemplateSlug(slug)) return resolveTemplatePaths(slug);
  return {
    isTemplate: false,
    layout: null,
    artePath: path.join(ROOT, 'artes', slug, 'arte.html'),
    thumbPath: path.join(ROOT, 'artes', slug, 'thumb.png'),
  };
}

/**
 * Marca template salvo como padrão do layout (A–Q).
 * Atualiza manifest + layout-padroes.json + manifest.embed.js
 */
function promoteTemplatePadrao(slug, editorState, { copy: copyOverride } = {}) {
  const layout = layoutFromTemplateSlug(slug);
  if (!layout) throw new Error(`Slug de template inválido: ${slug}`);

  const now = new Date().toISOString();

  let arteCopy = copyOverride || null;
  if (!arteCopy && fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const arte = (manifest.artes || []).find(a => a.slug === slug);
    const global = manifest.copy || {};
    if (arte) {
      arteCopy = {
        headline: arte.headline || global.headline,
        subtitulo: arte.subtitulo || global.subtitulo,
        palavras_azuis: arte.palavras_azuis || global.palavras_azuis,
      };
    }
  }

  const padroes = readPadroes();
  padroes.layouts[layout] = {
    slug,
    layout,
    aprovado: true,
    salvo_em: now,
    html_path: `galeria-templates/artes/${slug}/arte.html`,
    thumb_path: `galeria-templates/artes/${slug}/thumb.png`,
    copy: arteCopy,
    editor_state: editorState,
  };
  writePadroes(padroes);

  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    manifest.updated_at = now;
    manifest.artes = (manifest.artes || []).map(a => {
      const L = layoutFromTemplateSlug(a.slug);
      const entry = L ? padroes.layouts?.[L] : null;
      const isPadrao = !!(entry?.aprovado && entry.slug === a.slug);
      return {
        ...a,
        padrao: isPadrao,
        salvo_em: isPadrao ? (entry.salvo_em || now) : a.salvo_em,
      };
    });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    writeManifestEmbed(manifest);
  }

  return { layout, slug, salvo_em: now };
}

function getLayoutPadraoState(layout) {
  const L = String(layout || '').toUpperCase();
  const padroes = readPadroes();
  const entry = padroes.layouts?.[L];
  if (!entry?.editor_state) return null;
  return entry.editor_state;
}

function getLayoutPadraoCopy(layout) {
  const L = String(layout || '').toUpperCase();
  const entry = readPadroes().layouts?.[L];
  return entry?.copy || null;
}

function isLayoutAprovado(layout) {
  const L = String(layout || '').toUpperCase();
  return !!readPadroes().layouts?.[L]?.aprovado;
}

function getLayoutPadraoSlug(layout) {
  const L = String(layout || '').toUpperCase();
  return readPadroes().layouts?.[L]?.slug || `template-${L.toLowerCase()}`;
}

module.exports = {
  isTemplateSlug,
  layoutFromTemplateSlug,
  resolveArtePaths,
  promoteTemplatePadrao,
  getLayoutPadraoState,
  getLayoutPadraoCopy,
  getLayoutPadraoSlug,
  isLayoutAprovado,
  readPadroes,
  PADROES_PATH,
};
