/**
 * A verb's zu-infinitive: "zu essen", and for a separable verb "zu" between its particle and its stem,
 * written as one word: "hinzuzufügen" (A138).
 */
export function zuInfinitive(verbForms: Record<string, string>): string {
  const base = verbForms['base'] ?? '';
  const particle = verbForms['particle'] ?? '';
  return particle && base.startsWith(particle) ? `${particle}zu${base.slice(particle.length)}` : `zu ${base}`;
}
