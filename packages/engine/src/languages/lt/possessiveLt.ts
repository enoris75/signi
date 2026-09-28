import type { PronominalPossessor } from '../../types.js';

/** The possessive pronouns by person and number (P18 §2.1). */
const POSSESSIVES: Readonly<Record<string, string>> = {
  '1sg': 'mano', '2sg': 'tavo', '1pl': 'mūsų', '2pl': 'jūsų', '3pl': 'jų',
};

/**
 * The possessive pronoun for a possessor's features (P18 §2.1): *mano, tavo, jo, jos, mūsų, jūsų, jų*,
 * none of which declines — the genitives of the personal pronouns, so no agreement with the head.
 * `reflexive` is the possessor that is the clause's own subject, which Lithuanian says with ***savo***
 * whatever its person (P18 §0.4, see `isReflexivePossessor`): *aš valgau savo maistą*.
 */
export function possessiveLt(possessor: PronominalPossessor, reflexive = false): string {
  if (reflexive) return 'savo';
  const plural = possessor.number === 'plural';
  if (possessor.person === '3' && !plural) return possessor.gender === 'fem' ? 'jos' : 'jo';
  return POSSESSIVES[`${possessor.person}${plural ? 'pl' : 'sg'}`] ?? '';
}
