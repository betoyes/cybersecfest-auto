'use strict';

/**
 * Onboarding de novo cliente.
 * Uso: node onboarding-cliente.js --briefing caminho/briefing.json
 *
 * Gera:
 *   _brands/{slug}/brand.js
 *   _brands/{slug}/imagem-prompt.js
 *   _brands/{slug}/temas.json
 *   _agents/{slug}-estrategista/knowledge.js
 *   _agents/{slug}-estrategista/system-prompt.js
 *   {slug}/index.html            (galeria)
 *   artes-{slug}.json            (banco vazio)
 *   _clients.json                (registro de clientes ativos)
 */

require('./load-env');
const path = require('path');
const fs   = require('fs');
const { generateText } = require('./utils/llm');

const ROOT = path.join(__dirname, '..');

// ─── Exemplos de referência (few-shot para o GPT-4o) ─────────────────────────

const REF = {
  brand:        read('_brands/cyberseccast/brand.js'),
  imagemPrompt: read('_brands/cyberseccast/imagem-prompt.js'),
  temas:        read('_brands/cyberseccast/temas.json'),
  knowledge:    read('_agents/fest-estrategista/knowledge.js'),
  systemPrompt: read('_agents/fest-estrategista/system-prompt.js'),
};

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

// ─── Prompts de geração ───────────────────────────────────────────────────────

function promptBrandJs(briefing) {
  const slug = briefing.slug.toUpperCase().replace(/-/g, '_');
  return {
    system: `Você gera arquivos brand.js para um sistema de criação de artes sociais (Node.js).
Siga EXATAMENTE a estrutura do exemplo abaixo — mesmas chaves, mesmo estilo de código.
Retorne APENAS o código JS válido, sem markdown, sem comentários extras.

EXEMPLO DE REFERÊNCIA (cyberseccast/brand.js):
${REF.brand}`,
    user: `Gere o brand.js para este cliente:
${JSON.stringify(briefing, null, 2)}

Slug da constante: ${slug}_BRAND
Caminho de logos: _brands/${briefing.slug}/
Use as cores, fontes e logos informados no briefing.
Se uma cor não foi especificada, derive tons coerentes com o destaque fornecido.`,
  };
}

function promptImagemPromptJs(briefing) {
  return {
    system: `Você gera arquivos imagem-prompt.js para um sistema de criação de artes sociais (Node.js).
Siga EXATAMENTE a estrutura do exemplo abaixo.
Retorne APENAS o código JS válido, sem markdown, sem comentários extras.

EXEMPLO DE REFERÊNCIA (cyberseccast/imagem-prompt.js):
${REF.imagemPrompt}`,
    user: `Gere o imagem-prompt.js para este cliente:
${JSON.stringify(briefing, null, 2)}

O arquivo deve:
- Definir a função buildImagemPrompt(arte) que retorna string de prompt para geração de imagem
- Definir a função detectPerson(arte) que retorna true se o arte mencionar pessoa/convidado
- Definir STYLE_REF_INSTRUCTION com instrução de estilo visual consistente com a marca
- Exportar: { buildImagemPrompt, detectPerson, STYLE_REF_INSTRUCTION }
- Adaptar o estilo visual ao segmento e identidade do cliente`,
  };
}

function promptTemasJson(briefing) {
  return {
    system: `Você gera arquivos temas.json para um sistema de criação de artes sociais.
Siga EXATAMENTE a estrutura do exemplo abaixo.
Retorne APENAS JSON válido, sem markdown.

EXEMPLO DE REFERÊNCIA (cyberseccast/temas.json):
${REF.temas}`,
    user: `Gere o temas.json para este cliente:
${JSON.stringify(briefing, null, 2)}

Crie 3-5 categorias de conteúdo adequadas ao segmento e objetivos do cliente.
Cada categoria deve ter: nome, descricao, temas (array de strings específicas ao cliente).`,
  };
}

function promptKnowledgeJs(briefing) {
  const slug = briefing.slug.toUpperCase().replace(/-/g, '_');
  return {
    system: `Você gera arquivos knowledge.js para agentes estrategistas de conteúdo (Node.js).
Siga EXATAMENTE a estrutura do exemplo abaixo.
Retorne APENAS o código JS válido, sem markdown, sem comentários extras.
NUNCA invente informações não presentes no briefing.

EXEMPLO DE REFERÊNCIA (fest-estrategista/knowledge.js):
${REF.knowledge}`,
    user: `Gere o knowledge.js para este cliente:
${JSON.stringify(briefing, null, 2)}

Nome da constante principal: ${slug}_KNOWLEDGE
Use apenas os fatos presentes no briefing. Deixe campos como "a confirmar" quando não houver dado.
Exporte: { ${slug}_KNOWLEDGE }`,
  };
}

function promptSystemPromptJs(briefing, knowledgeJs) {
  const slug = briefing.slug.toUpperCase().replace(/-/g, '_');
  return {
    system: `Você gera arquivos system-prompt.js para agentes estrategistas de conteúdo (Node.js).
Siga EXATAMENTE a estrutura do exemplo abaixo — BASE compartilhado + prompts especializados por tipo.
Retorne APENAS o código JS válido, sem markdown, sem comentários extras.

EXEMPLO DE REFERÊNCIA (fest-estrategista/system-prompt.js):
${REF.systemPrompt}`,
    user: `Gere o system-prompt.js para este cliente usando o knowledge.js que acabou de ser gerado:

BRIEFING:
${JSON.stringify(briefing, null, 2)}

KNOWLEDGE.JS GERADO:
${knowledgeJs}

Tarefa:
1. Crie ${slug}_STRATEGIST_BASE com: identidade do cliente, audiência, regras absolutas de tom e conteúdo
2. Identifique 3-4 tipos de conteúdo adequados ao modelo de negócio do cliente
3. Escreva um prompt especializado por tipo, herdando o BASE (use template literal \`\${BASE}\\n...\`)
4. Cada tipo deve definir: OBJETIVO, MISSÃO, TOM, ESTRUTURA numerada com CTA e hashtags
5. module.exports com todos os tipos
Nomes das constantes: ${slug}_[TIPO]_SYSTEM`,
  };
}

// ─── Gerador de galeria HTML (template, não IA) ───────────────────────────────

function gerarGaleriaHtml(briefing) {
  const { slug, nome, cores = {}, fontes = {} } = briefing;
  const fundo    = cores.fundo    || '#02050A';
  const destaque = cores.destaque || '#14A8F4';
  const texto    = cores.texto    || '#ffffff';
  const fundoCard = ajustarBrilho(fundo, 12);
  const headline = fontes.headline || 'Space Grotesk';
  const corpo    = fontes.corpo    || 'Inter';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${nome} — Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(headline)}:wght@600;700;800&family=${encodeURIComponent(corpo)}:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/gallery.css?v=1">
<style>
:root {
  --bg: ${fundo};
  --bg-card: ${fundoCard};
  --accent: ${destaque};
  --accent-dim: ${destaque}38;
  --text: ${texto};
  --text-muted: ${texto}99;
  --font-hl: '${headline}', sans-serif;
  --font-body: '${corpo}', sans-serif;
}
body { background: var(--bg); color: var(--text); font-family: var(--font-body); margin: 0; }
.studio-header { background: var(--bg-card); border-bottom: 1px solid var(--accent-dim); padding: 14px 24px; display: flex; align-items: center; gap: 16px; }
.studio-header .brand-name { font-family: var(--font-hl); font-size: 18px; font-weight: 700; color: var(--accent); }
.studio-home-link { font-size: 12px; color: var(--text-muted); text-decoration: none; }
.studio-home-link:hover { color: var(--accent); }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; padding: 28px 24px; max-width: 1400px; margin: 0 auto; }
.arte-card { background: var(--bg-card); border: 1px solid var(--accent-dim); border-radius: 10px; overflow: hidden; cursor: pointer; transition: border-color .2s, transform .15s; }
.arte-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.arte-card img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; background: var(--bg); }
.arte-card .card-body { padding: 12px 14px; }
.arte-card .card-title { font-family: var(--font-hl); font-size: 13px; font-weight: 700; color: var(--text); margin: 0 0 4px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.arte-card .card-tipo { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--accent); margin: 0; }
.empty-state { text-align: center; padding: 80px 24px; color: var(--text-muted); }
.empty-state h2 { font-family: var(--font-hl); font-size: 20px; margin: 0 0 8px; }
</style>
</head>
<body>
<header class="studio-header">
  <a class="studio-home-link" href="/">← Studio</a>
  <span class="brand-name">${nome}</span>
</header>

<div id="gallery" class="gallery-grid"></div>

<script>
(async function(){
  const res = await fetch('/artes-${slug}.json?v=' + Date.now());
  const artes = await res.json();
  const grid = document.getElementById('gallery');
  if (!artes.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><h2>Nenhuma arte ainda</h2><p>Use o CLI para gerar a primeira arte.</p></div>';
    return;
  }
  grid.innerHTML = artes.slice().reverse().map(a => \`
    <div class="arte-card" onclick="location.href='/artes/${slug}-\${a.slug}/arte.html'">
      <img src="\${a.thumb || ''}" onerror="this.style.background='${destaque}22'" alt="">
      <div class="card-body">
        <p class="card-tipo">\${a.tipo || 'arte'}</p>
        <p class="card-title">\${a.headline || '—'}</p>
      </div>
    </div>
  \`).join('');
})();
</script>
</body>
</html>`;
}

function ajustarBrilho(hex, delta) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + delta);
  const g = Math.min(255, ((n >> 8)  & 0xff) + delta);
  const b = Math.min(255, ((n >> 0)  & 0xff) + delta);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// ─── Registro de clientes ─────────────────────────────────────────────────────

function registrarCliente(briefing) {
  const reg = path.join(ROOT, '_clients.json');
  const clientes = fs.existsSync(reg) ? JSON.parse(fs.readFileSync(reg, 'utf8')) : [];
  if (!clientes.find(c => c.slug === briefing.slug)) {
    clientes.push({
      slug: briefing.slug,
      nome: briefing.nome,
      ativo: true,
      criadoEm: new Date().toISOString(),
    });
    fs.writeFileSync(reg, JSON.stringify(clientes, null, 2));
    console.log(`✓ _clients.json atualizado`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const briefingIdx = args.indexOf('--briefing');
  if (briefingIdx < 0 || !args[briefingIdx + 1]) {
    console.error('Uso: node onboarding-cliente.js --briefing caminho/briefing.json');
    process.exit(1);
  }

  const briefingPath = path.resolve(args[briefingIdx + 1]);
  if (!fs.existsSync(briefingPath)) {
    console.error(`Briefing não encontrado: ${briefingPath}`);
    process.exit(1);
  }

  const briefing = JSON.parse(fs.readFileSync(briefingPath, 'utf8'));
  const { slug, nome } = briefing;

  if (!slug || !nome) {
    console.error('Briefing deve ter ao menos: slug, nome');
    process.exit(1);
  }

  console.log(`\n━━━ Onboarding: ${nome} (${slug}) ━━━\n`);

  // Diretórios
  const brandDir  = path.join(ROOT, '_brands', slug);
  const agentDir  = path.join(ROOT, '_agents', `${slug}-estrategista`);
  const galeriaDir = path.join(ROOT, slug);
  [brandDir, agentDir, galeriaDir].forEach(d => fs.mkdirSync(d, { recursive: true }));

  // Logos
  if (briefing.logos) {
    const logos = Array.isArray(briefing.logos) ? briefing.logos : [briefing.logos];
    for (const logo of logos) {
      const src = path.isAbsolute(logo) ? logo : path.resolve(logo);
      if (fs.existsSync(src)) {
        const dest = path.join(brandDir, path.basename(src));
        fs.copyFileSync(src, dest);
        console.log(`✓ Logo copiado: ${path.basename(src)}`);
      } else {
        console.warn(`⚠ Logo não encontrado: ${logo}`);
      }
    }
  }

  // brand.js
  console.log('⏳ Gerando brand.js...');
  const { system: s1, user: u1 } = promptBrandJs(briefing);
  const brandJs = await generateText(u1, s1, 0.4);
  fs.writeFileSync(path.join(brandDir, 'brand.js'), brandJs.trim());
  console.log('✓ brand.js');

  // imagem-prompt.js
  console.log('⏳ Gerando imagem-prompt.js...');
  const { system: s2, user: u2 } = promptImagemPromptJs(briefing);
  const imagemJs = await generateText(u2, s2, 0.5);
  fs.writeFileSync(path.join(brandDir, 'imagem-prompt.js'), imagemJs.trim());
  console.log('✓ imagem-prompt.js');

  // temas.json
  console.log('⏳ Gerando temas.json...');
  const { system: s3, user: u3 } = promptTemasJson(briefing);
  const temasRaw = await generateText(u3, s3, 0.6);
  const temasJson = temasRaw.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  fs.writeFileSync(path.join(brandDir, 'temas.json'), temasJson);
  console.log('✓ temas.json');

  // knowledge.js
  console.log('⏳ Gerando knowledge.js...');
  const { system: s4, user: u4 } = promptKnowledgeJs(briefing);
  const knowledgeJs = await generateText(u4, s4, 0.3);
  fs.writeFileSync(path.join(agentDir, 'knowledge.js'), knowledgeJs.trim());
  console.log('✓ knowledge.js');

  // system-prompt.js
  console.log('⏳ Gerando system-prompt.js...');
  const { system: s5, user: u5 } = promptSystemPromptJs(briefing, knowledgeJs);
  const systemPromptJs = await generateText(u5, s5, 0.5);
  fs.writeFileSync(path.join(agentDir, 'system-prompt.js'), systemPromptJs.trim());
  console.log('✓ system-prompt.js');

  // Galeria
  fs.writeFileSync(path.join(galeriaDir, 'index.html'), gerarGaleriaHtml(briefing));
  console.log('✓ galeria index.html');

  // Banco de artes
  const dbPath = path.join(ROOT, `artes-${slug}.json`);
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '[]');
    console.log(`✓ artes-${slug}.json`);
  } else {
    console.log(`ℹ artes-${slug}.json já existe — mantido`);
  }

  // Registro
  registrarCliente(briefing);

  console.log(`
━━━ Concluído ━━━

Arquivos gerados:
  _brands/${slug}/brand.js
  _brands/${slug}/imagem-prompt.js
  _brands/${slug}/temas.json
  _agents/${slug}-estrategista/knowledge.js
  _agents/${slug}-estrategista/system-prompt.js
  ${slug}/index.html
  artes-${slug}.json
  _clients.json

Próximos passos:
  1. Revise os arquivos gerados (especialmente knowledge.js e system-prompt.js)
  2. Adicione as rotas do cliente no dev-server.js
  3. Acesse http://localhost:8765/${slug}/ para ver a galeria
`);
}

main().catch(e => { console.error(e); process.exit(1); });
