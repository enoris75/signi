import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { nounConjuncts, type NounElement, type PhrasePlan, type Translation } from "@signi/shared";
import { fetchTranslation } from "../api.ts";
import { ADVERB_SLOTS, MODAL_SLOTS } from "../components/PhraseBuilder/slots.ts";
import type { PhraseSelection, SlotKey } from "../components/PhraseBuilder/interfaces.ts";
import { useUiLanguage } from "./LanguageContext.tsx";

/** A row's word as the sentence says it, where the engine placed it. */
export type RoleWord = (slot: SlotKey) => string | undefined;

/**
 * The span name (`RoleSpan.slot`) a row of the Phrase view reads: its own key for the subject, the
 * verb, the object and a complement; the vocative's plan field; and an adverb or a modal by its place
 * among the filled ones, since the plan closes the chain's holes (see buildVerbPhrase).
 */
export function spanSlotOf(slot: SlotKey, selection: PhraseSelection): string {
  if (slot === "vocative") return "address";
  const chained = (chain: SlotKey[], name: string) =>
    `${name}.${chain.slice(0, chain.indexOf(slot)).filter((key) => selection[key]).length}`;
  if (ADVERB_SLOTS.includes(slot)) return chained(ADVERB_SLOTS, "modifier");
  if (MODAL_SLOTS.includes(slot)) return chained(MODAL_SLOTS, "modal");
  return slot;
}

const headOf = (element: NounElement | undefined) => (element ? nounConjuncts(element)[0]?.concept : undefined);

/** The concept a span name stands for in `plan` — which a rendered word is only good for. */
export function conceptAt(plan: PhrasePlan, spanSlot: string): string | undefined {
  const [name, index] = spanSlot.split(".");
  const vp = plan.verbPhrase;
  if (name === "subject") return headOf(plan.subject);
  if (name === "verb") return vp?.verb;
  if (name === "modifier") return [vp?.modifier, ...(vp?.modifiers ?? [])].filter(Boolean)[Number(index)];
  if (name === "modal") {
    const modal = vp?.modals?.[Number(index)];
    return typeof modal === "string" ? modal : modal?.verb;
  }
  if (name === "directObject") return headOf(plan.directObject);
  if (name === "address") return headOf(plan.address);
  if (name === "interjection") return plan.interjection;
  return headOf(plan.complements?.[name as keyof NonNullable<PhrasePlan["complements"]>]?.phrase);
}

/** Each span name's words in `translation`, a split word joined by " … " ("fügt … hinzu"). */
export function wordsOf(translation: Translation | undefined): Map<string, string> {
  const words = new Map<string, string[]>();
  for (const span of translation?.spans ?? []) {
    const list = words.get(span.slot) ?? [];
    list.push(translation!.text.slice(span.start, span.end));
    words.set(span.slot, list);
  }
  return new Map([...words].map(([slot, list]) => [slot, list.join(" … ")]));
}

/**
 * The Phrase view's words as the period says them in the UI language (P17-E2): "cats", not "cat"
 * and a plural chip. One `/api/translate` asking for that language's spans, per plan. While a new
 * render is in flight the last one stands, but only for a row whose word is still the same concept —
 * a changed number keeps "cat" until "cats" arrives, a changed word (or UI language) falls back to its
 * lemma at once.
 * A row with no span (a dropped pronoun, a word a language could not place) is undefined: the row
 * shows its lemma.
 */
export function useRoleWords(partial: Partial<PhrasePlan> | undefined, selection: PhraseSelection): RoleWord {
  const { uiLanguage } = useUiLanguage();
  // A period is said once its subject has a head (see useTranslations); before that there is no plan.
  const plan = partial?.subject && headOf(partial.subject) ? (partial as PhrasePlan) : undefined;
  const { data } = useQuery({
    queryKey: ["role-words", uiLanguage, plan],
    queryFn: async () => ({
      plan: plan!,
      language: uiLanguage,
      translation: (await fetchTranslation(plan!, undefined, [uiLanguage])).find((t) => t.language === uiLanguage),
    }),
    enabled: Boolean(plan),
    staleTime: 1000 * 60,
    placeholderData: keepPreviousData,
  });
  const words = wordsOf(data?.translation);
  return (slot) => {
    if (!plan || !data || data.language !== uiLanguage) return undefined;
    const name = spanSlotOf(slot, selection);
    const concept = conceptAt(plan, name);
    return concept && conceptAt(data.plan, name) === concept ? words.get(name) : undefined;
  };
}
