import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ConceptForms, ResolvedComplement, ResolvedNounPhrase } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { actionGerund } from '../../functions/actionGerund.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { withCauseNegator } from '../../functions/withCauseNegator.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { isSeemingPredicateNoun } from '../../functions/isSeemingPredicateNoun.js';
import { takesPredicateArticle } from '../../functions/takesPredicateArticle.js';
import { locativeIdiom } from '../../functions/locativeIdiom.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { temporalRelation } from '../../functions/temporalRelation.js';
import { temporalPreposition } from '../../functions/temporalPreposition.js';
import { isAdjectivePredicate } from '../../functions/isAdjectivePredicate.js';
import { objectPredication } from '../../functions/objectPredication.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { isPrivative } from '../../functions/isPrivative.js';
import { TONIC_COMPLEMENTS } from '../../functions/functions.consts.js';
import { CAUSE_PREP, CONSTITUENT_NEGATOR, ESSIVE, GOAL_PREP, LOCATIVE_IDIOMS, MANNER_PREP, PATH_PREP, PREP, PRIVATIVE, TEMPORAL_POSTPOSED, TEMPORAL_PREP } from './en.consts.js';
import { coordinate } from './coordinate.js';
import { enAdj } from './enAdj.js';
import { superlativeLead } from '../../functions/superlativeLead.js';
import { enStandard } from './enStandard.js';
import { npText } from './npText.js';

// `verb` is the governing verb's forms: the predicative reads it to repair a predicate noun under a
// seeming verb ("seems to be a legend").
export function complementsPhrase(
  complements?: Partial<Record<ComplementType, ResolvedComplement>>,
  verb: ConceptForms['forms'] = {},
): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // A pronoun complement ("because of him/her/them") takes the oblique form with no
      // article — only the causal adjunct accepts a pronoun in the UI today. The sentiment
      // picks the connector: positive "thanks to", negative "through the fault of", neutral
      // "because of" ("thanks to her", "through the fault of them", "because of him"). The choice is
      // per conjunct, so a group mixes the two under the one connector ("because of the dog and him").
      if (type === 'cause') {
        const conjuncts = coordinate(c.phrase, (np) => tonicPronoun(np) ?? npText(np));
        return `${CAUSE_PREP[causeSentiment(c)]} ${conjuncts}`;
      }
      // An instrument presented as an action rather than a thing: "by choosing a word"
      // (process) / "with the choosing of a word" (concept). Both take the gerund — English
      // nominalises with the same -ing form — but the concept level makes that gerund a *noun*:
      // it takes the definite article and reaches its object through "of", where the process
      // level keeps the verb's own direct object.
      // Denied, the instrument is the privative (P09-E2), and "without" takes the gerund for either
      // level: "without choosing a word", "without the choosing of a word".
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinate(c.phrase, npText);
          const adverb = c.action.modifier?.forms['base'] ?? '';
          const privative = isPrivative(type, c);
          const words =
            level === 'process'
              ? [privative ? PRIVATIVE : 'by', actionGerund(c.action), object]
              : [privative ? `${PRIVATIVE} the` : 'with the', actionGerund(c.action), 'of', object];
          return [...words, adverb].filter(Boolean).join(' ');
        }
      }
      // Subject complement: a predicate adjective takes no article and doesn't agree, but
      // carries its own degree ("seems happier"); a predicate noun keeps its own article,
      // with no preposition ("becomes a legend"). Coordinated conjuncts are rendered one by
      // one, so a group may mix the two ("becomes a legend and happy" is odd, but "seems happy
      // or tired" and "becomes a legend and an icon" both fall out of the same map).
      // A seeming verb takes a predicate noun only through the infinitival copula — "seems to be a
      // legend", not the archaic "seems a legend" — which then carries the whole group ("seems to be
      // tired and a legend"). BECOME and BE keep the bare noun; an adjective alone stays bare,
      // unless it keeps its article as a predicate: "is the same" (see `takesPredicateArticle`).
      if (type === 'predicative') {
        const predicate = coordinate(c.phrase, (np) =>
          np.head.forms['role'] !== 'adjective' ? npText(np)
            : takesPredicateArticle(np.head) ? `the ${enAdj(np.head)}`
            : superlativePredicate(np) ?? [enAdj(np.head), enStandard(np)].filter(Boolean).join(' '),
        );
        return isSeemingPredicateNoun(c, verb) ? `to be ${predicate}` : predicate;
      }
      // Object complement: what the object is made into ("transform the period into a command") or
      // taken as ("use the period as the condition"). It predicates of the object exactly as the
      // subject complement does of the subject, so a noun head keeps its article and an adjective
      // head stays bare ("paints the wall red"); only the marker differs — the verb's own link for
      // the factitive reading, the invariant "as" for the essive one.
      if (type === 'objectPredicative') {
        const predicate = coordinate(c.phrase, (np) =>
          np.head.forms['role'] === 'adjective' ? enAdj(np.head) : npText(np),
        );
        // A factitive link introduces a *noun* — "transforms it into a prison". An adjective
        // predicate takes none in any of these languages: one makes a house beautiful, never
        // "*into beautiful". The essive "as" stands before either.
        const marker = objectPredication(c) === 'essive' ? ESSIVE
          : isAdjectivePredicate(c) ? ''
          : (c.link ?? '');
        return [marker, predicate].filter(Boolean).join(' ');
      }
      // A time. Five of the six relations are ordinary prepositions and fall through to the shared
      // path below; "ago" is not one — English postposes it, after the whole group ("a moment ago",
      // "a day and a night ago"). The `at` relation takes the word the head noun names ("on this
      // day", "in this week") and only falls back on the generic "at" (see `temporalPreposition`).
      if (type === 'temporal') {
        const relation = temporalRelation(c);
        const word = relation === 'at' ? temporalPreposition(c, TEMPORAL_PREP.at) : TEMPORAL_PREP[relation];
        // No tonic branch: a time is not a person, so `temporal` is absent from TONIC_COMPLEMENTS
        // and a pronoun here takes the ordinary noun-phrase path, as it does in the other six.
        const group = coordinate(c.phrase, npText);
        return TEMPORAL_POSTPOSED.has(relation) ? `${group} ${word}` : `${word} ${group}`;
      }
      // The preposition is emitted once, before the whole group: "with the cat and the dog".
      // A direction may name a relation of its own, and then it is that relation's goal form
      // ("jumps into the air"); with none it is the plain goal "to" (see `directionSpecifier`).
      const goal = type === 'direction' ? directionSpecifier(c) : undefined;
      const prep = type === 'route' ? PATH_PREP[pathSpecifier(c)]
        : type === 'locative' ? PATH_PREP[pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER)]
        : goal ? GOAL_PREP[goal]
        : type === 'manner' ? MANNER_PREP[mannerRelation(firstConjunct(c.phrase).head.forms)]
        // The instrument denied: "without the knife" where it would be "with the knife" (P09-E2).
        : isPrivative(type, c) ? PRIVATIVE
        : PREP[type];
      // A hearth noun takes its fixed locative idiom in place of preposition + noun phrase ("at
      // home", not "in the home"). The idiom carries its own preposition, so a group holding one
      // gives every conjunct its own instead of sharing it: "at home and in the market".
      if (type === 'locative' && c.phrase.conjuncts.some((np) => locativeIdiom(c, np, LOCATIVE_IDIOMS))) {
        return coordinate(c.phrase, (np) => locativeIdiom(c, np, LOCATIVE_IDIOMS) ?? `${prep} ${npText(np)}`);
      }
      // A pronoun behind the preposition takes its oblique form and no article — "with him", "in
      // him", "like him", never "with the he" (A197 for the comitative and the instrumental, A203
      // for the rest) — the same shape the causal adjunct above has always had. English needs no
      // more than the set: the preposition is already emitted whole, in front of the group, and
      // fuses with no article. Per conjunct, so a group mixes the two under the one preposition
      // ("with the dog and him").
      const conjunctText = (np: ResolvedNounPhrase): string =>
        (TONIC_COMPLEMENTS.has(type) ? tonicPronoun(np) : undefined) ?? npText(np);
      return `${prep} ${coordinate(c.phrase, conjunctText)}`;
    })
    // A cause the plan denies rather than the clause takes its negator here, in front of whatever
    // shape the sentiment gave it (see `withCauseNegator`).
    .map((text, i) => withCauseNegator(text, COMPLEMENT_RENDER_ORDER[i], complements[COMPLEMENT_RENDER_ORDER[i]], CONSTITUENT_NEGATOR))
    .filter(Boolean)
    .join(' ');
}

/**
 * A predicate superlative under its own intensifier, which stands before an article the bare one
 * does without: "is biggest", but "is by far the biggest" (A257; see `superlativeLead`). Undefined
 * for any other predicate adjective.
 */
function superlativePredicate(np: ResolvedNounPhrase): string | undefined {
  const { lead, adjective } = superlativeLead(np.head);
  return lead ? [lead, 'the', enAdj(adjective), enStandard(np)].filter(Boolean).join(' ') : undefined;
}
