import { describe, expect, test } from 'vitest';
import type { PathSpecifier } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

const goVia = (value: PathSpecifier) =>
  sayAll(clause(np('CAT'), 'GO', {
    complements: { route: { phrase: np('MARKET'), specifiers: [{ kind: 'path', value }] } },
  }));

// The path a motion takes. Unlike the other complements the route carries a specifier, which
// selects the spatial relation — through / under / over / around / behind / in front of.
describe('route', () => {
  test('through', () => {
    expect(goVia('through')).toMatchObject({
      en: 'the cat goes through the market.',
      it: 'il gatto va attraverso il mercato.',
      de: 'der Kater geht durch den Markt.',
      // Japanese marks a traversed path with を, even though the verb is intransitive.
      ja: '猫は市場を行きます。',
    });
  });

  test('under', () => {
    expect(goVia('under')).toMatchObject({
      en: 'the cat goes under the market.',
      it: 'il gatto va sotto il mercato.',
      es: 'el gato va debajo del mercado.',
      ja: '猫は市場の下を行きます。',
    });
  });
});
