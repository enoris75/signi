import { LEGACY_INDIRECT } from "../phraseSerialize.consts.ts";

// Rename a legacy `indirectObject…` key to its `terminus…` equivalent; any other key is kept.
export const migrateKey = (key: string): string =>
  key.startsWith(LEGACY_INDIRECT) ? `terminus${key.slice(LEGACY_INDIRECT.length)}` : key;
