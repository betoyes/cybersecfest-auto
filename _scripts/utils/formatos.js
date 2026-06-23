'use strict';

/** Dimensões de preview (editor) e export — base de diagramação 540×675 */
const FORMATOS = {
  feed_vertical: {
    id: 'feed_vertical',
    label: 'Feed Vertical 4:5',
    w: 540,
    h: 675,
    exportW: 1080,
    exportH: 1350,
    innerW: 540,
    innerH: 675,
    innerScale: 1,
    innerOffsetY: 0,
  },
  feed_quadrado: {
    id: 'feed_quadrado',
    label: 'Feed Quadrado 1:1',
    w: 540,
    h: 540,
    exportW: 1080,
    exportH: 1080,
    innerW: 540,
    innerH: 675,
    innerScale: 540 / 675,
    innerOffsetY: 0,
  },
  stories: {
    id: 'stories',
    label: 'Stories 9:16',
    w: 540,
    h: 960,
    exportW: 1080,
    exportH: 1920,
    innerW: 540,
    innerH: 675,
    innerScale: 1,
    innerOffsetY: Math.round((960 - 675) / 2),
  },
};

const DEFAULT_FORMATO = 'feed_vertical';

function resolveFormato(id) {
  const key = String(id || DEFAULT_FORMATO).toLowerCase();
  return FORMATOS[key] || FORMATOS[DEFAULT_FORMATO];
}

function listFormatos() {
  return Object.values(FORMATOS);
}

function wrapCanvasInner(inner, formatoId) {
  const f = resolveFormato(formatoId);
  const scale = f.innerScale;
  const offY = f.innerOffsetY;
  const style = [
    `width:${f.innerW}px`,
    `height:${f.innerH}px`,
    scale !== 1 ? `transform:scale(${scale})` : '',
    scale !== 1 ? 'transform-origin:top center' : '',
    offY ? `margin-top:${offY}px` : '',
  ].filter(Boolean).join(';');
  return `<div class="art-canvas-inner" style="${style}">${inner}</div>`;
}

function canvasAttrs(formatoId) {
  const f = resolveFormato(formatoId);
  return {
    width: f.w,
    height: f.h,
    exportW: f.exportW,
    exportH: f.exportH,
    label: f.label,
    id: f.id,
  };
}

module.exports = {
  FORMATOS,
  DEFAULT_FORMATO,
  resolveFormato,
  listFormatos,
  wrapCanvasInner,
  canvasAttrs,
};
