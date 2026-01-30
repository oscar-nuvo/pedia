/**
 * Demo Chat Validation Utilities
 * These are shared validation functions used by the demo chat feature.
 * The actual edge function uses equivalent Deno implementations.
 */

// Injection patterns to block (case-insensitive)
export const INJECTION_PATTERNS = [
  "ignore your",
  "ignore all",
  "ignore previous",
  "disregard your",
  "forget your",
  "system prompt",
  "reveal your",
  "what are your instructions",
  "pretend you",
  "act as",
  "you are now",
  "jailbreak",
  "dan mode",
  "developer mode",
  "bypass",
  "override",
];

export const MAX_INPUT_LENGTH = 500;
export const MAX_QUERIES_PER_EMAIL = 3;

/**
 * Check if input contains injection patterns
 */
export function checkInjection(input: string): boolean {
  const lower = input.toLowerCase();
  return INJECTION_PATTERNS.some(pattern => lower.includes(pattern));
}

/**
 * Validate email format
 */
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if input length is within limits
 */
export function validateInputLength(input: string): boolean {
  return input.length <= MAX_INPUT_LENGTH;
}

/**
 * Validate question - combines all checks
 */
export function validateQuestion(question: string): { valid: boolean; error?: string } {
  if (!question || !question.trim()) {
    return { valid: false, error: 'Question is required' };
  }

  if (!validateInputLength(question)) {
    return { valid: false, error: `Question must be ${MAX_INPUT_LENGTH} characters or less` };
  }

  if (checkInjection(question)) {
    return { valid: false, error: "I'm here for clinical questions only. Try asking about dosing, differentials, or drug interactions." };
  }

  return { valid: true };
}

/**
 * Check if user has remaining queries
 */
export function hasRemainingQueries(queriesUsed: number): boolean {
  return queriesUsed < MAX_QUERIES_PER_EMAIL;
}

/**
 * Calculate remaining queries
 */
export function calculateRemaining(queriesUsed: number): number {
  return Math.max(0, MAX_QUERIES_PER_EMAIL - queriesUsed);
}
