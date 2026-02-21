const RANDOM_COACH_RESPONSES = [
  ({ topic, predictedLevel }) =>
    `Coach note: Good momentum on ${topic}. Try the next ${predictedLevel} question set and keep your focus steady.`,
  ({ topic, score, attempts }) =>
    `Coach note: You scored ${score}/10 on ${topic} with ${attempts} attempt(s). Review one weak point, then retry confidently.`,
  ({ topic, timeTaken }) =>
    `Coach note: Nice work on ${topic}. Your pace was ${timeTaken.toFixed(2)} min; aim to keep accuracy while solving a bit faster.`,
  ({ topic, predictedLevel }) =>
    `Coach note: Keep building your ${topic} basics and move gradually toward ${predictedLevel} difficulty for stronger retention.`,
  ({ topic }) =>
    `Coach note: You are improving in ${topic}. Stay consistent with short practice bursts and track your mistakes after each question.`,
];

/**
 * Local feedback generator with hardcoded random responses.
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
    score: Number(params?.score) || 0,
    topic: String(params?.topic || 'this topic').trim(),
    timeTaken: Math.max(0, Number(params?.timeTaken) || 1),
    attempts: Math.max(1, Number(params?.attempts) || 1),
    predictedLevel: String(params?.predictedLevel || 'medium'),
  };

  const choice = RANDOM_COACH_RESPONSES[Math.floor(Math.random() * RANDOM_COACH_RESPONSES.length)];
  return choice(safeParams);
}
