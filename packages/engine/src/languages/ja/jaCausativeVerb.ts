import type { ConceptForms } from '../../types.js';

/**
 * The verb a **causative** clause is said with — 走らせる, 食べさせる, クリックさせる. Japanese has no
 * transitive verb *let*: what it says is the causative form of the governed verb, with the causee
 * marked を or に and no governing verb at all (犬を走らせる, "lets the dog run"). So, like the passive,
 * this is not a branch in the predicate but a *different verb* standing where the governor's would
 * (see `jaPassiveVerb`), and 〜せる/させる is itself a regular ichidan verb, so tense, negation,
 * aspect and the modal suffixes all compose on it with no further data. Localization C36.
 *
 * The form is derived rather than seeded, from the two the lexeme already stores:
 *  - the **nai** form gives the stem the suffix attaches to (走らない → 走ら, 食べない → 食べ);
 *  - the **passive** says which suffix it is, because the two make the same distinction — a godan
 *    verb takes れる and せる (走られる / 走らせる), an ichidan one られる and させる (食べられる /
 *    食べさせる).
 *  - a **する** compound is its own pattern: the stem's し gives way to さ (クリックしない → クリック +
 *    させる), which is also what the passive does (クリックされる).
 *
 * Returns the verb unchanged when the lexeme stores no nai form to build on.
 */
export function jaCausativeVerb(verb: ConceptForms): ConceptForms {
  const f = verb.forms;
  const nai = f['nai'] ?? '';
  if (!nai.endsWith('ない')) return verb;
  const stem = nai.slice(0, -2);
  const suffix = (f['base'] ?? '').endsWith('する') && stem.endsWith('し') ? 'させる'
    : f['passive'] === `${stem}られる` ? 'させる'
    : 'せる';
  const cut = suffix === 'させる' && stem.endsWith('し') && (f['base'] ?? '').endsWith('する');
  const causativeStem = cut ? stem.slice(0, -1) : stem;
  const causative = `${causativeStem}${suffix}`;
  const naiReading = f['nai_reading'];
  const readingStem = naiReading?.endsWith('ない')
    ? (cut ? naiReading.slice(0, -3) : naiReading.slice(0, -2))
    : undefined;
  const { passive: _p, passive_reading: _pr, ...rest } = f;
  const derived: Record<string, string> = {
    ...rest,
    base: causative,
    masu_present: `${causative.slice(0, -1)}ます`,
    te: `${causative.slice(0, -1)}て`,
    nai: `${causative.slice(0, -1)}ない`,
  };
  if (readingStem !== undefined) {
    const readingBase = `${readingStem}${suffix}`;
    derived['reading'] = readingBase;
    derived['masu_present_reading'] = `${readingBase.slice(0, -1)}ます`;
    derived['te_reading'] = `${readingBase.slice(0, -1)}て`;
    derived['nai_reading'] = `${readingBase.slice(0, -1)}ない`;
  } else {
    // A verb written in kana alone has no reading of its own, and neither has its causative.
    for (const key of ['reading', 'masu_present_reading', 'te_reading', 'nai_reading']) delete derived[key];
  }
  return { ...verb, forms: derived };
}
