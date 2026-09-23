import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C28, the verb roots: sixty verbs the sweep of 2026-09-22 left on the literal because
// a root has no genus to be glossed by. Sixteen turned out to have one once the shapes that had
// shipped since were tried on them — a route, an instrument, a comitative, an essive, a purpose
// clause, a negated causative — and three words were seeded for them: the adverb EXACTLY and the
// adjectives CLOSED and OPEN_ADJECTIVE. This file pins both halves.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

describe('the verb roots C28 glossed', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // A route on the genus: the complement MOVE_ONESELF always licensed and no gloss had used.
    // JUMP is the same noun as a direction ("into the air"), so the two stay apart everywhere.
    ['FLY', { en: 'to move through the air.', it: "muoversi attraverso l'aria.", fr: "se déplacer à travers l'air.", de: 'sich durch die Luft bewegen.', es: 'moverse por el aire.', ja: '空気を移動する。', pt: 'mover-se pelo ar.' }],
    // SEE's shape on the other sense.
    ['HEAR', { en: 'to perceive sounds.', it: 'percepire suoni.', fr: 'percevoir des sons.', de: 'Geräusche empfinden.', es: 'percibir sonidos.', ja: '音を知覚する。', pt: 'perceber sons.' }],
    // The essive object complement with no object of its own, the idiom in every language.
    ['INCLUDE', { en: 'to have as part.', it: 'avere come parte.', fr: 'avoir comme partie.', de: 'als Teil haben.', es: 'tener como parte.', ja: '部分として持つ。', pt: 'ter como parte.' }],
    // A noun predicate inside the causee's clause; German puts it in the nominative, the case
    // werden takes, not the accusative of the causee.
    ['TRANSFORM', { en: 'to cause an object to become another object.', it: 'indurre un oggetto a diventare un altro oggetto.', fr: 'induire un objet à devenir un autre objet.', de: 'einen Gegenstand veranlassen, ein anderer Gegenstand zu werden.', es: 'inducir un objeto a volverse otro objeto.', ja: '物体が別の物体になるようにする。', pt: 'induzir um objeto a tornar-se outro objeto.' }],
    // The instrument is the differentia; its genus MOVE is glossed in the same ticket.
    ['DRAG', { en: 'to move objects with the cursor.', it: 'spostare oggetti con il cursore.', fr: 'déplacer des objets avec le curseur.', de: 'Gegenstände mit dem Cursor verschieben.', es: 'mover objetos con el cursor.', ja: 'カーソルで物体を移動する。', pt: 'mover objetos com o cursor.' }],
    // An indefinite genitive possessor: prenominal in English and Japanese, "di"/"de" elsewhere.
    ['MOVE', { en: "to change an object's place.", it: 'cambiare il luogo di un oggetto.', fr: "changer le lieu d'un objet.", de: 'den Ort eines Gegenstands ändern.', es: 'cambiar el lugar de un objeto.', ja: '物体の場所を変える。', pt: 'mudar o lugar de um objeto.' }],
    // A purpose clause with an object of its own; German extraposes it behind a comma.
    ['EXCHANGE', { en: 'to give an object to acquire another object.', it: 'dare un oggetto per acquisire un altro oggetto.', fr: 'donner un objet pour acquérir un autre objet.', de: 'einen Gegenstand geben, um einen anderen Gegenstand zu erwerben.', es: 'dar un objeto para adquirir otro objeto.', ja: '別の物体を取得するために物体をあげる。', pt: 'dar um objeto para adquirir outro objeto.' }],
    // The comitative: と in Japanese, where the instrumental would be で.
    ['ACCOMPANY', { en: 'to go with a person.', it: 'andare con una persona.', fr: 'aller avec une personne.', de: 'mit einer Person gehen.', es: 'ir con una persona.', ja: '人と行く。', pt: 'ir com uma pessoa.' }],
    // LEAVE's own frame inside the caused clause: Italian, Spanish and Portuguese go out *of* it.
    ['REMOVE', { en: 'to cause an object to leave a place.', it: 'indurre un oggetto a uscire da un luogo.', fr: 'induire un objet à quitter un lieu.', de: 'einen Gegenstand veranlassen, einen Ort zu verlassen.', es: 'inducir un objeto a salir de un lugar.', ja: '物体が場所を出るようにする。', pt: 'induzir um objeto a sair de um lugar.' }],
    // German zurückkehren is separable: the zu goes between the particle and the stem.
    ['RESTORE', { en: 'to cause an object to return.', it: 'indurre un oggetto a tornare.', fr: 'induire un objet à revenir.', de: 'einen Gegenstand veranlassen zurückzukehren.', es: 'inducir un objeto a volver.', ja: '物体が戻るようにする。', pt: 'induzir um objeto a voltar.' }],
    // HIDE's shape on PIN's participle, with es/pt estar for the transient state.
    ['UNPIN', { en: 'to cause an object not to be pinned.', it: 'indurre un oggetto a non essere fissato.', fr: 'induire un objet à ne pas être épinglé.', de: 'einen Gegenstand veranlassen, nicht angeheftet zu sein.', es: 'inducir un objeto a no estar fijado.', ja: '物体がピン留め済みではないようにする。', pt: 'induzir um objeto a não estar fixado.' }],
    ['SET', { en: 'to choose a value.', it: 'scegliere un valore.', fr: 'choisir une valeur.', de: 'einen Wert wählen.', es: 'elegir un valor.', ja: '値を選ぶ。', pt: 'escolher um valor.' }],
    // EXACTLY, seeded for it: what was EXPRESS's gloss character for character now is not.
    ['SPECIFY', { en: 'to indicate exactly.', it: 'indicare esattamente.', fr: 'indiquer exactement.', de: 'genau bezeichnen.', es: 'indicar exactamente.', ja: '正確に示す。', pt: 'indicar exatamente.' }],
    // KNOW with a noun object is KNOW_ACQUAINTED's word (A131), and definite, so French is not
    // *du sens*.
    ['UNDERSTAND', { en: 'to know the meaning.', it: 'conoscere il significato.', fr: 'connaître le sens.', de: 'die Bedeutung kennen.', es: 'conocer el significado.', ja: '意味を知る。', pt: 'conhecer o significado.' }],
    // Each denies the other's state; Japanese turns the た-adjective into 〜ていない.
    ['OPEN', { en: 'to cause an object not to be closed.', it: 'indurre un oggetto a non essere chiuso.', fr: 'induire un objet à ne pas être fermé.', de: 'einen Gegenstand veranlassen, nicht geschlossen zu sein.', es: 'inducir un objeto a no estar cerrado.', ja: '物体が閉じていないようにする。', pt: 'induzir um objeto a não estar fechado.' }],
    ['CLOSE', { en: 'to cause an object not to be open.', it: 'indurre un oggetto a non essere aperto.', fr: 'induire un objet à ne pas être ouvert.', de: 'einen Gegenstand veranlassen, nicht offen zu sein.', es: 'inducir un objeto a no estar abierto.', ja: '物体が開いていないようにする。', pt: 'induzir um objeto a não estar aberto.' }],
  ])('%s', (concept, rendered) => {
    expect(definitionAll(concept)).toEqual(rendered);
  });
});

describe('the words C28 seeded', () => {
  // The two states OPEN and CLOSE leave: agreeing attributively in gender and number, predicated
  // with estar in Spanish and Portuguese (transient), and in Japanese a た-adjective that predicates
  // as 〜ている — in the present, the negative and the past alike.
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    ['CLOSED',
      { en: 'the closed houses.', it: 'le case chiuse.', fr: 'les maisons fermées.', de: 'die geschlossenen Häuser.', es: 'las casas cerradas.', ja: '閉じた家。', pt: 'as casas fechadas.' },
      { en: 'the house is not closed.', it: 'la casa non è chiusa.', fr: "la maison n'est pas fermée.", de: 'das Haus ist nicht geschlossen.', es: 'la casa no está cerrada.', ja: '家は閉じていません。', pt: 'a casa não está fechada.' },
      { en: 'the books were closed.', it: 'i libri erano chiusi.', fr: 'les livres étaient fermés.', de: 'die Bücher waren geschlossen.', es: 'los libros estaban cerrados.', ja: '本は閉じていました。', pt: 'os livros estavam fechados.' }],
    // German offen is an adjective, not geöffnet, OPEN's participle.
    ['OPEN_ADJECTIVE',
      { en: 'the open houses.', it: 'le case aperte.', fr: 'les maisons ouvertes.', de: 'die offenen Häuser.', es: 'las casas abiertas.', ja: '開いた家。', pt: 'as casas abertas.' },
      { en: 'the house is not open.', it: 'la casa non è aperta.', fr: "la maison n'est pas ouverte.", de: 'das Haus ist nicht offen.', es: 'la casa no está abierta.', ja: '家は開いていません。', pt: 'a casa não está aberta.' },
      { en: 'the books were open.', it: 'i libri erano aperti.', fr: 'les livres étaient ouverts.', de: 'die Bücher waren offen.', es: 'los libros estaban abiertos.', ja: '本は開いていました。', pt: 'os livros estavam abertos.' }],
  ])('%s', (adjective, attributive, negated, past) => {
    const predicative = { predicative: { phrase: { concept: adjective } } };
    expect(sayAll({ subject: np('HOUSE', { definiteness: 'definite', number: 'plural', adjectives: [adjective] }) })).toEqual(attributive);
    expect(sayAll(clause(np('HOUSE', { definiteness: 'definite' }), 'BE', { verbPhrase: { negative: true }, complements: predicative }))).toEqual(negated);
    expect(sayAll(clause(np('BOOK', { definiteness: 'definite', number: 'plural' }), 'BE', { verbPhrase: { tense: 'past' }, complements: predicative }))).toEqual(past);
  });

  // A manner adverb: after the verb (and its object) in English, before the verb in Japanese.
  test('EXACTLY', () => {
    expect(sayAll(clause(np('WOMAN', { definiteness: 'definite' }), 'SPECIFY', { verbPhrase: { modifier: 'EXACTLY', tense: 'past' }, directObject: np('VALUE', { definiteness: 'definite' }) }))).toEqual({
      en: 'the woman specified the value exactly.',
      it: 'la donna specificò esattamente il valore.',
      fr: 'la femme précisa exactement la valeur.',
      de: 'die Frau bestimmte genau den Wert.',
      es: 'la mujer especificó exactamente el valor.',
      ja: '女は値を正確に特定しました。',
      pt: 'a mulher especificou exatamente o valor.',
    });
  });
});
