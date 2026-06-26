# CybersecFEST — AnimAgent (Motion)

## Goal
Gerar versões **animadas** de artes estáticas já publicadas pelo SuperAgent, exportando **MP4** via HyperFrames, **sem alterar** `arte.html`, `artes.json` ou `temas.json`.

## Princípio
- **Estática** → `artes/{slug}/arte.html` (dono: SuperAgent)
- **Animada** → `artes/{slug}/motion/` (dono: AnimAgent)

## Inputs
- `slug` (string, required): slug da arte em `artes.json`
- `preset` (select, required): `entrance-premium-6s` | *(futuros presets)*
- `formato` (select, optional): `feed_vertical` | `stories` | `feed_quadrado` — default herdado da arte

## Leitura obrigatória (PASSO 0)
1. `AGENTS.md` — protocolo multi-agente
2. `_agents/animador/config.json` — presets e paths
3. `artes.json` — metadados da arte (headline, palavras_azuis, layout, cta_visual)
4. `artes/{slug}/arte.html` — **somente leitura** (referência visual)
5. `artes/{slug}/fundo.png` — reutilizar via cópia em `motion/assets/`

## Procedure

### PASSO 1 — Validar arte estática
- Confirmar que `artes/{slug}/arte.html` e `fundo.png` existem
- Ler `motion/versions.json` e `motion/pedidos/ACTIVE.json` se existir — **nunca apagar versões anteriores**
- Pedido via UI (`POST /api/motion/pedido`) → criar `motion/v{N}/` e append em `versions.json`
- Ao concluir: `pedidos.json` status `done`, remover ou arquivar `ACTIVE.json`

### PASSO 1b — versions.json (obrigatório)
```json
{
  "slug": "<slug>",
  "preview": 2,
  "mp4_from": null,
  "versions": [
    { "id": 1, "dir": "v1", "preset": "...", "duracao_s": 9, "created_at": "...", "note": "..." },
    { "id": 2, "dir": "v2", "preset": "...", "duracao_s": 8, "created_at": "...", "note": "refino headline" }
  ]
}
```
- `dir: "."` = legado (composição na raiz de `motion/`)
- Cada refazer incrementa `id` e cria nova pasta `v{N}/` completa (index.html + assets)
- Atualizar `preview` para a versão recém-criada

### PASSO 2 — Preparar pasta da versão
```
artes/{slug}/motion/
  versions.json    ← lista v1, v2, v3… (append-only nos ids)
  v1/              ← primeira versão (ou "." legado)
    index.html
    design.md
    hyperframes.json
    package.json
    assets/
    preview.mp4    ← só após render desta versão
  v2/              ← nova versão (refazer)
  package.json     ← opcional na raiz para CLI legado
```

**Copiar para `{dir}/assets/` de cada versão:**
- `../fundo.png`
- `assets/logo-cyberfest.png` + logos ecossistema
- Fontes Ubuntu/Montserrat em `assets/fonts/*.woff2` (obrigatório para lint/render offline)

### PASSO 3 — Compor HTML HyperFrames
- Canvas: **1080×1350** (feed vertical 2×) ou conforme `formato`
- `data-composition-id`, `data-start="0"`, `data-width`, `data-height`, `data-duration`
- Clips com `data-start`, `data-duration`, `data-track-index`
- GSAP timeline em `window.__timelines["<id>"]`, `paused: true`
- **Sem** Google Fonts CDN — apenas `@font-face` local
- **Sem** `repeat: -1` — animações determinísticas para render
- Motion principles: Ken Burns no fundo, stagger na headline, CTA com `back.out`, hold de 2–4s

### PASSO 4 — Validar
```bash
cd artes/{slug}/motion
npx hyperframes lint
npx hyperframes inspect
```

Corrigir erros antes de renderizar.

### PASSO 5 — Render MP4 (máxima qualidade)
```bash
npm run render
# equivale a: npx hyperframes render --fps 30 --quality high --output preview.mp4
```

Iteração rápida: `npm run render:draft`

### PASSO 6 — Registrar em animacoes.json (append-only)
```json
{
  "slug": "<slug>",
  "preset": "<preset>",
  "duracao_s": 6.5,
  "formato": "feed_vertical",
  "layout": "C",
  "arte_estatica": "artes/<slug>/arte.html",
  "motion_html": "artes/<slug>/motion/index.html",
  "motion_mp4": "artes/<slug>/motion/preview.mp4",
  "created_at": "<ISO-8601>",
  "agente": "AnimAgent"
}
```

### PASSO 7 — Commit
Prefixo: `[AnimAgent] feat: motion <preset> — <slug>`

## Proibido
- Editar `artes/{slug}/arte.html`
- Alterar `artes.json`, `temas.json`, `index.html` (galeria) sem PR aprovado
- Commitar sem `npx hyperframes lint` limpo

## CLI local
```bash
node _scripts/animar-arte.js --slug blog-1782236441882 --preset entrance-premium-6s
```

## Referências HyperFrames
- Contrato: `hyperframes-core` skill
- CLI: `npx hyperframes doctor | lint | preview | render`
- Motion: Ken Burns, stagger, decoratives com glow/grain
