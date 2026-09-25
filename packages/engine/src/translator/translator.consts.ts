import { germanEngine } from '../languages/de/index.js';
import { englishEngine } from '../languages/en/index.js';
import { spanishEngine } from '../languages/es/index.js';
import { frenchEngine } from '../languages/fr/index.js';
import { italianEngine } from '../languages/it/index.js';
import { japaneseEngine } from '../languages/ja/index.js';
import { portugueseEngine } from '../languages/pt/index.js';
import type { LanguageEngine } from '../types.js';
import type { SubordinatingConjunction } from '@signi/shared';

export const engines: LanguageEngine[] = [
  englishEngine,
  italianEngine,
  frenchEngine,
  germanEngine,
  spanishEngine,
  japaneseEngine,
  portugueseEngine,
];

/** Determiners that are inherently plural, so they render the plural noun surface. */
export const PLURAL_DETERMINERS = new Set(['some', 'many', 'few', 'all', 'both', 'most', 'several', 'enough']);

/**
 * The approximators' words (P09-E38), each with the separator that joins it to what follows it —
 * Japanese writes none. `about` stands before a numeral and agrees in Spanish (*unos / unas cinco*,
 * the article, D2); `almost` stands before a quantity determiner.
 */
export const APPROXIMATOR_WORDS: Readonly<Record<string, { about: (fem: boolean) => string; almost: string }>> = {
  en: { about: () => 'about ', almost: 'almost ' },
  it: { about: () => 'circa ', almost: 'quasi ' },
  fr: { about: () => 'environ ', almost: 'presque ' },
  de: { about: () => 'etwa ', almost: 'fast ' },
  es: { about: (fem) => (fem ? 'unas ' : 'unos '), almost: 'casi ' },
  pt: { about: () => 'cerca de ', almost: 'quase ' },
  ja: { about: () => '約', almost: 'ほとんど' },
};

/** The determiners `almost` modifies (P09-E38 D1): "almost all", "almost no", "almost many". */
export const ALMOST_DETERMINERS: ReadonlySet<string> = new Set(['all', 'no', 'many']);

/** The distributive determiners, which take a singular noun in every language: "each cat", "ogni gatto" (P09-E25). */
export const SINGULAR_DETERMINERS: ReadonlySet<string> = new Set(['each', 'every']);

/**
 * What a determiner that only counts becomes on a mass noun, which cannot be counted (P09-E25):
 * *several* is `some` ("some water", never "*several water"), and *both* the definite, which picks
 * out the known stuff as *both* picks out the known two ("the water").
 */
export const MASS_DETERMINER: Readonly<Record<string, string>> = { several: 'some', both: 'definite' };

/**
 * Languages whose verb agrees with the singular head of the partitive *most* rather than with the
 * plural noun it takes: it "la maggior parte dei gatti corre", es "la mayoría de los gatos corre", pt
 * "a maioria dos gatos corre". French agrees with the noun ("la plupart des chats courent"), as do
 * English and German, whose *most* is a plain determiner (P09-E25 D4).
 */
export const MOST_AGREES_SINGULAR: ReadonlySet<string> = new Set(['it', 'es', 'pt']);

/**
 * The determiners a relative superlative cannot stand under, which it makes definite: "the biggest
 * dog", never "*a biggest dog" or "*biggest dog" (A175). The others are already definite
 * (demonstratives) or left as they are (the quantifiers: "some biggest dogs").
 */
export const SUPERLATIVE_MAKES_DEFINITE: ReadonlySet<string> = new Set(['indefinite', 'bare']);

// The degrees that take a standard of comparison, and the superlatives' that take a set, live in
// shared (the builder gates its control on them too); re-exported so the translator keeps one import
// site.
export { STANDARD_DEGREES, SUPERLATIVE_DEGREES } from '@signi/shared';

/**
 * Languages whose negative quantifier takes a singular noun whatever number was picked: it "nessuna
 * frase", fr "aucune phrase", es "ninguna frase", pt "nenhuma frase" — never "*aucune phrases". English
 * and German keep the number ("no phrases", "keine Phrasen"); Japanese marks none.
 */
export const NO_TAKES_SINGULAR: ReadonlySet<string> = new Set(['it', 'fr', 'es', 'pt']);

/** The agreement keys a group carries — see ResolvedNounElement.agreement. Nothing renderable. */
export const AGREEMENT_KEYS = ['person', 'number', 'gender'] as const;

/**
 * Languages whose "or" group of mixed persons agrees as the plural of the prevailing person, like
 * "and" — French "toi ou moi, nous mangeons" (Grevisse, *Le Bon Usage*). A group of one person keeps
 * the nearest-conjunct rule ("le chat ou le chien court").
 */
export const OR_RESOLVES_MIXED_PERSONS: ReadonlySet<string> = new Set(['fr']);

/**
 * Languages where OTHER takes the place of the indefinite article rather than following it: Spanish
 * "otro gato" and Portuguese "outro gato", never "*un otro gato". Their indefinite phrase with OTHER
 * resolves bare. (English fuses the two into "another" instead, see en/nounPhrase.)
 */
export const OTHER_REPLACES_INDEFINITE: ReadonlySet<string> = new Set(['es', 'pt']);

/**
 * The mood a **content clause** stands in when its governor asks for the subjunctive — the four
 * Romance languages' present subjunctive, "che si agisca", "qu'on agisse", "que se actúe", "que se
 * aja". English, German and Japanese have no such mood and keep the indicative.
 *
 * It was the rule for C30's clausal subject, which only evaluative predicates host; since P09-E4 the
 * governor's lexeme names its own mood (`content_clause_mood`, see `contentClauseMood`), and this is
 * what "subjunctive" means per language — and the **fallback** for a subject clause whose predicate
 * declares nothing, because what a subject clause names is judged rather than asserted.
 */
export const CONTENT_CLAUSE_MOOD: Record<string, 'presentSubjunctive'> = {
  it: 'presentSubjunctive', fr: 'presentSubjunctive', es: 'presentSubjunctive', pt: 'presentSubjunctive',
};

/**
 * The languages whose content clause shifts back under a **past** governor — the sequence of tenses
 * (A254, see `contentClauseTense`): "the man said that the cat **ran**", "l'uomo disse che il gatto
 * **correva**", "no creía que el gato **corriera**". German's *dass* clause keeps its own tense ("der
 * Mann glaubte nicht, dass der Kater läuft"), which is standard, and Japanese's clause tense is
 * relative to its governor already (猫が走ると信じていませんでした).
 */
export const SEQUENCE_OF_TENSES_LANGUAGES: ReadonlySet<string> = new Set(['en', 'it', 'fr', 'es', 'pt']);

/**
 * The languages that say a future **in the past** in the perfect conditional, not the simple one
 * (A254): Italian's *condizionale composto*, "disse che il gatto **avrebbe corso**", its auxiliary the
 * verb's own. The others take the simple conditional ("would run", "courrait", "correría").
 */
export const FUTURE_IN_PAST_PERFECT_LANGUAGES: ReadonlySet<string> = new Set(['it']);

/**
 * The adjective a `possessorOwn` phrase writes beside its possessor — "my **own** cat" (see
 * NounPhrase.possessorOwn, C37). It is a seeded concept like any other, so each language reads its
 * own word out of the lexicon (proprio / propre / eigen / propio / 自分の / próprio); the id is fixed
 * here because the plan names a flag, not a word.
 */
export const POSSESSOR_OWN_ADJECTIVE = 'OWN_ADJECTIVE';

/**
 * The verb each language conjugates in place of the lexical one to build a **passive** — the
 * auxiliary the past participle hangs off of. Six of the seven take their copula, *be* / *essere* /
 * *être* / *ser* / *ser*; German takes *werden*, which is the BECOME concept, because *sein* +
 * participle is the stative reading ("die Tür ist geschlossen" — it is shut) and not the event
 * ("die Tür wird geschlossen" — someone is closing it).
 *
 * Japanese is absent on purpose: its passive is morphology on the verb itself (〜れる/られる), so
 * there is no auxiliary to name, and its engine reads the lexeme's own `passive` form instead.
 */
export const PASSIVE_AUXILIARY: Record<string, string> = {
  en: 'BE', it: 'BE', fr: 'BE', es: 'BE', pt: 'BE', de: 'BECOME',
};

/**
 * Languages that can relativise the **agent** of a passive — the gap a relative clause gapped on its
 * subject moves to when it turns passive: "the child by whom the book is written", "il bambino dal
 * quale il libro è scritto", "das Kind, von dem das Buch geschrieben wird".
 *
 * Japanese is absent: its prenominal relative has no relativizer to carry the に, and a passive clause
 * with its に-agent simply missing (本が書かれる子供) no longer says that the head is the one who acts —
 * it reads as a child a book is written *about* or *for*. There the relative stays active.
 */
export const RELATIVIZES_AGENT: ReadonlySet<string> = new Set(['en', 'it', 'fr', 'de', 'es', 'pt']);

/** Verb transitivities that have a patient to promote, and can therefore be passivized. */
export const PASSIVIZABLE: ReadonlySet<string> = new Set(['transitive', 'ditransitive']);

/**
 * The subordinating conjunctions that govern the **subjunctive**, and the languages whose word for
 * each does (see PhrasePlan.adverbialClause, P09-E4): *prima che*, *avant que*, *antes de que*,
 * *antes que* all do, where *when*, *after* and *because* take the indicative. A fact about the
 * conjunction, so it lives here and not on any lexeme — nothing governs an adverbial clause but the
 * word that introduces it.
 *
 * P09-E27 made it per language, since the words for one conjunction disagree: *until* is
 * subjunctive in French, Spanish and Portuguese (*jusqu'à ce que … mange*, *hasta que … coma*, *até
 * que … coma*), while Italian *finché* keeps the indicative under its expletive *non* (D1); *though*
 * is subjunctive in Italian, French and Portuguese (*sebbene*, *bien que*, *embora*), while Spanish
 * *aunque* asserts a fact and keeps the indicative (D4).
 */
export const SUBJUNCTIVE_CONJUNCTIONS: Readonly<Partial<Record<SubordinatingConjunction, ReadonlySet<string>>>> = {
  before: new Set(['it', 'fr', 'es', 'pt']),
  until: new Set(['fr', 'es', 'pt']),
  though: new Set(['it', 'fr', 'pt']),
};

/**
 * The subordinating conjunctions whose clause, in the **past**, is an event in progress and takes
 * the imperfect indicative in the four Romance languages (A250): *while* frames the main event inside
 * one that is going on, "l'uomo corse mentre il gatto **mangiava**", "pendant que le chat
 * **mangeait**", "mientras el gato **comía**", "enquanto o gato **comia**". A past *when* can name a
 * completed event and keeps the perfective every Romance past takes (C06).
 */
export const IMPERFECTIVE_CONJUNCTIONS: ReadonlySet<SubordinatingConjunction> = new Set(['while']);

/**
 * The languages whose past splits perfective from imperfect on the verb, where a clause under an
 * `IMPERFECTIVE_CONJUNCTIONS` word takes the imperfect: the four Romance ones. English and German have
 * one simple past, and Japanese already says the duration with its progressive (〜ている間に).
 */
export const IMPERFECT_PAST_LANGUAGES: ReadonlySet<string> = new Set(['it', 'fr', 'es', 'pt']);

/**
 * The **temporal** subordinating conjunctions — *when, while, before, after* — which place the main
 * event against the clause's in time and do not assert the clause (A251, A252). A future event under
 * one is not said in the future everywhere: English and German say it in the present
 * (`FUTURE_AS_PRESENT_LANGUAGES`), Spanish and Portuguese in the subjunctive
 * (`FUTURE_TEMPORAL_MOOD`). *Because* asserts its clause and keeps the future ("because the cat
 * will eat", "porque el gato comerá"). *Until* is one too (P09-E27: "the man will run until the cat
 * eats"); *since* looks back and *though* concedes a fact, so both keep a future as they find it.
 */
export const TEMPORAL_CONJUNCTIONS: ReadonlySet<SubordinatingConjunction> = new Set(['when', 'while', 'before', 'after', 'until']);

/**
 * The languages that say a future event under a `TEMPORAL_CONJUNCTIONS` word in the **present**, and
 * keep the future for the main clause (A251): "the man will run when the cat **eats**", "der Mann wird
 * laufen, wenn der Kater **frisst**". Italian and French keep the future ("quando il gatto mangerà",
 * "quand le chat mangera"), and Japanese has none to drop.
 */
export const FUTURE_AS_PRESENT_LANGUAGES: ReadonlySet<string> = new Set(['en', 'de']);

/**
 * The temporal conjunctions under which a `FUTURE_AS_PRESENT_LANGUAGES` language says the future
 * event in the **perfect** rather than the present, the same rule one tense back: German *nachdem*
 * ("der Mann wird laufen, nachdem der Kater **gefressen hat**"). English *after* keeps the present
 * ("after the cat eats").
 */
export const FUTURE_AS_PERFECT: Readonly<Record<string, ReadonlySet<SubordinatingConjunction>>> = {
  de: new Set(['after']),
};

/**
 * The mood Spanish and Portuguese put a future event in under a `TEMPORAL_CONJUNCTIONS` word, which
 * does not assert it (A252): Spanish its present subjunctive ("cuando el gato **coma**"), Portuguese
 * its future subjunctive ("quando o gato **comer**"). *Before* governs the present subjunctive in any
 * tense and is decided first (`SUBJUNCTIVE_CONJUNCTIONS`); Italian and French keep the future.
 */
export const FUTURE_TEMPORAL_MOOD: Readonly<Record<string, 'presentSubjunctive' | 'futureSubjunctive'>> = {
  es: 'presentSubjunctive', pt: 'futureSubjunctive',
};

/**
 * The languages whose subjunctive clause says a **past** event in the imperfect subjunctive rather
 * than the present one: "prima che il gatto mangiasse", "antes de que el gato comiera", "antes que o
 * gato comesse". French is not among them — its imperfect subjunctive is literary, and the spoken
 * language keeps the present ("avant que le chat mange") — and the engines' `'subjunctive'` in
 * French is the imparfait a condition takes, which would be wrong here.
 */
export const PAST_SUBJUNCTIVE_LANGUAGES: ReadonlySet<string> = new Set(['it', 'es', 'pt']);

/**
 * The verb each language says the **existential** with (P09-E6 D5, see PhrasePlan.existential): the
 * concept whose lexeme the translator resolves in BE's place. English and Italian keep BE (*there
 * is*, *c'è*); French is *avoir* under *il y*, German *geben* under *es*. Spanish and Portuguese
 * resolve HAVE for the shape of a transitive verb with an object, and their engines conjugate *haber*
 * / *haver* in its place (`HABER_EXISTENTIAL`, `HAVER_EXISTENTIAL`), a verb neither corpus seeds.
 * Japanese keeps BE, which its engine already says as いる / ある by animacy.
 */
export const EXISTENTIAL_VERBS: Readonly<Record<string, string>> = {
  en: 'BE', it: 'BE', fr: 'HAVE', de: 'GIVE', es: 'HAVE', pt: 'HAVE', ja: 'BE',
};

/**
 * The languages whose existential verb **agrees with the pivot** — "there are cats", "ci sono dei
 * gatti" — where the other five are impersonal and stay in the third singular whatever the pivot is
 * (*il y a des chats*, *es gibt Kater*, *hay gatos*, *há gatos*; Japanese does not agree at all).
 */
export const EXISTENTIAL_AGREEING_LANGUAGES: ReadonlySet<string> = new Set(['en', 'it']);

/**
 * The pivot determiners English turns into *no* when an existential is negated: "there is no cat",
 * "there are no cats", not "there is not a cat" (P09-E6 D5). A definite or quantified pivot keeps
 * "not" ("there is not the cat"), and so does a modal clause ("there cannot be a cat"), where *no*
 * would move the negation off the modal.
 */
export const EXISTENTIAL_NO_DETERMINERS: ReadonlySet<string> = new Set(['indefinite', 'bare']);
