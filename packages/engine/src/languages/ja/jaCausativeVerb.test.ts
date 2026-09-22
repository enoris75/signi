import { describe, expect, test } from 'vitest';
import type { ConceptForms } from '../../types.js';
import { jaCausativeVerb } from './jaCausativeVerb.js';

const verb = (forms: Record<string, string>): ConceptForms => ({ conceptId: 'V', forms });

describe('jaCausativeVerb', () => {
  test('a godan verb takes せる on its nai stem', () => {
    // 走る: nai 走らない, passive 走られる — the stem is 走ら, so the passive is stem + れる.
    const c = jaCausativeVerb(verb({ base: '走る', nai: '走らない', passive: '走られる', reading: 'はしる', nai_reading: 'はしらない' }));
    expect(c.forms['base']).toBe('走らせる');
    expect(c.forms['masu_present']).toBe('走らせます');
    expect(c.forms['nai']).toBe('走らせない');
    expect(c.forms['reading']).toBe('はしらせる');
  });

  test('an ichidan verb takes させる, which its passive られる tells apart', () => {
    const c = jaCausativeVerb(verb({ base: '食べる', nai: '食べない', passive: '食べられる', reading: 'たべる', nai_reading: 'たべない' }));
    expect(c.forms['base']).toBe('食べさせる');
    expect(c.forms['te']).toBe('食べさせて');
    expect(c.forms['reading']).toBe('たべさせる');
  });

  test('a する compound gives its し up to さ', () => {
    const c = jaCausativeVerb(verb({ base: 'クリックする', nai: 'クリックしない', passive: 'クリックされる' }));
    expect(c.forms['base']).toBe('クリックさせる');
    expect(c.forms['masu_present']).toBe('クリックさせます');
  });

  test('a verb in kana alone carries no reading over', () => {
    const c = jaCausativeVerb(verb({ base: 'あげる', nai: 'あげない', passive: 'あげられる' }));
    expect(c.forms['base']).toBe('あげさせる');
    expect(c.forms['reading']).toBeUndefined();
  });

  test('a lexeme with no nai form is left as it is', () => {
    const v = verb({ base: '走る' });
    expect(jaCausativeVerb(v)).toBe(v);
  });
});
