import { germanEngine } from '../languages/de/index.js';
import { englishEngine } from '../languages/en/index.js';
import { spanishEngine } from '../languages/es/index.js';
import { frenchEngine } from '../languages/fr/index.js';
import { italianEngine } from '../languages/it/index.js';
import { japaneseEngine } from '../languages/ja/index.js';
import { portugueseEngine } from '../languages/pt/index.js';
import type { LanguageEngine } from '../types.js';

export const engines: LanguageEngine[] = [
  englishEngine,
  italianEngine,
  frenchEngine,
  germanEngine,
  spanishEngine,
  japaneseEngine,
  portugueseEngine,
];

/** Determiners that are inherently plural, so they render the plural noun surface. */
export const PLURAL_DETERMINERS = new Set(['some', 'many', 'few', 'all']);

/** The agreement keys a group carries — see ResolvedNounElement.agreement. Nothing renderable. */
export const AGREEMENT_KEYS = ['person', 'number', 'gender'] as const;

/**
 * Languages whose "or" group of mixed persons agrees as the plural of the prevailing person, like
 * "and" — French "toi ou moi, nous mangeons" (Grevisse, *Le Bon Usage*). A group of one person keeps
 * the nearest-conjunct rule ("le chat ou le chien court").
 */
export const OR_RESOLVES_MIXED_PERSONS: ReadonlySet<string> = new Set(['fr']);
