import { COMPLEMENT_RENDER_ORDER, type ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounPhrase } from '../../types.js';
import { abstractionLevel } from '../../functions/abstractionLevel.js';
import { allAdverbs } from '../../functions/adverbClass.js';
import { groupScopedRelation } from '../../functions/groupScopedRelation.js';
import { isPrivative } from '../../functions/isPrivative.js';
import { joinConjuncts } from '../../functions/joinConjuncts.js';
import { objectPredication } from '../../functions/objectPredication.js';
import { withCauseNegator } from '../../functions/withCauseNegator.js';
import { withDefiniteness } from '../../functions/withDefiniteness.js';
import { COORD_WORDS, CONSTITUENT_NEGATOR } from './lt.consts.js';
import { adjForm } from './adjForm.js';
import { complementGovernment } from './complementGovernment.js';
import { elementText } from './elementText.js';
import { isSuffixReflexive } from './isSuffixReflexive.js';
import { nounAgr } from './nounAgr.js';
import { nounPhrase } from './nounPhrase.js';
import { standardText } from './standardText.js';
import { verbAgr } from './verbAgr.js';
import { verbWord } from './verbWord.js';
import { withPreposition } from './withPreposition.js';
import type { Agr, Case } from './lt.types.js';

/** What the complements of one clause see of it. */
export interface ComplementContext {
  /** The subject's agreement forms: a predicate adjective agrees with them, and *savo* refers to them. */
  subject: Record<string, string>;
  /** The governing verb's forms (`copula`, `terminus_case`, `topic_prep_case`, …). */
  verb?: Record<string, string>;
  /** The direct object's agreement forms, which an object predicate agrees with. */
  object?: Record<string, string>;
}

type Complements = Partial<Record<ComplementType, ResolvedComplement>>;

/**
 * A clause's complements in the shared render order, each with its adposition and governed case
 * (`complementGovernment`, P18 §2.3): *namuose*, *į namus*, *nuo namų*, *per parką*, *dėl šuns*,
 * *draugo dėka*, *kaip vanduo*, *peiliu*, *vaikui*, *su manimi*.
 *
 * - The predicative (P18 §2.1): a noun in the nominative after *būti* (`copula`: *yra legenda*) and in
 *   the instrumental after any other verb (*tampa legenda*); an adjective in the nominative agreeing
 *   with the subject (*yra laiminga*), the neuter with a genderless one (*gera*).
 * - The object predicate: the verb's `object_predicative_case` bare (*paverčia varlę princu*), its
 *   link + accusative, else the instrumental (*padaro namą gražiu*, verify); the essive *kaip* + the
 *   accusative (*naudoja katę kaip įrankį*, verify).
 * - The role: *kaip* + nominative (*dirba kaip draugas*).
 * - An instrument that is an act: the half-participle agreeing with the subject (*rinkdamas žodį*,
 *   *rinkdama*), negated *nerinkdamas žodžio* (the privative) (verify).
 * - `between` scopes over the group once, joined by *ir*: *tarp namo ir medžio*.
 */
export function complementsPhrase(complements: Complements | undefined, ctx: ComplementContext): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      return c ? withCauseNegator(complementText(type, c, ctx), type, c, CONSTITUENT_NEGATOR) : '';
    })
    .filter(Boolean)
    .join(' ');
}

/** The agreement a predicate adjective reads off the forms it is said of; a genderless one is neuter. */
function agreementOf(forms: Record<string, string>): Agr {
  if (forms['gender'] === 'neut') return { gender: 'neut', plural: false };
  if (forms['generic'] === '1') return { gender: 'masc', plural: false };
  return nounAgr(forms);
}

/** Each conjunct rendered, coordinated as the slot's conjunction says. */
function coordinated(c: ResolvedComplement, render: (np: ResolvedNounPhrase) => string): string {
  const word = COORD_WORDS[c.phrase.conjunction ?? 'and'];
  return joinConjuncts(c.phrase.conjuncts.map(render), ', ', () => ` ${word} `);
}

function complementText(type: ComplementType, c: ResolvedComplement, ctx: ComplementContext): string {
  const np0 = { subject: ctx.subject };
  const verb = ctx.verb ?? {};
  const predicate = (np: ResolvedNounPhrase, controller: Record<string, string>, adjectiveCase: Case, nounCase: Case): string =>
    np.head.forms['role'] === 'adjective'
      ? [adjForm(np.head, adjectiveCase, agreementOf(controller)), np.standard ? standardText(np.head.forms, np.standard) : ''].filter(Boolean).join(' ')
      : nounPhrase(np, nounCase, np0);
  if (type === 'predicative') {
    return coordinated(c, (np) => predicate(np, ctx.subject, 'nom', verb['copula'] === '1' ? 'nom' : 'ins'));
  }
  if (type === 'objectPredicative') {
    const object = ctx.object ?? {};
    if (objectPredication(c) === 'essive') return coordinated(c, (np) => `kaip ${predicate(withDefiniteness(np, 'bare'), object, 'acc', 'acc')}`);
    const own = verb['object_predicative_case'] as Case | undefined;
    if (own) return coordinated(c, (np) => predicate(np, object, own, own));
    if (c.link) return coordinated(c, (np) => withPreposition(c.link!, predicate(np, object, 'acc', 'acc')));
    return coordinated(c, (np) => predicate(np, object, 'ins', 'ins'));
  }
  if (type === 'role') return coordinated(c, (np) => `kaip ${predicate(withDefiniteness(np, 'bare'), ctx.subject, 'nom', 'nom')}`);
  if (type === 'instrumental' && c.action && abstractionLevel(c) !== 'object') {
    const privative = isPrivative(type, c);
    const act = c.action.verb.forms;
    const agr = verbAgr(ctx.subject);
    const key = `adverbial${agr.gender === 'fem' ? '_fem' : ''}${agr.plural ? '_plural' : ''}`;
    const participle = verbWord(act[key] ?? act['adverbial'] ?? act['base'] ?? '', privative, isSuffixReflexive(act, false));
    const object = elementText(c.phrase, privative ? 'gen' : 'acc', np0);
    const adverbs = allAdverbs(c.action).map((a) => a.forms['base'] ?? '').filter(Boolean);
    return [participle, object, ...adverbs].filter(Boolean).join(' ');
  }
  const head = c.phrase.conjuncts[0]?.head.forms ?? {};
  const gov = complementGovernment(type, c, head, ctx.verb);
  if (groupScopedRelation(type, c) && c.phrase.conjuncts.length > 1) {
    return withPreposition(gov, joinConjuncts(c.phrase.conjuncts.map((np) => nounPhrase(np, gov.case, np0)), ', ', () => ` ${COORD_WORDS.and} `));
  }
  return coordinated(c, (np) => withPreposition(gov, nounPhrase(np, gov.case, np0)));
}
