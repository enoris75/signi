import type { LanguageEngine } from '../../types.js';

/** Catalan (P03-E1): registered, rendering nothing until the engine fork (P03-E4) replaces it. */
export const catalanEngine: LanguageEngine = {
  language: 'ca',
  render: () => '',
};
