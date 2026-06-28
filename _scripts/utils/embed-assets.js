'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_ASSETS  = 'https://raw.githubusercontent.com/betoyes/cybersecfest-auto/main/assets';
const LOCAL_ASSETS = path.join(__dirname, '../../assets');
const CACHE_FILE   = path.join(__dirname, '.asset-cache.json');

let _memCache = null;

function loadCache() {
  if (_memCache) return _memCache;
  if (fs.existsSync(CACHE_FILE)) {
    try { _memCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); return _memCache; } catch { /* refresh */ }
  }
  _memCache = {};
  return _memCache;
}

function saveCache(cache) {
  _memCache = cache;
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function mimeFor(name) {
  const ext = path.extname(name).slice(1).toLowerCase();
  if (ext === 'webp') return 'image/webp';
  if (ext === 'png')  return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

/** Retorna data URI embutido — tenta local primeiro, depois GitHub. */
function assetDataUri(name) {
  const cache = loadCache();
  if (cache[name]) return cache[name];

  let buf;

  // 1 — arquivo local (sempre disponível em dev, e em CI se commitado)
  const localPath = path.join(LOCAL_ASSETS, name);
  if (fs.existsSync(localPath)) {
    buf = fs.readFileSync(localPath);
  } else {
    // 2 — fallback: GitHub raw
    const url = `${BASE_ASSETS}/${name}`;
    buf = execSync(`curl -fsSL "${url}"`, {
      encoding: null,
      maxBuffer: 15 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe']
    });
  }

  const uri = `data:${mimeFor(name)};base64,${buf.toString('base64')}`;
  cache[name] = uri;
  saveCache(cache);
  return uri;
}

module.exports = { assetDataUri, BASE_ASSETS };
