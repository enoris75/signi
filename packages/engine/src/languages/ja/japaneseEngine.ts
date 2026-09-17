import type { Definiteness } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase, RubySegment } from '../../types.js';
import { JA_DETERMINERS } from './ja.consts.js';
import { buildSegments } from './buildSegments.js';
import { possessiveJa } from '../../possessive.js';

export const japaneseEngine: LanguageEngine = {
  language: 'ja',
  terminator: '。',
  render(phrase: ResolvedPhrase): string {
    return buildSegments(phrase)
      .map((s) => s.t)
      .join('')
      .trim();
  },
  renderRuby(phrase: ResolvedPhrase): RubySegment[] {
    return buildSegments(phrase);
  },
  // A na-/no-adjective is seeded in its attributive form (慎重な, 単数の), where the marker links
  // it to the noun that follows. A word standing alone has no noun to link to, so the marker
  // goes — the same trim copulaSegs makes for a predicate adjective. An i-adjective keeps its
  // い, which is part of the word (若い).
  renderWord(word: ConceptForms): string {
    const f = word.forms;
    const base = f['base'] ?? '';
    if (f['role'] !== 'adjective') return base;
    return /[なの]$/.test(base) ? base.slice(0, -1) : base;
  },
  // Japanese writes no spaces: the words of a label run together (第二単数).
  wordJoiner: '',
  /**
   * The determiner alone, for the menu that picks one. Japanese spells no article at all —
   * identifiability is left to context — so the three article values render nothing and the menu
   * shows an em-dash for them; the demonstratives and the quantifiers are real words (the の
   * linking them to their noun is part of the attributive form, so it is kept). Nothing here
   * reaches sentence rendering: the ja engine still drops every determiner from a noun phrase.
   */
  renderDeterminer(noun: ConceptForms): string {
    return JA_DETERMINERS[(noun.forms['definiteness'] ?? 'definite') as Definiteness] ?? '';
  },
  // The possessive alone, for the label on a coreference link: the antecedent's pronoun + の
  // (彼の, 彼女の, 私たちの). Invariant of the possessed head, so the cited noun goes unread; the
  // furigana of the ruby segments are dropped — a label shows the written word.
  renderPossessive(_noun: ConceptForms, possessor: PronominalPossessor): string {
    return possessiveJa(possessor).map((seg) => seg.t).join('');
  },
};
