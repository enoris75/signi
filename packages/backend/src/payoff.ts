import type { PhrasePlan } from '@signi/shared';

// The app's payoff/tagline, expressed as a Signi period so the engine renders it in every
// language rather than a hardcoded string. Sourced from the "semantic phrase creator"
// selection: subject CREATOR (masc, bare) + an attributive noun-modifier PHRASE (material
// relation, plural) carrying its own adjective SEMANTIC. Renders e.g. en "semantic phrase
// creator", it "creatore di frasi semantiche", ja "意味的なフレーズの創造者".
//
// This is the single source of truth for the tagline; edit it here to change the payoff in
// all seven languages at once. Served (translated) by GET /api/payoff.
export const PAYOFF_PLAN: PhrasePlan = {
  subject: {
    concept: 'CREATOR',
    gender: 'masc',
    definiteness: 'bare',
    adjectives: [],
    nounModifiers: [
      { concept: 'PHRASE', relation: 'material', number: 'plural', adjectives: ['SEMANTIC'] },
    ],
  },
} as PhrasePlan;
