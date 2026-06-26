/**
 * CybersecFEST — seletor de versões motion (v1, v2, v3…)
 */
(function (global) {
  'use strict';

  function versionBase(slug, ver) {
    const root = 'artes/' + slug + '/motion';
    return !ver.dir || ver.dir === '.' ? root : root + '/' + ver.dir;
  }

  function versionHtmlUrl(slug, ver) {
    return versionBase(slug, ver) + '/index.html';
  }

  function versionMp4Url(slug, ver, file) {
    const name = file || ver.mp4 || 'preview.mp4';
    return versionBase(slug, ver) + '/' + name;
  }

  async function fetchVersionMp4(slug, versionId) {
    const res = await fetch(`/api/motion/mp4?slug=${encodeURIComponent(slug)}&version=${versionId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok ? data : null;
  }

  async function downloadVersionMp4(url, filename) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('MP4 não encontrado');
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = obj;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(obj), 5000);
  }

  async function fetchVersions(slug) {
    try {
      const res = await fetch('artes/' + slug + '/motion/versions.json?v=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.versions) && data.versions.length) return data;
      }
    } catch (_) {}
    try {
      const head = await fetch('artes/' + slug + '/motion/index.html', { method: 'HEAD' });
      if (head.ok) {
        return {
          slug,
          preview: 1,
          mp4_from: null,
          versions: [{ id: 1, dir: '.', note: 'Versão original' }],
        };
      }
    } catch (_) {}
    return null;
  }

  async function apiSelect(slug, versionId) {
    const res = await fetch('/api/motion/selecionar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, version: versionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.erro || 'Falha ao salvar versão');
    }
    return res.json();
  }

  async function apiApproveMp4(slug, versionId) {
    const res = await fetch('/api/motion/aprovar-mp4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, version: versionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.erro || 'Falha ao marcar versão para MP4');
    }
    return res.json();
  }

  async function apiDelete(slug, versionId) {
    const res = await fetch('/api/motion/deletar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, version: versionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.erro || 'Falha ao excluir versão');
    }
    return res.json();
  }

  function canDeleteVersion(data, ver) {
    return Boolean(data?.versions?.length > 1 && ver?.dir && ver.dir !== '.');
  }

  function presetLabel(preset) {
    const map = {
      'entrance-premium-6s': 'entrada',
      'kinetic-swipe-7s': 'swipe',
      'confraria-lite-8s': 'hud',
      'confraria-signal': 'signal',
      'signal-mesh-10s': 'mesh',
    };
    if (!preset) return '';
    const base = preset.replace(/-ajuste$/, '');
    return map[base] || base.split('-')[0];
  }

  function renderPills(container, data, activeId, onSelect, opts) {
    if (!container || !data) return;
    const options = opts || {};
    const showDelete = options.canDelete && typeof options.onDelete === 'function';

    container.innerHTML = data.versions.map(v => {
      const active = v.id === activeId;
      const mp4Mark = data.mp4_from === v.id ? ' ★' : '';
      const label = presetLabel(v.preset);
      const pillText = label ? `${v.id} · ${label}${mp4Mark}` : `${v.id}${mp4Mark}`;
      const title = [v.preset, v.note, v.created_at ? new Date(v.created_at).toLocaleString('pt-BR') : '']
        .filter(Boolean).join(' · ');
      const deletable = showDelete && canDeleteVersion(data, v);
      const delBtn = deletable
        ? `<button type="button" class="motion-ver-del" data-del="${v.id}" title="Excluir versão ${v.id}" aria-label="Excluir versão ${v.id}">×</button>`
        : '';
      return `<span class="motion-ver-pill-wrap${active ? ' active' : ''}">
        <button type="button" class="motion-ver-pill${active ? ' active' : ''}" data-vid="${v.id}" title="${title.replace(/"/g, '&quot;')}">${pillText}</button>
        ${delBtn}
      </span>`;
    }).join('');

    container.querySelectorAll('.motion-ver-pill').forEach(btn => {
      btn.addEventListener('click', () => onSelect(Number(btn.dataset.vid)));
    });
    if (showDelete) {
      container.querySelectorAll('.motion-ver-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          options.onDelete(Number(btn.dataset.del));
        });
      });
    }
  }

  function mp4RenderPrompt(slug, ver) {
    const dir = !ver.dir || ver.dir === '.' ? 'motion' : 'motion/' + ver.dir;
    return `Renderize MP4 da versão ${ver.id} do slug ${slug}: cd artes/${slug}/${dir} && npm run render`;
  }

  global.MotionVersions = {
    fetchVersions,
    apiSelect,
    apiApproveMp4,
    apiDelete,
    renderPills,
    versionHtmlUrl,
    versionMp4Url,
    versionBase,
    mp4RenderPrompt,
    presetLabel,
    canDeleteVersion,
    fetchVersionMp4,
    downloadVersionMp4,
  };
})(typeof window !== 'undefined' ? window : global);
