import { describe, expect, test } from 'vitest';
import { vp } from '../../languages/resolved.fixtures.js';
import { controllerCase } from './controllerCase.js';

describe('controllerCase', () => {
  test('a Romance dative controller takes the dative preposition (permette al gatto, permet au chat)', () => {
    const permettere = vp({ base: 'permettere', object_case: 'dat' });
    expect(controllerCase(permettere, 'it', true)?.verb.forms['object_prep']).toBe('a');
    expect(controllerCase(vp({ base: 'permettre', object_case: 'dat' }), 'fr', true)?.verb.forms['object_prep']).toBe('à');
    expect(controllerCase(vp({ base: 'permitir', object_case: 'dat' }), 'es', true)?.verb.forms['object_prep']).toBe('a');
    expect(controllerCase(vp({ base: 'permitir', object_case: 'dat' }), 'pt', true)?.verb.forms['object_prep']).toBe('a');
  });

  test('without object control the object stays plain (permette il cibo)', () => {
    const permettere = vp({ base: 'permettere', object_case: 'dat' });
    expect(controllerCase(permettere, 'it', false)).toBe(permettere);
  });

  test('an accusative governor, or one with its own preposition, is unchanged (aiuta il gatto)', () => {
    const aiutare = vp({ base: 'aiutare' });
    expect(controllerCase(aiutare, 'it', true)).toBe(aiutare);
    const own = vp({ base: 'x', object_case: 'dat', object_prep: 'su' });
    expect(controllerCase(own, 'it', true)).toBe(own);
    expect(controllerCase(undefined, 'it', true)).toBeUndefined();
  });

  test('German turns a controller_case into the object_case it declines by (erlaubt dem Kater)', () => {
    expect(controllerCase(vp({ base: 'erlauben', controller_case: 'dat' }), 'de', true)?.verb.forms['object_case']).toBe('dat');
    const helfen = vp({ base: 'helfen', object_case: 'dat' });
    expect(controllerCase(helfen, 'de', true)).toBe(helfen);
  });

  test('English and Japanese are unchanged (Japanese reads object_case itself)', () => {
    const yurusu = vp({ base: '許す', object_case: 'dat' });
    expect(controllerCase(yurusu, 'ja', true)).toBe(yurusu);
  });
});
