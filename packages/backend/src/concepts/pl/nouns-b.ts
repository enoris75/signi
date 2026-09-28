import type { LanguageColumn } from '../types.js';
import { f, indeclinable, m, mp, mv, n, noun, paradigm, pluraleTantum } from './helpers.js';

// The nouns, part B (P05-E4, style-pl.md): kin and people, things, places, languages, time, and the
// grammar's own terms. Every case is stored, singular nom, gen, dat, acc, ins, loc, voc; plural nom,
// gen, dat, acc, ins, loc. Grammar terms are Polish school grammar's (*podmiot, dopełnienie,
// okolicznik …*). Every form is (verify) until the native review (P05-E11); the marked ones are the
// choices most worth a second look.

type Forms = Record<string, string>;

/** Appends a fixed tail to every cell of a paradigm: a head noun with an undeclined complement. */
const tail = (list: string, t: string) => list.split(',').map((s) => `${s.trim()} ${t}`).join(', ');

/** An *okolicznik* of the grammar: the head declines, its genitive complement does not. */
const OKOLICZNIK_SG = 'okolicznik, okolicznika, okolicznikowi, okolicznik, okolicznikiem, okoliczniku, okoliczniku';
const OKOLICZNIK_PL = 'okoliczniki, okoliczników, okolicznikom, okoliczniki, okolicznikami, okolicznikach';
const okolicznik = (of: string) => m(tail(OKOLICZNIK_SG, of), tail(OKOLICZNIK_PL, of));

/**
 * A language name: a substantivised adjective in *-ski/-cki* (*polski, polskiego, …*), masculine
 * inanimate, no plural, lowercase. `stem` is the form before the ending (*polsk*).
 */
const lang = (stem: string) => m(`${stem}i, ${stem}iego, ${stem}iemu, ${stem}i, ${stem}im, ${stem}im, ${stem}i`);

const AS_NAME = { as_name: '1' };

export const PL_NOUNS_B: LanguageColumn = {
  // Kin and people.
  BROTHER_IN_LAW: mp('szwagier, szwagra, szwagrowi, szwagra, szwagrem, szwagrze, szwagrze', 'szwagrowie, szwagrów, szwagrom, szwagrów, szwagrami, szwagrach'),
  SISTER_IN_LAW: f('szwagierka, szwagierki, szwagierce, szwagierkę, szwagierką, szwagierce, szwagierko', 'szwagierki, szwagierek, szwagierkom, szwagierki, szwagierkami, szwagierkach'),
  STEPFATHER: mp('ojczym, ojczyma, ojczymowi, ojczyma, ojczymem, ojczymie, ojczymie', 'ojczymowie, ojczymów, ojczymom, ojczymów, ojczymami, ojczymach'),
  STEPMOTHER: f('macocha, macochy, macosze, macochę, macochą, macosze, macocho', 'macochy, macoch, macochom, macochy, macochami, macochach'),
  MOM: f('mama, mamy, mamie, mamę, mamą, mamie, mamo', 'mamy, mam, mamom, mamy, mamami, mamach', AS_NAME),
  DAD: mv('tata, taty, tacie, tatę, tatą, tacie, tato', 'tatowie, tatów, tatom, tatów, tatami, tatach', AS_NAME),
  // Not sexed; Polish pairs *partner/partnerka* as Italian *compagno/compagna* does.
  PARTNER: mp('partner, partnera, partnerowi, partnera, partnerem, partnerze, partnerze', 'partnerzy, partnerów, partnerom, partnerów, partnerami, partnerach', {
    ...paradigm('partnerka, partnerki, partnerce, partnerkę, partnerką, partnerce, partnerko', 'partnerki, partnerek, partnerkom, partnerki, partnerkami, partnerkach', 'fem_'),
  }),
  // (verify) plural *chłopcy* (SJP gives *chłopcy* and colloquial non-virile *chłopaki*); voc also *chłopcze*.
  BOYFRIEND: mp('chłopak, chłopaka, chłopakowi, chłopaka, chłopakiem, chłopaku, chłopaku', 'chłopcy, chłopców, chłopcom, chłopców, chłopcami, chłopcach'),
  GIRLFRIEND: f('dziewczyna, dziewczyny, dziewczynie, dziewczynę, dziewczyną, dziewczynie, dziewczyno', 'dziewczyny, dziewczyn, dziewczynom, dziewczyny, dziewczynami, dziewczynach'),
  // A substantivised participle, as German's *Verlobte*: the adjective's endings, voc = nom.
  FIANCE: mp('narzeczony, narzeczonego, narzeczonemu, narzeczonego, narzeczonym, narzeczonym, narzeczony', 'narzeczeni, narzeczonych, narzeczonym, narzeczonych, narzeczonymi, narzeczonych', {
    ...paradigm('narzeczona, narzeczonej, narzeczonej, narzeczoną, narzeczoną, narzeczonej, narzeczona', 'narzeczone, narzeczonych, narzeczonym, narzeczone, narzeczonymi, narzeczonych', 'fem_'),
  }),
  FRIEND: mp('przyjaciel, przyjaciela, przyjacielowi, przyjaciela, przyjacielem, przyjacielu, przyjacielu', 'przyjaciele, przyjaciół, przyjaciołom, przyjaciół, przyjaciółmi, przyjaciołach', {
    ...paradigm('przyjaciółka, przyjaciółki, przyjaciółce, przyjaciółkę, przyjaciółką, przyjaciółce, przyjaciółko', 'przyjaciółki, przyjaciółek, przyjaciółkom, przyjaciółki, przyjaciółkami, przyjaciółkach', 'fem_'),
  }),
  // (verify) *młodzieniec* is bookish; *chłopak* is BOYFRIEND's and *młody mężczyzna* a phrase.
  YOUNG_MAN: mp('młodzieniec, młodzieńca, młodzieńcowi, młodzieńca, młodzieńcem, młodzieńcu, młodzieńcze', 'młodzieńcy, młodzieńców, młodzieńcom, młodzieńców, młodzieńcami, młodzieńcach'),
  // (verify) the phrase, as German's *junge Frau*; *dziewczyna* is GIRLFRIEND's.
  YOUNG_WOMAN: f('młoda kobieta, młodej kobiety, młodej kobiecie, młodą kobietę, młodą kobietą, młodej kobiecie, młoda kobieto', 'młode kobiety, młodych kobiet, młodym kobietom, młode kobiety, młodymi kobietami, młodych kobietach'),
  // (verify) the feminine *budowniczyni* is rare; *budowniczy* declines as an adjective (voc = nom).
  BUILDER: mp('budowniczy, budowniczego, budowniczemu, budowniczego, budowniczym, budowniczym, budowniczy', 'budowniczowie, budowniczych, budowniczym, budowniczych, budowniczymi, budowniczych', {
    ...paradigm('budowniczyni, budowniczyni, budowniczyni, budowniczynię, budowniczynią, budowniczyni, budowniczyni', 'budowniczynie, budowniczyń, budowniczyniom, budowniczynie, budowniczyniami, budowniczyniach', 'fem_'),
  }),
  CREATOR: mv('twórca, twórcy, twórcy, twórcę, twórcą, twórcy, twórco', 'twórcy, twórców, twórcom, twórców, twórcami, twórcach', {
    ...paradigm('twórczyni, twórczyni, twórczyni, twórczynię, twórczynią, twórczyni, twórczyni', 'twórczynie, twórczyń, twórczyniom, twórczynie, twórczyniami, twórczyniach', 'fem_'),
  }),
  PETER: mp('Piotr, Piotra, Piotrowi, Piotra, Piotrem, Piotrze, Piotrze'),
  MARY: f('Maria, Marii, Marii, Marię, Marią, Marii, Mario'),
  // (verify) loc/voc *Diecie*: written *-th* read [t] alternates as *Macbeth → Macbecie*.
  DIETH: mp('Dieth, Dietha, Diethowi, Dietha, Diethem, Diecie, Diecie'),
  // The title before a name (*pan Piotr*); Spanish's `takes_article` is Spanish-only.
  MR: mp('pan, pana, panu, pana, panem, panu, panie', 'panowie, panów, panom, panów, panami, panach'),

  // Things.
  // (verify) *targ* for the place; *rynek* is also the market square and the economic market.
  MARKET: m('targ, targu, targowi, targ, targiem, targu, targu', 'targi, targów, targom, targi, targami, targach'),
  COIN: f('moneta, monety, monecie, monetę, monetą, monecie, moneto', 'monety, monet, monetom, monety, monetami, monetach'),
  LEGEND: f('legenda, legendy, legendzie, legendę, legendą, legendzie, legendo', 'legendy, legend, legendom, legendy, legendami, legendach'),
  WING: n('skrzydło, skrzydła, skrzydłu, skrzydło, skrzydłem, skrzydle, skrzydło', 'skrzydła, skrzydeł, skrzydłom, skrzydła, skrzydłami, skrzydłach'),
  TOOTH: m('ząb, zęba, zębowi, ząb, zębem, zębie, zębie', 'zęby, zębów, zębom, zęby, zębami, zębach'),
  TEAR: f('łza, łzy, łzie, łzę, łzą, łzie, łzo', 'łzy, łez, łzom, łzy, łzami, łzach'),
  PRISON: n('więzienie, więzienia, więzieniu, więzienie, więzieniem, więzieniu, więzienie', 'więzienia, więzień, więzieniom, więzienia, więzieniami, więzieniach'),
  PHRASE: f('fraza, frazy, frazie, frazę, frazą, frazie, frazo', 'frazy, fraz, frazom, frazy, frazami, frazach'),
  SLOT: f('szczelina, szczeliny, szczelinie, szczelinę, szczeliną, szczelinie, szczelino', 'szczeliny, szczelin, szczelinom, szczeliny, szczelinami, szczelinach'),
  // (verify) the loanword, as German and Spanish; *gniazdo* is the hardware socket.
  SLOT_COMPUTING: m('slot, slotu, slotowi, slot, slotem, slocie, slocie', 'sloty, slotów, slotom, sloty, slotami, slotach'),
  // (verify) *automat do gier*; colloquially *jednoręki bandyta*.
  SLOT_MACHINE: m(tail('automat, automatu, automatowi, automat, automatem, automacie, automacie', 'do gier'), tail('automaty, automatów, automatom, automaty, automatami, automatach', 'do gier')),
  WORD: n('słowo, słowa, słowu, słowo, słowem, słowie, słowo', 'słowa, słów, słowom, słowa, słowami, słowach'),
  MEANING: n('znaczenie, znaczenia, znaczeniu, znaczenie, znaczeniem, znaczeniu, znaczenie', 'znaczenia, znaczeń, znaczeniom, znaczenia, znaczeniami, znaczeniach'),
  FACT: m('fakt, faktu, faktowi, fakt, faktem, fakcie, fakcie', 'fakty, faktów, faktom, fakty, faktami, faktach'),
  REASON: m('powód, powodu, powodowi, powód, powodem, powodzie, powodzie', 'powody, powodów, powodom, powody, powodami, powodach'),
  // (verify) mass: the singular, no plural; *informacje* (pl) is also common for "information".
  INFORMATION: f('informacja, informacji, informacji, informację, informacją, informacji, informacjo'),
  PROBABILITY: n('prawdopodobieństwo, prawdopodobieństwa, prawdopodobieństwu, prawdopodobieństwo, prawdopodobieństwem, prawdopodobieństwie, prawdopodobieństwo', 'prawdopodobieństwa, prawdopodobieństw, prawdopodobieństwom, prawdopodobieństwa, prawdopodobieństwami, prawdopodobieństwach'),
  TRANSLATION: n('tłumaczenie, tłumaczenia, tłumaczeniu, tłumaczenie, tłumaczeniem, tłumaczeniu, tłumaczenie', 'tłumaczenia, tłumaczeń, tłumaczeniom, tłumaczenia, tłumaczeniami, tłumaczeniach'),
  QUESTION: n('pytanie, pytania, pytaniu, pytanie, pytaniem, pytaniu, pytanie', 'pytania, pytań, pytaniom, pytania, pytaniami, pytaniach'),
  TELEPHONE: m('telefon, telefonu, telefonowi, telefon, telefonem, telefonie, telefonie', 'telefony, telefonów, telefonom, telefony, telefonami, telefonach'),
  MIND: m('umysł, umysłu, umysłowi, umysł, umysłem, umyśle, umyśle', 'umysły, umysłów, umysłom, umysły, umysłami, umysłach'),
  BRACKET: m('nawias, nawiasu, nawiasowi, nawias, nawiasem, nawiasie, nawiasie', 'nawiasy, nawiasów, nawiasom, nawiasy, nawiasami, nawiasach'),
  CONTAINER: m('pojemnik, pojemnika, pojemnikowi, pojemnik, pojemnikiem, pojemniku, pojemniku', 'pojemniki, pojemników, pojemnikom, pojemniki, pojemnikami, pojemnikach'),
  MAP: f('mapa, mapy, mapie, mapę, mapą, mapie, mapo', 'mapy, map, mapom, mapy, mapami, mapach'),
  NODE: m('węzeł, węzła, węzłowi, węzeł, węzłem, węźle, węźle', 'węzły, węzłów, węzłom, węzły, węzłami, węzłach'),
  RELATIONSHIP: f('relacja, relacji, relacji, relację, relacją, relacji, relacjo', 'relacje, relacji, relacjom, relacje, relacjami, relacjach'),
  CONDITION: m('warunek, warunku, warunkowi, warunek, warunkiem, warunku, warunku', 'warunki, warunków, warunkom, warunki, warunkami, warunkach'),

  // Numbers and measures.
  NUMBER: f('liczba, liczby, liczbie, liczbę, liczbą, liczbie, liczbo', 'liczby, liczb, liczbom, liczby, liczbami, liczbach'),
  NUMBER_LABEL: m('numer, numeru, numerowi, numer, numerem, numerze, numerze', 'numery, numerów, numerom, numery, numerami, numerach'),
  QUANTITY: f('ilość, ilości, ilości, ilość, ilością, ilości, ilości', 'ilości, ilości, ilościom, ilości, ilościami, ilościach'),
  UNIT: f('jednostka, jednostki, jednostce, jednostkę, jednostką, jednostce, jednostko', 'jednostki, jednostek, jednostkom, jednostki, jednostkami, jednostkach'),
  // (verify) after a numeral Polish keeps *procent* undeclined (*pięć procent*); that is the engine's.
  PERCENT: m('procent, procentu, procentowi, procent, procentem, procencie, procencie', 'procenty, procentów, procentom, procenty, procentami, procentach'),
  CATEGORY: f('kategoria, kategorii, kategorii, kategorię, kategorią, kategorii, kategorio', 'kategorie, kategorii, kategoriom, kategorie, kategoriami, kategoriach'),
  KIND_SORT: m('rodzaj, rodzaju, rodzajowi, rodzaj, rodzajem, rodzaju, rodzaju', 'rodzaje, rodzajów, rodzajom, rodzaje, rodzajami, rodzajach'),

  // Places.
  CONTINENT: m('kontynent, kontynentu, kontynentowi, kontynent, kontynentem, kontynencie, kontynencie', 'kontynenty, kontynentów, kontynentom, kontynenty, kontynentami, kontynentach'),
  AFRICA: f('Afryka, Afryki, Afryce, Afrykę, Afryką, Afryce, Afryko'),
  EUROPE: f('Europa, Europy, Europie, Europę, Europą, Europie, Europo'),
  ASIA: f('Azja, Azji, Azji, Azję, Azją, Azji, Azjo'),
  OCEANIA: f('Oceania, Oceanii, Oceanii, Oceanię, Oceanią, Oceanii, Oceanio'),
  NORTH_AMERICA: f('Ameryka Północna, Ameryki Północnej, Ameryce Północnej, Amerykę Północną, Ameryką Północną, Ameryce Północnej, Ameryko Północna'),
  SOUTH_AMERICA: f('Ameryka Południowa, Ameryki Południowej, Ameryce Południowej, Amerykę Południową, Ameryką Południową, Ameryce Południowej, Ameryko Południowa'),
  ANTARCTICA: f('Antarktyda, Antarktydy, Antarktydzie, Antarktydę, Antarktydą, Antarktydzie, Antarktydo'),
  COUNTRY: m('kraj, kraju, krajowi, kraj, krajem, kraju, kraju', 'kraje, krajów, krajom, kraje, krajami, krajach'),
  CITY: n('miasto, miasta, miastu, miasto, miastem, mieście, miasto', 'miasta, miast, miastom, miasta, miastami, miastach'),
  ENGLAND: f('Anglia, Anglii, Anglii, Anglię, Anglią, Anglii, Anglio'),
  // Plurale tantum: *Włochy są*, loc *we Włoszech*.
  ITALY: pluraleTantum('Włochy, Włoch, Włochom, Włochy, Włochami, Włoszech'),
  FRANCE: f('Francja, Francji, Francji, Francję, Francją, Francji, Francjo'),
  // Plurale tantum, non-virile as a country (acc *Niemcy*, where the people are *Niemców*).
  GERMANY: pluraleTantum('Niemcy, Niemiec, Niemcom, Niemcy, Niemcami, Niemczech'),
  SPAIN: f('Hiszpania, Hiszpanii, Hiszpanii, Hiszpanię, Hiszpanią, Hiszpanii, Hiszpanio'),
  JAPAN: f('Japonia, Japonii, Japonii, Japonię, Japonią, Japonii, Japonio'),
  PORTUGAL: f('Portugalia, Portugalii, Portugalii, Portugalię, Portugalią, Portugalii, Portugalio'),
  ZURICH: m('Zurych, Zurychu, Zurychowi, Zurych, Zurychem, Zurychu, Zurychu'),

  // Languages: lowercase substantivised adjectives (style-pl.md).
  LANGUAGE: m('język, języka, językowi, język, językiem, języku, języku', 'języki, języków, językom, języki, językami, językach'),
  ENGLISH: lang('angielsk'),
  ITALIAN: lang('włosk'),
  FRENCH: lang('francusk'),
  GERMAN: lang('niemieck'),
  SPANISH: lang('hiszpańsk'),
  JAPANESE: lang('japońsk'),
  PORTUGUESE: lang('portugalsk'),
  // (verify) *szwajcarski niemiecki*; the careful name is *szwajcarska odmiana niemieckiego*.
  SWISS_GERMAN: m('szwajcarski niemiecki, szwajcarskiego niemieckiego, szwajcarskiemu niemieckiemu, szwajcarski niemiecki, szwajcarskim niemieckim, szwajcarskim niemieckim, szwajcarski niemiecki'),
  ROMANSH: lang('retoromańsk'),
  // (verify) the three standards' own names, undeclined, as Spanish and Italian keep them.
  RUMANTSCH_GRISCHUN: indeclinable('masc', 'rumantsch grischun'),
  SURSILVAN: indeclinable('masc', 'sursilvan'),
  VALLADER: indeclinable('masc', 'vallader'),
  CATALAN: lang('katalońsk'),
  POLISH: lang('polsk'),
  LITHUANIAN: lang('litewsk'),
  SPELLING: f('pisownia, pisowni, pisowni, pisownię, pisownią, pisowni, pisownio', 'pisownie, pisowni, pisowniom, pisownie, pisowniami, pisowniach'),

  // Time.
  PERIOD_TIME: m('okres, okresu, okresowi, okres, okresem, okresie, okresie', 'okresy, okresów, okresom, okresy, okresami, okresach'),
  MOMENT: f('chwila, chwili, chwili, chwilę, chwilą, chwili, chwilo', 'chwile, chwil, chwilom, chwile, chwilami, chwilach'),
  DAY: m('dzień, dnia, dniowi, dzień, dniem, dniu, dniu', 'dni, dni, dniom, dni, dniami, dniach'),
  HOUR: f('godzina, godziny, godzinie, godzinę, godziną, godzinie, godzino', 'godziny, godzin, godzinom, godziny, godzinami, godzinach'),
  MINUTE: f('minuta, minuty, minucie, minutę, minutą, minucie, minuto', 'minuty, minut, minutom, minuty, minutami, minutach'),
  MONTH: m('miesiąc, miesiąca, miesiącowi, miesiąc, miesiącem, miesiącu, miesiącu', 'miesiące, miesięcy, miesiącom, miesiące, miesiącami, miesiącach'),
  WEEK: m('tydzień, tygodnia, tygodniowi, tydzień, tygodniem, tygodniu, tygodniu', 'tygodnie, tygodni, tygodniom, tygodnie, tygodniami, tygodniach'),
  NIGHT: f('noc, nocy, nocy, noc, nocą, nocy, nocy', 'noce, nocy, nocom, noce, nocami, nocach'),
  // (verify) *poranek*; *rano* is the everyday word but defective, *przedpołudnie* the whole forenoon.
  MORNING: m('poranek, poranka, porankowi, poranek, porankiem, poranku, poranku', 'poranki, poranków, porankom, poranki, porankami, porankach'),
  // The plural is suppletive neuter *lata* (non-virile, so agreement is unaffected).
  YEAR: m('rok, roku, rokowi, rok, rokiem, roku, roku', 'lata, lat, latom, lata, latami, latach'),

  // The grammar's terms.
  // (verify) *uczestnik (sytuacji)*, the semantic-role term.
  PARTICIPANT_GRAMMAR: mp('uczestnik, uczestnika, uczestnikowi, uczestnika, uczestnikiem, uczestniku, uczestniku', 'uczestnicy, uczestników, uczestnikom, uczestników, uczestnikami, uczestnikach'),
  AGENT_GRAMMAR: m('agens, agensa, agensowi, agens, agensem, agensie, agensie', 'agensy, agensów, agensom, agensy, agensami, agensach'),
  SUBJECT_GRAMMAR: m('podmiot, podmiotu, podmiotowi, podmiot, podmiotem, podmiocie, podmiocie', 'podmioty, podmiotów, podmiotom, podmioty, podmiotami, podmiotach'),
  // (verify) *wołacz* names the case and, in school grammar, the phrase in it.
  VOCATIVE: m('wołacz, wołacza, wołaczowi, wołacz, wołaczem, wołaczu, wołaczu', 'wołacze, wołaczy, wołaczom, wołacze, wołaczami, wołaczach'),
  OBJECT_GRAMMAR: n('dopełnienie, dopełnienia, dopełnieniu, dopełnienie, dopełnieniem, dopełnieniu, dopełnienie', 'dopełnienia, dopełnień, dopełnieniom, dopełnienia, dopełnieniami, dopełnieniach'),
  SUBJECT_COMPLEMENT: m('orzecznik, orzecznika, orzecznikowi, orzecznik, orzecznikiem, orzeczniku, orzeczniku', 'orzeczniki, orzeczników, orzecznikom, orzeczniki, orzecznikami, orzecznikach'),
  // (verify) school grammar has no name for it; the head declines, *dopełnienia* does not.
  OBJECT_COMPLEMENT: m(tail('orzecznik, orzecznika, orzecznikowi, orzecznik, orzecznikiem, orzeczniku, orzeczniku', 'dopełnienia'), tail('orzeczniki, orzeczników, orzecznikom, orzeczniki, orzecznikami, orzecznikach', 'dopełnienia')),
  // (verify) *okolicznik narzędzia* and *okolicznik towarzyszenia* are outside the school list.
  INSTRUMENTAL: okolicznik('narzędzia'),
  COMITATIVE: okolicznik('towarzyszenia'),
  ADVERBIAL_OF_MANNER: okolicznik('sposobu'),
  // (verify) *określenie*, the school name for the parts that complete a word (*okolicznik*,
  // *dopełnienie*, *przydawka*); *dopełnienie* alone is OBJECT_GRAMMAR's.
  COMPLEMENT_GRAMMAR: n('określenie, określenia, określeniu, określenie, określeniem, określeniu, określenie', 'określenia, określeń, określeniom, określenia, określeniami, określeniach'),
  LOCATIVE: okolicznik('miejsca'),
  // (verify) the three motion complements: school grammar folds them into *okolicznik miejsca*.
  DIRECTION: okolicznik('kierunku'),
  SOURCE: okolicznik('punktu wyjścia'),
  ROUTE: okolicznik('drogi'),
  CAUSE_COMPLEMENT: okolicznik('przyczyny'),
  TEMPORAL_COMPLEMENT: okolicznik('czasu'),
  PURPOSE_COMPLEMENT: okolicznik('celu'),
  // (verify) *przeciwnika*, *tematu*, *funkcji*: modelled on Spanish's names, not school grammar's.
  OPPONENT_COMPLEMENT: okolicznik('przeciwnika'),
  TOPIC_COMPLEMENT: okolicznik('tematu'),
  ROLE_COMPLEMENT: okolicznik('funkcji'),
  INTERJECTION: m('wykrzyknik, wykrzyknika, wykrzyknikowi, wykrzyknik, wykrzyknikiem, wykrzykniku, wykrzykniku', 'wykrzykniki, wykrzykników, wykrzyknikom, wykrzykniki, wykrzyknikami, wykrzyknikach'),
  // (verify) the indirect object: *dopełnienie dalsze* (school grammar's *bliższe/dalsze* split).
  TERMINUS: n('dopełnienie dalsze, dopełnienia dalszego, dopełnieniu dalszemu, dopełnienie dalsze, dopełnieniem dalszym, dopełnieniu dalszym, dopełnienie dalsze', 'dopełnienia dalsze, dopełnień dalszych, dopełnieniom dalszym, dopełnienia dalsze, dopełnieniami dalszymi, dopełnieniach dalszych'),
  NOUN: m('rzeczownik, rzeczownika, rzeczownikowi, rzeczownik, rzeczownikiem, rzeczowniku, rzeczowniku', 'rzeczowniki, rzeczowników, rzeczownikom, rzeczowniki, rzeczownikami, rzeczownikach'),
  PRONOUN: m('zaimek, zaimka, zaimkowi, zaimek, zaimkiem, zaimku, zaimku', 'zaimki, zaimków, zaimkom, zaimki, zaimkami, zaimkach'),
  VERB: m('czasownik, czasownika, czasownikowi, czasownik, czasownikiem, czasowniku, czasowniku', 'czasowniki, czasowników, czasownikom, czasowniki, czasownikami, czasownikach'),
  ADVERB: m('przysłówek, przysłówka, przysłówkowi, przysłówek, przysłówkiem, przysłówku, przysłówku', 'przysłówki, przysłówków, przysłówkom, przysłówki, przysłówkami, przysłówkach'),
  ADJECTIVE: m('przymiotnik, przymiotnika, przymiotnikowi, przymiotnik, przymiotnikiem, przymiotniku, przymiotniku', 'przymiotniki, przymiotników, przymiotnikom, przymiotniki, przymiotnikami, przymiotnikach'),
  // (verify) *fraza bezokolicznikowa / czasownikowa / rzeczownikowa* (also *grupa …*, *fraza nominalna*).
  INFINITIVE_PHRASE: f('fraza bezokolicznikowa, frazy bezokolicznikowej, frazie bezokolicznikowej, frazę bezokolicznikową, frazą bezokolicznikową, frazie bezokolicznikowej, frazo bezokolicznikowa', 'frazy bezokolicznikowe, fraz bezokolicznikowych, frazom bezokolicznikowym, frazy bezokolicznikowe, frazami bezokolicznikowymi, frazach bezokolicznikowych'),
  VERB_PHRASE: f('fraza czasownikowa, frazy czasownikowej, frazie czasownikowej, frazę czasownikową, frazą czasownikową, frazie czasownikowej, frazo czasownikowa', 'frazy czasownikowe, fraz czasownikowych, frazom czasownikowym, frazy czasownikowe, frazami czasownikowymi, frazach czasownikowych'),
  NOUN_PHRASE: f('fraza rzeczownikowa, frazy rzeczownikowej, frazie rzeczownikowej, frazę rzeczownikową, frazą rzeczownikową, frazie rzeczownikowej, frazo rzeczownikowa', 'frazy rzeczownikowe, fraz rzeczownikowych, frazom rzeczownikowym, frazy rzeczownikowe, frazami rzeczownikowymi, frazach rzeczownikowych'),
  CLAUSE: n('zdanie, zdania, zdaniu, zdanie, zdaniem, zdaniu, zdanie', 'zdania, zdań, zdaniom, zdania, zdaniami, zdaniach'),
  RELATIVE_CLAUSE: n('zdanie względne, zdania względnego, zdaniu względnemu, zdanie względne, zdaniem względnym, zdaniu względnym, zdanie względne', 'zdania względne, zdań względnych, zdaniom względnym, zdania względne, zdaniami względnymi, zdaniach względnych'),
  STATEMENT: n('zdanie oznajmujące, zdania oznajmującego, zdaniu oznajmującemu, zdanie oznajmujące, zdaniem oznajmującym, zdaniu oznajmującym, zdanie oznajmujące', 'zdania oznajmujące, zdań oznajmujących, zdaniom oznajmującym, zdania oznajmujące, zdaniami oznajmującymi, zdaniach oznajmujących'),
  // (verify) *koordynacja* (linguistics); school grammar says *współrzędność*.
  COORDINATION: f('koordynacja, koordynacji, koordynacji, koordynację, koordynacją, koordynacji, koordynacjo', 'koordynacje, koordynacji, koordynacjom, koordynacje, koordynacjami, koordynacjach'),
  // (verify) *człon współrzędny*.
  CONJUNCT: m('człon współrzędny, członu współrzędnego, członowi współrzędnemu, człon współrzędny, członem współrzędnym, członie współrzędnym, członie współrzędny', 'człony współrzędne, członów współrzędnych, członom współrzędnym, człony współrzędne, członami współrzędnymi, członach współrzędnych'),
  CONJUNCTION: m('spójnik, spójnika, spójnikowi, spójnik, spójnikiem, spójniku, spójniku', 'spójniki, spójników, spójnikom, spójniki, spójnikami, spójnikach'),
  // (verify) *modyfikator*, since *określenie* is COMPLEMENT_GRAMMAR's.
  MODIFIER: m('modyfikator, modyfikatora, modyfikatorowi, modyfikator, modyfikatorem, modyfikatorze, modyfikatorze', 'modyfikatory, modyfikatorów, modyfikatorom, modyfikatory, modyfikatorami, modyfikatorach'),
  HYPERNYM: m('hiperonim, hiperonimu, hiperonimowi, hiperonim, hiperonimem, hiperonimie, hiperonimie', 'hiperonimy, hiperonimów, hiperonimom, hiperonimy, hiperonimami, hiperonimach'),
  // (verify) *określnik* (also *determinator*).
  DETERMINER: m('określnik, określnika, określnikowi, określnik, określnikiem, określniku, określniku', 'określniki, określników, określnikom, określniki, określnikami, określnikach'),
  ARTICLE: m('rodzajnik, rodzajnika, rodzajnikowi, rodzajnik, rodzajnikiem, rodzajniku, rodzajniku', 'rodzajniki, rodzajników, rodzajnikom, rodzajniki, rodzajnikami, rodzajnikach'),
  DEMONSTRATIVE: m('zaimek wskazujący, zaimka wskazującego, zaimkowi wskazującemu, zaimek wskazujący, zaimkiem wskazującym, zaimku wskazującym, zaimku wskazujący', 'zaimki wskazujące, zaimków wskazujących, zaimkom wskazującym, zaimki wskazujące, zaimkami wskazującymi, zaimkach wskazujących'),
  // (verify) *kwantyfikator*.
  QUANTIFIER: m('kwantyfikator, kwantyfikatora, kwantyfikatorowi, kwantyfikator, kwantyfikatorem, kwantyfikatorze, kwantyfikatorze', 'kwantyfikatory, kwantyfikatorów, kwantyfikatorom, kwantyfikatory, kwantyfikatorami, kwantyfikatorach'),
  // (verify) *wypowiedzenie*, the whole sentence (*zdanie* is CLAUSE's); *okres* is only the long one.
  PERIOD_SENTENCE: n('wypowiedzenie, wypowiedzenia, wypowiedzeniu, wypowiedzenie, wypowiedzeniem, wypowiedzeniu, wypowiedzenie', 'wypowiedzenia, wypowiedzeń, wypowiedzeniom, wypowiedzenia, wypowiedzeniami, wypowiedzeniach'),
  PERIOD_PUNCTUATION: f('kropka, kropki, kropce, kropkę, kropką, kropce, kropko', 'kropki, kropek, kropkom, kropki, kropkami, kropkach'),
  PERSON_GRAMMAR: f('osoba, osoby, osobie, osobę, osobą, osobie, osobo', 'osoby, osób, osobom, osoby, osobami, osobach'),
  NUMBER_GRAMMAR: f('liczba, liczby, liczbie, liczbę, liczbą, liczbie, liczbo', 'liczby, liczb, liczbom, liczby, liczbami, liczbach'),
  SINGULAR_GRAMMAR: f('liczba pojedyncza, liczby pojedynczej, liczbie pojedynczej, liczbę pojedynczą, liczbą pojedynczą, liczbie pojedynczej, liczbo pojedyncza', 'liczby pojedyncze, liczb pojedynczych, liczbom pojedynczym, liczby pojedyncze, liczbami pojedynczymi, liczbach pojedynczych'),
  PLURAL_GRAMMAR: f('liczba mnoga, liczby mnogiej, liczbie mnogiej, liczbę mnogą, liczbą mnogą, liczbie mnogiej, liczbo mnoga', 'liczby mnogie, liczb mnogich, liczbom mnogim, liczby mnogie, liczbami mnogimi, liczbach mnogich'),
  CASE_GRAMMAR: m('przypadek, przypadku, przypadkowi, przypadek, przypadkiem, przypadku, przypadku', 'przypadki, przypadków, przypadkom, przypadki, przypadkami, przypadkach'),
};
