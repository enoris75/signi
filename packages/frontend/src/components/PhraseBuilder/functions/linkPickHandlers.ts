import type { NounAddress, NounKey, WorkspaceBinding } from "../interfaces.ts";
import { NOUN_KEYS } from "../slots.ts";
import type { CorefPick } from "../CorefPickContext.tsx";
import type { PhraseRenderContext } from "../phraseRender.tsx";

/**
 * How a builder's noun boxes take part in linking. Cross-container linking forwards noun boxes to
 * the workspace registry and exposes greying (link targets) + pick-mode (eligible targets); a
 * standalone period, with no `linkBinding`, gets none of that. Only NOUN_KEYS participate.
 *
 * A noun box lights up as a pick target for either an in-progress relative-clause link
 * (cross-container) or a pronominal-possessor coref pick (same period). The coref pick takes
 * precedence while active, since the two never run at once.
 */
export function linkPickHandlers({
  coref,
  linkBinding,
  nounAddress,
}: {
  coref: Pick<CorefPick, "picking" | "isEligible" | "pick">;
  linkBinding: WorkspaceBinding | undefined;
  // A local noun key's address in the period (see builderNounAddress).
  nounAddress: (key: NounKey) => NounAddress;
}): Pick<PhraseRenderContext, "onBoxRef" | "dimmedKeys" | "isPickTarget" | "onPickTarget" | "registerVerbAnchor"> {
  const isNoun = (key: string): key is NounKey => NOUN_KEYS.includes(key as NounKey);
  return {
    onBoxRef: linkBinding
      ? (key, el) => {
          if (isNoun(key)) linkBinding.geometry.registerBox(key, el);
        }
      : undefined,
    dimmedKeys: linkBinding ? (linkBinding.relative.targetKeys as Set<string>) : undefined,
    isPickTarget: (key) => {
      if (!isNoun(key)) return false;
      if (coref.picking) return coref.isEligible(nounAddress(key));
      return Boolean(linkBinding?.relative.isPickTarget(key));
    },
    onPickTarget: (key) => {
      if (coref.picking && isNoun(key)) {
        coref.pick(nounAddress(key));
        return;
      }
      linkBinding?.relative.onPick(key as NounKey);
    },
    // The instrumental toggle on the verb phrase's dotted ring is where an instrumental link
    // starts, so the workspace measures its connector from there.
    registerVerbAnchor: linkBinding?.geometry.registerVerbAnchor,
  };
}
