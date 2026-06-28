'use strict';

/**
 * CLI de pedido — CYBERSEC.CAST
 * Equivalente ao pedido-cli.js do CybersecFEST.
 *
 * Uso:
 *   node pedido-cli-cast.js tipo=episodio tema="Zero Trust com CISO da XP"
 *   node pedido-cli-cast.js tipo=convidado tema="Amanda Gorga — segurança e liderança"
 *   node pedido-cli-cast.js tipo=insight
 *
 * Argumentos:
 *   tipo    — episodio | convidado | insight  (padrão: detectado pelo dia da semana)
 *   tema    — briefing livre (opcional)
 *   forcar  — true → ignora banco e gera novas propostas
 *   banco   — true → pular banco e forçar propostas também
 */

require('./load-env.js');

const { executarPedidoCast } = require('./pedido-run-cast.js');

const args = Object.fromEntries(
  process.argv.slice(2).map(a => a.split('=')).filter(p => p.length >= 2).map(([k, ...v]) => [k, v.join('=')])
);

executarPedidoCast({
  tipoPost:        args.tipo,
  tema:            args.tema,
  forcarPropostas: args.forcar === 'true',
  pularBanco:      args.banco  === 'true',
}).then(r => {
  if (r.modo === 'propostas') {
    console.log(`✅ CAST — ${r.lote.propostas.length} propostas criadas (lote: ${r.lote.id})`);
    r.lote.propostas.forEach((p, i) =>
      console.log(`   ${i + 1}. ${p.angulo}${p.recomendada ? ' ★' : ''} — "${p.headline.replace(/<[^>]+>/g,' ').trim()}"`));
    console.log('\n   Revise e aprove em: http://127.0.0.1:8765/cast/');
  } else if (r.modo === 'aguardando_aprovacao') {
    console.log(`⏳ CAST — Lote pendente: ${r.loteId}`);
    console.log('   Revise e aprove em: http://127.0.0.1:8765/cast/');
  } else if (r.modo === 'visual_banco') {
    console.log(`✅ CAST — Arte do banco gerada: ${r.slug} [${r.layout}]`);
  } else {
    console.log('✅ CAST —', r);
  }
}).catch(e => {
  console.error('❌ CAST:', e.message);
  process.exit(1);
});
