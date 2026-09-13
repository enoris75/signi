import type { ConceptForms, RubySegment } from '../../types.js';
import type { JaIPN } from './ja.types.js';
import { masuStem } from './masuStem.js';
import { wordSeg } from './wordSeg.js';

/**
 * The imperative verb segment(s). The 1st-plural is the cohortative ～ましょう ("let's eat",
 * 食べましょう) off the masu-stem. The 2nd person is the polite request ～てください (食べてください)
 * built on the te-form; its negative uses the plain prohibitive ～な (走るな) — a deliberate
 * register gap (the affirmative stays polite), taken because the polite ～ないでください would need a
 * nai-form the lexicon doesn't store.
 *
 * An `instruction` (a button, a menu entry, a recipe step) is addressed to nobody, and Japanese
 * does not command there: it labels with the verb's verbal noun — 保存, 読み込み, 追加 — so
 * "文を読み込んでください" ("please load a period") becomes "文を読み込み". The noun is the `label`
 * form seeded on the ja verb; failing that it derives from the masu-stem, minus the し a
 * する-verb ends on (保存し → 保存). Its negative is the prohibitive ～ないこと ("走らないこと"),
 * which the lexicon's nai-form gap likewise rules out, so a negative instruction keeps ～な.
 */
export function jaImperativeSegs(verb: ConceptForms, pn: JaIPN, negative: boolean, instruction = false): RubySegment[] {
  if (instruction && !negative) {
    const label = verb.forms['label'];
    if (label) return [wordSeg(label, verb.forms['label_reading'] ?? labelReading(verb, label))];
    const st = masuStem(verb);
    if (st) return [wordSeg(st.stem.replace(/し$/, ''), st.reading?.replace(/し$/, ''))];
  }
  if (pn === '1pl') {
    if (negative) {
      // "let's not eat" → 食べるのはやめましょう ("let's refrain from eating"). The hortative ～ましょう
      // rides やめる ("stop"), so the negation is not dropped; built on the dictionary form, it
      // sidesteps the nai-form the lexicon doesn't store.
      const base = verb.forms['base'] ?? '';
      return [wordSeg(base, verb.forms['reading']), { t: 'のはやめましょう' }];
    }
    const st = masuStem(verb);
    if (st) return [wordSeg(st.stem + 'ましょう', st.reading !== undefined ? st.reading + 'ましょう' : undefined)];
    return [wordSeg((verb.forms['masu_present'] ?? verb.forms['base'] ?? '').replace(/ます$/, '') + 'ましょう')];
  }
  if (negative) {
    const base = verb.forms['base'] ?? '';
    return [wordSeg(base + 'な', verb.forms['reading'] ? verb.forms['reading'] + 'な' : undefined)];
  }
  const te = verb.forms['te'];
  const teSeg = te ? wordSeg(te, verb.forms['te_reading']) : wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
  return [teSeg, { t: 'ください' }];
}

/**
 * The reading of a verbal-noun label with no seeded `label_reading`, when the label is the verb's
 * masu-stem or that stem without its する (読み込み ← 読み込み, 保存 ← 保存し): the stem's reading,
 * trimmed the same way. Otherwise none.
 */
function labelReading(verb: ConceptForms, label: string): string | undefined {
  const st = masuStem(verb);
  if (!st?.reading) return undefined;
  if (st.stem === label) return st.reading;
  if (st.stem === `${label}し` && st.reading.endsWith('し')) return st.reading.slice(0, -1);
  return undefined;
}
