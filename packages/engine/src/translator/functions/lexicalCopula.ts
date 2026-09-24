import type { ComplementType } from '@signi/shared';
import type { ResolvedComplement, ResolvedNounElement, ResolvedPhrase, ResolvedVerbPhrase } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { firstConjunct } from '../../functions/firstConjunct.js';
import { genericWithoutDative } from '../../functions/genericWithoutDative.js';
import { resolve } from './resolve.js';
import { resolveNounElement } from './resolveNounElement.js';

/**
 * A copular clause whose predicate adjective names the verb it is said with (P09-E31). Well-being is
 * not BE + an adjective in most languages: it "il gatto **sta** bene", fr "le chat **va** bien", de
 * "dem Kater **geht** es gut". The adjective's lexeme names that verb as `copula` (a concept id, BE's
 * sense BE_FARING), and here it replaces BE, keeping the clause's tense, aspect, negation and modals
 * and the adjective as its predicative. A lexeme naming none keeps BE, as does a verb that is not the
 * copula ("sembra bene" is SEEM's).
 *
 * The adjective's lexeme may also name `experiencer` (C34's key, on the predicate here): German
 * *gehen* says the one who fares in the **dative**, with *es* as the grammatical subject. The subject
 * then becomes the `terminus`, the bare dative it already renders as, the subject slot takes the
 * neuter third person, and the clause is marked `dativeFront` for the German engine to put the dative
 * ahead of the verb. A generic subject has a dative only where its lexeme gives it one (see
 * `genericWithoutDative`): German *einem*, which takes the frame but not the front field, "es geht
 * einem gut" (A316). Where it has none it keeps the plain frame.
 */
export function lexicalCopula(phrase: ResolvedPhrase, language: string, lookup: LexiconLookup): ResolvedPhrase {
  const swapped = copulaSwap(phrase.verbPhrase, phrase.complements, language, lookup);
  if (!swapped) return phrase;
  const withVerb: ResolvedPhrase = { ...phrase, verbPhrase: swapped.verbPhrase };
  // An infinitive's subject is unspoken, so it has no one to put in the dative: "gut gehen".
  if (!swapped.experiencer || genericWithoutDative(phrase.subject) || swapped.verbPhrase.mood === 'infinitive') return withVerb;
  return {
    ...withVerb,
    subject: expletiveSubject(language, lookup),
    complements: { ...phrase.complements, terminus: { phrase: phrase.subject } },
    ...(phrase.subject.agreement['generic'] === '1' ? {} : { dativeFront: true }),
  };
}

/**
 * The verb a copular predicate names in BE's place (see `lexicalCopula`), and whether its lexeme asks
 * for the experiencer frame; `undefined` where BE stays. Shared with the relative clause.
 */
export function copulaSwap(
  vp: ResolvedVerbPhrase | undefined,
  complements: Partial<Record<ComplementType, ResolvedComplement>> | undefined,
  language: string,
  lookup: LexiconLookup,
): { verbPhrase: ResolvedVerbPhrase; experiencer: boolean } | undefined {
  const predicative = complements?.['predicative'];
  if (!vp || vp.verb.forms['copula'] !== '1' || !predicative) return undefined;
  const adjective = firstConjunct(predicative.phrase).head.forms;
  const id = adjective['copula'];
  if (!id || !lookup(id, language)) return undefined;
  const experiencer = adjective['experiencer'] === '1';
  const verb = resolve(id, language, lookup);
  // The experiencer is a bare dative whatever it names ("dem Haus geht es gut"), which the terminus
  // takes only for an animate noun unless the verb says so (`terminus_dative`).
  return {
    verbPhrase: { ...vp, verb: experiencer ? { ...verb, forms: { ...verb.forms, terminus_dative: '1' } } : verb },
    experiencer,
  };
}

/** The expletive subject of the experiencer frame: the neuter third person, German *es*. */
export function expletiveSubject(language: string, lookup: LexiconLookup): ResolvedNounElement {
  return resolveNounElement({ concept: 'THIRD_PERSON', gender: 'neut' }, language, lookup);
}
