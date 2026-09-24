/**
 * A determiner with the `almost` that approximates it, where the phrase has one: "almost all",
 * "quasi tutti", "fast kein" (P09-E38). The word rides on the head's forms with its separator
 * (`approximator_det`, see `resolveNounPhrase`); a determiner that spells nothing takes none.
 */
export function withApproximator(forms: Record<string, string>, determiner: string): string {
  const word = forms['approximator_det'];
  return word && determiner ? `${word}${determiner}` : determiner;
}
