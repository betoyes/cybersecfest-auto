# CybersecFEST — Índice de Agentes

**Última atualização:** 2026-06-26  

## Agentes Operacionais (pipeline de artes)

| Agente | ID | SKILL.md | Função |
|---|---|---|---|
| Gerador de Artes | 3ae0829d | [SKILL.md](gerador-de-artes/SKILL.md) | Gera artes FEST via GitHub API (SuperAgent) |
| Campaign Planner | e4b59707 | [SKILL.md](campaign-planner/SKILL.md) | Planeja campanhas editoriais FEST |
| Pipeline Orquestrador | 86597381 | [SKILL.md](pipeline-orquestrador/SKILL.md) | Orquestra fluxo multi-agente |

## Agentes Editoriais (personas LLM)

Não são agentes autônomos — são módulos importados pelos geradores de propostas para fornecer persona, knowledge base e regras editoriais ao LLM.

| Agente | Produto | Arquivos | Importado por |
|---|---|---|---|
| `fest-estrategista` | CybersecFEST | [knowledge.js](fest-estrategista/knowledge.js) · [system-prompt.js](fest-estrategista/system-prompt.js) | `_scripts/gerar-propostas.js` |
| `cast-estrategista` | CybersecCAST | [knowledge.js](cast-estrategista/knowledge.js) · [system-prompt.js](cast-estrategista/system-prompt.js) | `_scripts/gerar-propostas-cast.js` |

### O que cada agente editorial sabe

**`fest-estrategista`**
- Histórico: 2023 (+360) → 2025 (+2.200) → 2026 expansão nacional
- Edições 2026: BH (Stellantis, Sada, VLI) + SP (Localiza, Natura, XP)
- Cotas: Emerald R$77k, Diamond R$68k, Gold R$60k, Welcome Coffee, Lunch, Happy Hour, Drink Experience
- 3 personas: `FEST_AUDIENCIA_SYSTEM` · `FEST_PATROCINADORES_SYSTEM` · `FEST_CONVITE_SYSTEM`

**`cast-estrategista`**
- Hosts: Edgar (Estratégia) + Amanda (Curadoria Editorial)
- 6 episódios gravados: Paulo Conduta/Netonze, Vitor Padovan/IAM Experts, Leandro Ludwig/Bradesco, Izaias Gomes/Piracanjuba, Fagner Almeida/Biolab, Bruno Ferreira/Elven Works
- 1 agendado: Renan Barcelos/RTM
- Patrocinadores T1: Skalena, LDC Soluções, Sunny Systems
- 3 personas: `CAST_AUDIENCIA_SYSTEM` · `CAST_PATROCINADORES_SYSTEM` · `CAST_TEMPORADA_SYSTEM`

> **Para adicionar novos convidados/patrocinadores/edições:** editar apenas o `knowledge.js` do agente correspondente. O sistema lê em runtime — sem restart necessário.

## Changelog
Ver [CHANGELOG.md](CHANGELOG.md)
