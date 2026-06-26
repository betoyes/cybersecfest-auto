# CybersecFEST — Documento de Handoff para Nova IA

> **Última atualização:** 25 jun 2026 — commit `a2b5ec0`  
> **Propósito:** Onboarding completo para qualquer IA ou agente que vá dar continuidade a este projeto.

---

## 1. O QUE É ESTE PROJETO

**CybersecFEST** é um evento premium de cibersegurança no Brasil (BH e SP 2026). Este repositório é a **fábrica automatizada de conteúdo** para as redes sociais do evento.

### O que ele faz:
- Gera **artes gráficas** para Instagram (feed vertical 1080×1350) automaticamente via IA
- Exibe as artes em uma **galeria local** (`index.html` acessível em `http://127.0.0.1:8765/`)
- Permite **editar** artes via editor inline no navegador
- Gera **animações HTML/GSAP** (Motion System) para as artes estáticas
- Renderiza as animações como **MP4** via HyperFrames CLI
- Exporta **legendas** para cada post

### Tecnologias principais:
- **Node.js** — scripts, servidor de desenvolvimento, geração de artes
- **HTML/CSS/JS puro** — galeria, artes estáticas e animadas
- **GSAP 3** — engine de animação
- **HyperFrames** (`npx hyperframes@0.7.3`) — render de HTML→MP4
- **OpenAI / GPT-4o** — geração de imagens de fundo e texto criativo
- **Puppeteer / Playwright** — captura de screenshots (thumbs)
- **Vercel** — deploy público da galeria (repositório espelho em `betoyes/cybersecfest`)

---

## 2. ESTRUTURA DE DIRETÓRIOS

```
cybersecfest-auto-1/               ← raiz do projeto
│
├── index.html                     ← GALERIA PÚBLICA (abre no browser local e Vercel)
├── artes.json                     ← BANCO PRINCIPAL — lista de todas as artes
├── temas.json                     ← contexto editorial, temas, rotação de layouts
├── propostas.json                 ← banco de rascunhos aguardando aprovação
├── animacoes.json                 ← registro de todas as animações geradas
├── AGENTS.md                      ← protocolo multi-agente (ler OBRIGATORIAMENTE)
├── HANDOFF.md                     ← este documento
│
├── artes/                         ← uma pasta por post publicado
│   └── {slug}/
│       ├── arte.html              ← HTML da arte estática (NUNCA editar diretamente)
│       ├── thumb.png              ← imagem composta final (logo + texto + fundo)
│       ├── fundo.png              ← foto de fundo pura (sem texto), ≈ igual thumb
│       ├── fundo-raw.png          ← foto de fundo LIMPA extraída do art-bg
│       ├── img-versoes/           ← histórico de versões de imagem (Mudar Imagem)
│       │   ├── index.json         ← { ativa: 2, versoes: [{id,criada_em,label}] }
│       │   ├── v1/
│       │   │   ├── fundo.png      ← imagem da versão 1 (original)
│       │   │   └── thumb.png      ← thumbnail da versão 1
│       │   └── v2/, v3/…          ← versões geradas via chat "Mudar Imagem"
│       └── motion/                ← pasta de animações (se tiver motion)
│           ├── versions.json      ← lista de versões (v1, v2, v3…)
│           ├── pedidos.json       ← fila de pedidos da UI
│           ├── v1/                ← versão 1 da animação
│           │   ├── index.html     ← composição HyperFrames + GSAP
│           │   ├── design.md      ← notas do preset
│           │   ├── hyperframes.json
│           │   ├── package.json
│           │   ├── preview.mp4    ← só após render
│           │   └── assets/
│           │       ├── fundo-raw.png   ← foto limpa (sem texto)
│           │       ├── fundo.png       ← foto composta (fallback)
│           │       ├── logo-cyberfest.png
│           │       ├── logo-devops.webp
│           │       ├── logo-iam.webp
│           │       ├── logo-alcatraz.webp
│           │       └── fonts/
│           │           ├── Ubuntu-Bold.woff2
│           │           ├── Montserrat-Regular.woff2
│           │           ├── Montserrat-SemiBold.woff2
│           │           └── Montserrat-Bold.woff2
│           └── v2/, v3/…          ← versões adicionais (mesma estrutura)
│
├── assets/
│   ├── css/gallery.css            ← estilos da galeria + modal motion
│   ├── js/
│   │   ├── motion-versions.js     ← frontend: carrega versões, player, downloads
│   │   ├── motion-sandbox.js      ← frontend: controle de quais posts têm motion
│   │   └── motion-prompt.js       ← frontend: modal "Nova Versão" + presets
│   ├── logo-cyberfest.png         ← logo principal
│   ├── logo-devops.webp           ← parceiro DevOps Bootcamp
│   ├── logo-iam.webp              ← parceiro IAM Tech Day
│   └── logo-alcatraz.webp         ← parceiro Alcatraz Security
│
├── _agents/
│   └── animador/
│       ├── SKILL.md               ← procedimento AnimAgent (passo a passo)
│       ├── config.json            ← configurações e catálogo de presets
│       └── BRIEF-PROMPT-ANIMACAO.md ← guia para criar briefs de animação
│
├── _scripts/                      ← scripts Node.js do sistema
│   ├── dev-server.js              ← servidor HTTP local (porta 8765)
│   ├── gerador-artes.js           ← gera arte completa via IA
│   ├── pipeline.js                ← orquestra geração completa
│   ├── pedido-run.js              ← executa pedido de nova arte
│   ├── aprovar-propostas.js       ← aprovação de lotes de propostas
│   ├── animar-arte.js             ← CLI para criar animação em um post
│   ├── motion-pedido-run.js       ← worker: gera versão motion em background
│   └── utils/
│       ├── motion-gerador.js      ← lógica de geração de versões motion
│       ├── motion-presets.js      ← HTML templates dos presets automáticos
│       ├── motion-versoes.js      ← leitura/escrita de versions.json
│       ├── motion-pedidos.js      ← fila de pedidos (pedidos.json)
│       ├── motion-mp4.js          ← resolve arquivo MP4 de uma versão
│       ├── motion-sandbox.js      ← controle de sandbox (Node.js)
│       ├── layouts.js             ← renderiza HTML de cada layout (A–Q)
│       ├── storage.js             ← abstração de leitura/escrita (local e GitHub)
│       ├── llm.js                 ← chamadas OpenAI (imagem + texto)
│       ├── thumb-composto.js      ← captura screenshot da arte como thumb.png
│       ├── editor-state.js        ← lê/escreve estado do editor inline
│       └── …outros utilitários
│
├── galeria-templates/
│   └── index.html                 ← galeria de templates (layouts A–Q)
│
└── effects-preview/               ← previews de efeitos visuais
```

---

## 3. COMO INICIAR O SERVIDOR LOCAL

```bash
cd _scripts
npm run dev
# ou:
LOCAL_MODE=1 node dev-server.js
```

Servidor sobe em: **`http://127.0.0.1:8765/`**

A variável `LOCAL_MODE=1` é essencial — sem ela o sistema tenta usar o GitHub API em vez de gravar em disco.

---

## 4. ARTES — COMO FUNCIONAM

### Tipos de post:
| Tipo | Exemplos de uso |
|------|-----------------|
| `blog` | Conteúdo editorial, gatilho FOMO |
| `evento` | Divulgação direta do evento |
| `patrocinador` | Chamada para patrocínio |
| `palestrante` | Destaque de speaker (ainda não gerado) |

### Layouts disponíveis (A–Q):
Cada layout é um template HTML com posicionamento diferente de elementos. Definidos em `_scripts/utils/layouts.js`. Os ativos estão em `galeria-templates/`.

### Paleta e tipografia da identidade visual:
- **Fundo:** `#02050A` (quase preto azulado)
- **Texto principal:** `#F6F8FF` (branco frio)
- **Destaque/azul:** `#14A8F4` (ciano elétrico)
- **Fonte headline:** Ubuntu Bold
- **Fonte corpo:** Montserrat (Regular, SemiBold, Bold)
- **Logos parceiros:** DevOps Bootcamp, IAM Tech Day, Alcatraz Security

### Estrutura de um post em `artes.json`:
```json
{
  "slug": "evento-1782045624931",
  "tipo": "evento",
  "headline": "O RISCO NÃO\nESPERA VOCÊ\nSE ATUALIZAR.",
  "palavras_azuis": "RISCO, ATUALIZAR",
  "subtitulo": "Venha debater com quem está no campo...",
  "cidade": "",
  "formato": "feed_vertical",
  "layout": "E",
  "legenda": "Texto completo para Instagram...",
  "image_path": "artes/evento-1782045624931/thumb.png",
  "html_path": "artes/evento-1782045624931/arte.html",
  "created_at": "2026-06-21T12:40:27.598Z"
}
```

### Regra CRÍTICA — `artes.json` é append-only:
**Nunca remover entradas.** Só adicionar. O SuperAgent tem posse exclusiva de escrita.

---

## 5. POSTS EXISTENTES (jun/2026)

| Slug | Tipo | Layout | Tem motion? |
|------|------|--------|-------------|
| `patrocinador-1782039190901` | patrocinador | F | ❌ |
| `evento-1782045624931` | evento | E | ✅ v1 (cinematic-13s, HTML preview) |
| `blog-1782058741657` | blog | C | ❌ |
| `blog-1782058840735` | blog | M | ❌ |
| `blog-1782085374136` | blog | N | ❌ |
| `blog-1782085638864` | blog | C | ❌ |
| `blog-1782087418412` | blog | M | ❌ |
| `blog-1782100791590` | blog | N | ❌ |
| `blog-1782102928259` | blog | M | ❌ |
| `evento-1782143777641` | evento | E | ✅ v1/v2/v3 (v3=preview, tem MP4) |
| `blog-1782236441882` | blog | C | ❌ |
| `blog-1782238181309` | blog | C | ❌ |
| `patrocinador-1782316675205` | patrocinador | I | ❌ |

---

## 6. MOTION SYSTEM — COMO FUNCIONA

Este é o sistema mais complexo. Permite criar versões animadas das artes estáticas.

### Arquitetura do Motion System:

```
UI (index.html)
  ↓ clica "MOTION" no modal do card
assets/js/motion-versions.js     ← frontend: carrega versions.json, exibe player
assets/js/motion-prompt.js       ← frontend: modal "Nova Versão"
  ↓ POST /api/motion/pedido
_scripts/dev-server.js            ← cria pedido.json, dispara worker em background
  ↓ spawn
_scripts/motion-pedido-run.js    ← worker (processo filho)
  ↓ chama
_scripts/utils/motion-gerador.js ← gera HTML da nova versão
  ↓ usa
_scripts/utils/motion-presets.js ← templates HTML+GSAP dos presets automáticos
  ↓ escreve
artes/{slug}/motion/v{N}/        ← nova versão criada em disco
  ↓ atualiza
artes/{slug}/motion/versions.json
animacoes.json
```

### `versions.json` — estrutura:
```json
{
  "slug": "evento-1782045624931",
  "preview": 1,          ← versão atualmente selecionada para exibição
  "mp4_from": 1,         ← versão com MP4 aprovado para download
  "versions": [
    {
      "id": 1,
      "dir": "v1",        ← pasta física: motion/v1/
      "preset": "cinematic-reveal-13s",
      "duracao_s": 13,
      "created_at": "2026-06-25T23:30:00.000Z",
      "note": "Descrição da versão",
      "mp4": null          ← "preview.mp4" se tiver MP4 gerado
    }
  ]
}
```

**Legado:** posts antigos têm `dir: "."` (composição na raiz de `motion/`, não em subpasta).

### Presets automáticos (`motion-presets.js`):

| ID | Label | Duração | Auto | Descrição |
|----|-------|---------|------|-----------|
| `entrance-premium-6s` | entrada | 6.5s | ✅ | Ken Burns suave, headline sobe em stagger |
| `kinetic-swipe-7s` | swipe | 7s | ✅ | Headline entra pela esquerda, flash azul |
| `confraria-lite-8s` | hud | 8s | ✅ | Cantos HUD, orb atmosférico, 3D leve |
| `confraria-signal` | signal | 9s | ❌ (manual) | Grid, scan, parallax duplo, CTA shine |

**Presets manuais existentes** (criados pelo Cursor, não pelo gerador automático):

| Post | Versão | Preset ID | Duração | Status |
|------|--------|-----------|---------|--------|
| `evento-1782045624931` | v1 | `cinematic-reveal-13s` | 13s | HTML preview (sem MP4) |
| `evento-1782143777641` | v1 | `signal-mesh-10s` | 10s | legado (dir: ".") |
| `evento-1782143777641` | v2 | `signal-mesh-enhanced-10s` | 10s | tem MP4 |
| `evento-1782143777641` | v3 | `cyber-command-impact-9s` | 9s | **preview atual**, tem MP4 |

### PROBLEMA CRÍTICO RESOLVIDO — Ghost Text / Double Text

**O que era:** Todo preset automático usa `fundo.png` como imagem de fundo. O `fundo.png` é uma cópia do `thumb.png`, que é a composição completa (logo + texto + subtítulo + tudo baked). Ao colocar texto HTML por cima, criava texto duplicado.

**A solução implementada:**

1. **`fundo-raw.png`** — imagem extraída do elemento `#art-bg` da `arte.html`. É a foto de fundo original **sem texto**. Deve existir em `artes/{slug}/fundo-raw.png`.

2. **`motion-gerador.js`** — ao copiar assets para uma nova versão, prioridade:
   ```
   fundo-raw.png > fundo.png > thumb.png
   ```
   Se `fundo-raw.png` existir, usa ele (foto limpa). Assim novos presets automáticos nunca terão ghost text.

3. **Overlay 100% sólido** — em `motion-presets.js`, o `.overlay` agora é `#02050a` sólido nos primeiros 55% da largura e faz gradiente até transparente em 78%. Cobre completamente qualquer texto baked no lado esquerdo.

4. **v1 de `evento-1782045624931`** — usa `fundo-raw.png` diretamente. O overlay é `opacity: 1` desde o CSS (não animado), eliminando janela de visibilidade do fundo.

**Para novos posts:** Ao criar uma animação, extrair `fundo-raw.png` do `#art-bg` da `arte.html` e salvar em `artes/{slug}/fundo-raw.png`.

### Como criar `fundo-raw.png` para um post:
```javascript
// Na arte.html, o elemento #art-bg tem background-image: url('data:image/...')
// Extrair esse data URI e salvar como fundo-raw.png
// Isso pode ser feito via Puppeteer ou manualmente inspecionando o DOM
```

### Contrato HyperFrames (composição válida):
```html
<div id="root"
  data-composition-id="preset-id"
  data-start="0"
  data-width="1080"
  data-height="1350"
  data-duration="13">
  <section class="clip scene"
    data-start="0"
    data-duration="13"
    data-track-index="1">
    <!-- conteúdo -->
  </section>
</div>
<script>
  const tl = gsap.timeline({ paused: true });
  // animações...
  window.__timelines['preset-id'] = tl;
</script>
```

**Obrigatório:**
- `data-composition-id` único
- `gsap.timeline({ paused: true })`
- `window.__timelines["id"] = tl`
- **SEM** `repeat: -1` (render determinístico)
- **SEM** Google Fonts CDN (apenas `@font-face` local com `.woff2`)
- Validar com `npx hyperframes@0.7.3 lint` antes de commitar

### Render de MP4:
```bash
cd artes/{slug}/motion/v{N}
npm run render
# equivale a: npx hyperframes@0.7.3 render --fps 30 --quality high --output preview.mp4
```

---

## 7. API REST DO SERVIDOR LOCAL

O `dev-server.js` roda na porta **8765** e expõe:

### Rotas de Artes:
| Método | Path | O que faz |
|--------|------|-----------|
| `POST` | `/api/pedido` | Gera nova arte (fluxo completo via IA) |
| `GET` | `/api/propostas` | Lista propostas pendentes de aprovação |
| `POST` | `/api/aprovar` | Aprova lote de propostas |
| `POST` | `/api/rejeitar` | Rejeita lote |
| `POST` | `/api/banco` | Consome uma proposta do banco pré-gerado |
| `POST` | `/api/arte/salvar` | Salva edições do editor inline |
| `POST` | `/api/arte/deletar` | Remove uma arte |
| `POST` | `/api/campanha` | Gera lote de artes (campanha) |
| `GET` | `/api/campanha/export` | Exporta ZIP da campanha |
| `POST` | `/api/arte/imagem/mudar` | Gera nova imagem via IA (instrução livre) |
| `GET` | `/api/arte/imagem/versoes?slug=` | Lista versões de imagem de um post |
| `POST` | `/api/arte/imagem/versao/ativar` | Restaura versão anterior como ativa |
| `POST` | `/api/arte/imagem/versao/deletar` | Deleta uma versão de imagem |

### Rotas Motion:
| Método | Path | O que faz |
|--------|------|-----------|
| `POST` | `/api/motion/pedido` | Cria pedido de nova versão (dispara worker) |
| `GET` | `/api/motion/pedido?slug=` | Status do pedido em andamento |
| `GET` | `/api/motion/versoes?slug=` | Lista versões de um post |
| `POST` | `/api/motion/selecionar` | Define versão preview |
| `POST` | `/api/motion/aprovar-mp4` | Define versão como source do MP4 |
| `POST` | `/api/motion/deletar` | Deleta uma versão (v2+, nunca v1) |
| `GET` | `/api/motion/mp4?slug=&version=` | Resolve URL do MP4 de uma versão |
| `GET` | `/api/motion/presets?slug=` | Lista presets disponíveis |

### Payload de `/api/motion/pedido`:
```json
{
  "slug": "evento-1782045624931",
  "mode": "surpresa",           ← "surpresa" ou "ajustar"
  "instrucoes": "mais lento",   ← só quando mode=ajustar
  "baseVersion": 1,             ← versão base para ajuste (opcional)
  "presetId": "kinetic-swipe-7s" ← preset específico (opcional)
}
```

### Payload de `/api/motion/selecionar`:
```json
{ "slug": "evento-1782045624931", "version": 2 }
```

---

## 8. GALERIA (index.html) — COMO FUNCIONA

A galeria principal em `index.html` é uma SPA (Single Page App) que:

1. Carrega `artes.json` e exibe os cards em grade
2. Cards são clicáveis — todas as ações ficam **apenas no modal** (sem botões na grade)
3. Clicando num card abre modal com:
   - **Preview** da arte (`thumb.png`)
   - **Mudar Imagem**: campo de instrução livre + botão Gerar → chama `/api/arte/imagem/mudar`
     - Pills de versão aparecem abaixo (v1 Original, v2 — instrução, …)
     - Clique num pill não-ativo → restaura aquela versão via `/api/arte/imagem/versao/ativar`
     - Botão `×` em pills não-ativos → deleta via `/api/arte/imagem/versao/deletar`
   - **Legenda**, **Editar**, **↓ PNG**, **🗑 Deletar**
   - **Motion EM STANDBY**: UI de motion comentada em `index.html` (código preservado, não deletado)

### `<hyperframes-player>` Web Component:
```html
<hyperframes-player src="artes/{slug}/motion/v1/index.html"></hyperframes-player>
```
Carrega a composição em iframe, controla play/pause/timeline.

### Visibilidade do Motion:
Controlada por `assets/js/motion-sandbox.js`. Atualmente retorna `true` para qualquer slug não-vazio (motion universal para todos os posts).

### Geração em background:
Quando o usuário clica "+ Nova Versão", o servidor:
1. Cria `pedidos.json` com status `pending`
2. Dispara `motion-pedido-run.js` como processo filho (`spawn + detached`)
3. Retorna imediatamente ao frontend com `{ ok: true, pedido: { id, targetVersion } }`
4. O frontend faz polling em `/api/motion/pedido?slug=` até status `done`

---

## 9. AGENTES — QUEM SÃO, COMO FUNCIONAM E PROTOCOLO

### 9.1 Visão Geral — Dois Agentes Distintos

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO (Beto)                                │
│  Orquestra ambos os agentes, aprova outputs, dá direção         │
└────────────────┬──────────────────────────┬────────────────────-┘
                 │                          │
     ┌───────────▼──────────┐   ┌───────────▼──────────┐
     │     SUPERAGENT       │   │      ANIMAGENT        │
     │   Plataforma: CREAO  │   │   Plataforma: Cursor  │
     │                      │   │                       │
     │ Gera artes estáticas │   │ Cria animações motion │
     │ Orquestra editorial  │   │ Render MP4            │
     │ Mantém artes.json    │   │ Mantém animacoes.json │
     │ Deploy Vercel        │   │ Mantém motion/        │
     └──────────────────────┘   └───────────────────────┘
```

---

### 9.2 SuperAgent (CREAO)

**Plataforma:** CREAO (plataforma proprietária de agentes IA)  
**Prefixo de commit:** `[SuperAgent]`

#### O que o SuperAgent faz — fluxo completo:

```
1. Recebe instrução do usuário
   ("gere um post de blog sobre IAM")
         ↓
2. Lê temas.json
   - Identifica tema editorial
   - Verifica rotação de layouts (qual layout usar)
   - Consulta historico_recente para não repetir
         ↓
3. Gera texto criativo (via GPT-4 / LLM)
   - headline (maiúsculas, 3–5 palavras impactantes)
   - palavras_azuis (quais palavras ficam em #14A8F4)
   - subtitulo (1–2 frases de apoio)
   - legenda (texto completo para Instagram)
         ↓
4. Gera imagem de fundo (via DALL-E / GPT-4o Vision)
   - Estilo: fotografia dark, cidade à noite, luz azul
   - Dimensões: ~1122×1402 (maior que o canvas para o Ken Burns)
   - Salva como base64 em arte.html (#art-bg)
         ↓
5. Renderiza arte.html
   - Usa layouts.js para montar o HTML (layout A–Q)
   - Insere imagem como background-image no #art-bg
   - Insere texto em #art-content (logo, headline, subtítulo, CTAs)
   - Salva em artes/{slug}/arte.html
         ↓
6. Captura screenshot (Puppeteer/Playwright)
   - Tira screenshot de arte.html em 1080×1350
   - Salva como artes/{slug}/thumb.png
         ↓
7. Registra em artes.json
   - Append da entrada com slug, tipo, headline, layout, paths
   - Atualiza temas.json (historico_recente)
         ↓
8. Atualiza index.html
   - Adiciona o novo card na galeria pública
   - Via branch + PR (nunca direto na main)
         ↓
9. Commit [SuperAgent] + push para repo público
```

#### Onde vive o conteúdo gerado pelo SuperAgent:
```
artes/{slug}/
  arte.html       ← HTML completo da arte (NÃO editar)
  thumb.png       ← composição final capturada (logo+texto+fundo, tudo em uma imagem)
  fundo.png       ← pode ser igual ao thumb.png (composição) OU foto limpa
```

> ⚠️ **IMPORTANTE:** `thumb.png` é uma imagem composta — tem o logo, headline, subtítulo, logos parceiros TUDO BAKED como pixels. Não é só o fundo. Isso é o que causa o problema de "ghost text" nas animações se usada diretamente.

#### Quando o SuperAgent usa o GitHub API diretamente:
O SuperAgent opera via API do GitHub (não via git local). Ele usa `PUT /repos/betoyes/cybersecfest/contents/arquivo` para commitar. Por isso a regra de "fetch fresco antes de escrever" — ele precisa do SHA atual para não criar conflitos.

---

### 9.3 AnimAgent (Cursor)

**Plataforma:** Cursor IDE (este ambiente)  
**Prefixo de commit:** `[AnimAgent]` ou `[Cursor]`

#### O que o AnimAgent faz — fluxo completo:

```
1. Recebe instrução do usuário
   ("crie animação para evento-1782045624931")
         ↓
2. Leitura obrigatória (PASSO 0 do SKILL.md)
   - AGENTS.md
   - _agents/animador/config.json
   - artes.json (metadados do post: headline, palavras_azuis, etc.)
   - artes/{slug}/arte.html (somente leitura — referência visual)
   - artes/{slug}/motion/versions.json (se existir)
         ↓
3. Prepara assets
   - Extrai fundo-raw.png de arte.html (#art-bg background-image)
   - Salva em artes/{slug}/fundo-raw.png (foto limpa, sem texto)
   - Copia logos, fontes para motion/v{N}/assets/
         ↓
4. Compõe index.html (HyperFrames + GSAP)
   - Canvas 1080×1350
   - Fundo: fundo-raw.png (foto limpa)
   - Overlay: gradiente sólido na esquerda (cobre área do texto)
   - Camadas: bg → overlay → luz azul → partículas → vinheta → conteúdo HTML
   - Timeline GSAP: paused, determinística, sem repeat:-1
   - window.__timelines["preset-id"] = tl
         ↓
5. Valida
   cd artes/{slug}/motion/v{N}
   npx hyperframes@0.7.3 lint    ← 0 erros obrigatório
         ↓
6. Registra em versions.json (append)
   {
     "id": N,
     "dir": "vN",
     "preset": "nome-do-preset",
     "duracao_s": 13,
     "created_at": "...",
     "note": "descrição",
     "mp4": null
   }
         ↓
7. Registra em animacoes.json (append ou update)
         ↓
8. Render MP4 (quando solicitado)
   cd artes/{slug}/motion/v{N}
   npm run render
   → preview.mp4
         ↓
9. Commit [AnimAgent] feat: motion {preset} — {slug}
```

#### Como o AnimAgent cria animações manualmente vs automaticamente:

**Modo automático (via UI "Nova Versão"):**
- Usuário clica "+ Nova Versão" na galeria
- Frontend chama `POST /api/motion/pedido`
- `dev-server.js` cria um pedido em `pedidos.json` e dispara `motion-pedido-run.js` como processo filho
- `motion-pedido-run.js` chama `motion-gerador.js` → `motion-presets.js`
- O preset gera o HTML completo automaticamente usando os dados de `artes.json`
- Versão criada em `motion/v{N}/`

**Modo manual (via Cursor/AnimAgent):**
- Usuário descreve a animação desejada (pode usar `BRIEF-PROMPT-ANIMACAO.md` como guia)
- O AnimAgent lê o brief, entende o conceito criativo
- Escreve o `index.html` manualmente com GSAP timeline customizada
- Permite animações muito mais sofisticadas que os presets automáticos
- Exemplo: `cinematic-reveal-13s` (v1 de `evento-1782045624931`)

#### Arquivos de skill do AnimAgent:
```
_agents/animador/
  SKILL.md                    ← procedimento passo a passo (ler antes de operar)
  config.json                 ← catálogo de presets, paths, regras
  BRIEF-PROMPT-ANIMACAO.md    ← guia para criar briefs de animação com IA externa
```

---

### 9.4 Interação entre os Agentes

Os agentes **NÃO se comunicam diretamente**. O usuário é o ponto de contato entre eles.

```
SuperAgent cria arte
    → artes.json atualizado
    → artes/{slug}/arte.html + thumb.png criados
    
Usuário pede ao AnimAgent para animar
    → AnimAgent lê artes.json para pegar metadados
    → AnimAgent NÃO modifica arte.html ou artes.json
    → AnimAgent cria artes/{slug}/motion/ com animações
    → AnimAgent atualiza animacoes.json
```

#### Verificação de estado cruzado:
Antes de qualquer operação, verificar os últimos commits:
```bash
git log --oneline -10
```
Se houver commits com prefixo diferente do seu, reportar ao usuário antes de prosseguir.

---

### 9.5 Protocolo de Commits e Branches

**Prefixos de commit obrigatórios:**
```
[SuperAgent] feat: adiciona arte blog-1782xxxxxx — Layout N
[AnimAgent]  feat: motion cinematic-reveal-13s — evento-1782045624931
[Cursor]     feat: Motion System v1 — pipeline completo
[Cursor]     fix: ghost text — overlay sólido + fundo-raw.png
```

**Mudanças em arquivos centrais → Branch + PR:**
```bash
# Criar branch com prefixo do agente
git checkout -b animagent/update-motion-presets

# Fazer o commit na branch
git commit -m "[AnimAgent] feat: novo preset premium signal-v2"

# Abrir PR para o usuário aprovar
gh pr create --title "AnimAgent: novo preset signal-v2"
```

**Arquivos com dono definido:**
| Arquivo/Pasta | Dono | Outros agentes |
|---------------|------|----------------|
| `artes.json` | SuperAgent | Apenas leitura |
| `temas.json` | SuperAgent | Leitura; edições via branch |
| `index.html` | SuperAgent | Leitura; edições via branch |
| `_agents/` | SuperAgent | Apenas leitura |
| `animacoes.json` | AnimAgent | Append-only |
| `artes/{slug}/motion/` | AnimAgent | Escrita livre |
| `AGENTS.md` | Qualquer agente | PR obrigatório |
| `HANDOFF.md` | Qualquer agente | PR obrigatório |

---

### 9.6 Onboarding de Nova IA neste Protocolo

Se uma nova IA/agente for integrada:

1. Solicitar ao usuário um GitHub Token com permissão `push`
2. Leitura obrigatória: `AGENTS.md`, `HANDOFF.md`, `artes.json`, `temas.json`
3. Verificar últimos 5 commits para identificar atividade recente
4. Escolher prefixo de commit único (ex: `[ClaudeAgent]`, `[GPTAgent]`)
5. Adicionar linha na tabela de agentes em `AGENTS.md` via PR
6. **Nunca** usar `artes.json` como escrita se não for o SuperAgent

---

## 10. FLUXO EDITORIAL

### Calendário:
| Dia | Tipo de post | Tom |
|-----|-------------|-----|
| Segunda | blog | Gatilho pertencimento / conteúdo tema da grade |
| Quarta | palestrante | Autoridade + FOMO |
| Sexta | evento ou patrocinador | Chamada direta |

### Tom editorial (NUNCA violar):
- **Aspiracional, exclusivo, FOMO** — "se não estou lá, estou fora do mercado"
- **Proibido:** hackers encapuzados, cadeados, código verde, "num mundo cada vez mais digital", preços de cotas, datas não confirmadas

### Palavras azuis:
Campo `palavras_azuis` no `artes.json` indica quais palavras do headline aparecem em `#14A8F4`. Separadas por vírgula, case-insensitive.

### Rotação de layouts:
```
blog:         C → M → N → O → (repete)
evento:       E → L → J → P → (repete)
patrocinador: F → I → B → Q → (repete)
```

---

## 11. DEPLOY / REPOSITÓRIO PÚBLICO

- **Repo local:** `betoyes/cybersecfest-auto-1` (este repositório)
- **Repo público (Vercel):** `betoyes/cybersecfest`
- A galeria pública (`index.html`) é deployada no Vercel do repo público
- O SuperAgent faz push de artes aprovadas via GitHub API diretamente no repo público

---

## 12. ESTADO ATUAL DO PROJETO (jun/2026)

### O que está funcionando:
- ✅ Geração automática de artes (blog, evento, patrocinador)
- ✅ Editor inline no modal da galeria
- ✅ Galeria local com preview, edição e aprovação
- ✅ **Mudar Imagem** — troca de fundo via instrução livre no modal (Gemini, sem referências visuais)
- ✅ **Versionamento de imagem** — histórico em `img-versoes/`, pills de versão no modal, ativar/deletar
- ✅ `background-size: cover` no editor (era `110%` fixo — cortava o sujeito)
- ✅ `LAYOUT_BG_POS` — posição automática do fundo por layout ao trocar imagem (C=direita, B=esquerda, O=baixo, etc.)
- ✅ Motion System: presets automáticos + presets manuais (UI em standby, código preservado)
- ✅ Versionamento de animações (v1, v2, v3…)
- ✅ Download de MP4 pela galeria
- ✅ Fix definitivo de ghost text (fundo-raw.png + overlay sólido)
- ✅ `evento-1782045624931` — v1 cinematográfica (13s, HTML preview)
- ✅ `evento-1782143777641` — v1/v2/v3 (v3 com MP4)

### Motion UI — Estado Standby (jun/2026):
A UI de motion (tabs estático/motion, barra de versões, HyperFrames player, scripts) está **comentada** em `index.html` com marcadores `<!-- MOTION EM STANDBY -->`. O código existe completo e pode ser reativado descomentando. O pipeline backend de geração continua funcional.

### O que ainda precisa ser feito:
- ❌ Extrair `fundo-raw.png` para todos os posts (só `evento-1782045624931` tem)
- ❌ Criar motion para os outros 11 posts
- ❌ Validar e render MP4 da v1 de `evento-1782045624931`
- ❌ Posts do tipo `palestrante` ainda não foram criados
- ❌ Preset `confraria-signal` (manual premium) ainda não implementado como preset automático
- ❌ Deploy automático para o Vercel (ainda manual)
- ❌ Reativar UI de motion quando pipeline estiver estável

---

## 13. COMO UMA NOVA IA DEVE COMEÇAR

### Passo 0 — Leitura obrigatória:
```
1. AGENTS.md         ← protocolo multi-agente
2. HANDOFF.md        ← este documento
3. artes.json        ← posts existentes (não duplicar slugs)
4. temas.json        ← contexto editorial vigente
5. animacoes.json    ← animações já criadas
```

### Passo 1 — Verificar commits recentes:
```bash
git log --oneline -10
```
Identificar commits de outros agentes antes de operar.

### Passo 2 — Subir servidor local:
```bash
cd _scripts && npm run dev
```
Acessar: `http://127.0.0.1:8765/`

### Passo 3 — Para criar uma animação nova:
1. Verificar se o post tem `fundo-raw.png` em `artes/{slug}/`
2. Se não tiver, extrair do `arte.html` (elemento `#art-bg` → `background-image`)
3. Seguir o procedimento em `_agents/animador/SKILL.md`
4. Usar prefixo de commit `[AnimAgent]`

### Passo 4 — Para criar uma nova arte estática:
Isso é responsabilidade do **SuperAgent** (CREAO). O Cursor/AnimAgent não deve criar artes sem coordenação.

---

## 14. ARQUIVOS CHAVE — RESUMO RÁPIDO

| Arquivo | O que é | Quem edita |
|---------|---------|-----------|
| `artes.json` | banco de posts | SuperAgent (append-only) |
| `temas.json` | contexto editorial, rotação | SuperAgent |
| `animacoes.json` | registro de animações | AnimAgent (append-only) |
| `index.html` | galeria pública | SuperAgent (via PR) |
| `AGENTS.md` | protocolo colaboração | Qualquer agente via PR |
| `_scripts/dev-server.js` | servidor + API | Cursor |
| `_scripts/utils/motion-gerador.js` | gera versões motion | Cursor/AnimAgent |
| `_scripts/utils/motion-presets.js` | templates HTML presets | Cursor/AnimAgent |
| `_scripts/utils/motion-versoes.js` | lê/escreve versions.json | Cursor/AnimAgent |
| `assets/js/motion-versions.js` | frontend player motion | Cursor |
| `assets/js/motion-sandbox.js` | quais posts têm motion | Cursor |
| `_agents/animador/SKILL.md` | procedimento AnimAgent | AnimAgent via PR |
| `_scripts/utils/editor-state.js` | estado padrão do editor inline | Cursor |
| `_scripts/utils/editor-v3-script.js` | JS do editor inline (uBg, uEl, uTxt…) | Cursor |
| `_scripts/utils/editor-wrap.js` | wrap HTML + CSS do editor | Cursor |
| `_scripts/utils/imagem-prompt.js` | prompts de imagem por layout (A–Q) | Cursor |
| `_scripts/utils/llm.js` | clientes Gemini + OpenAI (texto e imagem) | Cursor |

---

## 15. VARIÁVEIS DE AMBIENTE

Arquivo `.env` na raiz (não commitado):

```env
LOCAL_MODE=1              # grava em disco local (obrigatório para dev)
OPENAI_API_KEY=sk-...     # geração de imagens e texto
GITHUB_TOKEN=ghp_...      # push para repo público (Vercel)
GITHUB_REPO=betoyes/cybersecfest  # repo público
```

---

## 16. COMANDOS ÚTEIS

```bash
# Subir servidor de desenvolvimento
cd _scripts && npm run dev

# Criar animação via CLI
node _scripts/animar-arte.js --slug evento-1782045624931 --preset entrance-premium-6s

# Validar composição HyperFrames
cd artes/{slug}/motion/v1 && npx hyperframes@0.7.3 lint

# Preview no browser
cd artes/{slug}/motion/v1 && npx hyperframes@0.7.3 preview

# Render MP4 (qualidade alta)
cd artes/{slug}/motion/v1 && npm run render

# Render MP4 (rascunho rápido)
cd artes/{slug}/motion/v1 && npm run render:draft

# Ver versões de um post
cat artes/{slug}/motion/versions.json

# Ver todas as animações
cat animacoes.json
```

---

## 17. GOTCHAS E ARMADILHAS CONHECIDAS

1. **Ghost text / Double text:** Sempre usar `fundo-raw.png` (foto limpa) como fundo das animações. Se não existir, criar extraindo do `#art-bg` da `arte.html`. Nunca usar `thumb.png` diretamente como fundo em composições com texto HTML.

2. **Preview automático da nova versão:** Quando o worker gera uma nova versão, ele define `preview = novaVersão` em `versions.json`. Se quiser manter a versão original como preview, definir manualmente via `POST /api/motion/selecionar`.

3. **Overlay deve ser opacity:1 desde o CSS:** Não animar o overlay de 0→1 se ele precisar cobrir texto baked. Animá-lo significa que entre t=0 e t=fade, o fundo fica exposto.

4. **Sem `repeat: -1` no GSAP:** O HyperFrames render captura frames determinísticos. Loop infinito trava o render. Para loops ambiente, use `gsap.delayedCall` ou callback `onComplete`.

5. **Fontes obrigatoriamente locais:** `@font-face` com `.woff2` em `assets/fonts/`. Google Fonts CDN falha no render headless.

6. **`artes.json` append-only:** Nunca remover ou reordenar entradas. Só adicionar ao final.

7. **Sandbox Node vs frontend divergem:** `_scripts/utils/motion-sandbox.js` ainda restringe a `evento-1782143777641` por código. `assets/js/motion-sandbox.js` já liberou para todos. Se precisar liberar no servidor também, editar `motion-sandbox.js` do `_scripts/utils/`.

8. **Versão legado `dir: "."`:** Posts antigos têm a composição na raiz de `motion/` (não em `v1/`). O sistema lida com isso, mas novas versões devem sempre usar subpastas `v{N}/`.

9. **Mudar Imagem — `useReferences: false`:** A rota `/api/arte/imagem/mudar` desativa as imagens de referência de estilo (`useReferences: false`). Isso é intencional — as referências copiavam a composição (ex: homem de costas) e ignoravam a instrução do usuário. O estilo de marca é mantido via prompt textual (`buildImagePrompt` com `userScene`).

10. **`background-position` por layout:** Ao trocar imagem, `LAYOUT_BG_POS` em `dev-server.js` define a posição de fundo correta por layout. Ex: layout C (sujeito à direita) usa `x: 85%`. Sem isso o sujeito gerado à direita ficava cortado com `background-position: 50%`. Ajustes manuais posteriores no editor ainda são possíveis.

11. **Imagem original extraída do `arte.html`:** Posts sem `fundo.png` separado têm a imagem embutida como base64 no `#art-bg` dentro do HTML. O `handleMudarImagem` extrai esse base64 e salva como `v1 — Original` em `img-versoes/` antes de sobrescrever, permitindo restauração posterior.

12. **Modelos Gemini para imagem (jun/2026):** Os modelos válidos são `gemini-2.5-flash-image` (primário) e `gemini-3.1-flash-image-preview` (fallback). O nome `gemini-3.1-flash-image` (sem `-preview`) não existe. A config correta usa `imageConfig: { aspectRatio: '3:4' }`, não `responseFormat`. Se todos os modelos falharem, `generateImage` lança erro com mensagem completa de ambos (Gemini + DALL-E) em vez de retornar silenciosamente.

---

*Documento atualizado em 26 jun 2026 — commit `18a10a9`*  
*Para dúvidas sobre sessões anteriores: ver histórico de commits no git.*
