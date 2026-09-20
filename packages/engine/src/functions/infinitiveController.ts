import type { ResolvedPhrase } from '../types.js';

/**
 * The agreement features an infinitive complement's clause agrees in: its **controller**, the slot
 * of the governing clause its unspoken subject was taken from (see InfinitiveControl). A predicate
 * adjective inside the clause reads them — "la gatta desidera essere attent**a**" under subject
 * control, "indurre una casa a essere nascost**a**" under the object control a causative has.
 *
 * `subject` is the governing clause's own agreement as its engine computed it (Italian strips the
 * generic subject a citation carries), which is what subject control takes; only object control
 * looks elsewhere. A clause with no object to control it never resolves as object-controlled, so
 * the fallback here is defensive.
 */
export function infinitiveController(
  phrase: ResolvedPhrase,
  subject: Record<string, string>,
): Record<string, string> {
  return phrase.infinitiveComplement?.control === 'object' && phrase.directObject
    ? phrase.directObject.agreement
    : subject;
}
