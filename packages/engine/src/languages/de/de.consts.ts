import type { CoordConjunction, Degree, DimensionRelation, TemporalRelation } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { Case, Slot } from './de.types.js';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

/**
 * The case each marker of an object predicative governs. The factitive link is the verb's own word
 * ("in einen Befehl verwandeln", "zu einem Befehl machen"), and which case it takes is a fact
 * about that preposition; the essive "als" takes the case of the phrase it predicates of, the
 * accusative object. A verb naming no link leaves the predicate a bare accusative.
 */
export const OBJECT_PREDICATIVE_CASE: Record<string, 'nom' | 'acc' | 'dat'> = { in: 'acc', zu: 'dat', als: 'acc' };

/**
 * The word before the standard of comparison, by degree (P09-E5): "größer als der Hund", "so groß
 * wie der Hund". Both are conjunctions, not prepositions — they govern no case, and the standard
 * takes the case of what it is compared with: the nominative, for a subject's predicate adjective.
 */
export const DE_STANDARD: Partial<Record<Degree, string>> = { more: 'als', less: 'als', equally: 'wie' };

// The umlauted counterpart of each comparison-relevant stem vowel (see `deUmlaut`).
export const DE_UMLAUT: Record<string, string> = { a: 'ä', o: 'ö', u: 'ü', au: 'äu' };

// The endings after which a noun takes the linking -s- as the first element of a compound (see
// `compoundStem`): the feminine derivational suffixes ("Übersetzungsserver", "Geschwindigkeitswort",
// "Qualitätskontrolle", "Optionsmenü"), which only ever build feminines, so a masculine that merely
// ends the same way is left alone ("Sprungbrett"); and -ling / -tum, whatever the gender
// ("Frühlingsanfang", "Wachstumsrate").
export const FUGEN_S_FEMININE: readonly string[] = ['ung', 'heit', 'keit', 'schaft', 'ion', 'tät'];
export const FUGEN_S_ANY: readonly string[] = ['ling', 'tum'];

// Weak adjective declension (after a definite article: der/die/das). The genitive row is also
// the *mixed* genitive: after any determiner at all, a genitive adjective is invariably -en
// ("des großen Wortes", "eines großen Wortes").
export const WEAK_ENDINGS: Record<Case, Record<Slot, string>> = {
  nom: { masc: 'e',  fem: 'e',  neut: 'e',  plural: 'en' },
  acc: { masc: 'en', fem: 'e',  neut: 'e',  plural: 'en' },
  dat: { masc: 'en', fem: 'en', neut: 'en', plural: 'en' },
  gen: { masc: 'en', fem: 'en', neut: 'en', plural: 'en' },
};

// Mixed declension (after an indefinite article: ein/eine) — nom/acc only, since a
// subject/direct object is the only place non-definite determiners appear.
export const MIXED_ENDINGS: Record<'nom' | 'acc', Record<Slot, string>> = {
  nom: { masc: 'er', fem: 'e', neut: 'es', plural: 'en' },
  acc: { masc: 'en', fem: 'e', neut: 'es', plural: 'en' },
};

// Strong declension (no article: bare noun phrase, and article-less indefinite plurals),
// where the adjective itself carries the case/gender the article would otherwise show.
export const STRONG_ENDINGS: Record<'nom' | 'acc', Record<Slot, string>> = {
  nom: { masc: 'er', fem: 'e', neut: 'es', plural: 'e' },
  acc: { masc: 'en', fem: 'e', neut: 'es', plural: 'e' },
};

// Strong dative (article-less dative complement — "mit gutem Wein", "guter Milch",
// "guten Häusern"): the adjective carries the dative gender/number ending.
export const STRONG_DAT: Record<Slot, string> = { masc: 'em', fem: 'er', neut: 'em', plural: 'en' };

// Strong genitive (article-less genitive — "guten Weines", "guter Milch", "guter Wörter"): the
// masculine/neuter -en leans on the noun's own -(e)s, which already marks the case there.
export const STRONG_GEN: Record<Slot, string> = { masc: 'en', fem: 'er', neut: 'en', plural: 'er' };

// The determiners that leave a mass noun without an article: no "ein Wasser", and the invariant
// "etwas / viel / wenig", which carry no case. An adjective on such a noun declines strong.
export const ARTICLELESS_MASS_DETERMINERS: ReadonlySet<string> = new Set(['bare', 'indefinite', 'some', 'many', 'few']);

// The demonstratives dies- (this) and jen- (that), der-words that take the same case/gender
// endings as the definite article: dieser/diesen/diesem, diese/dieser, dieses, diese/diesen.
export const DEM_ENDINGS: Record<Case, Record<Slot, string>> = {
  nom: { masc: 'er', fem: 'e',  neut: 'es', plural: 'e'  },
  acc: { masc: 'en', fem: 'e',  neut: 'es', plural: 'e'  },
  dat: { masc: 'em', fem: 'er', neut: 'em', plural: 'en' },
  gen: { masc: 'es', fem: 'er', neut: 'es', plural: 'er' },
};

// Present-tense forms of the auxiliary "werden", used to build the periphrastic
// future ("ich werde essen"). The infinitive is placed at the clause end.
export const WERDEN: Record<string, string> = {
  '1sg': 'werde', '2sg': 'wirst', '3sg': 'wird',
  '1pl': 'werden', '2pl': 'werdet', '3pl': 'werden',
};

// Konjunktiv II of "werden" — the würde-periphrasis that realises the hypothetical
// conditional in both clauses ("wenn … essen würde, würde … laufen"). Structurally it
// behaves exactly like the future WERDEN (finite in V2, main verb infinitive at the clause
// end), so the verb-group builders treat the conditional mood like the future, only swapping
// the auxiliary. The "wenn" clause is rendered verb-final and the following main clause inverts
// (see `renderClause`'s `verbFinal` flag and the conditional assembly in `render`).
export const WUERDE: Record<string, string> = {
  '1sg': 'würde', '2sg': 'würdest', '3sg': 'würde',
  '1pl': 'würden', '2pl': 'würdet', '3pl': 'würden',
};

// Konjunktiv II of "haben", the finite verb of a conditional modal's past: the pluperfect subjunctive
// with the modal's infinitive standing in for its participle ("er hätte laufen sollen", "er hätte
// laufen können"). It holds V2 as werden and würde do, over the whole infinitive stack.
export const HAETTE: Record<string, string> = {
  '1sg': 'hätte', '2sg': 'hättest', '3sg': 'hätte',
  '1pl': 'hätten', '2pl': 'hättet', '3pl': 'hätten',
};

// "sein", the copula of the prospective ("ist im Begriff zu gehen") and the resultative
// auxiliary of the verbs that select it ("ist gegangen"). Only present and past are synthetic;
// the future is periphrastic on "werden" (see `verbGroup`), so no future column is needed.
export const SEIN: Record<'present' | 'past', Record<string, string>> = {
  present: { '1sg': 'bin', '2sg': 'bist', '3sg': 'ist', '1pl': 'sind', '2pl': 'seid', '3pl': 'sind' },
  past:    { '1sg': 'war', '2sg': 'warst', '3sg': 'war', '1pl': 'waren', '2pl': 'wart', '3pl': 'waren' },
};

// "haben", the resultative auxiliary everywhere else ("hat gesehen"), the majority case.
export const HABEN: Record<'present' | 'past', Record<string, string>> = {
  present: { '1sg': 'habe', '2sg': 'hast', '3sg': 'hat', '1pl': 'haben', '2pl': 'habt', '3pl': 'haben' },
  past:    { '1sg': 'hatte', '2sg': 'hattest', '3sg': 'hatte', '1pl': 'hatten', '2pl': 'hattet', '3pl': 'hatten' },
};

// The nominative personal pronouns a clause refers back to its own subject with (see
// `personalPronoun`). The third singular goes by the grammatical gender of what it stands for —
// "der Kater" → "er", "die Katze" → "sie", "das Kind" → "es" — so it is keyed by gender instead.
export const DE_PERSONAL: Record<string, string> = { '1sg': 'ich', '2sg': 'du', '1pl': 'wir', '2pl': 'ihr', '3pl': 'sie' };
export const DE_THIRD_SINGULAR: Record<string, string> = { masc: 'er', fem: 'sie', neut: 'es' };

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "von" (**von** großer Größe, **von** hoher Qualität), measure "bei". Each governs the dative, so
// the noun phrase (dimension noun + degree adjective) renders in the dative, its adjective declined.
export const DE_DIM_PREP: Record<DimensionRelation, string> = { extent: 'von', quality: 'von', measure: 'bei' };

// The fixed idiom a plain locative takes on a hearth noun, keyed by concept id (see `locativeIdiom`).
// German says "zu Hause" (with the old dative -e), not "im Zuhause".
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'zu Hause' };

// The preposition of `between`, said once over a coordinated landmark rather than on each conjunct
// (P09-E1 D2, see `GROUP_SCOPED_SPECIFIERS`): `spatialHead` builds each conjunct with it as it
// builds any relation, and the complement lifts it off every conjunct to say it in front of all.
export const BETWEEN_PREP = 'zwischen';

export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'und',
  or: 'oder',
  but: 'aber',
  that_is: 'das heißt',
  therefore: 'also',
  then: 'und dann',
};

/**
 * The subordinating conjunctions (see PhrasePlan.adverbialClause, P09-E4). Each introduces a
 * verb-final clause set off by a comma: "der Mann läuft, weil der Kater isst".
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'wenn', while: 'während', because: 'weil', after: 'nachdem', before: 'bevor',
};

/**
 * The clause connectors that are parenthetical rather than conjunctions, set off by a comma after
 * them as well as before: "der Kater läuft, das heißt, der Hund springt". German style has the comma
 * when a clause follows "das heißt" and none when only a phrase does ("am Montag, d. h. am
 * Feiertag") — the engine's `that_is` always joins two clauses, so it always takes it (A192). Clause
 * joins only; a noun group never takes one.
 */
export const PARENTHETICAL_CONNECTORS: ReadonlySet<CoordConjunction> = new Set(['that_is']);

// "also" and "dann" are conjunctional *adverbs*, not coordinators: they occupy the clause's
// front field, which pushes the finite verb into second position ahead of the subject —
// "…, also läuft der Hund", "…, und dann läuft der Hund". The true coordinators (und, oder,
// aber) and the parenthetical "das heißt" sit outside the clause and leave its order alone.
export const COORD_INVERTS: Record<CoordConjunction, boolean> = {
  and: false,
  or: false,
  but: false,
  that_is: false,
  therefore: true,
  then: true,
};

// A reflexive verb's accusative pronoun, agreeing with the subject (mich/dich/sich/uns/euch/sich).
// Reflexivity is lexical: the citation infinitive leads with "sich" ("sich bewegen"), and the finite
// forms are the plain verb's ("bewegt"), so the clause places the pronoun (see `reflexivePronoun`).
export const DE_REFLEXIVE: Record<string, string> = { '1sg': 'mich', '2sg': 'dich', '3sg': 'sich', '1pl': 'uns', '2pl': 'euch', '3pl': 'sich' };

// Der Negator eines einzelnen Satzglieds, nicht des Satzes: "ist **nicht** wegen des Hundes müde" —
// er ist müde, und der Hund ist nicht der Grund (siehe `Complement.negative`). Er steht direkt vor
// dem Satzglied, wo die Satznegation vor dem Prädikat steht (A186).
export const CONSTITUENT_NEGATOR = 'nicht';

/** The focus particles (see NounPhrase.focus, C39). German writes all three before the phrase. */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'nur' }, even: { word: 'sogar' }, also: { word: 'auch' },
};

/** The cardinals German spells (see `numeralWord`, C31); only "ein" agrees. */
export const CARDINALS: CardinalTable = {
  1: { word: 'ein', fem: 'eine' }, 2: { word: 'zwei' }, 3: { word: 'drei' }, 4: { word: 'vier' },
  5: { word: 'fünf' }, 6: { word: 'sechs' }, 7: { word: 'sieben' }, 8: { word: 'acht' },
  9: { word: 'neun' }, 10: { word: 'zehn' }, 11: { word: 'elf' }, 12: { word: 'zwölf' },
  24: { word: 'vierundzwanzig' },
};

/**
 * The dative preposition each temporal relation takes in German (C29). `at` is not here — it reads
 * the head noun's own `temporal_prep` and falls back on "zu", the word a temporal noun already takes
 * in a manner adverbial ("zu allen Zeiten", A60) — and neither is `until`, which reaches its time
 * through that same "zu" ("bis zum Tag"), nor `during`, which governs the genitive.
 *
 * **"vor" spells both `ago` and `before`**, and that is the language, not a shortcut: "vor einem
 * Augenblick" is a moment ago and "vor dem Tag" is before the day, one preposition for the two
 * readings English splits into "ago" and "before" and Japanese into 前に and の前に.
 */
export const DE_TEMPORAL: Record<Exclude<TemporalRelation, 'at' | 'until' | 'during'>, string> = {
  ago: 'vor',
  after: 'nach',
  before: 'vor',
};
