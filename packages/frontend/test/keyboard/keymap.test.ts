import { describe, expect, it } from 'vitest';
import { UI_STRINGS, type Concept, type UiStringKey } from '@signi/shared';
import type { PhraseSelection, SlotKey } from '../../src/components/PhraseBuilder/interfaces.ts';
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
    toggleCauseNegative: () => {},
    toggleQuestion: () => {},
    toggleQuestionAnimate: () => {},
    toggleExistential: () => {},
    cycleGloss: () => {},
    cycleGlossRelation: () => {},
    cyclePossessorRole: () => {},
    cycleTense: () => {},
    cycleAspect: () => {},
    cycleVoice: () => {},
    cycleDegree: () => {},
    toggleStandard: () => {},
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
      'noun.possessorRole.back', 'object.voice.back', 'subject.gloss.back', 'subject.glossRelation.back', 'verb.aspect.back', 'verb.tense.back',
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

  // Polarity is per word of the verb group (A03), and the verb family shares one scope, so N
  // denies whichever word the cursor is on — the verb, or the modal governing it.
  it('denies the word N is pressed on, verb or modal', () => {
    const withModal = { selection: { verb: verb('GO'), verbModal: verb('WANT') } as PhraseSelection };
    expect(commandFor('n', { ...withModal, slot: 'verb', nounKey: null })).toBe('verb.negate');
    expect(commandFor('n', { ...withModal, slot: 'verbModal', nounKey: null })).toBe('verb.negate');

    const negate = KEYMAP.find((c) => c.id === 'verb.negate')!;
    const toggled: string[] = [];
    const press = (slot: SlotKey) =>
      negate.run(ctx({ ...withModal, slot, nounKey: null, toggleNegative: (field) => toggled.push(field) }));
    press('verb');
    press('verbModal');
    expect(toggled).toEqual(['verbNegative', 'verbModalNegative']);
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

  // P09-E12 D5: H (t*h*an) opens the predicate adjective's standard of comparison, where it is offered.
  it('opens a standard of comparison only on a predicate adjective that offers one', () => {
    const big = { ...noun('BIG'), role: 'adjective' } as Concept;
    const predicative = { slot: 'predicative' as const, nounKey: 'predicative' as const, selection: { predicative: big } as PhraseSelection };
    expect(commandFor('h', predicative)).toBe('predicative.standard');
    expect(commandFor('h', { ...predicative, satellite: () => undefined })).toBeUndefined();
    expect(commandFor('h', { slot: 'subjectAdjective', selection: { subjectAdjective: big } as PhraseSelection })).toBeUndefined();
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
    const filled = (slot: 'locative' | 'cause' | 'temporal' | 'purpose' | 'directObject') => ({
      slot,
      nounKey: slot,
      selection: { [slot]: noun('HOUSE') } as PhraseSelection,
    });
    expect(commandFor('s', filled('locative'))).toBe('noun.relation');
    expect(commandFor('s', filled('cause'))).toBe('noun.relation');
    // P09-E12b: the temporal's relation toolbar; the purpose has none.
    expect(commandFor('s', filled('temporal'))).toBe('noun.relation');
    expect(commandFor('s', filled('purpose'))).toBeUndefined();
    // The object carries no relation, and an empty complement has nothing to relate.
    expect(commandFor('s', filled('directObject'))).toBeUndefined();
    expect(commandFor('s', { slot: 'locative', nounKey: 'locative' })).toBeUndefined();
  });

  // P09-E53 D3: an asked box is usually empty, and its relation is the question's ("under what").
  it('points S at the relation toolbar of an empty box a question asks about', () => {
    const asked = (slot: 'locative' | 'temporal' | 'comitative') => ({
      slot,
      nounKey: slot,
      selection: { interrogative: true, questionRole: slot } as PhraseSelection,
    });
    expect(commandFor('s', asked('locative'))).toBe('noun.relation');
    expect(commandFor('s', asked('temporal'))).toBe('noun.relation');
    // The companion has no relation to choose.
    expect(commandFor('s', asked('comitative'))).toBeUndefined();
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

// The question's keys (P09-E12 M5–M7): Q marks the noun box a wh-question asks about and ⇧Q flips its
// who / what; E makes the subject an existential's pivot; Q on the period is the third mood.
describe('the question keys', () => {
  it('marks the noun under the cursor, and flips who / what on the marked one', () => {
    const marked: string[] = [];
    expect(commandFor('q')).toBe('noun.question');
    expect(commandFor('q', { slot: 'locative', nounKey: 'locative' })).toBe('noun.question');
    KEYMAP.find((c) => c.id === 'noun.question')!.run(
      ctx({ slot: 'directObject', nounKey: 'directObject', toggleQuestion: (which) => marked.push(which) }),
    );
    expect(marked).toEqual(['directObject']);
    const shifted = resolveCommand(
      KEYMAP,
      boxScopeChain('noun'),
      (spec) => matchesKeySpec(spec, { key: 'Q', shiftKey: true, ctrlKey: false, metaKey: false, altKey: false }, 'other'),
      ctx(),
    );
    expect(shifted?.id).toBe('noun.question.animacy');
  });

  // P09-E52 D5: Q on an owner's box toggles its period's whose.
  it('marks an owner from its own box', () => {
    const onlyOwner = { satellite: (key: string) => (key === 'possessorQuestion' ? ({ key, available: true } as Satellite) : undefined) };
    expect(commandFor('q', { ...onlyOwner, path: 'directObject/possessor' })).toBe('noun.question');
    // Off an owner's box the owner mark is nothing Q reaches.
    expect(commandFor('q', onlyOwner)).toBeUndefined();
  });

  it('offers them only where their controls are', () => {
    const none = { satellite: () => undefined };
    expect(commandFor('q', none)).toBeUndefined();
    expect(commandFor('e', none)).toBeUndefined();
  });

  it('makes the subject an existential, and no other noun', () => {
    expect(commandFor('e')).toBe('subject.existential');
    expect(commandFor('e', { slot: 'directObject', nounKey: 'directObject' })).toBeUndefined();
  });

  it('is the third mood on the period, locked as the other two are', () => {
    const question = PERIOD_KEYMAP.find((c) => c.id === 'period.question')!;
    expect(question.keys).toEqual(['Q']);
    expect(question.labelKey).toBe('mood.question');
    const locked = PERIOD_KEYMAP.filter((c) => ['period.command', 'period.infinitive', 'period.question'].includes(c.id));
    expect(locked.map((c) => c.when?.({ moodLocked: true } as never))).toEqual([false, false, false]);
  });

  it('wears Q and E on the controls they press', () => {
    expect(satelliteKey('directObjectQuestion', boxScopeChain('noun'))).toBe('Q');
    expect(satelliteKey('subjectQuestionAnimate', boxScopeChain('noun'))).toBe('Shift+Q');
    expect(satelliteKey('subjectExistential', boxScopeChain('noun'))).toBe('E');
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
