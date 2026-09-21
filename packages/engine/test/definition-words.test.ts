import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase } from '@signi/shared';
import { np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// The words seeded for the concept definitions of localization B33–B39, and the glosses they unlock
// on the noun side. The verb glosses they unlock are pinned beside their genus: BURN in
// genus-verbs.test.ts, COLLAPSE and COME in reflexive.test.ts.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });

describe('the definition words: a singular and a plural in every language', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    // B33. The flame a burning thing gives off.
    ['FLAME',
      { en: 'a flame.', it: 'una fiamma.', fr: 'une flamme.', de: 'eine Flamme.', es: 'una llama.', ja: '炎。', pt: 'uma chama.' },
      { en: 'the flames.', it: 'le fiamme.', fr: 'les flammes.', de: 'die Flammen.', es: 'las llamas.', ja: '炎。', pt: 'as chamas.' }],
    // B34. German Boden umlauts its plural; Portuguese chão takes -s.
    ['GROUND',
      { en: 'a ground.', it: 'un suolo.', fr: 'un sol.', de: 'ein Boden.', es: 'un suelo.', ja: '地面。', pt: 'um chão.' },
      { en: 'the grounds.', it: 'i suoli.', fr: 'les sols.', de: 'die Böden.', es: 'los suelos.', ja: '地面。', pt: 'os chãos.' }],
    // B35. The linguist's term, not the loudspeaker. German Sprecher is the same word in the plural.
    ['SPEAKER',
      { en: 'a speaker.', it: 'un parlante.', fr: 'un locuteur.', de: 'ein Sprecher.', es: 'un hablante.', ja: '話し手。', pt: 'um falante.' },
      { en: 'the speakers.', it: 'i parlanti.', fr: 'les locuteurs.', de: 'die Sprecher.', es: 'los hablantes.', ja: '話し手。', pt: 'os falantes.' }],
    // B36. The countries' genus: French pays is the same word in the plural, German Land umlauts it.
    ['COUNTRY',
      { en: 'a country.', it: 'un paese.', fr: 'un pays.', de: 'ein Land.', es: 'un país.', ja: '国。', pt: 'um país.' },
      { en: 'the countries.', it: 'i paesi.', fr: 'les pays.', de: 'die Länder.', es: 'los países.', ja: '国。', pt: 'os países.' }],
    // B37. The places of a motion and the parties of an action. Italian elides "un'origine"; French
    // parcours is the same word in the plural.
    ['DESTINATION',
      { en: 'a destination.', it: 'una destinazione.', fr: 'une destination.', de: 'ein Ziel.', es: 'un destino.', ja: '目的地。', pt: 'um destino.' },
      { en: 'the destinations.', it: 'le destinazioni.', fr: 'les destinations.', de: 'die Ziele.', es: 'los destinos.', ja: '目的地。', pt: 'os destinos.' }],
    ['ORIGIN',
      { en: 'an origin.', it: "un'origine.", fr: 'une origine.', de: 'ein Ausgangspunkt.', es: 'un origen.', ja: '起点。', pt: 'uma origem.' },
      { en: 'the origins.', it: 'le origini.', fr: 'les origines.', de: 'die Ausgangspunkte.', es: 'los orígenes.', ja: '起点。', pt: 'as origens.' }],
    ['PATH',
      { en: 'a path.', it: 'un percorso.', fr: 'un parcours.', de: 'ein Weg.', es: 'un recorrido.', ja: '経路。', pt: 'um percurso.' },
      { en: 'the paths.', it: 'i percorsi.', fr: 'les parcours.', de: 'die Wege.', es: 'los recorridos.', ja: '経路。', pt: 'os percursos.' }],
    ['COMPANION',
      { en: 'a companion.', it: 'un compagno.', fr: 'un compagnon.', de: 'ein Begleiter.', es: 'un compañero.', ja: '同伴者。', pt: 'um companheiro.' },
      { en: 'the companions.', it: 'i compagni.', fr: 'les compagnons.', de: 'die Begleiter.', es: 'los compañeros.', ja: '同伴者。', pt: 'os companheiros.' }],
    ['RECIPIENT',
      { en: 'a recipient.', it: 'un destinatario.', fr: 'un destinataire.', de: 'ein Empfänger.', es: 'un destinatario.', ja: '受け手。', pt: 'um destinatário.' },
      { en: 'the recipients.', it: 'i destinatari.', fr: 'les destinataires.', de: 'die Empfänger.', es: 'los destinatarios.', ja: '受け手。', pt: 'os destinatários.' }],
    // B39. Italian quantità is invariable.
    ['QUANTITY',
      { en: 'a quantity.', it: 'una quantità.', fr: 'une quantité.', de: 'eine Menge.', es: 'una cantidad.', ja: '数量。', pt: 'uma quantidade.' },
      { en: 'the quantities.', it: 'le quantità.', fr: 'les quantités.', de: 'die Mengen.', es: 'las cantidades.', ja: '数量。', pt: 'as quantidades.' }],
    ['CATEGORY',
      { en: 'a category.', it: 'una categoria.', fr: 'une catégorie.', de: 'eine Kategorie.', es: 'una categoría.', ja: '範疇。', pt: 'uma categoria.' },
      { en: 'the categories.', it: 'le categorie.', fr: 'les catégories.', de: 'die Kategorien.', es: 'las categorías.', ja: '範疇。', pt: 'as categorias.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'indefinite' })).toEqual(singular);
    expect(said(concept, { number: 'plural' })).toEqual(plural);
  });

  // The three person nouns have a feminine: fr locutrice, compagne; de -in; it/es/pt -a. Italian,
  // Spanish and Portuguese parlante / hablante / falante change only the article.
  test.each<[string, Record<LanguageCode, string>, Partial<Record<LanguageCode, string>>]>([
    ['SPEAKER',
      { en: 'a speaker.', it: 'una parlante.', fr: 'une locutrice.', de: 'eine Sprecherin.', es: 'una hablante.', ja: '話し手。', pt: 'uma falante.' },
      { it: 'le parlanti.', fr: 'les locutrices.', de: 'die Sprecherinnen.', es: 'las hablantes.', pt: 'as falantes.' }],
    ['COMPANION',
      { en: 'a companion.', it: 'una compagna.', fr: 'une compagne.', de: 'eine Begleiterin.', es: 'una compañera.', ja: '同伴者。', pt: 'uma companheira.' },
      { it: 'le compagne.', fr: 'les compagnes.', de: 'die Begleiterinnen.', es: 'las compañeras.', pt: 'as companheiras.' }],
    ['RECIPIENT',
      { en: 'a recipient.', it: 'una destinataria.', fr: 'une destinataire.', de: 'eine Empfängerin.', es: 'una destinataria.', ja: '受け手。', pt: 'uma destinatária.' },
      { it: 'le destinatarie.', fr: 'les destinataires.', de: 'die Empfängerinnen.', es: 'las destinatarias.', pt: 'as destinatárias.' }],
  ])('%s has a feminine', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'indefinite', gender: 'fem' })).toEqual(singular);
    expect(said(concept, { number: 'plural', gender: 'fem' })).toMatchObject(plural);
  });

  test('COUNTRY declines in German: "des Landes", "in den Ländern"', () => {
    expect(sayAll({ subject: { concept: 'LANGUAGE', definiteness: 'definite', possessor: { concept: 'COUNTRY' } } })).toEqual({
      en: "the country's language.", it: 'la lingua del paese.', fr: 'la langue du pays.', de: 'die Sprache des Landes.',
      es: 'el idioma del país.', ja: '国の言語。', pt: 'a língua do país.',
    });
  });
});

// B36. Proper names: the language fixes the article. Italian, French and Portuguese article a country
// as they article a continent; English, German, Spanish and Japanese leave it bare. Portugal is the
// one Portuguese does not article.
describe('the seven countries (localization B36)', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    ['ENGLAND', { en: 'England.', it: "l'Inghilterra.", fr: "l'Angleterre.", de: 'England.', es: 'Inglaterra.', ja: 'イングランド。', pt: 'a Inglaterra.' }],
    ['ITALY', { en: 'Italy.', it: "l'Italia.", fr: "l'Italie.", de: 'Italien.', es: 'Italia.', ja: 'イタリア。', pt: 'a Itália.' }],
    ['FRANCE', { en: 'France.', it: 'la Francia.', fr: 'la France.', de: 'Frankreich.', es: 'Francia.', ja: 'フランス。', pt: 'a França.' }],
    ['GERMANY', { en: 'Germany.', it: 'la Germania.', fr: "l'Allemagne.", de: 'Deutschland.', es: 'Alemania.', ja: 'ドイツ。', pt: 'a Alemanha.' }],
    ['SPAIN', { en: 'Spain.', it: 'la Spagna.', fr: "l'Espagne.", de: 'Spanien.', es: 'España.', ja: 'スペイン。', pt: 'a Espanha.' }],
    ['JAPAN', { en: 'Japan.', it: 'il Giappone.', fr: 'le Japon.', de: 'Japan.', es: 'Japón.', ja: '日本。', pt: 'o Japão.' }],
    ['PORTUGAL', { en: 'Portugal.', it: 'il Portogallo.', fr: 'le Portugal.', de: 'Portugal.', es: 'Portugal.', ja: 'ポルトガル。', pt: 'Portugal.' }],
  ])('%s', (concept, rendered) => {
    expect(said(concept)).toEqual(rendered);
    // A proper name keeps its article whatever determiner is picked, or keeps none.
    expect(said(concept, { definiteness: 'indefinite' })).toEqual(rendered);
  });
});

// B36. "A language" is the same for all seven, so each is the language OF its country: the genitive,
// definite, because "a language of Italy" says one of several. English puts a proper-noun possessor
// in the Saxon genitive, German declines it with -s.
describe('the seven languages are glossed by their country (localization B36)', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    ['ENGLISH', { en: "England's language.", it: "la lingua dell'Inghilterra.", fr: "la langue de l'Angleterre.", de: 'die Sprache Englands.', es: 'el idioma de Inglaterra.', ja: 'イングランドの言語。', pt: 'a língua da Inglaterra.' }],
    ['ITALIAN', { en: "Italy's language.", it: "la lingua dell'Italia.", fr: "la langue de l'Italie.", de: 'die Sprache Italiens.', es: 'el idioma de Italia.', ja: 'イタリアの言語。', pt: 'a língua da Itália.' }],
    ['FRENCH', { en: "France's language.", it: 'la lingua della Francia.', fr: 'la langue de la France.', de: 'die Sprache Frankreichs.', es: 'el idioma de Francia.', ja: 'フランスの言語。', pt: 'a língua da França.' }],
    ['GERMAN', { en: "Germany's language.", it: 'la lingua della Germania.', fr: "la langue de l'Allemagne.", de: 'die Sprache Deutschlands.', es: 'el idioma de Alemania.', ja: 'ドイツの言語。', pt: 'a língua da Alemanha.' }],
    ['SPANISH', { en: "Spain's language.", it: 'la lingua della Spagna.', fr: "la langue de l'Espagne.", de: 'die Sprache Spaniens.', es: 'el idioma de España.', ja: 'スペインの言語。', pt: 'a língua da Espanha.' }],
    ['JAPANESE', { en: "Japan's language.", it: 'la lingua del Giappone.', fr: 'la langue du Japon.', de: 'die Sprache Japans.', es: 'el idioma de Japón.', ja: '日本の言語。', pt: 'a língua do Japão.' }],
    // "de Portugal", not "do Portugal": the one bare country name (`takes_article: '0'`).
    ['PORTUGUESE', { en: "Portugal's language.", it: 'la lingua del Portogallo.', fr: 'la langue du Portugal.', de: 'die Sprache Portugals.', es: 'el idioma de Portugal.', ja: 'ポルトガルの言語。', pt: 'a língua de Portugal.' }],
  ])('%s', (concept, rendered) => {
    expect(definitionAll(concept)).toEqual(rendered);
  });
});

// B37. B31's shape, "a complement that indicates means": the siblings differ only in the noun. The
// three motion names take the place reached, left and crossed, where LOCATIVE takes "places".
describe('the complement names are glossed on their genus (localization B37)', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    ['DIRECTION', { en: 'a complement that indicates destinations.', it: 'un complemento che indica destinazioni.', fr: 'un complément qui indique des destinations.', de: 'eine Ergänzung, die Ziele bezeichnet.', es: 'un complemento que indica destinos.', ja: '目的地を示す補語。', pt: 'um complemento que indica destinos.' }],
    ['SOURCE', { en: 'a complement that indicates origins.', it: 'un complemento che indica origini.', fr: 'un complément qui indique des origines.', de: 'eine Ergänzung, die Ausgangspunkte bezeichnet.', es: 'un complemento que indica orígenes.', ja: '起点を示す補語。', pt: 'um complemento que indica origens.' }],
    ['ROUTE', { en: 'a complement that indicates paths.', it: 'un complemento che indica percorsi.', fr: 'un complément qui indique des parcours.', de: 'eine Ergänzung, die Wege bezeichnet.', es: 'un complemento que indica recorridos.', ja: '経路を示す補語。', pt: 'um complemento que indica percursos.' }],
    ['COMITATIVE', { en: 'a complement that indicates companions.', it: 'un complemento che indica compagni.', fr: 'un complément qui indique des compagnons.', de: 'eine Ergänzung, die Begleiter bezeichnet.', es: 'un complemento que indica compañeros.', ja: '同伴者を示す補語。', pt: 'um complemento que indica companheiros.' }],
    ['TERMINUS', { en: 'a complement that indicates recipients.', it: 'un complemento che indica destinatari.', fr: 'un complément qui indique des destinataires.', de: 'eine Ergänzung, die Empfänger bezeichnet.', es: 'un complemento que indica destinatarios.', ja: '受け手を示す補語。', pt: 'um complemento que indica destinatários.' }],
  ])('%s', (concept, rendered) => {
    expect(definitionAll(concept)).toEqual(rendered);
  });
});

// B38. LINK, not COORDINATE (ja 調整する, to adjust). CONJUNCT is the passive: in the active, German
// "eine Phrase, die eine Konjunktion verbindet" reads first as the phrase linking the conjunction,
// because both nouns are feminine and neither word shows the case.
describe('the coordination words are glossed with LINK (localization B38)', () => {
  test('CONJUNCTION → a word that links clauses', () => {
    expect(definitionAll('CONJUNCTION')).toEqual({
      en: 'a word that links clauses.',
      it: 'una parola che collega proposizioni.',
      fr: 'un mot qui relie des propositions.',
      de: 'ein Wort, das Sätze verbindet.',
      es: 'una palabra que enlaza oraciones.',
      ja: '節をつなぐ単語。',
      pt: 'uma palavra que liga orações.',
    });
  });

  test('CONJUNCT → a phrase that is linked by a conjunction', () => {
    expect(definitionAll('CONJUNCT')).toEqual({
      en: 'a phrase that is linked by a conjunction.',
      it: 'una frase che è collegata da una congiunzione.',
      fr: 'une phrase qui est reliée par une conjonction.',
      de: 'eine Phrase, die von einer Konjunktion verbunden wird.',
      es: 'una frase que es enlazada por una conjunción.',
      ja: '接続詞につながれるフレーズ。',
      pt: 'uma frase que é ligada por uma conjunção.',
    });
  });
});

// B39. The two share their differentia, "quantities", plural because French puts a bare mass object
// in the partitive ("qui indique de la quantité").
describe('number and the quantifier indicate quantities (localization B39)', () => {
  test('NUMBER_GRAMMAR → a category that indicates quantities', () => {
    expect(definitionAll('NUMBER_GRAMMAR')).toEqual({
      en: 'a category that indicates quantities.',
      it: 'una categoria che indica quantità.',
      fr: 'une catégorie qui indique des quantités.',
      de: 'eine Kategorie, die Mengen bezeichnet.',
      es: 'una categoría que indica cantidades.',
      ja: '数量を示す範疇。',
      pt: 'uma categoria que indica quantidades.',
    });
  });

  test('QUANTIFIER → a determiner that indicates quantities', () => {
    expect(definitionAll('QUANTIFIER')).toEqual({
      en: 'a determiner that indicates quantities.',
      it: 'un determinante che indica quantità.',
      fr: 'un déterminant qui indique des quantités.',
      de: 'ein Determinativ, das Mengen bezeichnet.',
      es: 'un determinante que indica cantidades.',
      ja: '数量を示す限定詞。',
      pt: 'um determinante que indica quantidades.',
    });
  });
});
