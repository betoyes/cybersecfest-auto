# Motion v1 — signal-mesh-10s

Preset premium para **Layout E — CTA Pill em Destaque**.

## Conceito
Rede cibernética em ativação: malha orgânica SVG no lado direito, scanline discreta, headline priorizada com máscara vertical, CTA pill como confirmação de transmissão com pulse + shine diagonal.

## Specs
- Duração: **10s** (hold final ~3s)
- Canvas: 1080×1350
- Slug: `evento-1782143777641`
- Referência estática: `../arte.html` (intocada)

## Camadas extras
- `#mesh` / `#mesh-lines` / `#mesh-nodes` — malha SVG animada
- `#mesh-link` — linha de conexão até área do CTA (7.3s)
- `#scanline`, `#vignette`, `#flash`, `#particles`, `#grain`
- `#cta-pulse`, `#cta-shine`, `#cta-arrow`

## Render
```bash
cd artes/evento-1782143777641/motion && npm run render
```
