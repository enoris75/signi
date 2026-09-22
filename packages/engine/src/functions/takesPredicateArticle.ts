import type { ConceptForms } from '../types.js';
import { adjDegree } from './adjDegree.js';

/**
 * A predicate adjective that keeps the definite article it has before a noun: SAME is "the same"
 * wherever it stands — "the cat is the same", it "è lo stesso", fr "est le même", es "es el mismo",
 * pt "é o mesmo" — and "*the cat is same" is not said (localization B66). The seed marks the
 * languages that do this with `predicate_article`; German gleich and Japanese 同じ are predicates
 * as they stand, so they carry no mark. The caller supplies the article, agreeing with what the
 * predicate is said of, exactly as it does for a relative superlative
 * ([`isRelativeSuperlative`](./isRelativeSuperlative.ts)).
 *
 * Only the plain degree: a compared form is the degree's to spell.
 */
export function takesPredicateArticle(a: ConceptForms): boolean {
  return a.forms['predicate_article'] === '1' && adjDegree(a) === 'positive';
}
