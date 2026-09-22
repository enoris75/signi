import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { ancestors, conceptIndex } from '../../backend/src/concepts/hierarchy.js';

// P09's everyday nouns and its institutions (docs/localization B65 and B64): THING, PROBLEM,
// CASE_INSTANCE, SYSTEM, the two programs, SCHOOL, STUDENT, COMPANY_BUSINESS, STATE_NATION and WORLD,
// the three verbs their glosses stand on (BROADCAST, LEARN, SELL), and the glosses of all of them and
// of HAND and POINT_NOUN, which the shared base seeded (core-vocabulary-shared.test.ts pins their
// paradigms). The verbs' compound past is pinned here, not in verb.test.ts's Italian table, so the
// six lanes that seeded P09 the same day do not edit the same rows.

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

// ── The words ─────────────────────────────────────────────────────────

describe('the nouns: a singular and a plural in every language', () => {
  test.each<[string, Record<LanguageCode, string>, Record<LanguageCode, string>]>([
    // B65. THING takes each language's plain word, not OBJECT_THING's oggetto, Gegenstand, 物体.
    ['THING',
      { en: 'the thing.', it: 'la cosa.', fr: 'la chose.', de: 'das Ding.', es: 'la cosa.', ja: 'もの。', pt: 'a coisa.' },
      { en: 'the things.', it: 'le cose.', fr: 'les choses.', de: 'die Dinge.', es: 'las cosas.', ja: 'もの。', pt: 'as coisas.' }],
    // problema is masculine despite the -a in the three languages that have it.
    ['PROBLEM',
      { en: 'the problem.', it: 'il problema.', fr: 'le problème.', de: 'das Problem.', es: 'el problema.', ja: '問題。', pt: 'o problema.' },
      { en: 'the problems.', it: 'i problemi.', fr: 'les problèmes.', de: 'die Probleme.', es: 'los problemas.', ja: '問題。', pt: 'os problemas.' }],
    // French cas is the same word in the plural; German Fall umlauts.
    ['CASE_INSTANCE',
      { en: 'the case.', it: 'il caso.', fr: 'le cas.', de: 'der Fall.', es: 'el caso.', ja: '場合。', pt: 'o caso.' },
      { en: 'the cases.', it: 'i casi.', fr: 'les cas.', de: 'die Fälle.', es: 'los casos.', ja: '場合。', pt: 'os casos.' }],
    ['SYSTEM',
      { en: 'the system.', it: 'il sistema.', fr: 'le système.', de: 'das System.', es: 'el sistema.', ja: 'システム。', pt: 'o sistema.' },
      { en: 'the systems.', it: 'i sistemi.', fr: 'les systèmes.', de: 'die Systeme.', es: 'los sistemas.', ja: 'システム。', pt: 'os sistemas.' }],
    // The two programs: alike in en, it, es and pt, apart in fr, de and ja.
    ['PROGRAM_SOFTWARE',
      { en: 'the program.', it: 'il programma.', fr: 'le programme.', de: 'das Programm.', es: 'el programa.', ja: 'プログラム。', pt: 'o programa.' },
      { en: 'the programs.', it: 'i programmi.', fr: 'les programmes.', de: 'die Programme.', es: 'los programas.', ja: 'プログラム。', pt: 'os programas.' }],
    ['PROGRAM_SHOW',
      { en: 'the program.', it: 'il programma.', fr: "l'émission.", de: 'die Sendung.', es: 'el programa.', ja: '番組。', pt: 'o programa.' },
      { en: 'the programs.', it: 'i programmi.', fr: 'les émissions.', de: 'die Sendungen.', es: 'los programas.', ja: '番組。', pt: 'os programas.' }],
    // B64.
    ['SCHOOL',
      { en: 'the school.', it: 'la scuola.', fr: "l'école.", de: 'die Schule.', es: 'la escuela.', ja: '学校。', pt: 'a escola.' },
      { en: 'the schools.', it: 'le scuole.', fr: 'les écoles.', de: 'die Schulen.', es: 'las escuelas.', ja: '学校。', pt: 'as escolas.' }],
    // Italian takes lo/gli before s + consonant.
    ['STUDENT',
      { en: 'the student.', it: 'lo studente.', fr: "l'étudiant.", de: 'der Student.', es: 'el estudiante.', ja: '学生。', pt: 'o estudante.' },
      { en: 'the students.', it: 'gli studenti.', fr: 'les étudiants.', de: 'die Studenten.', es: 'los estudiantes.', ja: '学生。', pt: 'os estudantes.' }],
    ['COMPANY_BUSINESS',
      { en: 'the company.', it: "l'azienda.", fr: "l'entreprise.", de: 'die Firma.', es: 'la empresa.', ja: '会社。', pt: 'a empresa.' },
      { en: 'the companies.', it: 'le aziende.', fr: 'les entreprises.', de: 'die Firmen.', es: 'las empresas.', ja: '会社。', pt: 'as empresas.' }],
    // The polity's capital, and the articles the capital must not disturb: lo Stato, l'État.
    ['STATE_NATION',
      { en: 'the state.', it: 'lo Stato.', fr: "l'État.", de: 'der Staat.', es: 'el Estado.', ja: '国家。', pt: 'o Estado.' },
      { en: 'the states.', it: 'gli Stati.', fr: 'les États.', de: 'die Staaten.', es: 'los Estados.', ja: '国家。', pt: 'os Estados.' }],
    ['WORLD',
      { en: 'the world.', it: 'il mondo.', fr: 'le monde.', de: 'die Welt.', es: 'el mundo.', ja: '世界。', pt: 'o mundo.' },
      { en: 'the worlds.', it: 'i mondi.', fr: 'les mondes.', de: 'die Welten.', es: 'los mundos.', ja: '世界。', pt: 'os mundos.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });

  test('the genders agree: the adjective follows the lexeme, not the other program', () => {
    // PROGRAM_SHOW is feminine where its word is its own (une grande émission, eine große Sendung).
    expect(said('PROGRAM_SHOW', { definiteness: 'indefinite', adjectives: ['BIG'] })).toEqual({
      en: 'a big program.', it: 'un grande programma.', fr: 'une grande émission.', de: 'eine große Sendung.',
      es: 'un programa grande.', ja: '大きい番組。', pt: 'um programa grande.',
    });
    expect(said('THING', { definiteness: 'indefinite', adjectives: ['BIG'] })).toEqual({
      en: 'a big thing.', it: 'una grande cosa.', fr: 'une grande chose.', de: 'ein großes Ding.', es: 'una cosa grande.',
      ja: '大きいもの。', pt: 'uma coisa grande.',
    });
    expect(said('STATE_NATION', { definiteness: 'indefinite', adjectives: ['BIG'] })).toEqual({
      en: 'a big state.', it: 'un grande Stato.', fr: 'un grand État.', de: 'ein großer Staat.', es: 'un Estado grande.',
      ja: '大きい国家。', pt: 'um Estado grande.',
    });
    expect(said('WORLD', { definiteness: 'indefinite', adjectives: ['BIG'] })).toMatchObject({
      it: 'un grande mondo.', fr: 'un grand monde.', de: 'eine große Welt.',
    });
  });

  test('STUDENT has a feminine in the five languages that have one', () => {
    // Spanish and Portuguese write it as the masculine; the article carries it.
    expect(said('STUDENT', { definiteness: 'indefinite', gender: 'fem' })).toEqual({
      en: 'a student.', it: 'una studentessa.', fr: 'une étudiante.', de: 'eine Studentin.', es: 'una estudiante.',
      ja: '学生。', pt: 'uma estudante.',
    });
    expect(said('STUDENT', { definiteness: 'definite', gender: 'fem', number: 'plural' })).toEqual({
      en: 'the students.', it: 'le studentesse.', fr: 'les étudiantes.', de: 'die Studentinnen.', es: 'las estudiantes.',
      ja: '学生。', pt: 'as estudantes.',
    });
  });

  test('German Student is a weak masculine: -en in every case but the nominative', () => {
    expect(sayAll(clause(the('MAN'), 'SEE', { directObject: the('STUDENT') })).de).toBe('der Mann sieht den Studenten.');
    expect(sayAll(clause(the('MAN'), 'GIVE', { directObject: the('BOOK'), complements: { terminus: { phrase: the('STUDENT') } } })).de)
      .toBe('der Mann gibt dem Studenten das Buch.');
    expect(sayAll({ subject: { concept: 'NAME_NOUN', definiteness: 'definite', possessor: the('STUDENT') } })).toMatchObject({
      en: "the student's name.", it: 'il nome dello studente.', fr: "le nom de l'étudiant.", de: 'der Name des Studenten.',
    });
  });

  test('a locative on the new places', () => {
    expect(sayAll(clause(the('STUDENT'), 'LEARN', { complements: { locative: { phrase: the('SCHOOL') } } }))).toEqual({
      en: 'the student learns in the school.', it: 'lo studente impara nella scuola.', fr: "l'étudiant apprend dans l'école.",
      de: 'der Student lernt in der Schule.', es: 'el estudiante aprende en la escuela.', ja: '学生は学校で学びます。',
      pt: 'o estudante aprende na escola.',
    });
    // Italian contracts the article before the capital: nello Stato.
    expect(sayAll(clause(the('MAN'), 'LIVE', { complements: { locative: { phrase: the('STATE_NATION') } } }))).toMatchObject({
      it: "l'uomo abita nello Stato.", fr: "l'homme habite dans l'État.", de: 'der Mann wohnt im Staat.', pt: 'o homem mora no Estado.',
    });
  });

  test('THING is the root above OBJECT_THING; the new places and persons hang under their genus', () => {
    const byId = conceptIndex(concepts);
    const concept = (id: string) => concepts.find((c) => c.id === id)!;
    // /generalize OBJECT_THING into THING: OBJECT_THING was a root, so the chain is pure gain.
    expect(ancestors('OBJECT_THING', byId)).toEqual(['THING']);
    expect(ancestors('THING', byId)).toEqual([]);
    // A child of OBJECT_THING reaches THING through it, not in its place.
    const child = concepts.find((c) => c.isA === 'OBJECT_THING')!;
    expect(ancestors(child.id, byId)).toEqual(['OBJECT_THING', 'THING']);
    // "thing" is THING's label now, so OBJECT_THING's synonym no longer says it.
    expect(concept('OBJECT_THING').synonym).toBe('item');
    expect(ancestors('SCHOOL', byId)).toEqual(['BUILDING', 'PLACE']);
    expect(ancestors('STUDENT', byId)).toEqual(['PERSON']);
    expect(ancestors('WORLD', byId)).toEqual(['PLACE']);
    expect(ancestors('HAND', byId)).toEqual(['ORGAN']);
    expect(['CASE_INSTANCE', 'PROGRAM_SOFTWARE', 'PROGRAM_SHOW', 'COMPANY_BUSINESS', 'STATE_NATION'].map((id) => concept(id).synonym))
      .toEqual(['instance', 'software', 'show', 'business', 'polity']);
  });
});

describe('the verbs: the persons, the tenses and the aspects their languages inflect', () => {
  test('LEARN, intransitive: present, simple past, resultative, future and negation', () => {
    expect(sayAll(clause(the('WOMAN'), 'LEARN'))).toEqual({
      en: 'the woman learns.', it: 'la donna impara.', fr: 'la femme apprend.', de: 'die Frau lernt.', es: 'la mujer aprende.',
      ja: '女は学びます。', pt: 'a mulher aprende.',
    });
    // apprendre's strong past, apprit.
    expect(sayAll(clause(the('WOMAN'), 'LEARN', { verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'the woman learned.', it: 'la donna imparò.', fr: 'la femme apprit.', de: 'die Frau lernte.', es: 'la mujer aprendió.',
      ja: '女は学びました。', pt: 'a mulher aprendeu.',
    });
    // imparare takes avere, so the participle does not agree with the feminine subject.
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), 'LEARN', { verbPhrase: { aspect: 'resultative' } }))).toEqual({
      en: 'the cat has learned.', it: 'la gatta ha imparato.', fr: 'la chatte a appris.', de: 'die Katze hat gelernt.',
      es: 'la gata ha aprendido.', ja: '猫は学びました。', pt: 'a gata aprendeu.',
    });
    expect(sayAll(clause(the('MAN', { number: 'plural' }), 'LEARN', { verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the men will learn.', it: 'gli uomini impareranno.', fr: 'les hommes apprendront.', de: 'die Männer werden lernen.',
      es: 'los hombres aprenderán.', ja: '男は学びます。', pt: 'os homens aprenderão.',
    });
    expect(sayAll(clause(the('MAN'), 'LEARN', { verbPhrase: { negative: true } }))).toEqual({
      en: 'the man does not learn.', it: "l'uomo non impara.", fr: "l'homme n'apprend pas.", de: 'der Mann lernt nicht.',
      es: 'el hombre no aprende.', ja: '男は学びません。', pt: 'o homem não aprende.',
    });
  });

  test('SELL, ditransitive: present, simple past, resultative, future and negation', () => {
    expect(sayAll(clause(the('WOMAN'), 'SELL', { directObject: the('BOOK') }))).toEqual({
      en: 'the woman sells the book.', it: 'la donna vende il libro.', fr: 'la femme vend le livre.', de: 'die Frau verkauft das Buch.',
      es: 'la mujer vende el libro.', ja: '女は本を売ります。', pt: 'a mulher vende o livro.',
    });
    // sold, vendette, vendit.
    expect(sayAll(clause(the('WOMAN'), 'SELL', { directObject: the('BOOK'), verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'the woman sold the book.', it: 'la donna vendette il libro.', fr: 'la femme vendit le livre.', de: 'die Frau verkaufte das Buch.',
      es: 'la mujer vendió el libro.', ja: '女は本を売りました。', pt: 'a mulher vendeu o livro.',
    });
    // verkauft takes no ge- after its unstressed ver-.
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), 'SELL', { directObject: the('BOOK'), verbPhrase: { aspect: 'resultative' } }))).toEqual({
      en: 'the cat has sold the book.', it: 'la gatta ha venduto il libro.', fr: 'la chatte a vendu le livre.',
      de: 'die Katze hat das Buch verkauft.', es: 'la gata ha vendido el libro.', ja: '猫は本を売りました。', pt: 'a gata vendeu o livro.',
    });
    expect(sayAll(clause(the('MAN', { number: 'plural' }), 'SELL', { directObject: the('BOOK'), verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the men will sell the book.', it: 'gli uomini venderanno il libro.', fr: 'les hommes vendront le livre.',
      de: 'die Männer werden das Buch verkaufen.', es: 'los hombres venderán el libro.', ja: '男は本を売ります。', pt: 'os homens venderão o livro.',
    });
    expect(sayAll(clause(the('MAN'), 'SELL', { directObject: the('BOOK'), verbPhrase: { negative: true } }))).toEqual({
      en: 'the man does not sell the book.', it: "l'uomo non vende il libro.", fr: "l'homme ne vend pas le livre.",
      de: 'der Mann verkauft das Buch nicht.', es: 'el hombre no vende el libro.', ja: '男は本を売りません。', pt: 'o homem não vende o livro.',
    });
  });

  test('SELL takes the buyer as its terminus, a German dative', () => {
    expect(sayAll(clause(the('COMPANY_BUSINESS'), 'SELL', { directObject: the('PROGRAM_SOFTWARE'), complements: { terminus: { phrase: the('MAN') } } }))).toEqual({
      en: 'the company sells the program to the man.', it: "l'azienda vende il programma all'uomo.", fr: "l'entreprise vend le programme à l'homme.",
      de: 'die Firma verkauft dem Mann das Programm.', es: 'la empresa vende el programa al hombre.', ja: '会社は男にプログラムを売ります。',
      pt: 'a empresa vende o programa ao homem.',
    });
  });

  test('BROADCAST, transitive: present, simple past, resultative, future and negation', () => {
    // German ausstrahlen is separable: the particle closes a main clause.
    expect(sayAll(clause(the('WOMAN'), 'BROADCAST', { directObject: the('PROGRAM_SHOW') }))).toEqual({
      en: 'the woman broadcasts the program.', it: 'la donna trasmette il programma.', fr: "la femme diffuse l'émission.",
      de: 'die Frau strahlt die Sendung aus.', es: 'la mujer emite el programa.', ja: '女は番組を放送します。', pt: 'a mulher transmite o programa.',
    });
    // broadcast, trasmise, diffusa.
    expect(sayAll(clause(the('WOMAN'), 'BROADCAST', { directObject: the('PROGRAM_SHOW'), verbPhrase: { tense: 'past' } }))).toEqual({
      en: 'the woman broadcast the program.', it: 'la donna trasmise il programma.', fr: "la femme diffusa l'émission.",
      de: 'die Frau strahlte die Sendung aus.', es: 'la mujer emitió el programa.', ja: '女は番組を放送しました。', pt: 'a mulher transmitiu o programa.',
    });
    // The participles: broadcast, trasmesso, ausgestrahlt.
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), 'BROADCAST', { directObject: the('PROGRAM_SHOW'), verbPhrase: { aspect: 'resultative' } }))).toEqual({
      en: 'the cat has broadcast the program.', it: 'la gatta ha trasmesso il programma.', fr: "la chatte a diffusé l'émission.",
      de: 'die Katze hat die Sendung ausgestrahlt.', es: 'la gata ha emitido el programa.', ja: '猫は番組を放送しました。', pt: 'a gata transmitiu o programa.',
    });
    expect(sayAll(clause(the('MAN', { number: 'plural' }), 'BROADCAST', { directObject: the('PROGRAM_SHOW'), verbPhrase: { tense: 'future' } }))).toEqual({
      en: 'the men will broadcast the program.', it: 'gli uomini trasmetteranno il programma.', fr: "les hommes diffuseront l'émission.",
      de: 'die Männer werden die Sendung ausstrahlen.', es: 'los hombres emitirán el programa.', ja: '男は番組を放送します。',
      pt: 'os homens transmitirão o programa.',
    });
    expect(sayAll(clause(the('MAN'), 'BROADCAST', { directObject: the('PROGRAM_SHOW'), verbPhrase: { negative: true } }))).toEqual({
      en: 'the man does not broadcast the program.', it: "l'uomo non trasmette il programma.", fr: "l'homme ne diffuse pas l'émission.",
      de: 'der Mann strahlt die Sendung nicht aus.', es: 'el hombre no emite el programa.', ja: '男は番組を放送しません。',
      pt: 'o homem não transmite o programa.',
    });
  });

  test('BROADCAST in a relative clause and a command: the particle goes back on the verb, and first in the du command', () => {
    expect(sayAll({ subject: { concept: 'PROGRAM_SHOW', definiteness: 'definite', relative: { headRole: 'directObject', subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'BROADCAST' } } } })).toMatchObject({
      de: 'die Sendung, die man ausstrahlt.', fr: "l'émission qu'on diffuse.", ja: '放送する番組。',
    });
    expect(sayAll({ ...clause(np('SECOND_PERSON'), 'BROADCAST', { directObject: the('PROGRAM_SHOW') }), imperative: true })).toMatchObject({
      de: 'strahle die Sendung aus.', it: 'trasmetti il programma.', ja: '番組を放送してください。',
    });
  });

  // The check verb.test.ts's Italian table makes of every other verb: a feminine subject in the
  // resultative present, which shows the auxiliary and any participle agreement. All three take avere.
  test.each([
    ['LEARN', 'la gatta ha imparato.'],
    ['SELL', 'la gatta ha venduto.'],
    ['BROADCAST', 'la gatta ha trasmesso.'],
  ])('Italian resultative with a feminine subject: %s → %s', (verb, it) => {
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), verb, { verbPhrase: { aspect: 'resultative' } })).it).toBe(it);
  });
});

// ── The glosses ───────────────────────────────────────────────────────

describe('the glosses render in every language', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // B65. THING's whole phrase is a coordinated group, the first noun definition that is; Japanese
    // says "or" with か.
    ['THING', { en: 'an object or a concept.', it: 'un oggetto o un concetto.', fr: 'un objet ou un concept.', de: 'ein Gegenstand oder ein Begriff.', es: 'un objeto o un concepto.', ja: '物体か概念。', pt: 'um objeto ou um conceito.' }],
    // A modal in an object-gap relative.
    ['PROBLEM', { en: 'a state that one must change.', it: 'uno stato che si deve cambiare.', fr: "un état qu'on doit changer.", de: 'ein Zustand, den man ändern muss.', es: 'un estado que se debe cambiar.', ja: '変える必要がある状態。', pt: 'um estado que se deve mudar.' }],
    // THING's plain words: German Ding and Japanese もの lean concrete, which is marked here.
    ['CASE_INSTANCE', { en: 'a thing that happens.', it: 'una cosa che succede.', fr: 'une chose qui arrive.', de: 'ein Ding, das geschieht.', es: 'una cosa que ocurre.', ja: '起こるもの。', pt: 'uma coisa que acontece.' }],
    // A negated HAVE, not the `no` determiner (nessuna dimensione, どの大きさもない).
    ['POINT_NOUN', { en: 'a place that does not have size.', it: 'un luogo che non ha dimensione.', fr: "un lieu qui n'a pas de taille.", de: 'ein Ort, der keine Größe hat.', es: 'un lugar que no tiene tamaño.', ja: '大きさがない場所。', pt: 'um lugar que não tem tamanho.' }],
    // The instrument gap with an object, on the shared base's TAKE (pt pegar).
    ['HAND', { en: 'an organ with which one takes an object.', it: 'un organo con il quale si prende un oggetto.', fr: 'un organe avec lequel on prend un objet.', de: 'ein Organ, mit dem man einen Gegenstand nimmt.', es: 'un órgano con el que se toma un objeto.', ja: '物体を取る器官。', pt: 'um órgão com o qual se pega um objeto.' }],
    // The relative agrees with GROUP, not with the parts: the whole works.
    ['SYSTEM', { en: 'a group of parts that works.', it: 'un gruppo di parti che funziona.', fr: 'un groupe de parties qui fonctionne.', de: 'eine Gruppe von Teilen, die funktioniert.', es: 'un grupo de partes que funciona.', ja: '動作する部分のグループ。', pt: 'um grupo de partes que funciona.' }],
    ['PROGRAM_SOFTWARE', { en: 'a list of instructions.', it: 'un elenco di istruzioni.', fr: "une liste d'instructions.", de: 'eine Liste von Anweisungen.', es: 'una lista de instrucciones.', ja: '指示の一覧。', pt: 'uma lista de instruções.' }],
    // A mass head, bare; German's separable ausstrahlen, whole again in the relative.
    ['PROGRAM_SHOW', { en: 'content that one broadcasts.', it: 'contenuto che si trasmette.', fr: "contenu qu'on diffuse.", de: 'Inhalt, den man ausstrahlt.', es: 'contenido que se emite.', ja: '放送する内容。', pt: 'conteúdo que se transmite.' }],
    // French writes a verb citation's bare object as the generic definite, as EXPORT's "transférer le
    // contenu à un lieu" does; German puts the dative first.
    ['BROADCAST', { en: 'to send content to many people.', it: 'mandare contenuto a molte persone.', fr: 'envoyer le contenu à beaucoup de personnes.', de: 'vielen Personen Inhalt schicken.', es: 'enviar contenido a muchas personas.', ja: '多くの人に内容を送る。', pt: 'enviar conteúdo a muitas pessoas.' }],
    // B64. A locative gap on a building: German in dem, not the an dem of Ort.
    ['SCHOOL', { en: 'a building where one learns.', it: 'un edificio dove si impara.', fr: "un bâtiment où l'on apprend.", de: 'ein Gebäude, in dem man lernt.', es: 'un edificio donde se aprende.', ja: '学ぶ建物。', pt: 'um edifício onde se aprende.' }],
    ['STUDENT', { en: 'a person who learns.', it: 'una persona che impara.', fr: 'une personne qui apprend.', de: 'eine Person, die lernt.', es: 'una persona que aprende.', ja: '学ぶ人。', pt: 'uma pessoa que aprende.' }],
    ['COMPANY_BUSINESS', { en: 'a group that sells.', it: 'un gruppo che vende.', fr: 'un groupe qui vend.', de: 'eine Gruppe, die verkauft.', es: 'un grupo que vende.', ja: '売るグループ。', pt: 'um grupo que vende.' }],
    // On SYSTEM, which B65 glosses: the one row that pins both tickets.
    ['STATE_NATION', { en: 'a system that governs a country.', it: 'un sistema che governa un paese.', fr: 'un système qui gouverne un pays.', de: 'ein System, das ein Land regiert.', es: 'un sistema que gobierna un país.', ja: '国を統治するシステム。', pt: 'um sistema que governa um país.' }],
    // A definite head and an object under `all`.
    ['WORLD', { en: 'the place that includes all countries.', it: 'il luogo che include tutti i paesi.', fr: 'le lieu qui inclut tous les pays.', de: 'der Ort, der alle Länder umfasst.', es: 'el lugar que incluye todos los países.', ja: 'すべての国を含む場所。', pt: 'o lugar que inclui todos os países.' }],
    // ACQUIRE's shape, "to begin to have", Japanese ことが始まる included.
    ['LEARN', { en: 'to begin to know.', it: 'iniziare a sapere.', fr: 'commencer à savoir.', de: 'beginnen, zu wissen.', es: 'empezar a saber.', ja: '知ることが始まる。', pt: 'começar a saber.' }],
    // BUY's counterpart, on EXCHANGE's purpose clause.
    ['SELL', { en: 'to give objects to acquire money.', it: 'dare oggetti per acquisire denaro.', fr: "donner des objets pour acquérir de l'argent.", de: 'Gegenstände geben, um Geld zu erwerben.', es: 'dar objetos para adquirir dinero.', ja: 'お金を取得するために物体をあげる。', pt: 'dar objetos para adquirir dinheiro.' }],
  ])('%s', (concept, rendered) => {
    expect(definitionAll(concept)).toEqual(rendered);
  });

  test('THING glosses the root; OBJECT_THING, its material half, stays on the literal', () => {
    // Both cannot ship: "an object or a concept" and "a thing that one can take" would define only
    // each other (C26's BODY and ORGAN rule).
    expect(concepts.find((c) => c.id === 'OBJECT_THING')?.definition).toBeUndefined();
    expect(concepts.find((c) => c.id === 'THING')?.definition?.subject).toHaveProperty('conjuncts');
  });
});
