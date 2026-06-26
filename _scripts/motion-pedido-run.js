#!/usr/bin/env node
/**
 * Processa pedido de nova versão motion — gera composição automaticamente.
 * Uso: node _scripts/motion-pedido-run.js --slug X --pedido-id Y
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { readPedidos, updatePedidoStatus } = require('./utils/motion-pedidos.js');
const { gerarNovaVersao } = require('./utils/motion-gerador.js');

function parseArgs(argv) {
  const out = { slug: null, pedidoId: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--slug') out.slug = argv[++i];
    else if (argv[i] === '--pedido-id') out.pedidoId = argv[++i];
  }
  return out;
}

async function main() {
  const { slug, pedidoId } = parseArgs(process.argv);
  if (!slug || !pedidoId) {
    console.error('Uso: node motion-pedido-run.js --slug <slug> --pedido-id <id>');
    process.exit(1);
  }

  const pedidos = readPedidos(slug, ROOT);
  const pedido = pedidos.find(p => p.id === pedidoId);
  if (!pedido) {
    console.error('Pedido não encontrado:', pedidoId);
    process.exit(1);
  }

  updatePedidoStatus(slug, ROOT, pedidoId, 'processing');

  const activeFile = path.join(ROOT, 'artes', slug, 'motion', 'pedidos', 'ACTIVE.json');
  fs.mkdirSync(path.dirname(activeFile), { recursive: true });
  fs.writeFileSync(activeFile, JSON.stringify({ ...pedido, status: 'processing' }, null, 2) + '\n');

  console.log(`\n🎬 Motion motor — ${slug} → v${pedido.targetVersion} (${pedido.mode})\n`);

  try {
    const result = await gerarNovaVersao(slug, pedido, ROOT);

    updatePedidoStatus(slug, ROOT, pedidoId, 'done', {
      message: `Versão ${pedido.targetVersion} gerada (${result.entry.preset})`,
      preset: result.entry.preset,
    });

    if (fs.existsSync(activeFile)) fs.unlinkSync(activeFile);

    console.log(`✅ v${pedido.targetVersion} pronta — ${result.entry.preset}`);
    console.log(`   ${path.relative(ROOT, result.versionDir)}/index.html\n`);
  } catch (e) {
    console.error('❌', e.message);
    updatePedidoStatus(slug, ROOT, pedidoId, 'failed', { message: e.message });
    process.exit(1);
  }
}

main();
