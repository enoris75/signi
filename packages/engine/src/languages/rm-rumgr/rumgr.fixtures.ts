import type { Forms } from '../resolved.fixtures.js';

export * from '../resolved.fixtures.js';

// Hand-built resolved inputs for the Rumantsch Grischun function-level unit tests. The forms mirror
// the seeded RG lexicon (packages/backend/src/concepts/rm-rumgr) plus the keys the lexicon and the
// translator thread onto them (animate, uncountable, proper, isA, role, stative, mannerRelation,
// dimensionRelation …), trimmed to what the functions read — so each test shows exactly which forms
// drive its output. Rendering through the real lexicon is covered by the sentence-level suite in
// packages/engine/test/languages/rm-rumgr.test.ts. The builders come from the language-neutral
// `resolved.fixtures.ts`.
//
// RG keys its rules off the forms, not the concept id — an adjective's place is its `position`, its
// agreement its four stored forms — except `PRENOMINAL_DETERMINER` (OTHER, FIRST …), so pass the id
// there: `concept(AUTER, 'OTHER')`.

// ── Nouns ───────────────────────────────────────────────────────────────────

export const GIAT: Forms = { base: 'giat', plural: 'giats', gender: 'masc', count: 'singular', animate: '1' };
/** CAT resolved as feminine (the translator swaps in the stored `fem` / `fem_plural` surfaces). */
export const GIATTA: Forms = { base: 'giatta', plural: 'giattas', gender: 'fem', count: 'singular', animate: '1' };
export const CHAUN: Forms = { base: 'chaun', plural: 'chauns', gender: 'masc', count: 'singular', animate: '1' };
/** MOUSE: feminine in RG. */
export const MIEUR: Forms = { base: 'mieur', plural: 'mieurs', gender: 'fem', count: 'singular', animate: '1' };
export const LUF: Forms = { base: 'luf', plural: 'lufs', gender: 'masc', count: 'singular', animate: '1' };
export const DUNNA: Forms = { base: 'dunna', plural: 'dunnas', gender: 'fem', count: 'singular', animate: '1' };
/** Vowel-initial masculine, irregular plural: l'um / ils umens / in um. */
export const UM: Forms = { base: 'um', plural: 'umens', gender: 'masc', count: 'singular', animate: '1' };
/** Vowel-initial masculine person noun. */
export const AMI: Forms = { base: 'ami', plural: 'amis', gender: 'masc', count: 'singular', animate: '1' };
export const UFFANT: Forms = { base: 'uffant', plural: 'uffants', gender: 'masc', count: 'singular', animate: '1' };
export const CUDESCH: Forms = { base: 'cudesch', plural: 'cudeschs', gender: 'masc', count: 'singular' };
export const CHASA: Forms = { base: 'chasa', plural: 'chasas', gender: 'fem', count: 'singular' };
export const LIEU: Forms = { base: 'lieu', plural: 'lieus', gender: 'masc', count: 'singular' };
export const FIEU: Forms = { base: 'fieu', plural: 'fieus', gender: 'masc', count: 'singular' };
export const BASTUN: Forms = { base: 'bastun', plural: 'bastuns', gender: 'masc', count: 'singular' };
export const BUTTUN: Forms = { base: 'buttun', plural: 'buttuns', gender: 'masc', count: 'singular' };
export const DI: Forms = { base: 'di', plural: 'dis', gender: 'masc', count: 'singular', temporal_prep: 'en' };
export const BARTGA: Forms = { base: 'bartga', plural: 'bartgas', gender: 'fem', count: 'singular' };
export const VELA: Forms = { base: 'vela', plural: 'velas', gender: 'fem', count: 'singular' };
/** A feminine mass noun, vowel-initial: l'aua. */
export const AUA: Forms = { base: 'aua', gender: 'fem', count: 'singular', uncountable: '1' };
/** A masculine mass noun: il paun. */
export const PAUN: Forms = { base: 'paun', gender: 'masc', count: 'singular', uncountable: '1' };
/** A plurale tantum: las novitads. */
export const NOVITADS: Forms = { base: 'novitads', gender: 'fem', count: 'plural' };
/** A continent: proper, vowel-initial, uncountable, isA CONTINENT. */
export const EUROPA: Forms = { base: 'Europa', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };
/** A personal name: proper, and its lexeme says it takes no article. */
export const PEDER: Forms = { base: 'Peder', gender: 'masc', count: 'singular', proper: '1', takes_article: '0', animate: '1' };

// Manner nouns: how the noun enters a manner adverbial (a gronda sveltezza / en ina buna moda).
export const SVELTEZZA: Forms = { base: 'sveltezza', plural: 'sveltezzas', gender: 'fem', count: 'singular', mannerRelation: 'measure' };
export const MODA: Forms = { base: 'moda', plural: 'modas', gender: 'fem', count: 'singular', mannerRelation: 'mode' };

// Dimension nouns: how the noun enters an adjective-definition gloss (da grond format).
export const FORMAT: Forms = { base: 'format', plural: 'formats', gender: 'masc', count: 'singular', dimensionRelation: 'extent' };
export const TEMPERATURA: Forms = { base: 'temperatura', plural: 'temperaturas', gender: 'fem', count: 'singular', dimensionRelation: 'measure' };

// ── Pronouns ────────────────────────────────────────────────────────────────
// Resolved: the translator picks the surface for the requested number/gender (base ← plural or
// singular_fem, disjunctive ← its matching form) and always sets `gender`.

export const JAU: Forms = { base: 'jau', person: '1', number: 'singular', plural: 'nus', disjunctive: 'mai', disjunctive_plural: 'nus', object: 'ma', object_plural: 'ans' };
export const TI: Forms = { base: 'ti', person: '2', number: 'singular', plural: 'vus', disjunctive: 'tai', disjunctive_plural: 'vus', object: 'ta', object_plural: 'as' };
export const EL: Forms = { base: 'el', person: '3', number: 'singular', gender: 'masc', plural: 'els', disjunctive: 'el' };
/** THIRD_PERSON resolved feminine singular. */
export const ELLA: Forms = { base: 'ella', person: '3', number: 'singular', gender: 'fem', plural: 'ellas', disjunctive: 'ella' };
/** FIRST_PERSON resolved plural. */
export const NUS: Forms = { ...JAU, base: 'nus', number: 'plural', plural: 'nus', disjunctive: 'nus' };
/** SECOND_PERSON resolved plural. */
export const VUS: Forms = { ...TI, base: 'vus', number: 'plural', plural: 'vus', disjunctive: 'vus' };
/** THIRD_PERSON resolved masculine plural. */
export const ELS: Forms = { ...EL, base: 'els', number: 'plural', disjunctive: 'els' };
/** The generic subject *ins*, with the verb in the 3sg. */
export const INS: Forms = { base: 'ins', person: '3', number: 'singular', generic: '1' };

// ── Adjectives ──────────────────────────────────────────────────────────────
// The four stored forms; `position: 'pre'` for the ones before the noun.

export const GROND: Forms = { role: 'adjective', base: 'grond', fem: 'gronda', masc_plural: 'gronds', fem_plural: 'grondas', position: 'pre' };
export const PITSCHEN: Forms = { role: 'adjective', base: 'pitschen', fem: 'pitschna', masc_plural: 'pitschens', fem_plural: 'pitschnas', position: 'pre' };
export const BUN: Forms = { role: 'adjective', base: 'bun', fem: 'buna', masc_plural: 'buns', fem_plural: 'bunas', position: 'pre' };
export const VEGL: Forms = { role: 'adjective', base: 'vegl', fem: 'veglia', masc_plural: 'vegls', fem_plural: 'veglias', position: 'pre' };
/** OTHER: prenominal and determiner-like (pass the id 'OTHER'); *insatge auter* after a pronoun. */
export const AUTER: Forms = { role: 'adjective', base: 'auter', fem: 'autra', masc_plural: 'auters', fem_plural: 'autras', position: 'pre', after_pronoun: 'auter' };
/** NEW: follows the noun in RG. */
export const NOV: Forms = { role: 'adjective', base: 'nov', fem: 'nova', masc_plural: 'novs', fem_plural: 'novas' };
export const AULT: Forms = { role: 'adjective', base: 'ault', fem: 'auta', masc_plural: 'auts', fem_plural: 'autas' };
export const NAIR: Forms = { role: 'adjective', base: 'nair', fem: 'naira', masc_plural: 'nairs', fem_plural: 'nairas' };
export const FERM: Forms = { role: 'adjective', base: 'ferm', fem: 'ferma', masc_plural: 'ferms', fem_plural: 'fermas' };
export const LED: Forms = { role: 'adjective', base: 'led', fem: 'leda', masc_plural: 'leds', fem_plural: 'ledas' };
export const STANCHEL: Forms = { role: 'adjective', base: 'stanchel', fem: 'stancla', masc_plural: 'stanchels', fem_plural: 'stanclas' };
export const BASS: Forms = { role: 'adjective', base: 'bass', fem: 'bassa', masc_plural: 'bass', fem_plural: 'bassas' };

// ── Adverbs ─────────────────────────────────────────────────────────────────

export const BAIN: Forms = { base: 'bain' };
export const ADINA: Forms = { base: 'adina', subtype: 'frequency' };
export const MAI: Forms = { base: 'mai', subtype: 'frequency', polarity: 'negative' };
export const GIA: Forms = { base: 'gia', subtype: 'frequency', negative: 'anc' };
export const ERA: Forms = { base: 'era', subtype: 'frequency', negative: 'gnanc' };
export const PLI: Forms = { base: 'pli', subtype: 'frequency', polarity: 'negative' };

// ── Verbs ───────────────────────────────────────────────────────────────────
// The stored cells: present, imperfect, conditional, present subjunctive, participle, `aux`, and the
// three imperatives. Never a simple past, a future or a gerund (P04 D5, D7, §2.2).

const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;
const cells = (tense: string, forms: readonly string[]): Forms =>
  Object.fromEntries(PERSONS.map((pn, i) => [`${pn}_${tense}`, forms[i]!]));

export const MANGIAR: Forms = {
  base: 'mangiar', participle: 'mangià',
  ...cells('present', ['mangel', 'mangias', 'mangia', 'mangiain', 'mangiais', 'mangian']),
  ...cells('imperfect', ['mangiava', 'mangiavas', 'mangiava', 'mangiavan', 'mangiavas', 'mangiavan']),
  ...cells('conditional', ['mangiass', 'mangiassas', 'mangiass', 'mangiassan', 'mangiassas', 'mangiassan']),
  ...cells('subjunctive', ['mangia', 'mangias', 'mangia', 'mangian', 'mangias', 'mangian']),
  '2sg_imperative': 'mangia', '1pl_imperative': 'mangiain', '2pl_imperative': 'mangiai',
};
/** RUN: keeps avair ("ha currì"). */
export const CURRER: Forms = {
  base: 'currer', participle: 'currì',
  ...cells('present', ['cur', 'curras', 'curra', 'currin', 'curris', 'curran']),
  ...cells('imperfect', ['curriva', 'currivas', 'curriva', 'currivan', 'currivas', 'currivan']),
  ...cells('conditional', ['curriss', 'currissas', 'curriss', 'currissan', 'currissas', 'currissan']),
  ...cells('subjunctive', ['curria', 'currias', 'curria', 'currian', 'currias', 'currian']),
  '2sg_imperative': 'curra', '1pl_imperative': 'currin', '2pl_imperative': 'curri',
};
/** GO: esser-selecting, its participle *ì* agreeing (*ida, ids, idas*). */
export const IR: Forms = {
  base: 'ir', participle: 'ì', aux: 'be',
  ...cells('present', ['vom', 'vas', 'va', 'giain', 'giais', 'van']),
  ...cells('imperfect', ['gieva', 'gievas', 'gieva', 'gievan', 'gievas', 'gievan']),
  ...cells('conditional', ['giess', 'giessas', 'giess', 'giessan', 'giessas', 'giessan']),
  ...cells('subjunctive', ['giaja', 'giajas', 'giaja', 'giajan', 'giajas', 'giajan']),
  '2sg_imperative': 'va', '1pl_imperative': 'giain', '2pl_imperative': 'giai',
};
/** BE: the copula, a state verb (its past is the imperfect). */
export const ESSER: Forms = {
  base: 'esser', participle: 'stà', aux: 'be', copula: '1', stative: '1',
  ...cells('present', ['sun', 'es', 'è', 'essan', 'essas', 'èn']),
  ...cells('imperfect', ['era', 'eras', 'era', 'eran', 'eras', 'eran']),
  ...cells('conditional', ['fiss', 'fissas', 'fiss', 'fissan', 'fissas', 'fissan']),
  ...cells('subjunctive', ['saja', 'sajas', 'saja', 'sajan', 'sajas', 'sajan']),
  '2sg_imperative': 'sajas', '1pl_imperative': 'sajan', '2pl_imperative': 'sajas',
};
/** HAVE: a state verb. */
export const AVAIR: Forms = {
  base: 'avair', participle: 'gì', stative: '1',
  ...cells('present', ['hai', 'has', 'ha', 'avain', 'avais', 'han']),
  ...cells('imperfect', ['aveva', 'avevas', 'aveva', 'avevan', 'avevas', 'avevan']),
  ...cells('conditional', ['avess', 'avessas', 'avess', 'avessan', 'avessas', 'avessan']),
  ...cells('subjunctive', ['haja', 'hajas', 'haja', 'hajan', 'hajas', 'hajan']),
};
/** COME: esser-selecting; also the passive auxiliary *vegnir*. */
export const VEGNIR: Forms = {
  base: 'vegnir', participle: 'vegnì', aux: 'be',
  ...cells('present', ['vegn', 'vegns', 'vegn', 'vegnin', 'vegnis', 'vegnan']),
  ...cells('imperfect', ['vegniva', 'vegnivas', 'vegniva', 'vegnivan', 'vegnivas', 'vegnivan']),
  ...cells('conditional', ['vegniss', 'vegnissas', 'vegniss', 'vegnissan', 'vegnissas', 'vegnissan']),
  ...cells('subjunctive', ['vegnia', 'vegnias', 'vegnia', 'vegnian', 'vegnias', 'vegnian']),
  '2sg_imperative': 've', '1pl_imperative': 'vegnin', '2pl_imperative': 'vegni',
};
export const VESAIR: Forms = {
  base: 'vesair', participle: 'vesì',
  ...cells('present', ['ves', 'vesas', 'vesa', 'vesain', 'vesais', 'vesan']),
  ...cells('imperfect', ['veseva', 'vesevas', 'veseva', 'vesevan', 'vesevas', 'vesevan']),
  ...cells('conditional', ['vesess', 'vesessas', 'vesess', 'vesessan', 'vesessas', 'vesessan']),
  '2sg_imperative': 'vesa', '1pl_imperative': 'vesain', '2pl_imperative': 'vesai',
};
/** GIVE: ditransitive. */
export const DAR: Forms = {
  base: 'dar', participle: 'dà',
  ...cells('present', ['dun', 'das', 'dat', 'dain', 'dais', 'dattan']),
};
/** WRITE: a participle that breaks the rule in the feminine (*scrit, scritta*). */
export const SCRIVER: Forms = {
  base: 'scriver', participle: 'scrit', participle_fem: 'scritta', participle_fem_plural: 'scrittas',
  ...cells('present', ['scriv', 'scrivas', 'scriva', 'scrivain', 'scrivais', 'scrivan']),
};
/** RETURN: an *-ar* verb selecting esser (*turnà, turnada*). */
export const TURNAR: Forms = {
  base: 'turnar', participle: 'turnà', aux: 'be',
  ...cells('present', ['turn', 'turnas', 'turna', 'turnain', 'turnais', 'turnan']),
};
/**
 * SIT_DOWN: a reflexive verb. The clitic rides on the base and inside each finite cell, the enclitic on
 * each imperative, as the seed stores it; the engine strips it (`nonReflexiveVerb`) and places the
 * subject's own.
 */
export const SA_TSCHENTAR: Forms = {
  base: 'sa tschentar', participle: 'tschentà', aux: 'be',
  ...cells('present', ['ma tschent', 'ta tschentas', 'sa tschenta', 'ans tschentain', 'as tschentais', 'sa tschentan']),
  ...cells('conditional', ['ma tschentass', 'ta tschentassas', 'sa tschentass', 'ans tschentassan', 'as tschentassas', 'sa tschentassan']),
  '2sg_imperative': 'tschenta-ta', '1pl_imperative': 'tschentain-ans', '2pl_imperative': 'tschentai-as',
};
/** A reflexive verb on a vowel-initial stem: *s'avrir* (not seeded as such; the elision's example). */
export const SA_AVRIR: Forms = {
  base: 'sa avrir', participle: 'avert', aux: 'be',
  ...cells('present', ['ma avr', 'ta avras', 'sa avra', 'ans avrin', 'as avris', 'sa avran']),
};

// Modals: state verbs; `nonfinite` is the infinitive an inner modal takes.
export const STUAIR: Forms = {
  base: 'stuair', nonfinite: 'stuair', stative: '1', participle: 'stuì',
  ...cells('present', ['stoss', 'stos', 'sto', 'stuain', 'stuais', 'ston']),
  ...cells('imperfect', ['stueva', 'stuevas', 'stueva', 'stuevan', 'stuevas', 'stuevan']),
  ...cells('conditional', ['stuess', 'stuessas', 'stuess', 'stuessan', 'stuessas', 'stuessan']),
};
export const PUDAIR: Forms = {
  base: 'pudair', nonfinite: 'pudair', stative: '1', participle: 'pudì',
  ...cells('present', ['poss', 'pos', 'po', 'pudain', 'pudais', 'pon']),
  ...cells('imperfect', ['pudeva', 'pudevas', 'pudeva', 'pudevan', 'pudevas', 'pudevan']),
};
export const VULAIR: Forms = {
  base: 'vulair', nonfinite: 'vulair', stative: '1', participle: 'vulì',
  ...cells('present', ['vi', 'vuls', 'vul', 'vulain', 'vulais', 'vulan']),
  ...cells('imperfect', ['vuleva', 'vulevas', 'vuleva', 'vulevan', 'vulevas', 'vulevan']),
};
