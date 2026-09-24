import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';
import { ownHeadForms, possessedHeadForms } from '../../functions/possessedHeadForms.js';
import { VOWEL_START } from './fr.consts.js';
import { aDet } from './aDet.js';
import { deDet } from './deDet.js';
import { partitiveArtFor } from './partitiveArtFor.js';
import { prepDet } from './prepDet.js';
import { renderNP } from './renderNP.js';
import { withRelative } from './withRelative.js';

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
    return withRelative(prep === 'de' && VOWEL_START.test(tonic) ? `d'${tonic}` : `${prep} ${tonic}`, np);
  }
  const head = possessedHeadForms(np, 'bare');
  // An object is never bare, with a preposition or without one: "clique sur des boutons" (A149). A
  // possessive takes the article's place ("sur son bouton").
  const possessive = isPronominalPossessor(np.possessor);
  // A head that keeps its determiner beside a detached possessive takes "de" as it would without the
  // possessive, built from its own forms, so "de" + "des" is "de": "dépend de conditions à moi", as
  // the complements do since A326 (A342).
  const ownDe = prep === 'de' ? (plural: boolean, lead: string) => deDet(ownHeadForms(np), plural, lead) : undefined;
  return renderNP(np, (plural, lead) =>
    prep === 'à' ? aDet(head, plural, lead) : prep === 'de' ? deDet(head, plural, lead)
    : possessive ? prepDet(prep, head, plural, lead)
    : prepArticle(prep, partitiveArtFor(head, plural, lead)), ownDe);
}

/**
 * The preposition before its partitive article, or alone where a numeral leaves the article empty:
 * "sur des boutons", "sur deux boutons", never "sur  deux" (A363).
 */
function prepArticle(prep: string, article: string): string {
  return article ? `${prep} ${article}` : prep;
}
