import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan, VerbPhrase, ReadyLanguageCode } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// Localization B63, P09's three modals: MAY (permission, glossed on ALLOWED as MUST is on OBLIGED and
// CAN on ABLE), and the two conditionals SHOULD and MIGHT, whose own glosses wait on a content clause
// (C30). Their paradigms are pinned here, not in the shared exhaustive tables, so the P09 lanes that
// seeded words the same day do not edit the same rows.
//
// The engine work the three needed, each pinned below:
//   en — "should" joins MODAL_AUX, so it negates and inverts as an auxiliary; a "be" periphrasis
//        (MAY's past "was allowed to") does the same, rather than taking do-support;
//   en/de — a `conditional` modal has no past of its own: its past is the perfect under it
//        ("should have run", "hätte laufen sollen"), and its future is its present;
//   fr — the modal chain negates a compound finite on its auxiliary ("n'aurait pas dû courir");
//   fr/es/pt — a conditional modal seeds the imperfect-subjunctive stem a protasis needs;
//   ja — a copula-kind modal (走るべきです) and one that governs the plain finite form, so the verb
//        before it carries tense and polarity (走らないかもしれません).

function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });
const runs = (verbPhrase: Partial<VerbPhrase>, subject = the('MAN'), extra: Partial<PhrasePlan> = {}) =>
  sayAll({ ...clause(subject, 'RUN', { verbPhrase }), ...extra } as PhrasePlan);

describe('the gloss B63 ships', () => {
  // C09's shape with a third adjective: BE + a predicate that governs ACT. In it/fr/es/pt MAY is CAN's
  // own verb, so the tooltip is all that tells the two picker rows apart.
  test('MAY — to be allowed to act', () => {
    expect(definitionAll('MAY')).toEqual({
      en: 'to be allowed to act.', it: 'essere autorizzato ad agire.', fr: 'être autorisé à agir.',
      de: 'berechtigt sein zu handeln.', es: 'estar autorizado a actuar.', ja: '行動することが許可されている。',
      pt: 'estar autorizado a agir.',
    });
  });

  test('SHOULD and MIGHT are conditionals, so neither is stative; MAY is', () => {
    const stative = (id: string) => concepts.find((c) => c.id === id)?.stative === true;
    expect(['MAY', 'SHOULD', 'MIGHT'].map(stative)).toEqual([true, false, false]);
    const modal = (id: string) => concepts.find((c) => c.id === id)?.modal === true;
    expect(['MAY', 'SHOULD', 'MIGHT'].map(modal)).toEqual([true, true, true]);
    // The picker names them by their synonym where the English lemma is ambiguous or defective.
    const synonym = (id: string) => concepts.find((c) => c.id === id)?.synonym;
    expect(['MAY', 'SHOULD', 'MIGHT'].map(synonym)).toEqual(['be allowed to', 'ought to', 'possibly']);
  });
});

describe('MAY: permission, and the "be allowed to" its past and future supplete', () => {
  test('present, negation and question', () => {
    expect(runs({ modals: ['MAY'] })).toEqual({
      en: 'the man may run.', it: "l'uomo può correre.", fr: "l'homme peut courir.", de: 'der Mann darf laufen.',
      es: 'el hombre puede correr.', ja: '男は走ることが許されます。', pt: 'o homem pode correr.',
    });
    expect(runs({ modals: [{ verb: 'MAY', negative: true }] })).toEqual({
      en: 'the man may not run.', it: "l'uomo non può correre.", fr: "l'homme ne peut pas courir.",
      de: 'der Mann darf nicht laufen.', es: 'el hombre no puede correr.', ja: '男は走ることが許されません。',
      pt: 'o homem não pode correr.',
    });
    expect(runs({ modals: ['MAY'] }, the('MAN'), { interrogative: true })).toEqual({
      // French sets its question mark off with a no-break space.
      en: 'may the man run?', it: "l'uomo può correre?", fr: "est-ce que l'homme peut courir ?",
      de: 'darf der Mann laufen?', es: '¿el hombre puede correr?', ja: '男は走ることが許されますか？',
      pt: 'o homem pode correr?',
    });
  });

  test('the past is "was allowed to", which negates and inverts on its own "be"', () => {
    expect(runs({ modals: ['MAY'], tense: 'past' })).toEqual({
      en: 'the man was allowed to run.', it: "l'uomo poteva correre.", fr: "l'homme pouvait courir.",
      de: 'der Mann durfte laufen.', es: 'el hombre podía correr.', ja: '男は走ることが許されました。',
      pt: 'o homem podia correr.',
    });
    // Never the do-support "did not be allowed to" / "did the man be allowed to".
    expect(runs({ modals: [{ verb: 'MAY', negative: true }], tense: 'past' })).toMatchObject({
      en: 'the man was not allowed to run.', de: 'der Mann durfte nicht laufen.',
      ja: '男は走ることが許されませんでした。',
    });
    expect(runs({ modals: ['MAY'], tense: 'past' }, the('MAN'), { interrogative: true })).toMatchObject({
      en: 'was the man allowed to run?', de: 'durfte der Mann laufen?', fr: "est-ce que l'homme pouvait courir ?",
    });
    expect(runs({ modals: ['MAY'], tense: 'past' }, the('MAN', { number: 'plural' }))).toMatchObject({
      en: 'the men were allowed to run.', de: 'die Männer durften laufen.', it: 'gli uomini potevano correre.',
    });
  });

  test('the future is "will be allowed to"', () => {
    expect(runs({ modals: ['MAY'], tense: 'future' })).toEqual({
      en: 'the man will be allowed to run.', it: "l'uomo potrà correre.", fr: "l'homme pourra courir.",
      de: 'der Mann wird laufen dürfen.', es: 'el hombre podrá correr.', ja: '男は走ることが許されます。',
      pt: 'o homem poderá correr.',
    });
  });
});

describe('SHOULD: a conditional, and a copula-kind modal in Japanese', () => {
  test('present, negation and question — "should" is a modal auxiliary now', () => {
    expect(runs({ modals: ['SHOULD'] })).toEqual({
      en: 'the man should run.', it: "l'uomo dovrebbe correre.", fr: "l'homme devrait courir.",
      de: 'der Mann sollte laufen.', es: 'el hombre debería correr.', ja: '男は走るべきです。',
      pt: 'o homem deveria correr.',
    });
    // Without "should" in MODAL_AUX English fell to do-support over the suppletive "be supposed to"
    // ("does not be supposed to run"); Japanese read 走るべきでありません as a verb-kind modal.
    expect(runs({ modals: [{ verb: 'SHOULD', negative: true }] })).toEqual({
      en: 'the man should not run.', it: "l'uomo non dovrebbe correre.", fr: "l'homme ne devrait pas courir.",
      de: 'der Mann sollte nicht laufen.', es: 'el hombre no debería correr.', ja: '男は走るべきではありません。',
      pt: 'o homem não deveria correr.',
    });
    expect(runs({ modals: ['SHOULD'] }, the('MAN'), { interrogative: true })).toEqual({
      en: 'should the man run?', it: "l'uomo dovrebbe correre?", fr: "est-ce que l'homme devrait courir ?",
      de: 'sollte der Mann laufen?', es: '¿el hombre debería correr?', ja: '男は走るべきですか？',
      pt: 'o homem deveria correr?',
    });
  });

  test('the past is the conditional perfect: should have run, hätte laufen sollen, 走るべきでした', () => {
    expect(runs({ modals: ['SHOULD'], tense: 'past' })).toEqual({
      en: 'the man should have run.', it: "l'uomo avrebbe dovuto correre.", fr: "l'homme aurait dû courir.",
      de: 'der Mann hätte laufen sollen.', es: 'el hombre habría debido correr.', ja: '男は走るべきでした。',
      pt: 'o homem teria devido correr.',
    });
    // French negates the compound finite on its auxiliary, not after the participle.
    expect(runs({ modals: [{ verb: 'SHOULD', negative: true }], tense: 'past' })).toEqual({
      en: 'the man should not have run.', it: "l'uomo non avrebbe dovuto correre.", fr: "l'homme n'aurait pas dû courir.",
      de: 'der Mann hätte nicht laufen sollen.', es: 'el hombre no habría debido correr.',
      ja: '男は走るべきではありませんでした。', pt: 'o homem não teria devido correr.',
    });
    expect(runs({ modals: ['SHOULD'], tense: 'past' }, the('MAN'), { interrogative: true })).toMatchObject({
      en: 'should the man have run?', de: 'hätte der Mann laufen sollen?', ja: '男は走るべきでしたか？',
    });
    expect(runs({ modals: ['SHOULD'], tense: 'past' }, the('MAN', { number: 'plural' }))).toMatchObject({
      en: 'the men should have run.', de: 'die Männer hätten laufen sollen.', it: 'gli uomini avrebbero dovuto correre.',
      fr: 'les hommes auraient dû courir.',
    });
  });

  test('a conditional covers the future, so the future is the present', () => {
    expect(runs({ modals: ['SHOULD'], tense: 'future' })).toEqual(runs({ modals: ['SHOULD'] }));
  });

  test('an adverb: the frequency one follows the auxiliary, the manner one trails', () => {
    expect(runs({ modals: [{ verb: 'SHOULD', modifier: 'ALWAYS' }], tense: 'past' })).toMatchObject({
      en: 'the man should always have run.', fr: "l'homme aurait toujours dû courir.",
      de: 'der Mann hätte immer laufen sollen.', ja: '男はいつも走るべきでした。',
    });
    expect(runs({ modals: [{ verb: 'SHOULD', negative: true }], modifier: 'FAST', tense: 'past' })).toMatchObject({
      en: 'the man should not have run fast.', fr: "l'homme n'aurait pas dû courir vite.",
      de: 'der Mann hätte nicht schnell laufen sollen.', ja: '男は速く走るべきではありませんでした。',
    });
  });
});

describe('MIGHT: a conditional, and 〜かもしれない on the plain finite verb', () => {
  test('present and negation — Japanese puts the polarity on the verb', () => {
    expect(runs({ modals: ['MIGHT'] })).toEqual({
      en: 'the man might run.', it: "l'uomo potrebbe correre.", fr: "l'homme pourrait courir.",
      de: 'der Mann könnte laufen.', es: 'el hombre podría correr.', ja: '男は走るかもしれません。',
      pt: 'o homem poderia correr.',
    });
    // 走るかもしれません would read as the positive, and かもしれます conjugates a suffix that never does.
    expect(runs({ modals: [{ verb: 'MIGHT', negative: true }] })).toEqual({
      en: 'the man might not run.', it: "l'uomo non potrebbe correre.", fr: "l'homme ne pourrait pas courir.",
      de: 'der Mann könnte nicht laufen.', es: 'el hombre no podría correr.', ja: '男は走らないかもしれません。',
      pt: 'o homem não poderia correr.',
    });
  });

  test('the past is the conditional perfect, and Japanese puts it on the verb', () => {
    expect(runs({ modals: ['MIGHT'], tense: 'past' })).toEqual({
      en: 'the man might have run.', it: "l'uomo avrebbe potuto correre.", fr: "l'homme aurait pu courir.",
      de: 'der Mann hätte laufen können.', es: 'el hombre habría podido correr.', ja: '男は走ったかもしれません。',
      pt: 'o homem teria podido correr.',
    });
    expect(runs({ modals: [{ verb: 'MIGHT', negative: true }], tense: 'past' })).toEqual({
      en: 'the man might not have run.', it: "l'uomo non avrebbe potuto correre.", fr: "l'homme n'aurait pas pu courir.",
      de: 'der Mann hätte nicht laufen können.', es: 'el hombre no habría podido correr.',
      ja: '男は走らなかったかもしれません。', pt: 'o homem não teria podido correr.',
    });
  });

  test('a negative adverb and a `no` subject still close the Japanese circumfix on the verb', () => {
    expect(runs({ modals: ['MIGHT'], modifier: 'NEVER' })).toMatchObject({
      en: 'the man might never run.', de: 'der Mann könnte nie laufen.', ja: '男は決して走らないかもしれません。',
    });
    expect(runs({ modals: ['MIGHT'] }, np('CAT', { definiteness: 'no' }))).toMatchObject({
      en: 'no cat might run.', fr: 'aucun chat ne pourrait courir.', ja: 'どの猫も走らないかもしれません。',
    });
  });
});

describe('the three in a chain, an aspect, a passive and a relative clause', () => {
  test('a conditional modal\'s past puts the perfect on what it governs', () => {
    // The inner modal carries it where it has a perfect form of its own; MIGHT's governed "possibly"
    // is no verb, so the perfect passes to the main verb.
    expect(runs({ modals: ['SHOULD', 'CAN'], tense: 'past' })).toMatchObject({
      en: 'the man should have been able to run.', it: "l'uomo avrebbe dovuto poter correre.",
      de: 'der Mann hätte laufen können sollen.', ja: '男は走ることができるべきでした。',
    });
    expect(runs({ modals: ['SHOULD', 'MIGHT'], tense: 'past' })).toMatchObject({
      en: 'the man should possibly have run.', fr: "l'homme aurait dû pouvoir courir.",
    });
    expect(runs({ modals: ['MIGHT', 'WILL'], tense: 'past' })).toMatchObject({
      en: 'the man might have wanted to run.', ja: '男は走りたかったかもしれません。',
    });
  });

  test('Japanese chains: the inner element is finite under かもしれない, bridged under 〜たい', () => {
    expect(runs({ modals: ['MIGHT', { verb: 'CAN', negative: true }] })).toMatchObject({ ja: '男は走ることができないかもしれません。' });
    expect(runs({ modals: ['MIGHT', 'SHOULD'] })).toMatchObject({ ja: '男は走るべきであるかもしれません。' });
    expect(runs({ modals: ['WILL', 'SHOULD'] })).toMatchObject({ ja: '男は走るべきであるようになりたいです。' });
    expect(runs({ modals: ['MUST', 'MAY'] })).toMatchObject({ ja: '男は走ることが許される必要があります。' });
  });

  test('an aspect under the two conditionals', () => {
    expect(runs({ modals: ['MIGHT'], aspect: 'resultative' })).toMatchObject({
      en: 'the man might have run.', it: "l'uomo potrebbe aver corso.", de: 'der Mann könnte gelaufen sein.',
      ja: '男は走ったかもしれません。',
    });
    expect(runs({ modals: [{ verb: 'MIGHT', negative: true }], aspect: 'progressive' })).toMatchObject({
      en: 'the man might not be running.', ja: '男は走っていないかもしれません。',
    });
    expect(runs({ modals: ['SHOULD'], aspect: 'progressive', tense: 'past' })).toMatchObject({
      en: 'the man should have been running.', ja: '男は走っているべきでした。',
    });
  });

  test('a copula predicate takes them too', () => {
    const isHappy = (verbPhrase: Partial<VerbPhrase>) =>
      sayAll(clause(the('CAT'), 'BE', { complements: { predicative: { phrase: np('HAPPY') } }, verbPhrase }));
    expect(isHappy({ modals: ['MIGHT'] })).toMatchObject({
      en: 'the cat might be happy.', de: 'der Kater könnte glücklich sein.', ja: '猫は幸せであるかもしれません。',
    });
    expect(isHappy({ modals: [{ verb: 'MIGHT', negative: true }], tense: 'past' })).toMatchObject({
      en: 'the cat might not have been happy.', ja: '猫は幸せではなかったかもしれません。',
    });
    expect(isHappy({ modals: [{ verb: 'SHOULD', negative: true }] })).toMatchObject({
      en: 'the cat should not be happy.', ja: '猫は幸せであるべきではありません。',
    });
  });

  test('a passive, an object and a pronoun object under a conditional past', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('FOOD'), verbPhrase: { voice: 'passive', modals: ['SHOULD'], tense: 'past' } })))
      .toMatchObject({
        en: 'the food should have been eaten by the cat.', it: 'il cibo avrebbe dovuto essere mangiato dal gatto.',
        de: 'das Essen hätte vom Kater gefressen werden sollen.', ja: '食べ物は猫に食べられるべきでした。',
      });
    expect(sayAll(clause(the('CAT'), 'EAT', { directObject: the('MOUSE'), verbPhrase: { modals: [{ verb: 'SHOULD', negative: true }], tense: 'past' } })))
      .toMatchObject({
        en: 'the cat should not have eaten the mouse.', fr: "le chat n'aurait pas dû manger la souris.",
        de: 'der Kater hätte die Maus nicht fressen sollen.', ja: '猫はネズミを食べるべきではありませんでした。',
      });
    expect(sayAll(clause(the('CAT'), 'EAT', { directObject: np('THIRD_PERSON', { gender: 'fem' }), verbPhrase: { modals: ['SHOULD'], tense: 'past' } })))
      .toMatchObject({ fr: 'le chat aurait dû la manger.', de: 'der Kater hätte sie fressen sollen.' });
  });

  test('a relative clause: German fronts hätte, Japanese takes the plain ending', () => {
    const catThat = (verbPhrase: Partial<VerbPhrase>) =>
      sayAll(clause(the('CAT', { relative: { verbPhrase: { verb: 'EAT', ...verbPhrase } } }), 'RUN'));
    expect(catThat({ modals: ['SHOULD'], tense: 'past' })).toMatchObject({
      en: 'the cat that should have eaten runs.', de: 'der Kater, der hätte fressen sollen, läuft.',
      ja: '食べるべきだった猫は走ります。',
    });
    expect(catThat({ modals: [{ verb: 'MIGHT', negative: true }] })).toMatchObject({
      en: 'the cat that might not eat runs.', ja: '食べないかもしれない猫は走ります。',
    });
    expect(catThat({ modals: [{ verb: 'MAY', negative: true }], tense: 'past' })).toMatchObject({
      en: 'the cat that was not allowed to eat runs.', ja: '食べることが許されなかった猫は走ります。',
    });
  });

  test('an "if" clause takes the imperfect subjunctive the seeded stem gives', () => {
    const ifThey = (verbPhrase: Partial<VerbPhrase>, subject = np('CAT')) => sayAll({
      ...clause(np('DOG'), 'RUN'),
      condition: clause(subject, 'EAT', { verbPhrase }),
    } as PhrasePlan);
    expect(ifThey({ modals: ['SHOULD'] })).toEqual({
      en: 'if the cat should eat, the dog would run.', it: 'se il gatto dovesse mangiare, il cane correrebbe.',
      fr: 'si le chat devait manger, le chien courrait.', de: 'wenn der Kater fressen sollte, würde der Hund laufen.',
      es: 'si el gato debiera comer, el perro correría.', ja: 'もし猫が食べるべきだったら、犬は走ります。',
      pt: 'se o gato devesse comer, o cão correria.',
    });
    expect(ifThey({ modals: ['MIGHT'] })).toMatchObject({
      fr: 'si le chat pouvait manger, le chien courrait.', es: 'si el gato pudiera comer, el perro correría.',
      pt: 'se o gato pudesse comer, o cão correria.', ja: 'もし猫が食べるかもしれないなら、犬は走ります。',
    });
    // The 1st plural writes its accent: pt ê for the regular dever, é for the strong poder.
    expect(ifThey({ modals: ['SHOULD'] }, np('FIRST_PERSON', { number: 'plural' }))).toMatchObject({
      es: 'si debiéramos comer, el perro correría.', pt: 'se devêssemos comer, o cão correria.',
    });
    expect(ifThey({ modals: ['MIGHT'] }, np('FIRST_PERSON', { number: 'plural' }))).toMatchObject({
      es: 'si pudiéramos comer, el perro correría.', pt: 'se pudéssemos comer, o cão correria.',
    });
  });
});
