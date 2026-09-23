/**
 * The *wo(r)-* compounds German writes for a preposition over a **thing** it asks about (P09-E15):
 * *worunter*, *womit*, *worüber*, *wodurch*, *wovor*, *wohinter*, *worum*, *wogegen*, and the others
 * German has — *woran*, *worauf*, *woraus*, *wobei*, *wofür*, *wonach*, *wovon*. Only those: *dank*,
 * *wegen*, *zwischen*, *bis zu* and the multi-word relations keep the preposition over *was* ("dank
 * was"), and *zu* is left out, since *wozu* asks for a purpose.
 */
export const WO_COMPOUND: Readonly<Record<string, string>> = {
  an: 'woran', auf: 'worauf', aus: 'woraus', bei: 'wobei', durch: 'wodurch', für: 'wofür', gegen: 'wogegen',
  hinter: 'wohinter', mit: 'womit', nach: 'wonach', über: 'worüber', um: 'worum', unter: 'worunter', von: 'wovon',
  vor: 'wovor',
};

/**
 * A rendered complement question with its *was* folded into the preposition where German has the
 * compound (`WO_COMPOUND`): "unter was" → "worunter", "mit was" → "womit"; anything else unchanged
 * ("dank was", "mit wem").
 */
export function woCompound(text: string): string {
  const match = /^(\S+) was$/.exec(text);
  const compound = match ? WO_COMPOUND[match[1]] : undefined;
  return compound ?? text;
}
