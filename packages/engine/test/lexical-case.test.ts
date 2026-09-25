import { describe, expect, test } from 'vitest';
import type { LanguageCode, ReadyLanguageCode } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C35: the case a verb governs its object in, which no rule predicts and the lexeme
// therefore names. German *helfen* takes the dative where its six translations take an ordinary
// object, and *fragen* takes the person asked in the accusative where every other addressee verb
// takes the dative. Both keys are read by the German engine alone.

const seed = (id: string) => concepts.find((c) => c.id === id);

describe('HELP_VERB: a verb whose German object is dative', () => {
  test('the seven renderings of "the cat helps the dog"', () => {
    expect(sayAll(clause(np('CAT'), 'HELP_VERB', { directObject: np('DOG') }))).toEqual({
      en: 'the cat helps the dog.', it: 'il gatto aiuta il cane.', fr: 'le chat aide le chien.',
      // Spanish *ayudar* takes the one helped with the personal *a*, whoever it is (P09-E43, `object_a`).
      de: 'der Kater hilft dem Hund.', es: 'el gato ayuda al perro.', ja: '猫は犬を手伝います。',
      pt: 'o gato ajuda o cão.',
    });
  });

  // Everything the German object declines for reads the key: the article and the adjectives after
  // it, the negative "kein", an unstressed pronoun, and the dative plural -n.
  test('the article, its adjectives, "kein", a pronoun and the dative plural all decline', () => {
    expect(say(clause(np('CAT'), 'HELP_VERB', {
      directObject: np('DOG', { definiteness: 'indefinite', adjectives: ['BIG'] }),
    }), 'de')).toBe('der Kater hilft einem großen Hund.');
    expect(say(clause(np('CAT'), 'HELP_VERB', {
      verbPhrase: { negative: true }, directObject: np('DOG', { definiteness: 'indefinite' }),
    }), 'de')).toBe('der Kater hilft keinem Hund.');
    expect(say(clause(np('CAT'), 'HELP_VERB', {
      directObject: np('THIRD_PERSON', { antecedent: 'DOG' }),
    }), 'de')).toBe('der Kater hilft ihm.');
    expect(say(clause(np('CAT'), 'HELP_VERB', {
      directObject: np('DOG', { number: 'plural' }),
    }), 'de')).toBe('der Kater hilft den Hunden.');
  });

  test('the relative pronoun of a gapped object takes the dative too', () => {
    expect(sayAll({ subject: np('DOG', { relative: {
      headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'HELP_VERB' },
    } }) })).toMatchObject({
      de: 'der Hund, dem man hilft.',
      en: 'the dog that one helps.', fr: "le chien qu'on aide.",
    });
  });

  // A dative verb has nothing to promote into the nominative, so German's passive is impersonal:
  // the patient keeps the dative and "werden" stands in the 3rd singular. The other six promote it.
  test('the passive is impersonal in German and personal everywhere else', () => {
    expect(sayAll(clause(np('CAT'), 'HELP_VERB', {
      verbPhrase: { voice: 'passive' }, directObject: np('DOG'),
    }))).toEqual({
      en: 'the dog is helped by the cat.', it: 'il cane è aiutato dal gatto.',
      fr: 'le chien est aidé par le chat.', de: 'dem Hund wird vom Kater geholfen.',
      es: 'el perro es ayudado por el gato.', ja: '犬は猫に手伝われます。', pt: 'o cão é ajudado pelo gato.',
    });
    // Plural: "werden" does NOT follow the patient into the plural — "den Hunden wird geholfen".
    expect(say(clause(np('CAT'), 'HELP_VERB', {
      verbPhrase: { voice: 'passive' }, directObject: np('DOG', { number: 'plural' }),
    }), 'de')).toBe('den Hunden wird vom Kater geholfen.');
  });

  test('the strong present and preterite, and the du command', () => {
    expect(say(clause(np('CAT'), 'HELP_VERB', { verbPhrase: { tense: 'past' }, directObject: np('DOG') }), 'de'))
      .toBe('der Kater half dem Hund.');
    expect(say(clause(np('SECOND_PERSON'), 'HELP_VERB', { directObject: np('DOG'), imperative: true }), 'de'))
      .toBe('hilf dem Hund.');
  });

  // The key is German's alone. Against the same frame on an ordinary accusative verb, only German
  // spells its object differently; the other five say the object word for word as they always do.
  // Spanish is the one other that moves, and not for a case: *ayudar* takes the personal *a* for
  // any object (`object_a`, P09-E43), "ayuda al perro" beside "ve el perro".
  test('no other language moves, against the same frame on an accusative verb', () => {
    const helping = sayAll(clause(np('CAT'), 'HELP_VERB', { directObject: np('DOG') }));
    const seeing = sayAll(clause(np('CAT'), 'SEE', { directObject: np('DOG') }));
    const object: Record<ReadyLanguageCode, string> = {
      en: 'the dog', it: 'il cane', fr: 'le chien', de: 'dem Hund', es: 'el perro', ja: '犬を', pt: 'o cão',
    };
    expect(helping.es).toContain('al perro');
    expect(seeing.es).toContain('el perro');
    for (const lang of ['en', 'it', 'fr', 'ja', 'pt'] as ReadyLanguageCode[]) {
      expect(helping[lang], lang).toContain(object[lang]);
      expect(seeing[lang], lang).toContain(object[lang]);
    }
    expect(helping.de).toContain('dem Hund');
    expect(seeing.de).toContain('den Hund');
  });

  // No gloss: nothing in the corpus tells helping apart from acting together or from giving
  // strength — see docs/localization/done/C35-lexical-object-case.md.
  test('HELP_VERB stays on the literal', () => {
    expect(seed('HELP_VERB')?.definition).toBeUndefined();
    expect(seed('HELP_VERB')?.description).toBe('to make what another does easier');
  });
});

describe('ASK: a verb whose German addressee is accusative', () => {
  test('fragen asks the person, not to the person', () => {
    expect(say(clause(np('CAT'), 'ASK', { complements: { terminus: { phrase: np('MAN') } } }), 'de'))
      .toBe('der Kater fragt den Mann.');
    expect(say(clause(np('CAT'), 'ASK', {
      directObject: np('FACT'), complements: { terminus: { phrase: np('MAN') } },
    }), 'de')).toBe('der Kater fragt den Mann nach der Tatsache.');
    expect(say({ subject: np('MAN', { relative: {
      headRole: 'terminus', subject: np('CAT'), verbPhrase: { verb: 'ASK' },
    } }) }, 'de')).toBe('der Mann, den der Kater fragt.');
  });

  test('every other addressee verb keeps the dative', () => {
    expect(say(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'), complements: { terminus: { phrase: np('MAN') } },
    }), 'de')).toBe('der Kater gibt dem Mann das Buch.');
  });
});
