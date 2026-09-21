// The help pages (P02 phase 5): every command has one, and every example on them is a line the
// console accepts — so a page can never teach a line that does not work.
import { describe, expect, it } from 'vitest';
import { UI_STRINGS } from '@signi/shared';
import { COMMANDS, commandNamed } from '../../src/console/language/commands.ts';
import { EXAMPLES, helpPage, usageOf } from '../../src/console/language/help.ts';
import { run } from './helpers.ts';

describe('the help pages', () => {
  it('has an example for every command, and none for a command that is not there', () => {
    expect(Object.keys(EXAMPLES).sort()).toEqual(COMMANDS.map((c) => c.name).sort());
  });

  it.each(COMMANDS.map((c) => [c.name]))('runs the example for /%s cleanly from an empty period', (name) => {
    const result = run(EXAMPLES[name]!);
    expect(result.diagnostic).toBeUndefined();
    // Written as the console prints it: every period word in its bracket.
    expect(EXAMPLES[name]).not.toMatch(/\/(subj|verb|obj) [a-z]/);
    // The example uses the command it is the example of.
    expect(EXAMPLES[name]).toMatch(new RegExp(`/${name}(\\s|$)`));
  });

  it('spells each command’s argument out', () => {
    const usage = (name: string) => usageOf(COMMANDS.find((c) => c.name === name)!);
    expect(usage('pl')).toBe('/pl');
    expect(usage('subj')).toBe('/subj ( word … )');
    expect(usage('adj')).toBe('/adj word · /adj ( word … )');
    expect(usage('level')).toBe('/level process|concept|object');
    expect(usage('rel')).toBe('/rel #n.noun · /rel subj { … } · /rel obj { … }');
    expect(usage('poss')).toBe('/poss word · /poss [ word … ] · /poss #n.noun');
    expect(usage('save')).toBe('/save name');
    expect(usage('help')).toBe('/help [command]');
  });

  it('puts the interface language’s words where the argument goes, and nothing else', () => {
    const it_ = { word: 'parola', name: 'nome', command: 'comando' };
    const usage = (name: string) => usageOf(COMMANDS.find((c) => c.name === name)!, it_);
    expect(usage('subj')).toBe('/subj ( parola … )');
    expect(usage('poss')).toBe('/poss parola · /poss [ parola … ] · /poss #n.noun');
    expect(usage('save')).toBe('/save nome');
    expect(usage('help')).toBe('/help [comando]');
    // The values, the references and the brackets are the console's own, in every language.
    expect(usage('level')).toBe('/level process|concept|object');
    expect(usage('del')).toBe('/del [subj|obj|adj n|adv|modal n|poss|and n|rel|if|join|inst|period]');
    expect(helpPage('adj', it_)?.usage).toBe('/adj parola · /adj ( parola … )');
  });

  it('finds a page by name, alias or slash', () => {
    expect(helpPage('plural')?.def.name).toBe('pl');
    expect(helpPage('/rel')?.def.name).toBe('rel');
    expect(helpPage('frob')).toBeUndefined();
  });

  // B47: the page says what a command is for from the catalogue. The diagnostic keeps the English
  // `purpose`, so the two must name the same purpose: one key per distinct purpose, and back.
  it('gives every command with a purpose the catalogue’s key for it, one key per purpose', () => {
    const withPurpose = COMMANDS.filter((c) => c.purpose);
    expect(withPurpose.filter((c) => !c.purposeKey || !UI_STRINGS[c.purposeKey]).map((c) => c.name)).toEqual([]);
    expect(COMMANDS.filter((c) => c.purposeKey && !c.purpose).map((c) => c.name)).toEqual([]);
    const keyOf = new Map(withPurpose.map((c) => [c.purpose, c.purposeKey]));
    const purposeOf = new Map(withPurpose.map((c) => [c.purposeKey, c.purpose]));
    expect(withPurpose.filter((c) => keyOf.get(c.purpose) !== c.purposeKey || purposeOf.get(c.purposeKey) !== c.purpose).map((c) => c.name)).toEqual([]);
    expect(keyOf.size).toBe(22);
    // Every purpose the catalogue holds is some command's.
    const catalogued = Object.keys(UI_STRINGS).filter((key) => key.startsWith('purpose.'));
    expect(catalogued.sort()).toEqual([...purposeOf.keys()].sort());
    expect(commandNamed('pl')?.purposeKey).toBe('purpose.number');
    expect(commandNamed('neut')?.purposeKey).toBe('purpose.pronounGender');
    expect(commandNamed('not')?.purposeKey).toBe('purpose.negate');
    expect(commandNamed('pos')?.purposeKey).toBe('purpose.polarity');
    expect(commandNamed('front')?.purposeKey).toBe('purpose.specifier');
  });
});
