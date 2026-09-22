/**
 * The postposed deictic clitic a **contrastive** demonstrative writes on its noun: "-ci" for the
 * proximal "ce livre-ci", "-là" for the distal "ce lieu-là".
 *
 * French neutralises this/that in the determiner — `demArticle` writes "ce" for both — so an
 * ordinary demonstrative says nothing about distance, which is right in a sentence and wrong in a
 * definition, where the distance *is* the meaning (localization C40). A phrase that marks itself
 * contrastive (see NounPhrase.contrastive) gets the clitic that carries it; everything else, and
 * every determiner that is not a demonstrative, gets nothing.
 *
 * It attaches at the end of the noun's own material — after the postnominal adjectives ("cette
 * robe bleue-là"), before an attributive noun, a genitive possessor or a relative clause ("ce
 * livre-là de l'homme").
 */
export function deicticClitic(definiteness: string, contrastive: boolean): string {
  if (!contrastive) return '';
  if (definiteness === 'this') return '-ci';
  if (definiteness === 'that') return '-là';
  return '';
}
