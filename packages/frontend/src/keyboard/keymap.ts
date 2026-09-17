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

import type { UiStringKey } from "@signi/shared";
import type {
  BoxComplementType,
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
  /** esc: leave the box. Phase 3 lands the cursor on the period; today it lets the box go. */
  exit: () => void;
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
  openDeterminerMenu: (which: NounKey) => void;
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

export type KeyContext = BoxContext & { nav: CursorNav };

export interface Command {
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
  when?: (ctx: KeyContext) => boolean;
  /** Returning `false` declines the keystroke, leaving it to the browser (see box.next). */
  run: (ctx: KeyContext) => void | boolean;
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
const goTo = (ctx: KeyContext, slot: SlotKey) => ctx.revealSlot(slot, slot);

// ── The map ───────────────────────────────────────────────────────────────────────────────────

export const KEYMAP: Command[] = [
  // ── Every box: moving about, choosing a word, clearing it ──────────────────────────────────
  ...(
    [
      ["left", "ArrowLeft"],
      ["up", "ArrowUp"],
      ["right", "ArrowRight"],
      ["down", "ArrowDown"],
    ] as const
  ).map(([dir, key]): Command => ({
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
  ).map(([dir, key, dx, dy]): Command => ({
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
];

/**
 * The command a keystroke runs: the first match in the most specific scope that offers one. A
 * noun's <kbd>N</kbd> is found before the box-level keys are even looked at, which is what makes
 * the same letter mean the number here and the negation on a verb.
 */
export function resolveCommand(
  scopes: readonly Scope[],
  matches: (spec: string) => boolean,
  ctx: KeyContext,
): Command | undefined {
  for (const scope of scopes) {
    const hit = KEYMAP.find(
      (c) => c.scope === scope && c.keys.some(matches) && (c.when?.(ctx) ?? true),
    );
    if (hit) return hit;
  }
  return undefined;
}

/** The keys to teach for the cursor's scopes — what the hint line lists, in scope order. */
export function hintsFor(scopes: readonly Scope[], ctx: KeyContext): Command[] {
  return scopes.flatMap((scope) =>
    KEYMAP.filter((c) => c.scope === scope && c.hint && (c.when?.(ctx) ?? true)),
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
