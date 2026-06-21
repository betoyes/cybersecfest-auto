# CybersecFEST — Gerador de Artes

## Goal
Gerar posts completos para o CybersecFEST: imagem IA + HTML final + legenda executiva aprovada pelo usuário (escolha A/B) + upload automático no GitHub (betoyes/cybersecfest), com rotação inteligente de layouts, score de legenda e validação em duas etapas para rastreabilidade total.

## Inputs
- tipo_post (select, required): blog | evento | palestrante | patrocinador | cidade
- logo_position (select, required): above_headline | top_left
- headline (textarea, required): headline principal do post
- subtitulo (textarea, optional): subtítulo ou linha de apoio
- palavras_azuis (string, optional): palavras da headline para destacar em azul #14A8F4
- nome_palestrante (string, optional): nome completo (palestrante/patrocinador)
- cargo_empresa (string, optional): cargo e empresa
- contexto_visual (textarea, required): descrição da cena/imagem a gerar
- referencias (files, optional): imagens de referência
- formato (select, required): feed_vertical (1080x1350) | feed_quadrado (1080x1080) | linkedin (1200x628)
- cidade (string, optional): cidade do evento em caixa alta
- categoria_patrocinador (string, optional): categoria/cota do patrocinador

## Procedure

### PASSO -1 — Pré-Validação (EXECUTAR ANTES DE QUALQUER COISA)

Antes de iniciar a geração, validar o estado do ecossistema. Se qualquer item falhar, **parar e reportar o erro** — não prosseguir.

**1. Validar temas.json:**
```
GET https://raw.githubusercontent.com/betoyes/cybersecfest/main/temas.json
```
Verificar:
- [ ] HTTP 200 — arquivo acessível
- [ ] JSON válido e parseável
- [ ] Campo `rotacao_layouts` presente e com chave para `tipo_post` atual
- [ ] Campo `historico_recente` presente (pode ser array vazio)
- [ ] Campo `calendario_editorial` presente

**2. Validar artes.json:**
```
GET https://raw.githubusercontent.com/betoyes/cybersecfest/main/artes.json
```
Verificar:
- [ ] HTTP 200 ou 404 aceitável (primeiro uso)
- [ ] Se existir: JSON válido e array parseável
- [ ] Se existir: nenhum registro duplicado de slug nas últimas 3 entradas

**3. Reportar resultado da pré-validação:**

Se tudo OK:
```
✅ PRÉ-VALIDAÇÃO OK
   temas.json: acessível (N temas, M entradas no histórico)
   artes.json: acessível (N artes registradas)
   Prosseguindo para geração...
```

Se houver erro, parar e exibir:
```
❌ PRÉ-VALIDAÇÃO FALHOU
   Erro: [descrição exata do erro]
   Arquivo: [temas.json | artes.json]
   Detalhe: [HTTP status | campo ausente | JSON inválido]
   Ação necessária: [instrução clara para o usuário corrigir]
```

---

### PASSO 0 — Rotação Inteligente de Layout

Usando os dados já carregados na pré-validação:

**Regras de rotação por tipo_post:**
- blog:        [C, M, N] → ciclo de 3
- evento:      [E, L, J] → ciclo de 3
- palestrante: [D, G, K] → ciclo de 3
- patrocinador:[F, I, B] → ciclo de 3
- cidade:      [A, H, J] → ciclo de 3

**Algoritmo:**
1. Filtrar `historico_recente` pelo `tipo_post` atual
2. Pegar o último layout usado para esse tipo
3. Selecionar o próximo na sequência de rotação
4. Se não houver histórico, usar o primeiro da sequência
5. Se o usuário especificar layout via override no contexto_visual, respeitar o override

**Registrar uso:** após publicar, atualizar `historico_recente` em `temas.json`:
```json
{
  "tipo_post": "<tipo>",
  "layout": "<letra>",
  "slug": "<slug-gerado>",
  "data": "<ISO-8601>"
}
```
Manter no máximo os últimos 20 registros.

---

### PASSO 1 — Seleção e Montagem do Layout

**14 layouts disponíveis (A–N):**

| Layout | Nome | Auto-seleção | Foco da Imagem |
|--------|------|-------------|----------------|
| A | Banda Superior | cidade (rotação) | DIREITA |
| B | Mirror Split | patrocinador (rotação) | ESQUERDA |
| C | Subtítulo ao Lado | blog (rotação) | DIREITA |
| D | Diagonal | palestrante (rotação) | CENTRO/DIREITA |
| E | CTA Pill | evento (rotação) | DIREITA |
| F | Coluna Lateral Sólida | patrocinador (rotação) | DIREITA |
| G | Magazine Cover | override | CENTRO |
| H | Rodapé Luminoso | cidade (rotação) | CENTRAL-SUPERIOR |
| I | Coluna Sólida Direita | patrocinador (rotação) | ESQUERDA |
| J | 3 Blocos | evento/cidade (rotação) | CENTRO entre horizontais |
| K | Tríptico | palestrante (rotação) | CENTRO entre verticais |
| L | L Invertido + Traços | evento (rotação) | CENTRO entre zonas |
| M | Pull Quote | blog (rotação) | DIREITA |
| N | Acento Diagonal | blog (rotação) | DIREITA |

**Lei de Foco da Imagem:** A imagem IA deve ser gerada com o sujeito principal na zona de foco do layout, garantindo que o texto não sobreponha o sujeito.

**⚠️ REGRA CRÍTICA DE VARIAÇÃO:** Cada layout (A–N) deve gerar um HTML visualmente distinto — estrutura CSS, posicionamento dos elementos e hierarquia devem ser completamente diferentes entre layouts. Nunca usar o mesmo template HTML para layouts diferentes.

---

### PASSO 2 — Geração da Imagem IA

Construir prompt seguindo o foco do layout:
- Posição do sujeito conforme foco (ex: "subject on the right third")
- Estilo: dark cinematic, fundo #02050A, high contrast
- Resolução: 1080×1350 (feed_vertical) | 1080×1080 (feed_quadrado) | 1200×628 (linkedin)
- Incorporar `contexto_visual`
- Se `referencias` fornecidas, usar como referência de estilo

---

### PASSO 3 — Geração do HTML (arte.html)

**Design system fixo:**
- Fundo: `#02050A` | Azul: `#14A8F4` | Branco: `#F6F8FF` | Lavanda: `#D5D8ED` | Muted: `#94A0B8`
- Headlines: Ubuntu 700 | Subtítulos: Montserrat 400 (nunca itálico)
- Logo CybersecFEST: colorido, **NUNCA** filter CSS
- **Logos ecossistema (devops/iam/alcatraz): `height: 33px` — PADRÃO FIXO, não alterar**

**LAYOUT C — Subtítulo ao Lado**
- Imagem cobre 60% direito da tela (object-position: right)
- Overlay: gradiente horizontal `rgba(2,5,10,0.97) 0% → rgba(2,5,10,0.15) 100%`
- Conteúdo: coluna esquerda, 52% de largura, centralizado verticalmente
- Logo cyberfest: 140px, margin-bottom 28px
- Headline: Ubuntu 700, 32px, line-height 1.18
- Subtítulo: borda esquerda azul 2px, padding-left 12px, Montserrat 400, 13.5px
- Ecosistema: bottom 22px, left 42px, height logos **33px**

**LAYOUT M — Pull Quote**
- Imagem cobre TODA a tela como fundo (object-position: center)
- Overlay: `rgba(2,5,10,0.88)` uniforme + gradiente de baixo pra cima nos últimos 40%
- Conteúdo: posicionado no TERÇO INFERIOR da tela, centralizado horizontalmente, text-align center
- Logo cyberfest: 120px, centrado, margin-bottom 20px
- Headline: Ubuntu 700, 38px, line-height 1.1, centrada, max-width 80%
- Barra azul decorativa: `4px × 48px` cor `#14A8F4`, centrada, acima da headline, margin-bottom 16px
- Subtítulo: Montserrat 400, 14px, cor `#D5D8ED`, centrado, sem borda lateral
- Ecosistema: bottom 22px, centrado (justify-content: center), height logos **33px**

**LAYOUT N — Acento Diagonal**
- Imagem cobre TODA a tela (object-position: top right)
- Overlay: `linear-gradient(160deg, rgba(2,5,10,0.05) 0%, rgba(2,5,10,0.65) 45%, rgba(2,5,10,0.97) 100%)`
- Barra diagonal decorativa: `div` posicionado absolutely, `width: 3px, height: 180px`, cor `#14A8F4`, `top: 40%, left: 36px`, rotacionado `rotate(-15deg)`
- Conteúdo: posicionado no TERÇO INFERIOR ESQUERDO, padding: 0 42px 80px
- Logo cyberfest: 110px, margin-bottom 20px
- Headline: Ubuntu 700, 30px, line-height 1.2, max-width 60%, alinhado à esquerda
- Subtítulo: Montserrat 400, 12.5px, cor `#94A0B8`, margin-top 10px, border-bottom 1px solid `#14A8F4`, padding-bottom 8px
- Ecosistema: bottom 22px, left 42px, height logos **33px**

**LAYOUT E — CTA Pill (evento)**
- Imagem: 55% direito, object-position right
- Overlay: gradiente `rgba(2,5,10,0.96) 0% → rgba(2,5,10,0.10) 65%`
- Conteúdo: coluna esquerda, 50% largura, justify-content: space-between, padding 40px 36px
- Logo cyberfest: 130px no topo
- Headline: Ubuntu 700, 28px
- Pill CTA: background `#14A8F4`, color `#02050A`, font-weight 700, padding `8px 20px`, border-radius `24px`, margin-top 16px
- Ecosistema: bottom 22px, left 36px, height logos **33px**

**LAYOUT D — Diagonal (palestrante)**
- Imagem: posicionada no CENTRO-DIREITA, object-position: 70% center
- Overlay: `linear-gradient(125deg, rgba(2,5,10,0.98) 0%, rgba(2,5,10,0.80) 45%, rgba(2,5,10,0.05) 100%)`
- Linha diagonal decorativa: 100% width, 1px, `#14A8F4`, opacity 0.4, rotacionado `rotate(-12deg)`, terço superior
- Conteúdo: coluna esquerda-centro, 55% largura, padding 40px
- Nome do palestrante: Montserrat 600, 12px, `#14A8F4`, uppercase, letter-spacing 2px, acima da headline
- Headline: Ubuntu 700, 30px
- Cargo/empresa: Montserrat 400, 11px, `#94A0B8`, margin-top 10px
- Ecosistema: bottom 22px, left 40px, height logos **33px**

**LAYOUT F — Coluna Lateral Sólida (patrocinador)**
- Coluna sólida esquerda: `width: 38%`, background `#14A8F4`, position absolute, height 100%
- Imagem: cobre área direita (left: 38%, width: 62%), object-position: center
- Logo cyberfest: 120px COM filter `brightness(0)` (fundo azul)
- Headline: Ubuntu 700, 26px, color `#02050A`, line-height 1.2
- Ecosistema: bottom 22px, LEFT 62% (área da imagem), height logos **33px**

**LAYOUT A — Banda Superior (cidade)**
- Imagem: cobre 65% INFERIOR da tela
- Banda sólida no TOPO: `height: 35%`, background `#02050A`, border-bottom `3px solid #14A8F4`
- Logo cyberfest: 130px, na banda superior
- Headline: Ubuntu 700, 28px, na banda superior, flex-grow 1
- Subtítulo: absolute, bottom 80px, left 40px, Montserrat 400, 14px
- Ecosistema: bottom 20px, left 40px, height logos **33px**

**LAYOUT L — L Invertido + Traços (evento)**
- Imagem: cobre TODA a tela, Overlay: `rgba(2,5,10,0.82)`
- Barra horizontal azul: `height: 3px`, width 100%, a 38% do topo
- Barra vertical azul: `width: 3px`, height 38% do topo, left 44px
- Conteúdo ACIMA: logo cyberfest 110px, padding left 60px
- Conteúdo ABAIXO: headline Ubuntu 700 34px, subtítulo, padding 20px 44px
- Ecosistema: bottom 20px, right 44px, height logos **33px**

Logos ecossistema: `filter: brightness(0) invert(1)`

Estrutura do `arte.html`:
```
.art-canvas (540×675px feed_vertical)
  ├── .art-bg (imagem base64)
  ├── .art-overlay (gradiente)
  ├── .art-content (logo + headline + subtítulo)
  ├── .ecosystem (logos ecossistema)
  └── .toolbar (botão print)
```

**Palavras azuis:** `<span style="color:#14A8F4">palavra</span>`

---

### PASSO 4 — Geração das Legendas A/B (Score ≥ 7/10 cada)

**Gerar DUAS versões distintas de legenda** com ângulos estrategicamente diferentes. Cada versão deve ser auto-suficiente e pronta para publicar.

**Regras de diferenciação entre A e B:**
- **Versão A:** gancho emocional/FOMO — abre com provocação, sensação de estar fora do circuito, urgência de pertencer
- **Versão B:** gancho aspiracional/conquista — abre com visão de futuro, posicionamento estratégico, o que o leitor vai ganhar

**Cada versão deve conter:**
- Gancho na 1ª frase (diferente entre A e B)
- Parágrafos curtos, máximo 3 parágrafos de corpo
- CTA claro e diferente entre as versões (A: urgência | B: convite)
- 5–8 hashtags relevantes (podem variar entre versões)
- Máximo 3 emojis estratégicos por versão

**Score de Legenda (aplicar individualmente a cada versão):**
1. Gancho (0–2) | 2. Clareza executiva (0–2) | 3. CTA (0–2) | 4. Hashtags (0–2) | 5. Fluidez (0–2)

Se score < 7 em qualquer versão → reescrever automaticamente antes de exibir.

**Apresentar painel de escolha A/B ao usuário:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🅰️  LEGENDA A — [ângulo: FOMO/urgência]     Score: X/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[texto completo da legenda A]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🅱️  LEGENDA B — [ângulo: aspiracional]      Score: X/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[texto completo da legenda B]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 Qual legenda usar?  →  Responda A, B ou "editar" para ajustes.
   (O upload só acontece após sua escolha.)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**⛔ PARAR AQUI — aguardar resposta do usuário antes de prosseguir para o PASSO 5.**

Se o usuário responder "editar" ou pedir ajuste em uma das versões: aplicar as mudanças solicitadas, recalcular o score e reapresentar apenas a versão editada antes de continuar.

---

### PASSO 5 — Slug e Index Individual

*(Executar somente após aprovação da legenda pelo usuário)*

Slug: `{tipo_post}-{timestamp}` (ex: `blog-1718901234567`)

Criar `artes/{slug}/index.html` com embed do arte.html + metadados + link para galeria.

---

### PASSO 6 — Upload GitHub

Upload via GitHub API (GITHUB_TOKEN) de:
1. `artes/{slug}/arte.html`
2. `artes/{slug}/thumb.png` (base64)
3. `artes/{slug}/index.html`

Registrar o SHA retornado pela API para cada arquivo (usado na pós-validação).

Atualizar `artes.json` adicionando:
```json
{
  "slug": "...",
  "tipo": "...",
  "headline": "...",
  "palavras_azuis": "...",
  "subtitulo": "...",
  "cidade": "...",
  "formato": "...",
  "layout": "...",
  "legenda": "...",
  "legenda_variante": "A",
  "image_path": "artes/{slug}/thumb.png",
  "html_path": "artes/{slug}/arte.html",
  "created_at": "ISO-8601"
}
```

O campo `legenda_variante` registra qual versão (A ou B) foi aprovada.

---

### PASSO 7 — Atualizar temas.json (Rotação)

Atualizar `historico_recente` em `temas.json`:
- Adicionar entrada: tipo_post, layout, slug, data
- Truncar para máximo 20 entradas

---

### PASSO 8 — Pós-Validação (EXECUTAR APÓS TODOS OS UPLOADS)

**1. Confirmar uploads:** verificar status 201/200 + SHA 40 chars para arte.html, thumb.png, index.html

**2. Confirmar artes.json:**
- Novo slug presente, campos `layout`, `legenda`, `legenda_variante` (A ou B) preenchidos, `created_at` de hoje

**3. Confirmar temas.json:**
- Nova entrada em `historico_recente`, total ≤ 20

**4. Reportar:**
```
✅ PÓS-VALIDAÇÃO OK
   arte.html:   SHA confirmado ✓
   thumb.png:   SHA confirmado ✓
   index.html:  SHA confirmado ✓
   artes.json:  layout="X", legenda_variante="A|B" ✓
   temas.json:  historico_recente atualizado (N entradas) ✓
```

---

### PASSO 9 — Output Final

1. **Status de validação** (pré + pós em bloco compacto)
2. **Preview da arte** (link Vercel)
3. **Legenda aprovada** (variante escolhida) + score breakdown
4. **Layout utilizado** + próximo layout na fila
5. **Links:** arte individual, galeria, thumb

---

## Output
Post completo publicado com rastreabilidade total:
- `artes/{slug}/arte.html` + `thumb.png` + `index.html`
- `artes.json` com campo `layout`, `legenda` e `legenda_variante` (A ou B)
- `temas.json` com histórico de rotação atualizado
- Relatório de validação (pré + pós) em cada execução
