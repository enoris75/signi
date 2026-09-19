import type { Tense } from '@signi/shared';
import type { ConceptForms } from '../../types.js';
import { MODAL_AUX } from './en.consts.js';
import { conjugate } from './conjugate.js';
import { doSupport } from './doSupport.js';

/**
 * The outermost modal's finite form, negated where asked. "not" follows a true modal
 * auxiliary — with the orthographic contraction "can not" → "cannot" — and everything else
 * (the suppletive "had to", the lexical "want") takes do-support over its bare form.
 *
 * A `question` needs an auxiliary to put before its subject, and finds one the same way: a true modal
 * auxiliary is one ("can the cat go?"), anything else takes do-support ("does the cat want to go?",
 * "did the cat have to go?").
 */
export function modalFinite(
  m: ConceptForms,
  subjectForms: Record<string, string>,
  tense: Tense,
  negative: boolean,
  question = false,
): string {
  const finite = conjugate(m.forms, subjectForms, tense);
  const [first, ...rest] = finite.split(' ');
  if (!negative) {
    if (!question || MODAL_AUX.has(first)) return finite;
    return `${doSupport(subjectForms, tense)} ${m.forms['nonfinite'] ?? m.forms['base'] ?? ''}`;
  }
  // A true modal auxiliary takes "not" straight after it ("could not", "will not") — with the
  // orthographic "can not" → "cannot". "must" is the exception: Signi scopes a negated MUST as
  // ¬obligation ("does not have to"), the reading its own past ("did not have to"), German and
  // Japanese all take — never the prohibitive "must not". So "must" negates periphrastically via
  // the "have to" do-support below (as its past/future already do), keeping one scope across tenses.
  if (MODAL_AUX.has(first) && first !== 'must') {
    if (first === 'can' && rest.length === 0) return 'cannot';
    return [first, 'not', ...rest].join(' ');
  }
  return `${doSupport(subjectForms, tense)} not ${m.forms['nonfinite'] ?? m.forms['base'] ?? ''}`;
}
