import type { LanguageColumn } from '../types.js';

export const RM_VALLADER_ADVERBS: LanguageColumn = {
  FAST: { base: 'svelt' },
  SLOWLY: { base: 'plan' },
  WELL: { base: 'bain' },
  TOGETHER: { base: 'insembel' },
  REPEATEDLY: { base: 'adüna darcheu' }, // (verify) or plüssas jadas
  AGAIN: { base: 'darcheu' },
  ONCE: { base: 'üna jada' },
  SUDDENLY: { base: 'dandet' }, // (verify) dandet / a l'improvis
  EXACTLY: { base: 'precis' },
  UP: { base: 'sü', subtype: 'direction' },
  DOWN: { base: 'giò', subtype: 'direction' },
  OUTSIDE: { base: 'oura', subtype: 'direction' },
  LEFT: { base: 'a schnestra', subtype: 'direction' },
  RIGHT: { base: 'a dretta', subtype: 'direction' },
  BACKWARDS: { base: 'inavo', subtype: 'direction' },
  EVERYWHERE: { base: 'dapertuot', subtype: 'place' },
  HERE: { base: 'qua', subtype: 'place' },
  THERE: { base: 'là', subtype: 'place' },
  FAR_AWAY: { base: 'dalöntsch', subtype: 'place' },
  NOW: { base: 'uossa' },
  TODAY: { base: 'hoz' },
  // not yet: nu … amo (verify).
  ALREADY: { base: 'fingià', subtype: 'frequency', negative: 'amo' },
  STILL: { base: 'amo', subtype: 'frequency' },
  RECENTLY: { base: 'dacurt' }, // (verify)
  LATER: { base: 'plü tard' },
  ALWAYS: { base: 'adüna', subtype: 'frequency' },
  OFTEN: { base: 'suvent', subtype: 'frequency' },
  NEVER: { base: 'mai', subtype: 'frequency', polarity: 'negative', interrogative: 'mai', fuses_with: 'AGAIN', fused: 'mai plü' },
  // no longer: nu … plü.
  NO_LONGER: { base: 'plü', subtype: 'frequency', polarity: 'negative' },
  JUST: { base: 'güsta', subtype: 'frequency' },
  // eir (also), neir (not … either).
  ALSO: { base: 'eir', subtype: 'frequency', negative: 'neir' },
  ONLY: { base: 'be', subtype: 'frequency' },
  REALLY: { base: 'propcha', subtype: 'frequency' }, // (verify) propcha / vairamaing
  MAYBE: { base: 'forsa', subtype: 'sentence', negative_slot: 'pre-negator' },
  PROBABLY: { base: 'probabelmaing', subtype: 'sentence', negative_slot: 'pre-negator' },
  ACTUALLY: { base: 'effectivamaing', subtype: 'sentence', negative_slot: 'pre-negator' }, // (verify)
  OF_COURSE: { base: 'natüralmaing', subtype: 'sentence', negative_slot: 'pre-negator' },
  // fich (very); tant (as much); by far: da lönch (verify).
  VERY: { base: 'fich', equative: 'tant', superlative: 'da lönch' },
  TOO: { base: 'massa' },
  A_LITTLE: { base: 'ün pa', drop_degrees: 'equally,most,least' },
};
