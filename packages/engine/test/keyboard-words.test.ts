import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, furigana, np, sayAll, wordAll } from './harness.js';

// The words the keys and the help overlay are named with (localization B41, B44): the arrow keys and
// the parts of a page they move between, the next and the previous, left and right, backwards and
// everywhere, the register and the level a key cycles, and leaving a place.

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });

// An instruction, as the catalogue says a control: addressed to nobody.
const instruction = (verb: string, extra: Partial<PhrasePlan> = {}): PhrasePlan => ({
  subject: np('SECOND_PERSON', { definiteness: 'bare' }),
  verbPhrase: { verb },
  imperative: true,
  imperativeRegister: 'instruction',
  ...extra,
});

describe('the nouns of a page and its keys', () => {
  // Each count noun in the indefinite, then the definite plural with NEXT, which agrees with it:
  // Italian "area" elides its article (un'area) and "menu" is invariable, French "niveau" takes -x,
  // German declines NEXT weak after the article (die nächsten), Portuguese "nível" makes "níveis".
  test.each<[string, Record<string, string>, Record<string, string>]>([
    ['ARROW',
      { en: 'an arrow key.', it: 'una freccia.', fr: 'une flèche.', de: 'eine Pfeiltaste.', es: 'una flecha.', ja: '矢印キー。', pt: 'uma seta.' },
      { en: 'the next arrow keys.', it: 'le frecce successive.', fr: 'les flèches suivantes.', de: 'die nächsten Pfeiltasten.', es: 'las flechas siguientes.', ja: '次の矢印キー。', pt: 'as setas seguintes.' }],
    ['REGION',
      { en: 'a region.', it: "un'area.", fr: 'une zone.', de: 'ein Bereich.', es: 'una zona.', ja: '領域。', pt: 'uma área.' },
      { en: 'the next regions.', it: 'le aree successive.', fr: 'les zones suivantes.', de: 'die nächsten Bereiche.', es: 'las zonas siguientes.', ja: '次の領域。', pt: 'as áreas seguintes.' }],
    ['GROUP',
      { en: 'a group.', it: 'un gruppo.', fr: 'un groupe.', de: 'eine Gruppe.', es: 'un grupo.', ja: 'グループ。', pt: 'um grupo.' },
      { en: 'the next groups.', it: 'i gruppi successivi.', fr: 'les groupes suivants.', de: 'die nächsten Gruppen.', es: 'los grupos siguientes.', ja: '次のグループ。', pt: 'os grupos seguintes.' }],
    ['ROW',
      { en: 'a row.', it: 'una riga.', fr: 'une ligne.', de: 'eine Zeile.', es: 'una fila.', ja: '行。', pt: 'uma linha.' },
      { en: 'the next rows.', it: 'le righe successive.', fr: 'les lignes suivantes.', de: 'die nächsten Zeilen.', es: 'las filas siguientes.', ja: '次の行。', pt: 'as linhas seguintes.' }],
    ['MENU',
      { en: 'a menu.', it: 'un menu.', fr: 'un menu.', de: 'ein Menü.', es: 'un menú.', ja: 'メニュー。', pt: 'um menu.' },
      { en: 'the next menus.', it: 'i menu successivi.', fr: 'les menus suivants.', de: 'die nächsten Menüs.', es: 'los menús siguientes.', ja: '次のメニュー。', pt: 'os menus seguintes.' }],
    ['TARGET',
      { en: 'a target.', it: 'una destinazione.', fr: 'une cible.', de: 'ein Ziel.', es: 'un destino.', ja: '対象。', pt: 'um alvo.' },
      { en: 'the next targets.', it: 'le destinazioni successive.', fr: 'les cibles suivantes.', de: 'die nächsten Ziele.', es: 'los destinos siguientes.', ja: '次の対象。', pt: 'os alvos seguintes.' }],
    ['REGISTER',
      { en: 'a register.', it: 'un registro.', fr: 'un registre.', de: 'ein Register.', es: 'un registro.', ja: '言語使用域。', pt: 'um registro.' },
      { en: 'the next registers.', it: 'i registri successivi.', fr: 'les registres suivants.', de: 'die nächsten Register.', es: 'los registros siguientes.', ja: '次の言語使用域。', pt: 'os registros seguintes.' }],
    ['LEVEL',
      { en: 'a level.', it: 'un livello.', fr: 'un niveau.', de: 'eine Ebene.', es: 'un nivel.', ja: '段階。', pt: 'um nível.' },
      { en: 'the next levels.', it: 'i livelli successivi.', fr: 'les niveaux suivants.', de: 'die nächsten Ebenen.', es: 'los niveles siguientes.', ja: '次の段階。', pt: 'os níveis seguintes.' }],
  ])('%s', (concept, indefinite, nextPlural) => {
    expect(said(concept, { definiteness: 'indefinite' })).toEqual(indefinite);
    expect(said(concept, { number: 'plural', adjectives: ['NEXT'] })).toEqual(nextPlural);
  });

  // The two mass nouns take no indefinite article and no plural; the definite one is the help there is.
  test.each<[string, Record<string, string>]>([
    ['HELP', { en: 'the help.', it: "l'aiuto.", fr: "l'aide.", de: 'die Hilfe.', es: 'la ayuda.', ja: 'ヘルプ。', pt: 'a ajuda.' }],
    ['NAVIGATION', { en: 'the navigation.', it: 'la navigazione.', fr: 'la navigation.', de: 'die Navigation.', es: 'la navegación.', ja: 'ナビゲーション。', pt: 'a navegação.' }],
  ])('%s', (concept, definite) => {
    expect(said(concept)).toEqual(definite);
  });

  test('the keyboard compounds with its navigation, and is its owner in the genitive', () => {
    expect(said('NAVIGATION', { definiteness: 'bare', nounModifiers: [{ concept: 'KEYBOARD', relation: 'purpose' }] })).toMatchObject({
      en: 'keyboard navigation.', it: 'navigazione da tastiera.', de: 'Tastaturnavigation.', ja: 'キーボードのナビゲーション。',
    });
    expect(said('HELP', { possessor: np('KEYBOARD') })).toEqual({
      en: "the keyboard's help.", it: "l'aiuto della tastiera.", fr: "l'aide du clavier.", de: 'die Hilfe der Tastatur.',
      es: 'la ayuda del teclado.', ja: 'キーボードのヘルプ。', pt: 'a ajuda do teclado.',
    });
  });

  // One reading over the whole word, as イタリア語 has (furigana.test.ts).
  test('the arrow key is read as one word', () => {
    expect(furigana({ subject: np('ARROW') })).toEqual(['やじるしきー']);
  });
});

describe('the next, the previous and the numbered', () => {
  // German declines NEXT from its -e citation form: strong after "ein" (ein nächstes Menü), weak after
  // the article in the genitive plural (der vorherigen Zeilen) and the contracted dative (zum nächsten).
  test('NEXT and PREVIOUS agree, and decline in German', () => {
    expect(said('MENU', { definiteness: 'indefinite', adjectives: ['NEXT'] })).toEqual({
      en: 'a next menu.', it: 'un menu successivo.', fr: 'un menu suivant.', de: 'ein nächstes Menü.',
      es: 'un menú siguiente.', ja: '次のメニュー。', pt: 'um menu seguinte.',
    });
    expect(said('REGION', { adjectives: ['PREVIOUS'] })).toEqual({
      en: 'the previous region.', it: "l'area precedente.", fr: 'la zone précédente.', de: 'der vorherige Bereich.',
      es: 'la zona anterior.', ja: '前の領域。', pt: 'a área anterior.',
    });
    expect(said('LEVEL', { possessor: np('ROW', { number: 'plural', adjectives: ['PREVIOUS'] }) })).toMatchObject({
      it: 'il livello delle righe precedenti.', fr: 'le niveau des lignes précédentes.', de: 'die Ebene der vorherigen Zeilen.',
    });
    expect(sayAll(clause(np('DOG'), 'GO', { complements: { direction: { phrase: np('REGION', { adjectives: ['NEXT'] }) } } }))).toMatchObject({
      it: "il cane va all'area successiva.", de: 'der Hund geht zum nächsten Bereich.', ja: '犬は次の領域へ行きます。',
    });
  });

  // A participle, and the state numbering leaves a thing in: Spanish and Portuguese say it with estar.
  test('NUMBERED agrees, and is predicated with estar', () => {
    expect(said('ROW', { number: 'plural', adjectives: ['NUMBERED'] })).toEqual({
      en: 'the numbered rows.', it: 'le righe numerate.', fr: 'les lignes numérotées.', de: 'die nummerierten Zeilen.',
      es: 'las filas numeradas.', ja: '番号付きの行。', pt: 'as linhas numeradas.',
    });
    expect(sayAll(clause(np('GROUP', { number: 'plural' }), 'BE', { complements: { predicative: { phrase: np('NUMBERED') } } }))).toEqual({
      en: 'the groups are numbered.', it: 'i gruppi sono numerati.', fr: 'les groupes sont numérotés.', de: 'die Gruppen sind nummeriert.',
      es: 'los grupos están numerados.', ja: 'グループは番号付きです。', pt: 'os grupos estão numerados.',
    });
  });

  test('cited as words, the Japanese drops its の', () => {
    expect(wordAll('NEXT')).toEqual({ en: 'next', it: 'successivo', fr: 'suivant', de: 'nächste', es: 'siguiente', ja: '次', pt: 'seguinte' });
    expect(wordAll('PREVIOUS', 'TARGET')).toMatchObject({ it: 'precedente', fr: 'précédente', ja: '前' });
  });
});

describe('which way, and where', () => {
  // LEFT, RIGHT and BACKWARDS are directions, like UP and DOWN: after the object, ahead of the
  // complements (A142, A156).
  test.each<[string, Record<string, string>]>([
    ['LEFT', { en: 'the dog moves the book left in the house.', it: 'il cane sposta il libro a sinistra nella casa.', fr: 'le chien déplace le livre à gauche dans la maison.', de: 'der Hund verschiebt das Buch nach links im Haus.', es: 'el perro mueve el libro a la izquierda en la casa.', ja: '犬は家で本を左に移動します。', pt: 'o cão move o livro para a esquerda na casa.' }],
    ['RIGHT', { en: 'the dog moves the book right in the house.', it: 'il cane sposta il libro a destra nella casa.', fr: 'le chien déplace le livre à droite dans la maison.', de: 'der Hund verschiebt das Buch nach rechts im Haus.', es: 'el perro mueve el libro a la derecha en la casa.', ja: '犬は家で本を右に移動します。', pt: 'o cão move o livro para a direita na casa.' }],
  ])('%s', (adverb, expected) => {
    expect(sayAll(clause(np('DOG'), 'MOVE', {
      directObject: np('BOOK'), verbPhrase: { modifier: adverb }, complements: { locative: { phrase: np('HOUSE') } },
    }))).toEqual(expected);
  });

  test('BACKWARDS is a direction too', () => {
    expect(sayAll(clause(np('DOG'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'BACKWARDS' } }))).toEqual({
      en: 'the dog moves the book backwards.', it: "il cane sposta il libro all'indietro.", fr: 'le chien déplace le livre en arrière.',
      de: 'der Hund verschiebt das Buch rückwärts.', es: 'el perro mueve el libro hacia atrás.', ja: '犬は本を逆方向に移動します。',
      pt: 'o cão move o livro para trás.',
    });
    expect(sayAll(clause(np('DOG'), 'GO', { verbPhrase: { modifier: 'BACKWARDS' } }))).toMatchObject({
      it: "il cane va all'indietro.", de: 'der Hund geht rückwärts.', ja: '犬は逆方向に行きます。',
    });
  });

  // An adverb of place follows the object, as a locative complement does, where a manner adverb would
  // lead it in the Romance languages ("*come en todas partes el ratón").
  test('EVERYWHERE follows the object', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'EVERYWHERE' } }))).toEqual({
      en: 'the cat eats the mouse everywhere.', it: 'il gatto mangia il topo ovunque.', fr: 'le chat mange la souris partout.',
      de: 'der Kater frisst die Maus überall.', es: 'el gato come el ratón en todas partes.', ja: '猫はネズミをどこでも食べます。',
      pt: 'o gato come o rato em toda parte.',
    });
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'EVERYWHERE', negative: true } }))).toMatchObject({
      fr: 'le chat ne mange pas la souris partout.', de: 'der Kater frisst die Maus nicht überall.', es: 'el gato no come el ratón en todas partes.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'EVERYWHERE' } }))).toEqual({
      en: 'the cat runs everywhere.', it: 'il gatto corre ovunque.', fr: 'le chat court partout.', de: 'der Kater läuft überall.',
      es: 'el gato corre en todas partes.', ja: '猫はどこでも走ります。', pt: 'o gato corre em toda parte.',
    });
  });
});

// French quitter, German verlassen and Japanese 出る take the place as their object; Italian, Spanish
// and Portuguese go out of it (uscire da, salir de, sair de), the preposition lexical as CLICK's is.
describe('LEAVE', () => {
  const leaves = (extra: Parameters<typeof clause>[2] = {}) =>
    sayAll(clause(np('DOG'), 'LEAVE', { directObject: np('HOUSE'), ...extra }));

  test('present, past, future and plural', () => {
    expect(leaves()).toEqual({
      en: 'the dog leaves the house.', it: 'il cane esce dalla casa.', fr: 'le chien quitte la maison.', de: 'der Hund verlässt das Haus.',
      es: 'el perro sale de la casa.', ja: '犬は家を出ます。', pt: 'o cão sai da casa.',
    });
    expect(leaves({ verbPhrase: { tense: 'past' } })).toEqual({
      en: 'the dog left the house.', it: 'il cane uscì dalla casa.', fr: 'le chien quitta la maison.', de: 'der Hund verließ das Haus.',
      es: 'el perro salió de la casa.', ja: '犬は家を出ました。', pt: 'o cão saiu da casa.',
    });
    expect(leaves({ verbPhrase: { tense: 'future' } })).toMatchObject({
      it: 'il cane uscirà dalla casa.', fr: 'le chien quittera la maison.', de: 'der Hund wird das Haus verlassen.',
      es: 'el perro saldrá de la casa.', pt: 'o cão sairá da casa.',
    });
    expect(sayAll(clause(np('DOG', { number: 'plural' }), 'LEAVE', { directObject: np('HOUSE'), verbPhrase: { tense: 'past' } }))).toMatchObject({
      it: 'i cani uscirono dalla casa.', fr: 'les chiens quittèrent la maison.', de: 'die Hunde verließen das Haus.',
      es: 'los perros salieron de la casa.', pt: 'os cães saíram da casa.',
    });
  });

  // Italian uscire takes essere and agrees; the others keep their HAVE auxiliary.
  test('the compound past', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'LEAVE', { directObject: np('HOUSE'), verbPhrase: { aspect: 'resultative' } }))).toEqual({
      en: 'the cat has left the house.', it: 'la gatta è uscita dalla casa.', fr: 'la chatte a quitté la maison.',
      de: 'die Katze hat das Haus verlassen.', es: 'la gata ha salido de la casa.', ja: '猫は家を出ました。', pt: 'a gata saiu da casa.',
    });
    expect(leaves({ verbPhrase: { aspect: 'progressive' } })).toMatchObject({
      it: 'il cane sta uscendo dalla casa.', es: 'el perro está saliendo de la casa.', pt: 'o cão está saindo da casa.', ja: '犬は家を出ています。',
    });
  });

  // A prepositional object has no passive in Italian, Spanish or Portuguese, which keep the active,
  // as CLICK's languages do; French and German passivize their direct object.
  test('the passive', () => {
    expect(leaves({ verbPhrase: { voice: 'passive' } })).toEqual({
      en: 'the house is left by the dog.', it: 'il cane esce dalla casa.', fr: 'la maison est quittée par le chien.',
      de: 'das Haus wird vom Hund verlassen.', es: 'el perro sale de la casa.', ja: '家は犬に出られます。', pt: 'o cão sai da casa.',
    });
  });

  // Spanish salir's tú command is the irregular "sal"; German verlassen drops its umlaut in the du
  // command (verlass). The instruction is Japanese 退出, the verbal noun a "leave" button takes.
  test('commands', () => {
    // The addressee is the subject: the person of the command is its person.
    const command = (subject: NounPhrase, negative = false) =>
      sayAll({ ...clause(subject, 'LEAVE', { directObject: np('HOUSE'), verbPhrase: { negative } }), imperative: true });
    expect(command(np('SECOND_PERSON'))).toEqual({
      en: 'leave the house.', it: 'esci dalla casa.', fr: 'quitte la maison.', de: 'verlass das Haus.',
      es: 'sal de la casa.', ja: '家を出てください。', pt: 'saia da casa.',
    });
    expect(command(np('SECOND_PERSON'), true)).toMatchObject({
      it: 'non uscire dalla casa.', es: 'no salgas de la casa.', pt: 'não saia da casa.',
    });
    expect(command(np('FIRST_PERSON', { number: 'plural' }))).toMatchObject({
      it: 'usciamo dalla casa.', fr: 'quittons la maison.', de: 'verlassen wir das Haus.', es: 'salgamos de la casa.', pt: 'saiamos da casa.',
    });
    expect(sayAll(instruction('LEAVE', { directObject: np('HOUSE') }))).toEqual({
      en: 'leave the house.', it: 'esci dalla casa.', fr: 'quitter la maison.', de: 'das Haus verlassen.',
      es: 'salir de la casa.', ja: '家を退出。', pt: 'sair da casa.',
    });
  });

  test('a pronoun object keeps its preposition', () => {
    expect(sayAll(clause(np('DOG'), 'LEAVE', { directObject: np('THIRD_PERSON', { gender: 'fem' }) }))).toMatchObject({
      it: 'il cane esce da lei.', fr: 'le chien la quitte.', de: 'der Hund verlässt sie.', es: 'el perro sale de ella.', pt: 'o cão sai dela.',
    });
  });
});

// GO has no verbal noun of its own in Japanese, so its instruction label is 移動, where the stem would
// leave a bare 行き.
test('GO labels its instruction 移動', () => {
  expect(sayAll(instruction('GO', { verbPhrase: { verb: 'GO', modifier: 'LEFT' } }))).toEqual({
    en: 'go left.', it: "va' a sinistra.", fr: 'aller à gauche.', de: 'nach links gehen.',
    es: 'ir a la izquierda.', ja: '左に移動。', pt: 'ir para a esquerda.',
  });
});
