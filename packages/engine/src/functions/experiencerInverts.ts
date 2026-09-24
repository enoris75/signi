import type { ResolvedPhrase } from '../types.js';

/** The subject an inverted experiencer clause says after the verb, and whether it is a `no` phrase. */
export interface InvertedSubject {
  text: string;
  negative: boolean;
}

/**
 * Whether an experiencer clause says its dative first and its subject after the verb (A369). Italian
 * *piacere* and Spanish *gustar* make the thing liked the subject and the one who likes a dative (see
 * `resolvePhrase`, C34), and the plain order of that frame is the dative's: "al gatto piace il cane",
 * "mi piace un angelo", "al gato le gusta el perro". The subject in front is the marked reading ("the
 * dog, not something else, pleases the cat").
 *
 * A statement and a yes/no question invert. A wh-question keeps the order its own fronting gives
 * ("che cosa piace al gatto?"), and a clause with no dative has nothing to lead: Italian drops a
 * generic experiencer, and "il gatto piace" is the cat being liked in general.
 */
export function experiencerInverts(phrase: ResolvedPhrase): boolean {
  const verbPhrase = phrase.verbPhrase;
  return !!verbPhrase && verbPhrase.verb.forms['experiencer'] === '1' && !phrase.question
    && !!phrase.complements?.['terminus'] && verbPhrase.mood !== 'imperative' && verbPhrase.mood !== 'infinitive';
}
