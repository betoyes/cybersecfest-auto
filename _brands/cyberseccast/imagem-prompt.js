'use strict';

/**
 * CYBERSEC.CAST — Image Prompt Builder
 * Mesmo contrato de saída que imagem-prompt.js do CybersecFEST,
 * porém com identidade visual do podcast executivo:
 * • Indigo/Violet (#6366f1 / #8b5cf6) em vez de Cyan (#14A8F4)
 * • Estúdio de podcast, entrevistas, close-up de líderes, microfone premium
 * • Tom: íntimo, intelectual, premium — não "evento de palco"
 */

const { LAYOUT_IMAGE_RULES, VALID_LAYOUTS, validateLayout } = require('../../_scripts/utils/imagem-prompt.js');

/** Lei do Indigo — análogo ao CYBER_BLUE_STYLE do CybersecFEST */
const CAST_INDIGO_STYLE = [
  'CAST INDIGO ACCENT LAW — match executive podcast visual identity:',
  '• Primary accent: deep indigo #6366f1 — practical light IN the scene (LED rings, backlighting, monitor glow, window reflections)',
  '• Secondary accent: violet #8b5cf6 — used as rim light on hair/shoulder edge, subtle fill in shadows',
  '• Background: near-void dark #07060f — pure darkness with selective indigo illumination',
  '• NO cyan/blue (#14A8F4) — this is NOT CybersecFEST — the accent is INDIGO/VIOLET only',
  '• Reflective surfaces (glass table, microphone, acoustic panels) catching indigo glow when scene allows',
  '• Cinematic contrast: dark premium environment, vibrant indigo/violet accents, intimate executive feel',
  '• SKIN: natural warm skin on face/hands — indigo ONLY in environment, rim light on hair/shoulders',
  '• Exposure: readable midtones — NOT crushed black; faces must be legible',
];

/** Cenas padrão CAST por tipo + layout */
const CAST_SCENE_DEFAULTS = {
  episodio: {
    C: 'Executive podcast host in premium dark studio, indigo LED ring light creating violet rim on shoulder, acoustic panels behind, professional microphone in blur, warm natural skin tone, photorealistic intimate portrait',
    G: 'Magazine-style executive portrait in podcast studio, indigo backlight halo, premium dark setup, centered subject, close-up with microphone detail in background blur',
    M: 'Two executives in deep conversation at premium podcast table, dark ambient studio, indigo accent lights on walls and table reflections, warm skin tones visible, cinematic wide shot',
    N: 'Executive host gesturing thoughtfully, dark studio with visible acoustic treatment, indigo LED strip on ceiling, subject in upper-right, natural skin, premium atmosphere',
  },
  convidado: {
    D: 'Guest executive in confident three-quarter pose at podcast desk, indigo rim light, dark premium studio, microphone and monitor in soft focus background',
    F: 'Keynote speaker in dark executive environment, indigo accent architecture behind, premium venue, professional corporate photography',
    B: 'Guest speaker executive, dark split studio environment, indigo ambient lighting, intimate podcast atmosphere',
    E: 'Executive silhouette from behind in dark studio looking at monitors, brilliant indigo backlight halo, dramatic intimate atmosphere',
  },
  insight: {
    A: 'Premium executive workspace at dusk, dark ambient with indigo city glow through window, high-rise perspective, corporate photography',
    H: 'Dark premium conference or studio space in upper frame, indigo architectural accent lights, executive atmosphere, wide cinematic shot',
    J: 'Executive roundtable in intimate dark studio setup, indigo ambient lighting, premium podcast environment, cinematic framing',
    L: 'Premium podcast studio interior, dark cinematic wide shot, indigo LED accents in panels and ceiling, executive atmosphere',
  },
};

/** Fallback de cena por layout — cobre todos os 17 layouts para o CAST */
const CAST_LAYOUT_SCENE_FALLBACK = {
  A: 'Executive workspace at dusk through high-rise window, dark premium environment, indigo city glow, corporate photography',
  B: 'Dark premium podcast studio, executive figure in soft focus, indigo ambient lighting, intimate professional atmosphere',
  C: 'Executive host portrait, premium dark studio, indigo LED rim light, natural warm skin, professional microphone in background blur',
  D: 'Guest executive at podcast desk, indigo backlight, dark studio, monitors in background, cinematic intimate framing',
  E: 'Executive silhouette in dark studio, brilliant indigo backlight halo, dramatic atmosphere',
  F: 'Executives in premium dark studio environment, indigo accent lighting, professional photography',
  G: 'Magazine-style executive portrait, dark studio, indigo rim light, centered subject, premium podcast atmosphere',
  H: 'Dark premium studio or venue upper frame, indigo architectural lighting, wide cinematic shot',
  I: 'Executive in conversation, dark studio environment, indigo accent lights, intimate professional atmosphere',
  J: 'Podcast roundtable setup, dark premium studio, indigo ambient light, executive atmosphere, cinematic',
  K: 'Executive portrait with vertical acoustic panels, dark studio backdrop, indigo accent lighting',
  L: 'Wide dark podcast studio interior, executives in background blur, indigo LED accents',
  M: 'Two executives in deep conversation, dark studio, natural skin tones, indigo lights in environment bokeh, readable exposure',
  N: 'Executive in premium studio with indigo architectural lighting in background, natural skin, original pose top-right',
  O: 'Dark intimate studio with indigo floor spotlight, audience or guest silhouettes in upper frame, theatrical executive atmosphere',
  P: 'Premium podcast studio interior wide shot, indigo LED accents, subject upper-center, dark cinematic mood',
  Q: 'Wide executive discussion scene with visual weight on left and right edges, dark studio, indigo bokeh, center area empty',
};

/**
 * Constrói o prompt de imagem para o CYBERSEC.CAST.
 * Mesmo contrato de imagem-prompt.js — layout rules A–Q idênticos,
 * só o estilo/cenas/cor de acento mudam.
 *
 * @param {object} opts
 * @param {string} opts.tipo    — episodio | convidado | insight
 * @param {string} opts.layout  — A–Q
 * @param {string} [opts.userScene] — instrução do usuário (sobrepõe cena padrão)
 * @param {string} [opts.slug]
 */
function buildCastImagePrompt({ tipo = 'episodio', layout = 'C', userScene = '', slug = '' } = {}) {
  const L = validateLayout(layout);
  const rules = LAYOUT_IMAGE_RULES[L];

  const tipoScenes = CAST_SCENE_DEFAULTS[tipo] || {};
  const defaultScene = tipoScenes[L] || CAST_LAYOUT_SCENE_FALLBACK[L];
  const scene = userScene
    ? `${userScene.trim()} — maintain all layout composition rules above (subject placement and clear zones are MANDATORY)`
    : defaultScene;

  void slug;

  return [
    '=== MANDATORY BACKGROUND PLATE RULES (VIOLATION = INVALID OUTPUT) ===',
    'Output: PURE PHOTOGRAPHY ONLY — NOT a designed poster, NOT a social graphic with text.',
    '',
    `LAYOUT ${L} — IMAGE COMPOSITION CONTRACT:`,
    `• Subject focus (REQUIRED): ${rules.focusEn} [${rules.focusId}]`,
    ...rules.clearZones.map(z => `• CLEAR ZONE: ${z}`),
    '',
    'SCENE (visual content only):',
    scene,
    '',
    'GLOBAL STYLE (non-negotiable):',
    '• Dark cinematic executive podcast photography — photorealistic, premium intimate atmosphere',
    '• Readable exposure on subject — NOT crushed black silhouette',
    '• Indigo/violet (#6366f1 / #8b5cf6) in environment and atmosphere — natural skin on people',
    '• ORIGINAL composition — do not clone reference images or repeat scenes',
    '• Leave explicit negative space exactly where CLEAR ZONE rules specify',
    '• Podcast studio elements welcome: microphone, acoustic panels, monitors (in blur/background only)',
    '',
    ...CAST_INDIGO_STYLE,
    '',
    'ABSOLUTE PROHIBITIONS (ZERO TOLERANCE):',
    '• NO text, letters, words, numbers, typography, headlines, subtitles, captions',
    '• NO logos, watermarks, brand names, UI elements, buttons, labels, signs',
    '• NO marketing copy, quotes, hashtags, or readable content of any kind',
    '• NO designed layout elements — HTML layers will be added separately',
    '• NO cyan/electric blue (#14A8F4) color grade — this is CAST identity, not CybersecFEST',
    '• NO warm-only color grade (reject if zero indigo/violet visible in environment)',
    '• NO blue or indigo tint or color grade on human skin',
    '',
    'The HTML overlay will contain ALL text. This image is the silent photographic background only.',
  ].join('\n');
}

module.exports = {
  buildCastImagePrompt,
  CAST_INDIGO_STYLE,
  CAST_SCENE_DEFAULTS,
  CAST_LAYOUT_SCENE_FALLBACK,
};
