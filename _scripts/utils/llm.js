// LLM helpers — OpenAI (texto) + Gemini Imagen (imagens, primário)
'use strict';

const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_CREAO });
const genai  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_CREAO);

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

// ── Image generation — Gemini Imagen primário, DALL-E 3 fallback ──
// Retorna Buffer (PNG)
async function generateImage(prompt) {
  // ── Primário: Gemini Imagen 3 ──────────────────────────────────
  try {
    const model = genai.getGenerativeModel({ model: 'imagen-3.0-generate-002' });
    const res   = await model.generateImages({
      prompt,
      numberOfImages: 1,
      aspectRatio: '3:4',
      safetyFilterLevel: 'block_only_high'
    });
    const bytes = res.images[0].imageBytes;
    console.log('🖼️  Imagem gerada via Gemini Imagen 3');
    return Buffer.from(bytes, 'base64');
  } catch (e) {
    console.warn('⚠️  Gemini Imagen falhou → DALL-E 3:', e.message);
  }

  // ── Fallback: DALL-E 3 ─────────────────────────────────────────
  try {
    const res = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1792',
      response_format: 'b64_json'
    });
    console.log('🖼️  Imagem gerada via DALL-E 3 (fallback)');
    return Buffer.from(res.data[0].b64_json, 'base64');
  } catch (e) {
    console.error('❌ Ambos os geradores de imagem falharam:', e.message);
    // PNG 1x1 transparente como último recurso
    return Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
  }
}

module.exports = { generateText, generateImage };
