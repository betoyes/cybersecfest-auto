'use strict';

const fs = require('fs');
const path = require('path');
const { readVersions, nextVersionId } = require('./motion-versoes.js');

function pedidosFile(slug, root) {
  return path.join(root, 'artes', slug, 'motion', 'pedidos.json');
}

function readPedidos(slug, root) {
  const file = pedidosFile(slug, root);
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writePedidos(slug, root, list) {
  const dir = path.dirname(pedidosFile(slug, root));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(pedidosFile(slug, root), JSON.stringify(list, null, 2) + '\n', 'utf8');
}

function createPedido(slug, root, { mode, instrucoes = '', baseVersion = null, presetId = null }) {
  /* Motion liberado para todos os posts — sem restrição de sandbox */
  let versions = readVersions(slug, root);

  /* Primeiro pedido deste post: sem versions.json ainda, tudo bem */
  if (!versions) {
    versions = { slug, preview: null, mp4_from: null, versions: [] };
  }

  /* Para modo ajustar precisa ter ao menos uma versão gerada */
  if (mode === 'ajustar' && versions.versions.length === 0) {
    throw new Error('Gere uma primeira versão antes de ajustar');
  }

  const targetVersion = nextVersionId(versions);
  const pedidos = readPedidos(slug, root);
  const pending = pedidos.find(p => p.status === 'pending' || p.status === 'processing');
  if (pending) {
    throw new Error(`Já existe pedido em andamento (v${pending.targetVersion})`);
  }

  const pedido = {
    id: `motion-${Date.now()}`,
    slug,
    mode: mode === 'ajustar' ? 'ajustar' : 'surpresa',
    instrucoes: String(instrucoes || '').trim(),
    baseVersion: baseVersion || versions.preview || 1,
    targetVersion,
    presetId: presetId ? String(presetId).trim() : null,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  pedidos.push(pedido);
  writePedidos(slug, root, pedidos);
  return pedido;
}

function updatePedidoStatus(slug, root, pedidoId, status, extra = {}) {
  const pedidos = readPedidos(slug, root);
  const idx = pedidos.findIndex(p => p.id === pedidoId);
  if (idx === -1) return null;
  pedidos[idx] = { ...pedidos[idx], status, ...extra, updated_at: new Date().toISOString() };
  writePedidos(slug, root, pedidos);
  return pedidos[idx];
}

function getActivePedido(slug, root) {
  return readPedidos(slug, root).find(p => p.status === 'pending' || p.status === 'processing') || null;
}

module.exports = {
  readPedidos,
  createPedido,
  updatePedidoStatus,
  getActivePedido,
};
