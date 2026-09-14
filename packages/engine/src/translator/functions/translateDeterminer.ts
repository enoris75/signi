import type { Definiteness, Translation } from '@signi/shared';
import { engines, PLURAL_DETERMINERS } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolve } from './resolve.js';

/**
 * Render one determiner value into every language — the words of the UI's determiner menu (see
 * UiStringDeterminerDef). A determiner has no form of its own: it agrees with the noun it
 * determines, and in the Romance languages it also elides against that noun's first sound. So it
 * is cited *with* a noun — `agreesWith`, the same device the adjective labels use — whose
 * gender/number/first letter each engine reads off the forms threaded here. The noun itself is
 * not rendered; only the determiner it would take comes back.
 *
 * A language that spells no determiner here (the bare article in all seven; every article in
 * Japanese, which leaves identifiability to context) renders '' and is shown as an em-dash — the
 * same "no word goes here" the bare determiner means.
 */
export function translateDeterminer(
  value: Definiteness,
  lookup: LexiconLookup,
  agreesWith = 'NOUN',
): Translation[] {
  return engines.map((engine) => {
    const noun = resolve(agreesWith, engine.language, lookup);
    noun.forms['definiteness'] = value;
    // The inherently-plural quantifiers name themselves in the plural, which is both how they
    // are spoken and what tells them apart where they inflect (it "molti / pochi / tutti"). The
    // articles, the demonstratives and `no` name themselves in the singular — the same rule the
    // noun phrases themselves follow, so it comes off the same set.
    noun.forms['number'] = PLURAL_DETERMINERS.has(value) ? 'plural' : 'singular';
    return {
      language: engine.language,
      text: engine.renderDeterminer?.(noun)?.trim() || '—',
    };
  });
}
