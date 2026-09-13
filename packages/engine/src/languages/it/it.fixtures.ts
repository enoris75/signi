import type { Forms } from '../resolved.fixtures.js';

export * from '../resolved.fixtures.js';

// Hand-built resolved inputs for the Italian function-level unit tests. The forms mirror the seeded
// Italian lexicon (packages/backend/src/concepts) plus the keys the lexicon and translator thread
// onto them (animate, uncountable, proper, isA, role, mannerRelation, dimensionRelation, the
// NONFINITE gerund/participle/aux…), trimmed to what the functions read — so each test shows
// exactly which forms drive its output. Rendering through the real lexicon is covered by the
// sentence-level suite in packages/engine/test. The builders come from the language-neutral
// `resolved.fixtures.ts`.
//
// Several Italian rules key off the concept id rather than the forms — the prenominal adjectives
// (BIG, GOOD, BEAUTIFUL…), bello/buono apocope, and the irregular subjunctive stems (BE, GIVE,
// DRINK) — so pass the id when it matters: `concept(BELLO, 'BEAUTIFUL')`, `vp(DARE, {}, 'GIVE')`.

// ── Nouns ───────────────────────────────────────────────────────────────────

export const GATTO: Forms = { base: 'gatto', plural: 'gatti', gender: 'masc', count: 'singular', animate: '1' };
/** CAT resolved as feminine (the translator swaps in the stored `fem` / `fem_plural` surfaces). */
export const GATTA: Forms = { base: 'gatta', plural: 'gatte', gender: 'fem', count: 'singular', animate: '1' };
export const CANE: Forms = { base: 'cane', plural: 'cani', gender: 'masc', count: 'singular', animate: '1' };
export const TOPO: Forms = { base: 'topo', plural: 'topi', gender: 'masc', count: 'singular', animate: '1' };
export const LUPO: Forms = { base: 'lupo', plural: 'lupi', gender: 'masc', count: 'singular', animate: '1' };
export const VOLPE: Forms = { base: 'volpe', plural: 'volpi', gender: 'fem', count: 'singular', animate: '1' };
export const RAGAZZO: Forms = { base: 'ragazzo', plural: 'ragazzi', gender: 'masc', count: 'singular', animate: '1' };
export const BAMBINO: Forms = { base: 'bambino', plural: 'bambini', gender: 'masc', count: 'singular', animate: '1' };
export const DONNA: Forms = { base: 'donna', plural: 'donne', gender: 'fem', count: 'singular', animate: '1' };
export const PERSONA: Forms = { base: 'persona', plural: 'persone', gender: 'fem', count: 'singular', animate: '1' };
export const PADRE: Forms = { base: 'padre', plural: 'padri', gender: 'masc', count: 'singular', animate: '1' };
/** Vowel-initial masculine: l'uomo / gli uomini / un uomo. */
export const UOMO: Forms = { base: 'uomo', plural: 'uomini', gender: 'masc', count: 'singular', animate: '1' };
/** Vowel-initial masculine: l'animale / gli animali. */
export const ANIMALE: Forms = { base: 'animale', plural: 'animali', gender: 'masc', count: 'singular', animate: '1' };
export const ANGELO: Forms = { base: 'angelo', plural: 'angeli', gender: 'masc', count: 'singular', animate: '1' };
export const LIBRO: Forms = { base: 'libro', plural: 'libri', gender: 'masc', count: 'singular' };
export const BASTONE: Forms = { base: 'bastone', plural: 'bastoni', gender: 'masc', count: 'singular' };
export const MERCATO: Forms = { base: 'mercato', plural: 'mercati', gender: 'masc', count: 'singular' };
export const FUOCO: Forms = { base: 'fuoco', plural: 'fuochi', gender: 'masc', count: 'singular' };
/** Vowel-initial masculine, inanimate. */
export const OGGETTO: Forms = { base: 'oggetto', plural: 'oggetti', gender: 'masc', count: 'singular' };
/** s + consonant: lo slot / gli slot / uno slot (invariable plural). */
export const SLOT: Forms = { base: 'slot', plural: 'slot', gender: 'masc', count: 'singular' };
export const CASA: Forms = { base: 'casa', plural: 'case', gender: 'fem', count: 'singular' };
export const PAROLA: Forms = { base: 'parola', plural: 'parole', gender: 'fem', count: 'singular' };
export const FRASE: Forms = { base: 'frase', plural: 'frasi', gender: 'fem', count: 'singular' };
export const MONETA: Forms = { base: 'moneta', plural: 'monete', gender: 'fem', count: 'singular' };
/** Vowel-initial feminine: l'ala / le ali / un'ala. */
export const ALA: Forms = { base: 'ala', plural: 'ali', gender: 'fem', count: 'singular' };
/** Vowel-initial feminine: l'azione / le azioni. */
export const AZIONE: Forms = { base: 'azione', plural: 'azioni', gender: 'fem', count: 'singular' };
export const CONTINENTE: Forms = { base: 'continente', plural: 'continenti', gender: 'masc', count: 'singular' };
/** A feminine mass noun, vowel-initial: l'acqua / dell'acqua. */
export const ACQUA: Forms = { base: 'acqua', gender: 'fem', count: 'singular', uncountable: '1' };
/** A masculine mass noun. */
export const CIBO: Forms = { base: 'cibo', gender: 'masc', count: 'singular', uncountable: '1' };
export const DENARO: Forms = { base: 'denaro', gender: 'masc', count: 'singular', uncountable: '1' };
/** A language name: masculine, uncountable, s + consonant (lo spagnolo). */
export const SPAGNOLO: Forms = { base: 'spagnolo', gender: 'masc', count: 'singular', uncountable: '1' };
export const ITALIANO: Forms = { base: 'italiano', gender: 'masc', count: 'singular', uncountable: '1' };
/** A continent: proper (always articled in Italian — l'Africa), uncountable, isA CONTINENT. */
export const AFRICA: Forms = { base: 'Africa', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };
export const EUROPA: Forms = { base: 'Europa', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };
export const AMERICA_DEL_NORD: Forms = { base: 'America del Nord', gender: 'fem', count: 'singular', uncountable: '1', proper: '1', isA: 'CONTINENT' };

// Manner nouns: how the noun enters a manner adverbial (alla velocità / con cura / in modo).
/** Invariable plural (velocità / velocità). */
export const VELOCITA: Forms = { base: 'velocità', plural: 'velocità', gender: 'fem', count: 'singular', mannerRelation: 'measure' };
export const TEMPO: Forms = { base: 'tempo', plural: 'tempi', gender: 'masc', count: 'singular', mannerRelation: 'measure' };
export const MODO: Forms = { base: 'modo', plural: 'modi', gender: 'masc', count: 'singular', mannerRelation: 'mode' };
export const CURA: Forms = { base: 'cura', gender: 'fem', count: 'singular', uncountable: '1', mannerRelation: 'means' };
/** The genitive possessor of "alla velocità della luce". */
export const LUCE: Forms = { base: 'luce', plural: 'luci', gender: 'fem', count: 'singular' };

// Dimension nouns: how the noun enters an adjective-definition gloss (di grande dimensione).
export const DIMENSIONE: Forms = { base: 'dimensione', plural: 'dimensioni', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
export const ALTEZZA: Forms = { base: 'altezza', plural: 'altezze', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
/** Vowel-initial, invariable plural. */
export const ETA: Forms = { base: 'età', plural: 'età', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
export const QUALITA: Forms = { base: 'qualità', plural: 'qualità', gender: 'fem', count: 'singular', dimensionRelation: 'quality' };
export const TEMPERATURA: Forms = { base: 'temperatura', plural: 'temperature', gender: 'fem', count: 'singular', dimensionRelation: 'measure' };

// ── Pronouns ────────────────────────────────────────────────────────────────
// As stored. The translator then picks the surface for the requested number/gender (base ← plural
// or singular_fem, disjunctive ← disjunctive_plural/_fem) and always sets `gender`; build a
// resolved variant with `np(LUI, { number: 'plural', base: 'loro', disjunctive: 'loro' })` or use the
// resolved ones below.

export const IO: Forms = { base: 'io', person: '1', number: 'singular', plural: 'noi', disjunctive: 'me', disjunctive_plural: 'noi', object: 'mi', object_plural: 'ci' };
export const TU: Forms = { base: 'tu', person: '2', number: 'singular', plural: 'voi', disjunctive: 'te', disjunctive_plural: 'voi', object: 'ti', object_plural: 'vi' };
export const LUI: Forms = {
  base: 'lui', person: '3', number: 'singular', gender: 'masc', singular_fem: 'lei', singular_neut: 'esso', plural: 'loro',
  disjunctive: 'lui', disjunctive_fem: 'lei', disjunctive_neut: 'esso', disjunctive_plural: 'loro',
  object: 'lo', object_fem: 'la', object_neut: 'lo', object_plural: 'li',
};
/** THIRD_PERSON resolved feminine singular. */
export const LEI: Forms = { ...LUI, base: 'lei', gender: 'fem', disjunctive: 'lei' };
/** FIRST_PERSON resolved plural. */
export const NOI: Forms = { ...IO, base: 'noi', number: 'plural', plural: 'noi', disjunctive: 'noi' };
/** THIRD_PERSON resolved plural. */
export const LORO: Forms = { ...LUI, base: 'loro', number: 'plural', plural: 'loro', disjunctive: 'loro' };
/** The generic subject: rendered as the impersonal clitic "si". */
export const SI: Forms = { base: 'si', person: '3', number: 'singular', generic: '1' };

// ── Adjectives ──────────────────────────────────────────────────────────────
// Prenominal ones (it.consts PRENOMINAL) are keyed by concept id — pass it to `concept`.

/** BIG (prenominal). GREAT shares the surface "grande" but is postnominal. */
export const GRANDE: Forms = { role: 'adjective', base: 'grande' };
/** SMALL (prenominal). */
export const PICCOLO: Forms = { role: 'adjective', base: 'piccolo' };
/** GOOD (prenominal, apocopates: buon). */
export const BUONO: Forms = { role: 'adjective', base: 'buono' };
/** BAD (prenominal). */
export const CATTIVO: Forms = { role: 'adjective', base: 'cattivo' };
/** BEAUTIFUL (prenominal, inflects like the article: bel/bello/bell'/bei/begli). */
export const BELLO: Forms = { role: 'adjective', base: 'bello' };
/** OLD (prenominal); -io stem: vecchi, not *vecchii. */
export const VECCHIO: Forms = { role: 'adjective', base: 'vecchio' };
/** YOUNG (prenominal). */
export const GIOVANE: Forms = { role: 'adjective', base: 'giovane' };
/** NEW (prenominal). */
export const NUOVO: Forms = { role: 'adjective', base: 'nuovo' };
/** FIRST (prenominal ordinal). */
export const PRIMO: Forms = { role: 'adjective', base: 'primo' };
/** HIGH. */
export const ALTO: Forms = { role: 'adjective', base: 'alto' };
/** HAPPY (-e class). */
export const FELICE: Forms = { role: 'adjective', base: 'felice' };
/** STRONG (-e class). */
export const FORTE: Forms = { role: 'adjective', base: 'forte' };
/** TIRED: hard -co plural (stanchi / stanche). A transient state. */
export const STANCO: Forms = { role: 'adjective', base: 'stanco', transient: '1' };
/** COLD. */
export const FREDDO: Forms = { role: 'adjective', base: 'freddo' };
/** HUNGRY. */
export const AFFAMATO: Forms = { role: 'adjective', base: 'affamato' };

// ── Adverbs ─────────────────────────────────────────────────────────────────

export const VELOCEMENTE: Forms = { base: 'velocemente' };
export const BENE: Forms = { base: 'bene' };
export const SEMPRE: Forms = { base: 'sempre', subtype: 'frequency' };
export const MAI: Forms = { base: 'mai', subtype: 'frequency', polarity: 'negative' };

// ── Verbs ───────────────────────────────────────────────────────────────────
// The seeded conjugation merged with its NONFINITE entry (gerund, participle, aux).

export const MANGIARE: Forms = {
  base: 'mangiare', gerund: 'mangiando', participle: 'mangiato',
  '1sg_present': 'mangio', '2sg_present': 'mangi', '3sg_present': 'mangia',
  '1pl_present': 'mangiamo', '2pl_present': 'mangiate', '3pl_present': 'mangiano',
  '1sg_past': 'mangiai', '2sg_past': 'mangiasti', '3sg_past': 'mangiò',
  '1pl_past': 'mangiammo', '2pl_past': 'mangiaste', '3pl_past': 'mangiarono',
  '1sg_future': 'mangerò', '2sg_future': 'mangerai', '3sg_future': 'mangerà',
  '1pl_future': 'mangeremo', '2pl_future': 'mangerete', '3pl_future': 'mangeranno',
};
/** GO: an essere-selecting motion verb ("è andato"). */
export const ANDARE: Forms = {
  base: 'andare', gerund: 'andando', participle: 'andato', aux: 'be',
  '1sg_present': 'vado', '2sg_present': 'vai', '3sg_present': 'va',
  '1pl_present': 'andiamo', '2pl_present': 'andate', '3pl_present': 'vanno',
  '1sg_past': 'andai', '2sg_past': 'andasti', '3sg_past': 'andò',
  '1pl_past': 'andammo', '2pl_past': 'andaste', '3pl_past': 'andarono',
  '1sg_future': 'andrò', '2sg_future': 'andrai', '3sg_future': 'andrà',
  '1pl_future': 'andremo', '2pl_future': 'andrete', '3pl_future': 'andranno',
};
/** BE: the copula (pass the id 'BE' — its subjunctive stem is irregular: fosse). */
export const ESSERE: Forms = {
  base: 'essere', copula: '1', gerund: 'essendo', participle: 'stato', aux: 'be',
  '1sg_present': 'sono', '2sg_present': 'sei', '3sg_present': 'è',
  '1pl_present': 'siamo', '2pl_present': 'siete', '3pl_present': 'sono',
  '1sg_past': 'fui', '2sg_past': 'fosti', '3sg_past': 'fu',
  '1pl_past': 'fummo', '2pl_past': 'foste', '3pl_past': 'furono',
  '1sg_future': 'sarò', '2sg_future': 'sarai', '3sg_future': 'sarà',
  '1pl_future': 'saremo', '2pl_future': 'sarete', '3pl_future': 'saranno',
};
/** BECOME: copular, essere-selecting. */
export const DIVENTARE: Forms = {
  base: 'diventare', gerund: 'diventando', participle: 'diventato', aux: 'be',
  '1sg_present': 'divento', '2sg_present': 'diventi', '3sg_present': 'diventa',
  '1pl_present': 'diventiamo', '2pl_present': 'diventate', '3pl_present': 'diventano',
  '1sg_past': 'diventai', '2sg_past': 'diventasti', '3sg_past': 'diventò',
  '1pl_past': 'diventammo', '2pl_past': 'diventaste', '3pl_past': 'diventarono',
  '1sg_future': 'diventerò', '2sg_future': 'diventerai', '3sg_future': 'diventerà',
  '1pl_future': 'diventeremo', '2pl_future': 'diventerete', '3pl_future': 'diventeranno',
};
/** SEEM: copular, essere-selecting. */
export const SEMBRARE: Forms = {
  base: 'sembrare', gerund: 'sembrando', participle: 'sembrato', aux: 'be',
  '1sg_present': 'sembro', '2sg_present': 'sembri', '3sg_present': 'sembra',
  '1pl_present': 'sembriamo', '2pl_present': 'sembrate', '3pl_present': 'sembrano',
  '1sg_past': 'sembrai', '2sg_past': 'sembrasti', '3sg_past': 'sembrò',
  '1pl_past': 'sembrammo', '2pl_past': 'sembraste', '3pl_past': 'sembrarono',
  '1sg_future': 'sembrerò', '2sg_future': 'sembrerai', '3sg_future': 'sembrerà',
  '1pl_future': 'sembreremo', '2pl_future': 'sembrerete', '3pl_future': 'sembreranno',
};
/** GIVE: ditransitive (pass the id 'GIVE' — its subjunctive stem is irregular: desse). */
export const DARE: Forms = {
  base: 'dare', gerund: 'dando', participle: 'dato',
  '1sg_present': 'do', '2sg_present': 'dai', '3sg_present': 'dà',
  '1pl_present': 'diamo', '2pl_present': 'date', '3pl_present': 'danno',
  '1sg_past': 'diedi', '2sg_past': 'desti', '3sg_past': 'diede',
  '1pl_past': 'demmo', '2pl_past': 'deste', '3pl_past': 'diedero',
  '1sg_future': 'darò', '2sg_future': 'darai', '3sg_future': 'darà',
  '1pl_future': 'daremo', '2pl_future': 'darete', '3pl_future': 'daranno',
};
export const VEDERE: Forms = {
  base: 'vedere', gerund: 'vedendo', participle: 'visto',
  '1sg_present': 'vedo', '2sg_present': 'vedi', '3sg_present': 'vede',
  '1pl_present': 'vediamo', '2pl_present': 'vedete', '3pl_present': 'vedono',
  '1sg_past': 'vidi', '2sg_past': 'vedesti', '3sg_past': 'vide',
  '1pl_past': 'vedemmo', '2pl_past': 'vedeste', '3pl_past': 'videro',
  '1sg_future': 'vedrò', '2sg_future': 'vedrai', '3sg_future': 'vedrà',
  '1pl_future': 'vedremo', '2pl_future': 'vedrete', '3pl_future': 'vedranno',
};
/** CHOOSE: irregular participle (scelto) and 1sg/3pl present (scelgo / scelgono). */
export const SCEGLIERE: Forms = {
  base: 'scegliere', gerund: 'scegliendo', participle: 'scelto',
  '1sg_present': 'scelgo', '2sg_present': 'scegli', '3sg_present': 'sceglie',
  '1pl_present': 'scegliamo', '2pl_present': 'scegliete', '3pl_present': 'scelgono',
  '1sg_past': 'scelsi', '2sg_past': 'scegliesti', '3sg_past': 'scelse',
  '1pl_past': 'scegliemmo', '2pl_past': 'sceglieste', '3pl_past': 'scelsero',
  '1sg_future': 'sceglierò', '2sg_future': 'sceglierai', '3sg_future': 'sceglierà',
  '1pl_future': 'sceglieremo', '2pl_future': 'sceglierete', '3pl_future': 'sceglieranno',
};
/** RUN: an intransitive that keeps avere ("ha corso"). */
export const CORRERE: Forms = {
  base: 'correre', gerund: 'correndo', participle: 'corso',
  '1sg_present': 'corro', '2sg_present': 'corri', '3sg_present': 'corre',
  '1pl_present': 'corriamo', '2pl_present': 'correte', '3pl_present': 'corrono',
  '1sg_past': 'corsi', '2sg_past': 'corresti', '3sg_past': 'corse',
  '1pl_past': 'corremmo', '2pl_past': 'correste', '3pl_past': 'corsero',
  '1sg_future': 'correrò', '2sg_future': 'correrai', '3sg_future': 'correrà',
  '1pl_future': 'correremo', '2pl_future': 'correrete', '3pl_future': 'correranno',
};
/**
 * COLLAPSE. Inherently reflexive in French (s'effondrer) but not in Italian: "crollare" is a plain
 * unaccusative that selects essere ("è crollato").
 */
export const CROLLARE: Forms = {
  base: 'crollare', gerund: 'crollando', participle: 'crollato', aux: 'be',
  '1sg_present': 'crollo', '2sg_present': 'crolli', '3sg_present': 'crolla',
  '1pl_present': 'crolliamo', '2pl_present': 'crollate', '3pl_present': 'crollano',
  '1sg_past': 'crollai', '2sg_past': 'crollasti', '3sg_past': 'crollò',
  '1pl_past': 'crollammo', '2pl_past': 'crollaste', '3pl_past': 'crollarono',
  '1sg_future': 'crollerò', '2sg_future': 'crollerai', '3sg_future': 'crollerà',
  '1pl_future': 'crolleremo', '2pl_future': 'crollerete', '3pl_future': 'crolleranno',
};

// Modals: `nonfinite` is the truncated infinitive used inside a modal stack ("dover mangiare").
/** MUST. */
export const DOVERE: Forms = {
  base: 'dovere', nonfinite: 'dover',
  '1sg_present': 'devo', '2sg_present': 'devi', '3sg_present': 'deve',
  '1pl_present': 'dobbiamo', '2pl_present': 'dovete', '3pl_present': 'devono',
  '1sg_past': 'dovetti', '2sg_past': 'dovesti', '3sg_past': 'dovette',
  '1pl_past': 'dovemmo', '2pl_past': 'doveste', '3pl_past': 'dovettero',
  '1sg_future': 'dovrò', '2sg_future': 'dovrai', '3sg_future': 'dovrà',
  '1pl_future': 'dovremo', '2pl_future': 'dovrete', '3pl_future': 'dovranno',
};
/** CAN. */
export const POTERE: Forms = {
  base: 'potere', nonfinite: 'poter',
  '1sg_present': 'posso', '2sg_present': 'puoi', '3sg_present': 'può',
  '1pl_present': 'possiamo', '2pl_present': 'potete', '3pl_present': 'possono',
  '1sg_past': 'potei', '2sg_past': 'potesti', '3sg_past': 'poté',
  '1pl_past': 'potemmo', '2pl_past': 'poteste', '3pl_past': 'poterono',
  '1sg_future': 'potrò', '2sg_future': 'potrai', '3sg_future': 'potrà',
  '1pl_future': 'potremo', '2pl_future': 'potrete', '3pl_future': 'potranno',
};
/** WILL (volition: "vuole"). */
export const VOLERE: Forms = {
  base: 'volere', nonfinite: 'voler',
  '1sg_present': 'voglio', '2sg_present': 'vuoi', '3sg_present': 'vuole',
  '1pl_present': 'vogliamo', '2pl_present': 'volete', '3pl_present': 'vogliono',
  '1sg_past': 'volli', '2sg_past': 'volesti', '3sg_past': 'volle',
  '1pl_past': 'volemmo', '2pl_past': 'voleste', '3pl_past': 'vollero',
  '1sg_future': 'vorrò', '2sg_future': 'vorrai', '3sg_future': 'vorrà',
  '1pl_future': 'vorremo', '2pl_future': 'vorrete', '3pl_future': 'vorranno',
};
export const BARCA: Forms = { base: 'barca', plural: 'barche', gender: 'fem', count: 'singular' };
export const VELA: Forms = { base: 'vela', plural: 'vele', gender: 'fem', count: 'singular' };
