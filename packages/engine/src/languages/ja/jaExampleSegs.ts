import type { ResolvedNounPhrase, RubySegment } from '../../types.js';
import { JA_EXAMPLES } from './ja.consts.js';
import { elSegs } from './elSegs.js';
import { wordSeg } from './wordSeg.js';

/**
 * The members of the head's set a noun phrase names (P09-E33), as the prenominal clause Japanese puts
 * them in: 猫**のような**動物 for *such as*, 猫**を含む**動物 for *including* — or nothing. Like an
 * attributive standard it leads the whole phrase, since it ends in a noun of its own and a prenominal
 * modifier takes the nearest noun after it: 猫のような大きい動物, 猫を含む私の動物.
 */
export function jaExampleSegs(np: ResolvedNounPhrase): RubySegment[] {
  const ex = np.examples;
  if (!ex) return [];
  return ex.relation === 'example'
    ? [...elSegs(ex.phrase), { t: JA_EXAMPLES.example }]
    : [...elSegs(ex.phrase), { t: 'を' }, wordSeg('含む', 'ふくむ')];
}
