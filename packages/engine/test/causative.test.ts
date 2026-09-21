import { describe, expect, test } from 'vitest';
import type { InfinitiveComplement, LanguageCode, NounElement, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// The CAUSATIVE (localization C08): an infinitive complement whose unspoken subject is the governing
// clause's **direct object**, not its subject — "to cause a person TO SEE objects" is the person
// seeing. Structurally it is C09's infinitive complement under a different controller
// (InfinitiveComplement.control), which decides three things: which noun a predicate adjective
// inside the clause agrees with, that the object is not also read as what the verb acts on, and — in
// Japanese — that the causee is spoken inside the clause with が, the whole closing on ようにする.
//
// The linking word is the governor's, as it always is: indurre / induire / inducir / induzir A,
// English "to", German a zu-infinitive after a comma, Japanese ように in place of the ことを of a
// subject-controlled clause.

const cause = (object: NounElement, clause: InfinitiveComplement): PhrasePlan => ({
  subject: np('GENERIC_PERSON'),
  verbPhrase: { verb: 'CAUSE_VERB' },
  directObject: object,
  infinitiveComplement: { ...clause, control: 'object' },
  infinitive: true,
});
const predicate = (adjective: string, headDegree?: 'more') => ({
  predicative: { phrase: np(adjective, headDegree ? { headDegree } : {}) },
});

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

describe('the causative definitions (localization C08)', () => {
  test('SHOW is "to cause a person to see objects"', () => {
    expect(definitionAll('SHOW')).toEqual({
      en: 'to cause a person to see objects.',
      it: 'indurre una persona a vedere oggetti.',
      fr: 'induire une personne à voir des objets.',
      de: 'eine Person veranlassen, Gegenstände zu sehen.',
      es: 'inducir a una persona a ver objetos.', // the personal "a" on a human object, then the link
      ja: '人が物体を見るようにする。', // 見る, never the 見せる it defines
      pt: 'induzir uma pessoa a ver objetos.',
    });
  });

  test('HIDE is causing something NOT to be visible — the negation sits on the caused clause', () => {
    expect(definitionAll('HIDE')).toEqual({
      en: 'to cause an object not to be visible.',
      it: 'indurre un oggetto a non essere visibile.',
      fr: "induire un objet à ne pas être visible.",
      de: 'einen Gegenstand veranlassen, nicht sichtbar zu sein.',
      es: 'inducir un objeto a no estar visible.', // no personal "a": the object is not human
      ja: '物体が可視ではないようにする。',
      pt: 'induzir um objeto a não estar visível.',
    });
  });

  test('COORDINATE is "to cause people to act together"', () => {
    expect(definitionAll('COORDINATE')).toEqual({
      en: 'to cause people to act together.',
      it: 'indurre persone ad agire insieme.', // the euphonic d before another a
      fr: 'induire des personnes à agir ensemble.',
      de: 'Personen veranlassen, zusammen zu handeln.',
      // "juntos" is a predicative adjective in es/pt and agrees with the causee, feminine in both
      // (A162); the other five have a true adverb and cite one form.
      es: 'inducir personas a actuar juntas.',
      ja: '人が一緒に行動するようにする。',
      pt: 'induzir pessoas a agir juntas.',
    });
  });

  test('START is "to cause an action to begin" — its own lemma in the five labile languages', () => {
    expect(definitionAll('START')).toEqual({
      en: 'to cause an action to begin.',
      it: "indurre un'azione a iniziare.",
      fr: 'induire une action à commencer.',
      de: 'eine Handlung veranlassen, zu beginnen.',
      es: 'inducir una acción a empezar.',
      ja: '動作が始まるようにする。', // 始まる, the inchoative, against the 始める it defines
      pt: 'induzir uma ação a começar.',
    });
  });

  test('COMPACT and EXPAND cause a change of degree, not of kind', () => {
    expect(definitionAll('COMPACT')).toEqual({
      en: 'to cause an object to become smaller.',
      it: 'indurre un oggetto a diventare più piccolo.',
      fr: 'induire un objet à devenir plus petit.',
      de: 'einen Gegenstand veranlassen, kleiner zu werden.',
      es: 'inducir un objeto a volverse más pequeño.',
      ja: '物体がもっと小さくなるようにする。',
      pt: 'induzir um objeto a tornar-se menor.',
    });
    expect(definitionAll('EXPAND')).toEqual({
      en: 'to cause an object to become bigger.',
      it: 'indurre un oggetto a diventare più grande.',
      fr: 'induire un objet à devenir plus grand.',
      de: 'einen Gegenstand veranlassen, größer zu werden.',
      es: 'inducir un objeto a volverse más grande.',
      ja: '物体がもっと大きくなるようにする。',
      pt: 'induzir um objeto a tornar-se maior.',
    });
  });

  // Not a causative: APPEAR is the state itself, BECOME + VISIBLE, which needed only the adjective.
  // C19's two causatives. ADD's companion is the **comitative** complement, the one that says
  // "together with" rather than "by means of" (と in Japanese, "with" everywhere else); it is
  // indefinite because French spells no zero-article plural after a preposition.
  test('ADD is "to cause an object to be with other objects" — the comitative, not the instrumental', () => {
    expect(definitionAll('ADD')).toEqual({
      en: 'to cause an object to be with other objects.',
      it: 'indurre un oggetto a essere con altri oggetti.',
      fr: "induire un objet à être avec d'autres objets.",
      de: 'einen Gegenstand veranlassen, mit anderen Gegenständen zu sein.',
      es: 'inducir un objeto a ser con otros objetos.',
      ja: '物体が別の物体とあるようにする。',
      pt: 'induzir um objeto a ser com outros objetos.',
    });
  });

  // TIDY carries the state the literal's "back … in order" was reaching for. The seeded ORDER is
  // the *command* sense (de "Befehl", ja 命令), so "in order" could not be said with it at all.
  // The adjective is transient, so es/pt predicate it with estar, and it agrees with the causee.
  test('TIDY_UP is "to cause objects to be tidy"', () => {
    expect(definitionAll('TIDY_UP')).toEqual({
      en: 'to cause objects to be tidy.',
      it: 'indurre oggetti a essere ordinati.',
      fr: 'induire des objets à être rangés.',
      de: 'Gegenstände veranlassen, ordentlich zu sein.',
      es: 'inducir objetos a estar ordenados.',
      ja: '物体が整然としているようにする。',
      pt: 'induzir objetos a estar arrumados.',
    });
  });

  test('APPEAR is "to become visible"', () => {
    expect(definitionAll('APPEAR')).toEqual({
      en: 'to become visible.',
      it: 'diventare visibile.',
      fr: 'devenir visible.',
      de: 'sichtbar werden.',
      es: 'volverse visible.',
      ja: '可視になる。',
      pt: 'tornar-se visível.',
    });
  });
});

describe('object control', () => {
  // The one place the two controls differ on the surface of the European languages: the predicate
  // adjective inside the clause agrees with whichever noun controls it.
  test("a predicate adjective agrees with the object, not with the clause's subject", () => {
    const desires = (control?: 'object') => sayAll(clause(np('CAT', { gender: 'fem' }), 'DESIRE', {
      directObject: np('FOOD'),
      infinitiveComplement: { verbPhrase: { verb: 'BE' }, complements: predicate('CAREFUL'), ...(control ? { control } : {}) },
    }));
    expect(desires().it).toBe('la gatta desidera il cibo essere attenta.'); // the cat is the careful one
    expect(desires('object').it).toBe('la gatta desidera il cibo essere attento.'); // the food is
  });

  test('object control with no object to control it falls back to the subject', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'DESIRE', {
      infinitiveComplement: { verbPhrase: { verb: 'BE' }, complements: predicate('CAREFUL'), control: 'object' },
    }))).toMatchObject({
      en: 'the cat desires to be careful.',
      it: 'la gatta desidera essere attenta.',
      ja: '猫は慎重であることを望んでいます。',
    });
  });

  test('Japanese speaks the causee inside the clause with が, and closes on する', () => {
    // 食べ物 stays the matrix object under subject control (…を望んでいます) and moves inside the
    // clause under object control (食べ物が…), which is the whole difference.
    const desires = (control?: 'object') => sayAll(clause(np('CAT'), 'DESIRE', {
      directObject: np('FOOD'),
      infinitiveComplement: { verbPhrase: { verb: 'BE' }, complements: predicate('CAREFUL'), ...(control ? { control } : {}) },
    })).ja;
    expect(desires()).toBe('猫は慎重であることを食べ物を望んでいます。');
    expect(desires('object')).toBe('猫は食べ物が慎重であることを望んでいます。');
  });

  test('a finite causative keeps its tense and agreement, and Japanese its polite します', () => {
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'CAUSE_VERB', {
      verbPhrase: { tense: 'past' },
      directObject: np('PERSON', { definiteness: 'indefinite' }),
      infinitiveComplement: { verbPhrase: { verb: 'RUN' }, control: 'object' },
    }))).toEqual({
      en: 'the cats caused a person to run.',
      it: 'i gatti indussero una persona a correre.',
      fr: 'les chats induisirent une personne à courir.',
      de: 'die Kater veranlassten eine Person, zu laufen.',
      es: 'los gatos indujeron a una persona a correr.',
      ja: '猫は人が走るようにしました。',
      pt: 'os gatos induziram uma pessoa a correr.',
    });
  });

  test('a feminine causee agrees the clause in the Romance languages', () => {
    expect(sayAll(clause(np('DOG'), 'CAUSE_VERB', {
      directObject: np('CAT', { gender: 'fem' }),
      infinitiveComplement: { verbPhrase: { verb: 'BE' }, complements: predicate('VISIBLE'), control: 'object' },
    }))).toMatchObject({
      en: 'the dog causes the cat to be visible.',
      it: 'il cane induce la gatta a essere visibile.',
      de: 'der Hund veranlasst die Katze, sichtbar zu sein.',
      ja: '犬は猫が可視であるようにします。',
    });
  });

  // Japanese is left out: a negated こと clause takes the citation's polite negative, 行動しません (B13).
  // A negated *copula* is not affected, which is why HIDE's definition renders in all seven.
  test('the caused clause negates on its own', () => {
    expect(sayAll(cause(np('PERSON', { definiteness: 'indefinite' }), { verbPhrase: { verb: 'ACT', negative: true } }))).toMatchObject({
      en: 'to cause a person not to act.',
      it: 'indurre una persona a non agire.',
      fr: 'induire une personne à ne pas agir.',
      de: 'eine Person veranlassen, nicht zu handeln.',
      es: 'inducir a una persona a no actuar.',
      pt: 'induzir uma pessoa a não agir.',
    });
  });
});

// The causative verb standing on its own, with an object of its own and no clause to govern: the
// lexeme's own word, which is what the four Romance languages take the "induce" verb for. Japanese
// keeps 引き起こす here — する is the construction's, not the lexeme's.
describe('CAUSE_VERB as a plain transitive verb', () => {
  const causesFire = (verbPhrase: Partial<PhrasePlan['verbPhrase']> = {}, gender?: 'fem') => sayAll(
    clause(np('CAT', gender ? { gender } : {}), 'CAUSE_VERB', {
      verbPhrase,
      directObject: np('FIRE', { definiteness: 'indefinite' }),
    }),
  );

  test('present', () => {
    expect(causesFire()).toEqual({
      en: 'the cat causes a fire.',
      it: 'il gatto induce un fuoco.',
      fr: 'le chat induit un feu.',
      de: 'der Kater veranlasst ein Feuer.',
      es: 'el gato induce un fuego.',
      ja: '猫は火を引き起こします。',
      pt: 'o gato induz um fogo.',
    });
  });

  test('future', () => {
    expect(causesFire({ tense: 'future' })).toMatchObject({
      en: 'the cat will cause a fire.',
      it: 'il gatto indurrà un fuoco.', // indurre contracts: indurrà, not *inducerà
      fr: 'le chat induira un feu.',
      de: 'der Kater wird ein Feuer veranlassen.',
      es: 'el gato inducirá un fuego.',
      pt: 'o gato induzirá um fogo.',
    });
  });

  test('resultative — avere + the irregular participle', () => {
    expect(causesFire({ aspect: 'resultative' }, 'fem')).toMatchObject({
      en: 'the cat has caused a fire.',
      it: 'la gatta ha indotto un fuoco.', // indotto, and avere leaves it unagreed
      fr: 'la chatte a induit un feu.',
      de: 'die Katze hat ein Feuer veranlasst.',
      es: 'la gata ha inducido un fuego.',
    });
  });
});

// The inchoative the same file asked for ("to begin to be —"). It needed no engine work: an
// infinitive complement under BEGIN already nested, and only the link BEGIN takes was missing.
describe('the inchoative', () => {
  test('BEGIN links its infinitive — a / à in Romance, が on the ja こと clause', () => {
    expect(sayAll(clause(np('CAT'), 'BEGIN', {
      infinitiveComplement: { verbPhrase: { verb: 'BE' }, complements: predicate('VISIBLE') },
    }))).toEqual({
      en: 'the cat begins to be visible.',
      it: 'il gatto inizia a essere visibile.',
      fr: 'le chat commence à être visible.',
      de: 'der Kater beginnt, sichtbar zu sein.',
      es: 'el gato empieza a estar visible.',
      ja: '猫は可視であることが始まります。',
      pt: 'o gato começa a estar visível.',
    });
  });

  test('as a citation, with the Italian euphonic d', () => {
    expect(sayAll({
      ...clause(np('GENERIC_PERSON'), 'BEGIN', { infinitiveComplement: { verbPhrase: { verb: 'ACT' } } }),
      infinitive: true,
    })).toMatchObject({
      en: 'to begin to act.',
      it: 'iniziare ad agire.',
      ja: '行動することが始まる。',
    });
  });
});
