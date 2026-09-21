import type { DeIPN } from './de.types.js';
import { particleGap } from './particleGap.js';

/** The German imperative verb surface for a person: a single word for du/ihr, "<inf> wir" for the
 *  cohortative. A form the lexeme stores as `<pn>_imperative` wins (the strong e→i/ie du forms
 *  iss/lies/sieh/gib, suppletive sei/seien/wisse); otherwise du is derived by `deDuImperative`, ihr
 *  is the stored 2pl-present, and the cohortative verb is the infinitive. A separable verb's command
 *  is its stem's ("fügen wir"), the clause putting the particle last ("fügen wir die Maus hinzu", A138),
 *  and a particle written apart leaves no space behind ("mach … rückgängig", B40). */
export function deImperativeWord(forms: Record<string, string>, pn: DeIPN): string {
  const particle = forms['particle'] ?? '';
  const infinitive = forms['base'] ?? '';
  const base = particle && infinitive.startsWith(particle)
    ? infinitive.slice(particle.length + particleGap(forms).length)
    : infinitive;
  const stored = forms[`${pn}_imperative`];
  if (pn === '2sg') return stored ?? deDuImperative(base);
  if (pn === '2pl') return stored ?? forms['2pl_present'] ?? `${base.replace(/e?n$/, '')}t`;
  return `${stored ?? base} wir`; // 1pl cohortative
}

/** The regular du-imperative of an infinitive: the bare stem (laufen→lauf, kommen→komm), keeping
 *  the -e where the bare stem would be unpronounceable — after -d/-t (schneide, töte) and after a
 *  consonant + m/n other than l/r/m/n or a lengthening h (ordne, atme, rechne; but lern, komm, wohn).
 *  -ern/-eln verbs keep the -e too, and -eln drops the stem's own e before it (erweitere, vermittle).
 *  The a→ä and e→i/ie changes of the 2sg present never carry over; e→i/ie is stored on the lexeme. */
function deDuImperative(base: string): string {
  if (base.endsWith('eln')) return `${base.slice(0, -3)}le`;
  if (base.endsWith('ern')) return `${base.slice(0, -1)}e`;
  const stem = base.replace(/e?n$/, '');
  return /(?:[dt]|(?:[^aeiouäöülrmnh]|ch)[mn])$/.test(stem) ? `${stem}e` : stem;
}
