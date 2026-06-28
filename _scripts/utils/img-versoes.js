'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');

function imgVersDir(slug) {
  return path.join(ROOT, 'artes', slug, 'img-versoes');
}

function imgVersIndexPath(slug) {
  return path.join(imgVersDir(slug), 'index.json');
}

function readImgVersoes(slug) {
  const p = imgVersIndexPath(slug);
  if (!fs.existsSync(p)) return { ativa: null, versoes: [] };
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return { ativa: null, versoes: [] }; }
}

function writeImgVersoes(slug, data) {
  fs.mkdirSync(imgVersDir(slug), { recursive: true });
  fs.writeFileSync(imgVersIndexPath(slug), JSON.stringify(data, null, 2) + '\n');
}

function nextImgVersId(data) {
  if (!data.versoes.length) return 1;
  return Math.max(...data.versoes.map(v => v.id)) + 1;
}

function saveImgVersion(slug, fundoPath, thumbPath, label) {
  const data = readImgVersoes(slug);
  const id   = nextImgVersId(data);
  const vDir = path.join(imgVersDir(slug), `v${id}`);
  fs.mkdirSync(vDir, { recursive: true });
  if (fs.existsSync(fundoPath)) fs.copyFileSync(fundoPath, path.join(vDir, 'fundo.png'));
  if (fs.existsSync(thumbPath)) fs.copyFileSync(thumbPath, path.join(vDir, 'thumb.png'));
  data.versoes.push({ id, criada_em: new Date().toISOString(), label: label || '' });
  data.ativa = id;
  writeImgVersoes(slug, data);
  return { data, id };
}

module.exports = { imgVersDir, readImgVersoes, writeImgVersoes, saveImgVersion };
