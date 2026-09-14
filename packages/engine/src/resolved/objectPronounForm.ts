/**
 * The object (accusative / clitic) surface of a pronoun, by number/gender — the direct-object
 * counterpart of the subject citation form (`base`/`plural`/`singular_fem`…). English/German use it
 * post-verbally without an article ("sees me", "sieht ihn"); Romance uses it as the proclitic that
 * moves before the finite verb ("mi vede"). Falls back through plural/base when a form is absent. A
 * feminine plural takes its own clitic where the language has one (Italian "le", Spanish "las",
 * Portuguese "as"), as the subject pronoun takes `plural_fem`.
 */
export function objectPronounForm(forms: Record<string, string>): string {
  const plural = (forms['number'] ?? forms['count']) === 'plural';
  const gender = forms['gender'];
  if (plural && gender === 'fem' && forms['object_plural_fem']) return forms['object_plural_fem'];
  if (plural) return forms['object_plural'] ?? forms['plural'] ?? forms['object'] ?? forms['base'] ?? '';
  if (gender === 'fem') return forms['object_fem'] ?? forms['object'] ?? forms['base'] ?? '';
  if (gender === 'neut') return forms['object_neut'] ?? forms['object'] ?? forms['base'] ?? '';
  return forms['object'] ?? forms['base'] ?? '';
}
