/**
 * AI feedback placeholder. Replace with MegaLLM API call when available.
 * @param {object} params
 * @param {number} params.score
 * @param {string} params.topic
 * @param {number} params.timeTaken
 * @param {number} params.attempts
 * @param {string} params.predictedLevel
 * @returns {string}
 */
export function generateFeedback({ score, topic, timeTaken, attempts, predictedLevel }) {
  if (score >= 8) {
    return `Great job on ${topic}! You're ready for harder problems. Next level: ${predictedLevel}.`;
  }
  if (score >= 5) {
    return `Good attempt on ${topic}. You took ${timeTaken} min. Try a few more ${predictedLevel} questions to strengthen your understanding.`;
  }
  return `You struggled with ${topic} (${attempts} attempt(s)). We've set your next level to ${predictedLevel}. Revise the basics and try again—you've got this!`;
}
