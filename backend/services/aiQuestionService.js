import { getAIProvider, getGeminiModelCandidates } from './aiProvider.js';

const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/responses';
const OPENAI_QUESTION_MODEL = process.env.OPENAI_QUESTION_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';

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

function parseJsonObject(text) {
  if (!text) return null;
  const trimmed = String(text).trim();

  try {
    return JSON.parse(trimmed);
  } catch (_) {}

  const withoutFences = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(withoutFences);
  } catch (_) {}

  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(withoutFences.slice(start, end + 1));
    } catch (_) {}
  }
  return null;
}

function normalizeQuestion(raw, topic, difficulty) {
  const questionText = String(raw?.questionText || '').trim();
  const options = Array.isArray(raw?.options)
    ? raw.options.map((opt) => String(opt || '').trim()).filter(Boolean)
    : [];
  const uniqueOptions = [...new Set(options)];
  const limitedOptions = uniqueOptions.slice(0, 4);
  let correctAnswer = String(raw?.correctAnswer || '').trim();
  const explanation = String(raw?.explanation || '').trim();

  if (!questionText || limitedOptions.length < 4) return null;

  if (!limitedOptions.includes(correctAnswer)) {
    const match = limitedOptions.find((opt) => opt.toLowerCase() === correctAnswer.toLowerCase());
    correctAnswer = match || '';
  }
  if (!correctAnswer || !limitedOptions.includes(correctAnswer)) {
    return null;
  }

  return {
    topic,
    difficulty,
    questionText,
    options: limitedOptions,
    correctAnswer,
    explanation: explanation || null,
  };
}

function buildPrompt({ topic, difficulty, count }) {
  return [
    'Generate quiz questions as strict JSON.',
    `Subject: ${topic}`,
    `Difficulty: ${difficulty}`,
    `Count: ${count}`,
    'Only MCQ format is allowed.',
    'Each question must have exactly 4 options.',
    'The correctAnswer must exactly match one option.',
    'Return concise explanation for each question.',
    'Return this exact JSON shape:',
    '{"questions":[{"questionText":"...","options":["...","...","...","..."],"correctAnswer":"...","explanation":"..."}]}',
    'Do not include markdown, prose, numbering, or extra keys.',
  ].join('\n');
}

async function fetchQuestionsFromOpenAI({ topic, difficulty, count }) {
  if (typeof fetch !== 'function') return [];
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const prompt = buildPrompt({ topic, difficulty, count });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_QUESTION_MODEL,
        input: prompt,
        text: {
          format: {
            type: 'json_schema',
            name: 'quiz_questions',
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['questions'],
              properties: {
                questions: {
                  type: 'array',
                  minItems: count,
                  maxItems: count,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['questionText', 'options', 'correctAnswer', 'explanation'],
                    properties: {
                      questionText: { type: 'string' },
                      options: {
                        type: 'array',
                        minItems: 4,
                        maxItems: 4,
                        items: { type: 'string' },
                      },
                      correctAnswer: { type: 'string' },
                      explanation: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const text = extractOpenAIOutputText(payload);
    const parsed = parseJsonObject(text);
    return Array.isArray(parsed?.questions) ? parsed.questions : [];
  } catch (_) {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchQuestionsFromGemini({ topic, difficulty, count }) {
  if (typeof fetch !== 'function') return [];
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return [];

  const prompt = buildPrompt({ topic, difficulty, count });
  const modelCandidates = getGeminiModelCandidates('question');

  for (const model of modelCandidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const url = `${GEMINI_API_URL}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4,
            maxOutputTokens: 4096,
          },
        }),
        signal: controller.signal,
      });
      if (!response.ok) continue;
      const payload = await response.json();
      const text = extractGeminiOutputText(payload);
      const parsed = parseJsonObject(text);
      const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
      if (questions.length) return questions;
    } catch (_) {
      // Try the next model candidate.
    } finally {
      clearTimeout(timeout);
    }
  }

  return [];
}

async function fetchQuestionsFromModel({ topic, difficulty, count }) {
  const provider = getAIProvider();
  if (provider === 'gemini') {
    return fetchQuestionsFromGemini({ topic, difficulty, count });
  }
  return fetchQuestionsFromOpenAI({ topic, difficulty, count });
}

/**
 * @param {object} params
 * @param {string} params.topic
 * @param {'easy'|'medium'|'hard'} params.difficulty
 * @param {number} params.count
 * @returns {Promise<Array<{topic:string,difficulty:string,questionText:string,options:string[],correctAnswer:string,explanation:string|null}>>}
 */
export async function generateMCQQuestions({ topic, difficulty, count }) {
  const safeTopic = String(topic || '').trim();
  const safeDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'easy';
  const safeCount = Math.max(1, Math.min(15, Number(count) || 5));

  if (!safeTopic) return [];

  const rawQuestions = await fetchQuestionsFromModel({
    topic: safeTopic,
    difficulty: safeDifficulty,
    count: safeCount,
  });

  const normalized = rawQuestions
    .map((q) => normalizeQuestion(q, safeTopic, safeDifficulty))
    .filter(Boolean);

  return normalized.slice(0, safeCount);
}
