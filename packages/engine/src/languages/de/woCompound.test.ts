import { describe, expect, test } from 'vitest';
import { WO_COMPOUND, woCompound } from './woCompound.js';

describe('woCompound', () => {
  test('folds was into the preposition where German has the compound', () => {
    expect(woCompound('unter was')).toBe('worunter');
    expect(woCompound('mit was')).toBe('womit');
    expect(woCompound('über was')).toBe('worüber');
    expect(woCompound('durch was')).toBe('wodurch');
    expect(woCompound('vor was')).toBe('wovor');
    expect(woCompound('hinter was')).toBe('wohinter');
    expect(woCompound('um was')).toBe('worum');
    expect(woCompound('gegen was')).toBe('wogegen');
  });

  test('keeps the preposition over was where it has none, and leaves a person alone', () => {
    expect(woCompound('dank was')).toBe('dank was');
    expect(woCompound('zwischen was')).toBe('zwischen was');
    expect(woCompound('mit wem')).toBe('mit wem');
    expect(woCompound('wem')).toBe('wem');
  });

  test('zu is not in the table: wozu asks for a purpose', () => {
    expect(WO_COMPOUND['zu']).toBeUndefined();
    expect(woCompound('zu was')).toBe('zu was');
  });
});
