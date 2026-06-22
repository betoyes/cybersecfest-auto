'use strict';

const { gerarArte } = require('./gerador-artes.js');
const { detectLandmarkIntent } = require('./utils/imagem-prompt.js');
const {
  loadStore, saveStore, newId, findProposta, getBancoOrdenado, countBanco, BANCO_MAX,
} = require('./utils/propostas-store.js');

function aplicarEdicoes(proposta, edicoes = {}) {
  if (!edicoes || typeof edicoes !== 'object') return { ...proposta };
  const out = { ...proposta };
  for (const k of ['headline', 'subtitulo', 'palavras_azuis', 'contexto_visual', 'legenda', 'cidade', 'angulo']) {
    if (edicoes[k] != null && String(edicoes[k]).trim()) out[k] = String(edicoes[k]).trim();
  }
  return out;
}

function propostaParaArtePayload(proposta, tipoPost, opts = {}) {
  return {
    tipoPost,
    headline: proposta.headline,
    subtitulo: proposta.subtitulo,
    palavrasAzuis: proposta.palavras_azuis,
    contextoVisual: proposta.contexto_visual,
    cidade: proposta.cidade,
    legendaAprovada: proposta.legenda,
    publicacao: opts.publicacao || 'normal',
    propostaId: proposta.id,
    angulo: proposta.angulo,
  };
}

function itemBancoFromProposta(proposta, lote, destino = 'fila') {
  return {
    id: newId('banco'),
    status: 'aprovado_texto',
    tipo_post: lote.tipo_post,
    angulo: proposta.angulo,
    headline: proposta.headline,
    subtitulo: proposta.subtitulo,
    palavras_azuis: proposta.palavras_azuis,
    legenda: proposta.legenda,
    contexto_visual: proposta.contexto_visual,
    cidade: proposta.cidade,
    aprovado_em: new Date().toISOString(),
    origem_lote: lote.id,
    destino,
  };
}

/**
 * @param {object} opts
 * @param {string} opts.loteId
 * @param {string} opts.principalId — proposta que gera visual agora
 * @param {string[]} [opts.bancoIds] — outras propostas para o banco
 * @param {object} [opts.edicoes] — overrides por propostaId: { [id]: { headline, ... } }
 * @param {boolean} [opts.gerarBackupVisual] — se true, gera visual imediato para itens do banco também
 */
async function aprovarLote(opts) {
  const { loteId, principalId, bancoIds = [], edicoes = {}, gerarBackupVisual = false } = opts;
  const { data, sha } = await loadStore();

  const lote = (data.lotes || []).find(l => l.id === loteId);
  if (!lote) throw new Error('Lote não encontrado');
  if (lote.status !== 'aguardando_aprovacao') throw new Error('Lote já foi processado');

  const found = findProposta(data, loteId, principalId);
  if (!found) throw new Error('Proposta principal não encontrada');

  const principal = aplicarEdicoes(found.proposta, edicoes[principalId]);
  if (lote.tema_briefing && detectLandmarkIntent(lote.tema_briefing) && !detectLandmarkIntent(principal.contexto_visual || '')) {
    principal.contexto_visual = `${principal.contexto_visual || ''}. ${lote.tema_briefing}`.trim();
  }
  const idsUsados = new Set([principalId]);

  console.log(`\n✅ Aprovando lote ${loteId}`);
  console.log(`   Principal: ${principal.angulo} → gerando visual...`);

  const resultadoPrincipal = await gerarArte(propostaParaArtePayload(principal, lote.tipo_post, { publicacao: 'normal' }));

  const bancoNovos = [];
  for (const bid of bancoIds) {
    if (bid === principalId || idsUsados.has(bid)) continue;
    const f = findProposta(data, loteId, bid);
    if (!f) continue;
    const prop = aplicarEdicoes(f.proposta, edicoes[bid]);
    idsUsados.add(bid);

    if (gerarBackupVisual) {
      console.log(`   Backup visual: ${prop.angulo}...`);
      await gerarArte(propostaParaArtePayload(prop, lote.tipo_post, { publicacao: 'backup' }));
    } else {
      if (countBanco(data) + bancoNovos.length >= BANCO_MAX) {
        throw new Error(`Banco cheio (${BANCO_MAX}). Remova reservas ou não selecione tantas para o banco.`);
      }
      bancoNovos.push(itemBancoFromProposta(prop, lote, 'fila'));
      console.log(`   Banco: ${prop.angulo}`);
    }
  }

  data.banco = [...(data.banco || []), ...bancoNovos];
  lote.status = 'concluido';
  lote.concluido_em = new Date().toISOString();
  lote.principal_id = principalId;
  lote.slug_gerado = resultadoPrincipal.slug;

  await saveStore(data, sha);

  return {
    slug: resultadoPrincipal.slug,
    layout: resultadoPrincipal.layout,
    bancoAdicionados: bancoNovos.length,
    bancoTotal: countBanco(data),
  };
}

async function rejeitarLote(loteId) {
  const { data, sha } = await loadStore();
  const lote = (data.lotes || []).find(l => l.id === loteId);
  if (!lote) throw new Error('Lote não encontrado');
  lote.status = 'rejeitado';
  lote.rejeitado_em = new Date().toISOString();
  await saveStore(data, sha);
  return { ok: true };
}

async function consumirBanco(opts = {}) {
  const { gerarBackupVisual = false } = opts;
  const { data, sha } = await loadStore();
  const fila = getBancoOrdenado(data);
  if (!fila.length) return null;

  const item = fila[0];
  data.banco = data.banco.filter(b => b.id !== item.id);
  await saveStore(data, sha);

  console.log(`\n📦 Consumindo banco: ${item.angulo} (${item.id})`);

  const resultado = await gerarArte({
    tipoPost: item.tipo_post,
    headline: item.headline,
    subtitulo: item.subtitulo,
    palavrasAzuis: item.palavras_azuis,
    contextoVisual: item.contexto_visual,
    cidade: item.cidade,
    legendaAprovada: item.legenda,
    publicacao: gerarBackupVisual || item.destino === 'backup' ? 'backup' : 'normal',
    propostaId: item.id,
    angulo: item.angulo,
  });

  return { ...resultado, fromBanco: true, bancoId: item.id };
}

async function getEstadoPropostas() {
  const { data } = await loadStore();
  return {
    lotePendente: (data.lotes || []).find(l => l.status === 'aguardando_aprovacao') || null,
    banco: getBancoOrdenado(data),
    bancoCount: countBanco(data),
    bancoMax: BANCO_MAX,
  };
}

module.exports = {
  aprovarLote,
  rejeitarLote,
  consumirBanco,
  getEstadoPropostas,
  aplicarEdicoes,
};
