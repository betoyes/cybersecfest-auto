'use strict';

/**
 * Base de conhecimento real do CYBERSECFEST.
 * Importado por gerar-propostas.js para fundamentar os prompts LLM.
 * Atualizar aqui quando houver novas edições, palestrantes ou patrocinadores.
 */

const FEST_KNOWLEDGE = {
  evento: {
    nome: 'CyberSecFest',
    descricao: 'O maior encontro executivo de cibersegurança do Brasil. Palestras, painéis, networking e experiências presenciais para líderes de tecnologia e segurança.',
    posicionamento: 'Não é um evento de treinamento técnico. É onde os decisores de tecnologia do Brasil se encontram pessoalmente — fora da sala de reunião.',
    diferenciais: [
      'Audiência exclusivamente C-Level e lideranças estratégicas — sem analistas, sem júnior',
      'Palestras e painéis sobre PAM, DevSecOps, Cloud Security, IAM, Zero Trust, LGPD/GDPR',
      'Networking qualificado: encontros presenciais entre CISOs, CIOs, CTOs, CEOs, VPs',
      'Ecossistema integrado: DevOps Bootcamp + CyberSec.CAST + IAM TECH DAY',
      'Expansão nacional 2026 — múltiplas edições em cidades estratégicas',
    ],
    ecossistema: 'DevOps Bootcamp + CyberSec.CAST + IAM TECH DAY — comunidade de mais de 150.000 membros de tecnologia.',
  },

  historico: [
    { ano: 2023, participantes: '+360', nota: 'Primeira edição' },
    { ano: 2024, participantes: 'crescimento consolidado', nota: '' },
    { ano: 2025, participantes: '+2.200', nota: 'Expansão BH + SP' },
    { ano: 2026, participantes: 'expansão nacional', nota: 'Confraria 2026 — múltiplas cidades' },
  ],

  edicoes_2026: [
    {
      cidade: 'Belo Horizonte',
      status: 'confirmada',
      temas_destaque: ['PAM', 'DevSecOps', 'Cloud Security', 'IAM', 'LGPD/GDPR'],
      empresas_anteriores: ['Stellantis', 'Sada', 'VLI Logística'],
    },
    {
      cidade: 'São Paulo',
      status: 'confirmada',
      temas_destaque: ['PAM', 'DevSecOps', 'Cloud Security', 'Zero Trust', 'Proteção de Dados'],
      empresas_anteriores: ['Drogaria Araújo', 'Localiza', 'Natura', 'XP'],
    },
  ],

  audiencia: {
    perfil: 'CIOs, CSOs, CEOs, CTOs, VPs, Heads, Diretores e Gerentes de Tecnologia, Segurança e Inovação.',
    caracteristica: 'Decisores que aprovam orçamento de tecnologia e segurança. Líderes que influenciam aquisição de fornecedores. Profissionais seniores que buscam networking estratégico — não cursos.',
    empresas_representadas: 'Grandes empresas nacionais e multinacionais: indústria, financeiro, saúde, varejo, logística.',
  },

  temas_grade: [
    'PAM — Gerenciamento de Acesso Privilegiado',
    'DevSecOps — Segurança no ciclo de desenvolvimento',
    'Cloud Security — Proteção em ambientes multi-cloud',
    'IAM — Identidade e Acesso (CIEM, ITDR, Mobile)',
    'Zero Trust — Arquitetura e implementação',
    'LGPD/GDPR/Privacidade — Conformidade e governança',
    'Pentesting e Red Team — Detecção e resposta a ataques',
    'Resiliência e Continuidade de Negócios',
  ],

  palestrantes_historico: {
    nota: 'O CyberSecFest conta com especialistas reconhecidos da comunidade DevOps Bootcamp, líderes de IAM com experiência em NetIQ/Novell/Microfocus, IBM e grandes tecnologias. Nomes específicos de 2026 a serem confirmados.',
    perfil_tipico: 'CISOs, CTOs, especialistas seniores de segurança com histórico em grandes empresas do mercado brasileiro.',
  },

  cotas_patrocinio: {
    belo_horizonte: [
      { nome: 'Lounge Diamond', preco: 'R$ 65.557', destaque: 'Palestra 30\', lounge 6x3m, totem interativo, vídeo LED, mailing CyberSecFest' },
      { nome: 'Lounge Gold',    preco: 'R$ 58.387', destaque: 'Palestra 25\', lounge 3x3m, TV/LED, mailing CyberSecFest' },
      { nome: 'Palco',          preco: 'R$ 29.987', destaque: 'Cenografia CyberSecFest, visibilidade palco principal' },
      { nome: 'Naming Rights',  preco: 'R$ 49.987', destaque: 'Naming de experiência (coffee, lunch ou happy hour)' },
      { nome: 'Happy Hour',     preco: 'R$ 59.987', destaque: 'Exclusividade da experiência de encerramento' },
    ],
    sao_paulo: [
      { nome: 'Emerald',          preco: 'R$ 77.697', destaque: 'Keynote 10\', palestra 30\', 3 entrevistas, 7+10 ingressos, lounge 6x3m, totem, vídeo LED' },
      { nome: 'Diamond',          preco: 'R$ 68.537', destaque: 'Palestra 25\', 2 entrevistas, 5+7 ingressos, lounge 3x3m, LED' },
      { nome: 'Gold',             preco: 'R$ 60.587', destaque: 'Palestra 20\', 1 entrevista, 3+5 ingressos' },
      { nome: 'Welcome Coffee',   preco: 'R$ 39.987', destaque: 'Naming rights, cenografia temática, LED, 2 ingressos' },
      { nome: 'Lunch',            preco: 'R$ 59.987', destaque: 'Naming rights, LED full, audiovisual completo, 5 ingressos' },
      { nome: 'Happy Hour',       preco: 'R$ 69.987', destaque: 'Naming rights, LED, audiovisual + DJ, exclusividade encerramento' },
      { nome: 'Drink Experience', preco: 'R$ 63.987', destaque: 'Mixologista, copos personalizados, mini bar, 10 ingressos' },
      { nome: 'Catering',         preco: 'a consultar', destaque: 'Personalização gastronômica, branding no café, 5 ingressos' },
    ],
  },

  diferenciais_para_patrocinadores: [
    'Acesso presencial ao C-Level que decide compras de tecnologia — não webinar, não banner digital',
    'Palestra ou keynote própria: visibilidade como autoridade, não como anunciante',
    'Lounge físico: reuniões qualificadas durante o evento, não apenas logo no backdrop',
    'Naming rights de experiência (coffee, lunch, happy hour): presença de marca em momento alto de networking',
    'Mailing qualificado do CyberSecFest: acesso à base de decisores após o evento',
    'Ecossistema CyberSecFest + CyberSec.CAST + IAM TECH DAY: um investimento, três pontos de presença',
    'Entrevistas no palco/podcast: conteúdo de autoridade com alcance da comunidade',
  ],

  contato: 'contato@devopsbootcamp.net',
};

function buildEdicoesContext() {
  return FEST_KNOWLEDGE.edicoes_2026
    .map(e => `- ${e.cidade} (${e.status}): ${e.temas_destaque.join(', ')}`)
    .join('\n');
}

function buildHistoricoContext() {
  return FEST_KNOWLEDGE.historico
    .map(h => `- ${h.ano}: ${h.participantes}${h.nota ? ` (${h.nota})` : ''}`)
    .join('\n');
}

function buildCotasContext(cidade = 'sao_paulo') {
  const cotas = FEST_KNOWLEDGE.cotas_patrocinio[cidade] || FEST_KNOWLEDGE.cotas_patrocinio.sao_paulo;
  return cotas.map(c => `- ${c.nome}: ${c.preco} — ${c.destaque}`).join('\n');
}

module.exports = { FEST_KNOWLEDGE, buildEdicoesContext, buildHistoricoContext, buildCotasContext };
