import { describe, expect, test } from 'vitest';
import { UI_STRINGS } from '@signi/shared';
import type { NounElement, PhrasePlan, UiStringDef, UiStringFormat, UiStringPlanDef, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll, wordAll } from './harness.js';

// What the phrase console says is wrong with a line (localization C21): the words its diagnostics
// needed — UNKNOWN, UNEXPECTED, TEXT, REFERENCE, ALREADY, ACCEPT and OPEN — and the diagnostics
// themselves, as the catalogue plans them (`diagnostic.*`).

const acts = (subject: NounElement, verb: string, object: NounElement, verbPhrase: Partial<VerbPhrase> = {}) =>
  sayAll(clause(subject, verb, { directObject: object, verbPhrase }));
const command = (verb: string, object: NounElement, extra: Partial<PhrasePlan> = {}) =>
  sayAll({ ...clause(np('SECOND_PERSON'), verb, { directObject: object }), imperative: true, ...extra });
const INSTRUCTION: Partial<PhrasePlan> = { imperativeRegister: 'instruction' };
const is = (subject: NounElement, predicate: string) =>
  sayAll(clause(subject, 'BE', { complements: { predicative: { phrase: { concept: predicate } } } }));

// ACCEPT is the licensing sense a grammar and a program share: a command accepts no word, a verb no
// object. Japanese 受け付ける is ichidan; Portuguese aceitar has two participles, aceitado after ter and
// the short aceite with ser (EP).
describe('ACCEPT: to take what is offered as valid', () => {
  const FOOD = np('FOOD');

  test('present, past, future, the plural and the 1st singular', () => {
    expect(acts(np('DOG'), 'ACCEPT', FOOD)).toEqual({
      en: 'the dog accepts the food.', it: 'il cane accetta il cibo.', fr: 'le chien accepte la nourriture.',
      de: 'der Hund akzeptiert das Essen.', es: 'el perro acepta la comida.', ja: '犬は食べ物を受け付けます。',
      pt: 'o cão aceita a comida.',
    });
    expect(acts(np('DOG', { number: 'plural' }), 'ACCEPT', FOOD, { tense: 'past' })).toEqual({
      en: 'the dogs accepted the food.', it: 'i cani accettarono il cibo.', fr: 'les chiens acceptèrent la nourriture.',
      de: 'die Hunde akzeptierten das Essen.', es: 'los perros aceptaron la comida.', ja: '犬は食べ物を受け付けました。',
      pt: 'os cães aceitaram a comida.',
    });
    expect(acts(np('DOG'), 'ACCEPT', FOOD, { tense: 'future' })).toEqual({
      en: 'the dog will accept the food.', it: 'il cane accetterà il cibo.', fr: 'le chien acceptera la nourriture.',
      de: 'der Hund wird das Essen akzeptieren.', es: 'el perro aceptará la comida.', ja: '犬は食べ物を受け付けます。',
      pt: 'o cão aceitará a comida.',
    });
    expect(acts(np('FIRST_PERSON'), 'ACCEPT', FOOD)).toMatchObject({
      it: 'accetto il cibo.', fr: "j'accepte la nourriture.", de: 'ich akzeptiere das Essen.', es: 'acepto la comida.',
      pt: 'aceito a comida.',
    });
  });

  test('the aspects, the negative and the passive', () => {
    expect(acts(np('DOG'), 'ACCEPT', FOOD, { aspect: 'resultative' })).toEqual({
      en: 'the dog has accepted the food.', it: 'il cane ha accettato il cibo.', fr: 'le chien a accepté la nourriture.',
      de: 'der Hund hat das Essen akzeptiert.', es: 'el perro ha aceptado la comida.', ja: '犬は食べ物を受け付けました。',
      pt: 'o cão aceitou a comida.',
    });
    expect(acts(np('DOG'), 'ACCEPT', FOOD, { aspect: 'progressive' })).toMatchObject({
      en: 'the dog is accepting the food.', it: 'il cane sta accettando il cibo.', es: 'el perro está aceptando la comida.',
      ja: '犬は食べ物を受け付けています。', pt: 'o cão está aceitando a comida.',
    });
    expect(acts(np('DOG'), 'ACCEPT', FOOD, { negative: true })).toMatchObject({
      fr: "le chien n'accepte pas la nourriture.", de: 'der Hund akzeptiert das Essen nicht.', ja: '犬は食べ物を受け付けません。',
    });
    expect(acts(np('DOG'), 'ACCEPT', FOOD, { voice: 'passive' })).toEqual({
      en: 'the food is accepted by the dog.', it: 'il cibo è accettato dal cane.', fr: 'la nourriture est acceptée par le chien.',
      de: 'das Essen wird vom Hund akzeptiert.', es: 'la comida es aceptada por el perro.', ja: '食べ物は犬に受け付けられます。',
      pt: 'a comida é aceite pelo cão.',
    });
  });

  test('a command, and an instruction', () => {
    expect(command('ACCEPT', FOOD)).toEqual({
      en: 'accept the food.', it: 'accetta il cibo.', fr: 'accepte la nourriture.', de: 'akzeptiere das Essen.',
      es: 'acepta la comida.', ja: '食べ物を受け付けてください。', pt: 'aceite a comida.',
    });
    expect(command('ACCEPT', FOOD, INSTRUCTION)).toMatchObject({
      fr: 'accepter la nourriture.', de: 'das Essen akzeptieren.', es: 'aceptar la comida.', pt: 'aceitar a comida.',
    });
  });
});

// OPEN is CLOSE's opposite. Its participles are irregular everywhere but in English and German
// (aperto, ouvert, abierto, aberto), and Japanese 開く is godan (開いて, 開かない, 開かれる); on a control it
// says the dictionary form, as CLOSE's 閉じる does.
describe('OPEN: to make something no longer closed', () => {
  const BOOK = np('BOOK');

  test('present, past, future and the 1st singular', () => {
    expect(acts(np('CAT'), 'OPEN', BOOK)).toEqual({
      en: 'the cat opens the book.', it: 'il gatto apre il libro.', fr: 'le chat ouvre le livre.',
      de: 'der Kater öffnet das Buch.', es: 'el gato abre el libro.', ja: '猫は本を開きます。', pt: 'o gato abre o livro.',
    });
    expect(acts(np('CAT', { number: 'plural' }), 'OPEN', BOOK, { tense: 'past' })).toEqual({
      en: 'the cats opened the book.', it: 'i gatti aprirono il libro.', fr: 'les chats ouvrirent le livre.',
      de: 'die Kater öffneten das Buch.', es: 'los gatos abrieron el libro.', ja: '猫は本を開きました。',
      pt: 'os gatos abriram o livro.',
    });
    expect(acts(np('CAT'), 'OPEN', BOOK, { tense: 'future' })).toMatchObject({
      it: 'il gatto aprirà il libro.', fr: 'le chat ouvrira le livre.', de: 'der Kater wird das Buch öffnen.',
      es: 'el gato abrirá el libro.', pt: 'o gato abrirá o livro.',
    });
    expect(acts(np('FIRST_PERSON'), 'OPEN', BOOK)).toMatchObject({
      it: 'apro il libro.', fr: "j'ouvre le livre.", de: 'ich öffne das Buch.', es: 'abro el libro.', pt: 'abro o livro.',
    });
  });

  test('the irregular participles, the progressive and the negative', () => {
    expect(acts(np('CAT', { gender: 'fem' }), 'OPEN', BOOK, { aspect: 'resultative' })).toEqual({
      en: 'the cat has opened the book.', it: 'la gatta ha aperto il libro.', fr: 'la chatte a ouvert le livre.',
      de: 'die Katze hat das Buch geöffnet.', es: 'la gata ha abierto el libro.', ja: '猫は本を開きました。',
      pt: 'a gata abriu o livro.',
    });
    expect(acts(np('CAT'), 'OPEN', BOOK, { voice: 'passive' })).toEqual({
      en: 'the book is opened by the cat.', it: 'il libro è aperto dal gatto.', fr: 'le livre est ouvert par le chat.',
      de: 'das Buch wird vom Kater geöffnet.', es: 'el libro es abierto por el gato.', ja: '本は猫に開かれます。',
      pt: 'o livro é aberto pelo gato.',
    });
    expect(acts(np('CAT'), 'OPEN', BOOK, { aspect: 'progressive' })).toMatchObject({
      it: 'il gatto sta aprendo il libro.', es: 'el gato está abriendo el libro.', ja: '猫は本を開いています。',
      pt: 'o gato está abrindo o livro.',
    });
    expect(acts(np('CAT'), 'OPEN', BOOK, { negative: true })).toMatchObject({
      fr: "le chat n'ouvre pas le livre.", de: 'der Kater öffnet das Buch nicht.', ja: '猫は本を開きません。',
    });
  });

  test('a command, and an instruction in the dictionary form', () => {
    expect(command('OPEN', BOOK)).toEqual({
      en: 'open the book.', it: 'apri il libro.', fr: 'ouvre le livre.', de: 'öffne das Buch.',
      es: 'abre el libro.', ja: '本を開いてください。', pt: 'abra o livro.',
    });
    expect(command('OPEN', BOOK, INSTRUCTION)).toEqual({
      en: 'open the book.', it: 'apri il libro.', fr: 'ouvrir le livre.', de: 'das Buch öffnen.', es: 'abrir el libro.',
      ja: '本を開く。', pt: 'abrir o livro.',
    });
  });
});

// UNKNOWN and UNEXPECTED agree like any adjective; Japanese 不明な is a na-adjective, 予期しない an
// i-adjective (the negative of 予期する).
describe('UNKNOWN and UNEXPECTED', () => {
  test('agree with the noun they describe, in number and gender', () => {
    expect(sayAll({ subject: np('WORD', { definiteness: 'bare', number: 'plural', adjectives: ['UNKNOWN'] }) })).toEqual({
      en: 'unknown words.', it: 'parole sconosciute.', fr: 'mots inconnus.', de: 'unbekannte Wörter.',
      es: 'palabras desconocidas.', ja: '不明な単語。', pt: 'palavras desconhecidas.',
    });
    expect(sayAll({ subject: np('REFERENCE', { number: 'plural', adjectives: ['UNEXPECTED'] }) })).toEqual({
      en: 'the unexpected references.', it: 'i riferimenti inattesi.', fr: 'les références inattendues.',
      de: 'die unerwarteten Verweise.', es: 'las referencias inesperadas.', ja: '予期しない参照。',
      pt: 'as referências inesperadas.',
    });
  });

  test('as a predicate', () => {
    expect(is(np('HOUSE'), 'UNKNOWN')).toEqual({
      en: 'the house is unknown.', it: 'la casa è sconosciuta.', fr: 'la maison est inconnue.', de: 'das Haus ist unbekannt.',
      es: 'la casa es desconocida.', ja: '家は不明です。', pt: 'a casa é desconhecida.',
    });
    expect(is(np('HOUSE'), 'UNEXPECTED')).toMatchObject({
      it: 'la casa è inattesa.', fr: 'la maison est inattendue.', de: 'das Haus ist unerwartet.', es: 'la casa es inesperada.',
    });
  });

  test('as the words a label cites', () => {
    expect(wordAll('UNKNOWN')).toEqual({
      en: 'unknown', it: 'sconosciuto', fr: 'inconnu', de: 'unbekannt', es: 'desconocido', ja: '不明', pt: 'desconhecido',
    });
    expect(wordAll('UNEXPECTED')).toEqual({
      en: 'unexpected', it: 'inatteso', fr: 'inattendu', de: 'unerwartet', es: 'inesperado', ja: '予期しない', pt: 'inesperado',
    });
  });
});

// TEXT is masculine wherever it has a gender; REFERENCE is feminine in French, Spanish and
// Portuguese, masculine in Italian and German (Verweis).
describe('TEXT and REFERENCE', () => {
  test('in both numbers, with an article and an adjective', () => {
    expect(sayAll({ subject: np('TEXT') })).toEqual({
      en: 'the text.', it: 'il testo.', fr: 'le texte.', de: 'der Text.', es: 'el texto.', ja: 'テキスト。', pt: 'o texto.',
    });
    expect(sayAll({ subject: np('TEXT', { number: 'plural' }) })).toMatchObject({
      en: 'the texts.', it: 'i testi.', fr: 'les textes.', de: 'die Texte.', es: 'los textos.', pt: 'os textos.',
    });
    expect(sayAll({ subject: np('TEXT', { definiteness: 'indefinite', adjectives: ['NEW'] }) })).toEqual({
      en: 'a new text.', it: 'un nuovo testo.', fr: 'un nouveau texte.', de: 'ein neuer Text.', es: 'un nuevo texto.',
      ja: '新しいテキスト。', pt: 'um novo texto.',
    });
    expect(sayAll({ subject: np('REFERENCE', { number: 'plural' }) })).toEqual({
      en: 'the references.', it: 'i riferimenti.', fr: 'les références.', de: 'die Verweise.', es: 'las referencias.',
      ja: '参照。', pt: 'as referências.',
    });
    expect(sayAll({ subject: np('REFERENCE', { definiteness: 'indefinite', adjectives: ['NEW'] }) })).toEqual({
      en: 'a new reference.', it: 'un nuovo riferimento.', fr: 'une nouvelle référence.', de: 'ein neuer Verweis.',
      es: 'una nueva referencia.', ja: '新しい参照。', pt: 'uma nova referência.',
    });
  });
});

// ALREADY takes the place of ALWAYS and NEVER, its `frequency` subtype: before the verb in English,
// between the auxiliary and the participle in a compound tense.
describe('ALREADY', () => {
  test('before the verb, and inside a compound tense', () => {
    expect(acts(np('CAT'), 'EAT', np('FOOD'), { modifier: 'ALREADY' })).toEqual({
      en: 'the cat already eats the food.', it: 'il gatto mangia già il cibo.', fr: 'le chat mange déjà la nourriture.',
      de: 'der Kater frisst schon das Essen.', es: 'el gato come ya la comida.', ja: '猫は食べ物をもう食べます。',
      pt: 'o gato come já a comida.',
    });
    expect(acts(np('CAT', { gender: 'fem' }), 'EAT', np('FOOD'), { modifier: 'ALREADY', aspect: 'resultative' })).toMatchObject({
      en: 'the cat has already eaten the food.', it: 'la gatta ha già mangiato il cibo.', fr: 'la chatte a déjà mangé la nourriture.',
    });
    expect(wordAll('ALREADY')).toEqual({ en: 'already', it: 'già', fr: 'déjà', de: 'schon', es: 'ya', ja: 'もう', pt: 'já' });
  });
});

// Every diagnostic entry of the catalogue, as the console shows it: the engine's render with the
// entry's format applied (capitalized, no full stop). The fallback is the English.
describe('the diagnostics, as the catalogue plans them', () => {
  const applyFormat = (text: string, format?: UiStringFormat) => {
    let out = text;
    if (format?.stripPeriod) out = out.replace(/[.。]\s*$/, '');
    if (format?.capitalize) out = out.replace(/^(\P{L}*)(\p{L})/u, (_, lead: string, first: string) => lead + first.toUpperCase());
    return out;
  };
  const RENDERS: Record<string, Record<string, string>> = {
    'diagnostic.unknownCommand': {
      en: 'Unknown command', it: 'Comando sconosciuto', fr: 'Commande inconnue', de: 'Unbekannter Befehl',
      es: 'Comando desconocido', pt: 'Comando desconhecido', ja: '不明な命令',
    },
    'diagnostic.unknownWord': {
      en: 'Unknown word', it: 'Parola sconosciuta', fr: 'Mot inconnu', de: 'Unbekanntes Wort',
      es: 'Palabra desconocida', pt: 'Palavra desconhecida', ja: '不明な単語',
    },
    'diagnostic.unknownValue': {
      en: 'Unknown value', it: 'Valore sconosciuto', fr: 'Valeur inconnue', de: 'Unbekannter Wert',
      es: 'Valor desconocido', pt: 'Valor desconhecido', ja: '不明な値',
    },
    'diagnostic.unknownNoun': {
      en: 'Unknown noun', it: 'Sostantivo sconosciuto', fr: 'Nom inconnu', de: 'Unbekanntes Substantiv',
      es: 'Sustantivo desconocido', pt: 'Substantivo desconhecido', ja: '不明な名詞',
    },
    'diagnostic.unknownPhrase': {
      en: 'Unknown phrase', it: 'Frase sconosciuta', fr: 'Phrase inconnue', de: 'Unbekannte Phrase',
      es: 'Frase desconocida', pt: 'Frase desconhecida', ja: '不明なフレーズ',
    },
    'diagnostic.missingPeriod': {
      en: 'Missing period', it: 'Periodo mancante', fr: 'Période manquante', de: 'Fehlendes Satzgefüge',
      es: 'Período faltante', pt: 'Período faltante', ja: '見つからない文',
    },
    'diagnostic.missingNoun': {
      en: 'Missing noun', it: 'Sostantivo mancante', fr: 'Nom manquant', de: 'Fehlendes Substantiv',
      es: 'Sustantivo faltante', pt: 'Substantivo faltante', ja: '見つからない名詞',
    },
    'diagnostic.missingWord': {
      en: 'Missing word', it: 'Parola mancante', fr: 'Mot manquant', de: 'Fehlendes Wort',
      es: 'Palabra faltante', pt: 'Palavra faltante', ja: '見つからない単語',
    },
    'diagnostic.missingAdjective': {
      en: 'Missing adjective', it: 'Aggettivo mancante', fr: 'Adjectif manquant', de: 'Fehlendes Adjektiv',
      es: 'Adjetivo faltante', pt: 'Adjetivo faltante', ja: '見つからない形容詞',
    },
    'diagnostic.missingModal': {
      en: 'Missing modal', it: 'Verbo modale mancante', fr: 'Verbe modal manquant', de: 'Fehlendes Modalverb',
      es: 'Verbo modal faltante', pt: 'Verbo modal faltante', ja: '見つからない法助動詞',
    },
    'diagnostic.missingConjunct': {
      en: 'Missing conjunct', it: 'Congiunto mancante', fr: 'Conjoint manquant', de: 'Fehlendes Konjunkt',
      es: 'Miembro coordinado faltante', pt: 'Membro coordenado faltante', ja: '見つからない等位項',
    },
    'diagnostic.unexpectedText': {
      en: 'Unexpected text', it: 'Testo inatteso', fr: 'Texte inattendu', de: 'Unerwarteter Text',
      es: 'Texto inesperado', pt: 'Texto inesperado', ja: '予期しないテキスト',
    },
    'diagnostic.unexpectedBracket': {
      en: 'Unexpected bracket', it: 'Parentesi inattesa', fr: 'Parenthèse inattendue', de: 'Unerwartete Klammer',
      es: 'Paréntesis inesperado', pt: 'Parêntese inesperado', ja: '予期しない括弧',
    },
    'diagnostic.unexpectedReference': {
      en: 'Unexpected reference', it: 'Riferimento inatteso', fr: 'Référence inattendue', de: 'Unerwarteter Verweis',
      es: 'Referencia inesperada', pt: 'Referência inesperada', ja: '予期しない参照',
    },
    'diagnostic.unexpectedWord': {
      en: 'Unexpected word', it: 'Parola inattesa', fr: 'Mot inattendu', de: 'Unerwartetes Wort',
      es: 'Palabra inesperada', pt: 'Palavra inesperada', ja: '予期しない単語',
    },
    'diagnostic.commandAcceptsNoWord': {
      en: 'This command accepts no word', it: 'Questo comando non accetta nessuna parola', fr: "Cette commande n'accepte aucun mot", de: 'Dieser Befehl akzeptiert kein Wort',
      es: 'Este comando no acepta ninguna palabra', pt: 'Este comando não aceita nenhuma palavra', ja: 'この命令はどの単語も受け付けません',
    },
    'diagnostic.commandHasValue': {
      en: 'This command already has a value', it: 'Questo comando ha già un valore', fr: 'Cette commande a déjà une valeur', de: 'Dieser Befehl hat schon einen Wert',
      es: 'Este comando tiene ya un valor', pt: 'Este comando tem já um valor', ja: 'この命令は値がもうあります',
    },
    'diagnostic.verbAcceptsNo.directObject': {
      en: 'This verb accepts no object', it: 'Questo verbo non accetta nessun complemento oggetto', fr: "Ce verbe n'accepte aucun complément d'objet", de: 'Dieses Verb akzeptiert kein Objekt',
      es: 'Este verbo no acepta ningún complemento', pt: 'Este verbo não aceita nenhum objeto', ja: 'この動詞はどの目的語も受け付けません',
    },
    'diagnostic.verbAcceptsNo.predicative': {
      en: 'This verb accepts no subject complement', it: 'Questo verbo non accetta nessun complemento predicativo del soggetto', fr: "Ce verbe n'accepte aucun attribut du sujet", de: 'Dieses Verb akzeptiert kein Prädikativ',
      es: 'Este verbo no acepta ningún atributo', pt: 'Este verbo não aceita nenhum predicativo do sujeito', ja: 'この動詞はどの主格補語も受け付けません',
    },
    'diagnostic.verbAcceptsNo.terminus': {
      en: 'This verb accepts no terminus', it: 'Questo verbo non accetta nessun complemento di termine', fr: "Ce verbe n'accepte aucun complément d'objet second", de: 'Dieses Verb akzeptiert kein Dativobjekt',
      es: 'Este verbo no acepta ningún complemento indirecto', pt: 'Este verbo não aceita nenhum objeto indireto', ja: 'この動詞はどの間接目的語も受け付けません',
    },
    'diagnostic.verbAcceptsNo.manner': {
      en: 'This verb accepts no adverbial of manner', it: 'Questo verbo non accetta nessun complemento di modo', fr: "Ce verbe n'accepte aucun complément circonstanciel de manière", de: 'Dieses Verb akzeptiert keine adverbiale Bestimmung der Art und Weise',
      es: 'Este verbo no acepta ningún complemento circunstancial de modo', pt: 'Este verbo não aceita nenhum adjunto adverbial de modo', ja: 'この動詞はどの状態の副詞語句も受け付けません',
    },
    'diagnostic.verbAcceptsNo.locative': {
      en: 'This verb accepts no locative', it: 'Questo verbo non accetta nessun complemento di stato in luogo', fr: "Ce verbe n'accepte aucun complément circonstanciel de lieu", de: 'Dieses Verb akzeptiert keine adverbiale Bestimmung des Ortes',
      es: 'Este verbo no acepta ningún complemento circunstancial de lugar', pt: 'Este verbo não aceita nenhum adjunto adverbial de lugar', ja: 'この動詞はどの場所の副詞語句も受け付けません',
    },
    'diagnostic.verbAcceptsNo.direction': {
      en: 'This verb accepts no direction', it: 'Questo verbo non accetta nessun complemento di moto a luogo', fr: "Ce verbe n'accepte aucun complément circonstanciel de direction", de: 'Dieses Verb akzeptiert keine adverbiale Bestimmung der Richtung',
      es: 'Este verbo no acepta ningún complemento circunstancial de dirección', pt: 'Este verbo não aceita nenhum adjunto adverbial de direção', ja: 'この動詞はどの方向の副詞語句も受け付けません',
    },
    'diagnostic.verbAcceptsNo.source': {
      en: 'This verb accepts no source', it: 'Questo verbo non accetta nessun complemento di moto da luogo', fr: "Ce verbe n'accepte aucun complément circonstanciel de provenance", de: 'Dieses Verb akzeptiert keine adverbiale Bestimmung der Herkunft',
      es: 'Este verbo no acepta ningún complemento circunstancial de procedencia', pt: 'Este verbo não aceita nenhum adjunto adverbial de origem', ja: 'この動詞はどの起点の副詞語句も受け付けません',
    },
    'diagnostic.verbAcceptsNo.route': {
      en: 'This verb accepts no route', it: 'Questo verbo non accetta nessun complemento di moto per luogo', fr: "Ce verbe n'accepte aucun complément circonstanciel de passage", de: 'Dieses Verb akzeptiert keine adverbiale Bestimmung des Weges',
      es: 'Este verbo no acepta ningún complemento circunstancial de trayecto', pt: 'Este verbo não aceita nenhum adjunto adverbial de percurso', ja: 'この動詞はどの経路の副詞語句も受け付けません',
    },
    'diagnostic.verbAcceptsNo.cause': {
      en: 'This verb accepts no cause', it: 'Questo verbo non accetta nessun complemento di causa', fr: "Ce verbe n'accepte aucun complément circonstanciel de cause", de: 'Dieses Verb akzeptiert keine adverbiale Bestimmung des Grundes',
      es: 'Este verbo no acepta ningún complemento circunstancial de causa', pt: 'Este verbo não aceita nenhum adjunto adverbial de causa', ja: 'この動詞はどの原因の副詞語句も受け付けません',
    },
    'diagnostic.verbAcceptsNo.instrumental': {
      en: 'This verb accepts no instrumental', it: 'Questo verbo non accetta nessun complemento di mezzo', fr: "Ce verbe n'accepte aucun complément de moyen", de: 'Dieses Verb akzeptiert keinen Instrumental',
      es: 'Este verbo no acepta ningún complemento circunstancial de instrumento', pt: 'Este verbo não aceita nenhum adjunto adverbial de instrumento', ja: 'この動詞はどの手段語も受け付けません',
    },
    'diagnostic.periodAcceptsNoCondition': {
      en: 'This period accepts no condition', it: 'Questo periodo non accetta nessuna condizione', fr: "Cette période n'accepte aucune condition", de: 'Dieses Satzgefüge akzeptiert keine Bedingung',
      es: 'Este período no acepta ninguna condición', pt: 'Este período não aceita nenhuma condição', ja: 'この文はどの条件も受け付けません',
    },
    'diagnostic.periodAcceptsNoCoordination': {
      en: 'This period accepts no coordination', it: 'Questo periodo non accetta nessuna coordinazione', fr: "Cette période n'accepte aucune coordination", de: 'Dieses Satzgefüge akzeptiert keine Koordination',
      es: 'Este período no acepta ninguna coordinación', pt: 'Este período não aceita nenhuma coordenação', ja: 'この文はどの等位接続も受け付けません',
    },
    'diagnostic.noNounHasAdjective': {
      en: 'No noun has an adjective', it: 'Nessun sostantivo ha un aggettivo', fr: "Aucun nom n'a d'adjectif", de: 'Kein Substantiv hat ein Adjektiv',
      es: 'Ningún sustantivo tiene un adjetivo', pt: 'Nenhum substantivo tem um adjetivo', ja: 'どの名詞も形容詞がありません',
    },
    'diagnostic.noVerbHasAdverb': {
      en: 'No verb has an adverb', it: 'Nessun verbo ha un avverbio', fr: "Aucun verbe n'a d'adverbe", de: 'Kein Verb hat ein Adverb',
      es: 'Ningún verbo tiene un adverbio', pt: 'Nenhum verbo tem um advérbio', ja: 'どの動詞も副詞がありません',
    },
    'diagnostic.noNounHasPossessor': {
      en: 'No noun has a possessor', it: 'Nessun sostantivo ha un possessore', fr: "Aucun nom n'a de possesseur", de: 'Kein Substantiv hat einen Besitzer',
      es: 'Ningún sustantivo tiene un poseedor', pt: 'Nenhum substantivo tem um possuidor', ja: 'どの名詞も所有者がいません',
    },
    // `/del than` with nothing to take off (P09-E12 D5).
    'diagnostic.noAdjectiveHasStandard': {
      en: 'No adjective has a standard of comparison', it: 'Nessun aggettivo ha un termine di paragone', fr: "Aucun adjectif n'a de terme de comparaison",
      de: 'Kein Adjektiv hat eine Vergleichsgröße', es: 'Ningún adjetivo tiene un término de comparación', pt: 'Nenhum adjetivo tem um termo de comparação',
      ja: 'どの形容詞も比較の基準がありません',
    },
    'diagnostic.noNounHasRelative': {
      en: 'No noun has a relative clause', it: 'Nessun sostantivo ha una proposizione relativa', fr: "Aucun nom n'a de proposition relative", de: 'Kein Substantiv hat einen Relativsatz',
      es: 'Ningún sustantivo tiene una oración de relativo', pt: 'Nenhum substantivo tem uma oração relativa', ja: 'どの名詞も関係節がありません',
    },
    'diagnostic.noNounIsCoordinated': {
      en: 'No noun is coordinated', it: 'Nessun sostantivo è coordinato', fr: "Aucun nom n'est coordonné", de: 'Kein Substantiv ist beigeordnet',
      es: 'Ningún sustantivo es coordinado', pt: 'Nenhum substantivo é coordenado', ja: 'どの名詞も等位ではありません',
    },
    'diagnostic.verbHasNoModal': {
      en: 'The verb has no modal', it: 'Il verbo non ha nessun verbo modale', fr: "Le verbe n'a aucun verbe modal", de: 'Das Verb hat kein Modalverb',
      es: 'El verbo no tiene ningún verbo modal', pt: 'O verbo não tem nenhum verbo modal', ja: '動詞はどの法助動詞もありません',
    },
    'diagnostic.periodHasNo.condition': {
      en: 'This period has no condition', it: 'Questo periodo non ha nessuna condizione', fr: "Cette période n'a aucune condition", de: 'Dieses Satzgefüge hat keine Bedingung',
      es: 'Este período no tiene ninguna condición', pt: 'Este período não tem nenhuma condição', ja: 'この文はどの条件もありません',
    },
    'diagnostic.periodHasNo.join': {
      en: 'This period has no coordination', it: 'Questo periodo non ha nessuna coordinazione', fr: "Cette période n'a aucune coordination", de: 'Dieses Satzgefüge hat keine Koordination',
      es: 'Este período no tiene ninguna coordinación', pt: 'Este período não tem nenhuma coordenação', ja: 'この文はどの等位接続もありません',
    },
    'diagnostic.periodHasNo.instrument': {
      en: 'This period has no instrumental', it: 'Questo periodo non ha nessun complemento di mezzo', fr: "Cette période n'a aucun complément de moyen", de: 'Dieses Satzgefüge hat keinen Instrumental',
      es: 'Este período no tiene ningún complemento circunstancial de instrumento', pt: 'Este período não tem nenhum adjunto adverbial de instrumento', ja: 'この文はどの手段語もありません',
    },
    'diagnostic.thatPeriodHasVerb': {
      en: 'That period has a verb', it: 'Quel periodo ha un verbo', fr: 'Cette période a un verbe', de: 'Jenes Satzgefüge hat ein Verb',
      es: 'Ese período tiene un verbo', pt: 'Esse período tem um verbo', ja: 'その文は動詞があります',
    },
    'diagnostic.periodIsCommand': {
      en: 'This period is a command', it: 'Questo periodo è un comando', fr: 'Cette période est une commande', de: 'Dieses Satzgefüge ist ein Befehl',
      es: 'Este período es un comando', pt: 'Este período é um comando', ja: 'この文は命令です',
    },
    'diagnostic.periodIsStatement': {
      en: 'This period is a statement', it: 'Questo periodo è una proposizione enunciativa', fr: 'Cette période est une phrase déclarative', de: 'Dieses Satzgefüge ist ein Aussagesatz',
      es: 'Este período es una oración enunciativa', pt: 'Este período é uma frase declarativa', ja: 'この文は平叙文です',
    },
    'diagnostic.periodAlreadyLinked': {
      en: 'That period is already linked', it: 'Quel periodo è già collegato', fr: 'Cette période est déjà liée', de: 'Jenes Satzgefüge ist schon verknüpft',
      es: 'Ese período está ya vinculado', pt: 'Esse período está já ligado', ja: 'その文はもうリンク済みです',
    },
    'diagnostic.nounAlreadyTaken': {
      en: 'Another relative clause already has this noun', it: "Un'altra proposizione relativa ha già questo sostantivo", fr: 'Une autre proposition relative a déjà ce nom', de: 'Ein anderer Relativsatz hat schon dieses Substantiv',
      es: 'Otra oración de relativo tiene ya este sustantivo', pt: 'Outra oração relativa tem já este substantivo', ja: '別の関係節はこの名詞がもうあります',
    },
    'diagnostic.wordIs.noun': {
      en: 'This word is a noun', it: 'Questa parola è un sostantivo', fr: 'Ce mot est un nom', de: 'Dieses Wort ist ein Substantiv',
      es: 'Esta palabra es un sustantivo', pt: 'Esta palavra é um substantivo', ja: 'この単語は名詞です',
    },
    'diagnostic.wordIs.pronoun': {
      en: 'This word is a pronoun', it: 'Questa parola è un pronome', fr: 'Ce mot est un pronom', de: 'Dieses Wort ist ein Pronomen',
      es: 'Esta palabra es un pronombre', pt: 'Esta palavra é um pronome', ja: 'この単語は代名詞です',
    },
    'diagnostic.wordIs.adjective': {
      en: 'This word is an adjective', it: 'Questa parola è un aggettivo', fr: 'Ce mot est un adjectif', de: 'Dieses Wort ist ein Adjektiv',
      es: 'Esta palabra es un adjetivo', pt: 'Esta palavra é um adjetivo', ja: 'この単語は形容詞です',
    },
    'diagnostic.wordIs.nounModifier': {
      en: 'This word is a modifier', it: 'Questa parola è un modificatore', fr: 'Ce mot est un modificateur', de: 'Dieses Wort ist ein Modifikator',
      es: 'Esta palabra es un modificador', pt: 'Esta palavra é um modificador', ja: 'この単語は修飾語です',
    },
    'diagnostic.wordIs.verb': {
      en: 'This word is a verb', it: 'Questa parola è un verbo', fr: 'Ce mot est un verbe', de: 'Dieses Wort ist ein Verb',
      es: 'Esta palabra es un verbo', pt: 'Esta palavra é um verbo', ja: 'この単語は動詞です',
    },
    'diagnostic.wordIs.modal': {
      en: 'This word is a modal', it: 'Questa parola è un verbo modale', fr: 'Ce mot est un verbe modal', de: 'Dieses Wort ist ein Modalverb',
      es: 'Esta palabra es un verbo modal', pt: 'Esta palavra é um verbo modal', ja: 'この単語は法助動詞です',
    },
    'diagnostic.wordIs.adverb': {
      en: 'This word is an adverb', it: 'Questa parola è un avverbio', fr: 'Ce mot est un adverbe', de: 'Dieses Wort ist ein Adverb',
      es: 'Esta palabra es un adverbio', pt: 'Esta palavra é um advérbio', ja: 'この単語は副詞です',
    },
    'diagnostic.noWordUnderCursor': {
      en: 'No word is under the cursor', it: 'Nessuna parola è sotto il cursore', fr: "Aucun mot n'est sous le curseur", de: 'Kein Wort ist unter dem Cursor',
      es: 'Ninguna palabra está debajo del cursor', pt: 'Nenhuma palavra está debaixo do cursor', ja: 'どの単語もカーソルの下にありません',
    },
    'diagnostic.wordRefusesCommand': {
      en: 'This word does not accept the command', it: 'Questa parola non accetta il comando', fr: "Ce mot n'accepte pas la commande", de: 'Dieses Wort akzeptiert den Befehl nicht',
      es: 'Esta palabra no acepta el comando', pt: 'Esta palavra não aceita o comando', ja: 'この単語は命令を受け付けません',
    },
    'diagnostic.closeBracket': {
      en: 'Close the bracket', it: 'Chiudi la parentesi', fr: 'Fermer la parenthèse', de: 'Die Klammer schließen',
      es: 'Cerrar el paréntesis', pt: 'Fechar o parêntese', ja: '括弧を閉じる',
    },
    'diagnostic.moveWord': {
      en: 'Move the word', it: 'Sposta la parola', fr: 'Déplacer le mot', de: 'Das Wort verschieben',
      es: 'Mover la palabra', pt: 'Mover a palavra', ja: '単語を移動',
    },
    'diagnostic.moveCommand': {
      en: 'Move the command', it: 'Sposta il comando', fr: 'Déplacer la commande', de: 'Den Befehl verschieben',
      es: 'Mover el comando', pt: 'Mover o comando', ja: '命令を移動',
    },
    'diagnostic.openClause': {
      en: 'Open a new clause', it: 'Apri una nuova proposizione', fr: 'Ouvrir une nouvelle proposition', de: 'Einen neuen Satz öffnen',
      es: 'Abrir una nueva oración', pt: 'Abrir uma nova oração', ja: '新しい節を開く',
    },
    'diagnostic.openBracketWithCommand': {
      en: 'Open a bracket with a command', it: 'Apri una parentesi con un comando', fr: 'Ouvrir une parenthèse avec une commande', de: 'Eine Klammer mit einem Befehl öffnen',
      es: 'Abrir un paréntesis con un comando', pt: 'Abrir um parêntese com um comando', ja: '命令で括弧を開く',
    },
    'diagnostic.typeCommand': {
      en: 'Type a command', it: 'Digita un comando', fr: 'Taper une commande', de: 'Einen Befehl tippen',
      es: 'Teclear un comando', pt: 'Digitar um comando', ja: '命令を入力',
    },
    'diagnostic.chooseCommand': {
      en: 'Choose a command in the list', it: "Scegli un comando nell'elenco", fr: 'Choisir une commande dans la liste', de: 'Einen Befehl in der Liste wählen',
      es: 'Elegir un comando en la lista', pt: 'Escolher um comando na lista', ja: '一覧で命令を選び',
    },
    'diagnostic.choosePeriod': {
      en: 'Choose a period', it: 'Scegli un periodo', fr: 'Choisir une période', de: 'Ein Satzgefüge wählen',
      es: 'Elegir un período', pt: 'Escolher um período', ja: '文を選び',
    },
    'diagnostic.chooseOtherPeriod': {
      en: 'Choose another period', it: 'Scegli un altro periodo', fr: 'Choisir une autre période', de: 'Ein anderes Satzgefüge wählen',
      es: 'Elegir otro período', pt: 'Escolher outro período', ja: '別の文を選び',
    },
    'diagnostic.chooseNoun': {
      en: 'Choose a noun', it: 'Scegli un sostantivo', fr: 'Choisir un nom', de: 'Ein Substantiv wählen',
      es: 'Elegir un sustantivo', pt: 'Escolher um substantivo', ja: '名詞を選び',
    },
    'diagnostic.chooseNounInPeriod': {
      en: 'Choose a noun in this period', it: 'Scegli un sostantivo in questo periodo', fr: 'Choisir un nom dans cette période', de: 'Ein Substantiv in diesem Satzgefüge wählen',
      es: 'Elegir un sustantivo en este período', pt: 'Escolher um substantivo neste período', ja: 'この文で名詞を選び',
    },
    'diagnostic.chooseOtherNoun': {
      en: 'Choose another noun', it: 'Scegli un altro sostantivo', fr: 'Choisir un autre nom', de: 'Ein anderes Substantiv wählen',
      es: 'Elegir otro sustantivo', pt: 'Escolher outro substantivo', ja: '別の名詞を選び',
    },
    'diagnostic.chooseRelativeClause': {
      en: 'Choose a relative clause', it: 'Scegli una proposizione relativa', fr: 'Choisir une proposition relative', de: 'Einen Relativsatz wählen',
      es: 'Elegir una oración de relativo', pt: 'Escolher uma oração relativa', ja: '関係節を選び',
    },
    'diagnostic.chooseValue': {
      en: 'Choose a value', it: 'Scegli un valore', fr: 'Choisir une valeur', de: 'Einen Wert wählen',
      es: 'Elegir un valor', pt: 'Escolher um valor', ja: '値を選び',
    },
    'diagnostic.chooseConjunction': {
      en: 'Choose a conjunction', it: 'Scegli una congiunzione', fr: 'Choisir une conjonction', de: 'Eine Konjunktion wählen',
      es: 'Elegir una conjunción', pt: 'Escolher uma conjunção', ja: '接続詞を選び',
    },
    'diagnostic.chooseWord': {
      en: 'Choose a word', it: 'Scegli una parola', fr: 'Choisir un mot', de: 'Ein Wort wählen',
      es: 'Elegir una palabra', pt: 'Escolher uma palavra', ja: '単語を選び',
    },
    'diagnostic.chooseVerb': {
      en: 'Choose a verb', it: 'Scegli un verbo', fr: 'Choisir un verbe', de: 'Ein Verb wählen',
      es: 'Elegir un verbo', pt: 'Escolher um verbo', ja: '動詞を選び',
    },
    'diagnostic.chooseLevel': {
      en: 'Choose a level', it: 'Scegli un livello', fr: 'Choisir un niveau', de: 'Eine Ebene wählen',
      es: 'Elegir un nivel', pt: 'Escolher um nível', ja: '段階を選び',
    },
    'diagnostic.changeLevel': {
      en: 'Change the level', it: 'Cambia il livello', fr: 'Changer le niveau', de: 'Die Ebene ändern',
      es: 'Cambiar el nivel', pt: 'Mudar o nível', ja: '段階を変え',
    },
    'diagnostic.removeWordOrPeriod': {
      en: 'Remove a word or the period', it: 'Rimuovi una parola o il periodo', fr: 'Retirer un mot ou la période', de: 'Ein Wort oder das Satzgefüge entfernen',
      es: 'Quitar una palabra o el período', pt: 'Remover uma palavra ou o período', ja: '単語か文を取り除き',
    },
    'diagnostic.removeConditionOrCoordination': {
      en: 'Remove the condition or the coordination', it: 'Rimuovi la condizione o la coordinazione', fr: 'Retirer la condition ou la coordination', de: 'Die Bedingung oder die Koordination entfernen',
      es: 'Quitar la condición o la coordinación', pt: 'Remover a condição ou a coordenação', ja: '条件か等位接続を取り除き',
    },
    'console.help.cursor': {
      en: 'Cursor', it: 'Cursore', fr: 'Curseur', de: 'Cursor',
      es: 'Cursor', pt: 'Cursor', ja: 'カーソル',
    },
  };

  const catalogued = Object.keys(UI_STRINGS).filter((key) => key.startsWith('diagnostic.') || key === 'console.help.cursor');

  test('has a render pinned for every diagnostic the catalogue holds', () => {
    expect(catalogued.sort()).toEqual(Object.keys(RENDERS).sort());
  });

  test.each(catalogued)('%s', (key) => {
    const { plan, format, fallback } = (UI_STRINGS as Record<string, UiStringDef>)[key] as UiStringPlanDef;
    const said = Object.fromEntries(Object.entries(sayAll(plan)).map(([lang, text]) => [lang, applyFormat(text, format)]));
    expect(said).toEqual(RENDERS[key]);
    expect(said.en).toBe(fallback);
  });
});
