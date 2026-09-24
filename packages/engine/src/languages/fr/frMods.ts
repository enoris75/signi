import type { ResolvedNounPhrase } from '../../types.js';
import { REL_PREP_FR } from './fr.consts.js';
import { dePrep } from './dePrep.js';
import { elidesBefore } from './elidesBefore.js';
import { joinArt } from './joinArt.js';
import { liaisonAdjectives } from './liaisonAdjectives.js';
import { splitAdjectives } from './splitAdjectives.js';

/**
 * Postnominal attributive nouns as a bare "prep + noun" string ("de phrases sémantiques"). The
 * modifier takes its own number, and its adjectives agree with *its* gender/number and take the
 * noun-phrase positions: a prenominal one before the modifier noun ("de petites maisons"), the rest
 * after it ("de phrases sémantiques"). "de" elides against the word right after it, a mute h
 * included ("d'hommes"). A `domain` takes the generic definite article, fused ("mouche du
 * temps", "mouches de l'île").
 */
export function frMods(np: ResolvedNounPhrase): string {
  return np.nounModifiers
    .map((m) => {
      const forms = m.concept.forms;
      const plural = (forms['number'] ?? forms['count']) === 'plural';
      const noun = plural ? (forms['plural'] ?? forms['base'] ?? '') : (forms['base'] ?? '');
      if (!noun) return '';
      const split = splitAdjectives({ head: m.concept, adjectives: m.adjectives, nounModifiers: [] });
      const pre = liaisonAdjectives(split.pre, forms, noun, plural);
      const nounPart = [...pre, noun, ...split.post].join(' ');
      if (m.relation === 'domain') return joinArt(dePrep(forms, plural, pre[0] ?? noun), nounPart);
      const prep = REL_PREP_FR[m.relation];
      return prep === 'de' && elidesBefore(forms, pre[0] ?? noun) ? `d'${nounPart}` : `${prep} ${nounPart}`;
    })
    .filter(Boolean)
    .join(' ');
}
