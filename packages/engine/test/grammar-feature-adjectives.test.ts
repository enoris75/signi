import { describe, expect, test } from 'vitest';
import type { LanguageCode } from '@signi/shared';
import { LANGUAGES } from '@signi/shared';
import { np, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';

// Localization C24's grammar features and C27's grammar nouns. The features are the values the
// builder's chips and the console's commands set — a determiner's identifiability, a clause's kind,
// a conjunction's relation, a verb's aspect — and each is glossed by the headless relative clause
// (NounPhrase.relativeGloss) on the unit it is a value *of*: WORD for number, gender and polarity,
// DETERMINER, PRONOUN, CLAUSE for the clause kinds and the voices, CONJUNCTION, VERB for the
// aspects. That antecedent is never spoken, but it is why a German family shares its relative
// pronoun ("das …" of a Determinativ, "die …" of a Konjunktion, "der …" of a Satz). The four words
// the glosses stand on, KNOWN, FORMALITY, ASSERT and FACT, are pinned at the end.

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Record<LanguageCode, string> {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).map((t) => [t.language, t.text]),
  ) as Record<LanguageCode, string>;
}

type Row = [string, Record<LanguageCode, string>];

// ── The families (C24) ────────────────────────────────────────────────

const NUMBER_AND_GENDER: Row[] = [
  // SOLE, the word B58 seeded so SINGULAR_GRAMMAR would not say "a singular category".
  ['SINGULAR', { en: 'that indicates a sole object.', it: 'che indica un oggetto unico.', fr: 'qui indique un objet unique.', de: 'das einen einzigen Gegenstand bezeichnet.', es: 'que indica un objeto único.', ja: '単一の物体を示す。', pt: 'que indica um objeto único.' }],
  // One and others: Japanese marks no plural, and the coordination still says more than one.
  ['PLURAL', { en: 'that indicates an object and other objects.', it: 'che indica un oggetto e altri oggetti.', fr: "qui indique un objet et d'autres objets.", de: 'das einen Gegenstand und andere Gegenstände bezeichnet.', es: 'que indica un objeto y otros objetos.', ja: '物体と別の物体を示す。', pt: 'que indica um objeto e outros objetos.' }],
  // A coordinated predicate under negation: Japanese says it as 〜でも〜でもない, "neither … nor",
  // and the Romance adjectives agree with the unspoken antecedent (es "palabra" → "masculina").
  ['NEUTER', { en: 'that is not male or female.', it: 'che non è maschile o femminile.', fr: "qui n'est pas masculin ou féminin.", de: 'das nicht männlich oder weiblich ist.', es: 'que no es masculina o femenina.', ja: '男性でも女性でもない。', pt: 'que não é masculina ou feminina.' }],
];

const DETERMINERS: Row[] = [
  ['DEFINITE', { en: 'that indicates a known object.', it: 'che indica un oggetto noto.', fr: 'qui indique un objet connu.', de: 'das einen bekannten Gegenstand bezeichnet.', es: 'que indica un objeto conocido.', ja: '既知の物体を示す。', pt: 'que indica um objeto conhecido.' }],
  ['INDEFINITE', { en: 'that indicates an unknown object.', it: 'che indica un oggetto sconosciuto.', fr: 'qui indique un objet inconnu.', de: 'das einen unbekannten Gegenstand bezeichnet.', es: 'que indica un objeto desconocido.', ja: '不明な物体を示す。', pt: 'que indica um objeto desconhecido.' }],
  // The object gap on the generic "one": Italian and Spanish say it with the impersonal si/se.
  ['ZERO', { en: 'that one does not write.', it: 'che non si scrive.', fr: "qu'on n'écrit pas.", de: 'das man nicht schreibt.', es: 'que no se escribe.', ja: '書かない。', pt: 'que não se escreve.' }],
  ['PROXIMAL', { en: 'that indicates a near object.', it: 'che indica un oggetto vicino.', fr: 'qui indique un objet proche.', de: 'das einen nahen Gegenstand bezeichnet.', es: 'que indica un objeto cercano.', ja: '近い物体を示す。', pt: 'que indica um objeto próximo.' }],
  ['DISTAL', { en: 'that indicates a far object.', it: 'che indica un oggetto lontano.', fr: 'qui indique un objet lointain.', de: 'das einen fernen Gegenstand bezeichnet.', es: 'que indica un objeto lejano.', ja: '遠い物体を示す。', pt: 'que indica um objeto distante.' }],
  ['PARTITIVE', { en: 'that indicates a part.', it: 'che indica una parte.', fr: 'qui indique une partie.', de: 'das einen Teil bezeichnet.', es: 'que indica una parte.', ja: '部分を示す。', pt: 'que indica uma parte.' }],
  ['MULTAL', { en: 'that indicates a great quantity.', it: 'che indica una grande quantità.', fr: 'qui indique une grande quantité.', de: 'das eine große Menge bezeichnet.', es: 'que indica una cantidad grande.', ja: '大きい数量を示す。', pt: 'que indica uma quantidade grande.' }],
  ['PAUCAL', { en: 'that indicates a small quantity.', it: 'che indica una piccola quantità.', fr: 'qui indique une petite quantité.', de: 'das eine kleine Menge bezeichnet.', es: 'que indica una cantidad pequeña.', ja: '小さい数量を示す。', pt: 'que indica uma quantidade pequena.' }],
  ['UNIVERSAL', { en: 'that indicates the whole quantity.', it: 'che indica la quantità intera.', fr: 'qui indique la quantité entière.', de: 'das die ganze Menge bezeichnet.', es: 'que indica la cantidad entera.', ja: '全体の数量を示す。', pt: 'que indica a quantidade inteira.' }],
];

const PERSON: Row[] = [
  // Spanish marks a person object with "a".
  ['IMPERSONAL', { en: 'that indicates all people.', it: 'che indica tutte le persone.', fr: 'qui indique toutes les personnes.', de: 'das alle Personen bezeichnet.', es: 'que indica a todas las personas.', ja: 'すべての人を示す。', pt: 'que indica todas as pessoas.' }],
];

const CLAUSES: Row[] = [
  ['MAIN', { en: 'that governs other clauses.', it: 'che regge altre proposizioni.', fr: "qui régit d'autres propositions.", de: 'der andere Sätze regiert.', es: 'que rige otras oraciones.', ja: '別の節を支配する。', pt: 'que rege outras orações.' }],
  // An object gap with a named agent: German's relative pronoun is the accusative of *Satz*.
  ['COORDINATED', { en: 'that a conjunction links to another clause.', it: "che una congiunzione collega a un'altra proposizione.", fr: "qu'une conjonction relie à une autre proposition.", de: 'den eine Konjunktion mit einem anderen Satz verbindet.', es: 'que una conjunción enlaza a otra oración.', ja: '接続詞が別の節につなぐ。', pt: 'que uma conjunção liga a outra oração.' }],
];

const CONJUNCTIONS: Row[] = [
  ['COPULATIVE', { en: 'that adds a phrase to another phrase.', it: "che aggiunge una frase a un'altra frase.", fr: 'qui ajoute une phrase à une autre phrase.', de: 'die eine Phrase zu einer anderen Phrase hinzufügt.', es: 'que añade una frase a otra frase.', ja: '別のフレーズにフレーズを加える。', pt: 'que adiciona uma frase a outra frase.' }],
  ['DISJUNCTIVE', { en: 'that links options.', it: 'che collega opzioni.', fr: 'qui relie des options.', de: 'die Optionen verbindet.', es: 'que enlaza opciones.', ja: '選択肢をつなぐ。', pt: 'que liga opções.' }],
  ['ADVERSATIVE', { en: 'that links opposite clauses.', it: 'che collega proposizioni opposte.', fr: 'qui relie des propositions opposées.', de: 'die entgegengesetzte Sätze verbindet.', es: 'que enlaza oraciones opuestas.', ja: '反対の節をつなぐ。', pt: 'que liga orações opostas.' }],
  ['EXPLICATIVE', { en: 'that expresses the previous clause with other words.', it: 'che esprime la proposizione precedente con altre parole.', fr: "qui exprime la proposition précédente avec d'autres mots.", de: 'die den vorherigen Satz mit anderen Wörtern vermittelt.', es: 'que expresa la oración anterior con otras palabras.', ja: '別の単語で前の節を表す。', pt: 'que exprime a oração anterior com outras palavras.' }],
  // The essive object complement ("as a cause"), which takes no article in the Romance languages.
  ['CONCLUSIVE', { en: 'that uses the previous clause as a cause.', it: 'che usa la proposizione precedente come causa.', fr: 'qui utilise la proposition précédente comme cause.', de: 'die den vorherigen Satz als Ursache verwendet.', es: 'que usa la oración anterior como causa.', ja: '前の節を原因として使う。', pt: 'que usa a oração anterior como causa.' }],
  ['TEMPORAL', { en: 'that indicates the next action.', it: "che indica l'azione successiva.", fr: "qui indique l'action suivante.", de: 'die die nächste Handlung bezeichnet.', es: 'que indica la acción siguiente.', ja: '次の動作を示す。', pt: 'que indica a ação seguinte.' }],
];

const VOICES: Row[] = [
  ['ACTIVE_VOICE', { en: 'that uses the agent as the subject.', it: "che usa l'agente come soggetto.", fr: "qui utilise l'agent comme sujet.", de: 'der das Agens als Subjekt verwendet.', es: 'que usa el agente como sujeto.', ja: '動作主を主語として使う。', pt: 'que usa o agente como sujeito.' }],
  ['PASSIVE', { en: 'that uses the direct object as the subject.', it: 'che usa il complemento oggetto diretto come soggetto.', fr: "qui utilise le complément d'objet direct comme sujet.", de: 'der das direkte Objekt als Subjekt verwendet.', es: 'que usa el complemento directo como sujeto.', ja: '直接の目的語を主語として使う。', pt: 'que usa o objeto direto como sujeito.' }],
];

const ASPECTS: Row[] = [
  ['PROGRESSIVE', { en: 'that shows an action as a process.', it: "che mostra un'azione come processo.", fr: 'qui montre une action comme processus.', de: 'das eine Handlung als Prozess zeigt.', es: 'que muestra una acción como proceso.', ja: '動作を過程として見せる。', pt: 'que mostra uma ação como processo.' }],
  // A relative inside the relative, in the prospective itself: each language's "about to", and
  // German centre-embeds the inner clause between commas.
  ['PROSPECTIVE', { en: 'that shows an action that is about to begin.', it: "che mostra un'azione che sta per iniziare.", fr: 'qui montre une action qui est sur le point de commencer.', de: 'das eine Handlung, die im Begriff zu beginnen ist, zeigt.', es: 'que muestra una acción que está a punto de empezar.', ja: '始まろうとしている動作を見せる。', pt: 'que mostra uma ação que está prestes a começar.' }],
  ['RESULTATIVE', { en: 'that shows an action as a state.', it: "che mostra un'azione come stato.", fr: 'qui montre une action comme état.', de: 'das eine Handlung als Zustand zeigt.', es: 'que muestra una acción como estado.', ja: '動作を状態として見せる。', pt: 'que mostra uma ação como estado.' }],
];

const POLARITY_AND_STANCE: Row[] = [
  ['POSITIVE', { en: 'that does not negate.', it: 'che non nega.', fr: 'qui ne nie pas.', de: 'das nicht verneint.', es: 'que no niega.', ja: '否定しない。', pt: 'que não nega.' }],
  ['NEUTRAL', { en: 'that is not positive or negative.', it: 'che non è positiva o negativa.', fr: "qui n'est pas positif ou négatif.", de: 'das nicht positiv oder negativ ist.', es: 'que no es positiva o negativa.', ja: '肯定でも否定でもない。', pt: 'que não é positiva ou negativa.' }],
];

const THE_REST: Row[] = [
  // A genitive object: English's Saxon genitive, the others' "of".
  ['SPATIAL', { en: "that indicates an object's place.", it: 'che indica il luogo di un oggetto.', fr: "qui indique le lieu d'un objet.", de: 'die den Ort eines Gegenstands bezeichnet.', es: 'que indica el lugar de un objeto.', ja: '物体の場所を示す。', pt: 'que indica o lugar de um objeto.' }],
  ['SEMANTIC', { en: 'that one makes with meanings.', it: 'che si fa con significati.', fr: "qu'on fait avec des sens.", de: 'die man mit Bedeutungen macht.', es: 'que se hace con significados.', ja: '意味で作る。', pt: 'que se faz com significados.' }],
  ['DIRECT', { en: 'that does not go through another place.', it: 'che non va attraverso un altro luogo.', fr: 'qui ne va pas à travers un autre lieu.', de: 'der nicht durch einen anderen Ort geht.', es: 'que no va por otro lugar.', ja: '別の場所を行かない。', pt: 'que não vai por outro lugar.' }],
  ['INDIRECT', { en: 'that goes through another place.', it: 'che va attraverso un altro luogo.', fr: 'qui va à travers un autre lieu.', de: 'der durch einen anderen Ort geht.', es: 'que va por otro lugar.', ja: '別の場所を行く。', pt: 'que vai por outro lugar.' }],
  // The negative determiner concords with the verb where the language does (it "non ha nessuna").
  ['UNCONNECTED', { en: 'that has no relationships.', it: 'che non ha nessuna relazione.', fr: "qui n'a aucune relation.", de: 'das keine Beziehungen hat.', es: 'que no tiene ninguna relación.', ja: 'どの関係もない。', pt: 'que não tem nenhuma relação.' }],
];

describe('the grammar features are glossed by what they do (C24)', () => {
  test.each<Row>([
    ...NUMBER_AND_GENDER, ...DETERMINERS, ...PERSON, ...CLAUSES, ...CONJUNCTIONS, ...VOICES, ...ASPECTS,
    ...POLARITY_AND_STANCE, ...THE_REST,
  ])('%s', (id, expected) => {
    expect(definitionAll(id)).toEqual(expected);
  });
});

// A family is the values one control sets. Each member must say something the others do not, so
// no two may render alike in any one language — the sweep test's guard, narrowed to the set a
// reader sees side by side.
describe('every value of a control comes apart from the others, in every language', () => {
  const FAMILIES: [string, string[]][] = [
    ['number', ['SINGULAR', 'PLURAL']],
    ['identifiability', ['DEFINITE', 'INDEFINITE', 'ZERO']],
    ['deixis', ['PROXIMAL', 'DISTAL']],
    ['quantity', ['PARTITIVE', 'MULTAL', 'PAUCAL', 'UNIVERSAL']],
    ['clause kind', ['MAIN', 'COORDINATED']],
    ['conjunction', ['COPULATIVE', 'DISJUNCTIVE', 'ADVERSATIVE', 'EXPLICATIVE', 'CONCLUSIVE', 'TEMPORAL']],
    ['voice', ['ACTIVE_VOICE', 'PASSIVE']],
    ['aspect', ['PROGRESSIVE', 'PROSPECTIVE', 'RESULTATIVE', 'NEUTRAL']],
    ['stance', ['POSITIVE', 'NEUTRAL']],
    ['path', ['DIRECT', 'INDIRECT']],
  ];
  test.each(FAMILIES)('%s', (_family, ids) => {
    const glosses = ids.map(definitionAll);
    for (const language of Object.keys(LANGUAGES) as LanguageCode[]) {
      const texts = glosses.map((g) => g[language]);
      expect(new Set(texts).size, `${language}: ${texts.join(' | ')}`).toBe(ids.length);
    }
  });
});

// ── The grammar nouns (C27) ───────────────────────────────────────────

describe('the grammar nouns (C27)', () => {
  test.each<Row>([
    // An object gap with a named agent, on the masculine *Begriff*: German cannot read the action
    // as the one included.
    ['PARTICIPANT_GRAMMAR', { en: 'a concept that an action includes.', it: "un concetto che un'azione include.", fr: "un concept qu'une action inclut.", de: 'ein Begriff, den eine Handlung umfasst.', es: 'un concepto que una acción incluye.', ja: '動作が含む概念。', pt: 'um conceito que uma ação inclui.' }],
    // A genitive object inside the relative: "des Sprechers", 話し手の目的.
    ['MOOD', { en: "a feature that indicates the speaker's purpose.", it: 'una caratteristica che indica lo scopo del parlante.', fr: 'une caractéristique qui indique le but du locuteur.', de: 'ein Merkmal, das den Zweck des Sprechers bezeichnet.', es: 'una característica que indica la finalidad del hablante.', ja: '話し手の目的を示す特徴。', pt: 'uma característica que indica a finalidade do falante.' }],
    // The school grammars' own definition of the declarative sentence, on the seeded ASSERT: German's
    // separable feststellen rejoins its particle at the end of the relative.
    ['STATEMENT', { en: 'a clause that asserts facts.', it: 'una proposizione che afferma fatti.', fr: 'une proposition qui affirme des faits.', de: 'ein Satz, der Tatsachen feststellt.', es: 'una oración que afirma hechos.', ja: '事実を述べる節。', pt: 'uma oração que afirma fatos.' }],
    // A dimension with no degree, as a noun modifier: an English and a German compound (the -s-
    // after -keit), a Romance "di/de", a Japanese の.
    ['REGISTER', { en: 'a formality level.', it: 'un livello di formalità.', fr: 'un niveau de formalité.', de: 'eine Förmlichkeitsebene.', es: 'un nivel de formalidad.', ja: '丁寧さの段階。', pt: 'um nível de formalidade.' }],
  ])('%s', (id, expected) => {
    expect(definitionAll(id)).toEqual(expected);
  });
});

// The verdicts that left a concept on its literal, pinned so a later author reads the ticket before
// giving one a plan: NEGATIVE would define itself through NEGATE (CONDITIONAL, which would have through
// CONDITION, shipped on DEPEND instead — see prepositional-objects.test.ts);
// ARTICLE's differentia is identifiability *alone*, which every composable gloss says of the
// demonstrative too; COMMAND, ORDER and INSTRUCTION differ by an addressee (and ORDER is COMMAND's
// own word in German and Japanese); PERIOD_PUNCTUATION is C05's. See docs/localization C24 and C27.
describe('the ones left on the literal have no plan', () => {
  test.each(['NEGATIVE', 'ARTICLE', 'COMMAND', 'ORDER', 'INSTRUCTION', 'PERIOD_PUNCTUATION'])('%s', (id) => {
    const concept = concepts.find((c) => c.id === id);
    expect(concept).toBeDefined();
    expect(concept!.definition).toBeUndefined();
  });
});

// ── The words ─────────────────────────────────────────────────────────

describe('the words the glosses stand on', () => {
  // KNOWN, UNKNOWN's antonym: postnominal and agreeing in the Romance languages, strong and weak
  // German endings, and Japanese 既知の, whose の falls away before です.
  test('KNOWN agrees attributively and predicatively', () => {
    expect(sayAll({ subject: np('HOUSE', { definiteness: 'indefinite', adjectives: ['KNOWN'] }) })).toEqual({
      en: 'a known house.', it: 'una casa nota.', fr: 'une maison connue.', de: 'ein bekanntes Haus.',
      es: 'una casa conocida.', ja: '既知の家。', pt: 'uma casa conhecida.',
    });
    expect(sayAll({ subject: np('BOOK', { number: 'plural', adjectives: ['KNOWN'] }) })).toEqual({
      en: 'the known books.', it: 'i libri noti.', fr: 'les livres connus.', de: 'die bekannten Bücher.',
      es: 'los libros conocidos.', ja: '既知の本。', pt: 'os livros conhecidos.',
    });
    expect(sayAll({
      subject: np('HOUSE'),
      verbPhrase: { verb: 'BE' },
      complements: { predicative: { phrase: np('KNOWN') } },
    })).toEqual({
      en: 'the house is known.', it: 'la casa è nota.', fr: 'la maison est connue.', de: 'das Haus ist bekannt.',
      es: 'la casa es conocida.', ja: '家は既知です。', pt: 'a casa é conhecida.',
    });
  });

  // FORMALITY, a feminine mass noun wherever there is gender: it keeps the singular under a plural
  // number, and as a quality dimension it takes "of" in a dimension gloss.
  test('FORMALITY is a mass noun and a quality dimension', () => {
    const the = { en: 'the formality.', it: 'la formalità.', fr: 'la formalité.', de: 'die Förmlichkeit.', es: 'la formalidad.', ja: '丁寧さ。', pt: 'a formalidade.' };
    expect(sayAll({ subject: np('FORMALITY') })).toEqual(the);
    expect(sayAll({ subject: np('FORMALITY', { number: 'plural' }) })).toEqual(the);
    expect(sayAll({ subject: np('FORMALITY', { definiteness: 'bare', adjectives: ['HIGH'], dimensionGloss: true }) })).toEqual({
      en: 'of high formality.', it: 'di formalità alta.', fr: 'de formalité haute.', de: 'von hoher Förmlichkeit.',
      es: 'de formalidad alta.', ja: '丁寧さが高い。', pt: 'de formalidade alta.',
    });
  });

  // ASSERT, STATEMENT's verb: regular in the Romance languages, German feststellen separable — the
  // particle last in a main clause, rejoined in the participle — and Japanese ichidan 述べる.
  test('ASSERT conjugates, and German separates its particle', () => {
    const man = np('MAN');
    const fact = np('FACT');
    expect(sayAll({ subject: man, verbPhrase: { verb: 'ASSERT' }, directObject: fact })).toEqual({
      en: 'the man asserts the fact.', it: "l'uomo afferma il fatto.", fr: "l'homme affirme le fait.",
      de: 'der Mann stellt die Tatsache fest.', es: 'el hombre afirma el hecho.', ja: '男は事実を述べます。', pt: 'o homem afirma o fato.',
    });
    expect(sayAll({
      subject: np('MAN', { number: 'plural' }),
      verbPhrase: { verb: 'ASSERT', tense: 'past' },
      directObject: np('FACT', { number: 'plural' }),
    })).toEqual({
      en: 'the men asserted the facts.', it: 'gli uomini affermarono i fatti.', fr: 'les hommes affirmèrent les faits.',
      de: 'die Männer stellten die Tatsachen fest.', es: 'los hombres afirmaron los hechos.', ja: '男は事実を述べました。', pt: 'os homens afirmaram os fatos.',
    });
    expect(sayAll({ subject: np('FIRST_PERSON'), verbPhrase: { verb: 'ASSERT', tense: 'future' }, directObject: np('FACT', { definiteness: 'indefinite' }) })).toEqual({
      en: 'I will assert a fact.', it: 'affermerò un fatto.', fr: "j'affirmerai un fait.",
      de: 'ich werde eine Tatsache feststellen.', es: 'afirmaré un hecho.', ja: '私は事実を述べます。', pt: 'afirmarei um fato.',
    });
    expect(sayAll({ subject: man, verbPhrase: { verb: 'ASSERT', aspect: 'resultative' }, directObject: fact })).toEqual({
      en: 'the man has asserted the fact.', it: "l'uomo ha affermato il fatto.", fr: "l'homme a affirmé le fait.",
      de: 'der Mann hat die Tatsache festgestellt.', es: 'el hombre ha afirmado el hecho.', ja: '男は事実を述べました。', pt: 'o homem afirmou o fato.',
    });
    expect(sayAll({ subject: man, verbPhrase: { verb: 'ASSERT', aspect: 'progressive' }, directObject: fact })).toEqual({
      en: 'the man is asserting the fact.', it: "l'uomo sta affermando il fatto.", fr: "l'homme est en train d'affirmer le fait.",
      de: 'der Mann stellt gerade die Tatsache fest.', es: 'el hombre está afirmando el hecho.', ja: '男は事実を述べています。', pt: 'o homem está afirmando o fato.',
    });
    expect(sayAll({ subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'ASSERT', voice: 'passive' }, directObject: fact })).toEqual({
      en: 'the fact is asserted.', it: 'il fatto è affermato.', fr: 'le fait est affirmé.',
      de: 'die Tatsache wird festgestellt.', es: 'el hecho es afirmado.', ja: '事実は述べられます。', pt: 'o fato é afirmado.',
    });
  });

  // FACT: a count noun, masculine in the Romance languages and feminine in German.
  test('FACT counts', () => {
    expect(sayAll({ subject: np('FACT', { definiteness: 'indefinite', number: 'plural' }) })).toEqual({
      en: 'facts.', it: 'fatti.', fr: 'des faits.', de: 'Tatsachen.', es: 'unos hechos.', ja: '事実。', pt: 'uns fatos.',
    });
  });
});
