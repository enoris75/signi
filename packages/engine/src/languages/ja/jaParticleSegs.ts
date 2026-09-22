import type { FocusParticle } from '@signi/shared';
import type { ResolvedNounElement, RubySegment } from '../../types.js';
import { slotFocus } from '../../functions/slotFocus.js';
import { JA_NEGATIVE_DETERMINER } from './ja.consts.js';
import { isNegativeGroup } from './isNegativeGroup.js';

/** The particles a focus particle — and the `no` circumfix's も — replace outright; every other one stays in front. */
const REPLACED_BY_MO: ReadonlySet<string> = new Set(['', 'が', 'を', 'は']);

/**
 * The focus particles (see NounPhrase.focus, C39). Japanese has no word for these: だけ, さえ and も
 * are particles on the phrase itself, and they behave exactly as the `no` circumfix's も does — they
 * **replace** が / を / は (猫も, 食べ物さえ) and **follow** every other particle (家にも, 犬にだけ).
 */
const FOCUS_PARTICLE: Record<FocusParticle, string> = { only: 'だけ', even: 'さえ', also: 'も' };

/**
 * The case particle after a noun group. A `no` group closes its どの … も circumfix here: も replaces
 * が, を and は (どの猫も, どのネズミも) and follows any other particle (どの家でも, どの犬にも, どの市場からも,
 * どの犬のためにも), which npSegs cannot know.
 *
 * A focus particle sits in the same place and follows the same rule, which is the whole of what the
 * construct needs in Japanese — unlike the six European languages, which write a word beside the
 * phrase and so have to know which slot it is (C39). 猫も食べます, 食べ物さえ食べます, 家にも住みます.
 */
export function jaParticleSegs(el: ResolvedNounElement, particle: string): RubySegment[] {
  const focus = slotFocus(el);
  if (focus) {
    const word = FOCUS_PARTICLE[focus];
    return REPLACED_BY_MO.has(particle) ? [{ t: word }] : [{ t: particle }, { t: word }];
  }
  if (!isNegativeGroup(el)) return particle ? [{ t: particle }] : [];
  const mo = { t: JA_NEGATIVE_DETERMINER.post };
  return REPLACED_BY_MO.has(particle) ? [mo] : [{ t: particle }, mo];
}
