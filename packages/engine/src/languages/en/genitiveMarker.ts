import type { ResolvedNounPhrase } from '../../types.js';

/**
 * The Saxon genitive marker for a possessor: "'s", but a bare "'" after a plural that
 * already ends in -s ("the cats' book").
 */
export function genitiveMarker(np: ResolvedNounPhrase): string {
  const forms = np.head.forms;
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  const word = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
  return plural && word.endsWith('s') ? "'" : "'s";
}
