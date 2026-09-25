import { describe, expect, test } from 'vitest';
import type { LanguageCode, ReadyLanguageCode } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// P09-E24's places and things (docs/localization/done/B78): CITY, ROOM, OFFICE, DOOR, CAR, AREA,
// CENTER, SIDE and LINE_MARK. LINE_MARK's gloss stands on B87's LONG and its French longue.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

const seed = (id: string) => concepts.find((c) => c.id === id);

describe('the glosses, in every language', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    // A `many` subject inside a locative relative, on HOME's LIVE.
    ['CITY', {
      en: 'a big place where many people live.', it: 'un grande luogo dove molte persone abitano.',
      fr: 'un grand lieu où beaucoup de personnes habitent.', de: 'ein großer Ort, an dem viele Personen wohnen.',
      es: 'un lugar grande donde muchas personas viven.', ja: '多くの人が住む大きい場所。', pt: 'um lugar grande onde muitas pessoas moram.',
    }],
    ['ROOM', {
      en: 'a part of a building.', it: 'una parte di un edificio.', fr: "une partie d'un bâtiment.", de: 'ein Teil eines Gebäudes.',
      es: 'una parte de un edificio.', ja: '建物の部分。', pt: 'uma parte de um edifício.',
    }],
    // On ROOM, which this batch seeds: a building where one works is a factory too.
    ['OFFICE', {
      en: 'a room where one works.', it: 'una stanza dove si lavora.', fr: "une pièce où l'on travaille.", de: 'ein Zimmer, in dem man arbeitet.',
      es: 'una habitación donde se trabaja.', ja: '働く部屋。', pt: 'um cômodo onde se trabalha.',
    }],
    // The part-whole genitive carrying an object-gap relative.
    ['DOOR', {
      en: 'a part of a wall that one opens.', it: 'una parte di un muro che si apre.', fr: "une partie d'un mur qu'on ouvre.",
      de: 'ein Teil einer Wand, den man öffnet.', es: 'una parte de una pared que se abre.', ja: '開く壁の部分。',
      pt: 'uma parte de uma parede que se abre.',
    }],
    // The instrument gap, with a goal so German does not say "walks with".
    ['CAR', {
      en: 'an object with which one goes to a place.', it: 'un oggetto con il quale si va a un luogo.', fr: 'un objet avec lequel on va à un lieu.',
      de: 'ein Gegenstand, mit dem man zu einem Ort geht.', es: 'un objeto con el que se va a un lugar.', ja: '場所へ行く物体。',
      pt: 'um objeto com o qual se vai a um lugar.',
    }],
    ['AREA', {
      en: 'a part of a place.', it: 'una parte di un luogo.', fr: "une partie d'un lieu.", de: 'ein Teil eines Ortes.', es: 'una parte de un lugar.',
      ja: '場所の部分。', pt: 'uma parte de um lugar.',
    }],
    // A genitive and a negated copular relative on one head; the predicate CENTER is definite.
    ['SIDE', {
      en: 'a part of an object that is not the center.', it: 'una parte di un oggetto che non è il centro.',
      fr: "une partie d'un objet qui n'est pas le centre.", de: 'ein Teil eines Gegenstands, der nicht die Mitte ist.',
      es: 'una parte de un objeto que no es el centro.', ja: '中心ではない物体の部分。', pt: 'uma parte de um objeto que não é o centro.',
    }],
    // B87's LONG, with the French feminine longue.
    ['LINE_MARK', {
      en: 'a long shape.', it: 'una forma lunga.', fr: 'une forme longue.', de: 'eine lange Form.', es: 'una forma larga.', ja: '長い形。',
      pt: 'uma forma longa.',
    }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  // A center is defined by its distance from the edges, and neither EDGE nor MIDDLE is seeded.
  test('CENTER stays on the literal', () => {
    expect(seed('CENTER')?.definition).toBeUndefined();
  });

  test('the words that share an English word or a sense say which', () => {
    expect(['CENTER', 'LINE_MARK'].map((id) => seed(id)?.synonym)).toEqual(['middle', 'stroke']);
    expect(['CITY', 'ROOM', 'OFFICE', 'AREA', 'SIDE', 'LINE_MARK', 'CAR'].map((id) => seed(id)?.isA))
      .toEqual(['PLACE', 'PLACE', 'ROOM', 'PLACE', 'PART', 'SHAPE', 'OBJECT_THING']);
  });
});

describe('the nouns: a singular, a plural and the gender', () => {
  test.each<[string, Record<ReadyLanguageCode, string>, Record<ReadyLanguageCode, string>]>([
    // Italian città is invariable; German Stadt umlauts.
    ['CITY',
      { en: 'a big city.', it: 'una grande città.', fr: 'une grande ville.', de: 'eine große Stadt.', es: 'una ciudad grande.', ja: '大きい都市。',
        pt: 'uma cidade grande.' },
      { en: 'the cities.', it: 'le città.', fr: 'les villes.', de: 'die Städte.', es: 'las ciudades.', ja: '都市。', pt: 'as cidades.' }],
    // German Zimmer is the same in the plural.
    ['ROOM',
      { en: 'a big room.', it: 'una grande stanza.', fr: 'une grande pièce.', de: 'ein großes Zimmer.', es: 'una habitación grande.', ja: '大きい部屋。',
        pt: 'um cômodo grande.' },
      { en: 'the rooms.', it: 'le stanze.', fr: 'les pièces.', de: 'die Zimmer.', es: 'las habitaciones.', ja: '部屋。', pt: 'os cômodos.' }],
    // French bureaux, Italian uffici.
    ['OFFICE',
      { en: 'a big office.', it: 'un grande ufficio.', fr: 'un grand bureau.', de: 'ein großes Büro.', es: 'una oficina grande.', ja: '大きい事務所。',
        pt: 'um escritório grande.' },
      { en: 'the offices.', it: 'gli uffici.', fr: 'les bureaux.', de: 'die Büros.', es: 'las oficinas.', ja: '事務所。', pt: 'os escritórios.' }],
    ['DOOR',
      { en: 'a big door.', it: 'una grande porta.', fr: 'une grande porte.', de: 'eine große Tür.', es: 'una puerta grande.', ja: '大きいドア。',
        pt: 'uma porta grande.' },
      { en: 'the doors.', it: 'le porte.', fr: 'les portes.', de: 'die Türen.', es: 'las puertas.', ja: 'ドア。', pt: 'as portas.' }],
    ['CAR',
      { en: 'a big car.', it: 'una grande macchina.', fr: 'une grande voiture.', de: 'ein großes Auto.', es: 'un coche grande.', ja: '大きい車。',
        pt: 'um carro grande.' },
      { en: 'the cars.', it: 'le macchine.', fr: 'les voitures.', de: 'die Autos.', es: 'los coches.', ja: '車。', pt: 'os carros.' }],
    ['AREA',
      { en: 'a big area.', it: 'una grande zona.', fr: 'une grande zone.', de: 'ein großes Gebiet.', es: 'una zona grande.', ja: '大きい地域。',
        pt: 'uma área grande.' },
      { en: 'the areas.', it: 'le zone.', fr: 'les zones.', de: 'die Gebiete.', es: 'las zonas.', ja: '地域。', pt: 'as áreas.' }],
    ['CENTER',
      { en: 'a big center.', it: 'un grande centro.', fr: 'un grand centre.', de: 'eine große Mitte.', es: 'un centro grande.', ja: '大きい中心。',
        pt: 'um centro grande.' },
      { en: 'the centers.', it: 'i centri.', fr: 'les centres.', de: 'die Mitten.', es: 'los centros.', ja: '中心。', pt: 'os centros.' }],
    // Japanese 側面, the free noun.
    ['SIDE',
      { en: 'a big side.', it: 'un grande lato.', fr: 'un grand côté.', de: 'eine große Seite.', es: 'un lado grande.', ja: '大きい側面。',
        pt: 'um lado grande.' },
      { en: 'the sides.', it: 'i lati.', fr: 'les côtés.', de: 'die Seiten.', es: 'los lados.', ja: '側面。', pt: 'os lados.' }],
    ['LINE_MARK',
      { en: 'a big line.', it: 'una grande linea.', fr: 'une grande ligne.', de: 'eine große Linie.', es: 'una línea grande.', ja: '大きい線。',
        pt: 'uma linha grande.' },
      { en: 'the lines.', it: 'le linee.', fr: 'les lignes.', de: 'die Linien.', es: 'las líneas.', ja: '線。', pt: 'as linhas.' }],
  ])('%s', (id, singular, plural) => {
    expect(sayAll({ subject: np(id, { definiteness: 'indefinite', adjectives: ['BIG'] }) })).toEqual(singular);
    expect(sayAll({ subject: np(id, { definiteness: 'definite', number: 'plural' }) })).toEqual(plural);
  });

  test('LINE_MARK is not LINE: Italian, German and Japanese split them', () => {
    const the = (id: string) => sayAll({ subject: np(id, { definiteness: 'definite' }) });
    expect(the('LINE_MARK')).toMatchObject({ it: 'la linea.', de: 'die Linie.', ja: '線。' });
    expect(the('LINE')).toMatchObject({ it: 'la riga.', de: 'die Zeile.', ja: '行。' });
  });
});
