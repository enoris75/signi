import type { ConceptForms, ResolvedVerbPhrase } from '../../types.js';
import { moodPN } from '../../mood.js';
import { lemmaTail } from '../../functions/lemmaTail.js';
import { splitLemmaTail } from '../../functions/splitLemmaTail.js';
import { NEGATOR } from './sursilv.consts.js';

/**
 * A command (P04-E16 D2, P04 D10): the stored `2sg_imperative`, `1pl_imperative` or `2pl_imperative`
 * of the subject's person — "maglia!", "magliein!", "magliei!" — negated as any finite verb is, with
 * *buca* after it: "maglia buca!" (E11's shape; the alternative, an infinitive, is open for the
 * review), and a multiword verb's particle after it: "va buca ora!". A verb with the fused *se-* keeps it in the command as in every cell: "seferma!".
 *
 * A UI control's `instruction` register is the **infinitive**, as RG's (P04-E16 D2; verify): "memorisar
 * la frasa"; negated, *buca* before it, as on a sign: "buca fimar".
 */
export function imperativeText(
  plain: ConceptForms,
  subjectForms: Record<string, string>,
  register: ResolvedVerbPhrase['register'],
  negative: boolean,
  tail: string[],
): string {
  const f = plain.forms;
  if (register === 'instruction') {
    return [negative ? NEGATOR : '', f['base'] ?? '', ...tail].filter(Boolean).join(' ');
  }
  const pn = moodPN(subjectForms);
  const ipn = pn === '1pl' || pn === '2pl' ? pn : '2sg';
  const form = f[`${ipn}_imperative`] ?? f[`${ipn}_present`] ?? f['base'] ?? '';
  // A multiword verb's particle follows the negation, as in any finite cell: "va buca ora!".
  const [verb, particle] = splitLemmaTail(form, lemmaTail(plain));
  return [verb, negative ? NEGATOR : '', particle, ...tail].filter(Boolean).join(' ');
}
