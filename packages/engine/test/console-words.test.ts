import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll, wordAll } from './harness.js';

// The phrase console's words (localization B45, B46): the lines it runs, pins and recalls, the verbs
// of its keys, and the nouns its reference is organized by. Each is pinned in the paradigm its role
// has, so the console's strings keep the forms they were probed with.

describe('the console’s nouns', () => {
  const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });

  test.each<[string, Record<string, string>, Record<string, string>]>([
    ['LINE',
      { en: 'a line.', it: 'una riga.', fr: 'une ligne.', de: 'eine Zeile.', es: 'una línea.', ja: '行。', pt: 'uma linha.' },
      { en: 'the lines.', it: 'le righe.', fr: 'les lignes.', de: 'die Zeilen.', es: 'las líneas.', ja: '行。', pt: 'as linhas.' }],
    // A multi-word noun in the Romance languages: the article elides before Italian "area".
    ['WORKSPACE',
      { en: 'a workspace.', it: "un'area di lavoro.", fr: 'un espace de travail.', de: 'ein Arbeitsbereich.', es: 'un espacio de trabajo.', ja: 'ワークスペース。', pt: 'um espaço de trabalho.' },
      { en: 'the workspaces.', it: 'le aree di lavoro.', fr: 'les espaces de travail.', de: 'die Arbeitsbereiche.', es: 'los espacios de trabajo.', ja: 'ワークスペース。', pt: 'os espaços de trabalho.' }],
    ['EXAMPLE',
      { en: 'an example.', it: 'un esempio.', fr: 'un exemple.', de: 'ein Beispiel.', es: 'un ejemplo.', ja: '例。', pt: 'um exemplo.' },
      { en: 'the examples.', it: 'gli esempi.', fr: 'les exemples.', de: 'die Beispiele.', es: 'los ejemplos.', ja: '例。', pt: 'os exemplos.' }],
    // German declines the Latin word: die Modi.
    ['MOOD',
      { en: 'a mood.', it: 'un modo.', fr: 'un mode.', de: 'ein Modus.', es: 'un modo.', ja: '叙法。', pt: 'um modo.' },
      { en: 'the moods.', it: 'i modi.', fr: 'les modes.', de: 'die Modi.', es: 'los modos.', ja: '叙法。', pt: 'os modos.' }],
    ['STATEMENT',
      { en: 'a statement.', it: 'una proposizione enunciativa.', fr: 'une phrase déclarative.', de: 'ein Aussagesatz.', es: 'una oración enunciativa.', ja: '平叙文。', pt: 'uma frase declarativa.' },
      { en: 'the statements.', it: 'le proposizioni enunciative.', fr: 'les phrases déclaratives.', de: 'die Aussagesätze.', es: 'las oraciones enunciativas.', ja: '平叙文。', pt: 'as frases declarativas.' }],
    ['POSITIVE_DEGREE',
      { en: 'a positive degree.', it: 'un grado positivo.', fr: 'un degré positif.', de: 'ein Positiv.', es: 'un grado positivo.', ja: '原級。', pt: 'um grau normal.' },
      { en: 'the positive degrees.', it: 'i gradi positivi.', fr: 'les degrés positifs.', de: 'die Positive.', es: 'los grados positivos.', ja: '原級。', pt: 'os graus normais.' }],
    // Invariable in Italian, French and Spanish; German Aliasse.
    ['ALIAS',
      { en: 'an alias.', it: 'un alias.', fr: 'un alias.', de: 'ein Alias.', es: 'un alias.', ja: '別名。', pt: 'um alias.' },
      { en: 'the aliases.', it: 'gli alias.', fr: 'les alias.', de: 'die Aliasse.', es: 'los alias.', ja: '別名。', pt: 'os aliases.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'indefinite' })).toEqual(singular);
    expect(said(concept, { number: 'plural' })).toEqual(plural);
  });

  // The German genitive of each: the Latin Modus and the loan Alias take no -s, the others do.
  test('German genitives', () => {
    const genitive = (concept: string) =>
      sayAll({ subject: np('NAME_NOUN', { possessor: np(concept, { definiteness: 'definite' }) }) }).de;
    expect(genitive('MOOD')).toBe('der Name des Modus.');
    expect(genitive('ALIAS')).toBe('der Name des Alias.');
    expect(genitive('WORKSPACE')).toBe('der Name des Arbeitsbereichs.');
    expect(genitive('POSITIVE_DEGREE')).toBe('der Name des Positivs.');
    expect(genitive('STATEMENT')).toBe('der Name des Aussagesatzes.');
  });

  // Mass nouns, which never pluralise. French "historique" opens on an h muet, so it elides.
  test('HISTORY and USAGE are mass nouns', () => {
    expect(said('HISTORY', { number: 'plural' })).toEqual({
      en: 'the history.', it: 'la cronologia.', fr: "l'historique.", de: 'der Verlauf.', es: 'el historial.', ja: '履歴。', pt: 'o histórico.',
    });
    expect(said('HISTORY', { definiteness: 'some' })).toMatchObject({ it: 'della cronologia.', fr: "de l'historique.", es: 'algo de historial.' });
    expect(said('USAGE', { number: 'plural' })).toEqual({
      en: 'the usage.', it: "l'uso.", fr: "l'utilisation.", de: 'die Verwendung.', es: 'el uso.', ja: '使用法。', pt: 'o uso.',
    });
  });
});

describe('the console’s verbs', () => {
  const acts = (verb: string, verbPhrase: Partial<VerbPhrase> = {}, subject = np('DOG'), object = np('LINE')) =>
    sayAll(clause(subject, verb, { directObject: object, verbPhrase }));

  // German anheften and anwenden are separable: the particle closes a main clause and rejoins the verb
  // in a subordinate one. lösen and vervollständigen are not.
  test.each<[string, Record<string, string>, Record<string, string>]>([
    ['PIN',
      { en: 'the dog pins the line.', it: 'il cane fissa la riga.', fr: 'le chien épingle la ligne.', de: 'der Hund heftet die Zeile an.', es: 'el perro fija la línea.', ja: '犬は行をピン留めします。', pt: 'o cão fixa a linha.' },
      { en: 'the dogs pinned the line.', it: 'i cani fissarono la riga.', fr: 'les chiens épinglèrent la ligne.', de: 'die Hunde hefteten die Zeile an.', es: 'los perros fijaron la línea.', ja: '犬は行をピン留めしました。', pt: 'os cães fixaram a linha.' }],
    ['UNPIN',
      { en: 'the dog unpins the line.', it: 'il cane sblocca la riga.', fr: 'le chien désépingle la ligne.', de: 'der Hund löst die Zeile.', es: 'el perro desfija la línea.', ja: '犬は行をピン留め解除します。', pt: 'o cão desafixa a linha.' },
      { en: 'the dogs unpinned the line.', it: 'i cani sbloccarono la riga.', fr: 'les chiens désépinglèrent la ligne.', de: 'die Hunde lösten die Zeile.', es: 'los perros desfijaron la línea.', ja: '犬は行をピン留め解除しました。', pt: 'os cães desafixaram a linha.' }],
    ['COMPLETE',
      { en: 'the dog completes the line.', it: 'il cane completa la riga.', fr: 'le chien complète la ligne.', de: 'der Hund vervollständigt die Zeile.', es: 'el perro completa la línea.', ja: '犬は行を補完します。', pt: 'o cão completa a linha.' },
      { en: 'the dogs completed the line.', it: 'i cani completarono la riga.', fr: 'les chiens complétèrent la ligne.', de: 'die Hunde vervollständigten die Zeile.', es: 'los perros completaron la línea.', ja: '犬は行を補完しました。', pt: 'os cães completaram a linha.' }],
    ['APPLY',
      { en: 'the dog applies the line.', it: 'il cane applica la riga.', fr: 'le chien applique la ligne.', de: 'der Hund wendet die Zeile an.', es: 'el perro aplica la línea.', ja: '犬は行を適用します。', pt: 'o cão aplica a linha.' },
      { en: 'the dogs applied the line.', it: 'i cani applicarono la riga.', fr: 'les chiens appliquèrent la ligne.', de: 'die Hunde wandten die Zeile an.', es: 'los perros aplicaron la línea.', ja: '犬は行を適用しました。', pt: 'os cães aplicaram a linha.' }],
  ])('%s: present and past', (verb, present, past) => {
    expect(acts(verb)).toEqual(present);
    expect(acts(verb, { tense: 'past' }, np('DOG', { number: 'plural' }))).toEqual(past);
  });

  test('the future, the resultative and the passive take each language’s forms', () => {
    expect(acts('PIN', { tense: 'future' }, np('DOG'), np('LINE', { number: 'plural' }))).toEqual({
      en: 'the dog will pin the lines.', it: 'il cane fisserà le righe.', fr: 'le chien épinglera les lignes.', de: 'der Hund wird die Zeilen anheften.',
      es: 'el perro fijará las líneas.', ja: '犬は行をピン留めします。', pt: 'o cão fixará as linhas.',
    });
    expect(acts('UNPIN', { tense: 'future' }, np('DOG'), np('LINE', { number: 'plural' }))).toMatchObject({
      it: 'il cane sbloccherà le righe.', fr: 'le chien désépinglera les lignes.', es: 'el perro desfijará las líneas.', pt: 'o cão desafixará as linhas.',
    });
    expect(acts('APPLY', { aspect: 'resultative' })).toEqual({
      en: 'the dog has applied the line.', it: 'il cane ha applicato la riga.', fr: 'le chien a appliqué la ligne.', de: 'der Hund hat die Zeile angewandt.',
      es: 'el perro ha aplicado la línea.', ja: '犬は行を適用しました。', pt: 'o cão aplicou a linha.',
    });
    expect(acts('PIN', { aspect: 'resultative' })).toMatchObject({ de: 'der Hund hat die Zeile angeheftet.', fr: 'le chien a épinglé la ligne.' });
    expect(acts('UNPIN', { aspect: 'resultative' })).toMatchObject({ de: 'der Hund hat die Zeile gelöst.', it: 'il cane ha sbloccato la riga.' });
    expect(acts('COMPLETE', { voice: 'passive' })).toEqual({
      en: 'the line is completed by the dog.', it: 'la riga è completata dal cane.', fr: 'la ligne est complétée par le chien.',
      de: 'die Zeile wird vom Hund vervollständigt.', es: 'la línea es completada por el perro.', ja: '行は犬に補完されます。', pt: 'a linha é completada pelo cão.',
    });
    expect(acts('UNPIN', { aspect: 'progressive', negative: true })).toMatchObject({
      it: 'il cane non sta sbloccando la riga.', es: 'el perro no está desfijando la línea.', ja: '犬は行をピン留め解除していません。',
    });
  });

  test('the imperative, and the separable particle in a relative clause', () => {
    const command = (verb: string) => sayAll({ ...clause(np('SECOND_PERSON'), verb, { directObject: np('LINE') }), imperative: true });
    expect(command('PIN')).toEqual({
      en: 'pin the line.', it: 'fissa la riga.', fr: 'épingle la ligne.', de: 'hefte die Zeile an.', es: 'fija la línea.', ja: '行をピン留めしてください。', pt: 'fixe a linha.',
    });
    expect(command('APPLY')).toMatchObject({ de: 'wende die Zeile an.', pt: 'aplique a linha.' });
    expect(command('UNPIN')).toMatchObject({ de: 'löse die Zeile.', fr: 'désépingle la ligne.' });
    const relative = (verb: string) =>
      sayAll({
        subject: np('LINE', { relative: { headRole: 'directObject', subject: np('DOG'), verbPhrase: { verb } } }),
        verbPhrase: { verb: 'RUN' },
      } as PhrasePlan);
    expect(relative('PIN')).toEqual({
      en: 'the line that the dog pins runs.', it: 'la riga che il cane fissa corre.', fr: 'la ligne que le chien épingle court.',
      de: 'die Zeile, die der Hund anheftet, läuft.', es: 'la línea que el perro fija corre.', ja: '犬がピン留めする行は走ります。',
      pt: 'a linha que o cão fixa corre.',
    });
    expect(relative('APPLY').de).toBe('die Zeile, die der Hund anwendet, läuft.');
  });

  // The labels a control is given: Japanese takes the verbal noun, as ADD does with 追加.
  test('the instruction a key or a button is labelled with', () => {
    const instruction = (verb: string) =>
      sayAll({ ...clause(np('SECOND_PERSON'), verb, { directObject: np('LINE', { definiteness: 'this' }) }), imperative: true, imperativeRegister: 'instruction' });
    expect(instruction('PIN')).toEqual({
      en: 'pin this line.', it: 'fissa questa riga.', fr: 'épingler cette ligne.', de: 'diese Zeile anheften.', es: 'fijar esta línea.', ja: 'この行をピン留め。', pt: 'fixar esta linha.',
    });
    expect(instruction('UNPIN')).toMatchObject({ ja: 'この行をピン留め解除。', de: 'diese Zeile lösen.' });
    expect(instruction('COMPLETE')).toMatchObject({ ja: 'この行を補完。', de: 'diese Zeile vervollständigen.' });
    expect(instruction('APPLY')).toMatchObject({ ja: 'この行を適用。', de: 'diese Zeile anwenden.' });
  });
});

describe('what a console line can be', () => {
  const line = (adjective: string, extra: Partial<NounPhrase> = {}) =>
    sayAll({ subject: np('LINE', { adjectives: [adjective], definiteness: 'indefinite', ...extra }) });
  const books = (adjective: string) => sayAll({ subject: np('BOOK', { adjectives: [adjective], number: 'plural' }) });
  const predicate = (adjective: string, subject = np('LINE')) =>
    sayAll(clause(subject, 'BE', { complements: { predicative: { phrase: { concept: adjective } } } }));

  // Each agrees with a feminine noun and a masculine plural. The multi-word "non più fissato" and
  // "nicht mehr angeheftet" inflect on their last word.
  test('agreement', () => {
    expect(line('PINNED')).toEqual({
      en: 'a pinned line.', it: 'una riga fissata.', fr: 'une ligne épinglée.', de: 'eine angeheftete Zeile.', es: 'una línea fijada.', ja: 'ピン留め済みの行。', pt: 'uma linha fixada.',
    });
    expect(line('UNPINNED')).toEqual({
      en: 'an unpinned line.', it: 'una riga non più fissata.', fr: 'une ligne désépinglée.', de: 'eine nicht mehr angeheftete Zeile.', es: 'una línea desfijada.', ja: 'ピン留め解除済みの行。', pt: 'uma linha desafixada.',
    });
    expect(line('RECENT')).toEqual({
      en: 'a recent line.', it: 'una riga recente.', fr: 'une ligne récente.', de: 'eine zuletzt verwendete Zeile.', es: 'una línea reciente.', ja: '最近使用された行。', pt: 'uma linha recente.',
    });
    expect(books('PINNED')).toMatchObject({ it: 'i libri fissati.', fr: 'les livres épinglés.', de: 'die angehefteten Bücher.', es: 'los libros fijados.' });
    expect(books('UNPINNED')).toMatchObject({ it: 'i libri non più fissati.', de: 'die nicht mehr angehefteten Bücher.', pt: 'os livros desafixados.' });
    expect(books('RECENT')).toMatchObject({ it: 'i libri recenti.', fr: 'les livres récents.', de: 'die zuletzt verwendeten Bücher.', es: 'los libros recientes.' });
  });

  // PINNED and UNPINNED are states a line is put in (estar); RECENT is a property (ser). Japanese says
  // the participial 最近使用された as a state, 使用されています.
  test('as predicates', () => {
    expect(predicate('PINNED')).toEqual({
      en: 'the line is pinned.', it: 'la riga è fissata.', fr: 'la ligne est épinglée.', de: 'die Zeile ist angeheftet.', es: 'la línea está fijada.', ja: '行はピン留め済みです。', pt: 'a linha está fixada.',
    });
    expect(predicate('UNPINNED')).toMatchObject({ de: 'die Zeile ist nicht mehr angeheftet.', es: 'la línea está desfijada.', ja: '行はピン留め解除済みです。' });
    expect(predicate('RECENT')).toEqual({
      en: 'the line is recent.', it: 'la riga è recente.', fr: 'la ligne est récente.', de: 'die Zeile ist zuletzt verwendet.', es: 'la línea es reciente.', ja: '行は最近使用されています。', pt: 'a linha é recente.',
    });
  });

  // Cited alone, as a row of the console's list says it, agreeing with LINE.
  test('as a label agreeing with LINE', () => {
    expect(wordAll('PINNED', 'LINE')).toEqual({ en: 'pinned', it: 'fissata', fr: 'épinglée', de: 'angeheftet', es: 'fijada', ja: 'ピン留め済み', pt: 'fixada' });
    expect(wordAll('RECENT', 'LINE')).toEqual({ en: 'recent', it: 'recente', fr: 'récente', de: 'zuletzt verwendet', es: 'reciente', ja: '最近使用された', pt: 'recente' });
  });
});

// A time adverb: after the verb in English, before the object in Romance and German, before the verb
// in Japanese. Japanese 今, since 現在 names the present tense.
describe('NOW', () => {
  test('modifies the verb', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { modifier: 'NOW' } }))).toEqual({
      en: 'the cat runs now.', it: 'il gatto corre ora.', fr: 'le chat court maintenant.', de: 'der Kater läuft jetzt.', es: 'el gato corre ahora.', ja: '猫は今走ります。', pt: 'o gato corre agora.',
    });
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('FOOD'), verbPhrase: { modifier: 'NOW' } }))).toMatchObject({
      en: 'the cat eats the food now.', it: 'il gatto mangia ora il cibo.', de: 'der Kater frisst jetzt das Essen.', ja: '猫は食べ物を今食べます。',
    });
    expect(wordAll('NOW')).toEqual({ en: 'now', it: 'ora', fr: 'maintenant', de: 'jetzt', es: 'ahora', ja: '今', pt: 'agora' });
  });
});
