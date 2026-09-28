import { describe, expect, test } from 'vitest';
import { verbWord } from './verbWord.js';

describe('verbWord', () => {
  test.each<[string, string]>([
    ['valgo', 'nevalgo'],
    ['suvalgė', 'nesuvalgė'],
    ['valgyk', 'nevalgyk'],
    ['valgyti', 'nevalgyti'],
    ['esu', 'nesu'],
    ['esi', 'nesi'],
    ['yra', 'nėra'],
    ['esame', 'nesame'],
    ['esate', 'nesate'],
    ['buvo', 'nebuvo'],
    ['bus', 'nebus'],
    ['ėjo', 'nėjo'],
    ['eina', 'neina'],
    ['eis', 'neis'],
    ['nusiprausė', 'nenusiprausė'],
  ])('ne- is written together: %s → %s', (form, negated) => {
    expect(verbWord(form, true)).toBe(negated);
  });

  test.each<[string, string]>([
    ['prausiu', 'prausiuosi'],
    ['prausi', 'prausiesi'],
    ['prausia', 'prausiasi'],
    ['prausiame', 'prausiamės'],
    ['prausiate', 'prausiatės'],
    ['prausiau', 'prausiausi'],
    ['prausei', 'prauseisi'],
    ['prausė', 'prausėsi'],
    ['prausėme', 'prausėmės'],
    ['prausdavau', 'prausdavausi'],
    ['prausdavai', 'prausdavaisi'],
    ['prausdavo', 'prausdavosi'],
    ['praus', 'prausis'],
    ['prausime', 'prausimės'],
    ['prausčiau', 'prausčiausi'],
    ['praustum', 'praustumeisi'],
    ['praustų', 'praustųsi'],
    ['prausk', 'prauskis'],
    ['prauskime', 'prauskimės'],
    ['prauskite', 'prauskitės'],
    ['mokai', 'mokaisi'],
    ['moko', 'mokosi'],
    ['prausdamas', 'prausdamasis'],
    ['prausdama', 'prausdamasi'],
    ['prausdami', 'prausdamiesi'],
    ['prausdamos', 'prausdamosi'],
    ['prausęs', 'prausęsis'],
    ['prausę', 'prausęsi'],
  ])('a suffix reflexive takes -si by its ending: %s → %s', (form, reflexive) => {
    expect(verbWord(form, false, true)).toBe(reflexive);
  });

  test.each<[string, string]>([
    ['prausia', 'nesiprausia'],
    ['prausė', 'nesiprausė'],
    ['prausk', 'nesiprausk'],
    ['prausdavo', 'nesiprausdavo'],
    ['praustis', 'nesiprausti'],
  ])('negated, -si- moves in after ne-: %s → %s', (form, negated) => {
    expect(verbWord(form, true, true)).toBe(negated);
  });

  test('the reflexive infinitive keeps its stored -tis; an empty form stays empty', () => {
    expect(verbWord('praustis', false, true)).toBe('praustis');
    expect(verbWord('', true)).toBe('');
  });
});
