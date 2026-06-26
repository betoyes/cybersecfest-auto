'use strict';

const fs = require('fs');
const path = require('path');

function motionDir(slug, root) {
  return path.join(root, 'artes', slug, 'motion');
}

function versionsFile(slug, root) {
  return path.join(motionDir(slug, root), 'versions.json');
}

function versionDirPath(slug, root, ver) {
  if (!ver.dir || ver.dir === '.') return motionDir(slug, root);
  return path.join(motionDir(slug, root), ver.dir);
}

function versionIndexHtml(slug, root, ver) {
  return path.join(versionDirPath(slug, root, ver), 'index.html');
}

function readVersions(slug, root) {
  const file = versionsFile(slug, root);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(data.versions) || data.versions.length === 0) {
      throw new Error('versions.json inválido');
    }
    return data;
  }

  const indexHtml = path.join(motionDir(slug, root), 'index.html');
  if (!fs.existsSync(indexHtml)) return null;

  return {
    slug,
    preview: 1,
    mp4_from: fs.existsSync(path.join(motionDir(slug, root), 'preview.mp4')) ? 1 : null,
    versions: [{
      id: 1,
      dir: '.',
      preset: null,
      duracao_s: null,
      created_at: new Date().toISOString(),
      note: 'Versão original',
    }],
  };
}

function writeVersions(slug, root, data) {
  fs.mkdirSync(motionDir(slug, root), { recursive: true });
  fs.writeFileSync(versionsFile(slug, root), JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function getVersion(data, id) {
  const n = Number(id);
  return data.versions.find(v => v.id === n) || null;
}

function isDeletableVersion(data, ver) {
  if (!ver || data.versions.length <= 1) return false;
  return Boolean(ver.dir && ver.dir !== '.');
}

function motionHtmlPath(slug, ver) {
  if (!ver.dir || ver.dir === '.') return `artes/${slug}/motion/index.html`;
  return `artes/${slug}/motion/${ver.dir}/index.html`;
}

function syncAnimacoesPreview(slug, root, data) {
  const p = path.join(root, 'animacoes.json');
  if (!fs.existsSync(p)) return;
  let list;
  try { list = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return; }
  const idx = list.findIndex(a => a.slug === slug);
  if (idx < 0) return;
  const previewVer = getVersion(data, data.preview);
  if (!previewVer) return;
  list[idx].motion_html = motionHtmlPath(slug, previewVer);
  list[idx].preset = previewVer.preset || list[idx].preset;
  list[idx].duracao_s = previewVer.duracao_s ?? list[idx].duracao_s;
  list[idx].updated_at = new Date().toISOString();
  fs.writeFileSync(p, JSON.stringify(list, null, 2) + '\n');
}

function setPreview(slug, root, versionId) {
  const data = readVersions(slug, root);
  if (!data) throw new Error('Nenhuma versão motion encontrada');
  const ver = getVersion(data, versionId);
  if (!ver) throw new Error('Versão inexistente: ' + versionId);
  if (!fs.existsSync(versionIndexHtml(slug, root, ver))) {
    throw new Error('Composição ausente para versão ' + versionId);
  }
  data.preview = ver.id;
  writeVersions(slug, root, data);
  return data;
}

function setMp4From(slug, root, versionId) {
  const data = readVersions(slug, root);
  if (!data) throw new Error('Nenhuma versão motion encontrada');
  const ver = getVersion(data, versionId);
  if (!ver) throw new Error('Versão inexistente: ' + versionId);
  data.mp4_from = ver.id;
  writeVersions(slug, root, data);
  return data;
}

function deleteVersion(slug, root, versionId) {
  const data = readVersions(slug, root);
  if (!data) throw new Error('Nenhuma versão motion encontrada');

  const ver = getVersion(data, versionId);
  if (!ver) throw new Error('Versão inexistente: ' + versionId);
  if (!isDeletableVersion(data, ver)) {
    throw new Error('Só é possível excluir versões criadas (v2, v3…). A original permanece.');
  }

  const dirPath = versionDirPath(slug, root, ver);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }

  data.versions = data.versions.filter(v => v.id !== ver.id);

  if (data.preview === ver.id) {
    const fallback = data.versions.find(v => v.dir === '.') || data.versions[data.versions.length - 1];
    data.preview = fallback?.id ?? data.versions[0]?.id;
  }
  if (data.mp4_from === ver.id) data.mp4_from = null;

  writeVersions(slug, root, data);
  syncAnimacoesPreview(slug, root, data);
  return data;
}

function nextVersionId(data) {
  return Math.max(0, ...data.versions.map(v => v.id)) + 1;
}

module.exports = {
  readVersions,
  writeVersions,
  setPreview,
  setMp4From,
  deleteVersion,
  isDeletableVersion,
  nextVersionId,
  versionIndexHtml,
  versionDirPath,
  motionDir,
  getVersion,
};
