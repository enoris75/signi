/** Place a frequency adverb after the finite auxiliary of a verb group — the slot English gives
 *  it after the *first* auxiliary: "must always eat", "will always eat", "has always eaten". A
 *  negated group puts it after the "not", which keeps the negation over the adverb: "has not
 *  always eaten", "cannot always eat", "does not always have to eat", "let's not always eat". */
export function afterFirstAux(verbText: string, adverb: string): string {
  const [aux, ...rest] = verbText.split(' ');
  if (rest[0] === 'not') return [aux, 'not', adverb, ...rest.slice(1)].join(' ');
  return [aux, adverb, ...rest].join(' ');
}
