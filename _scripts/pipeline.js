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
  console.log(`   modo: ${resultado.modo}`);

  if (resultado.modo === 'visual_banco') {
    console.log(`   slug:   ${resultado.slug} (do banco)`);
    console.log(`   layout: ${resultado.layout}`);
  } else if (resultado.modo === 'propostas') {
    console.log(`   lote:   ${resultado.loteId}`);
    console.log(`   → Aguardando aprovação humana (3 rotas de texto)`);
  } else if (resultado.modo === 'aguardando_aprovacao') {
    console.log(`   lote pendente: ${resultado.loteId}`);
    console.log(`   → Aprove na galeria antes de gerar novas propostas`);
  }
}

run().catch(e => {
  console.error('❌ Pipeline falhou:', e.message);
  console.error(e.stack);
  process.exit(1);
});
