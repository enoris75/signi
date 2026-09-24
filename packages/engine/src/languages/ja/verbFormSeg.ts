import type { ConceptForms, RubySegment } from '../../types.js';
import type { JaForm } from './ja.types.js';
import { masuStem } from './masuStem.js';
import { wordSeg } from './wordSeg.js';

/**
 * The main verb in the form its governing modal demands (行く vs 行き). The stem is the ます stem, but
 * for a lexeme that stores a `stem` of its own: the ラ-row honorifics whose ます form is irregular take
 * the regular り stem before たい (いらっしゃいます but いらっしゃりたい, A333).
 */
export function verbFormSeg(verb: ConceptForms, form: JaForm): RubySegment {
  if (form === 'dict') return wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
  const own = verb.forms['stem'];
  if (own) return wordSeg(own, verb.forms['stem_reading']);
  const st = masuStem(verb);
  return st ? wordSeg(st.stem, st.reading) : wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
}
