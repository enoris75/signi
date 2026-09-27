import { describe, expect, test } from 'vitest';
import type { Degree, NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say } from '../harness.js';
import { lookupLexicalEntry } from '../../../backend/src/lexicon.js';

// Vallader (P04): the language's own suite while it is a preview language (P04 §4). The exhaustive
// tables elsewhere render the ready languages only; every line here is the engine's output, pinned after
// checking it against `docs/features/P-planning/P04-romansh/style-rm-vallader.md`, and every row is
// *(verify)* until the review (P04-E19). A known gap is a `test.fails` row that states what Vallader is
// expected to write; a question no source here settles is a `test.todo` naming it.

const vl = (plan: PhrasePlan): string => say(plan, 'rm-vallader');

const I = np('FIRST_PERSON');
const YOU = np('SECOND_PERSON');
const HE = np('THIRD_PERSON', { gender: 'masc' });
const SHE = np('THIRD_PERSON', { gender: 'fem' });
const WE = np('FIRST_PERSON', { number: 'plural' });
const YOU_ALL = np('SECOND_PERSON', { number: 'plural' });
const THEY = np('THIRD_PERSON', { gender: 'masc', number: 'plural' });
const THEY_FEM = np('THIRD_PERSON', { gender: 'fem', number: 'plural' });
const PERSONS: [string, NounPhrase][] = [['1sg', I], ['2sg', YOU], ['3sg', HE], ['1pl', WE], ['2pl', YOU_ALL], ['3pl', THEY]];
const ONE = np('GENERIC_PERSON');
const CAT = np('CAT');
const SHE_CAT = np('CAT', { gender: 'fem' });
const MOUSE = np('MOUSE');
const DOG = np('DOG');
const MY = { kind: 'pronominal', person: '1', number: 'singular' } as NounPhrase['possessor'];
const eats = (vp: Partial<VerbPhrase> = {}, rest: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> = {}): PhrasePlan =>
  clause(CAT, 'EAT', { directObject: MOUSE, ...rest, verbPhrase: vp });
const subject = (element: NounElement): PhrasePlan => ({ subject: element });
const command = (addressee: NounPhrase, verb = 'EAT', vp: Partial<VerbPhrase> = {}, rest: Partial<PhrasePlan> = {}): PhrasePlan =>
  ({ ...clause(addressee, verb, { verbPhrase: vp }), imperative: true, ...rest });
const catIs = (adjective: string, degree: Degree = 'positive', standard?: NounElement): PhrasePlan =>
  clause(CAT, 'BE', { complements: { predicative: { phrase: np(adjective, { headDegree: degree, ...(standard ? { headStandard: standard } : {}) }) } } });
const TIRED = { predicative: { phrase: np('TIRED') } };

// P04-E8 D3: the words that mark the neighbours and never Vallader — Rumantsch Grischun's (*jau, è,
// betg, insatge, nagut, nagin, chaun, mieur, um, oz, ussa, fitg, adina, tge, tgi, nua, pli, vegnir,
// daventar, gnanc, sin, tar, sut*), Sursilvan's (*jeu, ei, ein, buca, gat, tgaun, affon, cudisch,
// magliar, magliau, enzatgei, nuot, negin*), Puter's (*eau, üngün, ünguotta, essans*) and Italian's (P04-E7
// D2). RG's *in* (a) is left out: it is Vallader's *in* (in) too; so are *es* and *main*, shared words.
const LEAKS = /(^|[\s'])(jau|è|èn|betg|insatge|nagut|nagin|nagina|chaun|mieur|um|umens|oz|ussa|fitg|adina|tge|tgi|nua|pli|vegnir|daventar|gnanc|sin|tar|sut|jeu|ei|ein|buca|gat|tgaun|affon|cudisch|magliar|magliau|enzatgei|nuot|negin|eau|üngün|ünguotta|essans|gatto|gatti|cane|topo|gli|lo|della|dello|delle|degli|più|non|sono|nessun|nessuna|questo|quello|anche|molto|essere|avere|mangiato)(?=[\s.,?!]|$)/;

describe('P04-E8: the noun phrase', () => {
  test.each<[string, PhrasePlan, string]>([
    // E7's table, in Vallader.
    ['the man — l\' before h + vowel', subject(np('MAN')), "l'hom."],
    ['the water — l\' before a vowel, feminine', subject(np('WATER')), "l'aua."],
    ['the cats', subject(np('CAT', { number: 'plural' })), 'ils giats.'],
    ['a big dog — ün, BIG precedes', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['BIG'] })), 'ün grond chan.'],
    ['to the man — a stays apart before l\'', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('MAN') } } }), "eu dun il cudesch a l'hom."],
    ['of the men — da + ils', subject(np('HOUSE', { possessor: np('MAN', { number: 'plural' }) })), 'la chasa dals homens.'],
    ['my cat — no article', subject(np('CAT', { possessor: MY })), 'meis giat.'],
    ['my house', subject(np('HOUSE', { possessor: MY })), 'mia chasa.'],
    ['my cats', subject(np('CAT', { number: 'plural', possessor: MY })), 'meis giats.'],
    ['my houses', subject(np('HOUSE', { number: 'plural', possessor: MY })), 'mias chasas.'],
    ['more beautiful', catIs('BEAUTIFUL', 'more'), 'il giat es plü bel.'],
    // Articles.
    ['the house', subject(np('HOUSE')), 'la chasa.'],
    ['the houses', subject(np('HOUSE', { number: 'plural' })), 'las chasas.'],
    ['the men — the plural never elides', subject(np('MAN', { number: 'plural' })), 'ils homens.'],
    ['a cat — ün', subject(np('CAT', { definiteness: 'indefinite' })), 'ün giat.'],
    ['a house — üna', subject(np('HOUSE', { definiteness: 'indefinite' })), 'üna chasa.'],
    ['a man — ün never elides', subject(np('MAN', { definiteness: 'indefinite' })), 'ün hom.'],
    ['cats — the indefinite plural is bare', subject(np('CAT', { number: 'plural', definiteness: 'indefinite' })), 'giats.'],
    ['the other man — l\' before a prenominal adjective', subject(np('MAN', { adjectives: ['OTHER'] })), "l'oter hom."],
    // Contractions: a and da with the masculine article; in with every one.
    ['to the dog — al', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: DOG } } }), 'eu dun il cudesch al chan.'],
    ['to the dogs — als (verify)', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG', { number: 'plural' }) } } }), 'eu dun il cudesch als chans.'],
    ['to the woman — a la', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('WOMAN') } } }), 'eu dun il cudesch a la duonna.'],
    ['of the dog — dal', subject(np('HOUSE', { possessor: DOG })), 'la chasa dal chan.'],
    ['of the woman — da la', subject(np('HOUSE', { possessor: np('WOMAN') })), 'la chasa da la duonna.'],
    ['in the house — illa', clause(CAT, 'EAT', { complements: { locative: { phrase: np('HOUSE') } } }), 'il giat mangia illa chasa.'],
    ['in the houses — illas (verify)', clause(CAT, 'EAT', { complements: { locative: { phrase: np('HOUSE', { number: 'plural' }) } } }), 'il giat mangia illas chasas.'],
    ['in the book — i\'l', clause(CAT, 'EAT', { complements: { locative: { phrase: np('BOOK') } } }), "il giat mangia i'l cudesch."],
    ['in the books — i\'ls', clause(CAT, 'EAT', { complements: { locative: { phrase: np('BOOK', { number: 'plural' }) } } }), "il giat mangia i'ls cudeschs."],
    ['in the water — in l\' stays apart', clause(CAT, 'EAT', { complements: { locative: { phrase: np('WATER') } } }), "il giat mangia in l'aua."],
    ['on the ground — sün il stays apart (see the pin below)', clause(CAT, 'EAT', { complements: { locative: { phrase: np('GROUND'), specifiers: [{ kind: 'path', value: 'on' }] } } }), 'il giat mangia sün il terrain.'],
    // Adjectives: agreement from the stored forms, position from `position`.
    ['a new dog — NEW follows', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['NEW'] })), 'ün chan nouv.'],
    ['a bad cat — BAD follows', subject(np('CAT', { definiteness: 'indefinite', adjectives: ['BAD'] })), 'ün giat nosch.'],
    ['the old woman — vegl, veglia precedes', subject(np('WOMAN', { adjectives: ['OLD'] })), 'la veglia duonna.'],
    ['the small houses — pitschen, pitschnas', subject(np('HOUSE', { number: 'plural', adjectives: ['SMALL'] })), 'las pitschnas chasas.'],
    ['a beautiful house — bel, bella', subject(np('HOUSE', { definiteness: 'indefinite', adjectives: ['BEAUTIFUL'] })), 'üna bella chasa.'],
    ['a high house — ot, ota', subject(np('HOUSE', { definiteness: 'indefinite', adjectives: ['HIGH'] })), 'üna chasa ota.'],
    ['the black cats', subject(np('CAT', { number: 'plural', adjectives: ['BLACK'] })), 'ils giats nairs.'],
    ['the other big cat — a determiner-like one leaves the slot free', subject(np('CAT', { adjectives: ['OTHER', 'BIG'] })), "l'oter grond giat."],
    ['the first day — prüm precedes', subject(np('DAY', { adjectives: ['FIRST'] })), 'il prüm di.'],
    // Determiners.
    ['this dog — quist', subject(np('DOG', { definiteness: 'this' })), 'quist chan.'],
    ['this house', subject(np('HOUSE', { definiteness: 'this' })), 'quista chasa.'],
    ['these dogs', subject(np('DOG', { number: 'plural', definiteness: 'this' })), 'quists chans.'],
    ['that house', subject(np('HOUSE', { definiteness: 'that' })), 'quella chasa.'],
    ['those dogs', subject(np('DOG', { number: 'plural', definiteness: 'that' })), 'quels chans.'],
    ['no dog — ingün', subject(np('DOG', { definiteness: 'no' })), 'ingün chan.'],
    ['no house — ingüna', subject(np('HOUSE', { definiteness: 'no' })), 'ingüna chasa.'],
    ['some dogs', subject(np('DOG', { number: 'plural', definiteness: 'some' })), 'qualchüns chans.'],
    ['many houses', subject(np('HOUSE', { number: 'plural', definiteness: 'many' })), 'bleras chasas.'],
    ['few dogs', subject(np('DOG', { number: 'plural', definiteness: 'few' })), 'pacs chans.'],
    ['all the dogs', subject(np('DOG', { number: 'plural', definiteness: 'all' })), 'tuots ils chans.'],
    ['each dog', subject(np('DOG', { definiteness: 'each' })), 'mincha chan.'],
    ['three dogs', subject(np('DOG', { number: 'plural', numeral: 3, definiteness: 'bare' } as Partial<NounPhrase>)), 'trais chans.'],
    ['two houses — duos / duas agree', subject(np('HOUSE', { number: 'plural', numeral: 2, definiteness: 'bare' } as Partial<NounPhrase>)), 'duas chasas.'],
    // Degree.
    ['bigger than the dog — co', catIs('BIG', 'more', DOG), 'il giat es plü grond co il chan.'],
    ['the biggest', catIs('BIG', 'most'), 'il giat es il plü grond.'],
    ['less big', catIs('BIG', 'less'), 'il giat es main grond.'],
    ['as big as the dog', catIs('BIG', 'equally', DOG), 'il giat es uschè grond sco il chan.'],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });

  // E8 D2: the style sheet lists *a, da, in* + the article and says nothing of *sün*, so the fork keeps
  // RG's *sün il* apart. Vallader is expected to fuse it as *in* does (*sül*, *süls*, verify at E19).
  test.fails('on the ground — sül (E8 D2, the style sheet is silent)', () => {
    expect(vl(clause(CAT, 'EAT', { complements: { locative: { phrase: np('GROUND'), specifiers: [{ kind: 'path', value: 'on' }] } } }))).toBe('il giat mangia sül terrain.');
  });

  // E8 D3: no word of the neighbours survives the fork.
  test('says no word that is RG, Sursilvan, Puter or Italian only', () => {
    const plans: PhrasePlan[] = [
      subject(np('MAN')), subject(np('CAT', { number: 'plural', adjectives: ['BIG', 'BLACK'] })), subject(np('DOG', { definiteness: 'this' })),
      subject(np('DOG', { definiteness: 'no' })), subject(np('HOUSE', { possessor: np('MAN', { number: 'plural' }) })),
      subject(np('CAT', { possessor: MY })), catIs('BIG', 'more', DOG), catIs('BIG', 'most'),
      eats(), eats({ negative: true }), eats({ tense: 'past' }), eats({ tense: 'future' }), eats({ aspect: 'progressive' }),
      eats({ aspect: 'prospective' }), eats({ aspect: 'resultative', negative: true }), clause(ONE, 'EAT', { directObject: MOUSE }),
      clause(HE, 'GO', { verbPhrase: { modals: ['MUST'] } }), clause(I, 'KNOW', { contentObject: eats({ tense: 'past' }) as never }),
      clause(I, 'BE', { complements: TIRED, verbPhrase: { negative: true } }), clause(I, 'SEE', { directObject: np('SOMETHING'), verbPhrase: { negative: true } }),
      command(YOU, 'EAT', { negative: true }), { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') },
      clause(CAT, 'EAT', { directObject: MOUSE, verbPhrase: { voice: 'passive' } }), eats({ modifier: 'ALWAYS' }),
      clause(CAT, 'RUN', { complements: { locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'under' }] } } }),
      clause(CAT, 'GO', { complements: { direction: { phrase: np('WOMAN') } } }), { ...clause(CAT, 'EAT'), questionRole: 'directObject' },
    ];
    for (const plan of plans) expect(vl(plan)).not.toMatch(LEAKS);
  });
});

describe('P04-E7 D3 (Vallader): an object pronoun is the tonic form after the verb', () => {
  test.each<[string, PhrasePlan, string]>([
    ['I see him', clause(I, 'SEE', { directObject: HE }), 'eu vez el.'],
    ['I see her', clause(I, 'SEE', { directObject: SHE }), 'eu vez ella.'],
    ['the cat sees me', clause(CAT, 'SEE', { directObject: I }), 'il giat vezza mai.'],
    ['the cat sees the dog and me', clause(CAT, 'SEE', { directObject: { conjuncts: [DOG, I], conjunction: 'and' } }), 'il giat vezza il chan e mai.'],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });

  // What Vallader writes: the clitic before the finite verb, and *nu* before the clitic (the style
  // sheet: *eu nu til vez*; the column's `object` cells *am, at, til, tilla*).
  test.fails.each<[string, PhrasePlan, string]>([
    ['I see him — the clitic til', clause(I, 'SEE', { directObject: HE }), 'eu til vez.'],
    ['I do not see him — nu before the clitic', clause(I, 'SEE', { directObject: HE, verbPhrase: { negative: true } }), 'eu nu til vez.'],
    ['the cat sees me — the clitic am', clause(CAT, 'SEE', { directObject: I }), "il giat am vezza."],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });
});

describe('P04-E10: the clause core — subjects kept, ins, the present, the copula', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat eats the mouse', eats(), 'il giat mangia la mür.'],
    ['we eat — the pronoun subject is spoken', clause(WE, 'EAT'), 'nus mangiain.'],
    ['one eats the mouse — ins', clause(ONE, 'EAT', { directObject: MOUSE }), 'ins mangia la mür.'],
    ['I am tired', clause(I, 'BE', { complements: TIRED }), 'eu sun stanguel.'],
    ['he is tired — es', clause(HE, 'BE', { complements: TIRED }), 'el es stanguel.'],
    ['she is tired — the predicate agrees', clause(SHE, 'BE', { complements: TIRED }), 'ella es stangla.'],
    ['they (f.) are tired — ellas', clause(THEY_FEM, 'BE', { complements: TIRED }), 'ellas sun stanglas.'],
    ['one is tired — ins agrees in the masculine singular', clause(ONE, 'BE', { complements: TIRED }), 'ins es stanguel.'],
    ['one sits down — ins takes as', clause(ONE, 'SIT_DOWN'), 'ins as tschanta.'],
    ['I sit down — the reflexive clitic before the verb', clause(I, 'SIT_DOWN'), 'eu am tschant.'],
    ['I remember the cat — the clitic elided', clause(I, 'REMEMBER', { directObject: CAT }), "eu m'algord dal giat."],
    ['he is well — star, bain', clause(HE, 'BE_FARING', { complements: { predicative: { phrase: np('OKAY') } } }), 'el sta bain.'],
    ['what does the cat eat?', { ...clause(CAT, 'EAT'), questionRole: 'directObject' }, 'che mangia il giat?'],
    ['what do you eat? — the pronoun follows the verb', { ...clause(YOU, 'EAT'), questionRole: 'directObject' }, 'che mangiast tü?'],
    ['who eats the mouse?', { ...eats(), questionRole: 'subject', questionAnimate: true }, 'chi mangia la mür?'],
    ['there is a cat — i da (verify)', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE'), existential: true }, 'i da ün giat.'],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });

  test.each(PERSONS)('every person of esser, avair and mangiar: %s', (pn, who) => {
    const cells: Record<string, [string, string, string]> = {
      '1sg': ['eu sun stanguel.', "eu n'ha la mür.", 'eu mang la mür.'],
      '2sg': ['tü est stanguel.', 'tü hast la mür.', 'tü mangiast la mür.'],
      '3sg': ['el es stanguel.', 'el ha la mür.', 'el mangia la mür.'],
      '1pl': ['nus eschan stanguels.', 'nus vain la mür.', 'nus mangiain la mür.'],
      '2pl': ['vus eschat stanguels.', 'vus vais la mür.', 'vus mangiais la mür.'],
      '3pl': ['els sun stanguels.', 'els han la mür.', 'els mangian la mür.'],
    };
    const [be, have, eat] = cells[pn]!;
    expect(vl(clause(who, 'BE', { complements: TIRED }))).toBe(be);
    expect(vl(clause(who, 'HAVE', { directObject: MOUSE }))).toBe(have);
    expect(vl(clause(who, 'EAT', { directObject: MOUSE }))).toBe(eat);
  });

  // E10 D3: whether Vallader inverts subject and verb in a yes/no question is the review's; the engine
  // keeps the declarative order until it rules.
  test.fails('does the cat eat the mouse? — inverted', () => {
    expect(vl({ ...eats(), interrogative: true })).toBe('mangia il giat la mür?');
  });
});

describe('P04-E11: negation — one particle before the verb, nu / nun', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat does not eat the mouse', eats({ negative: true }), 'il giat nu mangia la mür.'],
    ['the cat is not tired — nun before a vowel', clause(CAT, 'BE', { complements: TIRED, verbPhrase: { negative: true } }), 'il giat nun es stanguel.'],
    ['the cat has not eaten — nun before h + vowel', eats({ negative: true, tense: 'past' }), 'il giat nun ha mangià la mür.'],
    ['I do not have the mouse — eu nu n\'ha', clause(I, 'HAVE', { directObject: MOUSE, verbPhrase: { negative: true } }), "eu nu n'ha la mür."],
    ['the cat will not eat — nu before gnir', eats({ negative: true, tense: 'future' }), 'il giat nu vain a mangiar la mür.'],
    // The negative adverbs follow the finite verb; brich is never added.
    ['the cat never eats — nu … mai', eats({ modifier: 'NEVER' }), 'il giat nu mangia mai la mür.'],
    ['the cat no longer eats — nu … plü', eats({ modifier: 'NO_LONGER' }), 'il giat nu mangia plü la mür.'],
    ['the cat has not eaten yet — nu … amo', eats({ negative: true, tense: 'past', modifier: 'ALREADY' }), 'il giat nun ha amo mangià la mür.'],
    ['the cat has never eaten', eats({ tense: 'past', modifier: 'NEVER' }), 'il giat nun ha mai mangià la mür.'],
    ['the cat does not eat the mouse either — neir', eats({ negative: true, modifier: 'ALSO' }), 'il giat nu mangia neir la mür.'],
    ['the cat does not always eat', eats({ negative: true, modifier: 'ALWAYS' }), 'il giat nu mangia adüna la mür.'],
    ['the cat always eats', eats({ modifier: 'ALWAYS' }), 'il giat mangia adüna la mür.'],
    ['the cat has always eaten — the adverb after the auxiliary', eats({ modifier: 'ALWAYS', tense: 'past' }), 'il giat ha adüna mangià la mür.'],
    // Modals.
    ['the cat must not run — nu before the finite modal', clause(CAT, 'RUN', { verbPhrase: { modals: [{ verb: 'MUST', negative: true }] } as Partial<VerbPhrase> }), 'il giat nu sto cuorrer.'],
    ['the cat wants not to run — nu before the governed infinitive (verify)', clause(CAT, 'RUN', { verbPhrase: { modals: ['WILL'], negative: true } }), 'il giat voul nu cuorrer.'],
    ['the cat never wants to run — mai on the finite modal', clause(CAT, 'RUN', { verbPhrase: { modals: [{ verb: 'WILL', modifier: 'NEVER' }] } as Partial<VerbPhrase> }), 'il giat nu voul mai cuorrer.'],
    ['I do not sit down — nun before the clitic', clause(I, 'SIT_DOWN', { verbPhrase: { negative: true } }), 'eu nun am tschant.'],
    ['maybe the cat does not run — the sentence adverb leads', clause(CAT, 'RUN', { verbPhrase: { negative: true, modifier: 'MAYBE' } }), 'forsa il giat nu cuorra.'],
    // E11 D3: negative concord — a negative word takes nu too.
    ['I see no dog', clause(I, 'SEE', { directObject: np('DOG', { definiteness: 'no' }), verbPhrase: { negative: true } }), 'eu nu vez ingün chan.'],
    ['I see nothing — nöglia', clause(I, 'SEE', { directObject: np('SOMETHING'), verbPhrase: { negative: true } }), 'eu nu vez nöglia.'],
    ['nobody knows — ingün nu sa', clause(np('SOMEONE'), 'KNOW', { verbPhrase: { negative: true } }), 'ingün nu sa.'],
    ['no cat eats', clause(np('CAT', { definiteness: 'no' }), 'EAT'), 'ingün giat nu mangia.'],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });
});

describe('P04-E12: the compound past', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat ate the mouse', eats({ tense: 'past' }), 'il giat ha mangià la mür.'],
    ['the (female) cat went — esser, agreeing', clause(SHE_CAT, 'GO', { verbPhrase: { tense: 'past' } }), 'la giatta es ida.'],
    ['the cats went — -its', clause(np('CAT', { number: 'plural' }), 'GO', { verbPhrase: { tense: 'past' } }), 'ils giats sun its.'],
    ['the (female) cats went', clause(np('CAT', { gender: 'fem', number: 'plural' }), 'GO', { verbPhrase: { tense: 'past' } }), 'las giattas sun idas.'],
    ['the cat came — gnü', clause(CAT, 'COME', { verbPhrase: { tense: 'past' } }), 'il giat es gnü.'],
    ['the (female) cat came — gnüda', clause(SHE_CAT, 'COME', { verbPhrase: { tense: 'past' } }), 'la giatta es gnüda.'],
    ['the cats came — gnüts', clause(np('CAT', { number: 'plural' }), 'COME', { verbPhrase: { tense: 'past' } }), 'ils giats sun gnüts.'],
    ['she sat down — the clitic before the auxiliary (verify)', clause(SHE, 'SIT_DOWN', { verbPhrase: { tense: 'past' } }), "ella s'es tschantada."],
    ['she ate — avair never agrees', clause(SHE, 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'ella ha mangià la mür.'],
    ['I ate — eu n\'ha', clause(I, 'EAT', { verbPhrase: { tense: 'past' } }), "eu n'ha mangià."],
    // E12 D3: a state verb's past is the stored imperfect.
    ['he wanted to go', clause(HE, 'GO', { verbPhrase: { modals: ['WILL'], tense: 'past' } }), 'el vulaiva ir.'],
    ['he had the mouse', clause(HE, 'HAVE', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'el vaiva la mür.'],
    ['the cat was tired — d\'eira', clause(CAT, 'BE', { complements: TIRED, verbPhrase: { tense: 'past' } }), "il giat d'eira stanguel."],
    ['the cat was not tired — nu before d\'eira', clause(CAT, 'BE', { complements: TIRED, verbPhrase: { tense: 'past', negative: true } }), "il giat nu d'eira stanguel."],
    // The pluperfect: the imperfect auxiliary.
    ['the cat had eaten the mouse', eats({ tense: 'past', aspect: 'resultative' }), 'il giat vaiva mangià la mür.'],
    ['she had gone', clause(SHE, 'GO', { verbPhrase: { tense: 'past', aspect: 'resultative' } }), "ella d'eira ida."],
    // The sequence of tenses (E1 D1): a present under a past governor is the imperfect.
    ['I knew that the cat was eating the mouse', clause(I, 'KNOW', { contentObject: eats() as never, verbPhrase: { tense: 'past' } }), "eu savaiva cha'l giat mangiaiva la mür."],
    ['the mouse was eaten — the passive on gnir', eats({ voice: 'passive', tense: 'past' }), 'la mür es gnüda mangiada dal giat.'],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });

  test.each(PERSONS)('a BE and a HAVE verb in every person: %s', (pn, who) => {
    const cells: Record<string, [string, string]> = {
      '1sg': ['eu sun i.', "eu n'ha mangià."],
      '2sg': ['tü est i.', 'tü hast mangià.'],
      '3sg': ['el es i.', 'el ha mangià.'],
      '1pl': ['nus eschan its.', 'nus vain mangià.'],
      '2pl': ['vus eschat its.', 'vus vais mangià.'],
      '3pl': ['els sun its.', 'els han mangià.'],
    };
    expect(vl(clause(who, 'GO', { verbPhrase: { tense: 'past' } }))).toBe(cells[pn]![0]);
    expect(vl(clause(who, 'EAT', { verbPhrase: { tense: 'past' } }))).toBe(cells[pn]![1]);
  });

  test('the participle agrees in all four cells after esser: -à → -ada, -ats, -adas', () => {
    const went = (who: NounPhrase) => vl(clause(who, 'RETURN', { verbPhrase: { tense: 'past' } }));
    expect(went(HE)).toBe('el es tuornà.');
    expect(went(SHE)).toBe('ella es tuornada.');
    expect(went(THEY)).toBe('els sun tuornats.');
    expect(went(THEY_FEM)).toBe('ellas sun tuornadas.');
  });

  // P04 D6: one past construction, so the neutral past and the present resultative are one sentence.
  // Pinned as an equality, not filed as a bug.
  test('the past and the resultative render alike', () => {
    expect(vl(eats({ tense: 'past' }))).toBe(vl(eats({ aspect: 'resultative' })));
    expect(vl(clause(SHE, 'GO', { verbPhrase: { tense: 'past' } }))).toBe(vl(clause(SHE, 'GO', { verbPhrase: { aspect: 'resultative' } })));
  });

  // A state verb's past is its imperfect instead (E12 D3), so it is left out.
  test('every verb whose Vallader selects esser says es in the past', async () => {
    const { RM_VALLADER } = await import('../../../backend/src/concepts/rm-vallader/index.js');
    const beVerbs = Object.entries(RM_VALLADER).filter(([id, f]) => f['aux'] === 'be' && f['participle'] && f['3sg_present'] && !f['copula'] && !/^(?:as |s')/.test(f['base']!)
      && lookupLexicalEntry(id, 'rm-vallader')?.forms['stative'] !== '1');
    expect(beVerbs.length).toBeGreaterThan(10);
    for (const [id] of beVerbs) expect(vl(clause(HE, id, { verbPhrase: { tense: 'past' } }))).toMatch(/^el es /);
  });
});

describe('P04-E13: the future — gnir a + infinitive', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat will eat the mouse', eats({ tense: 'future' }), 'il giat vain a mangiar la mür.'],
    ['the cat will not eat the mouse', eats({ tense: 'future', negative: true }), 'il giat nu vain a mangiar la mür.'],
    ['the cat will be tired — ad before a vowel', clause(CAT, 'BE', { complements: TIRED, verbPhrase: { tense: 'future' } }), 'il giat vain ad esser stanguel.'],
    ['she will go', clause(SHE, 'GO', { verbPhrase: { tense: 'future' } }), 'ella vain ad ir.'],
    ['he will have the mouse — avair', clause(HE, 'HAVE', { directObject: MOUSE, verbPhrase: { tense: 'future' } }), 'el vain ad avair la mür.'],
    ['he will have to go — a modal under the future', clause(HE, 'GO', { verbPhrase: { modals: ['MUST'], tense: 'future' } }), 'el vain a stuvair ir.'],
    ['he will not have to go — nu before gnir', clause(HE, 'GO', { verbPhrase: { modals: [{ verb: 'MUST', negative: true }], tense: 'future' } as Partial<VerbPhrase> }), 'el nu vain a stuvair ir.'],
    ['she will sit down — the clitic on the infinitive', clause(SHE, 'SIT_DOWN', { verbPhrase: { tense: 'future' } }), 'ella vain ad as tschantar.'],
    // FUTURE_AS_PRESENT_LANGUAGES (E13 D1): under a temporal conjunction the future is the present.
    ['the cat will eat when the dog runs', clause(CAT, 'EAT', { verbPhrase: { tense: 'future' }, adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN', { verbPhrase: { tense: 'future' } }) as never } }), "il giat vain a mangiar cur cha'l chan cuorra."],
    ['the cat will have eaten', eats({ tense: 'future', aspect: 'resultative' }), 'il giat vain ad avair mangià la mür.'],
    ['she will have gone', clause(SHE, 'GO', { verbPhrase: { tense: 'future', aspect: 'resultative' } }), 'ella vain ad esser ida.'],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });

  test.each(PERSONS)('every person: %s', (pn, who) => {
    const aux: Record<string, string> = { '1sg': 'eu vegn', '2sg': 'tü vainst', '3sg': 'el vain', '1pl': 'nus gnin', '2pl': 'vus gnis', '3pl': 'els vegnan' };
    expect(vl(clause(who, 'EAT', { verbPhrase: { tense: 'future' } }))).toBe(`${aux[pn]} a mangiar.`);
  });
});

describe('P04-E14: aspect, modals, degree and BECOME', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat is eating — esser landervia da (verify)', eats({ aspect: 'progressive' }), 'il giat es landervia da mangiar la mür.'],
    ['the cat is about to eat — esser sül punct da (verify)', eats({ aspect: 'prospective' }), 'il giat es sül punct da mangiar la mür.'],
    ['the cat is not eating', eats({ aspect: 'progressive', negative: true }), 'il giat nun es landervia da mangiar la mür.'],
    ['the cat was eating — the imperfect of esser', eats({ aspect: 'progressive', tense: 'past' }), "il giat d'eira landervia da mangiar la mür."],
    ['the cat was about to eat', eats({ aspect: 'prospective', tense: 'past' }), "il giat d'eira sül punct da mangiar la mür."],
    ['the cat will be eating', eats({ aspect: 'progressive', tense: 'future' }), 'il giat vain ad esser landervia da mangiar la mür.'],
    ['he wants to be able to go', clause(HE, 'GO', { verbPhrase: { modals: ['WILL', 'CAN'] } }), 'el voul pudair ir.'],
    ['he must be eating', clause(HE, 'EAT', { verbPhrase: { modals: ['MUST'], aspect: 'progressive' } }), 'el sto esser landervia da mangiar.'],
    ['he must have gone', clause(HE, 'GO', { verbPhrase: { modals: ['MUST'], aspect: 'resultative' } }), 'el sto esser i.'],
    ['I want to sit down — the clitic on the infinitive', clause(I, 'SIT_DOWN', { verbPhrase: { modals: ['WILL'] } }), 'eu vögl am tschantar.'],
    ['he should go — SHOULD stores the conditional', clause(HE, 'GO', { verbPhrase: { modals: ['SHOULD'] } }), 'el stuvess ir.'],
    ['he might go — MIGHT stores the conditional', clause(HE, 'GO', { verbPhrase: { modals: ['MIGHT'] } }), 'el pudess ir.'],
    ['the cat becomes big — dvantar', clause(CAT, 'BECOME', { complements: { predicative: { phrase: np('BIG') } } }), 'il giat dvanta grond.'],
    ['the (female) cat became big', clause(SHE_CAT, 'BECOME', { complements: { predicative: { phrase: np('BIG') } }, verbPhrase: { tense: 'past' } }), 'la giatta es dvantada gronda.'],
    ['more', catIs('BIG', 'more'), 'il giat es plü grond.'],
    ['most', catIs('BIG', 'most'), 'il giat es il plü grond.'],
    ['less', catIs('BIG', 'less'), 'il giat es main grond.'],
    ['as … as', catIs('BIG', 'equally', DOG), 'il giat es uschè grond sco il chan.'],
    ['very big — fich', clause(CAT, 'BE', { complements: { predicative: { phrase: np('BIG', { headIntensifier: 'VERY' } as Partial<NounPhrase>) } } }), 'il giat es fich grond.'],
    ['a bigger cat than the dog', subject(np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveStandards: [DOG] } as Partial<NounPhrase>)), 'ün giat plü grond co il chan.'],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });

  // E14 D4: the column stores no suppletive comparative, so GOOD compares periphrastically. Vallader is
  // expected to say *meglder* (verify at E19); a lexeme key would carry it, as German's `comparative`.
  test.fails('better — the suppletive meglder', () => {
    expect(vl(catIs('GOOD', 'more'))).toBe('il giat es meglder.');
  });
});

describe('P04-E15: complements, relatives, coordination', () => {
  const runs = (complements: PhrasePlan['complements']): PhrasePlan => clause(CAT, 'RUN', { complements });
  test.each<[string, PhrasePlan, string]>([
    ['locative — in, illa', runs({ locative: { phrase: np('HOUSE') } }), 'il giat cuorra illa chasa.'],
    ['under — suot', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'under' }] } }), 'il giat cuorra suot la chasa.'],
    ['over — sur', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'over' }] } }), 'il giat cuorra sur la chasa.'],
    ['behind — davo', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'behind' }] } }), 'il giat cuorra davo la chasa.'],
    ['in front of — davant', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'in_front_of' }] } }), 'il giat cuorra davant la chasa.'],
    ['around — intuorn', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'around' }] } }), 'il giat cuorra intuorn la chasa.'],
    ['between — tanter', runs({ locative: { phrase: { conjuncts: [np('HOUSE'), DOG], conjunction: 'and' }, specifiers: [{ kind: 'path', value: 'between' }] } }), 'il giat cuorra tanter la chasa e il chan.'],
    ['direction to a place — a', clause(CAT, 'GO', { complements: { direction: { phrase: np('HOUSE') } } }), 'il giat va a la chasa.'],
    ['direction to a person — pro', clause(CAT, 'GO', { complements: { direction: { phrase: np('WOMAN') } } }), 'il giat va pro la duonna.'],
    ['direction home — a chasa', clause(CAT, 'GO', { complements: { direction: { phrase: np('HOME') } } }), 'il giat va a chasa.'],
    ['direction to a land — in', clause(CAT, 'GO', { complements: { direction: { phrase: np('EUROPE') } } }), 'il giat va in Europa.'],
    ['source — da', clause(CAT, 'COME', { complements: { source: { phrase: np('HOUSE') } } }), 'il giat vain da la chasa.'],
    ['source under a running verb — davent da', runs({ source: { phrase: np('HOUSE') } }), 'il giat cuorra davent da la chasa.'],
    ['route — tras', runs({ route: { phrase: np('HOUSE') } }), 'il giat cuorra tras la chasa.'],
    ['cause — pervia da', runs({ cause: { phrase: DOG } }), 'il giat cuorra pervia dal chan.'],
    ['cause, positive — grazcha a', runs({ cause: { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'positive' }] } }), 'il giat cuorra grazcha al chan.'],
    ['cause, negative — per cuolpa da', runs({ cause: { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'negative' }] } }), 'il giat cuorra per cuolpa dal chan.'],
    ['comitative — cun', runs({ comitative: { phrase: DOG } }), 'il giat cuorra cun il chan.'],
    ['comitative pronoun — cun el', runs({ comitative: { phrase: HE } }), 'il giat cuorra cun el.'],
    ['terminus pronoun — ad el', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: HE } } }), 'eu dun il cudesch ad el.'],
    ['the passive agent — da', eats({ voice: 'passive' }), 'la mür vain mangiada dal giat.'],
    ['purpose — per', runs({ purpose: { phrase: np('MAN') } }), "il giat cuorra per l'hom."],
    ['topic — da', clause(I, 'SPEAK', { complements: { topic: { phrase: CAT } } }), 'eu discuorr dal giat.'],
    ['topic the verb governs — a', clause(I, 'THINK', { complements: { topic: { phrase: CAT } } }), 'eu impiss al giat.'],
    ['opponent — cunter', runs({ opponent: { phrase: DOG } }), 'il giat cuorra cunter il chan.'],
    ['temporal — avant', runs({ temporal: { phrase: np('DAY'), specifiers: [{ kind: 'temporal', value: 'before' }] } }), 'il giat cuorra avant il di.'],
    ['temporal — davo (verify)', runs({ temporal: { phrase: np('DAY'), specifiers: [{ kind: 'temporal', value: 'after' }] } }), 'il giat cuorra davo il di.'],
    ['temporal ago — avant, before the phrase', runs({ temporal: { phrase: np('DAY', { definiteness: 'indefinite' }), specifiers: [{ kind: 'temporal', value: 'ago' }] } }), 'il giat cuorra avant ün di.'],
    ['a verb\'s own preposition — sün', clause(I, 'CLICK', { directObject: np('BUTTON') }), 'eu clic sün il buttun.'],
    ['a verb\'s preposition with a pronoun — da ella', clause(CAT, 'DEPEND', { directObject: SHE }), 'il giat dependa da ella.'],
    ['the experiencer fronted — al chan plascha', clause(MOUSE, 'LIKE', { complements: { terminus: { phrase: DOG } } }), 'al chan plascha la mür.'],
    ['a pronoun experiencer fronted too — a mai', clause(MOUSE, 'LIKE', { complements: { terminus: { phrase: I } } }), 'a mai plascha la mür.'],
    // Relatives (E15 D2).
    ['subject relative — chi', subject(np('CAT', { relative: { headRole: 'subject', verbPhrase: { verb: 'EAT' }, directObject: MOUSE } })), 'il giat chi mangia la mür.'],
    ['object relative — cha\'l', subject(np('MOUSE', { relative: { headRole: 'directObject', subject: CAT, verbPhrase: { verb: 'EAT' } } })), "la mür cha'l giat mangia."],
    ['object relative — cha la', subject(np('MOUSE', { relative: { headRole: 'directObject', subject: SHE_CAT, verbPhrase: { verb: 'EAT' } } })), 'la mür cha la giatta mangia.'],
    ['object relative with a pronoun subject — ch\' before a vowel', subject(np('BOOK', { relative: { headRole: 'directObject', subject: I, verbPhrase: { verb: 'READ' } } })), "il cudesch ch'eu leg."],
    ['prepositional relative — la quala', subject(np('HOUSE', { relative: { headRole: 'locative', subject: CAT, verbPhrase: { verb: 'EAT' }, headSpecifiers: [{ kind: 'path', value: 'under' }] } } as Partial<NounPhrase>)), 'la chasa suot la quala il giat mangia.'],
    ['prepositional relative — cun il qual', subject(np('DOG', { relative: { headRole: 'comitative', subject: CAT, verbPhrase: { verb: 'RUN' } } } as Partial<NounPhrase>)), 'il chan cun il qual il giat cuorra.'],
    ['place relative — ingio', subject(np('PLACE', { relative: { headRole: 'locative', subject: CAT, verbPhrase: { verb: 'EAT' } } } as Partial<NounPhrase>)), 'il lö ingio il giat mangia.'],
    ['terminus relative — al qual', subject(np('MAN', { relative: { headRole: 'terminus', subject: np('WOMAN'), verbPhrase: { verb: 'GIVE' }, directObject: np('BOOK') } } as Partial<NounPhrase>)), "l'hom al qual la duonna da il cudesch."],
    ['agent relative — dal qual', subject(np('CHILD', { relative: { headRole: 'subject', verbPhrase: { verb: 'WRITE', voice: 'passive' }, directObject: np('BOOK') } } as Partial<NounPhrase>)), "l'uffant dal qual il cudesch vain scrit."],
    ['possessor relative — the possessed first, then dal qual', subject(np('BOY', { relative: { headRole: 'possessor', subject: CAT, verbPhrase: { verb: 'EAT' } } })), 'il mat il giat dal qual mangia.'],
    // Coordination (E15 D3).
    ['and', subject({ conjuncts: [CAT, DOG], conjunction: 'and' }), 'il giat e il chan.'],
    ['or — o', subject({ conjuncts: [CAT, DOG], conjunction: 'or' }), 'il giat o il chan.'],
    ['but', { ...clause(CAT, 'RUN'), coordination: { conjunction: 'but', clause: clause(DOG, 'EAT') } }, 'il giat cuorra, ma il chan mangia.'],
    ['however — tuottüna, a clause of its own (verify)', { ...clause(CAT, 'RUN'), coordination: { conjunction: 'however', clause: clause(DOG, 'EAT') } }, 'il giat cuorra; tuottüna, il chan mangia.'],
    ['and before a vowel — no ed (E15 D3, verify)', subject({ conjuncts: [CAT, np('MAN')], conjunction: 'and' }), "il giat e l'hom."],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });

  // E15 D1's open point: a process-level instrument said as an act needs a non-gerund means
  // construction; the engine says *cun* + the infinitive until a source or the review gives one.
  test.todo('the process-level instrumental (P04-E15 D1): what Vallader writes for "by choosing a word"');
});

describe('P04-E16: moods — conditional, imperative, infinitive; no inversion', () => {
  test.each<[string, PhrasePlan, string]>([
    ['if the dog ran, the cat would eat — scha, the conditional in both clauses', { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') }, "scha'l chan cuorress, il giat mangiess."],
    ['if the cat were tired — füss', { ...clause(DOG, 'RUN'), condition: clause(CAT, 'BE', { complements: TIRED }) }, "scha'l giat füss stanguel, il chan cuorress."],
    ['if she ran — sch\' before a vowel', { ...clause(CAT, 'EAT'), condition: clause(SHE, 'RUN') }, "sch'ella cuorress, il giat mangiess."],
    ['if the dog did not run — negated in the protasis', { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN', { verbPhrase: { negative: true } }) }, "scha'l chan nu cuorress, il giat mangiess."],
    ['if the dog had run, the cat would have eaten', { ...clause(CAT, 'EAT', { verbPhrase: { aspect: 'resultative' } }), condition: clause(DOG, 'RUN', { verbPhrase: { aspect: 'resultative' } }) }, "scha'l chan vess curri, il giat vess mangià."],
    ['eat! (2sg)', command(YOU, 'EAT', {}, { directObject: MOUSE }), 'mangia la mür.'],
    ['let\'s eat! (1pl)', command(WE, 'EAT', {}, { directObject: MOUSE }), 'mangiain la mür.'],
    ['eat! (2pl)', command(YOU_ALL, 'EAT', {}, { directObject: MOUSE }), 'mangiai la mür.'],
    ['don\'t eat! (2sg) — nu before the command (verify)', command(YOU, 'EAT', { negative: true }, { directObject: MOUSE }), 'nu mangia la mür.'],
    ['let\'s not eat! (1pl)', command(WE, 'EAT', { negative: true }), 'nu mangiain.'],
    ['don\'t eat! (2pl)', command(YOU_ALL, 'EAT', { negative: true }), 'nu mangiai.'],
    ['go! — ir', command(YOU, 'GO'), 'va.'],
    ['don\'t go! — nu va', command(YOU, 'GO', { negative: true }), 'nu va.'],
    ['be careful! — esser, the subjunctive serving', command(YOU, 'BE', {}, { complements: { predicative: { phrase: np('CAREFUL') } } }), 'sajast attent.'],
    ['sit down! — the enclitic the column stores', command(YOU, 'SIT_DOWN'), "tschanta't."],
    ['sit down! (2pl)', command(YOU_ALL, 'SIT_DOWN'), "tschantai'as."],
    ['don\'t sit down! — the clitic before the command', command(YOU, 'SIT_DOWN', { negative: true }), 'nun at tschanta.'],
    ['to eat the mouse — the citation', { ...clause(ONE, 'EAT', { directObject: MOUSE }), infinitive: true }, 'mangiar la mür.'],
    ['not to eat — nu before the infinitive', { ...clause(ONE, 'EAT', { verbPhrase: { negative: true } }), infinitive: true }, 'nu mangiar.'],
    ['to sit down — the reflexive citation', { ...clause(ONE, 'SIT_DOWN'), infinitive: true }, 'as tschantar.'],
    ['to be eaten — the passive citation', { ...clause(CAT, 'EAT', { directObject: MOUSE, verbPhrase: { voice: 'passive' } }), infinitive: true }, 'gnir mangiada dal giat.'],
    ['I want to eat — the infinitive', clause(I, 'EAT', { verbPhrase: { modals: ['WILL'] } }), 'eu vögl mangiar.'],
    ['the cat begins to eat — a', clause(CAT, 'BEGIN', { infinitiveComplement: clause(CAT, 'EAT') as never }), 'il giat cumainza a mangiar.'],
    ['the cat tries to eat — da', clause(CAT, 'TRY', { infinitiveComplement: clause(CAT, 'EAT') as never }), 'il giat prouva da mangiar.'],
    ['I know that the cat eats — cha\'l', clause(I, 'KNOW', { contentObject: eats() as never }), "eu sa cha'l giat mangia la mür."],
    ['I know that she eats — ch\' before a vowel', clause(I, 'KNOW', { contentObject: clause(SHE, 'EAT') as never }), "eu sa ch'ella mangia."],
    ['I ask whether the cat eats — scha\'l', clause(I, 'ASK', { contentObject: { ...eats(), interrogative: true } as never }), "eu dumand scha'l giat mangia la mür."],
    ['I believe that the cat is tired — the subjunctive', clause(I, 'BELIEVE', { contentObject: clause(CAT, 'BE', { complements: TIRED }) as never }), "eu crai cha'l giat saja stanguel."],
    ['when the dog runs, the cat eats — cur cha (verify)', clause(CAT, 'EAT', { adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN') as never } }), "il giat mangia cur cha'l chan cuorra."],
    ['before the dog runs — avant cha + the subjunctive', clause(CAT, 'EAT', { adverbialClause: { conjunction: 'before', clause: clause(DOG, 'RUN') as never } }), "il giat mangia avant cha'l chan cuorra."],
  ])('%s', (_label, plan, expected) => {
    expect(vl(plan)).toBe(expected);
  });

  test('a UI control is the infinitive (E16 D2)', () => {
    expect(vl(command(YOU, 'SAVE', {}, { imperativeRegister: 'instruction' } as Partial<PhrasePlan>))).toBe('arcunar.');
  });

  // D9: after a fronted *scha*-clause Vallader may put the verb before the subject (verb second); the
  // engine keeps subject–verb order until the reviewer rules.
  test.fails('if the dog ran, the cat would eat — inverted (D9)', () => {
    expect(vl({ ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') })).toBe("scha'l chan cuorress, mangiess il giat.");
  });
});
