/* CybersecFEST — Motion Library v2 (preview lab) */
(function (global) {
  'use strict';

  const CATEGORIES = [
    { id: 'opening', label: 'Abertura' },
    { id: 'background', label: 'Background / Foto' },
    { id: 'text', label: 'Headline' },
    { id: 'keyword', label: 'Palavra-chave' },
    { id: 'mesh', label: 'Malha / Sistema' },
    { id: 'signal', label: 'Sinal / Energia' },
    { id: 'logo', label: 'Logo' },
    { id: 'cta', label: 'CTA' },
    { id: 'transition', label: 'Transição / Impacto' },
    { id: 'finish', label: 'Acabamento' },
    { id: 'social-impact', label: 'Impacto Social / CapCut-inspired' },
    { id: 'svg-motion', label: 'Anime.js-inspired / SVG Motion' },
    { id: 'depth-focus', label: 'Depth, Blur, Focus & Lens' },
    { id: 'animated-mesh-depth', label: 'Animated Meshes, Patterns & Depth' },
  ];

  function fx(base) {
    return { implemented: true, soloDuration: 1.2, ...base };
  }

  const EFFECTS = [
    /* ── v1 implementados ── */
    fx({ id: 'blackout-strike', label: 'Blackout Strike', category: 'opening', description: 'Blackout inicial seguido de flash energético e revelação rápida do fundo.', intensity: 'high', durationSuggested: '0.15s–0.45s', tags: ['impacto', 'abertura'], phase: 'opening', soloDuration: 1.2, implemented: true }),
    fx({ id: 'light-sweep-reveal', label: 'Light Sweep Reveal', category: 'opening', description: 'Feixe diagonal revela o fundo com sensação cinematográfica.', intensity: 'medium', durationSuggested: '0.4s–0.9s', tags: ['abertura', 'luz'], phase: 'opening', soloDuration: 1.4, implemented: true }),
    fx({ id: 'mask-rise', label: 'Mask Rise', category: 'text', description: 'Linhas da headline sobem com máscara vertical.', intensity: 'medium', durationSuggested: '0.5s–1.2s', tags: ['headline', 'máscara'], phase: 'headline', soloDuration: 1.6, implemented: true }),
    fx({ id: 'impact-word', label: 'Impact Word', category: 'text', description: 'Palavra-chave recebe flash, glow e micro-shake controlado.', intensity: 'high', durationSuggested: '0.2s–0.5s', tags: ['headline', 'impacto'], phase: 'headline', soloDuration: 1.1, implemented: true }),
    fx({ id: 'mesh-network-flow', label: 'Mesh Network Flow', category: 'mesh', description: 'Nós e linhas com sinal azul percorrendo caminhos entre nós.', intensity: 'high', durationSuggested: '1.0s–2.0s', tags: ['malha', 'rede'], phase: 'mesh', soloDuration: 2.0, implemented: true }),
    fx({ id: 'mesh-city-map', label: 'Mesh City Map', category: 'mesh', description: 'Malha técnica integrada visualmente ao skyline da cidade.', intensity: 'medium', durationSuggested: '0.8s–1.6s', tags: ['malha', 'cidade'], phase: 'mesh', soloDuration: 1.8, implemented: true }),
    fx({ id: 'logo-wipe', label: 'Logo Wipe', category: 'logo', description: 'Logo revelado por máscara lateral rápida.', intensity: 'medium', durationSuggested: '0.3s–0.6s', tags: ['logo', 'wipe'], phase: 'logo', soloDuration: 0.9, implemented: true }),
    fx({ id: 'cta-access-unlock', label: 'CTA Access Unlock', category: 'cta', description: 'Contorno do CTA se desenha; botão entra como acesso liberado.', intensity: 'high', durationSuggested: '0.6s–1.2s', tags: ['cta', 'unlock'], phase: 'cta', soloDuration: 1.4, implemented: true }),
    fx({ id: 'cta-signal-arrival', label: 'CTA Signal Arrival', category: 'cta', description: 'Sinal percorre a malha e termina apontando para o CTA.', intensity: 'high', durationSuggested: '0.8s–1.5s', tags: ['cta', 'sinal'], phase: 'cta', soloDuration: 1.6, implemented: true }),
    fx({ id: 'scan-beam', label: 'Scan Beam', category: 'transition', description: 'Faixa de luz cruza a composição (horizontal, vertical ou diagonal).', intensity: 'medium', durationSuggested: '0.3s–0.8s', tags: ['scan', 'transição'], phase: 'transition', soloDuration: 1.0, implemented: true }),

    /* ── v2 prioridade — implementados ── */
    fx({ id: 'portal-reveal', label: 'Portal Reveal', category: 'opening', description: 'Recorte luminoso vertical se abre revelando a peça como passagem de acesso.', intensity: 'high', durationSuggested: '0.5s–1.0s', tags: ['abertura', 'portal'], phase: 'opening', soloDuration: 1.3, implemented: true }),
    fx({ id: 'grid-power-on', label: 'Grid Power On', category: 'opening', description: 'Grid técnico acende em blocos antes de revelar o conteúdo.', intensity: 'high', durationSuggested: '0.6s–1.2s', tags: ['abertura', 'grid', 'cyber'], phase: 'opening', soloDuration: 1.5, implemented: true }),
    fx({ id: 'headline-slam', label: 'Headline Slam', category: 'text', description: 'Cada linha entra com movimento curto e firme, como se batesse no layout.', intensity: 'high', durationSuggested: '0.4s–0.9s', tags: ['headline', 'impacto'], phase: 'headline', soloDuration: 1.4, implemented: true }),
    fx({ id: 'headline-fragment-assemble', label: 'Headline Fragment Assemble', category: 'text', description: 'Blocos do texto se montam rapidamente até formar a headline.', intensity: 'high', durationSuggested: '0.5s–1.1s', tags: ['headline', 'cyber', 'IA'], phase: 'headline', soloDuration: 1.5, implemented: true }),
    fx({ id: 'keyword-stamp', label: 'Keyword Stamp', category: 'keyword', description: 'Palavra-chave recebe marca tecnológica com flash breve.', intensity: 'high', durationSuggested: '0.2s–0.5s', tags: ['keyword', 'stamp'], phase: 'headline', soloDuration: 1.0, implemented: true }),
    fx({ id: 'mesh-neural-flow', label: 'Mesh Neural Flow', category: 'mesh', description: 'Nós conectados por caminhos orgânicos, rede neural.', intensity: 'high', durationSuggested: '1.0s–2.0s', tags: ['malha', 'IA', 'neural'], phase: 'mesh', soloDuration: 2.0, implemented: true }),
    fx({ id: 'mesh-polygon-shield', label: 'Mesh Polygon Shield', category: 'mesh', description: 'Polígonos geométricos criam estrutura de defesa ao redor do conteúdo.', intensity: 'high', durationSuggested: '0.8s–1.6s', tags: ['malha', 'segurança'], phase: 'mesh', soloDuration: 2.0, implemented: true }),
    fx({ id: 'mesh-circuit-board', label: 'Mesh Circuit Board', category: 'mesh', description: 'Trilhas de circuito conectam pontos da composição.', intensity: 'high', durationSuggested: '0.9s–1.8s', tags: ['malha', 'circuito'], phase: 'mesh', soloDuration: 1.8, implemented: true }),
    fx({ id: 'signal-route', label: 'Signal Route', category: 'signal', description: 'Ponto de luz percorre caminho complexo e termina no CTA.', intensity: 'high', durationSuggested: '0.8s–1.5s', tags: ['sinal', 'rota'], phase: 'mesh', soloDuration: 1.6, implemented: true }),
    fx({ id: 'signal-chain-reaction', label: 'Signal Chain Reaction', category: 'signal', description: 'Um nó acende outros em sequência, reação em cadeia.', intensity: 'high', durationSuggested: '0.7s–1.4s', tags: ['sinal', 'cadeia'], phase: 'mesh', soloDuration: 1.5, implemented: true }),
    fx({ id: 'logo-glow-reveal', label: 'Logo Glow Reveal', category: 'logo', description: 'Logo aparece escondido por brilho azul e se estabiliza.', intensity: 'medium', durationSuggested: '0.4s–0.9s', tags: ['logo'], phase: 'logo', soloDuration: 1.1, implemented: true }),
    fx({ id: 'cta-energy-frame', label: 'CTA Energy Frame', category: 'cta', description: 'Linhas de energia desenham a moldura do botão.', intensity: 'high', durationSuggested: '0.6s–1.2s', tags: ['cta', 'energia'], phase: 'cta', soloDuration: 1.4, implemented: true }),
    fx({ id: 'cta-data-transfer', label: 'CTA Data Transfer', category: 'cta', description: 'Pacotes de luz chegam ao CTA e são absorvidos.', intensity: 'high', durationSuggested: '0.8s–1.5s', tags: ['cta', 'dados'], phase: 'cta', soloDuration: 1.6, implemented: true }),
    fx({ id: 'frame-punch', label: 'Frame Punch', category: 'transition', description: 'Micro zoom no canvas com flash e retorno imediato.', intensity: 'high', durationSuggested: '0.15s–0.35s', tags: ['impacto', 'zoom'], phase: 'transition', soloDuration: 0.9, implemented: true }),
    fx({ id: 'energy-wipe', label: 'Energy Wipe', category: 'transition', description: 'Faixa azul forte atravessa a peça e muda a fase visual.', intensity: 'high', durationSuggested: '0.3s–0.7s', tags: ['wipe', 'energia'], phase: 'transition', soloDuration: 1.0, implemented: true }),

    /* ── v2 catálogo — planejados ── */
    fx({ id: 'radar-sweep', label: 'Radar Sweep', category: 'opening', description: 'Radar circular varre a composição e revela pontos relevantes.', intensity: 'medium', durationSuggested: '0.6s–1.2s', tags: ['radar'], phase: 'opening' }),
    fx({ id: 'data-burst', label: 'Data Burst', category: 'opening', description: 'Explosão controlada de blocos e sinais de dados.', intensity: 'high', durationSuggested: '0.3s–0.7s', tags: ['dados'], phase: 'opening' }),
    fx({ id: 'shutter-slice', label: 'Shutter Slice', category: 'opening', description: 'Revelação por faixas horizontais ou verticais.', intensity: 'high', durationSuggested: '0.4s–0.9s', tags: ['shutter'], phase: 'opening' }),
    fx({ id: 'photo-depth-tilt', label: 'Photo Depth Tilt', category: 'background', description: 'Foto com deslocamento lento e leve perspectiva.', intensity: 'medium', durationSuggested: '2.0s–4.0s', tags: ['foto'], phase: 'opening' }),
    fx({ id: 'blue-light-map', label: 'Blue Light Map', category: 'background', description: 'Áreas da foto ganham luz azul progressivamente.', intensity: 'medium', durationSuggested: '1.0s–2.0s', tags: ['foto', 'luz'], phase: 'opening' }),
    fx({ id: 'focus-window', label: 'Focus Window', category: 'background', description: 'Janela de foco revela área enquanto o resto fica escuro.', intensity: 'medium', durationSuggested: '0.6s–1.2s', tags: ['foco'], phase: 'opening' }),
    fx({ id: 'digital-zoom-lock', label: 'Digital Zoom Lock', category: 'background', description: 'Zoom rápido aproxima região e estabiliza no layout.', intensity: 'high', durationSuggested: '0.5s–1.0s', tags: ['zoom'], phase: 'opening' }),
    fx({ id: 'freeze-frame-punch', label: 'Freeze Frame Punch', category: 'background', description: 'Micro congelamento visual com flash e retorno ao movimento.', intensity: 'high', durationSuggested: '0.2s–0.4s', tags: ['flash'], phase: 'opening' }),
    fx({ id: 'headline-split-reveal', label: 'Headline Split Reveal', category: 'text', description: 'Texto surge dividido abrindo para cima/baixo ou lateral.', intensity: 'high', durationSuggested: '0.5s–1.0s', tags: ['headline'], phase: 'headline' }),
    fx({ id: 'headline-wave-stagger', label: 'Headline Wave Stagger', category: 'text', description: 'Linhas entram em sequência com onda de profundidade.', intensity: 'medium', durationSuggested: '0.6s–1.2s', tags: ['headline'], phase: 'headline' }),
    fx({ id: 'headline-lock-on', label: 'Headline Lock On', category: 'text', description: 'Brackets HUD identificam a headline antes da entrada.', intensity: 'medium', durationSuggested: '0.5s–1.0s', tags: ['headline', 'hud'], phase: 'headline' }),
    fx({ id: 'keyword-energy-box', label: 'Keyword Energy Box', category: 'keyword', description: 'Caixa de energia desenha contorno ao redor da palavra.', intensity: 'medium', durationSuggested: '0.3s–0.6s', tags: ['keyword'], phase: 'headline' }),
    fx({ id: 'keyword-scan-pass', label: 'Keyword Scan Pass', category: 'keyword', description: 'Linha azul lê a palavra e deixa brilho temporário.', intensity: 'low', durationSuggested: '0.2s–0.5s', tags: ['keyword'], phase: 'headline' }),
    fx({ id: 'keyword-glow-hit', label: 'Keyword Glow Hit', category: 'keyword', description: 'Glow forte e curto com retorno rápido.', intensity: 'high', durationSuggested: '0.15s–0.35s', tags: ['keyword'], phase: 'headline' }),
    fx({ id: 'keyword-understrike', label: 'Keyword Understrike', category: 'keyword', description: 'Linha energética cresce debaixo da palavra e se fragmenta.', intensity: 'medium', durationSuggested: '0.3s–0.6s', tags: ['keyword'], phase: 'headline', soloDuration: 1.2 }),
    fx({ id: 'mesh-laser-grid', label: 'Mesh Laser Grid', category: 'mesh', description: 'Grade técnica com linhas que acendem em sequência.', intensity: 'medium', durationSuggested: '0.8s–1.5s', tags: ['malha'], phase: 'mesh' }),
    fx({ id: 'mesh-data-rain', label: 'Mesh Data Rain', category: 'mesh', description: 'Linhas verticais e microdados caem no fundo.', intensity: 'medium', durationSuggested: '1.0s–2.0s', tags: ['malha'], phase: 'mesh', soloDuration: 2.2 }),
    fx({ id: 'signal-packet-burst', label: 'Signal Packet Burst', category: 'signal', description: 'Pacotes de luz saem de um nó e se espalham.', intensity: 'medium', durationSuggested: '0.5s–1.0s', tags: ['sinal'], phase: 'mesh' }),
    fx({ id: 'signal-intercept', label: 'Signal Intercept', category: 'signal', description: 'Linha em movimento é interrompida por lock visual.', intensity: 'high', durationSuggested: '0.4s–0.8s', tags: ['sinal'], phase: 'mesh' }),
    fx({ id: 'logo-hud-lock', label: 'Logo HUD Lock', category: 'logo', description: 'Cantos HUD surgem, fazem lock e revelam a marca.', intensity: 'medium', durationSuggested: '0.4s–0.8s', tags: ['logo', 'hud'], phase: 'logo' }),
    fx({ id: 'cta-press-pulse', label: 'CTA Press Pulse', category: 'cta', description: 'CTA recebe pulso curto como se tivesse sido acionado.', intensity: 'medium', durationSuggested: '0.3s–0.6s', tags: ['cta'], phase: 'cta' }),
    fx({ id: 'holographic-glow', label: 'Holographic Glow', category: 'finish', description: 'Brilho azul com leve separação RGB em elementos específicos.', intensity: 'medium', durationSuggested: '0.5s–1.5s', tags: ['acabamento'], phase: 'transition', soloDuration: 1.4 }),
    fx({ id: 'blue-smoke', label: 'Blue Smoke', category: 'finish', description: 'Névoa azul discreta em áreas vazias do fundo.', intensity: 'medium', durationSuggested: '1.0s–3.0s', tags: ['acabamento'], phase: 'transition', soloDuration: 3.0, curated: 'approved' }),
    fx({ id: 'floating-code', label: 'Floating Code', category: 'finish', description: 'Micro linhas de código fictício desfocadas no fundo.', intensity: 'medium', durationSuggested: '2.0s–4.0s', tags: ['acabamento'], phase: 'transition', soloDuration: 3.5, featured: true }),
    fx({ id: 'edge-energy', label: 'Edge Energy', category: 'finish', description: 'Bordas ou cantos recebem energia azul breve.', intensity: 'medium', durationSuggested: '0.3s–0.7s', tags: ['acabamento'], phase: 'transition' }),
    fx({ id: 'ambient-flicker', label: 'Ambient Flicker', category: 'finish', description: 'Pequenas oscilações de luz em pontos de fundo.', intensity: 'medium', durationSuggested: '1.0s–2.0s', tags: ['acabamento'], phase: 'transition', soloDuration: 2.5, featured: true }),
    fx({ id: 'depth-shadow-shift', label: 'Depth Shadow Shift', category: 'finish', description: 'Sombras suaves mudam para aumentar profundidade.', intensity: 'medium', durationSuggested: '1.5s–3.0s', tags: ['acabamento'], phase: 'transition', soloDuration: 3.0, curated: 'approved' }),

    /* ── Impacto Social / CapCut-inspired (premium cyber) ── */
    fx({ id: 'vhs-signal-cut', label: 'VHS Signal Cut', category: 'social-impact', description: 'Interferência curta de sinal com separação RGB e deslocamento horizontal.', intensity: 'high', durationSuggested: '0.08s–0.18s', tags: ['glitch', 'impacto', 'abertura', 'transição'], phase: 'opening', soloDuration: 0.9 }),
    fx({ id: 'pixel-dissolve-reveal', label: 'Pixel Dissolve Reveal', category: 'social-impact', description: 'Elemento surge por blocos digitais que se dissolvem em revelação limpa.', intensity: 'high', durationSuggested: '0.4s–0.8s', tags: ['pixel', 'reveal', 'logo', 'headline'], phase: 'logo', soloDuration: 1.2 }),
    fx({ id: 'screen-shake-hit', label: 'Screen Shake Hit', category: 'social-impact', description: 'Micro tremor controlado no canvas ou palavra-chave com flash breve.', intensity: 'high', durationSuggested: '0.08s–0.18s', tags: ['shake', 'impacto', 'keyword'], phase: 'headline', soloDuration: 0.8 }),
    fx({ id: 'mosaic-slice-transition', label: 'Mosaic Slice Transition', category: 'social-impact', description: 'Revelação por faixas geométricas limpas — horizontal, vertical ou em blocos.', intensity: 'high', durationSuggested: '0.35s–0.7s', tags: ['slice', 'transição', 'abertura'], phase: 'opening', soloDuration: 1.1 }),
    fx({ id: 'paper-tear-tech', label: 'Paper Tear Tech', category: 'social-impact', description: 'Rasgo digital/geometrizado com fragmentos angulares e bordas azuis.', intensity: 'high', durationSuggested: '0.3s–0.6s', tags: ['tear', 'fragmento', 'headline'], phase: 'headline', soloDuration: 1.0 }),
    fx({ id: 'button-slide-unlock', label: 'Button Slide Unlock', category: 'social-impact', description: 'CTA desliza de trilha travada para posição final como acesso liberado.', intensity: 'high', durationSuggested: '0.4s–0.8s', tags: ['cta', 'unlock', 'slide'], phase: 'cta', soloDuration: 1.3 }),
    fx({ id: 'pulse-beat', label: 'Pulse Beat', category: 'social-impact', description: 'Pulso rápido com scale controlado, glow azul e anel expansivo.', intensity: 'medium', durationSuggested: '0.15s–0.35s', tags: ['pulse', 'cta', 'logo', 'malha'], phase: 'cta', soloDuration: 0.9 }),
    fx({ id: 'curved-text-orbit', label: 'Curved Text Orbit', category: 'social-impact', description: 'Texto HUD curto orbita parcialmente ao redor do elemento focal.', intensity: 'low', durationSuggested: '0.6s–1.2s', tags: ['hud', 'orbit', 'detalhe'], phase: 'mesh', soloDuration: 1.4 }),
    fx({ id: 'water-ripple-signal', label: 'Water Ripple Signal', category: 'social-impact', description: 'Onda circular translúcida expande a partir de nó, logo ou CTA.', intensity: 'medium', durationSuggested: '0.4s–0.9s', tags: ['ripple', 'sinal', 'malha'], phase: 'mesh', soloDuration: 1.2 }),
    fx({ id: 'flag-wave-data', label: 'Flag Wave Data', category: 'social-impact', description: 'Distorção suave em faixa luminosa como onda de dados — não bandeira literal.', intensity: 'medium', durationSuggested: '0.25s–0.5s', tags: ['onda', 'energia', 'transição'], phase: 'transition', soloDuration: 0.9 }),
    fx({ id: 'flip-panel-reveal', label: 'Flip Panel Reveal', category: 'social-impact', description: 'Painel técnico faz flip 3D rápido para revelar headline, CTA ou logo.', intensity: 'high', durationSuggested: '0.25s–0.5s', tags: ['flip', 'reveal', 'painel'], phase: 'headline', soloDuration: 1.0 }),
    fx({ id: 'static-interference', label: 'Static Interference', category: 'social-impact', description: 'Interferência curta de TV/dados com linhas, ruído e falha de sinal.', intensity: 'high', durationSuggested: '0.06s–0.15s', tags: ['glitch', 'static', 'impacto'], phase: 'opening', soloDuration: 0.7 }),

    /* ── Anime.js-inspired / SVG Motion ── */
    fx({ id: 'svg-line-draw', label: 'SVG Line Draw', category: 'svg-motion', description: 'Linhas SVG desenhadas progressivamente em stagger — malhas, HUD, circuitos e caminhos.', intensity: 'medium', durationSuggested: '0.6s–1.8s', tags: ['svg', 'stroke', 'malha', 'hud', 'circuito'], phase: 'mesh', soloDuration: 1.8 }),
    fx({ id: 'path-signal-runner', label: 'Path Signal Runner', category: 'svg-motion', description: 'Pulso luminoso que percorre caminhos SVG conectando nós, texto ou CTA.', intensity: 'high', durationSuggested: '0.6s–1.5s', tags: ['svg', 'motion-path', 'malha', 'sinal', 'cta'], phase: 'mesh', soloDuration: 1.4 }),
    fx({ id: 'mesh-morph', label: 'Mesh Morph', category: 'svg-motion', description: 'A malha SVG se reorganiza — nós mudam de posição revelando nova configuração.', intensity: 'high', durationSuggested: '0.8s–1.8s', tags: ['svg', 'morph', 'malha', 'transição'], phase: 'mesh', soloDuration: 1.8 }),
    fx({ id: 'grid-stagger-wave', label: 'Grid Stagger Wave', category: 'svg-motion', description: 'Grid de elementos acende em onda — L→R, centro para fora ou diagonal.', intensity: 'medium', durationSuggested: '0.5s–1.4s', tags: ['grid', 'stagger', 'abertura', 'fundo'], phase: 'opening', soloDuration: 1.5 }),
    fx({ id: 'node-field-pulse', label: 'Node Field Pulse', category: 'svg-motion', description: 'Conjunto de nós recebe pulsos em cadeia expansiva a partir de nó raiz.', intensity: 'medium', durationSuggested: '0.8s–2.0s', tags: ['svg', 'nós', 'malha', 'rede', 'pulse'], phase: 'mesh', soloDuration: 2.0 }),
    fx({ id: 'shape-morph-reveal', label: 'Shape Morph Reveal', category: 'svg-motion', description: 'Forma geométrica hexagonal se transforma em painel técnico revelando headline ou CTA.', intensity: 'high', durationSuggested: '0.5s–1.2s', tags: ['svg', 'morph', 'reveal', 'headline', 'cta'], phase: 'headline', soloDuration: 1.4 }),
    fx({ id: 'orbit-system', label: 'Orbit System', category: 'svg-motion', description: 'Arcos técnicos fazem órbita parcial ao redor de ponto focal com tracer luminoso.', intensity: 'medium', durationSuggested: '0.8s–2.2s', tags: ['svg', 'orbit', 'hud', 'ia', 'logo'], phase: 'mesh', soloDuration: 2.2 }),
    fx({ id: 'spring-pop', label: 'Spring Pop', category: 'svg-motion', description: 'Entrada elástica refinada em CTA, logo ou palavra — soft, medium ou punch.', intensity: 'medium', durationSuggested: '0.35s–0.8s', tags: ['spring', 'elastic', 'cta', 'logo', 'keyword'], phase: 'cta', soloDuration: 1.0 }),
    fx({ id: 'split-text-stagger', label: 'Split Text Stagger', category: 'svg-motion', description: 'Headline revelada em stagger por linha, palavra ou caractere — premium e técnico.', intensity: 'medium', durationSuggested: '0.7s–2.0s', tags: ['texto', 'stagger', 'headline', 'split'], phase: 'headline', soloDuration: 1.6 }),
    fx({ id: 'scan-draw', label: 'Scan Draw', category: 'svg-motion', description: 'Cursor técnico varre verticalmente ativando divider, subtítulo e CTA progressivamente.', intensity: 'medium', durationSuggested: '0.5s–1.5s', tags: ['scan', 'cursor', 'reveal', 'cta', 'hud'], phase: 'transition', soloDuration: 1.4 }),
  ];

  const COMBOS = [
    {
      id: 'premium-institucional',
      label: 'Premium Institucional',
      description: 'Abertura elegante, headline limpa e CTA institucional.',
      effects: { opening: 'light-sweep-reveal', text: 'mask-rise', mesh: 'mesh-city-map', logo: 'logo-wipe', cta: 'cta-access-unlock', transition: 'scan-beam' },
      duration: 8,
    },
    {
      id: 'evento-alto-impacto',
      label: 'Evento de Alto Impacto',
      description: 'Ruptura inicial, palavra de impacto e rede ativa.',
      effects: { opening: 'blackout-strike', text: 'impact-word', mesh: 'mesh-network-flow', logo: 'logo-wipe', cta: 'cta-signal-arrival', transition: 'scan-beam' },
      duration: 8.5,
    },
    {
      id: 'launch-protocol',
      label: 'Launch Protocol',
      description: 'Lançamento e inscrições — circuito, impacto e wipe energético.',
      effects: { opening: 'portal-reveal', text: 'impact-word', mesh: 'mesh-circuit-board', logo: 'logo-glow-reveal', cta: 'cta-energy-frame', transition: 'energy-wipe' },
      duration: 9,
    },
    {
      id: 'signal-executive',
      label: 'Executive Signal',
      description: 'Sofisticado e premium — portal, malha cidade e rota de sinal.',
      effects: { opening: 'portal-reveal', text: 'mask-rise', mesh: 'mesh-city-map', signal: 'signal-route', logo: 'logo-wipe', cta: 'cta-access-unlock', transition: 'energy-wipe' },
      duration: 8.5,
    },
    {
      id: 'signal-command',
      label: 'Signal Command',
      description: 'Central de comando cyber — blackout, scan, runner, split, HUD lock e spring CTA.',
      effects: {
        opening: 'blackout-strike',
        svgfx: 'scan-draw',
        mesh: 'path-signal-runner',
        text: 'split-text-stagger',
        logo: 'logo-hud-lock',
        cta: 'spring-pop',
      },
      duration: 9.5,
    },
  ];

  /* ── Depth, Blur, Focus & Lens Effects ── */
  const DEPTH_EFFECTS = [
    fx({ id: 'focus-pull', label: 'Focus Pull', category: 'depth-focus',
      description: 'Background inicia desfocado e ganha nitidez; foco migra de background → headline → CTA.',
      intensity: 'medium', durationSuggested: '0.6s–1.5s',
      bestFor: ['foto de pessoa', 'cidade', 'patrocinadores', 'peças institucionais'],
      tags: ['blur', 'focus', 'cinematic', 'depth', 'lens'],
      phase: 'opening', soloDuration: 1.8, implemented: true }),

    fx({ id: 'blur-resolve', label: 'Blur Resolve', category: 'depth-focus',
      description: 'Headline, logo ou subtítulo começa desfocado e ganha nitidez progressiva.',
      intensity: 'medium', durationSuggested: '0.35s–0.9s',
      bestFor: ['headline', 'logo', 'subtítulo', 'CTA', 'selos'],
      tags: ['blur', 'focus', 'reveal', 'text'],
      phase: 'headline', soloDuration: 1.1, implemented: true }),

    fx({ id: 'motion-blur-swipe', label: 'Motion Blur Swipe', category: 'depth-focus',
      description: 'Elemento entra lateralmente com blur de movimento; desacelera e fica nítido.',
      intensity: 'medium', durationSuggested: '0.3s–0.7s',
      bestFor: ['headline', 'logo', 'CTA', 'divisores'],
      tags: ['blur', 'motion', 'swipe', 'speed'],
      phase: 'headline', soloDuration: 0.8, implemented: true }),

    fx({ id: 'radial-focus-lock', label: 'Radial Focus Lock', category: 'depth-focus',
      description: 'Vinheta radial escurece as bordas mantendo o centro nítido — como câmera focando.',
      intensity: 'soft', durationSuggested: '0.5s–1.2s',
      bestFor: ['pessoa', 'logo', 'CTA', 'headline central'],
      tags: ['focus', 'depth', 'vignette', 'radial'],
      phase: 'mesh', soloDuration: 1.4, implemented: true }),

    fx({ id: 'blur-flash-hit', label: 'Blur Flash Hit', category: 'depth-focus',
      description: 'Flash breve + blur instantâneo do canvas; retorno rápido. Cria impacto sem glitch.',
      intensity: 'high', durationSuggested: '0.08s–0.18s',
      bestFor: ['impact frame', 'palavra-chave', 'CTA', 'abertura'],
      tags: ['blur', 'flash', 'impact', 'hit'],
      phase: 'headline', soloDuration: 0.5, implemented: true }),

    fx({ id: 'zoom-blur-punch', label: 'Zoom Blur Punch', category: 'depth-focus',
      description: 'Micro zoom com blur radial rápido; retorna ao estado final com nitidez.',
      intensity: 'high', durationSuggested: '0.15s–0.45s',
      bestFor: ['headline', 'palavra-chave', 'logo', 'CTA'],
      tags: ['zoom', 'blur', 'punch', 'impact', 'camera'],
      phase: 'opening', soloDuration: 0.6, implemented: true }),

    fx({ id: 'edge-softness', label: 'Edge Softness', category: 'depth-focus',
      description: 'Bordas superior e inferior recebem blur+vinheta suave. Centro permanece nítido.',
      intensity: 'soft', durationSuggested: 'contínua',
      bestFor: ['peças institucionais', 'foto de pessoa', 'headline central', 'CTA'],
      tags: ['blur', 'edges', 'depth', 'tilt', 'editorial'],
      phase: 'mesh', soloDuration: 1.0, implemented: true }),

    fx({ id: 'background-defocus-reveal', label: 'Background Defocus Reveal', category: 'depth-focus',
      description: 'Background inicia fortemente desfocado; ganha nitidez progressiva com brilho.',
      intensity: 'medium', durationSuggested: '0.5s–1.4s',
      bestFor: ['abertura', 'cidade', 'pessoa', 'palco', 'evento'],
      tags: ['blur', 'reveal', 'background', 'cinematic'],
      phase: 'opening', soloDuration: 1.5, implemented: true }),

    fx({ id: 'scan-focus-reveal', label: 'Scan Focus Reveal', category: 'depth-focus',
      description: 'Scanline percorre a composição; região atrás ganha nitidez à medida que passa.',
      intensity: 'medium', durationSuggested: '0.5s–1.5s',
      bestFor: ['logo', 'headline', 'CTA', 'imagem', 'malha'],
      tags: ['scan', 'focus', 'reveal', 'lens', 'cyber'],
      phase: 'opening', soloDuration: 1.4, implemented: true }),

    fx({ id: 'bokeh-pulse', label: 'Bokeh Pulse', category: 'depth-focus',
      description: 'Círculos de luz azul desfocados aparecem em profundidade — atmosfera premium.',
      intensity: 'soft', durationSuggested: '1s–3s',
      bestFor: ['fundo abstrato', 'cidade noturna', 'evento premium', 'abertura leve'],
      tags: ['bokeh', 'blur', 'depth', 'light', 'ambient'],
      phase: 'mesh', soloDuration: 2.5, implemented: true }),

    fx({ id: 'glass-blur-panel', label: 'Glass Blur Panel', category: 'depth-focus',
      description: 'Painel translúcido com backdrop blur revela CTA ou subtítulo com elegância.',
      intensity: 'soft', durationSuggested: '0.3s–0.8s',
      bestFor: ['CTA', 'subtítulo', 'dados', 'logos', 'selos'],
      tags: ['glass', 'blur', 'backdrop', 'panel', 'frosted'],
      phase: 'cta', soloDuration: 1.2, implemented: true }),

    fx({ id: 'signal-stabilize', label: 'Signal Stabilize', category: 'depth-focus',
      description: 'Canvas começa instável (blur + vibração); estabiliza com precisão — sensação cyber/SOC.',
      intensity: 'medium', durationSuggested: '0.35s–1.1s',
      bestFor: ['cyber', 'SOC', 'IA', 'conteúdo técnico', 'abertura de campanha'],
      tags: ['blur', 'shake', 'stabilize', 'cyber', 'signal'],
      phase: 'opening', soloDuration: 1.0, implemented: true }),

    fx({ id: 'chromatic-focus-shift', label: 'Chromatic Focus Shift', category: 'depth-focus',
      description: 'Separação RGB sutil durante transição; canais convergem para imagem nítida.',
      intensity: 'soft', durationSuggested: '0.08s–0.25s',
      bestFor: ['abertura', 'logo', 'palavra-chave', 'transição de impacto'],
      tags: ['chromatic', 'rgb', 'focus', 'lens', 'aberration'],
      phase: 'headline', soloDuration: 0.5, implemented: true }),

    fx({ id: 'focus-breath', label: 'Focus Breath', category: 'depth-focus',
      description: 'Pulso mínimo de foco em logo e CTA — sensação de respiração visual.',
      intensity: 'soft', durationSuggested: '0.5s–1.2s',
      bestFor: ['logo', 'CTA', 'palavra-chave', 'nó de malha'],
      tags: ['focus', 'pulse', 'breath', 'subtle', 'ambient'],
      phase: 'cta', soloDuration: 1.0, implemented: true }),

    fx({ id: 'camera-dolly-in', label: 'Camera Dolly In', category: 'depth-focus',
      description: 'Zoom progressivo suave simulando câmera avançando — profundidade cinematográfica.',
      intensity: 'medium', durationSuggested: '1.5s–5s',
      bestFor: ['cidade', 'palco', 'pessoa', 'campanhas de impacto'],
      tags: ['camera', 'dolly', 'zoom', 'cinematic', 'depth'],
      phase: 'opening', soloDuration: 3.0, implemented: true }),

    fx({ id: 'camera-dolly-out', label: 'Camera Dolly Out', category: 'depth-focus',
      description: 'Começa mais fechado e abre revelando headline ou ambiente — clássico de cinema.',
      intensity: 'medium', durationSuggested: '1s–3s',
      bestFor: ['revelação de evento', 'cidade', 'anúncio de agenda'],
      tags: ['camera', 'dolly', 'zoom', 'cinematic', 'reveal'],
      phase: 'opening', soloDuration: 2.5, implemented: true }),

    fx({ id: 'tilt-shift-depth', label: 'Tilt-Shift Depth', category: 'depth-focus',
      description: 'Blur nas bordas superior e inferior; faixa central nítida. Editorial e premium.',
      intensity: 'soft', durationSuggested: '0.5s–1s contínua',
      bestFor: ['skyline', 'palco', 'foto ampla', 'evento urbano'],
      tags: ['tilt', 'shift', 'blur', 'depth', 'editorial', 'cinematic'],
      phase: 'mesh', soloDuration: 1.5, implemented: true }),

    fx({ id: 'mask-blur-reveal', label: 'Mask Blur Reveal', category: 'depth-focus',
      description: 'Logo ou headline revelado por máscara com blur — as regiões ocultas ganham foco ao aparecer.',
      intensity: 'medium', durationSuggested: '0.4s–1.2s',
      bestFor: ['texto', 'logo', 'CTA', 'painel técnico'],
      tags: ['mask', 'blur', 'reveal', 'wipe'],
      phase: 'logo', soloDuration: 1.2, implemented: true }),

    fx({ id: 'frosted-glass-wipe', label: 'Frosted Glass Wipe', category: 'depth-focus',
      description: 'Faixa de vidro fosco traversa horizontalmente revelando ou transformando a camada.',
      intensity: 'soft', durationSuggested: '0.4s–1s',
      bestFor: ['transição premium', 'CTA', 'logo', 'subtítulo'],
      tags: ['glass', 'frosted', 'wipe', 'blur', 'backdrop', 'transition'],
      phase: 'cta', soloDuration: 1.0, implemented: true }),

    fx({ id: 'focus-snap', label: 'Focus Snap', category: 'depth-focus',
      description: 'CTA ou logo muda de blur para nítido em poucos frames — sensação de lock de sistema.',
      intensity: 'high', durationSuggested: '0.12s–0.3s',
      bestFor: ['CTA', 'palavra-chave', 'logo', 'nó de malha'],
      tags: ['snap', 'focus', 'lock', 'fast', 'cyber'],
      phase: 'cta', soloDuration: 0.6, implemented: true }),

    fx({ id: 'depth-fog-roll', label: 'Depth Fog Roll', category: 'depth-focus',
      description: 'Névoa azul desfocada cruza lentamente — reforça profundidade sem distrair.',
      intensity: 'soft', durationSuggested: '1s–4s',
      bestFor: ['cidade', 'palco', 'visual premium', 'eventos noturnos'],
      tags: ['fog', 'blur', 'depth', 'ambient', 'atmospheric'],
      phase: 'mesh', soloDuration: 3.0, implemented: true }),

    fx({ id: 'lens-flare-focus', label: 'Lens Flare Focus', category: 'depth-focus',
      description: 'Flare de lente controlado aponta para logo ou CTA e desaparece — sem exagero.',
      intensity: 'soft', durationSuggested: '0.25s–0.8s',
      bestFor: ['abertura', 'CTA', 'logo', 'impacto final'],
      tags: ['flare', 'lens', 'light', 'focus', 'reveal'],
      phase: 'logo', soloDuration: 0.9, implemented: true }),

    fx({ id: 'aperture-open', label: 'Aperture Open', category: 'depth-focus',
      description: 'Forma hexagonal de lente se abre revelando o conteúdo — abertura de câmera.',
      intensity: 'medium', durationSuggested: '0.4s–1.2s',
      bestFor: ['abertura', 'CTA', 'logo', 'apresentação de palestrante'],
      tags: ['aperture', 'lens', 'reveal', 'geometric', 'camera'],
      phase: 'opening', soloDuration: 1.2, implemented: true }),

    fx({ id: 'headline-focus-stack', label: 'Headline Focus Stack', category: 'depth-focus',
      description: 'Cada linha da headline recebe foco em sequência — linhas futuras têm leve blur.',
      intensity: 'medium', durationSuggested: '1s–2.5s',
      bestFor: ['headlines longas', 'campanhas narrativas', 'frases em blocos'],
      tags: ['headline', 'focus', 'stack', 'sequence', 'text'],
      phase: 'headline', soloDuration: 1.8, implemented: true }),

    fx({ id: 'cta-focus-lock', label: 'CTA Focus Lock', category: 'depth-focus',
      description: 'Foco converge no CTA — elementos secundários ficam levemente desfocados.',
      intensity: 'medium', durationSuggested: '0.4s–1s',
      bestFor: ['inscrição', 'compra', 'cadastro', 'call-to-action'],
      tags: ['cta', 'focus', 'lock', 'depth'],
      phase: 'cta', soloDuration: 1.2, implemented: true }),

    fx({ id: 'logo-lens-reveal', label: 'Logo Lens Reveal', category: 'depth-focus',
      description: 'Logo começa levemente desfocado e ganha foco com brilho e scan opcional.',
      intensity: 'soft', durationSuggested: '0.4s–1s',
      bestFor: ['abertura premium', 'patrocinador', 'evento', 'marca parceira'],
      tags: ['logo', 'lens', 'reveal', 'focus', 'glow'],
      phase: 'logo', soloDuration: 1.0, implemented: true }),

    fx({ id: 'micro-defocus-shock', label: 'Micro Defocus Shock', category: 'depth-focus',
      description: 'Blur mínimo (1–3px) no canvas por < 0.2s com flash — impacto sem exagero.',
      intensity: 'high', durationSuggested: '0.08s–0.18s',
      bestFor: ['impact frame', 'headline', 'CTA', 'palavra-chave'],
      tags: ['blur', 'shock', 'impact', 'micro', 'flash'],
      phase: 'headline', soloDuration: 0.4, implemented: true }),

    fx({ id: 'optic-scan-focus', label: 'Optic Scan Focus', category: 'depth-focus',
      description: 'Scanline técnica azul percorre a composição; brackets aparecem e elementos ganham foco.',
      intensity: 'medium', durationSuggested: '0.6s–1.8s',
      bestFor: ['cyber', 'SOC', 'inteligência', 'produto técnico'],
      tags: ['scan', 'focus', 'brackets', 'cyber', 'optical'],
      phase: 'opening', soloDuration: 1.5, implemented: true }),

    fx({ id: 'soft-focus-glow', label: 'Soft Focus Glow', category: 'depth-focus',
      description: 'Logo ou CTA entra com glow azul suave, ganha nitidez e mantém destaque leve.',
      intensity: 'soft', durationSuggested: '0.4s–1.1s',
      bestFor: ['logo', 'CTA', 'palavra azul', 'nó principal'],
      tags: ['glow', 'focus', 'soft', 'blue', 'premium'],
      phase: 'logo', soloDuration: 1.0, implemented: true }),

    fx({ id: 'whip-pan-blur', label: 'Whip Pan Blur', category: 'depth-focus',
      description: 'Canvas "vira" rapidamente com blur direcional — transição agressiva entre fases.',
      intensity: 'high', durationSuggested: '0.15s–0.35s',
      bestFor: ['campanhas agressivas', 'anúncios', 'mudança de bloco visual'],
      tags: ['whip', 'pan', 'blur', 'speed', 'transition', 'camera'],
      phase: 'transition', soloDuration: 0.7, implemented: true }),
  ];

  EFFECTS.push(...DEPTH_EFFECTS);


  /* ── Animated Meshes, Patterns & Depth ── */
  const AMD_EFFECTS = [
    /* 20 malhas principais */
    fx({ id: 'constellation-field-depth', label: 'Constellation Field Depth', category: 'animated-mesh-depth',
      description: 'Rede de pontos e linhas finas como constelação de dados. Nós surgem em stagger, linhas desenhadas progressivamente, sinais percorrem conexões.',
      intensity: 'medium', durationSuggested: '1.5s–3s',
      bestFor: ['networking', 'ecossistema', 'comunidade', 'eventos'],
      tags: ['constellation', 'network', 'nodes', 'depth', 'parallax'],
      phase: 'mesh', soloDuration: 2.5, implemented: true }),

    fx({ id: 'neural-network-flow-depth', label: 'Neural Network Flow Depth', category: 'animated-mesh-depth',
      description: 'Rede orgânica curvada com paths animados, sinais percorrendo nós, glow azul e profundidade de câmera.',
      intensity: 'high', durationSuggested: '1.5s–3s',
      bestFor: ['IA', 'automação', 'dados', 'inovação'],
      tags: ['neural', 'network', 'flow', 'ai', 'organic', 'depth'],
      phase: 'mesh', soloDuration: 3.0, implemented: true }),

    fx({ id: 'command-grid-depth', label: 'Command Grid Depth', category: 'animated-mesh-depth',
      description: 'Grid técnico com quadrantes, highlights, HUD corners e foco no centro — atmosfera de central de comando.',
      intensity: 'medium', durationSuggested: '0.8s–2s',
      bestFor: ['SOC', 'observabilidade', 'infraestrutura', 'cyber'],
      tags: ['grid', 'command', 'hud', 'technical', 'cyber'],
      phase: 'mesh', soloDuration: 2.0, implemented: true }),

    fx({ id: 'laser-grid-perspective-depth', label: 'Laser Grid Perspective', category: 'animated-mesh-depth',
      description: 'Grid em perspectiva com linhas convergindo para ponto de fuga, push-in de câmera e sinal cruzando a superfície.',
      intensity: 'high', durationSuggested: '1s–3s',
      bestFor: ['lançamento', 'keynote', 'campanha de impacto', 'premium futurista'],
      tags: ['laser', 'grid', 'perspective', 'depth', 'camera'],
      phase: 'mesh', soloDuration: 2.5, implemented: true }),

    fx({ id: 'circuit-board-map-depth', label: 'Circuit Board Map Depth', category: 'animated-mesh-depth',
      description: 'Trilhas de circuito desenhadas em sequência, sinais correndo pelos caminhos, nós acendendo à passagem do sinal.',
      intensity: 'medium', durationSuggested: '1s–2.5s',
      bestFor: ['infraestrutura', 'engenharia', 'tecnologia', 'security'],
      tags: ['circuit', 'board', 'signal', 'technical', 'cyber'],
      phase: 'mesh', soloDuration: 2.2, implemented: true }),

    fx({ id: 'hex-shield-field-depth', label: 'Hex Shield Field Depth', category: 'animated-mesh-depth',
      description: 'Campo de hexágonos como escudo digital. Entram em blocos, onda de energia atravessa, alguns brilham seletivamente.',
      intensity: 'high', durationSuggested: '1s–2.5s',
      bestFor: ['proteção', 'firewall', 'segurança', 'compliance'],
      tags: ['hex', 'shield', 'protection', 'security', 'pattern'],
      phase: 'mesh', soloDuration: 2.5, implemented: true }),

    fx({ id: 'radar-sweep-field-depth', label: 'Radar Sweep Field Depth', category: 'animated-mesh-depth',
      description: 'Radar com sweep rotativo, rings expandindo, pontos detectados com ping. Blur periférico e foco central.',
      intensity: 'medium', durationSuggested: '1.5s–3.5s',
      bestFor: ['threat intelligence', 'SOC', 'monitoramento', 'incident response'],
      tags: ['radar', 'sweep', 'detection', 'monitoring', 'cyber'],
      phase: 'mesh', soloDuration: 3.0, implemented: true }),

    fx({ id: 'topographic-lines-depth', label: 'Topographic Lines Depth', category: 'animated-mesh-depth',
      description: 'Linhas topográficas onduladas desenhadas em sequência com leve drift horizontal — território, cobertura e estratégia.',
      intensity: 'soft', durationSuggested: '1s–3s',
      bestFor: ['cidade', 'comunidade', 'evento regional', 'estratégia'],
      tags: ['topographic', 'lines', 'abstract', 'premium', 'editorial'],
      phase: 'mesh', soloDuration: 2.5, implemented: true }),

    fx({ id: 'data-rain-columns-depth', label: 'Data Rain Columns Depth', category: 'animated-mesh-depth',
      description: 'Colunas de microdados e barras caindo com brilho seletivo e profundidade entre colunas. Sem aparência Matrix.',
      intensity: 'medium', durationSuggested: '1s–2.5s',
      bestFor: ['logs', 'observabilidade', 'dados', 'operações'],
      tags: ['data', 'rain', 'columns', 'technical', 'operational'],
      phase: 'mesh', soloDuration: 2.2, implemented: true }),

    fx({ id: 'wave-particle-field-depth', label: 'Wave Particle Field Depth', category: 'animated-mesh-depth',
      description: 'Campo de partículas organizadas em onda. Dispersão e recomposição com profundidade por parallax.',
      intensity: 'soft', durationSuggested: '1.5s–3s',
      bestFor: ['inovação', 'comunidade', 'IA', 'abertura premium'],
      tags: ['wave', 'particles', 'field', 'flow', 'ambient'],
      phase: 'mesh', soloDuration: 2.8, implemented: true }),

    fx({ id: 'city-link-map-depth', label: 'City Link Map Depth', category: 'animated-mesh-depth',
      description: 'Malha conectada ao skyline com hotspots como prédios/áreas. Sinais percorrem conexões com parallax entre cidade, malha e headline.',
      intensity: 'medium', durationSuggested: '1.5s–3s',
      bestFor: ['eventos presenciais', 'cidades', 'roadshows', 'networking'],
      tags: ['city', 'map', 'network', 'signal', 'location', 'depth'],
      phase: 'mesh', soloDuration: 2.8, implemented: true }),

    fx({ id: 'polygon-fracture-depth', label: 'Polygon Fracture Depth', category: 'animated-mesh-depth',
      description: 'Triângulos montando em blocos, pulso de ativação, sensação de construção e ruptura — impacto geométrico.',
      intensity: 'high', durationSuggested: '0.8s–2s',
      bestFor: ['campanhas agressivas', 'lançamento', 'defesa', 'anúncio importante'],
      tags: ['polygon', 'fracture', 'geometric', 'impact', 'assembly'],
      phase: 'mesh', soloDuration: 1.8, implemented: true }),

    fx({ id: 'orbital-hud-system-depth', label: 'Orbital HUD System Depth', category: 'animated-mesh-depth',
      description: 'Arcos e órbitas parciais com traços de luz, dados HUD, blur em camadas externas e foco no nó central.',
      intensity: 'medium', durationSuggested: '1s–3s',
      bestFor: ['keynote', 'IA', 'liderança', 'inovação'],
      tags: ['orbital', 'hud', 'arcs', 'focus', 'premium'],
      phase: 'mesh', soloDuration: 2.5, implemented: true }),

    fx({ id: 'firewall-wall-depth', label: 'Firewall Wall Depth', category: 'animated-mesh-depth',
      description: 'Parede de blocos montando a barreira digital. Sinal tenta atravessar e é bloqueado — pulso defensivo com glow.',
      intensity: 'high', durationSuggested: '1s–2.5s',
      bestFor: ['cyber defense', 'firewall', 'proteção', 'segurança'],
      tags: ['firewall', 'wall', 'defense', 'blocks', 'protection'],
      phase: 'mesh', soloDuration: 2.2, implemented: true }),

    fx({ id: 'digital-fabric-depth', label: 'Digital Fabric Depth', category: 'animated-mesh-depth',
      description: 'Tecido digital de linhas diagonais entrelaçadas com drift sutil e pontos de interseção brilhando. Estética refinada.',
      intensity: 'soft', durationSuggested: '1.5s–4s',
      bestFor: ['institucional', 'executivo', 'ecossistema', 'patrocinadores'],
      tags: ['fabric', 'threads', 'elegant', 'premium', 'corporate'],
      phase: 'mesh', soloDuration: 3.0, implemented: true }),

    fx({ id: 'mesh-ripple-reactive', label: 'Mesh Ripple Reactive', category: 'animated-mesh-depth',
      description: 'Grid sofre deformação por ondas expansivas de ripple. Tecnológico, não líquido.',
      intensity: 'high', durationSuggested: '0.8s–2s',
      bestFor: ['impacto', 'ativação de sinal', 'CTA', 'abertura'],
      tags: ['ripple', 'mesh', 'grid', 'wave', 'reactive'],
      phase: 'mesh', soloDuration: 2.0, implemented: true }),

    fx({ id: 'signal-route-depth', label: 'Signal Route Depth', category: 'animated-mesh-depth',
      description: 'Luz azul percorre trilhas ortogonais até o CTA com ramificações. Foco final no destino.',
      intensity: 'medium', durationSuggested: '1s–2.5s',
      bestFor: ['CTA', 'jornada visual', 'rede', 'inscrição'],
      tags: ['signal', 'route', 'path', 'cta', 'journey'],
      phase: 'signal', soloDuration: 2.0, implemented: true }),

    fx({ id: 'node-chain-reaction-depth', label: 'Node Chain Reaction Depth', category: 'animated-mesh-depth',
      description: 'Nós ativando outros em cadeia com timing elegante. Propagação de influência com blur suave.',
      intensity: 'medium', durationSuggested: '1s–2.5s',
      bestFor: ['ecossistema', 'comunidade', 'rede', 'IA'],
      tags: ['nodes', 'chain', 'reaction', 'propagation', 'network'],
      phase: 'mesh', soloDuration: 2.5, implemented: true }),

    fx({ id: 'depth-fabric-parallax', label: 'Depth Fabric Parallax', category: 'animated-mesh-depth',
      description: 'Três camadas de pattern em profundidade se movendo em velocidades diferentes. Base contínua premium.',
      intensity: 'soft', durationSuggested: 'contínua',
      bestFor: ['praticamente qualquer post premium', 'textura sofisticada de fundo'],
      tags: ['depth', 'parallax', 'layers', 'fabric', 'ambient'],
      phase: 'mesh', soloDuration: 3.0, implemented: true }),

    fx({ id: 'hud-corners-pattern-depth', label: 'HUD Corners Pattern Depth', category: 'animated-mesh-depth',
      description: 'Cantos HUD com brackets, micro linhas e marcações técnicas em stagger. Complementa outras malhas sem competir.',
      intensity: 'soft', durationSuggested: '0.5s–1.5s',
      bestFor: ['reforço técnico', 'slides', 'posts cyber', 'CTA lock'],
      tags: ['hud', 'corners', 'brackets', 'technical', 'overlay'],
      phase: 'mesh', soloDuration: 1.2, implemented: true }),

    /* 10 enhancers */
    fx({ id: 'mesh-focus-pull', label: 'Mesh Focus Pull', category: 'animated-mesh-depth',
      description: 'Enhancer: malha começa desfocada e entra em foco junto com o conteúdo.',
      intensity: 'soft', durationSuggested: '0.6s–1.2s',
      bestFor: ['qualquer malha principal', 'abertura premium'],
      tags: ['enhancer', 'focus', 'blur', 'reveal'],
      phase: 'mesh', soloDuration: 1.2, implemented: true }),

    fx({ id: 'mesh-blur-resolve', label: 'Mesh Blur Resolve', category: 'animated-mesh-depth',
      description: 'Enhancer: linhas e nós da malha começam com blur e resolvem para nitidez.',
      intensity: 'soft', durationSuggested: '0.5s–1s',
      bestFor: ['qualquer malha principal'],
      tags: ['enhancer', 'blur', 'resolve', 'mesh'],
      phase: 'mesh', soloDuration: 1.0, implemented: true }),

    fx({ id: 'mesh-depth-parallax', label: 'Mesh Depth Parallax', category: 'animated-mesh-depth',
      description: 'Enhancer: camadas da malha com velocidades de movimento diferentes — profundidade real.',
      intensity: 'soft', durationSuggested: '2s–5s',
      bestFor: ['qualquer malha layered', 'profundidade narrativa'],
      tags: ['enhancer', 'parallax', 'depth', 'layers'],
      phase: 'mesh', soloDuration: 3.0, implemented: true }),

    fx({ id: 'mesh-soft-glow', label: 'Mesh Soft Glow', category: 'animated-mesh-depth',
      description: 'Enhancer: glow azul discreto nos nós e logo ativos.',
      intensity: 'soft', durationSuggested: '0.4s–1.5s',
      bestFor: ['qualquer malha com nós', 'logo'],
      tags: ['enhancer', 'glow', 'blue', 'nodes'],
      phase: 'mesh', soloDuration: 1.5, implemented: true }),

    fx({ id: 'mesh-scan-activation', label: 'Mesh Scan Activation', category: 'animated-mesh-depth',
      description: 'Enhancer: scanline ativa segmentos da malha enquanto percorre a composição.',
      intensity: 'medium', durationSuggested: '0.6s–1.2s',
      bestFor: ['qualquer malha técnica', 'cyber, SOC'],
      tags: ['enhancer', 'scan', 'activation', 'cyber'],
      phase: 'mesh', soloDuration: 1.2, implemented: true }),

    fx({ id: 'mesh-bokeh-back', label: 'Mesh Bokeh Back', category: 'animated-mesh-depth',
      description: 'Enhancer: pequenos círculos desfocados de luz azul atrás da malha — profundidade atmosférica.',
      intensity: 'soft', durationSuggested: '1s–3s',
      bestFor: ['background abstrato', 'eventos premium'],
      tags: ['enhancer', 'bokeh', 'depth', 'ambient'],
      phase: 'mesh', soloDuration: 2.0, implemented: true }),

    fx({ id: 'mesh-edge-softness', label: 'Mesh Edge Softness', category: 'animated-mesh-depth',
      description: 'Enhancer: blur suave nas bordas do pattern para valorizar o centro.',
      intensity: 'soft', durationSuggested: '0.4s–1s',
      bestFor: ['qualquer malha', 'foto de pessoa'],
      tags: ['enhancer', 'edges', 'blur', 'soft'],
      phase: 'mesh', soloDuration: 1.0, implemented: true }),

    fx({ id: 'mesh-camera-dolly', label: 'Mesh Camera Dolly', category: 'animated-mesh-depth',
      description: 'Enhancer: movimento de câmera sutil no sistema de malhas — zoom progressivo.',
      intensity: 'soft', durationSuggested: '2s–5s',
      bestFor: ['qualquer malha', 'abertura premium'],
      tags: ['enhancer', 'camera', 'dolly', 'zoom', 'cinematic'],
      phase: 'mesh', soloDuration: 2.5, implemented: true }),

    fx({ id: 'mesh-rack-focus', label: 'Mesh Rack Focus', category: 'animated-mesh-depth',
      description: 'Enhancer: troca de foco entre background, malha, headline e CTA.',
      intensity: 'medium', durationSuggested: '1s–2.5s',
      bestFor: ['peças com muitas camadas', 'narrativas visuais'],
      tags: ['enhancer', 'rack', 'focus', 'depth', 'cinematic'],
      phase: 'mesh', soloDuration: 2.0, implemented: true }),

    fx({ id: 'mesh-pulse-wave', label: 'Mesh Pulse Wave', category: 'animated-mesh-depth',
      description: 'Enhancer: onda de pulso que percorre a estrutura da malha ativa.',
      intensity: 'medium', durationSuggested: '0.8s–2s',
      bestFor: ['qualquer malha com grid', 'impacto'],
      tags: ['enhancer', 'pulse', 'wave', 'ripple', 'energy'],
      phase: 'mesh', soloDuration: 1.8, implemented: true }),
  ];

  EFFECTS.push(...AMD_EFFECTS);

  /* ── Animated Mesh Combos (7) ── */
  COMBOS.push(
    {
      id: 'connected-city-premium',
      label: 'Connected City Premium',
      description: 'Evento presencial premium — city link, parallax, signal route e CTA sinal.',
      effects: {
        opening: 'blackout-strike',
        mesh: 'city-link-map-depth',
        depth: 'mesh-depth-parallax',
        text: 'mask-rise',
        signal: 'signal-route-depth',
        logo: 'logo-wipe',
        cta: 'cta-signal-arrival',
      },
      duration: 11,
    },
    {
      id: 'constellation-community',
      label: 'Constellation Community',
      description: 'Comunidade e ecossistema — constellation, soft glow, node chain e CTA pulse.',
      effects: {
        opening: 'portal-reveal',
        mesh: 'constellation-field-depth',
        depth: 'mesh-soft-glow',
        text: 'mask-rise',
        signal: 'node-chain-reaction-depth',
        logo: 'logo-wipe',
        cta: 'cta-press-pulse',
      },
      duration: 10.5,
    },
  );

  /* ── Combo aprovado: Poder Executivo ── */
  COMBOS.push(
    {
      id: 'poder-executivo',
      label: 'Poder Executivo',
      description: 'Blackout de abertura, malha neural, headline de impacto e CTA de pressão.',
      effects: {
        opening: 'blackout-strike', background: 'photo-depth-tilt',
        logo: 'logo-hud-lock', mesh: 'mesh-neural-flow', signal: 'signal-intercept',
        text: 'headline-lock-on', keyword: 'keyword-stamp',
        cta: 'cta-press-pulse', transition: 'scan-beam', finish: 'depth-shadow-shift',
      },
      duration: 9,
    },
  );

  /* Efeitos retirados do catálogo — filtro de segurança (cache / localStorage legado) */
  const REMOVED_EFFECT_IDS = new Set([
    'headline-echo', 'mesh-radar-field', 'mesh-firewall-wall', 'signal-strobe',
    'logo-light-trace', 'logo-scan-entry', 'cta-target-lock', 'cta-glass-sweep',
    'cta-breach-open', 'pixel-break', 'focus-flare', 'logo-pixel-resolve', 'screen-slice',
  ]);

  const CATALOG_VERSION = '20260625j';

  const ACTIVE_EFFECTS = EFFECTS.filter((e, i, arr) => {
    if (REMOVED_EFFECT_IDS.has(e.id)) return false;
    return arr.findIndex((x) => x.id === e.id) === i;
  });

  /* CURATED_APPROVALS vazio — aprovações gerenciadas exclusivamente pelo usuário via UI.
     Os combos funcionam independente do estado de aprovação dos efeitos individuais. */
  const CURATED_APPROVALS = {};

  const STORAGE_KEY = 'cybersecfest-effects-approvals-v2';
  const LEGACY_STORAGE_KEYS = ['cybersecfest-effects-approvals'];

  global.EffectsCatalog = {
    CATEGORIES,
    EFFECTS: ACTIVE_EFFECTS,
    COMBOS,
    STORAGE_KEY,
    LEGACY_STORAGE_KEYS,
    CURATED_APPROVALS,
    CATALOG_VERSION,
    REMOVED_EFFECT_IDS,
    byId(id) {
      if (REMOVED_EFFECT_IDS.has(id)) return null;
      return ACTIVE_EFFECTS.find((e) => e.id === id) || null;
    },
    byCategory(cat) {
      return ACTIVE_EFFECTS.filter((e) => e.category === cat);
    },
    implemented() {
      return ACTIVE_EFFECTS.filter((e) => e.implemented);
    },
  };
})(typeof window !== 'undefined' ? window : global);
