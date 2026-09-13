import type { ResolvedModal } from '../../types.js';

/**
 * A modal chain's clause-final infinitive stack, in German's mirror order: the innermost
 * modal sits nearest the verb group it governs and the outermost furthest right — "er will
 * gehen können müssen" (wants to have to be able to go). When the outermost modal is itself
 * finite in the V2 slot it is left out of the stack ("er will gehen können"); in the future
 * "werden" holds V2 instead, so every modal stacks ("er wird gehen müssen").
 */
export function modalStack(modals: ResolvedModal[], includeOutermost: boolean): string[] {
  const infinitives = modals.map((m) => m.verb.forms['nonfinite'] ?? m.verb.forms['base'] ?? '');
  return (includeOutermost ? infinitives : infinitives.slice(1)).reverse().filter(Boolean);
}
