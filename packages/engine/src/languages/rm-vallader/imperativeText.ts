import type { ConceptForms, ResolvedVerbPhrase } from '../../types.js';
import { moodPN } from '../../mood.js';
import { VL_REFLEXIVE } from './vallader.consts.js';
import { withNu } from './negated.js';
import { withClitic } from './reflexiveClitic.js';

// A reflexive command's enclitic, as the column writes it on the imperative cells: *ferma't!*,
// *fermain'ans!*, *fermai'as!* (the style sheet: enclisis *(verify)*).
const ENCLITIC: Record<string, string> = { '2sg': 't', '1pl': 'ans', '2pl': 'as' };

/**
 * A command (P04-E16 D2, P04 D10): the stored `2sg_imperative`, `1pl_imperative` or `2pl_imperative`
 * of the subject's person — "mangia!", "mangiain!", "mangiai!" — with *nu* before it as before any
 * finite verb, "nu mangia!" (the author's draft, verify; the alternative is an infinitive). A reflexive
 * verb's clitic follows the affirmative command ("ferma't!") and precedes the negative one ("nun at
 * ferma!").
 *
 * A UI control's `instruction` register is the **infinitive**, as in `fr/es/pt/de` and Rumantsch Grischun (E16 D2):
 * *Arcunar*, *Avrir*, *Stüzzar* (verify).
 */
export function imperativeText(
  plain: ConceptForms,
  subjectForms: Record<string, string>,
  register: ResolvedVerbPhrase['register'],
  negative: boolean,
  reflexive: string,
  tail: string[],
): string {
  const f = plain.forms;
  if (register === 'instruction') {
    const inf = withClitic(reflexive ? 'as' : '', f['base'] ?? '');
    return [negative ? withNu(inf) : inf, ...tail].filter(Boolean).join(' ');
  }
  const pn = moodPN(subjectForms);
  const ipn = pn === '1pl' || pn === '2pl' ? pn : '2sg';
  const form = f[`${ipn}_imperative`] ?? f[`${ipn}_present`] ?? f['base'] ?? '';
  const verb = negative
    ? withNu(withClitic(reflexive ? VL_REFLEXIVE[ipn]! : '', form))
    : reflexive ? `${form}'${ENCLITIC[ipn]!}` : form;
  return [verb, ...tail].filter(Boolean).join(' ');
}
