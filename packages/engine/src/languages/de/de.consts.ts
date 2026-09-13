import type { CoordConjunction, DimensionRelation } from '@signi/shared';
import type { Case, Slot } from './de.types.js';

// The umlauted counterpart of each comparison-relevant stem vowel (see `deUmlaut`).
export const DE_UMLAUT: Record<string, string> = { a: 'ä', o: 'ö', u: 'ü', au: 'äu' };

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

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "von" (**von** großer Größe, **von** hoher Qualität), measure "bei". Each governs the dative, so
// the noun phrase (dimension noun + degree adjective) renders in the dative, its adjective declined.
export const DE_DIM_PREP: Record<DimensionRelation, string> = { extent: 'von', quality: 'von', measure: 'bei' };

// The fixed idiom a plain locative takes on a hearth noun, keyed by concept id (see `locativeIdiom`).
// German says "zu Hause" (with the old dative -e), not "im Zuhause".
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'zu Hause' };

export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'und',
  or: 'oder',
  but: 'aber',
  that_is: 'das heißt',
  therefore: 'also',
  then: 'und dann',
};

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
