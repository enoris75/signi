import type { CoordConjunction, Definiteness, Degree, Specifier } from '@signi/shared';
import type { ConceptForms, LanguageEngine, PronominalPossessor, ResolvedPhrase, RubySegment } from '../../types.js';
import { CAUSE_PARTICLE, COORD_WORDS, JA_DEGREE, JA_DETERMINERS, PATH_CITATION } from './ja.consts.js';
import { JA_TEMPORAL } from './ja.consts.js';
import { isLoweredDegree } from './isLoweredDegree.js';
import { buildSegments } from './buildSegments.js';
import { possessiveJa } from '../../possessive.js';
import type { Subordinator } from '@signi/shared';
import { JA_SUBORDINATORS } from './ja.consts.js';

export const japaneseEngine: LanguageEngine = {
  language: 'ja',
  terminator: '。',
  // The full-width question mark, after the か that already makes the sentence a question — the
  // closing a dialog writes (削除しますか？), where running prose would keep 。.
  questionMark: '？',
  // The vocative is set off by the reading comma, with no particle (P11-E3): お母さん、走ってください。
  addressSeparator: '、',
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
  // The word that closes a subordinate clause, for the builder's subordinate-clause menu (P09-E12
  // D9). Japanese postposes it, so it is written with the 〜 that stands for the clause, as a
  // dictionary writes a bound form: the quotative 〜と of a reported clause, 〜時に, 〜ので. 後で follows
  // the plain past, which the citation keeps (〜た後で).
  renderSubordinator(sub: Subordinator): string {
    if (sub === 'that') return '〜と';
    return sub === 'after' ? `〜た${JA_SUBORDINATORS[sub].word}`
      : JA_SUBORDINATORS[sub].te ? `〜て${JA_SUBORDINATORS[sub].word}`
      : `〜${JA_SUBORDINATORS[sub].word}`;
  },
  // The connective adverb Japanese writes between two clauses (そして, しかし, つまり). It follows the
  // first clause's 、 in a sentence; standing alone as a menu entry it is the word itself.
  renderConjunction(conjunction: CoordConjunction): string {
    return COORD_WORDS[conjunction];
  },
  /**
   * Japanese puts its spatial relation **after** the noun, as a relational noun plus a particle
   * (ベッドの下に, "under the bed"), and the neutral relations are a bare particle (家に, 市場を). None
   * of that can lead a label, so it is written the way a Japanese dictionary writes a bound form:
   * with the 〜 that stands for the noun it attaches to — 〜の下で, 〜のために.
   *
   * The two relations a clause leaves to the particle alone are named in full here, or containment
   * and traversal would both come back as 〜で (see `PATH_CITATION`). The place particle で is the one
   * cited: the chip names a relation, and a relation is what a place states.
   */
  renderSpecifier(_noun: ConceptForms, specifier: Specifier): string {
    if (specifier.kind === 'sentiment') return `〜${CAUSE_PARTICLE[specifier.value]}`;
    // The temporal's relation (P09-E12b): its relational noun and particle after the 〜 that stands
    // for the time — 〜に, 〜前に, 〜まで, 〜の後に, 〜の前に, 〜の間に.
    if (specifier.kind === 'temporal') {
      const { noun, particle } = JA_TEMPORAL[specifier.value];
      return `〜${noun}${particle}`;
    }
    return specifier.kind === 'path' ? `〜${PATH_CITATION[specifier.value]}` : '';
  },
  /**
   * Japanese compares with a prenominal adverb and leaves the adjective alone (もっと大きい,
   * 最も大きい), so the degree is a word of its own and the cited adjective goes unread — except
   * that the **lowered** degrees are a circumfix: the adverb opens them and the adjective's own
   * negation closes them (それほど大きくない, 最も大きくない). Naming only the adverb would give 最も
   * for both `most` and `least`, so the lowered ones are cited whole, with the 〜 that stands for
   * the adjective, the way `renderSpecifier` cites a postposition.
   */
  renderDegree(adjective: ConceptForms, degree: Degree): string {
    const word = JA_DEGREE[degree];
    return word && isLoweredDegree({ ...adjective, forms: { ...adjective.forms, degree } })
      ? `${word}〜ない`
      : word;
  },
};
