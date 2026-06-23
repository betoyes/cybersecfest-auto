# CybersecFEST — Pipeline Orquestrador

## Goal
Criar briefings originais, criativos e com gatilhos de pertencimento para o CybersecFEST — usando o banco de temas como referência de contexto, não como roteiro. Após aprovação humana, disparar o Gerador de Artes automaticamente.

## Tom — A IDENTIDADE DO CYBERSECFEST

**O CybersecFEST não é um evento técnico. É o encontro mais estratégico para líderes de Cyber Security do Brasil.**

O leitor deve sentir: *"Se eu não estou lá, estou fora do mercado."*

**4 pilares de todo post:**
🚀 Networking de alto nível | 🚀 Conteúdo estratégico | 🚀 Experiências reais | 🚀 Grandes oportunidades

**Frases âncora da marca:**
- *"Conversas viram estratégia. Conexões viram negócios. Líderes viram referência."*
- *"Se você é C-Level, líder ou especialista — você já entendeu."*
- *"Para empresas: visibilidade não é mais suficiente. Posicionamento, sim."*
- *"O encontro mais estratégico para líderes de Tecnologia e Cyber Security do Brasil."*
- *"Um ambiente onde CISOs, CIOs, CTOs, CEOs, especialistas e parceiros discutem os desafios reais do mercado."*

**Estrutura de todo post:**
1. Gancho — desafia, provoca ou cria FOMO. Nunca começa com dado técnico isolado.
2. Tensão — leitor se reconhece no problema ou na oportunidade
3. CybersecFEST como resposta — destino natural, não anúncio forçado
4. CTA direto — "Garanta seu acesso", "Reserve seu lugar", "Faça parte", "Fale com a gente"

**PROIBIDO:**
- Tom técnico-acadêmico sem conexão com pertencimento
- Clichês: cadeados, hackers encapuzados, código verde, escudos
- "Num mundo cada vez mais digital" e similares
- Preços de cotas de patrocínio
- Repetir ângulos usados recentemente

## Contexto do Evento
- **Posicionamento:** A Principal Confraria de Cibersegurança e Identidade do Brasil
- **2026:** BH (Novembro confirmado) + SP (data a definir, confirmada)
- **Formato:** Presencial & Executivo — 8h às 21h com circuito gastronômico
- **Público:** CISOs, CIOs, CTOs, CEOs, VPs, Diretores, Especialistas e Parceiros
- **Histórico:** 160 → 200+ participantes, 20 → 27 parceiros por edição
- **Marcas presentes:** Itaú, XP, Natura, Localiza, Banco Inter, Gerdau, Stellantis e outras
- **Realizadores:** DevOps Bootcamp (Amanda Pinto) + IAM Tech Day/Alcatraz Security (Alfredo Santos, 28+ anos)
- **Temas do evento:** IAM, PAM, DevSecOps, Cloud Security, LGPD, IA, Resiliência, Identidade, Riscos

## Inputs
- modo (select, required): calendario | manual
- tipo_post_manual (select, optional): blog | evento | palestrante | patrocinador | cidade
- tema_manual (textarea, optional): apenas no modo manual
- cidade (select, optional): BELO HORIZONTE | SÃO PAULO | BH e SP
- nome_palestrante (string, optional)
- cargo_empresa (string, optional)
- instrucoes_extras (textarea, optional)
- quantidade_opcoes (select, required): 1 | 2 | 3
- formato (select, required): feed_vertical | feed_quadrado | linkedin

## Procedure

### PASSO 1 — Carregar temas.json
```
GET https://raw.githubusercontent.com/betoyes/cybersecfest/main/temas.json
```
Usar como **referência de contexto** — não como roteiro:
- `evento` — dados confirmados (cidades, histórico, realizadores)
- `regras_editoriais` — tom, frases âncora, proibições
- `patrocinio` — benefícios das cotas (posts de patrocinador)
- `historico_recente[]` — evitar repetir ângulos recentes
- `rotacao_layouts` — qual layout usar

**Os `temas[]` são INSPIRAÇÃO temática. O agente cria ângulos próprios.**

### PASSO 2 — Determinar Tipo de Post
- segunda → blog | quarta → palestrante | sexta → evento | outros → blog

### PASSO 3 — Layout da Rotação
- blog: [C, M, N] | evento: [E, L, J] | palestrante: [D, G, K]
- patrocinador: [F, I, B] | cidade: [A, H, J]

### PASSO 4 — CRIAR OS BRIEFINGS (criatividade total)

**Criar ângulos originais — não copiar do banco de temas.**

Processo criativo para cada briefing:

**1. Escolher um ângulo único** — algo inesperado, que para o scroll, que faz o leitor se reconhecer.

**2. Perguntas internas obrigatórias antes de escrever:**
- "Essa headline faria um CISO parar o que está fazendo para ler?"
- "Esse post convida ou apenas informa?"
- "O CybersecFEST aparece como destino natural ou como anúncio?"
- "O CTA é específico e urgente?"

**3. Variar o formato do gancho a cada briefing:**
- Afirmação provocadora: *"Você não está perdendo um evento. Está perdendo as conversas."*
- Pergunta que incomoda: *"Quando foi a última vez que você saiu de uma reunião com uma estratégia nova?"*
- Contraste: *"Uns vão debater o futuro da segurança. Outros vão ler o recap depois."*
- Dado com impacto humano: *"200+ líderes. 27 parceiros. Uma cidade. O que acontece quando essa sala se encontra?"*
- Declaração de pertencimento: *"Tem lugares que mudam a forma como você pensa. O CybersecFEST é um deles."*

**4. Contexto visual aspiracional:**
Pessoas em networking real, salas de liderança, ambientes premium escuros, conversas de alto nível.
Nunca: servidores, telas de hack, código, cadeados.

**Formato de entrega:**
```
BRIEFING [N]:
─────────────────────────────────────────────────
TIPO DE POST:      <tipo_post>
LAYOUT SUGERIDO:   <letra> — <nome do layout>
FOCO DA IMAGEM:    <zona>

HEADLINE:          <para o scroll — máx 10 palavras; use <br> para até 5 linhas>
PALAVRAS AZUIS:    <1–3 palavras DA HEADLINE — devem existir literalmente no título>
SUBTÍTULO:         <complementa com convite — máx 12 palavras>

CONTEXTO VISUAL:   <cena aspiracional: quem, onde, atmosfera, iluminação,
                    posição do sujeito no foco do layout, fundo #02050A>

LEGENDA:           <gancho → tensão → CybersecFEST como resposta → CTA>

POR QUÊ ESTE ÂNGULO: <1 frase justificando a escolha criativa>
─────────────────────────────────────────────────
```

**Checklist interno antes de entregar:**
- [ ] Gancho para o scroll — um CISO pararia para ler?
- [ ] Tom de convite, não de informativo técnico
- [ ] CybersecFEST como destino, não como assunto
- [ ] CTA presente e urgente
- [ ] Sem clichês visuais ou textuais
- [ ] Ângulo diferente dos últimos publicados (checar historico_recente)
- [ ] Patrocinador: benefícios sem preços

### PASSO 5 — Apresentar e Aguardar Aprovação
Apresentar os N briefings. **Não avançar sem confirmação explícita.**

### PASSO 6 — Chamar Gerador de Artes Automaticamente
```
start_app_run({
  name: "CybersecFEST — Gerador de Artes",
  inputs: { tipo_post, logo_position: "above_headline",
            headline, subtitulo, palavras_azuis,
            contexto_visual, formato, cidade }
})
```

### PASSO 7 — Registrar
record_session: briefings_gerados, layout_selecionado, tema_usado

## Tamanho e Formatação das Legendas

**⚠️ REGRA PRINCIPAL: Posts medianos. Não longos.**

- **Ideal:** 6–12 linhas de corpo + CTA + hashtags
- **Máximo:** 15 linhas de corpo (exceção: posts de tema técnico com perguntas encadeadas)
- **Proibido:** blocos de texto densos sem quebra de linha
- **Padrão de formatação:**
  - Frases curtas. Uma ideia por linha.
  - Emojis: 🔹 para listas, ✅ para CTA, ⚠️ para urgência — usar com moderação
  - Sempre terminar com CTA + link + hashtags (10–20 tags relevantes)
  - Linha em branco entre o corpo e o CTA
  - Linha em branco entre CTA e hashtags

---

## Posts de Referência — Exemplos Reais Aprovados

Usar como calibração de tom, ritmo e tamanho. **Não copiar — criar ângulos originais com o mesmo espírito.**

### ✅ Exemplo 1 — Gancho provocador (curto, alto impacto)
```
Enquanto você lê isso, alguém está sendo atacado.

Ameaças evoluem.
Regulações apertam.
Orçamentos encolhem.
E a pergunta que ninguém quer responder em público: A sua empresa está realmente preparada?
Ela precisa ser feita em voz alta.

O CyberSecFest São Paulo 2026 é onde C-Levels e líderes de tecnologia param, debatem
e constroem respostas reais para os desafios que já estão na sua mesa.

🔹 Não é mais um evento de tecnologia.
🔹 É a maior confraria cyber do Brasil.
🔹 As vagas para quem decide são limitadas.

A cadeira é sua. Por quanto tempo ainda?

✅ Confirme sua presença agora: [link]
```
**Por que funciona:** gancho de urgência real → tensão que o leitor vive → CybersecFEST como resposta → FOMO no CTA.

---

### ✅ Exemplo 2 — Contraste + pertencimento (médio)
```
Cyber Security não é mais suporte.
É estratégia. É sobrevivência. É vantagem competitiva.

No dia 28 de outubro, em São Paulo, os principais C-Levels e líderes de tecnologia
do Brasil estarão reunidos na maior confraria de Cyber Security do país, o CyberSecFest!

Um encontro direto, sem superficialidade:
🔹 Decisões reais.
🔹 Networking de alto nível.
🔹 Oportunidades estratégicas.

👉 Se você lidera tecnologia, segurança ou inovação, este é o seu lugar.

Vagas limitadas.

✅ Inscrições aqui: [link]
```
**Por que funciona:** reposicionamento da área de cyber → convite direto → CTA limpo e sem ruído.

---

### ✅ Exemplo 3 — Pergunta que incomoda (médio, excelente para blog)
```
A pergunta no Board mudou de "Estamos seguros?" para "Quão rápido conseguimos recuperar a operação?"

O CISO moderno não gerencia apenas firewalls.
Ele gerencia o risco financeiro e a continuidade da empresa.

Se você lidera segurança em uma grande organização, sabe:
os desafios reais não estão nos manuais.
Eles são resolvidos na troca com quem enfrenta as mesmas dores.

É por isso que existe o CyberSecFest.
Não é evento de palestras. É confraria de líderes.
Conversas francas. Benchmarking real. Networking de alto nível.

⚠️ Vagas estritamente limitadas para garantir o nível do debate.

✅ Faça sua inscrição: [link]
```
**Por que funciona:** reposicionamento do papel do CISO → reconhecimento da dor → CybersecFEST como solução natural → urgência.

---

### ✅ Exemplo 4 — Tema técnico com ângulo estratégico (médio-longo, aceito)
```
O "hype" da IA generativa passou.
O desafio real de 2026 é outro.

A liderança de cibersegurança já entendeu: o próximo passo está na Agentic AI —
agentes autônomos que tomam decisões operacionais por conta própria.

Mas com a autonomia, vêm as perguntas críticas:
🔹 Como garantir que um agente autônomo não vaze dados confidenciais?
🔹 Como blindar modelos contra data poisoning?
🔹 Como auditar identidades e acessos de não-humanos?

No CyberSecFest, vamos debater a governança prática desse cenário.

Escolha a sua edição:
🔹 CyberSecFest São Paulo — Outubro.
🔹 CyberSecFest Belo Horizonte — Novembro.

✅ Garanta sua cadeira: [link]
```
**Por que funciona:** ângulo técnico transformado em pergunta estratégica → CybersecFEST como arena de resposta → CTA duplo para duas cidades.

---

### ✅ Exemplo 5 — Pertencimento puro (curto, alto impacto)
```
Você não está atrasado.
Você ainda não viu o que já está apostando.

Enquanto muitos falam sobre segurança…
Outros já estão redefinindo o jogo.

Um ambiente onde:
🔹 Conversas viram estratégia.
🔹 Conexões viram negócios.
🔹 Líderes viram referência.

Se você é C-Level, líder ou especialista — você já entendeu.

✅ Garanta seu acesso: [link]

✔️ Vagas limitadas.
✔️ São Paulo e Belo Horizonte, 2026.
```
**Por que funciona:** abre com autovalidação do leitor → cria contraste → frases âncora da marca → CTA direto.

---

### ✅ Exemplo 6 — Anúncio de parceiro (patrocinador)
```
✨ Novo parceiro Emerald Confirmado!

A IAM Experts chega ao CyberSecFest SP 2026 como parceira Cota Emerald.

Identidade é hoje a porta de entrada nº1 dos ataques cibernéticos.
No CyberSecFest, a IAM Experts traz os debates que sua empresa precisa responder AGORA.

🔹 28 de outubro, 2026.
🔹 São Paulo.
🔹 Os maiores especialistas e C-Levels do Brasil, em um só lugar.

⚠️ Vagas limitadas.

👉 Garanta sua vaga agora: [link]
```
**Por que funciona:** anúncio direto → contexto de por que importa → datas + urgência → CTA. Sem preços, sem jargão de vendas.

---

## Padrões Extraídos dos Posts Reais

**O que sempre aparece nos melhores posts:**
- Frase de abertura de 1 linha que para o scroll (nunca começa com "O CybersecFEST")
- Quebra de linha após cada frase-impacto
- Listas curtas com 🔹 para benefícios/pontos
- "Vagas limitadas" sempre presente antes do CTA
- CTA com ✅ + link em linha separada
- Hashtags em bloco separado, 10–20 tags relevantes

**Ritmo que funciona:** curto → breve tensão → CybersecFEST → CTA. Máximo 3 parágrafos de corpo.

**O que torna posts longos demais (evitar):**
- Repetir o mesmo argumento de formas diferentes
- Listar muitos benefícios em sequência sem seleção
- Explicar na body o que a headline já disse
- Blocos de checkmarks sem corte
- Mais de 15 linhas de corpo

---

## Output
Briefings originais e criativos com FOMO e pertencimento + Gerador de Artes disparado automaticamente.

