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

// Concepts seeded to support the B08 verb-definition catalogue on the infinitive render mode:
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

// CREATE — the genus verb of MAKE ("to create objects") and SET_ON_FIRE ("to create fire"), seeded
// for the B09 verb-definition task. Pinned across the persons, tenses and aspects its languages
// inflect: German erschaffen is strong (erschuf / erschaffen), Italian creare doubles its e in the
// future (creerà), and every Romance resultative selects HAVE.
describe('CREATE (genus of MAKE / SET_ON_FIRE)', () => {
  const create = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'CREATE', { directObject: np('FIRE'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(create())).toEqual({
      en: 'the dog creates the fire.',
      it: 'il cane crea il fuoco.',
      fr: 'le chien crée le feu.',
      de: 'der Hund erschafft das Feuer.',
      es: 'el perro crea el fuego.',
      ja: '犬は火を生み出します。',
      pt: 'o cão cria o fogo.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'CREATE', { directObject: np('FIRE') })))
      .toMatchObject({
        en: 'the dogs create the fire.',
        it: 'i cani creano il fuoco.',
        fr: 'les chiens créent le feu.',
        de: 'die Hunde erschaffen das Feuer.',
        es: 'los perros crean el fuego.',
        pt: 'os cães criam o fogo.',
      });
  });

  test('past tense', () => {
    expect(sayAll(create({ verbPhrase: { verb: 'CREATE', tense: 'past' } }))).toEqual({
      en: 'the dog created the fire.',
      it: 'il cane creò il fuoco.',
      fr: 'le chien créa le feu.',
      de: 'der Hund erschuf das Feuer.',
      es: 'el perro creó el fuego.',
      ja: '犬は火を生み出しました。',
      pt: 'o cão criou o fogo.',
    });
  });

  test('future tense', () => {
    expect(sayAll(create({ verbPhrase: { verb: 'CREATE', tense: 'future' } }))).toMatchObject({
      en: 'the dog will create the fire.',
      it: 'il cane creerà il fuoco.',
      fr: 'le chien créera le feu.',
      de: 'der Hund wird das Feuer erschaffen.',
      es: 'el perro creará el fuego.',
      pt: 'o cão criará o fogo.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'CREATE', { directObject: np('FIRE'), verbPhrase: { verb: 'CREATE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has created the fire.',
        it: 'il gatto ha creato il fuoco.',
        fr: 'le chat a créé le feu.',
        de: 'der Kater hat das Feuer erschaffen.',
        es: 'el gato ha creado el fuego.',
        ja: '猫は火を生み出してしまいます。',
        pt: 'o gato criou o fogo.', // pt present resultative is the pretérito (documented)
      });
  });

  test('progressive reads the gerund / te-form', () => {
    expect(sayAll(clause(np('CAT'), 'CREATE', { directObject: np('FIRE'), verbPhrase: { verb: 'CREATE', aspect: 'progressive' } })))
      .toEqual({
        en: 'the cat is creating the fire.',
        it: 'il gatto sta creando il fuoco.',
        fr: 'le chat est en train de créer le feu.',
        de: 'der Kater erschafft gerade das Feuer.',
        es: 'el gato está creando el fuego.',
        ja: '猫は火を生み出しています。',
        pt: 'o gato está criando o fogo.',
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

// The B08 verb definitions authored on the infinitive render mode: a verb's picker tooltip is now
// its localized dictionary gloss (infinitiveGloss(genus, differentia)), not the English literal.
// The differentia object renders bare (a mass noun: "food", "liquid"); French omits the partitive,
// the same simplification whoGloss makes for its bare objects.
describe('B08 verb definitions (infinitive citations)', () => {
  test('EAT → "to consume food"', () => {
    expect(definitionAll('EAT')).toEqual({
      en: 'to consume food.',
      it: 'consumare cibo.',
      fr: 'consommer nourriture.',
      de: 'Essen konsumieren.',
      es: 'consumir comida.',
      ja: '食べ物を摂取する。',
      pt: 'consumir comida.',
    });
  });

  test('DRINK → "to consume liquid"', () => {
    expect(definitionAll('DRINK')).toEqual({
      en: 'to consume liquid.',
      it: 'consumare liquido.',
      fr: 'consommer liquide.',
      de: 'Flüssigkeit konsumieren.',
      es: 'consumir líquido.',
      ja: '液体を摂取する。',
      pt: 'consumir líquido.',
    });
  });
});

// The B09 creation-verb definitions on the CREATE genus. MAKE's differentia is a count noun, so it
// is passed plural — a bare singular "to create object" is ungrammatical — while FIRE stays singular
// the way FOOD and LIQUID do.
describe('B09 verb definitions (CREATE genus)', () => {
  test('MAKE → "to create objects"', () => {
    expect(definitionAll('MAKE')).toEqual({
      en: 'to create objects.',
      it: 'creare oggetti.',
      fr: 'créer objets.',
      de: 'Gegenstände erschaffen.',
      es: 'crear objetos.',
      ja: '物体を生み出す。',
      pt: 'criar objetos.',
    });
  });

  test('SET_ON_FIRE → "to create fire"', () => {
    expect(definitionAll('SET_ON_FIRE')).toEqual({
      en: 'to create fire.',
      it: 'creare fuoco.',
      fr: 'créer feu.',
      de: 'Feuer erschaffen.',
      es: 'crear fuego.',
      ja: '火を生み出す。',
      pt: 'criar fogo.',
    });
  });
});
