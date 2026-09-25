import { describe, expect, test } from 'vitest';
import type { ContentClause, LanguageCode, NounPhrase, PhrasePlan, VerbPhrase, ReadyLanguageCode } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// P09-E39: the sentence adverbs MAYBE, PROBABLY, ACTUALLY and OF_COURSE (`subtype: 'sentence'`). They
// comment on the whole clause and stand outside its negation: clause-initial in a main statement in
// the European languages — German as the first constituent, the verb second; French *peut-être* with
// *que*; Portuguese *talvez* with the subjunctive — and right after the topic in Japanese. In a
// question or a subordinate clause they stand where a frequency adverb does, outside a negation
// there too (`negative_slot`).

const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });
const eats = (modifier: string, verbPhrase: Partial<VerbPhrase> = {}): PhrasePlan =>
  clause(the('CAT'), 'EAT', { directObject: the('FOOD'), verbPhrase: { modifier, ...verbPhrase } });
const yesNo = (plan: PhrasePlan): PhrasePlan => ({ ...plan, interrogative: true });

describe('P09-E39: maybe — the task table', () => {
  test('maybe the cat did not eat the food', () => {
    expect(sayAll(eats('MAYBE', { negative: true, tense: 'past' }))).toEqual({
      en: 'maybe the cat did not eat the food.', it: 'forse il gatto non mangiò il cibo.',
      fr: 'peut-être que le chat ne mangea pas la nourriture.', de: 'vielleicht fraß der Kater das Essen nicht.',
      es: 'quizás el gato no comió la comida.', ja: '猫はもしかすると食べ物を食べませんでした。',
      pt: 'talvez o gato não tenha comido a comida.',
    });
  });

  test('affirmative, present and past: Portuguese takes the present and the perfect subjunctive', () => {
    expect(sayAll(eats('MAYBE'))).toEqual({
      en: 'maybe the cat eats the food.', it: 'forse il gatto mangia il cibo.', fr: 'peut-être que le chat mange la nourriture.',
      de: 'vielleicht frisst der Kater das Essen.', es: 'quizás el gato come la comida.', ja: '猫はもしかすると食べ物を食べます。',
      pt: 'talvez o gato coma a comida.',
    });
    expect(sayAll(eats('MAYBE', { tense: 'past' }))).toEqual({
      en: 'maybe the cat ate the food.', it: 'forse il gatto mangiò il cibo.', fr: 'peut-être que le chat mangea la nourriture.',
      de: 'vielleicht fraß der Kater das Essen.', es: 'quizás el gato comió la comida.', ja: '猫はもしかすると食べ物を食べました。',
      pt: 'talvez o gato tenha comido a comida.',
    });
    expect(sayAll(eats('MAYBE', { negative: true }))).toEqual({
      en: 'maybe the cat does not eat the food.', it: 'forse il gatto non mangia il cibo.',
      fr: 'peut-être que le chat ne mange pas la nourriture.', de: 'vielleicht frisst der Kater das Essen nicht.',
      es: 'quizás el gato no come la comida.', ja: '猫はもしかすると食べ物を食べません。', pt: 'talvez o gato não coma a comida.',
    });
  });

  test('the Portuguese subjunctive follows the tense and the aspect', () => {
    expect(sayAll(eats('MAYBE', { tense: 'future' })).pt).toBe('talvez o gato coma a comida.');
    expect(sayAll(eats('MAYBE', { tense: 'past', aspect: 'resultative' })).pt).toBe('talvez o gato tivesse comido a comida.');
    expect(sayAll(eats('MAYBE', { aspect: 'progressive' })).pt).toBe('talvez o gato esteja comendo a comida.');
    expect(sayAll(clause(the('CAT'), 'BE', { verbPhrase: { modifier: 'MAYBE' }, complements: { predicative: { phrase: np('TIRED') } } })))
      .toMatchObject({ pt: 'talvez o gato esteja cansado.', es: 'quizás el gato está cansado.', de: 'vielleicht ist der Kater müde.' });
  });

  test('French elides que, German inverts a pronoun subject, pro-drop keeps no subject', () => {
    expect(sayAll(clause(np('MAN', { definiteness: 'indefinite' }), 'RUN', { verbPhrase: { modifier: 'MAYBE' } }))).toMatchObject({
      fr: "peut-être qu'un homme court.", de: 'vielleicht läuft ein Mann.', pt: 'talvez um homem corra.',
    });
    expect(sayAll(clause(np('THIRD_PERSON'), 'EAT', { verbPhrase: { modifier: 'MAYBE' } }))).toEqual({
      en: 'maybe he eats.', it: 'forse mangia.', fr: "peut-être qu'il mange.", de: 'vielleicht isst er.', es: 'quizás come.',
      ja: '彼はもしかすると食べます。', pt: 'talvez coma.',
    });
  });
});

describe('P09-E39: clitics and the existential', () => {
  test('a clitic stays in front of the verb behind the adverb: talvez a veja', () => {
    expect(sayAll(clause(np('THIRD_PERSON'), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { modifier: 'MAYBE' } })))
      .toEqual({
        en: 'maybe he sees her.', it: 'forse la vede.', fr: "peut-être qu'il la voit.", de: 'vielleicht sieht er sie.', es: 'quizás la ve.',
        ja: '彼はもしかすると彼女を見ます。', pt: 'talvez a veja.',
      });
  });

  test('the existential: German inverts its es, Japanese has no topic to follow', () => {
    const plan: PhrasePlan = {
      subject: np('CAT', { definiteness: 'indefinite' }), verbPhrase: { verb: 'BE', modifier: 'MAYBE' }, existential: true,
      complements: { locative: { phrase: the('HOUSE') } },
    };
    expect(sayAll(plan)).toEqual({
      en: 'maybe there is a cat in the house.', it: "forse c'è un gatto nella casa.", fr: "peut-être qu'il y a un chat dans la maison.",
      de: 'vielleicht gibt es einen Kater im Haus.', es: 'quizás hay un gato en la casa.', ja: 'もしかすると家に猫がいます。',
      pt: 'talvez haja um gato na casa.',
    });
  });
});

describe('P09-E39: the other three, negated and in the past', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    // French sets off a fronted *probablement* with a comma.
    ['PROBABLY', {
      en: 'probably the cat did not eat the food.', it: 'probabilmente il gatto non mangiò il cibo.',
      fr: 'probablement, le chat ne mangea pas la nourriture.', de: 'wahrscheinlich fraß der Kater das Essen nicht.',
      es: 'probablemente el gato no comió la comida.', ja: '猫はたぶん食べ物を食べませんでした。',
      pt: 'provavelmente o gato não comeu a comida.' }],
    // The discourse adverb takes a comma in four languages.
    ['ACTUALLY', {
      en: 'actually, the cat did not eat the food.', it: 'in realtà il gatto non mangiò il cibo.',
      fr: 'en fait, le chat ne mangea pas la nourriture.', de: 'eigentlich fraß der Kater das Essen nicht.',
      es: 'en realidad, el gato no comió la comida.', ja: '猫は実は食べ物を食べませんでした。',
      pt: 'na verdade, o gato não comeu a comida.' }],
    // Portuguese *claro* takes *que* once fronted, in the indicative.
    ['OF_COURSE', {
      en: 'of course the cat did not eat the food.', it: 'naturalmente il gatto non mangiò il cibo.',
      fr: 'bien sûr, le chat ne mangea pas la nourriture.', de: 'natürlich fraß der Kater das Essen nicht.',
      es: 'por supuesto, el gato no comió la comida.', ja: '猫はもちろん食べ物を食べませんでした。',
      pt: 'claro que o gato não comeu a comida.' }],
  ])('%s', (adverb, rendered) => {
    expect(sayAll(eats(adverb, { negative: true, tense: 'past' }))).toEqual(rendered);
  });

  test.each<[string, Record<ReadyLanguageCode, string>]>([
    ['PROBABLY', {
      en: 'probably the cat eats the food.', it: 'probabilmente il gatto mangia il cibo.', fr: 'probablement, le chat mange la nourriture.',
      de: 'wahrscheinlich frisst der Kater das Essen.', es: 'probablemente el gato come la comida.', ja: '猫はたぶん食べ物を食べます。',
      pt: 'provavelmente o gato come a comida.' }],
    ['ACTUALLY', {
      en: 'actually, the cat eats the food.', it: 'in realtà il gatto mangia il cibo.', fr: 'en fait, le chat mange la nourriture.',
      de: 'eigentlich frisst der Kater das Essen.', es: 'en realidad, el gato come la comida.', ja: '猫は実は食べ物を食べます。',
      pt: 'na verdade, o gato come a comida.' }],
    ['OF_COURSE', {
      en: 'of course the cat eats the food.', it: 'naturalmente il gatto mangia il cibo.', fr: 'bien sûr, le chat mange la nourriture.',
      de: 'natürlich frisst der Kater das Essen.', es: 'por supuesto, el gato come la comida.', ja: '猫はもちろん食べ物を食べます。',
      pt: 'claro que o gato come a comida.' }],
  ])('%s, affirmative present', (adverb, rendered) => {
    expect(sayAll(eats(adverb))).toEqual(rendered);
  });

  test('the Japanese ruby reads 実は', () => {
    const ja = translate(eats('ACTUALLY'), lookupLexicalEntry).find((t) => t.language === 'ja');
    expect(ja?.ruby).toContainEqual({ t: '実は', r: 'じつは' });
  });
});

describe('P09-E39: where the adverb cannot open the sentence', () => {
  // A question has no clause-initial slot for it, so it takes the frequency slot inside the group.
  test('a yes/no question', () => {
    expect(sayAll(yesNo(eats('MAYBE', { tense: 'past' })))).toEqual({
      en: 'did the cat maybe eat the food?', it: 'il gatto mangiò forse il cibo?',
      fr: 'est-ce que le chat mangea peut-être la nourriture\u00a0?', de: 'fraß der Kater vielleicht das Essen?',
      es: '¿el gato comió quizás la comida?', ja: '猫は食べ物をもしかすると食べましたか？', pt: 'o gato comeu talvez a comida?',
    });
    expect(sayAll(yesNo(eats('ACTUALLY', { aspect: 'resultative' })))).toMatchObject({
      en: 'has the cat actually eaten the food?', de: 'hat der Kater eigentlich das Essen gefressen?',
      fr: 'est-ce que le chat a en fait mangé la nourriture\u00a0?',
    });
  });

  test('a negated question keeps it outside the negation', () => {
    expect(sayAll(yesNo(eats('MAYBE', { negative: true, tense: 'past' })))).toMatchObject({
      it: 'il gatto forse non mangiò il cibo?', fr: 'est-ce que le chat ne mangea peut-être pas la nourriture\u00a0?',
      de: 'fraß der Kater das Essen vielleicht nicht?', es: '¿el gato quizás no comió la comida?',
      // Ahead of its negator *talvez* still precedes the verb, and takes the subjunctive there too.
      pt: 'o gato talvez não tenha comido a comida?',
    });
  });

  test('a content clause: the adverb outscopes its negation', () => {
    const says = (inner: PhrasePlan) => sayAll(clause(the('DOG'), 'SAY', { contentObject: inner as ContentClause }));
    expect(says(eats('MAYBE', { negative: true }))).toEqual({
      en: 'the dog says that the cat maybe does not eat the food.', it: 'il cane dice che il gatto forse non mangia il cibo.',
      fr: 'le chien dit que le chat ne mange peut-être pas la nourriture.',
      de: 'der Hund sagt, dass der Kater das Essen vielleicht nicht frisst.',
      es: 'el perro dice que el gato quizás no come la comida.', ja: '犬は猫が食べ物をもしかすると食べないと言います。',
      pt: 'o cão diz que o gato talvez não coma a comida.',
    });
    // *Talvez* ahead of the negator precedes its verb, which takes the subjunctive, the perfect one
    // for a past event; after an affirmative verb it follows it, and the verb keeps the indicative.
    expect(says(eats('MAYBE', { negative: true, tense: 'past' })).pt).toBe('o cão diz que o gato talvez não tenha comido a comida.');
    expect(says(eats('MAYBE')).pt).toBe('o cão diz que o gato come talvez a comida.');
    expect(says(eats('PROBABLY'))).toMatchObject({
      en: 'the dog says that the cat probably eats the food.', de: 'der Hund sagt, dass der Kater wahrscheinlich das Essen frisst.',
    });
  });

  test('a relative clause: the adverb outscopes its negation', () => {
    const cat = (modifier: string) =>
      clause(the('CAT', { relative: { verbPhrase: { verb: 'EAT', modifier, negative: true }, directObject: the('FOOD') } }), 'RUN');
    expect(sayAll(cat('MAYBE'))).toMatchObject({
      en: 'the cat that maybe does not eat the food runs.', it: 'il gatto che forse non mangia il cibo corre.',
      fr: 'le chat qui ne mange peut-être pas la nourriture court.', de: 'der Kater, der das Essen vielleicht nicht frisst, läuft.',
      es: 'el gato que quizás no come la comida corre.', pt: 'o gato que talvez não coma a comida corre.',
    });
    // The German relative reads `negative_slot` as the main clause does, so STILL, ALSO and ALREADY's
    // negative word lead its "nicht" too (it wrote "nicht noch", "nicht auch", "nicht schon").
    expect(['STILL', 'ALSO', 'ALREADY'].map((a) => sayAll(cat(a)).de)).toEqual([
      'der Kater, der das Essen noch nicht frisst, läuft.',
      'der Kater, der das Essen auch nicht frisst, läuft.',
      'der Kater, der das Essen noch nicht frisst, läuft.',
    ]);
  });

  test('a condition keeps it in the main clause\'s group', () => {
    expect(sayAll({ ...eats('MAYBE'), condition: clause(the('DOG'), 'RUN') })).toMatchObject({
      en: 'if the dog ran, the cat would maybe eat the food.', de: 'wenn der Hund laufen würde, würde der Kater vielleicht das Essen fressen.',
    });
  });

  test('a vocative stands before it, and a coordinated clause after it keeps its own order', () => {
    expect(sayAll({ ...eats('MAYBE'), address: { concept: 'MOM' } })).toMatchObject({
      en: 'Mom, maybe the cat eats the food.', de: 'Mama, vielleicht frisst der Kater das Essen.', ja: 'お母さん、猫はもしかすると食べ物を食べます。',
    });
    const pair = { ...eats('MAYBE', { tense: 'past' }), coordination: { conjunction: 'and' as const, clause: clause(the('DOG'), 'RUN', { verbPhrase: { tense: 'past' } }) } };
    expect(sayAll(pair)).toMatchObject({
      en: 'maybe the cat ate the food, and the dog ran.', de: 'vielleicht fraß der Kater das Essen, und der Hund lief.',
      pt: 'talvez o gato tenha comido a comida, e o cão correu.',
    });
  });
});

describe('P09-E39: the seeds', () => {
  test('PROBABLY is glossed on PROBABILITY; MAYBE and ACTUALLY stay on the literal', () => {
    const def = concepts.find((c) => c.id === 'PROBABLY')?.definition;
    expect(Object.fromEntries(translate(def!, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]))).toEqual({
      en: 'with high probability.', it: 'con probabilità alta.', fr: 'avec probabilité haute.', de: 'mit hoher Wahrscheinlichkeit.',
      es: 'con probabilidad alta.', ja: '高い確率で。', pt: 'com probabilidade alta.',
    });
    for (const id of ['MAYBE', 'ACTUALLY', 'PROBABILITY']) {
      expect(concepts.find((c) => c.id === id)?.definition, id).toBeUndefined();
    }
  });

  // Localization C41: OF_COURSE is the similative clause said alone, the statement-level "as one
  // expects" that a manner ("in the way that one expects") cannot say. French takes the pronominal
  // s'attendre à, its "à" resumed by "y": "comme on attend" would be "as one waits". None of the
  // seven says OF_COURSE's own word back (of course, naturalmente, bien sûr, natürlich, por
  // supuesto, もちろん, claro).
  test('OF_COURSE is glossed "as one expects"', () => {
    const def = concepts.find((c) => c.id === 'OF_COURSE')?.definition;
    expect(Object.fromEntries(translate(def!, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]))).toEqual({
      en: 'as one expects.', it: 'come si prevede.', fr: "comme on s'y attend.", de: 'wie man erwartet.',
      es: 'como se espera.', ja: '予想するように。', pt: 'como se espera.',
    });
  });

  test('PROBABILITY: a singular and a plural in every language', () => {
    expect(sayAll({ subject: the('PROBABILITY') })).toEqual({
      en: 'the probability.', it: 'la probabilità.', fr: 'la probabilité.', de: 'die Wahrscheinlichkeit.', es: 'la probabilidad.',
      ja: '確率。', pt: 'a probabilidade.',
    });
    expect(sayAll({ subject: the('PROBABILITY', { number: 'plural' }) })).toEqual({
      en: 'the probabilities.', it: 'le probabilità.', fr: 'les probabilités.', de: 'die Wahrscheinlichkeiten.', es: 'las probabilidades.',
      ja: '確率。', pt: 'as probabilidades.',
    });
  });

  test('REALLY is unmoved: it scopes inside the negation', () => {
    expect(sayAll(eats('REALLY', { negative: true }))).toMatchObject({
      en: 'the cat does not really eat the food.', it: 'il gatto non mangia davvero il cibo.',
    });
  });
});
