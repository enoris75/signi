import { COMPLEMENT_RENDER_ORDER, type ComplementType, type PathSpecifier } from '@signi/shared';
import { adjString, pathSpecifier, type ConceptForms, type LanguageEngine, type ResolvedPhrase } from '../types.js';

function subjectWord(forms: Record<string, string>): string {
  if (forms['person'] && forms['number'] === 'plural' && forms['plural']) return forms['plural'];
  return forms['base'] ?? '';
}

/** Postposition particle per complement type. (Route を is safe: motion verbs are intransitive.) */
const PARTICLE: Record<ComplementType, string> = {
  locative: 'で',
  direction: 'へ',
  source: 'から',
  route: 'を',
};

/** Path relations expressed via a relational noun before を ("橋の下を" = under the bridge). */
const REL_NOUN: Record<PathSpecifier, string> = {
  through: '',
  under: 'の下',
  over: 'の上',
  around: 'の周り',
  behind: 'の後ろ',
  in_front_of: 'の前',
};

function complementsText(complements?: Partial<Record<ComplementType, ConceptForms>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const word = c.forms['base'] ?? '';
      const rel = type === 'route' ? REL_NOUN[pathSpecifier(c)] : '';
      return word + rel + PARTICLE[type];
    })
    .join('');
}

/**
 * Japanese word order: S IndObj+に DirectObj+を Adv V
 * Particles: は (topic/subject), を (direct object), に (indirect object/dative)
 */
export const japaneseEngine: LanguageEngine = {
  language: 'ja',
  render(phrase: ResolvedPhrase): string {
    const { subject, subjectAdjective, subjectAdjective2, verb, verbNegative,
      directObject, directObjectAdjective, directObjectAdjective2,
      indirectObject, indirectObjectAdjective, indirectObjectAdjective2, modifier } = phrase;

    const subjectText = adjString(subjectAdjective, subjectAdjective2) + subjectWord(subject.forms) + 'は';
    const masuPresent = verb.forms['masu_present'] ?? verb.forms['base'] ?? '';
    // Negative: ます → ません
    const verbText = verbNegative && masuPresent.endsWith('ます')
      ? masuPresent.slice(0, -2) + 'ません'
      : masuPresent;
    const directObjectText = directObject
      ? adjString(directObjectAdjective, directObjectAdjective2) + (directObject.forms['base'] ?? '') + 'を'
      : '';
    const indirectObjectText = indirectObject
      ? adjString(indirectObjectAdjective, indirectObjectAdjective2) + (indirectObject.forms['base'] ?? '') + 'に'
      : '';
    const modifierText = modifier ? (modifier.forms['base'] ?? '') : '';
    const complementText = complementsText(phrase.complements);

    // SOV: subject [complements] indirectObj directObj adv verb
    return [subjectText, complementText, indirectObjectText, directObjectText, modifierText, verbText]
      .filter(Boolean)
      .join('')
      .trim();
  },
};
