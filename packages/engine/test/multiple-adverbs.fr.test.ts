import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// P15. A French verb with several adverbs places each by its class: a further frequency adverb beside
// the primary, inside the verb group; a further short manner adverb ("bien") before the non-finite
// verb, a long one in the trailing manner slot; a further direction or place adverb among the
// complements.
const fr = (plan: PhrasePlan) => sayAll(plan).fr;
const runs = (verbPhrase: Partial<VerbPhrase>) => fr(clause(np('CAT'), 'RUN', { verbPhrase }));
const eats = (verbPhrase: Partial<VerbPhrase>, extra: Partial<PhrasePlan> = {}) =>
  fr({ ...clause(np('CAT'), 'EAT', { verbPhrase, directObject: np('MOUSE') }), ...extra });
const dogThat = (relative: NonNullable<NounPhrase['relative']>) => fr(clause(np('DOG', { relative }), 'RUN'));

describe('French: several adverbs on one verb', () => {
  test('frequency + manner', () => {
    expect(runs({ modifier: 'OFTEN', modifiers: ['FAST'] })).toBe('le chat court souvent vite.');
    expect(runs({ modifier: 'OFTEN', modifiers: ['FAST'], negative: true })).toBe('le chat ne court pas souvent vite.');
    expect(runs({ modifier: 'OFTEN', modifiers: ['FAST'], tense: 'past', aspect: 'resultative' })).toBe('le chat avait souvent couru vite.');
    expect(runs({ modifier: 'OFTEN', modifiers: ['FAST'], modals: ['MUST'] })).toBe('le chat doit souvent courir vite.');
    expect(runs({ modifier: 'OFTEN', modifiers: ['FAST'], aspect: 'progressive' })).toBe('le chat est souvent en train de courir vite.');
    expect(eats({ modifier: 'OFTEN', modifiers: ['FAST'] })).toBe('le chat mange souvent vite la souris.');
    expect(dogThat({ verbPhrase: { verb: 'EAT', modifier: 'OFTEN', modifiers: ['FAST'] }, directObject: np('MOUSE') }))
      .toBe('le chien qui mange souvent vite la souris court.');
  });

  test('a further short manner adverb leads the non-finite verb', () => {
    expect(runs({ modifier: 'OFTEN', modifiers: ['WELL'] })).toBe('le chat court souvent bien.');
    expect(runs({ modifier: 'OFTEN', modifiers: ['WELL'], tense: 'past', aspect: 'resultative' })).toBe('le chat avait souvent bien couru.');
    expect(eats({ modifier: 'OFTEN', modifiers: ['WELL'], modals: ['MUST'] })).toBe('le chat doit souvent bien manger la souris.');
    expect(eats({ modifier: 'OFTEN', modifiers: ['WELL'], modals: ['MUST'], negative: true }))
      .toBe('le chat doit ne pas souvent bien manger la souris.');
    expect(eats({ modifier: 'OFTEN', modifiers: ['WELL'], voice: 'passive' })).toBe('la souris est souvent bien mangée par le chat.');
    expect(eats({ modifier: 'OFTEN', modifiers: ['WELL'], voice: 'passive', aspect: 'resultative' }))
      .toBe('la souris a souvent été bien mangée par le chat.');
    expect(fr(clause(np('CAT'), 'NEED', { verbPhrase: { modifier: 'OFTEN', modifiers: ['WELL'], negative: true }, directObject: np('MOUSE') })))
      .toBe("le chat n'a pas souvent bien besoin de la souris.");
    expect(dogThat({ verbPhrase: { verb: 'EAT', modifier: 'OFTEN', modifiers: ['WELL'], aspect: 'resultative' }, directObject: np('MOUSE') }))
      .toBe('le chien qui a souvent bien mangé la souris court.');
  });

  test('manner + manner', () => {
    expect(eats({ modifier: 'WELL', modifiers: ['SLOWLY'], aspect: 'resultative' })).toBe('le chat a bien mangé lentement la souris.');
    expect(eats({ modifier: 'WELL', modifiers: ['SLOWLY'], modals: ['MUST'] })).toBe('le chat doit bien manger lentement la souris.');
    expect(eats({ modifier: 'WELL', modifiers: ['SLOWLY'], modals: ['MUST'], voice: 'passive' }))
      .toBe('la souris doit être bien mangée lentement par le chat.');
    expect(eats({ modifier: 'WELL', modifiers: ['SLOWLY'] }, { infinitive: true })).toBe('bien manger lentement la souris.');
  });

  test('manner + place', () => {
    expect(runs({ modifier: 'FAST', modifiers: ['HERE'] })).toBe('le chat court vite ici.');
    expect(runs({ modifier: 'FAST', modifiers: ['HERE'], modals: ['MUST'] })).toBe('le chat doit courir vite ici.');
    expect(eats({ modifier: 'FAST', modifiers: ['HERE'] }, { subject: np('SECOND_PERSON'), imperative: true })).toBe('mange vite la souris ici.');
  });

  test('frequency + place', () => {
    expect(runs({ modifier: 'OFTEN', modifiers: ['HERE'] })).toBe('le chat court souvent ici.');
    expect(runs({ modifier: 'OFTEN', modifiers: ['HERE'], negative: true, aspect: 'resultative' })).toBe("le chat n'a pas souvent couru ici.");
    expect(eats({ modifier: 'OFTEN', modifiers: ['HERE'], voice: 'passive' })).toBe('la souris est souvent mangée par le chat ici.');
  });

  test('frequency + manner + place, in a statement, a question, a condition and a relative clause', () => {
    expect(runs({ modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] })).toBe('le chat court souvent vite ici.');
    expect(fr({ ...clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] } }), interrogative: true }))
      .toBe('est-ce que le chat court souvent vite ici\u00a0?');
    expect(fr({
      ...clause(np('DOG'), 'RUN', { verbPhrase: { modifier: 'OFTEN', modifiers: ['FAST'] } }),
      condition: clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'OFTEN', modifiers: ['FAST', 'HERE'] } }),
    })).toBe('si le chat courait souvent vite ici, le chien courrait souvent vite.');
    expect(dogThat({ verbPhrase: { verb: 'EAT', modifier: 'OFTEN', modifiers: ['WELL', 'HERE'], aspect: 'resultative' }, directObject: np('MOUSE') }))
      .toBe('le chien qui a souvent bien mangé la souris ici court.');
  });

  test('direction + place', () => {
    expect(runs({ modifier: 'UP', modifiers: ['HERE'] })).toBe('le chat court vers le haut ici.');
    expect(fr(clause(np('CAT'), 'MOVE', { verbPhrase: { modifier: 'DOWN', modifiers: ['HERE'] }, directObject: np('BOOK') })))
      .toBe('le chat déplace le livre vers le bas ici.');
    expect(fr(clause(np('CAT'), 'MOVE', { verbPhrase: { modifier: 'FAST', modifiers: ['UP'] }, directObject: np('BOOK') })))
      .toBe('le chat déplace vite le livre vers le haut.');
  });

  test('frequency + frequency', () => {
    expect(runs({ modifier: 'ALREADY', modifiers: ['OFTEN'] })).toBe('le chat court déjà souvent.');
    expect(runs({ modifier: 'ALREADY', modifiers: ['OFTEN'], aspect: 'resultative' })).toBe('le chat a déjà souvent couru.');
    expect(runs({ modifier: 'ALREADY', modifiers: ['OFTEN'], modals: ['MUST'] })).toBe('le chat doit déjà souvent courir.');
    // STILL outscopes the negation, and the further one stays under it.
    expect(runs({ modifier: 'STILL', modifiers: ['OFTEN'], negative: true })).toBe('le chat ne court toujours pas souvent.');
    expect(eats({ modifier: 'STILL', modifiers: ['OFTEN'], negative: true, modals: ['CAN'] }))
      .toBe('le chat peut ne toujours pas souvent manger la souris.');
  });

  test('negative + manner', () => {
    expect(runs({ modifier: 'NEVER', modifiers: ['FAST'] })).toBe('le chat ne court jamais vite.');
    expect(runs({ modifier: 'NO_LONGER', modifiers: ['FAST'] })).toBe('le chat ne court plus vite.');
    expect(runs({ modifier: 'NEVER', modifiers: ['FAST'], tense: 'past', aspect: 'resultative' })).toBe("le chat n'avait jamais couru vite.");
    expect(runs({ modifier: 'NEVER', modifiers: ['FAST'], modals: ['MUST'] })).toBe('le chat doit ne jamais courir vite.');
    expect(eats({ modifier: 'NEVER', modifiers: ['WELL', 'SLOWLY'] }, { subject: np('SECOND_PERSON'), imperative: true, imperativeRegister: 'instruction' }))
      .toBe('ne jamais bien manger lentement la souris.');
    expect(dogThat({ verbPhrase: { verb: 'EAT', modifier: 'NEVER', modifiers: ['WELL'], aspect: 'resultative' }, directObject: np('MOUSE') }))
      .toBe("le chien qui n'a jamais bien mangé la souris court.");
  });

  test('sentence + frequency', () => {
    expect(runs({ modifier: 'MAYBE', modifiers: ['OFTEN'] })).toBe('peut-être que le chat court souvent.');
    expect(runs({ modifier: 'MAYBE', modifiers: ['OFTEN', 'HERE'] })).toBe('peut-être que le chat court souvent ici.');
    expect(dogThat({ verbPhrase: { verb: 'RUN', modifier: 'MAYBE', modifiers: ['OFTEN'] } })).toBe('le chien qui court peut-être souvent court.');
  });

  test('a command, a pronoun object', () => {
    expect(eats({ modifier: 'OFTEN', modifiers: ['WELL'], negative: true }, { subject: np('SECOND_PERSON'), imperative: true }))
      .toBe('ne mange pas souvent bien la souris.');
    expect(fr(clause(np('CAT'), 'SEE', { verbPhrase: { modifier: 'OFTEN', modifiers: ['FAST'], aspect: 'resultative' }, directObject: np('FIRST_PERSON') })))
      .toBe("le chat m'a souvent vu vite.");
  });
});
