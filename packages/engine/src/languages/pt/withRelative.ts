import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { relativeAgentGap } from '../../functions/relativeAgentGap.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativePrepositionalHead } from '../../functions/relativePrepositionalHead.js';
import { agentPhrase } from './agentPhrase.js';
import { complementsPhrase } from './complementsPhrase.js';
import { modifierText } from './modifierText.js';
import { possessorText } from './possessorText.js';
import { isPlural } from './isPlural.js';
import { predicateText } from './predicateText.js';
import { prepObjectText } from './prepObjectText.js';
import { subjectText } from './subjectText.js';

/**
 * Append a noun phrase's attributive nouns, possessor, and relative clause (invariant
 * "que" + predicate). A subject-relative agrees with the head ("o menino que chora"); an
 * object-relative carries the clause's own subject, which drives agreement ("o livro que eu leio").
 * When the head fills a complement, the relativizer is that complement's preposition with the
 * article and "qual", agreeing with the head ("a casa debaixo da qual o gato come", "o menino ao qual o
 * homem dá o livro"). A plain locative gap is the relative adverb "onde" instead ("um lugar onde se
 * vive", C07). A possessor gap is the genitive relative
 * "cujo", which agrees with the possessed noun and takes the place of its article
 * ("um período cujo substantivo é uma palavra"). A passive's agent gap is "pelo qual" ("a criança pela
 * qual o livro é escrito"); its other gaps carry the agent after the participle ("o livro que é escrito
 * pela criança").
 */
export function withRelative(text: string, np: ResolvedNounPhrase): string {
  const withPoss = `${text}${modifierText(np)}${possessorText(np)}`;
  const rel = np.relative;
  if (!rel) return withPoss;
  // Genitive relative: "cujo" replaces the possessed phrase's article and agrees with it, not
  // with the head — "um período cujo substantivo é uma palavra", and so does the clause's verb.
  const possessed = relativePossessed(rel);
  if (possessed) {
    const pf = firstConjunct(possessed).head.forms;
    const whose = `cuj${pf['gender'] === 'fem' ? 'a' : 'o'}${isPlural(pf) ? 's' : ''}`;
    const owned = [whose, subjectText(possessed),
      predicateText(possessed.agreement, rel.verbPhrase, rel.directObject, rel.complements)];
    return `${withPoss} ${owned.filter(Boolean).join(' ')}`.trimEnd();
  }
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  // An impersonal ("se") subject is emitted as a proclitic by predicateText (off the generic flag
  // on agreeForms), not as a subject word — "uma coisa que se come".
  const subjText = subjectRelative || isGenericSubject(rel.subject!) ? '' : subjectText(rel.subject!);
  const clause = predicateText(agreeForms, rel.verbPhrase, rel.directObject, rel.complements, false, rel.agent);
  const QUAL = { base: 'qual', plural: 'quais', definiteness: 'definite' };
  // The object of a verb that takes it with a preposition relativises on that preposition, as a
  // complement does: "o botão no qual o gato clica" (A139).
  const prepHead = relativePrepositionalHead(np, QUAL);
  const gap = relativeGapComplement(np, QUAL);
  const agentGap = relativeAgentGap(np, QUAL);
  const relativizer = agentGap ? agentPhrase(agentGap)
    : prepHead ? prepObjectText(prepHead.head, prepHead.prep)
    : isPlainLocativeGap(rel) ? 'onde' : gap ? complementsPhrase(gap, {}, '') : 'que';
  return `${withPoss} ${relativizer} ${[subjText, clause].filter(Boolean).join(' ')}`.trimEnd();
}
