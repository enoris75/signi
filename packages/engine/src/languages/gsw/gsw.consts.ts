import type { CoordConjunction, Degree, DimensionRelation, TemporalRelation } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { Case, Slot } from './gsw.types.js';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

/**
 * The case each marker of an object predicative governs. The factitive link is the verb's own word
 * ("in einen Befehl verwandeln", "zu einem Befehl machen"), and which case it takes is a fact
 * about that preposition; the essive "als" takes the case of the phrase it predicates of, the
 * accusative object. A verb naming no link leaves the predicate a bare accusative.
 */
export const OBJECT_PREDICATIVE_CASE: Record<string, 'nom' | 'acc' | 'dat'> = { i: 'acc', zu: 'dat', als: 'acc' };

/**
 * The case the role's "als" takes (P09-E13): the case of what it is said of, as the essive's does —
 * the subject, so the nominative ("handelt als Student").
 */
export const ESSIVE_ROLE_CASE = 'nom';

/**
 * The word before the standard of comparison, by degree (P09-E5): "größer als der Hund", "so groß
 * wie der Hund". Both are conjunctions, not prepositions — they govern no case, and the standard
 * takes the case of what it is compared with: the nominative, for a subject's predicate adjective.
 */
export const DE_STANDARD: Partial<Record<Degree, string>> = { more: 'als', less: 'als', equally: 'wie' };

/**
 * The set a superlative selects from (P09-E19) is a bare **genitive** after a noun ("das größte der
 * Tiere", "die schönste der Familie") and this preposition + the dative after a pronoun ("der größte
 * von uns"): the genitive pronoun *unser* is archaic.
 */
export const DE_DOMAIN_PRONOUN = 'vo';

// The umlauted counterpart of each comparison-relevant stem vowel (see `deUmlaut`).
export const DE_UMLAUT: Record<string, string> = { a: 'ä', o: 'ö', u: 'ü', au: 'äu' };

// The endings after which a noun takes the linking -s- as the first element of a compound (see
// `compoundStem`): the feminine derivational suffixes ("Übersetzungsserver", "Geschwindigkeitswort",
// "Qualitätskontrolle", "Optionsmenü"), which only ever build feminines, so a masculine that merely
// ends the same way is left alone ("Sprungbrett"); and -ling / -tum, whatever the gender
// ("Frühlingsanfang", "Wachstumsrate").
// Swiss German writes the -ung nouns -ig (*Übersetzig*), and they link with -s- as their German parents do.
export const FUGEN_S_FEMININE: readonly string[] = ['ig', 'ung', 'heit', 'keit', 'schaft', 'ion', 'tät'];
export const FUGEN_S_ANY: readonly string[] = ['ling', 'tum'];

// The attributive adjective's endings (the Dieth style sheet, P10-E5). The shapes are German's, so
// the code that reads them is German's; the values are Zürich's, with the accusative the nominative's
// (P10 D7) and every genitive row the dative's.
// After the definite article (and a demonstrative, *all*): no ending in the singular, *-e* in the
// plural — *de gross Hund, d gross Chatz, s gross Huus, d grosse Hünd*; *-e* in every dative.
export const WEAK_ENDINGS: Record<Case, Record<Slot, string>> = {
  nom: { masc: '',  fem: '',  neut: '',  plural: 'e' },
  acc: { masc: '',  fem: '',  neut: '',  plural: 'e' },
  dat: { masc: 'e', fem: 'e', neut: 'e', plural: 'e' },
  gen: { masc: 'e', fem: 'e', neut: 'e', plural: 'e' },
};

// After the indefinite article (and *kei*): *en grosse Hund, e grossi Chatz, es grosses Huus*.
export const MIXED_ENDINGS: Record<'nom' | 'acc', Record<Slot, string>> = {
  nom: { masc: 'e', fem: 'i', neut: 'es', plural: 'i' },
  acc: { masc: 'e', fem: 'i', neut: 'es', plural: 'i' },
};

// With no article: *grosse Hunger, grossi Freud, grosses Glück, grossi Hünd*.
export const STRONG_ENDINGS: Record<'nom' | 'acc', Record<Slot, string>> = {
  nom: { masc: 'e', fem: 'i', neut: 'es', plural: 'i' },
  acc: { masc: 'e', fem: 'i', neut: 'es', plural: 'i' },
};

// The dative with no article: *-e* throughout, as with one (*mit guete Wii*).
export const STRONG_DAT: Record<Slot, string> = { masc: 'e', fem: 'e', neut: 'e', plural: 'e' };

// No genitive: a genitive slot declines as the dative.
export const STRONG_GEN: Record<Slot, string> = STRONG_DAT;

// The determiners that leave a mass noun without an article: no "ein Wasser", and the invariant
// "etwas / viel / wenig", which carry no case. An adjective on such a noun declines strong.
export const ARTICLELESS_MASS_DETERMINERS: ReadonlySet<string> = new Set(['bare', 'indefinite', 'some', 'many', 'few', 'enough']);

/**
 * The demonstratives (see `demForm`): the proximal is the stressed article, *dä / die / das*, plural
 * *die*, dative *dem / dere / dem / dene*; the distal *sälb-* (*sälbe Maa, sälbi Frau*) *(verify, E14)*.
 * Nominative and accusative are one form, and a genitive slot takes the dative.
 */
export const DEM_FORMS: Record<'proximal' | 'distal', Record<'nom' | 'dat', Record<Slot, string>>> = {
  proximal: {
    nom: { masc: 'dä', fem: 'die', neut: 'das', plural: 'die' },
    dat: { masc: 'dem', fem: 'dere', neut: 'dem', plural: 'dene' },
  },
  distal: {
    nom: { masc: 'sälbe', fem: 'sälbi', neut: 'sälb', plural: 'sälbi' },
    dat: { masc: 'sälbem', fem: 'sälbere', neut: 'sälbem', plural: 'sälbe' },
  },
};

// The der-word endings of *jed-* (each) and *settig-* (such), by merged case: *jede Maa, jedi Frau,
// jedes Huus*, dative *jedem, jedere, jedem*.
export const DEM_ENDINGS: Record<Case, Record<Slot, string>> = {
  nom: { masc: 'e',  fem: 'i',   neut: 'es', plural: 'i' },
  acc: { masc: 'e',  fem: 'i',   neut: 'es', plural: 'i' },
  dat: { masc: 'em', fem: 'ere', neut: 'em', plural: 'e' },
  gen: { masc: 'em', fem: 'ere', neut: 'em', plural: 'e' },
};

// There is no *werde*-future (P10 D8): a future renders as the present (see `verbGroup`). German's
// WERDEN table has no counterpart here.

// The conditional auxiliary *würd* + infinitive (P10-E13 D1): "wenn de Hund würd springe, würd …". It
// holds V2 over a clause-final infinitive, as German's *würde* does, so the verb-group builders treat
// the conditional mood exactly as the German fork did.
export const WUERDE: Record<string, string> = {
  '1sg': 'würd', '2sg': 'würdsch', '3sg': 'würd',
  '1pl': 'würded', '2pl': 'würded', '3pl': 'würded',
};

// The conditional of *haa*, the finite verb of a conditional modal's past: "er hett müese gaa".
export const HAETTE: Record<string, string> = {
  '1sg': 'hett', '2sg': 'hettsch', '3sg': 'hett',
  '1pl': 'hetted', '2pl': 'hetted', '3pl': 'hetted',
};

// *sii* (be), present only: Swiss German has no preterite (P10 D5). The copula of the progressive (*isch
// am Frässe*, P10-E9) and the perfect auxiliary of the verbs that select it (*isch ggange*).
export const SEIN: Record<'present', Record<string, string>> = {
  present: { '1sg': 'bi', '2sg': 'bisch', '3sg': 'isch', '1pl': 'sind', '2pl': 'sind', '3pl': 'sind' },
};

// *haa* (have), present only: the perfect auxiliary of every other verb (*hät gfrässe*), which is also
// the past (P10 D5).
export const HABEN: Record<'present', Record<string, string>> = {
  present: { '1sg': 'ha', '2sg': 'hesch', '3sg': 'hät', '1pl': 'händ', '2pl': 'händ', '3pl': 'händ' },
};

// The participles of the two auxiliaries: the double perfect's *ghaa* (*hät gfrässe ghaa*, P10-E7 D3)
// and the past progressive's *gsii* (*isch am Frässe gsii*, P10-E9).
export const HAA_PARTICIPLE = 'ghaa';
export const SII_PARTICIPLE = 'gsii';

// The nominative personal pronouns a clause refers back to its own subject with (see
// `personalPronoun`); the third singular by the gender of what it stands for.
export const DE_PERSONAL: Record<string, string> = { '1sg': 'ich', '2sg': 'du', '1pl': 'mir', '2pl': 'ir', '3pl': 'si' };
export const DE_THIRD_SINGULAR: Record<string, string> = { masc: 'er', fem: 'si', neut: 'es' };

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "von" (**von** großer Größe, **von** hoher Qualität), measure "bei". Each governs the dative, so
// the noun phrase (dimension noun + degree adjective) renders in the dative, its adjective declined.
export const DE_DIM_PREP: Record<DimensionRelation, string> = { extent: 'vo', quality: 'vo', measure: 'bi' };

// The fixed idiom a plain locative takes on a hearth noun, keyed by concept id (see `locativeIdiom`).
// German says "zu Hause" (with the old dative -e), not "im Zuhause".
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'dihei' };

// The same noun's idiom as a plain goal (see `directionIdiom`, P09-E37): "geht nach Hause", not
// "zum Zuhause" — the goal takes "nach", where the place took "zu".
export const DIRECTION_IDIOMS: Record<string, string> = { HOME: 'hei' };

// The preposition of `between`, said once over a coordinated landmark rather than on each conjunct
// (P09-E1 D2, see `GROUP_SCOPED_SPECIFIERS`): `spatialHead` builds each conjunct with it as it
// builds any relation, and the complement lifts it off every conjunct to say it in front of all.
export const BETWEEN_PREP = 'zwüsche';

export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'und',
  or: 'oder',
  but: 'aber',
  that_is: 'das heisst',
  therefore: 'also',
  then: 'und dänn',
  however: 'hingäge',
};

// The correlative pair of an "and" group (P09-E26): the word before the first conjunct and the one in
// place of the plain conjunction. The sentence and the conjunction chip's label (P09-E46) read this pair.
export const CORRELATIVE_PAIR: readonly [string, string] = ['sowohl', 'als au'];

/**
 * The subordinating conjunctions (see PhrasePlan.adverbialClause, P09-E4). Each introduces a
 * verb-final clause set off by a comma: "der Mann läuft, weil der Kater isst".
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'wenn', while: 'wärend', because: 'will', after: 'nachdem', before: 'bevor',
  // P09-E27: German has no subjunctive to govern, so each is the indicative, verb-final.
  until: 'bis', since: 'sit', though: 'obwohl',
  // Localization C41: the similative, verb-final like the rest ("…, wie der Hund läuft").
  as: 'wie',
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
  // "jedoch" is no front-field adverb here: it stands after the finite verb (P09-E29), see
  // `swissGermanEngine.render`.
  however: false,
};

// A reflexive verb's accusative pronoun, agreeing with the subject (mich/dich/sich/uns/euch/sich).
// Reflexivity is lexical: the citation infinitive leads with "sich" ("sich bewegen"), and the finite
// forms are the plain verb's ("bewegt"), so the clause places the pronoun (see `reflexivePronoun`).
export const DE_REFLEXIVE: Record<string, string> = { '1sg': 'mich', '2sg': 'dich', '3sg': 'sich', '1pl': 'eus', '2pl': 'eu', '3pl': 'sich' };

// Der Negator eines einzelnen Satzglieds, nicht des Satzes: "ist **nicht** wegen des Hundes müde" —
// er ist müde, und der Hund ist nicht der Grund (siehe `Complement.negative`). Er steht direkt vor
// dem Satzglied, wo die Satznegation vor dem Prädikat steht (A186).
export const CONSTITUENT_NEGATOR = 'nöd';

/** The focus particles (see NounPhrase.focus, C39). German writes all three before the phrase. */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'nume' }, even: { word: 'sogar' }, also: { word: 'au' },
};

/** The cardinals Swiss German spells (see `numeralWord`, C31); only "ein" agrees. */
export const CARDINALS: CardinalTable = {
  1: { word: 'ein', fem: 'ei' }, 2: { word: 'zwei' }, 3: { word: 'drei' }, 4: { word: 'vier' },
  5: { word: 'föif' }, 6: { word: 'sächs' }, 7: { word: 'sibe' }, 8: { word: 'acht' },
  9: { word: 'nüün' }, 10: { word: 'zää' }, 11: { word: 'elf' }, 12: { word: 'zwölf' },
  24: { word: 'vierezwänzg' },
};

/**
 * The dative preposition each temporal relation takes in German (C29). `at` is not here — it reads
 * the head noun's own `temporal_prep` and falls back on "zu", the word a temporal noun already takes
 * in a manner adverbial ("zu allen Zeiten", A60) — and neither is `until`, which reaches its time
 * through that same "zu" ("bis zum Tag"), nor `during` and `within`, which govern the genitive
 * (`DE_GENITIVE_TEMPORAL`).
 *
 * **"vor" spells both `ago` and `before`**, and that is the language, not a shortcut: "vor einem
 * Augenblick" is a moment ago and "vor dem Tag" is before the day, one preposition for the two
 * readings English splits into "ago" and "before" and Japanese into 前に and の前に.
 */
export const DE_TEMPORAL: Record<Exclude<TemporalRelation, 'at' | 'until' | 'during' | 'within' | 'for'>, string> = {
  ago: 'vor',
  after: 'nach',
  before: 'vor',
  // The spatial BETWEEN_PREP with the dative, which the group scope lifts off each conjunct
  // (P09-E20): "zwischen diesem Tag und jenem Tag".
  between: 'zwüsche',
  since: 'sit',
};

/**
 * The temporal relations whose German preposition governs the **genitive**: "während des Tages",
 * and P09-E34's deadline "innerhalb einer Stunde". Each falls back on the dative where a bare plural
 * has no genitive to show ("während Tagen", "innerhalb Tagen"), as the cause's "wegen" does.
 */
/**
 * The word the toolbar names the duration `for` by (P09-E35). German says a duration with no
 * preposition at all, the measure in the bare accusative ("der Kater läuft eine Stunde"), so there is
 * nothing to cite; "lang" is the word it may follow the measure with ("eine Stunde lang") and the one
 * a speaker reads as *how long*.
 */
export const DE_DURATION_CITATION = 'lang';

export const DE_GENITIVE_TEMPORAL: Record<'during' | 'within', string> = {
  during: 'wärend',
  within: 'innerhalb',
};

/**
 * The words a noun's examples relation spells (P09-E33, E48): *such as* and *including*, as the
 * examples function writes them and the chip on the examples ring cites them.
 */
export const DE_EXAMPLES: Record<'example' | 'inclusion', string> = { example: 'wie', inclusion: 'iischliesslich' };
