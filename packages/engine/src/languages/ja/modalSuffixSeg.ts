import type { ConceptForms, RubySegment } from '../../types.js';
import type { JaForm } from './ja.types.js';
import { wordSeg } from './wordSeg.js';

/** A modal's own suffix in the requested form (〜ことができる vs 〜ことができ). */
export function modalSuffixSeg(m: ConceptForms, form: JaForm): RubySegment {
  return wordSeg(m.forms[`suffix_${form}`] ?? '', m.forms[`suffix_${form}_reading`]);
}
