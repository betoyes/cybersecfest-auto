// CybersecFEST — Pipeline Orquestrador (autônomo)
// Roda seg/qua/sex às 08h BRT via GitHub Actions
'use strict';

const { getJSON } = require('./utils/github.js');
const { generateText } = require('./utils/llm.js');
const { gerarArte }    = require('./gerador-artes.js');

// ── Tipo de post por dia da semana ───────────────────────────────
function tipoPostDoDia(dataBRT = new Date()) {
  const dia = dataBRT.getDay(); // 0=dom,1=seg,2=ter,3=qua,4=qui,5=sex,6=sab
  if (dia === 1) return 'blog';
  if (dia === 3) return 'palestrante';
  if (dia === 5) return 'evento';
  return 'blog'; // fallback
}

// ── Gerar briefing completo via LLM ──────────────────────────────
async function gerarBriefing(tipoPost, temas) {
  const historico = (temas.historico_recente || [])
    .slice(-5)
    .map(h => `- ${h.tipo_post} (${h.data})`)
    .join('\n') || 'Nenhum ainda.';

  const temasGrade = temas.evento?.temas_grade?.join(', ') || 'IAM, PAM, DevSecOps, Cloud Security, LGPD, IA';
  const marcas     = temas.evento?.marcas_participantes?.slice(0,6).join(', ') || 'Itaú, XP, Natura, Localiza, Gerdau, Stellantis';

  const system = `Você é copywriter sênior do CybersecFEST — A Principal Confraria de Cibersegurança do Brasil.
Tom: aspiracional, exclusivo, FOMO. O leitor deve sentir: "Se não estou lá, estou fora do mercado."
Público: CISOs, CIOs, CTOs, CEOs, VPs, Diretores.
PROIBIDO: começar com "O CybersecFEST", clichês (cadeados, hackers), tom técnico-acadêmico.`;

  const prompt = `Crie um briefing completo para post de ${tipoPost} do CybersecFEST 2026.

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
  "contexto_visual": "cena aspiracional dark: quem, onde, atmosfera, iluminação — SEM clichês de hacking",
  "cidade": "BH e SP"
}`;

  const raw = await generateText(prompt, system, 0.85);

  // Extrair JSON da resposta
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('LLM não retornou JSON válido: ' + raw.slice(0,200));

  const briefing = JSON.parse(match[0]);

  // Validações mínimas
  if (!briefing.headline) throw new Error('Briefing sem headline');
  if (briefing.headline.toLowerCase().startsWith('o cybersecfest')) {
    briefing.headline = briefing.headline.replace(/^o cybersecfest\s*/i, '');
  }

  return briefing;
}

// ── Main ─────────────────────────────────────────────────────────
async function run() {
  console.log('🚀 CybersecFEST Pipeline — iniciando...');
  console.log(`   Data/hora: ${new Date().toISOString()}`);

  // Determinar tipo de post
  // Ajustar para BRT (UTC-3)
  const utcNow = new Date();
  const brtNow = new Date(utcNow.getTime() - 3 * 60 * 60 * 1000);
  const tipoPost = tipoPostDoDia(brtNow);
  console.log(`📅 Dia BRT: ${brtNow.toDateString()} → tipo: ${tipoPost}`);

  // Carregar temas
  const temasFile = await getJSON('temas.json');
  if (!temasFile) throw new Error('temas.json não encontrado');
  const temas = temasFile.data;

  // Gerar briefing
  console.log('📝 Gerando briefing...');
  const briefing = await gerarBriefing(tipoPost, temas);
  console.log(`   Headline: ${briefing.headline}`);
  console.log(`   Layout foco: ${briefing.contexto_visual?.slice(0,60)}...`);

  // Gerar arte completa
  const resultado = await gerarArte({
    tipoPost,
    headline:       briefing.headline,
    subtitulo:      briefing.subtitulo,
    palavrasAzuis:  briefing.palavras_azuis,
    contextoVisual: briefing.contexto_visual,
    cidade:         briefing.cidade || 'BH e SP',
    briefingCompleto: `${briefing.headline}\n${briefing.subtitulo}`
  });

  console.log('\n✅ Pipeline concluído!');
  console.log(`   slug:    ${resultado.slug}`);
  console.log(`   layout:  ${resultado.layout}`);
  console.log(`   legenda: ${resultado.varianteSelecionada} (A:${resultado.scoreA} B:${resultado.scoreB})`);
}

run().catch(e => {
  console.error('❌ Pipeline falhou:', e.message);
  console.error(e.stack);
  process.exit(1);
});
