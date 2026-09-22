import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// B62's seven P09 words — DO, WORK_LABOUR, WORK_NOUN, PLAY_GAME, PLAY_INSTRUMENT, TRY and NEED —
// their paradigms, the six glosses the ticket ships, and the engine change NEED's multiword Romance
// lemma needed (avere bisogno / avoir besoin). Pinned here rather than in the shared exhaustive
// tables (verb.test.ts's Italian resultative, adjectives.test.ts's EVERY_ADJECTIVE), because six
// P09 lanes seeded words the same day and would collide on those rows.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });
const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });
const seed = (id: string) => concepts.find((c) => c.id === id);

// ── The glosses ───────────────────────────────────────────────────────

describe('the six glosses B62 ships', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // START's causative shape with HAPPEN for BEGIN. No Romance tooltip says fare / faire / hacer /
    // fazer, which is the trap the DO ruling set: the causative genus is indurre / induire.
    ['DO', {
      en: 'to cause an action to happen.', it: "indurre un'azione a succedere.", fr: 'induire une action à arriver.',
      de: 'eine Handlung veranlassen, zu geschehen.', es: 'inducir una acción a ocurrir.', ja: '動作が起こるようにする。',
      pt: 'induzir uma ação a acontecer.',
    }],
    // A purpose clause, as SAVE and EXCHANGE stand on: what the act is for.
    ['WORK_LABOUR', {
      en: 'to act to acquire money.', it: 'agire per acquisire denaro.', fr: "agir pour acquérir de l'argent.",
      de: 'handeln, um Geld zu erwerben.', es: 'actuar para adquirir dinero.', ja: 'お金を取得するために行動する。',
      pt: 'agir para adquirir dinheiro.',
    }],
    // The same ACQUIRE + MONEY from the noun's end, on EYE's instrument gap. Neither names the other.
    ['WORK_NOUN', {
      en: 'an action with which one acquires money.', it: "un'azione con la quale si acquisisce denaro.",
      fr: "une action avec laquelle on acquiert de l'argent.", de: 'eine Handlung, mit der man Geld erwirbt.',
      es: 'una acción con la que se adquiere dinero.', ja: 'お金を取得する動作。', pt: 'uma ação com a qual se adquire dinheiro.',
    }],
    ['PLAY_GAME', {
      en: 'to act to feel joy.', it: 'agire per provare gioia.', fr: 'agir pour éprouver de la joie.',
      de: 'handeln, um Freude zu fühlen.', es: 'actuar para sentir alegría.', ja: '喜びを感じるために行動する。',
      pt: 'agir para sentir alegria.',
    }],
    // CRY_OUT's genus PRODUCE with an instrument where CRY_OUT has loudness.
    ['PLAY_INSTRUMENT', {
      en: 'to produce sounds with an object.', it: 'produrre suoni con un oggetto.', fr: 'produire des sons avec un objet.',
      de: 'Geräusche mit einem Gegenstand erzeugen.', es: 'producir sonidos con un objeto.', ja: '物体で音を出す。',
      pt: 'produzir sons com um objeto.',
    }],
    // MUST's own OBLIGED frame: needing is having to have (Longman).
    ['NEED', {
      en: 'to be obliged to have objects.', it: 'essere obbligato ad avere oggetti.', fr: "être obligé d'avoir des objets.",
      de: 'verpflichtet sein, Gegenstände zu haben.', es: 'estar obligado a tener objetos.', ja: '物体を持つことが義務的である。',
      pt: 'estar obrigado a ter objetos.',
    }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });
});

describe('TRY is literal by design, and RETRY sits under it', () => {
  test('TRY ships no definition plan', () => {
    expect(seed('TRY')?.definition).toBeUndefined();
    // A lexical verb, not a modal: P09's `modal: true` loses the French link and stacks a bare
    // German infinitive (see B62's lead table).
    expect(seed('TRY')?.modal).toBeUndefined();
    expect(seed('TRY')?.transitivity).toBe('transitive');
  });

  test("RETRY hangs under TRY and keeps its own gloss, 'to start again'", () => {
    expect(seed('RETRY')?.isA).toBe('TRY');
    expect(definitionAll('RETRY')).toEqual({
      en: 'to start again.', it: 'iniziare di nuovo.', fr: 'commencer de nouveau.', de: 'erneut beginnen.',
      es: 'empezar de nuevo.', ja: 'もう一度始める。', pt: 'começar de novo.',
    });
  });
});

// ── The words ─────────────────────────────────────────────────────────

describe('WORK_NOUN: labour, a mass noun in every language', () => {
  test('the definite, the bare and the partitive', () => {
    expect(said('WORK_NOUN', { definiteness: 'definite' })).toEqual({
      en: 'the work.', it: 'il lavoro.', fr: 'le travail.', de: 'die Arbeit.', es: 'el trabajo.', ja: '仕事。', pt: 'o trabalho.',
    });
    // Uncountable: the indefinite is the bare noun, and French its partitive article.
    expect(said('WORK_NOUN', { definiteness: 'indefinite' })).toEqual({
      en: 'work.', it: 'lavoro.', fr: 'du travail.', de: 'Arbeit.', es: 'trabajo.', ja: '仕事。', pt: 'trabalho.',
    });
    // A mass noun does not pluralise: the plural renders as the singular.
    expect(said('WORK_NOUN', { definiteness: 'definite', number: 'plural' })).toEqual(said('WORK_NOUN', { definiteness: 'definite' }));
  });

  test('the gender agrees: die gute Arbeit, il buon lavoro', () => {
    expect(said('WORK_NOUN', { definiteness: 'definite', adjectives: ['GOOD'] })).toEqual({
      en: 'the good work.', it: 'il buon lavoro.', fr: 'le bon travail.', de: 'die gute Arbeit.', es: 'el trabajo bueno.',
      ja: '良い仕事。', pt: 'o trabalho bom.',
    });
    expect(sayAll(clause(the('WORK_NOUN'), 'BE', { complements: { predicative: { phrase: np('NEW') } } }))).toEqual({
      en: 'the work is new.', it: 'il lavoro è nuovo.', fr: 'le travail est nouveau.', de: 'die Arbeit ist neu.',
      es: 'el trabajo es nuevo.', ja: '仕事は新しいです。', pt: 'o trabalho é novo.',
    });
  });

  test('WORK_NOUN is an action, and the two work words are apart', () => {
    expect(seed('WORK_NOUN')?.countable).toBe(false);
    // The seeded WORK is the machine sense (funzionare); WORK_LABOUR is the person's.
    expect([seed('WORK')?.forms['it']?.['base'], seed('WORK_LABOUR')?.forms['it']?.['base']]).toEqual(['funzionare', 'lavorare']);
  });
});

describe('the verbs: present, simple past, resultative, future and negation', () => {
  const work = the('WORK_NOUN');
  const action = np('ACTION', { definiteness: 'indefinite' });

  test('DO takes MAKE\'s Romance verb, and its own in en/de/ja', () => {
    expect(sayAll(clause(the('WOMAN'), 'DO', { directObject: the('ACTION') }))).toEqual({
      en: 'the woman does the action.', it: "la donna fa l'azione.", fr: "la femme fait l'action.",
      de: 'die Frau tut die Handlung.', es: 'la mujer hace la acción.', ja: '女は動作をします。', pt: 'a mulher faz a ação.',
    });
    expect(sayAll(clause(the('WOMAN'), 'DO', { directObject: the('ACTION'), verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'the woman did the action.', it: "la donna fece l'azione.", fr: "la femme fit l'action.",
      de: 'die Frau tat die Handlung.', es: 'la mujer hizo la acción.', ja: '女は動作をしました。', pt: 'a mulher fez a ação.',
    });
    expect(sayAll(clause(the('MAN', { number: 'plural' }), 'DO', { directObject: the('ACTION'), verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the men will do the action.', it: "gli uomini faranno l'azione.", fr: "les hommes feront l'action.",
      de: 'die Männer werden die Handlung tun.', es: 'los hombres harán la acción.', ja: '男は動作をします。',
      pt: 'os homens farão a ação.',
    });
    expect(sayAll(clause(the('MAN'), 'DO', { directObject: the('ACTION'), verbPhrase: { negative: true } }))).toEqual({
      en: 'the man does not do the action.', it: "l'uomo non fa l'azione.", fr: "l'homme ne fait pas l'action.",
      de: 'der Mann tut die Handlung nicht.', es: 'el hombre no hace la acción.', ja: '男は動作をしません。',
      pt: 'o homem não faz a ação.',
    });
    // The two are one verb in the Romance four and two everywhere else — "makes an action" is
    // Japanese 作る, "does an action" is する.
    expect(sayAll(clause(the('MAN'), 'MAKE', { directObject: action }))).toMatchObject({
      it: "l'uomo fa un'azione.", de: 'der Mann macht eine Handlung.', ja: '男は動作を作ります。',
    });
    expect(sayAll(clause(the('MAN'), 'DO', { directObject: action }))).toMatchObject({
      it: "l'uomo fa un'azione.", de: 'der Mann tut eine Handlung.', ja: '男は動作をします。',
    });
  });

  test("DO's command is fare's and hacer's, not their 3rd person", () => {
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'DO', { directObject: work }), imperative: true })).toEqual({
      en: 'do the work.', it: "fa' il lavoro.", fr: 'fais le travail.', de: 'tu die Arbeit.', es: 'haz el trabajo.',
      ja: '仕事をしてください。', pt: 'faça o trabalho.',
    });
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'DO', { directObject: work, verbPhrase: { negative: true } }), imperative: true })).toEqual({
      en: 'do not do the work.', it: 'non fare il lavoro.', fr: 'ne fais pas le travail.', de: 'tu die Arbeit nicht.',
      es: 'no hagas el trabajo.', ja: '仕事をするな。', pt: 'não faça o trabalho.',
    });
  });

  test('WORK_LABOUR, the person who works', () => {
    expect(sayAll(clause(the('WOMAN'), 'WORK_LABOUR'))).toEqual({
      en: 'the woman works.', it: 'la donna lavora.', fr: 'la femme travaille.', de: 'die Frau arbeitet.',
      es: 'la mujer trabaja.', ja: '女は働きます。', pt: 'a mulher trabalha.',
    });
    expect(sayAll(clause(the('WOMAN'), 'WORK_LABOUR', { verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'the woman worked.', it: 'la donna lavorò.', fr: 'la femme travailla.', de: 'die Frau arbeitete.',
      es: 'la mujer trabajó.', ja: '女は働きました。', pt: 'a mulher trabalhou.',
    });
    expect(sayAll(clause(the('MAN', { number: 'plural' }), 'WORK_LABOUR', { verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the men will work.', it: 'gli uomini lavoreranno.', fr: 'les hommes travailleront.',
      de: 'die Männer werden arbeiten.', es: 'los hombres trabajarán.', ja: '男は働きます。', pt: 'os homens trabalharão.',
    });
    expect(sayAll(clause(the('MAN'), 'WORK_LABOUR', { verbPhrase: { negative: true } }))).toEqual({
      en: 'the man does not work.', it: "l'uomo non lavora.", fr: "l'homme ne travaille pas.", de: 'der Mann arbeitet nicht.',
      es: 'el hombre no trabaja.', ja: '男は働きません。', pt: 'o homem não trabalha.',
    });
    // German arbeiten keeps the -e of a stem in -t: du arbeitest, the command "arbeite".
    expect(sayAll(clause(np('SECOND_PERSON'), 'WORK_LABOUR'))).toMatchObject({ de: 'du arbeitest.', it: 'lavori.' });
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'WORK_LABOUR'), imperative: true })).toMatchObject({ de: 'arbeite.', fr: 'travaille.' });
    expect(sayAll(clause(the('MAN'), 'WORK_LABOUR', { complements: { locative: { phrase: the('HOUSE') } } }))).toMatchObject({
      en: 'the man works in the house.', ja: '男は家で働きます。', pt: 'o homem trabalha na casa.',
    });
  });

  test('PLAY_GAME, the game', () => {
    expect(sayAll(clause(the('WOMAN'), 'PLAY_GAME'))).toEqual({
      en: 'the woman plays.', it: 'la donna gioca.', fr: 'la femme joue.', de: 'die Frau spielt.', es: 'la mujer juega.',
      ja: '女は遊びます。', pt: 'a mulher joga.',
    });
    expect(sayAll(clause(the('WOMAN'), 'PLAY_GAME', { verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'the woman played.', it: 'la donna giocò.', fr: 'la femme joua.', de: 'die Frau spielte.', es: 'la mujer jugó.',
      ja: '女は遊びました。', pt: 'a mulher jogou.',
    });
    // The velar stems: giochi / giocheranno, juegas but jugamos, joguei.
    expect(sayAll(clause(np('SECOND_PERSON'), 'PLAY_GAME'))).toMatchObject({ it: 'giochi.', es: 'juegas.' });
    expect(sayAll(clause(np('FIRST_PERSON', { number: 'plural' }), 'PLAY_GAME'))).toMatchObject({ it: 'giochiamo.', es: 'jugamos.' });
    expect(sayAll(clause(the('MAN', { number: 'plural' }), 'PLAY_GAME', { verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the men will play.', it: 'gli uomini giocheranno.', fr: 'les hommes joueront.', de: 'die Männer werden spielen.',
      es: 'los hombres jugarán.', ja: '男は遊びます。', pt: 'os homens jogarão.',
    });
    expect(sayAll(clause(the('MAN'), 'PLAY_GAME', { verbPhrase: { negative: true } }))).toEqual({
      en: 'the man does not play.', it: "l'uomo non gioca.", fr: "l'homme ne joue pas.", de: 'der Mann spielt nicht.',
      es: 'el hombre no juega.', ja: '男は遊びません。', pt: 'o homem não joga.',
    });
  });

  test('PLAY_INSTRUMENT, the music — and French plays "de" its instrument', () => {
    expect(sayAll(clause(the('WOMAN'), 'PLAY_INSTRUMENT', { directObject: the('OBJECT_THING') }))).toEqual({
      en: 'the woman plays the object.', it: "la donna suona l'oggetto.", fr: "la femme joue de l'objet.",
      de: 'die Frau spielt den Gegenstand.', es: 'la mujer toca el objeto.', ja: '女は物体を演奏します。',
      pt: 'a mulher toca o objeto.',
    });
    expect(sayAll(clause(the('WOMAN'), 'PLAY_INSTRUMENT', { directObject: the('OBJECT_THING'), verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'the woman played the object.', it: "la donna suonò l'oggetto.", fr: "la femme joua de l'objet.",
      de: 'die Frau spielte den Gegenstand.', es: 'la mujer tocó el objeto.', ja: '女は物体を演奏しました。',
      pt: 'a mulher tocou o objeto.',
    });
    expect(sayAll(clause(the('MAN', { number: 'plural' }), 'PLAY_INSTRUMENT', { directObject: the('OBJECT_THING'), verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the men will play the object.', it: "gli uomini suoneranno l'oggetto.", fr: "les hommes joueront de l'objet.",
      de: 'die Männer werden den Gegenstand spielen.', es: 'los hombres tocarán el objeto.', ja: '男は物体を演奏します。',
      pt: 'os homens tocarão o objeto.',
    });
    // The preposition is the lexeme's own (`object_prep`), so the negation wraps the verb and not it.
    expect(sayAll(clause(the('MAN'), 'PLAY_INSTRUMENT', { directObject: the('OBJECT_THING'), verbPhrase: { negative: true } }))).toEqual({
      en: 'the man does not play the object.', it: "l'uomo non suona l'oggetto.", fr: "l'homme ne joue pas de l'objet.",
      de: 'der Mann spielt den Gegenstand nicht.', es: 'el hombre no toca el objeto.', ja: '男は物体を演奏しません。',
      pt: 'o homem não toca o objeto.',
    });
    expect(sayAll(clause(the('WOMAN'), 'PLAY_INSTRUMENT', { directObject: np('OBJECT_THING', { definiteness: 'indefinite' }) })))
      .toMatchObject({ fr: "la femme joue d'un objet.", it: 'la donna suona un oggetto.' });
  });

  // The Italian resultative with a feminine subject — the check verb.test.ts's IT table makes for
  // every other verb (auxiliary and participle), kept here so the six P09 lanes do not collide.
  test.each<[string, string]>([
    ['DO', 'la gatta ha fatto.'],
    ['NEED', 'la gatta ha avuto bisogno.'],
    ['PLAY_GAME', 'la gatta ha giocato.'],
    ['PLAY_INSTRUMENT', 'la gatta ha suonato.'],
    ['TRY', 'la gatta ha provato.'],
    ['WORK_LABOUR', 'la gatta ha lavorato.'],
  ])('the Italian resultative, feminine subject: %s → %s', (verb, italian) => {
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), verb, { verbPhrase: { aspect: 'resultative' } })).it).toBe(italian);
  });
});

// ── NEED, the first multiword Romance lemma ───────────────────────────

describe('NEED: one lexical verb, with a multiword Italian and French lemma', () => {
  const food = the('FOOD');
  const needs = (verbPhrase: Record<string, unknown> = {}, extra: Record<string, unknown> = {}) =>
    sayAll(clause(the('MAN'), 'NEED', { directObject: food, verbPhrase, ...extra } as never));

  test('the object takes the lemma\'s own preposition: di, de', () => {
    expect(sayAll(clause(the('MAN'), 'NEED', { directObject: np('WATER', { definiteness: 'bare' }) }))).toEqual({
      en: 'the man needs water.', it: "l'uomo ha bisogno di acqua.", fr: "l'homme a besoin d'eau.",
      de: 'der Mann braucht Wasser.', es: 'el hombre necesita agua.', ja: '男は水を必要としています。',
      pt: 'o homem precisa de água.',
    });
    expect(needs()).toEqual({
      en: 'the man needs the food.', it: "l'uomo ha bisogno del cibo.", fr: "l'homme a besoin de la nourriture.",
      de: 'der Mann braucht das Essen.', es: 'el hombre necesita la comida.', ja: '男は食べ物を必要としています。',
      pt: 'o homem precisa da comida.',
    });
  });

  // The fix: the French negator wrapped the whole two-word finite ("n'a besoin pas de la
  // nourriture"). It wraps its verb now, as it does an auxiliary, and the noun follows.
  test('the French negation wraps the verb, not the verb and its noun', () => {
    expect(needs({ negative: true })).toEqual({
      en: 'the man does not need the food.', it: "l'uomo non ha bisogno del cibo.", fr: "l'homme n'a pas besoin de la nourriture.",
      de: 'der Mann braucht das Essen nicht.', es: 'el hombre no necesita la comida.', ja: '男は食べ物を必要としていません。',
      pt: 'o homem não precisa da comida.',
    });
    expect(needs({ tense: 'future', negative: true })).toEqual({
      en: 'the man will not need the food.', it: "l'uomo non avrà bisogno del cibo.", fr: "l'homme n'aura pas besoin de la nourriture.",
      de: 'der Mann wird das Essen nicht brauchen.', es: 'el hombre no necesitará la comida.', ja: '男は食べ物を必要としていません。',
      pt: 'o homem não precisará da comida.',
    });
    // A relative clause and a question go through the same predicate.
    expect(sayAll({ subject: np('FOOD', { definiteness: 'definite', relative: { headRole: 'directObject', subject: the('MAN'), verbPhrase: { verb: 'NEED', negative: true } } }) })).toEqual({
      en: 'the food that the man does not need.', it: "il cibo del quale l'uomo non ha bisogno.",
      fr: "la nourriture dont l'homme n'a pas besoin.", de: 'das Essen, das der Mann nicht braucht.',
      es: 'la comida que el hombre no necesita.', ja: '男が必要としない食べ物。', pt: 'a comida da qual o homem não precisa.',
    });
    expect(needs({ negative: true }, { interrogative: true })).toMatchObject({
      fr: "est-ce que l'homme n'a pas besoin de la nourriture\u00a0?", it: "l'uomo non ha bisogno del cibo?",
    });
  });

  test('the resultative and the negated resultative keep the noun on the participle', () => {
    expect(sayAll(clause(the('WOMAN'), 'NEED', { directObject: food, verbPhrase: { aspect: 'resultative' } }))).toEqual({
      en: 'the woman has needed the food.', it: 'la donna ha avuto bisogno del cibo.', fr: 'la femme a eu besoin de la nourriture.',
      de: 'die Frau hat das Essen gebraucht.', es: 'la mujer ha necesitado la comida.', ja: '女は食べ物を必要としていました。',
      pt: 'a mulher precisou da comida.',
    });
    expect(sayAll(clause(the('WOMAN'), 'NEED', { directObject: food, verbPhrase: { aspect: 'resultative', negative: true } }))).toEqual({
      en: 'the woman has not needed the food.', it: 'la donna non ha avuto bisogno del cibo.',
      fr: "la femme n'a pas eu besoin de la nourriture.", de: 'die Frau hat das Essen nicht gebraucht.',
      es: 'la mujer no ha necesitado la comida.', ja: '女は食べ物を必要としていません。', pt: 'a mulher não precisou da comida.',
    });
  });

  // A state (A130): the Romance past is the imperfect, and it is derived on the verb alone —
  // "aveva bisogno", not the noun-inflecting "avere bisognova" the rule gave before mood.ts split it.
  test('the past of the state is the imperfect, on the verb and not on its noun', () => {
    expect(needs({ tense: 'past' })).toEqual({
      en: 'the man needed the food.', it: "l'uomo aveva bisogno del cibo.", fr: "l'homme avait besoin de la nourriture.",
      de: 'der Mann brauchte das Essen.', es: 'el hombre necesitaba la comida.', ja: '男は食べ物を必要としていました。',
      pt: 'o homem precisava da comida.',
    });
    expect(needs({ tense: 'past', negative: true })).toMatchObject({
      it: "l'uomo non aveva bisogno del cibo.", fr: "l'homme n'avait pas besoin de la nourriture.",
    });
    expect(sayAll(clause(the('WOMAN', { number: 'plural' }), 'NEED', { directObject: food, verbPhrase: { tense: 'past' } })))
      .toMatchObject({ it: 'le donne avevano bisogno del cibo.', fr: 'les femmes avaient besoin de la nourriture.' });
  });

  test('the conditional and the imperfect subjunctive are derived on the verb too', () => {
    expect(sayAll({ ...clause(the('MAN'), 'NEED', { directObject: food }), condition: clause(the('CAT'), 'EAT') })).toEqual({
      en: 'if the cat ate, the man would need the food.', it: "se il gatto mangiasse, l'uomo avrebbe bisogno del cibo.",
      fr: "si le chat mangeait, l'homme aurait besoin de la nourriture.",
      de: 'wenn der Kater fressen würde, würde der Mann das Essen brauchen.',
      es: 'si el gato comiera, el hombre necesitaría la comida.', ja: 'もし猫が食べたら、男は食べ物を必要としています。',
      pt: 'se o gato comesse, o homem precisaria da comida.',
    });
    expect(sayAll({ ...clause(the('CAT'), 'EAT'), condition: clause(the('MAN'), 'NEED', { directObject: food }) })).toMatchObject({
      it: "se l'uomo avesse bisogno del cibo, il gatto mangerebbe.",
      fr: "si l'homme avait besoin de la nourriture, le chat mangerait.",
    });
  });

  test('a command takes avere / avoir\'s own imperative, and keeps the noun', () => {
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'NEED', { directObject: food }), imperative: true })).toEqual({
      en: 'need the food.', it: 'abbi bisogno del cibo.', fr: 'aie besoin de la nourriture.', de: 'brauch das Essen.',
      es: 'necesita la comida.', ja: '食べ物を必要としてください。', pt: 'precise da comida.',
    });
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'NEED', { directObject: food, verbPhrase: { negative: true } }), imperative: true })).toEqual({
      en: 'do not need the food.', it: 'non avere bisogno del cibo.', fr: "n'aie pas besoin de la nourriture.",
      de: 'brauch das Essen nicht.', es: 'no necesites la comida.', ja: '食べ物を必要とするな。', pt: 'não precise da comida.',
    });
    expect(sayAll({ ...clause(np('SECOND_PERSON', { number: 'plural' }), 'NEED', { directObject: food, verbPhrase: { negative: true } }), imperative: true }))
      .toMatchObject({ it: 'non abbiate bisogno del cibo.', fr: "n'ayez pas besoin de la nourriture." });
  });

  // A French frequency or short adverb sits between a finite verb and a non-finite one ("n'a jamais
  // été", "a bien mangé"), so it sits between the verb and its noun.
  test('a French frequency adverb sits between the verb and its noun', () => {
    expect(needs({ modifier: 'NEVER' })).toMatchObject({
      en: 'the man never needs the food.', fr: "l'homme n'a jamais besoin de la nourriture.",
    });
    expect(needs({ modifier: 'ALWAYS' })).toMatchObject({ fr: "l'homme a toujours besoin de la nourriture." });
    expect(needs({ modifier: 'ALWAYS', negative: true })).toMatchObject({ fr: "l'homme n'a pas toujours besoin de la nourriture." });
    // In a compound tense it is between the auxiliary and the participle, as for any verb.
    expect(needs({ modifier: 'NEVER', aspect: 'resultative' })).toMatchObject({
      fr: "l'homme n'a jamais eu besoin de la nourriture.", it: "l'uomo non ha mai avuto bisogno del cibo.",
    });
  });

  test('every person of the two multiword lemmas', () => {
    const persons: [Partial<NounPhrase>, string, string][] = [
      [np('FIRST_PERSON'), 'ho bisogno del cibo.', 'ai besoin de la nourriture.'],
      [np('SECOND_PERSON'), 'hai bisogno del cibo.', 'as besoin de la nourriture.'],
      [the('MAN'), "l'uomo ha bisogno del cibo.", "l'homme a besoin de la nourriture."],
      [np('FIRST_PERSON', { number: 'plural' }), 'abbiamo bisogno del cibo.', 'avons besoin de la nourriture.'],
      [np('SECOND_PERSON', { number: 'plural' }), 'avete bisogno del cibo.', 'avez besoin de la nourriture.'],
      [the('MAN', { number: 'plural' }), 'gli uomini hanno bisogno del cibo.', 'les hommes ont besoin de la nourriture.'],
    ];
    for (const [subject, italian, french] of persons) {
      const rendered = sayAll(clause(subject as NounPhrase, 'NEED', { directObject: food }));
      expect(rendered.it).toBe(italian);
      // The French subject pronouns are said, and "je" elides before a vowel: "j'ai besoin".
      expect(rendered.fr.endsWith(french)).toBe(true);
    }
  });

  test('NEED governs an infinitive the way DESIRE does, with the link its lexeme names', () => {
    expect(sayAll(clause(the('MAN'), 'NEED', { infinitiveComplement: { verbPhrase: { verb: 'RUN' } } }))).toEqual({
      en: 'the man needs to run.', it: "l'uomo ha bisogno di correre.", fr: "l'homme a besoin de courir.",
      // German brauchen takes a zu-clause under negation or "nur"; the positive "needs to" is "muss
      // laufen". The reading is B62's, recorded and accepted.
      de: 'der Mann braucht, zu laufen.', es: 'el hombre necesita correr.', ja: '男は走ることを必要としています。',
      pt: 'o homem precisa correr.',
    });
    expect(sayAll(clause(the('MAN'), 'NEED', { infinitiveComplement: { verbPhrase: { verb: 'RUN' } }, verbPhrase: { negative: true } })))
      .toMatchObject({ fr: "l'homme n'a pas besoin de courir.", it: "l'uomo non ha bisogno di correre." });
    expect(seed('NEED')?.modal).toBeUndefined();
  });

  test('Japanese says the state with 〜ている', () => {
    expect(needs().ja).toBe('男は食べ物を必要としています。');
    expect(needs({ tense: 'past' }).ja).toBe('男は食べ物を必要としていました。');
    expect(needs({ negative: true }).ja).toBe('男は食べ物を必要としていません。');
  });
});

describe('TRY: a lexical verb that takes an infinitive, not a modal', () => {
  test('"tries to run" in all seven, with each lexeme\'s own link', () => {
    expect(sayAll(clause(the('MAN'), 'TRY', { infinitiveComplement: { verbPhrase: { verb: 'RUN' } } }))).toEqual({
      en: 'the man tries to run.', it: "l'uomo prova a correre.", fr: "l'homme essaie de courir.",
      de: 'der Mann versucht, zu laufen.', es: 'el hombre intenta correr.', ja: '男は走ることを試みます。',
      pt: 'o homem tenta correr.',
    });
    expect(sayAll(clause(the('MAN'), 'TRY', { infinitiveComplement: { verbPhrase: { verb: 'RUN' } }, verbPhrase: { negative: true } }))).toEqual({
      en: 'the man does not try to run.', it: "l'uomo non prova a correre.", fr: "l'homme n'essaie pas de courir.",
      de: 'der Mann versucht nicht, zu laufen.', es: 'el hombre no intenta correr.', ja: '男は走ることを試みません。',
      pt: 'o homem não tenta correr.',
    });
    expect(sayAll(clause(the('MAN'), 'TRY', { infinitiveComplement: { verbPhrase: { verb: 'EAT' }, directObject: the('FOOD') } }))).toEqual({
      en: 'the man tries to eat the food.', it: "l'uomo prova a mangiare il cibo.", fr: "l'homme essaie de manger la nourriture.",
      de: 'der Mann versucht, das Essen zu essen.', es: 'el hombre intenta comer la comida.',
      ja: '男は食べ物を食べることを試みます。', pt: 'o homem tenta comer a comida.',
    });
    expect(sayAll(clause(the('MAN'), 'TRY', { infinitiveComplement: { verbPhrase: { verb: 'RUN', negative: true } } }))).toMatchObject({
      en: 'the man tries not to run.', fr: "l'homme essaie de ne pas courir.", de: 'der Mann versucht, nicht zu laufen.',
    });
  });

  test('it also takes a plain object, and versuchen has no ge- in its participle', () => {
    expect(sayAll(clause(the('WOMAN'), 'TRY', { directObject: the('ACTION') }))).toEqual({
      en: 'the woman tries the action.', it: "la donna prova l'azione.", fr: "la femme essaie l'action.",
      de: 'die Frau versucht die Handlung.', es: 'la mujer intenta la acción.', ja: '女は動作を試みます。',
      pt: 'a mulher tenta a ação.',
    });
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), 'TRY', { directObject: the('ACTION'), verbPhrase: { aspect: 'resultative' } })))
      .toMatchObject({ de: 'die Katze hat die Handlung versucht.', fr: "la chatte a essayé l'action." });
    expect(sayAll(clause(the('MAN', { number: 'plural' }), 'TRY', { directObject: the('ACTION'), verbPhrase: { tense: 'future' } })))
      .toMatchObject({ fr: "les hommes essaieront l'action.", it: "gli uomini proveranno l'azione." });
  });

  // What P09's `/attach RETRY under TRY` would have cost with TRY a modal: the Japanese modal cites
  // its own suffix as a verb (the A222 family). With TRY lexical, the plan reads もう一度試みる.
  test('an "again" gloss on TRY reads as a verb in Japanese', () => {
    expect(sayAll({ subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'TRY', modifier: 'AGAIN' }, infinitive: true } as PhrasePlan)).toEqual({
      en: 'to try again.', it: 'provare di nuovo.', fr: 'essayer de nouveau.', de: 'erneut versuchen.',
      es: 'intentar de nuevo.', ja: 'もう一度試みる。', pt: 'tentar de novo.',
    });
  });
});

// The builder has no control for an `infinitiveComplement` on a lexical verb, so "needs to run" and
// "tries to run" render from a plan but cannot be built in the app: the picker offers an object, an
// adverb and the complements, and the infinitive is not among them. One control would serve DESIRE,
// NEED and TRY alike; B62 records it, and this suite is where the plans are exercised meanwhile.

describe('known bugs: an Italian multiword finite (PENDING-L4-1)', () => {
  // Now: the frequency adverb trails the whole finite, "non ha bisogno mai del cibo" / "ha bisogno
  // sempre del cibo". Want: it sits between the verb and its noun, "non ha mai bisogno del cibo" /
  // "ha sempre bisogno del cibo", the way French now does it (fr/predicateText.ts) and the way
  // Italian itself does it in a compound tense ("non ha mai avuto bisogno"). The Italian predicate is
  // no lane's engine area in this batch, so it is left pinned rather than fixed.
  test.fails('an Italian frequency adverb sits between the verb and its noun', () => {
    const needs = (modifier: string) =>
      sayAll(clause(np('MAN', { definiteness: 'definite' }), 'NEED', { directObject: np('FOOD', { definiteness: 'definite' }), verbPhrase: { modifier } })).it;
    expect(needs('NEVER')).toBe("l'uomo non ha mai bisogno del cibo.");
    expect(needs('ALWAYS')).toBe("l'uomo ha sempre bisogno del cibo.");
  });
});

describe('known bugs: the Italian imperfect subjunctive of fare (PENDING-L4-2)', () => {
  // Now: "se l'uomo fasse il lavoro" — mood.ts derives the Italian protasis from the infinitive minus
  // -re, and fare hides its Latin stem (IT_SUBJ_STEM has PRODUCE for the same reason, produrre →
  // produce). Want: "facesse". It is MAKE's bug, live before B62; DO meets it because it shares
  // fare. The fix is one row in IT_SUBJ_STEM, in no lane's area this batch.
  test.fails('fare\'s protasis is facesse', () => {
    for (const verb of ['MAKE', 'DO']) {
      expect(sayAll({
        ...clause(np('CAT', { definiteness: 'definite' }), 'EAT'),
        condition: clause(np('MAN', { definiteness: 'definite' }), verb, { directObject: np('WORK_NOUN', { definiteness: 'definite' }) }),
      }).it).toBe("se l'uomo facesse il lavoro, il gatto mangerebbe.");
    }
  });
});
