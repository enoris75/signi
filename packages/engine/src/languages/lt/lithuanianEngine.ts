import type { LanguageEngine } from '../../types.js';

/** Lithuanian (P18-E2): registered, rendering nothing until the engine fork (P18-E8) replaces it. */
export const lithuanianEngine: LanguageEngine = {
  language: 'lt',
  render: () => '',
};
