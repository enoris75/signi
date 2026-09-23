import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// docs/localization B61: P09's handling and leaving verbs — GET, PUT, KEEP, BRING, LEAVE_BEHIND,
// TURN, LOOK_AT, LEAVE_DEPART and GO_OUT, seeded here, and TAKE, seeded in the shared base — with the
// three differentia their glosses stand on, STAY, OUTSIDE and DIRECT_VERB. This file pins each new
// word's paradigm and every gloss the ticket shipped. The compound past each verb's Italian takes with
// a feminine subject is pinned here rather than in verb.test.ts's table, as the P09 lanes agreed.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });
const command = (verb: string, extra: Parameters<typeof clause>[2] = {}): PhrasePlan =>
  ({ ...clause(np('SECOND_PERSON'), verb, extra), imperative: true });
const seed = (id: string) => concepts.find((c) => c.id === id);

// ── The glosses ───────────────────────────────────────────────────────

describe('the glosses', () => {
  test.each<[string, Record<LanguageCode, string>]>([
    // ACQUIRE plus one complement, as BUY is "to acquire objects with money": the instrument for TAKE
    // (HAND is glossed back on it, B65), the source for GET. A228 is fixed, so Italian's animate
    // source is the plain "da" of a verb with no goal.
    ['TAKE', { en: 'to acquire objects with the hand.', it: 'acquisire oggetti con la mano.', fr: 'acquérir des objets avec la main.', de: 'Gegenstände mit der Hand erwerben.', es: 'adquirir objetos con la mano.', ja: '手で物体を取得する。', pt: 'adquirir objetos com a mão.' }],
    ['GET', { en: 'to acquire objects from a person.', it: 'acquisire oggetti da una persona.', fr: "acquérir des objets d'une personne.", de: 'Gegenstände von einer Person erwerben.', es: 'adquirir objetos de una persona.', ja: '人から物体を取得する。', pt: 'adquirir objetos de uma pessoa.' }],
    // The causatives, REMOVE's shape: on BE, COME and STAY. A218 is fixed: German Ort takes "an".
    ['PUT', { en: 'to cause an object to be in a place.', it: 'indurre un oggetto a essere in un luogo.', fr: 'induire un objet à être dans un lieu.', de: 'einen Gegenstand veranlassen, an einem Ort zu sein.', es: 'inducir un objeto a estar en un lugar.', ja: '物体が場所にあるようにする。', pt: 'induzir um objeto a estar em um lugar.' }],
    ['BRING', { en: 'to cause an object to come.', it: 'indurre un oggetto a venire.', fr: 'induire un objet à venir.', de: 'einen Gegenstand veranlassen zu kommen.', es: 'inducir un objeto a venir.', ja: '物体が来るようにする。', pt: 'induzir um objeto a vir.' }],
    ['LEAVE_BEHIND', { en: 'to cause an object to stay.', it: 'indurre un oggetto a restare.', fr: 'induire un objet à rester.', de: 'einen Gegenstand veranlassen zu bleiben.', es: 'inducir un objeto a quedarse.', ja: '物体が残るようにする。', pt: 'induzir um objeto a ficar.' }],
    // STILL before English's "to" is the frequency adverb's place by design.
    ['KEEP', { en: 'still to have objects.', it: 'avere ancora oggetti.', fr: 'avoir encore des objets.', de: 'noch Gegenstände haben.', es: 'tener todavía objetos.', ja: '物体をまだ持つ。', pt: 'ter ainda objetos.' }],
    ['STAY', { en: 'still to be in a place.', it: 'essere ancora in un luogo.', fr: 'être encore dans un lieu.', de: 'noch an einem Ort sein.', es: 'estar todavía en un lugar.', ja: '場所にまだいる。', pt: 'estar ainda em um lugar.' }],
    // The first `around` route in a verb gloss, on the reflexive genus.
    ['TURN', { en: 'to move around a point.', it: 'muoversi intorno a un punto.', fr: "se déplacer autour d'un point.", de: 'sich um einen Punkt bewegen.', es: 'moverse alrededor de un punto.', ja: '点の周りを移動する。', pt: 'mover-se ao redor de um ponto.' }],
    // French diriger fixes "vers"; Italian rivolgere takes "a".
    ['LOOK_AT', { en: 'to direct the eyes to an object.', it: 'rivolgere gli occhi a un oggetto.', fr: 'diriger les yeux vers un objet.', de: 'die Augen zu einem Gegenstand richten.', es: 'dirigir los ojos a un objeto.', ja: '物体へ目を向ける。', pt: 'dirigir os olhos a um objeto.' }],
    // ACQUIRE's inchoative on GO.
    ['LEAVE_DEPART', { en: 'to begin to go.', it: 'iniziare ad andare.', fr: 'commencer à aller.', de: 'beginnen zu gehen.', es: 'empezar a ir.', ja: '行くことが始まる。', pt: 'começar a ir.' }],
    ['GO_OUT', { en: 'to go outside.', it: 'andare fuori.', fr: 'aller dehors.', de: 'nach draußen gehen.', es: 'ir afuera.', ja: '外に行く。', pt: 'ir para fora.' }],
    // C25's complement gloss, the goal as UP's is, narrowed by a relative clause.
    ['OUTSIDE', { en: 'to a place that is not in a building.', it: 'a un luogo che non è in un edificio.', fr: "à un lieu qui n'est pas dans un bâtiment.", de: 'zu einem Ort, der nicht in einem Gebäude ist.', es: 'a un lugar que no está en un edificio.', ja: '建物にない場所へ。', pt: 'a um lugar que não está em um edifício.' }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });

  test('DIRECT_VERB, a root LOOK_AT stands on, stays on the literal', () => {
    expect(seed('DIRECT_VERB')?.definition).toBeUndefined();
  });

  // The three "leave" tell each other apart: LEAVE (exit) is glossed nowhere, and the two new ones
  // share no word in any language.
  test('the two new "leave" glosses differ in every language', () => {
    const depart = definitionAll('LEAVE_DEPART');
    const behind = definitionAll('LEAVE_BEHIND');
    for (const language of Object.keys(depart) as LanguageCode[]) expect(depart[language]).not.toBe(behind[language]);
  });
});

// ── The words ─────────────────────────────────────────────────────────

describe('where the words hang, and what the picker says beside them', () => {
  test('isA', () => {
    const isA = (id: string) => seed(id)?.isA;
    expect(['GET', 'KEEP', 'TURN', 'LEAVE_DEPART', 'GO_OUT'].map(isA)).toEqual(['ACQUIRE', 'HAVE', 'MOVE_ONESELF', 'GO', 'GO']);
  });

  // English has three "leave" now, and TURN's "rotate" keeps it apart from TURN_OFF.
  test('synonyms', () => {
    const synonym = (id: string) => seed(id)?.synonym;
    expect(['LEAVE', 'LEAVE_BEHIND', 'LEAVE_DEPART', 'TURN'].map(synonym)).toEqual(['exit', 'leave behind', 'depart', 'rotate']);
  });

  test('OUTSIDE is a direction adverb, as UP and DOWN are', () => {
    expect(Object.values(seed('OUTSIDE')!.forms).map((f) => f['subtype'])).toEqual(Array(7).fill('direction'));
  });
});

// Present, simple past, resultative (a feminine subject, for the Romance agreement), future and
// negation, for every new verb.
describe('the transitive verbs: persons, tenses and aspects', () => {
  test.each<[string, string, Record<LanguageCode, string>[]]>([
    ['GET', 'BOOK', [
      { en: 'the woman gets the book.', it: 'la donna ottiene il libro.', fr: 'la femme obtient le livre.', de: 'die Frau bekommt das Buch.', es: 'la mujer consigue el libro.', ja: '女は本を手に入れます。', pt: 'a mulher consegue o livro.' },
      { en: 'the woman got the book.', it: 'la donna ottenne il libro.', fr: 'la femme obtint le livre.', de: 'die Frau bekam das Buch.', es: 'la mujer consiguió el libro.', ja: '女は本を手に入れました。', pt: 'a mulher conseguiu o livro.' },
      // The British participle, as the corpus spells labour.
      { en: 'the cat has got the book.', it: 'la gatta ha ottenuto il libro.', fr: 'la chatte a obtenu le livre.', de: 'die Katze hat das Buch bekommen.', es: 'la gata ha conseguido el libro.', ja: '猫は本を手に入れました。', pt: 'a gata conseguiu o livro.' },
      { en: 'the men will get the book.', it: 'gli uomini otterranno il libro.', fr: 'les hommes obtiendront le livre.', de: 'die Männer werden das Buch bekommen.', es: 'los hombres conseguirán el libro.', ja: '男は本を手に入れます。', pt: 'os homens conseguirão o livro.' },
      { en: 'the man does not get the book.', it: "l'uomo non ottiene il libro.", fr: "l'homme n'obtient pas le livre.", de: 'der Mann bekommt das Buch nicht.', es: 'el hombre no consigue el libro.', ja: '男は本を手に入れません。', pt: 'o homem não consegue o livro.' },
    ]],
    ['PUT', 'BOOK', [
      { en: 'the woman puts the book.', it: 'la donna mette il libro.', fr: 'la femme met le livre.', de: 'die Frau legt das Buch.', es: 'la mujer pone el libro.', ja: '女は本を置きます。', pt: 'a mulher põe o livro.' },
      { en: 'the woman put the book.', it: 'la donna mise il libro.', fr: 'la femme mit le livre.', de: 'die Frau legte das Buch.', es: 'la mujer puso el libro.', ja: '女は本を置きました。', pt: 'a mulher pôs o livro.' },
      { en: 'the cat has put the book.', it: 'la gatta ha messo il libro.', fr: 'la chatte a mis le livre.', de: 'die Katze hat das Buch gelegt.', es: 'la gata ha puesto el libro.', ja: '猫は本を置きました。', pt: 'a gata pôs o livro.' },
      { en: 'the men will put the book.', it: 'gli uomini metteranno il libro.', fr: 'les hommes mettront le livre.', de: 'die Männer werden das Buch legen.', es: 'los hombres pondrán el libro.', ja: '男は本を置きます。', pt: 'os homens porão o livro.' },
      { en: 'the man does not put the book.', it: "l'uomo non mette il libro.", fr: "l'homme ne met pas le livre.", de: 'der Mann legt das Buch nicht.', es: 'el hombre no pone el libro.', ja: '男は本を置きません。', pt: 'o homem não põe o livro.' },
    ]],
    ['KEEP', 'BOOK', [
      { en: 'the woman keeps the book.', it: 'la donna tiene il libro.', fr: 'la femme garde le livre.', de: 'die Frau behält das Buch.', es: 'la mujer conserva el libro.', ja: '女は本を取っておきます。', pt: 'a mulher guarda o livro.' },
      { en: 'the woman kept the book.', it: 'la donna tenne il libro.', fr: 'la femme garda le livre.', de: 'die Frau behielt das Buch.', es: 'la mujer conservó el libro.', ja: '女は本を取っておきました。', pt: 'a mulher guardou o livro.' },
      { en: 'the cat has kept the book.', it: 'la gatta ha tenuto il libro.', fr: 'la chatte a gardé le livre.', de: 'die Katze hat das Buch behalten.', es: 'la gata ha conservado el libro.', ja: '猫は本を取っておきました。', pt: 'a gata guardou o livro.' },
      { en: 'the men will keep the book.', it: 'gli uomini terranno il libro.', fr: 'les hommes garderont le livre.', de: 'die Männer werden das Buch behalten.', es: 'los hombres conservarán el libro.', ja: '男は本を取っておきます。', pt: 'os homens guardarão o livro.' },
      { en: 'the man does not keep the book.', it: "l'uomo non tiene il libro.", fr: "l'homme ne garde pas le livre.", de: 'der Mann behält das Buch nicht.', es: 'el hombre no conserva el libro.', ja: '男は本を取っておきません。', pt: 'o homem não guarda o livro.' },
    ]],
    ['BRING', 'BOOK', [
      { en: 'the woman brings the book.', it: 'la donna porta il libro.', fr: 'la femme apporte le livre.', de: 'die Frau bringt das Buch.', es: 'la mujer trae el libro.', ja: '女は本を持ってきます。', pt: 'a mulher traz o livro.' },
      { en: 'the woman brought the book.', it: 'la donna portò il libro.', fr: 'la femme apporta le livre.', de: 'die Frau brachte das Buch.', es: 'la mujer trajo el libro.', ja: '女は本を持ってきました。', pt: 'a mulher trouxe o livro.' },
      { en: 'the cat has brought the book.', it: 'la gatta ha portato il libro.', fr: 'la chatte a apporté le livre.', de: 'die Katze hat das Buch gebracht.', es: 'la gata ha traído el libro.', ja: '猫は本を持ってきました。', pt: 'a gata trouxe o livro.' },
      { en: 'the men will bring the book.', it: 'gli uomini porteranno il libro.', fr: 'les hommes apporteront le livre.', de: 'die Männer werden das Buch bringen.', es: 'los hombres traerán el libro.', ja: '男は本を持ってきます。', pt: 'os homens trarão o livro.' },
      { en: 'the man does not bring the book.', it: "l'uomo non porta il libro.", fr: "l'homme n'apporte pas le livre.", de: 'der Mann bringt das Buch nicht.', es: 'el hombre no trae el libro.', ja: '男は本を持ってきません。', pt: 'o homem não traz o livro.' },
    ]],
    // zurücklassen is separable: lässt … zurück, zurückgelassen.
    ['LEAVE_BEHIND', 'BOOK', [
      { en: 'the woman leaves the book.', it: 'la donna lascia il libro.', fr: 'la femme laisse le livre.', de: 'die Frau lässt das Buch zurück.', es: 'la mujer deja el libro.', ja: '女は本を置いていきます。', pt: 'a mulher deixa o livro.' },
      { en: 'the woman left the book.', it: 'la donna lasciò il libro.', fr: 'la femme laissa le livre.', de: 'die Frau ließ das Buch zurück.', es: 'la mujer dejó el libro.', ja: '女は本を置いていきました。', pt: 'a mulher deixou o livro.' },
      { en: 'the cat has left the book.', it: 'la gatta ha lasciato il libro.', fr: 'la chatte a laissé le livre.', de: 'die Katze hat das Buch zurückgelassen.', es: 'la gata ha dejado el libro.', ja: '猫は本を置いていきました。', pt: 'a gata deixou o livro.' },
      { en: 'the men will leave the book.', it: 'gli uomini lasceranno il libro.', fr: 'les hommes laisseront le livre.', de: 'die Männer werden das Buch zurücklassen.', es: 'los hombres dejarán el libro.', ja: '男は本を置いていきます。', pt: 'os homens deixarão o livro.' },
      { en: 'the man does not leave the book.', it: "l'uomo non lascia il libro.", fr: "l'homme ne laisse pas le livre.", de: 'der Mann lässt das Buch nicht zurück.', es: 'el hombre no deja el libro.', ja: '男は本を置いていきません。', pt: 'o homem não deixa o livro.' },
    ]],
    // The object's preposition is lexical in English and Portuguese; ansehen is separable.
    ['LOOK_AT', 'BOOK', [
      { en: 'the woman looks at the book.', it: 'la donna guarda il libro.', fr: 'la femme regarde le livre.', de: 'die Frau sieht das Buch an.', es: 'la mujer mira el libro.', ja: '女は本を見ます。', pt: 'a mulher olha para o livro.' },
      { en: 'the woman looked at the book.', it: 'la donna guardò il libro.', fr: 'la femme regarda le livre.', de: 'die Frau sah das Buch an.', es: 'la mujer miró el libro.', ja: '女は本を見ました。', pt: 'a mulher olhou para o livro.' },
      { en: 'the cat has looked at the book.', it: 'la gatta ha guardato il libro.', fr: 'la chatte a regardé le livre.', de: 'die Katze hat das Buch angesehen.', es: 'la gata ha mirado el libro.', ja: '猫は本を見ました。', pt: 'a gata olhou para o livro.' },
      { en: 'the men will look at the book.', it: 'gli uomini guarderanno il libro.', fr: 'les hommes regarderont le livre.', de: 'die Männer werden das Buch ansehen.', es: 'los hombres mirarán el libro.', ja: '男は本を見ます。', pt: 'os homens olharão para o livro.' },
      { en: 'the man does not look at the book.', it: "l'uomo non guarda il libro.", fr: "l'homme ne regarde pas le livre.", de: 'der Mann sieht das Buch nicht an.', es: 'el hombre no mira el libro.', ja: '男は本を見ません。', pt: 'o homem não olha para o livro.' },
    ]],
    ['DIRECT_VERB', 'EYE', [
      { en: 'the woman directs the eye.', it: "la donna rivolge l'occhio.", fr: "la femme dirige l'œil.", de: 'die Frau richtet das Auge.', es: 'la mujer dirige el ojo.', ja: '女は目を向けます。', pt: 'a mulher dirige o olho.' },
      { en: 'the woman directed the eye.', it: "la donna rivolse l'occhio.", fr: "la femme dirigea l'œil.", de: 'die Frau richtete das Auge.', es: 'la mujer dirigió el ojo.', ja: '女は目を向けました。', pt: 'a mulher dirigiu o olho.' },
      { en: 'the cat has directed the eye.', it: "la gatta ha rivolto l'occhio.", fr: "la chatte a dirigé l'œil.", de: 'die Katze hat das Auge gerichtet.', es: 'la gata ha dirigido el ojo.', ja: '猫は目を向けました。', pt: 'a gata dirigiu o olho.' },
      { en: 'the men will direct the eye.', it: "gli uomini rivolgeranno l'occhio.", fr: "les hommes dirigeront l'œil.", de: 'die Männer werden das Auge richten.', es: 'los hombres dirigirán el ojo.', ja: '男は目を向けます。', pt: 'os homens dirigirão o olho.' },
      { en: 'the man does not direct the eye.', it: "l'uomo non rivolge l'occhio.", fr: "l'homme ne dirige pas l'œil.", de: 'der Mann richtet das Auge nicht.', es: 'el hombre no dirige el ojo.', ja: '男は目を向けません。', pt: 'o homem não dirige o olho.' },
    ]],
  ])('%s', (verb, object, [present, past, resultative, future, negative]) => {
    expect(sayAll(clause(the('WOMAN'), verb, { directObject: the(object) }))).toEqual(present);
    expect(sayAll(clause(the('WOMAN'), verb, { directObject: the(object), verbPhrase: { tense: 'past' } }))).toEqual(past);
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), verb, { directObject: the(object), verbPhrase: { aspect: 'resultative' } }))).toEqual(resultative);
    expect(sayAll(clause(the('MAN', { number: 'plural' }), verb, { directObject: the(object), verbPhrase: { tense: 'future' } }))).toEqual(future);
    expect(sayAll(clause(the('MAN'), verb, { directObject: the(object), verbPhrase: { negative: true } }))).toEqual(negative);
  });
});

describe('the intransitive verbs: persons, tenses and aspects', () => {
  test.each<[string, Record<LanguageCode, string>[]]>([
    // quedarse is pronominal; restare, rester and bleiben take BE.
    ['STAY', [
      { en: 'the woman stays.', it: 'la donna resta.', fr: 'la femme reste.', de: 'die Frau bleibt.', es: 'la mujer se queda.', ja: '女は残ります。', pt: 'a mulher fica.' },
      { en: 'the woman stayed.', it: 'la donna restò.', fr: 'la femme resta.', de: 'die Frau blieb.', es: 'la mujer se quedó.', ja: '女は残りました。', pt: 'a mulher ficou.' },
      { en: 'the cat has stayed.', it: 'la gatta è restata.', fr: 'la chatte est restée.', de: 'die Katze ist geblieben.', es: 'la gata se ha quedado.', ja: '猫は残りました。', pt: 'a gata ficou.' },
      { en: 'the men will stay.', it: 'gli uomini resteranno.', fr: 'les hommes resteront.', de: 'die Männer werden bleiben.', es: 'los hombres se quedarán.', ja: '男は残ります。', pt: 'os homens ficarão.' },
      { en: 'the man does not stay.', it: "l'uomo non resta.", fr: "l'homme ne reste pas.", de: 'der Mann bleibt nicht.', es: 'el hombre no se queda.', ja: '男は残りません。', pt: 'o homem não fica.' },
    ]],
    // German's reflexive pronoun is placed by the clause; the Romance verbs take HAVE.
    ['TURN', [
      { en: 'the woman turns.', it: 'la donna gira.', fr: 'la femme tourne.', de: 'die Frau dreht sich.', es: 'la mujer gira.', ja: '女は回ります。', pt: 'a mulher gira.' },
      { en: 'the woman turned.', it: 'la donna girò.', fr: 'la femme tourna.', de: 'die Frau drehte sich.', es: 'la mujer giró.', ja: '女は回りました。', pt: 'a mulher girou.' },
      { en: 'the cat has turned.', it: 'la gatta ha girato.', fr: 'la chatte a tourné.', de: 'die Katze hat sich gedreht.', es: 'la gata ha girado.', ja: '猫は回りました。', pt: 'a gata girou.' },
      { en: 'the men will turn.', it: 'gli uomini gireranno.', fr: 'les hommes tourneront.', de: 'die Männer werden sich drehen.', es: 'los hombres girarán.', ja: '男は回ります。', pt: 'os homens girarão.' },
      { en: 'the man does not turn.', it: "l'uomo non gira.", fr: "l'homme ne tourne pas.", de: 'der Mann dreht sich nicht.', es: 'el hombre no gira.', ja: '男は回りません。', pt: 'o homem não gira.' },
    ]],
    // weggehen is separable and takes sein, as partire and partir take BE.
    ['LEAVE_DEPART', [
      { en: 'the woman leaves.', it: 'la donna parte.', fr: 'la femme part.', de: 'die Frau geht weg.', es: 'la mujer parte.', ja: '女は出発します。', pt: 'a mulher parte.' },
      { en: 'the woman left.', it: 'la donna partì.', fr: 'la femme partit.', de: 'die Frau ging weg.', es: 'la mujer partió.', ja: '女は出発しました。', pt: 'a mulher partiu.' },
      { en: 'the cat has left.', it: 'la gatta è partita.', fr: 'la chatte est partie.', de: 'die Katze ist weggegangen.', es: 'la gata ha partido.', ja: '猫は出発しました。', pt: 'a gata partiu.' },
      { en: 'the men will leave.', it: 'gli uomini partiranno.', fr: 'les hommes partiront.', de: 'die Männer werden weggehen.', es: 'los hombres partirán.', ja: '男は出発します。', pt: 'os homens partirão.' },
      { en: 'the man does not leave.', it: "l'uomo non parte.", fr: "l'homme ne part pas.", de: 'der Mann geht nicht weg.', es: 'el hombre no parte.', ja: '男は出発しません。', pt: 'o homem não parte.' },
    ]],
    // English phrasal, German separable; BE in it/fr/de.
    ['GO_OUT', [
      { en: 'the woman goes out.', it: 'la donna esce.', fr: 'la femme sort.', de: 'die Frau geht hinaus.', es: 'la mujer sale.', ja: '女は出ます。', pt: 'a mulher sai.' },
      { en: 'the woman went out.', it: 'la donna uscì.', fr: 'la femme sortit.', de: 'die Frau ging hinaus.', es: 'la mujer salió.', ja: '女は出ました。', pt: 'a mulher saiu.' },
      { en: 'the cat has gone out.', it: 'la gatta è uscita.', fr: 'la chatte est sortie.', de: 'die Katze ist hinausgegangen.', es: 'la gata ha salido.', ja: '猫は出ました。', pt: 'a gata saiu.' },
      { en: 'the men will go out.', it: 'gli uomini usciranno.', fr: 'les hommes sortiront.', de: 'die Männer werden hinausgehen.', es: 'los hombres saldrán.', ja: '男は出ます。', pt: 'os homens sairão.' },
      { en: 'the man does not go out.', it: "l'uomo non esce.", fr: "l'homme ne sort pas.", de: 'der Mann geht nicht hinaus.', es: 'el hombre no sale.', ja: '男は出ません。', pt: 'o homem não sai.' },
    ]],
  ])('%s', (verb, [present, past, resultative, future, negative]) => {
    expect(sayAll(clause(the('WOMAN'), verb))).toEqual(present);
    expect(sayAll(clause(the('WOMAN'), verb, { verbPhrase: { tense: 'past' } }))).toEqual(past);
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), verb, { verbPhrase: { aspect: 'resultative' } }))).toEqual(resultative);
    expect(sayAll(clause(the('MAN', { number: 'plural' }), verb, { verbPhrase: { tense: 'future' } }))).toEqual(future);
    expect(sayAll(clause(the('MAN'), verb, { verbPhrase: { negative: true } }))).toEqual(negative);
  });
});

// verb.test.ts's Italian table, for the new verbs: essere and the feminine participle where the verb
// selects it, avere otherwise.
describe('feminine subject, resultative present: Italian, the new verbs', () => {
  test.each([
    ['GET', 'la gatta ha ottenuto.'], ['PUT', 'la gatta ha messo.'], ['KEEP', 'la gatta ha tenuto.'],
    ['BRING', 'la gatta ha portato.'], ['LEAVE_BEHIND', 'la gatta ha lasciato.'], ['LOOK_AT', 'la gatta ha guardato.'],
    ['DIRECT_VERB', 'la gatta ha rivolto.'], ['STAY', 'la gatta è restata.'], ['TURN', 'la gatta ha girato.'],
    ['LEAVE_DEPART', 'la gatta è partita.'], ['GO_OUT', 'la gatta è uscita.'],
  ])('%s → %s', (verb, it) => {
    expect(sayAll(clause(the('CAT', { gender: 'fem' }), verb, { verbPhrase: { aspect: 'resultative' } })).it).toBe(it);
  });
});

// ── The frames each verb was seeded for ───────────────────────────────

describe('the frames', () => {
  // PUT licenses both goals because two languages want opposite ones: German legen takes the
  // accusative of the direction ("ins Haus"), Japanese 置く the に of the locative (家に).
  test('PUT: German puts into, Japanese puts at', () => {
    const into = { direction: { phrase: the('HOUSE'), specifiers: [{ kind: 'path' as const, value: 'in' as const }] } };
    expect(sayAll(clause(the('MAN'), 'PUT', { directObject: the('BOOK'), complements: into }))).toMatchObject({
      en: 'the man puts the book into the house.', de: 'der Mann legt das Buch ins Haus.', it: "l'uomo mette il libro nella casa.",
    });
    expect(sayAll(clause(the('MAN'), 'PUT', { directObject: the('BOOK'), complements: { locative: { phrase: the('HOUSE') } } }))).toMatchObject({
      en: 'the man puts the book in the house.', ja: '男は家に本を置きます。', es: 'el hombre pone el libro en la casa.', pt: 'o homem põe o livro na casa.',
    });
  });

  // P09-E21: English's goal `on` is "onto" on every verb, a placement one too, as its goal `in` is
  // "into"; the locative keeps "on". Japanese へ after 置く is its own follow-up (it wants に).
  test('PUT: a goal on is "onto" in English, and the place "on"', () => {
    const on = (type: 'direction' | 'locative') => sayAll(clause(the('MAN'), 'PUT', {
      directObject: the('BOOK'),
      complements: { [type]: { phrase: the('HOUSE'), specifiers: [{ kind: 'path' as const, value: 'on' as const }] } },
    }));
    expect(on('direction')).toEqual({
      en: 'the man puts the book onto the house.',
      it: "l'uomo mette il libro sulla casa.",
      fr: "l'homme met le livre sur la maison.",
      de: 'der Mann legt das Buch auf das Haus.',
      es: 'el hombre pone el libro sobre la casa.',
      pt: 'o homem põe o livro sobre a casa.',
      ja: '男は家の上へ本を置きます。',
    });
    expect(on('locative').en).toBe('the man puts the book on the house.');
  });

  test('GET: the source is a plain "da" in Italian, a verb with no goal (A228)', () => {
    expect(sayAll(clause(the('MAN'), 'GET', { directObject: the('BOOK'), complements: { source: { phrase: the('CHILD') } } }))).toEqual({
      en: 'the man gets the book from the child.', it: "l'uomo ottiene il libro dal bambino.", fr: "l'homme obtient le livre de l'enfant.",
      de: 'der Mann bekommt das Buch vom Kind.', es: 'el hombre consigue el libro del niño.', ja: '男は子供から本を手に入れます。',
      pt: 'o homem consegue o livro da criança.',
    });
  });

  test('BRING: a goal', () => {
    expect(sayAll(clause(the('MAN'), 'BRING', { directObject: the('BOOK'), complements: { direction: { phrase: the('HOUSE') } } })))
      .toMatchObject({ en: 'the man brings the book to the house.', it: "l'uomo porta il libro alla casa.", de: 'der Mann bringt das Buch zum Haus.' });
  });

  // The place a thing is left in is where it then is: に, as 置く takes it.
  test('LEAVE_BEHIND: the place, and German\'s particle last', () => {
    expect(sayAll(clause(the('MAN'), 'LEAVE_BEHIND', { directObject: the('BOOK'), complements: { locative: { phrase: the('HOUSE') } } }))).toEqual({
      en: 'the man leaves the book in the house.', it: "l'uomo lascia il libro nella casa.", fr: "l'homme laisse le livre dans la maison.",
      de: 'der Mann lässt das Buch im Haus zurück.', es: 'el hombre deja el libro en la casa.', ja: '男は家に本を置いていきます。',
      pt: 'o homem deixa o livro na casa.',
    });
  });

  test('LOOK_AT: a pronoun object keeps each language\'s own place', () => {
    expect(sayAll(clause(the('MAN'), 'LOOK_AT', { directObject: { concept: 'THIRD_PERSON' } }))).toEqual({
      en: 'the man looks at him.', it: "l'uomo lo guarda.", fr: "l'homme le regarde.", de: 'der Mann sieht ihn an.',
      es: 'el hombre lo mira.', ja: '男は彼を見ます。', pt: 'o homem olha para ele.',
    });
  });

  test('TURN: around a place, the route', () => {
    const around = { route: { phrase: the('HOUSE'), specifiers: [{ kind: 'path' as const, value: 'around' as const }] } };
    expect(sayAll(clause(the('CAT'), 'TURN', { complements: around }))).toEqual({
      en: 'the cat turns around the house.', it: 'il gatto gira intorno alla casa.', fr: 'le chat tourne autour de la maison.',
      de: 'der Kater dreht sich um das Haus.', es: 'el gato gira alrededor de la casa.', ja: '猫は家の周りを回ります。',
      pt: 'o gato gira ao redor da casa.',
    });
  });

  test('LEAVE_DEPART: the place left is a source', () => {
    expect(sayAll(clause(the('MAN'), 'LEAVE_DEPART', { complements: { source: { phrase: the('HOUSE') } } }))).toEqual({
      en: 'the man leaves from the house.', it: "l'uomo parte dalla casa.", fr: "l'homme part de la maison.",
      de: 'der Mann geht aus dem Haus weg.', es: 'el hombre parte de la casa.', ja: '男は家から出発します。', pt: 'o homem parte da casa.',
    });
  });

  test('STAY: the place takes に in Japanese, as 住む does', () => {
    expect(sayAll(clause(the('CAT'), 'STAY', { complements: { locative: { phrase: the('HOUSE') } } }))).toEqual({
      en: 'the cat stays in the house.', it: 'il gatto resta nella casa.', fr: 'le chat reste dans la maison.', de: 'der Kater bleibt im Haus.',
      es: 'el gato se queda en la casa.', ja: '猫は家に残ります。', pt: 'o gato fica na casa.',
    });
  });

  test('GO_OUT: the aspects of a phrasal and a separable verb', () => {
    expect(sayAll(clause(the('MAN'), 'GO_OUT', { verbPhrase: { aspect: 'progressive' } }))).toEqual({
      en: 'the man is going out.', it: "l'uomo sta uscendo.", fr: "l'homme est en train de sortir.", de: 'der Mann geht gerade hinaus.',
      es: 'el hombre está saliendo.', ja: '男は出ています。', pt: 'o homem está saindo.',
    });
    expect(sayAll(clause(the('MAN'), 'GO_OUT', { verbPhrase: { modifier: 'FAST' } })))
      .toMatchObject({ en: 'the man goes out fast.', de: 'der Mann geht schnell hinaus.' });
  });

  // A direction adverb follows the object, as UP does.
  test('OUTSIDE: after the verb, and after the object', () => {
    expect(sayAll(clause(the('CAT'), 'GO', { verbPhrase: { modifier: 'OUTSIDE' } }))).toEqual({
      en: 'the cat goes outside.', it: 'il gatto va fuori.', fr: 'le chat va dehors.', de: 'der Kater geht nach draußen.',
      es: 'el gato va afuera.', ja: '猫は外に行きます。', pt: 'o gato vai para fora.',
    });
    expect(sayAll(clause(the('MAN'), 'MOVE', { directObject: the('BOOK'), verbPhrase: { modifier: 'OUTSIDE' } }))).toEqual({
      en: 'the man moves the book outside.', it: "l'uomo sposta il libro fuori.", fr: "l'homme déplace le livre dehors.",
      de: 'der Mann verschiebt das Buch nach draußen.', es: 'el hombre mueve el libro afuera.', ja: '男は本を外に移動します。',
      pt: 'o homem move o livro para fora.',
    });
  });
});

describe('the commands', () => {
  test('the irregular du forms, and the particle last', () => {
    expect(sayAll(command('LOOK_AT', { directObject: the('BOOK') }))).toMatchObject({ de: 'sieh das Buch an.', en: 'look at the book.', pt: 'olhe para o livro.' });
    expect(sayAll(command('LEAVE_BEHIND', { directObject: the('BOOK') }))).toMatchObject({ de: 'lass das Buch zurück.' });
    expect(sayAll(command('KEEP', { directObject: the('BOOK') }))).toMatchObject({ de: 'behalte das Buch.', it: 'tieni il libro.' });
    expect(sayAll(command('TURN'))).toMatchObject({ de: 'dreh dich.', es: 'gira.' });
    expect(sayAll(command('STAY'))).toEqual({ en: 'stay.', it: 'resta.', fr: 'reste.', de: 'bleib.', es: 'quédate.', ja: '残ってください。', pt: 'fique.' });
    expect(sayAll(command('LEAVE_DEPART'))).toMatchObject({ de: 'geh weg.', it: 'parti.', fr: 'pars.' });
  });

  // The subjunctive-based ones: the irregular 1sg stems carry over (pongas, salgas, traiga).
  test('the negative and the Portuguese commands read the 1st singular\'s stem', () => {
    expect(sayAll(command('PUT', { directObject: the('BOOK'), verbPhrase: { negative: true } })))
      .toMatchObject({ es: 'no pongas el libro.', pt: 'não ponha o livro.', it: 'non mettere il libro.' });
    expect(sayAll(command('GO_OUT', { verbPhrase: { negative: true } }))).toMatchObject({ es: 'no salgas.', pt: 'não saia.' });
    expect(sayAll(command('BRING', { directObject: the('BOOK') }))).toMatchObject({ es: 'trae el libro.', pt: 'traga o livro.' });
  });
});

// ── Known bugs ───────────────────────────────────────────────────────

// The Spanish affirmative tú command is the 3sg present unless mood.ts's ES_IMP_OVERRIDE, keyed by
// concept id, says otherwise. LEAVE has salir's "sal" there; GO_OUT, the same salir, and PUT's
// poner ("pon") do not.
describe('known bugs: the Spanish tú command of poner and salir under a new concept (A241)', () => {
  // Now: "pone el libro.", "sale." — Want: "pon el libro.", "sal."
  // Fixed: the table is keyed by the lemma, and the five families that take a prefixed compound
  // (hacer, poner, salir, tener, venir) match by ending, so a new concept on one of them reaches it.
  test('PUT and GO_OUT take the short tú command', () => {
    expect(sayAll(command('PUT', { directObject: the('BOOK') })).es).toBe('pon el libro.');
    expect(sayAll(command('GO_OUT')).es).toBe('sal.');
  });

  // Three more concepts were losing the same row, on three other lemmas: decir, venir and tener's
  // compound contener, whose short command carries the acute (contén, not *conten).
  test('the rest of the short commands, and a compound', () => {
    expect(sayAll(command('SAY', { directObject: the('WORD') })).es).toBe('di la palabra.');
    expect(sayAll(command('COME')).es).toBe('ven.');
    expect(sayAll(command('HOLD', { directObject: the('BOOK') })).es).toBe('contén el libro.');
  });

  test('regression: the concepts that already had their row keep it, and a regular verb is untouched', () => {
    expect(sayAll(command('LEAVE')).es).toBe('sal.');
    expect(sayAll(command('MAKE', { directObject: the('WORK_NOUN') })).es).toBe('haz el trabajo.');
    expect(sayAll(command('UNDO')).es).toBe('deshaz.');
    expect(sayAll(command('REDO')).es).toBe('rehaz.');
    expect(sayAll(command('HAVE', { directObject: the('BOOK') })).es).toBe('ten el libro.');
    expect(sayAll(command('BE')).es).toBe('sé.');
    expect(sayAll(command('GO')).es).toBe('ve.');
    expect(sayAll(command('TELL', { directObject: the('STORY') })).es).toBe('cuenta la historia.');
  });

  test('regression: the negative command still reads the subjunctive stem, and the other six are unchanged', () => {
    expect(sayAll(command('PUT', { directObject: the('BOOK'), verbPhrase: { negative: true } })).es).toBe('no pongas el libro.');
    expect(sayAll(command('GO_OUT', { verbPhrase: { negative: true } })).es).toBe('no salgas.');
    expect(sayAll(command('PUT', { directObject: the('BOOK') })))
      .toMatchObject({ it: 'metti il libro.', fr: 'mets le livre.', de: 'leg das Buch.', pt: 'ponha o livro.' });
  });
});
