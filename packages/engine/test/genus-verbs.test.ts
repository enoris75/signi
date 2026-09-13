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

// DESTROY — the genus verb of KILL ("to destroy life"), EXTINGUISH ("to destroy fire") and CLEAR
// ("to destroy content"), seeded for the B10 verb-definition task. Pinned across the persons, tenses
// and aspects its languages inflect: Italian distruggere has a strong remote past (distrusse) and
// participle (distrutto), German zerstören is inseparable (zerstört, no ge-), Spanish destruir
// inserts y (destruye / destruyó), and every Romance resultative selects HAVE.
describe('DESTROY (genus of KILL / EXTINGUISH / CLEAR)', () => {
  const destroy = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'DESTROY', { directObject: np('HOUSE'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(destroy())).toEqual({
      en: 'the dog destroys the house.',
      it: 'il cane distrugge la casa.',
      fr: 'le chien détruit la maison.',
      de: 'der Hund zerstört das Haus.',
      es: 'el perro destruye la casa.',
      ja: '犬は家を破壊します。',
      pt: 'o cão destrói a casa.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'DESTROY', { directObject: np('HOUSE') })))
      .toMatchObject({
        en: 'the dogs destroy the house.',
        it: 'i cani distruggono la casa.',
        fr: 'les chiens détruisent la maison.',
        de: 'die Hunde zerstören das Haus.',
        es: 'los perros destruyen la casa.',
        pt: 'os cães destroem a casa.',
      });
  });

  test('past tense', () => {
    expect(sayAll(destroy({ verbPhrase: { verb: 'DESTROY', tense: 'past' } }))).toEqual({
      en: 'the dog destroyed the house.',
      it: 'il cane distrusse la casa.',
      fr: 'le chien détruisit la maison.',
      de: 'der Hund zerstörte das Haus.',
      es: 'el perro destruyó la casa.',
      ja: '犬は家を破壊しました。',
      pt: 'o cão destruiu a casa.',
    });
  });

  test('future tense', () => {
    expect(sayAll(destroy({ verbPhrase: { verb: 'DESTROY', tense: 'future' } }))).toMatchObject({
      en: 'the dog will destroy the house.',
      it: 'il cane distruggerà la casa.',
      fr: 'le chien détruira la maison.',
      de: 'der Hund wird das Haus zerstören.',
      es: 'el perro destruirá la casa.',
      pt: 'o cão destruirá a casa.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'DESTROY', { directObject: np('HOUSE'), verbPhrase: { verb: 'DESTROY', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has destroyed the house.',
        it: 'il gatto ha distrutto la casa.',
        fr: 'le chat a détruit la maison.',
        de: 'der Kater hat das Haus zerstört.',
        es: 'el gato ha destruido la casa.',
        ja: '猫は家を破壊してしまいます。',
        pt: 'o gato destruiu a casa.', // pt present resultative is the pretérito (documented)
      });
  });

  test('progressive reads the gerund / te-form', () => {
    expect(sayAll(clause(np('CAT'), 'DESTROY', { directObject: np('HOUSE'), verbPhrase: { verb: 'DESTROY', aspect: 'progressive' } })))
      .toEqual({
        en: 'the cat is destroying the house.',
        it: 'il gatto sta distruggendo la casa.',
        fr: 'le chat est en train de détruire la maison.',
        de: 'der Kater zerstört gerade das Haus.',
        es: 'el gato está destruyendo la casa.',
        ja: '猫は家を破壊しています。',
        pt: 'o gato está destruindo a casa.',
      });
  });
});

// LIFE and CONTENT — the differentia nouns seeded for KILL's and CLEAR's definitions. Both are
// countable, so their plurals and gender agreement are pinned alongside the bare singular the
// glosses use.
describe('LIFE and CONTENT (B10 differentia nouns)', () => {
  test('LIFE — feminine in Romance, neuter German with an unchanged plural', () => {
    expect(sayAll({ subject: np('LIFE', { definiteness: 'definite' }) })).toEqual({
      en: 'the life.',
      it: 'la vita.',
      fr: 'la vie.',
      de: 'das Leben.',
      es: 'la vida.',
      ja: '生命。',
      pt: 'a vida.',
    });
    expect(sayAll({ subject: np('LIFE', { number: 'plural', definiteness: 'definite' }) })).toEqual({
      en: 'the lives.',
      it: 'le vite.',
      fr: 'les vies.',
      de: 'die Leben.',
      es: 'las vidas.',
      ja: '生命。',
      pt: 'as vidas.',
    });
  });

  test('CONTENT — masculine throughout, German Inhalt / Inhalte', () => {
    expect(sayAll({ subject: np('CONTENT', { definiteness: 'definite' }) })).toEqual({
      en: 'the content.',
      it: 'il contenuto.',
      fr: 'le contenu.',
      de: 'der Inhalt.',
      es: 'el contenido.',
      ja: '内容。',
      pt: 'o conteúdo.',
    });
    expect(sayAll({ subject: np('CONTENT', { number: 'plural', definiteness: 'definite' }) })).toEqual({
      en: 'the contents.',
      it: 'i contenuti.',
      fr: 'les contenus.',
      de: 'die Inhalte.',
      es: 'los contenidos.',
      ja: '内容。',
      pt: 'os conteúdos.',
    });
  });
});

// PERCEIVE — the genus verb of SEE ("to perceive light"), seeded for the B11 verb-definition task.
// Pinned across the persons, tenses and aspects its languages inflect: Italian percepire takes the
// -isc- infix (percepisce / percepiscono), French percevoir the cedilla before o/u (perçoit /
// perçut / perçu), German empfinden is strong and inseparable (empfand / empfunden, no ge-), and
// every Romance resultative selects HAVE.
describe('PERCEIVE (genus of SEE)', () => {
  const perceive = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'PERCEIVE', { directObject: np('LIGHT'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(perceive())).toEqual({
      en: 'the dog perceives the light.',
      it: 'il cane percepisce la luce.',
      fr: 'le chien perçoit la lumière.',
      de: 'der Hund empfindet das Licht.',
      es: 'el perro percibe la luz.',
      ja: '犬は光を知覚します。',
      pt: 'o cão percebe a luz.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'PERCEIVE', { directObject: np('LIGHT') })))
      .toMatchObject({
        en: 'the dogs perceive the light.',
        it: 'i cani percepiscono la luce.',
        fr: 'les chiens perçoivent la lumière.',
        de: 'die Hunde empfinden das Licht.',
        es: 'los perros perciben la luz.',
        pt: 'os cães percebem a luz.',
      });
  });

  test('past tense', () => {
    expect(sayAll(perceive({ verbPhrase: { verb: 'PERCEIVE', tense: 'past' } }))).toEqual({
      en: 'the dog perceived the light.',
      it: 'il cane percepì la luce.',
      fr: 'le chien perçut la lumière.',
      de: 'der Hund empfand das Licht.',
      es: 'el perro percibió la luz.',
      ja: '犬は光を知覚しました。',
      pt: 'o cão percebeu a luz.',
    });
  });

  test('future tense', () => {
    expect(sayAll(perceive({ verbPhrase: { verb: 'PERCEIVE', tense: 'future' } }))).toMatchObject({
      en: 'the dog will perceive the light.',
      it: 'il cane percepirà la luce.',
      fr: 'le chien percevra la lumière.',
      de: 'der Hund wird das Licht empfinden.',
      es: 'el perro percibirá la luz.',
      pt: 'o cão perceberá a luz.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'PERCEIVE', { directObject: np('LIGHT'), verbPhrase: { verb: 'PERCEIVE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has perceived the light.',
        it: 'il gatto ha percepito la luce.',
        fr: 'le chat a perçu la lumière.',
        de: 'der Kater hat das Licht empfunden.',
        es: 'el gato ha percibido la luz.',
        ja: '猫は光を知覚してしまいます。',
        pt: 'o gato percebeu a luz.', // pt present resultative is the pretérito (documented)
      });
  });

  test('progressive reads the gerund / te-form', () => {
    expect(sayAll(clause(np('CAT'), 'PERCEIVE', { directObject: np('LIGHT'), verbPhrase: { verb: 'PERCEIVE', aspect: 'progressive' } })))
      .toEqual({
        en: 'the cat is perceiving the light.',
        it: 'il gatto sta percependo la luce.',
        fr: 'le chat est en train de percevoir la lumière.',
        de: 'der Kater empfindet gerade das Licht.',
        es: 'el gato está percibiendo la luz.',
        ja: '猫は光を知覚しています。',
        pt: 'o gato está percebendo a luz.',
      });
  });
});

// UNDERSTAND — the genus verb of KNOW ("to understand concepts") and READ ("to understand written
// words"), seeded for the B11 verb-definition task. Italian comprendere has a strong remote past
// (comprese) and participle (compreso), French comprendre doubles its n in the 3pl (comprennent),
// English is irregular (understood), and German verstehen is strong and inseparable (verstand /
// verstanden).
describe('UNDERSTAND (genus of KNOW / READ)', () => {
  const understand = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'UNDERSTAND', { directObject: np('WORD'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(understand())).toEqual({
      en: 'the dog understands the word.',
      it: 'il cane comprende la parola.',
      fr: 'le chien comprend le mot.',
      de: 'der Hund versteht das Wort.',
      es: 'el perro comprende la palabra.',
      ja: '犬は単語を理解します。',
      pt: 'o cão compreende a palavra.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'UNDERSTAND', { directObject: np('WORD') })))
      .toMatchObject({
        en: 'the dogs understand the word.',
        it: 'i cani comprendono la parola.',
        fr: 'les chiens comprennent le mot.',
        de: 'die Hunde verstehen das Wort.',
        es: 'los perros comprenden la palabra.',
        pt: 'os cães compreendem a palavra.',
      });
  });

  test('past tense', () => {
    expect(sayAll(understand({ verbPhrase: { verb: 'UNDERSTAND', tense: 'past' } }))).toEqual({
      en: 'the dog understood the word.',
      it: 'il cane comprese la parola.',
      fr: 'le chien comprit le mot.',
      de: 'der Hund verstand das Wort.',
      es: 'el perro comprendió la palabra.',
      ja: '犬は単語を理解しました。',
      pt: 'o cão compreendeu a palavra.',
    });
  });

  test('future tense', () => {
    expect(sayAll(understand({ verbPhrase: { verb: 'UNDERSTAND', tense: 'future' } }))).toMatchObject({
      en: 'the dog will understand the word.',
      it: 'il cane comprenderà la parola.',
      fr: 'le chien comprendra le mot.',
      de: 'der Hund wird das Wort verstehen.',
      es: 'el perro comprenderá la palabra.',
      pt: 'o cão compreenderá a palavra.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'UNDERSTAND', { directObject: np('WORD'), verbPhrase: { verb: 'UNDERSTAND', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has understood the word.',
        it: 'il gatto ha compreso la parola.',
        fr: 'le chat a compris le mot.',
        de: 'der Kater hat das Wort verstanden.',
        es: 'el gato ha comprendido la palabra.',
        ja: '猫は単語を理解してしまいます。',
        pt: 'o gato compreendeu a palavra.', // pt present resultative is the pretérito (documented)
      });
  });

  test('progressive reads the gerund / te-form', () => {
    expect(sayAll(clause(np('CAT'), 'UNDERSTAND', { directObject: np('WORD'), verbPhrase: { verb: 'UNDERSTAND', aspect: 'progressive' } })))
      .toEqual({
        en: 'the cat is understanding the word.',
        it: 'il gatto sta comprendendo la parola.',
        fr: 'le chat est en train de comprendre le mot.',
        de: 'der Kater versteht gerade das Wort.',
        es: 'el gato está comprendiendo la palabra.',
        ja: '猫は単語を理解しています。',
        pt: 'o gato está compreendendo a palavra.',
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

// The B10 destruction-verb definitions on the DESTROY genus. All three differentiae render
// bare-singular: FIRE the way B09's SET_ON_FIRE does, and LIFE and CONTENT in their mass sense.
describe('B10 verb definitions (DESTROY genus)', () => {
  test('KILL → "to destroy life"', () => {
    expect(definitionAll('KILL')).toEqual({
      en: 'to destroy life.',
      it: 'distruggere vita.',
      fr: 'détruire vie.',
      de: 'Leben zerstören.',
      es: 'destruir vida.',
      ja: '生命を破壊する。',
      pt: 'destruir vida.',
    });
  });

  test('EXTINGUISH → "to destroy fire"', () => {
    expect(definitionAll('EXTINGUISH')).toEqual({
      en: 'to destroy fire.',
      it: 'distruggere fuoco.',
      fr: 'détruire feu.',
      de: 'Feuer zerstören.',
      es: 'destruir fuego.',
      ja: '火を破壊する。',
      pt: 'destruir fogo.',
    });
  });

  test('CLEAR → "to destroy content"', () => {
    expect(definitionAll('CLEAR')).toEqual({
      en: 'to destroy content.',
      it: 'distruggere contenuto.',
      fr: 'détruire contenu.',
      de: 'Inhalt zerstören.',
      es: 'destruir contenido.',
      ja: '内容を破壊する。',
      pt: 'destruir conteúdo.',
    });
  });
});

// The B11 perception- and cognition-verb definitions, on the PERCEIVE and UNDERSTAND genera. LIGHT
// stays bare-singular in its mass sense; CONCEPT and WORD are count nouns, so they are passed plural.
// READ is the first gloss whose differentia carries an adjective (WRITTEN), which infinitiveGloss
// threads onto the bare object — agreeing in Romance, strong-declined in German, and verb-derived
// with no linker in Japanese.
describe('B11 verb definitions (PERCEIVE / UNDERSTAND genera)', () => {
  test('SEE → "to perceive light"', () => {
    expect(definitionAll('SEE')).toEqual({
      en: 'to perceive light.',
      it: 'percepire luce.',
      fr: 'percevoir lumière.',
      de: 'Licht empfinden.',
      es: 'percibir luz.',
      ja: '光を知覚する。',
      pt: 'perceber luz.',
    });
  });

  test('KNOW → "to understand concepts"', () => {
    expect(definitionAll('KNOW')).toEqual({
      en: 'to understand concepts.',
      it: 'comprendere concetti.',
      fr: 'comprendre concepts.',
      de: 'Begriffe verstehen.',
      es: 'comprender conceptos.',
      ja: '概念を理解する。',
      pt: 'compreender conceitos.',
    });
  });

  test('READ → "to understand written words"', () => {
    expect(definitionAll('READ')).toEqual({
      en: 'to understand written words.',
      it: 'comprendere parole scritte.',
      fr: 'comprendre mots écrits.',
      de: 'geschriebene Wörter verstehen.',
      es: 'comprender palabras escritas.',
      ja: '書かれた単語を理解する。',
      pt: 'compreender palavras escritas.',
    });
  });
});
