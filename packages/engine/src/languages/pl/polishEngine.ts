import type { LanguageEngine } from '../../types.js';

/** Polish (P05-E1): registered, rendering nothing until the engine (P05-E7) replaces it. */
export const polishEngine: LanguageEngine = {
  language: 'pl',
  render: () => '',
};
