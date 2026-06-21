// LLM helpers — OpenAI (primary) + Gemini (fallback)
'use strict';

const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY_CREAO });
const genai  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_CREAO);

// ── Text generation ────────────────────────────────────────────────
async function generateText(prompt, systemPrompt = '', temperature = 0.85) {
  try {
    const messages = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: prompt });

    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature
    });
    return res.choices[0].message.content.trim();
  } catch (e) {
    console.warn('⚠️  OpenAI text failed → fallback Gemini:', e.message);
    const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const full  = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    const res   = await model.generateContent(full);
    return res.response.text().trim();
  }
}

// ── Image generation ───────────────────────────────────────────────
// Returns a Buffer (PNG/JPEG bytes)
async function generateImage(prompt) {
  // DALL-E 3 primary
  try {
    const res = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1792',        // closest portrait ratio to 540×675
      response_format: 'b64_json'
    });
    return Buffer.from(res.data[0].b64_json, 'base64');
  } catch (e) {
    console.warn('⚠️  DALL-E 3 failed → fallback Gemini Imagen:', e.message);
  }

  // Gemini Imagen fallback
  try {
    const model = genai.getGenerativeModel({ model: 'imagen-3.0-generate-002' });
    const res = await model.generateImages({
      prompt,
      numberOfImages: 1,
      aspectRatio: '3:4'
    });
    const bytes = res.images[0].imageBytes;
    return Buffer.from(bytes, 'base64');
  } catch (e) {
    console.error('❌ Both image generators failed:', e.message);
    // Return a 1×1 transparent PNG as last resort so pipeline doesn't crash
    return Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
  }
}

module.exports = { generateText, generateImage };
