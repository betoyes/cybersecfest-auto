'use strict';

/**
 * Base de conhecimento real do CYBERSEC.CAST.
 * Importado por gerar-propostas-cast.js para fundamentar os prompts LLM.
 * Atualizar aqui quando houver novos episódios, convidados ou patrocinadores.
 */

const CAST_KNOWLEDGE = {
  podcast: {
    nome: 'CyberSec.CAST',
    descricao: 'O podcast executivo de cibersegurança para o C-Level do Brasil. Conversas estratégicas — não técnicas — com quem decide.',
    posicionamento: 'Único podcast nacional focado exclusivamente em liderança de cibersegurança. Editorial independente, curadoria rigorosa (<10% de aprovação de convidados), sem pauta de fornecedor.',
    ecossistema: 'Parte do ecossistema DevOps Bootcamp + CyberSecFest + IAM TECH DAY — 150.000+ membros, 3.000+ executivos C-Level conectados.',
  },

  hosts: [
    {
      nome: 'Edgar',
      papel: 'Host & Estratégia',
      perfil: 'Visão técnica, estratégica e executiva. Conduz o lado analítico das entrevistas.',
    },
    {
      nome: 'Amanda',
      papel: 'Host & Curadoria Editorial',
      perfil: 'Estratégia de conteúdo, relacionamento e leitura de mercado. Define a pauta e cuida da experiência do ouvinte.',
    },
  ],

  temporada: {
    numero: 1,
    status: 'em produção — 2026',
    cidades: ['Belo Horizonte', 'São Paulo'],
    episodios_gravados: [
      { convidado: 'Paulo Conduta',    cargo: 'CISO',                         empresa: 'Netonze',              tema: 'cibersegurança na prática do C-Level' },
      { convidado: 'Vitor Padovan',    cargo: 'CISO',                         empresa: 'IAM Experts',          tema: 'gestão de identidade e acesso' },
      { convidado: 'Leandro Ludwig',   cargo: 'Gerente de Cibersegurança',    empresa: 'Bradesco',             tema: 'segurança em grande escala no setor financeiro' },
      { convidado: 'Izaias Gomes',     cargo: 'Diretor de TI',               empresa: 'Grupo Piracanjuba',    tema: 'transformação digital e risco no agronegócio' },
      { convidado: 'Fagner Almeida',   cargo: 'Gerente de TI & Segurança',   empresa: 'Biolab Farmacêutica',  tema: 'segurança em ambientes regulados / farma' },
      { convidado: 'Bruno Ferreira',   cargo: 'Co-Founder & CEO',            empresa: 'Elven Works',          tema: 'liderança técnica e segurança em startups' },
    ],
    episodios_agendados: [
      { convidado: 'Renan Barcelos',   cargo: 'CISO',                         empresa: 'RTM',                  tema: 'a ser definido' },
    ],
    materiais_extras: [
      'E-book Resiliência Multi-Cloud (disponível para download)',
    ],
  },

  audiencia: {
    perfil: 'CTOs, CIOs, VPs de Tecnologia, Risco, Dados e Cloud — executivos que aprovam orçamento e avaliam fornecedores.',
    alcance_ecossistema: '150.000+ membros no ecossistema DevOps Bootcamp',
    executivos_conectados: '3.000+ C-Level diretos',
    caracteristica: 'Diretores ou acima. Decidem investimentos. Influenciam estratégia de fornecedores.',
  },

  patrocinadores_atuais: [
    { nome: 'Skalena',       segmento: 'APIs & IAM',        cota: 'T1' },
    { nome: 'LDC Soluções',  segmento: 'Tech & Security',   cota: 'T1' },
    { nome: 'Sunny Systems', segmento: 'Cloud Resilience',  cota: 'T1' },
  ],

  cotas_patrocinio: [
    { nome: 'Silver',          preco: 'R$ 3.500–5.000/mês', destaque: 'Presença nos episódios, logo no site' },
    { nome: 'Gold',            preco: 'R$ 8.000–12.000/mês', destaque: 'Episódio co-branded, newsletter, landing exclusiva' },
    { nome: 'Diamond',         preco: 'R$ 20.000+/mês',      destaque: 'Lock de categoria, ABM C-Level, acesso ao ecossistema CyberSecFest' },
    { nome: 'Strategic Partner', preco: 'sob consulta',      destaque: 'Co-criação de conteúdo, integração total no ecossistema' },
  ],

  diferenciais_para_patrocinadores: [
    'Acesso direto ao C-Level que decide compras de tecnologia e segurança',
    'Editorial independente — a marca do patrocinador aparece em contexto de confiança, não de anúncio',
    'Ecossistema integrado: CyberSec.CAST + CyberSecFest + IAM TECH DAY — um patrocínio, três pontos de contato',
    'ABM (Account-Based Marketing) real: ouvintes são os decisores, não analistas',
    'Curadoria rigorosa de convidados (<10% aprovados) garante credibilidade ao conteúdo — e ao patrocinador presente',
  ],

  contato: 'contato@devopsbootcamp.net',
};

/**
 * Formata o contexto de episódios para uso nos prompts LLM.
 * Passa apenas informação REAL — sem invenção.
 */
function buildEpisodiosContext() {
  const gravados = CAST_KNOWLEDGE.temporada.episodios_gravados
    .map(e => `- ${e.convidado} (${e.cargo} · ${e.empresa}): ${e.tema}`)
    .join('\n');
  const agendados = CAST_KNOWLEDGE.temporada.episodios_agendados
    .map(e => `- ${e.convidado} (${e.cargo} · ${e.empresa})`)
    .join('\n');
  return `EPISÓDIOS GRAVADOS (Temporada 1):
${gravados}

PRÓXIMOS GRAVADOS:
${agendados}`;
}

function buildPatrocinadoresContext() {
  const atuais = CAST_KNOWLEDGE.patrocinadores_atuais
    .map(p => `- ${p.nome} (${p.segmento})`)
    .join('\n');
  const cotas = CAST_KNOWLEDGE.cotas_patrocinio
    .map(c => `- ${c.nome}: ${c.preco} — ${c.destaque}`)
    .join('\n');
  return `PATROCINADORES ATUAIS (T1):
${atuais}

COTAS DISPONÍVEIS:
${cotas}

DIFERENCIAIS:
${CAST_KNOWLEDGE.diferenciais_para_patrocinadores.map(d => `- ${d}`).join('\n')}`;
}

module.exports = { CAST_KNOWLEDGE, buildEpisodiosContext, buildPatrocinadoresContext };
