'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');
const { executarPedido } = require('./pedido-run.js');

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
};

let gerando = false;

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res, urlPath) {
  const rel  = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
  const file = path.join(ROOT, rel);

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
    return json(res, 409, { ok: false, erro: 'Já existe um post sendo gerado. Aguarde.' });
  }

  let body = '';
  for await (const chunk of req) body += chunk;

  let payload = {};
  try {
    payload = JSON.parse(body || '{}');
  } catch {
    return json(res, 400, { ok: false, erro: 'JSON inválido' });
  }

  gerando = true;
  console.log('\n📨 Pedido recebido:', payload.tipoPost || 'auto', payload.tema?.slice(0, 40) || '(sem tema)');

  try {
    const resultado = await executarPedido({
      tipoPost:       payload.tipoPost,
      tema:           payload.tema,
      headline:       payload.headline,
      subtitulo:      payload.subtitulo,
      palavrasAzuis:  payload.palavrasAzuis,
      contextoVisual: payload.contextoVisual,
      cidade:         payload.cidade,
    });

    console.log(`✅ Pedido concluído: ${resultado.slug}`);
    json(res, 200, {
      ok: true,
      slug:     resultado.slug,
      layout:   resultado.layout,
      tipoPost: resultado.tipoPost,
      headline: resultado.briefing.headline,
      legenda:  resultado.varianteSelecionada,
    });
  } catch (e) {
    console.error('❌ Pedido falhou:', e.message);
    json(res, 500, { ok: false, erro: e.message });
  } finally {
    gerando = false;
  }
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  if (req.method === 'POST' && urlPath === '/api/pedido') {
    return handlePedido(req, res);
  }

  if (req.method === 'GET' && urlPath === '/api/status') {
    return json(res, 200, { ok: true, gerando });
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
  console.log(`   API:      POST http://${HOST}:${PORT}/api/pedido`);
  console.log(`   Modo:     ${local ? 'LOCAL (grava no disco)' : 'REMOTO (GitHub API)'}`);
  console.log(`   Raiz:     ${ROOT}\n`);
});
