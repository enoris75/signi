import { describe, expect, test } from 'vitest';
import type { NounElement, PhrasePlan, PronominalPossessor } from '@signi/shared';
import { clause, np, sayAll } from './harness.js';

// P11-E3: talking *to* family. Two halves: a casual kin term used as a **name** ("Mom runs"), which
// is a lexeme column and C38's personal-name path, and the **vocative** ("Mom, run!"), a slot of the
// clause's own that no other slot renders like.

const runs = (subject: NounElement) => sayAll(clause(subject, 'RUN'));
const of = (person: '1' | '2' | '3'): PronominalPossessor => ({ kind: 'pronominal', person, number: 'singular' });

describe('a kin term used as a name', () => {
  test('Mom runs: no article, capitalized — and Italian keeps its article', () => {
    expect(runs(np('MOM'))).toEqual({
      en: 'Mom runs.', it: 'la mamma corre.', fr: 'Maman court.', de: 'Mama läuft.',
      es: 'Mamá corre.', ja: 'お母さんは走ります。', pt: 'Mamãe corre.',
    });
    expect(runs(np('DAD'))).toEqual({
      en: 'Dad runs.', it: 'il papà corre.', fr: 'Papa court.', de: 'Papa läuft.',
      es: 'Papá corre.', ja: 'お父さんは走ります。', pt: 'Papai corre.',
    });
  });

  test('a name in every slot a name fills', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('MOM') }))).toEqual({
      en: 'the cat sees Mom.', it: 'il gatto vede la mamma.', fr: 'le chat voit Maman.',
      de: 'der Kater sieht Mama.', es: 'el gato ve a Mamá.', ja: '猫はお母さんを見ます。', pt: 'o gato vê Mamãe.',
    });
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'), complements: { terminus: { phrase: np('DAD') } },
    }))).toEqual({
      en: 'the cat gives the book to Dad.', it: 'il gatto dà il libro al papà.',
      fr: 'le chat donne le livre à Papa.', de: 'der Kater gibt Papa das Buch.',
      es: 'el gato da el libro a Papá.', ja: '猫はお父さんに本をあげます。', pt: 'o gato dá o livro a Papai.',
    });
    expect(sayAll({ subject: np('BOOK', { possessor: np('MOM') }) })).toEqual({
      en: "Mom's book.", it: 'il libro della mamma.', fr: 'le livre de Maman.', de: 'das Buch Mamas.',
      es: 'el libro de Mamá.', ja: 'お母さんの本。', pt: 'o livro de Mamãe.',
    });
    expect(runs({ conjuncts: [np('MOM'), np('DAD')], conjunction: 'and' })).toEqual({
      en: 'Mom and Dad run.', it: 'la mamma e il papà corrono.', fr: 'Maman et Papa courent.',
      de: 'Mama und Papa laufen.', es: 'Mamá y Papá corren.', ja: 'お母さんとお父さんは走ります。',
      pt: 'Mamãe e Papai correm.',
    });
  });

  test('an indefinite, plural, possessed or modified one is the common noun', () => {
    expect(runs(np('MOM', { definiteness: 'indefinite' }))).toMatchObject({
      en: 'a mom runs.', fr: 'une maman court.', de: 'eine Mama läuft.', es: 'una mamá corre.', pt: 'uma mamãe corre.',
    });
    expect(runs(np('MOM', { number: 'plural' }))).toMatchObject({
      en: 'the moms run.', fr: 'les mamans courent.', es: 'las mamás corren.',
    });
    expect(runs(np('MOM', { possessor: of('1') }))).toEqual({
      en: 'my mom runs.', it: 'la mia mamma corre.', fr: 'ma maman court.', de: 'meine Mama läuft.',
      es: 'mi mamá corre.', ja: 'お母さんは走ります。', pt: 'a minha mamãe corre.',
    });
    expect(runs(np('MOM', { adjectives: ['OLD'] }))).toMatchObject({
      en: 'the old mom runs.', fr: 'la vieille maman court.', de: 'die alte Mama läuft.',
    });
  });

  test('a possessor question asks whose mom, the common noun', () => {
    expect(sayAll({ ...clause(np('MOM'), 'RUN'), questionRole: 'possessor', questionPossessed: 'subject' })).toEqual({
      en: 'whose mom runs?', it: 'la mamma di chi corre?', fr: 'la maman de qui court\u00a0?',
      de: 'wessen Mama läuft?', es: '¿la mamá de quién corre?', ja: '誰のお母さんが走りますか？',
      pt: 'a mamãe de quem corre?',
    });
  });
});

// The vocative is a slot of the top clause, rendered before it with the language's separator.
const command = (address: NounElement, subject: NounElement = np('SECOND_PERSON')): PhrasePlan =>
  ({ ...clause(subject, 'RUN'), imperative: true, address });

describe('the vocative', () => {
  test('Mom, run: set off by a comma, or 、 with no particle, and determiner-less in all seven', () => {
    expect(sayAll(command(np('MOM')))).toEqual({
      en: 'Mom, run.', it: 'Mamma, corri.', fr: 'Maman, cours.', de: 'Mama, lauf.',
      es: 'Mamá, corre.', ja: 'お母さん、走ってください。', pt: 'Mamãe, corra.',
    });
  });

  test('determiner-less whatever the plan picked, and capitalized as the first word', () => {
    expect(sayAll(command(np('CAT', { definiteness: 'indefinite' })))).toEqual({
      en: 'Cat, run.', it: 'Gatto, corri.', fr: 'Chat, cours.', de: 'Kater, lauf.',
      es: 'Gato, corre.', ja: '猫、走ってください。', pt: 'Gato, corra.',
    });
    // A name the language articles as a subject (pt "o Pedro corre") is bare in address.
    expect(sayAll(command(np('PETER')))).toMatchObject({ pt: 'Pedro, corra.', it: 'Pietro, corri.', ja: 'ピーター、走ってください。' });
    expect(sayAll(command(np('PETER', { title: 'MR' })))).toMatchObject({
      it: 'Signor Pietro, corri.', es: 'Señor Pedro, corre.', pt: 'Senhor Pedro, corra.', ja: 'ピーターさん、走ってください。',
    });
    expect(sayAll(command({ conjuncts: [np('MOM'), np('DAD')], conjunction: 'and' }, np('SECOND_PERSON', { number: 'plural' })))).toEqual({
      en: 'Mom and Dad, run.', it: 'Mamma e papà, correte.', fr: 'Maman et Papa, courez.', de: 'Mama und Papa, lauft.',
      es: 'Mamá y Papá, corred.', ja: 'お母さんとお父さん、走ってください。', pt: 'Mamãe e Papai, corram.',
    });
  });

  // D3: one calls one's own mother お母さん, where P11's rule gives 母 for her in the third person.
  test("Japanese: address takes the honorific, even for one's own mother", () => {
    expect(sayAll(command(np('MOTHER', { possessor: of('1') })))).toMatchObject({
      ja: 'お母さん、走ってください。', en: 'My mother, run.', fr: 'Ma mère, cours.', de: 'Meine Mutter, lauf.',
    });
    expect(sayAll(command(np('MOTHER')))).toMatchObject({ ja: 'お母さん、走ってください。', en: 'Mother, run.' });
    expect(sayAll(command(np('PARENT', { number: 'plural', possessor: of('1') }), np('SECOND_PERSON', { number: 'plural' }))))
      .toMatchObject({ ja: 'ご両親、走ってください。' });
  });

  test("…and P11's own / other's / nobody's rows are unchanged outside it", () => {
    expect(runs(np('MOTHER', { possessor: of('1') }))).toMatchObject({ ja: '母は走ります。' });
    expect(runs(np('MOTHER', { possessor: of('2') }))).toMatchObject({ ja: 'あなたのお母さんは走ります。' });
    expect(runs(np('MOTHER'))).toMatchObject({ ja: '母親は走ります。' });
    // The subject of an addressed clause is not the address: 母 in the clause, お母さん before it.
    expect(sayAll({ ...clause(np('MOTHER', { possessor: of('1') }), 'RUN'), address: np('MOM') }))
      .toMatchObject({ ja: 'お母さん、母は走ります。' });
  });

  // …but only for an elder (`address_honorific`): a wife or a younger brother is called by name, and
  // takes the ordinary own / other's rule.
  test('Japanese: the honorific is an elder\'s only', () => {
    const ja = (address: NounElement) => sayAll(command(address)).ja;
    expect(sayAll(command(np('WIFE', { possessor: of('1') })))).toEqual({
      en: 'My wife, run.', it: 'Mia moglie, corri.', fr: 'Ma femme, cours.', de: 'Meine Frau, lauf.',
      es: 'Mi esposa, corre.', ja: '妻、走ってください。', pt: 'Minha esposa, corra.',
    });
    expect(ja(np('BROTHER', { possessor: of('1'), adjectives: ['YOUNGER'] }))).toBe('弟、走ってください。');
    expect(ja(np('BROTHER', { possessor: of('1'), adjectives: ['ELDER'] }))).toBe('お兄さん、走ってください。');
    expect(ja(np('SISTER', { possessor: of('1'), adjectives: ['ELDER'] }))).toBe('お姉さん、走ってください。');
    expect(ja(np('MOTHER', { possessor: of('1') }))).toBe('お母さん、走ってください。');
    expect(ja(np('GRANDFATHER'))).toBe('おじいさん、走ってください。');
    expect(ja(np('SON', { possessor: of('1') }))).toBe('息子、走ってください。');
    // Someone else's relative takes the honorific in address as it does anywhere.
    expect(ja(np('WIFE', { possessor: of('2') }))).toBe('あなたの奥さん、走ってください。');
  });

  test('a head with no honorific keeps the word it takes as a possessed noun', () => {
    expect(sayAll(command(np('WIFE', { possessor: of('1') })))).toMatchObject({ fr: 'Ma femme, cours.', de: 'Meine Frau, lauf.' });
  });

  test('an address on a statement: Mom, the cat runs', () => {
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), address: np('MOM') })).toEqual({
      en: 'Mom, the cat runs.', it: 'Mamma, il gatto corre.', fr: 'Maman, le chat court.', de: 'Mama, der Kater läuft.',
      es: 'Mamá, el gato corre.', ja: 'お母さん、猫は走ります。', pt: 'Mamãe, o gato corre.',
    });
  });

  test('an address on a question stands outside the Spanish ¿', () => {
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), address: np('MOM'), interrogative: true })).toEqual({
      en: 'Mom, does the cat run?', it: 'Mamma, il gatto corre?', fr: 'Maman, est-ce que le chat court ?',
      de: 'Mama, läuft der Kater?', es: 'Mamá, ¿el gato corre?', ja: 'お母さん、猫は走りますか？', pt: 'Mamãe, o gato corre?',
    });
  });

  // D4: the address is not the command's subject. The same address takes a 1st-plural command.
  test("Mom, let's run: the address does not pick the command's person", () => {
    expect(sayAll(command(np('MOM'), np('FIRST_PERSON', { number: 'plural' })))).toEqual({
      en: "Mom, let's run.", it: 'Mamma, corriamo.', fr: 'Maman, courons.', de: 'Mama, laufen wir.',
      es: 'Mamá, corramos.', ja: 'お母さん、走りましょう。', pt: 'Mamãe, corramos.',
    });
    expect(sayAll(command(np('MOM'), np('SECOND_PERSON', { number: 'plural' })))).toMatchObject({
      it: 'Mamma, correte.', fr: 'Maman, courez.', de: 'Mama, lauft.', es: 'Mamá, corred.',
    });
  });

  test("the address belongs to the top clause: a linked clause's is not read", () => {
    const coordinated: PhrasePlan = {
      ...clause(np('CAT'), 'RUN'),
      coordination: { conjunction: 'and', clause: { ...clause(np('DOG'), 'EAT'), address: np('MOM') } },
    };
    expect(sayAll(coordinated)).toMatchObject({ en: 'the cat runs, and the dog eats.' });
  });
});

const You = np('SECOND_PERSON');
const YouAll = np('SECOND_PERSON', { number: 'plural' });
const momAndDad = (conjunction: 'and' | 'or' = 'and'): NounElement => ({ conjuncts: [np('MOM'), np('DAD')], conjunction });
const dontRun = { verb: 'RUN', negative: true };

describe('the vocative on every clause shape', () => {
  test("a negated command: Mom, don't run", () => {
    expect(sayAll({ ...command(np('MOM')), verbPhrase: dontRun })).toEqual({
      en: 'Mom, do not run.', it: 'Mamma, non correre.', fr: 'Maman, ne cours pas.', de: 'Mama, lauf nicht.',
      es: 'Mamá, no corras.', ja: 'お母さん、走るな。', pt: 'Mamãe, não corra.',
    });
    expect(sayAll({ ...command(momAndDad(), YouAll), verbPhrase: dontRun })).toEqual({
      en: 'Mom and Dad, do not run.', it: 'Mamma e papà, non correte.', fr: 'Maman et Papa, ne courez pas.',
      de: 'Mama und Papa, lauft nicht.', es: 'Mamá y Papá, no corráis.', ja: 'お母さんとお父さん、走るな。',
      pt: 'Mamãe e Papai, não corram.',
    });
    expect(sayAll({ ...command(np('MOM'), np('FIRST_PERSON', { number: 'plural' })), verbPhrase: dontRun })).toEqual({
      en: "Mom, let's not run.", it: 'Mamma, non corriamo.', fr: 'Maman, ne courons pas.', de: 'Mama, laufen wir nicht.',
      es: 'Mamá, no corramos.', ja: 'お母さん、走るのはやめましょう。', pt: 'Mamãe, não corramos.',
    });
  });

  test('a wh-question: the address stands outside the Spanish ¿ here too', () => {
    expect(sayAll({ ...clause(np('CAT'), 'EAT'), questionRole: 'directObject', address: np('MOM') })).toEqual({
      en: 'Mom, what does the cat eat?', it: 'Mamma, che cosa mangia il gatto?', fr: "Maman, qu'est-ce que le chat mange ?",
      de: 'Mama, was frisst der Kater?', es: 'Mamá, ¿qué come el gato?', ja: 'お母さん、猫は何を食べますか？',
      pt: 'Mamãe, o que o gato come?',
    });
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), questionRole: 'subject', address: np('DAD') })).toEqual({
      en: 'Dad, what runs?', it: 'Papà, che cosa corre?', fr: "Papa, qu'est-ce qui court ?", de: 'Papa, was läuft?',
      es: 'Papá, ¿qué corre?', ja: 'お父さん、何が走りますか？', pt: 'Papai, o que corre?',
    });
    expect(sayAll({ ...clause(np('CAT'), 'RUN', { verbPhrase: { negative: true } }), interrogative: true, address: np('MOM') })).toEqual({
      en: 'Mom, does the cat not run?', it: 'Mamma, il gatto non corre?', fr: 'Maman, est-ce que le chat ne court pas ?',
      de: 'Mama, läuft der Kater nicht?', es: 'Mamá, ¿el gato no corre?', ja: 'お母さん、猫は走りませんか？',
      pt: 'Mamãe, o gato não corre?',
    });
  });

  test('a subordinate, a condition and a linked clause follow the address', () => {
    expect(sayAll({ ...command(np('MOM')), adverbialClause: { conjunction: 'when', clause: { subject: np('CAT'), verbPhrase: { verb: 'EAT' } } } })).toEqual({
      en: 'Mom, run when the cat eats.', it: 'Mamma, corri quando il gatto mangia.', fr: 'Maman, cours quand le chat mange.',
      de: 'Mama, lauf, wenn der Kater frisst.', es: 'Mamá, corre cuando el gato come.',
      ja: 'お母さん、猫が食べる時に走ってください。', pt: 'Mamãe, corra quando o gato come.',
    });
    expect(sayAll({ ...clause(np('DOG'), 'EAT'), address: np('MOM'), condition: clause(np('CAT'), 'RUN') })).toEqual({
      en: 'Mom, if the cat ran, the dog would eat.', it: 'Mamma, se il gatto corresse, il cane mangerebbe.',
      fr: 'Maman, si le chat courait, le chien mangerait.', de: 'Mama, wenn der Kater laufen würde, würde der Hund fressen.',
      es: 'Mamá, si el gato corriera, el perro comería.', ja: 'お母さん、もし猫が走ったら、犬は食べます。',
      pt: 'Mamãe, se o gato corresse, o cão comeria.',
    });
    expect(sayAll({ ...command(np('MOM')), coordination: { conjunction: 'and', clause: clause(You, 'EAT') } })).toEqual({
      en: 'Mom, run, and eat.', it: 'Mamma, corri, e mangia.', fr: 'Maman, cours, et mange.', de: 'Mama, lauf, und iss.',
      es: 'Mamá, corre, y come.', ja: 'お母さん、走ってください。そして、食べてください。', pt: 'Mamãe, corra, e coma.',
    });
  });

  test('Mom inside the clause is the name there; a verbless period takes an address too', () => {
    expect(sayAll({ ...command(np('DAD')), complements: { comitative: { phrase: np('MOM') } } })).toEqual({
      en: 'Dad, run with Mom.', it: 'Papà, corri con la mamma.', fr: 'Papa, cours avec Maman.', de: 'Papa, lauf mit Mama.',
      es: 'Papá, corre con Mamá.', ja: 'お父さん、お母さんと走ってください。', pt: 'Papai, corra com Mamãe.',
    });
    expect(sayAll({ subject: np('CAT'), address: np('MOM') })).toEqual({
      en: 'Mom, the cat.', it: 'Mamma, il gatto.', fr: 'Maman, le chat.', de: 'Mama, der Kater.',
      es: 'Mamá, el gato.', ja: 'お母さん、猫。', pt: 'Mamãe, o gato.',
    });
  });
});

describe('the vocative on a common noun', () => {
  test('plural, modified, and an either-or address', () => {
    expect(sayAll(command(np('CAT', { number: 'plural' }), YouAll))).toEqual({
      en: 'Cats, run.', it: 'Gatti, correte.', fr: 'Chats, courez.', de: 'Kater, lauft.',
      es: 'Gatos, corred.', ja: '猫、走ってください。', pt: 'Gatos, corram.',
    });
    expect(sayAll(command(np('CAT', { adjectives: ['SMALL'] })))).toEqual({
      en: 'Small cat, run.', it: 'Piccolo gatto, corri.', fr: 'Petit chat, cours.', de: 'Kleiner Kater, lauf.',
      es: 'Gato pequeño, corre.', ja: '小さい猫、走ってください。', pt: 'Gato pequeno, corra.',
    });
    expect(sayAll(command(momAndDad('or')))).toEqual({
      en: 'Mom or Dad, run.', it: 'Mamma o papà, corri.', fr: 'Maman ou Papa, cours.', de: 'Mama oder Papa, lauf.',
      es: 'Mamá o Papá, corre.', ja: 'お母さんかお父さん、走ってください。', pt: 'Mamãe ou Papai, corra.',
    });
  });

  // Portuguese, and Italian off a singular unmodified kin noun, are left out where the address is
  // possessed by a pronoun: they keep the possessive's article (A336).
  test("Japanese: an elder's honorific under a name's, one's own and nobody's possession", () => {
    expect(sayAll(command(np('MOTHER', { possessor: np('PETER') })))).toEqual({
      en: "Peter's mother, run.", it: 'Madre di Pietro, corri.', fr: 'Mère de Pierre, cours.', de: 'Mutter Peters, lauf.',
      es: 'Madre de Pedro, corre.', ja: 'ピーターのお母さん、走ってください。', pt: 'Mãe do Pedro, corra.',
    });
    expect(sayAll(command(np('FATHER', { possessor: of('1') })))).toMatchObject({
      en: 'My father, run.', it: 'Mio padre, corri.', fr: 'Mon père, cours.', de: 'Mein Vater, lauf.',
      es: 'Mi padre, corre.', ja: 'お父さん、走ってください。',
    });
    expect(sayAll(command(np('GRANDMOTHER', { possessor: of('1') })))).toMatchObject({
      en: 'My grandmother, run.', it: 'Mia nonna, corri.', fr: 'Ma grand-mère, cours.', de: 'Meine Großmutter, lauf.',
      es: 'Mi abuela, corre.', ja: 'おばあさん、走ってください。',
    });
    expect(sayAll(command(np('UNCLE')))).toEqual({
      en: 'Uncle, run.', it: 'Zio, corri.', fr: 'Oncle, cours.', de: 'Onkel, lauf.',
      es: 'Tío, corre.', ja: 'おじさん、走ってください。', pt: 'Tio, corra.',
    });
    expect(sayAll(command(np('SISTER', { possessor: of('1'), adjectives: ['YOUNGER'] })))).toMatchObject({
      en: 'My younger sister, run.', fr: 'Ma sœur cadette, cours.', de: 'Meine jüngere Schwester, lauf.',
      es: 'Mi hermana menor, corre.', ja: '妹、走ってください。',
    });
  });
});

// A335. A French pronoun addressee takes the subject clitic, "Tu, cours." A vocative pronoun stands
// on its own, detached from any verb, so French takes the tonic form, as after a preposition.
describe('known bugs: a French pronoun addressee takes the clitic (A335)', () => {
  test('a 2nd-singular pronoun address is the tonic toi', () => {
    expect(sayAll(command(You))).toEqual({
      en: 'You, run.', it: 'Tu, corri.', fr: 'Toi, cours.', de: 'Du, lauf.',
      es: 'Tú, corre.', ja: 'あなた、走ってください。', pt: 'Você, corra.',
    });
  });

  // vous is its own tonic form, so the plural is right today.
  test('regression: the 2nd-plural pronoun address', () => {
    expect(sayAll(command(YouAll, YouAll))).toEqual({
      en: 'You, run.', it: 'Voi, correte.', fr: 'Vous, courez.', de: 'Ihr, lauft.',
      es: 'Vosotros, corred.', ja: 'あなたたち、走ってください。', pt: 'Vocês, corram.',
    });
  });

  test('toi behind an interjection, before a negative command and before a statement', () => {
    expect(sayAll({ ...command(You), interjection: 'HEY' })).toEqual({
      en: 'Hey, you, run.', it: 'Ehi, tu, corri.', fr: 'Hé, toi, cours.', de: 'Hey, du, lauf.',
      es: 'Oye, tú, corre.', ja: 'ねえ、あなた、走ってください。', pt: 'Ei, você, corra.',
    });
    expect(sayAll({ ...command(You), verbPhrase: dontRun })).toEqual({
      en: 'You, do not run.', it: 'Tu, non correre.', fr: 'Toi, ne cours pas.', de: 'Du, lauf nicht.',
      es: 'Tú, no corras.', ja: 'あなた、走るな。', pt: 'Você, não corra.',
    });
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), address: You })).toEqual({
      en: 'You, the cat runs.', it: 'Tu, il gatto corre.', fr: 'Toi, le chat court.', de: 'Du, der Kater läuft.',
      es: 'Tú, el gato corre.', ja: 'あなた、猫は走ります。', pt: 'Você, o gato corre.',
    });
  });
});

// A336. Italian and Portuguese keep the definite article a possessive rides on in address: "Il mio
// amico, corri", "O meu pai, corra". A vocative has no article, possessed or not: "Mio amico", "Meu
// pai". P11-E3's Done §9 left it to the possessed-head work of P11-E4.
describe('known bugs: an Italian or Portuguese addressee with a possessive keeps the article (A336)', () => {
  test('Italian and Portuguese: a possessed address off the kin-noun rule drops the article', () => {
    expect(sayAll(command(np('FRIEND', { possessor: of('1') })))).toEqual({
      en: 'My friend, run.', it: 'Mio amico, corri.', fr: 'Mon ami, cours.', de: 'Mein Freund, lauf.',
      es: 'Mi amigo, corre.', ja: '私の友達、走ってください。', pt: 'Meu amigo, corra.',
    });
    expect(sayAll(command(np('SISTER', { possessor: of('1'), adjectives: ['YOUNGER'] })))).toEqual({
      en: 'My younger sister, run.', it: 'Mia sorella minore, corri.', fr: 'Ma sœur cadette, cours.',
      de: 'Meine jüngere Schwester, lauf.', es: 'Mi hermana menor, corre.', ja: '妹、走ってください。',
      pt: 'Minha irmã mais nova, corra.',
    });
    expect(sayAll(command(np('BROTHER', { possessor: of('1'), adjectives: ['ELDER'] })))).toEqual({
      en: 'My older brother, run.', it: 'Mio fratello maggiore, corri.', fr: 'Mon frère aîné, cours.',
      de: 'Mein älterer Bruder, lauf.', es: 'Mi hermano mayor, corre.', ja: 'お兄さん、走ってください。',
      pt: 'Meu irmão mais velho, corra.',
    });
    // Japanese is left out: 祖父母 is a seed gap (GRANDPARENT has no honorific column), not this bug.
    expect(sayAll(command(np('GRANDPARENT', { number: 'plural', possessor: of('1') }), YouAll))).toMatchObject({
      en: 'My grandparents, run.', it: 'Miei nonni, correte.', fr: 'Mes grands-parents, courez.',
      de: 'Meine Großeltern, lauft.', es: 'Mis abuelos, corred.', pt: 'Meus avós, corram.',
    });
  });

  test('Portuguese: a possessed kin noun drops the article', () => {
    expect(sayAll(command(np('FATHER', { possessor: of('1') })))).toEqual({
      en: 'My father, run.', it: 'Mio padre, corri.', fr: 'Mon père, cours.', de: 'Mein Vater, lauf.',
      es: 'Mi padre, corre.', ja: 'お父さん、走ってください。', pt: 'Meu pai, corra.',
    });
    expect(sayAll(command(np('MOTHER', { possessor: of('2') })))).toEqual({
      en: 'Your mother, run.', it: 'Tua madre, corri.', fr: 'Ta mère, cours.', de: 'Deine Mutter, lauf.',
      es: 'Tu madre, corre.', ja: 'あなたのお母さん、走ってください。', pt: 'Sua mãe, corra.',
    });
  });

  test('the article goes in a coordinated address, before a statement and for a plural possessor; the object keeps it', () => {
    expect(sayAll(command({ conjuncts: [np('FRIEND', { possessor: of('1') }), np('MOM')], conjunction: 'and' }, YouAll))).toEqual({
      en: 'My friend and Mom, run.', it: 'Mio amico e mamma, correte.', fr: 'Mon ami et Maman, courez.',
      de: 'Mein Freund und Mama, lauft.', es: 'Mi amigo y Mamá, corred.', ja: '私の友達とお母さん、走ってください。',
      pt: 'Meu amigo e Mamãe, corram.',
    });
    expect(sayAll({ ...clause(np('CAT'), 'RUN'), address: np('FRIEND', { possessor: of('1') }) }))
      .toMatchObject({ it: 'Mio amico, il gatto corre.', pt: 'Meu amigo, o gato corre.' });
    const ours: PronominalPossessor = { kind: 'pronominal', person: '1', number: 'plural' };
    expect(sayAll(command(np('FRIEND', { possessor: ours })))).toMatchObject({ it: 'Nostro amico, corri.', pt: 'Nosso amigo, corra.' });
    // The same possessed noun as the command's object is an argument, and keeps its article.
    expect(sayAll({ ...command(np('FRIEND', { possessor: of('1') })), verbPhrase: { verb: 'SEE' }, directObject: np('FRIEND', { possessor: of('1') }) }))
      .toMatchObject({ it: 'Mio amico, vedi il mio amico.', pt: 'Meu amigo, veja o meu amigo.' });
  });

  // Italian loro takes its article everywhere, and in address too.
  test('regression: Italian loro keeps its article in address', () => {
    const theirs: PronominalPossessor = { kind: 'pronominal', person: '3', number: 'plural' };
    expect(sayAll(command(np('FATHER', { possessor: theirs })))).toMatchObject({ it: 'Il loro padre, corri.', pt: 'Seu pai, corra.' });
  });

  test('regression: a name possessor in address, and the possessed subject outside it', () => {
    expect(sayAll(command(np('MOTHER', { possessor: np('PETER') })))).toMatchObject({ it: 'Madre di Pietro, corri.', pt: 'Mãe do Pedro, corra.' });
    expect(sayAll(command(np('MOTHER', { possessor: of('1') })))).toMatchObject({ it: 'Mia madre, corri.', es: 'Mi madre, corre.' });
    // Outside address the article stays.
    expect(runs(np('FRIEND', { possessor: of('1') }))).toMatchObject({ it: 'il mio amico corre.', pt: 'o meu amigo corre.' });
  });
});

// A338. An address calls the hearer, so two plans contradict it: an instruction, which is addressed
// to nobody ("Maman, courir."), and a pronoun that is not the hearer ("Je, le chat court."). The
// target is a refusal by name, as the engine refuses other malformed plans (A267, A273). A refusal
// has no correct output to pin, so the pins assert the throw. Refusing or dropping the address is the
// fixer's decision; a drop would turn these pins into rendered rows.
describe('known bugs: contradictory address plans are not refused (A338)', () => {
  test('an address on an instruction is refused by name', () => {
    expect(() => sayAll({ ...command(np('MOM')), imperativeRegister: 'instruction' })).toThrow(/address/);
  });

  test('a 1st-person pronoun address is refused by name', () => {
    expect(() => sayAll({ ...clause(np('CAT'), 'RUN'), address: np('FIRST_PERSON') })).toThrow(/address/);
  });

  test('a 3rd-person pronoun address is refused by name', () => {
    expect(() => sayAll({ ...clause(np('CAT'), 'RUN'), address: np('THIRD_PERSON') })).toThrow(/address/);
  });

  test('the 1st plural and a group with one bad conjunct are refused too', () => {
    expect(() => sayAll({ ...clause(np('CAT'), 'RUN'), address: np('FIRST_PERSON', { number: 'plural' }) })).toThrow(/address.*1st-person/);
    expect(() => sayAll(command({ conjuncts: [np('MOM'), np('FIRST_PERSON')], conjunction: 'and' }, YouAll))).toThrow(/address.*1st-person/);
    expect(() => sayAll(command(np('THIRD_PERSON', { number: 'plural' }), YouAll))).toThrow(/address.*3rd-person/);
  });

  // An indefinite pronoun calls whoever hears it, so it is an address.
  test('regression: an indefinite pronoun address is not refused', () => {
    expect(sayAll(command(np('SOMEONE')))).toEqual({
      en: 'Someone, run.', it: 'Qualcuno, corri.', fr: "Quelqu'un, cours.", de: 'Jemand, lauf.',
      es: 'Alguien, corre.', ja: '誰か、走ってください。', pt: 'Alguém, corra.',
    });
  });

  test('regression: a request takes the address, and an instruction without one is its infinitive', () => {
    expect(sayAll({ ...command(np('MOM')), imperativeRegister: 'request' })).toEqual({
      en: 'Mom, run.', it: 'Mamma, corri.', fr: 'Maman, cours.', de: 'Mama, lauf.',
      es: 'Mamá, corre.', ja: 'お母さん、走ってください。', pt: 'Mamãe, corra.',
    });
    expect(sayAll({ ...clause(You, 'RUN'), imperative: true, imperativeRegister: 'instruction' })).toEqual({
      en: 'run.', it: 'corri.', fr: 'courir.', de: 'laufen.', es: 'correr.', ja: '走り。', pt: 'correr.',
    });
  });
});

// A349. French resumes a coordinated subject holding a pronoun with its plural clitic ("toi et moi,
// nous courons"). The vocative goes through the same subject text, so a coordinated address holding
// the 2nd person gains a resumption of its own: "Toi et Maman, vous, courez." A command has no subject
// to resume, and a statement already writes its own "vous": "Toi et Maman, vous, vous courez." The
// address should be the bare group.
describe('known bugs: a French coordinated address resumes itself with vous (A349)', () => {
  const you = np('SECOND_PERSON');
  const youAll = np('SECOND_PERSON', { number: 'plural' });
  const youAndMom: NounElement = { conjuncts: [you, np('MOM')], conjunction: 'and' };

  test('the command', () => {
    expect(sayAll(command(youAndMom, youAll)).fr).toBe('Toi et Maman, courez.');
    expect(sayAll(command({ conjuncts: [np('MOM'), you], conjunction: 'and' }, youAll)).fr).toBe('Maman et toi, courez.');
  });

  test('negated, and with an object', () => {
    expect(sayAll({ ...command(youAndMom, youAll), verbPhrase: { verb: 'RUN', negative: true } }).fr).toBe('Toi et Maman, ne courez pas.');
    expect(sayAll({ ...clause(youAll, 'EAT', { directObject: np('FOOD') }), imperative: true, address: youAndMom }).fr)
      .toBe('Toi et Maman, mangez la nourriture.');
  });

  test('a statement', () => {
    expect(sayAll({ ...clause(youAll, 'RUN'), address: youAndMom }).fr).toBe('Toi et Maman, vous courez.');
  });

  test('an or-group, three conjuncts, and the group as a verbless period or a subject', () => {
    expect(sayAll(command({ conjuncts: [you, np('MOM')], conjunction: 'or' }, youAll)).fr).toBe('Toi ou Maman, courez.');
    expect(sayAll(command({ conjuncts: [np('DAD'), you, np('MOM')], conjunction: 'and' }, youAll)).fr).toBe('Papa, toi et Maman, courez.');
    // The same group standing as a verbless period is no clause either; as a subject it keeps "vous".
    expect(sayAll({ subject: youAndMom }).fr).toBe('toi et Maman.');
    expect(sayAll(clause(youAndMom, 'RUN')).fr).toBe('toi et Maman, vous courez.');
  });

  test('regression: the other six, and a French address with no pronoun or a single one', () => {
    expect(sayAll(command(youAndMom, youAll))).toMatchObject({
      en: 'You and Mom, run.', it: 'Tu e mamma, correte.', de: 'Du und Mama, lauft.',
      es: 'Tú y Mamá, corred.', ja: 'あなたとお母さん、走ってください。', pt: 'Você e Mamãe, corram.',
    });
    expect(sayAll(command({ conjuncts: [np('MOM'), np('DAD')], conjunction: 'and' }, youAll)).fr).toBe('Maman et Papa, courez.');
    expect(sayAll(command(you)).fr).toBe('Toi, cours.');
    expect(sayAll(command(youAll, youAll)).fr).toBe('Vous, courez.');
  });
});
