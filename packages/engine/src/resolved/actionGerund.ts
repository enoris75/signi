import type { ResolvedVerbPhrase } from '../types.js';

/**
 * The verb of an instrument's action, in the non-finite form the `process` level takes, plus its
 * adverb: the gerund in en/it/es/pt ("choosing", "scegliendo"), the te-form in ja. French has no
 * seeded gerund — its gérondif is built in-engine from the "nous" present stem — and German has
 * no gerund at all, so both build their own form; this is the shared lookup for the four that do.
 */
export function actionGerund(action: ResolvedVerbPhrase): string {
  return action.verb.forms['gerund'] ?? action.verb.forms['base'] ?? '';
}
