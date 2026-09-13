/** Place a frequency adverb after the finite auxiliary of a verb group — the slot English gives
 *  it after the *first* auxiliary: "must always eat", "will always eat", "has always eaten". */
export function afterFirstAux(verbText: string, adverb: string): string {
  const [aux, ...rest] = verbText.split(' ');
  return [aux, adverb, ...rest].join(' ');
}
