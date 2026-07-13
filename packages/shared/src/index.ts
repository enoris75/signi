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
 * gender/number and, for `no`, weave into verb negation (negative concord), and the
 * demonstratives `this` / `that` (proximal / distal), which inflect for gender/number/case
 * and, unlike the quantifiers, keep the phrase's own number ("this boy" / "these boys").
 */
export type Definiteness =
  | 'definite'
  | 'indefinite'
  | 'bare'
  | 'some'
  | 'no'
  | 'many'
  | 'few'
  | 'all'
  | 'this'
  | 'that';

/**
 * The semantic dimension a determiner value belongs to. Not the part of speech that spells it:
 * an *article* is one language's way of realizing identifiability (English writes a word, German
 * fuses it with case and gender, Japanese leaves it to context), so "article" is a fact about an
 * engine, while these three are facts about the meaning being built.
 *
 *   identifiability — can the addressee already pick the referent out? ("the cat" yes, "a cat"
 *                     no, bare = the language spells neither: the zero article)
 *   deixis          — identifiability by pointing, near the speaker or away from them
 *   quantity        — how much of the class the phrase takes in
 *
 * The UI names each dimension with the word users know for its realization (Article /
 * Demonstrative / Quantifier — see the `determiner.category.*` UI strings); the model keeps
 * the semantic name.
 */
export type DeterminerCategory = 'identifiability' | 'deixis' | 'quantity';

/** Display order of the dimensions. */
export const DETERMINER_CATEGORIES: DeterminerCategory[] = ['identifiability', 'deixis', 'quantity'];

/** The values each dimension offers, in display order. */
export const DETERMINER_CATEGORY_VALUES: Record<DeterminerCategory, Definiteness[]> = {
  identifiability: ['definite', 'indefinite', 'bare'],
  // Historically the definite article descends from the distal demonstrative in most of these
  // languages, which is why the two compete for the one slot rather than stacking.
  deixis: ['this', 'that'],
  quantity: ['some', 'no', 'many', 'few', 'all'],
};

/** The dimension each determiner value belongs to — the inverse of DETERMINER_CATEGORY_VALUES. */
export const DETERMINER_CATEGORY: Record<Definiteness, DeterminerCategory> = Object.fromEntries(
  DETERMINER_CATEGORIES.flatMap((category) =>
    DETERMINER_CATEGORY_VALUES[category].map((value) => [value, category]),
  ),
) as Record<Definiteness, DeterminerCategory>;

/** Every determiner value, grouped by dimension. The order the UI menu lists them in. */
export const DEFINITENESS: Definiteness[] = DETERMINER_CATEGORIES.flatMap(
  (category) => DETERMINER_CATEGORY_VALUES[category],
);

/**
 * The determiner a noun phrase takes when the user has not chosen one, which depends on
 * the slot it fills. Referential slots (subject, objects, the spatial complements) pick out
 * a referent and default to `definite`. The `predicative` subject complement does not: a
 * predicate noun ascribes class membership ("the angel becomes *a* cat"), so it defaults to
 * `indefinite`. `definite` there is the equative reading — an assertion of identity with a
 * known referent ("Clark Kent is *the* reporter") — which stays reachable by selecting it.
 *
 * Read by the engine when resolving a plan, and by the UI to label the determiner toggle
 * and decide where its cycle starts. Both must agree, so both call this.
 */
export function defaultDefiniteness(slot: string): Definiteness {
  return slot === 'predicative' ? 'indefinite' : 'definite';
}

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
 * Comparative degree of an adjective — an orthogonal grammatical feature layered on
 * the adjective word (distinct from *which* adjective is chosen). `positive` is the
 * plain, unmarked form (the default); the rest are the periphrastic degrees. Applies
 * only to real adjectives, never to attributive noun-modifiers.
 *   more/less   — comparative superiority / inferiority ("more beautiful")
 *   most/least  — (relative) superlative superiority / inferiority ("the most beautiful")
 *   equally     — equality ("equally beautiful")
 */
export type Degree = 'positive' | 'more' | 'most' | 'less' | 'least' | 'equally';

export const DEGREES: Degree[] = ['positive', 'more', 'most', 'less', 'least', 'equally'];

export const DEGREE_LABELS: Record<Degree, string> = {
  positive: '—',
  more: 'More',
  most: 'Most',
  less: 'Less',
  least: 'Least',
  equally: 'Equally',
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
 * Grammatical aspect — the internal temporal shape of the event, layered orthogonally on
 * top of `tense` (each aspect is available in present / past / future). Realised
 * periphrastically as an auxiliary (conjugated for the tense + subject) plus a non-finite
 * form of the main verb:
 *   neutral      — the plain, unmarked event ("I go", "you went", "they will go").
 *   progressive  — the event in progress ("he is going", "she was going", "we will be
 *                  going"): be + gerund; Romance stare/estar + gerund; fr "en train de";
 *                  de "gerade"; ja ～ている.
 *   prospective  — on the verge of the event ("you are about to go", "the man was about to
 *                  go"): be about to / stare per / a punto de / prestes a / sur le point de /
 *                  im Begriff zu / ～ところ + infinitive.
 *   resultative  — the state resulting from the completed event ("he has seen", "I am gone",
 *                  "I will have gone"): the periphrastic perfect, auxiliary + past participle.
 *                  Which auxiliary is a lexical property of the verb, not of the aspect:
 *                  es/pt take haber/ter throughout, while en/it/fr/de select BE (is gone,
 *                  è andato, est allé, ist gegangen) for a small unaccusative class and HAVE
 *                  (has seen, ha visto, a vu, hat gesehen) for everything else. The seed marks
 *                  the BE-selecting verbs per language with a form `aux: "be"`. Only a BE
 *                  participle agrees with the subject, and only in it/fr ("è andata"). ja
 *                  renders the aspect as ～てしまう and needs no auxiliary.
 * The non-finite forms (gerund, past participle, ja te-form) are lexical data per verb.
 */
export type Aspect = 'neutral' | 'progressive' | 'prospective' | 'resultative';

export const ASPECTS: Aspect[] = ['neutral', 'progressive', 'prospective', 'resultative'];

export const ASPECT_LABELS: Record<Aspect, string> = {
  neutral: 'Neutral',
  progressive: 'Progressive',
  prospective: 'Prospective',
  resultative: 'Resultative',
};

/**
 * Semantic complement types — the "varieties" of indirect object a verb can
 * license. English collapses these into a single category, but each takes a
 * distinct adposition (and case, in German) across languages. Verbs declare
 * which they support via `Concept.complements`.
 *
 * `locative`/`direction`/`source`/`route` are the motion/place family; `cause`
 * is the reason/motive adjunct — "the boy cried **because of the dog**"
 * (a causa di / à cause de / wegen / por causa de …). `instrumental` is the means
 * or tool the action is carried out by — "start **with a word**", "cut the bread
 * **with the knife**" (con / avec / mit + dative / で). It answers "by what means?",
 * where `cause` answers "why?": both are adjuncts, but the instrument is used by the
 * subject, not a reason acting on it. `terminus` is the dative
 * "to whom / to what" — the recipient/goal of the action, i.e. what traditional
 * grammar calls the indirect object ("I give the book **to him**", "I cut the hair
 * **to the cat**"). It renders with each language's dative (to / a / à / dative case /
 * に). Being licensed per verb rather than by transitivity, it covers both the
 * ditransitive's recipient (give / show / send) and the dative adjunct a plain
 * transitive verb (cut, read) can take. `predicative` is the
 * subject complement of a copular/linking verb — the predicate nominative or predicate
 * adjective that describes the *subject*: "she becomes **a legend**", "he seems
 * **happy**". Unlike the others it takes no adposition; a noun head keeps its own
 * article (predicate nominative, German nominative case) and an adjective head agrees
 * with the subject (Romance) — English/German predicate adjectives are uninflected.
 */
export type ComplementType = 'locative' | 'direction' | 'source' | 'route' | 'cause' | 'instrumental' | 'terminus' | 'predicative';

/** Canonical UI order (matches how complements are presented to the user). */
export const COMPLEMENT_TYPES: ComplementType[] = ['predicative', 'terminus', 'instrumental', 'locative', 'direction', 'source', 'route', 'cause'];

/**
 * Order in which active complements are rendered within a sentence. The subject
 * complement leads (it sits right after the verb: "becomes **a legend** in the house"),
 * then the motion path "from X to Y through Z", the static locative, and the causal
 * adjunct ("because of …") last. In Japanese (SOV) everything precedes the verb, so the
 * subject complement's になる/く-form ends up adjacent to the verb regardless. The dative
 * `terminus` ("to him") — the recipient — sits right after the subject complement, before the
 * path ("gives **a legend** to the cat from the house"). The `instrumental` follows it — the
 * means belongs with the act ("cuts the bread **with the knife** in the house"), before the
 * path and the place it happens in.
 */
export const COMPLEMENT_RENDER_ORDER: ComplementType[] = ['predicative', 'terminus', 'instrumental', 'source', 'direction', 'route', 'locative', 'cause'];

export const COMPLEMENT_LABELS: Record<ComplementType, string> = {
  predicative: 'Subject Complement',
  terminus: 'Terminus',
  instrumental: 'Instrumental',
  locative: 'Locative',
  direction: 'Direction',
  source: 'Source',
  route: 'Route',
  cause: 'Cause',
};

/**
 * Complements whose noun head carries a user-selectable determiner. The adposition-free
 * `predicative` keeps its own article; the spatial/dative/instrumental complements (locative /
 * direction / source / route / terminus / instrumental) are adposition-bearing — their engines
 * fuse the preposition with a *definite* article (Italian "alla casa") but otherwise render the
 * chosen determiner uncontracted ("a una casa", "a nessuna casa", "a molte case"). `cause` is
 * excluded: it accepts a pronoun and weaves the quantifier into its connector, a separate concern.
 */
export const DETERMINER_COMPLEMENT_TYPES: ComplementType[] = ['predicative', 'terminus', 'instrumental', 'locative', 'direction', 'source', 'route'];

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

/**
 * How far an instrument is *reified* — the abstraction gradient between doing something and
 * holding a thing. One and the same instrument can be presented at three degrees, and each
 * language has its own grammar for them. Only the `instrumental` complement carries it, and it
 * defaults to `object`.
 *
 *   process — the instrument is an action in flow, presented as it is carried out: "start **by
 *             choosing a word**". Realised non-finitely — the gerund (en by ~ing, it/es/pt the
 *             plain gerundio, fr the gérondif "en choisissant"), the German "indem" clause, the
 *             Japanese te-form. Emphasises engagement and method.
 *   concept — the same action, abstracted into a protocol one *invokes*: "start **with the act of
 *             choosing a word**". Realised by nominalising the verb — "l'atto di scegliere",
 *             "el acto de elegir", "mit dem Akt, … zu wählen", ja ～ことで. Emphasises rule and
 *             system.
 *   object  — the action is gone; only its outcome, a thing, remains: "start **with a word**".
 *             The plain adposition + noun phrase. Emphasises the result.
 *
 * The three share one noun phrase (`Complement.phrase`): at `object` it *is* the instrument, and
 * at the other two it is the direct object of `Complement.action` — the noun the act is done to.
 */
export type AbstractionLevel = 'process' | 'concept' | 'object';

/** Display order: most dynamic first, most reified last. */
export const ABSTRACTION_LEVELS: AbstractionLevel[] = ['process', 'concept', 'object'];

/** The levels that present the instrument as an action, and so need `Complement.action`. */
export function isActionLevel(level: AbstractionLevel): boolean {
  return level !== 'object';
}

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
  /**
   * The concept's citation form in every seeded language ("cat" / "gatto" / "Katze"), taken
   * from the primary lexeme's lemma. The whole catalog ships with the concept list so the
   * pickers can show the word in the chosen language without a per-language re-fetch; a
   * language missing an entry falls back to `label`.
   */
  labels?: Partial<Record<LanguageCode, string>>;
  /**
   * The kana reading of the citation form, for the languages whose script needs one (ja: 猫 →
   * ねこ). Keyed like `labels` so a picker can look the reading up by the language it is
   * already showing; a language that supplies no readings simply has no entry, and the word
   * renders without furigana.
   */
  readings?: Partial<Record<LanguageCode, string>>;
  synonym?: string;            // short disambiguating gloss shown in parentheses, e.g. "weep" for cry
  emoji?: string;
  transitivity?: Transitivity; // only set for verbs
  modal?: boolean;             // verb that governs another verb rather than heading a clause
  person?: '1' | '2' | '3';   // only set for pronouns
  number?: 'singular' | 'plural'; // inherent grammatical number, only set for pronouns
  gendered?: boolean;           // noun has distinct masc/fem surface forms
  animate?: boolean;            // referent is animate (human/animal) — affects motion-goal adposition
  countable?: boolean;          // false for mass/uncountable nouns (water, food) — changes quantifier words
  complements?: ComplementType[]; // complements a verb licenses (motion/locative/cause, or the copular `predicative`)
}

/** A noun used attributively to modify a head noun, plus its semantic relation. */
export interface NounModifier {
  concept: string;              // a noun id ("SAIL" in "sail boat")
  relation: ModifierRelation;   // selects the linking preposition in Romance
  /**
   * Grammatical number of the attributive noun itself ("creatore di **frasi**"). Defaults
   * to singular. In Romance the modifier is a real noun and can be plural; English keeps
   * the attributive noun singular ("phrase creator") and German/Japanese ignore it (the
   * compound / の-link doesn't inflect the non-head element).
   */
  number?: 'singular' | 'plural';
  /**
   * Adjectives modifying *this attributive noun*, not the head ("semantic" in "semantic
   * phrase creator" → creatore di frasi **semantiche**). In Romance they agree with the
   * modifier's own gender/number; English renders them bare and prenominal; German scopes
   * them over the whole compound (approximation); Japanese renders them bare before the の.
   */
  adjectives?: string[];
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
  /** Adjective ids, in order. The UI supplies up to three today; the model is uncapped. */
  adjectives?: string[];
  /**
   * Comparative degree per adjective, index-aligned with `adjectives` (a missing or
   * 'positive' entry is the plain form). Only real adjectives carry a degree; attributive
   * noun-modifiers never do. Threaded into each resolved adjective's `forms['degree']`.
   */
  adjectiveDegrees?: Degree[];
  /**
   * Comparative degree of the *head* itself. Only meaningful when the head is an adjective —
   * i.e. the predicate adjective of a `predicative` subject complement ("seems **happier**"),
   * the one place an adjective heads a noun phrase. Ignored for a noun or pronoun head.
   * Threaded into the resolved head's `forms['degree']`, like `adjectiveDegrees`.
   */
  headDegree?: Degree;
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
  headRole?: 'subject' | 'directObject' | ComplementType;
  /** The clause's own subject — present when headRole !== 'subject' (drives agreement). */
  subject?: NounPhrase;
  verbPhrase: VerbPhrase;
  directObject?: NounPhrase;
  complements?: Partial<Record<ComplementType, Complement>>;
}

/** The predicate head: a core verb, optional negation, and an optional adverb. */
export interface VerbPhrase {
  verb: string;                    // core verb id
  negative?: boolean;
  modifier?: string;               // adverb id
  tense?: Tense;                   // defaults to 'present'
  aspect?: Aspect;                 // defaults to 'neutral'
  /**
   * Modal verbs governing this predicate, outermost first — obligation (must / dovere),
   * ability (can / potere), volition (will / volere). `["WILL", "CAN"]` over GO is "voglio
   * poter andare", "I want to be able to go". Each is an ordinary verb concept flagged
   * `Concept.modal`, so it conjugates out of the lexicon; what marks a modal out is that
   * it *governs* a non-finite verb group instead of heading one.
   *
   * Only the outermost modal is finite: it carries the tense, the subject agreement, and
   * the negation. Every inner modal takes its `nonfinite` form (Italian apocopates,
   * *potere* → *poter*; English is suppletive, *can* → *be able to*), and the innermost
   * element is the infinitive of the main verb's *whole* group — so a modal composes with
   * `aspect`: "must **have seen**", "deve **aver visto**". Two lexical form keys carry the
   * language-specific joinery: `nonfinite` (default: `base`) and `link`, a particle emitted
   * before the governed element (English "want **to** go"; empty elsewhere).
   *
   * Japanese has no modal verbs — modality is suffixal (〜必要がある / 〜ことができる /
   * 〜たい) — so its lexemes carry `governs` / `suffix_dict` / `suffix_stem` / `kind`
   * instead, and its engine drops `aspect` under a modal (a documented gap).
   *
   * The UI chains two today; the model is uncapped.
   */
  modals?: string[];
}

/**
 * A specifier attached to a complement. Discriminated by `kind`: `path` is the route
 * complement's spatial relation, `sentiment` is the cause complement's affective stance
 * (blame / credit / neutral). New specifier families can be added as further members.
 */
export type Specifier =
  | { kind: 'path'; value: PathSpecifier }
  | { kind: 'sentiment'; value: CauseSentiment }
  | { kind: 'abstraction'; value: AbstractionLevel };

/**
 * A complement: a noun phrase plus zero or more specifiers. Not every complement
 * takes a specifier, and not every specifier is a `PathSpecifier`.
 */
export interface Complement {
  phrase: NounPhrase;
  specifiers?: Specifier[];
  /**
   * The instrument as an *action* rather than a thing — set only on the `instrumental`
   * complement, and only at the `process` and `concept` abstraction levels (see
   * AbstractionLevel). The verb is rendered non-finitely (gerund / nominalised infinitive) and
   * `phrase` is the noun it acts on: action CHOOSE + phrase "a word" is "by choosing a word".
   * Ignored at the `object` level, where the noun phrase stands alone ("with a word").
   *
   * It is a full VerbPhrase, but only the verb and its adverb are read: an instrument has no
   * tense, mood or agreement of its own — it takes them from the clause it serves.
   */
  action?: VerbPhrase;
}

export interface LexicalEntry {
  conceptId: string;
  language: LanguageCode;
  forms: Record<string, string>;
}

export interface PhrasePlan {
  subject: NounPhrase;
  // Optional: a verbless period is a bare noun phrase (a newspaper-title-style fragment
  // like "breaking news"). When absent the engines render just the subject; objects and
  // complements, which hang off the verb, are meaningless without it.
  verbPhrase?: VerbPhrase;
  directObject?: NounPhrase;
  // The recipient of a ditransitive ("gives the book *to the cat*") is not a slot of its own:
  // it is the `terminus` complement, which every verb that licenses one declares.
  complements?: Partial<Record<ComplementType, Complement>>;
  /**
   * An optional hypothetical condition (the protasis / "if" clause) — itself a full plan.
   * When present the sentence is a counterfactual conditional: this plan is the main clause
   * (apodosis, rendered in the conditional mood — "the dog would run") and `condition` is the
   * "if" clause (rendered in the past / imperfect-subjunctive mood — "if the cat ate"). One
   * condition per plan; conditions do not nest (the condition clause stays indicative).
   */
  condition?: PhrasePlan;
  /**
   * An optional coordinated clause joined to this one by a coordinating conjunction ("the cat
   * sleeps AND the dog runs"). Unlike a condition, coordination is a symmetric join of two
   * independent clauses: this plan is the first, `coordination.clause` the second, and
   * `coordination.conjunction` selects the linking word. One coordination per plan; the
   * coordinated clause is not itself given a coordination.
   *
   * A symmetric join means both clauses carry the same illocutionary force, so the mood belongs
   * to the *pair*: two statements coordinate ("the cat sleeps and the dog runs"), and so do two
   * commands ("eat the bread, then run!"), but a statement and a command do not. An `imperative`
   * plan therefore hands its mood, its `imperativeRegister` and its addressee `subject` down to
   * the coordinated clause, and may only use the conjunctions in
   * `IMPERATIVE_COORD_CONJUNCTIONS` (the UI enforces this; the translator also normalises it
   * defensively).
   */
  coordination?: Coordination;
  /**
   * When true this clause is an **imperative** (a command — "eat the food!", "don't run!").
   * The verb is rendered in the imperative mood and the subject is dropped, but `subject`
   * still carries the addressee pronoun (2nd-singular by default, or 1st-plural "let's…" /
   * 2nd-plural) so the engines pick the right person/number of the imperative form. An
   * imperative is a mood, so it is mutually exclusive with a hypothetical `condition` and it
   * forces present tense / neutral aspect / no modals (the UI enforces this; the translator
   * also normalises it defensively). It may still take a `coordination` — a command coordinates
   * with a second command, which inherits its mood (see `coordination`).
   */
  imperative?: boolean;
  /**
   * The register of an imperative — who the command is addressed to, which the languages
   * realise with different forms. Ignored unless `imperative` is set.
   *  - `request` (the default): a command spoken to a person — "load a period!", "carica un
   *    periodo", ja "読み込んでください".
   *  - `instruction`: an impersonal directive addressed to nobody — the label on a control, a
   *    menu entry, a step in a recipe. Most languages do *not* use the imperative for this:
   *    French/Spanish/Portuguese/German take the infinitive ("charger une période", "ein
   *    Satzgefüge laden") and Japanese the verbal noun ("文を読み込み"). Only English (bare
   *    base) and Italian (2sg) happen to reuse their imperative surface.
   */
  imperativeRegister?: ImperativeRegister;
}

/** See `PhrasePlan.imperativeRegister`. */
export type ImperativeRegister = 'request' | 'instruction';

export const IMPERATIVE_REGISTERS: ImperativeRegister[] = ['request', 'instruction'];

/**
 * A coordinating conjunction joining two independent clauses:
 *  - `and`     copulative ("and")
 *  - `or`      disjunctive ("or")
 *  - `but`     adversative ("but")
 *  - `that_is`   explicative ("that is")
 *  - `therefore` conclusive — the second clause follows *from* the first ("so", "quindi", "donc")
 *  - `then`      temporal — the second clause follows *after* the first ("and then", "e poi",
 *                "und dann"). Most languages mark sequence with an adverb rather than a
 *                conjunction, so the engines render this one with its coordinator attached.
 */
export type CoordConjunction = 'and' | 'or' | 'but' | 'that_is' | 'therefore' | 'then';

export const COORD_CONJUNCTIONS: CoordConjunction[] = ['and', 'or', 'but', 'that_is', 'therefore', 'then'];

/**
 * The conjunctions that may join two **commands** (see `PhrasePlan.coordination`). Four of the
 * six carry over to the imperative: the cumulative "and" ("sit down and be quiet!"), the
 * sequential "then" — the natural join of the steps of a recipe or a wizard — the adversative
 * "but" ("come in, but don't touch anything!"), and the disjunctive "or" offering the addressee
 * a choice ("call me or write to me!").
 *
 * The other two need a *statement* on at least one side and so are not offered under a command:
 * `therefore` draws a conclusion from a premise, and an order is not a premise ("eat the bread,
 * therefore run" is broken — what works, "it's late, so go to bed", is a statement joined to a
 * command, i.e. two different moods, which a symmetric join cannot express); `that_is`
 * paraphrases the first clause instead of adding a second act.
 */
export const IMPERATIVE_COORD_CONJUNCTIONS: CoordConjunction[] = ['and', 'then', 'but', 'or'];

/** Whether `conjunction` may join two commands — see `IMPERATIVE_COORD_CONJUNCTIONS`. */
export function canCoordinateImperative(conjunction: CoordConjunction): boolean {
  return IMPERATIVE_COORD_CONJUNCTIONS.includes(conjunction);
}

/** A coordinated second clause plus the conjunction linking it to the first. */
export interface Coordination {
  conjunction: CoordConjunction;
  clause: PhrasePlan;
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
export const SAVED_PHRASE_VERSION = 4;

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
  // 'relative' (default, omitted on legacy v1 files) is a noun-to-noun relative-clause link;
  // 'conditional' is a container-to-container hypothetical link (source = main clause, target =
  // the "if" clause); 'coordinative' is a container-to-container coordination (source = first
  // clause, target = second clause, joined by `conjunction`); 'instrumental' is a
  // container-to-container link whose target period holds the instrument noun phrase the source
  // clause acts with ("start **with a word**"). None of the three carries a noun key.
  kind?: 'relative' | 'conditional' | 'coordinative' | 'instrumental';
  source: { containerId: string; nounKey?: string };
  target: { containerId: string; nounKey?: string };
  // The coordinating conjunction, present only on a 'coordinative' link.
  conjunction?: CoordConjunction;
  // The reification degree, present only on an 'instrumental' link (absent ⇒ 'object').
  level?: AbstractionLevel;
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

// The catalog of engine-rendered UI strings (keys, plans, fallbacks), shared so the keys
// are typed on both sides of the wire.
export * from './uiStrings.js';
