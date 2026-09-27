import type { Aspect, Tense } from '@signi/shared';
import type { Mood } from '../../types.js';
import { ANAR_PAST, ESTAR, HAVER, PROSPECTIVE_FRAME, type PN } from './ca.consts.js';
import { caEnclitic } from './caEnclitic.js';
import { auxCell, finiteCell, hasOwnCell } from './finiteCell.js';

/**
 * The finite verb group of a plain (non-pronominal) verb in any tense, aspect and mood (P03 §2.2):
 *
 * | | present | past | future |
 * |---|---|---|---|
 * | neutral | *menja* | *va menjar* (a state: *volia*) | *menjarà* |
 * | progressive | *està menjant* | *estava menjant* | *estarà menjant* |
 * | prospective | *està a punt de menjar* | *estava a punt de menjar* | *estarà a punt de menjar* |
 * | resultative | *ha menjat* | *havia menjat* | *haurà menjat* |
 *
 * The neutral past is the periphrastic *passat perifràstic*, *anar*'s auxiliary cells + the infinitive
 * (P03 D2). The marked aspects' past is their auxiliary's **imperfect** — *estava menjant*, *havia
 * menjat* — the progressive and pluperfect a past event in progress or completed takes; *va estar
 * menjant* is the bounded past, which English "was eating" does not say (verify). A hypothetical
 * mood reads its own cell of the finite word and keeps the rest: "menjaria", "hauria menjat",
 * "estigués menjant".
 *
 * `clitic` is a pronominal verb's own (*es*), attached to the non-finite word where the group has one
 * that takes it: "està tornant-se", "està a punt de tornar-se". Where the group's only non-finite word
 * is a participle or the periphrastic infinitive, the caller puts it before the finite word ("s'ha
 * tornat", "es va tornar"), and `leads` says so.
 */
export function verbGroup(
  verbForms: Record<string, string>,
  pn: PN,
  tense: Tense,
  aspect: Aspect,
  mood: Mood | undefined,
  clitic = '',
): { text: string; leads: boolean } {
  const inf = verbForms['base'] ?? '';
  const t = hasOwnCell(mood) ? 'present' : tense;
  if (aspect === 'progressive') return { text: `${auxCell(ESTAR, pn, t, mood)} ${caEnclitic(verbForms['gerund'] ?? inf, clitic)}`, leads: false };
  if (aspect === 'prospective') return { text: `${auxCell(ESTAR, pn, t, mood)} ${PROSPECTIVE_FRAME} ${caEnclitic(inf, clitic)}`, leads: false };
  if (aspect === 'resultative') return { text: `${auxCell(HAVER, pn, t, mood)} ${verbForms['participle'] ?? inf}`, leads: true };
  const cell = finiteCell(verbForms, pn, t, mood);
  if (cell !== undefined) return { text: cell, leads: true };
  return { text: `${ANAR_PAST[pn]} ${inf}`, leads: true };
}

/**
 * The same group as an infinitive — what a modal governs, and a citation: "menjar", "estar menjant",
 * "estar a punt de menjar", "haver menjat". A pronominal verb's clitic attaches to the word it belongs
 * to — the infinitive or gerund, and *haver* in the perfect, whose participle takes none: "tornar-se",
 * "estar tornant-se", "haver-se tornat".
 */
export function infinitiveGroup(verbForms: Record<string, string>, aspect: Aspect, clitic = ''): string {
  const inf = verbForms['base'] ?? '';
  if (aspect === 'progressive') return `estar ${caEnclitic(verbForms['gerund'] ?? inf, clitic)}`;
  if (aspect === 'prospective') return `estar ${PROSPECTIVE_FRAME} ${caEnclitic(inf, clitic)}`;
  if (aspect === 'resultative') return `${caEnclitic('haver', clitic)} ${verbForms['participle'] ?? inf}`;
  return caEnclitic(inf, clitic);
}
