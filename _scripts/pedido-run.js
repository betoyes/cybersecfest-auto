'use strict';

require('./load-env.js');

const { getJSON } = require('./utils/storage.js');
const { generateText } = require('./utils/llm.js');
const { gerarArte }    = require('./gerador-artes.js');

function tipoPostDoDia(dataBRT = new Date()) {
  const dia = dataBRT.getDay();
  if (dia === 1) return 'blog';
  if (dia === 3) return 'palestrante';
  if (dia === 5) return 'evento';
  return 'blog';
}

async function gerarBriefing(tipoPost, temas, temaLivre = '') {
  const historico = (temas.historico_recente || [])
    .slice(-5)
    .map(h => `- ${h.tipo_post} (${h.data})`)
    .join('\n') || 'Nenhum ainda.';

  const temasGrade = temas.evento?.temas_grade?.join(', ') || 'IAM, PAM, DevSecOps, Cloud Security, LGPD, IA';
  const marcas     = temas.evento?.marcas_participantes?.slice(0, 6).join(', ') || 'Itaú, XP, Natura, Localiza, Gerdau, Stellantis';

  const system = `Você é copywriter sênior do CybersecFEST — A Principal Confraria de Cibersegurança do Brasil.
Tom: aspiracional, exclusivo, FOMO. O leitor deve sentir: "Se não estou lá, estou fora do mercado."
Público: CISOs, CIOs, CTOs, CEOs, VPs, Diretores.
PROIBIDO: começar com "O CybersecFEST", clichês (cadeados, hackers), tom técnico-acadêmico.`;

  const temaExtra = temaLivre
    ? `\nBRIEFING DO USUÁRIO (prioridade máxima — use como direção central):\n${temaLivre}\n`
    : '';

  const prompt = `Crie um briefing completo para post de ${tipoPost} do CybersecFEST 2026.
${temaExtra}
CONTEXTO:
- 2 edições: BH (Novembro 2026) e SP (Outubro 2026)
- Marcas participantes: ${marcas}
- Temas da grade: ${temasGrade}
- Histórico recente (evitar repetir ângulos): ${historico}

RETORNE EXATAMENTE neste formato JSON (sem markdown, apenas JSON puro):
{
  "headline": "máx 8 palavras, impacto máximo, nunca começa com O CybersecFEST",
  "palavras_azuis": "1-3 palavras da headline para destacar em azul, separadas por vírgula",
  "subtitulo": "máx 12 palavras, complementa com convite",
  "contexto_visual": "cena aspiracional dark APENAS visual: quem, onde, atmosfera, iluminação — SEM texto, SEM palavras de headline, SEM clichês de hacking",
  "cidade": "BH e SP"
}`;

  const raw = await generateText(prompt, system, 0.85);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('LLM não retornou JSON válido: ' + raw.slice(0, 200));

  const briefing = JSON.parse(match[0]);
  if (!briefing.headline) throw new Error('Briefing sem headline');
  if (briefing.headline.toLowerCase().startsWith('o cybersecfest')) {
    briefing.headline = briefing.headline.replace(/^o cybersecfest\s*/i, '');
  }
  return briefing;
}

/**
 * @param {object} opts
 * @param {string} [opts.tipoPost]
 * @param {string} [opts.tema]          — direção editorial livre
 * @param {string} [opts.headline]
 * @param {string} [opts.subtitulo]
 * @param {string} [opts.palavrasAzuis]
 * @param {string} [opts.contextoVisual]
 * @param {string} [opts.cidade]
 */
async function executarPedido(opts = {}) {
  const override = process.env.TIPO_POST_OVERRIDE;
  const tipoPost = opts.tipoPost || override || (() => {
    const brt = new Date(Date.now() - 3 * 60 * 60 * 1000);
    return tipoPostDoDia(brt);
  })();

  const temasFile = await getJSON('temas.json');
  if (!temasFile) throw new Error('temas.json não encontrado');
  const temas = temasFile.data;

  let briefing;
  if (opts.headline?.trim()) {
    briefing = {
      headline:       opts.headline.trim(),
      subtitulo:      opts.subtitulo?.trim() || '',
      palavras_azuis: opts.palavrasAzuis?.trim() || '',
      contexto_visual: opts.contextoVisual?.trim() || opts.tema?.trim() || 'Executivos em ambiente corporativo dark, iluminação azul',
      cidade:         opts.cidade?.trim() || 'BH e SP',
    };
  } else {
    briefing = await gerarBriefing(tipoPost, temas, opts.tema?.trim() || '');
  }

  const resultado = await gerarArte({
    tipoPost,
    headline:         briefing.headline,
    subtitulo:        briefing.subtitulo,
    palavrasAzuis:    briefing.palavras_azuis,
    contextoVisual:   briefing.contexto_visual,
    cidade:           briefing.cidade || 'BH e SP',
    briefingCompleto: `${briefing.headline}\n${briefing.subtitulo}`,
  });

  return { ...resultado, tipoPost, briefing };
}

module.exports = { executarPedido, gerarBriefing, tipoPostDoDia };
