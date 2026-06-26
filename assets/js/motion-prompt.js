/**
 * Painel in-app — nova versão motion (surpresa ou ajuste)
 */
(function (global) {
  'use strict';

  let panelEl = null;
  let onComplete = null;
  let presetsCache = [];
  let pollTimer = null;

  function ensurePanel() {
    if (panelEl) return panelEl;
    panelEl = document.createElement('div');
    panelEl.id = 'motion-prompt-overlay';
    panelEl.className = 'motion-prompt-overlay';
    panelEl.hidden = true;
    panelEl.innerHTML = `
      <div class="motion-prompt-card" role="dialog" aria-labelledby="motion-prompt-title">
        <button type="button" class="motion-prompt-close" aria-label="Fechar">✕</button>
        <h2 id="motion-prompt-title">Nova versão</h2>
        <p class="motion-prompt-sub" id="motion-prompt-sub"></p>

        <div class="motion-prompt-modes">
          <label class="motion-prompt-mode">
            <input type="radio" name="motion-prompt-mode" value="surpresa" checked>
            <span class="motion-prompt-mode-box">
              <strong>Variação criativa</strong>
              <small>Escolha o tipo de animação ou deixe no automático</small>
            </span>
          </label>
          <label class="motion-prompt-mode">
            <input type="radio" name="motion-prompt-mode" value="ajustar">
            <span class="motion-prompt-mode-box">
              <strong>Ajustar versão atual</strong>
              <small>Descreva o que mudar na v<span id="motion-prompt-base">1</span></small>
            </span>
          </label>
        </div>

        <div class="motion-prompt-presets" id="motion-prompt-presets">
          <p class="motion-prompt-presets-label">Tipo de animação</p>
          <div class="motion-prompt-preset-list" id="motion-prompt-preset-list"></div>
        </div>

        <div class="motion-prompt-chat" id="motion-prompt-chat" hidden>
          <label for="motion-prompt-input">O que mudar?</label>
          <textarea id="motion-prompt-input" rows="4" placeholder="Ex.: headline mais lenta, menos glitch, CTA aparece antes…"></textarea>
        </div>

        <div class="motion-prompt-status" id="motion-prompt-status" hidden></div>

        <div class="motion-prompt-actions">
          <button type="button" class="motion-prompt-cancel">Cancelar</button>
          <button type="button" class="motion-prompt-submit" id="motion-prompt-submit">Gerar versão</button>
        </div>
      </div>`;
    document.body.appendChild(panelEl);

    panelEl.querySelector('.motion-prompt-close').onclick = close;
    panelEl.querySelector('.motion-prompt-cancel').onclick = close;
    panelEl.addEventListener('click', (e) => { if (e.target === panelEl) close(); });

    panelEl.querySelectorAll('input[name="motion-prompt-mode"]').forEach(r => {
      r.addEventListener('change', syncModeUI);
    });

    panelEl.querySelector('#motion-prompt-submit').onclick = submit;
    return panelEl;
  }

  function renderPresetList(presets) {
    presetsCache = presets || [];
    const list = panelEl.querySelector('#motion-prompt-preset-list');
    if (!list) return;

    const autoOptions = [
      `<label class="motion-prompt-preset">
        <input type="radio" name="motion-prompt-preset" value="" checked>
        <span class="motion-prompt-preset-box">
          <span class="motion-prompt-preset-head">
            <strong>Automático</strong>
            <span class="motion-prompt-preset-meta">surpresa</span>
          </span>
          <small>Escolhe um preset que ainda não foi usado neste post</small>
        </span>
      </label>`,
    ];

    const cards = presetsCache.map(p => {
      const disabled = !p.auto;
      const usedMark = p.used ? '<span class="motion-prompt-preset-used">já usada</span>' : '';
      const manualMark = !p.auto ? '<span class="motion-prompt-preset-manual">manual</span>' : '';
      return `<label class="motion-prompt-preset${disabled ? ' disabled' : ''}">
        <input type="radio" name="motion-prompt-preset" value="${p.id}"${disabled ? ' disabled' : ''}>
        <span class="motion-prompt-preset-box">
          <span class="motion-prompt-preset-head">
            <strong>${escapeHtml(p.nome)}</strong>
            <span class="motion-prompt-preset-meta">${escapeHtml(p.label)} · ${p.duracao_s}s</span>
          </span>
          <small>${escapeHtml(p.descricao)}</small>
          ${usedMark}${manualMark}
        </span>
      </label>`;
    });

    list.innerHTML = autoOptions.concat(cards).join('');
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  async function loadPresets(slug) {
    try {
      const res = await fetch('/api/motion/presets?slug=' + encodeURIComponent(slug));
      const data = await parseApiJson(res);
      if (res.ok && data.ok) renderPresetList(data.presets);
    } catch (_) {
      renderPresetList([]);
    }
  }

  function syncModeUI() {
    const mode = panelEl.querySelector('input[name="motion-prompt-mode"]:checked')?.value;
    panelEl.querySelector('#motion-prompt-chat').hidden = mode !== 'ajustar';
    panelEl.querySelector('#motion-prompt-presets').hidden = mode !== 'surpresa';
  }

  function close() {
    if (panelEl) panelEl.hidden = true;
    if (pollTimer) { clearTimeout(pollTimer); pollTimer = null; }
  }

  function selectedPresetId() {
    return panelEl.querySelector('input[name="motion-prompt-preset"]:checked')?.value || '';
  }

  async function submit() {
    const slug = panelEl.dataset.slug;
    const baseVersion = Number(panelEl.dataset.baseVersion || 1);
    const mode = panelEl.querySelector('input[name="motion-prompt-mode"]:checked')?.value || 'surpresa';
    const instrucoes = panelEl.querySelector('#motion-prompt-input').value.trim();
    const presetId = mode === 'surpresa' ? selectedPresetId() : '';
    const statusEl = panelEl.querySelector('#motion-prompt-status');
    const submitBtn = panelEl.querySelector('#motion-prompt-submit');

    if (mode === 'ajustar' && !instrucoes) {
      statusEl.hidden = false;
      statusEl.className = 'motion-prompt-status error';
      statusEl.textContent = 'Descreva o que deseja mudar.';
      return;
    }

    submitBtn.disabled = true;
    statusEl.hidden = false;
    statusEl.className = 'motion-prompt-status loading';
    statusEl.textContent = 'Enviando pedido…';

    try {
      const body = { slug, mode, instrucoes, baseVersion };
      if (presetId) body.presetId = presetId;

      const res = await fetch('/api/motion/pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await parseApiJson(res);
      if (!res.ok || !data.ok) throw new Error(data.erro || 'Falha ao enviar pedido');

      const presetName = presetId
        ? (presetsCache.find(p => p.id === presetId)?.nome || presetId)
        : 'automático';

      statusEl.className = 'motion-prompt-status ok';
      statusEl.textContent = `Versão ${data.pedido.targetVersion} (${presetName}) — gerando…`;

      close();
      if (typeof onComplete === 'function') {
        onComplete({ slug, pedido: data.pedido });
      }
      startPolling(slug, data.pedido.targetVersion, onComplete);
    } catch (e) {
      statusEl.className = 'motion-prompt-status error';
      statusEl.textContent = e.message;
    } finally {
      submitBtn.disabled = false;
    }
  }

  async function parseApiJson(res) {
    const text = await res.text();
    if (res.status === 405) {
      throw new Error('API motion indisponível — reinicie o dev server: cd _scripts && npm run dev');
    }
    try { return JSON.parse(text); } catch {
      throw new Error(text.slice(0, 120) || 'Erro no servidor');
    }
  }

  function startPolling(slug, targetVersion, callback) {
    if (pollTimer) clearTimeout(pollTimer);
    let tries = 0;
    let consecutiveErrors = 0;
    const max = 40;

    const MV = global.MotionVersions;
    if (MV?.setCardGenerating) MV.setCardGenerating(slug, 'generating');

    const finish = (result) => {
      if (MV?.setCardGenerating) {
        MV.setCardGenerating(slug, result.ready ? 'done' : 'error');
      }
      if (typeof callback === 'function') callback(result);
    };

    const tick = async () => {
      pollTimer = null;
      tries += 1;
      try {
        if (!MV) return;
        const data = await MV.fetchVersions(slug);
        const found = data?.versions?.some(v => v.id === targetVersion);
        const pedRes = await fetch('/api/motion/pedido?slug=' + encodeURIComponent(slug));
        const pedData = pedRes.ok ? await pedRes.json() : {};
        consecutiveErrors = 0;

        if (pedData.pedido?.status === 'failed') {
          finish({ slug, ready: false, error: 'Geração falhou no servidor' });
          return;
        }
        if (found || pedData.pedido?.status === 'done') {
          finish({ slug, ready: true, versions: found ? data : await MV.fetchVersions(slug) });
          return;
        }
      } catch (e) {
        consecutiveErrors += 1;
        console.warn('[motion-prompt] polling erro:', e.message);
        if (consecutiveErrors >= 3) {
          finish({ slug, ready: false, error: 'Servidor sem resposta. Verifique se o dev server está rodando.' });
          return;
        }
      }

      if (tries < max) {
        pollTimer = setTimeout(tick, 3000);
      } else {
        finish({ slug, ready: false, error: 'Tempo esgotado aguardando geração.' });
      }
    };

    pollTimer = setTimeout(tick, 2000);
  }

  function open({ slug, baseVersion = 1, subtitle = '', completeCallback = null }) {
    ensurePanel();
    onComplete = completeCallback;
    panelEl.dataset.slug = slug;
    panelEl.dataset.baseVersion = String(baseVersion);
    panelEl.querySelector('#motion-prompt-sub').textContent =
      subtitle || `Versão ${baseVersion} será mantida. A nova entra como v${baseVersion + 1}.`;
    panelEl.querySelector('#motion-prompt-base').textContent = String(baseVersion);
    panelEl.querySelector('#motion-prompt-input').value = '';
    panelEl.querySelector('#motion-prompt-status').hidden = true;
    panelEl.querySelector('input[value="surpresa"]').checked = true;
    syncModeUI();
    loadPresets(slug);
    panelEl.hidden = false;
  }

  global.MotionPrompt = { open, close, startPolling };
})(typeof window !== 'undefined' ? window : global);
