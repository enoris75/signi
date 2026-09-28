import type { LanguageColumn } from '../types.js';
import { verb, type AspectForms } from './helpers.js';

/**
 * Polish verbs, part B (P05-E5): the interface verbs (SET, PIN, APPLY, …), speech and thought, the
 * ditransitives, the motion and posture verbs, BE and its senses, BECOME and SEEM, and the modals.
 * Keys as in style-pl.md § Verbs: the imperfective unprefixed, its dictionary perfective under `pf_`
 * (P05 D1); no `pf_` keys for a verb Polish does not pair (the modals, *mieszkać*, *żyć*, *szukać*, …),
 * so the engine uses the imperfective in every cell. Every form is *(verify)* until the native review
 * (P05-E11); `// (verify)` marks the choices the author is specifically unsure of.
 *
 * Government (`object_case`, `object_prep` + `object_prep_case`) is set wherever the Polish verb does
 * not take a plain accusative object. The ditransitives mark their recipient's case with
 * `terminus_case` (de's key; Polish gives to the dative, *daje książkę dziecku*, and asks the
 * accusative, *pyta kota o drogę*). `topic_prep` + `topic_prep_case` (de THINK's key) is Polish *o* +
 * locative (*myśli o kocie*).
 *
 * German/Spanish-only keys dropped: `object_a`, `infinitive_link` (Polish takes the infinitive bare:
 * *pomaga jeść*, *zaczyna jeść*), `experiencer` on LIKE (*lubić* has a nominative subject, not a
 * dative experiencer), `content_clause_mood_negative` (a Spanish mood), `infinitive_bare`,
 * `controller_case`, `terminus_dative`, `terminus_tonic`, `conditional` (German SHOULD's Konjunktiv).
 */

/** The *l*-participle from its masc/fem/neut/non-virile stem and its virile stem: *czeka-ł … czeka-li*. */
const l = (m: string, v = m) => `${m}ł, ${m}ła, ${m}ło, ${v}li, ${m}ły`;
/** The *-am, -asz* non-past (*czekam … czekają*). */
const am = (s: string) => `${s}am, ${s}asz, ${s}a, ${s}amy, ${s}acie, ${s}ają`;
/** The *-ę* non-past: `s1` takes *-ę, -ą* (1sg, 3pl), `s2` is the 3sg the others build on (*piszę, pisze*). */
const e = (s1: string, s2: string) => `${s1}ę, ${s2}sz, ${s2}, ${s2}my, ${s2}cie, ${s1}ą`;
/** The three imperatives from the 2sg (*jedz, jedzmy, jedzcie*). */
const imp = (s: string) => `${s}, ${s}my, ${s}cie`;

interface Opt {
  /** An imperfective: store the adverbial participle. */
  ipf?: boolean;
  /** A transitive verb: store the passive participle. */
  pas?: boolean;
  /** No imperative (a modal, a verb whose imperative Polish does not use). */
  noImp?: boolean;
}

/** A general aspect: the infinitive, the non-past, the past, the 2sg imperative (or null). */
function a(
  inf: string, nonpast: string, past: string, imp2: string | null,
  o: { adverbial?: string; passive?: string; pastStem?: string } = {},
): AspectForms {
  return {
    inf, nonpast, past,
    ...(imp2 ? { imperative: imp(imp2) } : {}),
    ...(o.adverbial ? { adverbial: o.adverbial } : {}),
    ...(o.passive ? { passive: o.passive } : {}),
    ...(o.pastStem ? { pastStem: o.pastStem } : {}),
  };
}

/** A regular *-ać, -am* verb from its stem: *czek-ać, czekam, czekał, czekaj, czekając, czekany*. */
function ac(stem: string, o: Opt = {}): AspectForms {
  return a(`${stem}ać`, am(stem), l(`${stem}a`), o.noImp ? null : `${stem}aj`, {
    adverbial: o.ipf ? `${stem}ając` : undefined,
    passive: o.pas ? `${stem}any, ${stem}ani` : undefined,
  });
}

/** A regular *-ować, -uję* verb from its stem: *akcept-ować, akceptuję, akceptował, akceptuj*. */
function owac(stem: string, o: Opt = {}): AspectForms {
  return a(`${stem}ować`, e(`${stem}uj`, `${stem}uje`), l(`${stem}owa`), o.noImp ? null : `${stem}uj`, {
    adverbial: o.ipf ? `${stem}ując` : undefined,
    passive: o.pas ? `${stem}owany, ${stem}owani` : undefined,
  });
}

/** A regular *-ywać, -uję* imperfective from its stem: *opis-ywać, opisuję, opisywał, opisuj, opisując*. */
function ywac(stem: string, o: Opt = {}): AspectForms {
  return a(`${stem}ywać`, e(`${stem}uj`, `${stem}uje`), l(`${stem}ywa`), o.noImp ? null : `${stem}uj`, {
    adverbial: `${stem}ując`,
    passive: o.pas ? `${stem}ywany, ${stem}ywani` : undefined,
  });
}

/**
 * A conjugation-II verb in *-ić / -yć* (*mówić, łączyć*): `s1` the 1sg/3pl stem (*mówi-ę*, *płac-ę*),
 * `s2` the 3sg (*mówi*, *płaci*), which is also the past stem (*mówił*). The adverbial is `s1` + *-ąc*.
 */
function ic(inf: string, s1: string, s2: string, imp2: string | null, o: { ipf?: boolean; passive?: string } = {}): AspectForms {
  return a(inf, e(s1, s2), l(s2), imp2, { adverbial: o.ipf ? `${s1}ąc` : undefined, passive: o.passive });
}

/** A reflexive verb's aspect: *się* on the infinitive only (style-pl.md). */
const sie = (x: AspectForms): AspectForms => ({ ...x, inf: `${x.inf} się` });
const R = { reflexive: '1' };

const IPF = { ipf: true } as const;
const IPF_TR = { ipf: true, pas: true } as const;
const TR = { pas: true } as const;

/** *rządzić* + instrumental, both the grammatical and the political sense. */
const RZADZIC = verb(ic('rządzić', 'rządz', 'rządzi', 'rządź', { ipf: true, passive: 'rządzony, rządzeni' }), undefined, { object_case: 'ins' });

/** *móc*: CAN, MAY and MIGHT (ability, permission, possibility: *może padać*). No imperative. */
const MOC = verb(a('móc', 'mogę, możesz, może, możemy, możecie, mogą', 'mógł, mogła, mogło, mogli, mogły', null, { adverbial: 'mogąc', pastStem: 'mogł' }));

/** *działać / zadziałać*: WORK (it works, *działa*) and ACT (to take action). */
const DZIALAC = verb(ac('dział', IPF), ac('zadział'));

export const PL_VERBS_B: LanguageColumn = {
  // ── Interface and language verbs ──────────────────────────────────
  SET: verb(ac('ustawi', IPF_TR), ic('ustawić', 'ustawi', 'ustawi', 'ustaw', { passive: 'ustawiony, ustawieni' })),
  PIN: verb(ac('przypin', IPF_TR), a('przypiąć', 'przypnę, przypniesz, przypnie, przypniemy, przypniecie, przypną',
    'przypiął, przypięła, przypięło, przypięli, przypięły', 'przypnij', { passive: 'przypięty, przypięci' })),
  UNPIN: verb(ac('odpin', IPF_TR), a('odpiąć', 'odepnę, odepniesz, odepnie, odepniemy, odepniecie, odepną',
    'odpiął, odpięła, odpięło, odpięli, odpięły', 'odepnij', { passive: 'odpięty, odpięci' })),
  // Autocomplete is *autouzupełnianie*; *dokończyć* would be "finish" in general.
  COMPLETE: verb(ac('uzupełni', IPF_TR), ic('uzupełnić', 'uzupełni', 'uzupełni', 'uzupełnij', { passive: 'uzupełniony, uzupełnieni' })),
  // The interface's "Zastosuj".
  APPLY: verb(owac('stos', IPF_TR), owac('zastos', TR)),
  NAME: verb(ac('nazyw', IPF_TR), a('nazwać', e('nazw', 'nazwie'), l('nazwa'), 'nazwij', { passive: 'nazwany, nazwani' })),
  DESCRIBE: verb(ywac('opis', TR), a('opisać', e('opisz', 'opisze'), l('opisa'), 'opisz', { passive: 'opisany, opisani' })),
  MODIFY: verb(owac('modyfik', IPF_TR), owac('zmodyfik', TR)),
  SPECIFY: verb(ac('określ', IPF_TR), ic('określić', 'określ', 'określi', 'określ', { passive: 'określony, określeni' })),
  // Unpaired: *zedytować* is colloquial; the interface says *edytuj*. (verify)
  EDIT: verb(owac('edyt', IPF_TR)),
  // Grammar: *czasownik rządzi biernikiem*. Unpaired.
  GOVERN: { ...RZADZIC },
  ACCEPT: verb(owac('akcept', IPF_TR), owac('zaakcept', TR)),
  NEGATE: verb(owac('neg', IPF_TR), owac('zaneg', TR)),
  ASSERT: verb(ac('stwierdz', IPF_TR), ic('stwierdzić', 'stwierdz', 'stwierdzi', 'stwierdź', { passive: 'stwierdzony, stwierdzeni' })),
  EXPRESS: verb(ac('wyraż', IPF_TR), ic('wyrazić', 'wyraż', 'wyrazi', 'wyraź', { passive: 'wyrażony, wyrażeni' })),

  // ── Speech, thought, perception ───────────────────────────────────
  SAY: verb(
    ic('mówić', 'mówi', 'mówi', 'mów', { ipf: true, passive: 'mówiony, mówieni' }),
    a('powiedzieć', 'powiem, powiesz, powie, powiemy, powiecie, powiedzą', l('powiedzia', 'powiedzie'), 'powiedz',
      { passive: 'powiedziany, powiedziani' }),
    { content_clause_force: 'either' },
  ),
  // SAY's imperfective without a partner: "to say words aloud", *mówić po polsku*. (verify)
  SPEAK: verb(ic('mówić', 'mówi', 'mówi', 'mów', IPF), undefined, { topic_prep: 'o', topic_prep_case: 'loc' }),
  CALL: verb(ac('woł', IPF_TR), ac('zawoł', TR)),
  // *dzwonić do kogoś*.
  CALL_PHONE: verb(ic('dzwonić', 'dzwoni', 'dzwoni', 'dzwoń', IPF), ic('zadzwonić', 'zadzwoni', 'zadzwoni', 'zadzwoń'),
    { object_prep: 'do', object_prep_case: 'gen' }),
  // Unpaired; no imperative in use, no passive (*znaczony* is "marked").
  MEAN: verb(ic('znaczyć', 'znacz', 'znaczy', null, IPF)),
  // *wierzyć komuś / czemuś*; *uwierzyć* the dictionary perfective.
  BELIEVE: verb(ic('wierzyć', 'wierz', 'wierzy', 'wierz', IPF), ic('uwierzyć', 'uwierz', 'uwierzy', 'uwierz'), { object_case: 'dat' }),
  THINK: verb(
    a('myśleć', e('myśl', 'myśli'), l('myśla', 'myśle'), 'myśl', { adverbial: 'myśląc' }),
    a('pomyśleć', e('pomyśl', 'pomyśli'), l('pomyśla', 'pomyśle'), 'pomyśl'),
    { topic_prep: 'o', topic_prep_case: 'loc' },
  ),
  HEAR: verb(
    a('słyszeć', e('słysz', 'słyszy'), l('słysza', 'słysze'), 'słysz', { adverbial: 'słysząc', passive: 'słyszany, słyszani' }), // imperative (verify)
    a('usłyszeć', e('usłysz', 'usłyszy'), l('usłysza', 'usłysze'), 'usłysz', { passive: 'usłyszany, usłyszani' }),
  ),
  // The object is the question (*odpowiadać na pytanie*); the one answered is a dative terminus.
  ANSWER: verb(ac('odpowiad', IPF),
    a('odpowiedzieć', 'odpowiem, odpowiesz, odpowie, odpowiemy, odpowiecie, odpowiedzą', l('odpowiedzia', 'odpowiedzie'), 'odpowiedz'),
    { object_prep: 'na', object_prep_case: 'acc', terminus_case: 'dat' }),
  TELL: verb(ac('opowiad', IPF_TR),
    a('opowiedzieć', 'opowiem, opowiesz, opowie, opowiemy, opowiecie, opowiedzą', l('opowiedzia', 'opowiedzie'), 'opowiedz',
      { passive: 'opowiedziany, opowiedziani' }),
    { content_clause_force: 'either', infinitive_sense: 'TELL_ORDER', terminus_case: 'dat' }),
  // *kazać komuś coś zrobić*. Biaspectual, so unpaired.
  TELL_ORDER: verb(a('kazać', e('każ', 'każe'), l('kaza'), 'każ', { adverbial: 'każąc' }), undefined, { object_case: 'dat' }),
  // *pytać kogoś o coś*: the one asked is accusative, the thing asked about *o* + accusative.
  ASK: verb(ac('pyt', IPF_TR), ac('zapyt', TR),
    { content_clause_force: 'interrogative', object_prep: 'o', object_prep_case: 'acc', terminus_case: 'acc' }),

  // ── Transitive ────────────────────────────────────────────────────
  REPLACE: verb(owac('zastęp', IPF_TR), ic('zastąpić', 'zastąpi', 'zastąpi', 'zastąp', { passive: 'zastąpiony, zastąpieni' })),
  // *oddychać powietrzem*. Unpaired (*odetchnąć* is "take a breath").
  BREATHE: verb(ac('oddych', IPF), undefined, { object_case: 'ins' }),
  EXCHANGE: verb(ac('wymieni', IPF_TR), ic('wymienić', 'wymieni', 'wymieni', 'wymień', { passive: 'wymieniony, wymienieni' })),
  ENCLOSE: verb(ac('otacz', IPF_TR), ic('otoczyć', 'otocz', 'otoczy', 'otocz', { passive: 'otoczony, otoczeni' })),
  GOVERN_STATE: { ...RZADZIC },
  // *towarzyszyć komuś*. Unpaired.
  ACCOMPANY: verb(ic('towarzyszyć', 'towarzysz', 'towarzyszy', 'towarzysz', IPF), undefined, { object_case: 'dat' }),
  // *szukać czegoś*. Unpaired (*poszukać* is "search for a while").
  SEARCH: verb(ac('szuk', IPF_TR), undefined, { object_case: 'gen' }),
  FIND: verb(owac('znajd', IPF_TR),
    a('znaleźć', 'znajdę, znajdziesz, znajdzie, znajdziemy, znajdziecie, znajdą', 'znalazł, znalazła, znalazło, znaleźli, znalazły', 'znajdź',
      { passive: 'znaleziony, znalezieni' })),
  // Transitive in Polish (*spotkać kogoś*), unlike Spanish *encontrarse con*.
  MEET: verb(ac('spotyk', IPF_TR), ac('spotk', TR)),
  ARRANGE: verb(ac('układ', IPF_TR), ic('ułożyć', 'ułoż', 'ułoży', 'ułóż', { passive: 'ułożony, ułożeni' })),
  // *łączyć coś z czymś*.
  CONNECT: verb(ic('łączyć', 'łącz', 'łączy', 'łącz', { ipf: true, passive: 'łączony, łączeni' }),
    ic('połączyć', 'połącz', 'połączy', 'połącz', { passive: 'połączony, połączeni' }),
    { terminus_prep: 'z', terminus_prep_case: 'ins' }),
  // *pozwolić komuś coś zrobić*.
  LET: verb(ac('pozwal', IPF), ic('pozwolić', 'pozwol', 'pozwoli', 'pozwól'), { object_case: 'dat' }),
  // *zezwolić komuś*, the formal "permit", so it stays apart from LET. (verify)
  ALLOW: verb(ac('zezwal', IPF), ic('zezwolić', 'zezwol', 'zezwoli', 'zezwól'), { object_case: 'dat' }),
  // Stative, unpaired (*polubić* is "come to like").
  LIKE: verb(ic('lubić', 'lubi', 'lubi', 'lub', { ipf: true, passive: 'lubiany, lubiani' })),
  // *pomagać komuś*.
  HELP_VERB: verb(ac('pomag', IPF),
    a('pomóc', 'pomogę, pomożesz, pomoże, pomożemy, pomożecie, pomogą', 'pomógł, pomogła, pomogło, pomogli, pomogły', 'pomóż',
      { pastStem: 'pomogł' }),
    { object_case: 'dat' }),
  // *dziękować komuś*.
  THANK: verb(owac('dzięk', IPF), owac('podzięk'), { object_case: 'dat' }),
  // Gender-neutral and transitive; *żenić się z* / *wyjść za mąż za* depend on the subject's sex.
  MARRY: verb(ac('poślubi', IPF_TR), ic('poślubić', 'poślubi', 'poślubi', 'poślub', { passive: 'poślubiony, poślubieni' })),
  // *uczyć się czegoś*.
  LEARN: verb(sie(ic('uczyć', 'ucz', 'uczy', 'ucz', IPF)), sie(ic('nauczyć', 'naucz', 'nauczy', 'naucz')), { ...R, object_case: 'gen' }),
  // "Come after in an order": *następować po czymś*. (verify)
  FOLLOW: verb(owac('następ', IPF), ic('nastąpić', 'nastąpi', 'nastąpi', 'nastąp'), { object_prep: 'po', object_prep_case: 'loc' }),

  // ── Ditransitive ──────────────────────────────────────────────────
  GIVE: verb(a('dawać', 'daję, dajesz, daje, dajemy, dajecie, dają', l('dawa'), 'dawaj', { adverbial: 'dając', passive: 'dawany, dawani' }),
    a('dać', 'dam, dasz, da, damy, dacie, dadzą', l('da'), 'daj', { passive: 'dany, dani' }),
    { terminus_case: 'dat' }),
  SELL: verb(a('sprzedawać', 'sprzedaję, sprzedajesz, sprzedaje, sprzedajemy, sprzedajecie, sprzedają', l('sprzedawa'), 'sprzedawaj',
    { adverbial: 'sprzedając', passive: 'sprzedawany, sprzedawani' }),
  a('sprzedać', 'sprzedam, sprzedasz, sprzeda, sprzedamy, sprzedacie, sprzedadzą', l('sprzeda'), 'sprzedaj', { passive: 'sprzedany, sprzedani' }),
  { terminus_case: 'dat' }),
  PAY: verb(ic('płacić', 'płac', 'płaci', 'płać', { ipf: true, passive: 'płacony, płaceni' }),
    ic('zapłacić', 'zapłac', 'zapłaci', 'zapłać', { passive: 'zapłacony, zapłaceni' }),
    { terminus_case: 'dat' }),
  PROVIDE: verb(ac('dostarcz', IPF_TR), ic('dostarczyć', 'dostarcz', 'dostarczy', 'dostarcz', { passive: 'dostarczony, dostarczeni' }),
    { terminus_case: 'dat' }),
  // From one holder to another: *przekazać coś komuś*.
  TRANSFER: verb(ywac('przekaz', TR),
    a('przekazać', e('przekaż', 'przekaże'), l('przekaza'), 'przekaż', { passive: 'przekazany, przekazani' }),
    { terminus_case: 'dat' }),
  SHOW: verb(ywac('pokaz', TR),
    a('pokazać', e('pokaż', 'pokaże'), l('pokaza'), 'pokaż', { passive: 'pokazany, pokazani' }),
    { terminus_case: 'dat' }),
  SEND: verb(ac('wysył', IPF_TR),
    a('wysłać', e('wyśl', 'wyśle'), l('wysła'), 'wyślij', { passive: 'wysłany, wysłani' }),
    { terminus_case: 'dat' }),

  // ── Intransitive ──────────────────────────────────────────────────
  // Unpaired (*zapłakać*, *rozpłakać się* are inceptive).
  CRY: verb(a('płakać', e('płacz', 'płacze'), l('płaka'), 'płacz', { adverbial: 'płacząc' })),
  // Unpaired (*ucierpieć* is "be damaged").
  SUFFER: verb(a('cierpieć', e('cierpi', 'cierpi'), l('cierpia', 'cierpie'), 'cierp', { adverbial: 'cierpiąc' })),
  // "Be on fire": *płonąć*; *spłonąć* "burn down" as its perfective. (verify)
  BURN: verb(
    a('płonąć', 'płonę, płoniesz, płonie, płoniemy, płoniecie, płoną', 'płonął, płonęła, płonęło, płonęli, płonęły', 'płoń', { adverbial: 'płonąc' }),
    a('spłonąć', 'spłonę, spłoniesz, spłonie, spłoniemy, spłoniecie, spłoną', 'spłonął, spłonęła, spłonęło, spłonęli, spłonęły', 'spłoń'),
  ),
  // A structure's collapse; a person's would be *zasłabnąć* / *upaść*. (verify)
  COLLAPSE: verb(sie(ac('zawal', IPF)), sie(ic('zawalić', 'zawal', 'zawali', 'zawal')), R),
  LIVE: verb(ac('mieszk', IPF)),
  LIVE_ALIVE: verb(a('żyć', 'żyję, żyjesz, żyje, żyjemy, żyjecie, żyją', l('ży'), 'żyj', { adverbial: 'żyjąc' })),
  DIE: verb(ac('umier', IPF), a('umrzeć', 'umrę, umrzesz, umrze, umrzemy, umrzecie, umrą', l('umar'), 'umrzyj')),
  STAY: verb(
    a('zostawać', 'zostaję, zostajesz, zostaje, zostajemy, zostajecie, zostają', l('zostawa'), 'zostawaj', { adverbial: 'zostając' }),
    a('zostać', 'zostanę, zostaniesz, zostanie, zostaniemy, zostaniecie, zostaną', l('zosta'), 'zostań'),
  ),
  // *czekać na kogoś*.
  WAIT: verb(ac('czek', IPF), ac('poczek'), { object_prep: 'na', object_prep_case: 'acc' }),
  // *handlować czymś*. Unpaired.
  TRADE: verb(owac('handl', IPF)),
  // ACT and WORK share *działać / zadziałać*, as de ACT and TRADE share *handeln*. (verify)
  ACT: { ...DZIALAC },
  WORK: { ...DZIALAC },
  // Unpaired (*popracować* is "work for a while").
  WORK_LABOUR: verb(owac('prac', IPF)),
  PLAY_GAME: verb(ac('gr', IPF), ac('zagr')),
  LOSE_GAME: verb(ac('przegryw', IPF), ac('przegr')),
  // A bare "the film begins" would want *zaczynać się*; with an infinitive it is *zaczyna jeść*. (verify)
  BEGIN: verb(ac('zaczyn', IPF),
    a('zacząć', 'zacznę, zaczniesz, zacznie, zaczniemy, zaczniecie, zaczną', 'zaczął, zaczęła, zaczęło, zaczęli, zaczęły', 'zacznij')),
  STOP_DOING: verb(
    a('przestawać', 'przestaję, przestajesz, przestaje, przestajemy, przestajecie, przestają', l('przestawa'), 'przestawaj', { adverbial: 'przestając' }),
    a('przestać', 'przestanę, przestaniesz, przestanie, przestaniemy, przestaniecie, przestaną', l('przesta'), 'przestań'),
  ),
  STOP_ONESELF: verb(sie(ywac('zatrzym')), sie(ac('zatrzym')), R),
  // Polish says "continues eating" with an adverb on the finite verb, *dalej je* / *nadal nie je*, as
  // German does with *weiter* (de's `complement_particle`, `negative_complement_adverb`).
  // *kontynuować* itself takes a noun (*kontynuuje jedzenie*). Unpaired. (verify)
  CONTINUE_DOING: verb(owac('kontynu', IPF), undefined, { complement_particle: 'dalej', negative_complement_adverb: 'nadal' }),
  CHANGE_ONESELF: verb(sie(ac('zmieni', IPF)), sie(ic('zmienić', 'zmieni', 'zmieni', 'zmień')), R),
  // *poprzedzać* is transitive in Polish; the concept seats no object.
  PRECEDE: verb(ac('poprzedz', IPF), ic('poprzedzić', 'poprzedz', 'poprzedzi', 'poprzedź')),
  // No imperative in use.
  HAPPEN: verb(sie(ac('zdarz', { ipf: true, noImp: true })), sie(ic('zdarzyć', 'zdarz', 'zdarzy', null)), R),
  GROW: verb(
    a('rosnąć', 'rosnę, rośniesz, rośnie, rośniemy, rośniecie, rosną', 'rósł, rosła, rosło, rośli, rosły', 'rośnij', { adverbial: 'rosnąc', pastStem: 'rosł' }),
    a('urosnąć', 'urosnę, urośniesz, urośnie, urośniemy, urośniecie, urosną', 'urósł, urosła, urosło, urośli, urosły', 'urośnij', { pastStem: 'urosł' }),
  ),
  // Unpaired: *popłynąć* is "set off (swimming, sailing)". (verify)
  FLOW: verb(a('płynąć', 'płynę, płyniesz, płynie, płyniemy, płyniecie, płyną', 'płynął, płynęła, płynęło, płynęli, płynęły', 'płyń', { adverbial: 'płynąc' })),

  // ── Motion and posture ────────────────────────────────────────────
  // Determinate imperfective + *po-* perfective (style-pl.md).
  RUN: verb(
    a('biec', 'biegnę, biegniesz, biegnie, biegniemy, biegniecie, biegną', 'biegł, biegła, biegło, biegli, biegły', 'biegnij', { adverbial: 'biegnąc' }),
    a('pobiec', 'pobiegnę, pobiegniesz, pobiegnie, pobiegniemy, pobiegniecie, pobiegną', 'pobiegł, pobiegła, pobiegło, pobiegli, pobiegły', 'pobiegnij'),
  ),
  JUMP: verb(a('skakać', e('skacz', 'skacze'), l('skaka'), 'skacz', { adverbial: 'skacząc' }), ic('skoczyć', 'skocz', 'skoczy', 'skocz')),
  COME: verb(
    ic('przychodzić', 'przychodz', 'przychodzi', 'przychodź', IPF),
    a('przyjść', 'przyjdę, przyjdziesz, przyjdzie, przyjdziemy, przyjdziecie, przyjdą', 'przyszedł, przyszła, przyszło, przyszli, przyszły', 'przyjdź'),
  ),
  // The pf imperative *pójdź* is archaic; Polish uses *idź* for both aspects. (verify)
  GO: verb(
    a('iść', 'idę, idziesz, idzie, idziemy, idziecie, idą', 'szedł, szła, szło, szli, szły', 'idź', { adverbial: 'idąc' }),
    a('pójść', 'pójdę, pójdziesz, pójdzie, pójdziemy, pójdziecie, pójdą', 'poszedł, poszła, poszło, poszli, poszły', 'idź'),
  ),
  RETURN: verb(ac('wrac', IPF), ic('wrócić', 'wróc', 'wróci', 'wróć')),
  TURN: verb(sie(ac('obrac', IPF)), sie(ic('obrócić', 'obróc', 'obróci', 'obróć')), R),
  LEAVE_DEPART: verb(
    ic('odchodzić', 'odchodz', 'odchodzi', 'odchodź', IPF),
    a('odejść', 'odejdę, odejdziesz, odejdzie, odejdziemy, odejdziecie, odejdą', 'odszedł, odeszła, odeszło, odeszli, odeszły', 'odejdź'),
  ),
  // pf imperative *ucieknij* is rare; *uciekaj* is the usual one. (verify)
  RUN_AWAY: verb(ac('uciek', IPF),
    a('uciec', 'ucieknę, uciekniesz, ucieknie, uciekniemy, uciekniecie, uciekną', 'uciekł, uciekła, uciekło, uciekli, uciekły', 'ucieknij')),
  GO_OUT: verb(
    ic('wychodzić', 'wychodz', 'wychodzi', 'wychodź', IPF),
    a('wyjść', 'wyjdę, wyjdziesz, wyjdzie, wyjdziemy, wyjdziecie, wyjdą', 'wyszedł, wyszła, wyszło, wyszli, wyszły', 'wyjdź'),
  ),
  // *chodzić*, "to walk" (*dziecko już chodzi*): *iść pieszo* would put an adverb in every cell. Unpaired. (verify)
  WALK: verb(ic('chodzić', 'chodz', 'chodzi', 'chodź', IPF)),
  MOVE_ONESELF: verb(sie(ac('rusz', IPF)), sie(ic('ruszyć', 'rusz', 'ruszy', 'rusz')), R),
  // Not reflexive in Polish: *siada*, *usiadł*.
  SIT_DOWN: verb(ac('siad', IPF),
    a('usiąść', 'usiądę, usiądziesz, usiądzie, usiądziemy, usiądziecie, usiądą', 'usiadł, usiadła, usiadło, usiedli, usiadły', 'usiądź')),
  STAND_UP: verb(
    a('wstawać', 'wstaję, wstajesz, wstaje, wstajemy, wstajecie, wstają', l('wstawa'), 'wstawaj', { adverbial: 'wstając' }),
    a('wstać', 'wstanę, wstaniesz, wstanie, wstaniemy, wstaniecie, wstaną', l('wsta'), 'wstań'),
  ),
  FLY: verb(
    a('lecieć', e('lec', 'leci'), l('lecia', 'lecie'), 'leć', { adverbial: 'lecąc' }),
    a('polecieć', e('polec', 'poleci'), l('polecia', 'polecie'), 'poleć'),
  ),
  APPEAR: verb(sie(ac('pojawi', IPF)), sie(ic('pojawić', 'pojawi', 'pojawi', 'pojaw')), R),

  // ── Copular ───────────────────────────────────────────────────────
  // BE alone stores its future, which the imperfective future is built with (style-pl.md).
  BE: verb(a('być', 'jestem, jesteś, jest, jesteśmy, jesteście, są', l('by'), 'bądź', { adverbial: 'będąc' }), undefined, {
    '1sg_future': 'będę', '2sg_future': 'będziesz', '3sg_future': 'będzie',
    '1pl_future': 'będziemy', '2pl_future': 'będziecie', '3pl_future': 'będą',
    copula: '1',
  }),
  // "How are you faring": *jak się masz*, *mam się dobrze*. Unpaired.
  BE_FARING: verb(sie(a('mieć', 'mam, masz, ma, mamy, macie, mają', l('mia', 'mie'), 'miej', { adverbial: 'mając' })), undefined, R),
  // *stawać się / stać się* + instrumental (*staje się legendą*).
  BECOME: verb(
    sie(a('stawać', 'staję, stajesz, staje, stajemy, stajecie, stają', l('stawa'), 'stawaj', { adverbial: 'stając' })),
    sie(a('stać', 'stanę, staniesz, stanie, staniemy, staniecie, staną', l('sta'), 'stań')),
    R,
  ),
  // *wydaje się* (+ dative terminus, *wydaje mi się*). Stative, unpaired; no imperative.
  SEEM: verb(sie(a('wydawać', 'wydaję, wydajesz, wydaje, wydajemy, wydajecie, wydają', l('wydawa'), null, { adverbial: 'wydając' })), undefined,
    { ...R, seeming: '1', terminus_case: 'dat' }),

  // ── Modals (no pf_ keys) ──────────────────────────────────────────
  // No imperative.
  MUST: verb(a('musieć', e('musz', 'musi'), l('musia', 'musie'), null, { adverbial: 'musząc' })),
  CAN: { ...MOC },
  // Imperative *chciej* is rare, so none is stored.
  WILL: verb(a('chcieć', 'chcę, chcesz, chce, chcemy, chcecie, chcą', l('chcia', 'chcie'), null, { adverbial: 'chcąc' })),
  // Permission is *móc* (*możesz iść*); *wolno* is impersonal. (verify)
  MAY: { ...MOC },
  // Possibility: *może padać*.
  MIGHT: { ...MOC },
  // *powinien* is a defective, adjective-like modal that agrees in gender and takes the past's person
  // endings on itself (*powinienem, powinnaś, powinniśmy*), its past with *był* (*powinien był*). Stored
  // as a verb for the table's shape: the present is the masculine/virile persons, the past cells the
  // *powinien był* periphrasis; the gendered present stems ride under `present_*`. The engine must
  // special-case it (`defective_agreeing: '1'`). No infinitive exists: `base` is the citation form. (verify)
  SHOULD: {
    ...verb(a('powinien', 'powinienem, powinieneś, powinien, powinniśmy, powinniście, powinni',
      'powinien był, powinna była, powinno było, powinni byli, powinny były', null)),
    present_masc: 'powinien', present_fem: 'powinna', present_neut: 'powinno',
    present_virile: 'powinni', present_nonvirile: 'powinny', present_stem_masc: 'powinien',
    defective_agreeing: '1',
  },
};
