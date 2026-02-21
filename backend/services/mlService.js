/**
 * ML-based difficulty prediction (rule-based for hackathon MVP).
 * Can be replaced with a trained Random Forest model later.
 * @param {number} score - Score out of 10
 * @param {number} timeTaken - Time in minutes
 * @param {number} attempts - Number of tries
 * @returns {'easy'|'medium'|'hard'}
 */
export function predictLevel(score, timeTaken, attempts) {
  if (score < 4) return 'easy';
  if (score <= 6 || attempts > 2 || timeTaken > 15) return 'medium';
  return 'hard';
}
