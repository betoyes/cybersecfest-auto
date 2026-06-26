'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  pickSurpresaPreset,
  buildFromPreset,
  arteToContext,
  applyAjustesHtml,
  resolvePresetId,
  getPresetMeta,
} = require('./motion-presets.js');
const { readVersions, writeVersions, versionIndexHtml, motionDir } = require('./motion-versoes.js');

const PACKAGE_JSON = {
  name: 'motion',
  private: true,
  type: 'module',
  scripts: {
    dev: 'npx --yes hyperframes@0.7.3 preview',
    check: 'npx --yes hyperframes@0.7.3 lint && npx --yes hyperframes@0.7.3 validate',
    render: 'npx --yes hyperframes@0.7.3 render --fps 30 --quality high --output preview.mp4',
    'render:draft': 'npx --yes hyperframes@0.7.3 render --quality draft --output preview-draft.mp4',
  },
};

const HYPERFRAMES_JSON = {
  $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json',
  registry: 'https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry',
  paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' },
};

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function findFontsSource(root) {
  const { SANDBOX_SLUG } = require('./motion-sandbox.js');
  const candidates = [
    path.join(root, 'artes', SANDBOX_SLUG, 'motion/assets/fonts'),
    path.join(root, 'assets/fonts'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function copyVersionAssets(slug, versionDir, root) {
  const assetsDir = path.join(versionDir, 'assets');
  const arteDir = path.join(root, 'artes', slug);

  /* fundo-raw.png = foto pura sem texto baked (extraída do art-bg).
     Priorizado sobre thumb.png para evitar double-text nas composições animadas. */
  const fundoCandidates = [
    path.join(arteDir, 'fundo-raw.png'),
    path.join(arteDir, 'fundo.png'),
    path.join(arteDir, 'thumb.png'),
  ];
  const fundoSrc = fundoCandidates.find(f => fs.existsSync(f));
  if (!fundoSrc) throw new Error(`Sem imagem de fundo para ${slug} (fundo-raw.png, fundo.png ou thumb.png ausentes)`);

  const copies = [
    [fundoSrc, path.join(assetsDir, 'fundo.png')],
    [path.join(root, 'assets/logo-cyberfest.png'), path.join(assetsDir, 'logo-cyberfest.png')],
    [path.join(root, 'assets/logo-devops.webp'), path.join(assetsDir, 'logo-devops.webp')],
    [path.join(root, 'assets/logo-iam.webp'), path.join(assetsDir, 'logo-iam.webp')],
    [path.join(root, 'assets/logo-alcatraz.webp'), path.join(assetsDir, 'logo-alcatraz.webp')],
  ];
  for (const [src, dest] of copies) {
    if (!fs.existsSync(src)) {
      console.warn('[motion-gerador] asset ausente (ignorado):', src);
      continue;
    }
    copyFile(src, dest);
  }
  const fontsSrc = findFontsSource(root);
  if (fontsSrc) {
    const fontsDest = path.join(assetsDir, 'fonts');
    fs.mkdirSync(fontsDest, { recursive: true });
    for (const f of fs.readdirSync(fontsSrc)) {
      if (f.endsWith('.woff2')) copyFile(path.join(fontsSrc, f), path.join(fontsDest, f));
    }
  }
}

function loadArte(slug, root) {
  const artesPath = path.join(root, 'artes.json');
  const artes = JSON.parse(fs.readFileSync(artesPath, 'utf8'));
  const arte = artes.find(a => a.slug === slug);
  if (!arte) throw new Error('Arte não encontrada: ' + slug);
  return arte;
}

function readBaseVersionHtml(slug, root, baseVersionId) {
  const versions = readVersions(slug, root);
  const ver = versions.versions.find(v => v.id === baseVersionId);
  if (!ver) throw new Error('Versão base não encontrada: ' + baseVersionId);
  const file = versionIndexHtml(slug, root, ver);
  if (!fs.existsSync(file)) throw new Error('HTML base ausente: ' + file);
  return { html: fs.readFileSync(file, 'utf8'), ver };
}

function registerVersionEntry(slug, root, entry, previewId) {
  const data = readVersions(slug, root);
  if (data.versions.some(v => v.id === entry.id)) {
    throw new Error('Versão já existe: ' + entry.id);
  }
  data.versions.push(entry);
  data.preview = previewId || entry.id;
  writeVersions(slug, root, data);
  return data;
}

function ensureAnimacoesEntry(slug, root, meta) {
  const p = path.join(root, 'animacoes.json');
  let list = [];
  if (fs.existsSync(p)) list = JSON.parse(fs.readFileSync(p, 'utf8'));
  const idx = list.findIndex(a => a.slug === slug);
  const base = {
    slug,
    preset: meta.preset,
    duracao_s: meta.duracao_s,
    formato: meta.formato || 'feed_vertical',
    layout: meta.layout || 'C',
    headline: meta.headline,
    arte_estatica: `artes/${slug}/arte.html`,
    motion_html: `artes/${slug}/motion/${meta.dir === '.' ? '' : meta.dir + '/'}index.html`.replace('motion//', 'motion/'),
    motion_mp4: null,
    status: 'preview_html',
    agente: 'AnimAgent',
    updated_at: new Date().toISOString(),
  };
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...base };
  } else {
    list.push({ ...base, created_at: new Date().toISOString() });
  }
  fs.writeFileSync(p, JSON.stringify(list, null, 2) + '\n');
}

function lintVersion(versionDir) {
  try {
    execSync('npx --yes hyperframes@0.7.3 lint', { cwd: versionDir, stdio: 'pipe' });
  } catch (e) {
    const msg = e.stderr?.toString() || e.message;
    throw new Error('Lint falhou: ' + msg.slice(0, 200));
  }
}

function writeVersionFiles(versionDir, html, meta) {
  fs.mkdirSync(versionDir, { recursive: true });
  fs.writeFileSync(path.join(versionDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(versionDir, 'package.json'), JSON.stringify(PACKAGE_JSON, null, 2) + '\n');
  fs.writeFileSync(path.join(versionDir, 'hyperframes.json'), JSON.stringify(HYPERFRAMES_JSON, null, 2) + '\n');
  fs.writeFileSync(path.join(versionDir, 'design.md'), [
    `# Motion v${meta.id} — ${meta.preset}`,
    '',
    `- Modo: ${meta.note}`,
    `- Duração: ${meta.duracao_s}s`,
    `- Gerado: ${meta.created_at}`,
  ].join('\n') + '\n', 'utf8');
  copyVersionAssets(meta.slug, versionDir, meta.root);
}

async function gerarNovaVersao(slug, pedido, root) {
  const arte = loadArte(slug, root);
  const ctx = arteToContext(arte);

  /* Inicializa versions.json se for o primeiro motion deste post */
  let versions = readVersions(slug, root);
  if (!versions) {
    versions = { slug, preview: null, mp4_from: null, versions: [] };
    writeVersions(slug, root, versions);
  }

  const targetId = pedido.targetVersion;
  const dirName = `v${targetId}`;
  const versionDir = path.join(motionDir(slug, root), dirName);
  const created_at = new Date().toISOString();

  let built;

  if (pedido.mode === 'ajustar') {
    const { html, ver } = readBaseVersionHtml(slug, root, pedido.baseVersion || versions.preview || 1);
    const adjusted = applyAjustesHtml(html, pedido.instrucoes);
    built = {
      html: adjusted,
      preset: ver.preset ? `${ver.preset}-ajuste` : 'ajuste-custom',
      duracao_s: ver.duracao_s || 7,
      compositionId: ver.preset || 'ajuste-custom',
    };
  } else {
    const used = versions.versions.map(v => v.preset);
    const presetId = resolvePresetId(pedido.presetId, used);
    built = buildFromPreset(presetId, ctx);
  }

  const presetMeta = getPresetMeta(built.preset);
  const entry = {
    id: targetId,
    dir: dirName,
    preset: built.preset,
    duracao_s: built.duracao_s,
    created_at,
    note: pedido.mode === 'ajustar'
      ? `Ajuste: ${pedido.instrucoes.slice(0, 80)}`
      : pedido.presetId
        ? `Preset escolhido: ${presetMeta?.nome || built.preset}`
        : 'Variação criativa automática',
    mp4: null,
  };

  writeVersionFiles(versionDir, built.html, {
    id: targetId,
    preset: built.preset,
    duracao_s: built.duracao_s,
    note: entry.note,
    created_at,
    slug,
    root,
  });

  lintVersion(versionDir);
  const updated = registerVersionEntry(slug, root, entry, targetId);
  ensureAnimacoesEntry(slug, root, {
    preset: built.preset,
    duracao_s: built.duracao_s,
    formato: arte.formato,
    layout: arte.layout,
    headline: arte.headline,
    dir: dirName,
  });

  return { entry, versions: updated, versionDir };
}

module.exports = { gerarNovaVersao, copyVersionAssets };
