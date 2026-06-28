# Plano de Melhorias — Studio CybersecFEST/CAST

> ✅ **CONCLUÍDO em 28 jun 2026** — todas as 12 fases implementadas para CAST e portadas para Sunny Systems (e qualquer futuro cliente dinâmico via `client-router.js`).
> `npm test` 46/46. `node --check _scripts/dev-server.js` limpo.

---

> *Plano original abaixo, preservado como referência histórica.*

> Implementar uma por vez, nesta ordem. Cada fase é independente e testável isoladamente.
> Regra: `npm test` deve passar (46/46) e `node --check _scripts/dev-server.js` deve ser verde após cada fase.

---

## Fase 1 — Hot reload de `_clients.json`

**Risco:** Baixo | **Esforço:** 1

**Por que primeiro:** Mudança puramente aditiva em infraestrutura. Não toca nenhuma rota existente, sem risco de regressão.

**Arquivos tocados:**
- `_scripts/dev-server.js` — adicionar `fs.watch` após `loadClients()`

**Arquivos NÃO tocados:** tudo mais

**O que muda:**
```js
// após loadClients() no dev-server.js
fs.watch(path.join(ROOT, '_clients.json'), { persistent: false }, () => {
  log.info('_clients.json alterado — recarregando clientes...');
  loadClients();
});
```

**Como testar:** Iniciar servidor → editar `_clients.json` (adicionar campo qualquer) → log deve mostrar "recarregando clientes" sem restart.

**Rollback:** Remover as 4 linhas do `fs.watch`.

---

## Fase 2 — Histórico de versões visível no card da galeria

**Risco:** Baixo | **Esforço:** 1

**Por que aqui:** Frontend puro. Não toca nenhuma rota de geração ou banco de dados. Só lê `img-versoes/index.json` que já existe.

**Arquivos tocados:**
- `cast/index.html` — no render do card, adicionar badge com contagem de versões
- `sunnysystems/index.html` — idem

**O que muda:** Ao renderizar o card, fazer `GET /api/cast/arte/imagem/versoes?slug=X` (rota já existe) e exibir badge discreto "3 versões" abaixo do thumb quando `versoes.length > 1`. Usar `Promise.allSettled` para não bloquear render da galeria.

**Como testar:** Arte com múltiplas versões deve mostrar badge. Arte sem versões não mostra nada. Galeria carrega normalmente mesmo se a rota de versões falhar.

**Rollback:** Remover o bloco de badge do template de card.

---

## Fase 3 — Exportação em lote ZIP

**Risco:** Baixo | **Esforço:** 2

**Por que aqui:** Novo endpoint isolado. Não altera nenhuma rota existente, não muda nenhum banco de dados.

**Arquivos tocados:**
- `_scripts/routes/cast.js` — novo handler `handleCastExportarZip`
- `_scripts/dev-server.js` — registrar rota `POST /api/cast/exportar/zip`
- `_scripts/package.json` — adicionar `archiver` (ou usar `zlib` nativo)

**O que muda:**
```
POST /api/cast/exportar/zip
  → itera artes-cast.json
  → para cada arte: inclui thumb.png + legenda.txt (campo legenda da arte)
  → organiza em pastas por mês (YYYY-MM/) de criado_em
  → retorna ZIP como stream (Content-Type: application/zip)
```

**Como testar:** Chamar a rota → receber ZIP → descompactar → verificar estrutura de pastas e conteúdo dos arquivos.

**Rollback:** Remover handler e rota. Desinstalar `archiver` se instalado.

---

## Fase 4 — Duplicar arte

**Risco:** Baixo | **Esforço:** 1

**Por que aqui:** Endpoint aditivo. Reutiliza lógica de `handleCastCriarArte` internamente — não duplica código, apenas pré-preenche payload.

**Arquivos tocados:**
- `_scripts/routes/cast.js` — novo handler `handleCastDuplicarArte`
- `_scripts/dev-server.js` — rota `POST /api/cast/arte/duplicar`
- `cast/index.html` — botão "Duplicar" no modal

**O que muda:**
```
POST /api/cast/arte/duplicar { slug: "cast-123", instrucao: "estúdio com luz âmbar" }
  → busca arte original em artes-cast.json
  → copia: tipo, layout, headline, subtitulo, palavras_azuis
  → gera nova imagem com instrucao (ou contexto_visual original se instrucao omitida)
  → cria nova arte com slug "cast-{Date.now()}"
  → retorna nova arte
```

**Como testar:** Duplicar arte existente → nova arte aparece na galeria com mesmo texto mas imagem diferente. Arte original intacta.

**Rollback:** Remover handler e rota. Remover botão da UI.

---

## Fase 5 — Persistência do título no editor

**Risco:** Médio | **Esforço:** 2

**Por que aqui:** Agora que as fases anteriores validaram o ciclo de edição sem regressões, é seguro estender o contrato de dados do save. Requer cuidado porque altera `artes-cast.json`.

**Pré-condição:** Fases 1–4 implementadas e testadas.

**Arquivos tocados:**
- `_scripts/utils/editor-v3-script.js` — incluir `headline` e `palavras_azuis` no payload de save
- `_scripts/routes/cast.js` — `handleCastSalvarArte`: ler e persistir esses campos em `artes-cast.json` e regenerar arte

**O que muda no payload de save:**
```json
{
  "slug": "cast-123",
  "state": { "x": 50, "y": 50, "z": 100 },
  "subtitle": "novo subtítulo",
  "headline": "NOVO TÍTULO COM<br>QUEBRA",
  "palavras_azuis": "NOVO, TÍTULO"
}
```

Campos são opcionais — se ausentes, comportamento atual se mantém (sem regressão para saves antigos).

**Como testar:** Editar título no editor → salvar → recarregar página → título persiste. Arte FEST não afetada (usa rota `/api/arte/salvar` diferente).

**Rollback:** Tornar campos ignorados no handler (já são opcionais por design — zero impacto).

---

## Fase 6 — Preview ao vivo no editor

**Risco:** Médio | **Esforço:** 2

**Por que aqui:** Depende da Fase 5 estar estável (editor save funcionando). Mudança de UX sem tocar banco de dados ou pipeline de geração.

**Arquivos tocados:**
- `_scripts/utils/editor-v3-script.js` — debounce nos sliders + atualização de iframe
- `_scripts/routes/cast.js` — novo endpoint leve `POST /api/cast/arte/preview` (sem escrever em disco)
- `_scripts/dev-server.js` — registrar rota preview

**O que muda:**
```
Slider move (debounce 600ms)
  → POST /api/cast/arte/preview { slug, state }
  → servidor: buildArteHtmlCast com state temporário (NÃO salva nada)
  → retorna HTML como text/html
  → editor: injeta HTML em <iframe> de preview no painel esquerdo
```

O endpoint preview é read-only — só lê `fundo.png` e `artes-cast.json`, nunca escreve.

**Como testar:** Mover slider → iframe atualiza em ~600ms sem salvar. Recarregar página → posição não mudou (só muda ao clicar Salvar). Artes FEST não afetadas.

**Rollback:** Remover debounce e reverter para comportamento atual (preview só após save).

---

## Fase 7 — Fila de geração com status por slug

**Risco:** Médio-Alto | **Esforço:** 3

**Por que aqui:** Maior refatoração até agora. Substitui o `busy` global. Deixar para depois das melhorias menores consolidarem o codebase.

**Pré-condição:** Fases 1–6 passando nos testes.

**Arquivos tocados:**
- `_scripts/dev-server.js` — substituir `let busy` por `const generationQueue = new Map()`; atualizar `setBusy` e `clearBusy`
- `_scripts/routes/cast.js` — `setBusy(res, slug)` / `clearBusy(slug)` com slug
- `_scripts/utils/client-router.js` — idem

**O que muda:**
```js
// antes
let busy = false;
function setBusy(res) { if (busy) { return false; } busy = true; return true; }
function clearBusy() { busy = false; }

// depois
const generationQueue = new Map();
function setBusy(res, slug = '__global') {
  if (generationQueue.has(slug)) { json(res, 409, { ok: false, erro: 'Geração em andamento para este post.' }); return false; }
  generationQueue.set(slug, 'generating');
  return true;
}
function clearBusy(slug = '__global') { generationQueue.delete(slug); }
```

Nova rota `GET /api/status` retorna `{ queue: Object.fromEntries(generationQueue) }`.

**Como testar:** Disparar geração de arte A → imediatamente gerar arte B → deve funcionar (antes travava). Gerar A novamente enquanto processa → 409. `npm test` deve passar (46/46).

**Rollback:** Reverter para `let busy = false` e remover slug dos parâmetros.

---

## Fase 8 — Banco de aprovações como feedback loop

**Risco:** Baixo | **Esforço:** 2

**Por que aqui:** Read-only. Não altera fluxo existente — só lê `artes-cast.json` e enriquece o prompt.

**Arquivos tocados:**
- `_scripts/gerar-propostas-cast.js` — adicionar bloco de contexto histórico no início do prompt

**O que muda:**
```
Antes de gerar propostas:
  → ler últimas 10 artes de artes-cast.json
  → extrair: { tipo, layout, headline[0..3 palavras] }
  → montar bloco no prompt: "Histórico recente (evite repetir tom/estrutura):"
  → ex: "episodio/layout-C: 'CISO DECIDE AGORA'; episodio/layout-M: 'RISCO É CUSTO'"
```

**Como testar:** Gerar propostas → log mostra bloco histórico. Propostas não repetem estrutura das últimas 10. Sem artes recentes → prompt normal sem bloco.

**Rollback:** Remover o bloco de contexto histórico do prompt (1 bloco de código).

---

## Fase 9 — Sugestão automática de layout

**Risco:** Médio | **Esforço:** 2

**Por que aqui:** Depende da Fase 8 (prompt de propostas estável com contexto histórico). Adiciona campo `layout_sugerido` ao JSON de resposta do LLM.

**Arquivos tocados:**
- `_scripts/gerar-propostas-cast.js` — instrução para o LLM incluir `layout_sugerido` no JSON
- `_scripts/aprovar-propostas-cast.js` — usar `layout_sugerido` se presente e válido; rotação normal se ausente

**O que muda:** O LLM já tem o conteúdo (`headline`, `tipo`). Instrução adicional: "Sugira o layout mais adequado (A–Q) considerando se o conteúdo é abstrato, tem pessoa, ou é gráfico." Retorna `layout_sugerido: "G"`. Se inválido ou ausente, rotação normal.

**Como testar:** Proposta para tipo `convidado` → `layout_sugerido` aparece no JSON. Aprovar → arte usa layout sugerido. JSON sem campo → rotação normal.

**Rollback:** Ignorar `layout_sugerido` no aprovador (1 linha).

---

## Fase 10 — Seed + variações controladas

**Risco:** Médio | **Esforço:** 2

**Por que aqui:** Requer que save (Fase 5) e fila (Fase 7) estejam estáveis.

**Arquivos tocados:**
- `_scripts/utils/llm.js` — salvar seed retornado pelo `gpt-image-1` na resposta da função
- `_scripts/routes/cast.js` — `handleCastMudarImagem`: aceitar `variar: true`; `handleCastSalvarArte`: persistir `seed` em `state.json`
- `cast/index.html` — botão "Variar cena" no modal

**O que muda:**
```json
// state.json — novo campo opcional
{ "x": 50, "y": 50, "z": 100, "seed": 1234567890 }
```

```
POST /api/cast/arte/imagem/mudar { slug, instrucao, variar: true }
  → se variar=true e state.json tem seed: passa seed para gpt-image-1
  → gera variação da mesma composição com instrucao aplicada
  → se Gemini foi o gerador (sem seed): comportamento normal
```

**Como testar:** Gerar arte → "Variar cena" → nova imagem é variação da anterior. Sem seed → comportamento normal de mudar imagem.

**Rollback:** Ignorar campo `seed` e `variar` nos handlers. Remover botão da UI.

---

## Fase 11 — Detecção de similaridade

**Risco:** Médio | **Esforço:** 3

**Por que aqui:** Extensão natural da Fase 8 (feedback loop). Usa `text-embedding-3-small` (OpenAI, barato).

**Arquivos tocados:**
- `_scripts/utils/llm.js` — nova função `getEmbedding(text)`
- `_scripts/utils/similaridade.js` — novo arquivo: cosseno + threshold
- `_scripts/gerar-propostas-cast.js` — após gerar propostas, checar similaridade com últimas 10 artes

**O que muda:**
```
Após gerar 3 propostas:
  → para cada proposta: getEmbedding(headline + " " + subtitulo)
  → comparar cosseno com embeddings das últimas 10 artes aprovadas
  → se similaridade > 0.92: adicionar aviso na proposta { similar_a: "cast-123" }
  → UI exibe chip amarelo "similar a post anterior" — não bloqueia aprovação
```

**Como testar:** Fazer pedido com tema idêntico a arte recente → aviso aparece. Tema novo → sem aviso. `npm test` passa.

**Rollback:** Remover chamada de similaridade do gerador.

---

## Fase 12 — Crop inteligente por layout

**Risco:** Médio | **Esforço:** 3

**Por que aqui:** Última fase — mais dependente de infraestrutura estável. Adiciona chamada Vision API por geração.

**Arquivos tocados:**
- `_scripts/utils/llm.js` — nova função `detectSubjectPosition(imgBuffer)` via `gpt-4o-mini`
- `_scripts/routes/cast.js` — após `generateImage`, chamar `detectSubjectPosition` e ajustar `bgPos` inicial

**O que muda:**
```
Após generateImage retornar imgBuffer:
  → detectSubjectPosition(imgBuffer) com timeout 5s
      → gpt-4o-mini vision: "onde está o sujeito? left/center/right/abstract"
  → mapear para background-position:
      left     → x: 20, y: 50
      center   → x: 50, y: 50
      right    → x: 80, y: 50
      abstract → LAYOUT_BG_POS[layout] (comportamento atual)
  → usar como bgPos padrão ao criar arte
```

Se Vision API falhar ou timeout: usar `LAYOUT_BG_POS[layout]` normal, sem erro visível.

**Como testar:** Gerar arte com pessoa à esquerda → fundo posicionado mostrando a pessoa. Falha da Vision → arte gerada com posição padrão normalmente.

**Rollback:** Remover chamada `detectSubjectPosition` (1 linha) → volta ao `LAYOUT_BG_POS` atual.

---

## Resumo

| # | Melhoria | Risco | Status CAST | Status Sunny Systems |
|---|----------|-------|-------------|----------------------|
| 1 | Hot reload `_clients.json` | Baixo | ✅ | ✅ (via nodemon) |
| 2 | Histórico no card | Baixo | ✅ | ✅ |
| 3 | Exportação ZIP | Baixo | ✅ `routes/cast.js` | ✅ `client-router.js` |
| 4 | Duplicar arte | Baixo | ✅ `routes/cast.js` | ✅ `client-router.js` |
| 5 | Persistência do título + palavras_azuis | Médio | ✅ | ✅ |
| 6 | Preview ao vivo no editor | Médio | ✅ | ✅ |
| 7 | Fila de geração por slug | Médio-Alto | ✅ | ✅ (lock interno por instância) |
| 8 | Feedback loop de aprovações | Baixo | ✅ `gerar-propostas-cast.js` | ✅ `handlePedido` |
| 9 | Sugestão de layout pelo LLM (`cena_visual`) | Médio | ✅ | ✅ |
| 10 | Seed + variações controladas | Médio | ✅ `routes/cast.js` | ✅ `client-router.js` |
| 11 | Detecção de similaridade | Médio | ✅ | ✅ |
| 12 | Crop inteligente por layout | Médio | ✅ `routes/cast.js` | ✅ `client-router.js` |

### Arquivos modificados

**CAST:**
- `_scripts/routes/cast.js` — fases 3, 4, 7, 10, 12
- `_scripts/gerar-propostas-cast.js` — fases 8, 9, 11
- `cast/index.html` — fases 2, 4, 10 (botão Variar), 11 (chip similaridade)

**Todos os clientes dinâmicos (Sunny Systems, futuros):**
- `_scripts/utils/client-router.js` — fases 3–12 completas
- `_scripts/utils/editor-v3-script.js` — fases 5, 6 (save URL e preview URL injetados)
- `_scripts/utils/editor-wrap.js` — propaga `save` e `previewUrl` para o editor
- `_scripts/utils/llm.js` — `generateImageGptImage1WithSeed`, `getEmbedding`, `detectSubjectPosition`
- `_scripts/utils/similaridade.js` — novo módulo (`cosineSimilarity`, `marcarSimilares`)
- `sunnysystems/index.html` — botão Variar, botão Duplicar, chip de similaridade
- `assets/css/gallery.css` — estilos `.modal-img-variar-btn`, `.prop-similar`

---

*Criado em 27 jun 2026. Concluído em 28 jun 2026 com porte completo para Sunny Systems.*
