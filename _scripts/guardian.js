// CybersecFEST — Guardian (autônomo)
// Roda diariamente às 07h BRT via GitHub Actions
'use strict';

const { getJSON, putJSON, getFile, getCommits, createRepo, repoExists, listTree, putFile, putBinary, REPO } = require('./utils/github.js');

const PRIMARY_REPO = 'betoyes/cybersecfest-auto';
const BACKUP_REPO  = 'betoyes/cybersecfest-backup';
const MAX_LOG      = 30;

function now() { return new Date().toISOString(); }
function nowBRT() {
  const d = new Date();
  return new Date(d.getTime() - 3*60*60*1000).toISOString().replace('T',' ').slice(0,19) + ' BRT';
}

// ── Verificar integridade de artes.json ─────────────────────────
async function checkArtesJson() {
  const f = await getJSON('artes.json', PRIMARY_REPO);
  if (!f) return { status: 'critico', msg: 'artes.json inacessível ou inválido', count: 0 };

  const artes  = f.data;
  const campos = ['slug','tipo','headline','layout','legenda','legenda_variante','created_at'];
  let alertas  = [];
  let slugs    = new Set();

  for (const a of artes) {
    for (const c of campos) {
      if (!a[c]) alertas.push(`slug "${a.slug}": campo "${c}" vazio/nulo`);
    }
    if (slugs.has(a.slug)) alertas.push(`slug duplicado: ${a.slug}`);
    slugs.add(a.slug);
  }

  const status = alertas.length ? 'alerta' : 'ok';
  return { status, count: artes.length, alertas, sha: f.sha };
}

// ── Verificar temas.json ─────────────────────────────────────────
async function checkTemasJson() {
  const f = await getJSON('temas.json', PRIMARY_REPO);
  if (!f) return { status: 'critico', msg: 'temas.json inacessível' };

  const t       = f.data;
  const alertas = [];
  const campos  = ['rotacao_layouts','historico_recente','calendario_editorial'];
  for (const c of campos) { if (!t[c]) alertas.push(`campo "${c}" ausente`); }
  if (t.historico_recente?.length > 20) alertas.push('historico_recente > 20 entradas');

  return { status: alertas.length ? 'alerta' : 'ok', alertas, sha: f.sha };
}

// ── Verificar index.html ─────────────────────────────────────────
async function checkIndex() {
  const f = await getFile('index.html', PRIMARY_REPO);
  if (!f) return { status: 'critico', msg: 'index.html não encontrado' };
  if (f.content.length < 2000) return { status: 'alerta', msg: 'index.html suspeito (< 2KB)' };
  return { status: 'ok' };
}

// ── Verificar Vercel ─────────────────────────────────────────────
async function checkVercel() {
  try {
    const t0  = Date.now();
    const res = await fetch('https://cybersecfest-auto.vercel.app', { signal: AbortSignal.timeout(8000) });
    const ms  = Date.now() - t0;
    return { status: res.ok ? 'online' : 'offline', http: res.status, ms };
  } catch (e) {
    return { status: 'offline', msg: e.message };
  }
}

// ── Auditar commits ──────────────────────────────────────────────
async function auditarCommits() {
  const commits = await getCommits(20, PRIMARY_REPO);
  let superagent = 0, externos = [], manuais = 0;

  for (const c of commits) {
    const msg    = c.commit?.message || '';
    const author = c.commit?.author?.name || '';
    if (msg.includes('[SuperAgent]')) { superagent++; }
    else if (msg.match(/\[([\w]+Agent|Gemini|GPT|Claude)\]/i)) {
      externos.push({ sha: c.sha?.slice(0,8), msg: msg.slice(0,60), author });
    } else { manuais++; }
  }

  return { total: commits.length, superagent, externos, manuais };
}

// ── Backup integral ──────────────────────────────────────────────
async function backup() {
  // Garantir que repo de backup existe
  const exists = await repoExists(BACKUP_REPO);
  if (!exists) {
    console.log('📦 Criando repo de backup...');
    await createRepo('cybersecfest-backup', 'Backup automático — CybersecFEST Guardian', true);
    await new Promise(r => setTimeout(r, 3000));
  }

  const TOKEN  = process.env.GH_PAT_CREAO;
  const hdr    = { Authorization: `token ${TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };

  // Tree do primário
  const srcTree = await listTree(PRIMARY_REPO);
  // Tree do backup
  let dstMap = {};
  try {
    const dstTree = await listTree(BACKUP_REPO);
    for (const f of dstTree) dstMap[f.path] = f.sha;
  } catch(e) { /* backup vazio ok */ }

  let synced = 0, skipped = 0, errors = [];

  for (const file of srcTree) {
    if (file.path === 'README.md') { skipped++; continue; } // evitar conflito
    try {
      // Se SHA idêntico → pular
      if (dstMap[file.path] === file.sha) { skipped++; continue; }

      // Buscar conteúdo do arquivo no primário
      const res = await fetch(`https://api.github.com/repos/${PRIMARY_REPO}/contents/${file.path}`, { headers: hdr });
      if (!res.ok) { errors.push(`GET ${file.path} → ${res.status}`); continue; }
      const data = await res.json();

      // PUT no backup
      const body = {
        message: `[Guardian] sync: ${file.path} — ${now().slice(0,10)}`,
        content: data.content.replace(/\n/g,'')
      };
      if (dstMap[file.path]) body.sha = dstMap[file.path];

      const pr = await fetch(`https://api.github.com/repos/${BACKUP_REPO}/contents/${file.path}`, {
        method: 'PUT', headers: hdr, body: JSON.stringify(body)
      });
      if (!pr.ok) { const t = await pr.text(); errors.push(`PUT ${file.path} → ${pr.status}: ${t.slice(0,80)}`); continue; }

      synced++;
      await new Promise(r => setTimeout(r, 200)); // rate limit
    } catch(e) {
      errors.push(`${file.path}: ${e.message}`);
    }
  }

  return { total: srcTree.length, synced, skipped, errors };
}

// ── Atualizar health log no backup ───────────────────────────────
async function atualizarLog(registro) {
  try {
    const TOKEN = process.env.GH_PAT_CREAO;
    const hdr   = { Authorization: `token ${TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };

    let execucoes = [];
    let sha       = null;

    const res = await fetch(`https://api.github.com/repos/${BACKUP_REPO}/contents/_guardian/health-log.json`, { headers: hdr });
    if (res.ok) {
      const d = await res.json();
      sha = d.sha;
      try { execucoes = JSON.parse(Buffer.from(d.content,'base64').toString('utf8')).execucoes || []; } catch(e) {}
    }

    execucoes.push(registro);
    if (execucoes.length > MAX_LOG) execucoes.splice(0, execucoes.length - MAX_LOG);

    const content = Buffer.from(JSON.stringify({ execucoes }, null, 2)).toString('base64');
    const body    = { message: `[Guardian] log: health-check ${registro.data.slice(0,10)} — ${registro.status_geral}`, content };
    if (sha) body.sha = sha;

    await fetch(`https://api.github.com/repos/${BACKUP_REPO}/contents/_guardian/health-log.json`, {
      method: 'PUT', headers: hdr, body: JSON.stringify(body)
    });
    console.log('📋 Health log atualizado no backup');
  } catch(e) {
    console.warn('⚠️  Falha ao atualizar health log:', e.message);
  }
}

// ── Relatório formatado ──────────────────────────────────────────
function relatorio({ artes, temas, index, vercel, commits, backupResult, statusGeral }) {
  const icon = { ok:'✅', alerta:'⚠️', critico:'❌', online:'✅', offline:'❌' };
  const cor  = { verde:'🟢', amarelo:'🟡', vermelho:'🔴' };

  const linhas = [
    `╔══════════════════════════════════════════════════════╗`,
    `║   🛡️  GUARDIAN — CybersecFEST-Auto Health Report     ║`,
    `║   📅  ${nowBRT().padEnd(47)}║`,
    `╠══════════════════════════════════════════════════════╣`,
    `║  STATUS GERAL:  ${cor[statusGeral]} ${statusGeral.toUpperCase().padEnd(43)}║`,
    `╚══════════════════════════════════════════════════════╝`,
    '',
    '📋 INTEGRIDADE DOS ARQUIVOS',
    `   artes.json  [${artes.count} artes]   ${icon[artes.status]} ${artes.status.toUpperCase()}`,
    `   temas.json             ${icon[temas.status]} ${temas.status.toUpperCase()}`,
    `   index.html             ${icon[index.status]} ${index.status.toUpperCase()}`,
    '',
    `🌐 DEPLOY VERCEL          ${icon[vercel.status]} ${vercel.status} ${vercel.ms ? `(${vercel.ms}ms)` : ''}`,
    '',
    `📝 COMMITS RECENTES (últimos ${commits.total})`,
    `   ✅ SuperAgent: ${commits.superagent} commits`,
    `   🔵 Externos:   ${commits.externos.length} commits`,
    `   👤 Manuais:    ${commits.manuais} commits`,
  ];

  if (commits.externos.length) {
    linhas.push('');
    linhas.push('   Commits externos detectados:');
    commits.externos.forEach(c => linhas.push(`   · ${c.sha} ${c.msg}`));
  }

  linhas.push('');
  linhas.push('💾 BACKUP');
  linhas.push(`   Repo:          ${BACKUP_REPO}`);
  linhas.push(`   Total arquivos: ${backupResult.total}`);
  linhas.push(`   Sincronizados:  ${backupResult.synced} (novos/modificados)`);
  linhas.push(`   Em dia:         ${backupResult.skipped} (SHA idêntico)`);
  linhas.push(`   Erros:          ${backupResult.errors.length}`);

  const alertas = [
    ...(artes.alertas || []),
    ...(temas.alertas || []),
    ...(index.msg ? [index.msg] : []),
    ...backupResult.errors.slice(0,3)
  ];

  linhas.push('');
  linhas.push('⚠️  ALERTAS');
  if (alertas.length) { alertas.forEach(a => linhas.push(`   · ${a}`)); }
  else { linhas.push('   Nenhum alerta.'); }

  linhas.push('');
  linhas.push('🔗 LINKS');
  linhas.push(`   Galeria:  https://cybersecfest-auto.vercel.app`);
  linhas.push(`   Primário: https://github.com/${PRIMARY_REPO}`);
  linhas.push(`   Backup:   https://github.com/${BACKUP_REPO}`);

  return linhas.join('\n');
}

// ── Main ─────────────────────────────────────────────────────────
async function run() {
  console.log('🛡️  Guardian — iniciando...');

  const [artes, temas, index, vercel, commits, backupResult] = await Promise.allSettled([
    checkArtesJson(),
    checkTemasJson(),
    checkIndex(),
    checkVercel(),
    auditarCommits(),
    backup()
  ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : { status:'critico', msg: r.reason?.message }));

  // Determinar status geral
  const critico = [artes, temas, index].some(x => x.status === 'critico') || vercel.status === 'offline';
  const alerta  = [artes, temas].some(x => x.status === 'alerta') || commits.externos?.length > 0;
  const statusGeral = critico ? 'vermelho' : alerta ? 'amarelo' : 'verde';

  const relatorio_txt = relatorio({ artes, temas, index, vercel, commits, backupResult, statusGeral });
  console.log('\n' + relatorio_txt);

  // Registrar log no backup
  await atualizarLog({
    data: now(),
    status_geral: statusGeral,
    artes_json: artes.status,
    temas_json: temas.status,
    index_html: index.status,
    vercel: vercel.status,
    commits_externos: commits.externos?.length || 0,
    arquivos_backup_total: backupResult.total,
    arquivos_sincronizados: backupResult.synced,
    alertas: [
      ...(artes.alertas||[]),
      ...(temas.alertas||[]),
      ...(backupResult.errors||[]).slice(0,3)
    ]
  });

  if (statusGeral === 'vermelho') process.exit(1);
}

run().catch(e => {
  console.error('❌ Guardian falhou:', e.message);
  console.error(e.stack);
  process.exit(1);
});
