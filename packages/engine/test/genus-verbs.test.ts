import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

// Concepts seeded to support the C01 verb-definition catalogue on the infinitive render mode:
//   · CONSUME — the genus verb of EAT ("to consume food") and DRINK ("to consume liquid"), the
//     verb their dictionary definitions cite as their genus.
//   · INFINITIVE_PHRASE — the grammar meta-noun naming the infinitive / citation mode itself.
// Both are pinned here so a later refactor can't silently break the paradigm the definitions lean on.

describe('CONSUME (genus of EAT / DRINK)', () => {
  const consume = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'CONSUME', { directObject: np('FOOD'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(consume())).toEqual({
      en: 'the dog consumes the food.',
      it: 'il cane consuma il cibo.',
      fr: 'le chien consomme la nourriture.',
      de: 'der Hund konsumiert das Essen.',
      es: 'el perro consume la comida.',
      ja: '犬は食べ物を摂取します。',
      pt: 'o cão consome a comida.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'CONSUME', { directObject: np('FOOD') })))
      .toMatchObject({
        it: 'i cani consumano il cibo.',
        es: 'los perros consumen la comida.',
        pt: 'os cães consomem a comida.',
      });
  });

  test('past tense', () => {
    expect(sayAll(consume({ verbPhrase: { verb: 'CONSUME', tense: 'past' } }))).toMatchObject({
      en: 'the dog consumed the food.',
      it: 'il cane consumò il cibo.',
      fr: 'le chien consomma la nourriture.',
      de: 'der Hund konsumierte das Essen.',
      es: 'el perro consumió la comida.',
      pt: 'o cão consumiu a comida.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'CONSUME', { directObject: np('FOOD'), verbPhrase: { verb: 'CONSUME', aspect: 'resultative' } })))
      .toMatchObject({
        en: 'the cat has consumed the food.',
        it: 'il gatto ha consumato il cibo.',
        fr: 'le chat a consommé la nourriture.',
        de: 'der Kater hat das Essen konsumiert.',
        es: 'el gato ha consumido la comida.',
        pt: 'o gato consumiu a comida.', // pt present resultative is the pretérito (documented)
      });
  });

  // The reason CONSUME was seeded: its dictionary citation "to consume food", the shape a verb
  // definition takes on the infinitive render mode.
  test('renders as an infinitive citation', () => {
    expect(sayAll({
      subject: np('GENERIC_PERSON'),
      verbPhrase: { verb: 'CONSUME' },
      directObject: np('FOOD'),
      infinitive: true,
    })).toEqual({
      en: 'to consume the food.',
      it: 'consumare il cibo.',
      fr: 'consommer la nourriture.',
      de: 'das Essen konsumieren.',
      es: 'consumir la comida.',
      ja: '食べ物を摂取する。',
      pt: 'consumir a comida.',
    });
  });
});

describe('INFINITIVE_PHRASE (grammar meta-noun)', () => {
  test('the noun surface, with gender agreement', () => {
    expect(sayAll({ subject: np('INFINITIVE_PHRASE', { definiteness: 'definite' }) })).toEqual({
      en: 'the infinitive phrase.',
      it: 'la frase infinitiva.',
      fr: 'la proposition infinitive.',
      de: 'die Infinitivphrase.',
      es: 'la frase de infinitivo.',
      ja: '不定詞句。',
      pt: 'a frase infinitiva.',
    });
  });

  test('pluralises and keeps agreement', () => {
    expect(sayAll({ subject: np('INFINITIVE_PHRASE', { number: 'plural', definiteness: 'definite' }) }))
      .toMatchObject({
        en: 'the infinitive phrases.',
        it: 'le frasi infinitive.',
        fr: 'les propositions infinitives.',
        de: 'die Infinitivphrasen.',
        es: 'las frases de infinitivo.',
        pt: 'as frases infinitivas.',
      });
  });

  // Its own picker tooltip — engine-composed like the other part-of-speech grammar nouns, and
  // rendered by the backend's boot-time definition builder into all seven languages.
  test('composes its definition — "a phrase that names actions"', () => {
    expect(definitionAll('INFINITIVE_PHRASE')).toMatchObject({
      en: 'a phrase that names actions.',
      it: 'una frase che nomina azioni.',
      de: 'eine Phrase, die Handlungen benennt.',
      es: 'una frase que nombra acciones.',
      pt: 'uma frase que nomeia ações.',
    });
  });
});
