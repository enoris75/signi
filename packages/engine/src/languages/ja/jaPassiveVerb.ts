import type { ConceptForms } from '../../types.js';

/**
 * The verb a passive clause is said with, built from the lexeme's stored `passive` form
 * (食べられる, 飲まれる, される — see the NONFINITE seed table). Japanese has no passive auxiliary: the
 * morphology is on the verb itself, so the passive is not a branch in the predicate but a *different
 * verb* standing where the active one stood, exactly as the existential いる/ある and the causative's
 * する already do.
 *
 * Everything else follows for free, because 〜れる/られる is itself a regular **ichidan** verb whatever
 * the verb under it was: strip the る and the polite paradigm, the te-form and the plain negative all
 * fall out — 食べられます / 食べられました / 食べられません / 食べられて / 食べられない — so tense, negation,
 * aspect, the modal suffixes and the たら of an "if" clause all compose on it with no further data.
 *
 * Returns the verb unchanged when the lexeme stores no `passive`: an intransitive verb has none, and
 * the translator has already ruled those out, but a verb seeded without one renders actively rather
 * than with a form guessed from the wrong conjugation class.
 */
export function jaPassiveVerb(verb: ConceptForms): ConceptForms {
  const passive = verb.forms['passive'];
  if (!passive || !passive.endsWith('る')) return verb;
  const reading = verb.forms['passive_reading'];
  const stem = passive.slice(0, -1);
  const readingStem = reading?.endsWith('る') ? reading.slice(0, -1) : undefined;
  // Keep the lexeme's other concept-level keys (`inanimate_aru`, `causative`, an object particle…):
  // the clause is still about this verb, and only its surface forms have changed.
  const { passive: _p, passive_reading: _pr, ...rest } = verb.forms;
  const derived: Record<string, string> = {
    ...rest,
    base: passive,
    masu_present: `${stem}ます`,
    te: `${stem}て`,
    nai: `${stem}ない`,
  };
  if (readingStem !== undefined) {
    derived['reading'] = reading!;
    derived['masu_present_reading'] = `${readingStem}ます`;
    derived['te_reading'] = `${readingStem}て`;
    derived['nai_reading'] = `${readingStem}ない`;
  } else {
    // A verb written in kana alone (あげる, ドラッグする) has no reading of its own, and neither has its
    // passive: leaving the active verb's readings behind would put furigana over the wrong kanji.
    for (const key of ['reading', 'masu_present_reading', 'te_reading', 'nai_reading']) delete derived[key];
  }
  return { ...verb, forms: derived };
}
