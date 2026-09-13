import type { ResolvedNounPhrase } from '../../types.js';

/**
 * Whether a direct-object noun conjunct takes the personal "a": a human with a determiner ("al
 * niño", "a un hombre", "a su padre"). A bare human is non-specific and takes none ("busca niños").
 */
export function takesPersonalA(np: ResolvedNounPhrase): boolean {
  return np.head.forms['human'] === '1' && np.head.forms['definiteness'] !== 'bare';
}
