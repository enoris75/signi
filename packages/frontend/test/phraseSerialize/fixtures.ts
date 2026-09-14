// Shared fixtures for the phraseSerialize tests: a hand-built catalog, and a period that uses every
// shape a saved selection can hold.
import type { Concept, SavedPhrase } from '@signi/shared';
import { SAVED_PHRASE_FORMAT, SAVED_PHRASE_VERSION } from '@signi/shared';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';

const concept = (id: string, role: Concept['role']): Concept => ({ id, role, description: `the ${id.toLowerCase()}` });

export const CAT = concept('CAT', 'noun');
export const DOG = concept('DOG', 'noun');
export const BOY = concept('BOY', 'noun');
export const HOUSE = concept('HOUSE', 'noun');
export const PHRASE = concept('PHRASE', 'noun');
export const BIG = concept('BIG', 'adjective');
export const SEMANTIC = concept('SEMANTIC', 'adjective');
export const EAT = concept('EAT', 'verb');
export const WANT = concept('WANT', 'verb');
export const NEVER = concept('NEVER', 'adverb');
export const QUICKLY = concept('QUICKLY', 'adverb');

export const CATALOG = [CAT, DOG, BOY, HOUSE, PHRASE, BIG, SEMANTIC, EAT, WANT, NEVER, QUICKLY];

/** A period with concepts, scalars, a possessor, a reference, conjuncts and every slot-keyed map. */
export const RICH: PhraseSelection = {
  subject: BOY,
  subjectNumber: 'plural',
  subjectAdjective: BIG,
  subjectConjuncts: [{ subject: DOG, subjectDefiniteness: 'indefinite' }],
  subjectConjunction: 'or',
  verb: EAT,
  verbTense: 'past',
  verbNegative: true,
  verbModal: WANT,
  verbModalAdverb: NEVER,
  modifier: QUICKLY,
  directObject: CAT,
  directObjectPossessor: { subject: BOY, subjectPossessor: { subject: DOG } },
  locative: HOUSE,
  locativeSpecifier: 'under',
  locativeAdjective2: PHRASE,
  locativePossessorRef: 'subject',
  modifierRelations: { locativeAdjective2: 'purpose' },
  modifierNumbers: { locativeAdjective2: 'plural' },
  modifierAdjectives: { locativeAdjective2: SEMANTIC },
  adjectiveDegrees: { subjectAdjective: 'more' },
};

/** What RICH saves as. */
export const RICH_SAVED = {
  subject: 'BOY',
  subjectNumber: 'plural',
  subjectAdjective: 'BIG',
  subjectConjuncts: [{ subject: 'DOG', subjectDefiniteness: 'indefinite' }],
  subjectConjunction: 'or',
  verb: 'EAT',
  verbTense: 'past',
  verbNegative: true,
  verbModal: 'WANT',
  verbModalAdverb: 'NEVER',
  modifier: 'QUICKLY',
  directObject: 'CAT',
  directObjectPossessor: { subject: 'BOY', subjectPossessor: { subject: 'DOG' } },
  locative: 'HOUSE',
  locativeSpecifier: 'under',
  locativeAdjective2: 'PHRASE',
  locativePossessorRef: 'subject',
  modifierRelations: { locativeAdjective2: 'purpose' },
  modifierNumbers: { locativeAdjective2: 'plural' },
  modifierAdjectives: { locativeAdjective2: 'SEMANTIC' },
  adjectiveDegrees: { subjectAdjective: 'more' },
};

/** A valid saved-phrase document, as a file would hold it. */
export const doc = (overrides: Record<string, unknown> = {}): SavedPhrase =>
  ({
    format: SAVED_PHRASE_FORMAT,
    version: SAVED_PHRASE_VERSION,
    kind: 'phrase',
    savedAt: '2026-09-14T10:00:00.000Z',
    name: 'Cats',
    workspace: { containers: [{ id: 'c1', selection: { subject: 'CAT' } }], links: [] },
    ...overrides,
  }) as SavedPhrase;
