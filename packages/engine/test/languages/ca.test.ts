import { describe, expect, test } from 'vitest';
import type { Degree, NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, say, translateAll } from '../harness.js';

// Catalan (P03): the language's own suite while it is a preview language (P03 §4). The exhaustive
// tables elsewhere render the ready languages only; every line here is the engine's output over the
// real `ca` column, pinned after checking it against `docs/features/P-planning/P03-catalan/style-ca.md`
// and Central Catalan (IEC), and every row is *(verify)* until the native review (P03-E11). A known gap
// is a `test.fails` row that states what Catalan writes.

const ca = (plan: PhrasePlan): string => say(plan, 'ca');

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
const tired = { predicative: { phrase: np('TIRED') } };

// The words that are Spanish and never Catalan (P03-E4's leak guard): the column borrows Spanish for a
// concept it lacks, and the engine is Spanish's fork, so either would show here first.
const LEAKS = /(^|[\s'¿¡])(gato|gatos|perro|ratón|los|unos|unas|hacia|pero|muy|más|nunca|está|fue|comió|y|ningún|ninguna|nada|nadie|lo|le|como|cuando|hay|debe|puede|del gato|está comiendo|el hombre|el agua)(?=[\s.,?!]|$)/;

describe('P03: the opening table', () => {
  test.each<[string, PhrasePlan, string]>([
    ['the cat eats the mouse', eats(), 'el gat menja el ratolí.'],
    ['the cat ate the mouse — the periphrastic past (D2)', eats({ tense: 'past' }), 'el gat va menjar el ratolí.'],
    ['the cat will eat the mouse', eats({ tense: 'future' }), 'el gat menjarà el ratolí.'],
    ['the cat does not eat the mouse', eats({ negative: true }), 'el gat no menja el ratolí.'],
    ['the cat never eats the mouse — negative concord', eats({ modifier: 'NEVER' }), 'el gat no menja mai el ratolí.'],
    ['the cat is eating the mouse', eats({ aspect: 'progressive' }), 'el gat està menjant el ratolí.'],
    ['the cat must eat the mouse', eats({ modals: ['MUST'] }), 'el gat ha de menjar el ratolí.'],
    ['the man — elision', subject(np('MAN')), "l'home."],
    ['the water — elision', subject(np('WATER')), "l'aigua."],
    ['the cat runs to the child', clause(CAT, 'RUN', { complements: { direction: { phrase: np('CHILD') } } }), 'el gat corre cap al nen.'],
    ['the cat runs from the house', clause(CAT, 'RUN', { complements: { source: { phrase: np('HOUSE') } } }), 'el gat corre lluny de la casa.'],
    ['one eats the mouse — generic es (D5)', clause(ONE, 'EAT', { directObject: MOUSE }), 'es menja el ratolí.'],
    ['if the dog ran, the cat would eat the mouse', { ...eats(), condition: clause(DOG, 'RUN') }, 'si el gos corregués, el gat menjaria el ratolí.'],
    ['eat the mouse!', command(YOU, 'EAT', {}, { directObject: MOUSE }), 'menja el ratolí.'],
    ["don't eat the mouse!", command(YOU, 'EAT', { negative: true }, { directObject: MOUSE }), 'no mengis el ratolí.'],
    ['we eat — pro-drop', clause(WE, 'EAT'), 'mengem.'],
  ])('%s', (_label, plan, expected) => {
    expect(ca(plan)).toBe(expected);
  });
});

describe('P03: a preview row', () => {
  test('renders last, after the three Romansh rows (D7)', () => {
    expect(translateAll(clause(CAT, 'RUN')).map((t) => t.language)).toEqual(['en', 'it', 'fr', 'de', 'es', 'ja', 'pt', 'gsw', 'rm-rumgr', 'rm-sursilv', 'rm-vallader', 'ca']);
  });

  test('says no word that is Spanish only', () => {
    const plans: PhrasePlan[] = [
      subject(np('MAN')), subject(np('CAT', { number: 'plural', adjectives: ['BIG', 'BLACK'] })), subject(np('DOG', { definiteness: 'this' })),
      subject(np('DOG', { definiteness: 'no' })), subject(np('HOUSE', { possessor: np('MAN', { number: 'plural' }) })),
      subject(np('CAT', { possessor: MY })), catIs('BIG', 'more', DOG), catIs('BIG', 'most'), catIs('BIG', 'equally', DOG),
      eats(), eats({ negative: true }), eats({ tense: 'past' }), eats({ tense: 'future' }), eats({ aspect: 'progressive' }),
      eats({ aspect: 'prospective' }), eats({ aspect: 'resultative', negative: true }), eats({ modifier: 'NEVER' }),
      clause(ONE, 'EAT', { directObject: MOUSE }), clause(HE, 'GO', { verbPhrase: { modals: ['MUST'] } }),
      clause(I, 'KNOW', { contentObject: eats({ tense: 'past' }) as never }), clause(I, 'BE', { complements: tired, verbPhrase: { negative: true } }),
      command(YOU, 'EAT', { negative: true }), { ...clause(CAT, 'EAT'), condition: clause(DOG, 'RUN') },
      clause(CAT, 'EAT', { directObject: MOUSE, verbPhrase: { voice: 'passive' } }),
      { ...clause(np('CAT', { definiteness: 'no' }), 'BE'), existential: true },
      clause(CAT, 'SEE', { directObject: np('SOMETHING'), verbPhrase: { negative: true } }),
      clause(np('SOMEONE'), 'RUN', { verbPhrase: { negative: true } }),
      subject({ conjuncts: [CAT, DOG], conjunction: 'and' }), { ...clause(CAT, 'RUN'), coordination: { conjunction: 'but', clause: clause(DOG, 'EAT') } },
      clause(CAT, 'RUN', { complements: { manner: { phrase: np('WATER') } } }),
      { ...eats(), adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN') } } as PhrasePlan,
    ];
    for (const plan of plans) expect(ca(plan)).not.toMatch(LEAKS);
  });
});

describe('P03 §2.1: the noun phrase', () => {
  test.each<[string, PhrasePlan, string]>([
    // Articles and elision.
    ['the cats', subject(np('CAT', { number: 'plural' })), 'els gats.'],
    ['the house', subject(np('HOUSE')), 'la casa.'],
    ['the houses', subject(np('HOUSE', { number: 'plural' })), 'les cases.'],
    ['the men — the plural never elides', subject(np('MAN', { number: 'plural' })), 'els homes.'],
    ['a cat', subject(np('CAT', { definiteness: 'indefinite' })), 'un gat.'],
    ['a house', subject(np('HOUSE', { definiteness: 'indefinite' })), 'una casa.'],
    ['some cats — uns, not bare', subject(np('CAT', { number: 'plural', definiteness: 'indefinite' })), 'uns gats.'],
    ['a man — un never elides', subject(np('MAN', { definiteness: 'indefinite' })), 'un home.'],
    ['the university — la before an unstressed u- (no_elision)', subject(np('UNIVERSITY')), 'la universitat.'],
    ['the idea — la before an unstressed i-', subject(np('IDEA')), 'la idea.'],
    ['the other man — l\' before a prenominal adjective', subject(np('MAN', { adjectives: ['OTHER'] })), "l'altre home."],
    ['another cat — un altre, not bare', subject(np('CAT', { definiteness: 'indefinite', adjectives: ['OTHER'] })), 'un altre gat.'],
    ['Africa — articled by its lexeme', subject(np('AFRICA')), "l'Àfrica."],
    ['Europe — bare', clause(CAT, 'GO', { complements: { direction: { phrase: np('EUROPE') } } }), 'el gat va a Europa.'],
    // Contractions: a / de / per + el / els; never before l', la, les.
    ['to the dog — al', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: DOG } } }), 'dono el llibre al gos.'],
    ['to the dogs — als', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('DOG', { number: 'plural' }) } } }), 'dono el llibre als gossos.'],
    ['to the man — a l\'', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('MAN') } } }), "dono el llibre a l'home."],
    ['to the woman — a la', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: np('WOMAN') } } }), 'dono el llibre a la dona.'],
    ['of the dog — del', subject(np('HOUSE', { possessor: DOG })), 'la casa del gos.'],
    ['of the dogs — dels', subject(np('HOUSE', { possessor: np('DOG', { number: 'plural' }) })), 'la casa dels gossos.'],
    ['of the man — de l\'', subject(np('HOUSE', { possessor: np('MAN') })), "la casa de l'home."],
    ['of a man — d\'', subject(np('HOUSE', { possessor: np('MAN', { definiteness: 'indefinite' }) })), "la casa d'un home."],
    ['the passive agent — pel', eats({ voice: 'passive' }), 'el ratolí és menjat pel gat.'],
    // Adjectives agree from the stored forms and follow the noun.
    ['the big cats eat the mouse', clause(np('CAT', { number: 'plural', adjectives: ['BIG'] }), 'EAT', { directObject: MOUSE }), 'els gats grans mengen el ratolí.'],
    ['the black cats', subject(np('CAT', { number: 'plural', adjectives: ['BLACK'] })), 'els gats negres.'],
    ['the white houses — blanques', subject(np('HOUSE', { number: 'plural', adjectives: ['WHITE'] })), 'les cases blanques.'],
    ['a new house — nova', subject(np('HOUSE', { definiteness: 'indefinite', adjectives: ['NEW'] })), 'una nova casa.'],
    // Determiners.
    ['this dog', subject(np('DOG', { definiteness: 'this' })), 'aquest gos.'],
    ['this house', subject(np('HOUSE', { definiteness: 'this' })), 'aquesta casa.'],
    ['these dogs', subject(np('DOG', { number: 'plural', definiteness: 'this' })), 'aquests gossos.'],
    ['those houses', subject(np('HOUSE', { number: 'plural', definiteness: 'that' })), 'aquelles cases.'],
    ['some dogs', subject(np('DOG', { number: 'plural', definiteness: 'some' })), 'alguns gossos.'],
    ['no dog — cap', subject(np('DOG', { definiteness: 'no' })), 'cap gos.'],
    ['no house — cap', subject(np('HOUSE', { definiteness: 'no' })), 'cap casa.'],
    ['many houses', subject(np('HOUSE', { number: 'plural', definiteness: 'many' })), 'moltes cases.'],
    ['few houses', subject(np('HOUSE', { number: 'plural', definiteness: 'few' })), 'poques cases.'],
    ['all the dogs', subject(np('DOG', { number: 'plural', definiteness: 'all' })), 'tots els gossos.'],
    ['each dog', subject(np('DOG', { definiteness: 'each' })), 'cada gos.'],
    ['three dogs', subject(np('DOG', { number: 'plural', numeral: 3, definiteness: 'bare' } as Partial<NounPhrase>)), 'tres gossos.'],
    ['two houses — dues', subject(np('HOUSE', { number: 'plural', numeral: 2, definiteness: 'bare' } as Partial<NounPhrase>)), 'dues cases.'],
    ['some water — una mica d\'', clause(CAT, 'DRINK', { directObject: np('WATER', { definiteness: 'some' }) }), "el gat beu una mica d'aigua."],
    ['the money — a plurale tantum', clause(CAT, 'HAVE', { directObject: np('MONEY') }), 'el gat té els diners.'],
    // Possessives (§0.4).
    ['my cat', subject(np('CAT', { possessor: MY })), 'el meu gat.'],
    ['my house', subject(np('HOUSE', { possessor: MY })), 'la meva casa.'],
    ['my cats', subject(np('CAT', { number: 'plural', possessor: MY })), 'els meus gats.'],
    ['my houses', subject(np('HOUSE', { number: 'plural', possessor: MY })), 'les meves cases.'],
    ['this book of mine', subject(np('BOOK', { definiteness: 'this', possessor: MY })), 'aquest llibre meu.'],
    ['to my house', clause(CAT, 'GO', { complements: { direction: { phrase: np('HOUSE', { possessor: MY }) } } }), 'el gat va a la meva casa.'],
    // Degree.
    ['bigger than the dog', catIs('BIG', 'more', DOG), 'el gat és més gran que el gos.'],
    ['the biggest', catIs('BIG', 'most'), 'el gat és el més gran.'],
    ['less big', catIs('BIG', 'less'), 'el gat és menys gran.'],
    ['as big as the dog', catIs('BIG', 'equally', DOG), 'el gat és tan gran com el gos.'],
    ['bigger than me — the subject form', catIs('BIG', 'more', I), 'el gat és més gran que jo.'],
    ['better — millor', catIs('GOOD', 'more'), 'el gat és millor.'],
    ['the best — el millor', catIs('GOOD', 'most'), 'el gat és el millor.'],
  ])('%s', (_label, plan, expected) => {
    expect(ca(plan)).toBe(expected);
  });
});

describe('P03 §2.2: the clause and the verb group', () => {
  test.each<[string, PhrasePlan, string]>([
    ['I eat — pro-drop', clause(I, 'EAT', { directObject: MOUSE }), 'menjo el ratolí.'],
    ['the cat and I eat — a pronoun in a coordination is kept', clause({ conjuncts: [CAT, I], conjunction: 'and' }, 'EAT'), 'el gat i jo mengem.'],
    ['the cats ate — vam / van', clause(np('CAT', { number: 'plural' }), 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }), 'els gats van menjar el ratolí.'],
    ['the cat did not eat', eats({ negative: true, tense: 'past' }), 'el gat no va menjar el ratolí.'],
    ['the cat has eaten — haver', eats({ aspect: 'resultative' }), 'el gat ha menjat el ratolí.'],
    ['the cat had eaten — havia', eats({ aspect: 'resultative', tense: 'past' }), 'el gat havia menjat el ratolí.'],
    ['the cat will have eaten', eats({ aspect: 'resultative', tense: 'future' }), 'el gat haurà menjat el ratolí.'],
    ['the cat was eating — estava', eats({ aspect: 'progressive', tense: 'past' }), 'el gat estava menjant el ratolí.'],
    ['the cat is about to eat', eats({ aspect: 'prospective' }), 'el gat està a punt de menjar el ratolí.'],
    ['the cat must go — d\' before a vowel', clause(CAT, 'GO', { verbPhrase: { modals: ['MUST'] } }), "el gat ha d'anar."],
    ['the cat can run', clause(CAT, 'RUN', { verbPhrase: { modals: ['CAN'] } }), 'el gat pot córrer.'],
    ['the cat wants to be able to run — inner modals are infinitives', clause(CAT, 'RUN', { verbPhrase: { modals: ['WILL', 'CAN'] } }), 'el gat vol poder córrer.'],
    ['the cat had to run — a state\'s imperfect', clause(CAT, 'RUN', { verbPhrase: { modals: ['MUST'], tense: 'past' } }), 'el gat havia de córrer.'],
    ['the cat should run — hauria de', clause(CAT, 'RUN', { verbPhrase: { modals: ['SHOULD'] } }), 'el gat hauria de córrer.'],
    ['the cat must have eaten', eats({ aspect: 'resultative', modals: ['MUST'] }), "el gat ha d'haver menjat el ratolí."],
    ['the cat wanted to eat — volia', eats({ tense: 'past', modals: ['WILL'] }), 'el gat volia menjar el ratolí.'],
    ['the cat is tired — estar for a transient state', clause(CAT, 'BE', { complements: tired }), 'el gat està cansat.'],
    ['the cat is big — ser', catIs('BIG'), 'el gat és gran.'],
    ['the cat is in the house — ser locates', clause(CAT, 'BE', { complements: { locative: { phrase: np('HOUSE') } } }), 'el gat és a la casa.'],
    ['the cat was tired — estava', clause(CAT, 'BE', { complements: tired, verbPhrase: { tense: 'past' } }), 'el gat estava cansat.'],
    ['there is a cat — hi ha', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE'), existential: true }, 'hi ha un gat.'],
    ['there are cats — hi ha, singular', { ...clause(np('CAT', { number: 'plural', definiteness: 'indefinite' }), 'BE'), existential: true }, 'hi ha uns gats.'],
    ['there is no cat — no hi ha cap', { ...clause(np('CAT', { definiteness: 'no' }), 'BE'), existential: true }, 'no hi ha cap gat.'],
    ['there was a cat — hi havia', { ...clause(np('CAT', { definiteness: 'indefinite' }), 'BE', { verbPhrase: { tense: 'past' } }), existential: true }, 'hi havia un gat.'],
    // Negation and negative concord.
    ['the cat no longer eats — ja no', eats({ modifier: 'NO_LONGER' }), 'el gat ja no menja el ratolí.'],
    ['the cat has not eaten yet — encara no', eats({ negative: true, aspect: 'resultative', modifier: 'ALREADY' }), 'el gat encara no ha menjat el ratolí.'],
    ['the cat does not see any dog — no … cap', clause(CAT, 'SEE', { directObject: np('DOG', { definiteness: 'no' }) }), 'el gat no veu cap gos.'],
    ['the cat sees nothing — no … res', clause(CAT, 'SEE', { directObject: np('SOMETHING'), verbPhrase: { negative: true } }), 'el gat no veu res.'],
    ['nobody runs — ningú no', clause(np('SOMEONE'), 'RUN', { verbPhrase: { negative: true } }), 'ningú no corre.'],
    ['no dog runs — cap … no', clause(np('DOG', { definiteness: 'no' }), 'RUN'), 'cap gos no corre.'],
    ['the cat never wants to run', clause(CAT, 'RUN', { verbPhrase: { modals: [{ verb: 'WILL', modifier: 'NEVER' }] } as Partial<VerbPhrase> }), 'el gat no vol mai córrer.'],
    ['the cat always eats', eats({ modifier: 'ALWAYS' }), 'el gat menja sempre el ratolí.'],
    // BECOME and the pronominal verbs: the clitic before the finite word, after the gerund.
    ['the cat becomes happy — es torna', clause(CAT, 'BECOME', { complements: { predicative: { phrase: np('HAPPY') } } }), 'el gat es torna feliç.'],
    ['the cat became happy — es va tornar', clause(CAT, 'BECOME', { verbPhrase: { tense: 'past' }, complements: { predicative: { phrase: np('HAPPY') } } }), 'el gat es va tornar feliç.'],
    ['the cat has become happy — s\'ha tornat', clause(CAT, 'BECOME', { verbPhrase: { aspect: 'resultative' }, complements: { predicative: { phrase: np('HAPPY') } } }), "el gat s'ha tornat feliç."],
    ['I sit down — m\'assec', clause(I, 'SIT_DOWN'), "m'assec."],
    ['we sit down — ens asseiem', clause(WE, 'SIT_DOWN'), 'ens asseiem.'],
    ['the cat stopped — es va aturar', clause(CAT, 'STOP_ONESELF', { verbPhrase: { tense: 'past' } }), 'el gat es va aturar.'],
    ['I must sit down — the enclitic on the infinitive', clause(I, 'SIT_DOWN', { verbPhrase: { modals: ['MUST'] } }), "he d'asseure'm."],
    ['one sits down — un es … (A152)', clause(ONE, 'SIT_DOWN'), "un s'asseu."],
    ['the cat is sitting down — the enclitic on the gerund', clause(CAT, 'SIT_DOWN', { verbPhrase: { aspect: 'progressive' } }), 'el gat està asseient-se.'],
    // The impersonal es.
    ['one eats the mice — the passive es agrees', clause(ONE, 'EAT', { directObject: np('MOUSE', { number: 'plural' }) }), 'es mengen els ratolins.'],
    // Questions.
    ['what does the cat eat?', { ...clause(CAT, 'EAT'), questionRole: 'directObject' } as PhrasePlan, 'què menja el gat?'],
    ['who eats the mouse?', { ...eats(), questionRole: 'subject', questionAnimate: true } as PhrasePlan, 'qui menja el ratolí?'],
    ['where does the cat eat?', { ...clause(CAT, 'EAT'), questionRole: 'locative' } as PhrasePlan, 'on menja el gat?'],
    ['whom does the cat see? — a qui, apart from the subject\'s qui', { ...clause(CAT, 'SEE'), questionRole: 'directObject', questionAnimate: true } as PhrasePlan, 'a qui veu el gat?'],
  ])('%s', (_label, plan, expected) => {
    expect(ca(plan)).toBe(expected);
  });

  test.each(PERSONS)('every person of ser, tenir, menjar and the past: %s', (pn, who) => {
    const cells: Record<string, [string, string, string, string]> = {
      '1sg': ['sóc gran.', 'tinc el ratolí.', 'menjo el ratolí.', 'vaig menjar el ratolí.'],
      '2sg': ['ets gran.', 'tens el ratolí.', 'menges el ratolí.', 'vas menjar el ratolí.'],
      '3sg': ['és gran.', 'té el ratolí.', 'menja el ratolí.', 'va menjar el ratolí.'],
      '1pl': ['som grans.', 'tenim el ratolí.', 'mengem el ratolí.', 'vam menjar el ratolí.'],
      '2pl': ['sou grans.', 'teniu el ratolí.', 'mengeu el ratolí.', 'vau menjar el ratolí.'],
      '3pl': ['són grans.', 'tenen el ratolí.', 'mengen el ratolí.', 'van menjar el ratolí.'],
    };
    const [be, have, eat, ate] = cells[pn]!;
    expect(ca(clause(who, 'BE', { complements: { predicative: { phrase: np('BIG') } } }))).toBe(be);
    expect(ca(clause(who, 'HAVE', { directObject: MOUSE }))).toBe(have);
    expect(ca(clause(who, 'EAT', { directObject: MOUSE }))).toBe(eat);
    expect(ca(clause(who, 'EAT', { directObject: MOUSE, verbPhrase: { tense: 'past' } }))).toBe(ate);
  });
});

describe('P03 §2.2: object pronouns — the proclitic, the simplest correct form', () => {
  test.each<[string, PhrasePlan, string]>([
    ['I see him — el', clause(I, 'SEE', { directObject: HE }), 'el veig.'],
    ['the cat sees her — la', clause(CAT, 'SEE', { directObject: SHE }), 'el gat la veu.'],
    ['the cat sees me — em', clause(CAT, 'SEE', { directObject: I }), 'el gat em veu.'],
    ['the cat sees us — ens', clause(CAT, 'SEE', { directObject: WE }), 'el gat ens veu.'],
    ['the cat does not see him — no el', clause(CAT, 'SEE', { directObject: HE, verbPhrase: { negative: true } }), 'el gat no el veu.'],
    ['the cat saw him — before the periphrastic va', clause(CAT, 'SEE', { directObject: HE, verbPhrase: { tense: 'past' } }), 'el gat el va veure.'],
    ['the cat has seen him — l\' before ha', clause(CAT, 'SEE', { directObject: HE, verbPhrase: { aspect: 'resultative' } }), "el gat l'ha vist."],
    ['I give him the book — the dative li', clause(I, 'GIVE', { directObject: np('BOOK'), complements: { terminus: { phrase: HE } } }), 'li dono el llibre.'],
    ['I give it to him — l\'hi', clause(I, 'GIVE', { directObject: HE, complements: { terminus: { phrase: HE } } }), "l'hi dono."],
    ['the cat sees the dog and me', clause(CAT, 'SEE', { directObject: { conjuncts: [DOG, I], conjunction: 'and' } }), 'el gat veu el gos i a mi.'],
    ['the dog likes the cat — al gat li agrada', clause(CAT, 'LIKE', { complements: { terminus: { phrase: DOG } } }), 'al gos li agrada el gat.'],
    ['I like the dog — m\'agrada', clause(DOG, 'LIKE', { complements: { terminus: { phrase: I } } }), "m'agrada el gos."],
    ['eat it! — menja\'l', command(YOU, 'EAT', {}, { directObject: HE }), "menja'l."],
    ["don't eat it! — no el mengis", command(YOU, 'EAT', { negative: true }, { directObject: HE }), 'no el mengis.'],
    ['eat it! (2pl) — mengeu-lo', command(YOU_ALL, 'EAT', {}, { directObject: HE }), 'mengeu-lo.'],
  ])('%s', (_label, plan, expected) => {
    expect(ca(plan)).toBe(expected);
  });
});

describe('P03 §2.3: complements, relatives, coordination', () => {
  const runs = (complements: PhrasePlan['complements']): PhrasePlan => clause(CAT, 'RUN', { complements });
  test.each<[string, PhrasePlan, string]>([
    ['locative — a before the definite', runs({ locative: { phrase: np('HOUSE') } }), 'el gat corre a la casa.'],
    ['locative — en before the indefinite', runs({ locative: { phrase: np('HOUSE', { definiteness: 'indefinite' }) } }), 'el gat corre en una casa.'],
    ['under — sota', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'under' }] } }), 'el gat corre sota la casa.'],
    ['behind — darrere de', runs({ locative: { phrase: DOG, specifiers: [{ kind: 'path', value: 'behind' }] } }), 'el gat corre darrere del gos.'],
    ['in front of — davant de', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'in_front_of' }] } }), 'el gat corre davant de la casa.'],
    ['around — al voltant de', runs({ locative: { phrase: np('HOUSE'), specifiers: [{ kind: 'path', value: 'around' }] } }), 'el gat corre al voltant de la casa.'],
    ['direction to a place — al', clause(CAT, 'GO', { complements: { direction: { phrase: np('MARKET') } } }), 'el gat va al mercat.'],
    ['direction home — a casa', clause(CAT, 'GO', { complements: { direction: { phrase: np('HOME') } } }), 'el gat va a casa.'],
    ['direction to a person — cap a', clause(CAT, 'GO', { complements: { direction: { phrase: np('WOMAN') } } }), 'el gat va cap a la dona.'],
    ['source — de', clause(CAT, 'COME', { complements: { source: { phrase: np('HOUSE') } } }), 'el gat ve de la casa.'],
    ['route — per, pel', runs({ route: { phrase: np('PATH') } }), 'el gat corre pel recorregut.'],
    ['cause — a causa de', runs({ cause: { phrase: DOG } }), 'el gat corre a causa del gos.'],
    ['cause, positive — gràcies a', runs({ cause: { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'positive' }] } }), 'el gat corre gràcies al gos.'],
    ['cause, negative — per culpa de', runs({ cause: { phrase: DOG, specifiers: [{ kind: 'sentiment', value: 'negative' }] } }), 'el gat corre per culpa del gos.'],
    ['cause, negative, a pronoun — per culpa meva', runs({ cause: { phrase: I, specifiers: [{ kind: 'sentiment', value: 'negative' }] } }), 'el gat corre per culpa meva.'],
    ['manner — com', runs({ manner: { phrase: np('WATER') } }), "el gat corre com l'aigua."],
    ['comitative — amb', runs({ comitative: { phrase: DOG } }), 'el gat corre amb el gos.'],
    ['comitative pronoun — amb mi', runs({ comitative: { phrase: I } }), 'el gat corre amb mi.'],
    ['instrumental — amb', eats({}, { complements: { instrumental: { phrase: np('STICK') } } }), 'el gat menja el ratolí amb el pal.'],
    ['purpose — per a', runs({ purpose: { phrase: np('MAN') } }), "el gat corre per a l'home."],
    ['temporal — abans de', runs({ temporal: { phrase: np('DAY'), specifiers: [{ kind: 'temporal', value: 'before' }] } }), 'el gat corre abans del dia.'],
    ['temporal — fins a', runs({ temporal: { phrase: np('DAY'), specifiers: [{ kind: 'temporal', value: 'until' }] } }), 'el gat corre fins al dia.'],
    ['a verb\'s own preposition — depèn de', clause(CAT, 'DEPEND', { directObject: SHE }), 'el gat depèn d\'ella.'],
    // Relatives.
    ['subject relative — que', subject(np('CAT', { relative: { headRole: 'subject', verbPhrase: { verb: 'EAT' }, directObject: MOUSE } })), 'el gat que menja el ratolí.'],
    ['object relative — que', subject(np('MOUSE', { relative: { headRole: 'directObject', subject: CAT, verbPhrase: { verb: 'EAT' } } })), 'el ratolí que el gat menja.'],
    ['object relative, a pronoun subject dropped', subject(np('BOOK', { relative: { headRole: 'directObject', subject: I, verbPhrase: { verb: 'READ' } } })), 'el llibre que llegeixo.'],
    ['place relative — on', subject(np('PLACE', { relative: { headRole: 'locative', subject: CAT, verbPhrase: { verb: 'EAT' } } } as Partial<NounPhrase>)), 'el lloc on el gat menja.'],
    ['prepositional relative — la qual', subject(np('HOUSE', { relative: { headRole: 'locative', subject: CAT, verbPhrase: { verb: 'EAT' }, headSpecifiers: [{ kind: 'path', value: 'under' }] } } as Partial<NounPhrase>)), 'la casa sota la qual el gat menja.'],
    ['prepositional relative — amb el qual', subject(np('DOG', { relative: { headRole: 'comitative', subject: CAT, verbPhrase: { verb: 'RUN' } } } as Partial<NounPhrase>)), 'el gos amb el qual el gat corre.'],
    ['terminus relative on a person — a qui', subject(np('CHILD', { relative: { headRole: 'terminus', subject: np('MAN'), verbPhrase: { verb: 'GIVE' }, directObject: np('BOOK') } } as Partial<NounPhrase>)), "el nen a qui l'home dona el llibre."],
    ['possessor relative — del qual', subject(np('HOUSE', { relative: { headRole: 'possessor', subject: DOG, verbPhrase: { verb: 'RUN' } } })), 'la casa el gos de la qual corre.'],
    // Coordination.
    ['and — i', subject({ conjuncts: [CAT, DOG], conjunction: 'and' }), 'el gat i el gos.'],
    ['and before an i- word — still i', subject({ conjuncts: [CAT, np('IDEA')], conjunction: 'and' }), 'el gat i la idea.'],
    ['or — o', subject({ conjuncts: [CAT, np('MAN')], conjunction: 'or' }), "el gat o l'home."],
    ['but — però', { ...clause(CAT, 'RUN'), coordination: { conjunction: 'but', clause: clause(DOG, 'EAT') } }, 'el gat corre, però el gos menja.'],
    ['however — tanmateix, a clause of its own', { ...clause(CAT, 'RUN'), coordination: { conjunction: 'however', clause: clause(DOG, 'EAT') } }, 'el gat corre; tanmateix, el gos menja.'],
  ])('%s', (_label, plan, expected) => {
    expect(ca(plan)).toBe(expected);
  });
});

describe('P03 §2.4: moods', () => {
  test.each<[string, PhrasePlan, string]>([
    ['if the cat were tired — fos', { ...clause(DOG, 'RUN'), condition: clause(CAT, 'BE', { complements: tired }) }, 'si el gat estigués cansat, el gos correria.'],
    ['if the dog had run, the cat would have eaten', { ...eats({ aspect: 'resultative' }), condition: clause(DOG, 'RUN', { verbPhrase: { aspect: 'resultative' } }) }, 'si el gos hagués corregut, el gat hauria menjat el ratolí.'],
    ['if the dog did not run', { ...eats(), condition: clause(DOG, 'RUN', { verbPhrase: { negative: true } }) }, 'si el gos no corregués, el gat menjaria el ratolí.'],
    ["let's eat! (1pl)", command(WE, 'EAT', {}, { directObject: MOUSE }), 'mengem el ratolí.'],
    ['eat! (2pl)', command(YOU_ALL, 'EAT', {}, { directObject: MOUSE }), 'mengeu el ratolí.'],
    ["let's not eat! (1pl)", command(WE, 'EAT', { negative: true }), 'no mengem.'],
    ["don't eat! (2pl)", command(YOU_ALL, 'EAT', { negative: true }), 'no mengeu.'],
    ['go! — vés', command(YOU, 'GO'), 'vés.'],
    ['sit down! — asseu-te', command(YOU, 'SIT_DOWN'), 'asseu-te.'],
    ["don't sit down! — no t'asseguis", command(YOU, 'SIT_DOWN', { negative: true }), "no t'asseguis."],
    ["let's sit down! — asseguem-nos", command(WE, 'SIT_DOWN'), 'asseguem-nos.'],
    ['sit down! (2pl) — asseieu-vos', command(YOU_ALL, 'SIT_DOWN'), 'asseieu-vos.'],
    ['to eat the mouse — the citation', { ...clause(ONE, 'EAT', { directObject: MOUSE }), infinitive: true }, 'menjar el ratolí.'],
    ['not to eat', { ...clause(ONE, 'EAT', { verbPhrase: { negative: true } }), infinitive: true }, 'no menjar.'],
    ['to sit down — the pronominal citation', { ...clause(ONE, 'SIT_DOWN'), infinitive: true }, "asseure's."],
    ['the cat begins to eat — a', clause(CAT, 'BEGIN', { infinitiveComplement: clause(CAT, 'EAT') as never }), 'el gat comença a menjar.'],
    ['I know that the cat eats', clause(I, 'KNOW', { contentObject: eats() as never }), 'sé que el gat menja el ratolí.'],
    ['I know that the cat ate', clause(I, 'KNOW', { contentObject: eats({ tense: 'past' }) as never }), 'sé que el gat va menjar el ratolí.'],
    ['I believe that the cat is tired', clause(I, 'BELIEVE', { contentObject: clause(CAT, 'BE', { complements: tired }) as never }), 'crec que el gat està cansat.'],
    ['I do not believe that the cat is tired — the subjunctive', clause(I, 'BELIEVE', { verbPhrase: { negative: true }, contentObject: clause(CAT, 'BE', { complements: tired }) as never }), 'no crec que el gat estigui cansat.'],
    ['when the dog runs, the cat eats', { ...eats(), adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN') } } as PhrasePlan, 'el gat menja el ratolí quan el gos corre.'],
    ['when the dog runs (future) — the present subjunctive', { ...eats({ tense: 'future' }), adverbialClause: { conjunction: 'when', clause: clause(DOG, 'RUN', { verbPhrase: { tense: 'future' } }) } } as PhrasePlan, 'el gat menjarà el ratolí quan el gos corri.'],
    ['before the dog runs — abans que + subjunctive', { ...eats(), adverbialClause: { conjunction: 'before', clause: clause(DOG, 'RUN') } } as PhrasePlan, 'el gat menja el ratolí abans que el gos corri.'],
    ['while the dog was running — the imperfect', { ...eats({ tense: 'past' }), adverbialClause: { conjunction: 'while', clause: clause(DOG, 'RUN', { verbPhrase: { tense: 'past' } }) } } as PhrasePlan, 'el gat va menjar el ratolí mentre el gos corria.'],
  ])('%s', (_label, plan, expected) => {
    expect(ca(plan)).toBe(expected);
  });

  test('a UI control is the infinitive (verify: Catalan software often says the imperative)', () => {
    expect(ca(command(YOU, 'SAVE', {}, { imperativeRegister: 'instruction' } as Partial<PhrasePlan>))).toBe('desar.');
  });
});

describe('P03 §2.2: clusters before a vowel', () => {
  test.each<[string, PhrasePlan, string]>([
    ['one loves him — the impersonal es before a vowel-initial verb', clause(ONE, 'LOVE', { directObject: HE }), "se l'estima."],
    ['the cat loves him — l\'', clause(CAT, 'LOVE', { directObject: HE }), "el gat l'estima."],
  ])('%s', (_label, plan, expected) => {
    expect(ca(plan)).toBe(expected);
  });
});

// P03's Out of scope: the weak pronouns *en* and *hi*. A pronoun standing for a place or for a *de*
// complement is written as the tonic pronoun after its preposition; Catalan replaces the phrase with
// *hi* / *en* before the verb.
describe('known gaps: the weak pronouns en and hi (P03 out of scope)', () => {
  const IT = np('THIRD_PERSON', { gender: 'neut' });
  test.fails.each<[string, PhrasePlan, string]>([
    ['the cat is in it — hi', clause(CAT, 'BE', { complements: { locative: { phrase: IT } } }), 'el gat hi és.'],
    ['the cat goes to it — hi', clause(CAT, 'GO', { complements: { direction: { phrase: IT } } }), 'el gat hi va.'],
    ['the cat depends on it — en', clause(CAT, 'DEPEND', { directObject: IT }), 'el gat en depèn.'],
    ['the cat talks about it — en', clause(CAT, 'SPEAK', { complements: { topic: { phrase: IT } } }), 'el gat en parla.'],
  ])('%s', (_label, plan, expected) => {
    expect(ca(plan)).toBe(expected);
  });
});
