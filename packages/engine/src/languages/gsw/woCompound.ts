/**
 * Standard German's *wo*-compounds (*womit*, *worauf*). Zürich asks a thing after a preposition with
 * the preposition and *was* — "mit was", "uf was" — so there is no compound to build, and the text is
 * returned as it is. Kept so the question code reads as its German parent.
 */
export const WO_COMPOUND: Readonly<Record<string, string>> = {};

export function woCompound(text: string): string {
  return text;
}
