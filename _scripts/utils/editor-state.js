'use strict';

const DEFAULT_STATE = {
  x: 50, y: 50, z: 110, bo: 100, fl: false, oo: 100, bgc: '#02050A', ol: 'original', fw: '700',
  tta: 'center', sta: 'center',
  lx: 0, ly: 0, ls: 100, lo: 100,
  tx: 0, ty: 0, ts: 100,
  sx: 0, sy: 0,
  ex: 0, ey: 0, eo: 75,
};

function normalizeState(raw) {
  const s = { ...DEFAULT_STATE, ...(raw && typeof raw === 'object' ? raw : {}) };
  if (raw && raw.ta && !raw.tta) s.tta = raw.ta;
  if (raw && raw.ta && !raw.sta) s.sta = raw.ta;
  delete s.ta;
  return s;
}

function extractEditorState(html) {
  const m = html.match(/<script[^>]*id="editor-state"[^>]*>([\s\S]*?)<\/script>/i);
  if (!m) return null;
  try {
    return normalizeState(JSON.parse(m[1].trim()));
  } catch {
    return null;
  }
}

function upsertEditorState(html, state) {
  const json = JSON.stringify(normalizeState(state));
  const block = `<script type="application/json" id="editor-state">${json}</script>`;

  if (/<script[^>]*id="editor-state"/i.test(html)) {
    return html.replace(/<script[^>]*id="editor-state"[^>]*>[\s\S]*?<\/script>/i, block);
  }

  const anchor = html.match(/<script>\(function\(\)/);
  if (anchor) {
    const idx = html.indexOf(anchor[0]);
    return html.slice(0, idx) + block + '\n' + html.slice(idx);
  }

  return html.replace(/<\/body>/i, `${block}\n</body>`);
}

module.exports = {
  DEFAULT_STATE,
  normalizeState,
  extractEditorState,
  upsertEditorState,
};
