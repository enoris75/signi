import { afterEach, describe, expect, test } from 'vitest';
import { getDb } from './db.js';
import { clearLexiconCache, isSeededConcept, lookupLexicalEntry, notingLookup } from './lexicon.js';
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
        // Concept-level, exposed for the passive: only a verb with a patient can promote one (A01).
        transitivity: 'transitive',
        // Concept-level: the complements CUT licenses (A228).
        complements: 'manner,instrumental,terminus,cause,locative',
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
        // The whole is-a chain, not the direct hypernym: CAT isA MAMMAL isA ANIMAL (A157).
        animal: '1',
        isA: 'MAMMAL',
        role: 'noun',
      },
    });
  });

  test('leaves out a noun\'s absent gender, plural and hypernym', () => {
    const { forms } = lookupLexicalEntry('FOOD', 'en')!;
    expect(forms).toEqual({ base: 'food', count: 'singular', uncountable: '1', role: 'noun' });
  });

  test.each([
    ['PERSON', 'en', { human: '1', animate: '1' }],
    ['AFRICA', 'fr', { proper: '1', uncountable: '1', gender: 'fem', isA: 'CONTINENT' }],
    ['SPEED', 'en', { mannerRelation: 'measure' }],
    ['TIME', 'it', { mannerRelation: 'measure', temporal: '1' }],
    ['SIZE', 'en', { dimensionRelation: 'extent' }],
    ['WOLF', 'it', { alarm: '1', animate: '1', animal: '1' }],
    // `animal` is walked up the whole chain, so the genus itself carries it and a person never does.
    ['ANIMAL', 'de', { animal: '1', animate: '1' }],
  ])('carries %s\'s concept-level noun flags in %s', (id, language, flags) => {
    expect(lookupLexicalEntry(id, language)!.forms).toMatchObject(flags);
  });

  // A235: a point in time is the concept's, not a German word's, so every lexeme of TIME carries it —
  // the translator reads it in any language to keep the article of "at the other time" — and a rate
  // like SPEED does not.
  test('marks a noun naming a point in time temporal in every language, and no rate', () => {
    for (const language of ['en', 'it', 'fr', 'de', 'es', 'pt', 'ja']) {
      expect(lookupLexicalEntry('TIME', language)!.forms).toMatchObject({ mannerRelation: 'measure', temporal: '1' });
    }
    expect(lookupLexicalEntry('SPEED', 'en')!.forms).not.toHaveProperty('temporal');
  });

  // A130 / A132: a state verb carries its concept's flag; an event verb does not.
  test('marks a verb stative only when its concept is', () => {
    expect(lookupLexicalEntry('HAVE', 'it')!.forms).toMatchObject({ base: 'avere', stative: '1' });
    expect(lookupLexicalEntry('MUST', 'ja')!.forms).toMatchObject({ stative: '1' });
    expect(lookupLexicalEntry('EAT', 'it')!.forms).not.toHaveProperty('stative');
  });

  // A163: the cry of an alarm is the shout itself in every language, so the flag is the concept's and
  // reaches every lexeme of it, not just the Italian and French ones that fuse an article into it.
  test('marks a verb that cries an alarm in every language, and no other verb', () => {
    for (const language of ['en', 'it', 'fr', 'de', 'es', 'pt', 'ja']) {
      expect(lookupLexicalEntry('CRY_OUT', language)!.forms).toMatchObject({ alarm_cry: '1' });
    }
    expect(lookupLexicalEntry('SEE', 'it')!.forms).not.toHaveProperty('alarm_cry');
  });

  test('reads a lexical sense like any verb, and the verb that names it as its object sense', () => {
    expect(lookupLexicalEntry('KNOW', 'de')!.forms).toMatchObject({ base: 'wissen', object_sense: 'KNOW_ACQUAINTED' });
    expect(lookupLexicalEntry('KNOW_ACQUAINTED', 'de')!.forms).toMatchObject({ base: 'kennen', participle: 'gekannt', stative: '1', role: 'verb' });
    expect(lookupLexicalEntry('KNOW', 'en')!.forms).not.toHaveProperty('object_sense');
  });

  // A157: the same machinery one argument over — the SUBJECT selects the sense.
  test('…and the verb that names one as its subject sense', () => {
    expect(lookupLexicalEntry('EAT', 'de')!.forms).toMatchObject({ base: 'essen', subject_sense: 'EAT_ANIMAL' });
    expect(lookupLexicalEntry('EAT_ANIMAL', 'de')!.forms).toMatchObject({ base: 'fressen', participle: 'gefressen', role: 'verb' });
    expect(lookupLexicalEntry('EAT', 'en')!.forms).not.toHaveProperty('subject_sense');
  });

  test('keeps flags a noun does not have out of its forms', () => {
    const forms = lookupLexicalEntry('CAT', 'en')!.forms;
    for (const key of ['gender', 'human', 'uncountable', 'proper', 'mannerRelation', 'dimensionRelation', 'temporal', 'alarm']) {
      expect(forms).not.toHaveProperty(key);
    }
    // A person is not an animal, however far up the chain: PERSON has no hypernym above it.
    expect(lookupLexicalEntry('PERSON', 'de')!.forms).not.toHaveProperty('animal');
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

describe('isSeededConcept', () => {
  test('is true for a seeded concept of any role, and false for an unknown one', () => {
    for (const id of ['CUT', 'CAT', 'THIRD_PERSON', 'TIRED', 'FAST', 'MUST']) expect(isSeededConcept(id)).toBe(true);
    expect(isSeededConcept('UNICORN')).toBe(false);
  });

  test('is true for a concept with no words yet', () => {
    db.prepare("INSERT INTO semantic_concepts (id, role, description) VALUES ('ZEBRA', 'noun', 'a striped horse')").run();
    try {
      expect(isSeededConcept('ZEBRA')).toBe(true);
      expect(lookupLexicalEntry('ZEBRA', 'en')).toBeUndefined();
    } finally {
      db.prepare("DELETE FROM semantic_concepts WHERE id = 'ZEBRA'").run();
    }
  });
});

describe('notingLookup', () => {
  test('answers a seeded concept as the lexicon does, noting nothing', () => {
    const { lookup, unknown } = notingLookup();
    expect(lookup('CAT', 'en')).toBe(lookupLexicalEntry('CAT', 'en'));
    expect(unknown.size).toBe(0);
  });

  test('notes each unseeded id once, and answers it with nothing', () => {
    const { lookup, unknown } = notingLookup();
    expect(lookup('UNICORN', 'en')).toBeUndefined();
    lookup('UNICORN', 'ja');
    lookup('GRIFFIN', 'en');
    expect([...unknown]).toEqual(['UNICORN', 'GRIFFIN']);
  });

  test('does not note a seeded concept with no word in a language', () => {
    db.prepare("INSERT INTO semantic_concepts (id, role, description) VALUES ('ZEBRA', 'noun', 'a striped horse')").run();
    try {
      const { lookup, unknown } = notingLookup();
      expect(lookup('ZEBRA', 'en')).toBeUndefined();
      expect(unknown.size).toBe(0);
    } finally {
      db.prepare("DELETE FROM semantic_concepts WHERE id = 'ZEBRA'").run();
    }
  });

  test('keeps each lookup\'s notes to itself', () => {
    const first = notingLookup();
    first.lookup('UNICORN', 'en');
    expect(notingLookup().unknown.size).toBe(0);
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
