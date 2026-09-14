import type { Aspect, Tense } from '@signi/shared';
import type { VerbComplex } from './de.types.js';
import { HABEN, SEIN, WERDEN, WUERDE } from './de.consts.js';
import { isConditionalMood } from './isConditionalMood.js';
import { zuInfinitive } from './zuInfinitive.js';

/**
 * The German verb complex for a tense + aspect, split across the clause: `v2` is the finite
 * verb in the V2 slot, `mid` is any material that follows it in the Mittelfeld ("gerade",
 * "im Begriff"), and `tail` is the clause-final non-finite material. German has no synthetic
 * progressive, so it is rendered with the adverb "gerade" over the plain finite verb; the
 * prospective is "im Begriff sein" + a zu-infinitive, returned apart as `zuInfinitive` because it
 * heads a group the clause lays out on its own (see `prospectiveFrame`); the resultative is
 * sein/haben + Partizip II, the auxiliary being a lexical property of the verb (the seed marks the
 * sein-selecting ones with forms.aux = "be") — "ist gegangen" but "hat gesehen".
 */
export function verbGroup(
  verbForms: Record<string, string>,
  pn: string,
  tense: Tense,
  aspect: Aspect,
  mood?: string,
): VerbComplex {
  const base = verbForms['base'] ?? '';
  const participle = verbForms['participle'] ?? base;
  // The conditional mood is periphrastic like the future — würde/werden in V2, infinitive at
  // the clause end — so the two share every branch, differing only in the auxiliary word.
  const conditional = isConditionalMood(mood);
  const periphrastic = tense === 'future' || conditional;
  const auxV2 = conditional ? (WUERDE[pn] ?? 'würde') : (WERDEN[pn] ?? 'wird');
  const sein = periphrastic ? '' : SEIN[tense][pn];
  const perfAux = verbForms['aux'] === 'be' ? 'sein' : 'haben';
  const perfFinite = periphrastic ? '' : (perfAux === 'sein' ? SEIN : HABEN)[tense][pn];
  const conjug = periphrastic ? auxV2 : (verbForms[`${pn}_${tense}`] ?? verbForms[tense] ?? verbForms[`${pn}_present`] ?? base);
  // A separable verb's own finite form leaves its particle for the clause to place (A138): "fügt … hinzu".
  const particle = !periphrastic && verbForms['particle'] ? { particle: verbForms['particle'] } : {};
  switch (aspect) {
    case 'progressive':
      // Plain finite verb + "gerade"; periphrastic keeps aux … Infinitiv, with "gerade" mid.
      return { v2: conjug, mid: 'gerade', tail: periphrastic ? base : '', zuInfinitive: '', ...particle };
    case 'prospective':
      // Future/conditional put "sein" at the clause end ("wird im Begriff sein").
      return {
        v2: periphrastic ? auxV2 : sein,
        mid: 'im Begriff',
        tail: periphrastic ? 'sein' : '',
        zuInfinitive: zuInfinitive(verbForms),
      };
    case 'resultative':
      // Future/conditional perfect stacks the auxiliary's infinitive at the clause end
      // ("wird gesehen haben" / "würde gesehen haben").
      return {
        v2: periphrastic ? auxV2 : perfFinite,
        mid: '',
        tail: periphrastic ? `${participle} ${perfAux}` : participle,
        zuInfinitive: '',
      };
    default: // neutral
      return { v2: conjug, mid: '', tail: periphrastic ? base : '', zuInfinitive: '', ...particle };
  }
}
