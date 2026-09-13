import type { ConceptForms, RubySegment } from '../../types.js';
import { wordSeg } from './wordSeg.js';

/**
 * The ～たら conditional form of a verb (the protasis of a hypothetical: 食べたら "if … eats").
 * Built on the te-form: the plain past is te with て→た / で→だ, then ～ら. Falls back to the
 * dictionary form + たら when no te-form is stored.
 */
export function taraSeg(verb: ConceptForms): RubySegment {
  const te = verb.forms['te'];
  if (!te) return wordSeg(`${verb.forms['base'] ?? ''}たら`, undefined);
  const toTa = (s: string) => s.slice(0, -1) + (s.endsWith('で') ? 'だ' : 'た');
  const teReading = verb.forms['te_reading'];
  return wordSeg(`${toTa(te)}ら`, teReading ? `${toTa(teReading)}ら` : undefined);
}
