import { describe, expect, test } from 'vitest';
import type { LanguageCode, NounPhrase, PhrasePlan, ReadyLanguageCode } from '@signi/shared';
import { clause, np, say, sayAll } from './harness.js';
import { translate } from '../src/index.js';
import { lookupLexicalEntry } from '../../backend/src/lexicon.js';
import { concepts } from '../../backend/src/concepts/index.js';
import { isPreviewLanguage } from '@signi/shared';

// Localization B60, P09's saying and thinking verbs: SAY, TELL, ASK, CALL, CALL_PHONE, MEAN, THINK
// and BELIEVE, the noun QUESTION, and the two differentia words TELEPHONE and MIND; with the glosses
// they ship and ANSWER's, which re-opens a C28 verdict. The words are pinned here, not in the shared
// exhaustive tables (verb.test.ts's Italian table), so the lanes that seeded P09's words the same day
// do not edit the same rows.

type Rendered = Record<ReadyLanguageCode, string>;

/** Render a seeded concept's own `definition` plan (its picker tooltip) into every language. */
function definitionAll(id: string): Rendered {
  const concept = concepts.find((c) => c.id === id);
  if (!concept?.definition) throw new Error(`${id} has no definition plan`);
  return Object.fromEntries(
    translate(concept.definition, lookupLexicalEntry).filter((t) => !isPreviewLanguage(t.language)).map((t) => [t.language, t.text]),
  ) as Rendered;
}

const said = (concept: string, extra: Partial<NounPhrase> = {}) => sayAll({ subject: np(concept, extra) });
const the = (concept: string, extra: Partial<NounPhrase> = {}) => np(concept, { definiteness: 'definite', ...extra });

// ── The words ─────────────────────────────────────────────────────────

describe('the nouns: a singular and a plural in every language', () => {
  test.each<[string, Rendered, Rendered]>([
    ['QUESTION',
      { en: 'the question.', it: 'la domanda.', fr: 'la question.', de: 'die Frage.', es: 'la pregunta.', ja: '質問。', pt: 'a pergunta.' },
      { en: 'the questions.', it: 'le domande.', fr: 'les questions.', de: 'die Fragen.', es: 'las preguntas.', ja: '質問。', pt: 'as perguntas.' }],
    ['TELEPHONE',
      { en: 'the telephone.', it: 'il telefono.', fr: 'le téléphone.', de: 'das Telefon.', es: 'el teléfono.', ja: '電話。', pt: 'o telefone.' },
      { en: 'the telephones.', it: 'i telefoni.', fr: 'les téléphones.', de: 'die Telefone.', es: 'los teléfonos.', ja: '電話。', pt: 'os telefones.' }],
    // German Verstand has no plural in use; Verstände is the regular one a plural pick falls back on.
    ['MIND',
      { en: 'the mind.', it: 'la mente.', fr: "l'esprit.", de: 'der Verstand.', es: 'la mente.', ja: '頭脳。', pt: 'a mente.' },
      { en: 'the minds.', it: 'le menti.', fr: 'les esprits.', de: 'die Verstände.', es: 'las mentes.', ja: '頭脳。', pt: 'as mentes.' }],
  ])('%s', (concept, singular, plural) => {
    expect(said(concept, { definiteness: 'definite' })).toEqual(singular);
    expect(said(concept, { number: 'plural', definiteness: 'definite' })).toEqual(plural);
  });

  test('the gender agrees: a feminine question, a neuter telephone, a masculine mind', () => {
    const big = (concept: string) => said(concept, { definiteness: 'indefinite', adjectives: ['BIG'] });
    expect(big('QUESTION')).toEqual({
      en: 'a big question.', it: 'una grande domanda.', fr: 'une grande question.', de: 'eine große Frage.', es: 'una pregunta grande.',
      ja: '大きい質問。', pt: 'uma pergunta grande.',
    });
    expect(big('TELEPHONE')).toEqual({
      en: 'a big telephone.', it: 'un grande telefono.', fr: 'un grand téléphone.', de: 'ein großes Telefon.', es: 'un teléfono grande.',
      ja: '大きい電話。', pt: 'um telefone grande.',
    });
    // French esprit is masculine where mente is feminine.
    expect(big('MIND')).toEqual({
      en: 'a big mind.', it: 'una grande mente.', fr: 'un grand esprit.', de: 'ein großer Verstand.', es: 'una mente grande.',
      ja: '大きい頭脳。', pt: 'uma mente grande.',
    });
  });

  test('German Telefon takes the short genitive, Verstand the long one the engine gives it', () => {
    const partOf = (whole: string) => sayAll({ subject: the('PART', { possessor: the(whole), possessorRole: 'whole' }) });
    expect(partOf('TELEPHONE')).toMatchObject({ de: 'der Teil des Telefons.', it: 'la parte del telefono.', ja: '電話の部分。' });
    expect(partOf('MIND')).toMatchObject({ de: 'der Teil des Verstands.', fr: "la partie de l'esprit.", ja: '頭脳の部分。' });
  });

  test('SAY is an expressing, TELL and ASK sayings, QUESTION a phrase, TELEPHONE an object', () => {
    const isA = (id: string) => concepts.find((c) => c.id === id)?.isA;
    expect(['SAY', 'TELL', 'ASK', 'QUESTION', 'TELEPHONE'].map(isA)).toEqual(['EXPRESS', 'SAY', 'SAY', 'PHRASE', 'OBJECT_THING']);
    // The picker's disambiguators: two calls, and MEAN in its signify sense only.
    const synonym = (id: string) => concepts.find((c) => c.id === id)?.synonym;
    expect(['CALL', 'CALL_PHONE', 'MEAN'].map(synonym)).toEqual(['summon', 'phone', 'signify']);
  });
});

// Each verb with the object it takes: TELL with its addressee, ASK without one (the person asked is
// A238 below, and German's accusative person is C35's), THINK with none.
const OBJECT: Record<string, Partial<PhrasePlan>> = {
  SAY: { directObject: the('WORD') },
  TELL: { directObject: the('STORY'), complements: { terminus: { phrase: the('MAN') } } },
  ASK: { directObject: the('NAME_NOUN') },
  CALL: { directObject: the('MAN') },
  CALL_PHONE: { directObject: the('MAN') },
  MEAN: { directObject: the('CONCEPT') },
  THINK: {},
  BELIEVE: { directObject: the('STORY') },
};
// A word means; a person does the rest.
const subjectOf = (verb: string, extra: Partial<NounPhrase> = {}) => the(verb === 'MEAN' ? 'WORD' : 'WOMAN', extra);
const plural = (verb: string) => the(verb === 'MEAN' ? 'WORD' : 'MAN', { number: 'plural' });
const singular = (verb: string) => the(verb === 'MEAN' ? 'WORD' : 'MAN');

interface Paradigm { present: Rendered; past: Rendered; resultative: Rendered; future: Rendered; negative: Rendered }

// The strong pasts and participles: disse / dit / dijo / disse and detto / dit / dicho; chiese and
// chiesto; rief and gerufen; dachte and gedacht; told, thought, meant. MEAN and BELIEVE are states:
// the Romance past is the imperfect (significava, croyait, creía), Japanese says them with 〜ている.
// CALL_PHONE's person is prepositional in four languages (all'uomo, à l'homme, para o homem, 男に), and
// German anrufen is separable (ruft … an, angerufen). German fragen asks nach the thing.
describe('the verbs: present, simple past, resultative, future and negation', () => {
  test.each<[string, Paradigm]>([
    ['SAY', {
      present: { en: 'the woman says the word.', it: 'la donna dice la parola.', fr: 'la femme dit le mot.', de: 'die Frau sagt das Wort.', es: 'la mujer dice la palabra.', ja: '女は単語を言います。', pt: 'a mulher diz a palavra.' },
      past: { en: 'the woman said the word.', it: 'la donna disse la parola.', fr: 'la femme dit le mot.', de: 'die Frau sagte das Wort.', es: 'la mujer dijo la palabra.', ja: '女は単語を言いました。', pt: 'a mulher disse a palavra.' },
      resultative: { en: 'the woman has said the word.', it: 'la donna ha detto la parola.', fr: 'la femme a dit le mot.', de: 'die Frau hat das Wort gesagt.', es: 'la mujer ha dicho la palabra.', ja: '女は単語を言いました。', pt: 'a mulher disse a palavra.' },
      future: { en: 'the men will say the word.', it: 'gli uomini diranno la parola.', fr: 'les hommes diront le mot.', de: 'die Männer werden das Wort sagen.', es: 'los hombres dirán la palabra.', ja: '男は単語を言います。', pt: 'os homens dirão a palavra.' },
      negative: { en: 'the man does not say the word.', it: "l'uomo non dice la parola.", fr: "l'homme ne dit pas le mot.", de: 'der Mann sagt das Wort nicht.', es: 'el hombre no dice la palabra.', ja: '男は単語を言いません。', pt: 'o homem não diz a palavra.' },
    }],
    ['TELL', {
      present: { en: 'the woman tells the story to the man.', it: "la donna racconta la storia all'uomo.", fr: "la femme raconte l'histoire à l'homme.", de: 'die Frau erzählt dem Mann die Geschichte.', es: 'la mujer cuenta la historia al hombre.', ja: '女は男に物語を伝えます。', pt: 'a mulher conta a história ao homem.' },
      past: { en: 'the woman told the story to the man.', it: "la donna raccontò la storia all'uomo.", fr: "la femme raconta l'histoire à l'homme.", de: 'die Frau erzählte dem Mann die Geschichte.', es: 'la mujer contó la historia al hombre.', ja: '女は男に物語を伝えました。', pt: 'a mulher contou a história ao homem.' },
      resultative: { en: 'the woman has told the story to the man.', it: "la donna ha raccontato la storia all'uomo.", fr: "la femme a raconté l'histoire à l'homme.", de: 'die Frau hat dem Mann die Geschichte erzählt.', es: 'la mujer ha contado la historia al hombre.', ja: '女は男に物語を伝えました。', pt: 'a mulher contou a história ao homem.' },
      future: { en: 'the men will tell the story to the man.', it: "gli uomini racconteranno la storia all'uomo.", fr: "les hommes raconteront l'histoire à l'homme.", de: 'die Männer werden dem Mann die Geschichte erzählen.', es: 'los hombres contarán la historia al hombre.', ja: '男は男に物語を伝えます。', pt: 'os homens contarão a história ao homem.' },
      negative: { en: 'the man does not tell the story to the man.', it: "l'uomo non racconta la storia all'uomo.", fr: "l'homme ne raconte pas l'histoire à l'homme.", de: 'der Mann erzählt dem Mann die Geschichte nicht.', es: 'el hombre no cuenta la historia al hombre.', ja: '男は男に物語を伝えません。', pt: 'o homem não conta a história ao homem.' },
    }],
    ['ASK', {
      present: { en: 'the woman asks the name.', it: 'la donna chiede il nome.', fr: 'la femme demande le nom.', de: 'die Frau fragt nach dem Namen.', es: 'la mujer pregunta el nombre.', ja: '女は名前を尋ねます。', pt: 'a mulher pergunta o nome.' },
      past: { en: 'the woman asked the name.', it: 'la donna chiese il nome.', fr: 'la femme demanda le nom.', de: 'die Frau fragte nach dem Namen.', es: 'la mujer preguntó el nombre.', ja: '女は名前を尋ねました。', pt: 'a mulher perguntou o nome.' },
      resultative: { en: 'the woman has asked the name.', it: 'la donna ha chiesto il nome.', fr: 'la femme a demandé le nom.', de: 'die Frau hat nach dem Namen gefragt.', es: 'la mujer ha preguntado el nombre.', ja: '女は名前を尋ねました。', pt: 'a mulher perguntou o nome.' },
      future: { en: 'the men will ask the name.', it: 'gli uomini chiederanno il nome.', fr: 'les hommes demanderont le nom.', de: 'die Männer werden nach dem Namen fragen.', es: 'los hombres preguntarán el nombre.', ja: '男は名前を尋ねます。', pt: 'os homens perguntarão o nome.' },
      negative: { en: 'the man does not ask the name.', it: "l'uomo non chiede il nome.", fr: "l'homme ne demande pas le nom.", de: 'der Mann fragt nicht nach dem Namen.', es: 'el hombre no pregunta el nombre.', ja: '男は名前を尋ねません。', pt: 'o homem não pergunta o nome.' },
    }],
    ['CALL', {
      present: { en: 'the woman calls the man.', it: "la donna chiama l'uomo.", fr: "la femme appelle l'homme.", de: 'die Frau ruft den Mann.', es: 'la mujer llama al hombre.', ja: '女は男を呼びます。', pt: 'a mulher chama o homem.' },
      past: { en: 'the woman called the man.', it: "la donna chiamò l'uomo.", fr: "la femme appela l'homme.", de: 'die Frau rief den Mann.', es: 'la mujer llamó al hombre.', ja: '女は男を呼びました。', pt: 'a mulher chamou o homem.' },
      resultative: { en: 'the woman has called the man.', it: "la donna ha chiamato l'uomo.", fr: "la femme a appelé l'homme.", de: 'die Frau hat den Mann gerufen.', es: 'la mujer ha llamado al hombre.', ja: '女は男を呼びました。', pt: 'a mulher chamou o homem.' },
      future: { en: 'the men will call the man.', it: "gli uomini chiameranno l'uomo.", fr: "les hommes appelleront l'homme.", de: 'die Männer werden den Mann rufen.', es: 'los hombres llamarán al hombre.', ja: '男は男を呼びます。', pt: 'os homens chamarão o homem.' },
      negative: { en: 'the man does not call the man.', it: "l'uomo non chiama l'uomo.", fr: "l'homme n'appelle pas l'homme.", de: 'der Mann ruft den Mann nicht.', es: 'el hombre no llama al hombre.', ja: '男は男を呼びません。', pt: 'o homem não chama o homem.' },
    }],
    ['CALL_PHONE', {
      present: { en: 'the woman calls the man.', it: "la donna telefona all'uomo.", fr: "la femme téléphone à l'homme.", de: 'die Frau ruft den Mann an.', es: 'la mujer llama al hombre.', ja: '女は男に電話します。', pt: 'a mulher telefona para o homem.' },
      past: { en: 'the woman called the man.', it: "la donna telefonò all'uomo.", fr: "la femme téléphona à l'homme.", de: 'die Frau rief den Mann an.', es: 'la mujer llamó al hombre.', ja: '女は男に電話しました。', pt: 'a mulher telefonou para o homem.' },
      resultative: { en: 'the woman has called the man.', it: "la donna ha telefonato all'uomo.", fr: "la femme a téléphoné à l'homme.", de: 'die Frau hat den Mann angerufen.', es: 'la mujer ha llamado al hombre.', ja: '女は男に電話しました。', pt: 'a mulher telefonou para o homem.' },
      future: { en: 'the men will call the man.', it: "gli uomini telefoneranno all'uomo.", fr: "les hommes téléphoneront à l'homme.", de: 'die Männer werden den Mann anrufen.', es: 'los hombres llamarán al hombre.', ja: '男は男に電話します。', pt: 'os homens telefonarão para o homem.' },
      negative: { en: 'the man does not call the man.', it: "l'uomo non telefona all'uomo.", fr: "l'homme ne téléphone pas à l'homme.", de: 'der Mann ruft den Mann nicht an.', es: 'el hombre no llama al hombre.', ja: '男は男に電話しません。', pt: 'o homem não telefona para o homem.' },
    }],
    ['MEAN', {
      present: { en: 'the word means the concept.', it: 'la parola significa il concetto.', fr: 'le mot signifie le concept.', de: 'das Wort bedeutet den Begriff.', es: 'la palabra significa el concepto.', ja: '単語は概念を意味しています。', pt: 'a palavra significa o conceito.' },
      past: { en: 'the word meant the concept.', it: 'la parola significava il concetto.', fr: 'le mot signifiait le concept.', de: 'das Wort bedeutete den Begriff.', es: 'la palabra significaba el concepto.', ja: '単語は概念を意味していました。', pt: 'a palavra significava o conceito.' },
      resultative: { en: 'the word has meant the concept.', it: 'la parola ha significato il concetto.', fr: 'le mot a signifié le concept.', de: 'das Wort hat den Begriff bedeutet.', es: 'la palabra ha significado el concepto.', ja: '単語は概念を意味していました。', pt: 'a palavra significou o conceito.' },
      future: { en: 'the words will mean the concept.', it: 'le parole significheranno il concetto.', fr: 'les mots signifieront le concept.', de: 'die Wörter werden den Begriff bedeuten.', es: 'las palabras significarán el concepto.', ja: '単語は概念を意味しています。', pt: 'as palavras significarão o conceito.' },
      negative: { en: 'the word does not mean the concept.', it: 'la parola non significa il concetto.', fr: 'le mot ne signifie pas le concept.', de: 'das Wort bedeutet den Begriff nicht.', es: 'la palabra no significa el concepto.', ja: '単語は概念を意味していません。', pt: 'a palavra não significa o conceito.' },
    }],
    ['THINK', {
      present: { en: 'the woman thinks.', it: 'la donna pensa.', fr: 'la femme pense.', de: 'die Frau denkt.', es: 'la mujer piensa.', ja: '女は考えます。', pt: 'a mulher pensa.' },
      past: { en: 'the woman thought.', it: 'la donna pensò.', fr: 'la femme pensa.', de: 'die Frau dachte.', es: 'la mujer pensó.', ja: '女は考えました。', pt: 'a mulher pensou.' },
      resultative: { en: 'the woman has thought.', it: 'la donna ha pensato.', fr: 'la femme a pensé.', de: 'die Frau hat gedacht.', es: 'la mujer ha pensado.', ja: '女は考えました。', pt: 'a mulher pensou.' },
      future: { en: 'the men will think.', it: 'gli uomini penseranno.', fr: 'les hommes penseront.', de: 'die Männer werden denken.', es: 'los hombres pensarán.', ja: '男は考えます。', pt: 'os homens pensarão.' },
      negative: { en: 'the man does not think.', it: "l'uomo non pensa.", fr: "l'homme ne pense pas.", de: 'der Mann denkt nicht.', es: 'el hombre no piensa.', ja: '男は考えません。', pt: 'o homem não pensa.' },
    }],
    ['BELIEVE', {
      present: { en: 'the woman believes the story.', it: 'la donna crede alla storia.', fr: "la femme croit l'histoire.", de: 'die Frau glaubt die Geschichte.', es: 'la mujer cree la historia.', ja: '女は物語を信じています。', pt: 'a mulher acredita na história.' },
      past: { en: 'the woman believed the story.', it: 'la donna credeva alla storia.', fr: "la femme croyait l'histoire.", de: 'die Frau glaubte die Geschichte.', es: 'la mujer creía la historia.', ja: '女は物語を信じていました。', pt: 'a mulher acreditava na história.' },
      resultative: { en: 'the woman has believed the story.', it: 'la donna ha creduto alla storia.', fr: "la femme a cru l'histoire.", de: 'die Frau hat die Geschichte geglaubt.', es: 'la mujer ha creído la historia.', ja: '女は物語を信じていました。', pt: 'a mulher acreditou na história.' },
      future: { en: 'the men will believe the story.', it: 'gli uomini crederanno alla storia.', fr: "les hommes croiront l'histoire.", de: 'die Männer werden die Geschichte glauben.', es: 'los hombres creerán la historia.', ja: '男は物語を信じています。', pt: 'os homens acreditarão na história.' },
      negative: { en: 'the man does not believe the story.', it: "l'uomo non crede alla storia.", fr: "l'homme ne croit pas l'histoire.", de: 'der Mann glaubt die Geschichte nicht.', es: 'el hombre no cree la historia.', ja: '男は物語を信じていません。', pt: 'o homem não acredita na história.' },
    }],
  ])('%s', (verb, forms) => {
    const extra = OBJECT[verb];
    expect(sayAll(clause(subjectOf(verb), verb, extra))).toEqual(forms.present);
    expect(sayAll(clause(subjectOf(verb), verb, { ...extra, verbPhrase: { tense: 'past' } }))).toEqual(forms.past);
    expect(sayAll(clause(subjectOf(verb), verb, { ...extra, verbPhrase: { aspect: 'resultative' } }))).toEqual(forms.resultative);
    expect(sayAll(clause(plural(verb), verb, { ...extra, verbPhrase: { tense: 'future' } }))).toEqual(forms.future);
    expect(sayAll(clause(singular(verb), verb, { ...extra, verbPhrase: { negative: true } }))).toEqual(forms.negative);
  });
});

// The persons the languages inflect: the irregular presents (diciamo, disons, decimos; the diphthongs
// of cuentas and piensas; appelles with its doubled l), and Portuguese você agreeing as the third.
describe('the verbs: the first plural and the second singular', () => {
  test.each<[string, Rendered, Rendered]>([
    ['SAY', { en: 'we say the word.', it: 'diciamo la parola.', fr: 'nous disons le mot.', de: 'wir sagen das Wort.', es: 'decimos la palabra.', ja: '私たちは単語を言います。', pt: 'dizemos a palavra.' }, { en: 'you say the word.', it: 'dici la parola.', fr: 'tu dis le mot.', de: 'du sagst das Wort.', es: 'dices la palabra.', ja: 'あなたは単語を言います。', pt: 'diz a palavra.' }],
    ['TELL', { en: 'we tell the story to the man.', it: "raccontiamo la storia all'uomo.", fr: "nous racontons l'histoire à l'homme.", de: 'wir erzählen dem Mann die Geschichte.', es: 'contamos la historia al hombre.', ja: '私たちは男に物語を伝えます。', pt: 'contamos a história ao homem.' }, { en: 'you tell the story to the man.', it: "racconti la storia all'uomo.", fr: "tu racontes l'histoire à l'homme.", de: 'du erzählst dem Mann die Geschichte.', es: 'cuentas la historia al hombre.', ja: 'あなたは男に物語を伝えます。', pt: 'conta a história ao homem.' }],
    ['ASK', { en: 'we ask the name.', it: 'chiediamo il nome.', fr: 'nous demandons le nom.', de: 'wir fragen nach dem Namen.', es: 'preguntamos el nombre.', ja: '私たちは名前を尋ねます。', pt: 'perguntamos o nome.' }, { en: 'you ask the name.', it: 'chiedi il nome.', fr: 'tu demandes le nom.', de: 'du fragst nach dem Namen.', es: 'preguntas el nombre.', ja: 'あなたは名前を尋ねます。', pt: 'pergunta o nome.' }],
    ['CALL', { en: 'we call the man.', it: "chiamiamo l'uomo.", fr: "nous appelons l'homme.", de: 'wir rufen den Mann.', es: 'llamamos al hombre.', ja: '私たちは男を呼びます。', pt: 'chamamos o homem.' }, { en: 'you call the man.', it: "chiami l'uomo.", fr: "tu appelles l'homme.", de: 'du rufst den Mann.', es: 'llamas al hombre.', ja: 'あなたは男を呼びます。', pt: 'chama o homem.' }],
    ['CALL_PHONE', { en: 'we call the man.', it: "telefoniamo all'uomo.", fr: "nous téléphonons à l'homme.", de: 'wir rufen den Mann an.', es: 'llamamos al hombre.', ja: '私たちは男に電話します。', pt: 'telefonamos para o homem.' }, { en: 'you call the man.', it: "telefoni all'uomo.", fr: "tu téléphones à l'homme.", de: 'du rufst den Mann an.', es: 'llamas al hombre.', ja: 'あなたは男に電話します。', pt: 'telefona para o homem.' }],
    ['MEAN', { en: 'we mean the concept.', it: 'significhiamo il concetto.', fr: 'nous signifions le concept.', de: 'wir bedeuten den Begriff.', es: 'significamos el concepto.', ja: '私たちは概念を意味しています。', pt: 'significamos o conceito.' }, { en: 'you mean the concept.', it: 'significhi il concetto.', fr: 'tu signifies le concept.', de: 'du bedeutest den Begriff.', es: 'significas el concepto.', ja: 'あなたは概念を意味しています。', pt: 'significa o conceito.' }],
    ['THINK', { en: 'we think.', it: 'pensiamo.', fr: 'nous pensons.', de: 'wir denken.', es: 'pensamos.', ja: '私たちは考えます。', pt: 'pensamos.' }, { en: 'you think.', it: 'pensi.', fr: 'tu penses.', de: 'du denkst.', es: 'piensas.', ja: 'あなたは考えます。', pt: 'pensa.' }],
    ['BELIEVE', { en: 'we believe the story.', it: 'crediamo alla storia.', fr: "nous croyons l'histoire.", de: 'wir glauben die Geschichte.', es: 'creemos la historia.', ja: '私たちは物語を信じています。', pt: 'acreditamos na história.' }, { en: 'you believe the story.', it: 'credi alla storia.', fr: "tu crois l'histoire.", de: 'du glaubst die Geschichte.', es: 'crees la historia.', ja: 'あなたは物語を信じています。', pt: 'acredita na história.' }],
  ])('%s', (verb, firstPlural, secondSingular) => {
    expect(sayAll(clause(np('FIRST_PERSON', { number: 'plural' }), verb, OBJECT[verb]))).toEqual(firstPlural);
    expect(sayAll(clause(np('SECOND_PERSON'), verb, OBJECT[verb]))).toEqual(secondSingular);
  });
});

// verb.test.ts's Italian table checks this for every other verb: all eight take avere, so the
// participle does not agree with the feminine subject.
describe('feminine subject, resultative present: Italian, the B60 verbs', () => {
  test.each<[string, string]>([
    ['SAY', 'la gatta ha detto.'],
    ['TELL', 'la gatta ha raccontato.'],
    ['ASK', 'la gatta ha chiesto.'],
    ['CALL', 'la gatta ha chiamato.'],
    ['CALL_PHONE', 'la gatta ha telefonato.'],
    ['MEAN', 'la gatta ha significato.'],
    ['THINK', 'la gatta ha pensato.'],
    ['BELIEVE', 'la gatta ha creduto.'],
  ])('%s → %s', (verb, expected) => {
    expect(sayAll(clause(np('CAT', { gender: 'fem' }), verb, { verbPhrase: { aspect: 'resultative' } })).it).toBe(expected);
  });
});

describe('the objects the lexemes mark', () => {
  // The separable anrufen closes the relative clause whole; the prepositional objects relativise
  // with their preposition (al quale, auquel, para o qual) and Japanese keeps no particle.
  test('CALL_PHONE relativised on its object', () => {
    expect(sayAll({ subject: the('MAN', { relative: { headRole: 'directObject', subject: the('WOMAN'), verbPhrase: { verb: 'CALL_PHONE', tense: 'past' } } }) }))
      .toMatchObject({
        it: "l'uomo al quale la donna telefonò.", fr: "l'homme auquel la femme téléphona.", de: 'der Mann, den die Frau anrief.',
        ja: '女が電話した男。', pt: 'o homem para o qual a mulher telefonou.',
      });
  });

  // B60's reason TELL is raccontare, not SAY's dire: the dative person hoisted ahead of the object in
  // German, に in Japanese.
  test('TELL puts its addressee in the dative', () => {
    expect(sayAll(clause(the('CAT'), 'TELL', { directObject: the('STORY'), complements: { terminus: { phrase: the('DOG') } } }))).toEqual({
      en: 'the cat tells the story to the dog.', it: 'il gatto racconta la storia al cane.', fr: "le chat raconte l'histoire au chien.",
      de: 'der Kater erzählt dem Hund die Geschichte.', es: 'el gato cuenta la historia al perro.', ja: '猫は犬に物語を伝えます。',
      pt: 'o gato conta a história ao cão.',
    });
  });

  // Portuguese dizer's strong preterite gives the open é (hypothetical.test.ts's class table lists it).
  test('SAY and BELIEVE in the hypothetical', () => {
    const ifWe = (verb: string) => sayAll({ ...clause(the('DOG'), 'RUN'), condition: clause(np('FIRST_PERSON', { number: 'plural' }), verb, OBJECT[verb]) });
    expect(ifWe('SAY')).toMatchObject({
      fr: 'si nous disions le mot, le chien courrait.', es: 'si dijéramos la palabra, el perro correría.',
      pt: 'se disséssemos a palavra, o cão correria.',
    });
    expect(ifWe('BELIEVE')).toMatchObject({
      it: 'se credessimo alla storia, il cane correrebbe.', fr: "si nous croyions l'histoire, le chien courrait.",
      es: 'si creyéramos la historia, el perro correría.', pt: 'se acreditássemos na história, o cão correria.',
    });
  });
});

// ── The glosses ───────────────────────────────────────────────────────

// SAY is EXPRESS with words, as TRANSLATE is EXPRESS with another language; TELL and ANSWER are SAY
// with an addressee, ANSWER's one who asks; ASK is SAY with a purpose, and QUESTION ASK's instrument.
// CALL is the causative of COME with a person as causee, which BRING (B61) has with an object.
// CALL_PHONE's comitative sits inside a purpose clause; MEAN and BELIEVE take INCLUDE's essive frame.
describe('the B60 glosses, in every language', () => {
  test.each<[string, Rendered]>([
    ['SAY', { en: 'to express concepts with words.', it: 'esprimere concetti con parole.', fr: 'exprimer des concepts avec des mots.', de: 'Begriffe mit Wörtern vermitteln.', es: 'expresar conceptos con palabras.', ja: '単語で概念を表す。', pt: 'exprimir conceitos com palavras.' }],
    ['TELL', { en: 'to say facts to a person.', it: 'dire fatti a una persona.', fr: 'dire des faits à une personne.', de: 'einer Person Tatsachen sagen.', es: 'decir hechos a una persona.', ja: '人に事実を言う。', pt: 'dizer fatos a uma pessoa.' }],
    ['ASK', { en: 'to say words to know the facts.', it: 'dire parole per conoscere i fatti.', fr: 'dire des mots pour connaître les faits.', de: 'Wörter sagen, um die Tatsachen zu kennen.', es: 'decir palabras para conocer los hechos.', ja: '事実を知るために単語を言う。', pt: 'dizer palavras para conhecer os fatos.' }],
    ['QUESTION', { en: 'a phrase with which one asks.', it: 'una frase con la quale si chiede.', fr: 'une phrase avec laquelle on demande.', de: 'eine Phrase, mit der man fragt.', es: 'una frase con la que se pregunta.', ja: '尋ねるフレーズ。', pt: 'uma frase com a qual se pergunta.' }],
    ['CALL', { en: 'to cause a person to come.', it: 'indurre una persona a venire.', fr: 'induire une personne à venir.', de: 'eine Person veranlassen zu kommen.', es: 'inducir a una persona a venir.', ja: '人が来るようにする。', pt: 'induzir uma pessoa a vir.' }],
    ['CALL_PHONE', { en: 'to use a telephone to speak with a person.', it: 'usare un telefono per parlare con una persona.', fr: 'utiliser un téléphone pour parler avec une personne.', de: 'ein Telefon verwenden, um mit einer Person zu sprechen.', es: 'usar un teléfono para hablar con una persona.', ja: '人と話すために電話を使う。', pt: 'usar um telefone para falar com uma pessoa.' }],
    ['MEAN', { en: 'to have as meaning.', it: 'avere come significato.', fr: 'avoir comme sens.', de: 'als Bedeutung haben.', es: 'tener como significado.', ja: '意味として持つ。', pt: 'ter como significado.' }],
    ['THINK', { en: 'to use the mind.', it: 'usare la mente.', fr: "utiliser l'esprit.", de: 'den Verstand verwenden.', es: 'usar la mente.', ja: '頭脳を使う。', pt: 'usar a mente.' }],
    ['BELIEVE', { en: 'to accept as fact.', it: 'accettare come fatto.', fr: 'accepter comme fait.', de: 'als Tatsache akzeptieren.', es: 'aceptar como hecho.', ja: '事実として受け付ける。', pt: 'aceitar como fato.' }],
    ['TELEPHONE', { en: 'an object with which one speaks.', it: 'un oggetto con il quale si parla.', fr: 'un objet avec lequel on parle.', de: 'ein Gegenstand, mit dem man spricht.', es: 'un objeto con el que se habla.', ja: '話す物体。', pt: 'um objeto com o qual se fala.' }],
    ['ANSWER', { en: 'to say words to a person who asks.', it: 'dire parole a una persona che chiede.', fr: 'dire des mots à une personne qui demande.', de: 'einer Person, die fragt, Wörter sagen.', es: 'decir palabras a una persona que pregunta.', ja: '尋ねる人に単語を言う。', pt: 'dizer palavras a uma pessoa que pergunta.' }],
  ])('%s', (id, rendered) => {
    expect(definitionAll(id)).toEqual(rendered);
  });
});

// ── Known bugs ────────────────────────────────────────────────────────

// A238. English renders every `terminus` with "to", so a verb whose addressee is a bare object
// says it with the preposition: ASK's person asked ("asks the name to the man") and ANSWER's person
// answered ("answers to the man", which reads "is accountable to"). Want the double object, "asks the
// man the name", and the bare object, "answers the man"; the other six are right (chiede il nome
// all'uomo, 男に名前を尋ねます) except German, whose fragen takes the person in the accusative, "fragt
// den Mann" where it renders "fragt dem Mann": that is C35's lexical object case, not this bug. No
// shipped gloss shows it: ANSWER's own gloss is SAY with a terminus, which takes "to".
// Fixed: the lexeme selects the shape, as `object_prep` does for a direct object — English ASK and
// ANSWER say `terminus_bare`, and the addressee is written with no adposition, ahead of the thing.
describe('known bugs: an English addressee that takes no "to" (A238)', () => {
  const asks = (extra: Parameters<typeof clause>[2] = {}) =>
    sayAll(clause(the('WOMAN'), 'ASK', { directObject: the('NAME_NOUN'), complements: { terminus: { phrase: the('MAN') } }, ...extra })).en;

  test('ASK puts the person asked before the thing, with no "to"', () => {
    expect(sayAll(clause(the('WOMAN'), 'ASK', { directObject: the('NAME_NOUN'), complements: { terminus: { phrase: the('MAN') } } })).en)
      .toBe('the woman asks the man the name.');
  });

  test('ANSWER takes the person answered as a bare object', () => {
    expect(sayAll(clause(the('WOMAN'), 'ANSWER', { complements: { terminus: { phrase: the('MAN') } } })).en)
      .toBe('the woman answers the man.');
  });

  test('a pronoun addressee takes the object form, and ASK without a thing asked is the plain object', () => {
    expect(sayAll(clause(the('WOMAN'), 'ASK', { directObject: the('NAME_NOUN'), complements: { terminus: { phrase: np('THIRD_PERSON', { gender: 'masc' }) } } })).en)
      .toBe('the woman asks him the name.');
    expect(sayAll(clause(the('WOMAN'), 'ANSWER', { complements: { terminus: { phrase: np('THIRD_PERSON', { gender: 'fem' }) } } })).en)
      .toBe('the woman answers her.');
    expect(sayAll(clause(the('WOMAN'), 'ASK', { complements: { terminus: { phrase: the('MAN') } } })).en)
      .toBe('the woman asks the man.');
    expect(sayAll(clause(the('WOMAN'), 'ANSWER', { directObject: the('WORD'), complements: { terminus: { phrase: the('MAN') } } })).en)
      .toBe('the woman answers the man the word.');
  });

  test('the two objects hold together under a tense, a modal, a negation and another complement', () => {
    expect(asks({ verbPhrase: { tense: 'past' } })).toBe('the woman asked the man the name.');
    expect(asks({ verbPhrase: { modals: ['MUST'] } })).toBe('the woman must ask the man the name.');
    expect(asks({ verbPhrase: { negative: true } })).toBe('the woman does not ask the man the name.');
    expect(sayAll(clause(the('WOMAN'), 'ASK', {
      directObject: the('NAME_NOUN'),
      complements: { terminus: { phrase: the('MAN') }, cause: { phrase: the('STORY') } },
    })).en).toBe('the woman asks the man the name because of the story.');
  });

  // The passive has promoted the thing asked, so the addressee is an ordinary complement again and
  // takes the preposition, as the other six write it ("al hombre", "all'uomo").
  test('the passive keeps the addressee among the complements', () => {
    expect(asks({ verbPhrase: { voice: 'passive' } })).toBe('the name is asked by the woman to the man.');
  });

  // It is still a complement for the "any"-series: English has no negative concord, so a `no`
  // addressee gives way to the "not" ahead of it (A158/A160), rather than doubling the negation.
  test('a `no` addressee gives way to the clause\'s negator', () => {
    const noMan = { terminus: { phrase: np('MAN', { definiteness: 'no' }) } };
    expect(sayAll(clause(the('WOMAN'), 'ASK', { directObject: the('NAME_NOUN'), complements: noMan })).en)
      .toBe('the woman asks no man the name.');
    expect(sayAll(clause(the('WOMAN'), 'ASK', { directObject: the('NAME_NOUN'), complements: noMan, verbPhrase: { negative: true } })).en)
      .toBe('the woman does not ask any man the name.');
  });

  test('regression: the rest keep their terminus, and the other languages theirs', () => {
    expect(sayAll(clause(the('WOMAN'), 'ASK', { directObject: the('NAME_NOUN'), complements: { terminus: { phrase: the('MAN') } } })))
      .toMatchObject({ it: "la donna chiede il nome all'uomo.", es: 'la mujer pregunta el nombre al hombre.', ja: '女は男に名前を尋ねます。' });
    expect(sayAll(clause(the('WOMAN'), 'SAY', { directObject: the('WORD'), complements: { terminus: { phrase: the('MAN') } } })).en)
      .toBe('the woman says the word to the man.');
  });
});

// A239. The Italian imperfect subjunctive is built on the infinitive minus -re, with the
// contracted infinitives overridden by concept id (IT_SUBJ_STEM in mood.ts: PRODUCE's produce-). SAY's
// dire is contracted too, and gives *dissimo* where Italian says dicessimo; the imperfect indicative
// already knows dire (IT_IMPERF_CONTRACTED: diceva). No shipped gloss shows it.
// Fixed: both imperfects now read one lemma-keyed list of contracted infinitives
// (IT_CONTRACTED_STEM), so dire reaches dice- in the subjunctive as it already did in the indicative.
describe('known bugs: Italian dire in the imperfect subjunctive (A239)', () => {
  const protasis = (subject: NounPhrase) =>
    sayAll({ ...clause(the('DOG'), 'RUN'), condition: clause(subject, 'SAY', OBJECT['SAY']) }).it;

  test('se dicessimo, not se dissimo', () => {
    expect(protasis(np('FIRST_PERSON', { number: 'plural' }))).toBe('se dicessimo la parola, il cane correrebbe.');
  });

  test('the whole paradigm is built on dice-', () => {
    expect(protasis(np('FIRST_PERSON'))).toBe('se dicessi la parola, il cane correrebbe.');
    expect(protasis(the('WOMAN'))).toBe('se la donna dicesse la parola, il cane correrebbe.');
    expect(protasis(the('WOMAN', { number: 'plural' }))).toBe('se le donne dicessero la parola, il cane correrebbe.');
  });

  test('regression: the conditional is built on the future stem, and is right', () => {
    expect(sayAll({ ...clause(the('WOMAN'), 'SAY', OBJECT['SAY']), condition: clause(the('DOG'), 'RUN') }).it)
      .toBe('se il cane corresse, la donna direbbe la parola.');
  });

  test('regression: an uncontracted infinitive keeps the plain rule, and the six others are untouched', () => {
    expect(sayAll({ ...clause(the('DOG'), 'RUN'), condition: clause(the('WOMAN'), 'ASK', OBJECT['ASK']) }).it)
      .toBe('se la donna chiedesse il nome, il cane correrebbe.');
    expect(sayAll({ ...clause(the('DOG'), 'RUN'), condition: clause(np('FIRST_PERSON', { number: 'plural' }), 'SAY', OBJECT['SAY']) }))
      .toMatchObject({ es: 'si dijéramos la palabra, el perro correría.', fr: 'si nous disions le mot, le chien courrait.' });
  });
});

// A240. A verb whose object takes a preposition (`object_prep`, A139) writes a pronoun object
// as the tonic pronoun after it, which is right for su / sur ("clicca su di lui") and wrong for the
// dative a / à of CALL_PHONE: Italian "telefona a lui" is contrastive only, French "téléphone à lui"
// ungrammatical; the unmarked sentence has the dative clitic, "gli telefona", "lui téléphone". Spanish
// and Portuguese are right (lo llama, telefona para ele). The recipient pronoun of GIVE has the same
// shape (A229's unfiled Romance lead). No shipped gloss shows it.
// Fixed: a pronoun object of the dative preposition cliticizes, as the indirect-object clitic the
// pronouns now seed (`dative`, 3rd person only — the 1st and 2nd reuse their accusative).
describe('known bugs: the dative clitic of a prepositional object (A240)', () => {
  const calls = (obj: Partial<NounPhrase>, extra: Parameters<typeof clause>[2] = {}) =>
    sayAll(clause(the('WOMAN'), 'CALL_PHONE', { directObject: np('THIRD_PERSON', obj), ...extra }));
  const callsHim = () => calls({ gender: 'masc' });

  test('Italian: gli telefona', () => {
    expect(callsHim().it).toBe('la donna gli telefona.');
  });

  test('French: lui téléphone', () => {
    expect(callsHim().fr).toBe('la femme lui téléphone.');
  });

  test('the rest of the paradigm: the feminine and the plural, and the two persons that reuse their accusative', () => {
    expect(calls({ gender: 'fem' })).toMatchObject({ it: 'la donna le telefona.', fr: 'la femme lui téléphone.' });
    expect(calls({ number: 'plural' })).toMatchObject({ it: 'la donna gli telefona.', fr: 'la femme leur téléphone.' });
    expect(sayAll(clause(the('WOMAN'), 'CALL_PHONE', { directObject: np('FIRST_PERSON') })))
      .toMatchObject({ it: 'la donna mi telefona.', fr: 'la femme me téléphone.' });
    expect(sayAll(clause(the('WOMAN'), 'CALL_PHONE', { directObject: np('FIRST_PERSON', { number: 'plural' }) })))
      .toMatchObject({ it: 'la donna ci telefona.', fr: 'la femme nous téléphone.' });
  });

  test('it climbs, encliticizes and takes the negation like any other object clitic', () => {
    expect(calls({ gender: 'masc' }, { verbPhrase: { negative: true } }))
      .toMatchObject({ it: 'la donna non gli telefona.', fr: 'la femme ne lui téléphone pas.' });
    expect(calls({ gender: 'masc' }, { verbPhrase: { modals: ['MUST'] } }))
      .toMatchObject({ it: 'la donna gli deve telefonare.', fr: 'la femme doit lui téléphoner.' });
    const command = (extra: Parameters<typeof clause>[2] = {}) => sayAll({
      ...clause(np('SECOND_PERSON'), 'CALL_PHONE', { directObject: np('THIRD_PERSON', { gender: 'masc' }), ...extra }),
      imperative: true,
    });
    expect(command()).toMatchObject({ it: 'telefonagli.', fr: 'téléphone-lui.' });
    expect(command({ verbPhrase: { negative: true } })).toMatchObject({ it: 'non telefonargli.', fr: 'ne lui téléphone pas.' });
  });

  // Italian "credere a" takes the same clitic; no participle agrees with a dative one.
  test('the other dative verb, and no participle agreement', () => {
    expect(sayAll(clause(the('WOMAN'), 'BELIEVE', { directObject: np('THIRD_PERSON', { gender: 'fem' }) })).it)
      .toBe('la donna le crede.');
    expect(calls({ gender: 'fem' }, { verbPhrase: { tense: 'past', aspect: 'resultative' } }))
      .toMatchObject({ it: 'la donna le aveva telefonato.', fr: 'la femme lui avait téléphoné.' });
  });

  test('regression: a noun object keeps the preposition, and a spatial one keeps the tonic pronoun', () => {
    expect(sayAll(clause(the('WOMAN'), 'CALL_PHONE', { directObject: the('MAN') })))
      .toMatchObject({ it: "la donna telefona all'uomo.", fr: "la femme téléphone à l'homme." });
    expect(sayAll(clause(the('WOMAN'), 'CLICK', { directObject: np('THIRD_PERSON', { gender: 'masc' }) })))
      .toMatchObject({ it: 'la donna clicca su di lui.', fr: 'la femme clique sur lui.' });
  });

  test('regression: the other five', () => {
    expect(callsHim()).toMatchObject({
      en: 'the woman calls him.', de: 'die Frau ruft ihn an.', es: 'la mujer lo llama.', ja: '女は彼に電話します。',
      pt: 'a mulher telefona para ele.',
    });
  });
});

// A382. What is answered is ANSWER's direct object, and German antworten has no accusative for it:
// it is "auf" + accusative (Swiss German "uf"), "der Mann antwortet auf das Wort". The engine writes
// a bare accusative, "der Mann antwortet das Wort", "ihr antwortetet mich". The fix names `object_prep`
// on the two lexemes, as CLICK does (A139); the passive is the fixer's decision and is not pinned. Found
// by random phrase seeds 19035 and 19036. With the fix, sweep-definitions.test.ts's ANSWER row moves.
describe('known bugs: German ANSWER takes its object in the accusative (A382)', () => {
  const answers = (extra: Parameters<typeof clause>[2], subject = the('MAN')) => clause(subject, 'ANSWER', extra);
  const WORD = { directObject: the('WORD') };
  const OBJECT_ON_WORD = the('WORD', { relative: { verbPhrase: { verb: 'ANSWER' }, headRole: 'directObject', subject: the('MAN') } });

  test.fails('what is answered takes auf / uf', () => {
    expect(say(answers(WORD), 'de')).toBe('der Mann antwortet auf das Wort.');
    expect(say(answers({ directObject: np('FIRST_PERSON') }), 'de')).toBe('der Mann antwortet auf mich.');
    expect(say(answers({ ...WORD, complements: { terminus: { phrase: the('WOMAN') } } }), 'de'))
      .toBe('der Mann antwortet der Frau auf das Wort.');
    expect(say(answers({ ...WORD, verbPhrase: { aspect: 'resultative' } }), 'de')).toBe('der Mann hat auf das Wort geantwortet.');
    expect(say(clause(OBJECT_ON_WORD, 'BURN'), 'de')).toBe('das Wort, auf das der Mann antwortet, brennt.');
    expect(say(answers({ directObject: np('FIRST_PERSON'), verbPhrase: { tense: 'past' } }, np('SECOND_PERSON', { number: 'plural' })), 'de'))
      .toBe('ihr antwortetet auf mich.');
    expect(say(answers(WORD), 'gsw')).toBe('de Maa antwortet uf s Wort.');
    expect(say(answers({ ...WORD, verbPhrase: { aspect: 'resultative' } }), 'gsw')).toBe('de Maa hät uf s Wort gantwortet.');
    expect(say(clause(OBJECT_ON_WORD, 'BURN'), 'gsw')).toBe('s Wort, wo de Maa druf antwortet, brennt.');
  });

  test('regression: the dative person alone, the bare verb, and the languages that take a direct object', () => {
    expect(say(answers({ complements: { terminus: { phrase: the('WOMAN') } } }), 'de')).toBe('der Mann antwortet der Frau.');
    expect(say(answers({}), 'de')).toBe('der Mann antwortet.');
    expect(say(answers({ complements: { terminus: { phrase: the('WOMAN') } } }), 'gsw')).toBe('de Maa antwortet de Frau.');
    expect(sayAll(answers(WORD))).toMatchObject({
      en: 'the man answers the word.', it: "l'uomo risponde la parola.", es: 'el hombre responde la palabra.',
      ja: '男は単語を答えます。', pt: 'o homem responde a palavra.',
    });
  });
});
