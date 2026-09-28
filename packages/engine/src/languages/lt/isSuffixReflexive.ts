import { aspectForm } from './aspectForm.js';

/**
 * Whether the aspect the clause picked is a **suffix reflexive** (style-lt.md): the lexeme carries
 * `reflexive: '1'` and that aspect's infinitive ends in *-tis* (*praustis*), so its bare cells take
 * *-si* from `verbWord`. A prefix reflexive stores its *-si-* inside every cell (*nusiprausti*) and is
 * not one, even under a `reflexive` lexeme (verify: the column never pairs a suffix reflexive, but
 * this keeps a paired one right).
 */
export function isSuffixReflexive(forms: Record<string, string>, perfective: boolean): boolean {
  return forms['reflexive'] === '1' && (aspectForm(forms, perfective, 'base') ?? '').endsWith('tis');
}
