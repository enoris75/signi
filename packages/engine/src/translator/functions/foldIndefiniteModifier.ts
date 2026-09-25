import type { ConceptForms } from '../../types.js';
import { indefiniteModifierDe } from '../../languages/de/indefiniteModifier.js';
import { indefiniteModifierEn } from '../../languages/en/indefiniteModifier.js';
import { indefiniteModifierEs } from '../../languages/es/indefiniteModifier.js';
import { indefiniteModifierFr } from '../../languages/fr/indefiniteModifier.js';
import { indefiniteModifierIt } from '../../languages/it/indefiniteModifier.js';
import { indefiniteModifierPt } from '../../languages/pt/indefiniteModifier.js';
import { indefiniteModifierGsw } from '../../languages/gsw/indefiniteModifier.js';
import type { IndefiniteKey, IndefiniteSpeller } from '../translator.types.js';

/**
 * Each language's spelling of an adjective on an indefinite pronoun. Japanese has none: its
 * pronoun is a noun, and its adjective stands before it on the ordinary path (大きい何か, 別の誰か);
 * the negative is the Japanese engine's (see `jaModifiedNegative`).
 */
const SPELLERS: Partial<Record<string, IndefiniteSpeller>> = {
  en: indefiniteModifierEn,
  it: indefiniteModifierIt,
  fr: indefiniteModifierFr,
  de: indefiniteModifierDe,
  gsw: indefiniteModifierGsw,
  es: indefiniteModifierEs,
  pt: indefiniteModifierPt,
};

const KEYS: readonly IndefiniteKey[] = ['base', 'object', 'disjunctive'];

/**
 * Fold the adjective of an **indefinite pronoun** into the pronoun's own surfaces (P09-E36): *something
 * big*, *qualcosa di grande*, *quelqu'un d'autre*, *etwas Großes*, *otra cosa*. Every engine reads a
 * pronoun's `base` / `object` / `disjunctive` in whichever slot it stands, and never its adjectives,
 * so the modifier is written into each of those forms — and into their negative counterparts, which
 * `negativePolarity` swaps in later (*nothing big*, *niente di grande*, *nichts Großes*, *nadie más*).
 * Returns whether the adjectives were spent; `head` is rewritten in place.
 *
 * OTHER is the one adjective with a pronoun form of its own (`after_pronoun`: *else*, *d'autre*,
 * *anderes*, *más*), and where a pronoun fuses with it the pronoun says so (`with_other` /
 * `negative_with_other`: *qualcos'altro*, *autre chose*, *otra cosa*, *nada más*), replacing it. A
 * pronoun that declines names the fused form per slot, `with_other_object` / `with_other_disjunctive`
 * falling back on `with_other`: German EVERYTHING is *alles andere*, *mit allem anderen*
 * (localization B90).
 *
 * What it cannot say it refuses rather than drop (the plan names a word the sentence would lose):
 * more than one adjective, and a degree or an intensifier on it. Japanese says all of these on its
 * ordinary adjective path and is never refused here.
 */
export function foldIndefiniteModifier(head: ConceptForms, adjectives: ConceptForms[], language: string): boolean {
  const speller = SPELLERS[language];
  if (!speller || adjectives.length === 0) return false;
  if (adjectives.length > 1) throw new Error('an indefinite pronoun takes one adjective, and this one has several (P09-E36)');
  const [adjective] = adjectives;
  if (adjective.forms['degree'] || adjective.forms['intensifier'] || adjective.forms['standard']) {
    throw new Error('an adjective on an indefinite pronoun takes no degree, intensifier or standard (P09-E36)');
  }
  const f = head.forms;
  const other = !!adjective.forms['after_pronoun'];
  const citation = f['base'] ?? '';
  const folded: Record<string, string> = {};
  for (const key of KEYS) {
    const withOther = key === 'base' ? f['with_other'] : f[`with_other_${key}`] ?? f['with_other'];
    folded[key] = other && withOther ? withOther : speller(f[key] ?? citation, citation, adjective, key);
  }
  const negative = f['negative'];
  if (negative) {
    const spellNegative = (surface: string, key: IndefiniteKey) =>
      other && f['negative_with_other'] ? f['negative_with_other'] : speller(surface, negative, adjective, key);
    folded['negative'] = spellNegative(negative, 'base');
    if (f['negative_subject']) folded['negative_subject'] = spellNegative(f['negative_subject'], 'base');
    folded['negative_object'] = spellNegative(f['negative_object'] ?? negative, 'object');
    folded['negative_disjunctive'] = spellNegative(f['negative_disjunctive'] ?? negative, 'disjunctive');
  }
  Object.assign(f, folded);
  return true;
}
