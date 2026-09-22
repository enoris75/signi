import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { infinitiveGloss } from '../../backend/src/concepts/verbs/gloss.js';

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
        ja: '猫は火を生み出しました。',
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
        ja: '猫は家を破壊しました。',
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
        ja: '猫は光を知覚しました。',
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
        ja: '猫は単語を理解しました。',
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

// ── Genus verbs for the B12–B18 verb definitions ────────────────────────────────────────────────
// Twelve genus verbs seeded ahead of their definitions, each pinned the way DESTROY, PERCEIVE and
// UNDERSTAND are: present across every language, a plural subject, the past, and the resultative's
// auxiliary + participle. The irregular ones also pin the forms the engine derives from stored stems
// and had to override — the imperative (mood.ts's IT_IMP_OVERRIDE / ES_IMP_OVERRIDE /
// ES_SUBJ_OVERRIDE, German `2sg_imperative`) and the hypothetical conditional (IT_SUBJ_STEM).

/** A command addressed to `addressee` (2sg / 1pl / 2pl), as imperative.test.ts builds them. */
const command = (verb: string, object: string, addressee: NounPhrase, negative = false): PhrasePlan => ({
  ...clause(addressee, verb, { directObject: np(object), verbPhrase: { negative } }),
  imperative: true,
});

/** A hypothetical with `verb` in both clauses: conditional main clause, subjunctive if clause. */
const hypothetical = (verb: string, object: string, main = np('DOG'), ifSubject = np('CAT')): PhrasePlan => ({
  ...clause(main, verb, { directObject: np(object) }),
  condition: clause(ifSubject, verb, { directObject: np(object) }),
});

const YOU = np('SECOND_PERSON');
const WE = np('FIRST_PERSON', { number: 'plural' });
const YOU_ALL = np('SECOND_PERSON', { number: 'plural' });

// HAVE — the genus verb of OWN and HOLD (B12). The most irregular verb of the batch: English has /
// had, Italian ho / ebbe / avrà / avuto, French a / eut / aura / eu, Spanish and Portuguese take the
// lexical tener / ter (tiene / tuvo, tem / teve), German hat / hatte / gehabt. Its commands are
// suppletive in Italian (abbi / abbiate), French (aie / ayons / ayez) and Spanish (ten).
describe('HAVE (genus of OWN / HOLD)', () => {
  const have = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'HAVE', { directObject: np('MONEY'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(have())).toEqual({
      en: 'the dog has the money.',
      it: 'il cane ha il denaro.',
      fr: "le chien a l'argent.",
      de: 'der Hund hat das Geld.',
      es: 'el perro tiene el dinero.',
      ja: '犬はお金を持っています。',
      pt: 'o cão tem o dinheiro.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'HAVE', { directObject: np('MONEY') })))
      .toMatchObject({
        en: 'the dogs have the money.',
        it: 'i cani hanno il denaro.',
        fr: "les chiens ont l'argent.",
        de: 'die Hunde haben das Geld.',
        es: 'los perros tienen el dinero.',
        pt: 'os cães têm o dinheiro.',
      });
  });

  test('past tense', () => {
    expect(sayAll(have({ verbPhrase: { verb: 'HAVE', tense: 'past' } }))).toEqual({
      en: 'the dog had the money.',
      it: 'il cane aveva il denaro.',
      fr: "le chien avait l'argent.",
      de: 'der Hund hatte das Geld.',
      es: 'el perro tenía el dinero.',
      ja: '犬はお金を持っていました。',
      pt: 'o cão tinha o dinheiro.',
    });
  });

  test('future tense', () => {
    expect(sayAll(have({ verbPhrase: { verb: 'HAVE', tense: 'future' } }))).toMatchObject({
      en: 'the dog will have the money.',
      it: 'il cane avrà il denaro.',
      fr: "le chien aura l'argent.",
      de: 'der Hund wird das Geld haben.',
      es: 'el perro tendrá el dinero.',
      pt: 'o cão terá o dinheiro.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'HAVE', { directObject: np('MONEY'), verbPhrase: { verb: 'HAVE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has had the money.',
        it: 'il gatto ha avuto il denaro.',
        fr: "le chat a eu l'argent.",
        de: 'der Kater hat das Geld gehabt.',
        es: 'el gato ha tenido el dinero.',
        ja: '猫はお金を持っていました。',
        pt: 'o gato teve o dinheiro.', // pt present resultative is the pretérito (documented)
      });
  });

  test('commands take the irregular imperative (abbi / aie / ten / hab), affirmative and negative', () => {
    expect(sayAll(command('HAVE', 'MONEY', YOU))).toEqual({
      en: 'have the money.',
      it: 'abbi il denaro.',
      fr: "aie l'argent.",
      de: 'hab das Geld.',
      es: 'ten el dinero.',
      ja: 'お金を持ってください。',
      pt: 'tenha o dinheiro.',
    });
    expect(sayAll(command('HAVE', 'MONEY', WE))).toEqual({
      en: "let's have the money.",
      it: 'abbiamo il denaro.',
      fr: "ayons l'argent.",
      de: 'haben wir das Geld.',
      es: 'tengamos el dinero.',
      ja: 'お金を持ちましょう。',
      pt: 'tenhamos o dinheiro.',
    });
    expect(sayAll(command('HAVE', 'MONEY', YOU_ALL))).toEqual({
      en: 'have the money.',
      it: 'abbiate il denaro.',
      fr: "ayez l'argent.",
      de: 'habt das Geld.',
      es: 'tened el dinero.',
      ja: 'お金を持ってください。',
      pt: 'tenham o dinheiro.',
    });
    expect(sayAll(command('HAVE', 'MONEY', YOU, true))).toEqual({
      en: 'do not have the money.',
      it: 'non avere il denaro.',
      fr: "n'aie pas l'argent.",
      de: 'hab das Geld nicht.',
      es: 'no tengas el dinero.',
      ja: 'お金を持つな。',
      pt: 'não tenha o dinheiro.',
    });
    expect(sayAll(command('HAVE', 'MONEY', YOU_ALL, true))).toEqual({
      en: 'do not have the money.',
      it: 'non abbiate il denaro.',
      fr: "n'ayez pas l'argent.",
      de: 'habt das Geld nicht.',
      es: 'no tengáis el dinero.',
      ja: 'お金を持つな。',
      pt: 'não tenham o dinheiro.',
    });
  });

  test('an instruction labels with the infinitive, or the Italian tu command', () => {
    expect(sayAll({ ...command('HAVE', 'MONEY', YOU), imperativeRegister: 'instruction' })).toEqual({
      en: 'have the money.',
      it: 'abbi il denaro.',
      fr: "avoir l'argent.",
      de: 'das Geld haben.',
      es: 'tener el dinero.',
      ja: 'お金を持ち。',
      pt: 'ter o dinheiro.',
    });
  });

  test('hypothetical: subjunctive if clause, conditional main clause', () => {
    expect(sayAll(hypothetical('HAVE', 'MONEY'))).toEqual({
      en: 'if the cat had the money, the dog would have the money.',
      it: 'se il gatto avesse il denaro, il cane avrebbe il denaro.',
      fr: "si le chat avait l'argent, le chien aurait l'argent.",
      de: 'wenn der Kater das Geld haben würde, würde der Hund das Geld haben.',
      es: 'si el gato tuviera el dinero, el perro tendría el dinero.',
      ja: 'もし猫がお金を持っていたら、犬はお金を持っています。',
      pt: 'se o gato tivesse o dinheiro, o cão teria o dinheiro.',
    });
    expect(sayAll(hypothetical('HAVE', 'MONEY', WE, YOU_ALL))).toMatchObject({
      it: 'se aveste il denaro, avremmo il denaro.',
      fr: "si vous aviez l'argent, nous aurions l'argent.",
      es: 'si tuvierais el dinero, tendríamos el dinero.',
      pt: 'se tivessem o dinheiro, teríamos o dinheiro.',
    });
  });
});

// ACQUIRE — the genus verb of BUY ("to acquire in exchange for money", B12). Italian acquisire takes
// the -isc- infix (acquisisce), French acquérir is irregular (acquiert / acquit / acquis), German
// erwerben is strong (erwirbt / erwarb / erworben) with the du command erwirb, and Spanish adquirir
// diphthongs only under stress, so its 1pl / 2pl subjunctive keeps the i (adquiramos, not
// *adquieramos).
describe('ACQUIRE (genus of BUY)', () => {
  const acquire = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'ACQUIRE', { directObject: np('BOOK'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(acquire())).toEqual({
      en: 'the dog acquires the book.',
      it: 'il cane acquisisce il libro.',
      fr: 'le chien acquiert le livre.',
      de: 'der Hund erwirbt das Buch.',
      es: 'el perro adquiere el libro.',
      ja: '犬は本を取得します。',
      pt: 'o cão adquire o livro.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'ACQUIRE', { directObject: np('BOOK') })))
      .toMatchObject({
        en: 'the dogs acquire the book.',
        it: 'i cani acquisiscono il libro.',
        fr: 'les chiens acquièrent le livre.',
        de: 'die Hunde erwerben das Buch.',
        es: 'los perros adquieren el libro.',
        pt: 'os cães adquirem o livro.',
      });
  });

  test('past tense', () => {
    expect(sayAll(acquire({ verbPhrase: { verb: 'ACQUIRE', tense: 'past' } }))).toEqual({
      en: 'the dog acquired the book.',
      it: 'il cane acquisì il libro.',
      fr: 'le chien acquit le livre.',
      de: 'der Hund erwarb das Buch.',
      es: 'el perro adquirió el libro.',
      ja: '犬は本を取得しました。',
      pt: 'o cão adquiriu o livro.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'ACQUIRE', { directObject: np('BOOK'), verbPhrase: { verb: 'ACQUIRE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has acquired the book.',
        it: 'il gatto ha acquisito il libro.',
        fr: 'le chat a acquis le livre.',
        de: 'der Kater hat das Buch erworben.',
        es: 'el gato ha adquirido el libro.',
        ja: '猫は本を取得しました。',
        pt: 'o gato adquiriu o livro.', // pt present resultative is the pretérito (documented)
      });
  });

  test('commands keep the strong du form and the Spanish unstressed stem', () => {
    expect(sayAll(command('ACQUIRE', 'BOOK', YOU))).toEqual({
      en: 'acquire the book.',
      it: 'acquisisci il libro.',
      fr: 'acquiers le livre.',
      de: 'erwirb das Buch.',
      es: 'adquiere el libro.',
      ja: '本を取得してください。',
      pt: 'adquira o livro.',
    });
    expect(sayAll(command('ACQUIRE', 'BOOK', WE))).toEqual({
      en: "let's acquire the book.",
      it: 'acquisiamo il libro.',
      fr: 'acquérons le livre.',
      de: 'erwerben wir das Buch.',
      es: 'adquiramos el libro.',
      ja: '本を取得しましょう。',
      pt: 'adquiramos o livro.',
    });
    expect(sayAll(command('ACQUIRE', 'BOOK', YOU_ALL, true))).toEqual({
      en: 'do not acquire the book.',
      it: 'non acquisite il libro.',
      fr: "n'acquérez pas le livre.",
      de: 'erwerbt das Buch nicht.',
      es: 'no adquiráis el libro.',
      ja: '本を取得するな。',
      pt: 'não adquiram o livro.',
    });
  });

  test("takes an instrumental complement (the shape BUY's definition will use)", () => {
    expect(sayAll(clause(np('BOY'), 'ACQUIRE', { directObject: np('BOOK'), complements: { instrumental: { phrase: np('MONEY') } } })))
      .toEqual({
        en: 'the boy acquires the book with the money.',
        it: 'il ragazzo acquisisce il libro con il denaro.',
        fr: "le garçon acquiert le livre avec l'argent.",
        de: 'der Junge erwirbt das Buch mit dem Geld.',
        es: 'el niño adquiere el libro con el dinero.',
        ja: '男の子はお金で本を取得します。',
        pt: 'o menino adquire o livro com o dinheiro.',
      });
  });

  test('hypothetical: subjunctive if clause, conditional main clause', () => {
    expect(sayAll(hypothetical('ACQUIRE', 'BOOK'))).toEqual({
      en: 'if the cat acquired the book, the dog would acquire the book.',
      it: 'se il gatto acquisisse il libro, il cane acquisirebbe il libro.',
      fr: 'si le chat acquérait le livre, le chien acquerrait le livre.',
      de: 'wenn der Kater das Buch erwerben würde, würde der Hund das Buch erwerben.',
      es: 'si el gato adquiriera el libro, el perro adquiriría el libro.',
      ja: 'もし猫が本を取得したら、犬は本を取得します。',
      pt: 'se o gato adquirisse o livro, o cão adquiriria o livro.',
    });
  });
});

// DIVIDE — the genus verb of CUT (B13). Italian dividere has a strong remote past (divise) and
// participle (diviso); German takes the plain teilen (geteilt), not the separable aufteilen.
describe('DIVIDE (genus of CUT)', () => {
  const divide = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'DIVIDE', { directObject: np('FOOD'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(divide())).toEqual({
      en: 'the dog divides the food.',
      it: 'il cane divide il cibo.',
      fr: 'le chien divise la nourriture.',
      de: 'der Hund teilt das Essen.',
      es: 'el perro divide la comida.',
      ja: '犬は食べ物を分けます。',
      pt: 'o cão divide a comida.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'DIVIDE', { directObject: np('FOOD') })))
      .toMatchObject({
        en: 'the dogs divide the food.',
        it: 'i cani dividono il cibo.',
        fr: 'les chiens divisent la nourriture.',
        de: 'die Hunde teilen das Essen.',
        es: 'los perros dividen la comida.',
        pt: 'os cães dividem a comida.',
      });
  });

  test('past tense', () => {
    expect(sayAll(divide({ verbPhrase: { verb: 'DIVIDE', tense: 'past' } }))).toEqual({
      en: 'the dog divided the food.',
      it: 'il cane divise il cibo.',
      fr: 'le chien divisa la nourriture.',
      de: 'der Hund teilte das Essen.',
      es: 'el perro dividió la comida.',
      ja: '犬は食べ物を分けました。',
      pt: 'o cão dividiu a comida.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'DIVIDE', { directObject: np('FOOD'), verbPhrase: { verb: 'DIVIDE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has divided the food.',
        it: 'il gatto ha diviso il cibo.',
        fr: 'le chat a divisé la nourriture.',
        de: 'der Kater hat das Essen geteilt.',
        es: 'el gato ha dividido la comida.',
        ja: '猫は食べ物を分けました。',
        pt: 'o gato dividiu a comida.', // pt present resultative is the pretérito (documented)
      });
  });

  test("takes an instrumental complement (the shape CUT's definition will use)", () => {
    expect(sayAll(clause(np('BOY'), 'DIVIDE', { directObject: np('FOOD'), complements: { instrumental: { phrase: np('STICK') } } })))
      .toEqual({
        en: 'the boy divides the food with the stick.',
        it: 'il ragazzo divide il cibo con il bastone.',
        fr: 'le garçon divise la nourriture avec le bâton.',
        de: 'der Junge teilt das Essen mit dem Stock.',
        es: 'el niño divide la comida con el palo.',
        ja: '男の子は棒で食べ物を分けます。',
        pt: 'o menino divide a comida com o pau.',
      });
  });
});

// STRIKE — the genus verb of BEAT (B13). English is irregular (struck), Italian colpire
// takes the -isc- infix, German schlagen is strong (schlägt / schlug / geschlagen) and its du command
// drops the umlaut (schlag).
describe('STRIKE (genus of BEAT)', () => {
  const strike = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'STRIKE', { directObject: np('STICK'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(strike())).toEqual({
      en: 'the dog strikes the stick.',
      it: 'il cane colpisce il bastone.',
      fr: 'le chien frappe le bâton.',
      de: 'der Hund schlägt den Stock.',
      es: 'el perro golpea el palo.',
      ja: '犬は棒を打ちます。',
      pt: 'o cão golpeia o pau.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'STRIKE', { directObject: np('STICK') })))
      .toMatchObject({
        en: 'the dogs strike the stick.',
        it: 'i cani colpiscono il bastone.',
        fr: 'les chiens frappent le bâton.',
        de: 'die Hunde schlagen den Stock.',
        es: 'los perros golpean el palo.',
        pt: 'os cães golpeiam o pau.',
      });
  });

  test('past tense', () => {
    expect(sayAll(strike({ verbPhrase: { verb: 'STRIKE', tense: 'past' } }))).toEqual({
      en: 'the dog struck the stick.',
      it: 'il cane colpì il bastone.',
      fr: 'le chien frappa le bâton.',
      de: 'der Hund schlug den Stock.',
      es: 'el perro golpeó el palo.',
      ja: '犬は棒を打ちました。',
      pt: 'o cão golpeou o pau.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'STRIKE', { directObject: np('STICK'), verbPhrase: { verb: 'STRIKE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has struck the stick.',
        it: 'il gatto ha colpito il bastone.',
        fr: 'le chat a frappé le bâton.',
        de: 'der Kater hat den Stock geschlagen.',
        es: 'el gato ha golpeado el palo.',
        ja: '猫は棒を打ちました。',
        pt: 'o gato golpeou o pau.', // pt present resultative is the pretérito (documented)
      });
  });

  test('the du command drops the umlaut of the 2sg present (schlag, not *schläg)', () => {
    expect(sayAll(command('STRIKE', 'STICK', YOU))).toEqual({
      en: 'strike the stick.',
      it: 'colpisci il bastone.',
      fr: 'frappe le bâton.',
      de: 'schlag den Stock.',
      es: 'golpea el palo.',
      ja: '棒を打ってください。',
      pt: 'golpeie o pau.',
    });
  });
});

// TRANSFER — the ditransitive genus verb of GIVE and SEND (B15) and of EXPORT and IMPORT (B19).
// English doubles its r (transferred / transferring), Italian trasferire takes the -isc- infix, Spanish transferir
// diphthongs under stress and raises to i elsewhere (transfiere / transfirió / transfiriendo /
// transfiramos), and German übertragen is strong and inseparable (überträgt / übertrug / übertragen,
// no ge-). Its recipient, source and direction complements are pinned in the shapes GIVE and SEND
// will cite.
describe('TRANSFER (genus of GIVE / SEND / EXPORT / IMPORT)', () => {
  const transfer = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'TRANSFER', { directObject: np('MONEY'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(transfer())).toEqual({
      en: 'the dog transfers the money.',
      it: 'il cane trasferisce il denaro.',
      fr: "le chien transfère l'argent.",
      de: 'der Hund überträgt das Geld.',
      es: 'el perro transfiere el dinero.',
      ja: '犬はお金を移します。',
      pt: 'o cão transfere o dinheiro.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'TRANSFER', { directObject: np('MONEY') })))
      .toMatchObject({
        en: 'the dogs transfer the money.',
        it: 'i cani trasferiscono il denaro.',
        fr: "les chiens transfèrent l'argent.",
        de: 'die Hunde übertragen das Geld.',
        es: 'los perros transfieren el dinero.',
        pt: 'os cães transferem o dinheiro.',
      });
  });

  test('past tense', () => {
    expect(sayAll(transfer({ verbPhrase: { verb: 'TRANSFER', tense: 'past' } }))).toEqual({
      en: 'the dog transferred the money.',
      it: 'il cane trasferì il denaro.',
      fr: "le chien transféra l'argent.",
      de: 'der Hund übertrug das Geld.',
      es: 'el perro transfirió el dinero.',
      ja: '犬はお金を移しました。',
      pt: 'o cão transferiu o dinheiro.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'TRANSFER', { directObject: np('MONEY'), verbPhrase: { verb: 'TRANSFER', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has transferred the money.',
        it: 'il gatto ha trasferito il denaro.',
        fr: "le chat a transféré l'argent.",
        de: 'der Kater hat das Geld übertragen.',
        es: 'el gato ha transferido el dinero.',
        ja: '猫はお金を移しました。',
        pt: 'o gato transferiu o dinheiro.', // pt present resultative is the pretérito (documented)
      });
  });

  test('progressive reads the gerund / te-form', () => {
    expect(sayAll(clause(np('CAT'), 'TRANSFER', { directObject: np('MONEY'), verbPhrase: { verb: 'TRANSFER', aspect: 'progressive' } })))
      .toEqual({
        en: 'the cat is transferring the money.',
        it: 'il gatto sta trasferendo il denaro.',
        fr: "le chat est en train de transférer l'argent.",
        de: 'der Kater überträgt gerade das Geld.',
        es: 'el gato está transfiriendo el dinero.',
        ja: '猫はお金を移しています。',
        pt: 'o gato está transferindo o dinheiro.',
      });
  });

  test('commands take the Spanish unstressed subjunctive stem (transfiramos / transfiráis)', () => {
    expect(sayAll(command('TRANSFER', 'MONEY', WE))).toEqual({
      en: "let's transfer the money.",
      it: 'trasferiamo il denaro.',
      fr: "transférons l'argent.",
      de: 'übertragen wir das Geld.',
      es: 'transfiramos el dinero.',
      ja: 'お金を移しましょう。',
      pt: 'transfiramos o dinheiro.',
    });
    expect(sayAll(command('TRANSFER', 'MONEY', YOU_ALL, true))).toEqual({
      en: 'do not transfer the money.',
      it: 'non trasferite il denaro.',
      fr: "ne transférez pas l'argent.",
      de: 'übertragt das Geld nicht.',
      es: 'no transfiráis el dinero.',
      ja: 'お金を移すな。',
      pt: 'não transfiram o dinheiro.',
    });
  });

  test('the recipient is a terminus complement — the dative in German and Japanese', () => {
    expect(sayAll(clause(np('DOG'), 'TRANSFER', { directObject: np('MONEY'), complements: { terminus: { phrase: np('BOY') } } })))
      .toEqual({
        en: 'the dog transfers the money to the boy.',
        it: 'il cane trasferisce il denaro al ragazzo.',
        fr: "le chien transfère l'argent au garçon.",
        de: 'der Hund überträgt dem Jungen das Geld.',
        es: 'el perro transfiere el dinero al niño.',
        ja: '犬は男の子にお金を移します。',
        pt: 'o cão transfere o dinheiro ao menino.',
      });
  });

  test('takes a source and a direction complement', () => {
    expect(sayAll(clause(np('DOG'), 'TRANSFER', { directObject: np('MONEY'), complements: { source: { phrase: np('HOUSE') }, direction: { phrase: np('MARKET') } } })))
      .toEqual({
        en: 'the dog transfers the money from the house to the market.',
        it: 'il cane trasferisce il denaro dalla casa al mercato.',
        fr: "le chien transfère l'argent de la maison au marché.",
        de: 'der Hund überträgt das Geld aus dem Haus zum Markt.',
        es: 'el perro transfiere el dinero de la casa al mercado.',
        ja: '犬は家から市場へお金を移します。',
        pt: 'o cão transfere o dinheiro da casa ao mercado.',
      });
  });
});

// INDICATE — the genus verb of NAME, DESCRIBE and EXPRESS (B16) and of CHOOSE (B18).
// Italian indicare respells before e and i (indicherà), Spanish indicar before e (indiqué), and German
// takes the inseparable bezeichnen (bezeichnet), not the separable anzeigen.
describe('INDICATE (genus of NAME / DESCRIBE / EXPRESS / CHOOSE)', () => {
  const indicate = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'INDICATE', { directObject: np('HOUSE'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(indicate())).toEqual({
      en: 'the dog indicates the house.',
      it: 'il cane indica la casa.',
      fr: 'le chien indique la maison.',
      de: 'der Hund bezeichnet das Haus.',
      es: 'el perro indica la casa.',
      ja: '犬は家を示します。',
      pt: 'o cão indica a casa.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'INDICATE', { directObject: np('HOUSE') })))
      .toMatchObject({
        en: 'the dogs indicate the house.',
        it: 'i cani indicano la casa.',
        fr: 'les chiens indiquent la maison.',
        de: 'die Hunde bezeichnen das Haus.',
        es: 'los perros indican la casa.',
        pt: 'os cães indicam a casa.',
      });
  });

  test('past tense', () => {
    expect(sayAll(indicate({ verbPhrase: { verb: 'INDICATE', tense: 'past' } }))).toEqual({
      en: 'the dog indicated the house.',
      it: 'il cane indicò la casa.',
      fr: 'le chien indiqua la maison.',
      de: 'der Hund bezeichnete das Haus.',
      es: 'el perro indicó la casa.',
      ja: '犬は家を示しました。',
      pt: 'o cão indicou a casa.',
    });
  });

  test('future tense', () => {
    expect(sayAll(indicate({ verbPhrase: { verb: 'INDICATE', tense: 'future' } }))).toMatchObject({
      en: 'the dog will indicate the house.',
      it: 'il cane indicherà la casa.',
      fr: 'le chien indiquera la maison.',
      de: 'der Hund wird das Haus bezeichnen.',
      es: 'el perro indicará la casa.',
      pt: 'o cão indicará a casa.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'INDICATE', { directObject: np('HOUSE'), verbPhrase: { verb: 'INDICATE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has indicated the house.',
        it: 'il gatto ha indicato la casa.',
        fr: 'le chat a indiqué la maison.',
        de: 'der Kater hat das Haus bezeichnet.',
        es: 'el gato ha indicado la casa.',
        ja: '猫は家を示しました。',
        pt: 'o gato indicou a casa.', // pt present resultative is the pretérito (documented)
      });
  });

  test('takes a terminus complement', () => {
    expect(sayAll(clause(np('BOY'), 'INDICATE', { directObject: np('HOUSE'), complements: { terminus: { phrase: np('WOMAN') } } })))
      .toEqual({
        en: 'the boy indicates the house to the woman.',
        it: 'il ragazzo indica la casa alla donna.',
        fr: 'le garçon indique la maison à la femme.',
        de: 'der Junge bezeichnet der Frau das Haus.',
        es: 'el niño indica la casa a la mujer.',
        ja: '男の子は女に家を示します。',
        pt: 'o menino indica a casa à mulher.',
      });
  });
});

// CHANGE — the genus verb of MODIFY (B16). French changer keeps its e before a / o
// (changea), German ändern is an -ern verb (ändert / änderte / geändert), Portuguese takes mudar, and
// Japanese the transitive ichidan 変える.
describe('CHANGE (genus of MODIFY)', () => {
  const change = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'CHANGE', { directObject: np('WORD'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(change())).toEqual({
      en: 'the dog changes the word.',
      it: 'il cane cambia la parola.',
      fr: 'le chien change le mot.',
      de: 'der Hund ändert das Wort.',
      es: 'el perro cambia la palabra.',
      ja: '犬は単語を変えます。',
      pt: 'o cão muda a palavra.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'CHANGE', { directObject: np('WORD') })))
      .toMatchObject({
        en: 'the dogs change the word.',
        it: 'i cani cambiano la parola.',
        fr: 'les chiens changent le mot.',
        de: 'die Hunde ändern das Wort.',
        es: 'los perros cambian la palabra.',
        pt: 'os cães mudam a palavra.',
      });
  });

  test('past tense', () => {
    expect(sayAll(change({ verbPhrase: { verb: 'CHANGE', tense: 'past' } }))).toEqual({
      en: 'the dog changed the word.',
      it: 'il cane cambiò la parola.',
      fr: 'le chien changea le mot.',
      de: 'der Hund änderte das Wort.',
      es: 'el perro cambió la palabra.',
      ja: '犬は単語を変えました。',
      pt: 'o cão mudou a palavra.',
    });
  });

  test('future tense', () => {
    expect(sayAll(change({ verbPhrase: { verb: 'CHANGE', tense: 'future' } }))).toMatchObject({
      en: 'the dog will change the word.',
      it: 'il cane cambierà la parola.',
      fr: 'le chien changera le mot.',
      de: 'der Hund wird das Wort ändern.',
      es: 'el perro cambiará la palabra.',
      pt: 'o cão mudará a palavra.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'CHANGE', { directObject: np('WORD'), verbPhrase: { verb: 'CHANGE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has changed the word.',
        it: 'il gatto ha cambiato la parola.',
        fr: 'le chat a changé le mot.',
        de: 'der Kater hat das Wort geändert.',
        es: 'el gato ha cambiado la palabra.',
        ja: '猫は単語を変えました。',
        pt: 'o gato mudou a palavra.', // pt present resultative is the pretérito (documented)
      });
  });
});

// FEEL — the genus verb of LOVE ("to feel affection", B17). English is irregular (felt); German takes
// fühlen (empfinden is PERCEIVE's); Italian and French take provare / éprouver; Spanish sentir
// diphthongs under stress and raises to i elsewhere (siente / sintió / sintiendo / sintamos), while
// Portuguese raises it only in the 1sg and the subjunctive (sinto / sinta).
describe('FEEL (genus of LOVE)', () => {
  const feel = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'FEEL', { directObject: np('TEMPERATURE'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(feel())).toEqual({
      en: 'the dog feels the temperature.',
      it: 'il cane prova la temperatura.',
      fr: 'le chien éprouve la température.',
      de: 'der Hund fühlt die Temperatur.',
      es: 'el perro siente la temperatura.',
      ja: '犬は温度を感じます。',
      pt: 'o cão sente a temperatura.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'FEEL', { directObject: np('TEMPERATURE') })))
      .toMatchObject({
        en: 'the dogs feel the temperature.',
        it: 'i cani provano la temperatura.',
        fr: 'les chiens éprouvent la température.',
        de: 'die Hunde fühlen die Temperatur.',
        es: 'los perros sienten la temperatura.',
        pt: 'os cães sentem a temperatura.',
      });
  });

  test('past tense', () => {
    expect(sayAll(feel({ verbPhrase: { verb: 'FEEL', tense: 'past' } }))).toEqual({
      en: 'the dog felt the temperature.',
      it: 'il cane provò la temperatura.',
      fr: 'le chien éprouva la température.',
      de: 'der Hund fühlte die Temperatur.',
      es: 'el perro sintió la temperatura.',
      ja: '犬は温度を感じました。',
      pt: 'o cão sentiu a temperatura.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'FEEL', { directObject: np('TEMPERATURE'), verbPhrase: { verb: 'FEEL', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has felt the temperature.',
        it: 'il gatto ha provato la temperatura.',
        fr: 'le chat a éprouvé la température.',
        de: 'der Kater hat die Temperatur gefühlt.',
        es: 'el gato ha sentido la temperatura.',
        ja: '猫は温度を感じました。',
        pt: 'o gato sentiu a temperatura.', // pt present resultative is the pretérito (documented)
      });
  });

  test('progressive reads the gerund / te-form', () => {
    expect(sayAll(clause(np('CAT'), 'FEEL', { directObject: np('TEMPERATURE'), verbPhrase: { verb: 'FEEL', aspect: 'progressive' } })))
      .toEqual({
        en: 'the cat is feeling the temperature.',
        it: 'il gatto sta provando la temperatura.',
        fr: "le chat est en train d'éprouver la température.",
        de: 'der Kater fühlt gerade die Temperatur.',
        es: 'el gato está sintiendo la temperatura.',
        ja: '猫は温度を感じています。',
        pt: 'o gato está sentindo a temperatura.',
      });
  });

  test('commands take the Spanish unstressed subjunctive stem (sintamos / sintáis)', () => {
    expect(sayAll(command('FEEL', 'TEMPERATURE', WE))).toEqual({
      en: "let's feel the temperature.",
      it: 'proviamo la temperatura.',
      fr: 'éprouvons la température.',
      de: 'fühlen wir die Temperatur.',
      es: 'sintamos la temperatura.',
      ja: '温度を感じましょう。',
      pt: 'sintamos a temperatura.',
    });
    expect(sayAll(command('FEEL', 'TEMPERATURE', YOU_ALL, true))).toEqual({
      en: 'do not feel the temperature.',
      it: 'non provate la temperatura.',
      fr: "n'éprouvez pas la température.",
      de: 'fühlt die Temperatur nicht.',
      es: 'no sintáis la temperatura.',
      ja: '温度を感じるな。',
      pt: 'não sintam a temperatura.',
    });
  });
});

// SHED — the genus verb of CRY ("to shed tears", B17). English is invariant (shed / shed) and doubles
// its d in the gerund (shedding); German vergießen is strong and inseparable (vergoss / vergossen).
describe('SHED (genus of CRY)', () => {
  const shed = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'SHED', { directObject: np('WATER'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(shed())).toEqual({
      en: 'the dog sheds the water.',
      it: "il cane versa l'acqua.",
      fr: "le chien verse l'eau.",
      de: 'der Hund vergießt das Wasser.',
      es: 'el perro derrama el agua.',
      ja: '犬は水を流します。',
      pt: 'o cão derrama a água.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'SHED', { directObject: np('WATER') })))
      .toMatchObject({
        en: 'the dogs shed the water.',
        it: "i cani versano l'acqua.",
        fr: "les chiens versent l'eau.",
        de: 'die Hunde vergießen das Wasser.',
        es: 'los perros derraman el agua.',
        pt: 'os cães derramam a água.',
      });
  });

  test('past tense', () => {
    expect(sayAll(shed({ verbPhrase: { verb: 'SHED', tense: 'past' } }))).toEqual({
      en: 'the dog shed the water.',
      it: "il cane versò l'acqua.",
      fr: "le chien versa l'eau.",
      de: 'der Hund vergoss das Wasser.',
      es: 'el perro derramó el agua.',
      ja: '犬は水を流しました。',
      pt: 'o cão derramou a água.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'SHED', { directObject: np('WATER'), verbPhrase: { verb: 'SHED', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has shed the water.',
        it: "il gatto ha versato l'acqua.",
        fr: "le chat a versé l'eau.",
        de: 'der Kater hat das Wasser vergossen.',
        es: 'el gato ha derramado el agua.',
        ja: '猫は水を流しました。',
        pt: 'o gato derramou a água.', // pt present resultative is the pretérito (documented)
      });
  });

  test('progressive reads the gerund / te-form', () => {
    expect(sayAll(clause(np('CAT'), 'SHED', { directObject: np('WATER'), verbPhrase: { verb: 'SHED', aspect: 'progressive' } })))
      .toEqual({
        en: 'the cat is shedding the water.',
        it: "il gatto sta versando l'acqua.",
        fr: "le chat est en train de verser l'eau.",
        de: 'der Kater vergießt gerade das Wasser.',
        es: 'el gato está derramando el agua.',
        ja: '猫は水を流しています。',
        pt: 'o gato está derramando a água.',
      });
  });
});

// PRODUCE — the genus verb of CRY_OUT (B17). Italian produrre contracts its
// infinitive, so every form that isn't built on it goes back to the Latin stem produc- (produce /
// produsse / prodotto) — including the imperfect subjunctive, overridden in IT_SUBJ_STEM (producesse,
// not *prodursse). French produire and Spanish producir are irregular (produisit, produjo / produzco).
describe('PRODUCE (genus of CRY_OUT)', () => {
  const produce = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'PRODUCE', { directObject: np('FOOD'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(produce())).toEqual({
      en: 'the dog produces the food.',
      it: 'il cane produce il cibo.',
      fr: 'le chien produit la nourriture.',
      de: 'der Hund erzeugt das Essen.',
      es: 'el perro produce la comida.',
      ja: '犬は食べ物を出します。',
      pt: 'o cão produz a comida.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'PRODUCE', { directObject: np('FOOD') })))
      .toMatchObject({
        en: 'the dogs produce the food.',
        it: 'i cani producono il cibo.',
        fr: 'les chiens produisent la nourriture.',
        de: 'die Hunde erzeugen das Essen.',
        es: 'los perros producen la comida.',
        pt: 'os cães produzem a comida.',
      });
  });

  test('past tense', () => {
    expect(sayAll(produce({ verbPhrase: { verb: 'PRODUCE', tense: 'past' } }))).toEqual({
      en: 'the dog produced the food.',
      it: 'il cane produsse il cibo.',
      fr: 'le chien produisit la nourriture.',
      de: 'der Hund erzeugte das Essen.',
      es: 'el perro produjo la comida.',
      ja: '犬は食べ物を出しました。',
      pt: 'o cão produziu a comida.',
    });
  });

  test('future tense', () => {
    expect(sayAll(produce({ verbPhrase: { verb: 'PRODUCE', tense: 'future' } }))).toMatchObject({
      en: 'the dog will produce the food.',
      it: 'il cane produrrà il cibo.',
      fr: 'le chien produira la nourriture.',
      de: 'der Hund wird das Essen erzeugen.',
      es: 'el perro producirá la comida.',
      pt: 'o cão produzirá a comida.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'PRODUCE', { directObject: np('FOOD'), verbPhrase: { verb: 'PRODUCE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has produced the food.',
        it: 'il gatto ha prodotto il cibo.',
        fr: 'le chat a produit la nourriture.',
        de: 'der Kater hat das Essen erzeugt.',
        es: 'el gato ha producido la comida.',
        ja: '猫は食べ物を出しました。',
        pt: 'o gato produziu a comida.', // pt present resultative is the pretérito (documented)
      });
  });

  test('hypothetical: the Italian subjunctive is built on produc-, the conditional on produrr-', () => {
    expect(sayAll(hypothetical('PRODUCE', 'FOOD'))).toEqual({
      en: 'if the cat produced the food, the dog would produce the food.',
      it: 'se il gatto producesse il cibo, il cane produrrebbe il cibo.',
      fr: 'si le chat produisait la nourriture, le chien produirait la nourriture.',
      de: 'wenn der Kater das Essen erzeugen würde, würde der Hund das Essen erzeugen.',
      es: 'si el gato produjera la comida, el perro produciría la comida.',
      ja: 'もし猫が食べ物を出したら、犬は食べ物を出します。',
      pt: 'se o gato produzisse a comida, o cão produziria a comida.',
    });
    expect(sayAll(hypothetical('PRODUCE', 'FOOD', WE, YOU_ALL))).toMatchObject({
      it: 'se produceste il cibo, produrremmo il cibo.',
      fr: 'si vous produisiez la nourriture, nous produirions la nourriture.',
      es: 'si produjerais la comida, produciríamos la comida.',
      pt: 'se produzissem a comida, produziríamos a comida.',
    });
  });
});

// PRESS — the genus verb of CLICK ("to press a button", B18). Italian premere takes the -etti remote
// past (premette) and the -uto participle (premuto); Spanish takes pulsar, Portuguese pressionar.
describe('PRESS (genus of CLICK)', () => {
  const press = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'PRESS', { directObject: np('BOOK'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(press())).toEqual({
      en: 'the dog presses the book.',
      it: 'il cane preme il libro.',
      fr: 'le chien presse le livre.',
      de: 'der Hund drückt das Buch.',
      es: 'el perro pulsa el libro.',
      ja: '犬は本を押します。',
      pt: 'o cão pressiona o livro.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'PRESS', { directObject: np('BOOK') })))
      .toMatchObject({
        en: 'the dogs press the book.',
        it: 'i cani premono il libro.',
        fr: 'les chiens pressent le livre.',
        de: 'die Hunde drücken das Buch.',
        es: 'los perros pulsan el libro.',
        pt: 'os cães pressionam o livro.',
      });
  });

  test('past tense', () => {
    expect(sayAll(press({ verbPhrase: { verb: 'PRESS', tense: 'past' } }))).toEqual({
      en: 'the dog pressed the book.',
      it: 'il cane premette il libro.',
      fr: 'le chien pressa le livre.',
      de: 'der Hund drückte das Buch.',
      es: 'el perro pulsó el libro.',
      ja: '犬は本を押しました。',
      pt: 'o cão pressionou o livro.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'PRESS', { directObject: np('BOOK'), verbPhrase: { verb: 'PRESS', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has pressed the book.',
        it: 'il gatto ha premuto il libro.',
        fr: 'le chat a pressé le livre.',
        de: 'der Kater hat das Buch gedrückt.',
        es: 'el gato ha pulsado el libro.',
        ja: '猫は本を押しました。',
        pt: 'o gato pressionou o livro.', // pt present resultative is the pretérito (documented)
      });
  });
});

// WRITE — the genus verb of TYPE ("to write with a keyboard", B18). Irregular in every European
// language: wrote / written, scrisse / scritto, écrit / écrivent / écrivit, schrieb / geschrieben, and
// the strong escrito of Spanish and Portuguese. Japanese 書く is a godan -ku verb (書いて).
describe('WRITE (genus of TYPE)', () => {
  const write = (extra: Partial<PhrasePlan> = {}): PhrasePlan =>
    clause(np('DOG'), 'WRITE', { directObject: np('WORD'), ...extra });

  test('present conjugates across languages', () => {
    expect(sayAll(write())).toEqual({
      en: 'the dog writes the word.',
      it: 'il cane scrive la parola.',
      fr: 'le chien écrit le mot.',
      de: 'der Hund schreibt das Wort.',
      es: 'el perro escribe la palabra.',
      ja: '犬は単語を書きます。',
      pt: 'o cão escreve a palavra.',
    });
  });

  test('plural subject agrees', () => {
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'WRITE', { directObject: np('WORD') })))
      .toMatchObject({
        en: 'the dogs write the word.',
        it: 'i cani scrivono la parola.',
        fr: 'les chiens écrivent le mot.',
        de: 'die Hunde schreiben das Wort.',
        es: 'los perros escriben la palabra.',
        pt: 'os cães escrevem a palavra.',
      });
  });

  test('past tense', () => {
    expect(sayAll(write({ verbPhrase: { verb: 'WRITE', tense: 'past' } }))).toEqual({
      en: 'the dog wrote the word.',
      it: 'il cane scrisse la parola.',
      fr: 'le chien écrivit le mot.',
      de: 'der Hund schrieb das Wort.',
      es: 'el perro escribió la palabra.',
      ja: '犬は単語を書きました。',
      pt: 'o cão escreveu a palavra.',
    });
  });

  test('resultative uses the right auxiliary and participle (avere / haber / haben / ter→pretérito)', () => {
    expect(sayAll(clause(np('CAT'), 'WRITE', { directObject: np('WORD'), verbPhrase: { verb: 'WRITE', aspect: 'resultative' } })))
      .toEqual({
        en: 'the cat has written the word.',
        it: 'il gatto ha scritto la parola.',
        fr: 'le chat a écrit le mot.',
        de: 'der Kater hat das Wort geschrieben.',
        es: 'el gato ha escrito la palabra.',
        ja: '猫は単語を書きました。',
        pt: 'o gato escreveu a palavra.', // pt present resultative is the pretérito (documented)
      });
  });

  test("takes an instrumental complement (the shape TYPE's definition will use)", () => {
    expect(sayAll(clause(np('BOY'), 'WRITE', { directObject: np('WORD'), complements: { instrumental: { phrase: np('STICK') } } })))
      .toEqual({
        en: 'the boy writes the word with the stick.',
        it: 'il ragazzo scrive la parola con il bastone.',
        fr: 'le garçon écrit le mot avec le bâton.',
        de: 'der Junge schreibt das Wort mit dem Stock.',
        es: 'el niño escribe la palabra con el palo.',
        ja: '男の子は棒で単語を書きます。',
        pt: 'o menino escreve a palavra com o pau.',
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
      fr: 'consommer de la nourriture.',
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
      fr: 'consommer du liquide.',
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
      fr: 'créer des objets.',
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
      fr: 'créer le feu.',
      de: 'Feuer erschaffen.',
      es: 'crear fuego.',
      ja: '火を生み出す。',
      pt: 'criar fogo.',
    });
  });
});

// The B10 destruction-verb definitions on the DESTROY genus. All three differentiae render
// bare-singular: FIRE the way B09's SET_ON_FIRE does, and LIFE and CONTENT in their mass sense.
// French, which has no zero article, gives the three corpus-count nouns the generic definite (A207).
describe('B10 verb definitions (DESTROY genus)', () => {
  test('KILL → "to destroy life"', () => {
    expect(definitionAll('KILL')).toEqual({
      en: 'to destroy life.',
      it: 'distruggere vita.',
      fr: 'détruire la vie.',
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
      fr: 'détruire le feu.',
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
      fr: 'détruire le contenu.',
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
      fr: 'percevoir la lumière.',
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
      fr: 'comprendre des concepts.',
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
      fr: 'comprendre des mots écrits.',
      de: 'geschriebene Wörter verstehen.',
      es: 'comprender palabras escritas.',
      ja: '書かれた単語を理解する。',
      pt: 'compreender palavras escritas.',
    });
  });
});

describe('B12 verb definitions (HAVE / ACQUIRE genera)', () => {
  test('OWN has property', () => {
    expect(definitionAll('OWN')).toEqual({
      en: 'to have property.',
      it: 'avere proprietà.',
      fr: 'avoir de la propriété.',
      de: 'Besitz haben.',
      es: 'tener propiedad.',
      ja: '財産を持つ。',
      pt: 'ter propriedade.',
    });
  });

  test('HOLD has objects', () => {
    expect(definitionAll('HOLD')).toEqual({
      en: 'to have objects.',
      it: 'avere oggetti.',
      fr: 'avoir des objets.',
      de: 'Gegenstände haben.',
      es: 'tener objetos.',
      ja: '物体を持つ。',
      pt: 'ter objetos.',
    });
  });

  test('BUY acquires objects with money: the price is an instrumental complement', () => {
    expect(definitionAll('BUY')).toEqual({
      en: 'to acquire objects with money.',
      it: 'acquisire oggetti con denaro.',
      fr: "acquérir des objets avec de l'argent.",
      de: 'Gegenstände mit Geld erwerben.',
      es: 'adquirir objetos con dinero.',
      ja: 'お金で物体を取得する。',
      pt: 'adquirir objetos com dinheiro.',
    });
  });
});

describe('B13 verb definitions (DIVIDE / CUT / STRIKE genera)', () => {
  // CUT shipped as "to divide with a sharp blade" and lost the adjective when SHARP was glossed as
  // "that cuts well" (localization C24); the instrument carrying an adjective of its own is still a
  // shape a verb gloss takes, pinned on the plan CUT had.
  test('CUT divides with a blade', () => {
    expect(definitionAll('CUT')).toEqual({
      en: 'to divide with a blade.',
      it: 'dividere con una lama.',
      fr: 'diviser avec une lame.',
      de: 'mit einer Klinge teilen.',
      es: 'dividir con una cuchilla.',
      ja: '刃で分ける。',
      pt: 'dividir com uma lâmina.',
    });
  });

  test('an instrumental carrying its own adjective', () => {
    expect(sayAll(infinitiveGloss('DIVIDE', {
      complements: { instrumental: { phrase: { concept: 'BLADE', definiteness: 'indefinite', adjectives: ['SHARP'] } } },
    }))).toEqual({
      en: 'to divide with a sharp blade.',
      it: 'dividere con una lama affilata.',
      fr: 'diviser avec une lame tranchante.',
      de: 'mit einer scharfen Klinge teilen.',
      es: 'dividir con una cuchilla afilada.',
      ja: '鋭い刃で分ける。',
      pt: 'dividir com uma lâmina afiada.',
    });
  });

  test('BITE cuts with the teeth: a definite plural instrument', () => {
    expect(definitionAll('BITE')).toEqual({
      en: 'to cut with the teeth.',
      it: 'tagliare con i denti.',
      fr: 'couper avec les dents.',
      de: 'mit den Zähnen schneiden.',
      es: 'cortar con los dientes.',
      ja: '歯で切る。',
      pt: 'cortar com os dentes.',
    });
  });

  test('BEAT strikes repeatedly: an adverb on the genus', () => {
    expect(definitionAll('BEAT')).toEqual({
      en: 'to strike repeatedly.',
      it: 'colpire ripetutamente.',
      fr: 'frapper à plusieurs reprises.',
      de: 'wiederholt schlagen.',
      es: 'golpear repetidamente.',
      ja: '繰り返し打つ。',
      pt: 'golpear repetidamente.',
    });
  });
});

describe('B15 verb definitions (TRANSFER genus)', () => {
  test('GIVE transfers objects to a person: the recipient is a terminus', () => {
    expect(definitionAll('GIVE')).toEqual({
      en: 'to transfer objects to a person.',
      it: 'trasferire oggetti a una persona.',
      fr: 'transférer des objets à une personne.',
      de: 'einer Person Gegenstände übertragen.',
      es: 'transferir objetos a una persona.',
      ja: '人に物体を移す。',
      pt: 'transferir objetos a uma pessoa.',
    });
  });

  test('SEND transfers objects to a place: the goal is a direction', () => {
    expect(definitionAll('SEND')).toEqual({
      en: 'to transfer objects to a place.',
      it: 'trasferire oggetti a un luogo.',
      fr: 'transférer des objets à un lieu.',
      de: 'Gegenstände zu einem Ort übertragen.',
      es: 'transferir objetos a un lugar.',
      ja: '場所へ物体を移す。',
      pt: 'transferir objetos a um lugar.',
    });
  });
});

describe('B16 verb definitions (INDICATE / CHANGE genera)', () => {
  test('NAME indicates objects with words', () => {
    expect(definitionAll('NAME')).toEqual({
      en: 'to indicate objects with words.',
      it: 'indicare oggetti con parole.',
      fr: 'indiquer des objets avec des mots.',
      de: 'Gegenstände mit Wörtern bezeichnen.',
      es: 'indicar objetos con palabras.',
      ja: '単語で物体を示す。',
      pt: 'indicar objetos com palavras.',
    });
  });

  test('DESCRIBE indicates qualities', () => {
    expect(definitionAll('DESCRIBE')).toEqual({
      en: 'to indicate qualities.',
      it: 'indicare qualità.',
      fr: 'indiquer des qualités.',
      de: 'Qualitäten bezeichnen.',
      es: 'indicar calidades.',
      ja: '質を示す。',
      pt: 'indicar qualidades.',
    });
  });

  test('EXPRESS indicates concepts', () => {
    expect(definitionAll('EXPRESS')).toEqual({
      en: 'to indicate concepts.',
      it: 'indicare concetti.',
      fr: 'indiquer des concepts.',
      de: 'Begriffe bezeichnen.',
      es: 'indicar conceptos.',
      ja: '概念を示す。',
      pt: 'indicar conceitos.',
    });
  });

  test('MODIFY changes qualities', () => {
    expect(definitionAll('MODIFY')).toEqual({
      en: 'to change qualities.',
      it: 'cambiare qualità.',
      fr: 'changer des qualités.',
      de: 'Qualitäten ändern.',
      es: 'cambiar calidades.',
      ja: '質を変える。',
      pt: 'mudar qualidades.',
    });
  });
});

describe('B17 verb definitions (FEEL / SHED / PRODUCE genera)', () => {
  test('LOVE feels affection', () => {
    expect(definitionAll('LOVE')).toEqual({
      en: 'to feel affection.',
      it: 'provare affetto.',
      fr: "éprouver de l'affection.",
      de: 'Zuneigung fühlen.',
      es: 'sentir afecto.',
      ja: '愛情を感じる。',
      pt: 'sentir afeto.',
    });
  });

  // LOVE's counterpart under the same genus, with a sorrow for the affection (localization A31).
  test('SUFFER feels sorrow', () => {
    expect(definitionAll('SUFFER')).toEqual({
      en: 'to feel sorrow.',
      it: 'provare tristezza.',
      fr: 'éprouver de la tristesse.',
      de: 'Trauer fühlen.',
      es: 'sentir tristeza.',
      ja: '悲しみを感じる。',
      pt: 'sentir tristeza.',
    });
  });

  test('CRY sheds tears', () => {
    expect(definitionAll('CRY')).toEqual({
      en: 'to shed tears.',
      it: 'versare lacrime.',
      fr: 'verser des larmes.',
      de: 'Tränen vergießen.',
      es: 'derramar lágrimas.',
      ja: '涙を流す。',
      pt: 'derramar lágrimas.',
    });
  });

  test('CRY_OUT produces loud sounds', () => {
    expect(definitionAll('CRY_OUT')).toEqual({
      en: 'to produce loud sounds.',
      it: 'produrre suoni forti.',
      fr: 'produire des sons forts.',
      de: 'laute Geräusche erzeugen.',
      es: 'producir sonidos fuertes.',
      ja: '大きい音を出す。',
      pt: 'produzir sons altos.',
    });
  });

  // B33. PRODUCE's "give off" sense again, with FLAME: what a burning thing does. Not CONSUME, whose
  // ingest sense reads fr "consommé", de "konsumiert", ja 摂取, and not "to produce fire", which is
  // SET_ON_FIRE's "to create fire" in five languages. Japanese 炎を出す does not contain 燃.
  test('BURN produces flames (localization B33)', () => {
    expect(definitionAll('BURN')).toEqual({
      en: 'to produce flames.',
      it: 'produrre fiamme.',
      fr: 'produire des flammes.',
      de: 'Flammen erzeugen.',
      es: 'producir llamas.',
      ja: '炎を出す。',
      pt: 'produzir chamas.',
    });
  });
});

describe('B18 verb definitions (INDICATE / PRESS / WRITE genera)', () => {
  test('CHOOSE indicates an option: an indefinite object', () => {
    expect(definitionAll('CHOOSE')).toEqual({
      en: 'to indicate an option.',
      it: "indicare un'opzione.",
      fr: 'indiquer une option.',
      de: 'eine Option bezeichnen.',
      es: 'indicar una opción.',
      ja: '選択肢を示す。',
      pt: 'indicar uma opção.',
    });
  });

  test('CLICK presses a button', () => {
    expect(definitionAll('CLICK')).toEqual({
      en: 'to press a button.',
      it: 'premere un pulsante.',
      fr: 'presser un bouton.',
      de: 'eine Taste drücken.',
      es: 'pulsar un botón.',
      ja: 'ボタンを押す。',
      pt: 'pressionar um botão.',
    });
  });

  test('TYPE writes with a keyboard', () => {
    expect(definitionAll('TYPE')).toEqual({
      en: 'to write with a keyboard.',
      it: 'scrivere con una tastiera.',
      fr: 'écrire avec un clavier.',
      de: 'mit einer Tastatur schreiben.',
      es: 'escribir con un teclado.',
      ja: 'キーボードで書く。',
      pt: 'escrever com um teclado.',
    });
  });
});

describe('B19 verb definitions (TRANSFER genus)', () => {
  test('EXPORT transfers content to a place', () => {
    expect(definitionAll('EXPORT')).toEqual({
      en: 'to transfer content to a place.',
      it: 'trasferire contenuto a un luogo.',
      fr: 'transférer le contenu à un lieu.',
      de: 'Inhalt zu einem Ort übertragen.',
      es: 'transferir contenido a un lugar.',
      ja: '場所へ内容を移す。',
      pt: 'transferir conteúdo a um lugar.',
    });
  });

  test('IMPORT transfers content from a place: the source is what sets it apart from EXPORT', () => {
    expect(definitionAll('IMPORT')).toEqual({
      en: 'to transfer content from a place.',
      it: 'trasferire contenuto da un luogo.',
      fr: "transférer le contenu d'un lieu.",
      de: 'Inhalt von einem Ort übertragen.',
      es: 'transferir contenido de un lugar.',
      ja: '場所から内容を移す。',
      pt: 'transferir conteúdo de um lugar.',
    });
  });
});

// C05. BUILDING's gloss is a whoGloss on HAVE, "a place that has walls". It was probed and rejected
// in B29 for two engine gaps, both since closed: French left the bare plural object without its
// partitive ("qui a murs", A149), and Japanese said the possession with 持つ, which is holding, where
// an inanimate owner takes the existential ある (A150). CREATOR is the same shape on a person, which
// keeps 持つ's sibling 作る and shows the French fix reaching every shipped whoGloss.
describe('C05: BUILDING, a place that has walls', () => {
  test('renders in every language', () => {
    expect(definitionAll('BUILDING')).toEqual({
      en: 'a place that has walls.',
      it: 'un luogo che ha muri.',
      fr: 'un lieu qui a des murs.',
      de: 'ein Ort, der Wände hat.',
      es: 'un lugar que tiene paredes.',
      ja: '壁がある場所。',
      pt: 'um lugar que tem paredes.',
    });
  });

  test('the French partitive reaches the glosses that shipped without it', () => {
    expect(definitionAll('CREATOR').fr).toBe('une personne qui fait des objets.');
    expect(definitionAll('NOUN').fr).toBe('un mot qui nomme des objets.');
  });
});

// C20. SELECT is CHOOSE's genus with what the indicating is *for*: a clause of purpose whose object
// is a pronoun standing for the object (`antecedent`), so each language genders it off its own word —
// en "it", ja それ, de "ihn" (*Gegenstand* is masculine). Without the purpose it would read as CHOOSE.
describe('C20: SELECT, a pronoun standing for its antecedent', () => {
  test('SELECT → "to indicate an object to use it"', () => {
    expect(definitionAll('SELECT')).toEqual({
      en: 'to indicate an object to use it.',
      it: 'indicare un oggetto per usarlo.',
      fr: "indiquer un objet pour l'utiliser.",
      de: 'einen Gegenstand bezeichnen, um ihn zu verwenden.',
      es: 'indicar un objeto para usarlo.',
      ja: 'それを使うために物体を示す。',
      pt: 'indicar um objeto para usá-lo.',
    });
    expect(definitionAll('SELECT')).not.toEqual(definitionAll('CHOOSE'));
  });
});

// C19. The four workspace verbs C08 could not reach, each on a construct C12 built or a word the
// probe found was the real blocker. Two are causatives (pinned beside the C08 ones in
// causative.test.ts); these two are not, and they are what the purpose clause was needed for.
describe('C19: the verbs the purpose clause and a re-read literal unblocked', () => {
  // The differentia is not what is written but what the writing is *for*, which only a clause of
  // purpose can say (PhrasePlan.purpose): en the bare infinitive, Romance per/pour/para, de the
  // extraposed "um … zu", ja 〜ために ahead of the predicate. The object of that clause is a pronoun
  // standing for the content, already named (C20): a thing is "it" in English, but *Inhalt* is
  // masculine, so German says "ihn". C19 shipped it neuter, "um es zu laden".
  test('SAVE → "to write content to load it"', () => {
    expect(definitionAll('SAVE')).toEqual({
      en: 'to write content to load it.',
      it: 'scrivere contenuto per caricarlo.', // the clitic attaches to the infinitive
      fr: 'écrire le contenu pour le charger.',
      de: 'Inhalt schreiben, um ihn zu laden.',
      es: 'escribir contenido para cargarlo.',
      ja: 'それを読み込むために内容を書く。',
      pt: 'escrever conteúdo para carregá-lo.',
    });
  });

  // TRANSLATE was seeded for C11's "the phrase could not be translated", and takes a gloss of its
  // own rather than joining the verbs on the English literal. The language it is done with is the
  // instrumental — the means, not a companion — which Japanese marks with the で the English
  // literal's "in" wants.
  test('TRANSLATE → "to express concepts with another language"', () => {
    expect(definitionAll('TRANSLATE')).toEqual({
      en: 'to express concepts with another language.',
      it: "esprimere concetti con un'altra lingua.",
      fr: 'exprimer des concepts avec une autre langue.',
      de: 'Begriffe mit einer anderen Sprache vermitteln.',
      es: 'expresar conceptos con otro idioma.',
      ja: '別の言語で概念を表す。',
      pt: 'exprimir conceitos com outra língua.',
    });
  });

  // The literal ("to bring stored content back in") asks for a prior state the plan model has no
  // room for. It turns out not to need one: WRITTEN already says the content was put there before,
  // which is all the "back" was carrying.
  test('LOAD → "to read written content", the "back" carried by the participle', () => {
    expect(definitionAll('LOAD')).toEqual({
      en: 'to read written content.',
      it: 'leggere contenuto scritto.',
      fr: 'lire le contenu écrit.',
      de: 'geschriebenen Inhalt lesen.',
      es: 'leer contenido escrito.',
      ja: '書かれた内容を読む。',
      pt: 'ler conteúdo escrito.',
    });
  });
});
