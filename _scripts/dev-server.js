'use strict';

// Dev local sempre grava no disco — antes de carregar storage
process.env.LOCAL_MODE = process.env.LOCAL_MODE || '1';
require('./load-env.js');

const http = require('http');
const fs   = require('fs');
const path = require('path');
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

async function handleMudarImagem(req, res) {
  if (gerando) return json(res, 409, { ok: false, erro: 'Já existe uma operação em andamento. Aguarde.' });

  const payload = await readBody(req);
  const slug = String(payload?.slug || '').trim();
  const instrucao = String(payload?.instrucao || '').trim();

  if (!slug || !/^[\w-]+$/.test(slug)) return json(res, 400, { ok: false, erro: 'slug inválido' });
  if (!instrucao) return json(res, 400, { ok: false, erro: 'instrucao é obrigatória' });

  const artesJsonPath = path.join(ROOT, 'artes.json');
  const artes = JSON.parse(fs.readFileSync(artesJsonPath, 'utf8'));
  const arte = artes.find(a => a.slug === slug);
  if (!arte) return json(res, 404, { ok: false, erro: `Arte não encontrada: ${slug}` });

  const { artePath, thumbPath } = resolveArtePaths(slug);
  if (!fs.existsSync(artePath)) return json(res, 404, { ok: false, erro: 'arte.html não encontrada' });

  gerando = true;
  try {
    const layout = (arte.layout || (arte.tipo === 'evento' ? 'E' : arte.tipo === 'patrocinador' ? 'F' : 'C')).toUpperCase();
    validateLayout(layout);

    /* Prompt base + instrução do usuário como modificador */
    const basePrompt = buildImagePrompt({
      tipo:           arte.tipo,
      layout,
      contextoVisual: arte.contexto_visual || '',
      slug,
      cidade:         arte.cidade || 'BH',
    });
    const prompt = `${basePrompt}\n\nMODIFICAÇÃO SOLICITADA: ${instrucao}`;

    console.log(`\n🖼️  Mudar imagem: ${slug}`);
    console.log(`   Instrução: ${instrucao}`);

    const imgBuffer = await generateImage(prompt, {
      tipo:           arte.tipo,
      layout,
      contextoVisual: arte.contexto_visual || '',
      cidade:         arte.cidade || 'BH',
    });

    if (!imgBuffer?.length || imgBuffer.length < 5000) {
      throw new Error(`Imagem gerada muito pequena (${imgBuffer?.length || 0} bytes)`);
    }

    const slugDir  = path.join(ROOT, 'artes', slug);
    const fundoPath = path.join(slugDir, 'fundo.png');
    fs.mkdirSync(slugDir, { recursive: true });
    fs.writeFileSync(fundoPath, imgBuffer);
    console.log(`💾 fundo.png atualizado (${Math.round(imgBuffer.length / 1024)} KB)`);

    /* Recompor arte.html preservando estado do editor */
    const imageBase64 = imgBuffer.toString('base64');
    const editorState = extractEditorState(fs.readFileSync(artePath, 'utf8'));
    const simpleHtml  = renderLayout(layout, {
      imageBase64,
      headline:        arte.headline,
      subtitulo:       arte.subtitulo || '',
      palavrasAzuis:   arte.palavras_azuis || '',
      nomePalestrante: arte.nome_palestrante || '',
      cargoEmpresa:    arte.cargo_empresa || '',
    });
    const html = wrapWithEditor(simpleHtml, { layout, headline: arte.headline, slug, editorState });
    fs.writeFileSync(artePath, html);
    console.log(`📝 arte.html recomposto`);

    /* Regenerar thumb */
    await gerarThumbComposto(artePath, thumbPath);
    console.log(`📸 thumb regenerado`);

    json(res, 200, { ok: true, slug, thumb: `artes/${slug}/thumb.png?t=${Date.now()}` });
  } catch (e) {
    console.error('❌ Mudar imagem falhou:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    gerando = false;
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
    console.log(`🎬 Motion preview: ${slug} → v${version}`);
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
    console.log(`🎬 Motion MP4 aprovado: ${slug} → v${version}`);
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
    console.log(`🗑️  Motion versão removida: ${slug} → v${version}`);
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

  try {
    const { createPedido } = require('./utils/motion-pedidos.js');
    const { PRESET_IDS } = require('./utils/motion-presets.js');
    if (presetId && !PRESET_IDS.includes(presetId)) {
      return json(res, 400, { ok: false, erro: 'Preset inválido ou não automatizado: ' + presetId });
    }
    const pedido = createPedido(slug, ROOT, { mode, instrucoes, baseVersion, presetId });

    const { spawn } = require('child_process');
    const worker = path.join(__dirname, 'motion-pedido-run.js');
    spawn(process.execPath, [worker, '--slug', slug, '--pedido-id', pedido.id], {
      detached: true,
      stdio: 'ignore',
      cwd: __dirname,
    }).unref();

    const presetLabel = presetId || 'surpresa';
    console.log(`🎬 Motion pedido: ${slug} → v${pedido.targetVersion} (${mode}${presetId ? ' · ' + presetId : ''})`);
    json(res, 200, { ok: true, pedido });
  } catch (e) {
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
      gerando,
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
