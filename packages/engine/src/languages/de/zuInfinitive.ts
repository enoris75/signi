import { particleGap } from './particleGap.js';

/**
 * A verb's zu-infinitive: "zu essen", and for a separable verb "zu" between its particle and its stem,
 * written as one word: "hinzuzufügen" (A138) — or as three, where the particle is written apart:
 * "rückgängig zu machen" (B40).
 */
export function zuInfinitive(verbForms: Record<string, string>): string {
  const base = verbForms['base'] ?? '';
  const particle = verbForms['particle'] ?? '';
  const gap = particleGap(verbForms);
  return particle && base.startsWith(particle)
    ? [particle, 'zu', base.slice(particle.length + gap.length)].join(gap)
    : `zu ${base}`;
}
