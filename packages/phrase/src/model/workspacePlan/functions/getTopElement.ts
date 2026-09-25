import type { ComplementType, NounElement, PhrasePlan } from "@signi/shared";
import type { NounKey } from "../../interfaces.ts";
import { CORE_KEYS } from "../workspacePlan.consts.ts";

// Resolve the noun *element* filling a container plan's slot. Core roles (subject/objects) sit
// at the top level; complement nouns live under `complements[type].phrase`; the vocative is the
// plan's `address` (P11-E8), which only a root period's plan carries.
export function getTopElement(plan: Partial<PhrasePlan>, key: NounKey): NounElement | undefined {
  if (CORE_KEYS.has(key)) return plan[key as "subject" | "directObject"];
  if (key === "vocative") return plan.address;
  return plan.complements?.[key as ComplementType]?.phrase;
}
