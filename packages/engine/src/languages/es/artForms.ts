import type { EsAdjectives } from './es.types.js';

/**
 * The forms an article is chosen from. The stressed-a exception ("el agua") exists only to
 * break the a-a hiatus between article and noun, so it lapses as soon as a prenominal
 * adjective comes between them: "la primera agua", not "*el primera agua".
 */
export function artForms(forms: Record<string, string>, adj?: EsAdjectives): Record<string, string> {
  return adj?.pre ? { ...forms, stressed_a: '' } : forms;
}
