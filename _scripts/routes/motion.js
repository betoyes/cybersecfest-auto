'use strict';

module.exports = function setupMotionRoutes({ ROOT, json, readBody, log, motionPending }) {
  const path       = require('path');
  const scriptsDir = path.join(__dirname, '..');

  async function handleMotionSelecionar(req, res) {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
    const slug    = String(payload.slug || '').trim();
    const version = Number(payload.version);
    if (!slug || !Number.isFinite(version)) return json(res, 400, { ok: false, erro: 'slug e version obrigatórios' });
    try {
      const { setPreview } = require('../utils/motion-versoes.js');
      const data = setPreview(slug, ROOT, version);
      log.info(`Motion preview: ${slug} → v${version}`);
      json(res, 200, { ok: true, versions: data });
    } catch (e) { json(res, 500, { ok: false, erro: e.message }); }
  }

  async function handleMotionAprovarMp4(req, res) {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
    const slug    = String(payload.slug || '').trim();
    const version = Number(payload.version);
    if (!slug || !Number.isFinite(version)) return json(res, 400, { ok: false, erro: 'slug e version obrigatórios' });
    try {
      const { setMp4From }           = require('../utils/motion-versoes.js');
      const { resolveMp4ForVersion } = require('../utils/motion-mp4.js');
      const data     = setMp4From(slug, ROOT, version);
      const resolved = resolveMp4ForVersion(slug, ROOT, version);
      log.info(`Motion MP4 aprovado: ${slug} → v${version}`);
      json(res, 200, { ok: true, versions: data, mp4: resolved?.mp4 || null });
    } catch (e) { json(res, 500, { ok: false, erro: e.message }); }
  }

  async function handleMotionMp4Get(req, res, searchParams) {
    const slug    = String(searchParams.get('slug') || '').trim();
    const version = Number(searchParams.get('version'));
    if (!slug || !Number.isFinite(version)) return json(res, 400, { ok: false, erro: 'slug e version obrigatórios' });
    try {
      const { resolveMp4ForVersion } = require('../utils/motion-mp4.js');
      const resolved = resolveMp4ForVersion(slug, ROOT, version);
      if (!resolved) return json(res, 404, { ok: false, erro: 'Sem versões motion' });
      json(res, 200, { ok: true, ...resolved });
    } catch (e) { json(res, 500, { ok: false, erro: e.message }); }
  }

  async function handleMotionDeletar(req, res) {
    const payload = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
    const slug    = String(payload.slug || '').trim();
    const version = Number(payload.version);
    if (!slug || !Number.isFinite(version)) return json(res, 400, { ok: false, erro: 'slug e version obrigatórios' });
    try {
      const { deleteVersion } = require('../utils/motion-versoes.js');
      const data = deleteVersion(slug, ROOT, version);
      log.info(`Motion versão removida: ${slug} → v${version}`);
      json(res, 200, { ok: true, versions: data });
    } catch (e) { json(res, 500, { ok: false, erro: e.message }); }
  }

  async function handleMotionVersoesGet(req, res, searchParams) {
    const slug = String(searchParams.get('slug') || '').trim();
    if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });
    try {
      const { readVersions } = require('../utils/motion-versoes.js');
      const data = readVersions(slug, ROOT);
      if (!data) return json(res, 404, { ok: false, erro: 'Sem versões motion' });
      json(res, 200, { ok: true, versions: data });
    } catch (e) { json(res, 500, { ok: false, erro: e.message }); }
  }

  async function handleMotionPedidoPost(req, res) {
    const payload     = await readBody(req);
    if (!payload) return json(res, 400, { ok: false, erro: 'JSON inválido' });
    const slug        = String(payload.slug || '').trim();
    const mode        = payload.mode === 'ajustar' ? 'ajustar' : 'surpresa';
    const instrucoes  = String(payload.instrucoes || '').trim();
    const baseVersion = payload.baseVersion != null ? Number(payload.baseVersion) : null;
    const presetId    = payload.presetId ? String(payload.presetId).trim() : null;

    if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });
    if (mode === 'ajustar' && !instrucoes) return json(res, 400, { ok: false, erro: 'Descreva o que mudar' });
    if (motionPending.has(slug)) return json(res, 409, { ok: false, erro: 'Geração em andamento para este post. Aguarde.' });

    try {
      const { createPedido } = require('../utils/motion-pedidos.js');
      const { PRESET_IDS }   = require('../utils/motion-presets.js');
      if (presetId && !PRESET_IDS.includes(presetId)) {
        return json(res, 400, { ok: false, erro: 'Preset inválido ou não automatizado: ' + presetId });
      }
      const pedido = createPedido(slug, ROOT, { mode, instrucoes, baseVersion, presetId });

      motionPending.add(slug);
      setTimeout(() => motionPending.delete(slug), 8000);

      const { spawn } = require('child_process');
      const worker = path.join(scriptsDir, 'motion-pedido-run.js');
      spawn(process.execPath, [worker, '--slug', slug, '--pedido-id', pedido.id], {
        detached: true, stdio: 'ignore', cwd: scriptsDir,
      }).unref();

      log.info(`Motion pedido: ${slug} → v${pedido.targetVersion} (${mode}${presetId ? ' · ' + presetId : ''})`);
      json(res, 200, { ok: true, pedido });
    } catch (e) {
      motionPending.delete(slug);
      json(res, 500, { ok: false, erro: e.message });
    }
  }

  async function handleMotionPresetsGet(req, res, searchParams) {
    const slug = String(searchParams.get('slug') || '').trim();
    try {
      const { listPresets }  = require('../utils/motion-presets.js');
      const { readVersions } = require('../utils/motion-versoes.js');
      let used = [];
      if (slug) {
        const versions = readVersions(slug, ROOT);
        if (versions) used = versions.versions.map(v => v.preset).filter(Boolean);
      }
      json(res, 200, { ok: true, presets: listPresets(used) });
    } catch (e) { json(res, 500, { ok: false, erro: e.message }); }
  }

  async function handleMotionPedidoGet(req, res, searchParams) {
    const slug = String(searchParams.get('slug') || '').trim();
    if (!slug) return json(res, 400, { ok: false, erro: 'slug obrigatório' });
    try {
      const { getActivePedido, readPedidos } = require('../utils/motion-pedidos.js');
      const pedidos = readPedidos(slug, ROOT);
      const pedido  = getActivePedido(slug, ROOT) || pedidos.slice(-1)[0] || null;
      json(res, 200, { ok: true, pedido, pedidos: pedidos.slice(-5) });
    } catch (e) { json(res, 500, { ok: false, erro: e.message }); }
  }

  return {
    handleMotionSelecionar,
    handleMotionAprovarMp4,
    handleMotionMp4Get,
    handleMotionDeletar,
    handleMotionVersoesGet,
    handleMotionPedidoPost,
    handleMotionPresetsGet,
    handleMotionPedidoGet,
  };
};
