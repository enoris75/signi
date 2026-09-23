import type { ResolvedVerbPhrase } from '../../types.js';

/**
 * The verb phrase of a clause whose object is a **content clause** (see PhrasePlan.contentObject,
 * P09-E4), with the addressee made a bare object where the verb's lexeme says so. English *tell*
 * writes its addressee with "to" behind a noun object ("tells the story to the man") but bare ahead of
 * a clause ("tells the man that the cat runs") — so the lexeme names `clause_terminus_bare`, and here
 * it becomes the `terminus_bare` the engines already read (A238). Unchanged otherwise.
 */
export function clauseAddressee(
  verbPhrase: ResolvedVerbPhrase | undefined,
  clauseObject: boolean,
): ResolvedVerbPhrase | undefined {
  if (!verbPhrase || !clauseObject || verbPhrase.verb.forms['clause_terminus_bare'] !== '1') return verbPhrase;
  return { ...verbPhrase, verb: { ...verbPhrase.verb, forms: { ...verbPhrase.verb.forms, terminus_bare: '1' } } };
}
