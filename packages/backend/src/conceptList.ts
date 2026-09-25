import type {
  ClauseObject,
  ComplementType,
  Concept,
  ConceptSlot,
  DimensionRelation,
  GrammaticalRole,
  LanguageCode,
  MannerRelation,
  Transitivity,
} from '@signi/shared';
import { getDb } from './db.js';

interface ConceptRow {
  id: string;
  role: GrammaticalRole;
  description: string;
  emoji: string | null;
  transitivity: string | null;
  complements: string | null;
  synonym: string | null;
  countable: number;
  modal: number;
  clause_object: string | null;
  slot: string | null;
  manner_relation: string | null;
  dimension_relation: string | null;
  alarm: number;
  alarm_cry: number;
}

const CONCEPT_COLS =
  'id, role, description, emoji, transitivity, complements, synonym, countable, modal, clause_object, slot, manner_relation, dimension_relation, alarm, alarm_cry';

const PRONOUN_META_SQL = `
  SELECT cpl.concept_id, pl.person, pl.number
  FROM pronoun_lexemes pl
  JOIN concept_pronoun_links cpl ON cpl.lexeme_id = pl.id AND cpl.is_primary = 1
  WHERE pl.language = 'en'
`;

const GENDERED_NOUNS_SQL = `
  SELECT DISTINCT cnl.concept_id
  FROM noun_forms nf
  JOIN concept_noun_links cnl ON cnl.lexeme_id = nf.lexeme_id AND cnl.is_primary = 1
  WHERE nf.form_key = 'fem'
`;

// The force each verb's that-clause may have (P09-E55, `Concept.clauseForce`), which the seed check
// holds equal across a verb's languages.
const CLAUSE_FORCE_SQL = `
  SELECT cvl.concept_id, MAX(vf.form_value) AS force
  FROM verb_forms vf
  JOIN concept_verb_links cvl ON cvl.lexeme_id = vf.lexeme_id AND cvl.is_primary = 1
  WHERE vf.form_key = 'content_clause_force'
  GROUP BY cvl.concept_id
`;

// The verbs whose object takes a preposition in some language (P09-E54, `Concept.prepositionalObject`).
const PREPOSITIONAL_OBJECT_SQL = `
  SELECT DISTINCT cvl.concept_id
  FROM verb_forms vf
  JOIN concept_verb_links cvl ON cvl.lexeme_id = vf.lexeme_id AND cvl.is_primary = 1
  WHERE vf.form_key = 'object_prep'
`;

// The verbs with a humble word (謙譲語) in some language (P11-E6 D3, `Concept.humble`).
const HUMBLE_SQL = `
  SELECT DISTINCT cvl.concept_id
  FROM verb_forms vf
  JOIN concept_verb_links cvl ON cvl.lexeme_id = vf.lexeme_id AND cvl.is_primary = 1
  WHERE vf.form_key = 'humble'
`;

// Every concept's per-language definitions — the tooltip gloss a picker shows on hover.
// Only English is seeded so far; the map ships with the concept list (like labels) so the
// picker can read the definition in whatever language it's already showing, falling back to
// English client-side when the chosen language has no row.
const DEFINITION_SQL = `
  SELECT concept_id, language, definition FROM concept_definitions
`;

// The picker glosses in the languages other than English (`Concept.glosses`).
const GLOSS_SQL = `
  SELECT concept_id, language, gloss FROM concept_glosses
`;

// Every is_a edge, read as "a is_a b". A concept has at most one (the table's UNIQUE says so),
// so this maps cleanly onto Concept.isA. Fetched unfiltered even when the request narrows to one
// role: hypernyms relate concepts of the same role, so the parent is in the response either way.
const HYPERNYM_SQL = `
  SELECT concept_a_id, concept_b_id FROM concept_relations WHERE relation = 'hypernym'
`;

// The citation form of every concept in every seeded language — the primary lexeme's lemma
// (a noun's singular, or its `citation` where the singular is only the head of a longer name:
// German "adverbiale Bestimmung des Ortes", A140), with the kana reading of that lemma where the lexeme carries one (ja),
// so the pickers can put furigana over the word they show. The pickers show the word in the
// chosen language, so the whole catalog rides along with the concept list rather than being
// re-fetched per language.
const LABEL_SQL = `
  SELECT concept_id, language, word, reading FROM (
    SELECT cpl.concept_id, pl.language, pl.lemma AS word,
           (SELECT form_value FROM pronoun_forms f
            WHERE f.lexeme_id = pl.id AND f.form_key = 'reading') AS reading
    FROM pronoun_lexemes pl
    JOIN concept_pronoun_links cpl ON cpl.lexeme_id = pl.id AND cpl.is_primary = 1
    UNION ALL
    SELECT cvl.concept_id, vl.language, vl.lemma AS word,
           (SELECT form_value FROM verb_forms f
            WHERE f.lexeme_id = vl.id AND f.form_key = 'reading') AS reading
    FROM verb_lexemes vl
    JOIN concept_verb_links cvl ON cvl.lexeme_id = vl.id AND cvl.is_primary = 1
    UNION ALL
    SELECT cnl.concept_id, nl.language,
           COALESCE((SELECT form_value FROM noun_forms f
                     WHERE f.lexeme_id = nl.id AND f.form_key = 'citation'), nl.singular) AS word,
           (SELECT form_value FROM noun_forms f
            WHERE f.lexeme_id = nl.id AND f.form_key = 'reading') AS reading
    FROM noun_lexemes nl
    JOIN concept_noun_links cnl ON cnl.lexeme_id = nl.id AND cnl.is_primary = 1
    UNION ALL
    SELECT cal.concept_id, al.language, al.lemma AS word,
           (SELECT form_value FROM adjective_forms f
            WHERE f.lexeme_id = al.id AND f.form_key = 'reading') AS reading
    FROM adjective_lexemes al
    JOIN concept_adjective_links cal ON cal.lexeme_id = al.id AND cal.is_primary = 1
    UNION ALL
    SELECT cal.concept_id, al.language, al.lemma AS word,
           (SELECT form_value FROM adverb_forms f
            WHERE f.lexeme_id = al.id AND f.form_key = 'reading') AS reading
    FROM adverb_lexemes al
    JOIN concept_adverb_links cal ON cal.lexeme_id = al.id AND cal.is_primary = 1
    UNION ALL
    SELECT cil.concept_id, il.language, il.lemma AS word,
           (SELECT form_value FROM interjection_forms f
            WHERE f.lexeme_id = il.id AND f.form_key = 'reading') AS reading
    FROM interjection_lexemes il
    JOIN concept_interjection_links cil ON cil.lexeme_id = il.id AND cil.is_primary = 1
  )
`;

// Every secondary lexeme (P09-E23), in every language: the other words that find a concept in the
// pickers and the console (*talk* for SPEAK). Search-only — `labels` stays the primary lemma. Only
// the lemma is read: an alias is found, never rendered, so it has no paradigm. Pronouns have none.
const ALIAS_SQL = `
  SELECT concept_id, language, word FROM (
    SELECT cvl.concept_id, vl.language, vl.lemma AS word, vl.id AS lexeme_id
    FROM verb_lexemes vl
    JOIN concept_verb_links cvl ON cvl.lexeme_id = vl.id AND cvl.is_primary = 0
    UNION ALL
    SELECT cnl.concept_id, nl.language, nl.singular AS word, nl.id AS lexeme_id
    FROM noun_lexemes nl
    JOIN concept_noun_links cnl ON cnl.lexeme_id = nl.id AND cnl.is_primary = 0
    UNION ALL
    SELECT cal.concept_id, al.language, al.lemma AS word, al.id AS lexeme_id
    FROM adjective_lexemes al
    JOIN concept_adjective_links cal ON cal.lexeme_id = al.id AND cal.is_primary = 0
    UNION ALL
    SELECT cal.concept_id, al.language, al.lemma AS word, al.id AS lexeme_id
    FROM adverb_lexemes al
    JOIN concept_adverb_links cal ON cal.lexeme_id = al.id AND cal.is_primary = 0
    UNION ALL
    SELECT cil.concept_id, il.language, il.lemma AS word, il.id AS lexeme_id
    FROM interjection_lexemes il
    JOIN concept_interjection_links cil ON cil.lexeme_id = il.id AND cil.is_primary = 0
  )
  ORDER BY lexeme_id
`;


export interface ListConceptsOptions {
  /** Only the concepts of this role. */
  role?: string;
  /** Include the lexical senses the pickers never offer (see below); the definition compiler names them. */
  senses?: boolean;
  /** The engine-composed definitions to merge over the stored literals (see buildConceptDefinitions). */
  composedDefinitions?: Map<string, Partial<Record<LanguageCode, string>>>;
  /** Each definition's text in the phrase language (P13), which the console opens with `/define`. */
  definitionTexts?: Map<string, string>;
}

/**
 * The seeded concepts as the API serves them (`/api/concepts`): each with its words in every
 * language, its readings, aliases and definitions, and the grammatical facts the pickers and the
 * console read — the same records a `Vocabulary` is made of, which is why the definition compiler
 * (P13) reads them here too.
 */
export function listConcepts({ role, senses = false, composedDefinitions, definitionTexts }: ListConceptsOptions = {}): Concept[] {
  const db = getDb();

  // A lexical sense (`sense_of`) is left out unless asked for: the engine selects it in place of the
  // concept the user picked (KNOW_ACQUAINTED for KNOW with an object, A131), so no picker offers it.
  const senseFilter = senses ? '' : 'sense_of IS NULL';
  const where = [role ? 'role = ?' : '', senseFilter].filter(Boolean).join(' AND ');
  const sql = `SELECT ${CONCEPT_COLS} FROM semantic_concepts${where ? ` WHERE ${where}` : ''} ORDER BY ${role ? 'id' : 'role, id'}`;
  const rows = role ? db.prepare<[string], ConceptRow>(sql).all(role) : db.prepare<[], ConceptRow>(sql).all();

  const labelRows = db
    .prepare<[], { concept_id: string; language: LanguageCode; word: string; reading: string | null }>(
      LABEL_SQL,
    )
    .all();
  const labels = new Map<string, Partial<Record<LanguageCode, string>>>();
  const readings = new Map<string, Partial<Record<LanguageCode, string>>>();
  for (const r of labelRows) {
    const byLanguage = labels.get(r.concept_id) ?? {};
    byLanguage[r.language] = r.word;
    labels.set(r.concept_id, byLanguage);
    // A word already written in kana reads as itself (ねこ), so it gets no furigana — same
    // rule the engine applies when it builds ruby segments for a translation.
    if (r.reading && r.reading !== r.word) {
      const readingByLanguage = readings.get(r.concept_id) ?? {};
      readingByLanguage[r.language] = r.reading;
      readings.set(r.concept_id, readingByLanguage);
    }
  }

  const aliasRows = db
    .prepare<[], { concept_id: string; language: LanguageCode; word: string }>(ALIAS_SQL)
    .all();
  const aliases = new Map<string, Partial<Record<LanguageCode, string[]>>>();
  for (const r of aliasRows) {
    const byLanguage = aliases.get(r.concept_id) ?? {};
    (byLanguage[r.language] ??= []).push(r.word);
    aliases.set(r.concept_id, byLanguage);
  }

  const definitionRows = db
    .prepare<[], { concept_id: string; language: LanguageCode; definition: string }>(
      DEFINITION_SQL,
    )
    .all();
  const definitions = new Map<string, Partial<Record<LanguageCode, string>>>();
  for (const r of definitionRows) {
    const byLanguage = definitions.get(r.concept_id) ?? {};
    byLanguage[r.language] = r.definition;
    definitions.set(r.concept_id, byLanguage);
  }
  const glosses = new Map<string, Partial<Record<LanguageCode, string>>>();
  for (const r of db.prepare<[], { concept_id: string; language: LanguageCode; gloss: string }>(GLOSS_SQL).all()) {
    glosses.set(r.concept_id, { ...glosses.get(r.concept_id), [r.language]: r.gloss });
  }
  // An engine-composed definition (rendered from the concept's `definition` plan) supersedes the
  // stored literal, in every language it renders — so a planned concept reads consistently across
  // languages rather than mixing an English literal with translated fragments.
  const definitionFor = (id: string): Partial<Record<LanguageCode, string>> | undefined => {
    const literal = definitions.get(id);
    const composed = composedDefinitions?.get(id);
    if (!literal && !composed) return undefined;
    return { ...literal, ...composed };
  };

  const genderedNounRows = db.prepare<[], { concept_id: string }>(GENDERED_NOUNS_SQL).all();
  const genderedNouns = new Set(genderedNounRows.map((r) => r.concept_id));
  const clauseForces = new Map(
    db
      .prepare<[], { concept_id: string; force: string }>(CLAUSE_FORCE_SQL)
      .all()
      .filter((r) => r.force === 'interrogative' || r.force === 'either')
      .map((r) => [r.concept_id, r.force as 'interrogative' | 'either']),
  );
  const prepositionalObjects = new Set(
    db.prepare<[], { concept_id: string }>(PREPOSITIONAL_OBJECT_SQL).all().map((r) => r.concept_id),
  );

  const hypernymRows = db
    .prepare<[], { concept_a_id: string; concept_b_id: string }>(HYPERNYM_SQL)
    .all();
  const hypernyms = new Map(hypernymRows.map((r) => [r.concept_a_id, r.concept_b_id]));
  const humbleVerbs = new Set(db.prepare<[], { concept_id: string }>(HUMBLE_SQL).all().map((r) => r.concept_id));
  // A noun under RELATIVE, walked up its hypernyms (P11-E6 D2, `Concept.relative`). The seed rejects
  // a cyclic tree, and the walk is bounded anyway.
  const isRelative = (id: string): boolean => {
    let at: string | undefined = id;
    for (let depth = 0; at && depth < 64; depth++, at = hypernyms.get(at)) if (at === 'RELATIVE') return true;
    return false;
  };

  const pronounMeta = db
    .prepare<[], { concept_id: string; person: string; number: string }>(PRONOUN_META_SQL)
    .all();
  const pronounPersons = new Map(pronounMeta.map((r) => [r.concept_id, r.person as '1' | '2' | '3']));
  const pronounNumbers = new Map(pronounMeta.map((r) => [r.concept_id, r.number as 'singular' | 'plural']));

  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    description: r.description,
    definitions: definitionFor(r.id),
    definitionText: definitionTexts?.get(r.id),
    label: labels.get(r.id)?.en,
    labels: labels.get(r.id),
    readings: readings.get(r.id),
    synonym: r.synonym ?? undefined,
    glosses: glosses.get(r.id),
    countable: r.countable === 0 ? false : undefined,
    emoji: r.emoji ?? undefined,
    modal: r.modal === 1 || undefined,
    clauseObject: (r.clause_object as ClauseObject | null) ?? undefined,
    clauseForce: clauseForces.get(r.id),
    prepositionalObject: prepositionalObjects.has(r.id) || undefined,
    humble: humbleVerbs.has(r.id) || undefined,
    relative: (r.role === 'noun' && isRelative(r.id)) || undefined,
    slot: (r.slot as ConceptSlot | null) ?? undefined,
    mannerRelation: (r.manner_relation as MannerRelation) ?? undefined,
    dimensionRelation: (r.dimension_relation as DimensionRelation) ?? undefined,
    alarm: r.alarm === 1 || undefined,
    alarmCry: r.alarm_cry === 1 || undefined,
    transitivity: (r.transitivity as Transitivity) ?? undefined,
    complements: r.complements
      ? (r.complements.split(',') as ComplementType[])
      : undefined,
    person: pronounPersons.get(r.id),
    number: pronounNumbers.get(r.id),
    gendered: genderedNouns.has(r.id) || undefined,
    isA: hypernyms.get(r.id),
    aliases: aliases.get(r.id),
  }));
}
