export function applyNounGender(forms: Record<string, string>, gender?: 'masc' | 'fem' | 'neut') {
  // Only nouns reach here, and nouns are masc/fem — 'neut' is a pronoun-only head gender.
  if (gender !== 'fem' || !forms['fem']) return;
  const plural = forms['number'] === 'plural';
  forms['base']   = plural ? (forms['fem_plural'] ?? forms['fem']) : forms['fem'];
  if (plural && forms['fem_plural']) forms['plural'] = forms['fem_plural'];
  forms['gender'] = 'fem';
}
