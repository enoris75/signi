import type {
  AbstractionLevel,
  Complement,
  ComplementType,
  Concept,
  ContentClause,
  InfinitiveComplement,
  ModalRef,
  NounElement,
  NounGroup,
  NounPhrase,
  PhrasePlan,
  PurposeClause,
  RelativeClause,
  VerbPhrase,
} from "@signi/shared";
import { DEFAULT_TEMPORAL_RELATION, DETERMINER_COMPLEMENT_TYPES } from "@signi/shared";
import type { NounAddress, NounKey, PhraseContainer, PhraseLink, PhraseSelection, RelativeGap } from "../../interfaces.ts";
import { conjunctAddress, governsInfinitive, possessorAddress, standardAddress } from "../../interfaces.ts";
import { adjectiveSlots, BOX_COMPLEMENT_TYPES, defaultPredication, MODAL_SLOTS, modalAdverbFor, modalNegativeFor } from "../../slots.ts";

/**
 * What `planToWorkspace` built, and what of the plan it could not: each field no canvas control
 * holds, named as `Type.field` (`NounPhrase.relativeGloss`, `complements.comitative`), so a caller
 * can tell a plan the workspace says whole from one it says in part.
 */
export interface PlanWorkspace {
  containers: PhraseContainer[];
  links: PhraseLink[];
  unsupported: string[];
}

/**
 * The workspace whose `workspaceToPlans` is `plan` — the inverse of the canvas's serialisation, and
 * how a plan written anywhere else (a seed's definition, P13) is opened on the canvas or printed in
 * the console language. The root period is `p1`; each linked period follows in the order its link
 * is met, and every relative clause, instrument, condition, coordinate and subordinate clause is a
 * period of its own joined by the link the canvas would have drawn.
 *
 * Words are looked up with `conceptOf`, since a selection holds the concept and not its id. A plan
 * field the canvas has no control for is left out of the workspace and named in `unsupported`, so
 * the workspace is then the plan without it.
 */
export function planToWorkspace(plan: PhrasePlan, conceptOf: (id: string) => Concept | undefined): PlanWorkspace {
  const b = new Builder(conceptOf);
  b.period(plan);
  return { containers: b.containers, links: b.links, unsupported: [...b.unsupported].sort() };
}

type Clause = Pick<PhrasePlan, "subject" | "verbPhrase" | "directObject" | "complements">;

/** A link before it has an id, kind by kind. */
type NewLink = PhraseLink extends infer L ? (L extends PhraseLink ? Omit<L, "id"> : never) : never;

// The fields of each plan type the workspace holds; any other set field is reported (see `check`).
const PERIOD_FIELDS = new Set([
  "subject", "verbPhrase", "directObject", "complements", "condition", "coordination", "interrogative",
  "existential", "imperative", "imperativeRegister", "infinitive", "contentObject", "adverbialClause",
  "infinitiveComplement", "purpose",
]);
const NOUN_FIELDS = new Set([
  "concept", "number", "gender", "definiteness", "adjectives", "adjectiveDegrees", "headDegree",
  "headStandard", "nounModifiers", "relative", "relativeGloss", "possessor", "dimensionGloss", "mannerGloss",
  "complementGloss", "possessorRole", "antecedent",
]);
const GROUP_FIELDS = new Set(["conjuncts", "conjunction"]);
const VERB_FIELDS = new Set(["verb", "negative", "modifier", "tense", "aspect", "voice", "modals"]);
const RELATIVE_FIELDS = new Set(["headRole", "headSpecifiers", "subject", "verbPhrase", "directObject", "complements"]);
const INFINITIVE_FIELDS = new Set(["verbPhrase", "directObject", "complements", "control", "infinitiveComplement"]);
const CLAUSE_FIELDS = new Set(["subject", "verbPhrase", "directObject", "complements"]);

const isSet = (v: unknown) => v !== undefined && v !== false && !(Array.isArray(v) && v.length === 0);
const isGroup = (el: NounElement): el is NounGroup => "conjuncts" in el;
const set = (sel: PhraseSelection, key: string, value: unknown) => {
  if (value !== undefined) (sel as Record<string, unknown>)[key] = value;
};

class Builder {
  containers: PhraseContainer[] = [];
  links: PhraseLink[] = [];
  unsupported = new Set<string>();
  private n = 0;
  // The one antecedent a pronoun may carry where it is being built: a purpose clause's object's (P13).
  private antecedentAllowed: string | undefined;
  constructor(private readonly conceptOf: (id: string) => Concept | undefined) {}

  private concept(id: string): Concept | undefined {
    const c = this.conceptOf(id);
    if (!c) this.unsupported.add(`unknown concept ${id}`);
    return c;
  }

  private check(type: string, obj: object, handled: Set<string>): void {
    for (const [k, v] of Object.entries(obj)) if (!handled.has(k) && isSet(v)) this.unsupported.add(`${type}.${k}`);
  }

  private open(selection: PhraseSelection = {}): PhraseContainer {
    const c = { id: `p${++this.n}`, selection };
    this.containers.push(c);
    return c;
  }

  private link(link: NewLink): void {
    this.links.push({ id: `l${this.links.length + 1}`, ...link } as PhraseLink);
  }

  /** A period of its own: a root, a condition or a coordinate. Returns its container. */
  period(plan: PhrasePlan): PhraseContainer {
    this.check("PhrasePlan", plan, PERIOD_FIELDS);
    const c = this.open();
    const sel = c.selection;
    if (plan.imperative) {
      sel.imperative = true;
      set(sel, "imperativeRegister", plan.imperativeRegister);
      const s = plan.subject as NounPhrase;
      sel.imperativePerson = s.concept === "FIRST_PERSON" ? "1pl" : s.number === "plural" ? "2pl" : "2sg";
    }
    if (plan.infinitive) sel.infinitive = true;
    if (plan.interrogative) sel.interrogative = true;
    if (plan.existential) sel.existential = true;
    // A command's and a citation's subject is the placeholder the mood puts there, not a word.
    const subject = plan.imperative || plan.infinitive ? undefined : plan.subject;
    this.clause(c, { ...plan, subject });
    if (plan.condition) this.link({ kind: "conditional", source: { containerId: c.id }, target: { containerId: this.period(plan.condition).id } });
    if (plan.coordination) {
      const second = this.period(plan.coordination.clause);
      // A command's coordinate shares its mood, which the serialiser gives it back.
      if (plan.imperative) {
        delete second.selection.imperative;
        delete second.selection.imperativePerson;
        delete second.selection.imperativeRegister;
      }
      this.link({ kind: "coordinative", conjunction: plan.coordination.conjunction, source: { containerId: c.id }, target: { containerId: second.id } });
    }
    if (plan.contentObject) this.subordinate(c, "content", plan.contentObject);
    if (plan.purpose) this.purpose(c, plan.purpose, plan.directObject);
    if (plan.adverbialClause) this.subordinate(c, "adverbial", plan.adverbialClause.clause, plan.adverbialClause.conjunction);
    if (plan.infinitiveComplement) {
      // Only a verb that governs an infinitive takes one on the canvas; "to be able to act" is
      // governed by the predicate adjective instead.
      if (governsInfinitive(sel)) this.infinitive(c, plan.infinitiveComplement);
      else this.unsupported.add("PhrasePlan.infinitiveComplement governed by the predicate");
    }
    return c;
  }

  private subordinate(main: PhraseContainer, kind: "content" | "adverbial", clause: ContentClause, conjunction?: string): void {
    this.check("ContentClause", clause, CLAUSE_FIELDS);
    const c = this.open();
    this.clause(c, clause);
    this.link({ kind, ...(conjunction ? { conjunction } : {}), source: { containerId: main.id }, target: { containerId: c.id } } as NewLink);
  }

  // A clause of purpose (P13): a period in the infinitive, linked as the governing clause's purpose.
  // A third-person pronoun object in it stands for that clause's object, which the serialiser gives
  // it as its antecedent — so an antecedent anything else is not said.
  private purpose(main: PhraseContainer, clause: PurposeClause, governing: NounElement | undefined): void {
    this.check("PurposeClause", clause, INFINITIVE_FIELDS);
    const c = this.open({ infinitive: true });
    this.antecedentAllowed = governing && !("conjuncts" in governing) ? governing.concept : undefined;
    this.clause(c, { subject: undefined as unknown as NounElement, ...clause });
    this.antecedentAllowed = undefined;
    this.link({ kind: "purpose", source: { containerId: main.id }, target: { containerId: c.id } });
  }

  private infinitive(main: PhraseContainer, inf: InfinitiveComplement): void {
    this.check("InfinitiveComplement", inf, INFINITIVE_FIELDS);
    const c = this.open({ infinitive: true });
    this.clause(c, { subject: undefined as unknown as NounElement, ...inf });
    this.link({
      kind: "infinitive",
      ...(inf.control === "object" ? { control: "object" as const } : {}),
      source: { containerId: main.id },
      target: { containerId: c.id },
    });
    // Its own infinitive (P13), where what it predicates governs one.
    if (inf.infinitiveComplement) {
      if (governsInfinitive(c.selection)) this.infinitive(c, inf.infinitiveComplement);
      else this.unsupported.add("PhrasePlan.infinitiveComplement governed by the predicate");
    }
  }

  /** The words of a clause into a container's selection, and the periods its nouns' links lead to. */
  private clause(c: PhraseContainer, clause: Partial<Clause>): void {
    const sel = c.selection;
    if (clause.subject) this.noun(c, sel, "subject", clause.subject, "subject");
    if (clause.verbPhrase) this.verb(sel, clause.verbPhrase);
    if (clause.directObject) this.noun(c, sel, "directObject", clause.directObject, "directObject");
    for (const [type, complement] of Object.entries(clause.complements ?? {}) as [ComplementType, Complement][]) {
      if (complement) this.complement(c, type, complement);
    }
  }

  private verb(sel: PhraseSelection, vp: VerbPhrase): void {
    this.check("VerbPhrase", vp, VERB_FIELDS);
    const verb = this.concept(vp.verb);
    if (!verb) return;
    sel.verb = verb;
    if (vp.negative) sel.verbNegative = true;
    set(sel, "verbTense", vp.tense);
    set(sel, "verbAspect", vp.aspect);
    set(sel, "verbVoice", vp.voice);
    if (vp.modifier) set(sel, "modifier", this.concept(vp.modifier));
    const modals = vp.modals ?? [];
    if (modals.length > MODAL_SLOTS.length) this.unsupported.add(`VerbPhrase.modals > ${MODAL_SLOTS.length}`);
    modals.slice(0, MODAL_SLOTS.length).forEach((m: ModalRef, i) => {
      const slot = MODAL_SLOTS[i]!;
      const modal = typeof m === "string" ? { verb: m } : m;
      set(sel, slot, this.concept(modal.verb));
      if (modal.modifier) set(sel, modalAdverbFor(slot)!, this.concept(modal.modifier));
      if (modal.negative) set(sel, modalNegativeFor(slot)!, true);
    });
  }

  private complement(c: PhraseContainer, type: ComplementType, complement: Complement): void {
    const sel = c.selection;
    if (type === "instrumental") return this.instrument(c, complement);
    if (!(BOX_COMPLEMENT_TYPES as ComplementType[]).includes(type)) {
      this.unsupported.add(`complements.${type}`);
      return;
    }
    const handled = new Set(["phrase", "specifiers", ...(type === "cause" ? ["negative"] : [])]);
    // A plan says the essive and leaves the factitive unsaid; where the verb's default is the essive,
    // an unsaid predication is a factitive the period must hold.
    if (type === "objectPredicative" && !complement.specifiers?.some((s) => s.kind === "predication") && defaultPredication(sel.verb) === "essive")
      sel.objectPredicativePredication = "factitive";
    this.check(`complements.${type}`, complement, handled);
    this.noun(c, sel, type as NounKey, complement.phrase, type);
    if (complement.negative && type === "cause") sel.causeNegative = true;
    for (const s of complement.specifiers ?? []) {
      if (s.kind === "path" && (type === "route" || type === "locative" || type === "direction")) set(sel, `${type}Specifier`, s.value);
      else if (s.kind === "temporal" && type === "temporal") {
        if (s.value !== DEFAULT_TEMPORAL_RELATION) sel.temporalRelation = s.value;
      } else if (s.kind === "sentiment" && type === "cause") {
        if (s.value !== "neutral") sel.causeSentiment = s.value;
      } else if (s.kind === "predication" && type === "objectPredicative") {
        // Held only where it is not what the verb says by default (see defaultPredication).
        if (s.value !== defaultPredication(sel.verb)) sel.objectPredicativePredication = s.value;
      } else this.unsupported.add(`complements.${type}.specifiers.${s.kind}`);
    }
  }

  // The instrument is a period of its own: its subject is the thing, or — at an action level — its
  // verb and object are the act and what it is done to (see attachInstrumental).
  private instrument(main: PhraseContainer, complement: Complement): void {
    this.check("complements.instrumental", complement, new Set(["phrase", "specifiers", "negative", "action"]));
    const level = complement.specifiers?.find((s) => s.kind === "abstraction")?.value as AbstractionLevel | undefined;
    const c = this.open();
    if (complement.action) {
      this.verb(c.selection, complement.action);
      this.noun(c, c.selection, "directObject", complement.phrase, "directObject");
    } else this.noun(c, c.selection, "subject", complement.phrase, "subject");
    this.link({
      kind: "instrumental",
      ...(level && level !== "object" ? { level } : {}),
      ...(complement.negative ? { negative: true } : {}),
      source: { containerId: main.id },
      target: { containerId: c.id },
    } as NewLink);
  }

  /**
   * A noun element into the `which` block of `sel` — a slot of a period, or the `subject` of a nested
   * selection (a possessor, a conjunct, a standard). `address` is where it sits in the period `c`,
   * which a relative clause's link starts from.
   */
  private noun(c: PhraseContainer, sel: PhraseSelection, which: NounKey, el: NounElement, address: NounAddress): void {
    if (isGroup(el)) {
      this.check("NounGroup", el, GROUP_FIELDS);
      const [first, ...rest] = el.conjuncts;
      if (!first) return;
      // A conjunct's box holds a noun — or, beside a predicate, an adjective too (P13).
      if (which !== "predicative" && el.conjuncts.some((np) => this.conceptOf(np.concept)?.role === "adjective")) {
        this.unsupported.add("NounGroup of adjectives");
        return;
      }
      this.phrase(c, sel, which, first, address);
      set(sel, `${which}Conjuncts`, rest.map((np, i) => {
        const conjunct: PhraseSelection = {};
        this.phrase(c, conjunct, "subject", np, conjunctAddress(address, i));
        return conjunct;
      }));
      if (el.conjunction !== "and") set(sel, `${which}Conjunction`, el.conjunction);
      return;
    }
    this.phrase(c, sel, which, el, address);
  }

  private phrase(c: PhraseContainer, sel: PhraseSelection, which: NounKey, np: NounPhrase, address: NounAddress): void {
    this.check("NounPhrase", np, NOUN_FIELDS);
    const head = this.concept(np.concept);
    if (!head) return;
    if (np.antecedent && (np.antecedent !== this.antecedentAllowed || which !== "directObject"))
      this.unsupported.add("NounPhrase.antecedent");
    set(sel, which, head);
    set(sel, `${which}Number`, np.number);
    set(sel, `${which}Gender`, np.gender);
    // The core slots and the complements a determiner reaches (DETERMINER_COMPLEMENT_TYPES) hold one.
    if (np.definiteness) {
      if (which === "subject" || which === "directObject" || DETERMINER_COMPLEMENT_TYPES.includes(which as ComplementType))
        set(sel, `${which}Definiteness`, np.definiteness);
      else this.unsupported.add(`complements.${which}.definiteness`);
    }
    if (np.headDegree && np.headDegree !== "positive") sel.adjectiveDegrees = { ...sel.adjectiveDegrees, [which]: np.headDegree };
    if (np.headStandard) {
      const standard: PhraseSelection = {};
      this.noun(c, standard, "subject", np.headStandard, standardAddress(address));
      set(sel, `${which}Standard`, standard);
    }
    this.modifiers(sel, which, np);
    if (np.possessor) {
      if ("kind" in np.possessor) this.unsupported.add(`Possessor.${np.possessor.kind}`);
      else {
        const owner: PhraseSelection = {};
        this.phrase(c, owner, "subject", np.possessor, possessorAddress(address));
        set(sel, `${which}Possessor`, owner);
        if (np.possessorRole && np.possessorRole !== "owner")
          sel.possessorRoles = { ...sel.possessorRoles, [which]: np.possessorRole };
      }
    }
    this.gloss(c, sel, which, np);
    if (np.relative) this.relative(c, address, head, np.relative, Boolean(np.relativeGloss));
    else if (np.relativeGloss) this.unsupported.add("NounPhrase.relativeGloss without a relative");
  }

  // The reading of a period's own subject (P13): the one noun a gloss flag is said on.
  private gloss(c: PhraseContainer, sel: PhraseSelection, which: NounKey, np: NounPhrase): void {
    const flag = np.dimensionGloss ? "dimension" : np.mannerGloss ? "manner" : np.complementGloss?.type;
    if (!flag) return;
    if (sel !== c.selection || which !== "subject") {
      this.unsupported.add("NounPhrase gloss off a period's subject");
      return;
    }
    sel.subjectGloss = flag;
    for (const s of np.complementGloss?.specifiers ?? []) {
      if (s.kind === "temporal" && flag === "temporal") {
        if (s.value !== DEFAULT_TEMPORAL_RELATION) sel.subjectGlossRelation = s.value;
      } else this.unsupported.add(`NounPhrase.complementGloss.specifiers.${s.kind}`);
    }
  }

  // Adjectives and attributive nouns share a block's three adjective slots; the plan keeps them in two
  // lists, so each keeps its own order (see `modifiers` in selectionToPlan).
  private modifiers(sel: PhraseSelection, which: NounKey, np: NounPhrase): void {
    const slots = adjectiveSlots(which);
    const adjectives = np.adjectives ?? [];
    const nouns = np.nounModifiers ?? [];
    if (adjectives.length + nouns.length > slots.length) this.unsupported.add(`NounPhrase.adjectives > ${slots.length}`);
    let i = 0;
    adjectives.forEach((id, k) => {
      const slot = slots[i++];
      if (!slot) return;
      set(sel, slot, this.concept(id));
      const degree = np.adjectiveDegrees?.[k];
      if (degree && degree !== "positive") sel.adjectiveDegrees = { ...sel.adjectiveDegrees, [slot]: degree };
    });
    for (const m of nouns) {
      const slot = slots[i++];
      if (!slot) break;
      set(sel, slot, this.concept(m.concept));
      if (m.relation !== "feature") sel.modifierRelations = { ...sel.modifierRelations, [slot]: m.relation };
      if (m.number === "plural") sel.modifierNumbers = { ...sel.modifierNumbers, [slot]: "plural" };
      if (m.adjectives?.length) {
        if (m.adjectives.length > 1) this.unsupported.add("NounModifier.adjectives > 1");
        const adjective = this.concept(m.adjectives[0]!);
        if (adjective) sel.modifierAdjectives = { ...sel.modifierAdjectives, [slot]: adjective };
      }
    }
  }

  // A relative clause is a period whose gap is the noun the link targets. The gap holds the head's
  // word, as a gap the canvas links to always holds one; the serialiser leaves it out.
  private relative(c: PhraseContainer, address: NounAddress, head: Concept, rc: RelativeClause, headless: boolean): void {
    this.check("RelativeClause", rc, RELATIVE_FIELDS);
    const gap = rc.headRole ?? "subject";
    const box = gap === "subject" || gap === "directObject" || (BOX_COMPLEMENT_TYPES as string[]).includes(gap);
    if (!box && gap !== "instrumental" && gap !== "possessor") {
      this.unsupported.add(`RelativeClause.headRole.${gap}`);
      return;
    }
    const target = this.open();
    this.clause(target, rc);
    // The gap holds the head's word — the instrument has no box to hold it (P13), and a genitive
    // relative's head is the subject's possessor.
    if (gap === "possessor") set(target.selection, "subjectPossessor", { subject: head });
    else if (gap !== "instrumental") set(target.selection, gap, head);
    for (const s of rc.headSpecifiers ?? []) {
      if (s.kind === "path" && (gap === "route" || gap === "locative")) set(target.selection, `${gap}Specifier`, s.value);
      else if (s.kind === "temporal" && gap === "temporal") target.selection.temporalRelation = s.value;
      else if (s.kind === "sentiment" && gap === "cause") target.selection.causeSentiment = s.value;
      else this.unsupported.add(`RelativeClause.headSpecifiers.${s.kind}`);
    }
    this.link({
      source: { containerId: c.id, nounKey: address },
      target: { containerId: target.id, nounKey: (gap === "possessor" ? "subject/possessor" : gap) as RelativeGap },
      ...(headless ? { headless: true } : {}),
    });
  }
}
