import { agreeByRule, predicativeParticiple } from './agreeByRule.js';

/**
 * A verb's past participle agreeing in gender and number — after *esser* with the subject ("la gatta
 * ei ida", "els ein i"), and in the passive with the patient. The lexeme stores the masculine singular
 * `participle`, and `participle_fem` / `participle_plural` / `participle_fem_plural` only where the
 * form breaks the rule; the rest is `agreeByRule`.
 *
 * Every participle that agrees is **predicative** — it stands after *esser* or *vegnir* — so its
 * masculine singular takes Sursilvan's predicative *-s* (style sheet, P04-E9): "el ei vegnius", "el ei
 * staus", "el ei ius ora". The *-s* is derived here, not stored, and not read from the translator's
 * `position` flag (which marks adjectives only): a participle that agrees is predicative by
 * construction.
 */
export function agreeParticiple(verbForms: Record<string, string>, gender: string, plural: boolean): string {
  const base = verbForms['participle'] ?? verbForms['base'] ?? '';
  const fem = gender === 'fem';
  if (!fem && !plural) return predicativeParticiple(base);
  const key = plural ? (fem ? 'participle_fem_plural' : 'participle_plural') : 'participle_fem';
  return verbForms[key] ?? agreeByRule(base, fem, plural);
}
