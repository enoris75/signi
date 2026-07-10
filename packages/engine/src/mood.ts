import type { LanguageCode } from '@signi/shared';
import type { ConceptForms, Mood } from './types.js';

/**
 * Conditional / imperfect-subjunctive verb forms for the hypothetical conditional, derived
 * in-engine from forms the lexicon already stores — the same "derive a tense from a stored
 * stem" approach the engines use for the future (en will+base, de werden) and the Japanese
 * past. This avoids seeding ~1400 extra conjugations and stays correct for irregular verbs,
 * because the irregular stem is already baked into the stored source form.
 *
 * Only Italian / French / Spanish / Portuguese are synthetic here: English, German and
 * Japanese realise both moods periphrastically inside their own engines (would+base, würde,
 * ～たら/でしょう) and never call these helpers.
 *
 *  - Conditional (apodosis) is built on the **future stem** (= stored `1sg_future` minus its
 *    person ending), so an irregular future (it andrò, es sabré, fr irai) yields the correct
 *    conditional (andrei / sabría / irais).
 *  - Imperfect subjunctive (protasis) is built on: es/pt the stored 3rd-plural preterite stem
 *    (`3pl_past` minus -ron/-ram — irregular preterites carry through: es supieron→supiera);
 *    it the infinitive stem (`base` minus -re, with a few overrides); fr the "nous" present
 *    stem (`1pl_present` minus -ons, être overridden).
 *
 * Known minor gaps (documented, consistent with existing engine gaps): the es/pt 1st-plural
 * forms omit the stem accent (comieramos, not comiéramos), and French -ger/-cer verbs keep an
 * extra e at 1pl/2pl (mangeions). Third-person singular — the common conditional subject — is
 * exact across the board.
 */

type PN = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl';

const IT_COND: Record<PN, string> = { '1sg': 'ei', '2sg': 'esti', '3sg': 'ebbe', '1pl': 'emmo', '2pl': 'este', '3pl': 'ebbero' };
const ES_COND: Record<PN, string> = { '1sg': 'ía', '2sg': 'ías', '3sg': 'ía', '1pl': 'íamos', '2pl': 'íais', '3pl': 'ían' };
const PT_COND: Record<PN, string> = { '1sg': 'ia', '2sg': 'ias', '3sg': 'ia', '1pl': 'íamos', '2pl': 'íeis', '3pl': 'iam' };
const FR_COND: Record<PN, string> = { '1sg': 'ais', '2sg': 'ais', '3sg': 'ait', '1pl': 'ions', '2pl': 'iez', '3pl': 'aient' };

const IT_SUBJ: Record<PN, string> = { '1sg': 'ssi', '2sg': 'ssi', '3sg': 'sse', '1pl': 'ssimo', '2pl': 'ste', '3pl': 'ssero' };
const ES_SUBJ: Record<PN, string> = { '1sg': 'ra', '2sg': 'ras', '3sg': 'ra', '1pl': 'ramos', '2pl': 'rais', '3pl': 'ran' };
const PT_SUBJ: Record<PN, string> = { '1sg': 'sse', '2sg': 'sses', '3sg': 'sse', '1pl': 'ssemos', '2pl': 'sseis', '3pl': 'ssem' };
const FR_IMPARF: Record<PN, string> = { '1sg': 'ais', '2sg': 'ais', '3sg': 'ait', '1pl': 'ions', '2pl': 'iez', '3pl': 'aient' };

// Italian imperfect-subjunctive stems that the "infinitive minus -re" rule gets wrong.
const IT_SUBJ_STEM: Record<string, string> = { BE: 'fo', GIVE: 'de', DRINK: 'beve' };
// French imparfait stems the "nous-present minus -ons" rule gets wrong (être → ét-).
const FR_IMPARF_STEM: Record<string, string> = { BE: 'ét' };

function futureStem(lang: LanguageCode, forms: Record<string, string>): string | undefined {
  const f = forms['1sg_future'];
  if (!f) return undefined;
  switch (lang) {
    case 'it': return f.replace(/ò$/, '');
    case 'es': return f.replace(/é$/, '');
    case 'pt': return f.replace(/ei$/, '');
    case 'fr': return f.replace(/ai$/, '');
    default: return undefined;
  }
}

function conditionalForm(lang: LanguageCode, verb: ConceptForms, pn: PN): string | undefined {
  const stem = futureStem(lang, verb.forms);
  if (stem === undefined) return undefined;
  const endings = lang === 'it' ? IT_COND : lang === 'es' ? ES_COND : lang === 'pt' ? PT_COND : lang === 'fr' ? FR_COND : undefined;
  return endings ? stem + endings[pn] : undefined;
}

function subjunctiveForm(lang: LanguageCode, verb: ConceptForms, pn: PN): string | undefined {
  const forms = verb.forms;
  switch (lang) {
    case 'it': {
      const stem = IT_SUBJ_STEM[verb.conceptId] ?? forms['base']?.replace(/re$/, '');
      return stem === undefined ? undefined : stem + IT_SUBJ[pn];
    }
    case 'es': {
      const p = forms['3pl_past'];
      return p ? p.replace(/ron$/, '') + ES_SUBJ[pn] : undefined;
    }
    case 'pt': {
      const p = forms['3pl_past'];
      return p ? p.replace(/ram$/, '') + PT_SUBJ[pn] : undefined;
    }
    case 'fr': {
      const stem = FR_IMPARF_STEM[verb.conceptId] ?? forms['1pl_present']?.replace(/ons$/, '');
      return stem === undefined ? undefined : stem + FR_IMPARF[pn];
    }
    default: return undefined;
  }
}

/**
 * The finite conditional (apodosis) or imperfect-subjunctive (protasis) surface for a Romance
 * verb, or undefined when there is no mood to apply or the source stem is missing (the caller
 * then falls back to its ordinary conjugation). `pn` is the "1sg".."3pl" person-number key.
 */
export function moodForm(lang: LanguageCode, verb: ConceptForms, pn: PN, mood: Mood | undefined): string | undefined {
  if (mood === 'conditional') return conditionalForm(lang, verb, pn);
  if (mood === 'subjunctive') return subjunctiveForm(lang, verb, pn);
  return undefined;
}

/** Person-number key ("1sg".."3pl") from a resolved subject/head's forms. */
export function moodPN(subjectForms: Record<string, string>): PN {
  const person = subjectForms['person'] ?? '3';
  const n = (subjectForms['number'] ?? 'singular') === 'plural' ? 'pl' : 'sg';
  return `${person}${n}` as PN;
}
