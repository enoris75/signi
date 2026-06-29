import { getDb } from './db.js';
// ── Cache ──────────────────────────────────────────────────────────────────
const entryCache = new Map();
const roleCache = new Map();
// ── Role lookup ────────────────────────────────────────────────────────────
function getConceptRole(conceptId) {
    if (roleCache.has(conceptId))
        return roleCache.get(conceptId) ?? null;
    const row = getDb()
        .prepare('SELECT role FROM semantic_concepts WHERE id = ?')
        .get(conceptId);
    const role = row?.role ?? null;
    roleCache.set(conceptId, role);
    return role;
}
// ── Per-type lookup helpers ────────────────────────────────────────────────
function formsFromRows(rows) {
    return Object.fromEntries(rows.map((r) => [r.form_key, r.form_value]));
}
function lookupVerb(conceptId, language) {
    const db = getDb();
    const lexeme = db.prepare(`
    SELECT vl.id FROM concept_verb_links cvl
    JOIN verb_lexemes vl ON vl.id = cvl.lexeme_id
    WHERE cvl.concept_id = ? AND vl.language = ? AND cvl.is_primary = 1
  `).get(conceptId, language);
    if (!lexeme)
        return undefined;
    const rows = db.prepare('SELECT form_key, form_value FROM verb_forms WHERE lexeme_id = ?').all(lexeme.id);
    return { conceptId, language: language, forms: formsFromRows(rows) };
}
function lookupNoun(conceptId, language) {
    const db = getDb();
    const lexeme = db.prepare(`
    SELECT nl.id, nl.singular, nl.plural, nl.gender FROM concept_noun_links cnl
    JOIN noun_lexemes nl ON nl.id = cnl.lexeme_id
    WHERE cnl.concept_id = ? AND nl.language = ? AND cnl.is_primary = 1
  `).get(conceptId, language);
    if (!lexeme)
        return undefined;
    const rows = db.prepare('SELECT form_key, form_value FROM noun_forms WHERE lexeme_id = ?').all(lexeme.id);
    const forms = formsFromRows(rows);
    // Synthesise typed columns back into the forms map for the engine
    forms['base'] = lexeme.singular;
    if (lexeme.plural)
        forms['plural'] = lexeme.plural;
    if (lexeme.gender)
        forms['gender'] = lexeme.gender;
    return { conceptId, language: language, forms };
}
function lookupPronoun(conceptId, language) {
    const db = getDb();
    const lexeme = db.prepare(`
    SELECT pl.id, pl.person, pl.number, pl.gender FROM concept_pronoun_links cpl
    JOIN pronoun_lexemes pl ON pl.id = cpl.lexeme_id
    WHERE cpl.concept_id = ? AND pl.language = ? AND cpl.is_primary = 1
  `).get(conceptId, language);
    if (!lexeme)
        return undefined;
    const rows = db.prepare('SELECT form_key, form_value FROM pronoun_forms WHERE lexeme_id = ?').all(lexeme.id);
    const forms = formsFromRows(rows);
    forms['person'] = lexeme.person;
    forms['number'] = lexeme.number;
    if (lexeme.gender)
        forms['gender'] = lexeme.gender;
    return { conceptId, language: language, forms };
}
function lookupAdjective(conceptId, language) {
    const db = getDb();
    const lexeme = db.prepare(`
    SELECT al.id FROM concept_adjective_links cal
    JOIN adjective_lexemes al ON al.id = cal.lexeme_id
    WHERE cal.concept_id = ? AND al.language = ? AND cal.is_primary = 1
  `).get(conceptId, language);
    if (!lexeme)
        return undefined;
    const rows = db.prepare('SELECT form_key, form_value FROM adjective_forms WHERE lexeme_id = ?').all(lexeme.id);
    return { conceptId, language: language, forms: formsFromRows(rows) };
}
function lookupAdverb(conceptId, language) {
    const db = getDb();
    const lexeme = db.prepare(`
    SELECT al.id FROM concept_adverb_links cal
    JOIN adverb_lexemes al ON al.id = cal.lexeme_id
    WHERE cal.concept_id = ? AND al.language = ? AND cal.is_primary = 1
  `).get(conceptId, language);
    if (!lexeme)
        return undefined;
    const rows = db.prepare('SELECT form_key, form_value FROM adverb_forms WHERE lexeme_id = ?').all(lexeme.id);
    return { conceptId, language: language, forms: formsFromRows(rows) };
}
// ── Public API ─────────────────────────────────────────────────────────────
const LOOKUP_BY_ROLE = {
    verb: lookupVerb,
    noun: lookupNoun,
    pronoun: lookupPronoun,
    adjective: lookupAdjective,
    adverb: lookupAdverb,
};
export function lookupLexicalEntry(conceptId, language) {
    const key = `${conceptId}:${language}`;
    if (entryCache.has(key))
        return entryCache.get(key) ?? undefined;
    const role = getConceptRole(conceptId);
    const entry = role ? (LOOKUP_BY_ROLE[role]?.(conceptId, language) ?? null) : null;
    entryCache.set(key, entry);
    return entry ?? undefined;
}
export function clearLexiconCache() {
    entryCache.clear();
    roleCache.clear();
}
//# sourceMappingURL=lexicon.js.map