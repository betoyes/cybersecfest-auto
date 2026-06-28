# Plano de Melhorias 2 — Studio CybersecFEST/CAST/Sunny Systems

> **Pré-requisito para a IA que executar este plano:**
> Leia `CLAUDE.md` e `HANDOFF.md` antes de começar. O `PLANO-MELHORIAS.md` (12 fases anteriores) já está 100% concluído — não repita nada de lá.
>
> Regra: `npm test` deve passar (46/46) após cada fase. Testar com `cd _scripts && npm test`.

---

## Contexto rápido

Este é um **Studio de geração de artes para redes sociais** com 3 produtos:
- **CybersecFEST** — artes estáticas em `/artes/{slug}/` (modo estático — gotcha ativo, ver Fase 2)
- **CybersecCAST** — pipeline via `routes/cast.js`, artes dinâmicas
- **Sunny Systems** — cliente genérico via `utils/client-router.js`, artes dinâmicas

Servidor local: `cd _scripts && npm run dev` → porta 8765.

---

## Fase 1 — Rota de calendário editorial para clientes dinâmicos *(bug ativo)*

**Risco:** Baixo | **Esforço:** 1h

**Problema:** `sunnysystems/index.html` chama `GET /api/sunnysystems/temas/calendario` mas essa rota não existe em `client-router.js`. A função `loadCalendarioEditorial()` falha silenciosamente toda vez.

**Arquivos tocados:**
- `_scripts/utils/client-router.js` — novo handler `handleCalendario` e rota em `dispatchClient`

**O que implementar:**
```js
// Em ClientRouter
handleCalendario(_req, res) {
  // Retorna estrutura mínima válida para o frontend não quebrar
  // O frontend (loadCalendarioEditorial) só exibe a barra se data.ok === true
  // Retornar ok: false é suficiente para suprimir o erro silencioso atual
  json(res, 200, { ok: false, erro: 'Calendário não configurado para este cliente' });
}
```

```js
// Em dispatchClient
if (req.method === 'GET' && urlPath === `${base}/temas/calendario`) return router.handleCalendario(req, res), true;
```

**Opção avançada:** Se o cliente tiver um `_brands/{slug}/calendario.json` com `{ segunda: { tipo_post, observacao }, quarta: ..., sexta: ... }`, carregar e retornar esse arquivo. Tornar opcional — sem o arquivo, retorna `ok: false`.

**Como testar:** Acessar `http://127.0.0.1:8765/sunnysystems/` → DevTools → Network → verificar que `/api/sunnysystems/temas/calendario` retorna 200 (não 404). Console sem erros de calendário.

---

## Fase 2 — FEST modo dinâmico *(elimina gotcha estrutural)*

**Risco:** Médio | **Esforço:** 3h

**Problema:** Artes FEST têm `arte.html` estático em disco. Qualquer mudança em `editor-wrap.js` ou `editor-v3-script.js` exige regenerar todas as artes FEST manualmente. CAST e Sunny Systems já são dinâmicos — este é o único produto que ainda sofre desse problema.

**Contexto:**
- Rota atual: `GET /artes/{slug}/arte.html` → `serveStatic` → arquivo em disco
- CAST intercepta antes de `serveStatic` via `handleCastArteHtmlDynamic`
- FEST não intercepta — cai no arquivo estático

**Arquivos tocados:**
- `_scripts/dev-server.js` — interceptar `GET /artes/{slug}/arte.html` para slugs FEST antes do `serveStatic`
- `_scripts/utils/` (possivelmente novo `buildArteHtmlFest` ou reutilizar `brand-renderer`)

**O que implementar:**
```js
// Em dev-server.js, no pipeline de routing, ANTES do serveStatic:
// Detectar slugs FEST: evento-*, blog-*, patrocinador-*, palestrante-*
const FEST_SLUG_RE = /^\/artes\/((?:evento|blog|patrocinador|palestrante)-[\w-]+)\/arte\.html$/;
const mFest = urlPath.match(FEST_SLUG_RE);
if (req.method === 'GET' && mFest) {
  return handleFestArteHtmlDynamic(req, res, mFest[1]);
}
```

```js
async function handleFestArteHtmlDynamic(req, res, slug) {
  // Similar a handleCastArteHtmlDynamic em routes/cast.js
  // 1. Ler arte de artes.json
  // 2. Ler fundo.png
  // 3. renderLayoutForBrand(slug, arte, FEST_BRAND)
  // 4. wrapWithEditor(simpleHtml, { slug, save: '/api/arte/salvar', back: '/fest/' })
  // 5. Retornar HTML
}
```

**Atenção:** O campo `back` deve ser `/fest/` (absoluto — gotcha 11 do CLAUDE.md). O `FEST_BRAND` pode ser importado de `_brands/cyberseccast/brand.js` ou definido inline com os tokens FEST (`#02050A`, `#14A8F4`, Ubuntu Bold).

**Verificar:** Conferir se `handleFestReaplicar` e `handleFestSalvarArte` em `dev-server.js` ainda precisam escrever `arte.html` em disco ou se podem ser simplificados após esta migração.

**Como testar:**
1. Abrir uma arte FEST pelo editor → funciona normalmente
2. Editar `editor-wrap.js` (ex: adicionar comentário HTML) → recarregar arte FEST → mudança reflete SEM regenerar
3. `npm test` passa (46/46)

---

## Fase 3 — Thumbnails assíncronos

**Risco:** Médio | **Esforço:** 2h

**Problema:** `gerarThumbComposto` (Puppeteer) leva 2–5s e bloqueia o response em todas as operações de criação/save/mudar imagem. Em `handleReaplicar` com 20+ artes, a espera total pode ser 100s+.

**Arquivos tocados:**
- `_scripts/utils/client-router.js` — todos os `await this._gerarThumb(...)` nas operações de criação
- `_scripts/routes/cast.js` — idem para CAST

**O que mudar:**

Remover `await` do `_gerarThumb` nas operações de criação (não no save, onde o usuário espera o thumb atualizado):

```js
// ANTES (bloqueia response):
fs.writeFileSync(artePath, this.buildArteHtml(arteSlug, arte, smartPos));
await this._gerarThumb(artePath, thumbPath);
json(res, 200, { ok: true, slug: arteSlug, ... });

// DEPOIS (não bloqueia):
fs.writeFileSync(artePath, this.buildArteHtml(arteSlug, arte, smartPos));
this._gerarThumb(artePath, thumbPath); // sem await — fire and forget
json(res, 200, { ok: true, slug: arteSlug, ... });
```

**Onde aplicar fire-and-forget:**
- `handleCriarArte` ✓
- `handleAprovarProposta` ✓
- `handleMudarImagem` ✓ (thumb atualiza em background; galeria já usa `?t=` para cache-bust)

**Onde MANTER `await`:**
- `handleSalvarArte` — o save é explícito e o usuário aguarda o thumb atualizado
- `handleReaplicar` — processo em lote onde o usuário aguarda o fim

**Como testar:** Criar arte → response imediato → thumb aparece na galeria ~2s depois (reload manual). Salvar arte → thumb atualiza imediatamente (comportamento atual mantido).

---

## Fase 4 — Cache de embeddings

**Risco:** Baixo | **Esforço:** 1h

**Problema:** `marcarSimilares` chama `getEmbedding(arteTexts)` a cada `handlePedido` — uma chamada à OpenAI com até 10 textos. Se o banco de artes não mudou desde o último pedido, o resultado seria idêntico.

**Arquivos tocados:**
- `_scripts/utils/client-router.js` — cache de embeddings por instância de `ClientRouter`

**O que implementar:**
```js
// No construtor:
this._embCache    = null; // { texts: string[], embeddings: float[][], at: number }
this._EMB_TTL     = 60_000; // 60s

// Novo método:
async _getArteEmbeddings(artes) {
  const texts = artes.map(a =>
    [(a.headline || ''), (a.subtitulo || '')].join(' ').replace(/<[^>]+>/g, ' ').trim()
  ).filter(Boolean);

  const now = Date.now();
  if (this._embCache &&
      now - this._embCache.at < this._EMB_TTL &&
      JSON.stringify(texts) === JSON.stringify(this._embCache.texts)) {
    return this._embCache.embeddings;
  }

  const { getEmbedding } = require('./llm');
  const embeddings = await getEmbedding(texts);
  this._embCache = { texts, embeddings, at: now };
  return embeddings;
}
```

Invalidar em `writeArtes`: `this._embCache = null;`

Adaptar `marcarSimilares` em `utils/similaridade.js` para aceitar embeddings pré-computados opcionalmente, ou passar o método como `getEmbeddingFn` já cacheado.

**Como testar:** Fazer 2 pedidos seguidos com o mesmo banco de artes → segundo pedido não faz chamada de embedding (verificar via log/DevTools Network).

---

## Fase 5 — `arte.html` no ZIP

**Risco:** Baixo | **Esforço:** 30min

**Problema:** `handleExportarZip` exporta `thumb.png` e `fundo.png` mas não o `arte.html` final — que é o arquivo mais útil para o cliente publicar.

**Arquivos tocados:**
- `_scripts/utils/client-router.js` — `handleExportarZip`
- `_scripts/routes/cast.js` — `handleCastExportarZip` (se existir lá também)

**O que adicionar:**
```js
// Dentro do loop for (const arte of artes):
const arteHtmlPath = path.join(dir, 'arte.html');
if (fs.existsSync(arteHtmlPath)) archive.file(arteHtmlPath, { name: `${arte.slug}/arte.html` });
```

**Atenção:** `arte.html` embute `fundo.png` como base64 — pode ser grande. Considerar incluir apenas se o arquivo existir em disco (para não quebrar slugs sem arte.html gerado).

**Como testar:** Fazer download do ZIP → descompactar → verificar que cada pasta de arte tem `arte.html` além de `thumb.png` e `fundo.png`.

---

## Fase 6 — Campo `publicado` e filtro na galeria

**Risco:** Médio | **Esforço:** 3h

**Problema:** Não existe distinção entre arte pronta-para-publicar e rascunho/teste. O campo `publicacao: 'backup'` existe para CAST mas não há equivalente genérico de "publicado" — o usuário não sabe o que já foi ao ar.

**Arquivos tocados:**
- `_scripts/utils/client-router.js` — `handleSalvarArte`: aceitar e persistir `publicado: true/false`
- `sunnysystems/index.html` — toggle "Marcar como publicado" no modal + filtro na galeria
- `cast/index.html` — idem

**Schema de dados (adição não-breaking):**
```json
{
  "slug": "sunnysystems-1234",
  "publicado": true,
  "publicado_em": "2026-06-28T10:00:00.000Z"
}
```

**UI sugerida:**
- Botão no modal: "✓ Publicado" (toggle) — chama `POST /api/{slug}/arte/salvar` com `{ slug, publicado: true }`
- Filtro na galeria: radio "Todas / Publicadas / Não publicadas"
- Card: badge sutil "✓" no canto quando `publicado: true`

**Como testar:** Marcar arte como publicada → badge aparece → filtro "Publicadas" mostra só essa arte. Desmarcar → volta ao estado anterior.

---

## Fase 7 — Seed visível e editável no modal

**Risco:** Baixo | **Esforço:** 1h

**Problema:** O seed da imagem gerada via `gpt-image-1` fica oculto em `state.json`. O usuário não sabe qual seed usou, não consegue anotar para reprodução futura, e não pode forçar um seed específico.

**Arquivos tocados:**
- `sunnysystems/index.html` — seção de "Mudar imagem" no modal
- `cast/index.html` — idem

**O que adicionar:**

No `openModal`, ao carregar `state.json` via uma chamada ao `GET /api/{slug}/arte/preview` (já existe):
```js
// Ao abrir modal, carregar seed atual:
const state = await fetch(`/artes/${slug}/state.json`).then(r => r.json()).catch(() => ({}));
if (state.seed) {
  document.getElementById('modal-img-seed').value = state.seed;
  document.getElementById('modal-seed-wrap').hidden = false;
}
```

HTML a adicionar na seção "Mudar imagem":
```html
<div id="modal-seed-wrap" hidden style="font-size:11px;color:var(--muted);margin-top:4px;">
  Seed: <input id="modal-img-seed" type="number" style="width:120px;background:transparent;border:none;color:var(--muted);" readonly>
  <button onclick="copySeed()" style="font-size:10px;">⎘</button>
</div>
```

**Extensão futura:** Aceitar seed manual no botão Variar (`variarCena(seed_manual)`).

**Como testar:** Gerar arte com Variar → seed aparece no modal → copiar → colar num pedido de imagem nova → resultado similar.

---

## Fase 8 — Validação de qualidade da imagem gerada

**Risco:** Médio | **Esforço:** 2h

**Problema:** Não há checagem se a imagem retornou aceitável. Casos reais: imagem completamente preta (falha silenciosa do Gemini), artefatos óbvios, texto indesejado baked na imagem.

**Arquivos tocados:**
- `_scripts/utils/llm.js` — nova função `validateImageQuality(imgBuffer)`
- `_scripts/utils/client-router.js` / `_scripts/routes/cast.js` — chamar após geração

**O que implementar:**
```js
async function validateImageQuality(imgBuffer) {
  // Verificação barata: tamanho mínimo (imagem preta = muito pequena em bytes)
  if (imgBuffer.length < 50_000) return { ok: false, motivo: 'imagem muito pequena (possível falha)' };

  // Verificação via vision (opcional, mais cara):
  try {
    const b64 = imgBuffer.toString('base64');
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 5,
      messages: [{ role: 'user', content: [
        { type: 'image_url', image_url: { url: `data:image/png;base64,${b64}`, detail: 'low' } },
        { type: 'text', text: 'Is this image completely black or clearly broken? Answer yes or no.' },
      ]}],
    });
    const answer = (res.choices[0]?.message?.content || '').trim().toLowerCase();
    if (answer.startsWith('yes')) return { ok: false, motivo: 'imagem preta ou quebrada (vision)' };
  } catch { /* falha silenciosa — não bloquear geração */ }

  return { ok: true };
}
```

Usar com 1 retry automático:
```js
let imgBuffer = await this._gerarImagem(arte, instrucao);
const valid = await validateImageQuality(imgBuffer);
if (!valid.ok) {
  console.warn(`⚠️ Imagem rejeitada (${valid.motivo}) — retentando...`);
  imgBuffer = await this._gerarImagem(arte, instrucao);
}
```

**Como testar:** Difícil de testar deterministicamente. Verificar que o check de tamanho (`< 50KB`) captura buffers vazios. Logar quando a validação rejeita uma imagem.

---

## Fase 9 — Layout como hint no prompt de imagem

**Risco:** Baixo | **Esforço:** 1h

**Problema:** `buildImagemPrompt` em `_brands/sunnysystems/imagem-prompt.js` e `_brands/cyberseccast/imagem-prompt.js` ignora o layout selecionado. Layout G (minimalista) deveria pedir imagem abstrata/texturizada; layout A (título grande) pode ter elemento humano em destaque.

**Arquivos tocados:**
- `_brands/sunnysystems/imagem-prompt.js`
- `_brands/cyberseccast/imagem-prompt.js`

**O que adicionar:**
```js
const LAYOUT_COMPOSITION_HINTS = {
  A: 'Full bleed background, human figure or bold abstract element centered',
  B: 'Abstract texture or gradient, no specific subject',
  C: 'Centered composition, depth of field, professional studio feel',
  G: 'Minimal, clean, dark background with subtle texture or light',
  // ... outros layouts conforme necessário
};

// Em buildImagemPrompt:
const layoutHint = LAYOUT_COMPOSITION_HINTS[(arte.layout || 'C').toUpperCase()];
if (layoutHint) prompt += ` Composition: ${layoutHint}.`;
```

**Como testar:** Gerar arte com layout G → imagem mais minimalista. Gerar com layout A → imagem com elemento central. Verificar subjetivamente — não há teste automatizado.

---

## Resumo e ordem de execução

| # | Melhoria | Tipo | Esforço | Prioridade |
|---|----------|------|---------|------------|
| 1 | Rota calendário (bug ativo) | Bug | 1h | 🔴 Alta |
| 2 | FEST modo dinâmico | Arquitetura | 3h | 🔴 Alta |
| 3 | Thumbnails assíncronos | Performance | 2h | 🟡 Média |
| 4 | Cache de embeddings | Performance | 1h | 🟡 Média |
| 5 | `arte.html` no ZIP | Funcionalidade | 30min | 🟢 Baixa |
| 6 | Campo publicado | Editorial | 3h | 🟡 Média |
| 7 | Seed visível no modal | UX | 1h | 🟢 Baixa |
| 8 | Validação de qualidade | Qualidade | 2h | 🟡 Média |
| 9 | Layout como hint no prompt | Qualidade | 1h | 🟢 Baixa |

**Executar nesta ordem** — cada fase é independente e pode ser interrompida/retomada.

---

*Criado em 28 jun 2026. Fase anterior (12 melhorias) concluída em PLANO-MELHORIAS.md.*
