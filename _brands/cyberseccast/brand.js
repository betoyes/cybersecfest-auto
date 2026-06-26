'use strict';

/**
 * CYBERSEC.CAST — Brand Design Tokens
 * Podcast executivo de cibersegurança — identidade visual independente do CybersecFEST.
 *
 * CybersecFEST  →  #14A8F4 (cyan)  | Ubuntu Bold / Montserrat | #02050A bg
 * CYBERSEC.CAST →  #6366f1 (indigo) | Inter Bold / Space Mono  | #07060f bg
 */

const BRAND = {
  id: 'cyberseccast',
  name: 'CYBERSEC.CAST',
  slug_prefix: 'cast-',
  artes_file: 'artes-cast.json',
  temas_file: '_brands/cyberseccast/temas.json',
  logo_asset: 'logo-cast.png',

  colors: {
    bg: '#07060f',
    accent: '#6366f1',
    accent_secondary: '#8b5cf6',
    text_primary: '#f0eeff',
    text_secondary: '#9b97c4',
    glow: 'rgba(99,102,241,0.35)',
    border: 'rgba(99,102,241,0.22)',
  },

  fonts: {
    headline: 'Inter',
    headline_weight: 700,
    subtitle: 'Space Mono',
    subtitle_weight: 400,
    google_fonts_url: 'https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Space+Mono&display=swap',
  },

  /**
   * Substituições de tokens aplicadas pelo brand-renderer.js
   * em cima do HTML gerado pelo renderLayout() do CybersecFEST.
   * Ordem importa: fazer rgba antes de hex para não conflitar.
   */
  token_replacements: [
    // Google Fonts URL
    [
      'https://fonts.googleapis.com/css2?family=Ubuntu:wght@700&family=Montserrat:wght@400;600&display=swap',
      'https://fonts.googleapis.com/css2?family=Inter:wght@700&family=Space+Mono&display=swap',
    ],
    // rgba com valores de cor do CybersecFEST → CAST
    ['rgba(20,168,244,', 'rgba(99,102,241,'],
    ['rgba(20, 168, 244,', 'rgba(99,102,241,'],
    // cores sólidas
    ['#14A8F4', '#6366f1'],
    ['#14a8f4', '#6366f1'],
    ['#02050A', '#07060f'],
    ['#02050a', '#07060f'],
    // fontes
    ["'Ubuntu'", "'Inter'"],
    ['Ubuntu', 'Inter'],
    ["'Montserrat'", "'Space Mono'"],
    ['Montserrat', 'Space Mono'],
  ],

  // Ref para image prompt
  refs_dir: 'assets/referencias-cast',

  // Tipo de conteúdo padrão por dia da semana (0=dom … 6=sáb)
  tipo_por_dia: {
    1: 'episodio',
    3: 'convidado',
    5: 'insight',
    default: 'episodio',
  },
};

module.exports = BRAND;
