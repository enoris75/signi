import type { LanguageColumn } from '../types.js';
import { f, m, mp, n, paradigm } from './helpers.js';

// The nouns, part C (P05-E4, style-pl.md): grammar terms named as Polish school grammar names them
// (*celownik, dopełniacz, czas teraźniejszy, tryb, stopień równy*), interface words as Polish software
// says them (*przycisk, klawisz, zakładka, schowek, pasek narzędzi*), and the abstract and everyday
// nouns of the slice. Every singular case is stored in the order nom, gen, dat, acc, ins, loc, voc,
// every plural in nom, gen, dat, acc, ins, loc. A multiword noun stores the whole phrase in each cell;
// a head with a genitive complement declines only the head (*pasek narzędzi*). Every form is
// (verify) until the native review (P05-E11); the marked ones are the choices most worth a look.

/**
 * A plurale tantum used for a mass sense (*plecy, wiadomości, badania*): the plural in every cell,
 * the singular keys included (so a singular slot still finds a form), agreeing as the plural does —
 * masculine non-virile, as style-pl.md says of *pieniądze*.
 */
const pt = (pl: string): Record<string, string> => {
  const [nom, gen, dat, acc, ins, loc] = pl.split(',').map((s) => s.trim());
  return m(`${nom}, ${gen}, ${dat}, ${acc}, ${ins}, ${loc}, ${nom}`, pl, { plurale_tantum: '1' });
};

export const PL_NOUNS_C: LanguageColumn = {
  // Grammar.
  DATIVE: m('celownik, celownika, celownikowi, celownik, celownikiem, celowniku, celowniku',
    'celowniki, celowników, celownikom, celowniki, celownikami, celownikach'),
  GENITIVE: m('dopełniacz, dopełniacza, dopełniaczowi, dopełniacz, dopełniaczem, dopełniaczu, dopełniaczu',
    'dopełniacze, dopełniaczy, dopełniaczom, dopełniacze, dopełniaczami, dopełniaczach'),
  GENDER: m('rodzaj, rodzaju, rodzajowi, rodzaj, rodzajem, rodzaju, rodzaju',
    'rodzaje, rodzajów, rodzajom, rodzaje, rodzajami, rodzajach'),
  TENSE: m('czas, czasu, czasowi, czas, czasem, czasie, czasie', 'czasy, czasów, czasom, czasy, czasami, czasach'),
  PRESENT_TENSE: m(
    'czas teraźniejszy, czasu teraźniejszego, czasowi teraźniejszemu, czas teraźniejszy, czasem teraźniejszym, czasie teraźniejszym, czasie teraźniejszy',
    'czasy teraźniejsze, czasów teraźniejszych, czasom teraźniejszym, czasy teraźniejsze, czasami teraźniejszymi, czasach teraźniejszych'),
  PAST_TENSE: m(
    'czas przeszły, czasu przeszłego, czasowi przeszłemu, czas przeszły, czasem przeszłym, czasie przeszłym, czasie przeszły',
    'czasy przeszłe, czasów przeszłych, czasom przeszłym, czasy przeszłe, czasami przeszłymi, czasach przeszłych'),
  FUTURE_TENSE: m(
    'czas przyszły, czasu przyszłego, czasowi przyszłemu, czas przyszły, czasem przyszłym, czasie przyszłym, czasie przyszły',
    'czasy przyszłe, czasów przyszłych, czasom przyszłym, czasy przyszłe, czasami przyszłymi, czasach przyszłych'),
  ASPECT: m('aspekt, aspektu, aspektowi, aspekt, aspektem, aspekcie, aspekcie',
    'aspekty, aspektów, aspektom, aspekty, aspektami, aspektach'),
  // School grammar's name for voice (*strona czynna, strona bierna*), the same word as a page or a side.
  VOICE: f('strona, strony, stronie, stronę, stroną, stronie, strono', 'strony, stron, stronom, strony, stronami, stronach'),
  // Linguistics says *polaryzacja* (*wyrażenia o polaryzacji negatywnej*). (verify)
  POLARITY: f('polaryzacja, polaryzacji, polaryzacji, polaryzację, polaryzacją, polaryzacji, polaryzacjo',
    'polaryzacje, polaryzacji, polaryzacjom, polaryzacje, polaryzacjami, polaryzacjach'),
  // The stance a text takes (*pozytywny wydźwięk*); *nacechowanie* or *ocena* are the alternatives. (verify)
  SENTIMENT: m('wydźwięk, wydźwięku, wydźwiękowi, wydźwięk, wydźwiękiem, wydźwięku, wydźwięku',
    'wydźwięki, wydźwięków, wydźwiękom, wydźwięki, wydźwiękami, wydźwiękach'),
  MOOD: m('tryb, trybu, trybowi, tryb, trybem, trybie, trybie', 'tryby, trybów, trybom, tryby, trybami, trybach'),
  DEGREE_GRAMMAR: m('stopień, stopnia, stopniowi, stopień, stopniem, stopniu, stopniu',
    'stopnie, stopni, stopniom, stopnie, stopniami, stopniach'),
  // School grammar's *stopień równy, wyższy, najwyższy*.
  POSITIVE_DEGREE: m(
    'stopień równy, stopnia równego, stopniowi równemu, stopień równy, stopniem równym, stopniu równym, stopniu równy',
    'stopnie równe, stopni równych, stopniom równym, stopnie równe, stopniami równymi, stopniach równych'),
  // No school-grammar name; linguistics says *podstawa porównania* (or *wzorzec porównania*). (verify)
  STANDARD_OF_COMPARISON: f(
    'podstawa porównania, podstawy porównania, podstawie porównania, podstawę porównania, podstawą porównania, podstawie porównania, podstawo porównania',
    'podstawy porównania, podstaw porównania, podstawom porównania, podstawy porównania, podstawami porównania, podstawach porównania'),
  // (verify) *zbiór porównania* is a coinage on the model of *podstawa porównania*.
  COMPARISON_SET: m(
    'zbiór porównania, zbioru porównania, zbiorowi porównania, zbiór porównania, zbiorem porównania, zbiorze porównania, zbiorze porównania',
    'zbiory porównania, zbiorów porównania, zbiorom porównania, zbiory porównania, zbiorami porównania, zbiorach porównania'),
  MODAL: m(
    'czasownik modalny, czasownika modalnego, czasownikowi modalnemu, czasownik modalny, czasownikiem modalnym, czasowniku modalnym, czasowniku modalny',
    'czasowniki modalne, czasowników modalnych, czasownikom modalnym, czasowniki modalne, czasownikami modalnymi, czasownikach modalnych'),

  // Commands and instructions.
  // A command typed or given to a program (*wiersz poleceń*); ORDER is the one given to a person.
  COMMAND: n('polecenie, polecenia, poleceniu, polecenie, poleceniem, poleceniu, polecenie',
    'polecenia, poleceń, poleceniom, polecenia, poleceniami, poleceniach'),
  ORDER: m('rozkaz, rozkazu, rozkazowi, rozkaz, rozkazem, rozkazie, rozkazie',
    'rozkazy, rozkazów, rozkazom, rozkazy, rozkazami, rozkazach'),
  INSTRUCTION: f('instrukcja, instrukcji, instrukcji, instrukcję, instrukcją, instrukcji, instrukcjo',
    'instrukcje, instrukcji, instrukcjom, instrukcje, instrukcjami, instrukcjach'),
  REGISTER: m('rejestr, rejestru, rejestrowi, rejestr, rejestrem, rejestrze, rejestrze',
    'rejestry, rejestrów, rejestrom, rejestry, rejestrami, rejestrach'),
  // The formality of a register; *formalność* is rather a formal procedure. (verify)
  FORMALITY: f('oficjalność, oficjalności, oficjalności, oficjalność, oficjalnością, oficjalności, oficjalności'),

  // The interface.
  OPTION: f('opcja, opcji, opcji, opcję, opcją, opcji, opcjo', 'opcje, opcji, opcjom, opcje, opcjami, opcjach'),
  BUTTON: m('przycisk, przycisku, przyciskowi, przycisk, przyciskiem, przycisku, przycisku',
    'przyciski, przycisków, przyciskom, przyciski, przyciskami, przyciskach'),
  KEYBOARD: f('klawiatura, klawiatury, klawiaturze, klawiaturę, klawiaturą, klawiaturze, klawiaturo',
    'klawiatury, klawiatur, klawiaturom, klawiatury, klawiaturami, klawiaturach'),
  KEY: m('klawisz, klawisza, klawiszowi, klawisz, klawiszem, klawiszu, klawiszu',
    'klawisze, klawiszy, klawiszom, klawisze, klawiszami, klawiszach'),
  // *strzałka* alone names the arrow key (*naciśnij strzałkę w górę*), as Spanish's *flecha*.
  ARROW: f('strzałka, strzałki, strzałce, strzałkę, strzałką, strzałce, strzałko',
    'strzałki, strzałek, strzałkom, strzałki, strzałkami, strzałkach'),
  REGION: m('obszar, obszaru, obszarowi, obszar, obszarem, obszarze, obszarze',
    'obszary, obszarów, obszarom, obszary, obszarami, obszarach'),
  GROUP: f('grupa, grupy, grupie, grupę, grupą, grupie, grupo', 'grupy, grup, grupom, grupy, grupami, grupach'),
  // *członek* is personal (*członkowie*); a thing in a set is rather *element*. (verify)
  MEMBER: mp('członek, członka, członkowi, członka, członkiem, członku, członku',
    'członkowie, członków, członkom, członków, członkami, członkach'),
  // *przyjęcie* in the written standard; *impreza* is the everyday word. (verify)
  PARTY_CELEBRATION: n('przyjęcie, przyjęcia, przyjęciu, przyjęcie, przyjęciem, przyjęciu, przyjęcie',
    'przyjęcia, przyjęć, przyjęciom, przyjęcia, przyjęciami, przyjęciach'),
  // A row across a grid: *rząd, rzędu* — not GOVERNMENT's *rząd, rządu*. LINE is *wiersz*.
  ROW: m('rząd, rzędu, rzędowi, rząd, rzędem, rzędzie, rzędzie', 'rzędy, rzędów, rzędom, rzędy, rzędami, rzędach'),
  MENU: n('menu, menu, menu, menu, menu, menu, menu', 'menu, menu, menu, menu, menu, menu'),
  TAB: f('zakładka, zakładki, zakładce, zakładkę, zakładką, zakładce, zakładko',
    'zakładki, zakładek, zakładkom, zakładki, zakładkami, zakładkach'),
  // The same word as PURPOSE (*cel odnośnika*). (verify)
  TARGET: m('cel, celu, celowi, cel, celem, celu, celu', 'cele, celów, celom, cele, celami, celach'),
  HELP: f('pomoc, pomocy, pomocy, pomoc, pomocą, pomocy, pomocy'),
  NAVIGATION: f('nawigacja, nawigacji, nawigacji, nawigację, nawigacją, nawigacji, nawigacjo'),
  // The name of a thing; a person's first name is *imię*.
  NAME_NOUN: f('nazwa, nazwy, nazwie, nazwę, nazwą, nazwie, nazwo', 'nazwy, nazw, nazwom, nazwy, nazwami, nazwach'),
  ALIAS: m('alias, aliasu, aliasowi, alias, aliasem, aliasie, aliasie', 'aliasy, aliasów, aliasom, aliasy, aliasami, aliasach'),
  TITLE: m('tytuł, tytułu, tytułowi, tytuł, tytułem, tytule, tytule', 'tytuły, tytułów, tytułom, tytuły, tytułami, tytułach'),
  LOADING: n('ładowanie, ładowania, ładowaniu, ładowanie, ładowaniem, ładowaniu, ładowanie'),
  INTERFACE: m('interfejs, interfejsu, interfejsowi, interfejs, interfejsem, interfejsie, interfejsie',
    'interfejsy, interfejsów, interfejsom, interfejsy, interfejsami, interfejsach'),
  SERVER: m('serwer, serwera, serwerowi, serwer, serwerem, serwerze, serwerze',
    'serwery, serwerów, serwerom, serwery, serwerami, serwerach'),
  RESULT: m('wynik, wyniku, wynikowi, wynik, wynikiem, wyniku, wyniku', 'wyniki, wyników, wynikom, wyniki, wynikami, wynikach'),
  IMPORT_NOUN: m('import, importu, importowi, import, importem, imporcie, imporcie',
    'importy, importów, importom, importy, importami, importach'),
  ICON: f('ikona, ikony, ikonie, ikonę, ikoną, ikonie, ikono', 'ikony, ikon, ikonom, ikony, ikonami, ikonach'),
  FILE: m('plik, pliku, plikowi, plik, plikiem, pliku, pliku', 'pliki, plików, plikom, pliki, plikami, plikach'),
  CLIPBOARD: m('schowek, schowka, schowkowi, schowek, schowkiem, schowku, schowku',
    'schowki, schowków, schowkom, schowki, schowkami, schowkach'),
  // A line of the console: *wiersz poleceń*, *wiersza* with -a.
  LINE: m('wiersz, wiersza, wierszowi, wiersz, wierszem, wierszu, wierszu',
    'wiersze, wierszy, wierszom, wiersze, wierszami, wierszach'),
  // The lines typed before, as Polish software says it (*historia poleceń*).
  HISTORY: f('historia, historii, historii, historię, historią, historii, historio'),
  WORKSPACE: m(
    'obszar roboczy, obszaru roboczego, obszarowi roboczemu, obszar roboczy, obszarem roboczym, obszarze roboczym, obszarze roboczy',
    'obszary robocze, obszarów roboczych, obszarom roboczym, obszary robocze, obszarami roboczymi, obszarach roboczych'),
  USAGE: n('użycie, użycia, użyciu, użycie, użyciem, użyciu, użycie'),
  EXAMPLE: m('przykład, przykładu, przykładowi, przykład, przykładem, przykładzie, przykładzie',
    'przykłady, przykładów, przykładom, przykłady, przykładami, przykładach'),
  CONSOLE: f('konsola, konsoli, konsoli, konsolę, konsolą, konsoli, konsolo', 'konsole, konsol, konsolom, konsole, konsolami, konsolach'),
  // The painter's canvas, as Spanish *lienzo* and Italian *tela*; *kanwa* is the HTML element's name. (verify)
  CANVAS: n('płótno, płótna, płótnu, płótno, płótnem, płótnie, płótno', 'płótna, płócien, płótnom, płótna, płótnami, płótnach'),
  PREVIEW: m('podgląd, podglądu, podglądowi, podgląd, podglądem, podglądzie, podglądzie',
    'podglądy, podglądów, podglądom, podglądy, podglądami, podglądach'),
  TOOLBAR: m(
    'pasek narzędzi, paska narzędzi, paskowi narzędzi, pasek narzędzi, paskiem narzędzi, pasku narzędzi, pasku narzędzi',
    'paski narzędzi, pasków narzędzi, paskom narzędzi, paski narzędzi, paskami narzędzi, paskach narzędzi'),
  LIST: f('lista, listy, liście, listę, listą, liście, listo', 'listy, list, listom, listy, listami, listach'),
  VALUE: f('wartość, wartości, wartości, wartość, wartością, wartości, wartości',
    'wartości, wartości, wartościom, wartości, wartościami, wartościach'),
  CURSOR: m('kursor, kursora, kursorowi, kursor, kursorem, kursorze, kursorze',
    'kursory, kursorów, kursorom, kursory, kursorami, kursorach'),
  TEXT: m('tekst, tekstu, tekstowi, tekst, tekstem, tekście, tekście', 'teksty, tekstów, tekstom, teksty, tekstami, tekstach'),
  REFERENCE: n('odwołanie, odwołania, odwołaniu, odwołanie, odwołaniem, odwołaniu, odwołanie',
    'odwołania, odwołań, odwołaniom, odwołania, odwołaniami, odwołaniach'),

  // Relations and abstractions.
  CAUSE: f('przyczyna, przyczyny, przyczynie, przyczynę, przyczyną, przyczynie, przyczyno',
    'przyczyny, przyczyn, przyczynom, przyczyny, przyczynami, przyczynach'),
  // Virile plural in -e (*posiadacze*), accusative = genitive *posiadaczy*.
  POSSESSOR: mp('posiadacz, posiadacza, posiadaczowi, posiadacza, posiadaczem, posiadaczu, posiadaczu',
    'posiadacze, posiadaczy, posiadaczom, posiadaczy, posiadaczami, posiadaczach', {
      ...paradigm('posiadaczka, posiadaczki, posiadaczce, posiadaczkę, posiadaczką, posiadaczce, posiadaczko',
        'posiadaczki, posiadaczek, posiadaczkom, posiadaczki, posiadaczkami, posiadaczkach', 'fem_'),
    }),
  // What one owns; *mienie* is the legal word. (verify)
  PROPERTY: f('własność, własności, własności, własność, własnością, własności, własności'),
  FEATURE: f('cecha, cechy, cesze, cechę, cechą, cesze, cecho', 'cechy, cech, cechom, cechy, cechami, cechach'),
  DOMAIN: f('dziedzina, dziedziny, dziedzinie, dziedzinę, dziedziną, dziedzinie, dziedzino',
    'dziedziny, dziedzin, dziedzinom, dziedziny, dziedzinami, dziedzinach'),
  // *środek, środka* (a means, *środek transportu*), inanimate.
  MEANS: m('środek, środka, środkowi, środek, środkiem, środku, środku', 'środki, środków, środkom, środki, środkami, środkach'),
  PURPOSE: m('cel, celu, celowi, cel, celem, celu, celu', 'cele, celów, celom, cele, celami, celach'),
  USE_NOUN: n('zastosowanie, zastosowania, zastosowaniu, zastosowanie, zastosowaniem, zastosowaniu, zastosowanie',
    'zastosowania, zastosowań, zastosowaniom, zastosowania, zastosowaniami, zastosowaniach'),
  WORK_NOUN: f('praca, pracy, pracy, pracę, pracą, pracy, praco'),
  // Research is plural in Polish (*badania naukowe*); the singular *badanie* is one examination. (verify)
  RESEARCH: pt('badania, badań, badaniom, badania, badaniami, badaniach'),
  // A piece of research written up; *studium* is indeclinable in the singular.
  STUDY_NOUN: n('studium, studium, studium, studium, studium, studium, studium',
    'studia, studiów, studiom, studia, studiami, studiach'),
  MATERIAL: m('materiał, materiału, materiałowi, materiał, materiałem, materiale, materiale',
    'materiały, materiałów, materiałom, materiały, materiałami, materiałach'),
  WOOD: n('drewno, drewna, drewnu, drewno, drewnem, drewnie, drewno'),
  LEVEL: m('poziom, poziomu, poziomowi, poziom, poziomem, poziomie, poziomie', 'poziomy, poziomów, poziomom, poziomy, poziomami, poziomach'),
  PROCESS: m('proces, procesu, procesowi, proces, procesem, procesie, procesie', 'procesy, procesów, procesom, procesy, procesami, procesach'),
  CHANGE_NOUN: f('zmiana, zmiany, zmianie, zmianę, zmianą, zmianie, zmiano', 'zmiany, zmian, zmianom, zmiany, zmianami, zmianach'),
  SYSTEM: m('system, systemu, systemowi, system, systemem, systemie, systemie', 'systemy, systemów, systemom, systemy, systemami, systemach'),
  PROGRAM_SOFTWARE: m('program, programu, programowi, program, programem, programie, programie',
    'programy, programów, programom, programy, programami, programach'),
  // A broadcast show is a *program* too (*program telewizyjny*); *audycja* is radio's. (verify)
  PROGRAM_SHOW: m('program, programu, programowi, program, programem, programie, programie',
    'programy, programów, programom, programy, programami, programach'),
  CONCEPT: n('pojęcie, pojęcia, pojęciu, pojęcie, pojęciem, pojęciu, pojęcie', 'pojęcia, pojęć, pojęciom, pojęcia, pojęciami, pojęciach'),
  // A thought or plan one has: *pomysł* (*mam pomysł*), not the philosophical *idea*.
  IDEA: m('pomysł, pomysłu, pomysłowi, pomysł, pomysłem, pomyśle, pomyśle', 'pomysły, pomysłów, pomysłom, pomysły, pomysłami, pomysłach'),
  // What a verb expresses, as school grammar says (*czasownik oznacza czynność*).
  ACTION: f('czynność, czynności, czynności, czynność, czynnością, czynności, czynności',
    'czynności, czynności, czynnościom, czynności, czynnościami, czynnościach'),
  EVENT: n('wydarzenie, wydarzenia, wydarzeniu, wydarzenie, wydarzeniem, wydarzeniu, wydarzenie',
    'wydarzenia, wydarzeń, wydarzeniom, wydarzenia, wydarzeniami, wydarzeniach'),
  RACE: m('wyścig, wyścigu, wyścigowi, wyścig, wyścigiem, wyścigu, wyścigu', 'wyścigi, wyścigów, wyścigom, wyścigi, wyścigami, wyścigach'),
  // *gra, gry, grze*; genitive plural *gier* with the inserted vowel.
  GAME: f('gra, gry, grze, grę, grą, grze, gro', 'gry, gier, grom, gry, grami, grach'),
  OBJECT_THING: m('przedmiot, przedmiotu, przedmiotowi, przedmiot, przedmiotem, przedmiocie, przedmiocie',
    'przedmioty, przedmiotów, przedmiotom, przedmioty, przedmiotami, przedmiotach'),
  DEVICE: n('urządzenie, urządzenia, urządzeniu, urządzenie, urządzeniem, urządzeniu, urządzenie',
    'urządzenia, urządzeń, urządzeniom, urządzenia, urządzeniami, urządzeniach'),
  BOMB: f('bomba, bomby, bombie, bombę, bombą, bombie, bombo', 'bomby, bomb, bombom, bomby, bombami, bombach'),
  THING: f('rzecz, rzeczy, rzeczy, rzecz, rzeczą, rzeczy, rzeczy', 'rzeczy, rzeczy, rzeczom, rzeczy, rzeczami, rzeczach'),
  PROBLEM: m('problem, problemu, problemowi, problem, problemem, problemie, problemie',
    'problemy, problemów, problemom, problemy, problemami, problemach'),
  ISSUE: f('kwestia, kwestii, kwestii, kwestię, kwestią, kwestii, kwestio', 'kwestie, kwestii, kwestiom, kwestie, kwestiami, kwestiach'),
  // *w tym przypadku*, the same word as the grammatical case.
  CASE_INSTANCE: m('przypadek, przypadku, przypadkowi, przypadek, przypadkiem, przypadku, przypadku',
    'przypadki, przypadków, przypadkom, przypadki, przypadkami, przypadkach'),
  BEING: f('istota, istoty, istocie, istotę, istotą, istocie, istoto', 'istoty, istot, istotom, istoty, istotami, istotach'),

  // The body.
  BODY: n('ciało, ciała, ciału, ciało, ciałem, ciele, ciało', 'ciała, ciał, ciałom, ciała, ciałami, ciałach'),
  // Anatomy's word; *organ* is also said.
  ORGAN: m('narząd, narządu, narządowi, narząd, narządem, narządzie, narządzie',
    'narządy, narządów, narządom, narządy, narządami, narządach'),
  TESTICLE: n('jądro, jądra, jądru, jądro, jądrem, jądrze, jądro', 'jądra, jąder, jądrom, jądra, jądrami, jądrach'),
  OVARY: m('jajnik, jajnika, jajnikowi, jajnik, jajnikiem, jajniku, jajniku', 'jajniki, jajników, jajnikom, jajniki, jajnikami, jajnikach'),
  MILK: n('mleko, mleka, mleku, mleko, mlekiem, mleku, mleko'),
  GRASS: f('trawa, trawy, trawie, trawę, trawą, trawie, trawo'),
  // The energy a hot thing gives off: *ciepło*; hot weather is *upał*.
  HEAT: n('ciepło, ciepła, ciepłu, ciepło, ciepłem, cieple, ciepło'),
  // The old dual survives: *oczy, oczu*; instrumental *oczami* (also *oczyma*).
  EYE: n('oko, oka, oku, oko, okiem, oku, oko', 'oczy, oczu, oczom, oczy, oczami, oczach'),
  // *ręka, ręce* (dat/loc sg and nom pl), genitive plural *rąk*; instrumental *rękami* (also *rękoma*).
  HAND: f('ręka, ręki, ręce, rękę, ręką, ręce, ręko', 'ręce, rąk, rękom, ręce, rękami, rękach'),
  HEAD: f('głowa, głowy, głowie, głowę, głową, głowie, głowo', 'głowy, głów, głowom, głowy, głowami, głowach'),
  FACE: f('twarz, twarzy, twarzy, twarz, twarzą, twarzy, twarzy', 'twarze, twarzy, twarzom, twarze, twarzami, twarzach'),
  // *plecy* is plural-only; the plural serves every cell.
  BACK_BODY: pt('plecy, pleców, plecom, plecy, plecami, plecach'),
  HEALTH: n('zdrowie, zdrowia, zdrowiu, zdrowie, zdrowiem, zdrowiu, zdrowie'),
  STORY: f('historia, historii, historii, historię, historią, historii, historio',
    'historie, historii, historiom, historie, historiami, historiach'),
  HISTORY_PAST: f('historia, historii, historii, historię, historią, historii, historio'),
  // The news is plural in Polish (*wiadomości*, *oglądać wiadomości*). (verify)
  NEWS: pt('wiadomości, wiadomości, wiadomościom, wiadomości, wiadomościami, wiadomościach'),
  SUBSTANCE: f('substancja, substancji, substancji, substancję, substancją, substancji, substancjo'),
  STATE: m('stan, stanu, stanowi, stan, stanem, stanie, stanie', 'stany, stanów, stanom, stany, stanami, stanach'),
  GAS: m('gaz, gazu, gazowi, gaz, gazem, gazie, gazie'),
  JOY: f('radość, radości, radości, radość, radością, radości, radości'),
  SORROW: m('smutek, smutku, smutkowi, smutek, smutkiem, smutku, smutku'),
  ERROR: m('błąd, błędu, błędowi, błąd, błędem, błędzie, błędzie', 'błędy, błędów, błędom, błędy, błędami, błędach'),
  REALITY: f('rzeczywistość, rzeczywistości, rzeczywistości, rzeczywistość, rzeczywistością, rzeczywistości, rzeczywistości',
    'rzeczywistości, rzeczywistości, rzeczywistościom, rzeczywistości, rzeczywistościami, rzeczywistościach'),
  REST: m('odpoczynek, odpoczynku, odpoczynkowi, odpoczynek, odpoczynkiem, odpoczynku, odpoczynku'),
  // *uwaga, uwadze* (g → dz before the dative/locative -e).
  ATTENTION: f('uwaga, uwagi, uwadze, uwagę, uwagą, uwadze, uwago'),
  ABILITY: f('zdolność, zdolności, zdolności, zdolność, zdolnością, zdolności, zdolności',
    'zdolności, zdolności, zdolnościom, zdolności, zdolnościami, zdolnościach'),
  DUTY: m('obowiązek, obowiązku, obowiązkowi, obowiązek, obowiązkiem, obowiązku, obowiązku',
    'obowiązki, obowiązków, obowiązkom, obowiązki, obowiązkami, obowiązkach'),
  // Kindness to others: *życzliwość*; *uprzejmość* is politeness. (verify)
  KINDNESS: f('życzliwość, życzliwości, życzliwości, życzliwość, życzliwością, życzliwości, życzliwości'),
  WISDOM: f('mądrość, mądrości, mądrości, mądrość, mądrością, mądrości, mądrości'),
  FOLLY: f('głupota, głupoty, głupocie, głupotę, głupotą, głupocie, głupoto'),
  LAND: f('ziemia, ziemi, ziemi, ziemię, ziemią, ziemi, ziemio'),

  // Society.
  NATION: m('naród, narodu, narodowi, naród, narodem, narodzie, narodzie', 'narody, narodów, narodom, narody, narodami, narodach'),
  SCHOOL: f('szkoła, szkoły, szkole, szkołę, szkołą, szkole, szkoło', 'szkoły, szkół, szkołom, szkoły, szkołami, szkołach'),
  // *student* is the university student; a school pupil is *uczeń*. (verify) which sense the concept wants
  STUDENT: mp('student, studenta, studentowi, studenta, studentem, studencie, studencie',
    'studenci, studentów, studentom, studentów, studentami, studentach', {
      ...paradigm('studentka, studentki, studentce, studentkę, studentką, studentce, studentko',
        'studentki, studentek, studentkom, studentki, studentkami, studentkach', 'fem_'),
    }),
  COMPANY_BUSINESS: f('firma, firmy, firmie, firmę, firmą, firmie, firmo', 'firmy, firm, firmom, firmy, firmami, firmach'),
  // People who play or work together: *zespół*; a sports side is *drużyna*.
  TEAM: m('zespół, zespołu, zespołowi, zespół, zespołem, zespole, zespole', 'zespoły, zespołów, zespołom, zespoły, zespołami, zespołach'),
  COMMUNITY: f('społeczność, społeczności, społeczności, społeczność, społecznością, społeczności, społeczności',
    'społeczności, społeczności, społecznościom, społeczności, społecznościami, społecznościach'),
  UNIVERSITY: m('uniwersytet, uniwersytetu, uniwersytetowi, uniwersytet, uniwersytetem, uniwersytecie, uniwersytecie',
    'uniwersytety, uniwersytetów, uniwersytetom, uniwersytety, uniwersytetami, uniwersytetach'),
  SERVICE: f('usługa, usługi, usłudze, usługę, usługą, usłudze, usługo', 'usługi, usług, usługom, usługi, usługami, usługach'),
  BUSINESS: m('handel, handlu, handlowi, handel, handlem, handlu, handlu'),
  STATE_NATION: n('państwo, państwa, państwu, państwo, państwem, państwie, państwo', 'państwa, państw, państwom, państwa, państwami, państwach'),
  POWER: f('władza, władzy, władzy, władzę, władzą, władzy, władzo', 'władze, władz, władzom, władze, władzami, władzach'),
  // *rząd, rządu* — ROW's *rząd* has *rzędu*.
  GOVERNMENT: m('rząd, rządu, rządowi, rząd, rządem, rządzie, rządzie', 'rządy, rządów, rządom, rządy, rządami, rządach'),
  PARTY_POLITICAL: f('partia, partii, partii, partię, partią, partii, partio', 'partie, partii, partiom, partie, partiami, partiach'),
  // A law a state makes: *ustawa*; *prawo* is RIGHT_NOUN (and the law as a whole). (verify)
  LAW: f('ustawa, ustawy, ustawie, ustawę, ustawą, ustawie, ustawo', 'ustawy, ustaw, ustawom, ustawy, ustawami, ustawach'),
  COURT_LAW: m('sąd, sądu, sądowi, sąd, sądem, sądzie, sądzie', 'sądy, sądów, sądom, sądy, sądami, sądach'),
  RIGHT_NOUN: n('prawo, prawa, prawu, prawo, prawem, prawie, prawo', 'prawa, praw, prawom, prawa, prawami, prawach'),
  // *wojna*, genitive plural *wojen* with the inserted vowel.
  WAR: f('wojna, wojny, wojnie, wojnę, wojną, wojnie, wojno', 'wojny, wojen, wojnom, wojny, wojnami, wojnach'),
  // *świat, świata, światu*, locative *świecie*.
  WORLD: m('świat, świata, światu, świat, światem, świecie, świecie', 'światy, światów, światom, światy, światami, światach'),
  PICTURE: m('obraz, obrazu, obrazowi, obraz, obrazem, obrazie, obrazie', 'obrazy, obrazów, obrazom, obrazy, obrazami, obrazach'),
  SCREEN: m('ekran, ekranu, ekranowi, ekran, ekranem, ekranie, ekranie', 'ekrany, ekranów, ekranom, ekrany, ekranami, ekranach'),
  PART: f('część, części, części, część, częścią, części, części', 'części, części, częściom, części, częściami, częściach'),
};
