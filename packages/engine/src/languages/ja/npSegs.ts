import type { Definiteness } from '@signi/shared';
import { isQuestionPossessor } from '../../functions/questionPossessor.js';
import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase, RubySegment } from '../../types.js';
import { isBoundPossessor } from '../../functions/boundPossessor.js';
import { possessorBound } from '../../functions/possessorBound.js';
import { possessiveJa } from '../../possessive.js';
import { JA_ENOUGH_OF_COUNT, JA_NEGATIVE_DETERMINER, JA_PRENOMINAL_DET } from './ja.consts.js';
import { jaCounted } from './jaCounted.js';
import { attributiveStandard } from '../../functions/attributiveStandard.js';
import { jaDegreeSegs } from './jaDegreeSegs.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
import { JA_REFLEXIVE_POSSESSOR } from './reflexivePossessor.js';
import { relativeClauseSegs } from './relativeClauseSegs.js';
import { wordSeg } from './wordSeg.js';

/**
 * Segments for a noun phrase: [relative clause] [adjectives] noun. Japanese does not put
 * spaces between words, so stacked adjectives run straight into each other and into the head
 * ("大きい小さい猫"); each one's own attributive marker (な / の) is what keeps them apart.
 * Any relative clause is prepended (see `relativeClauseSegs`).
 */
export function npSegs(np: ResolvedNounPhrase): RubySegment[] {
  const core: RubySegment[] = [];
  // Japanese spells no article, but the demonstratives and quantifiers are real prenominal words
  // (この / すべての …) that render in a sentence; their の is part of the value, so they need no
  // extra particle. The `no` quantifier is a circumfix — its prenominal どの is this segment, its も
  // closes the group with its case particle (see `jaParticleSegs`), and its clause-final ない is the
  // predicate's job (see predicateSegs / mannerGlossSegs).
  //
  // The determiner goes *after* the possessor, not at the head of the phrase (A185). A prenominal
  // determiner modifies the nearest noun after it, so この猫の本 is "this cat's book" and 多くの猫の本
  // is "many cats' books"; the head's own determiner belongs behind the possessor's の — 猫のこの本,
  // 猫の多くの本, 猫のどの本も.
  // A **pronoun** head takes no prenominal determiner: この彼 is not Japanese, and neither is どの何 —
  // the negative indefinite pronoun writes 何 and lets the circumfix's も close it (何も, C32).
  const pronounHead = !!np.head.forms['person'];
  const definiteness = (np.head.forms['definiteness'] ?? 'definite') as Definiteness;
  // "Enough" of a count noun is enough *of a number* of it, 十分な数の猫; 十分な猫 would be a
  // satisfactory cat. A mass noun takes 十分な directly: 十分な食べ物 (P09-E25).
  const prenominalDet = pronounHead ? undefined
    : definiteness === 'enough' && np.head.forms['uncountable'] !== '1' ? JA_ENOUGH_OF_COUNT
    : JA_PRENOMINAL_DET[definiteness];
  const detSegs: RubySegment[] =
    prenominalDet ? [{ t: prenominalDet }]
    : !pronounHead && definiteness === 'no' ? [{ t: JA_NEGATIVE_DETERMINER.pre }]
    : [];
  // A possessor is prenominal, marked by の ("猫の本"); recursing handles its own
  // adjectives / nested possessor / relative clause ("子供の猫の本"). A pronominal possessor
  // ("彼の犬") is the antecedent pronoun + の, invariant of the possessed head.
  //
  // OWN is the one adjective that touches the possessor (C37). Japanese does not add 自分の to a
  // possessive pronoun, it says it **in place of** one — 自分の猫, never 彼の自分の猫 — so a
  // pronominal possessor is dropped here and the adjective below is the whole of it. A genitive
  // possessor is still said, and OWN follows it as 自身の: 猫自身の本.
  //
  // A possessor that is the clause's own subject (P11-E2) is 自分 whether or not OWN is there: 猫は自分
  // の本を見ます. It is the named owner OWN follows, so the emphasis on top of it is 自分自身の.
  const own = possessorBound(np);
  const reflexive = isBoundPossessor(np.possessor);
  const ownReplacesPossessor = !!own && !!np.possessor && isPronominalPossessor(np.possessor) && !reflexive;
  // 母 already means "my mother" (see `applyPossessorForm`, P11 D4), so 私の in front of it says 私
  // twice: 母は走ります, 私は妻を愛しています. The drop is for the 1st person **singular** only — 私たちの
  // adds that the relative is shared — and only before one's own kin noun: 私の本 keeps its 私の.
  const ownKin = np.head.forms['own'] === '1';
  const redundantPossessive = ownKin && !!np.possessor && isPronominalPossessor(np.possessor)
    && np.possessor.person === '1' && np.possessor.number === 'singular';
  if (reflexive) {
    core.push(JA_REFLEXIVE_POSSESSOR, ...(own ? [] : [{ t: 'の' }]));
  } else if (np.possessor && !ownReplacesPossessor && !redundantPossessive) {
    core.push(
      ...(isPronominalPossessor(np.possessor)
        ? possessiveJa(np.possessor)
        // A `no` possessor writes only its どの here: its も closes the whole phrase, where the phrase's
        // particle goes (どの猫の本も, see `isNegativeGroup` and `jaParticleSegs`; A216).
        // OWN's 自身の carries the の itself, so the possessor before it writes none (猫自身の本).
        // A possessor question's stand-in is 誰, joined with の as any owner is: 誰の猫 (P09-E14).
        : [...(isQuestionPossessor(np.possessor) ? [wordSeg('誰', 'だれ')] : npSegs(np.possessor)), ...(own ? [] : [{ t: 'の' }])]),
    );
  }
  core.push(...detSegs);
  // Attributive nouns ("sail boat") are also の-linked in Japanese (ガラスのコップ); the
  // relation is neutralised, so every relation renders the same の. The modifier's own
  // adjectives are bare (Japanese adjectives don't agree) and precede it (意味的なフレーズ
  // の創造者 = "semantic phrase creator").
  for (const m of np.nounModifiers) {
    const base = m.concept.forms['base'];
    if (!base) continue;
    for (const a of m.adjectives) {
      const ab = a.forms['base'] ?? '';
      if (ab) core.push(wordSeg(ab, a.forms['reading']));
    }
    core.push(wordSeg(base, m.concept.forms['reading']), { t: 'の' });
  }
  const adjSegs: RubySegment[] = [];
  // The one adjective with a standard of comparison (P09-E18), which leads the whole phrase.
  const comparedSegs: RubySegment[] = [];
  for (const a of np.adjectives) {
    // OWN after a genitive possessor is 自身の, the word Japanese uses when the owner has been
    // named ("猫自身の本"); standing for the possessor it is 自分の, which the base already is.
    if (a === own && !ownReplacesPossessor && np.possessor) {
      const after = a.forms['after_possessor'];
      if (after) { adjSegs.push(wordSeg(after, a.forms['after_possessor_reading'])); continue; }
    }
    // The lowered degrees negate the adjective (大きい → 大きくない); an intensifier's 〜すぎる is
    // already built into the base here (大きすぎる猫), and every other case keeps it.
    const { base, reading } = jaComparisonAdj(a);
    if (!base) continue;
    // Prenominal intensifier and degree adverb, bound directly to the adjective (とても大きい), no
    // space; a comparative intensifier stands in for もっと (ずっと大きい, A248). A suffix intensifier
    // writes no word here — the base above carries it (C33).
    //
    // The one adjective with a standard of comparison has the standard lead them, in the adverb's
    // place — 犬より大きい猫 (P09-E18), exactly as a predicate adjective does (see `jaDegreeSegs`) —
    // and it moves to the **front of the phrase**, ahead of the relative clause, the possessor, the
    // determiner and the other adjectives. A prenominal modifier modifies the nearest noun after it,
    // and the standard ends in one: 茶色の犬より大きい猫 is "bigger than the brown dog", この犬より is
    // "than this dog", 女の犬より "than the woman's dog". In front, the standard's noun has nothing
    // before it to take: 犬より大きい茶色の猫, 犬より大きいこの猫, 犬より大きい女の猫.
    const standard = attributiveStandard(np, a);
    (standard ? comparedSegs : adjSegs).push(...jaDegreeSegs(a, standard), wordSeg(base, reading));
  }
  const head = np.head.forms;
  // A cardinal is written with the counter its noun chooses, ahead of the adjectives (二匹の大きい猫);
  // a time word IS its counter and is not said again (二十四時間). See `jaCounted`, C31.
  const counted = jaCounted(np);
  if (counted) core.push(...counted.segs);
  core.push(...adjSegs);
  // Japanese nouns have no plural, so the head is its one word — except where the plural IS another
  // word the lexeme stores: 親 → 両親, ご親御さん → ご両親 (P11 D7). The reading follows that surface,
  // never the singular's. A pronoun is left alone: the translator has already written its plural into
  // `base`, gender and all (彼女ら), and `plural_reading` still holds the masculine's.
  const pluralHead = !pronounHead && (head['number'] ?? head['count']) === 'plural' && !!head['plural'];
  if (!counted?.replacesHead) {
    core.push(pluralHead
      ? wordSeg(head['plural'] ?? '', head['plural_reading'])
      : wordSeg(head['base'] ?? '', head['reading']));
  }
  // A relative clause is prenominal: the whole clause precedes everything else (see relativeClauseSegs).
  return [...comparedSegs, ...relativeClauseSegs(np), ...core];
}
