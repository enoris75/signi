import type { ResolvedNounPhrase } from '../../types.js';
import { isGenericSubject } from '../../functions/isGenericSubject.js';
import { isPlainLocativeGap } from '../../functions/isPlainLocativeGap.js';
import { negatedAntecedentVerbPhrase } from '../../functions/negatedAntecedentVerbPhrase.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { relativeAgentGap } from '../../functions/relativeAgentGap.js';
import { relativeGapComplement } from '../../functions/relativeGapComplement.js';
import { relativePossessed } from '../../functions/relativePossessed.js';
import { relativeSubjectIsNegative } from '../../functions/relativeSubjectIsNegative.js';
import { relativePrepositionalHead } from '../../functions/relativePrepositionalHead.js';
import { relativeDropsSubject } from '../../functions/relativeDropsSubject.js';
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
 * object-relative carries the clause's own subject, which drives agreement ("o livro que o gato lê").
 * A pronoun subject is dropped, as in the main clause ("o livro que leio"), unless the clause would
 * then read as a subject relative ("o livro que você mostra", see `relativeDropsSubject`, A173).
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
  // Under a `no` head the relative asserts nothing about a real referent, so its verb takes the
  // subjunctive, on every branch below: "nenhum gato que coma" (A170).
  const verbPhrase = negatedAntecedentVerbPhrase(np, rel.verbPhrase);
  // Genitive relative: "cujo" replaces the possessed phrase's article and agrees with it, not
  // with the head — "um período cujo substantivo é uma palavra", and so does the clause's verb.
  const possessed = relativePossessed(rel);
  if (possessed) {
    const pf = firstConjunct(possessed).head.forms;
    const whose = `cuj${pf['gender'] === 'fem' ? 'a' : 'o'}${isPlural(pf) ? 's' : ''}`;
    const owned = [whose, subjectText(possessed),
      predicateText(possessed.agreement, verbPhrase, rel.directObject, rel.complements, false, undefined, relativeSubjectIsNegative(rel))];
    return `${withPoss} ${owned.filter(Boolean).join(' ')}`.trimEnd();
  }
  const subjectRelative = rel.headRole === 'subject' || !rel.subject;
  const agreeForms = subjectRelative ? np.head.forms : rel.subject!.agreement;
  // Whether the relative's OWN subject negates it, asked of the clause and not of `agreeForms`: a
  // subject relative agrees with its head, but a `no` head negates the matrix clause, so the relative
  // keeps its "não" ("nenhum gato que não coma corre", A167). The relativizer precedes the verb, so a
  // clitic stays in front of it even when the subject is dropped ("o gato ao qual o dou").
  const predicateFor = (forms: Record<string, string>) =>
    predicateText(forms, verbPhrase, rel.directObject, rel.complements, false, rel.agent, relativeSubjectIsNegative(rel));
  const clause = predicateFor(agreeForms);
  const QUAL = { base: 'qual', plural: 'quais', definiteness: 'definite' };
  // The object of a verb that takes it with a preposition relativises on that preposition, as a
  // complement does: "o botão no qual o gato clica" (A139).
  const prepHead = relativePrepositionalHead(np, QUAL);
  const gap = relativeGapComplement(np, QUAL);
  const agentGap = relativeAgentGap(np, QUAL);
  const relativizer = agentGap ? agentPhrase(agentGap)
    : prepHead ? prepObjectText(prepHead.head, prepHead.prep)
    : isPlainLocativeGap(rel) ? 'onde' : gap ? complementsPhrase(gap, {}, '') : 'que';
  // An impersonal ("se") subject is emitted as a proclitic by predicateText (off the generic flag
  // on agreeForms), not as a subject word — "uma coisa que se come". A pronoun subject is dropped as
  // in the main clause, "o livro que leio", where that leaves no subject-relative reading (A173).
  const subjText = subjectRelative || isGenericSubject(rel.subject!) || relativeDropsSubject(np, relativizer === 'que', predicateFor)
    ? '' : subjectText(rel.subject!);
  return `${withPoss} ${relativizer} ${[subjText, clause].filter(Boolean).join(' ')}`.trimEnd();
}
