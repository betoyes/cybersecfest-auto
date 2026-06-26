'use strict';

/**
 * Store de propostas do CYBERSEC.CAST — separado do CybersecFEST.
 * Usa propostas-cast.json em vez de propostas.json.
 * Estrutura idêntica ao propostas-store.js.
 */

const { getJSON, putJSON } = require('./storage.js');

const ARQUIVO   = 'propostas-cast.json';
const BANCO_MAX = 5;

function emptyStore() {
  return {
    _meta: { versao: '1.0.0', descricao: 'Propostas e banco editorial do CYBERSEC.CAST' },
    banco: [],
    lotes: [],
  };
}

async function loadStore() {
  const f = await getJSON(ARQUIVO);
  if (!f) return { data: emptyStore(), sha: null };
  return { data: f.data, sha: f.sha };
}

async function saveStore(data, sha) {
  await putJSON(ARQUIVO, data, `[CAST] propostas-cast.json — atualização`, sha);
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getLoteAguardando(data) {
  return (data.lotes || []).find(l => l.status === 'aguardando_aprovacao') || null;
}

function getBancoOrdenado(data) {
  return [...(data.banco || [])]
    .filter(b => b.status === 'aprovado_texto')
    .sort((a, b) => new Date(a.aprovado_em) - new Date(b.aprovado_em));
}

function countBanco(data) {
  return getBancoOrdenado(data).length;
}

function findProposta(data, loteId, propostaId) {
  const lote = (data.lotes || []).find(l => l.id === loteId);
  if (!lote) return null;
  const proposta = (lote.propostas || []).find(p => p.id === propostaId);
  if (!proposta) return null;
  return { lote, proposta };
}

module.exports = {
  ARQUIVO,
  BANCO_MAX,
  loadStore,
  saveStore,
  newId,
  getLoteAguardando,
  getBancoOrdenado,
  countBanco,
  findProposta,
};
