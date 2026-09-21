import type { ConceptForms, RubySegment } from '../../types.js';
import { wordSeg } from './wordSeg.js';

// The あ-row kana a godan nai-stem ends on, and the お-row kana its volitional takes (わ → お: 買わない →
// 買おう).
const A_TO_O: Record<string, string> = {
  あ: 'お', か: 'こ', が: 'ご', さ: 'そ', ざ: 'ぞ', た: 'と', だ: 'ど', な: 'の', は: 'ほ', ば: 'ぼ', ぱ: 'ぽ',
  ま: 'も', や: 'よ', ら: 'ろ', わ: 'お',
};

/**
 * The volitional form of a verb (食べよう, 走ろう, しよう, 来よう), which the prenominal prospective
 * 〜ようとしている builds on (see `aspectVerbSegs`). It is derived from the seeded nai-form, whose stem
 * tells the verb classes apart where the dictionary form cannot (走る and 食べる both end in -る): a godan
 * nai-stem ends on an あ-row kana (走ら, 飲ま, 買わ), which moves to the お row and takes う (走ろう,
 * 飲もう, 買おう); any other stem — ichidan (食べ, 見), する (し), 来る (来, read こ) — takes よう
 * (食べよう, しよう, 来よう). The reading follows the same rule. Undefined when no nai-form is stored.
 */
export function volitionalSeg(verb: ConceptForms): RubySegment | undefined {
  const nai = verb.forms['nai'];
  if (!nai?.endsWith('ない') || nai.length < 3) return undefined;
  const naiReading = verb.forms['nai_reading'];
  const volitional = (n: string) => {
    const stem = n.slice(0, -2);
    const o = A_TO_O[stem.slice(-1)];
    return o ? `${stem.slice(0, -1)}${o}う` : `${stem}よう`;
  };
  return wordSeg(volitional(nai), naiReading?.endsWith('ない') ? volitional(naiReading) : undefined);
}
