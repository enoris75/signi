import type { LanguageColumn } from '../types.js';
import { a, as, e, fem, i, is, noun, us, ys } from './helpers.js';

// Lithuanian nouns, part A (P18-E5): animals, the dimensions and spatial nouns, people and the family —
// the slice of Polish's `pl/nouns-a.ts`. Every case is stored (style-lt.md § Nouns), written with the
// class helpers; the irregular nouns (*šuo, vanduo, žmogus, moteris, duktė, sesuo, marti*) and the
// plural-only ones are written out. A person or animal whose Polish entry has a feminine carries the
// Lithuanian one under `fem_` where Lithuanian has a distinct feminine noun; where the plain word is
// itself the feminine or epicene (*katė, kiaulė, beždžionė, antis, lapė*), a comment says so and no
// `fem_` cells are written. Every form is (verify) until the native review (P18-E12); the marked ones
// are the choices most worth a second look.

type Forms = Record<string, string>;

/**
 * A plural-only noun (*pinigai, durys, namai*): `plurale_tantum`, and the plural paradigm in every
 * singular key too (style-lt.md), `voc_sg` being the nominative plural.
 */
function pluraleTantum(gender: 'masc' | 'fem', pl: string): Forms {
  const [nom, gen, dat, acc, ins, loc] = pl.split(',').map((s) => s.trim());
  return noun(gender, [nom, gen, dat, acc, ins, loc, nom].join(', '), pl, { plurale_tantum: '1' });
}

/**
 * A head with an undeclined genitive complement before it (*paskirties vieta*): the head's entry with
 * `words` put before every case cell (style-lt.md: "a head with a genitive complement declines only the
 * head").
 */
function withGenitive(words: string, head: Forms): Forms {
  const out: Forms = {};
  for (const [k, v] of Object.entries(head)) out[k] = k === 'gender' || k === 'count' ? v : `${words} ${v}`;
  return out;
}

export const LT_NOUNS_A: LanguageColumn = {
  // ── Animals ──────────────────────────────────────────────────
  ANIMAL: as('gyvūn'),
  MAMMAL: is('žinduol'),
  // The zoological family is *katiniai* (Felidae); *katė* is CAT and *katinas* the tomcat.
  FELINE: is('katin'), // (verify) singular *katinis* of the family name *katiniai*
  // *katė* is the general word and feminine; *katinas* is the tomcat only (style-lt.md). No `fem_`: the
  // plain word already is the feminine.
  CAT: e('kat'), // (verify) katė as the general word
  // *šuo* is irregular (a consonant stem in *-n-*); the bitch is *kalė*.
  DOG: noun('masc', 'šuo, šuns, šuniui, šunį, šunimi, šunyje, šunie', 'šunys, šunų, šunims, šunis, šunimis, šunyse', fem(e('kal'))),
  BIRD: is('paukšt'),
  // *žuvis* takes *-ų* in the genitive plural.
  FISH: i('žuv', { genPl: 'žuvų' }),
  REPTILE: ys('ropl'),
  AMPHIBIAN: is('varliagyv'),
  INSECT: ys('vabzd'),
  // *arklys* the horse, *kumelė* the mare.
  HORSE: ys('arkl', { extra: fem(e('kumel')) }),
  // *kiaulė* is the general word and feminine (the boar is *kuilys*, the sow *paršavedė*): no `fem_`.
  PIG: e('kiaul'),
  SHEEP: i('av'),
  // *ožka* is the everyday general word (the billy goat is *ožys*).
  GOAT: a('ožk'), // (verify) vs *ožys*
  RABBIT: is('triuš', { extra: fem(e('triuš')) }), // (verify) fem *triušė*
  // *lokys* the bear (*meška* is the everyday, also feminine, word), *lokė* the she-bear.
  BEAR: ys('lok', { extra: fem(e('lok')) }), // (verify) *lokys* vs *meška*; fem *lokė*
  LION: as('liūt', { extra: fem(e('liūt')) }),
  TIGER: as('tigr', { extra: fem(e('tigr')) }),
  LEOPARD: as('leopard', { extra: fem(e('leopard')) }), // (verify) fem *leopardė*
  PANTHER: a('panter'),
  PUMA: a('pum'),
  CHEETAH: as('gepard'),
  ELEPHANT: ys('drambl', { extra: fem(e('drambl')) }), // (verify) fem *dramblė*
  // *beždžionė* is epicene: Lithuanian has no separate feminine, so no `fem_`.
  MONKEY: e('beždžion'),
  // *elnias* the stag, *elnė* the hind.
  DEER: as('elni', { extra: fem(e('eln')) }),
  WHALE: is('bangin'),
  // *višta* the hen, the general word for the farm bird (the rooster is *gaidys*).
  CHICKEN: a('višt'),
  // *antis* is the general word and feminine (the drake is *antinas*): no `fem_`.
  DUCK: i('ant'),
  EAGLE: is('erel'),
  OWL: a('pelėd'),
  PENGUIN: as('pingvin'),
  SHARK: ys('rykl'),
  SALMON: a('lašiš'),
  SNAKE: e('gyvat'),
  TURTLE: ys('vėžl'),
  CROCODILE: as('krokodil'),
  LIZARD: as('driež'),
  FROG: e('varl'),
  BEE: e('bit'),
  ANT: e('skruzdėl'),
  BUTTERFLY: is('drugel'), // (verify) vs *peteliškė*
  MOSQUITO: as('uod'),
  SPIDER: as('vor'),
  // *lapė* is the general word and feminine (the male is *lapinas*): no `fem_`.
  FOX: e('lap'),
  WOLF: as('vilk', { extra: fem(e('vilk')) }),
  // *galvijas*, a head of cattle; *galvijai* the cattle.
  BOVINE: as('galvij'), // (verify) word choice; loc sg *galvijyje* vs *galvijuje*
  COW: e('karv'),
  OX: is('jaut'),
  MOUSE: e('pel'),
  FLY_INSECT: e('mus'),

  // ── Things, substances, dimensions ───────────────────────────
  BOOK: a('knyg'),
  AIR: as('or', { sgOnly: true }),
  // The surface one stands or falls on (*nukristi ant žemės*); *grindys* is a floor indoors.
  GROUND: e('žem'), // (verify) shares *žemė* with the soil and planet senses
  // *vanduo* is irregular (a consonant stem in *-en-*).
  WATER: noun('masc', 'vanduo, vandens, vandeniui, vandenį, vandeniu, vandenyje, vandenie'),
  SPEED: is('greit'),
  LIGHT: a('švies'),
  SOUND: as('gars'),
  // A manner (*tokiu būdu*); the road sense is *kelias*, PATH's.
  WAY: as('būd'),
  // Time as it passes; "an occasion" is *kartas* in Lithuanian (*kitą kartą*), not stored here.
  TIME: as('laik'), // (verify) the occasion sense
  // Sorgfalt: "with care" = *kruopščiai* / *su kruopštumu*; ATTENTION is *dėmesys*.
  CARE: as('kruopštum', { sgOnly: true }), // (verify) vs *rūpestingumas*, *atsargumas*
  SIZE: is('dyd'),
  HEIGHT: is('aukšt'),
  LENGTH: is('ilg'),
  QUALITY: e('kokyb'),
  STRENGTH: a('jėg'),
  // *amžius* takes the *io* plural (*amžiai*, "ages, centuries").
  AGE: us('amži'),
  TEMPERATURE: a('temperatūr'),
  DISTANCE: as('atstum'),
  SHAPE: a('form'),
  // The round figure; *ratas* is also a wheel, *apskritimas* the geometric circle.
  CIRCLE: as('apskritim'), // (verify) vs *ratas*
  // *linija*; *eilutė* is a line of text (LINE).
  LINE_MARK: a('linij'),
  // Plurale tantum: *pinigai yra*, one sum or several.
  MONEY: pluraleTantum('masc', 'pinigai, pinigų, pinigams, pinigus, pinigais, piniguose'),
  FOOD: as('maist', { sgOnly: true }),
  // Plurale tantum in the everyday language (*valgau ledus*); the singular *ledas* is ice.
  ICE_CREAM: pluraleTantum('masc', 'ledai, ledų, ledams, ledus, ledais, leduose'), // (verify)
  SUGAR: us('cukr', { sgOnly: true }),
  LIQUID: is('skyst', { sgOnly: true }),
  CONTENT: ys('turin'),
  STICK: a('lazd'),
  // *strėlė*; *rodyklė* is the pointer, the arrow key's (ARROW).
  ARROW_PROJECTILE: e('strėl'),
  // The blade of a knife; *ašmenys* (plural only) is its sharp edge.
  BLADE: e('geležt'), // (verify) vs *ašmenys*
  // *ugnis* is fire as a phenomenon; *gaisras* is a fire that burns a building.
  FIRE: i('ugn'),
  FLAME: a('liepsn'),

  // ── Places and space ─────────────────────────────────────────
  PLACE: a('viet'),
  POINT_NOUN: as('tašk'),
  AREA: e('vietov'), // (verify) vs *rajonas*, *sritis* (DOMAIN's likely word)
  // *centras*: *vidurys* would give the plural *viduriai*, "bowels".
  CENTER: as('centr'), // (verify) vs *vidurys*
  SIDE: e('pus'),
  // *paskirties vieta*, not *tikslas*: *tikslas* is PURPOSE's, and the two definitions would read alike
  // (the sweep's "no two concepts glossed alike"). A head with a genitive complement: only *vieta*
  // declines.
  DESTINATION: withGenitive('paskirties', a('viet')), // (verify)
  // The place a motion starts from, *išvykimo vieta*: only *vieta* declines.
  ORIGIN: withGenitive('išvykimo', a('viet')), // (verify) vs *pradžios taškas*
  // The way a motion goes through (es *recorrido*); *maršrutas* is a planned route.
  PATH: as('keli'), // (verify) vs *maršrutas*
  DIRECTION_SPACE: i('krypt'),
  BUILDING: as('pastat'),
  WALL: a('sien'),
  HOUSE: as('nam'),
  // Home is the plural-only *namai* (*grįžti namo, būti namuose*), apart from *namas*, a house.
  HOME: pluraleTantum('masc', 'namai, namų, namams, namus, namais, namuose'),
  ROOM: ys('kambar'),
  OFFICE: as('biur'), // (verify) vs *kabinetas*, one person's office
  // Plurale tantum: *durys yra atviros*, one door or several.
  DOOR: pluraleTantum('fem', 'durys, durų, durims, duris, durimis, duryse'),
  // *automobilis*; *mašina* is the everyday word, also "machine".
  CAR: is('automobil'), // (verify) vs *mašina*

  // ── People ───────────────────────────────────────────────────
  // *vaikas* is the child of either sex; the girl is *mergaitė* (as Polish's *dziewczynka*).
  CHILD: as('vaik', { extra: fem(e('mergait')) }),
  // Casual, the diminutive *vaikiukas*; its feminine the girl, as CHILD's.
  KID: as('vaikiuk', { extra: fem(e('mergait')) }), // (verify) vs *vaikėzas*, *mažylis*
  // *žmogus* is irregular: its plural is *žmonės*.
  PERSON: noun('masc', 'žmogus, žmogaus, žmogui, žmogų, žmogumi, žmoguje, žmogau', 'žmonės, žmonių, žmonėms, žmones, žmonėmis, žmonėse'),
  // The one speaking (linguistics' *kalbėtojas*); *oratorius* is an orator.
  SPEAKER: as('kalbėtoj', { extra: fem(a('kalbėtoj')) }),
  COMPANION: as('palydov', { extra: fem(e('palydov')) }), // (verify) vs *bendrakeleivis*, *bendražygis*
  RECIPIENT: as('gavėj', { extra: fem(a('gavėj')) }),
  // A young male child, as *mergaitė* is a young female one; *vaikinas* is the young man.
  BOY: as('berniuk'),
  GIRL: e('mergait'), // (verify) vs *mergina*, the young woman
  MAN: as('vyr'),
  // Casual *vyrukas*, a diminutive of *vyras*.
  GUY: as('vyruk'), // (verify) vs *vaikinas*, slang *bičas*
  // *moteris* is an *r*-stem: gen *moters*, gen pl *moterų*.
  WOMAN: noun('fem', 'moteris, moters, moteriai, moterį, moterimi, moteryje, moterie', 'moterys, moterų, moterims, moteris, moterimis, moteryse'), // (verify) voc *moterie*
  BUTCHER: as('mėsinink', { extra: fem(e('mėsinink')) }),
  ANGEL: as('angel'),

  // ── Life, feelings ───────────────────────────────────────────
  // *gyvenimas*, life as lived; *gyvybė* is being alive in the biological sense.
  LIFE: as('gyvenim'), // (verify) vs *gyvybė*, closer to the description
  END: a('pabaig'),
  BEGINNING: a('pradži'),
  DEATH: i('mirt'),
  FEELING: as('jausm'),
  // *jausmas* is FEELING; fondness toward someone is *prisirišimas*.
  AFFECTION: as('prisirišim', { sgOnly: true }), // (verify) vs *prieraišumas*, *meilumas*

  // ── The family ───────────────────────────────────────────────
  FAMILY: a('šeim'),
  // *tėvas* is FATHER (and *tėvai* the parents); one parent of either sex is *gimdytojas / gimdytoja*.
  PARENT: as('gimdytoj', { extra: fem(a('gimdytoj')) }), // (verify) register: formal
  FATHER: as('tėv'),
  // *motina*; *mama* is MOM.
  MOTHER: a('motin'),
  RELATIVE: is('giminait', { extra: fem(e('giminait')) }),
  // Someone's child: Lithuanian says *vaikas* for both the young person and the offspring (CHILD); the
  // feminine is the daughter.
  CHILD_OFFSPRING: as('vaik', {
    extra: fem(noun('fem', 'duktė, dukters, dukteriai, dukterį, dukterimi, dukteryje, dukterie', 'dukterys, dukterų, dukterims, dukteris, dukterimis, dukteryse')),
  }),
  SON: us('sūn'),
  // *duktė* is an *r*-stem (*dukters*); the everyday *dukra* declines as *ranka*.
  DAUGHTER: noun('fem', 'duktė, dukters, dukteriai, dukterį, dukterimi, dukteryje, dukterie', 'dukterys, dukterų, dukterims, dukteris, dukterimis, dukteryse'), // (verify) voc *dukterie* vs *dukra*
  // Lithuanian has no everyday singular for a sibling (*brolis ar sesuo*): brother, and sister as the
  // feminine, as Polish *brat/siostra*.
  SIBLING: is('brol', {
    extra: fem(noun('fem', 'sesuo, sesers, seseriai, seserį, seserimi, seseryje, sese', 'seserys, seserų, seserims, seseris, seserimis, seseryse')),
  }), // (verify)
  BROTHER: is('brol'),
  // *sesuo* is an *r*-stem (*sesers*); the vocative in address is *sese*.
  SISTER: noun('fem', 'sesuo, sesers, seseriai, seserį, seserimi, seseryje, sese', 'seserys, seserų, seserims, seseris, seserimis, seseryse'), // (verify) voc *sese* vs *seserie*
  SPOUSE: is('sutuoktin', { extra: fem(e('sutuoktin')) }),
  // Lithuanian says *vyras* for both the man and the husband (MAN), as German *Mann*; *sutuoktinis* is
  // SPOUSE.
  HUSBAND: as('vyr'),
  WIFE: a('žmon'),
  // Grandfather and grandmother, as Polish *dziadek/babcia*.
  GRANDPARENT: is('senel', { extra: fem(e('senel')) }),
  GRANDFATHER: is('senel'),
  GRANDMOTHER: e('senel'), // (verify) *senelė* vs the dated *senolė*, *bobutė*
  GRANDCHILD: as('anūk', { extra: fem(e('anūk')) }),
  GRANDSON: as('anūk'),
  GRANDDAUGHTER: e('anūk'),
  // *dėdė* is a masculine *-ė* noun.
  UNCLE: e('dėd', undefined, 'masc'),
  AUNT: a('tet'),
  COUSIN: is('pusbrol', { extra: fem(e('pusseser')) }),
  NEPHEW: as('sūnėn'),
  NIECE: a('dukterėči'),
  // Lithuanian names the in-laws by the spouse's sex: *uošvė* is a wife's mother, *anyta* a husband's;
  // the wife's is the one stored, as the more general in use.
  MOTHER_IN_LAW: e('uošv'), // (verify) vs *anyta*
  // *uošvis* is a wife's father, *šešuras* a husband's.
  FATHER_IN_LAW: is('uošv'), // (verify) vs *šešuras*
  SON_IN_LAW: as('žent'),
  // *marti* is irregular (gen *marčios*).
  DAUGHTER_IN_LAW: noun('fem', 'marti, marčios, marčiai, marčią, marčia, marčioje, marti', 'marčios, marčių, marčioms, marčias, marčiomis, marčiose'),
};
