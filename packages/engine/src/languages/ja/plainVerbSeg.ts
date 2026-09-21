import type { Tense } from '@signi/shared';
import type { ConceptForms, RubySegment } from '../../types.js';
import { verbSeg } from './verbSeg.js';
import { wordSeg } from './wordSeg.js';

/**
 * The plain (dictionary / plain-past) form of a verb, for a subordinate predicate. A prenominal
 * relative clause takes the plain form, not the polite ます/ました of a main clause (食べる猫 /
 * 食べた猫, never 食べます猫), and so do a citation (食べる。) and the clause of purpose (食べるために).
 * Non-past is the dictionary form; the past is the plain past (た-form), derived from the te-form
 * exactly as taraSeg builds its stem (て→た, で→だ). Falls back to the dictionary form when no te-form
 * is stored.
 *
 * `negative` gives the plain negative, the seeded nai-form (食べない, 来ない, しない; stored because
 * godan and ichidan verbs both end in -る and the irregulars share no rule), its past turning the final
 * い into かった (食べなかった) as an i-adjective does (B13). A verb with no nai-form falls back to the
 * polite negative (食べません). A non-neutral aspect is not formed here: `aspectVerbSegs` takes the
 * same plain ending (食べている猫, B14).
 */
export function plainVerbSeg(verb: ConceptForms, tense: Tense, negative = false): RubySegment {
  if (negative) {
    const nai = verb.forms['nai'];
    if (!nai) return verbSeg(verb, true, tense);
    const naiReading = verb.forms['nai_reading'];
    if (tense !== 'past') return wordSeg(nai, naiReading);
    const toKatta = (s: string) => `${s.slice(0, -1)}かった`;
    return wordSeg(toKatta(nai), naiReading ? toKatta(naiReading) : undefined);
  }
  const base = verb.forms['base'] ?? '';
  const reading = verb.forms['reading'];
  if (tense !== 'past') return wordSeg(base, reading); // dictionary form (present / future)
  const te = verb.forms['te'];
  if (!te) return wordSeg(base, reading);
  const toTa = (s: string) => s.slice(0, -1) + (s.endsWith('で') ? 'だ' : 'た');
  const teReading = verb.forms['te_reading'];
  return wordSeg(toTa(te), teReading ? toTa(teReading) : undefined);
}
