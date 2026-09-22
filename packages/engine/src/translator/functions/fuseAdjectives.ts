/**
 * Fuse into the head noun any adjective the lexeme keeps a word of its own for (P11 D5).
 *
 * Japanese has no word for "brother": 兄弟 with ELDER is 兄 and with YOUNGER is 弟, and each of those
 * has an honorific of its own (お兄さん, 弟さん) that no prefix rule derives from 兄弟's ご兄弟. So the
 * lexeme carries `with_<ADJECTIVE>` columns — `with_ELDER`, `with_YOUNGER` — and the adjective one of
 * them names is **spent** here: its word becomes the head's, and it drops out of the phrase's
 * adjectives so it is not also said.
 *
 * Only the language that seeds the column fuses. The other six say it with an ordinary adjective
 * ("older brother", *fratello maggiore*, *frère aîné*), and so does Japanese on a head with no column
 * for it — 上の息子, the older son. Nothing here fires for a lexeme without one.
 *
 * The fused word takes its own `honorific` along, the form someone else's relative wears
 * (`applyPossessorForm` picks between them), and drops the unfused word's `possessed`, which names
 * the other lexeme. Returns the indices it spent, so the caller can drop exactly those while the
 * adjectives it kept stay aligned with their degrees and intensifiers.
 */
export function fuseAdjectives(forms: Record<string, string>, adjectives: readonly string[]): ReadonlySet<number> {
  const fused = new Set<number>();
  // Set or clear, because a stale key is a wrong word: 母親 reads ははおや and お母さん おかあさん, so a
  // column with no reading of its own must leave none behind.
  const put = (key: string, value?: string) => { if (value) forms[key] = value; else delete forms[key]; };
  adjectives.forEach((id, i) => {
    const word = forms[`with_${id}`];
    if (!word) return;
    forms['base'] = word;
    put('reading', forms[`with_${id}_reading`]);
    put('honorific', forms[`with_${id}_honorific`]);
    put('honorific_reading', forms[`with_${id}_honorific_reading`]);
    put('possessed');
    put('possessed_reading');
    fused.add(i);
  });
  return fused;
}
