import { describe, expect, test } from 'vitest';
import type { Complement, NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, translateAll } from '../harness.js';

// Lithuanian (P18): the language's own suite while it is a preview language (P18 §4). Every line is the
// engine's output over the real `lt` column (packages/backend/src/concepts/lt), checked against
// docs/features/O-open/P18-lithuanian/style-lt.md and standard Lithuanian; every row is *(verify)*
// until the native review (P18-E12). A known gap is a `test.fails('known bugs: …')` row stating what
// Lithuanian writes.

const lt = (plan: PhrasePlan): string => say(plan, 'lt');

const WE = np('FIRST_PERSON', { number: 'plural' });
const I = np('FIRST_PERSON');
const YOU = np('SECOND_PERSON');
const HE = np('THIRD_PERSON', { gender: 'masc' });
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

describe('P18: the opening table', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat eats the mouse', eats(), 'katė valgo pelę.'],
    ['the cat ate the mouse — perfective', eats({ tense: 'past' }), 'katė suvalgė pelę.'],
    ['the cat will eat the mouse — perfective future', eats({ tense: 'future' }), 'katė suvalgys pelę.'],
    ['the cat was eating the mouse — imperfective, no progressive form', eats({ tense: 'past', aspect: 'progressive' }), 'katė valgė pelę.'],
    ['the cat always ate the mouse — frequentative', eats({ tense: 'past', modifier: 'ALWAYS' }), 'katė visada valgydavo pelę.'],
    ['the cat has eaten the mouse — būti + active participle, agreeing', eats({ aspect: 'resultative' }), 'katė yra suvalgiusi pelę.'],
    ['the cat does not eat the mouse — ne- and the genitive', eats({ negative: true }), 'katė nevalgo pelės.'],
    ['the cat never eats the mouse — negative concord', eats({ modifier: 'NEVER' }), 'katė niekada nevalgo pelės.'],
    ['the cats eat — one 3rd person for both numbers', clause(np('CAT', { number: 'plural' }), 'EAT'), 'katės valgo.'],
    ["the cat's food — the genitive before the head", clause(DOG, 'EAT', { directObject: np('FOOD', { possessor: CAT }) }), 'šuo valgo katės maistą.'],
    ['the cat is in the house — the bare locative', clause(CAT, 'BE', { complements: { locative: { phrase: np('HOUSE') } } }), 'katė yra name.'],
    ['the cat runs into the house', runs('direction', { phrase: np('HOUSE') }), 'katė bėga į namą.'],
    ['the cat runs away from the house', runs('source', { phrase: np('HOUSE') }), 'katė bėga nuo namo.'],
    ['the man gives the book to the child — bare dative', clause(np('MAN'), 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('CHILD') } } }), 'vyras duoda knygą vaikui.'],
    ['the cat becomes a legend — instrumental', clause(CAT, 'BECOME', { complements: { predicative: { phrase: np('LEGEND', { definiteness: 'indefinite' }) } } }), 'katė tampa legenda.'],
    ['many cats eat — genitive plural', clause(np('CAT', { definiteness: 'many' }), 'EAT'), 'daug kačių valgo.'],
    ['we eat — pro-drop in the 1st person', clause(WE, 'EAT'), 'valgome.'],
    ['he eats — the 3rd person keeps its pronoun (D6)', clause(HE, 'EAT'), 'jis valgo.'],
    ['the cat eats its own food — savo', clause(CAT, 'EAT', { directObject: np('FOOD', { possessor: OWN }) }), 'katė valgo savo maistą.'],
    ["the cat eats his food — someone else's", clause(CAT, 'EAT', { directObject: np('FOOD', { possessor: HIS }) }), 'katė valgo jo maistą.'],
    ['I see my cat — savo for any person', clause(I, 'SEE', { directObject: np('CAT', { possessor: MY }) }), 'matau savo katę.'],
    ['if the dog ran, the cat would eat the mouse', { ...eats(), condition: clause(DOG, 'RUN', { verbPhrase: { tense: 'past' } }) }, 'jei šuo bėgtų, katė suvalgytų pelę.'],
    ['eat the mouse!', command(YOU), 'suvalgyk pelę.'],
    ["don't eat the mouse!", command(YOU, { negative: true }), 'nevalgyk pelės.'],
    ['the mouse was eaten by the cat — agent in the genitive', clause(CAT, 'EAT', { directObject: MOUSE, verbPhrase: { voice: 'passive', tense: 'past' } }), 'pelė buvo suvalgyta katės.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });

  test('one eats the mouse — the subjectless 3rd person (D7, verify)', () => {
    expect(lt(clause(ONE, 'EAT', { directObject: MOUSE }))).toBe('valgo pelę.');
  });
});

describe('P18 §0.3: the aspect-selection table', () => {
  test.each<[string, PhrasePlan, string]>([
    ['present, neutral: imperfective', eats(), 'katė valgo pelę.'],
    ['past, neutral: perfective', eats({ tense: 'past' }), 'katė suvalgė pelę.'],
    ['future, neutral: perfective', eats({ tense: 'future' }), 'katė suvalgys pelę.'],
    ['progressive present', eats({ aspect: 'progressive' }), 'katė valgo pelę.'],
    ['progressive future: the imperfective future', eats({ tense: 'future', aspect: 'progressive' }), 'katė valgys pelę.'],
    ['prospective: tuoj + perfective future', eats({ aspect: 'prospective' }), 'katė tuoj suvalgys pelę.'],
    ['resultative past', eats({ tense: 'past', aspect: 'resultative' }), 'katė buvo suvalgiusi pelę.'],
    ['a frequency adverb in the present: imperfective', eats({ modifier: 'ALWAYS' }), 'katė visada valgo pelę.'],
    ['under a modal: perfective infinitive', eats({ modals: ['MUST'] }), 'katė turi suvalgyti pelę.'],
    ['under a negated modal: imperfective, genitive', eats({ modals: [{ verb: 'MUST', negative: true }] }), 'katė neturi valgyti pelės.'],
    ['negation keeps the aspect', eats({ tense: 'past', negative: true }), 'katė nesuvalgė pelės.'],
    ['an unpaired verb uses its one set', clause(CAT, 'LOVE', { directObject: DOG, verbPhrase: { tense: 'past' } }), 'katė mylėjo šunį.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});

describe('P18 §2: the clause', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the existential', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE'), existential: true }, 'yra katė.'],
    ['the negated existential: nėra + genitive', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE', { verbPhrase: { negative: true } }), existential: true }, 'nėra katės.'],
    ['a predicate adjective agrees', clause(CAT, 'BE', { complements: { predicative: { phrase: np('BIG') } } }), 'katė yra didelė.'],
    ['a modal chain', clause(CAT, 'GO', { verbPhrase: { modals: ['WILL', 'CAN'] } }), 'katė nori galėti nueiti.'],
  ])('%s', (_label, plan, expected) => {
    expect(lt(plan)).toBe(expected);
  });
});

describe('P18: a preview row', () => {
  test('renders last, after Polish', () => {
    expect(translateAll(clause(CAT, 'RUN')).map((t) => t.language).slice(-2)).toEqual(['pl', 'lt']);
  });
});
