import type { Concept, ModalVerb, VerbPhrase } from "@signi/shared";
import type { PhraseSelection } from "../../interfaces.ts";
import { ADVERB_SLOTS, modalAdverbFor, modalNegativeFor, MODAL_SLOTS } from "../../slots.ts";
import { field } from "./field.ts";
import { canBeHumble } from "../../functions/questionGates.ts";

// A verbless period (a bare noun phrase like "breaking news") has no verb phrase — return
// undefined so the plan omits it and the engines render just the subject.
export function buildVerbPhrase(sel: PhraseSelection): VerbPhrase | undefined {
  if (!sel.verb) return undefined;
  // The modal chain, outermost first. Filtering (rather than stopping at the first empty
  // slot) keeps a chain with a hole in it meaningful: whatever modals are set still apply. Each
  // modal carries its own adverb and its own negation (paired slot / field) when they are set —
  // "never wanted to always go", "do not want to not go".
  const modals = MODAL_SLOTS.map((key): ModalVerb | undefined => {
    const verb = field<Concept>(sel, key)?.id;
    if (!verb) return undefined;
    const adverbKey = modalAdverbFor(key);
    const modifier = adverbKey ? field<Concept>(sel, adverbKey)?.id : undefined;
    const negativeKey = modalNegativeFor(key);
    const negative = negativeKey ? Boolean(sel[negativeKey]) : false;
    return {
      verb,
      ...(modifier ? { modifier } : {}),
      ...(negative ? { negative } : {}),
    };
  }).filter((m): m is ModalVerb => Boolean(m));
  const modifiers = ADVERB_SLOTS.slice(1)
    .map((key) => field<Concept>(sel, key)?.id)
    .filter((id): id is string => Boolean(id));
  return {
    verb: sel.verb.id,
    // The MAIN VERB's own negation — under a modal this is "to not go", and each modal's own
    // denial rides its `ModalVerb` above (see `VerbPhrase.negative`).
    negative: sel.verbNegative,
    tense: sel.verbTense,
    aspect: sel.verbAspect,
    voice: sel.verbVoice,
    modifier: sel.modifier?.id,
    // The further adverbs of the chain (P15); a hole in it is skipped, as the modals' is.
    ...(modifiers.length > 0 && { modifiers }),
    ...(modals.length > 0 && { modals }),
    // The humble register reaches the plan only where the engine lowers the verb (P11-E6, see
    // canBeHumble): a flag left on a subject or a verb that no longer takes it stays in the selection.
    ...(sel.verbHumble && canBeHumble(sel) && { humble: true }),
  };
}
