import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// The words the app needs to name its own workspace (localization B40, B42, B43): the undo and redo
// pair, what a removed period is, the console, the canvas, a preview, the toolbar, editing, going
// back and shrinking. Each is pinned by its paradigm, not only by the UI string it was seeded for:
// a seeded word is a word of the phrase builder like any other.

const THE = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });
const MAN = THE('MAN');
const PHRASE = THE('PHRASE');
const YOU = np('SECOND_PERSON', { definiteness: 'bare' });
const verbless = (subject: NounPhrase) => sayAll({ subject } as PhrasePlan);

describe('the workspace nouns', () => {
  // Italian "console" is invariable and feminine; Brazilian Portuguese "o console" is masculine.
  test('CONSOLE', () => {
    expect(verbless(THE('CONSOLE'))).toEqual({
      en: 'the console.', it: 'la console.', fr: 'la console.', de: 'die Konsole.', es: 'la consola.', ja: 'コンソール。', pt: 'o console.',
    });
    expect(verbless(np('CONSOLE', { number: 'plural', definiteness: 'indefinite', adjectives: ['NEW'] }))).toEqual({
      en: 'new consoles.', it: 'nuove console.', fr: 'de nouvelles consoles.', de: 'neue Konsolen.',
      es: 'unas nuevas consolas.', ja: '新しいコンソール。', pt: 'uns novos consoles.',
    });
    expect(sayAll(clause(THE('CAT'), 'RUN', { complements: { locative: { phrase: THE('CONSOLE') } } }))).toEqual({
      en: 'the cat runs in the console.', it: 'il gatto corre nella console.', fr: 'le chat court dans la console.',
      de: 'der Kater läuft in der Konsole.', es: 'el gato corre en la consola.', ja: '猫はコンソールで走ります。',
      pt: 'o gato corre no console.',
    });
  });

  // The painter's word, apart from WORKSPACE: it "tela", not "area di lavoro". French "canevas" is
  // invariable.
  test('CANVAS', () => {
    expect(verbless(THE('CANVAS'))).toEqual({
      en: 'the canvas.', it: 'la tela.', fr: 'le canevas.', de: 'die Arbeitsfläche.', es: 'el lienzo.', ja: 'キャンバス。', pt: 'a tela.',
    });
    expect(verbless(np('CANVAS', { number: 'plural', definiteness: 'indefinite', adjectives: ['NEW'] }))).toEqual({
      en: 'new canvases.', it: 'nuove tele.', fr: 'de nouveaux canevas.', de: 'neue Arbeitsflächen.',
      es: 'unos nuevos lienzos.', ja: '新しいキャンバス。', pt: 'umas novas telas.',
    });
  });

  // Two-word heads keep their words together under an article and an adjective (es "vista previa").
  test('PREVIEW', () => {
    expect(verbless(THE('PREVIEW'))).toEqual({
      en: 'the preview.', it: "l'anteprima.", fr: "l'aperçu.", de: 'die Vorschau.', es: 'la vista previa.', ja: 'プレビュー。',
      pt: 'a pré-visualização.',
    });
    expect(verbless(np('PREVIEW', { number: 'plural', definiteness: 'indefinite', adjectives: ['NEW'] }))).toEqual({
      en: 'new previews.', it: 'nuove anteprime.', fr: 'de nouveaux aperçus.', de: 'neue Vorschauen.',
      es: 'unas nuevas vistas previas.', ja: '新しいプレビュー。', pt: 'umas novas pré-visualizações.',
    });
  });

  test('TOOLBAR', () => {
    expect(verbless(THE('TOOLBAR'))).toEqual({
      en: 'the toolbar.', it: 'la barra degli strumenti.', fr: "la barre d'outils.", de: 'die Symbolleiste.',
      es: 'la barra de herramientas.', ja: 'ツールバー。', pt: 'a barra de ferramentas.',
    });
    expect(verbless(np('TOOLBAR', { number: 'plural', definiteness: 'indefinite', adjectives: ['NEW'] }))).toEqual({
      en: 'new toolbars.', it: 'nuove barre degli strumenti.', fr: "de nouvelles barres d'outils.", de: 'neue Symbolleisten.',
      es: 'unas nuevas barras de herramientas.', ja: '新しいツールバー。', pt: 'umas novas barras de ferramentas.',
    });
  });
});

// ADDED's opposite. Japanese says 削除済み (see its seed), and the participle agrees in Romance.
describe('REMOVED', () => {
  test('agrees with its noun', () => {
    expect(verbless(THE('PERIOD_SENTENCE', { number: 'plural', adjectives: ['REMOVED'] }))).toEqual({
      en: 'the removed periods.', it: 'i periodi rimossi.', fr: 'les périodes retirées.', de: 'die entfernten Satzgefüge.',
      es: 'los períodos quitados.', ja: '削除済みの文。', pt: 'os períodos removidos.',
    });
    expect(verbless(THE('PHRASE', { adjectives: ['REMOVED'] }))).toEqual({
      en: 'the removed phrase.', it: 'la frase rimossa.', fr: 'la phrase retirée.', de: 'die entfernte Phrase.',
      es: 'la frase quitada.', ja: '削除済みのフレーズ。', pt: 'a frase removida.',
    });
  });

  // Transient, like SAVED: Spanish and Portuguese predicate it with estar.
  test('is a state, predicated with estar', () => {
    const said = sayAll(clause(PHRASE, 'BE', { complements: { predicative: { phrase: np('REMOVED') } } }));
    expect(said.es).toBe('la frase está quitada.');
    expect(said.pt).toBe('a frase está removida.');
    expect(said.it).toBe('la frase è rimossa.');
  });
});

// The verbs, each in the persons, tenses and moods its languages inflect.
const on = (verb: string, verbPhrase: Record<string, unknown> = {}, extra: Partial<PhrasePlan> = {}) =>
  sayAll({ subject: MAN, verbPhrase: { verb, ...verbPhrase }, directObject: PHRASE, ...extra } as PhrasePlan);
const command = (verb: string, extra: Partial<PhrasePlan> = {}) =>
  sayAll({ subject: YOU, verbPhrase: { verb }, directObject: PHRASE, imperative: true, ...extra } as PhrasePlan);
const relative = (verb: string) =>
  sayAll(clause(np('MAN', { definiteness: 'definite', relative: { verbPhrase: { verb }, directObject: PHRASE } }), 'RUN'));

describe('UNDO', () => {
  // Italian and French share CANCEL's verb. German is "rückgängig machen": the particle is a word of
  // its own, left last in a main clause and rejoined with a space everywhere else.
  test('the present, and the past negated', () => {
    expect(on('UNDO')).toEqual({
      en: 'the man undoes the phrase.', it: "l'uomo annulla la frase.", fr: "l'homme annule la phrase.",
      de: 'der Mann macht die Phrase rückgängig.', es: 'el hombre deshace la frase.', ja: '男はフレーズを元に戻します。',
      pt: 'o homem desfaz a frase.',
    });
    expect(on('UNDO', { tense: 'past', negative: true })).toEqual({
      en: 'the man did not undo the phrase.', it: "l'uomo non annullò la frase.", fr: "l'homme n'annula pas la phrase.",
      de: 'der Mann machte die Phrase nicht rückgängig.', es: 'el hombre no deshizo la frase.',
      ja: '男はフレーズを元に戻しませんでした。', pt: 'o homem não desfez a frase.',
    });
  });

  test('the future, the perfect and the passive', () => {
    const men = sayAll({ subject: THE('MAN', { number: 'plural' }), verbPhrase: { verb: 'UNDO', tense: 'future' }, directObject: PHRASE } as PhrasePlan);
    expect(men).toMatchObject({ de: 'die Männer werden die Phrase rückgängig machen.', es: 'los hombres desharán la frase.', pt: 'os homens desfarão a frase.' });
    expect(on('UNDO', { aspect: 'resultative' })).toMatchObject({
      en: 'the man has undone the phrase.', it: "l'uomo ha annullato la frase.", de: 'der Mann hat die Phrase rückgängig gemacht.',
      es: 'el hombre ha deshecho la frase.',
    });
    expect(on('UNDO', { voice: 'passive', tense: 'past' })).toMatchObject({
      en: 'the phrase was undone by the man.', de: 'die Phrase wurde vom Mann rückgängig gemacht.', pt: 'a frase foi desfeita pelo homem.',
      ja: 'フレーズは男に元に戻されました。',
    });
  });

  test('German keeps the particle apart wherever it meets its verb again', () => {
    expect(on('UNDO', { aspect: 'prospective' }).de).toBe('der Mann ist im Begriff, die Phrase rückgängig zu machen.');
    expect(relative('UNDO').de).toBe('der Mann, der die Phrase rückgängig macht, läuft.');
    expect(sayAll(clause(MAN, 'CLICK', { purpose: { verbPhrase: { verb: 'UNDO' }, directObject: PHRASE } } as Partial<PhrasePlan>)).de)
      .toBe('der Mann klickt, um die Phrase rückgängig zu machen.');
    const means = (level: 'process' | 'concept') => sayAll(clause(MAN, 'START', {
      complements: { instrumental: { phrase: PHRASE, action: { verb: 'UNDO' }, specifiers: [{ kind: 'abstraction', value: level }] } },
    } as Partial<PhrasePlan>)).de;
    expect(means('process')).toBe('der Mann beginnt, indem er die Phrase rückgängig macht.');
    // A nominalized infinitive is one word.
    expect(means('concept')).toBe('der Mann beginnt mit dem Rückgängigmachen der Phrase.');
  });

  // Spanish deshacer commands with the short "deshaz", as hacer does with "haz".
  test('the commands', () => {
    expect(command('UNDO')).toEqual({
      en: 'undo the phrase.', it: 'annulla la frase.', fr: 'annule la phrase.', de: 'mach die Phrase rückgängig.',
      es: 'deshaz la frase.', ja: 'フレーズを元に戻してください。', pt: 'desfaça a frase.',
    });
    expect(command('UNDO', { verbPhrase: { verb: 'UNDO', negative: true } } as Partial<PhrasePlan>)).toMatchObject({
      de: 'mach die Phrase nicht rückgängig.', es: 'no deshagas la frase.',
    });
    expect(sayAll({ subject: np('FIRST_PERSON', { number: 'plural', definiteness: 'bare' }), verbPhrase: { verb: 'UNDO' }, directObject: PHRASE, imperative: true } as PhrasePlan))
      .toMatchObject({ de: 'machen wir die Phrase rückgängig.', es: 'deshagamos la frase.' });
    // The button: German's infinitive keeps the particle on its verb; Japanese says the dictionary form.
    expect(command('UNDO', { imperativeRegister: 'instruction' })).toEqual({
      en: 'undo the phrase.', it: 'annulla la frase.', fr: 'annuler la phrase.', de: 'die Phrase rückgängig machen.',
      es: 'deshacer la frase.', ja: 'フレーズを元に戻す。', pt: 'desfazer a frase.',
    });
  });
});

describe('REDO', () => {
  // German takes RETRY's "wiederholen", as Google's and Apple's editors do.
  test('the present, the past, the perfect and the relative', () => {
    expect(on('REDO')).toEqual({
      en: 'the man redoes the phrase.', it: "l'uomo ripete la frase.", fr: "l'homme rétablit la phrase.",
      de: 'der Mann wiederholt die Phrase.', es: 'el hombre rehace la frase.', ja: '男はフレーズをやり直します。',
      pt: 'o homem refaz a frase.',
    });
    // Spanish writes the stressed i of the preterite stem after re-: rehízo.
    expect(on('REDO', { tense: 'past', negative: true })).toMatchObject({
      en: 'the man did not redo the phrase.', it: "l'uomo non ripeté la frase.", es: 'el hombre no rehízo la frase.', pt: 'o homem não refez a frase.',
    });
    expect(on('REDO', { aspect: 'resultative' })).toMatchObject({
      en: 'the man has redone the phrase.', it: "l'uomo ha ripetuto la frase.", fr: "l'homme a rétabli la phrase.", es: 'el hombre ha rehecho la frase.',
    });
    expect(relative('REDO')).toMatchObject({ de: 'der Mann, der die Phrase wiederholt, läuft.', ja: 'フレーズをやり直す男は走ります。' });
  });

  // Japanese buttons say the stem やり直し, with no label of its own.
  test('the commands', () => {
    expect(command('REDO')).toEqual({
      en: 'redo the phrase.', it: 'ripeti la frase.', fr: 'rétablis la phrase.', de: 'wiederhole die Phrase.',
      es: 'rehaz la frase.', ja: 'フレーズをやり直してください。', pt: 'refaça a frase.',
    });
    expect(command('REDO', { imperativeRegister: 'instruction' })).toEqual({
      en: 'redo the phrase.', it: 'ripeti la frase.', fr: 'rétablir la phrase.', de: 'die Phrase wiederholen.',
      es: 'rehacer la frase.', ja: 'フレーズをやり直し。', pt: 'refazer a frase.',
    });
  });
});

describe('EDIT', () => {
  // Italian and French share MODIFY's verb; Japanese labels a button with the verbal noun 編集.
  test('the present, the future and the perfect', () => {
    expect(on('EDIT')).toEqual({
      en: 'the man edits the phrase.', it: "l'uomo modifica la frase.", fr: "l'homme modifie la phrase.",
      de: 'der Mann bearbeitet die Phrase.', es: 'el hombre edita la frase.', ja: '男はフレーズを編集します。',
      pt: 'o homem edita a frase.',
    });
    expect(on('EDIT', { tense: 'future' })).toMatchObject({ it: "l'uomo modificherà la frase.", es: 'el hombre editará la frase.' });
    expect(on('EDIT', { aspect: 'resultative' })).toMatchObject({ de: 'der Mann hat die Phrase bearbeitet.', pt: 'o homem editou a frase.' });
  });

  test('the commands', () => {
    expect(command('EDIT')).toEqual({
      en: 'edit the phrase.', it: 'modifica la frase.', fr: 'modifie la phrase.', de: 'bearbeite die Phrase.',
      es: 'edita la frase.', ja: 'フレーズを編集してください。', pt: 'edite a frase.',
    });
    expect(command('EDIT', { imperativeRegister: 'instruction' })).toMatchObject({ de: 'die Phrase bearbeiten.', ja: 'フレーズを編集。' });
  });
});

describe('SHRINK', () => {
  // Making smaller, not packing into less room (COMPACT): de verkleinern, ja 縮小.
  test('the present, the past and the perfect', () => {
    expect(on('SHRINK')).toEqual({
      en: 'the man shrinks the phrase.', it: "l'uomo rimpicciolisce la frase.", fr: "l'homme réduit la phrase.",
      de: 'der Mann verkleinert die Phrase.', es: 'el hombre reduce la frase.', ja: '男はフレーズを縮小します。',
      pt: 'o homem reduz a frase.',
    });
    expect(on('SHRINK', { tense: 'past', negative: true })).toMatchObject({
      en: 'the man did not shrink the phrase.', it: "l'uomo non rimpicciolì la frase.", fr: "l'homme ne réduisit pas la phrase.",
      es: 'el hombre no redujo la frase.',
    });
    expect(on('SHRINK', { aspect: 'resultative' })).toMatchObject({ en: 'the man has shrunk the phrase.', fr: "l'homme a réduit la phrase." });
  });

  test('the commands', () => {
    expect(command('SHRINK')).toEqual({
      en: 'shrink the phrase.', it: 'rimpicciolisci la frase.', fr: 'réduis la phrase.', de: 'verkleinere die Phrase.',
      es: 'reduce la frase.', ja: 'フレーズを縮小してください。', pt: 'reduza a frase.',
    });
    expect(command('SHRINK', { verbPhrase: { verb: 'SHRINK', negative: true } } as Partial<PhrasePlan>)).toMatchObject({ es: 'no reduzcas la frase.' });
    expect(command('SHRINK', { imperativeRegister: 'instruction' })).toMatchObject({ de: 'die Phrase verkleinern.', ja: 'フレーズを縮小。' });
  });
});

describe('RETURN', () => {
  const back = (subject: NounPhrase, verbPhrase: Record<string, unknown> = {}) =>
    sayAll({ subject, verbPhrase: { verb: 'RETURN', ...verbPhrase }, complements: { direction: { phrase: THE('CANVAS') } } } as PhrasePlan);

  // Its goal is the `direction` complement. German "zurückkehren" is separable.
  test('the present and the past', () => {
    expect(back(MAN)).toEqual({
      en: 'the man returns to the canvas.', it: "l'uomo torna alla tela.", fr: "l'homme revient au canevas.",
      de: 'der Mann kehrt zur Arbeitsfläche zurück.', es: 'el hombre vuelve al lienzo.', ja: '男はキャンバスへ戻ります。',
      pt: 'o homem volta à tela.',
    });
    expect(back(THE('WOMAN'), { tense: 'past' })).toMatchObject({
      it: 'la donna tornò alla tela.', fr: 'la femme revint au canevas.', de: 'die Frau kehrte zur Arbeitsfläche zurück.',
    });
  });

  // it / fr / de select BE, as GO does, and the Romance participle agrees.
  test('the perfect selects BE', () => {
    expect(back(THE('WOMAN'), { aspect: 'resultative' })).toEqual({
      en: 'the woman has returned to the canvas.', it: 'la donna è tornata alla tela.', fr: 'la femme est revenue au canevas.',
      de: 'die Frau ist zur Arbeitsfläche zurückgekehrt.', es: 'la mujer ha vuelto al lienzo.', ja: '女はキャンバスへ戻りました。',
      pt: 'a mulher voltou à tela.',
    });
  });

  test('the future negated, the relative and the command', () => {
    expect(back(np('FIRST_PERSON', { number: 'plural', definiteness: 'bare' }), { tense: 'future', negative: true })).toMatchObject({
      it: 'non torneremo alla tela.', fr: 'nous ne reviendrons pas au canevas.', de: 'wir werden nicht zur Arbeitsfläche zurückkehren.',
    });
    expect(sayAll(clause(np('MAN', { definiteness: 'definite', relative: { verbPhrase: { verb: 'RETURN' }, complements: { direction: { phrase: THE('CANVAS') } } } }), 'RUN')))
      .toMatchObject({ de: 'der Mann, der zur Arbeitsfläche zurückkehrt, läuft.', ja: 'キャンバスへ戻る男は走ります。' });
    const go = (register?: 'instruction') => sayAll({
      subject: YOU, verbPhrase: { verb: 'RETURN' }, complements: { direction: { phrase: THE('CANVAS') } }, imperative: true,
      ...(register ? { imperativeRegister: register } : {}),
    } as PhrasePlan);
    expect(go()).toMatchObject({ de: 'kehr zur Arbeitsfläche zurück.', es: 'vuelve al lienzo.', pt: 'volte à tela.' });
    // A "back" button says the dictionary form 戻る.
    expect(go('instruction')).toEqual({
      en: 'return to the canvas.', it: 'torna alla tela.', fr: 'revenir au canevas.', de: 'zur Arbeitsfläche zurückkehren.',
      es: 'volver al lienzo.', ja: 'キャンバスへ戻る。', pt: 'voltar à tela.',
    });
  });
});
