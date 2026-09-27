import { describe, expect, test } from 'vitest';
import { clause, np, sayAll } from './harness.js';

// The common animals and their classes: ANIMAL › {MAMMAL, BIRD, FISH, REPTILE, AMPHIBIAN, INSECT}
// and about thirty everyday animals under them (the tree itself is pinned in the backend's
// concepts/index.test.ts). RUN is intransitive, so the subject's article, gender and plural are all
// that is in play.
const subject = (id: string, extra: Parameters<typeof np>[1] = {}) => sayAll(clause(np(id, extra), 'RUN'));

type Row = Record<string, string>;
const ANIMALS: [string, Row, Row, Row][] = [
  // The classes under ANIMAL (MAMMAL is pinned with the older corpus).
  ['BIRD',
    { en: 'the bird runs.', it: "l'uccello corre.", fr: "l'oiseau court.", de: 'der Vogel läuft.', es: 'el ave corre.', ja: '鳥は走ります。', pt: 'a ave corre.' },
    { en: 'the birds run.', it: 'gli uccelli corrono.', fr: 'les oiseaux courent.', de: 'die Vögel laufen.', es: 'las aves corren.', ja: '鳥は走ります。', pt: 'as aves correm.' },
    { en: 'a bird runs.', it: 'un uccello corre.', fr: 'un oiseau court.', de: 'ein Vogel läuft.', es: 'un ave corre.', ja: '鳥は走ります。', pt: 'uma ave corre.' }],
  ['FISH',
    { en: 'the fish runs.', it: 'il pesce corre.', fr: 'le poisson court.', de: 'der Fisch läuft.', es: 'el pez corre.', ja: '魚は走ります。', pt: 'o peixe corre.' },
    { en: 'the fish run.', it: 'i pesci corrono.', fr: 'les poissons courent.', de: 'die Fische laufen.', es: 'los peces corren.', ja: '魚は走ります。', pt: 'os peixes correm.' },
    { en: 'a fish runs.', it: 'un pesce corre.', fr: 'un poisson court.', de: 'ein Fisch läuft.', es: 'un pez corre.', ja: '魚は走ります。', pt: 'um peixe corre.' }],
  ['REPTILE',
    { en: 'the reptile runs.', it: 'il rettile corre.', fr: 'le reptile court.', de: 'das Reptil läuft.', es: 'el reptil corre.', ja: '爬虫類は走ります。', pt: 'o réptil corre.' },
    { en: 'the reptiles run.', it: 'i rettili corrono.', fr: 'les reptiles courent.', de: 'die Reptilien laufen.', es: 'los reptiles corren.', ja: '爬虫類は走ります。', pt: 'os répteis correm.' },
    { en: 'a reptile runs.', it: 'un rettile corre.', fr: 'un reptile court.', de: 'ein Reptil läuft.', es: 'un reptil corre.', ja: '爬虫類は走ります。', pt: 'um réptil corre.' }],
  ['AMPHIBIAN',
    { en: 'the amphibian runs.', it: "l'anfibio corre.", fr: "l'amphibien court.", de: 'die Amphibie läuft.', es: 'el anfibio corre.', ja: '両生類は走ります。', pt: 'o anfíbio corre.' },
    { en: 'the amphibians run.', it: 'gli anfibi corrono.', fr: 'les amphibiens courent.', de: 'die Amphibien laufen.', es: 'los anfibios corren.', ja: '両生類は走ります。', pt: 'os anfíbios correm.' },
    { en: 'an amphibian runs.', it: 'un anfibio corre.', fr: 'un amphibien court.', de: 'eine Amphibie läuft.', es: 'un anfibio corre.', ja: '両生類は走ります。', pt: 'um anfíbio corre.' }],
  ['INSECT',
    { en: 'the insect runs.', it: "l'insetto corre.", fr: "l'insecte court.", de: 'das Insekt läuft.', es: 'el insecto corre.', ja: '昆虫は走ります。', pt: 'o inseto corre.' },
    { en: 'the insects run.', it: 'gli insetti corrono.', fr: 'les insectes courent.', de: 'die Insekten laufen.', es: 'los insectos corren.', ja: '昆虫は走ります。', pt: 'os insetos correm.' },
    { en: 'an insect runs.', it: 'un insetto corre.', fr: 'un insecte court.', de: 'ein Insekt läuft.', es: 'un insecto corre.', ja: '昆虫は走ります。', pt: 'um inseto corre.' }],
  // Mammals. German weak masculines: der Bär, der Löwe, der Elefant, der Affe.
  ['HORSE',
    { en: 'the horse runs.', it: 'il cavallo corre.', fr: 'le cheval court.', de: 'das Pferd läuft.', es: 'el caballo corre.', ja: '馬は走ります。', pt: 'o cavalo corre.' },
    { en: 'the horses run.', it: 'i cavalli corrono.', fr: 'les chevaux courent.', de: 'die Pferde laufen.', es: 'los caballos corren.', ja: '馬は走ります。', pt: 'os cavalos correm.' },
    { en: 'a horse runs.', it: 'un cavallo corre.', fr: 'un cheval court.', de: 'ein Pferd läuft.', es: 'un caballo corre.', ja: '馬は走ります。', pt: 'um cavalo corre.' }],
  ['PIG',
    { en: 'the pig runs.', it: 'il maiale corre.', fr: 'le cochon court.', de: 'das Schwein läuft.', es: 'el cerdo corre.', ja: '豚は走ります。', pt: 'o porco corre.' },
    { en: 'the pigs run.', it: 'i maiali corrono.', fr: 'les cochons courent.', de: 'die Schweine laufen.', es: 'los cerdos corren.', ja: '豚は走ります。', pt: 'os porcos correm.' },
    { en: 'a pig runs.', it: 'un maiale corre.', fr: 'un cochon court.', de: 'ein Schwein läuft.', es: 'un cerdo corre.', ja: '豚は走ります。', pt: 'um porco corre.' }],
  ['SHEEP',
    { en: 'the sheep runs.', it: 'la pecora corre.', fr: 'le mouton court.', de: 'das Schaf läuft.', es: 'la oveja corre.', ja: '羊は走ります。', pt: 'a ovelha corre.' },
    { en: 'the sheep run.', it: 'le pecore corrono.', fr: 'les moutons courent.', de: 'die Schafe laufen.', es: 'las ovejas corren.', ja: '羊は走ります。', pt: 'as ovelhas correm.' },
    { en: 'a sheep runs.', it: 'una pecora corre.', fr: 'un mouton court.', de: 'ein Schaf läuft.', es: 'una oveja corre.', ja: '羊は走ります。', pt: 'uma ovelha corre.' }],
  ['GOAT',
    { en: 'the goat runs.', it: 'la capra corre.', fr: 'la chèvre court.', de: 'die Ziege läuft.', es: 'la cabra corre.', ja: 'ヤギは走ります。', pt: 'a cabra corre.' },
    { en: 'the goats run.', it: 'le capre corrono.', fr: 'les chèvres courent.', de: 'die Ziegen laufen.', es: 'las cabras corren.', ja: 'ヤギは走ります。', pt: 'as cabras correm.' },
    { en: 'a goat runs.', it: 'una capra corre.', fr: 'une chèvre court.', de: 'eine Ziege läuft.', es: 'una cabra corre.', ja: 'ヤギは走ります。', pt: 'uma cabra corre.' }],
  ['RABBIT',
    { en: 'the rabbit runs.', it: 'il coniglio corre.', fr: 'le lapin court.', de: 'das Kaninchen läuft.', es: 'el conejo corre.', ja: 'ウサギは走ります。', pt: 'o coelho corre.' },
    { en: 'the rabbits run.', it: 'i conigli corrono.', fr: 'les lapins courent.', de: 'die Kaninchen laufen.', es: 'los conejos corren.', ja: 'ウサギは走ります。', pt: 'os coelhos correm.' },
    { en: 'a rabbit runs.', it: 'un coniglio corre.', fr: 'un lapin court.', de: 'ein Kaninchen läuft.', es: 'un conejo corre.', ja: 'ウサギは走ります。', pt: 'um coelho corre.' }],
  ['BEAR',
    { en: 'the bear runs.', it: "l'orso corre.", fr: "l'ours court.", de: 'der Bär läuft.', es: 'el oso corre.', ja: '熊は走ります。', pt: 'o urso corre.' },
    { en: 'the bears run.', it: 'gli orsi corrono.', fr: 'les ours courent.', de: 'die Bären laufen.', es: 'los osos corren.', ja: '熊は走ります。', pt: 'os ursos correm.' },
    { en: 'a bear runs.', it: 'un orso corre.', fr: 'un ours court.', de: 'ein Bär läuft.', es: 'un oso corre.', ja: '熊は走ります。', pt: 'um urso corre.' }],
  ['LION',
    { en: 'the lion runs.', it: 'il leone corre.', fr: 'le lion court.', de: 'der Löwe läuft.', es: 'el león corre.', ja: 'ライオンは走ります。', pt: 'o leão corre.' },
    { en: 'the lions run.', it: 'i leoni corrono.', fr: 'les lions courent.', de: 'die Löwen laufen.', es: 'los leones corren.', ja: 'ライオンは走ります。', pt: 'os leões correm.' },
    { en: 'a lion runs.', it: 'un leone corre.', fr: 'un lion court.', de: 'ein Löwe läuft.', es: 'un león corre.', ja: 'ライオンは走ります。', pt: 'um leão corre.' }],
  ['TIGER',
    { en: 'the tiger runs.', it: 'la tigre corre.', fr: 'le tigre court.', de: 'der Tiger läuft.', es: 'el tigre corre.', ja: '虎は走ります。', pt: 'o tigre corre.' },
    { en: 'the tigers run.', it: 'le tigri corrono.', fr: 'les tigres courent.', de: 'die Tiger laufen.', es: 'los tigres corren.', ja: '虎は走ります。', pt: 'os tigres correm.' },
    { en: 'a tiger runs.', it: 'una tigre corre.', fr: 'un tigre court.', de: 'ein Tiger läuft.', es: 'un tigre corre.', ja: '虎は走ります。', pt: 'um tigre corre.' }],
  ['ELEPHANT',
    { en: 'the elephant runs.', it: "l'elefante corre.", fr: "l'éléphant court.", de: 'der Elefant läuft.', es: 'el elefante corre.', ja: '象は走ります。', pt: 'o elefante corre.' },
    { en: 'the elephants run.', it: 'gli elefanti corrono.', fr: 'les éléphants courent.', de: 'die Elefanten laufen.', es: 'los elefantes corren.', ja: '象は走ります。', pt: 'os elefantes correm.' },
    { en: 'an elephant runs.', it: 'un elefante corre.', fr: 'un éléphant court.', de: 'ein Elefant läuft.', es: 'un elefante corre.', ja: '象は走ります。', pt: 'um elefante corre.' }],
  ['MONKEY',
    { en: 'the monkey runs.', it: 'la scimmia corre.', fr: 'le singe court.', de: 'der Affe läuft.', es: 'el mono corre.', ja: '猿は走ります。', pt: 'o macaco corre.' },
    { en: 'the monkeys run.', it: 'le scimmie corrono.', fr: 'les singes courent.', de: 'die Affen laufen.', es: 'los monos corren.', ja: '猿は走ります。', pt: 'os macacos correm.' },
    { en: 'a monkey runs.', it: 'una scimmia corre.', fr: 'un singe court.', de: 'ein Affe läuft.', es: 'un mono corre.', ja: '猿は走ります。', pt: 'um macaco corre.' }],
  ['DEER',
    { en: 'the deer runs.', it: 'il cervo corre.', fr: 'le cerf court.', de: 'der Hirsch läuft.', es: 'el ciervo corre.', ja: '鹿は走ります。', pt: 'o veado corre.' },
    { en: 'the deer run.', it: 'i cervi corrono.', fr: 'les cerfs courent.', de: 'die Hirsche laufen.', es: 'los ciervos corren.', ja: '鹿は走ります。', pt: 'os veados correm.' },
    { en: 'a deer runs.', it: 'un cervo corre.', fr: 'un cerf court.', de: 'ein Hirsch läuft.', es: 'un ciervo corre.', ja: '鹿は走ります。', pt: 'um veado corre.' }],
  ['WHALE',
    { en: 'the whale runs.', it: 'la balena corre.', fr: 'la baleine court.', de: 'der Wal läuft.', es: 'la ballena corre.', ja: '鯨は走ります。', pt: 'a baleia corre.' },
    { en: 'the whales run.', it: 'le balene corrono.', fr: 'les baleines courent.', de: 'die Wale laufen.', es: 'las ballenas corren.', ja: '鯨は走ります。', pt: 'as baleias correm.' },
    { en: 'a whale runs.', it: 'una balena corre.', fr: 'une baleine court.', de: 'ein Wal läuft.', es: 'una ballena corre.', ja: '鯨は走ります。', pt: 'uma baleia corre.' }],
  // Birds. Spanish "el ave" and "el águila" take el before a stressed a; French "le hibou" does not elide.
  ['CHICKEN',
    { en: 'the chicken runs.', it: 'la gallina corre.', fr: 'la poule court.', de: 'das Huhn läuft.', es: 'la gallina corre.', ja: '鶏は走ります。', pt: 'a galinha corre.' },
    { en: 'the chickens run.', it: 'le galline corrono.', fr: 'les poules courent.', de: 'die Hühner laufen.', es: 'las gallinas corren.', ja: '鶏は走ります。', pt: 'as galinhas correm.' },
    { en: 'a chicken runs.', it: 'una gallina corre.', fr: 'une poule court.', de: 'ein Huhn läuft.', es: 'una gallina corre.', ja: '鶏は走ります。', pt: 'uma galinha corre.' }],
  ['DUCK',
    { en: 'the duck runs.', it: "l'anatra corre.", fr: 'le canard court.', de: 'die Ente läuft.', es: 'el pato corre.', ja: 'アヒルは走ります。', pt: 'o pato corre.' },
    { en: 'the ducks run.', it: 'le anatre corrono.', fr: 'les canards courent.', de: 'die Enten laufen.', es: 'los patos corren.', ja: 'アヒルは走ります。', pt: 'os patos correm.' },
    { en: 'a duck runs.', it: "un'anatra corre.", fr: 'un canard court.', de: 'eine Ente läuft.', es: 'un pato corre.', ja: 'アヒルは走ります。', pt: 'um pato corre.' }],
  ['EAGLE',
    { en: 'the eagle runs.', it: "l'aquila corre.", fr: "l'aigle court.", de: 'der Adler läuft.', es: 'el águila corre.', ja: '鷲は走ります。', pt: 'a águia corre.' },
    { en: 'the eagles run.', it: 'le aquile corrono.', fr: 'les aigles courent.', de: 'die Adler laufen.', es: 'las águilas corren.', ja: '鷲は走ります。', pt: 'as águias correm.' },
    { en: 'an eagle runs.', it: "un'aquila corre.", fr: 'un aigle court.', de: 'ein Adler läuft.', es: 'un águila corre.', ja: '鷲は走ります。', pt: 'uma águia corre.' }],
  ['OWL',
    { en: 'the owl runs.', it: 'il gufo corre.', fr: 'le hibou court.', de: 'die Eule läuft.', es: 'el búho corre.', ja: 'フクロウは走ります。', pt: 'a coruja corre.' },
    { en: 'the owls run.', it: 'i gufi corrono.', fr: 'les hiboux courent.', de: 'die Eulen laufen.', es: 'los búhos corren.', ja: 'フクロウは走ります。', pt: 'as corujas correm.' },
    { en: 'an owl runs.', it: 'un gufo corre.', fr: 'un hibou court.', de: 'eine Eule läuft.', es: 'un búho corre.', ja: 'フクロウは走ります。', pt: 'uma coruja corre.' }],
  ['PENGUIN',
    { en: 'the penguin runs.', it: 'il pinguino corre.', fr: 'le manchot court.', de: 'der Pinguin läuft.', es: 'el pingüino corre.', ja: 'ペンギンは走ります。', pt: 'o pinguim corre.' },
    { en: 'the penguins run.', it: 'i pinguini corrono.', fr: 'les manchots courent.', de: 'die Pinguine laufen.', es: 'los pingüinos corren.', ja: 'ペンギンは走ります。', pt: 'os pinguins correm.' },
    { en: 'a penguin runs.', it: 'un pinguino corre.', fr: 'un manchot court.', de: 'ein Pinguin läuft.', es: 'un pingüino corre.', ja: 'ペンギンは走ります。', pt: 'um pinguim corre.' }],
  // Fish.
  ['SHARK',
    { en: 'the shark runs.', it: 'lo squalo corre.', fr: 'le requin court.', de: 'der Hai läuft.', es: 'el tiburón corre.', ja: 'サメは走ります。', pt: 'o tubarão corre.' },
    { en: 'the sharks run.', it: 'gli squali corrono.', fr: 'les requins courent.', de: 'die Haie laufen.', es: 'los tiburones corren.', ja: 'サメは走ります。', pt: 'os tubarões correm.' },
    { en: 'a shark runs.', it: 'uno squalo corre.', fr: 'un requin court.', de: 'ein Hai läuft.', es: 'un tiburón corre.', ja: 'サメは走ります。', pt: 'um tubarão corre.' }],
  ['SALMON',
    { en: 'the salmon runs.', it: 'il salmone corre.', fr: 'le saumon court.', de: 'der Lachs läuft.', es: 'el salmón corre.', ja: '鮭は走ります。', pt: 'o salmão corre.' },
    { en: 'the salmon run.', it: 'i salmoni corrono.', fr: 'les saumons courent.', de: 'die Lachse laufen.', es: 'los salmones corren.', ja: '鮭は走ります。', pt: 'os salmões correm.' },
    { en: 'a salmon runs.', it: 'un salmone corre.', fr: 'un saumon court.', de: 'ein Lachs läuft.', es: 'un salmón corre.', ja: '鮭は走ります。', pt: 'um salmão corre.' }],
  // Reptiles and amphibians.
  ['SNAKE',
    { en: 'the snake runs.', it: 'il serpente corre.', fr: 'le serpent court.', de: 'die Schlange läuft.', es: 'la serpiente corre.', ja: '蛇は走ります。', pt: 'a cobra corre.' },
    { en: 'the snakes run.', it: 'i serpenti corrono.', fr: 'les serpents courent.', de: 'die Schlangen laufen.', es: 'las serpientes corren.', ja: '蛇は走ります。', pt: 'as cobras correm.' },
    { en: 'a snake runs.', it: 'un serpente corre.', fr: 'un serpent court.', de: 'eine Schlange läuft.', es: 'una serpiente corre.', ja: '蛇は走ります。', pt: 'uma cobra corre.' }],
  ['TURTLE',
    { en: 'the turtle runs.', it: 'la tartaruga corre.', fr: 'la tortue court.', de: 'die Schildkröte läuft.', es: 'la tortuga corre.', ja: '亀は走ります。', pt: 'a tartaruga corre.' },
    { en: 'the turtles run.', it: 'le tartarughe corrono.', fr: 'les tortues courent.', de: 'die Schildkröten laufen.', es: 'las tortugas corren.', ja: '亀は走ります。', pt: 'as tartarugas correm.' },
    { en: 'a turtle runs.', it: 'una tartaruga corre.', fr: 'une tortue court.', de: 'eine Schildkröte läuft.', es: 'una tortuga corre.', ja: '亀は走ります。', pt: 'uma tartaruga corre.' }],
  ['CROCODILE',
    { en: 'the crocodile runs.', it: 'il coccodrillo corre.', fr: 'le crocodile court.', de: 'das Krokodil läuft.', es: 'el cocodrilo corre.', ja: 'ワニは走ります。', pt: 'o crocodilo corre.' },
    { en: 'the crocodiles run.', it: 'i coccodrilli corrono.', fr: 'les crocodiles courent.', de: 'die Krokodile laufen.', es: 'los cocodrilos corren.', ja: 'ワニは走ります。', pt: 'os crocodilos correm.' },
    { en: 'a crocodile runs.', it: 'un coccodrillo corre.', fr: 'un crocodile court.', de: 'ein Krokodil läuft.', es: 'un cocodrilo corre.', ja: 'ワニは走ります。', pt: 'um crocodilo corre.' }],
  ['LIZARD',
    { en: 'the lizard runs.', it: 'la lucertola corre.', fr: 'le lézard court.', de: 'die Eidechse läuft.', es: 'el lagarto corre.', ja: 'トカゲは走ります。', pt: 'o lagarto corre.' },
    { en: 'the lizards run.', it: 'le lucertole corrono.', fr: 'les lézards courent.', de: 'die Eidechsen laufen.', es: 'los lagartos corren.', ja: 'トカゲは走ります。', pt: 'os lagartos correm.' },
    { en: 'a lizard runs.', it: 'una lucertola corre.', fr: 'un lézard court.', de: 'eine Eidechse läuft.', es: 'un lagarto corre.', ja: 'トカゲは走ります。', pt: 'um lagarto corre.' }],
  ['FROG',
    { en: 'the frog runs.', it: 'la rana corre.', fr: 'la grenouille court.', de: 'der Frosch läuft.', es: 'la rana corre.', ja: '蛙は走ります。', pt: 'a rã corre.' },
    { en: 'the frogs run.', it: 'le rane corrono.', fr: 'les grenouilles courent.', de: 'die Frösche laufen.', es: 'las ranas corren.', ja: '蛙は走ります。', pt: 'as rãs correm.' },
    { en: 'a frog runs.', it: 'una rana corre.', fr: 'une grenouille court.', de: 'ein Frosch läuft.', es: 'una rana corre.', ja: '蛙は走ります。', pt: 'uma rã corre.' }],
  // Insects, and SPIDER, which is an arachnid.
  ['BEE',
    { en: 'the bee runs.', it: "l'ape corre.", fr: "l'abeille court.", de: 'die Biene läuft.', es: 'la abeja corre.', ja: '蜂は走ります。', pt: 'a abelha corre.' },
    { en: 'the bees run.', it: 'le api corrono.', fr: 'les abeilles courent.', de: 'die Bienen laufen.', es: 'las abejas corren.', ja: '蜂は走ります。', pt: 'as abelhas correm.' },
    { en: 'a bee runs.', it: "un'ape corre.", fr: 'une abeille court.', de: 'eine Biene läuft.', es: 'una abeja corre.', ja: '蜂は走ります。', pt: 'uma abelha corre.' }],
  ['ANT',
    { en: 'the ant runs.', it: 'la formica corre.', fr: 'la fourmi court.', de: 'die Ameise läuft.', es: 'la hormiga corre.', ja: '蟻は走ります。', pt: 'a formiga corre.' },
    { en: 'the ants run.', it: 'le formiche corrono.', fr: 'les fourmis courent.', de: 'die Ameisen laufen.', es: 'las hormigas corren.', ja: '蟻は走ります。', pt: 'as formigas correm.' },
    { en: 'an ant runs.', it: 'una formica corre.', fr: 'une fourmi court.', de: 'eine Ameise läuft.', es: 'una hormiga corre.', ja: '蟻は走ります。', pt: 'uma formiga corre.' }],
  ['BUTTERFLY',
    { en: 'the butterfly runs.', it: 'la farfalla corre.', fr: 'le papillon court.', de: 'der Schmetterling läuft.', es: 'la mariposa corre.', ja: '蝶は走ります。', pt: 'a borboleta corre.' },
    { en: 'the butterflies run.', it: 'le farfalle corrono.', fr: 'les papillons courent.', de: 'die Schmetterlinge laufen.', es: 'las mariposas corren.', ja: '蝶は走ります。', pt: 'as borboletas correm.' },
    { en: 'a butterfly runs.', it: 'una farfalla corre.', fr: 'un papillon court.', de: 'ein Schmetterling läuft.', es: 'una mariposa corre.', ja: '蝶は走ります。', pt: 'uma borboleta corre.' }],
  ['MOSQUITO',
    { en: 'the mosquito runs.', it: 'la zanzara corre.', fr: 'le moustique court.', de: 'die Mücke läuft.', es: 'el mosquito corre.', ja: '蚊は走ります。', pt: 'o mosquito corre.' },
    { en: 'the mosquitoes run.', it: 'le zanzare corrono.', fr: 'les moustiques courent.', de: 'die Mücken laufen.', es: 'los mosquitos corren.', ja: '蚊は走ります。', pt: 'os mosquitos correm.' },
    { en: 'a mosquito runs.', it: 'una zanzara corre.', fr: 'un moustique court.', de: 'eine Mücke läuft.', es: 'un mosquito corre.', ja: '蚊は走ります。', pt: 'um mosquito corre.' }],
  ['SPIDER',
    { en: 'the spider runs.', it: 'il ragno corre.', fr: "l'araignée court.", de: 'die Spinne läuft.', es: 'la araña corre.', ja: '蜘蛛は走ります。', pt: 'a aranha corre.' },
    { en: 'the spiders run.', it: 'i ragni corrono.', fr: 'les araignées courent.', de: 'die Spinnen laufen.', es: 'las arañas corren.', ja: '蜘蛛は走ります。', pt: 'as aranhas correm.' },
    { en: 'a spider runs.', it: 'un ragno corre.', fr: 'une araignée court.', de: 'eine Spinne läuft.', es: 'una araña corre.', ja: '蜘蛛は走ります。', pt: 'uma aranha corre.' }],];

describe('animals: each takes its gendered article and pluralises', () => {
  test.each(ANIMALS)('%s', (id, the, thePlural, a) => {
    expect(subject(id)).toEqual(the);
    expect(subject(id, { number: 'plural' })).toEqual(thePlural);
    expect(subject(id, { definiteness: 'indefinite' })).toEqual(a);
  });
});

describe('animals: the feminine', () => {
  // Where a language has a word for the female, gender:'fem' selects it — suppletive in places
  // (fr jument, es yegua, pt égua), and left alone where the language has none (de Pferd, en).
  test('the lioness, the mare and the tigress', () => {
    expect(subject('LION', { gender: 'fem' })).toEqual({
      en: 'the lion runs.', it: 'la leonessa corre.', fr: 'la lionne court.', de: 'die Löwin läuft.',
      es: 'la leona corre.', ja: 'ライオンは走ります。', pt: 'a leoa corre.',
    });
    expect(subject('HORSE', { gender: 'fem' })).toEqual({
      en: 'the horse runs.', it: 'la cavalla corre.', fr: 'la jument court.', de: 'das Pferd läuft.',
      es: 'la yegua corre.', ja: '馬は走ります。', pt: 'a égua corre.',
    });
    // Italian "tigre" is feminine for either sex, so the feminine changes nothing there.
    expect(subject('TIGER', { gender: 'fem' })).toEqual({
      en: 'the tiger runs.', it: 'la tigre corre.', fr: 'la tigresse court.', de: 'die Tigerin läuft.',
      es: 'la tigresa corre.', ja: '虎は走ります。', pt: 'a tigresa corre.',
    });
  });
});

describe('animals: the German weak masculines', () => {
  test.each([
    ['LION', 'der Kater sieht den Löwen.'],
    ['BEAR', 'der Kater sieht den Bären.'],
    ['ELEPHANT', 'der Kater sieht den Elefanten.'],
    ['MONKEY', 'der Kater sieht den Affen.'],
  ])('%s takes -(e)n in the accusative', (id, de) => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np(id) })).de).toBe(de);
  });
});

describe('animals: the Japanese counter', () => {
  // 頭 for a large animal, 羽 for a bird, and the animate default 匹 for the rest.
  test.each([
    ['HORSE', '二頭の馬は走ります。'],
    ['ELEPHANT', '二頭の象は走ります。'],
    ['WHALE', '二頭の鯨は走ります。'],
    ['CHICKEN', '二羽の鶏は走ります。'],
    ['PENGUIN', '二羽のペンギンは走ります。'],
    ['RABBIT', '二匹のウサギは走ります。'],
    ['SPIDER', '二匹の蜘蛛は走ります。'],
  ])('%s', (id, ja) => {
    expect(subject(id, { numeral: 2 }).ja).toBe(ja);
  });
});
