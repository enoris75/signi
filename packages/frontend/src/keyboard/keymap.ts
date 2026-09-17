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
  NounKey,
  PhraseSelection,
  SlotKey,
} from "../components/PhraseBuilder/interfaces.ts";
import type { Satellite } from "../components/PhraseBuilder/satellites/index.ts";
import {
  adjectiveSlots,
  MODAL_ADVERB_SLOTS,
  MODAL_SLOTS,
  modalAdverbFor,
} from "../components/PhraseBuilder/slots.ts";
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
  selection: PhraseSelection;
  /** The noun block the box belongs to: its own key, or the noun an adjective slot describes. */
  nounKey: NounKey | null;
  /** One of this builder's satellites by key — `available` says whether its control exists. */
  satellite: (key: string) => Satellite | undefined;
  /** Put the cursor on another box of this phrase, revealing its satellite's box if it is folded. */
  revealSlot: (slotKey: SlotKey, satelliteKey?: string) => void;
  /** Show or hide a satellite's box without moving the cursor (the direct object's fold-away). */
  toggleReveal: (satelliteKey: string) => void;
  /** Open this box's word picker over its word (a filled box) — what clicking it does. */
  editSlot: (slotKey: SlotKey) => void;
  clearSlot: (slotKey: SlotKey) => void;
  removeComplement: (type: BoxComplementType) => void;
  togglePossessor: (which: NounKey) => void;
  addConjunct: (which: NounKey) => void;
  cycleConjunction: (which: NounKey) => void;
  /** The noun's relative clause: start the pick for one, or drop the link there is. */
  relative: { has: boolean; start: () => void; clear: () => void } | undefined;
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
  toggleNegative: () => void;
  cycleTense: (step: 1 | -1) => void;
  cycleAspect: (step: 1 | -1) => void;
  cycleDegree: (slotKey: SlotKey, step: 1 | -1) => void;
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
  /** C / T — the two moods, which share the finite slot and so exclude each other. */
  toggleImperative: () => void;
  toggleInfinitive: () => void;
  moodLocked: boolean;
  /** I / J — the two clause-level relations: start the pick, or drop the link there is. */
  condition: { canStart: boolean; hasLink: boolean; start: () => void; clear: () => void } | undefined;
  coordination: { canStart: boolean; hasLink: boolean; start: () => void; clear: () => void } | undefined;
  /** R — how far an instrument period is reified: process → concept → object. */
  cycleLevel: (() => void) | undefined;
  /** Z / W / + − — the view: compact, tidy, and the canvas's height. */
  toggleCompact: () => void;
  tidy: () => void;
  hasGroups: boolean;
  resize: (delta: number) => void;
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

/** Whether the box holds an attributive noun ("sail boat") rather than a real adjective. */
const isNounModifier = (ctx: BoxContext) =>
  /Adjective\d?$/.test(ctx.slot) && ctx.selection[ctx.slot]?.role === "noun";

const isRealAdjective = (ctx: BoxContext) => ctx.selection[ctx.slot]?.role === "adjective";

const filled = (ctx: BoxContext) => Boolean(ctx.selection[ctx.slot]);

/** Reveal `slot` and put the cursor in it; its satellite is named when it is folded away. */
const goTo = (ctx: BoxKeyContext, slot: SlotKey) => ctx.revealSlot(slot, slot);

/** The complements whose ring carries a relation toolbar, which S points the next key at. */
const TOOLBAR_SLOTS: SlotKey[] = ["route", "locative", "cause"];

/** The command box's three addressees, counted the way its rows are stacked. */
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
    label: `Nearest box ${dir}`,
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
    label: `Move the box ${dir}`,
    run: (ctx) => ctx.nudge(ctx.slot, dx, dy),
  })),
  {
    id: "box.next",
    scope: "box",
    keys: ["Tab"],
    label: "Next box",
    run: (ctx) => ctx.nav.step(1),
  },
  {
    id: "box.previous",
    scope: "box",
    keys: ["Shift+Tab"],
    label: "Previous box",
    run: (ctx) => ctx.nav.step(-1),
  },
  {
    id: "box.word",
    scope: "box",
    keys: ["Enter", "Space"],
    label: "Change the word",
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
    // named parts; this names the part, and is ready for /localize like the other new labels.
    label: "Clear the word",
    hint: true,
    when: filled,
    run: (ctx) => ctx.clearSlot(ctx.slot),
  },
  {
    id: "box.fold",
    scope: "box",
    keys: ["Z"],
    label: "Fold the group",
    run: (ctx) => ctx.toggleCollapse(ctx.slot),
  },
  {
    id: "box.out",
    scope: "box",
    keys: ["Escape"],
    label: "Step out",
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
    when: (ctx) => Boolean(ctx.satellite(`${ctx.nounKey}Conjunct`)?.hasValue),
    run: (ctx) => ctx.cycleConjunction(ctx.nounKey!),
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
    id: "noun.relation",
    scope: "box:noun",
    keys: ["S"],
    label: "Relation",
    hint: true,
    // The spatial complements carry a relation ("under the bed"), the cause an affective stance
    // ("thanks to" / "because of" / "the fault of"). Both are toolbars already on the ring, so S
    // points the next key at one rather than opening anything.
    when: (ctx) => TOOLBAR_SLOTS.includes(ctx.slot) && Boolean(ctx.selection[ctx.slot]),
    run: (ctx) => ctx.armToolbar(ctx.slot),
  },
  {
    id: "noun.removeComplement",
    scope: "box:noun",
    keys: ["Shift+Backspace"],
    label: "Remove the complement",
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
    when: isRealAdjective,
    run: (ctx) => ctx.cycleDegree(ctx.slot, -1),
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
    id: "verb.negate",
    scope: "box:verb",
    keys: ["N"],
    label: "Polarity",
    labelKey: "satellite.polarity",
    hint: true,
    satellite: /^verbNegative$/,
    when: (ctx) => has(ctx, "verbNegative"),
    run: (ctx) => ctx.toggleNegative(),
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
    hint: true,
    when: (ctx) => ctx.selection.imperative === true,
    run: (ctx) =>
      ctx.setImperativeRegister(
        ctx.imperative.register === "instruction" ? "request" : "instruction",
      ),
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
    hint: true,
    run: (ctx) => ctx.nav.enter(),
  },
  {
    id: "period.previous",
    scope: "period",
    keys: ["ArrowUp"],
    label: "Previous period",
    run: (ctx) => ctx.nav.move("up"),
  },
  {
    id: "period.next",
    scope: "period",
    keys: ["ArrowDown"],
    label: "Next period",
    run: (ctx) => ctx.nav.move("down"),
  },
  ...([
    ["up", "Shift+ArrowUp", -1],
    ["down", "Shift+ArrowDown", 1],
  ] as const).map(([dir, key, delta]): Command<PeriodKeyContext> => ({
    id: `period.move.${dir}`,
    scope: "period",
    keys: [key],
    label: `Move the period ${dir}`,
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
    id: "period.condition",
    scope: "period",
    keys: ["I"],
    label: "If-condition",
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
    id: "period.level",
    scope: "period",
    keys: ["R"],
    label: "Instrument level",
    when: (ctx) => Boolean(ctx.cycleLevel),
    run: (ctx) => ctx.cycleLevel!(),
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
  ...([
    ["taller", "+", RESIZE_STEP],
    ["taller", "=", RESIZE_STEP],
    ["shorter", "-", -RESIZE_STEP],
  ] as const).map(([dir, key, delta], i): Command<PeriodKeyContext> => ({
    id: `period.${dir}${i === 1 ? ".alt" : ""}`,
    scope: "period",
    keys: [key],
    label: `Canvas ${dir}`,
    run: (ctx) => ctx.resize(delta),
  })),
  {
    id: "period.out",
    scope: "period",
    keys: ["Escape"],
    label: "Step out",
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
