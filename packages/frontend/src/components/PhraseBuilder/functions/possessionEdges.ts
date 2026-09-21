import type { NounKey } from "../interfaces.ts";
import type { UiStringLookup } from "../../../i18n/conceptWord.ts";
import type { PossessivePhrase } from "../../../i18n/usePossessivePhrase.ts";
import { possessiveHintKey, type CorefPick } from "../CorefPickContext.tsx";
import {
  ownerLink,
  ownerPortKey,
  pointerLink,
  type OwnerSpot,
  type PointerSpot,
  type PossessionLink,
  type RingAt,
} from "../ownerChain.ts";
import { perimeterControlKey } from "../ringSpecs.ts";
import { linkEdge, type Edge } from "../graph.ts";
import type { Pt } from "../ringLayout.ts";

/**
 * A pointed-to owner's line, with the phrase its chip shows and its ring's colour. The phrase is
 * the possessed noun under its possessive — "his horse", fr *son cheval* — rendered on request
 * (see `usePossessivePhrases`), with the bare possessive as the fallback until it arrives.
 */
export type PointerLine = { spot: PointerSpot; link: PossessionLink; pronoun: string | undefined; color: string };

/**
 * The lines of possession on a canvas: a solid line from each noun to its owner's ring, and a dashed
 * one from each noun that points to its owner, bowed past the rings between. Each leaves from the
 * noun's possessor control. A line is left out until both its rings are drawn.
 */
export function possessionEdges({
  owners,
  pointers,
  ringOf,
  controlOn,
  colorOf,
  resolve,
  t,
  possessivePhrase,
  compact,
}: {
  owners: readonly OwnerSpot[];
  pointers: readonly PointerSpot[];
  // The rings and controls on the canvas (see ringLookup).
  ringOf: (key: string) => RingAt | undefined;
  controlOn: (key: string, control: string, hostedControl?: string) => Pt | undefined;
  // The colour of the period noun a possession belongs with.
  colorOf: (role: NounKey) => string;
  resolve: CorefPick["resolve"];
  t: UiStringLookup;
  // The possessed noun phrase, once the backend has rendered it (see `usePossessivePhrases`).
  possessivePhrase: PossessivePhrase;
  compact: boolean;
}): { edges: Edge[]; pointerLines: PointerLine[] } {
  // A hosted ring's builder knows its own possessor control by its head's key.
  const possessorControlOn = (key: string) =>
    controlOn(key, perimeterControlKey("possessor", key), perimeterControlKey("possessor", "subject"));

  const ownerEdges = owners.flatMap((spot) => {
    const link = ownerLink({
      owned: ringOf(spot.possessedKey),
      owner: ringOf(spot.address),
      control: possessorControlOn(spot.possessedKey),
      port: controlOn(spot.address, ownerPortKey(spot)),
      compact,
    });
    return link ? [linkEdge(link, colorOf(spot.role), false)] : [];
  });

  const pointerLines = pointers.flatMap((spot): PointerLine[] => {
    const link = pointerLink({
      owned: ringOf(spot.possessedKey),
      antecedent: spot.antecedentKey ? ringOf(spot.antecedentKey) : undefined,
      control: possessorControlOn(spot.possessedKey),
      compact,
    });
    if (!link) return [];
    const resolved = resolve(spot.antecedent);
    // The whole phrase where the render has come back, the bare possessive until then: the Romance
    // possessive agrees with the noun possessed, which only the engine can settle (C16).
    const pronoun = resolved
      ? possessivePhrase(spot.possessedConcept, resolved.features) ?? t(possessiveHintKey(resolved.features))
      : undefined;
    return [{ spot, link, pronoun, color: colorOf(spot.role) }];
  });

  return {
    edges: [...ownerEdges, ...pointerLines.map(({ link, color }) => linkEdge(link, color, true))],
    pointerLines,
  };
}
