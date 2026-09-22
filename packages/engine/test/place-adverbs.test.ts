import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C25: the place and direction adverbs, and the construct they are glossed with — a
// verbless subject rendered as the locative or direction complement it names
// (`NounPhrase.complementGloss`), through the renderer a clause's complements take. Also the two
// words the BACKWARDS gloss stands on, DIRECTION_SPACE and OPPOSITE.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

/** A verbless period whose subject is the `type` complement it names. */
const gloss = (type: 'locative' | 'direction', phrase: NounPhrase, specifiers?: NonNullable<NounPhrase['complementGloss']>['specifiers']): PhrasePlan => ({
  subject: { ...phrase, complementGloss: { type, ...(specifiers ? { specifiers } : {}) } },
});

/** A rendering with its full stop taken off, to find it inside a longer one. */
const bare = (text: string): string => text.replace(/[.。]$/, '');

describe('the place and direction adverbs are glossed in every language', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // The place something happens in: a locative, with its default relation.
    ['EVERYWHERE', { en: 'in all places.', it: 'in tutti i luoghi.', fr: 'dans tous les lieux.', de: 'an allen Orten.', es: 'en todos los lugares.', ja: 'すべての場所で。', pt: 'em todos os lugares.' }],
    ['TOGETHER', { en: 'in a group.', it: 'in un gruppo.', fr: 'dans un groupe.', de: 'in einer Gruppe.', es: 'en un grupo.', ja: 'グループで。', pt: 'em um grupo.' }],
    // The plain goal, compared: "a higher place" says upward, where "a high place" would be a
    // destination on a mountain.
    ['UP', { en: 'to a higher place.', it: 'a un luogo più alto.', fr: 'à un lieu plus haut.', de: 'zu einem höheren Ort.', es: 'a un lugar más alto.', ja: 'もっと高い場所へ。', pt: 'a um lugar mais alto.' }],
    ['DOWN', { en: 'to a lower place.', it: 'a un luogo più basso.', fr: 'à un lieu plus bas.', de: 'zu einem niedrigeren Ort.', es: 'a un lugar más bajo.', ja: 'もっと低い場所へ。', pt: 'a um lugar mais baixo.' }],
    // A direction, not a goal: the locative of the way a thing moves.
    ['BACKWARDS', { en: 'in the opposite direction.', it: 'nella direzione opposta.', fr: 'dans la direction opposée.', de: 'in der entgegengesetzten Richtung.', es: 'en la dirección opuesta.', ja: '反対の方向で。', pt: 'na direção oposta.' }],
    // Not a place at all: the `mode` manner gloss WELL is glossed with.
    ['SUDDENLY', { en: 'in an unexpected way.', it: 'in un modo inatteso.', fr: "d'une manière inattendue.", de: 'auf eine unerwartete Weise.', es: 'de una manera inesperada.', ja: '予期しない方法で。', pt: 'de uma maneira inesperada.' }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  // LEFT and RIGHT stay on the literal by design: nothing in the corpus tells them apart without
  // saying "left" or "right" (docs/localization/done/C25-place-and-direction-adverbs.md).
  test('LEFT and RIGHT have no gloss', () => {
    for (const id of ['LEFT', 'RIGHT']) expect(concepts.find((c) => c.id === id)?.definition).toBeUndefined();
  });
});

describe('a complement gloss is what the clause says after its verb', () => {
  test.each<[string, 'locative' | 'direction', string, NounPhrase]>([
    ['EVERYWHERE', 'locative', 'EAT', np('PLACE', { definiteness: 'all', number: 'plural' })],
    ['TOGETHER', 'locative', 'EAT', np('GROUP', { definiteness: 'indefinite' })],
    ['UP', 'direction', 'GO', np('PLACE', { definiteness: 'indefinite', adjectives: ['HIGH'], adjectiveDegrees: ['more'] })],
    ['BACKWARDS', 'locative', 'RUN', np('DIRECTION_SPACE', { definiteness: 'definite', adjectives: ['OPPOSITE'] })],
  ])('%s: the %s of "the cat %s …"', (_id, type, verb, phrase) => {
    const fragment = sayAll(gloss(type, phrase));
    const sentence = sayAll(clause(np('CAT'), verb, { complements: { [type]: { phrase } } }));
    for (const lang of Object.keys(LANGUAGES) as LanguageCode[]) expect(sentence[lang]).toContain(bare(fragment[lang]));
  });

  test('a hearth noun takes its locative idiom, as the complement does', () => {
    expect(sayAll(gloss('locative', np('HOME')))).toEqual({
      en: 'at home.', it: 'a casa.', fr: 'à la maison.', de: 'zu Hause.', es: 'en casa.', ja: '家で。', pt: 'em casa.',
    });
  });

  test('the complement\'s specifiers ride through the plan', () => {
    expect(sayAll(gloss('locative', np('PLACE', { definiteness: 'all', number: 'plural' }), [{ kind: 'path', value: 'under' }]))).toEqual({
      en: 'under all places.', it: 'sotto tutti i luoghi.', fr: 'sous tous les lieux.', de: 'unter allen Orten.',
      es: 'debajo de todos los lugares.', ja: 'すべての場所の下で。', pt: 'debaixo de todos os lugares.',
    });
    // A direction's relation is its goal form: English "into", the German accusative, Japanese の中へ.
    expect(sayAll(gloss('direction', np('GROUP', { definiteness: 'indefinite' }), [{ kind: 'path', value: 'in' }]))).toEqual({
      en: 'into a group.', it: 'in un gruppo.', fr: 'dans un groupe.', de: 'in eine Gruppe.',
      es: 'en un grupo.', ja: 'グループの中へ。', pt: 'em um grupo.',
    });
  });

  test('the flag is ignored under a verb: the subject is a subject', () => {
    expect(sayAll(clause(np('CAT', { complementGloss: { type: 'locative' } }), 'EAT'))).toEqual(sayAll(clause(np('CAT'), 'EAT')));
  });
});

describe('the words the BACKWARDS gloss stands on', () => {
  test('DIRECTION_SPACE: a feminine noun in every gendered language, singular and plural', () => {
    expect(sayAll({ subject: np('DIRECTION_SPACE') })).toEqual({
      en: 'the direction.', it: 'la direzione.', fr: 'la direction.', de: 'die Richtung.', es: 'la dirección.', ja: '方向。', pt: 'a direção.',
    });
    expect(sayAll({ subject: np('DIRECTION_SPACE', { number: 'plural' }) })).toEqual({
      en: 'the directions.', it: 'le direzioni.', fr: 'les directions.', de: 'die Richtungen.', es: 'las direcciones.', ja: '方向。', pt: 'as direções.',
    });
  });

  test('OPPOSITE agrees after its noun in Romance and declines before it in German', () => {
    expect(sayAll({ subject: np('DIRECTION_SPACE', { number: 'plural', adjectives: ['OPPOSITE'] }) })).toEqual({
      en: 'the opposite directions.', it: 'le direzioni opposte.', fr: 'les directions opposées.', de: 'die entgegengesetzten Richtungen.',
      es: 'las direcciones opuestas.', ja: '反対の方向。', pt: 'as direções opostas.',
    });
    expect(sayAll(clause(np('CAT', { adjectives: ['OPPOSITE'] }), 'EAT'))).toEqual({
      en: 'the opposite cat eats.', it: 'il gatto opposto mangia.', fr: 'le chat opposé mange.', de: 'der entgegengesetzte Kater frisst.',
      es: 'el gato opuesto come.', ja: '反対の猫は食べます。', pt: 'o gato oposto come.',
    });
  });
});
