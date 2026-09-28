import type { LanguageColumn } from '../types.js';
import { f, m, ma, mp, n, noun, paradigm } from './helpers.js';

// Polish nouns, part A (P05-E4): animals, the dimensions and spatial nouns, people and the family.
// Every case is stored (style-pl.md): the singular nom, gen, dat, acc, ins, loc, voc and the plural
// nom, gen, dat, acc, ins, loc. `ma` is a masculine animal (acc = gen), `mp` a masculine person
// (acc = gen, virile plural); a masculine in *-a* (*mężczyzna, odbiorca*) is virile but its accusative
// is its own (*mężczyznę*), so it is written with `noun('masc', …, { virile: '1' })`, no `animate_acc`.
// A person or animal whose Spanish entry has a feminine carries the Polish feminine under `fem_`; where
// Polish has no separate feminine (*małpa, kaczka*), the epicene word is repeated there. Every form is
// (verify) until the native review (P05-E11); the marked ones are the choices most worth a second look.

/** A virile masculine in *-a* or with an accusative of its own: *mężczyzna → mężczyznę*. */
const mv = (sg: string, pl: string) => noun('masc', sg, pl, { virile: '1' });
/** A plurale tantum (*pieniądze, drzwi, lody*): the plural in every cell, singular ones included. */
const pt = (pl: string, voc: string) => {
  const [nom, gen, dat, acc, ins, loc] = pl.split(',').map((s) => s.trim());
  return noun('masc', `${nom}, ${gen}, ${dat}, ${acc}, ${ins}, ${loc}, ${voc}`, pl, { plurale_tantum: '1' });
};

export const PL_NOUNS_A: LanguageColumn = {
  // ── Animals ──────────────────────────────────────────────────
  ANIMAL: n('zwierzę, zwierzęcia, zwierzęciu, zwierzę, zwierzęciem, zwierzęciu, zwierzę', 'zwierzęta, zwierząt, zwierzętom, zwierzęta, zwierzętami, zwierzętach'),
  MAMMAL: ma('ssak, ssaka, ssakowi, ssaka, ssakiem, ssaku, ssaku', 'ssaki, ssaków, ssakom, ssaki, ssakami, ssakach'),
  // The zoological *kotowate* (Felidae), a substantivised adjective; *kot* is CAT.
  FELINE: ma('kotowaty, kotowatego, kotowatemu, kotowatego, kotowatym, kotowatym, kotowaty', 'kotowate, kotowatych, kotowatym, kotowate, kotowatymi, kotowatych'), // (verify) singular *kotowaty*
  CAT: ma('kot, kota, kotu, kota, kotem, kocie, kocie', 'koty, kotów, kotom, koty, kotami, kotach',
    paradigm('kotka, kotki, kotce, kotkę, kotką, kotce, kotko', 'kotki, kotek, kotkom, kotki, kotkami, kotkach', 'fem_')),
  DOG: ma('pies, psa, psu, psa, psem, psie, psie', 'psy, psów, psom, psy, psami, psach',
    paradigm('suka, suki, suce, sukę, suką, suce, suko', 'suki, suk, sukom, suki, sukami, sukach', 'fem_')),
  BIRD: ma('ptak, ptaka, ptakowi, ptaka, ptakiem, ptaku, ptaku', 'ptaki, ptaków, ptakom, ptaki, ptakami, ptakach'),
  FISH: f('ryba, ryby, rybie, rybę, rybą, rybie, rybo', 'ryby, ryb, rybom, ryby, rybami, rybach'),
  REPTILE: ma('gad, gada, gadowi, gada, gadem, gadzie, gadzie', 'gady, gadów, gadom, gady, gadami, gadach'),
  AMPHIBIAN: ma('płaz, płaza, płazowi, płaza, płazem, płazie, płazie', 'płazy, płazów, płazom, płazy, płazami, płazach'),
  INSECT: ma('owad, owada, owadowi, owada, owadem, owadzie, owadzie', 'owady, owadów, owadom, owady, owadami, owadach'),
  HORSE: ma('koń, konia, koniowi, konia, koniem, koniu, koniu', 'konie, koni, koniom, konie, końmi, koniach',
    paradigm('klacz, klaczy, klaczy, klacz, klaczą, klaczy, klaczy', 'klacze, klaczy, klaczom, klacze, klaczami, klaczach', 'fem_')),
  // *świnia* is the generic word (feminine); the sow is *maciora*.
  PIG: f('świnia, świni, świni, świnię, świnią, świni, świnio', 'świnie, świń, świniom, świnie, świniami, świniach',
    paradigm('maciora, maciory, maciorze, maciorę, maciorą, maciorze, macioro', 'maciory, macior, maciorom, maciory, maciorami, maciorach', 'fem_')), // (verify) fem *maciora* vs *locha*
  SHEEP: f('owca, owcy, owcy, owcę, owcą, owcy, owco', 'owce, owiec, owcom, owce, owcami, owcach'),
  GOAT: f('koza, kozy, kozie, kozę, kozą, kozie, kozo', 'kozy, kóz, kozom, kozy, kozami, kozach'),
  RABBIT: ma('królik, królika, królikowi, królika, królikiem, króliku, króliku', 'króliki, królików, królikom, króliki, królikami, królikach',
    paradigm('królica, królicy, królicy, królicę, królicą, królicy, królico', 'królice, królic, królicom, królice, królicami, królicach', 'fem_')), // (verify) fem *królica*
  BEAR: ma('niedźwiedź, niedźwiedzia, niedźwiedziowi, niedźwiedzia, niedźwiedziem, niedźwiedziu, niedźwiedziu', 'niedźwiedzie, niedźwiedzi, niedźwiedziom, niedźwiedzie, niedźwiedziami, niedźwiedziach',
    paradigm('niedźwiedzica, niedźwiedzicy, niedźwiedzicy, niedźwiedzicę, niedźwiedzicą, niedźwiedzicy, niedźwiedzico', 'niedźwiedzice, niedźwiedzic, niedźwiedzicom, niedźwiedzice, niedźwiedzicami, niedźwiedzicach', 'fem_')),
  LION: ma('lew, lwa, lwu, lwa, lwem, lwie, lwie', 'lwy, lwów, lwom, lwy, lwami, lwach',
    paradigm('lwica, lwicy, lwicy, lwicę, lwicą, lwicy, lwico', 'lwice, lwic, lwicom, lwice, lwicami, lwicach', 'fem_')),
  TIGER: ma('tygrys, tygrysa, tygrysowi, tygrysa, tygrysem, tygrysie, tygrysie', 'tygrysy, tygrysów, tygrysom, tygrysy, tygrysami, tygrysach',
    paradigm('tygrysica, tygrysicy, tygrysicy, tygrysicę, tygrysicą, tygrysicy, tygrysico', 'tygrysice, tygrysic, tygrysicom, tygrysice, tygrysicami, tygrysicach', 'fem_')),
  LEOPARD: ma('lampart, lamparta, lampartowi, lamparta, lampartem, lamparcie, lamparcie', 'lamparty, lampartów, lampartom, lamparty, lampartami, lampartach',
    paradigm('lamparcica, lamparcicy, lamparcicy, lamparcicę, lamparcicą, lamparcicy, lamparcico', 'lamparcice, lamparcic, lamparcicom, lamparcice, lamparcicami, lamparcicach', 'fem_')), // (verify) fem *lamparcica*
  PANTHER: f('pantera, pantery, panterze, panterę, panterą, panterze, pantero', 'pantery, panter, panterom, pantery, panterami, panterach'),
  PUMA: f('puma, pumy, pumie, pumę, pumą, pumie, pumo', 'pumy, pum, pumom, pumy, pumami, pumach'),
  CHEETAH: ma('gepard, geparda, gepardowi, geparda, gepardem, gepardzie, gepardzie', 'gepardy, gepardów, gepardom, gepardy, gepardami, gepardach'),
  ELEPHANT: ma('słoń, słonia, słoniowi, słonia, słoniem, słoniu, słoniu', 'słonie, słoni, słoniom, słonie, słoniami, słoniach',
    paradigm('słonica, słonicy, słonicy, słonicę, słonicą, słonicy, słonico', 'słonice, słonic, słonicom, słonice, słonicami, słonicach', 'fem_')),
  // *małpa* is epicene: the feminine repeats it.
  MONKEY: f('małpa, małpy, małpie, małpę, małpą, małpie, małpo', 'małpy, małp, małpom, małpy, małpami, małpach',
    paradigm('małpa, małpy, małpie, małpę, małpą, małpie, małpo', 'małpy, małp, małpom, małpy, małpami, małpach', 'fem_')),
  DEER: ma('jeleń, jelenia, jeleniowi, jelenia, jeleniem, jeleniu, jeleniu', 'jelenie, jeleni, jeleniom, jelenie, jeleniami, jeleniach',
    paradigm('łania, łani, łani, łanię, łanią, łani, łanio', 'łanie, łań, łaniom, łanie, łaniami, łaniach', 'fem_')),
  WHALE: ma('wieloryb, wieloryba, wielorybowi, wieloryba, wielorybem, wielorybie, wielorybie', 'wieloryby, wielorybów, wielorybom, wieloryby, wielorybami, wielorybach'),
  CHICKEN: f('kura, kury, kurze, kurę, kurą, kurze, kuro', 'kury, kur, kurom, kury, kurami, kurach'),
  // *kaczka* is the generic word and the female (the drake is *kaczor*): the feminine repeats it.
  DUCK: f('kaczka, kaczki, kaczce, kaczkę, kaczką, kaczce, kaczko', 'kaczki, kaczek, kaczkom, kaczki, kaczkami, kaczkach',
    paradigm('kaczka, kaczki, kaczce, kaczkę, kaczką, kaczce, kaczko', 'kaczki, kaczek, kaczkom, kaczki, kaczkami, kaczkach', 'fem_')),
  EAGLE: ma('orzeł, orła, orłu, orła, orłem, orle, orle', 'orły, orłów, orłom, orły, orłami, orłach'),
  OWL: f('sowa, sowy, sowie, sowę, sową, sowie, sowo', 'sowy, sów, sowom, sowy, sowami, sowach'),
  PENGUIN: ma('pingwin, pingwina, pingwinowi, pingwina, pingwinem, pingwinie, pingwinie', 'pingwiny, pingwinów, pingwinom, pingwiny, pingwinami, pingwinach'),
  SHARK: ma('rekin, rekina, rekinowi, rekina, rekinem, rekinie, rekinie', 'rekiny, rekinów, rekinom, rekiny, rekinami, rekinach'),
  SALMON: ma('łosoś, łososia, łososiowi, łososia, łososiem, łososiu, łososiu', 'łososie, łososi, łososiom, łososie, łososiami, łososiach'),
  SNAKE: ma('wąż, węża, wężowi, węża, wężem, wężu, wężu', 'węże, węży, wężom, węże, wężami, wężach'),
  TURTLE: ma('żółw, żółwia, żółwiowi, żółwia, żółwiem, żółwiu, żółwiu', 'żółwie, żółwi, żółwiom, żółwie, żółwiami, żółwiach'),
  CROCODILE: ma('krokodyl, krokodyla, krokodylowi, krokodyla, krokodylem, krokodylu, krokodylu', 'krokodyle, krokodyli, krokodylom, krokodyle, krokodylami, krokodylach'),
  LIZARD: f('jaszczurka, jaszczurki, jaszczurce, jaszczurkę, jaszczurką, jaszczurce, jaszczurko', 'jaszczurki, jaszczurek, jaszczurkom, jaszczurki, jaszczurkami, jaszczurkach'),
  FROG: f('żaba, żaby, żabie, żabę, żabą, żabie, żabo', 'żaby, żab, żabom, żaby, żabami, żabach'),
  BEE: f('pszczoła, pszczoły, pszczole, pszczołę, pszczołą, pszczole, pszczoło', 'pszczoły, pszczół, pszczołom, pszczoły, pszczołami, pszczołach'),
  ANT: f('mrówka, mrówki, mrówce, mrówkę, mrówką, mrówce, mrówko', 'mrówki, mrówek, mrówkom, mrówki, mrówkami, mrówkach'),
  BUTTERFLY: ma('motyl, motyla, motylowi, motyla, motylem, motylu, motylu', 'motyle, motyli, motylom, motyle, motylami, motylach'),
  MOSQUITO: ma('komar, komara, komarowi, komara, komarem, komarze, komarze', 'komary, komarów, komarom, komary, komarami, komarach'),
  SPIDER: ma('pająk, pająka, pająkowi, pająka, pająkiem, pająku, pająku', 'pająki, pająków, pająkom, pająki, pająkami, pająkach'),
  FOX: ma('lis, lisa, lisowi, lisa, lisem, lisie, lisie', 'lisy, lisów, lisom, lisy, lisami, lisach',
    paradigm('lisica, lisicy, lisicy, lisicę, lisicą, lisicy, lisico', 'lisice, lisic, lisicom, lisice, lisicami, lisicach', 'fem_')),
  WOLF: ma('wilk, wilka, wilkowi, wilka, wilkiem, wilku, wilku', 'wilki, wilków, wilkom, wilki, wilkami, wilkach',
    paradigm('wilczyca, wilczycy, wilczycy, wilczycę, wilczycą, wilczycy, wilczyco', 'wilczyce, wilczyc, wilczycom, wilczyce, wilczycami, wilczycach', 'fem_')),
  // Polish counts cattle as *bydło* (a collective); the count noun is *bydlę*, which is also a
  // term of abuse in figurative use.
  BOVINE: n('bydlę, bydlęcia, bydlęciu, bydlę, bydlęciem, bydlęciu, bydlę', 'bydlęta, bydląt, bydlętom, bydlęta, bydlętami, bydlętach'), // (verify) word choice
  COW: f('krowa, krowy, krowie, krowę, krową, krowie, krowo', 'krowy, krów, krowom, krowy, krowami, krowach'),
  OX: ma('wół, wołu, wołowi, wołu, wołem, wole, wole', 'woły, wołów, wołom, woły, wołami, wołach'),
  MOUSE: f('mysz, myszy, myszy, mysz, myszą, myszy, myszy', 'myszy, myszy, myszom, myszy, myszami, myszach'),
  FLY_INSECT: f('mucha, muchy, musze, muchę, muchą, musze, mucho', 'muchy, much, muchom, muchy, muchami, muchach'),

  // ── Things, substances, dimensions ───────────────────────────
  BOOK: f('książka, książki, książce, książkę, książką, książce, książko', 'książki, książek, książkom, książki, książkami, książkach'),
  AIR: n('powietrze, powietrza, powietrzu, powietrze, powietrzem, powietrzu, powietrze'),
  // The surface one stands or falls on (*upaść na ziemię*); *podłoga* is a floor indoors.
  GROUND: f('ziemia, ziemi, ziemi, ziemię, ziemią, ziemi, ziemio', 'ziemie, ziem, ziemiom, ziemie, ziemiami, ziemiach'), // (verify) shares *ziemia* with the soil/earth sense
  WATER: f('woda, wody, wodzie, wodę, wodą, wodzie, wodo'),
  SPEED: f('prędkość, prędkości, prędkości, prędkość, prędkością, prędkości, prędkości', 'prędkości, prędkości, prędkościom, prędkości, prędkościami, prędkościach'),
  LIGHT: n('światło, światła, światłu, światło, światłem, świetle, światło', 'światła, świateł, światłom, światła, światłami, światłach'),
  SOUND: m('dźwięk, dźwięku, dźwiękowi, dźwięk, dźwiękiem, dźwięku, dźwięku', 'dźwięki, dźwięków, dźwiękom, dźwięki, dźwiękami, dźwiękach'),
  WAY: m('sposób, sposobu, sposobowi, sposób, sposobem, sposobie, sposobie', 'sposoby, sposobów, sposobom, sposoby, sposobami, sposobach'),
  // Time as it passes; "an occasion" is *raz* in Polish (*innym razem*), not stored here.
  TIME: m('czas, czasu, czasowi, czas, czasem, czasie, czasie', 'czasy, czasów, czasom, czasy, czasami, czasach'), // (verify) the occasion sense
  // Sorgfalt, "with care" = *ze starannością*.
  CARE: f('staranność, staranności, staranności, staranność, starannością, staranności, staranności'), // (verify) vs *troska*, *uwaga*
  SIZE: m('rozmiar, rozmiaru, rozmiarowi, rozmiar, rozmiarem, rozmiarze, rozmiarze', 'rozmiary, rozmiarów, rozmiarom, rozmiary, rozmiarami, rozmiarach'), // (verify) vs *wielkość*
  HEIGHT: f('wysokość, wysokości, wysokości, wysokość, wysokością, wysokości, wysokości', 'wysokości, wysokości, wysokościom, wysokości, wysokościami, wysokościach'),
  LENGTH: f('długość, długości, długości, długość, długością, długości, długości', 'długości, długości, długościom, długości, długościami, długościach'),
  QUALITY: f('jakość, jakości, jakości, jakość, jakością, jakości, jakości', 'jakości, jakości, jakościom, jakości, jakościami, jakościach'),
  STRENGTH: f('siła, siły, sile, siłę, siłą, sile, siło', 'siły, sił, siłom, siły, siłami, siłach'),
  AGE: m('wiek, wieku, wiekowi, wiek, wiekiem, wieku, wieku', 'wieki, wieków, wiekom, wieki, wiekami, wiekach'),
  TEMPERATURE: f('temperatura, temperatury, temperaturze, temperaturę, temperaturą, temperaturze, temperaturo', 'temperatury, temperatur, temperaturom, temperatury, temperaturami, temperaturach'),
  DISTANCE: f('odległość, odległości, odległości, odległość, odległością, odległości, odległości', 'odległości, odległości, odległościom, odległości, odległościami, odległościach'),
  SHAPE: m('kształt, kształtu, kształtowi, kształt, kształtem, kształcie, kształcie', 'kształty, kształtów, kształtom, kształty, kształtami, kształtach'),
  // The round figure (*koło*); *okrąg* is its outline only.
  CIRCLE: n('koło, koła, kołu, koło, kołem, kole, koło', 'koła, kół, kołom, koła, kołami, kołach'), // (verify) vs *okrąg*
  LINE_MARK: f('linia, linii, linii, linię, linią, linii, linio', 'linie, linii, liniom, linie, liniami, liniach'),
  // Plurale tantum: *te pieniądze są*.
  MONEY: pt('pieniądze, pieniędzy, pieniądzom, pieniądze, pieniędzmi, pieniądzach', 'pieniądze'),
  FOOD: n('jedzenie, jedzenia, jedzeniu, jedzenie, jedzeniem, jedzeniu, jedzenie'),
  // Plurale tantum in the standard language (*jem lody*); the singular *lód* is ice.
  ICE_CREAM: pt('lody, lodów, lodom, lody, lodami, lodach', 'lody'), // (verify)
  SUGAR: m('cukier, cukru, cukrowi, cukier, cukrem, cukrze, cukrze'),
  LIQUID: m('płyn, płynu, płynowi, płyn, płynem, płynie, płynie'),
  CONTENT: f('zawartość, zawartości, zawartości, zawartość, zawartością, zawartości, zawartości', 'zawartości, zawartości, zawartościom, zawartości, zawartościami, zawartościach'),
  STICK: m('kij, kija, kijowi, kij, kijem, kiju, kiju', 'kije, kijów, kijom, kije, kijami, kijach'),
  ARROW_PROJECTILE: f('strzała, strzały, strzale, strzałę, strzałą, strzale, strzało', 'strzały, strzał, strzałom, strzały, strzałami, strzałach'),
  BLADE: n('ostrze, ostrza, ostrzu, ostrze, ostrzem, ostrzu, ostrze', 'ostrza, ostrzy, ostrzom, ostrza, ostrzami, ostrzach'),
  FIRE: m('ogień, ognia, ogniowi, ogień, ogniem, ogniu, ogniu', 'ognie, ogni, ogniom, ognie, ogniami, ogniach'),
  FLAME: m('płomień, płomienia, płomieniowi, płomień, płomieniem, płomieniu, płomieniu', 'płomienie, płomieni, płomieniom, płomienie, płomieniami, płomieniach'),

  // ── Places and space ─────────────────────────────────────────
  PLACE: n('miejsce, miejsca, miejscu, miejsce, miejscem, miejscu, miejsce', 'miejsca, miejsc, miejscom, miejsca, miejscami, miejscach'),
  POINT_NOUN: m('punkt, punktu, punktowi, punkt, punktem, punkcie, punkcie', 'punkty, punktów, punktom, punkty, punktami, punktach'),
  AREA: m('obszar, obszaru, obszarowi, obszar, obszarem, obszarze, obszarze', 'obszary, obszarów, obszarom, obszary, obszarami, obszarach'), // (verify) vs *okolica*, *rejon*
  CENTER: m('środek, środka, środkowi, środek, środkiem, środku, środku', 'środki, środków, środkom, środki, środkami, środkach'),
  SIDE: f('strona, strony, stronie, stronę, stroną, stronie, strono', 'strony, stron, stronom, strony, stronami, stronach'),
  // *miejsce docelowe*, not *cel*: *cel* is PURPOSE's, and the two definitions would read alike (the
  // sweep's "no two concepts glossed alike") (verify).
  DESTINATION: n('miejsce docelowe, miejsca docelowego, miejscu docelowemu, miejsce docelowe, miejscem docelowym, miejscu docelowym, miejsce docelowe',
    'miejsca docelowe, miejsc docelowych, miejscom docelowym, miejsca docelowe, miejscami docelowymi, miejscach docelowych'),
  // A head with a genitive complement: only *punkt* declines.
  ORIGIN: m('punkt wyjścia, punktu wyjścia, punktowi wyjścia, punkt wyjścia, punktem wyjścia, punkcie wyjścia, punkcie wyjścia', 'punkty wyjścia, punktów wyjścia, punktom wyjścia, punkty wyjścia, punktami wyjścia, punktach wyjścia'),
  // The route a motion takes (es *recorrido*, it *percorso*).
  PATH: f('trasa, trasy, trasie, trasę, trasą, trasie, traso', 'trasy, tras, trasom, trasy, trasami, trasach'), // (verify) vs *droga*
  DIRECTION_SPACE: m('kierunek, kierunku, kierunkowi, kierunek, kierunkiem, kierunku, kierunku', 'kierunki, kierunków, kierunkom, kierunki, kierunkami, kierunkach'),
  BUILDING: m('budynek, budynku, budynkowi, budynek, budynkiem, budynku, budynku', 'budynki, budynków, budynkom, budynki, budynkami, budynkach'),
  WALL: f('ściana, ściany, ścianie, ścianę, ścianą, ścianie, ściano', 'ściany, ścian, ścianom, ściany, ścianami, ścianach'),
  HOUSE: m('dom, domu, domowi, dom, domem, domu, domu', 'domy, domów, domom, domy, domami, domach'),
  // Polish says *dom* for both the building and the home, as Italian says *casa*.
  HOME: m('dom, domu, domowi, dom, domem, domu, domu', 'domy, domów, domom, domy, domami, domach'), // (verify) same word as HOUSE
  ROOM: m('pokój, pokoju, pokojowi, pokój, pokojem, pokoju, pokoju', 'pokoje, pokoi, pokojom, pokoje, pokojami, pokojach'),
  OFFICE: n('biuro, biura, biuru, biuro, biurem, biurze, biuro', 'biura, biur, biurom, biura, biurami, biurach'),
  // Plurale tantum: *te drzwi są otwarte*, one door or several.
  DOOR: pt('drzwi, drzwi, drzwiom, drzwi, drzwiami, drzwiach', 'drzwi'),
  CAR: m('samochód, samochodu, samochodowi, samochód, samochodem, samochodzie, samochodzie', 'samochody, samochodów, samochodom, samochody, samochodami, samochodach'),

  // ── People ───────────────────────────────────────────────────
  // *dziecko* is neuter and its plural *dzieci* non-virile; the girl is *dziewczynka*.
  CHILD: n('dziecko, dziecka, dziecku, dziecko, dzieckiem, dziecku, dziecko', 'dzieci, dzieci, dzieciom, dzieci, dziećmi, dzieciach',
    paradigm('dziewczynka, dziewczynki, dziewczynce, dziewczynkę, dziewczynką, dziewczynce, dziewczynko', 'dziewczynki, dziewczynek, dziewczynkom, dziewczynki, dziewczynkami, dziewczynkach', 'fem_')),
  // Casual *dzieciak*: animate (acc *dzieciaka*) but its plural *dzieciaki* is non-virile.
  KID: ma('dzieciak, dzieciaka, dzieciakowi, dzieciaka, dzieciakiem, dzieciaku, dzieciaku', 'dzieciaki, dzieciaków, dzieciakom, dzieciaki, dzieciakami, dzieciakach',
    paradigm('dziewczynka, dziewczynki, dziewczynce, dziewczynkę, dziewczynką, dziewczynce, dziewczynko', 'dziewczynki, dziewczynek, dziewczynkom, dziewczynki, dziewczynkami, dziewczynkach', 'fem_')), // (verify) the casual feminine
  PERSON: f('osoba, osoby, osobie, osobę, osobą, osobie, osobo', 'osoby, osób, osobom, osoby, osobami, osobach'),
  // The one speaking, a substantivised participle (*mówca* is an orator).
  SPEAKER: mp('mówiący, mówiącego, mówiącemu, mówiącego, mówiącym, mówiącym, mówiący', 'mówiący, mówiących, mówiącym, mówiących, mówiącymi, mówiących',
    paradigm('mówiąca, mówiącej, mówiącej, mówiącą, mówiącą, mówiącej, mówiąca', 'mówiące, mówiących, mówiącym, mówiące, mówiącymi, mówiących', 'fem_')), // (verify) vs *mówca*
  COMPANION: mp('towarzysz, towarzysza, towarzyszowi, towarzysza, towarzyszem, towarzyszu, towarzyszu', 'towarzysze, towarzyszy, towarzyszom, towarzyszy, towarzyszami, towarzyszach',
    paradigm('towarzyszka, towarzyszki, towarzyszce, towarzyszkę, towarzyszką, towarzyszce, towarzyszko', 'towarzyszki, towarzyszek, towarzyszkom, towarzyszki, towarzyszkami, towarzyszkach', 'fem_')),
  RECIPIENT: noun('masc', 'odbiorca, odbiorcy, odbiorcy, odbiorcę, odbiorcą, odbiorcy, odbiorco', 'odbiorcy, odbiorców, odbiorcom, odbiorców, odbiorcami, odbiorcach', {
    virile: '1',
    ...paradigm('odbiorczyni, odbiorczyni, odbiorczyni, odbiorczynię, odbiorczynią, odbiorczyni, odbiorczyni', 'odbiorczynie, odbiorczyń, odbiorczyniom, odbiorczynie, odbiorczyniami, odbiorczyniach', 'fem_'),
  }),
  BOY: mp('chłopiec, chłopca, chłopcu, chłopca, chłopcem, chłopcu, chłopcze', 'chłopcy, chłopców, chłopcom, chłopców, chłopcami, chłopcach'),
  // A young female, as *chłopiec* is a young male; the small girl is *dziewczynka*.
  GIRL: f('dziewczyna, dziewczyny, dziewczynie, dziewczynę, dziewczyną, dziewczynie, dziewczyno', 'dziewczyny, dziewczyn, dziewczynom, dziewczyny, dziewczynami, dziewczynach'), // (verify) vs *dziewczynka*
  MAN: mv('mężczyzna, mężczyzny, mężczyźnie, mężczyznę, mężczyzną, mężczyźnie, mężczyzno', 'mężczyźni, mężczyzn, mężczyznom, mężczyzn, mężczyznami, mężczyznach'),
  GUY: mp('facet, faceta, facetowi, faceta, facetem, facecie, facecie', 'faceci, facetów, facetom, facetów, facetami, facetach'),
  WOMAN: f('kobieta, kobiety, kobiecie, kobietę, kobietą, kobiecie, kobieto', 'kobiety, kobiet, kobietom, kobiety, kobietami, kobietach'),
  BUTCHER: mp('rzeźnik, rzeźnika, rzeźnikowi, rzeźnika, rzeźnikiem, rzeźniku, rzeźniku', 'rzeźnicy, rzeźników, rzeźnikom, rzeźników, rzeźnikami, rzeźnikach',
    paradigm('rzeźniczka, rzeźniczki, rzeźniczce, rzeźniczkę, rzeźniczką, rzeźniczce, rzeźniczko', 'rzeźniczki, rzeźniczek, rzeźniczkom, rzeźniczki, rzeźniczkami, rzeźniczkach', 'fem_')), // (verify) fem *rzeźniczka*
  // *aniołowie* (virile) is the standard plural; *anioły* is also heard.
  ANGEL: mp('anioł, anioła, aniołowi, anioła, aniołem, aniele, aniele', 'aniołowie, aniołów, aniołom, aniołów, aniołami, aniołach'), // (verify) virile vs *anioły*

  // ── Life, feelings ───────────────────────────────────────────
  LIFE: n('życie, życia, życiu, życie, życiem, życiu, życie', 'życia, żyć, życiom, życia, życiami, życiach'),
  END: m('koniec, końca, końcowi, koniec, końcem, końcu, końcu', 'końce, końców, końcom, końce, końcami, końcach'),
  BEGINNING: m('początek, początku, początkowi, początek, początkiem, początku, początku', 'początki, początków, początkom, początki, początkami, początkach'),
  DEATH: f('śmierć, śmierci, śmierci, śmierć, śmiercią, śmierci, śmierci', 'śmierci, śmierci, śmierciom, śmierci, śmierciami, śmierciach'),
  FEELING: n('uczucie, uczucia, uczuciu, uczucie, uczuciem, uczuciu, uczucie', 'uczucia, uczuć, uczuciom, uczucia, uczuciami, uczuciach'),
  // *uczucie* is FEELING; fondness toward someone is *przywiązanie*.
  AFFECTION: n('przywiązanie, przywiązania, przywiązaniu, przywiązanie, przywiązaniem, przywiązaniu, przywiązanie'), // (verify) vs *sympatia*, *czułość*

  // ── The family ───────────────────────────────────────────────
  FAMILY: f('rodzina, rodziny, rodzinie, rodzinę, rodziną, rodzinie, rodzino', 'rodziny, rodzin, rodzinom, rodziny, rodzinami, rodzinach'),
  // *rodzic* has no feminine of its own: a female parent is *matka*.
  PARENT: mp('rodzic, rodzica, rodzicowi, rodzica, rodzicem, rodzicu, rodzicu', 'rodzice, rodziców, rodzicom, rodziców, rodzicami, rodzicach',
    paradigm('matka, matki, matce, matkę, matką, matce, matko', 'matki, matek, matkom, matki, matkami, matkach', 'fem_')), // (verify) fem *matka* vs *rodzicielka*
  FATHER: mp('ojciec, ojca, ojcu, ojca, ojcem, ojcu, ojcze', 'ojcowie, ojców, ojcom, ojców, ojcami, ojcach'),
  MOTHER: f('matka, matki, matce, matkę, matką, matce, matko', 'matki, matek, matkom, matki, matkami, matkach'),
  // A substantivised adjective.
  RELATIVE: mp('krewny, krewnego, krewnemu, krewnego, krewnym, krewnym, krewny', 'krewni, krewnych, krewnym, krewnych, krewnymi, krewnych',
    paradigm('krewna, krewnej, krewnej, krewną, krewną, krewnej, krewna', 'krewne, krewnych, krewnym, krewne, krewnymi, krewnych', 'fem_')),
  // Someone's child; the feminine is the daughter.
  CHILD_OFFSPRING: n('dziecko, dziecka, dziecku, dziecko, dzieckiem, dziecku, dziecko', 'dzieci, dzieci, dzieciom, dzieci, dziećmi, dzieciach',
    paradigm('córka, córki, córce, córkę, córką, córce, córko', 'córki, córek, córkom, córki, córkami, córkach', 'fem_')), // (verify) fem *córka*
  SON: mp('syn, syna, synowi, syna, synem, synu, synu', 'synowie, synów, synom, synów, synami, synach'),
  DAUGHTER: f('córka, córki, córce, córkę, córką, córce, córko', 'córki, córek, córkom, córki, córkami, córkach'),
  // Polish has no singular for a sibling (*rodzeństwo* is the set): brother, and sister as the feminine,
  // as Spanish *hermano/hermana*.
  SIBLING: mp('brat, brata, bratu, brata, bratem, bracie, bracie', 'bracia, braci, braciom, braci, braćmi, braciach',
    paradigm('siostra, siostry, siostrze, siostrę, siostrą, siostrze, siostro', 'siostry, sióstr, siostrom, siostry, siostrami, siostrach', 'fem_')), // (verify)
  BROTHER: mp('brat, brata, bratu, brata, bratem, bracie, bracie', 'bracia, braci, braciom, braci, braćmi, braciach'),
  SISTER: f('siostra, siostry, siostrze, siostrę, siostrą, siostrze, siostro', 'siostry, sióstr, siostrom, siostry, siostrami, siostrach'),
  SPOUSE: mp('małżonek, małżonka, małżonkowi, małżonka, małżonkiem, małżonku, małżonku', 'małżonkowie, małżonków, małżonkom, małżonków, małżonkami, małżonkach',
    paradigm('małżonka, małżonki, małżonce, małżonkę, małżonką, małżonce, małżonko', 'małżonki, małżonek, małżonkom, małżonki, małżonkami, małżonkach', 'fem_')),
  HUSBAND: mp('mąż, męża, mężowi, męża, mężem, mężu, mężu', 'mężowie, mężów, mężom, mężów, mężami, mężach'),
  WIFE: f('żona, żony, żonie, żonę, żoną, żonie, żono', 'żony, żon, żonom, żony, żonami, żonach'),
  // Grandfather and grandmother, as Spanish *abuelo/abuela*.
  GRANDPARENT: mp('dziadek, dziadka, dziadkowi, dziadka, dziadkiem, dziadku, dziadku', 'dziadkowie, dziadków, dziadkom, dziadków, dziadkami, dziadkach',
    paradigm('babcia, babci, babci, babcię, babcią, babci, babciu', 'babcie, babć, babciom, babcie, babciami, babciach', 'fem_')),
  GRANDFATHER: mp('dziadek, dziadka, dziadkowi, dziadka, dziadkiem, dziadku, dziadku', 'dziadkowie, dziadków, dziadkom, dziadków, dziadkami, dziadkach'),
  GRANDMOTHER: f('babcia, babci, babci, babcię, babcią, babci, babciu', 'babcie, babć, babciom, babcie, babciami, babciach'), // (verify) *babcia* vs the formal *babka*
  GRANDCHILD: mp('wnuk, wnuka, wnukowi, wnuka, wnukiem, wnuku, wnuku', 'wnukowie, wnuków, wnukom, wnuków, wnukami, wnukach',
    paradigm('wnuczka, wnuczki, wnuczce, wnuczkę, wnuczką, wnuczce, wnuczko', 'wnuczki, wnuczek, wnuczkom, wnuczki, wnuczkami, wnuczkach', 'fem_')),
  GRANDSON: mp('wnuk, wnuka, wnukowi, wnuka, wnukiem, wnuku, wnuku', 'wnukowie, wnuków, wnukom, wnuków, wnukami, wnukach'),
  GRANDDAUGHTER: f('wnuczka, wnuczki, wnuczce, wnuczkę, wnuczką, wnuczce, wnuczko', 'wnuczki, wnuczek, wnuczkom, wnuczki, wnuczkami, wnuczkach'),
  // *wujek* covers both sides in everyday Polish (*stryj* is the father's brother, dated).
  UNCLE: mp('wujek, wujka, wujkowi, wujka, wujkiem, wujku, wujku', 'wujkowie, wujków, wujkom, wujków, wujkami, wujkach'),
  AUNT: f('ciocia, cioci, cioci, ciocię, ciocią, cioci, ciociu', 'ciocie, cioć, ciociom, ciocie, ciociami, ciociach'), // (verify) *ciocia* vs *ciotka*
  COUSIN: mp('kuzyn, kuzyna, kuzynowi, kuzyna, kuzynem, kuzynie, kuzynie', 'kuzyni, kuzynów, kuzynom, kuzynów, kuzynami, kuzynach',
    paradigm('kuzynka, kuzynki, kuzynce, kuzynkę, kuzynką, kuzynce, kuzynko', 'kuzynki, kuzynek, kuzynkom, kuzynki, kuzynkami, kuzynkach', 'fem_')),
  // Polish names the nephew and niece by the sibling's sex (*bratanek*, a brother's son;
  // *siostrzeniec*, a sister's son); the brother's is the one stored.
  NEPHEW: mp('bratanek, bratanka, bratankowi, bratanka, bratankiem, bratanku, bratanku', 'bratankowie, bratanków, bratankom, bratanków, bratankami, bratankach'), // (verify)
  NIECE: f('bratanica, bratanicy, bratanicy, bratanicę, bratanicą, bratanicy, bratanico', 'bratanice, bratanic, bratanicom, bratanice, bratanicami, bratanicach'), // (verify)
  // Substantivised adjectives: *teściowa, synowa* (vocative *teściowo, synowo*).
  MOTHER_IN_LAW: f('teściowa, teściowej, teściowej, teściową, teściową, teściowej, teściowo', 'teściowe, teściowych, teściowym, teściowe, teściowymi, teściowych'),
  FATHER_IN_LAW: mp('teść, teścia, teściowi, teścia, teściem, teściu, teściu', 'teściowie, teściów, teściom, teściów, teściami, teściach'),
  SON_IN_LAW: mp('zięć, zięcia, zięciowi, zięcia, zięciem, zięciu, zięciu', 'zięciowie, zięciów, zięciom, zięciów, zięciami, zięciach'),
  DAUGHTER_IN_LAW: f('synowa, synowej, synowej, synową, synową, synowej, synowo', 'synowe, synowych, synowym, synowe, synowymi, synowych'),
};
