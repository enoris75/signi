// The phrase model — the selection, the workspace and its links — lives in @signi/phrase, which the
// backend loads too (P13). What stays here is the canvas's own: the hooks a builder takes part in
// cross-container linking through, which wire DOM elements into the workspace's measurements.
import type { AbstractionLevel, CoordConjunction, ImperativeRegister, SubordinatingConjunction } from "@signi/shared";
import {
  builderNounAddress,
  type ImperativePerson,
  type NounAddress,
  type NounKey,
  type SubordinateKind,
} from "@signi/phrase/model/interfaces.ts";

export * from "@signi/phrase/model/interfaces.ts";

// The workspace-provided hooks a PhraseBuilder needs to take part in cross-container
// linking. Undefined for embedded (possessor) sub-builders, which never link.
//
// The surface is wide, so it's split into four compartments: `geometry` (wiring DOM
// elements into the workspace's measurement registry — mirrors what useConnectors returns),
// `relative` (noun-level relative-clause links), and the two clause-level relations
// `conditional` and `coordinative`. `containerId` and `pickActive` are shared by all.

// How the workspace observes a container's geometry. Each register fn wires (or, with a null
// element, unregisters) a DOM node into the workspace's measurement registry; onGeometryChange
// asks the workspace to re-measure when internal state it can't see — an in-canvas drag — moves
// things. Mirrors the ref maps useConnectors hands back.
export interface WorkspaceGeometry {
  // A noun box, for cross-container measuring & greying.
  registerBox: (nounKey: NounAddress, el: HTMLElement | null) => void;
  // The little anchor dots a relative link line runs between: the relative-clause control on
  // the source noun's dotted ring (line start) and the receiving dot on the target noun's
  // dotted ring (line end). The workspace measures between these when present, else the boxes.
  registerSourceAnchor: (nounKey: NounAddress, el: HTMLElement | null) => void;
  registerTargetAnchor: (nounKey: NounAddress, el: HTMLElement | null) => void;
  // The border-control cluster: the endpoint the conditional/coordinative connector lines run
  // between (one anchor shared by both clause-level relations).
  registerBorderAnchor: (el: HTMLElement | null) => void;
  // The instrumental toggle on the verb-phrase dotted ring — where an instrumental link
  // starts, since the instrument is something the *verb* takes.
  registerVerbAnchor: (el: HTMLElement | null) => void;
  // Signal that this container's canvas geometry changed (a box was dragged, the canvas
  // resized, a group collapsed) so the workspace re-measures its link lines.
  onGeometryChange: () => void;
}

// Noun-level relative-clause linking for one container.
export interface RelativeBinding {
  // Nouns of this container that are a link source / a link target.
  sourceKeys: Set<NounAddress>;
  targetKeys: Set<NounAddress>;
  // Pick-mode: is this noun a legal link target right now? (drives highlight + click)
  isPickTarget: (nounKey: NounAddress) => boolean;
  onPick: (nounKey: NounAddress) => void;
  // Start / remove a relative-clause link sourced from this noun.
  onStartLink: (nounKey: NounAddress) => void;
  onRemoveLink: (nounKey: NounAddress) => void;
  // Nouns whose relative clause is said alone, their head unspoken (P13), and the setter.
  headlessKeys: Set<NounAddress>;
  onSetHeadless: (nounKey: NounAddress, headless: boolean) => void;
}

// Clause-level conditional (IF / MAIN) linking for one container.
export interface ConditionalBinding {
  // This container sources a conditional link (it is a main clause with an "if" clause).
  hasSource: boolean;
  // This container is the target of a conditional link (it is an "if" clause of some main clause).
  hasTarget: boolean;
  // During another container's conditional pick, is this container a legal "if" clause target?
  isPickTarget: boolean;
  // Start a conditional from this container (it becomes the main clause and awaits an "if"
  // pick); clear the one already sourced here; choose this container as a pending pick's "if".
  onStart: () => void;
  onClear: () => void;
  onPick: () => void;
}

// Clause-level coordinative (AND / OR / BUT / …) linking for one container. Mirrors
// ConditionalBinding, but a coordination carries the conjunction and onStart takes it.
export interface CoordinativeBinding {
  // This container sources a coordinative link (it is the first clause of a coordination).
  hasSource: boolean;
  // This container is the target of a coordinative link (it is the second clause).
  hasTarget: boolean;
  // The conjunction of the coordination this container takes part in, if any (for labelling).
  conjunction?: CoordConjunction;
  // Set only when this container is the second clause of a *command* coordination: the person and
  // register of the first clause, which the pair shares (a command and its coordinate are one
  // speech act, spoken to one person). This container's command box shows them, locked — see
  // PhraseCanvas.
  inheritedCommand?: { person: ImperativePerson; register: ImperativeRegister };
  // During another container's coordinative pick, is this container a legal second-clause target?
  isPickTarget: boolean;
  // Start a coordination from this container with the chosen conjunction (it becomes the first
  // clause and awaits a second-clause pick); clear the one already sourced here; choose this
  // container as a pending pick's second clause.
  onStart: (conjunction: CoordConjunction) => void;
  onClear: () => void;
  onPick: () => void;
}

// Clause-level subordination (P09-E12 D9) for one container: the object clause, the adverbial
// clause and the infinitive complement it governs, or the one it is. Mirrors CoordinativeBinding,
// but a subordinate link has a kind, and an adverbial one a conjunction, which onStart takes.
export interface SubordinateBinding {
  // The subordinate link this container governs (it is the main clause), if any.
  asSource?: { kind: SubordinateKind; conjunction?: SubordinatingConjunction };
  // The subordinate link this container is the clause of, if any.
  asTarget?: { kind: SubordinateKind; conjunction?: SubordinatingConjunction };
  // May this container start one (see canStartSubordinate)?
  canStart: boolean;
  // During another container's subordinate pick, is this container a legal target?
  isPickTarget: boolean;
  // Start a subordinate link of `kind` from this container (awaits the clause's pick); clear the
  // one sourced here; choose this container as a pending pick's clause.
  onStart: (kind: SubordinateKind, conjunction?: SubordinatingConjunction) => void;
  onClear: () => void;
  onPick: () => void;
}

// The instrumental link for one container. Mirrors ConditionalBinding, but the two ends are of
// different kinds: the *source* is a clause (its verb-phrase box carries the control) and the
// *target* is a period holding the instrument noun phrase, so the two roles are not symmetric
// and a container may hold both (an instrument phrase can itself act with an instrument only if
// it had a verb — it doesn't, so in practice a target sources nothing).
export interface InstrumentalBinding {
  // This container sources an instrumental link (its clause acts with an instrument).
  hasSource: boolean;
  // The reification degree of the link this container takes part in (either end), and its setter.
  // 'object' when there is no link — the level a new one starts at.
  level: AbstractionLevel;
  onLevelChange: (level: AbstractionLevel) => void;
  // Whether the link denies its instrument (the privative, "without the knife"), and its setter —
  // from either end, as the level. False when there is no link.
  negative: boolean;
  onNegativeChange: (negative: boolean) => void;
  // This container is the target of one — it *is* an instrument phrase.
  hasTarget: boolean;
  // During another container's instrumental pick, is this container a legal instrument target?
  isPickTarget: boolean;
  // Start an instrumental from this container (awaits an instrument-period pick); clear the one
  // already sourced here; choose this container as a pending pick's instrument.
  onStart: () => void;
  onClear: () => void;
  onPick: () => void;
}

export interface WorkspaceBinding {
  containerId: string;
  // Any cross-container pick (relative / conditional / coordinative / instrumental) is in progress.
  pickActive: boolean;
  geometry: WorkspaceGeometry;
  relative: RelativeBinding;
  conditional: ConditionalBinding;
  coordinative: CoordinativeBinding;
  subordinate: SubordinateBinding;
  instrumental: InstrumentalBinding;
}

// Wrap a container's `binding` for a hosted ring's builder — an owner's or a conjunct's — whose head
// is addressed `headPath`. The builder speaks in its own internal noun keys (its head is
// `"subject"`); this maps each onto its address (see builderNounAddress) before forwarding to
// the container, so the head registers/links under its workspace address. Such a head is only
// ever a link *source* (relativising it), never a target, so target/dimming is suppressed, and it
// is never a clause endpoint, so both clause compartments are inert.
export function adaptPossessorBinding(
  root: WorkspaceBinding,
  headPath: NounAddress,
): WorkspaceBinding {
  const map = (nounKey: NounAddress): NounAddress =>
    builderNounAddress(headPath, nounKey as NounKey);
  return {
    containerId: root.containerId,
    pickActive: root.pickActive,
    geometry: {
      registerBox: (nounKey, el) => root.geometry.registerBox(map(nounKey), el),
      registerSourceAnchor: (nounKey, el) =>
        root.geometry.registerSourceAnchor(map(nounKey), el),
      registerTargetAnchor: (nounKey, el) =>
        root.geometry.registerTargetAnchor(map(nounKey), el),
      // A hosted ring's builder is never a clause endpoint, so it anchors no clause connector,
      // and it has no verb phrase to hang an instrument off.
      registerBorderAnchor: () => {},
      registerVerbAnchor: () => {},
      onGeometryChange: root.geometry.onGeometryChange,
    },
    relative: {
      sourceKeys: new Set(
        root.relative.sourceKeys.has(headPath) ? ["subject"] : [],
      ),
      targetKeys: new Set(),
      isPickTarget: () => false,
      onPick: (nounKey) => root.relative.onPick(map(nounKey)),
      onStartLink: (nounKey) => root.relative.onStartLink(map(nounKey)),
      headlessKeys: new Set(root.relative.headlessKeys.has(headPath) ? ["subject"] : []),
      onSetHeadless: (nounKey, headless) => root.relative.onSetHeadless(map(nounKey), headless),
      onRemoveLink: (nounKey) => root.relative.onRemoveLink(map(nounKey)),
    },
    // Inert: a hosted ring's builder is never a conditional/coordinative endpoint.
    conditional: {
      hasSource: false,
      hasTarget: false,
      isPickTarget: false,
      onStart: () => {},
      onClear: () => {},
      onPick: () => {},
    },
    coordinative: {
      hasSource: false,
      hasTarget: false,
      conjunction: undefined,
      isPickTarget: false,
      onStart: () => {},
      onClear: () => {},
      onPick: () => {},
    },
    subordinate: {
      canStart: false,
      isPickTarget: false,
      onStart: () => {},
      onClear: () => {},
      onPick: () => {},
    },
    instrumental: {
      hasSource: false,
      hasTarget: false,
      level: 'object',
      onLevelChange: () => {},
      negative: false,
      onNegativeChange: () => {},
      isPickTarget: false,
      onStart: () => {},
      onClear: () => {},
      onPick: () => {},
    },
  };
}
