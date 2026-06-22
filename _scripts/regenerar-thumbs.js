'use strict';

/**
 * Regenera thumb.png composto (fundo + overlay + texto) para todas as artes.
 * Não altera arte.html nem fundo.png — só captura #the-canvas via Puppeteer.
 *
 * IMPORTANTE: a galeria (index.html) usa thumb.png nos cards.
 * Se restaurar arte.html do git, rode os thumbs das referências ouro:
 *   node regenerar-thumbs.js patrocinador-1782039190901 evento-1782045624931 blog-1782058741657
 *
 * Uso:
 *   node regenerar-thumbs.js              → todas as artes em artes.json
 *   node regenerar-thumbs.js slug1 slug2    → slugs específicos
 */

const fs   = require('fs');
const path = require('path');

const { gerarThumbComposto } = require('./utils/thumb-composto.js');

const ROOT       = path.join(__dirname, '..');
const ARTES_DIR  = path.join(ROOT, 'artes');
const ARTes_JSON = path.join(ROOT, 'artes.json');

async function regenerarThumb(arte) {
  const slug     = arte.slug;
  const slugDir  = path.join(ARTES_DIR, slug);
  const artePath = path.join(slugDir, 'arte.html');
  const thumbPath = path.join(slugDir, 'thumb.png');

  if (!fs.existsSync(artePath)) {
    throw new Error(`arte.html não encontrado — ${slug}`);
  }

  const before = fs.existsSync(thumbPath) ? fs.statSync(thumbPath).size : 0;
  await gerarThumbComposto(artePath, thumbPath);
  const after = fs.statSync(thumbPath).size;

  return { slug, kb: Math.round(after / 1024), changed: before !== after };
}

async function main() {
  const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const artes = JSON.parse(fs.readFileSync(ARTes_JSON, 'utf8'));

  const targets = only.length
    ? artes.filter(a => only.includes(a.slug))
    : artes;

  if (only.length && targets.length !== only.length) {
    const found = new Set(targets.map(a => a.slug));
    const missing = only.filter(s => !found.has(s));
    console.warn(`⚠️  Slugs não encontrados em artes.json: ${missing.join(', ')}`);
  }

  if (targets.length === 0) {
    console.log('Nenhuma arte para processar.');
    return;
  }

  console.log(`📸 Regenerando ${targets.length} thumb(s) composto(s)…\n`);

  let ok = 0;
  let fail = 0;

  for (const arte of targets) {
    try {
      const r = await regenerarThumb(arte);
      const tag = r.changed ? 'atualizado' : 'ok';
      console.log(`✅ ${r.slug} — ${r.kb} KB (${tag})`);
      ok++;
    } catch (e) {
      console.error(`❌ ${arte.slug}: ${e.message}`);
      fail++;
    }
  }

  console.log(`\n✅ Concluído — ${ok} ok, ${fail} falha(s)`);
  if (fail) process.exit(1);
}

main().catch(e => {
  console.error('❌', e.message);
  process.exit(1);
});
