import type { Specifier, Translation } from '@signi/shared';
import { engines } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolve } from './resolve.js';

/**
 * Render one complement specifier into every language — the tooltips of the UI's spatial-relation
 * and cause-sentiment toolbars (see UiStringSpecifierDef). A specifier is not a word the plan
 * carries: it is a choice the engines *realise* as an adposition, and that adposition has no
 * citation form of its own. The Romance prepositions fuse with the article ("nella casa", "debajo
 * del árbol"), German marks the relation on the article's case, and Japanese wraps its noun in a
 * circumposition. So it is cited *with* a noun — `agreesWith`, the same device the determiner
 * labels use — held **bare**, so that no article comes with it and what is left is the adposition
 * alone.
 *
 * A language that puts the relation after its noun says so in the way its dictionaries do, with the
 * 〜 that stands for the noun (〜の下に). A language spelling nothing renders '' and is shown as an
 * em-dash, as the bare determiner is; none of the seven does today.
 */
export function translateSpecifier(
  specifier: Specifier,
  lookup: LexiconLookup,
  agreesWith = 'NOUN',
): Translation[] {
  return engines.map((engine) => {
    const noun = resolve(agreesWith, engine.language, lookup);
    // Bare and singular: an article would come along with the preposition it fuses to, and a
    // citation form is given in the singular — the same two choices `translateDeterminer` makes.
    noun.forms['definiteness'] = 'bare';
    noun.forms['number'] = 'singular';
    return {
      language: engine.language,
      text: engine.renderSpecifier?.(noun, specifier)?.trim() || '—',
    };
  });
}
