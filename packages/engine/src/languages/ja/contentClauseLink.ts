import type { ResolvedPhrase } from '../../types.js';

/**
 * What closes a Japanese object clause (see PhrasePlan.contentObject, P09-E4): the governing verb's
 * `content_clause_link`, else the nominalizing ことを. The two are not interchangeable. A verb of
 * saying or thinking reports a statement, which Japanese **quotes** with と — 猫が走ると言います; a
 * verb of knowing takes a fact, which it **nominalizes** — 猫が走ることを知っています. Quoting with こと
 * would say "says the fact that the cat runs": grammatical, and not what the sentence means.
 */
export function contentClauseLink(phrase: ResolvedPhrase): string {
  const clause = phrase.contentObject;
  // An indirect question closes on the question particle instead, and takes neither link after it (P09-E17):
  // か on a wh-clause (猫が何を食べるか尋ねます), かどうか on a yes/no one (猫が走るかどうか尋ねます). The か
  // clause is a noun-like complement already, so ことを or と would make it a fact or a quotation.
  if (clause?.embedded) return clause.question ? 'か' : 'かどうか';
  return phrase.verbPhrase?.verb.forms['content_clause_link'] ?? 'ことを';
}
