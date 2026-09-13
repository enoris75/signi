import type { Forms } from '../resolved.fixtures.js';

export * from '../resolved.fixtures.js';

// Hand-built resolved inputs for the German function-level unit tests. The forms mirror the seeded
// German lexicon (packages/backend/src/concepts) plus the keys the lexicon and translator thread
// onto them (animate, uncountable, proper, role, definiteness, number, degree…), trimmed to what the
// functions read — so each test shows exactly which forms drive its output. Rendering through the
// real lexicon is covered by the sentence-level suite in packages/engine/test. The builders come
// from the language-neutral `resolved.fixtures.ts`.

// ── Lexicon ─────────────────────────────────────────────────────────────────

export const KATER: Forms = { base: 'Kater', plural: 'Kater', gender: 'masc', count: 'singular', animate: '1' };
export const KATZE: Forms = { base: 'Katze', plural: 'Katzen', gender: 'fem', count: 'singular', animate: '1' };
export const MAUS: Forms = { base: 'Maus', plural: 'Mäuse', gender: 'fem', count: 'singular', animate: '1' };
export const MANN: Forms = { base: 'Mann', plural: 'Männer', gender: 'masc', count: 'singular', animate: '1' };
/** A weak masculine (n-declension) noun. */
export const JUNGE: Forms = { base: 'Junge', plural: 'Jungen', gender: 'masc', count: 'singular', weak: '1', animate: '1' };
export const BUCH: Forms = { base: 'Buch', plural: 'Bücher', gender: 'neut', count: 'singular' };
export const HAUS: Forms = { base: 'Haus', plural: 'Häuser', gender: 'neut', count: 'singular' };
export const WORT: Forms = { base: 'Wort', plural: 'Wörter', gender: 'neut', count: 'singular' };
export const BEHAELTER: Forms = { base: 'Behälter', plural: 'Behälter', gender: 'masc', count: 'singular' };
export const MESSER: Forms = { base: 'Messer', plural: 'Messer', gender: 'neut', count: 'singular' };
export const BOOT: Forms = { base: 'Boot', plural: 'Boote', gender: 'neut', count: 'singular' };
export const SEGEL: Forms = { base: 'Segel', plural: 'Segel', gender: 'neut', count: 'singular' };
/** A mass noun. */
export const WASSER: Forms = { base: 'Wasser', gender: 'neut', count: 'singular', uncountable: '1' };
/** A proper name that goes bare. */
export const EUROPA: Forms = { base: 'Europa', gender: 'neut', count: 'singular', proper: '1' };
/** A proper name that is inherently articled. */
export const SCHWEIZ: Forms = { base: 'Schweiz', gender: 'fem', count: 'singular', proper: '1', takes_article: '1' };
export const GESCHWINDIGKEIT: Forms = { base: 'Geschwindigkeit', plural: 'Geschwindigkeiten', gender: 'fem', count: 'singular', mannerRelation: 'measure' };
/** An uncountable means noun ("mit Sorgfalt"). */
export const SORGFALT: Forms = { base: 'Sorgfalt', gender: 'fem', count: 'singular', uncountable: '1', mannerRelation: 'means' };
export const WEISE: Forms = { base: 'Weise', plural: 'Weisen', gender: 'fem', count: 'singular', mannerRelation: 'mode' };
export const WIND: Forms = { base: 'Wind', plural: 'Winde', gender: 'masc', count: 'singular' };
export const GROESSE: Forms = { base: 'Größe', plural: 'Größen', gender: 'fem', count: 'singular', dimensionRelation: 'extent' };
export const QUALITAET: Forms = { base: 'Qualität', plural: 'Qualitäten', gender: 'fem', count: 'singular', dimensionRelation: 'quality' };

export const ICH: Forms = { base: 'ich', person: '1', number: 'singular', plural: 'wir', disjunctive: 'mir', object: 'mich', object_plural: 'uns' };
export const DU: Forms = { base: 'du', person: '2', number: 'singular', plural: 'ihr', disjunctive: 'dir', object: 'dich', object_plural: 'euch' };
export const ER: Forms = { base: 'er', person: '3', number: 'singular', gender: 'masc', plural: 'sie', disjunctive: 'ihm', object: 'ihn', object_fem: 'sie', object_neut: 'es', object_plural: 'sie' };
export const MAN: Forms = { base: 'man', person: '3', number: 'singular', generic: '1' };

export const GROSS: Forms = { role: 'adjective', base: 'groß', umlaut: 'true', superlative: 'größt' };
export const KLEIN: Forms = { role: 'adjective', base: 'klein' };
export const GUT: Forms = { role: 'adjective', base: 'gut', comparative: 'besser', superlative: 'best' };
export const HOCH: Forms = { role: 'adjective', base: 'hoch', attributive: 'hoh', comparative: 'höher', superlative: 'höchst' };
export const MUEDE: Forms = { role: 'adjective', base: 'müde' };
export const ALT: Forms = { role: 'adjective', base: 'alt', umlaut: 'true' };

export const SCHNELL: Forms = { base: 'schnell' };
export const IMMER: Forms = { base: 'immer', subtype: 'frequency' };
export const NIE: Forms = { base: 'nie', subtype: 'frequency', polarity: 'negative' };

export const ESSEN: Forms = {
  base: 'essen', participle: 'gegessen',
  '1sg_present': 'esse', '2sg_present': 'isst', '3sg_present': 'isst',
  '1pl_present': 'essen', '2pl_present': 'esst', '3pl_present': 'essen',
  '1sg_past': 'aß', '2sg_past': 'aßest', '3sg_past': 'aß',
  '1pl_past': 'aßen', '2pl_past': 'aßt', '3pl_past': 'aßen',
  '2sg_imperative': 'iss',
};
/** A sein-selecting verb ("ist gegangen"). */
export const GEHEN: Forms = {
  base: 'gehen', participle: 'gegangen', aux: 'be',
  '1sg_present': 'gehe', '2sg_present': 'gehst', '3sg_present': 'geht',
  '1pl_present': 'gehen', '2pl_present': 'geht', '3pl_present': 'gehen',
  '3sg_past': 'ging', '3pl_past': 'gingen',
};
export const GEBEN: Forms = {
  base: 'geben', participle: 'gegeben',
  '1sg_present': 'gebe', '2sg_present': 'gibst', '3sg_present': 'gibt',
  '1pl_present': 'geben', '2pl_present': 'gebt', '3pl_present': 'geben',
  '2sg_imperative': 'gib',
};
export const SCHNEIDEN: Forms = { base: 'schneiden', participle: 'geschnitten', '3sg_present': 'schneidet' };
export const WAEHLEN: Forms = { base: 'wählen', participle: 'gewählt', '3sg_present': 'wählt' };
export const WERDEN_VERB: Forms = { base: 'werden', participle: 'geworden', aux: 'be', '3sg_present': 'wird' };
/** The seeming verb (`seeming`): a predicate noun under it takes "zu sein". */
export const SCHEINEN: Forms = {
  base: 'scheinen', participle: 'geschienen', seeming: '1',
  '3sg_present': 'scheint', '3pl_present': 'scheinen', '3sg_past': 'schien',
};
export const MUESSEN: Forms = { base: 'müssen', '1sg_present': 'muss', '3sg_present': 'muss', '3pl_present': 'müssen', '3sg_past': 'musste' };
export const KOENNEN: Forms = { base: 'können', '3sg_present': 'kann' };
export const WOLLEN: Forms = { base: 'wollen', '3sg_present': 'will' };
