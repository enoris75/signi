import { JA_GODAN, JA_ICHIDAN, JA_SURU_ROW } from './ja.consts.js';
import type { JaVerbRow } from './ja.types.js';

/**
 * How a Japanese adjective inflects, read off its stored attributive form, with the stem each class
 * builds on (and the stem's reading, cut the same way):
 * - `i` — an i-adjective (大きい): the stem drops い (大き → 大きくない, 大きかった).
 * - `na` — a na-adjective (幸せな) or a noun linked by の (茶色の): the stem drops the な / の, and the
 *   copula does the inflecting (幸せです, 茶色ではない). `attributive` keeps the dropped particle.
 * - `ta` — a verb's past used attributively (疲れた, 孤立した): the stem is its te-form (疲れて), and the
 *   state it names is 〜ている (疲れています, 疲れていない).
 * - `ru` — a **verb** in its dictionary form standing where an adjective would: the 〜すぎる an
 *   intensifier builds (大きすぎる; see `jaComparisonAdj`, C33), or a lexeme whose word is a verb
 *   (`ja_verbal`: 起こり得る, DIFFERENT's 違う). The stem drops the last kana, and `verb` is the row of
 *   kana each ending builds on (see `JaVerbRow`): an ichidan verb's is empty (大きすぎます, 大きすぎない),
 *   a godan verb's its own (違います, 違わない, 違った, 違って; localization B87). Nothing in the surface
 *   says a word is a verb — a stored adjective may well end in る — so the caller asks for it with
 *   `verbal`. A final する is the noun + する verb, which conjugates する on the noun (REAL_EXISTING's
 *   実在する → 実在します, 実在しない); any other final る is taken as ichidan, as every る-verb the
 *   corpus has is; any other final kana is godan.
 * A base with none of these endings is taken as a na-adjective with nothing to drop.
 *
 * `relational` marks the の-adjective whose stem names *another thing* — a country, for AMERICAN's
 * アメリカの — rather than a property of the subject. Dropping its の before the copula would say the
 * subject IS that thing (猫はアメリカです, "the cat is America"), so the particle stays: 猫はアメリカのです
 * (A246). It comes back as `predicative`, the particle the copula keeps in front of it; a colour
 * (茶色の) drops it as before, and the flag never touches the attributive form (アメリカの猫 either way).
 */
export function jaAdjClass(
  base: string,
  reading?: string,
  relational = false,
  verbal = false,
): { kind: 'i' | 'na' | 'ta' | 'ru'; stem: string; reading?: string; attributive: string; predicative: string; verb?: JaVerbRow } {
  const cut = (s: string | undefined, add = '') => (s === undefined ? undefined : `${s.slice(0, -1)}${add}`);
  const last = base.slice(-1);
  if (verbal && base.endsWith('する')) {
    const drop = (s: string | undefined) => (s?.endsWith('する') ? s.slice(0, -2) : undefined);
    return { kind: 'ru', stem: base.slice(0, -2), reading: drop(reading), attributive: '', predicative: '', verb: JA_SURU_ROW };
  }
  if (verbal) {
    return { kind: 'ru', stem: base.slice(0, -1), reading: cut(reading), attributive: '', predicative: '', verb: JA_GODAN[last] ?? JA_ICHIDAN };
  }
  if (last === 'い') return { kind: 'i', stem: base.slice(0, -1), reading: cut(reading), attributive: '', predicative: '' };
  if (last === 'た') return { kind: 'ta', stem: `${base.slice(0, -1)}て`, reading: cut(reading, 'て'), attributive: '', predicative: '' };
  if (last === 'だ') return { kind: 'ta', stem: `${base.slice(0, -1)}で`, reading: cut(reading, 'で'), attributive: '', predicative: '' };
  if (last === 'な' || last === 'の') {
    return { kind: 'na', stem: base.slice(0, -1), reading: cut(reading), attributive: last, predicative: relational && last === 'の' ? 'の' : '' };
  }
  return { kind: 'na', stem: base, reading, attributive: '', predicative: '' };
}
