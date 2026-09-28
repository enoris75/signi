import type { LanguageColumn } from '../types.js';
import { verb, type Aspect } from './helpers.js';

/**
 * Lithuanian verbs, part B (P18-E6): the interface verbs (SET, PIN, APPLY, …), speech and thought, the
 * ditransitives, the motion and posture verbs, BE and its senses, BECOME and SEEM, and the modals — the
 * slice of Polish's `pl/verbs-b.ts`. Keys as in style-lt.md § Verbs: the imperfective unprefixed, its
 * dictionary perfective under `pf_` only where Lithuanian pairs one with the same sense; statives and
 * modals unpaired. Every form is *(verify)* until the native review (P18-E12); `// (verify)` marks the
 * choices the author is specifically unsure of.
 *
 * Decisions this file takes where style-lt.md is silent:
 * - **A prefixed verb with no plain partner stays unpaired** (*nustatyti, atsakyti, parduoti, ateiti,
 *   grįžti*): its present (*nustato, atsako, parduoda*) is the ordinary present, and the secondary
 *   imperfective in *-inėti* (*nustatinėti, pardavinėti*) would make an odd label.
 * - **A suffix reflexive stays unpaired** (*keistis, mokytis, suktis, laikytis*): its perfective is a
 *   prefix reflexive (*pasikeisti, išmokti*), and the entry-level `reflexive` flag would make the engine
 *   attach *-si* to the perfective's cells too.
 * - **The feminine active past participle of a primary verb** (a consonant root with an *ė*-past:
 *   *nešė, baigė, mirė, davė*) is *-usi* (*baigusi, mirusi, davusi*), not the helper's *-iusi*, which
 *   holds only for the *-yti* verbs (*sakiusi, mačiusi*): `pri()` below writes it (helper defect).
 * - **The 2sg present of a *-čia / -džia* verb** hardens the stem (*kviečia → kvieti, leidžia →
 *   leidi*), where the helper keeps it soft (*kvieči*): written in `over` (helper defect).
 * - **A prefixed one-syllable *ū* stem** keeps the short 3rd-person future (*sugrius*), where the
 *   helper counts the prefix and writes *sugriūs*: written in `over` (helper defect).
 * - The imperative is dropped where Polish drops it (the modals, MEAN, HAPPEN, SEEM): `noImp()`.
 */

type Forms = Record<string, string>;

/**
 * A primary verb's aspect (consonant root, *ė*-past: *baigti, baigia, baigė*): the helper's rules, with
 * the feminine active past participle in *-usi* (*baigusi, baigusios*) from the 3rd-person past.
 */
function pri(parts: string, over: Forms = {}): Aspect {
  const past3 = parts.split(',')[2]!.trim();
  const s = past3.slice(0, -1);
  return { parts, over: { past_active_fem: `${s}usi`, past_active_fem_plural: `${s}usios`, ...over } };
}

/** No imperative, in either aspect (a modal, a verb whose imperative is not in use). */
function noImp(forms: Forms): Forms {
  return Object.fromEntries(Object.entries(forms).filter(([k]) => !/_imperative$/.test(k)));
}

const R = { reflexive: '1' };

/**
 * *valdyti*: GOVERN and GOVERN_STATE. Lithuanian grammar says it of case government as of a state
 * (*veiksmažodis valdo galininką*, *valdyti šalį*), so the two senses share the word, with a plain
 * accusative (Polish *rządzić* takes the instrumental). Unpaired.
 */
const VALDYTI = verb('valdyti, valdo, valdė');

/** *veikti*: WORK (it works, *kompiuteris veikia*) and ACT (to take action) — one word, as Polish *działać*. Unpaired (*paveikti* is "affect"). */
const VEIKTI = verb(pri('veikti, veikia, veikė'));

/**
 * *leisti* + dative (*leisti vaikui žaisti*): LET and ALLOW. Lithuanian has one word for both (Polish's
 * *pozwolić / zezwolić* split has no counterpart; *pavelyti* is a barbarism). Unpaired. (verify)
 */
const LEISTI = verb(pri('leisti, leidžia, leido', { '2sg_present': 'leidi' }), undefined, { object_case: 'dat' });

/** *gyventi*: LIVE (reside) and LIVE_ALIVE (be alive) — one word in Lithuanian. Unpaired. (verify) */
const GYVENTI = verb('gyventi, gyvena, gyveno');

/** *galėti*: CAN, MAY and MIGHT (ability, permission, possibility: *gali lyti*), as Polish *móc*. No imperative. */
const GALETI = noImp(verb('galėti, gali, galėjo'));

export const LT_VERBS_B: LanguageColumn = {
  // ── Interface and language verbs ──────────────────────────────────
  // The interface's "Nustatyti". Unpaired (*nustatinėti* is iterative).
  SET: verb('nustatyti, nustato, nustatė'),
  // The interface's "Prisegti" / "Atsegti" (a pinned message, a pinned tab). Unpaired. (verify)
  PIN: verb(pri('prisegti, prisega, prisegė')),
  UNPIN: verb(pri('atsegti, atsega, atsegė')),
  // Autocomplete is *automatinis užbaigimas*; *baigti* alone is "finish" in general. Unpaired. (verify)
  COMPLETE: verb(pri('užbaigti, užbaigia, užbaigė')),
  // The interface's "Taikyti".
  APPLY: verb('taikyti, taiko, taikė', 'pritaikyti, pritaiko, pritaikė'),
  NAME: verb('vadinti, vadina, vadino', 'pavadinti, pavadina, pavadino'),
  // Unpaired (*aprašinėti* is iterative).
  DESCRIBE: verb('aprašyti, aprašo, aprašė'),
  // Grammar: a modifier (*pažyminys*) qualifies its head. The loanword is biaspectual, unpaired. (verify)
  MODIFY: verb('modifikuoti, modifikuoja, modifikavo'),
  // "Identify exactly": *patikslinti*. *nurodyti* is left to INDICATE. (verify)
  SPECIFY: verb('tikslinti, tikslina, tikslino', 'patikslinti, patikslina, patikslino'),
  // The interface's "Redaguoti". Unpaired (*suredaguoti* is rare).
  EDIT: verb('redaguoti, redaguoja, redagavo'),
  // Grammar: *veiksmažodis valdo galininką*.
  GOVERN: { ...VALDYTI },
  // Unpaired (*priiminėti* is iterative). *imti*'s participle: *priėmęs, priėmusi*.
  ACCEPT: verb(pri('priimti, priima, priėmė')),
  // Grammar: *neigiamasis sakinys*. Unpaired (*paneigti* is "refute"). (verify)
  NEGATE: verb(pri('neigti, neigia, neigė')),
  ASSERT: verb(pri('teigti, teigia, teigė')),
  // *išreikšti*, so it stays apart from MEAN (*reikšti*). Unpaired. (verify)
  EXPRESS: verb(pri('išreikšti, išreiškia, išreiškė')),

  // ── Speech, thought, perception ───────────────────────────────────
  SAY: verb('sakyti, sako, sakė', 'pasakyti, pasako, pasakė', { content_clause_force: 'either' }),
  // *kalbėti apie* + accusative. Unpaired (*pakalbėti* is "talk for a while").
  SPEAK: verb('kalbėti, kalba, kalbėjo', undefined, { topic_prep: 'apie', topic_prep_case: 'acc' }),
  // Summon: *pakviesti gydytoją*. *šaukti* is left to CRY_OUT. (verify)
  CALL: verb(
    pri('kviesti, kviečia, kvietė', { '2sg_present': 'kvieti' }),
    pri('pakviesti, pakviečia, pakvietė', { '2sg_present': 'pakvieti' }),
  ),
  // *skambinti kam*: the one called is dative.
  CALL_PHONE: verb('skambinti, skambina, skambino', 'paskambinti, paskambina, paskambino', { object_case: 'dat' }),
  // *Ką tai reiškia?* Unpaired; no imperative in use.
  MEAN: noImp(verb(pri('reikšti, reiškia, reiškė'))),
  // Taking something as true: *tikėti gandais*, instrumental; *tikėti kam* (dative) is trusting a person's word. (verify)
  BELIEVE: verb('tikėti, tiki, tikėjo', 'patikėti, patiki, patikėjo', { object_case: 'ins' }),
  // *galvoti apie* + accusative.
  THINK: verb('galvoti, galvoja, galvojo', 'pagalvoti, pagalvoja, pagalvojo', { topic_prep: 'apie', topic_prep_case: 'acc' }),
  HEAR: verb('girdėti, girdi, girdėjo', 'išgirsti, išgirsta, išgirdo'),
  // The object is the question (*atsakyti į klausimą*); the one answered is a dative terminus. Unpaired
  // (*atsakinėti* is iterative).
  ANSWER: verb('atsakyti, atsako, atsakė', undefined, { object_prep: 'į', object_prep_case: 'acc', terminus_case: 'dat' }),
  TELL: verb('pasakoti, pasakoja, pasakojo', 'papasakoti, papasakoja, papasakojo',
    { content_clause_force: 'either', infinitive_sense: 'TELL_ORDER', terminus_case: 'dat' }),
  // *liepti kam ką daryti*. Unpaired.
  TELL_ORDER: verb(pri('liepti, liepia, liepė'), undefined, { object_case: 'dat' }),
  // *klausti ko apie ką*: the one asked is genitive (*paklausk mamos*), the thing asked about *apie* + accusative.
  // The future *klausiu, klaus* is spelt as the present's 1sg, as it is. (verify)
  ASK: verb(pri('klausti, klausia, klausė'), pri('paklausti, paklausia, paklausė'),
    { content_clause_force: 'interrogative', object_prep: 'apie', object_prep_case: 'acc', terminus_case: 'gen' }),

  // ── Transitive ────────────────────────────────────────────────────
  // "Stand in for": *žodis atstoja sakinį*. *pakeisti* is CHANGE's perfective. Unpaired. (verify)
  REPLACE: verb('atstoti, atstoja, atstojo'),
  // *kvėpuoti oru*, instrumental. Unpaired (*įkvėpti* is "breathe in").
  BREATHE: verb('kvėpuoti, kvėpuoja, kvėpavo', undefined, { object_case: 'ins' }),
  // *mainyti / išmainyti*: *keisti* is CHANGE and *keistis* CHANGE_ONESELF. (verify)
  EXCHANGE: verb('mainyti, maino, mainė', 'išmainyti, išmaino, išmainė'),
  // *apsupti*, surround. Unpaired (*supti* is "rock"). (verify)
  ENCLOSE: verb('apsupti, apsupa, apsupo'),
  GOVERN_STATE: { ...VALDYTI },
  // *lydėti ką*, accusative (Polish *towarzyszyć* + dative). Unpaired (*palydėti* is "see off").
  ACCOMPANY: verb('lydėti, lydi, lydėjo'),
  // *ieškoti ko*. Unpaired (*paieškoti* is "search for a while").
  SEARCH: verb('ieškoti, ieško, ieškojo', undefined, { object_case: 'gen' }),
  // Unpaired: *rasti* is itself the everyday perfective-and-present (*randa, rado*); *surasti* is "find after a search". (verify)
  FIND: verb('rasti, randa, rado'),
  // *susitikti su kuo*: the prefix reflexive, with *su* + instrumental (*sutikti* is also "agree"). Unpaired. (verify)
  MEET: verb('susitikti, susitinka, susitiko', undefined, { object_prep: 'su', object_prep_case: 'ins' }),
  // *išdėstyti*, lay out in order. Unpaired (*dėstyti* is "teach"). (verify)
  ARRANGE: verb('išdėstyti, išdėsto, išdėstė'),
  // *jungti ką su kuo*.
  CONNECT: verb(pri('jungti, jungia, jungė'), pri('sujungti, sujungia, sujungė'), { terminus_prep: 'su', terminus_prep_case: 'ins' }),
  LET: { ...LEISTI },
  ALLOW: { ...LEISTI },
  // *mėgti*, nominative subject and accusative object; *patikti* would want a dative experiencer. Stative, unpaired.
  LIKE: verb('mėgti, mėgsta, mėgo'),
  // *padėti kam*. Unpaired.
  HELP_VERB: verb('padėti, padeda, padėjo', undefined, { object_case: 'dat' }),
  // *dėkoti kam*.
  THANK: verb('dėkoti, dėkoja, dėkojo', 'padėkoti, padėkoja, padėkojo', { object_case: 'dat' }),
  // Gender-neutral: *susituokti su kuo* (*vesti* / *tekėti už* depend on the subject's sex). The prefix
  // reflexive, no flag. Unpaired. (verify)
  MARRY: verb(pri('susituokti, susituokia, susituokė'), undefined, { object_prep: 'su', object_prep_case: 'ins' }),
  // *mokytis ko*: the suffix reflexive, unpaired (*išmokti* is not reflexive; see the header).
  LEARN: verb('mokytis, moko, mokė', undefined, { ...R, object_case: 'gen' }),
  // "Come after in an order": *po pirmojo skyriaus seka antrasis*, *po* + genitive. Unpaired. (verify)
  FOLLOW: verb(pri('sekti, seka, sekė'), undefined, { object_prep: 'po', object_prep_case: 'gen' }),

  // ── Ditransitive ──────────────────────────────────────────────────
  // style-lt.md's pair. (verify)
  GIVE: verb(pri('duoti, duoda, davė'), pri('atiduoti, atiduoda, atidavė'), { terminus_case: 'dat' }),
  // Unpaired: *parduoda* is the ordinary present (*pardavinėti* is iterative).
  SELL: verb(pri('parduoti, parduoda, pardavė'), undefined, { terminus_case: 'dat' }),
  PAY: verb('mokėti, moka, mokėjo', 'sumokėti, sumoka, sumokėjo', { terminus_case: 'dat' }),
  PROVIDE: verb(pri('teikti, teikia, teikė'), pri('suteikti, suteikia, suteikė'), { terminus_case: 'dat' }),
  // From one holder to another: *perduoti kam*. Unpaired.
  TRANSFER: verb(pri('perduoti, perduoda, perdavė'), undefined, { terminus_case: 'dat' }),
  SHOW: verb('rodyti, rodo, rodė', 'parodyti, parodo, parodė', { terminus_case: 'dat' }),
  SEND: verb(
    pri('siųsti, siunčia, siuntė', { '2sg_present': 'siunti' }),
    pri('išsiųsti, išsiunčia, išsiuntė', { '2sg_present': 'išsiunti' }),
    { terminus_case: 'dat' },
  ),

  // ── Intransitive ──────────────────────────────────────────────────
  // Unpaired (*pravirkti* is inceptive).
  CRY: verb(pri('verkti, verkia, verkė')),
  // Unpaired (*iškentėti* is "endure to the end").
  SUFFER: verb({ parts: 'kentėti, kenčia, kentėjo', over: { '2sg_present': 'kenti' } }),
  // "Be on fire": *degti*; *sudegti* "burn down". *uždegti* is left to SET_ON_FIRE.
  BURN: verb(pri('degti, dega, degė'), pri('sudegti, sudega, sudegė')),
  // A structure's collapse (*pastatas sugriuvo*); not reflexive in Lithuanian. The prefixed future keeps
  // the root's short 3rd person (*grius → sugrius*), which the helper, counting the prefix's syllable,
  // misses (helper defect). (verify)
  COLLAPSE: verb('griūti, griūva, griuvo', { parts: 'sugriūti, sugriūva, sugriuvo', over: { '3sg_future': 'sugrius', '3pl_future': 'sugrius' } }),
  LIVE: { ...GYVENTI },
  LIVE_ALIVE: { ...GYVENTI },
  // Unpaired (*numirti* is colloquial).
  DIE: verb(pri('mirti, miršta, mirė')),
  // *likti* is itself the everyday word (*lieka, liko*). Unpaired.
  STAY: verb('likti, lieka, liko'),
  // *laukti ko*, genitive.
  WAIT: verb(pri('laukti, laukia, laukė'), pri('palaukti, palaukia, palaukė'), { object_case: 'gen' }),
  // *prekiauti* (+ instrumental for the goods, which this intransitive concept does not seat). Unpaired.
  TRADE: verb('prekiauti, prekiauja, prekiavo'),
  ACT: { ...VEIKTI },
  WORK: { ...VEIKTI },
  // Unpaired (*padirbėti* is "work for a while").
  WORK_LABOUR: verb('dirbti, dirba, dirbo'),
  // *sužaisti partiją*. (verify)
  PLAY_GAME: verb(pri('žaisti, žaidžia, žaidė', { '2sg_present': 'žaidi' }), pri('sužaisti, sužaidžia, sužaidė', { '2sg_present': 'sužaidi' })),
  // Unpaired: *pralaimi* is the ordinary present.
  LOSE_GAME: verb('pralaimėti, pralaimi, pralaimėjo'),
  // *pradėti* + a bare infinitive (*pradeda valgyti*); unpaired, as *pradeda* is the ordinary present. The
  // same word as START in all likelihood, as in five other languages (the concept's glosses tell them
  // apart); *prasidėti* ("the film begins") would lose the infinitive. (verify)
  BEGIN: verb('pradėti, pradeda, pradėjo'),
  // *nustoti* + infinitive (*nustoja valgyti*). Unpaired.
  STOP_DOING: verb('nustoti, nustoja, nustojo'),
  // Come to a halt: *sustoti*, not reflexive (STOP is the causative *sustabdyti*). Unpaired.
  STOP_ONESELF: verb('sustoti, sustoja, sustojo'),
  // "Continues eating" is *toliau valgo*, the adverb on the finite verb, as Polish *dalej je* and
  // German *weiter*; negated, *toliau nevalgo*. *tęsti* itself takes a noun (*tęsia darbą*), and is
  // probably CONTINUE's word too, as Polish *kontynuować* is both. Unpaired. (verify)
  CONTINUE_DOING: verb(pri('tęsti, tęsia, tęsė'), undefined, { complement_particle: 'toliau', negative_complement_adverb: 'toliau' }),
  // *keistis*, the suffix reflexive (CHANGE is *keisti*). Unpaired (see the header).
  CHANGE_ONESELF: verb(pri('keistis, keičia, keitė', { '2sg_present': 'keiti' }), undefined, R),
  // Lithuanian says "come before" with a phrase (*eiti pirma*, *būti prieš*), and a verb is one word;
  // *pirmauti* ("be first, lead") is the nearest single verb. Unpaired. (verify)
  PRECEDE: verb('pirmauti, pirmauja, pirmavo'),
  // "Take place": *vykti / įvykti*. No imperative in use.
  HAPPEN: noImp(verb('vykti, vyksta, vyko', 'įvykti, įvyksta, įvyko')),
  GROW: verb('augti, auga, augo', 'užaugti, užauga, užaugo'),
  // Unpaired (*ištekėti* is "flow out", and "marry" of a woman).
  FLOW: verb('tekėti, teka, tekėjo'),

  // ── Motion and posture ────────────────────────────────────────────
  // The *nu-* perfective keeps the sense (style-lt.md).
  RUN: verb('bėgti, bėga, bėgo', 'nubėgti, nubėga, nubėgo'),
  // *šokinėti* (be jumping) / *šokti* (jump once), as Polish *skakać / skoczyć*. *šokti* is also "dance". (verify)
  JUMP: verb('šokinėti, šokinėja, šokinėjo', 'šokti, šoka, šoko'),
  // Unpaired: *ateina* is the ordinary present (*ateidinėti* is iterative). (verify)
  COME: verb('ateiti, ateina, atėjo'),
  // *eiti / nueiti* (*nuėjo į parduotuvę*). (verify)
  GO: verb('eiti, eina, ėjo', 'nueiti, nueina, nuėjo'),
  // Unpaired: *grįžta* is the ordinary present.
  RETURN: verb('grįžti, grįžta, grįžo'),
  // Rotate: *ratas sukasi*, the suffix reflexive. Unpaired (see the header).
  TURN: verb('suktis, suka, suko', undefined, R),
  // Depart, set off: *išvykti*, so it stays apart from GO_OUT (*išeiti*). Unpaired. (verify)
  LEAVE_DEPART: verb('išvykti, išvyksta, išvyko'),
  // Flee: *pabėgti*. Unpaired.
  RUN_AWAY: verb('pabėgti, pabėga, pabėgo'),
  GO_OUT: verb('išeiti, išeina, išėjo'),
  // *vaikščioti*, "to walk" (*vaikas jau vaikšto*), present *vaikšto*. Unpaired.
  WALK: verb('vaikščioti, vaikšto, vaikščiojo'),
  // *judėti*, change position. Unpaired (*pajudėti* is "start moving").
  MOVE_ONESELF: verb('judėti, juda, judėjo'),
  // The prefix reflexives: *atsisėsti, atsistoti* (negated *neatsisėda*), no flag. Unpaired.
  SIT_DOWN: verb('atsisėsti, atsisėda, atsisėdo'),
  STAND_UP: verb('atsistoti, atsistoja, atsistojo'),
  // *skristi / nuskristi*, as RUN. (verify)
  FLY: verb('skristi, skrenda, skrido', 'nuskristi, nuskrenda, nuskrido'),
  // Come into view: *pasirodyti*, the prefix reflexive, no flag. Unpaired.
  APPEAR: verb('pasirodyti, pasirodo, pasirodė'),

  // ── Copular ───────────────────────────────────────────────────────
  // *esu, esi, yra, esame, esate*; the negated *nesu … nėra* is the engine's. Future *būsiu … bus*.
  BE: verb({ parts: 'būti, yra, buvo', over: { '1sg_present': 'esu', '2sg_present': 'esi', '1pl_present': 'esame', '2pl_present': 'esate' } },
    undefined, { copula: '1' }),
  // "How are you faring": *kaip laikaisi?*, *laikausi gerai* — the personal form (*kaip sekasi?* is
  // impersonal, with a dative). The suffix reflexive. Unpaired. (verify)
  BE_FARING: verb('laikytis, laiko, laikė', undefined, R),
  // *tapti* + instrumental (*tampa legenda*), the engine's. Unpaired: *tampa* is the ordinary present.
  BECOME: verb('tapti, tampa, tapo'),
  // *atrodo* (+ dative terminus, *man atrodo*). Stative, unpaired; no imperative.
  SEEM: noImp(verb('atrodyti, atrodo, atrodė', undefined, { seeming: '1', terminus_case: 'dat' })),

  // ── Modals (no pf_ keys, no imperative) ───────────────────────────
  // *turėti* + infinitive (*turiu eiti*): Lithuanian's MUST is HAVE's word (style-lt.md).
  MUST: noImp(verb('turėti, turi, turėjo')),
  CAN: { ...GALETI },
  WILL: noImp(verb('norėti, nori, norėjo')),
  // Permission: *gali eiti*. (verify)
  MAY: { ...GALETI },
  // Possibility: *gali lyti*.
  MIGHT: { ...GALETI },
  // "Should" is *turėti*'s conditional (*turėtų eiti*), stored in the present cells as Italian stores
  // *dovrebbe* under *dovere*, and flagged `conditional` as de/en's SHOULD are. The past cells keep
  // *turėjo* ("was to"): *būtų turėjęs* would agree in gender. `base` is the infinitive, as MUST's. (verify)
  SHOULD: noImp(verb({
    parts: 'turėti, turi, turėjo',
    over: {
      '1sg_present': 'turėčiau', '2sg_present': 'turėtum', '3sg_present': 'turėtų',
      '1pl_present': 'turėtume', '2pl_present': 'turėtumėte', '3pl_present': 'turėtų',
    },
  }, undefined, { conditional: '1' })),
};
