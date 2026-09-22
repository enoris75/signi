/**
 * The cardinals each language spells, by value (see NounPhrase.numeral, C31). The table covers 1–12
 * and 24 — the numbers the calendar glosses count in (twenty-four hours, seven days, twelve months)
 * and the small ones a phrase reaches for. `numeralWord` falls back to the digits for anything else,
 * which all seven languages write that way.
 *
 * At **one** five of the languages agree the word with the noun, and it is the indefinite article's
 * own: `fem` carries that form. From two up every one of them is invariable, except Portuguese
 * *dois / duas*, which is why it too carries a `fem`.
 */
export interface Cardinal { word: string; fem?: string }

export type CardinalTable = Record<number, Cardinal>;

/**
 * One cardinal in this language, agreed with a feminine head where the language agrees it. A value
 * the table does not spell comes back as its digits.
 */
export function numeralWord(table: CardinalTable, value: number, feminine: boolean): string {
  const cardinal = table[value];
  if (!cardinal) return String(value);
  return feminine && cardinal.fem ? cardinal.fem : cardinal.word;
}
