# CybersecFEST — Changelog dos Agentes

## [cyberseccast-brand-v1] — 2026-06-26 — commit `4475803`

### Adicionado
- **Brand Profile System** — infraestrutura multi-marca isolada em `_brands/`
- **`_brands/cyberseccast/brand.js`** — design tokens do podcast: `#07060f` bg, `#6366f1` indigo accent, `Inter Bold` / `Space Mono`, logo-cast.png
- **`_brands/cyberseccast/imagem-prompt.js`** — `buildCastImagePrompt()` com `CAST_INDIGO_STYLE` (indigo/violet em vez de cyan); cenas de estúdio de podcast, entrevistas executivas
- **`_brands/cyberseccast/reference-images.js`** — loader de imagens de referência do site CYBERSEC.CAST (`assets/referencias-cast/`)
- **`_brands/cyberseccast/temas.json`** — banco editorial do podcast: posicionamento, temas grade, ângulos recorrentes
- **`_scripts/utils/brand-renderer.js`** — `renderLayoutForBrand(slug, arte, brand)`: pós-processa HTML do `renderLayout()` CybersecFEST trocando cores/fontes/logo por tokens da nova marca sem modificar `layouts.js`
- **`artes-cast.json`** — banco de artes CAST isolado (prefixo `cast-` previne colisão com slugs CybersecFEST)
- **`assets/logo-cast.png`** + **`assets/referencias-cast/`** — logo e 4 imagens de referência copiadas do site CYBERSEC.CAST
- **`cast/index.html`** — galeria dedicada CAST (indigo UI, Inter/Space Mono): criar arte, editor, mudar imagem, versionamento de imagens, deletar
- **8 novas rotas** em `dev-server.js` (puramente aditivo — zero modificações em handlers existentes):
  - `GET /api/cast/artes`
  - `POST /api/cast/arte/criar` — gera arte com `buildCastImagePrompt` + `renderLayoutForBrand`
  - `POST /api/cast/arte/salvar`
  - `POST /api/cast/arte/deletar`
  - `POST /api/cast/arte/imagem/mudar`
  - `GET /api/cast/arte/imagem/versoes`
  - `POST /api/cast/arte/imagem/versao/ativar`
  - `POST /api/cast/arte/imagem/versao/deletar`
  - `GET /api/cast/status`

### Arquitetura
- Token replacement no nível HTML: `rgba(20,168,244,` → `rgba(99,102,241,`, `#14A8F4` → `#6366f1`, `#02050A` → `#07060f`, `Ubuntu` → `Inter`, `Montserrat` → `Space Mono`, logo swap via base64
- `removeEcoLogos()`: remove bloco `id="el-eco"` (logos DevOps/IAM/Alcatraz são CybersecFEST only)
- Layout rules A–Q são compartilhadas — apenas cenas e estilo de imagem mudam por marca
- CybersecFEST fica 100% intocado: `artes.json`, `temas.json`, `index.html`, handlers `/api/*` inalterados

---

## [mudar-imagem-v1] — 2026-06-26 — commit `18a10a9`

### Adicionado
- **Sistema de versões de imagem** (`img-versoes/`): salva a imagem original antes de sobrescrever, permite ativar versões anteriores e deletar versões não ativas
- **Pills de versão no modal**: aparecem abaixo do campo "Mudar Imagem" após a primeira geração; clique ativa a versão, `×` deleta
- **Rotas novas**: `GET /api/arte/imagem/versoes`, `POST /api/arte/imagem/versao/ativar`, `POST /api/arte/imagem/versao/deletar`
- **`userScene` em `buildImagePrompt`**: permite injetar instrução do usuário como SCENE mantendo todas as regras de layout, composição e identidade visual intactas
- **`LAYOUT_BG_POS`**: mapa de posição de fundo padrão por layout (C=direita, B=esquerda, O=baixo, etc.) aplicado automaticamente ao trocar imagem

### Corrigido
- `background-size: cover` como padrão no editor inline (era `110%` fixo, cortava o sujeito quando a imagem tinha proporção diferente do canvas)
- Posição de fundo correta por layout ao gerar/restaurar imagem (`resetBgPos: true` em `buildArteHtml`)
- Extração de imagem original do base64 em `arte.html` (`#art-bg`) quando `fundo.png` não existe — salvo como `v1 — Original`
- Prompt de "Mudar Imagem" com `useReferences: false` — as referências de estilo copiavam composições (ex: homem de costas) sobrepondo a instrução do usuário
- Nome do modelo Gemini: `gemini-3.1-flash-image` → `gemini-3.1-flash-image-preview`
- Config do SDK `@google/genai`: `responseFormat.image` → `imageConfig` (campo correto para `aspectRatio`)
- `generateImage` agora lança erro real com mensagens de Gemini + DALL-E quando todos os geradores falham (antes retornava `TRANSPARENT_PNG` silenciosamente)
- Fix race condition em `motion-versoes.js`: `readVersions` retorna `null` para `versions.json` vazio (não lança exceção)
- `gerarNovaVersao` mantém estrutura em memória antes de escrever no disco (evitava `versions.json` inválido)
- Per-slug `motionPending` Set para evitar pedidos de motion duplicados

### Alterado
- Card overlay: botões removidos da grade (Legenda, Editar, PNG, Deletar agora só no modal)
- Motion UI: scripts, tabs e barra de versões comentados em `index.html` com `<!-- MOTION EM STANDBY -->` (código preservado, pipeline backend funcional)
- `DEFAULT_STATE.z`: `110` → `100` (cover) no editor inline
- Slider "Zoom" no editor: ao mínimo (100) exibe "cover" e aplica `background-size: cover`

---

## [gallery-fix] — 2026-06-21 — Galeria (index.html)
### Corrigido
- thumb.png diagnosticado: contém só o fundo da IA (sem texto/overlay)
- Adicionado suporte a modo embed em todos os arte.html:
  - ?embed na URL esconde #topbar e .ep via classe CSS 'embed' no <html>
  - CSS inline: .embed #topbar, .embed .ep {display:none}, #ca sem padding
  - Script inline no <head> detecta URL e aplica classe antes do render
- index.html: iframes criados programaticamente (onload ANTES do src)
  - Sem loading=lazy para garantir disparo do evento
  - scaleCardFrame() escala iframe 540px→largura do card
  - Modal também usa iframe?embed com scaleModalArt() no onload
### Pendente
- Gerador de Artes: corrigir geração de thumb.png para capturar .art-canvas
  completo via dom-to-image (fundo + overlay + texto + logos)

## [2.6.0] — 2026-06-21 — Gerador de Artes (Editor Visual)
### Adicionado
- Editor Visual embutido em todos os arte.html gerados
  - 10 controles em tempo real: pos X/Y da imagem, zoom, opacidade da imagem,
    espelhar horizontal, opacidade do overlay, cor de fundo (picker+hex),
    estilo do overlay (5 opcoes), peso da fonte, alinhamento do texto
  - Painel lateral 260px dark UI com secoes por grupo
  - Oculto no print via @media print
  - Botoes: Resetar tudo | Exportar / PDF
- Estrutura CSS-layered obrigatoria: img.art-bg + div.art-overlay + div.art-content
- Fetch fresco obrigatorio nos PASSOs 6 e 7 antes de qualquer escrita
- Commit assinado [SuperAgent] em todos os uploads


## [1.0.0] — 2026-06-21 — Guardian (NOVO)
### Adicionado
- Agente Guardian criado do zero (id: 5843f2bd)
- Agendado diariamente às 07h BRT (1h antes do Orquestrador)
- Verificação de integridade: artes.json, temas.json, index.html, AGENTS.md
- Auditoria de commits: classifica SuperAgent vs agentes externos vs manuais
- Backup INTEGRAL do repo primário em betoyes/cybersecfest-backup (privado)
  - Estratégia por SHA: só envia arquivos novos ou modificados
  - Cria repo de backup automaticamente se não existir
- Relatório de saúde 🟢/🟡/🔴 a cada execução
- Log histórico persistido em _guardian/health-log.json (últimas 30 execuções)

## [2.5.0] — 2026-06-21 — Gerador de Artes
### Adicionado
- Protocolo Multi-Agente: fetch fresco obrigatório nos PASSOs 6 e 7
- Commits assinados com prefixo [SuperAgent]
- PASSO -1 exibe últimos 5 commits do repo (detecta agentes externos)
- AGENTS.md publicado no repo com protocolo completo

## [2.4.0] — 2026-06-21 — Gerador de Artes
### Adicionado
- Variação A/B de legenda (FOMO vs aspiracional) com pausa antes do upload
- Campo legenda_variante em artes.json
- Botão toggle Legenda no modal da galeria

## [1.5.2] — 2026-06-21 — Pipeline Orquestrador
### Adicionado
- Preview ao vivo (card visual markdown + painel unificado de decisão)

## [1.5.1] — 2026-06-21 — Pipeline Orquestrador
### Adicionado
- Histórico de aprovações (temas.json v3.1.0 com historico_aprovacoes[])

## [1.5.0] — 2026-06-21 — Pipeline Orquestrador
### Adicionado
- Filtro anti-repetição (Mapa de Bloqueio PASSO 1, consulta PASSO 4)

## [2.3.0] — 2026-06-21 — Gerador de Artes
### Adicionado
- Layout N (Acento Diagonal)
- Logos ecossistema padronizados em height 33px

---

## Stack Atual

| Agente | ID | Versão | Agendamento |
|--------|-----|--------|------------|
| Guardian | 5843f2bd | v1.0.0 | Diário 07h BRT |
| Gerador de Artes | 3ae0829d | v2.5.0 | Sob demanda (via Orquestrador) |
| Pipeline Orquestrador | 86597381 | v1.5.2 | Seg/Qua/Sex 08h BRT |
| Campaign Planner | e4b59707 | v1.0.0 | Sob demanda |

## Infraestrutura

| Item | Detalhe |
|------|---------|
| Repo primário | betoyes/cybersecfest (público, Vercel deploy) |
| Repo backup | betoyes/cybersecfest-backup (privado, Guardian) |
| Protocolo multi-agente | AGENTS.md na raiz do repo primário |
| Schedule IDs | Guardian: fd0b7248 \| Orquestrador: 92a1dbf6 |
