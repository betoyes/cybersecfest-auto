'use strict';

// Dev local sempre grava no disco — antes de carregar storage
process.env.LOCAL_MODE = process.env.LOCAL_MODE || '1';
require('./load-env.js');

const http = require('http');
const fs   = require('fs');
const path = require('path');
const log  = require('./utils/log.js');
const { executarPedido, getEstadoPropostas } = require('./pedido-run.js');
const { aprovarLote, rejeitarLote, consumirBanco } = require('./aprovar-propostas.js');
const { upsertEditorState, extractEditorState } = require('./utils/editor-state.js');
const { gerarThumbComposto } = require('./utils/thumb-composto.js');
const { resolveArtePaths, promoteTemplatePadrao, isTemplateSlug } = require('./utils/template-padroes.js');
const { generateImage } = require('./utils/llm.js');
const { buildImagePrompt, validateLayout } = require('./utils/imagem-prompt.js');
const { renderLayout } = require('./utils/layouts.js');
const { wrapWithEditor } = require('./utils/editor-wrap.js');

const ROOT = path.join(__dirname, '..');
const PORT = Number(process.env.PORT || 8765);
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.zip':  'application/zip',
};

// --- serialização de operações longas ---
// busy é verificado sincronicamente antes de qualquer await,
// eliminando a race condition do booleano simples anterior.
let busy = false;

function setBusy(res) {
  if (busy) {
    json(res, 409, { ok: false, erro: 'Operação em andamento. Aguarde.' });
    return false;
  }
  busy = true;
  return true;
}

function clearBusy() { busy = false; }

// Slugs de motion com pedido recém-criado aguardando o worker iniciar
const motionPending = new Set();

// --- cache de artes.json ---
let artesCache = null;
let artesCacheAt = 0;
const ARTES_TTL = 10_000;

function readArtes() {
  const now = Date.now();
  if (artesCache && now - artesCacheAt < ARTES_TTL) return artesCache;
  artesCache = JSON.parse(fs.readFileSync(path.join(ROOT, 'artes.json'), 'utf8'));
  artesCacheAt = now;
  return artesCache;
}

function invalidateArtes() { artesCache = null; }

// ----------------------------------------

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function readBody(req, maxBytes = 2 * 1024 * 1024) {
  let body = '';
  let total = 0;
  for await (const chunk of req) {
    total += Buffer.byteLength(chunk);
    if (total > maxBytes) {
      req.destroy();
      const err = new Error('Payload too large');
      err.statusCode = 413;
      throw err;
    }
    body += chunk;
  }
  try {
    return JSON.parse(body || '{}');
  } catch {
    return null;
  }
}

function resolveStaticPath(urlPath) {
  let rel = urlPath === '/' ? 'home.html' : urlPath.replace(/^\//, '').replace(/\/$/, '');

  if (!rel) rel = 'index.html';

  let file = path.join(ROOT, rel);

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  } else if (!path.extname(rel)) {
    const indexCandidate = path.join(ROOT, rel, 'index.html');
    if (fs.existsSync(indexCandidate)) file = indexCandidate;
  }

  return file;
}

function serveStatic(req, res, urlPath) {
  const file = resolveStaticPath(urlPath);

  if (!file.startsWith(ROOT)) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404); return res.end('Not found');
    }
    const ext = path.extname(file).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    if (rel.startsWith('effects-preview/')) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers.Pragma = 'no-cache';
      headers.Expires = '0';
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

async function handlePedido(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

    log.info('Pedido:', payload.forcarPropostas ? 'forçar propostas' : 'fluxo normal', payload.tema?.slice(0, 40) || '');

    const resultado = await executarPedido({
      tipoPost:        payload.tipoPost,
      tema:            payload.tema,
      objetivo:        payload.objetivo || 'audiencia',
      forcarPropostas: !!payload.forcarPropostas,
      pularBanco:      !!payload.forcarPropostas,
    });

    log.info(`Pedido OK: modo=${resultado.modo}`);
    json(res, 200, { ok: true, ...resultado });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    log.error('Pedido falhou:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

async function handlePropostasGet(_req, res) {
  try {
    const estado = await getEstadoPropostas();
    json(res, 200, { ok: true, ...estado });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleAprovar(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload?.loteId || !payload?.principalId) {
      return json(res, 400, { ok: false, erro: 'loteId e principalId são obrigatórios' });
    }
    const resultado = await aprovarLote({
      loteId:            payload.loteId,
      principalId:       payload.principalId,
      bancoIds:          payload.bancoIds || [],
      edicoes:           payload.edicoes || {},
      gerarBackupVisual: !!payload.gerarBackupVisual,
    });
    json(res, 200, { ok: true, modo: 'visual_aprovado', ...resultado });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

async function handleRejeitar(req, res) {
  const payload = await readBody(req);
  if (!payload?.loteId) return json(res, 400, { ok: false, erro: 'loteId obrigatório' });
  try {
    await rejeitarLote(payload.loteId);
    json(res, 200, { ok: true });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleConsumirBanco(_req, res) {
  if (!setBusy(res)) return;
  try {
    const resultado = await consumirBanco({ gerarBackupVisual: false });
    if (!resultado) return json(res, 404, { ok: false, erro: 'Banco vazio' });
    json(res, 200, { ok: true, modo: 'visual_banco', ...resultado });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

async function handleSalvarArte(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

    const slug = String(payload.slug || '').trim();
    const state = payload.state;
    if (!slug || !state || typeof state !== 'object') {
      return json(res, 400, { ok: false, erro: 'slug e state são obrigatórios' });
    }
    if (!/^[\w-]+$/.test(slug)) {
      return json(res, 400, { ok: false, erro: 'slug inválido' });
    }

    const { artePath, thumbPath, isTemplate, layout } = resolveArtePaths(slug);
    if (!fs.existsSync(artePath)) {
      return json(res, 404, { ok: false, erro: `Arte não encontrada: ${slug}` });
    }

    const html = fs.readFileSync(artePath, 'utf8');
    const updated = upsertEditorState(html, state);
    fs.writeFileSync(artePath, updated);

    let thumbOk = false;
    let thumbAviso = null;
    try {
      await gerarThumbComposto(artePath, thumbPath);
      thumbOk = true;
    } catch (e) {
      thumbAviso = e.message;
    }

    let padraoInfo = null;
    if (isTemplate) {
      padraoInfo = promoteTemplatePadrao(slug, state);
    }

    log.info(`Editor salvo: ${slug}${thumbOk ? ' + thumb' : ''}${isTemplate ? ' · padrão layout ' + layout : ''}`);
    json(res, 200, {
      ok: true,
      slug,
      thumb: thumbOk,
      thumbAviso,
      padrao: !!isTemplate,
      layout: layout || undefined,
      message: isTemplate
        ? `Layout ${layout} salvo como padrão da galeria de templates.`
        : undefined,
    });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    log.error('Salvar arte:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

async function handleCampanha(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

    const { getJSON } = require('./utils/storage.js');
    const { criarLoteCampanha } = require('./gerar-campanha.js');
    const temasFile = await getJSON('temas.json');
    if (!temasFile) throw new Error('temas.json não encontrado');

    const lote = await criarLoteCampanha({
      objetivo:  payload.objetivo  || 'inscricoes',
      quantidade: payload.quantidade || 5,
      tema:      payload.tema?.trim() || '',
      temas:     temasFile.data,
    });

    json(res, 200, { ok: true, modo: 'campanha', lote });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

async function handleCampanhaExport(req, res, query) {
  const loteId = query.get('loteId') || '';
  if (!loteId) return json(res, 400, { ok: false, erro: 'loteId obrigatório' });

  try {
    const { loadStore } = require('./utils/propostas-store.js');
    const { exportCampanhaPack } = require('./utils/export-campanha-pack.js');
    const { data } = await loadStore();
    const lote = (data.lotes || []).find(l => l.id === loteId);
    if (!lote) return json(res, 404, { ok: false, erro: 'Lote não encontrado' });

    const zipPath = exportCampanhaPack(lote, ROOT);
    const rel = path.relative(ROOT, zipPath).split(path.sep).join('/');
    json(res, 200, { ok: true, url: `/${rel}`, path: rel, filename: path.basename(zipPath) });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleCalendario(_req, res) {
  try {
    const { getJSON } = require('./utils/storage.js');
    const temasFile = await getJSON('temas.json');
    if (!temasFile) return json(res, 404, { ok: false, erro: 'temas.json não encontrado' });
    const cal = temasFile.data.calendario_editorial || {};
    json(res, 200, { ok: true, calendario: cal, historico: (temasFile.data.historico_recente || []).slice(-8) });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

// ── Versões de imagem ────────────────────────────────────────────
function imgVersDir(slug) {
  return path.join(ROOT, 'artes', slug, 'img-versoes');
}
function imgVersIndexPath(slug) {
  return path.join(imgVersDir(slug), 'index.json');
}
function readImgVersoes(slug) {
  const p = imgVersIndexPath(slug);
  if (!fs.existsSync(p)) return { ativa: null, versoes: [] };
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return { ativa: null, versoes: [] }; }
}
function writeImgVersoes(slug, data) {
  fs.mkdirSync(imgVersDir(slug), { recursive: true });
  fs.writeFileSync(imgVersIndexPath(slug), JSON.stringify(data, null, 2) + '\n');
}
function nextImgVersId(data) {
  if (!data.versoes.length) return 1;
  return Math.max(...data.versoes.map(v => v.id)) + 1;
}
function saveImgVersion(slug, fundoPath, thumbPath, label) {
  const data = readImgVersoes(slug);
  const id   = nextImgVersId(data);
  const vDir = path.join(imgVersDir(slug), `v${id}`);
  fs.mkdirSync(vDir, { recursive: true });
  if (fs.existsSync(fundoPath)) fs.copyFileSync(fundoPath, path.join(vDir, 'fundo.png'));
  if (fs.existsSync(thumbPath)) fs.copyFileSync(thumbPath, path.join(vDir, 'thumb.png'));
  data.versoes.push({ id, criada_em: new Date().toISOString(), label: label || '' });
  data.ativa = id;
  writeImgVersoes(slug, data);
  return { data, id };
}

// background-position padrão por layout — alinhado ao focusId do LAYOUT_IMAGE_RULES
const LAYOUT_BG_POS = {
  A: { x: 75, y: 40 },  // direita, levemente acima
  B: { x: 15, y: 50 },  // esquerda
  C: { x: 85, y: 50 },  // direita
  D: { x: 50, y: 50 },  // centro
  E: { x: 80, y: 50 },  // direita
  F: { x: 80, y: 50 },  // direita
  G: { x: 50, y: 30 },  // centro, topo (magazine cover)
  H: { x: 50, y: 35 },  // centro-superior
  I: { x: 20, y: 50 },  // esquerda
  J: { x: 50, y: 50 },  // centro entre horizontais
  K: { x: 50, y: 50 },  // centro entre verticais
  L: { x: 50, y: 50 },  // centro entre zonas
  M: { x: 75, y: 40 },  // direita, acima
  N: { x: 80, y: 30 },  // direita, topo
  O: { x: 50, y: 65 },  // centro-inferior (spotlight)
  P: { x: 50, y: 35 },  // centro-superior
  Q: { x: 50, y: 50 },  // laterais — centralizado no total
};

function buildArteHtml(slug, arte, imgBuffer, artePath, resetBgPos = false) {
  const layout = (arte.layout || (arte.tipo === 'evento' ? 'E' : arte.tipo === 'patrocinador' ? 'F' : 'C')).toUpperCase();
  validateLayout(layout);
  const imageBase64 = imgBuffer.toString('base64');
  let editorState = fs.existsSync(artePath) ? extractEditorState(fs.readFileSync(artePath, 'utf8')) : null;
  // Ao trocar a imagem, reseta posição/zoom para o padrão do layout mas preserva ajustes de texto/elementos
  if (resetBgPos) {
    const pos = LAYOUT_BG_POS[layout] || { x: 50, y: 50 };
    editorState = { ...(editorState || {}), x: pos.x, y: pos.y, z: 100 };
  }
  const simpleHtml  = renderLayout(layout, {
    imageBase64,
    headline:        arte.headline,
    subtitulo:       arte.subtitulo || '',
    palavrasAzuis:   arte.palavras_azuis || '',
    nomePalestrante: arte.nome_palestrante || '',
    cargoEmpresa:    arte.cargo_empresa || '',
  });
  return { html: wrapWithEditor(simpleHtml, { layout, headline: arte.headline, slug, editorState }), layout };
}

async function handleMudarImagem(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    const slug = String(payload?.slug || '').trim();
    const instrucao = String(payload?.instrucao || '').trim();

    if (!slug || !/^[\w-]+$/.test(slug)) return json(res, 400, { ok: false, erro: 'slug inválido' });
    if (!instrucao) return json(res, 400, { ok: false, erro: 'instrucao é obrigatória' });

    const artes = readArtes();
    const arte = artes.find(a => a.slug === slug);
    if (!arte) return json(res, 404, { ok: false, erro: `Arte não encontrada: ${slug}` });

    const { artePath, thumbPath } = resolveArtePaths(slug);
    if (!fs.existsSync(artePath)) return json(res, 404, { ok: false, erro: 'arte.html não encontrada' });

    const layout = (arte.layout || (arte.tipo === 'evento' ? 'E' : arte.tipo === 'patrocinador' ? 'F' : 'C')).toUpperCase();
    validateLayout(layout);

    const slugDir   = path.join(ROOT, 'artes', slug);
    const fundoPath = path.join(slugDir, 'fundo.png');

    // Salvar versão atual — extrai imagem do arte.html se fundo.png não existe
    const versoesBefore = readImgVersoes(slug);
    if (versoesBefore.versoes.length === 0) {
      let savedOriginal = false;
      if (fs.existsSync(fundoPath)) {
        saveImgVersion(slug, fundoPath, thumbPath, 'Original');
        savedOriginal = true;
      } else {
        // Imagem embutida como base64 no arte.html — extrair antes de sobrescrever
        try {
          const html = fs.readFileSync(artePath, 'utf8');
          const m = html.match(/id="art-bg"[^>]*background-image:\s*url\(['"]?data:image\/[^;]+;base64,([^'")\s]+)/);
          if (m?.[1]) {
            fs.mkdirSync(slugDir, { recursive: true });
            fs.writeFileSync(fundoPath, Buffer.from(m[1], 'base64'));
            saveImgVersion(slug, fundoPath, thumbPath, 'Original');
            savedOriginal = true;
            log.info(`Imagem original extraída do arte.html e salva como v1 para ${slug}`);
          }
        } catch (ex) {
          log.warn(`Não foi possível extrair imagem original de ${slug}:`, ex.message);
        }
      }
      if (!savedOriginal) {
        // Salvar apenas o thumb como referência visual da versão original
        const vDir = path.join(imgVersDir(slug), 'v1');
        fs.mkdirSync(vDir, { recursive: true });
        if (fs.existsSync(thumbPath)) fs.copyFileSync(thumbPath, path.join(vDir, 'thumb.png'));
        const d = { ativa: 1, versoes: [{ id: 1, criada_em: new Date().toISOString(), label: 'Original' }] };
        writeImgVersoes(slug, d);
        log.info(`Thumb original salvo como v1 (sem fundo.png) para ${slug}`);
      }
    }

    // userScene injeta a instrução do usuário como SCENE, mantendo layout/estilo/marca intactos
    const prompt = buildImagePrompt({
      tipo:           arte.tipo,
      layout,
      contextoVisual: arte.contexto_visual || '',
      slug,
      cidade:         arte.cidade || 'BH',
      userScene:      instrucao,
    });
    log.info(`Mudar imagem: ${slug} — ${instrucao}`);

    const imgBuffer = await generateImage(prompt, {
      tipo:           arte.tipo,
      layout,
      contextoVisual: arte.contexto_visual || '',
      cidade:         arte.cidade || 'BH',
      useReferences:  false, // instrução do usuário é o sujeito — referências de estilo sobrescreveriam
    });

    fs.mkdirSync(slugDir, { recursive: true });
    fs.writeFileSync(fundoPath, imgBuffer);
    log.info(`fundo.png atualizado (${Math.round(imgBuffer.length / 1024)} KB)`);

    const { html } = buildArteHtml(slug, arte, imgBuffer, artePath, true);
    fs.writeFileSync(artePath, html);
    await gerarThumbComposto(artePath, thumbPath);
    log.info(`thumb regenerado: ${slug}`);

    // Salvar nova versão
    const { data: versoesAfter, id: novaId } = saveImgVersion(slug, fundoPath, thumbPath, instrucao.slice(0, 80));

    json(res, 200, {
      ok: true,
      slug,
      thumb: `/artes/${slug}/thumb.png?t=${Date.now()}`,
      versoes: versoesAfter,
    });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    log.error('Mudar imagem falhou:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

async function handleImgVersoesGet(req, res, searchParams) {
  const slug = String(searchParams.get('slug') || '').trim();
  if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });
  const data = readImgVersoes(slug);
  json(res, 200, { ok: true, ...data });
}

async function handleAtivarImgVersao(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    const slug = String(payload?.slug || '').trim();
    const id   = Number(payload?.id);

    if (!slug || !/^[\w-]+$/.test(slug)) return json(res, 400, { ok: false, erro: 'slug inválido' });
    if (!id) return json(res, 400, { ok: false, erro: 'id obrigatório' });

    const data = readImgVersoes(slug);
    const ver  = data.versoes.find(v => v.id === id);
    if (!ver) return json(res, 404, { ok: false, erro: `Versão ${id} não encontrada` });

    const vDir      = path.join(imgVersDir(slug), `v${id}`);
    const vFundo    = path.join(vDir, 'fundo.png');
    if (!fs.existsSync(vFundo)) return json(res, 404, { ok: false, erro: `Imagem da versão ${id} não disponível para restaurar (versão salva apenas como thumbnail)` });

    const artes  = readArtes();
    const arte   = artes.find(a => a.slug === slug);
    if (!arte) return json(res, 404, { ok: false, erro: 'Arte não encontrada' });

    const { artePath, thumbPath } = resolveArtePaths(slug);
    const slugDir   = path.join(ROOT, 'artes', slug);
    const fundoPath = path.join(slugDir, 'fundo.png');

    const imgBuffer = fs.readFileSync(vFundo);
    fs.writeFileSync(fundoPath, imgBuffer);

    const { html } = buildArteHtml(slug, arte, imgBuffer, artePath, true);
    fs.writeFileSync(artePath, html);
    await gerarThumbComposto(artePath, thumbPath);

    data.ativa = id;
    writeImgVersoes(slug, data);
    log.info(`Imagem ativada: ${slug} → v${id}`);

    json(res, 200, {
      ok: true,
      slug,
      thumb: `/artes/${slug}/thumb.png?t=${Date.now()}`,
      versoes: data,
    });
  } catch (e) {
    log.error('Ativar versão imagem falhou:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

async function handleDeletarImgVersao(req, res) {
  try {
    const payload = await readBody(req);
    const slug = String(payload?.slug || '').trim();
    const id   = Number(payload?.id);

    if (!slug || !/^[\w-]+$/.test(slug)) return json(res, 400, { ok: false, erro: 'slug inválido' });
    if (!id) return json(res, 400, { ok: false, erro: 'id obrigatório' });

    const data = readImgVersoes(slug);
    if (data.versoes.length <= 1) return json(res, 400, { ok: false, erro: 'Não é possível deletar a única versão' });
    if (!data.versoes.find(v => v.id === id)) return json(res, 404, { ok: false, erro: `Versão ${id} não encontrada` });
    if (data.ativa === id) return json(res, 400, { ok: false, erro: 'Não é possível deletar a versão ativa. Ative outra primeiro.' });

    const vDir = path.join(imgVersDir(slug), `v${id}`);
    if (fs.existsSync(vDir)) fs.rmSync(vDir, { recursive: true, force: true });

    data.versoes = data.versoes.filter(v => v.id !== id);
    writeImgVersoes(slug, data);
    log.info(`Versão de imagem deletada: ${slug} v${id}`);

    json(res, 200, { ok: true, versoes: data });
  } catch (e) {
    log.error('Deletar versão imagem falhou:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleDeletarArte(req, res) {
  const payload = await readBody(req);
  if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

  const slug = String(payload.slug || '').trim();
  if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });

  try {
    const { removerArte } = require('./utils/remover-arte.js');
    const resultado = await removerArte(slug);
    invalidateArtes();
    log.info(`Arte removida: ${slug}`);
    json(res, 200, { ok: true, ...resultado });
  } catch (e) {
    log.error('Deletar arte:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleMotionSelecionar(req, res) {
  const payload = await readBody(req);
  if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
  const slug = String(payload.slug || '').trim();
  const version = Number(payload.version);
  if (!slug || !Number.isFinite(version)) {
    return json(res, 400, { ok: false, erro: 'slug e version obrigatórios' });
  }
  try {
    const { setPreview } = require('./utils/motion-versoes.js');
    const data = setPreview(slug, ROOT, version);
    log.info(`Motion preview: ${slug} → v${version}`);
    json(res, 200, { ok: true, versions: data });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleMotionAprovarMp4(req, res) {
  const payload = await readBody(req);
  if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
  const slug = String(payload.slug || '').trim();
  const version = Number(payload.version);
  if (!slug || !Number.isFinite(version)) {
    return json(res, 400, { ok: false, erro: 'slug e version obrigatórios' });
  }
  try {
    const { setMp4From } = require('./utils/motion-versoes.js');
    const { resolveMp4ForVersion } = require('./utils/motion-mp4.js');
    const data = setMp4From(slug, ROOT, version);
    const resolved = resolveMp4ForVersion(slug, ROOT, version);
    log.info(`Motion MP4 aprovado: ${slug} → v${version}`);
    json(res, 200, {
      ok: true,
      versions: data,
      mp4: resolved?.mp4 || null,
    });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleMotionMp4Get(req, res, searchParams) {
  const slug = String(searchParams.get('slug') || '').trim();
  const version = Number(searchParams.get('version'));
  if (!slug || !Number.isFinite(version)) {
    return json(res, 400, { ok: false, erro: 'slug e version obrigatórios' });
  }
  try {
    const { resolveMp4ForVersion } = require('./utils/motion-mp4.js');
    const resolved = resolveMp4ForVersion(slug, ROOT, version);
    if (!resolved) return json(res, 404, { ok: false, erro: 'Sem versões motion' });
    json(res, 200, { ok: true, ...resolved });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleMotionDeletar(req, res) {
  const payload = await readBody(req);
  if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
  const slug = String(payload.slug || '').trim();
  const version = Number(payload.version);
  if (!slug || !Number.isFinite(version)) {
    return json(res, 400, { ok: false, erro: 'slug e version obrigatórios' });
  }
  try {
    const { deleteVersion } = require('./utils/motion-versoes.js');
    const data = deleteVersion(slug, ROOT, version);
    log.info(`Motion versão removida: ${slug} → v${version}`);
    json(res, 200, { ok: true, versions: data });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleMotionVersoesGet(req, res, searchParams) {
  const slug = String(searchParams.get('slug') || '').trim();
  if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });
  try {
    const { readVersions } = require('./utils/motion-versoes.js');
    const data = readVersions(slug, ROOT);
    if (!data) return json(res, 404, { ok: false, erro: 'Sem versões motion' });
    json(res, 200, { ok: true, versions: data });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleMotionPedidoPost(req, res) {
  const payload = await readBody(req);
  if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
  const slug = String(payload.slug || '').trim();
  const mode = payload.mode === 'ajustar' ? 'ajustar' : 'surpresa';
  const instrucoes = String(payload.instrucoes || '').trim();
  const baseVersion = payload.baseVersion != null ? Number(payload.baseVersion) : null;
  const presetId = payload.presetId ? String(payload.presetId).trim() : null;

  if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });
  if (mode === 'ajustar' && !instrucoes) {
    return json(res, 400, { ok: false, erro: 'Descreva o que mudar' });
  }

  // Evita dois pedidos simultâneos para o mesmo slug antes do worker iniciar
  if (motionPending.has(slug)) {
    return json(res, 409, { ok: false, erro: 'Geração em andamento para este post. Aguarde.' });
  }

  try {
    const { createPedido } = require('./utils/motion-pedidos.js');
    const { PRESET_IDS } = require('./utils/motion-presets.js');
    if (presetId && !PRESET_IDS.includes(presetId)) {
      return json(res, 400, { ok: false, erro: 'Preset inválido ou não automatizado: ' + presetId });
    }
    const pedido = createPedido(slug, ROOT, { mode, instrucoes, baseVersion, presetId });

    motionPending.add(slug);
    // Libera o lock após o worker ter tempo de atualizar o status para 'processing'
    setTimeout(() => motionPending.delete(slug), 8000);

    const { spawn } = require('child_process');
    const worker = path.join(__dirname, 'motion-pedido-run.js');
    spawn(process.execPath, [worker, '--slug', slug, '--pedido-id', pedido.id], {
      detached: true,
      stdio: 'ignore',
      cwd: __dirname,
    }).unref();

    log.info(`Motion pedido: ${slug} → v${pedido.targetVersion} (${mode}${presetId ? ' · ' + presetId : ''})`);
    json(res, 200, { ok: true, pedido });
  } catch (e) {
    motionPending.delete(slug);
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleMotionPresetsGet(req, res, searchParams) {
  const slug = String(searchParams.get('slug') || '').trim();
  try {
    const { listPresets } = require('./utils/motion-presets.js');
    const { readVersions } = require('./utils/motion-versoes.js');
    let used = [];
    if (slug) {
      const versions = readVersions(slug, ROOT);
      if (versions) used = versions.versions.map(v => v.preset).filter(Boolean);
    }
    json(res, 200, { ok: true, presets: listPresets(used) });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleMotionPedidoGet(req, res, searchParams) {
  const slug = String(searchParams.get('slug') || '').trim();
  if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });
  try {
    const { getActivePedido, readPedidos } = require('./utils/motion-pedidos.js');
    const pedidos = readPedidos(slug, ROOT);
    const pedido = getActivePedido(slug, ROOT) || pedidos.slice(-1)[0] || null;
    json(res, 200, { ok: true, pedido, pedidos: pedidos.slice(-5) });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

// ════════════════════════════════════════════════════════════════
// CYBERSEC.CAST — Brand-specific routes (puramente aditivo)
// Dados: artes-cast.json | Slugs: cast-* | Brand: _brands/cyberseccast
// ════════════════════════════════════════════════════════════════

const CAST_BRAND = require('../_brands/cyberseccast/brand.js');
const { buildCastImagePrompt } = require('../_brands/cyberseccast/imagem-prompt.js');
const { getReferencePartsForGenerationCast } = require('./utils/reference-images.js');
const { CAST_STYLE_REF_INSTRUCTION } = require('../_brands/cyberseccast/imagem-prompt.js');
const { renderLayoutForBrand } = require('./utils/brand-renderer.js');
const { executarPedidoCast, getEstadoPropostasCast } = require('./pedido-run-cast.js');
const { aprovarLoteCast, rejeitarLoteCast, consumirBancoCast } = require('./aprovar-propostas-cast.js');
const { criarLoteCampanhaCast } = require('./gerar-campanha-cast.js');

const CAST_ARTES_FILE = path.join(ROOT, 'artes-cast.json');
let castArtesCache = null;
let castArtesCacheAt = 0;

function readArtesCast() {
  const now = Date.now();
  if (castArtesCache && now - castArtesCacheAt < ARTES_TTL) return castArtesCache;
  if (!fs.existsSync(CAST_ARTES_FILE)) { castArtesCache = []; castArtesCacheAt = now; return []; }
  castArtesCache = JSON.parse(fs.readFileSync(CAST_ARTES_FILE, 'utf8'));
  castArtesCacheAt = now;
  return castArtesCache;
}

function writeArtesCast(artes) {
  fs.writeFileSync(CAST_ARTES_FILE, JSON.stringify(artes, null, 2) + '\n');
  castArtesCache = artes;
  castArtesCacheAt = Date.now();
}

function invalidateArtesCast() { castArtesCache = null; }

function readCastEditorState(slug) {
  const stateFile = path.join(ROOT, 'artes', slug, 'state.json');
  if (fs.existsSync(stateFile)) {
    try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { /* corrupto */ }
  }
  // fallback: extrai do arte.html legado (artes antigas antes do modo híbrido)
  const arteLegado = path.join(ROOT, 'artes', slug, 'arte.html');
  if (fs.existsSync(arteLegado)) {
    return extractEditorState(fs.readFileSync(arteLegado, 'utf8'));
  }
  return null;
}

function writeCastEditorState(slug, state) {
  const dir = path.join(ROOT, 'artes', slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'state.json'), JSON.stringify(state));
}

function buildArteHtmlCast(slug, arte, imgBuffer, _artePath, resetBgPos = false) {
  const layout = (arte.layout || 'C').toUpperCase();
  validateLayout(layout);
  const imageBase64 = imgBuffer.toString('base64');
  let editorState = readCastEditorState(slug);
  if (resetBgPos) {
    const pos = LAYOUT_BG_POS[layout] || { x: 50, y: 50 };
    editorState = { ...(editorState || {}), x: pos.x, y: pos.y, z: 100 };
  }
  const simpleHtml = renderLayoutForBrand(slug, {
    layout,
    imageBase64,
    headline:        arte.headline,
    subtitulo:       arte.subtitulo || '',
    palavrasAzuis:   arte.palavras_azuis || '',
    nomePalestrante: arte.nome_palestrante || '',
    cargoEmpresa:    arte.cargo_empresa || '',
  }, CAST_BRAND);
  return { html: wrapWithEditor(simpleHtml, { layout, headline: arte.headline, slug, editorState, back: '../../cast/' }), layout };
}

// GET /api/cast/artes
async function handleCastArtesList(_req, res) {
  try {
    json(res, 200, { ok: true, artes: readArtesCast() });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

// POST /api/cast/arte/criar — cria uma arte CAST manualmente (sem fluxo de propostas)
async function handleCastCriarArte(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

    const slug = `cast-${Date.now()}`;
    const layout = String(payload.layout || 'C').toUpperCase();
    validateLayout(layout);

    const arte = {
      slug,
      tipo: payload.tipo || 'episodio',
      layout,
      headline: String(payload.headline || 'NOVA ARTE CAST').trim(),
      subtitulo: String(payload.subtitulo || '').trim(),
      palavras_azuis: String(payload.palavras_azuis || '').trim(),
      contexto_visual: String(payload.contexto_visual || '').trim(),
      legenda: String(payload.legenda || '').trim(),
      criado_em: new Date().toISOString(),
      brand: 'cyberseccast',
    };

    const prompt = buildCastImagePrompt({
      tipo: arte.tipo,
      layout,
      userScene: arte.contexto_visual || undefined,
      contextoVisual: arte.contexto_visual || '',
      slug,
    });

    log.info(`CAST — Criar arte: ${slug} [${layout}]`);

    const castRefs = getReferencePartsForGenerationCast({ max: 3 });
    if (castRefs.paths.length) log.info(`CAST refs: ${castRefs.paths.map(p => path.basename(p)).join(', ')}`);

    const imgBuffer = await generateImage(prompt, {
      tipo: arte.tipo,
      layout,
      useReferences: false,
      _referenceParts: castRefs.parts,
      _styleInstruction: castRefs.parts.length ? CAST_STYLE_REF_INSTRUCTION : null,
    });

    const slugDir   = path.join(ROOT, 'artes', slug);
    const artePath  = path.join(slugDir, 'arte.html');
    const thumbPath = path.join(slugDir, 'thumb.png');
    const fundoPath = path.join(slugDir, 'fundo.png');

    fs.mkdirSync(slugDir, { recursive: true });
    fs.writeFileSync(fundoPath, imgBuffer);

    const { html } = buildArteHtmlCast(slug, arte, imgBuffer, artePath, true);
    fs.writeFileSync(artePath, html);

    try { await gerarThumbComposto(artePath, thumbPath); } catch (e) { log.warn('thumb CAST:', e.message); }

    const artes = readArtesCast();
    artes.unshift(arte);
    writeArtesCast(artes);

    log.info(`CAST arte criada: ${slug}`);
    json(res, 200, { ok: true, slug, arte, thumb: `/artes/${slug}/thumb.png?t=${Date.now()}` });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    log.error('Criar arte CAST:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// POST /api/cast/arte/salvar
// Modo híbrido: salva state.json separado (não reescreve arte.html)
// O arte.html é gerado dinamicamente por handleCastArteHtmlDynamic
async function handleCastSalvarArte(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

    const slug = String(payload.slug || '').trim();
    const state = payload.state;
    if (!slug || !state || typeof state !== 'object') {
      return json(res, 400, { ok: false, erro: 'slug e state são obrigatórios' });
    }
    if (!/^[\w-]+$/.test(slug)) return json(res, 400, { ok: false, erro: 'slug inválido' });
    const subtitleRaw = typeof payload.subtitle === 'string' ? payload.subtitle : null;

    const slugDir   = path.join(ROOT, 'artes', slug);
    const fundoPath = path.join(slugDir, 'fundo.png');
    const thumbPath = path.join(slugDir, 'thumb.png');
    if (!fs.existsSync(fundoPath)) return json(res, 404, { ok: false, erro: `Arte não encontrada: ${slug}` });

    // Salva estado no state.json separado
    writeCastEditorState(slug, state);

    // Atualiza subtitle em artes-cast.json se enviado
    if (subtitleRaw !== null) {
      const artes = readArtesCast();
      const idx = artes.findIndex(a => a.slug === slug);
      if (idx >= 0) {
        artes[idx].subtitulo = subtitleRaw;
        writeArtesCast(artes);
      }
    }

    // Regera thumb renderizando dinamicamente e gravando arte.html temporariamente
    let thumbOk = false;
    try {
      const artes = readArtesCast();
      const arte  = artes.find(a => a.slug === slug);
      if (arte) {
        const imgBuffer = fs.readFileSync(fundoPath);
        const artePath  = path.join(slugDir, 'arte.html');
        const { html }  = buildArteHtmlCast(slug, arte, imgBuffer, artePath, false);
        fs.writeFileSync(artePath, html);
        await gerarThumbComposto(artePath, thumbPath);
        thumbOk = true;
      }
    } catch { /* thumb não é crítico */ }

    log.info(`CAST state salvo: ${slug}${thumbOk ? ' + thumb' : ''}`);
    json(res, 200, { ok: true, slug, thumb: thumbOk });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    log.error('Salvar arte CAST:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// POST /api/cast/arte/imagem/mudar
async function handleCastMudarImagem(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    const slug     = String(payload?.slug || '').trim();
    const instrucao = String(payload?.instrucao || '').trim();

    if (!slug || !/^[\w-]+$/.test(slug)) return json(res, 400, { ok: false, erro: 'slug inválido' });
    if (!instrucao) return json(res, 400, { ok: false, erro: 'instrucao é obrigatória' });

    const artes = readArtesCast();
    const arte  = artes.find(a => a.slug === slug);
    if (!arte) return json(res, 404, { ok: false, erro: `Arte CAST não encontrada: ${slug}` });

    const layout    = (arte.layout || 'C').toUpperCase();
    const slugDir   = path.join(ROOT, 'artes', slug);
    const artePath  = path.join(slugDir, 'arte.html');
    const thumbPath = path.join(slugDir, 'thumb.png');
    const fundoPath = path.join(slugDir, 'fundo.png');

    if (!fs.existsSync(artePath)) return json(res, 404, { ok: false, erro: 'arte.html não encontrada' });

    const versoesBefore = readImgVersoes(slug);
    if (versoesBefore.versoes.length === 0) {
      if (fs.existsSync(fundoPath)) {
        saveImgVersion(slug, fundoPath, thumbPath, 'Original');
      } else {
        try {
          const html = fs.readFileSync(artePath, 'utf8');
          const m = html.match(/id="art-bg"[^>]*background-image:\s*url\(['"]?data:image\/[^;]+;base64,([^'")\s]+)/);
          if (m?.[1]) {
            fs.mkdirSync(slugDir, { recursive: true });
            fs.writeFileSync(fundoPath, Buffer.from(m[1], 'base64'));
            saveImgVersion(slug, fundoPath, thumbPath, 'Original');
            log.info(`CAST imagem original extraída: ${slug}`);
          }
        } catch (ex) {
          log.warn(`CAST não foi possível extrair imagem original de ${slug}:`, ex.message);
        }
      }
    }

    const prompt = buildCastImagePrompt({
      tipo:           arte.tipo || 'episodio',
      layout,
      userScene:      instrucao,
      contextoVisual: instrucao,
      slug,
    });

    log.info(`CAST mudar imagem: ${slug} — ${instrucao}`);

    const castRefs2 = getReferencePartsForGenerationCast({ max: 3 });
    if (castRefs2.paths.length) log.info(`CAST refs: ${castRefs2.paths.map(p => path.basename(p)).join(', ')}`);

    const imgBuffer = await generateImage(prompt, {
      tipo: arte.tipo || 'episodio',
      layout,
      useReferences: false,
      _referenceParts: castRefs2.parts,
      _styleInstruction: castRefs2.parts.length ? CAST_STYLE_REF_INSTRUCTION : null,
    });

    fs.mkdirSync(slugDir, { recursive: true });
    fs.writeFileSync(fundoPath, imgBuffer);
    log.info(`CAST fundo.png atualizado (${Math.round(imgBuffer.length / 1024)} KB)`);

    const { html } = buildArteHtmlCast(slug, arte, imgBuffer, artePath, true);
    fs.writeFileSync(artePath, html);
    await gerarThumbComposto(artePath, thumbPath);

    const { data: versoesAfter } = saveImgVersion(slug, fundoPath, thumbPath, instrucao.slice(0, 80));

    json(res, 200, {
      ok: true,
      slug,
      thumb: `/artes/${slug}/thumb.png?t=${Date.now()}`,
      versoes: versoesAfter,
    });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    log.error('CAST mudar imagem falhou:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// GET /api/cast/arte/imagem/versoes
async function handleCastImgVersoesGet(_req, res, searchParams) {
  const slug = String(searchParams.get('slug') || '').trim();
  if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });
  json(res, 200, { ok: true, ...readImgVersoes(slug) });
}

// POST /api/cast/arte/imagem/versao/ativar
async function handleCastAtivarImgVersao(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    const slug = String(payload?.slug || '').trim();
    const id   = Number(payload?.id);
    if (!slug || !/^[\w-]+$/.test(slug)) return json(res, 400, { ok: false, erro: 'slug inválido' });
    if (!id) return json(res, 400, { ok: false, erro: 'id obrigatório' });

    const data  = readImgVersoes(slug);
    const ver   = data.versoes.find(v => v.id === id);
    if (!ver) return json(res, 404, { ok: false, erro: `Versão ${id} não encontrada` });

    const vFundo = path.join(imgVersDir(slug), `v${id}`, 'fundo.png');
    if (!fs.existsSync(vFundo)) return json(res, 404, { ok: false, erro: `fundo.png da versão ${id} não disponível` });

    const artes = readArtesCast();
    const arte  = artes.find(a => a.slug === slug);
    if (!arte) return json(res, 404, { ok: false, erro: 'Arte CAST não encontrada' });

    const artePath  = path.join(ROOT, 'artes', slug, 'arte.html');
    const thumbPath = path.join(ROOT, 'artes', slug, 'thumb.png');
    const fundoPath = path.join(ROOT, 'artes', slug, 'fundo.png');

    const imgBuffer = fs.readFileSync(vFundo);
    fs.writeFileSync(fundoPath, imgBuffer);

    const { html } = buildArteHtmlCast(slug, arte, imgBuffer, artePath, true);
    fs.writeFileSync(artePath, html);
    await gerarThumbComposto(artePath, thumbPath);

    data.ativa = id;
    writeImgVersoes(slug, data);
    log.info(`CAST imagem ativada: ${slug} → v${id}`);

    json(res, 200, { ok: true, slug, thumb: `/artes/${slug}/thumb.png?t=${Date.now()}`, versoes: data });
  } catch (e) {
    log.error('CAST ativar versão:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// GET /artes/cast-*/arte.html — renderiza dinamicamente a partir de fundo.png + artes-cast.json + state.json
// Qualquer mudança em brand-renderer / layouts reflete automaticamente sem regenerar a arte
async function handleCastArteHtmlDynamic(req, res, slug) {
  try {
    const artes = readArtesCast();
    const arte  = artes.find(a => a.slug === slug);
    if (!arte) { res.writeHead(404); return res.end('Arte CAST não encontrada'); }

    const fundoPath = path.join(ROOT, 'artes', slug, 'fundo.png');
    if (!fs.existsSync(fundoPath)) {
      // arte antiga sem fundo.png: serve arte.html estático como fallback
      const arteLegado = path.join(ROOT, 'artes', slug, 'arte.html');
      if (fs.existsSync(arteLegado)) {
        const data = fs.readFileSync(arteLegado);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        return res.end(data);
      }
      res.writeHead(404); return res.end('fundo.png não encontrado');
    }

    const imgBuffer = fs.readFileSync(fundoPath);
    const artePath  = path.join(ROOT, 'artes', slug, 'arte.html');
    const { html }  = buildArteHtmlCast(slug, arte, imgBuffer, artePath, false);

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(html);
  } catch (e) {
    log.error('CAST render dinâmico:', e.message);
    res.writeHead(500); res.end('Erro ao renderizar arte');
  }
}

// POST /api/arte/exportar — gera arte.html estático para todos os slugs FEST
// POST /api/arte/exportar + /api/arte/reaplicar
// Re-renderiza arte.html para TODAS as artes. Regenera thumb nas que têm fundo.png local.
async function handleFestReaplicar(_req, res) {
  try {
    const artes = readArtes();
    let ok = 0, semThumb = 0, erros = 0;
    for (const arte of artes) {
      try {
        const slug      = arte.slug;
        const arteDir   = path.join(ROOT, 'artes', slug);
        const fundoPath = path.join(arteDir, 'fundo.png');
        const hasFundo  = fs.existsSync(fundoPath);
        const fundoB64  = hasFundo
          ? fs.readFileSync(fundoPath).toString('base64') : '';
        const simpleHtml = renderLayoutForBrand(slug, { ...arte, imageBase64: fundoB64 });
        const fullHtml   = wrapWithEditor(simpleHtml, { slug, save: '/api/arte/salvar', back: '/fest/' });
        fs.writeFileSync(path.join(arteDir, 'arte.html'), fullHtml);
        if (hasFundo) {
          await gerarThumbComposto(path.join(arteDir, 'arte.html'), path.join(arteDir, 'thumb.png'));
        } else {
          semThumb++;
        }
        ok++;
      } catch (e) { erros++; log.error(`FEST reaplicar ${arte.slug}: ${e.message}`); }
    }
    json(res, 200, { ok: true, reaplicados: ok, sem_thumb: semThumb, erros });
  } catch (e) { json(res, 500, { ok: false, error: e.message }); }
}
const handleFestExportar = handleFestReaplicar;

// POST /api/cast/exportar — gera arte.html estático para todas as artes (deploy GitHub Pages)
async function handleCastExportar(_req, res) {
  try {
    const artes = readArtesCast();
    let ok = 0, erros = 0;

    for (const arte of artes) {
      const slug = arte.slug;
      if (!slug) continue;
      const slugDir   = path.join(ROOT, 'artes', slug);
      const fundoPath = path.join(slugDir, 'fundo.png');
      const artePath  = path.join(slugDir, 'arte.html');

      if (!fs.existsSync(fundoPath)) { erros++; continue; }
      try {
        const imgBuffer = fs.readFileSync(fundoPath);
        const { html }  = buildArteHtmlCast(slug, arte, imgBuffer, artePath, false);
        fs.writeFileSync(artePath, html);
        ok++;
      } catch (e) {
        log.warn(`CAST exportar: ${slug} — ${e.message}`);
        erros++;
      }
    }

    json(res, 200, { ok: true, exportados: ok, erros });
  } catch (e) {
    log.error('CAST exportar:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  }
}

// POST /api/cast/arte/reaplicar — re-renderiza todas as artes CAST a partir do fundo.png salvo
// Garante que mudanças no brand-renderer/layouts se reflitam em artes existentes sem regenerar imagem
async function handleCastReaplicar(_req, res) {
  if (!setBusy(res)) return;
  try {
    const artes = readArtesCast();
    let ok = 0, erros = 0;

    for (const arte of artes) {
      const slug = arte.slug;
      if (!slug) continue;
      const slugDir  = path.join(ROOT, 'artes', slug);
      const artePath = path.join(slugDir, 'arte.html');
      const fundoPath = path.join(slugDir, 'fundo.png');
      const thumbPath = path.join(slugDir, 'thumb.png');

      if (!fs.existsSync(fundoPath)) {
        log.warn(`CAST reaplicar: fundo.png ausente em ${slug} — pulando`);
        erros++;
        continue;
      }

      try {
        const imgBuffer = fs.readFileSync(fundoPath);
        const { html } = buildArteHtmlCast(slug, arte, imgBuffer, artePath, false);
        fs.writeFileSync(artePath, html);
        try { await gerarThumbComposto(artePath, thumbPath); } catch { /* não crítico */ }
        ok++;
        log.info(`CAST reaplicar: ${slug} [${arte.layout || 'C'}] ✓`);
      } catch (e) {
        log.warn(`CAST reaplicar: ${slug} falhou — ${e.message}`);
        erros++;
      }
    }

    invalidateArtesCast();
    json(res, 200, { ok: true, total: artes.length, reaplicados: ok, erros });
  } catch (e) {
    log.error('CAST reaplicar:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// POST /api/cast/arte/imagem/versao/deletar  (reutiliza handleDeletarImgVersao — slugs são únicos por prefixo)
// POST /api/cast/arte/deletar
async function handleCastDeletarArte(req, res) {
  const payload = await readBody(req);
  if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
  const slug = String(payload.slug || '').trim();
  if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });

  try {
    const slugDir = path.join(ROOT, 'artes', slug);
    if (fs.existsSync(slugDir)) fs.rmSync(slugDir, { recursive: true, force: true });

    const artes = readArtesCast().filter(a => a.slug !== slug);
    writeArtesCast(artes);
    invalidateArtesCast();
    log.info(`CAST arte deletada: ${slug}`);
    json(res, 200, { ok: true, slug });
  } catch (e) {
    log.error('CAST deletar arte:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  }
}

// POST /api/cast/pedido — dispara propostas ou consome banco
async function handleCastPedido(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

    const resultado = await executarPedidoCast({
      tema:              String(payload.tema || '').trim(),
      objetivo:          payload.objetivo || 'audiencia',
      tipoPost:          payload.tipoPost || null,
      forcarPropostas:   !!payload.forcarPropostas,
      pularBanco:        !!payload.pularBanco,
      descartarPendente: !!payload.descartarPendente,
    });

    invalidateArtesCast();
    json(res, 200, { ok: true, ...resultado });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    log.error('CAST pedido:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// GET /api/cast/propostas
async function handleCastPropostasGet(_req, res) {
  try {
    const estado = await getEstadoPropostasCast();
    json(res, 200, { ok: true, ...estado });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  }
}

// POST /api/cast/propostas/aprovar
async function handleCastAprovar(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
    const { loteId, principalId, bancoIds, edicoes } = payload;
    if (!loteId || !principalId) return json(res, 400, { ok: false, erro: 'loteId e principalId são obrigatórios' });

    const resultado = await aprovarLoteCast({ loteId, principalId, bancoIds: bancoIds || [], edicoes: edicoes || {} });
    invalidateArtesCast();
    json(res, 200, { ok: true, ...resultado });
  } catch (e) {
    if (e.statusCode === 413) return json(res, 413, { ok: false, erro: 'Payload muito grande' });
    log.error('CAST aprovar:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// POST /api/cast/propostas/rejeitar
async function handleCastRejeitar(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload?.loteId) return json(res, 400, { ok: false, erro: 'loteId obrigatório' });
    await rejeitarLoteCast(payload.loteId);
    json(res, 200, { ok: true });
  } catch (e) {
    log.error('CAST rejeitar:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// POST /api/cast/banco/consumir
async function handleCastConsumirBanco(_req, res) {
  if (!setBusy(res)) return;
  try {
    const resultado = await consumirBancoCast();
    invalidateArtesCast();
    if (!resultado) return json(res, 200, { ok: true, modo: 'banco_vazio' });
    json(res, 200, { ok: true, modo: 'visual_banco', ...resultado });
  } catch (e) {
    log.error('CAST banco consumir:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// POST /api/cast/campanha
async function handleCastCampanha(req, res) {
  if (!setBusy(res)) return;
  try {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
    const { objetivo = 'engajamento', quantidade = 5, tema = '' } = payload;
    const fs   = require('fs');
    const path = require('path');
    const temas = JSON.parse(fs.readFileSync(path.join(ROOT, '_brands/cyberseccast/temas.json'), 'utf8'));
    const lote  = await criarLoteCampanhaCast({ objetivo, quantidade, tema, temas });
    json(res, 200, { ok: true, lote });
  } catch (e) {
    log.error('CAST campanha:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    clearBusy();
  }
}

// ── fim dos handlers CAST ──────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
  const urlPath = decodeURIComponent(url.pathname);

  if (req.method === 'POST' && urlPath === '/api/campanha') return handleCampanha(req, res);
  if (req.method === 'POST' && urlPath === '/api/pedido') return handlePedido(req, res);
  if (req.method === 'GET'  && urlPath === '/api/propostas') return handlePropostasGet(req, res);
  if (req.method === 'POST' && urlPath === '/api/propostas/aprovar') return handleAprovar(req, res);
  if (req.method === 'POST' && urlPath === '/api/propostas/rejeitar') return handleRejeitar(req, res);
  if (req.method === 'POST' && urlPath === '/api/banco/consumir') return handleConsumirBanco(req, res);
  if (req.method === 'POST' && urlPath === '/api/arte/salvar') return handleSalvarArte(req, res);
  if (req.method === 'POST' && urlPath === '/api/arte/deletar') return handleDeletarArte(req, res);
  if (req.method === 'POST' && urlPath === '/api/arte/imagem/mudar') return handleMudarImagem(req, res);
  if (req.method === 'GET'  && urlPath === '/api/arte/imagem/versoes') return handleImgVersoesGet(req, res, url.searchParams);
  if (req.method === 'POST' && urlPath === '/api/arte/imagem/versao/ativar') return handleAtivarImgVersao(req, res);
  if (req.method === 'POST' && urlPath === '/api/arte/imagem/versao/deletar') return handleDeletarImgVersao(req, res);
  if (req.method === 'POST' && urlPath === '/api/motion/selecionar') return handleMotionSelecionar(req, res);
  if (req.method === 'POST' && urlPath === '/api/motion/aprovar-mp4') return handleMotionAprovarMp4(req, res);
  if (req.method === 'POST' && urlPath === '/api/motion/deletar') return handleMotionDeletar(req, res);
  if (req.method === 'POST' && urlPath === '/api/motion/pedido') return handleMotionPedidoPost(req, res);
  if (req.method === 'GET'  && urlPath === '/api/motion/versoes') return handleMotionVersoesGet(req, res, url.searchParams);
  if (req.method === 'GET'  && urlPath === '/api/motion/pedido') return handleMotionPedidoGet(req, res, url.searchParams);
  if (req.method === 'GET'  && urlPath === '/api/motion/mp4') return handleMotionMp4Get(req, res, url.searchParams);
  if (req.method === 'GET'  && urlPath === '/api/campanha/export') return handleCampanhaExport(req, res, url.searchParams);
  if (req.method === 'GET'  && urlPath === '/api/temas/calendario') return handleCalendario(req, res);
  if (req.method === 'GET'  && urlPath === '/api/status') {
    return json(res, 200, {
      ok: true,
      gerando: busy,
      fluxo: 'v2-propostas',
      build: '2026-06-23-arte-deletar',
      apis: ['pedido', 'campanha', 'campanha/export', 'propostas', 'aprovar', 'banco', 'arte/salvar', 'arte/deletar', 'motion/selecionar', 'motion/aprovar-mp4', 'motion/deletar', 'motion/mp4', 'motion/versoes', 'motion/pedido', 'motion/presets', 'template/padroes', 'temas/calendario'],
    });
  }

  if (req.method === 'GET'  && urlPath === '/api/template/padroes') {
    try {
      const { readPadroes } = require('./utils/template-padroes.js');
      return json(res, 200, { ok: true, ...readPadroes() });
    } catch (e) {
      return json(res, 500, { ok: false, erro: e.message });
    }
  }

  // ── CYBERSEC.CAST routes (/api/cast/*) ──────────────────────────
  if (req.method === 'POST' && urlPath === '/api/cast/campanha') return handleCastCampanha(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/pedido') return handleCastPedido(req, res);
  if (req.method === 'GET'  && urlPath === '/api/cast/propostas') return handleCastPropostasGet(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/propostas/aprovar') return handleCastAprovar(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/propostas/rejeitar') return handleCastRejeitar(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/banco/consumir') return handleCastConsumirBanco(req, res);
  if (req.method === 'GET'  && urlPath === '/api/cast/artes') return handleCastArtesList(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/arte/criar') return handleCastCriarArte(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/arte/salvar') return handleCastSalvarArte(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/arte/deletar') return handleCastDeletarArte(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/arte/imagem/mudar') return handleCastMudarImagem(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/arte/reaplicar') return handleCastReaplicar(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/exportar') return handleCastExportar(req, res);
  if (req.method === 'POST' && urlPath === '/api/arte/exportar') return handleFestExportar(req, res);
  if (req.method === 'POST' && urlPath === '/api/arte/reaplicar') return handleFestReaplicar(req, res);
  if (req.method === 'GET'  && urlPath === '/api/cast/arte/imagem/versoes') return handleCastImgVersoesGet(req, res, url.searchParams);
  if (req.method === 'POST' && urlPath === '/api/cast/arte/imagem/versao/ativar') return handleCastAtivarImgVersao(req, res);
  if (req.method === 'POST' && urlPath === '/api/cast/arte/imagem/versao/deletar') return handleDeletarImgVersao(req, res);
  if (req.method === 'GET'  && urlPath === '/api/cast/status') {
    return json(res, 200, { ok: true, brand: 'cyberseccast', fluxo: 'v2-propostas', gerando: busy, apis: ['cast/pedido', 'cast/campanha', 'cast/propostas', 'cast/banco/consumir', 'cast/arte/deletar', 'cast/temas/calendario'] });
  }
  if (req.method === 'GET'  && urlPath === '/api/cast/temas/calendario') {
    try {
      const temasPath = path.join(ROOT, '_brands/cyberseccast/temas.json');
      const temas = JSON.parse(fs.readFileSync(temasPath, 'utf8'));
      const cal = temas.calendario_editorial || {
        segunda: { tipo_post: 'episodio', observacao: 'Episódio da semana' },
        quarta:  { tipo_post: 'convidado', observacao: 'Apresentação de convidado' },
        sexta:   { tipo_post: 'insight', observacao: 'Post de insight executivo' },
      };
      return json(res, 200, { ok: true, calendario: cal, historico: (temas.historico_recente || []).slice(-8) });
    } catch (e) { return json(res, 500, { ok: false, erro: e.message }); }
  }

  // ── Modo híbrido: renderização dinâmica para artes CAST ──────────
  // Intercepta antes do serveStatic; qualquer mudança de código reflete automaticamente
  const castArteMatch = req.method === 'GET' && urlPath.match(/^\/artes\/(cast-[\w-]+)\/arte\.html$/);
  if (castArteMatch) return handleCastArteHtmlDynamic(req, res, castArteMatch[1]);

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405); return res.end('Method not allowed');
  }

  serveStatic(req, res, urlPath);
});

server.listen(PORT, HOST, () => {
  const local = ['1', 'true', 'yes'].includes(String(process.env.LOCAL_MODE || '').toLowerCase());
  log.info(`CybersecFEST Dev Server — http://${HOST}:${PORT}/ — modo: ${local ? 'LOCAL' : 'REMOTO'}`);
});
