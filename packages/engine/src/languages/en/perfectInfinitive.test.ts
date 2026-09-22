import { describe, expect, test } from 'vitest';
import { perfectInfinitive } from './perfectInfinitive.js';

const RUN = { base: 'run', participle: 'run', gerund: 'running' };
const GO = { base: 'go', participle: 'gone', gerund: 'going', aux: 'be' };

describe('perfectInfinitive', () => {
  test('the neutral and the resultative group are the perfect', () => {
    expect(perfectInfinitive(RUN, 'neutral')).toBe('have run');
    expect(perfectInfinitive(RUN, 'resultative')).toBe('have run');
  });

  test('the perfect takes have, even where the resultative takes be', () => {
    expect(perfectInfinitive(GO, 'neutral')).toBe('have gone');
  });

  test('the progressive and the prospective put the perfect on their be', () => {
    expect(perfectInfinitive(RUN, 'progressive')).toBe('have been running');
    expect(perfectInfinitive(RUN, 'prospective')).toBe('have been about to run');
  });
});
