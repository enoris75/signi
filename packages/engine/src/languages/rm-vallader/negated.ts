import { NEGATOR, NEGATOR_BEFORE_VOWEL, VOWEL_START } from './vallader.consts.js';

/**
 * *nu* before a word, *nun* before a vowel or *h* + vowel — "nu mangia", "nun es", "nun ha", "nun
 * as ferma" (the style sheet: *el nun ha mangià*).
 */
export function withNu(word: string): string {
  if (!word) return NEGATOR;
  return `${VOWEL_START.test(word) ? NEGATOR_BEFORE_VOWEL : NEGATOR} ${word}`;
}

export interface Negation {
  /** Whether the clause is negated at all: *nu* before the finite verb. */
  nu: boolean;
  /** The adverb in the slot after the finite verb, spelled. */
  adverbText?: string;
  /** A sentence adverb that scopes over the negation and so leads it: "forsa nu". */
  lead?: string;
}

/**
 * The finite word with Vallader's single preverbal negation (P04-E11 D2, the style sheet): *nu* (*nun*
 * before a vowel) before it and before its reflexive clitic, and nothing after it — *brich* is emphatic
 * and optional, and never added. A negative adverb simply follows the finite verb, as any frequency
 * adverb does: *nu … mai* (never), *nu … plü* (no longer), *nu … amo* (not yet), *nu … neir* (not
 * either) — "el nu mangia mai", "el nun ha amo mangià". Unnegated: "el mangia adüna".
 */
export function negated(finite: string, n: Negation): string {
  return [n.lead ?? '', n.nu ? withNu(finite) : finite, n.adverbText ?? ''].filter(Boolean).join(' ');
}
