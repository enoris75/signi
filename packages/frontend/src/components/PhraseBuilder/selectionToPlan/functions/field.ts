import type { PhraseSelection } from "../../interfaces.ts";

// Read a dynamically-keyed field off a selection. The flat keys (`${which}Number`,
// `${which}Adjective`, …) all exist on PhraseSelection; the union index widens the
// value type, so callers pass the concrete field type as T.
export function field<T>(sel: PhraseSelection, key: string): T | undefined {
  return sel[key as keyof PhraseSelection] as T | undefined;
}
