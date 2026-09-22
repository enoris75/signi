import type { Definiteness } from '@signi/shared';
import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase, RubySegment } from '../../types.js';
import { adjDegree } from '../../functions/adjDegree.js';
import { possessiveJa } from '../../possessive.js';
import { JA_DEGREE, JA_NEGATIVE_DETERMINER, JA_PRENOMINAL_DET } from './ja.consts.js';
import { jaComparisonAdj } from './jaComparisonAdj.js';
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
  const definiteness = (np.head.forms['definiteness'] ?? 'definite') as Definiteness;
  const prenominalDet = JA_PRENOMINAL_DET[definiteness];
  const detSegs: RubySegment[] =
    prenominalDet ? [{ t: prenominalDet }]
    : definiteness === 'no' ? [{ t: JA_NEGATIVE_DETERMINER.pre }]
    : [];
  // A possessor is prenominal, marked by の ("猫の本"); recursing handles its own
  // adjectives / nested possessor / relative clause ("子供の猫の本"). A pronominal possessor
  // ("彼の犬") is the antecedent pronoun + の, invariant of the possessed head.
  if (np.possessor) {
    core.push(
      ...(isPronominalPossessor(np.possessor)
        ? possessiveJa(np.possessor)
        // A `no` possessor keeps its も before the の (a separate, unhandled case: どの猫もの本).
        : [...npSegs(np.possessor), ...(np.possessor.head.forms['definiteness'] === 'no' ? [{ t: JA_NEGATIVE_DETERMINER.post }] : []), { t: 'の' }]),
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
  for (const a of np.adjectives) {
    // The lowered degrees negate the adjective (大きい → 大きくない); every other keeps the base.
    const { base, reading } = jaComparisonAdj(a);
    if (!base) continue;
    // Prenominal degree adverb bound directly to its adjective (もっと大きい), no space.
    const deg = JA_DEGREE[adjDegree(a)];
    if (deg) adjSegs.push({ t: deg });
    adjSegs.push(wordSeg(base, reading));
  }
  core.push(...adjSegs);
  const head = np.head.forms;
  core.push(wordSeg(head['base'] ?? '', head['reading']));
  // A relative clause is prenominal: the whole clause precedes everything else (see relativeClauseSegs).
  return [...relativeClauseSegs(np), ...core];
}
