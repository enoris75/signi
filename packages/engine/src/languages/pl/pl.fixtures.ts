import type { ConceptForms } from '../../types.js';

// A fixture lexicon for the Polish function-level unit tests (P05-E7): about forty core words in
// exactly the keys of docs/features/P-planning/P05-polish/style-pl.md, as the column
// (packages/backend/src/concepts/pl/) writes them through `concepts/pl/helpers.ts` — whose builders
// are copied below, because the engine never imports the backend. The concept-level flags the
// lexicon adds (`role`, `animate`, `human`, `uncountable`, `stative`, `transitivity`) are written in
// by hand, as `resolved.fixtures.ts` does for the other engines. The sentence suite
// (test/languages/pl.test.ts) runs over the real column instead.

export type Forms = Record<string, string>;

const cells = (list: string, n: number): string[] => {
  const parts = list.split(',').map((s) => s.trim());
  if (parts.length !== n) throw new Error(`pl fixture: expected ${n} forms in "${list}"`);
  return parts;
};

const SG = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'] as const;
const PL = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'] as const;

/** A noun paradigm (helpers.ts `paradigm`); `prefix` `fem_` writes a feminine variant. */
export function paradigm(sg: string, pl?: string, prefix = ''): Forms {
  const key = (k: string) => (prefix === '' ? k : k === 'base' ? prefix.slice(0, -1) : `${prefix}${k}`);
  const out: Forms = {};
  cells(sg, 7).forEach((form, i) => { out[key(SG[i]!)] = form; });
  if (pl !== undefined) cells(pl, 6).forEach((form, i) => { out[key(PL[i]!)] = form; });
  return out;
}

const noun = (gender: string, sg: string, pl?: string, extra: Forms = {}): Forms =>
  ({ role: 'noun', ...paradigm(sg, pl), gender, count: 'singular', ...(pl ? {} : { uncountable: '1' }), ...extra });
const m = (sg: string, pl?: string, extra?: Forms) => noun('masc', sg, pl, extra);
const ma = (sg: string, pl?: string, extra?: Forms) => noun('masc', sg, pl, { animate_acc: '1', animate: '1', ...extra });
const mp = (sg: string, pl?: string, extra?: Forms) => noun('masc', sg, pl, { animate_acc: '1', virile: '1', animate: '1', human: '1', ...extra });
const f = (sg: string, pl?: string, extra?: Forms) => noun('fem', sg, pl, extra);
const n = (sg: string, pl?: string, extra?: Forms) => noun('neut', sg, pl, extra);

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;

interface Aspect { inf: string; nonpast: string; past: string; pastStem?: string; imperative?: string; adverbial?: string; passive?: string }

function aspect(a: Aspect, prefix: '' | 'pf_', tense: 'present' | 'future'): Forms {
  const out: Forms = { [`${prefix}base`]: a.inf };
  cells(a.nonpast, 6).forEach((form, i) => { out[`${prefix}${PERSONS[i]}_${tense}`] = form; });
  const [masc, fem, neut, virile, nonvirile] = cells(a.past, 5);
  Object.assign(out, {
    [`${prefix}past_masc`]: masc, [`${prefix}past_fem`]: fem, [`${prefix}past_neut`]: neut,
    [`${prefix}past_virile`]: virile, [`${prefix}past_nonvirile`]: nonvirile,
  });
  if (a.pastStem) out[`${prefix}past_stem_masc`] = a.pastStem;
  if (a.imperative) {
    const [s2, p1, p2] = cells(a.imperative, 3);
    Object.assign(out, { [`${prefix}2sg_imperative`]: s2, [`${prefix}1pl_imperative`]: p1, [`${prefix}2pl_imperative`]: p2 });
  }
  if (a.adverbial) out[`${prefix}adverbial`] = a.adverbial;
  if (a.passive) {
    const [pm, pv] = cells(a.passive, 2);
    Object.assign(out, { [`${prefix}passive`]: pm, [`${prefix}passive_virile`]: pv });
  }
  return out;
}

/** A verb (helpers.ts `verb`): the imperfective, and the perfective under `pf_` where it has one. */
const verb = (ipf: Aspect, pf?: Aspect, extra: Forms = {}): Forms =>
  ({ role: 'verb', ...aspect(ipf, '', 'present'), ...(pf ? aspect(pf, 'pf_', 'future') : {}), ...extra });

/** An adjective (helpers.ts `adj`). */
const adj = (base: string, virile: string, comparative?: string, extra: Forms = {}): Forms =>
  ({ role: 'adjective', base, virile, ...(comparative ? { comparative } : {}), ...extra });

// ── Nouns ───────────────────────────────────────────────────────────────────

export const KOT: Forms = ma('kot, kota, kotu, kota, kotem, kocie, kocie', 'koty, kotów, kotom, koty, kotami, kotach',
  paradigm('kotka, kotki, kotce, kotkę, kotką, kotce, kotko', 'kotki, kotek, kotkom, kotki, kotkami, kotkach', 'fem_'));
export const PIES: Forms = ma('pies, psa, psu, psa, psem, psie, psie', 'psy, psów, psom, psy, psami, psach');
export const MYSZ: Forms = f('mysz, myszy, myszy, mysz, myszą, myszy, myszy', 'myszy, myszy, myszom, myszy, myszami, myszach', { animate: '1' });
/** A masculine personal noun in -a: virile, but its own accusative is *mężczyznę* (no `animate_acc`). */
export const MEZCZYZNA: Forms = m('mężczyzna, mężczyzny, mężczyźnie, mężczyznę, mężczyzną, mężczyźnie, mężczyzno',
  'mężczyźni, mężczyzn, mężczyznom, mężczyzn, mężczyznami, mężczyznach', { virile: '1', animate: '1', human: '1' });
export const KOBIETA: Forms = f('kobieta, kobiety, kobiecie, kobietę, kobietą, kobiecie, kobieto', 'kobiety, kobiet, kobietom, kobiety, kobietami, kobietach', { animate: '1', human: '1' });
export const DZIECKO: Forms = n('dziecko, dziecka, dziecku, dziecko, dzieckiem, dziecku, dziecko', 'dzieci, dzieci, dzieciom, dzieci, dziećmi, dzieciach', { animate: '1', human: '1' });
export const CHLOPIEC: Forms = mp('chłopiec, chłopca, chłopcu, chłopca, chłopcem, chłopcu, chłopcze', 'chłopcy, chłopców, chłopcom, chłopców, chłopcami, chłopcach');
export const DZIEWCZYNKA: Forms = f('dziewczynka, dziewczynki, dziewczynce, dziewczynkę, dziewczynką, dziewczynce, dziewczynko', 'dziewczynki, dziewczynek, dziewczynkom, dziewczynki, dziewczynkami, dziewczynkach', { animate: '1', human: '1' });
export const DOM: Forms = m('dom, domu, domowi, dom, domem, domu, domu', 'domy, domów, domom, domy, domami, domach');
export const KSIAZKA: Forms = f('książka, książki, książce, książkę, książką, książce, książko', 'książki, książek, książkom, książki, książkami, książkach');
export const JEDZENIE: Forms = n('jedzenie, jedzenia, jedzeniu, jedzenie, jedzeniem, jedzeniu, jedzenie');
export const WODA: Forms = f('woda, wody, wodzie, wodę, wodą, wodzie, wodo');
export const NOZ: Forms = m('nóż, noża, nożowi, nóż, nożem, nożu, nożu', 'noże, noży, nożom, noże, nożami, nożach');
export const KIJ: Forms = m('kij, kija, kijowi, kij, kijem, kiju, kiju', 'kije, kijów, kijom, kije, kijami, kijach');
export const LEGENDA: Forms = f('legenda, legendy, legendzie, legendę, legendą, legendzie, legendo', 'legendy, legend, legendom, legendy, legendami, legendach');
export const SZKOLA: Forms = f('szkoła, szkoły, szkole, szkołę, szkołą, szkole, szkoło', 'szkoły, szkół, szkołom, szkoły, szkołami, szkołach');
export const RADOSC: Forms = f('radość, radości, radości, radość, radością, radości, radości', undefined, { mannerRelation: 'mode' });
/** A plurale tantum: the plural in every singular key too (style-pl.md). */
export const PIENIADZE: Forms = m('pieniądze, pieniędzy, pieniądzom, pieniądze, pieniędzmi, pieniądzach, pieniądze',
  'pieniądze, pieniędzy, pieniądzom, pieniądze, pieniędzmi, pieniądzach', { plurale_tantum: '1' });

// ── Verbs ───────────────────────────────────────────────────────────────────

export const JESC: Forms = verb(
  { inf: 'jeść', nonpast: 'jem, jesz, je, jemy, jecie, jedzą', past: 'jadł, jadła, jadło, jedli, jadły', imperative: 'jedz, jedzmy, jedzcie', adverbial: 'jedząc', passive: 'jedzony, jedzeni' },
  { inf: 'zjeść', nonpast: 'zjem, zjesz, zje, zjemy, zjecie, zjedzą', past: 'zjadł, zjadła, zjadło, zjedli, zjadły', imperative: 'zjedz, zjedzmy, zjedzcie', passive: 'zjedzony, zjedzeni' },
  { transitivity: 'transitive' },
);
export const WIDZIEC: Forms = verb(
  { inf: 'widzieć', nonpast: 'widzę, widzisz, widzi, widzimy, widzicie, widzą', past: 'widział, widziała, widziało, widzieli, widziały', adverbial: 'widząc', passive: 'widziany, widziani' },
  { inf: 'zobaczyć', nonpast: 'zobaczę, zobaczysz, zobaczy, zobaczymy, zobaczycie, zobaczą', past: 'zobaczył, zobaczyła, zobaczyło, zobaczyli, zobaczyły', imperative: 'zobacz, zobaczmy, zobaczcie', passive: 'zobaczony, zobaczeni' },
  { transitivity: 'transitive' },
);
export const BIEC: Forms = verb(
  { inf: 'biec', nonpast: 'biegnę, biegniesz, biegnie, biegniemy, biegniecie, biegną', past: 'biegł, biegła, biegło, biegli, biegły', imperative: 'biegnij, biegnijmy, biegnijcie', adverbial: 'biegnąc' },
  { inf: 'pobiec', nonpast: 'pobiegnę, pobiegniesz, pobiegnie, pobiegniemy, pobiegniecie, pobiegną', past: 'pobiegł, pobiegła, pobiegło, pobiegli, pobiegły', imperative: 'pobiegnij, pobiegnijmy, pobiegnijcie' },
  { transitivity: 'intransitive' },
);
export const ISC: Forms = verb(
  { inf: 'iść', nonpast: 'idę, idziesz, idzie, idziemy, idziecie, idą', past: 'szedł, szła, szło, szli, szły', imperative: 'idź, idźmy, idźcie', adverbial: 'idąc' },
  { inf: 'pójść', nonpast: 'pójdę, pójdziesz, pójdzie, pójdziemy, pójdziecie, pójdą', past: 'poszedł, poszła, poszło, poszli, poszły', imperative: 'pójdź, pójdźmy, pójdźcie' },
);
export const DAWAC: Forms = verb(
  { inf: 'dawać', nonpast: 'daję, dajesz, daje, dajemy, dajecie, dają', past: 'dawał, dawała, dawało, dawali, dawały', imperative: 'dawaj, dawajmy, dawajcie', adverbial: 'dając', passive: 'dawany, dawani' },
  { inf: 'dać', nonpast: 'dam, dasz, da, damy, dacie, dadzą', past: 'dał, dała, dało, dali, dały', imperative: 'daj, dajmy, dajcie', passive: 'dany, dani' },
  { transitivity: 'ditransitive', terminus_case: 'dat' },
);
export const BYC_VERB: Forms = verb(
  { inf: 'być', nonpast: 'jestem, jesteś, jest, jesteśmy, jesteście, są', past: 'był, była, było, byli, były', imperative: 'bądź, bądźmy, bądźcie', adverbial: 'będąc' },
  undefined,
  { '1sg_future': 'będę', '2sg_future': 'będziesz', '3sg_future': 'będzie', '1pl_future': 'będziemy', '2pl_future': 'będziecie', '3pl_future': 'będą', copula: '1', stative: '1' },
);
export const MIEC_VERB: Forms = verb(
  { inf: 'mieć', nonpast: 'mam, masz, ma, mamy, macie, mają', past: 'miał, miała, miało, mieli, miały', imperative: 'miej, miejmy, miejcie', adverbial: 'mając' },
  undefined, { stative: '1', transitivity: 'transitive' },
);
export const STAWAC_SIE: Forms = verb(
  { inf: 'stawać się', nonpast: 'staję, stajesz, staje, stajemy, stajecie, stają', past: 'stawał, stawała, stawało, stawali, stawały', imperative: 'stawaj, stawajmy, stawajcie', adverbial: 'stając' },
  { inf: 'stać się', nonpast: 'stanę, staniesz, stanie, staniemy, staniecie, staną', past: 'stał, stała, stało, stali, stały', imperative: 'stań, stańmy, stańcie' },
  { reflexive: '1' },
);
export const KOCHAC: Forms = verb(
  { inf: 'kochać', nonpast: 'kocham, kochasz, kocha, kochamy, kochacie, kochają', past: 'kochał, kochała, kochało, kochali, kochały', imperative: 'kochaj, kochajmy, kochajcie', adverbial: 'kochając', passive: 'kochany, kochani' },
  undefined, { stative: '1', transitivity: 'transitive' },
);
export const MUSIEC: Forms = verb({ inf: 'musieć', nonpast: 'muszę, musisz, musi, musimy, musicie, muszą', past: 'musiał, musiała, musiało, musieli, musiały' }, undefined, { modal: '1' });
export const MOC: Forms = verb({ inf: 'móc', nonpast: 'mogę, możesz, może, możemy, możecie, mogą', past: 'mógł, mogła, mogło, mogli, mogły', pastStem: 'mogł' }, undefined, { modal: '1' });
export const CHCIEC: Forms = verb({ inf: 'chcieć', nonpast: 'chcę, chcesz, chce, chcemy, chcecie, chcą', past: 'chciał, chciała, chciało, chcieli, chciały' }, undefined, { modal: '1' });
export const POMAGAC: Forms = verb(
  { inf: 'pomagać', nonpast: 'pomagam, pomagasz, pomaga, pomagamy, pomagacie, pomagają', past: 'pomagał, pomagała, pomagało, pomagali, pomagały', imperative: 'pomagaj, pomagajmy, pomagajcie' },
  { inf: 'pomóc', nonpast: 'pomogę, pomożesz, pomoże, pomożemy, pomożecie, pomogą', past: 'pomógł, pomogła, pomogło, pomogli, pomogły', pastStem: 'pomogł', imperative: 'pomóż, pomóżmy, pomóżcie' },
  { object_case: 'dat' },
);
export const CZEKAC: Forms = verb(
  { inf: 'czekać', nonpast: 'czekam, czekasz, czeka, czekamy, czekacie, czekają', past: 'czekał, czekała, czekało, czekali, czekały', imperative: 'czekaj, czekajmy, czekajcie' },
  { inf: 'poczekać', nonpast: 'poczekam, poczekasz, poczeka, poczekamy, poczekacie, poczekają', past: 'poczekał, poczekała, poczekało, poczekali, poczekały', imperative: 'poczekaj, poczekajmy, poczekajcie' },
  { object_prep: 'na', object_prep_case: 'acc' },
);
/** SHOULD, the agreeing defective *powinien* (style-pl.md). */
export const POWINIEN: Forms = {
  ...verb({ inf: 'powinien', nonpast: 'powinienem, powinieneś, powinien, powinniśmy, powinniście, powinni', past: 'powinien był, powinna była, powinno było, powinni byli, powinny były' }),
  present_masc: 'powinien', present_fem: 'powinna', present_neut: 'powinno', present_virile: 'powinni', present_nonvirile: 'powinny',
  present_stem_masc: 'powinien', defective_agreeing: '1', modal: '1',
};

// ── Adjectives ──────────────────────────────────────────────────────────────

export const DUZY: Forms = adj('duży', 'duzi', 'większy');
export const MALY: Forms = adj('mały', 'mali', 'mniejszy');
export const DOBRY: Forms = adj('dobry', 'dobrzy', 'lepszy');
export const SZCZESLIWY: Forms = adj('szczęśliwy', 'szczęśliwi', 'szczęśliwszy');
export const WYSOKI: Forms = adj('wysoki', 'wysocy', 'wyższy');
export const OSTATNI: Forms = adj('ostatni', 'ostatni');
export const SEMANTYCZNY: Forms = adj('semantyczny', 'semantyczni', undefined, { position: 'post' });
export const TEN_SAM: Forms = {
  role: 'adjective', base: 'ten sam', fem: 'ta sama', neut: 'to samo', virile: 'ci sami', nonvirile: 'te same',
  gen: 'tego samego', dat: 'temu samemu', acc: 'ten sam', ins: 'tym samym', loc: 'tym samym',
  fem_gen: 'tej samej', fem_dat: 'tej samej', fem_acc: 'tę samą', fem_ins: 'tą samą', fem_loc: 'tej samej',
  acc_animate: 'tego samego',
};

// ── Adverbs ─────────────────────────────────────────────────────────────────

export const NIGDY: Forms = { role: 'adverb', base: 'nigdy', subtype: 'frequency', polarity: 'negative', interrogative: 'kiedykolwiek' };
export const ZAWSZE: Forms = { role: 'adverb', base: 'zawsze', subtype: 'frequency' };
export const SZYBKO: Forms = { role: 'adverb', base: 'szybko', comparative: 'szybciej', superlative: 'najszybciej' };

// ── Pronouns ────────────────────────────────────────────────────────────────

const cases = (prefix: string, list: string): Forms =>
  Object.fromEntries(cells(list, 5).map((form, i) => [`${prefix}${['gen', 'dat', 'acc', 'ins', 'loc'][i]}`, form]));

export const JA: Forms = {
  role: 'pronoun', base: 'ja', person: '1', number: 'singular', gender: 'masc',
  ...cases('', 'mnie, mnie, mnie, mną, mnie'), dat_short: 'mi', plural: 'my', ...cases('plural_', 'nas, nam, nas, nami, nas'),
};
export const TY: Forms = {
  role: 'pronoun', base: 'ty', person: '2', number: 'singular', gender: 'masc',
  ...cases('', 'ciebie, tobie, ciebie, tobą, tobie'), gen_short: 'cię', dat_short: 'ci', acc_short: 'cię',
  plural: 'wy', ...cases('plural_', 'was, wam, was, wami, was'),
};
export const ON: Forms = {
  role: 'pronoun', base: 'on', person: '3', number: 'singular', gender: 'masc',
  ...cases('', 'jego, jemu, jego, nim, nim'), gen_short: 'go', dat_short: 'mu', acc_short: 'go', ...cases('prep_', 'niego, niemu, niego, nim, nim'),
  singular_fem: 'ona', ...cases('fem_', 'jej, jej, ją, nią, niej'), ...cases('fem_prep_', 'niej, niej, nią, nią, niej'),
  singular_neut: 'ono', ...cases('neut_', 'jego, jemu, je, nim, nim'), neut_gen_short: 'go', neut_dat_short: 'mu', ...cases('neut_prep_', 'niego, niemu, nie, nim, nim'),
  plural: 'oni', ...cases('plural_', 'ich, im, ich, nimi, nich'), ...cases('plural_prep_', 'nich, nim, nich, nimi, nich'),
  plural_fem: 'one', ...cases('plural_fem_', 'ich, im, je, nimi, nich'), ...cases('plural_fem_prep_', 'nich, nim, nie, nimi, nich'),
};
export const SIE: Forms = { role: 'pronoun', base: 'się', person: '3', number: 'singular', gender: 'masc', generic: '1', generic_reflexive: 'człowiek' };
export const COS: Forms = {
  role: 'pronoun', base: 'coś', person: '3', number: 'singular', gender: 'neut', thing: '1', indefinite: '1',
  ...cases('', 'czegoś, czemuś, coś, czymś, czymś'), negative: 'nic', ...cases('negative_', 'niczego, niczemu, nic, niczym, niczym'),
};
export const KTOS: Forms = {
  role: 'pronoun', base: 'ktoś', person: '3', number: 'singular', gender: 'masc', indefinite: '1', human: '1',
  ...cases('', 'kogoś, komuś, kogoś, kimś, kimś'), negative: 'nikt', ...cases('negative_', 'nikogo, nikomu, nikogo, nikim, nikim'),
};

/** The fixture lexicon keyed by concept id, as `LanguageColumn` keys the column. */
export const PL_FIXTURES: Readonly<Record<string, Forms>> = {
  CAT: KOT, DOG: PIES, MOUSE: MYSZ, MAN: MEZCZYZNA, WOMAN: KOBIETA, CHILD: DZIECKO, BOY: CHLOPIEC, GIRL: DZIEWCZYNKA,
  HOUSE: DOM, BOOK: KSIAZKA, FOOD: JEDZENIE, WATER: WODA, STICK: KIJ, LEGEND: LEGENDA, SCHOOL: SZKOLA, JOY: RADOSC, MONEY: PIENIADZE,
  EAT: JESC, SEE: WIDZIEC, RUN: BIEC, GO: ISC, GIVE: DAWAC, BE: BYC_VERB, HAVE: MIEC_VERB, BECOME: STAWAC_SIE, LOVE: KOCHAC,
  MUST: MUSIEC, CAN: MOC, WILL: CHCIEC, HELP_VERB: POMAGAC, WAIT: CZEKAC, SHOULD: POWINIEN,
  BIG: DUZY, SMALL: MALY, GOOD: DOBRY, HAPPY: SZCZESLIWY, HIGH: WYSOKI, LAST_FINAL: OSTATNI, SEMANTIC: SEMANTYCZNY, SAME: TEN_SAM,
  NEVER: NIGDY, ALWAYS: ZAWSZE, FAST: SZYBKO,
  FIRST_PERSON: JA, SECOND_PERSON: TY, THIRD_PERSON: ON, GENERIC_PERSON: SIE, SOMETHING: COS, SOMEONE: KTOS,
};

/** A concept's resolved forms, as the translator hands them to the engine, with extra keys threaded on. */
export const cf = (conceptId: string, extra: Forms = {}): ConceptForms =>
  ({ conceptId, forms: { ...(PL_FIXTURES[conceptId] ?? {}), ...extra } });
