import { describe, expect, test } from 'vitest';
import type { NounElement, NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll, wordAll } from './harness.js';

// The words of a program's everyday controls (B25–B28): the dialog verbs, the clipboard and reorder
// verbs, the things a program talks about, what happened to a saved item, and which way a thing goes.

const YOU = np('SECOND_PERSON');
const WE = np('FIRST_PERSON', { number: 'plural' });

const acts = (subject: NounElement, verb: string, object: string, verbPhrase: Partial<VerbPhrase> = {}) =>
  sayAll(clause(subject, verb, { directObject: np(object), verbPhrase }));
const command = (addressee: NounElement, verb: string, object: string, extra: Partial<PhrasePlan> = {}, negative = false) =>
  sayAll({ ...clause(addressee, verb, { directObject: np(object), verbPhrase: { negative } }), imperative: true, ...extra });

// German keeps to inseparable verbs the clause builder can place (A138): annullieren, not abbrechen;
// deaktivieren, not ausschalten. Italian chiudere has the irregular chiuse / chiuso, German schließen and
// verschieben are strong (schloss / geschlossen, verschob / verschoben), and Spanish cerrar and mover
// diphthongize under stress (cierra, mueve) but not in the 1st plural (cerremos, movamos).
describe('program verbs: present, plural, past and future', () => {
  test.each<[string, string, Record<string, string>, Record<string, string>, Record<string, string>]>([
    ['CANCEL', 'PHRASE',
      { en: 'the dog cancels the phrase.', it: 'il cane annulla la frase.', fr: 'le chien annule la phrase.', de: 'der Hund annulliert die Phrase.', es: 'el perro cancela la frase.', ja: '犬はフレーズをキャンセルします。', pt: 'o cão cancela a frase.' },
      { en: 'the dog canceled the phrase.', it: 'il cane annullò la frase.', fr: 'le chien annula la phrase.', de: 'der Hund annullierte die Phrase.', es: 'el perro canceló la frase.', ja: '犬はフレーズをキャンセルしました。', pt: 'o cão cancelou a frase.' },
      { it: 'i cani annullano la frase.', fr: 'les chiens annulent la phrase.', de: 'die Hunde annullieren die Phrase.', es: 'los perros cancelan la frase.', pt: 'os cães cancelam a frase.' }],
    ['CLOSE', 'BOOK',
      { en: 'the dog closes the book.', it: 'il cane chiude il libro.', fr: 'le chien ferme le livre.', de: 'der Hund schließt das Buch.', es: 'el perro cierra el libro.', ja: '犬は本を閉じます。', pt: 'o cão fecha o livro.' },
      { en: 'the dog closed the book.', it: 'il cane chiuse il libro.', fr: 'le chien ferma le livre.', de: 'der Hund schloss das Buch.', es: 'el perro cerró el libro.', ja: '犬は本を閉じました。', pt: 'o cão fechou o livro.' },
      { it: 'i cani chiudono il libro.', fr: 'les chiens ferment le livre.', de: 'die Hunde schließen das Buch.', es: 'los perros cierran el libro.', pt: 'os cães fecham o livro.' }],
    ['RETRY', 'ACTION',
      { en: 'the dog retries the action.', it: "il cane riprova l'azione.", fr: "le chien réessaie l'action.", de: 'der Hund wiederholt die Handlung.', es: 'el perro reintenta la acción.', ja: '犬は動作を再試行します。', pt: 'o cão repete a ação.' },
      { en: 'the dog retried the action.', it: "il cane riprovò l'azione.", fr: "le chien réessaya l'action.", de: 'der Hund wiederholte die Handlung.', es: 'el perro reintentó la acción.', ja: '犬は動作を再試行しました。', pt: 'o cão repetiu a ação.' },
      { it: "i cani riprovano l'azione.", fr: "les chiens réessaient l'action.", de: 'die Hunde wiederholen die Handlung.', es: 'los perros reintentan la acción.', pt: 'os cães repetem a ação.' }],
    ['USE', 'STICK',
      { en: 'the dog uses the stick.', it: 'il cane usa il bastone.', fr: 'le chien utilise le bâton.', de: 'der Hund verwendet den Stock.', es: 'el perro usa el palo.', ja: '犬は棒を使います。', pt: 'o cão usa o pau.' },
      { en: 'the dog used the stick.', it: 'il cane usò il bastone.', fr: 'le chien utilisa le bâton.', de: 'der Hund verwendete den Stock.', es: 'el perro usó el palo.', ja: '犬は棒を使いました。', pt: 'o cão usou o pau.' },
      { it: 'i cani usano il bastone.', fr: 'les chiens utilisent le bâton.', de: 'die Hunde verwenden den Stock.', es: 'los perros usan el palo.', pt: 'os cães usam o pau.' }],
    ['COPY', 'TRANSLATION',
      { en: 'the dog copies the translation.', it: 'il cane copia la traduzione.', fr: 'le chien copie la traduction.', de: 'der Hund kopiert die Übersetzung.', es: 'el perro copia la traducción.', ja: '犬は翻訳をコピーします。', pt: 'o cão copia a tradução.' },
      { en: 'the dog copied the translation.', it: 'il cane copiò la traduzione.', fr: 'le chien copia la traduction.', de: 'der Hund kopierte die Übersetzung.', es: 'el perro copió la traducción.', ja: '犬は翻訳をコピーしました。', pt: 'o cão copiou a tradução.' },
      { it: 'i cani copiano la traduzione.', fr: 'les chiens copient la traduction.', de: 'die Hunde kopieren die Übersetzung.', es: 'los perros copian la traducción.', pt: 'os cães copiam a tradução.' }],
    ['MOVE', 'BOOK',
      { en: 'the dog moves the book.', it: 'il cane sposta il libro.', fr: 'le chien déplace le livre.', de: 'der Hund verschiebt das Buch.', es: 'el perro mueve el libro.', ja: '犬は本を移動します。', pt: 'o cão move o livro.' },
      { en: 'the dog moved the book.', it: 'il cane spostò il libro.', fr: 'le chien déplaça le livre.', de: 'der Hund verschob das Buch.', es: 'el perro movió el libro.', ja: '犬は本を移動しました。', pt: 'o cão moveu o livro.' },
      { it: 'i cani spostano il libro.', fr: 'les chiens déplacent le livre.', de: 'die Hunde verschieben das Buch.', es: 'los perros mueven el libro.', pt: 'os cães movem o livro.' }],
    ['RESIZE', 'CONTAINER',
      { en: 'the dog resizes the container.', it: 'il cane ridimensiona il contenitore.', fr: 'le chien redimensionne le récipient.', de: 'der Hund skaliert den Behälter.', es: 'el perro redimensiona el recipiente.', ja: '犬は容器をサイズ変更します。', pt: 'o cão redimensiona o recipiente.' },
      { en: 'the dog resized the container.', it: 'il cane ridimensionò il contenitore.', fr: 'le chien redimensionna le récipient.', de: 'der Hund skalierte den Behälter.', es: 'el perro redimensionó el recipiente.', ja: '犬は容器をサイズ変更しました。', pt: 'o cão redimensionou o recipiente.' },
      { it: 'i cani ridimensionano il contenitore.', fr: 'les chiens redimensionnent le récipient.', de: 'die Hunde skalieren den Behälter.', es: 'los perros redimensionan el recipiente.', pt: 'os cães redimensionam o recipiente.' }],
    ['TURN_OFF', 'OPTION',
      { en: 'the dog turns off the option.', it: "il cane disattiva l'opzione.", fr: "le chien désactive l'option.", de: 'der Hund deaktiviert die Option.', es: 'el perro desactiva la opción.', ja: '犬は選択肢をオフにします。', pt: 'o cão desativa a opção.' },
      { en: 'the dog turned off the option.', it: "il cane disattivò l'opzione.", fr: "le chien désactiva l'option.", de: 'der Hund deaktivierte die Option.', es: 'el perro desactivó la opción.', ja: '犬は選択肢をオフにしました。', pt: 'o cão desativou a opção.' },
      { it: "i cani disattivano l'opzione.", fr: "les chiens désactivent l'option.", de: 'die Hunde deaktivieren die Option.', es: 'los perros desactivan la opción.', pt: 'os cães desativam a opção.' }],
  ])('%s', (verb, object, present, past, plural) => {
    expect(acts(np('DOG'), verb, object)).toEqual(present);
    expect(acts(np('DOG'), verb, object, { tense: 'past' })).toEqual(past);
    expect(acts(np('DOG', { number: 'plural' }), verb, object)).toMatchObject(plural);
  });

  test('the future', () => {
    expect(acts(np('DOG'), 'CLOSE', 'BOOK', { tense: 'future' })).toMatchObject({
      en: 'the dog will close the book.', it: 'il cane chiuderà il libro.', fr: 'le chien fermera le livre.',
      de: 'der Hund wird das Buch schließen.', es: 'el perro cerrará el libro.', pt: 'o cão fechará o livro.',
    });
    expect(acts(np('DOG'), 'RETRY', 'ACTION', { tense: 'future' })).toMatchObject({
      fr: "le chien réessaiera l'action.", es: 'el perro reintentará la acción.', pt: 'o cão repetirá a ação.',
    });
    expect(acts(np('DOG'), 'MOVE', 'BOOK', { tense: 'future' })).toMatchObject({ it: 'il cane sposterà il libro.', de: 'der Hund wird das Buch verschieben.' });
  });
});

describe('program verbs: the aspects', () => {
  test('the resultative takes each language’s participle', () => {
    expect(acts(np('CAT'), 'CLOSE', 'BOOK', { aspect: 'resultative' })).toEqual({
      en: 'the cat has closed the book.',
      it: 'il gatto ha chiuso il libro.',
      fr: 'le chat a fermé le livre.',
      de: 'der Kater hat das Buch geschlossen.',
      es: 'el gato ha cerrado el libro.',
      ja: '猫は本を閉じてしまいます。',
      pt: 'o gato fechou o livro.', // pt present resultative is the pretérito (documented)
    });
    expect(acts(np('CAT'), 'MOVE', 'BOOK', { aspect: 'resultative' })).toMatchObject({
      it: 'il gatto ha spostato il libro.', de: 'der Kater hat das Buch verschoben.', es: 'el gato ha movido el libro.',
    });
    expect(acts(np('CAT'), 'CANCEL', 'PHRASE', { aspect: 'resultative' })).toMatchObject({
      en: 'the cat has canceled the phrase.', de: 'der Kater hat die Phrase annulliert.', ja: '猫はフレーズをキャンセルしてしまいます。',
    });
  });

  test('the progressive takes each language’s gerund', () => {
    expect(acts(np('CAT'), 'USE', 'STICK', { aspect: 'progressive' })).toEqual({
      en: 'the cat is using the stick.',
      it: 'il gatto sta usando il bastone.',
      fr: "le chat est en train d'utiliser le bâton.",
      de: 'der Kater verwendet gerade den Stock.',
      es: 'el gato está usando el palo.',
      ja: '猫は棒を使っています。',
      pt: 'o gato está usando o pau.',
    });
    expect(acts(np('CAT'), 'TURN_OFF', 'OPTION', { aspect: 'progressive' })).toMatchObject({
      en: 'the cat is turning off the option.', it: "il gatto sta disattivando l'opzione.", pt: 'o gato está desativando a opção.',
    });
  });
});

describe('program verbs: commands and instructions', () => {
  test('a command to one, to us, and a negative one', () => {
    expect(command(YOU, 'CLOSE', 'BOOK')).toEqual({
      en: 'close the book.',
      it: 'chiudi il libro.',
      fr: 'ferme le livre.',
      de: 'schließ das Buch.',
      es: 'cierra el libro.',
      ja: '本を閉じてください。',
      pt: 'feche o livro.',
    });
    expect(command(WE, 'MOVE', 'BOOK')).toMatchObject({
      en: "let's move the book.", it: 'spostiamo il libro.', de: 'verschieben wir das Buch.', es: 'movamos el libro.', pt: 'movamos o livro.',
    });
    expect(command(YOU, 'RETRY', 'ACTION', {}, true)).toMatchObject({
      it: "non riprovare l'azione.", fr: "ne réessaie pas l'action.", de: 'wiederhole die Handlung nicht.', es: 'no reintentes la acción.', pt: 'não repita a ação.',
    });
  });

  // A button's instruction: Japanese labels with the verbal noun (キャンセル, 使用), but a close button
  // says the dictionary form 閉じる.
  test('the instruction a control is labelled with', () => {
    const instruction = (verb: string, object: string) => command(YOU, verb, object, { imperativeRegister: 'instruction' });
    expect(instruction('CANCEL', 'PHRASE')).toEqual({
      en: 'cancel the phrase.', it: 'annulla la frase.', fr: 'annuler la phrase.', de: 'die Phrase annullieren.',
      es: 'cancelar la frase.', ja: 'フレーズをキャンセル。', pt: 'cancelar a frase.',
    });
    expect(instruction('CLOSE', 'BOOK')).toMatchObject({ ja: '本を閉じる。' });
    expect(instruction('RETRY', 'ACTION')).toMatchObject({ ja: '動作を再試行。', pt: 'repetir a ação.' });
    expect(instruction('USE', 'STICK')).toMatchObject({ ja: '棒を使用。', de: 'den Stock verwenden.' });
    expect(instruction('COPY', 'TRANSLATION')).toMatchObject({ ja: '翻訳をコピー。' });
    expect(instruction('MOVE', 'BOOK')).toMatchObject({ ja: '本を移動。' });
    expect(instruction('RESIZE', 'CONTAINER')).toMatchObject({ ja: '容器をサイズ変更。', de: 'den Behälter skalieren.' });
    expect(instruction('TURN_OFF', 'OPTION')).toMatchObject({ ja: '選択肢をオフに。', fr: "désactiver l'option." });
  });
});

describe('program nouns', () => {
  const said = (concept: string, extra: Partial<NounPhrase>) => sayAll({ subject: np(concept, extra) });

  test.each<[string, Record<string, string>, Record<string, string>]>([
    ['NAME_NOUN',
      { en: 'a name.', it: 'un nome.', fr: 'un nom.', de: 'ein Name.', es: 'un nombre.', ja: '名前。', pt: 'um nome.' },
      { en: 'the names.', it: 'i nomi.', fr: 'les noms.', de: 'die Namen.', es: 'los nombres.', ja: '名前。', pt: 'os nomes.' }],
    ['INTERFACE',
      { en: 'an interface.', it: "un'interfaccia.", fr: 'une interface.', de: 'ein Interface.', es: 'una interfaz.', ja: 'インターフェース。', pt: 'uma interface.' },
      { en: 'the interfaces.', it: 'le interfacce.', fr: 'les interfaces.', de: 'die Interfaces.', es: 'las interfaces.', ja: 'インターフェース。', pt: 'as interfaces.' }],
    ['RESULT',
      { en: 'a result.', it: 'un risultato.', fr: 'un résultat.', de: 'ein Ergebnis.', es: 'un resultado.', ja: '結果。', pt: 'um resultado.' },
      { en: 'the results.', it: 'i risultati.', fr: 'les résultats.', de: 'die Ergebnisse.', es: 'los resultados.', ja: '結果。', pt: 'os resultados.' }],
    ['IMPORT_NOUN',
      { en: 'an import.', it: "un'importazione.", fr: 'une importation.', de: 'ein Import.', es: 'una importación.', ja: '取り込み。', pt: 'uma importação.' },
      { en: 'the imports.', it: 'le importazioni.', fr: 'les importations.', de: 'die Importe.', es: 'las importaciones.', ja: '取り込み。', pt: 'as importações.' }],
    ['ICON',
      { en: 'an icon.', it: "un'icona.", fr: 'une icône.', de: 'ein Symbol.', es: 'un icono.', ja: 'アイコン。', pt: 'um ícone.' },
      { en: 'the icons.', it: 'le icone.', fr: 'les icônes.', de: 'die Symbole.', es: 'los iconos.', ja: 'アイコン。', pt: 'os ícones.' }],
    ['FILE',
      { en: 'a file.', it: 'un file.', fr: 'un fichier.', de: 'eine Datei.', es: 'un archivo.', ja: 'ファイル。', pt: 'um arquivo.' },
      { en: 'the files.', it: 'i file.', fr: 'les fichiers.', de: 'die Dateien.', es: 'los archivos.', ja: 'ファイル。', pt: 'os arquivos.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'indefinite' })).toEqual(singular);
    expect(said(concept, { number: 'plural' })).toEqual(plural);
  });

  // A process noun: uncountable, so it never pluralises and takes the mass partitive.
  test('LOADING is a mass noun', () => {
    expect(said('LOADING', { number: 'plural' })).toEqual({
      en: 'the loading.', it: 'il caricamento.', fr: 'le chargement.', de: 'das Laden.', es: 'la carga.', ja: '読み込み。', pt: 'o carregamento.',
    });
    expect(said('LOADING', { definiteness: 'some' })).toMatchObject({ en: 'some loading.', it: 'del caricamento.', fr: 'du chargement.', es: 'algo de carga.' });
  });

  // German Name is a weak noun: den Namen, dem Namen.
  test('German NAME_NOUN declines weak', () => {
    expect(sayAll(clause(np('BOY'), 'SEE', { directObject: np('NAME_NOUN') })).de).toBe('der Junge sieht den Namen.');
    expect(sayAll(clause(np('BOY'), 'START', { complements: { instrumental: { phrase: np('NAME_NOUN') } } })).de)
      .toBe('der Junge beginnt mit dem Namen.');
  });
});

describe('what happened to a saved item', () => {
  const phrase = (adjective: string, extra: Partial<NounPhrase> = {}) =>
    sayAll({ subject: np('PHRASE', { adjectives: [adjective], ...extra }) });
  const predicate = (adjective: string) =>
    sayAll(clause(np('PHRASE'), 'BE', { complements: { predicative: { phrase: { concept: adjective } } } }));

  test('each agrees with a feminine noun, in both numbers', () => {
    expect(phrase('ADDED', { definiteness: 'bare' })).toEqual({
      en: 'added phrase.', it: 'frase aggiunta.', fr: 'phrase ajoutée.', de: 'hinzugefügte Phrase.', es: 'frase añadida.', ja: '追加済みのフレーズ。', pt: 'frase adicionada.',
    });
    expect(phrase('FAILED', { number: 'plural' })).toEqual({
      en: 'the failed phrases.', it: 'le frasi fallite.', fr: 'les phrases échouées.', de: 'die fehlgeschlagenen Phrasen.', es: 'las frases fallidas.', ja: '失敗したフレーズ。', pt: 'as frases malsucedidas.',
    });
    expect(phrase('COPIED', { number: 'plural' })).toMatchObject({ it: 'le frasi copiate.', fr: 'les phrases copiées.', ja: 'コピー済みのフレーズ。' });
    expect(phrase('EMPTY', { number: 'plural' })).toMatchObject({ it: 'le frasi vuote.', es: 'las frases vacías.', de: 'die leeren Phrasen.' });
    expect(phrase('VALID', { number: 'plural' })).toMatchObject({ it: 'le frasi valide.', es: 'las frases válidas.', ja: '有効なフレーズ。' });
    // -e and -ant adjectives: Italian and Spanish mark only the number, French adds -e for the feminine.
    expect(phrase('MISSING', { definiteness: 'bare' })).toEqual({
      en: 'missing phrase.', it: 'frase mancante.', fr: 'phrase manquante.', de: 'fehlende Phrase.', es: 'frase faltante.', ja: '見つからないフレーズ。', pt: 'frase faltante.',
    });
    expect(phrase('MISSING', { number: 'plural' })).toEqual({
      en: 'the missing phrases.', it: 'le frasi mancanti.', fr: 'les phrases manquantes.', de: 'die fehlenden Phrasen.', es: 'las frases faltantes.', ja: '見つからないフレーズ。', pt: 'as frases faltantes.',
    });
  });

  // "senza titolo" is a prepositional phrase, which does not agree: never "*senza titola".
  test('UNTITLED stays invariable in the Romance languages', () => {
    expect(phrase('UNTITLED', { definiteness: 'bare' })).toEqual({
      en: 'untitled phrase.', it: 'frase senza titolo.', fr: 'phrase sans titre.', de: 'unbenannte Phrase.', es: 'frase sin título.', ja: '無題のフレーズ。', pt: 'frase sem título.',
    });
    expect(phrase('UNTITLED', { number: 'plural' })).toMatchObject({
      it: 'le frasi senza titolo.', fr: 'les phrases sans titre.', es: 'las frases sin título.', pt: 'as frases sem título.', de: 'die unbenannten Phrasen.',
    });
  });

  // A state takes estar in Spanish and Portuguese; being valid is a property, and takes ser.
  test('states and properties as predicates', () => {
    expect(predicate('EMPTY')).toEqual({
      en: 'the phrase is empty.', it: 'la frase è vuota.', fr: 'la phrase est vide.', de: 'die Phrase ist leer.', es: 'la frase está vacía.', ja: 'フレーズは空です。', pt: 'a frase está vazia.',
    });
    expect(predicate('UNTITLED')).toMatchObject({ es: 'la frase está sin título.', pt: 'a frase está sem título.', it: 'la frase è senza titolo.' });
    expect(predicate('ADDED')).toMatchObject({ es: 'la frase está añadida.', ja: 'フレーズは追加済みです。' });
    expect(predicate('VALID')).toMatchObject({ es: 'la frase es válida.', pt: 'a frase é válida.', ja: 'フレーズは有効です。' });
    // Japanese 見つからない inflects as an i-adjective. (German would rather say "die Phrase fehlt" than
    // "ist fehlend", a present participle used as a predicate: not pinned.)
    expect(predicate('MISSING')).toMatchObject({
      it: 'la frase è mancante.', fr: 'la phrase est manquante.', es: 'la frase está faltante.', ja: 'フレーズは見つからないです。', pt: 'a frase está faltante.',
    });
  });

  // A label standing alone agrees with the noun its control is about.
  test('as a label, agreeing with the noun it describes', () => {
    expect(wordAll('COPIED', 'TRANSLATION')).toEqual({ en: 'copied', it: 'copiata', fr: 'copiée', de: 'kopiert', es: 'copiada', ja: 'コピー済み', pt: 'copiada' });
    expect(wordAll('EMPTY', 'SLOT_COMPUTING')).toMatchObject({ it: 'vuoto', fr: 'vide', es: 'vacío', ja: '空' });
  });
});

describe('adverbs of direction: UP and DOWN', () => {
  test('after an intransitive verb', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'UP' } }))).toEqual({
      en: 'the cat runs up.', it: 'il gatto corre su.', fr: 'le chat court vers le haut.', de: 'der Kater läuft nach oben.', es: 'el gato corre arriba.', ja: '猫は上に走ります。', pt: 'o gato corre para cima.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'DOWN' } }))).toEqual({
      en: 'the cat runs down.', it: 'il gatto corre giù.', fr: 'le chat court vers le bas.', de: 'der Kater läuft nach unten.', es: 'el gato corre abajo.', ja: '猫は下に走ります。', pt: 'o gato corre para baixo.',
    });
  });

  test('on a bare instruction, the way the reorder buttons use them', () => {
    expect(sayAll({ ...clause(YOU, 'MOVE', { verbPhrase: { modifier: 'UP' } }), imperative: true, imperativeRegister: 'instruction' })).toEqual({
      en: 'move up.', it: 'sposta su.', fr: 'déplacer vers le haut.', de: 'nach oben verschieben.', es: 'mover arriba.', ja: '上に移動。', pt: 'mover para cima.',
    });
  });
});

// A142. An adverb of direction says where the object ends up, so it follows a noun object as the
// complements do ("move the book up"). The engines place it where a manner adverb goes, between the
// verb and the object, which the Romance languages and German read as wrong or as another sentence
// (it "sposta su il libro" is "move onto the book").
describe('known bugs: an adverb of direction before a noun object', () => {
  const movesUp = () => sayAll(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'UP' } }));

  test('follows the object in Italian, French, German, Spanish and Portuguese', () => {
    expect(movesUp()).toMatchObject({
      it: 'il gatto sposta il libro su.',
      fr: 'le chat déplace le livre vers le haut.',
      de: 'der Kater verschiebt das Buch nach oben.',
      es: 'el gato mueve el libro arriba.',
      pt: 'o gato move o livro para cima.',
    });
  });

  test('regression: English and Japanese already put it after the object', () => {
    expect(movesUp()).toMatchObject({ en: 'the cat moves the book up.', ja: '猫は本を上に移動します。' });
  });

  // The generalisation: it is the slot after the object, so it holds wherever the object goes — under
  // a modal, inside the prospective's zu-group, in a relative clause, and behind a clitic object.
  test('…in a negated clause, where German "nicht" still leads it', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'UP', negative: true } })))
      .toMatchObject({
        it: 'il gatto non sposta il libro su.',
        fr: 'le chat ne déplace pas le livre vers le haut.',
        de: 'der Kater verschiebt das Buch nicht nach oben.',
        es: 'el gato no mueve el libro arriba.',
        pt: 'o gato não move o livro para cima.',
      });
  });

  test('…under a modal, in the prospective, and in a relative clause', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'UP', modals: ['MUST'] } })))
      .toMatchObject({ it: 'il gatto deve spostare il libro su.', de: 'der Kater muss das Buch nach oben verschieben.' });
    expect(sayAll(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'UP', aspect: 'prospective' } })))
      .toMatchObject({
        it: 'il gatto sta per spostare il libro su.',
        de: 'der Kater ist im Begriff, das Buch nach oben zu verschieben.',
      });
    expect(sayAll(clause(np('CAT', { relative: { verbPhrase: { verb: 'MOVE', modifier: 'DOWN' }, directObject: np('BOOK') } }), 'RUN')))
      .toMatchObject({ it: 'il gatto che sposta il libro giù corre.', de: 'der Kater, der das Buch nach unten verschiebt, läuft.' });
  });

  test('…and after a clitic object', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', { directObject: np('THIRD_PERSON', { gender: 'masc' }), verbPhrase: { modifier: 'UP' } })))
      .toMatchObject({
        it: 'il gatto lo sposta su.',
        fr: 'le chat le déplace vers le haut.',
        de: 'der Kater verschiebt ihn nach oben.',
        es: 'el gato lo mueve arriba.',
        pt: 'o gato o move para cima.',
      });
  });

  // Regression: a manner adverb keeps its own slot, which is the one the direction adverb left.
  test('regression: a manner adverb still leads the object', () => {
    expect(sayAll(clause(np('CAT'), 'MOVE', { directObject: np('BOOK'), verbPhrase: { modifier: 'FAST' } })))
      .toMatchObject({
        it: 'il gatto sposta velocemente il libro.',
        fr: 'le chat déplace vite le livre.',
        de: 'der Kater verschiebt schnell das Buch.',
        es: 'el gato mueve rápido el libro.',
        pt: 'o gato move rapidamente o livro.',
        en: 'the cat moves the book fast.',
      });
  });
});
