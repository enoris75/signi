import type { Concept, SerializedWorkspace } from "@signi/shared";
import type {
  AbstractionLevel,
  CoordConjunction,
  NounAddress,
  NounKey,
  PhraseContainer,
  PhraseLink,
} from "../../interfaces.ts";
import type { HydratedWorkspace } from "../phraseSerialize.types.ts";
import { hydrateSelection } from "./hydrateSelection.ts";
import { migrateKey } from "./migrateKey.ts";

export function hydrateWorkspace(
  workspace: SerializedWorkspace,
  concepts: Concept[],
): HydratedWorkspace {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const missing = new Set<string>();
  const containers = workspace.containers.map(
    (c): PhraseContainer => ({ id: c.id, selection: hydrateSelection(c.selection, byId, missing) }),
  );
  const links: PhraseLink[] = workspace.links.map((l) =>
    l.kind === "instrumental"
      ? {
          id: l.id,
          kind: "instrumental" as const,
          // A missing level is the plain "with a thing" the link starts at.
          level: (l.level ?? "object") as AbstractionLevel,
          source: { containerId: l.source.containerId },
          target: { containerId: l.target.containerId },
        }
      : l.kind === "conditional"
      ? {
          id: l.id,
          kind: "conditional" as const,
          source: { containerId: l.source.containerId },
          target: { containerId: l.target.containerId },
        }
      : l.kind === "coordinative"
      ? {
          id: l.id,
          kind: "coordinative" as const,
          // Default a missing conjunction to copulative "and" (defensive; always written on save).
          conjunction: (l.conjunction ?? "and") as CoordConjunction,
          source: { containerId: l.source.containerId },
          target: { containerId: l.target.containerId },
        }
      : {
          id: l.id,
          // Serialized noun keys are plain strings; restore their branded types (renaming a
          // legacy `indirectObject` endpoint like any other saved key). A missing kind is a
          // legacy relative link, which always carries noun keys.
          source: { containerId: l.source.containerId, nounKey: migrateKey(l.source.nounKey ?? "subject") as NounAddress },
          target: { containerId: l.target.containerId, nounKey: migrateKey(l.target.nounKey ?? "subject") as NounKey },
        },
  );
  return { containers, links, missing: [...missing] };
}
