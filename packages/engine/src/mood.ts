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
// STARE is the aspect auxiliary (progressive/prospective) — irregular: stessi/stesse, not *stassi.
const IT_SUBJ_STEM: Record<string, string> = { BE: 'fo', GIVE: 'de', DRINK: 'beve', STARE: 'ste' };
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

/* ---------------------------------------------------------------------------------------------
 * Imperative (command) forms.
 *
 * The imperative only ever addresses three persons — familiar 2nd-singular (the default), the
 * 1st-plural cohortative ("let's …"), and 2nd-plural — so the subject pronoun (2sg/1pl/2pl) that
 * the UI forces under a command selects the form here. As elsewhere the surfaces are *derived*
 * from stored present-tense / infinitive stems, with small per-verb override tables only for the
 * genuinely irregular verbs (chiefly BE, and "know"), matching the approach used for the
 * conditional/subjunctive above. English, German and Japanese realise the imperative inside their
 * own engines (bare base / "let's …"; du-stem + wir-inversion; ～てください / ～ましょう), so this
 * helper covers only the four synthetic Romance languages.
 *
 * The Romance imperative is largely subjunctive-based: the negative command and the 1st-plural
 * (and, in Spanish/Portuguese, the whole polite paradigm) use the present subjunctive, while the
 * affirmative familiar forms borrow the present indicative. So a present-subjunctive derivation is
 * shared here (stem = 1sg-present minus -o, plus the class endings), with overrides where the
 * subjunctive stem is itself irregular (BE, "know").
 */

type IPN = '2sg' | '1pl' | '2pl';

/** Clamp any person-number to the three the imperative addresses (default familiar 2sg). */
function toIPN(pn: PN): IPN {
  return pn === '1pl' || pn === '2pl' ? pn : '2sg';
}

// Present-subjunctive endings by verb class, per language (only the imperative persons).
const ES_SUBJ_PRES_END = {
  ar: { '2sg': 'es', '1pl': 'emos', '2pl': 'éis' },
  er: { '2sg': 'as', '1pl': 'amos', '2pl': 'áis' },
} as const;
// Portuguese here is modelled on você/vocês (the seed stores 2sg = 3sg and 2pl = 3pl morphology),
// so its whole imperative — affirmative and negative alike — is the present subjunctive with
// 3rd-person agreement: você "coma" / nós "comamos" / vocês "comam".
const PT_SUBJ_PRES_END = {
  ar: { '2sg': 'e', '1pl': 'emos', '2pl': 'em' },
  er: { '2sg': 'a', '1pl': 'amos', '2pl': 'am' },
} as const;

// Irregular present-subjunctive stems the "1sg-present minus -o" rule can't reach (es/pt only —
// Italian never routes through the subjunctive here; its negatives reuse the affirmative form or
// the infinitive).
const ES_SUBJ_OVERRIDE: Record<string, Record<IPN, string>> = {
  BE:   { '2sg': 'seas', '1pl': 'seamos', '2pl': 'seáis' },   // ser → sea…
  KNOW: { '2sg': 'sepas', '1pl': 'sepamos', '2pl': 'sepáis' }, // saber → sepa…
};
const PT_SUBJ_OVERRIDE: Record<string, Record<IPN, string>> = {
  BE:   { '2sg': 'seja', '1pl': 'sejamos', '2pl': 'sejam' },   // ser → seja… (você/vocês)
  KNOW: { '2sg': 'saiba', '1pl': 'saibamos', '2pl': 'saibam' }, // saber → saiba…
};

// Irregular *affirmative familiar* imperative forms (indicative-based paradigm) by concept.
const ES_IMP_OVERRIDE: Record<string, Partial<Record<IPN, string>>> = {
  BE: { '2sg': 'sé', '1pl': 'seamos', '2pl': 'sed' },          // ser: sé / seamos / sed
};
const IT_IMP_OVERRIDE: Record<string, Partial<Record<IPN, string>>> = {
  BE:   { '2sg': 'sii', '1pl': 'siamo', '2pl': 'siate' },      // essere: sii / siamo / siate
  KNOW: { '2sg': 'sappi', '1pl': 'sappiamo', '2pl': 'sappiate' }, // sapere: sappi / sappiamo / sappiate
};
// French imperative is a single paradigm (negation only wraps it), so one override table.
const FR_IMP_OVERRIDE: Record<string, Record<IPN, string>> = {
  BE:   { '2sg': 'sois', '1pl': 'soyons', '2pl': 'soyez' },    // être
  KNOW: { '2sg': 'sache', '1pl': 'sachons', '2pl': 'sachez' }, // savoir
  HAVE: { '2sg': 'aie', '1pl': 'ayons', '2pl': 'ayez' },       // avoir
  GO:   { '2sg': 'va', '1pl': 'allons', '2pl': 'allez' },      // aller
};

/**
 * The subjunctive endings of an -ar verb start in -e, where the stem's final consonant would
 * change sound: the spelling absorbs it (cargar → carguemos, tocar → toque, cruzar → cruce).
 * A stem already ending in -gu/-qu is left alone. Only -ar verbs need this — an -er/-ir stem
 * comes off the 1sg present, which already carries the shift (coger → cojo → coja).
 */
function arSubjStem(stem: string): string {
  if (/(?:gu|qu)$/.test(stem)) return stem;
  return stem
    .replace(/g$/, 'gu')
    .replace(/c$/, 'qu')
    .replace(/z$/, 'c');
}

function subjPresent(
  lang: 'es' | 'pt',
  verb: ConceptForms,
  pn: IPN,
): string {
  const override = (lang === 'es' ? ES_SUBJ_OVERRIDE : PT_SUBJ_OVERRIDE)[verb.conceptId];
  if (override) return override[pn];
  const raw = (verb.forms['1sg_present'] ?? '').replace(/o$/, '');
  const base = verb.forms['base'] ?? '';
  const cls = base.endsWith('ar') ? 'ar' : 'er';
  const stem = cls === 'ar' ? arSubjStem(raw) : raw;
  return stem + (lang === 'es' ? ES_SUBJ_PRES_END : PT_SUBJ_PRES_END)[cls][pn];
}

/**
 * The finite imperative surface for a Romance verb, given the addressee (2sg/1pl/2pl) and whether
 * the command is negative. The engine adds its own negation particle / wrapping (it "non", es "no",
 * pt "não", fr "ne … pas") and positions the objects; this returns just the verb word. Returns
 * undefined for languages that build the imperative in-engine (en/de/ja) so the caller falls back.
 *
 *  - it: affirmative tu = 3sg-present for -are verbs / 2sg-present otherwise, noi = 1pl-present,
 *        voi = 2pl-present; negative tu is the bare infinitive ("non correre"), negative noi/voi
 *        keep the affirmative form ("non correte"). Irregulars (essere/sapere) override.
 *  - es: affirmative tú = 3sg-present, nosotros = present-subjunctive, vosotros = infinitive-r+d;
 *        every negative form and nosotros use the present subjunctive ("no comas", "no comáis").
 *  - pt: affirmative tu = 3sg-present, nós = present-subjunctive, vós = 2pl-present minus -s;
 *        negatives use the present subjunctive ("não comas").
 *  - fr: tu = 2sg-present (minus -s for -er verbs), nous = 1pl-present, vous = 2pl-present; the
 *        same form serves the negative, which the engine wraps in "ne … pas".
 */
export function imperativeForm(
  lang: LanguageCode,
  verb: ConceptForms,
  pnRaw: PN,
  negative: boolean,
): string | undefined {
  const pn = toIPN(pnRaw);
  const f = verb.forms;
  const base = f['base'] ?? '';
  switch (lang) {
    case 'it': {
      const affirmative = (): string =>
        IT_IMP_OVERRIDE[verb.conceptId]?.[pn]
        ?? (pn === '2sg' ? (base.endsWith('are') ? f['3sg_present'] : f['2sg_present'])
          : pn === '1pl' ? f['1pl_present']
          : f['2pl_present'])
        ?? '';
      if (!negative) return affirmative();
      return pn === '2sg' ? base : affirmative(); // negative tu → infinitive
    }
    case 'es': {
      if (negative) return `${subjPresent('es', verb, pn)}`;
      return ES_IMP_OVERRIDE[verb.conceptId]?.[pn]
        ?? (pn === '2sg' ? (f['3sg_present'] ?? '')
          : pn === '1pl' ? subjPresent('es', verb, pn)
          : base.replace(/r$/, 'd'));            // vosotros: infinitive − r + d
    }
    case 'pt':
      // você/vocês paradigm: the present subjunctive serves every person and both polarities.
      return subjPresent('pt', verb, pn);
    case 'fr': {
      const override = FR_IMP_OVERRIDE[verb.conceptId]?.[pn];
      if (override) return override;
      if (pn === '1pl') return f['1pl_present'] ?? '';
      if (pn === '2pl') return f['2pl_present'] ?? '';
      const two = f['2sg_present'] ?? '';
      return base.endsWith('er') ? two.replace(/s$/, '') : two; // -er verbs drop final -s
    }
    default:
      return undefined;
  }
}
