import { COMPLEMENT_RENDER_ORDER, DEFAULT_LOCATIVE_SPECIFIER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../../types.js';
import { allAdverbs } from '../../functions/adverbClass.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { actionGerund } from '../../functions/actionGerund.js';
import { actionInfinitive } from '../../functions/actionInfinitive.js';
import { causeSentiment } from '../../functions/causeSentiment.js';
import { withCauseNegator } from '../../functions/withCauseNegator.js';
import { isRelativeSuperlative } from '../../functions/isRelativeSuperlative.js';
import { superlativeLead } from '../../functions/superlativeLead.js';
import { takesPredicateArticle } from '../../functions/takesPredicateArticle.js';
import { directionIdiom } from '../../functions/directionIdiom.js';
import { locativeIdiom } from '../../functions/locativeIdiom.js';
import { isAdjectivePredicate } from '../../functions/isAdjectivePredicate.js';
import { objectPredication } from '../../functions/objectPredication.js';
import { directionSpecifier } from '../../functions/directionSpecifier.js';
import { pathSpecifier } from '../../functions/pathSpecifier.js';
import { groupScopedRelation } from '../../functions/groupScopedRelation.js';
import { liftPreposition } from '../../functions/liftPreposition.js';
import { BETWEEN_PREP } from './ca.consts.js';
import { temporalRelation } from '../../functions/temporalRelation.js';
import { temporalPreposition } from '../../functions/temporalPreposition.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { ownHeadForms, possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { tonicPronoun } from '../../functions/tonicPronoun.js';
import { isPrivative } from '../../functions/isPrivative.js';
import { SOURCE_ABLATIVE_ADVERB_VERBS, TONIC_COMPLEMENTS } from '../../functions/functions.consts.js';
import { tonicHeadForms } from '../../functions/tonicHeadForms.js';
import { headPreposition } from '../../functions/headPreposition.js';
import { keptBesidePossessive, possessiveCa, pronounPossessor } from '../../possessive.js';
import { aDet } from './aDet.js';
import { agreeAdj } from './agreeAdj.js';
import { artForms } from './artForms.js';
import { coordinateElement } from './coordinateElement.js';
import { deDet } from './deDet.js';
import { defArticle } from './defArticle.js';
import { numeralText } from '../../functions/numeralText.js';
import { oneBesideDeterminer } from '../../functions/oneBesideDeterminer.js';
import { CARDINALS, CONSTITUENT_NEGATOR, DIRECTION_IDIOMS, CA_TEMPORAL, LOCATIVE_IDIOMS, NOMINATIVE_PREP } from './ca.consts.js';
import { caMannerHead } from './caMannerHead.js';
import { caSurface } from './caSurface.js';
import { joinHead } from './joinHead.js';
import { caAdj } from './caAdj.js';
import { caDeg } from './caDeg.js';
import { caStandard } from './caStandard.js';
import { isPlural } from './isPlural.js';
import { nounPhrase } from './nounPhrase.js';
import { npText } from './npText.js';
import { predicativeForms } from './predicativeForms.js';
import { prepDet } from './prepDet.js';
import { spatialHead } from './spatialHead.js';
import { withAdj } from './withAdj.js';
import { withRelative } from './withRelative.js';
import { caPossessiveWord } from './caPossessiveWord.js';

// `objectForms` are the direct object's, which the object complement predicates of and agrees an
// adjective head with ("pinta la paret vermella") — the object's counterpart of `subjectForms`.
export function complementsPhrase(
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  subjectForms: Record<string, string>,
  verbConceptId: string,
  objectForms: Record<string, string> = {},
): string {
  // "lluny de" tells a source from an origin, but only self-propelled motion verbs (RUN/JUMP) need it
  // (SOURCE_ABLATIVE_ADVERB_VERBS): "el gat corre lluny de la casa", "el gat ve de la casa".
  const sourceAdverb = SOURCE_ABLATIVE_ADVERB_VERBS.has(verbConceptId) ? 'lluny ' : '';
  if (!complements) return '';
  return caSurface(COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      // Subject complement: a predicate adjective agrees with the *subject* ("sembla cansada") and
      // carries its own degree ("sembla més cansada"); a predicate noun keeps its own article, no
      // preposition ("es torna una llegenda").
      if (type === 'predicative') {
        const gender = subjectForms['gender'] ?? 'masc';
        const plural = subjectForms['number'] === 'plural';
        return coordinateElement(c.phrase, (np) => {
          if (np.head.forms['role'] !== 'adjective') {
            return withRelative(nounPhrase(predicativeForms(np.head.forms), caAdj(np), caPossessiveWord(np)), np);
          }
          // A superlative's intensifier stands before the article (A257).
          const { lead, adjective } = superlativeLead(np.head);
          const surface = [caDeg(adjective, agreeAdj(adjective.forms, gender, plural), plural), caStandard(np.head, np.standard)].filter(Boolean).join(' ');
          // A predicative superlative adds its own article, agreeing with the subject: "és el més
          // feliç", "és el millor"; SAME keeps its article the same way: "és el mateix".
          return isRelativeSuperlative(np.head) || takesPredicateArticle(np.head)
            ? [lead, `${defArticle({ gender }, plural)} ${surface}`].filter(Boolean).join(' ')
            : surface;
        });
      }
      // Object complement: what the object is *made into* ("convertir el període en una ordre") or
      // *taken as* ("fer servir el període com a condició"). An adjective head agrees with the object.
      if (type === 'objectPredicative') {
        if (objectPredication(c) === 'essive') return essivePhrase(c, objectForms);
        const marker = isAdjectivePredicate(c) ? '' : (c.link ?? '');
        const gender = objectForms['gender'] ?? 'masc';
        const plural = objectForms['number'] === 'plural';
        return coordinateElement(c.phrase, (np) => {
          const word = np.head.forms['role'] === 'adjective'
            ? caDeg(np.head, agreeAdj(np.head.forms, gender, plural), plural)
            : predicateNoun(np);
          return [marker, word].filter(Boolean).join(' ');
        });
      }
      // The role (P09-E13): the essive said of the subject, "actua com a amic".
      if (type === 'role') return essivePhrase(c, subjectForms);
      // An instrument presented as an action: the bare gerund at the process level ("triant una
      // paraula"), "amb el" + the infinitive at the concept level; denied, "sense" + the infinitive.
      if (type === 'instrumental' && c.action) {
        const level = abstractionLevel(c);
        if (level !== 'object') {
          const object = coordinateElement(c.phrase, npText);
          const verb =
            isPrivative(type, c) ? `sense ${actionInfinitive(c.action)}` :
            level === 'process'
              ? actionGerund(c.action)
              : `amb el ${actionInfinitive(c.action)}`;
          const adverb = allAdverbs(c.action).map((a) => a.forms['base'] ?? '').filter(Boolean).join(' ');
          return [verb, object, adverb].filter(Boolean).join(' ');
        }
      }
      // Each conjunct carries its own head, which contracts with its article ("al gat i al gos") and
      // may differ per conjunct: an animate goal takes "cap a", a place "a".
      const conjunctText = (np: ResolvedNounPhrase): string => {
      // A hearth noun takes its fixed idiom in place of the whole noun phrase: "a casa".
      const idiom = (type === 'locative' && locativeIdiom(c, np, LOCATIVE_IDIOMS))
        || (type === 'direction' && directionIdiom(c, np, DIRECTION_IDIOMS));
      if (idiom) return idiom;
      // A pronoun behind an adposition is the preposition + its tonic form ("amb ell", "sense mi",
      // "cap a ell"), no article (A197, A203). Catalan fuses none of them.
      const tonic = TONIC_COMPLEMENTS.has(type) ? tonicPronoun(np) : undefined;
      if (tonic && isPrivative(type, c)) return withRelative(`sense ${tonic}`, np);
      if (tonic && (type === 'instrumental' || type === 'comitative')) return withRelative(`amb ${tonic}`, np);
      // A pronominal possessive rides on the article, which the head takes as any other: "a la meva
      // casa", "amb els meus gats", "a totes les meves cases". A head with a determiner of its own
      // keeps it and says the possessive after the noun: "en aquesta casa meva" (A187, A202).
      const possessive = caPossessiveWord(np);
      const ownDeterminer = np.head.forms['definiteness'] ?? 'definite';
      const detached = !!possessive && keptBesidePossessive(np.head.forms);
      const f = !possessive ? np.head.forms
        : detached || ownDeterminer === 'all' || ownDeterminer === 'most' ? ownHeadForms(np)
        : possessedHeadForms(np, 'definite');
      const plural = isPlural(f);
      const word = plural ? (f['plural'] ?? f['base'] ?? '') : (f['base'] ?? '');
      const adj = caAdj(np);
      // A cardinal stands after the determiner and possessive, before the noun (C31, A291, A319).
      const numeral = oneBesideDeterminer(np.head.forms, !!possessive) ? '' : numeralText(f, CARDINALS);
      const noun = detached
        ? [numeral, withAdj(word, adj), possessive].filter(Boolean).join(' ')
        : [possessive, numeral, withAdj(word, adj)].filter(Boolean).join(' ');
      const af = tonic ? tonicHeadForms(np) : artForms(f, adj);
      const causeSent = type === 'cause' ? causeSentiment(c) : 'neutral';
      const dirSpec = type === 'direction' ? directionSpecifier(c) : undefined;
      const head =
        type === 'locative'  ? spatialHead(pathSpecifier(c, DEFAULT_LOCATIVE_SPECIFIER), plural, af) :
        type === 'terminus'  ? aDet(af, plural) :
        // Instrumental and comitative share *amb* ("amb el bastó", "amb el gos"); the privative *sense*.
        type === 'instrumental' || type === 'comitative' ? prepDet(isPrivative(type, c) ? 'sense' : 'amb', af, plural) :
        // P09-E22: the opponent *contra*, or the word the verb names.
        type === 'opponent'  ? prepDet(c.link || 'contra', af, plural) :
        // P09-E2: the purpose *per a* ("per a l'home") and the topic *sobre*, or the verb's own.
        type === 'purpose'   ? prepDet('per a', af, plural) :
        type === 'topic'     ? prepDet(c.link || 'sobre', af, plural) :
        type === 'manner'    ? caMannerHead(af, plural) :
        // A time: *després de, abans de, des de, dins de* contract through their *de* ("després del
        // dia"), *fins a* through its *a* ("fins al dia"); *durant, entre* govern the phrase; *fa* is a
        // verb leading the phrase's own article ("fa un moment"); `at` takes the head noun's word or
        // "en".
        type === 'temporal'  ? (() => {
          const relation = temporalRelation(c);
          if (relation === 'at') return prepDet(temporalPreposition(c, 'en'), af, plural);
          const { word, de, a } = CA_TEMPORAL[relation];
          return de ? `${word} ${deDet(af, plural)}` : a ? `${word} ${aDet(af, plural)}` : prepDet(word, af, plural);
        })() :
        type === 'direction' ? (
          // A direction naming a relation is that relation's goal; with none it is the plain goal "a",
          // or "cap a" towards a person or animal ("corre cap al nen").
          dirSpec ? spatialHead(dirSpec, plural, af) :
          af['animate'] === '1' ? `cap ${aDet(af, plural)}` : aDet(af, plural)
        ) :
        type === 'source'    ? `${sourceAdverb}${deDet(af, plural)}` :
        type === 'cause'     ? (
          causeSent === 'positive' ? `gràcies ${aDet(af, plural)}` :
          causeSent === 'negative' ? `per culpa ${deDet(af, plural)}` :
          `a causa ${deDet(af, plural)}`
        ) :
        // Through a person the route's "per" reads as *for*, so the path is *a través de* (A374).
        type === 'route' && af['animate'] === '1' && pathSpecifier(c) === 'through' ? `a través ${deDet(af, plural)}` :
        spatialHead(pathSpecifier(c), plural, af);
      // A pronoun is the whole phrase after the head, in its tonic form — or its subject form after
      // "com" and "entre" ("com jo", "entre tu i jo").
      if (tonic) return withRelative(`${head} ${NOMINATIVE_PREP.has(headPreposition(head)) ? (np.head.forms['base'] ?? tonic) : tonic}`, np);
      return withRelative(joinHead(head, noun, af, adj, numeral), np);
      };
      // A pronoun cause: the 1st and 2nd persons take the possessive after *culpa* / *causa* ("per
      // culpa meva", "a causa teva"), the 3rd *de* + its tonic form ("per culpa d'ell"); the positive
      // is "gràcies a mi". Every conjunct of a group says its own connector, but the positive's, said
      // once: "gràcies a mi i al gos".
      if (type === 'cause' && c.phrase.conjuncts.some((np) => np.head.forms['person'])) {
        const sent = causeSentiment(c);
        const connector = sent === 'negative' ? 'per culpa' : 'a causa';
        const pronoun = (pf: Record<string, string>): string => {
          if (sent === 'positive') return `a ${pf['disjunctive'] ?? pf['base'] ?? ''}`;
          const person = pf['person'];
          if (person === '1' || person === '2') return `${connector} ${possessiveCa(pronounPossessor(pf), { gender: 'fem', number: 'singular' })}`;
          return `${connector} de ${pf['disjunctive'] ?? pf['base'] ?? ''}`;
        };
        const conjuncts = coordinateElement(c.phrase, (np) =>
          np.head.forms['person'] ? pronoun(np.head.forms)
            : sent === 'positive' ? conjunctText(np).replace(/^gràcies /, '') : conjunctText(np));
        return sent === 'positive' ? `gràcies ${conjuncts}` : conjuncts;
      }
      // `between` is said once over the group: "entre la casa i l'arbre" (P09-E1 D2).
      const scoped = groupScopedRelation(type, c) ? BETWEEN_PREP : '';
      const group = coordinateElement(c.phrase, (np) => liftPreposition(conjunctText(np), scoped), true);
      return scoped ? `${scoped} ${group}` : group;
    })
    // A cause the plan denies rather than the clause takes its negator here (see `withCauseNegator`).
    .map((text, i) => withCauseNegator(text, COMPLEMENT_RENDER_ORDER[i], complements[COMPLEMENT_RENDER_ORDER[i]], CONSTITUENT_NEGATOR))
    .filter(Boolean)
    .join(' '));
}

// The object predicative owns things too: "en la seva presó", "com a la seva presó" (A198).
function predicateNoun(np: ResolvedNounPhrase): string {
  return withRelative(nounPhrase(predicativeForms(np.head.forms), caAdj(np), caPossessiveWord(np)), np);
}

/**
 * The essive *com a* and the predicate it introduces — the object taken as a role ("fa servir el
 * període com a condició") or the subject acting in one ("actua com a amic", P09-E13). It drops the
 * article: it names a role; "com **un** amic" is the likeness, the similative manner. `controller` is
 * what the predicate is said of, whose gender and number an adjective head agrees with.
 */
function essivePhrase(c: ResolvedComplement, controller: Record<string, string>): string {
  const gender = controller['gender'] ?? 'masc';
  const plural = controller['number'] === 'plural';
  return coordinateElement(c.phrase, (conjunct) => {
    const np = withDefiniteness(conjunct, 'bare');
    const word = np.head.forms['role'] === 'adjective'
      ? caDeg(np.head, agreeAdj(np.head.forms, gender, plural), plural)
      : predicateNoun(np);
    return `com a ${word}`;
  });
}
