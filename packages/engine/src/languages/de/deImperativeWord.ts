import type { DeIPN } from './de.types.js';
import { DE_IMPERATIVE } from './de.consts.js';

/** The German imperative verb surface for a person: a single word for du/ihr, "<inf> wir" for the
 *  cohortative. Regular du is the infinitive stem (laufen→lauf); ihr the stored 2pl-present. */
export function deImperativeWord(forms: Record<string, string>, conceptId: string, pn: DeIPN): string {
  const base = forms['base'] ?? '';
  const stem = base.replace(/e?n$/, '');
  const ov = DE_IMPERATIVE[conceptId];
  if (pn === '2sg') return ov?.['2sg'] ?? stem ?? base;
  if (pn === '2pl') return ov?.['2pl'] ?? forms['2pl_present'] ?? `${stem}t`;
  return `${ov?.['1pl'] ?? base} wir`; // 1pl cohortative
}
