import type { Mood } from '../../types.js';
import type { Tense } from '@signi/shared';
import { conditionalFinite } from './conditionalFinite.js';
import { futureFinite } from './futureFinite.js';
import { lParticiple } from './lParticiple.js';
import { pastFinite } from './pastFinite.js';
import { presentFinite } from './presentFinite.js';
import type { VerbAgr } from './pl.types.js';

/**
 * The finite verb for a tense and mood in the aspect the clause picked (P05 §0.3, §2.4): the
 * conditional (*zjadłby*), the bare *l*-participle of a *gdyby* clause, whose person ending rides on
 * *gdyby* (*gdybym zjadł*), the past with its person ending, the future, and the imperfective present.
 * Polish has no subjunctive: the Romance moods the translator may still set (a relative under a
 * negated antecedent) fall through to the indicative.
 */
export function finiteVerb(forms: Record<string, string>, agr: VerbAgr, tense: Tense, mood: Mood | undefined, perfective: boolean): string {
  if (mood === 'conditional') return conditionalFinite(forms, perfective, agr);
  if (mood === 'subjunctive') return lParticiple(forms, perfective, agr);
  if (tense === 'past') return pastFinite(forms, perfective, agr);
  if (tense === 'future') return futureFinite(forms, perfective, agr);
  return presentFinite(forms, agr);
}
