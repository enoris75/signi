import { describe, expect, test } from 'vitest';
import { ALLER, CHAT, EFFONDRER, FEMME, HABITER, JE, LIVRE, MANGER, SOURIS, TU } from './fr.fixtures.js';
import { aspectVerbFr } from './aspectVerbFr.js';

describe('aspectVerbFr', () => {
  test('the progressive is être + en train de + the infinitive, de eliding before a vowel', () => {
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'progressive')).toEqual({ finite: 'est', tail: 'en train de manger' });
    expect(aspectVerbFr(ALLER, { ...CHAT, number: 'plural' }, 'past', 'progressive')).toEqual({ finite: 'étaient', tail: "en train d'aller" });
  });

  test('the prospective is être + sur le point de + the infinitive', () => {
    expect(aspectVerbFr(MANGER, JE, 'future', 'prospective')).toEqual({ finite: 'serai', tail: 'sur le point de manger' });
    expect(aspectVerbFr(ALLER, TU, 'present', 'prospective')).toEqual({ finite: 'es', tail: "sur le point d'aller" });
  });

  // A227: an h muet is a vowel sound, and the verb's lexeme says which h is one.
  test('de elides before a verb on an h muet, not before an h aspiré', () => {
    expect(aspectVerbFr(HABITER, JE, 'present', 'prospective')).toEqual({ finite: 'suis', tail: "sur le point d'habiter" });
    expect(aspectVerbFr(HABITER, CHAT, 'present', 'progressive')).toEqual({ finite: 'est', tail: "en train d'habiter" });
    expect(aspectVerbFr({ base: 'hurler' }, CHAT, 'present', 'progressive')).toEqual({ finite: 'est', tail: 'en train de hurler' });
  });

  test('the resultative takes avoir by default, its participle not agreeing with the subject', () => {
    expect(aspectVerbFr(MANGER, FEMME, 'present', 'resultative')).toEqual({ finite: 'a', tail: 'mangé' });
    expect(aspectVerbFr(MANGER, { ...JE, number: 'plural' }, 'past', 'resultative')).toEqual({ finite: 'avions', tail: 'mangé' });
    expect(aspectVerbFr(MANGER, CHAT, 'future', 'resultative')).toEqual({ finite: 'aura', tail: 'mangé' });
  });

  test('an être-selecting verb agrees its participle with the subject', () => {
    expect(aspectVerbFr(ALLER, CHAT, 'present', 'resultative')).toEqual({ finite: 'est', tail: 'allé' });
    expect(aspectVerbFr(ALLER, FEMME, 'present', 'resultative')).toEqual({ finite: 'est', tail: 'allée' });
    expect(aspectVerbFr(ALLER, { ...FEMME, number: 'plural' }, 'past', 'resultative')).toEqual({ finite: 'étaient', tail: 'allées' });
    expect(aspectVerbFr(ALLER, { ...JE, number: 'plural' }, 'present', 'resultative')).toEqual({ finite: 'sommes', tail: 'allés' });
  });

  // The participle drops the reflexive clitic the finite forms carry, so the auxiliary restores it.
  test('a reflexive verb restores its clitic before the auxiliary, eliding before a vowel', () => {
    expect(aspectVerbFr(EFFONDRER, FEMME, 'present', 'resultative')).toEqual({ finite: "s'est", tail: 'effondrée' });
    expect(aspectVerbFr(EFFONDRER, JE, 'present', 'resultative')).toEqual({ finite: 'me suis', tail: 'effondré' });
    expect(aspectVerbFr(EFFONDRER, TU, 'present', 'resultative')).toEqual({ finite: "t'es", tail: 'effondré' });
    expect(aspectVerbFr(EFFONDRER, { ...JE, number: 'plural' }, 'present', 'resultative')).toEqual({ finite: 'nous sommes', tail: 'effondrés' });
  });

  // The accord du COD antéposé: "la souris que le chat a mangée".
  test('a preceding direct object agrees an avoir participle', () => {
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'resultative', undefined, SOURIS)).toEqual({ finite: 'a', tail: 'mangée' });
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'resultative', undefined, { ...LIVRE, number: 'plural' })).toEqual({ finite: 'a', tail: 'mangés' });
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'resultative', undefined, LIVRE)).toEqual({ finite: 'a', tail: 'mangé' });
  });

  test('under a hypothetical the auxiliary takes the conditional or the imparfait', () => {
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'resultative', 'conditional')).toEqual({ finite: 'aurait', tail: 'mangé' });
    expect(aspectVerbFr(ALLER, FEMME, 'present', 'resultative', 'conditional')).toEqual({ finite: 'serait', tail: 'allée' });
    expect(aspectVerbFr(MANGER, { ...CHAT, number: 'plural' }, 'present', 'progressive', 'conditional'))
      .toEqual({ finite: 'seraient', tail: 'en train de manger' });
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'progressive', 'subjunctive')).toEqual({ finite: 'était', tail: 'en train de manger' });
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'resultative', 'subjunctive')).toEqual({ finite: 'avait', tail: 'mangé' });
  });

  // A88: no clitic climbing — the clitic precedes the progressive / prospective infinitive.
  test('an object clitic goes before the periphrastic infinitive, de eliding against the clitic', () => {
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'progressive', undefined, undefined, 'me')).toEqual({ finite: 'est', tail: 'en train de me manger' });
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'prospective', undefined, undefined, 'nous')).toEqual({ finite: 'est', tail: 'sur le point de nous manger' });
    expect(aspectVerbFr({ base: 'ajouter', participle: 'ajouté' }, CHAT, 'present', 'progressive', undefined, undefined, 'le'))
      .toEqual({ finite: 'est', tail: "en train de l'ajouter" });
  });

  test('the resultative leaves the clitic to the caller', () => {
    expect(aspectVerbFr(MANGER, CHAT, 'present', 'resultative', undefined, undefined, 'le')).toEqual({ finite: 'a', tail: 'mangé' });
  });

  // A96: the progressive / prospective infinitive of a reflexive verb agrees its clitic.
  test('a reflexive periphrastic infinitive agrees its clitic with the subject', () => {
    expect(aspectVerbFr(EFFONDRER, JE, 'present', 'progressive')).toEqual({ finite: 'suis', tail: "en train de m'effondrer" });
    expect(aspectVerbFr(EFFONDRER, { ...JE, number: 'plural' }, 'present', 'prospective')).toEqual({ finite: 'sommes', tail: 'sur le point de nous effondrer' });
    expect(aspectVerbFr(EFFONDRER, CHAT, 'present', 'progressive')).toEqual({ finite: 'est', tail: "en train de s'effondrer" });
  });

  // localization B86: se rappeler's se is the indirect object, so its être participle agrees as an
  // avoir one does — never with the subject, and with a preceding direct object.
  test('an indirect pronominal verb does not agree its participle with the subject', () => {
    const RAPPELER = { base: 'se rappeler', reflexive_indirect: '1', participle: 'rappelé', aux: 'be', '3sg_present': 'se rappelle' };
    expect(aspectVerbFr(RAPPELER, FEMME, 'present', 'resultative')).toEqual({ finite: "s'est", tail: 'rappelé' });
    expect(aspectVerbFr(RAPPELER, FEMME, 'present', 'resultative', undefined, SOURIS)).toEqual({ finite: "s'est", tail: 'rappelée' });
  });
});
