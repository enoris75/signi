import { describe, expect, test } from 'vitest';
import { ALLER, CHOISIR, concept, ETRE, MANGER, SAVOIR, VOIR } from './fr.fixtures.js';
import { presentParticiple } from './presentParticiple.js';

describe('presentParticiple', () => {
  test('is the "nous" present minus -ons plus -ant', () => {
    expect(presentParticiple(concept(CHOISIR, 'CHOOSE'))).toBe('choisissant');
    expect(presentParticiple(concept(ALLER, 'GO'))).toBe('allant');
  });

  test('carries the stem irregularity of the "nous" form', () => {
    expect(presentParticiple(concept(MANGER, 'EAT'))).toBe('mangeant');
    expect(presentParticiple(concept(VOIR, 'SEE'))).toBe('voyant');
  });

  test('être, avoir and savoir take their listed stems', () => {
    expect(presentParticiple(concept(ETRE, 'BE'))).toBe('étant');
    expect(presentParticiple(concept(SAVOIR, 'KNOW'))).toBe('sachant');
    expect(presentParticiple(concept({ base: 'avoir', '1pl_present': 'avons' }, 'HAVE'))).toBe('ayant');
  });
});
