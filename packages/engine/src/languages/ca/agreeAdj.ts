import { agreeByRule } from './agreeByRule.js';

/**
 * An adjective agreeing with its noun in gender and number, read from the four forms the column
 * stores for every adjective (`base, fem, plural, fem_plural`, P03 D6): *blanc, blanca, blancs,
 * blanques*; *boig, boja, bojos, boges*. A form the lexeme lacks is derived by `agreeByRule`.
 */
export function agreeAdj(forms: Record<string, string>, gender: string, plural: boolean): string {
  const base = forms['base'] ?? '';
  if (!base) return '';
  const fem = gender === 'fem';
  const key = plural ? (fem ? 'fem_plural' : 'plural') : fem ? 'fem' : 'base';
  return forms[key] ?? agreeByRule(base, fem, plural);
}

/**
 * A verb's past participle agreeing in gender and number — in the passive with the patient ("la
 * casa és construïda"). The column stores all four (`participle`, `participle_fem`,
 * `participle_plural`, `participle_fem_plural`); `agreeByRule` covers one it lacks.
 */
export function agreeParticiple(verbForms: Record<string, string>, participle: string, gender: string, plural: boolean): string {
  const fem = gender === 'fem';
  const own = participle === verbForms['participle'];
  const key = plural ? (fem ? 'participle_fem_plural' : 'participle_plural') : fem ? 'participle_fem' : 'participle';
  return (own ? verbForms[key] : undefined) ?? agreeByRule(participle, fem, plural);
}
