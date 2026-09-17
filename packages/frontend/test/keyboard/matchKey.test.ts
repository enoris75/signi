import { describe, expect, it } from 'vitest';
import {
  keycapLabels,
  keycapText,
  matchesKeySpec,
  parseKeySpec,
  type KeyEventLike,
} from '../../src/keyboard/matchKey.ts';

// A keydown as the matcher reads one. Nothing is held unless the test says so.
const press = (key: string, held: Partial<KeyEventLike> = {}): KeyEventLike => ({
  key,
  shiftKey: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...held,
});

describe('parseKeySpec', () => {
  it('reads the modifiers off the front and the key off the end', () => {
    expect(parseKeySpec('N')).toEqual({ mod: false, shift: false, key: 'N' });
    expect(parseKeySpec('Shift+ArrowUp')).toEqual({ mod: false, shift: true, key: 'ArrowUp' });
    expect(parseKeySpec('Mod+S')).toEqual({ mod: true, shift: false, key: 'S' });
    expect(parseKeySpec('Mod+Shift+S')).toEqual({ mod: true, shift: true, key: 'S' });
  });

  it('reads "+" as a key of its own, not as a stray separator', () => {
    expect(parseKeySpec('+')).toEqual({ mod: false, shift: false, key: '+' });
    expect(parseKeySpec('Shift++')).toEqual({ mod: false, shift: true, key: '+' });
  });
});

describe('matchesKeySpec', () => {
  describe('a bare letter', () => {
    it('matches the key the user’s layout labels, whatever its case', () => {
      expect(matchesKeySpec('N', press('n'))).toBe(true);
      expect(matchesKeySpec('N', press('N', { shiftKey: true }))).toBe(false);
    });

    // AZERTY swaps A and Q on the physical keyboard; matching `event.key` rather than `code`
    // means the mnemonic follows the letter the user sees.
    it('follows the letter, not the physical key', () => {
      expect(matchesKeySpec('A', press('a'))).toBe(true);
      expect(matchesKeySpec('A', press('q'))).toBe(false);
    });

    it('is not a chord: a modifier held turns it into something else', () => {
      expect(matchesKeySpec('N', press('n', { ctrlKey: true }))).toBe(false);
      expect(matchesKeySpec('N', press('n', { metaKey: true }))).toBe(false);
      expect(matchesKeySpec('N', press('n', { altKey: true }))).toBe(false);
    });
  });

  describe('a shifted key', () => {
    // T cycles the tense and ⇧T cycles it back, so the two must never both fire.
    it('needs Shift, and its bare twin refuses it', () => {
      expect(matchesKeySpec('Shift+T', press('T', { shiftKey: true }))).toBe(true);
      expect(matchesKeySpec('Shift+T', press('t'))).toBe(false);
      expect(matchesKeySpec('T', press('T', { shiftKey: true }))).toBe(false);
    });

    it('leaves Shift alone on punctuation, whose layout decides it', () => {
      expect(matchesKeySpec('?', press('?', { shiftKey: true }))).toBe(true);
      expect(matchesKeySpec('?', press('?'))).toBe(true);
    });
  });

  describe('a Mod chord', () => {
    it('is ⌘ on a Mac and Ctrl elsewhere, and never the other one', () => {
      expect(matchesKeySpec('Mod+S', press('s', { metaKey: true }), 'mac')).toBe(true);
      expect(matchesKeySpec('Mod+S', press('s', { ctrlKey: true }), 'mac')).toBe(false);
      expect(matchesKeySpec('Mod+S', press('s', { ctrlKey: true }), 'other')).toBe(true);
      expect(matchesKeySpec('Mod+S', press('s', { metaKey: true }), 'other')).toBe(false);
    });

    it('is not the bare key', () => {
      expect(matchesKeySpec('Mod+S', press('s'), 'mac')).toBe(false);
    });
  });

  it('names the keys that have no letter', () => {
    expect(matchesKeySpec('Space', press(' '))).toBe(true);
    expect(matchesKeySpec('Enter', press('Enter'))).toBe(true);
    expect(matchesKeySpec('Escape', press('Escape'))).toBe(true);
    expect(matchesKeySpec('Shift+Backspace', press('Backspace', { shiftKey: true }))).toBe(true);
  });
});

describe('keycapLabels', () => {
  it('draws the app modifier the way the platform writes it', () => {
    expect(keycapLabels('Mod+S', 'mac')).toEqual(['⌘', 'S']);
    expect(keycapLabels('Mod+S', 'other')).toEqual(['Ctrl', 'S']);
  });

  it('draws the named keys as their signs', () => {
    expect(keycapLabels('Shift+ArrowUp', 'other')).toEqual(['⇧', '↑']);
    expect(keycapLabels('Enter', 'other')).toEqual(['↵']);
    expect(keycapLabels('Escape', 'other')).toEqual(['esc']);
    expect(keycapLabels('Backspace', 'other')).toEqual(['⌫']);
    expect(keycapLabels('Tab', 'other')).toEqual(['⇥']);
  });

  it('upper-cases a bare letter', () => {
    expect(keycapLabels('n', 'other')).toEqual(['N']);
    expect(keycapText('Mod+Shift+S', 'mac')).toBe('⌘ ⇧ S');
  });
});
