'use strict';

/**
 * Checklist pós-geração para validar se fundo.png segue o Design System.
 * Uso humano/agente: node -e "require('./utils/validate-image-style').printChecklist()"
 * Futuro: integrar visão (LLM multimodal) para auto-rejeição.
 */

const { REFERENCE_ARTES, CYBER_BLUE_STYLE } = require('./imagem-prompt.js');

const CHECKLIST = [
  { id: 'blue_accent',   label: 'Luz azul ciano #14A8F4 visível NA FOTOGRAFIA (rim, backlight, city glow, LED)' },
  { id: 'cool_grade',    label: 'Grading frio/cool — não dominado por âmbar/dourado' },
  { id: 'executive',     label: 'Sujeito executivo OU metáfora cyber-corporativa (não decor vazio)' },
  { id: 'not_generic',   label: 'NÃO é arquitetura genérica / luminária / sala vazia' },
  { id: 'clear_zones',   label: 'Zonas livres do layout respeitadas (texto não sobre rosto)' },
  { id: 'no_text',       label: 'Zero texto/logos baked na imagem' },
  { id: 'overlay_safe',  label: 'Exposição suficiente — overlay HTML não apaga detalhes' },
];

function printChecklist() {
  console.log('═══ CHECKLIST DESIGN SYSTEM — FUNDO IA ═══\n');
  console.log('Referências ouro:', REFERENCE_ARTES.join(', '));
  console.log('');
  CHECKLIST.forEach((c, i) => console.log(`  ${i + 1}. [ ] ${c.label}`));
  console.log('\n── Lei do Azul (prompt) ──');
  CYBER_BLUE_STYLE.forEach(l => console.log(l));
  console.log('\nSe qualquer item falhar → regenerar: node regenerar-fundo.js <slug>');
}

module.exports = { CHECKLIST, REFERENCE_ARTES, printChecklist };
