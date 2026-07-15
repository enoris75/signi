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
}

function buildRoleStmts(role: string): RoleStmts {
  return {
    insertLexeme: db.prepare(roleInsertSql(role)) as unknown as AnyStmt,
    insertForm:   db.prepare(`INSERT INTO ${role}_forms (lexeme_id, form_key, form_value) VALUES (?, ?, ?)`) as unknown as AnyStmt,
    insertLink:   db.prepare(`INSERT INTO concept_${role}_links (concept_id, lexeme_id, is_primary) VALUES (?, ?, 1)`) as unknown as AnyStmt,
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

function seed() {
  const stmts = {
    wipeConcepts: db.prepare('DELETE FROM semantic_concepts'),
    wipeVerbs:    db.prepare('DELETE FROM verb_lexemes'),
    wipeNouns:    db.prepare('DELETE FROM noun_lexemes'),
    wipePronouns: db.prepare('DELETE FROM pronoun_lexemes'),
    wipeAdjectives: db.prepare('DELETE FROM adjective_lexemes'),
    wipeAdverbs:  db.prepare('DELETE FROM adverb_lexemes'),

    insertConcept: db.prepare<[string, string, string, string | null, string | null, string | null, number, number, string | null, number, number, number]>(
      'INSERT INTO semantic_concepts (id, role, description, emoji, transitivity, complements, animate, human, synonym, countable, modal, proper) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
  };

  const run = db.transaction(() => {
    // Wipe per-type tables first (concepts will cascade their links)
    stmts.wipeVerbs.run();
    stmts.wipeNouns.run();
    stmts.wipePronouns.run();
    stmts.wipeAdjectives.run();
    stmts.wipeAdverbs.run();
    stmts.wipeConcepts.run();

    for (const c of concepts) {
      stmts.insertConcept.run(c.id, c.role, c.description, c.emoji ?? null, c.transitivity ?? null, c.complements?.length ? c.complements.join(',') : null, c.animate ? 1 : 0, c.human ? 1 : 0, c.synonym ?? null, c.countable === false ? 0 : 1, c.modal ? 1 : 0, c.proper ? 1 : 0);

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

  run();
  clearLexiconCache();
  console.log(`Seeded ${concepts.length} concepts across ${Object.keys(concepts[0]?.forms ?? {}).length} languages.`);
}

seed();
