import type { AbstractionLevel, Aspect, CauseSentiment, Concept, ComplementType, CoordConjunction, Definiteness, Degree, ImperativeRegister, ObjectPredication, PickerRole, ModifierRelation, PathSpecifier, Tense, UiStringKey, Voice } from "@signi/shared";
import { canCoordinateImperative } from "@signi/shared";
import type { TemporalRelation } from "@signi/shared";
import type { ClauseObject, SubordinatingConjunction } from "@signi/shared";

export type { AbstractionLevel, CoordConjunction };

// UI metadata for the coordinating conjunctions offered on the coordinative control: the catalog
// key of the word itself (`conjunction.value.*`, which each engine spells) and the key of the
// traditional grammatical name of the relation it sets up (`conjunction.kind.*`).
export const COORD_CONJUNCTION_OPTIONS: {
  value: CoordConjunction;
  labelKey: UiStringKey;
  hintKey: UiStringKey;
}[] = [
  { value: "and", labelKey: "conjunction.value.and", hintKey: "conjunction.kind.and" },
  { value: "or", labelKey: "conjunction.value.or", hintKey: "conjunction.kind.or" },
  { value: "but", labelKey: "conjunction.value.but", hintKey: "conjunction.kind.but" },
  { value: "that_is", labelKey: "conjunction.value.that_is", hintKey: "conjunction.kind.that_is" },
  { value: "therefore", labelKey: "conjunction.value.therefore", hintKey: "conjunction.kind.therefore" },
  { value: "then", labelKey: "conjunction.value.then", hintKey: "conjunction.kind.then" },
  { value: "however", labelKey: "conjunction.value.however", hintKey: "conjunction.kind.however" },
];

/**
 * The letter each conjunction answers to in the menu (the plan's §3.7). Mostly the initial of the
 * English name, with two taken elsewhere: "that is" goes by its *I* and "therefore" by its *S*,
 * because T is "then" and the two Ts would otherwise collide. The keys stay English whatever the
 * UI language, as every other shortcut does — a keyboard is not translated.
 */
export const COORD_CONJUNCTION_KEYS: Record<CoordConjunction, string> = {
  and: "A",
  or: "O",
  but: "B",
  that_is: "I",
  therefore: "S",
  then: "T",
  however: "H",
};

// The catalog key naming each conjunction, for the call sites that have a CoordConjunction rather
// than a menu row — the coordination control, the connector label, a coordinated clause's badge.
// The word itself comes from `useUiString`; only the key lives here (A15's `labelKey` convention).
export const COORD_CONJUNCTION_LABEL_KEY: Record<CoordConjunction, UiStringKey> =
  Object.fromEntries(
    COORD_CONJUNCTION_OPTIONS.map((o) => [o.value, o.labelKey]),
  ) as Record<CoordConjunction, UiStringKey>;

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

// The three subordinate clauses a period can take (P09-E12 D9), each a kind of link: its object
// clause ("says **that the cat runs**"), an adverbial clause a conjunction opens ("runs **when the
// cat eats**"), and its infinitive complement ("needs **to run**").
export type SubordinateKind = "content" | "adverbial" | "infinitive" | "purpose";

// One entry of the subordinate-clause menu: the link it starts, the conjunction an adverbial one
// carries, the catalog key of its word, and the letter it answers to while the menu is open. `that`
// is the object clause's complementizer; the infinitive has no word of its own in most of the seven
// (a bare infinitive, or the governing verb's own di / de), so it is named by the phrase it makes.
export interface SubordinateOption {
  link: SubordinateKind;
  conjunction?: SubordinatingConjunction;
  labelKey: UiStringKey;
  key: string;
}

export const SUBORDINATE_OPTIONS: readonly SubordinateOption[] = [
  { link: "content", labelKey: "subordinator.value.that", key: "T" },
  { link: "infinitive", labelKey: "infinitive.phrase", key: "O" },
  // P13: what the act is *for*, "to write content **to load it**" — any act has one, as any has a
  // time; **P** for purpose.
  { link: "purpose", labelKey: "clause.purpose", key: "P" },
  { link: "adverbial", conjunction: "when", labelKey: "subordinator.value.when", key: "W" },
  { link: "adverbial", conjunction: "while", labelKey: "subordinator.value.while", key: "H" },
  { link: "adverbial", conjunction: "because", labelKey: "subordinator.value.because", key: "C" },
  { link: "adverbial", conjunction: "after", labelKey: "subordinator.value.after", key: "A" },
  { link: "adverbial", conjunction: "before", labelKey: "subordinator.value.before", key: "B" },
  // P09-E27: **U**ntil, **S**ince, thou**G**h — T and H are taken by *that* and *while*.
  { link: "adverbial", conjunction: "until", labelKey: "subordinator.value.until", key: "U" },
  { link: "adverbial", conjunction: "since", labelKey: "subordinator.value.since", key: "S" },
  { link: "adverbial", conjunction: "though", labelKey: "subordinator.value.though", key: "G" },
  // Localization C41: the similative *as*, **L** for *like* — A and S are taken.
  { link: "adverbial", conjunction: "as", labelKey: "subordinator.value.as", key: "L" },
];

// The catalog key naming each subordinating conjunction, for the connector's label and the badge.
export const SUBORDINATOR_LABEL_KEY: Record<SubordinatingConjunction, UiStringKey> = {
  when: "subordinator.value.when",
  while: "subordinator.value.while",
  because: "subordinator.value.because",
  after: "subordinator.value.after",
  before: "subordinator.value.before",
  until: "subordinator.value.until",
  since: "subordinator.value.since",
  though: "subordinator.value.though",
  as: "subordinator.value.as",
};

// The catalog key naming a subordinate link by its word: *that*, the infinitive phrase, or its
// conjunction — for the control's tooltip, the connector's label and the clause's badge.
export const subordinateLabelKey = (s: {
  kind: SubordinateKind;
  conjunction?: SubordinatingConjunction;
}): UiStringKey =>
  s.kind === "content"
    ? "subordinator.value.that"
    : s.kind === "infinitive"
      ? "infinitive.phrase"
      : s.kind === "purpose"
        ? "clause.purpose"
        : SUBORDINATOR_LABEL_KEY[s.conjunction ?? "when"];

/**
 * What a period with no subject word makes of the clause it governs (P13) — read off the period, so
 * no control sets it and none can go stale:
 *  - `subject` — a period with a verb that says a subject (not a command, a citation, an existential
 *    or a question asking who): its that-clause stands where the subject would, "it is right **that
 *    one acts**" (SHOULD, MIGHT; PhrasePlan.contentSubject).
 *  - `adverb` — a period with neither a verb nor a subject: its adverbial clause is said alone, as the
 *    adverb it glosses, "**as one expects**" (OF_COURSE; PhrasePlan.adverbialGloss).
 */
export type SubordinateReading = "subject" | "adverb";

export function subordinateReading(
  sel: Pick<PhraseSelection, "verb" | "subject" | "infinitive" | "imperative" | "existential" | "questionRole">,
): SubordinateReading | undefined {
  if (sel.subject || sel.infinitive || sel.imperative) return undefined;
  if (!sel.verb) return "adverb";
  return sel.existential || sel.questionRole === "subject" ? undefined : "subject";
}

// The menu's entries for a period whose verb is `verb` and which holds, or not, a direct object:
// *that* only for a verb that takes a content clause and has no object (the clause *is* the object),
// or for a period with no subject, whose that-clause is its subject; *to* only for a verb that takes
// an infinitive; and the eight conjunctions whenever there is a verb. A period with no verb is
// offered the conjunctions alone if it has no subject either — its clause is an adverb's gloss — and
// nothing otherwise (see canStartSubordinate).
export function subordinateOptions(
  verb: { clauseObject?: ClauseObject } | undefined,
  hasObject: boolean,
  predicate?: { clauseObject?: ClauseObject },
  reading?: SubordinateReading,
): SubordinateOption[] {
  if (reading === "adverb") return SUBORDINATE_OPTIONS.filter((o) => o.link === "adverbial");
  if (!verb) return [];
  return SUBORDINATE_OPTIONS.filter((o) =>
    o.link === "content"
      ? reading === "subject" || (verb.clauseObject === "content" && !hasObject)
      : o.link === "infinitive"
        ? verb.clauseObject === "infinitive" || predicate?.clauseObject === "infinitive"
        : true,
  );
}

/**
 * Whether a period governs an infinitive: its verb does ("needs to act"), or — P13 — the adjective it
 * predicates does, "is **able to** act", "is **obliged to** act" (CAN, MUST): the adjective, not the
 * copula, takes the infinitive, with its own linker (it "capace **di**", "obbligato **a**").
 */
export const governsInfinitive = (sel: Pick<PhraseSelection, "verb" | "predicative">): boolean =>
  sel.verb?.clauseObject === "infinitive" || sel.predicative?.clauseObject === "infinitive";


/**
 * The complements that get a word box on the canvas — every one except those realized as a
 * cross-container link. The `instrumental` is the one such link today: its noun phrase lives in
 * a period container of its own, reached from the control on the verb-phrase dotted ring (see
 * PhraseLink's 'instrumental' kind), so it has no box, no adjective slots and no fields in the
 * selection. Everything keyed by "a noun block on this canvas" — slots, positions, number/gender
 * toggles, possessors — is keyed by this rather than by ComplementType.
 */
/**
 * The complements this canvas draws a box for: every one but the `instrumental`, which has a box,
 * but in a period container of its own, reached by a link (see LINKED_COMPLEMENT_TYPES). The last
 * plan-only complements got theirs with P13 (the object complement, the comitative) and P09-E44/E45
 * (the `role`, the `opponent`); a new one gets its selection fields below, as every other has them.
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
    roles: PickerRole[];
    color: "primary" | "secondary" | "success" | "warning" | "info" | "error";
}

// Which addressee an imperative command targets. The subject is dropped from the surface, but
// the person/number still selects the imperative form (tu vs "let's" vs plural). Default 2sg.
export type ImperativePerson = "2sg" | "1pl" | "2pl";

// The five slots a wh-question can ask about — the only gaps with a question word in every engine
// (see the engine's resolveQuestion): who / what, where, how, why.
export type QuestionRole = "subject" | "directObject" | "locative" | "manner" | "cause";
export const QUESTION_ROLES: readonly QuestionRole[] = ["subject", "directObject", "locative", "manner", "cause"];

// The person a selection's command agrees with (default 2sg). Still meaningful under the
// `instruction` register — the selector only greys it there, it does not forget it, so
// returning to an order restores the person the user last picked.
// How a verbless period's subject reads when it defines an adjective or an adverb (P13): as the
// dimension an adjective measures ("of great size", BIG), as a manner adverbial ("at high speed",
// FAST), or as the place, direction or time complement a clause would carry ("in a group", TOGETHER;
// "to a higher place", UP; "until this time", STILL). Each is a NounPhrase gloss flag in the plan.
export type PossessorRole = "whole" | "parts";
export const POSSESSOR_ROLES: readonly PossessorRole[] = ["whole", "parts"];

export type NounGloss = "dimension" | "manner" | "locative" | "direction" | "temporal";
export const NOUN_GLOSSES: readonly NounGloss[] = ["dimension", "manner", "locative", "direction", "temporal"];

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
    // When set, this period is an infinitive / citation phrase ("to consume food"). Like an
    // imperative it is a mood occupying the finite slot: the subject box becomes the infinitive box
    // and the subject is dropped by the engines, tense/aspect are forced present/neutral and modals
    // cleared. Mutually exclusive with `imperative` and with a conditional/coordination (the UI
    // enforces this). Unlike an imperative it addresses nobody, so it carries no person or register.
    infinitive?: boolean;
    // When set, this period is a **question** (P09-E12 M5, PhrasePlan.interrogative): the yes/no
    // question "does the cat eat?", or — with `questionRole` — a wh-question. The third mood toggle,
    // exclusive with the command and the infinitive, and like them locked while the period takes
    // part in a conditional or a coordination (a coordination's pair shares one force).
    interrogative?: boolean;
    // The slot a wh-question asks about (P09-E12 M6, PhrasePlan.questionRole): one per period, marked
    // on that slot's own dotted ring. Marking one sets `interrogative` too; turning the question off
    // clears it. The slot's word, if it holds one, is left out of the plan (the gap), and a subject
    // gap takes the throwaway subject the plan type needs (see `askQuestion`).
    questionRole?: QuestionRole;
    // Whether a subject or direct-object question asks *who* rather than *what* (PhrasePlan
    // .questionAnimate). Absent means the default, which is the held word's `human` — the who / what
    // chip on the marked ring sets it only when the user flips it (see `questionAnimateOf`).
    questionAnimate?: boolean;
    // When set, this period is an **existential**, "there is a cat" (P09-E12 M7, PhrasePlan
    // .existential): the subject is the pivot. Toggled on the subject's ring; it only reaches the
    // plan where the engine builds one (see `canBeExistential`).
    existential?: boolean;
    // How the subject of a verbless period reads (P13, see NounGloss), and the relation a time reading
    // says it with ("until this time"; absent ⇒ `at`). Only a verbless period says either: with a
    // verb the subject is the one who acts, and the plan leaves them out.
    subjectGloss?: NounGloss;
    subjectGlossRelation?: TemporalRelation;
    verb?: Concept;
    verbNegative?: boolean;
    verbTense?: Tense;
    // Grammatical aspect (neutral / progressive / prospective / resultative), orthogonal to
    // tense. Defaults to 'neutral' when absent.
    verbAspect?: Aspect;
    // Grammatical voice (active / passive). Defaults to 'active' when absent. Only a transitive
    // verb with a direct object can take the passive, which is what gates the satellite; the
    // translator normalises an impossible passive back to active whatever the selection says.
    verbVoice?: Voice;
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
    // Each modal may also carry its own negation, exactly as the main verb carries `verbNegative`
    // — "I do not want to not go" is `verbModal` = WILL with `verbModalNegative` over the verb GO
    // with `verbNegative`. Each denies one word of the group, and each is revealed once its modal
    // holds a word. `verbNegative` is the MAIN VERB's: under a modal it says "to not go", and the
    // modal's own "do not want" is here (see `ModalVerb.negative`).
    verbModalNegative?: boolean;
    verbModal2Negative?: boolean;
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
    // The same relation set for the locative complement — what lets it say "under the bed" or
    // "behind the tree" rather than only the containment it falls back on. Route and locative
    // share the relations but not the default (through vs in), so they need separate keys.
    locativeSpecifier?: PathSpecifier;
    // And the direction's (P13): a goal reached *into* or *onto* it — JUMP is "to move oneself into
    // the air". Absent ⇒ the plain goal, "to".
    directionSpecifier?: PathSpecifier;
    // The time of the act ("runs *on this day*", P09-E12b) — a full noun phrase like the motion
    // complements, offered on every verb (ADJUNCT_COMPLEMENT_TYPES). Its relation (at / ago / until
    // / after / before / during) is the box's toolbar, as the route's path is; absent means `at`.
    temporal?: Concept;
    temporalNumber?: "singular" | "plural";
    temporalGender?: "masc" | "fem" | "neut";
    temporalAdjective?: Concept;
    temporalAdjective2?: Concept;
    temporalAdjective3?: Concept;
    temporalRelation?: TemporalRelation;
    // The beneficiary or goal ("reads *for the man*", P09-E2), offered on every verb like the
    // temporal, and the topic ("thinks *about the cat*"), which only SPEAK and THINK license. Plain
    // boxes: no relation to choose, and each takes a pronoun behind its adposition ("for her").
    purpose?: Concept;
    purposeNumber?: "singular" | "plural";
    purposeGender?: "masc" | "fem" | "neut";
    purposeAdjective?: Concept;
    purposeAdjective2?: Concept;
    purposeAdjective3?: Concept;
    topic?: Concept;
    topicNumber?: "singular" | "plural";
    topicGender?: "masc" | "fem" | "neut";
    topicAdjective?: Concept;
    topicAdjective2?: Concept;
    topicAdjective3?: Concept;
    // Cause / reason adjunct ("cried because of the dog"). Its one specifier is the
    // affective sentiment — neutral (because of) / negative (fault of) / positive (thanks to),
    // selected on the cause dotted ring. Defaults to 'neutral' when absent.
    cause?: Concept;
    causeNumber?: "singular" | "plural";
    causeGender?: "masc" | "fem" | "neut";
    causeAdjective?: Concept;
    causeAdjective2?: Concept;
    causeAdjective3?: Concept;
    causeSentiment?: CauseSentiment;
    // Whether the cause is *denied* rather than named — "not because of the dog", which says the
    // act happened and this was not the reason. A second axis, independent of the sentiment: a
    // credit can be denied too ("not thanks to the dog"). It is the complement's own negation and
    // not the clause's, so it does not touch `verbNegative` (see `Complement.negative`).
    causeNegative?: boolean;
    // The instrumental complement has no fields here: its noun phrase lives in a period
    // container of its own, linked from the verb-phrase dotted ring (see BoxComplementType and
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
    // What the object is taken as or turned into (P13, the object complement): "to have **as** a part"
    // (the essive, INCLUDE), "to transform a period **into** a command" (the factitive, TRANSFORM). Its
    // `objectPredicativePredication` says which; absent, the verb's own — the factitive where the verb
    // licenses the complement, the essive where the complement is an adjunct of its object.
    objectPredicative?: Concept;
    objectPredicativeNumber?: "singular" | "plural";
    objectPredicativeGender?: "masc" | "fem" | "neut";
    objectPredicativeAdjective?: Concept;
    objectPredicativeAdjective2?: Concept;
    objectPredicativeAdjective3?: Concept;
    objectPredicativePredication?: ObjectPredication;
    // The companion ("goes **with a person**", ACCOMPANY; P13): an adjunct any act takes.
    comitative?: Concept;
    comitativeNumber?: "singular" | "plural";
    comitativeGender?: "masc" | "fem" | "neut";
    comitativeAdjective?: Concept;
    comitativeAdjective2?: Concept;
    comitativeAdjective3?: Concept;
    // The capacity the subject acts in ("acts **as a friend**", ACT, WORK_LABOUR; P09-E44): a noun
    // head only, bare in six languages, its gender the user's (nothing infers it from the subject).
    role?: Concept;
    roleNumber?: "singular" | "plural";
    roleGender?: "masc" | "fem" | "neut";
    roleAdjective?: Concept;
    roleAdjective2?: Concept;
    roleAdjective3?: Concept;
    // The party the act is directed against ("plays **against the dog**", PLAY_GAME, WIN, LOSE_GAME;
    // P09-E45): a noun or a pronoun ("against him"). Its word is the verb's (`opponent_prep`), so the
    // box holds only the noun; no negation, which the engine ignores here.
    opponent?: Concept;
    opponentNumber?: "singular" | "plural";
    opponentGender?: "masc" | "fem" | "neut";
    opponentAdjective?: Concept;
    opponentAdjective2?: Concept;
    opponentAdjective3?: Concept;
    // Adverbial of manner ("runs *at the speed of light*", "cuts *with care*"). A full noun
    // phrase, like the motion complements. Its preposition is not a field here: it follows the
    // head noun's semantic manner relation (SPEED→"at", CARE→"with"), resolved in the engine.
    manner?: Concept;
    mannerNumber?: "singular" | "plural";
    mannerGender?: "masc" | "fem" | "neut";
    mannerAdjective?: Concept;
    mannerAdjective2?: Concept;
    mannerAdjective3?: Concept;
    // Semantic relation for any adjective slot whose picked concept is a *noun* used
    // attributively ("sail boat"). Keyed by the adjective slot key (e.g. "subjectAdjective").
    // Only consulted when that slot holds a noun; adjective concepts ignore it. Defaults
    // to 'feature'. See NounModifier / ModifierRelation in @signi/shared.
    modifierRelations?: Partial<Record<string, ModifierRelation>>;
    // What a noun's genitive possessor is to it, keyed by the noun block (P13, NounPhrase
    // .possessorRole): the whole it is a part of ("a part of a place", AREA) or the parts it is made
    // up of ("a group of relatives", FAMILY). Absent ⇒ the owner. Only English says the difference,
    // with an of-phrase where the owner takes the Saxon genitive.
    possessorRoles?: Partial<Record<string, PossessorRole>>;
    // A cardinal numeral counting a noun, keyed by the noun block (P13, NounPhrase.numeral): DAY is "a
    // period of **24** hours". A value beside the determiner, as the engine has it.
    numerals?: Partial<Record<string, number>>;
    // A *this* / *that* determiner pointing at one of a set, away from the rest (P13,
    // NounPhrase.contrastive): THERE is "in *that* place", French "dans ce lieu-là". Keyed by the noun
    // block; only held while the determiner is one of the two.
    contrastives?: Partial<Record<string, boolean>>;
    // An approximator on the noun's quantity (P09-E49, NounPhrase.approximator): "*about* five cats",
    // "*almost* all cats". Keyed by the noun block; a flag, its word derived from the quantity by
    // `approximatorFor`, and only held while that quantity takes one.
    approximators?: Partial<Record<string, true>>;
    // An "and" pair spelled with its correlative, "*both* the cat *and* the dog" (P09-E46,
    // NounGroup.correlative). Keyed by the noun block whose group it spells; only held while that
    // group is a pair joined by "and" — a third conjunct, a removal or "or" drops it.
    correlatives?: Partial<Record<string, true>>;
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
    // The standard of comparison of the predicate adjective ("bigger *than the dog*", P09-E12 D5):
    // a nested noun phrase whose head is its `subject`, the possessor's shape, which becomes
    // NounPhrase.headStandard. Offered while the predicative holds an adjective whose degree takes
    // one (STANDARD_DEGREES); kept when the degree moves off those — the plan leaves it out there,
    // and the canvas dims its ring — so the user's word survives a pass through the positive.
    predicativeStandard?: PhraseSelection;
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
    // Every noun block coordinates (see COORDINABLE_NOUN_KEYS), the prepositional complements
    // included: each language's engine decides per conjunct whether its adposition repeats.
    subjectConjuncts?: PhraseSelection[];
    directObjectConjuncts?: PhraseSelection[];
    predicativeConjuncts?: PhraseSelection[];
    locativeConjuncts?: PhraseSelection[];
    directionConjuncts?: PhraseSelection[];
    sourceConjuncts?: PhraseSelection[];
    routeConjuncts?: PhraseSelection[];
    temporalConjuncts?: PhraseSelection[];
    purposeConjuncts?: PhraseSelection[];
    topicConjuncts?: PhraseSelection[];
    causeConjuncts?: PhraseSelection[];
    terminusConjuncts?: PhraseSelection[];
    mannerConjuncts?: PhraseSelection[];
    objectPredicativeConjuncts?: PhraseSelection[];
    comitativeConjuncts?: PhraseSelection[];
    roleConjuncts?: PhraseSelection[];
    opponentConjuncts?: PhraseSelection[];
    // The one conjunction joining a block's whole group (default 'and'). Only `and` / `or` join
    // noun phrases — see NOUN_COORD_CONJUNCTIONS.
    subjectConjunction?: CoordConjunction;
    directObjectConjunction?: CoordConjunction;
    predicativeConjunction?: CoordConjunction;
    locativeConjunction?: CoordConjunction;
    directionConjunction?: CoordConjunction;
    sourceConjunction?: CoordConjunction;
    routeConjunction?: CoordConjunction;
    temporalConjunction?: CoordConjunction;
    purposeConjunction?: CoordConjunction;
    topicConjunction?: CoordConjunction;
    causeConjunction?: CoordConjunction;
    terminusConjunction?: CoordConjunction;
    mannerConjunction?: CoordConjunction;
    objectPredicativeConjunction?: CoordConjunction;
    comitativeConjunction?: CoordConjunction;
    roleConjunction?: CoordConjunction;
    opponentConjunction?: CoordConjunction;
    subjectPossessor?: PhraseSelection;
    directObjectPossessor?: PhraseSelection;
    predicativePossessor?: PhraseSelection;
    locativePossessor?: PhraseSelection;
    directionPossessor?: PhraseSelection;
    sourcePossessor?: PhraseSelection;
    routePossessor?: PhraseSelection;
    temporalPossessor?: PhraseSelection;
    purposePossessor?: PhraseSelection;
    topicPossessor?: PhraseSelection;
    causePossessor?: PhraseSelection;
    terminusPossessor?: PhraseSelection;
    mannerPossessor?: PhraseSelection;
    objectPredicativePossessor?: PhraseSelection;
    comitativePossessor?: PhraseSelection;
    rolePossessor?: PhraseSelection;
    opponentPossessor?: PhraseSelection;
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
    temporalPossessorRef?: NounAddress;
    purposePossessorRef?: NounAddress;
    topicPossessorRef?: NounAddress;
    causePossessorRef?: NounAddress;
    terminusPossessorRef?: NounAddress;
    mannerPossessorRef?: NounAddress;
    objectPredicativePossessorRef?: NounAddress;
    comitativePossessorRef?: NounAddress;
    rolePossessorRef?: NounAddress;
    opponentPossessorRef?: NounAddress;
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
// `subject/conjunct/0/possessor`. The predicate adjective's standard of comparison is
// `predicative/standard`. Only *sources* use the suffixes today (relativising a
// possessor or a conjunct head); targets are always plain `NounKey`.
export type NounAddress = string;

// The slot of a relative clause's period its head fills (P13, RelativeClause.headRole): one of its
// nouns; its instrument, which has no box of its own ("an object **with which** one goes", CAR); or
// the possessor of its subject, the genitive relative ("a word **whose** meaning …", HYPERNYM).
export type RelativeGap = NounKey | "instrumental" | "subject/possessor";

// Append a `/possessor` step to a noun address — the address of that noun's possessor head.
export const possessorAddress = (base: NounAddress): NounAddress => `${base}/possessor`;

// Append a `/standard` step — the address of the head of that noun's standard of comparison
// (`predicative/standard`, P09-E12 D5). Only the predicate adjective takes one.
export const standardAddress = (base: NounAddress): NounAddress => `${base}/standard`;

// Append a `/conjunct/<i>` step — the address of the i-th *extra* conjunct of that noun.
export const conjunctAddress = (base: NounAddress, i: number): NounAddress =>
  `${base}/conjunct/${i}`;

// The address of noun `which` in a builder whose head sits at `headPath` — undefined for a
// top-level container, whose nouns are their own addresses. A nested (owner or conjunct)
// builder's head is its `subject`. It draws no other noun, but should one reach it (a slice saved
// with a verb phrase) it is no part of the period's plan, so it gets an address of its own under the
// head, which resolves to nothing, rather than the container's own noun of the same key.
export const builderNounAddress = (
  headPath: NounAddress | undefined,
  which: NounKey,
): NounAddress =>
  headPath === undefined ? which : which === "subject" ? headPath : `${headPath}/${which}`;

export const POSSESSOR_KEY = (which: NounKey) =>
  `${which}Possessor` as keyof PhraseSelection;

export const POSSESSOR_REF_KEY = (which: NounKey) =>
  `${which}PossessorRef` as keyof PhraseSelection;

export const STANDARD_KEY = (which: NounKey) =>
  `${which}Standard` as keyof PhraseSelection;

export const CONJUNCTS_KEY = (which: NounKey) =>
  `${which}Conjuncts` as keyof PhraseSelection;

export const CONJUNCTION_KEY = (which: NounKey) =>
  `${which}Conjunction` as keyof PhraseSelection;

export type SlotKey = SlotConfig["key"];

// ── Word-category switch ─────────────────────────────────────────────────────
// Some slots accept a word from one of two lexical classes: the subject, the direct object
// and the causal complement take a noun or a pronoun; the subject complement and every
// adjective slot take a noun or an adjective. The chosen class is shown in two synced places —
// a toggle *on the empty box*, and the category selector *inside the open word picker*. It only
// chooses which vocabulary is searched; the picked concept's own `role` is what downstream
// code reads. A single-vocabulary slot (verb, adverb, the motion complements, …) returns null.
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
  // The direct object takes a pronoun on the same footing as the subject ("I see you"), and
  // the causal, purpose and topic complements take one behind their adposition ("because of him",
  // "for her", "about him" — the engine's TONIC_COMPLEMENTS), as do the companion and the opponent
  // ("with her", "against him").
  if (slotKey === "directObject" || slotKey === "cause" || slotKey === "purpose" || slotKey === "topic" || slotKey === "comitative" || slotKey === "opponent")
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
      target: { containerId: string; nounKey: RelativeGap };
      // Whether the clause is said *alone*, its head unspoken — "that has no problems" for OKAY, an
      // adjective's definition (P13, NounPhrase.relativeGloss). The head still picks the relativizer
      // and the agreement, so it stays in its box. Absent ⇒ the head is said.
      headless?: boolean;
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
  // The subordinate clauses (P09-E12 D9): the *source* is the governing clause (its border control
  // was clicked), the *target* the period that becomes its object clause, its adverbial clause —
  // opened by `conjunction` — or its infinitive complement. One per governing clause.
  | {
      id: string;
      kind: 'content';
      source: { containerId: string };
      target: { containerId: string };
    }
  | {
      id: string;
      kind: 'adverbial';
      conjunction: SubordinatingConjunction;
      source: { containerId: string };
      target: { containerId: string };
    }
  // A clause of purpose (P13, PhrasePlan.purpose): what the act is done for, "to write content **to
  // load it**". Like the infinitive its subject is the governing clause's, and it is drawn in the
  // infinitive; unlike it, nothing licenses it — any act has a purpose.
  | {
      id: string;
      kind: 'purpose';
      source: { containerId: string };
      target: { containerId: string };
    }
  | {
      id: string;
      kind: 'infinitive';
      // Whose infinitive it is (P13, InfinitiveControl): the governing clause's subject by default, or —
      // `object` — its object, the causee of a causative: "to cause **a person** to see objects" (DO,
      // PUT, BRING…), where the person sees.
      control?: 'object';
      source: { containerId: string };
      target: { containerId: string };
    }
  | {
      // The instrumental complement: the *source* container is the clause that acts, and the
      // *target* container holds the noun phrase it acts with — its subject noun and nothing
      // else, since a period with no verb is a bare noun phrase ("a word"). Sourced from the
      // control on the verb-phrase dotted ring, so it carries no noun key: the target's own
      // subject is the instrument. Unlike the conditional and the coordination, which join two
      // *clauses*, this one pulls a noun phrase out into a period of its own.
      id: string;
      kind: 'instrumental';
      // How far the instrument is reified: an act in flow ("by choosing a word"), the act named
      // as a protocol ("with the choosing of a word"), or the thing it leaves behind ("with
      // a word"). It belongs to the *link*, not to either period: it is the relation between the
      // clause and its instrument. Absent ⇒ 'object'. See AbstractionLevel.
      level?: AbstractionLevel;
      // Whether the instrument is *denied* — the privative, "cuts **without** the knife" (P09-E2).
      // It belongs to the link for the reason the level does: it is the relation between the clause
      // and its instrument, not a property of either period. Absent ⇒ the plain means. It is the
      // instrument's own negation, as `causeNegative` is the cause's, and never the clause's.
      negative?: boolean;
      source: { containerId: string };
      target: { containerId: string };
    };

/** Narrow a link to the relative kind (the default). */
export const isRelativeLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind?: 'relative' }> =>
  l.kind !== 'conditional' &&
  l.kind !== 'coordinative' &&
  !isSubordinateLink(l) &&
  l.kind !== 'instrumental';

/** Narrow a link to the conditional kind. */
export const isConditionalLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind: 'conditional' }> => l.kind === 'conditional';

/** Narrow a link to the coordinative kind. */
export const isCoordinativeLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind: 'coordinative' }> => l.kind === 'coordinative';

/** Narrow a link to one of the three subordinate kinds (content, adverbial, infinitive). */
export const isSubordinateLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind: SubordinateKind }> =>
  l.kind === 'content' || l.kind === 'adverbial' || l.kind === 'infinitive' || l.kind === 'purpose';

/** Narrow a link to the instrumental kind. */
export const isInstrumentalLink = (
  l: PhraseLink,
): l is Extract<PhraseLink, { kind: 'instrumental' }> => l.kind === 'instrumental';

// Pick-mode: awaiting a target click. A `relative` pick started from a source noun's satellite
// and lands on a target noun; a `conditional` pick started from a container's border control
// and lands on another container (which becomes the "if" clause); an `instrumental` pick started
// from the verb-phrase dotted ring's control and lands on the container holding the instrument.
export type PickMode =
  | { active: false }
  | { active: true; kind: 'relative'; source: { containerId: string; nounKey: NounAddress } }
  | { active: true; kind: 'conditional'; source: { containerId: string } }
  | { active: true; kind: 'coordinative'; conjunction: CoordConjunction; source: { containerId: string } }
  | {
      active: true;
      kind: 'subordinate';
      link: SubordinateKind;
      conjunction?: SubordinatingConjunction;
      source: { containerId: string };
    }
  | { active: true; kind: 'instrumental'; source: { containerId: string } };

