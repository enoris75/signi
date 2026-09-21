import { describe, expect, test } from 'vitest';
import { ESSEN, type Forms, GEBEN, GEHEN, HINZUFUEGEN, WAEHLEN } from './de.fixtures.js';
import { deImperativeWord } from './deImperativeWord.js';

const LAUFEN: Forms = { base: 'laufen', '2sg_present': 'läufst', '2pl_present': 'lauft' };
const du = (base: string) => deImperativeWord({ base }, '2sg');

describe('deImperativeWord', () => {
  test('du is the bare infinitive stem', () => {
    expect(deImperativeWord(GEHEN, '2sg')).toBe('geh');
    expect(deImperativeWord(LAUFEN, '2sg')).toBe('lauf');
    expect(du('konsumieren')).toBe('konsumier');
    expect(du('löschen')).toBe('lösch');
  });

  test('a stem in -d or -t keeps the du -e', () => {
    expect(du('schneiden')).toBe('schneide');
    expect(du('laden')).toBe('lade');
    expect(du('werden')).toBe('werde');
    expect(du('töten')).toBe('töte');
    expect(du('verdichten')).toBe('verdichte');
  });

  test('a consonant + m/n keeps the du -e, unless that consonant is l, r, m, n or a lengthening h', () => {
    expect(du('ordnen')).toBe('ordne');
    expect(du('atmen')).toBe('atme');
    expect(du('rechnen')).toBe('rechne');
    expect(du('kommen')).toBe('komm');
    expect(du('beginnen')).toBe('beginn');
    expect(du('lernen')).toBe('lern');
    expect(du('filmen')).toBe('film');
    expect(du('wohnen')).toBe('wohn');
    expect(du('weinen')).toBe('wein');
  });

  test('-ern keeps the du -e, and -eln also drops the stem\'s own e', () => {
    expect(du('erweitern')).toBe('erweitere');
    expect(du('speichern')).toBe('speichere');
    expect(du('vermitteln')).toBe('vermittle');
    expect(du('sammeln')).toBe('sammle');
  });

  test('the 2sg-present vowel change never carries over to the rule', () => {
    expect(deImperativeWord(LAUFEN, '2sg')).toBe('lauf'); // läufst
    expect(deImperativeWord({ base: 'schlagen', '2sg_present': 'schlägst' }, '2sg')).toBe('schlag');
    expect(deImperativeWord({ base: 'enthalten', '2sg_present': 'enthältst' }, '2sg')).toBe('enthalte');
  });

  test('ihr is the stored 2pl present, else the stem + -t', () => {
    expect(deImperativeWord(GEHEN, '2pl')).toBe('geht');
    expect(deImperativeWord(WAEHLEN, '2pl')).toBe('wählt');
  });

  test('the wir cohortative is the infinitive with an inverted wir', () => {
    expect(deImperativeWord(GEHEN, '1pl')).toBe('gehen wir');
  });

  test('a stored du form wins over the rule; ihr and wir stay regular', () => {
    expect(deImperativeWord(ESSEN, '2sg')).toBe('iss');
    expect(deImperativeWord(ESSEN, '2pl')).toBe('esst');
    expect(deImperativeWord(ESSEN, '1pl')).toBe('essen wir');
    expect(deImperativeWord(GEBEN, '2sg')).toBe('gib');
    expect(deImperativeWord(GEBEN, '2pl')).toBe('gebt');
  });

  test('a stored du form can keep the optional -e the rule leaves off', () => {
    expect(deImperativeWord({ base: 'addieren', '2sg_imperative': 'addiere' }, '2sg')).toBe('addiere');
    expect(deImperativeWord({ base: 'löschen', '2sg_imperative': 'lösche' }, '2sg')).toBe('lösche');
  });

  test('sein is suppletive in every person', () => {
    const sein = { base: 'sein', '2pl_present': 'seid', '2sg_imperative': 'sei', '1pl_imperative': 'seien' };
    expect(deImperativeWord(sein, '2sg')).toBe('sei');
    expect(deImperativeWord(sein, '2pl')).toBe('seid');
    expect(deImperativeWord(sein, '1pl')).toBe('seien wir');
  });

  // A138: the command is the stem verb's; the clause puts the particle last ("füge … hinzu").
  test('a separable verb commands with its stem', () => {
    expect(deImperativeWord(HINZUFUEGEN, '2sg')).toBe('füge');
    expect(deImperativeWord(HINZUFUEGEN, '2pl')).toBe('fügt');
    expect(deImperativeWord(HINZUFUEGEN, '1pl')).toBe('fügen wir');
    expect(deImperativeWord({ base: 'hinzufügen', particle: 'hinzu' }, '2sg')).toBe('füg');
  });

  // B40: a particle written apart leaves no space in front of the stem.
  test('a verb whose particle is written apart commands with its bare stem', () => {
    const undo = { base: 'rückgängig machen', particle: 'rückgängig', '2pl_present': 'macht' };
    expect(deImperativeWord(undo, '2sg')).toBe('mach');
    expect(deImperativeWord(undo, '2pl')).toBe('macht');
    expect(deImperativeWord(undo, '1pl')).toBe('machen wir');
  });
});
