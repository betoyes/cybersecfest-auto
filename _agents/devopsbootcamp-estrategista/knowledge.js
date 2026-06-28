'use strict';

/**
 * Base de conhecimento real do DevOps Bootcamp.
 * Importado por gerar-propostas.js para fundamentar os prompts LLM.
 * Atualizar aqui quando houver novos cursos, trilhas ou diferenciais.
 */

const DEVOPSBOOTCAMP_KNOWLEDGE = {
  plataforma: {
    nome: 'DevOps Bootcamp',
    descricao: 'Plataforma de treinamentos enterprise DevOps, SRE, Kubernetes e Platform Engineering para times de TI de médias e grandes empresas brasileiras.',
    posicionamento: 'O treinamento mais prático de DevOps do Brasil — feito por quem opera em produção, não por quem só escreve slides.',
    diferenciais: [
      'Conteúdo criado por practitioners com experiência real em produção',
      'Projetos hands-on com infraestrutura real (não simulada)',
      'Comunidade de +150.000 profissionais de tecnologia',
      'Trilhas focadas em resultados: certificação, promoção, migração de carreira',
    ],
  },

  publico: {
    perfil: 'DevOps engineers, SREs, Platform engineers, CTOs e Heads de Infraestrutura que decidem stack e ferramentas de CI/CD nas empresas.',
    caracteristica: 'Técnico, direto, orientado a resultado prático. Sem hype, sem jargão vazio. Fala de igual para igual com o engenheiro sênior.',
  },

  produtos: [
    { nome: 'Trilha Kubernetes', descricao: 'Do zero ao CKA em 12 semanas', cta: 'COMECE AGORA' },
    { nome: 'DevSecOps na Prática', descricao: 'Segurança integrada no pipeline CI/CD', cta: 'VER TRILHA' },
    { nome: 'Platform Engineering', descricao: 'Internal Developer Platform com Backstage e ArgoCD', cta: 'CONHECER' },
  ],

  temas: [
    'Kubernetes',
    'DevSecOps',
    'Platform Engineering',
    'SRE',
    'GitOps',
    'CI/CD',
    'Terraform',
    'Observabilidade',
  ],

  contato: 'contato@devopsbootcamp.net',
  site: 'devopsbootcamp.net',

  identidade_visual: {
    cores: {
      fundo: '#0a0f1e',
      destaque: '#f97316',
      texto: '#e2e8f0',
    },
    fontes: {
      headline: 'JetBrains Mono',
      corpo: 'Inter',
    },
  },

  cta_padrao: 'VER TRILHAS',
};

module.exports = { DEVOPSBOOTCAMP_KNOWLEDGE };