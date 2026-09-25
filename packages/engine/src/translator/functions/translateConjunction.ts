import type { CoordConjunction, Translation } from '@signi/shared';
import { engines } from '../translator.consts.js';

/**
 * Render one coordinating conjunction into every language — the words of the UI's conjunction menu
 * (see UiStringConjunctionDef). A conjunction is the one function word that agrees with nothing, so
 * unlike a determiner it needs no noun to be cited on; what it does need is an engine, because no
 * lexicon holds it. Each engine spells its own set, and what counts as one word is a fact about the
 * language: `then` is a conjunction in none of them — it is a connective adverb, so it comes back
 * with the coordinator it leans on ("e poi", "und dann", そして).
 *
 * It is cited *between two clauses*, which is where the menu puts it: a period joined to a period.
 * Three of the six can also join two nouns, and Japanese writes those differently there (〜と, not
 * そして), which is why the position has to be fixed for the label to mean anything.
 *
 * `correlative` names the pair an "and" group of two may be spelled with instead ("both … and",
 * P09-E46): the label of the conjunction chip in that state.
 */
export function translateConjunction(conjunction: CoordConjunction, correlative?: boolean): Translation[] {
  return engines.map((engine) => ({
    language: engine.language,
    text: engine.renderConjunction?.(conjunction, { correlative })?.trim() || '—',
  }));
}
