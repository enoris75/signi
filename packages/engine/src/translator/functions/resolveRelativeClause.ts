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
 */
export function resolveRelativeClause(
  clause: RelativeClause,
  language: string,
  lookup: LexiconLookup,
): ResolvedRelativeClause {
  return {
    headRole: clause.headRole ?? 'subject',
    ...(clause.headSpecifiers?.length ? { headSpecifiers: clause.headSpecifiers } : {}),
    subject: clause.subject ? resolveNounElement(clause.subject, language, lookup) : undefined,
    // The head gapped as the direct object is the verb's object too ("il ragazzo che il gatto conosce").
    verbPhrase: resolveVerbPhrase(clause.verbPhrase, language, lookup, undefined, undefined, !!clause.directObject || clause.headRole === 'directObject'),
    directObject: clause.directObject ? resolveNounElement(clause.directObject, language, lookup) : undefined,
    complements: resolveComplements(clause.complements, language, lookup),
  };
}
