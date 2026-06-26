'use strict';

const fs   = require('fs');
const path = require('path');

const REF_ROOT = path.join(__dirname, '../../assets/referencias-cast');

/** Instrução de estilo para as referências visuais do CAST */
const CAST_STYLE_REF_INSTRUCTION = [
  'CAST VISUAL REFERENCES — match their INDIGO TONALITY AND INTIMATE PODCAST MOOD.',
  'MOOD BOARD ONLY — do NOT copy composition, faces, poses, or subject layout from references.',
  'Create an ORIGINAL scene as described in the text prompt.',
  '',
  'Extract from CAST references:',
  '  • deep indigo #6366f1 as practical light IN THE SCENE (LED rings, monitor glow, window reflections)',
  '  • violet #8b5cf6 as rim light on hair/shoulder edge',
  '  • near-void dark #07060f background with selective indigo illumination',
  '  • intimate executive atmosphere — podcast studio, close-up portraits, conversation framing',
  '  • premium dark production quality — NOT event photography',
  '',
  'SKIN RULE: natural warm skin on face/hands — indigo ONLY in environment, rim on hair/shoulder.',
  'Output: PURE PHOTOGRAPHY, zero text.',
].join('\n');

function listImages(dir) {
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

/**
 * Retorna caminhos de referência para o CAST.
 * Usa as imagens do site do CAST como moodboard.
 */
function getCastReferencePaths({ max = 2 } = {}) {
  const all = listImages(REF_ROOT);
  return all.slice(0, max);
}

function getCastReferencePartsForGeneration({ max = 2 } = {}) {
  const paths = getCastReferencePaths({ max });
  const parts = loadReferenceParts(paths, max);
  return { paths, parts };
}

module.exports = {
  REF_ROOT,
  CAST_STYLE_REF_INSTRUCTION,
  getCastReferencePaths,
  getCastReferencePartsForGeneration,
  loadReferenceParts,
};
