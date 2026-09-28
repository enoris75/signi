import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { translate } from '../../translator/functions/translate.js';
import { lexicon } from '../../translator/translator.fixtures.js';
import { LT_FIXTURES } from './lt.fixtures.js';

// The engine end to end over the fixture lexicon (P18-E8–E10): the P18 README's opening table and a
// row per construction the engine adds, through the real translator. The sentence suite over the real
// column is test/languages/lt.test.ts, written after the column lands; every row here is (verify).

const LOOKUP = lexicon({}, { lt: LT_FIXTURES });
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
