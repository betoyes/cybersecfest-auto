'use strict';

const { suggestCtaExamples } = require('./cta-pill.js');

/** Objetivos de campanha → sequência de tipos editoriais + CTA padrão */
const CAMPANHA_OBJETIVOS = {
  inscricoes: {
    label: 'Inscrições',
    tipoSequence: ['evento', 'blog', 'evento', 'cidade', 'blog', 'evento', 'palestrante', 'blog'],
    ctaDefault: 'INSCRIÇÕES ABERTAS',
    angulos: ['FOMO exclusividade', 'Confraria C-Level', 'Risco estratégico', 'BH e SP', 'Networking decisor'],
  },
  patrocinadores: {
    label: 'Patrocinadores',
    tipoSequence: ['patrocinador', 'patrocinador', 'evento', 'patrocinador', 'blog', 'patrocinador', 'cidade', 'patrocinador'],
    ctaDefault: 'SEJA PATROCINADOR',
    angulos: ['ROI sala certa', 'Presença estratégica', 'Visibilidade C-Level', 'Ecossistema premium', 'Geração de negócios'],
  },
  speakers: {
    label: 'Palestrantes',
    tipoSequence: ['palestrante', 'blog', 'palestrante', 'evento', 'palestrante', 'blog', 'palestrante', 'cidade'],
    ctaDefault: 'CONFIRA A AGENDA',
    angulos: ['Autoridade técnica', 'Palco exclusivo', 'Mentoria peer', 'Visibilidade executiva', 'Liderança de pensamento'],
  },
  agenda: {
    label: 'Agenda',
    tipoSequence: ['evento', 'palestrante', 'blog', 'evento', 'cidade', 'palestrante', 'evento', 'blog'],
    ctaDefault: 'GARANTA SEU LUGAR',
    angulos: ['Programação exclusiva', 'Debate incisivo', 'Trilhas IAM/DevSecOps', 'BH Nov 2026', 'SP Out 2026'],
  },
};

function getCampanhaPreset(objetivo) {
  return CAMPANHA_OBJETIVOS[String(objetivo || '').toLowerCase()] || CAMPANHA_OBJETIVOS.inscricoes;
}

function planoTiposCampanha(objetivo, quantidade) {
  const preset = getCampanhaPreset(objetivo);
  const n = Math.min(Math.max(Number(quantidade) || 5, 3), 10);
  const tipos = [];
  for (let i = 0; i < n; i += 1) {
    tipos.push(preset.tipoSequence[i % preset.tipoSequence.length]);
  }
  return tipos;
}

const FORMATO_SEQUENCE = ['feed_vertical', 'feed_quadrado', 'stories', 'feed_vertical', 'feed_quadrado'];

function planoFormatosCampanha(quantidade) {
  const n = Math.min(Math.max(Number(quantidade) || 5, 3), 10);
  const formatos = [];
  for (let i = 0; i < n; i += 1) {
    formatos.push(FORMATO_SEQUENCE[i % FORMATO_SEQUENCE.length]);
  }
  return formatos;
}

function ctaParaTipo(tipoPost, objetivo) {
  const preset = getCampanhaPreset(objetivo);
  const sugestoes = suggestCtaExamples(tipoPost);
  if (tipoPost === 'evento' || objetivo === 'inscricoes') return preset.ctaDefault;
  if (tipoPost === 'patrocinador') return 'SEJA PATROCINADOR';
  return sugestoes[0] || preset.ctaDefault;
}

module.exports = {
  CAMPANHA_OBJETIVOS,
  FORMATO_SEQUENCE,
  getCampanhaPreset,
  planoTiposCampanha,
  planoFormatosCampanha,
  ctaParaTipo,
};
