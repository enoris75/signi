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
 * How the count joins its noun is the lexeme's `counter_join`, one of three:
 *
 * - absent — the default: numeral + counter + **の** + noun, 二匹の猫, 二人の人.
 * - `'head'` — a time word is its own counter — 二十四**時間**, 七**日**, 十二**か月** — so the noun is
 *   not said again and no の links anything.
 * - `'compound'` — the count compounds straight onto the noun with no の, the way Japanese says how
 *   many siblings there are: 三人兄弟, 三人姉妹 (P11-E5). It is the lexeme's own word that compounds,
 *   so a head that has become another word keeps the の — the honorific (三人のご兄弟), an adjective
 *   fused into it (三人の兄) — and so does a head with an adjective between them (三人の大きい兄弟), and a
  count of one, which the compound cannot say (一人の兄弟, A331).
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
  const join = forms['counter_join'];
  const head = join === 'head';
  // The compound says how many siblings a family has, so it needs two at least: one sibling is
  // 一人の兄弟, never a 一人兄弟 (A331; an only child is 一人っ子).
  const compound = join === 'compound' && Number(forms['numeral']) > 1 && np.adjectives.length === 0 && isCitationWord(forms);
  return {
    segs: head || compound ? [{ t: `${numeral}${counter}` }] : [{ t: `${numeral}${counter}` }, { t: 'の' }],
    replacesHead: head,
  };
}

/**
 * Whether the head is still the lexeme's own citation word: not replaced by whose it is
 * (`honorific`, `possessed`, see `applyPossessorForm`) or by an adjective fused into it (`with_*`,
 * see `fuseAdjectives`). Each of those writes its word into `base` and leaves the column behind.
 */
function isCitationWord(forms: Record<string, string>): boolean {
  const base = forms['base'];
  return !Object.entries(forms).some(([key, word]) => word === base
    && (key === 'honorific' || key === 'plural_honorific' || key === 'possessed' || /^with_[A-Z_]+$/.test(key)));
}
