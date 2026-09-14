import type { Aspect, ComplementType, CoordConjunction, ImperativeRegister, LanguageCode, ModifierRelation, PronominalPossessor, RubySegment, Specifier, Tense } from '@signi/shared';

export type { RubySegment, PronominalPossessor };

export interface ConceptForms {
  conceptId: string;
  forms: Record<string, string>;
}

/** A resolved noun-modifier: the attributive noun's forms plus its semantic relation. */
export interface ResolvedNounModifier {
  concept: ConceptForms;
  relation: ModifierRelation;
  /**
   * Adjectives modifying the attributive noun itself. Resolved for the modifier's own
   * gender/number (which the translator sets on `concept.forms`) so each engine agrees
   * them against the modifier, not the head ("creatore di frasi **semantiche**").
   */
  adjectives: ConceptForms[];
}

/** A resolved noun phrase: its head noun/pronoun plus its resolved adjectives. */
export interface ResolvedNounPhrase {
  head: ConceptForms;
  adjectives: ConceptForms[];
  /** Resolved attributive nouns ("sail boat"); relation drives the Romance preposition. */
  nounModifiers: ResolvedNounModifier[];
  /** A resolved relative clause; the head above is implicitly its subject. */
  relative?: ResolvedRelativeClause;
  /**
   * A resolved possessor: either a genitive noun phrase (Saxon genitive, "the cat's book" → "the
   * cat"), or a pronominal possessor whose features spell a possessive pronoun ("his"). Narrow
   * with `isPronominalPossessor`. The pronominal form carries no lexicon — it is pure features.
   */
  possessor?: ResolvedNounPhrase | PronominalPossessor;
  /**
   * Whether this phrase is an **adjective-definition gloss** (see NounPhrase.dimensionGloss): a bare
   * dimension-noun + degree-adjective phrase the engines render as a prepositional fragment ("of
   * great size"), the adposition chosen by the head noun's `dimensionRelation`. Set on the verbless
   * subject; the head is the dimension noun and the degree is in `adjectives`.
   */
  dimensionGloss?: boolean;
  /**
   * Whether this phrase is a **manner-definition gloss** (see NounPhrase.mannerGloss): a manner-noun
   * phrase the engines render as the bare prepositional adverbial defining an adverb ("at high
   * speed", "in a good way"), the adposition chosen by the head noun's `mannerRelation`. Set on the
   * verbless subject; unlike `dimensionGloss` the phrase keeps its own determiner.
   */
  mannerGloss?: boolean;
}

/**
 * A resolved noun element: the conjuncts filling one noun slot, and the agreement they resolve
 * to as a group. A slot holding a single phrase resolves to one conjunct and no conjunction —
 * which is the overwhelmingly common case, and is bit-for-bit what the engines saw before
 * coordination existed.
 */
export interface ResolvedNounElement {
  /** At least one. Each is a full noun phrase and renders with its own determiner/adjectives. */
  conjuncts: ResolvedNounPhrase[];
  /** The conjunction joining them; absent iff there is a single conjunct. */
  conjunction?: CoordConjunction;
  /**
   * The person/number/gender the *group* agrees as — what a verb agreeing with this slot, or an
   * adjective agreeing with it, must read. "Peter and Paul" is 3rd plural though both conjuncts
   * are singular; "il gatto e la volpe" is masculine plural though one conjunct is feminine.
   *
   * Agreement **only**: it deliberately carries no surface forms (no `base`, no `plural`), so an
   * engine that tries to render a noun from it prints nothing rather than silently printing just
   * one of the conjuncts. Render from `conjuncts`; agree from here. For a single conjunct it is
   * that conjunct's own head forms, so the two coincide and nothing changes.
   */
  agreement: Record<string, string>;
}

/**
 * Verb mood, set by the translator. For a hypothetical conditional the main clause's verb is
 * `'conditional'` ("would run") and the "if" clause's verb is `'subjunctive'` (past /
 * imperfect-subjunctive, "if the cat ate"). For a command the verb is `'imperative'` ("eat!",
 * "don't run!"), the subject is dropped from the surface, and the subject's person/number
 * selects the imperative form (2sg default, 1pl "let's…", 2pl). Absent ⇒ plain `'indicative'`.
 *
 * `'infinitive'` is the subject-less, tenseless citation form a verb definition is phrased as
 * ("to consume food"; see PhrasePlan.infinitive). Like the imperative it occupies the finite/mood
 * slot — the subject is dropped and there is no tense/aspect/modal — but it is not a speech act,
 * so it carries no register. Each engine maps this onto its own dictionary infinitive.
 *
 * Each engine maps this onto its own conditional / subjunctive / imperative / infinitive forms.
 */
export type Mood = 'indicative' | 'conditional' | 'subjunctive' | 'imperative' | 'infinitive';

/** A resolved verb phrase: the verb, negation flag, tense, aspect, mood, and resolved adverb. */
export interface ResolvedVerbPhrase {
  verb: ConceptForms;
  negative?: boolean;
  tense?: Tense;
  aspect?: Aspect;
  mood?: Mood;
  /**
   * The register of an imperative (see PhrasePlan.imperativeRegister). Absent ⇒ `'request'`,
   * a command spoken to someone. `'instruction'` is the impersonal directive a UI control or a
   * recipe step carries; each engine renders it in the form its language conventionally uses
   * there — the infinitive in fr/es/pt/de, the verbal noun in ja, the plain base in en/it.
   * Meaningless outside `mood === 'imperative'`; the engines only read it there.
   */
  register?: ImperativeRegister;
  modifier?: ConceptForms;
  /** Resolved modal verbs governing the predicate, outermost first (see VerbPhrase.modals). */
  modals: ResolvedModal[];
  /**
   * The subject complement a bare copula leaves unspoken, set by the translator on a coordinated or
   * main clause whose BE has no complement of its own after a clause that has one (A121): "the cat is
   * happy, but the dog is not" elides "happy". Each engine renders its pro-form in place of the
   * complement (it "lo" / "ci", fr "le" / "y", es "lo", de "es" / "da", ja そう), or nothing
   * (en, pt), and reads the complement to pick its copula (es/pt estar). Never a rendered complement.
   */
  elided?: ElidedComplement;
}

/** An elided subject complement and the slot it came from (see ResolvedVerbPhrase.elided). */
export interface ElidedComplement {
  type: 'predicative' | 'locative';
  complement: ResolvedComplement;
}

/** A resolved modal link: the modal verb's forms plus its own resolved adverb (if any). */
export interface ResolvedModal {
  verb: ConceptForms;
  modifier?: ConceptForms;
}

/**
 * A resolved relative clause: a full predicate (verb + objects + complements) in
 * which the head noun phrase fills the slot named by `headRole` (the "gap"). For a
 * subject-relative (`headRole === 'subject'`) the head drives verb agreement and
 * `subject` is undefined; otherwise the clause carries its own resolved `subject`
 * (which drives agreement) and the `headRole` slot is left undefined.
 */
export interface ResolvedRelativeClause {
  headRole: 'subject' | 'directObject' | ComplementType;
  /** The gap complement's specifiers (see RelativeClause.headSpecifiers); plain data. */
  headSpecifiers?: Specifier[];
  subject?: ResolvedNounElement;
  verbPhrase: ResolvedVerbPhrase;
  directObject?: ResolvedNounElement;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}

/** A resolved complement: its noun phrase plus any specifiers (plain data). */
export interface ResolvedComplement {
  phrase: ResolvedNounElement;
  /**
   * The resolved action an instrument *is* at the `process` / `concept` abstraction levels —
   * "by **choosing** a word" (see Complement.action). `phrase` is the noun it acts on. Absent at
   * the `object` level and on every other complement.
   */
  action?: ResolvedVerbPhrase;
  specifiers?: Specifier[];
}

export interface ResolvedPhrase {
  subject: ResolvedNounElement;
  // Absent for a verbless period (a bare noun phrase — see PhrasePlan.verbPhrase).
  verbPhrase?: ResolvedVerbPhrase;
  directObject?: ResolvedNounElement;
  // The recipient ("gives the book *to the cat*") arrives as the `terminus` complement.
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
  /**
   * A resolved hypothetical condition (the "if" clause). When present this phrase is the
   * main clause of a conditional (its verb resolved in the `'conditional'` mood) and
   * `condition` is the protasis (its verb resolved in the `'subjunctive'` mood). Engines
   * render it as "<if-word> <condition>, <main>".
   */
  condition?: ResolvedPhrase;
  /**
   * A resolved coordinated second clause plus the conjunction linking it to this one. When
   * present the engines render "<this clause> <conjunction-word> <coordination.clause>". The
   * two clauses always share a mood — either both plain indicative, or (when this clause is a
   * command) both imperative, the second carrying the first's register and addressee, so the
   * engines drop its subject exactly as they do the first's. The coordinated clause is not
   * itself coordinated.
   */
  coordination?: { conjunction: CoordConjunction; clause: ResolvedPhrase };
}

export interface LanguageEngine {
  language: LanguageCode;
  render(phrase: ResolvedPhrase): string;
  /**
   * One word standing on its own, with no sentence around it — a UI label naming a concept
   * ("singular", "first"). An adjective still has to *agree* with something: the word's forms
   * carry the gender/number of the noun it describes (the translator resolves them from the
   * noun named by the label's `agreesWith`), which is what lets the Romance engines render the
   * feminine "prima persona" as "prima" and not "primo".
   *
   * Optional: a language whose adjective is invariant (en, de) needs no implementation, and
   * the translator falls back to the citation form.
   */
  renderWord?(word: ConceptForms): string;
  /**
   * What goes between two words of a label that names one thing with several words ("second
   * singular"). A space in the languages that write with them; Japanese writes none (二番目単数).
   * Optional: defaults to a space.
   */
  wordJoiner?: string;
  /**
   * The determiner alone, for the UI's determiner menu — the surface this language puts before
   * `noun` for the `definiteness` its forms carry ("the" / "il" / "questo" / "tutti i" / "この").
   * A determiner has no citation form of its own: it agrees with the noun it determines, so the
   * caller supplies one (see `translateDeterminer`) and this returns the determiner it would
   * take. Return '' where the language spells no determiner at all — the bare article
   * everywhere, and every article in Japanese; the caller shows an em-dash for it.
   */
  renderDeterminer?(noun: ConceptForms): string;
  /**
   * Optional ruby (furigana) rendering: the same surface as `render`, split into
   * segments carrying kana readings. Implemented only by languages with furigana (ja).
   */
  renderRuby?(phrase: ResolvedPhrase): RubySegment[];
  /** The full stop closing a rendered sentence. Defaults to '.'; ja overrides it with '。'. */
  terminator?: string;
}
