import { describe, expect, test } from 'vitest';
import { refuseGenericObject } from './refuseGenericObject.js';

describe('refuseGenericObject', () => {
  test('refuses the generic person, alone or as a conjunct, naming it and the slot', () => {
    expect(() => refuseGenericObject({ concept: 'GENERIC_PERSON' }, 'plan.directObject'))
      .toThrow('the generic person (GENERIC_PERSON) cannot be a direct object: no language here has an object form for one / si / on / man (plan.directObject, A354)');
    expect(() => refuseGenericObject({ conjuncts: [{ concept: 'CAT' }, { concept: 'GENERIC_PERSON' }], conjunction: 'and' }, 'relative.directObject'))
      .toThrow(/relative\.directObject, A354/);
  });

  test('lets any other object, and none, through', () => {
    expect(() => refuseGenericObject(undefined, 'plan.directObject')).not.toThrow();
    // The passive promotes it to the subject.
    expect(() => refuseGenericObject({ concept: 'GENERIC_PERSON' }, 'plan.directObject', true)).not.toThrow();
    expect(() => refuseGenericObject({ concept: 'THIRD_PERSON' }, 'plan.directObject')).not.toThrow();
    expect(() => refuseGenericObject({ conjuncts: [{ concept: 'CAT' }, { concept: 'DOG' }], conjunction: 'and' }, 'plan.directObject')).not.toThrow();
  });
});
