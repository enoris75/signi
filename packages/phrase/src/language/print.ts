import { COMPLEMENT_RENDER_ORDER, type Concept } from "@signi/shared";
import {
  CONJUNCTION_KEY,
  POSSESSOR_KEY,
  POSSESSOR_REF_KEY,
  STANDARD_KEY,
  conjunctAddress,
  imperativePerson,
  imperativeRegisterOf,
  isConditionalLink,
  isCoordinativeLink,
  isSubordinateLink,
  isInstrumentalLink,
  isRelativeLink,
  possessorAddress,
  standardAddress,
  type NounAddress,
  type NounKey,
  type PhraseSelection,
  type SlotKey,
} from "../model/interfaces.ts";
import { conjunctsOf } from "../model/phraseReducers.ts";
import { resolveAntecedent } from "../model/selectionToPlan/index.ts";
import { adjectiveSlots, isBoxComplement, MODAL_SLOTS, modalAdverbFor } from "../model/slots.ts";
import {
  COORD_VALUES,
  LEVEL_VALUES,
  PERSON_VALUES,
  QUESTION_SLOT_VALUES,
  REGISTER_VALUES,
  SUBORDINATE_NAMES,
  SUB_VALUES,
  commandByAction,
  roleCommand,
  settingWords,
  type Setting,
  type TokenColor,
} from "./commands.ts";
import type { ResolvedWord } from "./apply.ts";
import { CLOSER, type Shape } from "./lex.ts";
import { bracketColor } from "./parse.ts";
import { printRef, printWord, wordSpecFor } from "./resolve.ts";
import type { Span, Vocabulary, WordRef, WorkspaceState } from "./types.ts";
import { currentSetting, defaultSetting, settingTakes, wordInfo, type WordInfo } from "./words.ts";

/**
 * The canonical text of a period — deterministic, and read back by `apply` into the same period.
 *
 * Subject → verb (adverb, modals and theirs, tense, aspect, voice, polarity) → object → complements in
 * render order → the period's own links. Within a noun: word → adjectives → number → gender →
 * determiner → relation → degree → standard of comparison → possessor → conjuncts → relative clause. Only what differs from the default
 * is written, so a plain period reads plainly.
 *
 * Every word of the period is written in its own bracket, with all that describes it:
 * `/subj ( cat /adj brown /pl ) /verb ( eat /past )`. Inside, an adjective or a modal takes a bracket
 * of its own when something describes it in turn (`/adj ( big /more )`); a noun modifier always does,
 * so what follows it is the head's. A possessor, or a conjunct with more than its word, is a noun
 * phrase in square brackets, its head word first: `/poss [ child /adj old ]`.
 *
 * Clauses are periods of their own, so each prints on its own line and a link to one is a reference
 * (`/rel #2.subj`) — the braces a new clause is typed in (`/rel subj { … }`) are never printed.
 *
 * **Invariant:** for every reachable state, applying the printed text to an empty workspace gives the
 * state back (see the round-trip tests).
 *
 * Every token carries the box it belongs to, which is what lights a box when its token is pointed at
 * and a token when its box is; and every command is a *statement* with a stable key, which is what an
 * echo diffs (see diff.ts).
 */

export type PrintKind = "command" | "word" | "value" | "ref" | "open" | "close";

export interface PrintToken extends Span {
  text: string;
  kind: PrintKind;
  color: TokenColor;
  italic?: boolean;
  /** A word's own bracket — part of how it is written, not of any one statement's text. */
  element?: boolean;
  /** The box this token belongs to. */
  word?: WordRef;
  /** The statement it is part of (an index into `statements`). */
  statement: number;
}

export interface Statement {
  /** Stable across prints: the same control on the same box always has the same key. */
  key: string;
  /** The statement as written: "/past", "/subj cat", "/rel #2.subj", "/poss ( … )". */
  text: string;
  /** The word the statement is about — what an echo names after the dot. */
  owner?: WordRef;
  /** The box the statement acts on — where the console's context goes when the canvas changes it. */
  about?: WordRef;
  /** What an echo writes when the statement disappears: the default it went back to, or a /del. */
  removal: string;
  /** A statement that only moves the context (a bare `/subj` re-anchoring) — never echoed. */
  anchor?: boolean;
  /**
   * For a phrase in brackets: the address of the phrase's head, under which every statement inside
   * it lives, and the whole bracket as written — what an echo writes when the phrase appears.
   */
  scope?: string;
  full?: string;
}

export interface PrintedPeriod {
  text: string;
  tokens: PrintToken[];
  statements: Statement[];
}

/** A word's identity within its period, for statement keys. */
export const wordKey = (ref: WordRef): string =>
  `${ref.slice ?? ""}|${ref.slot}${ref.modifierAdjective ? "+adj" : ""}`;

class Printer {
  tokens: PrintToken[] = [];
  statements: Statement[] = [];
  private pos = 0;
  private current = -1;

  constructor(
    readonly state: WorkspaceState,
    readonly containerId: string,
    readonly vocab: Vocabulary,
  ) {}

  get root(): PhraseSelection {
    return this.state.containers.find((c) => c.id === this.containerId)?.selection ?? {};
  }

  /**
   * Open a statement; every token emitted until the next one belongs to it. `text` stands for tokens
   * that would not say it alone — a phrase's head word, written without its `/subj`.
   */
  statement(s: Omit<Statement, "text"> & { text?: string }): number {
    this.statements.push({ ...s, text: s.text ?? "" });
    this.current = this.statements.length - 1;
    return this.current;
  }

  emit(
    text: string,
    kind: PrintKind,
    color: TokenColor,
    extra: { word?: WordRef; italic?: boolean; statement?: number; element?: boolean } = {},
  ) {
    if (this.tokens.length) this.pos += 1;
    const statement = extra.statement ?? this.current;
    this.tokens.push({
      text,
      kind,
      color,
      italic: extra.italic,
      word: extra.word,
      from: this.pos,
      to: this.pos + text.length,
      statement,
      ...(extra.element && { element: true }),
    });
    this.pos += text.length;
  }

  done(): PrintedPeriod {
    // A statement is what the console would type to make it: its command and argument, flat — a
    // phrase's bracket as `[ … ]`, a word's own bracket not at all.
    const statements = this.statements.map((s, i) => ({
      ...s,
      text:
        s.text ||
        this.tokens
          .filter((t) => t.statement === i && !t.element)
          .map((t) => (t.kind === "open" ? `${t.text} … ${CLOSER[t.text as Shape]}` : t.kind === "close" ? "" : t.text))
          .filter(Boolean)
          .join(" "),
    }));
    // Spans from the tokens as they stand: a bracket dropped after it was written moves what follows.
    let pos = 0;
    for (const t of this.tokens) {
      t.from = pos;
      t.to = pos + t.text.length;
      pos = t.to + 1;
    }
    return { text: this.tokens.map((t) => t.text).join(" "), tokens: this.tokens, statements };
  }

  info(ref: WordRef): WordInfo | undefined {
    return wordInfo(this.state.containers, ref);
  }

  periodNumber(id: string): number {
    return this.state.containers.findIndex((c) => c.id === id) + 1;
  }

  word(concept: Concept, slot: SlotKey, frame: "period" | "possessor" | "standard" | "conjunct" = "period"): string {
    return printWord(concept, wordSpecFor(slot, frame), this.vocab);
  }

  // ── A period ──

  period(root: PhraseSelection): void {
    const id = this.containerId;
    // The mood first: a command is what the rest is said as.
    if (root.imperative) {
      this.statement({ key: ":mood", removal: "/statement" });
      this.emit("/command", "command", "setting");
      const person = imperativePerson(root);
      const register = imperativeRegisterOf(root);
      if (person !== "2sg") this.emit(PERSON_VALUES.find((v) => v.value === person)!.name, "value", "setting");
      if (register === "instruction") this.emit(REGISTER_VALUES.find((v) => v.value === register)!.name, "value", "setting");
    } else if (root.infinitive) {
      this.statement({ key: ":mood", removal: "/statement" });
      this.emit("/inf", "command", "setting");
    } else if (root.interrogative && !root.questionRole) {
      // The question (P09-E12): a wh-question's /wh says it on its own, so /ask is the yes/no one's.
      this.statement({ key: ":mood", removal: "/statement" });
      this.emit("/ask", "command", "setting");
    }
    // The slot the question asks about, and its who / what where the user chose one — period-level,
    // since the gap usually holds no word for a bracket to hang it on.
    if (root.questionRole) {
      this.statement({ key: ":wh", removal: "/del wh" });
      this.emit("/wh", "command", "setting");
      this.emit(QUESTION_SLOT_VALUES.find((v) => v.value === root.questionRole)!.name, "value", "setting");
      if (root.questionAnimate !== undefined) this.emit(root.questionAnimate ? "who" : "what", "value", "setting");
    }
    // The existential, a fact of the clause after its force (P09-E12).
    if (root.existential) {
      this.statement({ key: ":there", removal: "/del there" });
      this.emit("/there", "command", "setting");
    }
    this.noun(root, "subject", undefined, "period");
    this.verbBlock(root);
    this.noun(root, "directObject", undefined, "period");
    for (const type of COMPLEMENT_RENDER_ORDER) {
      // The instrumental is a period of its own, printed with the links below; the plan-only
      // complements have no selection to print at all (see `isBoxComplement`).
      if (!isBoxComplement(type)) continue;
      this.noun(root, type, undefined, "period");
    }
    // The period's own links: its if-clause, its coordinate, its subordinate clause, its instrument.
    for (const link of this.state.links) {
      if (link.source.containerId !== id || !this.periodNumber(link.target.containerId)) continue;
      if (isConditionalLink(link)) {
        this.statement({ key: ":if", removal: "/del if" });
        this.emit("/if", "command", "warning");
        this.emit(printRef(this.periodNumber(link.target.containerId)), "ref", "ref");
      } else if (isCoordinativeLink(link)) {
        this.statement({ key: ":join", removal: "/del join" });
        this.emit("/join", "command", "info");
        this.emit(COORD_VALUES.find((v) => v.value === link.conjunction)!.name, "value", "setting");
        this.emit(printRef(this.periodNumber(link.target.containerId)), "ref", "ref");
      } else if (isSubordinateLink(link)) {
        // `/clause #2`, `/sub when #2`, `/to #2` (P09-E12 D9), each taken back by its own `/del`.
        const name = SUBORDINATE_NAMES[link.kind];
        this.statement({ key: `:${name}`, removal: `/del ${name}` });
        this.emit(`/${name}`, "command", "error");
        if (link.kind === "adverbial")
          this.emit(SUB_VALUES.find((v) => v.value === link.conjunction)!.name, "value", "setting");
        this.emit(printRef(this.periodNumber(link.target.containerId)), "ref", "ref");
        // The object's infinitive, a causee's (P13): its own statement, taken back by /subjctl.
        if (link.kind === "infinitive" && link.control === "object") {
          this.statement({ key: ":objctl", removal: "/subjctl" });
          this.emit("/objctl", "command", "setting");
        }
      } else if (isInstrumentalLink(link)) {
        this.statement({ key: ":inst", removal: "/del inst" });
        this.emit("/inst", "command", "secondary");
        this.emit(printRef(this.periodNumber(link.target.containerId)), "ref", "ref");
        const level = link.level ?? "object";
        if (level !== "object") {
          this.statement({ key: ":level", removal: "/level object" });
          this.emit("/level", "command", "setting");
          this.emit(LEVEL_VALUES.find((v) => v.value === level)!.name, "value", "setting");
        }
        // The instrument denied, the privative (P09-E2): its own statement, taken back by /posinst.
        if (link.negative) {
          this.statement({ key: ":privative", removal: "/posinst" });
          this.emit("/without", "command", "setting");
        }
      }
    }
  }

  verbBlock(root: PhraseSelection): void {
    const id = this.containerId;
    const verbRef: WordRef = { containerId: id, slot: "verb" };
    const w = this.info(verbRef)!;
    const settings = (["tense", "aspect", "voice", "polarity"] as const).filter(
      (s) => settingTakes({ id: s } as Setting, w) && currentSetting(s, w) !== defaultSetting(s, w),
    );
    const hasModal = MODAL_SLOTS.some((key) => root[key]);
    if (!root.verb && !root.modifier && !hasModal && settings.length === 0) return;
    const statement = this.statement({ key: `${wordKey(verbRef)}:word`, removal: "/del verb", owner: verbRef, about: verbRef });
    this.emit("/verb", "command", "secondary", { word: verbRef });
    this.emit("(", "open", "secondary", { word: verbRef, element: true });
    if (root.verb) this.emit(this.word(root.verb, "verb"), "word", "secondary", { word: verbRef, italic: true });
    // The verb's own adverb and its own settings before any modal: after one, `/adv` and `/not`
    // would be the modal's (both attach to the closest verb or modal).
    if (root.modifier) this.wordStatement({ containerId: id, slot: "modifier" }, "/adv", "info", root.modifier, verbRef);
    for (const s of settings) this.setting({ id: s, value: currentSetting(s, w) } as Setting, w);
    for (const key of MODAL_SLOTS) {
      const modal = root[key];
      if (!modal) continue;
      const ref: WordRef = { containerId: id, slot: key };
      const adverbKey = modalAdverbFor(key)!;
      const adverb = root[adverbKey];
      const modalWord = this.info(ref)!;
      // A modal's own polarity is printed inside its bracket, where `/not` denies the modal and
      // not the verb. Its affirmative is the default and stays unwritten.
      const negated = this.holds(modalWord, "polarity");
      // A modal with an adverb or a polarity of its own wears a bracket, which keeps both its.
      const own = this.wordStatement(ref, "/modal", "secondary", modal, verbRef, Boolean(adverb) || negated);
      if (adverb) this.wordStatement({ containerId: id, slot: adverbKey }, "/adv", "info", adverb, ref);
      if (negated) this.setting({ id: "polarity", value: currentSetting("polarity", modalWord) } as Setting, modalWord);
      if (adverb || negated) this.emit(")", "close", "secondary", { word: ref, element: true, statement: own });
    }
    this.emit(")", "close", "secondary", { word: verbRef, element: true, statement });
  }

  /**
   * A word that fills a box of its own: `/adv fast`, `/modal can` — or, `open`, its bracket's start,
   * `/modal ( can`, which the caller closes once it has written what describes the word.
   */
  wordStatement(ref: WordRef, command: string, color: TokenColor, concept: Concept, owner?: WordRef, open = false): number {
    const statement = this.statement({ key: `${wordKey(ref)}:word`, removal: `/del ${command.slice(1)}`, owner, about: ref });
    this.emit(command, "command", color, { word: ref });
    if (open) this.emit("(", "open", color, { word: ref, element: true });
    this.emit(this.word(concept, ref.slot), "word", color, { word: ref, italic: true });
    return statement;
  }

  /** Whether a word holds a value of a setting other than its default — what `settings` writes. */
  holds(w: WordInfo, id: Setting["id"]): boolean {
    const value = currentSetting(id, w);
    return value !== undefined && value !== defaultSetting(id, w) && settingTakes({ id, value } as Setting, w);
  }

  /** A setting on a word, written as the command that sets its current value. */
  setting(s: Setting, w: WordInfo): void {
    const def = settingWords(s);
    const back = settingWords({ id: s.id, value: defaultSetting(s.id, w) } as Setting);
    this.statement({ key: `${wordKey(w.ref)}:${s.id}`, removal: [back.command, back.value].filter(Boolean).join(" "), owner: w.ref, about: w.ref });
    this.emit(def.command, "command", "setting", { word: w.ref });
    if (def.value) this.emit(def.value, "value", "setting", { word: w.ref });
  }

  /** The settings a word holds, other than its defaults, in canonical order. */
  settings(w: WordInfo, ids: readonly Setting["id"][]): void {
    for (const id of ids) {
      const value = currentSetting(id, w);
      if (value === undefined || value === defaultSetting(id, w)) continue;
      const s = { id, value } as Setting;
      if (!settingTakes(s, w)) continue;
      this.setting(s, w);
    }
  }

  // ── A noun and everything it carries ──

  /**
   * A noun and what hangs off it: `/subj ( cat … )`. `slice` is the address of the nested phrase `sel`
   * is (undefined for the period itself); `frame` says which kind of phrase that is. `lead`: the head
   * of a phrase in square brackets, written as the bracket's first word, without a command or a
   * bracket of its own.
   */
  noun(
    sel: PhraseSelection,
    which: NounKey,
    slice: NounAddress | undefined,
    frame: "period" | "possessor" | "standard" | "conjunct",
    lead = false,
  ): void {
    const id = this.containerId;
    const concept = sel[which];
    if (!concept) return;
    const ref: WordRef = { containerId: id, slice, slot: which };
    const w = this.info(ref)!;
    const role = roleCommand(which)!;
    const color = role.color;
    const word = this.word(concept, which, frame);
    const statement = this.statement({
      key: `${wordKey(ref)}:word`,
      removal: `/del ${role.name}`,
      owner: slice ? ref : undefined,
      about: ref,
      ...(lead && { text: `/${role.name} ${word}` }),
    });
    if (!lead) {
      this.emit(`/${role.name}`, "command", color, { word: ref });
      this.emit("(", "open", color, { word: ref, element: true });
    }
    this.emit(word, "word", color, { word: ref, italic: true });

    // Its adjectives. One takes a bracket when something describes it in turn — and a noun modifier
    // always, since what follows a bare one (`/adj`, `/pl`) would be its own rather than the head's.
    // So does every one when the head's own degree is written after them.
    const chain = adjectiveSlots(which).filter((key) => sel[key]);
    const headDegree = this.holds(w, "degree");
    // A noun modifier's bracket around its word alone, while nothing may follow it yet.
    let bare: PrintToken[] | undefined;
    for (const key of chain) {
      const adjective = sel[key]!;
      const adjRef: WordRef = { containerId: id, slice, slot: key };
      const aw = this.info(adjRef)!;
      const modifier = adjective.role === "noun";
      const ids: Setting["id"][] = modifier ? ["number", "relation"] : ["degree"];
      const own = modifier ? sel.modifierAdjectives?.[key] : undefined;
      const bracket = modifier || headDegree || ids.some((i) => this.holds(aw, i));
      const adjStatement = this.statement({ key: `${wordKey(adjRef)}:word`, removal: "/del adj", owner: ref, about: adjRef });
      this.emit("/adj", "command", "error", { word: adjRef });
      if (bracket) this.emit("(", "open", "error", { word: adjRef, element: true });
      const open = bracket ? this.tokens.at(-1) : undefined;
      this.emit(this.word(adjective, key), "word", "error", { word: adjRef, italic: true });
      this.settings(aw, ids);
      if (own) {
        const ownRef: WordRef = { ...adjRef, modifierAdjective: true };
        this.statement({ key: `${wordKey(ownRef)}:word`, removal: "/del", owner: adjRef, about: ownRef });
        this.emit("/adj", "command", "error", { word: ownRef });
        this.emit(printWord(own, { roles: ["adjective"] }, this.vocab), "word", "error", { word: ownRef, italic: true });
      }
      if (open) {
        this.emit(")", "close", "error", { word: adjRef, element: true, statement: adjStatement });
        bare = this.tokens.at(-3) === open ? [open, this.tokens.at(-1)!] : undefined;
      } else {
        bare = undefined;
      }
    }
    const afterAdjectives = this.tokens.length;
    this.settings(w, ["number", "gender", "determiner", "specifier", "gloss", "temporal", "predication", "sentiment", "causePolarity", "degree"]);
    const address = w.address!;

    // A predicate adjective's standard of comparison, after its degree (P09-E12 D5): a phrase of its
    // own in brackets. It is written under any degree — one that takes none only mutes it — so the
    // word the user gave comes back with the line.
    const standard = sel[STANDARD_KEY(which)] as PhraseSelection | undefined;
    if (!slice && which === "predicative" && concept.role === "adjective" && standard && Object.keys(standard).length)
      this.phrase(ref, "/than", `${wordKey(ref)}:than`, "/del than", standard, standardAddress(address), "standard");

    // Its possessor: a phrase of its own in brackets, or a reference to another noun of the period.
    const possessorRef = sel[POSSESSOR_REF_KEY(which)] as NounAddress | undefined;
    const possessor = sel[POSSESSOR_KEY(which)] as PhraseSelection | undefined;
    // A reference whose noun has since gone points at nothing, and renders nothing.
    if (possessorRef && resolveAntecedent(this.root, possessorRef)) {
      this.statement({ key: `${wordKey(ref)}:possref`, removal: "/del poss", owner: ref, about: ref });
      this.emit("/poss", "command", "primary", { word: ref });
      this.emit(printRef(this.periodNumber(id), possessorRef), "ref", "ref");
    } else if (possessor && Object.keys(possessor).length) {
      this.phrase(ref, "/poss", `${wordKey(ref)}:poss`, "/del poss", possessor, possessorAddress(address), "possessor");
      // What it is to the noun (P13), once it is there to be read back onto.
      this.settings(w, ["possessorRole"]);
    }

    // Its conjuncts: a bare word where the phrase is only its word, else a bracket.
    const conjuncts = conjunctsOf(sel, which);
    if (conjuncts.length) {
      const conjunction = (sel[CONJUNCTION_KEY(which)] as string | undefined) ?? "and";
      conjuncts.forEach((c, i) => {
        const cAddress = conjunctAddress(address, i);
        const key = `${wordKey(ref)}:and:${i}`;
        const headRef: WordRef = { containerId: id, slice: cAddress, slot: "subject" };
        // A conjunct that heads a relative clause of its own says so inside its brackets.
        const relative = this.state.links.some(
          (l) => isRelativeLink(l) && l.source.containerId === id && l.source.nounKey === cAddress,
        );
        if (c.subject && isBareConjunct(c) && !relative) {
          this.statement({ key, removal: `/del and ${i + 2}`, owner: ref, about: headRef });
          this.emit(`/${conjunction}`, "command", "primary", { word: headRef });
          this.emit(this.word(c.subject, "subject", "conjunct"), "word", "primary", { word: headRef, italic: true });
        } else {
          this.phrase(ref, `/${conjunction}`, key, `/del and ${i + 2}`, c, cAddress, "conjunct");
        }
      });
    }

    // Its relative clause.
    const rel = this.state.links.find(
      (l) =>
        isRelativeLink(l) &&
        l.source.containerId === id &&
        l.source.nounKey === address &&
        this.periodNumber(l.target.containerId) > 0,
    );
    if (rel && isRelativeLink(rel)) {
      this.statement({ key: `${wordKey(ref)}:rel`, removal: "/del rel", owner: ref, about: ref });
      this.emit("/rel", "command", "primary", { word: ref });
      this.emit(printRef(this.periodNumber(rel.target.containerId), rel.target.nounKey), "ref", "ref");
      // Said alone, its head unspoken (P13).
      if (rel.headless) {
        this.statement({ key: `${wordKey(ref)}:headless`, removal: "/del headless", owner: ref, about: ref });
        this.emit("/headless", "command", "setting", { word: ref });
      }
    }
    // Nothing came after the last noun modifier: its bracket says nothing.
    if (bare && this.tokens.length === afterAdjectives)
      this.tokens = this.tokens.filter((t) => !bare!.includes(t));
    if (!lead) this.emit(")", "close", color, { word: ref, element: true, statement });
  }

  /** A noun phrase in square brackets, its head word first: `/poss [ man /adj old ]`. */
  phrase(
    owner: WordRef,
    command: string,
    key: string,
    removal: string,
    sel: PhraseSelection,
    slice: NounAddress,
    frame: "possessor" | "standard" | "conjunct",
  ): void {
    const color = bracketColor(commandByAction(frame));
    const statement = this.statement({ key, removal, owner, about: owner, scope: slice });
    const first = this.tokens.length;
    this.emit(command, "command", "primary", { word: { containerId: this.containerId, slice, slot: "subject" } });
    this.emit("[", "open", color);
    this.noun(sel, "subject", slice, frame, true);
    this.emit("]", "close", color, { statement });
    this.statements[statement]!.full = this.tokens
      .slice(first)
      .map((t) => t.text)
      .join(" ");
  }
}

/** A conjunct that is nothing but its word (and the defaults a pick seeds), written without brackets. */
function isBareConjunct(c: PhraseSelection): boolean {
  return Object.entries(c).every(([k, v]) => {
    if (k === "subject") return true;
    if (v === undefined) return true;
    if (k === "subjectNumber") return v === "singular";
    if (k === "subjectGender") return v === "masc";
    return false;
  });
}

/** The canonical text of one period, with its tokens and statements. */
export function printPeriod(state: WorkspaceState, containerId: string, vocab: Vocabulary): PrintedPeriod {
  const root = state.containers.find((c) => c.id === containerId)?.selection;
  const printer = new Printer(state, containerId, vocab);
  if (root) printer.period(root);
  return printer.done();
}

/**
 * A line with its words written as the printer writes them in `vocab`'s language, and everything
 * else — commands, values, brackets, references, a name — as it stands: what `resolved` (applying the
 * line) found each word to name, put back as `printWord` spells that concept. A word that said more
 * than its concept (a pronoun's form, "she") is kept, since its person alone would lose the rest.
 *
 * It is the printer for a line that must keep its own shape, which `printPeriod` would not: a help
 * page's example shows the command it is about even where that sets the default (`/sg`), and types a
 * clause in its braces rather than as a reference. Applied again, the line gives the same workspace.
 */
export function printWords(text: string, resolved: readonly ResolvedWord[], vocab: Vocabulary): string {
  let out = "";
  let at = 0;
  for (const w of [...resolved].sort((a, b) => a.from - b.from)) {
    if (w.from < at) continue;
    out += text.slice(at, w.from) + (w.opts ? text.slice(w.from, w.to) : printWord(w.concept, w.spec, vocab));
    at = w.to;
  }
  return out + text.slice(at);
}

/**
 * The whole workspace as a script: one line per period, in order. An empty period after the first is
 * written `/new`, so a blank line never has to mean one — a paste may end in as many as it likes.
 */
export function printWorkspace(state: WorkspaceState, vocab: Vocabulary): string {
  return state.containers
    .map((c, i) => printPeriod(state, c.id, vocab).text || (i > 0 ? "/new" : ""))
    .join("\n");
}
