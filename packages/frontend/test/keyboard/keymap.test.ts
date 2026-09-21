import { describe, expect, it } from 'vitest';
import { UI_STRINGS, type Concept, type UiStringKey } from '@signi/shared';
import type { PhraseSelection } from '../../src/components/PhraseBuilder/interfaces.ts';
import type { Satellite } from '../../src/components/PhraseBuilder/satellites/index.ts';
import {
  APP_KEYMAP,
  commandLabel,
  hintsFor,
  KEYMAP,
  PERIOD_KEYMAP,
  resolveCommand,
  satelliteKey,
  type BoxKeyContext,
} from '../../src/keyboard/keymap.ts';
import { matchesKeySpec } from '../../src/keyboard/matchKey.ts';
import { boxScopeChain, boxScopesOf } from '../../src/keyboard/scope.ts';

const noun = (id: string): Concept => ({ id, role: 'noun', description: id, label: id });
const verb = (id: string): Concept => ({ id, role: 'verb', description: id, label: id });

// A context whose satellites are all available unless the test says otherwise — enough to ask
// the keymap which command a keystroke resolves to.
function ctx(over: Partial<BoxKeyContext> = {}): BoxKeyContext {
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
    relative: undefined,
    openDeterminerMenu: () => {},
    openComplementMenu: () => {},
    armToolbar: () => {},
    setImperativePerson: () => {},
    setImperativeRegister: () => {},
    imperative: { person: '2sg', register: 'request' },
    toggleNumber: () => {},
    toggleGender: () => {},
    toggleNegative: () => {},
    cycleTense: () => {},
    cycleAspect: () => {},
    cycleVoice: () => {},
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
const commandFor = (key: string, over: Partial<BoxKeyContext> = {}) => {
  const context = ctx(over);
  const scopes = boxScopesOf(context.slot, context.selection);
  return resolveCommand(
    KEYMAP,
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

// Both levels' maps answer to the same invariants — a key bound twice in one scope, or an action
// with no name, is a bug wherever it is.
const ALL_COMMANDS = [...KEYMAP, ...PERIOD_KEYMAP];

describe('the keymap', () => {
  it('gives every command an id of its own', () => {
    const ids = ALL_COMMANDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Two commands sharing a key in one scope would make that key's meaning a matter of
  // declaration order — which of the two the user gets would be an accident.
  it('binds each key once per scope', () => {
    const seen = new Map<string, string>();
    for (const command of ALL_COMMANDS) {
      for (const key of command.keys) {
        const slot = `${command.scope}/${key}`;
        expect(seen.get(slot), `${slot} is bound by both ${seen.get(slot)} and ${command.id}`)
          .toBeUndefined();
        seen.set(slot, command.id);
      }
    }
  });

  it('names every action, and names it from the catalogue wherever the word is seeded', () => {
    for (const command of [...ALL_COMMANDS, ...APP_KEYMAP]) {
      expect(command.label, command.id).not.toBe('');
      if (command.labelKey) expect(UI_STRINGS[command.labelKey], command.id).toBeDefined();
    }
  });

  // A label without a key shows its English in every language. A20 named the commands whose words
  // were seeded and B40–B44 seeded the rest, so none goes without one now: a new command names
  // itself from the catalogue, seeding its word first if the corpus lacks it.
  it('names every command from the catalogue', () => {
    const commands = [...ALL_COMMANDS, ...APP_KEYMAP];
    expect(commands.filter((c) => !c.labelKey).map((c) => c.id)).toEqual([]);
  });

  // A ⇧ twin that runs a cycle backwards is named after the key it reverses, so the two cannot drift:
  // "Tense, backwards" is `satellite.tense`, a comma, and `hint.backwards` (B44).
  it('names each backwards key after the key it reverses, in the same scope', () => {
    const commands = [...ALL_COMMANDS, ...APP_KEYMAP];
    const reversing = commands.filter((c) => c.reverses);
    expect(reversing.map((c) => c.id).sort()).toEqual([
      'adjective.degree.back', 'adjective.relation.back', 'noun.gender.back',
      'object.voice.back', 'verb.aspect.back', 'verb.tense.back',
    ]);
    for (const command of reversing) {
      const forward = commands.find((c) => c.id === command.reverses);
      expect(forward, command.id).toBeDefined();
      expect(forward!.scope, command.id).toBe(command.scope);
      expect(forward!.labelKey, command.id).toBeDefined();
      expect(command.labelKey, command.id).toBe('hint.backwards');
    }
  });

  it('joins a backwards key’s name to its forward key’s, in the UI language', () => {
    const tense = KEYMAP.find((c) => c.id === 'verb.tense.back')!;
    const english = (key: UiStringKey) => UI_STRINGS[key].fallback;
    expect(commandLabel(tense, english)).toBe('Tense, backwards');

    const italian: Partial<Record<UiStringKey, string>> = {
      'satellite.tense': 'Tempo',
      'hint.backwards': "all'indietro",
    };
    expect(commandLabel(tense, (key) => italian[key] ?? '?')).toBe("Tempo, all'indietro");
    // A command that reverses nothing is its own name.
    expect(commandLabel(KEYMAP.find((c) => c.id === 'verb.tense')!, (key) => italian[key] ?? '?'))
      .toBe('Tempo');
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

describe('the menus and toolbars a key opens', () => {
  it('opens the complement menu from the verb box, and from nowhere else', () => {
    expect(commandFor('+', { slot: 'verb', nounKey: null })).toBe('verb.complement');
    expect(commandFor('+', { slot: 'verbModal', nounKey: null })).toBeUndefined();
  });

  // "+" needs a shift on most layouts and none on some, so the binding does not constrain it —
  // and "=" is the same physical key, which is why both are bound.
  it('takes + however the layout produces it, and = beside it', () => {
    const verb = { slot: 'verb' as const, nounKey: null };
    expect(commandFor('=', verb)).toBe('verb.complement');
    const shifted = resolveCommand(
      KEYMAP,
      boxScopesOf('verb', {}),
      (spec) =>
        matchesKeySpec(
          spec,
          { key: '+', shiftKey: true, ctrlKey: false, metaKey: false, altKey: false },
          'other',
        ),
      ctx(verb),
    );
    expect(shifted?.id).toBe('verb.complement');
  });

  it('points S at a relation toolbar only where there is one, and a word on it', () => {
    const filled = (slot: 'locative' | 'cause' | 'directObject') => ({
      slot,
      nounKey: slot,
      selection: { [slot]: noun('HOUSE') } as PhraseSelection,
    });
    expect(commandFor('s', filled('locative'))).toBe('noun.relation');
    expect(commandFor('s', filled('cause'))).toBe('noun.relation');
    // The object carries no relation, and an empty complement has nothing to relate.
    expect(commandFor('s', filled('directObject'))).toBeUndefined();
    expect(commandFor('s', { slot: 'locative', nounKey: 'locative' })).toBeUndefined();
  });
});

describe('the command box', () => {
  const command = (over: Partial<BoxKeyContext> = {}) => ({
    slot: 'subject' as const,
    nounKey: null,
    selection: { imperative: true } as PhraseSelection,
    ...over,
  });

  it('counts its three addressees', () => {
    expect(commandFor('1', command())).toBe('mood.person.2sg');
    expect(commandFor('2', command())).toBe('mood.person.1pl');
    expect(commandFor('3', command())).toBe('mood.person.2pl');
    expect(commandFor('r', command())).toBe('mood.register');
  });

  it('asks for no addressee under an instruction, which is addressed to nobody', () => {
    const instruction = command({ imperative: { person: '2sg', register: 'instruction' } });
    expect(commandFor('1', instruction)).toBeUndefined();
    expect(commandFor('r', instruction)).toBe('mood.register');
  });

  // An infinitive citation is the other subject-dropping mood: it addresses nobody at all, so
  // its box carries none of these.
  it('offers nothing on an infinitive', () => {
    const infinitive = command({ selection: { infinitive: true } as PhraseSelection });
    expect(commandFor('1', infinitive)).toBeUndefined();
    expect(commandFor('r', infinitive)).toBeUndefined();
  });
});

describe('the hints for a scope', () => {
  it('lists the keys that apply here, and drops the ones that do not', () => {
    const verbCtx = ctx({ slot: 'verb', nounKey: null, selection: { verb: verb('EAT') } });
    const ids = hintsFor(KEYMAP, boxScopeChain('verb'), verbCtx).map((c) => c.id);

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
    expect(satelliteKey('subjectRelative', boxScopeChain('noun'))).toBe('R');
    // A chained adjective's control rides the adjective before it, so it is found in that scope.
    expect(satelliteKey('subjectAdjective2', boxScopeChain('adjective'))).toBe('A');
  });

  it('is undefined for a control with no key of its own', () => {
    // A complement toggle is reached through the + menu, not by a letter on the verb box: nine
    // of them would be nine more letters to remember (see ComplementMenu).
    expect(satelliteKey('locative', boxScopeChain('verb'))).toBeUndefined();
    expect(satelliteKey('instrumental', boxScopeChain('verb'))).toBeUndefined();
  });
});
