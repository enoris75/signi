import type { Concept, PickerRole } from "@signi/shared";
import type {
  ConceptSelectOpts,
  NounAddress,
  NounKey,
  SlotKey,
} from "../model/interfaces.ts";
import { COMPLEMENT_KEY_SET } from "../model/slots.ts";
import { coded, type Coded } from "./diagnostics.ts";
import type { Vocabulary } from "./types.ts";

/**
 * Words and references: from the text a line holds to the concepts and nouns it means, and back.
 *
 * A word is matched in the interface language, the way the pickers match it, among the words of the
 * role it fills (`/obj` looks among nouns and pronouns, `/adj` among adjectives and nouns). A concept
 * id works everywhere (`/subj CAT`). When one label names two concepts of the role, the word is
 * ambiguous and must be given by its id — which is also how the printer writes it, so what it prints
 * always reads back as the same concept.
 */

/** Which words a slot takes: the roles searched, in order, and which verbs. */
export interface WordSpec {
  roles: PickerRole[];
  /** Verbs only: the modal verbs (`/modal`) or every other one (`/verb`). */
  modal?: boolean;
}

/**
 * The words a slot takes — the categories its box's picker offers (see slotCategories), first the
 * one it falls back on. A noun phrase in brackets is a possessor's (a noun head) or a conjunct's (a
 * noun or a pronoun: "you and I").
 */
export function wordSpecFor(slot: SlotKey, frame: "period" | "possessor" | "standard" | "conjunct" = "period"): WordSpec {
  if (slot === "subject") return frame === "possessor" ? { roles: ["noun"] } : { roles: ["noun", "pronoun"] };
  if (slot === "verb") return { roles: ["verb"], modal: false };
  if (slot === "verbModal" || slot === "verbModal2") return { roles: ["verb"], modal: true };
  if (slot === "modifier" || /^verbModal2?Adverb$/.test(slot)) return { roles: ["adverb"] };
  if (slot === "directObject" || slot === "cause" || slot === "purpose" || slot === "topic")
    return { roles: ["noun", "pronoun"] };
  if (slot === "predicative") return { roles: ["noun", "adjective"] };
  if (/Adjective\d?$/.test(slot)) return { roles: ["adjective", "noun"] };
  if (COMPLEMENT_KEY_SET.has(slot)) return { roles: ["noun"] };
  return { roles: ["noun"] };
}

/** The words of a spec, in the order its picker lists them. */
export function wordsFor(spec: WordSpec, vocab: Vocabulary): Concept[] {
  return spec.roles.flatMap((role) =>
    (vocab.concepts[role] ?? []).filter(
      (c) => role !== "verb" || spec.modal === undefined || Boolean(c.modal) === spec.modal,
    ),
  );
}

// ── Pronouns ─────────────────────────────────────────────────────────────────

/**
 * A pronoun is a person, not a word, so it is named by its person — `1st`, `2nd`, `3rd`, or `one` —
 * with `/pl` and `/fem` as for any noun. The English pronouns are accepted too, and carry their own
 * number and gender ("she" is the 3rd person, feminine).
 */
export const PRONOUN_IDS = {
  "1": "FIRST_PERSON",
  "2": "SECOND_PERSON",
  "3": "THIRD_PERSON",
  generic: "GENERIC_PERSON",
} as const;

export const PRONOUN_NAMES: Record<string, string> = {
  FIRST_PERSON: "1st",
  SECOND_PERSON: "2nd",
  THIRD_PERSON: "3rd",
  GENERIC_PERSON: "one",
};

interface PronounForm {
  id: string;
  number?: "singular" | "plural";
  gender?: "masc" | "fem" | "neut";
}

export const PRONOUN_FORMS: Record<string, PronounForm> = {
  "1st": { id: "FIRST_PERSON" },
  first: { id: "FIRST_PERSON" },
  "2nd": { id: "SECOND_PERSON" },
  second: { id: "SECOND_PERSON" },
  "3rd": { id: "THIRD_PERSON" },
  third: { id: "THIRD_PERSON" },
  one: { id: "GENERIC_PERSON" },
  i: { id: "FIRST_PERSON", number: "singular" },
  me: { id: "FIRST_PERSON", number: "singular" },
  we: { id: "FIRST_PERSON", number: "plural" },
  us: { id: "FIRST_PERSON", number: "plural" },
  you: { id: "SECOND_PERSON", number: "singular" },
  he: { id: "THIRD_PERSON", number: "singular", gender: "masc" },
  him: { id: "THIRD_PERSON", number: "singular", gender: "masc" },
  she: { id: "THIRD_PERSON", number: "singular", gender: "fem" },
  her: { id: "THIRD_PERSON", number: "singular", gender: "fem" },
  it: { id: "THIRD_PERSON", number: "singular", gender: "neut" },
  they: { id: "THIRD_PERSON", number: "plural" },
  them: { id: "THIRD_PERSON", number: "plural" },
};

// ── Words ────────────────────────────────────────────────────────────────────

export type WordResolution =
  | { ok: true; concept: Concept; opts?: ConceptSelectOpts }
  | { ok: false; reason: "unknown" | "ambiguous"; candidates: Concept[] };

const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

/**
 * The concept a word names among the words `spec` takes. Tried in order: a pronoun's person or form,
 * the concept's id as written, the word as the interface language shows it, the id in any case, the
 * English word, the kana reading, the gloss, and last an alias in the interface language or English
 * (P09-E23) — last, so an alias never outranks a concept whose label is the word. The first rule that
 * names exactly one concept wins; one that names several is ambiguous.
 */
export function resolveWord(text: string, spec: WordSpec, vocab: Vocabulary): WordResolution {
  const q = norm(text);
  const words = wordsFor(spec, vocab);
  if (spec.roles.includes("pronoun")) {
    const form = PRONOUN_FORMS[q];
    const concept = form && words.find((c) => c.id === form.id);
    if (form && concept) {
      const opts: ConceptSelectOpts = {};
      if (form.number) opts.number = form.number;
      if (form.gender) opts.gender = form.gender;
      return { ok: true, concept, opts: Object.keys(opts).length ? opts : undefined };
    }
  }
  const exact = text.trim();
  const rules: ((c: Concept) => boolean)[] = [
    // An id as the printer writes it — upper case — names exactly its concept, even where a label
    // reads the same ("CRY" beside the two verbs labelled "cry").
    (c) => c.id === exact,
    (c) => c.role !== "pronoun" && norm(vocab.label(c)) === q,
    (c) => c.id.toLowerCase() === q,
    (c) => c.role !== "pronoun" && norm(c.label ?? "") === q,
    (c) => norm(c.readings?.[vocab.language] ?? "") === q,
    (c) => norm(c.synonym ?? "") === q,
    (c) => [...(c.aliases?.[vocab.language] ?? []), ...(c.aliases?.en ?? [])].some((a) => norm(a) === q),
  ];
  for (const rule of rules) {
    const hits = words.filter(rule);
    if (hits.length === 1) return { ok: true, concept: hits[0]! };
    if (hits.length > 1) return { ok: false, reason: "ambiguous", candidates: hits };
  }
  return { ok: false, reason: "unknown", candidates: [] };
}

/** Characters a word must not hold to be written bare: they would start a command, a reference or a bracket. */
const UNSAFE = /[/#()・／]/;

/**
 * How a concept is written in a line: its word in the interface language when that word reads back
 * as the same concept, else its id. A pronoun is written as its person.
 */
export function printWord(concept: Concept, spec: WordSpec, vocab: Vocabulary): string {
  if (concept.role === "pronoun") return PRONOUN_NAMES[concept.id] ?? concept.id;
  const label = vocab.label(concept).trim();
  if (label && !UNSAFE.test(label)) {
    const back = resolveWord(label, spec, vocab);
    if (back.ok && back.concept.id === concept.id) return label;
  }
  return concept.id;
}

// ── References ───────────────────────────────────────────────────────────────

/** The short names a reference gives a period's nouns: `#2.obj`. */
export const NOUN_NAMES: Record<NounKey, string> = {
  subject: "subj",
  directObject: "obj",
  predicative: "pred",
  terminus: "term",
  manner: "manner",
  locative: "loc",
  direction: "dir",
  source: "src",
  route: "route",
  temporal: "time",
  purpose: "for",
  topic: "about",
  cause: "cause",
};

const NOUN_BY_NAME: Record<string, NounKey> = Object.fromEntries(
  Object.entries(NOUN_NAMES).flatMap(([key, name]) => [
    [name, key as NounKey],
    [key.toLowerCase(), key as NounKey],
  ]),
);

/** A reference, read: a period, and optionally a noun in it. */
export interface Ref {
  /** 1-based, as the console numbers periods. */
  period: number;
  address?: NounAddress;
}

/**
 * Read a reference's text (what follows the `#`): `2`, `2.obj`, `1.subj.poss`, `1.subj.and2` — the
 * second noun of the subject's group, the first of its conjuncts.
 */
export function parseRef(text: string): Ref | { error: Coded } {
  const [head, ...steps] = text.split(".");
  if (!head || !/^\d+$/.test(head)) return { error: coded("referenceStartsWithNumber") };
  const period = Number(head);
  if (period < 1) return { error: coded("periodsFromOne") };
  if (steps.length === 0) return { period };
  const noun = NOUN_BY_NAME[steps[0]!];
  if (!noun) return { error: coded("notANoun", { step: steps[0]! }) };
  let address: NounAddress = noun;
  for (const step of steps.slice(1)) {
    if (step === "poss") address = `${address}/possessor`;
    else if (step === "than") address = `${address}/standard`;
    else if (/^and\d+$/.test(step) && Number(step.slice(3)) >= 2)
      address = `${address}/conjunct/${Number(step.slice(3)) - 2}`;
    else return { error: coded("notAStep", { step }) };
  }
  return { period, address };
}

/** Write a reference: the period's number, and the noun's address in short names. */
export function printRef(period: number, address?: NounAddress): string {
  if (!address) return `#${period}`;
  const [base, ...steps] = address.split("/");
  const parts = [NOUN_NAMES[base as NounKey] ?? base];
  for (let i = 0; i < steps.length; i++) {
    if (steps[i] === "possessor") parts.push("poss");
    else if (steps[i] === "standard") parts.push("than");
    else if (steps[i] === "conjunct") parts.push(`and${Number(steps[++i]) + 2}`);
  }
  return `#${period}.${parts.join(".")}`;
}
