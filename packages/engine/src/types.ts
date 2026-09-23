import type { Aspect, ComplementType, CoordConjunction, Degree, FocusParticle, ImperativeRegister, InfinitiveControl, LanguageCode, ModifierRelation, PronominalPossessor, RubySegment, Specifier, Tense, Voice } from '@signi/shared';
import type { SubordinatingConjunction, Subordinator } from '@signi/shared';

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
   * What the genitive possessor is to this head (see NounPhrase.possessorRole): `'whole'` is the
   * whole the head is a part of ("a part of a keyboard"), `'parts'` what the head is made up of ("a
   * group of canvases"). English renders both as an of-phrase after a head that keeps its own
   * determiner. Absent means the owner.
   */
  possessorRole?: 'owner' | 'whole' | 'parts';
  /**
   * Whether this phrase is an **adjective-definition gloss** (see NounPhrase.dimensionGloss): a bare
   * dimension-noun + degree-adjective phrase the engines render as a prepositional fragment ("of
   * great size"), the adposition chosen by the head noun's `dimensionRelation`. Set on the verbless
   * subject; the head is the dimension noun and the degree is in `adjectives`.
   */
  dimensionGloss?: boolean;
  /**
   * The complement this phrase **is**, when it is a complement-definition gloss (see
   * NounPhrase.complementGloss): a place, direction or time noun phrase the engines render as that
   * complement, with its specifiers, through the renderer a clause's complements take ("in all
   * places", "to a higher place", "on this day"). Set on the verbless subject; the phrase keeps its
   * own determiner.
   */
  complementGloss?: { type: 'locative' | 'direction' | 'temporal'; specifiers?: Specifier[] };
  /**
   * Whether this phrase is a **manner-definition gloss** (see NounPhrase.mannerGloss): a manner-noun
   * phrase the engines render as the bare prepositional adverbial defining an adverb ("at high
   * speed", "in a good way"), the adposition chosen by the head noun's `mannerRelation`. Set on the
   * verbless subject; unlike `dimensionGloss` the phrase keeps its own determiner.
   */
  mannerGloss?: boolean;
  /**
   * Whether this phrase is a **headless relative-clause gloss** (see NounPhrase.relativeGloss): the
   * engines render its `relative` alone ("that one has saved", "den man gespeichert hat", 保存した),
   * with the head unsaid but still the clause's antecedent, so agreement reads it as in a headed
   * relative. Set on the verbless subject; ignored without a relative.
   */
  relativeGloss?: boolean;
  /**
   * Whether a `this` / `that` determiner is **contrastive** (see NounPhrase.contrastive): it points
   * at one of a set and away from the rest, rather than merely pointing. Only French reads it — the
   * other six spell the distance in the determiner already — and renders the postposed deictic
   * clitic on the noun ("ce lieu-**là**").
   */
  contrastive?: boolean;
  /**
   * The focus particle singling this phrase out (see NounPhrase.focus): "only the cat", "even the
   * cat", "the cat too", 猫も. Read on the subject and the direct object, and in Japanese wherever
   * a case particle is written.
   */
  focus?: FocusParticle;
  /**
   * The cardinal numeral counting this head (see NounPhrase.numeral): "two cats", 二匹の猫. Plain
   * data — each engine spells its own word, agrees it where its language does, and Japanese adds the
   * counter its noun names.
   */
  numeral?: number;
  /**
   * The title standing with this name (see NounPhrase.title): "Mr Peter", "il signor Pietro",
   * ピーターさん. Its surface is already part of the head's, and its gender and article are the
   * head's too — this is here so an engine can tell a titled name from a bare one.
   */
  title?: ConceptForms;
  /**
   * The resolved standard of comparison of an adjective head (see NounPhrase.headStandard): "the
   * dog" in "is bigger than the dog". Present only where the head's degree licenses one (`more`,
   * `less`, `equally`), which the translator marks on the head with `forms['standard'] = '1'` so a
   * degree renderer can pick the circumfix's first half (P09-E5) — or where it is a superlative's
   * **set** ("the animals" in "is the biggest of the animals"), marked `forms['domain'] = '1'` instead
   * (P09-E19). The translator has dropped it on `positive`.
   */
  standard?: ResolvedNounElement;
  /**
   * The resolved standard of comparison of one **attributive** adjective (see
   * NounPhrase.adjectiveStandards, P09-E18): "the dog" in "a bigger cat than the dog". `index` is
   * that adjective's position in `adjectives` above — the resolved list, which may lead with a bound
   * OWN or have lost a fused adjective, so not always the plan's index. At most one per phrase; the
   * adjective carries `forms['standard'] = '1'` as a predicate one does, so its equative adverb swaps
   * alone ("a cat as big as the dog", "un gatto tanto grande quanto il cane").
   */
  adjectiveStandard?: { index: number; standard: ResolvedNounElement };
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
  /**
   * The agreement a verb standing *ahead* of the group reads — an English question, a German
   * inverted clause — where the conjunct nearest the verb is the first: "**do** the cats or the dog
   * run?" (A210, see `groupAgreement`). It differs from `agreement` only for an "or" group, and is
   * absent for a single conjunct, where an engine reads `agreement`.
   */
  invertedAgreement?: Record<string, string>;
}

/**
 * Verb mood, set by the translator. For a hypothetical conditional the main clause's verb is
 * `'conditional'` ("would run") and the "if" clause's verb is `'subjunctive'` (past /
 * imperfect-subjunctive, "if the cat ate"). For a command the verb is `'imperative'` ("eat!",
 * "don't run!"), the subject is dropped from the surface, and the subject's person/number
 * selects the imperative form (2sg default, 1pl "let's…", 2pl). Absent ⇒ plain `'indicative'`.
 *
 * `'presentSubjunctive'` is engine-internal: no plan asks for it. The Spanish and Portuguese engines
 * set it on a relative clause whose antecedent is negated ("ningún gato que coma", A170), where the
 * clause asserts nothing about a real referent. A past relative there takes `'subjunctive'`, the
 * imperfect subjunctive the protasis already uses ("que comiera").
 *
 * `'futureSubjunctive'` is engine-internal too, and Portuguese: the mood of a future event under a
 * temporal conjunction ("quando o gato comer", A252, see `adverbialClauseMood`). Spanish says the same
 * clause in its `'presentSubjunctive'` ("cuando el gato coma").
 *
 * `'infinitive'` is the subject-less, tenseless citation form a verb definition is phrased as
 * ("to consume food"; see PhrasePlan.infinitive). Like the imperative it occupies the finite/mood
 * slot — the subject is dropped and there is no tense/aspect/modal — but it is not a speech act,
 * so it carries no register. Each engine maps this onto its own dictionary infinitive.
 *
 * Each engine maps this onto its own conditional / subjunctive / imperative / infinitive forms.
 */
export type Mood = 'indicative' | 'conditional' | 'subjunctive' | 'presentSubjunctive' | 'futureSubjunctive' | 'imperative' | 'infinitive';

/** A resolved verb phrase: the verb, negation flags, tense, aspect, voice, mood, and resolved adverb. */
export interface ResolvedVerbPhrase {
  verb: ConceptForms;
  /**
   * The **finite** element's negation — the clause's sentential "not". With a modal chain that
   * element is the outermost modal, and the translator has already put its flag here, so every
   * engine negates the word it conjugates without looking at where the plan wrote the flag.
   * Do-support, "ne … pas", German's "nicht" placement and negative concord all read this one.
   */
  negative?: boolean;
  /**
   * The negation of the verb group a modal **governs** — "I want to **not** go", set only when
   * there is a modal (with none, the main verb is the finite one and its flag is `negative`).
   * Each engine renders it as its non-finite negator in front of the governed group: "non
   * andare", "ne pas aller", "nicht gehen", ja's ない form. An inner modal's own negation rides
   * `ResolvedModal.negative` the same way.
   */
  governedNegative?: boolean;
  tense?: Tense;
  aspect?: Aspect;
  /**
   * The voice the clause is realised in (see VerbPhrase.voice). Set to `'passive'` only where the
   * verb can actually take it — a transitive verb with a patient to promote — so an engine reading
   * it never has to re-check: the translator has already normalised an impossible passive back to
   * active, and has already swapped the slots (`ResolvedPhrase.subject` is the patient,
   * `ResolvedPhrase.agent` the demoted agent, and there is no `directObject` left).
   *
   * What each engine still owes is the morphology: auxiliary + past participle in six of the seven,
   * and the 〜れる/られる form in Japanese.
   */
  voice?: Voice;
  /**
   * The passive auxiliary the clause conjugates in place of its lexical verb — *be* / *essere* /
   * *être* / *ser* / *ser*, and German's *werden* (see `PASSIVE_AUXILIARY`). Present only under
   * `voice === 'passive'`, and absent in Japanese, whose passive is morphological and needs none.
   *
   * It is a full lexeme, so everything the finite slot does — tense, agreement, mood, the marked
   * aspects' own auxiliaries, a modal's infinitive — works on it unchanged, and the lexical verb
   * comes along as the participle behind it. It carries the lexical verb's `stative` rather than its
   * own: what decides whether the Romance past is the perfective or the imperfect is the event being
   * spoken of, not the auxiliary spelling it ("fu mangiato", but "era conosciuto").
   */
  passiveAux?: ConceptForms;
  mood?: Mood;
  /**
   * Set on a governed infinitive clause whose governor takes a **bare** infinitive — English *let*
   * ("lets the dog **run**", not "to run") and German *lassen* ("lässt den Hund **laufen**", with no
   * "zu" and no comma). It is lexical, named by the governor (`infinitive_bare`), and read only in
   * the two languages that write a linking word at all: the Romance ones already say which word
   * their governor takes, and "" is a bare infinitive there (see `infinitiveLink`). Localization C36.
   */
  bareInfinitive?: boolean;
  /**
   * The register of an imperative (see PhrasePlan.imperativeRegister). Absent ⇒ `'request'`,
   * a command spoken to someone. `'instruction'` is the impersonal directive a UI control or a
   * recipe step carries; each engine renders it in the form its language conventionally uses
   * there — the infinitive in fr/es/pt/de, the verbal noun in ja, the plain base in en/it.
   * Meaningless outside `mood === 'imperative'`; the engines only read it there.
   */
  register?: ImperativeRegister;
  /**
   * The clause is a yes/no question (see PhrasePlan.interrogative). Not a mood: the verb keeps its
   * indicative forms, and each engine reads this only to reorder or mark the clause. It sits here,
   * with `mood` and `register`, because the predicate builders see the verb phrase and not the
   * clause: English needs it inside the verb group for *do*-support. Set only on a top clause (and a
   * clause coordinated with it) whose mood is indicative; a relative clause never carries it.
   */
  interrogative?: boolean;
  /**
   * The clause is an **existential** (see PhrasePlan.existential, P09-E6 D5): `verb` is the
   * language's existential verb (`EXISTENTIAL_VERBS`), the phrase's `directObject` is the pivot and
   * its `subject` the impersonal third person, agreeing with the pivot where the verb does (en, it).
   * Each engine reads it for what the object path does not say: en writes "there" in the subject
   * slot, it the clitic *ci* and fr *y* in the object clitic's, es / pt conjugate *haber* / *haver*
   * for the HAVE they were resolved with, and ja drops the subject and marks the pivot が. German
   * needs nothing: *es gibt einen Kater* is the plain clause. On the verb phrase, like
   * `interrogative`, because the predicate builders see it and not the clause.
   */
  existential?: boolean;
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

/**
 * A resolved modal link: the modal verb's forms plus its own resolved adverb and negation (if any).
 *
 * `negative` is set on **inner** links only. The outermost modal is the finite element, and its
 * negation is the clause's, so the translator moves that flag to `ResolvedVerbPhrase.negative`.
 */
export interface ResolvedModal {
  verb: ConceptForms;
  modifier?: ConceptForms;
  negative?: boolean;
}

/**
 * A resolved relative clause: a full predicate (verb + objects + complements) in
 * which the head noun phrase fills the slot named by `headRole` (the "gap"). For a
 * subject-relative (`headRole === 'subject'`) the head drives verb agreement and
 * `subject` is undefined; otherwise the clause carries its own resolved `subject`
 * (which drives agreement) and the `headRole` slot is left undefined.
 *
 * `'possessor'` is the genitive relative (see RelativeClause): no slot is gapped at all — the head
 * owns the clause's `subject`, which is present and drives agreement, and each engine writes the
 * possessive relativizer together with it ("whose noun", "il cui nome", "dont le nom").
 *
 * A **passive** relative arrives re-mapped, as a passive main clause does (see ResolvedPhrase.agent):
 * the patient is the subject and the agent the by-phrase, and the gap has moved with them. A head
 * gapped as the object is the subject now ("the book that is written by the child"); a head gapped as
 * the subject is the demoted agent, the one gap only a passive has (`'agent'`: "the child by whom the
 * book is written"), and the patient is the clause's own subject.
 */
export interface ResolvedRelativeClause {
  headRole: 'subject' | 'directObject' | 'possessor' | 'agent' | ComplementType;
  /** The gap complement's specifiers (see RelativeClause.headSpecifiers); plain data. */
  headSpecifiers?: Specifier[];
  subject?: ResolvedNounElement;
  verbPhrase: ResolvedVerbPhrase;
  directObject?: ResolvedNounElement;
  /** The demoted agent of a passive relative, when it is not the gap (see ResolvedPhrase.agent). */
  agent?: ResolvedNounElement;
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
}

/** A resolved complement: its noun phrase plus any specifiers (plain data). */
export interface ResolvedComplement {
  phrase: ResolvedNounElement;
  /** The complement's own negation, carried through from the plan (see `Complement.negative`). */
  negative?: boolean;
  /**
   * The resolved action an instrument *is* at the `process` / `concept` abstraction levels —
   * "by **choosing** a word" (see Complement.action). `phrase` is the noun it acts on. Absent at
   * the `object` level and on every other complement.
   */
  action?: ResolvedVerbPhrase;
  /**
   * The word the governing verb links a **factitive** `objectPredicative` with — "transform the
   * period **into** a command" (see `objectPredicativeLink`). It is lexical, a property of the
   * verb rather than of the construction, but the verb is not in scope where a complement is
   * rendered, so the translator reads it off the verb once and carries it here. Absent (or "")
   * is the bare predicate, which is what English takes ("makes the period a command"), and it is
   * unread on every other complement and on the essive reading, whose word is the language's own.
   *
   * The `topic` is the other complement a verb may link (P09-E2): *think* governs its own
   * preposition ("pensa **al** gatto", "denkt **an** den Kater"), read off `topic_prep` (see
   * `topicLink`). Absent, the topic takes the language's own word.
   */
  link?: string;
  specifiers?: Specifier[];
}

/**
 * A wh-question's gap, resolved (see ResolvedPhrase.question). `role` is narrowed to the five slots
 * that have a question word — who/what, where, how and why; the translator refuses the rest.
 */
export interface ResolvedQuestion {
  role: 'subject' | 'directObject' | 'locative' | 'manner' | 'cause';
  /** *who* rather than *what*; read on a subject or direct-object gap only. */
  animate: boolean;
}

export interface ResolvedPhrase {
  subject: ResolvedNounElement;
  // Absent for a verbless period (a bare noun phrase — see PhrasePlan.verbPhrase).
  verbPhrase?: ResolvedVerbPhrase;
  directObject?: ResolvedNounElement;
  /**
   * The demoted agent of a passive clause — the by-phrase ("is eaten **by the cat**"). Set only
   * where `verbPhrase.voice === 'passive'`, and only when the agent is one a language would speak:
   * a **generic** agent is dropped here rather than rendered, because no language says *by one* /
   * *da si* / *von man*, and the plain agentless passive is what is wanted there.
   *
   * It is deliberately its own slot rather than a complement: the passive re-maps the clause's core
   * arguments, and `COMPLEMENT_RENDER_ORDER` and the complement machinery have nothing to do with
   * it. Each engine renders it with its own adposition (by / da / par / por / por / von / に).
   */
  agent?: ResolvedNounElement;
  // The recipient ("gives the book *to the cat*") arrives as the `terminus` complement.
  complements?: Partial<Record<ComplementType, ResolvedComplement>>;
  /**
   * The gap of a **wh-question** (see PhrasePlan.questionRole, P09-E6): which slot the question asks
   * about, and whether its answer is a person. Set on a top clause, alongside
   * `verbPhrase.interrogative`, which it implies, or on an `embedded` object clause, without it
   * (P09-E17); the gapped slot is absent from the phrase, and a
   * subject gap's `subject` is a stand-in that only agrees (third singular) and carries the gap's
   * animacy for the Japanese existential. Each engine writes its own question word and fronting.
   */
  question?: ResolvedQuestion;
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
  /**
   * A resolved infinitive complement: the clause this clause's predicate governs ("is able **to
   * eat**", see PhrasePlan.infinitiveComplement). Its verb is in the `'infinitive'` mood, so every
   * engine drops its subject; the subject is its **controller** — the governing clause's own
   * subject, or its direct object under a causative (see `control`) — kept for the agreement of a
   * predicate adjective inside it. The linking word comes from the governor's lexeme (see
   * `infinitiveLink`).
   */
  infinitiveComplement?: ResolvedPhrase;
  /**
   * A resolved **content clause standing where the subject would** (see PhrasePlan.contentSubject):
   * "it is right **that one acts**". It is a clause of its own, resolved in the mood this language
   * puts such a clause in — the present subjunctive in the four Romance languages, the indicative in
   * the other three. The phrase's own `subject` is not rendered where this is present: English,
   * French and German write their expletive in that slot instead, Italian, Spanish and Portuguese
   * nothing, and Japanese the clause itself, nominalized.
   */
  contentSubject?: ResolvedPhrase;
  /**
   * A resolved **content clause standing where the direct object would** (see
   * PhrasePlan.contentObject): "says **that the cat runs**". A clause of its own, resolved in the mood
   * the governing verb's lexeme names (`content_clause_mood`) — the indicative unless it says
   * otherwise. Nothing is written in the object slot for it; the engines put it where their own
   * grammar puts an object clause, behind the clause (German after a comma, verb-final) or, in
   * Japanese, ahead of the predicate under the verb's と or ことを (`content_clause_link`).
   *
   * When it asks — an **indirect question**, "asks whether the cat runs" (P09-E17) — it is marked
   * `embedded`, carries its `question` if it is a wh-one, and has no `verbPhrase.interrogative`: it
   * never inverts and takes no question mark or か of its own.
   */
  contentObject?: ResolvedPhrase;
  /**
   * Set on a resolved object clause that **asks** — the indirect question (P09-E17): a yes/no one
   * without a `question`, a wh-one with it. The engines open it on their *whether* (whether / se / si
   * / ob / si / se), or on the question word, in place of their *that*, and Japanese closes it on
   * かどうか / か in place of the verb's link. Absent on a statement, and on every other clause.
   */
  embedded?: boolean;
  /**
   * A resolved **adverbial clause** (see PhrasePlan.adverbialClause): the conjunction, which each
   * engine spells, and a clause of its own in the mood the conjunction governs — the indicative, or
   * the subjunctive after the Romance *before*.
   */
  adverbialClause?: { conjunction: SubordinatingConjunction; clause: ResolvedPhrase };
  /**
   * A resolved clause of purpose — what the act is done for ("click **to change**", see
   * PhrasePlan.purpose). Like an infinitive complement it is a clause of its own in the
   * `'infinitive'` mood, so every engine drops its subject; that subject is this clause's own,
   * kept for the agreement of a predicate adjective inside it. Unlike one it is an adjunct: no
   * governor, and no lexical link — each engine supplies its own connector (per / pour / um … zu /
   * ために).
   */
  purpose?: ResolvedPhrase;
  /**
   * Set on a resolved infinitive complement: which slot of the clause governing it its `subject`
   * was taken from (see InfinitiveControl). `'object'` is the causative — the governing clause's
   * direct object is the one that acts, which the Romance engines agree the clause with and
   * Japanese speaks inside it. Absent ⇒ subject control, and absent altogether on a clause that
   * is not an infinitive complement.
   */
  control?: InfinitiveControl;
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
   * The possessive pronoun alone, for the label the UI puts on a coreference link ("his" / "suo" /
   * "sein" / 彼の). Like a determiner it has no citation form of its own: English, German and
   * Japanese spell it from the antecedent's features, but the Romance languages also agree it with
   * the possessed head, so the caller supplies one to cite it on (see `translatePossessive`) and
   * this returns the possessive that head would take. The article some languages put before it
   * ("**il** suo cane", "**o** seu cão") is left off: the label names the possessive, not a phrase.
   *
   * Optional; the translator falls back to nothing where a language spells no possessive.
   */
  renderPossessive?(noun: ConceptForms, possessor: PronominalPossessor): string;
  /**
   * The coordinating conjunction alone, for the menu that picks one — the word this language
   * writes between two clauses ("but" / "ma" / "mais" / "aber" / しかし). Unlike a determiner it
   * agrees with nothing, but it is still a word no lexicon holds: each engine spells its own set
   * (see `translateConjunction`), and `then` is an adverb rather than a conjunction in most of
   * them, which is why it comes back as two words ("e poi", "und dann").
   */
  renderConjunction?(conjunction: CoordConjunction): string;
  /**
   * The word that introduces a subordinate clause, alone, for the builder's subordinate-clause menu
   * (P09-E12 D9): `that`, the complementizer of an object clause, or one of the subordinating
   * conjunctions (see `translateSubordinator`). The sibling of `renderConjunction`: a word no lexicon
   * holds, and one word or two as the language writes it ("dopo che", "parce que"). A language that
   * postposes it (Japanese) writes it after a 〜.
   */
  renderSubordinator?(sub: Subordinator): string;
  /**
   * The adposition a complement specifier spells, cited on a noun — the spatial relation of a
   * route or a locative ("under" / "sotto" / "unter" / 〜の下に), or the connector a cause takes for
   * its sentiment ("because of" / "a causa di" / "wegen"). Like a determiner it has no citation
   * form of its own: the Romance prepositions fuse with the article and Japanese wraps its noun in
   * a circumposition, so the caller supplies a **bare** noun to cite it on (see
   * `translateSpecifier`) and this returns the adposition that noun would take, without an
   * article. A language that writes the relation *after* its noun says so, in the way its
   * dictionaries do (〜の下に).
   *
   * Optional; a language implementing none renders nothing and the caller shows an em-dash.
   */
  renderSpecifier?(noun: ConceptForms, specifier: Specifier): string;
  /**
   * What a comparative degree adds to an adjective, cited on one — the degree word where the
   * language has one ("more" / "più" / "plus" / もっと) and the marked form of the adjective itself
   * where the language inflects instead (en "bigger", de "größer" / "am größten"). English does
   * both, on different adjectives, which is exactly why this is cited rather than looked up.
   * `positive` marks nothing at all and returns '' — the em-dash the caller shows for it is the
   * same "no word goes here" the bare determiner means.
   */
  renderDegree?(adjective: ConceptForms, degree: Degree): string;
  /**
   * Optional ruby (furigana) rendering: the same surface as `render`, split into
   * segments carrying kana readings. Implemented only by languages with furigana (ja).
   */
  renderRuby?(phrase: ResolvedPhrase): RubySegment[];
  /** The full stop closing a rendered sentence. Defaults to '.'; ja overrides it with '。'. */
  terminator?: string;
  /**
   * The mark closing a question in place of `terminator` (see PhrasePlan.interrogative). Defaults
   * to '?'; French sets it off with a no-break space (" ?") and Japanese writes the full-width "？".
   */
  questionMark?: string;
  /** The mark opening a question, where the language writes one: Spanish "¿". Defaults to none. */
  questionOpener?: string;
}
