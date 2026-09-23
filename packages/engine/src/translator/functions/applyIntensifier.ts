import type { ConceptForms } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolve } from './resolve.js';

/**
 * Thread an adjective's intensifier onto its forms, the way the comparative degree is threaded
 * (see resolveNounPhrase): the intensifier is a concept of its own — VERY, TOO — so it is resolved
 * in this language like any other word, and what the engines need of it rides on the adjective they
 * are already holding.
 *
 * Three keys land there: `intensifier` (the word), `intensifier_reading` (its furigana, where the
 * language has one) and `intensifier_position` — `pre` (the default: "very big", "molto grande",
 * "sehr groß"), `post` (pt *grande demais*) or `suffix`, which is not a word standing anywhere but
 * an ending on the adjective's stem (ja 大きすぎる). A missing id, or one that resolves to nothing,
 * leaves the adjective untouched. Localization C33.
 *
 * A comparative is intensified by a word of its own, which the intensifier's lexeme names as
 * `comparative`: VERY is "much" on "bigger" and "less big", *bien* in French, *viel* in German,
 * *mucho* in Spanish, ずっと in Japanese. On a `more` or `less` degree (already threaded, so read
 * off the adjective) that word goes in place of `base`, and `intensifier_comparative` says so — the
 * Japanese engine drops もっと under it, as ずっと大きい already says "much bigger". A lexeme with
 * none (it *molto*, pt *muito*) keeps its base on a comparative too ("molto più grande"). A lexeme
 * may narrow the degrees with `comparative_degrees` (a comma list, `more,less` when absent):
 * Japanese names only `more`, since its lowered degree is a negation (それほど大きくない), not a
 * comparative ずっと could intensify. A248.
 */
export function applyIntensifier(
  adjective: ConceptForms,
  id: string | undefined,
  language: string,
  lookup: LexiconLookup,
): void {
  if (!id) return;
  const word = resolve(id, language, lookup).forms;
  const base = word['base'];
  if (!base) return;
  const degree = adjDegree(adjective);
  const degrees = (word['comparative_degrees'] ?? 'more,less').split(',');
  const comparative = degrees.includes(degree) ? word['comparative'] : undefined;
  adjective.forms['intensifier'] = comparative ?? base;
  adjective.forms['intensifier_position'] = word['position'] ?? 'pre';
  if (comparative) {
    adjective.forms['intensifier_comparative'] = '1';
    if (word['comparative_reading']) adjective.forms['intensifier_reading'] = word['comparative_reading'];
  } else if (word['reading']) adjective.forms['intensifier_reading'] = word['reading'];
}
