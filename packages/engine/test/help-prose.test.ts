import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, furigana, np, sayAll } from './harness.js';

// The words the help's prose is written with (localization C22): a KEY and the TAB it chooses, the
// NOUN_PHRASE the console's square brackets hold, a key that WORKs where the cursor is, RESTORE for the
// word a second esc gives back, and a line applied AGAIN.

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });

// An instruction, as the catalogue says a control: addressed to nobody.
const instruction = (verb: string, extra: Partial<PhrasePlan> = {}): PhrasePlan => ({
  subject: np('SECOND_PERSON', { definiteness: 'bare' }),
  verbPhrase: { verb },
  imperative: true,
  imperativeRegister: 'instruction',
  ...extra,
});

describe('the nouns', () => {
  // Each in the indefinite, then the definite plural with NEXT agreeing with it: Italian "tasto" is
  // masculine where the others' key is feminine, French "onglet" masculine against "scheda" and
  // "pestaña", German keeps der Tab and its -s plural, and the Romance noun phrase is a "sintagma" whose
  // adjective agrees in the plural (nominali, nominaux, nominales, nominais).
  test.each<[string, Record<string, string>, Record<string, string>]>([
    ['KEY',
      { en: 'a key.', it: 'un tasto.', fr: 'une touche.', de: 'eine Taste.', es: 'una tecla.', ja: 'キー。', pt: 'uma tecla.' },
      { en: 'the next keys.', it: 'i tasti successivi.', fr: 'les touches suivantes.', de: 'die nächsten Tasten.', es: 'las teclas siguientes.', ja: '次のキー。', pt: 'as teclas seguintes.' }],
    ['TAB',
      { en: 'a tab.', it: 'una scheda.', fr: 'un onglet.', de: 'ein Tab.', es: 'una pestaña.', ja: 'タブ。', pt: 'uma aba.' },
      { en: 'the next tabs.', it: 'le schede successive.', fr: 'les onglets suivants.', de: 'die nächsten Tabs.', es: 'las pestañas siguientes.', ja: '次のタブ。', pt: 'as abas seguintes.' }],
    ['NOUN_PHRASE',
      { en: 'a noun phrase.', it: 'un sintagma nominale.', fr: 'un syntagme nominal.', de: 'eine Nominalphrase.', es: 'un sintagma nominal.', ja: '名詞句。', pt: 'um sintagma nominal.' },
      { en: 'the next noun phrases.', it: 'i sintagmi nominali successivi.', fr: 'les syntagmes nominaux suivants.', de: 'die nächsten Nominalphrasen.', es: 'los sintagmas nominales siguientes.', ja: '次の名詞句。', pt: 'os sintagmas nominais seguintes.' }],
  ])('%s', (concept, indefinite, nextPlural) => {
    expect(said(concept, { definiteness: 'indefinite' })).toEqual(indefinite);
    expect(said(concept, { number: 'plural', adjectives: ['NEXT'] })).toEqual(nextPlural);
  });

  test('the keys own a name in the genitive, and the noun phrase is read as one word', () => {
    expect(said('NAME_NOUN', { possessor: np('KEY', { number: 'plural' }) })).toEqual({
      en: "the keys' name.", it: 'il nome dei tasti.', fr: 'le nom des touches.', de: 'der Name der Tasten.',
      es: 'el nombre de las teclas.', ja: 'キーの名前。', pt: 'o nome das teclas.',
    });
    expect(furigana({ subject: np('NOUN_PHRASE') })).toEqual(['めいしく']);
  });
});

// A key's verb, not a person's: ACT is "handeln" and 行動する.
describe('WORK', () => {
  const works = (extra: Parameters<typeof clause>[2] = {}) => sayAll(clause(np('KEY'), 'WORK', extra));

  test('present, past, future, and the first person', () => {
    expect(works()).toEqual({
      en: 'the key works.', it: 'il tasto funziona.', fr: 'la touche fonctionne.', de: 'die Taste funktioniert.',
      es: 'la tecla funciona.', ja: 'キーは動作します。', pt: 'a tecla funciona.',
    });
    expect(works({ verbPhrase: { tense: 'past' } })).toEqual({
      en: 'the key worked.', it: 'il tasto funzionò.', fr: 'la touche fonctionna.', de: 'die Taste funktionierte.',
      es: 'la tecla funcionó.', ja: 'キーは動作しました。', pt: 'a tecla funcionou.',
    });
    expect(sayAll(clause(np('KEY', { number: 'plural' }), 'WORK', { verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the keys will work.', it: 'i tasti funzioneranno.', fr: 'les touches fonctionneront.', de: 'die Tasten werden funktionieren.',
      es: 'las teclas funcionarán.', ja: 'キーは動作します。', pt: 'as teclas funcionarão.',
    });
    expect(sayAll(clause(np('FIRST_PERSON'), 'WORK'))).toEqual({
      en: 'I work.', it: 'funziono.', fr: 'je fonctionne.', de: 'ich funktioniere.', es: 'funciono.', ja: '私は動作します。', pt: 'funciono.',
    });
  });

  // Italian funzionare takes avere, so the feminine subject leaves the participle alone.
  test('negated, and in the compound and progressive aspects', () => {
    expect(works({ verbPhrase: { negative: true } })).toEqual({
      en: 'the key does not work.', it: 'il tasto non funziona.', fr: 'la touche ne fonctionne pas.', de: 'die Taste funktioniert nicht.',
      es: 'la tecla no funciona.', ja: 'キーは動作しません。', pt: 'a tecla não funciona.',
    });
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'WORK', { verbPhrase: { aspect: 'resultative' } }))).toMatchObject({
      it: 'la gatta ha funzionato.', fr: 'la chatte a fonctionné.', de: 'die Katze hat funktioniert.', es: 'la gata ha funcionado.',
    });
    expect(works({ verbPhrase: { aspect: 'progressive' } })).toMatchObject({
      it: 'il tasto sta funzionando.', es: 'la tecla está funcionando.', pt: 'a tecla está funcionando.', ja: 'キーは動作しています。',
    });
  });

  test('everywhere, and in the slot that has the cursor', () => {
    expect(sayAll(clause(np('KEY', { number: 'plural' }), 'WORK', { verbPhrase: { modifier: 'EVERYWHERE' } }))).toEqual({
      en: 'the keys work everywhere.', it: 'i tasti funzionano ovunque.', fr: 'les touches fonctionnent partout.',
      de: 'die Tasten funktionieren überall.', es: 'las teclas funcionan en todas partes.', ja: 'キーはどこでも動作します。',
      pt: 'as teclas funcionam em toda parte.',
    });
    const slot = np('SLOT_COMPUTING', { relative: { verbPhrase: { verb: 'HAVE' }, directObject: np('CURSOR') } });
    expect(works({ complements: { locative: { phrase: slot } } })).toEqual({
      en: 'the key works in the slot that has the cursor.', it: 'il tasto funziona nello slot che ha il cursore.',
      fr: 'la touche fonctionne dans le slot qui a le curseur.', de: 'die Taste funktioniert im Slot, der den Cursor hat.',
      es: 'la tecla funciona en el slot que tiene el cursor.', ja: 'キーはカーソルがあるスロットで動作します。',
      pt: 'a tecla funciona no slot que tem o cursor.',
    });
  });
});

// German zurückholen is separable: its particle closes a main clause, rejoins the verb in a subordinate
// one, and takes the zu inside (zurückzuholen).
describe('RESTORE', () => {
  const restores = (extra: Parameters<typeof clause>[2] = {}) =>
    sayAll(clause(np('CHILD'), 'RESTORE', { directObject: np('BOOK'), ...extra }));

  test('present, past and future', () => {
    expect(restores()).toEqual({
      en: 'the child restores the book.', it: 'il bambino ripristina il libro.', fr: "l'enfant restaure le livre.",
      de: 'das Kind holt das Buch zurück.', es: 'el niño restaura el libro.', ja: '子供は本を復元します。', pt: 'a criança restaura o livro.',
    });
    expect(restores({ verbPhrase: { tense: 'past' } })).toEqual({
      en: 'the child restored the book.', it: 'il bambino ripristinò il libro.', fr: "l'enfant restaura le livre.",
      de: 'das Kind holte das Buch zurück.', es: 'el niño restauró el libro.', ja: '子供は本を復元しました。', pt: 'a criança restaurou o livro.',
    });
    expect(restores({ verbPhrase: { tense: 'future' } })).toMatchObject({
      it: 'il bambino ripristinerà il libro.', fr: "l'enfant restaurera le livre.", de: 'das Kind wird das Buch zurückholen.',
      es: 'el niño restaurará el libro.', pt: 'a criança restaurará o livro.',
    });
  });

  test('the compound past and the passive', () => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), 'RESTORE', { directObject: np('BOOK'), verbPhrase: { aspect: 'resultative' } }))).toMatchObject({
      it: 'la gatta ha ripristinato il libro.', fr: 'la chatte a restauré le livre.', de: 'die Katze hat das Buch zurückgeholt.',
      es: 'la gata ha restaurado el libro.', pt: 'a gata restaurou o livro.',
    });
    expect(restores({ verbPhrase: { voice: 'passive' } })).toEqual({
      en: 'the book is restored by the child.', it: 'il libro è ripristinato dal bambino.', fr: "le livre est restauré par l'enfant.",
      de: 'das Buch wird vom Kind zurückgeholt.', es: 'el libro es restaurado por el niño.', ja: '本は子供に復元されます。',
      pt: 'o livro é restaurado pela criança.',
    });
  });

  test('in a relative clause, a purpose clause and a command', () => {
    expect(sayAll(clause(np('CHILD', { relative: { verbPhrase: { verb: 'RESTORE' }, directObject: np('BOOK') } }), 'RUN'))).toMatchObject({
      de: 'das Kind, das das Buch zurückholt, läuft.', ja: '本を復元する子供は走ります。', it: 'il bambino che ripristina il libro corre.',
    });
    expect(sayAll(clause(np('CHILD'), 'RUN', { purpose: { verbPhrase: { verb: 'RESTORE' }, directObject: np('BOOK') } }))).toMatchObject({
      de: 'das Kind läuft, um das Buch zurückzuholen.', ja: '子供は本を復元するために走ります。', fr: "l'enfant court pour restaurer le livre.",
    });
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'RESTORE', { directObject: np('BOOK') }), imperative: true })).toEqual({
      en: 'restore the book.', it: 'ripristina il libro.', fr: 'restaure le livre.', de: 'hole das Buch zurück.',
      es: 'restaura el libro.', ja: '本を復元してください。', pt: 'restaure o livro.',
    });
    expect(sayAll(instruction('RESTORE', { directObject: np('WORD') }))).toEqual({
      en: 'restore the word.', it: 'ripristina la parola.', fr: 'restaurer le mot.', de: 'das Wort zurückholen.',
      es: 'restaurar la palabra.', ja: '単語を復元。', pt: 'restaurar a palavra.',
    });
  });
});

// A manner-position adverb, like REPEATEDLY: after the verb, ahead of the object in the Romance
// languages and German, and ahead of the predicate in Japanese.
describe('AGAIN', () => {
  test('with an object, without one, and negated', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('MOUSE'), verbPhrase: { modifier: 'AGAIN' } }))).toEqual({
      en: 'the cat eats the mouse again.', it: 'il gatto mangia di nuovo il topo.', fr: 'le chat mange de nouveau la souris.',
      de: 'der Kater frisst erneut die Maus.', es: 'el gato come de nuevo el ratón.', ja: '猫はネズミをもう一度食べます。',
      pt: 'o gato come de novo o rato.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'AGAIN' } }))).toEqual({
      en: 'the cat runs again.', it: 'il gatto corre di nuovo.', fr: 'le chat court de nouveau.', de: 'der Kater läuft erneut.',
      es: 'el gato corre de nuevo.', ja: '猫はもう一度走ります。', pt: 'o gato corre de novo.',
    });
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'AGAIN', negative: true } }))).toMatchObject({
      it: 'il gatto non corre di nuovo.', fr: 'le chat ne court pas de nouveau.', de: 'der Kater läuft nicht erneut.',
    });
  });

  // The help's "a line that is applied again": an agentless passive in an object relative.
  test('in a passive relative clause', () => {
    expect(sayAll(clause(
      np('LINE', {
        definiteness: 'indefinite',
        relative: {
          headRole: 'directObject',
          subject: np('GENERIC_PERSON'),
          verbPhrase: { verb: 'APPLY', voice: 'passive', modifier: 'AGAIN' },
        },
      }),
      'CHANGE',
      { directObject: np('PERIOD_SENTENCE'), verbPhrase: { negative: true } },
    ))).toEqual({
      en: 'a line that is applied again does not change the period.',
      it: 'una riga che è applicata di nuovo non cambia il periodo.',
      fr: 'une ligne qui est appliquée de nouveau ne change pas la période.',
      de: 'eine Zeile, die erneut angewandt wird, ändert das Satzgefüge nicht.',
      es: 'una línea que es aplicada de nuevo no cambia el período.',
      ja: 'もう一度適用される行は文を変えません。',
      pt: 'uma linha que é aplicada de novo não muda o período.',
    });
  });
});
