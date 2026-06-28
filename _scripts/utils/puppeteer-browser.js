'use strict';

const fs = require('fs');

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
].filter(Boolean);

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function launchBrowser() {
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

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || findChrome();
  if (!executablePath) {
    throw new Error('Chrome/Chromium não encontrado. Defina CHROME_PATH ou PUPPETEER_EXECUTABLE_PATH.');
  }

  return puppeteer.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });
}

module.exports = { launchBrowser, findChrome };
