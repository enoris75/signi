import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { VOWEL_START } from './fr.consts.js';
import { aDet } from './aDet.js';
import { deDet } from './deDet.js';
import { partitiveArtFor } from './partitiveArtFor.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * One conjunct of the object of a verb that takes it with a preposition (A139), as a complement's
 * noun phrase: "clique sur le bouton", "sur une maison", "sur aucun bouton"; "à" and "de" fuse with the
 * definite article as they do anywhere. A pronoun is no clitic there: it takes its tonic form ("clique
 * sur moi", "sur lui"), and "de" elides before a vowel ("dépend d'elle", "d'eux").
 */
export function prepObjectText(np: ResolvedNounPhrase, prep: string): string {
  const f = np.head.forms;
  if (f['person']) {
    const tonic = f['disjunctive'] ?? f['base'] ?? '';
    return prep === 'de' && VOWEL_START.test(tonic) ? `d'${tonic}` : `${prep} ${tonic}`;
  }
  const head = possessedHeadForms(np, 'bare');
  // An object is never bare, with a preposition or without one: "clique sur des boutons" (A149). A
  // possessive takes the article's place ("sur son bouton").
  const possessive = isPronominalPossessor(np.possessor);
  return renderNP(np, (plural, lead) =>
    prep === 'à' ? aDet(head, plural, lead) : prep === 'de' ? deDet(head, plural, lead)
    : possessive ? prepDet(prep, head, plural, lead)
    : `${prep} ${partitiveArtFor(head, plural, lead)}`);
}
