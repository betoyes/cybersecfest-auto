'use strict';

const fs = require('fs');
const path = require('path');
const { readVersions, getVersion, versionDirPath } = require('./motion-versoes.js');

const MP4_CANDIDATES = ['preview.mp4', 'preview-draft.mp4'];

function resolveMp4File(slug, root, ver) {
  if (!ver) return null;
  const dir = versionDirPath(slug, root, ver);
  const candidates = [];
  if (ver.mp4) candidates.push(ver.mp4);
  for (const f of MP4_CANDIDATES) {
    if (!candidates.includes(f)) candidates.push(f);
  }
  for (const file of candidates) {
    const full = path.join(dir, file);
    if (fs.existsSync(full)) {
      const relBase = !ver.dir || ver.dir === '.'
        ? `artes/${slug}/motion`
        : `artes/${slug}/motion/${ver.dir}`;
      return {
        file,
        url: `${relBase}/${file}`,
        draft: file.includes('draft'),
        size: fs.statSync(full).size,
      };
    }
  }
  return null;
}

function resolveMp4ForVersion(slug, root, versionId) {
  const data = readVersions(slug, root);
  if (!data) return null;
  const ver = getVersion(data, versionId);
  if (!ver) return null;
  const mp4 = resolveMp4File(slug, root, ver);
  if (!mp4) return { version: ver, mp4: null };
  return { version: ver, mp4 };
}

module.exports = { resolveMp4File, resolveMp4ForVersion, MP4_CANDIDATES };
