# Referências visuais — CybersecFEST Design System

**Regra:** usar apenas fotografia, luz, cor e composição. Ignorar textos, logos e fontes.

---

## GRANDE REFERÊNCIA — artes #1 e #2 (bússola obrigatória)

Estas duas artes publicadas definem a **tonalidade azul fantástica** que todo post novo deve perseguir.
O pipeline anexa **sempre** 1 ou 2 destes fundos reais ao Gemini em toda geração.

| Arte | Arquivo | Assinatura visual |
|------|---------|-------------------|
| **#1** patrocinador | `ouro/01-arte-patrocinador-xadrez-grid.jpeg` | Rei metálico; grid reflexivo; glow ciano na base; bokeh de rede; sombras #02050A com highlights elétricos |
| **#2** evento | `ouro/02-arte-evento-silhueta-backlight.png` | Silhueta executiva; halo backlight ciano intenso; skyline noturno; atmosfera saturada em azul |

**Copiar:** tom de azul, contraste, glow, qualidade cinematográfica.  
**Não copiar:** composição, poses, rostos, layout do post.

---

## Ouro legado (`ouro/` — moodboard adicional)

| Arquivo | O que extrair |
|---------|---------------|
| `01-xadrez-rei-grid-azul.png` | Metáfora material + grid (reforça #1) |
| `04-retrato-rim-light-azul.png` | Rim light ciano em cabelo/ombro |
| `10-skyline-flares-hex-bokeh.png` | Flares anamórficos + bokeh hex |

## Cidade / Metáfora / Executivo / Ouro legado

Pastas `cidade/`, `metafora/`, `executivo/` e PNGs legados em `ouro/` — **3ª referência complementar** por tipo/layout (além de #1 e #2).

## Evitar (`evitar/`)

`06-ilustracao-3d-coluna.png` — ilustração 3D, não fotografia.

---

## Pipeline

| Arquivo | Função |
|---------|--------|
| `reference-images.js` | Sempre anexa #1 e/ou #2 + seleção por `tipo`/`layout` |
| `imagem-prompt.js` | Lei do Azul com assinaturas #1 e #2 |
| `llm.js` | Até 3 `inlineData` no Gemini: #1+#2 + 1 moodboard legado |
