/**
 * Every key the app answers to, declared once.
 *
 * The keymap is data, not handlers scattered through the components: the provider matches against
 * it, the hint line lists it, the key tips read their letter off it and the tooltips their keycap.
 * They cannot drift apart because there is nothing to keep in step.
 *
 * Each command calls the very handler its control's click calls (`handleCycleTense`,
 * `handleToggleNumber`, …), so no grammar path is keyboard-only and none is mouse-only. Whether a
 * key exists at all is `when`, which reads the same `Satellite.available` the control's own
 * presence reads — a key exists exactly when its button does.
 *
 * This is phase 1 of the plan: the cursor and the box keys. The `period`, `app`, `picker`, `menu`,
 * `pick`, `translations` and `words` scopes are declared in `Scope` and filled by the later phases.
 */

import type { ImperativeRegister, UiStringKey } from "@signi/shared";
import type {
  BoxComplementType,
  ImperativePerson,
  NounAddress,
  NounKey,
  PhraseSelection,
  QuestionRole,
  SlotQuestionRole,
  SlotKey,
} from "../components/PhraseBuilder/interfaces.ts";
import type { Satellite } from "../components/PhraseBuilder/satellites/index.ts";
import type { NegativeField } from "../components/PhraseBuilder/phraseReducers.ts";
import {
  adjectiveSlots,
  MODAL_ADVERB_SLOTS,
  MODAL_NEGATIVE_FIELDS,
  MODAL_SLOTS,
  modalAdverbFor,
  negativeFieldOf,
} from "../components/PhraseBuilder/slots.ts";
import { hasRelation } from "../components/PhraseBuilder/functions/questionGates.ts";
import { isComplementSlot, nounBlockOf, type Scope } from "./scope.ts";
import type { Direction } from "./spatialNav.ts";

/** How far ⇧ + an arrow shifts a box on the canvas — the same step the layout grid reads well at. */
export const NUDGE_STEP = 8;

/** Moving the cursor about the page. Supplied by the provider, which alone can see other periods. */
export interface CursorNav {
  /** The focused box's element, for the commands that reach into it (the open word picker). */
  element: HTMLElement;
  /** The nearest box in a direction, anywhere on the page (see spatialNav). */
  move: (dir: Direction) => void;
  /** The next or previous box in reading order, across the whole document; false at the end. */
  step: (delta: 1 | -1) => boolean;
  /** esc: step out one level — from a box onto its period, and from a period off the canvas. */
  exit: () => void;
}

/** A period's movement, which adds the way back *in*. */
export interface PeriodNav extends CursorNav {
  /** ↵ — into the period, at the box the cursor last rested on there. */
  enter: () => void;
}

/**
 * What a command may act on: the box under the cursor, the phrase it belongs to, and the same
 * handler bag `PhraseBuilder` hands its renderers. Assembled per keystroke by the builder that
 * owns the box (see `useBoxCommands`), with `nav` added by the provider.
 */
export interface BoxContext {
  slot: SlotKey;
  /**
   * The nested phrase the box is in, by its head's address — a hosted ring's (a possessor's or a
   * conjunct's); undefined for a box of the period itself. The console reads it to know which word
   * the cursor is on.
   */
  path?: NounAddress;
  selection: PhraseSelection;
  /** The noun block the box belongs to: its own key, or the noun an adjective slot describes. */
  nounKey: NounKey | null;
  /** One of this builder's satellites by key — `available` says whether its control exists. */
  satellite: (key: string) => Satellite | undefined;
  /** Put the cursor on another box of this phrase, revealing its satellite's box if it is folded. */
  revealSlot: (slotKey: SlotKey, satelliteKey?: string) => void;
  /** Show or hide a satellite's box without moving the cursor (the direct object's fold-away). */
  toggleReveal: (satelliteKey: string) => void;
  /** Open this box's word picker over its word (a filled box) — what clicking a box in hand does. */
  editSlot: (slotKey: SlotKey) => void;
  clearSlot: (slotKey: SlotKey) => void;
  removeComplement: (type: BoxComplementType) => void;
  togglePossessor: (which: NounKey) => void;
  addConjunct: (which: NounKey) => void;
  cycleConjunction: (which: NounKey) => void;
  /**
   * The noun's relative clause: start the pick for one, or drop the link there is — and, while there
   * is one, say it alone, its head unspoken, or say the head again (P13).
   */
  relative:
    | { has: boolean; start: () => void; clear: () => void; headless: boolean; setHeadless: (headless: boolean) => void }
    | undefined;
  openDeterminerMenu: (which: NounKey) => void;
  /** The verb's *Add a complement* menu — every complement it licenses, one keystroke each. */
  openComplementMenu: () => void;
  /** Point the next keystroke at a complement's relation toolbar, or at nothing (null). */
  armToolbar: (slot: SlotKey | null) => void;
  setImperativePerson: (person: ImperativePerson) => void;
  setImperativeRegister: (register: ImperativeRegister) => void;
  /** What the command box is showing, so its keys can tell a toggle from a no-op. */
  imperative: { person: ImperativePerson; register: ImperativeRegister };
  toggleNumber: (which: NounKey) => void;
  toggleGender: (which: NounKey, step: 1 | -1) => void;
  toggleNegative: (field: NegativeField) => void;
  toggleCauseNegative: () => void;
  /** The wh-question's mark on this noun's slot, its who / what, and the existential (P09-E12). */
  toggleQuestion: (which: QuestionRole) => void;
  toggleQuestionAnimate: () => void;
  toggleExistential: () => void;
  /** The humble register, on the subject whose side decides it (P11-E6). */
  toggleHumble: () => void;
  /** How a verbless period's subject reads, and a time reading's relation (P13). */
  cycleGloss: (step: 1 | -1) => void;
  cycleGlossRelation: (step: 1 | -1) => void;
  /** What a noun's genitive possessor is to it: owner, whole, parts (P13). */
  cyclePossessorRole: (which: NounKey, step: 1 | -1) => void;
  cycleTense: (step: 1 | -1) => void;
  cycleAspect: (step: 1 | -1) => void;
  cycleVoice: (step: 1 | -1) => void;
  cycleDegree: (slotKey: SlotKey, step: 1 | -1) => void;
  /** The predicate adjective's standard of comparison: open its ring, or fold it (P09-E12 D5). */
  toggleStandard: () => void;
  // Open or fold a noun's examples, and flip their relation such as ⇄ including (P09-E48).
  toggleExamples: () => void;
  toggleExampleRelation: () => void;
  cycleModifierRelation: (slotKey: SlotKey, step: 1 | -1) => void;
  cycleModifierNumber: (slotKey: SlotKey) => void;
  /** The chip that picks the adjective describing an attributive noun ("semantic *phrase* creator"). */
  openModifierAdjective: (slotKey: SlotKey) => void;
  /** Fold or unfold the dotted group this box sits in, if it heads one. */
  toggleCollapse: (slotKey: SlotKey) => void;
  /** Shift the box (or its whole constituent) about the canvas, in px. */
  nudge: (slotKey: SlotKey, dx: number, dy: number) => void;
}

/**
 * What a key pressed on a *period* acts on: the card the cursor rests on, and the handlers its own
 * controls call. A period is a level above a box (the plan's §2), so its keys are looked up in a
 * map of their own and never see a box's context, nor a box key a period's.
 */
export interface PeriodContext {
  /** This period's container id in the workspace; undefined for a standalone period. */
  id: string | undefined;
  selection: PhraseSelection;
  /** ⇧↑ / ⇧↓ — move the period up or down the stack. Absent at either end. */
  move: (delta: 1 | -1) => void;
  canMove: (delta: 1 | -1) => boolean;
  /** N / L — one more period, empty or loaded from the saved ones. */
  addPeriod: () => void;
  loadPeriod: () => void;
  /** S / ⌫ — save this period, or remove it (clear it when it is the only one). */
  save: (() => void) | undefined;
  remove: (() => void) | undefined;
  hasContent: boolean;
  /** C / T / Q — the three moods, which exclude each other. */
  toggleImperative: () => void;
  toggleInfinitive: () => void;
  toggleQuestion: () => void;
  moodLocked: boolean;
  /** The question's own lock, where it differs (P09-E55): free on the clause of a verb that reports one. */
  questionLocked?: boolean;
  /** I / J — the two clause-level relations: start the pick, or drop the link there is. */
  condition: { canStart: boolean; hasLink: boolean; start: () => void; clear: () => void } | undefined;
  coordination: { canStart: boolean; hasLink: boolean; start: () => void; clear: () => void } | undefined;
  /** U — the subordinate clause (P09-E12 D9): open its menu, or drop the one this period governs. */
  subordination?: { canStart: boolean; hasLink: boolean; start: () => void; clear: () => void } | undefined;
  /** R — how far an instrument period is reified: process → concept → object. */
  cycleLevel: (() => void) | undefined;
  /** ⇧N — deny an instrument period, or take it back: the privative, "without the knife" (P09-E2). */
  togglePrivative: (() => void) | undefined;
  /** O — whose an infinitive period is: the governing clause's object, or its subject (P13). */
  toggleObjectControl?: (() => void) | undefined;
  /** E — show the interjection box, or take it away (P09-E47). Absent where the period offers none. */
  toggleInterjection?: (() => void) | undefined;
  /** Z / W / + − — the view: compact, tidy, and the canvas's height. */
  toggleCompact: () => void;
  tidy: () => void;
  hasGroups: boolean;
  resize: (delta: number) => void;
}

/**
 * What a key pressed *anywhere* acts on: the page itself. These are the only chords the app binds —
 * <kbd>Ctrl</kbd> where an app conventionally uses it — plus the two keys that are about the page
 * rather than about the phrase: the shortcuts sheet, and the walk between regions.
 */
export interface AppContext {
  /** The header's own four, pressed where they stand so their dialogs hang off them. */
  saveWorkspace: () => void;
  loadWorkspace: () => void;
  exportWorkspace: () => void;
  importWorkspace: () => void;
  /** Show or hide the words panel, putting the cursor inside it when it opens. */
  toggleWords: () => void;
  /** The help overlay, whose keyboard section lists every binding there is. */
  toggleHelp: () => void;
  /** A step back through the phrase, and forward again. Absent where there is nowhere to go. */
  undo: (() => void) | undefined;
  redo: (() => void) | undefined;
  /**
   * The phrase console (P02): show it and put the caret in its prompt — or, from the prompt itself,
   * hide it and give the keyboard back to the canvas; and show it with a command already begun.
   */
  console?: { toggle: () => void; startCommand: () => void };
}

/** The context an app command runs against. */
export type AppKeyContext = AppContext & { nav: RegionNav };

/** Moving between the page's landmarks, which is the only movement the app level has. */
export interface RegionNav {
  step: (delta: 1 | -1) => void;
}

/** The context a box command runs against: the box, and the cursor's own movement. */
export type BoxKeyContext = BoxContext & { nav: CursorNav };
/** The context a period command runs against. */
export type PeriodKeyContext = PeriodContext & { nav: PeriodNav };

export interface Command<C> {
  /** Stable id — what a test, the shortcuts sheet and (later) a console command name it by. */
  id: string;
  scope: Scope;
  /** Key specs, any of which runs it (see matchKey). */
  keys: string[];
  /** The action's English name: the fallback, and the name of anything not yet in the catalogue. */
  label: string;
  /** The catalogue key `label` is rendered from, where the action's words are already seeded. */
  labelKey?: UiStringKey;
  /**
   * The id of the command this one runs backwards: a key's ⇧ twin, which cycles the same value the
   * other way. It is named after that command (see commandLabel), so the two cannot drift apart.
   */
  reverses?: string;
  /** Whether the key exists here at all — the same fact the control's own presence rests on. */
  when?: (ctx: C) => boolean;
  /** Returning `false` declines the keystroke, leaving it to the browser (see box.next). */
  run: (ctx: C) => void | boolean;
  /** Listed in the hint line for this scope. Movement is taught by the caption instead. */
  hint?: boolean;
  /**
   * The satellite controls this command drives, matched by key. Each one wears the command's key
   * as a tip while its box is under the cursor, and names it in its tooltip.
   */
  satellite?: RegExp;
}

// ── Helpers shared by the commands ────────────────────────────────────────────────────────────

/** Whether a satellite's control is offered on this phrase at all. */
const has = (ctx: BoxContext, key: string) => Boolean(ctx.satellite(key)?.available);

/**
 * The adjective a noun's <kbd>A</kbd> adds: the first link of its chain that is offered and still
 * empty. Each link is revealed by the one before it, so the chain is walked head-first and stops
 * at the third. Undefined once all three hold a word, or on a box that heads no noun block.
 */
function nextAdjective(ctx: BoxContext): SlotKey | undefined {
  const block = nounBlockOf(ctx.slot);
  if (!block) return undefined;
  return adjectiveSlots(block).find(
    (key) => has(ctx, key) && !ctx.selection[key],
  );
}

/** The modal a verb-family box's <kbd>M</kbd> reveals: the first of the chain, or the next one. */
function nextModal(slot: SlotKey): SlotKey | undefined {
  if (slot === "verb") return MODAL_SLOTS[0];
  const idx = MODAL_SLOTS.indexOf(slot);
  return idx === -1 ? undefined : MODAL_SLOTS[idx + 1];
}

/** The adverb a verb-family box's <kbd>V</kbd> reveals: the verb's own, or that modal's. */
function adverbOf(slot: SlotKey): SlotKey | undefined {
  return slot === "verb" ? "modifier" : modalAdverbFor(slot);
}

/** The polarity a verb-family box's <kbd>N</kbd> flips: the verb's own, or that modal's. */
function negativeOf(slot: SlotKey): NegativeField | undefined {
  return negativeFieldOf(slot);
}

/** Whether the box holds an attributive noun ("sail boat") rather than a real adjective. */
const isNounModifier = (ctx: BoxContext) =>
  /Adjective\d?$/.test(ctx.slot) && ctx.selection[ctx.slot]?.role === "noun";

const isRealAdjective = (ctx: BoxContext) => ctx.selection[ctx.slot]?.role === "adjective";

const filled = (ctx: BoxContext) => Boolean(ctx.selection[ctx.slot]);

/** Reveal `slot` and put the cursor in it; its satellite is named when it is folded away. */
const goTo = (ctx: BoxKeyContext, slot: SlotKey) => ctx.revealSlot(slot, slot);

/** The complements whose ring carries a relation toolbar, which S points the next key at. */
const TOOLBAR_SLOTS: SlotKey[] = ["route", "locative", "direction", "temporal", "cause", "objectPredicative"];

/**
 * The command box's three addressees, counted the way its rows are stacked. Each key is named by
 * its person, as the person toggle's own tooltip names it (`imperative.person.*`), so the key and
 * the button say the same.
 */
const IMPERATIVE_PERSONS: [ImperativePerson, string, string][] = [
  ["2sg", "1", "You"],
  ["1pl", "2", "Let’s"],
  ["2pl", "3", "You all"],
];

// ── The map ───────────────────────────────────────────────────────────────────────────────────

export const KEYMAP: Command<BoxKeyContext>[] = [
  // ── Every box: moving about, choosing a word, clearing it ──────────────────────────────────
  ...(
    [
      ["left", "ArrowLeft"],
      ["up", "ArrowUp"],
      ["right", "ArrowRight"],
      ["down", "ArrowDown"],
    ] as const
  ).map(([dir, key]): Command<BoxKeyContext> => ({
    id: `box.move.${dir}`,
    scope: "box",
    keys: [key],
    // The cursor goes to the nearest box that way.
    label: `Go ${dir}`,
    labelKey: `action.go.${dir}`,
    run: (ctx) => ctx.nav.move(dir),
  })),
  ...(
    [
      ["left", "Shift+ArrowLeft", -NUDGE_STEP, 0],
      ["up", "Shift+ArrowUp", 0, -NUDGE_STEP],
      ["right", "Shift+ArrowRight", NUDGE_STEP, 0],
      ["down", "Shift+ArrowDown", 0, NUDGE_STEP],
    ] as const
  ).map(([dir, key, dx, dy]): Command<BoxKeyContext> => ({
    id: `box.nudge.${dir}`,
    scope: "box",
    keys: [key],
    label: `Move the slot ${dir}`,
    labelKey: `action.moveSlot.${dir}`,
    run: (ctx) => ctx.nudge(ctx.slot, dx, dy),
  })),
  {
    id: "box.next",
    scope: "box",
    keys: ["Tab"],
    label: "Next slot",
    labelKey: "slot.next",
    run: (ctx) => ctx.nav.step(1),
  },
  {
    id: "box.previous",
    scope: "box",
    keys: ["Shift+Tab"],
    label: "Previous slot",
    labelKey: "slot.previous",
    run: (ctx) => ctx.nav.step(-1),
  },
  {
    id: "box.word",
    scope: "box",
    keys: ["Enter", "Space"],
    // REPLACE, not CHANGE: ↵ puts another word in the box's place, where German "ändern" alters it.
    label: "Replace the word",
    labelKey: "action.replaceWord",
    hint: true,
    run: (ctx) => {
      // A filled box opens its picker over the word; an empty one already has the picker on the
      // canvas, so ↵ just steps back into it (esc having stepped out).
      if (filled(ctx)) ctx.editSlot(ctx.slot);
      else ctx.nav.element.querySelector("input")?.focus();
    },
  },
  {
    id: "box.clear",
    scope: "box",
    keys: ["Backspace"],
    // The catalogue's `action.clear` is the bare verb ("clear"), which reads oddly in a line of
    // named parts; this names the part.
    label: "Clear the word",
    labelKey: "action.clearWord",
    hint: true,
    when: filled,
    run: (ctx) => ctx.clearSlot(ctx.slot),
  },
  {
    id: "box.fold",
    scope: "box",
    keys: ["Z"],
    // The verb the ring's own toggle says it with.
    label: "Compact the group",
    labelKey: "action.compactGroup",
    run: (ctx) => ctx.toggleCollapse(ctx.slot),
  },
  {
    id: "box.out",
    scope: "box",
    keys: ["Escape"],
    label: "Leave the slot",
    labelKey: "action.leaveSlot",
    run: (ctx) => ctx.nav.exit(),
  },

  // ── A noun: subject, object, complement, possessor head, conjunct ──────────────────────────
  {
    id: "noun.number",
    scope: "box:noun",
    keys: ["N"],
    label: "Number",
    labelKey: "satellite.number",
    hint: true,
    satellite: /Number$/,
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}Number`),
    run: (ctx) => ctx.toggleNumber(ctx.nounKey!),
  },
  {
    id: "noun.gender",
    scope: "box:noun",
    keys: ["G"],
    label: "Gender",
    labelKey: "satellite.gender",
    hint: true,
    satellite: /Gender$/,
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}Gender`),
    run: (ctx) => ctx.toggleGender(ctx.nounKey!, 1),
  },
  {
    id: "noun.gender.back",
    scope: "box:noun",
    keys: ["Shift+G"],
    label: "Gender, backwards",
    labelKey: "hint.backwards",
    reverses: "noun.gender",
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}Gender`),
    run: (ctx) => ctx.toggleGender(ctx.nounKey!, -1),
  },
  {
    id: "noun.determiner",
    scope: "box:noun",
    keys: ["D"],
    label: "Determiner",
    labelKey: "satellite.determiner",
    hint: true,
    satellite: /Definiteness$/,
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}Definiteness`),
    run: (ctx) => ctx.openDeterminerMenu(ctx.nounKey!),
  },
  {
    id: "noun.adjective",
    scope: "box:noun",
    keys: ["A"],
    label: "Adjective",
    labelKey: "category.adjective",
    hint: true,
    satellite: /Adjective\d?$/,
    when: (ctx) => nextAdjective(ctx) !== undefined,
    run: (ctx) => goTo(ctx, nextAdjective(ctx)!),
  },
  {
    // The voice of the clause this noun is the object of (A01) — the control rides *this* ring,
    // because the object is what a passive promotes, and `has` keeps the key off every other noun.
    id: "object.voice",
    scope: "box:noun",
    keys: ["V"],
    label: "Voice",
    labelKey: "satellite.voice",
    hint: true,
    satellite: /^verbVoice$/,
    when: (ctx) => has(ctx, "verbVoice"),
    run: (ctx) => ctx.cycleVoice(1),
  },
  {
    id: "object.voice.back",
    scope: "box:noun",
    keys: ["Shift+V"],
    label: "Voice, backwards",
    labelKey: "hint.backwards",
    reverses: "object.voice",
    when: (ctx) => has(ctx, "verbVoice"),
    run: (ctx) => ctx.cycleVoice(-1),
  },
  {
    // The wh-question's mark (P09-E12 M6): ask about this slot, or stop asking. Q is free on a noun,
    // and ? is the shortcuts sheet.
    id: "noun.question",
    scope: "box:noun",
    keys: ["Q"],
    label: "Question",
    labelKey: "mood.question",
    hint: true,
    satellite: /Question$/,
    // …and on an owner's box, the period's *whose* (P09-E52 D5).
    when: (ctx) =>
      ctx.slot === ctx.nounKey &&
      (has(ctx, `${ctx.nounKey}Question`) || (Boolean(ctx.path) && has(ctx, "possessorQuestion"))),
    run: (ctx) => ctx.toggleQuestion(ctx.nounKey as QuestionRole),
  },
  {
    // Its who / what, on the marked subject or object. A flip, so it has no backwards twin.
    id: "noun.question.animacy",
    scope: "box:noun",
    keys: ["Shift+Q"],
    label: "Who or what",
    labelKey: "question.who",
    satellite: /QuestionAnimate$/,
    when: (ctx) => ctx.slot === ctx.nounKey && has(ctx, `${ctx.nounKey}QuestionAnimate`),
    run: (ctx) => ctx.toggleQuestionAnimate(),
  },
  {
    // The existential, "there is a cat" (P09-E12 M7): on the subject, whose ring carries it.
    id: "subject.existential",
    scope: "box:noun",
    keys: ["E"],
    label: "Existential",
    labelKey: "existential.toggle",
    hint: true,
    satellite: /^subjectExistential$/,
    when: (ctx) => ctx.slot === "subject" && has(ctx, "subjectExistential"),
    run: (ctx) => ctx.toggleExistential(),
  },
  {
    // The humble register, the Japanese 謙譲語 (P11-E6): the verb's, on the subject whose side decides
    // it. K for *kenjō*: H, which the ticket proposed, is the noun's standard since P09-E50, and a
    // compared relative ("my older father") would offer both. A flip, so it has no backwards twin.
    id: "subject.humble",
    scope: "box:noun",
    keys: ["K"],
    label: "Humble",
    labelKey: "register.humble",
    hint: true,
    satellite: /^subjectHumble$/,
    when: (ctx) => ctx.slot === "subject" && has(ctx, "subjectHumble"),
    run: (ctx) => ctx.toggleHumble(),
  },
  {
    id: "noun.possessor",
    scope: "box:noun",
    keys: ["P"],
    label: "Possessor",
    labelKey: "slot.possessor",
    hint: true,
    satellite: /Possessor$/,
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}Possessor`),
    run: (ctx) => ctx.togglePossessor(ctx.nounKey!),
  },
  {
    // The members of the set a noun names — "animals *such as the cat*" (P09-E48): X, for eXamples.
    id: "noun.examples",
    scope: "box:noun",
    keys: ["X"],
    label: "Examples",
    labelKey: "slot.examples",
    hint: true,
    satellite: /Examples$/,
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}Examples`),
    run: (ctx) => ctx.toggleExamples(),
  },
  {
    // ⇧X flips such as ⇄ including while the examples hold a word.
    id: "noun.examples.relation",
    scope: "box:noun",
    keys: ["Shift+X"],
    label: "Relation",
    labelKey: "modifier.relation",
    when: (ctx) =>
      Boolean(ctx.nounKey) &&
      Boolean((ctx.selection[`${ctx.nounKey}Examples` as keyof PhraseSelection] as PhraseSelection | undefined)?.subject),
    run: (ctx) => ctx.toggleExampleRelation(),
  },
  {
    // What a noun's compared adjective is measured against — "a bigger cat *than the dog*" (P09-E50):
    // H, as on the predicate adjective. Offered while an adjective of the noun compares.
    id: "noun.standard",
    scope: "box:noun",
    keys: ["H"],
    label: "Standard of comparison",
    labelKey: "slot.standard",
    hint: true,
    satellite: /Standard$/,
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}Standard`),
    run: (ctx) => ctx.toggleStandard(),
  },
  {
    id: "noun.coordinate",
    scope: "box:noun",
    keys: ["C"],
    label: "Coordinate",
    labelKey: "satellite.coordination",
    hint: true,
    satellite: /Conjunct$/,
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}Conjunct`),
    run: (ctx) => ctx.addConjunct(ctx.nounKey!),
  },
  {
    id: "noun.conjunction",
    scope: "box:noun",
    keys: ["Shift+C"],
    label: "Conjunction",
    labelKey: "satellite.conjunction",
    when: (ctx) => Boolean(ctx.satellite(`${ctx.nounKey}Conjunct`)?.hasValue),
    run: (ctx) => ctx.cycleConjunction(ctx.nounKey!),
  },
  {
    // What the noun's possessor is to it (P13): its owner, the whole it is part of, its parts — O, ⇧O back.
    id: "noun.possessorRole",
    scope: "box:noun",
    keys: ["O"],
    label: "Relationship",
    labelKey: "modifier.relation",
    satellite: /PossessorRole$/,
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}PossessorRole`),
    run: (ctx) => ctx.cyclePossessorRole(ctx.nounKey!, 1),
  },
  {
    id: "noun.possessorRole.back",
    scope: "box:noun",
    keys: ["Shift+O"],
    label: "Relationship, backwards",
    labelKey: "hint.backwards",
    reverses: "noun.possessorRole",
    when: (ctx) => Boolean(ctx.nounKey) && has(ctx, `${ctx.nounKey}PossessorRole`),
    run: (ctx) => ctx.cyclePossessorRole(ctx.nounKey!, -1),
  },
  {
    // How a verbless period's subject reads (P13) — M for its meaning, ⇧M back.
    id: "subject.gloss",
    scope: "box:noun",
    keys: ["M"],
    label: "Meaning",
    labelKey: "gloss.name",
    satellite: /^subjectGloss$/,
    when: (ctx) => ctx.slot === "subject" && !ctx.path && has(ctx, "subjectGloss"),
    run: (ctx) => ctx.cycleGloss(1),
  },
  {
    id: "subject.gloss.back",
    scope: "box:noun",
    keys: ["Shift+M"],
    label: "Meaning, backwards",
    labelKey: "hint.backwards",
    reverses: "subject.gloss",
    when: (ctx) => ctx.slot === "subject" && !ctx.path && has(ctx, "subjectGloss"),
    run: (ctx) => ctx.cycleGloss(-1),
  },
  {
    // The relation of a time reading, "until this time" — L, ⇧L back.
    id: "subject.glossRelation",
    scope: "box:noun",
    keys: ["L"],
    label: "Temporal",
    labelKey: "slot.temporal",
    satellite: /^subjectGlossRelation$/,
    when: (ctx) => ctx.slot === "subject" && !ctx.path && has(ctx, "subjectGlossRelation"),
    run: (ctx) => ctx.cycleGlossRelation(1),
  },
  {
    id: "subject.glossRelation.back",
    scope: "box:noun",
    keys: ["Shift+L"],
    label: "Temporal, backwards",
    labelKey: "hint.backwards",
    reverses: "subject.glossRelation",
    when: (ctx) => ctx.slot === "subject" && !ctx.path && has(ctx, "subjectGlossRelation"),
    run: (ctx) => ctx.cycleGlossRelation(-1),
  },
  {
    id: "noun.relative",
    scope: "box:noun",
    keys: ["R"],
    label: "Relative clause",
    labelKey: "satellite.relative",
    hint: true,
    satellite: /Relative$/,
    // One key for both halves of the same idea, as the control itself is: start the pick that
    // gives this noun a clause, or drop the clause it has.
    when: (ctx) => Boolean(ctx.relative),
    run: (ctx) => (ctx.relative!.has ? ctx.relative!.clear() : ctx.relative!.start()),
  },
  {
    // The relative clause said alone, its head unspoken (P13) — R's own clause, shifted.
    id: "noun.headless",
    scope: "box:noun",
    keys: ["Shift+R"],
    label: "Only the relative clause",
    labelKey: "relative.headless",
    satellite: /Headless$/,
    when: (ctx) => Boolean(ctx.relative?.has),
    run: (ctx) => ctx.relative!.setHeadless(!ctx.relative!.headless),
  },
  {
    id: "noun.relation",
    scope: "box:noun",
    keys: ["S"],
    label: "Relation",
    // The word the adjective's R already reads, so one relation is called one thing.
    labelKey: "modifier.relation",
    hint: true,
    // The spatial complements carry a relation ("under the bed"), the cause an affective stance
    // ("thanks to" / "because of" / "the fault of"). Both are toolbars already on the ring, so S
    // points the next key at one rather than opening anything — on an empty box too, when a
    // wh-question asks about it (P09-E53 D3).
    when: (ctx) => TOOLBAR_SLOTS.includes(ctx.slot) && hasRelation(ctx.selection, ctx.slot as SlotQuestionRole | "objectPredicative"),
    run: (ctx) => ctx.armToolbar(ctx.slot),
  },
  {
    // The cause alone can be denied rather than named ("not because of the dog"). "N" is the noun's
    // number on this box, so its polarity takes the shifted key; the verb's own "N" is unrelated —
    // that one negates the clause.
    id: "cause.negate",
    scope: "box:noun",
    keys: ["Shift+N"],
    label: "Polarity",
    labelKey: "satellite.polarity",
    hint: true,
    satellite: /^causeNegative$/,
    when: (ctx) => ctx.slot === "cause" && has(ctx, "causeNegative"),
    run: (ctx) => ctx.toggleCauseNegative(),
  },
  {
    id: "noun.removeComplement",
    scope: "box:noun",
    keys: ["Shift+Backspace"],
    label: "Remove the complement",
    labelKey: "action.removeComplement",
    when: (ctx) => isComplementSlot(ctx.slot),
    run: (ctx) => ctx.removeComplement(ctx.slot as BoxComplementType),
  },

  // ── An adjective, or the attributive noun standing in for one ──────────────────────────────
  {
    id: "adjective.next",
    scope: "box:adjective",
    keys: ["A"],
    label: "Adjective",
    labelKey: "category.adjective",
    hint: true,
    satellite: /Adjective\d?$/,
    when: (ctx) => isNounModifier(ctx) || nextAdjective(ctx) !== undefined,
    run: (ctx) => {
      // An attributive noun takes an adjective of its own ("di frasi *semantiche*") before the
      // chain goes on, so its own chip is what A opens while the cursor is on it.
      if (isNounModifier(ctx)) ctx.openModifierAdjective(ctx.slot);
      else goTo(ctx, nextAdjective(ctx)!);
    },
  },
  {
    id: "adjective.degree",
    scope: "box:adjective",
    keys: ["M"],
    label: "Degree",
    labelKey: "modifier.degree",
    hint: true,
    when: isRealAdjective,
    run: (ctx) => ctx.cycleDegree(ctx.slot, 1),
  },
  {
    id: "adjective.degree.back",
    scope: "box:adjective",
    keys: ["Shift+M"],
    label: "Degree, backwards",
    labelKey: "hint.backwards",
    reverses: "adjective.degree",
    when: isRealAdjective,
    run: (ctx) => ctx.cycleDegree(ctx.slot, -1),
  },
  {
    // What a predicate adjective is compared to — "bigger *than the dog*" (P09-E12 D5): H, heard in
    // t*h*an. Only the predicative takes one, and only while its degree does (the satellite's gate).
    id: "predicative.standard",
    scope: "box:adjective",
    keys: ["H"],
    label: "Standard of comparison",
    labelKey: "slot.standard",
    hint: true,
    satellite: /^predicativeStandard$/,
    when: (ctx) => ctx.slot === "predicative" && has(ctx, "predicativeStandard"),
    run: (ctx) => ctx.toggleStandard(),
  },
  {
    id: "adjective.relation",
    scope: "box:adjective",
    keys: ["R"],
    label: "Relation",
    labelKey: "modifier.relation",
    hint: true,
    when: isNounModifier,
    run: (ctx) => ctx.cycleModifierRelation(ctx.slot, 1),
  },
  {
    id: "adjective.relation.back",
    scope: "box:adjective",
    keys: ["Shift+R"],
    label: "Relation, backwards",
    labelKey: "hint.backwards",
    reverses: "adjective.relation",
    when: isNounModifier,
    run: (ctx) => ctx.cycleModifierRelation(ctx.slot, -1),
  },
  {
    id: "adjective.number",
    scope: "box:adjective",
    keys: ["N"],
    label: "Number",
    labelKey: "satellite.number",
    hint: true,
    when: isNounModifier,
    run: (ctx) => ctx.cycleModifierNumber(ctx.slot),
  },

  // ── The verb, and the modals that govern it ────────────────────────────────────────────────
  {
    // The verb family's boxes share this scope, so <kbd>N</kbd> denies whichever word it is
    // pressed on: the verb ("to not go") or a modal ("do not want").
    id: "verb.negate",
    scope: "box:verb",
    keys: ["N"],
    label: "Polarity",
    labelKey: "satellite.polarity",
    hint: true,
    satellite: new RegExp(`^(verbNegative|${MODAL_NEGATIVE_FIELDS.join("|")})$`),
    when: (ctx) => {
      const field = negativeOf(ctx.slot);
      return field !== undefined && has(ctx, field);
    },
    run: (ctx) => {
      const field = negativeOf(ctx.slot);
      if (field) ctx.toggleNegative(field);
    },
  },
  {
    id: "verb.tense",
    scope: "box:verb",
    keys: ["T"],
    label: "Tense",
    labelKey: "satellite.tense",
    hint: true,
    satellite: /^verbTense$/,
    when: (ctx) => has(ctx, "verbTense"),
    run: (ctx) => ctx.cycleTense(1),
  },
  {
    id: "verb.tense.back",
    scope: "box:verb",
    keys: ["Shift+T"],
    label: "Tense, backwards",
    labelKey: "hint.backwards",
    reverses: "verb.tense",
    when: (ctx) => has(ctx, "verbTense"),
    run: (ctx) => ctx.cycleTense(-1),
  },
  {
    id: "verb.aspect",
    scope: "box:verb",
    keys: ["A"],
    label: "Aspect",
    labelKey: "satellite.aspect",
    hint: true,
    satellite: /^verbAspect$/,
    when: (ctx) => has(ctx, "verbAspect"),
    run: (ctx) => ctx.cycleAspect(1),
  },
  {
    id: "verb.aspect.back",
    scope: "box:verb",
    keys: ["Shift+A"],
    label: "Aspect, backwards",
    labelKey: "hint.backwards",
    reverses: "verb.aspect",
    when: (ctx) => has(ctx, "verbAspect"),
    run: (ctx) => ctx.cycleAspect(-1),
  },
  {
    id: "verb.modal",
    scope: "box:verb",
    keys: ["M"],
    label: "Modal",
    labelKey: "slot.modal",
    hint: true,
    satellite: /^verbModal2?$/,
    when: (ctx) => {
      const next = nextModal(ctx.slot);
      return next !== undefined && has(ctx, next);
    },
    run: (ctx) => goTo(ctx, nextModal(ctx.slot)!),
  },
  {
    id: "verb.adverb",
    scope: "box:verb",
    keys: ["V"],
    label: "Adverb",
    labelKey: "slot.adverb",
    hint: true,
    satellite: new RegExp(`^(modifier|${MODAL_ADVERB_SLOTS.join("|")})$`),
    when: (ctx) => {
      const adverb = adverbOf(ctx.slot);
      return adverb !== undefined && has(ctx, adverb);
    },
    run: (ctx) => goTo(ctx, adverbOf(ctx.slot)!),
  },
  {
    id: "verb.complement",
    scope: "box:verb",
    keys: ["+", "="],
    label: "Add a complement",
    labelKey: "action.addComplement",
    hint: true,
    when: (ctx) => ctx.slot === "verb",
    run: (ctx) => ctx.openComplementMenu(),
  },
  {
    id: "verb.object",
    scope: "box:verb",
    keys: ["O"],
    label: "Direct object",
    labelKey: "slot.directObject",
    hint: true,
    satellite: /^directObject$/,
    when: (ctx) => ctx.slot === "verb" && has(ctx, "directObject"),
    run: (ctx) => ctx.toggleReveal("directObject"),
  },

  // ── The command box, which a command puts in the subject's place ───────────────────────────
  ...IMPERATIVE_PERSONS.map(([person, key, label]): Command<BoxKeyContext> => ({
    id: `mood.person.${person}`,
    scope: "box:mood",
    keys: [key],
    label,
    labelKey: `imperative.person.${person}`,
    // An instruction is addressed to nobody, so there is no person to choose (see
    // ImperativeSubjectSelector, which drops the row for the same reason).
    when: (ctx) => ctx.selection.imperative === true && ctx.imperative.register !== "instruction",
    run: (ctx) => ctx.setImperativePerson(person),
  })),
  {
    id: "mood.register",
    scope: "box:mood",
    keys: ["R"],
    label: "Register",
    labelKey: "imperative.register",
    hint: true,
    when: (ctx) => ctx.selection.imperative === true,
    run: (ctx) =>
      ctx.setImperativeRegister(
        ctx.imperative.register === "instruction" ? "request" : "instruction",
      ),
  },
];

/**
 * The keys that work wherever the cursor is (the plan's §4.1).
 *
 * <kbd>Ctrl</kbd> is used only where an app conventionally uses it — save, open, undo — and the
 * chords the browser owns (<kbd>Ctrl</kbd><kbd>N</kbd>, <kbd>T</kbd>, <kbd>W</kbd>, <kbd>L</kbd>,
 * the digits) are never bound. These are looked up last, after the level the cursor is on, so a
 * bare letter is always the level's before it is the app's.
 */
export const APP_KEYMAP: Command<AppKeyContext>[] = [
  {
    id: "app.help",
    scope: "app",
    keys: ["?"],
    label: "Help",
    labelKey: "help.heading",
    run: (ctx) => ctx.toggleHelp(),
  },
  {
    // The key below esc, matched by where it is rather than by what it types (see matchKey), so it
    // is the same key on every layout. From outside the console it shows it, or takes the keyboard
    // to it; from the prompt, it hides it.
    id: "app.console",
    scope: "app",
    keys: ["Code:Backquote"],
    label: "Show or hide the console",
    // The thing it toggles, as `app.words` names its panel.
    labelKey: "console.name",
    when: (ctx) => Boolean(ctx.console),
    run: (ctx) => ctx.console!.toggle(),
  },
  {
    id: "app.console.command",
    scope: "app",
    keys: ["/"],
    label: "Type a command in the console",
    labelKey: "action.typeCommand",
    when: (ctx) => Boolean(ctx.console),
    run: (ctx) => ctx.console!.startCommand(),
  },
  {
    id: "app.region.next",
    scope: "app",
    keys: ["F6"],
    label: "Next region",
    labelKey: "region.next",
    run: (ctx) => ctx.nav.step(1),
  },
  {
    id: "app.region.previous",
    scope: "app",
    keys: ["Shift+F6"],
    label: "Previous region",
    labelKey: "region.previous",
    run: (ctx) => ctx.nav.step(-1),
  },
  {
    id: "app.save",
    scope: "app",
    keys: ["Mod+S"],
    label: "Save the workspace",
    labelKey: "action.save.tooltip",
    run: (ctx) => ctx.saveWorkspace(),
  },
  {
    id: "app.load",
    scope: "app",
    keys: ["Mod+O"],
    label: "Load a workspace",
    labelKey: "action.load.tooltip",
    run: (ctx) => ctx.loadWorkspace(),
  },
  {
    id: "app.export",
    scope: "app",
    keys: ["Mod+Shift+S"],
    label: "Export as JSON",
    labelKey: "action.export.tooltip",
    run: (ctx) => ctx.exportWorkspace(),
  },
  {
    id: "app.import",
    scope: "app",
    keys: ["Mod+Shift+O"],
    label: "Import JSON",
    labelKey: "action.import.tooltip",
    run: (ctx) => ctx.importWorkspace(),
  },
  {
    id: "app.undo",
    scope: "app",
    keys: ["Mod+Z"],
    label: "Undo",
    labelKey: "action.undo",
    when: (ctx) => Boolean(ctx.undo),
    run: (ctx) => ctx.undo!(),
  },
  {
    id: "app.redo",
    scope: "app",
    keys: ["Mod+Shift+Z"],
    label: "Redo",
    labelKey: "action.redo",
    when: (ctx) => Boolean(ctx.redo),
    run: (ctx) => ctx.redo!(),
  },
  {
    id: "app.words",
    scope: "app",
    keys: ["Mod+B"],
    label: "Show or hide the words",
    labelKey: "words.heading",
    run: (ctx) => ctx.toggleWords(),
  },
];

/** How far <kbd>+</kbd> and <kbd>−</kbd> grow the canvas — the step the resize grip takes. */
export const RESIZE_STEP = 16;

/**
 * The period's own keys (the plan's §4.2), with the cursor on the card rather than in it.
 *
 * Every one of them is a control the card already carries: the letters are the initials of what
 * they do, and where two would collide the commoner one wins — <kbd>C</kbd> is the command and
 * <kbd>T</kbd> the infinitive's "to …", because a period is made a command far more often than it
 * is cited.
 */
export const PERIOD_KEYMAP: Command<PeriodKeyContext>[] = [
  {
    id: "period.enter",
    scope: "period",
    keys: ["Enter"],
    label: "Edit",
    labelKey: "action.edit",
    hint: true,
    run: (ctx) => ctx.nav.enter(),
  },
  {
    id: "period.previous",
    scope: "period",
    keys: ["ArrowUp"],
    label: "Previous period",
    labelKey: "period.previous",
    run: (ctx) => ctx.nav.move("up"),
  },
  {
    id: "period.next",
    scope: "period",
    keys: ["ArrowDown"],
    label: "Next period",
    labelKey: "period.next",
    run: (ctx) => ctx.nav.move("down"),
  },
  // Named by the header buttons' tooltips, so the key and the button say the same.
  ...([
    ["up", "Shift+ArrowUp", -1, "action.movePeriodUp"],
    ["down", "Shift+ArrowDown", 1, "action.movePeriodDown"],
  ] as const).map(([dir, key, delta, labelKey]): Command<PeriodKeyContext> => ({
    id: `period.move.${dir}`,
    scope: "period",
    keys: [key],
    label: `Move the period ${dir}`,
    labelKey,
    when: (ctx) => ctx.canMove(delta),
    run: (ctx) => ctx.move(delta),
  })),
  {
    id: "period.add",
    scope: "period",
    keys: ["N"],
    label: "New period",
    labelKey: "action.addPeriodContainer",
    hint: true,
    run: (ctx) => ctx.addPeriod(),
  },
  {
    id: "period.load",
    scope: "period",
    keys: ["L"],
    label: "Load a period",
    labelKey: "action.loadPeriod",
    run: (ctx) => ctx.loadPeriod(),
  },
  {
    id: "period.save",
    scope: "period",
    keys: ["S"],
    label: "Save this period",
    labelKey: "action.savePeriod",
    when: (ctx) => Boolean(ctx.save) && ctx.hasContent,
    run: (ctx) => ctx.save!(),
  },
  {
    id: "period.remove",
    scope: "period",
    keys: ["Backspace"],
    label: "Remove the period",
    labelKey: "action.removePeriod",
    when: (ctx) => Boolean(ctx.remove),
    run: (ctx) => ctx.remove!(),
  },
  {
    id: "period.command",
    scope: "period",
    keys: ["C"],
    label: "Command",
    labelKey: "imperative.command",
    hint: true,
    when: (ctx) => !ctx.moodLocked,
    run: (ctx) => ctx.toggleImperative(),
  },
  {
    id: "period.infinitive",
    scope: "period",
    keys: ["T"],
    label: "Infinitive",
    labelKey: "infinitive.phrase",
    hint: true,
    when: (ctx) => !ctx.moodLocked,
    run: (ctx) => ctx.toggleInfinitive(),
  },
  {
    id: "period.question",
    scope: "period",
    keys: ["Q"],
    label: "Question",
    labelKey: "mood.question",
    hint: true,
    when: (ctx) => !(ctx.questionLocked ?? ctx.moodLocked),
    run: (ctx) => ctx.toggleQuestion(),
  },
  {
    id: "period.condition",
    scope: "period",
    keys: ["I"],
    label: "If-condition",
    // What the console's /if reads, and the badge the period wears once it is one.
    labelKey: "clause.conditional",
    hint: true,
    // One key for both halves of the same idea: start the pick, or drop the condition there is.
    when: (ctx) => Boolean(ctx.condition?.canStart || ctx.condition?.hasLink),
    run: (ctx) => (ctx.condition!.hasLink ? ctx.condition!.clear() : ctx.condition!.start()),
  },
  {
    id: "period.join",
    scope: "period",
    keys: ["J"],
    label: "Join",
    labelKey: "action.coordinatePeriod",
    hint: true,
    when: (ctx) => Boolean(ctx.coordination?.canStart || ctx.coordination?.hasLink),
    run: (ctx) =>
      ctx.coordination!.hasLink ? ctx.coordination!.clear() : ctx.coordination!.start(),
  },
  {
    // The subordinate clause (P09-E12 D9) — U for s*u*bordinate, a letter the period left free. As J,
    // it presses the border control, whose menu then takes one more letter (T that, O to, W when …).
    id: "period.subordinate",
    scope: "period",
    keys: ["U"],
    label: "Subordinate clause",
    labelKey: "action.addSubordinate",
    hint: true,
    when: (ctx) => Boolean(ctx.subordination?.canStart || ctx.subordination?.hasLink),
    run: (ctx) =>
      ctx.subordination!.hasLink ? ctx.subordination!.clear() : ctx.subordination!.start(),
  },
  {
    // The interjection (P09-E47) — E for *exclamation*, a letter the period left free. As J and U, it
    // presses the border toggle, which shows the box before the subject or takes it away; the box then
    // takes the ordinary box keys (↵ for its word, ⌫ to clear it).
    id: "period.interjection",
    scope: "period",
    keys: ["E"],
    label: "Interjection",
    labelKey: "action.addInterjection",
    hint: true,
    when: (ctx) => Boolean(ctx.toggleInterjection),
    run: (ctx) => ctx.toggleInterjection!(),
  },
  {
    id: "period.level",
    scope: "period",
    keys: ["R"],
    label: "The instrumental's level",
    labelKey: "instrumental.level",
    when: (ctx) => Boolean(ctx.cycleLevel),
    run: (ctx) => ctx.cycleLevel!(),
  },
  {
    // The instrument denied — the privative, "cuts without the knife" (P09-E2). The cause box's
    // polarity is ⇧N, and so is this one: N itself is a new period here, as it is the noun's number
    // there. Neither is the clause's own negation, which the verb's N toggles.
    id: "period.privative",
    scope: "period",
    keys: ["Shift+N"],
    label: "Polarity",
    labelKey: "satellite.polarity",
    when: (ctx) => Boolean(ctx.togglePrivative),
    run: (ctx) => ctx.togglePrivative!(),
  },
  {
    // Whose the infinitive is (P13): the governing clause's object, the causee, or its subject.
    id: "period.objectControl",
    scope: "period",
    keys: ["O"],
    label: "Agent",
    labelKey: "slot.agent",
    when: (ctx) => Boolean(ctx.toggleObjectControl),
    run: (ctx) => ctx.toggleObjectControl!(),
  },
  {
    id: "period.compact",
    scope: "period",
    keys: ["Z"],
    label: "Compact",
    labelKey: "action.compactPeriod",
    when: (ctx) => ctx.hasGroups,
    run: (ctx) => ctx.toggleCompact(),
  },
  {
    id: "period.tidy",
    scope: "period",
    keys: ["W"],
    label: "Tidy",
    labelKey: "action.tidyPeriod",
    when: (ctx) => ctx.hasGroups,
    run: (ctx) => ctx.tidy(),
  },
  // What the resize grip does, a step at a time: EXPAND and SHRINK the canvas (not COMPACT, which is Z).
  ...([
    ["taller", "+", RESIZE_STEP, "Expand the canvas", "action.expandCanvas"],
    ["taller", "=", RESIZE_STEP, "Expand the canvas", "action.expandCanvas"],
    ["shorter", "-", -RESIZE_STEP, "Shrink the canvas", "action.shrinkCanvas"],
  ] as const).map(([dir, key, delta, label, labelKey], i): Command<PeriodKeyContext> => ({
    id: `period.${dir}${i === 1 ? ".alt" : ""}`,
    scope: "period",
    keys: [key],
    label,
    labelKey,
    run: (ctx) => ctx.resize(delta),
  })),
  {
    id: "period.out",
    scope: "period",
    keys: ["Escape"],
    label: "Leave the period",
    labelKey: "action.leavePeriod",
    run: (ctx) => ctx.nav.exit(),
  },
];

/**
 * The command a keystroke runs: the first match in the most specific scope that offers one. A
 * noun's <kbd>N</kbd> is found before the box-level keys are even looked at, which is what makes
 * the same letter mean the number here and the negation on a verb.
 */
export function resolveCommand<C>(
  commands: readonly Command<C>[],
  scopes: readonly Scope[],
  matches: (spec: string) => boolean,
  ctx: C,
): Command<C> | undefined {
  for (const scope of scopes) {
    const hit = commands.find(
      (c) => c.scope === scope && c.keys.some(matches) && (c.when?.(ctx) ?? true),
    );
    if (hit) return hit;
  }
  return undefined;
}

/** The keys to teach for the cursor's scopes — what the hint line lists, in scope order. */
export function hintsFor<C>(
  commands: readonly Command<C>[],
  scopes: readonly Scope[],
  ctx: C,
): Command<C>[] {
  return scopes.flatMap((scope) =>
    commands.filter((c) => c.scope === scope && c.hint && (c.when?.(ctx) ?? true)),
  );
}

/**
 * The key a satellite's control answers to, for its key tip and its tooltip. Read off the keymap
 * rather than listed again here, so a control can never advertise a key that is not bound.
 */
export function satelliteKey(satelliteKey: string, scopes: readonly Scope[]): string | undefined {
  for (const scope of scopes) {
    const hit = KEYMAP.find((c) => c.scope === scope && c.satellite?.test(satelliteKey));
    if (hit) return hit.keys[0];
  }
  return undefined;
}

/** What a list of keys needs of a command to name it. */
export interface CommandName {
  label: string;
  labelKey?: UiStringKey;
  reverses?: string;
}

/**
 * What a command is called in the UI language: its catalogue entry, or its English `label` where the
 * words are not seeded yet. A ⇧ twin is named after the command it `reverses`: that one's name, a
 * comma, and `hint.backwards` — "Tense, backwards", it "Tempo, all'indietro". BACKWARDS is an adverb,
 * which a verbless label has no verb for, so the two are joined here (the C14 rule).
 */
export function commandLabel(command: CommandName, t: (key: UiStringKey) => string): string {
  const own = command.labelKey ? t(command.labelKey) : command.label;
  if (!command.reverses) return own;
  const commands: (CommandName & { id: string })[] = [...KEYMAP, ...PERIOD_KEYMAP, ...APP_KEYMAP];
  const forward = commands.find((c) => c.id === command.reverses);
  return forward ? `${commandLabel(forward, t)}, ${own}` : command.label;
}
