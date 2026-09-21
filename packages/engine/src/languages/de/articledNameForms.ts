import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../../types.js';

/**
 * A noun phrase's head forms as the German determiner reads them. A place name that goes bare on its
 * own ("Asien", "Europa") takes the definite article once an attributive adjective modifies it: "das
 * große Asien", "im fernen Asien", "des großen Asiens" (A169). The forms then mark the name inherently
 * articled (`takes_article`), so `determiner` and `prepDet` give it the article and fuse it as they do
 * for "die Antarktis", and the adjective's weak ending has an article to be weak after.
 *
 * A pronominal possessive fills the slot instead ("dein großes Asien"): the name keeps its forms.
 * `forms` defaults to the head's own; a complement passes the ones `possessedHeadForms` gave it.
 */
export function articledNameForms(np: ResolvedNounPhrase, forms: Record<string, string> = np.head.forms): Record<string, string> {
  const bareName = forms['proper'] === '1' && forms['takes_article'] !== '1';
  const possessed = !!np.possessor && isPronominalPossessor(np.possessor);
  return bareName && !possessed && np.adjectives.length > 0 ? { ...forms, takes_article: '1' } : forms;
}
