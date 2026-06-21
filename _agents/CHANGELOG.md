# CybersecFEST — Changelog dos Agentes

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
