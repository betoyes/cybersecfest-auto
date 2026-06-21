# CybersecFEST-Auto — Documentação Completa para IA

> **Repositório:** https://github.com/betoyes/cybersecfest-auto  
> **Galeria pública:** https://betoyes.github.io/cybersecfest-auto/  
> **Vercel (mirror):** https://cybersecfest-auto.vercel.app/  
> **Última atualização:** 2026-06-21

---

## 1. O QUE É ESTE REPOSITÓRIO

O `cybersecfest-auto` é um **pipeline autônomo e independente** de geração de conteúdo para o evento **CybersecFEST 2026** — a Principal Confraria de Cibersegurança do Brasil.

Ele é uma cópia operacional completa do pipeline CREAO (`betoyes/cybersecfest`), mas que roda **sem depender de nenhuma plataforma externa** — apenas GitHub Actions + APIs OpenAI + Gemini. Os dois repos coexistem em paralelo e são **independentes**: mudanças em um não afetam o outro.

### O que o pipeline faz automaticamente:
1. **3x por semana** (seg/qua/sex às 08h BRT): gera um briefing criativo → gera imagem IA → monta HTML com layout visual → gera e auto-seleciona legenda → publica no repo → galeria atualiza
2. **Diariamente** (07h BRT): verifica integridade dos arquivos, audita commits, faz backup para `betoyes/cybersecfest-backup`

---

## 2. ESTRUTURA DO REPOSITÓRIO

```
cybersecfest-auto/
│
├── .github/
│   └── workflows/
│       ├── pipeline.yml        ← Orquestrador (seg/qua/sex 11h UTC = 08h BRT)
│       └── guardian.yml        ← Health check + backup (diário 10h UTC = 07h BRT)
│
├── _agents/                    ← Documentação de referência (copiada do repo primário)
│   ├── pipeline-orquestrador/SKILL.md   ← Lógica original do Pipeline
│   ├── gerador-de-artes/SKILL.md        ← Lógica original do Gerador de Artes
│   ├── guardian-v1.0.0.md               ← Lógica original do Guardian
│   └── campaign-planner/SKILL.md        ← Campaign Planner (referência)
│
├── _scripts/                   ← Scripts Node.js autônomos (AQUI ESTÁ O CÓDIGO REAL)
│   ├── package.json            ← Dependências: openai ^4.52.0, @google/generative-ai ^0.21.0
│   ├── package-lock.json
│   ├── pipeline.js             ← PONTO DE ENTRADA do pipeline (chamado pelo Actions)
│   ├── gerador-artes.js        ← Gerador de artes (chamado pelo pipeline.js)
│   ├── guardian.js             ← Guardian health check + backup (chamado pelo Actions)
│   └── utils/
│       ├── github.js           ← Wrapper GitHub API (get/put arquivos, commits, repos)
│       ├── llm.js              ← OpenAI (GPT-4o + DALL-E 3) + Gemini (Flash + Imagen 3)
│       └── layouts.js          ← 14 templates HTML dos layouts visuais (A–N)
│
├── artes/                      ← Artes geradas (criadas automaticamente pelo pipeline)
│   ├── .gitkeep
│   ├── blog-1782058741657/
│   │   ├── arte.html           ← Arte completa (HTML com imagem base64 + overlay + texto)
│   │   ├── thumb.png           ← Thumbnail (imagem IA gerada)
│   │   └── index.html          ← Página individual da arte
│   ├── blog-1782058840735/     ← idem
│   ├── evento-1782045624931/   ← idem
│   └── patrocinador-1782039190901/ ← idem
│
├── assets/                     ← Logos fixos (nunca alterar)
│   ├── logo-cyberfest.png      ← Logo principal — SEM filter CSS
│   ├── logo-devops.webp        ← COM filter: brightness(0) invert(1), height 33px
│   ├── logo-iam.webp           ← COM filter: brightness(0) invert(1), height 33px
│   └── logo-alcatraz.webp      ← COM filter: brightness(0) invert(1), height 33px
│
├── artes.json                  ← Índice de todas as artes geradas (array JSON)
├── temas.json                  ← Banco de temas, rotação de layouts, histórico editorial
├── index.html                  ← Galeria pública (SPA com fetch de artes.json)
├── README.md                   ← README padrão
└── README-AUTO.md              ← Documentação técnica do repo standalone
```

---

## 3. GITHUB ACTIONS — SCHEDULES E SECRETS

### Ambiente de Secrets
Todos os secrets estão no **GitHub Environment: `CREAO-PROJECT`**  
Caminho: `Settings → Environments → CREAO-PROJECT → Environment secrets`

| Secret | Uso |
|--------|-----|
| `GH_PAT_CREAO` | PAT com permissão `repo` — commits, leitura/escrita de arquivos, criação de repos |
| `OPENAI_API_KEY_CREAO` | GPT-4o (geração de texto) + DALL-E 3 (imagens, fallback) |
| `GEMINI_API_KEY_CREAO` | Gemini Flash (texto, fallback) + Imagen 3 (imagens, primário) |

### Workflow: Pipeline Orquestrador
**Arquivo:** `.github/workflows/pipeline.yml`  
**Cron:** `0 11 * * 1,3,5` = seg/qua/sex às 11h UTC (08h BRT)  
**Trigger manual:** `workflow_dispatch` com campo `tipo_post` opcional  
**Comando:** `cd _scripts && npm ci && node pipeline.js`

### Workflow: Guardian
**Arquivo:** `.github/workflows/guardian.yml`  
**Cron:** `0 10 * * *` = diariamente às 10h UTC (07h BRT)  
**Comando:** `cd _scripts && npm ci && node guardian.js`

---

## 4. SCRIPTS — LÓGICA DETALHADA

### 4.1 `_scripts/utils/github.js`
Wrapper para a GitHub API. Todas as operações usam `process.env.GH_PAT_CREAO`.

**Funções exportadas:**
- `getFile(path, repo)` → `{ content: string, sha: string }` ou `null`
- `putFile(path, content, message, sha, repo)` → faz PUT via API
- `putBinary(path, buffer, message, sha, repo)` → PUT de arquivo binário
- `getJSON(path, repo)` → `{ data: object, sha: string }` ou `null`
- `putJSON(path, data, message, sha, repo)` → serializa e faz PUT
- `getCommits(n, repo)` → array de commits recentes
- `createRepo(name, description, isPrivate)` → cria repo no GitHub
- `repoExists(repo)` → boolean
- `listTree(repo)` → array de todos os arquivos (blobs) do repo

**Constante:** `REPO = 'betoyes/cybersecfest-auto'` (pode ser sobrescrito por `process.env.GITHUB_REPO`)

---

### 4.2 `_scripts/utils/llm.js`
Gerencia chamadas LLM com fallback automático.

**Geração de texto:**
- **Primário:** GPT-4o via `openai.chat.completions.create()`
- **Fallback:** Gemini 2.0 Flash via `@google/generative-ai`

**Geração de imagem:**
- **Primário:** Gemini Imagen 3 (`imagen-3.0-generate-002`) — aspecto 3:4
- **Fallback:** DALL-E 3 (`dall-e-3`) — 1024×1792px, `response_format: b64_json`
- **Último recurso:** PNG 1×1 transparente (nunca trava o pipeline)

**Funções exportadas:**
- `generateText(prompt, systemPrompt, temperature)` → string
- `generateImage(prompt)` → Buffer (PNG)

---

### 4.3 `_scripts/utils/layouts.js`
14 templates HTML completos para os layouts visuais (A–N).

**Design system fixo (imutável):**
| Variável | Valor |
|----------|-------|
| Fundo | `#02050A` |
| Azul destaque | `#14A8F4` |
| Branco texto | `#F6F8FF` |
| Lavanda | `#D5D8ED` |
| Muted | `#94A0B8` |
| Headline | Ubuntu 700 |
| Subtítulo | Montserrat 400 (nunca itálico) |
| Canvas | 540×675px (.art-canvas) |
| Logos ecossistema | height 33px + `filter: brightness(0) invert(1)` |
| Logo cyberfest | Colorido, SEM filter |

**Rotação de layouts por tipo de post:**
| Tipo | Sequência | Layout preferencial |
|------|-----------|---------------------|
| blog | C → M → N → C... | Subtítulo ao Lado / Pull Quote / Acento Diagonal |
| evento | E → L → J → E... | CTA Pill / L Invertido / 3 Blocos |
| palestrante | D → G → K → D... | Diagonal / Magazine Cover / Tríptico |
| patrocinador | F → I → B → F... | Coluna Sólida / Coluna Direita / Mirror Split |
| cidade | A → H → J → A... | Banda Superior / Rodapé Luminoso / 3 Blocos |

**Função exportada:**
- `renderLayout(letter, params)` → string HTML completo

**Parâmetros aceitos por layout:**
```javascript
{
  imageBase64,      // string base64 da imagem IA
  headline,         // texto principal
  subtitulo,        // texto secundário (opcional)
  palavrasAzuis,    // "PALAVRA1, PALAVRA2" para destacar em azul
  nomePalestrante,  // nome do speaker (layouts D, G, K)
  cargoEmpresa      // cargo e empresa (layouts D, K)
}
```

---

### 4.4 `_scripts/gerador-artes.js`
Gerador completo de uma arte. Pode ser chamado pelo `pipeline.js` ou diretamente.

**Fluxo de execução:**
1. Carrega `temas.json` do repo → lê `historico_recente`
2. Determina próximo layout na rotação para o `tipoPost`
3. Gera imagem IA via `llm.generateImage(prompt)` com prompt otimizado para o foco do layout
4. Gera legenda FOMO (versão A) via GPT-4o
5. Gera legenda aspiracional (versão B) via GPT-4o
6. Pontua cada legenda (0–10) via LLM
7. Reescreve automaticamente qualquer legenda com score < 7
8. **Auto-seleciona** a legenda de maior score (sem interação humana)
9. Monta HTML via `renderLayout()`
10. Faz upload de 3 arquivos:
    - `artes/{slug}/arte.html`
    - `artes/{slug}/thumb.png`
    - `artes/{slug}/index.html`
11. Atualiza `artes.json` (adiciona nova entrada)
12. Atualiza `temas.json` (registra layout usado em `historico_recente`, max 20 entradas)

**Função exportada:**
```javascript
gerarArte({
  tipoPost,           // 'blog' | 'evento' | 'palestrante' | 'patrocinador' | 'cidade'
  headline,
  subtitulo,
  palavrasAzuis,
  nomePalestrante,
  cargoEmpresa,
  contextoVisual,     // descrição da cena para a IA gerar a imagem
  cidade,
  layoutOverride,     // forçar um layout específico (opcional)
  briefingCompleto    // texto completo do briefing para contexto das legendas
})
```

**Slug gerado:** `{tipoPost}-{timestamp}` ex: `blog-1718901234567`

**Entrada no `artes.json`:**
```json
{
  "slug": "blog-1718901234567",
  "tipo": "blog",
  "headline": "...",
  "palavras_azuis": "...",
  "subtitulo": "...",
  "cidade": "BH e SP",
  "formato": "feed_vertical",
  "layout": "C",
  "legenda": "...",
  "legenda_variante": "A",
  "image_path": "artes/blog-1718901234567/thumb.png",
  "html_path": "artes/blog-1718901234567/arte.html",
  "created_at": "2026-06-21T15:40:00.000Z"
}
```

---

### 4.5 `_scripts/pipeline.js`
Ponto de entrada principal. Chamado pelo GitHub Actions no schedule.

**Fluxo:**
1. Determina horário BRT (UTC-3) e dia da semana
2. **Calendário editorial:** segunda → `blog` | quarta → `palestrante` | sexta → `evento` | outros → `blog`
3. Carrega `temas.json`
4. Gera briefing completo via GPT-4o (retorna JSON com `headline`, `palavras_azuis`, `subtitulo`, `contexto_visual`, `cidade`)
5. Chama `gerarArte()` com o briefing
6. Loga resultado

**Regras do briefing gerado (hardcoded no prompt):**
- Nunca começa com "O CybersecFEST"
- Tom: aspiracional, FOMO, pertencimento
- Público: CISOs, CIOs, CTOs, CEOs, VPs
- Eventos: BH (Novembro 2026) + SP (Outubro 2026)
- Evita repetir ângulos do `historico_recente`

---

### 4.6 `_scripts/guardian.js`
Agente de saúde e backup. Chamado diariamente.

**Verificações:**
1. `artes.json` — valida JSON, campos obrigatórios, slugs únicos
2. `temas.json` — valida estrutura, `historico_recente` ≤ 20 entradas
3. `index.html` — verifica existência e tamanho > 2KB
4. Vercel (`cybersecfest-auto.vercel.app`) — HTTP 200, tempo < 8s
5. Commits recentes — classifica por `[SuperAgent]`, externos, manuais

**Backup:**
- Destino: `betoyes/cybersecfest-backup` (cria se não existir, privado)
- Estratégia: compara SHA de cada arquivo; pula se idêntico; PUT se diferente
- Rate limit: 200ms entre requests
- Grava log em `_guardian/health-log.json` no repo backup (max 30 execuções)

**Status:** 🟢 VERDE | 🟡 AMARELO | 🔴 VERMELHO

---

## 5. ARQUIVOS DE DADOS

### `artes.json`
Array JSON com todas as artes geradas. Atualizado a cada nova arte.  
**URL:** `https://betoyes.github.io/cybersecfest-auto/artes.json`

Estado atual (2026-06-21): 4 artes
- `patrocinador-1782039190901` — tipo: patrocinador (sem layout registrado, migrada do primário)
- `evento-1782045624931` — tipo: evento (sem layout registrado, migrada do primário)
- `blog-1782058741657` — tipo: blog, layout: C
- `blog-1782058840735` — tipo: blog, layout: M

> ⚠️ Próximo blog usará layout **N** (ciclo C→M→N)

### `temas.json`
Banco de dados editorial com:
- `evento` — dados do CybersecFEST (cidades, histórico, marcas, realizadores, temas)
- `patrocinio` — cotas e benefícios (Emerald, Diamond, Gold)
- `regras_editoriais` — tom, frases âncora, proibições
- `temas[]` — 7 temas temáticos (IAM, PAM, DevSecOps, Cloud, LGPD/IA, Patrocínio, O Evento)
- `rotacao_layouts` — sequência de layouts por tipo de post
- `historico_recente[]` — últimas 20 artes publicadas (evita repetição de ângulos)
- `calendario_editorial` — regra seg/qua/sex

### `index.html`
Galeria SPA (Single Page Application). Carrega `artes.json` via `fetch()` relativo.  
Versão estável: **48.035 bytes** (não atualizar para versão maior — tem bug de sintaxe JS).

Funcionalidades:
- Grid de cards com iframe da `arte.html`
- Filtros por tipo, cidade e layout
- Modal de visualização com legenda completa
- Dashboard de métricas (por tipo, layout, cidade, variante A/B)
- Botão download PNG (`thumb.png`)

---

## 6. DEPLOY E HOSPEDAGEM

| Serviço | URL | Status | Observação |
|---------|-----|--------|------------|
| GitHub Pages | https://betoyes.github.io/cybersecfest-auto/ | ✅ Principal | Deploy automático em cada push para `main` |
| Vercel | https://cybersecfest-auto.vercel.app/ | ✅ Mirror | Limite free: 100 deploys/dia — pode esgotar |

**Deploy automático:** qualquer commit em `main` triggera novo deploy no GitHub Pages (~2min) e no Vercel (instantâneo, se não atingiu limite).

---

## 7. DIFERENÇAS ENTRE CREAO E AUTO

| Aspecto | CREAO (`betoyes/cybersecfest`) | AUTO (`betoyes/cybersecfest-auto`) |
|---------|-------------------------------|-----------------------------------|
| Interação humana | Sim — aprovação A/B da legenda | **Não** — auto-seleciona por score |
| Agendamento | CREAO Schedules | GitHub Actions cron |
| LLM texto | GPT-4o via CREAO | GPT-4o via API direta |
| LLM imagem | Gemini Imagen 3 via CREAO | Gemini Imagen 3 → DALL-E 3 fallback |
| Deploy | Vercel | GitHub Pages + Vercel mirror |
| Dependência | Plataforma CREAO | Nenhuma (zero lock-in) |
| Custo | Plano CREAO | API tokens (~centavos/run) |
| Aprovação editorial | Manual (usuário) | Automática (score ≥ 7/10) |
| Backup | Guardian via CREAO | Guardian via Actions |

---

## 8. REGRAS EDITORIAIS (IMUTÁVEIS)

O pipeline segue estas regras em TODO briefing gerado:

**Tom:** Aspiracional, exclusivo, FOMO. O leitor deve sentir: *"Se não estou lá, estou fora do mercado."*

**4 pilares de todo post:**
- Networking de alto nível
- Conteúdo estratégico
- Experiências reais
- Grandes oportunidades

**Estrutura:** Gancho → Tensão (leitor se reconhece) → CybersecFEST como resposta → CTA direto

**PROIBIDO:**
- Começar post com "O CybersecFEST"
- Tom técnico-acadêmico isolado
- Clichês visuais: cadeados, hackers encapuzados, código verde
- "Num mundo cada vez mais digital" e similares
- Preços de cotas de patrocínio
- Repetir ângulos recentes (verificar `historico_recente`)

**Tamanho das legendas:** 6–12 linhas + CTA + hashtags (máx 15 linhas)

---

## 9. COMO RODAR LOCALMENTE

```bash
git clone https://github.com/betoyes/cybersecfest-auto
cd cybersecfest-auto/_scripts
npm install

# Exportar variáveis de ambiente
export GH_PAT_CREAO="ghp_..."
export OPENAI_API_KEY_CREAO="sk-..."
export GEMINI_API_KEY_CREAO="AIza..."

# Rodar pipeline (gera uma arte completa)
node pipeline.js

# Rodar guardian (health check + backup)
node guardian.js

# Gerar arte manualmente com parâmetros
node gerador-artes.js tipo=blog headline="Sua headline aqui" contexto="Dark executive boardroom"
```

---

## 10. COMO ADICIONAR UM NOVO LAYOUT

1. Abrir `_scripts/utils/layouts.js`
2. Criar nova função com a letra do layout (ex: `function O({ imageBase64, headline, ... })`)
3. Adicionar ao objeto `LAYOUTS` no final do arquivo
4. Atualizar `ROTATION` em `_scripts/gerador-artes.js` para incluir a nova letra na rotação do tipo desejado
5. Atualizar `rotacao_layouts` em `temas.json` no repo

---

## 11. TROUBLESHOOTING

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| Galeria mostra "Nenhuma arte" | Bug de JS no `index.html` (versão > 48035 bytes) | Restaurar versão estável 48035 bytes |
| Pipeline falha no Actions | Secret não encontrado | Verificar environment `CREAO-PROJECT` nos secrets |
| Imagem gerada em branco | Gemini Imagen e DALL-E falharam | Verificar chaves API; pipeline continua com PNG 1×1 |
| Vercel com 404 nos assets | Limite de 100 deploys/dia atingido | Aguardar reset (meia-noite UTC) ou usar GitHub Pages |
| Guardian falha no backup | `GH_PAT_CREAO` sem permissão `repo` | Regenerar PAT com scope correto |
| `temas.json` com > 20 entradas | Bug no Guardian | Truncar `historico_recente` manualmente para 20 |

---

## 12. LINKS RÁPIDOS

| Recurso | URL |
|---------|-----|
| Repositório | https://github.com/betoyes/cybersecfest-auto |
| Galeria (GitHub Pages) | https://betoyes.github.io/cybersecfest-auto/ |
| Galeria (Vercel) | https://cybersecfest-auto.vercel.app/ |
| Repo backup | https://github.com/betoyes/cybersecfest-backup |
| Repo primário (CREAO) | https://github.com/betoyes/cybersecfest |
| Actions | https://github.com/betoyes/cybersecfest-auto/actions |
| Secrets | https://github.com/betoyes/cybersecfest-auto/settings/environments |
| artes.json live | https://betoyes.github.io/cybersecfest-auto/artes.json |
| temas.json live | https://betoyes.github.io/cybersecfest-auto/temas.json |
