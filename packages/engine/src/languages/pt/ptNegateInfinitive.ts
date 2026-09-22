/**
 * Negate a Portuguese infinitive with "não". A reflexive verb's infinitive carries its clitic attached
 * ("mover-se"), and "não" draws that clitic ahead of the verb as it draws an object pronoun ("não o
 * comer", `ptCliticize`): "não se mover", "não se tornar feliz" (A233). Any other form just takes "não"
 * in front ("não comer").
 */
export function ptNegateInfinitive(infinitive: string): string {
  return infinitive.endsWith('-se') ? `não se ${infinitive.slice(0, -3)}` : `não ${infinitive}`;
}
