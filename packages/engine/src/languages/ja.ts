import { COMPLEMENT_RENDER_ORDER, type ComplementType, type PathSpecifier, type Tense } from '@signi/shared';
import { npAdj, pathSpecifier, type ResolvedComplement, type LanguageEngine, type ResolvedPhrase } from '../types.js';

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

function complementsText(complements?: Partial<Record<ComplementType, ResolvedComplement>>): string {
  if (!complements) return '';
  return COMPLEMENT_RENDER_ORDER
    .map((type) => {
      const c = complements[type];
      if (!c) return '';
      const word = npAdj(c.phrase) + (c.phrase.head.forms['base'] ?? '');
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
    const { subject, verbPhrase, directObject, indirectObject } = phrase;
    const { verb, negative: verbNegative, modifier, tense = 'present' } = verbPhrase;

    const subjectText = npAdj(subject) + subjectWord(subject.head.forms) + 'は';
    const masuPresent = verb.forms['masu_present'] ?? verb.forms['base'] ?? '';
    // The polite past is the masu-stem + ました (negative ませんでした). Japanese
    // has no dedicated future, so future reuses the present (masu) form.
    const stem: string | null = masuPresent.endsWith('ます') ? masuPresent.slice(0, -2) : null;
    let verbText: string;
    if (tense === 'past' && stem !== null) {
      verbText = verbNegative ? stem + 'ませんでした' : stem + 'ました';
    } else {
      // present / future — ます, negated to ません
      verbText = verbNegative && stem !== null ? stem + 'ません' : masuPresent;
    }
    const directObjectText = directObject
      ? npAdj(directObject) + (directObject.head.forms['base'] ?? '') + 'を'
      : '';
    const indirectObjectText = indirectObject
      ? npAdj(indirectObject) + (indirectObject.head.forms['base'] ?? '') + 'に'
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
