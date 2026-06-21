# Protocolo Multi-Agente — CybersecFEST

Este arquivo define as regras de colaboração entre agentes de IA que operam neste repositório.
Qualquer agente que escreva neste repo DEVE seguir este protocolo.

---

## Agentes Ativos

| Agente | Plataforma | Responsabilidade Principal |
|--------|-----------|---------------------------|
| **SuperAgent** | CREAO | Geração de artes, orquestração editorial, manutenção do stack |
| *(outra IA)* | *(plataforma)* | *(preencher ao integrar)* |

---

## Regras Obrigatórias

### 1. Fetch Fresco Antes de Escrever
Nunca use dados lidos anteriormente para escrever um arquivo. Antes de qualquer PUT/PATCH via GitHub API, sempre faça um GET do arquivo para obter o SHA atual.

```
GET /repos/betoyes/cybersecfest/contents/<arquivo>  →  sha atual
PUT /repos/betoyes/cybersecfest/contents/<arquivo>  →  usar sha acima
```

Isso é o equivalente a `git pull --rebase` antes de qualquer commit.

### 2. Commits Assinados com Prefixo de Agente
Toda mensagem de commit deve começar com o prefixo do agente autor:

```
[SuperAgent] feat: adiciona arte blog-1782xxxxxx — Layout N
[OutraIA]    fix: corrige entrada duplicada em temas.json
[SuperAgent] update: artes.json — registro patrocinador-xxxxxxx
```

Formato: `[NomeDoAgente] <tipo>: <descrição curta>`

### 3. Arquivos com Dono Definido

| Arquivo | Dono (escrita livre) | Outros agentes |
|---------|---------------------|----------------|
| `artes.json` | SuperAgent | Apenas leitura |
| `temas.json` | SuperAgent | Leitura; edições via branch |
| `index.html` | SuperAgent | Leitura; edições via branch |
| `_agents/` | SuperAgent | Apenas leitura |
| `AGENTS.md` | Qualquer agente | PR obrigatório para alterações |
| Novos arquivos próprios | Agente criador | Livre |

### 4. Mudanças em Arquivos Centrais → Branch + PR
Para alterações em `temas.json`, `index.html` ou qualquer arquivo de `_agents/`:
1. Criar uma branch com prefixo do agente: `superagent/update-temas` ou `outraia/fix-index`
2. Fazer o commit na branch
3. Abrir Pull Request descrevendo a mudança
4. O usuário ou agente dono aprova o merge

### 5. Verificação de Estado Antes de Operar
No início de cada execução, verificar os últimos 5 commits:
```
GET /repos/betoyes/cybersecfest/commits?per_page=5
```
Identificar commits de outros agentes (prefixo diferente de `[SuperAgent]`) e reportar ao usuário antes de prosseguir.

---

## Arquivos de Estado Compartilhado

| Arquivo | Descrição | Operação segura |
|---------|-----------|----------------|
| `artes.json` | Banco de todas as artes publicadas | Append-only (nunca remover entradas) |
| `temas.json` | Contexto editorial, histórico de rotação | Atualizar `historico_recente` com fetch fresco |
| `index.html` | Galeria pública (Vercel) | Alterações via branch/PR |

---

## Onboarding de Novo Agente

Para integrar um novo agente a este repo:

1. **Credenciais:** solicitar ao usuário um GitHub Token com permissão de `push` no repo
2. **Leitura obrigatória antes da primeira execução:**
   - `AGENTS.md` (este arquivo) — protocolo
   - `_agents/CHANGELOG.md` — estado atual do stack
   - `artes.json` — slugs existentes (para não duplicar)
   - `temas.json` — contexto editorial vigente
3. **Registrar neste arquivo:** adicionar linha na tabela "Agentes Ativos" via PR
4. **Escolher prefixo de commit único:** diferente de `[SuperAgent]`

---

## Histórico de Agentes

| Data | Evento |
|------|--------|
| 2026-06-21 | SuperAgent (CREAO) — stack inicial com Gerador de Artes v2.4.0 + Orquestrador v1.5.2 |
| 2026-06-21 | Criação deste protocolo AGENTS.md |
