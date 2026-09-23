import type { ConceptForms } from '../types.js';

/**
 * The preposition a verb governs its `topic` with, where it is not the language's own (P09-E2).
 * *Speak* takes the generic one — it "parla **del** gatto", de "spricht **über** den Kater" — but
 * *think* picks its own in every Romance language and in German: it "pensa **al** gatto", fr "pense
 * **au** chat", es "piensa **en** el gato", pt "pensa **no** gato", de "denkt **an** den Kater". The
 * word is lexical, a property of the verb, as a factitive's link is (`objectPredicativeLink`), so the
 * lexeme names it as `topic_prep` and the translator carries it on `ResolvedComplement.link`.
 * "" leaves the language's own: *about*, *di*, *de*, *sobre*, *über*, について.
 */
export function topicLink(verb: ConceptForms['forms'] = {}): string {
  return verb['topic_prep'] ?? '';
}
