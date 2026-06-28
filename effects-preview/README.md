# CybersecFEST — Motion Library v2 (Preview Lab)

> Versão do catálogo: `20260627b`

Vitrine local isolada para visualizar, comparar e aprovar efeitos de motion **antes** de incorporá-los ao AnimAgent.

## Como abrir

```bash
cd _scripts && npm run dev
# http://127.0.0.1:8765/effects-preview/?v=20260627a
```

## Motion Library v2

- **134 efeitos** ativos com preview GSAP funcional
- **31 combos** prontos (v1 + v2 + social impact + SVG motion + depth/focus)
- Nova categoria **Impacto Social / CapCut-inspired** — linguagem de edição social reinterpretada com identidade premium CybersecFEST
- Nova categoria **Anime.js-inspired / SVG Motion** — motion paths, morph, stagger e spring implementados em GSAP puro
- Efeitos aprovados ficam em seção fechada; reprovados ocultos por padrão

### Paleta obrigatória

| Token | Valor |
|-------|-------|
| Fundo | `#02050A` |
| Branco | `#F6F8FF` |
| Azul | `#14A8F4` |

## Impacto Social / CapCut-inspired

Efeitos inspirados em transições dinâmicas de vídeo social, **sem** copiar templates do CapCut, estética TikTok genérica ou filtros aleatórios.

| ID | Uso sugerido | Intensidade |
|----|--------------|-------------|
| `vhs-signal-cut` | Abertura / impact frame (máx. 2×) | Alta |
| `pixel-dissolve-reveal` | Revelação logo / headline | Alta |
| `screen-shake-hit` | Palavra-chave / flash / CTA (máx. 2×) | Alta |
| `mosaic-slice-transition` | Abertura de imagem ou mudança de fase | Alta |
| `paper-tear-tech` | Revelação headline / CTA | Alta |
| `button-slide-unlock` | CTA com sensação de unlock | Alta |
| `pulse-beat` | Logo, CTA, nó ou palavra | Média |
| `curved-text-orbit` | Detalhe HUD (não competir com headline) | Baixa |
| `water-ripple-signal` | Nó, logo ou CTA (máx. 2 ondas) | Média |
| `flag-wave-data` | Transição de energia em overlay/malha | Média |
| `flip-panel-reveal` | Revelação headline / subtítulo / CTA | Alta |
| `static-interference` | Corte de impacto (máx. 0,15s) | Alta |

### Regras de uso

1. Efeitos de glitch (`vhs-signal-cut`, `static-interference`) são **cortes curtos** — nunca em loop.
2. `screen-shake-hit` — deslocamento máximo ~4px; nunca contínuo.
3. `curved-text-orbit` — rotação parcial, texto fictício HUD apenas.
4. Combinar no máximo **um** efeito de slice/tear por animação.
5. Headline e CTA devem permanecer legíveis após qualquer efeito.

### Evitar combinar na mesma animação

- `vhs-signal-cut` + `static-interference` + qualquer outro glitch no mesmo frame
- `screen-shake-hit` em mais de dois momentos
- `paper-tear-tech` + `pixel-dissolve-reveal` + `mosaic-slice-transition` ao mesmo tempo

### Combos que combinam bem

- **Social Cyber Impact** — blackout + VHS + slam + shake + malha + pixel logo + unlock
- **Network Pulse** — sweep + cidade + ripple + órbita HUD + rota + CTA sinal
- **Fragmented Launch** — static + rasgo + fragmentos + escudo + flip + CTA energia

## Combos v2 + Social

| Combo | Perfil |
|-------|--------|
| Social Cyber Impact | Impacto social-cyber agressivo |
| Digital Access | Boot, slices, HUD lock, grid laser, unlock |
| Network Pulse | Ripple, órbita HUD, malha cidade, sinal |
| Fragmented Launch | Static, rasgo tech, fragmentos, flip panel |
| Cyber Breach | Segurança agressiva — fragmentos + escudo |
| AI Network | IA e dados — grid + neural |
| Executive Signal | Premium — portal + rota de sinal |

### Notas dos combos Digital Access

O combo original citava `signal-boot`, `logo-scan-entry`, `mesh-command-grid` e `cta-shine` — substituídos por equivalentes do catálogo ativo: `grid-power-on`, `logo-hud-lock`, `mesh-laser-grid` e `cta-press-pulse`.

## Regra de composição

Cada animação deve usar: 1 abertura · 1 background · 1 headline · 1 malha · 1 logo · 1 CTA · até 2 acabamentos · opcional social impact. O builder reflete essas camadas.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `effects-data.js` | Catálogo, categorias, combos, versão |
| `effects-v2-impl.js` | GSAP — efeitos v2 prioritários |
| `effects-v2-rest.js` | GSAP — demais efeitos + finish |
| `effects-social-impact.js` | GSAP — 12 efeitos Impacto Social |
| `effects-svg-motion.js` | GSAP — 10 efeitos Anime.js-inspired / SVG Motion |
| `app.js` | Orquestração, abas, builder, aprovação, export |
| `styles.css` | Camadas visuais + UI |

## Anime.js-inspired / SVG Motion

Efeitos inspirados nas capacidades do Anime.js — principalmente motion paths, morphing, stagger e spring — implementados em **GSAP puro**, sem dependências adicionais, compatíveis com HyperFrames.

### Por que GSAP e não Anime.js?

O stack do projeto usa GSAP + HyperFrames como motor oficial. Os efeitos desta categoria foram desenvolvidos como "reinterpretação GSAP" das linguagens de animação que o Anime.js popularizou, mantendo compatibilidade total com o sistema existente.

### Efeitos e melhores usos

| ID | Melhor para | Intensidade |
|----|------------|-------------|
| `svg-line-draw` | Malha, HUD, circuitos | Média |
| `path-signal-runner` | Sinal percorrendo rede | Alta |
| `mesh-morph` | Transição entre fases | Alta |
| `grid-stagger-wave` | Abertura de sistema, fundo | Média |
| `node-field-pulse` | Redes, IA, comunidade | Média |
| `shape-morph-reveal` | Revelação de headline, CTA | Alta |
| `orbit-system` | Logos, IA, nó principal | Média |
| `spring-pop` | CTA, logo, palavra-chave | Média |
| `split-text-stagger` | Headlines, títulos | Média |
| `scan-draw` | Ativação progressiva de elementos | Média |

### Fallbacks técnicos

| Recurso | Plugin oficial | Implementação neste projeto |
|---------|---------------|----------------------------|
| Motion Path | `MotionPathPlugin` (GSAP Club) | `getPointAtLength()` via `SVGPathElement` |
| SVG Morph | `MorphSVGPlugin` (GSAP Club) | Animação coordenada de nós/grupos SVG |
| Split Text | `SplitText` (GSAP Club) | Animação por `clip-path` e `y` em linhas |

### Variantes disponíveis via opts

```js
// Grid Stagger Wave — modo de onda
Effects['grid-stagger-wave'](tl, at, { waveMode: 'ltr' });      // esq → dir
Effects['grid-stagger-wave'](tl, at, { waveMode: 'center' });   // centro → fora
Effects['grid-stagger-wave'](tl, at, { waveMode: 'diagonal' }); // diagonal

// Spring Pop — intensidade
Effects['spring-pop'](tl, at, { springMode: 'soft' });
Effects['spring-pop'](tl, at, { springMode: 'medium' });
Effects['spring-pop'](tl, at, { springMode: 'punch' });

// Split Text Stagger — modo
Effects['split-text-stagger'](tl, at, { splitMode: 'line' });   // padrão
Effects['split-text-stagger'](tl, at, { splitMode: 'word' });
Effects['split-text-stagger'](tl, at, { splitMode: 'char' });
```

### Regras de uso

1. Usar no máximo **um** efeito de morphing (`mesh-morph`, `shape-morph-reveal`) por composição.
2. Não combinar `mesh-morph` com `paper-tear-tech` ou `pixel-dissolve-reveal` no mesmo momento.
3. `node-field-pulse` cria e remove elementos SVG dinamicamente — não sobrepor com outros efeitos de SVG simultâneos.
4. `scan-draw` não deve preceder `blackout-strike` — o scan pressupõe elementos já visíveis.
5. Todos os efeitos SVG terminam com cleanup automático via `tl.call(() => el.remove())`.

### Combos SVG Motion

| Combo | Perfil |
|-------|--------|
| SVG Network Reveal | Técnico e premium — rede, runner, split-text |
| Neural Executive | IA e inovação — morph, nós, órbita |
| Launch Geometry | Lançamento geométrico — stagger, morph reveal |
| Signal Command | Cyber comando — scan, runner, split, spring CTA |

## Exportação

Aprovações ficam em `localStorage` (`cybersecfest-effects-approvals-v2`). O botão **Exportar catálogo aprovado** gera `effects-catalog-approved.json` com efeitos e combos aprovados.

---

## Depth, Blur, Focus & Lens Effects — v20260627c

Categoria `depth-focus` — 30 efeitos + 5 combos exclusivos.

Motor: GSAP + CSS filters. **Anime.js apenas como referência de comportamento visual**, nunca como engine.

### Princípios desta categoria

| Tipo de blur | Quando usar |
|---|---|
| **Blur de profundidade** | background desfocado enquanto foreground permanece nítido |
| **Blur de movimento** | entrada/saída com velocidade — momentâneo, sempre resolve |
| **Blur de transição** | separador entre fases — duração < 0.3s |
| **Glass blur** | `backdrop-filter` em painéis e CTAs elegantes |

> **Regra de ouro:** nunca manter blur em headline ou CTA por mais de 0.25s. Blur guia o olhar — não é decoração.

---

### Efeitos implementados (30)

| ID | Label | Categoria interna | Duração | Intensidade |
|---|---|---|---|---|
| `focus-pull` | Focus Pull | depth-focus | 0.6s–1.5s | medium |
| `blur-resolve` | Blur Resolve | depth-focus | 0.35s–0.9s | medium |
| `motion-blur-swipe` | Motion Blur Swipe | depth-focus | 0.3s–0.7s | medium |
| `radial-focus-lock` | Radial Focus Lock | depth-focus | 0.5s–1.2s | soft |
| `blur-flash-hit` | Blur Flash Hit | depth-focus | 0.08s–0.18s | high |
| `zoom-blur-punch` | Zoom Blur Punch | depth-focus | 0.15s–0.45s | high |
| `edge-softness` | Edge Softness | depth-focus | contínua | soft |
| `background-defocus-reveal` | Background Defocus Reveal | depth-focus | 0.5s–1.4s | medium |
| `scan-focus-reveal` | Scan Focus Reveal | depth-focus | 0.5s–1.5s | medium |
| `bokeh-pulse` | Bokeh Pulse | depth-focus | 1s–3s | soft |
| `glass-blur-panel` | Glass Blur Panel | depth-focus | 0.3s–0.8s | soft |
| `signal-stabilize` | Signal Stabilize | depth-focus | 0.35s–1.1s | medium |
| `chromatic-focus-shift` | Chromatic Focus Shift | depth-focus | 0.08s–0.25s | soft |
| `focus-breath` | Focus Breath | depth-focus | 0.5s–1.2s | soft |
| `camera-dolly-in` | Camera Dolly In | depth-focus | 1.5s–5s | medium |
| `camera-dolly-out` | Camera Dolly Out | depth-focus | 1s–3s | medium |
| `tilt-shift-depth` | Tilt-Shift Depth | depth-focus | 0.5s–1s | soft |
| `mask-blur-reveal` | Mask Blur Reveal | depth-focus | 0.4s–1.2s | medium |
| `frosted-glass-wipe` | Frosted Glass Wipe | depth-focus | 0.4s–1s | soft |
| `focus-snap` | Focus Snap | depth-focus | 0.12s–0.3s | high |
| `depth-fog-roll` | Depth Fog Roll | depth-focus | 1s–4s | soft |
| `lens-flare-focus` | Lens Flare Focus | depth-focus | 0.25s–0.8s | soft |
| `aperture-open` | Aperture Open | depth-focus | 0.4s–1.2s | medium |
| `headline-focus-stack` | Headline Focus Stack | depth-focus | 1s–2.5s | medium |
| `cta-focus-lock` | CTA Focus Lock | depth-focus | 0.4s–1s | medium |
| `logo-lens-reveal` | Logo Lens Reveal | depth-focus | 0.4s–1s | soft |
| `micro-defocus-shock` | Micro Defocus Shock | depth-focus | 0.08s–0.18s | high |
| `optic-scan-focus` | Optic Scan Focus | depth-focus | 0.6s–1.8s | medium |
| `soft-focus-glow` | Soft Focus Glow | depth-focus | 0.4s–1.1s | soft |
| `whip-pan-blur` | Whip Pan Blur | depth-focus | 0.15s–0.35s | high |

### Efeitos não implementados individualmente (composições)

Os efeitos abaixo foram documentados mas implementados como composições de efeitos existentes:

| Efeito solicitado | Implementação equivalente |
|---|---|
| `depth-blur-parallax` | `camera-dolly-in` + `radial-focus-lock` + `edge-softness` |
| `lens-rack-focus` | sequência: `focus-pull` → `blur-resolve` → `cta-focus-lock` |
| `foreground-defocus-pass` | `depth-fog-roll` com opacidade aumentada |
| `velocity-smear` | `motion-blur-swipe` com `intensity: impact` |
| `screen-depth-rack` | `camera-dolly-in` + `headline-focus-stack` + `cta-focus-lock` |
| `background-soft-zoom` | `camera-dolly-in` com `intensity: soft` |
| `aperture-close-transition` | `aperture-open` executado em reverso via `tl.reverse()` |
| `depth-shadow-shift` | **já existe no catálogo principal** (category: `finish`) |

---

### Combos da categoria (5)

| ID | Label | Perfil |
|---|---|---|
| `focus-command` | Focus Command | cyber, técnico, premium, comando central |
| `cinematic-event` | Cinematic Event | evento, cidade, campanha institucional |
| `impact-launch` | Impact Launch | lançamento, inscrição, alto impacto |
| `executive-glass` | Executive Glass | patrocinador, executivo, premium, elegante |
| `neural-focus` | Neural Focus | IA, automação, inovação, dados |

---

### Tabela de recomendação por conteúdo

| Contexto | Efeitos recomendados |
|---|---|
| **Cidade / Skyline** | `background-defocus-reveal`, `camera-dolly-in`, `tilt-shift-depth`, `edge-softness`, `depth-fog-roll` |
| **Foto de pessoa** | `focus-pull`, `radial-focus-lock`, `bokeh-pulse`, `logo-lens-reveal` |
| **Patrocinador** | `glass-blur-panel`, `logo-lens-reveal`, `frosted-glass-wipe`, `soft-focus-glow` |
| **Campanha agressiva** | `zoom-blur-punch`, `blur-flash-hit`, `micro-defocus-shock`, `whip-pan-blur` |
| **IA / Inovação** | `signal-stabilize`, `optic-scan-focus`, `chromatic-focus-shift`, `headline-focus-stack` |
| **Premium / Institucional** | `focus-pull`, `edge-softness`, `glass-blur-panel`, `camera-dolly-in`, `aperture-open` |

---

### Combinações aprovadas

- `signal-stabilize` + `optic-scan-focus` + `cta-focus-lock`
- `focus-pull` + `glass-blur-panel` + `frosted-glass-wipe`
- `background-defocus-reveal` + `camera-dolly-in` + `edge-softness`
- `bokeh-pulse` + `radial-focus-lock` + `logo-lens-reveal`
- `zoom-blur-punch` + `blur-flash-hit` (em fases separadas)

### Combinações proibidas

- `whip-pan-blur` + `zoom-blur-punch` + `motion-blur-swipe` (blur acumulado)
- `signal-stabilize` + qualquer glitch pesado (`static-interference`, `vhs-signal-cut`)
- `bokeh-pulse` + `depth-fog-roll` em intensidade alta (excesso de profundidade)
- `glass-blur-panel` cobrindo headline principal
- `headline-focus-stack` com texto muito longo ou fonte pequena

---

### Notas técnicas e fallbacks

**`backdrop-filter`:** Suportado na maioria dos navegadores modernos. Para `Firefox ESR` e ambientes sem suporte, os efeitos `glass-blur-panel`, `frosted-glass-wipe`, `tilt-shift-depth` e `edge-softness` incluem fallback com fundo semiopaco via `@supports not (backdrop-filter: blur(1px))` no CSS.

**Bokeh:** Gerado via DOM (`initBokeh()`) com círculos absolutos + `filter: blur()`. Limite de 8 dots por performance.

**Aperture:** SVG inline gerado via `initAperture()`. Polígono hexagonal expandido com `gsap.to(attr.points)`.

**Optic Scan Brackets:** DOM gerado via `initOpticBrackets()`. Quatro cantos + scanline horizontal.

**Limitações de performance:**
- Não usar mais de 2 efeitos de blur alto simultâneos na mesma composição
- Em mobile/baixa performance, `backdrop-filter` pode causar jank — usar CSS fallback
- `tilt-shift-depth` com `backdrop-filter: blur()` é custoso em telas grandes; considerar substituir pelo gradiente CSS simples

---

### Arquivos

| Arquivo | Descrição |
|---|---|
| `effects-depth-focus.js` | 30 efeitos Depth/Blur/Focus/Lens + helpers + reset |
| `effects-data.js` | catálogo: 134 efeitos, 31 combos — v`20260627c` |
| `styles.css` | layers `.fx-radial-focus`, `.fx-bokeh-*`, `.fx-glass-panel`, `.fx-tilt-shift-*`, `.fx-frosted-wipe-strip`, `.fx-lens-flare`, `.fx-aperture-ring`, `.fx-optic-brackets` |
| `index.html` | 10 novas layers no `#fx-scene`; script `effects-depth-focus.js` |
| `app.js` | slot `depth` no builder + combo slot + tab `is-depth` |

---

## Animated Meshes, Patterns & Depth — v20260627d

Categoria `animated-mesh-depth` — 20 malhas principais + 10 enhancers + 7 combos.

Motor: GSAP + SVG gerado dinamicamente por JS. `backdrop-filter` não é dependência central.

### Regra de uso

> **Nunca combinar duas malhas principais na mesma composição.**
> Uma malha principal pode receber no máximo 2 enhancers e 1 efeito de sinal.

---

### 20 Malhas Principais

| ID | Label | Perfil |
|---|---|---|
| `constellation-field-depth` | Constellation Field Depth | networking, ecossistema |
| `neural-network-flow-depth` | Neural Network Flow Depth | IA, dados, inovação |
| `command-grid-depth` | Command Grid Depth | SOC, cyber, infraestrutura |
| `laser-grid-perspective-depth` | Laser Grid Perspective | lançamento, keynote, impacto |
| `circuit-board-map-depth` | Circuit Board Map Depth | tecnologia, engenharia |
| `hex-shield-field-depth` | Hex Shield Field Depth | segurança, proteção, compliance |
| `radar-sweep-field-depth` | Radar Sweep Field Depth | threat intel, SOC, monitoramento |
| `topographic-lines-depth` | Topographic Lines Depth | cidade, estratégia, editorial |
| `data-rain-columns-depth` | Data Rain Columns Depth | logs, observabilidade, dados |
| `wave-particle-field-depth` | Wave Particle Field Depth | inovação, comunidade, premium |
| `city-link-map-depth` | City Link Map Depth | eventos, cidades, roadshows |
| `polygon-fracture-depth` | Polygon Fracture Depth | campanha agressiva, lançamento |
| `orbital-hud-system-depth` | Orbital HUD System Depth | keynote, IA, liderança |
| `firewall-wall-depth` | Firewall Wall Depth | cyber defense, firewall |
| `digital-fabric-depth` | Digital Fabric Depth | institucional, executivo, patrocinadores |
| `mesh-ripple-reactive` | Mesh Ripple Reactive | impacto, ativação, CTA |
| `signal-route-depth` | Signal Route Depth | CTA, jornada visual, inscrição |
| `node-chain-reaction-depth` | Node Chain Reaction Depth | ecossistema, rede, IA |
| `depth-fabric-parallax` | Depth Fabric Parallax | base premium contínua |
| `hud-corners-pattern-depth` | HUD Corners Pattern Depth | reforço técnico, cyber |

### 10 Enhancers

| ID | Função |
|---|---|
| `mesh-focus-pull` | Background desfocado → foco |
| `mesh-blur-resolve` | Blur da malha → nitidez |
| `mesh-depth-parallax` | Camadas em velocidades diferentes |
| `mesh-soft-glow` | Glow azul nos nós/logo |
| `mesh-scan-activation` | Scanline ativa segmentos |
| `mesh-bokeh-back` | Bokeh azul atrás da malha |
| `mesh-edge-softness` | Blur nas bordas do pattern |
| `mesh-camera-dolly` | Zoom progressivo suave |
| `mesh-rack-focus` | Troca de foco bg→mesh→CTA |
| `mesh-pulse-wave` | Onda de pulso na estrutura |

### 7 Combos Prontos

| ID | Label | Perfil |
|---|---|---|
| `connected-city-premium` | Connected City Premium | evento, cidade, networking |
| `neural-executive` | Neural Executive | IA, dados, executivo |
| `defense-protocol` | Defense Protocol | segurança, SOC, defesa |
| `launch-grid-impact` | Launch Grid Impact | alto impacto, lançamento |
| `executive-fabric` | Executive Fabric | institucional, patrocinador |
| `radar-intelligence` | Radar Intelligence | threat intel, SOC |
| `constellation-community` | Constellation Community | comunidade, ecossistema |

---

### Tabela de recomendação

| Contexto | Malhas recomendadas |
|---|---|
| **Cidade / Skyline** | `city-link-map-depth`, `topographic-lines-depth`, `constellation-field-depth`, `mesh-depth-parallax` |
| **Foto de pessoa** | `digital-fabric-depth`, `orbital-hud-system-depth`, `command-grid-depth`, `mesh-focus-pull` |
| **IA / Automação** | `neural-network-flow-depth`, `node-chain-reaction-depth`, `signal-route-depth`, `mesh-soft-glow` |
| **Segurança / SOC** | `firewall-wall-depth`, `radar-sweep-field-depth`, `command-grid-depth`, `circuit-board-map-depth` |
| **Patrocinador** | `digital-fabric-depth`, `topographic-lines-depth`, `hud-corners-pattern-depth`, `mesh-edge-softness` |
| **Campanha agressiva** | `laser-grid-perspective-depth`, `polygon-fracture-depth`, `mesh-ripple-reactive`, `signal-route-depth` |

---

### Arquivos

| Arquivo | Descrição |
|---|---|
| `effects-animated-mesh.js` | 20 malhas + 10 enhancers + init SVG dinâmico |
| `effects-data.js` | catálogo: 134 efeitos, 31 combos — v`20260627d` |
| `styles.css` | 20 camadas `.fx-amd` + todos os estilos SVG das malhas |
| `index.html` | 20 layers `#fx-*` + script `effects-animated-mesh.js` |
| `app.js` | slot `amdmesh` + tab `is-mesh` + versão `20260627d` |
