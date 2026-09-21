import type { Degree, Translation } from '@signi/shared';
import { engines } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolve } from './resolve.js';

/**
 * Render one comparative degree into every language — the label on the UI's degree chip (see
 * UiStringDegreeDef). A degree is not a word either: three of the seven languages spell it as one
 * ("più", "más", もっと), German remakes the adjective instead ("größer", "am größten"), and English
 * does both depending on which adjective it is comparing ("bigger", but "more beautiful"). That
 * last is why this is cited rather than looked up: it is cited *on an adjective* — `agreesWith`,
 * the same device the determiner and possessive labels use on a noun — and each engine returns what
 * the degree actually added to it.
 *
 * `positive` adds nothing in any of the seven: it is the plain, unmarked form. It renders '' and is
 * shown as an em-dash, the same "no word goes here" the bare determiner means — and the same
 * em-dash the chip already showed for it.
 */
export function translateDegree(
  degree: Degree,
  lookup: LexiconLookup,
  agreesWith = 'BIG',
): Translation[] {
  return engines.map((engine) => {
    const adjective = resolve(agreesWith, engine.language, lookup);
    return {
      language: engine.language,
      text: engine.renderDegree?.(adjective, degree)?.trim() || '—',
    };
  });
}
