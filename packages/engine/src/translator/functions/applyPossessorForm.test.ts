import { describe, expect, test } from 'vitest';
import type { PronominalPossessor } from '@signi/shared';
import { np, type Forms } from '../../languages/resolved.fixtures.js';
import { applyPossessorForm } from './applyPossessorForm.js';

// ja MOTHER: nobody's is 母親, one's own 母, someone else's お母さん — three separate words.
const HAHAOYA: Forms = {
  base: '母親', reading: 'ははおや', kin: '1',
  possessed: '母', possessed_reading: 'はは',
  honorific: 'お母さん', honorific_reading: 'おかあさん',
};
// ja PARENT: the plural is another word (両親), and so is its honorific (ご両親).
const OYA: Forms = {
  base: '親', reading: 'おや', kin: '1', number: 'plural',
  honorific: '親御さん', honorific_reading: 'おやごさん',
  plural: '両親', plural_reading: 'りょうしん',
  plural_honorific: 'ご両親', plural_honorific_reading: 'ごりょうしん',
};
// de WIFE: the long word is right without an owner, the short one once there is one (D6).
const EHEFRAU: Forms = { base: 'Ehefrau', plural: 'Ehefrauen', gender: 'fem', possessed: 'Frau', possessed_plural: 'Frauen' };
// A noun with no form of its own for any of this — the ordinary case, in all seven languages.
const HON: Forms = { base: '本', reading: 'ほん' };

const pron = (person: '1' | '2' | '3', number: 'singular' | 'plural' = 'singular', gender?: 'masc' | 'fem' | 'neut'): PronominalPossessor =>
  ({ kind: 'pronominal', person, number, gender });

/** The head forms after `possessor` has chosen a form of them. */
const under = (head: Forms, possessor?: Parameters<typeof applyPossessorForm>[1]): Forms => {
  const forms = { ...head };
  applyPossessorForm(forms, possessor);
  return forms;
};

describe('applyPossessorForm', () => {
  describe('which column the possessor selects', () => {
    test('no possessor leaves the head its own word', () => {
      expect(under(HAHAOYA)).toMatchObject({ base: '母親', reading: 'ははおや' });
    });

    test('the speaker\'s own relative takes `possessed`', () => {
      expect(under(HAHAOYA, pron('1'))).toMatchObject({ base: '母', reading: 'はは' });
      expect(under(HAHAOYA, pron('1', 'plural'))).toMatchObject({ base: '母', reading: 'はは' });
    });

    test('another person\'s takes `honorific`', () => {
      expect(under(HAHAOYA, pron('2'))).toMatchObject({ base: 'お母さん', reading: 'おかあさん' });
      expect(under(HAHAOYA, pron('3', 'singular', 'fem'))).toMatchObject({ base: 'お母さん' });
      expect(under(HAHAOYA, pron('3', 'plural'))).toMatchObject({ base: 'お母さん' });
    });

    // A cat's mother is 猫の母, not 猫のお母さん: the honorific goes to people.
    test('a possessor that is not a person takes `possessed`, honorific or not', () => {
      expect(under(HAHAOYA, pron('3', 'singular', 'neut'))).toMatchObject({ base: '母' });
      expect(under(HAHAOYA, np({ base: '猫', animate: '1' }))).toMatchObject({ base: '母' });
    });

    test('a genitive possessor the lexicon marks human takes `honorific`', () => {
      expect(under(HAHAOYA, np({ base: '男の子', human: '1' }))).toMatchObject({ base: 'お母さん' });
    });

    // A gloss's possessor is a kind of person, not a person: "a parent's mother" is 親の母親, where
    // the boy's is 男の子のお母さん (localization B71).
    test('an indefinite or bare possessor leaves the head its citation form', () => {
      expect(under(HAHAOYA, np({ base: '親', human: '1' }, { definiteness: 'indefinite' })))
        .toMatchObject({ base: '母親', reading: 'ははおや' });
      expect(under(HAHAOYA, np({ base: '親', human: '1' }, { definiteness: 'bare' })))
        .toMatchObject({ base: '母親' });
      expect(under(EHEFRAU, np({ base: 'Kind' }, { definiteness: 'indefinite' })))
        .toMatchObject({ base: 'Ehefrau' });
      expect(under(HAHAOYA, np({ base: '男の子', human: '1' }, { definiteness: 'definite' })))
        .toMatchObject({ base: 'お母さん' });
    });

    // D3: 私の兄の妻 is 兄の妻 — one's own all the way down the chain.
    test('a genitive possessor that is itself one\'s own relative takes `possessed`', () => {
      const brother = np({ base: '兄', kin: '1', human: '1', own: '1' });
      expect(under(HAHAOYA, brother)).toMatchObject({ base: '母' });
    });
  });

  describe('the fallback, from honorific to possessed to base', () => {
    // MOM is お母さん whoever's mother it is: casual Japanese has lost the own/other split (D13).
    test('a kin noun with neither column keeps its one word under every possessor', () => {
      const okaasan: Forms = { base: 'お母さん', reading: 'おかあさん', kin: '1' };
      for (const possessor of [undefined, pron('1'), pron('2'), pron('3'), np({ base: '男の子', human: '1' })]) {
        expect(under(okaasan, possessor)).toMatchObject({ base: 'お母さん', reading: 'おかあさん' });
      }
    });

    test('a head with no honorific falls back to possessed', () => {
      expect(under(EHEFRAU, pron('2'))).toMatchObject({ base: 'Frau' });
    });

    test('a head with no column at all is left as it is', () => {
      expect(under(HON, pron('2'))).toEqual(HON);
      expect(under(HON, pron('1'))).toEqual(HON);
    });
  });

  // D6: "ma femme" / "meine Frau" under any possessor at all, "une épouse" without one.
  describe('the possessed form of the head', () => {
    test('applies under an own, another\'s and a non-human possessor alike', () => {
      for (const possessor of [pron('1'), pron('2'), pron('3', 'singular', 'neut'), np({ base: 'Junge', human: '1' })]) {
        expect(under(EHEFRAU, possessor)['base']).toBe('Frau');
      }
      expect(under(EHEFRAU)['base']).toBe('Ehefrau');
    });

    test('the plural has a column of its own, and fills both surfaces', () => {
      expect(under({ ...EHEFRAU, number: 'plural' }, pron('1')))
        .toMatchObject({ base: 'Frauen', plural: 'Frauen' });
    });
  });

  describe('a plural that is another word', () => {
    test('one\'s own parents are 両親, which the lexeme already carries as its plural', () => {
      expect(under(OYA, pron('1'))).toMatchObject({ base: '親', plural: '両親' });
    });

    test('another\'s are ご両親, with its own reading', () => {
      expect(under(OYA, pron('2'))).toMatchObject({ base: 'ご両親', plural: 'ご両親', plural_reading: 'ごりょうしん' });
    });

    test('the singular honorific is a different word again', () => {
      expect(under({ ...OYA, number: 'singular' }, pron('2'))).toMatchObject({ base: '親御さん', reading: 'おやごさん' });
    });
  });

  // ははおや over お母さん would be a wrong ruby, not a missing one.
  test('a selected column with no reading clears the one it replaced', () => {
    const forms = under({ base: '母親', reading: 'ははおや', kin: '1', honorific: 'お母さん' }, pron('2'));
    expect(forms['base']).toBe('お母さん');
    expect(forms['reading']).toBeUndefined();
  });

  describe('the own mark the chain is carried by', () => {
    test('a kin head under one\'s own possessor is itself one\'s own', () => {
      expect(under(HAHAOYA, pron('1'))['own']).toBe('1');
      expect(under(HAHAOYA, pron('1', 'plural'))['own']).toBe('1');
      expect(under(HAHAOYA, np({ base: '兄', kin: '1', human: '1', own: '1' }))['own']).toBe('1');
    });

    test('any other possessor leaves it unmarked', () => {
      expect(under(HAHAOYA, pron('2'))['own']).toBeUndefined();
      expect(under(HAHAOYA, pron('3'))['own']).toBeUndefined();
      expect(under(HAHAOYA, np({ base: '猫' }))['own']).toBeUndefined();
      expect(under(HAHAOYA)['own']).toBeUndefined();
    });

    // Only the Japanese lexemes seed `kin`, so nothing marks itself in the other six — and "my book"
    // is not a relative in any of them.
    test('a head that is not a kin noun never marks itself', () => {
      expect(under(HON, pron('1'))['own']).toBeUndefined();
      expect(under(EHEFRAU, pron('1'))['own']).toBeUndefined();
    });
  });
});
