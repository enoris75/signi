import type { ConceptForms } from '../../types.js';

/**
 * A reflexive verb with "sich" taken off its citation infinitive ("sich bewegen" → "bewegen"), so its
 * infinitive, zu-infinitive and command are derived as a plain verb's; its finite forms already are
 * ("bewegt"). A German reflexive verb forms its perfect with haben ("hat sich bewegt"), so any `aux` is
 * dropped. The caller places the pronoun (`reflexivePronoun`). Any other verb is returned as it is.
 */
export function nonReflexiveVerb(verb: ConceptForms): ConceptForms {
  const base = verb.forms['base'] ?? '';
  if (!base.startsWith('sich ')) return verb;
  const forms: Record<string, string> = { ...verb.forms, base: base.slice('sich '.length) };
  delete forms['aux'];
  return { ...verb, forms };
}
