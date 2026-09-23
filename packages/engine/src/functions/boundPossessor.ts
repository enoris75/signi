import type { BoundPossessor } from '../types.js';

/**
 * Whether a resolved possessor is a coreferent one bound to its clause's subject (P11-E2). It is
 * also a pronominal possessor, so six of the seven engines spell it as one without asking; this is
 * for the places that must tell the two apart.
 */
export const isBoundPossessor = (p: unknown): p is BoundPossessor =>
  typeof p === 'object' && p !== null && (p as { coreferent?: unknown }).coreferent === 'subject';
