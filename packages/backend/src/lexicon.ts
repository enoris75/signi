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
  const lexeme = db.prepare<[string, string], { id: number }>(`
    SELECT vl.id FROM concept_verb_links cvl
    JOIN verb_lexemes vl ON vl.id = cvl.lexeme_id
    WHERE cvl.concept_id = ? AND vl.language = ? AND cvl.is_primary = 1
  `).get(conceptId, language);
  if (!lexeme) return undefined;

  const rows = db.prepare<[number], FormRow>(
    'SELECT form_key, form_value FROM verb_forms WHERE lexeme_id = ?'
  ).all(lexeme.id);

  return { conceptId, language: language as LexicalEntry['language'], forms: formsFromRows(rows) };
}

function lookupNoun(conceptId: string, language: string): LexicalEntry | undefined {
  const db = getDb();
  const lexeme = db.prepare<[string, string], { id: number; singular: string; plural: string | null; gender: string | null; animate: number; human: number; countable: number; proper: number }>(`
    SELECT nl.id, nl.singular, nl.plural, nl.gender, sc.animate, sc.human, sc.countable, sc.proper FROM concept_noun_links cnl
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

  return { conceptId, language: language as LexicalEntry['language'], forms };
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
  const lexeme = db.prepare<[string, string], { id: number }>(`
    SELECT al.id FROM concept_adjective_links cal
    JOIN adjective_lexemes al ON al.id = cal.lexeme_id
    WHERE cal.concept_id = ? AND al.language = ? AND cal.is_primary = 1
  `).get(conceptId, language);
  if (!lexeme) return undefined;

  const rows = db.prepare<[number], FormRow>(
    'SELECT form_key, form_value FROM adjective_forms WHERE lexeme_id = ?'
  ).all(lexeme.id);

  return { conceptId, language: language as LexicalEntry['language'], forms: formsFromRows(rows) };
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

export function clearLexiconCache(): void {
  entryCache.clear();
  roleCache.clear();
}
