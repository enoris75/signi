import { afterEach, describe, expect, test } from 'vitest';
import { getDb } from './db.js';
import { clearLexiconCache, lookupLexicalEntry } from './lexicon.js';
// Seeds the real corpus into this file's in-memory database (SIGNI_DB_PATH, see vitest.config.ts).
import './seed.js';

const db = getDb();

afterEach(() => {
  clearLexiconCache();
});

describe('lookupLexicalEntry', () => {
  test('reads a verb\'s forms, the non-finite ones folded in by the seed included', () => {
    expect(lookupLexicalEntry('CUT', 'en')).toEqual({
      conceptId: 'CUT',
      language: 'en',
      forms: {
        base: 'cut',
        '1sg_present': 'cut', '2sg_present': 'cut', '3sg_present': 'cuts',
        '1pl_present': 'cut', '2pl_present': 'cut', '3pl_present': 'cut',
        past: 'cut',
        gerund: 'cutting',
        participle: 'cut',
        role: 'verb',
      },
    });
  });

  test('puts a noun\'s typed columns and concept-level flags back into its forms', () => {
    expect(lookupLexicalEntry('CAT', 'it')).toEqual({
      conceptId: 'CAT',
      language: 'it',
      forms: {
        base: 'gatto',
        plural: 'gatti',
        gender: 'masc',
        count: 'singular',
        fem: 'gatta',
        fem_plural: 'gatte',
        animate: '1',
        isA: 'MAMMAL',
        role: 'noun',
      },
    });
  });

  test('leaves out a noun\'s absent gender, plural and hypernym', () => {
    const { forms } = lookupLexicalEntry('WATER', 'en')!;
    expect(forms).toEqual({ base: 'water', count: 'singular', uncountable: '1', role: 'noun' });
  });

  test.each([
    ['PERSON', 'en', { human: '1', animate: '1' }],
    ['AFRICA', 'fr', { proper: '1', uncountable: '1', gender: 'fem', isA: 'CONTINENT' }],
    ['SPEED', 'en', { mannerRelation: 'measure' }],
    ['SIZE', 'en', { dimensionRelation: 'extent' }],
    ['WOLF', 'it', { alarm: '1', animate: '1' }],
  ])('carries %s\'s concept-level noun flags in %s', (id, language, flags) => {
    expect(lookupLexicalEntry(id, language)!.forms).toMatchObject(flags);
  });

  test('keeps flags a noun does not have out of its forms', () => {
    const forms = lookupLexicalEntry('CAT', 'en')!.forms;
    for (const key of ['gender', 'human', 'uncountable', 'proper', 'mannerRelation', 'dimensionRelation', 'alarm']) {
      expect(forms).not.toHaveProperty(key);
    }
  });

  test('puts a pronoun\'s person, number and gender columns back into its forms', () => {
    expect(lookupLexicalEntry('THIRD_PERSON', 'it')!.forms).toMatchObject({
      base: 'lui',
      person: '3',
      number: 'singular',
      gender: 'masc',
      object_fem: 'la',
      role: 'pronoun',
    });
    expect(lookupLexicalEntry('FIRST_PERSON', 'ja')!.forms).toEqual({
      base: '私',
      plural: '私たち',
      reading: 'わたし',
      plural_reading: 'わたしたち',
      person: '1',
      number: 'singular',
      role: 'pronoun',
    });
  });

  test('marks an adjective transient only when its concept is', () => {
    expect(lookupLexicalEntry('TIRED', 'es')!.forms).toEqual({ base: 'cansado', transient: '1', role: 'adjective' });
    expect(lookupLexicalEntry('BIG', 'es')!.forms).toEqual({ base: 'grande', role: 'adjective' });
  });

  test('reads an adverb\'s forms', () => {
    expect(lookupLexicalEntry('FAST', 'ja')).toEqual({
      conceptId: 'FAST',
      language: 'ja',
      forms: { base: '速く', reading: 'はやく', role: 'adverb' },
    });
  });

  test('is undefined for an unknown concept, in any language', () => {
    expect(lookupLexicalEntry('UNICORN', 'en')).toBeUndefined();
    expect(lookupLexicalEntry('UNICORN', 'it')).toBeUndefined();
  });

  test.each(['CUT', 'CAT', 'THIRD_PERSON', 'TIRED', 'FAST'])(
    'is undefined for a language %s is not seeded in',
    (id) => {
      expect(lookupLexicalEntry(id, 'nl')).toBeUndefined();
    },
  );

  test('ignores a lexeme that is not the concept\'s primary one', () => {
    db.prepare("INSERT INTO semantic_concepts (id, role, description) VALUES ('DEVOUR', 'verb', 'to eat greedily')").run();
    const lexemeId = db.prepare("INSERT INTO verb_lexemes (language, lemma) VALUES ('en', 'devour')").run().lastInsertRowid;
    db.prepare('INSERT INTO concept_verb_links (concept_id, lexeme_id, is_primary) VALUES (?, ?, 0)').run('DEVOUR', lexemeId);
    try {
      expect(lookupLexicalEntry('DEVOUR', 'en')).toBeUndefined();
    } finally {
      db.prepare("DELETE FROM semantic_concepts WHERE id = 'DEVOUR'").run();
      db.prepare('DELETE FROM verb_lexemes WHERE id = ?').run(lexemeId);
    }
  });
});

describe('the lexicon cache', () => {
  const setPast = (value: string) =>
    db
      .prepare(`
        UPDATE verb_forms SET form_value = ?
        WHERE form_key = 'past' AND lexeme_id = (
          SELECT vl.id FROM verb_lexemes vl
          JOIN concept_verb_links cvl ON cvl.lexeme_id = vl.id
          WHERE cvl.concept_id = 'CUT' AND vl.language = 'en'
        )`)
      .run(value);

  test('serves a repeat lookup from memory until cleared', () => {
    const first = lookupLexicalEntry('CUT', 'en');
    setPast('chopped');
    try {
      expect(lookupLexicalEntry('CUT', 'en')).toBe(first);
      expect(lookupLexicalEntry('CUT', 'en')!.forms['past']).toBe('cut');

      clearLexiconCache();
      expect(lookupLexicalEntry('CUT', 'en')!.forms['past']).toBe('chopped');
    } finally {
      setPast('cut');
    }
  });

  test('keys entries by concept and language', () => {
    expect(lookupLexicalEntry('CUT', 'en')!.forms['base']).toBe('cut');
    expect(lookupLexicalEntry('CUT', 'it')!.forms['base']).toBe('tagliare');
  });

  test('remembers a miss until cleared', () => {
    expect(lookupLexicalEntry('LATE', 'en')).toBeUndefined();

    db.prepare("INSERT INTO semantic_concepts (id, role, description) VALUES ('LATE', 'adverb', 'after the expected time')").run();
    const lexemeId = db.prepare("INSERT INTO adverb_lexemes (language, lemma) VALUES ('en', 'late')").run().lastInsertRowid;
    db.prepare("INSERT INTO adverb_forms (lexeme_id, form_key, form_value) VALUES (?, 'base', 'late')").run(lexemeId);
    db.prepare("INSERT INTO concept_adverb_links (concept_id, lexeme_id) VALUES ('LATE', ?)").run(lexemeId);
    try {
      expect(lookupLexicalEntry('LATE', 'en')).toBeUndefined();

      clearLexiconCache();
      expect(lookupLexicalEntry('LATE', 'en')!.forms).toEqual({ base: 'late', role: 'adverb' });
    } finally {
      db.prepare("DELETE FROM semantic_concepts WHERE id = 'LATE'").run();
      db.prepare('DELETE FROM adverb_lexemes WHERE id = ?').run(lexemeId);
    }
  });
});
