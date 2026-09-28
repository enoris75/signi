import type { LanguageColumn } from '../types.js';
import { a, as, e, fem, i, is, noun, paradigm, ys } from './helpers.js';

// The nouns, part C (P18-E5, style-lt.md): grammar terms as Lithuanian school grammar names them
// (*naudininkas, kilmininkas, esamasis laikas, nuosaka, nelyginamasis laipsnis*), interface words as
// Lithuanian software says them (*mygtukas, klavišas, parinktis, iškarpinė, įrankių juosta*), and the
// abstract and everyday nouns of the slice. Every form is (verify) until the native review (P18-E12);
// the marked ones are the choices most worth a look. Polish's `virile`, `animate_acc` and its
// plurale tantum *plecy* describe Polish forms, not meaning, and are not carried over; Lithuanian's own
// plurals-only (*lenktynės, dujos, tyrimai, naujienos*) carry `plurale_tantum`.

type Forms = Record<string, string>;

const CASES = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg', 'plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'];

/**
 * A multiword noun from its head's entry: `mod` is written before every case cell — a fixed genitive
 * complement (*įrankių juosta*: only the head declines) or, as a paradigm under the same keys, an
 * agreeing adjective (*esamasis laikas, esamojo laiko, …*).
 */
function before(mod: string | Forms, head: Forms): Forms {
  const out: Forms = { ...head };
  for (const k of CASES) {
    if (head[k] === undefined) continue;
    const m = typeof mod === 'string' ? mod : mod[k];
    if (m === undefined) throw new Error(`lt nouns-c: no modifier cell for ${k}`);
    out[k] = `${m} ${head[k]}`;
  }
  return out;
}

/** A pronominal (definite) *-asis* adjective's cells, the fixed form of a grammar term (*esamasis*). */
const definite = (s: string) => paradigm(
  `${s}asis, ${s}ojo, ${s}ajam, ${s}ąjį, ${s}uoju, ${s}ajame, ${s}asis`,
  `${s}ieji, ${s}ųjų, ${s}iesiems, ${s}uosius, ${s}aisiais, ${s}uosiuose`);

/** A plural-only noun: the plural in every singular key too (as Polish's), the vocative = nominative. */
function pluraleTantum(gender: 'masc' | 'fem', pl: string): Forms {
  const nom = pl.split(',')[0]!.trim();
  return noun(gender, `${pl}, ${nom}`, pl, { plurale_tantum: '1' });
}

// *laikas* is TIME's word too: Lithuanian grammar names tense with it (*esamasis laikas*). (verify)
const laikas = as('laik');
const laipsnis = is('laipsn');

export const LT_NOUNS_C: LanguageColumn = {
  // Grammar.
  DATIVE: as('naudinink'),
  GENITIVE: as('kilminink'),
  // Grammatical gender is *giminė* (*vyriškoji giminė*).
  GENDER: e('gimin'),
  TENSE: laikas,
  // School grammar's fixed terms take the pronominal adjective: *esamasis, būtasis, būsimasis laikas*.
  PRESENT_TENSE: before(definite('esam'), laikas),
  // *būtasis kartinis laikas* in full; *būtasis laikas* covers the past as a whole. (verify)
  PAST_TENSE: before(definite('būt'), laikas),
  FUTURE_TENSE: before(definite('būsim'), laikas),
  ASPECT: as('veiksl'),
  // Grammar's *veikiamoji / neveikiamoji rūšis*: the same word as a kind or a sort, which Lithuanian
  // genuinely uses for both. (verify)
  VOICE: i('rūš'),
  POLARITY: as('poliarum'), // (verify) a linguistics coinage; the plural is rare
  // The stance a text takes: *vertinimas* (evaluation); *nuotaika* is rather a mood. (verify)
  SENTIMENT: as('vertinim'),
  MOOD: a('nuosak'),
  DEGREE_GRAMMAR: laipsnis,
  // School grammar's *nelyginamasis, aukštesnysis, aukščiausiasis laipsnis*.
  POSITIVE_DEGREE: before(definite('nelyginam'), laipsnis),
  // (verify) *palyginimo pagrindas* is a descriptive term, as Polish's *podstawa porównania*.
  STANDARD_OF_COMPARISON: before('palyginimo', as('pagrind')),
  // (verify) *palyginimo aibė*, a coinage on the model of *palyginimo pagrindas*.
  COMPARISON_SET: before('palyginimo', e('aib')),
  MODAL: before(paradigm('modalinis, modalinio, modaliniam, modalinį, modaliniu, modaliniame, modalinis',
    'modaliniai, modalinių, modaliniams, modalinius, modaliniais, modaliniuose'), is('veiksmažod')),

  // Commands and instructions.
  // A command typed or given to a program. *komanda* is TEAM's word too: Lithuanian uses the one word
  // for both senses. (verify)
  COMMAND: a('komand'),
  // The command given to a person.
  ORDER: as('įsakym'),
  // A step telling what to do, addressed to nobody: *nurodymas*; *instrukcija* is rather a manual. (verify)
  INSTRUCTION: as('nurodym'),
  REGISTER: as('registr'),
  // The formality of a register: *oficialumas*; *formalumas* is rather a formality to go through. (verify)
  FORMALITY: as('oficialum', { sgOnly: true }),

  // The interface.
  // *parinktis* is software's option (*parinktys*); *galimybė* is a possibility in general.
  OPTION: i('parinkt'),
  BUTTON: as('mygtuk'),
  KEYBOARD: a('klaviatūr'),
  KEY: as('klaviš'),
  // The arrow key: *rodyklė* (*rodyklės klavišas*), not ARROW_PROJECTILE's *strėlė*. (verify)
  ARROW: e('rodykl'),
  // A part of a page or a screen: *sritis* (*ekrano sritis*). (verify) against AREA's word.
  REGION: i('srit'),
  GROUP: e('grup'),
  MEMBER: ys('nar'),
  // *vakarėlis*, the everyday word; *pobūvis* is a formal reception. (verify)
  PARTY_CELEBRATION: is('vakarėl'),
  // A row across a grid: *eilė*; LINE is *eilutė*.
  ROW: e('eil'),
  // Indeclinable *meniu*, masculine.
  MENU: noun('masc', 'meniu, meniu, meniu, meniu, meniu, meniu, meniu', 'meniu, meniu, meniu, meniu, meniu, meniu'),
  // A browser or panel tab: *skirtukas*; Firefox says *kortelė*. (verify)
  TAB: as('skirtuk'),
  // The thing a link points to: *tikslas*; PURPOSE is *paskirtis*. (verify)
  TARGET: as('tiksl'),
  HELP: a('pagalb', { sgOnly: true }),
  NAVIGATION: a('navigacij', { sgOnly: true }),
  // The name of a thing: *pavadinimas*; a person's name is *vardas*.
  NAME_NOUN: as('pavadinim'),
  // (verify) *slapyvardis* is a person's pseudonym; software also says *alternatyvusis vardas*.
  ALIAS: is('slapyvard'),
  // A document's title, as its heading: *antraštė* — *pavadinimas* is NAME_NOUN's. (verify)
  TITLE: e('antrašt'),
  // Bringing data into a program: *įkėlimas* (*įkeliama…*); *įkrovimas* is rather charging. (verify)
  LOADING: as('įkėlim', { sgOnly: true }),
  // The standard term is *sąsaja* (*naudotojo sąsaja*).
  INTERFACE: a('sąsaj'),
  SERVER: is('server'),
  RESULT: as('rezultat'),
  IMPORT_NOUN: as('import'),
  ICON: a('piktogram'),
  FILE: as('fail'),
  // *iškarpinė*, the standard word for the clipboard.
  CLIPBOARD: e('iškarpin'),
  // A line of text typed as one command: *eilutė* (*komandų eilutė*).
  LINE: e('eilut'),
  // The lines typed before: *komandų istorija*, so as not to read as HISTORY_PAST's *istorija*. (verify)
  HISTORY: before('komandų', a('istorij', { sgOnly: true })),
  // (verify) *darbo sritis*; *darbo erdvė* is also said.
  WORKSPACE: before('darbo', i('srit')),
  // How a word is used: *vartosena* (*žodžio vartosena*).
  USAGE: a('vartosen', { sgOnly: true }),
  EXAMPLE: ys('pavyzd'),
  CONSOLE: e('konsol'),
  // The painter's canvas, as Polish *płótno* and Spanish *lienzo*. (verify)
  CANVAS: e('drob'),
  PREVIEW: a('peržiūr'),
  TOOLBAR: before('įrankių', a('juost')),
  LIST: as('sąraš'),
  // (verify) software's word is *reikšmė*, but that is MEANING's; *vertė* is the value a thing has.
  VALUE: e('vert'),
  // The text cursor: *žymeklis*; the mouse pointer is *rodyklė*.
  CURSOR: is('žymekl'),
  TEXT: as('tekst'),
  // Something that points to something else: *nuoroda* (also a link).
  REFERENCE: a('nuorod'),

  // Relations and abstractions.
  // (verify) *priežastis* is REASON's likely word too.
  CAUSE: i('priežast'),
  POSSESSOR: as('savinink', { extra: fem(e('savinink')) }),
  PROPERTY: e('nuosavyb', { sgOnly: true }),
  FEATURE: as('bruož'),
  // The sphere a thing belongs to: *sfera*, so as not to read as REGION's *sritis*. (verify)
  DOMAIN: a('sfer'),
  MEANS: e('priemon'),
  // What something is for: *paskirtis*; TARGET is *tikslas*.
  PURPOSE: i('paskirt'),
  // (verify) *naudojimas* (the way a thing is used); USAGE is *vartosena*.
  USE_NOUN: as('naudojim'),
  WORK_NOUN: as('darb', { sgOnly: true }),
  // Research is plural in Lithuanian (*moksliniai tyrimai*); the singular *tyrimas* is one study. (verify)
  RESEARCH: pluraleTantum('masc', 'tyrimai, tyrimų, tyrimams, tyrimus, tyrimais, tyrimuose'),
  STUDY_NOUN: a('studij'),
  // What something is made of: *medžiaga*; SUBSTANCE is *substancija*. (verify)
  MATERIAL: a('medžiag'),
  // Wood as a material: *mediena*; *medis* is the tree.
  WOOD: a('medien', { sgOnly: true }),
  LEVEL: is('lyg'),
  PROCESS: as('proces'),
  // The act or result of becoming different: *pokytis*; *pakeitimas* is a change one makes. (verify)
  CHANGE_NOUN: is('pokyt'),
  SYSTEM: a('sistem'),
  PROGRAM_SOFTWARE: a('program'),
  // A broadcast show: *laida* (*televizijos laida*).
  PROGRAM_SHOW: a('laid'),
  CONCEPT: a('sąvok'),
  IDEA: a('idėj'),
  ACTION: as('veiksm'),
  EVENT: is('įvyk'),
  // A race is plural-only: *lenktynės, lenktynių*.
  RACE: pluraleTantum('fem', 'lenktynės, lenktynių, lenktynėms, lenktynes, lenktynėmis, lenktynėse'),
  GAME: as('žaidim'),
  // A material thing one can hold: *daiktas*; THING (anything, material or not) is *dalykas*.
  OBJECT_THING: as('daikt'),
  DEVICE: as('prietais'),
  BOMB: a('bomb'),
  THING: as('dalyk'),
  PROBLEM: a('problem'),
  // (verify) a matter people discuss: *reikalas*; *klausimas* would read as QUESTION.
  ISSUE: as('reikal'),
  // *šiuo atveju*. A *j*-stem keeps no *i* after *j* (*atvejo*, not *atvejio*), so written out.
  CASE_INSTANCE: noun('masc', 'atvejis, atvejo, atvejui, atvejį, atveju, atvejyje, atveji',
    'atvejai, atvejų, atvejams, atvejus, atvejais, atvejuose'),
  BEING: e('būtyb'),

  // The body.
  BODY: as('kūn'),
  ORGAN: as('organ'),
  TESTICLE: e('sėklid'),
  OVARY: e('kiaušid'),
  MILK: as('pien', { sgOnly: true }),
  GRASS: e('žol', { sgOnly: true }),
  // The energy a hot thing gives off: *šiluma*; hot weather is *karštis*.
  HEAT: a('šilum', { sgOnly: true }),
  EYE: i('ak'),
  HAND: a('rank'),
  HEAD: a('galv'),
  FACE: as('veid'),
  // *nugara* is an ordinary singular in Lithuanian (Polish *plecy* is plural-only).
  BACK_BODY: a('nugar'),
  HEALTH: a('sveikat', { sgOnly: true }),
  // A telling of events: *pasakojimas*; HISTORY_PAST is *istorija*. (verify)
  STORY: as('pasakojim'),
  HISTORY_PAST: a('istorij', { sgOnly: true }),
  // The news is plural (*naujienos*); the singular *naujiena* is one piece of news. (verify)
  NEWS: pluraleTantum('fem', 'naujienos, naujienų, naujienoms, naujienas, naujienomis, naujienose'),
  // (verify) *substancija*, so as not to read as MATERIAL's *medžiaga*, the everyday word for both.
  SUBSTANCE: a('substancij', { sgOnly: true }),
  // The way a thing is at a time: *būsena*; STATE_NATION is *valstybė*.
  STATE: a('būsen'),
  // Gas is plural-only: *dujos, dujų*.
  GAS: pluraleTantum('fem', 'dujos, dujų, dujoms, dujas, dujomis, dujose'),
  JOY: as('džiaugsm', { sgOnly: true }),
  SORROW: ys('liūdes', { sgOnly: true }),
  ERROR: a('klaid'),
  REALITY: e('tikrov'),
  REST: is('poils', { sgOnly: true }),
  ATTENTION: ys('dėmes', { sgOnly: true }),
  ABILITY: as('gebėjim'),
  DUTY: a('pareig'),
  KINDNESS: as('gerum', { sgOnly: true }),
  WISDOM: i('išmint', { sgOnly: true }),
  FOLLY: as('kvailum', { sgOnly: true }),
  // (verify) *žemė* is also the earth and the ground; GROUND may want the same word.
  LAND: e('žem', { sgOnly: true }),

  // Society.
  NATION: a('taut'),
  SCHOOL: a('mokykl'),
  // (verify) *studentas* is the university student; a school pupil is *mokinys*.
  STUDENT: as('student', { extra: fem(e('student')) }),
  COMPANY_BUSINESS: e('įmon'),
  // People who play or work together: *komanda*, COMMAND's word too (see there). (verify)
  TEAM: a('komand'),
  COMMUNITY: e('bendruomen'),
  UNIVERSITY: as('universitet'),
  SERVICE: a('paslaug'),
  // Buying and selling: *prekyba*; *verslas* is business as an occupation. (verify)
  BUSINESS: a('prekyb', { sgOnly: true }),
  STATE_NATION: e('valstyb'),
  // Authority: *valdžia* (*valdžios*, the authorities).
  POWER: a('valdži'),
  GOVERNMENT: e('vyriausyb'),
  PARTY_POLITICAL: a('partij'),
  // A law a state makes: *įstatymas*; *teisė* is RIGHT_NOUN (and the law as a whole).
  LAW: as('įstatym'),
  COURT_LAW: as('teism'),
  RIGHT_NOUN: e('teis'),
  WAR: as('kar'),
  WORLD: is('pasaul'),
  PICTURE: as('paveiksl'),
  SCREEN: as('ekran'),
  // Birds: all three feminine, whatever the animal's sex.
  SEAGULL: a('žuvėdr'),
  SWALLOW: e('kregžd'),
  PARROT: a('papūg'),
  PART: i('dal'),
};
