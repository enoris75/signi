import type { ResolvedPhrase } from '../../types.js';
import { infinitiveLink } from '../../functions/infinitiveLink.js';
import { PAST_ENDINGS, PURPOSE_WORD } from './pl.consts.js';
import { pnOf } from './pnOf.js';
import { predicateText } from './predicateText.js';
import { verbAgr } from './verbAgr.js';

/**
 * An infinitive complement or a purpose clause (P09-E4) as it follows its governor: the governor's
 * link, if Polish writes one (most take the infinitive bare: *chce jeść*, *zaczyna jeść*), then the
 * bare infinitive clause agreeing with its controller (*jest w stanie być szczęśliwym*), and any
 * clause it governs in turn.
 *
 * `causative` is a governor Polish cannot follow with an infinitive (CAUSE_VERB *skłonić*): the clause
 * is *żeby* + the *l*-participle agreeing with the one who acts, its person ending on *żeby* (*skłania
 * kota, żeby biegł*; *żebym biegł*) (verify: *skłonić kogoś do biegania*, the verbal noun, is the
 * other way, and the lexicon has no verbal nouns).
 */
export function infinitiveComplementText(clause: ResolvedPhrase, controller: Record<string, string>, link: string, causative = false): string {
  const vp = clause.verbPhrase;
  if (!vp) return '';
  const agr = verbAgr(controller);
  if (causative) {
    const own = predicateText({ subject: controller, agr, verbPhrase: { ...vp, mood: 'subjunctive', tense: 'past' }, directObject: clause.directObject, complements: clause.complements });
    return `, ${PURPOSE_WORD}${PAST_ENDINGS[pnOf(agr)] ?? ''} ${own},`;
  }
  const own = predicateText({ subject: controller, agr, verbPhrase: vp, directObject: clause.directObject, complements: clause.complements });
  const nested = clause.infinitiveComplement ? infinitiveComplementText(clause.infinitiveComplement, controller, infinitiveLink(clause)) : '';
  return [link, own, nested].filter(Boolean).join(' ');
}
