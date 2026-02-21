function normalizeProvider(value) {
  const provider = String(value || '').trim().toLowerCase();
  if (provider === 'openai' || provider === 'gemini') return provider;
  return '';
}

function uniqueNonEmpty(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const value = String(item || '').trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

export function getAIProvider() {
  const configured = normalizeProvider(process.env.AI_PROVIDER);
  if (configured) return configured;

  // Auto-pick Gemini when only Gemini key is configured.
  if (process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) return 'gemini';
  return 'openai';
}

export function hasAIProviderKey(provider = getAIProvider()) {
  if (provider === 'gemini') return Boolean(process.env.GEMINI_API_KEY);
  return Boolean(process.env.OPENAI_API_KEY);
}

export function missingProviderKeyMessage(provider = getAIProvider()) {
  if (provider === 'gemini') return 'GEMINI_API_KEY is missing on the server';
  return 'OPENAI_API_KEY is missing on the server';
}

export function getGeminiModelCandidates(kind = 'general') {
  const preferred = kind === 'question' ? process.env.GEMINI_QUESTION_MODEL : process.env.GEMINI_MODEL;
  return uniqueNonEmpty([
    preferred,
    process.env.GEMINI_MODEL,
    process.env.GEMINI_QUESTION_MODEL,
    'gemini-flash-latest',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
  ]);
}
