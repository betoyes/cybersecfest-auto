'use strict';

const fs = require('fs');
const path = require('path');
const { getJSON, putJSON, isLocal } = require('./storage.js');

const ROOT = path.join(__dirname, '../..');

/**
 * Remove arte do acervo local: entrada em artes.json, pasta artes/{slug}/ e slug em historico_recente.
 * Requer LOCAL_MODE (servidor dev).
 */
async function removerArte(slug) {
  if (!isLocal) {
    throw new Error('Exclusão só funciona com o servidor local (cd _scripts && npm run dev)');
  }

  const clean = String(slug || '').trim();
  if (!/^[\w-]+$/.test(clean) || !clean.includes('-')) {
    throw new Error('slug inválido');
  }

  const artesFile = await getJSON('artes.json');
  if (!artesFile) throw new Error('artes.json não encontrado');

  const artes = artesFile.data;
  const idx = artes.findIndex(a => a.slug === clean);
  if (idx < 0) throw new Error(`Arte não encontrada: ${clean}`);

  const removed = artes[idx];
  artes.splice(idx, 1);
  await putJSON('artes.json', artes, `[Dev] remove arte: ${clean}`, artesFile.sha);

  const temasFile = await getJSON('temas.json');
  if (temasFile?.data?.historico_recente) {
    const temas = temasFile.data;
    const antes = temas.historico_recente.length;
    temas.historico_recente = temas.historico_recente.filter(h => h.slug !== clean);
    if (temas.historico_recente.length !== antes) {
      await putJSON('temas.json', temas, `[Dev] historico: remove ${clean}`, temasFile.sha);
    }
  }

  const arteDir = path.join(ROOT, 'artes', clean);
  if (fs.existsSync(arteDir)) {
    fs.rmSync(arteDir, { recursive: true, force: true });
  }

  return { slug: clean, headline: removed.headline || '', tipo: removed.tipo || '' };
}

module.exports = { removerArte };
