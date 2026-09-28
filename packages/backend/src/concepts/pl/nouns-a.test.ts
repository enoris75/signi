import { describe, expect, test } from 'vitest';
import { nouns } from '../nouns.js';
import { PL_NOUNS_A } from './nouns-a.js';

// P05-E4: the first third of the Polish nouns. Every form is (verify) until the native review
// (P05-E11); this pins the shape the engine reads (style-pl.md) and a handful of the alternations
// most easily got wrong.
const IDS = [
  'ANIMAL', 'MAMMAL', 'FELINE', 'CAT', 'DOG', 'BIRD', 'FISH', 'REPTILE', 'AMPHIBIAN', 'INSECT', 'HORSE',
  'PIG', 'SHEEP', 'GOAT', 'RABBIT', 'BEAR', 'LION', 'TIGER', 'LEOPARD', 'PANTHER', 'PUMA', 'CHEETAH',
  'ELEPHANT', 'MONKEY', 'DEER', 'WHALE', 'CHICKEN', 'DUCK', 'EAGLE', 'OWL', 'PENGUIN', 'SHARK', 'SALMON',
  'SNAKE', 'TURTLE', 'CROCODILE', 'LIZARD', 'FROG', 'BEE', 'ANT', 'BUTTERFLY', 'MOSQUITO', 'SPIDER',
  'BOOK', 'AIR', 'GROUND', 'WATER', 'SPEED', 'LIGHT', 'SOUND', 'WAY', 'TIME', 'CARE', 'SIZE', 'HEIGHT',
  'LENGTH', 'QUALITY', 'STRENGTH', 'AGE', 'TEMPERATURE', 'DISTANCE', 'SHAPE', 'CIRCLE', 'LINE_MARK',
  'MONEY', 'FOOD', 'ICE_CREAM', 'SUGAR', 'LIQUID', 'CONTENT', 'PLACE', 'POINT_NOUN', 'AREA', 'CENTER',
  'SIDE', 'DESTINATION', 'ORIGIN', 'PATH', 'DIRECTION_SPACE', 'BUILDING', 'WALL', 'HOUSE', 'HOME', 'ROOM',
  'OFFICE', 'DOOR', 'CAR', 'CHILD', 'KID', 'PERSON', 'SPEAKER', 'COMPANION', 'RECIPIENT', 'FOX', 'BOY',
  'GIRL', 'MAN', 'GUY', 'WOMAN', 'WOLF', 'BOVINE', 'COW', 'OX', 'BUTCHER', 'ANGEL', 'LIFE', 'END',
  'BEGINNING', 'DEATH', 'FEELING', 'AFFECTION', 'MOUSE', 'FLY_INSECT', 'STICK', 'ARROW_PROJECTILE',
  'BLADE', 'FIRE', 'FLAME', 'PARENT', 'FATHER', 'RELATIVE', 'FAMILY', 'MOTHER', 'CHILD_OFFSPRING', 'SON',
  'DAUGHTER', 'SIBLING', 'BROTHER', 'SISTER', 'SPOUSE', 'HUSBAND', 'WIFE', 'GRANDPARENT', 'GRANDFATHER',
  'GRANDMOTHER', 'GRANDCHILD', 'GRANDSON', 'GRANDDAUGHTER', 'UNCLE', 'AUNT', 'COUSIN', 'NEPHEW', 'NIECE',
  'MOTHER_IN_LAW', 'FATHER_IN_LAW', 'SON_IN_LAW', 'DAUGHTER_IN_LAW',
];

const SG = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg'];
const PL = ['plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'];
const FEM = ['fem', ...SG.slice(1).map((k) => `fem_${k}`), ...PL.map((k) => `fem_${k}`)];

describe('the Polish nouns, part A (P05-E4)', () => {
  const seed = new Map(nouns.map((c) => [c.id, c]));
  const entries = Object.entries(PL_NOUNS_A);

  test('has an entry for every id of the part, and nothing else', () => {
    expect(IDS).toHaveLength(147);
    expect(Object.keys(PL_NOUNS_A).sort()).toEqual([...IDS].sort());
  });

  test('keys only seeded nouns', () => {
    const bad = entries.filter(([id]) => seed.get(id)?.role !== 'noun').map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test('stores all seven singular cases and the agreement gender of every noun', () => {
    const bad = entries.flatMap(([id, e]) => [
      ...SG.filter((k) => !e[k]).map((k) => `${id}.${k}`),
      ...(['masc', 'fem', 'neut'].includes(e['gender']!) ? [] : [`${id}.gender`]),
      ...(e['count'] === 'singular' ? [] : [`${id}.count`]),
    ]);
    expect(bad).toEqual([]);
  });

  test('stores the six plural cases wherever the Spanish entry counts, and none on a mass noun', () => {
    const bad = entries.flatMap(([id, e]) => {
      const counts = seed.get(id)!.forms['es']?.['plural'] !== undefined || e['plurale_tantum'] === '1';
      return counts
        ? PL.filter((k) => !e[k]).map((k) => `${id}.${k}`)
        : PL.filter((k) => e[k]).map((k) => `${id}.${k} (mass)`);
    });
    expect(bad).toEqual([]);
  });

  test('carries a whole feminine paradigm wherever Spanish has a feminine, and only there', () => {
    const bad = entries.flatMap(([id, e]) => {
      const hasFem = seed.get(id)!.forms['es']?.['fem'] !== undefined;
      return hasFem
        ? FEM.filter((k) => !e[k]).map((k) => `${id}.${k}`)
        : FEM.filter((k) => e[k]).map((k) => `${id}.${k} (no Spanish fem)`);
    });
    expect(bad).toEqual([]);
  });

  // A plurale tantum (*drzwi*) is exempt: its "singular" cells are its plural's.
  test('marks animate_acc exactly on the masculines whose accusative is their genitive', () => {
    const bad = entries
      .filter(([, e]) => e['plurale_tantum'] !== '1')
      .filter(([, e]) => (e['animate_acc'] === '1') !== (e['gender'] === 'masc' && e['acc_sg'] === e['gen_sg']))
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test('marks virile only on masculines, and gives each a virile accusative plural (= genitive)', () => {
    const bad = entries
      .filter(([, e]) => e['virile'] === '1')
      .filter(([, e]) => e['gender'] !== 'masc' || e['acc_pl'] !== e['gen_pl'])
      .map(([id]) => id);
    expect(bad).toEqual([]);
  });

  test.each([
    ['DOG', 'gen_sg', 'psa'],
    ['CAT', 'loc_sg', 'kocie'],
    ['LION', 'plural', 'lwy'],
    ['EAGLE', 'loc_sg', 'orle'],
    ['OX', 'gen_sg', 'wołu'],
    ['HORSE', 'ins_pl', 'końmi'],
    ['CHILD', 'ins_pl', 'dziećmi'],
    ['BOY', 'voc_sg', 'chłopcze'],
    ['BOY', 'plural', 'chłopcy'],
    ['FATHER', 'plural', 'ojcowie'],
    ['BROTHER', 'ins_pl', 'braćmi'],
    ['SISTER', 'gen_pl', 'sióstr'],
    ['BOOK', 'gen_pl', 'książek'],
    ['MOTHER', 'dat_sg', 'matce'],
    ['MAN', 'plural', 'mężczyźni'],
    ['MAN', 'acc_sg', 'mężczyznę'],
    ['LIGHT', 'loc_sg', 'świetle'],
    ['GOAT', 'gen_pl', 'kóz'],
    ['MONEY', 'gen_pl', 'pieniędzy'],
    ['DOG', 'fem_dat_sg', 'suce'],
  ])('%s.%s is %s', (id, key, form) => {
    expect(PL_NOUNS_A[id]![key]).toBe(form);
  });
});
