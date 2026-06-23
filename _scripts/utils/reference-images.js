'use strict';

const fs   = require('fs');
const path = require('path');

const REF_ROOT = path.join(__dirname, '../../assets/referencias');

/** Fundos reais das artes #1 e #2 — padrão ouro de tonalidade azul */
const GRANDE_REFERENCIA = {
  patrocinador: path.join(REF_ROOT, 'ouro/01-arte-patrocinador-xadrez-grid.jpeg'),
  evento:       path.join(REF_ROOT, 'ouro/02-arte-evento-silhueta-backlight.png'),
};

const STYLE_REF_INSTRUCTION = [
  'GOLD STANDARD REFERENCES (#1 patrocinador + #2 evento) — match their BLUE TONALITY AND LIGHTING MOOD.',
  'MOOD BOARD ONLY — do NOT copy composition, faces, poses, or subject layout from references.',
  'Create an ORIGINAL scene as described in the text prompt.',
  '',
  'Extract from gold references (#1 chess/grid glow, #2 silhouette + cyan backlight + city):',
  '  • saturated cool cyan #14A8F4 as practical light IN THE SCENE (glow rings, backlight halo, city LEDs)',
  '  • deep navy shadows #02050A with luminous blue highlights — NOT flat grey darkness',
  '  • reflective surfaces catching blue (grid floor, glass, metal) when scene allows',
  '  • cinematic contrast: dark environment, vibrant blue accents, premium executive feel',
  '',
  'SKIN RULE: natural warm skin on face/hands — blue ONLY in environment, rim on hair/shoulder edge.',
  'Output: PURE PHOTOGRAPHY, zero text.',
].join('\n');

function listPng(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /\.(png|jpe?g|webp)$/i.test(f))
    .map(f => path.join(dir, f));
}

function mimeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png')  return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'image/jpeg';
}

function loadReferenceParts(filePaths, max = 2) {
  const parts = [];
  for (const fp of filePaths.slice(0, max)) {
    if (!fp || !fs.existsSync(fp)) continue;
    const buf = fs.readFileSync(fp);
    if (buf.length < 500) continue;
    parts.push({
      inlineData: {
        mimeType: mimeFor(fp),
        data: buf.toString('base64'),
      },
    });
  }
  return parts;
}

/** Escolhe qual grande referência (#1 ou #2) lidera por tipo/layout */
function pickGrandeReferencia({ tipo = 'blog', layout = 'C' } = {}) {
  const L = String(layout).toUpperCase();
  if (tipo === 'patrocinador' || L === 'F' || L === 'I') {
    return GRANDE_REFERENCIA.patrocinador;
  }
  if (tipo === 'evento' || ['E', 'A', 'H'].includes(L)) {
    return GRANDE_REFERENCIA.evento;
  }
  if (['C', 'D', 'G', 'K', 'M', 'N'].includes(L)) {
    // humanizado → ref #2 (backlight/silhueta mood); alterna com slug em prompt
    return GRANDE_REFERENCIA.evento;
  }
  // metafora, cidade, default → ref #1 (grid/glow/material)
  return GRANDE_REFERENCIA.patrocinador;
}

/** Ref complementar por tipo/layout — moodboard legado (cidade/metafora/executivo/ouro) */
const { detectLandmarkIntent } = require('./imagem-prompt.js');

function pickSupplementalRef({ tipo = 'blog', layout = 'C', contextoVisual = '', cidade = '' } = {}) {
  const L = String(layout).toUpperCase();
  const cidadeDir = listPng(path.join(REF_ROOT, 'cidade'));
  const metafora  = listPng(path.join(REF_ROOT, 'metafora'));
  const executivo = listPng(path.join(REF_ROOT, 'executivo'));
  const ouroLegado = listPng(path.join(REF_ROOT, 'ouro'))
    .filter(f => !f.includes('arte-patrocinador') && !f.includes('arte-evento'));

  const wantCity = detectLandmarkIntent(`${contextoVisual} ${cidade}`);
  if (wantCity && cidadeDir.length) return cidadeDir[0];

  if (tipo === 'patrocinador' || L === 'F') return metafora[0] || ouroLegado[0];
  if (tipo === 'evento' || ['E', 'A', 'H'].includes(L)) return cidadeDir[0] || cidadeDir[1];
  if (['C', 'D', 'G', 'K', 'M', 'N'].includes(L)) return executivo[0] || cidadeDir[0];
  if (['B', 'I', 'J', 'L'].includes(L)) return cidadeDir[0] || executivo[0];
  return ouroLegado[0] || cidadeDir[0] || metafora[0];
}

/**
 * Slots: 1–2 = grande referência #1/#2 | 3 = moodboard legado (cidade/metafora/executivo/ouro)
 */
function pickReferencePaths({ tipo = 'blog', layout = 'C', max = 3, contextoVisual = '', cidade = '' } = {}) {
  const picked = [];
  const wantCity = detectLandmarkIntent(`${contextoVisual} ${cidade}`);
  const grande = wantCity
    ? (pickGrandeReferencia({ tipo: 'evento', layout: 'H' }) || pickGrandeReferencia({ tipo, layout }))
    : pickGrandeReferencia({ tipo, layout });
  if (fs.existsSync(grande)) picked.push(grande);

  const otherGrande = grande === GRANDE_REFERENCIA.patrocinador
    ? GRANDE_REFERENCIA.evento
    : GRANDE_REFERENCIA.patrocinador;

  if (max >= 2 && fs.existsSync(otherGrande)) {
    if (wantCity) {
      // Cidade/landmark: ref #2 (evento) + mood BH — nunca xadrez #1
      const cidadeRefs = listPng(path.join(REF_ROOT, 'cidade'));
      const bh = cidadeRefs.find(f => /niemeyer|pampulha|bh/i.test(path.basename(f)));
      const cityRef = bh || cidadeRefs[0];
      if (cityRef && !picked.includes(cityRef)) picked.push(cityRef);
    } else if (tipo === 'blog' || tipo === 'evento') {
      picked.push(otherGrande);
    }
  }

  if (max >= 3) {
    const sup = pickSupplementalRef({ tipo, layout, contextoVisual, cidade });
    if (sup && fs.existsSync(sup)) picked.push(sup);
  } else if (max === 2 && picked.length < 2) {
    const sup = pickSupplementalRef({ tipo, layout, contextoVisual, cidade });
    if (sup && fs.existsSync(sup)) picked.push(sup);
  }

  return [...new Set(picked)].slice(0, max);
}

function getReferencePartsForGeneration({ tipo, layout, max = 3, contextoVisual = '', cidade = '' } = {}) {
  const paths = pickReferencePaths({ tipo, layout, max, contextoVisual, cidade });
  const parts = loadReferenceParts(paths, max);
  return { paths, parts };
}

module.exports = {
  REF_ROOT,
  GRANDE_REFERENCIA,
  STYLE_REF_INSTRUCTION,
  pickGrandeReferencia,
  pickSupplementalRef,
  pickReferencePaths,
  loadReferenceParts,
  getReferencePartsForGeneration,
};
