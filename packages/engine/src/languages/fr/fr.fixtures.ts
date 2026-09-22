import type { Forms } from '../resolved.fixtures.js';

export * from '../resolved.fixtures.js';

// Hand-built resolved inputs for the French function-level unit tests. The forms mirror the seeded
// French lexicon (packages/backend/src/concepts, with verbs/nonfinite.ts folded in) plus the keys the
// lexicon and translator thread onto them (animate, human, uncountable, proper, isA, role,
// mannerRelation, dimensionRelation, definiteness, number, degree…), trimmed to what the functions
// read — so each test shows exactly which forms drive its output. Rendering through the real
// lexicon is covered by the sentence-level suite in packages/engine/test. The builders come from
// the language-neutral `resolved.fixtures.ts`.
//
// Some French functions key off the concept id (PRENOMINAL adjectives, the suppletive bon/mauvais,
// the irregular participle stems of être/avoir/savoir); pass it through `concept(forms, id)` or
// `vp(forms, extra, id)` — the builders default to 'TEST'.

// ── Nouns ───────────────────────────────────────────────────────────────────

export const CHAT: Forms = { base: 'chat', plural: 'chats', gender: 'masc', count: 'singular', fem: 'chatte', fem_plural: 'chattes', animate: '1', isA: 'MAMMAL' };
export const CHIEN: Forms = { base: 'chien', plural: 'chiens', gender: 'masc', count: 'singular', fem: 'chienne', fem_plural: 'chiennes', animate: '1', isA: 'MAMMAL' };
export const SOURIS: Forms = { base: 'souris', plural: 'souris', gender: 'fem', count: 'singular', animate: '1', isA: 'MAMMAL' };
export const RENARD: Forms = { base: 'renard', plural: 'renards', gender: 'masc', count: 'singular', animate: '1', isA: 'MAMMAL' };
export const GARCON: Forms = { base: 'garçon', plural: 'garçons', gender: 'masc', count: 'singular', animate: '1', human: '1', isA: 'PERSON' };
/** An h muet noun: the corpus marks it `elides` ("l'homme", "cet homme"). */
export const HOMME: Forms = { base: 'homme', plural: 'hommes', gender: 'masc', count: 'singular', elides: '1', animate: '1', human: '1', isA: 'PERSON' };
export const FEMME: Forms = { base: 'femme', plural: 'femmes', gender: 'fem', count: 'singular', animate: '1', human: '1', isA: 'PERSON' };
export const ENFANT: Forms = { base: 'enfant', plural: 'enfants', gender: 'masc', count: 'singular', fem: 'enfant', fem_plural: 'enfants', animate: '1', human: '1' };
export const PERSONNE: Forms = { base: 'personne', plural: 'personnes', gender: 'fem', count: 'singular', animate: '1', human: '1' };
export const PERE: Forms = { base: 'père', plural: 'pères', gender: 'masc', count: 'singular', animate: '1', human: '1' };
export const BOUCHER: Forms = { base: 'boucher', plural: 'bouchers', gender: 'masc', count: 'singular', fem: 'bouchère', fem_plural: 'bouchères', animate: '1', human: '1', isA: 'PERSON' };
export const CREATEUR: Forms = { base: 'créateur', plural: 'créateurs', gender: 'masc', count: 'singular', fem: 'créatrice', fem_plural: 'créatrices', animate: '1', isA: 'PERSON' };
/** A vowel-initial masculine noun. */
export const ANGE: Forms = { base: 'ange', plural: 'anges', gender: 'masc', count: 'singular', animate: '1' };
export const ANIMAL: Forms = { base: 'animal', plural: 'animaux', gender: 'masc', count: 'singular', animate: '1' };

export const LIVRE: Forms = { base: 'livre', plural: 'livres', gender: 'masc', count: 'singular' };
export const MAISON: Forms = { base: 'maison', plural: 'maisons', gender: 'fem', count: 'singular' };
export const FOYER: Forms = { base: 'foyer', plural: 'foyers', gender: 'masc', count: 'singular' };
export const MARCHE: Forms = { base: 'marché', plural: 'marchés', gender: 'masc', count: 'singular' };
export const PRISON: Forms = { base: 'prison', plural: 'prisons', gender: 'fem', count: 'singular' };
export const FEU: Forms = { base: 'feu', plural: 'feux', gender: 'masc', count: 'singular' };
export const BATON: Forms = { base: 'bâton', plural: 'bâtons', gender: 'masc', count: 'singular' };
/** A vowel-initial feminine noun. */
export const AILE: Forms = { base: 'aile', plural: 'ailes', gender: 'fem', count: 'singular' };
export const MOT: Forms = { base: 'mot', plural: 'mots', gender: 'masc', count: 'singular' };
export const PHRASE: Forms = { base: 'phrase', plural: 'phrases', gender: 'fem', count: 'singular' };
export const LEGENDE: Forms = { base: 'légende', plural: 'légendes', gender: 'fem', count: 'singular' };

/** Mass nouns (no plural): vowel-initial feminine and masculine, consonant-initial feminine. */
export const EAU: Forms = { base: 'eau', gender: 'fem', count: 'singular', uncountable: '1' };
export const ARGENT: Forms = { base: 'argent', gender: 'masc', count: 'singular', uncountable: '1' };
export const NOURRITURE: Forms = { base: 'nourriture', gender: 'fem', count: 'singular', uncountable: '1' };
export const ANGLAIS: Forms = { base: 'anglais', gender: 'masc', count: 'singular', uncountable: '1', isA: 'LANGUAGE' };

/** Continents: proper, uncountable, always articled in French ("l'Afrique", "l'Antarctique"). */
export const AFRIQUE: Forms = { base: 'Afrique', gender: 'fem', count: 'singular', proper: '1', uncountable: '1', isA: 'CONTINENT' };
export const EUROPE: Forms = { base: 'Europe', gender: 'fem', count: 'singular', proper: '1', uncountable: '1', isA: 'CONTINENT' };
export const ASIE: Forms = { base: 'Asie', gender: 'fem', count: 'singular', proper: '1', uncountable: '1', isA: 'CONTINENT' };
export const ANTARCTIQUE: Forms = { base: 'Antarctique', gender: 'masc', count: 'singular', proper: '1', uncountable: '1', isA: 'CONTINENT' };
export const CONTINENT: Forms = { base: 'continent', plural: 'continents', gender: 'masc', count: 'singular' };

/** Manner nouns, by `mannerRelation` ("à grande vitesse", "avec soin", "d'une bonne manière"). */
export const VITESSE: Forms = { base: 'vitesse', plural: 'vitesses', gender: 'fem', count: 'singular', mannerRelation: 'measure' };
export const MANIERE: Forms = { base: 'manière', plural: 'manières', gender: 'fem', count: 'singular', mannerRelation: 'mode' };
export const TEMPS: Forms = { base: 'temps', plural: 'temps', gender: 'masc', count: 'singular', mannerRelation: 'measure' };
export const SOIN: Forms = { base: 'soin', gender: 'masc', count: 'singular', uncountable: '1', mannerRelation: 'means' };

/** Dimension nouns, by `dimensionRelation` ("de grande taille", "à haute température"). */
export const TAILLE: Forms = { base: 'taille', plural: 'tailles', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
export const HAUTEUR: Forms = { base: 'hauteur', plural: 'hauteurs', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
/** The only vowel-initial dimension noun. */
export const AGE: Forms = { base: 'âge', plural: 'âges', gender: 'masc', count: 'singular', dimensionRelation: 'extent' };
export const QUALITE: Forms = { base: 'qualité', plural: 'qualités', gender: 'fem', count: 'singular', dimensionRelation: 'quality' };
export const TEMPERATURE: Forms = { base: 'température', plural: 'températures', gender: 'fem', count: 'singular', dimensionRelation: 'measure' };

// ── Pronouns ────────────────────────────────────────────────────────────────

export const JE: Forms = { base: 'je', person: '1', number: 'singular', plural: 'nous', disjunctive: 'moi', disjunctive_plural: 'nous', object: 'me', object_plural: 'nous' };
export const TU: Forms = { base: 'tu', person: '2', number: 'singular', plural: 'vous', disjunctive: 'toi', disjunctive_plural: 'vous', object: 'te', object_plural: 'vous' };
export const IL: Forms = {
  base: 'il', person: '3', number: 'singular', gender: 'masc', singular_fem: 'elle', singular_neut: 'cela', plural: 'ils', plural_fem: 'elles',
  disjunctive: 'lui', disjunctive_fem: 'elle', disjunctive_neut: 'cela', disjunctive_plural: 'eux',
  object: 'le', object_fem: 'la', object_neut: 'le', object_plural: 'les',
};
/** The generic subject "on". */
export const ON: Forms = { base: 'on', person: '3', number: 'singular', generic: '1' };

// ── Adjectives ──────────────────────────────────────────────────────────────
// Prenominal ones (BIG, SMALL, GOOD, BAD, OLD, YOUNG, NEW, BEAUTIFUL, FIRST…) are recognised by
// concept id, so build them with `concept(GRAND, 'BIG')`.

export const GRAND: Forms = { role: 'adjective', base: 'grand' };
export const PETIT: Forms = { role: 'adjective', base: 'petit' };
export const BON: Forms = { role: 'adjective', base: 'bon' };
export const MAUVAIS: Forms = { role: 'adjective', base: 'mauvais' };
export const BEAU: Forms = { role: 'adjective', base: 'beau' };
export const NOUVEAU: Forms = { role: 'adjective', base: 'nouveau' };
export const VIEUX: Forms = { role: 'adjective', base: 'vieux' };
export const JEUNE: Forms = { role: 'adjective', base: 'jeune' };
export const HAUT: Forms = { role: 'adjective', base: 'haut' };
export const BAS: Forms = { role: 'adjective', base: 'bas' };
export const HEUREUX: Forms = { role: 'adjective', base: 'heureux', transient: '1' };
export const PARESSEUX: Forms = { role: 'adjective', base: 'paresseux' };
export const TRISTE: Forms = { role: 'adjective', base: 'triste', transient: '1' };
export const FORT: Forms = { role: 'adjective', base: 'fort' };
export const RAPIDE: Forms = { role: 'adjective', base: 'rapide' };
export const FATIGUE: Forms = { role: 'adjective', base: 'fatigué', transient: '1' };
export const FROID: Forms = { role: 'adjective', base: 'froid', transient: '1' };
export const BRUN: Forms = { role: 'adjective', base: 'brun' };
export const INTERESSANT: Forms = { role: 'adjective', base: 'intéressant' };
export const NEGATIF: Forms = { role: 'adjective', base: 'négatif' };
export const PREMIER: Forms = { role: 'adjective', base: 'premier' };
export const ENTIER: Forms = { role: 'adjective', base: 'entier' };
export const PROXIMAL: Forms = { role: 'adjective', base: 'proximal' };
export const UNIVERSEL: Forms = { role: 'adjective', base: 'universel' };
export const SEMANTIQUE: Forms = { role: 'adjective', base: 'sémantique' };

// ── Adverbs ─────────────────────────────────────────────────────────────────

export const VITE: Forms = { base: 'vite' };
export const LENTEMENT: Forms = { base: 'lentement' };
export const BIEN: Forms = { base: 'bien' };
export const TOUJOURS: Forms = { base: 'toujours', subtype: 'frequency' };
export const JAMAIS: Forms = { base: 'jamais', subtype: 'frequency', polarity: 'negative' };

// ── Verbs ───────────────────────────────────────────────────────────────────

export const MANGER: Forms = {
  base: 'manger', participle: 'mangé',
  '1sg_present': 'mange', '2sg_present': 'manges', '3sg_present': 'mange',
  '1pl_present': 'mangeons', '2pl_present': 'mangez', '3pl_present': 'mangent',
  '1sg_past': 'mangeai', '2sg_past': 'mangeas', '3sg_past': 'mangea',
  '1pl_past': 'mangeâmes', '2pl_past': 'mangeâtes', '3pl_past': 'mangèrent',
  '1sg_future': 'mangerai', '2sg_future': 'mangeras', '3sg_future': 'mangera',
  '1pl_future': 'mangerons', '2pl_future': 'mangerez', '3pl_future': 'mangeront',
};
/** A verb on an h muet, which its lexeme marks `elides` as a noun's does ("j'habite", A227). */
export const HABITER: Forms = {
  base: 'habiter', participle: 'habité', elides: '1',
  '1sg_present': 'habite', '2sg_present': 'habites', '3sg_present': 'habite',
  '1pl_present': 'habitons', '2pl_present': 'habitez', '3pl_present': 'habitent',
};
/** An être-selecting verb ("est allé"). */
export const ALLER: Forms = {
  base: 'aller', participle: 'allé', aux: 'be',
  '1sg_present': 'vais', '2sg_present': 'vas', '3sg_present': 'va',
  '1pl_present': 'allons', '2pl_present': 'allez', '3pl_present': 'vont',
  '1sg_past': 'allai', '2sg_past': 'allas', '3sg_past': 'alla',
  '1pl_past': 'allâmes', '2pl_past': 'allâtes', '3pl_past': 'allèrent',
  '1sg_future': 'irai', '2sg_future': 'iras', '3sg_future': 'ira',
  '1pl_future': 'irons', '2pl_future': 'irez', '3pl_future': 'iront',
};
export const VENIR: Forms = {
  base: 'venir', participle: 'venu', aux: 'be',
  '1sg_present': 'viens', '2sg_present': 'viens', '3sg_present': 'vient',
  '1pl_present': 'venons', '2pl_present': 'venez', '3pl_present': 'viennent',
  '1sg_past': 'vins', '2sg_past': 'vins', '3sg_past': 'vint',
  '1pl_past': 'vînmes', '2pl_past': 'vîntes', '3pl_past': 'vinrent',
  '1sg_future': 'viendrai', '2sg_future': 'viendras', '3sg_future': 'viendra',
  '1pl_future': 'viendrons', '2pl_future': 'viendrez', '3pl_future': 'viendront',
};
/** The copula (concept id BE); its resultative takes avoir ("a été"). */
export const ETRE: Forms = {
  base: 'être', stative: '1', copula: '1', participle: 'été',
  '1sg_present': 'suis', '2sg_present': 'es', '3sg_present': 'est',
  '1pl_present': 'sommes', '2pl_present': 'êtes', '3pl_present': 'sont',
  '1sg_past': 'fus', '2sg_past': 'fus', '3sg_past': 'fut',
  '1pl_past': 'fûmes', '2pl_past': 'fûtes', '3pl_past': 'furent',
  '1sg_future': 'serai', '2sg_future': 'seras', '3sg_future': 'sera',
  '1pl_future': 'serons', '2pl_future': 'serez', '3pl_future': 'seront',
};
export const DEVENIR: Forms = {
  base: 'devenir', participle: 'devenu', aux: 'be',
  '1sg_present': 'deviens', '2sg_present': 'deviens', '3sg_present': 'devient',
  '1pl_present': 'devenons', '2pl_present': 'devenez', '3pl_present': 'deviennent',
  '1sg_past': 'devins', '2sg_past': 'devins', '3sg_past': 'devint',
  '1pl_past': 'devînmes', '2pl_past': 'devîntes', '3pl_past': 'devinrent',
  '1sg_future': 'deviendrai', '2sg_future': 'deviendras', '3sg_future': 'deviendra',
  '1pl_future': 'deviendrons', '2pl_future': 'deviendrez', '3pl_future': 'deviendront',
};
export const SEMBLER: Forms = {
  base: 'sembler', stative: '1', participle: 'semblé',
  '1sg_present': 'semble', '2sg_present': 'sembles', '3sg_present': 'semble',
  '1pl_present': 'semblons', '2pl_present': 'semblez', '3pl_present': 'semblent',
  '1sg_past': 'semblai', '2sg_past': 'semblas', '3sg_past': 'sembla',
  '1pl_past': 'semblâmes', '2pl_past': 'semblâtes', '3pl_past': 'semblèrent',
  '1sg_future': 'semblerai', '2sg_future': 'sembleras', '3sg_future': 'semblera',
  '1pl_future': 'semblerons', '2pl_future': 'semblerez', '3pl_future': 'sembleront',
};
export const DONNER: Forms = {
  base: 'donner', participle: 'donné',
  '1sg_present': 'donne', '2sg_present': 'donnes', '3sg_present': 'donne',
  '1pl_present': 'donnons', '2pl_present': 'donnez', '3pl_present': 'donnent',
  '1sg_past': 'donnai', '2sg_past': 'donnas', '3sg_past': 'donna',
  '1pl_past': 'donnâmes', '2pl_past': 'donnâtes', '3pl_past': 'donnèrent',
  '1sg_future': 'donnerai', '2sg_future': 'donneras', '3sg_future': 'donnera',
  '1pl_future': 'donnerons', '2pl_future': 'donnerez', '3pl_future': 'donneront',
};
export const VOIR: Forms = {
  base: 'voir', participle: 'vu',
  '1sg_present': 'vois', '2sg_present': 'vois', '3sg_present': 'voit',
  '1pl_present': 'voyons', '2pl_present': 'voyez', '3pl_present': 'voient',
  '1sg_past': 'vis', '2sg_past': 'vis', '3sg_past': 'vit',
  '1pl_past': 'vîmes', '2pl_past': 'vîtes', '3pl_past': 'virent',
  '1sg_future': 'verrai', '2sg_future': 'verras', '3sg_future': 'verra',
  '1pl_future': 'verrons', '2pl_future': 'verrez', '3pl_future': 'verront',
};
export const CHOISIR: Forms = {
  base: 'choisir', participle: 'choisi',
  '1sg_present': 'choisis', '2sg_present': 'choisis', '3sg_present': 'choisit',
  '1pl_present': 'choisissons', '2pl_present': 'choisissez', '3pl_present': 'choisissent',
  '1sg_past': 'choisis', '2sg_past': 'choisis', '3sg_past': 'choisit',
  '1pl_past': 'choisîmes', '2pl_past': 'choisîtes', '3pl_past': 'choisirent',
  '1sg_future': 'choisirai', '2sg_future': 'choisiras', '3sg_future': 'choisira',
  '1pl_future': 'choisirons', '2pl_future': 'choisirez', '3pl_future': 'choisiront',
};
/** Concept id KNOW — one of the irregular present-participle stems ("sachant"). */
export const SAVOIR: Forms = {
  base: 'savoir', stative: '1', participle: 'su',
  '1sg_present': 'sais', '2sg_present': 'sais', '3sg_present': 'sait',
  '1pl_present': 'savons', '2pl_present': 'savez', '3pl_present': 'savent',
  '1sg_past': 'sus', '2sg_past': 'sus', '3sg_past': 'sut',
  '1pl_past': 'sûmes', '2pl_past': 'sûtes', '3pl_past': 'surent',
  '1sg_future': 'saurai', '2sg_future': 'sauras', '3sg_future': 'saura',
  '1pl_future': 'saurons', '2pl_future': 'saurez', '3pl_future': 'sauront',
};
/**
 * An inherently reflexive, être-selecting verb (concept id COLLAPSE). The clitic rides inside each
 * finite form ("s'effondre"; 1pl/2pl carry only the second pronoun) but not the participle.
 */
export const EFFONDRER: Forms = {
  base: "s'effondrer", participle: 'effondré', aux: 'be',
  '1sg_present': "m'effondre", '2sg_present': "t'effondres", '3sg_present': "s'effondre",
  '1pl_present': 'nous effondrons', '2pl_present': 'vous effondrez', '3pl_present': "s'effondrent",
  '1sg_past': "m'effondrai", '2sg_past': "t'effondras", '3sg_past': "s'effondra",
  '1pl_past': 'nous effondrâmes', '2pl_past': 'vous effondrâtes', '3pl_past': "s'effondrèrent",
  '1sg_future': "m'effondrerai", '2sg_future': "t'effondreras", '3sg_future': "s'effondrera",
  '1pl_future': 'nous effondrerons', '2pl_future': 'vous effondrerez', '3pl_future': "s'effondreront",
};

// ── Modals ──────────────────────────────────────────────────────────────────

export const DEVOIR: Forms = {
  base: 'devoir', stative: '1',
  '1sg_present': 'dois', '2sg_present': 'dois', '3sg_present': 'doit',
  '1pl_present': 'devons', '2pl_present': 'devez', '3pl_present': 'doivent',
  '1sg_past': 'dus', '2sg_past': 'dus', '3sg_past': 'dut',
  '1pl_past': 'dûmes', '2pl_past': 'dûtes', '3pl_past': 'durent',
  '1sg_future': 'devrai', '2sg_future': 'devras', '3sg_future': 'devra',
  '1pl_future': 'devrons', '2pl_future': 'devrez', '3pl_future': 'devront',
};
export const POUVOIR: Forms = {
  base: 'pouvoir', stative: '1',
  '1sg_present': 'peux', '2sg_present': 'peux', '3sg_present': 'peut',
  '1pl_present': 'pouvons', '2pl_present': 'pouvez', '3pl_present': 'peuvent',
  '1sg_past': 'pus', '2sg_past': 'pus', '3sg_past': 'put',
  '1pl_past': 'pûmes', '2pl_past': 'pûtes', '3pl_past': 'purent',
  '1sg_future': 'pourrai', '2sg_future': 'pourras', '3sg_future': 'pourra',
  '1pl_future': 'pourrons', '2pl_future': 'pourrez', '3pl_future': 'pourront',
};
export const VOULOIR: Forms = {
  base: 'vouloir', stative: '1',
  '1sg_present': 'veux', '2sg_present': 'veux', '3sg_present': 'veut',
  '1pl_present': 'voulons', '2pl_present': 'voulez', '3pl_present': 'veulent',
  '1sg_past': 'voulus', '2sg_past': 'voulus', '3sg_past': 'voulut',
  '1pl_past': 'voulûmes', '2pl_past': 'voulûtes', '3pl_past': 'voulurent',
  '1sg_future': 'voudrai', '2sg_future': 'voudras', '3sg_future': 'voudra',
  '1pl_future': 'voudrons', '2pl_future': 'voudrez', '3pl_future': 'voudront',
};
export const LUMIERE: Forms = { base: 'lumière', plural: 'lumières', gender: 'fem', count: 'singular' };
