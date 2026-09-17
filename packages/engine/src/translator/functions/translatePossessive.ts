import type { PronominalPossessor, Translation } from '@signi/shared';
import { engines } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolve } from './resolve.js';

/**
 * Render one pronominal possessor's possessive word into every language — the label the UI puts on
 * a coreference link (see UiStringPossessiveDef). A possessive pronoun has no citation form of its
 * own: English, German and Japanese spell it from the antecedent's person/number/gender alone, but
 * the Romance languages *also* agree it with the noun it possesses ("il **suo** cane", "la **sua**
 * casa"). So it is cited *with* a noun — `agreesWith`, the same device the determiner labels use —
 * whose gender/number/first sound each engine reads off the forms threaded here. The noun itself is
 * not rendered, nor the article that would precede the possessive; only the possessive comes back.
 *
 * A language that spells no possessive here renders '' and is shown as an em-dash, like the bare
 * determiner. None of the seven does today.
 */
export function translatePossessive(
  possessor: PronominalPossessor,
  lookup: LexiconLookup,
  agreesWith = 'NOUN',
): Translation[] {
  return engines.map((engine) => {
    const noun = resolve(agreesWith, engine.language, lookup);
    // A possessive is cited on a singular noun, the number a citation form is given in — the same
    // choice the determiner labels make for everything but the inherently-plural quantifiers.
    noun.forms['number'] = 'singular';
    return {
      language: engine.language,
      text: engine.renderPossessive?.(noun, possessor)?.trim() || '—',
    };
  });
}
