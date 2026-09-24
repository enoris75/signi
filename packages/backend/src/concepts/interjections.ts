import type { ConceptSeed } from './types.js';

// The interjections (P09-E30): words outside the clause that open it and take no part in its
// grammar — "**hey**, the cat runs". One fixed word per language, set before the clause (and before a
// vocative) by `PhrasePlan.interjection`, with the separator the vocative takes. Spanish *oye* is the
// imperative of *oír* frozen into a call, Portuguese *ei* a fixed word; neither conjugates here.
// *Yes* and *no* are answers, not calls, and wait for the builder to say an answer (D2).
export const interjections: ConceptSeed[] = [
  {
    id: 'HEY',
    role: 'interjection',
    description: "a word said to catch someone's attention",
    emoji: '👋',
    forms: {
      en: { base: 'hey' },
      it: { base: 'ehi' },
      fr: { base: 'hé' },
      de: { base: 'hey' },
      es: { base: 'oye' },
      ja: { base: 'ねえ' },
      pt: { base: 'ei' },
    },
  },
];
