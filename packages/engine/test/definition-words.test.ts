import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, VerbPhrase, ReadyLanguageCode } from '@signi/shared';
import { np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// The words seeded for the concept definitions of localization B33–B39 and B48–B51, and the glosses
// they unlock on the noun side. The verb glosses they unlock are pinned beside their genus: BURN in
// genus-verbs.test.ts, COLLAPSE and COME in reflexive.test.ts. B48's two adjectives are in
// adjectives.test.ts's EVERY_ADJECTIVE and B50–B51's two verbs in verb.test.ts's Italian table; the
// rest of their paradigms is pinned here.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });

describe('the definition words: a singular and a plural in every language', () => {
  test.each<[string, Record<ReadyLanguageCode, string>, Record<ReadyLanguageCode, string>]>([
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
    // B49. The grammar sense: German Partizipant, not Teilnehmer; Japanese 参与者, not 参加者.
    ['PARTICIPANT_GRAMMAR',
      { en: 'a participant.', it: 'un partecipante.', fr: 'un participant.', de: 'ein Partizipant.', es: 'un participante.', ja: '参与者。', pt: 'um participante.' },
      { en: 'the participants.', it: 'i partecipanti.', fr: 'les participants.', de: 'die Partizipanten.', es: 'los participantes.', ja: '参与者。', pt: 'os participantes.' }],
    // B50. French sens is the same word in the plural.
    ['MEANING',
      { en: 'a meaning.', it: 'un significato.', fr: 'un sens.', de: 'eine Bedeutung.', es: 'un significado.', ja: '意味。', pt: 'um significado.' },
      { en: 'the meanings.', it: 'i significati.', fr: 'les sens.', de: 'die Bedeutungen.', es: 'los significados.', ja: '意味。', pt: 'os significados.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'indefinite' })).toEqual(singular);
    expect(said(concept, { number: 'plural' })).toEqual(plural);
  });

  // The three person nouns have a feminine: fr locutrice, compagne; de -in; it/es/pt -a. Italian,
  // Spanish and Portuguese parlante / hablante / falante change only the article.
  test.each<[string, Record<ReadyLanguageCode, string>, Partial<Record<ReadyLanguageCode, string>>]>([
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

  // B49. A weak masculine takes -en in every case but the nominative singular, the genitive too.
  test('PARTICIPANT_GRAMMAR declines weak in German: "den Partizipanten", "des Partizipanten"', () => {
    expect(sayAll({ subject: np('CAT'), verbPhrase: { verb: 'SEE' }, directObject: np('PARTICIPANT_GRAMMAR') })).toMatchObject({
      de: 'der Kater sieht den Partizipanten.',
    });
    expect(sayAll({ subject: { concept: 'NAME_NOUN', definiteness: 'definite', possessor: { concept: 'PARTICIPANT_GRAMMAR' } } })).toEqual({
      en: "the participant's name.", it: 'il nome del partecipante.', fr: 'le nom du participant.', de: 'der Name des Partizipanten.',
      es: 'el nombre del participante.', ja: '参与者の名前。', pt: 'o nome do participante.',
    });
  });
});

// B36. Proper names: the language fixes the article. Italian, French and Portuguese article a country
// as they article a continent; English, German, Spanish and Japanese leave it bare. Portugal is the
// one Portuguese does not article.
describe('the seven countries (localization B36)', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
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
  test.each<[string, Record<ReadyLanguageCode, string>]>([
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
  test.each<[string, Record<ReadyLanguageCode, string>]>([
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

// B48. The climate senses of COLD and HOT. Japanese says 寒い / 暑い of a place and the weather where
// COLD and HOT are 冷たい / 熱い to the touch, and Spanish caluroso where HOT is caliente. A climate
// is what a place is, so es and pt predicate it with ser, where COLD and HOT take estar.
describe('the continents of extreme climate (localization B48)', () => {
  test('ANTARCTICA → the coldest continent', () => {
    expect(definitionAll('ANTARCTICA')).toEqual({
      en: 'the coldest continent.',
      it: 'il continente più freddo.',
      fr: 'le continent le plus froid.',
      de: 'der kälteste Kontinent.',
      es: 'el continente más frío.',
      ja: '最も寒い大陸。',
      pt: 'o continente mais frio.',
    });
  });

  test('AFRICA → the hottest continent', () => {
    expect(definitionAll('AFRICA')).toEqual({
      en: 'the hottest continent.',
      it: 'il continente più caldo.',
      fr: 'le continent le plus chaud.',
      de: 'der heißeste Kontinent.',
      es: 'el continente más caluroso.',
      ja: '最も暑い大陸。',
      pt: 'o continente mais quente.',
    });
  });

  test('a climate is predicated with ser, where the touch senses take estar', () => {
    const is = (place: string, adjective: string) =>
      sayAll({ subject: np(place), verbPhrase: { verb: 'BE' }, complements: { predicative: { phrase: np(adjective) } } });
    expect(is('ANTARCTICA', 'COLD_CLIMATE')).toEqual({
      en: 'Antarctica is cold.', it: "l'Antartide è fredda.", fr: "l'Antarctique est froid.", de: 'die Antarktis ist kalt.',
      es: 'la Antártida es fría.', ja: '南極大陸は寒いです。', pt: 'a Antártida é fria.',
    });
    expect(is('AFRICA', 'HOT_CLIMATE')).toEqual({
      en: 'Africa is hot.', it: "l'Africa è calda.", fr: "l'Afrique est chaude.", de: 'Afrika ist heiß.',
      es: 'África es calurosa.', ja: 'アフリカは暑いです。', pt: 'a África é quente.',
    });
    expect(is('WATER', 'COLD')).toMatchObject({ es: 'el agua está fría.', ja: '水は冷たいです。', pt: 'a água está fria.' });
  });

  test('the climate senses agree and compare as their siblings do: de kälter, es calurosas', () => {
    expect(sayAll({ subject: np('CAT', { adjectives: ['COLD_CLIMATE'], adjectiveDegrees: ['more'] }), verbPhrase: { verb: 'EAT' } })).toMatchObject({
      de: 'der kältere Kater frisst.', ja: 'もっと寒い猫は食べます。',
    });
    expect(sayAll({ subject: np('CAT', { adjectives: ['HOT_CLIMATE'], gender: 'fem', number: 'plural' }), verbPhrase: { verb: 'EAT' } })).toEqual({
      en: 'the hot cats eat.', it: 'le gatte calde mangiano.', fr: 'les chattes chaudes mangent.', de: 'die heißen Katzen fressen.',
      es: 'las gatas calurosas comen.', ja: '暑い猫は食べます。', pt: 'as gatas quentes comem.',
    });
  });

  // Their own glosses are their siblings': the senses differ in register, not in meaning.
  test('COLD_CLIMATE and HOT_CLIMATE share COLD\'s and HOT\'s glosses', () => {
    expect(definitionAll('COLD_CLIMATE')).toEqual(definitionAll('COLD'));
    expect(definitionAll('HOT_CLIMATE')).toEqual(definitionAll('HOT'));
    expect(definitionAll('COLD_CLIMATE')).toMatchObject({ en: 'at low temperature.', ja: '温度が低い。' });
  });
});

// B49. The agent is a role, defined by what it does in the clause: whoGloss on its genus, the
// intransitive ACT. Japanese 行動する is said of people, and a grammar would say 動作をする, but
// 行動する参与者 still reads as "a participant that acts".
describe('the agent is the participant that acts (localization B49)', () => {
  test('AGENT_GRAMMAR → a participant that acts', () => {
    expect(definitionAll('AGENT_GRAMMAR')).toEqual({
      en: 'a participant that acts.',
      it: 'un partecipante che agisce.',
      fr: 'un participant qui agit.',
      de: 'ein Partizipant, der handelt.',
      es: 'un participante que actúa.',
      ja: '行動する参与者。',
      pt: 'um participante que age.',
    });
  });
});

// B50. HYPERNYM's own description, word for word: C12's genitive relative, headed on the possessor.
// The indefinite OTHER merges as each language wants (en another, it un'altra, de eines anderen), and
// es and pt drop its article (de otra palabra).
describe('the hypernym includes another word\'s meaning (localization B50)', () => {
  test('HYPERNYM → a word whose meaning includes another word\'s meaning', () => {
    expect(definitionAll('HYPERNYM')).toEqual({
      en: "a word whose meaning includes another word's meaning.",
      it: "una parola il cui significato include il significato di un'altra parola.",
      fr: "un mot dont le sens inclut le sens d'un autre mot.",
      de: 'ein Wort, dessen Bedeutung die Bedeutung eines anderen Wortes umfasst.',
      es: 'una palabra cuyo significado incluye el significado de otra palabra.',
      ja: '意味が別の単語の意味を含む単語。',
      pt: 'uma palavra cujo significado inclui o significado de outra palavra.',
    });
  });

  // A state, as HOLD is: the Romance past is the imperfect, Japanese says the state with 〜ている.
  test('INCLUDE conjugates as a state verb: it includeva, ja 含んでいます', () => {
    const includes = (extra: Partial<VerbPhrase> = {}) =>
      sayAll({ subject: np('WORD'), verbPhrase: { verb: 'INCLUDE', ...extra }, directObject: np('MEANING') });
    expect(includes()).toEqual({
      en: 'the word includes the meaning.', it: 'la parola include il significato.', fr: 'le mot inclut le sens.',
      de: 'das Wort umfasst die Bedeutung.', es: 'la palabra incluye el significado.', ja: '単語は意味を含んでいます。',
      pt: 'a palavra inclui o significado.',
    });
    expect(includes({ tense: 'past' })).toEqual({
      en: 'the word included the meaning.', it: 'la parola includeva il significato.', fr: 'le mot incluait le sens.',
      de: 'das Wort umfasste die Bedeutung.', es: 'la palabra incluía el significado.', ja: '単語は意味を含んでいました。',
      pt: 'a palavra incluía o significado.',
    });
    expect(sayAll({ subject: np('FIRST_PERSON', { number: 'plural' }), verbPhrase: { verb: 'INCLUDE' }, directObject: np('MEANING') })).toMatchObject({
      it: 'includiamo il significato.', fr: 'nous incluons le sens.', de: 'wir umfassen die Bedeutung.', es: 'incluimos el significado.',
      pt: 'incluímos o significado.',
    });
    // Godan: the plain negative 含まない before a head noun, the passive 含まれる.
    expect(said('WORD', {
      definiteness: 'indefinite',
      relative: { verbPhrase: { verb: 'INCLUDE', negative: true }, directObject: np('MEANING', { definiteness: 'bare', number: 'plural' }) },
    }).ja).toBe('意味を含まない単語。');
    expect(sayAll({ subject: np('WORD'), verbPhrase: { verb: 'INCLUDE', voice: 'passive' }, directObject: np('HOUSE', { number: 'plural' }) })).toMatchObject({
      it: 'le case sono incluse dalla parola.', fr: 'les maisons sont incluses par le mot.', de: 'die Häuser werden vom Wort umfasst.',
      es: 'las casas son incluidas por la palabra.', ja: '家は単語に含まれています。', pt: 'as casas são incluídas pela palavra.',
    });
  });
});

// B51. What a determiner does to a noun is fix which thing it refers to: German bestimmen, the
// grammar's own verb, where INDICATE ("bezeichnen") would say it stands for nouns.
describe('the determiner specifies nouns (localization B51)', () => {
  test('DETERMINER → a word that specifies nouns', () => {
    expect(definitionAll('DETERMINER')).toEqual({
      en: 'a word that specifies nouns.',
      it: 'una parola che specifica sostantivi.',
      fr: 'un mot qui précise des noms.',
      de: 'ein Wort, das Substantive bestimmt.',
      es: 'una palabra que especifica sustantivos.',
      ja: '名詞を特定する単語。',
      pt: 'uma palavra que especifica substantivos.',
    });
  });

  test('SPECIFY conjugates: it specifichi, es especificó, ja 特定します', () => {
    const specifies = (subject: NounPhrase, extra: Partial<VerbPhrase> = {}) =>
      sayAll({ subject, verbPhrase: { verb: 'SPECIFY', ...extra }, directObject: np('NOUN') });
    expect(specifies(np('WORD'))).toEqual({
      en: 'the word specifies the noun.', it: 'la parola specifica il sostantivo.', fr: 'le mot précise le nom.',
      de: 'das Wort bestimmt das Substantiv.', es: 'la palabra especifica el sustantivo.', ja: '単語は名詞を特定します。',
      pt: 'a palavra especifica o substantivo.',
    });
    expect(specifies(np('WORD'), { tense: 'past' })).toEqual({
      en: 'the word specified the noun.', it: 'la parola specificò il sostantivo.', fr: 'le mot précisa le nom.',
      de: 'das Wort bestimmte das Substantiv.', es: 'la palabra especificó el sustantivo.', ja: '単語は名詞を特定しました。',
      pt: 'a palavra especificou o substantivo.',
    });
    expect(specifies(np('SECOND_PERSON'))).toMatchObject({
      it: 'specifichi il sostantivo.', fr: 'tu précises le nom.', de: 'du bestimmst das Substantiv.', es: 'especificas el sustantivo.',
    });
    expect(specifies(np('WORD'), { negative: true })).toMatchObject({
      fr: 'le mot ne précise pas le nom.', de: 'das Wort bestimmt das Substantiv nicht.', ja: '単語は名詞を特定しません。',
    });
    expect(sayAll({ subject: np('WORD'), verbPhrase: { verb: 'SPECIFY', voice: 'passive' }, directObject: np('NOUN', { number: 'plural' }) })).toMatchObject({
      it: 'i sostantivi sono specificati dalla parola.', fr: 'les noms sont précisés par le mot.', de: 'die Substantive werden vom Wort bestimmt.',
      ja: '名詞は単語に特定されます。',
    });
  });
});
