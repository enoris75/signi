// Completion at every position kind of P02 §2.4: a command, a word for a role, a value, a reference,
// a new phrase, a word with no command, the bracket's close and history — the candidates, their
// order, the ghost and the range a choice replaces.
import { describe, expect, it } from 'vitest';
import { complete, type Completion } from '../../src/console/language/complete.ts';
import type { ConsoleContext, WorkspaceState } from '../../src/console/language/types.ts';
import { empty, ok, periods, sel } from './helpers.ts';
import { EN, byId } from './vocab.ts';

function at(text: string, { state = empty(), context, caret = text.length, history, recent, pinned, aliases }: {
  state?: WorkspaceState;
  context?: ConsoleContext;
  caret?: number;
  history?: string[];
  recent?: string[];
  pinned?: string[];
  aliases?: Map<string, string[]>;
} = {}): Completion {
  const c = complete(text, caret, state, {
    context: context ?? { containerId: state.containers[0]!.id },
    vocab: EN,
    history,
    recent,
    pinned,
    aliases,
  });
  if (!c) throw new Error(`no completion at “${text}”`);
  return c;
}

const labels = (c: Completion) => c.candidates.map((x) => x.label);

const onCat = (): { state: WorkspaceState; context: ConsoleContext } => ({
  state: periods({ subject: byId('CAT'), subjectGender: 'masc' }),
  context: { containerId: 'p1', word: { containerId: 'p1', slot: 'subject' } },
});

describe('commands', () => {
  it('opens after / with the commands the box under the cursor takes, and their current values', () => {
    const c = at('/', onCat());
    expect(c.auto).toBe(true);
    expect(c.title).toBe('commands for');
    expect(c.about).toBe('cat');
    // Topic by topic, in the order of the noun's own controls, each topic headed.
    expect(c.topics).toBe(true);
    expect(labels(c).slice(0, 5)).toEqual(['/adj', '/sg', '/pl', '/masc', '/fem']);
    const topics = [...new Set(c.candidates.map((x) => x.topic))];
    expect(topics.slice(0, 8)).toEqual(['adjective', 'number', 'gender', 'determiner', 'possessor', 'relative clause', 'coordination', 'the period’s words']);
    expect(c.candidates.find((x) => x.label === '/pl')!.current).toEqual({ value: 'singular', key: 'number.value.singular' });
    // Roles, period and workspace commands follow the noun's own.
    expect(labels(c)).toContain('/verb');
    expect(labels(c)).toContain('/save');
    // A verb's settings are no noun's.
    expect(labels(c)).not.toContain('/past');
    expect({ from: c.from, to: c.to }).toEqual({ from: 0, to: 1 });
  });

  it('narrows by prefix, and ghosts the rest of the best', () => {
    const c = at('/p', onCat());
    expect(labels(c).slice(0, 2)).toEqual(['/pl', '/poss']);
    expect(c.ghost).toBe('l');
  });

  it('finds a command by an alias, and inserts its name', () => {
    const c = at('/plural', onCat());
    expect(c.candidates[0]).toMatchObject({ insert: '/pl', alias: '/plural' });
    expect(c.ghost).toBeUndefined();
  });

  it('ranks the exact name first', () => {
    expect(labels(at('/a', onCat()))[0]).toBe('/a');
  });

  it('offers only the commands some word before the caret can take', () => {
    const state = ok('/subj cat /verb eat');
    const c = at('/subj cat /verb eat /', { state: periods({}), context: { containerId: 'p1' } });
    expect(labels(c)).toContain('/past');
    expect(labels(c)).toContain('/modal');
    expect(labels(c)).toContain('/obj');
    void state;
  });

  it('puts recently used commands first among equal matches', () => {
    expect(labels(at('/p', onCat()))[0]).toBe('/pl');
    expect(labels(at('/p', { ...onCat(), recent: ['poss'] }))[0]).toBe('/poss');
    // The whole list keeps its topics' order.
    expect(labels(at('/', { ...onCat(), recent: ['poss'] }))[0]).toBe('/adj');
  });

  it('lists a setting’s shortcuts under the command that names it, saying what each is short for', () => {
    const c = at('/verb ( eat ', {});
    const tense = c.candidates.filter((x) => x.topic === 'tense');
    expect(tense.map((x) => [x.insert, x.shortcut])).toEqual([
      ['/tense', undefined],
      ['/past', '/tense past'],
      ['/present', '/tense present'],
      ['/future', '/tense future'],
    ]);
    expect(c.candidates.find((x) => x.insert === '/prog')!.shortcut).toBe('/aspect progressive');
    // Typed, the shortcut still says so.
    expect(at('/verb ( eat /pa').candidates[0]).toMatchObject({ insert: '/past', shortcut: '/tense past' });
    // A setting with no command of its own is short for nothing.
    expect(at('/', onCat()).candidates.find((x) => x.insert === '/pl')!.shortcut).toBeUndefined();
  });
});

describe('words', () => {
  it('lists the words of the role after a role command and its space', () => {
    const c = at('/adj ');
    expect(c.auto).toBe(true);
    expect(labels(c)).toEqual(expect.arrayContaining(['brown', 'old', 'big']));
  });

  it('narrows words as the pickers do, and ghosts the best', () => {
    const c = at('/adj b');
    // Adjectives before the nouns /adj also takes, and the shorter first among those alike.
    expect(labels(c).slice(0, 3)).toEqual(['big', 'brown', 'book']);
    expect(c.ghost).toBe('ig');
    expect({ from: c.from, to: c.to }).toEqual({ from: 5, to: 6 });
  });

  it('offers the modals for /modal, and only them', () => {
    const state = ok('/subj cat /verb eat');
    const c = at('/modal ca', { state, context: { containerId: 'p1', word: { containerId: 'p1', slot: 'verb' } } });
    expect(labels(c)).toEqual(['can']);
    expect(c.ghost).toBe('n');
  });

  it('offers nouns and pronouns for /subj, the pronouns by their person', () => {
    const c = at('/subj ');
    expect(labels(c)).toEqual(expect.arrayContaining(['cat', '1st', '3rd', 'one']));
  });

  it('offers an ambiguous word by its id', () => {
    const c = at('/verb cry');
    expect(c.candidates.map((x) => x.insert)).toEqual(expect.arrayContaining(['CRY', 'CRY_OUT']));
  });
});

describe('values', () => {
  it('offers the conjunctions after /join, only the four a command takes under one', () => {
    expect(labels(at('/join '))).toEqual(['and', 'or', 'but', 'thatis', 'therefore', 'then']);
    const command = ok('/command /verb eat');
    expect(labels(at('/join ', { state: command }))).toEqual(['and', 'or', 'but', 'then']);
  });

  it('offers what a command has not been given yet, and only on ⇥ once it has one', () => {
    expect(labels(at('/command '))).toEqual(['you', 'lets', 'youall', 'order', 'instruction']);
    const second = at('/command lets ');
    expect(labels(second)).toEqual(['order', 'instruction']);
    expect(second.auto).toBe(false);
  });

  it('is done with a one-value command once it has its value, so ↵ runs the line', () => {
    const c = at('/lang it ');
    expect(c.auto).toBe(false);
    expect(labels(c)).toContain('/verb');
  });
});

describe('links and references', () => {
  const two = (): WorkspaceState => ({
    containers: [
      { id: 'p1', selection: { subject: byId('CHILD'), verb: byId('READ') } },
      { id: 'p2', selection: { subject: byId('DOG'), directObject: byId('CAT'), verb: byId('SEE') } },
    ],
    links: [],
  });

  it('offers new clauses first after /rel, then the nouns the rules allow, numbered', () => {
    const c = at('/rel ', { state: two(), context: { containerId: 'p1', word: { containerId: 'p1', slot: 'subject' } } });
    expect(c.candidates.map((x) => [x.label, x.number])).toEqual([
      ['subj { … }', undefined],
      ['obj { … }', undefined],
      ['#2.subj', 1],
      ['#2.obj', 2],
    ]);
    expect(c.about).toBe('child');
  });

  it('offers the periods an if-condition may take', () => {
    const c = at('/if ', { state: two() });
    expect(labels(c)).toEqual(['{ … }', '#2']);
    expect(c.candidates[0]).toMatchObject({ insert: '{', close: '}' });
  });

  it('completes a reference as it is typed', () => {
    const c = at('/rel #2.o', { state: two(), context: { containerId: 'p1', word: { containerId: 'p1', slot: 'subject' } } });
    expect(labels(c)).toEqual(['#2.obj']);
    expect(c.ghost).toBe('bj');
  });

  it('lists every period and its nouns after a bare #', () => {
    expect(labels(at('#', { state: two() }))).toEqual(['#1', '#1.subj', '#2', '#2.subj', '#2.obj']);
  });

  it('is done with a possessor once it has its word', () => {
    const c = at('/subj child /poss man ');
    expect(c.auto).toBe(false);
    expect(labels(c)).not.toContain('[ … ]');
  });

  it('offers the bracket after /rel subj', () => {
    const c = at('/rel subj ', { state: two(), context: { containerId: 'p1', word: { containerId: 'p1', slot: 'subject' } } });
    expect(labels(c)).toEqual(['{ … }']);
  });
});

describe('the rest', () => {
  it('meets a word with no command with the command for the box under the cursor', () => {
    const c = at('ca', { state: periods({}), context: { containerId: 'p1', word: { containerId: 'p1', slot: 'subject' } } });
    expect(c.title).toBe('did you mean');
    expect(c.candidates[0]).toMatchObject({ insert: '/subj ( cat', close: ')', label: '/subj ( cat )' });
    expect({ from: c.from, to: c.to }).toEqual({ from: 0, to: 2 });
  });

  it('ghosts the close of a bracket still open', () => {
    const state = ok('/subj child /verb read');
    const c = at('/rel subj ( /verb love ', { state, context: { containerId: 'p1', word: { containerId: 'p1', slot: 'subject' } } });
    expect(c.ghost).toBe(')');
    expect(c.auto).toBe(false);
  });

  it('offers no argument after a closed bracket, only what may follow it', () => {
    const state = ok('/subj child /verb read');
    const c = at('/rel subj ( /verb love )', { state, context: { containerId: 'p1', word: { containerId: 'p1', slot: 'subject' } } });
    expect(c.auto).toBe(false);
    expect(labels(c)).toContain('/verb');
    expect(labels(c)).not.toContain('love');
  });

  it('falls back on history for the ghost', () => {
    const c = at('/subj cat ', { history: ['/subj cat /verb eat', '/subj dog'] });
    expect(c.ghost).toBe('/verb eat');
  });

  it('completes inside brackets for the phrase they hold', () => {
    const c = at('/subj child /poss ( /subj man /a', { state: periods({}) });
    expect(labels(c)[0]).toBe('/a');
    expect(labels(c)).toContain('/adj');
    // A possessor is a noun phrase: no verb in it.
    expect(labels(c)).not.toContain('/verb');
  });
});

describe('pinned lines and local names (phase 5)', () => {
  it('offers the pinned lines, then the recent ones, on an empty prompt — only when asked', () => {
    const c = at('', { pinned: ['/subj dog /verb run'], history: ['/subj cat', '/subj dog /verb run', '/verb eat'] });
    expect(c.candidates.map((x) => [x.insert, x.detail])).toEqual([
      ['/subj dog /verb run', 'pinned'],
      ['/subj cat', 'recent'],
      ['/verb eat', 'recent'],
    ]);
    expect(c.candidates.every((x) => x.kind === 'history')).toBe(true);
    expect(c.auto).toBe(false);
    expect({ from: c.from, to: c.to }).toEqual({ from: 0, to: 0 });
  });

  it('offers commands on an empty prompt when there is no line to offer', () => {
    const c = at('', { pinned: [], history: [] });
    expect(c.candidates.some((x) => x.kind === 'history')).toBe(false);
  });

  it('ghosts a pinned line before a recent one', () => {
    const c = at('/subj cat ', { pinned: ['/subj cat /verb sleep'], history: ['/subj cat /verb eat'] });
    expect(c.ghost).toBe('/verb sleep');
  });

  it('finds a command by its name in the interface language, and writes the English one', () => {
    const aliases = new Map([['pl', ['plurale']], ['sg', ['singolare']]]);
    const c = at('/singol', { ...onCat(), aliases });
    expect(c.candidates[0]).toMatchObject({ insert: '/sg', alias: 'singolare' });
    // Accents and case do not matter; a local name matches from its start only.
    expect(at('/PLURÀLE', { ...onCat(), aliases }).candidates[0]).toMatchObject({ insert: '/pl', alias: 'plurale' });
    expect(at('/golare', { ...onCat(), aliases }).candidates.map((x) => x.insert)).not.toContain('/sg');
  });
});

describe('inside a bracket (structured lines)', () => {
  const commands = (c: Completion) => c.candidates.filter((x) => x.kind === 'command').map((x) => x.insert);

  it('offers the role’s words for the word that opens its bracket', () => {
    expect(at('/subj ( ').candidates.map((x) => x.insert)).toContain('cat');
    const c = at('/subj ( ca');
    expect(c.candidates[0]).toMatchObject({ insert: 'cat' });
    expect({ from: c.from, to: c.to }).toEqual({ from: 8, to: 10 });
    expect(c.ghost).toBe('t');
  });

  it('offers only what describes the word inside its bracket', () => {
    const c = at('/subj ( cat ');
    expect(c.about).toBe('cat');
    expect(commands(c)).toEqual(expect.arrayContaining(['/adj', '/pl', '/the', '/poss', '/rel', '/and']));
    expect(commands(c)).not.toContain('/verb');
    expect(commands(c)).not.toContain('/obj');
    expect(commands(c)).not.toContain('/new');
    expect(commands(c)).not.toContain('/help');
  });

  it('offers a verb’s commands in its bracket, and a noun’s none', () => {
    const c = at('/subj ( cat ) /verb ( eat ');
    expect(commands(c)).toEqual(expect.arrayContaining(['/past', '/not', '/modal', '/adv']));
    expect(commands(c)).not.toContain('/adj');
    expect(commands(c)).not.toContain('/pl');
  });

  it('offers the period’s commands once a word’s bracket has closed, and nothing of the word’s', () => {
    const c = at('/subj ( cat ) ');
    expect(commands(c)).toEqual(expect.arrayContaining(['/verb', '/new']));
    expect(commands(c)).not.toContain('/pl');
    expect(commands(c)).not.toContain('/adj');
  });

  it('offers an adjective’s degree in its own bracket, and not the noun’s number', () => {
    const c = at('/subj ( cat /adj ( big ');
    expect(commands(c)).toEqual(expect.arrayContaining(['/more', '/most']));
    expect(commands(c)).not.toContain('/pl');
  });

  it('opens a possessor’s phrase with its word, then describes that word', () => {
    expect(at('/subj ( cat /poss [ ').candidates.map((x) => x.insert)).toContain('man');
    const c = at('/subj ( cat /poss [ man ');
    expect(c.about).toBe('man');
    expect(commands(c)).toContain('/adj');
    // The phrase has its head already.
    expect(commands(c)).not.toContain('/subj');
  });

  it('offers a phrase’s bracket in square brackets', () => {
    const c = at('/subj ( cat /poss ');
    expect(c.candidates[0]).toMatchObject({ kind: 'phrase', insert: '[', close: ']' });
  });

  it('ghosts the close of the innermost bracket, in its shape', () => {
    const state = ok('/subj child /verb read');
    const context = { containerId: 'p1', word: { containerId: 'p1', slot: 'subject' as const } };
    expect(at('/rel subj { /verb love ', { state, context }).ghost).toBe('}');
    expect(at('/subj ( child /poss [ man ', { state }).ghost).toBe(']');
  });
});

describe('a verb’s tense and aspect by name', () => {
  it('offers /tense and /aspect on a verb, with what the verb holds now', () => {
    const c = at('/verb ( eat /past /t');
    expect(c.candidates[0]).toMatchObject({ insert: '/tense', current: { value: 'past' } });
    expect(at('/verb ( eat /as').candidates[0]).toMatchObject({ insert: '/aspect', current: { value: 'neutral' } });
    // Not on a noun.
    expect(at('/subj ( cat /t').candidates.map((x) => x.insert)).not.toContain('/tense');
  });

  it('offers the values each takes', () => {
    expect(labels(at('/verb ( eat /tense '))).toEqual(['past', 'present', 'future']);
    expect(labels(at('/verb ( eat /aspect '))).toEqual(['neutral', 'progressive', 'prospective', 'resultative']);
    expect(at('/verb ( eat /aspect prosp').candidates[0]).toMatchObject({ insert: 'prospective' });
  });

  it('reads a value by its short name too', () => {
    expect(sel(ok('/verb ( eat /aspect prog )')).verbAspect).toBe('progressive');
  });
});

