import type { Translation } from '@signi/shared';
import { engines } from '../translator.consts.js';
import type { LexiconLookup } from '../translator.types.js';
import { resolve } from './resolve.js';

/**
 * Render a word — or a few words naming one thing together ("second singular") — into every
 * language: a UI label, which is a word and not a period (see UiStringWordDef). `agreesWith`
 * names the noun the words describe: an adjective has no meaningful form until something fixes
 * its gender/number, and a label like the "first" of the person row is agreeing with the row's
 * own noun even though that noun is nowhere on screen. Its gender is a fact about each language's
 * lexicon (it "persona" is feminine, "genere" masculine), so it is resolved per language and
 * threaded onto each word's own forms for the engine to read. Several words are joined the way
 * the language joins words — with a space, or with nothing in Japanese.
 */
export function translateWord(
  conceptIds: string | string[],
  lookup: LexiconLookup,
  agreesWith?: string,
): Translation[] {
  const ids = Array.isArray(conceptIds) ? conceptIds : [conceptIds];
  return engines.map((engine) => {
    const words = ids.map((id) => {
      const word = resolve(id, engine.language, lookup);
      if (agreesWith) {
        const noun = resolve(agreesWith, engine.language, lookup).forms;
        word.forms['gender'] = noun['gender'] ?? 'masc';
        word.forms['number'] = noun['number'] ?? noun['count'] ?? 'singular';
      }
      return engine.renderWord?.(word) ?? word.forms['base'] ?? '';
    });
    return {
      language: engine.language,
      text: words.filter(Boolean).join(engine.wordJoiner ?? ' '),
    };
  });
}
