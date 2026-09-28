import type { LanguageColumn } from '../types.js';

// The adverbs (P18-E7, style-lt.md § Adverbs), keyed as Polish's one for one: `subtype`, `polarity`,
// `negative`, `negative_slot`, `interrogative`, `fuses_with`/`fused`, `negator_lead`, `fronted`, the
// degree words and `drop_degrees`, the word in Lithuanian. The manner adverbs with a synthetic
// comparative also store it and its superlative (*greičiau, greičiausiai*). A fixed phrase is stored
// whole (*į lauką*, *ką tik*). Every form is (verify) until the native review (P18-E12); the ones marked
// are the least sure.
export const LT_ADVERBS: LanguageColumn = {
  FAST: { base: 'greitai', comparative: 'greičiau', superlative: 'greičiausiai' },
  SLOWLY: { base: 'lėtai', comparative: 'lėčiau', superlative: 'lėčiausiai' },
  // *gerai* is also OKAY's word (*viskas gerai*).
  WELL: { base: 'gerai', comparative: 'geriau', superlative: 'geriausiai' },
  TOGETHER: { base: 'kartu' },
  REPEATEDLY: { base: 'pakartotinai' },
  AGAIN: { base: 'vėl' },
  ONCE: { base: 'vieną kartą' }, // (verify) against the bare *kartą*, which also reads "once upon a time"
  SUDDENLY: { base: 'staiga' },
  EXACTLY: { base: 'tiksliai' },
  UP: { base: 'aukštyn', subtype: 'direction' },
  DOWN: { base: 'žemyn', subtype: 'direction' },
  OUTSIDE: { base: 'į lauką', subtype: 'direction' }, // (verify) against *laukan*
  LEFT: { base: 'į kairę', subtype: 'direction' },
  RIGHT: { base: 'į dešinę', subtype: 'direction' },
  BACKWARDS: { base: 'atgal', subtype: 'direction' },
  EVERYWHERE: { base: 'visur', subtype: 'place' },
  HERE: { base: 'čia', subtype: 'place' },
  THERE: { base: 'ten', subtype: 'place' },
  FAR_AWAY: { base: 'toli', subtype: 'place' },
  NOW: { base: 'dabar' },
  TODAY: { base: 'šiandien' },
  // *dar nesuvalgė*: the negated *jau* is *dar*, before the negated verb.
  ALREADY: { base: 'jau', subtype: 'frequency', negative: 'dar', negative_slot: 'pre-negator' },
  STILL: { base: 'vis dar', subtype: 'frequency' },
  RECENTLY: { base: 'neseniai' },
  LATER: { base: 'vėliau' },
  ALWAYS: { base: 'visada', subtype: 'frequency' },
  OFTEN: { base: 'dažnai', subtype: 'frequency' },
  // *niekada* is negative, and takes *ne-* on the verb (negative concord: *niekada nevalgo*); in a
  // question it is *kada nors* (*Ar kada nors buvai Romoje?*); with AGAIN, *daugiau niekada* (verify).
  NEVER: {
    base: 'niekada', subtype: 'frequency', polarity: 'negative', interrogative: 'kada nors', fuses_with: 'AGAIN', fused: 'daugiau niekada',
  },
  // *jau nevalgo*: *jau* before the negated verb, as Polish *już nie* (`negator_lead`). The tighter
  // Lithuanian is the prefix *nebe-* (*nebevalgo*), written together with the verb; it needs an engine
  // key of its own (the negator *nebe* in place of *ne*), so it is left to the engine lane (verify).
  NO_LONGER: { base: 'jau ne', subtype: 'frequency', polarity: 'negative', negator_lead: 'jau' },
  // *ką tik suvalgė*, "has just eaten".
  JUST: { base: 'ką tik', subtype: 'frequency' },
  // Lithuanian keeps *taip pat* under negation, before the negated verb (*katė taip pat nevalgo*), as
  // Polish *też nie* (verify: against *irgi*).
  ALSO: { base: 'taip pat', subtype: 'frequency', negative: 'taip pat', negative_slot: 'pre-negator' },
  ONLY: { base: 'tik', subtype: 'frequency' },
  REALLY: { base: 'tikrai', subtype: 'frequency' },
  MAYBE: { base: 'galbūt', subtype: 'sentence', negative_slot: 'pre-negator' },
  PROBABLY: { base: 'tikriausiai', subtype: 'sentence', negative_slot: 'pre-negator' },
  // Parenthetical words, set off by a comma when fronted (*Žinoma, katė valgo*).
  ACTUALLY: { base: 'iš tikrųjų', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' }, // (verify) against *iš tiesų*
  OF_COURSE: { base: 'žinoma', subtype: 'sentence', negative_slot: 'pre-negator', fronted: 'comma' },
  // *daug didesnis*, *lygiai taip pat didelis*, *neabejotinai didžiausias* (verify the equative and
  // superlative).
  VERY: { base: 'labai', comparative: 'daug', equative: 'lygiai taip pat', superlative: 'neabejotinai' },
  TOO: { base: 'per' },
  A_LITTLE: { base: 'truputį', drop_degrees: 'equally,most,least' },
};
