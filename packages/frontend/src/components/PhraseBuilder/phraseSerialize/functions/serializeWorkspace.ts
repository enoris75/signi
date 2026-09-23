import type { SerializedContainer, SerializedWorkspace } from "@signi/shared";
import type { PhraseContainer, PhraseLink } from "../../interfaces.ts";
import { serializeSelection } from "./serializeSelection.ts";

export function serializeWorkspace(
  containers: PhraseContainer[],
  links: PhraseLink[],
): SerializedWorkspace {
  return {
    containers: containers.map(
      (c): SerializedContainer => ({ id: c.id, selection: serializeSelection(c.selection) }),
    ),
    // Links are already plain reference data (ids + kind + noun addresses); copy as-is. A
    // conditional link carries its `kind` and no noun keys; a coordinative link additionally
    // carries its `conjunction`; a relative link omits `kind`.
    links: links.map((l) => ({
      id: l.id,
      kind: l.kind,
      source: { ...l.source },
      target: { ...l.target },
      ...(l.kind === "coordinative" || l.kind === "adverbial" ? { conjunction: l.conjunction } : {}),
      ...(l.kind === "instrumental" ? { level: l.level } : {}),
      ...(l.kind === "instrumental" && l.negative ? { negative: true } : {}),
    })),
  };
}
