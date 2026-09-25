import React from "react";
import type { PhraseSelection, WorkspaceBinding } from "./interfaces.ts";
import { nounSliceAt, updateNounAt } from "./phraseReducers.ts";
import type { OwnerSpot, PointerSpot, PossessionLink } from "./ownerChain.ts";
import type { RingHost } from "./ringHost.ts";
import { LinkChip } from "./ConjunctRings.tsx";
import type { PhraseBuilderProps } from "./PhraseBuilder.tsx";

interface OwnerRingsProps {
  // The named owners on the canvas, parents first.
  owners: OwnerSpot[];
  // The pointed-to owners whose lines are drawn, with the pronoun each renders and its ring's colour.
  pointers: { spot: PointerSpot; link: PossessionLink; pronoun: string | undefined; color: string }[];
  // The named owners that are pronouns, whose solid lines carry the possessed phrase too (P11-E9 D7).
  ownerLines?: { spot: OwnerSpot; link: PossessionLink; pronoun: string | undefined; color: string }[];
  // The whole period's selection: every owner's phrase is a slice of it, however deep.
  selection: PhraseSelection;
  onPhraseUpdate: (updater: (prev: PhraseSelection) => PhraseSelection) => void;
  onRemoveOwner: (spot: OwnerSpot) => void;
  // The period canvas's hand-off to each owner's ring.
  hostFor: (spot: OwnerSpot) => RingHost;
  binding?: WorkspaceBinding;
  // An owner is edited by the same builder that owns this canvas. Injected rather than imported so
  // this module never imports back into PhraseBuilder at runtime.
  Builder: React.ComponentType<PhraseBuilderProps>;
}

/**
 * Possession on the canvas. Each named owner is a ring painted by a verbless noun-phrase-mode
 * PhraseBuilder editing the owner's slice (`${which}Possessor` of the noun it owns — a noun phrase
 * whose head is its `subject`), so an owner gets the full noun-phrase surface: determiner,
 * adjectives, number/gender, a relative clause and an owner of its own. An owner that is still empty
 * is the word picker the owner starts as.
 *
 * Each pointed-to owner is drawn by its period's canvas as a dashed line; this puts the possessive
 * pronoun it renders on that line. A named owner that is a pronoun ("my mother", P11-E9) wears the
 * same chip on its solid line: its ring names the person, the chip what the possessive says.
 */
export function OwnerRings({
  owners,
  pointers,
  ownerLines = [],
  selection,
  onPhraseUpdate,
  onRemoveOwner,
  hostFor,
  binding,
  Builder,
}: OwnerRingsProps) {
  return (
    <>
      {owners.map((spot) => (
        <Builder
          key={spot.address}
          selection={nounSliceAt(selection, spot.address)?.slice ?? {}}
          // A lens onto the owner's slice, so its edits land at its address in the period.
          onPhraseUpdate={(updater) =>
            onPhraseUpdate((prev) => updateNounAt(prev, spot.address, (slice) => updater(slice)))
          }
          onRemove={() => onRemoveOwner(spot)}
          // Forward the container's binding so the owner's head can source a relative-clause link
          // ("the book of the cat *that eats the mouse*") — the way a clause reaches an owner.
          binding={binding}
          possessorPath={spot.address}
          // An owner is a noun phrase, not a clause: the plan reads only its head.
          nounPhraseOnly
          ringHost={hostFor(spot)}
        />
      ))}
      {pointers.map(({ spot, link, pronoun, color }) =>
        pronoun ? (
          <LinkChip
            key={spot.possessed}
            label={pronoun}
            color={color}
            at={link.mid}
            testId="pronoun-chip"
          />
        ) : null,
      )}
      {ownerLines.map(({ spot, link, pronoun, color }) =>
        pronoun ? (
          <LinkChip
            key={`${spot.address}:chip`}
            label={pronoun}
            color={color}
            at={link.mid}
            dashed={false}
            testId="owner-pronoun-chip"
          />
        ) : null,
      )}
    </>
  );
}
