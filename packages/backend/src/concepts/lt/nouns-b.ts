import type { LanguageColumn } from '../types.js';
import { a, as, e, fem, i, is, language, noun, paradigm, us, ys } from './helpers.js';

// The nouns, part B (P18-E5, style-lt.md): kin and people, things, places, languages, time, and the
// grammar's own terms — the slice of Polish's `pl/nouns-b.ts`. Every case is stored: singular nom,
// gen, dat, acc, ins, loc, voc; plural nom, gen, dat, acc, ins, loc. Grammar terms are Lithuanian
// school grammar's (*veiksnys, papildinys, aplinkybė …*). Every form is (verify) until the native
// review (P18-E12); the marked ones are the choices most worth a second look.

type Forms = Record<string, string>;

const CASES = ['base', 'gen_sg', 'dat_sg', 'acc_sg', 'ins_sg', 'loc_sg', 'voc_sg', 'plural', 'gen_pl', 'dat_pl', 'acc_pl', 'ins_pl', 'loc_pl'];

/**
 * A multiword noun, cell by cell: each part is a paradigm (an agreeing adjective, the head) or a fixed
 * word (an undeclined genitive complement, *lošimo automatas*). The last paradigm is the head: it gives
 * the gender and decides which cells exist (no plural if it has none).
 */
function zip(...parts: (Forms | string)[]): Forms {
  const head = [...parts].reverse().find((p): p is Forms => typeof p !== 'string')!;
  const out: Forms = { gender: head['gender']!, count: 'singular' };
  for (const k of CASES) {
    if (head[k] === undefined) continue;
    out[k] = parts.map((p) => (typeof p === 'string' ? p : p[k]!)).join(' ');
  }
  return out;
}

/** An agreeing adjective in *-is* (*tiesioginis*), masculine; its vocative is its nominative. */
const adjIs = (s: string) => paradigm(
  `${s}is, ${s}io, ${s}iam, ${s}į, ${s}iu, ${s}iame, ${s}is`,
  `${s}iai, ${s}ių, ${s}iams, ${s}ius, ${s}iais, ${s}iuose`,
);
/** An agreeing adjective in *-ė* (*veiksmažodinė*), feminine; its vocative is its nominative. */
const adjE = (s: string) => paradigm(
  `${s}ė, ${s}ės, ${s}ei, ${s}ę, ${s}e, ${s}ėje, ${s}ė`,
  `${s}ės, ${s}ių, ${s}ėms, ${s}es, ${s}ėmis, ${s}ėse`,
);

/** An *aplinkybė* (adverbial) of the grammar: the genitive of its kind before the declined head. */
const aplinkybe = (of: string) => zip(of, e('aplinkyb'));

const SG = { sgOnly: true };
const AS_NAME = { as_name: '1' };

export const LT_NOUNS_B: LanguageColumn = {
  // Kin and people.
  // (verify) *svainis* is strictly the wife's brother (*dieveris* the husband's); the general word now.
  BROTHER_IN_LAW: is('svain'),
  // (verify) *svainė* is strictly the wife's sister (*mulša* the husband's, archaic).
  SISTER_IN_LAW: e('svain'),
  STEPFATHER: is('patėv'),
  STEPMOTHER: e('pamot'),
  MOM: a('mam', { extra: AS_NAME }),
  DAD: is('tėt', { extra: AS_NAME }),
  PARTNER: is('partner', { extra: fem(e('partner')) }),
  // (verify) *vaikinas* is also a young man generally; GUY (nouns-a) should not take it too.
  BOYFRIEND: as('vaikin'),
  GIRLFRIEND: a('mergin'),
  FIANCE: is('sužadėtin', { extra: fem(e('sužadėtin')) }),
  FRIEND: as('draug', { extra: fem(e('draug')) }),
  YOUNG_MAN: is('jaunuol'),
  // (verify) the phrase, as Polish's *młoda kobieta*; *mergina* is GIRLFRIEND's, *jaunuolė* is rare.
  YOUNG_WOMAN: zip(a('jaun'), noun('fem', 'moteris, moters, moteriai, moterį, moterimi, moteryje, moterie', 'moterys, moterų, moterims, moteris, moterimis, moteryse')),
  BUILDER: as('statybinink', { extra: fem(e('statybinink')) }),
  CREATOR: as('kūrėj', { extra: fem(a('kūrėj')) }),
  // A person's name takes the vocative *-ai* (style-lt.md § Nouns).
  PETER: as('Petr', { sgOnly: true, extra: { voc_sg: 'Petrai' } }),
  MARY: a('Marij', SG),
  // (verify) the original spelling with the ending attached (*Diethas*), as VLKK allows for foreign names.
  DIETH: as('Dieth', { sgOnly: true, extra: { voc_sg: 'Diethai' } }),
  // The title before a name (*ponas Petras*), voc *pone*.
  MR: as('pon'),

  // Things.
  MARKET: us('turg'),
  COIN: a('monet'),
  LEGEND: a('legend'),
  WING: as('sparn'),
  // A masculine i-stem: dative *dančiui*, not the feminine *-iai* the `i` helper gives; gen pl *dantų*.
  TOOTH: noun('masc', 'dantis, danties, dančiui, dantį, dantimi, dantyje, dantie', 'dantys, dantų, dantims, dantis, dantimis, dantyse'),
  TEAR: a('ašar'),
  PRISON: as('kalėjim'),
  PHRASE: e('fraz'),
  SLOT: ys('plyš'),
  // (verify) *lizdas* (literally a nest) is the hardware and memory slot; *laiko tarpas* for a schedule.
  SLOT_COMPUTING: as('lizd'),
  // (verify) *lošimo automatas*; the head declines, *lošimo* does not.
  SLOT_MACHINE: zip('lošimo', as('automat')),
  WORD: is('žod'),
  MEANING: e('reikšm'),
  FACT: as('fakt'),
  // (verify) *motyvas*, "why someone does something": *priežastis* is CAUSE's (nouns-c), and the two
  // senses would gloss alike.
  REASON: as('motyv'),
  INFORMATION: a('informacij', SG),
  PROBABILITY: e('tikimyb'),
  TRANSLATION: as('vertim'),
  QUESTION: as('klausim'),
  TELEPHONE: as('telefon'),
  MIND: as('prot'),
  BRACKET: as('skliaust'),
  // (verify) *talpykla*, the general holder; *indas* is a vessel or dish, *konteineris* the shipping box.
  CONTAINER: a('talpykl'),
  MAP: is('žemėlap'),
  NODE: as('mazg'),
  RELATIONSHIP: is('santyk'),
  CONDITION: a('sąlyg'),

  // Numbers and measures.
  NUMBER: us('skaiči'),
  NUMBER_LABEL: is('numer'),
  QUANTITY: is('kiek'),
  UNIT: as('vienet'),
  PERCENT: as('procent'),
  CATEGORY: a('kategorij'),
  KIND_SORT: i('rūš'),

  // Places.
  CONTINENT: as('žemyn'),
  AFRICA: a('Afrik', SG),
  EUROPE: a('Europ', SG),
  ASIA: a('Azij', SG),
  OCEANIA: a('Okeanij', SG),
  // The genitive of the quarter before the declined head: *Šiaurės Amerika, Šiaurės Amerikos …*.
  NORTH_AMERICA: zip('Šiaurės', a('Amerik', SG)),
  SOUTH_AMERICA: zip('Pietų', a('Amerik', SG)),
  ANTARCTICA: a('Antarktid', SG),
  COUNTRY: i('šal'),
  CITY: as('miest'),
  ENGLAND: a('Anglij', SG),
  // Singular in Lithuanian, where Polish's *Włochy* and *Niemcy* are plural-only.
  ITALY: a('Italij', SG),
  FRANCE: a('Prancūzij', SG),
  GERMANY: a('Vokietij', SG),
  SPAIN: a('Ispanij', SG),
  JAPAN: a('Japonij', SG),
  PORTUGAL: a('Portugalij', SG),
  ZURICH: as('Ciurich', SG),

  // Languages: the people's genitive plural + *kalba* (P18 §3), lowercase.
  LANGUAGE: a('kalb'),
  ENGLISH: language('anglų'),
  ITALIAN: language('italų'),
  FRENCH: language('prancūzų'),
  GERMAN: language('vokiečių'),
  SPANISH: language('ispanų'),
  JAPANESE: language('japonų'),
  PORTUGUESE: language('portugalų'),
  SWISS_GERMAN: language('šveicarų vokiečių'),
  ROMANSH: language('retoromanų'),
  // (verify) the three standards have no people to name them by: their own name, undeclined, before
  // *kalba*, as *esperanto kalba*.
  RUMANTSCH_GRISCHUN: language('rumantsch grischun'),
  SURSILVAN: language('sursilvan'),
  VALLADER: language('vallader'),
  CATALAN: language('katalonų'),
  POLISH: language('lenkų'),
  // P18-E3: the language of the row. The name is the people's genitive plural + *kalba* (P18 §3).
  LITHUANIAN: language('lietuvių'),
  SPELLING: a('rašyb'),

  // Time.
  PERIOD_TIME: is('laikotarp'),
  MOMENT: a('akimirk'),
  DAY: a('dien'),
  HOUR: a('valand'),
  MINUTE: e('minut'),
  // (verify) voc *mėnesi*; the other cases build on *mėnes-*.
  MONTH: noun('masc', 'mėnuo, mėnesio, mėnesiui, mėnesį, mėnesiu, mėnesyje, mėnesi', 'mėnesiai, mėnesių, mėnesiams, mėnesius, mėnesiais, mėnesiuose'),
  WEEK: e('savait'),
  NIGHT: i('nakt', { genPl: 'naktų' }),
  // (verify) *rytas*; *priešpietis* is the whole forenoon.
  MORNING: as('ryt'),
  // Plurale tantum: one year is *vieneri metai*, so the singular keys hold the plural too.
  YEAR: noun('masc', 'metai, metų, metams, metus, metais, metuose, metai', 'metai, metų, metams, metus, metais, metuose', { plurale_tantum: '1' }),

  // The grammar's terms.
  // (verify) *veiksmo dalyvis*, the semantic-role term; *dalyvis* alone is also the participle.
  PARTICIPANT_GRAMMAR: zip('veiksmo', is('dalyv')),
  AGENT_GRAMMAR: as('agent'),
  SUBJECT_GRAMMAR: ys('veiksn'),
  // *kreipinys*, the phrase of address; the case is *šauksmininkas*.
  VOCATIVE: ys('kreipin'),
  OBJECT_GRAMMAR: ys('papildin'),
  // (verify) *predikatyvas*; school grammar says *vardinė tarinio dalis*.
  SUBJECT_COMPLEMENT: as('predikatyv'),
  // (verify) school grammar has no name for it; the head declines, *papildinio* does not.
  OBJECT_COMPLEMENT: zip('papildinio', as('predikatyv')),
  // (verify) *priemonės* and *palydos aplinkybė*: school grammar counts both as *papildinys*.
  INSTRUMENTAL: aplinkybe('priemonės'),
  COMITATIVE: aplinkybe('palydos'),
  ADVERBIAL_OF_MANNER: aplinkybe('būdo'),
  // (verify) *antrininė sakinio dalis*, the school umbrella for *papildinys, aplinkybė, pažyminys*
  // (as Polish's *określenie*); *papildinys* alone is OBJECT_GRAMMAR's.
  COMPLEMENT_GRAMMAR: zip(adjE('antrinin'), 'sakinio', i('dal')),
  LOCATIVE: aplinkybe('vietos'),
  // (verify) the three motion adverbials: school grammar folds them into *vietos aplinkybė*.
  DIRECTION: aplinkybe('krypties'),
  SOURCE: aplinkybe('išeities taško'),
  ROUTE: aplinkybe('kelio'),
  CAUSE_COMPLEMENT: aplinkybe('priežasties'),
  TEMPORAL_COMPLEMENT: aplinkybe('laiko'),
  PURPOSE_COMPLEMENT: aplinkybe('tikslo'),
  // (verify) *priešininko*, *temos*, *funkcijos*: modelled on Spanish's names, not school grammar's.
  OPPONENT_COMPLEMENT: aplinkybe('priešininko'),
  TOPIC_COMPLEMENT: aplinkybe('temos'),
  ROLE_COMPLEMENT: aplinkybe('funkcijos'),
  INTERJECTION: as('jaustuk'),
  // The indirect object: *netiesioginis papildinys* (the direct one is *tiesioginis*).
  TERMINUS: zip(adjIs('netiesiogin'), ys('papildin')),
  NOUN: is('daiktavard'),
  PRONOUN: is('įvard'),
  VERB: is('veiksmažod'),
  ADVERB: is('prieveiksm'),
  ADJECTIVE: is('būdvard'),
  // (verify) *bendratinė / veiksmažodinė / daiktavardinė frazė* (also *… junginys*).
  INFINITIVE_PHRASE: zip(adjE('bendratin'), e('fraz')),
  VERB_PHRASE: zip(adjE('veiksmažodin'), e('fraz')),
  NOUN_PHRASE: zip(adjE('daiktavardin'), e('fraz')),
  CLAUSE: ys('sakin'),
  // (verify) *šalutinis pažyminio sakinys*, the school name; *pažyminio* does not decline.
  RELATIVE_CLAUSE: zip(adjIs('šalutin'), 'pažyminio', ys('sakin')),
  // (verify) *tiesioginis sakinys*, the declarative of the school's *tiesioginiai, klausiamieji, skatinamieji*.
  STATEMENT: zip(adjIs('tiesiogin'), ys('sakin')),
  // (verify) *sujungimas*; also *sujungiamasis ryšys*.
  COORDINATION: as('sujungim'),
  // (verify) *vienarūšė sakinio dalis*, school grammar's member of a coordination.
  CONJUNCT: zip(adjE('vienarūš'), 'sakinio', i('dal')),
  CONJUNCTION: as('jungtuk'),
  // (verify) *modifikatorius*; *pažyminys* is the attribute, a part of the sentence.
  MODIFIER: us('modifikatori'),
  HYPERNYM: as('hiperonim'),
  // (verify) *determinantas*.
  DETERMINER: as('determinant'),
  ARTICLE: is('artikel'),
  // The term keeps the definite (pronominal) adjective, *parodomasis įvardis*: a name, not D8's phrase.
  DEMONSTRATIVE: zip(
    paradigm('parodomasis, parodomojo, parodomajam, parodomąjį, parodomuoju, parodomajame, parodomasis', 'parodomieji, parodomųjų, parodomiesiems, parodomuosius, parodomaisiais, parodomuosiuose'),
    is('įvard'),
  ),
  // (verify) *kvantorius*.
  QUANTIFIER: us('kvantori'),
  // (verify) *pasakymas*, the whole utterance (*sakinys* is CLAUSE's), as Polish's *wypowiedzenie*.
  PERIOD_SENTENCE: as('pasakym'),
  PERIOD_PUNCTUATION: as('tašk'),
  // *asmuo*, a consonant stem. Lithuanian names the grammatical person with the word for a person,
  // as Polish does (*osoba*), so it may share PERSON's word.
  PERSON_GRAMMAR: noun('masc', 'asmuo, asmens, asmeniui, asmenį, asmeniu, asmenyje, asmenie', 'asmenys, asmenų, asmenims, asmenis, asmenimis, asmenyse'),
  // *skaičius* is both the number counted and the grammatical number, as Polish's *liczba*.
  NUMBER_GRAMMAR: us('skaiči'),
  SINGULAR_GRAMMAR: a('vienaskait'),
  PLURAL_GRAMMAR: a('daugiskait'),
  CASE_GRAMMAR: is('linksn'),
};
