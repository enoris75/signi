import { COMPLEMENT_RENDER_ORDER, type Concept } from "@signi/shared";
import {
  CONJUNCTION_KEY,
  POSSESSOR_KEY,
  POSSESSOR_REF_KEY,
  conjunctAddress,
  imperativePerson,
  imperativeRegisterOf,
  isConditionalLink,
  isCoordinativeLink,
  isInstrumentalLink,
  isRelativeLink,
  possessorAddress,
  type NounAddress,
  type NounKey,
  type PhraseSelection,
  type SlotKey,
} from "../../components/PhraseBuilder/interfaces.ts";
import { conjunctsOf } from "../../components/PhraseBuilder/phraseReducers.ts";
import { resolveAntecedent } from "../../components/PhraseBuilder/selectionToPlan/index.ts";
import { adjectiveSlots, MODAL_SLOTS, modalAdverbFor } from "../../components/PhraseBuilder/slots.ts";
import {
  COORD_VALUES,
  LEVEL_VALUES,
  PERSON_VALUES,
  REGISTER_VALUES,
  commandByAction,
  roleCommand,
  settingCommand,
  type Setting,
  type TokenColor,
} from "./commands.ts";
import { bracketColor } from "./parse.ts";
import { printRef, printWord, wordSpecFor } from "./resolve.ts";
import type { Span, Vocabulary, WordRef, WorkspaceState } from "./types.ts";
import { currentSetting, defaultSetting, settingTakes, wordInfo, type WordInfo } from "./words.ts";

/**
 * The canonical text of a period — deterministic, and read back by `apply` into the same period.
 *
 * Subject block → verb block (adverb, modals and theirs, tense, aspect, polarity) → object →
 * complements in render order → the period's own links. Within a noun: word → adjectives → number →
 * gender → determiner → relation → possessor → conjuncts → relative clause. Only what differs from
 * the default is written, so a plain period reads plainly.
 *
 * Clauses are periods of their own, so each prints on its own line and a link to one is a reference
 * (`/rel #2.subj`), never a bracket. What lives *inside* a period — a possessor, a conjunct with
 * settings of its own — prints in brackets, which keeps its settings unambiguous.
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

  /** Open a statement; every token emitted until the next one belongs to it. */
  statement(s: Omit<Statement, "text">): number {
    this.statements.push({ ...s, text: "" });
    this.current = this.statements.length - 1;
    return this.current;
  }

  emit(text: string, kind: PrintKind, color: TokenColor, extra: { word?: WordRef; italic?: boolean; statement?: number } = {}) {
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
    });
    this.pos += text.length;
  }

  done(): PrintedPeriod {
    const statements = this.statements.map((s, i) => ({
      ...s,
      text: this.tokens
        .filter((t) => t.statement === i)
        .map((t) => (t.kind === "open" ? "( … )" : t.kind === "close" ? "" : t.text))
        .filter(Boolean)
        .join(" "),
    }));
    return { text: this.tokens.map((t) => t.text).join(" "), tokens: this.tokens, statements };
  }

  info(ref: WordRef): WordInfo | undefined {
    return wordInfo(this.state.containers, ref);
  }

  periodNumber(id: string): number {
    return this.state.containers.findIndex((c) => c.id === id) + 1;
  }

  word(concept: Concept, slot: SlotKey, frame: "period" | "possessor" | "conjunct" = "period"): string {
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
    }
    this.noun(root, "subject", undefined, "period");
    this.verbBlock(root);
    this.noun(root, "directObject", undefined, "period");
    for (const type of COMPLEMENT_RENDER_ORDER) {
      if (type === "instrumental") continue;
      this.noun(root, type, undefined, "period");
    }
    // The period's own links: its if-clause, its coordinate, its instrument.
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
      }
    }
  }

  verbBlock(root: PhraseSelection): void {
    const id = this.containerId;
    const verbRef: WordRef = { containerId: id, slot: "verb" };
    const w = this.info(verbRef)!;
    const settings = (["tense", "aspect", "polarity"] as const).filter(
      (s) => settingTakes({ id: s } as Setting, w) && currentSetting(s, w) !== defaultSetting(s, w),
    );
    const hasModal = MODAL_SLOTS.some((key) => root[key]);
    if (!root.verb && !root.modifier && !hasModal && settings.length === 0) return;
    this.statement({ key: `${wordKey(verbRef)}:word`, removal: "/del verb", owner: verbRef, about: verbRef });
    this.emit("/verb", "command", "secondary", { word: verbRef });
    if (root.verb) this.emit(this.word(root.verb, "verb"), "word", "secondary", { word: verbRef, italic: true });
    // The verb's own adverb before any modal: after one, `/adv` would be the modal's.
    if (root.modifier) this.wordStatement({ containerId: id, slot: "modifier" }, "/adv", "info", root.modifier, verbRef);
    for (const key of MODAL_SLOTS) {
      const modal = root[key];
      if (!modal) continue;
      const ref: WordRef = { containerId: id, slot: key };
      this.wordStatement(ref, "/modal", "secondary", modal, verbRef);
      const adverbKey = modalAdverbFor(key)!;
      const adverb = root[adverbKey];
      if (adverb) this.wordStatement({ containerId: id, slot: adverbKey }, "/adv", "info", adverb, ref);
    }
    for (const s of settings) this.setting({ id: s, value: currentSetting(s, w) } as Setting, w);
  }

  /** A word that fills a box of its own: `/adv fast`, `/modal can`. */
  wordStatement(ref: WordRef, command: string, color: TokenColor, concept: Concept, owner?: WordRef): void {
    this.statement({ key: `${wordKey(ref)}:word`, removal: `/del ${command.slice(1)}`, owner, about: ref });
    this.emit(command, "command", color, { word: ref });
    this.emit(this.word(concept, ref.slot), "word", color, { word: ref, italic: true });
  }

  /** A setting on a word, written as the command that sets its current value. */
  setting(s: Setting, w: WordInfo): void {
    const def = settingCommand(s);
    const back = settingCommand({ id: s.id, value: defaultSetting(s.id, w) } as Setting);
    this.statement({ key: `${wordKey(w.ref)}:${s.id}`, removal: `/${back.name}`, owner: w.ref, about: w.ref });
    this.emit(`/${def.name}`, "command", "setting", { word: w.ref });
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
   * A noun block: its word and what hangs off it. `slice` is the address of the nested phrase `sel`
   * is (undefined for the period itself); `frame` says which kind of phrase that is.
   */
  noun(sel: PhraseSelection, which: NounKey, slice: NounAddress | undefined, frame: "period" | "possessor" | "conjunct"): void {
    const id = this.containerId;
    const concept = sel[which];
    if (!concept) return;
    const ref: WordRef = { containerId: id, slice, slot: which };
    const w = this.info(ref)!;
    const role = roleCommand(which)!;
    const color = role.color;
    this.statement({ key: `${wordKey(ref)}:word`, removal: `/del ${role.name}`, owner: slice ? ref : undefined, about: ref });
    this.emit(`/${role.name}`, "command", color, { word: ref });
    this.emit(this.word(concept, which, frame), "word", color, { word: ref, italic: true });

    const chain = adjectiveSlots(which).filter((key) => sel[key]);
    const modifiers = chain.some((key) => sel[key]?.role === "noun");
    // A noun modifier takes a number of its own, so the head's is written before the adjectives when
    // one is there: after it, `/pl` would be the modifier's.
    if (modifiers) this.settings(w, ["number"]);
    // Set once a noun modifier without an adjective of its own has been written: a later `/adj` would
    // be taken as that adjective, so the head is named again first.
    let open = false;
    for (const key of chain) {
      const adjective = sel[key]!;
      if (open) {
        this.statement({ key: `${wordKey(ref)}:anchor:${key}`, removal: "", anchor: true });
        this.emit(`/${role.name}`, "command", color, { word: ref });
      }
      const adjRef: WordRef = { containerId: id, slice, slot: key };
      const aw = this.info(adjRef)!;
      this.statement({ key: `${wordKey(adjRef)}:word`, removal: "/del adj", owner: ref, about: adjRef });
      this.emit("/adj", "command", "error", { word: adjRef });
      this.emit(this.word(adjective, key), "word", "error", { word: adjRef, italic: true });
      if (adjective.role === "noun") {
        this.settings(aw, ["number", "relation"]);
        const own = sel.modifierAdjectives?.[key];
        if (own) {
          const ownRef: WordRef = { ...adjRef, modifierAdjective: true };
          this.statement({ key: `${wordKey(ownRef)}:word`, removal: "/del", owner: adjRef, about: ownRef });
          this.emit("/adj", "command", "error", { word: ownRef });
          this.emit(printWord(own, { roles: ["adjective"] }, this.vocab), "word", "error", { word: ownRef, italic: true });
        }
        open = !own;
      } else {
        this.settings(aw, ["degree"]);
      }
    }
    this.settings(w, modifiers ? ["gender", "determiner", "specifier", "sentiment", "degree"] : ["number", "gender", "determiner", "specifier", "sentiment", "degree"]);

    // Its possessor: a phrase of its own in brackets, or a reference to another noun of the period.
    const address = w.address!;
    const possessorRef = sel[POSSESSOR_REF_KEY(which)] as NounAddress | undefined;
    const possessor = sel[POSSESSOR_KEY(which)] as PhraseSelection | undefined;
    // A reference whose noun has since gone points at nothing, and renders nothing.
    if (possessorRef && resolveAntecedent(this.root, possessorRef)) {
      this.statement({ key: `${wordKey(ref)}:possref`, removal: "/del poss", owner: ref, about: ref });
      this.emit("/poss", "command", "primary", { word: ref });
      this.emit(printRef(this.periodNumber(id), possessorRef), "ref", "ref");
    } else if (possessor && Object.keys(possessor).length) {
      this.phrase(ref, "/poss", `${wordKey(ref)}:poss`, "/del poss", possessor, possessorAddress(address), "possessor");
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
    }
  }

  /** A nested phrase in brackets: `/poss ( /subj man /adj old )`. */
  phrase(
    owner: WordRef,
    command: string,
    key: string,
    removal: string,
    sel: PhraseSelection,
    slice: NounAddress,
    frame: "possessor" | "conjunct",
  ): void {
    const color = bracketColor(commandByAction(frame === "possessor" ? "possessor" : "conjunct"));
    const statement = this.statement({ key, removal, owner, about: owner, scope: slice });
    const first = this.tokens.length;
    this.emit(command, "command", "primary", { word: { containerId: this.containerId, slice, slot: "subject" } });
    this.emit("(", "open", color);
    this.noun(sel, "subject", slice, frame);
    this.emit(")", "close", color, { statement });
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
 * The whole workspace as a script: one line per period, in order. An empty period after the first is
 * written `/new`, so a blank line never has to mean one — a paste may end in as many as it likes.
 */
export function printWorkspace(state: WorkspaceState, vocab: Vocabulary): string {
  return state.containers
    .map((c, i) => printPeriod(state, c.id, vocab).text || (i > 0 ? "/new" : ""))
    .join("\n");
}
