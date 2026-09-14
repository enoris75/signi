import { migrateKey } from "./migrateKey.ts";

// The same rename inside a slot-keyed map (`modifierRelations`, `adjectiveDegrees`, …).
export const migrateKeys = <T,>(map: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [migrateKey(k), v]));
