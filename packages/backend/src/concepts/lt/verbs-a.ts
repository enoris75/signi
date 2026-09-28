import type { LanguageColumn } from '../types.js';
import { verb, type Aspect } from './helpers.js';

/**
 * Lithuanian verbs, part A (P18-E6): Polish's `pl/verbs-a.ts` slice, standard Lithuanian (VLKK norms),
 * one lexeme holding both aspects (style-lt.md § Verbs, P18 D4, D5). Each verb is written as the
 * dictionary's three principal parts (infinitive, 3rd-person present, 3rd-person past), the perfective
 * under `pf_` only where Lithuanian pairs one with the same sense. Every form is *(verify)* until the
 * native review (P18-E12); `// (verify)` marks the choices the author is specifically unsure of.
 *
 * `primary` below corrects two cells the shared helper gets wrong for a **primary** verb (a root verb
 * with no *-y- / -ė- / -o-* suffix: *nešti, imti, keisti*), and every primary verb goes through it:
 *  - the active past participle's feminine is hard: *nešė → nešusi*, *metė → metusi*, *keitė →
 *    (pa)keitusi*, *ėmė → ėmusi*; the helper palatalises every *-ė* past (*-iusi*), which is right only
 *    for the *-yti* verbs (*valgė → valgiusi*, *matė → mačiusi*);
 *  - an *-ia* present whose stem ends in *č / dž* (from *t / d*) has *t / d* back in the 2sg: *keičia →
 *    keiti*, *spaudžia → spaudi*; the helper writes *keiči*.
 *
 * Unpaired (no `pf_`): the statives, as in Polish (LOVE, DESIRE, KNOW, KNOW_ACQUAINTED, REMEMBER,
 * EXPECT, OWN, HOLD, HOLD_GRASP, INCLUDE, NEED, HAVE, DEPEND), and every verb whose one Lithuanian word
 * already serves both aspects, prefixed or not (*gauti, pradėti, palikti, atidaryti, laimėti,
 * suprasti*), or whose only prefixed partner changes the sense. Loan verbs in *-uoti* (*eksportuoti,
 * importuoti, transliuoti, anuliuoti*) are biaspectual, as Polish *anulować* is.
 *
 * Mirrored meaning flags: KNOW's `content_clause_force` and `object_sense`, CAUSE_VERB's `causative`,
 * EXPECT's `reflexive` (here a suffix reflexive, *tikėtis*). Government in Lithuanian's own terms:
 * DESIRE, EXPECT, NEED + genitive; PLAY_INSTRUMENT + bare instrumental (*groti gitara*); LOOK_AT *į* +
 * accusative; DEPEND *nuo* + genitive; ADD *prie* + genitive; LINK *su* + instrumental; TRANSFORM's
 * predicate in the bare instrumental. Polish's genitive objects of TRY and USE are not mirrored:
 * *bandyti, naudoti* take the accusative.
 */

type Forms = Record<string, string>;

/**
 * A primary verb's aspect: the principal parts plus the two corrections described above (hard
 * *-usi* participle after an *-ė* past; *t / d* in the 2sg of a *č / dž* present), and `over` last.
 */
function primary(parts: string, over: Forms = {}): Aspect {
  const [, pres3 = '', past3 = ''] = parts.split(',').map((s) => s.trim());
  const fix: Forms = {};
  if (past3.endsWith('ė')) {
    const ps = past3.slice(0, -1);
    Object.assign(fix, { past_active_fem: `${ps}usi`, past_active_fem_plural: `${ps}usios` });
  }
  const soft = /^(.*)(č|dž)ia$/.exec(pres3);
  if (soft) fix['2sg_present'] = `${soft[1]}${soft[2] === 'č' ? 't' : 'd'}i`;
  return { parts, over: { ...fix, ...over } };
}

export const LT_VERBS_A: LanguageColumn = {
  // pjauti / perpjauti — cut (through); *supjauti* is "cut up", *nupjauti* "cut off". (verify: the partner)
  CUT: verb(primary('pjauti, pjauna, pjovė'), primary('perpjauti, perpjauna, perpjovė')),
  EAT: verb('valgyti, valgo, valgė', 'suvalgyti, suvalgo, suvalgė'),
  // ėsti / suėsti — an animal's eating (de fressen); Lithuanian has the word, neutral of animals. EAT
  // carries no `subject_sense` (P18's opening table has *katė valgo pelę*, and *valgyti* of an animal
  // is not an error as German *essen* is), so only a plan naming the sense reaches it. (verify)
  EAT_ANIMAL: verb(primary('ėsti, ėda, ėdė'), primary('suėsti, suėda, suėdė')),
  DRINK: verb(primary('gerti, geria, gėrė'), primary('išgerti, išgeria, išgėrė')),
  // pilti / įpilti — pour (a drink, into a glass); *išpilti* is "pour out". (verify: the partner)
  POUR: verb(primary('pilti, pila, pylė'), primary('įpilti, įpila, įpylė')),
  // vartoti / suvartoti — consume, ingest (*vartoti maistą, vaistus*).
  CONSUME: verb('vartoti, vartoja, vartojo', 'suvartoti, suvartoja, suvartojo'),
  SEE: verb('matyti, mato, matė', 'pamatyti, pamato, pamatė'),
  LOVE: verb('mylėti, myli, mylėjo'),
  // trokšti + genitive (*trokšta laisvės*), a bare infinitive (*trokšta valgyti*).
  DESIRE: verb('trokšti, trokšta, troško', undefined, { object_case: 'gen' }),
  // žudyti / nužudyti — kill (a person or an animal); *užmušti* is "kill by a blow".
  KILL: verb('žudyti, žudo, žudė', 'nužudyti, nužudo, nužudė'),
  // žinoti (a fact, a clause) / pažinoti (a person, a place), as es saber / conocer.
  KNOW: verb('žinoti, žino, žinojo', undefined, { content_clause_force: 'either', object_sense: 'KNOW_ACQUAINTED' }),
  // pažinoti: the present has the nasal *pažįsta* (*pažįstu, pažįsti*).
  KNOW_ACQUAINTED: verb('pažinoti, pažįsta, pažinojo'),
  // atsiminti + accusative (*atsimenu tą dieną*), a prefix reflexive (-si- inside, no flag); unpaired
  // for the stative sense, as Polish *pamiętać*. (verify: *prisiminti* is "recall")
  REMEMBER: verb(primary('atsiminti, atsimena, atsiminė')),
  CONSIDER: verb('svarstyti, svarsto, svarstė', 'apsvarstyti, apsvarsto, apsvarstė'),
  // tikėtis + genitive (*tikiuosi svečio*), a suffix reflexive (the engine adds -si); *laukti* is WAIT.
  // Distinct from *tikėti* (BELIEVE) by the reflexive. (verify)
  EXPECT: verb('tikėtis, tiki, tikėjo', undefined, { reflexive: '1', object_case: 'gen' }),
  READ: verb('skaityti, skaito, skaitė', 'perskaityti, perskaito, perskaitė'),
  // šaukti / sušukti — shout, cry out once (Polish *krzyczeć / krzyknąć*). (verify: CALL may want *šaukti* too)
  CRY_OUT: verb(primary('šaukti, šaukia, šaukė'), 'sušukti, sušunka, sušuko'),
  // kąsti / įkąsti — bite (into). (verify: the partner)
  BITE: verb('kąsti, kanda, kando', 'įkąsti, įkanda, įkando'),
  // mušti / sumušti — strike repeatedly, beat (up), defeat (*sumušti priešininką*).
  BEAT: verb(primary('mušti, muša, mušė'), primary('sumušti, sumuša, sumušė')),
  // deginti / padegti — burn (something) / set fire to (*padegti namą*); BURN (intransitive) is *degti*.
  // (verify: the pairing)
  SET_ON_FIRE: verb('deginti, degina, degino', primary('padegti, padega, padegė')),
  EXTINGUISH: verb('gesinti, gesina, gesino', 'užgesinti, užgesina, užgesino'),
  BUY: verb('pirkti, perka, pirko', 'nupirkti, nuperka, nupirko'),
  // valdyti — own, possess (*valdyti žemę, turtą*); HAVE is *turėti*. (verify: may clash with GOVERN_STATE)
  OWN: verb('valdyti, valdo, valdė'),
  // talpinti — hold, contain (*talpina litrą*); unpaired. (verify: *turėti savyje*)
  HOLD: verb('talpinti, talpina, talpino'),
  // laikyti — hold in the hand, unpaired (*palaikyti* is "support").
  HOLD_GRASP: verb('laikyti, laiko, laikė'),
  // apimti — include, cover (*apima visas sritis*); unpaired for the stative sense.
  INCLUDE: verb(primary('apimti, apima, apėmė')),
  // kalinti / įkalinti — imprison; *uždaryti* is CLOSE.
  CONFINE: verb('kalinti, kalina, kalino', 'įkalinti, įkalina, įkalino'),
  TAME: verb('jaukinti, jaukina, jaukino', 'prijaukinti, prijaukina, prijaukino'),
  // daryti / padaryti for MAKE as for DO: Lithuanian's everyday verb for both (as Polish *robić*, es
  // *hacer*); *gaminti* is PRODUCE.
  MAKE: verb('daryti, daro, darė', 'padaryti, padaro, padarė'),
  DO: verb('daryti, daro, darė', 'padaryti, padaro, padarė'),
  // tęsti — imperfective, unpaired (*pratęsti* is "extend, prolong").
  CONTINUE: verb(primary('tęsti, tęsia, tęsė')),
  // groti / sugroti + bare instrumental (*groti gitara*), Polish *grać na* + locative.
  PLAY_INSTRUMENT: verb('groti, groja, grojo', 'sugroti, sugroja, sugrojo', { object_case: 'ins' }),
  // reikėti — the needer in the dative, the needed in the genitive (*katei reikia pelės*), so the
  // experiencer frame; there is no everyday personal verb. With the frame the engine makes the object
  // the subject: E9 must keep it genitive, not nominative. (verify: the frame and its case)
  NEED: verb('reikėti, reikia, reikėjo', undefined, { experiencer: '1', object_case: 'gen' }),
  // bandyti / pabandyti: a bare infinitive (*bando valgyti*), an accusative object (*bandyti laimę*).
  TRY: verb('bandyti, bando, bandė', 'pabandyti, pabando, pabandė'),
  CREATE: verb(primary('kurti, kuria, kūrė'), primary('sukurti, sukuria, sukūrė')),
  DESTROY: verb('naikinti, naikina, naikino', 'sunaikinti, sunaikina, sunaikino'),
  // suvokti — perceive, become aware of; unpaired (no ordinary imperfective partner). (verify)
  PERCEIVE: verb(primary('suvokti, suvokia, suvokė')),
  // suprasti serves both aspects (*suprantu* / *supratau*); unpaired.
  UNDERSTAND: verb('suprasti, supranta, suprato'),
  // turėti — also MUST (style-lt.md: MUST *turėti*); Lithuanian uses the one verb for both.
  HAVE: verb('turėti, turi, turėjo'),
  // įgyti — acquire (*įgyti patirties*), unpaired. The future's 3rd person shortens the root *gy-*
  // (*įgis*), which the helper misses under a prefix. (verify)
  ACQUIRE: verb({ parts: 'įgyti, įgyja, įgijo', over: { '3sg_future': 'įgis', '3pl_future': 'įgis' } }),
  // imti / paimti — take (*paimti knygą*).
  TAKE: verb(primary('imti, ima, ėmė'), primary('paimti, paima, paėmė')),
  // gauti — get, receive; serves both aspects, unpaired.
  GET: verb('gauti, gauna, gavo'),
  // dėti / padėti — put, lay (de legen). *padėti* is also HELP's word (+ dative), a homonym.
  PUT: verb('dėti, deda, dėjo', 'padėti, padeda, padėjo'),
  // išlaikyti — keep, not give up (*išlaikyti vietą*), unpaired; *laikyti* is HOLD_GRASP and
  // *pasilikti* also "stay". (verify)
  KEEP: verb('išlaikyti, išlaiko, išlaikė'),
  // prarasti — lose, stop having; unpaired. *pamesti* is "mislay", *pralaimėti* LOSE_GAME.
  LOSE: verb('prarasti, praranda, prarado'),
  // laimėti — win; serves both aspects, unpaired.
  WIN: verb('laimėti, laimi, laimėjo'),
  // atnešti — bring (*nešti* is "carry"); unpaired, serving both aspects.
  BRING: verb(primary('atnešti, atneša, atnešė')),
  // vesti / nuvesti — lead (someone somewhere).
  LEAD: verb(primary('vesti, veda, vedė'), primary('nuvesti, nuveda, nuvedė')),
  // palikti — leave behind; unpaired, serving both aspects.
  LEAVE_BEHIND: verb('palikti, palieka, paliko'),
  // žiūrėti / pažiūrėti į + accusative (*žiūri į katę*).
  LOOK_AT: verb('žiūrėti, žiūri, žiūrėjo', 'pažiūrėti, pažiūri, pažiūrėjo', { object_prep: 'į', object_prep_case: 'acc' }),
  // kreipti / nukreipti — point, turn something toward (*nukreipti šviesą*).
  DIRECT_VERB: verb(primary('kreipti, kreipia, kreipė'), primary('nukreipti, nukreipia, nukreipė')),
  // dalyti / padalyti (the VLKK's preferred form of *dalinti*). (verify)
  DIVIDE: verb('dalyti, dalija, dalijo', 'padalyti, padalija, padalijo'),
  // smūgiuoti / smogti — hit with force; BEAT is *mušti*. (verify: the pairing, *trenkti*)
  STRIKE: verb('smūgiuoti, smūgiuoja, smūgiavo', primary('smogti, smogia, smogė')),
  // nurodyti — point out, indicate (*nurodyti kelią*); unpaired. (verify)
  INDICATE: verb('nurodyti, nurodo, nurodė'),
  CHANGE: verb(primary('keisti, keičia, keitė'), primary('pakeisti, pakeičia, pakeitė')),
  // stabdyti / sustabdyti — bring to a halt (*sustoti* is STOP_ONESELF).
  STOP: verb('stabdyti, stabdo, stabdė', 'sustabdyti, sustabdo, sustabdė'),
  // paversti — turn into, the predicate in the bare instrumental (*paversti varlę princu*; *į* + acc
  // is non-standard). Unpaired: *versti* is TRANSLATE. `object_predicative_case` is new: Polish's
  // `object_predicative_link` (*w*) has no Lithuanian word to name. (verify: the key)
  TRANSFORM: verb(primary('paversti, paverčia, pavertė'), undefined, { object_predicative_case: 'ins' }),
  FEEL: verb(primary('jausti, jaučia, jautė'), 'pajusti, pajunta, pajuto'),
  // lieti / pralieti — shed (*pralieti kraują, ašaras*).
  SHED: verb('lieti, lieja, liejo', 'pralieti, pralieja, praliejo'),
  // gaminti / pagaminti — produce, make (goods, heat); *kurti* is CREATE.
  PRODUCE: verb('gaminti, gamina, gamino', 'pagaminti, pagamina, pagamino'),
  // skatinti / paskatinti — induce someone (accusative) to act, a bare infinitive (*paskatino jį
  // valgyti*). (verify: *priversti* is "force")
  CAUSE_VERB: verb('skatinti, skatina, skatino', 'paskatinti, paskatina, paskatino', { causative: '1' }),
  PRESS: verb(primary('spausti, spaudžia, spaudė'), primary('paspausti, paspaudžia, paspaudė')),
  WRITE: verb('rašyti, rašo, rašė', 'parašyti, parašo, parašė'),
  // spustelėti + accusative (*spustelėkite mygtuką*), the UI's word; unpaired. (verify)
  CLICK: verb('spustelėti, spustelėja, spustelėjo'),
  // priklausyti nuo + genitive (*tai priklauso nuo oro*).
  DEPEND: verb('priklausyti, priklauso, priklausė', undefined, { object_prep: 'nuo', object_prep_case: 'gen' }),
  // pasirinkti — choose, a prefix reflexive; unpaired (*rinktis* would need the suffix flag on the
  // imperfective alone, which one entry cannot carry).
  CHOOSE: verb('pasirinkti, pasirenka, pasirinko'),
  FILTER: verb('filtruoti, filtruoja, filtravo', 'išfiltruoti, išfiltruoja, išfiltravo'),
  // žymėti / pažymėti — mark out (the UI's "select"); CHOOSE is *pasirinkti*.
  SELECT: verb('žymėti, žymi, žymėjo', 'pažymėti, pažymi, pažymėjo'),
  // rinkti / surinkti — type (*rinkti tekstą*). (verify: the UI's *įvesti*)
  TYPE: verb('rinkti, renka, rinko', 'surinkti, surenka, surinko'),
  TRANSLATE: verb(primary('versti, verčia, vertė'), primary('išversti, išverčia, išvertė')),
  // saugoti / išsaugoti — save (a file; the UI's *Išsaugoti*).
  SAVE: verb('saugoti, saugo, saugojo', 'išsaugoti, išsaugo, išsaugojo'),
  // krauti / įkrauti — load (*puslapis kraunasi*); *įkelti* is "upload". (verify)
  LOAD: verb(primary('krauti, krauna, krovė'), primary('įkrauti, įkrauna, įkrovė')),
  // pridėti prie + genitive (*pridėti prie sąrašo*); unpaired. (verify: the key)
  ADD: verb('pridėti, prideda, pridėjo', undefined, { terminus_prep: 'prie', terminus_prep_case: 'gen' }),
  // sieti / susieti su + instrumental. (verify: the key)
  LINK: verb('sieti, sieja, siejo', 'susieti, susieja, susiejo', { terminus_prep: 'su', terminus_prep_case: 'ins' }),
  EXPORT: verb('eksportuoti, eksportuoja, eksportavo'),
  // transliuoti — broadcast (*transliuoti laidą*).
  BROADCAST: verb('transliuoti, transliuoja, transliavo'),
  IMPORT: verb('importuoti, importuoja, importavo'),
  // valyti / išvalyti — clear (a list, a field).
  CLEAR: verb('valyti, valo, valė', 'išvalyti, išvalo, išvalė'),
  // šalinti / pašalinti — remove (the UI's *Pašalinti*).
  REMOVE: verb('šalinti, šalina, šalino', 'pašalinti, pašalina, pašalino'),
  // trinti / ištrinti — erase for good (the UI's *Ištrinti*).
  DELETE: verb(primary('trinti, trina, trynė'), primary('ištrinti, ištrina, ištrynė')),
  // derinti / suderinti — coordinate, harmonise. (verify: *koordinuoti*)
  COORDINATE: verb('derinti, derina, derino', 'suderinti, suderina, suderino'),
  // tvarkyti / sutvarkyti — put in order.
  TIDY_UP: verb('tvarkyti, tvarko, tvarkė', 'sutvarkyti, sutvarko, sutvarkė'),
  // tankinti / sutankinti — compact, condense. (verify)
  COMPACT: verb('tankinti, tankina, tankino', 'sutankinti, sutankina, sutankino'),
  // plėsti / išplėsti — enlarge, extend.
  EXPAND: verb(primary('plėsti, plečia, plėtė'), primary('išplėsti, išplečia, išplėtė')),
  SHRINK: verb('mažinti, mažina, mažino', 'sumažinti, sumažina, sumažino'),
  HIDE: verb(primary('slėpti, slepia, slėpė'), primary('paslėpti, paslepia, paslėpė')),
  // pradėti + accusative or a bare infinitive (*pradeda valgyti*); serves both aspects, unpaired.
  START: verb('pradėti, pradeda, pradėjo'),
  // atšaukti — call off (the UI's *Atšaukti*); unpaired.
  CANCEL: verb(primary('atšaukti, atšaukia, atšaukė')),
  // anuliuoti — undo (the UI's *Anuliuoti*); CANCEL is *atšaukti*. (verify)
  UNDO: verb('anuliuoti, anuliuoja, anuliavo'),
  // perdaryti — redo (*do again*); unpaired. RETRY is *kartoti*. (verify)
  REDO: verb('perdaryti, perdaro, perdarė'),
  // atkurti — restore (the UI's *Atkurti*); *atstatyti* in this sense is discouraged. Unpaired.
  RESTORE: verb(primary('atkurti, atkuria, atkūrė')),
  // atidaryti / uždaryti — each serves both aspects, unpaired.
  OPEN: verb('atidaryti, atidaro, atidarė'),
  CLOSE: verb('uždaryti, uždaro, uždarė'),
  // kartoti / pakartoti — repeat, retry. (verify)
  RETRY: verb('kartoti, kartoja, kartojo', 'pakartoti, pakartoja, pakartojo'),
  // naudoti / panaudoti + accusative (*naudoti peilį*).
  USE: verb('naudoti, naudoja, naudojo', 'panaudoti, panaudoja, panaudojo'),
  // išleisti (pinigus) / praleisti (laiką), each unpaired; plain *leisti* is LET. (verify)
  SPEND_MONEY: verb(primary('išleisti, išleidžia, išleido')),
  SPEND_TIME: verb(primary('praleisti, praleidžia, praleido')),
  COPY: verb('kopijuoti, kopijuoja, kopijavo', 'nukopijuoti, nukopijuoja, nukopijavo'),
  // perkelti — move (a thing, a file; the UI's *Perkelti*); unpaired (*kelti* is "lift").
  MOVE: verb(primary('perkelti, perkelia, perkėlė')),
  // apleisti + accusative — leave, go away from (*apleisti namus*). *palikti* is LEAVE_BEHIND, and
  // *išeiti iš* / *išvykti iš* are GO_OUT / LEAVE_DEPART's. (verify: *apleisti* leans to "abandon")
  LEAVE: verb(primary('apleisti, apleidžia, apleido')),
  // masteliuoti — scale, resize (software); *keisti dydį* is two words. (verify)
  RESIZE: verb('masteliuoti, masteliuoja, masteliavo'),
  // vilkti / nuvilkti — drag (the UI's *vilkti ir numesti*). (verify: the partner)
  DRAG: verb('vilkti, velka, vilko', 'nuvilkti, nuvelka, nuvilko'),
  // išjungti — switch off; unpaired (*jungti* is "connect").
  TURN_OFF: verb(primary('išjungti, išjungia, išjungė')),
};
