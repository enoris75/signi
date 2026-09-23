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
 * The `objectPredicative` ascribes the same way, of the object instead of the subject ("makes
 * the period *a* command"), so it shares the indefinite default. So does the `role` (P09-E13), which
 * names a class the subject acts as ("acts as *a* friend", not "as *the* friend").
 *
 * Read by the engine when resolving a plan, and by the UI to label the determiner toggle
 * and decide where its cycle starts. Both must agree, so both call this.
 */
export function defaultDefiniteness(slot: string): Definiteness {
  return slot === 'predicative' || slot === 'objectPredicative' || slot === 'role' ? 'indefinite' : 'definite';
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

/**
 * Comparative degree of an adjective — an orthogonal grammatical feature layered on
 * the adjective word (distinct from *which* adjective is chosen). `positive` is the
 * plain, unmarked form (the default); the rest are the periphrastic degrees. Applies
 * only to real adjectives, never to attributive noun-modifiers.
 *   more/less   — comparative superiority / inferiority ("more beautiful")
 *   most/least  — (relative) superlative superiority / inferiority ("the most beautiful")
 *   equally     — equality ("equally beautiful")
 *
 * A predicate adjective's comparative and equative may name what they compare with — the
 * **standard** (`NounPhrase.headStandard`, P09-E5): "bigger than the dog", "as big as the dog".
 * The standard's word depends on the degree: `more` / `less` take *than* (di, que, als, que,
 * do que, より), `equally` a **circumfix** whose first half replaces the degree adverb itself —
 * "equally big" but "**as** big **as** the dog", it *ugualmente* but *tanto … quanto*, de *gleich*
 * but *so … wie*, es *igual de* but *tan … como*, pt *igualmente* but *tão … como* (fr *aussi … que*
 * keeps its word). Japanese puts the standard before the adjective and in place of the adverb:
 * 犬より大きい, 犬と同じくらい大きい, and the negative-polarity 犬ほど大きくない for `less`. The
 * superlatives take no standard: the same field is the **set** they select from instead, "the
 * biggest **of the animals**" (P09-E19, see `NounPhrase.headStandard`).
 */
export type Degree = 'positive' | 'more' | 'most' | 'less' | 'least' | 'equally';

export const DEGREES: Degree[] = ['positive', 'more', 'most', 'less', 'least', 'equally'];

/**
 * The degrees that take a **standard of comparison** (NounPhrase.headStandard, P09-E5): the
 * comparatives ("bigger than the dog", "less big than the dog") and the equative ("as big as the
 * dog"). `positive` compares with nothing, and the translator drops a standard there; the
 * superlatives select from a set with a partitive ("the biggest of the cats") that no *than* can
 * render, and read the same field as that set instead (P09-E19). The builder reads this set to offer
 * the standard's control (P09-E12 D5).
 */
export const STANDARD_DEGREES: ReadonlySet<Degree> = new Set<Degree>(['more', 'less', 'equally']);

/**
 * Verb tense the phrase is rendered in. Only the simple tenses today; the
 * imperfect/continuous aspect is reserved for a later split of `past`.
 */
export type Tense = 'present' | 'past' | 'future';

export const TENSES: Tense[] = ['present', 'past', 'future'];

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
 *                  has no perfect: it says "has eaten" with the past (食べました) and every
 *                  other cell with the resultant state ～ている (食べていません, 食べていました).
 * The non-finite forms (gerund, past participle, ja te-form) are lexical data per verb.
 */
export type Aspect = 'neutral' | 'progressive' | 'prospective' | 'resultative';

export const ASPECTS: Aspect[] = ['neutral', 'progressive', 'prospective', 'resultative'];

/**
 * Grammatical **voice** — which participant of the event the clause makes its subject. The
 * proposition is the same either way: `EAT(agent: CAT, patient: FOOD)` is true in exactly the same
 * worlds whether it is said as "the cat eats the food" or "the food is eaten by the cat". What
 * changes is information structure, so voice is a realisation flag on the verb phrase, not a
 * different plan:
 *   active   — the agent is the subject, the patient the direct object (the unmarked order).
 *   passive  — the **patient** is promoted to subject (it drives agreement, and a Romance
 *              participle agrees with it), and the agent is demoted to an oblique by-phrase
 *              (by / da / par / por / von / に). The verb is realised periphrastically as
 *              auxiliary + past participle everywhere but Japanese, which has the 〜れる/られる
 *              morphology instead.
 *
 * Only a **transitive or ditransitive** verb passivizes: there has to be a patient to promote, and
 * a clause with no direct object has none. Voice composes with everything else — tense, aspect,
 * modals and mood all sit on the auxiliary ("must have been eaten", "sarebbe stato mangiato").
 *
 * Agent **suppression** is not a value of this flag. "The food is eaten" asserts that somebody ate
 * it, which the active proposition entails but does not equal, so it is a different plan and not a
 * different rendering of this one: its subject is `GENERIC_PERSON`, and a generic agent is simply
 * never spoken as a by-phrase (no *by one*, *da si*, *von man*).
 */
export type Voice = 'active' | 'passive';

export const VOICES: Voice[] = ['active', 'passive'];

export const VOICE_LABELS: Record<Voice, string> = { active: 'active', passive: 'passive' };

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
 * `objectPredicative` is its counterpart on the *direct object* — what the object is made into
 * ("make this period **a command**") or taken as ("use this period **as the condition**"); see
 * `ObjectPredication` for the two readings and the marker each language puts on them.
 * `comitative` is the companion the act is carried out *together with* — "coordinate **with the
 * other period**" (con / avec / mit + dative / と). It is the accompanying party, where
 * `instrumental` is the means: both spell "with" in English, and no other language conflates them
 * beyond the Romance "con", which at least keeps the animate reading apart by context.
 */
/**
 * A **focus particle** on a noun phrase: what it singles out of the alternatives its context offers
 * (localization C39). `only` excludes them ("only the cat eats"), `even` includes the least likely
 * one ("even the cat eats"), `also` adds one to what has been said ("the cat too eats").
 *
 * It is a value rather than a concept, as the determiners are: no language has one word for it that
 * a picker could offer, and Japanese has no word at all — its だけ / さえ / も are particles that
 * replace the case particle after the phrase. The three values get `focus` entries in `UI_STRINGS`.
 */
export type FocusParticle = 'only' | 'even' | 'also';

/**
 * The slot a concept fills when it is not the one its role implies (see `Concept.slot`). Each value
 * names a field of `NounPhrase` rather than a picker, because that is what the word is for; the
 * picker that must **not** offer it follows from its role. The pattern is `Concept.modal`'s, which
 * splits the verbs between the main-verb picker and the modal one — with one difference: these four
 * have no picker of their own yet, so today the flag only keeps them out of the wrong one.
 *
 *  - `intensifier` — VERY, TOO: adverbs that modify an adjective (`adjectiveIntensifiers`, C33).
 *  - `title` — MR: a noun that stands with a personal name (`title`, C38).
 *  - `possessorOwn` — OWN_ADJECTIVE: an adjective bound to a possessor (`possessorOwn`, C37).
 *  - `indefinite` — SOMETHING: a pronoun that stands for a thing rather than a person (C32), which
 *    the pronoun chooser's person row has no place for.
 */
export type ConceptSlot = 'intensifier' | 'title' | 'possessorOwn' | 'indefinite';

/**
 * `purpose` and `topic` (P09-E2) are the nominal *for* and *about*: "works **for the man**", "speaks
 * **about the cat**". The purpose complement names a beneficiary or a goal that is a thing; an act
 * one does something *for* is the `PurposeClause` ("click **to change**"), not this. The privative
 * *without* is no type of its own: it is the `instrumental` with `Complement.negative` set.
 *
 * `role` (P09-E13) is the capacity the **subject** acts in while the verb does something else: "acts
 * **as a friend**", "reads the book **as a student**". Its word is the essive's (see
 * `ObjectPredication`) — *as / come / comme / como / als* / として — and so is its bare noun in the
 * Romance languages and German, where an article would turn it into the similative manner ("agisce
 * come **un** amico", "like a friend"). Only the controller differs: the subject rather than the
 * object, so German declines it in the nominative ("als Student") and Japanese places it with the
 * adjuncts, ahead of the object (学生として本を読む). Its head is a noun: an adjective there is the
 * depictive and a pronoun no role, so the translator drops either.
 */
export type ComplementType = 'locative' | 'direction' | 'source' | 'route' | 'cause' | 'purpose' | 'instrumental' | 'topic' | 'manner' | 'comitative' | 'terminus' | 'role' | 'temporal' | 'predicative' | 'objectPredicative';

/**
 * The complements the **builder** offers, in the order it presents them — the engine's render
 * order (`COMPLEMENT_RENDER_ORDER`) for the ones it has, so the reading order on the canvas is the
 * sentence's: the `topic` beside the manner, the `temporal` after the place, the `purpose` after the
 * cause (P09-E12b). Three complement types are not here: `objectPredicative`, `comitative` and `role` render
 * from a plan (the UI strings of C12 are built on them) but have no box on the canvas, so the
 * frontend — which derives its slots, satellites and selection fields from this list — does not
 * know about them. Add one here to give it a box.
 */
export const COMPLEMENT_TYPES: ComplementType[] = ['predicative', 'terminus', 'instrumental', 'topic', 'manner', 'locative', 'direction', 'source', 'route', 'temporal', 'cause', 'purpose'];

/**
 * The complements the builder offers on **every** period with a verb, whether the verb licenses
 * them or not (P09-E12 D2): a time ("runs on this day") and a beneficiary ("reads for the man") go
 * with any act, and the engine renders both without a licence. Seeding the licence onto each verb
 * would say nothing about any one of them. The `topic` is not here: "about the cat" is a fact about
 * the verbs of saying and thinking, which license it (SPEAK, THINK).
 */
export const ADJUNCT_COMPLEMENT_TYPES: ComplementType[] = ['temporal', 'purpose'];

/**
 * Order in which active complements are rendered within a sentence. The subject
 * complement leads (it sits right after the verb: "becomes **a legend** in the house"),
 * then the motion path "from X to Y through Z", the static locative, and the causal
 * adjunct ("because of …") last. In Japanese (SOV) everything precedes the verb, so the
 * subject complement's になる/く-form ends up adjacent to the verb regardless. The dative
 * `terminus` ("to him") — the recipient — sits right after the subject complement, before the
 * path ("gives **a legend** to the cat from the house"). The `instrumental` follows it — the
 * means belongs with the act ("cuts the bread **with the knife** in the house"), before the
 * path and the place it happens in. The `objectPredicative` follows the object it predicates of,
 * so it leads the rest ("makes the period a command in the house"), and the `comitative` companion
 * sits with the dative recipient, ahead of the instrument ("goes with the dog to the market"). The
 * `temporal` adjunct — the *when* — comes after the place, the order English and the Romance
 * languages take ("runs in the house on this day"); German prefers the reverse and Japanese fronts
 * a time before everything, but neither reorders here today, as neither does for the others.
 * P09-E2's two sit where their meaning does: the `topic` ("about the cat") beside the manner, close
 * to the verb it all but completes ("speaks about the cat like the wind"), and the `purpose` ("for
 * the man") right after the cause, the reason and the goal together ("works because of the money
 * for the man"). The `role` of P09-E13 follows the recipient, ahead of the companion: "gives the book to
 * the cat as a friend" rather than "as a friend to the cat".
 */
export const COMPLEMENT_RENDER_ORDER: ComplementType[] = ['objectPredicative', 'predicative', 'terminus', 'role', 'comitative', 'instrumental', 'topic', 'manner', 'source', 'direction', 'route', 'locative', 'temporal', 'cause', 'purpose'];

export const COMPLEMENT_LABELS: Record<ComplementType, string> = {
  predicative: 'Subject Complement',
  objectPredicative: 'Object Complement',
  comitative: 'Comitative',
  terminus: 'Terminus',
  role: 'Role',
  instrumental: 'Instrumental',
  manner: 'Adverbial of manner',
  locative: 'Locative',
  direction: 'Direction',
  source: 'Source',
  route: 'Route',
  temporal: 'Temporal',
  cause: 'Cause',
  purpose: 'Purpose',
  topic: 'Topic',
};

/**
 * Complements whose noun head carries a user-selectable determiner. The adposition-free
 * `predicative` keeps its own article; the spatial/dative/instrumental complements (locative /
 * direction / source / route / terminus / instrumental) are adposition-bearing — their engines
 * fuse the preposition with a *definite* article (Italian "alla casa") but otherwise render the
 * chosen determiner uncontracted ("a una casa", "a nessuna casa", "a molte case"). `cause` is
 * excluded: it accepts a pronoun and weaves the quantifier into its connector, a separate concern.
 * The `purpose` and `topic` of P09-E2 are plain adposition-bearing ones ("per l'uomo", "del gatto").
 * The `role` of P09-E13 carries its determiner to English alone ("as a friend", "as the speaker"):
 * every other engine drops it, as it drops the essive's.
 */
export const DETERMINER_COMPLEMENT_TYPES: ComplementType[] = ['predicative', 'objectPredicative', 'terminus', 'role', 'comitative', 'instrumental', 'topic', 'manner', 'locative', 'direction', 'source', 'route', 'temporal', 'purpose'];

/**
 * Spatial relations a `route` (path) or `locative` (place) complement can express. English needs
 * a distinct preposition for each ("through" vs "over" vs "around"); every language maps these to
 * its own adposition (and case, in German).
 *
 * The two complements share the set but not the default: a route with no specifier is a traversal
 * ("goes **through** the market"), a locative with none is plain containment ("is **in** the
 * market"). Everything else reads the same either way — the difference between "goes under the
 * bed" and "is under the bed" is carried by the verb, not the relation. That is what lets the
 * locative express "I am under the bed" / "I am behind the tree" at all.
 *
 * `in` and `through` are both members, so either complement can name either relation explicitly;
 * only the fallback differs (see DEFAULT_ROUTE_SPECIFIER / DEFAULT_LOCATIVE_SPECIFIER).
 *
 * The `direction` complement takes one too, and is the third member of the family — but it has
 * **no default**, because having no relation is a meaning of its own there. A bare direction is the
 * plain goal, the thing moved *towards* ("goes to the house" / *alla casa* / *zum Haus* / 家へ); a
 * direction carrying a relation says where the motion ends up with respect to its landmark
 * ("jumps **into** the air", "moves **behind** the house").
 *
 * `in` is what makes that worth having: it is the one relation English spells with a different word
 * in the goal reading — *into*, not *in* — and Japanese with a relational noun a static place
 * leaves out (空気**の中**へ, where being there is simply 空気**に**). Elsewhere the goal and the place
 * share an adposition, and only German's case tells them apart: the accusative of motion-into ("in
 * **die** Luft") against the dative of being there ("in **der** Luft").
 *
 * Plan-only for now: the canvas draws its specifier toolbar on the route and locative rings, and
 * the direction ring has none — the same way `objectPredicative` and `comitative` render from a
 * plan without a box of their own.
 *
 * Three more relations close the everyday set (P09-E1):
 *
 *   on      — **support**, contact from above: "sleeps **on** the table" (it *sul tavolo*, fr *sur*,
 *             de *auf*, es/pt *sobre*). Not `over`, which is superiority without contact, and which
 *             six of the seven spell apart from it. Spanish and Portuguese take *sobre* and not the
 *             *en* / *em* they already spell `in` with, so the two relations stay apart there too.
 *             **Japanese cannot tell `on` from `over`**: both are 〜の上, and the collision is
 *             deliberate — 〜の表面に for contact is a paraphrase, not a relation.
 *   between — one landmark on each side: "sleeps **between** the house and the tree". The one
 *             relation that scopes over a coordinated landmark rather than distributing across it
 *             (see `GROUP_SCOPED_SPECIFIERS`). A single landmark still renders ("between the
 *             house"); asking for two is the builder's business, as `NounGroup`'s own "at least
 *             two" is.
 *   against — **physical contact** only, from the side: "sleeps **against** the wall" (*contro*,
 *             *contre*, *contra*, de *an* + dative — not *gegen*, which is motion into it and which
 *             the accusative of a `direction` already gives as *an die Wand*). The adversarial
 *             "fights against the dog" is no spatial relation and is not this one. Japanese has no
 *             adposition for it at all — the relation lives in a verb (もたれる, "to lean") — so it
 *             renders with plain に, a known flattening pinned beside `on`'s.
 *
 * `into` is not among them and needs nothing: it is `in` under a `direction` (see above).
 */
export type PathSpecifier = 'in' | 'through' | 'under' | 'over' | 'around' | 'behind' | 'in_front_of' | 'on' | 'between' | 'against';

export const PATH_SPECIFIERS: PathSpecifier[] = ['in', 'through', 'under', 'over', 'around', 'behind', 'in_front_of', 'on', 'between', 'against'];

/** The relation each specifier-bearing complement falls back on when none is chosen. */
export const DEFAULT_ROUTE_SPECIFIER: PathSpecifier = 'through';
export const DEFAULT_LOCATIVE_SPECIFIER: PathSpecifier = 'in';

/**
 * The relations whose adposition scopes over a coordinated landmark as a whole, instead of being
 * repeated on each conjunct. Every other relation distributes: the Romance prepositions fuse with
 * each conjunct's article ("nella casa e nel bosco") and German's governs each conjunct's case, so
 * the engines emit preposition and determiner per conjunct. `between` cannot: it relates its
 * subject to the pair, so it is said once over the group — *zwischen dem Haus und dem Baum*, never
 * *zwischen dem Haus und zwischen dem Baum* — while each conjunct keeps its own article and case
 * (P09-E1 D2). Japanese needs nothing for it, since its relational noun already follows the whole
 * group (家と木の間で).
 */
export const GROUP_SCOPED_SPECIFIERS: ReadonlySet<PathSpecifier> = new Set<PathSpecifier>(['between']);

/**
 * How a `temporal` complement places its act against the time its noun phrase names — the
 * *when* of a clause, the one adjunct the engine had no complement for (localization C29, P09 §3
 * E3). Like `PathSpecifier` it is a relation the speaker chooses, and each language renders it with
 * its own adposition; unlike it, one member's adposition is the head noun's to pick (see `at`
 * below) and another is not an adposition at all in three of the seven.
 *
 *   at     — the act happens *at* that time (the default): "runs **on this day**"
 *            (it *in questo giorno*, fr *en ce jour*, de *an diesem Tag*, ja この日に)
 *   ago    — measured back from now: "runs **a moment ago**" (*un momento fa*, *il y a un
 *            instant*, *vor einem Augenblick*, *hace un momento*, 瞬間前に, *há um momento*)
 *   until  — up to that time, not past it: "runs **until this time**" (*fino a*, *jusqu'à*,
 *            *bis zu*, *hasta*, まで, *até*)
 *   after  — later than it: "runs **after this day**" (*dopo*, *après*, *nach*, *después de*,
 *            の後に, *depois de*)
 *   before — earlier than it: "runs **before this day**" (*prima di*, *avant*, *vor*, *antes de*,
 *            の前に, *antes de*)
 *   during — throughout it: "runs **during this day**" (*durante*, *pendant*, *während*,
 *            *durante*, の間に, *durante*)
 *
 * **`at` is the one whose word the head noun picks**, not the relation: English is *on* a day, *at*
 * a time, *in* a week, and German *an* dem Tag, *zu* der Zeit, *in* der Woche. That is a fact about
 * the noun's meaning, as `mannerRelation` and `place_prep` are, so each lexeme may name its own
 * `temporal_prep` and the engines fall back on the language's generic one. The other five relations
 * are the same word whatever the noun.
 *
 * Three languages say `ago` with no adposition at all: English and Italian postpose a word ("a
 * moment **ago**", "un momento **fa**"), Japanese postposes 前に, and French, Spanish and Portuguese
 * front an impersonal verb ("**il y a** un instant", "**hace** un momento", "**há** um momento").
 * German alone treats it as an ordinary preposition, the *vor* + dative it also uses for `before`.
 *
 * The canvas draws a box for it (P09-E12b), offered on every verb (`ADJUNCT_COMPLEMENT_TYPES`), and
 * its relation is the box's toolbar, as the route's path is.
 */
export type TemporalRelation = 'at' | 'ago' | 'until' | 'after' | 'before' | 'during';

export const TEMPORAL_RELATIONS: TemporalRelation[] = ['at', 'ago', 'until', 'after', 'before', 'during'];

/** A temporal complement naming no relation simply places the act at that time. */
export const DEFAULT_TEMPORAL_RELATION: TemporalRelation = 'at';

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

/**
 * The relation a `manner` adverbial (complemento di modo) draws between the act and its noun.
 * It is a **property of the head noun's meaning**, not a choice the speaker makes: WIND is a
 * comparison, SPEED a measure, CARE a means, WAY a mode — so the same noun always enters a
 * manner phrase the same way, and each engine renders the relation with its own adposition
 * (which is grammar, not a decision to expose). Carried on the noun concept
 * (`Concept.mannerRelation`) and read by the engines; a noun that declares none defaults to
 * `similative` — the neutral "in the manner of X", which reads for any noun and, unlike the
 * means "with", never collides with the instrumental complement's own "with".
 *   similative — the act is done *like* the thing (the default): "runs **like** the wind"
 *                (like / come / comme / como / wie / …のように)
 *   means      — the act is done *with* the thing/quality: "runs **with** care" (con / avec / mit / で)
 *   measure    — the act reaches a degree/rate:            "runs **at** the speed" (a→alla / à / mit / で)
 *   mode       — the act is done *in* a fashion:           "runs **in** a good way" (in / de / auf / で)
 */
export type MannerRelation = 'similative' | 'means' | 'measure' | 'mode';

export const MANNER_RELATIONS: MannerRelation[] = ['similative', 'means', 'measure', 'mode'];

/**
 * The relation a **dimension noun** bears to the adjective it scales, in an adjective-definition
 * gloss ("great **in** size", "high **in** quality", "hot → high **at** a temperature"). Like
 * `MannerRelation` it is a property of the noun's meaning — SIZE / STRENGTH / AGE are *extents*
 * ("in"), QUALITY / VIRTUE are *qualities* ("of"), TEMPERATURE is a *measure* ("at a …") — and each
 * engine renders it with its own adposition and article. Carried on the noun concept
 * (`Concept.dimensionRelation`) and read by the engines when an adjective-headed fragment names one
 * as its `NounPhrase.dimension`; a noun that declares none defaults to `extent`, the neutral "in".
 *   extent  — the adjective measures how much of a scalar property: "great **in** size"
 *             (in / di / en / an / de / …の点で)
 *   quality — the adjective grades a kind/worth: "high **of** quality" ("of" family)
 *   measure — the adjective names a point on a scale reached: "high **at** a temperature"
 */
export type DimensionRelation = 'extent' | 'quality' | 'measure';

export const DIMENSION_RELATIONS: DimensionRelation[] = ['extent', 'quality', 'measure'];

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
 *   concept — the same action, abstracted into a protocol one *invokes*: "start **with the
 *             choosing of a word**". Realised by nominalising the verb, each language with the
 *             noun it makes of one — the substantivized infinitive in it/es/pt ("con lo
 *             scegliere", "con el elegir"), the capitalised infinitive plus a genitive object in
 *             de ("mit dem Wählen eines Wortes"), the -ing noun in en, ja ～ことで. French alone
 *             stays periphrastic ("avec le fait de choisir"), having no productive one.
 *             Emphasises rule and system.
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

/**
 * What an `objectPredicative` says of the direct object — the two readings the construction has,
 * which every one of these languages marks differently.
 *
 *   factitive — the object *becomes* the complement, by the act itself: "transform this period
 *               **into a command**". The link is a fact about the verb, not about the
 *               construction (English "make X a Y" takes none where "turn X into Y" takes one), so
 *               the governing verb's lexeme names it as `object_predicative_link`, exactly as it
 *               names an `infinitive_link`: en *into* / it *in* / fr, es *en* / pt *em* / de *in*
 *               (+ accusative) / ja に. A verb naming none takes the bare predicate ("makes it a
 *               command").
 *   essive    — the object is *taken as* the complement, without becoming it: "use this period
 *               **as the condition**". One word per language, a fact about the grammar rather than
 *               the verb: en *as* / it *come* / fr *comme* / es, pt *como* / de *als* / ja として.
 *               It names a role rather than picking a referent out, so the Romance engines and
 *               German leave its noun article-less whatever determiner the plan carries ("come
 *               condizione", "als Bedingung"); English keeps the article it was given.
 *
 * The `role` complement (P09-E13) is the essive's subject-oriented counterpart: the same word, said
 * of the subject ("acts **as a friend**") rather than the object.
 *
 * Carried as a `predication` specifier on the complement; absent ⇒ `factitive`.
 */
export type ObjectPredication = 'factitive' | 'essive';

export const OBJECT_PREDICATIONS: ObjectPredication[] = ['factitive', 'essive'];

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
  /**
   * The concept's dictionary definition, keyed by language, for the tooltip a picker shows on
   * hover. Only English is seeded for now (from `description`); other languages have no entry
   * yet, so a picker showing another language falls back to `en`. Schema and API carry all
   * seven so a translated definition is a data add, not a code change.
   */
  definitions?: Partial<Record<LanguageCode, string>>;
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
  /**
   * The clause a verb takes as its object, when it takes one (P09-E12 D9): a finite `content` clause
   * ("says **that the cat runs**", `PhrasePlan.contentObject`) or an `infinitive` complement ("needs
   * **to run**", `PhrasePlan.infinitiveComplement`). It is what offers the builder's subordinate-clause
   * menu its *that* / *to* entries; the adverbial clause needs no licence. Absent for every other verb.
   */
  clauseObject?: ClauseObject;
  /**
   * The slot this concept fills, where that is **not** the one its role implies (see `ConceptSlot`).
   * A picker offering its role must filter it out: *very* is an adverb that never modifies a verb,
   * *Mr* a noun that never fills a noun slot, *own* an adjective that exists only beside a possessor,
   * *something* a pronoun that is not a person. Absent for every ordinary concept, which is what
   * every existing picker wants.
   */
  slot?: ConceptSlot;
  person?: '1' | '2' | '3';   // only set for pronouns
  number?: 'singular' | 'plural'; // inherent grammatical number, only set for pronouns
  gendered?: boolean;           // noun has distinct masc/fem surface forms
  animate?: boolean;            // referent is animate (human/animal) — affects motion-goal adposition
  human?: boolean;              // referent is a person — English relativises "who" on this, not animacy
  countable?: boolean;          // false for mass/uncountable nouns (water, food) — changes quantifier words
  mannerRelation?: MannerRelation; // how this noun enters a manner adverbial (SPEED→measure, CARE→means); default means
  dimensionRelation?: DimensionRelation; // how this noun enters an adjective-definition gloss (SIZE→extent "in"); default extent
  alarm?: boolean;              // noun naming a danger one cries out a warning of (WOLF, FIRE) — see `alarmCry`
  alarmCry?: boolean;           // verb whose `alarm` object is the shout itself ("cry wolf"): it takes no determiner (A163)
  complements?: ComplementType[]; // complements a verb licenses (motion/locative/cause, or the copular `predicative`)
  /**
   * The concept's hypernym — the id of the concept it *is a* kind of (CARAVEL → SAILING_SHIP).
   * At most one, so the edges form a forest. Only the direct parent travels; a client that wants
   * the full chain walks it, since every ancestor is itself in the concept list.
   */
  isA?: string;
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
  // Under an `antecedent` it is the referent's natural gender instead (see there).
  gender?: 'masc' | 'fem' | 'neut';
  /**
   * The noun a **3rd-person pronoun** head stands for — a concept id: `{ concept: 'THIRD_PERSON',
   * antecedent: 'CONTENT' }` is "it" (en), "lo" (it), "ihn" (de). The pronoun names the noun rather
   * than a gender because the languages want different genders of it, and each reads its own from
   * its own lexicon (localization C20):
   *
   *  - de, it, fr, es, pt take the antecedent's **grammatical** gender — *Inhalt* is masculine, so
   *    German says "ihn"; *Option* is feminine, so Italian says "la". A `gender` on the pronoun is
   *    the referent's, and reaches the noun only through a feminine counterpart of its own ("la
   *    compagna" → "la"): "la persona" is "la" whoever it is.
   *  - en, ja take the **natural** gender, which no noun lexeme carries: the pronoun's own `gender`
   *    when the plan states it, else neuter for anything that is not a person ("it", それ). A person
   *    whose gender is not stated is never guessed at: the singular is not pronominalised at all,
   *    and reads as the antecedent under the anaphoric demonstrative ("that person", その人).
   *
   * Number is the pronoun's own (`number`, singular by default): the antecedent names a word, not
   * a referent, and a word has no number. Ignored on any head but a 3rd-person pronoun.
   */
  antecedent?: string;
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
   * An **intensifier** per adjective, index-aligned with `adjectives`: the id of an adverb flagged
   * `Concept.intensifier` (VERY, TOO), or nothing for the plain adjective. It says *how much*,
   * where `adjectiveDegrees` says *more or less than what* — "a very big cat", "un chat très
   * grand", "ein sehr großer Kater", とても大きい猫 — and the two compose ("molto più grande").
   *
   * Where it goes is the intensifier's own, not the adjective's: before it in six languages and
   * for pt *muito*, but **after** it for pt *demais* (*grande demais*), and in Japanese TOO is not
   * a word at all but the suffix 〜すぎる on the adjective's stem (大きすぎる), which inflects as a
   * verb. Each lexeme names which (`position`: pre / post / suffix). Localization C33.
   */
  adjectiveIntensifiers?: (string | undefined)[];
  /**
   * A **standard of comparison** per adjective, index-aligned with `adjectives` — the attributive
   * counterpart of `headStandard` (P09-E18): "a bigger cat **than the dog**", *un gatto più grande
   * **del cane***, *einen größeren Kater **als den Hund***, **犬より**大きい猫. The words are
   * `headStandard`'s, by degree (than / as, di / quanto, que, als / wie, que / como, do que / como,
   * より / ほど / と同じくらい).
   *
   * **At most one renders**: the first adjective whose degree takes a standard (`STANDARD_DEGREES`:
   * the comparatives and the equative) and whose entry is set. Every other entry is dropped — on a
   * `positive` adjective, on a superlative (whose set is predicative only, P09-E19 D5), and on a
   * second compared adjective, since no language says "a bigger-than-the-dog more-beautiful-than-the-
   * fox cat".
   *
   * Where it goes is each language's:
   *
   *  - en: the comparative stays before the noun and the standard follows the head noun, ahead of
   *    an of-possessor and a relative clause ("a bigger cat than the dog that sleeps"); the equative
   *    adjective moves behind the noun with it ("a cat as big as the dog").
   *  - it / fr / es / pt: the compared adjective, already post-nominal, moves last among the
   *    post-nominal adjectives and the standard follows it ("un gatto marrone e più grande del
   *    cane"), ahead of a genitive possessor.
   *  - de: the adjective declines before the noun as ever and the standard follows the noun, in the
   *    phrase's own case ("sieht einen größeren Kater als den Hund").
   *  - ja: before the compared adjective, in its degree adverb's place (犬より大きい猫).
   */
  adjectiveStandards?: (NounElement | undefined)[];
  /**
   * The intensifier of the *head* itself, the counterpart of `headDegree`: only meaningful when the
   * head is an adjective — the predicate adjective of a `predicative` subject complement ("is
   * **very** big"). Ignored for a noun or pronoun head.
   */
  headIntensifier?: string;
  /**
   * Comparative degree of the *head* itself. Only meaningful when the head is an adjective —
   * i.e. the predicate adjective of a `predicative` subject complement ("seems **happier**"),
   * the one place an adjective heads a noun phrase. Ignored for a noun or pronoun head.
   * Threaded into the resolved head's `forms['degree']`, like `adjectiveDegrees`.
   */
  headDegree?: Degree;
  /**
   * What the head's degree measures the predicate adjective **against**, read by the degree:
   *
   *  - on `more`, `less` or `equally`, the **standard of comparison** it is compared *to*: "the cat is
   *    bigger **than the dog**", "as big **as the dog**", 猫は**犬より**大きい (P09-E5);
   *  - on the superlatives `most` / `least`, the **set** it selects from: "the cat is the biggest **of
   *    the animals**", *il più grande degli animali*, *das größte der Tiere*, 動物の中で最も大きい
   *    (P09-E19). Cycling "bigger than the dogs" to `most` reads "the biggest of the dogs".
   *
   * Only meaningful on an adjective head; the translator drops it on `positive`.
   *
   * The word it takes is the degree's, not a constant: than / di / que / als / que / do que / より
   * for `more` and `less`, the circumfix as … as / tanto … quanto / aussi … que / so … wie /
   * tan … como / tão … como / と同じくらい for `equally` (see `Degree`). A set takes a partitive: en
   * "of" before a plural, coordinated or pronoun set and "in" before a singular noun ("the most
   * beautiful in the family"); it "di" and fr / es / pt "de", fused with each conjunct's article, fr
   * "d'entre" before a pronoun; de the bare genitive, or "von" + the dative of a pronoun; ja の中で,
   * the degree adverb 最も staying. A set also gives English and German the article: "is **the**
   * biggest of", "ist **das** größte der" (the gender of a plural noun set, else the subject's),
   * where the bare superlative stays "is biggest", "ist am größten".
   *
   * It is the **predicate** adjective's: an attributive comparative ("a bigger cat than the dog")
   * takes its standard from `adjectiveStandards`, index-aligned with the adjective it belongs to
   * (P09-E18); the two fields are independent. It is a noun *element*, so a coordinated standard
   * ("bigger than the dog and the man") is one like any other.
   * It is not a complement: it belongs to the adjective, is licensed by a degree rather than by a
   * lexeme, and in Japanese must stand beside its adjective rather than in the complement block (D5).
   */
  headStandard?: NounElement;
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
   * An optional possessor — one of two shapes (see `Possessor`):
   *  - a full owning **noun phrase**, the Saxon genitive ("the cat's book" → the head is
   *    "book", the possessor is "the cat"). Being a noun phrase itself it carries its own
   *    number/gender/adjectives and may in turn have a possessor ("the cat's owner's book").
   *  - a **pronominal possessor** ("the boy and *his* horse"), the features of an antecedent
   *    the possessor corefers with. The engine renders a possessive pronoun agreeing (in
   *    Romance/German) with *this* possessed head. See `PronominalPossessor`.
   */
  possessor?: Possessor;
  /**
   * What the genitive `possessor` is to this head. `'owner'` (the default) is possession, the
   * Saxon genitive where English can take it: "the cat's book", "Italy's language". The other two
   * are the part-whole relation, read from either end (localization C26):
   *  - `'whole'`: the possessor is the **whole this head is a part of** — "a part **of a
   *    keyboard**", "the visible part **of a fire**", "the end **of a life**".
   *  - `'parts'`: the possessor is **what this head is made up of** — "a group **of canvases**".
   *
   * Only English tells them from the owner on the surface: neither is ever the clitic, so the head
   * keeps its own determiner and the possessor follows it as an of-phrase, where "a keyboard's
   * part" would read as a part the keyboard owns and "canvases' group" as a group they own. The
   * other six already say all three with one genitive (it "una parte di una tastiera", de "ein
   * Teil einer Tastatur", ja "キーボードの部分"), and read the flag nowhere. Ignored on a pronominal
   * possessor, which stays the possessive pronoun ("its part").
   */
  possessorRole?: 'owner' | 'whole' | 'parts';
  /**
   * Bind OWN to the `possessor` — "my **own** cat", "il **proprio** gatto", "sein **eigener**
   * Kater", 自分の猫 (localization C37). It is a flag here rather than an entry in `adjectives`
   * because the word exists only beside a possessor: an "own cat" with nobody owning it is not a
   * phrase in any of the seven, and the builder offers the control only once a possessor is set.
   *
   * The engines are given it as an adjective all the same (the translator puts OWN_ADJECTIVE at the
   * head of the resolved adjectives, marked `possessor_bound`), so it agrees and declines with the
   * head by the ordinary machinery and stands before the noun everywhere. Japanese is the exception
   * the flag exists for: 自分の does not join the possessor, it **replaces** it — *his own cat* is
   * 自分の猫, never 彼の自分の猫 — and a genitive possessor keeps its own word, 猫自身の本.
   *
   * Ignored with no possessor.
   */
  possessorOwn?: boolean;
  /**
   * Render this phrase as an **adjective-definition gloss**: a bare noun phrase of a *dimension
   * noun* carrying a *degree adjective* ("great size" / "grande dimensione"), realised as a
   * prepositional fragment whose adposition the head noun's `dimensionRelation` selects — BIG →
   * "of great size" / "di grande dimensione", GOOD → "of high quality". Only meaningful on the
   * subject of a verbless period (see the engines' verbless branch); the head is the dimension
   * noun and the degree lives in `adjectives`. The adjective agrees with and is positioned against
   * the dimension noun by the ordinary noun-phrase machinery — the preposition is all that is
   * added. Ignored when a verb phrase is present or the head is not a noun.
   */
  dimensionGloss?: boolean;
  /**
   * Render this phrase as a **complement-definition gloss**: the verbless fragment that defines a
   * place, direction or time adverb, which is exactly the `type` complement a clause would carry
   * after its verb — EVERYWHERE → locative "in all places" / "in tutti i luoghi" / すべての場所で, UP →
   * direction "to a higher place" / "zu einem höheren Ort" / より高い場所へ, TODAY → temporal "on this
   * day" / "an diesem Tag" / この日に (C29). It is rendered by the same code that renders that
   * complement in a clause, so the adposition, the case, the article fusion and any idiom are the
   * complement's own, and `specifiers` are the complement's (a `path` relation: "under all places",
   * "into a group"; a `temporal` one: "a moment ago", "until this time"). The phrase keeps its own
   * `definiteness`, as `mannerGloss` does. Localization C25, C29. Only meaningful on the subject of
   * a verbless period (see the engines' verbless branch); ignored when a verb phrase is present.
   */
  complementGloss?: { type: 'locative' | 'direction' | 'temporal'; specifiers?: Specifier[] };
  /**
   * Render this phrase as a **manner-definition gloss**: a *manner noun* phrase realised as the
   * bare prepositional adverbial that defines an adverb — FAST → "at high speed", WELL → "in a good
   * way", ALWAYS → "at all times", NEVER → "at no time". The adposition is chosen by the head noun's
   * `mannerRelation` (measure → "at", mode → "in", means → "with", similative → "like"), exactly as
   * a `manner` complement selects it; unlike `dimensionGloss` the article is *not* stripped — the
   * phrase's own `definiteness` supplies it ("**a** good way", "**all** times", "**no** time"), so
   * the same NP machinery that renders a manner complement renders this fragment. Only meaningful on
   * the subject of a verbless period (see the engines' verbless branch); ignored when a verb phrase
   * is present or the head is not a noun.
   */
  mannerGloss?: boolean;
  /**
   * Render this phrase as a **headless relative-clause gloss**: its `relative` alone, as the
   * language says it after a head, with the head and everything that belongs to it left unsaid —
   * no determiner, adjectives, noun modifiers or possessor, and no German comma. It defines an
   * adjective by the clause it is: SAVED → en "that one has saved", it "che si è salvato", fr
   * "qu'on a enregistré", de "den man gespeichert hat", es "que se ha guardado", ja 保存した, pt "que
   * se salvou"; WILD → "that lives in nature". A noun-phrase gloss ("an object that one has saved")
   * would define a *saved thing*, not *saved* (localization C23).
   *
   * The head is the clause's **antecedent**: unspoken, but what the clause is about, so everything
   * that agrees with it in a headed relative agrees with it here, unchanged — the same principle as
   * a pronoun's `antecedent`. German's relative pronoun takes its gender and the gap's case
   * (*Gegenstand* → "den man gespeichert hat", *Wesen* → "das man sehen kann"); English says "who"
   * for a person and "that" otherwise; the Romance participles and predicate adjectives agree with
   * it (fr "qu'on a enregistrée" of a feminine one), and its number reaches the verb where the
   * headed relative's does. The gloss author picks it: the class of thing the adjective is said of.
   *
   * Only meaningful on the lone subject of a verbless period (see the engines' verbless branch) that
   * carries a `relative`; ignored — the phrase renders as before — without one, under a verb phrase,
   * or on a coordination.
   */
  relativeGloss?: boolean;
  /**
   * Mark a `this` / `that` determiner as **contrastive** — pointing at one of a set and away from
   * the rest ("*that* place, not this one"), rather than merely pointing at something present. Six
   * languages spell the contrast in the determiner itself and read this nowhere (en this/that, it
   * questo/quel, de dieser/jener, es este/ese, pt este/esse, ja この/その); French does not — its
   * single *ce* series covers both, and the distance is carried by the postposed deictic clitics
   * *-ci* / *-là*, which are marked and only written where the contrast is meant ("ce lieu-**là**",
   * "cette maison-**là**"; see `demArticle`).
   *
   * A definition is where the distance *is* the meaning, so THERE's gloss "in that place" sets it
   * and French says *dans ce lieu-là* instead of HERE's *dans ce lieu* (localization C40). Ignored
   * on any other determiner, and on a pronoun head.
   */
  contrastive?: boolean;
  /**
   * A **focus particle** on this phrase — "**only** the cat", "**even** the cat", "the cat **too**"
   * (see `FocusParticle`, localization C39). It is the phrase that is singled out, not the act, which
   * is what distinguishes it from the focus *adverbs* ONLY and ALSO, whose scope is the verb ("the
   * cat only eats"). Six languages write a word before the phrase — and English writes "too" after
   * it, French "aussi" after it — where Japanese writes a particle that **replaces** が / を / は
   * (猫も, 食べ物さえ) and follows every other particle (家にも).
   *
   * Read on the subject and the direct object, and in Japanese wherever a case particle is written.
   * Ignored on a conjunct of a coordination: the focus is of the whole slot, and no engine spells it
   * once per conjunct.
   */
  focus?: FocusParticle;
  /**
   * A **cardinal numeral** counting the head — "**two** cats", "le **due** case", "**zwei** Häuser",
   * 二匹の猫 (localization C31). It is a value beside `definiteness` rather than a concept, as the
   * determiners are: no picker offers a word for it, and Japanese has no word at all without the
   * **counter** its noun chooses (匹 for an animal, 軒 for a house, 時間 for an hour).
   *
   * From two up it makes the phrase plural wherever the language has a plural, and it stands before
   * the noun in all seven. It agrees only where the language agrees it — *un/una*, *ein/eine*,
   * *dois/duas* — and only at one; every language's higher cardinals are invariable. An indefinite
   * article gives way to it, because in five of the seven the numeral *is* that article at one; a
   * definite or demonstrative determiner keeps its place in front of it ("the two cats").
   *
   * The words are spelled for 1–12 and 24 — the numbers the calendar glosses count in — and any
   * other value renders as its digits, which every one of the seven writes that way.
   */
  numeral?: number;
  /**
   * A **title** standing with a personal name — "**Mr** Peter", "il **signor** Pietro", ピーター**さん**
   * (localization C38). The id of a concept flagged `title`; meaningful only on a head that is both
   * `proper` and a person, because a title with no name to precede is not a phrase.
   *
   * The title and the name are one noun phrase, and the engines are given it as one word: the name
   * keeps the role, and everything that agrees agrees with the **title**, which is what the article
   * lands on ("**il** signor Pietro", where the bare name is "Pietro"). Whether a language articles a
   * title at all is the title's own business, and so is where it stands: Japanese writes it after the
   * name, and Italian drops its final -e before one (*signore* → *signor*).
   */
  title?: string;
}

/**
 * A possessor whose surface is a **possessive pronoun** ("my" / "his" / "their"), rather than a
 * full genitive noun phrase. It carries only the grammatical features of the antecedent it
 * corefers with — the person/number/(natural) gender the pronoun agrees *with*. In English and
 * German those features fully determine the word (his/her/its, sein/ihr); in the Romance
 * languages the pronoun *also* agrees in gender/number with the possessed head, which the engine
 * reads off that head, so 3rd-singular his/her collapse to one form ("il **suo** cavallo").
 *
 * The coreference itself is resolved before the plan is built (the UI points at another noun in
 * the same period and materialises its features here), so the engine sees only features — never a
 * link.
 */
export interface PronominalPossessor {
  kind: 'pronominal';
  person: '1' | '2' | '3';
  number: 'singular' | 'plural';
  /** Natural gender of the antecedent — distinguishes en his/her/its and de sein/ihr. */
  gender?: 'masc' | 'fem' | 'neut';
}

/** A noun phrase's possessor: a genitive noun phrase, or a coreferent possessive pronoun. */
export type Possessor = NounPhrase | PronominalPossessor;

/**
 * Whether a possessor is the pronominal (possessive-pronoun) kind rather than a genitive phrase.
 * Generic over the possessor's static type so it narrows equally on the plan-level `Possessor`
 * and on the engine's *resolved* possessor union (a `ResolvedNounPhrase | PronominalPossessor`),
 * which has the same discriminator but a different phrase shape.
 */
export const isPronominalPossessor = <T>(p: T): p is Extract<T, PronominalPossessor> =>
  typeof p === 'object' && p !== null && 'kind' in p &&
  (p as { kind?: unknown }).kind === 'pronominal';

/**
 * Two or more noun phrases coordinated into one noun element ("Peter **and** Paul", "aramaic
 * **or** latin"). The conjunction belongs to the group as a whole, not to each junction: three
 * conjuncts are "Peter, Paul and Mary", not "Peter and Paul and Mary" — where the comma falls,
 * and whether the word repeats, is a fact about each language, so the engines do the joining.
 *
 * Each conjunct is a full `NounPhrase` and keeps its own determiner, number, gender, adjectives,
 * possessor and relative clause — which is what Romance needs (it repeats the article: "il gatto
 * **e il** cane") and what lets conjuncts differ ("Peter and the old dog that barks").
 *
 * The group is flat: one conjunction over all its conjuncts. Nested scope ("Peter and either Paul
 * or Mary") is deliberately not expressible.
 */
export interface NounGroup {
  /** At least two — a lone phrase is not a group, it is a `NounPhrase` (see `NounElement`). */
  conjuncts: NounPhrase[];
  conjunction: CoordConjunction;
}

/**
 * What can stand in a noun slot: a single noun phrase, or several coordinated. Every slot that
 * holds a noun takes an element — subject, direct object, complement, and the slots of a relative
 * clause. A `possessor` is the exception and stays a plain `NounPhrase`: "Peter and Paul's book"
 * cannot say whether they own it jointly or one apiece, so there is nothing for the user to mean.
 */
export type NounElement = NounPhrase | NounGroup;

/** Whether a noun element is a coordinated group rather than a single phrase. */
export function isNounGroup(element: NounElement): element is NounGroup {
  return 'conjuncts' in element;
}

/** The conjuncts of any noun element, in order — a single phrase is a group of one. */
export function nounConjuncts(element: NounElement): NounPhrase[] {
  return isNounGroup(element) ? element.conjuncts : [element];
}

/**
 * The conjunctions that may join **noun phrases** — the copulative and the disjunctive only.
 * The other four in `CoordConjunction` relate propositions and need a predicate on each side:
 * `therefore` draws a conclusion, `that_is` paraphrases a clause, `but` contrasts two assertions,
 * `then` sequences two events. None of them join two things.
 */
export const NOUN_COORD_CONJUNCTIONS: CoordConjunction[] = ['and', 'or'];

/**
 * A subordinate (restrictive relative) clause. It is a full predicate — verb phrase
 * plus optional objects and complements. The head noun phrase it hangs off of fills
 * one of the clause's slots (the "gap"), named by `headRole`:
 *  - `'subject'` (the default): a subject-relative, "the boy *who cried*". The gap is
 *    the subject, so `subject` is left undefined and the head drives verb agreement.
 *  - anything else: a non-subject relative, "the book *that I read*". The gap slot
 *    (e.g. `directObject`) is left undefined, the clause carries its own `subject`,
 *    and that subject drives agreement.
 *
 * A complement gap relativises on that complement's preposition ("the house *under which* the cat
 * eats"). A `locative` gap in the plain default relation is the place the clause happens, "a place
 * *where* one lives": en *where*, it *dove*, fr *où*, es *donde*, pt *onde*. German keeps the
 * prepositional pronoun (*in dem*), and Japanese needs no relativizer (住む場所).
 *
 * A `'possessor'` gap is the genitive relative — the head *owns* the clause's subject rather than
 * filling a slot of it: "a period **whose** noun is a word". The clause keeps its own `subject`
 * (the possessed noun), and the relativizer is the possessive one, which every language writes
 * together with that noun: en *whose noun*, it *il cui nome*, fr *dont le nom*, es *cuyo nombre*,
 * pt *cujo nome*, de *dessen/deren Nomen*. Japanese needs no relativizer here either — its gapped
 * clause simply precedes the head (名詞が単語である期間).
 */
export interface RelativeClause {
  /** Which slot the head fills within this clause (the gap). Defaults to 'subject'. */
  headRole?: 'subject' | 'directObject' | 'possessor' | ComplementType;
  /**
   * The specifiers of the complement the head fills, when `headRole` is a complement: its spatial
   * relation or sentiment. The complement's noun phrase is the head itself, so these are all that
   * survive the gap, and they pick the relativizer's preposition ("the house *under* which the cat
   * eats", "the dog *thanks to* which…").
   */
  headSpecifiers?: Specifier[];
  /** The clause's own subject — present when headRole !== 'subject' (drives agreement). */
  subject?: NounElement;
  verbPhrase: VerbPhrase;
  directObject?: NounElement;
  complements?: Partial<Record<ComplementType, Complement>>;
}

/**
 * One link in the modal chain: a modal verb concept plus, optionally, its *own* adverb and its
 * *own* negation. Every verb in a group carries both of its own — the main verb via
 * `VerbPhrase.modifier` and `VerbPhrase.negative`, each modal via this `modifier` and `negative`.
 * "I **never** wanted to **always** go" is WILL with `modifier: 'NEVER'` governing GO with
 * `VerbPhrase.modifier: 'ALWAYS'`; "I **do not** want to **not** go" is WILL with
 * `negative: true` governing GO with `VerbPhrase.negative: true`.
 */
export interface ModalVerb {
  verb: string;                    // modal verb concept id (`Concept.modal`)
  modifier?: string;               // adverb id scoped to *this* modal, not the main verb
  /**
   * This modal's own negation, not the main verb's: "I do not want to go" is WILL with
   * `negative`, where "I want to not go" is a plain WILL over a negated verb phrase. Each denies
   * one word of the group, and a chain may deny several ("I do not want to not go").
   */
  negative?: boolean;
}

/**
 * A modal chain link. A bare string is shorthand for a modal with no adverb and no negation of its
 * own (`'MUST'` ≡ `{ verb: 'MUST' }`), so the common plain chain stays terse.
 */
export type ModalRef = string | ModalVerb;

/** The predicate head: a core verb, optional negation, and an optional adverb. */
export interface VerbPhrase {
  verb: string;                    // core verb id
  /**
   * The **main verb's** negation — the word this verb phrase heads, not the group above it. With
   * no modal that verb is the finite one, so this is the clause's "not". Under a modal it denies
   * only the governed verb ("I want to **not** go"); the modal's own denial is `ModalVerb.negative`.
   */
  negative?: boolean;
  modifier?: string;               // adverb id scoped to the main verb
  tense?: Tense;                   // defaults to 'present'
  aspect?: Aspect;                 // defaults to 'neutral'
  /**
   * Which participant heads the clause (see `Voice`). Defaults to `'active'`. A `'passive'` on a
   * verb that cannot take it — an intransitive one, or a clause with no direct object to promote —
   * normalises back to active rather than rendering half a passive. The agent is not lost: it
   * survives as the by-phrase, unless it is the generic person, which no language spells there.
   */
  voice?: Voice;                   // defaults to 'active'
  /**
   * Modal verbs governing this predicate, outermost first — obligation (must / dovere),
   * ability (can / potere), volition (will / volere). `[{verb:'WILL'}, {verb:'CAN'}]` over GO is
   * "voglio poter andare", "I want to be able to go". Each is an ordinary verb concept flagged
   * `Concept.modal`, so it conjugates out of the lexicon; what marks a modal out is that
   * it *governs* a non-finite verb group instead of heading one.
   *
   * Only the outermost modal is finite: it carries the tense and the subject agreement.
   * Every inner modal takes its `nonfinite` form (Italian apocopates,
   * *potere* → *poter*; English is suppletive, *can* → *be able to*), and the innermost
   * element is the infinitive of the main verb's *whole* group — so a modal composes with
   * `aspect`: "must **have seen**", "deve **aver visto**". Two lexical form keys carry the
   * language-specific joinery: `nonfinite` (default: `base`) and `link`, a particle emitted
   * before the governed element (English "want **to** go"; empty elsewhere).
   *
   * **Negation is per word.** Each link carries its own `negative`, and `VerbPhrase.negative`
   * carries the main verb's, so every scope of a chain can be said: ¬want ("I do not want to go"),
   * want ¬go ("I want to not go"), or both ("I do not want to not go"). The finite modal's
   * negation is the clause's sentential one; a negated inner element takes its language's
   * non-finite negator in front of it ("voglio **non** andare", "je veux **ne pas** aller",
   * ja 行か**ない**でいたい).
   *
   * Each link may also carry its own `modifier` (an adverb scoped to that modal). A negative
   * adverb (polarity `negative`, e.g. NEVER) anywhere in the group forces sentential negation
   * onto the finite element regardless of which verb it modifies (A236: it belongs on the verb
   * it modifies, as `negative` now does).
   *
   * Japanese has no modal verbs — modality is suffixal (〜必要がある / 〜ことができる /
   * 〜たい) — so its lexemes carry `governs` / `suffix_dict` / `suffix_stem` / `kind`
   * instead, and its engine drops `aspect` under a modal (a documented gap).
   *
   * The UI chains two today; the model is uncapped. A link may be a bare id string (shorthand
   * for a plain modal) or a `ModalVerb` object carrying its own `modifier` and `negative`.
   */
  modals?: ModalRef[];
}

/**
 * A specifier attached to a complement. Discriminated by `kind`: `path` is the spatial relation
 * of a route or locative complement, `temporal` the temporal complement's relation to the time it
 * names (at / ago / until / after / before / during), `sentiment` is the cause complement's
 * affective stance (blame / credit / neutral). New specifier families can be added as further
 * members.
 */
export type Specifier =
  | { kind: 'path'; value: PathSpecifier }
  | { kind: 'temporal'; value: TemporalRelation }
  | { kind: 'sentiment'; value: CauseSentiment }
  | { kind: 'abstraction'; value: AbstractionLevel }
  | { kind: 'predication'; value: ObjectPredication };

/**
 * A complement: a noun phrase plus zero or more specifiers. Not every complement
 * takes a specifier, and not every specifier is a `PathSpecifier`.
 */
export interface Complement {
  phrase: NounElement;
  specifiers?: Specifier[];
  /**
   * The complement's own negation, not the clause's: "runs **not because of** the dog", which says
   * the cat runs and the dog is not the reason. The clause itself stays positive, so this is not
   * the sentential negation `VerbPhrase.negative` carries and it triggers no negative concord —
   * the two are independent, and both at once is a real sentence ("der Kater ist nicht wegen des
   * Hundes nicht müde", the cat is not tired, and the dog is not why).
   *
   * Read on the `cause` complement, the one adjunct whose whole point is to name a reason that can
   * be denied. The field is on `Complement` rather than on the cause alone so a second adjunct can
   * take it without a model change — and the `instrumental` is that second one (P09-E2): a denied
   * means is the **privative**, "cuts the bread **without** the knife" (*senza / sans / sin / sem /
   * ohne* / 〜なしで). It swaps the adposition rather than adding a negator, and like the denied
   * cause it leaves the clause positive. Every other complement ignores it.
   */
  negative?: boolean;
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

/**
 * An infinitive complement: a subject-less clause the predicate of another clause governs — "to be
 * able **to act**", "to desire **to eat the food**", it "essere capace **di agire**", de "fähig sein,
 * **zu handeln**", ja 「**行動すること**が可能である」. Its subject is the governing clause's own (subject
 * control: "the cat desires to eat" means the cat eats), so it is never spoken, and a predicate
 * adjective inside it agrees with that subject ("la gatta desidera essere attenta").
 *
 * The governor is the clause's predicate adjective when it has one ("able to", "obliged to"), else
 * its verb ("desire to"). Which word links the infinitive is a property of the governing word, not
 * of the construction, so its lexeme names it as `infinitive_link`: it "capace **di**" / "obbligato
 * **a**", fr "capable **de**", es / pt "capaz **de**" / "obligado **a**", and in Japanese the particle
 * after the nominalizing こと (行動すること**が**可能 / 行動すること**を**望む). A governor without one takes
 * the bare infinitive ("desiderare agire", "désirer agir"). English always links with "to" and German
 * with "zu", which need no lexical entry.
 *
 * The clause renders as an infinitive citation (see `PhrasePlan.infinitive`), so it has no tense,
 * aspect or modals of its own. It may be negated ("to be able not to act") and may itself govern one
 * ("to desire to be able to act").
 */
/**
 * A finite clause filling a slot a noun phrase would. It is a whole clause of its own — its subject
 * is spoken, and it carries its own object and complements — unlike an `InfinitiveComplement`, whose
 * subject is the governing clause's and goes unsaid. Its mood is not its own: the language puts it in
 * the indicative or the present subjunctive, as whatever hosts it decides.
 *
 * It has three hosts (P09-E4), and **the host decides the expletive**:
 *  - `PhrasePlan.contentSubject` — the subject of an evaluative predicate ("**it** is right that one
 *    acts"). A fronted clause cannot stay in the subject slot, so en / fr / de write *it* / *il* /
 *    *es* there; the predicate adjective's lexeme names the mood (`content_clause_mood`).
 *  - `PhrasePlan.contentObject` — the object of a verb of saying, thinking or knowing ("says that
 *    the cat runs"). The object slot needs no stand-in, so no language writes an expletive; the verb's
 *    lexeme names the mood, and in Japanese whether it quotes (と) or nominalizes (こと).
 *  - `PhrasePlan.adverbialClause` — the clause a subordinating conjunction introduces ("when the cat
 *    eats"). Nothing governs it, so no lexeme does: the conjunction fixes its mood.
 *
 * It never becomes a question, a command or a citation, never coordinates and never hosts a clause
 * of its own: it has no field for any of them.
 */
export interface ContentClause {
  subject: NounElement;
  verbPhrase: VerbPhrase;
  directObject?: NounElement;
  complements?: Partial<Record<ComplementType, Complement>>;
}

export interface InfinitiveComplement {
  verbPhrase: VerbPhrase;
  directObject?: NounElement;
  complements?: Partial<Record<ComplementType, Complement>>;
  infinitiveComplement?: InfinitiveComplement;
  /** Whose the unspoken subject is — see `InfinitiveControl`. Defaults to `'subject'`. */
  control?: InfinitiveControl;
}

/**
 * Which slot of the governing clause the infinitive complement's unspoken subject is: its
 * **subject** (the default) or its **direct object**.
 *
 *  - `subject` — subject control. "The cat desires to eat" is the cat eating; "to be able to act"
 *    is the able one acting. The governing clause needs no object for it.
 *  - `object` — object control, which is what a **causative** is: "to cause a person to see
 *    objects" is the *person* seeing, not the causer. The direct object names the causee and the
 *    infinitive says what it comes to do, so a predicate adjective inside the clause agrees with
 *    the object ("indurre una casa a essere nascosta"). Object control needs an object to control
 *    it: a clause with none falls back to subject control rather than resolving a subjectless
 *    clause.
 *
 * The distinction is invisible in English word order — both surface as "… to V" after the clause —
 * but it decides agreement in the Romance engines and word order in Japanese, where an
 * object-controlled clause speaks its controller with が inside the clause (人が物体を見るようにする).
 */
export type InfinitiveControl = 'subject' | 'object';

/**
 * A **clause of purpose** (a final clause) — what the act is done *for*: "click **to change**",
 * "select a subject **to see the translations**". It is an adjunct, not a governed complement: no
 * word licenses it, any predicate may carry one, and its unspoken subject is always the clause's
 * own (the one who clicks is the one who changes). So, unlike an `InfinitiveComplement`, it takes
 * no `control` and no link from a lexeme — the connector is the language's own:
 *
 *   en  the bare infinitive, "to change" (the marked "in order to" is not needed for a label)
 *   it  *per* + infinito · fr *pour* · es, pt *para* + infinitivo
 *   de  the *um … zu* clause, extraposed behind the whole clause ("klicken, um zu ändern")
 *   ja  〜ために on the dictionary form, ahead of the predicate (変更するためにクリック)
 *
 * The clause renders as an infinitive citation (see `PhrasePlan.infinitive`), so it has no tense,
 * aspect or modals of its own, and it may be negated ("**in order not to** lose the phrase").
 * It is the *clausal* purpose, an act; a thing one acts for is the `purpose` complement ("works
 * **for the man**", P09-E2), and the two are not to be built twice.
 */
export interface PurposeClause {
  verbPhrase: VerbPhrase;
  directObject?: NounElement;
  complements?: Partial<Record<ComplementType, Complement>>;
}

/**
 * A **subordinating conjunction** — the word that makes a finite clause an adjunct of another
 * (see `PhrasePlan.adverbialClause`, P09-E4):
 *  - `when`    temporal overlap or habit — when / quando / quand / wenn / cuando / quando / 〜時に
 *  - `while`   temporal duration — while / mentre / pendant que / während / mientras / enquanto /
 *              〜ている間に (Japanese says the clause's duration with its progressive)
 *  - `because` cause — because / perché / parce que / weil / porque / porque / 〜ので
 *  - `after`   the clause's event comes first — after / dopo che / après que / nachdem / después de
 *              que / depois que / 〜た後で (on the plain past, whatever the tense)
 *  - `before`  the clause's event comes second — before / prima che / avant que / bevor / antes de
 *              que / antes que / 〜前に (on the plain non-past). The four Romance words govern the
 *              **subjunctive**, a fixed fact about the conjunction and not about any verb.
 *
 * There is no `during`, although P09 §3 lists it among the words: *during* introduces a noun phrase
 * ("during this day", a `TemporalRelation` C29 built), and no language here introduces a clause with
 * it — English says "while the cat eats", not "during the cat eats", and so does each of the others
 * with its own word. `while` is that clause reading.
 */
export type SubordinatingConjunction = 'when' | 'while' | 'because' | 'after' | 'before';

/** What kind of clause a verb takes as its object — see `Concept.clauseObject`. */
export type ClauseObject = 'content' | 'infinitive';

/**
 * A word that introduces a subordinate clause, as the builder's subordinate-clause menu names it:
 * one of the subordinating conjunctions, or `that`, the complementizer of an object content clause
 * (che / que / dass / と). See `UiStringSubordinatorDef`.
 */
export type Subordinator = SubordinatingConjunction | 'that';

export const SUBORDINATING_CONJUNCTIONS: SubordinatingConjunction[] = ['when', 'while', 'because', 'after', 'before'];

/** See `PhrasePlan.adverbialClause`. */
export interface AdverbialClause {
  conjunction: SubordinatingConjunction;
  clause: ContentClause;
}

export interface PhrasePlan {
  subject: NounElement;
  // Optional: a verbless period is a bare noun phrase (a newspaper-title-style fragment
  // like "breaking news"). When absent the engines render just the subject; objects and
  // complements, which hang off the verb, are meaningless without it.
  verbPhrase?: VerbPhrase;
  directObject?: NounElement;
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
   * When true this clause is a **yes/no question** ("is the server active?", "does the cat eat?").
   * A question is a statement's clause with a different force, so its verb keeps the indicative
   * forms, its tense, aspect and modals, and its subject. What changes is the order and the marks
   * around it, which each language sets differently:
   *  - en inverts the subject and the finite auxiliary, with *do*-support when there is none
   *    ("is the server active?", "does the cat eat?", "did the cat have to go?");
   *  - de puts the finite verb first, the V1 order ("ist der Server aktiv?", "isst der Kater?");
   *  - fr keeps the statement behind "est-ce que" ("est-ce que le chat mange ?");
   *  - it / es / pt keep the statement's order, and Spanish opens it with "¿";
   *  - ja closes the polite predicate with か (猫は食べますか？).
   * The question mark replaces the full stop: "?", fr "?" after a no-break space, ja "？".
   *
   * Like a mood it belongs to the top clause, so it is ignored under a `condition`, an `imperative`
   * or an `infinitive`. A coordinated clause shares it (a question does not coordinate with a
   * statement, see `coordination`), and a relative clause never takes it.
   *
   * It is the yes/no case of a wider force: a plan that also names a `questionRole` is a
   * **wh-question** ("what does the cat eat?"), which implies this flag and keeps every rule above.
   */
  interrogative?: boolean;
  /**
   * The slot a **wh-question** asks about — its gap (P09-E6): "**who** eats the food?" is
   * `'subject'`, "**what** does the cat eat?" `'directObject'`, "**where** does the cat eat?"
   * `'locative'`, "**how**?" `'manner'`, "**why**?" `'cause'`. It is `RelativeClause.headRole`
   * reused, minus `'possessor'` ("whose food?" asks inside a noun phrase, a follow-up): the same
   * slots, and the gapped one is left out of the plan exactly as a relative clause leaves it out. A
   * subject gap still carries a `subject`, because the type requires one; it is a throwaway, never
   * rendered, as a `contentSubject` clause's is, and the verb agrees in the third singular ("who
   * eats"). Only those five gaps have a question word yet; any other complement gap (and a
   * locative or cause gap in a marked relation, "under what?", "thanks to whom?") is refused.
   *
   * It implies `interrogative`, so the question mark, the ¿, the か and the suppression under a
   * condition, a command or a citation all hold unchanged. The gap belongs to this clause alone: a
   * coordinated clause is a yes/no question beside it ("who eats, and does the dog run?").
   *
   * Each language fronts the word by its own rule: en fronts and inverts with the yes/no
   * *do*-support, except over a subject gap ("who eats?"); de fronts into V2; it and es put the
   * subject behind the verb ("che cosa mangia il gatto?", "¿qué come el gato?"); pt fronts and
   * keeps the statement's order ("o que o gato come?"); fr fronts before "est-ce que" ("qu'est-ce
   * que le chat mange ?"), a subject gap standing alone ("qui mange ?"). Japanese moves nothing:
   * the word sits in its slot with the slot's own particle (猫は何を食べますか).
   */
  questionRole?: 'subject' | 'directObject' | ComplementType;
  /**
   * The specifiers of the gapped complement when `questionRole` is a complement — the relation the
   * question keeps though its noun is gone, exactly as `RelativeClause.headSpecifiers`. Only the
   * plain relation has a word so far: `in` (or none) for *where*, a neutral cause for *why*.
   */
  questionSpecifiers?: Specifier[];
  /**
   * Whether the answer to a subject or direct-object question is a **person** — *who* rather than
   * *what* (chi / che cosa, qui / que, wer / was, quién / qué, quem / o que, 誰 / 何). A gap has no
   * noun to read animacy off, which is why the plan says it; absent is *what*. Unread on the other
   * gaps.
   */
  questionAnimate?: boolean;
  /**
   * When true this clause is an **existential** — "there is a cat in the house" (P09-E6 D5, "the
   * existential"). It states that `subject` exists, so `subject` is the **pivot**, the thing there
   * is, and its determiner is the plan's own (indefinite is the usual one; a definite pivot renders
   * as given). The verb must be BE — the translator refuses any other — and `verbPhrase` carries the
   * tense, aspect, negation and modals as it does on any clause; the complements (a locative, a
   * temporal …) render as they do on any clause, after the pivot in the six European languages and
   * before it in Japanese. A `directObject` means nothing here and is ignored.
   *
   * Each language says it with its own verb: en *there is / there are* and it *c'è / ci sono*,
   * agreeing with the pivot (a coordinated pivot is plural: *there are*); fr *il y a*, de *es gibt*
   * (the pivot in the **accusative**: *einen Kater*), es *hay* and pt *há*, all four invariable,
   * because the pivot is the object of an impersonal verb there; ja the existential verb by the
   * pivot's animacy, the pivot marked が — 家に猫がいます, 家に本があります. A negation is *there is no
   * cat*, *il n'y a pas de chat*, *es gibt keinen Kater*, 猫がいません; a pivot that is already `no`
   * negates on its own. The yes/no question (`interrogative`) holds ("is there a cat?", "gibt es
   * einen Kater?"); a wh-question (`questionRole`) is refused, and so are a passive, a command, an
   * infinitive and a personal-pronoun pivot ("there is me"), none of which is built. Plan-only: no
   * builder control sets it yet.
   */
  existential?: boolean;
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
  /**
   * When true this clause is rendered as a bare **infinitive / citation phrase** — the
   * dictionary form of the verb group, subject-less and tenseless ("to consume food",
   * "consumare il cibo", "Nahrung konsumieren", ja 「食物を消費する」). It is what a verb's
   * definition is naturally phrased as, and unlike an imperative it is not a speech act: no
   * one is addressed, so there is no register and no addressee person.
   *
   * Structurally it behaves like `imperative`: it occupies the finite/mood slot, so it forces
   * present tense / neutral aspect / no modals and drops the subject from every surface. The
   * `subject` field is still required by the type but is never rendered — a plan supplies a
   * throwaway impersonal subject (GENERIC_PERSON) purely to satisfy resolution. It is a mood,
   * so it is mutually exclusive with `imperative` and a hypothetical `condition` (the UI
   * enforces this; the translator also normalises it defensively).
   *
   * The one language-by-language difference from the imperative `instruction` register (which
   * also surfaces as an infinitive in fr/es/pt/de) is that this is a true citation form: English
   * prefixes "to " ("to consume", not the bare "consume" an instruction shows) and Italian uses
   * the infinitive ("consumare", not the 2sg "consuma" its imperative shows).
   */
  infinitive?: boolean;
  /**
   * A **content clause standing where the subject would** — "**that one acts** is right", which
   * every one of the seven says the other way round: "it is right that one acts", "è giusto che si
   * agisca", "es ist richtig, dass man handelt", 行動することが正しい (localization C30).
   *
   * It is what an evaluative predicate is said *of*. MUST, CAN and WILL are glossed "to be obliged /
   * able / to desire to act", where the adjective is said of the one who acts; *right* and *possible*
   * are said of the **act**, and no phrase can make an act a subject. This can.
   *
   * What each language does with it is its own: English, French and German write an **expletive** in
   * the subject slot ("it", "il", "es") and extrapose the clause behind the predicate; Italian,
   * Spanish and Portuguese write no expletive and put the clause in the present **subjunctive**
   * ("che si agisca", "que se actúe", "que se aja"), which the mood machinery derives; and Japanese
   * nominalizes it with こと and marks it が, where it really is the subject.
   *
   * The plan's own `subject` is not rendered when this is present — it is the throwaway a subjectless
   * clause carries, as an infinitive citation's is.
   */
  contentSubject?: ContentClause;
  /**
   * A **content clause standing where the direct object would** — "the man says **that the cat
   * runs**", "l'uomo dice che il gatto corre", "der Mann sagt, dass der Kater läuft", 男性は猫が走ると
   * 言います (P09-E4). It is what a verb of saying, thinking or knowing reports; a plan with one has no
   * `directObject` (the clause *is* the object — a plan carrying both renders both).
   *
   * Three things set it apart from `contentSubject`, each a fact about the host:
   *  - **No expletive.** English, French and German write *it* / *il* / *es* only because a fronted
   *    subject clause cannot stay in the subject slot; an object clause needs nothing ("says that…",
   *    "dit que…", "sagt, dass…"). German still extraposes it after a comma, verb-final.
   *  - **The verb picks the mood**, from its lexeme's `content_clause_mood`, and the default is the
   *    indicative an assertion takes — *dice che il gatto **corre***. Italian *pensare* and *credere*
   *    declare the subjunctive their standard register asks for (*pensa che il gatto **corra***).
   *  - **Japanese quotes or nominalizes**, as the verb's lexeme says (`content_clause_link`): the verbs
   *    of saying and thinking quote with と on the plain clause (猫が走ると言います), the rest take the
   *    nominalized ことを (猫が走ることを知っています). The clause's subject takes が either way.
   *
   * The clause keeps the order of a statement whatever its host does: under a question it does not
   * invert ("does the man say that the cat runs?", "sagt der Mann, dass der Kater läuft?").
   */
  contentObject?: ContentClause;
  /**
   * An optional **adverbial clause** — a finite clause a subordinating conjunction attaches to this
   * one as an adjunct: "the man runs **when the cat eats**", "… **because** the cat eats" (see
   * `SubordinatingConjunction`, P09-E4). One per plan, and it does not nest, as a `condition` does
   * not; unlike a condition it leaves this clause's mood alone.
   *
   * It follows the clause in the six European languages (German after a comma, verb-final: "der
   * Mann läuft, weil der Kater isst") and precedes the predicate in Japanese, closed by its postposed
   * conjunction on the plain form (男性は猫が食べる時に走ります). Its own mood is the indicative, except
   * where the conjunction governs the subjunctive (Romance *before*). Like a content clause it never
   * inverts, whatever the clause it hangs off is.
   */
  adverbialClause?: AdverbialClause;
  /**
   * An optional clause this clause's predicate governs in the infinitive — "the cat is able **to
   * eat**", "to desire **to act**" (see `InfinitiveComplement`). It follows the clause (German
   * extraposes it after a comma), except in Japanese, where it precedes the predicate as a こと
   * clause. Every verb definition that needs "to V" inside it — the modals' "to be obliged to act"
   * — is built on it.
   */
  infinitiveComplement?: InfinitiveComplement;
  /**
   * An optional **clause of purpose** — what this clause's act is done for ("click **to change**";
   * see `PurposeClause`). An adjunct on the predicate, so it is meaningless on a verbless period,
   * and it is dropped there. It follows the clause in the SVO languages (German extraposing its
   * *um … zu* after a comma) and precedes the predicate in Japanese.
   */
  purpose?: PurposeClause;
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
export const SAVED_PHRASE_VERSION = 8;

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
  // 'content', 'adverbial' and 'infinitive' are the subordinate clauses (P09-E12 D9): the target
  // period is the source clause's object clause ("says that …"), its adverbial clause ("runs when
  // …", joined by `conjunction`) or its infinitive complement ("needs to …").
  kind?: 'relative' | 'conditional' | 'coordinative' | 'content' | 'adverbial' | 'infinitive' | 'instrumental';
  source: { containerId: string; nounKey?: string };
  target: { containerId: string; nounKey?: string };
  // The coordinating conjunction, present only on a 'coordinative' link — or the subordinating one,
  // on an 'adverbial' link.
  conjunction?: CoordConjunction | SubordinatingConjunction;
  // The reification degree, present only on an 'instrumental' link (absent ⇒ 'object').
  level?: AbstractionLevel;
  // The instrument denied — the privative, "without the knife" (P09-E2) — present only on a denied
  // 'instrumental' link.
  negative?: boolean;
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
