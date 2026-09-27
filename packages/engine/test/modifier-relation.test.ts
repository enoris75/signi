import { describe, expect, test } from 'vitest';
import type { ReadyLanguageCode } from '@signi/shared';
import { compileDefinition, definitionVocabulary } from '@signi/phrase';
import { sayAll } from './harness.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { seedConcept } from '../../backend/src/concepts/definitionText.js';
import { conceptIndex } from '../../backend/src/concepts/hierarchy.js';

// The noun modifier's relation when nobody sets one (P14, P16). The engine never sees "unset" — the
// phrase package resolves it into the plan — so each row is a console line with a bare modifier,
// applied against the seeded concepts (their `modifierRelation`, `modifierRelationByHead` and
// `classes`, as the API serves them) and planned by the canvas's own `selectionToPlan`.

const byId = conceptIndex(concepts);
const VOCAB = definitionVocabulary(concepts.map((c) => seedConcept(c, byId)));
const said = (line: string) => sayAll(compileDefinition(line, VOCAB));
const romance = (line: string) => {
  const { it, fr, es, pt } = said(line);
  return { it, fr, es, pt };
};

describe("a noun modifier takes its word's own relation (P14)", () => {
  test('"time flies" is the flies of time, and the other three languages neutralise it', () => {
    expect(said('/subj ( FLY_INSECT /pl /zero /adj TIME ) /verb ( LIKE ) /obj ( ARROW_PROJECTILE /a )')).toMatchObject({
      it: 'alle mosche del tempo piace una freccia.',
      fr: 'les mouches du temps aiment une flèche.',
      es: 'a las moscas del tiempo les gusta una flecha.',
      pt: 'as moscas do tempo gostam de uma flecha.',
    });
    expect(said('/subj ( FLY_INSECT /pl /zero /adj TIME ) /verb ( BURN )')).toMatchObject<Partial<Record<ReadyLanguageCode, string>>>({
      en: 'time flies burn.',
      de: 'Zeitfliegen brennen.',
      ja: '時間のハエは燃えます。',
    });
  });

  test('an explicit feature still renders it', () => {
    expect(romance('/subj ( FLY_INSECT /adj ( TIME /feature ) ) /verb ( BURN )')).toEqual({
      it: 'la mosca a tempo brucia.',
      fr: 'la mouche à temps brûle.',
      es: 'la mosca de tiempo arde.',
      pt: 'a mosca a tempo arde.',
    });
  });

  test('wood and water are what the head is made of or holds', () => {
    expect(romance('/subj ( HOUSE /adj WOOD ) /verb ( BURN )')).toEqual({
      it: 'la casa di legno brucia.',
      fr: 'la maison de bois brûle.',
      es: 'la casa de madera arde.',
      pt: 'a casa de madeira arde.',
    });
    expect(romance('/subj ( CONTAINER /adj WATER ) /verb ( BURN )')).toEqual({
      it: 'il contenitore di acqua brucia.',
      fr: "le récipient d'eau brûle.",
      es: 'el recipiente de agua arde.',
      pt: 'o recipiente de água arde.',
    });
  });

  test('a noun with no relation of its own is the feature', () => {
    expect(romance('/subj ( HOUSE /adj STICK ) /verb ( BURN )')).toMatchObject({ it: 'la casa a bastone brucia.' });
  });
});

describe("…or the pair's, by the head's class (P16)", () => {
  test('under a DEVICE time is the feature: "la bomba a tempo"', () => {
    // fr "bombe à retardement" and pt "bomba-relógio" are idioms, compounds that are not a relation
    // (P14's out of scope): the literal each renders is left unpinned until a native reviewer rules.
    expect(said('/subj ( BOMB /adj TIME ) /verb ( BURN )')).toMatchObject({
      en: 'the time bomb burns.',
      it: 'la bomba a tempo brucia.',
      de: 'die Zeitbombe brennt.',
      es: 'la bomba de tiempo arde.',
    });
  });

  test('under an EVENT time is the feature too: "la corsa a tempo"', () => {
    expect(said('/subj ( RACE /adj TIME ) /verb ( BURN )')).toMatchObject({ it: 'la corsa a tempo brucia.' });
  });

  test('under a QUANTITY time is the material: "l\'unità di tempo"', () => {
    expect(romance('/subj ( UNIT /adj TIME ) /verb ( BURN )')).toEqual({
      it: "l'unità di tempo brucia.",
      fr: "l'unité de temps brûle.",
      es: 'la unidad de tiempo arde.',
      pt: 'a unidade de tempo arde.',
    });
  });

  test('the head itself is read, not only a word under it: a DEVICE is one', () => {
    expect(romance('/subj ( DEVICE /adj TIME ) /verb ( BURN )')).toMatchObject({ it: 'il dispositivo a tempo brucia.' });
  });
});

describe('the Italian feature takes the euphonic d before an a (A312)', () => {
  test('"la casa ad acqua", where another vowel keeps a bare a', () => {
    expect(said('/subj ( HOUSE /adj ( WATER /feature ) ) /verb ( BURN )').it).toBe('la casa ad acqua brucia.');
    expect(said('/subj ( HOUSE /adj ( LIGHT /feature ) ) /verb ( BURN )').it).toBe('la casa a luce brucia.');
  });
});
