import type { ConceptForms } from '../../types.js';
import type { JaRespect } from './jaRespectRegister.js';

/** The forms a Japanese verb conjugates from, each with its `_reading`, as a register column stores them. */
const PARADIGM = ['base', 'masu_present', 'te', 'nai'] as const;

/**
 * The verb in a register of respect (P11-E1 D2): the lexeme's `honorific` or `humble` word, which
 * is **suppletive** — 食べる → 召し上がる / いただく is not a rule — and so is stored rather than
 * derived. A register column holds a small paradigm of its own, the forms every polite path of the
 * predicate conjugates from: `honorific` (the dictionary form), `honorific_masu_present`,
 * `honorific_te` and `honorific_nai`, each with a `_reading` where the word has kanji. The
 * irregular polite stems are why the ます form is stored: いらっしゃる is いらっしゃいます, not
 * いらっしゃります.
 *
 * Everything else the lexeme says — its object particle, its content-clause link (おっしゃると) —
 * stays, since it is the same verb in another register. A reading the register has none of is
 * cleared, not inherited: いらっしゃる must not be read いく. A verb with no column for the register
 * is returned unchanged, which is what every verb without a suppletive form does.
 */
export function jaRespectVerb(verb: ConceptForms, register: JaRespect | undefined): ConceptForms {
  if (!register || !verb.forms[register]) return verb;
  const forms = { ...verb.forms };
  for (const key of PARADIGM) {
    const column = key === 'base' ? register : `${register}_${key}`;
    const surface = verb.forms[column];
    if (surface) forms[key] = surface; else delete forms[key];
    const reading = verb.forms[`${column}_reading`];
    const readingKey = key === 'base' ? 'reading' : `${key}_reading`;
    if (reading) forms[readingKey] = reading; else delete forms[readingKey];
  }
  return { ...verb, forms };
}
