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
  NounAddress,
  NounKey,
  PhraseContainer,
  PhraseLink,
  PhraseSelection,
} from "./interfaces.ts";
import { MODAL_SLOTS } from "./slots.ts";

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
  "indirectObject",
  "modifier",
  ...MODAL_SLOTS,
  ...COMPLEMENT_TYPES,
]);

// A slot that holds a single Concept (encoded to its id). Covers the base slots plus
// every chained adjective slot (`subjectAdjective`, `routeAdjective2`, …).
const isConceptKey = (k: string): boolean =>
  CONCEPT_BASE_KEYS.has(k) || /Adjective\d?$/.test(k);

// A slot that holds a nested PhraseSelection (the genitive possessor blocks).
const isPossessorKey = (k: string): boolean => k.endsWith("Possessor");

function serializeSelection(selection: PhraseSelection): SerializedSelection {
  const out: SerializedSelection = {};
  for (const [key, value] of Object.entries(selection)) {
    if (value == null) continue;
    if (isPossessorKey(key)) {
      out[key] = serializeSelection(value as PhraseSelection);
    } else if (isConceptKey(key)) {
      out[key] = (value as Concept).id;
    } else {
      // Scalars (number/gender/definiteness/tense/negative/specifier) and the
      // `modifierRelations` map carry through untouched.
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
  for (const [key, value] of Object.entries(selection)) {
    if (value == null) continue;
    if (isPossessorKey(key) && typeof value === "object") {
      out[key] = hydrateSelection(value as SerializedSelection, byId, missing);
    } else if (isConceptKey(key) && typeof value === "string") {
      const concept = byId.get(value);
      if (concept) out[key] = concept;
      else missing.add(value); // referenced concept no longer in the catalog
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
    // Links are already plain reference data (ids + noun addresses); copy as-is.
    links: links.map((l) => ({ id: l.id, source: { ...l.source }, target: { ...l.target } })),
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
  const links: PhraseLink[] = workspace.links.map((l) => ({
    id: l.id,
    // Serialized noun keys are plain strings; restore their branded types.
    source: { containerId: l.source.containerId, nounKey: l.source.nounKey as NounAddress },
    target: { containerId: l.target.containerId, nounKey: l.target.nounKey as NounKey },
  }));
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
