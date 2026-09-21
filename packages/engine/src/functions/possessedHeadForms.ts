import { isPronominalPossessor } from '@signi/shared';
import type { ResolvedNounPhrase } from '../types.js';

/**
 * A noun phrase's head forms as its determiner builders read them. A pronominal possessor fills the
 * determiner slot, so the picked determiner gives way to `definiteness`: "definite" where the
 * possessive rides on the definite article, which the complement's preposition then fuses with
 * (Italian "nella mia casa", Portuguese "na minha casa"), and "bare" where the possessive replaces
 * the article and the preposition stands alone (French "dans ma maison", Spanish "en mi casa", German
 * "in meinem Haus"). Any other noun phrase's forms are returned as they are.
 *
 * A demonstrative or a quantifier on the head does *not* give way, though — it and a possessive can
 * go together, each language in its own way (A187, `KEPT_BESIDE_POSSESSIVE`). Where that is handled
 * is the noun phrase builder, not here: a complement still builds its possessive prenominally from
 * these forms, so keeping the determiner here would stack the two ("en esta mi casa", "in keinem
 * meinem Haus"). Italian keeps it in `itPossessedHeadForms` instead, where the stacking is what the
 * language wants.
 *
 * A proper name gives way too. The article a name takes as a name ("l'Asie", "la Antártida", "die
 * Antarktis") is only its default determiner, and every builder hands it out on `proper` before it
 * reads `definiteness`. So the possessed forms drop `proper`, and the name then takes the possessive's
 * determiner like any common noun: "ton Asie", "mi Antártida", "in meiner Antarktis", "nella tua
 * Asia" (A165). The name's other forms, `takes_article` and `isA` among them, stay.
 */
export function possessedHeadForms(np: ResolvedNounPhrase, definiteness: 'definite' | 'bare'): Record<string, string> {
  if (!np.possessor || !isPronominalPossessor(np.possessor)) return np.head.forms;
  const { proper: _name, ...forms } = np.head.forms;
  return { ...forms, definiteness };
}
