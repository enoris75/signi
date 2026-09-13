import type { Tense } from '@signi/shared';
import type { ConceptForms, Mood } from '../../types.js';
import { moodForm, moodPN } from '../../mood.js';
import { auxKey } from './auxKey.js';

/** The aspect auxiliary's finite form: its mood form under a hypothetical, else the tense form. */
export function auxFiniteFr(aux: ConceptForms, table: Record<Tense, Record<string, string>>, subjectForms: Record<string, string>, tense: Tense, mood?: Mood): string {
  return moodForm('fr', aux, moodPN(subjectForms), mood) ?? table[tense][auxKey(subjectForms)];
}
