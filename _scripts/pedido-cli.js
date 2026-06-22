'use strict';
require('./load-env.js');
const { executarPedido } = require('./pedido-run.js');

const args = Object.fromEntries(
  process.argv.slice(2).map(a => a.split('=')).filter(p => p.length === 2)
);

executarPedido({
  tipoPost:       args.tipo,
  tema:           args.tema,
  headline:       args.headline,
  subtitulo:      args.subtitulo,
  contextoVisual: args.contexto,
}).then(r => {
  console.log('✅', r.slug, r.layout);
}).catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
