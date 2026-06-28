'use strict';

/**
 * Base de conhecimento da Sunny Systems.
 * Atualizar aqui quando houver novos produtos, casos, parceiros ou dados de mercado.
 */

const SUNNYSYSTEMS_KNOWLEDGE = {
  empresa: {
    nome: 'Sunny Systems',
    descricao: 'Empresa de tecnologia especializada em ajudar organizações a transformar ambientes em operações visíveis, eficientes e governáveis.',
    posicionamento: 'Tecnologia precisa gerar controle, não complexidade. Transformamos complexidade em operações previsíveis.',
    tese_central: 'Empresas modernas não precisam apenas operar mais tecnologia. Precisam operar tecnologia com clareza, contexto, previsibilidade e eficiência.',
    valores_percebidos: [
      'Tecnologia precisa gerar controle, não complexidade.',
      'Transformamos complexidade em operações previsíveis.',
      'Observabilidade não é acumular dados. É conectar sinais.',
      'Controle começa com contexto.',
      'Mais visibilidade. Menos ruído. Decisões melhores.',
    ],
    frentes: [
      'Observabilidade', 'FinOps', 'Platform Engineering', 'DevSecOps', 'AppSec',
      'Cloud', 'Automação', 'Engenharia de Plataforma', 'Governança',
      'Qualidade de Software', 'Experiência de Desenvolvimento', 'Segurança',
      'Eficiência operacional', 'Inteligência aplicada à operação',
    ],
  },

  audiencia: {
    perfil: 'CTOs, CIOs, VPs de Engenharia, Heads de Plataforma, Infra, Cloud, SRE, DevOps, FinOps, Segurança e DevSecOps, Tech Leads, Engineering Managers, Staff e Principal Engineers, Arquitetos de Software e Cloud.',
    caracteristica: 'Decisores e líderes técnicos que aprovam orçamento de tecnologia, influenciam aquisição de ferramentas e buscam operar ambientes complexos com previsibilidade. Público experiente — nunca explicar conceitos básicos.',
    dores_reconhecidas: [
      'Incidentes com causa raiz difícil de rastrear',
      'Custos de cloud imprevisíveis',
      'Observabilidade fragmentada',
      'Alertas excessivos sem contexto',
      'Baixa correlação entre sinais',
      'Times desconectados entre si',
      'Crescimento sem governança',
      'Cloud sem previsibilidade de custo',
      'Engenharia desacelerada por fricção',
      'Decisões tomadas sem visibilidade suficiente',
    ],
  },

  produtos: {
    scopeward: {
      nome: 'ScopeWard',
      descricao: 'Governança de cloud e auditoria de ambientes.',
      tese: 'Governança de cloud não é burocracia. É visibilidade antes que custo e risco se tornem invisíveis.',
      angulos: ['visibilidade de ambientes cloud', 'risco operacional', 'governança e accountability', 'auditoria', 'segurança', 'custo', 'crescimento sustentável'],
    },
    devxos: {
      nome: 'DevXOS',
      descricao: 'Inteligência de engenharia — analisa histórico Git e mede se a IA está tornando o código mais durável, não apenas mais rápido.',
      tese: 'Meça o que sobrevive, não apenas o que é entregue.',
      angulos: ['produtividade versus qualidade', 'IA e dívida técnica', 'engenharia sustentável', 'durabilidade de código', 'métricas de software', 'velocidade de entrega sem ilusão'],
    },
    sunshine: {
      nome: 'Sunshine',
      descricao: 'FinOps para custos de observabilidade — controle de ingestão, telemetria e custo em Datadog.',
      tese: 'O problema não é apenas quanto você gasta em observabilidade. É descobrir tarde demais por que está gastando.',
      angulos: ['custo de ingestão', 'telemetria', 'previsibilidade', 'orçamento', 'eficiência', 'controle de custos em Datadog', 'decisão de arquitetura'],
    },
    soberania_ia: {
      nome: 'Soberania de IA',
      descricao: 'LLMs on-premises e IA de coding dentro da infraestrutura do cliente.',
      tese: 'A próxima decisão sobre IA não será apenas qual modelo usar. Será onde seus dados, código e contexto poderão existir.',
      angulos: ['segurança', 'privacidade', 'soberania', 'governança', 'propriedade de dados', 'IA corporativa', 'estratégia'],
    },
  },

  pilares_editoriais: [
    'Observabilidade com contexto — logs, métricas, traces, correlação, MTTR, sinal vs. ruído',
    'FinOps e controle de custos — cloud, ingestão, previsibilidade, accountability',
    'Platform Engineering — plataformas internas, Golden Paths, autonomia, Team Topologies',
    'DevSecOps e AppSec — segurança integrada, velocidade com segurança, responsabilidade compartilhada',
    'IA aplicada à Engenharia e Operações — qualidade de código, durabilidade, governança, AIOps',
    'Liderança técnica e decisões de negócio — engenharia como decisão estratégica',
    'Comunidade, eventos e bastidores — Datadog, OpenTelemetry, treinamentos, conferências',
  ],

  teses: {
    observabilidade: [
      'Ter tudo não significa enxergar.',
      'Alerta sem contexto é apenas ansiedade automatizada.',
      'O problema não é ter dashboards demais. É não saber qual deles explica a decisão.',
      'Observabilidade madura não responde apenas o que quebrou. Ela mostra por que aquilo importou.',
      'O incidente foi curto. O diagnóstico não.',
      'Menos ruído, mais diagnóstico.',
      'Observabilidade não é acúmulo. É correlação.',
    ],
    finops: [
      'A fatura mostra quanto foi gasto. A telemetria mostra por quê.',
      'Custo de cloud não é tema exclusivo de FinOps.',
      'Custo sem contexto é surpresa.',
      'Cortar custo sem visibilidade cria risco.',
      'Governança não é burocracia. É previsibilidade.',
      'Ver o jogo sem custo é luxo. Cortar o custo sem visão é chute.',
    ],
    platform_engineering: [
      'Platform Engineering não é um novo nome para DevOps.',
      'Platform Engineering é a base da estratégia de escala.',
      'Uma plataforma interna não é um portal bonito. É uma forma de reduzir decisões repetitivas.',
      'Autonomia sem contexto vira fragmentação.',
      'Padronização não precisa eliminar liberdade. Precisa eliminar trabalho desnecessário.',
    ],
    devsecops: [
      'Segurança não atrasa entrega. Segurança mal integrada atrasa.',
      'O objetivo do DevSecOps não é adicionar uma etapa. É remover surpresas.',
      'Segurança madura não depende de heróis revisando tudo no final.',
      'Velocidade sem governança é apenas aceleração de risco.',
    ],
    ia: [
      'IA pode acelerar a escrita de código. Mas não garante a durabilidade do software.',
      'Mais pull requests não significam menos dívida técnica.',
      'IA sem governança acelera dívida futura.',
      'A questão não é apenas qual modelo usar. É onde seus dados, código e contexto podem existir.',
    ],
    lideranca: [
      'Toda decisão técnica relevante também é uma decisão de negócio.',
      'A dívida técnica raramente aparece no orçamento até virar incidente.',
      'Eficiência não é cortar custo. É reduzir desperdício sem comprometer capacidade.',
      'Tecnologia precisa gerar controle, não complexidade.',
    ],
  },

  parceiros_tecnologia: ['Datadog', 'OpenTelemetry', 'Kubernetes', 'ArgoCD', 'Backstage'],
  hashtags: ['#SunnySystems', '#Observabilidade', '#FinOps', '#PlatformEngineering', '#DevOps', '#SRE', '#DevSecOps', '#Cloud', '#OpenTelemetry', '#AIOps', '#Datadog'],
  contato: 'contato@sunnysystems.com.br',
};

module.exports = { SUNNYSYSTEMS_KNOWLEDGE };
