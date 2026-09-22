import { describe, expect, test } from 'vitest';
import type { LanguageCode, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C17: the Italian pronominal verb and the German reflexive verb, which the genus MOVE_ONESELF
// needs (it muoversi, de sich bewegen). French, Spanish and Portuguese already placed their clitic.
//
//   · Italian stores the clitic inside each finite form ("si muove"), as Spanish does; the engine strips
//     it (`nonReflexiveVerb`) and places the subject's own: before the finite verb and essere, attached
//     to the infinitive and the gerund, after a command.
//   · German stores the plain verb's finite forms and "sich" on the citation only; the clause puts the
//     agreeing pronoun in the Mittelfeld's unstressed-pronoun slot.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const moves = (subject = np('CAT'), verbPhrase: Partial<VerbPhrase> = {}, extra: Partial<PhrasePlan> = {}) =>
  sayAll(clause(subject, 'MOVE_ONESELF', { verbPhrase, ...extra }));
const command = (subject = np('SECOND_PERSON'), verbPhrase: Partial<VerbPhrase> = {}, extra: Partial<PhrasePlan> = {}) =>
  moves(subject, verbPhrase, { imperative: true, ...extra });
const WE = np('FIRST_PERSON', { number: 'plural' });

describe('MOVE_ONESELF (the intransitive move)', () => {
  test('present, in every language', () => {
    expect(moves()).toEqual({
      en: 'the cat moves.',
      it: 'il gatto si muove.',
      fr: 'le chat se déplace.',
      de: 'der Kater bewegt sich.',
      es: 'el gato se mueve.',
      ja: '猫は移動します。',
      pt: 'o gato se move.',
    });
  });

  test('negative, past and future', () => {
    expect(moves(np('CAT'), { negative: true })).toEqual({
      en: 'the cat does not move.',
      it: 'il gatto non si muove.',
      fr: 'le chat ne se déplace pas.',
      de: 'der Kater bewegt sich nicht.',
      es: 'el gato no se mueve.',
      ja: '猫は移動しません。',
      pt: 'o gato não se move.',
    });
    expect(moves(np('CAT'), { tense: 'past' })).toMatchObject({
      en: 'the cat moved.', it: 'il gatto si mosse.', fr: 'le chat se déplaça.', de: 'der Kater bewegte sich.',
      es: 'el gato se movió.', pt: 'o gato se moveu.',
    });
    expect(moves(np('CAT'), { tense: 'future' })).toMatchObject({
      it: 'il gatto si muoverà.', fr: 'le chat se déplacera.', de: 'der Kater wird sich bewegen.', es: 'el gato se moverá.',
    });
  });

  test('every person takes its own clitic or pronoun', () => {
    expect(moves(np('FIRST_PERSON'))).toMatchObject({ it: 'mi muovo.', de: 'ich bewege mich.', fr: 'je me déplace.' });
    expect(moves(np('SECOND_PERSON'))).toMatchObject({ it: 'ti muovi.', de: 'du bewegst dich.' });
    expect(moves(WE)).toMatchObject({ it: 'ci muoviamo.', de: 'wir bewegen uns.', fr: 'nous nous déplaçons.' });
    expect(moves(np('SECOND_PERSON', { number: 'plural' }))).toMatchObject({ it: 'vi muovete.', de: 'ihr bewegt euch.' });
    expect(moves(np('CAT', { number: 'plural' }))).toMatchObject({ it: 'i gatti si muovono.', de: 'die Kater bewegen sich.' });
  });
});

// The rows of the C17 probe table, each of which rendered wrong in Italian or German before.
describe('Italian pronominal and German reflexive verbs: the C17 probe', () => {
  test('resultative: essere with the clitic ahead / haben with the pronoun after', () => {
    expect(moves(np('CAT'), { aspect: 'resultative' })).toMatchObject({
      it: 'il gatto si è mosso.',
      de: 'der Kater hat sich bewegt.',
      fr: "le chat s'est déplacé.",
      es: 'el gato se ha movido.',
    });
    expect(moves(np('CAT', { gender: 'fem', number: 'plural' }), { aspect: 'resultative' })).toMatchObject({
      it: 'le gatte si sono mosse.',
      de: 'die Katzen haben sich bewegt.',
    });
    expect(moves(np('FIRST_PERSON'), { aspect: 'resultative', negative: true })).toMatchObject({
      it: 'non mi sono mosso.',
      de: 'ich habe mich nicht bewegt.',
    });
    // A frequency adverb goes between the auxiliary and the participle, after the pronoun in German.
    expect(moves(np('CAT'), { aspect: 'resultative', modifier: 'ALWAYS' })).toMatchObject({
      it: 'il gatto si è sempre mosso.',
      de: 'der Kater hat sich immer bewegt.',
    });
  });

  test('command, 2sg: the clitic attaches after / the pronoun follows the verb', () => {
    expect(command()).toMatchObject({ it: 'muoviti.', de: 'beweg dich.', fr: 'déplace-toi.', es: 'muévete.' });
    expect(command(np('SECOND_PERSON'), { negative: true })).toMatchObject({ it: 'non muoverti.', de: 'beweg dich nicht.' });
  });

  test('command, 1pl and 2pl', () => {
    expect(command(WE)).toMatchObject({ it: 'muoviamoci.', de: 'bewegen wir uns.' });
    expect(command(WE, { negative: true })).toMatchObject({ it: 'non muoviamoci.', de: 'bewegen wir uns nicht.' });
    expect(command(np('SECOND_PERSON', { number: 'plural' }), { modifier: 'FAST' })).toMatchObject({
      it: 'muovetevi velocemente.',
      de: 'bewegt euch schnell.',
    });
  });

  // Italian says an instruction with its tu command; German with the infinitive (C02).
  test('instruction', () => {
    expect(command(np('SECOND_PERSON'), {}, { imperativeRegister: 'instruction' })).toMatchObject({
      it: 'muoviti.',
      de: 'sich bewegen.',
    });
    expect(command(np('SECOND_PERSON'), { negative: true }, { imperativeRegister: 'instruction' })).toMatchObject({
      it: 'non muoverti.',
      de: 'sich nicht bewegen.',
    });
  });

  test('the cat that moves runs: the verb-final clause keeps the pronoun ahead of the verb', () => {
    const relative = (verbPhrase: Partial<VerbPhrase> = {}, extra = {}) =>
      sayAll(clause(np('CAT', { ...extra, relative: { verbPhrase: { verb: 'MOVE_ONESELF', ...verbPhrase } } }), 'RUN'));
    expect(relative()).toMatchObject({
      it: 'il gatto che si muove corre.',
      de: 'der Kater, der sich bewegt, läuft.',
    });
    expect(relative({ negative: true, modifier: 'FAST' })).toMatchObject({
      it: 'il gatto che non si muove velocemente corre.',
      de: 'der Kater, der sich nicht schnell bewegt, läuft.',
    });
    expect(relative({ aspect: 'resultative' }, { number: 'plural' })).toMatchObject({
      it: 'i gatti che si sono mossi corrono.',
      de: 'die Kater, die sich bewegt haben, laufen.',
    });
  });

  test('if the cat moved: the mood is derived from the plain verb', () => {
    expect(sayAll({ ...clause(np('DOG'), 'RUN'), condition: clause(np('CAT'), 'MOVE_ONESELF') })).toMatchObject({
      it: 'se il gatto si muovesse, il cane correrebbe.',
      de: 'wenn der Kater sich bewegen würde, würde der Hund laufen.',
      fr: 'si le chat se déplaçait, le chien courrait.',
    });
    expect(sayAll({ ...clause(WE, 'MOVE_ONESELF'), condition: clause(np('SECOND_PERSON'), 'MOVE_ONESELF') })).toMatchObject({
      it: 'se ti muovessi, ci muoveremmo.',
      de: 'wenn du dich bewegen würdest, würden wir uns bewegen.',
    });
  });

  test('the citation leads with the pronoun, ahead of the adverb and the complements', () => {
    const gloss = (verbPhrase: Partial<VerbPhrase>): PhrasePlan =>
      ({ subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'MOVE_ONESELF', ...verbPhrase }, infinitive: true });
    expect(sayAll(gloss({ modifier: 'FAST' }))).toMatchObject({ it: 'muoversi velocemente.', de: 'sich schnell bewegen.' });
    expect(sayAll(gloss({ negative: true }))).toMatchObject({ it: 'non muoversi.', de: 'sich nicht bewegen.' });
  });
});

describe('Italian pronominal verbs: the non-finite verb carries the clitic', () => {
  test('progressive and prospective attach it to the gerund and the infinitive', () => {
    expect(moves(np('FIRST_PERSON'), { aspect: 'progressive' }).it).toBe('sto muovendomi.');
    expect(moves(WE, { aspect: 'prospective' }).it).toBe('stiamo per muoverci.');
  });

  test('a modal governs the infinitive with the clitic attached, and essere in the perfect', () => {
    expect(moves(np('FIRST_PERSON'), { modals: ['MUST'] }).it).toBe('devo muovermi.');
    expect(moves(np('CAT', { gender: 'fem' }), { modals: ['MUST'], aspect: 'resultative' }).it).toBe('la gatta deve essersi mossa.');
    expect(moves(np('FIRST_PERSON'), { modals: ['MUST'], aspect: 'progressive' }).it).toBe('devo stare muovendomi.');
  });

  // Two si cannot stand together, so the reflexive one is "ci", and it climbs to the finite verb.
  test('under the impersonal si the clitic is ci', () => {
    expect(moves(np('GENERIC_PERSON')).it).toBe('ci si muove.');
    expect(moves(np('GENERIC_PERSON'), { aspect: 'resultative' }).it).toBe('ci si è mossi.');
    expect(moves(np('GENERIC_PERSON'), { modals: ['MUST'] }).it).toBe('ci si deve muovere.');
  });
});

describe('German reflexive verbs: the pronoun in every verb complex', () => {
  test('future, modal and progressive put it ahead of the adverb and gerade', () => {
    expect(moves(np('CAT'), { modals: ['MUST'], modifier: 'FAST' }).de).toBe('der Kater muss sich schnell bewegen.');
    expect(moves(np('FIRST_PERSON'), { modals: ['MUST'] }).de).toBe('ich muss mich bewegen.');
    expect(moves(np('CAT', { gender: 'fem' }), { modals: ['MUST'], aspect: 'resultative' }).de).toBe('die Katze muss sich bewegt haben.');
    expect(moves(np('CAT'), { aspect: 'progressive' }).de).toBe('der Kater bewegt sich gerade.');
    expect(moves(np('CAT'), { aspect: 'resultative', tense: 'future' }).de).toBe('der Kater wird sich bewegt haben.');
  });

  test('the prospective keeps it in the zu-infinitive group', () => {
    expect(moves(WE, { aspect: 'prospective' }).de).toBe('wir sind im Begriff, uns zu bewegen.');
    expect(moves(np('CAT'), { modals: ['MUST'], aspect: 'prospective' }).de).toBe('der Kater muss im Begriff sein, sich zu bewegen.');
  });

  test('the impersonal man takes sich', () => {
    expect(moves(np('GENERIC_PERSON')).de).toBe('man bewegt sich.');
  });
});

// CHANGE and CHANGE_ONESELF, the causative/inchoative pair, as START and BEGIN are. Japanese lexicalises
// it (変える / 変わる); German has no labile verb, so the inchoative is the reflexive "sich ändern".
describe('causative / inchoative: CHANGE and CHANGE_ONESELF', () => {
  const changes = (verbPhrase: Partial<VerbPhrase> = {}) => sayAll(clause(np('ACTION'), 'CHANGE_ONESELF', { verbPhrase }));

  test('the inchoative takes 変わる and sich ändern', () => {
    expect(changes()).toEqual({
      en: 'the action changes.',
      it: "l'azione cambia.",
      fr: "l'action change.",
      de: 'die Handlung ändert sich.',
      es: 'la acción cambia.',
      ja: '動作は変わります。',
      pt: 'a ação muda.',
    });
  });

  test('the causative keeps 変える and the plain ändern', () => {
    expect(sayAll(clause(np('MAN'), 'CHANGE', { directObject: np('ACTION') }))).toMatchObject({
      de: 'der Mann ändert die Handlung.',
      ja: '男は動作を変えます。',
    });
  });

  test('the perfect: essere in Italian, haben with the pronoun in German', () => {
    expect(changes({ aspect: 'resultative' })).toMatchObject({
      it: "l'azione è cambiata.",
      de: 'die Handlung hat sich geändert.',
      fr: "l'action a changé.",
    });
    expect(changes({ negative: true, tense: 'past' })).toMatchObject({
      de: 'die Handlung änderte sich nicht.',
      ja: '動作は変わりませんでした。',
    });
    expect(changes({ aspect: 'progressive' }).ja).toBe('動作は変わっています。');
  });

  test('command and citation', () => {
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'CHANGE_ONESELF'), imperative: true }).de).toBe('ändere dich.');
    expect(sayAll({ subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'CHANGE_ONESELF' }, infinitive: true }).de).toBe('sich ändern.');
  });
});

// The glosses the genus supports (C17's "Once unblocked" table), and JUMP, which C18 unblocked by
// giving the `direction` complement a relation of its own. COLLAPSE still wants two adverbs on one
// verb and COME a composable deixis, so both stay on the English literal (C18).
describe('C17 verb definitions (MOVE_ONESELF genus)', () => {
  test('RUN → to move fast', () => {
    expect(definitionAll('RUN')).toEqual({
      en: 'to move fast.',
      it: 'muoversi velocemente.',
      fr: 'se déplacer vite.',
      de: 'sich schnell bewegen.',
      es: 'moverse rápido.',
      ja: '速く移動する。',
      pt: 'mover-se rapidamente.',
    });
  });

  // The goal takes MOVE_ONESELF's own preposition in Italian and French, "verso" / "vers" (B34, B35).
  test('GO → to move from a place to another place', () => {
    expect(definitionAll('GO')).toEqual({
      en: 'to move from a place to another place.',
      it: 'muoversi da un luogo verso un altro luogo.',
      fr: "se déplacer d'un lieu vers un autre lieu.",
      de: 'sich von einem Ort zu einem anderen Ort bewegen.',
      es: 'moverse de un lugar a otro lugar.',
      ja: '場所から別の場所へ移動する。',
      pt: 'mover-se de um lugar a outro lugar.',
    });
  });

  // The differentia is where the motion ends up, not what it heads towards: a `direction` naming
  // the containment relation, which is "into" in English and the accusative in German (C18).
  test('JUMP → to move into the air', () => {
    expect(definitionAll('JUMP')).toEqual({
      en: 'to move into the air.',
      it: "muoversi nell'aria.",
      fr: "se déplacer dans l'air.",
      de: 'sich in die Luft bewegen.', // die, not der: the accusative of motion into
      es: 'moverse en el aire.',
      ja: '空気の中へ移動する。',
      pt: 'mover-se no ar.',
    });
  });

  // B34. "Down" is a place the motion ends at, the ground, which leaves the one adverb slot for
  // SUDDENLY. Italian and French say the goal with "verso" / "vers": after this verb, "al suolo" /
  // "au sol" say where the moving happens ("les oiseaux se déplacent au sol").
  test('COLLAPSE → to move to the ground suddenly', () => {
    expect(definitionAll('COLLAPSE')).toEqual({
      en: 'to move to the ground suddenly.',
      it: 'muoversi improvvisamente verso il suolo.',
      fr: 'se déplacer soudainement vers le sol.',
      de: 'sich plötzlich zum Boden bewegen.',
      es: 'moverse de repente al suelo.',
      ja: '地面へ突然移動する。',
      pt: 'mover-se de repente ao chão.',
    });
  });

  // B35. The deixis is a noun, the speaker, as the goal. Italian "muoversi dal parlante" would read as
  // leaving the speaker; the verb's "verso" makes it the goal.
  test('COME → to move to the speaker', () => {
    expect(definitionAll('COME')).toEqual({
      en: 'to move to the speaker.',
      it: 'muoversi verso il parlante.',
      fr: 'se déplacer vers le locuteur.',
      de: 'sich zum Sprecher bewegen.',
      es: 'moverse hacia el hablante.',
      ja: '話し手へ移動する。',
      pt: 'mover-se para o falante.',
    });
  });
});

// B34, B35. MOVE_ONESELF fixes its goal's preposition in its Italian and French lexemes
// (`direction_prep`): "verso" / "vers" for every plain goal, a place, a person or a land. GO keeps the
// goal words the goal's kind selects ("va alla casa", "va dal bambino", "va in Europa").
describe('MOVE_ONESELF: the goal takes the verb\'s own preposition in Italian and French', () => {
  const movesTo = (verb: string, goal: ReturnType<typeof np>) =>
    sayAll(clause(np('CAT'), verb, { complements: { direction: { phrase: goal } } }));

  test('a place, a person and a continent all go "verso" / "vers"', () => {
    expect(movesTo('MOVE_ONESELF', np('HOUSE'))).toEqual({
      en: 'the cat moves to the house.',
      it: 'il gatto si muove verso la casa.', // verso does not fuse with the article
      fr: 'le chat se déplace vers la maison.',
      de: 'der Kater bewegt sich zum Haus.',
      es: 'el gato se mueve a la casa.',
      ja: '猫は家へ移動します。',
      pt: 'o gato se move à casa.',
    });
    expect(movesTo('MOVE_ONESELF', np('CHILD'))).toMatchObject({
      it: 'il gatto si muove verso il bambino.', fr: "le chat se déplace vers l'enfant.",
    });
    expect(movesTo('MOVE_ONESELF', np('EUROPE'))).toMatchObject({
      it: "il gatto si muove verso l'Europa.", fr: "le chat se déplace vers l'Europe.", de: 'der Kater bewegt sich nach Europa.',
    });
    expect(movesTo('MOVE_ONESELF', np('HOUSE', { definiteness: 'indefinite' }))).toMatchObject({
      it: 'il gatto si muove verso una casa.', fr: 'le chat se déplace vers une maison.',
    });
  });

  test('a relation still names its own goal: "into the air"', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE_ONESELF', {
      complements: { direction: { phrase: np('AIR'), specifiers: [{ kind: 'path', value: 'in' }] } },
    }))).toMatchObject({ it: "il gatto si muove nell'aria.", fr: "le chat se déplace dans l'air." });
  });

  test('a relative clause on the goal takes it too: "vers laquelle", "verso la quale"', () => {
    const houseWhereTheCat = (verb: string) => sayAll({
      subject: { concept: 'HOUSE', relative: { headRole: 'direction', subject: np('CAT'), verbPhrase: { verb } } },
      verbPhrase: { verb: 'RUN' },
    });
    expect(houseWhereTheCat('MOVE_ONESELF')).toMatchObject({
      it: 'la casa verso la quale il gatto si muove corre.',
      fr: 'la maison vers laquelle le chat se déplace court.',
      de: 'das Haus, zu dem der Kater sich bewegt, läuft.',
    });
    expect(houseWhereTheCat('GO')).toMatchObject({
      it: 'la casa alla quale il gatto va corre.',
      fr: 'la maison à laquelle le chat va court.',
    });
  });

  test('regression guard: GO keeps the goal words its goal selects', () => {
    expect(movesTo('GO', np('HOUSE'))).toMatchObject({ it: 'il gatto va alla casa.', fr: 'le chat va à la maison.' });
    expect(movesTo('GO', np('CHILD'))).toMatchObject({ it: 'il gatto va dal bambino.', fr: "le chat va vers l'enfant." });
    expect(movesTo('GO', np('EUROPE'))).toMatchObject({ it: 'il gatto va in Europa.', fr: 'le chat va en Europe.' });
  });
});

// A151. Portuguese stores its clitic on the infinitive and the gerund ("mover-se", "movendo-se") and puts
// it on no auxiliary, so the non-finite verb keeps the 3rd-person "se" for every subject and the compound
// tenses lose it. Spanish fixed the same in A102 (`reflexiveNonfinite`) and A30.
describe('known bugs: Portuguese reflexive verb in a non-finite verb group', () => {
  test('the clitic on the gerund and the infinitive agrees with the subject', () => {
    expect(moves(np('FIRST_PERSON'), { aspect: 'progressive' }).pt).toBe('estou movendo-me.');
  });

  test('a modal governs the infinitive with the subject\'s clitic', () => {
    expect(moves(np('FIRST_PERSON'), { modals: ['MUST'] }).pt).toBe('devo mover-me.');
  });

  test('the pluperfect keeps the clitic', () => {
    expect(moves(np('CAT'), { aspect: 'resultative', tense: 'past' }).pt).toBe('o gato se tinha movido.');
  });

  // The generalisation: the clitic is the subject's wherever a non-finite form carries it, so it
  // follows every person, every aspect under a modal, and the future perfect; and it climbs to the
  // finite "ter" in the compound tenses, in a relative clause too.
  test('…in every person, aspect and compound tense', () => {
    expect(moves(np('FIRST_PERSON', { number: 'plural' }), { aspect: 'prospective' }).pt)
      .toBe('estamos prestes a mover-nos.');
    expect(moves(np('FIRST_PERSON'), { modals: ['MUST'], aspect: 'progressive' }).pt).toBe('devo estar movendo-me.');
    expect(moves(np('CAT'), { modals: ['MUST'], aspect: 'resultative' }).pt).toBe('o gato deve ter-se movido.');
    expect(moves(np('CAT'), { aspect: 'resultative', tense: 'future' }).pt).toBe('o gato se terá movido.');
    expect(moves(np('FIRST_PERSON'), { aspect: 'progressive', negative: true }).pt).toBe('não estou movendo-me.');
    expect(sayAll(clause(np('CAT', {
      relative: { verbPhrase: { verb: 'MOVE_ONESELF', aspect: 'resultative', tense: 'past' } },
    }), 'RUN')).pt).toBe('o gato que se tinha movido corre.');
  });

  test('regression guard: the finite tenses and the command are right', () => {
    expect(moves(np('FIRST_PERSON')).pt).toBe('me movo.');
    expect(moves(np('CAT'), { aspect: 'resultative' }).pt).toBe('o gato se moveu.');
    expect(command(WE).pt).toBe('movamo-nos.');
    // The 3rd person is what the stored forms already said, and is unchanged.
    expect(moves(np('CAT'), { modals: ['MUST'] }).pt).toBe('o gato deve mover-se.');
  });

  test('regression guard: a non-reflexive verb takes no clitic anywhere', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { aspect: 'resultative', tense: 'past' } })).pt)
      .toBe('o gato tinha comido.');
  });
});

// A152. The impersonal "se" of Spanish and Portuguese meets the reflexive "se" of the verb: "se se
// mueve". Italian says "ci si muove"; Spanish takes "uno" for the generic subject of a reflexive verb.
describe('known bugs: Spanish and Portuguese impersonal subject of a reflexive verb', () => {
  test('Spanish takes uno', () => {
    expect(moves(np('GENERIC_PERSON')).es).toBe('uno se mueve.');
  });

  test('Portuguese does not double se', () => {
    expect(moves(np('GENERIC_PERSON')).pt).not.toMatch(/\bse se\b/);
  });

  // Portuguese has no single standard form. The engine takes the colloquial "a gente", which its
  // "você" paradigm (A108) already leans towards; a written text would say "a pessoa".
  test('Portuguese says "a gente"', () => {
    expect(moves(np('GENERIC_PERSON')).pt).toBe('a gente se move.');
  });

  // The generalisation: the word is the subject, so it stands ahead of the negator, the fronted
  // "nunca" and the modal chain, and it holds for BECOME as it does for MOVE_ONESELF.
  test('…and the subject word leads the negation, the fronted "nunca" and a modal', () => {
    expect(moves(np('GENERIC_PERSON'), { negative: true })).toMatchObject({
      es: 'uno no se mueve.', pt: 'a gente não se move.',
    });
    expect(moves(np('GENERIC_PERSON'), { modifier: 'NEVER' })).toMatchObject({
      es: 'uno nunca se mueve.', pt: 'a gente nunca se move.',
    });
    expect(moves(np('GENERIC_PERSON'), { modals: ['MUST'] })).toMatchObject({
      es: 'uno debe moverse.', pt: 'a gente deve mover-se.',
    });
    expect(moves(np('GENERIC_PERSON'), { aspect: 'resultative' })).toMatchObject({
      es: 'uno se ha movido.', pt: 'a gente se moveu.',
    });
    expect(sayAll(clause(np('GENERIC_PERSON'), 'BECOME', { complements: { predicative: { phrase: np('HAPPY') } } })))
      .toMatchObject({ es: 'uno se vuelve feliz.', pt: 'a gente se torna feliz.' });
  });

  test('regression guard: French and Italian are right', () => {
    expect(moves(np('GENERIC_PERSON'))).toMatchObject({ fr: 'on se déplace.', it: 'ci si muove.' });
  });

  // A non-reflexive verb has no clash, so the impersonal clitic stays — in a clause and in a
  // relative one.
  test('regression guard: a non-reflexive verb keeps the impersonal clitic', () => {
    expect(sayAll(clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('MOUSE') })))
      .toMatchObject({ es: 'se come el ratón.', pt: 'se come o rato.' });
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('HOUSE', { relative: { headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'SEE' } } }),
    }))).toMatchObject({ es: 'el gato ve la casa que se ve.', pt: 'o gato vê a casa que se vê.' });
  });
});
