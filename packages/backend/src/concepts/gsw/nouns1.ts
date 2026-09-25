import type { GswColumn } from './types.js';

export const GSW_NOUNS_1: GswColumn = {
  ANIMAL: { base: 'Tier', plural: 'Tier', gender: 'neut', count: 'singular' },
  MAMMAL: { base: 'Süügetier', plural: 'Süügetier', gender: 'neut', count: 'singular' },
  CAT: { base: 'Chater', plural: 'Chater', gender: 'masc', count: 'singular', fem: 'Chatz', fem_plural: 'Chatze' },
  DOG: {
    base: 'Hund', plural: 'Hünd', gender: 'masc', count: 'singular', fem: 'Hündin', fem_plural: 'Hündine', compound: 'Hunde',
  },
  BOOK: { base: 'Buech', plural: 'Büecher', gender: 'neut', count: 'singular' },
  AIR: { base: 'Luft', plural: 'Lüft', gender: 'fem', count: 'singular' },
  GROUND: { base: 'Bode', plural: 'Böde', gender: 'masc', count: 'singular' },
  WATER: { base: 'Wasser', gender: 'neut', count: 'singular' },
  SPEED: { base: 'Gschwindigkeit', plural: 'Gschwindigkeite', gender: 'fem', count: 'singular' },
  LIGHT: { base: 'Liecht', plural: 'Liechter', gender: 'neut', count: 'singular' },
  SOUND: { base: 'Grüüsch', plural: 'Grüüsch', gender: 'neut', count: 'singular' },
  WAY: { base: 'Wiis', plural: 'Wiise', gender: 'fem', count: 'singular' },
  TIME: { base: 'Ziit', plural: 'Ziite', gender: 'fem', count: 'singular' },
  CARE: { base: 'Sorgfalt', gender: 'fem', count: 'singular', compound: 'Sorgfalts' },
  SIZE: { base: 'Grössi', plural: 'Grössene', gender: 'fem', count: 'singular' },
  HEIGHT: { base: 'Höchi', plural: 'Höchene', gender: 'fem', count: 'singular' },
  LENGTH: { base: 'Längi', plural: 'Längene', gender: 'fem', count: 'singular' },
  QUALITY: { base: 'Qualität', plural: 'Qualitäte', gender: 'fem', count: 'singular' },
  // compound (verify): Stärchi- or Stärche-.
  STRENGTH: { base: 'Stärchi', plural: 'Stärchene', gender: 'fem', count: 'singular', compound: 'Stärchi' },
  AGE: { base: 'Alter', plural: 'Alter', gender: 'neut', count: 'singular', compound: 'Alters' },
  TEMPERATURE: { base: 'Temperatur', plural: 'Temperature', gender: 'fem', count: 'singular' },
  DISTANCE: { base: 'Entfernig', plural: 'Entfernige', gender: 'fem', count: 'singular' },
  SHAPE: { base: 'Form', plural: 'Forme', gender: 'fem', count: 'singular' },
  CIRCLE: { base: 'Chreis', plural: 'Chreis', gender: 'masc', count: 'singular' },
  LINE_MARK: { base: 'Linie', plural: 'Linie', gender: 'fem', count: 'singular' },
  MONEY: { base: 'Gäld', gender: 'neut', count: 'singular' },
  // compound (verify): Ässe- (Ässeziit), not Standard Essens-.
  FOOD: { base: 'Ässe', gender: 'neut', count: 'singular', compound: 'Ässe' },
  // Zürich says Glace, and it is feminine (de: das Eis).
  ICE_CREAM: { base: 'Glace', plural: 'Glace', gender: 'fem', count: 'singular' },
  SUGAR: { base: 'Zucker', gender: 'masc', count: 'singular' },
  LIQUID: { base: 'Flüssigkeit', gender: 'fem', count: 'singular' },
  CONTENT: { base: 'Inhalt', plural: 'Inhält', gender: 'masc', count: 'singular', compound: 'Inhalts' },
  // plural Ört (verify).
  PLACE: { base: 'Ort', plural: 'Ört', gender: 'masc', count: 'singular', compound: 'Orts', place_prep: 'a' },
  POINT_NOUN: { base: 'Punkt', plural: 'Pünkt', gender: 'masc', count: 'singular', place_prep: 'a' },
  AREA: { base: 'Gebiet', plural: 'Gebiet', gender: 'neut', count: 'singular' },
  CENTER: { base: 'Mitti', plural: 'Mittene', gender: 'fem', count: 'singular' },
  SIDE: { base: 'Siite', plural: 'Siite', gender: 'fem', count: 'singular' },
  DESTINATION: { base: 'Ziil', plural: 'Ziil', gender: 'neut', count: 'singular', place_prep: 'a' },
  ORIGIN: { base: 'Uusgangspunkt', plural: 'Uusgangspünkt', gender: 'masc', count: 'singular', place_prep: 'a' },
  PATH: { base: 'Wäg', plural: 'Wäg', gender: 'masc', count: 'singular' },
  DIRECTION_SPACE: { base: 'Richtig', plural: 'Richtige', gender: 'fem', count: 'singular' },
  BUILDING: { base: 'Gebäud', plural: 'Gebäud', gender: 'neut', count: 'singular' },
  WALL: { base: 'Wand', plural: 'Wänd', gender: 'fem', count: 'singular' },
  // plural Hüser (short ü, as Zürich says it); the style sheet's vowel table writes Hüüser (verify).
  HOUSE: { base: 'Huus', plural: 'Hüser', gender: 'neut', count: 'singular' },
  // Zürich s Dihei, not Zuhause.
  HOME: { base: 'Dihei', plural: 'Dihei', gender: 'neut', count: 'singular' },
  ROOM: { base: 'Zimmer', plural: 'Zimmer', gender: 'neut', count: 'singular' },
  OFFICE: { base: 'Büro', plural: 'Büros', gender: 'neut', count: 'singular' },
  DOOR: { base: 'Tür', plural: 'Türe', gender: 'fem', count: 'singular' },
  CAR: { base: 'Auto', plural: 'Auto', gender: 'neut', count: 'singular' },
  CHILD: { base: 'Chind', plural: 'Chind', gender: 'neut', count: 'singular', compound: 'Chinder' },
  KID: { base: 'Chind', plural: 'Chind', gender: 'neut', count: 'singular', compound: 'Chinder' },
  PERSON: { base: 'Person', plural: 'Persone', gender: 'fem', count: 'singular', compound: 'Persone' },
  SPEAKER: {
    base: 'Sprächer', plural: 'Sprächer', gender: 'masc', count: 'singular', fem: 'Sprächerin', fem_plural: 'Sprächerine',
  },
  COMPANION: {
    base: 'Begleiter', plural: 'Begleiter', gender: 'masc', count: 'singular', fem: 'Begleiterin', fem_plural: 'Begleiterine',
  },
  RECIPIENT: {
    base: 'Empfänger', plural: 'Empfänger', gender: 'masc', count: 'singular', fem: 'Empfängerin', fem_plural: 'Empfängerine',
  },
  FOX: { base: 'Fuchs', plural: 'Füchs', gender: 'masc', count: 'singular' },
  // Bueb, not Junge.
  BOY: { base: 'Bueb', plural: 'Buebe', gender: 'masc', count: 'singular' },
  // Meitli, not Mädchen.
  GIRL: { base: 'Meitli', plural: 'Meitli', gender: 'neut', count: 'singular' },
  MAN: { base: 'Maa', plural: 'Manne', gender: 'masc', count: 'singular', compound: 'Manne' },
  GUY: { base: 'Typ', plural: 'Type', gender: 'masc', count: 'singular' },
  WOMAN: { base: 'Frau', plural: 'Fraue', gender: 'fem', count: 'singular', compound: 'Fraue' },
  WOLF: {
    base: 'Wolf', plural: 'Wölf', gender: 'masc', count: 'singular', fem: 'Wölfin', fem_plural: 'Wölfine', compound: 'Wolfs',
  },
  // compound Rinds- (Swiss Rindsvoressen), not Standard Rinder-.
  BOVINE: { base: 'Rind', plural: 'Rinder', gender: 'neut', count: 'singular', compound: 'Rinds' },
  COW: { base: 'Chue', plural: 'Chüe', gender: 'fem', count: 'singular' },
  OX: { base: 'Ochs', plural: 'Ochse', gender: 'masc', count: 'singular' },
  BUTCHER: {
    base: 'Metzger', plural: 'Metzger', gender: 'masc', count: 'singular', fem: 'Metzgerin', fem_plural: 'Metzgerine',
  },
  ANGEL: { base: 'Ängel', plural: 'Ängel', gender: 'masc', count: 'singular', compound: 'Ängels' },
  LIFE: { base: 'Läbe', plural: 'Läbe', gender: 'neut', count: 'singular', compound: 'Läbes' },
  END: { base: 'Änd', plural: 'Änd', gender: 'neut', count: 'singular', compound: 'Änd', place_prep: 'a' },
  DEATH: { base: 'Tod', plural: 'Tod', gender: 'masc', count: 'singular', compound: 'Todes' },
  FEELING: { base: 'Gfüül', plural: 'Gfüül', gender: 'neut', count: 'singular', compound: 'Gfüüls' },
  AFFECTION: { base: 'Zueneigig', gender: 'fem', count: 'singular' },
  MOUSE: { base: 'Muus', plural: 'Müüs', gender: 'fem', count: 'singular' },
  FLY_INSECT: { base: 'Flüüge', plural: 'Flüüge', gender: 'fem', count: 'singular' },
  // Zürich de Stecke for a stick of wood; Stock is a walking stick or a floor (verify spelling Stecke/Stäcke).
  STICK: { base: 'Stecke', plural: 'Stecke', gender: 'masc', count: 'singular' },
  ARROW_PROJECTILE: { base: 'Pfiil', plural: 'Pfiil', gender: 'masc', count: 'singular' },
  // Klinge or Chlinge (verify).
  BLADE: { base: 'Klinge', plural: 'Klinge', gender: 'fem', count: 'singular' },
  FIRE: { base: 'Füür', plural: 'Füür', gender: 'neut', count: 'singular' },
  FLAME: { base: 'Flamme', plural: 'Flamme', gender: 'fem', count: 'singular' },
  PARENT: { base: 'Elterteil', plural: 'Eltere', gender: 'neut', count: 'singular' },
  FATHER: { base: 'Vatter', plural: 'Vätter', gender: 'masc', count: 'singular' },
  RELATIVE: {
    base: 'Verwandt', plural: 'Verwandt', gender: 'masc', count: 'singular',
    fem: 'Verwandt', fem_plural: 'Verwandt', adjectival: '1',
  },
  FAMILY: { base: 'Familie', plural: 'Familie', gender: 'fem', count: 'singular' },
  MOTHER: { base: 'Mueter', plural: 'Müetere', gender: 'fem', count: 'singular' },
  CHILD_OFFSPRING: { base: 'Chind', plural: 'Chind', gender: 'neut', count: 'singular', compound: 'Chinder' },
  // Soon, Dieth for the long o (verify).
  SON: { base: 'Soon', plural: 'Söön', gender: 'masc', count: 'singular' },
  DAUGHTER: { base: 'Tochter', plural: 'Töchtere', gender: 'fem', count: 'singular' },
  // s Gschwüschterti, the Zürich lexeme (not a chosen diminutive).
  SIBLING: { base: 'Gschwüschterti', plural: 'Gschwüschterti', gender: 'neut', count: 'singular' },
  BROTHER: { base: 'Brueder', plural: 'Brüeder', gender: 'masc', count: 'singular' },
  SISTER: { base: 'Schwöschter', plural: 'Schwöschtere', gender: 'fem', count: 'singular' },
  SPOUSE: {
    base: 'Ehepartner', plural: 'Ehepartner', gender: 'masc', count: 'singular', fem: 'Ehepartnerin', fem_plural: 'Ehepartnerine',
  },
  HUSBAND: { base: 'Ehemaa', plural: 'Ehemanne', gender: 'masc', count: 'singular', possessed: 'Maa', possessed_plural: 'Manne' },
  WIFE: { base: 'Ehefrau', plural: 'Ehefraue', gender: 'fem', count: 'singular', possessed: 'Frau', possessed_plural: 'Fraue' },
  GRANDPARENT: { base: 'Grosselterteil', plural: 'Grosseltere', gender: 'neut', count: 'singular' },
  GRANDFATHER: { base: 'Grossvater', plural: 'Grossväter', gender: 'masc', count: 'singular' },
  GRANDMOTHER: { base: 'Grossmueter', plural: 'Grossmüetere', gender: 'fem', count: 'singular' },
  // Swiss Grosschind, not Enkelkind.
  GRANDCHILD: { base: 'Grosschind', plural: 'Grosschind', gender: 'neut', count: 'singular' },
  GRANDSON: { base: 'Änkel', plural: 'Änkel', gender: 'masc', count: 'singular' },
  GRANDDAUGHTER: { base: 'Änkelin', plural: 'Änkeline', gender: 'fem', count: 'singular' },
  // Onkel; the older Zürich word is Unggle (verify which the reviewer wants).
  UNCLE: { base: 'Onkel', plural: 'Onkel', gender: 'masc', count: 'singular' },
  AUNT: { base: 'Tante', plural: 'Tante', gender: 'fem', count: 'singular' },
  COUSIN: { base: 'Cousin', plural: 'Cousins', gender: 'masc', count: 'singular', fem: 'Cousine', fem_plural: 'Cousine' },
  NEPHEW: { base: 'Neffe', plural: 'Neffe', gender: 'masc', count: 'singular' },
  NIECE: { base: 'Nichte', plural: 'Nichte', gender: 'fem', count: 'singular' },
  // Schwiger- with a short i (verify).
  MOTHER_IN_LAW: { base: 'Schwigermueter', plural: 'Schwigermüetere', gender: 'fem', count: 'singular' },
  FATHER_IN_LAW: { base: 'Schwigervater', plural: 'Schwigerväter', gender: 'masc', count: 'singular' },
  SON_IN_LAW: { base: 'Schwigersoon', plural: 'Schwigersöön', gender: 'masc', count: 'singular' },
  DAUGHTER_IN_LAW: { base: 'Schwigertochter', plural: 'Schwigertöchtere', gender: 'fem', count: 'singular' },
  BROTHER_IN_LAW: { base: 'Schwager', plural: 'Schwäger', gender: 'masc', count: 'singular' },
  SISTER_IN_LAW: { base: 'Schwägerin', plural: 'Schwägerine', gender: 'fem', count: 'singular' },
  STEPFATHER: { base: 'Stiefvater', plural: 'Stiefväter', gender: 'masc', count: 'singular' },
  STEPMOTHER: { base: 'Stiefmueter', plural: 'Stiefmüetere', gender: 'fem', count: 'singular' },
  // s Mami is neuter (de: die Mama).
  // As a name it keeps its article, as every Swiss German name does: "s Mami springt" (verify, E14).
  MOM: { base: 'Mami', plural: 'Mami', gender: 'neut', count: 'singular', as_name: '1', takes_article: '1' },
  DAD: { base: 'Papi', plural: 'Papi', gender: 'masc', count: 'singular', as_name: '1', takes_article: '1' },
  PARTNER: {
    base: 'Partner', plural: 'Partner', gender: 'masc', count: 'singular', fem: 'Partnerin', fem_plural: 'Partnerine',
  },
  BOYFRIEND: { base: 'Fründ', plural: 'Fründ', gender: 'masc', count: 'singular' },
  GIRLFRIEND: { base: 'Fründin', plural: 'Fründine', gender: 'fem', count: 'singular' },
  FIANCE: {
    base: 'Verlobt', plural: 'Verlobt', gender: 'masc', count: 'singular',
    fem: 'Verlobt', fem_plural: 'Verlobt', adjectival: '1',
  },
  FRIEND: { base: 'Fründ', plural: 'Fründ', gender: 'masc', count: 'singular', fem: 'Fründin', fem_plural: 'Fründine' },
  // Märt, not Markt.
  MARKET: { base: 'Märt', plural: 'Märt', gender: 'masc', count: 'singular' },
  COIN: { base: 'Münz', plural: 'Münze', gender: 'fem', count: 'singular', compound: 'Münz' },
  LEGEND: { base: 'Legände', plural: 'Legände', gender: 'fem', count: 'singular' },
  WING: { base: 'Flügel', plural: 'Flügel', gender: 'masc', count: 'singular' },
  TOOTH: { base: 'Zaa', plural: 'Zää', gender: 'masc', count: 'singular' },
  TEAR: { base: 'Träne', plural: 'Träne', gender: 'fem', count: 'singular' },
  // plural Burschte (verify).
  YOUNG_MAN: { base: 'Bursch', plural: 'Burschte', gender: 'masc', count: 'singular' },
  YOUNG_WOMAN: {
    base: 'Frau', plural: 'Fraue', adjective: 'jung', citation: 'jungi Frau', gender: 'fem', count: 'singular', compound: 'Fraue',
  },
  PRISON: { base: 'Gfängnis', plural: 'Gfängnis', gender: 'neut', count: 'singular' },
  BUILDER: {
    base: 'Bauarbeiter', plural: 'Bauarbeiter', gender: 'masc', count: 'singular', fem: 'Bauarbeiterin', fem_plural: 'Bauarbeiterine',
  },
  CREATOR: {
    base: 'Schöpfer', plural: 'Schöpfer', gender: 'masc', count: 'singular', fem: 'Schöpferin', fem_plural: 'Schöpferine',
  },
};
