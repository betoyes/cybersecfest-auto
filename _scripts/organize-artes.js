'use strict';

const fs   = require('fs');
const path = require('path');
const { wrapWithEditor } = require('./utils/editor-wrap.js');

const ROOT = path.join(__dirname, '..', 'artes');

for (const slug of fs.readdirSync(ROOT)) {
  const dir = path.join(ROOT, slug);
  if (!fs.statSync(dir).isDirectory()) continue;

  const artePath  = path.join(dir, 'arte.html');
  const indexPath = path.join(dir, 'index.html');
  if (!fs.existsSync(artePath)) continue;

  let html = fs.readFileSync(artePath, 'utf8');

  if (!html.includes('id="topbar"')) {
    const layout = (html.match(/Layout ([A-Q])/) || slug.match(/^(blog|evento)/) || ['','C'])[1] || 'C';
    const headline = (html.match(/class="hl"[^>]*>([^<]+)/) || ['','Arte'])[1].slice(0, 80);
    html = wrapWithEditor(html, { layout, headline, slug });
    fs.writeFileSync(artePath, html);
    console.log('🎨 editor:', slug);
  } else if (html.includes('href="../../index.html"')) {
    html = html.replace(
      'href="../../index.html"',
      `href="../../index.html#arte=${slug}"`
    );
    fs.writeFileSync(artePath, html);
    console.log('🔗 back link:', slug);
  }

  if (fs.existsSync(indexPath)) {
    let idx = fs.readFileSync(indexPath, 'utf8');
    const updated = idx
      .replace('href="/"', `href="../../index.html#arte=${slug}"`)
      .replace('href="../../index.html"', `href="../../index.html#arte=${slug}"`);
    if (updated !== idx) {
      fs.writeFileSync(indexPath, updated);
      console.log('🔗 index:', slug);
    }
  }
}

console.log('✅ Artes organizadas');
