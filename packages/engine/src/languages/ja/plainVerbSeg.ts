import type { Tense } from '@signi/shared';
import type { ConceptForms, RubySegment } from '../../types.js';
import { wordSeg } from './wordSeg.js';

/**
 * The plain (dictionary / plain-past) form of a verb, for a subordinate predicate. A prenominal
 * relative clause takes the plain form, not the polite ます/ました of a main clause (食べる猫 /
 * 食べた猫, never 食べます猫). Non-past is the dictionary form; the past is the plain past (た-form),
 * derived from the te-form exactly as taraSeg builds its stem (て→た, で→だ). Falls back to the
 * dictionary form when no te-form is stored. Negation and aspect are NOT plain-formed here — they
 * still route through the polite verbSeg / aspectVerbSegs, a documented remaining gap (see the
 * negative and aspectual relative-clause tests, which lock the current polite output).
 */
export function plainVerbSeg(verb: ConceptForms, tense: Tense): RubySegment {
  const base = verb.forms['base'] ?? '';
  const reading = verb.forms['reading'];
  if (tense !== 'past') return wordSeg(base, reading); // dictionary form (present / future)
  const te = verb.forms['te'];
  if (!te) return wordSeg(base, reading);
  const toTa = (s: string) => s.slice(0, -1) + (s.endsWith('で') ? 'だ' : 'た');
  const teReading = verb.forms['te_reading'];
  return wordSeg(toTa(te), teReading ? toTa(teReading) : undefined);
}
