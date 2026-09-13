/**
 * A predicate nominal's forms, with an indefinite *plural* flattened to bare: Portuguese says
 * "tornam-se gatos", never "tornam-se uns gatos" — "uns" before a predicate noun is
 * evaluative, not the plural of "um". The singular keeps "um/uma", and an explicitly chosen
 * determiner (definite, quantifier) passes through untouched. French is the odd Romance
 * sibling here — it keeps "des chats" — so this lives per-engine.
 */
export function predicativeForms(forms: Record<string, string>): Record<string, string> {
  const plural = (forms['number'] ?? forms['count'] ?? 'singular') === 'plural';
  if (!plural || forms['definiteness'] !== 'indefinite') return forms;
  return { ...forms, definiteness: 'bare' };
}
