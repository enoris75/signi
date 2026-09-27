import type { ConceptForms, ResolvedVerbPhrase } from '../../types.js';
import { moodPN } from '../../mood.js';
import { NEGATOR_POST } from './rumgr.consts.js';
import { withNa } from './negated.js';
import { withClitic } from './reflexiveClitic.js';

// A reflexive command's clitic, hyphenated after it: *tschenta-ta!*, *tschentai-as!* (P04-E4, verify).
const ENCLITIC: Record<string, string> = { '2sg': 'ta', '1pl': 'ans', '2pl': 'as' };

/**
 * A command (P04-E16 D2, P04 D10): the stored `2sg_imperative`, `1pl_imperative` or `2pl_imperative`
 * of the subject's person — "mangia!", "mangiain!", "mangiai!" — with the negation around it as around
 * any finite verb, "na mangia betg!" (verify; the alternative is an infinitive). A reflexive verb's
 * clitic follows the affirmative command, hyphenated ("tschenta-ta!"), and precedes the negative one
 * ("na ta tschenta betg!").
 *
 * A UI control's `instruction` register is the **infinitive**, as in `fr/es/pt/de` (E16 D2's open
 * point, ruled here; verify): RG software labels its buttons *Memorisar*, *Avrir*, *Stizzar*.
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
    const inf = withClitic(reflexive ? 'sa' : '', f['base'] ?? '');
    return [negative ? NEGATOR_POST : '', inf, ...tail].filter(Boolean).join(' ');
  }
  const pn = moodPN(subjectForms);
  const ipn = pn === '1pl' || pn === '2pl' ? pn : '2sg';
  const form = f[`${ipn}_imperative`] ?? f[`${ipn === '2sg' ? '2sg' : ipn}_present`] ?? f['base'] ?? '';
  const clitic = reflexive ? ENCLITIC[ipn]! : '';
  const verb = negative
    ? `${withNa(withClitic(clitic, form))} ${NEGATOR_POST}`
    : clitic ? `${form}-${clitic}` : form;
  return [verb, ...tail].filter(Boolean).join(' ');
}
