import type { Tense } from '@signi/shared';
import type { ConceptForms } from '../../types.js';
import { MODAL_AUX } from './en.consts.js';
import { conjugate } from './conjugate.js';

/**
 * The outermost modal's finite form, negated where asked. "not" follows a true modal
 * auxiliary — with the orthographic contraction "can not" → "cannot" — and everything else
 * (the suppletive "had to", the lexical "want") takes do-support over its bare form.
 */
export function modalFinite(
  m: ConceptForms,
  subjectForms: Record<string, string>,
  tense: Tense,
  negative: boolean,
): string {
  const finite = conjugate(m.forms, subjectForms, tense);
  if (!negative) return finite;
  const [first, ...rest] = finite.split(' ');
  // A true modal auxiliary takes "not" straight after it ("could not", "will not") — with the
  // orthographic "can not" → "cannot". "must" is the exception: Signi scopes a negated MUST as
  // ¬obligation ("does not have to"), the reading its own past ("did not have to"), German and
  // Japanese all take — never the prohibitive "must not". So "must" negates periphrastically via
  // the "have to" do-support below (as its past/future already do), keeping one scope across tenses.
  if (MODAL_AUX.has(first) && first !== 'must') {
    if (first === 'can' && rest.length === 0) return 'cannot';
    return [first, 'not', ...rest].join(' ');
  }
  const person = subjectForms['person'] ?? '3';
  const singular = (subjectForms['number'] ?? 'singular') !== 'plural';
  const doAux =
    tense === 'past' ? 'did not' :
    person === '3' && singular ? 'does not' : 'do not';
  return `${doAux} ${m.forms['nonfinite'] ?? m.forms['base'] ?? ''}`;
}
