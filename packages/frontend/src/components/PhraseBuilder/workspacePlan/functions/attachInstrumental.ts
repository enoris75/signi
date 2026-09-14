import type { PhrasePlan } from "@signi/shared";
import { isActionLevel } from "@signi/shared";
import { isInstrumentalLink, type PhraseContainer, type PhraseLink } from "../../interfaces.ts";
import { selectionToPlan } from "../../selectionToPlan/index.ts";
import { attachLinks } from "./attachLinks.ts";

// Attach the instrument sourced from `container` onto `plan` as its `instrumental` complement.
// The linked container is serialised like any other, and what is taken from it depends on the
// link's reification degree (see AbstractionLevel):
//
//  · object  — the period is a bare noun phrase, and its subject *is* the instrument:
//              "start **with a word**".
//  · process
//    concept — the period is a verb and the noun it acts on, with no subject of its own (the
//              clause above supplies it): its verb becomes the complement's `action` and its
//              direct object the noun the act is done to — "start **by choosing a word**" /
//              "**with the choosing of a word**". The level rides along as a specifier so
//              each engine can pick its own non-finite form.
//
// Either way the instrument keeps its own relative links ("with the word that I chose"). A period
// that hasn't got what its level needs yet contributes nothing rather than half a complement — so
// an action level with no verb, or with no object for it, simply doesn't render.
export function attachInstrumental(
  plan: Partial<PhrasePlan>,
  container: PhraseContainer,
  links: PhraseLink[],
  byId: Map<string, PhraseContainer>,
  seen: Set<string>,
): void {
  const link = links.find(
    (l) => isInstrumentalLink(l) && l.source.containerId === container.id,
  );
  if (!link || !isInstrumentalLink(link)) return;
  const instrument = byId.get(link.target.containerId);
  if (!instrument || seen.has(instrument.id)) return;
  const instrumentPlan = selectionToPlan(instrument.selection);
  attachLinks(instrumentPlan, instrument, links, byId, new Set([...seen, instrument.id]));

  const level = link.level ?? "object";
  const complement = isActionLevel(level)
    ? instrumentPlan.verbPhrase && instrumentPlan.directObject
      ? {
          phrase: instrumentPlan.directObject,
          action: instrumentPlan.verbPhrase,
          specifiers: [{ kind: "abstraction" as const, value: level }],
        }
      : undefined
    : instrumentPlan.subject
      ? { phrase: instrumentPlan.subject }
      : undefined;
  if (!complement) return;
  plan.complements = { ...plan.complements, instrumental: complement };
}
