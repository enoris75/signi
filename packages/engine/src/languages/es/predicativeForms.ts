/**
 * A predicate nominal's forms, with an indefinite *plural* flattened to bare: Spanish says
 * "se vuelven gatos", never "se vuelven unos gatos". "unos" before a predicate noun is
 * evaluative ("son unos idiotas"), not the plural of "un". The singular keeps "un/una", and
 * an explicitly chosen determiner (definite, quantifier) passes through untouched. French is
 * the odd Romance sibling here — it keeps "des chats" — so this lives per-engine.
 */
export function predicativeForms(forms: Record<string, string>): Record<string, string> {
  const plural = (forms['number'] ?? forms['count'] ?? 'singular') === 'plural';
  if (!plural || forms['definiteness'] !== 'indefinite') return forms;
  return { ...forms, definiteness: 'bare' };
}
