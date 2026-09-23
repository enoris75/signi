import type { ResolvedNounElement } from '../../types.js';
import { questionPossessor } from '../../functions/questionPossessor.js';

/**
 * The noun a **possessor** wh-question asks inside (P09-E14), its possessor replaced by the question
 * stand-in (`questionPossessor`) that each engine's possessor renderer writes as *whose*, *wessen*,
 * *di chi*, 誰の — or `el` unchanged when `asked` is false. The slot is not gapped: the noun is spoken,
 * and the verb agrees with it as ever.
 *
 * The possessed noun is **definite**, whatever the plan's determiner: the question word takes the
 * determiner's place in English and German ("whose food", "wessen Essen"), and Romance keeps the
 * noun with the definite article a possessed noun takes ("il cibo di chi", "di chi … il cibo").
 *
 * A pronoun cannot be possessed ("whose me?"), and the translator refuses it here, where the resolved
 * forms say what is one; `resolveQuestion` has already refused a coordination and a second possessor.
 */
export function withQuestionPossessor(el: ResolvedNounElement, asked: boolean): ResolvedNounElement {
  if (!asked) return el;
  const [np] = el.conjuncts;
  if (np.head.forms['person']) throw new Error('a possessor question cannot ask inside a pronoun (P09-E14)');
  const forms = { ...np.head.forms, definiteness: 'definite' };
  const possessed = { ...np, head: { ...np.head, forms }, possessor: questionPossessor() };
  return { ...el, conjuncts: [possessed], agreement: { ...el.agreement, definiteness: 'definite' } };
}
