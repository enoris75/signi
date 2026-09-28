import type { LanguageColumn } from '../types.js';
import { adj } from './helpers.js';

// The adjectives (P05 D4, style-pl.md § Adjectives): `base` (masc nom sg) in -y/-i, the virile
// nominative plural always stored (its consonant change is not derivable: *dobrzy, wysocy, drodzy,
// źli, puści*), and the synthetic comparative where standard Polish has one (omitted → *bardziej*).
// The engine declines everything else from `base`. Participial adjectives in *-cy* keep it in the
// virile (*brakujący → brakujący*); soft stems in *-i* not after *k/g* decline as soft (*ostatni,
// ostatnia*; *trzeci, trzecia*; *psi, psia*; *poprzedni, bezpośredni*).
//
// `position: 'post'` marks a classifying adjective that follows its noun (*kot domowy*, *przedimek
// określony*, *zdanie podrzędne*, *transport publiczny*): the grammar terms, which are all classifying.
//
// Spanish's `content_clause_mood: 'subjunctive'` (GOOD, POSSIBLE, RIGHT_CORRECT) is dropped: Polish has
// no subjunctive — *dobrze, że* takes the indicative, and the *żeby* clause is the engine's choice.
// Spanish's `predicate_article` (SAME) and German's `attributive` / `umlaut` / `superlative` are
// features of those languages only. `ordinal` mirrors German's.
//
// Every form is (verify) until the native review (P05-E11); the ones marked are the least sure.

type Forms = Record<string, string>;

const CASES = ['gen', 'dat', 'acc', 'ins', 'loc'] as const;
const COLUMNS = ['', 'fem_', 'neut_', 'virile_', 'nonvirile_'] as const;

/**
 * An adjective that is not an -y/-i adjective (style-pl.md), stored as its full table. Each row is five
 * comma-separated cells in the column order masc, fem, neut, virile pl, non-virile pl; `accAnimate` is
 * the masculine animate accusative singular. Keys: the nominatives `base, fem, neut, virile, nonvirile`;
 * the oblique cases `gen, dat, acc, ins, loc` (masc), then the same under `fem_`, `neut_`, `virile_`,
 * `nonvirile_` (`fem_gen`, …, `nonvirile_loc`); and `acc_animate`.
 */
function table(rows: Record<'nom' | (typeof CASES)[number], string>, accAnimate: string, extra: Forms = {}): Forms {
  const split = (row: string) => {
    const parts = row.split(',').map((s) => s.trim());
    if (parts.length !== 5) throw new Error(`pl adjective table: expected 5 cells in "${row}"`);
    return parts;
  };
  const [base, fem, neut, virile, nonvirile] = split(rows.nom);
  const out: Forms = { base: base!, fem: fem!, neut: neut!, virile: virile!, nonvirile: nonvirile! };
  for (const c of CASES) split(rows[c]).forEach((form, i) => { out[`${COLUMNS[i]}${c}`] = form; });
  return { ...out, acc_animate: accAnimate, ...extra };
}

/** A phrase that does not inflect (*w porządku*, *bez tytułu*): its table repeats it in every cell. */
function invariable(phrase: string, extra: Forms = {}): Forms {
  const row = Array(5).fill(phrase).join(', ');
  return table({ nom: row, gen: row, dat: row, acc: row, ins: row, loc: row }, phrase, { invariable: '1', ...extra });
}

const post = { position: 'post' };

export const PL_ADJECTIVES: LanguageColumn = {
  BIG: adj('duży', 'duzi', 'większy'),
  SMALL: adj('mały', 'mali', 'mniejszy'),
  HIGH: adj('wysoki', 'wysocy', 'wyższy'),
  LONG: adj('długi', 'dłudzy', 'dłuższy'),
  GREAT: adj('wielki', 'wielcy', 'większy'),
  LOW: adj('niski', 'niscy', 'niższy'),
  NEAR: adj('bliski', 'bliscy', 'bliższy'),
  FAR: adj('daleki', 'dalecy', 'dalszy'),
  GOOD: adj('dobry', 'dobrzy', 'lepszy'),
  BAD: adj('zły', 'źli', 'gorszy'),
  HAPPY: adj('szczęśliwy', 'szczęśliwi', 'szczęśliwszy'),
  // *kot jest w porządku* (with BE; *ma się dobrze* would need BE_FARING's *mieć się*): a prepositional
  // phrase, invariable, after its noun. German's `copula`/`experiencer` describe *es geht dem Kater
  // gut* and are dropped (verify: against *dobrze* + BE_FARING).
  OKAY: invariable('w porządku', post),
  SAD: adj('smutny', 'smutni', 'smutniejszy'),
  OLD: adj('stary', 'starzy', 'starszy'),
  YOUNG: adj('młody', 'młodzi', 'młodszy'),
  // Of siblings: *starszy brat*, *młodsza siostra* — the comparative used as a plain adjective, so it
  // has no comparative of its own.
  ELDER: adj('starszy', 'starsi'),
  YOUNGER: adj('młodszy', 'młodsi'),
  ADULT: adj('dorosły', 'dorośli'),
  // *osobnik męski*; of an animal Polish more often says *samiec* (verify).
  MALE: adj('męski', 'męscy', undefined, post),
  FEMALE: adj('żeński', 'żeńscy', undefined, post),
  CASTRATED: adj('wykastrowany', 'wykastrowani'),
  NEW: adj('nowy', 'nowi', 'nowszy'),
  BEAUTIFUL: adj('piękny', 'piękni', 'piękniejszy'),
  STRONG: adj('silny', 'silni', 'silniejszy'),
  WEAK: adj('słaby', 'słabi', 'słabszy'),
  TIRED: adj('zmęczony', 'zmęczeni'),
  HUNGRY: adj('głodny', 'głodni'),
  COLD: adj('zimny', 'zimni', 'zimniejszy'),
  COLD_CLIMATE: adj('zimny', 'zimni', 'zimniejszy'),
  WARM: adj('ciepły', 'ciepli', 'cieplejszy'),
  HOT: adj('gorący', 'gorący', 'gorętszy'),
  // *upalny dzień*, *upalne lato*: hot weather.
  HOT_CLIMATE: adj('upalny', 'upalni'),
  INTERESTING: adj('ciekawy', 'ciekawi', 'ciekawszy'),
  IMPORTANT: adj('ważny', 'ważni', 'ważniejszy'),
  QUICK: adj('szybki', 'szybcy', 'szybszy'),
  BROWN: adj('brązowy', 'brązowi'),
  BLACK: adj('czarny', 'czarni', 'czarniejszy'),
  WHITE: adj('biały', 'biali', 'bielszy'),
  DARK: adj('ciemny', 'ciemni', 'ciemniejszy'),
  WILD: adj('dziki', 'dzicy'),
  DOMESTIC: adj('domowy', 'domowi', undefined, post),
  // *psi*, soft: *psia, psie, psiego* (verify: against *psowaty*, the zoological term).
  CANINE: adj('psi', 'psi'),
  LAZY: adj('leniwy', 'leniwi'),
  CAREFUL: adj('ostrożny', 'ostrożni', 'ostrożniejszy'),
  POSSIBLE: adj('możliwy', 'możliwi'),
  // The infinitive follows bare (*zdolny zrobić*); Spanish's `infinitive_link` is dropped here and on
  // OBLIGED/ALLOWED, whose Polish *do* governs a verbal noun, not an infinitive (verify all three:
  // against *w stanie*, *musi*, *może*).
  ABLE: adj('zdolny', 'zdolni'), // (verify)
  OBLIGED: adj('zobowiązany', 'zobowiązani'), // (verify)
  ALLOWED: adj('uprawniony', 'uprawnieni'), // (verify) against *upoważniony*
  WHOLE: adj('cały', 'cali'),
  ROUND: adj('okrągły', 'okrągli'),
  SHARP: adj('ostry', 'ostrzy', 'ostrzejszy'),
  LOUD: adj('głośny', 'głośni', 'głośniejszy'),
  WRITTEN: adj('napisany', 'napisani'),
  // *wczytany*: loaded from storage (a file), not *załadowany* (a truck).
  LOADED: adj('wczytany', 'wczytani'),
  TIDY: adj('uporządkowany', 'uporządkowani'),
  SAVED: adj('zapisany', 'zapisani'),
  ADDED: adj('dodany', 'dodani'),
  REMOVED: adj('usunięty', 'usunięci'),
  FAILED: adj('nieudany', 'nieudani'),
  COPIED: adj('skopiowany', 'skopiowani'),
  LINKED: adj('połączony', 'połączeni'),
  PINNED: adj('przypięty', 'przypięci'),
  UNPINNED: adj('odpięty', 'odpięci'),
  // German's *zuletzt verwendet*: the adverb stays, the participle declines (*ostatnio używanego*).
  RECENT: adj('ostatnio używany', 'ostatnio używani'), // (verify) against *niedawny*
  NUMBERED: adj('numerowany', 'numerowani'),
  ACTIVE: adj('aktywny', 'aktywni'),
  // *plik bez tytułu*: a prepositional phrase, invariable, after its noun.
  UNTITLED: invariable('bez tytułu', post),
  EMPTY: adj('pusty', 'puści'),
  VALID: adj('prawidłowy', 'prawidłowi'),
  MISSING: adj('brakujący', 'brakujący'),
  UNKNOWN: adj('nieznany', 'nieznani'),
  KNOWN: adj('znany', 'znani'),
  UNEXPECTED: adj('nieoczekiwany', 'nieoczekiwani'),
  // The grammar terms: *liczba pojedyncza/mnoga*, *rodzaj nijaki*, *przedimek określony/nieokreślony/
  // zerowy*, *zdanie przeczące/twierdzące*, *strona czynna/bierna*, …, all after the noun.
  SINGULAR: adj('pojedynczy', 'pojedynczy', undefined, post),
  PLURAL: adj('mnogi', 'mnodzy', undefined, post),
  NEUTER: adj('nijaki', 'nijacy', undefined, post),
  DEFINITE: adj('określony', 'określeni', undefined, post),
  INDEFINITE: adj('nieokreślony', 'nieokreśleni', undefined, post),
  ZERO: adj('zerowy', 'zerowi', undefined, post),
  PROXIMAL: adj('proksymalny', 'proksymalni', undefined, post), // (verify)
  DISTAL: adj('dystalny', 'dystalni', undefined, post), // (verify)
  PARTITIVE: adj('partytywny', 'partytywni', undefined, post),
  // *zdanie przeczące*: a grammar term, never `polarity: 'negative'`.
  NEGATIVE: adj('przeczący', 'przeczący', undefined, post),
  MULTAL: adj('multalny', 'multalni', undefined, post), // (verify) a coinage, as Spanish's
  PAUCAL: adj('paukalny', 'paukalni', undefined, post), // (verify)
  UNIVERSAL: adj('uniwersalny', 'uniwersalni', undefined, post), // (verify) against *ogólny* (kwantyfikator ogólny)
  DISTRIBUTIVE: adj('dystrybutywny', 'dystrybutywni', undefined, post),
  EXHAUSTIVE: adj('wyczerpujący', 'wyczerpujący', undefined, post),
  DUAL: adj('podwójny', 'podwójni', undefined, post),
  PROPORTIONAL: adj('proporcjonalny', 'proporcjonalni', undefined, post),
  MULTIPLE: adj('wielokrotny', 'wielokrotni', undefined, post), // (verify)
  SUFFICIENT: adj('wystarczający', 'wystarczający'),
  APPROXIMATE: adj('przybliżony', 'przybliżeni'),
  SIMILATIVE: adj('similatywny', 'similatywni', undefined, post), // (verify) a coinage, as Spanish's
  FIRST: adj('pierwszy', 'pierwsi', undefined, { ordinal: '1' }),
  SECOND: adj('drugi', 'drudzy', undefined, { ordinal: '1' }),
  // Soft: *trzecia, trzecie*; the virile is *trzeci* again.
  THIRD: adj('trzeci', 'trzeci', undefined, { ordinal: '1' }),
  NEXT: adj('następny', 'następni'),
  // Soft: *poprzednia, poprzednie*.
  PREVIOUS: adj('poprzedni', 'poprzedni'),
  LAST_FINAL: adj('ostatni', 'ostatni', undefined, { ordinal: '1' }),
  // *w zeszłym tygodniu* (verify: against *ubiegły*).
  LAST_PREVIOUS: adj('zeszły', 'zeszli', undefined, { ordinal: '1' }),
  // *w przyszłym tygodniu*.
  NEXT_COMING: adj('przyszły', 'przyszli', undefined, { ordinal: '1' }),
  // *ten sam, ta sama, to samo*: the demonstrative and *sam* decline together, so the whole table is
  // stored. Spanish's `predicate_article` (*es el mismo*) is dropped: *ten* is already in the word.
  SAME: table({
    nom: 'ten sam, ta sama, to samo, ci sami, te same',
    gen: 'tego samego, tej samej, tego samego, tych samych, tych samych',
    dat: 'temu samemu, tej samej, temu samemu, tym samym, tym samym',
    acc: 'ten sam, tę samą, to samo, tych samych, te same',
    ins: 'tym samym, tą samą, tym samym, tymi samymi, tymi samymi',
    loc: 'tym samym, tej samej, tym samym, tych samych, tych samych',
  }, 'tego samego'),
  DIFFERENT: adj('różny', 'różni'),
  SURE: adj('pewny', 'pewni', 'pewniejszy'), // (verify) predicative *pewien*
  REAL_EXISTING: adj('rzeczywisty', 'rzeczywiści'),
  REAL_GENUINE: adj('prawdziwy', 'prawdziwi'),
  // Lowercase, as every nationality adjective (style-pl.md § Spelling).
  AMERICAN: adj('amerykański', 'amerykańscy', undefined, post), // (verify) position
  RIGHT_CORRECT: adj('poprawny', 'poprawni'),
  RIGHT_SIDE: adj('prawy', 'prawi'),
  IMPERSONAL: adj('bezosobowy', 'bezosobowi', undefined, post),
  // *ktoś inny*, *coś innego*: the pronoun's *else* is this adjective, agreeing (German's *andere*).
  OTHER: adj('inny', 'inni', undefined, { after_pronoun: 'inny' }),
  OPPOSITE: adj('przeciwny', 'przeciwni'),
  // *zdanie nadrzędne* (verify: against *główne*).
  MAIN: adj('nadrzędny', 'nadrzędni', undefined, post),
  CONDITIONAL: adj('warunkowy', 'warunkowi', undefined, post),
  COORDINATED: adj('współrzędny', 'współrzędni', undefined, post),
  SUBORDINATE: adj('podrzędny', 'podrzędni', undefined, post),
  // The Polish kinds of coordinate clause: *łączne, rozłączne, przeciwstawne, wynikowe*, and the
  // explaining one (verify: *wyjaśniające*).
  COPULATIVE: adj('łączny', 'łączni', undefined, post),
  DISJUNCTIVE: adj('rozłączny', 'rozłączni', undefined, post),
  ADVERSATIVE: adj('przeciwstawny', 'przeciwstawni', undefined, post),
  EXPLICATIVE: adj('wyjaśniający', 'wyjaśniający', undefined, post), // (verify)
  CONCLUSIVE: adj('wynikowy', 'wynikowi', undefined, post),
  TEMPORAL: adj('czasowy', 'czasowi', undefined, post),
  SPATIAL: adj('przestrzenny', 'przestrzenni', undefined, post),
  NATIONAL: adj('narodowy', 'narodowi', undefined, post),
  SOCIAL: adj('społeczny', 'społeczni', undefined, post),
  POLITICAL: adj('polityczny', 'polityczni', undefined, post),
  PUBLIC: adj('publiczny', 'publiczni', undefined, post),
  NEUTRAL: adj('neutralny', 'neutralni'),
  ACTIVE_VOICE: adj('czynny', 'czynni', undefined, post),
  PASSIVE: adj('bierny', 'bierni', undefined, post),
  // *forma uniżona*, the Japanese humble form.
  HUMBLE_GRAMMAR: adj('uniżony', 'uniżeni', undefined, post), // (verify)
  // *czas ciągły*, as Polish grammars name the English progressive.
  PROGRESSIVE: adj('ciągły', 'ciągli', undefined, post),
  PROSPECTIVE: adj('prospektywny', 'prospektywni', undefined, post), // (verify)
  RESULTATIVE: adj('rezultatywny', 'rezultatywni', undefined, post), // (verify)
  POSITIVE: adj('twierdzący', 'twierdzący', undefined, post),
  SEMANTIC: adj('semantyczny', 'semantyczni', undefined, post),
  // Soft: *bezpośrednia, pośrednia*.
  DIRECT: adj('bezpośredni', 'bezpośredni'),
  INDIRECT: adj('pośredni', 'pośredni'),
  UNCONNECTED: adj('niepołączony', 'niepołączeni'),
  HIDDEN: adj('ukryty', 'ukryci'),
  CLOSED: adj('zamknięty', 'zamknięci'),
  OPEN_ADJECTIVE: adj('otwarty', 'otwarci'),
  VISIBLE: adj('widoczny', 'widoczni'),
  SWEET: adj('słodki', 'słodcy', 'słodszy'),
  // *ciało stałe*: a solid, the state of matter.
  SOLID: adj('stały', 'stali', undefined, post),
  PRESENT: adj('obecny', 'obecni'),
  PAST: adj('przeszły', 'przeszli'),
  FUTURE: adj('przyszły', 'przyszli'),
  OWN_ADJECTIVE: adj('własny', 'własni'),
  SOLE: adj('jedyny', 'jedyni'),
  STANDARD: adj('standardowy', 'standardowi', undefined, post),
  MANIFOLD: adj('wieloraki', 'wielorakcy'), // (verify) the virile
};
