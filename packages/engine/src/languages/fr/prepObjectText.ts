import type { ResolvedNounPhrase } from '../../types.js';
import { possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { aDet } from './aDet.js';
import { deDet } from './deDet.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';

/**
 * One conjunct of the object of a verb that takes it with a preposition (A139), as a complement's
 * noun phrase: "clique sur le bouton", "sur une maison", "sur aucun bouton"; "à" and "de" fuse with the
 * definite article as they do anywhere. A pronoun is no clitic there: it takes its tonic form ("clique
 * sur moi", "sur lui").
 */
export function prepObjectText(np: ResolvedNounPhrase, prep: string): string {
  const f = np.head.forms;
  if (f['person']) return `${prep} ${f['disjunctive'] ?? f['base'] ?? ''}`;
  const head = possessedHeadForms(np, 'bare');
  return renderNP(np, (plural, lead) =>
    prep === 'à' ? aDet(head, plural, lead) : prep === 'de' ? deDet(head, plural, lead) : prepDet(prep, head, plural, lead));
}
