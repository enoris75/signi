// The phrase language as the plan writes it: every example in P02 §1 and §3, run through
// parse → apply, and printed back — and every help page's example, printed in another language.
import { describe, expect, it } from 'vitest';
import { EXAMPLES, exampleIn } from '../../src/console/language/help.ts';
import { lex } from '../../src/console/language/lex.ts';
import { ids_, ok, periods, print, run, script, sel } from './helpers.ts';
import { ALL, EN, IT, byId } from './vocab.ts';

describe('the examples of the plan', () => {
  it('builds a noun phrase and a clause from one line, settings following the word they change', () => {
    const state = ok('/subj cat /adj brown /pl /verb eat /past /obj food');
    expect(ids_(sel(state))).toMatchObject({
      subject: 'CAT',
      subjectAdjective: 'BROWN',
      subjectNumber: 'plural',
      verb: 'EAT',
      verbTense: 'past',
      directObject: 'FOOD',
    });
    expect(print(state)).toBe('/subj ( cat /adj brown /pl ) /verb ( eat /past ) /obj ( food )');
  });

  it('lands /past on the closest word that can take it, skipping the noun after the verb', () => {
    const state = ok('/subj cat /verb eat /obj food /past');
    expect(sel(state).verbTense).toBe('past');
    expect(print(state)).toBe('/subj ( cat ) /verb ( eat /past ) /obj ( food )');
  });

  it('takes the box under the cursor as the word just before the line', () => {
    const before = ok('/subj cat /verb eat');
    const state = ok('/past', { state: before, word: { containerId: 'p1', slot: 'verb' } });
    expect(sel(state).verbTense).toBe('past');
  });

  it('says a command, its addressee and a complement', () => {
    const state = ok('/command lets /verb run /dir house');
    expect(ids_(sel(state))).toMatchObject({
      imperative: true,
      imperativePerson: '1pl',
      verb: 'RUN',
      direction: 'HOUSE',
    });
    expect(print(state)).toBe('/command lets /verb ( run ) /dir ( house )');
  });

  it('makes a relative clause in brackets, its subject the gap, and hands the line back to the head', () => {
    const state = ok('/subj child /rel subj ( /verb love /obj cat ) /verb read /obj book');
    expect(state.containers).toHaveLength(2);
    expect(ids_(sel(state, 0))).toMatchObject({ subject: 'CHILD', verb: 'READ', directObject: 'BOOK' });
    expect(ids_(sel(state, 1))).toMatchObject({ subject: 'CHILD', verb: 'LOVE', directObject: 'CAT' });
    expect(state.links).toEqual([
      expect.objectContaining({
        source: { containerId: 'p1', nounKey: 'subject' },
        target: { containerId: 'n1', nounKey: 'subject' },
      }),
    ]);
    expect(script(state)).toBe('/subj ( child /rel #2.subj ) /verb ( read ) /obj ( book )\n/subj ( child ) /verb ( love ) /obj ( cat )');
  });

  it('names the object as the gap', () => {
    const state = ok('/subj cat /rel obj ( /subj dog /verb see ) /verb run');
    expect(ids_(sel(state, 1))).toMatchObject({ subject: 'DOG', verb: 'SEE', directObject: 'CAT' });
    expect(state.links[0]).toMatchObject({ target: { nounKey: 'directObject' } });
  });

  it('makes an if-condition', () => {
    const state = ok('/subj dog /verb run /if ( /subj cat /verb eat )');
    expect(state.links).toEqual([
      expect.objectContaining({ kind: 'conditional', source: { containerId: 'p1' }, target: { containerId: 'n1' } }),
    ]);
    expect(script(state)).toBe('/subj ( dog ) /verb ( run ) /if #2\n/subj ( cat ) /verb ( eat )');
  });

  it('makes an instrument', () => {
    const state = ok('/subj child /verb eat /obj food /inst ( /subj stick )');
    expect(state.links).toEqual([expect.objectContaining({ kind: 'instrumental', level: 'object' })]);
    expect(script(state)).toBe('/subj ( child ) /verb ( eat ) /obj ( food ) /inst #2\n/subj ( stick )');
  });

  it('gives a noun a possessor in brackets, and /pl after them goes back to the head', () => {
    const state = ok('/subj child /poss ( /subj man /adj old ) /pl /verb run');
    expect(ids_(sel(state))).toMatchObject({ subject: 'CHILD', subjectNumber: 'plural', verb: 'RUN' });
    expect(ids_(sel(state).subjectPossessor!)).toMatchObject({ subject: 'MAN', subjectAdjective: 'OLD' });
    expect(sel(state).subjectPossessor!.subjectNumber).toBeUndefined();
    expect(print(state)).toBe('/subj ( child /pl /poss [ man /adj old ] ) /verb ( run )');
  });

  it('nests brackets', () => {
    const state = ok('/subj dog /verb run /if ( /subj cat /rel subj ( /verb see /obj child ) /verb eat )');
    expect(state.containers).toHaveLength(3);
    expect(state.links.map((l) => l.kind ?? 'relative').sort()).toEqual(['conditional', 'relative']);
    expect(script(state)).toBe(
      '/subj ( dog ) /verb ( run ) /if #2\n/subj ( cat /rel #3.subj ) /verb ( eat )\n/subj ( cat ) /verb ( see ) /obj ( child )',
    );
  });

  it('closes brackets left open at the end of the line', () => {
    const state = ok('/subj dog /verb run /if ( /subj cat /verb eat');
    expect(state.links).toHaveLength(1);
    expect(ids_(sel(state, 1))).toMatchObject({ subject: 'CAT', verb: 'EAT' });
  });

  it('goes back to the subject with a bare /subj, and relativises it there (§1)', () => {
    const state = ok('/subj cat /adj brown /pl /verb eat /modal can /not /obj food');
    const after = ok('/subj /rel obj ( /subj dog /verb see )', { state, word: { containerId: 'p1', slot: 'directObject' } });
    expect(after.links).toEqual([
      expect.objectContaining({ source: { containerId: 'p1', nounKey: 'subject' }, target: { containerId: 'n1', nounKey: 'directObject' } }),
    ]);
    expect(ids_(sel(after, 1))).toMatchObject({ subject: 'DOG', verb: 'SEE', directObject: 'CAT' });
  });

  // The walkthrough's polarity click is on *eat*, so the phrase is "can not eat" — the verb's own
  // negation under a modal (A03). A settings-before-modals print order is what keeps that meaning
  // when the line is read back: after `/modal can`, a `/not` would be the modal's.
  it('builds the brown cats that can not eat the food, a line at a time', () => {
    let state = ok('/subj cat /adj brown /pl');
    state = ok('/verb eat /obj food', { state });
    state = ok('/not', { state, word: { containerId: 'p1', slot: 'verb' } });
    state = ok('/modal can', { state, word: { containerId: 'p1', slot: 'verb' } });
    expect(print(state)).toBe('/subj ( cat /adj brown /pl ) /verb ( eat /not /modal can ) /obj ( food )');
  });

  // The other scope, "cannot eat": the negation is the modal's own, and it rides the modal's
  // bracket exactly as a modal's adverb does.
  it('builds the brown cats that cannot eat the food, negating the modal', () => {
    let state = ok('/subj cat /adj brown /pl');
    state = ok('/verb eat /obj food', { state });
    state = ok('/modal can', { state, word: { containerId: 'p1', slot: 'verb' } });
    state = ok('/not', { state, word: { containerId: 'p1', slot: 'verbModal' } });
    expect(print(state)).toBe('/subj ( cat /adj brown /pl ) /verb ( eat /modal ( can /not ) ) /obj ( food )');
  });
});

describe('what a line says when it goes wrong', () => {
  it('explains a setting with nothing before it to take it, and where it belongs', () => {
    const state = periods({ subject: byId('CAT'), verb: byId('EAT'), directObject: byId('FOOD') });
    const result = run('/obj food /past', { state });
    expect(result.diagnostic).toMatchObject({
      code: 'noTarget',
      args: { command: 'past', last: { word: 'food', kind: 'noun' }, fit: { word: 'eat', role: 'verb' }, inElement: false },
    });
    expect(result.diagnostic).toMatchObject({ from: 10, to: 15 });
  });

  it('refuses a line that starts with a bare word', () => {
    expect(run('cat').diagnostic).toMatchObject({ code: 'lineStartsWithWord' });
  });

  it('keeps the valid part before a mistake', () => {
    const result = run('/subj cat /adj brown /pl /verb frobnicate');
    expect(result.diagnostic).toMatchObject({ code: 'unknownWord', args: { command: 'verb', text: 'frobnicate' } });
    expect(ids_(sel(result.state))).toMatchObject({ subject: 'CAT', subjectAdjective: 'BROWN', subjectNumber: 'plural' });
  });

  it('marks a link command waiting for its target as unfinished, not wrong', () => {
    const state = ok('/subj cat /verb see');
    const result = run('/rel', { state, word: { containerId: 'p1', slot: 'subject' } });
    expect(result.diagnostic).toMatchObject({ incomplete: true });
  });
});

// Found in review: lines the console must refuse rather than crash on, or quietly misread.
describe('lines that once broke the console', () => {
  it('takes one level, one language, and one of each for a command', () => {
    expect(run('/level process concept').diagnostic).toMatchObject({ code: 'valueAlreadyGiven', args: { max: 1, given: 'process' } });
    expect(run('/lang it en').diagnostic).toMatchObject({ code: 'valueAlreadyGiven', args: { max: 1, given: 'it' } });
    expect(run('/command lets youall').diagnostic).toMatchObject({ code: 'valueAlreadyGiven', args: { max: 2, given: 'lets' } });
    expect(run('/command lets instruction').diagnostic).toBeUndefined();
  });

  it('refuses a link from a period the line then removes, instead of throwing', () => {
    for (const line of ['/if ( /subj cat ) /del period', '/join and ( /subj cat ) /del period', '/subj cat /rel subj ( /verb run ) /del period']) {
      const result = run(line);
      expect(result.diagnostic, line).toMatchObject({ code: 'linkSourceRemoved' });
    }
  });

  it('does not print a link whose other end is gone', () => {
    const state = ok('/subj dog /verb run /if ( /subj cat /verb eat )');
    const dangling = { ...state, containers: state.containers.slice(0, 1) };
    expect(print(dangling)).toBe('/subj ( dog ) /verb ( run )');
  });
});

// The help pages' examples (help.ts) are written once, in English, and shown in the interface
// language (A21): each word as the printer writes it there, the commands and brackets as written.
// What the page shows must be a line the console reads back into the phrase the example makes.
describe('the help pages’ examples, in another interface language', () => {
  it.each(Object.keys(EXAMPLES).map((name) => [name]))('prints the example for /%s in Italian, and reads it back', (name) => {
    const english = EXAMPLES[name]!;
    const shown = exampleIn(english, IT);
    const back = run(shown, { vocab: IT });
    expect(back.diagnostic).toBeUndefined();
    expect(back.state).toEqual(run(english).state);
    expect(back.effects.map((e) => [e.app, e.arg])).toEqual(run(english).effects.map((e) => [e.app, e.arg]));
    // The example still shows the command it is the example of, where printing the phrase would not.
    expect(shown).toMatch(new RegExp(`/${name}(\\s|$)`));
    // No English word is left that has an Italian one.
    const englishOnly = ALL.filter((c) => c.role !== 'pronoun' && c.labels!.it !== c.label).map((c) => c.label!);
    expect(lex(shown).filter((t) => t.kind === 'word' && englishOnly.includes(t.text))).toEqual([]);
  });

  it('writes the words in Italian, and keeps the rest as written', () => {
    expect(exampleIn(EXAMPLES.sg!, IT)).toBe('/subj ( gatto /sg )');
    expect(exampleIn(EXAMPLES.rel!, IT)).toBe('/subj ( bambino /rel subj { /verb ( amare ) /obj ( gatto ) } ) /verb ( correre )');
    expect(exampleIn(EXAMPLES.poss!, IT)).toBe('/subj ( libro /poss [ bambino /adj vecchio ] )');
    expect(exampleIn(EXAMPLES.level!, IT)).toBe(
      '/subj ( bambino ) /verb ( iniziare ) /inst { /verb ( scegliere ) /obj ( parola ) } /level process',
    );
    // A pronoun is its person in every language; a name, a language and a command are not words.
    expect(exampleIn(EXAMPLES.neut!, IT)).toBe('/subj ( 3rd /neut ) /verb ( correre )');
    expect(exampleIn(EXAMPLES.save!, IT)).toBe('/save my cats');
    expect(exampleIn(EXAMPLES.lang!, IT)).toBe('/lang it');
    expect(exampleIn(EXAMPLES.help!, IT)).toBe('/help rel');
    expect(exampleIn(EXAMPLES.pin!, IT)).toBe('/subj ( gatto ) /verb ( mangiare ) /pin');
  });

  it('shows each example as written in English', () => {
    for (const example of Object.values(EXAMPLES)) expect(exampleIn(example, EN)).toBe(example);
  });

  it('keeps a pronoun given by its form, whose person alone would lose its gender', () => {
    expect(exampleIn('/subj ( she ) /verb ( run )', IT)).toBe('/subj ( she ) /verb ( correre )');
  });

  it('keeps the English where the line does not read', () => {
    expect(exampleIn('/subj ( frobnicate )', IT)).toBe('/subj ( frobnicate )');
  });
});
