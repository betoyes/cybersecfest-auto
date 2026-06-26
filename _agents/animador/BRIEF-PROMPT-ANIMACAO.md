# Brief — Prompt de animação para o Cursor (AnimAgent)

Este documento explica **o que estamos construindo** no CybersecFEST e **para que serve** o prompt que outra IA deve gerar. Use-o como contexto ao pedir a uma IA externa (ChatGPT, Claude web, CREAO, etc.) que **crie o conceito criativo da animação** e **escreva instruções executáveis** para o agente no Cursor implementar.

---

## O que estamos fazendo

O CybersecFEST é uma galeria de posts para redes sociais. Cada post tem:

| Camada | Onde fica | Quem cuida |
|--------|-----------|------------|
| **Arte estática** | `artes/{slug}/arte.html` + `fundo.png` | SuperAgent |
| **Arte animada (motion)** | `artes/{slug}/motion/` | AnimAgent / Cursor |
| **Galeria pública** | `index.html` (Vercel) | SuperAgent (PR) |

Fluxo atual na UI:

1. Post já existe como imagem/HTML estático.
2. Na galeria local (`http://127.0.0.1:8765/`), aba **Motion** → **+ Nova versão**.
3. O usuário escolhe preset ou descreve ajustes.
4. Um motor automático gera versões simples (`v2/`, `v3/`…) — **mas são parecidas entre si**.
5. Para animações **realmente diferentes e premium**, precisamos de **brief criativo + implementação manual** no Cursor.

**Sandbox único (jun/2026):** motion só no post **`evento-1782143777641`** (post #10, Layout E, BH).  
Preset atual: `signal-mesh-10s` · 10s. Demais cards ficam estáticos até validar o fluxo.

Arquivo: `artes/evento-1782143777641/motion/index.html`  
Constante compartilhada: `assets/js/motion-sandbox.js` e `_scripts/utils/motion-sandbox.js`

---

## Para que serve o prompt que a outra IA vai criar

A IA externa **não escreve código no repositório**. Ela produz um **documento de briefing** que o usuário cola no Cursor. Esse briefing deve:

1. **Descrever a animação** como um diretor de motion (ritmo, entradas, clima, diferencial visual).
2. **Especificar o preset** (nome novo ou evolução de um existente).
3. **Listar o que o Cursor deve fazer** passo a passo (arquivos, timeline, duração, validação).
4. **Deixar claro o slug**, versão alvo (`v2`, `v3`…) e o que **não** pode ser alterado.

O Cursor (AnimAgent local) lê esse prompt e **implementa** o HTML HyperFrames + GSAP, registra em `versions.json` e valida com `hyperframes lint`.

---

## O que pedir à IA externa (copie e cole)

```
Você é diretor de motion design para o CybersecFEST — evento premium de cybersegurança no Brasil.

CONTEXTO DO PROJETO:
- Cada post tem arte estática em artes/{slug}/arte.html (NÃO alterar).
- A animação vive em artes/{slug}/motion/v{N}/index.html (HyperFrames + GSAP).
- Canvas padrão: 1080×1350 px, feed vertical Instagram.
- Paleta: fundo #02050A, texto #F6F8FF, destaque #14A8F4.
- Fontes locais: Ubuntu Bold (headline), Montserrat (corpo) — sem Google Fonts CDN.
- Referência premium: preset "confraria-signal" (HUD, grid, parallax, 9s).

DADOS DO POST (preencha):
- slug: _______________
- headline: _______________
- palavras_azuis: _______________
- subtítulo: _______________
- tipo: patrocinador | blog | evento
- versão alvo: v___ (nova pasta motion/v{N}/)

SUA TAREFA:
Crie um BRIEF DE ANIMAÇÃO completo para outro agente de código (Cursor) implementar.
Não escreva HTML. Escreva instruções claras e executáveis.

O brief DEVE conter estas seções:

## 1. Nome do preset
Ex.: "terminal-glitch-8s" — slug curto, único, em kebab-case.

## 2. Conceito criativo (3–5 frases)
O que torna esta animação DIFERENTE das genéricas (entrada stagger / swipe / HUD leve)?

## 3. Storyboard por fases (com tempos em segundos)
Ex.:
- 0.0–1.2s: fundo escuro, scan line horizontal...
- 1.2–3.0s: headline linha a linha com...
- etc.

## 4. Elementos visuais extras
Liste camadas além do layout base (grid, orb, flash, vignette, grain, cantos HUD, etc.).

## 5. Timeline GSAP (pseudo-código)
Para cada elemento (#bg, #row-1, #cta…): propriedade, from, to, duration, ease, start time.

## 6. Duração total
Entre 6s e 12s. Indique hold final (2–4s com tudo visível).

## 7. Checklist de entrega para o Cursor
- [ ] Criar artes/{slug}/motion/v{N}/index.html
- [ ] Copiar assets (fundo, logos, fonts woff2)
- [ ] package.json + hyperframes.json + design.md
- [ ] npx hyperframes lint (0 erros)
- [ ] Append em motion/versions.json (não apagar versões anteriores)
- [ ] Atualizar animacoes.json se for primeira motion do slug

## 8. O que NÃO fazer
- Não editar arte.html, artes.json, temas.json, index.html
- Sem repeat infinito no GSAP
- Sem fontes externas CDN

Seja específico o suficiente para um dev implementar sem adivinhar. Priorize movimento com personalidade, não só fade-in genérico.
```

---

## Presets que já existem (não repetir sem motivo)

| ID | Label | Auto? | Descrição curta |
|----|-------|-------|-----------------|
| `entrance-premium-6s` | entrada | sim | Ken Burns + headline sobe |
| `kinetic-swipe-7s` | swipe | sim | Entrada lateral + flash |
| `confraria-lite-8s` | hud | sim | HUD leve + orb |
| `confraria-signal` | signal | **manual** | Premium — grid, scan, parallax, shine |

Presets novos devem **justificar** por que não são variação dos acima.

---

## Estrutura de arquivos (para a IA externa citar no brief)

```
artes/{slug}/
  arte.html          ← intocável
  fundo.png
  motion/
    versions.json    ← lista v1, v2, v3…
    index.html       ← v1 legado (dir: ".") ou v1 em subpasta
    v2/
      index.html     ← composição HyperFrames
      design.md      ← notas do preset
      hyperframes.json
      package.json
      assets/
        fundo.png
        logo-cyberfest.png
        logo-devops.webp, logo-iam.webp, logo-alcatraz.webp
        fonts/*.woff2
    pedidos.json     ← fila UI (opcional)
```

Registro em `versions.json` (exemplo):

```json
{
  "id": 2,
  "dir": "v2",
  "preset": "terminal-glitch-8s",
  "duracao_s": 8,
  "note": "Brief IA externa — scan terminal + glitch controlado",
  "mp4": null
}
```

---

## Como o usuário usa o brief no Cursor

1. Gera o brief com a IA externa (usando o bloco acima + dados do post).
2. Abre o repo no Cursor.
3. Cola o brief com uma instrução curta, por exemplo:

   > Implemente este brief de animação para o slug `evento-1782143777641` como `motion/v2/`. Siga `_agents/animador/SKILL.md` e valide com hyperframes lint.

4. O Cursor cria os arquivos, registra a versão e o usuário previewa em `http://127.0.0.1:8765/` → aba Motion.

---

## Contrato técnico HyperFrames (resumo para a IA externa)

- Root: `#root` com `data-composition-id`, `data-duration`, `data-width="1080"`, `data-height="1350"`.
- Cena: `<section class="clip scene" data-start="0" data-duration="…">`.
- Timeline: `gsap.timeline({ paused: true })` → `window.__timelines["preset-id"] = tl`.
- Render: `cd artes/{slug}/motion/v{N} && npm run render` → `preview.mp4`.
- Skills de referência no Cursor: `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`.

---

## Exemplo de saída esperada da IA externa (trecho)

```markdown
## Preset: dossier-reveal-9s

### Conceito
Abertura estilo dossiê classificado: selo CONFIDENCIAL pisca, headline 
revelada por máscara vertical, fundo com pan lento para direita. 
Diferencial: camada de carimbo animado sobre o CTA nos últimos 2s.

### Storyboard
- 0.0–0.8s: fundo brightness 0.4→1, selo scale 0→1
- 0.8–2.4s: rows 1–4 clipPath inset de baixo
- 2.4–3.2s: divider + subtítulo fade
- 3.2–4.0s: CTA back.out
- 4.0–9.0s: hold + carimbo opacity pulse único em t=7.5s

### Timeline GSAP
tl.from('#bg', { scale: 1.15, x: 20, filter: 'brightness(0.5)' }, { scale: 1.05, x: 0, duration: 9, ease: 'none' }, 0);
tl.from('#row-1', { y: '100%', duration: 0.55, ease: 'expo.out' }, 0.9);
…

### Checklist Cursor
- slug: evento-1782143777641 (sandbox — único com motion)
- versão: v2
- preset id: signal-mesh-10s (ou novo preset premium)
- lint obrigatório antes de commit
```

---

## Commits (se o Cursor commitar)

Prefixo: `[AnimAgent] feat: motion {preset-id} — {slug}`

---

## Links úteis no repo

| Arquivo | Conteúdo |
|---------|----------|
| `_agents/animador/SKILL.md` | Procedimento completo AnimAgent |
| `_agents/animador/config.json` | Catálogo de presets |
| `_scripts/utils/motion-presets.js` | Presets automáticos (código) |
| `artes/evento-1782143777641/motion/` | Sandbox motion (único post) |
| `assets/js/motion-sandbox.js` | Slug sandbox no frontend |
| `AGENTS.md` | Protocolo multi-agente |

---

*Documento para handoff IA externa → Cursor. Atualizado jun/2026.*
