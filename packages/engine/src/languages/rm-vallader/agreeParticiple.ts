import { agreeByRule } from './agreeByRule.js';

/**
 * A verb's past participle agreeing in gender and number — after *esser* with the subject ("la giatta
 * es ida", "ils giats sun its"), and in the passive with the patient. The lexeme stores the masculine
 * singular `participle`, and `participle_fem` / `participle_plural` / `participle_fem_plural` only where
 * the form breaks the rule (P04-E6); the rest is `agreeByRule`.
 */
export function agreeParticiple(verbForms: Record<string, string>, gender: string, plural: boolean): string {
  const base = verbForms['participle'] ?? verbForms['base'] ?? '';
  const fem = gender === 'fem';
  const key = plural ? (fem ? 'participle_fem_plural' : 'participle_plural') : fem ? 'participle_fem' : 'participle';
  return verbForms[key] ?? agreeByRule(base, fem, plural);
}
