import type { Concept } from "@signi/shared";
import type { PossessiveRequest } from "../../../i18n/usePossessivePhrase.ts";
import type { CorefPick } from "../CorefPickContext.tsx";
import { POSSESSOR_REF_KEY, type NounAddress, type PhraseSelection } from "../interfaces.ts";
import type { PointerSpot } from "../ownerChain.ts";
import { NOUN_KEYS } from "../slots.ts";

/**
 * Every possessed noun phrase this canvas needs rendered — one per noun whose possessor points at
 * another noun (see `usePossessivePhrases`). Two sources, because the two surfaces that show the
 * phrase see different things: the chips on the links come from the canvas's `pointers`, which a
 * *hosted* ring's builder leaves to its parent, while the possessor control's own tooltip is drawn
 * by whichever builder owns the noun and so walks the local selection. The pairs are deduplicated
 * downstream, so a noun reached both ways is rendered once.
 */
export function possessiveRequests(
  selection: PhraseSelection,
  pointers: readonly PointerSpot[],
  resolve: CorefPick["resolve"],
): PossessiveRequest[] {
  const out: PossessiveRequest[] = [];
  const add = (concept: string | undefined, antecedent: NounAddress | undefined) => {
    const resolved = antecedent ? resolve(antecedent) : undefined;
    if (concept && resolved) out.push({ concept, features: resolved.features });
  };
  for (const spot of pointers) add(spot.possessedConcept, spot.antecedent);
  for (const which of NOUN_KEYS) {
    add(
      (selection[which] as Concept | undefined)?.id,
      selection[POSSESSOR_REF_KEY(which)] as NounAddress | undefined,
    );
  }
  return out;
}
