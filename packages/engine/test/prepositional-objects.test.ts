import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan, ReadyLanguageCode } from '@signi/shared';
import { np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// Localization C24's last four adjectives — FIRST, SECOND, THIRD and CONDITIONAL — are what follows
// which and what another clause depends on, and both verbs govern their object in a way the engine
// only half spoke. A139 gave five languages a verb's lexical preposition (`object_prep`: "clicca sul
// pulsante"); this batch gave it to English ("depends on the condition", relativised "on which"),
// made a dative-only German preposition keep its dative ("hängt von der Bedingung ab"), relativised a
// French de-object as "dont", gave Japanese a lexical object particle (`object_particle`: 犬に続く) and
// Spanish a verb-wide personal a (`object_a`: "sigue al primer objeto", still "lo sigue").

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

const CLAUSE = np('CLAUSE');
const CONDITION = np('CONDITION');
const CAT = np('CAT');

describe('DEPEND: an object every language but Japanese takes with a preposition', () => {
  test.each<[string, Partial<PhrasePlan>, Record<ReadyLanguageCode, string>]>([
    ['present', { verbPhrase: { verb: 'DEPEND' }, directObject: CONDITION },
      { en: 'the clause depends on the condition.', it: 'la proposizione dipende dalla condizione.', fr: 'la proposition dépend de la condition.', de: 'der Satz hängt von der Bedingung ab.', es: 'la oración depende de la condición.', ja: '節は条件に依存しています。', pt: 'a oração depende da condição.' }],
    // Italian dipendere selects essere; German abhängen is strong and separable.
    ['past and compound tense', { verbPhrase: { verb: 'DEPEND', aspect: 'resultative' }, directObject: CONDITION },
      { en: 'the clause has depended on the condition.', it: 'la proposizione è dipesa dalla condizione.', fr: 'la proposition a dépendu de la condition.', de: 'der Satz hat von der Bedingung abgehangen.', es: 'la oración ha dependido de la condición.', ja: '節は条件に依存していました。', pt: 'a oração dependeu da condição.' }],
    ['negated', { verbPhrase: { verb: 'DEPEND', negative: true }, directObject: CONDITION },
      { en: 'the clause does not depend on the condition.', it: 'la proposizione non dipende dalla condizione.', fr: 'la proposition ne dépend pas de la condition.', de: 'der Satz hängt nicht von der Bedingung ab.', es: 'la oración no depende de la condición.', ja: '節は条件に依存していません。', pt: 'a oração não depende da condição.' }],
    // A pronoun object is the preposition's tonic form: German's in the dative, French's elided.
    ['a pronoun object', { verbPhrase: { verb: 'DEPEND', tense: 'past' }, directObject: np('THIRD_PERSON', { antecedent: 'CONDITION' }) },
      { en: 'the clause depended on it.', it: 'la proposizione dipendeva da lei.', fr: "la proposition dépendait d'elle.", de: 'der Satz hing von ihr ab.', es: 'la oración dependía de ella.', ja: '節はそれに依存していました。', pt: 'a oração dependia dela.' }],
  ])('%s', (_, plan, rendered) => {
    expect(sayAll({ subject: CLAUSE, ...plan } as PhrasePlan)).toEqual(rendered);
  });

  // The relativizer takes the object's preposition, as a complement's does; English pied-pipes it too,
  // and French writes a de-object as "dont".
  test('an object relative relativises on the preposition', () => {
    expect(sayAll({ subject: np('CLAUSE', { relative: { headRole: 'directObject', subject: np('PERIOD_SENTENCE'), verbPhrase: { verb: 'DEPEND' } } }) }))
      .toEqual({
        en: 'the clause on which the period depends.', it: 'la proposizione dalla quale il periodo dipende.',
        fr: 'la proposition dont la période dépend.', de: 'der Satz, von dem das Satzgefüge abhängt.',
        es: 'la oración de la que el período depende.', ja: '文が依存する節。', pt: 'a oração da qual o período depende.',
      });
  });
});

describe('FOLLOW: an object German takes with auf, Spanish with a, Japanese with に', () => {
  test.each<[string, Partial<PhrasePlan>, Record<ReadyLanguageCode, string>]>([
    ['a noun object', { directObject: np('DOG') },
      { en: 'the cat follows the dog.', it: 'il gatto segue il cane.', fr: 'le chat suit le chien.', de: 'der Kater folgt auf den Hund.', es: 'el gato sigue al perro.', ja: '猫は犬に続きます。', pt: 'o gato segue o cão.' }],
    // Spanish's a is a personal a, not A139's preposition: the pronoun is still the clitic.
    ['a pronoun object', { directObject: np('THIRD_PERSON', { antecedent: 'DOG' }) },
      { en: 'the cat follows it.', it: 'il gatto lo segue.', fr: 'le chat le suit.', de: 'der Kater folgt auf ihn.', es: 'el gato lo sigue.', ja: '猫はそれに続きます。', pt: 'o gato o segue.' }],
    // The negative determiner keeps its particle in Japanese: どの犬にも.
    ['a negative object', { directObject: np('DOG', { definiteness: 'no' }) },
      { en: 'the cat follows no dog.', it: 'il gatto non segue nessun cane.', fr: 'le chat ne suit aucun chien.', de: 'der Kater folgt auf keinen Hund.', es: 'el gato no sigue a ningún perro.', ja: '猫はどの犬にも続きません。', pt: 'o gato não segue nenhum cão.' }],
  ])('%s', (_, plan, rendered) => {
    expect(sayAll({ subject: CAT, verbPhrase: { verb: 'FOLLOW' }, ...plan } as PhrasePlan)).toEqual(rendered);
  });

  test('an object relative: German keeps auf, Japanese gaps its particle', () => {
    expect(sayAll({ subject: np('DOG', { relative: { headRole: 'directObject', subject: CAT, verbPhrase: { verb: 'FOLLOW' } } }), verbPhrase: { verb: 'RUN' } }))
      .toEqual({
        en: 'the dog that the cat follows runs.', it: 'il cane che il gatto segue corre.', fr: 'le chien que le chat suit court.',
        de: 'der Hund, auf den der Kater folgt, läuft.', es: 'el perro que el gato sigue corre.', ja: '猫が続く犬は走ります。', pt: 'o cão que o gato segue corre.',
      });
  });

  // What must not move: a verb with no lexical particle keeps を, and A139's CLICK keeps its
  // prepositions and its "sur lequel" / "auf die" relatives.
  test('verbs that name no particle or preposition are unchanged', () => {
    expect(sayAll({ subject: CAT, verbPhrase: { verb: 'EAT' }, directObject: np('MOUSE') }).ja).toBe('猫はネズミを食べます。');
    expect(sayAll({ subject: np('BUTTON', { relative: { headRole: 'directObject', subject: CAT, verbPhrase: { verb: 'CLICK' } } }) })).toEqual({
      en: 'the button that the cat clicks.', it: 'il pulsante sul quale il gatto clicca.', fr: 'le bouton sur lequel le chat clique.',
      de: 'die Taste, auf die der Kater klickt.', es: 'el botón en el que el gato clica.', ja: '猫がクリックするボタン。', pt: 'o botão no qual o gato clica.',
    });
  });
});

describe('the four glosses they shipped (localization C24)', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    ['FIRST', { en: 'that all other objects follow.', it: 'che tutti gli altri oggetti seguono.', fr: 'que tous les autres objets suivent.', de: 'auf den alle anderen Gegenstände folgen.', es: 'que todos los otros objetos siguen.', ja: 'すべての別の物体が続く。', pt: 'que todos os outros objetos seguem.' }],
    ['SECOND', { en: 'that follows the first object.', it: 'che segue il primo oggetto.', fr: 'qui suit le premier objet.', de: 'der auf den ersten Gegenstand folgt.', es: 'que sigue al primer objeto.', ja: '第一の物体に続く。', pt: 'que segue o primeiro objeto.' }],
    ['THIRD', { en: 'that follows the second object.', it: 'che segue il secondo oggetto.', fr: 'qui suit le deuxième objet.', de: 'der auf den zweiten Gegenstand folgt.', es: 'que sigue al segundo objeto.', ja: '第二の物体に続く。', pt: 'que segue o segundo objeto.' }],
    ['CONDITIONAL', { en: 'on which another clause depends.', it: "dalla quale un'altra proposizione dipende.", fr: 'dont une autre proposition dépend.', de: 'von dem ein anderer Satz abhängt.', es: 'de la que otra oración depende.', ja: '別の節が依存する。', pt: 'da qual outra oração depende.' }],
  ])('%s', (concept, rendered) => {
    expect(definitionAll(concept)).toEqual(rendered);
  });
});
