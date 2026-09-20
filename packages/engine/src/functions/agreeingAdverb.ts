import type { ConceptForms } from '../types.js';

/**
 * The masculine-singular adjective an "adverb" is really made of, or nothing if it is a true adverb.
 * Five languages say "together" with an invariant adverb (insieme / ensemble / zusammen / together /
 * 一緒に); Spanish and Portuguese say it with *juntos*, a predicative adjective agreeing with the
 * subject — "las gatas comen junt**as**" (A162). The lexeme keeps the citation form the picker shows
 * as `base` and carries the masculine singular of that adjective in `predicative`, so an engine with
 * adjective agreement runs it through its `agreeAdj` against the clause's subject and the other five
 * simply emit `base`. (A noun's `adjective` key is a different thing — the inherent adjective inside
 * a German name, "junge Frau".)
 *
 * The concept stays an adverb either way: what it modifies is the acting, not the actors.
 */
export function agreeingAdverb(a?: ConceptForms): string | undefined {
  return a?.forms['predicative'];
}
