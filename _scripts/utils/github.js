// GitHub API helpers — cybersecfest-auto
'use strict';

const TOKEN = process.env.GH_PAT_CREAO;
const REPO  = process.env.GITHUB_REPO || 'betoyes/cybersecfest-auto';
const BASE  = 'https://api.github.com';

const headers = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
};

async function req(path, method = 'GET', body = null, repo = REPO) {
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}/repos/${repo}${path}`, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub ${method} ${path} → ${res.status}: ${txt.slice(0,200)}`);
  }
  return res.json();
}

async function getFile(path, repo = REPO) {
  try {
    const d = await req(`/contents/${path}`, 'GET', null, repo);
    return { content: Buffer.from(d.content, 'base64').toString('utf8'), sha: d.sha };
  } catch (e) {
    if (e.message.includes('404')) return null;
    throw e;
  }
}

async function putFile(path, content, message, sha = null, repo = REPO) {
  const body = { message, content: Buffer.from(content).toString('base64') };
  if (sha) body.sha = sha;
  return req(`/contents/${path}`, 'PUT', body, repo);
}

async function putBinary(path, buffer, message, sha = null, repo = REPO) {
  const body = { message, content: buffer.toString('base64') };
  if (sha) body.sha = sha;
  return req(`/contents/${path}`, 'PUT', body, repo);
}

async function getJSON(path, repo = REPO) {
  const f = await getFile(path, repo);
  if (!f) return null;
  return { data: JSON.parse(f.content), sha: f.sha };
}

async function putJSON(path, data, message, sha = null, repo = REPO) {
  return putFile(path, JSON.stringify(data, null, 2), message, sha, repo);
}

async function getCommits(n = 20, repo = REPO) {
  const res = await fetch(`${BASE}/repos/${repo}/commits?per_page=${n}`, { headers });
  if (!res.ok) return [];
  return res.json();
}

async function createRepo(name, description = '', isPrivate = true) {
  const res = await fetch(`${BASE}/user/repos`, {
    method: 'POST', headers,
    body: JSON.stringify({ name, description, private: isPrivate, auto_init: true })
  });
  if (!res.ok) {
    const t = await res.text();
    if (t.includes('already exists')) return { full_name: `betoyes/${name}` };
    throw new Error(`createRepo → ${res.status}: ${t}`);
  }
  return res.json();
}

async function repoExists(repo) {
  const res = await fetch(`${BASE}/repos/${repo}`, { headers });
  return res.ok;
}

async function listTree(repo = REPO) {
  const res = await fetch(`${BASE}/repos/${repo}/git/trees/main?recursive=1`, { headers });
  if (!res.ok) return [];
  const d = await res.json();
  return (d.tree || []).filter(f => f.type === 'blob');
}

module.exports = { getFile, putFile, putBinary, getJSON, putJSON, getCommits, createRepo, repoExists, listTree, REPO };
