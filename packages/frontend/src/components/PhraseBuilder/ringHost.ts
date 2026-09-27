import type { AbstractionLevel } from "@signi/shared";
import type { NounAddress, NounKey } from "./interfaces.ts";
import type { HostedRingGroup } from "./conjunctChain.ts";
import type { Pt } from "./ringLayout.ts";
import type { DragBoxProps, GroupDragProps } from "./phraseRender.tsx";

/**
 * Everything a hosted ring's builder borrows from the canvas its ring is drawn on — the period's. A
 * conjunct ("Peter and **Paul**") and an owner ("**the cat**'s book") are each a noun phrase edited by
 * a builder of its own, but its ring is one more constituent of the period's canvas: placed, dragged
 * and kept clear of the other rings by the period's builder. So the hosted builder paints at the
 * place it is handed and reports back the ring it drew.
 */
export interface RingHost {
  // A standard of comparison ("bigger than **the dog**", P09-E12 D5) is hosted as an owner is: a noun
  // phrase of its own, joined to the predicate adjective it is compared with.
  // A noun's examples ("animals such as **the cat**", P09-E48) are hosted as an owner is too.
  // An instrument (P12) is another period's container drawn inside this one: at `object` one noun ring,
  // at an action level two, the act and its noun, so it is the one host whose builder draws a group.
  kind: "conjunct" | "owner" | "standard" | "examples" | "instrument";
  // The ring's node key on the period's canvas (see conjunctKey; an owner goes by its address).
  key: string;
  // The period noun the ring belongs with. A conjunct's head plays that noun's role — a direct
  // object's conjunct is a direct object too — so its ring wears the role's name and colour; an
  // owner's ring wears only its colour.
  role: NounKey;
  // Where the ring's word sits, in % of the period's canvas, and that canvas's size in px.
  at: Pt;
  // For a host whose builder draws several rings (an instrument's act): the node key each ring goes by
  // on the period's canvas, and where its word sits, by the word's key in the hosted builder. Absent,
  // the one ring goes by `key` and sits `at`.
  keyOf?: (mainKey: string) => string;
  atOf?: (mainKey: string) => Pt;
  graphSize: { w: number; h: number };
  compact: boolean;
  // The period canvas's drag machinery: pressing anything on the ring drags the ring by `key`.
  draggingKey: string | null;
  makeDragProps: (key: string, onActivate: () => void, at: Pt, moveKey: string) => DragBoxProps;
  makeGroupDragProps: (nodeKeys: string[]) => GroupDragProps;
  // Shift a node of the period's canvas by a few pixels — what ⇧ + an arrow does. A hosted ring's
  // builder nudges its own ring, by the key it goes by on that canvas.
  nudge: (key: string, dx: number, dy: number) => void;
  // The ports the ring's links leave from, each facing the ring its line runs to.
  ports: { key: string; toward: Pt }[];
  // Where the ring's own possessor control faces while its noun has an owner: that owner's ring, or
  // the ring of the noun it points to.
  possessorToward?: Pt;
  // A standard whose degree no longer takes one (the positive) is drawn faded: the translator drops
  // it, and the word waits for the degree to come back.
  dimmed?: boolean;
  // An owner's *whose* (P09-E52 D1): the period asks it, so the period gates it — whether its mark
  // is offered on this ring, whether the period asks it now, and the toggle. Only a top-level owner
  // of the subject or the object has one.
  question?: { available: boolean; asked: boolean; toggle: () => void };
  // A standard under a superlative is the set it picks from, and is titled so (P09-E51 D2).
  set?: boolean;
  // An instrument's link, which its first ring's toolbar sets (P12): how far it is reified, whether it
  // is denied, and the two ways out of the clause — drawn as a card of its own, or a period picked.
  instrument?: {
    level: AbstractionLevel;
    negative: boolean;
    onLevelChange: (level: AbstractionLevel) => void;
    onNegativeChange: (negative: boolean) => void;
    onShowAsPeriod: () => void;
    onPickPeriod: () => void;
  };
  // Report the rings as drawn, keyed as `keyOf` names them, and null once they are gone.
  onRings: (group: HostedRingGroup | null) => void;
  // A conjunct's group: its last ring carries the control that extends the group.
  isLast?: boolean;
  onAddConjunct?: () => void;
  // Which owners are open, by the address of the noun they own. Held by the period's builder, which
  // draws every owner's ring, however deep.
  ownersOpen: Readonly<Record<NounAddress, boolean>>;
  setOwnerOpen: (address: NounAddress, open: boolean) => void;
}
