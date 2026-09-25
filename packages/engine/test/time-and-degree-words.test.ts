import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan, VerbPhrase, ReadyLanguageCode } from '@signi/shared';
import { clause, furigana, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// Localization B80, B89 and B90, three of P09-E24's tickets (COCA ranks 201–400): the time words
// MINUTE, MORNING, LATER, ONCE and OFTEN; the degree adverb A_LITTLE and the place adverb FAR_AWAY;
// and the universal pronoun EVERYTHING. Their paradigms and glosses are pinned here rather than in
// the shared exhaustive tables, so the E24 lanes that seeded words the same day do not edit the same
// rows.
//
// Three engine keys came with them: a time noun said with no preposition (`temporal_bare`: "la
// mattina", "ce matin", "this morning"), an intensifier's word before a noun (`attributive`: "a
// slightly big cat", "ein etwas großer Kater"), and a declining pronoun's fused OTHER per slot
// (`with_other_disjunctive`: "mit allem anderen"). A place adverb's に form now takes its reading
// (`locative_ni_reading`: 遠くに).

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<ReadyLanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Record<ReadyLanguageCode, string>;
}

const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });
const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });
const catRuns = (verbPhrase: Partial<VerbPhrase> = {}, extra: Partial<PhrasePlan> = {}) =>
  sayAll(clause(the('CAT'), 'RUN', { verbPhrase, ...extra }));
const catEatsFood = (verbPhrase: Partial<VerbPhrase>) =>
  sayAll(clause(the('CAT'), 'EAT', { verbPhrase, directObject: the('FOOD') }));
const at = (phrase: NounPhrase) => catRuns({}, { complements: { temporal: { phrase } } });

describe('the glosses B80, B89 and B90 ship', () => {
  test.each<[string, Record<ReadyLanguageCode, string>]>([
    // C26's part-whole shape with HOUR as the whole. Japanese 時間 is HOUR's word and TIME's.
    ['MINUTE', {
      en: 'a part of an hour.', it: "una parte di un'ora.", fr: "une partie d'une heure.", de: 'ein Teil einer Stunde.',
      es: 'una parte de una hora.', ja: '時間の部分。', pt: 'uma parte de uma hora.',
    }],
    // NIGHT's shape ("the dark part of a day") with FIRST.
    ['MORNING', {
      en: 'the first part of a day.', it: 'la prima parte di un giorno.', fr: "la première partie d'un jour.",
      de: 'der erste Teil eines Tages.', es: 'la primera parte de un día.', ja: '日の第一の部分。', pt: 'a primeira parte de um dia.',
    }],
    // C29's `after` on TIME, with NOW's deixis.
    ['LATER', {
      en: 'after this time.', it: 'dopo questo tempo.', fr: 'après ce temps.', de: 'nach dieser Zeit.',
      es: 'después de este tiempo.', ja: 'この時間の後に。', pt: 'depois deste tempo.',
    }],
    // EVERYWHERE's locative on CASE_INSTANCE, under `many`: REPEATEDLY already says "at many times".
    ['OFTEN', {
      en: 'in many cases.', it: 'in molti casi.', fr: 'dans beaucoup de cas.', de: 'in vielen Fällen.',
      es: 'en muchos casos.', ja: '多くの場合で。', pt: 'em muitos casos.',
    }],
    // VERY's "to a high level" with LOW.
    ['A_LITTLE', {
      en: 'to a low level.', it: 'a un livello basso.', fr: 'à un niveau bas.', de: 'zu einer niedrigen Ebene.',
      es: 'a un nivel bajo.', ja: '低い段階へ。', pt: 'a um nível baixo.',
    }],
    // HERE's "in this place" with FAR.
    ['FAR_AWAY', {
      en: 'in a far place.', it: 'in un luogo lontano.', fr: 'dans un lieu lointain.', de: 'an einem fernen Ort.',
      es: 'en un lugar lejano.', ja: '遠い場所で。', pt: 'em um lugar distante.',
    }],
    // SOMETHING's genus under `all`.
    ['EVERYTHING', {
      en: 'all things.', it: 'tutte le cose.', fr: 'toutes les choses.', de: 'alle Dinge.',
      es: 'todas las cosas.', ja: 'すべてのもの。', pt: 'todas as coisas.',
    }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  test('ONCE stays on the English literal by design', () => {
    expect(concepts.find((c) => c.id === 'ONCE')?.definition).toBeUndefined();
  });
});

describe('MINUTE and MORNING: a singular and a plural in every language', () => {
  test.each<[string, Record<ReadyLanguageCode, string>, Record<ReadyLanguageCode, string>]>([
    ['MINUTE',
      { en: 'the minute.', it: 'il minuto.', fr: 'la minute.', de: 'die Minute.', es: 'el minuto.', ja: '分。', pt: 'o minuto.' },
      { en: 'the minutes.', it: 'i minuti.', fr: 'les minutes.', de: 'die Minuten.', es: 'los minutos.', ja: '分。', pt: 'os minutos.' }],
    ['MORNING',
      { en: 'the morning.', it: 'la mattina.', fr: 'le matin.', de: 'der Morgen.', es: 'la mañana.', ja: '朝。', pt: 'a manhã.' },
      { en: 'the mornings.', it: 'le mattine.', fr: 'les matins.', de: 'die Morgen.', es: 'las mañanas.', ja: '朝。', pt: 'as manhãs.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });

  test('both are periods of time', () => {
    const isA = (id: string) => concepts.find((c) => c.id === id)?.isA;
    expect(['MINUTE', 'MORNING'].map(isA)).toEqual(['PERIOD_TIME', 'PERIOD_TIME']);
  });

  test('the object: MINUTE\'s gender agrees with its article', () => {
    expect(sayAll(clause(the('CAT'), 'SEE', { directObject: np('MINUTE', { definiteness: 'indefinite' }) }))).toEqual({
      en: 'the cat sees a minute.', it: 'il gatto vede un minuto.', fr: 'le chat voit une minute.', de: 'der Kater sieht eine Minute.',
      es: 'el gato ve un minuto.', ja: '猫は分を見ます。', pt: 'o gato vê um minuto.',
    });
  });
});

describe('MINUTE counted: 分 is its own Japanese counter', () => {
  test('a bare count', () => {
    expect(said('MINUTE', { definiteness: 'bare', numeral: 5 })).toEqual({
      en: 'five minutes.', it: 'cinque minuti.', fr: 'cinq minutes.', de: 'fünf Minuten.', es: 'cinco minutos.', ja: '五分。',
      pt: 'cinco minutos.',
    });
    expect(said('MINUTE', { definiteness: 'bare', numeral: 1 })).toMatchObject({ en: 'one minute.', fr: 'une minute.', de: 'eine Minute.', ja: '一分。' });
  });

  // The reading 6 of B80 (a numeral under `ago` dropped in German, Spanish and Portuguese) no longer
  // reproduces: the count survives in all seven.
  test('five minutes ago, and for five minutes', () => {
    const five = np('MINUTE', { definiteness: 'bare', numeral: 5 });
    expect(catRuns({ tense: 'past' }, { complements: { temporal: { phrase: five, specifiers: [{ kind: 'temporal', value: 'ago' }] } } })).toEqual({
      en: 'the cat ran five minutes ago.', it: 'il gatto corse cinque minuti fa.', fr: 'le chat courut il y a cinq minutes.',
      de: 'der Kater lief vor fünf Minuten.', es: 'el gato corrió hace cinco minutos.', ja: '猫は五分前に走りました。',
      pt: 'o gato correu há cinco minutos.',
    });
    expect(catRuns({}, { complements: { temporal: { phrase: five, specifiers: [{ kind: 'temporal', value: 'for' }] } } })).toEqual({
      en: 'the cat runs for five minutes.', it: 'il gatto corre per cinque minuti.', fr: 'le chat court pendant cinq minutes.',
      de: 'der Kater läuft fünf Minuten.', es: 'el gato corre durante cinco minutos.', ja: '猫は五分走ります。',
      pt: 'o gato corre por cinco minutos.',
    });
  });

  test('an indefinite measure counts as one in Japanese', () => {
    expect(catRuns({}, { complements: { temporal: { phrase: np('MINUTE', { definiteness: 'indefinite' }), specifiers: [{ kind: 'temporal', value: 'within' }] } } })).toEqual({
      en: 'the cat runs within a minute.', it: 'il gatto corre entro un minuto.', fr: "le chat court d'ici une minute.",
      de: 'der Kater läuft innerhalb einer Minute.', es: 'el gato corre dentro de un minuto.', ja: '猫は一分以内に走ります。',
      pt: 'o gato corre dentro de um minuto.',
    });
  });
});

describe('MORNING as the time of a clause', () => {
  // Italian and French say it with no preposition at all, English with none under a demonstrative
  // (`temporal_bare`); German "an" (am Morgen). Spanish and Portuguese keep the generic en / em.
  test('the morning', () => {
    expect(at(the('MORNING'))).toEqual({
      en: 'the cat runs in the morning.', it: 'il gatto corre la mattina.', fr: 'le chat court le matin.',
      de: 'der Kater läuft am Morgen.', es: 'el gato corre en la mañana.', ja: '猫は朝に走ります。', pt: 'o gato corre na manhã.',
    });
  });

  test('this morning', () => {
    expect(at(np('MORNING', { definiteness: 'this' }))).toEqual({
      en: 'the cat runs this morning.', it: 'il gatto corre questa mattina.', fr: 'le chat court ce matin.',
      de: 'der Kater läuft an diesem Morgen.', es: 'el gato corre en esta mañana.', ja: '猫はこの朝に走ります。',
      pt: 'o gato corre nesta manhã.',
    });
    expect(sayAll(clause(the('CAT'), 'EAT', {
      verbPhrase: { tense: 'past' }, directObject: the('FOOD'),
      complements: { temporal: { phrase: np('MORNING', { definiteness: 'this' }) } },
    }))).toMatchObject({
      en: 'the cat ate the food this morning.', it: 'il gatto mangiò il cibo questa mattina.', fr: 'le chat mangea la nourriture ce matin.',
    });
  });

  test('a morning, and every morning', () => {
    expect(at(np('MORNING', { definiteness: 'indefinite' }))).toMatchObject({
      it: 'il gatto corre una mattina.', fr: 'le chat court un matin.', de: 'der Kater läuft an einem Morgen.',
    });
    expect(at(np('MORNING', { definiteness: 'all', number: 'plural' }))).toMatchObject({
      it: 'il gatto corre tutte le mattine.', fr: 'le chat court tous les matins.', de: 'der Kater läuft an allen Morgen.',
    });
  });

  test('the other relations are untouched', () => {
    expect(catRuns({}, { complements: { temporal: { phrase: the('MORNING'), specifiers: [{ kind: 'temporal', value: 'until' }] } } })).toEqual({
      en: 'the cat runs until the morning.', it: 'il gatto corre fino alla mattina.', fr: "le chat court jusqu'au matin.",
      de: 'der Kater läuft bis zum Morgen.', es: 'el gato corre hasta la mañana.', ja: '猫は朝まで走ります。', pt: 'o gato corre até a manhã.',
    });
    expect(catRuns({}, { complements: { temporal: { phrase: the('MORNING'), specifiers: [{ kind: 'temporal', value: 'during' }] } } })).toEqual({
      en: 'the cat runs during the morning.', it: 'il gatto corre durante la mattina.', fr: 'le chat court pendant le matin.',
      de: 'der Kater läuft während des Morgens.', es: 'el gato corre durante la mañana.', ja: '猫は朝の間に走ります。',
      pt: 'o gato corre durante a manhã.',
    });
  });

  test('a day keeps its own preposition', () => {
    expect(at(np('DAY', { definiteness: 'this' }))).toMatchObject({
      en: 'the cat runs on this day.', it: 'il gatto corre in questo giorno.', fr: 'le chat court en ce jour.',
    });
  });
});

describe('LATER, ONCE and OFTEN: where each adverb stands', () => {
  // No subtype: after the verb, before the object in Romance and German, as NOW.
  test('LATER', () => {
    expect(catRuns({ modifier: 'LATER' })).toEqual({
      en: 'the cat runs later.', it: 'il gatto corre più tardi.', fr: 'le chat court plus tard.', de: 'der Kater läuft später.',
      es: 'el gato corre más tarde.', ja: '猫は後で走ります。', pt: 'o gato corre mais tarde.',
    });
    expect(catEatsFood({ modifier: 'LATER', tense: 'future' })).toEqual({
      en: 'the cat will eat the food later.', it: 'il gatto mangerà più tardi il cibo.', fr: 'le chat mangera plus tard la nourriture.',
      de: 'der Kater wird später das Essen fressen.', es: 'el gato comerá más tarde la comida.', ja: '猫は食べ物を後で食べます。',
      pt: 'o gato comerá mais tarde a comida.',
    });
    expect(catRuns({ modifier: 'LATER', negative: true })).toEqual({
      en: 'the cat does not run later.', it: 'il gatto non corre più tardi.', fr: 'le chat ne court pas plus tard.',
      de: 'der Kater läuft nicht später.', es: 'el gato no corre más tarde.', ja: '猫は後で走りません。', pt: 'o gato não corre mais tarde.',
    });
  });

  // No subtype either: after the verb is the *one time* sense; before it English would say *formerly*.
  test('ONCE', () => {
    expect(catRuns({ modifier: 'ONCE', tense: 'past' })).toEqual({
      en: 'the cat ran once.', it: 'il gatto corse una volta.', fr: 'le chat courut une fois.', de: 'der Kater lief einmal.',
      es: 'el gato corrió una vez.', ja: '猫は一度走りました。', pt: 'o gato correu uma vez.',
    });
    expect(catEatsFood({ modifier: 'ONCE', aspect: 'resultative' })).toEqual({
      en: 'the cat has eaten the food once.', it: 'il gatto ha mangiato una volta il cibo.', fr: 'le chat a mangé une fois la nourriture.',
      de: 'der Kater hat einmal das Essen gefressen.', es: 'el gato ha comido una vez la comida.', ja: '猫は食べ物を一度食べました。',
      pt: 'o gato comeu uma vez a comida.',
    });
  });

  // `frequency`, as ALWAYS: before the verb in English, between the auxiliary and the participle.
  test('OFTEN', () => {
    expect(catRuns({ modifier: 'OFTEN' })).toEqual({
      en: 'the cat often runs.', it: 'il gatto corre spesso.', fr: 'le chat court souvent.', de: 'der Kater läuft oft.',
      es: 'el gato corre a menudo.', ja: '猫はよく走ります。', pt: 'o gato corre frequentemente.',
    });
    expect(catEatsFood({ modifier: 'OFTEN', tense: 'past', negative: true })).toEqual({
      en: 'the cat did not often eat the food.', it: 'il gatto non mangiò spesso il cibo.', fr: 'le chat ne mangea pas souvent la nourriture.',
      de: 'der Kater fraß das Essen nicht oft.', es: 'el gato no comió a menudo la comida.', ja: '猫は食べ物をよく食べませんでした。',
      pt: 'o gato não comeu frequentemente a comida.',
    });
    expect(catEatsFood({ modifier: 'OFTEN', aspect: 'resultative' })).toEqual({
      en: 'the cat has often eaten the food.', it: 'il gatto ha spesso mangiato il cibo.', fr: 'le chat a souvent mangé la nourriture.',
      de: 'der Kater hat oft das Essen gefressen.', es: 'el gato ha comido a menudo la comida.', ja: '猫は食べ物をよく食べました。',
      pt: 'o gato comeu frequentemente a comida.',
    });
  });
});

describe('A_LITTLE, an intensifier', () => {
  const predicate = (extra: Partial<NounPhrase>, verbPhrase: Partial<VerbPhrase> = {}) =>
    sayAll(clause(the('CAT'), 'BE', { verbPhrase, complements: { predicative: { phrase: np('BIG', { headIntensifier: 'A_LITTLE', ...extra }) } } }));
  const attributive = (extra: Partial<NounPhrase> = {}, concept = 'CAT') =>
    sayAll(clause(np(concept, { definiteness: 'indefinite', adjectives: ['BIG'], adjectiveIntensifiers: ['A_LITTLE'], ...extra }), 'RUN'));

  test('on a predicate adjective', () => {
    expect(sayAll(clause(the('CAT'), 'BE', { complements: { predicative: { phrase: np('TIRED', { headIntensifier: 'A_LITTLE' }) } } }))).toEqual({
      en: 'the cat is a little tired.', it: "il gatto è un po' stanco.", fr: 'le chat est un peu fatigué.', de: 'der Kater ist ein bisschen müde.',
      es: 'el gato está un poco cansado.', ja: '猫は少し疲れています。', pt: 'o gato está um pouco cansado.',
    });
    expect(predicate({}, { tense: 'past', negative: true })).toEqual({
      en: 'the cat was not a little big.', it: "il gatto non era un po' grande.", fr: "le chat n'était pas un peu grand.",
      de: 'der Kater war nicht ein bisschen groß.', es: 'el gato no era un poco grande.', ja: '猫は少し大きくなかったです。',
      pt: 'o gato não era um pouco grande.',
    });
  });

  // English and German take another word before a noun, where "a little" / "ein bisschen" would
  // stack two articles ("an a little big cat", "ein ein bisschen großer Kater").
  test('before a noun, agreeing through the adjective', () => {
    expect(attributive()).toEqual({
      en: 'a slightly big cat runs.', it: "un gatto un po' grande corre.", fr: 'un chat un peu grand court.', de: 'ein etwas großer Kater läuft.',
      es: 'un gato un poco grande corre.', ja: '少し大きい猫は走ります。', pt: 'um gato um pouco grande corre.',
    });
    expect(attributive({ number: 'plural' }, 'HOUSE')).toEqual({
      en: 'slightly big houses run.', it: "case un po' grandi corrono.", fr: 'des maisons un peu grandes courent.', de: 'etwas große Häuser laufen.',
      es: 'unas casas un poco grandes corren.', ja: '少し大きい家は走ります。', pt: 'umas casas um pouco grandes correm.',
    });
  });

  // Japanese 少し is its own comparative word, so もっと drops: 少し大きい, never 少しもっと大きい.
  test('on a comparative', () => {
    expect(predicate({ headDegree: 'more' })).toEqual({
      en: 'the cat is a little bigger.', it: "il gatto è un po' più grande.", fr: 'le chat est un peu plus grand.',
      de: 'der Kater ist ein bisschen größer.', es: 'el gato es un poco más grande.', ja: '猫は少し大きいです。', pt: 'o gato é um pouco maior.',
    });
    expect(attributive({ adjectiveDegrees: ['more'] })).toEqual({
      en: 'a slightly bigger cat runs.', it: "un gatto un po' più grande corre.", fr: 'un chat un peu plus grand court.',
      de: 'ein etwas größerer Kater läuft.', es: 'un gato un poco más grande corre.', ja: '少し大きい猫は走ります。', pt: 'um gato um pouco maior corre.',
    });
    // The Japanese lowered degree is a negation, which 少し does not stand in.
    expect(predicate({ headDegree: 'less' })).toEqual({
      en: 'the cat is a little less big.', it: "il gatto è un po' meno grande.", fr: 'le chat est un peu moins grand.',
      de: 'der Kater ist ein bisschen weniger groß.', es: 'el gato es un poco menos grande.', ja: '猫はそれほど大きくないです。',
      pt: 'o gato é um pouco menos grande.',
    });
  });

  test('not said on an equative or a superlative', () => {
    expect(attributive({ adjectiveDegrees: ['equally'] })).toEqual({
      en: 'an equally big cat runs.', it: 'un gatto ugualmente grande corre.', fr: 'un chat aussi grand court.', de: 'ein gleich großer Kater läuft.',
      es: 'un gato igual de grande corre.', ja: '同じくらい大きい猫は走ります。', pt: 'um gato igualmente grande corre.',
    });
    expect(attributive({ definiteness: 'definite', adjectiveDegrees: ['most'] })).toEqual({
      en: 'the biggest cat runs.', it: 'il gatto più grande corre.', fr: 'le chat le plus grand court.', de: 'der größte Kater läuft.',
      es: 'el gato más grande corre.', ja: '最も大きい猫は走ります。', pt: 'o maior gato corre.',
    });
  });

  test('it is an intensifier, which no verb takes', () => {
    expect(concepts.find((c) => c.id === 'A_LITTLE')?.slot).toBe('intensifier');
  });
});

describe('FAR_AWAY, a place adverb', () => {
  test('after the verb, and after the object', () => {
    expect(catRuns({ modifier: 'FAR_AWAY' })).toEqual({
      en: 'the cat runs far away.', it: 'il gatto corre lontano.', fr: 'le chat court loin.', de: 'der Kater läuft weit weg.',
      es: 'el gato corre lejos.', ja: '猫は遠くで走ります。', pt: 'o gato corre longe.',
    });
    expect(catEatsFood({ modifier: 'FAR_AWAY' })).toEqual({
      en: 'the cat eats the food far away.', it: 'il gatto mangia il cibo lontano.', fr: 'le chat mange la nourriture loin.',
      de: 'der Kater frisst das Essen weit weg.', es: 'el gato come la comida lejos.', ja: '猫は食べ物を遠くで食べます。',
      pt: 'o gato come a comida longe.',
    });
  });

  // Being somewhere is a locative: estar in Spanish and Portuguese, and Japanese に with its reading.
  test('being and living far away', () => {
    const be = clause(the('CAT'), 'BE', { verbPhrase: { modifier: 'FAR_AWAY' } });
    expect(sayAll(be)).toEqual({
      en: 'the cat is far away.', it: 'il gatto è lontano.', fr: 'le chat est loin.', de: 'der Kater ist weit weg.',
      es: 'el gato está lejos.', ja: '猫は遠くにいます。', pt: 'o gato está longe.',
    });
    expect(furigana(be)).toContain('とおくに');
    expect(sayAll(clause(the('CAT'), 'BE', { verbPhrase: { modifier: 'FAR_AWAY', tense: 'past', negative: true } }))).toEqual({
      en: 'the cat was not far away.', it: 'il gatto non era lontano.', fr: "le chat n'était pas loin.", de: 'der Kater war nicht weit weg.',
      es: 'el gato no estaba lejos.', ja: '猫は遠くにいませんでした。', pt: 'o gato não estava longe.',
    });
    expect(sayAll(clause(the('CAT'), 'LIVE', { verbPhrase: { modifier: 'FAR_AWAY' } }))).toEqual({
      en: 'the cat lives far away.', it: 'il gatto abita lontano.', fr: 'le chat habite loin.', de: 'der Kater wohnt weit weg.',
      es: 'el gato vive lejos.', ja: '猫は遠くに住みます。', pt: 'o gato mora longe.',
    });
  });
});

describe('EVERYTHING, the universal thing pronoun', () => {
  const sees = (object: NounPhrase, verbPhrase: Partial<VerbPhrase> = {}) =>
    sayAll(clause(the('CAT'), 'SEE', { verbPhrase, directObject: object }));

  test('as the object and as the subject', () => {
    expect(sees(np('EVERYTHING'))).toEqual({
      en: 'the cat sees everything.', it: 'il gatto vede tutto.', fr: 'le chat voit tout.', de: 'der Kater sieht alles.',
      es: 'el gato ve todo.', ja: '猫はすべてを見ます。', pt: 'o gato vê tudo.',
    });
    expect(sayAll(clause(np('EVERYTHING'), 'RUN'))).toEqual({
      en: 'everything runs.', it: 'tutto corre.', fr: 'tout court.', de: 'alles läuft.', es: 'todo corre.', ja: 'すべては走ります。',
      pt: 'tudo corre.',
    });
    expect(sayAll(clause(np('EVERYTHING'), 'BE', { complements: { predicative: { phrase: np('BIG') } } }))).toEqual({
      en: 'everything is big.', it: 'tutto è grande.', fr: 'tout est grand.', de: 'alles ist groß.', es: 'todo es grande.',
      ja: 'すべては大きいです。', pt: 'tudo é grande.',
    });
  });

  test('after a preposition: German declines it', () => {
    expect(sayAll(clause(the('CAT'), 'EAT', { complements: { comitative: { phrase: np('EVERYTHING') } } }))).toEqual({
      en: 'the cat eats with everything.', it: 'il gatto mangia con tutto.', fr: 'le chat mange avec tout.', de: 'der Kater frisst mit allem.',
      es: 'el gato come con todo.', ja: '猫はすべてと食べます。', pt: 'o gato come com tudo.',
    });
  });

  // It has no negative form: "not everything" is *not all*, and the word stays. German puts nicht
  // after it, as after a definite object, where the partial reading wants *nicht alles* — B90's
  // reading 2, pinned as it renders (not solved by this seed).
  test('under negation it does not swap', () => {
    expect(sees(np('EVERYTHING'), { negative: true })).toEqual({
      en: 'the cat does not see everything.', it: 'il gatto non vede tutto.', fr: 'le chat ne voit pas tout.', de: 'der Kater sieht alles nicht.',
      es: 'el gato no ve todo.', ja: '猫はすべてを見ません。', pt: 'o gato não vê tudo.',
    });
    expect(sayAll(clause(np('EVERYTHING'), 'RUN', { verbPhrase: { negative: true } }))).toEqual({
      en: 'everything does not run.', it: 'tutto non corre.', fr: 'tout ne court pas.', de: 'alles läuft nicht.', es: 'todo no corre.',
      ja: 'すべては走りません。', pt: 'tudo não corre.',
    });
  });

  // OTHER fuses with it, as with SOMETHING (autre chose): tutto il resto, tout le reste, alles andere.
  test('everything else', () => {
    expect(sayAll(clause(np('EVERYTHING', { adjectives: ['OTHER'] }), 'RUN'))).toEqual({
      en: 'everything else runs.', it: 'tutto il resto corre.', fr: 'tout le reste court.', de: 'alles andere läuft.',
      es: 'todo lo demás corre.', ja: '別のすべては走ります。', pt: 'todo o resto corre.',
    });
    expect(sayAll(clause(the('CAT'), 'RUN', { complements: { comitative: { phrase: np('EVERYTHING', { adjectives: ['OTHER'] }) } } }))).toEqual({
      en: 'the cat runs with everything else.', it: 'il gatto corre con tutto il resto.', fr: 'le chat court avec tout le reste.',
      de: 'der Kater läuft mit allem anderen.', es: 'el gato corre con todo lo demás.', ja: '猫は別のすべてと走ります。',
      pt: 'o gato corre com todo o resto.',
    });
  });

  test('a thing pronoun of the indefinite slot', () => {
    const everything = concepts.find((c) => c.id === 'EVERYTHING');
    expect(everything?.slot).toBe('indefinite');
    expect(Object.values(everything?.forms ?? {}).every((f) => f['thing'] === '1' && !f['negative'])).toBe(true);
  });
});
