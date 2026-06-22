// CybersecFEST — Pipeline Orquestrador (autônomo)
'use strict';

require('./load-env.js');

const { executarPedido } = require('./pedido-run.js');

async function run() {
  const local = ['1', 'true', 'yes'].includes(String(process.env.LOCAL_MODE || '').toLowerCase());
  console.log('🚀 CybersecFEST Pipeline — iniciando...');
  console.log(`   Modo: ${local ? 'LOCAL (arquivos no disco)' : 'REMOTO (GitHub API)'}`);
  console.log(`   Data/hora: ${new Date().toISOString()}`);

  const resultado = await executarPedido({
    tipoPost: process.env.TIPO_POST_OVERRIDE || undefined,
  });

  console.log('\n✅ Pipeline concluído!');
  console.log(`   slug:    ${resultado.slug}`);
  console.log(`   layout:  ${resultado.layout}`);
  console.log(`   legenda: ${resultado.varianteSelecionada} (A:${resultado.scoreA} B:${resultado.scoreB})`);
}

run().catch(e => {
  console.error('❌ Pipeline falhou:', e.message);
  console.error(e.stack);
  process.exit(1);
});
