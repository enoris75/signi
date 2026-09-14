import { mannerRelation } from '../../resolved/mannerRelation.js';

/**
 * The preposition and case a German manner noun governs, read off its `mannerRelation`: mode "auf" +
 * accusative ("auf eine gute Weise"), means / measure "mit" + dative ("mit Sorgfalt", "mit hoher
 * Geschwindigkeit"), similative "wie" + nominative ("wie der Wind", the default).
 *
 * A noun the German lexicon marks `temporal` names a point in time, which takes "zu" + dative
 * whatever its relation: "zu allen Zeiten", "zu keiner Zeit". Under "mit" it would read "together
 * with all times". The other languages keep their measure preposition ("at all times"), so the mark
 * sits on the German word, not on the concept's relation.
 */
export function mannerPrepCase(forms: Record<string, string>): readonly [string, 'nom' | 'acc' | 'dat'] {
  if (forms['temporal'] === '1') return ['zu', 'dat'];
  const rel = mannerRelation(forms);
  if (rel === 'mode') return ['auf', 'acc'];
  if (rel === 'means' || rel === 'measure') return ['mit', 'dat'];
  return ['wie', 'nom'];
}
