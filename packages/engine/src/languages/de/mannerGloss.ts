import { firstConjunct, mannerRelation, type ResolvedNounElement } from '../../types.js';
import { elementPhrase } from './elementPhrase.js';

/**
 * A manner-definition gloss fragment ("mit hoher Geschwindigkeit", "auf eine gute Weise"): the
 * manner noun phrase in the case its `mannerRelation` governs — the same preposition + case the
 * `manner` complement chooses (mode "auf" + accusative, means/measure "mit" + dative, similative
 * "wie" + nominative). The element is single-conjunct (see `isMannerGloss`), so its head noun's
 * relation fixes the case for the whole fragment; `elementPhrase` supplies the determiner and
 * declines the adjective by that case, so the preposition leads bare — exactly as the dimension
 * gloss leads with a bare "von"/"bei". None of auf/mit/wie fuses with an article, and the authored
 * glosses are never definite, so no fusion is lost.
 */
export function mannerGloss(el: ResolvedNounElement): string {
  const rel = mannerRelation(firstConjunct(el).head.forms);
  const [prep, _case] =
    rel === 'mode' ? ['auf', 'acc'] as const :
    rel === 'means' || rel === 'measure' ? ['mit', 'dat'] as const :
    ['wie', 'nom'] as const;
  return `${prep} ${elementPhrase(el, _case)}`.trim();
}
