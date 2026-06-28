// CYBERSEC.CAST — Guardian (autônomo)
// Equivalente ao guardian.js do CybersecFEST, mas monitora o CAST.
// Roda diariamente via GitHub Actions (mesmo workflow ou separado).
'use strict';

require('./load-env.js');

const { getJSON, putJSON, getFile, getCommits, createRepo, repoExists, listTree, putFile, REPO } = require('./utils/github.js');
const { validateHeadlineArte } = require('./utils/validate-headline-arte.js');

const PRIMARY_REPO = 'betoyes/cybersecfest-auto';
const BACKUP_REPO  = 'betoyes/cyberseccast-backup';
const MAX_LOG      = 30;

function now()    { return new Date().toISOString(); }
function nowBRT() {
  const d = new Date();
  return new Date(d.getTime() - 3*60*60*1000).toISOString().replace('T',' ').slice(0,19) + ' BRT';
}

// ── Verificar integridade de artes-cast.json ─────────────────────
async function checkArtesCastJson() {
  const f = await getJSON('artes-cast.json', PRIMARY_REPO);
  if (!f) return { status: 'critico', msg: 'artes-cast.json inacessível ou inválido', count: 0 };

  const artes  = f.data;
  const campos = ['slug','tipo','headline','layout','legenda','legenda_variante','created_at'];
  let alertas  = [];
  let slugs    = new Set();

  for (const a of artes) {
    for (const c of campos) {
      if (!a[c]) alertas.push(`slug "${a.slug}": campo "${c}" vazio/nulo`);
    }
    // slugs CAST devem ter prefixo cast-
    if (!String(a.slug || '').startsWith('cast-')) {
      alertas.push(`slug "${a.slug}": não tem prefixo cast- (possível contaminação FEST)`);
    }
    const hlAlertas = validateHeadlineArte(a);
    hlAlertas.forEach(msg => alertas.push(`slug "${a.slug}": ${msg}`));
    if (slugs.has(a.slug)) alertas.push(`slug duplicado: ${a.slug}`);
    slugs.add(a.slug);
    // CAST não deve ter brand != cyberseccast
    if (a.brand && a.brand !== 'cyberseccast') {
      alertas.push(`slug "${a.slug}": brand "${a.brand}" incorreta (esperado: cyberseccast)`);
    }
  }

  const status = alertas.length ? 'alerta' : 'ok';
  return { status, count: artes.length, alertas, sha: f.sha };
}

// ── Verificar temas.json do CAST ─────────────────────────────────
async function checkTemasCastJson() {
  const f = await getJSON('_brands/cyberseccast/temas.json', PRIMARY_REPO);
  if (!f) return { status: 'critico', msg: '_brands/cyberseccast/temas.json inacessível' };

  const t       = f.data;
  const alertas = [];
  const campos  = ['temas_grade', 'historico_recente', 'calendario_editorial'];
  for (const c of campos) { if (!t[c]) alertas.push(`campo "${c}" ausente`); }
  if (t.historico_recente?.length > 20) alertas.push('historico_recente > 20 entradas');
  if (!t.podcast?.posicionamento) alertas.push('campo "podcast.posicionamento" ausente');

  return { status: alertas.length ? 'alerta' : 'ok', alertas, sha: f.sha };
}

// ── Verificar cast/index.html ────────────────────────────────────
async function checkCastIndex() {
  const f = await getFile('cast/index.html', PRIMARY_REPO);
  if (!f) return { status: 'critico', msg: 'cast/index.html não encontrado' };
  if (f.content.length < 5000) return { status: 'alerta', msg: 'cast/index.html suspeito (< 5KB)' };
  // Garantir que não há contaminação FEST (endpoints /api/pedido sem /cast/)
  if (f.content.includes("fetch('/api/pedido'") || f.content.includes('fetch("/api/pedido"')) {
    return { status: 'alerta', msg: 'cast/index.html usando endpoint FEST /api/pedido (falta prefixo /api/cast/)' };
  }
  return { status: 'ok' };
}

// ── Verificar brand.js CAST ──────────────────────────────────────
async function checkBrandCast() {
  const f = await getFile('_brands/cyberseccast/brand.js', PRIMARY_REPO);
  if (!f) return { status: 'critico', msg: '_brands/cyberseccast/brand.js não encontrado' };
  const alertas = [];
  if (!f.content.includes('Space Grotesk')) alertas.push('Space Grotesk ausente no brand.js');
  if (!f.content.includes('#6366f1'))       alertas.push('cor indigo #6366f1 ausente no brand.js');
  if (!f.content.includes('#07060f'))       alertas.push('cor bg #07060f ausente no brand.js');
  if (!f.content.includes('logo-cast.png')) alertas.push('logo-cast.png ausente no brand.js');
  return { status: alertas.length ? 'alerta' : 'ok', alertas };
}

// ── Auditar commits (mesma lógica do FEST Guardian) ──────────────
async function auditarCommits() {
  const commits = await getCommits(20, PRIMARY_REPO);
  let superagent = 0, externos = [], manuais = 0;

  for (const c of commits) {
    const msg    = c.commit?.message || '';
    const author = c.commit?.author?.name || '';
    if (msg.includes('[SuperAgent]') || msg.includes('[CAST]')) { superagent++; }
    else if (msg.match(/\[([\w]+Agent|Gemini|GPT|Claude)\]/i)) {
      externos.push({ sha: c.sha?.slice(0,8), msg: msg.slice(0,60), author });
    } else { manuais++; }
  }

  return { total: commits.length, superagent, externos, manuais };
}

// ── Backup integral do CAST ──────────────────────────────────────
async function backup() {
  const exists = await repoExists(BACKUP_REPO);
  if (!exists) {
    console.log('📦 Criando repo de backup CAST...');
    await createRepo('cyberseccast-backup', 'Backup automático — CYBERSEC.CAST Guardian', true);
    await new Promise(r => setTimeout(r, 3000));
  }

  const TOKEN  = process.env.GH_PAT_CREAO;
  const hdr    = { Authorization: `token ${TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };

  // Apenas arquivos CAST relevantes (evitar duplicar tudo do FEST)
  const CAST_PATHS = [
    'artes-cast.json',
    'cast/index.html',
    '_brands/cyberseccast/brand.js',
    '_brands/cyberseccast/temas.json',
    '_brands/cyberseccast/imagem-prompt.js',
    '_scripts/gerador-artes-cast.js',
    '_scripts/gerar-propostas-cast.js',
    '_scripts/aprovar-propostas-cast.js',
    '_scripts/pedido-run-cast.js',
    '_scripts/gerar-campanha-cast.js',
    '_scripts/guardian-cast.js',
    '_scripts/pedido-cli-cast.js',
    '_scripts/utils/propostas-store-cast.js',
    '_scripts/utils/brand-renderer.js',
  ];

  let dstMap = {};
  try {
    const dstTree = await listTree(BACKUP_REPO);
    for (const f of dstTree) dstMap[f.path] = f.sha;
  } catch(_) { /* backup vazio ok */ }

  let synced = 0, skipped = 0, errors = [];

  for (const filePath of CAST_PATHS) {
    try {
      const res = await fetch(`https://api.github.com/repos/${PRIMARY_REPO}/contents/${filePath}`, { headers: hdr });
      if (!res.ok) { errors.push(`GET ${filePath} → ${res.status}`); continue; }
      const data = await res.json();

      if (dstMap[filePath] === data.sha) { skipped++; continue; }

      const body = {
        message: `[Guardian CAST] sync: ${filePath} — ${now().slice(0,10)}`,
        content: data.content.replace(/\n/g,''),
      };
      if (dstMap[filePath]) body.sha = dstMap[filePath];

      const pr = await fetch(`https://api.github.com/repos/${BACKUP_REPO}/contents/${filePath}`, {
        method: 'PUT', headers: hdr, body: JSON.stringify(body),
      });
      if (!pr.ok) { const t = await pr.text(); errors.push(`PUT ${filePath} → ${pr.status}: ${t.slice(0,80)}`); continue; }

      synced++;
      await new Promise(r => setTimeout(r, 200));
    } catch(e) {
      errors.push(`${filePath}: ${e.message}`);
    }
  }

  return { total: CAST_PATHS.length, synced, skipped, errors };
}

// ── Atualizar health log no backup CAST ─────────────────────────
async function atualizarLog(registro) {
  try {
    const TOKEN = process.env.GH_PAT_CREAO;
    const hdr   = { Authorization: `token ${TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' };

    let execucoes = [];
    let sha       = null;

    const res = await fetch(`https://api.github.com/repos/${BACKUP_REPO}/contents/_guardian/health-log-cast.json`, { headers: hdr });
    if (res.ok) {
      const d = await res.json();
      sha = d.sha;
      try { execucoes = JSON.parse(Buffer.from(d.content,'base64').toString('utf8')).execucoes || []; } catch(_) {}
    }

    execucoes.push(registro);
    if (execucoes.length > MAX_LOG) execucoes.splice(0, execucoes.length - MAX_LOG);

    const content = Buffer.from(JSON.stringify({ execucoes }, null, 2)).toString('base64');
    const body    = { message: `[Guardian CAST] log: health-check ${registro.data.slice(0,10)} — ${registro.status_geral}`, content };
    if (sha) body.sha = sha;

    await fetch(`https://api.github.com/repos/${BACKUP_REPO}/contents/_guardian/health-log-cast.json`, {
      method: 'PUT', headers: hdr, body: JSON.stringify(body),
    });
    console.log('📋 Health log CAST atualizado no backup');
  } catch(e) {
    console.warn('⚠️  Falha ao atualizar health log CAST:', e.message);
  }
}

// ── Relatório formatado ──────────────────────────────────────────
function relatorio({ artes, temas, castIndex, brand, commits, backupResult, statusGeral }) {
  const icon = { ok:'✅', alerta:'⚠️', critico:'❌', online:'✅', offline:'❌' };
  const cor  = { verde:'🟢', amarelo:'🟡', vermelho:'🔴' };

  const linhas = [
    `╔══════════════════════════════════════════════════════╗`,
    `║   🎙️  GUARDIAN — CYBERSEC.CAST Health Report         ║`,
    `║   📅  ${nowBRT().padEnd(47)}║`,
    `╠══════════════════════════════════════════════════════╣`,
    `║  STATUS GERAL:  ${cor[statusGeral]} ${statusGeral.toUpperCase().padEnd(43)}║`,
    `╚══════════════════════════════════════════════════════╝`,
    '',
    '📋 INTEGRIDADE DOS ARQUIVOS',
    `   artes-cast.json  [${artes.count || 0} artes]  ${icon[artes.status]} ${artes.status.toUpperCase()}`,
    `   temas.json CAST              ${icon[temas.status]} ${temas.status.toUpperCase()}`,
    `   cast/index.html              ${icon[castIndex.status]} ${castIndex.status.toUpperCase()}`,
    `   brand.js CAST                ${icon[brand.status]} ${brand.status.toUpperCase()}`,
    '',
    `📝 COMMITS RECENTES (últimos ${commits.total})`,
    `   ✅ SuperAgent/CAST: ${commits.superagent} commits`,
    `   🔵 Externos:        ${commits.externos.length} commits`,
    `   👤 Manuais:         ${commits.manuais} commits`,
  ];

  if (commits.externos.length) {
    linhas.push('');
    linhas.push('   Commits externos detectados:');
    commits.externos.forEach(c => linhas.push(`   · ${c.sha} ${c.msg}`));
  }

  linhas.push('');
  linhas.push('💾 BACKUP CAST');
  linhas.push(`   Repo:          ${BACKUP_REPO}`);
  linhas.push(`   Total arquivos: ${backupResult.total}`);
  linhas.push(`   Sincronizados:  ${backupResult.synced} (novos/modificados)`);
  linhas.push(`   Em dia:         ${backupResult.skipped} (SHA idêntico)`);
  linhas.push(`   Erros:          ${backupResult.errors.length}`);

  const alertas = [
    ...(artes.alertas || []),
    ...(temas.alertas || []),
    ...(castIndex.msg ? [castIndex.msg] : []),
    ...(brand.alertas || []),
    ...backupResult.errors.slice(0,3),
  ];

  linhas.push('');
  linhas.push('⚠️  ALERTAS');
  if (alertas.length) { alertas.forEach(a => linhas.push(`   · ${a}`)); }
  else { linhas.push('   Nenhum alerta.'); }

  linhas.push('');
  linhas.push('🔗 LINKS');
  linhas.push(`   Galeria CAST:  https://cybersecfest-auto.vercel.app/cast/`);
  linhas.push(`   Primário:      https://github.com/${PRIMARY_REPO}`);
  linhas.push(`   Backup CAST:   https://github.com/${BACKUP_REPO}`);

  return linhas.join('\n');
}

// ── Main ─────────────────────────────────────────────────────────
async function run() {
  console.log('🎙️  Guardian CAST — iniciando...');

  const [artes, temas, castIndex, brand, commits, backupResult] = await Promise.allSettled([
    checkArtesCastJson(),
    checkTemasCastJson(),
    checkCastIndex(),
    checkBrandCast(),
    auditarCommits(),
    backup(),
  ]).then(results => results.map(r => r.status === 'fulfilled' ? r.value : { status:'critico', msg: r.reason?.message }));

  const critico = [artes, temas, castIndex].some(x => x.status === 'critico');
  const alerta  = [artes, temas, brand].some(x => x.status === 'alerta') || commits.externos?.length > 0;
  const statusGeral = critico ? 'vermelho' : alerta ? 'amarelo' : 'verde';

  const relatorio_txt = relatorio({ artes, temas, castIndex, brand, commits, backupResult, statusGeral });
  console.log('\n' + relatorio_txt);

  await atualizarLog({
    data:                      now(),
    status_geral:              statusGeral,
    artes_cast_json:           artes.status,
    temas_cast_json:           temas.status,
    cast_index_html:           castIndex.status,
    brand_js:                  brand.status,
    commits_externos:          commits.externos?.length || 0,
    arquivos_backup_total:     backupResult.total,
    arquivos_sincronizados:    backupResult.synced,
    alertas: [
      ...(artes.alertas||[]),
      ...(temas.alertas||[]),
      ...(brand.alertas||[]),
      ...(backupResult.errors||[]).slice(0,3),
    ],
  });

  if (statusGeral === 'vermelho') process.exit(1);
}

run().catch(e => {
  console.error('❌ Guardian CAST falhou:', e.message);
  console.error(e.stack);
  process.exit(1);
});
