import type { LanguageColumn } from '../types.js';
import { verb, type AspectForms } from './helpers.js';

/**
 * Polish verbs, part A (P05-E5): standard written Polish, one lexeme holding both aspects
 * (style-pl.md § Verbs, P05 D1). Every form is *(verify)* until the native review (P05-E11);
 * `// (verify)` marks the choices the author is specifically unsure of.
 *
 * The regular classes are built by the local helpers below, and every form they produce is pinned
 * against a hand-written list in `verbs-a.test.ts` for a sample of each class:
 *  - `am` — the *-ać / -am* class (*czytać: czytam, czytają; czytał; czytaj; czytając; czytany*);
 *  - `uje` — *-ować / -ywać* (*kupować: kupuję; kupował; kupuj; kupując; kupowany*);
 *  - `aje` — *-(d/st/n)awać* (*dodawać: dodaję; dodawał; dodawaj; dodając; dodawany*);
 *  - `nie` — *-nąć* (*krzyknąć: krzyknę, krzykniesz; krzyknął, krzyknęli; krzyknij; krzyknięty*);
 *  - `ic` — the *-ić / -yć / -eć* class with its two stems (*gaszę / gasisz*);
 *  - `pre` — a perfective made by prefixing its imperfective (*robić → zrobić*).
 * Everything else is written out (`x`).
 *
 * Mirrored meaning flags: KNOW's `content_clause_force` and `object_sense`, CAUSE_VERB's `causative`,
 * TRANSFORM's `object_predicative_link` (*w* + accusative). Dropped: `particle` (German), `object_no_a`
 * and `terminus_tonic` (Spanish). EAT's German `subject_sense: EAT_ANIMAL` (*fressen*) is not mirrored:
 * Polish says *kot je* as it says *człowiek je* (*żreć* is colloquial and pejorative), as Spanish does.
 *
 * Stative concepts (LOVE, DESIRE, KNOW, KNOW_ACQUAINTED, REMEMBER, EXPECT, OWN, HOLD, INCLUDE, NEED,
 * HAVE, DEPEND) are stored unpaired: their perfective prefixes change the meaning (*zapamiętać* is
 * "memorise", *zawrzeć* "conclude"), and the neutral past must stay *pamiętał*, *zawierał*.
 */

type Opts = { imp?: boolean; adv?: boolean; pass?: boolean };
const ON: Required<Opts> = { imp: true, adv: true, pass: true };

/** Splits `inf` into its stem and its trailing *się* (kept only on the infinitive). */
function split(inf: string): [string, string] {
  return inf.endsWith(' się') ? [inf.slice(0, -4), ' się'] : [inf, ''];
}

/** *-ać / -am*: czytać → czytam, czytasz, czyta, czytamy, czytacie, czytają. */
function am(inf: string, o: Opts = {}): AspectForms {
  const { imp, adv, pass } = { ...ON, ...o };
  const s = split(inf)[0].slice(0, -2);
  return {
    inf,
    nonpast: `${s}am, ${s}asz, ${s}a, ${s}amy, ${s}acie, ${s}ają`,
    past: `${s}ał, ${s}ała, ${s}ało, ${s}ali, ${s}ały`,
    ...(imp ? { imperative: `${s}aj, ${s}ajmy, ${s}ajcie` } : {}),
    ...(adv ? { adverbial: `${s}ając` } : {}),
    ...(pass ? { passive: `${s}any, ${s}ani` } : {}),
  };
}

/** *-ować / -ywać*: kupować → kupuję …; kupował; kupuj; kupując; kupowany. */
function uje(inf: string, o: Opts = {}): AspectForms {
  const { imp, adv, pass } = { ...ON, ...o };
  const b = split(inf)[0].slice(0, -1); // kupowa-
  const s = b.replace(/(ow|yw|iw)a$/, ''); // kup-
  return {
    inf,
    nonpast: `${s}uję, ${s}ujesz, ${s}uje, ${s}ujemy, ${s}ujecie, ${s}ują`,
    past: `${b}ł, ${b}ła, ${b}ło, ${b}li, ${b}ły`,
    ...(imp ? { imperative: `${s}uj, ${s}ujmy, ${s}ujcie` } : {}),
    ...(adv ? { adverbial: `${s}ując` } : {}),
    ...(pass ? { passive: `${b}ny, ${b}ni` } : {}),
  };
}

/** *-awać*: dodawać → dodaję …; dodawał; dodawaj; dodając; dodawany. */
function aje(inf: string, o: Opts = {}): AspectForms {
  const { imp, adv, pass } = { ...ON, ...o };
  const b = inf.slice(0, -1); // dodawa-
  const s = inf.slice(0, -4); // dod-
  return {
    inf,
    nonpast: `${s}aję, ${s}ajesz, ${s}aje, ${s}ajemy, ${s}ajecie, ${s}ają`,
    past: `${b}ł, ${b}ła, ${b}ło, ${b}li, ${b}ły`,
    ...(imp ? { imperative: `${b}j, ${b}jmy, ${b}jcie` } : {}),
    ...(adv ? { adverbial: `${s}ając` } : {}),
    ...(pass ? { passive: `${b}ny, ${b}ni` } : {}),
  };
}

/**
 * *-nąć* after a hard consonant: krzyknąć → krzyknę, krzykniesz …; krzyknął, krzyknęła, krzyknęli;
 * krzyknij; krzyknięty. `imp2sg` overrides the imperative's stem (*usunąć → usuń*).
 */
function nie(inf: string, o: Opts & { imp2sg?: string } = {}): AspectForms {
  const { imp, adv, pass } = { ...ON, ...o };
  const s = inf.slice(0, -2); // krzykn-
  const i = o.imp2sg ?? `${s}ij`;
  return {
    inf,
    nonpast: `${s}ę, ${s}iesz, ${s}ie, ${s}iemy, ${s}iecie, ${s}ą`,
    past: `${s}ął, ${s}ęła, ${s}ęło, ${s}ęli, ${s}ęły`,
    ...(imp ? { imperative: `${i}, ${i}my, ${i}cie` } : {}),
    ...(adv ? { adverbial: `${s}ąc` } : {}),
    ...(pass ? { passive: `${s}ięty, ${s}ięci` } : {}),
  };
}

/**
 * The *-ić / -yć / -eć* class. `s1` is the stem of the 1sg and 3pl (and the adverbial): *gasz-*;
 * `s2` the stem of the other persons: *gasi-*. The past comes from the infinitive (*gasi-ł, gasi-li*;
 * *widzia-ł, widzie-li* for *-eć*). `imp2sg` is the 2sg imperative (*gaś*), `passive` the masc and
 * virile passive (*gaszony, gaszeni*).
 */
function ic(inf: string, s1: string, s2: string, imp2sg: string | undefined, passive?: string, adv = true): AspectForms {
  const bare = split(inf)[0];
  let past: string;
  if (bare.endsWith('eć')) {
    const a = `${bare.slice(0, -2)}a`;
    past = `${a}ł, ${a}ła, ${a}ło, ${bare.slice(0, -2)}eli, ${a}ły`;
  } else {
    const b = bare.slice(0, -1);
    past = `${b}ł, ${b}ła, ${b}ło, ${b}li, ${b}ły`;
  }
  return {
    inf,
    nonpast: `${s1}ę, ${s2}sz, ${s2}, ${s2}my, ${s2}cie, ${s1}ą`,
    past,
    ...(imp2sg ? { imperative: `${imp2sg}, ${imp2sg}my, ${imp2sg}cie` } : {}),
    ...(adv ? { adverbial: `${s1}ąc` } : {}),
    ...(passive ? { passive } : {}),
  };
}

/** A form written out. */
function x(inf: string, nonpast: string, past: string, rest: Omit<AspectForms, 'inf' | 'nonpast' | 'past'> = {}): AspectForms {
  return { inf, nonpast, past, ...rest };
}

/** Prefixes every cell of `a` (*robić → zrobić*, *rób → zrób*); a perfective has no adverbial. */
function pre(prefix: string, a: AspectForms): AspectForms {
  const p = (list: string) => list.split(', ').map((w) => prefix + w).join(', ');
  return {
    inf: prefix + a.inf,
    nonpast: p(a.nonpast),
    past: p(a.past),
    ...(a.pastStem ? { pastStem: prefix + a.pastStem } : {}),
    ...(a.imperative ? { imperative: p(a.imperative) } : {}),
    ...(a.passive ? { passive: p(a.passive) } : {}),
  };
}

/** `verb`, dropping the perfective's adverbial (the contemporary participle is imperfective only). */
function v(ipf: AspectForms, pf?: AspectForms, extra?: Record<string, string>) {
  if (pf) {
    const { adverbial: _drop, ...rest } = pf;
    return verb(ipf, rest, extra);
  }
  return verb(ipf, undefined, extra);
}

// The imperfectives that more than one concept or a prefixed perfective reuse.
const JESC = x('jeść', 'jem, jesz, je, jemy, jecie, jedzą', 'jadł, jadła, jadło, jedli, jadły', {
  imperative: 'jedz, jedzmy, jedzcie', adverbial: 'jedząc', passive: 'jedzony, jedzeni',
});
const ROBIC = ic('robić', 'robi', 'robi', 'rób', 'robiony, robieni');
const EAT = v(JESC, pre('z', JESC));

export const PL_VERBS_A: LanguageColumn = {
  // ciąć / przeciąć — cut through; *kroić / pokroić* is slicing food. (verify: the partner)
  CUT: v(
    x('ciąć', 'tnę, tniesz, tnie, tniemy, tniecie, tną', 'ciął, cięła, cięło, cięli, cięły', {
      imperative: 'tnij, tnijmy, tnijcie', adverbial: 'tnąc', passive: 'cięty, cięci',
    }),
    x('przeciąć', 'przetnę, przetniesz, przetnie, przetniemy, przetniecie, przetną', 'przeciął, przecięła, przecięło, przecięli, przecięły', {
      imperative: 'przetnij, przetnijmy, przetnijcie', passive: 'przecięty, przecięci',
    }),
  ),
  EAT,
  // Polish animals *jedzą* too; *żreć* is colloquial (see the header). (verify)
  EAT_ANIMAL: EAT,
  DRINK: v(
    x('pić', 'piję, pijesz, pije, pijemy, pijecie, piją', 'pił, piła, piło, pili, piły', {
      imperative: 'pij, pijmy, pijcie', adverbial: 'pijąc', passive: 'pity, pici',
    }),
    x('wypić', 'wypiję, wypijesz, wypije, wypijemy, wypijecie, wypiją', 'wypił, wypiła, wypiło, wypili, wypiły', {
      imperative: 'wypij, wypijmy, wypijcie', passive: 'wypity, wypici',
    }),
  ),
  // nalewać / nalać — pour (a drink, out of a jug); *wylewać* is "pour out, spill". (verify)
  POUR: v(
    am('nalewać'),
    x('nalać', 'naleję, nalejesz, naleje, nalejemy, nalejecie, naleją', 'nalał, nalała, nalało, nalali, nalały', {
      imperative: 'nalej, nalejmy, nalejcie', passive: 'nalany, nalani',
    }),
  ),
  CONSUME: v(
    am('spożywać'),
    x('spożyć', 'spożyję, spożyjesz, spożyje, spożyjemy, spożyjecie, spożyją', 'spożył, spożyła, spożyło, spożyli, spożyły', {
      imperative: 'spożyj, spożyjmy, spożyjcie', passive: 'spożyty, spożyci',
    }),
  ),
  // *widź* is archaic: no imperfective imperative.
  SEE: v(
    ic('widzieć', 'widz', 'widzi', undefined, 'widziany, widziani'),
    ic('zobaczyć', 'zobacz', 'zobaczy', 'zobacz', 'zobaczony, zobaczeni'),
  ),
  LOVE: v(am('kochać')),
  // pragnąć + genitive (*pragnie wody*), a bare infinitive (*pragnie jeść*).
  DESIRE: v(nie('pragnąć', { pass: false }), undefined, { object_case: 'gen' }),
  KILL: v(
    am('zabijać'),
    x('zabić', 'zabiję, zabijesz, zabije, zabijemy, zabijecie, zabiją', 'zabił, zabiła, zabiło, zabili, zabiły', {
      imperative: 'zabij, zabijmy, zabijcie', passive: 'zabity, zabici',
    }),
  ),
  // wiedzieć (a fact, a clause) / znać (a person, a place), as es saber / conocer.
  KNOW: v(
    x('wiedzieć', 'wiem, wiesz, wie, wiemy, wiecie, wiedzą', 'wiedział, wiedziała, wiedziało, wiedzieli, wiedziały', {
      imperative: 'wiedz, wiedzmy, wiedzcie', adverbial: 'wiedząc',
    }),
    undefined,
    { content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED' },
  ),
  // *znaj* is literary: no imperative.
  KNOW_ACQUAINTED: v(am('znać', { imp: false })),
  // pamiętać + accusative (*pamiętam ten dzień*); *przypominać sobie* is "recall". (verify: no passive)
  REMEMBER: v(am('pamiętać', { pass: false })),
  CONSIDER: v(am('rozważać'), ic('rozważyć', 'rozważ', 'rozważy', 'rozważ', 'rozważony, rozważeni')),
  // spodziewać się + genitive (*spodziewam się gościa*), unpaired. (verify: vs *oczekiwać* + gen)
  EXPECT: v(am('spodziewać się', { pass: false }), undefined, { reflexive: '1', object_case: 'gen' }),
  READ: v(am('czytać'), pre('prze', am('czytać'))),
  // krzyczeć / krzyknąć; the passive (*krzyczany*) is not in use.
  CRY_OUT: v(
    ic('krzyczeć', 'krzycz', 'krzyczy', 'krzycz'),
    nie('krzyknąć', { pass: false }),
  ),
  BITE: v(
    x('gryźć', 'gryzę, gryziesz, gryzie, gryziemy, gryziecie, gryzą', 'gryzł, gryzła, gryzło, gryźli, gryzły', {
      imperative: 'gryź, gryźmy, gryźcie', adverbial: 'gryząc', passive: 'gryziony, gryzieni',
    }),
    x('ugryźć', 'ugryzę, ugryziesz, ugryzie, ugryziemy, ugryziecie, ugryzą', 'ugryzł, ugryzła, ugryzło, ugryźli, ugryzły', {
      imperative: 'ugryź, ugryźmy, ugryźcie', passive: 'ugryziony, ugryzieni',
    }),
  ),
  // bić / pobić — strike repeatedly, and defeat (*pobić rekord, przeciwnika*).
  BEAT: v(
    x('bić', 'biję, bijesz, bije, bijemy, bijecie, biją', 'bił, biła, biło, bili, biły', {
      imperative: 'bij, bijmy, bijcie', adverbial: 'bijąc', passive: 'bity, bici',
    }),
    pre('po', x('bić', 'biję, bijesz, bije, bijemy, bijecie, biją', 'bił, biła, biło, bili, biły', {
      imperative: 'bij, bijmy, bijcie', passive: 'bity, bici',
    })),
  ),
  SET_ON_FIRE: v(am('podpalać'), ic('podpalić', 'podpal', 'podpali', 'podpal', 'podpalony, podpaleni')),
  EXTINGUISH: v(
    ic('gasić', 'gasz', 'gasi', 'gaś', 'gaszony, gaszeni'),
    pre('z', ic('gasić', 'gasz', 'gasi', 'gaś', 'gaszony, gaszeni')),
  ),
  BUY: v(uje('kupować'), ic('kupić', 'kupi', 'kupi', 'kup', 'kupiony, kupieni')),
  OWN: v(am('posiadać')),
  // zawierać — contain, unpaired in this sense (*zawrzeć* is "conclude"). (verify: the passive)
  HOLD: v(am('zawierać')),
  // trzymać — hold in the hand, unpaired (*potrzymać* is "hold for a while").
  HOLD_GRASP: v(am('trzymać')),
  // obejmować — include, cover; unpaired for the stative sense (*objąć* is "embrace, take over").
  INCLUDE: v(uje('obejmować')),
  // więzić / uwięzić — imprison; *zamykać* is CLOSE. (verify)
  CONFINE: v(
    ic('więzić', 'więż', 'więzi', 'więź', 'więziony, więzieni'),
    ic('uwięzić', 'uwięż', 'uwięzi', 'uwięź', 'uwięziony, uwięzieni'),
  ),
  TAME: v(am('oswajać'), ic('oswoić', 'oswoj', 'oswoi', 'oswój', 'oswojony, oswojeni')),
  MAKE: v(ROBIC, pre('z', ROBIC)),
  // robić / zrobić for DO as for MAKE (es hacer for both); *czynić* is formal.
  DO: v(ROBIC, pre('z', ROBIC)),
  // kontynuować — imperfective, no ordinary perfective (*kontynuować* is not biaspectual). (verify)
  CONTINUE: v(uje('kontynuować')),
  // grać / zagrać na + locative (*grać na gitarze*).
  PLAY_INSTRUMENT: v(am('grać', { pass: false }), pre('za', am('grać', { adv: false, pass: false })), {
    object_prep: 'na', object_prep_case: 'loc',
  }),
  // potrzebować + genitive (*potrzebuję wody*); no imperative.
  NEED: v(uje('potrzebować', { imp: false, pass: false }), undefined, { object_case: 'gen' }),
  // próbować / spróbować: a bare infinitive (*próbuje jeść*), a noun object in the genitive
  // (*spróbować szczęścia, zupy*). (verify: the object case)
  TRY: v(uje('próbować'), pre('s', uje('próbować', { adv: false })), { object_case: 'gen' }),
  CREATE: v(
    ic('tworzyć', 'tworz', 'tworzy', 'twórz', 'tworzony, tworzeni'),
    pre('s', ic('tworzyć', 'tworz', 'tworzy', 'twórz', 'tworzony, tworzeni')),
  ),
  DESTROY: v(
    ic('niszczyć', 'niszcz', 'niszczy', 'niszcz', 'niszczony, niszczeni'),
    pre('z', ic('niszczyć', 'niszcz', 'niszczy', 'niszcz', 'niszczony, niszczeni')),
  ),
  // postrzegać / postrzec — perceive. (verify: the perfective's forms)
  PERCEIVE: v(
    am('postrzegać'),
    x('postrzec', 'postrzegę, postrzeżesz, postrzeże, postrzeżemy, postrzeżecie, postrzegą', 'postrzegł, postrzegła, postrzegło, postrzegli, postrzegły', {
      imperative: 'postrzeż, postrzeżmy, postrzeżcie', passive: 'postrzeżony, postrzeżeni',
    }),
  ),
  // *rozumiej* is rare: no imperfective imperative; the perfective's is *zrozum*.
  UNDERSTAND: v(
    x('rozumieć', 'rozumiem, rozumiesz, rozumie, rozumiemy, rozumiecie, rozumieją', 'rozumiał, rozumiała, rozumiało, rozumieli, rozumiały', {
      adverbial: 'rozumiejąc', passive: 'rozumiany, rozumiani',
    }),
    x('zrozumieć', 'zrozumiem, zrozumiesz, zrozumie, zrozumiemy, zrozumiecie, zrozumieją', 'zrozumiał, zrozumiała, zrozumiało, zrozumieli, zrozumiały', {
      imperative: 'zrozum, zrozummy, zrozumcie', passive: 'zrozumiany, zrozumiani',
    }),
  ),
  HAVE: v(
    x('mieć', 'mam, masz, ma, mamy, macie, mają', 'miał, miała, miało, mieli, miały', {
      imperative: 'miej, miejmy, miejcie', adverbial: 'mając',
    }),
  ),
  ACQUIRE: v(
    am('nabywać'),
    x('nabyć', 'nabędę, nabędziesz, nabędzie, nabędziemy, nabędziecie, nabędą', 'nabył, nabyła, nabyło, nabyli, nabyły', {
      imperative: 'nabądź, nabądźmy, nabądźcie', passive: 'nabyty, nabyci',
    }),
  ),
  TAKE: v(
    x('brać', 'biorę, bierzesz, bierze, bierzemy, bierzecie, biorą', 'brał, brała, brało, brali, brały', {
      imperative: 'bierz, bierzmy, bierzcie', adverbial: 'biorąc', passive: 'brany, brani',
    }),
    x('wziąć', 'wezmę, weźmiesz, weźmie, weźmiemy, weźmiecie, wezmą', 'wziął, wzięła, wzięło, wzięli, wzięły', {
      imperative: 'weź, weźmy, weźcie', passive: 'wzięty, wzięci',
    }),
  ),
  // dostawać / dostać — receive; the passive (*dostany*) is marginal and not stored. (verify)
  GET: v(
    aje('dostawać', { pass: false }),
    x('dostać', 'dostanę, dostaniesz, dostanie, dostaniemy, dostaniecie, dostaną', 'dostał, dostała, dostało, dostali, dostały', {
      imperative: 'dostań, dostańmy, dostańcie',
    }),
  ),
  // kłaść / położyć — put, lay down (de legen).
  PUT: v(
    x('kłaść', 'kładę, kładziesz, kładzie, kładziemy, kładziecie, kładą', 'kładł, kładła, kładło, kładli, kładły', {
      imperative: 'kładź, kładźmy, kładźcie', adverbial: 'kładąc', passive: 'kładziony, kładzeni',
    }),
    ic('położyć', 'położ', 'położy', 'połóż', 'położony, położeni'),
  ),
  // zachowywać / zachować — keep, not give up; *zatrzymywać* is STOP.
  KEEP: v(uje('zachowywać'), am('zachować')),
  // tracić / stracić — stop having; *gubić / zgubić* is "mislay".
  LOSE: v(
    ic('tracić', 'trac', 'traci', 'trać', 'tracony, traceni'),
    pre('s', ic('tracić', 'trac', 'traci', 'trać', 'tracony, traceni')),
  ),
  WIN: v(am('wygrywać'), am('wygrać')),
  BRING: v(
    ic('przynosić', 'przynosz', 'przynosi', 'przynoś', 'przynoszony, przynoszeni'),
    x('przynieść', 'przyniosę, przyniesiesz, przyniesie, przyniesiemy, przyniesiecie, przyniosą', 'przyniósł, przyniosła, przyniosło, przynieśli, przyniosły', {
      pastStem: 'przyniosł', imperative: 'przynieś, przynieśmy, przynieście', passive: 'przyniesiony, przyniesieni',
    }),
  ),
  LEAD: v(
    ic('prowadzić', 'prowadz', 'prowadzi', 'prowadź', 'prowadzony, prowadzeni'),
    pre('po', ic('prowadzić', 'prowadz', 'prowadzi', 'prowadź', 'prowadzony, prowadzeni')),
  ),
  LEAVE_BEHIND: v(am('zostawiać'), ic('zostawić', 'zostawi', 'zostawi', 'zostaw', 'zostawiony, zostawieni')),
  // patrzeć / spojrzeć na + accusative (*patrzy na kota*); no passive. (verify: *popatrzeć* as partner)
  LOOK_AT: v(
    x('patrzeć', 'patrzę, patrzysz, patrzy, patrzymy, patrzycie, patrzą', 'patrzył, patrzyła, patrzyło, patrzyli, patrzyły', {
      imperative: 'patrz, patrzmy, patrzcie', adverbial: 'patrząc',
    }),
    x('spojrzeć', 'spojrzę, spojrzysz, spojrzy, spojrzymy, spojrzycie, spojrzą', 'spojrzał, spojrzała, spojrzało, spojrzeli, spojrzały', {
      imperative: 'spójrz, spójrzmy, spójrzcie',
    }),
    { object_prep: 'na', object_prep_case: 'acc' },
  ),
  // kierować / skierować + accusative — point something toward (*skierować światło na…*); with the
  // instrumental *kierować* is "manage, steer", not this sense.
  DIRECT_VERB: v(uje('kierować'), pre('s', uje('kierować', { adv: false }))),
  DIVIDE: v(
    ic('dzielić', 'dziel', 'dzieli', 'dziel', 'dzielony, dzieleni'),
    pre('po', ic('dzielić', 'dziel', 'dzieli', 'dziel', 'dzielony, dzieleni')),
  ),
  STRIKE: v(am('uderzać'), ic('uderzyć', 'uderz', 'uderzy', 'uderz', 'uderzony, uderzeni')),
  INDICATE: v(
    uje('wskazywać'),
    x('wskazać', 'wskażę, wskażesz, wskaże, wskażemy, wskażecie, wskażą', 'wskazał, wskazała, wskazało, wskazali, wskazały', {
      imperative: 'wskaż, wskażmy, wskażcie', passive: 'wskazany, wskazani',
    }),
  ),
  CHANGE: v(am('zmieniać'), ic('zmienić', 'zmieni', 'zmieni', 'zmień', 'zmieniony, zmienieni')),
  STOP: v(uje('zatrzymywać'), am('zatrzymać')),
  // przekształcać / przekształcić w + accusative (*przekształcić żabę w księcia*).
  TRANSFORM: v(
    am('przekształcać'),
    ic('przekształcić', 'przekształc', 'przekształci', 'przekształć', 'przekształcony, przekształceni'),
    { object_predicative_link: 'w' },
  ),
  // czuć / poczuć; the passive (*czuty*) is not in use.
  FEEL: v(
    x('czuć', 'czuję, czujesz, czuje, czujemy, czujecie, czują', 'czuł, czuła, czuło, czuli, czuły', {
      imperative: 'czuj, czujmy, czujcie', adverbial: 'czując',
    }),
    x('poczuć', 'poczuję, poczujesz, poczuje, poczujemy, poczujecie, poczują', 'poczuł, poczuła, poczuło, poczuli, poczuły', {
      imperative: 'poczuj, poczujmy, poczujcie',
    }),
  ),
  // przelewać / przelać — shed (*przelać krew*); *ronić łzy* is tears only. (verify)
  SHED: v(
    am('przelewać'),
    x('przelać', 'przeleję, przelejesz, przeleje, przelejemy, przelejecie, przeleją', 'przelał, przelała, przelało, przelali, przelały', {
      imperative: 'przelej, przelejmy, przelejcie', passive: 'przelany, przelani',
    }),
  ),
  // wytwarzać / wytworzyć — produce and give off (de erzeugen); *produkować* is industrial.
  PRODUCE: v(am('wytwarzać'), ic('wytworzyć', 'wytworz', 'wytworzy', 'wytwórz', 'wytworzony, wytworzeni')),
  // skłaniać / skłonić — induce someone (accusative) to act. Polish prefers *do* + verbal noun
  // (*skłonić kogoś do jedzenia*) or *żeby*; the bare infinitive is possible but bookish. (verify)
  CAUSE_VERB: v(am('skłaniać'), ic('skłonić', 'skłoni', 'skłoni', 'skłoń', 'skłoniony, skłonieni'), { causative: '1' }),
  PRESS: v(
    am('naciskać'),
    x('nacisnąć', 'nacisnę, naciśniesz, naciśnie, naciśniemy, naciśniecie, nacisną', 'nacisnął, nacisnęła, nacisnęło, nacisnęli, nacisnęły', {
      imperative: 'naciśnij, naciśnijmy, naciśnijcie', passive: 'naciśnięty, naciśnięci',
    }),
  ),
  WRITE: v(
    x('pisać', 'piszę, piszesz, pisze, piszemy, piszecie, piszą', 'pisał, pisała, pisało, pisali, pisały', {
      imperative: 'pisz, piszmy, piszcie', adverbial: 'pisząc', passive: 'pisany, pisani',
    }),
    x('napisać', 'napiszę, napiszesz, napisze, napiszemy, napiszecie, napiszą', 'napisał, napisała, napisało, napisali, napisały', {
      imperative: 'napisz, napiszmy, napiszcie', passive: 'napisany, napisani',
    }),
  ),
  // klikać / kliknąć + accusative (*kliknij przycisk*), the UI's usage; *kliknąć w / na* is also
  // heard. (verify: es/de carry an object_prep)
  CLICK: v(am('klikać'), nie('kliknąć')),
  // zależeć od + genitive (*to zależy od pogody*); no imperative, no passive.
  DEPEND: v(ic('zależeć', 'zależ', 'zależy', undefined), undefined, { object_prep: 'od', object_prep_case: 'gen' }),
  CHOOSE: v(
    am('wybierać'),
    x('wybrać', 'wybiorę, wybierzesz, wybierze, wybierzemy, wybierzecie, wybiorą', 'wybrał, wybrała, wybrało, wybrali, wybrały', {
      imperative: 'wybierz, wybierzmy, wybierzcie', passive: 'wybrany, wybrani',
    }),
  ),
  FILTER: v(uje('filtrować'), pre('prze', uje('filtrować', { adv: false }))),
  // zaznaczać / zaznaczyć — mark out (the UI's "select"); CHOOSE is *wybierać*.
  SELECT: v(am('zaznaczać'), ic('zaznaczyć', 'zaznacz', 'zaznaczy', 'zaznacz', 'zaznaczony, zaznaczeni')),
  // wpisywać / wpisać — type in (the UI's "type"). (verify)
  TYPE: v(
    uje('wpisywać'),
    x('wpisać', 'wpiszę, wpiszesz, wpisze, wpiszemy, wpiszecie, wpiszą', 'wpisał, wpisała, wpisało, wpisali, wpisały', {
      imperative: 'wpisz, wpiszmy, wpiszcie', passive: 'wpisany, wpisani',
    }),
  ),
  TRANSLATE: v(
    ic('tłumaczyć', 'tłumacz', 'tłumaczy', 'tłumacz', 'tłumaczony, tłumaczeni'),
    pre('prze', ic('tłumaczyć', 'tłumacz', 'tłumaczy', 'tłumacz', 'tłumaczony, tłumaczeni')),
  ),
  // zapisywać / zapisać — save (a file).
  SAVE: v(
    uje('zapisywać'),
    x('zapisać', 'zapiszę, zapiszesz, zapisze, zapiszemy, zapiszecie, zapiszą', 'zapisał, zapisała, zapisało, zapisali, zapisały', {
      imperative: 'zapisz, zapiszmy, zapiszcie', passive: 'zapisany, zapisani',
    }),
  ),
  // wczytywać / wczytać — load (stored content); *ładować* is a cargo or a battery.
  LOAD: v(uje('wczytywać'), am('wczytać')),
  // dodawać / dodać do + genitive (*dodać sól do zupy*): de's terminus_prep, translated. (verify: key)
  ADD: v(
    aje('dodawać'),
    x('dodać', 'dodam, dodasz, doda, dodamy, dodacie, dodadzą', 'dodał, dodała, dodało, dodali, dodały', {
      imperative: 'dodaj, dodajmy, dodajcie', passive: 'dodany, dodani',
    }),
    { terminus_prep: 'do', terminus_prep_case: 'gen' },
  ),
  // łączyć / połączyć z + instrumental. (verify: key)
  LINK: v(
    ic('łączyć', 'łącz', 'łączy', 'łącz', 'łączony, łączeni'),
    pre('po', ic('łączyć', 'łącz', 'łączy', 'łącz', 'łączony, łączeni')),
    { terminus_prep: 'z', terminus_prep_case: 'ins' },
  ),
  EXPORT: v(uje('eksportować'), pre('wy', uje('eksportować', { adv: false }))),
  // nadawać / nadać — broadcast (*nadawać program*).
  BROADCAST: v(
    aje('nadawać'),
    x('nadać', 'nadam, nadasz, nada, nadamy, nadacie, nadadzą', 'nadał, nadała, nadało, nadali, nadały', {
      imperative: 'nadaj, nadajmy, nadajcie', passive: 'nadany, nadani',
    }),
  ),
  IMPORT: v(uje('importować'), pre('za', uje('importować', { adv: false }))),
  // czyścić / wyczyścić — clear (a list, a field).
  CLEAR: v(
    ic('czyścić', 'czyszcz', 'czyści', 'czyść', 'czyszczony, czyszczeni'),
    pre('wy', ic('czyścić', 'czyszcz', 'czyści', 'czyść', 'czyszczony, czyszczeni')),
  ),
  REMOVE: v(am('usuwać'), nie('usunąć', { imp2sg: 'usuń' })),
  // kasować / skasować — erase for good; REMOVE is *usuwać*.
  DELETE: v(uje('kasować'), pre('s', uje('kasować', { adv: false }))),
  COORDINATE: v(uje('koordynować'), pre('s', uje('koordynować', { adv: false }))),
  // porządkować / uporządkować (de ordnen); *sprzątać* is cleaning a room.
  TIDY_UP: v(uje('porządkować'), pre('u', uje('porządkować', { adv: false }))),
  // zagęszczać / zagęścić (de verdichten). (verify: the UI may prefer *kompaktować*)
  COMPACT: v(
    am('zagęszczać'),
    ic('zagęścić', 'zagęszcz', 'zagęści', 'zagęść', 'zagęszczony, zagęszczeni'),
  ),
  // rozszerzać / rozszerzyć — enlarge, extend (de erweitern).
  EXPAND: v(am('rozszerzać'), ic('rozszerzyć', 'rozszerz', 'rozszerzy', 'rozszerz', 'rozszerzony, rozszerzeni')),
  SHRINK: v(am('zmniejszać'), ic('zmniejszyć', 'zmniejsz', 'zmniejszy', 'zmniejsz', 'zmniejszony, zmniejszeni')),
  HIDE: v(
    am('ukrywać'),
    x('ukryć', 'ukryję, ukryjesz, ukryje, ukryjemy, ukryjecie, ukryją', 'ukrył, ukryła, ukryło, ukryli, ukryły', {
      imperative: 'ukryj, ukryjmy, ukryjcie', passive: 'ukryty, ukryci',
    }),
  ),
  // zaczynać / zacząć + accusative or a bare infinitive (*zaczyna jeść*).
  START: v(
    am('zaczynać'),
    x('zacząć', 'zacznę, zaczniesz, zacznie, zaczniemy, zaczniecie, zaczną', 'zaczął, zaczęła, zaczęło, zaczęli, zaczęły', {
      imperative: 'zacznij, zacznijmy, zacznijcie', passive: 'zaczęty, zaczęci',
    }),
  ),
  // anulować — biaspectual (the UI's *Anuluj*): no pf_ keys. *odwołać* is calling off an event. (verify)
  CANCEL: v(uje('anulować')),
  // cofać / cofnąć — undo (the UI's *Cofnij*).
  UNDO: v(am('cofać'), nie('cofnąć')),
  // powtarzać / powtórzyć — redo (de wiederholen); RETRY is *ponawiać*. (verify)
  REDO: v(am('powtarzać'), ic('powtórzyć', 'powtórz', 'powtórzy', 'powtórz', 'powtórzony, powtórzeni')),
  RESTORE: v(am('przywracać'), ic('przywrócić', 'przywróc', 'przywróci', 'przywróć', 'przywrócony, przywróceni')),
  // otworzyć's passive is *otwarty* (*otworzony* is colloquial).
  OPEN: v(am('otwierać'), ic('otworzyć', 'otworz', 'otworzy', 'otwórz', 'otwarty, otwarci')),
  CLOSE: v(am('zamykać'), nie('zamknąć')),
  // ponawiać / ponowić — retry (*ponowić próbę*, the UI's *Ponów*). (verify)
  RETRY: v(am('ponawiać'), ic('ponowić', 'ponowi', 'ponowi', 'ponów', 'ponowiony, ponowieni')),
  // używać / użyć + genitive (*używać noża*).
  USE: v(
    am('używać'),
    x('użyć', 'użyję, użyjesz, użyje, użyjemy, użyjecie, użyją', 'użył, użyła, użyło, użyli, użyły', {
      imperative: 'użyj, użyjmy, użyjcie', passive: 'użyty, użyci',
    }),
    { object_case: 'gen' },
  ),
  SPEND_MONEY: v(
    aje('wydawać'),
    x('wydać', 'wydam, wydasz, wyda, wydamy, wydacie, wydadzą', 'wydał, wydała, wydało, wydali, wydały', {
      imperative: 'wydaj, wydajmy, wydajcie', passive: 'wydany, wydani',
    }),
  ),
  SPEND_TIME: v(am('spędzać'), ic('spędzić', 'spędz', 'spędzi', 'spędź', 'spędzony, spędzeni')),
  COPY: v(uje('kopiować'), pre('s', uje('kopiować', { adv: false }))),
  // przenosić / przenieść — move (a thing, a file; the UI's *Przenieś*).
  MOVE: v(
    ic('przenosić', 'przenosz', 'przenosi', 'przenoś', 'przenoszony, przenoszeni'),
    x('przenieść', 'przeniosę, przeniesiesz, przeniesie, przeniesiemy, przeniesiecie, przeniosą', 'przeniósł, przeniosła, przeniosło, przenieśli, przeniosły', {
      pastStem: 'przeniosł', imperative: 'przenieś, przenieśmy, przenieście', passive: 'przeniesiony, przeniesieni',
    }),
  ),
  // opuszczać / opuścić + accusative (*opuścić dom*): Spanish's *salir de* is a plain object here.
  LEAVE: v(am('opuszczać'), ic('opuścić', 'opuszcz', 'opuści', 'opuść', 'opuszczony, opuszczeni')),
  // skalować / przeskalować (de skalieren); *zmieniać rozmiar* is two words. (verify)
  RESIZE: v(uje('skalować'), pre('prze', uje('skalować', { adv: false }))),
  DRAG: v(am('przeciągać'), nie('przeciągnąć')),
  TURN_OFF: v(am('wyłączać'), ic('wyłączyć', 'wyłącz', 'wyłączy', 'wyłącz', 'wyłączony, wyłączeni')),
};
