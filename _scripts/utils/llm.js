// LLM helpers — OpenAI (texto) + Gemini Nano Banana (imagens)
'use strict';

const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const { getReferencePartsForGeneration, STYLE_REF_INSTRUCTION } = require('./reference-images.js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_CREAO });
const genai  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_CREAO);
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_CREAO });

const NANO_BANANA_MODELS = [
  'gemini-2.5-flash-image',      // Nano Banana — rápido, custo baixo
  'gemini-3.1-flash-image',      // Nano Banana 2 — qualidade superior
];

const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// ── Text generation — GPT-4o primário, Gemini fallback ────────────
async function generateText(prompt, systemPrompt = '', temperature = 0.85) {
  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });
    const res = await openai.chat.completions.create({ model: 'gpt-4o', messages, temperature });
    return res.choices[0].message.content.trim();
  } catch (e) {
    console.warn('⚠️  OpenAI text falhou → Gemini Flash:', e.message);
    const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const full  = systemPrompt ? systemPrompt + '\n\n' + prompt : prompt;
    const res   = await model.generateContent(full);
    return res.response.text().trim();
  }
}

function extractImageBuffer(response) {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    const data = part.inlineData?.data || part.inline_data?.data;
    if (data) return Buffer.from(data, 'base64');
  }
  return null;
}

// ── Imagem via Gemini Nano Banana (SDK @google/genai) ─────────────
async function generateImageNanoBanana(prompt, { referenceParts = [] } = {}) {
  let lastError = null;

  const parts = [
    ...referenceParts,
    { text: referenceParts.length ? `${STYLE_REF_INSTRUCTION}\n\n${prompt}` : prompt },
  ];

  const contents = referenceParts.length
    ? [{ role: 'user', parts }]
    : prompt;

  for (const model of NANO_BANANA_MODELS) {
    try {
      const response = await gemini.models.generateContent({
        model,
        contents,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          responseFormat: {
            image: { aspectRatio: '3:4' },
          },
        },
      });

      const buffer = extractImageBuffer(response);
      if (buffer?.length > 100) {
        const refNote = referenceParts.length ? ` + ${referenceParts.length} ref(s)` : '';
        console.log(`🖼️  Imagem gerada via ${model}${refNote}`);
        return buffer;
      }
      throw new Error('resposta sem inlineData de imagem');
    } catch (e) {
      lastError = e;
      console.warn(`⚠️  ${model} falhou:`, e.message);
    }
  }

  throw lastError || new Error('Nano Banana indisponível');
}

// ── Fallback: DALL-E 3 (baixa URL, sem response_format) ───────────
async function generateImageDalle(prompt) {
  const res = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1792',
  });

  const url = res.data?.[0]?.url;
  if (!url) throw new Error('DALL-E 3 sem URL');

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`download DALL-E: ${imgRes.status}`);

  console.log('🖼️  Imagem gerada via DALL-E 3 (fallback)');
  return Buffer.from(await imgRes.arrayBuffer());
}

// ── Image generation — Nano Banana primário, DALL-E 3 fallback ──────
async function generateImage(prompt, { tipo, layout, useReferences = true } = {}) {
  let referenceParts = [];
  let refPaths = [];

  if (useReferences) {
    const refs = getReferencePartsForGeneration({ tipo, layout, max: 3 });
    referenceParts = refs.parts;
    refPaths = refs.paths;
    if (refPaths.length) {
      console.log(`   📎 Style refs: ${refPaths.map(p => path.basename(p)).join(', ')}`);
    }
  }

  try {
    return await generateImageNanoBanana(prompt, { referenceParts });
  } catch (e) {
    console.warn('⚠️  Nano Banana falhou → DALL-E 3:', e.message);
  }

  try {
    return await generateImageDalle(prompt);
  } catch (e) {
    console.error('❌ Todos os geradores de imagem falharam:', e.message);
    return TRANSPARENT_PNG;
  }
}

module.exports = { generateText, generateImage };
