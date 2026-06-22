'use strict';

const fs   = require('fs');
const path = require('path');

const REF_ROOT = path.join(__dirname, '../../assets/referencias');

const STYLE_REF_INSTRUCTION = [
  'MOOD BOARD ONLY — references are for LIGHTING AND COLOR MOOD, not composition.',
  'DO NOT copy or recreate: faces, poses, glasses, clothing, subject count, camera angle, or scene layout from references.',
  'DO create: a completely ORIGINAL scene as described in the text prompt below.',
  '',
  'Extract from references ONLY:',
  '  • how cyan #14A8F4 appears in the ENVIRONMENT (bokeh, LEDs, screens, city glow, lens flare in background)',
  '  • contrast level and cinematic quality',
  '',
  'SKIN RULE (critical): natural warm skin tones on face, hands, neck — NEVER blue/cyan color grade on skin.',
  'Blue/cyan may touch ONLY: hair edge rim, shoulder edge, background, bokeh, architecture, screens — NOT cheeks or forehead.',
  '',
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
  return 'image/jpeg';
}

/** Carrega até `max` imagens de referência como parts Gemini inlineData */
function loadReferenceParts(filePaths, max = 2) {
  const parts = [];
  for (const fp of filePaths.slice(0, max)) {
    if (!fs.existsSync(fp)) continue;
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

/**
 * Seleciona refs visuais por tipo/layout.
 * Regra: NUNCA anexar retrato quando o output é retrato (evita clone).
 * Preferir cidade/metafora para mood de ambiente; máx 1 ref.
 */
function pickReferencePaths({ tipo = 'blog', layout = 'C', max = 1 } = {}) {
  const ouro      = listPng(path.join(REF_ROOT, 'ouro'));
  const executivo = listPng(path.join(REF_ROOT, 'executivo'));
  const cidade    = listPng(path.join(REF_ROOT, 'cidade'));
  const metafora  = listPng(path.join(REF_ROOT, 'metafora'));

  const picked = [];
  const L = String(layout).toUpperCase();

  if (tipo === 'patrocinador' || L === 'F') {
    if (metafora.length) picked.push(metafora[0]);
    else if (ouro.length) picked.push(ouro[0]);
  } else if (tipo === 'cidade' || ['A', 'H'].includes(L)) {
    if (cidade.length) picked.push(cidade[0]);
  } else if (tipo === 'evento' || L === 'E') {
    if (cidade.length) picked.push(cidade[Math.min(1, cidade.length - 1)] || cidade[0]);
  } else if (L === 'M') {
    // networking — mood de ambiente, não retrato
    if (cidade.length) picked.push(cidade[0]);
    else if (metafora.length) picked.push(metafora[1] || metafora[0]);
  } else if (L === 'N') {
    if (cidade.length) picked.push(cidade[Math.min(1, cidade.length - 1)] || cidade[0]);
  } else if (['C', 'D', 'G', 'K'].includes(L)) {
    // retrato humano — ref de AMBIENTE (skyline/bokeh), nunca retrato executivo
    if (cidade.length) picked.push(cidade[0]);
    else if (ouro.length) picked.push(ouro[ouro.length - 1] || ouro[0]);
  } else {
    if (cidade.length) picked.push(cidade[0]);
  }

  return [...new Set(picked)].slice(0, max);
}

function getReferencePartsForGeneration({ tipo, layout, max = 1 } = {}) {
  const paths = pickReferencePaths({ tipo, layout, max });
  const parts = loadReferenceParts(paths, max);
  return { paths, parts };
}

module.exports = {
  REF_ROOT,
  STYLE_REF_INSTRUCTION,
  pickReferencePaths,
  loadReferenceParts,
  getReferencePartsForGeneration,
};
