import type { PronominalTable } from './pl.consts.js';

/**
 * The declined possessives (P05 §2.1): *mój, twój, swój* and the interrogative *czyj* write *j* before
 * a vowel ending and drop it before *i* (*mojego, moją* but *moim, moich, moi*); *nasz, wasz* decline
 * as hard adjectives with the virile *nasi, wasi*. *jego, jej, ich* do not decline and have no table.
 */
export function possessiveTable(word: 'mój' | 'twój' | 'swój' | 'czyj' | 'nasz' | 'wasz'): PronominalTable {
  if (word === 'nasz' || word === 'wasz') {
    const s = word;
    const v = `${word.slice(0, -2)}si`;
    return {
      nom: [s, `${s}a`, `${s}e`, v, `${s}e`],
      gen: [`${s}ego`, `${s}ej`, `${s}ego`, `${s}ych`, `${s}ych`],
      dat: [`${s}emu`, `${s}ej`, `${s}emu`, `${s}ym`, `${s}ym`],
      acc: [s, `${s}ą`, `${s}e`, `${s}ych`, `${s}e`],
      ins: [`${s}ym`, `${s}ą`, `${s}ym`, `${s}ymi`, `${s}ymi`],
      loc: [`${s}ym`, `${s}ej`, `${s}ym`, `${s}ych`, `${s}ych`],
    };
  }
  // The stem before j (moj-, twoj-, swoj-, czyj-) and before i (mo-, two-, swo-, czy-).
  const j = word === 'czyj' ? 'czyj' : `${word.slice(0, -2)}oj`;
  const i = j.slice(0, -1);
  return {
    nom: [word, `${j}a`, `${j}e`, `${i}i`, `${j}e`],
    gen: [`${j}ego`, `${j}ej`, `${j}ego`, `${i}ich`, `${i}ich`],
    dat: [`${j}emu`, `${j}ej`, `${j}emu`, `${i}im`, `${i}im`],
    acc: [word, `${j}ą`, `${j}e`, `${i}ich`, `${j}e`],
    ins: [`${i}im`, `${j}ą`, `${i}im`, `${i}imi`, `${i}imi`],
    loc: [`${i}im`, `${j}ej`, `${i}im`, `${i}ich`, `${i}ich`],
  };
}
