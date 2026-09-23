import type { Subordinator, Translation } from '@signi/shared';
import { engines } from '../translator.consts.js';

/**
 * Render one subordinating word into every language — the entries of the builder's
 * subordinate-clause menu (P09-E12 D9, see UiStringSubordinatorDef): `that`, the complementizer of
 * an object clause, or a subordinating conjunction. Like a coordinating conjunction it agrees with
 * nothing, so it is cited on nothing; each engine spells its own, as its clauses do ("dopo che",
 * "parce que", "nachdem", 〜ので).
 */
export function translateSubordinator(sub: Subordinator): Translation[] {
  return engines.map((engine) => ({
    language: engine.language,
    text: engine.renderSubordinator?.(sub)?.trim() || '—',
  }));
}
