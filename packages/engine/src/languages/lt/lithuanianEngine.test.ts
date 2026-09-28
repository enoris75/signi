import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { translate } from '../../translator/functions/translate.js';
import { lexicon } from '../../translator/translator.fixtures.js';
import { LT_FIXTURES } from './lt.fixtures.js';

// The engine end to end over the fixture lexicon (P18-E8–E10): the P18 README's opening table and a
// row per construction the engine adds, through the real translator. The sentence suite over the real
// column is test/languages/lt.test.ts, written after the column lands; every row here is (verify).

// Only Lithuanian is read; the other languages see just what the translator checks on every language.
const LOOKUP = lexicon({ KNOW: { base: 'know', content_clause_force: 'either' } }, { lt: LT_FIXTURES });
const lt = (plan: PhrasePlan): string => translate(plan, LOOKUP).find((t) => t.language === 'lt')?.text ?? '';

const np = (concept: string, extra: Partial<NounPhrase> = {}): NounPhrase => ({ concept, ...extra });
const clause = (subject: NounPhrase, verb: string, rest: Partial<PhrasePlan> & { vp?: Partial<PhrasePlan['verbPhrase']> } = {}): PhrasePlan => {
  const { vp, ...others } = rest;
  return { subject, verbPhrase: { verb, ...(vp ?? {}) }, ...others } as PhrasePlan;
};
const CAT = np('CAT');
const MOUSE = np('MOUSE');
const DOG = np('DOG');
const eats = (vp: Partial<PhrasePlan['verbPhrase']> = {}, rest: Partial<PhrasePlan> = {}): PhrasePlan =>
  clause(CAT, 'EAT', { directObject: MOUSE, vp, ...rest });
const OWN = { kind: 'coreferent', slot: 'subject' } as NounPhrase['possessor'];
const HIS = { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } as NounPhrase['possessor'];

describe('P18: the opening table', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat eats the mouse', eats(), 'katė valgo pelę.'],
    ['the cat ate the mouse — perfective past', eats({ tense: 'past' }), 'katė suvalgė pelę.'],
    ['the cat will eat the mouse', eats({ tense: 'future' }), 'katė suvalgys pelę.'],
    ['the cat was eating the mouse', eats({ tense: 'past', aspect: 'progressive' }), 'katė valgė pelę.'],
    ['the cat always ate the mouse — frequentative', eats({ tense: 'past', modifier: 'ALWAYS' }), 'katė visada valgydavo pelę.'],
    ['the cat has eaten the mouse — būti + participle', eats({ aspect: 'resultative' }), 'katė yra suvalgiusi pelę.'],
    ['the cat does not eat the mouse — genitive of negation', eats({ negative: true }), 'katė nevalgo pelės.'],
    ['the cat never eats the mouse — negative concord', eats({ modifier: 'NEVER' }), 'katė niekada nevalgo pelės.'],
    ['the cats eat', clause(np('CAT', { number: 'plural' }), 'EAT'), 'katės valgo.'],
    ["the cat's food — the genitive before the head", clause(np('FOOD', { possessor: CAT }), 'BE', {
      complements: { predicative: { phrase: np('BIG') } } }), 'katės maistas yra didelis.'],
    ['the cat is in the house — bare locative', clause(CAT, 'BE', { complements: { locative: { phrase: np('HOUSE', { number: 'plural' }) } } }), 'katė yra namuose.'],
    ['the cat runs into the house', clause(CAT, 'RUN', { complements: { direction: { phrase: np('HOUSE', { number: 'plural' }) } } }), 'katė bėga į namus.'],
    ['the cat runs away from the house', clause(CAT, 'RUN', { complements: { source: { phrase: np('HOUSE', { number: 'plural' }) } } }), 'katė bėga nuo namų.'],
    ['the man gives the book to the child — bare dative', clause(np('MAN'), 'GIVE', {
      directObject: np('BOOK'), complements: { terminus: { phrase: np('CHILD') } } }), 'vyras duoda knygą vaikui.'],
    ['the cat becomes a legend — instrumental', clause(CAT, 'BECOME', {
      complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } } }), 'katė tampa legenda.'],
    ['many cats eat — genitive plural', clause(np('CAT', { definiteness: 'many' }), 'EAT'), 'daug kačių valgo.'],
    ['we eat — pro-drop', clause(np('FIRST_PERSON', { number: 'plural' }), 'EAT'), 'valgome.'],
    ['the cat eats its own food — savo', clause(CAT, 'EAT', { directObject: np('FOOD', { possessor: OWN }) }), 'katė valgo savo maistą.'],
    ['if the dog ran, the cat would eat the mouse', { ...eats(), condition: clause(DOG, 'RUN', { vp: { tense: 'past' } }) },
      'jei šuo bėgtų, katė suvalgytų pelę.'],
    ['eat the mouse!', { ...clause(np('SECOND_PERSON'), 'EAT', { directObject: MOUSE }), imperative: true }, 'suvalgyk pelę.'],
    ["don't eat the mouse!", { ...clause(np('SECOND_PERSON'), 'EAT', { directObject: MOUSE, vp: { negative: true } }), imperative: true }, 'nevalgyk pelės.'],
    ['the mouse was eaten by the cat — agent genitive', clause(CAT, 'EAT', { directObject: MOUSE, vp: { tense: 'past', voice: 'passive' } }),
      'pelė buvo suvalgyta katės.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});

describe('P18: the clause', () => {
  test.each<[string, PhrasePlan, string]>([
    ['he eats — a 3rd person pronoun stays', clause(np('THIRD_PERSON'), 'EAT'), 'jis valgo.'],
    ['I ate — pro-drop in the past', clause(np('FIRST_PERSON'), 'EAT', { directObject: MOUSE, vp: { tense: 'past' } }), 'suvalgiau pelę.'],
    ['one eats the mouse — the subjectless 3rd person', clause(np('GENERIC_PERSON'), 'EAT', { directObject: MOUSE }), 'valgo pelę.'],
    ['the cat eats his food', clause(CAT, 'EAT', { directObject: np('FOOD', { possessor: HIS }) }), 'katė valgo jo maistą.'],
    ['the cat is happy', clause(CAT, 'BE', { complements: { predicative: { phrase: np('HAPPY') } } }), 'katė yra laiminga.'],
    ['the cat is not happy — nėra', clause(CAT, 'BE', { vp: { negative: true }, complements: { predicative: { phrase: np('HAPPY') } } }), 'katė nėra laiminga.'],
    ['I am not happy — nesu', clause(np('FIRST_PERSON'), 'BE', { vp: { negative: true }, complements: { predicative: { phrase: np('HAPPY') } } }), 'nesu laimingas.'],
    ['the cat is a legend — nominative after būti', clause(CAT, 'BE', { complements: { predicative: { phrase: np('LEGEND') } } }), 'katė yra legenda.'],
    ['the cat must eat the mouse', eats({ modals: ['MUST'] }), 'katė turi suvalgyti pelę.'],
    ['the cat must not eat the mouse', eats({ modals: [{ verb: 'MUST', negative: true }] }), 'katė neturi valgyti pelės.'],
    ['the cat laughs — the suffix reflexive', clause(CAT, 'LAUGH'), 'katė juokiasi.'],
    ['the cat does not laugh — -si- after ne-', clause(CAT, 'LAUGH', { vp: { negative: true } }), 'katė nesijuokia.'],
    ['the cat helps the child — a dative object', clause(CAT, 'HELP_VERB', { directObject: np('CHILD') }), 'katė padeda vaikui.'],
    ['the cat waits for the dog — a genitive object', clause(CAT, 'WAIT', { directObject: DOG }), 'katė laukia šuns.'],
    ['this big cat eats — the determiner and the adjective agree', clause(np('CAT', { definiteness: 'this', adjectives: ['BIG'] }), 'EAT'), 'ši didelė katė valgo.'],
    ['the cat sees the big dogs', clause(CAT, 'SEE', { directObject: np('DOG', { number: 'plural', adjectives: ['BIG'] }) }), 'katė mato didelius šunis.'],
    ['no cat eats — joks + ne-', clause(np('CAT', { definiteness: 'no' }), 'EAT'), 'jokia katė nevalgo.'],
    ['the cat is about to eat the mouse', eats({ aspect: 'prospective' }), 'katė tuoj suvalgys pelę.'],
    ['does the cat eat the mouse? — ar', { ...eats(), interrogative: true } as PhrasePlan, 'ar katė valgo pelę?'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});

describe('P18: complements, relatives, moods', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat runs under the table', clause(CAT, 'RUN', { complements: { locative: { phrase: np('TABLE'), specifiers: [{ kind: 'path', value: 'under' }] } } }),
      'katė bėga po stalu.'],
    ['the cat runs to the child — pas', clause(CAT, 'RUN', { complements: { direction: { phrase: np('CHILD') } } }), 'katė bėga pas vaiką.'],
    ['the cat eats thanks to the friend — dėka after the noun', clause(CAT, 'EAT', {
      complements: { cause: { phrase: np('FRIEND'), specifiers: [{ kind: 'sentiment', value: 'positive' }] } } }), 'katė valgo draugo dėka.'],
    ['the cat eats with joy', clause(CAT, 'EAT', { complements: { manner: { phrase: np('JOY') } } }), 'katė valgo su džiaugsmu.'],
    ['the cat eats with a knife — bare instrumental', clause(CAT, 'EAT', { complements: { instrumental: { phrase: np('KNIFE') } } }), 'katė valgo peiliu.'],
    ['the cat that eats runs', clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, headRole: 'subject' } as never }), 'RUN'), 'katė, kuri valgo, bėga.'],
    ['the mouse that the cat eats', clause(np('MOUSE', { relative: { subject: CAT, verbPhrase: { verb: 'EAT' }, headRole: 'directObject' } as never }), 'RUN'),
      'pelė, kurią katė valgo, bėga.'],
    ['the mouse that the cat does not eat — the genitive reaches kurios', clause(np('MOUSE', { relative: { subject: CAT, verbPhrase: { verb: 'EAT', negative: true }, headRole: 'directObject' } as never }), 'RUN'),
      'pelė, kurios katė nevalgo, bėga.'],
    ['the cat eats and the dog runs', { ...clause(CAT, 'EAT'), coordination: { conjunction: 'and', clause: clause(DOG, 'RUN') } } as PhrasePlan,
      'katė valgo ir šuo bėga.'],
    ['the cat eats but the dog runs', { ...clause(CAT, 'EAT'), coordination: { conjunction: 'but', clause: clause(DOG, 'RUN') } } as PhrasePlan,
      'katė valgo, bet šuo bėga.'],
    ['laugh! — the reflexive imperative', { ...clause(np('SECOND_PERSON'), 'LAUGH'), imperative: true }, 'juokis.'],
    ["don't laugh!", { ...clause(np('SECOND_PERSON'), 'LAUGH', { vp: { negative: true } }), imperative: true }, 'nesijuok.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});

const I = np('FIRST_PERSON');
const YOU = np('SECOND_PERSON');
const WE = np('FIRST_PERSON', { number: 'plural' });
const MY = { kind: 'pronominal', person: '1', number: 'singular' } as NounPhrase['possessor'];
const house = (specifiers?: { kind: string; value: string }[]) => ({ phrase: np('HOUSE'), ...(specifiers ? { specifiers } : {}) });
const runs = (complement: string, c: object): PhrasePlan =>
  clause(CAT, 'RUN', { complements: { [complement]: c } as PhrasePlan['complements'] });
const command = (addressee: NounPhrase, vp: Partial<PhrasePlan['verbPhrase']> = {}): PhrasePlan =>
  ({ ...clause(addressee, 'EAT', { directObject: MOUSE, vp }), imperative: true });

describe('P18 §2.1: case by slot', () => {
  test.each<[string, PhrasePlan, string]>([
    ['subject: nominative', clause(np('WOMAN'), 'RUN'), 'moteris bėga.'],
    ['direct object: accusative', clause(CAT, 'SEE', { directObject: np('WOMAN') }), 'katė mato moterį.'],
    ['direct object under negation: genitive', clause(CAT, 'SEE', { directObject: np('WOMAN'), vp: { negative: true } }), 'katė nemato moters.'],
    ['terminus: dative', clause(np('MAN'), 'GIVE', { directObject: np('FOOD'), complements: { terminus: { phrase: CAT } } }), 'vyras duoda maistą katei.'],
    ['possessor: genitive, prenominal', clause(DOG, 'EAT', { directObject: np('FOOD', { possessor: CAT }) }), 'šuo valgo katės maistą.'],
    ['noun modifier: genitive, prenominal', { subject: np('BOOK', { nounModifiers: [{ concept: 'CHILD', relation: 'purpose' }] } as never) } as PhrasePlan, 'vaiko knyga.'],
    ['predicative adjective: nominative, agreeing', clause(np('WOMAN'), 'BE', { complements: { predicative: { phrase: np('HAPPY') } } }), 'moteris yra laiminga.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});

describe('P18 §2.3: complements', () => {
  test.each<[string, PhrasePlan, string]>([
    ['locative: the bare locative', runs('locative', house()), 'katė bėga name.'],
    ['locative po + ins', runs('locative', house([{ kind: 'path', value: 'under' }])), 'katė bėga po namu.'],
    ['locative už + gen', runs('locative', house([{ kind: 'path', value: 'behind' }])), 'katė bėga už namo.'],
    ['locative prieš + acc', runs('locative', house([{ kind: 'path', value: 'in_front_of' }])), 'katė bėga prieš namą.'],
    ['locative ant + gen', runs('locative', house([{ kind: 'path', value: 'on' }])), 'katė bėga ant namo.'],
    ['locative aplink + acc', runs('locative', house([{ kind: 'path', value: 'around' }])), 'katė bėga aplink namą.'],
    ['direction į + acc', runs('direction', house()), 'katė bėga į namą.'],
    ['source iš + gen', runs('source', house([{ kind: 'path', value: 'in' }])), 'katė bėga iš namo.'],
    ['route per + acc', runs('route', house()), 'katė bėga per namą.'],
    ['cause dėl + gen', runs('cause', { phrase: DOG }), 'katė bėga dėl šuns.'],
    ['manner kaip + nom', runs('manner', { phrase: np('WATER') }), 'katė bėga kaip vanduo.'],
    ['comitative su + ins', runs('comitative', { phrase: I }), 'katė bėga su manimi.'],
    ['topic apie + acc', clause(I, 'THINK', { complements: { topic: { phrase: CAT } } }), 'galvoju apie katę.'],
    ['a purpose clause: kad + the conditional', clause(CAT, 'RUN', { purpose: clause(CAT, 'EAT', { directObject: MOUSE }) as never }), 'katė bėga, kad suvalgytų pelę.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});

describe('P18-E8: the noun phrase', () => {
  test.each<[string, PhrasePlan, string]>([
    ['no articles', { subject: np('CAT', { definiteness: 'indefinite' }) } as PhrasePlan, 'katė.'],
    ['this', { subject: np('WOMAN', { definiteness: 'this' }) } as PhrasePlan, 'ši moteris.'],
    ['that, plural', { subject: np('BOY', { definiteness: 'that', number: 'plural' }) } as PhrasePlan, 'tie berniukai.'],
    ['all', { subject: np('CAT', { definiteness: 'all' }) } as PhrasePlan, 'visos katės.'],
    ['adjective agreement, plural', { subject: np('CAT', { adjectives: ['BIG'], number: 'plural' }) } as PhrasePlan, 'didelės katės.'],
    ['an adjective in the accusative', clause(np('WOMAN'), 'SEE', { directObject: np('DOG', { adjectives: ['BIG'] }) }), 'moteris mato didelį šunį.'],
    ['possessive mano, indeclinable', clause(CAT, 'SEE', { directObject: np('WOMAN', { possessor: MY }) }), 'katė mato mano moterį.'],
    ['a 1st-person possessor of a 1st-person subject is savo', clause(I, 'SEE', { directObject: np('CAT', { possessor: MY }) }), 'matau savo katę.'],
    ['some: keli, agreeing', clause(np('CAT', { definiteness: 'some' }), 'EAT', { vp: { tense: 'past' } }), 'kelios katės suvalgė.'],
    ['few: mažai + genitive', { subject: np('CAT', { definiteness: 'few' }) } as PhrasePlan, 'mažai kačių.'],
    ['a numeral two', clause(np('CAT', { numeral: 2 } as never), 'RUN'), 'dvi katės bėga.'],
    ['a numeral five', clause(np('CAT', { numeral: 5 } as never), 'RUN'), 'penkios katės bėga.'],
    ['comparative', clause(CAT, 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'more', headStandard: DOG } as never) } } }), 'katė yra didesnė nei šuo.'],
    ['superlative', clause(CAT, 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'most' } as never) } } }), 'katė yra didžiausia.'],
    ['a feminine person noun', clause(np('TEACHER', { gender: 'fem' }), 'BE', { complements: { predicative: { phrase: np('SMALL') } } }), 'mokytoja yra maža.'],
    ['an invariable phrase after its noun', { subject: np('BOOK', { adjectives: ['UNTITLED'] }) } as PhrasePlan, 'knyga be pavadinimo.'],
    ['a stored table', clause(CAT, 'SEE', { directObject: np('MOUSE', { adjectives: ['SAME'] }) }), 'katė mato tą pačią pelę.'],
    ['many big cats see some boys', clause(np('CAT', { adjectives: ['BIG'], definiteness: 'many' }), 'SEE', { directObject: np('BOY', { definiteness: 'some' }) }),
      'daug didelių kačių mato kelis berniukus.'],
    ['most: dauguma + genitive', clause(np('CAT', { definiteness: 'most' }), 'EAT', { vp: { tense: 'past' } }), 'dauguma kačių suvalgė.'],
    ['about: apie + accusative', clause(np('CAT', { numeral: 5, approximator: 'about' } as never), 'RUN'), 'apie penkias kates bėga.'],
    ['a plural genitive possessor', clause(np('HOUSE', { possessor: np('MAN', { number: 'plural' }) }), 'BE', { complements: { predicative: { phrase: np('BIG') } } }),
      'vyrų namas yra didelis.'],
    ['a plurale tantum agrees in the plural', clause(np('MONEY'), 'BE', { complements: { predicative: { phrase: np('GOOD') } } }), 'pinigai yra geri.'],
    ['an indefinite pronoun\'s adjective: the genitive', clause(CAT, 'SEE', { directObject: np('SOMETHING', { adjectives: ['BIG'] }) }), 'katė mato kažką didelio.'],
    ['nothing else, genitive of negation', clause(CAT, 'SEE', { directObject: np('SOMETHING', { adjectives: ['OTHER'] }), vp: { negative: true } }), 'katė nemato nieko kito.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});

describe('P18-E9: the clause and the verb group', () => {
  test.each<[string, PhrasePlan, string]>([
    ['2sg past', clause(np('SECOND_PERSON', { gender: 'fem' }), 'EAT', { directObject: MOUSE, vp: { tense: 'past' } }), 'suvalgei pelę.'],
    ['1pl past', clause(WE, 'EAT', { directObject: MOUSE, vp: { tense: 'past' } }), 'suvalgėme pelę.'],
    ['a modal chain', clause(CAT, 'GO', { vp: { modals: ['WILL', 'CAN'] } }), 'katė nori galėti nueiti.'],
    ['1sg conditional', clause(I, 'EAT', { directObject: MOUSE, condition: clause(DOG, 'RUN') }), 'jei šuo bėgtų, suvalgyčiau pelę.'],
    ['nobody eats', clause(np('SOMEONE'), 'EAT', { vp: { negative: true } }), 'niekas nevalgo.'],
    ['the cat eats nothing', clause(CAT, 'EAT', { directObject: np('SOMETHING'), vp: { negative: true } }), 'katė nevalgo nieko.'],
    ['one ate the mouse', clause(np('GENERIC_PERSON'), 'EAT', { directObject: MOUSE, vp: { tense: 'past' } }), 'suvalgė pelę.'],
    ['the cat became a legend', clause(CAT, 'BECOME', { vp: { tense: 'past' }, complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } } }),
      'katė tapo legenda.'],
    ['I am happy', clause(I, 'BE', { complements: { predicative: { phrase: np('HAPPY') } } }), 'esu laimingas.'],
    ['wh-question: what', clause(CAT, 'EAT', { questionRole: 'directObject' } as never), 'ką katė valgo?'],
    ['wh-question: who', clause(I, 'EAT', { directObject: MOUSE, questionRole: 'subject', questionAnimate: true } as never), 'kas valgo pelę?'],
    ['what does the cat not eat? — the genitive', clause(CAT, 'EAT', { vp: { negative: true }, questionRole: 'directObject' } as never), 'ko katė nevalgo?'],
    ['where?', clause(CAT, 'EAT', { directObject: MOUSE, questionRole: 'locative' } as never), 'kur katė valgo pelę?'],
    ['with whom?', clause(CAT, 'RUN', { questionRole: 'comitative', questionAnimate: true } as never), 'su kuo katė bėga?'],
    ['the existential', { ...clause(np('CAT', { definiteness: 'indefinite', number: 'plural' }), 'BE'), existential: true } as PhrasePlan, 'yra katės.'],
    ['the negated existential: nėra + genitive', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE', { vp: { negative: true } }), existential: true } as PhrasePlan,
      'nėra katės.'],
    ['the existential with a place leading', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE', {
      complements: { locative: { phrase: np('HOUSE', { number: 'plural' }) } } }), existential: true } as PhrasePlan, 'namuose yra katė.'],
    ['already, negated: dar ne-', eats({ modifier: 'ALREADY', negative: true, tense: 'past' }), 'katė dar nesuvalgė pelės.'],
    ['no longer: jau ne-', eats({ modifier: 'NO_LONGER' }), 'katė jau nevalgo pelės.'],
    ['a negated manner adverb follows the verb', clause(CAT, 'RUN', { vp: { modifier: 'FAST', negative: true } }), 'katė nebėga greitai.'],
    ['a pronoun object: its full form', clause(CAT, 'WAIT', { directObject: np('THIRD_PERSON') }), 'katė laukia jo.'],
    ['an unpaired verb\'s future is synthetic', clause(CAT, 'LOVE', { directObject: DOG, vp: { tense: 'future' } }), 'katė mylės šunį.'],
    ['a modal\'s past', clause(np('SECOND_PERSON', { gender: 'fem' }), 'CAN', { vp: { tense: 'past' } }), 'galėjai.'],
    ['never under a modal negates the governed group', eats({ modals: ['MUST'], modifier: 'NEVER' }), 'katė turi niekada nevalgyti pelės.'],
    ['the experiencer NEED: dative first, the thing needed in the genitive', clause(CAT, 'NEED', { directObject: MOUSE }), 'katei reikia pelės.'],
    ['the resultative of a 1st person', clause(I, 'EAT', { directObject: MOUSE, vp: { aspect: 'resultative' } }), 'esu suvalgęs pelę.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});

describe('P18-E10: relatives, coordination, moods', () => {
  test.each<[string, PhrasePlan, string]>([
    ['a subject relative', clause(np('CAT', { relative: { verbPhrase: { verb: 'EAT' }, directObject: MOUSE, headRole: 'subject' } as never }), 'RUN'),
      'katė, kuri valgo pelę, bėga.'],
    ['a locative gap', { subject: np('HOUSE', { relative: { subject: CAT, verbPhrase: { verb: 'EAT' }, headRole: 'locative', headSpecifiers: [{ kind: 'path', value: 'under' }] } as never }) } as PhrasePlan,
      'namas, po kuriuo katė valgo.'],
    ['a plural relative', { subject: np('BOY', { number: 'plural', relative: { verbPhrase: { verb: 'RUN' }, headRole: 'subject' } as never }) } as PhrasePlan, 'berniukai, kurie bėga.'],
    ['kas after an indefinite pronoun', { subject: np('SOMEONE', { relative: { verbPhrase: { verb: 'RUN' }, headRole: 'subject' } as never }) } as PhrasePlan, 'kažkas, kas bėga.'],
    ['a plain place relative: kur', { subject: np('HOUSE', { relative: { subject: CAT, verbPhrase: { verb: 'EAT' }, headRole: 'locative' } as never }) } as PhrasePlan,
      'namas, kur katė valgo.'],
    ['coordinated subjects', clause({ conjuncts: [np('BOY'), np('GIRL')], conjunction: 'and' } as never, 'EAT', { vp: { tense: 'past' } }), 'berniukas ir mergaitė suvalgė.'],
    ['an adverbial clause', { ...eats(), adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN') as never } } as PhrasePlan, 'katė valgo pelę, kai šuo bėga.'],
    ['an object clause', clause(np('MAN'), 'SAY', { contentObject: clause(CAT, 'RUN') as never }), 'vyras sako, kad katė bėga.'],
    ['an indirect question: ar', clause(np('MAN'), 'KNOW', { contentObject: { ...clause(CAT, 'RUN'), interrogative: true } as never }), 'vyras žino, ar katė bėga.'],
    ['imperative 1pl', command(WE), 'suvalgykime pelę.'],
    ['imperative 2pl', command(np('SECOND_PERSON', { number: 'plural' })), 'suvalgykite pelę.'],
    ['the infinitive', { ...eats(), infinitive: true } as PhrasePlan, 'valgyti pelę.'],
    ['a negative instruction: the imperfective infinitive', { ...clause(YOU, 'RUN', { vp: { negative: true } }), imperative: true, imperativeRegister: 'instruction' } as PhrasePlan,
      'nebėgti.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});
