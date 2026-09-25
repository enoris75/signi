import type { Translation } from '@signi/shared';
import { engines } from '../translator.consts.js';

/**
 * Render one examples relation into every language — the chip on the line to a noun's examples ring
 * (P09-E48, see UiStringExamplesDef): *such as* or *including*. Like a conjunction it is cited on
 * nothing; each engine spells the word its examples function writes.
 */
export function translateExamples(relation: 'example' | 'inclusion'): Translation[] {
  return engines.map((engine) => ({
    language: engine.language,
    text: engine.renderExamples?.(relation)?.trim() || '—',
  }));
}
