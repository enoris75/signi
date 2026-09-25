import type { PronominalPossessor } from "@signi/shared";
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

/** A named owner's line, with the phrase its chip shows where the owner is a pronoun (P11-E9 D7). */
export type OwnerLine = { spot: OwnerSpot; link: PossessionLink; pronoun: string | undefined; color: string };

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
}): { edges: Edge[]; pointerLines: PointerLine[]; ownerLines: OwnerLine[] } {
  // A hosted ring's builder knows its own possessor control by its head's key.
  const possessorControlOn = (key: string) =>
    controlOn(key, perimeterControlKey("possessor", key), perimeterControlKey("possessor", "subject"));

  // The phrase a possessive renders, and the bare possessive until it has come back (C16).
  const says = (concept: string | undefined, features: PronominalPossessor) =>
    possessivePhrase(concept, features) ?? t(possessiveHintKey(features));

  const ownerLines = owners.flatMap((spot): OwnerLine[] => {
    const link = ownerLink({
      owned: ringOf(spot.possessedKey),
      owner: ringOf(spot.address),
      control: possessorControlOn(spot.possessedKey),
      port: controlOn(spot.address, ownerPortKey(spot)),
      compact,
    });
    if (!link) return [];
    // A pronoun owner's line says the possessed phrase, as a pointer's does (P11-E9 D7): the ring
    // reads "first person", the line "my mother".
    return [{ spot, link, pronoun: spot.pronoun && says(spot.possessedConcept, spot.pronoun), color: colorOf(spot.role) }];
  });
  const ownerEdges = ownerLines.map(({ link, color }) => linkEdge(link, color, false));

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
    const pronoun = resolved ? says(spot.possessedConcept, resolved.features) : undefined;
    return [{ spot, link, pronoun, color: colorOf(spot.role) }];
  });

  return {
    edges: [...ownerEdges, ...pointerLines.map(({ link, color }) => linkEdge(link, color, true))],
    pointerLines,
    ownerLines: ownerLines.filter((line) => line.pronoun),
  };
}
