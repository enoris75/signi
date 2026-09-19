// Structured lines: every word in a bracket of its own, holding what describes it, and nothing of the
// period's — `/subj ( cat /pl ) /verb ( eat /past )`. The flat lines of before still read the same.
import { describe, expect, it } from 'vitest';
import { lex, splitPeriods } from '../../src/console/language/lex.ts';
import { parse, styleTokens } from '../../src/console/language/parse.ts';
import { ids_, ok, print, run, sel } from './helpers.ts';

describe('brackets', () => {
  it('reads a word’s bracket: its word first, then what describes it', () => {
    const { items, diagnostic } = parse('/subj ( cat /pl ) /verb ( eat )');
    expect(diagnostic).toBeUndefined();
    expect(items[0]).toMatchObject({ name: 'subj', word: { text: 'cat' }, lead: true, shape: '(' });
    expect(items[0]!.body!.map((i) => i.name)).toEqual(['pl']);
    expect(items[1]).toMatchObject({ name: 'verb', word: { text: 'eat' }, body: [] });
  });

  it('means the same as the flat line', () => {
    const flat = ok('/subj cat /adj brown /pl /verb eat /past /obj food');
    const structured = ok('/subj ( cat /adj brown /pl ) /verb ( eat /past ) /obj ( food )');
    expect(structured).toEqual(flat);
  });

  it('reads any shape after any command: the command says what the bracket holds', () => {
    expect(ok('/subj [ cat /pl ]')).toEqual(ok('/subj ( cat /pl )'));
    expect(ok('/subj child /rel subj ( /verb love ) /verb read')).toEqual(ok('/subj child /rel subj { /verb love } /verb read'));
    expect(ok('/subj ( child /poss ( man /adj old ) )')).toEqual(ok('/subj ( child /poss [ man /adj old ] )'));
    // A possessor's phrase as it used to be written, its head named by /subj.
    expect(ok('/subj ( child /poss ( /subj man /adj old ) )')).toEqual(ok('/subj ( child /poss [ man /adj old ] )'));
  });

  it('reads an input method’s full-width brackets', () => {
    expect(lex('/subj （ cat ）').map((t) => t.kind)).toEqual(['command', 'open', 'word', 'close']);
    expect(ok('/subj （ cat /pl ）')).toEqual(ok('/subj ( cat /pl )'));
  });

  it('refuses a word before its own bracket, and says where it goes', () => {
    expect(parse('/subj cat ( /pl )').diagnostic?.message).toBe('Put the word inside the bracket: /subj ( cat … ).');
    expect(parse('/subj ( cat /poss man [ /adj old ] )').diagnostic?.message).toBe('Put the word inside the bracket: /poss [ man … ].');
  });
});

describe('what a bracket keeps its own', () => {
  it('refuses a command of the period inside a word’s bracket', () => {
    expect(run('/subj ( cat /verb eat )').diagnostic?.message).toBe(
      '/verb belongs to the period, not inside /subj ( … ) — close the bracket first.',
    );
    expect(run('/verb ( eat /new )').diagnostic?.message).toMatch(/\/new belongs to the period/);
  });

  it('does not reach a word whose bracket has closed', () => {
    expect(run('/subj ( cat ) /pl').diagnostic?.message).toBe(
      '/pl describes a word: write it inside its bracket, /subj ( cat … /pl ).',
    );
  });

  it('keeps what follows a noun modifier’s bracket the head’s', () => {
    const s = sel(ok('/subj ( creator /adj ( phrase ) /adj semantic /pl )'));
    expect(ids_(s)).toMatchObject({ subject: 'CREATOR', subjectAdjective: 'PHRASE', subjectAdjective2: 'SEMANTIC', subjectNumber: 'plural' });
    expect(s.modifierAdjectives?.subjectAdjective).toBeUndefined();
  });

  it('keeps a modal’s adverb its own, and the tense the verb’s', () => {
    const s = sel(ok('/verb ( eat /modal ( can /adv never ) /past )'));
    expect(ids_(s)).toMatchObject({ verb: 'EAT', verbModal: 'CAN', verbTense: 'past' });
    expect(print(ok('/verb ( eat /modal ( can /adv never ) /past )'))).toBe('/verb ( eat /modal ( can /adv never ) /past )');
  });

  it('keeps an adjective’s degree in its bracket, and says where a stray one goes', () => {
    expect(sel(ok('/subj ( cat /adj ( big /more ) )')).adjectiveDegrees?.subjectAdjective).toBe('more');
    expect(run('/subj ( cat /more )').diagnostic?.message).toMatch(/\/more sets an adjective’s degree, and cat is a noun/);
  });

  it('rests the context on the word whose bracket closed last', () => {
    expect(run('/subj ( cat /pl )').context.word).toMatchObject({ slot: 'subject' });
    expect(run('/subj ( cat ) /verb ( eat )').context.word).toMatchObject({ slot: 'verb' });
  });
});

describe('periods over several lines', () => {
  it('ends a period at a line break outside every bracket, and nowhere else', () => {
    expect(splitPeriods('/subj ( cat\n/pl )\n/subj dog').map((p) => p.text)).toEqual(['/subj ( cat\n/pl )', '/subj dog']);
    const state = ok('/subj ( cat\n  /pl )\n/subj ( dog )');
    expect(state.containers.map((c) => c.selection.subject?.id)).toEqual(['CAT', 'DOG']);
    expect(sel(state).subjectNumber).toBe('plural');
  });

  it('places a mistake on a later line where it is in the script', () => {
    const text = '/subj ( cat\n /frob )';
    const d = run(text).diagnostic!;
    expect(text.slice(d.from, d.to)).toBe('/frob');
  });
});

describe('colours', () => {
  it('draws the word that opens a bracket as its command’s, and the bracket in the word’s colour', () => {
    const styled = styleTokens('/subj ( cat /pl ) /poss [ man ]');
    const at = (text: string) => styled.find((t) => '/subj ( cat /pl ) /poss [ man ]'.slice(t.from, t.to) === text)!;
    expect(at('cat')).toMatchObject({ style: at('/subj').style, italic: true });
    expect(at('(').style).toBe(at('/subj').style);
    expect(at('man')).toMatchObject({ italic: true });
  });
});
