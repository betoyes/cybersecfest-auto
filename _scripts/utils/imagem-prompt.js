'use strict';

/**
 * Regras RÍGIDAS de imagem de fundo por layout (A–N).
 * A imagem é APENAS fotografia — texto/copy vive no HTML por cima.
 * Referência: SKILL Gerador de Artes v2.6 + layouts.js
 */

const VALID_LAYOUTS = 'ABCDEFGHIJKLMN'.split('');

/** Artes de referência visual — padrão ouro do Design System (tons azuis na fotografia) */
const REFERENCE_ARTES = [
  'patrocinador-1782039190901', // #1 — peça + grid azul
  'evento-1782045624931',       // #2 — silhueta + backlight azul
  'blog-1782058741657',         // #3 — retrato + rim light azul
];

/**
 * Lei do Azul Cibernético — OBRIGATÓRIO em TODA fotografia de fundo.
 * O HTML usa #14A8F4; a foto DEVE ecoar esse tom (referências #1–#3).
 */
const CYBER_BLUE_STYLE = [
  'CYBER BLUE ACCENT LAW (MANDATORY):',
  '• At least TWO visible cool-cyan #14A8F4 light sources in the ENVIRONMENT (background bokeh, LED strips, screens, city glow, lens flare behind subject)',
  '• Blue lives AROUND the subject — in architecture, atmosphere, bokeh, screens — NOT as a color filter on skin',
  '• SKIN: natural warm human skin tones on face, hands, neck — photorealistic, never blue-tinted cheeks or forehead',
  '• Rim light on hair/shoulder edge is OK; key light on face must be neutral/warm, not cyan',
  '• Exposure: subject face must be readable — not crushed to black silhouette; midtones visible',
  '• Shadow areas: deep #02050A allowed in background; face retains detail',
  '• Color temperature: cool environment, natural skin — never full-frame blue monochrome',
  '• Forbidden: blue color grade on skin, orange-only bokeh, muddy underexposure, 3D illustration',
];

/** Regras obrigatórias por layout — alinhadas ao SKILL (Lei de Foco) */
const LAYOUT_IMAGE_RULES = {
  A: {
    focusId: 'DIREITA',
    focusEn: 'right portion of the lower 65% of the frame (bottom image band)',
    clearZones: [
      'TOP 35% of frame: MUST be empty — dark sky, blur, or gradient only. NO faces, NO subjects.',
      'Subject only in bottom 65%, biased to the RIGHT side of that band.',
    ],
  },
  B: {
    focusId: 'ESQUERDA',
    focusEn: 'left half of the frame (subject visible through right-side photo with object-position left)',
    clearZones: [
      'LEFT 52%: MUST stay dark and low-detail for text overlay (Mirror Split).',
      'NO subject faces or bright elements in the left text column area.',
    ],
  },
  C: {
    focusId: 'DIREITA',
    focusEn: 'right third of the frame',
    clearZones: [
      'LEFT 52%: MANDATORY empty negative space — dark gradient, NO subject, NO faces.',
      'Subject strictly in RIGHT third; object-position equivalent: right.',
    ],
  },
  D: {
    focusId: 'CENTRO/DIREITA',
    focusEn: 'center-right zone (approximately 55–85% horizontal)',
    clearZones: [
      'LEFT 55%: dark diagonal gradient zone for speaker name + headline — NO subject overlap.',
      'Subject at 70% horizontal center of photo area.',
    ],
  },
  E: {
    focusId: 'DIREITA',
    focusEn: 'right 55% of the frame',
    clearZones: [
      'LEFT 50%: dark gradient column for logo, headline, CTA pill — ZERO subject intrusion.',
      'Subject only in RIGHT 55% strip.',
    ],
  },
  F: {
    focusId: 'DIREITA',
    focusEn: 'center of the RIGHT 62% image area (right side of canvas)',
    clearZones: [
      'LEFT 38%: solid blue HTML column — image MUST NOT place subject or detail here.',
      'All subject matter confined to RIGHT 62% only.',
    ],
  },
  G: {
    focusId: 'CENTRO',
    focusEn: 'dead center of the frame (magazine cover)',
    clearZones: [
      'TOP 18% center: clear for logo — NO face or bright blob.',
      'BOTTOM 28% center: clear for headline block — subject above this zone.',
    ],
  },
  H: {
    focusId: 'CENTRAL-SUPERIOR',
    focusEn: 'upper center within the TOP 72% of the frame',
    clearZones: [
      'BOTTOM 32%: solid dark footer band — NO subject, NO skyline detail, NO bright elements.',
      'Subject and scene only in UPPER 72%, centered horizontally.',
    ],
  },
  I: {
    focusId: 'ESQUERDA',
    focusEn: 'left 62% of the frame (photography strip)',
    clearZones: [
      'RIGHT 38%: solid blue HTML column — NO subject or readable detail.',
      'Subject confined to LEFT 62% only.',
    ],
  },
  J: {
    focusId: 'CENTRO entre horizontais',
    focusEn: 'horizontal center band between 30% and 70% vertical height',
    clearZones: [
      'TOP 30%: dark band for logo — empty of subjects.',
      'BOTTOM 30%: dark band for headline — empty of subjects.',
      'Subject ONLY in middle 40% horizontal band, centered.',
    ],
  },
  K: {
    focusId: 'CENTRO entre verticais',
    focusEn: 'center-right area between 33% and 100% horizontal (right two-thirds)',
    clearZones: [
      'LEFT 33%: text column — NO subject faces or bright elements.',
      'Vertical guide lines at 33% and 66% — subject between them or right of center line.',
    ],
  },
  L: {
    focusId: 'CENTRO entre zonas',
    focusEn: 'open center-right area; avoid top-left logo quadrant and below-38% headline block on the left',
    clearZones: [
      'TOP 38% left (logo zone): NO subject.',
      'Below 38% left padding: headline area — keep subject in center-right open space.',
      'Respect L-shaped blue guides — subject in remaining visible area.',
    ],
  },
  M: {
    focusId: 'DIREITA',
    focusEn: 'upper-center to right third — NOT the bottom pull-quote zone',
    clearZones: [
      'BOTTOM 35% center: pull quote + headline — MUST be empty of subjects.',
      'Subject in UPPER portion, biased RIGHT; center-bottom stays dark for text.',
    ],
  },
  N: {
    focusId: 'DIREITA',
    focusEn: 'top-right quadrant of the frame',
    clearZones: [
      'BOTTOM-LEFT: headline stack zone — NO subject overlap.',
      'Subject in TOP-RIGHT only; object-position equivalent: top right.',
      'Diagonal accent zone bottom-left must stay clear.',
    ],
  },
};

/** Cenas padrão por tipo + layout — cada uma ORIGINAL, não clone de referência */
const SCENE_DEFAULTS = {
  blog: {
    C: 'Female CISO executive in charcoal blazer, confident direct gaze, natural skin tones, upscale glass-walled boardroom at night, cyan LED panels and blue bokeh ONLY in blurred background behind her, soft neutral key light on face, photorealistic',
    M: [
      'Wide shot of executives networking at premium cocktail reception, warm skin tones visible, cyan accent lights in ceiling bokeh and bar backlight, subject group biased right upper frame, lively atmosphere not silhouette',
      'Single executive walking through modern lobby toward conference hall, seen from three-quarter back, natural skin, cyan architectural lighting on walls and floor reflections, motion and depth, not face-off profile',
    ],
    N: [
      'Latina female tech director in navy blazer, three-quarter pose looking left, natural skin, premium venue with cyan LED wall wash in background blur, subject top-right, original composition',
      'Male executive descending glass staircase in convention center, cyan strip lighting on rails, natural skin tones, dynamic angle top-right, not studio portrait clone',
    ],
  },
  evento: {
    E: 'Silhouette of businessman in suit from behind overlooking city skyline at night, brilliant blue backlight halo, dramatic executive atmosphere, vast dark sky',
    L: 'Premium dark conference venue, executives in background blur, blue architectural lighting, cinematic wide shot',
    J: 'Executive roundtable environment, dark premium venue, blue accent lights, professional corporate event Brazil',
  },
  patrocinador: {
    F: 'Executives networking in premium dark corporate venue, blue accent lighting, sponsorship atmosphere, professional photography',
    I: 'Corporate leaders in conversation at exclusive tech event, dark moody environment, blue highlights',
    B: 'Split atmosphere: dark executive space with professional figures, premium event photography',
  },
  palestrante: {
    D: 'Confident speaker executive on dark stage, blue spotlight, audience silhouettes, cinematic keynote atmosphere',
    G: 'Magazine-style executive portrait, dark studio lighting, blue rim light, premium corporate headshot mood',
    K: 'Executive portrait with dramatic vertical lines, dark conference backdrop, blue accent lighting',
  },
  cidade: {
    A: 'City skyline at dusk viewed from executive rooftop, dark moody atmosphere, blue city lights',
    H: 'Urban skyline upper frame, dark corporate mood, blue twilight atmosphere',
    J: 'Metropolitan business district at night, executive perspective, dark cinematic',
  },
};

/** Fallback de cena por letra (quando tipo não define) — cobre os 14 layouts */
const LAYOUT_SCENE_FALLBACK = {
  A: 'Urban skyline or cityscape at dusk, dark moody atmosphere, blue twilight lights, photorealistic',
  B: 'Dark executive corporate environment, professional figures in soft focus, premium event photography',
  C: 'Executive portrait, natural skin tones, cyan bokeh and LED accents in background environment only, neutral key light on face, photorealistic',
  D: 'Speaker on dark keynote stage, blue spotlight, audience silhouettes, cinematic',
  E: 'Business silhouette overlooking city at night, blue backlight, dramatic executive mood',
  F: 'Executives networking in premium dark venue, blue accent lighting, sponsorship atmosphere',
  G: 'Magazine-style executive portrait, dark studio, blue rim light, centered subject',
  H: 'Urban skyline upper frame, twilight, dark corporate mood, blue city glow',
  I: 'Corporate leaders at exclusive tech event, dark moody environment, blue highlights',
  J: 'Premium conference or roundtable venue, dark cinematic, blue architectural lighting',
  K: 'Executive portrait with vertical architectural lines, dark conference backdrop',
  L: 'Wide dark conference venue, executives in background blur, blue accent lights',
  M: 'Networking reception or lobby walk-through, natural skin tones, cyan lights in environment bokeh, readable exposure, not silhouette face-off',
  N: 'Executive in venue with cyan architectural lighting in background, natural skin, original pose top-right, not studio portrait clone',
};

const BANNED_IN_CONTEXTO = [
  /\b(headline|titulo|título|subtitulo|subtítulo|legenda|copy|texto|typography|font|banner|poster|flyer)\b/i,
  /\b(logo|watermark|caption|label|sign|placa|letreiro|marca)\b/i,
  /\b(CybersecFEST|cybersecfest|DevOps|IAM Tech|Alcatraz)\b/i,
  /["'«»].{8,}["'«»]/,
  /\b\d{3,}\s*(px|pt|%)\b/i,
];

function validateLayout(layout) {
  const L = String(layout || '').toUpperCase();
  if (!VALID_LAYOUTS.includes(L)) {
    throw new Error(
      `Layout inválido "${layout}". Obrigatório: A–N. Disponíveis: ${VALID_LAYOUTS.join(', ')}`
    );
  }
  return L;
}

function getLayoutImageRules(layout) {
  const L = validateLayout(layout);
  return { layout: L, ...LAYOUT_IMAGE_RULES[L] };
}

function sanitizeContextoVisual(raw = '') {
  let text = String(raw)
    .replace(/CybersecFEST|cybersecfest|Cyber Security|CISO|ROI|patrocínio|patrocinio/gi, '')
    .replace(/[^\w\s,.-áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const re of BANNED_IN_CONTEXTO) {
    if (re.test(text)) {
      return { ok: false, reason: `contexto_visual contém termo proibido (${re})`, cleaned: '' };
    }
  }

  if (text.length < 20) {
    return { ok: false, reason: 'contexto_visual muito curto ou vazio após sanitização', cleaned: '' };
  }

  return { ok: true, cleaned: text.slice(0, 200) };
}

function pickScene(tipo, layout, seed = '') {
  const L = validateLayout(layout);
  const tipoScenes = SCENE_DEFAULTS[tipo] || {};
  const scene = tipoScenes[L];

  if (Array.isArray(scene)) {
    const idx = seed ? [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % scene.length : 0;
    return scene[idx];
  }
  return scene || LAYOUT_SCENE_FALLBACK[L];
}

/**
 * Monta prompt de imagem com regras rígidas do layout.
 * @throws se layout ∉ A–N
 */
function buildImagePrompt({ tipo = 'blog', layout = 'C', contextoVisual = '', slug = '' } = {}) {
  const L = validateLayout(layout);
  const rules = LAYOUT_IMAGE_RULES[L];
  const sanitized = sanitizeContextoVisual(contextoVisual);
  const scene = sanitized.ok ? sanitized.cleaned : pickScene(tipo, L, slug);

  if (!sanitized.ok && contextoVisual?.trim()) {
    console.warn(`⚠️  contexto_visual ignorado (${sanitized.reason}) — usando cena padrão layout ${L}`);
  }

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
    '• Dark cinematic executive photography — photorealistic, premium corporate Brazil',
    '• Readable exposure on subject — NOT crushed black silhouette',
    '• Blue/cyan (#14A8F4) in environment and atmosphere — natural skin on people',
    '• ORIGINAL composition — do not clone reference images or repeat scenes from other posts',
    '• Leave explicit negative space exactly where CLEAR ZONE rules specify',
    '',
    ...CYBER_BLUE_STYLE,
    '',
    'ABSOLUTE PROHIBITIONS (ZERO TOLERANCE):',
    '• NO text, letters, words, numbers, typography, headlines, subtitles, captions',
    '• NO logos, watermarks, brand names, UI elements, buttons, labels, signs',
    '• NO marketing copy, quotes, hashtags, or readable content of any kind',
    '• NO designed layout elements — HTML layers will be added separately',
    '• NO warm-only color grade (reject if zero cyan/blue visible in environment)',
    '• NO blue tint or color grade on human skin',
    '• NO copying poses, faces, or compositions from mood-board references',
    '',
    'The HTML overlay will contain ALL text. This image is the silent photographic background only.',
  ].join('\n');
}

module.exports = {
  buildImagePrompt,
  getLayoutImageRules,
  validateLayout,
  sanitizeContextoVisual,
  LAYOUT_IMAGE_RULES,
  SCENE_DEFAULTS,
  LAYOUT_SCENE_FALLBACK,
  VALID_LAYOUTS,
  REFERENCE_ARTES,
  CYBER_BLUE_STYLE,
  /** @deprecated use LAYOUT_IMAGE_RULES */
  FOCUS_MAP: Object.fromEntries(
    VALID_LAYOUTS.map(l => [l, LAYOUT_IMAGE_RULES[l].focusId])
  ),
};
