# CybersecFEST — Auto (Standalone)

Pipeline autônomo do CybersecFEST rodando via **GitHub Actions**, completamente independente do CREAO.

## Como funciona

| Script | Descrição | Schedule |
|--------|-----------|----------|
| `_scripts/pipeline.js` | Gera briefing + arte automaticamente | Seg/Qua/Sex 08h BRT |
| `_scripts/guardian.js` | Health check + backup diário | Diariamente 07h BRT |
| `_scripts/gerador-artes.js` | Gerador de artes (chamado pelo pipeline) | — |

## Configuração

### 1. Adicionar Secrets no GitHub

Vá em **Settings → Secrets and variables → Actions** e adicione:

| Nome | Descrição |
|------|-----------|
| `GH_PAT_CREAO` | GitHub Personal Access Token (permissão `repo`) |
| `OPENAI_API_KEY_CREAO` | OpenAI API Key (GPT-4o + DALL-E 3) |
| `GEMINI_API_KEY_CREAO` | Google Gemini API Key (fallback) |

### 2. Ativar Actions

Vá em **Actions → Enable Actions** no repo se ainda não estiver ativo.

### 3. Deploy Vercel (opcional)

Conecte este repo no [Vercel](https://vercel.com) para publicar a galeria automaticamente a cada commit.

## Arquitetura

```
cybersecfest-auto/
├── .github/workflows/
│   ├── pipeline.yml      ← Orquestrador (seg/qua/sex)
│   └── guardian.yml      ← Health check (diário)
├── _scripts/
│   ├── pipeline.js       ← Ponto de entrada do pipeline
│   ├── gerador-artes.js  ← Gerador autônomo de artes
│   ├── guardian.js       ← Guardian de integridade e backup
│   ├── package.json
│   └── utils/
│       ├── github.js     ← GitHub API helpers
│       ├── llm.js        ← OpenAI + Gemini helpers
│       └── layouts.js    ← Templates HTML (layouts A-N)
├── artes/                ← Artes geradas automaticamente
├── assets/               ← Logos e imagens fixas
├── artes.json            ← Índice de todas as artes
├── temas.json            ← Banco de temas e rotação
└── index.html            ← Galeria pública
```

## Diferenças do repo CREAO

| | CREAO (betoyes/cybersecfest) | Auto (betoyes/cybersecfest-auto) |
|---|---|---|
| Interação humana | Sim (aprovação A/B) | Não (auto-seleção por score) |
| Dependência de plataforma | CREAO | Nenhuma |
| Agendamento | CREAO Schedules | GitHub Actions cron |
| LLM | GPT-4o via CREAO | GPT-4o via API direta |
| Fallback LLM | — | Gemini Flash |
| Custo | Plano CREAO | API tokens (centavos/run) |

## Execução manual

```bash
cd _scripts
npm install
GH_PAT_CREAO=xxx OPENAI_API_KEY_CREAO=yyy GEMINI_API_KEY_CREAO=zzz node pipeline.js
```

<!-- deploy: 2026-06-21T20:49:56.389Z -->