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
import { COORD_WORDS, CONSTITUENT_NEGATOR, NIE } from './pl.consts.js';
import { adjForm } from './adjForm.js';
import { complementGovernment } from './complementGovernment.js';
import { elementText } from './elementText.js';
import { nounAgr } from './nounAgr.js';
import { nounPhrase } from './nounPhrase.js';
import { standardText } from './standardText.js';
import { withPreposition } from './withPreposition.js';
import type { Agr, Case } from './pl.types.js';

/** What the complements of one clause see of it. */
export interface ComplementContext {
  /** The subject's agreement forms: a predicate adjective agrees with them, and *swój* refers to them. */
  subject: Record<string, string>;
  /** The governing verb's forms (`terminus_case`, `topic_prep_case`, …). */
  verb?: Record<string, string>;
  /** The direct object's agreement forms, which an object predicate agrees with. */
  object?: Record<string, string>;
}

type Complements = Partial<Record<ComplementType, ResolvedComplement>>;

/**
 * A clause's complements in the shared render order, each with its preposition and governed case
 * (`complementGovernment`, P05 §2.3) and the euphonic *-e* (`withPreposition`): *w domu*, *do domu*,
 * *od domu*, *przez dom*, *z powodu psa*, *jak woda*, *nożem*, *dziecku*, *ze mną*.
 *
 * - The predicative (P05 §2.1): a noun in the instrumental (*jest legendą*), an adjective in the
 *   nominative agreeing with the subject (*jest szczęśliwa*) — the instrumental under the generic *się*
 *   (*jest się szczęśliwym*).
 * - The object predicate: the verb's link + accusative (*przekształca kota w legendę*), else the
 *   instrumental (*czyni dom pięknym*); the essive *jako* + nominative (*używa kota jako narzędzie*,
 *   verify: *jako* agrees with the object's case in careful Polish).
 * - The role: *jako* + nominative (*działa jako przyjaciel*).
 * - An instrument that is an act: the adverbial participle (*wybierając słowo*), negated *nie
 *   wybierając słowa* (the privative) (verify: the concept level would be the verbal noun, which the
 *   lexicon lacks).
 * - `between` scopes over the group once, joined by *a*: *między domem a drzewem*.
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

/** The agreement a predicate adjective reads off the forms it is said of. */
function agreementOf(forms: Record<string, string>): Agr {
  if (forms['generic'] === '1') return { gender: 'masc', plural: false, virile: false, animate: true };
  return nounAgr(forms);
}

/** Each conjunct rendered, coordinated as the slot's conjunction says. */
function coordinated(c: ResolvedComplement, render: (np: ResolvedNounPhrase) => string): string {
  const word = COORD_WORDS[c.phrase.conjunction ?? 'and'];
  return joinConjuncts(c.phrase.conjuncts.map(render), ', ', () => ` ${word} `);
}

function complementText(type: ComplementType, c: ResolvedComplement, ctx: ComplementContext): string {
  const np0 = { subject: ctx.subject };
  const predicate = (np: ResolvedNounPhrase, controller: Record<string, string>, adjectiveCase: Case, nounCase: Case): string =>
    np.head.forms['role'] === 'adjective'
      ? [adjForm(np.head, adjectiveCase, agreementOf(controller)), np.standard ? standardText(np.head.forms, np.standard) : ''].filter(Boolean).join(' ')
      : nounPhrase(np, nounCase, np0);
  if (type === 'predicative') {
    const generic = ctx.subject['generic'] === '1';
    return coordinated(c, (np) => predicate(np, ctx.subject, generic ? 'ins' : 'nom', 'ins'));
  }
  if (type === 'objectPredicative') {
    const object = ctx.object ?? {};
    if (objectPredication(c) === 'essive') return coordinated(c, (np) => `jako ${predicate(withDefiniteness(np, 'bare'), object, 'nom', 'nom')}`);
    if (c.link) return coordinated(c, (np) => withPreposition(c.link!, predicate(np, object, 'acc', 'acc')));
    return coordinated(c, (np) => predicate(np, object, 'ins', 'ins'));
  }
  if (type === 'role') return coordinated(c, (np) => `jako ${predicate(withDefiniteness(np, 'bare'), ctx.subject, 'nom', 'nom')}`);
  if (type === 'instrumental' && c.action && abstractionLevel(c) !== 'object') {
    const privative = isPrivative(type, c);
    const verb = c.action.verb.forms;
    const participle = verb['adverbial'] ?? verb['base'] ?? '';
    const object = elementText(c.phrase, privative ? 'gen' : 'acc', np0);
    const adverbs = allAdverbs(c.action).map((a) => a.forms['base'] ?? '').filter(Boolean);
    return [privative ? NIE : '', participle, object, ...adverbs].filter(Boolean).join(' ');
  }
  const head = c.phrase.conjuncts[0]?.head.forms ?? {};
  const gov = complementGovernment(type, c, head, ctx.verb);
  const ctxNp = { ...np0, afterPrep: gov.prep !== '' };
  if (groupScopedRelation(type, c) && c.phrase.conjuncts.length > 1) {
    return withPreposition(gov.prep, joinConjuncts(c.phrase.conjuncts.map((np) => nounPhrase(np, gov.case, ctxNp)), ', ', () => ' a '));
  }
  const post = 'post' in gov && gov.post === true;
  return coordinated(c, (np) => {
    const text = nounPhrase(np, gov.case, ctxNp);
    return post ? `${text} ${gov.prep}` : withPreposition(gov.prep, text);
  });
}
