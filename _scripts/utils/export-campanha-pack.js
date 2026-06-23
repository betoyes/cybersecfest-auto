'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

function safeName(s) {
  return String(s || 'peca').replace(/[^\w\-]+/g, '-').slice(0, 40);
}

/**
 * Gera ZIP com copy + legendas de um lote de campanha (texto pronto para publicar).
 * @returns {string} caminho do arquivo .zip
 */
function exportCampanhaPack(lote, rootDir) {
  if (!lote?.propostas?.length) throw new Error('Lote sem propostas');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'csf-campanha-'));
  const manifest = {
    lote_id: lote.id,
    modo: lote.modo || 'campanha',
    objetivo: lote.objetivo || null,
    criado_em: lote.criado_em,
    pecas: [],
  };

  lote.propostas.forEach((p, i) => {
    const folder = `${String(i + 1).padStart(2, '0')}-${safeName(p.angulo || p.tipo_post)}`;
    const dir = path.join(tmp, folder);
    fs.mkdirSync(dir, { recursive: true });

    const copy = {
      angulo: p.angulo,
      tipo_post: p.tipo_post,
      formato: p.formato || 'feed_vertical',
      headline: p.headline,
      palavras_azuis: p.palavras_azuis,
      subtitulo: p.subtitulo,
      cta_visual: p.cta_visual,
      cidade: p.cidade,
      contexto_visual: p.contexto_visual,
      slug: p.slug_gerado || lote.slug_gerado && p.id === lote.principal_id ? lote.slug_gerado : p.slug || null,
    };

    fs.writeFileSync(path.join(dir, 'copy.json'), JSON.stringify(copy, null, 2) + '\n');
    fs.writeFileSync(path.join(dir, 'legenda.txt'), (p.legenda || '').trim() + '\n');
    fs.writeFileSync(path.join(dir, 'headline.txt'), (p.headline || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim() + '\n');

    const slug = copy.slug;
    if (slug && rootDir) {
      const thumb = path.join(rootDir, 'artes', slug, 'thumb.png');
      if (fs.existsSync(thumb)) {
        fs.copyFileSync(thumb, path.join(dir, 'thumb.png'));
      }
      const arteHtml = path.join(rootDir, 'artes', slug, 'arte.html');
      if (fs.existsSync(arteHtml)) {
        fs.copyFileSync(arteHtml, path.join(dir, 'arte.html'));
      }
    }

    manifest.pecas.push({ folder, id: p.id, ...copy });
  });

  fs.writeFileSync(path.join(tmp, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(path.join(tmp, 'README.txt'),
    `CybersecFEST — Pack de campanha\nLote: ${lote.id}\nPeças: ${lote.propostas.length}\n\nCada pasta tem copy.json, headline.txt e legenda.txt.\nQuando houver arte gerada, inclui thumb.png e arte.html.\n`);

  const outDir = path.join(rootDir, 'exports');
  fs.mkdirSync(outDir, { recursive: true });
  const zipPath = path.join(outDir, `campanha-${lote.id}.zip`);
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  execFileSync('zip', ['-r', zipPath, '.'], { cwd: tmp });
  fs.rmSync(tmp, { recursive: true, force: true });

  return zipPath;
}

module.exports = { exportCampanhaPack };
