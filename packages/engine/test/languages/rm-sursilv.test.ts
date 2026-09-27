import { describe, expect, test } from 'vitest';
import type { Degree, NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say } from '../harness.js';
import { lookupLexicalEntry } from '../../../backend/src/lexicon.js';

// Sursilvan (P04): the language's own suite while it is a preview language (P04 §4). The exhaustive
// tables elsewhere render the ready languages only; every line here is the engine's output, pinned
// after checking it against `docs/features/P-planning/P04-romansh/style-rm-sursilv.md`, and every row
// is *(verify)* until the review (P04-E19). A known gap is a `test.fails` row that states what
// Sursilvan is expected to write — where the style sheet is silent, the RG behaviour the fork kept
// (P04-E8 D2); a question no source here settles is a `test.todo` naming it.

const sv = (plan: PhrasePlan): string => say(plan, 'rm-sursilv');

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
const OUR = { kind: 'pronominal', person: '1', number: 'plural' } as NounPhrase['possessor'];
const eats = (vp: Partial<VerbPhrase> = {}, rest: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> = {}): PhrasePlan =>
  clause(CAT, 'EAT', { directObject: MOUSE, ...rest, verbPhrase: vp });
const subject = (element: NounElement): PhrasePlan => ({ subject: element });
const command = (addressee: NounPhrase, verb = 'EAT', vp: Partial<VerbPhrase> = {}, rest: Partial<PhrasePlan> = {}): PhrasePlan =>
  ({ ...clause(addressee, verb, { verbPhrase: vp }), imperative: true, ...rest });
const is = (who: NounElement, adjective: string, vp: Partial<VerbPhrase> = {}, degree: Degree = 'positive', standard?: NounElement): PhrasePlan =>
  clause(who, 'BE', { verbPhrase: vp, complements: { predicative: { phrase: np(adjective, { headDegree: degree, ...(standard ? { headStandard: standard } : {}) }) } } });
const catIs = (adjective: string, degree: Degree = 'positive', standard?: NounElement): PhrasePlan => is(CAT, adjective, {}, degree, standard);

// The words that are Rumantsch Grischun, Vallader or Italian and never Sursilvan (P04-E8 D3): RG's from
// the Sursilvan style sheet's guard (*jau, è, betg, giat, mangià, chaun, uffant*) and the RG engine's
// function words (*na, nagin, insaquants, blers, pervia, tar, cunter*), Vallader's from its style sheet
// (*eu, es* — not Sursilvan's 2sg *eis* — *nu, nun, hoz, hom, uossa, alch, nüglia, adüna, fich*), and
// Italian's (P04-E7 D2).
const LEAKS = /(^|[\s'])(jau|è|èn|betg|giat|giats|mangià|mangiar|mangia|chaun|uffant|mieur|na|nagin|nagina|insaquants|blers|pervia|tar|cunter|main|uschè|eu|es|nu|nun|hoz|hom|uossa|alch|nüglia|adüna|fich|gatto|gatti|cane|topo|gli|lo|della|dello|delle|degli|più|non|sono|nessun|nessuna|questo|quello|anche|molto|essere|avere|mangiato)(?=[\s.,?!]|$)/;

describe('P04-E8: the noun phrase', () => {
  test.each<[string, PhrasePlan, string]>([
    // E7's table, in Sursilvan.
    ['the man — igl before a vowel, masculine', subject(np('MAN')), 'igl um.'],
    ['the water — l\' before a vowel, feminine', subject(np('WATER')), "l'aua."],
    ['the cats', subject(np('CAT', { number: 'plural' })), 'ils gats.'],
    ['a big dog — BIG follows', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['BIG'] })), 'in tgaun grond.'],
    ['a great dog — GREAT precedes', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['GREAT'] })), 'in grond tgaun.'],
    ['to the dog — al', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: DOG } } }), 'jeu dun il cudisch al tgaun.'],
    ['to the man — a stays apart before igl, ad before the vowel', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('MAN') } } }), 'jeu dun il cudisch ad igl um.'],
    ['of the men — da + ils is dils', subject(np('HOUSE', { possessor: np('MAN', { number: 'plural' }) })), 'la casa dils umens.'],
    ['my cat — miu, no article', subject(np('CAT', { possessor: MY })), 'miu gat.'],
    ['my house — mia', subject(np('HOUSE', { possessor: MY })), 'mia casa.'],
    ['my cats — mes', subject(np('CAT', { number: 'plural', possessor: MY })), 'mes gats.'],
    ['my houses — mias', subject(np('HOUSE', { number: 'plural', possessor: MY })), 'mias casas.'],
    ['our cat — nies', subject(np('CAT', { possessor: OUR })), 'nies gat.'],
    ['to my cat — the possessive after a preposition, still no article', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('CAT', { possessor: MY }) } } }), 'jeu dun il cudisch a miu gat.'],
    ['more beautiful — pli, predicative', catIs('BEAUTIFUL', 'more'), 'il gat ei pli bials.'],
    // Articles.
    ['the house', subject(np('HOUSE')), 'la casa.'],
    ['the houses', subject(np('HOUSE', { number: 'plural' })), 'las casas.'],
    ['the men — the plural never changes', subject(np('MAN', { number: 'plural' })), 'ils umens.'],
    ['a cat', subject(np('CAT', { definiteness: 'indefinite' })), 'in gat.'],
    ['a house', subject(np('HOUSE', { definiteness: 'indefinite' })), 'ina casa.'],
    ['a man — in never elides', subject(np('MAN', { definiteness: 'indefinite' })), 'in um.'],
    ['cats — the indefinite plural is bare', subject(np('CAT', { number: 'plural', definiteness: 'indefinite' })), 'gats.'],
    ['the other man — igl before a prenominal adjective', subject(np('MAN', { adjectives: ['OTHER'] })), 'igl auter um.'],
    ['another house — in\' before a vowel, feminine', subject(np('HOUSE', { definiteness: 'indefinite', adjectives: ['OTHER'] })), "in'autra casa."],
    // Contractions: a, da, en with il / ils; apart elsewhere.
    ['to the dogs — als', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG', { number: 'plural' }) } } }), 'jeu dun il cudisch als tgauns.'],
    ['to the woman — a la', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('WOMAN') } } }), 'jeu dun il cudisch a la dunna.'],
    ['of the dog — dil', subject(np('HOUSE', { possessor: DOG })), 'la casa dil tgaun.'],
    ['of the woman — da la', subject(np('HOUSE', { possessor: np('WOMAN') })), 'la casa da la dunna.'],
    ['in the book — en + il is el', clause(CAT, 'EAT', { complements: { locative: { phrase: np('BOOK') } } }), 'il gat maglia el cudisch.'],
    ['in the books — els', clause(CAT, 'EAT', { complements: { locative: { phrase: np('BOOK', { number: 'plural' }) } } }), 'il gat maglia els cudischs.'],
    ['in the house — en la', clause(CAT, 'EAT', { complements: { locative: { phrase: np('HOUSE') } } }), 'il gat maglia en la casa.'],
    ['on the ground — sin il stays apart', clause(CAT, 'EAT', { complements: { locative: { phrase: np('GROUND'), specifiers: [{ kind: 'path', value: 'on' }] } } }), 'il gat maglia sin il terren.'],
    // Adjectives: agreement from the stored forms, position from `position`.
    ['a new dog — NEW follows', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['NEW'] })), 'in tgaun niev.'],
    ['a good bread — GOOD follows, attributive bun', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['GOOD'] })), 'in tgaun bun.'],
    ['the old woman — vegl, veglia, before the noun', subject(np('WOMAN', { adjectives: ['OLD'] })), 'la veglia dunna.'],
    ['the small houses — pign, pintgas', subject(np('HOUSE', { number: 'plural', adjectives: ['SMALL'] })), 'las casas pintgas.'],
    ['the beautiful cats — bi, bials', subject(np('CAT', { number: 'plural', adjectives: ['BEAUTIFUL'] })), 'ils bials gats.'],
    ['the black cats', subject(np('CAT', { number: 'plural', adjectives: ['BLACK'] })), 'ils gats ners.'],
    ['the other beautiful cat — a determiner-like one leaves the slot free', subject(np('CAT', { adjectives: ['OTHER', 'BEAUTIFUL'] })), 'igl auter bi gat.'],
    ['a strong and careful dog — ed before a vowel', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['STRONG', 'CAREFUL'] })), 'in tgaun ferm ed attent.'],
    // Determiners.
    ['this dog', subject(np('DOG', { definiteness: 'this' })), 'quest tgaun.'],
    ['this house', subject(np('HOUSE', { definiteness: 'this' })), 'questa casa.'],
    ['those dogs', subject(np('DOG', { number: 'plural', definiteness: 'that' })), 'quels tgauns.'],
    ['no dog — negin', subject(np('DOG', { definiteness: 'no' })), 'negin tgaun.'],
    ['no house — negina', subject(np('HOUSE', { definiteness: 'no' })), 'negina casa.'],
    ['some dogs — entgins', subject(np('DOG', { number: 'plural', definiteness: 'some' })), 'entgins tgauns.'],
    ['many houses — biaras', subject(np('HOUSE', { number: 'plural', definiteness: 'many' })), 'biaras casas.'],
    ['few dogs', subject(np('DOG', { number: 'plural', definiteness: 'few' })), 'paucs tgauns.'],
    ['all the dogs', subject(np('DOG', { number: 'plural', definiteness: 'all' })), 'tuts ils tgauns.'],
    ['each dog', subject(np('DOG', { definiteness: 'each' })), 'mintga tgaun.'],
    ['three dogs — treis', subject(np('DOG', { number: 'plural', numeral: 3, definiteness: 'bare' } as Partial<NounPhrase>)), 'treis tgauns.'],
    ['two houses — dus / duas agree', subject(np('HOUSE', { number: 'plural', numeral: 2, definiteness: 'bare' } as Partial<NounPhrase>)), 'duas casas.'],
    // Degree (the style sheet: pli / il pli / meins).
    ['bigger than the dog', catIs('BIG', 'more', DOG), "il gat ei pli gronds ch'il tgaun."],
    ['the biggest — an articled superlative keeps the attributive form', catIs('BIG', 'most'), 'il gat ei il pli grond.'],
    ['less big — meins', catIs('BIG', 'less'), 'il gat ei meins gronds.'],
    ['as big as the dog — aschi … sco', catIs('BIG', 'equally', DOG), 'il gat ei aschi gronds sco il tgaun.'],
    ['a bigger cat than the dog — attributive', subject(np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveStandards: [DOG] } as Partial<NounPhrase>)), "in gat pli grond ch'il tgaun."],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  // E8 D2: the style sheet lists *a + il → al, da + il → dil, en + il → el* and no other contraction,
  // so the fork keeps the preposition apart everywhere else, as RG does. Each row states the
  // contraction the implementer expects Sursilvan to write; the reviewer (E19) rules.
  test.fails.each<[string, PhrasePlan, string]>([
    ['to the woman — alla (verify)', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('WOMAN') } } }), 'jeu dun il cudisch alla dunna.'],
    ['of the woman — dalla (verify)', subject(np('HOUSE', { possessor: np('WOMAN') })), 'la casa dalla dunna.'],
    ['in the house — ella (verify)', clause(CAT, 'EAT', { complements: { locative: { phrase: np('HOUSE') } } }), 'il gat maglia ella casa.'],
    ['to the man — agl (verify)', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('MAN') } } }), 'jeu dun il cudisch agl um.'],
    ['of the man — digl (verify)', subject(np('HOUSE', { possessor: np('MAN') })), 'la casa digl um.'],
    ['on the ground — sil (verify)', clause(CAT, 'EAT', { complements: { locative: { phrase: np('GROUND'), specifiers: [{ kind: 'path', value: 'on' }] } } }), 'il gat maglia sil terren.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  // E8 D3: no Rumantsch Grischun, Vallader or Italian word survives the fork.
  test('says no word that is RG, Vallader or Italian only', () => {
    const plans: PhrasePlan[] = [
      subject(np('MAN')), subject(np('CAT', { number: 'plural', adjectives: ['BIG', 'BLACK'] })), subject(np('DOG', { definiteness: 'this' })),
      subject(np('DOG', { definiteness: 'no' })), subject(np('HOUSE', { possessor: np('MAN', { number: 'plural' }) })),
      subject(np('DOG', { number: 'plural', definiteness: 'some' })), subject(np('DOG', { number: 'plural', definiteness: 'many' })),
      subject(np('CAT', { possessor: MY })), catIs('BIG', 'more', DOG), catIs('BIG', 'most'), catIs('BIG', 'less'), catIs('BIG', 'equally', DOG),
      eats(), eats({ negative: true }), eats({ tense: 'past' }), eats({ tense: 'future' }), eats({ aspect: 'progressive' }),
      eats({ aspect: 'prospective' }), eats({ aspect: 'resultative', negative: true }), clause(ONE, 'EAT', { directObject: MOUSE }),
      clause(HE, 'GO', { verbPhrase: { modals: ['MUST'] } }), clause(I, 'KNOW', { contentObject: eats({ tense: 'past' }) as never }),
      is(I, 'TIRED', { negative: true }), is(HE, 'TIRED'), is(YOU, 'TIRED'), command(YOU, 'EAT', { negative: true }),
      { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') }, clause(CAT, 'EAT', { directObject: MOUSE, verbPhrase: { voice: 'passive' } }),
      clause(CAT, 'RUN', { complements: { cause: { phrase: DOG } } }), clause(CAT, 'GO', { complements: { direction: { phrase: np('WOMAN') } } }),
      clause(CAT, 'RUN', { complements: { opponent: { phrase: DOG } } }), clause(I, 'SEE', { directObject: np('DOG', { definiteness: 'no' }), verbPhrase: { negative: true } }),
    ];
    for (const plan of plans) expect(sv(plan)).not.toMatch(LEAKS);
  });
});

describe('P04-E8: an object pronoun is the stressed form after the verb — Sursilvan has no clitic', () => {
  test.each<[string, PhrasePlan, string]>([
    ['I see him', clause(I, 'SEE', { directObject: HE }), 'jeu vesel el.'],
    ['I see her', clause(I, 'SEE', { directObject: SHE }), 'jeu vesel ella.'],
    ['the cat sees me — mei', clause(CAT, 'SEE', { directObject: I }), 'il gat vesa mei.'],
    ['the cat sees you — tei', clause(CAT, 'SEE', { directObject: YOU }), 'il gat vesa tei.'],
    ['the cat sees the dog and me', clause(CAT, 'SEE', { directObject: { conjuncts: [DOG, I], conjunction: 'and' } }), 'il gat vesa il tgaun e mei.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });
});

describe('P04-E9: the predicative adjective — il tgaun ei buns', () => {
  test.each<[string, PhrasePlan, string]>([
    // The ticket's table.
    ['a good bread — attributive', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['GOOD'] })), 'in tgaun bun.'],
    ['the bread is good — predicative', is(np('DOG'), 'GOOD'), 'il tgaun ei buns.'],
    ['the bread becomes good — BECOME takes it too', clause(np('DOG'), 'BECOME', { complements: { predicative: { phrase: np('GOOD') } } }), 'il tgaun daventa buns.'],
    // The other three cells are the attributive ones.
    ['the (female) cat is good — buna', is(SHE_CAT, 'GOOD'), 'la gatta ei buna.'],
    ['the cats are good — buns in both positions', is(np('CAT', { number: 'plural' }), 'GOOD'), 'ils gats ein buns.'],
    ['the (female) cats are good — bunas', is(np('CAT', { gender: 'fem', number: 'plural' }), 'GOOD'), 'las gattas ein bunas.'],
    ['I am tired — the speaker masculine by default', is(I, 'TIRED'), 'jeu sun stanchels.'],
    ['an adjective in -s keeps it — bass', is(HE, 'LOW'), 'el ei bass.'],
    ['the bread was good — the past of esser', is(np('DOG'), 'GOOD', { tense: 'past' }), 'il tgaun fuva buns.'],
    ['the bread will be good — under the future', is(np('DOG'), 'GOOD', { tense: 'future' }), 'il tgaun vegn ad esser buns.'],
    ['the bread must be good — under a modal', clause(np('DOG'), 'BE', { verbPhrase: { modals: ['MUST'] }, complements: { predicative: { phrase: np('GOOD') } } }), 'il tgaun sto esser buns.'],
    ['the bread that is good — in a relative', subject(np('DOG', { relative: { headRole: 'subject', verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np('GOOD') } } } } as Partial<NounPhrase>)), "il tgaun ch'ei buns."],
    ['a good and big bread — two attributives', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['GOOD', 'BIG'] })), 'in tgaun bun e grond.'],
    ['the bread is good and big — two predicatives', clause(np('DOG'), 'BE', { complements: { predicative: { phrase: { conjuncts: [np('GOOD'), np('BIG')], conjunction: 'and' } } } }), 'il tgaun ei buns e gronds.'],
    ['the cat became big — BECOME in the past, participle and adjective both predicative', clause(CAT, 'BECOME', { complements: { predicative: { phrase: np('BIG') } }, verbPhrase: { tense: 'past' } }), 'il gat ei daventaus gronds.'],
    ['the bread is a good bread — a predicate noun keeps its attributive', clause(np('DOG'), 'BE', { complements: { predicative: { phrase: np('DOG', { definiteness: 'indefinite', adjectives: ['GOOD'] }) } } }), 'il tgaun ei in tgaun bun.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  // E9 D2's open points, each rendering the attributive form until the reviewer rules; the row states
  // the predicative the implementer expects.
  test.fails.each<[string, PhrasePlan, string]>([
    ['the cat seems big — SEEM (verify)', clause(CAT, 'SEEM', { complements: { predicative: { phrase: np('BIG') } } }), 'il gat para gronds.'],
    ['the cat makes the dog big — the object predicative (verify)', clause(CAT, 'MAKE', { directObject: DOG, complements: { objectPredicative: { phrase: np('BIG') } } }), 'il gat fa il tgaun gronds.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  test.todo('the impersonal: "ei ei bun ch\'el cuori" or "ei ei buns …" (P04-E9 D2) — rendered bare');
});

describe('P04-E10: the clause core — subjects kept, ins, the present, esser', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat eats the mouse — magliar', eats(), 'il gat maglia la miur.'],
    ['we eat — the pronoun subject is spoken', clause(WE, 'EAT'), 'nus magliein.'],
    ['one eats the mouse — ins', clause(ONE, 'EAT', { directObject: MOUSE }), 'ins maglia la miur.'],
    ['I am tired', is(I, 'TIRED'), 'jeu sun stanchels.'],
    ['he is tired — ei', is(HE, 'TIRED'), 'el ei stanchels.'],
    ['she is tired — the predicate agrees', is(SHE, 'TIRED'), 'ella ei stancla.'],
    ['they are tired — ein', is(THEY_FEM, 'TIRED'), 'ellas ein stanclas.'],
    ['one is tired — ins agrees in the masculine singular', is(ONE, 'TIRED'), 'ins ei stanchels.'],
    ['I stop — the fused se- in every person', clause(I, 'STOP_ONESELF'), 'jeu sefermel.'],
    ['one stops — ins', clause(ONE, 'STOP_ONESELF'), 'ins seferma.'],
    ['what does the cat eat? — tgei', { ...clause(CAT, 'EAT'), questionRole: 'directObject' }, 'tgei maglia il gat?'],
    ['what do you eat? — the pronoun follows the verb', { ...clause(YOU, 'EAT'), questionRole: 'directObject' }, 'tgei maglias ti?'],
    ['who eats the mouse? — tgi', { ...eats(), questionRole: 'subject', questionAnimate: true }, 'tgi maglia la miur?'],
    ['there is a cat — ei dat', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE'), existential: true }, 'ei dat in gat.'],
    ['how are you? — star', { ...clause(YOU, 'BE', { complements: { predicative: { phrase: np('OKAY') } } }) }, 'ti stas bein.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  test.each(PERSONS)('every person of esser, haver and magliar: %s', (pn, who) => {
    const cells: Record<string, [string, string, string]> = {
      '1sg': ['jeu sun stanchels.', 'jeu hai la miur.', 'jeu magliel la miur.'],
      '2sg': ['ti eis stanchels.', 'ti has la miur.', 'ti maglias la miur.'],
      '3sg': ['el ei stanchels.', 'el ha la miur.', 'el maglia la miur.'],
      '1pl': ['nus essan stanchels.', 'nus havein la miur.', 'nus magliein la miur.'],
      '2pl': ['vus essas stanchels.', 'vus haveis la miur.', 'vus maglieis la miur.'],
      '3pl': ['els ein stanchels.', 'els han la miur.', 'els maglian la miur.'],
    };
    const [be, have, eat] = cells[pn]!;
    expect(sv(is(who, 'TIRED'))).toBe(be);
    expect(sv(clause(who, 'HAVE', { directObject: MOUSE }))).toBe(have);
    expect(sv(clause(who, 'EAT', { directObject: MOUSE }))).toBe(eat);
  });

  // E10 D3: Sursilvan inverts subject and verb in a yes/no question (verify); the engine keeps the
  // declarative order until the review rules.
  test.fails('does the cat eat the mouse? — inverted', () => {
    expect(sv({ ...eats(), interrogative: true })).toBe('maglia il gat la miur?');
  });
});

describe('P04-E11: negation — buca after the finite verb', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat does not eat the mouse', eats({ negative: true }), 'il gat maglia buca la miur.'],
    ['the cat is not tired', is(CAT, 'TIRED', { negative: true }), 'il gat ei buca stanchels.'],
    ['the cat never eats — mai replaces buca', eats({ modifier: 'NEVER' }), 'il gat maglia mai la miur.'],
    ['the cat no longer eats — buca pli', eats({ modifier: 'NO_LONGER' }), 'il gat maglia buca pli la miur.'],
    ['the cat has not eaten — buca after the auxiliary', eats({ negative: true, tense: 'past' }), 'il gat ha buca magliau la miur.'],
    ['the cat has not eaten yet — aunc buca', eats({ negative: true, tense: 'past', modifier: 'ALREADY' }), 'il gat ha aunc buca magliau la miur.'],
    ['the cat has never eaten', eats({ tense: 'past', modifier: 'NEVER' }), 'il gat ha mai magliau la miur.'],
    ['the cat must not run — the finite modal negated', clause(CAT, 'RUN', { verbPhrase: { modals: [{ verb: 'MUST', negative: true }] } as Partial<VerbPhrase> }), 'il gat sto buca currer.'],
    ['the cat wants not to run — the governed infinitive', clause(CAT, 'RUN', { verbPhrase: { modals: ['WILL'], negative: true } }), 'il gat vul buca currer.'],
    ['the cat never wants to run — mai on the finite modal', clause(CAT, 'RUN', { verbPhrase: { modals: [{ verb: 'WILL', modifier: 'NEVER' }] } as Partial<VerbPhrase> }), 'il gat vul mai currer.'],
    ['the cat does not always eat — buca before the frequency adverb', eats({ negative: true, modifier: 'ALWAYS' }), 'il gat maglia buca adina la miur.'],
    ['the cat always eats', eats({ modifier: 'ALWAYS' }), 'il gat maglia adina la miur.'],
    ['the cat has always eaten', eats({ modifier: 'ALWAYS', tense: 'past' }), 'il gat ha adina magliau la miur.'],
    ['the cat does not eat the mouse either — gnanc', eats({ negative: true, modifier: 'ALSO' }), 'il gat maglia gnanc la miur.'],
    ['he does not go out — buca before the particle', clause(HE, 'GO_OUT', { verbPhrase: { negative: true } }), 'el va buca ora.'],
    ['I do not stop — the fused se- verb', clause(I, 'STOP_ONESELF', { verbPhrase: { negative: true } }), 'jeu sefermel buca.'],
    ['the cat will not eat', eats({ negative: true, tense: 'future' }), 'il gat vegn buca a magliar la miur.'],
    // E11 D3: no concord with buca — the negative word denies the clause alone.
    ['I see no dog', clause(I, 'SEE', { directObject: np('DOG', { definiteness: 'no' }), verbPhrase: { negative: true } }), 'jeu vesel negin tgaun.'],
    ['I see nothing — nuot', clause(I, 'SEE', { directObject: np('SOMETHING'), verbPhrase: { negative: true } }), 'jeu vesel nuot.'],
    ['nobody knows — negin', clause(np('SOMEONE'), 'KNOW', { verbPhrase: { negative: true } }), 'negin sa.'],
    ['no cat eats', clause(np('CAT', { definiteness: 'no' }), 'EAT'), 'negin gat maglia.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });
});

describe('P04-E12: the compound past — the predicative -s after esser', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat ate the mouse — haver, -au', eats({ tense: 'past' }), 'il gat ha magliau la miur.'],
    ['the cat came — vegnius', clause(CAT, 'COME', { verbPhrase: { tense: 'past' } }), 'il gat ei vegnius.'],
    ['the (female) cat went — ida', clause(SHE_CAT, 'GO', { verbPhrase: { tense: 'past' } }), 'la gatta ei ida.'],
    ['the cats went — i', clause(np('CAT', { number: 'plural' }), 'GO', { verbPhrase: { tense: 'past' } }), 'ils gats ein i.'],
    ['the (female) cats went — idas', clause(np('CAT', { gender: 'fem', number: 'plural' }), 'GO', { verbPhrase: { tense: 'past' } }), 'las gattas ein idas.'],
    ['he was tired — the past of a state is its imperfect', is(HE, 'TIRED', { tense: 'past' }), 'el fuva stanchels.'],
    ['he has been — staus', clause(HE, 'BE', { verbPhrase: { tense: 'past', aspect: 'resultative' }, complements: { predicative: { phrase: np('TIRED') } } }), 'el fuva staus stanchels.'],
    ['he went out — the -s on the participle of a multiword verb', clause(HE, 'GO_OUT', { verbPhrase: { tense: 'past' } }), 'el ei ius ora.'],
    ['she went out — ida ora', clause(SHE, 'GO_OUT', { verbPhrase: { tense: 'past' } }), 'ella ei ida ora.'],
    ['he did not go out', clause(HE, 'GO_OUT', { verbPhrase: { tense: 'past', negative: true } }), 'el ei buca ius ora.'],
    ['he stopped — a fused se- verb takes esser', clause(HE, 'STOP_ONESELF', { verbPhrase: { tense: 'past' } }), 'el ei sefermaus.'],
    ['she stopped', clause(SHE, 'STOP_ONESELF', { verbPhrase: { tense: 'past' } }), 'ella ei sefermada.'],
    ['she ate — haver never agrees', clause(SHE, 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'ella ha magliau la miur.'],
    ['he wanted to go — a state verb\'s past is its imperfect', clause(HE, 'GO', { verbPhrase: { modals: ['WILL'], tense: 'past' } }), 'el vuleva ir.'],
    ['he had the mouse', clause(HE, 'HAVE', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'el haveva la miur.'],
    ['the cat had eaten the mouse — the pluperfect', eats({ tense: 'past', aspect: 'resultative' }), 'il gat haveva magliau la miur.'],
    ['he had gone', clause(HE, 'GO', { verbPhrase: { tense: 'past', aspect: 'resultative' } }), 'el fuva ius.'],
    ['I knew that the cat was eating the mouse — the sequence of tenses', clause(I, 'KNOW', { contentObject: eats() as never, verbPhrase: { tense: 'past' } }), "jeu savevel ch'il gat magliava la miur."],
    ['the mouse is eaten — the passive on vegnir', eats({ voice: 'passive' }), 'la miur vegn magliada dil gat.'],
    ['the mouse was eaten', eats({ voice: 'passive', tense: 'past' }), 'la miur ei vegnida magliada dil gat.'],
    ['the dog is eaten — the passive participle predicative too', clause(CAT, 'EAT', { directObject: DOG, verbPhrase: { voice: 'passive' } }), 'il tgaun vegn magliaus dil gat.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  test.each(PERSONS)('a BE and a HAVE verb in every person: %s', (pn, who) => {
    const cells: Record<string, [string, string]> = {
      '1sg': ['jeu sun ius.', 'jeu hai magliau.'],
      '2sg': ['ti eis ius.', 'ti has magliau.'],
      '3sg': ['el ei ius.', 'el ha magliau.'],
      '1pl': ['nus essan i.', 'nus havein magliau.'],
      '2pl': ['vus essas i.', 'vus haveis magliau.'],
      '3pl': ['els ein i.', 'els han magliau.'],
    };
    expect(sv(clause(who, 'GO', { verbPhrase: { tense: 'past' } }))).toBe(cells[pn]![0]);
    expect(sv(clause(who, 'EAT', { verbPhrase: { tense: 'past' } }))).toBe(cells[pn]![1]);
  });

  test('the participle agrees in all four cells after esser, the masculine singular with -s', () => {
    const returned = (who: NounPhrase) => sv(clause(who, 'RETURN', { verbPhrase: { tense: 'past' } }));
    expect(returned(HE)).toBe('el ei turnaus.');
    expect(returned(SHE)).toBe('ella ei turnada.');
    expect(returned(THEY)).toBe('els ein turnai.');
    expect(returned(THEY_FEM)).toBe('ellas ein turnadas.');
  });

  // P04 D6: one past construction, so the neutral past and the present resultative are one sentence.
  test('the past and the resultative render alike', () => {
    expect(sv(eats({ tense: 'past' }))).toBe(sv(eats({ aspect: 'resultative' })));
    expect(sv(clause(SHE, 'GO', { verbPhrase: { tense: 'past' } }))).toBe(sv(clause(SHE, 'GO', { verbPhrase: { aspect: 'resultative' } })));
  });

  // Every non-stative esser verb says *el ei …s* — the predicative -s on its participle.
  test('every verb whose Sursilvan selects esser says ei and the participle in -s in the past', async () => {
    const { RM_SURSILV } = await import('../../../backend/src/concepts/rm-sursilv/index.js');
    const beVerbs = Object.entries(RM_SURSILV).filter(([id, f]) => f['aux'] === 'be' && f['participle'] && f['3sg_present'] && !f['copula']
      && lookupLexicalEntry(id, 'rm-sursilv')?.forms['stative'] !== '1');
    expect(beVerbs.length).toBeGreaterThan(10);
    for (const [id] of beVerbs) expect(sv(clause(HE, id, { verbPhrase: { tense: 'past' } }))).toMatch(/^el ei \S+s( |\.)/);
  });
});

describe('P04-E13: the future — vegnir a + infinitive', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat will eat the mouse', eats({ tense: 'future' }), 'il gat vegn a magliar la miur.'],
    ['the cat will not eat the mouse — buca after vegn', eats({ tense: 'future', negative: true }), 'il gat vegn buca a magliar la miur.'],
    ['the cat will be tired — ad before a vowel', is(CAT, 'TIRED', { tense: 'future' }), 'il gat vegn ad esser stanchels.'],
    ['she will go', clause(SHE, 'GO', { verbPhrase: { tense: 'future' } }), 'ella vegn ad ir.'],
    ['he will have to go — a modal under the future', clause(HE, 'GO', { verbPhrase: { modals: ['MUST'], tense: 'future' } }), 'el vegn a stuer ir.'],
    ['he will not have to go', clause(HE, 'GO', { verbPhrase: { modals: [{ verb: 'MUST', negative: true }], tense: 'future' } as Partial<VerbPhrase> }), 'el vegn buca a stuer ir.'],
    ['the cat will eat when the dog runs — the present under a temporal conjunction', clause(CAT, 'EAT', { verbPhrase: { tense: 'future' }, adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN', { verbPhrase: { tense: 'future' } }) as never } }), "il gat vegn a magliar cura ch'il tgaun cuora."],
    ['the cat will have eaten — the future perfect', eats({ tense: 'future', aspect: 'resultative' }), 'il gat vegn ad haver magliau la miur.'],
    ['he will have gone', clause(HE, 'GO', { verbPhrase: { tense: 'future', aspect: 'resultative' } }), 'el vegn ad esser ius.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  test.each(PERSONS)('every person: %s', (pn, who) => {
    const aux: Record<string, string> = { '1sg': 'jeu vegnel', '2sg': 'ti vegns', '3sg': 'el vegn', '1pl': 'nus vegnin', '2pl': 'vus vegnis', '3pl': 'els vegnan' };
    expect(sv(clause(who, 'EAT', { verbPhrase: { tense: 'future' } }))).toBe(`${aux[pn]} a magliar.`);
  });
});

describe('P04-E14: aspect, modals, degree and BECOME', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat is eating — esser vid', eats({ aspect: 'progressive' }), 'il gat ei vid magliar la miur.'],
    ['the cat is about to eat', eats({ aspect: 'prospective' }), 'il gat ei sin il punct da magliar la miur.'],
    ['the cat is not eating', eats({ aspect: 'progressive', negative: true }), 'il gat ei buca vid magliar la miur.'],
    ['the cat was eating — the imperfect of esser', eats({ aspect: 'progressive', tense: 'past' }), 'il gat fuva vid magliar la miur.'],
    ['the cat will be eating', eats({ aspect: 'progressive', tense: 'future' }), 'il gat vegn ad esser vid magliar la miur.'],
    ['he can swim — CAN is saver', clause(HE, 'GO', { verbPhrase: { modals: ['CAN'] } }), 'el sa ir.'],
    ['he may go — MAY is astgar', clause(HE, 'GO', { verbPhrase: { modals: ['MAY'] } }), 'el astga ir.'],
    ['he might go — MIGHT is puder', clause(HE, 'GO', { verbPhrase: { modals: ['MIGHT'] } }), 'el pudess ir.'],
    ['he must go — stuer', clause(HE, 'GO', { verbPhrase: { modals: ['MUST'] } }), 'el sto ir.'],
    ['he should go — stuer\'s conditional', clause(HE, 'GO', { verbPhrase: { modals: ['SHOULD'] } }), 'el stuess ir.'],
    ['I want to go — vi', clause(I, 'GO', { verbPhrase: { modals: ['WILL'] } }), 'jeu vi ir.'],
    ['we want to go — lein', clause(WE, 'GO', { verbPhrase: { modals: ['WILL'] } }), 'nus lein ir.'],
    ['he wants to be able to go — a two-modal chain', clause(HE, 'GO', { verbPhrase: { modals: ['WILL', 'CAN'] } }), 'el vul saver ir.'],
    ['he must be eating — a modal over an aspect', clause(HE, 'EAT', { verbPhrase: { modals: ['MUST'], aspect: 'progressive' } }), 'el sto esser vid magliar.'],
    ['he must have gone', clause(HE, 'GO', { verbPhrase: { modals: ['MUST'], aspect: 'resultative' } }), 'el sto esser ius.'],
    ['the cat becomes big — daventar, predicative', clause(CAT, 'BECOME', { complements: { predicative: { phrase: np('BIG') } } }), 'il gat daventa gronds.'],
    ['the (female) cat became big', clause(SHE_CAT, 'BECOME', { complements: { predicative: { phrase: np('BIG') } }, verbPhrase: { tense: 'past' } }), 'la gatta ei daventada gronda.'],
    ['more', catIs('BIG', 'more'), 'il gat ei pli gronds.'],
    ['most', catIs('BIG', 'most'), 'il gat ei il pli grond.'],
    ['less', catIs('BIG', 'less'), 'il gat ei meins gronds.'],
    ['as … as', catIs('BIG', 'equally', DOG), 'il gat ei aschi gronds sco il tgaun.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  // D4: the column stores no suppletive comparative, so GOOD compares periphrastically. Sursilvan is
  // expected to say *meglier* (verify at E19); a lexeme key would carry it.
  test.fails('better — the suppletive meglier', () => {
    expect(sv(catIs('GOOD', 'more'))).toBe('il gat ei meglier.');
  });
});

describe('P04-E15: complements, relatives, coordination', () => {
  const runs = (complements: PhrasePlan['complements']): PhrasePlan => clause(CAT, 'RUN', { complements });
  test.each<[string, PhrasePlan, string]>([
    ['locative — en', runs({ locative: { phrase: np('HOUSE') } }), 'il gat cuora en la casa.'],
    ['under — sut', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'under' }] } }), 'il gat cuora sut la casa.'],
    ['behind — davos', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'behind' }] } }), 'il gat cuora davos la casa.'],
    ['in front of — davon', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'in_front_of' }] } }), 'il gat cuora davon la casa.'],
    ['around — entuorn', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'around' }] } }), 'il gat cuora entuorn la casa.'],
    ['direction to a place — a', clause(CAT, 'GO', { complements: { direction: { phrase: np('HOUSE') } } }), 'il gat va a la casa.'],
    ['direction to a person — tier', clause(CAT, 'GO', { complements: { direction: { phrase: np('WOMAN') } } }), 'il gat va tier la dunna.'],
    ['direction home — a casa', clause(CAT, 'GO', { complements: { direction: { phrase: np('HOME') } } }), 'il gat va a casa.'],
    ['source — da', clause(CAT, 'COME', { complements: { source: { phrase: np('HOUSE') } } }), 'il gat vegn da la casa.'],
    ['source under a running verb — naven da', runs({ source: { phrase: np('HOUSE') } }), 'il gat cuora naven da la casa.'],
    ['route — tras', runs({ route: { phrase: np('HOUSE') } }), 'il gat cuora tras la casa.'],
    ['cause — per mor da', runs({ cause: { phrase: DOG } }), 'il gat cuora per mor dil tgaun.'],
    ['cause, positive — grazia a', runs({ cause: { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'positive' }] } }), 'il gat cuora grazia al tgaun.'],
    ['cause, negative — per cuolpa da', runs({ cause: { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'negative' }] } }), 'il gat cuora per cuolpa dil tgaun.'],
    ['comitative — cun', runs({ comitative: { phrase: DOG } }), 'il gat cuora cun il tgaun.'],
    ['comitative pronoun — cun el', runs({ comitative: { phrase: HE } }), 'il gat cuora cun el.'],
    ['comitative pronoun — cun mei', runs({ comitative: { phrase: I } }), 'il gat cuora cun mei.'],
    ['terminus pronoun — ad el', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: HE } } }), 'jeu dun il cudisch ad el.'],
    ['the passive agent — da', eats({ voice: 'passive' }), 'la miur vegn magliada dil gat.'],
    ['direction to a land — en', clause(CAT, 'GO', { complements: { direction: { phrase: np('EUROPE') } } }), 'il gat va en Europa.'],
    ['purpose — per', runs({ purpose: { phrase: np('MAN') } }), 'il gat cuora per igl um.'],
    ['topic — da', clause(I, 'SPEAK', { complements: { topic: { phrase: CAT } } }), 'jeu plidel dil gat.'],
    ['opponent — encunter', runs({ opponent: { phrase: DOG } }), 'il gat cuora encunter il tgaun.'],
    ['temporal — avon', runs({ temporal: { phrase: np('DAY'), specifiers: [{ kind: 'temporal', value: 'before' }] } }), 'il gat cuora avon il di.'],
    ['a verb\'s own preposition — sin', clause(I, 'CLICK', { directObject: np('BUTTON') }), 'jeu clicchel sin il buttun.'],
    ['a verb\'s preposition with a pronoun — da ella', clause(CAT, 'DEPEND', { directObject: SHE }), 'il gat dependa da ella.'],
    // Relatives (E15 D2).
    ['subject relative — che', subject(np('CAT', { relative: { headRole: 'subject', verbPhrase: { verb: 'EAT' }, directObject: MOUSE } })), 'il gat che maglia la miur.'],
    ['object relative — ch\' before a vowel', subject(np('MOUSE', { relative: { headRole: 'directObject', subject: CAT, verbPhrase: { verb: 'EAT' } } })), "la miur ch'il gat maglia."],
    ['object relative with a pronoun subject — kept', subject(np('BOOK', { relative: { headRole: 'directObject', subject: I, verbPhrase: { verb: 'READ' } } })), 'il cudisch che jeu legel.'],
    ['prepositional relative — sut la quala', subject(np('HOUSE', { relative: { headRole: 'locative', subject: CAT, verbPhrase: { verb: 'EAT' }, headSpecifiers: [{ kind: 'path', value: 'under' }] } } as Partial<NounPhrase>)), 'la casa sut la quala il gat maglia.'],
    ['prepositional relative — cun il qual', subject(np('DOG', { relative: { headRole: 'comitative', subject: CAT, verbPhrase: { verb: 'RUN' } } } as Partial<NounPhrase>)), 'il tgaun cun il qual il gat cuora.'],
    ['place relative — nua', subject(np('PLACE', { relative: { headRole: 'locative', subject: CAT, verbPhrase: { verb: 'EAT' } } } as Partial<NounPhrase>)), 'il liug nua il gat maglia.'],
    ['terminus relative — al qual', subject(np('MAN', { relative: { headRole: 'terminus', subject: np('WOMAN'), verbPhrase: { verb: 'GIVE' }, directObject: np('BOOK') } } as Partial<NounPhrase>)), 'igl um al qual la dunna dat il cudisch.'],
    ['possessor relative — the possessed first, then dil qual', subject(np('BOY', { relative: { headRole: 'possessor', subject: CAT, verbPhrase: { verb: 'EAT' } } })), 'il buob il gat dil qual maglia.'],
    // Coordination (E15 D3).
    ['and — ed before the article il too (verify)', subject({ conjuncts: [CAT, DOG], conjunction: 'and' }), 'il gat ed il tgaun.'],
    ['and before a consonant — e', subject({ conjuncts: [CAT, np('HOUSE')], conjunction: 'and' }), 'il gat e la casa.'],
    ['and before a vowel — ed', subject({ conjuncts: [CAT, np('MAN')], conjunction: 'and' }), 'il gat ed igl um.'],
    ['or — ni', subject({ conjuncts: [CAT, DOG], conjunction: 'or' }), 'il gat ni il tgaun.'],
    ['but — mo', { ...clause(CAT, 'RUN'), coordination: { conjunction: 'but', clause: clause(DOG, 'EAT') } }, 'il gat cuora, mo il tgaun maglia.'],
    ['however — denton, a clause of its own', { ...clause(CAT, 'RUN'), coordination: { conjunction: 'however', clause: clause(DOG, 'EAT') } }, 'il gat cuora; denton, il tgaun maglia.'],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  test.todo('the process-level instrumental (P04-E15 D1): what Sursilvan writes for "by choosing a word"');
});

describe('P04-E16: moods — conditional, imperative, infinitive; no inversion', () => {
  test.each<[string, PhrasePlan, string]>([
    ['if the dog ran, the cat would eat — sche, the conditional in both clauses', { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') }, "sch'il tgaun curress, il gat magliass."],
    ['if the cat were tired — fuss', { ...clause(DOG, 'RUN'), condition: is(CAT, 'TIRED') }, "sch'il gat fuss stanchels, il tgaun curress."],
    ['if the dog did not run', { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN', { verbPhrase: { negative: true } }) }, "sch'il tgaun curress buca, il gat magliass."],
    ['if the dog had run, the cat would have eaten', { ...clause(CAT, 'EAT', { verbPhrase: { aspect: 'resultative' } }), condition: clause(DOG, 'RUN', { verbPhrase: { aspect: 'resultative' } }) }, "sch'il tgaun havess curriu, il gat havess magliau."],
    ['eat! (2sg)', command(YOU, 'EAT', {}, { directObject: MOUSE }), 'maglia la miur.'],
    ['let\'s eat! (1pl)', command(WE, 'EAT', {}, { directObject: MOUSE }), 'magliein la miur.'],
    ['eat! (2pl)', command(YOU_ALL, 'EAT', {}, { directObject: MOUSE }), 'magliei la miur.'],
    ['don\'t eat! (2sg) — buca after the command', command(YOU, 'EAT', { negative: true }, { directObject: MOUSE }), 'maglia buca la miur.'],
    ['let\'s not eat! (1pl)', command(WE, 'EAT', { negative: true }), 'magliein buca.'],
    ['don\'t eat! (2pl)', command(YOU_ALL, 'EAT', { negative: true }), 'magliei buca.'],
    ['go! — ir', command(YOU, 'GO'), 'va.'],
    ['let\'s go! — mein', command(WE, 'GO'), 'mein.'],
    ['be careful! — esser, predicative', command(YOU, 'BE', {}, { complements: { predicative: { phrase: np('CAREFUL') } } }), 'sei attents.'],
    ['go out! — don\'t go out!', command(YOU, 'GO_OUT', { negative: true }), 'va buca ora.'],
    ['stop! — a fused se- verb', command(YOU, 'STOP_ONESELF'), 'seferma.'],
    ['to eat the mouse — the citation', { ...clause(ONE, 'EAT', { directObject: MOUSE }), infinitive: true }, 'magliar la miur.'],
    ['not to eat — buca before the infinitive', { ...clause(ONE, 'EAT', { verbPhrase: { negative: true } }), infinitive: true }, 'buca magliar.'],
    ['to be eaten — the passive citation', { ...clause(CAT, 'EAT', { directObject: MOUSE, verbPhrase: { voice: 'passive' } }), infinitive: true }, 'vegnir magliada dil gat.'],
    ['I want to eat', clause(I, 'EAT', { verbPhrase: { modals: ['WILL'] } }), 'jeu vi magliar.'],
    ['the cat begins to eat — a', clause(CAT, 'BEGIN', { infinitiveComplement: clause(CAT, 'EAT') as never }), 'il gat cumenza a magliar.'],
    ['I know that the cat eats — ch\'', clause(I, 'KNOW', { contentObject: eats() as never }), "jeu sai ch'il gat maglia la miur."],
    ['I believe that the cat is tired — the conjunctiv', clause(I, 'BELIEVE', { contentObject: is(CAT, 'TIRED') as never }), "jeu creiel ch'il gat seigi stanchels."],
    ['when the dog runs, the cat eats', clause(CAT, 'EAT', { adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN') as never } }), "il gat maglia cura ch'il tgaun cuora."],
    ['because the dog runs — perquei che', clause(CAT, 'EAT', { adverbialClause: { conjunction: 'because', clause: clause(DOG, 'RUN') as never } }), "il gat maglia perquei ch'il tgaun cuora."],
  ])('%s', (_label, plan, expected) => {
    expect(sv(plan)).toBe(expected);
  });

  test('a UI control is the infinitive (E16 D2)', () => {
    expect(sv(command(YOU, 'SAVE', {}, { imperativeRegister: 'instruction' } as Partial<PhrasePlan>))).toBe('memorisar.');
  });

  // D9: after a fronted *sche*-clause Sursilvan puts the verb before the subject (verb second, verify);
  // the engine keeps subject–verb order until the reviewer rules.
  test.fails('if the dog ran, the cat would eat — inverted (D9)', () => {
    expect(sv({ ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') })).toBe("sch'il tgaun curress, magliass il gat.");
  });

  test.todo('the negative imperative (P04-E16 D2): "maglia buca!" as rendered, or an infinitive "buca magliar!"');
});
