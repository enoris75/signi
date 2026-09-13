import type { Forms } from '../resolved.fixtures.js';

export * from '../resolved.fixtures.js';

// Hand-built resolved inputs for the English function-level unit tests. The forms mirror the seeded
// English lexicon (packages/backend/src/concepts, with the verbs' gerund/participle/aux merged in
// from verbs/nonfinite.ts) plus the keys the lexicon and translator thread onto them (animate,
// human, uncountable, proper, mannerRelation, dimensionRelation, transient, role, definiteness,
// number, degree…), trimmed to what the functions read — so each test shows exactly which forms
// drive its output. Rendering through the real lexicon is covered by the sentence-level suite in
// packages/engine/test. The builders come from the language-neutral `resolved.fixtures.ts`.

// ── Lexicon: nouns ──────────────────────────────────────────────────────────

export const CAT: Forms = { base: 'cat', plural: 'cats', count: 'singular', animate: '1' };
export const DOG: Forms = { base: 'dog', plural: 'dogs', count: 'singular', animate: '1' };
export const ANIMAL: Forms = { base: 'animal', plural: 'animals', count: 'singular', animate: '1' };
export const FOX: Forms = { base: 'fox', plural: 'foxes', count: 'singular', animate: '1' };
/** Irregular plurals. */
export const MOUSE: Forms = { base: 'mouse', plural: 'mice', count: 'singular', animate: '1' };
export const WOLF: Forms = { base: 'wolf', plural: 'wolves', count: 'singular', animate: '1' };
export const OX: Forms = { base: 'ox', plural: 'oxen', count: 'singular', animate: '1' };
/** Animate but not a person: relativises with "that". */
export const CREATOR: Forms = { base: 'creator', plural: 'creators', count: 'singular', animate: '1' };
/** Persons (`human`): relativise with "who". */
export const BOY: Forms = { base: 'boy', plural: 'boys', count: 'singular', animate: '1', human: '1' };
export const MAN: Forms = { base: 'man', plural: 'men', count: 'singular', animate: '1', human: '1' };
export const WOMAN: Forms = { base: 'woman', plural: 'women', count: 'singular', animate: '1', human: '1' };
export const CHILD: Forms = { base: 'child', plural: 'children', count: 'singular', animate: '1', human: '1' };
export const PERSON: Forms = { base: 'person', plural: 'people', count: 'singular', animate: '1', human: '1' };
export const BUTCHER: Forms = { base: 'butcher', plural: 'butchers', count: 'singular', animate: '1', human: '1' };

export const BOOK: Forms = { base: 'book', plural: 'books', count: 'singular' };
export const HOUSE: Forms = { base: 'house', plural: 'houses', count: 'singular' };
export const WORD: Forms = { base: 'word', plural: 'words', count: 'singular' };
export const PHRASE: Forms = { base: 'phrase', plural: 'phrases', count: 'singular' };
export const LEGEND: Forms = { base: 'legend', plural: 'legends', count: 'singular' };
export const STICK: Forms = { base: 'stick', plural: 'sticks', count: 'singular' };
export const FIRE: Forms = { base: 'fire', plural: 'fires', count: 'singular' };
export const PROCESS: Forms = { base: 'process', plural: 'processes', count: 'singular' };
/** OBJECT_THING — a vowel-initial noun ("an object"). */
export const OBJECT: Forms = { base: 'object', plural: 'objects', count: 'singular' };
/** Mass nouns. */
export const WATER: Forms = { base: 'water', count: 'singular', uncountable: '1' };
export const FOOD: Forms = { base: 'food', count: 'singular', uncountable: '1' };
/** A proper name: English gives it no article. */
export const AFRICA: Forms = { base: 'Africa', count: 'singular', uncountable: '1', proper: '1' };
export const EUROPE: Forms = { base: 'Europe', count: 'singular', uncountable: '1', proper: '1' };

/** Manner nouns: the `mannerRelation` picks the manner adverbial's preposition. */
export const SPEED: Forms = { base: 'speed', plural: 'speeds', count: 'singular', mannerRelation: 'measure' };
export const TIME: Forms = { base: 'time', plural: 'times', count: 'singular', mannerRelation: 'measure' };
export const WAY: Forms = { base: 'way', plural: 'ways', count: 'singular', mannerRelation: 'mode' };
export const CARE: Forms = { base: 'care', count: 'singular', uncountable: '1', mannerRelation: 'means' };
/** Dimension nouns: the `dimensionRelation` picks the adjective-definition gloss adposition. */
export const SIZE: Forms = { base: 'size', plural: 'sizes', count: 'singular', dimensionRelation: 'extent' };
export const QUALITY: Forms = { base: 'quality', plural: 'qualities', count: 'singular', dimensionRelation: 'quality' };
export const TEMPERATURE: Forms = { base: 'temperature', plural: 'temperatures', count: 'singular', dimensionRelation: 'measure' };

// ── Lexicon: pronouns ───────────────────────────────────────────────────────

export const I: Forms = { base: 'I', person: '1', number: 'singular', plural: 'we', disjunctive: 'me', disjunctive_plural: 'us', object: 'me', object_plural: 'us' };
export const YOU: Forms = { base: 'you', person: '2', number: 'singular', plural: 'you', disjunctive: 'you', disjunctive_plural: 'you', object: 'you', object_plural: 'you' };
export const HE: Forms = {
  base: 'he', person: '3', number: 'singular', gender: 'masc', singular_fem: 'she', singular_neut: 'it', plural: 'they',
  disjunctive: 'him', disjunctive_fem: 'her', disjunctive_neut: 'it', disjunctive_plural: 'them',
  object: 'him', object_fem: 'her', object_neut: 'it', object_plural: 'them',
};
/** GENERIC_PERSON, the impersonal "one". */
export const ONE: Forms = { base: 'one', person: '3', number: 'singular', generic: '1' };
// The same pronouns as the translator resolves them for another gender/number: it synthesises the
// surface into `base` (and `plural`) and the matching oblique into `disjunctive`.
export const SHE: Forms = { ...HE, base: 'she', gender: 'fem', disjunctive: 'her' };
export const IT: Forms = { ...HE, base: 'it', gender: 'neut', disjunctive: 'it' };
export const WE: Forms = { ...I, base: 'we', number: 'plural', gender: 'masc', disjunctive: 'us' };
export const THEY: Forms = { ...HE, base: 'they', number: 'plural', disjunctive: 'them' };

// ── Lexicon: adjectives ─────────────────────────────────────────────────────

export const BIG: Forms = { role: 'adjective', base: 'big' };
export const SMALL: Forms = { role: 'adjective', base: 'small' };
export const GREAT: Forms = { role: 'adjective', base: 'great' };
export const HIGH: Forms = { role: 'adjective', base: 'high' };
export const LOW: Forms = { role: 'adjective', base: 'low' };
export const NEW: Forms = { role: 'adjective', base: 'new' };
export const OLD: Forms = { role: 'adjective', base: 'old' };
export const YOUNG: Forms = { role: 'adjective', base: 'young' };
export const STRONG: Forms = { role: 'adjective', base: 'strong' };
export const BROWN: Forms = { role: 'adjective', base: 'brown' };
export const QUICK: Forms = { role: 'adjective', base: 'quick' };
export const LAZY: Forms = { role: 'adjective', base: 'lazy' };
/** Suppletive comparison (good → better → best, bad → worse → worst). */
export const GOOD: Forms = { role: 'adjective', base: 'good' };
export const BAD: Forms = { role: 'adjective', base: 'bad' };
/** Long adjectives: periphrastic comparison ("more beautiful"). */
export const BEAUTIFUL: Forms = { role: 'adjective', base: 'beautiful' };
export const INTERESTING: Forms = { role: 'adjective', base: 'interesting' };
export const CAREFUL: Forms = { role: 'adjective', base: 'careful' };
export const SEMANTIC: Forms = { role: 'adjective', base: 'semantic' };
/** Transient-state adjectives (`transient`, read by es/pt for estar). */
export const HAPPY: Forms = { role: 'adjective', base: 'happy', transient: '1' };
export const SAD: Forms = { role: 'adjective', base: 'sad', transient: '1' };
export const HOT: Forms = { role: 'adjective', base: 'hot', transient: '1' };
export const HUNGRY: Forms = { role: 'adjective', base: 'hungry', transient: '1' };
/** Participial adjectives: periphrastic whatever their length ("more tired"). */
export const TIRED: Forms = { role: 'adjective', base: 'tired', transient: '1' };
export const HIDDEN: Forms = { role: 'adjective', base: 'hidden', transient: '1' };

// ── Lexicon: adverbs ────────────────────────────────────────────────────────

export const FAST: Forms = { base: 'fast' };
export const SLOWLY: Forms = { base: 'slowly' };
export const WELL: Forms = { base: 'well' };
export const TOGETHER: Forms = { base: 'together' };
export const ALWAYS: Forms = { base: 'always', subtype: 'frequency' };
export const NEVER: Forms = { base: 'never', subtype: 'frequency', polarity: 'negative' };

// ── Lexicon: verbs ──────────────────────────────────────────────────────────

/** The six present-tense person keys of a regular English verb: `base` everywhere but 3sg. */
function present(base: string, third: string): Forms {
  return {
    '1sg_present': base, '2sg_present': base, '3sg_present': third,
    '1pl_present': base, '2pl_present': base, '3pl_present': base,
  };
}

export const EAT: Forms = { base: 'eat', ...present('eat', 'eats'), past: 'ate', gerund: 'eating', participle: 'eaten' };
export const DRINK: Forms = { base: 'drink', ...present('drink', 'drinks'), past: 'drank', gerund: 'drinking', participle: 'drunk' };
export const SEE: Forms = { base: 'see', ...present('see', 'sees'), past: 'saw', gerund: 'seeing', participle: 'seen' };
export const READ: Forms = { base: 'read', ...present('read', 'reads'), past: 'read', gerund: 'reading', participle: 'read' };
export const CHOOSE: Forms = { base: 'choose', ...present('choose', 'chooses'), past: 'chose', gerund: 'choosing', participle: 'chosen' };
export const RUN: Forms = { base: 'run', ...present('run', 'runs'), past: 'ran', gerund: 'running', participle: 'run' };
export const CRY: Forms = { base: 'cry', ...present('cry', 'cries'), past: 'cried', gerund: 'crying', participle: 'cried' };
export const GIVE: Forms = { base: 'give', ...present('give', 'gives'), past: 'gave', gerund: 'giving', participle: 'given' };
/** A verb whose resultative selects BE ("is gone", not "has gone"). */
export const GO: Forms = { base: 'go', ...present('go', 'goes'), past: 'went', gerund: 'going', participle: 'gone', aux: 'be' };
export const BECOME: Forms = { base: 'become', ...present('become', 'becomes'), past: 'became', gerund: 'becoming', participle: 'become' };
/** The seeming verb (`seeming`): a predicate noun under it takes "to be". */
export const SEEM: Forms = { base: 'seem', seeming: '1', ...present('seem', 'seems'), past: 'seemed', gerund: 'seeming', participle: 'seemed' };
/** The copula: fully suppletive, per-person past, negates on itself (`copula`). */
export const BE: Forms = {
  base: 'be', copula: '1',
  '1sg_present': 'am', '2sg_present': 'are', '3sg_present': 'is',
  '1pl_present': 'are', '2pl_present': 'are', '3pl_present': 'are',
  '1sg_past': 'was', '2sg_past': 'were', '3sg_past': 'was',
  '1pl_past': 'were', '2pl_past': 'were', '3pl_past': 'were',
  gerund: 'being', participle: 'been',
};

// Modals. MUST and CAN are defective auxiliaries whose gaps are suppleted ("had to", "be able to");
// the volitional WILL is the lexical verb "want", which links its infinitive with "to".
export const MUST: Forms = { base: 'must', nonfinite: 'have to', ...present('must', 'must'), past: 'had to', future: 'will have to' };
export const CAN: Forms = { base: 'can', nonfinite: 'be able to', ...present('can', 'can'), past: 'could', future: 'will be able to' };
export const WILL: Forms = { base: 'want', nonfinite: 'want', link: 'to', ...present('want', 'wants'), past: 'wanted', future: 'will want' };
