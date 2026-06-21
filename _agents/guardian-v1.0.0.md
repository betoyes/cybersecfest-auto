# CybersecFEST — Guardian

## Goal
Monitorar a integridade completa do ecossistema CybersecFEST, detectar alterações de agentes externos, fazer backup integral do repositório primário em um repositório secundário de segurança no GitHub, e gerar um relatório de saúde verde/amarelo/vermelho antes do ciclo operacional diário.

## Inputs
Este agente não tem inputs obrigatórios. Roda de forma autônoma, agendado diariamente às 07h BRT.

- repo_backup (string, optional): nome do repo de backup no GitHub (default: betoyes/cybersecfest-backup)
- modo (select, optional): completo | so_relatorio (default: completo)

## Procedure

### PASSO 1 — Verificar Integridade dos Arquivos de Estado

**1a. artes.json**
```
GET https://raw.githubusercontent.com/betoyes/cybersecfest/main/artes.json
```
Verificar:
- [ ] HTTP 200 — arquivo acessível
- [ ] JSON válido e parseável (array)
- [ ] Cada entrada tem os campos obrigatórios: slug, tipo, headline, layout, legenda, legenda_variante, created_at
- [ ] Slugs únicos — sem duplicatas
- [ ] Campo `layout` preenchido em 100% das entradas (nenhum null/vazio)
- [ ] Datas em formato ISO-8601 válido

Status: ✅ OK | ⚠️ ALERTA (campo faltando em alguma entrada) | ❌ CRÍTICO (JSON inválido ou inacessível)

**1b. temas.json**
```
GET https://raw.githubusercontent.com/betoyes/cybersecfest/main/temas.json
```
Verificar:
- [ ] HTTP 200 — arquivo acessível
- [ ] JSON válido
- [ ] Campo `rotacao_layouts` presente com chaves: blog, evento, palestrante, patrocinador, cidade
- [ ] Campo `historico_recente` presente e array com ≤ 20 entradas
- [ ] Campo `calendario_editorial` presente
- [ ] Campo `historico_aprovacoes` presente (pode ser array vazio)

Status: ✅ OK | ⚠️ ALERTA | ❌ CRÍTICO

**1c. index.html (galeria)**
```
GET https://api.github.com/repos/betoyes/cybersecfest/contents/index.html
```
Verificar:
- [ ] HTTP 200 — arquivo existe no repo
- [ ] Tamanho > 5KB (arquivo não está vazio/truncado)

Status: ✅ OK | ❌ CRÍTICO

**1d. AGENTS.md**
```
GET https://api.github.com/repos/betoyes/cybersecfest/contents/AGENTS.md
```
Verificar:
- [ ] HTTP 200 — protocolo multi-agente presente

Status: ✅ OK | ⚠️ AUSENTE

---

### PASSO 2 — Verificar Deploy Vercel (galeria pública)

```
GET https://cybersecfest.vercel.app
```
(ou URL Vercel configurada para o projeto)

Verificar:
- [ ] HTTP 200 — galeria online
- [ ] Tempo de resposta < 5 segundos

Status: ✅ Online | ❌ Offline/Erro

Se offline: registrar no relatório como CRÍTICO mas não interromper os próximos passos.

---

### PASSO 3 — Auditoria de Commits Recentes

```
GET https://api.github.com/repos/betoyes/cybersecfest/commits?per_page=20
```

Para cada commit:
- Extrair: sha (8 chars), message, author.name, commit.author.date
- Classificar:
  - `[SuperAgent]` → agente primário (normal)
  - `[OutraIA]`, `[GeminiAgent]`, etc. → agente externo (registrar, não é erro)
  - Sem prefixo de agente → commit manual do usuário (registrar)
  - Mensagem suspeita (força bruta, delete *, etc.) → ALERTA

Gerar tabela:
```
SHA       | Data       | Autor          | Tipo
--------- | ---------- | -------------- | -----
a32a56e3  | 2026-06-21 | SuperAgent     | ✅ Agente primário
xxxxxxxx  | 2026-06-21 | OutraIA        | 🔵 Agente externo
xxxxxxxx  | 2026-06-20 | betoyes        | 👤 Manual
```

Sinalizar se houver commits de agentes externos desde o último backup.

---

### PASSO 4 — Backup Integral do Repositório

**Objetivo:** espelhar o conteúdo COMPLETO de `betoyes/cybersecfest` em `betoyes/cybersecfest-backup` (ou repo configurado).

**4a. Criar repo de backup se não existir:**
```
GET https://api.github.com/repos/betoyes/cybersecfest-backup
```
Se 404:
```
POST https://api.github.com/user/repos
{ "name": "cybersecfest-backup", "private": true, "description": "Backup automático — CybersecFEST Guardian" }
```

**4b. Listar todos os arquivos do repo primário:**
```
GET https://api.github.com/repos/betoyes/cybersecfest/git/trees/main?recursive=1
```
Filtrar: apenas arquivos (type: "blob"), excluir `node_modules/` se existir.

**4c. Para cada arquivo — espelhar no backup:**

Estratégia eficiente (evitar rate limit):
1. Buscar tree do backup para comparar SHAs
2. Para cada arquivo onde SHA primário ≠ SHA backup (ou arquivo novo):
   - Fazer GET do conteúdo do arquivo no primário
   - Fazer PUT no backup com o mesmo conteúdo
   - Mensagem de commit: `[Guardian] sync: <caminho> — backup automático <data>`
3. Arquivos com SHA idêntico → pular (sem PUT desnecessário)

**4d. Registrar resultado do backup:**
- Total de arquivos no repo primário
- Arquivos sincronizados (novos ou modificados)
- Arquivos já em dia (SHA igual → pulados)
- Arquivos com erro (se houver)

**Limite de segurança:** se o repo primário tiver > 500 arquivos, processar em lotes de 50 e registrar progresso. Se houver erro em algum arquivo, continuar com os demais e registrar o erro no relatório.

---

### PASSO 5 — Atualizar Log de Saúde no Backup

Criar/atualizar `_guardian/health-log.json` no repo de backup com o registro desta execução:

```json
{
  "execucoes": [
    {
      "data": "ISO-8601",
      "status_geral": "verde | amarelo | vermelho",
      "artes_json": "ok | alerta | critico",
      "temas_json": "ok | alerta | critico",
      "index_html": "ok | critico",
      "vercel": "online | offline",
      "commits_externos": 0,
      "arquivos_backup_total": 0,
      "arquivos_sincronizados": 0,
      "alertas": []
    }
  ]
}
```

Manter no máximo as últimas 30 execuções. Fazer fetch fresco do arquivo antes do PUT para obter SHA atual.

Commit: `[Guardian] log: health-check <data> — status <verde|amarelo|vermelho>`

---

### PASSO 6 — Gerar Relatório de Saúde

Apresentar relatório final em formato legível:

```
╔══════════════════════════════════════════════════════╗
║   🛡️  GUARDIAN — CybersecFEST Health Report          ║
║   📅  <data e hora BRT>                              ║
╠══════════════════════════════════════════════════════╣
║  STATUS GERAL:  🟢 VERDE | 🟡 AMARELO | 🔴 VERMELHO  ║
╚══════════════════════════════════════════════════════╝

📋 INTEGRIDADE DOS ARQUIVOS
   artes.json   [N artes]     ✅ OK | ⚠️ ALERTA | ❌ CRÍTICO
   temas.json                 ✅ OK | ⚠️ ALERTA | ❌ CRÍTICO
   index.html                 ✅ OK | ❌ CRÍTICO
   AGENTS.md                  ✅ OK | ⚠️ AUSENTE

🌐 DEPLOY VERCEL              ✅ Online | ❌ Offline

📝 COMMITS RECENTES (últimos 20)
   ✅ SuperAgent: N commits
   🔵 Agentes externos: N commits → [lista de prefixos detectados]
   👤 Manuais: N commits

💾 BACKUP
   Repo:          betoyes/cybersecfest-backup
   Total arquivos: N
   Sincronizados:  N (novos/modificados)
   Em dia:         N (SHA idêntico, pulados)
   Erros:          N

⚠️ ALERTAS
   [lista de alertas, ou "Nenhum alerta."]

🔗 LINKS
   Galeria:  https://cybersecfest.vercel.app
   Primário: https://github.com/betoyes/cybersecfest
   Backup:   https://github.com/betoyes/cybersecfest-backup
```

**Critério de cor do status geral:**
- 🟢 VERDE: tudo OK, nenhum alerta crítico
- 🟡 AMARELO: alertas não-críticos (campo faltando em artes, historico > 20, etc.)
- 🔴 VERMELHO: qualquer item CRÍTICO (JSON inválido, Vercel offline, backup com erros)

---

## Output
Relatório de saúde completo com status verde/amarelo/vermelho, auditoria de commits, resultado do backup integral e log persistido em `_guardian/health-log.json` no repo de backup.
