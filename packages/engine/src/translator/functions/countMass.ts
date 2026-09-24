import type { Definiteness, LanguageCode, NounPhrase } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import { SINGULAR_DETERMINERS } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';

/**
 * A mass noun counted by a numeral or a distributive (A311). A language that counts the noun by a
 * unit word seeds that word's counted phrase on the lexeme, `unit` and `unit_plural` (English *news*:
 * "piece of news", "pieces of news"), and the head becomes that count noun: "the three pieces of news
 * run", "each piece of news burns". A plurale tantum already counts and has shed its mass flag (see
 * `applyPluralOnly`), and `all` takes the mass noun whole ("all news"), so neither comes here.
 */
export function applyMassUnit(forms: Record<string, string>, numeral: number | undefined, definiteness: Definiteness): void {
  if (forms['uncountable'] !== '1' || !forms['unit']) return;
  if (numeral === undefined && !SINGULAR_DETERMINERS.has(definiteness)) return;
  forms['base'] = forms['unit'];
  forms['plural'] = forms['unit_plural'] ?? forms['unit'];
  delete forms['uncountable'];
}

/**
 * A numeral on a noun that is mass in every language is refused by name (A311): no language counts
 * FOOD or WATER without a unit (*three portions of food*, *three glasses of water*), the unit depends
 * on the noun, and none is seeded. Where any one language counts it — a plurale tantum (*le tre
 * notizie*) or a unit word (*three pieces of news*) — the plan is sayable, and every language says
 * it: the decision is the concept's, not one language's, so all seven lexemes are read.
 */
export function refuseUncountableNumeral(np: NounPhrase, forms: Record<string, string>, lookup: LexiconLookup): void {
  if (np.numeral === undefined || forms['uncountable'] !== '1') return;
  const counted = (Object.keys(LANGUAGES) as LanguageCode[]).some((language) => {
    const lexeme = lookup(np.concept, language)?.forms;
    return lexeme?.['count'] === 'plural' || !!lexeme?.['unit'];
  });
  if (!counted) {
    throw new Error(`a numeral cannot count ${np.concept}: it is a mass noun in every language, and no unit word is seeded to count it by (A311)`);
  }
}
