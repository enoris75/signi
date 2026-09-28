import type { Agr, Case } from './pl.types.js';

/** The hard endings, by slot; `stemEnding` respells them for a *-ki/-gi* or a soft stem. */
type Slot = 'y' | 'a' | 'e' | 'ego' | 'ej' | 'emu' | 'ą' | 'ym' | 'ych' | 'ymi';

/** The ending each case takes in each agreement column (style-pl.md's table; the virile nominative is stored). */
const MASC: Record<Exclude<Case, 'voc'>, Slot> = { nom: 'y', gen: 'ego', dat: 'emu', acc: 'y', ins: 'ym', loc: 'ym' };
const NEUT: Record<Exclude<Case, 'voc'>, Slot> = { nom: 'e', gen: 'ego', dat: 'emu', acc: 'e', ins: 'ym', loc: 'ym' };
const FEM: Record<Exclude<Case, 'voc'>, Slot> = { nom: 'a', gen: 'ej', dat: 'ej', acc: 'ą', ins: 'ą', loc: 'ej' };
const PLURAL: Record<Exclude<Case, 'voc'>, Slot> = { nom: 'e', gen: 'ych', dat: 'ym', acc: 'e', ins: 'ymi', loc: 'ych' };

/**
 * An -y/-i adjective declined by rule from its masculine nominative (P05 D4): the hard *-y* stems
 * (*dobry, dobra, dobrego*), the *-ki/-gi* stems, which write *i* for *y* and *ie* for *e* (*wysoki,
 * wysokie, wysokiego*), and the soft *-i* stems, which keep their *i* before every ending (*ostatni,
 * ostatnia, ostatniego, ostatnim*). The masculine animate accusative is the genitive (*dobrego psa*),
 * the virile accusative too (*dobrych chłopców*); the virile nominative is the stored `virile`
 * (*dobrzy, wysocy*), its consonant change not being derivable. A base in neither *-y* nor *-i* is not
 * declinable by rule and stands as it is.
 */
export function declineAdj(base: string, virile: string | undefined, kase: Case, agr: Agr): string {
  const c = kase === 'voc' ? 'nom' : kase;
  if (!/[yi]$/.test(base)) return base;
  if (agr.plural && agr.virile && c === 'nom') return virile ?? base;
  const slot: Slot = agr.plural
    ? (agr.virile && c === 'acc' ? 'ych' : PLURAL[c])
    : agr.gender === 'fem' ? FEM[c]
    : agr.gender === 'neut' ? NEUT[c]
    : c === 'acc' && agr.animate ? 'ego' : MASC[c];
  return stemEnding(base, slot);
}

/** The adjective's stem with one ending, respelled for the stem's class. */
function stemEnding(base: string, slot: Slot): string {
  const stem = base.slice(0, -1);
  if (base.endsWith('y')) return stem + slot;
  if (/[kg]i$/.test(base)) return stem + slot.replace(/^y/, 'i').replace(/^e/, 'ie');
  // A soft stem keeps its i: *ostatni* + *ego* → *ostatniego*, + *ym* → *ostatnim*.
  return base + slot.replace(/^y/, '');
}
