import { ALMOST_DETERMINERS, type Approximator, type Definiteness } from "@signi/shared";
import type { NounKey, PhraseSelection } from "../interfaces.ts";

/**
 * The approximator a noun's quantity takes (P09-E49), in the engine's own order: *about* before a
 * numeral, else *almost* before a determiner in ALMOST_DETERMINERS (*all*, *no*, *many*), else none.
 */
export function approximatorFor(sel: PhraseSelection, which: NounKey): Approximator | undefined {
  if (sel.numerals?.[which] !== undefined) return "about";
  const d = sel[`${which}Definiteness` as keyof PhraseSelection] as Definiteness | undefined;
  return d && ALMOST_DETERMINERS.has(d) ? "almost" : undefined;
}
