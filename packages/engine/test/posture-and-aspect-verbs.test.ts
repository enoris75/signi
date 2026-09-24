import { describe, expect, test } from 'vitest';
import type { PhrasePlan } from '@signi/shared';
import { clause, np, say } from './harness.js';
import { infinitiveGloss, causativeGloss } from '../../backend/src/concepts/verbs/gloss.js';

// docs/localization B83, B84 and B86: the E24 body verbs (SIT_DOWN, STAND_UP, WALK, RUN_AWAY, LEAD,
// HOLD_GRASP), the verbs of ending and going on (STOP, STOP_ONESELF, WAIT, DIE, CONTINUE) and the
// verbs of the mind (MEET, REMEMBER, CONSIDER). This file pins each new word's paradigm and every
// gloss the three tickets shipped, and the NO_LONGER fix B84 needed first.

const the = (concept: string, extra: Parameters<typeof np>[1] = {}) => np(concept, { definiteness: 'definite', ...extra });
const command = (verb: string, extra: Parameters<typeof clause>[2] = {}): PhrasePlan =>
  ({ ...clause(np('SECOND_PERSON'), verb, extra), imperative: true });

// ── NO_LONGER where the clause writes its own negator (B84 reading 1) ─────

// Spanish *ya no* and Portuguese *já não* are the negator with a word in front. A finite clause
// fronts them in place of its "no" ("el gato ya no corre"); an infinitive, a command and the group a
// modal governs wrote the negator and then the adverb, saying it twice: *no correr ya no*. The lexeme
// names the leading word (`negator_lead`), which now stands in front of the negator instead.
describe('NO_LONGER leads the negator it carries (es, pt)', () => {
  test.each<[string, PhrasePlan, string, string]>([
    ['an infinitive', infinitiveGloss('RUN', { modifier: 'NO_LONGER' }), 'ya no correr.', 'já não correr.'],
    ['an infinitive with an object', infinitiveGloss('EAT', { object: 'FOOD', modifier: 'NO_LONGER' }), 'ya no comer comida.', 'já não comer comida.'],
    ['an infinitive with a pronoun object', infinitiveGloss('EAT', { object: 'THIRD_PERSON', antecedent: 'FOOD', modifier: 'NO_LONGER' }), 'ya no comerla.', 'já não a comer.'],
    ['a reflexive infinitive', infinitiveGloss('MOVE_ONESELF', { modifier: 'NO_LONGER' }), 'ya no moverse.', 'já não se mover.'],
    ['a caused clause', causativeGloss({ object: 'PERSON', definiteness: 'indefinite' }, { verb: 'RUN', modifier: 'NO_LONGER' }), 'inducir a una persona a ya no correr.', 'induzir uma pessoa a já não correr.'],
    ['a purpose clause', infinitiveGloss('EAT', { object: 'FOOD', purpose: { verb: 'RUN', modifier: 'NO_LONGER' } }), 'comer comida para ya no correr.', 'comer comida para já não correr.'],
    ['a command', command('RUN', { verbPhrase: { modifier: 'NO_LONGER' } }), 'ya no corras.', 'já não corra.'],
    ['the group a modal governs', clause(the('CAT'), 'RUN', { verbPhrase: { modifier: 'NO_LONGER', modals: ['CAN'] } }), 'el gato puede ya no correr.', 'o gato pode já não correr.'],
  ])('%s', (_, plan, es, pt) => {
    expect(say(plan, 'es')).toBe(es);
    expect(say(plan, 'pt')).toBe(pt);
  });

  // What did not change: the finite clause already fronted it, and NEVER, which is a word of its own,
  // still trails the negated infinitive and command.
  test('the finite clause, and NEVER', () => {
    expect(say(clause(the('CAT'), 'RUN', { verbPhrase: { modifier: 'NO_LONGER' } }), 'es')).toBe('el gato ya no corre.');
    expect(say(clause(the('CAT'), 'RUN', { verbPhrase: { modifier: 'NO_LONGER', tense: 'past' } }), 'pt')).toBe('o gato já não correu.');
    expect(say(infinitiveGloss('RUN', { modifier: 'NEVER' }), 'es')).toBe('no correr nunca.');
    expect(say(infinitiveGloss('RUN', { modifier: 'NEVER' }), 'pt')).toBe('não correr nunca.');
    expect(say(command('RUN', { verbPhrase: { modifier: 'NEVER' } }), 'es')).toBe('no corras nunca.');
  });
});
