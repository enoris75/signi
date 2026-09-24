import { describe, expect, it } from 'vitest';
import type { NounPhrase } from '@signi/shared';
import { attachCoordination } from '../../../src/components/PhraseBuilder/workspacePlan/functions/attachCoordination.ts';
import { selectionToPlan } from '../../../src/components/PhraseBuilder/selectionToPlan/index.ts';
import type { PhraseContainer, PhraseLink } from '../../../src/components/PhraseBuilder/interfaces.ts';
import { byId, CAT, coordinative, DOG, EAT, instrumental, KNIFE, period, relative, SEE, SLEEP } from '../fixtures.ts';

const MAIN = period('main', { subject: CAT, verb: SLEEP });
const SECOND = period('second', { subject: DOG, verb: EAT, directObject: CAT });
const SEES = period('sees', { verb: SEE });

const attach = (links: PhraseLink[], main: PhraseContainer = MAIN, second = SECOND, seen = new Set(['main'])) => {
  const plan = selectionToPlan(main.selection);
  attachCoordination(plan, main, links, byId(main, second, SEES), seen);
  return plan;
};

describe('attachCoordination', () => {
  it('hangs the second clause on the first, under the link’s conjunction', () => {
    expect(attach([coordinative('c', 'main', 'second', 'but')]).coordination).toEqual({
      conjunction: 'but',
      clause: selectionToPlan(SECOND.selection),
    });
  });

  it.each<[string, PhraseLink[]]>([
    ['no link at all', []],
    ['only a coordination of another period', [coordinative('c', 'sees', 'second')]],
    ['only a relative clause', [relative('r', ['main', 'subject'], ['second', 'subject'])]],
    ['a coordination with a period that is gone', [coordinative('c', 'main', 'gone')]],
  ])('attaches nothing with %s', (_, links) => {
    expect(attach(links)).not.toHaveProperty('coordination');
  });

  it('attaches nothing when the second period is already on the path', () => {
    expect(attach([coordinative('c', 'main', 'second')], MAIN, SECOND, new Set(['main', 'second']))).not.toHaveProperty(
      'coordination',
    );
  });

  it('folds the second clause’s own relative clauses in', () => {
    const plan = attach([coordinative('c', 'main', 'second'), relative('r', ['second', 'subject'], ['sees', 'subject'])]);

    expect((plan.coordination?.clause.subject as NounPhrase).relative?.verbPhrase.verb).toBe('SEE');
  });

  it('folds the second clause’s own instrument in (P13)', () => {
    const knife = period('knife', { subject: KNIFE });
    const plan = selectionToPlan(MAIN.selection);
    attachCoordination(plan, MAIN, [coordinative('c', 'main', 'second', 'and'), instrumental('i', 'second', 'knife')], byId(MAIN, SECOND, knife), new Set(['main']));

    expect(plan.coordination?.clause.complements?.instrumental?.phrase).toMatchObject({ concept: 'KNIFE' });
  });

  it('gives the second clause no coordination of its own', () => {
    const plan = attach([coordinative('c', 'main', 'second'), coordinative('d', 'second', 'sees')]);

    expect(plan.coordination?.clause).not.toHaveProperty('coordination');
  });

  it('speaks a second command to the first one’s addressee, in the first one’s register', () => {
    const first = period('main', { verb: SLEEP, imperative: true, imperativePerson: '1pl', imperativeRegister: 'instruction' });
    const second = period('second', { verb: EAT, imperative: true, imperativePerson: '2sg' });

    const clause = attach([coordinative('c', 'main', 'second')], first, second).coordination?.clause;

    expect(clause).toMatchObject({
      subject: { concept: 'FIRST_PERSON', number: 'plural' },
      imperative: true,
      imperativeRegister: 'instruction',
    });
  });

  it('leaves the second clause’s own mood alone when the first is no command', () => {
    const second = period('second', { subject: DOG, verb: EAT, imperative: true, imperativePerson: '2pl' });

    const clause = attach([coordinative('c', 'main', 'second')], MAIN, second).coordination?.clause;

    expect(clause).toEqual(selectionToPlan(second.selection));
  });

  it('does not treat a first period marked a command but with no verb as one', () => {
    const first = period('main', { subject: CAT, imperative: true, imperativePerson: '1pl' });

    const clause = attach([coordinative('c', 'main', 'second')], first).coordination?.clause;

    expect(clause).not.toHaveProperty('imperative');
    expect(clause?.subject).toMatchObject({ concept: 'DOG' });
  });
});
