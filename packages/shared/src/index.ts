export type GrammaticalRole = 'pronoun' | 'noun' | 'verb' | 'adjective' | 'adverb';

export type LanguageCode = 'en' | 'it' | 'fr' | 'de' | 'es' | 'ja' | 'pt';

export type Transitivity = 'intransitive' | 'transitive' | 'ditransitive';

/**
 * The determiner a noun phrase renders with. `definite` → "the/il/le/der…",
 * `indefinite` → "a/un/une/ein…", `bare` → no article at all (the article-less
 * quotative/idiomatic object of "the boy cried wolf", generics like "wolves eat meat").
 * Defaults to `definite`. Only nouns carry it — pronouns render without an article.
 */
/**
 * A noun phrase's leading determiner. Beyond the three definiteness values (definite /
 * indefinite / bare) it also carries the quantifiers, which some languages inflect for
 * gender/number and, for `no`, weave into verb negation (negative concord).
 */
export type Definiteness =
  | 'definite'
  | 'indefinite'
  | 'bare'
  | 'some'
  | 'no'
  | 'many'
  | 'few'
  | 'all';

/** Cycle order used by the UI toggle. */
export const DEFINITENESS: Definiteness[] = [
  'definite',
  'indefinite',
  'bare',
  'some',
  'no',
  'many',
  'few',
  'all',
];

export const DEFINITENESS_LABELS: Record<Definiteness, string> = {
  definite: 'Definite (the)',
  indefinite: 'Indefinite (a)',
  bare: '—',
  some: 'Some',
  no: 'No',
  many: 'Many',
  few: 'Few',
  all: 'All',
};

/**
 * The semantic relation a noun-modifier bears to its head — a noun used
 * attributively ("sail boat", "sunglasses", "gold ring"). English/German/Japanese
 * neutralise it (juxtaposition / compound / の); the Romance engines use it to select
 * the linking preposition, which is exactly where the relations diverge:
 *   feature (barca **a** vela) · purpose (occhiali **da** sole) · material (anello **di** oro)
 * This is distinct from a possessor (the genitive "barca **della** vela").
 */
export type ModifierRelation = 'feature' | 'purpose' | 'material';

/** Cycle order used by the UI relation chip. */
export const MODIFIER_RELATIONS: ModifierRelation[] = ['feature', 'purpose', 'material'];

export const MODIFIER_RELATION_LABELS: Record<ModifierRelation, string> = {
  feature: 'Feature / means',
  purpose: 'Purpose / use',
  material: 'Material / content',
};

/**
 * Verb tense the phrase is rendered in. Only the simple tenses today; the
 * imperfect/continuous aspect is reserved for a later split of `past`.
 */
export type Tense = 'present' | 'past' | 'future';

export const TENSES: Tense[] = ['present', 'past', 'future'];

export const TENSE_LABELS: Record<Tense, string> = {
  present: 'Present',
  past: 'Past',
  future: 'Future',
};

/**
 * Semantic complement types — the "varieties" of indirect object a verb can
 * license. English collapses these into a single category, but each takes a
 * distinct adposition (and case, in German) across languages. Verbs declare
 * which they support via `Concept.complements`.
 *
 * `locative`/`direction`/`source`/`route` are the motion/place family; `cause`
 * is the reason/motive adjunct — "the boy cried **because of the dog**"
 * (a causa di / à cause de / wegen / por causa de …).
 */
export type ComplementType = 'locative' | 'direction' | 'source' | 'route' | 'cause';

/** Canonical UI order (matches how complements are presented to the user). */
export const COMPLEMENT_TYPES: ComplementType[] = ['locative', 'direction', 'source', 'route', 'cause'];

/**
 * Order in which active complements are rendered within a sentence. Follows the
 * natural path reading "from X to Y through Z", with the static locative next and
 * the causal adjunct ("because of …") last.
 */
export const COMPLEMENT_RENDER_ORDER: ComplementType[] = ['source', 'direction', 'route', 'locative', 'cause'];

export const COMPLEMENT_LABELS: Record<ComplementType, string> = {
  locative: 'Locative',
  direction: 'Direction',
  source: 'Source',
  route: 'Route',
  cause: 'Cause',
};

/**
 * Spatial relations a `route` (path) complement can express. English needs a
 * distinct preposition for each ("through" vs "over" vs "around"); every
 * language maps these to its own adposition (and case, in German). Only the
 * `route` complement carries a specifier; it defaults to `through`.
 */
export type PathSpecifier = 'through' | 'under' | 'over' | 'around' | 'behind' | 'in_front_of';

export const PATH_SPECIFIERS: PathSpecifier[] = ['through', 'under', 'over', 'around', 'behind', 'in_front_of'];

export const PATH_SPECIFIER_LABELS: Record<PathSpecifier, string> = {
  through: 'through',
  under: 'under',
  over: 'over',
  around: 'around',
  behind: 'behind',
  in_front_of: 'in front of',
};

/**
 * The affective stance a `cause` adjunct takes toward its reason — the difference
 * between blaming, crediting, and merely stating a cause. English barely marks it,
 * but most languages pick a different connector per stance:
 *   neutral  ("because of")   · a causa di · à cause de · por causa de · wegen · のために
 *   negative ("through … fault") · per colpa di · par la faute de · por culpa de · のせいで
 *   positive ("thanks to")    · grazie a · grâce à · gracias a · dank · のおかげで
 * Only the `cause` complement carries it; it defaults to `neutral`.
 */
export type CauseSentiment = 'neutral' | 'negative' | 'positive';

export const CAUSE_SENTIMENTS: CauseSentiment[] = ['neutral', 'negative', 'positive'];

export const CAUSE_SENTIMENT_LABELS: Record<CauseSentiment, string> = {
  neutral: 'Neutral — because of',
  negative: 'Negative — fault of',
  positive: 'Positive — thanks to',
};

export const LANGUAGES: Record<LanguageCode, string> = {
  en: 'English',
  it: 'Italian',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  ja: 'Japanese',
  pt: 'Portuguese',
};

export interface Concept {
  id: string;
  role: GrammaticalRole;
  description: string;
  label?: string;              // English base form, e.g. "cat", "eat", "I"
  synonym?: string;            // short disambiguating gloss shown in parentheses, e.g. "weep" for cry
  emoji?: string;
  transitivity?: Transitivity; // only set for verbs
  person?: '1' | '2' | '3';   // only set for pronouns
  number?: 'singular' | 'plural'; // inherent grammatical number, only set for pronouns
  gendered?: boolean;           // noun has distinct masc/fem surface forms
  animate?: boolean;            // referent is animate (human/animal) — affects motion-goal adposition
  countable?: boolean;          // false for mass/uncountable nouns (water, food) — changes quantifier words
  complements?: ComplementType[]; // motion/locative complements a verb licenses
}

/** A noun used attributively to modify a head noun, plus its semantic relation. */
export interface NounModifier {
  concept: string;              // a noun id ("SAIL" in "sail boat")
  relation: ModifierRelation;   // selects the linking preposition in Romance
}

/**
 * A noun phrase: a core noun or pronoun, optionally modified by adjectives, and
 * carrying its own number/gender. Subjects and objects are all noun phrases.
 */
export interface NounPhrase {
  concept: string;                 // core noun or pronoun id
  number?: 'singular' | 'plural';
  // 'neut' is only meaningful for a 3rd-person pronoun head ("it"); noun heads use masc/fem.
  gender?: 'masc' | 'fem' | 'neut';
  /** Determiner to render with; defaults to 'definite'. Ignored for pronoun heads. */
  definiteness?: Definiteness;
  /** Adjective ids, in order. The UI supplies up to two today; the model is uncapped. */
  adjectives?: string[];
  /**
   * Nouns used attributively ("**sail** boat"), each with the semantic relation it bears
   * to the head. Distinct from `adjectives` (a noun-modifier doesn't inflect/agree — it is
   * bare, and in Romance is linked by a relation-selected preposition) and from `possessor`
   * (which is a full owning noun phrase, the genitive).
   */
  nounModifiers?: NounModifier[];
  /**
   * An optional restrictive relative clause ("the boy *who cried wolf*", "the book
   * *that I read*"). The head noun fills one slot of the clause — its subject by
   * default, but any slot (see `RelativeClause.headRole`). The clause's own
   * objects/complements are themselves noun phrases and may carry their own
   * `relative`, so relative clauses nest.
   */
  relative?: RelativeClause;
  /**
   * An optional possessing noun phrase — a Saxon genitive ("the cat's book" → the head
   * is "book", the possessor is "the cat"). Only nouns possess (pronoun possessives like
   * "my" are out of scope). Being a noun phrase itself, a possessor carries its own
   * number/gender/adjectives and may in turn have a possessor ("the cat's owner's book").
   */
  possessor?: NounPhrase;
}

/**
 * A subordinate (restrictive relative) clause. It is a full predicate — verb phrase
 * plus optional objects and complements. The head noun phrase it hangs off of fills
 * one of the clause's slots (the "gap"), named by `headRole`:
 *  - `'subject'` (the default): a subject-relative, "the boy *who cried*". The gap is
 *    the subject, so `subject` is left undefined and the head drives verb agreement.
 *  - anything else: a non-subject relative, "the book *that I read*". The gap slot
 *    (e.g. `directObject`) is left undefined, the clause carries its own `subject`,
 *    and that subject drives agreement.
 */
export interface RelativeClause {
  /** Which slot the head fills within this clause (the gap). Defaults to 'subject'. */
  headRole?: 'subject' | 'directObject' | 'indirectObject' | ComplementType;
  /** The clause's own subject — present when headRole !== 'subject' (drives agreement). */
  subject?: NounPhrase;
  verbPhrase: VerbPhrase;
  directObject?: NounPhrase;
  indirectObject?: NounPhrase;
  complements?: Partial<Record<ComplementType, Complement>>;
}

/** The predicate head: a core verb, optional negation, and an optional adverb. */
export interface VerbPhrase {
  verb: string;                    // core verb id
  negative?: boolean;
  modifier?: string;               // adverb id
  tense?: Tense;                   // defaults to 'present'
}

/**
 * A specifier attached to a complement. Discriminated by `kind`: `path` is the route
 * complement's spatial relation, `sentiment` is the cause complement's affective stance
 * (blame / credit / neutral). New specifier families can be added as further members.
 */
export type Specifier =
  | { kind: 'path'; value: PathSpecifier }
  | { kind: 'sentiment'; value: CauseSentiment };

/**
 * A complement: a noun phrase plus zero or more specifiers. Not every complement
 * takes a specifier, and not every specifier is a `PathSpecifier`.
 */
export interface Complement {
  phrase: NounPhrase;
  specifiers?: Specifier[];
}

export interface LexicalEntry {
  conceptId: string;
  language: LanguageCode;
  forms: Record<string, string>;
}

export interface PhrasePlan {
  subject: NounPhrase;
  verbPhrase: VerbPhrase;
  directObject?: NounPhrase;
  indirectObject?: NounPhrase;
  complements?: Partial<Record<ComplementType, Complement>>;
}

/**
 * A run of text with an optional reading. When `r` is present it is the furigana
 * (kana reading) to display above the surface text `t`; when absent, `t` is rendered
 * plainly (kana, particles, punctuation). Only languages that supply readings (ja)
 * populate this; the plain `text` is always the segments' `t` joined in order.
 */
export interface RubySegment {
  t: string;
  r?: string;
}

export interface Translation {
  language: LanguageCode;
  text: string;
  /** Present only for languages with furigana (Japanese); `text` is the plain fallback. */
  ruby?: RubySegment[];
}

export interface TranslateRequest {
  plan: PhrasePlan;
}

export interface TranslateResponse {
  translations: Translation[];
}

export interface ConceptsResponse {
  concepts: Concept[];
}

// ── Saved phrases (persistence format) ──────────────────────────────────────
// A saved phrase is the whole builder workspace — a stack of phrase containers plus
// the cross-container relative-clause links — serialized to plain JSON. Concepts are
// stored by id (not embedded), so a save stays valid as the lexicon evolves; the app
// rehydrates each id against the live concept catalog on load. This same JSON is what
// both the DB rows and the export/import files carry.

/** Discriminator written into every saved-phrase file, so an arbitrary JSON can be identified. */
export const SAVED_PHRASE_FORMAT = 'signi.phrase' as const;

/**
 * Schema version of the saved-phrase payload. Bump whenever the serialized selection
 * shape changes in a way an older loader couldn't read; the loader checks this to
 * migrate or reject. Starts at 1.
 */
export const SAVED_PHRASE_VERSION = 1;

/**
 * The grain of a saved workspace:
 *  - `period` — a single clause (verb phrase + subject + objects + complements, plus any
 *    nested possessors). One container, no cross-container links. Loaded *additively* into
 *    a new container.
 *  - `phrase` — a whole workspace: several periods joined by subordinate (relative) clauses,
 *    with their links. Loaded by *replacing* the current workspace.
 */
export type SavedPhraseKind = 'period' | 'phrase';

export const SAVED_PHRASE_KINDS: SavedPhraseKind[] = ['period', 'phrase'];

/** A phrase selection with every Concept replaced by its id string. Structurally open — the
 *  frontend owns the exact key set (it evolves), so shared keeps it a loose record. */
export type SerializedSelection = { [key: string]: unknown };

export interface SerializedContainer {
  id: string;
  selection: SerializedSelection;
}

export interface SerializedLink {
  id: string;
  source: { containerId: string; nounKey: string };
  target: { containerId: string; nounKey: string };
}

/** The serialized builder workspace: the container stack plus their relative-clause links. */
export interface SerializedWorkspace {
  containers: SerializedContainer[];
  links: SerializedLink[];
}

/** The full on-disk / on-wire saved-phrase document (export file body and DB payload). */
export interface SavedPhrase {
  format: typeof SAVED_PHRASE_FORMAT;
  version: number;
  kind: SavedPhraseKind;         // 'period' (one clause) or 'phrase' (whole workspace)
  savedAt: string;               // ISO-8601 timestamp
  name?: string;
  workspace: SerializedWorkspace;
}

// ── Saved-phrase API ────────────────────────────────────────────────────────
// Author is captured on every record. There is no auth yet, so the backend always
// stamps it 'system'; the column exists so real owners can be attached later.

/** Request body for creating a saved phrase. */
export interface SavePhraseRequest {
  name: string;
  kind: SavedPhraseKind;
  workspace: SerializedWorkspace;
}

/** A saved-phrase list entry (no payload — for pickers). */
export interface SavedPhraseSummary {
  id: string;
  name: string;
  kind: SavedPhraseKind;
  author: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/** A full saved-phrase record, including its workspace payload. */
export interface SavedPhraseRecord extends SavedPhraseSummary {
  workspace: SerializedWorkspace;
}

export interface SavedPhrasesResponse {
  phrases: SavedPhraseSummary[];
}
