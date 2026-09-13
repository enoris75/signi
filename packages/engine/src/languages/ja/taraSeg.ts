import type { ConceptForms, RubySegment } from '../../types.js';
import { masuStem } from './masuStem.js';
import { wordSeg } from './wordSeg.js';

/**
 * The ～たら conditional form of a verb (the protasis of a hypothetical: 食べたら "if … eats").
 * Built on the te-form: the plain past is te with て→た / で→だ, then ～ら. Falls back to the
 * dictionary form + たら when no te-form is stored.
 *
 * The negative is built on the seeded plain negative (`nai`): its い becomes かったら (食べない →
 * 食べなかったら). A verb with no nai-form falls back to the polite 食べませんでしたら.
 */
export function taraSeg(verb: ConceptForms, negative = false): RubySegment {
  if (negative) {
    const nai = verb.forms['nai'];
    const naiReading = verb.forms['nai_reading'];
    if (nai) return wordSeg(`${nai.slice(0, -1)}かったら`, naiReading ? `${naiReading.slice(0, -1)}かったら` : undefined);
    const st = masuStem(verb);
    if (st) return wordSeg(`${st.stem}ませんでしたら`, st.reading !== undefined ? `${st.reading}ませんでしたら` : undefined);
  }
  const te = verb.forms['te'];
  if (!te) return wordSeg(`${verb.forms['base'] ?? ''}たら`, undefined);
  const toTa = (s: string) => s.slice(0, -1) + (s.endsWith('で') ? 'だ' : 'た');
  const teReading = verb.forms['te_reading'];
  return wordSeg(`${toTa(te)}ら`, teReading ? `${toTa(teReading)}ら` : undefined);
}
