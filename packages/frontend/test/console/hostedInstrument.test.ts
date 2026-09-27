import { describe, expect, it } from 'vitest';
import { sameWorkspace } from '../../src/console/language/normalize.ts';
import { applyScript } from '../../src/console/language/apply.ts';
import { ok, print, script, ids } from './helpers.ts';
import { EN } from './vocab.ts';

// P12: an instrument made in place is drawn inside its clause. In the console it is typed in its
// braces, and printed in them — it has no line and no number of its own.
describe('a hosted instrument in the console', () => {
  it('is typed in braces, made hosted, and printed back in them', () => {
    const s = ok('/subj cat /verb eat /inst { /subj stick }');
    expect(s.links).toEqual([expect.objectContaining({ kind: 'instrumental', hosted: true })]);
    expect(script(s)).toBe('/subj ( cat ) /verb ( eat ) /inst { /subj ( stick ) }');
  });

  it('keeps a picked period linked, on a line of its own', () => {
    const s = ok('/subj cat /verb eat /inst #2\n/subj stick');
    expect(s.links[0]).not.toHaveProperty('hosted');
    expect(script(s)).toBe('/subj ( cat ) /verb ( eat ) /inst #2\n/subj ( stick )');
  });

  it('prints an act with its level after the braces, and applies it back', () => {
    const s = ok('/subj cat /verb eat /inst { /verb read /obj book } /level process');
    const line = script(s);
    expect(line).toBe('/subj ( cat ) /verb ( eat ) /inst { /verb ( read ) /obj ( book ) } /level process');
    const again = applyScript({ containers: [{ id: 'p1', selection: {} }], links: [] }, line, { context: { containerId: 'p1' }, vocab: EN, newId: ids() });
    expect(again.diagnostic).toBeUndefined();
    expect(sameWorkspace(again.state, s)).toBe(true);
  });

  it('leaves the hosted period out of the numbering', () => {
    const s = ok('/subj cat /verb eat /inst { /subj stick }\n/subj dog');
    // The dog is the second period, whatever the stack holds.
    expect(script(s).split('\n')).toEqual(['/subj ( cat ) /verb ( eat ) /inst { /subj ( stick ) }', '/subj ( dog )']);
    expect(ok('#2 /verb run', { state: s }).containers.find((c) => c.selection.subject?.id === 'DOG')!.selection.verb?.id).toBe('RUN');
  });

  it('goes with its link, and with its clause', () => {
    const s = ok('/subj cat /verb eat /inst { /subj stick }');
    expect(ok('/del inst', { state: s }).containers).toHaveLength(1);
    const two = ok('/subj cat /verb eat /inst { /subj stick }\n/subj dog');
    expect(ok('#1 /del period', { state: two }).containers.map((c) => c.selection.subject?.id)).toEqual(['DOG']);
  });

  it('prints its words under keys of their own, apart from its clause’s', () => {
    const s = ok('/subj cat /verb eat /inst { /subj stick }');
    expect(print(s)).toContain('/inst {');
  });
});
