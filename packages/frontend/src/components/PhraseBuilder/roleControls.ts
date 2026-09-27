import type { NounKey, SlotKey } from "./interfaces.ts";
import type { SatelliteIcon } from "./Boxes.tsx";
import type { PerimeterEntry } from "./satellites/satellites.types.tsx";

/**
 * A role's controls on a phone (P17): the ring icons the canvas draws round a box, gathered for the
 * Phrase view's role sheet and for the bar a tapped canvas box raises. Both run each control's own
 * handler, so neither is a second write path.
 */

/** An adjective box rides its noun's row as a chip rather than taking a row of its own. */
export const isAdjectiveSlot = (key: SlotKey) => /Adjective\d?$/.test(key);
/** The noun an adjective box belongs to: `subjectAdjective2` → `subject`. */
export const adjectiveHead = (key: SlotKey) => key.replace(/Adjective\d?$/, "");
/** Controls that open a ring of their own, drawn on the canvas: owner, conjunct, standard, examples. */
export const RING_CONTROL = /(Possessor|Conjunct|Standard|ComparisonSet|Examples)$/;

/**
 * Every control a role's ring carries, in the canvas's order: its word's own satellites, then the
 * noun's perimeter controls (possessor, relative clause, coordination, …, which the canvas seats on
 * the noun's dotted ring rather than the word's), then — for the verb — its complement toggles.
 */
export function roleControlsOf(
  slot: SlotKey,
  controlsByParent: Record<string, SatelliteIcon[]>,
  perimeterByNoun: Partial<Record<NounKey, PerimeterEntry>>,
  verbControls: SatelliteIcon[],
): SatelliteIcon[] {
  return [
    ...(controlsByParent[slot] ?? []),
    ...Object.values(perimeterByNoun[slot as NounKey] ?? {}).filter((icon): icon is SatelliteIcon => Boolean(icon)),
    ...(slot === "verb" ? verbControls : []),
  ];
}

// The controls a phrase is built with most, first: a noun's number, its adjective and its
// determiner; a verb's tense, its polarity and its adverb.
const QUICK = [/Number$/, /Adjective$/, /Definiteness$/, /^verbTense$/, /^verbNegative$/, /^modifier$/];

/** The `count` controls a tapped box offers at once: the most-used ones it has, then the rest in order. */
export function quickControlsOf(controls: SatelliteIcon[], count = 3): SatelliteIcon[] {
  const rank = (icon: SatelliteIcon) => {
    const i = QUICK.findIndex((re) => re.test(icon.key));
    return i < 0 ? QUICK.length : i;
  };
  return controls
    .map((icon, order) => ({ icon, order, rank: rank(icon) }))
    .sort((a, b) => a.rank - b.rank || a.order - b.order)
    .slice(0, count)
    .map(({ icon }) => icon);
}
