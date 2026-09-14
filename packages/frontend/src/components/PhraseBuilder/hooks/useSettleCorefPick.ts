import { useEffect } from "react";
import type { CorefPick } from "../CorefPickContext.tsx";
import type { OwnerSpot } from "../ownerChain.ts";

// Naming an owner settles it: once its ring holds a word, the nouns lit up to point to instead go
// dark. Runs after every commit while `enabled` (off for a hosted ring's builder, whose owners the
// period's canvas holds).
export function useSettleCorefPick({
  enabled,
  coref,
  owners,
}: {
  enabled: boolean;
  coref: Pick<CorefPick, "picking" | "cancel">;
  owners: readonly Pick<OwnerSpot, "possessed" | "named">[];
}): void {
  useEffect(() => {
    if (!enabled || !coref.picking) return;
    if (owners.some((o) => o.possessed === coref.picking && o.named)) coref.cancel();
  });
}
