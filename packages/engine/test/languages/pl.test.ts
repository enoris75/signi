import { describe, expect, test } from 'vitest';
import type { Complement, NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, translateAll } from '../harness.js';

// Polish (P05): the language's own suite while it is a preview language (P05 §4). Every line is the
// engine's output over the real `pl` column (packages/backend/src/concepts/pl), checked against
// docs/features/O-open/P05-polish/style-pl.md and standard written Polish; every row is *(verify)*
// until the native review (P05-E11). A known gap is a `test.fails('known bugs: …')` row stating what
// Polish writes.

const pl = (plan: PhrasePlan): string => say(plan, 'pl');

const I = np('FIRST_PERSON');
const YOU = np('SECOND_PERSON');
const WE = np('FIRST_PERSON', { number: 'plural' });
const YOU_ALL = np('SECOND_PERSON', { number: 'plural' });
const ONE = np('GENERIC_PERSON');
const CAT = np('CAT');
const MOUSE = np('MOUSE');
const DOG = np('DOG');
const OWN = { kind: 'coreferent', slot: 'subject' } as NounPhrase['possessor'];
const HIS = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } as NounPhrase['possessor'];
const MY = { kind: 'pronominal', person: '1', number: 'singular' } as NounPhrase['possessor'];
const eats = (vp: Partial<VerbPhrase> = {}, rest: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> = {}): PhrasePlan =>
  clause(CAT, 'EAT', { directObject: MOUSE, ...rest, verbPhrase: vp });
const runs = (complement: keyof NonNullable<PhrasePlan['complements']>, c: Complement, subject: NounElement = CAT, verb = 'RUN'): PhrasePlan =>
  clause(subject, verb, { complements: { [complement]: c } });
const command = (addressee: NounPhrase, vp: Partial<VerbPhrase> = {}, rest: Partial<PhrasePlan> = {}): PhrasePlan =>
  ({ ...clause(addressee, 'EAT', { directObject: MOUSE, verbPhrase: vp }), imperative: true, ...rest });

describe('P05: the opening table', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat eats the mouse', eats(), 'kot je mysz.'],
    ['the cat ate the mouse — perfective', eats({ tense: 'past' }), 'kot zjadł mysz.'],
    ['the (female) cat ate the mouse — the past agrees', clause(np('CAT', { gender: 'fem' }), 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'kotka zjadła mysz.'],
    ['the cat will eat the mouse — perfective future', eats({ tense: 'future' }), 'kot zje mysz.'],
    ['the cat was eating the mouse — imperfective', eats({ tense: 'past', aspect: 'progressive' }), 'kot jadł mysz.'],
    ['the cat does not eat the mouse — genitive of negation', eats({ negative: true }), 'kot nie je myszy.'],
    ['the cat never eats the mouse', eats({ modifier: 'NEVER' }), 'kot nigdy nie je myszy.'],
    ['the cat sees the dog — animate accusative', clause(CAT, 'SEE', { directObject: DOG }), 'kot widzi psa.'],
    ['the boys ate', clause(np('BOY', { number: 'plural' }), 'EAT', { verbPhrase: { tense: 'past' } }), 'chłopcy zjedli.'],
    ['the girls ate', clause(np('GIRL', { number: 'plural' }), 'EAT', { verbPhrase: { tense: 'past' } }), 'dziewczyny zjadły.'],
    ['the cat runs to the house', runs('direction', { phrase: np('HOUSE') }), 'kot biegnie do domu.'],
    ['the cat runs away from the house', runs('source', { phrase: np('HOUSE') }), 'kot biegnie od domu.'],
    ['the cat runs in the house', runs('locative', { phrase: np('HOUSE') }), 'kot biegnie w domu.'],
    ['the man gives the book to the child', clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('CHILD') } } }), 'mężczyzna daje książkę dziecku.'],
    ['the cat becomes a legend — instrumental', clause(CAT, 'BECOME', { complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } } }), 'kot staje się legendą.'],
    ['many cats eat — genitive plural, singular verb', clause(np('CAT', { definiteness: 'many' }), 'EAT'), 'wiele kotów je.'],
    ['we eat — pro-drop', clause(WE, 'EAT'), 'jemy.'],
    ['one eats the mouse — impersonal się', clause(ONE, 'EAT', { directObject: MOUSE }), 'je się mysz.'],
    ['the cat eats its own food — swój', clause(CAT, 'EAT', { directObject: np('FOOD', { possessor: OWN }) }), 'kot je swoje jedzenie.'],
    ['the cat eats his food — someone else\'s', clause(CAT, 'EAT', { directObject: np('FOOD', { possessor: HIS }) }), 'kot je jego jedzenie.'],
    ['if the dog ran, the cat would eat the mouse', { ...eats(), condition: clause(DOG, 'RUN', { verbPhrase: { tense: 'past' } }) }, 'gdyby pies biegł, kot zjadłby mysz.'],
    ['eat the mouse!', command(YOU), 'zjedz mysz.'],
    ["don't eat the mouse!", command(YOU, { negative: true }), 'nie jedz myszy.'],
  ])('%s', (_label, plan, expected) => {
    expect(pl(plan)).toBe(expected);
  });
});

describe('P05 §0.3: the aspect-selection table', () => {
  test.each<[string, PhrasePlan, string]>([
    ['present, neutral: imperfective', eats(), 'kot je mysz.'],
    ['past, neutral: perfective', eats({ tense: 'past' }), 'kot zjadł mysz.'],
    ['future, neutral: perfective', eats({ tense: 'future' }), 'kot zje mysz.'],
    ['progressive present', eats({ aspect: 'progressive' }), 'kot je mysz.'],
    ['progressive past', eats({ tense: 'past', aspect: 'progressive' }), 'kot jadł mysz.'],
    ['progressive future: będzie + participle', eats({ tense: 'future', aspect: 'progressive' }), 'kot będzie jadł mysz.'],
    ['prospective: zaraz + perfective future', eats({ aspect: 'prospective' }), 'kot zaraz zje mysz.'],
    ['resultative: perfective past', eats({ aspect: 'resultative' }), 'kot zjadł mysz.'],
    ['with a frequency adverb: imperfective', eats({ modifier: 'ALWAYS', tense: 'past' }), 'kot zawsze jadł mysz.'],
    ['under a modal: perfective infinitive', eats({ modals: ['MUST'] }), 'kot musi zjeść mysz.'],
    ['under a negated modal: imperfective', eats({ modals: [{ verb: 'MUST', negative: true }] }), 'kot nie musi jeść myszy.'],
    ['a negated group under a modal: imperfective too', eats({ modals: ['MUST'], negative: true }), 'kot musi nie jeść myszy.'],
    ['conditional: perfective', { ...eats(), condition: clause(DOG, 'RUN', { verbPhrase: { tense: 'past' } }) }, 'gdyby pies biegł, kot zjadłby mysz.'],
    ['imperative: perfective', command(YOU), 'zjedz mysz.'],
    ['negative imperative: imperfective', command(YOU, { negative: true }), 'nie jedz myszy.'],
    ['negation otherwise unchanged', eats({ tense: 'past', negative: true }), 'kot nie zjadł myszy.'],
  ])('%s', (_label, plan, expected) => {
    expect(pl(plan)).toBe(expected);
  });
});

describe('P05 §2.1: case by slot', () => {
  test.each<[string, PhrasePlan, string]>([
    ['subject: nominative', clause(np('WOMAN'), 'RUN'), 'kobieta biegnie.'],
    ['direct object: accusative', clause(CAT, 'SEE', { directObject: np('WOMAN') }), 'kot widzi kobietę.'],
    ['direct object under negation: genitive', clause(CAT, 'SEE', { directObject: np('WOMAN'), verbPhrase: { negative: true } }), 'kot nie widzi kobiety.'],
    ['terminus: dative', clause(np('MAN'), 'GIVE', { directObject: np('FOOD'), complements: { terminus: { phrase: CAT } } }), 'mężczyzna daje jedzenie kotu.'],
    ['possessor: genitive, postnominal', clause(DOG, 'EAT', { directObject: np('FOOD', { possessor: CAT }) }), 'pies je jedzenie kota.'],
    ['noun modifier: genitive', { subject: np('BOOK', { nounModifiers: [{ concept: 'CHILD', relation: 'purpose' }] }) }, 'książka dziecka.'],
    ['predicative noun: instrumental', clause(CAT, 'BE', { complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } } }), 'kot jest legendą.'],
    ['predicative adjective: nominative', clause(np('WOMAN'), 'BE', { complements: { predicative: { phrase: np('HAPPY') } } }), 'kobieta jest szczęśliwa.'],
  ])('%s', (_label, plan, expected) => {
    expect(pl(plan)).toBe(expected);
  });
});

describe('P05 §2.3: complements', () => {
  const house = (specifiers?: Complement['specifiers']): Complement => ({ phrase: np('HOUSE'), ...(specifiers ? { specifiers } : {}) });
  test.each<[string, PhrasePlan, string]>([
    ['locative w + loc', runs('locative', house()), 'kot biegnie w domu.'],
    ['locative pod + ins', runs('locative', house([{ kind: 'path', value: 'under' }])), 'kot biegnie pod domem.'],
    ['locative za + ins', runs('locative', house([{ kind: 'path', value: 'behind' }])), 'kot biegnie za domem.'],
    ['locative przed + ins', runs('locative', house([{ kind: 'path', value: 'in_front_of' }])), 'kot biegnie przed domem.'],
    ['locative na + loc', runs('locative', house([{ kind: 'path', value: 'on' }])), 'kot biegnie na domu.'],
    ['locative wokół + gen', runs('locative', house([{ kind: 'path', value: 'around' }])), 'kot biegnie wokół domu.'],
    ['direction do + gen', runs('direction', { phrase: np('CHILD') }), 'kot biegnie do dziecka.'],
    ['source od + gen', runs('source', house()), 'kot biegnie od domu.'],
    ['route przez + acc', runs('route', house()), 'kot biegnie przez dom.'],
    ['cause z powodu + gen', runs('cause', { phrase: DOG }), 'kot biegnie z powodu psa.'],
    ['cause dzięki + dat', runs('cause', { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'positive' }] }), 'kot biegnie dzięki psu.'],
    ['cause przez + acc', runs('cause', { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'negative' }] }), 'kot biegnie przez psa.'],
    ['manner jak + nom', runs('manner', { phrase: np('WATER') }), 'kot biegnie jak woda.'],
    ['instrumental: bare instrumental', clause(np('MAN'), 'EAT', { directObject: np('FOOD'), complements: { instrumental: { phrase: np('STICK') } } }), 'mężczyzna je jedzenie kijem.'],
    ['terminus: bare dative', clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('WOMAN') } } }), 'mężczyzna daje książkę kobiecie.'],
    ['predicative: instrumental noun', clause(CAT, 'BE', { complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } } }), 'kot jest legendą.'],
    ['comitative z + ins, euphonic ze mną', runs('comitative', { phrase: I }), 'kot biegnie ze mną.'],
    ['comitative z + ins', runs('comitative', { phrase: DOG }), 'kot biegnie z psem.'],
  ])('%s', (_label, plan, expected) => {
    expect(pl(plan)).toBe(expected);
  });
});

describe('P05-E7: the noun phrase', () => {
  test.each<[string, PhrasePlan, string]>([
    ['no articles', { subject: np('CAT', { definiteness: 'indefinite' }) }, 'kot.'],
    ['this / that', { subject: np('WOMAN', { definiteness: 'this' }) }, 'ta kobieta.'],
    ['that, plural virile', { subject: np('BOY', { definiteness: 'that', number: 'plural' }) }, 'tamci chłopcy.'],
    ['all, virile', { subject: np('BOY', { definiteness: 'all' }) }, 'wszyscy chłopcy.'],
    ['all, non-virile', { subject: np('CAT', { definiteness: 'all' }) }, 'wszystkie koty.'],
    ['adjective agreement, prenominal', { subject: np('CAT', { adjectives: ['BIG'], number: 'plural' }) }, 'duże koty.'],
    ['virile adjective', { subject: np('BOY', { adjectives: ['GOOD'], number: 'plural' }) }, 'dobrzy chłopcy.'],
    ['animate accusative of an adjective', clause(np('WOMAN'), 'SEE', { directObject: np('DOG', { adjectives: ['BIG'] }) }), 'kobieta widzi dużego psa.'],
    ['possessive declines', clause(CAT, 'SEE', { directObject: np('WOMAN', { possessor: MY }) }), 'kot widzi moją kobietę.'],
    ['a 1st-person possessor of a 1st-person subject is swój', clause(I, 'SEE', { directObject: np('CAT', { possessor: MY }) }), 'widzę swojego kota.'],
    ['some: kilka + genitive plural', clause(np('CAT', { definiteness: 'some' }), 'EAT', { verbPhrase: { tense: 'past' } }), 'kilka kotów zjadło.'],
    ['few: mało + genitive', { subject: np('CAT', { definiteness: 'few' }) }, 'mało kotów.'],
    ['many persons: wielu', { subject: np('BOY', { definiteness: 'many' }) }, 'wielu chłopców.'],
    ['no: żaden + nie', clause(np('CAT', { definiteness: 'no' }), 'EAT'), 'żaden kot nie je.'],
    ['a numeral 2–4', clause(np('CAT', { numeral: 2 }), 'RUN'), 'dwa koty biegną.'],
    ['a numeral from 5', clause(np('CAT', { numeral: 5 }), 'RUN'), 'pięć kotów biegnie.'],
    ['comparative', clause(CAT, 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'more', headStandard: DOG }) } } }), 'kot jest większy niż pies.'],
    ['superlative', clause(CAT, 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'most' }) } } }), 'kot jest największy.'],
    ['a feminine subject agrees the predicate', clause(np('CAT', { gender: 'fem' }), 'BE', { complements: { predicative: { phrase: np('SMALL') } } }), 'kotka jest mała.'],
  ])('%s', (_label, plan, expected) => {
    expect(pl(plan)).toBe(expected);
  });
});

describe('P05-E8: the clause and the verb group', () => {
  test.each<[string, PhrasePlan, string]>([
    ['1sg past, masculine', clause(I, 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'zjadłem mysz.'],
    ['2sg past, feminine', clause(np('SECOND_PERSON', { gender: 'fem' }), 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'zjadłaś mysz.'],
    ['1pl past', clause(WE, 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'zjedliśmy mysz.'],
    ['a modal chain', clause(CAT, 'GO', { verbPhrase: { modals: ['WILL', 'CAN'] } }), 'kot chce móc pójść.'],
    ['1sg conditional', clause(I, 'EAT', { directObject: MOUSE, verbPhrase: {} , condition: clause(DOG, 'RUN') }), 'gdyby pies biegł, zjadłbym mysz.'],
    ['nobody eats', clause(np('SOMEONE'), 'EAT', { verbPhrase: { negative: true } }), 'nikt nie je.'],
    ['the cat eats nothing', clause(CAT, 'EAT', { directObject: np('SOMETHING'), verbPhrase: { negative: true } }), 'kot nie je niczego.'],
    ['one ate the mouse', clause(ONE, 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'zjadło się mysz.'],
    ['the cat became a legend', clause(CAT, 'BECOME', { verbPhrase: { tense: 'past' }, complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } } }), 'kot stał się legendą.'],
    ['I am happy', clause(I, 'BE', { complements: { predicative: { phrase: np('HAPPY') } } }), 'jestem szczęśliwy.'],
    ['yes/no question', { ...eats(), interrogative: true }, 'czy kot je mysz?'],
    ['wh-question: what', clause(CAT, 'EAT', { questionRole: 'directObject' }), 'co kot je?'],
    ['wh-question: who', clause(np('FIRST_PERSON'), 'EAT', { directObject: MOUSE, questionRole: 'subject', questionAnimate: true } as never), 'kto je mysz?'],
    ['help + dative', clause(CAT, 'HELP_VERB', { directObject: DOG }), 'kot pomaga psu.'],
    ['wait for + accusative', clause(CAT, 'WAIT', { directObject: DOG }), 'kot czeka na psa.'],
    ['the passive', clause(CAT, 'EAT', { directObject: MOUSE, verbPhrase: { voice: 'passive', tense: 'past' } }), 'mysz została zjedzona przez kota.'],
    ['the existential', { ...clause(np('CAT', { definiteness: 'indefinite', number: 'plural' }), 'BE'), existential: true }, 'są koty.'],
    ['the negated existential: nie ma + genitive', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE', { verbPhrase: { negative: true } }), existential: true }, 'nie ma kota.'],
  ])('%s', (_label, plan, expected) => {
    expect(pl(plan)).toBe(expected);
  });
});

describe('P05-E9: relatives, coordination, moods', () => {
  test.each<[string, PhrasePlan, string]>([
    ['a subject relative', clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, directObject: MOUSE, headRole: 'subject' } as never }), 'RUN'), 'kot, który je mysz, biegnie.'],
    ['an object relative takes the accusative', { subject: np('MOUSE', { relative: { subject: CAT, verbPhrase: { verb: 'EAT' }, headRole: 'directObject' } as never }) }, 'mysz, którą kot je.'],
    ['a relative object under negation takes the genitive', { subject: np('MOUSE', { relative: { subject: CAT, verbPhrase: { verb: 'EAT', negative: true }, headRole: 'directObject' } as never }) }, 'mysz, której kot nie je.'],
    ['a locative gap', { subject: np('HOUSE', { relative: { subject: CAT, verbPhrase: { verb: 'EAT' }, headRole: 'locative', headSpecifiers: [{ kind: 'path', value: 'under' }] } as never }) }, 'dom, pod którym kot je.'],
    ['a virile relative', { subject: np('BOY', { number: 'plural', relative: { verbPhrase: { verb: 'RUN' }, headRole: 'subject' } as never }) }, 'chłopcy, którzy biegną.'],
    ['coordinated subjects: virile plural', clause({ conjuncts: [np('BOY'), np('GIRL')], conjunction: 'and' } as never, 'EAT', { verbPhrase: { tense: 'past' } }), 'chłopiec i dziewczyna zjedli.'],
    ['coordinated clauses: ale', { ...eats(), coordination: { conjunction: 'but', clause: clause(DOG, 'RUN') } }, 'kot je mysz, ale pies biegnie.'],
    ['coordinated clauses: i', { ...eats(), coordination: { conjunction: 'and', clause: clause(DOG, 'RUN') } }, 'kot je mysz i pies biegnie.'],
    ['an adverbial clause', { ...eats(), adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN') as never } }, 'kot je mysz, kiedy pies biegnie.'],
    ['an object clause', clause(np('MAN'), 'SAY', { contentObject: clause(CAT, 'RUN') as never }), 'mężczyzna mówi, że kot biegnie.'],
    ['imperative 1pl', command(WE), 'zjedzmy mysz.'],
    ['imperative 2pl', command(YOU_ALL), 'zjedzcie mysz.'],
    ['the infinitive', { ...eats(), infinitive: true }, 'jeść mysz.'],
    ['the vocative', command(YOU, {}, { address: CAT }), 'Kocie, zjedz mysz.'],
  ])('%s', (_label, plan, expected) => {
    expect(pl(plan)).toBe(expected);
  });
});

describe('P05: the rest', () => {
  test.each<[string, PhrasePlan, string]>([
    ['an indefinite pronoun\'s adjective: the genitive', clause(CAT, 'SEE', { directObject: np('SOMETHING', { adjectives: ['BIG'] }) }), 'kot widzi coś dużego.'],
    ['nothing else, genitive of negation', clause(CAT, 'SEE', { directObject: np('SOMETHING', { adjectives: ['OTHER'] }), verbPhrase: { negative: true } }), 'kot nie widzi niczego innego.'],
    ['kto after an indefinite pronoun', { subject: np('SOMEONE', { relative: { verbPhrase: { verb: 'RUN' }, headRole: 'subject' } as never }) }, 'ktoś, kto biegnie.'],
    ['a plain place relative: gdzie', { subject: np('HOUSE', { relative: { subject: CAT, verbPhrase: { verb: 'EAT' }, headRole: 'locative' } as never }) }, 'dom, gdzie kot je.'],
    ['where?', clause(CAT, 'EAT', { directObject: MOUSE, questionRole: 'locative' }), 'gdzie kot je mysz?'],
    ['with whom?', clause(CAT, 'RUN', { questionRole: 'comitative', questionAnimate: true } as never), 'z kim kot biegnie?'],
    ['what does the cat not eat? — the genitive', clause(CAT, 'EAT', { verbPhrase: { negative: true }, questionRole: 'directObject' }), 'czego kot nie je?'],
    ['topic: o + loc', clause(I, 'THINK', { complements: { topic: { phrase: CAT } } }), 'myślę o kocie.'],
    ['a pronoun recipient is the clitic before the object', clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('THIRD_PERSON', { gender: 'fem' }) } } }), 'mężczyzna daje jej książkę.'],
    ['euphonic we mnie', runs('locative', { phrase: I }), 'kot biegnie we mnie.'],
    ['purpose: dla + gen', runs('purpose', { phrase: DOG }), 'kot biegnie dla psa.'],
    ['a purpose clause: żeby + infinitive', clause(CAT, 'RUN', { purpose: clause(CAT, 'EAT', { directObject: MOUSE }) as never }), 'kot biegnie, żeby jeść mysz.'],
    ['quantifiers in subject and object', clause(np('CAT', { adjectives: ['BIG'], definiteness: 'many' }), 'SEE', { directObject: np('BOY', { definiteness: 'some' }) }), 'wiele dużych kotów widzi kilku chłopców.'],
    ['already, negated: jeszcze nie', eats({ modifier: 'ALREADY', negative: true, tense: 'past' }), 'kot jeszcze nie zjadł myszy.'],
    ['no longer: już nie', eats({ modifier: 'NO_LONGER' }), 'kot już nie je myszy.'],
    ['a negated manner adverb follows the verb', clause(CAT, 'RUN', { verbPhrase: { modifier: 'FAST', negative: true } }), 'kot nie biegnie szybko.'],
    ['a plurale tantum agrees in the plural', clause(np('MONEY'), 'BE', { complements: { predicative: { phrase: np('GOOD') } } }), 'pieniądze są dobre.'],
    ['powinien agrees in gender', clause(np('SECOND_PERSON', { gender: 'fem' }), 'RUN', { verbPhrase: { modals: ['SHOULD'] } }), 'powinnaś pobiec.'],
    ['the generic subject of a reflexive verb: człowiek', clause(ONE, 'BECOME', { complements: { predicative: { phrase: np('HAPPY') } } }), 'człowiek staje się szczęśliwy.'],
    ['the generic subject\'s predicate adjective: instrumental', clause(ONE, 'BE', { complements: { predicative: { phrase: np('HAPPY') } } }), 'jest się szczęśliwym.'],
    ['about: około + genitive', clause(np('CAT', { numeral: 5, approximator: 'about' }), 'RUN'), 'około pięciu kotów biegnie.'],
    ['most: większość, feminine singular verb', clause(np('CAT', { definiteness: 'most' }), 'EAT', { verbPhrase: { tense: 'past' } }), 'większość kotów zjadła.'],
    ['an indirect question: czy', clause(np('MAN'), 'KNOW', { contentObject: { ...clause(CAT, 'RUN'), interrogative: true } as never }), 'mężczyzna wie, czy kot biegnie.'],
    ['a negative instruction: the imperfective infinitive', { ...clause(YOU, 'RUN', { verbPhrase: { negative: true } }), imperative: true, imperativeRegister: 'instruction' }, 'nie biec.'],
    ['a plural genitive possessor', clause(np('HOUSE', { possessor: np('MAN', { number: 'plural' }) }), 'BE', { complements: { predicative: { phrase: np('BIG') } } }), 'dom mężczyzn jest duży.'],
    ['a pronoun after a preposition: its n-form', clause(CAT, 'WAIT', { directObject: np('THIRD_PERSON') }), 'kot czeka na niego.'],
    ['an unpaired verb\'s future: będzie + participle', clause(CAT, 'LOVE', { directObject: DOG, verbPhrase: { tense: 'future' } }), 'kot będzie kochał psa.'],
    ['a modal\'s past with the stem', clause(np('SECOND_PERSON', { gender: 'fem' }), 'CAN', { verbPhrase: { tense: 'past' } }), 'mogłaś.'],
    ['never under a modal negates the governed group', eats({ modals: ['MUST'], modifier: 'NEVER' }), 'kot musi nigdy nie jeść myszy.'],
  ])('%s', (_label, plan, expected) => {
    expect(pl(plan)).toBe(expected);
  });

  // Known gaps (P05 §6: clitic placement; §0.3: motion verbs), each stating what Polish writes.
  test.fails('known bugs: a pronoun object is the clitic before the verb (koty ją widzą), not after it', () => {
    expect(pl(clause(np('CAT', { number: 'plural' }), 'SEE', { directObject: np('THIRD_PERSON', { gender: 'fem' }) }))).toBe('koty ją widzą.');
  });
  test.fails('known bugs: a motion verb\'s imperative is the determinate imperfective (biegnij), not the perfective pobiegnij', () => {
    expect(pl({ ...clause(YOU, 'RUN'), imperative: true })).toBe('biegnij.');
  });
  test.fails('known bugs: the partitive genitive of a mass object (zjadł trochę jedzenia) is not told from the whole (zjadł jedzenie)', () => {
    expect(pl(clause(CAT, 'EAT', { directObject: np('FOOD', { definiteness: 'indefinite' }), verbPhrase: { tense: 'past' } }))).toBe('kot zjadł trochę jedzenia.');
  });
});

describe('P05: a preview row', () => {
  test('renders after Catalan, before Lithuanian (P18)', () => {
    expect(translateAll(clause(CAT, 'RUN')).map((t) => t.language).slice(-3)).toEqual(['ca', 'pl', 'lt']);
  });
});
