/**
 * Adaptive difficulty predictor for question-level performance.
 * Uses weighted signals and keeps the same function signature so controllers stay unchanged.
 * @param {number} score - Score out of 10
 * @param {number} timeTaken - Time in minutes
 * @param {number} attempts - Number of tries
 * @returns {'easy'|'medium'|'hard'}
 */
export function predictLevel(score, timeTaken, attempts) {
  const safeScore = Math.max(0, Math.min(10, Number(score) || 0));
  const safeTime = Math.max(0, Number(timeTaken) || 0);
  const safeAttempts = Math.max(1, Number(attempts) || 1);

  // Score is primary signal. Time and retries refine confidence.
  const scoreSignal = safeScore / 10;
  const timeSignal = safeTime <= 2 ? 1 : safeTime >= 20 ? 0 : 1 - (safeTime - 2) / 18;
  const attemptSignal = safeAttempts === 1 ? 1 : safeAttempts >= 4 ? 0 : 1 - (safeAttempts - 1) / 3;

  const readiness = scoreSignal * 0.65 + timeSignal * 0.2 + attemptSignal * 0.15;

  if (readiness >= 0.75 && safeScore >= 7) return 'hard';
  if (readiness >= 0.45) return 'medium';
  return 'easy';
}
