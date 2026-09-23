import type { CauseSentiment, ComplementType, CoordConjunction, Degree, DimensionRelation, MannerRelation, PathSpecifier, TemporalRelation } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// Periphrastic degree words placed before the adjective ("more beautiful", "the most
// beautiful"). English marks the superlative with "the", which the noun's own determiner
// already supplies, so only the degree adverb is added here. Short adjectives take the
// inflected comparative instead ("bigger"), so 'more'/'most' are resolved in enAdj.
export const EN_DEGREE: Record<Degree, string> = {
  positive: '', more: 'more', most: 'most', less: 'less', least: 'least', equally: 'equally',
};

/**
 * The degree adverb once a standard of comparison follows (P09-E5): the equative is the circumfix
 * "as … as", so "equally big" becomes "as big as the dog". The comparatives keep their word.
 */
export const EN_STANDARD_DEGREE: Partial<Record<Degree, string>> = { equally: 'as' };

/** The word before the standard of comparison, by degree: "bigger than the dog", "as big as the dog" (P09-E5). */
export const EN_STANDARD: Partial<Record<Degree, string>> = { more: 'than', less: 'than', equally: 'as' };

/**
 * The word before the set a superlative selects from (P09-E19), by the set's number: "the biggest
 * **of** the animals", "of us", "of the dog and the man" before a plural, a coordinated or a pronoun
 * set, but "the most beautiful **in** the family" before a singular noun, where "of the family" is
 * marginal.
 */
export const EN_DOMAIN = { plural: 'of', singular: 'in' } as const;

/** Suppletive comparatives — no spelling rule derives these. */
export const EN_IRREGULAR: Record<string, [comparative: string, superlative: string]> = {
  good: ['better', 'best'],
  bad: ['worse', 'worst'],
  far: ['farther', 'farthest'],
  little: ['less', 'least'],
  much: ['more', 'most'],
  many: ['more', 'most'],
};

export const PREP: Record<ComplementType, string> = {
  locative: 'in', // place — relation-driven like route, see PATH_PREP; 'in' is the default relation
  direction: 'to',
  source: 'from',
  route: 'through',
  cause: 'because of',
  purpose: 'for', // beneficiary or goal, a thing — "works for the man" (P09-E2); the act is PurposeClause
  instrumental: 'with', // means / tool — "starts with a word"; denied, it is PRIVATIVE
  topic: 'about', // what is spoken or thought of — "speaks about the cat" (P09-E2)
  manner: 'like', // adverbial of manner — relation-driven, see MANNER_PREP; 'like' (similative) is the default
  comitative: 'with', // companion — "coordinates with the other period"
  terminus: 'to', // dative recipient — "cut the hair to the cat"
  role: 'as', // the capacity the subject acts in — "acts as a friend" (P09-E13); the essive's word, ESSIVE
  temporal: 'at', // time — relation-driven, see TEMPORAL_PREP; 'at' is the generic `at` preposition
  predicative: '', // subject complement — no adposition ("becomes a legend", "seems happy")
  // Object complement — the factitive link is the verb's ("transform it INTO a command"), the
  // essive's is ESSIVE below, so the type itself contributes none. See `complementsPhrase`.
  objectPredicative: '',
};

/** The essive marker: the object taken *as* the complement, not made into it ("as the condition"). */
export const ESSIVE = 'as';

/**
 * The adposition the passive puts its demoted agent under — the by-phrase ("is eaten **by** the
 * cat"). One word for every agent, animate or not, where the Romance languages split "da"/"par"
 * from their other uses and German takes the dative "von".
 */
export const AGENT_PREP = 'by';

// The manner adverbial's preposition follows the head noun's relation — similative "like (the
// wind)", means "with (care)", measure "at (the speed)", mode "in (a good way)" — read off the
// noun, not chosen by the speaker. 'like' is the default, and keeps clear of instrumental "with".
export const MANNER_PREP: Record<MannerRelation, string> = { similative: 'like', means: 'with', measure: 'at', mode: 'in' };

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "of" (**of** great size, **of** high quality), measure "at". The noun phrase (dimension noun +
// degree adjective) follows bare, its adjective already agreed and placed by the ordinary NP path.
export const DIM_PREP: Record<DimensionRelation, string> = { extent: 'of', quality: 'of', measure: 'at' };

// The causal connector carries the speaker's stance: neutral "because of", positive "thanks to",
// negative "through the fault of" — the periphrasis English uses to lay blame ("cries through the
// fault of the dog"). All three take the same "<connector> <NP>" shape.
export const CAUSE_PREP: Record<CauseSentiment, string> = {
  neutral: 'because of',
  positive: 'thanks to',
  negative: 'through the fault of',
};

/**
 * The temporal complement's relation, as an adposition. `at` is the generic one — the word a lexeme
 * that names no `temporal_prep` of its own falls back on ("at this time"); a day says "on", a week
 * "in". `ago` is not a preposition at all: English postposes it ("a moment **ago**"), which
 * `TEMPORAL_POSTPOSED` marks and `complementsPhrase` renders after the noun phrase.
 */
export const TEMPORAL_PREP: Record<TemporalRelation, string> = {
  at: 'at',
  ago: 'ago',
  until: 'until',
  after: 'after',
  before: 'before',
  during: 'during',
};

/** The relations English writes after the noun phrase rather than before it. */
export const TEMPORAL_POSTPOSED = new Set<TemporalRelation>(['ago']);

// The spatial relations, shared by route and locative — English uses one preposition per relation
// for both ("goes under the bed", "is under the bed"), so a single map serves the two complements.
export const PATH_PREP: Record<PathSpecifier, string> = {
  in: 'in',
  through: 'through',
  under: 'under',
  over: 'over',
  around: 'around',
  behind: 'behind',
  in_front_of: 'in front of',
  // P09-E1. English says each of the three once in front of a group already, `between` included.
  on: 'on',
  between: 'between',
  against: 'against',
};

/**
 * The same relations as the *goal* of a motion — a `direction` complement that names one. Only
 * containment differs from the map above, and it is exactly the word English keeps for it: "jumps
 * **into** the air" is where it ends up, "jumps **in** the air" is where the jumping happens. The
 * others double for both readings ("runs **behind** the house" is either), so they are taken as they
 * are. That includes `on`: "onto" exists, but "jumps **on** the table" already reads as the goal, so
 * it needs no override of its own (P09-E1). A direction naming no relation at all is not here: that is the plain goal, "to" (see
 * `PathSpecifier`).
 */
export const GOAL_PREP: Record<PathSpecifier, string> = { ...PATH_PREP, in: 'into' };

// The fixed idiom a plain locative takes on a hearth noun, keyed by concept id (see `locativeIdiom`).
// English says "at home", not "in the home".
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'at home' };

/**
 * The true English modal auxiliaries. They are defective — no infinitive, no participle,
 * no do-support — and take "not" straight after themselves ("must not go", "could not go").
 * The lexicon fills their gaps with suppletive periphrases ("had to", "will be able to"),
 * which are ordinary verbs and therefore negate with do-support ("did not have to go"). A
 * finite modal form is one or the other depending on its *first* word, which this decides.
 */
export const MODAL_AUX = new Set(['must', 'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might']);

/**
 * The finite forms of "be", which open a suppletive modal periphrasis that is no ordinary verb: MAY's
 * past "was allowed to" negates and inverts on its "be" as a modal auxiliary does ("was not allowed
 * to go", "was the cat allowed to go?"), never with do-support.
 */
export const FINITE_BE = new Set(['am', 'is', 'are', 'was', 'were']);

// The coordinating conjunctions, as English surface words.
export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'and',
  or: 'or',
  but: 'but',
  that_is: 'that is',
  therefore: 'so',
  then: 'and then',
};

/**
 * The subordinating conjunctions, as English words (see PhrasePlan.adverbialClause, P09-E4). The
 * clause they introduce follows the main one with no comma: "the man runs when the cat eats".
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'when', while: 'while', because: 'because', after: 'after', before: 'before',
};

/**
 * The clause connectors that are parenthetical rather than conjunctions, set off by a comma after
 * them as well as before: "the cat runs, that is, the dog jumps". Clause joins only; a noun group
 * never takes one.
 */
export const PARENTHETICAL_CONNECTORS: ReadonlySet<CoordConjunction> = new Set(['that_is']);

// The negator that denies one constituent rather than the clause: "runs **not** because of the
// dog", which says the cat runs and the dog is not why (see `Complement.negative`). English sets
// such a phrase off with nothing but the word itself.
export const CONSTITUENT_NEGATOR = 'not';

// The instrument denied — the privative, "cuts without the knife" (P09-E2). Not the negator above
// in front of "with": English has a preposition of its own for it, and so does every language here.
export const PRIVATIVE = 'without';

/** The focus particles (see NounPhrase.focus, C39). English writes "too" after the phrase. */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'only' }, even: { word: 'even' }, also: { word: 'too', post: true },
};

/** The cardinals English spells (see `numeralWord`, C31); it agrees none of them. */
export const CARDINALS: CardinalTable = {
  1: { word: 'one' }, 2: { word: 'two' }, 3: { word: 'three' }, 4: { word: 'four' },
  5: { word: 'five' }, 6: { word: 'six' }, 7: { word: 'seven' }, 8: { word: 'eight' },
  9: { word: 'nine' }, 10: { word: 'ten' }, 11: { word: 'eleven' }, 12: { word: 'twelve' },
  24: { word: 'twenty-four' },
};
