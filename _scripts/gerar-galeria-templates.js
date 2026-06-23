'use strict';

/**
 * Galeria de validação — 1 post genérico por layout (A–Q).
 * Copy fixo; imagem de fundo segue regras rígidas do layout (imagem-prompt.js).
 * Não altera artes.json nem temas.json; não passa por propostas/aprovação.
 *
 * Uso: node gerar-galeria-templates.js
 *      node gerar-galeria-templates.js layout=C,E   (só alguns)
 *      node gerar-galeria-templates.js --force      (regenera existentes)
 */

require('./load-env.js');

const fs   = require('fs');
const path = require('path');

const { putBinary, putFile, REPO_ROOT, isLocal, ensureDir } = require('./utils/storage.js');
const { generateImage } = require('./utils/llm.js');
const { buildImagePrompt, getLayoutImageRules, validateLayout, VALID_LAYOUTS } = require('./utils/imagem-prompt.js');
const { renderLayout } = require('./utils/layouts.js');
const { wrapWithEditor } = require('./utils/editor-wrap.js');
const { gerarThumbComposto } = require('./utils/thumb-composto.js');
const { getLayoutPadraoState, getLayoutPadraoCopy, isLayoutAprovado, readPadroes } = require('./utils/template-padroes.js');

const GALLERY_ROOT = 'galeria-templates';
const MANIFEST_PATH = `${GALLERY_ROOT}/manifest.json`;

/** Tipo editorial usado só para cena padrão (SCENE_DEFAULTS) — copy é idêntico em todos */
const LAYOUT_TIPO = {
  A: 'cidade',
  B: 'patrocinador',
  C: 'blog',
  D: 'palestrante',
  E: 'evento',
  F: 'patrocinador',
  G: 'palestrante',
  H: 'cidade',
  I: 'patrocinador',
  J: 'evento',
  K: 'palestrante',
  L: 'evento',
  M: 'blog',
  N: 'blog',
  O: 'blog',
  P: 'evento',
  Q: 'patrocinador',
};

/** Copy genérico único — validação visual dos templates */
const GENERIC_COPY = {
  headline: 'O encontro que<br>redefine<br>cyber no Brasil',
  subtitulo: 'C-Levels, decisores e estratégia em um só lugar.',
  palavras_azuis: 'CYBER, BRASIL',
  cidade: '',
  nomePalestrante: 'Ana Ribeiro',
  cargoEmpresa: 'CISO · Empresa líder',
  legenda:
    'Validação de template — galeria interna CybersecFEST.\n\n'
    + 'Copy genérico para comparar diagramação A–Q com as regras de imagem de fundo por layout.\n\n'
    + '#CybersecFEST #Validacao #Layout',
};

function parseArgs() {
  const force = process.argv.includes('--force');
  const only = [];
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('layout=')) {
      only.push(...arg.slice(7).split(',').map(s => s.trim().toUpperCase()).filter(Boolean));
    }
  }
  const layouts = only.length
    ? only.filter(l => VALID_LAYOUTS.includes(l))
    : [...VALID_LAYOUTS];
  return { force, layouts };
}

function readManifest() {
  const full = path.join(REPO_ROOT, MANIFEST_PATH);
  if (!fs.existsSync(full)) return { version: 1, copy: GENERIC_COPY, artes: [] };
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function writeManifest(manifest) {
  const full = path.join(REPO_ROOT, MANIFEST_PATH);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  writeManifestEmbed(manifest);
}

function writeManifestEmbed(manifest) {
  const embedPath = path.join(REPO_ROOT, GALLERY_ROOT, 'manifest.embed.js');
  const body = `window.__TPL_MANIFEST__=${JSON.stringify(manifest)};\n`;
  fs.writeFileSync(embedPath, body, 'utf8');
}

function cidadeForLayout(layout) {
  return ['A', 'H'].includes(layout) ? 'São Paulo' : GENERIC_COPY.cidade;
}

async function gerarTemplate(layout, { force }) {
  const L = validateLayout(layout);
  const tipoPost = LAYOUT_TIPO[L];
  const slug = `template-${L.toLowerCase()}`;
  const basePath = `${GALLERY_ROOT}/artes/${slug}`;
  const fullBase = path.join(REPO_ROOT, basePath);
  const thumbPath = path.join(fullBase, 'thumb.png');

  if (!force && fs.existsSync(thumbPath)) {
    console.log(`⏭️  Layout ${L} — já existe (${slug}), use --force para regenerar`);
    return { slug, layout: L, skipped: true };
  }

  console.log(`\n━━━ Layout ${L} (${tipoPost}) ━━━`);

  if (isLocal && ensureDir) ensureDir(fullBase);

  const imageRules = getLayoutImageRules(L);
  const cidade = cidadeForLayout(L);

  console.log(`🖼️  Imagem IA · foco: ${imageRules.focusId}`);
  const imgPrompt = buildImagePrompt({
    tipo: tipoPost,
    layout: L,
    contextoVisual: '',
    cidade,
    slug,
  });
  const imgBuffer = await generateImage(imgPrompt, { tipo: tipoPost, layout: L, contextoVisual: '', cidade });
  if (!imgBuffer?.length || imgBuffer.length < 500) {
    throw new Error(`Layout ${L}: imagem inválida (${imgBuffer?.length || 0} bytes)`);
  }

  const imageBase64 = imgBuffer.toString('base64');
  await putBinary(`${basePath}/fundo.png`, imgBuffer, `[Cursor] galeria-templates fundo ${L}`);

  const padraoCopy = getLayoutPadraoCopy(L);
  const headline = padraoCopy?.headline ?? GENERIC_COPY.headline;
  const subtitulo = padraoCopy?.subtitulo ?? GENERIC_COPY.subtitulo;
  const palavrasAzuis = padraoCopy?.palavras_azuis ?? GENERIC_COPY.palavras_azuis;

  let html = renderLayout(L, {
    imageBase64,
    headline,
    subtitulo,
    palavrasAzuis,
    nomePalestrante: GENERIC_COPY.nomePalestrante,
    cargoEmpresa: GENERIC_COPY.cargoEmpresa,
  });
  html = wrapWithEditor(html, {
    layout: L,
    headline,
    slug,
    editorState: getLayoutPadraoState(L) || undefined,
  });
  await putFile(`${basePath}/arte.html`, html, `[Cursor] galeria-templates arte ${L}`);

  const arteFullPath = path.join(REPO_ROOT, basePath, 'arte.html');
  try {
    await gerarThumbComposto(arteFullPath, thumbPath);
    console.log('📸 thumb composto OK');
  } catch (e) {
    console.warn(`⚠️  thumb composto falhou (${e.message}) — usando fundo.png`);
    await putBinary(`${basePath}/thumb.png`, imgBuffer, `[Cursor] galeria-templates thumb ${L}`);
  }

  const timestamp = new Date().toISOString();
  return {
    slug,
    layout: L,
    tipo: tipoPost,
    headline,
    subtitulo,
    palavras_azuis: palavrasAzuis,
    cidade,
    formato: 'feed_vertical',
    legenda: GENERIC_COPY.legenda,
    contexto_visual: '',
    image_rules: {
      layout: L,
      focus: imageRules.focusId,
      focus_en: imageRules.focusEn,
      clear_zones: imageRules.clearZones,
    },
    image_path: `${basePath}/thumb.png`,
    html_path: `${basePath}/arte.html`,
    created_at: timestamp,
    padrao: isLayoutAprovado(L),
    salvo_em: readPadroes().layouts?.[L]?.salvo_em || undefined,
    skipped: false,
  };
}

async function main() {
  const { force, layouts } = parseArgs();
  if (!layouts.length) {
    console.error('Nenhum layout válido. Use layout=A,B ou omita para A–Q.');
    process.exit(1);
  }

  console.log(`\n🎨 Galeria de Templates — ${layouts.length} layout(s)${force ? ' · --force' : ''}`);
  console.log(`   Copy fixo: "${GENERIC_COPY.headline}"`);
  console.log(`   Destino:   ${GALLERY_ROOT}/\n`);

  const manifest = readManifest();
  manifest.version = 1;
  manifest.descricao = 'Validação visual — 17 layouts A–Q · copy genérico · imagem por regras do layout';
  manifest.copy = GENERIC_COPY;
  manifest.updated_at = new Date().toISOString();

  const bySlug = Object.fromEntries((manifest.artes || []).map(a => [a.slug, a]));
  const results = [];

  for (const L of layouts) {
    try {
      const entry = await gerarTemplate(L, { force });
      if (!entry.skipped) {
        bySlug[entry.slug] = entry;
        results.push(entry);
      } else {
        results.push(bySlug[`template-${L.toLowerCase()}`] || entry);
      }
    } catch (e) {
      console.error(`❌ Layout ${L}: ${e.message}`);
      results.push({ layout: L, erro: e.message });
    }
  }

  manifest.artes = VALID_LAYOUTS
    .map(l => bySlug[`template-${l.toLowerCase()}`])
    .filter(Boolean);

  writeManifest(manifest);

  const ok = results.filter(r => !r.erro && !r.skipped).length;
  const skip = results.filter(r => r.skipped).length;
  const fail = results.filter(r => r.erro).length;

  console.log(`\n✅ Concluído: ${ok} gerado(s), ${skip} pulado(s), ${fail} erro(s)`);
  console.log(`   Galeria: http://127.0.0.1:${process.env.PORT || 8765}/galeria-templates/\n`);

  if (fail && !ok) process.exit(1);
}

main().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
