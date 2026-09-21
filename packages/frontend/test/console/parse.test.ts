import { describe, expect, it } from 'vitest';
import { lex } from '../../src/console/language/lex.ts';
import { parse, styleTokens } from '../../src/console/language/parse.ts';
import { parseRef, printRef } from '../../src/console/language/resolve.ts';

describe('lex', () => {
  it('cuts a line into commands, words, references and brackets, with their spans', () => {
    expect(lex('/adj ice cream  #2.obj ( /pl )')).toEqual([
      { kind: 'command', name: 'adj', from: 0, to: 4 },
      { kind: 'word', text: 'ice cream', from: 5, to: 14 },
      { kind: 'ref', text: '2.obj', from: 16, to: 22 },
      { kind: 'open', shape: '(', from: 23, to: 24 },
      { kind: 'command', name: 'pl', from: 25, to: 28 },
      { kind: 'close', shape: '(', from: 29, to: 30 },
    ]);
  });

  it('takes the Japanese input method’s slashes as a command, but not inside a word', () => {
    expect(lex('・subj 猫 ／pl').map((t) => t.kind)).toEqual(['command', 'word', 'command']);
    expect(lex('/subj アイス・クリーム')).toEqual([
      expect.objectContaining({ kind: 'command', name: 'subj' }),
      expect.objectContaining({ kind: 'word', text: 'アイス・クリーム' }),
    ]);
  });
});

describe('parse', () => {
  it('reads a command, its word and its bracket', () => {
    const { items, diagnostic } = parse('/subj child /rel subj ( /verb love ) /pl');
    expect(diagnostic).toBeUndefined();
    expect(items.map((i) => i.name)).toEqual(['subj', 'rel', 'pl']);
    expect(items[1]).toMatchObject({ word: { text: 'subj' }, open: { from: 22 }, close: { from: 35 } });
    expect(items[1]!.body!.map((i) => i.name)).toEqual(['verb']);
  });

  it('reads an alias as the command it stands for', () => {
    expect(parse('/plural').items[0]!.def?.name).toBe('pl');
  });

  it('lets a line end inside brackets', () => {
    const { items, diagnostic } = parse('/if ( /subj cat /verb eat');
    expect(diagnostic).toBeUndefined();
    expect(items[0]!.close).toBeUndefined();
    expect(items[0]!.body).toHaveLength(2);
  });

  it('stops at the first mistake, keeping what came before it', () => {
    const { items, diagnostic } = parse('/subj cat /frob /pl');
    expect(items.map((i) => i.name)).toEqual(['subj']);
    expect(diagnostic).toMatchObject({ from: 10, to: 15, code: 'unknownCommand', args: { command: 'frob' } });
  });

  it('keeps a bracket whose inside has a mistake, up to it', () => {
    const { items, diagnostic } = parse('/poss ( /subj man /frob )');
    expect(diagnostic).toBeDefined();
    expect(items[0]!.body!.map((i) => i.name)).toEqual(['subj']);
  });

  it('refuses a word a command takes none of, and keeps the command', () => {
    const { items, diagnostic } = parse('/pl cats');
    expect(items.map((i) => i.name)).toEqual(['pl']);
    expect(diagnostic).toMatchObject({ code: 'takesNoWord', args: { command: 'pl' } });
  });

  it('refuses a value a command does not take, and a stray close', () => {
    expect(parse('/level soon').diagnostic).toMatchObject({
      code: 'valueNotTaken',
      args: { command: 'level', values: ['process', 'concept', 'object'], given: 'soon' },
    });
    expect(parse('/subj cat )').diagnostic).toMatchObject({ code: 'strayCloser' });
    expect(parse('/rel dog').diagnostic).toMatchObject({ code: 'relativeTakes' });
  });

  it('reads a reference as an item of its own', () => {
    const { items } = parse('#2.obj /pl');
    expect(items[0]).toMatchObject({ kind: 'goto', ref: { text: '2.obj' } });
  });
});

describe('references', () => {
  it('read and write a period, a noun, a possessor and a conjunct', () => {
    expect(parseRef('2')).toEqual({ period: 2 });
    expect(parseRef('1.subj.poss')).toEqual({ period: 1, address: 'subject/possessor' });
    expect(parseRef('1.obj.and2')).toEqual({ period: 1, address: 'directObject/conjunct/0' });
    expect(printRef(1, 'directObject/conjunct/0/possessor')).toBe('#1.obj.and2.poss');
    expect(parseRef('x')).toMatchObject({ error: { code: 'referenceStartsWithNumber' } });
  });
});

describe('colours', () => {
  it('wears the colour of the box each token fills, and a bracket its link’s', () => {
    const styled = styleTokens('/subj cat /pl /if ( /verb eat )');
    expect(styled.map((t) => t.style)).toEqual(['primary', 'primary', 'setting', 'warning', 'warning', 'secondary', 'secondary', 'warning']);
    expect(styled[1]!.italic).toBe(true);
  });
});
