import type { NounKey } from "../interfaces.ts";
import { possessiveHintEn, type CorefPick } from "../CorefPickContext.tsx";
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

/** A pointed-to owner's line, with the pronoun it renders and its ring's colour. */
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
    return [{ spot, link, pronoun: resolved && possessiveHintEn(resolved.features), color: colorOf(spot.role) }];
  });

  return {
    edges: [...ownerEdges, ...pointerLines.map(({ link, color }) => linkEdge(link, color, true))],
    pointerLines,
  };
}
