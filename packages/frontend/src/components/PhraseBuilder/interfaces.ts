import type { AbstractionLevel, Aspect, CauseSentiment, Concept, ComplementType, CoordConjunction, Definiteness, Degree, GrammaticalRole, ImperativeRegister, ModifierRelation, PathSpecifier, Tense, UiStringKey } from "@signi/shared";
import { canCoordinateImperative } from "@signi/shared";

export type { AbstractionLevel, CoordConjunction };

// UI metadata for the coordinating conjunctions offered on the coordinative control: the
// short menu label and the traditional grammatical name of each relation.
export const COORD_CONJUNCTION_OPTIONS: {
  value: CoordConjunction;
  label: string;
  hint: string;
}[] = [
  { value: "and", label: "And", hint: "copulative" },
  { value: "or", label: "Or", hint: "disjunctive" },
  { value: "but", label: "But", hint: "adversative" },
  { value: "that_is", label: "That is", hint: "explicative" },
  { value: "therefore", label: "Therefore", hint: "conclusive" },
  { value: "then", label: "Then", hint: "temporal" },
];

export const COORD_CONJUNCTION_LABEL: Record<CoordConjunction, string> =
  Object.fromEntries(
    COORD_CONJUNCTION_OPTIONS.map((o) => [o.value, o.label]),
  ) as Record<CoordConjunction, string>;

// The conjunctions offered when starting a coordination from `imperative` period. A command
// coordinates with a second command, which only four of the six can join: the conclusive
// "therefore" and the explicative "that is" need a statement on at least one side (see
// IMPERATIVE_COORD_CONJUNCTIONS), so they drop out of the menu under a command.
export function coordConjunctionOptions(
  imperative: boolean,
): typeof COORD_CONJUNCTION_OPTIONS {
  if (!imperative) return COORD_CONJUNCTION_OPTIONS;
  return COORD_CONJUNCTION_OPTIONS.filter((o) =>
    canCoordinateImperative(o.value),
  );
}


/**
 * The complements that get a word box on the canvas — every one except those realized as a
 * cross-container link. The `instrumental` is the one such link today: its noun phrase lives in
 * a period container of its own, reached from the control on the verb-phrase dotted box (see
 * PhraseLink's 'instrumental' kind), so it has no box, no adjective slots and no fields in the
 * selection. Everything keyed by "a noun block on this canvas" — slots, positions, number/gender
 * toggles, possessors — is keyed by this rather than by ComplementType.
 */
export type BoxComplementType = Exclude<ComplementType, "instrumental">;

export interface SlotConfig {
    key: "subject" |
    "verb" |
    "verbModal" |
    "verbModal2" |
    "verbModalAdverb" |
    "verbModal2Adverb" |
    "directObject" |
    "modifier" |
    "subjectAdjective" |
    "subjectAdjective2" |
    "subjectAdjective3" |
    "directObjectAdjective" |
    "directObjectAdjective2" |
    "directObjectAdjective3" |
    BoxComplementType |
    `${BoxComplementType}Adjective` |
    `${BoxComplementType}Adjective2` |
    `${BoxComplementType}Adjective3`;
    label: string;
    // When set, the box titles itself with this engine-rendered string in the current UI
    // language instead of the static English `label` (which stays as the fallback and as the
    // name used in tooltips / group headings). Slots migrate to a key as their word is seeded.
    labelKey?: UiStringKey;
    required: boolean;
    roles: GrammaticalRole[];
    color: "primary" | "secondary" | "success" | "warning" | "info" | "error";
}

// Which addressee an imperative command targets. The subject is dropped from the surface, but
// the person/number still selects the imperative form (tu vs "let's" vs plural). Default 2sg.
export type ImperativePerson = "2sg" | "1pl" | "2pl";

// The person a selection's command agrees with (default 2sg). Still meaningful under the
// `instruction` register — the selector only greys it there, it does not forget it, so
// returning to an order restores the person the user last picked.
export function imperativePerson(selection: PhraseSelection): ImperativePerson {
  return selection.imperativePerson ?? "2sg";
}

// The register a selection's command is spoken in (default `request` — an order, addressed to
// the person above). `instruction` is addressed to nobody, and the engines render it in each
// language's own label form (fr/es/pt/de infinitive, ja verbal noun).
export function imperativeRegisterOf(selection: PhraseSelection): ImperativeRegister {
  return selection.imperativeRegister ?? "request";
}

export interface PhraseSelection {
    subject?: Concept;
    // When set, this period is an imperative (command). The subject box becomes the addressee
    // selector (see `imperativePerson`) and the subject is dropped by the engines; tense/aspect
    // are forced present/neutral and modals cleared (an imperative is a mood, mutually exclusive
    // with those and with a conditional — the UI enforces this). A command may still coordinate
    // with a second command, which shares its mood, addressee and register.
    imperative?: boolean;
    // The addressee of an imperative command (default 2sg). Only meaningful when `imperative`,
    // and moot under the `instruction` register, which addresses nobody.
    imperativePerson?: ImperativePerson;
    // The register of an imperative: a command spoken to the addressee above (`request`, the
    // default) or an impersonal instruction (see ImperativeAddress). Only meaningful when
    // `imperative`; passed straight through to the plan.
    imperativeRegister?: ImperativeRegister;
    verb?: Concept;
    verbNegative?: boolean;
    verbTense?: Tense;
    // Grammatical aspect (neutral / progressive / prospective / resultative), orthogonal to
    // tense. Defaults to 'neutral' when absent.
    verbAspect?: Aspect;
    // Modal verbs governing the predicate, outermost first: `verbModal` governs `verbModal2`,
    // which governs the verb — "voglio poter andare". Like the adjectives they chain, each
    // revealed from a control on the previous one's box, so `verbModal2` only exists once
    // `verbModal` holds a word. Both hold modal verb concepts (`Concept.modal`).
    verbModal?: Concept;
    verbModal2?: Concept;
    // Each modal may carry its own adverb, exactly as the main verb carries `modifier` — "never
    // wanted to always go" is `verbModal` = WILL with `verbModalAdverb` = NEVER over the verb GO
    // with `modifier` = ALWAYS. Each is revealed once its modal holds a word.
    verbModalAdverb?: Concept;
    verbModal2Adverb?: Concept;
    directObject?: Concept;
    modifier?: Concept;
    // Each noun block chains up to three adjectives; each one is revealed from a control
    // on the previous adjective's box, so `Adjective2` only exists once `Adjective` is set.
    subjectAdjective?: Concept;
    subjectAdjective2?: Concept;
    subjectAdjective3?: Concept;
    subjectNumber?: "singular" | "plural";
    subjectGender?: "masc" | "fem" | "neut";
    // Determiner (the / a / bare) for the subject and direct-object noun phrases.
    subjectDefiniteness?: Definiteness;
    directObjectDefiniteness?: Definiteness;
    directObjectNumber?: "singular" | "plural";
    directObjectGender?: "masc" | "fem" | "neut";
    directObjectAdjective?: Concept;
    directObjectAdjective2?: Concept;
    directObjectAdjective3?: Concept;
    // Subject complement (predicative) of a copular verb (become/seem/appear). Its head
    // may be a predicate noun ("becomes a legend") or a predicate adjective ("seems
    // happy"); number/gender apply only to a noun head (an adjective head agrees with the
    // subject in the engine).
    predicative?: Concept;
    predicativeNumber?: "singular" | "plural";
    predicativeGender?: "masc" | "fem" | "neut";
    // Determiner for a predicate-noun subject complement ("becomes a legend"). The
    // predicative is the one complement that takes no adposition, so — like subject and
    // direct object — it can honor the determiner; the adposition-bearing complements
    // stay definite. Only meaningful for a noun head (an adjective head takes none).
    predicativeDefiniteness?: Definiteness;
    predicativeAdjective?: Concept;
    predicativeAdjective2?: Concept;
    predicativeAdjective3?: Concept;
    // Motion/locative complements — each an independent noun phrase, with its
    // own chained adjectives (up to three, matching subjects/objects).
    locative?: Concept;
    locativeNumber?: "singular" | "plural";
    locativeGender?: "masc" | "fem" | "neut";
    locativeAdjective?: Concept;
    locativeAdjective2?: Concept;
    locativeAdjective3?: Concept;
    direction?: Concept;
    directionNumber?: "singular" | "plural";
    directionGender?: "masc" | "fem" | "neut";
    directionAdjective?: Concept;
    directionAdjective2?: Concept;
    directionAdjective3?: Concept;
    source?: Concept;
    sourceNumber?: "singular" | "plural";
    sourceGender?: "masc" | "fem" | "neut";
    sourceAdjective?: Concept;
    sourceAdjective2?: Concept;
    sourceAdjective3?: Concept;
    route?: Concept;
    routeNumber?: "singular" | "plural";
    routeGender?: "masc" | "fem" | "neut";
    routeAdjective?: Concept;
    routeAdjective2?: Concept;
    routeAdjective3?: Concept;
    // The path relation (through / under / over / …) for the route complement.
    routeSpecifier?: PathSpecifier;
    // Cause / reason adjunct ("cried because of the dog"). Its one specifier is the
    // affective sentiment — neutral (because of) / negative (fault of) / positive (thanks to),
    // selected on the cause dotted box. Defaults to 'neutral' when absent.
    cause?: Concept;
    causeNumber?: "singular" | "plural";
    causeGender?: "masc" | "fem" | "neut";
    causeAdjective?: Concept;
    causeAdjective2?: Concept;
    causeAdjective3?: Concept;
    causeSentiment?: CauseSentiment;
    // The instrumental complement has no fields here: its noun phrase lives in a period
    // container of its own, linked from the verb-phrase dotted box (see BoxComplementType and
    // the 'instrumental' PhraseLink), and is folded into the plan by workspacePlan.
    // Terminus — the recipient or goal, "to whom / to what": the traditional indirect object
    // ("gives the book *to the cat*") and the dative adjunct a plain transitive verb can take
    // ("cut the hair *to the cat*") alike. Renders with each language's dative; no specifier.
    terminus?: Concept;
    terminusNumber?: "singular" | "plural";
    terminusGender?: "masc" | "fem" | "neut";
    terminusAdjective?: Concept;
    terminusAdjective2?: Concept;
    terminusAdjective3?: Concept;
    // Semantic relation for any adjective slot whose picked concept is a *noun* used
    // attributively ("sail boat"). Keyed by the adjective slot key (e.g. "subjectAdjective").
    // Only consulted when that slot holds a noun; adjective concepts ignore it. Defaults
    // to 'feature'. See NounModifier / ModifierRelation in @signi/shared.
    modifierRelations?: Partial<Record<string, ModifierRelation>>;
    // Grammatical number of an attributive-noun modifier ("creatore di *frasi*"), keyed by
    // the adjective slot key like `modifierRelations`. Only consulted when that slot holds a
    // noun; defaults to 'singular'. See NounModifier.number in @signi/shared.
    modifierNumbers?: Partial<Record<string, "singular" | "plural">>;
    // An adjective modifying an attributive-noun modifier itself ("*semantic* phrase creator"
    // → creatore di frasi *semantiche*), keyed by the adjective slot key. In Romance it agrees
    // with the modifier's own gender/number, not the head's. Only consulted when the slot holds
    // a noun. See NounModifier.adjectives in @signi/shared.
    modifierAdjectives?: Partial<Record<string, Concept>>;
    // Comparative degree for any slot whose picked concept is a real *adjective* ("more
    // beautiful"). Keyed by the slot key, mirroring `modifierRelations` (the two are mutually
    // exclusive — a slot holds either an adjective or a noun-modifier). That is every adjective
    // slot, plus the `predicative` slot itself when the subject complement is a predicate
    // adjective ("seems happier") — which threads into NounPhrase.headDegree rather than
    // `adjectiveDegrees`. Defaults to 'positive'. See Degree.
    adjectiveDegrees?: Partial<Record<string, Degree>>;
    // Relative clauses are no longer stored inside a selection: a noun's relative clause
    // is a *separate* phrase container linked to it (see PhraseLink / PhraseWorkspace).
    // Optional possessor per noun block ("the *cat's* book"). Each is a PhraseSelection
    // whose `subject` slot holds the possessing noun (so its number/gender/adjectives and
    // its own nested possessor all reuse the `subject*` fields); built via buildNounPhrase.
    // Coordinated conjuncts of a noun block ("Peter *and Paul*"). Like `*Possessor`, each is a
    // PhraseSelection whose `subject` slot holds that conjunct's head — so a conjunct gets the
    // whole noun-phrase surface (determiner, number/gender, adjectives, its own possessor and
    // relative clause) from the same recursive builder, and conjuncts may differ freely ("Peter
    // and the old dog"). The block's own fields are the *first* conjunct; these are the rest.
    //
    // Only the three adposition-free noun slots coordinate today (see COORDINABLE_NOUN_KEYS):
    // the prepositional complements raise a question these don't — whether the preposition
    // repeats across the conjuncts — that each language answers differently.
    subjectConjuncts?: PhraseSelection[];
    directObjectConjuncts?: PhraseSelection[];
    predicativeConjuncts?: PhraseSelection[];
    // The one conjunction joining a block's whole group (default 'and'). Only `and` / `or` join
    // noun phrases — see NOUN_COORD_CONJUNCTIONS.
    subjectConjunction?: CoordConjunction;
    directObjectConjunction?: CoordConjunction;
    predicativeConjunction?: CoordConjunction;
    subjectPossessor?: PhraseSelection;
    directObjectPossessor?: PhraseSelection;
    predicativePossessor?: PhraseSelection;
    locativePossessor?: PhraseSelection;
    directionPossessor?: PhraseSelection;
    sourcePossessor?: PhraseSelection;
    routePossessor?: PhraseSelection;
    causePossessor?: PhraseSelection;
    terminusPossessor?: PhraseSelection;
    // A *pronominal* possessor: instead of a genitive `${which}Possessor` phrase, the noun's
    // possessor corefers with another noun in the same period ("the boy and *his* horse"), stored
    // as that antecedent's `NounAddress`. The engine then renders a possessive pronoun agreeing
    // with the antecedent's person/number/gender (see `resolveAntecedent` in selectionToPlan).
    // Mutually exclusive with the matching `${which}Possessor` — the reducers keep only one set.
    subjectPossessorRef?: NounAddress;
    directObjectPossessorRef?: NounAddress;
    predicativePossessorRef?: NounAddress;
    locativePossessorRef?: NounAddress;
    directionPossessorRef?: NounAddress;
    sourcePossessorRef?: NounAddress;
    routePossessorRef?: NounAddress;
    causePossessorRef?: NounAddress;
    terminusPossessorRef?: NounAddress;
}

// Extra grammatical settings a picker can commit alongside a concept. The pronoun
// chooser uses this to place its number/gender decision in one shot (a plain noun
// pick omits it and lets applyConceptSelect seed the defaults).
export interface ConceptSelectOpts {
  number?: "singular" | "plural";
  gender?: "masc" | "fem" | "neut";
}

export type NumberSlot = "subject" | "directObject" | BoxComplementType;

export type GenderSlot = "subject" | "directObject" | BoxComplementType;

// The noun blocks that can carry a relative clause / possessor (same set as NumberSlot).
export type NounKey = "subject" | "directObject" | BoxComplementType;

// The address of a noun anywhere in a container's phrase tree, used as a cross-container
// link endpoint. A top-level noun is just its `NounKey`; a possessor head is that address
// followed by a `/possessor` step (e.g. `directObject/possessor`, or, for a
// possessor-of-a-possessor, `directObject/possessor/possessor`); a coordinated conjunct is
// that address followed by `/conjunct/<i>` (`subject/conjunct/0` is the *second* noun of the
// subject — the block's own fields are the first). Steps compose, so a conjunct's possessor is
// `subject/conjunct/0/possessor`. Only *sources* use the suffixes today (relativising a
// possessor or a conjunct head); targets are always plain `NounKey`.
export type NounAddress = string;

// Append a `/possessor` step to a noun address — the address of that noun's possessor head.
export const possessorAddress = (base: NounAddress): NounAddress => `${base}/possessor`;

// Append a `/conjunct/<i>` step — the address of the i-th *extra* conjunct of that noun.
export const conjunctAddress = (base: NounAddress, i: number): NounAddress =>
  `${base}/conjunct/${i}`;

export const POSSESSOR_KEY = (which: NounKey) =>
  `${which}Possessor` as keyof PhraseSelection;

export const POSSESSOR_REF_KEY = (which: NounKey) =>
  `${which}PossessorRef` as keyof PhraseSelection;

export const CONJUNCTS_KEY = (which: NounKey) =>
  `${which}Conjuncts` as keyof PhraseSelection;

export const CONJUNCTION_KEY = (which: NounKey) =>
  `${which}Conjunction` as keyof PhraseSelection;

export type SlotKey = SlotConfig["key"];

// ── Word-category switch ─────────────────────────────────────────────────────
// Some slots accept a word from one of two lexical classes: the subject (and the causal
// complement) take a noun or a pronoun; the subject complement and every adjective slot
// take a noun or an adjective. The chosen class is shown in two synced places — a toggle
// *on the empty box*, and the category selector *inside the open word picker*. It only
// chooses which vocabulary is searched; the picked concept's own `role` is what downstream
// code reads. A single-vocabulary slot (verb, direct object, adverb, …) returns null.
export interface SlotCategory {
  value: string;
  // The label is a catalog key, not a literal: the engine renders the grammar noun
  // ("noun" / "pronoun" / "adjective") into the UI language like every other UI string.
  labelKey: UiStringKey;
}

const NOUN_CATEGORY: SlotCategory = { value: "noun", labelKey: "category.noun" };
const PRONOUN_CATEGORY: SlotCategory = { value: "pronoun", labelKey: "category.pronoun" };
const ADJECTIVE_CATEGORY: SlotCategory = {
  value: "adjective",
  labelKey: "category.adjective",
};

export function slotCategories(
  slotKey: SlotKey,
  // In noun-phrase (possessor) mode the `subject` slot is a plain noun head — no pronoun.
  nounSubject = false,
): { options: SlotCategory[]; fallback: string } | null {
  if (slotKey === "subject")
    return nounSubject
      ? null
      : { options: [NOUN_CATEGORY, PRONOUN_CATEGORY], fallback: "noun" };
  if (slotKey === "cause")
    return { options: [NOUN_CATEGORY, PRONOUN_CATEGORY], fallback: "noun" };
  if (slotKey === "predicative")
    return { options: [NOUN_CATEGORY, ADJECTIVE_CATEGORY], fallback: "noun" };
  if (/Adjective\d?$/.test(slotKey))
    return { options: [ADJECTIVE_CATEGORY, NOUN_CATEGORY], fallback: "adjective" };
  return null;
}

// ── Multi-container workspace ────────────────────────────────────────────────
// The builder now edits a *stack* of independent phrase containers. A relative clause
// is expressed as a cross-container link: a noun in one container (the source/head) is
// linked to a noun in another container (the target/relativized "gap"), which is greyed
// out and consumed as that head's relative clause when the sentence is serialized.

// One phrase container: a stable id plus a full clause selection.
export interface PhraseContainer {
  id: string;
  selection: PhraseSelection;
}

// A cross-container link between two containers. Two kinds share one array (so they share the
// forest/cycle machinery and both mark their target container non-root):
//  - `relative` (default): a source noun (the head) → target noun (the gap) — a relative clause.
//    The source may be a possessor head (a `/possessor` address); the target is a plain noun.
//  - `conditional`: a container → container hypothetical link. The *source* is the main clause
//    (its border control was clicked), the *target* is the "if" clause. No noun endpoints.
export type PhraseLink =
  | {
      id: string;
      kind?: 'relative';
      source: { containerId: string; nounKey: NounAddress };
      target: { containerId: string; nounKey: NounKey };
    }
  | {
      id: string;
      kind: 'conditional';
      source: { containerId: string };
      target: { containerId: string };
    }
  | {
      id: string;
      kind: 'coordinative';
      // The coordinating conjunction joining the two clauses (source = first, target = second).
      conjunction: CoordConjunction;
      source: { containerId: string };
      target: { containerId: string };
    }
  | {
      // The instrumental complement: the *source* container is the clause that acts, and the
      // *target* container holds the noun phrase it acts with — its subject noun and nothing
      // else, since a period with no verb is a bare noun phrase ("a word"). Sourced from the
      // control on the verb-phrase dotted box, so it carries no noun key: the target's own
      // subject is the instrument. Unlike the conditional and the coordination, which join two
      // *clauses*, this one pulls a noun phrase out into a period of its own.
      id: string;
      kind: 'instrumental';
      // How far the instrument is reified: an act in flow ("by choosing a word"), the act named
      // as a protocol ("with the choosing of a word"), or the thing it leaves behind ("with
      // a word"). It belongs to the *link*, not to either period: it is the relation between the
      // clause and its instrument. Absent ⇒ 'object'. See AbstractionLevel.
      level?: AbstractionLevel;
      source: { containerId: string };
      target: { containerId: string };
    };

/** Narrow a link to the relative kind (the default). */
export const isRelativeLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind?: 'relative' }> =>
  l.kind !== 'conditional' && l.kind !== 'coordinative' && l.kind !== 'instrumental';

/** Narrow a link to the conditional kind. */
export const isConditionalLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind: 'conditional' }> => l.kind === 'conditional';

/** Narrow a link to the coordinative kind. */
export const isCoordinativeLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind: 'coordinative' }> => l.kind === 'coordinative';

/** Narrow a link to the instrumental kind. */
export const isInstrumentalLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind: 'instrumental' }> => l.kind === 'instrumental';

// Pick-mode: awaiting a target click. A `relative` pick started from a source noun's satellite
// and lands on a target noun; a `conditional` pick started from a container's border control
// and lands on another container (which becomes the "if" clause); an `instrumental` pick started
// from the verb-phrase dotted box's control and lands on the container holding the instrument.
export type PickMode =
  | { active: false }
  | { active: true; kind: 'relative'; source: { containerId: string; nounKey: NounAddress } }
  | { active: true; kind: 'conditional'; source: { containerId: string } }
  | { active: true; kind: 'coordinative'; conjunction: CoordConjunction; source: { containerId: string } }
  | { active: true; kind: 'instrumental'; source: { containerId: string } };

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
  // the source noun's dotted box (line start) and the receiving dot on the target noun's
  // dotted box (line end). The workspace measures between these when present, else the boxes.
  registerSourceAnchor: (nounKey: NounAddress, el: HTMLElement | null) => void;
  registerTargetAnchor: (nounKey: NounAddress, el: HTMLElement | null) => void;
  // The border-control cluster: the endpoint the conditional/coordinative connector lines run
  // between (one anchor shared by both clause-level relations).
  registerBorderAnchor: (el: HTMLElement | null) => void;
  // The complement-toggle row on the verb-phrase dotted box — where an instrumental link
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
  instrumental: InstrumentalBinding;
}

// Wrap a container's `binding` for an embedded possessor sub-builder whose head is
// addressed `headPath`. The sub-builder speaks in its own internal noun keys (its head is
// `"subject"`); this maps that head onto `headPath` before forwarding to the container, so
// the possessor head registers/links under its workspace address. A possessor head is only
// ever a link *source* (relativising it), never a target, so target/dimming is suppressed,
// and it is never a clause endpoint, so both clause compartments are inert.
export function adaptPossessorBinding(
  root: WorkspaceBinding,
  headPath: NounAddress,
): WorkspaceBinding {
  const map = (nounKey: NounAddress): NounAddress =>
    nounKey === "subject" ? headPath : nounKey;
  return {
    containerId: root.containerId,
    pickActive: root.pickActive,
    geometry: {
      registerBox: (nounKey, el) => root.geometry.registerBox(map(nounKey), el),
      registerSourceAnchor: (nounKey, el) =>
        root.geometry.registerSourceAnchor(map(nounKey), el),
      registerTargetAnchor: (nounKey, el) =>
        root.geometry.registerTargetAnchor(map(nounKey), el),
      // A possessor sub-builder is never a clause endpoint, so it anchors no clause connector,
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
      onRemoveLink: (nounKey) => root.relative.onRemoveLink(map(nounKey)),
    },
    // Inert: a possessor sub-builder is never a conditional/coordinative endpoint.
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
    instrumental: {
      hasSource: false,
      hasTarget: false,
      level: 'object',
      onLevelChange: () => {},
      isPickTarget: false,
      onStart: () => {},
      onClear: () => {},
      onPick: () => {},
    },
  };
}
