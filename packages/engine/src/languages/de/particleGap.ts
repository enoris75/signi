/**
 * How a separable verb's particle is written against its verb wherever the two meet: onto it
 * ("hinzufügen", "hinzuzufügen", "…, der eine Maus hinzufügt", A138) or apart from it, as a particle
 * that is itself a word ("rückgängig machen", "rückgängig zu machen", "…, der sie rückgängig macht",
 * B40). The infinitive says which, so the lexeme needs no flag of its own. "" for a verb without a
 * particle.
 */
export function particleGap(forms: Record<string, string>): '' | ' ' {
  const particle = forms['particle'];
  return particle && (forms['base'] ?? '').startsWith(`${particle} `) ? ' ' : '';
}
