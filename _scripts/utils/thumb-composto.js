'use strict';

const path = require('path');
const fs   = require('fs');

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser'
].filter(Boolean);

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * Captura #the-canvas do arte.html (modo ?embed) como thumb.png composto.
 */
async function gerarThumbComposto(arteHtmlPath, thumbOutPath) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer-core');
  } catch {
    try {
      puppeteer = require('puppeteer');
    } catch {
      throw new Error('Instale puppeteer-core: npm install puppeteer-core');
    }
  }

  const executablePath = findChrome();
  if (!executablePath && !process.env.PUPPETEER_EXECUTABLE_PATH) {
    throw new Error('Chrome/Chromium não encontrado para captura do thumb');
  }

  const absHtml = path.resolve(arteHtmlPath);
  const url     = `file://${absHtml}?embed`;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 620, height: 780, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.waitForSelector('#the-canvas', { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 1200));

    const canvas = await page.$('#the-canvas');
    if (!canvas) throw new Error('#the-canvas não encontrado');

    await canvas.screenshot({ path: thumbOutPath, type: 'jpeg', quality: 88 });
  } finally {
    await browser.close();
  }
}

module.exports = { gerarThumbComposto };
