/**
 * The fixed words a German noun's name carries after its head, space-led, or "": the genitive of
 * "adverbiale Bestimmung des Ortes" (A140). They never decline, so the case endings stay on the head
 * noun ("den adverbialen Bestimmungen der Richtung", never "*Richtungn").
 */
export function postnominal(forms: Record<string, string>): string {
  const words = forms['postnominal'];
  return words ? ` ${words}` : '';
}
