import { COMPLEMENT_TYPES } from "@signi/shared";
import type { NounKey } from "../interfaces.ts";

/** The noun slots that sit at the top level of a plan rather than under `complements`. */
export const CORE_KEYS = new Set<NounKey>(["subject", "directObject"]);

/** The noun slots that live under `complements[type].phrase`. */
export const COMPLEMENT_KEYS = new Set<string>(COMPLEMENT_TYPES);
