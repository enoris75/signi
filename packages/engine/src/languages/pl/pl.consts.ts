import type { CauseSentiment, CoordConjunction, Degree, DimensionRelation, PathSpecifier, SubordinatingConjunction, TemporalRelation } from '@signi/shared';
import type { FocusWords } from '../../functions/withFocus.js';
import type { Case, Government } from './pl.types.js';

// Every Polish word here is drafted from model knowledge and is (verify) until the native review
// (P05-E11), as the column's are (style-pl.md).

/**
 * A pronominal paradigm by case, each row `[masc, fem, neut, virile, non-virile]`. The masculine
 * accusative is the inanimate one; an animate masculine takes the genitive (`pronominalForm`).
 */
export type PronominalTable = Record<Exclude<Case, 'voc'>, readonly [string, string, string, string, string]>;

/** *ten, ta, to, ci, te* — the demonstrative `this` (P05 §0.4). The feminine accusative is *tę*. */
export const TEN: PronominalTable = {
  nom: ['ten', 'ta', 'to', 'ci', 'te'],
  gen: ['tego', 'tej', 'tego', 'tych', 'tych'],
  dat: ['temu', 'tej', 'temu', 'tym', 'tym'],
  acc: ['ten', 'tę', 'to', 'tych', 'te'],
  ins: ['tym', 'tą', 'tym', 'tymi', 'tymi'],
  loc: ['tym', 'tej', 'tym', 'tych', 'tych'],
};

/** *tamten* — the demonstrative `that`: *ten* behind *tam-*, but the feminine accusative is *tamtą*. */
export const TAMTEN: PronominalTable = {
  nom: ['tamten', 'tamta', 'tamto', 'tamci', 'tamte'],
  gen: ['tamtego', 'tamtej', 'tamtego', 'tamtych', 'tamtych'],
  dat: ['tamtemu', 'tamtej', 'tamtemu', 'tamtym', 'tamtym'],
  acc: ['tamten', 'tamtą', 'tamto', 'tamtych', 'tamte'],
  ins: ['tamtym', 'tamtą', 'tamtym', 'tamtymi', 'tamtymi'],
  loc: ['tamtym', 'tamtej', 'tamtym', 'tamtych', 'tamtych'],
};

/** *żaden* — the negative determiner `no`, which also puts *nie* on the verb (P05 §0.4). */
export const ZADEN: PronominalTable = {
  nom: ['żaden', 'żadna', 'żadne', 'żadni', 'żadne'],
  gen: ['żadnego', 'żadnej', 'żadnego', 'żadnych', 'żadnych'],
  dat: ['żadnemu', 'żadnej', 'żadnemu', 'żadnym', 'żadnym'],
  acc: ['żaden', 'żadną', 'żadne', 'żadnych', 'żadne'],
  ins: ['żadnym', 'żadną', 'żadnym', 'żadnymi', 'żadnymi'],
  loc: ['żadnym', 'żadnej', 'żadnym', 'żadnych', 'żadnych'],
};

/** *jeden* — the numeral one, declined as a pronominal adjective. */
export const JEDEN: PronominalTable = {
  nom: ['jeden', 'jedna', 'jedno', 'jedni', 'jedne'],
  gen: ['jednego', 'jednej', 'jednego', 'jednych', 'jednych'],
  dat: ['jednemu', 'jednej', 'jednemu', 'jednym', 'jednym'],
  acc: ['jeden', 'jedną', 'jedno', 'jednych', 'jedne'],
  ins: ['jednym', 'jedną', 'jednym', 'jednymi', 'jednymi'],
  loc: ['jednym', 'jednej', 'jednym', 'jednych', 'jednych'],
};

/** *wszyscy / wszystkie* — `all` over a plural; the singular (a mass noun) is *cały*, declined by rule. */
export const WSZYSCY: PronominalTable = {
  nom: ['cały', 'cała', 'całe', 'wszyscy', 'wszystkie'],
  gen: ['całego', 'całej', 'całego', 'wszystkich', 'wszystkich'],
  dat: ['całemu', 'całej', 'całemu', 'wszystkim', 'wszystkim'],
  acc: ['cały', 'całą', 'całe', 'wszystkich', 'wszystkie'],
  ins: ['całym', 'całą', 'całym', 'wszystkimi', 'wszystkimi'],
  loc: ['całym', 'całej', 'całym', 'wszystkich', 'wszystkich'],
};

/**
 * *oba / obie / obaj* — `both`. The virile nominative is *obaj*, and its accusative the genitive
 * *obu*; the oblique cases are one word (*obu*, instrumental *oboma / obiema*) (verify).
 */
export const OBA: PronominalTable = {
  nom: ['oba', 'obie', 'oba', 'obaj', 'oba'],
  gen: ['obu', 'obu', 'obu', 'obu', 'obu'],
  dat: ['obu', 'obu', 'obu', 'obu', 'obu'],
  acc: ['oba', 'obie', 'oba', 'obu', 'oba'],
  ins: ['oboma', 'obiema', 'oboma', 'oboma', 'oboma'],
  loc: ['obu', 'obu', 'obu', 'obu', 'obu'],
};

/** *kto* and *co*, the question pronouns, by case. */
export const KTO: Record<Exclude<Case, 'voc'>, string> = { nom: 'kto', gen: 'kogo', dat: 'komu', acc: 'kogo', ins: 'kim', loc: 'kim' };
export const CO: Record<Exclude<Case, 'voc'>, string> = { nom: 'co', gen: 'czego', dat: 'czemu', acc: 'co', ins: 'czym', loc: 'czym' };

/** The reflexive pronoun *siebie*, one paradigm for every person (style-pl.md: the engine's, not stored). */
export const SIEBIE: Record<Exclude<Case, 'voc' | 'nom'>, string> = { gen: 'siebie', dat: 'sobie', acc: 'siebie', ins: 'sobą', loc: 'sobie' };

/**
 * The quantifiers that govern the genitive (P05 §0.4): in the nominative and accusative the word
 * stands before a genitive plural (*kilka kotów*, *wiele kotów*, virile *kilku chłopców*), and in
 * every other case it declines and the noun takes that case (*z kilkoma kotami*). `mass` is the word a
 * mass noun takes, always before its genitive singular (*trochę wody*, *dużo wody*).
 */
export interface Quantifier {
  nom: string;
  virile: string;
  oblique: string;
  ins: string;
  mass: string;
}

export const QUANTIFIERS: Readonly<Record<string, Quantifier>> = {
  some: { nom: 'kilka', virile: 'kilku', oblique: 'kilku', ins: 'kilkoma', mass: 'trochę' },
  several: { nom: 'kilka', virile: 'kilku', oblique: 'kilku', ins: 'kilkoma', mass: 'trochę' },
  many: { nom: 'wiele', virile: 'wielu', oblique: 'wielu', ins: 'wieloma', mass: 'dużo' },
  // *mało* does not decline; the oblique cases take *niewielu* (verify).
  few: { nom: 'mało', virile: 'mało', oblique: 'niewielu', ins: 'niewieloma', mass: 'mało' },
  // *dość* stays as it is (verify).
  enough: { nom: 'dość', virile: 'dość', oblique: 'dość', ins: 'dość', mass: 'dość' },
};

/** *większość* — `most`, a feminine noun over a genitive plural (*większość kotów*), by case. */
export const WIEKSZOSC: Record<Exclude<Case, 'voc'>, string> = {
  nom: 'większość', gen: 'większości', dat: 'większości', acc: 'większość', ins: 'większością', loc: 'większości',
};

/**
 * The cardinals (C31) as far as the plan counts: `nom` over a nominative plural (2–4) or a genitive
 * plural (5 and up), `virile` the masculine-personal form over a genitive plural (*dwóch chłopców*),
 * `oblique` the genitive/locative, `dat`, `ins`. One is *jeden*, declined apart (`JEDEN`).
 */
export interface Cardinal {
  nom: string;
  fem?: string;
  virile: string;
  oblique: string;
  dat: string;
  ins: string;
  femIns?: string;
  /** 2–4 (and 22–24): the noun stays in the nominative plural and the verb agrees in the plural. */
  small?: boolean;
}

export const CARDINALS: Readonly<Record<number, Cardinal>> = {
  2: { nom: 'dwa', fem: 'dwie', virile: 'dwóch', oblique: 'dwóch', dat: 'dwóm', ins: 'dwoma', femIns: 'dwiema', small: true },
  3: { nom: 'trzy', virile: 'trzech', oblique: 'trzech', dat: 'trzem', ins: 'trzema', small: true },
  4: { nom: 'cztery', virile: 'czterech', oblique: 'czterech', dat: 'czterem', ins: 'czterema', small: true },
  5: { nom: 'pięć', virile: 'pięciu', oblique: 'pięciu', dat: 'pięciu', ins: 'pięcioma' },
  6: { nom: 'sześć', virile: 'sześciu', oblique: 'sześciu', dat: 'sześciu', ins: 'sześcioma' },
  7: { nom: 'siedem', virile: 'siedmiu', oblique: 'siedmiu', dat: 'siedmiu', ins: 'siedmioma' },
  8: { nom: 'osiem', virile: 'ośmiu', oblique: 'ośmiu', dat: 'ośmiu', ins: 'ośmioma' },
  9: { nom: 'dziewięć', virile: 'dziewięciu', oblique: 'dziewięciu', dat: 'dziewięciu', ins: 'dziewięcioma' },
  10: { nom: 'dziesięć', virile: 'dziesięciu', oblique: 'dziesięciu', dat: 'dziesięciu', ins: 'dziesięcioma' },
  11: { nom: 'jedenaście', virile: 'jedenastu', oblique: 'jedenastu', dat: 'jedenastu', ins: 'jedenastoma' },
  12: { nom: 'dwanaście', virile: 'dwunastu', oblique: 'dwunastu', dat: 'dwunastu', ins: 'dwunastoma' },
  // The last digit governs: 24 counts as 4 (*dwadzieścia cztery koty*) (verify).
  24: {
    nom: 'dwadzieścia cztery', virile: 'dwudziestu czterech', oblique: 'dwudziestu czterech', dat: 'dwudziestu czterem',
    ins: 'dwudziestoma czterema', small: true,
  },
};

/** *być*'s future, what the imperfective future is built on (*będzie jadł*); the column stores the same under BE. */
export const BEDE: Readonly<Record<string, string>> = {
  '1sg': 'będę', '2sg': 'będziesz', '3sg': 'będzie', '1pl': 'będziemy', '2pl': 'będziecie', '3pl': 'będą',
};

/** *być*'s present, for the passive (*jest zjadana*) whatever verb the clause holds. */
export const JESTEM: Readonly<Record<string, string>> = {
  '1sg': 'jestem', '2sg': 'jesteś', '3sg': 'jest', '1pl': 'jesteśmy', '2pl': 'jesteście', '3pl': 'są',
};

/** A verb the engine conjugates without a lexeme: the *l*-participle and the non-past it needs. */
export const BYC: Readonly<Record<string, string>> = {
  base: 'być', past_masc: 'był', past_fem: 'była', past_neut: 'było', past_virile: 'byli', past_nonvirile: 'były',
  '1sg_present': 'jestem', '2sg_present': 'jesteś', '3sg_present': 'jest', '1pl_present': 'jesteśmy', '2pl_present': 'jesteście', '3pl_present': 'są',
  '1sg_future': 'będę', '2sg_future': 'będziesz', '3sg_future': 'będzie', '1pl_future': 'będziemy', '2pl_future': 'będziecie', '3pl_future': 'będą',
};

/**
 * *zostać*, the perfective passive auxiliary (*mysz została zjedzona*): the passive's past and future,
 * where *być* would say a state (verify). Perfective only, so its non-past is the future.
 */
export const ZOSTAC: Readonly<Record<string, string>> = {
  base: 'zostać', pf_base: 'zostać',
  pf_past_masc: 'został', pf_past_fem: 'została', pf_past_neut: 'zostało', pf_past_virile: 'zostali', pf_past_nonvirile: 'zostały',
  'pf_1sg_future': 'zostanę', 'pf_2sg_future': 'zostaniesz', 'pf_3sg_future': 'zostanie',
  'pf_1pl_future': 'zostaniemy', 'pf_2pl_future': 'zostaniecie', 'pf_3pl_future': 'zostaną',
  past_masc: 'zostawał', past_fem: 'zostawała', past_neut: 'zostawało', past_virile: 'zostawali', past_nonvirile: 'zostawały',
  '1sg_present': 'zostaję', '2sg_present': 'zostajesz', '3sg_present': 'zostaje', '1pl_present': 'zostajemy', '2pl_present': 'zostajecie', '3pl_present': 'zostają',
};

/** *mieć*, for the prospective past (*miał zaraz zjeść*, "was about to eat") (verify). */
export const MIEC: Readonly<Record<string, string>> = {
  base: 'mieć', past_masc: 'miał', past_fem: 'miała', past_neut: 'miało', past_virile: 'mieli', past_nonvirile: 'miały',
  '1sg_present': 'mam', '2sg_present': 'masz', '3sg_present': 'ma', '1pl_present': 'mamy', '2pl_present': 'macie', '3pl_present': 'mają',
};

/** The existential's negation: *nie ma* + genitive, whatever the pivot (*nie ma kota*, *nie było kotów*). */
export const NIE_MA: Readonly<Record<'present' | 'past' | 'future', string>> = { present: 'nie ma', past: 'nie było', future: 'nie będzie' };

/**
 * The adverbs that make the verb imperfective in any tense (P05 §0.3, "with a frequency adverb"): the
 * ones that say how often or how long (*zawsze je*, *nigdy nie jadł*, *często jadł*). Not every
 * `subtype: 'frequency'` adverb: *już* (already) and *właśnie* (just) say that it is done, and keep the
 * perfective (*już zjadł*) (verify).
 */
export const ITERATIVE_ADVERBS: ReadonlySet<string> = new Set(['ALWAYS', 'OFTEN', 'NEVER', 'STILL', 'REPEATEDLY', 'NO_LONGER']);

/** The word before a prospective (P05 §0.3): *zaraz zje*, "is about to eat". */
export const PROSPECTIVE = 'zaraz';

/** The person endings on the *l*-participle (*zjadł-em, zjadła-ś, zjedli-śmy*), and on *by* and *gdyby*. */
export const PAST_ENDINGS: Readonly<Record<string, string>> = { '1sg': 'm', '2sg': 'ś', '3sg': '', '1pl': 'śmy', '2pl': 'ście', '3pl': '' };

/** The words for the degree of an adjective without a synthetic comparative (P05 §2.1). */
export const PL_DEGREE: Record<Degree, string> = {
  positive: '', more: 'bardziej', most: 'najbardziej', less: 'mniej', least: 'najmniej', equally: 'równie',
};

/** The equative's first half once a standard follows: *tak duży jak pies* (P09-E5). */
export const PL_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'tak' };

/** The word before a standard of comparison, which stays in the nominative (*większy niż pies*). */
export const PL_STANDARD: Partial<Record<Degree, string>> = { more: 'niż', less: 'niż', equally: 'jak' };

/** The superlative's set: *z* + genitive (*największy z kotów*). */
export const PL_DOMAIN: Government = { prep: 'z', case: 'gen' };

/** The clause conjunctions. *ale*, *więc*, *jednak*, *to znaczy* and *a potem* take a comma before them; *i*, *lub* none. */
export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'i', or: 'lub', but: 'ale', that_is: 'to znaczy', therefore: 'więc', then: 'a potem', however: 'jednak',
};

/** The conjunctions a comma precedes when they join two clauses (Polish punctuation). */
export const COMMA_CONJUNCTIONS: ReadonlySet<CoordConjunction> = new Set(['but', 'that_is', 'therefore', 'then', 'however']);

/** "both … and": *zarówno … jak i* (P09-E46). */
export const CORRELATIVE_PAIR: readonly [string, string] = ['zarówno', 'jak i'];

/**
 * The subordinating conjunctions (P09-E4). Polish has no subjunctive: every one takes the indicative,
 * and the clause is set off by a comma. *until* is *aż* (*aż kot zje*), which needs no *nie*.
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'kiedy', while: 'podczas gdy', because: 'ponieważ', after: 'po tym, jak', before: 'zanim',
  until: 'aż', since: 'odkąd', though: 'chociaż', as: 'jak',
};

/** The object clause's complementizers: *że* (that) and *czy* (whether). */
export const THAT = 'że';
export const WHETHER = 'czy';

/** The yes/no question particle (*czy kot je mysz?*). */
export const QUESTION_PARTICLE = 'czy';

/** The if-word of a hypothetical condition, which carries the person ending (*gdybym zjadł*). */
export const IF_WORD = 'gdyby';

/** The purpose clause's connector: *żeby* + infinitive (*kliknij, żeby zmienić*). */
export const PURPOSE_WORD = 'żeby';

/** The negator. */
export const NIE = 'nie';

/** The focus particles (C39): *tylko kot*, *nawet kot*, *kot też*. */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'tylko' }, even: { word: 'nawet' }, also: { word: 'też', post: true },
};

/** The examples relation (P09-E33): *jak kot* (such as), *w tym kot* (including). */
export const PL_EXAMPLES: Record<'example' | 'inclusion', string> = { example: 'jak', inclusion: 'w tym' };

/** A place (P05 §2.3): *w domu*, *na domu*, *pod domem*, *za domem*, *przed domem*, *wokół domu*. */
export const PLACE: Record<PathSpecifier, Government> = {
  in: { prep: 'w', case: 'loc' }, on: { prep: 'na', case: 'loc' }, under: { prep: 'pod', case: 'ins' },
  over: { prep: 'nad', case: 'ins' }, behind: { prep: 'za', case: 'ins' }, in_front_of: { prep: 'przed', case: 'ins' },
  around: { prep: 'wokół', case: 'gen' }, through: { prep: 'przez', case: 'acc' }, between: { prep: 'między', case: 'ins' },
  // *przy ścianie* (by, touching) for the static contact (verify); *wśród* + genitive for among.
  against: { prep: 'przy', case: 'loc' }, among: { prep: 'wśród', case: 'gen' },
};

/**
 * A goal (P05 §2.3): the plain one is *do* + genitive (*do domu*, *do dziecka*); a relation is its
 * preposition with the accusative of motion (*pod dom*, *na dom*, *za dom*), *wokół* keeping the genitive.
 */
export const GOAL: Record<PathSpecifier, Government> = {
  in: { prep: 'do', case: 'gen' }, on: { prep: 'na', case: 'acc' }, under: { prep: 'pod', case: 'acc' },
  over: { prep: 'nad', case: 'acc' }, behind: { prep: 'za', case: 'acc' }, in_front_of: { prep: 'przed', case: 'acc' },
  around: { prep: 'wokół', case: 'gen' }, through: { prep: 'przez', case: 'acc' }, between: { prep: 'między', case: 'acc' },
  against: { prep: 'o', case: 'acc' }, among: { prep: 'między', case: 'acc' },
};

/** The plain goal (*do domu*). */
export const PLAIN_GOAL: Government = { prep: 'do', case: 'gen' };

/** A source (P05 §2.3): *od* + genitive (*od domu*); a relation fuses with *z* (*spod domu*, *zza domu*). */
export const PLAIN_SOURCE: Government = { prep: 'od', case: 'gen' };
export const SOURCE: Record<PathSpecifier, Government> = {
  in: { prep: 'z', case: 'gen' }, on: { prep: 'z', case: 'gen' }, under: { prep: 'spod', case: 'gen' },
  over: { prep: 'znad', case: 'gen' }, behind: { prep: 'zza', case: 'gen' }, in_front_of: { prep: 'sprzed', case: 'gen' },
  around: { prep: 'od', case: 'gen' }, through: { prep: 'przez', case: 'acc' }, between: { prep: 'spomiędzy', case: 'gen' },
  against: { prep: 'od', case: 'gen' }, among: { prep: 'spośród', case: 'gen' },
};

/** The cause by sentiment (P05 §2.3): *z powodu* + gen, *dzięki* + dat, *przez* + acc (fault). */
export const CAUSE: Record<CauseSentiment, Government> = {
  neutral: { prep: 'z powodu', case: 'gen' }, positive: { prep: 'dzięki', case: 'dat' }, negative: { prep: 'przez', case: 'acc' },
};

/**
 * A time (C29): *do* + gen (until), *po* + loc (after), *przed* + ins (before), *podczas* + gen,
 * *między* + ins, *od* + gen (since), *w ciągu* + gen (within), *przez* + acc (for). *temu* follows
 * its accusative (*chwilę temu*). `at` is the lexeme's `temporal_prep`, else *w* + locative.
 */
export const TEMPORAL: Record<TemporalRelation, Government & { post?: boolean }> = {
  at: { prep: 'w', case: 'loc' }, ago: { prep: 'temu', case: 'acc', post: true }, until: { prep: 'do', case: 'gen' },
  after: { prep: 'po', case: 'loc' }, before: { prep: 'przed', case: 'ins' }, during: { prep: 'podczas', case: 'gen' },
  between: { prep: 'między', case: 'ins' }, since: { prep: 'od', case: 'gen' }, within: { prep: 'w ciągu', case: 'gen' },
  for: { prep: 'przez', case: 'acc' },
};

/** The complements with one fixed government (P05 §2.3); a verb may name its own (`topic_prep`, `opponent_prep`). */
export const COMPLEMENT_GOVERNMENT: Readonly<Partial<Record<string, Government>>> = {
  comitative: { prep: 'z', case: 'ins' },
  opponent: { prep: 'z', case: 'ins' },
  purpose: { prep: 'dla', case: 'gen' },
  topic: { prep: 'o', case: 'loc' },
  role: { prep: 'jako', case: 'nom' },
  terminus: { prep: '', case: 'dat' },
  instrumental: { prep: '', case: 'ins' },
};

/** The privative (P09-E2): *bez* + genitive. */
export const PRIVATIVE: Government = { prep: 'bez', case: 'gen' };

/** The passive's agent: *przez* + accusative (*przez kota*). */
export const AGENT: Government = { prep: 'przez', case: 'acc' };

/** How each dimension noun enters an adjective gloss: *o dużym rozmiarze* (verify the measure). */
export const PL_DIM_PREP: Record<DimensionRelation, Government> = {
  extent: { prep: 'o', case: 'loc' }, quality: { prep: 'o', case: 'loc' }, measure: { prep: 'o', case: 'loc' },
};

/** A manner noun by its relation (P05 §2.3): *jak woda*, *z radością*, bare instrumental, *z dużą prędkością*. */
export const MANNER: Record<'similative' | 'means' | 'measure' | 'mode', Government> = {
  similative: { prep: 'jak', case: 'nom' }, means: { prep: '', case: 'ins' }, measure: { prep: 'z', case: 'ins' }, mode: { prep: 'z', case: 'ins' },
};

/** The question adverbs (P09-E6). */
export const QUESTION_ADVERBS: Record<'where' | 'how' | 'why' | 'whereTo' | 'whereFrom' | 'when' | 'untilWhen', string> = {
  where: 'gdzie', how: 'jak', why: 'dlaczego', whereTo: 'dokąd', whereFrom: 'skąd', when: 'kiedy', untilWhen: 'do kiedy',
};

/** The relative adverb of a plain place: *dom, gdzie kot je* (C07). */
export const WHERE = 'gdzie';

/** The constituent negator a denied cause takes (*nie z powodu psa*). */
export const CONSTITUENT_NEGATOR = 'nie';
