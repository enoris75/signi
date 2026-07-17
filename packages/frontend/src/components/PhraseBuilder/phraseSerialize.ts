import type {
  Concept,
  SavedPhrase,
  SavedPhraseKind,
  SerializedContainer,
  SerializedSelection,
  SerializedWorkspace,
} from "@signi/shared";
import { COMPLEMENT_TYPES, SAVED_PHRASE_FORMAT, SAVED_PHRASE_VERSION } from "@signi/shared";
import type {
  AbstractionLevel,
  CoordConjunction,
  NounAddress,
  NounKey,
  PhraseContainer,
  PhraseLink,
  PhraseSelection,
} from "./interfaces.ts";
import { MODAL_ADVERB_SLOTS, MODAL_SLOTS } from "./slots.ts";

// ── Selection ⇄ serialized selection ────────────────────────────────────────
// A PhraseSelection embeds whole Concept objects (DB-derived) and nests further
// selections under its `*Possessor` slots. To persist it we replace every Concept
// with its `id` and keep scalars (number/gender/tense/definiteness/…) verbatim, so a
// save is a compact reference tree that survives lexicon edits. Both directions share
// the same key predicates below, which guarantees a lossless round-trip.

// Concept-valued slots whose exact key isn't suffix-derived. Every complement head is one,
// so they come off COMPLEMENT_TYPES rather than a hand-kept list that drifts as new
// complements land.
const CONCEPT_BASE_KEYS = new Set<string>([
  "subject",
  "verb",
  "directObject",
  "modifier",
  ...MODAL_SLOTS,
  ...MODAL_ADVERB_SLOTS,
  ...COMPLEMENT_TYPES,
]);

// Phrases saved before the recipient became the `terminus` complement carry `indirectObject`
// keys (`indirectObjectAdjective2`, `indirectObjectPossessor`, the noun address of a relative
// link, …). They mean exactly what the `terminus` ones mean now, so a load renames them and
// nothing downstream ever sees the old name.
const LEGACY_INDIRECT = "indirectObject";
const migrateKey = (key: string): string =>
  key.startsWith(LEGACY_INDIRECT) ? `terminus${key.slice(LEGACY_INDIRECT.length)}` : key;

// The same rename inside a slot-keyed map (`modifierRelations`, `adjectiveDegrees`, …).
const migrateKeys = <T,>(map: Record<string, T>): Record<string, T> =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [migrateKey(k), v]));

// A slot that holds a single Concept (encoded to its id). Covers the base slots plus
// every chained adjective slot (`subjectAdjective`, `routeAdjective2`, …).
const isConceptKey = (k: string): boolean =>
  CONCEPT_BASE_KEYS.has(k) || /Adjective\d?$/.test(k);

// A slot that holds a nested PhraseSelection (the genitive possessor blocks).
const isPossessorKey = (k: string): boolean => k.endsWith("Possessor");

// A slot that holds an *array* of nested PhraseSelections — the coordinated conjuncts of a noun
// block. Each element is a selection like any other (its head is its `subject`), so it round-trips
// through the same two functions. A phrase saved before coordination existed simply has no such
// key, and loads unchanged.
const isConjunctsKey = (k: string): boolean => k.endsWith("Conjuncts");

// Selection fields that are maps *keyed by slot key* — their keys need the legacy rename too.
const SLOT_KEYED_MAPS = new Set<string>([
  "modifierRelations",
  "modifierNumbers",
  "adjectiveDegrees",
]);

function serializeSelection(selection: PhraseSelection): SerializedSelection {
  const out: SerializedSelection = {};
  for (const [key, value] of Object.entries(selection)) {
    if (value == null) continue;
    if (isPossessorKey(key)) {
      out[key] = serializeSelection(value as PhraseSelection);
    } else if (isConjunctsKey(key)) {
      out[key] = (value as PhraseSelection[]).map(serializeSelection);
    } else if (isConceptKey(key)) {
      out[key] = (value as Concept).id;
    } else if (key === "modifierAdjectives") {
      // A map of slot key → Concept (an adjective on a noun-modifier); encode each to its id.
      out[key] = Object.fromEntries(
        Object.entries(value as Record<string, Concept>).map(([k, c]) => [k, c.id]),
      );
    } else {
      // Scalars (number/gender/definiteness/tense/negative/specifier) and the string-valued
      // `modifierRelations` / `modifierNumbers` maps carry through untouched.
      out[key] = value;
    }
  }
  return out;
}

function hydrateSelection(
  selection: SerializedSelection,
  byId: Map<string, Concept>,
  missing: Set<string>,
): PhraseSelection {
  const out: Record<string, unknown> = {};
  for (const [savedKey, value] of Object.entries(selection)) {
    if (value == null) continue;
    const key = migrateKey(savedKey);
    if (isPossessorKey(key) && typeof value === "object") {
      out[key] = hydrateSelection(value as SerializedSelection, byId, missing);
    } else if (isConjunctsKey(key) && Array.isArray(value)) {
      out[key] = (value as SerializedSelection[]).map((c) => hydrateSelection(c, byId, missing));
    } else if (isConceptKey(key) && typeof value === "string") {
      const concept = byId.get(value);
      if (concept) out[key] = concept;
      else missing.add(value); // referenced concept no longer in the catalog
    } else if (key === "modifierAdjectives" && typeof value === "object") {
      // Rehydrate the slot key → id map back to Concepts, dropping (and reporting) any id
      // no longer in the catalog.
      const resolved: Record<string, Concept> = {};
      for (const [k, id] of Object.entries(value as Record<string, string>)) {
        const concept = byId.get(id);
        if (concept) resolved[migrateKey(k)] = concept;
        else missing.add(id);
      }
      out[key] = resolved;
    } else if (SLOT_KEYED_MAPS.has(key) && typeof value === "object") {
      out[key] = migrateKeys(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out as PhraseSelection;
}

// ── Workspace ⇄ SavedPhrase document ────────────────────────────────────────

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
      ...(l.kind === "coordinative" ? { conjunction: l.conjunction } : {}),
      ...(l.kind === "instrumental" ? { level: l.level } : {}),
    })),
  };
}

export interface HydratedWorkspace {
  containers: PhraseContainer[];
  links: PhraseLink[];
  /** Concept ids referenced by the save but absent from the current catalog. */
  missing: string[];
}

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

/** Wrap a whole workspace as a versioned `phrase` document (the export-file / DB body). */
export function toSavedPhrase(
  name: string,
  containers: PhraseContainer[],
  links: PhraseLink[],
): SavedPhrase {
  return {
    format: SAVED_PHRASE_FORMAT,
    version: SAVED_PHRASE_VERSION,
    kind: "phrase",
    savedAt: new Date().toISOString(),
    name,
    workspace: serializeWorkspace(containers, links),
  };
}

/**
 * Serialize a single clause (one container) as a `period` workspace — one container, no
 * cross-container links. Nested possessors travel inside the selection; subordinate clauses
 * (which live in *other* containers) are deliberately not included.
 */
export function serializePeriod(container: PhraseContainer): SerializedWorkspace {
  return serializeWorkspace([container], []);
}

/**
 * Parse and validate an imported JSON document, returning its workspace. Throws a
 * user-readable Error if the file isn't a saved phrase or is from a newer schema
 * version this build can't read.
 */
export function parseSavedPhrase(raw: unknown): SavedPhrase {
  if (!raw || typeof raw !== "object") throw new Error("Not a valid phrase file.");
  const doc = raw as Partial<SavedPhrase>;
  if (doc.format !== SAVED_PHRASE_FORMAT) {
    throw new Error("This file is not a Signi phrase file.");
  }
  if (typeof doc.version !== "number") throw new Error("Phrase file is missing a version.");
  if (doc.version > SAVED_PHRASE_VERSION) {
    throw new Error(
      `This phrase was saved by a newer version of Signi (v${doc.version}); please update.`,
    );
  }
  if (!doc.workspace || !Array.isArray(doc.workspace.containers)) {
    throw new Error("Phrase file has no workspace data.");
  }
  // `kind` was added after v1 files first shipped; treat a missing value as a full phrase.
  const kind: SavedPhraseKind = doc.kind === "period" ? "period" : "phrase";
  return { ...(doc as SavedPhrase), kind };
}

// ── File export / import ─────────────────────────────────────────────────────

const slugify = (name: string): string =>
  name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "phrase";

/** Trigger a browser download of a SavedPhrase as a pretty-printed `.json` file. */
export function downloadSavedPhrase(doc: SavedPhrase): void {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slugify(doc.name ?? "phrase")}.signi.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Read and validate a user-picked file as a SavedPhrase (throws on bad content). */
export async function readSavedPhraseFile(file: File): Promise<SavedPhrase> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  return parseSavedPhrase(parsed);
}
