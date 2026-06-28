'use strict';

const path = require('path');
const { launchBrowser } = require('./puppeteer-browser.js');

/**
 * Captura #the-canvas do arte.html (modo ?embed) como thumb composto.
 */
async function gerarThumbComposto(arteHtmlPath, thumbOutPath) {
  const isUrl = arteHtmlPath.startsWith('http://') || arteHtmlPath.startsWith('https://');
  const url = isUrl
    ? (arteHtmlPath.includes('?') ? arteHtmlPath : arteHtmlPath + '?embed')
    : `file://${path.resolve(arteHtmlPath)}?embed`;
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 620, height: 780, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForSelector('#the-canvas', { timeout: 15000 });
    // Aguarda todas as imagens carregarem (inclui base64 grandes)
    await page.evaluate(() => Promise.all(
      [...document.images].map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
      )
    ));
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 800));

    const canvas = await page.$('#the-canvas');
    if (!canvas) throw new Error('#the-canvas não encontrado');

    await canvas.screenshot({ path: thumbOutPath, type: 'jpeg', quality: 88 });
  } finally {
    await browser.close();
  }
}

module.exports = { gerarThumbComposto };
