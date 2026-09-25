// Shared fixtures for the workspacePlan tests: hand-built concepts, and shorthands for periods and
// the four kinds of link between them.
import type { AbstractionLevel, Concept, CoordConjunction, SubordinatingConjunction } from '@signi/shared';
import type {
  NounAddress,
  NounKey,
  RelativeGap,
  PhraseContainer,
  PhraseLink,
  PhraseSelection,
} from '../../src/components/PhraseBuilder/interfaces.ts';

const concept = (id: string, role: Concept['role']): Concept => ({ id, role, description: `the ${id.toLowerCase()}` });

export const CAT = concept('CAT', 'noun');
export const DOG = concept('DOG', 'noun');
export const BOY = concept('BOY', 'noun');
export const HOUSE = concept('HOUSE', 'noun');
export const WORD = concept('WORD', 'noun');
export const KNIFE = concept('KNIFE', 'noun');
export const EAT = concept('EAT', 'verb');
export const SEE = concept('SEE', 'verb');
export const SLEEP = concept('SLEEP', 'verb');
export const CHOOSE = concept('CHOOSE', 'verb');
export const START = concept('START', 'verb');
export const SAY: Concept = { ...concept('SAY', 'verb'), clauseObject: 'content' };
export const NEED: Concept = { ...concept('NEED', 'verb'), clauseObject: 'infinitive' };

export const period = (id: string, selection: PhraseSelection): PhraseContainer => ({ id, selection });

export const relative = (
  id: string,
  [sourceId, sourceKey]: [string, NounAddress],
  [targetId, targetKey]: [string, RelativeGap],
): PhraseLink => ({
  id,
  source: { containerId: sourceId, nounKey: sourceKey },
  target: { containerId: targetId, nounKey: targetKey },
});

export const conditional = (id: string, main: string, ifClause: string): PhraseLink => ({
  id,
  kind: 'conditional',
  source: { containerId: main },
  target: { containerId: ifClause },
});

export const coordinative = (
  id: string,
  first: string,
  second: string,
  conjunction: CoordConjunction = 'and',
): PhraseLink => ({
  id,
  kind: 'coordinative',
  conjunction,
  source: { containerId: first },
  target: { containerId: second },
});

/** A subordinate clause (P09-E12 D9): `main`'s that-clause, adverbial clause or infinitive. */
export const subordinate = (
  id: string,
  kind: 'content' | 'adverbial' | 'infinitive',
  main: string,
  clause: string,
  conjunction: SubordinatingConjunction = 'when',
): PhraseLink =>
  kind === 'adverbial'
    ? { id, kind, conjunction, source: { containerId: main }, target: { containerId: clause } }
    : { id, kind, source: { containerId: main }, target: { containerId: clause } };

export const instrumental = (id: string, clause: string, instrument: string, level?: AbstractionLevel): PhraseLink => ({
  id,
  kind: 'instrumental',
  ...(level && { level }),
  source: { containerId: clause },
  target: { containerId: instrument },
});

/** The periods by id, as the attach functions take them. */
export const byId = (...periods: PhraseContainer[]) => new Map(periods.map((p) => [p.id, p]));
