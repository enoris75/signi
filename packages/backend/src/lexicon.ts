import type { LexicalEntry } from '@signi/shared';
import { getDb } from './db.js';

// ── Types ──────────────────────────────────────────────────────────────────

interface FormRow { form_key: string; form_value: string }

// ── Cache ──────────────────────────────────────────────────────────────────

const entryCache = new Map<string, LexicalEntry | null>();
const roleCache  = new Map<string, string | null>();

// ── Role lookup ────────────────────────────────────────────────────────────

function getConceptRole(conceptId: string): string | null {
  if (roleCache.has(conceptId)) return roleCache.get(conceptId) ?? null;
  const row = getDb()
    .prepare<[string], { role: string }>('SELECT role FROM semantic_concepts WHERE id = ?')
    .get(conceptId);
  const role = row?.role ?? null;
  roleCache.set(conceptId, role);
  return role;
}

// ── Per-type lookup helpers ────────────────────────────────────────────────

function formsFromRows(rows: FormRow[]): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [r.form_key, r.form_value]));
}

function lookupVerb(conceptId: string, language: string): LexicalEntry | undefined {
  const db = getDb();
  const lexeme = db.prepare<[string, string], { id: number; stative: number; transitivity: string | null }>(`
    SELECT vl.id, sc.stative, sc.transitivity FROM concept_verb_links cvl
    JOIN verb_lexemes vl ON vl.id = cvl.lexeme_id
    JOIN semantic_concepts sc ON sc.id = cvl.concept_id
    WHERE cvl.concept_id = ? AND vl.language = ? AND cvl.is_primary = 1
  `).get(conceptId, language);
  if (!lexeme) return undefined;

  const rows = db.prepare<[number], FormRow>(
    'SELECT form_key, form_value FROM verb_forms WHERE lexeme_id = ?'
  ).all(lexeme.id);

  const forms = formsFromRows(rows);
  // A verb naming a state that holds, not an event: its Romance past is the imperfect ("voleva",
  // A130), and Japanese says it with 〜ている ("持っています", A132). Concept-level.
  if (lexeme.stative) forms['stative'] = '1';
  // How many arguments the verb takes. Concept-level, like the two above, and exposed for the same
  // reason `role` and `animate` are: only a verb with a patient can be put in the passive, and the
  // translator has to decide that with nothing but the resolved forms in hand (A01).
  if (lexeme.transitivity) forms['transitivity'] = lexeme.transitivity;

  return { conceptId, language: language as LexicalEntry['language'], forms };
}

function lookupNoun(conceptId: string, language: string): LexicalEntry | undefined {
  const db = getDb();
  const lexeme = db.prepare<[string, string], { id: number; singular: string; plural: string | null; gender: string | null; animate: number; human: number; countable: number; proper: number; manner_relation: string | null; dimension_relation: string | null; alarm: number }>(`
    SELECT nl.id, nl.singular, nl.plural, nl.gender, sc.animate, sc.human, sc.countable, sc.proper, sc.manner_relation, sc.dimension_relation, sc.alarm FROM concept_noun_links cnl
    JOIN noun_lexemes nl ON nl.id = cnl.lexeme_id
    JOIN semantic_concepts sc ON sc.id = cnl.concept_id
    WHERE cnl.concept_id = ? AND nl.language = ? AND cnl.is_primary = 1
  `).get(conceptId, language);
  if (!lexeme) return undefined;

  const rows = db.prepare<[number], FormRow>(
    'SELECT form_key, form_value FROM noun_forms WHERE lexeme_id = ?'
  ).all(lexeme.id);

  const forms = formsFromRows(rows);
  // Synthesise typed columns back into the forms map for the engine
  forms['base']   = lexeme.singular;
  if (lexeme.plural) forms['plural'] = lexeme.plural;
  if (lexeme.gender) forms['gender'] = lexeme.gender;
  if (lexeme.animate) forms['animate'] = '1'; // concept-level animacy (affects motion-goal adposition)
  if (lexeme.human) forms['human'] = '1'; // concept-level personhood (English relativises "who" on this)
  if (!lexeme.countable) forms['uncountable'] = '1'; // mass noun — changes quantifier words / blocks pluralisation
  if (lexeme.proper) forms['proper'] = '1'; // proper noun — the language fixes the article, not the user
  // How this noun enters a manner adverbial (measure / means / mode); the engine maps it to the
  // adposition ("at the speed" vs "with care"). Concept-level, so it is the same in every language.
  if (lexeme.manner_relation) forms['mannerRelation'] = lexeme.manner_relation;
  // How this dimension noun enters an adjective-definition gloss (extent / quality / measure); the
  // engine maps it to the adposition ("of great size" vs "at a high temperature"). Concept-level.
  if (lexeme.dimension_relation) forms['dimensionRelation'] = lexeme.dimension_relation;
  // A danger one cries out a warning of (wolf, fire): a verb that raises an alarm (`alarm_cry` on its
  // lexeme) takes it as the cry's topic, "gridare al lupo", not as a plain object (A124). Concept-level.
  if (lexeme.alarm) forms['alarm'] = '1';

  // The concept's hypernym (its direct is-a). A continent goal keys its Romance adposition off
  // this: "ANTARCTICA isA CONTINENT" → "in Antartide" / "en Antarctique", not "all'Antartide".
  const hyper = db.prepare<[string], { concept_b_id: string }>(
    "SELECT concept_b_id FROM concept_relations WHERE concept_a_id = ? AND relation = 'hypernym'"
  ).get(conceptId);
  if (hyper) forms['isA'] = hyper.concept_b_id;
  // Whether the referent is an animal, read off the WHOLE is-a chain rather than the direct
  // hypernym above: CAT isA MAMMAL isA ANIMAL. German needs it to pick "fressen" over "essen" for an
  // animal subject (A157). The chain is the right rule and the flag-per-concept the wrong one —
  // `animate && !human` over-reaches (CREATOR and POSSESSOR are "someone or something"), and a
  // hand-set flag would drift the moment another animal is seeded under MAMMAL.
  if (isA(conceptId, ANIMAL_CONCEPT)) forms['animal'] = '1';

  return { conceptId, language: language as LexicalEntry['language'], forms };
}

/** The root of the animal subtree; every noun under it is an animal (see `isA`). */
const ANIMAL_CONCEPT = 'ANIMAL';

/**
 * Whether `conceptId` is `ancestor`, or sits under it anywhere in the hypernym chain. One recursive
 * query, so a deep chain costs the same as a shallow one.
 */
function isA(conceptId: string, ancestor: string): boolean {
  const row = getDb().prepare<[string, string], { found: number }>(`
    WITH RECURSIVE chain(id) AS (
      SELECT ?
      UNION
      SELECT cr.concept_b_id FROM concept_relations cr JOIN chain ON cr.concept_a_id = chain.id
        WHERE cr.relation = 'hypernym'
    )
    SELECT 1 AS found FROM chain WHERE id = ? LIMIT 1
  `).get(conceptId, ancestor);
  return !!row;
}

function lookupPronoun(conceptId: string, language: string): LexicalEntry | undefined {
  const db = getDb();
  const lexeme = db.prepare<[string, string], { id: number; person: string; number: string; gender: string | null }>(`
    SELECT pl.id, pl.person, pl.number, pl.gender FROM concept_pronoun_links cpl
    JOIN pronoun_lexemes pl ON pl.id = cpl.lexeme_id
    WHERE cpl.concept_id = ? AND pl.language = ? AND cpl.is_primary = 1
  `).get(conceptId, language);
  if (!lexeme) return undefined;

  const rows = db.prepare<[number], FormRow>(
    'SELECT form_key, form_value FROM pronoun_forms WHERE lexeme_id = ?'
  ).all(lexeme.id);

  const forms = formsFromRows(rows);
  forms['person'] = lexeme.person;
  forms['number'] = lexeme.number;
  if (lexeme.gender) forms['gender'] = lexeme.gender;

  return { conceptId, language: language as LexicalEntry['language'], forms };
}

function lookupAdjective(conceptId: string, language: string): LexicalEntry | undefined {
  const db = getDb();
  const lexeme = db.prepare<[string, string], { id: number; transient: number }>(`
    SELECT al.id, sc.transient FROM concept_adjective_links cal
    JOIN adjective_lexemes al ON al.id = cal.lexeme_id
    JOIN semantic_concepts sc ON sc.id = cal.concept_id
    WHERE cal.concept_id = ? AND al.language = ? AND cal.is_primary = 1
  `).get(conceptId, language);
  if (!lexeme) return undefined;

  const rows = db.prepare<[number], FormRow>(
    'SELECT form_key, form_value FROM adjective_forms WHERE lexeme_id = ?'
  ).all(lexeme.id);

  const forms = formsFromRows(rows);
  // Concept-level: 1 if this adjective ascribes a transient state (tired, saved) rather than an
  // inherent property. Spanish/Portuguese predicate a transient adjective with `estar`, not `ser`
  // (A47). Concept-level, so it is the same in every language.
  if (lexeme.transient) forms['transient'] = '1';

  return { conceptId, language: language as LexicalEntry['language'], forms };
}

function lookupAdverb(conceptId: string, language: string): LexicalEntry | undefined {
  const db = getDb();
  const lexeme = db.prepare<[string, string], { id: number }>(`
    SELECT al.id FROM concept_adverb_links cal
    JOIN adverb_lexemes al ON al.id = cal.lexeme_id
    WHERE cal.concept_id = ? AND al.language = ? AND cal.is_primary = 1
  `).get(conceptId, language);
  if (!lexeme) return undefined;

  const rows = db.prepare<[number], FormRow>(
    'SELECT form_key, form_value FROM adverb_forms WHERE lexeme_id = ?'
  ).all(lexeme.id);

  return { conceptId, language: language as LexicalEntry['language'], forms: formsFromRows(rows) };
}

// ── Public API ─────────────────────────────────────────────────────────────

const LOOKUP_BY_ROLE: Record<string, (c: string, l: string) => LexicalEntry | undefined> = {
  verb:      lookupVerb,
  noun:      lookupNoun,
  pronoun:   lookupPronoun,
  adjective: lookupAdjective,
  adverb:    lookupAdverb,
};

export function lookupLexicalEntry(conceptId: string, language: string): LexicalEntry | undefined {
  const key = `${conceptId}:${language}`;
  if (entryCache.has(key)) return entryCache.get(key) ?? undefined;

  const role = getConceptRole(conceptId);
  const entry = role ? (LOOKUP_BY_ROLE[role]?.(conceptId, language) ?? null) : null;

  // Expose the concept's grammatical role in the forms map so the engines can tell an
  // adjective-headed subject complement (predicate adjective: "seems happy") from a
  // noun-headed one (predicate nominative: "becomes a legend") at render time.
  if (entry && role) entry.forms['role'] = role;

  entryCache.set(key, entry);
  return entry ?? undefined;
}

// Whether the concept has a `semantic_concepts` row. Not the same as having an entry: a seeded
// concept can lack a lexeme in one language without being unknown.
export function isSeededConcept(conceptId: string): boolean {
  return getConceptRole(conceptId) !== null;
}

export function clearLexiconCache(): void {
  entryCache.clear();
  roleCache.clear();
}
