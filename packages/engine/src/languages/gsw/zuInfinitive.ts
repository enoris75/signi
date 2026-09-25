import { particleGap } from './particleGap.js';

/**
 * The *z*-infinitive (Standard German *zu*): *z ässe*, and a separable verb's particle ahead of it,
 * written apart as Zürich says it — *zrugg z choo* (the Dieth style sheet). A particle written apart
 * from its verb already (B40) keeps its own space.
 */
export function zuInfinitive(verbForms: Record<string, string>): string {
  const base = verbForms['base'] ?? '';
  const particle = verbForms['particle'] ?? '';
  const gap = particleGap(verbForms);
  return particle && base.startsWith(particle)
    ? `${particle} z ${base.slice(particle.length + gap.length)}`
    : `z ${base}`;
}
