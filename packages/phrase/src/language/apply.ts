import {
  canCoordinateImperative,
  type AbstractionLevel,
  type CauseSentiment,
  type Concept,
  type CoordConjunction,
  type ImperativeRegister,
  type PathSpecifier,
  type SubordinatingConjunction,
  type TemporalRelation,
} from "@signi/shared";
import {
  governsInfinitive,
  conjunctAddress,
  isConditionalLink,
  isCoordinativeLink,
  isInstrumentalLink,
  isRelativeLink,
  isSubordinateLink,
  possessorAddress,
  standardAddress,
  examplesAddress,
  type ConceptSelectOpts,
  type ImperativePerson,
  type QuestionRole,
  type NounAddress,
  type NounKey,
  type PhraseContainer,
  type PhraseLink,
  type RelativeGap,
  type PhraseSelection,
  type SlotKey,
  type SubordinateKind,
  subordinateReading,
} from "../model/interfaces.ts";
import {
  addConditional,
  addCoordinative,
  addInstrumental,
  addRelativeLink,
  addSubordinate,
  canBeCondition,
  canBeCoordinate,
  canBeInstrument,
  canBeSubordinate,
  governedForce,
  canStartCondition,
  canStartCoordination,
  canStartSubordinate,
  clearConditional,
  clearCoordinative,
  clearInstrumental,
  clearSubordinate,
  dropContainerLinks,
  inClauseRelation,
  isSelfOrAncestor,
  relativeTargetKeys,
  removeRelativeLink,
  setInstrumentalLevel,
  setInstrumentalNegative,
  setRelativeHeadless,
  setInfinitiveControl,
} from "../model/linkRules.ts";
import {
  setNumeral,
  setContrastive,
  setApproximated,
  addConjunct,
  applyClear,
  applyConceptSelect,
  clearPossessorRef,
  conjunctsOf,
  removeConjunct,
  removePossessor,
  removeStandard,
  removeExamples,
  setExampleRelation,
  setImperative,
  setImperativePerson,
  setImperativeRegister,
  setInfinitive,
  setInterrogative,
  setExistential,
  setHumble,
  setQuestionAnimate,
  setQuestionRole,
  setSentiment,
  setSpecifier,
  setTemporalRelation,
  setModifierAdjective,
  setNounConjunction,
  setCorrelative,
  setPossessorRef,
  updateConjunct,
  updateNounAt,
  updatePossessor,
  updateStandard,
  updateExamples,
} from "../model/phraseReducers.ts";
import { pointerHolds } from "../model/functions/linksToSubject.ts";
import { adjectiveSlots, MODAL_SLOTS, offeredComplements } from "../model/slots.ts";
import { nextActiveSlot } from "../model/functions/nextActiveSlot.ts";
import { visibleSlotsFor } from "../model/functions/visibleSlots.ts";
import {
  COORD_VALUES,
  LEVEL_VALUES,
  PERSON_VALUES,
  QUESTION_ANIMACY_VALUES,
  QUESTION_RELATION_VALUES,
  QUESTION_SLOT_VALUES,
  REGISTER_VALUES,
  SUBORDINATE_NAMES,
  SUB_VALUES,
  commandNamed,
  roleCommand,
  valueNamed,
  type Action,
  type AppCommand,
  type CommandDef,
  type Setting,
} from "./commands.ts";
import { codeOf, coded, diagnosticAt, type ClauseRole, type Coded, type ComplementSlot, type Nest } from "./diagnostics.ts";
import { splitPeriods } from "./lex.ts";
import { parse, type Item } from "./parse.ts";
import { conjunctSpec, parseRef, printRef as printRefText, resolveWord, wordSpecFor, type Ref, type WordSpec } from "./resolve.ts";
import type { ConsoleContext, Diagnostic, Span, Vocabulary, WordRef, WorkspaceState } from "./types.ts";
import {
  adjectiveTarget,
  adverbTarget,
  applySetting,
  attachesToWord,
  kindOf,
  modalTarget,
  nounWord,
  sliceOf,
  takes,
  wordInfo,
  type WordInfo,
} from "./words.ts";

/**
 * Turning a line into a new workspace — `parse`d items applied, in order, to `{containers, links}`.
 *
 * **The one rule.** A command attaches to the closest word before it that can take it; the box under
 * the cursor counts as the word just before the line. Each bracket is a frame of its own — commands
 * inside attach inside, and once it closes, what follows attaches to the head again.
 *
 * **A word's bracket keeps its own.** `/subj ( cat /pl )`: what describes a word is written inside its
 * bracket, and only there — a command in it reaches the bracket's words alone, and one that belongs to
 * the period (`/verb`) is refused until the bracket closes. Once a period's word closes its bracket,
 * nothing before it is the closest word any more: what follows starts afresh.
 *
 * **Settings set.** A setting sets its value rather than toggling it, so a line means the same
 * whatever the period held before: preview, replay and paste are all safe.
 *
 * **Links last.** Links between periods are made after every period has its words, in the order they
 * were written, so a line may name a period a later line fills (`/rel #2.subj`), and each link is
 * checked by the same rules a pick is (see linkRules) against the periods as they end up.
 *
 * It is pure: it reads the vocabulary it is handed and writes nothing but the state it returns.
 */

export type NounFrameKind = "period" | "possessor" | "standard" | "examples" | "conjunct";

/**
 * A bracket level — the period itself at the top, then each phrase or clause opened inside it. An
 * `element` is a word's own bracket, `/subj ( cat … )`: its words are the word and what hangs off it.
 */
export type FrameKind = NounFrameKind | "element";

export interface Frame {
  kind: FrameKind;
  containerId: string;
  /** A nested phrase's head address; undefined for a period. */
  slice?: NounAddress;
  /** The words written in this frame so far, oldest first — what a command looks back through. */
  words: WordRef[];
  /** The command that opened the bracket, for the context chip ("1 › rel › 2 · OBJ cat"). */
  via?: string;
  /**
   * The last word whose bracket closed in this frame. Commands no longer reach it, but the context
   * rests on it: after `/subj ( cat )` the cursor is on cat.
   */
  anchor?: WordRef;
}

/** What a line asks of the app rather than of the phrase. */
export interface Effect {
  app: AppCommand;
  arg?: string;
  span: Span;
}

/**
 * A word of the line and the concept it named, among the words `spec` took there — what lets the
 * line be written again in another language's words (see `printWords`). `opts` is what the word said
 * beyond its concept: a pronoun's form gives its number and gender ("she").
 */
export interface ResolvedWord extends Span {
  concept: Concept;
  spec: WordSpec;
  opts?: ConceptSelectOpts;
}

export interface ApplyResult {
  state: WorkspaceState;
  /** The first thing wrong, if any: everything before it was applied. */
  diagnostic?: Diagnostic & {
    /**
     * The line is only unfinished — a command waiting for the argument it needs at the end of the
     * line, as `/rel` is while one is typing its target. ↵ still refuses it; the console need not
     * shout about it yet.
     */
    incomplete?: boolean;
  };
  /** The frames still open at the end of the line, outermost first. */
  frames: Frame[];
  /** Where the context rests after the line: its period, and the last word written there. */
  context: ConsoleContext;
  effects: Effect[];
  /** The periods the line made, in the order it made them. */
  created: string[];
  /** Every word the line wrote into, for the preview's highlight. */
  touched: WordRef[];
  /** The period words the line's role commands filled, in order — where auto-advance starts from. */
  filled: WordRef[];
  /** Every word the line named, in the order it was read. */
  resolved: ResolvedWord[];
}

export interface ApplyOptions {
  context: ConsoleContext;
  vocab: Vocabulary;
  /** Fresh ids for new periods and links. */
  newId: () => string;
}

// A link waiting for the end of the script. A target given by number may name a period a later line
// makes, so it is looked up then.
type Target = { containerId: string } | { period: number; span: Span };

type LinkOp =
  | {
      kind: "relative";
      source: { containerId: string; nounKey: NounAddress };
      target: Target;
      nounKey?: RelativeGap;
      span: Span;
    }
  | { kind: "condition"; mainId: string; target: Target; span: Span }
  | { kind: "join"; firstId: string; target: Target; conjunction: CoordConjunction; span: Span }
  | { kind: "subordinate"; mainId: string; target: Target; link: SubordinateKind; conjunction?: SubordinatingConjunction; span: Span }
  | { kind: "instrument"; clauseId: string; target: Target; level: AbstractionLevel; negative?: boolean; span: Span }
  | { kind: "level"; containerId: string; level: AbstractionLevel; span: Span }
  | { kind: "privative"; containerId: string; negative: boolean; span: Span }
  | { kind: "control"; containerId: string; object: boolean; span: Span }
  // The relative clause of a noun said alone or headed again (P13), once the line's links are made.
  | { kind: "headless"; containerId: string; nounKey: NounAddress; headless: boolean; span: Span }
  // A possessor pointing at another noun of its period, which the line may name after it.
  | { kind: "possessorRef"; containerId: string; possessed: NounAddress; antecedent: NounAddress; span: Span }
  | {
      kind: "unlink";
      link: "relative" | "condition" | "join" | SubordinateKind | "instrument";
      containerId: string;
      nounKey?: NounAddress;
      span: Span;
    };

class ApplyError extends Error {
  readonly diagnostic: Diagnostic;
  constructor(
    span: Span,
    d: Coded,
    readonly incomplete = false,
  ) {
    const diagnostic = diagnosticAt(span, d);
    super(diagnostic.message);
    this.diagnostic = diagnostic;
  }
}

const fail = (span: Span, d: Coded): never => {
  throw new ApplyError(span, d);
};
const unfinished = (span: Span, d: Coded): never => {
  throw new ApplyError(span, d, true);
};

/** The bracket a frame is, as a diagnostic names it. */
const nest = (frame: Frame): Nest => ({ kind: frame.kind, via: frame.via });

/** Apply one line. See `applyScript` for several. */
export function applyLine(state: WorkspaceState, text: string, opts: ApplyOptions): ApplyResult {
  return applyScript(state, text, opts);
}

/**
 * Apply a script: one line, or several pasted at once. The first line applies where the context is;
 * each line after it starts a period of its own, as if it began with `/new`, unless it begins by
 * naming one (`#2 …`). A script printed from a workspace therefore rebuilds it, period by period. A
 * line break inside a bracket is only a space: a long period may run over several lines.
 */
export function applyScript(state: WorkspaceState, text: string, opts: ApplyOptions): ApplyResult {
  const lines = splitPeriods(text);
  while (lines.length > 1 && !lines[lines.length - 1]!.text.trim()) lines.pop();
  const run = new Run(state, opts);
  try {
    lines.forEach(({ text: line, offset }, i) => {
      const parsed = parse(line);
      const shift = (d: Diagnostic): Diagnostic => ({ ...d, from: d.from + offset, to: d.to + offset });
      const items = parsed.items.map((item) => shiftItem(item, offset));
      const first = items[0];
      const namesPeriod =
        first?.kind === "goto" || (first?.kind === "command" && first.def?.action.kind === "new");
      if (i > 0 && !namesPeriod) run.nextLine();
      const refused = parsed.diagnostic && shift(parsed.diagnostic);
      try {
        run.items(items, run.top);
      } catch (error) {
        // An item left waiting for the argument the parser refused (`/tense soon`): the refusal says
        // more than the wait.
        if (refused && error instanceof ApplyError && error.incomplete) throw new ApplyError(refused, codeOf(refused));
        throw error;
      }
      if (refused) throw new ApplyError(refused, codeOf(refused));
    });
    run.makeLinks();
    return run.result();
  } catch (error) {
    if (!(error instanceof ApplyError)) throw error;
    // The valid prefix still counts, links and all: make those queued before the mistake, as far as
    // they go.
    try {
      run.makeLinks();
    } catch (late) {
      if (!(late instanceof ApplyError)) throw late;
    }
    return run.result({ ...error.diagnostic, incomplete: error.incomplete });
  }
}

function shiftItem(item: Item, by: number): Item {
  if (!by) return item;
  const s = <T extends Span | undefined>(span: T): T =>
    (span ? { ...span, from: span.from + by, to: span.to + by } : span) as T;
  return {
    ...item,
    from: item.from + by,
    to: item.to + by,
    head: s(item.head),
    word: s(item.word),
    ref: s(item.ref),
    open: s(item.open),
    close: s(item.close),
    body: item.body?.map((b) => shiftItem(b, by)),
  };
}

// ── The interpreter ──────────────────────────────────────────────────────────

class Run {
  containers: PhraseContainer[];
  links: WorkspaceState["links"];
  readonly top: Frame;
  readonly stack: Frame[];
  readonly queue: LinkOp[] = [];
  readonly effects: Effect[] = [];
  readonly created: string[] = [];
  readonly touched: WordRef[] = [];
  readonly filled: WordRef[] = [];
  readonly resolved: ResolvedWord[] = [];

  constructor(
    state: WorkspaceState,
    readonly opts: ApplyOptions,
  ) {
    this.containers = state.containers;
    this.links = state.links;
    const { context } = opts;
    const here = this.containers.some((c) => c.id === context.containerId)
      ? context.containerId
      : this.containers[0]?.id ?? "";
    this.top = {
      kind: "period",
      containerId: here,
      words: context.word && context.word.containerId === here ? [context.word] : [],
    };
    this.stack = [this.top];
  }

  get vocab() {
    return this.opts.vocab;
  }

  result(diagnostic?: ApplyResult["diagnostic"]): ApplyResult {
    const top = this.top;
    return {
      state: { containers: this.containers, links: this.links },
      diagnostic,
      frames: this.stack.map((f) => ({ ...f, words: [...f.words] })),
      context: { containerId: top.containerId, word: top.words.at(-1) ?? top.anchor },
      effects: this.effects,
      created: this.created,
      touched: this.touched,
      filled: this.filled,
      resolved: this.resolved,
    };
  }

  // ── Reading and writing the workspace ──

  root(containerId: string): PhraseSelection {
    return this.containers.find((c) => c.id === containerId)?.selection ?? {};
  }

  periodNumber(containerId: string): number {
    return this.containers.findIndex((c) => c.id === containerId) + 1;
  }

  updateRoot(containerId: string, fn: (sel: PhraseSelection) => PhraseSelection): void {
    this.containers = this.containers.map((c) =>
      c.id === containerId ? { ...c, selection: fn(c.selection) } : c,
    );
  }

  /** Edit the selection a word lives in: the period, or the nested phrase whose head is `slice`. */
  updateSlice(containerId: string, slice: NounAddress | undefined, fn: (sel: PhraseSelection) => PhraseSelection): void {
    this.updateRoot(containerId, (root) => (slice ? updateNounAt(root, slice, (s) => fn(s)) : fn(root)));
  }

  info(ref: WordRef): WordInfo | undefined {
    return wordInfo(this.containers, ref);
  }

  touch(ref: WordRef): void {
    this.touched.push(ref);
  }

  /** A script's next line starts a period of its own. */
  nextLine(): void {
    this.top.containerId = this.newPeriod();
    this.top.words = [];
    this.top.anchor = undefined;
  }

  newPeriod(selection: PhraseSelection = {}): string {
    const id = this.opts.newId();
    this.containers = [...this.containers, { id, selection }];
    this.created.push(id);
    return id;
  }

  // ── Items ──

  items(items: Item[], frame: Frame): void {
    for (const item of items) this.item(item, frame);
  }

  item(item: Item, frame: Frame): void {
    if (item.kind === "goto") return this.goto(item, frame);
    const def = item.def!;
    const action = def.action;
    if (attachesToWord(action)) return this.attach(item, def, frame);
    // A word's bracket holds what describes the word, and nothing of the period's.
    if (frame.kind === "element")
      fail(item.head, coded("periodCommandInBracket", { command: def.name, via: frame.via ?? "" }));
    switch (action.kind) {
      case "role":
        return this.role(item, def, action.slot, frame);
      case "condition":
      case "join":
      case "subordinate":
      case "instrument":
        return this.clauseLink(item, def, frame);
      case "level":
        return this.level(item, frame);
      case "privative":
        return this.privative(item, action.negative, frame);
      case "control":
        this.queue.push({ kind: "control", containerId: frame.containerId, object: action.object, span: item });
        return;
      case "mood":
        return this.mood(item, action.mood, frame);
      case "question":
        return this.question(item, frame);
      case "existential":
        return this.existential(item, frame);
      case "new":
        return this.newCommand(item, frame);
      case "del":
        return this.del(item, frame);
      case "app":
        this.effects.push({ app: action.app, arg: item.word?.text, span: item });
        return;
    }
  }

  /** `#2` — go to a period; `#2.obj` — to a noun of one. Only at the top of a line: a bracket is one phrase. */
  goto(item: Item, frame: Frame): void {
    if (frame !== this.top) fail(item, coded("gotoInsideBracket", nest(frame)));
    const ref = this.readRef(item.ref!);
    const c = this.containers[ref.period - 1];
    if (!c) fail(item, coded("noSuchPeriod", { period: ref.period }));
    frame.containerId = c!.id;
    frame.words = [];
    frame.anchor = undefined;
    if (ref.address) {
      const word = nounWord(c!.id, ref.address);
      if (!this.info(word))
        fail(item, coded("noNounThere", { period: ref.period, ref: printRefText(ref.period, ref.address) }));
      frame.words.push(word);
    }
  }

  readRef(arg: { text: string } & Span): Ref {
    const ref = parseRef(arg.text);
    if ("error" in ref) {
      if (!arg.text) unfinished(arg, coded("referenceIncomplete"));
      fail(arg, ref.error);
    }
    return ref as Ref;
  }

  /** The word a command written in `frame` fills when it names a slot: the frame's own slot. */
  slotRef(frame: Frame, slot: SlotKey): WordRef {
    return { containerId: frame.containerId, slice: frame.slice, slot };
  }

  // ── Roles ──

  role(item: Item, def: CommandDef, slot: SlotKey, frame: Frame): void {
    if (frame.kind !== "period" && slot !== "subject")
      fail(item.head, coded("nestedRoleNotSubj", nest(frame)));
    if (frame.kind === "period") this.checkSlot(item, def, slot, frame.containerId);
    const ref = this.slotRef(frame, slot);
    if (item.word) {
      const spec = wordSpecFor(slot, frame.kind as NounFrameKind);
      const concept = this.word(item.word, spec, def.name);
      this.updateSlice(frame.containerId, frame.slice, (s) => applyConceptSelect(s, slot, concept.concept, concept.opts));
      this.touch(ref);
      if (frame === this.top) this.filled.push(ref);
    }
    if (item.body) return this.element(item, def, ref, frame);
    frame.words.push(ref);
  }

  /**
   * A word's own bracket, `/subj ( cat /pl )`: what is inside reaches the word and nothing else. Once
   * it closes, the word is out of reach — of a period's word, nothing before it either.
   */
  element(item: Item, def: CommandDef, ref: WordRef, frame: Frame): void {
    this.bracket(item, { kind: "element", containerId: ref.containerId, slice: ref.slice, words: [ref], via: def.name });
    if (!item.close) return;
    if (def.action.kind === "role") frame.words = [];
    frame.anchor = ref;
  }

  /** Whether the period offers the box a role names: an object wants a transitive verb, a complement one that licenses it. */
  checkSlot(item: Item, def: CommandDef, slot: SlotKey, containerId: string): void {
    const why = roleRefusal({ containers: this.containers, links: this.links }, containerId, slot, def, this.vocab);
    if (why) fail(item.head, why);
  }

  /** The concept a word argument names, or a diagnostic saying why it names none. `command` is its name, without the slash. */
  word(arg: { text: string } & Span, spec: WordSpec, command: string) {
    const res = resolveWord(arg.text, spec, this.vocab);
    if (res.ok) {
      this.resolved.push({ from: arg.from, to: arg.to, concept: res.concept, spec, opts: res.opts });
      return res;
    }
    if (res.reason === "ambiguous")
      fail(arg, coded("ambiguousWord", { text: arg.text, candidates: res.candidates.map((c) => c.id) }));
    return fail(arg, coded("unknownWord", { command, text: arg.text }));
  }

  // ── Attaching to the closest word that can take it ──

  /** The closest word before the command in its frame that can take it. */
  target(action: Action, frame: Frame): WordInfo | undefined {
    for (let i = frame.words.length - 1; i >= 0; i--) {
      const w = this.info(frame.words[i]!);
      if (w && takes(action, w)) return w;
    }
    return undefined;
  }

  attach(item: Item, def: CommandDef, frame: Frame): void {
    const action = def.action;
    const w = this.target(action, frame);
    if (!w) return this.noTarget(item, def, frame);
    switch (action.kind) {
      case "setting":
        this.updateSlice(w.ref.containerId, w.ref.slice, (s) => applySetting(action.setting, w, s));
        this.touch(w.ref);
        return;
      case "set": {
        const values = def.arg.kind === "values" ? def.arg.values : [];
        if (!item.word) return unfinished(item.head, coded("setNeedsValue", { command: def.name, values: values.map((v) => v.name) }));
        const value = valueNamed(values, item.word.text.trim())!.value;
        const setting = { id: action.id, value } as Setting;
        this.updateSlice(w.ref.containerId, w.ref.slice, (s) => applySetting(setting, w, s));
        this.touch(w.ref);
        return;
      }
      case "adjective": {
        const t = adjectiveTarget(w)!;
        const ref: WordRef = { containerId: w.ref.containerId, slice: w.ref.slice, slot: t.slot, ...(t.modifierAdjective && { modifierAdjective: true }) };
        if (item.word) {
          const spec: WordSpec = t.modifierAdjective ? { roles: ["adjective"] } : wordSpecFor(t.slot);
          const { concept } = this.word(item.word, spec, "adj");
          this.updateSlice(w.ref.containerId, w.ref.slice, (s) =>
            t.modifierAdjective ? setModifierAdjective(s, t.slot, concept) : applyConceptSelect(s, t.slot, concept),
          );
          this.touch(ref);
        }
        if (item.body) return this.element(item, def, ref, frame);
        frame.words.push(ref);
        return;
      }
      case "adverb":
      case "modal": {
        const slot = action.kind === "adverb" ? adverbTarget(w)! : modalTarget(w)!;
        const ref: WordRef = { containerId: w.ref.containerId, slot };
        if (item.word) {
          const { concept } = this.word(item.word, wordSpecFor(slot), def.name);
          this.updateRoot(w.ref.containerId, (s) => applyConceptSelect(s, slot, concept));
          this.touch(ref);
        }
        if (item.body) return this.element(item, def, ref, frame);
        frame.words.push(ref);
        return;
      }
      case "possessor":
        return this.possessor(item, w);
      case "standard":
        return this.standard(item, w);
      case "examples":
        return this.examples(item, action.relation, w);
      case "conjunct":
        return this.conjunct(item, def.name, action.conjunction, w, action.correlative);
      case "relative":
        return this.relative(item, w);
      case "headless":
        this.queue.push({ kind: "headless", containerId: w.ref.containerId, nounKey: w.address!, headless: true, span: item });
        this.touch(w.ref);
        return;
      // The humble register (P11-E6): the verb phrase's flag, whoever the subject is.
      case "humble":
        this.updateRoot(w.ref.containerId, (s) => setHumble(s, true));
        this.touch(w.ref);
        return;
      // A demonstrative pointing away from the rest (P13).
      case "contrast":
        this.updateSlice(w.ref.containerId, w.ref.slice, (s) => setContrastive(s, w.which!, true));
        this.touch(w.ref);
        return;
      // An approximator on the quantity (P09-E49): `takes` has checked the quantity takes one.
      case "approximator":
        this.updateSlice(w.ref.containerId, w.ref.slice, (s) => setApproximated(s, w.which!, true));
        this.touch(w.ref);
        return;
      // A cardinal numeral (P13): a whole number, the engine's words running to 12 and 24.
      case "numeral": {
        const text = item.word?.text.trim() ?? "";
        const n = Number(text);
        if (!/^\d+$/.test(text) || n < 1 || n > 9999) return fail(item.word ?? item.head, coded("numeralNotANumber"));
        this.updateSlice(w.ref.containerId, w.ref.slice, (s) => setNumeral(s, w.which!, n));
        this.touch(w.ref);
        return;
      }
    }
  }

  /**
   * Nothing before the command can take it. Say what it sets, what the closest word is, and where
   * it would land: "/past sets a verb’s tense, and food is a noun. Put it after eat, or write /verb /past."
   */
  noTarget(item: Item, def: CommandDef, frame: Frame): never {
    // Past a word's closed bracket, at the period's level: what describes a word goes inside its bracket.
    if (frame.kind !== "element" && frame.words.length === 0 && frame.anchor) {
      const anchor = this.info(frame.anchor);
      const role = frame.anchor.slice ? undefined : roleCommand(frame.anchor.slot);
      if (anchor?.concept && role && takes(def.action, anchor))
        fail(item.head, coded("describesAWord", { command: def.name, role: role.name, word: this.vocab.label(anchor.concept) }));
    }
    const last = frame.words.at(-1);
    const lastInfo = last && this.info(last);
    // A word of the period that could take it, if any — the one to put the command after.
    const root = this.root(frame.containerId);
    const candidates = this.periodWords(frame.containerId, root);
    const fit = candidates.find((w) => takes(def.action, w));
    const role = fit?.concept && !fit.ref.slice ? roleCommand(fit.ref.slot) : undefined;
    return fail(
      item.head,
      coded("noTarget", {
        command: def.name,
        ...(lastInfo?.concept && { last: { word: this.vocab.label(lastInfo.concept), kind: kindOf(lastInfo) } }),
        ...(fit?.concept && { fit: { word: this.vocab.label(fit.concept), ...(role && { role: role.name }) } }),
        inElement: frame.kind === "element",
      }),
    );
  }

  /** Every word of a period that holds one, period nouns first — where a stray command might belong. */
  periodWords(containerId: string, root: PhraseSelection): WordInfo[] {
    const keys = Object.keys(root).filter((k) => {
      const v = root[k as keyof PhraseSelection] as { id?: unknown } | undefined;
      return Boolean(v && typeof v === "object" && "id" in v);
    });
    return keys.flatMap((slot) => {
      const w = this.info({ containerId, slot: slot as SlotKey });
      return w ? [w] : [];
    });
  }

  possessor(item: Item, w: WordInfo): void {
    const containerId = w.ref.containerId;
    const possessed = w.address!;
    const headRef: WordRef = { containerId, slice: possessorAddress(possessed), slot: "subject" };
    if (item.ref) {
      // A possessor that refers to another noun of the period ("the boy and *his* horse").
      const ref = this.readRef(item.ref);
      const period = this.periodNumber(containerId);
      if (ref.period !== period) fail(item.ref, coded("possessorOwnPeriod", { period }));
      if (!ref.address) unfinished(item.ref, coded("possessorNeedsNoun", { period }));
      const address = ref.address!;
      if (address === possessed || address.startsWith(`${possessed}/`)) fail(item.ref, coded("ownPossessor"));
      // The noun it points at may come later in the line, so it is looked for at the end.
      this.queue.push({ kind: "possessorRef", containerId, possessed, antecedent: address, span: item.ref });
      this.touch(w.ref);
      return;
    }
    // A named possessor: seeded on the way in, which also drops a reference the slot held.
    this.updateRoot(containerId, (root) => updateNounAt(root, possessed, (s, which) => updatePossessor(s, which, (p) => p)));
    this.touch(w.ref);
    if (item.word) {
      // A pronoun carries what its form says: `/poss we` is the 1st plural, `/poss her` the 3rd feminine.
      const { concept, opts } = this.word(item.word, wordSpecFor("subject", "possessor"), "poss");
      this.updateSlice(containerId, headRef.slice, (s) => applyConceptSelect(s, "subject", concept, opts));
      this.touch(headRef);
    }
    // A bracket that opens with the head word reaches it: `/poss [ child /adj old ]`.
    if (item.body)
      this.bracket(item, { kind: "possessor", containerId, slice: headRef.slice, words: item.lead ? [headRef] : [], via: "poss" });
  }

  /** `/than [ dog ]` — what the predicate adjective is compared to, a phrase of its own (P09-E12 D5). */
  standard(item: Item, w: WordInfo): void {
    const containerId = w.ref.containerId;
    const compared = w.address!;
    const headRef: WordRef = { containerId, slice: standardAddress(compared), slot: "subject" };
    // Seeded on the way in, so a bracket with no word yet still holds a standard to fill.
    this.updateRoot(containerId, (root) => updateNounAt(root, compared, (s, which) => updateStandard(s, which, (p) => p)));
    this.touch(w.ref);
    if (item.word) {
      const { concept, opts } = this.word(item.word, wordSpecFor("subject", "standard"), "than");
      this.updateSlice(containerId, headRef.slice, (s) => applyConceptSelect(s, "subject", concept, opts));
      this.touch(headRef);
    }
    if (item.body)
      this.bracket(item, { kind: "standard", containerId, slice: headRef.slice, words: item.lead ? [headRef] : [], via: "than" });
  }

  /** `/suchas [ cat ]`, `/including [ cat ]` — the members of its set a noun names (P09-E48). */
  examples(item: Item, relation: "example" | "inclusion", w: WordInfo): void {
    const containerId = w.ref.containerId;
    const named = w.address!;
    const headRef: WordRef = { containerId, slice: examplesAddress(named), slot: "subject" };
    // Seeded on the way in, so a bracket with no word yet still holds examples to fill.
    this.updateRoot(containerId, (root) =>
      updateNounAt(root, named, (s, which) => setExampleRelation(updateExamples(s, which, (p) => p), which, relation)),
    );
    this.touch(w.ref);
    if (item.word) {
      const { concept, opts } = this.word(item.word, wordSpecFor("subject", "examples"), "eg");
      this.updateSlice(containerId, headRef.slice, (s) => applyConceptSelect(s, "subject", concept, opts));
      this.touch(headRef);
    }
    if (item.body)
      this.bracket(item, { kind: "examples", containerId, slice: headRef.slice, words: item.lead ? [headRef] : [], via: relation === "inclusion" ? "including" : "suchas" });
  }

  conjunct(item: Item, command: string, conjunction: "and" | "or", w: WordInfo, correlative?: true): void {
    const containerId = w.ref.containerId;
    const which = w.which!;
    // `/bothand` spells the pair it makes "both … and" (P09-E46); on any other group it is a plain `/and`.
    this.updateRoot(containerId, (root) => {
      const next = setNounConjunction(addConjunct(root, which), which, conjunction);
      return correlative ? setCorrelative(next, which, true) : next;
    });
    const i = conjunctsOf(this.root(containerId), which).length - 1;
    const slice = conjunctAddress(which, i);
    const headRef: WordRef = { containerId, slice, slot: "subject" };
    this.touch(w.ref);
    if (item.word) {
      const { concept, opts } = this.word(item.word, conjunctSpec(which), command);
      this.updateRoot(containerId, (root) => updateConjunct(root, which, i, (c) => applyConceptSelect(c, "subject", concept, opts)));
      this.touch(headRef);
    }
    if (item.body)
      this.bracket(item, { kind: "conjunct", containerId, slice, words: item.lead ? [headRef] : [], via: command });
  }

  relative(item: Item, w: WordInfo): void {
    const source = { containerId: w.ref.containerId, nounKey: w.address! };
    if (item.ref) {
      const ref = this.readRef(item.ref);
      if (!ref.address) unfinished(item.ref, coded("relativeNeedsNoun", { period: ref.period }));
      // A noun of the period, or — its gap no box holds — its instrument or its subject's possessor (P13).
      if (ref.address!.includes("/") && ref.address !== "subject/possessor")
        fail(item.ref, coded("relativeNounOfPeriod", { period: ref.period }));
      this.queue.push({
        kind: "relative",
        source,
        target: this.target4(ref, item.ref),
        nounKey: ref.address as RelativeGap,
        span: item,
      });
      this.touch(w.ref);
      return;
    }
    if (!item.body) unfinished(item.head, coded("relativeNeedsClause"));
    // A new clause, made where the command stands. Its gap — the box the head's word stands in for —
    // holds the head's word, as a pick on the canvas makes it.
    const gap: NounKey = item.word?.text.toLowerCase() === "obj" ? "directObject" : "subject";
    const head = w.concept!;
    const id = this.newPeriod(applyConceptSelect({}, gap, head));
    this.queue.push({ kind: "relative", source, target: { containerId: id }, nounKey: gap, span: item });
    this.touch(w.ref);
    this.bracket(item, { kind: "period", containerId: id, words: [], via: "rel" });
  }

  /** A target named by number is looked up at the end, when every line has made its period. */
  target4(ref: Ref, span: Span): Target {
    return { period: ref.period, span };
  }

  /** Run a bracket's items in a frame of their own, and hand the line back to the head when it closes. */
  bracket(item: Item, inner: Frame): void {
    this.stack.push(inner);
    this.items(item.body!, inner);
    // A bracket still open at the end of the line stays on the stack — the context chip shows the
    // path into it — and ↵ closes it (the line ends there).
    if (item.close) this.stack.pop();
  }

  // ── Periods ──

  /** `/if`, `/join`, `/clause`, `/sub`, `/to`, `/inst`: a clause-level link from the frame's period. */
  clauseLink(item: Item, def: CommandDef, frame: Frame): void {
    const kind = def.action.kind as "condition" | "join" | "subordinate" | "instrument";
    const subordinate = def.action.kind === "subordinate" ? def.action.link : undefined;
    if (frame.kind !== "period") fail(item.head, coded("linkInsideNounPhrase", { command: def.name, ...nest(frame) }));
    const id = frame.containerId;
    const root = this.root(id);
    let conjunction: CoordConjunction = "and";
    if (kind === "join") {
      conjunction = (valueNamed(COORD_VALUES, item.word?.text ?? "and")?.value ?? "and") as CoordConjunction;
      if (root.imperative && !canCoordinateImperative(conjunction))
        fail(item.word ?? item.head, coded("imperativeJoin"));
    }
    let subordinator: SubordinatingConjunction | undefined;
    if (subordinate === "adverbial")
      subordinator = (valueNamed(SUB_VALUES, item.word?.text ?? "when")?.value ?? "when") as SubordinatingConjunction;
    if (kind === "instrument") {
      if (!root.verb) fail(item.head, coded("instrumentNeedsVerb"));
      if (!root.verb!.complements?.includes("instrumental"))
        fail(item.head, coded("takesNoInstrument", { verb: this.vocab.label(root.verb!) }));
    }
    let target: Target;
    if (item.ref) {
      const ref = this.readRef(item.ref);
      if (ref.address) fail(item.ref, coded("linksWholePeriods", { command: def.name, period: ref.period }));
      target = this.target4(ref, item.ref);
    } else if (item.body) {
      // The new period is made already linked. A command's coordinate is a command too: the mood
      // rule would refuse a statement, and the bracket is the command's own.
      // A question's coordinate is a question, for the same reason. An infinitive complement is drawn
      // in the infinitive mood (P09-E12 D9), so its bracket is one.
      const seed: PhraseSelection =
        kind === "join" && root.imperative
          ? setImperative({}, true)
          : kind === "join" && root.interrogative
            ? setInterrogative({}, true)
            : subordinate === "infinitive"
              ? setInfinitive({}, true)
            : {};
      target = { containerId: this.newPeriod(seed) };
    } else {
      return unfinished(
        item.head,
        coded("clauseLinkNeedsTarget", {
          command: def.name,
          ...(kind === "join" && { conjunction: item.word?.text ?? "and" }),
          ...(subordinate === "adverbial" && { conjunction: item.word?.text ?? "when" }),
        }),
      );
    }
    const span: Span = item;
    if (kind === "condition") this.queue.push({ kind, mainId: id, target, span });
    else if (kind === "join") this.queue.push({ kind, firstId: id, target, conjunction, span });
    else if (kind === "subordinate")
      this.queue.push({ kind, mainId: id, target, link: subordinate!, ...(subordinator && { conjunction: subordinator }), span });
    else this.queue.push({ kind, clauseId: id, target, level: "object", span });
    if (item.body) {
      const containerId = (target as { containerId: string }).containerId;
      this.bracket(item, { kind: "period", containerId, words: [], via: def.name });
    }
  }

  /** `/level` — how far the instrument this period takes part in is reified. */
  level(item: Item, frame: Frame): void {
    if (!item.word) return unfinished(item.head, coded("levelNeedsValue"));
    const level = valueNamed(LEVEL_VALUES, item.word.text.trim())?.value as AbstractionLevel | undefined;
    if (!level) return fail(item.word, coded("levelNotTaken", { text: item.word.text.trim() }));
    const id = frame.containerId;
    // An instrument this very line is linking takes the level with it, so the link is checked at it.
    const pending = [...this.queue].reverse().find(
      (op): op is Extract<LinkOp, { kind: "instrument" }> =>
        op.kind === "instrument" &&
        (op.clauseId === id || ("containerId" in op.target && op.target.containerId === id)),
    );
    if (pending) pending.level = level;
    else this.queue.push({ kind: "level", containerId: id, level, span: item });
  }

  /** `/without`, `/posinst` — whether the instrument this period takes part in is denied (P09-E2). */
  privative(item: Item, negative: boolean, frame: Frame): void {
    const id = frame.containerId;
    // An instrument this very line is linking takes the polarity with it, as it takes a level.
    const pending = [...this.queue].reverse().find(
      (op): op is Extract<LinkOp, { kind: "instrument" }> =>
        op.kind === "instrument" &&
        (op.clauseId === id || ("containerId" in op.target && op.target.containerId === id)),
    );
    if (pending) pending.negative = negative;
    else this.queue.push({ kind: "privative", containerId: id, negative, span: item });
  }

  mood(item: Item, mood: "command" | "infinitive" | "question" | "statement", frame: Frame): void {
    if (frame.kind !== "period") fail(item.head, coded("moodInNounPhrase", nest(frame)));
    const id = frame.containerId;
    const root = this.root(id);
    const next =
      mood === "command"
        ? setImperative(root, true)
        : mood === "infinitive"
          ? setInfinitive(root, true)
          : mood === "question"
            ? setInterrogative(root, true)
            : setInterrogative(setInfinitive(setImperative(root, false), false), false);
    const flips =
      Boolean(next.imperative) !== Boolean(root.imperative) ||
      Boolean(next.infinitive) !== Boolean(root.infinitive) ||
      Boolean(next.interrogative) !== Boolean(root.interrogative);
    // A mood can't be flipped on a period alone while it takes part in a conditional or a
    // coordination (see PeriodCard's moodLocked): the relation has to go first. The clause of a verb
    // that reports a question either way (KNOW, P09-E55) has its question for its own; ASK's stays one.
    const onlyQuestion =
      Boolean(next.imperative) === Boolean(root.imperative) && Boolean(next.infinitive) === Boolean(root.infinitive);
    if (flips && this.moodLocked(id) && !(onlyQuestion && this.reportedQuestion(id) === "either"))
      fail(item.head, coded("moodLocked"));
    let sel = next;
    if (mood === "command" && item.word) {
      for (const part of item.word.text.split(/\s+/)) {
        const person = valueNamed(PERSON_VALUES, part);
        if (person) sel = setImperativePerson(sel, person.value as ImperativePerson);
        const register = valueNamed(REGISTER_VALUES, part);
        if (register) sel = setImperativeRegister(sel, register.value as ImperativeRegister);
      }
    }
    this.updateRoot(id, () => sel);
    this.touch({ containerId: id, slot: "subject" });
  }

  /**
   * Whether a conditional or a coordination this period takes part in, or a subordinate link it is
   * the clause of, locks its mood (see moodLocked). A subordinate clause has no mood of its own
   * (P09-E12 D9); the clause governing it keeps its.
   */
  /**
   * The question a period may carry as the that-clause of a verb that reports one (P09-E55, the
   * verb's `clauseForce`), in no other relation: `interrogative` under ASK, `either` under KNOW.
   */
  reportedQuestion(id: string): "interrogative" | "either" | undefined {
    const link = this.links.find((l) => isSubordinateLink(l) && l.target.containerId === id);
    if (!link || !isSubordinateLink(link) || link.kind !== "content") return undefined;
    if (this.links.some((l) => (isConditionalLink(l) || isCoordinativeLink(l)) && (l.source.containerId === id || l.target.containerId === id)))
      return undefined;
    return governedForce(this.containers.find((c) => c.id === link.source.containerId));
  }

  moodLocked(id: string): boolean {
    return this.links.some(
      (l) =>
        ((isConditionalLink(l) || isCoordinativeLink(l)) &&
          (l.source.containerId === id || l.target.containerId === id)) ||
        (isSubordinateLink(l) && l.target.containerId === id),
    );
  }

  /**
   * `/wh obj`, `/wh subj who` — the slot the period's question asks about, and what it asks for there
   * (P09-E12 M6). It makes the period a question, as the mark on the slot's ring does, so it is held to
   * the same lock the mood is; the gap itself is the plan's to leave out (see askQuestion).
   */
  question(item: Item, frame: Frame): void {
    if (frame.kind !== "period") fail(item.head, coded("moodInNounPhrase", nest(frame)));
    const parts = (item.word?.text ?? "").split(/\s+/).filter(Boolean);
    const slots = parts.map((p) => valueNamed(QUESTION_SLOT_VALUES, p)).filter((v) => v !== undefined);
    // The owner's slot names the noun it is inside with a second slot value, `/wh poss obj` (P09-E52).
    const slot = slots.find((v) => v.value === "possessor") ?? slots[0];
    const possessed =
      slot?.value === "possessor" ? (slots.find((v) => v !== slot)?.value as "subject" | "directObject" | undefined) : undefined;
    const animacy = parts.map((p) => valueNamed(QUESTION_ANIMACY_VALUES, p)).find(Boolean);
    const relationPart = parts.find((p) => valueNamed(QUESTION_RELATION_VALUES, p));
    if (!slot) {
      return unfinished(item.word ?? item.head, coded("setNeedsValue", { command: "wh", values: QUESTION_SLOT_VALUES.map((v) => v.name) }));
    }
    const role = slot.value as QuestionRole;
    // The relation is the box's own setting, so it must be one the box has: a place's, a route's or a
    // direction's path, the direction's plain goal, a time's relation, a cause's stance. Whether the
    // engine asks it (a time only at or until) is the plan builder's to gate, as the slot is.
    const relation = relationPart ? questionRelation(role, valueNamed(QUESTION_RELATION_VALUES, relationPart)!.value) : undefined;
    if (relationPart && !relation) {
      const taken = QUESTION_RELATION_VALUES.filter((v) => questionRelation(role, v.value)).map((v) => v.name);
      const at = item.word!.from + [...item.word!.text.matchAll(/\S+/g)].find((m) => m[0] === relationPart)!.index!;
      fail({ from: at, to: at + relationPart.length }, coded("valueNotTaken", { command: "wh", values: taken, given: relationPart }));
    }
    const id = frame.containerId;
    const root = this.root(id);
    if (!root.interrogative && this.moodLocked(id) && !this.reportedQuestion(id)) fail(item.head, coded("moodLocked"));
    let sel = setQuestionRole(root, role, possessed);
    if (animacy) sel = setQuestionAnimate(sel, animacy.value === "who");
    if (relation) sel = relation(sel);
    this.updateRoot(id, () => sel);
    // The owner's gap is inside the noun it asks about, which is where the context goes.
    this.touch({ containerId: id, slot: role === "possessor" ? sel.questionPossessed! : role });
  }

  /** `/there` — the period made an existential, "there is a cat" (P09-E12 M7). */
  existential(item: Item, frame: Frame): void {
    if (frame.kind !== "period") fail(item.head, coded("moodInNounPhrase", nest(frame)));
    const id = frame.containerId;
    this.updateRoot(id, (root) => setExistential(root, true));
    this.touch({ containerId: id, slot: "subject" });
  }

  newCommand(item: Item, frame: Frame): void {
    if (frame !== this.top) fail(item.head, coded("newPeriodInBracket", nest(frame)));
    const id = this.newPeriod();
    frame.containerId = id;
    frame.words = [{ containerId: id, slot: "subject" }];
    frame.anchor = undefined;
  }

  // ── Removing ──

  del(item: Item, frame: Frame): void {
    const [what = "", n] = (item.word?.text ?? "").toLowerCase().split(/\s+/);
    const index = n === undefined ? undefined : Number(n);
    const containerId = frame.containerId;
    const span = item.word ?? item.head;
    // What to remove is looked for among the words in reach, then the word whose bracket closed last:
    // `/subj ( cat /adj brown ) /del adj`.
    const closest = (pred: (w: WordInfo) => boolean) => {
      const words = frame.anchor ? [frame.anchor, ...frame.words] : frame.words;
      for (let i = words.length - 1; i >= 0; i--) {
        const w = this.info(words[i]!);
        if (w && pred(w)) return w;
      }
      return undefined;
    };
    if (!what) {
      const last = frame.words.at(-1) ?? frame.anchor;
      const w = last && this.info(last);
      if (!w) fail(item.head, coded("nothingToRemove"));
      return this.clearWord(w!);
    }
    const slot = roleSlot(what);
    if (slot) {
      if (frame.kind !== "period" && slot !== "subject") fail(span, coded("nestedRemovesOnlySubj", nest(frame)));
      this.updateSlice(containerId, frame.slice, (s) => applyClear(s, slot));
      this.touch(this.slotRef(frame, slot));
      return;
    }
    switch (what) {
      case "adj": {
        const w = closest((x) => x.kind === "noun" && Boolean(x.slice[`${x.which}Adjective` as SlotKey]));
        if (!w) fail(span, coded("noAdjectiveToRemove"));
        const chain = adjectiveSlots(w!.which!).filter((key) => w!.slice[key]);
        const key = index === undefined ? chain.at(-1) : adjectiveSlots(w!.which!)[index - 1];
        if (!key || !w!.slice[key]) fail(span, coded("noSuchAdjective", { index: index! }));
        this.updateSlice(containerId, w!.ref.slice, (s) => applyClear(s, key!));
        this.touch(w!.ref);
        return;
      }
      case "adv": {
        const w = closest((x) => {
          const slot = adverbTarget(x);
          return Boolean(slot && x.root[slot]);
        });
        if (!w) fail(span, coded("noAdverbToRemove"));
        this.updateRoot(containerId, (s) => applyClear(s, adverbTarget(w!)!));
        this.touch(w!.ref);
        return;
      }
      case "modal": {
        const root = this.root(containerId);
        const filled = MODAL_SLOTS.filter((key) => root[key]);
        const key = index === undefined ? filled.at(-1) : MODAL_SLOTS[index - 1];
        if (!key || !root[key]) fail(span, coded("noModalToRemove", index === undefined ? {} : { index }));
        this.updateRoot(containerId, (s) => applyClear(s, key!));
        this.touch({ containerId, slot: "verb" });
        return;
      }
      case "poss": {
        const w = closest((x) => x.kind === "noun" && Boolean(x.slice[`${x.which}Possessor` as keyof PhraseSelection] || x.slice[`${x.which}PossessorRef` as keyof PhraseSelection]));
        if (!w) fail(span, coded("noPossessorToRemove"));
        this.updateRoot(containerId, (root) =>
          updateNounAt(root, w!.address!, (s, which) => clearPossessorRef(removePossessor(s, which), which)),
        );
        this.touch(w!.ref);
        return;
      }
      // `/del outof` is the same removal, under the superlative's name (P09-E51 D3).
      case "than":
      case "outof": {
        const w = closest((x) => x.kind === "noun" && Boolean(x.slice[`${x.which}Standard` as keyof PhraseSelection]));
        if (!w) fail(span, coded("noStandardToRemove"));
        this.updateRoot(containerId, (root) => updateNounAt(root, w!.address!, (s, which) => removeStandard(s, which)));
        this.touch(w!.ref);
        return;
      }
      // Either relation's examples (P09-E48), under the reference step's name or either command's.
      case "eg":
      case "suchas":
      case "including": {
        const w = closest((x) => x.kind === "noun" && Boolean(x.slice[`${x.which}Examples` as keyof PhraseSelection]));
        if (!w) fail(span, coded("noExamplesToRemove"));
        this.updateRoot(containerId, (root) => updateNounAt(root, w!.address!, (s, which) => removeExamples(s, which)));
        this.touch(w!.ref);
        return;
      }
      case "and":
      case "or": {
        const w = closest((x) => x.kind === "noun" && !x.ref.slice && conjunctsOf(x.slice, x.which!).length > 0);
        if (!w) fail(span, coded("noConjunctToRemove"));
        const count = conjunctsOf(w!.slice, w!.which!).length;
        const i = index === undefined ? count - 1 : index - 2;
        if (i < 0 || i >= count) fail(span, coded("noSuchConjunct", { index: index! }));
        this.updateRoot(containerId, (root) => removeConjunct(root, w!.which!, i));
        this.touch(w!.ref);
        return;
      }
      case "rel": {
        const w = closest(
          (x) =>
            x.kind === "noun" &&
            (this.links.some((l) => isRelativeLink(l) && l.source.containerId === containerId && l.source.nounKey === x.address) ||
              this.queue.some((op) => op.kind === "relative" && op.source.containerId === containerId && op.source.nounKey === x.address)),
        );
        if (!w) fail(span, coded("noRelativeToRemove"));
        this.queue.push({ kind: "unlink", link: "relative", containerId, nounKey: w!.address!, span: item });
        this.touch(w!.ref);
        return;
      }
      // A demonstrative's contrast (P13): the closest noun that has one.
      case "contrast": {
        const w = closest((x) => x.kind === "noun" && Boolean(x.slice.contrastives?.[x.which!]));
        if (!w) fail(span, coded("nothingToRemove"));
        this.updateSlice(containerId, w!.ref.slice, (s) => setContrastive(s, w!.which!, false));
        this.touch(w!.ref);
        return;
      }
      // A noun's approximator (P09-E49): the closest noun that has one.
      case "approx": {
        const w = closest((x) => x.kind === "noun" && Boolean(x.slice.approximators?.[x.which!]));
        if (!w) fail(span, coded("nothingToRemove"));
        this.updateSlice(containerId, w!.ref.slice, (s) => setApproximated(s, w!.which!, false));
        this.touch(w!.ref);
        return;
      }
      // A noun's numeral (P13): the closest noun that has one.
      case "num": {
        const w = closest((x) => x.kind === "noun" && x.slice.numerals?.[x.which!] !== undefined);
        if (!w) fail(span, coded("nothingToRemove"));
        this.updateSlice(containerId, w!.ref.slice, (s) => setNumeral(s, w!.which!, undefined));
        this.touch(w!.ref);
        return;
      }
      // The head said again (P13): the closest noun whose relative clause is said alone.
      case "headless": {
        const w = closest(
          (x) =>
            x.kind === "noun" &&
            (this.links.some((l) => isRelativeLink(l) && l.headless && l.source.containerId === containerId && l.source.nounKey === x.address) ||
              this.queue.some((op) => op.kind === "headless" && op.headless && op.containerId === containerId && op.nounKey === x.address)),
        );
        if (!w) fail(span, coded("nothingToRemove"));
        this.queue.push({ kind: "headless", containerId, nounKey: w!.address!, headless: false, span: item });
        this.touch(w!.ref);
        return;
      }
      case "if":
      case "join":
      case "inst": {
        const link = what === "if" ? "condition" : what === "join" ? "join" : "instrument";
        this.queue.push({ kind: "unlink", link, containerId, span: item });
        return;
      }
      case "clause":
      case "sub":
      case "to": {
        const link = (Object.keys(SUBORDINATE_NAMES) as SubordinateKind[]).find((k) => SUBORDINATE_NAMES[k] === what)!;
        this.queue.push({ kind: "unlink", link, containerId, span: item });
        return;
      }
      case "period":
        return this.removePeriod(item, frame);
      // The question's gap, and the existential (P09-E12): the period's own, whatever is in reach.
      case "wh": {
        if (!this.root(containerId).questionRole) fail(span, coded("nothingToRemove"));
        // ASK's clause stays a question, a yes/no one (P09-E55 D3).
        const asked = this.reportedQuestion(containerId) === "interrogative";
        this.updateRoot(containerId, (s) => (asked ? setInterrogative(setQuestionRole(s, undefined), true) : setQuestionRole(s, undefined)));
        return;
      }
      case "there": {
        if (!this.root(containerId).existential) fail(span, coded("nothingToRemove"));
        this.updateRoot(containerId, (s) => setExistential(s, false));
        return;
      }
      // The humble register (P11-E6), the verb phrase's: the period's, whatever is in reach.
      case "humble": {
        if (!this.root(containerId).verbHumble) fail(span, coded("nothingToRemove"));
        this.updateRoot(containerId, (s) => setHumble(s, false));
        this.touch({ containerId, slot: "verb" });
        return;
      }
    }
    fail(span, coded("unknownRemoval", { what }));
  }

  /** Clear the word in hand; a nested phrase's head takes its whole phrase with it. */
  clearWord(w: WordInfo): void {
    const { containerId, slice, slot } = w.ref;
    if (w.kind === "modifierAdjective") {
      this.updateSlice(containerId, slice, (s) => setModifierAdjective(s, slot, undefined));
    } else if (slice && slot === "subject") {
      // A nested phrase's address ends in the step that made it: `…/possessor`, `…/standard`, or
      // `…/conjunct/<i>`.
      const steps = slice.split("/");
      if (steps.at(-1) === "possessor") {
        const possessed = steps.slice(0, -1).join("/");
        this.updateRoot(containerId, (root) =>
          updateNounAt(root, possessed, (s, which) => clearPossessorRef(removePossessor(s, which), which)),
        );
      } else if (steps.at(-1) === "standard") {
        const compared = steps.slice(0, -1).join("/");
        this.updateRoot(containerId, (root) => updateNounAt(root, compared, (s, which) => removeStandard(s, which)));
      } else if (steps.at(-1) === "examples") {
        const named = steps.slice(0, -1).join("/");
        this.updateRoot(containerId, (root) => updateNounAt(root, named, (s, which) => removeExamples(s, which)));
      } else {
        const i = Number(steps.at(-1));
        const base = steps.slice(0, -2).join("/");
        this.updateRoot(containerId, (root) => updateNounAt(root, base, (s, which) => removeConjunct(s, which, i)));
      }
    } else {
      this.updateSlice(containerId, slice, (s) => applyClear(s, slot));
    }
    this.touch(w.ref);
  }

  removePeriod(item: Item, frame: Frame): void {
    if (frame !== this.top) fail(item.head, coded("removePeriodInBracket", nest(frame)));
    const id = frame.containerId;
    const at = this.containers.findIndex((c) => c.id === id);
    // The workspace always keeps one period: the last one is emptied rather than removed.
    this.containers =
      this.containers.length > 1
        ? this.containers.filter((c) => c.id !== id)
        : this.containers.map((c) => (c.id === id ? { ...c, selection: {} } : c));
    this.links = dropContainerLinks(this.links, id);
    // The context goes to the period above the one removed — or, the first gone, to the new first.
    const here = this.containers[Math.max(0, at - 1)]!;
    frame.containerId = here.id;
    frame.words = [];
    frame.anchor = undefined;
  }

  // ── Links, last ──

  makeLinks(): void {
    // Each op is taken off the queue as it is made, so a second pass after a mistake only makes the
    // ones still waiting.
    while (this.queue.length) this.link(this.queue.shift()!);
  }

  resolveTarget(target: Target): string {
    if ("containerId" in target) {
      if (!this.containers.some((c) => c.id === target.containerId))
        fail({ from: 0, to: 0 }, coded("linkTargetRemoved"));
      return target.containerId;
    }
    const c = this.containers[target.period - 1];
    if (!c) fail(target.span, coded("noSuchPeriod", { period: target.period }));
    return c!.id;
  }

  link(op: LinkOp): void {
    const id = () => this.opts.newId();
    // A period the line removed after naming it (`/if ( … ) /del period`) takes its links with it.
    const from =
      op.kind === "relative"
        ? op.source.containerId
        : op.kind === "condition" || op.kind === "subordinate"
          ? op.mainId
          : op.kind === "join"
            ? op.firstId
            : op.kind === "instrument"
              ? op.clauseId
              : op.containerId;
    if (!this.containers.some((c) => c.id === from)) fail(op.span, coded("linkSourceRemoved"));
    switch (op.kind) {
      case "relative": {
        const target = { containerId: this.resolveTarget(op.target), nounKey: op.nounKey! };
        const why = this.relativeRefusal(op.source.containerId, target);
        if (why) fail(op.span, why);
        this.links = addRelativeLink(this.links, op.source, target, id());
        return;
      }
      case "condition": {
        const ifId = this.resolveTarget(op.target);
        const main = this.containers.find((c) => c.id === op.mainId)!;
        if (!canStartCondition(this.links, main))
          fail(op.span, coded("cantTakeCondition"));
        if (!canBeCondition(this.containers, this.links, op.mainId, ifId)) fail(op.span, this.clauseRefusal(op.mainId, ifId, "condition"));
        this.links = addConditional(this.links, op.mainId, ifId, id());
        return;
      }
      case "join": {
        const second = this.resolveTarget(op.target);
        const first = this.containers.find((c) => c.id === op.firstId)!;
        if (!canStartCoordination(this.links, first))
          fail(op.span, coded("cantStartCoordination"));
        if (!canBeCoordinate(this.containers, this.links, op.firstId, second)) {
          const other = this.containers.find((c) => c.id === second);
          if (other && Boolean(other.selection.imperative) !== Boolean(first.selection.imperative))
            fail(op.span, coded("joinMoodMismatch", { imperative: Boolean(first.selection.imperative) }));
          fail(op.span, this.clauseRefusal(op.firstId, second, "coordinate"));
        }
        this.links = addCoordinative(this.links, op.firstId, second, op.conjunction, id());
        return;
      }
      case "subordinate": {
        const clauseId = this.resolveTarget(op.target);
        const main = this.containers.find((c) => c.id === op.mainId)!;
        const verb = main.selection.verb;
        // P13: with no subject word the that-clause is the subject, whatever the verb takes; with no
        // verb either, the adverbial clause is the adverb it glosses (see subordinateReading).
        const reading = subordinateReading(main.selection);
        if (!verb && !(reading === "adverb" && op.link === "adverbial")) fail(op.span, coded("subordinateNeedsVerb"));
        if (op.link === "content" && reading !== "subject" && verb!.clauseObject !== "content")
          fail(op.span, coded("takesNoContentClause", { verb: this.vocab.label(verb!) }));
        if (op.link === "content" && reading !== "subject" && main.selection.directObject) fail(op.span, coded("contentClauseHasObject"));
        if (op.link === "infinitive" && !governsInfinitive(main.selection))
          fail(op.span, coded("takesNoInfinitive", { verb: this.vocab.label(verb!) }));
        if (!canStartSubordinate(this.links, main, op.link)) fail(op.span, coded("cantTakeSubordinate"));
        if (!canBeSubordinate(this.containers, this.links, op.mainId, clauseId, op.link))
          fail(op.span, this.clauseRefusal(op.mainId, clauseId, "subordinate", op.link === "content" && Boolean(governedForce(main))));
        this.links = addSubordinate(this.links, op.mainId, clauseId, op.link, id(), op.conjunction);
        // The infinitive complement and the clause of purpose (P13) are drawn in the infinitive mood, as
        // the canvas's pick sets them.
        if (op.link === "infinitive" || op.link === "purpose") this.updateRoot(clauseId, (root) => setInfinitive(root, true));
        // The clause of a verb that reports only questions (ASK) is one, as the canvas's pick makes it
        // (P09-E55 D3): "/verb ( ask ) /clause { … }" asks whether.
        if (op.link === "content" && governedForce(main) === "interrogative")
          this.updateRoot(clauseId, (root) => setInterrogative(root, true));
        return;
      }
      case "instrument": {
        const instrument = this.resolveTarget(op.target);
        if (!canBeInstrument(this.containers, this.links, op.clauseId, instrument, op.level)) {
          const other = this.containers.find((c) => c.id === instrument);
          if (other?.selection.verb && op.level === "object")
            fail(op.span, coded("instrumentThingHasVerb"));
          fail(op.span, this.clauseRefusal(op.clauseId, instrument, "instrument"));
        }
        this.links = addInstrumental(this.links, op.clauseId, instrument, id(), op.level);
        if (op.negative) this.links = setInstrumentalNegative(this.links, op.clauseId, true);
        return;
      }
      case "possessorRef": {
        // A noun it can copy, or the subject it links to — the addressee of a command, the controller
        // of an infinitive, which no box holds (P11-E7 D6).
        if (!pointerHolds(this.root(op.containerId), op.possessed, op.antecedent))
          fail(op.span, coded("noNounAt", { ref: printRefText(this.periodNumber(op.containerId), op.antecedent) }));
        this.updateRoot(op.containerId, (root) =>
          updateNounAt(root, op.possessed, (s, which) => setPossessorRef(s, which, op.antecedent)),
        );
        return;
      }
      case "level": {
        if (!this.links.some((l) => isInstrumentalLink(l) && (l.source.containerId === op.containerId || l.target.containerId === op.containerId)))
          fail(op.span, coded("noInstrumentLink"));
        this.links = setInstrumentalLevel(this.links, op.containerId, op.level);
        return;
      }
      case "privative": {
        if (!this.links.some((l) => isInstrumentalLink(l) && (l.source.containerId === op.containerId || l.target.containerId === op.containerId)))
          fail(op.span, coded("noInstrumentLink"));
        this.links = setInstrumentalNegative(this.links, op.containerId, op.negative);
        return;
      }
      case "control": {
        const infinitive = (l: PhraseLink) =>
          isSubordinateLink(l) && l.kind === "infinitive" && (l.source.containerId === op.containerId || l.target.containerId === op.containerId);
        if (!this.links.some(infinitive)) fail(op.span, coded("noInfinitiveLink"));
        this.links = setInfinitiveControl(this.links, op.containerId, op.object);
        return;
      }
      case "headless": {
        if (!this.links.some((l) => isRelativeLink(l) && l.source.containerId === op.containerId && l.source.nounKey === op.nounKey))
          fail(op.span, coded("noRelativeLink"));
        this.links = setRelativeHeadless(this.links, op.containerId, op.nounKey, op.headless);
        return;
      }
      case "unlink": {
        const before = this.links;
        if (op.link === "relative") this.links = removeRelativeLink(this.links, op.containerId, op.nounKey!);
        else if (op.link === "condition") this.links = clearConditional(this.links, op.containerId);
        else if (op.link === "join") this.links = clearCoordinative(this.links, op.containerId);
        else if (op.link === "instrument") this.links = clearInstrumental(this.links, op.containerId);
        else this.links = clearSubordinate(this.links, op.containerId, op.link);
        if (before.length === this.links.length && op.link !== "relative")
          fail(op.span, coded("noLinkToRemove", {
            link: op.link === "condition" || op.link === "join" || op.link === "instrument" ? op.link : "subordinate",
          }));
        return;
      }
    }
  }

  /** Why a relative link can't be made, in the terms a user would give — or nothing if it can. */
  relativeRefusal(sourceId: string, target: { containerId: string; nounKey: RelativeGap }): Coded | undefined {
    const n = this.periodNumber(target.containerId);
    const ref = printRefText(n, target.nounKey);
    if (sourceId === target.containerId) return coded("relativeSamePeriod");
    // The capacity one acts in is never a relative's gap (P09-E44, A288): choose another noun.
    // Nor is the vocative (P11-E8), which no relative clause has: the same refusal names the nouns to choose.
    if (target.nounKey === "role" || (target.nounKey as string) === "vocative") return coded("relativeGapRole", { period: n });
    const c = this.containers.find((x) => x.id === target.containerId);
    // A gap no box holds (P13): the instrument of a verb that takes one, unlinked; the subject's possessor.
    const there =
      target.nounKey === "instrumental"
        ? Boolean(c?.selection.verb?.complements?.includes("instrumental")) &&
          !this.links.some((l) => isInstrumentalLink(l) && l.source.containerId === target.containerId)
        : target.nounKey === "subject/possessor"
          ? Boolean(c?.selection.subjectPossessor?.subject)
          : Boolean(c?.selection[target.nounKey]);
    if (!there) return coded("relativeGapEmpty", { ref });
    if (relativeTargetKeys(this.links, target.containerId).has(target.nounKey)) return coded("relativeGapTaken", { ref });
    if (isSelfOrAncestor(target.containerId, sourceId, this.links)) return coded("linkCircle", { period: n });
    return undefined;
  }

  // `questionLicensed`: a that-clause of a verb that reports a question (P09-E55), which a question
  // target does not bar.
  clauseRefusal(sourceId: string, targetId: string, role: ClauseRole, questionLicensed = false): Coded {
    const n = this.periodNumber(targetId);
    if (sourceId === targetId) return coded("clauseSelf", { role });
    if (isSelfOrAncestor(targetId, sourceId, this.links)) return coded("linkCircle", { period: n });
    if (inClauseRelation(this.links, targetId)) return coded("clauseInOtherLink", { period: n });
    // An if-clause and a subordinate clause ask nothing, so a question is refused as either (A268,
    // P09-E12 M5); a coordinate's mood is the pair's, and a question joins a question.
    const target = this.containers.find((c) => c.id === targetId)?.selection;
    if ((role === "condition" || (role === "subordinate" && !questionLicensed)) && (target?.interrogative || target?.questionRole))
      return coded("clauseQuestion", { period: n, role });
    return coded("clauseCannot", { period: n, role });
  }
}

/**
 * Why a period offers no box for a role — an object wants a transitive verb, a complement a verb that
 * licenses it, and an instrument held as a thing has no verb — or nothing, when it does.
 */
export function roleRefusal(
  state: WorkspaceState,
  containerId: string,
  slot: SlotKey,
  def: CommandDef,
  vocab: Vocabulary,
): Coded | undefined {
  const root = state.containers.find((c) => c.id === containerId)?.selection ?? {};
  const verb = root.verb;
  const verbName = verb ? vocab.label(verb) : "";
  if (slot === "verb") {
    const objectInstrument = state.links.some(
      (l) => isInstrumentalLink(l) && l.target.containerId === containerId && (l.level ?? "object") === "object",
    );
    return objectInstrument ? coded("instrumentAsThing") : undefined;
  }
  if (slot === "subject") return undefined;
  // The interjection is the period's own, whatever its clause holds (P09-E47).
  if (slot === "interjection") return undefined;
  // So is the vocative (P11-E8), which calls the hearer of any period: a linked clause, a citation or an
  // instruction holds one, dimmed, and the plan leaves it out (see vocativeOffered).
  if (slot === "vocative") return undefined;
  if (slot === "directObject") {
    if (!verb) return coded("objectNeedsVerb");
    // A that-clause the period governs is its verb's object already (P09-E12 D9), as the canvas
    // withdraws the object box for it.
    const clauseObject = state.links.some(
      (l) => isSubordinateLink(l) && l.kind === "content" && l.source.containerId === containerId,
    );
    return verb.transitivity === "intransitive" || clauseObject ? coded("takesNoObject", { verb: verbName }) : undefined;
  }
  if (!verb) return coded("complementNeedsVerb", { command: def.name });
  // The role commands left name the complements a verb licenses (see COMMANDS' role entries).
  return offeredComplements(verb).includes(slot as never)
    ? undefined
    : coded("takesNoComplement", { verb: verbName, command: def.name, slot: slot as ComplementSlot });
}

/**
 * What a `/wh` relation value (`specifier:under`, `temporal:until`, `sentiment:positive`, see
 * QUESTION_RELATION_VALUES) writes onto the period for the asked `role`, or undefined where the box
 * has no such setting — a companion has no relation, a time no path (P09-E53 D5).
 */
function questionRelation(role: QuestionRole, value: string): ((sel: PhraseSelection) => PhraseSelection) | undefined {
  const [kind, v] = value.split(":") as [string, string];
  if (kind === "specifier" && (role === "direction" || ((role === "locative" || role === "route") && v !== "to")))
    return (sel) => setSpecifier(sel, v === "to" ? undefined : (v as PathSpecifier), role);
  if (kind === "temporal" && role === "temporal") return (sel) => setTemporalRelation(sel, v as TemporalRelation);
  if (kind === "sentiment" && role === "cause") return (sel) => setSentiment(sel, v as CauseSentiment);
  return undefined;
}

/** The period slot a `/del` target names by its role command's name or alias. */
function roleSlot(name: string): SlotKey | undefined {
  const def = commandNamed(name);
  return def?.action.kind === "role" ? def.action.slot : undefined;
}

/**
 * Where the context goes once a line is committed: like the pickers' auto-advance, on from the last
 * period word the line filled (`/subj cat /adj brown /pl` → the verb) to the next main word still to
 * choose; else it stays on the last word written.
 */
export function advanceContext(
  before: WorkspaceState,
  after: WorkspaceState,
  result: Pick<ApplyResult, "context" | "filled">,
): ConsoleContext {
  const context = result.context;
  const word = result.filled.filter((w) => w.containerId === context.containerId).at(-1);
  if (!word || word.slice || word.modifierAdjective) return context;
  const was = before.containers.find((c) => c.id === context.containerId)?.selection;
  const now = after.containers.find((c) => c.id === context.containerId)?.selection;
  const concept = now?.[word.slot];
  if (!now || !concept || was?.[word.slot]) return context;
  const next = nextActiveSlot({
    slot: word.slot,
    concept,
    selection: now,
    visibleSlots: visibleSlotsFor(now, undefined),
  });
  return next ? { containerId: context.containerId, word: { containerId: context.containerId, slot: next } } : context;
}

/** Whether a word ref still names a box of the workspace. */
export function wordExists(state: WorkspaceState, ref: WordRef): boolean {
  const root = state.containers.find((c) => c.id === ref.containerId)?.selection;
  return Boolean(root && sliceOf(root, ref.slice));
}
