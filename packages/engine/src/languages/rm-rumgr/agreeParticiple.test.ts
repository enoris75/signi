import { describe, expect, test } from 'vitest';
import { IR, SCRIVER, TURNAR } from './rumgr.fixtures.js';
import { agreeParticiple } from './agreeParticiple.js';

describe('agreeParticiple', () => {
  test('agrees by rule where the lexeme stores only the masculine singular', () => {
    expect(agreeParticiple(IR, 'fem', false)).toBe('ida');
    expect(agreeParticiple(IR, 'masc', true)).toBe('ids');
    expect(agreeParticiple(TURNAR, 'fem', true)).toBe('turnadas');
  });

  test('a stored irregular form wins, the rest follow the rule', () => {
    expect(agreeParticiple(SCRIVER, 'fem', false)).toBe('scritta');
    expect(agreeParticiple(SCRIVER, 'fem', true)).toBe('scrittas');
    expect(agreeParticiple(SCRIVER, 'masc', true)).toBe('scrits');
  });
});
