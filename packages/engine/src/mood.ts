import type { LanguageCode, Tense } from '@signi/shared';
import type { ConceptForms, Mood } from './types.js';
import { lemmaHead } from './functions/lemmaHead.js';
import { lemmaTail } from './functions/lemmaTail.js';

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
 *    stem (`1pl_present` minus -ons, être overridden). A lexeme whose stored paradigm is not the
 *    indicative one — a conditional modal, whose present is the conditional and whose past is the
 *    conditional perfect (SHOULD "devrait" / "aurait dû") — seeds the stem itself as
 *    `subjunctive_stem` (fr dev-, es debie-, pt deve-), so the protasis still reads "si le chat
 *    devait manger", "si el gato debiera comer", "se o gato devesse comer".
 *
 * The es/pt 1st plural is stressed on the stem's last vowel, which the spelling marks (B11): Spanish
 * always with the acute (comiéramos, fuéramos), Portuguese by that vowel (see `ptStemAccent`).
 *
 * Known minor gap (documented, consistent with existing engine gaps): French -ger/-cer verbs keep an
 * extra e at 1pl/2pl (mangeions). Third-person singular — the common conditional subject — is
 * exact across the board.
 */

type PN = '1sg' | '2sg' | '3sg' | '1pl' | '2pl' | '3pl';

const IT_COND: Record<PN, string> = { '1sg': 'ei', '2sg': 'esti', '3sg': 'ebbe', '1pl': 'emmo', '2pl': 'este', '3pl': 'ebbero' };
const ES_COND: Record<PN, string> = { '1sg': 'ía', '2sg': 'ías', '3sg': 'ía', '1pl': 'íamos', '2pl': 'íais', '3pl': 'ían' };
// Portuguese 2nd person is você / vocês, agreeing as the 3rd (A108).
const PT_COND: Record<PN, string> = { '1sg': 'ia', '2sg': 'ia', '3sg': 'ia', '1pl': 'íamos', '2pl': 'iam', '3pl': 'iam' };
const FR_COND: Record<PN, string> = { '1sg': 'ais', '2sg': 'ais', '3sg': 'ait', '1pl': 'ions', '2pl': 'iez', '3pl': 'aient' };

const IT_SUBJ: Record<PN, string> = { '1sg': 'ssi', '2sg': 'ssi', '3sg': 'sse', '1pl': 'ssimo', '2pl': 'ste', '3pl': 'ssero' };
const ES_SUBJ: Record<PN, string> = { '1sg': 'ra', '2sg': 'ras', '3sg': 'ra', '1pl': 'ramos', '2pl': 'rais', '3pl': 'ran' };
const PT_SUBJ: Record<PN, string> = { '1sg': 'sse', '2sg': 'sse', '3sg': 'sse', '1pl': 'ssemos', '2pl': 'ssem', '3pl': 'ssem' };
const FR_IMPARF: Record<PN, string> = { '1sg': 'ais', '2sg': 'ais', '3sg': 'ait', '1pl': 'ions', '2pl': 'iez', '3pl': 'aient' };

// Contracted infinitives, by ending, and the Latin stem they hide (produrre → produce-, dire →
// dice-). The imperfect subjunctive and the imperfect indicative are built on the same one, so both
// read this list. Keyed by the lemma, not by the concept: a second concept on a contracted verb
// reaches it too (DO on MAKE's fare — A243).
const IT_CONTRACTED_STEM: [RegExp, string][] = [[/urre$/, 'uce'], [/orre$/, 'one'], [/arre$/, 'ae'], [/dire$/, 'dice'], [/fare$/, 'face'], [/bere$/, 'beve']];

function itContractedStem(base: string): string {
  const contracted = IT_CONTRACTED_STEM.find(([ending]) => ending.test(base));
  return contracted ? base.replace(contracted[0], contracted[1]) : base.replace(/re$/, '');
}

// Italian imperfect-subjunctive stems that neither rule above gets right.
// STARE is the aspect auxiliary (progressive/prospective) — irregular: stessi/stesse, not *stassi.
const IT_SUBJ_STEM: Record<string, string> = { BE: 'fo', GIVE: 'de', STARE: 'ste' };
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

// A preterite stem ends on a vowel (comie-, fue-, tuvie-; come-, tive-, fo-, parti-), and the 1st
// plural stresses it. A vowel already written with an accent (pt possuí-) is left as it is.
const STEM_FINAL_VOWEL = /([aeiou])([^aeiouáéíóúâêô]*)$/;

/** The stem with its last vowel written `accented`, unless that vowel already carries a mark. */
function stressStem(stem: string, accented: (vowel: string) => string): string {
  if (/[áéíóúâêô][^aeiouáéíóúâêô]*$/.test(stem)) return stem;
  return stem.replace(STEM_FINAL_VOWEL, (_, vowel: string, tail: string) => accented(vowel) + tail);
}

const ACUTE: Record<string, string> = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' };

/**
 * The accent Portuguese writes on the stressed stem vowel of the 1st-plural imperfect subjunctive
 * (B11): á for -ar (falássemos), í for -ir (partíssemos), ô for ser / ir (fôssemos). An e is open, é,
 * in a strong preterite (tivéssemos, fizéssemos, déssemos, viéssemos) and closed, ê, in a regular -er
 * verb (comêssemos, lêssemos). The spelling cannot tell those two apart ("comeram", "tiveram"), so the
 * rule reads the preterite: a regular -er verb's 3sg past ends in -eu (comeu, leu), and a strong
 * one's does not (teve, fez, veio). The -er infinitive is asked for too, because "dar" is the one
 * strong preterite whose 3sg does end in -eu (deu). The aspect auxiliaries carry neither form and
 * are strong (estivéssemos, tivéssemos), which is what the fallback gives them.
 */
function ptStemAccent(forms: Record<string, string>, stem: string): (vowel: string) => string {
  const base = forms['base'] ?? '';
  // A regular -er verb's preterite stem is its infinitive minus the r (comer → comeram → come-), which
  // a strong one's never is (ter → tiveram → tive-). That reading serves a lexeme whose `3sg_past` is
  // no preterite at all: a conditional modal's is its conditional perfect (SHOULD's "teria devido"),
  // and its stem is seeded as `subjunctive_stem` (deve-, so devêssemos).
  const regularEr = /er(?:-se)?$/.test(base) && (/eu$/.test(forms['3sg_past'] ?? '') || stem === base.slice(0, -1));
  return (vowel) => (vowel === 'o' ? 'ô' : vowel === 'e' && regularEr ? 'ê' : ACUTE[vowel]);
}

function subjunctiveForm(lang: LanguageCode, verb: ConceptForms, pn: PN): string | undefined {
  const forms = verb.forms;
  switch (lang) {
    case 'it': {
      const base = forms['base'];
      const stem = IT_SUBJ_STEM[verb.conceptId] ?? (base === undefined ? undefined : itContractedStem(base));
      return stem === undefined ? undefined : stem + IT_SUBJ[pn];
    }
    case 'es': {
      const p = forms['subjunctive_stem'] ?? forms['3pl_past']?.replace(/ron$/, '');
      if (!p) return undefined;
      return (pn === '1pl' ? stressStem(p, (v) => ACUTE[v]) : p) + ES_SUBJ[pn];
    }
    case 'pt': {
      const stem = forms['subjunctive_stem'] ?? forms['3pl_past']?.replace(/ram$/, '');
      if (!stem) return undefined;
      return (pn === '1pl' ? stressStem(stem, ptStemAccent(forms, stem)) : stem) + PT_SUBJ[pn];
    }
    case 'fr': {
      const stem = FR_IMPARF_STEM[verb.conceptId] ?? forms['subjunctive_stem'] ?? forms['1pl_present']?.replace(/ons$/, '');
      return stem === undefined ? undefined : stem + FR_IMPARF[pn];
    }
    default: return undefined;
  }
}

// Portuguese 2nd person is você / vocês, agreeing as the 3rd (A108).
const PT_FUT_SUBJ: Record<PN, string> = { '1sg': 'r', '2sg': 'r', '3sg': 'r', '1pl': 'rmos', '2pl': 'rem', '3pl': 'rem' };

/**
 * The Portuguese **future subjunctive** (A252): a future event under a temporal conjunction, "quando
 * o gato **comer**". Built, as the imperfect subjunctive is, on the 3rd-plural preterite stem
 * (`3pl_past` minus -ram), so every irregular preterite carries through: fizeram → fizer, tiveram →
 * tiver, foram → for, vieram → vier, viram → vir, deram → der, puseram → puser, disseram → disser. A
 * regular verb's comes out as its infinitive (comer, falar, partir).
 *
 * The stem vowel a hiatus marks in the preterite (saíram, destruíram) keeps its accent only where
 * the stress stays on it, before -rem (saírem); before -r and -rmos it is unstressed or final and
 * unmarked (sair, sairmos). A lexeme whose stored preterite is no preterite seeds its stem as
 * `subjunctive_stem` (SHOULD's deve-), and reads it here too.
 */
function futureSubjunctiveForm(lang: LanguageCode, verb: ConceptForms, pn: PN): string | undefined {
  if (lang !== 'pt') return undefined;
  const stem = verb.forms['subjunctive_stem'] ?? verb.forms['3pl_past']?.replace(/ram$/, '');
  if (!stem) return undefined;
  const ending = PT_FUT_SUBJ[pn];
  return (ending === 'rem' ? stem : stem.replace(/í$/, 'i')) + ending;
}

/**
 * The finite conditional (apodosis), imperfect-subjunctive (protasis), present-subjunctive or
 * future-subjunctive surface for a Romance verb, or undefined when there is no mood to apply or the
 * source stem is missing (the caller then falls back to its ordinary conjugation). `pn` is the
 * "1sg".."3pl" person-number key. The present subjunctive is Romance-wide (see
 * `presentSubjunctiveForm`); the future subjunctive is Portuguese (see `futureSubjunctiveForm`).
 */
export function moodForm(lang: LanguageCode, verb: ConceptForms, pn: PN, mood: Mood | undefined): string | undefined {
  return onLemmaHead(verb, (v) => {
    if (mood === 'conditional') return conditionalForm(lang, v, pn);
    if (mood === 'subjunctive') return subjunctiveForm(lang, v, pn);
    if (mood === 'presentSubjunctive') return presentSubjunctiveForm(lang, v, pn);
    if (mood === 'futureSubjunctive') return futureSubjunctiveForm(lang, v, pn);
    return undefined;
  });
}

/**
 * A form derived from a stored stem, derived on the verb of a multiword lemma alone and given its
 * noun back after: avere bisogno → "aveva bisogno", "avrebbe bisogno", "avesse bisogno"; avoir besoin →
 * "avait besoin", "aurait besoin" (NEED, localization B62). Derived on the whole lemma, the rules
 * above would inflect the noun ("avere bisognova", "avons besoinait"). A one-word lemma is derived as
 * it always was.
 */
function onLemmaHead(verb: ConceptForms, derive: (verb: ConceptForms) => string | undefined): string | undefined {
  const tail = lemmaTail(verb);
  if (!tail) return derive(verb);
  const form = derive(lemmaHead(verb));
  return form === undefined ? undefined : `${form} ${tail}`;
}

/* ---------------------------------------------------------------------------------------------
 * Imperfect indicative (A130).
 *
 * The Romance simple past (passato remoto, passé simple, pretérito) is perfective: right for an
 * event, but it turns a state into one — "volle" / "quiso" read "insisted on", "ebbe" / "tuvo"
 * "got", "fu nella casa" is ill-formed. A state in the past takes the imperfect instead (voleva,
 * tenía, era), which is the neutral reading of English "wanted" / "had". The concept says which
 * verbs name a state (`stative`), and the imperfect is derived here, as the conditional and the
 * subjunctive above are:
 *
 *  - it: the infinitive minus -re + -vo/-vi/-va… (volere → voleva); essere is suppletive (era), and
 *        a contracted infinitive keeps its Latin stem (produrre → produceva, fare → faceva).
 *  - fr: the imparfait the protasis already uses (nous-present minus -ons; être → ét-).
 *  - es: -ar → -aba, -er/-ir → -ía; ser (era), ir (iba) and ver (veía) are irregular.
 *  - pt: -ar → -ava, -er/-ir → -ia (-ía after a vowel: possuía); ser (era), and ter, vir and pôr with
 *        their compounds (tinha, continha, vinha, punha).
 */

const IT_IMPERF: Record<PN, string> = { '1sg': 'vo', '2sg': 'vi', '3sg': 'va', '1pl': 'vamo', '2pl': 'vate', '3pl': 'vano' };
const IT_ESSERE_IMPERF: Record<PN, string> = { '1sg': 'ero', '2sg': 'eri', '3sg': 'era', '1pl': 'eravamo', '2pl': 'eravate', '3pl': 'erano' };
const ES_IMPERF_AR: Record<PN, string> = { '1sg': 'aba', '2sg': 'abas', '3sg': 'aba', '1pl': 'ábamos', '2pl': 'abais', '3pl': 'aban' };
const ES_IMPERF_ER: Record<PN, string> = { '1sg': 'ía', '2sg': 'ías', '3sg': 'ía', '1pl': 'íamos', '2pl': 'íais', '3pl': 'ían' };
const ES_IMPERF_IRREGULAR: Record<string, Record<PN, string>> = {
  ser: { '1sg': 'era', '2sg': 'eras', '3sg': 'era', '1pl': 'éramos', '2pl': 'erais', '3pl': 'eran' },
  ir: { '1sg': 'iba', '2sg': 'ibas', '3sg': 'iba', '1pl': 'íbamos', '2pl': 'ibais', '3pl': 'iban' },
};
// Portuguese 2nd person is você / vocês, agreeing as the 3rd (A108).
const PT_IMPERF_AR: Record<PN, string> = { '1sg': 'ava', '2sg': 'ava', '3sg': 'ava', '1pl': 'ávamos', '2pl': 'avam', '3pl': 'avam' };
const PT_IMPERF_ER: Record<PN, string> = { '1sg': 'ia', '2sg': 'ia', '3sg': 'ia', '1pl': 'íamos', '2pl': 'iam', '3pl': 'iam' };
// After a stem vowel the i is stressed and written í: possuía, saía.
const PT_IMPERF_ER_AFTER_VOWEL: Record<PN, string> = { '1sg': 'ía', '2sg': 'ía', '3sg': 'ía', '1pl': 'íamos', '2pl': 'íam', '3pl': 'íam' };
const PT_SER_IMPERF: Record<PN, string> = { '1sg': 'era', '2sg': 'era', '3sg': 'era', '1pl': 'éramos', '2pl': 'eram', '3pl': 'eram' };
const PT_NH_IMPERF: Record<PN, string> = { '1sg': 'a', '2sg': 'a', '3sg': 'a', '1pl': 'amos', '2pl': 'am', '3pl': 'am' };

function imperfectForm(lang: LanguageCode, verb: ConceptForms, pn: PN): string | undefined {
  const base = verb.forms['base'];
  if (!base) return undefined;
  switch (lang) {
    case 'it': {
      if (base === 'essere') return IT_ESSERE_IMPERF[pn];
      return itContractedStem(base) + IT_IMPERF[pn];
    }
    case 'fr':
      return subjunctiveForm('fr', verb, pn);
    case 'es': {
      const irregular = ES_IMPERF_IRREGULAR[base];
      if (irregular) return irregular[pn];
      const stem = base === 'ver' ? 've' : base.slice(0, -2);
      return stem + (base.endsWith('ar') ? ES_IMPERF_AR : ES_IMPERF_ER)[pn];
    }
    case 'pt': {
      if (base === 'ser') return PT_SER_IMPERF[pn];
      // ter / vir and their compounds (conter, convir — told from bater or servir by their 3sg "tem" /
      // "vem"), and pôr with its compounds: tinha, vinha, punha, with the stress mark in the 1st plural.
      const third = verb.forms['3sg_present'] ?? '';
      const nh = /ter$/.test(base) && /t[eé]m$/.test(third) ? ['ter', 'tinh', 'tính']
        : /vir$/.test(base) && /v[eé]m$/.test(third) ? ['vir', 'vinh', 'vính']
        : /p[oô]r$/.test(base) ? [base.slice(-3), 'punh', 'púnh']
        : undefined;
      if (nh) return base.slice(0, -3) + (pn === '1pl' ? nh[2] : nh[1]) + PT_NH_IMPERF[pn];
      const stem = base.slice(0, -2);
      if (base.endsWith('ar')) return stem + PT_IMPERF_AR[pn];
      return stem + (/[aeiou]$/.test(stem) ? PT_IMPERF_ER_AFTER_VOWEL : PT_IMPERF_ER)[pn];
    }
    default:
      return undefined;
  }
}

/**
 * The finite past of a state verb (`stative` on its forms) in the indicative: the Romance imperfect
 * (voleva, voulait, quería, queria), or undefined for any other verb, tense or mood, where the caller
 * keeps its ordinary conjugation. The caller applies it to the finite verb only — the outermost modal,
 * or a main verb with neutral aspect — so a governed infinitive, the resultative (ha voluto) and the
 * hypothetical moods are untouched.
 */
export function statePastForm(lang: LanguageCode, verb: ConceptForms, pn: PN, tense: Tense | undefined, mood: Mood | undefined): string | undefined {
  if (verb.forms['stative'] !== '1' || tense !== 'past' || (mood !== undefined && mood !== 'indicative')) return undefined;
  return onLemmaHead(verb, (v) => imperfectForm(lang, v, pn));
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

// Present-subjunctive endings by verb class, per language. The imperative reads its three persons
// (2sg / 1pl / 2pl); a relative under a negated antecedent reads any of the six (A170).
const ES_SUBJ_PRES_END: Record<'ar' | 'er', Record<PN, string>> = {
  ar: { '1sg': 'e', '2sg': 'es', '3sg': 'e', '1pl': 'emos', '2pl': 'éis', '3pl': 'en' },
  er: { '1sg': 'a', '2sg': 'as', '3sg': 'a', '1pl': 'amos', '2pl': 'áis', '3pl': 'an' },
};
// Portuguese here is modelled on você/vocês (the seed stores 2sg = 3sg and 2pl = 3pl morphology),
// so its whole imperative — affirmative and negative alike — is the present subjunctive with
// 3rd-person agreement: você "coma" / nós "comamos" / vocês "comam".
const PT_SUBJ_PRES_END: Record<'ar' | 'er', Record<PN, string>> = {
  ar: { '1sg': 'e', '2sg': 'e', '3sg': 'e', '1pl': 'emos', '2pl': 'em', '3pl': 'em' },
  er: { '1sg': 'a', '2sg': 'a', '3sg': 'a', '1pl': 'amos', '2pl': 'am', '3pl': 'am' },
};

// Irregular present-subjunctive stems the "1sg-present minus -o" rule can't reach (es/pt only —
// Italian never routes through the subjunctive here; its negatives reuse the affirmative form or
// the infinitive). The aspect auxiliaries are here too, since they carry no stored present of their
// own: HABER ("que haya comido") and Portuguese TER ("que tenha comido").
const ES_SUBJ_OVERRIDE: Record<string, Record<PN, string>> = {
  BE:   { '1sg': 'sea', '2sg': 'seas', '3sg': 'sea', '1pl': 'seamos', '2pl': 'seáis', '3pl': 'sean' },         // ser
  ESTAR: { '1sg': 'esté', '2sg': 'estés', '3sg': 'esté', '1pl': 'estemos', '2pl': 'estéis', '3pl': 'estén' }, // estar (1sg "estoy" breaks the -o rule)
  KNOW: { '1sg': 'sepa', '2sg': 'sepas', '3sg': 'sepa', '1pl': 'sepamos', '2pl': 'sepáis', '3pl': 'sepan' },  // saber
  GO:   { '1sg': 'vaya', '2sg': 'vayas', '3sg': 'vaya', '1pl': 'vayamos', '2pl': 'vayáis', '3pl': 'vayan' },  // ir (1sg "voy" breaks the -o rule)
  GIVE: { '1sg': 'dé', '2sg': 'des', '3sg': 'dé', '1pl': 'demos', '2pl': 'deis', '3pl': 'den' },              // dar (1sg "doy" breaks the -o rule)
  HABER: { '1sg': 'haya', '2sg': 'hayas', '3sg': 'haya', '1pl': 'hayamos', '2pl': 'hayáis', '3pl': 'hayan' }, // the resultative's haber
  // -ir verbs whose stressed e→ie diphthong turns to i in the unstressed 1pl/2pl (sienta / sintamos).
  FEEL: { '1sg': 'sienta', '2sg': 'sientas', '3sg': 'sienta', '1pl': 'sintamos', '2pl': 'sintáis', '3pl': 'sientan' }, // sentir
  TRANSFER: {
    '1sg': 'transfiera', '2sg': 'transfieras', '3sg': 'transfiera', '1pl': 'transfiramos', '2pl': 'transfiráis', '3pl': 'transfieran',
  }, // transferir
  ACQUIRE: {
    '1sg': 'adquiera', '2sg': 'adquieras', '3sg': 'adquiera', '1pl': 'adquiramos', '2pl': 'adquiráis', '3pl': 'adquieran',
  }, // adquirir (i→ie, back to i)
};
const PT_SUBJ_OVERRIDE: Record<string, Record<PN, string>> = {
  BE:   { '1sg': 'seja', '2sg': 'seja', '3sg': 'seja', '1pl': 'sejamos', '2pl': 'sejam', '3pl': 'sejam' },               // ser (você/vocês)
  ESTAR: { '1sg': 'esteja', '2sg': 'esteja', '3sg': 'esteja', '1pl': 'estejamos', '2pl': 'estejam', '3pl': 'estejam' }, // estar (1sg "estou" breaks the -o rule)
  KNOW: { '1sg': 'saiba', '2sg': 'saiba', '3sg': 'saiba', '1pl': 'saibamos', '2pl': 'saibam', '3pl': 'saibam' },         // saber
  GIVE: { '1sg': 'dê', '2sg': 'dê', '3sg': 'dê', '1pl': 'demos', '2pl': 'deem', '3pl': 'deem' },                         // dar (1sg "dou" breaks the -o rule)
  GO:   { '1sg': 'vá', '2sg': 'vá', '3sg': 'vá', '1pl': 'vamos', '2pl': 'vão', '3pl': 'vão' },                           // ir (1sg "vou" breaks the -o rule)
  TER:  { '1sg': 'tenha', '2sg': 'tenha', '3sg': 'tenha', '1pl': 'tenhamos', '2pl': 'tenham', '3pl': 'tenham' },         // the resultative's ter
  HAVER: { '1sg': 'haja', '2sg': 'haja', '3sg': 'haja', '1pl': 'hajamos', '2pl': 'hajam', '3pl': 'hajam' },              // the existential's haver (P09-E6)
  WILL: { '1sg': 'queira', '2sg': 'queira', '3sg': 'queira', '1pl': 'queiramos', '2pl': 'queiram', '3pl': 'queiram' },   // querer (1sg "quero" hides the i)
};

// Irregular imperative forms outside the tú command, which only ser and ir have (seamos / sed,
// vamos). Keyed by **lemma**, like the tú commands below and for the same reason (A241).
const ES_IMP_OVERRIDE: Record<string, Partial<Record<IPN, string>>> = {
  ser: { '2sg': 'sé', '1pl': 'seamos', '2pl': 'sed' },         // sé / seamos / sed
  ir: { '2sg': 've', '1pl': 'vamos' },                         // ve / vamos (vosotros "id" is regular)
};
// The eight short *affirmative familiar* tú commands, which are not the 3sg present (di, haz, ve,
// pon, sal, sé, ten, ven) — ve and sé in the table above, the other six here. Keyed by the **lemma**,
// not by the concept: a second concept on a verb already listed reaches the same row (GO_OUT on
// LEAVE's salir, DO on MAKE's hacer — A241), where a concept-keyed table left it the regular 3sg.
// Five are verb *families* whose prefixed compounds command the same way: deshacer → deshaz,
// contener → contén, componer → compón, sobresalir → sobresal, prevenir → prevén. decir does not
// carry its own: bendecir and predecir take the regular "bendice".
const ES_IMP_SHORT: [RegExp, string][] = [
  [/^decir$/, 'di'], [/hacer$/, 'haz'], [/poner$/, 'pon'], [/salir$/, 'sal'], [/tener$/, 'ten'], [/venir$/, 'ven'],
];

/**
 * The short tú command of a verb in one of those families, or undefined. A prefixed compound whose
 * short form ends in -n takes the acute the default stress rule would otherwise pull off the last
 * syllable (contén, compón, prevén); one ending in -z or -l is already stressed there (deshaz,
 * sobresal). The bare verbs keep their unaccented monosyllable (pon, ten, ven).
 */
function esShortCommand(base: string): string | undefined {
  const family = ES_IMP_SHORT.find(([lemma]) => lemma.test(base));
  if (!family) return undefined;
  const short = base.replace(family[0], family[1]);
  const prefixed = short !== family[1];
  return prefixed ? short.replace(/([aeiou])n$/, (_, v: string) => `${ACUTE[v]}n`) : short;
}

const IT_IMP_OVERRIDE: Record<string, Partial<Record<IPN, string>>> = {
  BE:   { '2sg': 'sii', '1pl': 'siamo', '2pl': 'siate' },      // essere: sii / siamo / siate
  KNOW: { '2sg': 'sappi', '1pl': 'sappiamo', '2pl': 'sappiate' }, // sapere: sappi / sappiamo / sappiate
  HAVE: { '2sg': 'abbi', '1pl': 'abbiamo', '2pl': 'abbiate' },   // avere: abbi / abbiamo / abbiate
  // The tu command of the short -are verbs is not their 3sg indicative (dà / fa / va).
  GIVE: { '2sg': "da'" },                                        // dare: da'
  MAKE: { '2sg': "fa'" },                                        // fare: fa'
  DO: { '2sg': "fa'" },                                          // fare, DO's verb too (B62)
  // A multiword lemma commands with its verb's imperative, and keeps its noun (B62).
  NEED: { '2sg': 'abbi bisogno', '1pl': 'abbiamo bisogno', '2pl': 'abbiate bisogno' }, // avere bisogno
  GO:   { '2sg': "va'" },                                        // andare: va'
};
// French imperative is a single paradigm (negation only wraps it), so one override table.
const FR_IMP_OVERRIDE: Record<string, Record<IPN, string>> = {
  BE:   { '2sg': 'sois', '1pl': 'soyons', '2pl': 'soyez' },    // être
  KNOW: { '2sg': 'sache', '1pl': 'sachons', '2pl': 'sachez' }, // savoir
  HAVE: { '2sg': 'aie', '1pl': 'ayons', '2pl': 'ayez' },       // avoir
  GO:   { '2sg': 'va', '1pl': 'allons', '2pl': 'allez' },      // aller
  // A multiword lemma commands with its verb's imperative, and keeps its noun (B62).
  NEED: { '2sg': 'aie besoin', '1pl': 'ayons besoin', '2pl': 'ayez besoin' }, // avoir besoin
};

/**
 * The subjunctive endings of an -ar verb start in -e, where the stem's final consonant would
 * change sound: the spelling absorbs it (cargar → carguemos, tocar → toque, cruzar → cruce).
 * A stem already ending in -gu/-qu is left alone. Only -ar verbs need this — an -er/-ir stem
 * comes off the 1sg present, which already carries the shift (coger → cojo → coja).
 * Portuguese respells ç → c (começar → comece) and keeps z (cruzar → cruze).
 */
function arSubjStem(stem: string, lang: 'es' | 'pt'): string {
  if (/(?:gu|qu)$/.test(stem)) return stem;
  if (lang === 'pt' && stem.endsWith('ç')) return `${stem.slice(0, -1)}c`;
  const respelled = stem
    .replace(/g$/, 'gu')
    .replace(/c$/, 'qu');
  return lang === 'es' ? respelled.replace(/z$/, 'c') : respelled;
}

/**
 * The Spanish 1st/2nd-plural subjunctive stem of an -ar/-er verb. Those persons are stressed on the
 * ending, so a stem-changing verb takes its unstressed stem: "muerd-" → "mord-" (mordamos), "empiez-"
 * → "empez-", "enví-" → "envi-". The 1sg stem is kept unless undoing one stressed-vowel change turns
 * it into the 1pl-present stem, so an irregular 1sg ("veng-", "hag-", "elij-") stays.
 */
function unstressedStem(raw: string, forms: Record<string, string>): string {
  const plural = (forms['1pl_present'] ?? '').replace(/[aei]mos$/, '');
  const candidates = [raw.replace(/ue/, 'o'), raw.replace(/ue/, 'u'), raw.replace(/ie/, 'e'), raw.replace(/í/, 'i'), raw.replace(/ú/, 'u')];
  return candidates.find((c) => c !== raw && c === plural) ?? raw;
}

function subjPresent(
  lang: 'es' | 'pt',
  verb: ConceptForms,
  pn: PN,
): string {
  const override = (lang === 'es' ? ES_SUBJ_OVERRIDE : PT_SUBJ_OVERRIDE)[verb.conceptId];
  if (override) return override[pn];
  const raw = (verb.forms['1sg_present'] ?? '').replace(/o$/, '');
  const base = verb.forms['base'] ?? '';
  const cls = base.endsWith('ar') ? 'ar' : 'er';
  // Only the 1st and 2nd plural are stressed on the ending; the other four keep the stressed stem.
  const endingStressed = pn === '1pl' || pn === '2pl';
  const unstressed = lang === 'es' && endingStressed && !base.endsWith('ir') ? unstressedStem(raw, verb.forms) : raw;
  // A Portuguese -ear verb inserts its i only under stress, so the 1st plural drops it: nomeie, nomeemos.
  const unstressedPt = lang === 'pt' && pn === '1pl' && base.endsWith('ear') ? unstressed.replace(/ei$/, 'e') : unstressed;
  const stem = cls === 'ar' ? arSubjStem(unstressedPt, lang) : unstressedPt;
  return stem + (lang === 'es' ? ES_SUBJ_PRES_END : PT_SUBJ_PRES_END)[cls][pn];
}

// The Italian present subjunctive, from the 1st-singular present minus its -o: an -are verb takes
// -i and every other -a, and an irregular 1sg carries its stem through (faccio → faccia, dico →
// dica, posso → possa, vado → vada). The 1st and 2nd plural are the indicative's own forms. Only
// the verbs whose 1sg does not give the stem are overridden.
const IT_SUBJ_PRES_END: Record<'are' | 'other', Record<PN, string>> = {
  are:   { '1sg': 'i', '2sg': 'i', '3sg': 'i', '1pl': 'iamo', '2pl': 'iate', '3pl': 'ino' },
  other: { '1sg': 'a', '2sg': 'a', '3sg': 'a', '1pl': 'iamo', '2pl': 'iate', '3pl': 'ano' },
};
const IT_SUBJ_PRES_OVERRIDE: Record<string, Record<PN, string>> = {
  BE:   { '1sg': 'sia', '2sg': 'sia', '3sg': 'sia', '1pl': 'siamo', '2pl': 'siate', '3pl': 'siano' },        // essere
  HAVE: { '1sg': 'abbia', '2sg': 'abbia', '3sg': 'abbia', '1pl': 'abbiamo', '2pl': 'abbiate', '3pl': 'abbiano' }, // avere (1sg "ho")
  // The resultative's auxiliary (it.consts `AVERE_AUX`), for the perfect subjunctive "abbia corso" (A260).
  AVERE: { '1sg': 'abbia', '2sg': 'abbia', '3sg': 'abbia', '1pl': 'abbiamo', '2pl': 'abbiate', '3pl': 'abbiano' },
  MUST: { '1sg': 'debba', '2sg': 'debba', '3sg': 'debba', '1pl': 'dobbiamo', '2pl': 'dobbiate', '3pl': 'debbano' }, // dovere
};

// The French present subjunctive, from the 3rd-plural present minus its -ent: ils agissent → agisse,
// ils mangent → mange, ils courent → coure. The 1st and 2nd plural are the imperfect's forms
// (mangions, mangiez). The verbs whose 3pl does not give the stem are overridden.
const FR_SUBJ_PRES_END: Record<PN, string> = { '1sg': 'e', '2sg': 'es', '3sg': 'e', '1pl': 'ions', '2pl': 'iez', '3pl': 'ent' };
const FR_SUBJ_PRES_OVERRIDE: Record<string, Record<PN, string>> = {
  BE:    { '1sg': 'sois', '2sg': 'sois', '3sg': 'soit', '1pl': 'soyons', '2pl': 'soyez', '3pl': 'soient' },   // être
  HAVE:  { '1sg': 'aie', '2sg': 'aies', '3sg': 'ait', '1pl': 'ayons', '2pl': 'ayez', '3pl': 'aient' },        // avoir
  // The resultative's auxiliary (fr.consts `AVOIR_AUX`), for the perfect subjunctive "ait couru" (A260).
  AVOIR: { '1sg': 'aie', '2sg': 'aies', '3sg': 'ait', '1pl': 'ayons', '2pl': 'ayez', '3pl': 'aient' },
  GO:    { '1sg': 'aille', '2sg': 'ailles', '3sg': 'aille', '1pl': 'allions', '2pl': 'alliez', '3pl': 'aillent' }, // aller
  CAN:   { '1sg': 'puisse', '2sg': 'puisses', '3sg': 'puisse', '1pl': 'puissions', '2pl': 'puissiez', '3pl': 'puissent' }, // pouvoir
  MAY:   { '1sg': 'puisse', '2sg': 'puisses', '3sg': 'puisse', '1pl': 'puissions', '2pl': 'puissiez', '3pl': 'puissent' },
  MAKE:  { '1sg': 'fasse', '2sg': 'fasses', '3sg': 'fasse', '1pl': 'fassions', '2pl': 'fassiez', '3pl': 'fassent' },  // faire
  DO:    { '1sg': 'fasse', '2sg': 'fasses', '3sg': 'fasse', '1pl': 'fassions', '2pl': 'fassiez', '3pl': 'fassent' },
  KNOW:  { '1sg': 'sache', '2sg': 'saches', '3sg': 'sache', '1pl': 'sachions', '2pl': 'sachiez', '3pl': 'sachent' },  // savoir
  WILL:  { '1sg': 'veuille', '2sg': 'veuilles', '3sg': 'veuille', '1pl': 'voulions', '2pl': 'vouliez', '3pl': 'veuillent' }, // vouloir
};

/**
 * The present subjunctive in any person: the mood a **content clause** stands in as the subject of an
 * evaluative predicate ("è giusto che si **agisca**", "il est juste qu'on **agisse**", "es correcto
 * que se **actúe**", "é certo que se **aja**" — localization C30), and the one a relative clause
 * takes under a negated antecedent in Spanish and Portuguese ("ningún gato que **coma**", A170).
 * English, German and Japanese have no such mood and never call this.
 *
 * Each language derives it from a stored present it already has, so no paradigm is seeded: es/pt from
 * the 1st singular, Italian from the 1st singular, French from the 3rd plural — in each case the form
 * that carries the irregular stem. The verbs whose stored form does not carry it are overridden above.
 * Undefined when the source form is missing, so the caller conjugates instead.
 */
function presentSubjunctiveForm(lang: LanguageCode, verb: ConceptForms, pn: PN): string | undefined {
  if (lang === 'it') {
    const override = IT_SUBJ_PRES_OVERRIDE[verb.conceptId];
    if (override) return override[pn];
    const stem = (verb.forms['1sg_present'] ?? '').replace(/o$/, '');
    if (!stem) return undefined;
    const ending = IT_SUBJ_PRES_END[(verb.forms['base'] ?? '').endsWith('are') ? 'are' : 'other'][pn];
    // An -iare verb writes one i, not two: mangiare → mangi, not "mangii" (the same spelling rule
    // its 2nd-singular present already follows).
    return stem.endsWith('i') && ending.startsWith('i') ? stem + ending.slice(1) : stem + ending;
  }
  if (lang === 'fr') {
    const override = FR_SUBJ_PRES_OVERRIDE[verb.conceptId];
    if (override) return override[pn];
    const stem = (verb.forms['3pl_present'] ?? '').replace(/ent$/, '');
    if (!stem) return undefined;
    return stem + FR_SUBJ_PRES_END[pn];
  }
  if (lang !== 'es' && lang !== 'pt') return undefined;
  const override = (lang === 'es' ? ES_SUBJ_OVERRIDE : PT_SUBJ_OVERRIDE)[verb.conceptId];
  if (!override && !verb.forms['1sg_present']) return undefined;
  return subjPresent(lang, verb, pn);
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
 *  - fr: tu = 2sg-present, minus its -s where the form ends in -es — that is the -er paradigm
 *        (tu manges → mange) and with it the ouvrir/offrir/couvrir/souffrir/cueillir class, which
 *        takes -er endings on an -ir infinitive (tu ouvres → ouvre). An -is or -s 2sg keeps it
 *        (choisis, cours). nous = 1pl-present, vous = 2pl-present; the same form serves the
 *        negative, which the engine wraps in "ne … pas".
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
      return ES_IMP_OVERRIDE[base]?.[pn]
        ?? (pn === '2sg' ? (esShortCommand(base) ?? f['3sg_present'] ?? '')
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
      return two.endsWith('es') ? two.replace(/s$/, '') : two; // an -es 2sg drops its -s
    }
    default:
      return undefined;
  }
}
