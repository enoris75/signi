import { describe, expect, test } from 'vitest';
import { UI_STRINGS } from '@signi/shared';
import type { NounElement, PhrasePlan, UiStringDef, UiStringPlanDef, VerbPhrase } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// What each console command is for (localization B47): the words its purposes needed — SET, GOVERN,
// NEGATE and SENTIMENT — and the purposes themselves, as the catalogue plans them.

const acts = (subject: NounElement, verb: string, object: NounElement, verbPhrase: Partial<VerbPhrase> = {}) =>
  sayAll(clause(subject, verb, { directObject: object, verbPhrase }));
const command = (addressee: NounElement, verb: string, object: NounElement, extra: Partial<PhrasePlan> = {}) =>
  sayAll({ ...clause(addressee, verb, { directObject: object }), imperative: true, ...extra });
const YOU = np('SECOND_PERSON');
const INSTRUCTION: Partial<PhrasePlan> = { imperativeRegister: 'instruction' };

// SET is the software sense in every language. German festlegen is separable, like ADD's
// hinzufügen: the clause puts "fest" last in a main clause and back on the verb in a subordinate one.
// French définir has the same singular in the present and the passé simple; Spanish establecer takes
// -zc- in the 1st singular.
describe('SET: to give a setting a value', () => {
  const VALUE = np('VALUE');

  test('present, past, future and the plural', () => {
    expect(acts(np('DOG'), 'SET', VALUE)).toEqual({
      en: 'the dog sets the value.', it: 'il cane imposta il valore.', fr: 'le chien définit la valeur.',
      de: 'der Hund legt den Wert fest.', es: 'el perro establece el valor.', ja: '犬は値を設定します。',
      pt: 'o cão define o valor.',
    });
    expect(acts(np('DOG'), 'SET', VALUE, { tense: 'past' })).toEqual({
      en: 'the dog set the value.', it: 'il cane impostò il valore.', fr: 'le chien définit la valeur.',
      de: 'der Hund legte den Wert fest.', es: 'el perro estableció el valor.', ja: '犬は値を設定しました。',
      pt: 'o cão definiu o valor.',
    });
    expect(acts(np('DOG'), 'SET', VALUE, { tense: 'future' })).toEqual({
      en: 'the dog will set the value.', it: 'il cane imposterà il valore.', fr: 'le chien définira la valeur.',
      de: 'der Hund wird den Wert festlegen.', es: 'el perro establecerá el valor.', ja: '犬は値を設定します。',
      pt: 'o cão definirá o valor.',
    });
    expect(acts(np('DOG', { number: 'plural' }), 'SET', VALUE)).toMatchObject({
      it: 'i cani impostano il valore.', fr: 'les chiens définissent la valeur.', de: 'die Hunde legen den Wert fest.',
      es: 'los perros establecen el valor.', pt: 'os cães definem o valor.',
    });
    expect(acts(np('FIRST_PERSON'), 'SET', VALUE)).toMatchObject({
      it: 'imposto il valore.', fr: 'je définis la valeur.', de: 'ich lege den Wert fest.', es: 'establezco el valor.',
      pt: 'defino o valor.',
    });
  });

  test('the aspects, the negative and the passive', () => {
    expect(acts(np('CAT', { gender: 'fem' }), 'SET', VALUE, { aspect: 'resultative' })).toEqual({
      en: 'the cat has set the value.', it: 'la gatta ha impostato il valore.', fr: 'la chatte a défini la valeur.',
      de: 'die Katze hat den Wert festgelegt.', es: 'la gata ha establecido el valor.', ja: '猫は値を設定しました。',
      pt: 'a gata definiu o valor.',
    });
    expect(acts(np('CAT'), 'SET', VALUE, { aspect: 'progressive' })).toMatchObject({
      en: 'the cat is setting the value.', it: 'il gatto sta impostando il valore.', de: 'der Kater legt gerade den Wert fest.',
      es: 'el gato está estableciendo el valor.', ja: '猫は値を設定しています。', pt: 'o gato está definindo o valor.',
    });
    expect(acts(np('CAT'), 'SET', VALUE, { negative: true })).toMatchObject({
      fr: 'le chat ne définit pas la valeur.', de: 'der Kater legt den Wert nicht fest.', ja: '猫は値を設定しません。',
    });
    expect(acts(np('GENERIC_PERSON'), 'SET', VALUE, { voice: 'passive' })).toEqual({
      en: 'the value is set.', it: 'il valore è impostato.', fr: 'la valeur est définie.', de: 'der Wert wird festgelegt.',
      es: 'el valor es establecido.', ja: '値は設定されます。', pt: 'o valor é definido.',
    });
  });

  test('a command, an instruction and a relative clause', () => {
    expect(command(YOU, 'SET', VALUE)).toEqual({
      en: 'set the value.', it: 'imposta il valore.', fr: 'définis la valeur.', de: 'leg den Wert fest.',
      es: 'establece el valor.', ja: '値を設定してください。', pt: 'defina o valor.',
    });
    expect(command(np('FIRST_PERSON', { number: 'plural' }), 'SET', VALUE)).toMatchObject({
      it: 'impostiamo il valore.', de: 'legen wir den Wert fest.', es: 'establezcamos el valor.', ja: '値を設定しましょう。',
    });
    // The Japanese label is the verbal noun the masu-stem gives, 設定.
    expect(command(np('SECOND_PERSON', { definiteness: 'bare' }), 'SET', VALUE, INSTRUCTION)).toMatchObject({
      fr: 'définir la valeur.', de: 'den Wert festlegen.', ja: '値を設定。',
    });
    // The particle goes back on the verb at the end of a subordinate clause.
    expect(sayAll({
      subject: np('CAT', { relative: { verbPhrase: { verb: 'SET' }, directObject: VALUE } }),
      verbPhrase: { verb: 'RUN' },
    })).toMatchObject({ de: 'der Kater, der den Wert festlegt, läuft.', ja: '値を設定する猫は走ります。' });
  });
});

// GOVERN is the grammarian's verb. Italian reggere is irregular in the past (resse) and the
// participle (retto); Spanish regir raises e→i under stress (rige, rigió) and spells the g j before o
// (rijo); Portuguese reger does the same (rejo).
describe('GOVERN: to determine the form of another word', () => {
  const A_NOUN = np('NOUN', { definiteness: 'indefinite' });

  test('present, past, future and the plural', () => {
    expect(acts(np('VERB'), 'GOVERN', A_NOUN)).toEqual({
      en: 'the verb governs a noun.', it: 'il verbo regge un sostantivo.', fr: 'le verbe régit un nom.',
      de: 'das Verb regiert ein Substantiv.', es: 'el verbo rige un sustantivo.', ja: '動詞は名詞を支配します。',
      pt: 'o verbo rege um substantivo.',
    });
    expect(acts(np('VERB'), 'GOVERN', A_NOUN, { tense: 'past' })).toEqual({
      en: 'the verb governed a noun.', it: 'il verbo resse un sostantivo.', fr: 'le verbe régit un nom.',
      de: 'das Verb regierte ein Substantiv.', es: 'el verbo rigió un sustantivo.', ja: '動詞は名詞を支配しました。',
      pt: 'o verbo regeu um substantivo.',
    });
    expect(acts(np('VERB'), 'GOVERN', A_NOUN, { tense: 'future' })).toMatchObject({
      it: 'il verbo reggerà un sostantivo.', fr: 'le verbe régira un nom.', de: 'das Verb wird ein Substantiv regieren.',
      es: 'el verbo regirá un sustantivo.', pt: 'o verbo regerá um substantivo.',
    });
    expect(acts(np('VERB', { number: 'plural' }), 'GOVERN', A_NOUN)).toMatchObject({
      it: 'i verbi reggono un sostantivo.', fr: 'les verbes régissent un nom.', es: 'los verbos rigen un sustantivo.',
      pt: 'os verbos regem um substantivo.',
    });
    expect(acts(np('FIRST_PERSON'), 'GOVERN', A_NOUN)).toMatchObject({
      it: 'reggo un sostantivo.', fr: 'je régis un nom.', es: 'rijo un sustantivo.', pt: 'rejo um substantivo.',
    });
  });

  test('the aspects and the passive', () => {
    expect(acts(np('CAT'), 'GOVERN', A_NOUN, { aspect: 'progressive' })).toMatchObject({
      it: 'il gatto sta reggendo un sostantivo.', es: 'el gato está rigiendo un sustantivo.',
      pt: 'o gato está regendo um substantivo.', ja: '猫は名詞を支配しています。',
    });
    expect(acts(np('GENERIC_PERSON'), 'GOVERN', np('NOUN'), { voice: 'passive' })).toEqual({
      en: 'the noun is governed.', it: 'il sostantivo è retto.', fr: 'le nom est régi.', de: 'das Substantiv wird regiert.',
      es: 'el sustantivo es regido.', ja: '名詞は支配されます。', pt: 'o substantivo é regido.',
    });
  });
});

// NEGATE: what the grammars of all seven call making a verb negative. French nier is the
// grammarians' verb (and, outside grammar, to deny). Spanish negar diphthongizes under stress
// (niega) and writes gu before e (negué).
describe('NEGATE: to make a clause say the opposite', () => {
  const THE_VERB = np('VERB');

  test('present, past, future and the plural', () => {
    expect(acts(np('DOG'), 'NEGATE', THE_VERB)).toEqual({
      en: 'the dog negates the verb.', it: 'il cane nega il verbo.', fr: 'le chien nie le verbe.',
      de: 'der Hund verneint das Verb.', es: 'el perro niega el verbo.', ja: '犬は動詞を否定します。',
      pt: 'o cão nega o verbo.',
    });
    expect(acts(np('DOG'), 'NEGATE', THE_VERB, { tense: 'past' })).toEqual({
      en: 'the dog negated the verb.', it: 'il cane negò il verbo.', fr: 'le chien nia le verbe.',
      de: 'der Hund verneinte das Verb.', es: 'el perro negó el verbo.', ja: '犬は動詞を否定しました。',
      pt: 'o cão negou o verbo.',
    });
    expect(acts(np('DOG'), 'NEGATE', THE_VERB, { tense: 'future' })).toMatchObject({
      it: 'il cane negherà il verbo.', fr: 'le chien niera le verbe.', es: 'el perro negará el verbo.',
      pt: 'o cão negará o verbo.',
    });
    expect(acts(np('DOG', { number: 'plural' }), 'NEGATE', THE_VERB)).toMatchObject({
      it: 'i cani negano il verbo.', fr: 'les chiens nient le verbe.', es: 'los perros niegan el verbo.',
    });
    expect(acts(np('FIRST_PERSON'), 'NEGATE', THE_VERB)).toMatchObject({
      it: 'nego il verbo.', fr: 'je nie le verbe.', de: 'ich verneine das Verb.', es: 'niego el verbo.', pt: 'nego o verbo.',
    });
  });

  test('the aspects, the negative, the passive and a command', () => {
    expect(acts(np('CAT', { gender: 'fem' }), 'NEGATE', THE_VERB, { aspect: 'resultative' })).toMatchObject({
      it: 'la gatta ha negato il verbo.', fr: 'la chatte a nié le verbe.', de: 'die Katze hat das Verb verneint.',
      es: 'la gata ha negado el verbo.',
    });
    expect(acts(np('CAT'), 'NEGATE', THE_VERB, { negative: true })).toMatchObject({
      fr: 'le chat ne nie pas le verbe.', de: 'der Kater verneint das Verb nicht.',
    });
    expect(acts(np('GENERIC_PERSON'), 'NEGATE', THE_VERB, { voice: 'passive' })).toEqual({
      en: 'the verb is negated.', it: 'il verbo è negato.', fr: 'le verbe est nié.', de: 'das Verb wird verneint.',
      es: 'el verbo es negado.', ja: '動詞は否定されます。', pt: 'o verbo é negado.',
    });
    expect(command(YOU, 'NEGATE', THE_VERB)).toEqual({
      en: 'negate the verb.', it: 'nega il verbo.', fr: 'nie le verbe.', de: 'vernein das Verb.', es: 'niega el verbo.',
      ja: '動詞を否定してください。', pt: 'negue o verbo.',
    });
  });
});

// SENTIMENT: the stance a cause is stated with, named as the judgment it is. Feminine wherever it
// has a gender, so an adjective on it agrees in -a / -e.
describe('SENTIMENT: the stance taken toward something', () => {
  test('its article, its plural and an adjective on it', () => {
    expect(sayAll({ subject: np('SENTIMENT') })).toEqual({
      en: 'the sentiment.', it: 'la valutazione.', fr: "l'appréciation.", de: 'die Bewertung.', es: 'la valoración.',
      ja: '評価。', pt: 'a avaliação.',
    });
    expect(sayAll({ subject: np('SENTIMENT', { number: 'plural' }) })).toMatchObject({
      en: 'the sentiments.', it: 'le valutazioni.', fr: 'les appréciations.', de: 'die Bewertungen.', es: 'las valoraciones.',
      pt: 'as avaliações.',
    });
    expect(sayAll({ subject: np('SENTIMENT', { definiteness: 'indefinite', adjectives: ['NEGATIVE'] }) })).toMatchObject({
      en: 'a negative sentiment.', it: 'una valutazione negativa.', fr: 'une appréciation négative.',
      de: 'eine negative Bewertung.', es: 'una valoración negativa.', pt: 'uma avaliação negativa.',
    });
  });
});

// The purposes, as the catalogue plans them and the engine renders them before the catalogue's
// format drops the full stop. One per distinct purpose (see `purpose.*` in uiStrings.ts).
describe('what each console command is for', () => {
  const PURPOSES: Record<string, Record<string, string>> = {
    'purpose.instrument': {
      en: 'to add an instrumental to the verb.', it: 'aggiungere un complemento di mezzo al verbo.',
      fr: 'ajouter un complément de moyen au verbe.', de: 'einen Instrumental zum Verb hinzufügen.',
      es: 'añadir un complemento circunstancial de instrumento al verbo.', ja: '動詞に手段語を加える。',
      pt: 'adicionar um adjunto adverbial de instrumento ao verbo.',
    },
    'purpose.possessor': {
      en: 'to add a possessor to a noun.', it: 'aggiungere un possessore a un sostantivo.',
      fr: 'ajouter un possesseur à un nom.', de: 'einen Besitzer zu einem Substantiv hinzufügen.',
      es: 'añadir un poseedor a un sustantivo.', ja: '名詞に所有者を加える。', pt: 'adicionar um possuidor a um substantivo.',
    },
    // `/than`'s (P09-E12 D5): the standard added to the adjective it compares.
    'purpose.standard': {
      en: 'to add a standard of comparison to an adjective.', it: 'aggiungere un termine di paragone a un aggettivo.',
      fr: 'ajouter un terme de comparaison à un adjectif.', de: 'eine Vergleichsgröße zu einem Adjektiv hinzufügen.',
      es: 'añadir un término de comparación a un adjetivo.', ja: '形容詞に比較の基準を加える。',
      pt: 'adicionar um termo de comparação a um adjetivo.',
    },
    'purpose.relative': {
      en: 'to add a relative clause to a noun.', it: 'aggiungere una proposizione relativa a un sostantivo.',
      fr: 'ajouter une proposition relative à un nom.', de: 'einen Relativsatz zu einem Substantiv hinzufügen.',
      es: 'añadir una oración de relativo a un sustantivo.', ja: '名詞に関係節を加える。',
      pt: 'adicionar uma oração relativa a um substantivo.',
    },
    'purpose.headless': {
      en: 'to say only the relative clause.', it: 'dire solo la proposizione relativa.',
      fr: 'dire seulement la proposition relative.', de: 'nur den Relativsatz sagen.',
      es: 'decir solo la oración de relativo.', ja: '関係節だけ言う。', pt: 'dizer só a oração relativa.',
    },
    'purpose.gloss': {
      en: "to set a noun's meaning.", it: 'impostare il significato di un sostantivo.',
      fr: "définir le sens d'un nom.", de: 'die Bedeutung eines Substantivs festlegen.',
      es: 'establecer el significado de un sustantivo.', ja: '名詞の意味を設定する。', pt: 'definir o significado de um substantivo.',
    },
    'purpose.possessorRole': {
      en: "to set a possessor's relationship.", it: 'impostare la relazione di un possessore.',
      fr: "définir la relation d'un possesseur.", de: 'die Beziehung eines Besitzers festlegen.',
      es: 'establecer la relación de un poseedor.', ja: '所有者の関係を設定する。', pt: 'definir a relação de um possuidor.',
    },
    'purpose.objectControl': {
      en: "to set an infinitive phrase's agent.", it: "impostare l'agente di una frase infinitiva.",
      fr: "définir l'agent d'une proposition infinitive.", de: 'das Agens einer Infinitivphrase festlegen.',
      es: 'establecer el agente de una frase de infinitivo.', ja: '不定詞句の動作主を設定する。', pt: 'definir o agente de uma frase infinitiva.',
    },
    'purpose.condition': {
      en: 'to add a condition to a period.', it: 'aggiungere una condizione a un periodo.',
      fr: 'ajouter une condition à une période.', de: 'eine Bedingung zu einem Satzgefüge hinzufügen.',
      es: 'añadir una condición a un período.', ja: '文に条件を加える。', pt: 'adicionar uma condição a um período.',
    },
    'purpose.conjunct': {
      en: 'to link another phrase to a noun.', it: "collegare un'altra frase a un sostantivo.",
      fr: 'relier une autre phrase à un nom.', de: 'eine andere Phrase mit einem Substantiv verbinden.',
      es: 'enlazar otra frase a un sustantivo.', ja: '名詞に別のフレーズをつなぐ。', pt: 'ligar outra frase a um substantivo.',
    },
    'purpose.join': {
      en: 'to link periods.', it: 'collegare periodi.', fr: 'relier des périodes.', de: 'Satzgefüge verbinden.',
      es: 'enlazar períodos.', ja: '文をつなぐ。', pt: 'ligar períodos.',
    },
    'purpose.adjective': {
      en: 'to describe a noun.', it: 'descrivere un sostantivo.', fr: 'décrire un nom.', de: 'ein Substantiv beschreiben.',
      es: 'describir un sustantivo.', ja: '名詞を描写する。', pt: 'descrever um substantivo.',
    },
    'purpose.adverb': {
      en: 'to modify a verb or a modal.', it: 'modificare un verbo o un verbo modale.',
      fr: 'modifier un verbe ou un verbe modal.', de: 'ein Verb oder ein Modalverb modifizieren.',
      es: 'modificar un verbo o un verbo modal.', ja: '動詞か法助動詞を修飾する。', pt: 'modificar um verbo ou um verbo modal.',
    },
    'purpose.modal': {
      en: 'to govern a verb.', it: 'reggere un verbo.', fr: 'régir un verbe.', de: 'ein Verb regieren.', es: 'regir un verbo.',
      ja: '動詞を支配する。', pt: 'reger um verbo.',
    },
    'purpose.number': {
      en: "to set a noun's number.", it: 'impostare il numero di un sostantivo.', fr: "définir le nombre d'un nom.",
      de: 'den Numerus eines Substantivs festlegen.', es: 'establecer el número de un sustantivo.', ja: '名詞の数を設定する。',
      pt: 'definir o número de um substantivo.',
    },
    'purpose.gender': {
      en: "to set a noun's gender.", it: 'impostare il genere di un sostantivo.', fr: "définir le genre d'un nom.",
      de: 'das Geschlecht eines Substantivs festlegen.', es: 'establecer el género de un sustantivo.', ja: '名詞の性を設定する。',
      pt: 'definir o género de um substantivo.',
    },
    'purpose.pronounGender': {
      en: "to set a pronoun's gender.", it: 'impostare il genere di un pronome.', fr: "définir le genre d'un pronom.",
      de: 'das Geschlecht eines Pronomens festlegen.', es: 'establecer el género de un pronombre.', ja: '代名詞の性を設定する。',
      pt: 'definir o género de um pronome.',
    },
    'purpose.determiner': {
      en: "to set a noun's determiner.", it: 'impostare il determinante di un sostantivo.',
      fr: "définir le déterminant d'un nom.", de: 'das Determinativ eines Substantivs festlegen.',
      es: 'establecer el determinante de un sustantivo.', ja: '名詞の限定詞を設定する。',
      pt: 'definir o determinante de um substantivo.',
    },
    'purpose.specifier': {
      en: "to set a complement's spatial relationship.", it: 'impostare la relazione spaziale di un complemento.',
      fr: "définir la relation spatiale d'un complément.", de: 'die räumliche Beziehung einer Ergänzung festlegen.',
      es: 'establecer la relación espacial de un complemento.', ja: '補語の空間的な関係を設定する。',
      pt: 'definir a relação espacial de um complemento.',
    },
    // P09-E12b: the temporal's relation, named as the spatial one is, under TEMPORAL.
    'purpose.temporal': {
      en: "to set a complement's temporal relationship.", it: 'impostare la relazione temporale di un complemento.',
      fr: "définir la relation temporelle d'un complément.", de: 'die temporale Beziehung einer Ergänzung festlegen.',
      es: 'establecer la relación temporal de un complemento.', ja: '補語の時間的な関係を設定する。',
      pt: 'definir a relação temporal de um complemento.',
    },
    'purpose.sentiment': {
      en: "to set a cause's sentiment.", it: 'impostare la valutazione di un complemento di causa.',
      fr: "définir l'appréciation d'un complément circonstanciel de cause.",
      de: 'die Bewertung einer adverbialen Bestimmung des Grundes festlegen.',
      es: 'establecer la valoración de un complemento circunstancial de causa.', ja: '原因の副詞語句の評価を設定する。',
      pt: 'definir a avaliação de um adjunto adverbial de causa.',
    },
    'purpose.tense': {
      en: "to set a verb's tense.", it: 'impostare il tempo di un verbo.', fr: "définir le temps d'un verbe.",
      de: 'das Tempus eines Verbs festlegen.', es: 'establecer el tiempo de un verbo.', ja: '動詞の時制を設定する。',
      pt: 'definir o tempo de um verbo.',
    },
    'purpose.aspect': {
      en: "to set a verb's aspect.", it: "impostare l'aspetto di un verbo.", fr: "définir l'aspect d'un verbe.",
      de: 'den Aspekt eines Verbs festlegen.', es: 'establecer el aspecto de un verbo.', ja: '動詞のアスペクトを設定する。',
      pt: 'definir o aspecto de um verbo.',
    },
    'purpose.voice': {
      en: "to set a verb's voice.", it: 'impostare la diatesi di un verbo.', fr: "définir la voix d'un verbe.",
      de: 'die Diathese eines Verbs festlegen.', es: 'establecer la voz de un verbo.', ja: '動詞の態を設定する。',
      pt: 'definir a voz de um verbo.',
    },
    'purpose.polarity': {
      en: "to set a verb's polarity.", it: 'impostare la polarità di un verbo.', fr: "définir la polarité d'un verbe.",
      de: 'die Polarität eines Verbs festlegen.', es: 'establecer la polaridad de un verbo.', ja: '動詞の極性を設定する。',
      pt: 'definir a polaridade de um verbo.',
    },
    'purpose.negate': {
      en: 'to negate a verb.', it: 'negare un verbo.', fr: 'nier un verbe.', de: 'ein Verb verneinen.', es: 'negar un verbo.',
      ja: '動詞を否定する。', pt: 'negar um verbo.',
    },
    'purpose.degree': {
      en: "to set an adjective's degree.", it: 'impostare il grado di un aggettivo.', fr: "définir le degré d'un adjectif.",
      de: 'die Steigerungsstufe eines Adjektivs festlegen.', es: 'establecer el grado de un adjetivo.',
      ja: '形容詞の程度を設定する。', pt: 'definir o grau de um adjetivo.',
    },
    'purpose.relation': {
      en: "to set a modifier's relationship.", it: 'impostare la relazione di un modificatore.',
      fr: "définir la relation d'un modificateur.", de: 'die Beziehung eines Modifikators festlegen.',
      es: 'establecer la relación de un modificador.', ja: '修飾語の関係を設定する。', pt: 'definir a relação de um modificador.',
    },
  };

  const catalogued = Object.keys(UI_STRINGS).filter((key) => key.startsWith('purpose.'));

  test('has a render pinned for every purpose the catalogue holds', () => {
    expect(catalogued.sort()).toEqual(Object.keys(PURPOSES).sort());
  });

  test.each(catalogued)('%s', (key) => {
    const { plan, fallback } = (UI_STRINGS as Record<string, UiStringDef>)[key] as UiStringPlanDef;
    const said = sayAll(plan);
    expect(said).toEqual(PURPOSES[key]);
    // The fallback is what the engine says in English, without the full stop the catalogue drops.
    expect(`${fallback}.`).toBe(said.en);
  });
});
