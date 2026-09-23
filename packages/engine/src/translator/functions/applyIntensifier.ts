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
 * may narrow the degrees with `comparative_degrees` (a comma list, `more,less` when absent). A248.
 *
 * The equative takes a word of its own the same way, the lexeme's `equative`, and that word
 * **replaces** the degree adverb rather than leading it: VERY is "just as" (en), *altrettanto* (it),
 * *tout aussi* (fr), *genauso* (de) — "just as big", never "very equally big" — and
 * `intensifier_equative` tells the degree-adverb builders to write none of their own (A255).
 *
 * Each word may name its own position and reading (`comparative_position`, `equative_reading`, …),
 * falling back to the lexeme's: pt TOO follows the positive (*grande demais*) but leads a
 * comparative (*demasiado maior*, A256).
 *
 * `drop_degrees` names the degrees the intensifier is not written on at all (a comma list): Spanish,
 * Portuguese and Japanese VERY on the equative, whose own word already is the exact one (A255).
 * `attributive_drop_degrees` drops it only before a noun (`attributive`): English has "just as big"
 * but no "a just as big cat".
 */
export function applyIntensifier(
  adjective: ConceptForms,
  id: string | undefined,
  language: string,
  lookup: LexiconLookup,
  attributive = false,
): void {
  if (!id) return;
  const word = resolve(id, language, lookup).forms;
  const base = word['base'];
  if (!base) return;
  const degree = adjDegree(adjective);
  const listed = (key: string) => (word[key] ?? '').split(',').includes(degree);
  if (listed('drop_degrees') || (attributive && listed('attributive_drop_degrees'))) return;
  const kind = degreeKind(degree, (word['comparative_degrees'] ?? 'more,less').split(','));
  const own = kind ? word[kind] : undefined;
  adjective.forms['intensifier'] = own ?? base;
  const position = (own && kind ? word[`${kind}_position`] : undefined) ?? word['position'] ?? 'pre';
  adjective.forms['intensifier_position'] = position;
  const reading = own && kind ? word[`${kind}_reading`] : word['reading'];
  if (reading) adjective.forms['intensifier_reading'] = reading;
  if (own && kind) adjective.forms[`intensifier_${kind}`] = '1';
}

/** Which of the lexeme's degree-specific words a degree reads, if any. */
function degreeKind(degree: string, comparativeDegrees: string[]): 'comparative' | 'equative' | undefined {
  if (comparativeDegrees.includes(degree)) return 'comparative';
  if (degree === 'equally') return 'equative';
  return undefined;
}
