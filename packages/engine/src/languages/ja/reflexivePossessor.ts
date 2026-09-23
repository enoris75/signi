import type { RubySegment } from '../../types.js';
import { wordSeg } from './wordSeg.js';

/**
 * 自分, the possessor that **is** the clause's subject (P11-E2): 猫は自分の本を見ます. Written by the
 * engine, as the possessive pronouns are (see `possessiveJa`), because it names no concept — it is
 * the link itself. OWN's emphasis follows it as 自身の, the word OWN takes after a named owner, so the
 * two together are 自分自身の and never 自分の自分の.
 */
export const JA_REFLEXIVE_POSSESSOR: RubySegment = wordSeg('自分', 'じぶん');
