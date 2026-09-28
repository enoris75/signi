import type { LanguageColumn } from '../types.js';
import { adj } from './helpers.js';

// The adjectives (P18-E7, style-lt.md § Adjectives): `adj(base, extra)` from the masculine nominative
// singular stores `base`, `fem`, `neuter`, `comparative` and `superlative`, and the engine declines the
// rest by class. A relational or participial adjective has no synthetic degree and passes `NO_DEGREE`
// (the engine says *labiau / labiausiai* + positive). Plain forms only (P18 D8): the grammar terms,
// which Lithuanian grammars name with the definite form (*šalutinis sakinys*, *jungiamasis jungtukas*,
// *veikiamoji rūšis*), are stored plain.
//
// Polish's `position: 'post'` is dropped (Lithuanian adjectives precede the noun, style-lt.md), except
// on an invariable prepositional phrase, which follows its noun as Polish's does (*failas be
// pavadinimo*). `ordinal` and OTHER's `after_pronoun` mirror Polish.
//
// Every form is (verify) until the native review (P18-E12); the ones marked are the least sure.

type Forms = Record<string, string>;

const NO_DEGREE = { comparative: '', superlative: '' };
const CASES = ['gen', 'dat', 'acc', 'ins', 'loc'] as const;
const COLUMNS = ['', 'fem_', 'plural_', 'plural_fem_'] as const;

/**
 * An adjective `adj` cannot build (a participle in *-ęs* or *-antis*, *tas pats*, *dešinys*), stored as
 * its full table. style-lt.md is silent on the keys; they are the lt pronouns' (style-lt.md § Adverbs,
 * pronouns, interjections), Lithuanian having no neuter noun and no virile plural to key Polish's
 * `neut_` / `virile_` / `nonvirile_` columns: the nominatives `base, fem, plural, plural_fem` and the
 * predicative `neuter` (as `adj` stores it), then the oblique cases `gen, dat, acc, ins, loc` under
 * `''` (masc sg), `fem_`, `plural_` (masc pl) and `plural_fem_`. Each row is four comma-separated cells
 * in that column order.
 */
function table(rows: Record<'nom' | (typeof CASES)[number], string>, neuter: string, extra: Forms = {}): Forms {
  const split = (row: string) => {
    const parts = row.split(',').map((s) => s.trim());
    if (parts.length !== 4 || parts.some((p) => p === '')) throw new Error(`lt adjective table: expected 4 cells in "${row}"`);
    return parts;
  };
  const [base, fem, plural, pluralFem] = split(rows.nom);
  const out: Forms = { base: base!, fem: fem!, plural: plural!, plural_fem: pluralFem!, neuter };
  for (const c of CASES) split(rows[c]).forEach((form, i) => { out[`${COLUMNS[i]}${c}`] = form; });
  return { ...out, ...NO_DEGREE, ...extra };
}

/**
 * The active past participle as an adjective (*pavargęs, pavargusi*): `pastActive('pavarg')`. Every cell
 * is regular from the stem: *-ęs, -usio, -usiam, -usį, -usiu, -usiame*; *-usi, -usios, …*; *-ę, -usių*.
 */
function pastActive(s: string, extra: Forms = {}): Forms {
  const u = `${s}us`;
  return table({
    nom: `${s}ęs, ${u}i, ${s}ę, ${u}ios`,
    gen: `${u}io, ${u}ios, ${u}ių, ${u}ių`,
    dat: `${u}iam, ${u}iai, ${u}iems, ${u}ioms`,
    acc: `${u}į, ${u}ią, ${u}ius, ${u}ias`,
    ins: `${u}iu, ${u}ia, ${u}iais, ${u}iomis`,
    loc: `${u}iame, ${u}ioje, ${u}iuose, ${u}iose`,
  }, `${s}ę`, extra);
}

/**
 * The active present participle as an adjective (*ateinantis, ateinanti*): `presentActive('ateina')`,
 * the 3rd-person present, whose *-nt-* softens to *-nč-* before a back vowel. The neuter is the bare
 * 3rd person *ateina* `// (verify)`.
 */
function presentActive(p3: string, extra: Forms = {}): Forms {
  const t = `${p3}nt`;
  const c = `${p3}nč`;
  return table({
    nom: `${t}is, ${t}i, ${t}ys, ${c}ios`,
    gen: `${c}io, ${c}ios, ${c}ių, ${c}ių`,
    dat: `${c}iam, ${c}iai, ${t}iems, ${c}ioms`,
    acc: `${t}į, ${c}ią, ${c}ius, ${c}ias`,
    ins: `${c}iu, ${c}ia, ${c}iais, ${c}iomis`,
    loc: `${c}iame, ${c}ioje, ${c}iuose, ${c}iose`,
  }, p3, extra);
}

/** A phrase that does not inflect (*be pavadinimo*): its table repeats it in every cell. */
function invariable(phrase: string, extra: Forms = {}): Forms {
  const row = Array(4).fill(phrase).join(', ');
  return table({ nom: row, gen: row, dat: row, acc: row, ins: row, loc: row }, phrase, { invariable: '1', ...extra });
}

const post = { position: 'post' };

export const LT_ADJECTIVES: LanguageColumn = {
  BIG: adj('didelis', { comparative: 'didesnis', superlative: 'didžiausias' }),
  SMALL: adj('mažas'),
  HIGH: adj('aukštas'),
  LONG: adj('ilgas'),
  // Lithuanian has one word for big and great, as German *groß*: *didelis greitis, didelė reikšmė*, and
  // ELDER's gloss "of greater age" is *didesnio amžiaus*.
  GREAT: adj('didelis', { comparative: 'didesnis', superlative: 'didžiausias' }),
  LOW: adj('žemas'),
  // *artimas* also means close of kin (verify: against *netolimas*).
  NEAR: adj('artimas'),
  FAR: adj('tolimas'),
  GOOD: adj('geras'),
  BAD: adj('blogas'),
  HAPPY: adj('laimingas'),
  // *katinui viskas gerai*: the adverb, invariable and after its noun, as Polish *w porządku*. It is
  // WELL's word too; Lithuanian says both with *gerai* (verify: against *neblogas*, *tvarkoje*, the
  // latter a calque the VLKK discourages).
  OKAY: invariable('gerai', post),
  SAD: adj('liūdnas'),
  OLD: adj('senas'),
  YOUNG: adj('jaunas'),
  // Of siblings: *vyresnis brolis*, *jaunesnė sesuo* — the comparative as a plain adjective, so no
  // degree of its own (as Polish).
  ELDER: adj('vyresnis', NO_DEGREE),
  YOUNGER: adj('jaunesnis', NO_DEGREE),
  // *suaugęs*, the participle (*suaugęs katinas*), not the legal *pilnametis*.
  ADULT: pastActive('suaug'),
  // *vyriškas / moteriškas*; of an animal Lithuanian more often says *patinas / patelė* (verify).
  MALE: adj('vyriškas', NO_DEGREE),
  FEMALE: adj('moteriškas', NO_DEGREE),
  CASTRATED: adj('kastruotas', NO_DEGREE),
  NEW: adj('naujas'),
  BEAUTIFUL: adj('gražus'),
  STRONG: adj('stiprus'),
  WEAK: adj('silpnas'),
  TIRED: pastActive('pavarg'),
  HUNGRY: adj('alkanas'),
  COLD: adj('šaltas'),
  // *šalta žiema*: Lithuanian says cold weather with the same word, as Polish *zimny*.
  COLD_CLIMATE: adj('šaltas'),
  // *šiltas žmogus*: warm of feeling.
  WARM: adj('šiltas'),
  HOT: adj('karštas'),
  // *kaitri vasara*: hot, of weather (verify: against *karštas*, which holds HOT, and *tvankus*, sultry).
  HOT_CLIMATE: adj('kaitrus'),
  INTERESTING: adj('įdomus'),
  IMPORTANT: adj('svarbus'),
  QUICK: adj('greitas'),
  BROWN: adj('rudas'),
  BLACK: adj('juodas'),
  WHITE: adj('baltas'),
  DARK: adj('tamsus'),
  WILD: adj('laukinis', NO_DEGREE),
  DOMESTIC: adj('naminis', NO_DEGREE),
  // *šuniniai*, the dog family (verify: against *šuniškas*, dog-like in manner).
  CANINE: adj('šuninis', NO_DEGREE),
  LAZY: adj('tingus'),
  CAREFUL: adj('atsargus'),
  POSSIBLE: adj('galimas', NO_DEGREE),
  // Polish drops Spanish's `infinitive_link`, and so does Lithuanian: the infinitive follows bare
  // (*pajėgus padaryti*, *įpareigotas padaryti*).
  ABLE: adj('pajėgus'), // (verify) against *gebantis*
  OBLIGED: adj('įpareigotas', NO_DEGREE), // (verify)
  ALLOWED: adj('įgaliotas', NO_DEGREE), // (verify) against *turintis teisę*
  // *visas obuolys* (verify: against *ištisas*, *sveikas*; *visi* is the engine's ALL).
  WHOLE: adj('visas', NO_DEGREE),
  ROUND: adj('apvalus'),
  SHARP: adj('aštrus'),
  // *garsus* is also famous.
  LOUD: adj('garsus'),
  WRITTEN: adj('parašytas', NO_DEGREE),
  // *įkeltas*: loaded from storage (a file), not *pakrautas* (a truck) (verify).
  LOADED: adj('įkeltas', NO_DEGREE),
  TIDY: adj('tvarkingas'),
  SAVED: adj('išsaugotas', NO_DEGREE),
  ADDED: adj('pridėtas', NO_DEGREE),
  REMOVED: adj('pašalintas', NO_DEGREE),
  FAILED: adj('nesėkmingas', NO_DEGREE),
  COPIED: adj('nukopijuotas', NO_DEGREE),
  LINKED: adj('susietas', NO_DEGREE),
  PINNED: adj('prisegtas', NO_DEGREE),
  UNPINNED: adj('atsegtas', NO_DEGREE), // (verify)
  // Polish's *ostatnio używany*: the adverb stays, the participle declines (*neseniai naudoto*).
  RECENT: adj('neseniai naudotas', NO_DEGREE), // (verify)
  NUMBERED: adj('numeruotas', NO_DEGREE),
  ACTIVE: adj('aktyvus'),
  // *failas be pavadinimo*: a prepositional phrase, invariable, after its noun.
  UNTITLED: invariable('be pavadinimo', post),
  // *tuščias → tuštesnis*: the comparative hardens the *č* the helper keeps (helper defect).
  EMPTY: adj('tuščias', { comparative: 'tuštesnis' }),
  // *tinkamas* (verify: against *galiojantis*, of a document).
  VALID: adj('tinkamas', NO_DEGREE),
  MISSING: adj('trūkstamas', NO_DEGREE),
  UNKNOWN: adj('nežinomas', NO_DEGREE),
  KNOWN: adj('žinomas', NO_DEGREE),
  UNEXPECTED: adj('netikėtas', NO_DEGREE),
  // The grammar terms: *vienaskaita/daugiskaita*, *bevardė giminė*, *apibrėžtas/neapibrėžtas
  // artikelis*, *teigiamas/neigiamas sakinys*, …
  SINGULAR: adj('vienaskaitinis', NO_DEGREE), // (verify) grammars say *vienaskaitos* (genitive)
  PLURAL: adj('daugiskaitinis', NO_DEGREE), // (verify) grammars say *daugiskaitos*
  NEUTER: adj('bevardis', NO_DEGREE),
  DEFINITE: adj('apibrėžtas', NO_DEGREE),
  INDEFINITE: adj('neapibrėžtas', NO_DEGREE),
  ZERO: adj('nulinis', NO_DEGREE),
  PROXIMAL: adj('proksimalinis', NO_DEGREE), // (verify)
  DISTAL: adj('distalinis', NO_DEGREE), // (verify)
  PARTITIVE: adj('dalinis', NO_DEGREE), // (verify) *dalies kilmininkas*, the partitive genitive
  // *neigiamas sakinys*: a grammar term, never `polarity: 'negative'`.
  NEGATIVE: adj('neigiamas', NO_DEGREE),
  MULTAL: adj('multalinis', NO_DEGREE), // (verify) a coinage, as Polish's
  PAUCAL: adj('paukalinis', NO_DEGREE), // (verify)
  // *visuotinis kvantorius*, the universal quantifier.
  UNIVERSAL: adj('visuotinis', NO_DEGREE), // (verify)
  DISTRIBUTIVE: adj('distributyvinis', NO_DEGREE), // (verify)
  EXHAUSTIVE: adj('išsamus', NO_DEGREE), // (verify)
  // *dviskaita*, the dual number.
  DUAL: adj('dviskaitinis', NO_DEGREE), // (verify)
  PROPORTIONAL: adj('proporcingas', NO_DEGREE),
  MULTIPLE: adj('daugybinis', NO_DEGREE), // (verify)
  SUFFICIENT: adj('pakankamas', NO_DEGREE),
  APPROXIMATE: adj('apytikslis', NO_DEGREE),
  SIMILATIVE: adj('similiatyvinis', NO_DEGREE), // (verify) a coinage, as Polish's
  FIRST: adj('pirmas', { ...NO_DEGREE, ordinal: '1' }),
  SECOND: adj('antras', { ...NO_DEGREE, ordinal: '1' }),
  THIRD: adj('trečias', { ...NO_DEGREE, ordinal: '1' }),
  // The everyday word is *kitas* (*kitas skyrius*), but that is OTHER's; *sekantis* in this sense is a
  // Slavicism the VLKK rejects (verify: *tolesnis*).
  NEXT: adj('tolesnis', NO_DEGREE),
  PREVIOUS: adj('ankstesnis', NO_DEGREE),
  LAST_FINAL: adj('paskutinis', { ...NO_DEGREE, ordinal: '1' }),
  // *praėjusią savaitę* (verify: against *praeitą*, which holds PAST).
  LAST_PREVIOUS: pastActive('praėj', { ordinal: '1' }),
  // *ateinančią savaitę* (verify: *kitą savaitę* is as common, but *kitas* is OTHER's).
  NEXT_COMING: presentActive('ateina', { ordinal: '1' }),
  // *tas pats, ta pati*: the demonstrative and *pats* decline together, so the whole table is stored.
  // The neuter is *tas pats* too (*tai tas pats*) (verify).
  SAME: table({
    nom: 'tas pats, ta pati, tie patys, tos pačios',
    gen: 'to paties, tos pačios, tų pačių, tų pačių',
    dat: 'tam pačiam, tai pačiai, tiems patiems, toms pačioms',
    acc: 'tą patį, tą pačią, tuos pačius, tas pačias',
    ins: 'tuo pačiu, ta pačia, tais pačiais, tomis pačiomis',
    loc: 'tame pačiame, toje pačioje, tuose pačiuose, tose pačiose',
  }, 'tas pats'),
  DIFFERENT: adj('skirtingas'),
  // *esu įsitikinęs*: sure, of a person (verify: *tikras* is as common, but it holds REAL_GENUINE).
  SURE: pastActive('įsitikin'),
  REAL_EXISTING: adj('realus', NO_DEGREE),
  REAL_GENUINE: adj('tikras', NO_DEGREE),
  // Lowercase, as every nationality adjective (style-lt.md § Spelling).
  AMERICAN: adj('amerikietiškas', NO_DEGREE),
  RIGHT_CORRECT: adj('teisingas'),
  // *dešinys, dešinė* (*dešinė ranka*): an *-ys* adjective, which `adj` does not take (helper defect),
  // so the table. The plain masculine plural *dešini* (verify: grammars mostly show the definite
  // *dešinieji*).
  RIGHT_SIDE: table({
    nom: 'dešinys, dešinė, dešini, dešinės',
    gen: 'dešinio, dešinės, dešinių, dešinių',
    dat: 'dešiniam, dešiniai, dešiniems, dešinėms',
    acc: 'dešinį, dešinę, dešinius, dešines',
    ins: 'dešiniu, dešine, dešiniais, dešinėmis',
    loc: 'dešiniame, dešinėje, dešiniuose, dešinėse',
  }, 'dešini'),
  // *beasmenis sakinys*.
  IMPERSONAL: adj('beasmenis', NO_DEGREE),
  // *kažkas kita*: the pronoun's *else* is this adjective in the neuter (German's *anderes*). *kitas*
  // is also *next* (*kitą savaitę*); NEXT and NEXT_COMING take other words.
  OTHER: adj('kitas', { ...NO_DEGREE, after_pronoun: 'kita' }),
  OPPOSITE: adj('priešingas'),
  // *pagrindinis sakinys*, the main clause.
  MAIN: adj('pagrindinis', NO_DEGREE),
  CONDITIONAL: adj('sąlyginis', NO_DEGREE),
  COORDINATED: adj('sujungiamas', NO_DEGREE), // (verify) *sujungiamasis sakinys*
  // *šalutinis sakinys*, the subordinate clause.
  SUBORDINATE: adj('šalutinis', NO_DEGREE),
  // The kinds of coordinate clause, after the conjunctions: *jungiamieji, skiriamieji, priešinamieji,
  // aiškinamieji*, and the conclusion's *išvadiniai* (verify all five).
  COPULATIVE: adj('jungiamas', NO_DEGREE),
  DISJUNCTIVE: adj('skiriamas', NO_DEGREE),
  ADVERSATIVE: adj('priešinamas', NO_DEGREE),
  EXPLICATIVE: adj('aiškinamas', NO_DEGREE),
  CONCLUSIVE: adj('išvadinis', NO_DEGREE),
  TEMPORAL: adj('laikinis', NO_DEGREE), // (verify) not *laikinas*, temporary
  SPATIAL: adj('erdvinis', NO_DEGREE),
  NATIONAL: adj('nacionalinis', NO_DEGREE),
  SOCIAL: adj('socialinis', NO_DEGREE),
  POLITICAL: adj('politinis', NO_DEGREE),
  PUBLIC: adj('viešas', NO_DEGREE),
  NEUTRAL: adj('neutralus'),
  // *veikiamoji / neveikiamoji rūšis*, the active and passive voice (verify: the plain *neveikiamas*
  // also reads "unaffected").
  ACTIVE_VOICE: adj('veikiamas', NO_DEGREE),
  PASSIVE: adj('neveikiamas', NO_DEGREE),
  // The Japanese humble form.
  HUMBLE_GRAMMAR: adj('nuolankus', NO_DEGREE), // (verify)
  PROGRESSIVE: adj('tęstinis', NO_DEGREE), // (verify)
  PROSPECTIVE: adj('prospektyvinis', NO_DEGREE), // (verify)
  RESULTATIVE: adj('rezultatinis', NO_DEGREE), // (verify)
  // *teigiamas sakinys*.
  POSITIVE: adj('teigiamas', NO_DEGREE),
  SEMANTIC: adj('semantinis', NO_DEGREE),
  DIRECT: adj('tiesioginis', NO_DEGREE),
  INDIRECT: adj('netiesioginis', NO_DEGREE),
  UNCONNECTED: adj('nesusietas', NO_DEGREE),
  HIDDEN: adj('paslėptas', NO_DEGREE),
  // *uždaras / atviras*, the standing pair (not the participles *uždarytas, atidarytas*).
  CLOSED: adj('uždaras'),
  OPEN_ADJECTIVE: adj('atviras'),
  VISIBLE: adj('matomas', NO_DEGREE),
  SWEET: adj('saldus'),
  // *kietasis kūnas*: a solid, the state of matter (*kietas* is also hard).
  SOLID: adj('kietas', NO_DEGREE),
  PRESENT: adj('dabartinis', NO_DEGREE),
  PAST: adj('praeitas', NO_DEGREE),
  FUTURE: adj('būsimas', NO_DEGREE),
  OWN_ADJECTIVE: adj('nuosavas', NO_DEGREE),
  SOLE: adj('vienintelis', NO_DEGREE),
  STANDARD: adj('standartinis', NO_DEGREE),
  MANIFOLD: adj('daugialypis', NO_DEGREE), // (verify) against *įvairus*
};
