import { getDb } from './db.js';
import { clearLexiconCache } from './lexicon.js';
import { concepts, NONFINITE } from './concepts/index.js';
import { assertValidHierarchy } from './concepts/hierarchy.js';

const db = getDb();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyStmt = { run: (...args: any[]) => { lastInsertRowid: bigint | number } };

interface RoleStmts {
  insertLexeme: AnyStmt;
  insertForm:   AnyStmt;
  insertLink:   AnyStmt;
  /** A secondary lexeme's link (P09-E23): found by search, never rendered. */
  insertAliasLink: AnyStmt;
}

function buildRoleStmts(role: string): RoleStmts {
  return {
    insertLexeme: db.prepare(roleInsertSql(role)) as unknown as AnyStmt,
    insertForm:   db.prepare(`INSERT INTO ${role}_forms (lexeme_id, form_key, form_value) VALUES (?, ?, ?)`) as unknown as AnyStmt,
    insertLink:   db.prepare(`INSERT INTO concept_${role}_links (concept_id, lexeme_id, is_primary) VALUES (?, ?, 1)`) as unknown as AnyStmt,
    insertAliasLink: db.prepare(`INSERT INTO concept_${role}_links (concept_id, lexeme_id, is_primary) VALUES (?, ?, 0)`) as unknown as AnyStmt,
  };
}

function roleInsertSql(role: string): string {
  switch (role) {
    case 'noun':    return 'INSERT INTO noun_lexemes (language, singular, plural, gender) VALUES (?, ?, ?, ?)';
    case 'pronoun': return 'INSERT INTO pronoun_lexemes (language, lemma, person, number, gender) VALUES (?, ?, ?, ?, ?)';
    default:        return `INSERT INTO ${role}_lexemes (language, lemma)                 VALUES (?, ?)`;
  }
}

/** Form keys that are stored as typed columns on the lexeme table (not in *_forms) */
const LEXEME_COLUMNS: Record<string, string[]> = {
  noun:    ['base', 'plural', 'gender'],
  pronoun: ['person', 'number', 'gender'],
};

function lexemeArgs(role: string, lang: string, lemma: string, forms: Record<string, string>): (string | null)[] {
  switch (role) {
    case 'noun':
      return [lang, lemma, forms['plural'] ?? null, forms['gender'] ?? null];
    case 'pronoun':
      return [lang, lemma, forms['person'] ?? '3', forms['number'] ?? 'singular', forms['gender'] ?? null];
    default:
      return [lang, lemma];
  }
}

/**
 * Refuse an alias the seed cannot mean: one on a pronoun (a pronoun lexeme carries person and
 * number, and a pronoun is found by its person), a blank one, or one that repeats the concept's
 * own primary lemma or another alias in the same language.
 */
function assertValidAliases(seeds: typeof concepts): void {
  for (const c of seeds) {
    if (!c.aliases) continue;
    if (c.role === 'pronoun') throw new Error(`${c.id}: a pronoun takes no aliases`);
    for (const [lang, words] of Object.entries(c.aliases)) {
      const seen = new Set([c.forms[lang]?.['base']]);
      for (const word of words ?? []) {
        if (!word.trim()) throw new Error(`${c.id}: a blank ${lang} alias`);
        if (seen.has(word)) throw new Error(`${c.id}: the ${lang} alias "${word}" repeats a word it already has`);
        seen.add(word);
      }
    }
  }
}

function seed() {
  const stmts = {
    wipeConcepts: db.prepare('DELETE FROM semantic_concepts'),
    wipeVerbs:    db.prepare('DELETE FROM verb_lexemes'),
    wipeNouns:    db.prepare('DELETE FROM noun_lexemes'),
    wipePronouns: db.prepare('DELETE FROM pronoun_lexemes'),
    wipeAdjectives: db.prepare('DELETE FROM adjective_lexemes'),
    wipeAdverbs:  db.prepare('DELETE FROM adverb_lexemes'),
    wipeInterjections: db.prepare('DELETE FROM interjection_lexemes'),

    insertConcept: db.prepare<[string, string, string, string | null, string | null, string | null, number, number, string | null, number, number, string | null, string | null, number, string | null, string | null, number, number, number, number, number, string | null]>(
      'INSERT INTO semantic_concepts (id, role, description, emoji, transitivity, complements, animate, human, synonym, countable, modal, clause_object, slot, proper, manner_relation, dimension_relation, temporal, transient, alarm, alarm_cry, stative, sense_of) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ),

    // Only English is seeded (from the concept's `description`). Other languages are left
    // empty on purpose — a picker showing them falls back to English until a translated
    // definition is added here.
    insertDefinition: db.prepare<[string, string, string]>(
      'INSERT INTO concept_definitions (concept_id, language, definition) VALUES (?, ?, ?)'
    ),

    insertHypernym: db.prepare<[string, string]>(
      "INSERT INTO concept_relations (concept_a_id, concept_b_id, relation) VALUES (?, ?, 'hypernym')"
    ),
  };

  const roleStmts: Record<string, RoleStmts> = {
    verb:      buildRoleStmts('verb'),
    noun:      buildRoleStmts('noun'),
    pronoun:   buildRoleStmts('pronoun'),
    adjective: buildRoleStmts('adjective'),
    adverb:    buildRoleStmts('adverb'),
    interjection: buildRoleStmts('interjection'),
  };

  const run = db.transaction(() => {
    // Wipe per-type tables first (concepts will cascade their links)
    stmts.wipeVerbs.run();
    stmts.wipeNouns.run();
    stmts.wipePronouns.run();
    stmts.wipeAdjectives.run();
    stmts.wipeAdverbs.run();
    stmts.wipeInterjections.run();
    stmts.wipeConcepts.run();

    for (const c of concepts) {
      stmts.insertConcept.run(c.id, c.role, c.description, c.emoji ?? null, c.transitivity ?? null, c.complements?.length ? c.complements.join(',') : null, c.animate ? 1 : 0, c.human ? 1 : 0, c.synonym ?? null, c.countable === false ? 0 : 1, c.modal ? 1 : 0, c.clauseObject ?? null, c.slot ?? null, c.proper ? 1 : 0, c.mannerRelation ?? null, c.dimensionRelation ?? null, c.temporal ? 1 : 0, c.transient ? 1 : 0, c.alarm ? 1 : 0, c.alarmCry ? 1 : 0, c.stative ? 1 : 0, c.senseOf ?? null);
      // Seed the English definition from `description`; other languages stay empty (fallback to en).
      stmts.insertDefinition.run(c.id, 'en', c.description);

      const rs = roleStmts[c.role];
      if (!rs) continue;

      const excludedKeys = new Set(['base', ...(LEXEME_COLUMNS[c.role] ?? [])]);

      for (const [lang, baseForms] of Object.entries(c.forms)) {
        // Fold in the non-finite aspect forms (gerund / participle / te-form) for verbs.
        const extra = c.role === 'verb' ? NONFINITE[c.id]?.[lang] : undefined;
        const forms = extra ? { ...baseForms, ...extra } : baseForms;
        const lemma = forms['base'] ?? '';
        // Pass language via a temporary augmented object so lexemeArgs can access it
        const { lastInsertRowid } = rs.insertLexeme.run(...lexemeArgs(c.role, lang, lemma, forms));
        const lexemeId = Number(lastInsertRowid);

        // For types where the base form is a dedicated column (noun.singular,
        // pronoun.lemma), the lookup synthesises forms['base'] from that column,
        // so we don't store a redundant row here.
        const storeBaseAsForm = c.role !== 'noun';
        if (storeBaseAsForm) {
          rs.insertForm.run(lexemeId, 'base', lemma);
        }
        for (const [key, value] of Object.entries(forms)) {
          if (!excludedKeys.has(key)) {
            rs.insertForm.run(lexemeId, key, value);
          }
        }

        rs.insertLink.run(c.id, lexemeId);
      }

      // Secondary lexemes (P09-E23): a lemma and nothing more — a noun's singular with no plural
      // or gender, or the lemma plus the `base` form row every other role keeps. Every reader that
      // renders or labels filters on is_primary = 1, so these are seen only by the alias query.
      for (const [lang, words] of Object.entries(c.aliases ?? {})) {
        for (const word of words ?? []) {
          const { lastInsertRowid } = rs.insertLexeme.run(...lexemeArgs(c.role, lang, word, {}));
          const lexemeId = Number(lastInsertRowid);
          if (c.role !== 'noun') rs.insertForm.run(lexemeId, 'base', word);
          rs.insertAliasLink.run(c.id, lexemeId);
        }
      }
    }

    // Hypernyms go in a second pass: the FK points back at semantic_concepts, and a concept is
    // free to name a parent that appears later in the seed files (CARAVEL will not politely sort
    // after SHIP). Every concept exists by now, so no ordering discipline is needed above.
    for (const c of concepts) {
      if (c.isA) stmts.insertHypernym.run(c.id, c.isA);
    }
  });

  // Fail before touching the database: an isA naming a concept that isn't seeded, or a cycle.
  // Neither is caught by the schema — a cycle satisfies every foreign key — and an undetected
  // one would hang the ancestor walk at request time instead of failing here.
  assertValidHierarchy(concepts);
  assertValidAliases(concepts);

  run();
  clearLexiconCache();
  console.log(`Seeded ${concepts.length} concepts across ${Object.keys(concepts[0]?.forms ?? {}).length} languages.`);
}

seed();
