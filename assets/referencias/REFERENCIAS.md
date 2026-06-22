# Referências visuais — CybersecFEST Design System

**Regra:** usar apenas fotografia, luz, cor e composição. Ignorar textos, logos e fontes visíveis nas imagens.

## Ouro (`ouro/`)

Padrão máximo — sempre anexada como primeira referência na geração.

| Arquivo | O que copiar |
|---------|--------------|
| `01-xadrez-rei-grid-azul.png` | Peça metálica em grid reflexivo; glow ciano na base; bokeh de rede no fundo; sombras #02050A |
| `04-retrato-rim-light-azul.png` | Retrato executivo; rim light ciano em cabelo/ombro; fundo escuro com bokeh azul |
| `10-skyline-flares-hex-bokeh.png` | Skyline noturno; flares anamórficos horizontais; bokeh hexagonal azul; grade monocromática navy |

## Executivo (`executivo/`)

Retratos humanizados — layouts C, M, N, D, G, K.

| Arquivo | O que copiar |
|---------|--------------|
| `04-retrato-rim-light-azul.png` | Chiaroscuro; rim light elétrico; olhar aspiracional; fundo low-key |
| `05-retrato-tablet-streaks-azul.png` | Luz de recorte no tablet; streaks ciano no fundo; foco profissional |
| `07-retrato-neon-chevron-cyan.png` | Neon ciano no ambiente; estrada noturna; atmosfera futurista |
| `08-retrato-city-flare-azul.png` | Cidade ao fundo; flare azul atrás do ombro; circuito sutil |
| `09-retrato-pampulha-streaks.png` | Arquitetura icônica + retrato; streaks diagonais ciano |

## Cidade (`cidade/`)

Arquitetura e skyline — layouts A, E, H, evento.

| Arquivo | O que copiar |
|---------|--------------|
| `03-niemeyer-bh-bokeh-azul.png` | Edifício curvo à noite; reflexo em água; partículas digitais azuis |
| `10-skyline-flares-hex-bokeh.png` | Perspectiva baixa; torres escuras; flares e bokeh hex |

## Metáfora (`metafora/`)

Objetos simbólicos — patrocinador / layout F.

| Arquivo | O que copiar |
|---------|--------------|
| `01-xadrez-rei-grid-azul.png` | Rei de xadrez metálico; superfície reflexiva; mapa/grid digital |
| `02-xadrez-torre-glow-base.png` | Torre com anel luminoso na base; reflexos metálicos; bokeh horizontal |

## Evitar (`evitar/`)

**Não usar como referência de estilo.**

| Arquivo | Motivo |
|---------|--------|
| `06-ilustracao-3d-coluna.png` | Ilustração 3D/holográfica — viola regra "fotografia pura" |

## Integração no pipeline

- `_scripts/utils/reference-images.js` — seleção por `tipo` + `layout`
- `_scripts/utils/llm.js` — anexa até 2 refs como `inlineData` no Gemini
- `_scripts/utils/imagem-prompt.js` — Lei do Azul alinhada a este moodboard
