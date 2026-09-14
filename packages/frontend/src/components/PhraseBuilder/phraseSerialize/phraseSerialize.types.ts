import type { PhraseContainer, PhraseLink } from "../interfaces.ts";

export interface HydratedWorkspace {
  containers: PhraseContainer[];
  links: PhraseLink[];
  /** Concept ids referenced by the save but absent from the current catalog. */
  missing: string[];
}
