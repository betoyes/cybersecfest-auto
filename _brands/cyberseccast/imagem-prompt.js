'use strict';

/**
 * CYBERSEC.CAST — Image Prompt Builder
 *
 * Regras de imagem:
 * • SEM PESSOAS por padrão — apenas quando convidado/host for explicitamente citado
 * • Identidade visual: Indigo #6366f1 / Violet #8b5cf6, fundo #07060f
 * • Estilo: podcast premium abstrato, elementos gráficos, LUT cinematográfico
 * • Cenas: equipamentos, estúdio, luz LED, grafismos elegantes — não palco de evento
 */

const { LAYOUT_IMAGE_RULES, VALID_LAYOUTS, validateLayout } = require('../../_scripts/utils/imagem-prompt.js');

/** Instrução de estilo para referências CAST */
const CAST_STYLE_REF_INSTRUCTION = [
  'CAST VISUAL REFERENCES — match their INDIGO/VIOLET TONALITY AND PODCAST STUDIO MOOD.',
  'MOOD BOARD ONLY — do NOT copy composition or layout from references.',
  'Create an ORIGINAL image as described in the text prompt.',
  '',
  'Extract from CAST references:',
  '  • indigo #6366f1 and violet #8b5cf6 as practical light (LED rings, monitor glow, backlight halos)',
  '  • near-void dark background #07060f with selective indigo/violet illumination',
  '  • cinematic contrast — intimate darkness, vibrant indigo/violet accents, premium feel',
  '  • podcast studio elements: professional microphones, acoustic panels, glass surfaces, LED strips',
  '',
  'Output: PURE PHOTOGRAPHY or ABSTRACT GRAPHIC, zero text, zero logos.',
].join('\n');

/** Lei do Indigo — cor de acento CAST */
const CAST_INDIGO_STYLE = [
  'CAST INDIGO ACCENT LAW — executive podcast visual identity:',
  '• Primary accent: deep indigo #6366f1 — practical light IN the scene (LED rings, backlighting, monitor glow)',
  '• Secondary accent: violet #8b5cf6 — rim light on edges of objects, subtle fill in shadows',
  '• Background: near-void dark #07060f — pure darkness with selective indigo/violet illumination',
  '• NO cyan/blue (#14A8F4) — this is CAST, NOT CybersecFEST',
  '• Reflective surfaces (glass, microphone chrome, acoustic panels, tabletop) catching indigo glow',
  '• Cinematic contrast: premium darkness, vibrant indigo/violet accents, intimate executive atmosphere',
  '• Cinematic LUT: deep blacks, crushed shadows with selective indigo highlight, filmic grain acceptable',
];

/**
 * Detecta se a cena deve incluir uma pessoa.
 * Só inclui se o usuário mencionou explicitamente um convidado/host pelo nome.
 */
function detectPerson(userScene = '', contextoVisual = '') {
  const text = `${userScene} ${contextoVisual}`.toLowerCase();
  // Palavras que indicam pessoa específica solicitada
  const personTriggers = /\b(convidado|host|edgar|amanda|paulo|conduta|fagner|leandro|renan|vitor|izaias|bruno|palestrante|entrevistado|ciso|executivo\s+de\s+frente|pessoa|retrato|portrait)\b/;
  return personTriggers.test(text);
}

/**
 * Cenas abstratas por layout — sem pessoas.
 * Podcast premium com elementos gráficos e LUT cinematográfico.
 */
const CAST_ABSTRACT_SCENES = {
  // ── Layouts com banda de imagem no topo (insight) ──
  A: 'Hero shot of a single professional podcast microphone, indigo LED ring light reflection on chrome, dark acoustic foam panel background, deep field of view, zero people, cinematic still-life photography',
  H: 'Wide shot of empty premium podcast studio upper area — acoustic panels with indigo LED strip backlighting, glass partition with violet glow, microphone stand in silhouette, architectural dark studio photography',
  L: 'Dark podcast studio interior wide angle — multiple microphones on a glass table reflecting indigo ceiling lights, acoustic treatment walls, violet bokeh in background, no people, cinematic production photography',
  J: 'Overhead bird-eye view of a dark podcast table setup — two microphones facing each other, indigo glow from under the table, scattered notes and earphones, no people, still-life documentary photography',

  // ── Layouts com split ou painel lateral ──
  B: 'Dark studio split — left side: indigo LED acoustic foam texture, right: abstract microphone silhouette in violet backlight, cinematic editorial photography, no people',
  D: 'Premium microphone close-up, indigo LED halo illuminating the grille, dark studio bokeh with violet rim light on background elements, no people, product photography with cinematic LUT',
  E: 'Abstract podcast studio — dramatic indigo backlight halo through glass partition creating silhouette of studio equipment (no people), deep blacks, violet light leak on edges, cinematic',
  F: 'Two microphone stands facing each other, dark empty podcast table, indigo architectural LED in background panels, symbolic representation of a conversation without people, cinematic wide',

  // ── Layouts centralizados ──
  C: 'Extreme close-up of professional condenser microphone top, indigo specular reflection on capsule, deep black background, violet rim on windscreen foam, ultra sharp, editorial product photography',
  G: 'Top-down symmetrical shot of podcast microphone on glass desk, indigo light ring reflection perfect circle on table surface, dark background, geometric minimal composition, no people',
  K: 'Vertical strip composition — podcast microphone on the right, left side deep dark with indigo gradient, acoustic panel texture visible, intimate studio atmosphere, no people',
  I: 'Abstract hexagonal bokeh pattern in indigo and violet tones — cybersecurity concept, dark background with luminous geometric shapes, cinematic abstract photography, no people',

  // ── Layouts de destaque / wide ──
  M: 'Two empty executive podcast chairs facing each other across a dark glass table, indigo ambient LED glow from ceiling panels, symbolic conversation setup without people, architectural photography',
  N: 'Upper quadrant of a dark podcast studio — indigo LED strip on ceiling edge, acoustic foam texture, microphone arm partially visible, abstract architectural close-up, no people',
  O: 'Dark theatrical podcast stage — single spotlight in indigo light illuminating an empty mic stand center stage, dramatic shadow cast on dark floor, cinematic theatrical photography, no people',
  P: 'Premium podcast studio wide shot from above — empty curved desk with microphones, indigo LED ceiling, violet-lit acoustic panels on walls, empty chairs, architectural bird-eye, no people',
  Q: 'Panoramic dark studio setup — microphones on both left and right edges, center area intentionally empty (dark void), indigo accent lights in background panels, cinematic wide composition, no people',
};

/**
 * Cenas com pessoa — só usadas quando convidado/host é explicitamente citado.
 * Mantém o mesmo padrão: indigo/violet, estúdio premium, sem texto na cena.
 */
const CAST_PERSON_SCENES = {
  episodio: {
    C: 'Executive podcast host in premium dark studio, indigo LED ring light creating violet rim on shoulder, acoustic panels behind, professional microphone in blur, warm natural skin tone, photorealistic portrait',
    G: 'Magazine-style executive portrait in podcast studio, indigo backlight halo, premium dark setup, centered subject, close-up',
    M: 'Two executives in deep conversation at premium podcast table, dark ambient studio, indigo accent lights on walls, warm skin tones, cinematic wide',
    N: 'Executive host at premium studio with indigo architectural lighting, natural skin, professional pose',
  },
  convidado: {
    D: 'Guest executive in confident pose at podcast desk, indigo rim light, dark premium studio, microphone in soft focus background',
    F: 'Guest executive in dark executive environment, indigo accent lighting, professional corporate photography',
    B: 'Guest speaker executive, dark split studio, indigo ambient lighting, intimate podcast atmosphere',
    K: 'Guest executive portrait with vertical acoustic panels, dark studio backdrop, indigo accent lighting',
  },
  insight: {
    A: 'Executive workspace, dark premium environment, indigo city glow through window, high-rise perspective',
    H: 'Single executive in premium dark studio, indigo architectural accent lights, executive atmosphere',
    J: 'Executive at intimate dark podcast table, indigo ambient lighting, cinematic framing',
    L: 'Executive in wide podcast studio, dark cinematic shot, indigo LED accents, intimate atmosphere',
  },
};

const CAST_PERSON_FALLBACK = 'Executive professional in premium dark podcast studio, indigo LED rim light, natural warm skin tone, microphone visible in background, intimate cinematic portrait, no text in scene';

/**
 * Zones protegidas pelo logo CAST por layout.
 */
const CAST_LOGO_PROTECTED_ZONES = {
  A: 'TOP-RIGHT corner (top 20%, right 25%): CAST logo overlay — keep top-right dark/clear.',
  B: 'RIGHT PANEL top area: CAST logo — keep top-right of right panel clear.',
  C: 'TOP-LEFT corner (top 20%, left 25%): CAST logo overlay — keep top-left dark/clear.',
  D: 'TOP-LEFT corner: CAST logo — keep upper-left 30% clear.',
  E: 'TOP-LEFT area: CAST logo — top-left must remain dark.',
  F: 'TOP-RIGHT corner: CAST logo — keep top-right clear.',
  G: 'TOP-LEFT corner: CAST logo — keep top-left 20% dark.',
  H: 'TOP-LEFT corner: CAST logo — upper-left must be dark negative space.',
  I: 'TOP-RIGHT corner: CAST logo — subject in left two-thirds only.',
  J: 'TOP-LEFT corner: CAST logo — keep top-left 25% clear.',
  K: 'TOP-RIGHT corner: CAST logo — subject in left/center strip.',
  L: 'TOP-LEFT corner: CAST logo — wide shot, content on right side.',
  M: 'TOP-RIGHT corner: CAST logo — keep top-right dark.',
  N: 'TOP-LEFT corner: CAST logo — content in upper-right.',
  O: 'TOP-RIGHT corner: CAST logo — theatrical elements avoid top-right.',
  P: 'TOP-LEFT corner: CAST logo — content upper-center avoids top-left.',
  Q: 'TOP-RIGHT corner: CAST logo — content on left/center, right edge dark.',
};

/**
 * Constrói o prompt de imagem CAST.
 *
 * @param {object} opts
 * @param {string} opts.tipo         — episodio | convidado | insight
 * @param {string} opts.layout       — A–Q
 * @param {string} [opts.userScene]  — instrução explícita do usuário
 * @param {string} [opts.contextoVisual] — contexto da proposta
 * @param {string} [opts.slug]
 */
function buildCastImagePrompt({ tipo = 'episodio', layout = 'C', userScene = '', contextoVisual = '', slug = '' } = {}) {
  const L = validateLayout(layout);
  const rules = LAYOUT_IMAGE_RULES[L];
  const logoZone = CAST_LOGO_PROTECTED_ZONES[L] || '';

  // Detecta se uma pessoa foi explicitamente solicitada
  const wantPerson = detectPerson(userScene, contextoVisual);

  let scene;
  if (userScene) {
    scene = `${userScene.trim()} — maintain all layout composition rules (subject placement and clear zones are MANDATORY)`;
  } else if (wantPerson) {
    const tipoScenes = CAST_PERSON_SCENES[tipo] || {};
    scene = tipoScenes[L] || CAST_PERSON_FALLBACK;
  } else {
    scene = CAST_ABSTRACT_SCENES[L] || CAST_ABSTRACT_SCENES.C;
  }

  void slug;

  const noPeopleProhibition = !wantPerson && !userScene
    ? [
        '• NO PEOPLE — no faces, no bodies, no hands, no silhouettes of human figures',
        '• NO portraits, no executives, no speakers, no hosts — equipment and atmosphere ONLY',
      ]
    : [];

  return [
    '=== MANDATORY BACKGROUND PLATE RULES (VIOLATION = INVALID OUTPUT) ===',
    'Output: PURE PHOTOGRAPHY or CINEMATIC ABSTRACT IMAGE — NOT a designed poster, NOT a social graphic with text.',
    '',
    `LAYOUT ${L} — IMAGE COMPOSITION CONTRACT:`,
    `• Visual focus (REQUIRED): ${rules.focusEn} [${rules.focusId}]`,
    ...rules.clearZones.map(z => `• CLEAR ZONE (text band): ${z}`),
    ...(logoZone ? [`• CLEAR ZONE (CAST logo): ${logoZone}`] : []),
    '',
    'SCENE (visual content only):',
    scene,
    '',
    'GLOBAL STYLE (non-negotiable):',
    '• Dark cinematic podcast photography — photorealistic OR stylized abstract, premium atmosphere',
    '• Cinematic LUT: deep blacks with selective indigo/violet highlights, filmic contrast',
    '• Indigo #6366f1 and violet #8b5cf6 for ALL light sources in the scene',
    '• Dramatic shadows — this is NOT a bright or colorful image',
    '• ORIGINAL composition — creative, elegant, graphic design sensibility',
    '',
    ...CAST_INDIGO_STYLE,
    '',
    'ABSOLUTE PROHIBITIONS (ZERO TOLERANCE):',
    '• NO text, letters, words, numbers, typography, headlines, subtitles, captions of any kind',
    '• NO logos, watermarks, brand names, UI elements, buttons, labels, signs',
    '• NO marketing copy, quotes, hashtags, or readable content',
    '• NO cyan/electric blue (#14A8F4) — CAST uses INDIGO/VIOLET only',
    '• NO warm-only or golden-hour color grade — must have indigo/violet light in scene',
    ...noPeopleProhibition,
    '',
    'The HTML overlay will contain ALL text and branding. This image is a silent cinematic background only.',
  ].join('\n');
}

module.exports = {
  buildCastImagePrompt,
  CAST_INDIGO_STYLE,
  CAST_ABSTRACT_SCENES,
  CAST_PERSON_SCENES,
  CAST_STYLE_REF_INSTRUCTION,
  detectPerson,
};
