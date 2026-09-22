import type { ResolvedNounPhrase, RubySegment } from '../../types.js';
import { numeralText } from '../../functions/numeralText.js';
import { CARDINALS } from './ja.consts.js';

/**
 * The counted phrase Japanese writes for a cardinal (see NounPhrase.numeral, C31). A numeral never
 * stands beside a noun on its own here: it takes a **counter**, and which counter is the noun's
 * business — 二**匹**の猫 for an animal, 二**軒**の家 for a house, 二**つ**の物体 for a thing,
 * 二**人**の人 for a person. The lexeme may name its own (`counter`); otherwise the noun's animacy
 * picks one, which is how Japanese classifies most of what a phrase counts.
 *
 * A time word is its own counter — 二十四**時間**, 七**日**, 十二**か月** — so the noun is not said
 * again and no の links anything (`counter_is_head`).
 *
 * No furigana is drawn over the compound: the readings of a numeral and its counter fuse
 * irregularly (一匹 *ippiki*, 三匹 *sanbiki*, 七日 *nanoka*), and a reading guessed from the parts
 * would be wrong more often than not. The kanji themselves are right, which is what is rendered.
 */
export function jaCounted(np: ResolvedNounPhrase): { segs: RubySegment[]; replacesHead: boolean } | undefined {
  const forms = np.head.forms;
  const numeral = numeralText(forms, CARDINALS);
  if (!numeral) return undefined;
  const counter = forms['counter'] ?? (forms['human'] === '1' ? '人' : forms['animate'] === '1' ? '匹' : 'つ');
  const head = forms['counter_is_head'] === '1';
  return {
    segs: head ? [{ t: `${numeral}${counter}` }] : [{ t: `${numeral}${counter}` }, { t: 'の' }],
    replacesHead: head,
  };
}
