import { describe, expect, test } from 'vitest';
import { TEMPORAL_RELATIONS, type Definiteness, type NounPhrase, type TemporalRelation } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

const runsAt = (value: TemporalRelation, concept = 'DAY', definiteness: Definiteness = 'this') =>
  sayAll(clause(np('CAT'), 'RUN', {
    complements: { temporal: { phrase: np(concept, { definiteness }), specifiers: [{ kind: 'temporal', value }] } },
  }));

// The *when* of a clause — the complement the engine had none of until C29 (P09 §3, E3). It carries
// a `temporal` specifier naming its relation to the time: at / ago / until / after / before /
// during. Each is a distinct adposition in every language, so all six are pinned here, and the two
// that are not adpositions at all — the postposed "ago" and the fronted impersonal verb — are
// pinned beside them.
describe('temporal', () => {
  // The default relation: no specifier means the act simply happens at that time.
  test('a complement naming no relation is the plain "at"', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: { temporal: { phrase: np('DAY', { definiteness: 'this' }) } },
    }))).toEqual(runsAt('at'));
  });

  // "at" is the one relation whose word the head noun picks, not the relation: English is ON a day
  // but AT a time and IN a week, German AN dem Tag but ZU der Zeit and IN der Woche. The lexeme
  // names it as `temporal_prep`; Italian and French name one too ("in questo giorno", "en ce jour"),
  // and Spanish, Portuguese and Japanese take their generic one, which is already right for a day.
  test('at — a day names its own preposition', () => {
    expect(runsAt('at')).toEqual({
      en: 'the cat runs on this day.',
      it: 'il gatto corre in questo giorno.',
      fr: 'le chat court en ce jour.',
      de: 'der Kater läuft an diesem Tag.',
      es: 'el gato corre en este día.',
      pt: 'o gato corre neste dia.',
      ja: '猫はこの日に走ります。',
    });
  });

  test('at — a week is a stretch one is *in*', () => {
    expect(runsAt('at', 'WEEK')).toEqual({
      en: 'the cat runs in this week.',
      it: 'il gatto corre in questa settimana.',
      fr: 'le chat court en cette semaine.',
      de: 'der Kater läuft in dieser Woche.',
      es: 'el gato corre en esta semana.',
      pt: 'o gato corre nesta semana.',
      ja: '猫はこの週に走ります。',
    });
  });

  // A noun naming none falls back on the language's generic time preposition, and the article fuses
  // with it as it does anywhere else: it a+il = al, fr à+le = au, de zu+der = zur, pt em+o = no.
  test('at — a noun naming no preposition takes the generic one, fused with the article', () => {
    expect(runsAt('at', 'TIME', 'definite')).toEqual({
      en: 'the cat runs at the time.',
      it: 'il gatto corre al tempo.',
      fr: 'le chat court au temps.',
      de: 'der Kater läuft zur Zeit.',
      es: 'el gato corre en el tiempo.',
      pt: 'o gato corre no tempo.',
      ja: '猫は時間に走ります。',
    });
  });

  // Measured back from now. Three languages postpose it — English "ago", Italian "fa", Japanese 前に
  // — and three front an impersonal verb, which takes the phrase's own article after it: "il y a un
  // instant", "hace un momento", "há um momento". German alone has an ordinary preposition for it.
  test('ago — postposed in en/it/ja, an impersonal verb in fr/es/pt, a preposition in de', () => {
    expect(runsAt('ago', 'MOMENT', 'indefinite')).toEqual({
      en: 'the cat runs a moment ago.',
      it: 'il gatto corre un momento fa.',
      fr: 'le chat court il y a un instant.',
      de: 'der Kater läuft vor einem Augenblick.',
      es: 'el gato corre hace un momento.',
      pt: 'o gato corre há um momento.',
      ja: '猫は瞬間前に走ります。',
    });
  });

  // Up to that time. The two Romance locutions end in a simple preposition and fuse through it
  // ("fino a", "jusqu'à"), German reaches its time through the "zu" the generic `at` also takes,
  // and Japanese postposes まで.
  test('until', () => {
    expect(runsAt('until')).toEqual({
      en: 'the cat runs until this day.',
      it: 'il gatto corre fino a questo giorno.',
      fr: "le chat court jusqu'à ce jour.",
      de: 'der Kater läuft bis zu diesem Tag.',
      es: 'el gato corre hasta este día.',
      pt: 'o gato corre até este dia.',
      ja: '猫はこの日まで走ります。',
    });
  });

  test('after', () => {
    expect(runsAt('after')).toEqual({
      en: 'the cat runs after this day.',
      it: 'il gatto corre dopo questo giorno.',
      fr: 'le chat court après ce jour.',
      de: 'der Kater läuft nach diesem Tag.',
      // "después de" / "depois de" end in "de", so a demonstrative contracts through it in
      // Portuguese ("deste"), where Spanish leaves it uncontracted ("de este").
      es: 'el gato corre después de este día.',
      pt: 'o gato corre depois deste dia.',
      ja: '猫はこの日の後に走ります。',
    });
  });

  // German spells `before` with the same "vor" it spells `ago` with — one preposition for the two
  // readings English splits into "ago" and "before". Japanese keeps them apart with の alone:
  // この日の前に against 瞬間前に.
  test('before — German reuses the "vor" of `ago`, Japanese adds の', () => {
    expect(runsAt('before')).toEqual({
      en: 'the cat runs before this day.',
      it: 'il gatto corre prima di questo giorno.',
      fr: 'le chat court avant ce jour.',
      de: 'der Kater läuft vor diesem Tag.',
      es: 'el gato corre antes de este día.',
      pt: 'o gato corre antes deste dia.',
      ja: '猫はこの日の前に走ります。',
    });
  });

  // "während" is the one temporal preposition that governs the GENITIVE ("dieses Tages"), where
  // every other one here takes the dative.
  test('during — German takes the genitive', () => {
    expect(runsAt('during')).toEqual({
      en: 'the cat runs during this day.',
      it: 'il gatto corre durante questo giorno.',
      fr: 'le chat court pendant ce jour.',
      de: 'der Kater läuft während dieses Tages.',
      es: 'el gato corre durante este día.',
      pt: 'o gato corre durante este dia.',
      ja: '猫はこの日の間に走ります。',
    });
  });

  // A bare plural has no genitive to show, so "während" falls back on the dative — the same guard
  // the cause's "wegen" has (`genitiveShows`). A determiner that does show it keeps the genitive.
  test('during — a bare plural falls back on the dative in German', () => {
    const during = (definiteness: Definiteness) => sayAll(clause(np('CAT'), 'RUN', {
      complements: {
        temporal: {
          phrase: np('DAY', { definiteness, number: 'plural' }),
          specifiers: [{ kind: 'temporal', value: 'during' }],
        },
      },
    }))['de'];
    expect(during('bare')).toBe('der Kater läuft während Tagen.');
    expect(during('definite')).toBe('der Kater läuft während der Tage.');
    expect(during('all')).toBe('der Kater läuft während aller Tage.');
  });

  // A coordinated time follows the rule every other adposition-bearing complement follows: a word
  // that fuses with the article cannot be factored out in front of the group, so each conjunct
  // carries its own ("vor diesem Tag und vor dieser Nacht", as "a causa del cane e a causa tua" and
  // "à cause de X et à cause de Y" already read). The two postposed relations are the exception that
  // proves it — English "ago", Italian "fa" and Japanese 前に attach to nothing and are written once,
  // after the whole group.
  test('a coordinated time repeats a fronted relation and writes a postposed one once', () => {
    const plan = clause(np('CAT'), 'RUN', {
      complements: {
        temporal: {
          phrase: { conjuncts: [np('DAY', { definiteness: 'this' }), np('NIGHT', { definiteness: 'this' })], conjunction: 'and' },
          specifiers: [{ kind: 'temporal', value: 'ago' }],
        },
      },
    });
    expect(sayAll(plan)).toEqual({
      en: 'the cat runs this day and this night ago.',
      it: 'il gatto corre questo giorno e questa notte fa.',
      fr: 'le chat court il y a ce jour et il y a cette nuit.',
      de: 'der Kater läuft vor diesem Tag und vor dieser Nacht.',
      es: 'el gato corre hace este día y hace esta noche.',
      pt: 'o gato corre há este dia e há esta noite.',
      ja: '猫はこの日とこの夜前に走ります。',
    });
  });

  // No relation renders empty, and no two render alike, in any language: the whole point of the
  // specifier is that the six readings are told apart.
  test.each(['en', 'it', 'fr', 'de', 'es', 'pt', 'ja'] as const)('every relation is distinct in %s', (language) => {
    const rendered = TEMPORAL_RELATIONS.map((relation) => runsAt(relation, 'DAY', 'this')[language]);
    expect(rendered.filter(Boolean)).toHaveLength(TEMPORAL_RELATIONS.length);
    // German is the one language with a genuine merger: `ago` and `before` are both "vor" + dative.
    const expected = language === 'de' ? TEMPORAL_RELATIONS.length - 1 : TEMPORAL_RELATIONS.length;
    expect(new Set(rendered).size).toBe(expected);
  });
});

// A265. French names a day, a week and a year's own `at` preposition — "en", the one that does not
// fuse — and writes it before whatever determiner the phrase has. "en" takes a bare noun or a
// demonstrative ("en mai", "en ce jour", "en cette semaine") and never an article: "en le jour" is
// no French. A definite time is a bare noun phrase, the way French says every definite point in
// time ("le lundi", "le jour de Noël", "la semaine suivante"), and an indefinite one likewise
// ("un jour" — "en un jour" says *within* one day).
describe('known bugs: French "en" before an article on a temporal noun (A265)', () => {
  const runsAt = (concept: string, extra: Partial<NounPhrase> = {}) =>
    sayAll(clause(np('MAN'), 'RUN', { complements: { temporal: { phrase: np(concept, { definiteness: 'definite', ...extra }) } } }));

  test('a definite day, week or year takes no preposition', () => {
    expect(runsAt('DAY').fr).toBe("l'homme court le jour.");
    expect(runsAt('WEEK').fr).toBe("l'homme court la semaine.");
    expect(runsAt('YEAR').fr).toBe("l'homme court l'année.");
    expect(runsAt('DAY', { number: 'plural' }).fr).toBe("l'homme court les jours.");
  });

  test('an indefinite day takes none either', () => {
    expect(runsAt('DAY', { definiteness: 'indefinite' }).fr).toBe("l'homme court un jour.");
  });

  test('a month, a possessed day and every quantifier stand alone too', () => {
    expect(runsAt('MONTH').fr).toBe("l'homme court le mois.");
    expect(runsAt('DAY', { definiteness: 'indefinite', number: 'plural' }).fr).toBe("l'homme court des jours.");
    expect(runsAt('DAY', { definiteness: 'all', number: 'plural' }).fr).toBe("l'homme court tous les jours.");
    expect(runsAt('DAY', { possessor: { kind: 'pronominal', person: '3', number: 'singular', gender: 'masc' } }).fr)
      .toBe("l'homme court son jour.");
    expect(runsAt('DAY', { possessor: np('CAT') }).fr).toBe("l'homme court le jour du chat.");
  });

  test('every demonstrative keeps "en"', () => {
    expect(runsAt('WEEK', { definiteness: 'that' }).fr).toBe("l'homme court en cette semaine.");
    expect(runsAt('DAY', { definiteness: 'this', number: 'plural' }).fr).toBe("l'homme court en ces jours.");
  });

  test('regression: the demonstrative keeps "en", and the other languages their preposition', () => {
    expect(runsAt('DAY', { definiteness: 'this' }).fr).toBe("l'homme court en ce jour.");
    expect(runsAt('DAY')).toMatchObject({
      en: 'the man runs on the day.', it: "l'uomo corre nel giorno.", de: 'der Mann läuft am Tag.',
      es: 'el hombre corre en el día.', pt: 'o homem corre no dia.',
    });
  });
});
