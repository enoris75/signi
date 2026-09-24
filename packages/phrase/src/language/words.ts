import {
  DEFAULT_TEMPORAL_RELATION,
  DETERMINER_COMPLEMENT_TYPES,
  defaultDefiniteness,
  type ComplementType,
  type Concept,
  type Definiteness,
} from "@signi/shared";
import {
  builderNounAddress,
  POSSESSOR_KEY,
  POSSESSOR_REF_KEY,
  type NounAddress,
  type NounKey,
  type PhraseContainer,
  type PhraseSelection,
  type SlotKey,
} from "../model/interfaces.ts";
import {
  nounSliceAt,
  setAspect,
  setVoice,
  setDefiniteness,
  setDegree,
  setGender,
  setModifierNumber,
  setModifierRelation,
  setNegative,
  setNumber,
  setCauseNegative,
  setSentiment,
  setSpecifier,
  setGlossRelation,
  setSubjectGloss,
  setPossessorRole,
  setTemporalRelation,
  setTense,
  type Gender,
} from "../model/phraseReducers.ts";
import {
  adjectiveSlots,
  COORDINABLE_NOUN_KEYS,
  isModalAdverbSlot,
  isModalSlot,
  modalAdverbFor,
  MODAL_SLOTS,
  negativeFieldOf,
  NOUN_KEYS,
} from "../model/slots.ts";
import type { Action, Setting } from "./commands.ts";
import type { WordKindName } from "./diagnostics.ts";
import type { WordRef } from "./types.ts";

/**
 * The words of a period as the console sees them: each box, what kind of word it holds, and which
 * commands it can take.
 *
 * "Can take" is the canvas's own rule, restated: a box takes a command exactly when the control that
 * command stands for is offered on it — the same fact each satellite's `available` rests on (see
 * rawSatellites). A noun takes a number once it has a head, a determiner only if the head is a noun
 * and its slot has an article to give, a verb its tense only outside a command or a citation.
 */

export type WordKind = "noun" | "adjective" | "modifierAdjective" | "verb" | "modal" | "adverb";

export interface WordInfo {
  ref: WordRef;
  kind: WordKind;
  /** The period's own selection. */
  root: PhraseSelection;
  /** The selection holding the word: the period, or the possessor or conjunct it is nested in. */
  slice: PhraseSelection;
  concept?: Concept;
  /** A noun's own key in its slice; for an adjective, the key of the noun it describes. */
  which?: NounKey;
  /** A noun's address from the period's root — what a link or a reference names it by. */
  address?: NounAddress;
}

const isAdjectiveSlot = (slot: string) => /Adjective\d?$/.test(slot);

/** The noun an adjective slot describes ("subjectAdjective2" → "subject"). */
export const nounOfAdjective = (slot: SlotKey): NounKey => slot.replace(/Adjective\d?$/, "") as NounKey;

/** The selection a word lives in: the period's, or a nested phrase's. */
export function sliceOf(root: PhraseSelection, slice: NounAddress | undefined): PhraseSelection | undefined {
  return slice ? nounSliceAt(root, slice)?.slice : root;
}

/** The word box a noun address names: a period noun, or the head of a nested phrase. */
export function nounWord(containerId: string, address: NounAddress): WordRef {
  return address.includes("/")
    ? { containerId, slice: address, slot: "subject" }
    : { containerId, slot: address as SlotKey };
}

export function wordInfo(containers: PhraseContainer[], ref: WordRef): WordInfo | undefined {
  const root = containers.find((c) => c.id === ref.containerId)?.selection;
  if (!root) return undefined;
  const slice = sliceOf(root, ref.slice);
  if (!slice) return undefined;
  const slot = ref.slot;
  if (ref.modifierAdjective) {
    return {
      ref,
      kind: "modifierAdjective",
      root,
      slice,
      concept: slice.modifierAdjectives?.[slot],
      which: nounOfAdjective(slot),
    };
  }
  const concept = slice[slot];
  if (isAdjectiveSlot(slot))
    return { ref, kind: "adjective", root, slice, concept, which: nounOfAdjective(slot) };
  if (slot === "verb") return { ref, kind: "verb", root, slice, concept };
  if (isModalSlot(slot)) return { ref, kind: "modal", root, slice, concept };
  if (slot === "modifier" || isModalAdverbSlot(slot)) return { ref, kind: "adverb", root, slice, concept };
  if ((NOUN_KEYS as string[]).includes(slot)) {
    const which = slot as NounKey;
    return { ref, kind: "noun", root, slice, concept, which, address: builderNounAddress(ref.slice, which) };
  }
  return undefined;
}

/** Whether a command or a citation holds the finite slot, withdrawing tense, aspect and modals. */
export const finiteSlotTaken = (sel: PhraseSelection) => Boolean(sel.imperative || sel.infinitive);

// ── Where an attaching command lands on a word ───────────────────────────────

/** The adjective box `/adj` fills on a word: the noun's next free link, or a noun modifier's own. */
export function adjectiveTarget(w: WordInfo): { slot: SlotKey; modifierAdjective?: boolean } | undefined {
  if (w.kind === "noun" && w.concept?.role === "noun") {
    const slot = adjectiveSlots(w.which!).find((key) => !w.slice[key]);
    return slot ? { slot } : undefined;
  }
  if (w.kind === "adjective" && w.concept?.role === "noun" && !w.slice.modifierAdjectives?.[w.ref.slot])
    return { slot: w.ref.slot, modifierAdjective: true };
  return undefined;
}

/** The adverb box `/adv` fills: the verb's own, or a modal's. */
export function adverbTarget(w: WordInfo): SlotKey | undefined {
  if (w.ref.slice) return undefined;
  if (w.kind === "verb") return "modifier";
  if (w.kind === "modal" && w.concept) return modalAdverbFor(w.ref.slot);
  return undefined;
}

/** The modal box `/modal` fills: the first free link of the chain the verb carries, or the next after a modal. */
export function modalTarget(w: WordInfo): SlotKey | undefined {
  if (w.ref.slice || finiteSlotTaken(w.root)) return undefined;
  if (w.kind === "verb") return MODAL_SLOTS.find((key) => !w.root[key]);
  if (w.kind === "modal" && w.concept) {
    const next = MODAL_SLOTS[MODAL_SLOTS.indexOf(w.ref.slot) + 1];
    return next && !w.root[next] ? next : undefined;
  }
  return undefined;
}

// ── Settings ─────────────────────────────────────────────────────────────────

/** Whether a noun slot takes a determiner at all, whatever its head (see rawSatellites' Definiteness). */
function hasDeterminer(which: NounKey, concept: Concept): boolean {
  if (which === "subject" || which === "directObject") return true;
  return (
    DETERMINER_COMPLEMENT_TYPES.includes(which as ComplementType) &&
    !(which === "manner" && concept.mannerRelation === "measure")
  );
}

/** The genders a noun's gender control offers — none where it offers no control. */
function gendersOffered(w: WordInfo): Gender[] {
  const c = w.concept;
  if (w.kind !== "noun" || !c) return [];
  // A pronoun is described rather than chosen: the chooser that picks one sets its gender in any slot,
  // masculine or feminine for every person and neuter for the third alone (see usePronounChooser).
  if (c.role === "pronoun") return c.person === "3" ? ["masc", "fem", "neut"] : ["masc", "fem"];
  return c.role === "noun" && c.gendered ? ["masc", "fem"] : [];
}

/** Whether a word takes a setting — whether the control the setting stands for is offered on it. */
export function settingTakes(s: Setting, w: WordInfo): boolean {
  const c = w.concept;
  switch (s.id) {
    case "number":
      return (w.kind === "noun" && Boolean(c) && c!.role !== "adjective") || (w.kind === "adjective" && c?.role === "noun");
    case "gender":
      return gendersOffered(w).includes(s.value);
    case "determiner":
      return w.kind === "noun" && c?.role === "noun" && hasDeterminer(w.which!, c);
    case "specifier":
      return w.kind === "noun" && !w.ref.slice && (w.which === "route" || w.which === "locative") && Boolean(c);
    // The temporal's relation, on its box once it holds a word — where its toolbar is drawn — and a
    // time reading's, on the subject that reads so (P13).
    case "temporal":
      return (
        w.kind === "noun" && !w.ref.slice && Boolean(c) &&
        (w.which === "temporal" || (w.which === "subject" && w.slice.subjectGloss === "temporal"))
      );
    // What a genitive possessor is to its noun (P13), once there is one — a pronominal one has no role.
    case "possessorRole":
      return (
        w.kind === "noun" && c?.role === "noun" &&
        Boolean((w.slice[POSSESSOR_KEY(w.which!)] as PhraseSelection | undefined)?.subject) &&
        !w.slice[POSSESSOR_REF_KEY(w.which!)]
      );
    // How the subject of a period reads (P13): a noun's, its phrase the whole of a verbless period.
    case "gloss":
      return w.kind === "noun" && !w.ref.slice && w.which === "subject" && c?.role === "noun";
    case "sentiment":
    // The cause's own polarity is offered wherever its stance is: on the cause box, once it holds
    // a word. It is not the verb's "polarity" — that one negates the clause.
    case "causePolarity":
      return w.kind === "noun" && !w.ref.slice && w.which === "cause" && Boolean(c);
    case "tense":
    case "aspect":
      return w.kind === "verb" && !finiteSlotTaken(w.root);
    // Only a verb with a patient has a passive to be in (see `VerbPhrase.voice`), and a command is
    // always active — an infinitive citation is not, so it keeps its voice and prints it ("to be
    // loved"). The *canvas* satellite also waits for the object to be there, since a control
    // that can do nothing is worth hiding; the console asks only about the verb, because a line
    // names its object after its verb ("/verb ( eat /passive ) /obj ( food )") and a setting that
    // could not be written until the object existed could not be printed back either.
    case "voice":
      return (
        w.kind === "verb" &&
        !w.root.imperative &&
        (w.slice.verb?.transitivity === "transitive" || w.slice.verb?.transitivity === "ditransitive")
      );
    // Polarity is per word of the verb group: the verb's own, or a modal's ("/modal ( want /not )").
    case "polarity":
      return w.kind === "verb" || (w.kind === "modal" && Boolean(w.concept));
    case "degree":
      return (
        (w.kind === "adjective" && c?.role === "adjective") ||
        (w.kind === "noun" && w.which === "predicative" && c?.role === "adjective")
      );
    case "relation":
      return w.kind === "adjective" && c?.role === "noun";
  }
}

/** A setting written onto the selection holding the word. */
export function applySetting(s: Setting, w: WordInfo, slice: PhraseSelection): PhraseSelection {
  const which = w.which!;
  switch (s.id) {
    case "number":
      return w.kind === "adjective" ? setModifierNumber(slice, w.ref.slot, s.value) : setNumber(slice, which, s.value);
    case "gender":
      return setGender(slice, which, s.value);
    case "determiner":
      return setDefiniteness(slice, which, s.value);
    case "specifier":
      return setSpecifier(slice, s.value, which as "route" | "locative");
    case "temporal":
      return which === "subject" ? setGlossRelation(slice, s.value) : setTemporalRelation(slice, s.value);
    case "gloss":
      return setSubjectGloss(slice, s.value === "plain" ? undefined : s.value);
    case "possessorRole":
      return setPossessorRole(slice, which, s.value === "owner" ? undefined : s.value);
    case "sentiment":
      return setSentiment(slice, s.value);
    case "causePolarity":
      return setCauseNegative(slice, s.value === "negative");
    case "tense":
      return setTense(slice, s.value);
    case "aspect":
      return setAspect(slice, s.value);
    case "voice":
      return setVoice(slice, s.value);
    case "polarity":
      return setNegative(slice, s.value === "negative", negativeFieldOf(w.ref.slot) ?? "verbNegative");
    case "degree":
      return setDegree(slice, w.ref.slot, s.value);
    case "relation":
      return setModifierRelation(slice, w.ref.slot, s.value);
  }
}

/** The value a word holds for a setting now — what the list shows as "now …". */
export function currentSetting(id: Setting["id"], w: WordInfo): string | undefined {
  const sel = w.slice;
  const which = w.which;
  switch (id) {
    case "number":
      return w.kind === "adjective"
        ? sel.modifierNumbers?.[w.ref.slot] ?? "singular"
        : ((sel[`${which}Number` as keyof PhraseSelection] as string | undefined) ?? "singular");
    case "gender":
      return (sel[`${which}Gender` as keyof PhraseSelection] as string | undefined) ?? "masc";
    case "determiner":
      return (
        (sel[`${which}Definiteness` as keyof PhraseSelection] as Definiteness | undefined) ??
        defaultDefiniteness(which!)
      );
    case "specifier":
      return which === "route" ? sel.routeSpecifier ?? "through" : sel.locativeSpecifier ?? "in";
    case "temporal":
      return (which === "subject" ? sel.subjectGlossRelation : sel.temporalRelation) ?? DEFAULT_TEMPORAL_RELATION;
    case "gloss":
      return sel.subjectGloss ?? "plain";
    case "possessorRole":
      return sel.possessorRoles?.[which!] ?? "owner";
    case "sentiment":
      return sel.causeSentiment ?? "neutral";
    case "causePolarity":
      return sel.causeNegative ? "negative" : "positive";
    case "tense":
      return sel.verbTense ?? "present";
    case "aspect":
      return sel.verbAspect ?? "neutral";
    case "voice":
      return sel.verbVoice ?? "active";
    case "polarity":
      return sel[negativeFieldOf(w.ref.slot) ?? "verbNegative"] ? "negative" : "positive";
    case "degree":
      return sel.adjectiveDegrees?.[w.ref.slot] ?? "positive";
    case "relation":
      return sel.modifierRelations?.[w.ref.slot] ?? "feature";
  }
}

/** The value a setting has when nothing chose one — what the printer leaves out. */
export function defaultSetting(id: Setting["id"], w: WordInfo): string {
  switch (id) {
    case "number":
      return "singular";
    case "gender":
      return "masc";
    case "determiner":
      return defaultDefiniteness(w.which!);
    case "specifier":
      return w.which === "route" ? "through" : "in";
    case "temporal":
      return DEFAULT_TEMPORAL_RELATION;
    case "gloss":
      return "plain";
    case "possessorRole":
      return "owner";
    case "sentiment":
      return "neutral";
    case "causePolarity":
      return "positive";
    case "tense":
      return "present";
    case "aspect":
      return "neutral";
    case "voice":
      return "active";
    case "polarity":
      return "positive";
    case "degree":
      return "positive";
    case "relation":
      return "feature";
  }
}

/** Whether a word can take an attaching command at all — the one rule's "that can take it". */
export function takes(action: Action, w: WordInfo): boolean {
  switch (action.kind) {
    case "adjective":
      return adjectiveTarget(w) !== undefined;
    case "adverb":
      return adverbTarget(w) !== undefined;
    case "modal":
      return modalTarget(w) !== undefined;
    case "setting":
      return settingTakes(action.setting, w);
    case "set":
      return settingTakes({ id: action.id, value: defaultSetting(action.id, w) } as Setting, w);
    case "possessor":
    case "relative":
    case "headless":
      return w.kind === "noun" && w.concept?.role === "noun";
    // Only the period's predicate adjective is compared with a standard, whatever its degree: one
    // held under a degree that takes none is kept, and printed, so it must be read back too.
    case "standard":
      return w.kind === "noun" && !w.ref.slice && w.which === "predicative" && w.concept?.role === "adjective";
    case "conjunct":
      return (
        w.kind === "noun" && !w.ref.slice && COORDINABLE_NOUN_KEYS.includes(w.which!) && Boolean(w.concept)
      );
    default:
      return false;
  }
}

/** Whether a command attaches to a word, rather than to the period or the app. */
export const attachesToWord = (action: Action): boolean =>
  ["adjective", "adverb", "modal", "setting", "set", "possessor", "standard", "conjunct", "relative", "headless"].includes(action.kind);

/** What kind of word a diagnostic says a word is: "food is a noun" (see diagnostics.ts). */
export function kindOf(w: WordInfo): WordKindName {
  switch (w.kind) {
    case "noun":
      return w.concept?.role === "pronoun" ? "pronoun" : w.concept?.role === "adjective" ? "adjective" : "noun";
    case "adjective":
      return w.concept?.role === "noun" ? "nounModifier" : "adjective";
    case "modifierAdjective":
      return "adjective";
    case "verb":
      return "verb";
    case "modal":
      return "modal";
    case "adverb":
      return "adverb";
  }
}
