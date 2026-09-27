import type { LanguageColumn } from '../types.js';

export const RM_RUMGR_ADVERBS: LanguageColumn = {
  FAST: { base: 'spert' },
  SLOWLY: { base: 'plaun' },
  WELL: { base: 'bain' },
  TOGETHER: { base: 'ensemen' },
  REPEATEDLY: { base: 'repetidamain' }, // (verify)
  AGAIN: { base: 'puspè' },
  ONCE: { base: 'ina giada' },
  SUDDENLY: { base: 'tuttenina' },
  EXACTLY: { base: 'exactamain' },
  UP: { base: 'ensi', subtype: 'direction' },
  DOWN: { base: 'engiu', subtype: 'direction' },
  OUTSIDE: { base: 'ora', subtype: 'direction' },
  LEFT: { base: 'a sanestra', subtype: 'direction' },
  RIGHT: { base: 'a dretga', subtype: 'direction' },
  BACKWARDS: { base: 'enavos', subtype: 'direction' },
  EVERYWHERE: { base: 'dapertut', subtype: 'place' },
  HERE: { base: 'qua', subtype: 'place' },
  THERE: { base: 'là', subtype: 'place' },
  FAR_AWAY: { base: 'lunsch', subtype: 'place' },
  NOW: { base: 'ussa' },
  TODAY: { base: 'oz' },
  // Negated, "not yet" is *anc betg*: the engine keeps *betg* and puts *anc* for *gia* (verify).
  ALREADY: { base: 'gia', subtype: 'frequency', negative: 'anc' },
  STILL: { base: 'anc', subtype: 'frequency' },
  RECENTLY: { base: 'dacurt' },
  LATER: { base: 'pli tard' },
  ALWAYS: { base: 'adina', subtype: 'frequency' },
  OFTEN: { base: 'savens', subtype: 'frequency' },
  // *mai* takes *betg*'s place after the verb: *el na vegn mai* (P04 §2.2, verify).
  NEVER: { base: 'mai', subtype: 'frequency', polarity: 'negative', interrogative: 'mai', fuses_with: 'AGAIN', fused: 'mai pli' },
  // Unlike *mai*, *pli* follows *betg* rather than replacing it: *el na vegn betg pli* (verify).
  NO_LONGER: { base: 'pli', subtype: 'frequency', polarity: 'negative' },
  JUST: { base: 'gist', subtype: 'frequency' },
  ALSO: { base: 'era', subtype: 'frequency', negative: 'gnanc' },
  ONLY: { base: 'mo', subtype: 'frequency' },
  REALLY: { base: 'propi', subtype: 'frequency' },
  MAYBE: { base: 'forsa', subtype: 'sentence', negative_slot: 'pre-negator' },
  PROBABLY: { base: 'probablamain', subtype: 'sentence', negative_slot: 'pre-negator' },
  ACTUALLY: { base: 'en realitad', subtype: 'sentence', negative_slot: 'pre-negator' }, // (verify)
  OF_COURSE: { base: 'natiralmain', subtype: 'sentence', negative_slot: 'pre-negator' },
  // equative *tuttina* (verify), superlative *da lunsch* (verify).
  VERY: { base: 'fitg', equative: 'tuttina', superlative: 'da lunsch' },
  TOO: { base: 'memia' },
  A_LITTLE: { base: 'in pau', drop_degrees: 'equally,most,least' },
};
