import { getAIProvider, getGeminiModelCandidates } from './aiProvider.js';

const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/responses';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';

function fallbackFeedback({ score, topic, timeTaken, attempts, predictedLevel }) {
  if (score >= 8) {
    return `Great job on ${topic}! You are ready for harder problems. Next level: ${predictedLevel}.`;
  }
  if (score >= 5) {
    return `Good attempt on ${topic}. You took ${timeTaken} min. Try a few more ${predictedLevel} questions to strengthen your understanding.`;
  }
  return `You struggled with ${topic} (${attempts} attempt(s)). We set your next level to ${predictedLevel}. Revise the basics and try again.`;
}

function extractOpenAIOutputText(payload) {
  if (!payload) return '';
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }
  if (!Array.isArray(payload.output)) return '';
  for (const item of payload.output) {
    if (!Array.isArray(item.content)) continue;
    for (const block of item.content) {
      const text = block?.text?.trim();
      if (text) return text;
    }
  }
  return '';
}

function extractGeminiOutputText(payload) {
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === 'string' ? text.trim() : '';
}

async function fetchOpenAIFeedback(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || typeof fetch !== 'function') return '';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: prompt,
      }),
      signal: controller.signal,
    });
    if (!response.ok) return '';
    const data = await response.json();
    return extractOpenAIOutputText(data);
  } catch (_) {
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchGeminiFeedback(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || typeof fetch !== 'function') return '';
  const modelCandidates = getGeminiModelCandidates('general');

  for (const model of modelCandidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const url = `${GEMINI_API_URL}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 180,
          },
        }),
        signal: controller.signal,
      });
      if (!response.ok) continue;
      const data = await response.json();
      const text = extractGeminiOutputText(data);
      if (text) return text;
    } catch (_) {
      // Try the next model candidate.
    } finally {
      clearTimeout(timeout);
    }
  }

  return '';
}

async function fetchModelFeedback({ score, topic, timeTaken, attempts, predictedLevel }) {
  const prompt = [
    'You are an educational coach.',
    'Write concise feedback in 1-2 sentences.',
    'Include one specific improvement tip and encouraging tone.',
    `Topic: ${topic}`,
    `Score (out of 10): ${score}`,
    `Time taken (minutes): ${timeTaken}`,
    `Attempts: ${attempts}`,
    `Predicted next level: ${predictedLevel}`,
  ].join('\n');

  const provider = getAIProvider();
  if (provider === 'gemini') {
    return fetchGeminiFeedback(prompt);
  }
  return fetchOpenAIFeedback(prompt);
}

/**
 * @param {object} params
 * @param {number} params.score
 * @param {string} params.topic
 * @param {number} params.timeTaken
 * @param {number} params.attempts
 * @param {string} params.predictedLevel
 * @returns {Promise<string>}
 */
export async function generateFeedback(params) {
  const safeParams = {
    score: Number(params.score) || 0,
    topic: String(params.topic || 'the topic').slice(0, 80),
    timeTaken: Number(params.timeTaken) || 1,
    attempts: Math.max(1, Number(params.attempts) || 1),
    predictedLevel: String(params.predictedLevel || 'medium'),
  };

  const llmFeedback = await fetchModelFeedback(safeParams);
  return llmFeedback || fallbackFeedback(safeParams);
}
