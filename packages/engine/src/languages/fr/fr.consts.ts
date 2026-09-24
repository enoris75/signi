import type { CoordConjunction, Degree, DimensionRelation, ModifierRelation, TemporalRelation, Tense } from '@signi/shared';
import type { SubordinatingConjunction } from '@signi/shared';
import type { ConceptForms } from '../../types.js';
import type { FocusWords } from '../../functions/withFocus.js';
import type { CardinalTable } from '../../functions/numeralWord.js';

// Degree adverb placed before the adjective. Comparative and relative superlative share
// "plus"/"moins"; the superlative repeats the definite article to distinguish them ("un chat
// plus grand" vs "le chat le plus grand" — the doubled article is added in `splitAdjectives`).
// Equality uses "aussi" ("aussi grand").
export const FR_DEGREE: Record<Degree, string> = {
  positive: '', more: 'plus', most: 'plus', less: 'moins', least: 'moins', equally: 'aussi',
};

/**
 * The word before the standard of comparison, by degree (P09-E5): "que" for all three, "plus grand
 * que le chien", "aussi grand que le chien" — French's equative already has its circumfix's first
 * half in "aussi", so there is no `FR_STANDARD_DEGREE`. It elides like every "que" ("qu'un chien").
 */
export const FR_STANDARD: Partial<Record<Degree, string>> = { more: 'que', less: 'que', equally: 'que' };

/**
 * The words before the set a superlative selects from (P09-E19): "de", fused with each conjunct's
 * article — "le plus grand des animaux", "de la famille" — and "d'entre" before a personal pronoun,
 * which never takes the bare "de": "le plus grand d'entre nous", not "*de nous".
 */
export const FR_DOMAIN = 'de';
export const FR_DOMAIN_PRONOUN = "d'entre";

/**
 * The raised degrees (more/most) of these adjectives are suppletive in French — a single
 * word, never "plus" + base: bon → meilleur, mauvais → pire. "plus bon" is ungrammatical;
 * "plus mauvais" is merely dispreferred. Only "more"/"most" suppletise — the lowered and
 * equal degrees stay periphrastic ("moins bon", "aussi bon"). petit → moindre is deliberately
 * omitted: moindre is figurative-only, and the literal size comparative "plus petit" is
 * correct and by far the common case.
 */
export const FR_SUPPLETIVE: Record<string, string> = { GOOD: 'meilleur', BAD: 'pire' };

// Adjectives whose feminine and plural no rule in `agreeAdjFr` derives, seeded whole.
export const FR_ADJ_IRREGULAR: Record<string, [string, string, string, string, string]> = {
  // [masc.sg, fem.sg, masc.pl, fem.pl, masc.sg before a vowel sound ("un bel ange", "le vieil homme")]
  beau: ['beau', 'belle', 'beaux', 'belles', 'bel'],
  nouveau: ['nouveau', 'nouvelle', 'nouveaux', 'nouvelles', 'nouvel'],
  vieux: ['vieux', 'vieille', 'vieux', 'vieilles', 'vieil'],
  // -s adjectives double the s in the feminine ("bas → basse"); the rule in `agreeAdjFr` has no -s branch and
  // would give the wrong "base". Only "bas" (LOW) is seeded; masc plural stays "bas" (invariable).
  bas: ['bas', 'basse', 'bas', 'basses', 'bas'],
  // -et doubles its t in the feminine ("cadet → cadette"); the rule would give "cadete" (P11 §3).
  // YOUNGER is the one seeded -et adjective; its elder counterpart "aîné" needs no entry.
  cadet: ['cadet', 'cadette', 'cadets', 'cadettes', 'cadet'],
};

// œ and æ are vowel letters too, and one seeded noun opens on one: œil, l'œil (localization B52).
export const VOWEL_START = /^[aeiouéèêëàâîïôùûüœæ]/i;

/**
 * Concept IDs of the "BAGS" adjectives (beauty, age, goodness, size) that precede the
 * noun in French — beau, bon, grand, petit, vieux, jeune, nouveau, mauvais. Every other
 * adjective (heureux, triste, fort, …) follows the noun.
 */
// GREAT, the gloss degree word, is the same "grand" as BIG and precedes like it ("de grande
// taille"). HIGH ("haut") stays after the noun: it is not a BAGS adjective ("une tour haute").
// The ordinals join them: an ordinal precedes its noun in French ("le premier père", "la
// deuxième fois"), whatever its "BAGS" membership. So does OTHER ("un autre chat").
// SAME and the final LAST precede for their sense (localization B66): after the noun, "le jour même"
// is the day itself and "le jour dernier" the previous one, which is LAST_PREVIOUS ("la semaine
// dernière") and follows the noun, as NEXT_COMING's "la semaine prochaine" does.
export const PRENOMINAL = new Set([
  'BIG', 'GREAT', 'SMALL', 'GOOD', 'BAD', 'OLD', 'YOUNG', 'NEW', 'BEAUTIFUL',
  'FIRST', 'SECOND', 'THIRD', 'OTHER', 'SAME', 'LAST_FINAL', 'OWN_ADJECTIVE',
]);

// The verbs whose present-participle stem the "nous" present rule misses (see `presentParticiple`).
export const FR_PARTICIPLE_STEM: Record<string, string> = { BE: 'ét', HAVE: 'ay', KNOW: 'sach' };

// "être" — the finite verb of the progressive and prospective, and the resultative auxiliary
// of the verbs that select it. French has no synthetic progressive, so the progressive/
// prospective are "être en train de" / "être sur le point de" + infinitive; the resultative is
// être/avoir + past participle. Past uses the imparfait ("était").
export const ETRE_FR: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'suis', '2sg': 'es', '3sg': 'est', '1pl': 'sommes', '2pl': 'êtes', '3pl': 'sont' },
  past:    { '1sg': 'étais', '2sg': 'étais', '3sg': 'était', '1pl': 'étions', '2pl': 'étiez', '3pl': 'étaient' },
  future:  { '1sg': 'serai', '2sg': 'seras', '3sg': 'sera', '1pl': 'serons', '2pl': 'serez', '3pl': 'seront' },
};

// "avoir" — the resultative auxiliary everywhere else ("a vu"), the majority case.
export const AVOIR_FR: Record<Tense, Record<string, string>> = {
  present: { '1sg': 'ai', '2sg': 'as', '3sg': 'a', '1pl': 'avons', '2pl': 'avez', '3pl': 'ont' },
  past:    { '1sg': 'avais', '2sg': 'avais', '3sg': 'avait', '1pl': 'avions', '2pl': 'aviez', '3pl': 'avaient' },
  future:  { '1sg': 'aurai', '2sg': 'auras', '3sg': 'aura', '1pl': 'aurons', '2pl': 'aurez', '3pl': 'auront' },
};

// The aspect auxiliaries as minimal concepts, so `moodForm` derives their conditional (serait /
// aurait, from the future stem) and imparfait protasis (était via the BE stem / avait from the
// "nous" present) — the same way it handles a plain verb. Without this a marked aspect under a
// hypothetical dropped the mood and kept the plain present indicative.
export const ETRE_AUX: ConceptForms = { conceptId: 'BE', forms: { '1sg_future': 'serai', '1pl_present': 'sommes' } };

export const AVOIR_AUX: ConceptForms = { conceptId: 'AVOIR', forms: { '1sg_future': 'aurai', '1pl_present': 'avons' } };

// A reflexive verb's clitic, agreeing with the subject (me/te/se/nous/vous/se) and eliding before a
// vowel (m'/t'/s'). Reflexivity is lexical: the infinitive begins with the clitic ("s'effondrer"),
// which the finite present carries ("s'effondre") but the participle ("effondré") drops — so the
// compound perfect must restore it before the auxiliary: "s'est effondrée", not "est effondrée".
export const FR_REFLEXIVE: Record<string, string> = { '1sg': 'me', '2sg': 'te', '3sg': 'se', '1pl': 'nous', '2pl': 'vous', '3pl': 'se' };

/** French linking preposition for an attributive noun, by relation (bare, no article). */
export const REL_PREP_FR: Record<ModifierRelation, string> = { feature: 'à', purpose: 'de', material: 'de' };

// The adposition an adjective-definition gloss wraps its dimension noun phrase in — extent/quality
// "de" (**de** grande taille, **de** haute qualité), measure "à". The noun phrase (dimension noun +
// degree adjective) follows bare, its adjective already agreed and placed by the ordinary NP path.
export const FR_DIM_PREP: Record<DimensionRelation, string> = { extent: 'de', quality: 'de', measure: 'à' };

// The fixed idiom a plain locative takes on a hearth noun, keyed by concept id (see `locativeIdiom`).
// French says "à la maison", not "dans le foyer" — the hearth-word gives way to "maison".
export const LOCATIVE_IDIOMS: Record<string, string> = { HOME: 'à la maison' };

// The same noun's idiom as a plain goal (see `directionIdiom`, P09-E37): "va à la maison", as the
// place is, not "va au foyer" — the lexeme's "foyer" is the hearth (E37 D2).
export const DIRECTION_IDIOMS: Record<string, string> = { HOME: 'à la maison' };

// The preposition of `between`, said once over a coordinated landmark rather than on each conjunct
// (P09-E1 D2, see `GROUP_SCOPED_SPECIFIERS`): `spatialHead` builds each conjunct with it as it
// builds any relation, and the complement lifts it off every conjunct to say it in front of all.
export const BETWEEN_PREP = 'entre';

// The preposition of `among` (P09-E32), group-scoped as `between`'s is. French is the one Romance
// language that does not merge the two: "parmi les maisons" against "entre la maison et le marché".
export const AMONG_PREP = 'parmi';

export const COORD_WORDS: Record<CoordConjunction, string> = {
  and: 'et',
  or: 'ou',
  but: 'mais',
  that_is: "c'est-à-dire",
  therefore: 'donc',
  then: 'et puis',
  however: 'cependant',
};

/**
 * The subordinating conjunctions (see PhrasePlan.adverbialClause, P09-E4). Every one but "quand" ends
 * on "que", which elides before a vowel as it always does ("parce qu'il mange"). "Avant que" governs
 * the subjunctive, which the translator resolves the clause in; "après que" takes the indicative.
 */
export const SUBORDINATORS: Record<SubordinatingConjunction, string> = {
  when: 'quand', while: 'pendant que', because: 'parce que', after: 'après que', before: 'avant que',
};

/**
 * Adjectives invariable in gender and number, by base. A number used as an adjective is one ("la phrase zéro, les articles zéro");
 * so is a prepositional phrase standing for one ("les phrases sans titre"). The agreement rule would otherwise
 * inflect either like any adjective with its ending ("*sans titres").
 */
export const INVARIABLE_ADJ: ReadonlySet<string> = new Set(['zéro', 'sans titre']);

// The negator of one constituent rather than the clause: "court **non pas** à cause du chien". The
// full "non pas" and not a bare "pas", which after a verb reads as the colloquial dropped-"ne"
// negation of the verb itself (see `Complement.negative`).
export const CONSTITUENT_NEGATOR = 'non pas';

/**
 * The focus particles (see NounPhrase.focus, C39). French leads with "seulement" and "même";
 * "aussi" follows the phrase ("le chat aussi"). The discontinuous "ne … que", which brackets the
 * verb rather than the phrase, is the other way to say `only` and is not what this writes.
 */
export const FOCUS_WORDS: FocusWords = {
  only: { word: 'seulement' }, even: { word: 'même' }, also: { word: 'aussi', post: true },
};

/** The cardinals French spells (see `numeralWord`, C31); only "un" agrees. */
export const CARDINALS: CardinalTable = {
  1: { word: 'un', fem: 'une' }, 2: { word: 'deux' }, 3: { word: 'trois' }, 4: { word: 'quatre' },
  5: { word: 'cinq' }, 6: { word: 'six' }, 7: { word: 'sept' }, 8: { word: 'huit' },
  9: { word: 'neuf' }, 10: { word: 'dix' }, 11: { word: 'onze' }, 12: { word: 'douze' },
  24: { word: 'vingt-quatre' },
};

/**
 * The word each temporal relation puts in front of its noun phrase in French (C29). Only the three
 * non-fusing prepositions are here: `at` reads the head noun's own `temporal_prep` and falls back on
 * "à" (which fuses, through `aDet`), `until` is the elided "jusqu'" plus that same "à", and `ago` is
 * "il y a" — an impersonal verb, not a preposition, which is why it takes no article of its own and
 * simply leads the phrase ("il y a un instant").
 *
 * `at`'s noun-named preposition is one that does **not** fuse, "en ce jour" being the form French
 * has. It goes only before a bare or demonstrative phrase: under an article or a possessive the
 * phrase stands alone, as French writes a definite point in time ("le jour", "un jour", A265).
 */
export const FR_TEMPORAL: Record<Exclude<TemporalRelation, 'at' | 'until'>, string> = {
  ago: 'il y a',
  after: 'après',
  before: 'avant',
  during: 'pendant',
  // The spatial BETWEEN_PREP, which the group scope lifts off each conjunct (P09-E20).
  between: 'entre',
};
