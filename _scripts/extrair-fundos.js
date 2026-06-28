'use strict';

/**
 * Extrai fundo-raw.png de cada post que ainda não tem o arquivo.
 * Abre arte.html com Puppeteer, captura o background-image do #art-bg
 * (foto pura sem texto baked) e salva como artes/{slug}/fundo-raw.png.
 *
 * Uso: LOCAL_MODE=1 node extrair-fundos.js [--slug <slug>]
 */

process.env.LOCAL_MODE = process.env.LOCAL_MODE || '1';
require('./load-env.js');

const fs   = require('fs');
const path = require('path');
const { launchBrowser } = require('./utils/puppeteer-browser.js');

const ROOT = path.join(__dirname, '..');

async function extrairFundo(browser, slug) {
  const arteHtmlPath = path.join(ROOT, 'artes', slug, 'arte.html');
  const fundoRawPath = path.join(ROOT, 'artes', slug, 'fundo-raw.png');

  if (!fs.existsSync(arteHtmlPath)) {
    console.warn(`  [SKIP] arte.html não encontrada: ${slug}`);
    return false;
  }

  const url = `file://${path.resolve(arteHtmlPath)}?embed`;
  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);

    // Extrai o data URI do background-image do #art-bg
    const dataUri = await page.evaluate(() => {
      const el = document.querySelector('#art-bg');
      if (!el) return null;
      const bg = window.getComputedStyle(el).backgroundImage;
      // formato: url("data:image/png;base64,...")
      const match = bg.match(/url\(["']?(data:[^"')]+)["']?\)/);
      return match ? match[1] : null;
    });

    if (!dataUri) {
      console.warn(`  [SKIP] #art-bg sem background-image data URI: ${slug}`);
      return false;
    }

    // Decodifica base64 e salva
    const [header, b64] = dataUri.split(',');
    if (!b64) {
      console.warn(`  [SKIP] data URI malformada: ${slug}`);
      return false;
    }

    fs.writeFileSync(fundoRawPath, Buffer.from(b64, 'base64'));
    console.log(`  [OK]   fundo-raw.png salvo (${Math.round(fs.statSync(fundoRawPath).size / 1024)} KB): ${slug}`);
    return true;
  } finally {
    await page.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const slugIdx = args.indexOf('--slug');
  const targetSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;

  const artesJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'artes.json'), 'utf8'));

  const pendentes = artesJson.filter(a => {
    if (targetSlug && a.slug !== targetSlug) return false;
    const fundoRawPath = path.join(ROOT, 'artes', a.slug, 'fundo-raw.png');
    return !fs.existsSync(fundoRawPath);
  });

  if (pendentes.length === 0) {
    console.log('Todos os posts já têm fundo-raw.png. Nada a fazer.');
    return;
  }

  console.log(`Extraindo fundo-raw.png para ${pendentes.length} post(s)...\n`);

  const browser = await launchBrowser();
  let ok = 0;
  let erros = 0;

  try {
    for (const arte of pendentes) {
      process.stdout.write(`→ ${arte.slug} `);
      try {
        const sucesso = await extrairFundo(browser, arte.slug);
        if (sucesso) ok++; else erros++;
      } catch (e) {
        console.error(`\n  [ERRO] ${arte.slug}: ${e.message}`);
        erros++;
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nConcluído: ${ok} extraídos, ${erros} ignorados/erros.`);
}

main().catch(e => { console.error('Erro fatal:', e.message); process.exit(1); });
