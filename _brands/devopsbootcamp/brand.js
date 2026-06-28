'use strict';

/**
 * DEVOPS BOOTCAMP — Brand Design Tokens
 * Plataforma de treinamentos enterprise DevOps, SRE, Kubernetes e Platform Engineering.
 *
 * DevOps Bootcamp → #f97316 (orange) | JetBrains Mono / Inter | #0a0f1e bg
 *
 * Font hierarchy:
 *   display / headlines → JetBrains Mono (bold)
 *   body / subtitle     → Inter
 */

const DEVOPSBOOTCAMP_BRAND = {
  id: 'devopsbootcamp',
  name: 'DevOps Bootcamp',
  slug_prefix: 'bootcamp-',
  artes_file: 'artes-bootcamp.json',
  temas_file: '_brands/devopsbootcamp/temas.json',
  logo_asset: 'logo-bootcamp.png',

  colors: {
    bg: '#0a0f1e',
    bg_dark: '#070a16',
    accent: '#f97316',           // orange
    accent_secondary: '#fb923c', // lighter orange
    orange_400: '#fb923c',
    orange_300: '#fdba74',
    signal: '#ffb020',           // live/broadcast accent
    text_primary: '#e2e8f0',
    text_secondary: '#94a3b8',
    glow: 'rgba(249,115,22,0.35)',
    border: 'rgba(249,115,22,0.22)',
    gradient_text: 'linear-gradient(135deg, #fdba74 0%, #fb923c 50%, #f97316 100%)',
  },

  fonts: {
    display: 'JetBrains Mono',
    display_weight: 700,
    body: 'Inter',
    body_weight: 400,
    google_fonts_url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap',
  },

  token_replacements: [
    // Google Fonts URL → inclui as 2 fontes Bootcamp
    [
      'https://fonts.googleapis.com/css2?family=Ubuntu:wght@700&family=Montserrat:wght@400;600&display=swap',
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap',
    ],
    // rgba acento genérico → Bootcamp orange (#f97316)
    ['rgba(20,168,244,', 'rgba(249,115,22,'],
    ['rgba(20, 168, 244,', 'rgba(249,115,22,'],
    // cores sólidas
    ['#14A8F4', '#f97316'],
    ['#14a8f4', '#f97316'],
    ['#02050A', '#0a0f1e'],
    ['#02050a', '#0a0f1e'],
    // ── Fontes: substituições específicas (ordem importa) ──
    // Montserrat w400 (subtitle body) → Inter
    ["'Montserrat',sans-serif;font-weight:400", "'Inter',sans-serif;font-weight:400"],
    // Montserrat w600 (sp/eyebrow tags, uppercase) → JetBrains Mono
    ["'Montserrat',sans-serif;font-weight:600", "'JetBrains Mono',monospace;font-weight:400"],
    // Montserrat w700 (tiny uppercase tags) → JetBrains Mono
    ["'Montserrat',sans-serif;font-weight:700", "'JetBrains Mono',monospace;font-weight:700"],
    // Ubuntu (headlines, display) → JetBrains Mono
    ["'Ubuntu',sans-serif", "'JetBrains Mono',monospace"],
    ["'Ubuntu'", "'JetBrains Mono'"],
    ['Ubuntu', 'JetBrains Mono'],
    // Fallback: qualquer Montserrat restante → Inter
    ["'Montserrat'", "'Inter'"],
    ['Montserrat', 'Inter'],
  ],

  refs_dir: 'assets/referencias-bootcamp',

  tipo_por_dia: {
    1: 'trilha',
    3: 'webinar',
    5: 'artigo',
    default: 'trilha',
  },
};

module.exports = DEVOPSBOOTCAMP_BRAND;