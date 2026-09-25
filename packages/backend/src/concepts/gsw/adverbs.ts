import type { GswColumn } from './types.js';

export const GSW_ADVERBS: GswColumn = {
  FAST: { base: 'schnäll' },
  SLOWLY: { base: 'langsam' },
  WELL: { base: 'guet' },
  TOGETHER: { base: 'zäme' },
  REPEATEDLY: { base: 'widerholt' },
  AGAIN: { base: 'wider' }, // erneut is bookish; Zürich wider
  ONCE: { base: 'eimal' },
  SUDDENLY: { base: 'plötzlich' },
  EXACTLY: { base: 'genau' },
  UP: { base: 'ufe', subtype: 'direction' }, // nach oben → ufe
  DOWN: { base: 'abe', subtype: 'direction' }, // nach unten → abe
  OUTSIDE: { base: 'use', subtype: 'direction' }, // nach draussen → use
  LEFT: { base: 'nach links', subtype: 'direction' },
  RIGHT: { base: 'nach rächts', subtype: 'direction' },
  BACKWARDS: { base: 'hinderschi', subtype: 'direction' }, // rückwärts → hinderschi
  EVERYWHERE: { base: 'überall', subtype: 'place' },
  HERE: { base: 'da', subtype: 'place' },
  THERE: { base: 'det', subtype: 'place' },
  FAR_AWAY: { base: 'wiit ewegg', subtype: 'place' },
  NOW: { base: 'jetzt' },
  TODAY: { base: 'hüt' },
  ALREADY: { base: 'scho', subtype: 'frequency', negative: 'no', negative_slot: 'pre-negator' },
  STILL: { base: 'no', subtype: 'frequency', negative_slot: 'pre-negator' },
  RECENTLY: { base: 'chürzlich' },
  LATER: { base: 'spööter' },
  ALWAYS: { base: 'immer', subtype: 'frequency' },
  OFTEN: { base: 'oft', subtype: 'frequency' },
  NEVER: { base: 'nie', subtype: 'frequency', polarity: 'negative', interrogative: 'je' },
  NO_LONGER: { base: 'nüme', subtype: 'frequency', polarity: 'negative' }, // nicht mehr → nüme
  JUST: { base: 'grad', subtype: 'frequency' }, // soeben → grad
  ALSO: { base: 'au', subtype: 'frequency', negative_slot: 'pre-negator' },
  ONLY: { base: 'nur', subtype: 'frequency' },
  REALLY: { base: 'würklich', subtype: 'frequency' },
  MAYBE: { base: 'vilicht', subtype: 'sentence', negative_slot: 'pre-negator' },
  PROBABLY: { base: 'waarschiinlich', subtype: 'sentence', negative_slot: 'pre-negator' },
  ACTUALLY: { base: 'eigentlich', subtype: 'sentence', negative_slot: 'pre-negator' },
  OF_COURSE: { base: 'natürlich', subtype: 'sentence', negative_slot: 'pre-negator' },
  VERY: { base: 'sehr', comparative: 'vill', equative: 'genauso', superlative: 'bi wiitem' },
  TOO: { base: 'z', comparative: 'z vill' }, // (verify) z vs zu before an adjective
  A_LITTLE: { base: 'es bitzli', attributive: 'öppis', drop_degrees: 'equally,most,least' }, // ein bisschen → es bitzli
};
