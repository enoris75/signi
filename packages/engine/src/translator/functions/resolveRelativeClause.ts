import type { RelativeClause } from '@signi/shared';
import type { ResolvedRelativeClause } from '../../types.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolveComplements } from './resolveComplements.js';
import { resolveNounElement } from './resolveNounElement.js';
import { resolveVerbPhrase } from './resolveVerbPhrase.js';

/**
 * Resolve a relative clause: its verb phrase, optional objects, and complements. The
 * gap slot named by `headRole` (default 'subject') is filled by the head noun above,
 * so it is absent from the clause's own fields; a non-subject relative carries its own
 * `subject`, which the engines use for agreement.
 *
 * `headForms` are the head noun's, passed down from `resolveNounPhrase`. They stand in for the
 * clause's subject where the gap IS the subject, which is what a `subject_sense` reads ("der Kater,
 * der die Maus frisst", A157).
 */
export function resolveRelativeClause(
  clause: RelativeClause,
  language: string,
  lookup: LexiconLookup,
  headForms?: Record<string, string>,
): ResolvedRelativeClause {
  const headRole = clause.headRole ?? 'subject';
  const subject = clause.subject ? resolveNounElement(clause.subject, language, lookup) : undefined;
  return {
    headRole,
    ...(clause.headSpecifiers?.length ? { headSpecifiers: clause.headSpecifiers } : {}),
    subject,
    // The head gapped as the direct object is the verb's object too ("il ragazzo che il gatto conosce").
    verbPhrase: resolveVerbPhrase(
      clause.verbPhrase, language, lookup, undefined, undefined,
      !!clause.directObject || headRole === 'directObject',
      headRole === 'subject' ? headForms : subject?.agreement,
    ),
    directObject: clause.directObject ? resolveNounElement(clause.directObject, language, lookup) : undefined,
    complements: resolveComplements(clause.complements, language, lookup),
  };
}
