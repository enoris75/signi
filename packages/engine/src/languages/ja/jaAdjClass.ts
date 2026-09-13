/**
 * How a Japanese adjective inflects, read off its stored attributive form, with the stem each class
 * builds on (and the stem's reading, cut the same way):
 * - `i` — an i-adjective (大きい): the stem drops い (大き → 大きくない, 大きかった).
 * - `na` — a na-adjective (幸せな) or a noun linked by の (茶色の): the stem drops the な / の, and the
 *   copula does the inflecting (幸せです, 茶色ではない). `attributive` keeps the dropped particle.
 * - `ta` — a verb's past used attributively (疲れた, 孤立した): the stem is its te-form (疲れて), and the
 *   state it names is 〜ている (疲れています, 疲れていない).
 * A base with none of these endings is taken as a na-adjective with nothing to drop.
 */
export function jaAdjClass(base: string, reading?: string): { kind: 'i' | 'na' | 'ta'; stem: string; reading?: string; attributive: string } {
  const cut = (s: string | undefined, add = '') => (s === undefined ? undefined : `${s.slice(0, -1)}${add}`);
  const last = base.slice(-1);
  if (last === 'い') return { kind: 'i', stem: base.slice(0, -1), reading: cut(reading), attributive: '' };
  if (last === 'た') return { kind: 'ta', stem: `${base.slice(0, -1)}て`, reading: cut(reading, 'て'), attributive: '' };
  if (last === 'だ') return { kind: 'ta', stem: `${base.slice(0, -1)}で`, reading: cut(reading, 'で'), attributive: '' };
  if (last === 'な' || last === 'の') return { kind: 'na', stem: base.slice(0, -1), reading: cut(reading), attributive: last };
  return { kind: 'na', stem: base, reading, attributive: '' };
}
