import type { Concept, SerializedWorkspace } from "@signi/shared";
import { ABSTRACTION_LEVELS, COORD_CONJUNCTIONS, SAVED_PHRASE_VERSION } from "@signi/shared";
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
import { isRecord } from "./isRecord.ts";
import { isSavedLink } from "./isSavedLink.ts";
import { migrateKey } from "./migrateKey.ts";
import { migrateModalPolarity } from "./migrateModalPolarity.ts";

// Restore a saved workspace against the catalog. Like each selection, the workspace around them
// may have been damaged: a period with no id and a link without both endpoints are dropped, a
// period with no selection loads empty, and a link's unreadable address, level or conjunction falls
// back on its default.
//
// `version` is the schema the workspace was written at, which decides the value migrations a load
// still owes it (see `migrateModalPolarity`). A workspace with no version of its own is one this
// build just wrote, so it defaults to the current schema and is migrated no further.
export function hydrateWorkspace(
  workspace: SerializedWorkspace,
  concepts: Concept[],
  version: number = SAVED_PHRASE_VERSION,
): HydratedWorkspace {
  const byId = new Map(concepts.map((c) => [c.id, c]));
  const missing = new Set<string>();
  const saved = (list: unknown): unknown[] => (Array.isArray(list) ? list : []);
  const containers = saved(workspace.containers)
    .filter((c): c is Record<string, unknown> & { id: string } => isRecord(c) && typeof c.id === "string")
    .map(
      (c): PhraseContainer => ({
        id: c.id,
        selection: hydrateSelection(
          version < 8 ? migrateModalPolarity(isRecord(c.selection) ? c.selection : {}) : (isRecord(c.selection) ? c.selection : {}),
          byId,
          missing,
        ),
      }),
    );
  const nounKey = (key: unknown): string => migrateKey(typeof key === "string" ? key : "subject");
  const links: PhraseLink[] = saved(workspace.links).filter(isSavedLink).map((l) =>
    l.kind === "instrumental"
      ? {
          id: l.id,
          kind: "instrumental" as const,
          // A missing or unknown level is the plain "with a thing" the link starts at.
          level: ABSTRACTION_LEVELS.includes(l.level as AbstractionLevel) ? (l.level as AbstractionLevel) : "object",
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
          // Default a missing or unknown conjunction to copulative "and" (always written on save).
          conjunction: COORD_CONJUNCTIONS.includes(l.conjunction as CoordConjunction)
            ? (l.conjunction as CoordConjunction)
            : "and",
          source: { containerId: l.source.containerId },
          target: { containerId: l.target.containerId },
        }
      : {
          id: l.id,
          // Serialized noun keys are plain strings; restore their branded types (renaming a
          // legacy `indirectObject` endpoint like any other saved key). A missing kind is a
          // legacy relative link, which always carries noun keys.
          source: { containerId: l.source.containerId, nounKey: nounKey(l.source.nounKey) as NounAddress },
          target: { containerId: l.target.containerId, nounKey: nounKey(l.target.nounKey) as NounKey },
        },
  );
  return { containers, links, missing: [...missing] };
}
