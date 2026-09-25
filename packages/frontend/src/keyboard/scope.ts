/**
 * What the cursor is on, and therefore what a bare key means.
 *
 * The cursor's *level* decides a key's meaning, not a modifier: the same <kbd>N</kbd> is the
 * number on a noun and the negation on a verb, because the two are different scopes. Scopes are
 * resolved rather than declared per handler, so one keymap can drive the handling, the key tips
 * and the hint line together.
 */

import type { Concept } from "@signi/shared";
import type { NounKey, PhraseSelection, SlotKey } from "../components/PhraseBuilder/interfaces.ts";
import {
  COMPLEMENT_KEY_SET,
  isModalAdverbSlot,
  isVerbAdverbSlot,
  isModalSlot,
  NOUN_KEYS,
} from "../components/PhraseBuilder/slots.ts";

/**
 * The levels a key can be bound at. `box` is every word box alike (moving about, choosing a word,
 * clearing it); `box:<kind>` is the grammar of the kind of word it holds. The rest are named here
 * so the keymap's type is complete, and are filled in by the later phases of the plan.
 */
export type Scope =
  | "app"
  | "period"
  | "box"
  | "box:noun"
  | "box:adjective"
  | "box:verb"
  | "box:mood"
  | "picker"
  | "menu"
  | "pick"
  | "translations"
  | "words";

/** The kind of word a box holds, which picks its grammar scope. */
export type BoxKind = "noun" | "adjective" | "verb" | "mood";

/**
 * The scopes a key is looked up in, most specific first: a noun box answers to the noun's keys,
 * then to every box's. A box with no grammar of its own — an adverb, which carries nothing to
 * cycle — answers only to the latter.
 */
export function boxScopeChain(kind: BoxKind | null): Scope[] {
  return kind ? [`box:${kind}` as Scope, "box"] : ["box"];
}

/** The noun block a box belongs to, when it is one — its own key, for a noun box. */
export function nounKeyOf(slot: SlotKey): NounKey | null {
  return (NOUN_KEYS as string[]).includes(slot) ? (slot as NounKey) : null;
}

const isAdjectiveSlot = (slot: SlotKey) => /Adjective\d?$/.test(slot);

/**
 * The noun block a box works on: a noun box is its own, and an adjective box is its noun's —
 * "subjectAdjective2" describes the subject. Undefined for the verb phrase and its words, which
 * belong to no noun block.
 */
export function nounBlockOf(slot: SlotKey): NounKey | null {
  return nounKeyOf(slot.replace(/Adjective\d?$/, "") as SlotKey);
}

/**
 * The scopes one box's keys are looked up in, most specific first.
 *
 * Mostly the slot decides — a verb slot is a verb — but a box takes its grammar from the word in
 * it as well as from the place it sits:
 *
 *  - an *adjective slot* holds either a real adjective ("beautiful") or an attributive noun ("sail
 *    boat"); both carry the adjective controls, and neither carries its head noun's, so N there is
 *    the modifier's own number and never the subject's;
 *  - a *noun slot* holding a predicate adjective ("seems happy") carries both: the degree, like any
 *    adjective, and the controls its slot offers whatever fills it — a predicative can still be
 *    coordinated ("seems happy or tired"). Adjective first, so the adjective's reading of a shared
 *    letter wins; every command is guarded by `when`, so the noun's is reached exactly when the
 *    adjective has nothing to offer.
 */
export function boxScopesOf(slot: SlotKey, selection: PhraseSelection): Scope[] {
  // A subject-dropping mood puts its own box in the subject's place (see PhraseCanvas).
  if (slot === "subject" && (selection.imperative || selection.infinitive))
    return boxScopeChain("mood");
  if (slot === "verb" || isModalSlot(slot)) return boxScopeChain("verb");
  // An adverb is a word with no grammar of its own: it moves and is chosen like any box, and
  // there is nothing on it to cycle.
  if (isVerbAdverbSlot(slot) || isModalAdverbSlot(slot)) return boxScopeChain(null);
  if (isAdjectiveSlot(slot)) return boxScopeChain("adjective");
  const held = selection[slot] as Concept | undefined;
  const noun = Boolean(nounKeyOf(slot));
  if (noun && held?.role === "adjective") return ["box:adjective", "box:noun", "box"];
  return boxScopeChain(noun ? "noun" : null);
}

/** Whether a box is one of the boxed complements (the only boxes that can be removed whole). */
export const isComplementSlot = (slot: SlotKey) => COMPLEMENT_KEY_SET.has(slot);

/**
 * Whether keys typed at this element are the user writing rather than commanding. Bare letters
 * are never taken from a text field — an open word picker is the app's own search box, and it
 * owns every key inside it.
 */
export function isEditableTarget(el: EventTarget | null): boolean {
  if (!(el instanceof Element)) return false;
  const node = el as HTMLElement;
  if (node.isContentEditable) return true;
  const tag = node.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag !== "INPUT") return false;
  // Checkboxes, radios and buttons rendered as inputs take keys as commands, not as text.
  const type = (node as HTMLInputElement).type;
  return !["checkbox", "radio", "button", "submit", "reset"].includes(type);
}

/**
 * The scopes declared on the page around `el`, read from the nearest `data-kb-scope` ancestor.
 * The attribute holds one or more scope names, space-separated and most specific first. Nothing
 * declared means the cursor is nowhere in particular, which is the app level.
 */
export function resolveScopes(el: Element | null): Scope[] {
  const owner = el?.closest?.("[data-kb-scope]");
  const declared = owner?.getAttribute("data-kb-scope")?.trim();
  const scopes = declared ? (declared.split(/\s+/) as Scope[]) : [];
  return [...scopes, "app"];
}
