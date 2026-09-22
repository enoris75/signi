import { describe, expect, test } from 'vitest';
import type { NounPhrase, PhrasePlan, RelativeClause } from '@signi/shared';
import { np, say, sayAll } from './harness.js';

// The headless relative-clause gloss (localization C23): a *verbless* period whose lone subject is
// marked `relativeGloss` renders its relative clause **alone** — "that one has saved", "den man
// gespeichert hat", 保存した — which is how an adjective is defined by a clause without becoming a
// noun ("an object that one has saved" defines a saved *thing*). The clause is exactly the one the
// language says after a head: relativizer, the clause's own subject, predicate, objects, complements.
// What belongs to the head is left unsaid — its determiner, adjectives, possessor, and German's
// comma — but the head is still the clause's **antecedent**, so everything that agrees with it in a
// headed relative agrees with it here: German's relative pronoun takes its gender and the gap's case,
// English picks "who" for a person, and the Romance participles and predicate adjectives agree with
// it. The flag is ignored without a relative, under a verb phrase, and on a coordination.

const GENERIC = np('GENERIC_PERSON');

/** A verbless period whose unspoken antecedent `concept` says `relative` alone. */
const gloss = (concept: string, relative: RelativeClause, extra: Partial<NounPhrase> = {}): PhrasePlan => ({
  subject: np(concept, { definiteness: 'indefinite', relative, relativeGloss: true, ...extra }),
});

/** The object-gap clause "that one <verb>s", its agent the generic "one". */
const objectGap = (verb: string, verbPhrase: Partial<RelativeClause['verbPhrase']> = {}): RelativeClause =>
  ({ headRole: 'directObject', subject: GENERIC, verbPhrase: { verb, ...verbPhrase } });

/** The subject-gap clause "that <verb>s …", the antecedent its subject. */
const subjectGap = (verb: string, rest: Omit<Partial<RelativeClause>, 'verbPhrase'> & { verbPhrase?: Partial<RelativeClause['verbPhrase']> } = {}): RelativeClause => {
  const { verbPhrase, ...clause } = rest;
  return { verbPhrase: { verb, ...verbPhrase }, ...clause };
};

const notSolid = subjectGap('BE', { verbPhrase: { negative: true }, complements: { predicative: { phrase: np('SOLID') } } });
const inTheHouse = { locative: { phrase: np('HOUSE', { definiteness: 'definite' }) } };

describe('headless relative-clause gloss (C23)', () => {
  describe('the object gap: the state a verb leaves', () => {
    // SAVED: the resultative of an object-gap clause on the generic "one". Every language says the
    // clause it says after a head, and nothing else: no article, no noun, no comma in German, and
    // French elides "que" before "on". Japanese is the prenominal clause in its plain past, 保存した,
    // the form it takes before a head. Portuguese renders the resultative as its perfective (C06).
    test('the resultative ("that one has saved")', () => {
      expect(sayAll(gloss('OBJECT_THING', objectGap('SAVE', { aspect: 'resultative' })))).toEqual({
        en: 'that one has saved.',
        it: 'che si è salvato.',
        fr: "qu'on a enregistré.",
        de: 'den man gespeichert hat.', // Gegenstand is masculine; the object gap is accusative
        es: 'que se ha guardado.',
        ja: '保存した。',
        pt: 'que se salvou.',
      });
    });

    // The negated resultative keeps each language's negation inside the clause, as a headed one does:
    // French wraps the auxiliary, German puts "nicht" before the participle, Japanese negates the
    // resultative 〜ている.
    test('negated ("that one has not saved")', () => {
      expect(sayAll(gloss('OBJECT_THING', objectGap('SAVE', { aspect: 'resultative', negative: true })))).toEqual({
        en: 'that one has not saved.',
        it: 'che non si è salvato.',
        fr: "qu'on n'a pas enregistré.",
        de: 'den man nicht gespeichert hat.',
        es: 'que no se ha guardado.',
        ja: '保存していない。',
        pt: 'que não se salvou.',
      });
    });

    // UNKNOWN is a standing property, not a result: the plain present, negated. English takes
    // do-support, French "ne … pas", Japanese the negative plain form.
    test('negated, no aspect ("that one does not know")', () => {
      expect(sayAll(gloss('OBJECT_THING', objectGap('KNOW', { negative: true })))).toEqual({
        en: 'that one does not know.',
        it: 'che non si conosce.',
        fr: "qu'on ne connaît pas.",
        de: 'den man nicht kennt.',
        es: 'que no se conoce.',
        ja: '知らない。',
        pt: 'que não se conhece.',
      });
    });

    // VISIBLE: a modal over the clause's verb. The Romance impersonal clitic climbs to the modal
    // ("si può vedere"), German closes on the modal ("sehen kann"), Japanese takes 〜ことができる.
    test('under a modal ("that one can see")', () => {
      expect(sayAll(gloss('OBJECT_THING', objectGap('SEE', { modals: ['CAN'] })))).toEqual({
        en: 'that one can see.',
        it: 'che si può vedere.',
        fr: "qu'on peut voir.",
        de: 'den man sehen kann.',
        es: 'que se puede ver.',
        ja: '見ることができる。',
        pt: 'que se pode ver.',
      });
    });

    // A named agent stands where the generic "one" did, and is spoken with its own article: English
    // "that a verb governs", Japanese marks it が inside the clause (動詞が支配する).
    test('with a named agent ("that a verb governs")', () => {
      const relative: RelativeClause = {
        headRole: 'directObject', subject: np('VERB', { definiteness: 'indefinite' }), verbPhrase: { verb: 'GOVERN' },
      };
      expect(sayAll(gloss('OBJECT_THING', relative))).toEqual({
        en: 'that a verb governs.',
        it: 'che un verbo regge.',
        fr: "qu'un verbe régit.",
        de: 'den ein Verb regiert.',
        es: 'que un verbo rige.',
        ja: '動詞が支配する。',
        pt: 'que um verbo rege.',
      });
    });

    // The passive promotes the gap to the clause's subject, so the participle agrees with the
    // antecedent in every Romance language — here a feminine one, OPTION — and German's pronoun
    // turns nominative ("die gespeichert wird"). The generic agent is not spoken.
    test('in the passive, agreeing with a feminine antecedent ("that is saved")', () => {
      expect(sayAll(gloss('OPTION', objectGap('SAVE', { voice: 'passive' })))).toEqual({
        en: 'that is saved.',
        it: 'che è salvata.',
        fr: 'qui est enregistrée.',
        de: 'die gespeichert wird.',
        es: 'que es guardada.',
        ja: '保存される。',
        pt: 'que é salva.',
      });
    });

    // A French avoir participle agrees with a preceding direct object, and the relativizer is one:
    // the unspoken feminine OPTION gives "enregistrée", as "une option qu'on a enregistrée" does; the
    // Italian passive si's participle agrees with its patient the same way ("salvata", A213). German
    // takes the feminine accusative pronoun "die".
    test('the antecedent genders the participle and the pronoun (it, fr, de)', () => {
      const plan = gloss('OPTION', objectGap('SAVE', { aspect: 'resultative' }));
      expect(say(plan, 'it')).toBe('che si è salvata.');
      expect(say(plan, 'fr')).toBe("qu'on a enregistrée.");
      expect(say(plan, 'de')).toBe('die man gespeichert hat.');
    });
  });

  describe('the subject gap: what the antecedent does or is', () => {
    // The clause's own object follows the head's rules for an object: bare plural, French "de" under
    // the negation, German's "kein" absorbing "nicht", Japanese's possessive existential (名前がない).
    test('with a negated object ("that does not have names")', () => {
      const relative = subjectGap('HAVE', {
        verbPhrase: { negative: true },
        directObject: np('NAME_NOUN', { definiteness: 'bare', number: 'plural' }),
      });
      expect(sayAll(gloss('OBJECT_THING', relative))).toEqual({
        en: 'that does not have names.',
        it: 'che non ha nomi.',
        fr: "qui n'a pas de noms.",
        de: 'der keine Namen hat.', // the subject gap is nominative: der
        es: 'que no tiene nombres.',
        ja: '名前がない。',
        pt: 'que não tem nomes.',
      });
    });

    // A definite object keeps its article: PROXIMAL's shape. Spanish marks a person object with "a".
    test('with a definite object ("that indicates the speaker")', () => {
      const relative = subjectGap('INDICATE', { directObject: np('SPEAKER', { definiteness: 'definite' }) });
      expect(sayAll(gloss('WORD', relative))).toEqual({
        en: 'that indicates the speaker.',
        it: 'che indica il parlante.',
        fr: 'qui indique le locuteur.',
        de: 'das den Sprecher bezeichnet.', // Wort is neuter
        es: 'que indica al hablante.',
        ja: '話し手を示す。',
        pt: 'que indica o falante.',
      });
    });

    // WILD's shape: a locative complement, rendered as it is in any clause.
    test('with a complement ("that lives in the house")', () => {
      expect(sayAll(gloss('ANIMAL', subjectGap('LIVE', { complements: inTheHouse })))).toEqual({
        en: 'that lives in the house.', // an animal is not a person: "that"
        it: 'che abita nella casa.',
        fr: 'qui habite dans la maison.',
        de: 'das im Haus wohnt.', // Tier is neuter
        es: 'que vive en la casa.',
        ja: '家に住む。',
        pt: 'que mora na casa.',
      });
    });
  });

  describe('agreement with the unspoken antecedent', () => {
    // A negated predicate adjective under three antecedents: the Romance adjective agrees with the
    // head's gender (solido / solida), and German's pronoun takes it (der / die / das). English and
    // Japanese have nothing to agree.
    test('a masculine antecedent', () => {
      expect(sayAll(gloss('OBJECT_THING', notSolid))).toEqual({
        en: 'that is not solid.',
        it: 'che non è solido.',
        fr: "qui n'est pas solide.",
        de: 'der nicht fest ist.',
        es: 'que no es sólido.',
        ja: '固体ではない。',
        pt: 'que não é sólido.',
      });
    });

    test('a feminine antecedent', () => {
      expect(sayAll(gloss('OPTION', notSolid))).toEqual({
        en: 'that is not solid.',
        it: 'che non è solida.',
        fr: "qui n'est pas solide.", // solide is epicene
        de: 'die nicht fest ist.',
        es: 'que no es sólida.',
        ja: '固体ではない。',
        pt: 'que não é sólida.',
      });
    });

    // BEING is neuter in German (das Wesen) and masculine in the Romance languages.
    test('a neuter antecedent (de "das")', () => {
      expect(sayAll(gloss('BEING', notSolid))).toEqual({
        en: 'that is not solid.',
        it: 'che non è solido.',
        fr: "qui n'est pas solide.",
        de: 'das nicht fest ist.',
        es: 'que no es sólido.',
        ja: '固体ではない。',
        pt: 'que não é sólido.',
      });
    });

    // A mass antecedent is bare, as a mass genus is; it is not spoken either way. SUBSTANCE is
    // feminine in the Romance languages and masculine in German (der Stoff).
    test('a bare mass antecedent', () => {
      expect(sayAll(gloss('SUBSTANCE', notSolid, { definiteness: 'bare' }))).toEqual({
        en: 'that is not solid.',
        it: 'che non è solida.',
        fr: "qui n'est pas solide.",
        de: 'der nicht fest ist.',
        es: 'que no es sólida.',
        ja: '固体ではない。',
        pt: 'que não é sólida.',
      });
    });

    // English relativises on personhood: "who" for a person, where an animal took "that". German's
    // pronoun takes the person noun's grammatical gender — Person is feminine, Sprecher masculine.
    test('a human antecedent (en "who", de "die" / "der")', () => {
      expect(sayAll(gloss('PERSON', subjectGap('LIVE', { complements: inTheHouse })))).toEqual({
        en: 'who lives in the house.',
        it: 'che abita nella casa.',
        fr: 'qui habite dans la maison.',
        de: 'die im Haus wohnt.',
        es: 'que vive en la casa.',
        ja: '家に住む。',
        pt: 'que mora na casa.',
      });
      expect(say(gloss('SPEAKER', subjectGap('LIVE', { complements: inTheHouse })), 'de')).toBe('der im Haus wohnt.');
      expect(say(gloss('PERSON', objectGap('KNOW', { negative: true })), 'en')).toBe('who one does not know.');
    });

    // A plural antecedent is the subject of a subject gap, so the verb agrees with it in every
    // language that conjugates for number, and German's pronoun is the plural "die".
    test('a plural antecedent, subject gap ("who live in the house")', () => {
      expect(sayAll(gloss('PERSON', subjectGap('LIVE', { complements: inTheHouse }), { number: 'plural' }))).toEqual({
        en: 'who live in the house.',
        it: 'che abitano nella casa.',
        fr: 'qui habitent dans la maison.',
        de: 'die im Haus wohnen.',
        es: 'que viven en la casa.',
        ja: '家に住む。',
        pt: 'que moram na casa.',
      });
    });

    // Gapped as an object, a plural antecedent is the passive si/se's patient in Italian, Spanish and
    // Portuguese ("si sono salvati", "se han", "se salvaram" — A213, A206), a preceding plural object
    // for the French participle ("enregistrés"), and German's plural "die".
    test('a plural antecedent, object gap (it, es, pt, fr, de)', () => {
      const plan = gloss('OBJECT_THING', objectGap('SAVE', { aspect: 'resultative' }), { number: 'plural' });
      expect(say(plan, 'en')).toBe('that one has saved.');
      expect(say(plan, 'it')).toBe('che si sono salvati.');
      expect(say(plan, 'pt')).toBe('que se salvaram.');
      expect(say(plan, 'es')).toBe('que se han guardado.');
      expect(say(plan, 'fr')).toBe("qu'on a enregistrés.");
      expect(say(plan, 'de')).toBe('die man gespeichert hat.');
    });
  });

  describe('what belongs to the head is unsaid', () => {
    // The head's determiner, adjectives and possessor would render before or after the noun; all of
    // them go with it, and only the relative is left.
    test('adjectives, a possessor and a definite article leave no trace', () => {
      const plan = gloss('OBJECT_THING', objectGap('SAVE', { aspect: 'resultative' }), {
        definiteness: 'definite', adjectives: ['BIG'], possessor: np('PERSON', { definiteness: 'definite' }),
      });
      expect(sayAll(plan)).toEqual(sayAll(gloss('OBJECT_THING', objectGap('SAVE', { aspect: 'resultative' }))));
    });

    // Only the commas around the clause itself go: a relative nested inside it keeps its own, so the
    // German reads as it would inside a headed relative.
    test('a relative nested in the clause keeps its own commas (de)', () => {
      const relative = subjectGap('HAVE', {
        directObject: np('NAME_NOUN', { definiteness: 'indefinite', relative: objectGap('KNOW') }),
      });
      expect(sayAll(gloss('OBJECT_THING', relative))).toEqual({
        en: 'that has a name that one knows.',
        it: 'che ha un nome che si conosce.',
        fr: "qui a un nom qu'on connaît.",
        de: 'der einen Namen, den man kennt, hat.',
        es: 'que tiene un nombre que se conoce.',
        ja: '知る名前がある。',
        pt: 'que tem um nome que se conhece.',
      });
    });
  });

  describe('where the flag is ignored', () => {
    // No relative to say: the phrase is the plain noun phrase it would be without the flag.
    test('a flagged phrase with no relative', () => {
      const flagged = { subject: np('OBJECT_THING', { definiteness: 'indefinite', relativeGloss: true }) };
      expect(sayAll(flagged)).toEqual(sayAll({ subject: np('OBJECT_THING', { definiteness: 'indefinite' }) }));
      expect(say(flagged, 'en')).toBe('an object.');
    });

    // Under a verb phrase the flagged phrase is an ordinary subject, head and relative both spoken.
    test('a flagged subject under a verb phrase', () => {
      const withFlag = (relativeGloss: boolean): PhrasePlan => ({
        subject: np('OBJECT_THING', { definiteness: 'definite', relative: objectGap('SAVE', { aspect: 'resultative' }), relativeGloss }),
        verbPhrase: { verb: 'BE' },
        complements: { predicative: { phrase: np('SOLID') } },
      });
      expect(sayAll(withFlag(true))).toEqual(sayAll(withFlag(false)));
      expect(say(withFlag(true), 'en')).toBe('the object that one has saved is solid.');
      expect(say(withFlag(true), 'de')).toBe('der Gegenstand, den man gespeichert hat, ist fest.');
    });

    // A coordination is not one antecedent: each conjunct renders as the headed phrase it is.
    test('flagged conjuncts of a coordination', () => {
      const conjunct = (concept: string, relativeGloss: boolean) =>
        np(concept, { definiteness: 'indefinite', relative: objectGap('SAVE'), relativeGloss });
      const plan = (relativeGloss: boolean): PhrasePlan => ({
        subject: { conjuncts: [conjunct('OBJECT_THING', relativeGloss), conjunct('OPTION', relativeGloss)], conjunction: 'and' },
      });
      expect(sayAll(plan(true))).toEqual(sayAll(plan(false)));
      expect(say(plan(true), 'en')).toBe('an object that one saves and an option that one saves.');
    });
  });
});
