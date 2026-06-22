'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_ASSETS = 'https://raw.githubusercontent.com/betoyes/cybersecfest-auto/main/assets';
const CACHE_FILE  = path.join(__dirname, '.asset-cache.json');

function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try { return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); } catch { /* refresh */ }
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function mimeFor(name) {
  const ext = path.extname(name).slice(1).toLowerCase();
  if (ext === 'webp') return 'image/webp';
  if (ext === 'png')  return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

/** Retorna data URI embutido — referência SuperAgent (sem dependência de URL externa no thumb). */
function assetDataUri(name) {
  const cache = loadCache();
  if (cache[name]) return cache[name];

  const url = `${BASE_ASSETS}/${name}`;
  const buf = execSync(`curl -fsSL "${url}"`, {
    encoding: null,
    maxBuffer: 15 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const uri = `data:${mimeFor(name)};base64,${buf.toString('base64')}`;
  cache[name] = uri;
  saveCache(cache);
  return uri;
}

module.exports = { assetDataUri, BASE_ASSETS };
