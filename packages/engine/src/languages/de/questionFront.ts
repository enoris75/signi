import type { ResolvedPhrase } from '../../types.js';
import { objectPreposition } from '../../functions/objectPreposition.js';
import { objectCase } from './objectCase.js';
import { questionWord } from './questionWord.js';
import { splitObject } from './splitObject.js';

/**
 * What a German wh-question over anything but the subject puts in the front field, and the clause
 * left behind it, for `germanEngine` to write as V2 (P09-E6). Mostly that is the word alone, the
 * clause unchanged (`questionWord`: "was frisst der Kater?", "wo frisst der Kater?").
 *
 * A possessor question inside the object fronts the **whole object phrase**, *wessen* in its
 * determiner's place (P09-E14): "wessen Essen frisst der Kater?", in the case its verb gives it
 * and with the preposition a prepositional object takes ("von wessen Haus hängt der Kater ab?").
 * The object slot is left empty behind it.
 */
export function questionFront(phrase: ResolvedPhrase): { word: string; rest: ResolvedPhrase } {
  const gap = phrase.question!;
  const verb = phrase.verbPhrase!.verb;
  if (gap.role === 'possessor' && gap.possessed === 'directObject' && phrase.directObject) {
    const { noun, prepositional } = splitObject(phrase.directObject, '', objectPreposition(verb), objectCase(verb));
    return { word: noun || prepositional, rest: { ...phrase, directObject: undefined } };
  }
  return { word: questionWord(gap, verb), rest: phrase };
}
