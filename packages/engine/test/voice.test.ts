import { describe, expect, test } from 'vitest';
import type { PhrasePlan, VerbPhrase } from '@signi/shared';
import { clause, furigana, np, sayAll } from './harness.js';

// Grammatical voice (VerbPhrase.voice, A01). Active and passive are one proposition said two ways —
// "the cat eats the food" and "the food is eaten by the cat" are true in exactly the same worlds —
// so the plan is the same and only the realisation differs: the patient is promoted to subject (it
// drives agreement, and a Romance participle agrees with it), the agent is demoted to a by-phrase,
// and the verb becomes auxiliary + participle. Japanese has the morphology instead (〜れる/られる).
//
// The translator does the re-mapping once, for every language, and hands each engine a clause whose
// subject IS the patient (see resolvePhrase); what each engine owes is the morphology and the
// adposition of the by-phrase.
const passive = (
  verbPhrase: Partial<VerbPhrase> = {},
  extra: Omit<Partial<PhrasePlan>, 'subject' | 'verbPhrase'> = {},
): PhrasePlan =>
  clause(np('CAT'), 'EAT', { directObject: np('FOOD'), verbPhrase: { voice: 'passive', ...verbPhrase }, ...extra });

describe('voice', () => {
  test('the active and the passive of one event, in every language', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('FOOD') }))).toEqual({
      en: 'the cat eats the food.',
      it: 'il gatto mangia il cibo.',
      fr: 'le chat mange la nourriture.',
      de: 'der Kater frisst das Essen.',
      es: 'el gato come la comida.',
      ja: '猫は食べ物を食べます。',
      pt: 'o gato come a comida.',
    });
    expect(sayAll(passive())).toEqual({
      en: 'the food is eaten by the cat.',
      it: 'il cibo è mangiato dal gatto.', // "da" fuses with the definite article
      fr: 'la nourriture est mangée par le chat.', // the participe agrees with the patient
      de: 'das Essen wird vom Kater gefressen.', // werden, the eventive passive; von + dative
      es: 'la comida es comida por el gato.',
      ja: '食べ物は猫に食べられます。', // 〜られる, the agent marked に
      pt: 'a comida é comida pelo gato.', // "por" contracts: pelo
    });
  });

  test('the participle agrees with the promoted patient, not with the agent', () => {
    // A feminine plural patient: only the languages whose passive participle agrees show it, which
    // is every Romance one here — the German Partizip and the English participle are invariant, and
    // Japanese inflects for neither gender nor number.
    expect(sayAll(clause(np('CAT'), 'SEE', { directObject: np('HOUSE', { number: 'plural' }), verbPhrase: { voice: 'passive' } })))
      .toEqual({
        en: 'the houses are seen by the cat.',
        it: 'le case sono viste dal gatto.',
        fr: 'les maisons sont vues par le chat.',
        de: 'die Häuser werden vom Kater gesehen.',
        es: 'las casas son vistas por el gato.',
        ja: '家は猫に見られます。',
        pt: 'as casas são vistas pelo gato.',
      });
  });

  test('a coordinated patient agrees as the group does', () => {
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: { conjuncts: [np('DOG'), np('BOOK')], conjunction: 'and' },
      verbPhrase: { voice: 'passive' },
    }))).toMatchObject({
      en: 'the dog and the book are seen by the cat.',
      it: 'il cane e il libro sono visti dal gatto.',
      de: 'der Hund und das Buch werden vom Kater gesehen.',
      ja: '犬と本は猫に見られます。',
    });
  });

  test('the tense is the auxiliary’s', () => {
    expect(sayAll(passive({ tense: 'past' }))).toEqual({
      // The past is the perfective one the active has ("fu mangiato", not the imperfect "era"):
      // what decides it is the event, not the auxiliary spelling it, so the passive auxiliary
      // carries the lexical verb's `stative` rather than its own (A130).
      en: 'the food was eaten by the cat.',
      it: 'il cibo fu mangiato dal gatto.',
      fr: 'la nourriture fut mangée par le chat.',
      de: 'das Essen wurde vom Kater gefressen.',
      es: 'la comida fue comida por el gato.',
      ja: '食べ物は猫に食べられました。',
      pt: 'a comida foi comida pelo gato.',
    });
    expect(sayAll(passive({ tense: 'future' }))).toEqual({
      en: 'the food will be eaten by the cat.',
      it: 'il cibo sarà mangiato dal gatto.',
      fr: 'la nourriture sera mangée par le chat.',
      de: 'das Essen wird vom Kater gefressen werden.', // werden twice: the future of the passive
      es: 'la comida será comida por el gato.',
      ja: '食べ物は猫に食べられます。', // Japanese has no future; the present serves
      pt: 'a comida será comida pelo gato.',
    });
  });

  test('negation lands on the auxiliary, so English needs no do-support', () => {
    expect(sayAll(passive({ negative: true }))).toEqual({
      en: 'the food is not eaten by the cat.',
      it: 'il cibo non è mangiato dal gatto.',
      fr: "la nourriture n'est pas mangée par le chat.",
      de: 'das Essen wird vom Kater nicht gefressen.',
      es: 'la comida no es comida por el gato.',
      ja: '食べ物は猫に食べられません。',
      pt: 'a comida não é comida pelo gato.',
    });
  });

  test('the aspects compose, each auxiliary taking the voice’s own', () => {
    expect(sayAll(passive({ aspect: 'progressive' }))).toMatchObject({
      en: 'the food is being eaten by the cat.',
      it: 'il cibo sta essendo mangiato dal gatto.',
      es: 'la comida está siendo comida por el gato.',
      de: 'das Essen wird gerade vom Kater gefressen.',
      ja: '食べ物は猫に食べられています。',
    });
    expect(sayAll(passive({ aspect: 'resultative' }))).toMatchObject({
      en: 'the food has been eaten by the cat.',
      it: 'il cibo è stato mangiato dal gatto.', // the perfect of essere
      fr: 'la nourriture a été mangée par le chat.',
      // The German passive perfect takes the Ersatzform: "worden", never "*geworden".
      de: 'das Essen ist vom Kater gefressen worden.',
      es: 'la comida ha sido comida por el gato.',
    });
    expect(sayAll(passive({ aspect: 'prospective' }))).toMatchObject({
      en: 'the food is about to be eaten by the cat.',
      it: 'il cibo sta per essere mangiato dal gatto.',
      de: 'das Essen ist im Begriff, vom Kater gefressen zu werden.',
      pt: 'a comida está prestes a ser comida pelo gato.',
    });
  });

  test('a modal governs the passive group', () => {
    expect(sayAll(passive({ modals: ['MUST'] }))).toEqual({
      en: 'the food must be eaten by the cat.',
      it: 'il cibo deve essere mangiato dal gatto.',
      fr: 'la nourriture doit être mangée par le chat.',
      de: 'das Essen muss vom Kater gefressen werden.',
      es: 'la comida debe ser comida por el gato.',
      ja: '食べ物は猫に食べられる必要があります。',
      pt: 'a comida deve ser comida pelo gato.',
    });
  });

  test('a conditional apodosis is passive too', () => {
    expect(sayAll({ ...passive(), condition: clause(np('DOG'), 'RUN') })).toMatchObject({
      en: 'if the dog ran, the food would be eaten by the cat.',
      it: 'se il cane corresse, il cibo sarebbe mangiato dal gatto.',
      fr: 'si le chien courait, la nourriture serait mangée par le chat.',
      es: 'si el perro corriera, la comida sería comida por el gato.',
    });
  });

  test('a question asks the passive clause, the auxiliary leading where the language inverts', () => {
    expect(sayAll({ ...passive(), interrogative: true })).toMatchObject({
      en: 'is the food eaten by the cat?',
      de: 'wird das Essen vom Kater gefressen?',
      fr: 'est-ce que la nourriture est mangée par le chat\u00a0?',
      ja: '食べ物は猫に食べられますか？',
    });
  });

  test('the citation of a passive is the auxiliary’s infinitive plus the participle', () => {
    expect(sayAll({ ...passive(), infinitive: true })).toEqual({
      en: 'to be eaten by the cat.',
      it: 'essere mangiato dal gatto.',
      fr: 'être mangée par le chat.',
      de: 'vom Kater gegessen werden.',
      es: 'ser comida por el gato.',
      ja: '猫に食べられる。',
      pt: 'ser comida pelo gato.',
    });
  });

  test('a pronoun agent takes the oblique form its language gives after a preposition', () => {
    expect(sayAll(clause(np('FIRST_PERSON'), 'SEE', { directObject: np('DOG'), verbPhrase: { voice: 'passive' } })))
      .toEqual({
        en: 'the dog is seen by me.',
        it: 'il cane è visto da me.',
        fr: 'le chien est vu par moi.',
        de: 'der Hund wird von mir gesehen.', // the dative, which German's disjunctive form is
        es: 'el perro es visto por mí.',
        ja: '犬は私に見られます。',
        pt: 'o cão é visto por mim.',
      });
  });

  test('a coordinated agent repeats the adposition where the language fuses it', () => {
    expect(sayAll(clause({ conjuncts: [np('CAT'), np('DOG')], conjunction: 'and' }, 'SEE', {
      directObject: np('BOOK'),
      verbPhrase: { voice: 'passive' },
    }))).toEqual({
      en: 'the book is seen by the cat and the dog.', // "by" is said once: English fuses nothing
      it: 'il libro è visto dal gatto e dal cane.',
      fr: 'le livre est vu par le chat et le chien.',
      de: 'das Buch wird vom Kater und vom Hund gesehen.',
      es: 'el libro es visto por el gato y el perro.',
      ja: '本は猫と犬に見られます。',
      pt: 'o livro é visto pelo gato e pelo cão.',
    });
  });

  test('the verb’s object sense survives the re-mapping', () => {
    // KNOW is "sapere" with no object and "conoscere" with one (A131). The passive still has a
    // patient — it is the subject now — so the object sense is the right one.
    expect(sayAll(clause(np('CAT'), 'KNOW', { directObject: np('CHILD'), verbPhrase: { voice: 'passive' } })))
      .toMatchObject({
        en: 'the child is known by the cat.',
        it: 'il bambino è conosciuto dal gatto.',
        es: 'el niño es conocido por el gato.',
      });
  });

  test('a ditransitive keeps its recipient, and Japanese spends its に on it', () => {
    expect(sayAll(clause(np('CAT'), 'GIVE', {
      directObject: np('BOOK'),
      verbPhrase: { voice: 'passive' },
      complements: { terminus: { phrase: np('CHILD') } },
    }))).toMatchObject({
      en: 'the book is given by the cat to the child.',
      it: 'il libro è dato dal gatto al bambino.',
      de: 'das Buch wird dem Kind vom Kater gegeben.',
      // Two に in one clause cannot be told apart, so the agent takes によって instead.
      ja: '本は猫によって子供にあげられます。',
    });
  });

  test('Japanese reads the passive form it was seeded with', () => {
    expect(furigana(passive())).toEqual(['たべもの', 'ねこ', 'たべられます']);
  });
});

// ── The agentless passive ────────────────────────────────────────────────────
// "The food is eaten" is not this proposition with a word left out: it asserts that *somebody* ate
// the food, which the active entails but does not equal. So it is a different plan, not a different
// rendering of this one — its subject is the generic person — and the one rule voice adds is that a
// generic agent is never spoken as a by-phrase. This is the behaviour a naive "hide the by-phrase"
// implementation gets wrong, and the reason there is no `agentless` voice value.
describe('the agentless passive', () => {
  const generic = (verbPhrase: Partial<VerbPhrase> = {}): PhrasePlan =>
    clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('FOOD'), verbPhrase });

  test('a generic subject is the impersonal in the active', () => {
    expect(sayAll(generic())).toEqual({
      en: 'one eats the food.',
      it: 'si mangia il cibo.',
      fr: 'on mange la nourriture.',
      de: 'man isst das Essen.',
      es: 'se come la comida.',
      ja: '人は食べ物を食べます。',
      pt: 'se come a comida.',
    });
  });

  test('and is dropped outright in the passive — no "by one", no "da si", no "von man"', () => {
    expect(sayAll(generic({ voice: 'passive' }))).toEqual({
      en: 'the food is eaten.',
      it: 'il cibo è mangiato.',
      fr: 'la nourriture est mangée.',
      de: 'das Essen wird gegessen.',
      es: 'la comida es comida.',
      ja: '食べ物は食べられます。',
      pt: 'a comida é comida.',
    });
    expect(sayAll(generic({ voice: 'passive', tense: 'past' }))).toEqual({
      en: 'the food was eaten.',
      it: 'il cibo fu mangiato.',
      fr: 'la nourriture fut mangée.',
      de: 'das Essen wurde gegessen.',
      es: 'la comida fue comida.',
      ja: '食べ物は食べられました。',
      pt: 'a comida foi comida.',
    });
  });
});

// ── The Japanese potential ───────────────────────────────────────────────────
// 〜ことができる and the 〜れる/られる passive both demote the agent and leave the patient as the topic,
// so Japanese does not stack them: what it says for "X cannot be V-ed" is the ability on the plain
// verb, the topic は doing the promotion (see `isPotentialPassive`). This is the shape all eight of
// C11's "Could not …" messages take, so it is the one Japanese output those strings depend on.
describe('a passive under the Japanese potential', () => {
  const generic = (verbPhrase: Partial<VerbPhrase> = {}): PhrasePlan =>
    clause(np('GENERIC_PERSON'), 'EAT', { directObject: np('FOOD'), verbPhrase });

  test('an agentless one is said on the active verb, not on 〜られる', () => {
    expect(sayAll(generic({ voice: 'passive', modals: ['CAN'], tense: 'past', negative: true }))).toEqual({
      en: 'the food could not be eaten.',
      it: 'il cibo non poteva essere mangiato.',
      fr: 'la nourriture ne pouvait pas être mangée.',
      de: 'das Essen konnte nicht gegessen werden.',
      es: 'la comida no podía ser comida.',
      ja: '食べ物は食べることができませんでした。', // not 食べられることができませんでした
      pt: 'a comida não podia ser comida.',
    });
  });

  test('a spoken agent keeps the 〜られる — the に phrase needs a verb to attach to', () => {
    expect(sayAll(passive({ modals: ['CAN'] }))).toMatchObject({
      en: 'the food can be eaten by the cat.',
      ja: '食べ物は猫に食べられることができます。',
    });
  });

  test('another modal does not absorb the voice', () => {
    expect(sayAll(generic({ voice: 'passive', modals: ['MUST'] }))).toMatchObject({
      en: 'the food must be eaten.',
      ja: '食べ物は食べられる必要があります。',
    });
  });
});

// ── What normalises back to active ───────────────────────────────────────────
// A half passive — an auxiliary with nothing promoted into the subject slot — is worse than none,
// so every case that cannot be one renders as the plain active clause instead (see resolveVoice).
describe('a passive that cannot be one', () => {
  test('an intransitive verb has no patient to promote', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { voice: 'passive' } }))).toMatchObject({
      en: 'the cat runs.',
      it: 'il gatto corre.',
      de: 'der Kater läuft.',
    });
  });

  test('neither has a transitive verb with no object in the plan', () => {
    expect(sayAll(clause(np('CAT'), 'EAT', { verbPhrase: { voice: 'passive' } }))).toMatchObject({
      en: 'the cat eats.',
      it: 'il gatto mangia.',
      ja: '猫は食べます。',
    });
  });

  test('a command is spoken to the one who acts', () => {
    expect(sayAll({ ...passive(), imperative: true })).toMatchObject({
      en: 'eat the food.',
      it: 'mangia il cibo.',
      de: 'friss das Essen.',
    });
  });

  test('a verb whose object needs a preposition has no direct object to promote — per language', () => {
    // English and Japanese click a thing; the others click ON it (A139), and what they have no
    // direct object for they cannot passivize. One plan, and the voice takes in the languages it can.
    expect(sayAll(clause(np('CHILD'), 'CLICK', { directObject: np('BOOK'), verbPhrase: { voice: 'passive' } })))
      .toMatchObject({
        en: 'the book is clicked by the child.',
        ja: '本は子供にクリックされます。',
        it: 'il bambino clicca sul libro.',
        de: 'das Kind klickt auf das Buch.',
      });
  });

  test('a genitive relative stays active, since its head owns the agent the passive would demote', () => {
    expect(sayAll(clause(
      np('CHILD', { relative: { headRole: 'possessor', subject: np('CAT'), verbPhrase: { verb: 'EAT', voice: 'passive' }, directObject: np('FOOD') } }),
      'RUN',
    ))).toMatchObject({
      en: 'the child whose cat eats the food runs.',
      it: 'il bambino il cui gatto mangia il cibo corre.',
      de: 'das Kind, dessen Kater das Essen frisst, läuft.',
    });
  });
});

// ── The passive in a relative clause ─────────────────────────────────────────
// A relative is re-mapped as a main clause is, and the gap moves with the head: a head gapped as the
// object is the patient, so it is the subject now; a head gapped as the subject is the agent, the one
// gap only a passive has; a head in a complement stays where it was (see resolveRelativeClause).
describe('a passive relative clause', () => {
  test('a head gapped as the object is the promoted patient, and the agent follows as the by-phrase', () => {
    // As built on the canvas: the book that Antarctica writes, turned passive, is read by Africa.
    expect(sayAll(clause(np('AFRICA'), 'READ', {
      directObject: np('BOOK', { relative: { headRole: 'directObject', subject: np('ANTARCTICA'), verbPhrase: { verb: 'WRITE', voice: 'passive' } } }),
      verbPhrase: { voice: 'passive' },
    }))).toEqual({
      en: 'the book that is written by Antarctica is read by Africa.',
      it: "il libro che è scritto dall'Antartide è letto dall'Africa.",
      fr: "le livre qui est écrit par l'Antarctique est lu par l'Afrique.",
      de: 'das Buch, das von der Antarktis geschrieben wird, wird von Afrika gelesen.',
      es: 'el libro que es escrito por la Antártida es leído por África.',
      ja: '南極大陸に書かれる本はアフリカに読まれます。',
      pt: 'o livro que é escrito pela Antártida é lido pela África.',
    });
  });

  test('the participle agrees with the head it promotes', () => {
    expect(sayAll(clause(
      np('HOUSE', { number: 'plural', relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'SEE', voice: 'passive' } } }),
      'RUN',
    ))).toEqual({
      en: 'the houses that are seen by the cat run.',
      it: 'le case che sono viste dal gatto corrono.',
      fr: 'les maisons qui sont vues par le chat courent.',
      de: 'die Häuser, die vom Kater gesehen werden, laufen.',
      es: 'las casas que son vistas por el gato corren.',
      ja: '猫に見られる家は走ります。',
      pt: 'as casas que são vistas pelo gato correm.',
    });
  });

  test('the auxiliary carries the tense and the aspect, as in a main clause', () => {
    const food = (verbPhrase: Partial<VerbPhrase>) => clause(
      np('FOOD', { relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'EAT', voice: 'passive', ...verbPhrase } } }),
      'RUN',
    );
    expect(sayAll(food({ tense: 'past' }))).toMatchObject({
      en: 'the food that was eaten by the cat runs.',
      it: 'il cibo che fu mangiato dal gatto corre.',
      de: 'das Essen, das vom Kater gefressen wurde, läuft.',
      ja: '猫に食べられた食べ物は走ります。',
    });
    expect(sayAll(food({ aspect: 'resultative' }))).toMatchObject({
      en: 'the food that has been eaten by the cat runs.',
      it: 'il cibo che è stato mangiato dal gatto corre.',
      fr: 'la nourriture qui a été mangée par le chat court.',
      de: 'das Essen, das vom Kater gefressen worden ist, läuft.', // the Ersatzform "worden"
    });
    expect(sayAll(food({ modals: ['MUST'] }))).toMatchObject({
      en: 'the food that must be eaten by the cat runs.',
      pt: 'a comida que deve ser comida pelo gato corre.',
      ja: '猫に食べられる必要がある食べ物は走ります。',
    });
  });

  test('a generic agent is demoted to nothing: the agentless passive', () => {
    expect(sayAll(clause(
      np('FOOD', { relative: { headRole: 'directObject', subject: np('GENERIC_PERSON'), verbPhrase: { verb: 'EAT', voice: 'passive' } } }),
      'RUN',
    ))).toEqual({
      en: 'the food that is eaten runs.',
      it: 'il cibo che è mangiato corre.',
      fr: 'la nourriture qui est mangée court.',
      de: 'das Essen, das gegessen wird, läuft.',
      es: 'la comida que es comida corre.',
      ja: '食べられる食べ物は走ります。',
      pt: 'a comida que é comida corre.',
    });
  });

  test('a head gapped as the subject is the agent, and its relativizer takes the by-phrase’s adposition', () => {
    // Japanese relativises no agent: its gapped clause would lose the one who acts, so it stays active.
    expect(sayAll(clause(
      np('CHILD', { relative: { verbPhrase: { verb: 'EAT', voice: 'passive' }, directObject: np('FOOD') } }),
      'RUN',
    ))).toEqual({
      en: 'the child by whom the food is eaten runs.',
      it: 'il bambino dal quale il cibo è mangiato corre.',
      fr: "l'enfant par lequel la nourriture est mangée court.",
      de: 'das Kind, von dem das Essen gegessen wird, läuft.', // a child eats: "essen", not "fressen"
      es: 'el niño por el que la comida es comida corre.',
      ja: '食べ物を食べる子供は走ります。',
      pt: 'a criança pela qual a comida é comida corre.',
    });
    expect(sayAll(clause(
      np('HOUSE', { number: 'plural', relative: { verbPhrase: { verb: 'SEE', voice: 'passive' }, directObject: np('CAT') } }),
      'RUN',
    ))).toMatchObject({
      en: 'the houses by which the cat is seen run.',
      it: 'le case dalle quali il gatto è visto corrono.',
      fr: 'les maisons par lesquelles le chat est vu courent.',
      de: 'die Häuser, von denen der Kater gesehen wird, laufen.', // the dative plural "denen"
      pt: 'as casas pelas quais o gato é visto correm.',
    });
  });

  test('a head in a complement stays there while the patient and the agent swap around it', () => {
    expect(sayAll(clause(
      np('HOUSE', { relative: { headRole: 'locative', subject: np('CAT'), verbPhrase: { verb: 'EAT', voice: 'passive' }, directObject: np('FOOD') } }),
      'RUN',
    ))).toEqual({
      en: 'the house where the food is eaten by the cat runs.',
      it: 'la casa dove il cibo è mangiato dal gatto corre.',
      fr: 'la maison où la nourriture est mangée par le chat court.',
      de: 'das Haus, in dem das Essen vom Kater gefressen wird, läuft.',
      es: 'la casa donde la comida es comida por el gato corre.',
      ja: '食べ物が猫に食べられる家は走ります。',
      pt: 'a casa onde a comida é comida pelo gato corre.',
    });
  });
});

// A194. A French past participle agrees like an adjective, and one that already ends in -s has no
// separate masculine plural: "des mots compris", never "compriss". `agreeParticipleFr` appends the
// plural -s unconditionally, so the three seeded participles ending in -s — INCLUDE "inclus",
// UNDERSTAND "compris", ACQUIRE "acquis" — double it. The feminine is right, because the -e comes
// first ("comprise" → "comprises"). Reported while seeding MEANING and INCLUDE (localization B50).
describe('known bugs: a French participle in -s doubles it in the masculine plural', () => {
  const understood = (verbPhrase: Partial<VerbPhrase> = {}) =>
    sayAll(clause(np('CAT'), 'UNDERSTAND', {
      directObject: np('WORD', { number: 'plural' }),
      verbPhrase: { voice: 'passive', ...verbPhrase },
    })).fr;

  test.fails('the passive participle of the three verbs whose participle ends in -s', () => {
    expect(understood()).toBe('les mots sont compris par le chat.'); // now: "compriss"
    expect(sayAll(clause(np('CAT'), 'INCLUDE', {
      directObject: np('MEANING', { number: 'plural' }), verbPhrase: { voice: 'passive' },
    })).fr).toBe('les sens sont inclus par le chat.'); // now: "incluss"
    expect(sayAll(clause(np('CAT'), 'ACQUIRE', {
      directObject: np('WORD', { number: 'plural' }), verbPhrase: { voice: 'passive' },
    })).fr).toBe('les mots sont acquis par le chat.'); // now: "acquiss"
    // The generalisation: the participle is the same word in every tense, aspect and polarity,
    // under a modal and inside a relative clause.
    expect(understood({ tense: 'past' })).toBe('les mots furent compris par le chat.');
    expect(understood({ tense: 'future' })).toBe('les mots seront compris par le chat.');
    expect(understood({ aspect: 'resultative' })).toBe('les mots ont été compris par le chat.');
    expect(understood({ negative: true })).toBe('les mots ne sont pas compris par le chat.');
    expect(understood({ modals: ['MUST'] })).toBe('les mots doivent être compris par le chat.');
    expect(sayAll(clause(np('WORD', {
      number: 'plural',
      relative: { headRole: 'directObject', subject: np('CAT'), verbPhrase: { verb: 'UNDERSTAND', voice: 'passive' } },
    }), 'RUN')).fr).toBe('les mots qui sont compris par le chat courent.');
  });

  test.fails('…and the avoir participle agreeing with a preceding clitic object', () => {
    expect(sayAll(clause(np('CAT'), 'UNDERSTAND', {
      directObject: np('THIRD_PERSON', { number: 'plural' }), verbPhrase: { aspect: 'resultative' },
    })).fr).toBe('le chat les a compris.'); // now: "le chat les a compriss."
  });

  // Regression: the feminine puts an -e between the two, so it is regular in both numbers; the
  // masculine singular is the bare participle; every other seeded participle ends in a vowel or -t,
  // including the être-selecting ones; and no other language doubles anything.
  test('regression: the feminine, the singular, the other participles and the other six', () => {
    expect(sayAll(clause(np('CAT'), 'UNDERSTAND', {
      directObject: np('PHRASE'), verbPhrase: { voice: 'passive' },
    })).fr).toBe('la phrase est comprise par le chat.');
    expect(sayAll(clause(np('CAT'), 'UNDERSTAND', {
      directObject: np('PHRASE', { number: 'plural' }), verbPhrase: { voice: 'passive' },
    })).fr).toBe('les phrases sont comprises par le chat.');
    expect(sayAll(clause(np('CAT'), 'UNDERSTAND', {
      directObject: np('THIRD_PERSON', { number: 'plural', gender: 'fem' }), verbPhrase: { aspect: 'resultative' },
    })).fr).toBe('le chat les a comprises.');
    expect(sayAll(clause(np('CAT'), 'UNDERSTAND', {
      directObject: np('WORD'), verbPhrase: { voice: 'passive' },
    })).fr).toBe('le mot est compris par le chat.');
    expect(sayAll(clause(np('CAT'), 'SEE', {
      directObject: np('DOG', { number: 'plural' }), verbPhrase: { voice: 'passive' },
    })).fr).toBe('les chiens sont vus par le chat.');
    expect(sayAll(clause(np('CAT', { number: 'plural' }), 'GO', { verbPhrase: { aspect: 'resultative' } })).fr)
      .toBe('les chats sont allés.');
    expect(sayAll(clause(np('CAT'), 'UNDERSTAND', {
      directObject: np('WORD', { number: 'plural' }), verbPhrase: { voice: 'passive' },
    }))).toMatchObject({
      en: 'the words are understood by the cat.',
      it: 'le parole sono comprese dal gatto.',
      de: 'die Wörter werden vom Kater verstanden.',
      es: 'las palabras son comprendidas por el gato.',
      ja: '単語は猫に理解されます。',
      pt: 'as palavras são compreendidas pelo gato.',
    });
  });
});
