import { describe, expect, test } from 'vitest';
import { DU, ER, ICH, KATER, KATZE, MAN, MESSER } from './de.fixtures.js';
import { personalPronoun } from './personalPronoun.js';

describe('personalPronoun', () => {
  test('the first and second persons are ich/wir and du/ihr by number', () => {
    expect(personalPronoun(ICH)).toEqual({ pronoun: 'ich', pn: '1sg' });
    expect(personalPronoun({ ...ICH, number: 'plural' })).toEqual({ pronoun: 'wir', pn: '1pl' });
    expect(personalPronoun(DU)).toEqual({ pronoun: 'du', pn: '2sg' });
    expect(personalPronoun({ ...DU, number: 'plural' })).toEqual({ pronoun: 'ihr', pn: '2pl' });
  });

  // A noun is referred back to by its grammatical gender: "das Messer" is "es", "die Katze" "sie".
  test('the third singular goes by gender, the third plural is sie', () => {
    expect(personalPronoun(KATER)).toEqual({ pronoun: 'er', pn: '3sg' });
    expect(personalPronoun(KATZE)).toEqual({ pronoun: 'sie', pn: '3sg' });
    expect(personalPronoun(MESSER)).toEqual({ pronoun: 'es', pn: '3sg' });
    expect(personalPronoun({ ...ER, gender: 'fem' })).toEqual({ pronoun: 'sie', pn: '3sg' });
    expect(personalPronoun({ ...KATER, number: 'plural' })).toEqual({ pronoun: 'sie', pn: '3pl' });
    expect(personalPronoun({ person: '3', number: 'plural', gender: 'masc' })).toEqual({ pronoun: 'sie', pn: '3pl' });
  });

  test('the generic person is man, and a genderless third singular is neuter', () => {
    expect(personalPronoun(MAN)).toEqual({ pronoun: 'man', pn: '3sg' });
    expect(personalPronoun({})).toEqual({ pronoun: 'es', pn: '3sg' });
  });
});
