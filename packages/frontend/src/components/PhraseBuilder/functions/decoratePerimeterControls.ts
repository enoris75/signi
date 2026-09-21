import type { Concept } from "@signi/shared";
import type { UiStringLookup } from "../../../i18n/conceptWord.ts";
import type { PossessivePhrase } from "../../../i18n/usePossessivePhrase.ts";
import type { NounAddress, NounKey, PhraseSelection } from "../interfaces.ts";
import { POSSESSOR_REF_KEY } from "../interfaces.ts";
import { NOUN_KEYS } from "../slots.ts";
import { openConjunctsFor } from "../conjunctChain.ts";
import { possessiveHintKey, type CorefPick } from "../CorefPickContext.tsx";
import type { PerimeterEntry } from "../satellites/index.ts";
import type { RingHost } from "../ringHost.ts";

type PerimeterByNoun = Partial<Record<NounKey, PerimeterEntry>>;

/**
 * Settle the controls on each noun's dotted ring (see buildSatelliteIcons) for where this builder's
 * nouns sit on the canvas. Hands back a new map; `perimeterByNoun` is left as it was.
 *
 *  · The control that extends a coordinated group rides the group's last ring: the head's while it
 *    stands alone, then the newest conjunct's — whose click adds to the head's group, not a group of
 *    its own. An owner's head coordinates nothing: the plan reads an owner as one noun phrase.
 *  · Each possessor control names or points to its noun's owner (`onTogglePossessor`). Pointing, it
 *    says what it points to: the antecedent's word in the UI language and the possessive that
 *    coreference will render. Both are known only at render time, so they sit outside the phrase
 *    and behind the control's own "Possessor" title — the C14 shape. An antecedent that no longer
 *    resolves leaves the bare indefinite noun (`hint.aNoun`) in the word's place.
 */
export function decoratePerimeterControls({
  perimeterByNoun,
  selection,
  ringHost,
  resolve,
  onTogglePossessor,
  t,
  word,
  possessivePhrase,
}: {
  perimeterByNoun: PerimeterByNoun;
  selection: PhraseSelection;
  // Set for a hosted ring's builder: whether it is a conjunct's, and the last of its group.
  ringHost: Pick<RingHost, "kind" | "isLast"> | undefined;
  // Resolves the noun a possessor points to (see CorefPickContext).
  resolve: CorefPick["resolve"];
  onTogglePossessor: (which: NounKey) => void;
  t: UiStringLookup;
  // The antecedent's word in the UI language (`useConceptLabel`), for the control that points at it.
  word: (concept: Concept) => string;
  // The possessed noun phrase the link will render (see `usePossessivePhrases`).
  possessivePhrase: PossessivePhrase;
}): PerimeterByNoun {
  const next: PerimeterByNoun = {};
  for (const which of Object.keys(perimeterByNoun) as NounKey[])
    next[which] = { ...perimeterByNoun[which] };

  for (const which of openConjunctsFor(selection)) delete next[which]?.conjunct;
  const extend = next.subject?.conjunct;
  if (ringHost && extend) {
    if (ringHost.kind === "conjunct" && ringHost.isLast)
      next.subject!.conjunct = { ...extend, isSet: true, valueLabel: t("action.addAnotherConjunct") };
    else delete next.subject!.conjunct;
  }

  for (const which of NOUN_KEYS) {
    const control = next[which]?.possessor;
    if (!control) continue;
    const antecedent = selection[POSSESSOR_REF_KEY(which)] as NounAddress | undefined;
    const resolved = antecedent ? resolve(antecedent) : undefined;
    // What the link will say, in quotes after the antecedent's own word: the whole possessed noun
    // phrase once the backend has rendered it ("his horse", "la sua casa"), and the bare possessive
    // until then — which is right in English, German and Japanese and only approximate in the
    // Romance languages, where it agrees with the noun possessed (C16).
    const says = resolved
      && (possessivePhrase((selection[which] as Concept | undefined)?.id, resolved.features)
        ?? t(possessiveHintKey(resolved.features)));
    next[which]!.possessor = {
      ...control,
      ...(antecedent && {
        active: false,
        valueLabel: `${resolved ? word(resolved.concept) : t("hint.aNoun")}${
          says ? ` (“${says}”)` : ""
        } — ${t("hint.clickToRemove")}`,
      }),
      onToggle: () => onTogglePossessor(which),
    };
  }
  return next;
}
