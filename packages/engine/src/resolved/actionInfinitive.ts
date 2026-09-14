import type { ResolvedVerbPhrase } from '../types.js';

/** The plain infinitive (citation form) of an instrument's action — the `concept` level's stem. */
export function actionInfinitive(action: ResolvedVerbPhrase): string {
  return action.verb.forms['base'] ?? '';
}
