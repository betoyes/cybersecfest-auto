'use strict';

/**
 * DEVOPS BOOTCAMP — Image Prompt Builder
 *
 * Regras de imagem:
 * • SEM PESSOAS por padrão — apenas quando um DevOps engineer ou SRE for explicitamente citado
 * • Identidade visual: Laranja #f97316, fundo #0a0f1e
 * • Estilo: técnico, direto, com foco em resultados práticos e tecnologia
 * • Cenas: infraestrutura de TI, pipelines CI/CD, ambientes de desenvolvimento, elementos técnicos
 */

const STYLE_REF_INSTRUCTION = [
  'DEVOPS BOOTCAMP VISUAL REFERENCES — match their ORANGE TONALITY AND TECHNICAL ENVIRONMENT MOOD.',
  'MOOD BOARD ONLY — do NOT copy composition or layout from references.',
  'Create an ORIGINAL image as described in the text prompt.',
  '',
  'Extract from DEVOPS BOOTCAMP references:',
  '  • orange #f97316 as practical light (LED indicators, screen glow, interface highlights)',
  '  • deep dark background #0a0f1e with selective orange illumination',
  '  • technical contrast — clear focus on technology, vibrant orange accents, professional feel',
  '  • DevOps environments: server racks, code interfaces, cloud architecture diagrams, CI/CD pipelines',
  '',
  'Output: PURE PHOTOGRAPHY or TECHNICAL GRAPHIC, zero text, zero logos.',
].join('\n');

/**
 * Detecta se a cena deve incluir uma pessoa.
 * Só inclui se o usuário mencionou explicitamente um DevOps engineer ou SRE.
 */
function detectPerson(arte = '') {
  const text = arte.toLowerCase();
  // Palavras que indicam pessoa específica solicitada
  const personTriggers = /\b(devops\s+engineer|sre|engenheiro|cto|head\s+de\s+infraestrutura|pessoa|retrato|portrait)\b/;
  return personTriggers.test(text);
}

/**
 * Constrói o prompt de imagem DEVOPS BOOTCAMP.
 *
 * @param {object} arte
 * @param {string} arte.tipo         — tipo de arte (e.g., produto, campanha)
 * @param {string} arte.contextoVisual — contexto da proposta
 * @param {string} arte.slug
 */
function buildImagemPrompt({ tipo, contextoVisual = '', slug = '' } = {}) {
  const wantPerson = detectPerson(contextoVisual);

  const scene = wantPerson
    ? 'DevOps engineer in a high-tech environment, orange LED highlights on equipment, deep dark background, professional pose, photorealistic portrait'
    : 'Abstract technical environment — server racks, CI/CD pipeline visualization, cloud architecture, orange LED indicators, deep dark background, no people';

  void slug;

  const noPeopleProhibition = !wantPerson
    ? [
        '• NO PEOPLE — no faces, no bodies, no hands, no silhouettes of human figures',
        '• NO portraits, no engineers, no executives — equipment and technology ONLY',
      ]
    : [];

  return [
    '=== MANDATORY BACKGROUND PLATE RULES (VIOLATION = INVALID OUTPUT) ===',
    'Output: PURE PHOTOGRAPHY or TECHNICAL ABSTRACT IMAGE — NOT a designed poster, NOT a social graphic with text.',
    '',
    'SCENE (visual content only):',
    scene,
    '',
    'GLOBAL STYLE (non-negotiable):',
    '• Dark technical photography — photorealistic OR stylized abstract, professional atmosphere',
    '• Technical LUT: deep blacks with selective orange highlights, clear contrast',
    '• Orange #f97316 for ALL light sources in the scene',
    '• Dramatic shadows — this is NOT a bright or colorful image',
    '• ORIGINAL composition — creative, elegant, technical design sensibility',
    '',
    'ABSOLUTE PROHIBITIONS (ZERO TOLERANCE):',
    '• NO text, letters, words, numbers, typography, headlines, subtitles, captions of any kind',
    '• NO logos, watermarks, brand names, UI elements, buttons, labels, signs',
    '• NO marketing copy, quotes, hashtags, or readable content',
    '• NO cyan/electric blue — DEVOPS BOOTCAMP uses ORANGE only',
    '• NO warm-only or golden-hour color grade — must have orange light in scene',
    ...noPeopleProhibition,
    '',
    'The HTML overlay will contain ALL text and branding. This image is a silent technical background only.',
  ].join('\n');
}

module.exports = {
  buildImagemPrompt,
  detectPerson,
  STYLE_REF_INSTRUCTION,
};