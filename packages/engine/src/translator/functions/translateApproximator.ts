import type { Approximator, Translation } from '@signi/shared';
import { APPROXIMATOR_WORDS, engines } from '../translator.consts.js';

/**
 * Render one approximator into every language — the label of the determiner menu's approximator row
 * (see UiStringApproximatorDef, P09-E49): the word the sentence writes before the quantity, from the
 * same `APPROXIMATOR_WORDS` the translator reads. It is cited alone, so Spanish's *about*, which
 * agrees with its noun, is cited in the masculine (*unos*).
 */
export function translateApproximator(approximator: Approximator): Translation[] {
  return engines.map((engine) => {
    const words = APPROXIMATOR_WORDS[engine.language];
    const text = approximator === 'about' ? words?.about(false) : words?.almost;
    return { language: engine.language, text: text?.trim() || '—' };
  });
}
