#!/usr/bin/env node
/**
 * AnimAgent CLI — prepara assets e dispara render HyperFrames.
 * Uso: node _scripts/animar-arte.js --slug blog-xxx [--preset entrance-premium-6s] [--draft]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function parseArgs(argv) {
  const out = { slug: null, preset: 'entrance-premium-6s', draft: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--slug') out.slug = argv[++i];
    else if (argv[i] === '--preset') out.preset = argv[++i];
    else if (argv[i] === '--draft') out.draft = true;
  }
  return out;
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function prepareAssets(slug) {
  const arteDir = path.join(ROOT, 'artes', slug);
  const motionAssets = path.join(arteDir, 'motion', 'assets');
  const copies = [
    [path.join(arteDir, 'fundo.png'), path.join(motionAssets, 'fundo.png')],
    [path.join(ROOT, 'assets', 'logo-cyberfest.png'), path.join(motionAssets, 'logo-cyberfest.png')],
    [path.join(ROOT, 'assets', 'logo-devops.webp'), path.join(motionAssets, 'logo-devops.webp')],
    [path.join(ROOT, 'assets', 'logo-iam.webp'), path.join(motionAssets, 'logo-iam.webp')],
    [path.join(ROOT, 'assets', 'logo-alcatraz.webp'), path.join(motionAssets, 'logo-alcatraz.webp')],
  ];
  for (const [src, dest] of copies) {
    if (!fs.existsSync(src)) throw new Error(`Arquivo ausente: ${src}`);
    copyFile(src, dest);
    console.log(`✓ ${path.relative(ROOT, dest)}`);
  }
}

function main() {
  const { slug, preset, draft } = parseArgs(process.argv);
  if (!slug) {
    console.error('Uso: node _scripts/animar-arte.js --slug <slug> [--preset entrance-premium-6s] [--draft]');
    process.exit(1);
  }

  const motionDir = path.join(ROOT, 'artes', slug, 'motion');
  const indexHtml = path.join(motionDir, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.error(`Composição não encontrada: ${indexHtml}`);
    console.error('Crie motion/index.html antes de renderizar (ver _agents/animador/SKILL.md).');
    process.exit(1);
  }

  console.log(`\n🎬 AnimAgent — ${slug} (${preset})\n`);
  prepareAssets(slug);

  console.log('\n◆ lint…');
  execSync('npx hyperframes lint', { cwd: motionDir, stdio: 'inherit' });

  const renderCmd = draft ? 'npm run render:draft' : 'npm run render';
  console.log(`\n◆ render (${draft ? 'draft' : 'high'})…`);
  execSync(renderCmd, { cwd: motionDir, stdio: 'inherit' });

  console.log(`\n✅ MP4: artes/${slug}/motion/preview.mp4\n`);
}

main();
