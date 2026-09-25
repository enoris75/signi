import { describe, expect, test } from 'vitest';
import type { NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, translateAll } from '../harness.js';
import { translate } from '../../src/index.js';
import { lookupLexicalEntry } from '../../../backend/src/lexicon.js';

// Swiss German (P10), Zürichdeutsch in Dieth spelling: the language's own suite while it is a preview
// language (P10 §4). The exhaustive tables elsewhere render the ready languages only (P10-E1); every
// line here is the engine's output, pinned, and every row is *(verify)* until the review (P10-E14).
// A known gap is a `test.fails` row that states what the review is expected to want.

const gsw = (plan: PhrasePlan): string => say(plan, 'gsw');
const de = (plan: PhrasePlan): string => say(plan, 'de');

const I = np('FIRST_PERSON');
const WE = np('FIRST_PERSON', { number: 'plural' });
const ONE = np('GENERIC_PERSON');
const SHE = np('THIRD_PERSON', { gender: 'fem' });
const CAT = np('CAT', { gender: 'fem' });
const MOUSE = np('MOUSE');
const eats = (extra: Partial<VerbPhrase> = {}, rest: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> = {}) =>
  clause(CAT, 'EAT', { directObject: MOUSE, ...rest, verbPhrase: extra });
const knowThat = (content: PhrasePlan): PhrasePlan =>
  clause(I, 'KNOW', { contentObject: content as unknown as NonNullable<PhrasePlan['contentObject']> });
const subject = (element: NounElement): PhrasePlan => ({ subject: element });

describe('P10-E1: a preview row', () => {
  test('renders in the translation list, last, after the seven', () => {
    expect(translateAll(clause(CAT, 'RUN')).map((t) => t.language)).toEqual(['en', 'it', 'fr', 'de', 'es', 'ja', 'pt', 'gsw']);
  });

  // E1 D1: a word the column has not got empties the row — no sentence with a hole in it, and never
  // the German word in its place (P10 §6, "`de` is right there").
  test('a word with no Swiss German lexeme empties the row, and borrows no German', () => {
    const withoutGsw = (hidden: string) => (id: string, language: string) =>
      id === hidden && language === 'gsw' ? undefined : lookupLexicalEntry(id, language);
    const text = (hidden: string) => translate(eats(), withoutGsw(hidden)).find((t) => t.language === 'gsw')!.text;
    expect(text('MOUSE')).toBe('');
    expect(text('EAT_ANIMAL')).toBe('');
    expect(text('NO_SUCH_CONCEPT')).toBe('d Chatz frisst d Muus.');
  });
});

describe('P10-E5: the noun phrase in three cases', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the man', subject(np('MAN')), 'de Maa.'],
    ['the woman', subject(np('WOMAN')), 'd Frau.'],
    ['the water', subject(np('WATER')), 's Wasser.'],
    ['the cats (plural)', subject(np('CAT', { gender: 'fem', number: 'plural' })), 'd Chatze.'],
    // Accusative = nominative (P10 D7): *de Maa* as subject and as object.
    ['I see the man', clause(I, 'SEE', { directObject: np('MAN') }), 'ich gsee de Maa.'],
    ['with the man', clause(I, 'RUN', { complements: { comitative: { phrase: np('MAN') } } }), 'ich spring mit em Maa.'],
    ['a big dog', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['BIG'] })), 'en grosse Hund.'],
    ['the big dog', subject(np('DOG', { adjectives: ['BIG'] })), 'de gross Hund.'],
    ['a big cat', subject(np('CAT', { gender: 'fem', definiteness: 'indefinite', adjectives: ['BIG'] })), 'e grossi Chatz.'],
    ['a big house', subject(np('HOUSE', { definiteness: 'indefinite', adjectives: ['BIG'] })), 'es grosses Huus.'],
    ['the big dogs', subject(np('DOG', { number: 'plural', adjectives: ['BIG'] })), 'd grosse Hünd.'],
    ['this dog', subject(np('DOG', { definiteness: 'this' })), 'dä Hund.'],
    ['three dogs', subject(np('DOG', { number: 'plural', numeral: 3, definiteness: 'bare' } as Partial<NounPhrase>)), 'drei Hünd.'],
    ['no dog', subject(np('DOG', { definiteness: 'no' })), 'kei Hund.'],
    ['some dogs', subject(np('DOG', { number: 'plural', definiteness: 'some' })), 'es paar Hünd.'],
    // A base in -e (German -en) takes its n back before an ending, and not without one.
    ['an adult woman', subject(np('WOMAN', { definiteness: 'indefinite', adjectives: ['ADULT'] })), 'e erwachseni Frau.'],
    ['an adult man', subject(np('MAN', { definiteness: 'indefinite', adjectives: ['ADULT'] })), 'en erwachsene Maa.'],
    ['the adult man', subject(np('MAN', { adjectives: ['ADULT'] })), 'de erwachse Maa.'],
    // A vowel-final base declines on its attributive stem (chlii → chliin-), and stands bare without an ending.
    ['a small dog', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['SMALL'] })), 'en chliine Hund.'],
    ['the small dog', subject(np('DOG', { adjectives: ['SMALL'] })), 'de chlii Hund.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });

  test('a pronoun in each case: nominative, accusative, dative', () => {
    expect(gsw(clause(SHE, 'RUN'))).toBe('si springt.');
    expect(gsw(clause(I, 'SEE', { directObject: np('THIRD_PERSON', { gender: 'masc' }) }))).toBe('ich gsee in.');
    expect(gsw(clause(I, 'RUN', { complements: { comitative: { phrase: SHE } } }))).toBe('ich spring mit ire.');
  });
});

describe('P10-E6: the basic clause', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat eats the mouse', eats(), 'd Chatz frisst d Muus.'],
    ['we eat', clause(WE, 'EAT'), 'mir ässed.'],
    ['one eats the mouse', clause(ONE, 'EAT', { directObject: MOUSE }), 'me isst d Muus.'],
    ['the cat does not eat the mouse', eats({ negative: true }), 'd Chatz frisst d Muus nöd.'],
    ['does the cat eat the mouse?', { ...eats(), interrogative: true } as PhrasePlan, 'frisst d Chatz d Muus?'],
    ['the cat comes back — the particle at the brace', clause(CAT, 'RETURN'), 'd Chatz chunt zrugg.'],
    ['I know that the cat eats — verb-final', knowThat(clause(CAT, 'EAT')), 'ich weiss, das d Chatz frisst.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });

  // P10-E6 D3: the column must not regress to Standard German word by word (P10 §6). *der / die / das*
  // are not on the list: Swiss German has them as a dative article, a demonstrative and a pronoun.
  test('says no word that is Standard German only', () => {
    const LEAKS = /\b(nicht|kein|keine|keinen|keinem|ist|hat|wird|werden|ein|eine|einen|einem|einer|eines|dass|auch|man|gerade|nur|noch|schon|bin|bist|haben|wurde|sein)\b/;
    const plans: PhrasePlan[] = [
      eats(), eats({ negative: true }), eats({ tense: 'past' }), eats({ tense: 'future' }), eats({ aspect: 'progressive' }),
      eats({ aspect: 'resultative' }), eats({ aspect: 'prospective' }), clause(ONE, 'EAT', { directObject: MOUSE }),
      clause(CAT, 'RUN', { verbPhrase: { modals: ['MUST'] } }), knowThat(eats({ tense: 'past' })),
      subject(np('DOG', { definiteness: 'no' })), subject(np('DOG', { definiteness: 'indefinite' })),
      clause(I, 'BE', { complements: { predicative: { phrase: np('TIRED') } }, verbPhrase: { negative: true } }),
    ];
    for (const plan of plans) expect(gsw(plan)).not.toMatch(LEAKS);
  });
});

describe('P10-E7: the past is the perfect', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat ate the mouse', eats({ tense: 'past' }), 'd Chatz hät d Muus gfrässe.'],
    ['she went', clause(SHE, 'GO', { verbPhrase: { tense: 'past' } }), 'si isch ggange.'],
    ['the cat did not eat the mouse', eats({ tense: 'past', negative: true }), 'd Chatz hät d Muus nöd gfrässe.'],
    ['I know that the cat ate the mouse', knowThat(eats({ tense: 'past' })), 'ich weiss, das d Chatz d Muus gfrässe hät.'],
    // E7 D3: the pluperfect is the double perfect.
    ['the cat had eaten the mouse', eats({ tense: 'past', aspect: 'resultative' }), 'd Chatz hät d Muus gfrässe ghaa.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });

  // P10 D6: with one past construction, the neutral past and the present resultative are one
  // sentence. Pinned as an equality, not filed as a bug.
  test('the past and the resultative render alike', () => {
    expect(gsw(eats({ tense: 'past' }))).toBe(gsw(eats({ aspect: 'resultative' })));
  });

  test('every verb whose Swiss German selects sii says isch', async () => {
    const { GSW } = await import('../../../backend/src/concepts/index.js');
    const beVerbs = Object.entries(GSW).filter(([, f]) => f['aux'] === 'be' && f['participle'] && f['3sg_present'] && !f['modal']);
    expect(beVerbs.length).toBeGreaterThan(10);
    for (const [id] of beVerbs) {
      expect(gsw(clause(np('THIRD_PERSON', { gender: 'masc' }), id, { verbPhrase: { tense: 'past' } }))).toMatch(/^er isch /);
    }
  });
});

describe('P10-E8: the future is the present', () => {
  test('the cat will eat the mouse', () => {
    expect(gsw(eats({ tense: 'future' }))).toBe('d Chatz frisst d Muus.');
    expect(de(eats({ tense: 'future' }))).toBe('die Katze wird die Maus fressen.');
  });

  // The corpus has no *tomorrow*; *later* carries the time as well (*spöter*).
  test('the cat will eat the mouse later', () => {
    expect(gsw(eats({ tense: 'future', modifier: 'LATER' }))).toBe(gsw(eats({ modifier: 'LATER' })));
  });

  // P10 D8: a future with no time adverb reads as a present. That ambiguity is the language's; the
  // reviewer rules whether it is acceptable (E14).
  test('a future with no adverb is the present', () => {
    expect(gsw(eats({ tense: 'future' }))).toBe(gsw(eats()));
  });

  test('the future perfect is the perfect', () => {
    expect(gsw(eats({ tense: 'future', aspect: 'resultative' }))).toBe('d Chatz hät d Muus gfrässe.');
  });

  test('the prospective keeps a frame of its own', () => {
    expect(gsw(eats({ aspect: 'prospective' }))).toBe('d Chatz isch drum und dra, d Muus z frässe.');
  });
});

describe('P10-E9: the am progressive', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat is eating', clause(CAT, 'EAT', { verbPhrase: { aspect: 'progressive' } }), 'd Chatz isch am Frässe.'],
    ['the cat is eating the mouse', eats({ aspect: 'progressive' }), 'd Chatz isch d Muus am Frässe.'],
    ['the cat was eating', clause(CAT, 'EAT', { verbPhrase: { aspect: 'progressive', tense: 'past' } }), 'd Chatz isch am Frässe gsii.'],
    ['the cat is not eating', clause(CAT, 'EAT', { verbPhrase: { aspect: 'progressive', negative: true } }), 'd Chatz isch nöd am Frässe.'],
    ['I know that the cat is eating', knowThat(clause(CAT, 'EAT', { verbPhrase: { aspect: 'progressive' } })), 'ich weiss, das d Chatz am Frässe isch.'],
    ['a particle verb joins the nominalised infinitive', clause(CAT, 'RETURN', { verbPhrase: { aspect: 'progressive' } }), 'd Chatz isch am Zruggchoo.'],
    ['under a modal', clause(I, 'WORK_LABOUR', { verbPhrase: { aspect: 'progressive', modals: ['MUST'] } }), 'ich mues am Schaffe sii.'],
    ['the future is the present progressive', clause(CAT, 'EAT', { verbPhrase: { aspect: 'progressive', tense: 'future' } }), 'd Chatz isch am Frässe.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });

  test('German has no such construction: gerade over the plain verb', () => {
    expect(de(clause(CAT, 'EAT', { verbPhrase: { aspect: 'progressive' } }))).toBe('die Katze frisst gerade.');
  });
});

describe('P10-E10: modals, the copula, degree', () => {
  const go = (extra: Partial<VerbPhrase>): PhrasePlan => clause(I, 'GO', { verbPhrase: extra });
  const iKnow = (content: PhrasePlan): PhrasePlan => knowThat(content);
  test.each<[string, PhrasePlan, string]>([
    ['I must go', go({ modals: ['MUST'] }), 'ich mues gaa.'],
    ['I can come', clause(I, 'COME', { verbPhrase: { modals: ['CAN'] } }), 'ich cha choo.'],
    ['I want to eat', clause(I, 'EAT', { verbPhrase: { modals: ['WILL'] } }), 'ich wott ässe.'],
    ['the cat is big', clause(CAT, 'BE', { complements: { predicative: { phrase: np('BIG') } } }), 'd Chatz isch gross.'],
    ['the cat is bigger', clause(CAT, 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'more' }) } } }), 'd Chatz isch grösser.'],
    ['the cat is the biggest', clause(CAT, 'BE', { complements: { predicative: { phrase: np('BIG', { headDegree: 'most' }) } } }), 'd Chatz isch am gröschte.'],
    // D11: German's cluster order ships until the review rules — the governed verb before its modal.
    ['I had to go (German order)', go({ modals: ['MUST'], tense: 'past' }), 'ich ha gaa müese.'],
    ['… that I had to go (German order)', iKnow(go({ modals: ['MUST'], tense: 'past' })), 'ich weiss, das ich ha gaa müese.'],
    ['… that I can come (German order)', iKnow(clause(I, 'COME', { verbPhrase: { modals: ['CAN'] } })), 'ich weiss, das ich choo cha.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });

  // P10 D11, E10 D1: Zürich raises the modal ahead of the verb it governs. Each cluster shape the
  // review has to rule on, pinned as the gap it is.
  test.fails.each<[string, PhrasePlan, string]>([
    ['I had to go (Swiss order)', go({ modals: ['MUST'], tense: 'past' }), 'ich ha müese gaa.'],
    ['… that I had to go (Swiss order)', iKnow(go({ modals: ['MUST'], tense: 'past' })), 'ich weiss, das ich ha müese gaa.'],
    ['… that I can come (Swiss order)', iKnow(clause(I, 'COME', { verbPhrase: { modals: ['CAN'] } })), 'ich weiss, das ich cha choo.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });
});

describe('P10-E11: relative clauses with invariant wo', () => {
  const man = (relative: NonNullable<NounPhrase['relative']>) => np('MAN', { relative });
  test.each<[string, PhrasePlan, string]>([
    ['the man who comes', subject(man({ verbPhrase: { verb: 'COME' } })), 'de Maa, wo chunt.'],
    ['the woman whom I see', subject(np('WOMAN', { relative: { headRole: 'directObject', subject: I, verbPhrase: { verb: 'SEE' } } })), 'd Frau, wo ich gsee.'],
    ['the cats that eat', subject(np('CAT', { gender: 'fem', number: 'plural', relative: { verbPhrase: { verb: 'EAT' } } })), 'd Chatze, wo frässed.'],
    // E11 D2: a dative keeps a resumptive pronoun; a place a da-compound.
    ['the man to whom I give the book', subject(man({ headRole: 'terminus', subject: I, verbPhrase: { verb: 'GIVE' }, directObject: np('BOOK') } as NonNullable<NounPhrase['relative']>)), 'de Maa, wo ich im s Buech gibe.'],
    ['the house in which I live', subject(np('HOUSE', { relative: { headRole: 'locative', subject: I, verbPhrase: { verb: 'LIVE' } } as NonNullable<NounPhrase['relative']> })), 's Huus, wo ich drin won.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });

  test('no declined der / die / das, whatever the head', () => {
    for (const head of ['MAN', 'WOMAN', 'CHILD']) {
      expect(gsw(subject(np(head, { relative: { verbPhrase: { verb: 'COME' } } })))).toMatch(/, wo chunt\.$/);
    }
  });
});

describe('P10-E12: possession without a genitive', () => {
  const house = (possessor: NounPhrase['possessor']) => subject(np('HOUSE', { possessor }));
  test.each<[string, PhrasePlan, string]>([
    ["the father's house", house(np('FATHER')), 'em Vatter sis Huus.'],
    ["the mother's house", house(np('MOTHER')), 'de Mueter ires Huus.'],
    ["the cats' food", subject(np('FOOD', { possessor: np('CAT', { gender: 'fem', number: 'plural' }) })), 'de Chatze ires Ässe.'],
    ['the house of a man — vo for an indefinite owner', house(np('MAN', { definiteness: 'indefinite' })), 's Huus vo emene Maa.'],
    ['my house — a pronominal possessor, unchanged', house({ kind: 'pronominal', person: '1', number: 'singular' }), 'mis Huus.'],
    ["my father's house", house(np('FATHER', { possessor: { kind: 'pronominal', person: '1', number: 'singular' } })), 'mim Vatter sis Huus.'],
    ['the roof of the house — vo for a thing', subject(np('DOOR', { possessor: np('HOUSE') })), 'd Tür vom Huus.'],
    ['the dative is the death of the genitive — vo for a case name', clause(np('DATIVE'), 'BE', { complements: { predicative: { phrase: np('DEATH', { definiteness: 'definite', possessor: np('GENITIVE') }) } } }), 'de Dativ isch de Tod vom Genitiv.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });

  test('the possessed phrase as subject, object and dative', () => {
    const fathers = (extra: Partial<NounPhrase> = {}) => np('DOG', { possessor: np('FATHER'), ...extra });
    expect(gsw(clause(fathers(), 'RUN'))).toBe('em Vatter sin Hund springt.');
    expect(gsw(clause(I, 'SEE', { directObject: fathers() }))).toBe('ich gsee em Vatter sin Hund.');
    expect(gsw(clause(I, 'RUN', { complements: { comitative: { phrase: fathers() } } }))).toBe('ich spring mit em Vatter sim Hund.');
  });

  // E12 D3: the outermost owner only takes the possessor dative; an inner one follows with vo.
  test('an owner of an owner follows with vo', () => {
    expect(gsw(house(np('FATHER', { possessor: np('MOTHER') })))).toBe('em Vatter vo de Mueter sis Huus.');
  });
});

describe('names', () => {
  // Swiss German articles a person's name, where Standard German does not (verify, E14).
  test.each<[string, PhrasePlan, string]>([
    ['Peter runs', clause(np('PETER'), 'RUN'), 'de Peter springt.'],
    ["Peter's house — a name is a definite owner", subject(np('HOUSE', { possessor: np('PETER') })), 'em Peter sis Huus.'],
    ['I see Mary', clause(I, 'SEE', { directObject: np('MARY') }), 'ich gsee d Maria.'],
    ['Mom runs — a kin word used as a name keeps the article', clause(np('MOM'), 'RUN'), 's Mami springt.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });

  test('a vocative calls without the article', () => {
    expect(gsw({ ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true, address: np('MOM') } as PhrasePlan)).toBe('Mami, spring.');
  });
});

describe('P10-E13: the rest of the sentence suite', () => {
  test.each<[string, PhrasePlan, string]>([
    // E13 D1: *würd* + infinitive, the cluster in German's order (D11, see the Swiss order below).
    ['if the dog ran, the cat would eat', { ...clause(CAT, 'EAT'), condition: clause(np('DOG'), 'RUN') }, 'wenn de Hund springe würd, würd d Chatz frässe.'],
    ['if he were at home — sii keeps its own conditional', { ...clause(CAT, 'EAT'), condition: clause(np('THIRD_PERSON', { gender: 'masc' }), 'BE', { complements: { locative: { phrase: np('HOME') } } }) }, 'wenn er dihei wär, würd d Chatz frässe.'],
    // The command closes on the full stop every language's command does.
    ['run!', { ...clause(np('SECOND_PERSON'), 'RUN'), imperative: true }, 'spring.'],
    ["let's run", { ...clause(WE, 'RUN'), imperative: true }, 'mir wänd springe.'],
    ['I try to eat', clause(I, 'TRY', { infinitiveComplement: { verbPhrase: { verb: 'EAT' } } as NonNullable<PhrasePlan['infinitiveComplement']> }), 'ich probier z ässe.'],
    ['the cat and the dog run', clause({ conjuncts: [CAT, np('DOG')], conjunction: 'and' }, 'RUN'), 'd Chatz und de Hund springed.'],
    ['I go home', clause(I, 'GO', { complements: { direction: { phrase: np('HOME') } } }), 'ich gang hei.'],
    ['the cat runs into the house', clause(CAT, 'RUN', { complements: { direction: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'in' }] } } }), 'd Chatz springt is Huus.'],
  ])('%s', (_label, plan, expected) => {
    expect(gsw(plan)).toBe(expected);
  });

  // D11 again: the *würd* cluster of a verb-final *wenn* clause raises in Zürich as a modal's does.
  test.fails('if the dog ran (Swiss order)', () => {
    expect(gsw({ ...clause(CAT, 'EAT'), condition: clause(np('DOG'), 'RUN') })).toBe('wenn de Hund würd springe, würd d Chatz frässe.');
  });
});
