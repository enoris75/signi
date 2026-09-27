import type { LanguageColumn } from '../types.js';

// The adverbs (P04-E5), the Italian keys mirrored. Sursilvan forms adverbs of manner in -mein
// (exactamein). A negative-polarity adverb stands in the slot of buca or beside it: el vegn mai
// (never, no buca) but el vegn buca pli (no longer) — the engine's rule (P04-E11), recorded here
// only as data (verify both).
export const RM_SURSILV_ADVERBS: LanguageColumn = {
  FAST: { base: 'spert' },
  SLOWLY: { base: 'plaun' },
  WELL: { base: 'bein' },
  TOGETHER: { base: 'ensemen' },
  REPEATEDLY: { base: 'pliras gadas' },
  AGAIN: { base: 'puspei' },
  ONCE: { base: 'ina gada' },
  SUDDENLY: { base: 'tuttenina' }, // (verify)
  EXACTLY: { base: 'exactamein' },
  UP: { base: 'si', subtype: 'direction' },
  DOWN: { base: 'giu', subtype: 'direction' },
  OUTSIDE: { base: 'ora', subtype: 'direction' },
  LEFT: { base: 'a sanestra', subtype: 'direction' },
  RIGHT: { base: 'a dretga', subtype: 'direction' },
  BACKWARDS: { base: 'anavos', subtype: 'direction' },
  EVERYWHERE: { base: 'dapertut', subtype: 'place' },
  HERE: { base: 'cheu', subtype: 'place' },
  THERE: { base: 'leu', subtype: 'place' },
  FAR_AWAY: { base: 'lunsch', subtype: 'place' },
  NOW: { base: 'ussa' },
  TODAY: { base: 'oz' },
  // not yet: aunc buca.
  ALREADY: { base: 'gia', subtype: 'frequency', negative: 'aunc' },
  STILL: { base: 'aunc', subtype: 'frequency' },
  RECENTLY: { base: 'da cuort' }, // (verify)
  LATER: { base: 'pli tard' },
  ALWAYS: { base: 'adina', subtype: 'frequency' },
  OFTEN: { base: 'savens', subtype: 'frequency' },
  NEVER: { base: 'mai', subtype: 'frequency', polarity: 'negative', interrogative: 'mai', fuses_with: 'AGAIN', fused: 'mai pli' },
  NO_LONGER: { base: 'pli', subtype: 'frequency', polarity: 'negative' }, // with buca: buca pli
  JUST: { base: 'gest', subtype: 'frequency' },
  ALSO: { base: 'era', subtype: 'frequency', negative: 'gnanc' }, // (verify) gnanc vs era buca
  ONLY: { base: 'mo', subtype: 'frequency' },
  REALLY: { base: 'propi', subtype: 'frequency' },
  MAYBE: { base: 'forsa', subtype: 'sentence', negative_slot: 'pre-negator' },
  PROBABLY: { base: 'probablamein', subtype: 'sentence', negative_slot: 'pre-negator' },
  ACTUALLY: { base: 'atgnamein', subtype: 'sentence', negative_slot: 'pre-negator' },
  OF_COURSE: { base: 'natiralmein', subtype: 'sentence', negative_slot: 'pre-negator' },
  VERY: { base: 'fetg', equative: 'aschi', superlative: 'dalunsch' }, // (verify) equative and superlative
  TOO: { base: 'memia' },
  A_LITTLE: { base: 'empau', drop_degrees: 'equally,most,least' },
};
