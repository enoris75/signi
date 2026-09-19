// The help pages (P02 phase 5): every command has one, and every example on them is a line the
// console accepts — so a page can never teach a line that does not work.
import { describe, expect, it } from 'vitest';
import { COMMANDS } from '../../src/console/language/commands.ts';
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
  });

  it('finds a page by name, alias or slash', () => {
    expect(helpPage('plural')?.def.name).toBe('pl');
    expect(helpPage('/rel')?.def.name).toBe('rel');
    expect(helpPage('frob')).toBeUndefined();
  });
});
