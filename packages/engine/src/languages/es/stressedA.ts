/**
 * A feminine noun beginning with a stressed a- ("agua", "águila") takes the *masculine*
 * singular article — "el agua", "un agua" — purely to break the a-a hiatus. The exception is
 * confined to those two articles: the noun stays feminine everywhere else ("esta agua fría",
 * "toda el agua", plural "las aguas"). The lexicon marks it with forms.stressed_a.
 */
export function stressedA(forms: Record<string, string>, plural: boolean): boolean {
  return !plural && forms['stressed_a'] === '1';
}
