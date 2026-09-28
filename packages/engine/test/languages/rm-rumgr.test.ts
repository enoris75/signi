import { describe, expect, test } from 'vitest';
import type { Degree, NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, translateAll } from '../harness.js';
import { lookupLexicalEntry } from '../../../backend/src/lexicon.js';

// Rumantsch Grischun (P04): the language's own suite while it is a preview language (P04 §4). The
// exhaustive tables elsewhere render the ready languages only; every line here is the engine's output,
// pinned after checking it against `docs/features/P-planning/P04-romansh/style-rm-rumgr.md`, and every
// row is *(verify)* until the review (P04-E19). A known gap is a `test.fails` row that states what RG
// is expected to write; a question no source here settles is a `test.todo` naming it.

const rg = (plan: PhrasePlan): string => say(plan, 'rm-rumgr');

const I = np('FIRST_PERSON');
const YOU = np('SECOND_PERSON');
const HE = np('THIRD_PERSON', { gender: 'masc' });
const SHE = np('THIRD_PERSON', { gender: 'fem' });
const WE = np('FIRST_PERSON', { number: 'plural' });
const YOU_ALL = np('SECOND_PERSON', { number: 'plural' });
const THEY = np('THIRD_PERSON', { gender: 'masc', number: 'plural' });
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

// The words that are Italian and never RG (P04-E7 D2), and the idioms' markers from the style sheet's
// guard list (Sursilvan *ei, buca, jeu, enzatgei, nuot, tgaun*; Vallader *eu, hoz, hom, uossa, alch,
// nüglia, adüna, fich*). Vallader *es* is left out: it is RG's 2sg of *esser* too.
const LEAKS = /(^|[\s'])(gatto|gatti|cane|topo|gli|lo|della|dello|delle|degli|più|non|sono|nessun|nessuna|questo|quello|anche|molto|essere|avere|mangiato|ei|buca|jeu|enzatgei|nuot|tgaun|eu|hoz|hom|uossa|alch|nüglia|adüna|fich)(?=[\s.,?!]|$)/;

describe('P04-E1: a preview row', () => {
  test('renders after the Swiss German row, the first of the three Romansh rows', () => {
    expect(translateAll(clause(CAT, 'RUN')).map((t) => t.language)).toEqual(['en', 'it', 'fr', 'de', 'es', 'ja', 'pt', 'gsw', 'rm-rumgr', 'rm-sursilv', 'rm-vallader', 'ca', 'pl']);
  });
});

describe('P04-E7: the noun phrase', () => {
  test.each<[string, PhrasePlan, string]>([
    // The ticket's table.
    ['the man — l\' before a vowel, masculine', subject(np('MAN')), "l'um."],
    ['the water — l\' before a vowel, feminine', subject(np('WATER')), "l'aua."],
    ['the cats', subject(np('CAT', { number: 'plural' })), 'ils giats.'],
    ['a big dog — BIG precedes', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['BIG'] })), 'in grond chaun.'],
    ['to the man — a stays apart before l\'', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('MAN') } } }), "jau dun il cudesch a l'um."],
    ['of the men — da + ils', subject(np('HOUSE', { possessor: np('MAN', { number: 'plural' }) })), 'la chasa dals umens.'],
    ['my cat — no article', subject(np('CAT', { possessor: MY })), 'mes giat.'],
    ['my house', subject(np('HOUSE', { possessor: MY })), 'mia chasa.'],
    ['my cats', subject(np('CAT', { number: 'plural', possessor: MY })), 'mes giats.'],
    ['my houses', subject(np('HOUSE', { number: 'plural', possessor: MY })), 'mias chasas.'],
    ['more beautiful', catIs('BEAUTIFUL', 'more'), 'il giat è pli bel.'],
    // Articles.
    ['the house', subject(np('HOUSE')), 'la chasa.'],
    ['the houses', subject(np('HOUSE', { number: 'plural' })), 'las chasas.'],
    ['the men — the plural never elides', subject(np('MAN', { number: 'plural' })), 'ils umens.'],
    ['a cat', subject(np('CAT', { definiteness: 'indefinite' })), 'in giat.'],
    ['a house', subject(np('HOUSE', { definiteness: 'indefinite' })), 'ina chasa.'],
    ['cats — the indefinite plural is bare', subject(np('CAT', { number: 'plural', definiteness: 'indefinite' })), 'giats.'],
    ['the old man — l\' before a prenominal adjective', subject(np('MAN', { adjectives: ['OTHER'] })), "l'auter um."],
    // Contractions: a and da with the masculine article only; en and sin stay apart.
    ['to the dog — al', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: DOG } } }), 'jau dun il cudesch al chaun.'],
    ['to the dogs — als', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG', { number: 'plural' }) } } }), 'jau dun il cudesch als chauns.'],
    ['to the woman — a la', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('WOMAN') } } }), 'jau dun il cudesch a la dunna.'],
    ['of the dog — dal', subject(np('HOUSE', { possessor: DOG })), 'la chasa dal chaun.'],
    ['of the woman — da la', subject(np('HOUSE', { possessor: np('WOMAN') })), 'la chasa da la dunna.'],
    ['in the house — en la', clause(CAT, 'EAT', { complements: { locative: { phrase: np('HOUSE') } } }), 'il giat mangia en la chasa.'],
    ['in the book — en il stays apart (verify)', clause(CAT, 'EAT', { complements: { locative: { phrase: np('BOOK') } } }), 'il giat mangia en il cudesch.'],
    ['on the ground — sin il stays apart', clause(CAT, 'EAT', { complements: { locative: { phrase: np('GROUND'), specifiers: [{ kind: 'path', value: 'on' }] } } }), 'il giat mangia sin il terren.'],
    // Adjectives: agreement from the stored forms, position from `position`.
    ['a new dog — NEW follows (unlike Italian)', subject(np('DOG', { definiteness: 'indefinite', adjectives: ['NEW'] })), 'in chaun nov.'],
    ['a bad cat — BAD follows', subject(np('CAT', { definiteness: 'indefinite', adjectives: ['BAD'] })), 'in giat nausch.'],
    ['the old woman — vegl, veglia', subject(np('WOMAN', { adjectives: ['OLD'] })), 'la veglia dunna.'],
    ['the small houses — pitschen, pitschnas', subject(np('HOUSE', { number: 'plural', adjectives: ['SMALL'] })), 'las pitschnas chasas.'],
    ['a high house — ault, auta', subject(np('HOUSE', { definiteness: 'indefinite', adjectives: ['HIGH'] })), 'ina chasa auta.'],
    ['the black cats', subject(np('CAT', { number: 'plural', adjectives: ['BLACK'] })), 'ils giats nairs.'],
    ['the other big cat — a determiner-like one leaves the slot free', subject(np('CAT', { adjectives: ['OTHER', 'BIG'] })), "l'auter grond giat."],
    // Determiners (P04 §2.1).
    ['this dog', subject(np('DOG', { definiteness: 'this' })), 'quest chaun.'],
    ['this house', subject(np('HOUSE', { definiteness: 'this' })), 'questa chasa.'],
    ['these dogs', subject(np('DOG', { number: 'plural', definiteness: 'this' })), 'quests chauns.'],
    ['that house', subject(np('HOUSE', { definiteness: 'that' })), 'quella chasa.'],
    ['those dogs', subject(np('DOG', { number: 'plural', definiteness: 'that' })), 'quels chauns.'],
    ['no dog', subject(np('DOG', { definiteness: 'no' })), 'nagin chaun.'],
    ['no house', subject(np('HOUSE', { definiteness: 'no' })), 'nagina chasa.'],
    ['some dogs', subject(np('DOG', { number: 'plural', definiteness: 'some' })), 'insaquants chauns.'],
    ['many houses', subject(np('HOUSE', { number: 'plural', definiteness: 'many' })), 'bleras chasas.'],
    ['few dogs', subject(np('DOG', { number: 'plural', definiteness: 'few' })), 'paucs chauns.'],
    ['all the dogs', subject(np('DOG', { number: 'plural', definiteness: 'all' })), 'tuts ils chauns.'],
    ['each dog', subject(np('DOG', { definiteness: 'each' })), 'mintga chaun.'],
    ['three dogs', subject(np('DOG', { number: 'plural', numeral: 3, definiteness: 'bare' } as Partial<NounPhrase>)), 'trais chauns.'],
    ['two houses — dus / duas agree', subject(np('HOUSE', { number: 'plural', numeral: 2, definiteness: 'bare' } as Partial<NounPhrase>)), 'duas chasas.'],
    // Degree (P04 §2.1).
    ['bigger than the dog', catIs('BIG', 'more', DOG), "il giat è pli grond ch'il chaun."],
    ['the biggest', catIs('BIG', 'most'), 'il giat è il pli grond.'],
    ['less big', catIs('BIG', 'less'), 'il giat è main grond.'],
    ['as big as the dog', catIs('BIG', 'equally', DOG), 'il giat è uschè grond sco il chaun.'],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });

  // E7 D2: no Italian word survives the fork, and no idiom's marker leaks into the RG row.
  test('says no word that is Italian, Sursilvan or Vallader only', () => {
    const plans: PhrasePlan[] = [
      subject(np('MAN')), subject(np('CAT', { number: 'plural', adjectives: ['BIG', 'BLACK'] })), subject(np('DOG', { definiteness: 'this' })),
      subject(np('DOG', { definiteness: 'no' })), subject(np('HOUSE', { possessor: np('MAN', { number: 'plural' }) })),
      subject(np('CAT', { possessor: MY })), catIs('BIG', 'more', DOG), catIs('BIG', 'most'),
      eats(), eats({ negative: true }), eats({ tense: 'past' }), eats({ tense: 'future' }), eats({ aspect: 'progressive' }),
      eats({ aspect: 'prospective' }), eats({ aspect: 'resultative', negative: true }), clause(ONE, 'EAT', { directObject: MOUSE }),
      clause(HE, 'GO', { verbPhrase: { modals: ['MUST'] } }), clause(I, 'KNOW', { contentObject: eats({ tense: 'past' }) as never }),
      clause(I, 'BE', { complements: { predicative: { phrase: np('TIRED') } }, verbPhrase: { negative: true } }),
      command(YOU, 'EAT', { negative: true }), { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') },
      clause(CAT, 'EAT', { directObject: MOUSE, verbPhrase: { voice: 'passive' } }),
    ];
    for (const plan of plans) expect(rg(plan)).not.toMatch(LEAKS);
  });
});

describe('P04-E7 D3: an object pronoun is the tonic form after the verb', () => {
  test.each<[string, PhrasePlan, string]>([
    ['I see him', clause(I, 'SEE', { directObject: HE }), 'jau ves el.'],
    ['I see her', clause(I, 'SEE', { directObject: SHE }), 'jau ves ella.'],
    ['the cat sees me', clause(CAT, 'SEE', { directObject: I }), 'il giat vesa mai.'],
    ['the cat sees the dog and me', clause(CAT, 'SEE', { directObject: { conjuncts: [DOG, I], conjunction: 'and' } }), 'il giat vesa il chaun e mai.'],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });

  // What RG writes: the clitic before the finite verb (style sheet: *ma, ta, al/la, ans, as, als/las*).
  test.fails.each<[string, PhrasePlan, string]>([
    ['I see him — the clitic al', clause(I, 'SEE', { directObject: HE }), 'jau al ves.'],
    ['the cat sees me — the clitic ma', clause(CAT, 'SEE', { directObject: I }), 'il giat ma vesa.'],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });
});

describe('P04-E10: the clause core — subjects kept, ins, the present, the copula', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat eats the mouse', eats(), 'il giat mangia la mieur.'],
    ['we eat — the pronoun subject is spoken', clause(WE, 'EAT'), 'nus mangiain.'],
    ['one eats the mouse — ins', clause(ONE, 'EAT', { directObject: MOUSE }), 'ins mangia la mieur.'],
    ['I am tired', clause(I, 'BE', { complements: { predicative: { phrase: np('TIRED') } } }), 'jau sun stanchel.'],
    ['he is tired — è', clause(HE, 'BE', { complements: { predicative: { phrase: np('TIRED') } } }), 'el è stanchel.'],
    ['she is tired — the predicate agrees', clause(SHE, 'BE', { complements: { predicative: { phrase: np('TIRED') } } }), 'ella è stancla.'],
    ['they are tired', clause(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }), 'BE', { complements: { predicative: { phrase: np('TIRED') } } }), 'ellas èn stanclas.'],
    ['one is tired — ins agrees in the masculine singular', clause(ONE, 'BE', { complements: { predicative: { phrase: np('TIRED') } } }), 'ins è stanchel.'],
    ['one sits down — ins takes sa', clause(ONE, 'SIT_DOWN'), 'ins sa tschenta.'],
    ['I sit down — the reflexive clitic before the verb', clause(I, 'SIT_DOWN'), 'jau ma tschent.'],
    ['what does the cat eat?', { ...clause(CAT, 'EAT'), questionRole: 'directObject' }, 'tge mangia il giat?'],
    ['what do you eat? — the pronoun follows the verb', { ...clause(YOU, 'EAT'), questionRole: 'directObject' }, 'tge mangias ti?'],
    ['who eats the mouse?', { ...eats(), questionRole: 'subject', questionAnimate: true }, 'tgi mangia la mieur?'],
    ['there is a cat — i dat', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE'), existential: true }, 'i dat in giat.'],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });

  test.each(PERSONS)('every person of esser, avair and mangiar: %s', (pn, who) => {
    const cells: Record<string, [string, string, string]> = {
      '1sg': ['jau sun stanchel.', 'jau hai la mieur.', 'jau mangel la mieur.'],
      '2sg': ['ti es stanchel.', 'ti has la mieur.', 'ti mangias la mieur.'],
      '3sg': ['el è stanchel.', 'el ha la mieur.', 'el mangia la mieur.'],
      '1pl': ['nus essan stanchels.', 'nus avain la mieur.', 'nus mangiain la mieur.'],
      '2pl': ['vus essas stanchels.', 'vus avais la mieur.', 'vus mangiais la mieur.'],
      '3pl': ['els èn stanchels.', 'els han la mieur.', 'els mangian la mieur.'],
    };
    const [be, have, eat] = cells[pn]!;
    expect(rg(clause(who, 'BE', { complements: { predicative: { phrase: np('TIRED') } } }))).toBe(be);
    expect(rg(clause(who, 'HAVE', { directObject: MOUSE }))).toBe(have);
    expect(rg(clause(who, 'EAT', { directObject: MOUSE }))).toBe(eat);
  });

  // E10 D3: RG inverts subject and verb in a yes/no question (verify); the engine keeps the
  // declarative order until the review rules.
  test.fails('does the cat eat the mouse? — inverted', () => {
    expect(rg({ ...eats(), interrogative: true })).toBe('mangia il giat la mieur?');
  });
});

describe('P04-E11: negation — na … betg', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat does not eat the mouse', eats({ negative: true }), 'il giat na mangia betg la mieur.'],
    ['the cat is not tired — n\' before a vowel', clause(CAT, 'BE', { complements: { predicative: { phrase: np('TIRED') } }, verbPhrase: { negative: true } }), "il giat n'è betg stanchel."],
    ['the cat never eats — mai replaces betg', eats({ modifier: 'NEVER' }), 'il giat na mangia mai la mieur.'],
    ['the cat no longer eats — betg pli', eats({ modifier: 'NO_LONGER' }), 'il giat na mangia betg pli la mieur.'],
    ['the cat has not eaten — n\' before ha', eats({ negative: true, tense: 'past' }), "il giat n'ha betg mangià la mieur."],
    ['the cat has not eaten yet — anc betg', eats({ negative: true, tense: 'past', modifier: 'ALREADY' }), "il giat n'ha anc betg mangià la mieur."],
    ['the cat has never eaten', eats({ tense: 'past', modifier: 'NEVER' }), "il giat n'ha mai mangià la mieur."],
    ['the cat must not run — the finite modal negated', clause(CAT, 'RUN', { verbPhrase: { modals: [{ verb: 'MUST', negative: true }] } as Partial<VerbPhrase> }), 'il giat na sto betg currer.'],
    ['the cat wants not to run — the governed infinitive takes betg alone', clause(CAT, 'RUN', { verbPhrase: { modals: ['WILL'], negative: true } }), 'il giat vul betg currer.'],
    ['the cat never wants to run — mai on the finite modal', clause(CAT, 'RUN', { verbPhrase: { modals: [{ verb: 'WILL', modifier: 'NEVER' }] } as Partial<VerbPhrase> }), 'il giat na vul mai currer.'],
    ['the cat does not always eat — betg before the frequency adverb', eats({ negative: true, modifier: 'ALWAYS' }), 'il giat na mangia betg adina la mieur.'],
    ['the cat always eats', eats({ modifier: 'ALWAYS' }), 'il giat mangia adina la mieur.'],
    ['the cat has always eaten — the adverb after the auxiliary', eats({ modifier: 'ALWAYS', tense: 'past' }), 'il giat ha adina mangià la mieur.'],
    ['the cat does not eat the mouse either — gnanc', eats({ negative: true, modifier: 'ALSO' }), 'il giat na mangia gnanc la mieur.'],
    ['I do not sit down — na before the clitic', clause(I, 'SIT_DOWN', { verbPhrase: { negative: true } }), 'jau na ma tschent betg.'],
    // E11 D3: negative concord — na stays, betg gives way.
    ['I see no dog', clause(I, 'SEE', { directObject: np('DOG', { definiteness: 'no' }), verbPhrase: { negative: true } }), 'jau na ves nagin chaun.'],
    ['I see nothing', clause(I, 'SEE', { directObject: np('SOMETHING'), verbPhrase: { negative: true } }), 'jau na ves nagut.'],
    ['nobody knows — nagin na sa', clause(np('SOMEONE'), 'KNOW', { verbPhrase: { negative: true } }), 'nagin na sa.'],
    ['no cat eats', clause(np('CAT', { definiteness: 'no' }), 'EAT'), 'nagin giat na mangia.'],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });
});

describe('P04-E12: the compound past', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat ate the mouse', eats({ tense: 'past' }), 'il giat ha mangià la mieur.'],
    ['the (female) cat went — esser, agreeing', clause(SHE_CAT, 'GO', { verbPhrase: { tense: 'past' } }), 'la giatta è ida.'],
    ['the cats went', clause(np('CAT', { number: 'plural' }), 'GO', { verbPhrase: { tense: 'past' } }), 'ils giats èn ids.'],
    ['the (female) cats went', clause(np('CAT', { gender: 'fem', number: 'plural' }), 'GO', { verbPhrase: { tense: 'past' } }), 'las giattas èn idas.'],
    ['the cat came', clause(CAT, 'COME', { verbPhrase: { tense: 'past' } }), 'il giat è vegnì.'],
    ['she sat down — the clitic stays with the participle (verify)', clause(SHE, 'SIT_DOWN', { verbPhrase: { tense: 'past' } }), 'ella è sa tschentada.'],
    ['she ate — avair never agrees', clause(SHE, 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'ella ha mangià la mieur.'],
    // E12 D3: a state verb's past is the stored imperfect.
    ['he wanted to go', clause(HE, 'GO', { verbPhrase: { modals: ['WILL'], tense: 'past' } }), 'el vuleva ir.'],
    ['he had the mouse', clause(HE, 'HAVE', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'el aveva la mieur.'],
    ['the cat was tired', clause(CAT, 'BE', { complements: { predicative: { phrase: np('TIRED') } }, verbPhrase: { tense: 'past' } }), 'il giat era stanchel.'],
    // The pluperfect: the imperfect auxiliary.
    ['the cat had eaten the mouse', eats({ tense: 'past', aspect: 'resultative' }), 'il giat aveva mangià la mieur.'],
    ['she had gone', clause(SHE, 'GO', { verbPhrase: { tense: 'past', aspect: 'resultative' } }), 'ella era ida.'],
    // The sequence of tenses (E1 D1): a present under a past governor is the imperfect.
    ['I knew that the cat was eating the mouse', clause(I, 'KNOW', { contentObject: eats() as never, verbPhrase: { tense: 'past' } }), "jau saveva ch'il giat mangiava la mieur."],
    ['the mouse was eaten — the passive on vegnir', eats({ voice: 'passive', tense: 'past' }), 'la mieur è vegnida mangiada dal giat.'],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });

  test.each(PERSONS)('a BE and a HAVE verb in every person: %s', (pn, who) => {
    const cells: Record<string, [string, string]> = {
      '1sg': ['jau sun ì.', 'jau hai mangià.'],
      '2sg': ['ti es ì.', 'ti has mangià.'],
      '3sg': ['el è ì.', 'el ha mangià.'],
      '1pl': ['nus essan ids.', 'nus avain mangià.'],
      '2pl': ['vus essas ids.', 'vus avais mangià.'],
      '3pl': ['els èn ids.', 'els han mangià.'],
    };
    expect(rg(clause(who, 'GO', { verbPhrase: { tense: 'past' } }))).toBe(cells[pn]![0]);
    expect(rg(clause(who, 'EAT', { verbPhrase: { tense: 'past' } }))).toBe(cells[pn]![1]);
  });

  test('the participle agrees in all four cells after esser', () => {
    const went = (who: NounPhrase) => rg(clause(who, 'RETURN', { verbPhrase: { tense: 'past' } }));
    expect(went(HE)).toBe('el è turnà.');
    expect(went(SHE)).toBe('ella è turnada.');
    expect(went(THEY)).toBe('els èn turnads.');
    expect(went(np('THIRD_PERSON', { gender: 'fem', number: 'plural' }))).toBe('ellas èn turnadas.');
  });

  // P04 D6: one past construction, so the neutral past and the present resultative are one sentence.
  // Pinned as an equality, not filed as a bug.
  test('the past and the resultative render alike', () => {
    expect(rg(eats({ tense: 'past' }))).toBe(rg(eats({ aspect: 'resultative' })));
    expect(rg(clause(SHE, 'GO', { verbPhrase: { tense: 'past' } }))).toBe(rg(clause(SHE, 'GO', { verbPhrase: { aspect: 'resultative' } })));
  });

  // A state verb's past is its imperfect instead (E12 D3), so it is left out: *el steva*, *el pareva*.
  test('every verb whose RG selects esser says è in the past', async () => {
    const { RM_RUMGR } = await import('../../../backend/src/concepts/rm-rumgr/index.js');
    const beVerbs = Object.entries(RM_RUMGR).filter(([id, f]) => f['aux'] === 'be' && f['participle'] && f['3sg_present'] && !f['copula'] && !f['base']!.startsWith('sa ')
      && lookupLexicalEntry(id, 'rm-rumgr')?.forms['stative'] !== '1');
    expect(beVerbs.length).toBeGreaterThan(10);
    for (const [id] of beVerbs) expect(rg(clause(HE, id, { verbPhrase: { tense: 'past' } }))).toMatch(/^el è /);
  });
});

describe('P04-E13: the future — vegnir a + infinitive', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat will eat the mouse', eats({ tense: 'future' }), 'il giat vegn a mangiar la mieur.'],
    ['the cat will not eat the mouse', eats({ tense: 'future', negative: true }), 'il giat na vegn betg a mangiar la mieur.'],
    ['the cat will be tired — ad before a vowel', clause(CAT, 'BE', { complements: { predicative: { phrase: np('TIRED') } }, verbPhrase: { tense: 'future' } }), 'il giat vegn ad esser stanchel.'],
    ['she will go', clause(SHE, 'GO', { verbPhrase: { tense: 'future' } }), 'ella vegn ad ir.'],
    ['he will have to go — a modal under the future', clause(HE, 'GO', { verbPhrase: { modals: ['MUST'], tense: 'future' } }), 'el vegn a stuair ir.'],
    ['he will not have to go — the negation on vegnir', clause(HE, 'GO', { verbPhrase: { modals: [{ verb: 'MUST', negative: true }], tense: 'future' } as Partial<VerbPhrase> }), 'el na vegn betg a stuair ir.'],
    // FUTURE_AS_PRESENT_LANGUAGES (E13 D1): under a temporal conjunction the future is the present.
    ['the cat will eat when the dog runs', clause(CAT, 'EAT', { verbPhrase: { tense: 'future' }, adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN', { verbPhrase: { tense: 'future' } }) as never } }), "il giat vegn a mangiar cura ch'il chaun curra."],
    ['the cat will have eaten', eats({ tense: 'future', aspect: 'resultative' }), 'il giat vegn ad avair mangià la mieur.'],
    ['she will have gone', clause(SHE, 'GO', { verbPhrase: { tense: 'future', aspect: 'resultative' } }), 'ella vegn ad esser ida.'],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });

  test.each(PERSONS)('every person: %s', (pn, who) => {
    const aux: Record<string, string> = { '1sg': 'jau vegn', '2sg': 'ti vegns', '3sg': 'el vegn', '1pl': 'nus vegnin', '2pl': 'vus vegnis', '3pl': 'els vegnan' };
    expect(rg(clause(who, 'EAT', { verbPhrase: { tense: 'future' } }))).toBe(`${aux[pn]} a mangiar.`);
  });
});

describe('P04-E14: aspect, modals, degree and BECOME', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat is eating', eats({ aspect: 'progressive' }), 'il giat è vidlonder da mangiar la mieur.'],
    ['the cat is about to eat', eats({ aspect: 'prospective' }), 'il giat è sin il punct da mangiar la mieur.'],
    ['the cat is not eating', eats({ aspect: 'progressive', negative: true }), "il giat n'è betg vidlonder da mangiar la mieur."],
    ['the cat was eating — the imperfect of esser', eats({ aspect: 'progressive', tense: 'past' }), 'il giat era vidlonder da mangiar la mieur.'],
    ['the cat was about to eat', eats({ aspect: 'prospective', tense: 'past' }), 'il giat era sin il punct da mangiar la mieur.'],
    ['the cat will be eating', eats({ aspect: 'progressive', tense: 'future' }), 'il giat vegn ad esser vidlonder da mangiar la mieur.'],
    ['he wants to be able to go', clause(HE, 'GO', { verbPhrase: { modals: ['WILL', 'CAN'] } }), 'el vul pudair ir.'],
    ['he must be eating', clause(HE, 'EAT', { verbPhrase: { modals: ['MUST'], aspect: 'progressive' } }), 'el sto esser vidlonder da mangiar.'],
    ['he must have gone', clause(HE, 'GO', { verbPhrase: { modals: ['MUST'], aspect: 'resultative' } }), 'el sto esser ì.'],
    ['I want to sit down — the clitic on the infinitive', clause(I, 'SIT_DOWN', { verbPhrase: { modals: ['WILL'] } }), 'jau vi ma tschentar.'],
    ['the cat becomes big — daventar', clause(CAT, 'BECOME', { complements: { predicative: { phrase: np('BIG') } } }), 'il giat daventa grond.'],
    ['the (female) cat became big', clause(SHE_CAT, 'BECOME', { complements: { predicative: { phrase: np('BIG') } }, verbPhrase: { tense: 'past' } }), 'la giatta è daventada gronda.'],
    ['more', catIs('BIG', 'more'), 'il giat è pli grond.'],
    ['most', catIs('BIG', 'most'), 'il giat è il pli grond.'],
    ['less', catIs('BIG', 'less'), 'il giat è main grond.'],
    ['as … as', catIs('BIG', 'equally', DOG), 'il giat è uschè grond sco il chaun.'],
    ['a bigger cat than the dog', subject(np('CAT', { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveDegrees: ['more'], adjectiveStandards: [DOG] } as Partial<NounPhrase>)), "in giat pli grond ch'il chaun."],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });

  // E14 D4: the column stores no suppletive comparative, so GOOD compares periphrastically. RG is
  // expected to say *meglier* (verify at E19); a lexeme key would carry it, as German's \`comparative\`.
  test.fails('better — the suppletive meglier', () => {
    expect(rg(catIs('GOOD', 'more'))).toBe('il giat è meglier.');
  });
});

describe('P04-E15: complements, relatives, coordination', () => {
  const runs = (complements: PhrasePlan['complements']): PhrasePlan => clause(CAT, 'RUN', { complements });
  test.each<[string, PhrasePlan, string]>([
    ['locative — en', runs({ locative: { phrase: np('HOUSE') } }), 'il giat curra en la chasa.'],
    ['under — sut', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'under' }] } }), 'il giat curra sut la chasa.'],
    ['behind — davos', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'behind' }] } }), 'il giat curra davos la chasa.'],
    ['in front of — davant', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'in_front_of' }] } }), 'il giat curra davant la chasa.'],
    ['around — enturn', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'around' }] } }), 'il giat curra enturn la chasa.'],
    ['direction to a place — a', clause(CAT, 'GO', { complements: { direction: { phrase: np('HOUSE') } } }), 'il giat va a la chasa.'],
    ['direction to a person — tar', clause(CAT, 'GO', { complements: { direction: { phrase: np('WOMAN') } } }), 'il giat va tar la dunna.'],
    ['direction home — a chasa', clause(CAT, 'GO', { complements: { direction: { phrase: np('HOME') } } }), 'il giat va a chasa.'],
    ['source — da', clause(CAT, 'COME', { complements: { source: { phrase: np('HOUSE') } } }), 'il giat vegn da la chasa.'],
    ['route — tras', runs({ route: { phrase: np('HOUSE') } }), 'il giat curra tras la chasa.'],
    ['cause — pervia da', runs({ cause: { phrase: DOG } }), 'il giat curra pervia dal chaun.'],
    ['cause, positive — grazia a', runs({ cause: { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'positive' }] } }), 'il giat curra grazia al chaun.'],
    ['cause, negative — per cuolpa da', runs({ cause: { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'negative' }] } }), 'il giat curra per cuolpa dal chaun.'],
    ['comitative — cun', runs({ comitative: { phrase: DOG } }), 'il giat curra cun il chaun.'],
    ['comitative pronoun — cun el', runs({ comitative: { phrase: HE } }), 'il giat curra cun el.'],
    ['terminus pronoun — ad el', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: HE } } }), 'jau dun il cudesch ad el.'],
    ['the passive agent — da', eats({ voice: 'passive' }), 'la mieur vegn mangiada dal giat.'],
    ['source under a running verb — davent da', runs({ source: { phrase: np('HOUSE') } }), 'il giat curra davent da la chasa.'],
    ['direction to a land — en', clause(CAT, 'GO', { complements: { direction: { phrase: np('EUROPE') } } }), 'il giat va en Europa.'],
    ['purpose — per', runs({ purpose: { phrase: np('MAN') } }), "il giat curra per l'um."],
    ['topic — da', clause(I, 'SPEAK', { complements: { topic: { phrase: CAT } } }), 'jau discur dal giat.'],
    ['topic the verb governs — vi da', clause(I, 'THINK', { complements: { topic: { phrase: CAT } } }), 'jau patratg vi dal giat.'],
    ['opponent — cunter', runs({ opponent: { phrase: DOG } }), 'il giat curra cunter il chaun.'],
    ['temporal — avant', runs({ temporal: { phrase: np('DAY'), specifiers: [{ kind: 'temporal', value: 'before' }] } }), 'il giat curra avant il di.'],
    ['temporal ago — avant, before the phrase', runs({ temporal: { phrase: np('DAY', { definiteness: 'indefinite' }), specifiers: [{ kind: 'temporal', value: 'ago' }] } }), 'il giat curra avant in di.'],
    ['a verb\'s own preposition — sin', clause(I, 'CLICK', { directObject: np('BUTTON') }), 'jau clic sin il buttun.'],
    ['a verb\'s preposition with a pronoun — da ella', clause(CAT, 'DEPEND', { directObject: SHE }), 'il giat dependa da ella.'],
    ['the experiencer fronted — al chaun plascha', clause(MOUSE, 'LIKE', { complements: { terminus: { phrase: DOG } } }), 'al chaun plascha la mieur.'],
    ['a pronoun experiencer fronted too — a mai', clause(MOUSE, 'LIKE', { complements: { terminus: { phrase: I } } }), 'a mai plascha la mieur.'],
    // Relatives (E15 D2).
    ['subject relative — che', subject(np('CAT', { relative: { headRole: 'subject', verbPhrase: { verb: 'EAT' }, directObject: MOUSE } })), 'il giat che mangia la mieur.'],
    ['object relative — ch\' before a vowel', subject(np('MOUSE', { relative: { headRole: 'directObject', subject: CAT, verbPhrase: { verb: 'EAT' } } })), "la mieur ch'il giat mangia."],
    ['object relative with a pronoun subject — kept', subject(np('BOOK', { relative: { headRole: 'directObject', subject: I, verbPhrase: { verb: 'READ' } } })), 'il cudesch che jau legel.'],
    ['prepositional relative — la quala', subject(np('HOUSE', { relative: { headRole: 'locative', subject: CAT, verbPhrase: { verb: 'EAT' }, headSpecifiers: [{ kind: 'path', value: 'under' }] } } as Partial<NounPhrase>)), 'la chasa sut la quala il giat mangia.'],
    ['prepositional relative — cun il qual', subject(np('DOG', { relative: { headRole: 'comitative', subject: CAT, verbPhrase: { verb: 'RUN' } } } as Partial<NounPhrase>)), 'il chaun cun il qual il giat curra.'],
    ['place relative — nua', subject(np('PLACE', { relative: { headRole: 'locative', subject: CAT, verbPhrase: { verb: 'EAT' } } } as Partial<NounPhrase>)), 'il lieu nua il giat mangia.'],
    ['terminus relative — al qual', subject(np('MAN', { relative: { headRole: 'terminus', subject: np('WOMAN'), verbPhrase: { verb: 'GIVE' }, directObject: np('BOOK') } } as Partial<NounPhrase>)), "l'um al qual la dunna dat il cudesch."],
    ['agent relative — dal qual', subject(np('CHILD', { relative: { headRole: 'subject', verbPhrase: { verb: 'WRITE', voice: 'passive' }, directObject: np('BOOK') } } as Partial<NounPhrase>)), "l'uffant dal qual il cudesch vegn scrit."],
    ['possessor relative — the possessed first, then dal qual', subject(np('BOY', { relative: { headRole: 'possessor', subject: CAT, verbPhrase: { verb: 'EAT' } } })), 'il mat il giat dal qual mangia.'],
    // Coordination (E15 D3).
    ['however — dentant, a clause of its own', { ...clause(CAT, 'RUN'), coordination: { conjunction: 'however', clause: clause(DOG, 'EAT') } }, 'il giat curra; dentant, il chaun mangia.'],
    ['and', subject({ conjuncts: [CAT, DOG], conjunction: 'and' }), 'il giat e il chaun.'],
    ['or', subject({ conjuncts: [CAT, DOG], conjunction: 'or' }), 'il giat u il chaun.'],
    ['but', { ...clause(CAT, 'RUN'), coordination: { conjunction: 'but', clause: clause(DOG, 'EAT') } }, 'il giat curra, ma il chaun mangia.'],
    ['and before a vowel — no ed (E15 D3)', subject({ conjuncts: [CAT, np('MAN')], conjunction: 'and' }), "il giat e l'um."],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });

  // E15 D1's open point: a process-level instrument said as an act needs a non-gerund means
  // construction; the engine says *cun* + the infinitive until a source or the review gives one.
  test.todo('the process-level instrumental (P04-E15 D1): what RG writes for "by choosing a word"');
});

describe('P04-E16: moods — conditional, imperative, infinitive; no inversion', () => {
  test.each<[string, PhrasePlan, string]>([
    ['if the dog ran, the cat would eat — the conditional in both clauses', { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') }, "sch'il chaun curriss, il giat mangiass."],
    ['if the cat were tired', { ...clause(DOG, 'RUN'), condition: clause(CAT, 'BE', { complements: { predicative: { phrase: np('TIRED') } } }) }, "sch'il giat fiss stanchel, il chaun curriss."],
    ['eat! (2sg)', command(YOU, 'EAT', {}, { directObject: MOUSE }), 'mangia la mieur.'],
    ['let\'s eat! (1pl)', command(WE, 'EAT', {}, { directObject: MOUSE }), 'mangiain la mieur.'],
    ['eat! (2pl)', command(YOU_ALL, 'EAT', {}, { directObject: MOUSE }), 'mangiai la mieur.'],
    ['don\'t eat! (2sg)', command(YOU, 'EAT', { negative: true }, { directObject: MOUSE }), 'na mangia betg la mieur.'],
    ['let\'s not eat! (1pl)', command(WE, 'EAT', { negative: true }), 'na mangiain betg.'],
    ['don\'t eat! (2pl)', command(YOU_ALL, 'EAT', { negative: true }), 'na mangiai betg.'],
    ['go! — ir', command(YOU, 'GO'), 'va.'],
    ['be careful! — esser', command(YOU, 'BE', {}, { complements: { predicative: { phrase: np('CAREFUL') } } }), 'sajas attent.'],
    ['sit down! — the clitic after the command', command(YOU, 'SIT_DOWN'), 'tschenta-ta.'],
    ['don\'t sit down!', command(YOU, 'SIT_DOWN', { negative: true }), 'na ta tschenta betg.'],
    ['if the dog did not run — negated in the protasis', { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN', { verbPhrase: { negative: true } }) }, "sch'il chaun na curriss betg, il giat mangiass."],
    ['if the dog had run, the cat would have eaten', { ...clause(CAT, 'EAT', { verbPhrase: { aspect: 'resultative' } }), condition: clause(DOG, 'RUN', { verbPhrase: { aspect: 'resultative' } }) }, "sch'il chaun avess currì, il giat avess mangià."],
    ['sit down! (2pl)', command(YOU_ALL, 'SIT_DOWN'), 'tschentai-as.'],
    ['to eat the mouse — the citation', { ...clause(ONE, 'EAT', { directObject: MOUSE }), infinitive: true }, 'mangiar la mieur.'],
    ['not to eat — betg alone', { ...clause(ONE, 'EAT', { verbPhrase: { negative: true } }), infinitive: true }, 'betg mangiar.'],
    ['to sit down — the reflexive citation', { ...clause(ONE, 'SIT_DOWN'), infinitive: true }, 'sa tschentar.'],
    ['to be eaten — the passive citation', { ...clause(CAT, 'EAT', { directObject: MOUSE, verbPhrase: { voice: 'passive' } }), infinitive: true }, 'vegnir mangiada dal giat.'],
    ['I want to eat — the infinitive', clause(I, 'EAT', { verbPhrase: { modals: ['WILL'] } }), 'jau vi mangiar.'],
    ['the cat begins to eat — a', clause(CAT, 'BEGIN', { infinitiveComplement: clause(CAT, 'EAT') as never }), 'il giat cumenza a mangiar.'],
    ['I know that the cat eats — ch\'', clause(I, 'KNOW', { contentObject: eats() as never }), "jau sai ch'il giat mangia la mieur."],
    ['I believe that the cat is tired — the conjunctiv', clause(I, 'BELIEVE', { contentObject: clause(CAT, 'BE', { complements: { predicative: { phrase: np('TIRED') } } }) as never }), "jau crai ch'il giat saja stanchel."],
    ['when the dog runs, the cat eats', clause(CAT, 'EAT', { adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN') as never } }), "il giat mangia cura ch'il chaun curra."],
  ])('%s', (_label, plan, expected) => {
    expect(rg(plan)).toBe(expected);
  });

  test('a UI control is the infinitive (E16 D2)', () => {
    expect(rg(command(YOU, 'SAVE', {}, { imperativeRegister: 'instruction' } as Partial<PhrasePlan>))).toBe('memorisar.');
  });

  // D9: after a fronted *sche*-clause RG may put the verb before the subject (verb second); the engine
  // keeps subject–verb order until the reviewer rules.
  test.fails('if the dog ran, the cat would eat — inverted (D9)', () => {
    expect(rg({ ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') })).toBe("sch'il chaun curriss, mangiass il giat.");
  });
});
