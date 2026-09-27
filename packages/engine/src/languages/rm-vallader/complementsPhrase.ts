import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../../types.js';
import { allAdverbs } from '../../functions/adverbClass.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { actionInfinitive } from '../../functions/actionInfinitive.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { withCauseNegator } from '../../functions/withCauseNegator.js';
import { isRelativeSuperlative } from '../../functions/isRelativeSuperlative.js';
import { superlativeLead } from '../../functions/superlativeLead.js';
import { takesPredicateArticle } from '../../functions/takesPredicateArticle.js';
import { directionIdiom } from '../../functions/directionIdiom.js';
import { locativeIdiom } from '../../functions/locativeIdiom.js';
import { mannerRelation } from '../../functions/mannerRelation.js';
import { objectPredication } from '../../functions/objectPredication.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { isNamedLand } from '../../functions/isNamedLand.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { groupScopedRelation } from '../../functions/groupScopedRelation.js';
import { liftPreposition } from '../../functions/liftPreposition.js';
import { temporalRelation } from '../../functions/temporalRelation.js';
import { temporalBare, temporalPreposition } from '../../functions/temporalPreposition.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { isPrivative } from '../../functions/isPrivative.js';
import { tonicHeadForms } from '../../functions/tonicHeadForms.js';
import { SOURCE_ABLATIVE_ADVERB_VERBS, TONIC_COMPLEMENTS } from '../../functions/functions.consts.js';
import { BETWEEN_PREP, CONSTITUENT_NEGATOR, DIRECTION_IDIOMS, LOCATIVE_IDIOMS, VL_MANNER_PREP, VL_TEMPORAL } from './vallader.consts.js';
import { agreeAdj } from './agreeAdj.js';
import { vlArticle } from './vlArticle.js';
import { coordinate } from './coordinate.js';
import { defArticle } from './defArticle.js';
import { vlDeg } from './vlDeg.js';
import { vlPossessedHeadForms } from './vlPossessedHeadForms.js';
import { vlStandard } from './vlStandard.js';
import { joinArt } from './joinArt.js';
import { joinWords } from './joinWords.js';
import { npText } from './npText.js';
import { prepDet, type VlPreposition } from './prepDet.js';
import { renderNP } from './renderNP.js';
import { spatialHead } from './spatialHead.js';
import { withRelative } from './withRelative.js';

/**
 * The complements of a clause in their render order (P04 §2.3, P04-E15 D1; every preposition
 * *(verify)*, the author's draft where the style sheet is silent): locative *in* and the spatial
 * relations (`spatialHead`), direction *a* for a place, *pro* for a person, *in* for a land, source *da*,
 * route *tras*, cause *pervia da / grazcha a / per cuolpa da*, manner *sco / cun / a / in*, instrument
 * and companion *cun*, denied *sainza*, terminus *a*, purpose *per*, topic *da*, opponent *cunter*; the
 * predicative takes none. *a* and *da* contract with the masculine article ("al chan", "dals chans"),
 * *in* with every definite article ("i'l chan", "illa chasa"), nothing else does.
 *
 * `objectForms` are the direct object's, which an object complement agrees an adjective with;
 * `verbForms` the governing verb's, for a preposition the verb fixes (`direction_prep`).
 */
export function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
  verbConceptId: string,
  objectForms: Record<string, string> = {},
  verbForms: Record<string, string> = {},
): string {
  if (!complements) return '';
  // A self-propelled motion verb says a source with *davent* (away), so it never reads as the goal:
  // "el cuorra davent da la chasa" (verify), as `it` uses *via*. An animate source under a verb that
  // takes a goal does too.
  const sourceAdverb = SOURCE_ABLATIVE_ADVERB_VERBS.has(verbConceptId) ? 'davent ' : '';
  const takesGoal = (verbForms['complements'] ?? 'direction').split(',').includes('direction');
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // Subject complement: a predicate adjective agrees with the subject ("ella es stangla", "els sun
      // stanguels") and carries its own degree; a predicate noun keeps its own article, no preposition.
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinate(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') return npText(np);
          const { lead, adjective } = superlativeLead(np.head);
          const surface = joinWords([vlDeg(adjective, agreeAdj(adjective.forms, gender, plural)), vlStandard(np.head, np.standard)]);
          // A predicative superlative supplies its own article: "el es il plü grond" (and SAME's, "il listess").
          return isRelativeSuperlative(np.head) || takesPredicateArticle(np.head)
            ? joinWords([lead, joinArt(defArticle({ gender }, plural, surface), surface)])
            : surface;
        });
      }
      // Object complement: what the object is made into (the verb's link, `object_predicative_link`,
      // "transfuormar la frasa in ün cumond") or taken as (the essive *sco*).
      if (type === 'objectPredicative') {
        if (objectPredication(c) === 'essive') return essivePhrase(c, objectForms);
        const gender = objectForms['gender'] ?? 'masc';
        const plural = objectForms['number'] === 'plural';
        return coordinate(c.phrase, (np) => {
          if (np.head.forms['role'] === 'adjective') return vlDeg(np.head, agreeAdj(np.head.forms, gender, plural));
          const nf = vlPossessedHeadForms(np);
          return renderNP(np, (pl, lead) => (c.link ? prepDet(c.link, nf, pl, lead) : vlArticle(nf, pl, lead)));
        });
      }
      // The role (P09-E13): the essive said of the subject, "el agischa sco ami".
      if (type === 'role') return essivePhrase(c, subjectForms);
      // An instrument presented as an action. The column stores no -ing form (P04 §2.2), so the process level is
      // *cun* + the infinitive, as the concept level with its article is: "cun tscherner ün pled", "cun
      // il tscherner ün pled" (P04-E15 D1's open point: the means construction, verify).
      // Denied, the privative *sainza* + the infinitive.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinate(c.phrase, npText);
          const infinitive = actionInfinitive(c.action);
          const verb = isPrivative(type, c) ? `sainza ${infinitive}`
            : level === 'process' ? `cun ${infinitive}`
            : joinWords(['cun', defArticle({ gender: 'masc' }, false, infinitive), infinitive]);
          const adverb = allAdverbs(c.action).map((a) => a.forms['base'] ?? '').filter(Boolean).join(' ');
          return joinWords([verb, object, adverb]);
        }
      }
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const locSpec = pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER);
      const dirSpec = type === 'direction' ? directionSpecifier(c) : undefined;
      // A land's bare name takes a bare *in* ("in Europa"); articled or modified it contracts as any
      // noun does ("in tia Asia", "illa gronda Asia").
      const bareName = (nf: Record<string, string>, lead: string): boolean =>
        nf['proper'] === '1' && lead === nf['base'] && nf['relativeSuperlative'] !== '1';
      const headForms = (np: ResolvedNounPhrase): Record<string, string> => {
        const nf = vlPossessedHeadForms(np);
        return np.adjectives.some(isRelativeSuperlative) ? { ...nf, relativeSuperlative: '1' } : nf;
      };
      const headFor = (nf: Record<string, string>) => (plural: boolean, lead: string): string =>
        type === 'locative'  ? (bareName(nf, lead) && locSpec === 'in' ? 'in' : spatialHead(locSpec, nf, plural, lead)) :
        type === 'terminus'  ? prepDet('a', nf, plural, lead) :
        type === 'instrumental' || type === 'comitative' ? prepDet(isPrivative(type, c) ? 'sainza' : 'cun', nf, plural, lead) :
        type === 'opponent'  ? prepDet((c.link || 'cunter') as VlPreposition, nf, plural, lead) :
        type === 'purpose'   ? prepDet('per', nf, plural, lead) :
        type === 'topic'     ? topicHead((c.link || 'da') as VlPreposition, nf, plural, lead) :
        type === 'manner'    ? prepDet(VL_MANNER_PREP[mannerRelation(nf)], nf, plural, lead) :
        type === 'temporal'  ? (() => {
          const relation = temporalRelation(c);
          const { word, prep } = VL_TEMPORAL[relation];
          const p = relation === 'at' ? (temporalBare(c) ? undefined : temporalPreposition<VlPreposition>(c, 'a')) : prep;
          return joinWords([word ?? '', p ? prepDet(p, nf, plural, lead) : vlArticle(nf, plural, lead)]);
        })() :
        type === 'direction' ? (
          dirSpec ? spatialHead(dirSpec, nf, plural, lead) :
          verbForms['direction_prep'] ? prepDet(verbForms['direction_prep'], nf, plural, lead) :
          // A land takes *in* ("el va in Europa"); a person *pro* ("el va pro la duonna"); a place *a*.
          isNamedLand(nf) ? (bareName(nf, lead) ? 'in' : spatialHead('in', nf, plural, lead)) :
          prepDet(nf['animate'] === '1' ? 'pro' : 'a', nf, plural, lead)
        ) :
        type === 'source'    ? `${sourceAdverb || (nf['animate'] === '1' && takesGoal ? 'davent ' : '')}${prepDet('da', nf, plural, lead)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `grazcha ${prepDet('a', nf, plural, lead)}` :
          causeSent === 'negative' ? `per cuolpa ${prepDet('da', nf, plural, lead)}` :
          `pervia ${prepDet('da', nf, plural, lead)}`
        ) :
        spatialHead(pathSpecifier(c), nf, plural, lead);
      // A pronoun behind a preposition is its tonic form, with no article: "cun el", "pro mai", "ad
      // ella", "pervia dad el" is not written: "pervia da el" (verify).
      const tonicText = (np: ResolvedNounPhrase): string => {
        const tonic = TONIC_COMPLEMENTS.has(type) || type === 'cause' ? tonicPronoun(np) : undefined;
        if (!tonic) return '';
        const nf = tonicHeadForms(np);
        const head = headFor(nf)((nf['number'] ?? nf['count']) === 'plural', tonic);
        return withRelative(`${head} ${tonic}`, np);
      };
      const scoped = groupScopedRelation(type, c) ? BETWEEN_PREP : '';
      const group = coordinate(c.phrase, (np) => liftPreposition(
        tonicText(np) ||
        (type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS)) ||
        (type === 'direction' && !verbForms['direction_prep'] && directionIdiom(c, np, DIRECTION_IDIOMS)) ||
        renderNP(np, headFor(headForms(np))), scoped));
      const phrase = scoped ? `${scoped} ${group}` : group;
      const tail = type === 'temporal' ? VL_TEMPORAL[temporalRelation(c)].postposed : undefined;
      return tail ? `${phrase} ${tail}` : phrase;
    })
    // A cause the plan denies takes its negator in front (see `withCauseNegator`).
    .map((text, i) => withCauseNegator(text, COMPLEMENT_RENDER_ORDER[i], complements[COMPLEMENT_RENDER_ORDER[i]], CONSTITUENT_NEGATOR))
    .filter(Boolean)
    .join(' ');
}

/** A topic preposition that may be two words (a verb's `topic_prep`, *vi da* in RG's THINK), contracting through its last. */
function topicHead(prep: VlPreposition, nf: Record<string, string>, plural: boolean, lead: string): string {
  const words = prep.split(' ');
  const last = words.pop()!;
  return [...words, prepDet(last, nf, plural, lead)].join(' ');
}

/**
 * The essive *sco* and the predicate it introduces — the object taken as a role ("dovrar la frasa sco
 * cundiziun") or the subject acting in one ("el agischa sco ami", P09-E13). It drops the article: it
 * names a role rather than a referent, and "sco ün ami" is the likeness. `controller` is what the
 * predicate is said of, whose gender and number an adjective agrees with.
 */
function essivePhrase(c: ResolvedComplement, controller: Record<string, string>): string {
  const gender = controller['gender'] ?? 'masc';
  const plural = controller['number'] === 'plural';
  return coordinate(c.phrase, (conjunct) => {
    const np = withDefiniteness(conjunct, 'bare');
    if (np.head.forms['role'] === 'adjective') return joinWords(['sco', vlDeg(np.head, agreeAdj(np.head.forms, gender, plural))]);
    return renderNP(np, (pl, lead) => prepDet('sco', np.head.forms, pl, lead));
  });
}

