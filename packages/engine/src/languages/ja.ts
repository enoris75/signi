import type { LanguageEngine, ResolvedPhrase } from '../types.js';

function subjectWord(forms: Record<string, string>): string {
  if (forms['person'] && forms['number'] === 'plural' && forms['plural']) return forms['plural'];
  return forms['base'] ?? '';
}

/**
 * Japanese word order: S IndObj+に DirectObj+を Adv V
 * Particles: は (topic/subject), を (direct object), に (indirect object/dative)
 */
export const japaneseEngine: LanguageEngine = {
  language: 'ja',
  render(phrase: ResolvedPhrase): string {
    const { subject, subjectAdjective, verb, verbNegative, directObject, indirectObject, modifier } = phrase;

    const adjBase = subjectAdjective?.forms['base'] ?? '';
    const subjectText = adjBase + subjectWord(subject.forms) + 'は';
    const masuPresent = verb.forms['masu_present'] ?? verb.forms['base'] ?? '';
    // Negative: ます → ません
    const verbText = verbNegative && masuPresent.endsWith('ます')
      ? masuPresent.slice(0, -2) + 'ません'
      : masuPresent;
    const directObjectText = directObject ? (directObject.forms['base'] ?? '') + 'を' : '';
    const indirectObjectText = indirectObject ? (indirectObject.forms['base'] ?? '') + 'に' : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';

    // SOV: subject indirectObj directObj adv verb
    return [subjectText, indirectObjectText, directObjectText, modifierText, verbText]
      .filter(Boolean)
      .join('')
      .trim();
  },
};
