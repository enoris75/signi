import { describe, expect, it } from 'vitest';
import { UI_STRINGS, type Concept } from '@signi/shared';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';
import type { Satellite } from '../../src/components/PhraseBuilder/satellites/index.ts';
import {
  hintsFor,
  KEYMAP,
  resolveCommand,
  satelliteKey,
  type KeyContext,
} from '../../src/keyboard/keymap.ts';
import { matchesKeySpec } from '../../src/keyboard/matchKey.ts';
import { boxScopeChain, boxScopesOf } from '../../src/keyboard/scope.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });
const verb = (id: string): Concept => ({ id, role: 'verb', description: id, label: id });

// A context whose satellites are all available unless the test says otherwise — enough to ask
// the keymap which command a keystroke resolves to.
function ctx(over: Partial<KeyContext> = {}): KeyContext {
  return {
    slot: 'subject',
    selection: {} as PhraseSelection,
    nounKey: 'subject',
    satellite: (key) => ({ key, available: true }) as Satellite,
    revealSlot: () => {},
    toggleReveal: () => {},
    editSlot: () => {},
    clearSlot: () => {},
    removeComplement: () => {},
    togglePossessor: () => {},
    addConjunct: () => {},
    cycleConjunction: () => {},
    openDeterminerMenu: () => {},
    toggleNumber: () => {},
    toggleGender: () => {},
    toggleNegative: () => {},
    cycleTense: () => {},
    cycleAspect: () => {},
    cycleDegree: () => {},
    cycleModifierRelation: () => {},
    cycleModifierNumber: () => {},
    openModifierAdjective: () => {},
    toggleCollapse: () => {},
    nudge: () => {},
    nav: {
      element: document.createElement('div'),
      move: () => {},
      step: () => true,
      exit: () => {},
    },
    ...over,
  };
}

// What the provider does with a keystroke: look it up in the scopes the cursor's box declares.
const commandFor = (key: string, over: Partial<KeyContext> = {}) => {
  const context = ctx(over);
  const scopes = boxScopesOf(context.slot, context.selection);
  return resolveCommand(
    scopes,
    (spec) =>
      matchesKeySpec(
        spec,
        { key, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false },
        'other',
      ),
    context,
  )?.id;
};

describe('the keymap', () => {
  it('gives every command an id of its own', () => {
    const ids = KEYMAP.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Two commands sharing a key in one scope would make that key's meaning a matter of
  // declaration order — which of the two the user gets would be an accident.
  it('binds each key once per scope', () => {
    const seen = new Map<string, string>();
    for (const command of KEYMAP) {
      for (const key of command.keys) {
        const slot = `${command.scope}/${key}`;
        expect(seen.get(slot), `${slot} is bound by both ${seen.get(slot)} and ${command.id}`)
          .toBeUndefined();
        seen.set(slot, command.id);
      }
    }
  });

  it('names every action, and names it from the catalogue wherever the word is seeded', () => {
    for (const command of KEYMAP) {
      expect(command.label, command.id).not.toBe('');
      if (command.labelKey) expect(UI_STRINGS[command.labelKey], command.id).toBeDefined();
    }
  });
});

describe('resolving a keystroke', () => {
  // The whole point of the level model: no modifier tells N apart on a noun and on a verb — the
  // scope the cursor is in does.
  it('reads the same letter by what the cursor is on', () => {
    expect(commandFor('n')).toBe('noun.number');
    expect(commandFor('n', { slot: 'verb', nounKey: null })).toBe('verb.negate');
    expect(
      commandFor('n', {
        slot: 'subjectAdjective',
        selection: { subjectAdjective: noun('SAIL') } as PhraseSelection,
      }),
    ).toBe('adjective.number');
  });

  it('prefers the box’s own grammar to the keys every box shares', () => {
    // Z folds a group at the box level and is bound nowhere else, so it is found there.
    expect(commandFor('z')).toBe('box.fold');
    expect(commandFor('Escape')).toBe('box.out');
  });

  it('offers no key where the control it would press does not exist', () => {
    const noSatellites = { satellite: () => undefined };
    expect(commandFor('n', noSatellites)).toBeUndefined();
    expect(commandFor('g', noSatellites)).toBeUndefined();
    expect(commandFor('t', { slot: 'verb', nounKey: null, ...noSatellites })).toBeUndefined();
  });

  it('clears a word only when there is one to clear', () => {
    expect(commandFor('Backspace')).toBeUndefined();
    expect(commandFor('Backspace', { selection: { subject: noun('CAT') } })).toBe('box.clear');
  });

  it('cycles a degree only on a real adjective, and a relation only on an attributive noun', () => {
    const real = { slot: 'subjectAdjective' as const, selection: { subjectAdjective: { ...noun('BIG'), role: 'adjective' } } as PhraseSelection };
    const attributive = { slot: 'subjectAdjective' as const, selection: { subjectAdjective: noun('SAIL') } as PhraseSelection };
    expect(commandFor('m', real)).toBe('adjective.degree');
    expect(commandFor('r', real)).toBeUndefined();
    expect(commandFor('r', attributive)).toBe('adjective.relation');
    expect(commandFor('m', attributive)).toBeUndefined();
  });
});

describe('the hints for a scope', () => {
  it('lists the keys that apply here, and drops the ones that do not', () => {
    const verbCtx = ctx({ slot: 'verb', nounKey: null, selection: { verb: verb('EAT') } });
    const ids = hintsFor(boxScopeChain('verb'), verbCtx).map((c) => c.id);

    expect(ids).toContain('verb.tense');
    expect(ids).toContain('verb.aspect');
    expect(ids).not.toContain('noun.number');
    // Backwards cycles are real bindings, but listing them would double the line.
    expect(ids).not.toContain('verb.tense.back');
  });
});

describe('the key a control wears', () => {
  it('reads it off the keymap for the scope of the box that carries it', () => {
    expect(satelliteKey('subjectNumber', boxScopeChain('noun'))).toBe('N');
    expect(satelliteKey('directObjectDefiniteness', boxScopeChain('noun'))).toBe('D');
    expect(satelliteKey('subjectPossessor', boxScopeChain('noun'))).toBe('P');
    expect(satelliteKey('verbTense', boxScopeChain('verb'))).toBe('T');
    expect(satelliteKey('modifier', boxScopeChain('verb'))).toBe('V');
    expect(satelliteKey('verbModal2Adverb', boxScopeChain('verb'))).toBe('V');
    expect(satelliteKey('directObject', boxScopeChain('verb'))).toBe('O');
    // A chained adjective's control rides the adjective before it, so it is found in that scope.
    expect(satelliteKey('subjectAdjective2', boxScopeChain('adjective'))).toBe('A');
  });

  it('is undefined for a control with no key bound yet', () => {
    // The relative clause is a link pick, which phase 3 of the plan brings.
    expect(satelliteKey('subjectRelative', boxScopeChain('noun'))).toBeUndefined();
  });
});
