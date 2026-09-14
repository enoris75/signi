// Shared fixtures for the selectionToPlan tests: hand-built concepts of every role the plan reads.
import type { Concept } from '@signi/shared';

export const concept = (id: string, role: Concept['role'], extra: Partial<Concept> = {}): Concept => ({
  id,
  role,
  description: `the ${id.toLowerCase()}`,
  ...extra,
});

export const CAT = concept('CAT', 'noun');
export const DOG = concept('DOG', 'noun');
export const BOY = concept('BOY', 'noun');
export const HOUSE = concept('HOUSE', 'noun');
export const BED = concept('BED', 'noun');
export const SAIL = concept('SAIL', 'noun');
export const PHRASE = concept('PHRASE', 'noun');
export const BIG = concept('BIG', 'adjective');
export const RED = concept('RED', 'adjective');
export const OLD = concept('OLD', 'adjective');
export const HAPPY = concept('HAPPY', 'adjective');
export const SEMANTIC = concept('SEMANTIC', 'adjective');
export const EAT = concept('EAT', 'verb', { transitivity: 'transitive' });
export const GO = concept('GO', 'verb', { transitivity: 'intransitive' });
export const WANT = concept('WANT', 'verb', { modal: true });
export const CAN = concept('CAN', 'verb', { modal: true });
export const ALWAYS = concept('ALWAYS', 'adverb');
export const NEVER = concept('NEVER', 'adverb');
export const QUICKLY = concept('QUICKLY', 'adverb');
export const I = concept('I', 'pronoun', { person: '1' });
export const WE = concept('WE', 'pronoun', { person: '1', number: 'plural' });
