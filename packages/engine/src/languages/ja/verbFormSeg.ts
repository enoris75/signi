import type { ConceptForms, RubySegment } from '../../types.js';
import type { JaForm } from './ja.types.js';
import { masuStem } from './masuStem.js';
import { wordSeg } from './wordSeg.js';

/** The main verb in the form its governing modal demands (行く vs 行き). */
export function verbFormSeg(verb: ConceptForms, form: JaForm): RubySegment {
  if (form === 'dict') return wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
  const st = masuStem(verb);
  return st ? wordSeg(st.stem, st.reading) : wordSeg(verb.forms['base'] ?? '', verb.forms['reading']);
}
