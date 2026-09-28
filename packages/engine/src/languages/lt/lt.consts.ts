import type { CauseSentiment, CoordConjunction, Degree, DimensionRelation, PathSpecifier, SubordinatingConjunction, TemporalRelation } from '@signi/shared';
import type { FocusWords } from '../../functions/withFocus.js';
import type { Case, Government } from './lt.types.js';

// Every Lithuanian word here is drafted from model knowledge and is (verify) until the native review
// (P18-E12), as the column's are (style-lt.md). Standard Lithuanian, VLKK norms, no stress marks.

/** A case without the vocative, which every table here reads as the nominative. */
export type PlainCase = Exclude<Case, 'voc'>;

/**
 * A pronominal paradigm by case, each row `[masc, fem, masc plural, fem plural]`. Lithuanian has no
 * neuter noun, so a genderless head reads the masculine column.
 */
export type PronominalTable = Record<PlainCase, readonly [string, string, string, string]>;

/** *šis, ši* — the demonstrative `this` (P18 §2.1). */
export const SIS: PronominalTable = {
  nom: ['šis', 'ši', 'šie', 'šios'],
  gen: ['šio', 'šios', 'šių', 'šių'],
  dat: ['šiam', 'šiai', 'šiems', 'šioms'],
  acc: ['šį', 'šią', 'šiuos', 'šias'],
  ins: ['šiuo', 'šia', 'šiais', 'šiomis'],
  loc: ['šiame', 'šioje', 'šiuose', 'šiose'],
};

/** *tas, ta* — the demonstrative `that`. */
export const TAS: PronominalTable = {
  nom: ['tas', 'ta', 'tie', 'tos'],
  gen: ['to', 'tos', 'tų', 'tų'],
  dat: ['tam', 'tai', 'tiems', 'toms'],
  acc: ['tą', 'tą', 'tuos', 'tas'],
  ins: ['tuo', 'ta', 'tais', 'tomis'],
  loc: ['tame', 'toje', 'tuose', 'tose'],
};

/** *joks, jokia* — the negative determiner `no`, which also puts *ne-* on the verb (P18 §2.1). */
export const JOKS: PronominalTable = {
  nom: ['joks', 'jokia', 'jokie', 'jokios'],
  gen: ['jokio', 'jokios', 'jokių', 'jokių'],
  dat: ['jokiam', 'jokiai', 'jokiems', 'jokioms'],
  acc: ['jokį', 'jokią', 'jokius', 'jokias'],
  ins: ['jokiu', 'jokia', 'jokiais', 'jokiomis'],
  loc: ['jokiame', 'jokioje', 'jokiuose', 'jokiose'],
};

/** *toks, tokia* — `such`, declined as *joks*. */
export const TOKS: PronominalTable = {
  nom: ['toks', 'tokia', 'tokie', 'tokios'],
  gen: ['tokio', 'tokios', 'tokių', 'tokių'],
  dat: ['tokiam', 'tokiai', 'tokiems', 'tokioms'],
  acc: ['tokį', 'tokią', 'tokius', 'tokias'],
  ins: ['tokiu', 'tokia', 'tokiais', 'tokiomis'],
  loc: ['tokiame', 'tokioje', 'tokiuose', 'tokiose'],
};

/**
 * *visi, visos* — `all` over a plural; over a mass noun the singular *visas, visa* (*visas vanduo*),
 * which the singular columns hold.
 */
export const VISI: PronominalTable = {
  nom: ['visas', 'visa', 'visi', 'visos'],
  gen: ['viso', 'visos', 'visų', 'visų'],
  dat: ['visam', 'visai', 'visiems', 'visoms'],
  acc: ['visą', 'visą', 'visus', 'visas'],
  ins: ['visu', 'visa', 'visais', 'visomis'],
  loc: ['visame', 'visoje', 'visuose', 'visose'],
};

/** *keli, kelios* — `some` / `several` over a count noun, plural only (the singular columns repeat it). */
export const KELI: PronominalTable = {
  nom: ['keli', 'kelios', 'keli', 'kelios'],
  gen: ['kelių', 'kelių', 'kelių', 'kelių'],
  dat: ['keliems', 'kelioms', 'keliems', 'kelioms'],
  acc: ['kelis', 'kelias', 'kelis', 'kelias'],
  ins: ['keliais', 'keliomis', 'keliais', 'keliomis'],
  loc: ['keliuose', 'keliose', 'keliuose', 'keliose'],
};

/** *abu, abi* — `both` (verify the locative *abiejuose / abiejose*). */
export const ABU: PronominalTable = {
  nom: ['abu', 'abi', 'abu', 'abi'],
  gen: ['abiejų', 'abiejų', 'abiejų', 'abiejų'],
  dat: ['abiem', 'abiem', 'abiem', 'abiem'],
  acc: ['abu', 'abi', 'abu', 'abi'],
  ins: ['abiem', 'abiem', 'abiem', 'abiem'],
  loc: ['abiejuose', 'abiejose', 'abiejuose', 'abiejose'],
};

/** *du, dvi* — the numeral two, the noun in the plural of the slot's case. */
export const DU: PronominalTable = {
  nom: ['du', 'dvi', 'du', 'dvi'],
  gen: ['dviejų', 'dviejų', 'dviejų', 'dviejų'],
  dat: ['dviem', 'dviem', 'dviem', 'dviem'],
  acc: ['du', 'dvi', 'du', 'dvi'],
  ins: ['dviem', 'dviem', 'dviem', 'dviem'],
  loc: ['dviejuose', 'dviejose', 'dviejuose', 'dviejose'],
};

/** *trys* — three, one form for both genders. */
export const TRYS: PronominalTable = {
  nom: ['trys', 'trys', 'trys', 'trys'],
  gen: ['trijų', 'trijų', 'trijų', 'trijų'],
  dat: ['trims', 'trims', 'trims', 'trims'],
  acc: ['tris', 'tris', 'tris', 'tris'],
  ins: ['trimis', 'trimis', 'trimis', 'trimis'],
  loc: ['trijuose', 'trijose', 'trijuose', 'trijose'],
};

/** The stems of four to nine, which decline as plural adjectives in *-i / -ios* (*keturi, keturios, keturių*). */
export const I_NUMERALS: Readonly<Record<number, string>> = {
  4: 'ketur', 5: 'penk', 6: 'šeš', 7: 'septyn', 8: 'aštuon', 9: 'devyn',
};

/** The numerals from ten that do not decline and take a genitive plural in every case (verify). */
export const GENITIVE_NUMERALS: Readonly<Record<number, string>> = {
  10: 'dešimt', 11: 'vienuolika', 12: 'dvylika', 13: 'trylika', 14: 'keturiolika', 15: 'penkiolika',
  16: 'šešiolika', 17: 'septyniolika', 18: 'aštuoniolika', 19: 'devyniolika', 20: 'dvidešimt', 30: 'trisdešimt',
  100: 'šimtas',
};

/** *kuris, kuri* — the relative pronoun (P18 §0.5), declined as a pronoun (masculine plural accusative *kuriuos*). */
export const KURIS: PronominalTable = {
  nom: ['kuris', 'kuri', 'kurie', 'kurios'],
  gen: ['kurio', 'kurios', 'kurių', 'kurių'],
  dat: ['kuriam', 'kuriai', 'kuriems', 'kurioms'],
  acc: ['kurį', 'kurią', 'kuriuos', 'kurias'],
  ins: ['kuriuo', 'kuria', 'kuriais', 'kuriomis'],
  loc: ['kuriame', 'kurioje', 'kuriuose', 'kuriose'],
};

/** *kas*, the question pronoun (who and what alike), by case; *kame* is the literary locative (verify). */
export const KAS: Record<PlainCase, string> = { nom: 'kas', gen: 'ko', dat: 'kam', acc: 'ką', ins: 'kuo', loc: 'kame' };

/** The reflexive pronoun *savęs*, one paradigm for every person (the engine's, not stored). */
export const SAVES: Record<Exclude<PlainCase, 'nom'>, string> = { gen: 'savęs', dat: 'sau', acc: 'save', ins: 'savimi', loc: 'savyje' };

/**
 * The quantity words that put their noun in the **genitive** (P18 §2.1), plural for a count noun, and
 * singular for a mass noun: *daug kačių*, *daug vandens*, *mažai kačių*. They do not decline; the verb
 * is 3rd person anyway, so nothing else changes. *pakankamai* is `enough` (verify).
 */
export const GENITIVE_QUANTIFIERS: Readonly<Record<string, string>> = {
  many: 'daug', few: 'mažai', enough: 'pakankamai',
};

/** `some` over a mass noun: *šiek tiek vandens*, the genitive singular (verify). */
export const SOME_MASS = 'šiek tiek';

/** *dauguma* — `most`, a feminine noun over a genitive plural (*dauguma kačių*), by case. */
export const DAUGUMA: Record<PlainCase, string> = {
  nom: 'dauguma', gen: 'daugumos', dat: 'daugumai', acc: 'daugumą', ins: 'dauguma', loc: 'daugumoje',
};

/** *būti*, which the engine conjugates without a lexeme: the resultative, the passive, the copula's negation. */
export const BUTI: Readonly<Record<string, string>> = {
  base: 'būti',
  '1sg_present': 'esu', '2sg_present': 'esi', '3sg_present': 'yra', '1pl_present': 'esame', '2pl_present': 'esate', '3pl_present': 'yra',
  '1sg_past': 'buvau', '2sg_past': 'buvai', '3sg_past': 'buvo', '1pl_past': 'buvome', '2pl_past': 'buvote', '3pl_past': 'buvo',
  '1sg_future': 'būsiu', '2sg_future': 'būsi', '3sg_future': 'bus', '1pl_future': 'būsime', '2pl_future': 'būsite', '3pl_future': 'bus',
  '1sg_frequentative': 'būdavau', '2sg_frequentative': 'būdavai', '3sg_frequentative': 'būdavo',
  '1pl_frequentative': 'būdavome', '2pl_frequentative': 'būdavote', '3pl_frequentative': 'būdavo',
  '1sg_conditional': 'būčiau', '2sg_conditional': 'būtum', '3sg_conditional': 'būtų',
  '1pl_conditional': 'būtume', '2pl_conditional': 'būtumėte', '3pl_conditional': 'būtų',
  '2sg_imperative': 'būk', '1pl_imperative': 'būkime', '2pl_imperative': 'būkite',
};

/**
 * *ruoštis* in the past, bare (the engine adds *-si*, `verbWord`), for the prospective past
 * (*ruošėsi suvalgyti*, "was about to eat") (verify: *ketino* is the other candidate).
 */
export const RUOSTIS_PAST: Readonly<Record<string, string>> = {
  '1sg': 'ruošiau', '2sg': 'ruošei', '3sg': 'ruošė', '1pl': 'ruošėme', '2pl': 'ruošėte', '3pl': 'ruošė',
};

/**
 * The adverbs that make the verb imperfective in any tense (P18 §0.3, P05 §0.3): the ones that say how
 * often or how long (*visada valgo*, *niekada nevalgė*). *jau* (already) and *ką tik* (just) say that
 * it is done, and keep the perfective (*jau suvalgė*) (verify).
 */
export const ITERATIVE_ADVERBS: ReadonlySet<string> = new Set(['ALWAYS', 'OFTEN', 'NEVER', 'STILL', 'REPEATEDLY', 'NO_LONGER', 'SOMETIMES', 'USUALLY']);

/**
 * The adverbs that put a past verb in the **frequentative past** (P18 §0.3): *visada valgydavo*, *dažnai
 * valgydavo*. A negative one keeps the simple past (*niekada nevalgė*), which is as usual (verify).
 */
export const FREQUENTATIVE_ADVERBS: ReadonlySet<string> = new Set(['ALWAYS', 'OFTEN', 'REPEATEDLY', 'SOMETIMES', 'USUALLY']);

/** The word before a prospective (P18 §0.3): *tuoj suvalgys*, "is about to eat". */
export const PROSPECTIVE = 'tuoj';

/** The words for the degree of an adjective without a synthetic one (P18 §2.1). */
export const LT_DEGREE: Record<Degree, string> = {
  positive: '', more: 'labiau', most: 'labiausiai', less: 'mažiau', least: 'mažiausiai', equally: 'taip pat',
};

/** The equative's first half once a standard follows: *toks pat didelis kaip šuo* reads *taip pat* here (verify). */
export const LT_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'taip pat' };

/** The word before a standard of comparison, which stays in the nominative (*didesnis nei šuo*) (verify: *už* + acc). */
export const LT_STANDARD: Partial<Record<Degree, string>> = { more: 'nei', less: 'nei', equally: 'kaip' };

/** The superlative's set: *iš* + genitive (*didžiausias iš kačių*). */
export const LT_DOMAIN: Government = { prep: 'iš', case: 'gen' };

/** The clause conjunctions (P18 §2.3). *bet*, *tačiau*, *todėl*, *tai yra*, *o paskui* take a comma; *ir*, *arba* none. */
export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'ir', or: 'arba', but: 'bet', that_is: 'tai yra', therefore: 'todėl', then: 'o paskui', however: 'tačiau',
};

/** The conjunctions a comma precedes when they join two clauses. */
export const COMMA_CONJUNCTIONS: ReadonlySet<CoordConjunction> = new Set(['but', 'that_is', 'therefore', 'then', 'however']);

/** "both … and": *ir … , ir* (*ir katė, ir šuo*). */
export const CORRELATIVE_PAIR: readonly [string, string] = ['ir', 'ir'];

/**
 * The subordinating conjunctions, each taking the indicative, the clause set off by a comma. *while*
 * is *kol* (verify: *tuo metu, kai*), *until* *kol* too, which Lithuanian uses for both (verify).
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'kai', while: 'kol', because: 'nes', after: 'po to, kai', before: 'prieš tai, kai',
  until: 'kol', since: 'nuo tada, kai', though: 'nors', as: 'kaip',
};

/** The object clause's complementizers: *kad* (that) and *ar* (whether). */
export const THAT = 'kad';
export const WHETHER = 'ar';

/** The yes/no question particle (*ar katė valgo pelę?*). */
export const QUESTION_PARTICLE = 'ar';

/** The if-word of a hypothetical condition (*jei šuo bėgtų*, P18 §2.4). */
export const IF_WORD = 'jei';

/** The purpose clause's connector: *kad* + the conditional (*spausk, kad pakeistum*) (verify). */
export const PURPOSE_WORD = 'kad';

/** The negator prefix, written together with the verb (*nevalgo*, P18 §2.2). */
export const NE = 'ne';

/** *ne* as a separate word: a constituent negator (*ne dėl šuns*). */
export const CONSTITUENT_NEGATOR = 'ne';

/** The focus particles (C39): *tik katė*, *net katė*, *katė irgi* (verify). */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'tik' }, even: { word: 'net' }, also: { word: 'irgi', post: true },
};

/** The examples relation (P09-E33): *kaip katė* (such as), *įskaitant katę* (including, + accusative). */
export const LT_EXAMPLES: Record<'example' | 'inclusion', Government> = {
  example: { prep: 'kaip', case: 'nom' }, inclusion: { prep: 'įskaitant', case: 'acc' },
};

/**
 * A place (P18 §2.3): plain "in" is the **bare locative** (*namuose*); *ant* + gen (on), *po* + ins
 * (under), *virš* + gen (over), *už* + gen (behind), *prieš* + acc (in front of), *aplink* + acc
 * (around), *per* + acc (through), *tarp* + gen (between, among), *prie* + gen (against, by).
 */
export const PLACE: Record<PathSpecifier, Government> = {
  in: { prep: '', case: 'loc' }, on: { prep: 'ant', case: 'gen' }, under: { prep: 'po', case: 'ins' },
  over: { prep: 'virš', case: 'gen' }, behind: { prep: 'už', case: 'gen' }, in_front_of: { prep: 'prieš', case: 'acc' },
  around: { prep: 'aplink', case: 'acc' }, through: { prep: 'per', case: 'acc' }, between: { prep: 'tarp', case: 'gen' },
  against: { prep: 'prie', case: 'gen' }, among: { prep: 'tarp', case: 'gen' },
  // A02: the distance pair, both with the genitive — *netoli namo*, *toli nuo namo* (verify).
  near: { prep: 'netoli', case: 'gen' }, far: { prep: 'toli nuo', case: 'gen' },
};

/**
 * A goal (P18 §2.3): the plain one is *į* + acc (*į namus*), to a person *pas* + acc (*pas vaiką*); a
 * relation takes its own: *ant* + gen (onto), *po* + acc (under, of motion, verify), *už* + gen, *į* +
 * acc against (*į sieną*).
 */
export const GOAL: Record<PathSpecifier, Government> = {
  in: { prep: 'į', case: 'acc' }, on: { prep: 'ant', case: 'gen' }, under: { prep: 'po', case: 'acc' },
  over: { prep: 'virš', case: 'gen' }, behind: { prep: 'už', case: 'gen' }, in_front_of: { prep: 'prieš', case: 'acc' },
  around: { prep: 'aplink', case: 'acc' }, through: { prep: 'per', case: 'acc' }, between: { prep: 'tarp', case: 'gen' },
  against: { prep: 'į', case: 'acc' }, among: { prep: 'tarp', case: 'gen' },
  near: { prep: 'netoli', case: 'gen' }, far: { prep: 'toli nuo', case: 'gen' },
};

/** The plain goal (*į namus*), and the goal that is a person (*pas vaiką*, verify). */
export const PLAIN_GOAL: Government = { prep: 'į', case: 'acc' };
export const PERSON_GOAL: Government = { prep: 'pas', case: 'acc' };

/**
 * A source (P18 §2.3): *nuo* + gen (away from: *nuo namų*); out of *iš* + gen (*iš namų*); a relation
 * compounds with *iš* (*iš po stalo*, *iš už namo*, *iš tarp medžių*).
 */
export const PLAIN_SOURCE: Government = { prep: 'nuo', case: 'gen' };
export const SOURCE: Record<PathSpecifier, Government> = {
  in: { prep: 'iš', case: 'gen' }, on: { prep: 'nuo', case: 'gen' }, under: { prep: 'iš po', case: 'gen' },
  over: { prep: 'nuo', case: 'gen' }, behind: { prep: 'iš už', case: 'gen' }, in_front_of: { prep: 'nuo', case: 'gen' },
  around: { prep: 'nuo', case: 'gen' }, through: { prep: 'per', case: 'acc' }, between: { prep: 'iš tarp', case: 'gen' },
  against: { prep: 'nuo', case: 'gen' }, among: { prep: 'iš', case: 'gen' },
  near: { prep: 'nuo', case: 'gen' }, far: { prep: 'nuo', case: 'gen' },
};

/**
 * The cause by sentiment (P18 §2.3): *dėl* + gen, and for the fault too; *dėka*, the **postposition**
 * (*draugo dėka*), for thanks to.
 */
export const CAUSE: Record<CauseSentiment, Government> = {
  neutral: { prep: 'dėl', case: 'gen' }, positive: { prep: 'dėka', case: 'gen', post: true }, negative: { prep: 'dėl', case: 'gen' },
};

/**
 * A time (C29): `at` is the bare accusative (*pirmadienį, vasarą*) unless the noun names its own
 * (`temporal_prep`, `temporal_case`) (verify); *prieš* + acc (ago: *prieš valandą*; before), *iki* +
 * gen (until), *po* + gen (after), *per* + acc (during, within), *tarp* + gen, *nuo* + gen (since),
 * the bare accusative for a duration (*valandą*, verify).
 */
export const TEMPORAL: Record<TemporalRelation, Government> = {
  at: { prep: '', case: 'acc' }, ago: { prep: 'prieš', case: 'acc' }, until: { prep: 'iki', case: 'gen' },
  after: { prep: 'po', case: 'gen' }, before: { prep: 'prieš', case: 'acc' }, during: { prep: 'per', case: 'acc' },
  between: { prep: 'tarp', case: 'gen' }, since: { prep: 'nuo', case: 'gen' }, within: { prep: 'per', case: 'acc' },
  for: { prep: '', case: 'acc' },
};

/**
 * The complements with one fixed government (P18 §2.3); a verb may name its own (`topic_prep`,
 * `terminus_case`, …). The beneficiary purpose is the bare dative (*maistas katei*, verify).
 */
export const COMPLEMENT_GOVERNMENT: Readonly<Partial<Record<string, Government>>> = {
  comitative: { prep: 'su', case: 'ins' },
  opponent: { prep: 'su', case: 'ins' },
  purpose: { prep: '', case: 'dat' },
  topic: { prep: 'apie', case: 'acc' },
  role: { prep: 'kaip', case: 'nom' },
  terminus: { prep: '', case: 'dat' },
  instrumental: { prep: '', case: 'ins' },
};

/** The privative (P09-E2): *be* + genitive. */
export const PRIVATIVE: Government = { prep: 'be', case: 'gen' };

/** The passive's agent: the bare genitive (*pelė suvalgyta katės*, P18 §2.1). */
export const AGENT: Government = { prep: '', case: 'gen' };

/** How each dimension noun enters an adjective gloss: the bare genitive of quality (*didelio dydžio*, verify). */
export const LT_DIM_PREP: Record<DimensionRelation, Government> = {
  extent: { prep: '', case: 'gen' }, quality: { prep: '', case: 'gen' }, measure: { prep: '', case: 'gen' },
};

/**
 * A manner noun by its relation (P18 §2.3): *kaip vanduo* (likeness), *su džiaugsmu* (mode), the bare
 * instrumental for the means and the measure (*dideliu greičiu*, verify).
 */
export const MANNER: Record<'similative' | 'means' | 'measure' | 'mode', Government> = {
  similative: { prep: 'kaip', case: 'nom' }, means: { prep: '', case: 'ins' }, measure: { prep: '', case: 'ins' }, mode: { prep: 'su', case: 'ins' },
};

/** The question adverbs (P09-E6). */
export const QUESTION_ADVERBS: Record<'where' | 'how' | 'why' | 'whereTo' | 'whereFrom' | 'when' | 'untilWhen', string> = {
  where: 'kur', how: 'kaip', why: 'kodėl', whereTo: 'kur', whereFrom: 'iš kur', when: 'kada', untilWhen: 'iki kada',
};

/** The relative adverb of a plain place: *namas, kur katė valgo* (C07). */
export const WHERE = 'kur';

/** The possessive a question asks for (*kieno*, indeclinable). */
export const WHOSE = 'kieno';

/** The 3rd-person imperative's particle, before the present (*tegul suvalgo*) (verify). */
export const TEGUL = 'tegul';
