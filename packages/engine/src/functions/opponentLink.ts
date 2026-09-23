import type { ConceptForms } from '../types.js';

/**
 * The adposition a verb marks its `opponent` with, where it is not the language's own (P09-E22).
 * *Play* takes the generic one everywhere — "gioca **contro** il cane", "spielt **gegen** den Hund",
 * 犬**を相手に**遊びます — but a verb whose case frame already marks the party it acts against names
 * its own: Japanese 戦う takes と ("犬**と**戦います"), not を相手に. The word is lexical, a property of
 * the verb, as the topic's is (`topicLink`), so the lexeme names it as `opponent_prep` and the
 * translator carries it on `ResolvedComplement.link`. "" leaves the language's own: *against*,
 * *contro*, *contre*, *gegen*, *contra*, を相手に.
 */
export function opponentLink(verb: ConceptForms['forms'] = {}): string {
  return verb['opponent_prep'] ?? '';
}
