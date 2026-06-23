'use strict';

// Dev local sempre grava no disco — antes de carregar storage
process.env.LOCAL_MODE = process.env.LOCAL_MODE || '1';
require('./load-env.js');

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { executarPedido, getEstadoPropostas } = require('./pedido-run.js');
const { aprovarLote, rejeitarLote, consumirBanco } = require('./aprovar-propostas.js');
const { upsertEditorState } = require('./utils/editor-state.js');
const { gerarThumbComposto } = require('./utils/thumb-composto.js');
const { resolveArtePaths, promoteTemplatePadrao, isTemplateSlug } = require('./utils/template-padroes.js');

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

let gerando = false;

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  try {
    return JSON.parse(body || '{}');
  } catch {
    return null;
  }
}

function resolveStaticPath(urlPath) {
  let rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '').replace(/\/$/, '');

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
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

async function handlePedido(req, res) {
  if (gerando) {
    return json(res, 409, { ok: false, erro: 'Já existe uma operação em andamento. Aguarde.' });
  }

  const payload = await readBody(req);
  if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

  gerando = true;
  console.log('\n📨 Pedido:', payload.forcarPropostas ? 'forçar propostas' : 'fluxo normal', payload.tema?.slice(0, 40) || '');

  try {
    const resultado = await executarPedido({
      tipoPost:       payload.tipoPost,
      tema:           payload.tema,
      forcarPropostas: !!payload.forcarPropostas,
      pularBanco:     !!payload.forcarPropostas,
    });

    console.log(`✅ Pedido: modo=${resultado.modo}`);
    json(res, 200, { ok: true, ...resultado });
  } catch (e) {
    console.error('❌ Pedido falhou:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    gerando = false;
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
  if (gerando) return json(res, 409, { ok: false, erro: 'Operação em andamento' });
  const payload = await readBody(req);
  if (!payload?.loteId || !payload?.principalId) {
    return json(res, 400, { ok: false, erro: 'loteId e principalId são obrigatórios' });
  }

  gerando = true;
  try {
    const resultado = await aprovarLote({
      loteId: payload.loteId,
      principalId: payload.principalId,
      bancoIds: payload.bancoIds || [],
      edicoes: payload.edicoes || {},
      gerarBackupVisual: !!payload.gerarBackupVisual,
    });
    json(res, 200, { ok: true, modo: 'visual_aprovado', ...resultado });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    gerando = false;
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
  if (gerando) return json(res, 409, { ok: false, erro: 'Operação em andamento' });
  gerando = true;
  try {
    const resultado = await consumirBanco({ gerarBackupVisual: false });
    if (!resultado) return json(res, 404, { ok: false, erro: 'Banco vazio' });
    json(res, 200, { ok: true, modo: 'visual_banco', ...resultado });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    gerando = false;
  }
}

async function handleSalvarArte(req, res) {
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

  try {
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

    console.log(`💾 Editor salvo: ${slug}${thumbOk ? ' + thumb' : ''}${isTemplate ? ' · padrão layout ' + layout : ''}`);
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
    console.error('❌ Salvar arte:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  }
}

async function handleCampanha(req, res) {
  if (gerando) return json(res, 409, { ok: false, erro: 'Operação em andamento' });
  const payload = await readBody(req);
  if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

  gerando = true;
  try {
    const { getJSON } = require('./utils/storage.js');
    const { criarLoteCampanha } = require('./gerar-campanha.js');
    const temasFile = await getJSON('temas.json');
    if (!temasFile) throw new Error('temas.json não encontrado');

    const lote = await criarLoteCampanha({
      objetivo: payload.objetivo || 'inscricoes',
      quantidade: payload.quantidade || 5,
      tema: payload.tema?.trim() || '',
      temas: temasFile.data,
    });

    json(res, 200, { ok: true, modo: 'campanha', lote });
  } catch (e) {
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    gerando = false;
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

async function handleDeletarArte(req, res) {
  const payload = await readBody(req);
  if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });

  const slug = String(payload.slug || '').trim();
  if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });

  try {
    const { removerArte } = require('./utils/remover-arte.js');
    const resultado = await removerArte(slug);
    console.log(`🗑️  Arte removida: ${slug}`);
    json(res, 200, { ok: true, ...resultado });
  } catch (e) {
    console.error('❌ Deletar arte:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  }
}

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
  if (req.method === 'GET'  && urlPath === '/api/campanha/export') return handleCampanhaExport(req, res, url.searchParams);
  if (req.method === 'GET'  && urlPath === '/api/temas/calendario') return handleCalendario(req, res);
  if (req.method === 'GET'  && urlPath === '/api/status') {
    return json(res, 200, {
      ok: true,
      gerando,
      fluxo: 'v2-propostas',
      build: '2026-06-23-arte-deletar',
      apis: ['pedido', 'campanha', 'campanha/export', 'propostas', 'aprovar', 'banco', 'arte/salvar', 'arte/deletar', 'template/padroes', 'temas/calendario'],
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

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405); return res.end('Method not allowed');
  }

  serveStatic(req, res, urlPath);
});

server.listen(PORT, HOST, () => {
  const local = ['1', 'true', 'yes'].includes(String(process.env.LOCAL_MODE || '').toLowerCase());
  console.log(`\n🚀 CybersecFEST — Dev Server`);
  console.log(`   Galeria:  http://${HOST}:${PORT}/`);
  console.log(`   Templates: http://${HOST}:${PORT}/galeria-templates/`);
  console.log(`   API:      POST /api/pedido · POST /api/campanha · GET /api/campanha/export · GET /api/propostas`);
  console.log(`   Modo:     ${local ? 'LOCAL (grava no disco)' : 'REMOTO (GitHub API)'}`);
  console.log(`   Raiz:     ${ROOT}\n`);
});
