import { describe, expect, test } from 'vitest';
import { TEMPORAL_RELATIONS, type Definiteness, type NounElement, type NounPhrase, type TemporalRelation } from '@signi/shared';
import { clause, np, sayAll } from '../harness.js';

const runsAt = (value: TemporalRelation, concept = 'DAY', definiteness: Definiteness = 'this') =>
  sayAll(clause(np('CAT'), 'RUN', {
    complements: { temporal: { phrase: np(concept, { definiteness }), specifiers: [{ kind: 'temporal', value }] } },
  }));

// The *when* of a clause — the complement the engine had none of until C29 (P09 §3, E3). It carries
// a `temporal` specifier naming its relation to the time: at / ago / until / after / before /
// during / between (P09-E20) / since (P09-E27) / within (P09-E34) / for (P09-E35). Each is a
// distinct adposition in nearly every language, so all are pinned here, and the ones that are not
// adpositions at all — the postposed "ago", the fronted impersonal verb, and the German and Japanese
// bare measure of `for` — are pinned beside them.
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

  // P09-E27 D3. From that time on: Italian "da" is a simple preposition and fuses with the article
  // ("dal giorno", "dalla settimana") as `at`'s "a" does; German "seit" takes the dative, and Japanese
  // puts から straight on the time, as まで is.
  test('since — Italian fuses its "da", German takes the dative', () => {
    expect(runsAt('since')).toEqual({
      en: 'the cat runs since this day.',
      it: 'il gatto corre da questo giorno.',
      fr: 'le chat court depuis ce jour.',
      de: 'der Kater läuft seit diesem Tag.',
      es: 'el gato corre desde este día.',
      pt: 'o gato corre desde este dia.',
      ja: '猫はこの日から走ります。',
    });
    expect(runsAt('since', 'WEEK', 'definite')).toEqual({
      en: 'the cat runs since the week.',
      it: 'il gatto corre dalla settimana.',
      fr: 'le chat court depuis la semaine.',
      de: 'der Kater läuft seit der Woche.',
      es: 'el gato corre desde la semana.',
      pt: 'o gato corre desde a semana.',
      ja: '猫は週から走ります。',
    });
    expect(runsAt('since', 'MOMENT', 'indefinite')).toMatchObject({
      it: 'il gatto corre da un momento.', de: 'der Kater läuft seit einem Augenblick.', fr: 'le chat court depuis un instant.',
    });
  });

  // It distributes over a coordinated time, as every relation but `between` does.
  test('since — repeated on each conjunct', () => {
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: {
        temporal: { phrase: { conjuncts: [np('DAY'), np('NIGHT')], conjunction: 'and' }, specifiers: [{ kind: 'temporal', value: 'since' }] },
      },
    }))).toEqual({
      en: 'the cat runs since the day and the night.',
      it: 'il gatto corre dal giorno e dalla notte.',
      fr: 'le chat court depuis le jour et depuis la nuit.',
      de: 'der Kater läuft seit dem Tag und seit der Nacht.',
      es: 'el gato corre desde el día y desde la noche.',
      pt: 'o gato corre desde o dia e desde a noite.',
      ja: '猫は日と夜から走ります。',
    });
  });

  // P09-E34. A deadline: the act closes before the limit. German "innerhalb" governs the genitive
  // as "während" does; Spanish and Portuguese "dentro de" fuse through their "de" ("dentro del día",
  // "dentro do dia"); French says the deadline "d'ici" (D2); Japanese puts 以内に straight on the
  // measure, as `ago`'s 前に is — one hour is 一時間, the numeral with HOUR's counter, since an
  // article says nothing in Japanese.
  describe('within', () => {
    const runsWithin = (phrase: NounPhrase) => sayAll(clause(np('CAT'), 'RUN', {
      complements: { temporal: { phrase, specifiers: [{ kind: 'temporal', value: 'within' }] } },
    }));

    test('within an hour', () => {
      expect(runsAt('within', 'HOUR', 'indefinite')).toEqual({
        en: 'the cat runs within an hour.',
        it: "il gatto corre entro un'ora.",
        fr: "le chat court d'ici une heure.",
        de: 'der Kater läuft innerhalb einer Stunde.',
        es: 'el gato corre dentro de una hora.',
        pt: 'o gato corre dentro de uma hora.',
        ja: '猫は時間以内に走ります。',
      });
      expect(runsWithin(np('HOUR', { definiteness: 'bare', numeral: 1 })).ja).toBe('猫は一時間以内に走ります。');
    });

    test('within this day, and the day', () => {
      expect(runsAt('within')).toEqual({
        en: 'the cat runs within this day.',
        it: 'il gatto corre entro questo giorno.',
        fr: "le chat court d'ici ce jour.",
        de: 'der Kater läuft innerhalb dieses Tages.',
        es: 'el gato corre dentro de este día.',
        pt: 'o gato corre dentro deste dia.',
        ja: '猫はこの日以内に走ります。',
      });
      expect(runsAt('within', 'DAY', 'definite')).toEqual({
        en: 'the cat runs within the day.',
        it: 'il gatto corre entro il giorno.',
        fr: "le chat court d'ici le jour.",
        de: 'der Kater läuft innerhalb des Tages.',
        es: 'el gato corre dentro del día.',
        pt: 'o gato corre dentro do dia.',
        ja: '猫は日以内に走ります。',
      });
      expect(runsAt('within', 'DAY', 'indefinite')).toMatchObject({
        de: 'der Kater läuft innerhalb eines Tages.', es: 'el gato corre dentro de un día.', pt: 'o gato corre dentro de um dia.',
      });
    });

    // The genitive falls back on the dative where a bare plural cannot show it, as during's does.
    test('a bare plural falls back on the dative in German', () => {
      expect(runsWithin(np('DAY', { definiteness: 'bare', number: 'plural' })).de).toBe('der Kater läuft innerhalb Tagen.');
      expect(runsWithin(np('DAY', { definiteness: 'definite', number: 'plural' })).de).toBe('der Kater läuft innerhalb der Tage.');
    });

    // The other two columns of the task's table: a point and a stretch are not a deadline.
    test('is told apart from at and during', () => {
      const hour = (value: TemporalRelation) => runsAt(value, 'HOUR', 'indefinite');
      expect(hour('at')).toMatchObject({ it: "il gatto corre a un'ora.", fr: 'le chat court à une heure.', de: 'der Kater läuft zu einer Stunde.', ja: '猫は時間に走ります。' });
      expect(hour('during')).toMatchObject({ it: "il gatto corre durante un'ora.", de: 'der Kater läuft während einer Stunde.', ja: '猫は時間の間に走ります。' });
    });
  });

  // P09-E35. How long the act lasts, a measure with no point or boundary. French and Spanish say it
  // with their `during` word ("pendant", "durante"); English, Italian and Portuguese have a word of
  // its own ("for", "per", "por", which fuses with the definite: "pelas duas horas"). German and
  // Japanese have no adposition: German's measure is a bare accusative ("eine Stunde", "zwei
  // Stunden"), Japanese's a bare measure with no particle (一時間, HOUR's counter on the numeral).
  describe('for', () => {
    const runsFor = (phrase: NounElement) => sayAll(clause(np('CAT'), 'RUN', {
      complements: { temporal: { phrase, specifiers: [{ kind: 'temporal', value: 'for' }] } },
    }));

    test('for an hour', () => {
      expect(runsFor(np('HOUR', { definiteness: 'indefinite' }))).toEqual({
        en: 'the cat runs for an hour.',
        it: "il gatto corre per un'ora.",
        fr: 'le chat court pendant une heure.',
        de: 'der Kater läuft eine Stunde.',
        es: 'el gato corre durante una hora.',
        pt: 'o gato corre por uma hora.',
        ja: '猫は時間走ります。',
      });
    });

    // With a numeral (after A291 and A292): one hour is 一時間 in Japanese, and German's feminine
    // "eine" is the accusative already.
    test('for one hour, and two', () => {
      expect(runsFor(np('HOUR', { definiteness: 'bare', numeral: 1 }))).toMatchObject({
        en: 'the cat runs for one hour.',
        fr: 'le chat court pendant une heure.',
        de: 'der Kater läuft eine Stunde.',
        es: 'el gato corre durante una hora.',
        pt: 'o gato corre por uma hora.',
        ja: '猫は一時間走ります。',
      });
      expect(runsFor(np('HOUR', { definiteness: 'bare', numeral: 2 }))).toEqual({
        en: 'the cat runs for two hours.',
        it: 'il gatto corre per due ore.',
        fr: 'le chat court pendant deux heures.',
        de: 'der Kater läuft zwei Stunden.',
        es: 'el gato corre durante dos horas.',
        pt: 'o gato corre por duas horas.',
        ja: '猫は二時間走ります。',
      });
      expect(runsFor(np('HOUR', { numeral: 2 }))).toMatchObject({
        de: 'der Kater läuft die zwei Stunden.', pt: 'o gato corre pelas duas horas.', it: 'il gatto corre per le due ore.',
      });
    });

    test('for a time, and the time', () => {
      expect(runsFor(np('TIME', { definiteness: 'indefinite' }))).toEqual({
        en: 'the cat runs for a time.',
        it: 'il gatto corre per un tempo.',
        fr: 'le chat court pendant un temps.',
        de: 'der Kater läuft eine Zeit.',
        es: 'el gato corre durante un tiempo.',
        pt: 'o gato corre por um tempo.',
        ja: '猫は時間走ります。',
      });
      expect(runsFor(np('TIME'))).toMatchObject({
        de: 'der Kater läuft die Zeit.', pt: 'o gato corre pelo tempo.', it: 'il gatto corre per il tempo.',
      });
    });

    // The accusative shows on a masculine: "diesen Tag", where the dative relations say "diesem".
    test('German declines the measure in the accusative', () => {
      expect(runsFor(np('DAY', { definiteness: 'this' })).de).toBe('der Kater läuft diesen Tag.');
      expect(runsFor(np('MOMENT', { definiteness: 'indefinite' })).de).toBe('der Kater läuft einen Augenblick.');
    });

    // `during` places the act inside the stretch; `for` measures it. Three languages tell the two
    // apart by the word, and German and Japanese by having none.
    test('is told apart from during', () => {
      const during = runsAt('during', 'HOUR', 'indefinite');
      expect(during).toMatchObject({
        en: 'the cat runs during an hour.', it: "il gatto corre durante un'ora.", de: 'der Kater läuft während einer Stunde.',
        pt: 'o gato corre durante uma hora.', ja: '猫は時間の間に走ります。',
      });
      const measure = runsFor(np('HOUR', { definiteness: 'indefinite' }));
      for (const language of ['en', 'it', 'de', 'pt', 'ja'] as const) expect(measure[language]).not.toBe(during[language]);
      expect(measure.fr).toBe(during.fr);
      expect(measure.es).toBe(during.es);
    });

    // The measure is a phrase like any other: a verb with an object keeps it, and a coordinated
    // measure repeats a fronted word as the other relations do.
    test('beside an object, and over a group', () => {
      expect(sayAll(clause(np('CAT'), 'EAT', {
        directObject: np('FOOD'),
        complements: { temporal: { phrase: np('DAY', { definiteness: 'bare', numeral: 2 }), specifiers: [{ kind: 'temporal', value: 'for' }] } },
      }))).toMatchObject({
        en: 'the cat eats the food for two days.', de: 'der Kater frisst das Essen zwei Tage.', ja: '猫は二日食べ物を食べます。',
      });
      expect(runsFor({ conjuncts: [np('HOUR', { definiteness: 'bare', numeral: 2 }), np('MOMENT', { definiteness: 'indefinite' })], conjunction: 'and' }))
        .toMatchObject({
          it: 'il gatto corre per due ore e per un momento.', de: 'der Kater läuft zwei Stunden und einen Augenblick.',
          ja: '猫は二時間と瞬間走ります。',
        });
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
  // specifier is that the seven readings are told apart.
  test.each(['en', 'it', 'fr', 'de', 'es', 'pt', 'ja'] as const)('every relation is distinct in %s', (language) => {
    const rendered = TEMPORAL_RELATIONS.map((relation) => runsAt(relation, 'DAY', 'this')[language]);
    expect(rendered.filter(Boolean)).toHaveLength(TEMPORAL_RELATIONS.length);
    // Four languages have a genuine merger on a single time. German: `ago` and `before` are both
    // "vor" + dative. Japanese: `during` and `between` are both 〜の間に (P09-E20 D3), which on a
    // group is the right Japanese for "between" — see the `between` tests below. French and Spanish
    // say the duration `for` with their `during` word, "pendant", "durante" (P09-E35).
    const merged = { de: 1, ja: 1, fr: 1, es: 1 } as Partial<Record<typeof language, number>>;
    const expected = TEMPORAL_RELATIONS.length - (merged[language] ?? 0);
    expect(new Set(rendered).size).toBe(expected);
  });

  // P09-E20. The span with two ends: the one temporal relation that scopes over a coordinated time
  // instead of distributing across it, exactly as the spatial `between` scopes over a landmark
  // (`GROUP_SCOPED_TEMPORAL_RELATIONS`). Each fronting language says its `between` word once, and
  // each conjunct keeps its own article and case — German's dative "zwischen diesem Tag und jenem
  // Tag". Japanese needs no lift: its 〜の間に already follows the whole group, and takes the time's
  // に where the locative `between` takes で.
  describe('between', () => {
    const runsBetween = (conjuncts: NounPhrase[]) => sayAll(clause(np('CAT'), 'RUN', {
      complements: {
        temporal: { phrase: { conjuncts, conjunction: 'and' }, specifiers: [{ kind: 'temporal', value: 'between' }] },
      },
    }));
    // French tells "ce jour-ci" from "ce jour-là" only with C40's `contrastive` on both (D4).
    const thisDayAndThatDay = [
      np('DAY', { definiteness: 'this', contrastive: true }),
      np('DAY', { definiteness: 'that', contrastive: true }),
    ];

    test('between this day and that day — said once over the group', () => {
      expect(runsBetween(thisDayAndThatDay)).toEqual({
        en: 'the cat runs between this day and that day.',
        it: 'il gatto corre tra questo giorno e quel giorno.',
        fr: 'le chat court entre ce jour-ci et ce jour-là.',
        de: 'der Kater läuft zwischen diesem Tag und jenem Tag.',
        es: 'el gato corre entre este día y ese día.',
        pt: 'o gato corre entre este dia e esse dia.',
        ja: '猫はこの日とその日の間に走ります。',
      });
    });

    test('between the day and the night — each conjunct keeps its own article and gender', () => {
      expect(runsBetween([np('DAY'), np('NIGHT')])).toEqual({
        en: 'the cat runs between the day and the night.',
        it: 'il gatto corre tra il giorno e la notte.',
        fr: 'le chat court entre le jour et la nuit.',
        de: 'der Kater läuft zwischen dem Tag und der Nacht.',
        es: 'el gato corre entre el día y la noche.',
        pt: 'o gato corre entre o dia e a noite.',
        ja: '猫は日と夜の間に走ります。',
      });
    });

    // Without `contrastive` French has no way to tell the two demonstratives apart; that is the
    // plan's choice, not the relation's.
    test('French without contrastive writes the pair alike', () => {
      expect(runsBetween([np('DAY', { definiteness: 'this' }), np('DAY', { definiteness: 'that' })]).fr)
        .toBe('le chat court entre ce jour et ce jour.');
    });

    // A single time is odd but renders, as a single landmark does under the spatial `between` (D4).
    test('a single time still renders', () => {
      expect(runsAt('between')).toEqual({
        en: 'the cat runs between this day.',
        it: 'il gatto corre tra questo giorno.',
        fr: 'le chat court entre ce jour.',
        de: 'der Kater läuft zwischen diesem Tag.',
        es: 'el gato corre entre este día.',
        pt: 'o gato corre entre este dia.',
        ja: '猫はこの日の間に走ります。',
      });
    });

    // `during` over the same group still distributes — the group scope is `between`'s alone. In
    // Japanese the two collide on a group too (D3, recorded as a follow-up).
    test('during over a group still distributes', () => {
      const plan = clause(np('CAT'), 'RUN', {
        complements: {
          temporal: { phrase: { conjuncts: [np('DAY'), np('NIGHT')], conjunction: 'and' }, specifiers: [{ kind: 'temporal', value: 'during' }] },
        },
      });
      expect(sayAll(plan)).toMatchObject({
        it: 'il gatto corre durante il giorno e durante la notte.',
        de: 'der Kater läuft während des Tages und während der Nacht.',
        ja: '猫は日と夜の間に走ります。',
      });
    });

    // The span lives in the temporal slot, so a plan can hold a place and a span together, each
    // with its own adposition.
    test('a place and a span in the same plan are independent', () => {
      const plan = clause(np('CAT'), 'RUN', {
        complements: {
          locative: { phrase: np('HOUSE') },
          temporal: { phrase: { conjuncts: thisDayAndThatDay, conjunction: 'and' }, specifiers: [{ kind: 'temporal', value: 'between' }] },
        },
      });
      expect(sayAll(plan)).toEqual({
        en: 'the cat runs in the house between this day and that day.',
        it: 'il gatto corre nella casa tra questo giorno e quel giorno.',
        fr: 'le chat court dans la maison entre ce jour-ci et ce jour-là.',
        de: 'der Kater läuft im Haus zwischen diesem Tag und jenem Tag.',
        es: 'el gato corre en la casa entre este día y ese día.',
        pt: 'o gato corre na casa entre este dia e esse dia.',
        ja: '猫は家でこの日とその日の間に走ります。',
      });
    });

    const dayAndNight = { phrase: { conjuncts: [np('DAY'), np('NIGHT')], conjunction: 'and' as const }, specifiers: [{ kind: 'temporal' as const, value: 'between' as const }] };

    // Each conjunct takes its own plural article, and a bare plural its own zero one — French its
    // partitive "des", which is the bare plural's article there.
    test('plural conjuncts keep their own articles, definite or bare', () => {
      expect(runsBetween([np('DAY', { number: 'plural' }), np('NIGHT', { number: 'plural' })])).toEqual({
        en: 'the cat runs between the days and the nights.',
        it: 'il gatto corre tra i giorni e le notti.',
        fr: 'le chat court entre les jours et les nuits.',
        de: 'der Kater läuft zwischen den Tagen und den Nächten.',
        es: 'el gato corre entre los días y las noches.',
        pt: 'o gato corre entre os dias e as noites.',
        ja: '猫は日と夜の間に走ります。',
      });
      expect(runsBetween([
        np('DAY', { number: 'plural', definiteness: 'bare' }),
        np('NIGHT', { number: 'plural', definiteness: 'bare' }),
      ])).toEqual({
        en: 'the cat runs between days and nights.',
        it: 'il gatto corre tra giorni e notti.',
        fr: 'le chat court entre des jours et des nuits.',
        de: 'der Kater läuft zwischen Tagen und Nächten.',
        es: 'el gato corre entre días y noches.',
        pt: 'o gato corre entre dias e noites.',
        ja: '猫は日と夜の間に走ります。',
      });
    });

    // The article elides against its own conjunct, not the group's first word.
    test('an article elides against its own conjunct', () => {
      expect(runsBetween([np('YEAR'), np('WEEK')])).toEqual({
        en: 'the cat runs between the year and the week.',
        it: "il gatto corre tra l'anno e la settimana.",
        fr: "le chat court entre l'année et la semaine.",
        de: 'der Kater läuft zwischen dem Jahr und der Woche.',
        es: 'el gato corre entre el año y la semana.',
        pt: 'o gato corre entre o ano e a semana.',
        ja: '猫は年と週の間に走ります。',
      });
    });

    // German declines each demonstrative for its own gender, feminine then neuter.
    test('demonstratives agree with their own conjunct', () => {
      expect(runsBetween([
        np('WEEK', { definiteness: 'this', contrastive: true }),
        np('YEAR', { definiteness: 'that', contrastive: true }),
      ])).toEqual({
        en: 'the cat runs between this week and that year.',
        it: "il gatto corre tra questa settimana e quell'anno.",
        fr: 'le chat court entre cette semaine-ci et cette année-là.',
        de: 'der Kater läuft zwischen dieser Woche und jenem Jahr.',
        es: 'el gato corre entre esta semana y ese año.',
        pt: 'o gato corre entre esta semana e esse ano.',
        ja: '猫はこの週とその年の間に走ります。',
      });
    });

    test('indefinite conjuncts', () => {
      expect(runsBetween([np('DAY', { definiteness: 'indefinite' }), np('NIGHT', { definiteness: 'indefinite' })])).toEqual({
        en: 'the cat runs between a day and a night.',
        it: 'il gatto corre tra un giorno e una notte.',
        fr: 'le chat court entre un jour et une nuit.',
        de: 'der Kater läuft zwischen einem Tag und einer Nacht.',
        es: 'el gato corre entre un día y una noche.',
        pt: 'o gato corre entre um dia e uma noite.',
        ja: '猫は日と夜の間に走ります。',
      });
    });

    // The adjective declines weak after German's dative article, and follows the noun in Spanish
    // and Portuguese.
    test('an adjective on one conjunct', () => {
      expect(runsBetween([np('DAY', { adjectives: ['OLD'] }), np('NIGHT')])).toEqual({
        en: 'the cat runs between the old day and the night.',
        it: 'il gatto corre tra il vecchio giorno e la notte.',
        fr: 'le chat court entre le vieux jour et la nuit.',
        de: 'der Kater läuft zwischen dem alten Tag und der Nacht.',
        es: 'el gato corre entre el día viejo y la noche.',
        pt: 'o gato corre entre o dia velho e a noite.',
        ja: '猫は古い日と夜の間に走ります。',
      });
    });

    test('three conjuncts: the preposition once, the list comma-joined', () => {
      expect(runsBetween([np('DAY'), np('NIGHT'), np('WEEK')])).toEqual({
        en: 'the cat runs between the day, the night and the week.',
        it: 'il gatto corre tra il giorno, la notte e la settimana.',
        fr: 'le chat court entre le jour, la nuit et la semaine.',
        de: 'der Kater läuft zwischen dem Tag, der Nacht und der Woche.',
        es: 'el gato corre entre el día, la noche y la semana.',
        pt: 'o gato corre entre o dia, a noite e a semana.',
        ja: '猫は日と夜と週の間に走ります。',
      });
    });

    test('negated', () => {
      expect(sayAll(clause(np('CAT'), 'RUN', { verbPhrase: { negative: true }, complements: { temporal: dayAndNight } }))).toEqual({
        en: 'the cat does not run between the day and the night.',
        it: 'il gatto non corre tra il giorno e la notte.',
        fr: 'le chat ne court pas entre le jour et la nuit.',
        de: 'der Kater läuft nicht zwischen dem Tag und der Nacht.',
        es: 'el gato no corre entre el día y la noche.',
        pt: 'o gato não corre entre o dia e a noite.',
        ja: '猫は日と夜の間に走りません。',
      });
    });

    // The span follows the object, and in Japanese precedes it, as a time does.
    test('beside a direct object', () => {
      expect(sayAll(clause(np('CAT'), 'EAT', { directObject: np('BOOK'), complements: { temporal: dayAndNight } }))).toEqual({
        en: 'the cat eats the book between the day and the night.',
        it: 'il gatto mangia il libro tra il giorno e la notte.',
        fr: 'le chat mange le livre entre le jour et la nuit.',
        de: 'der Kater frisst das Buch zwischen dem Tag und der Nacht.',
        es: 'el gato come el libro entre el día y la noche.',
        pt: 'o gato come o livro entre o dia e a noite.',
        ja: '猫は日と夜の間に本を食べます。',
      });
    });

    // German's verb-final relative puts the whole span before the verb, not only its first conjunct.
    test('inside a relative clause', () => {
      expect(sayAll(clause(np('MAN'), 'SEE', {
        directObject: np('CAT', { relative: { verbPhrase: { verb: 'RUN' }, complements: { temporal: dayAndNight } } }),
      }))).toEqual({
        en: 'the man sees the cat that runs between the day and the night.',
        it: "l'uomo vede il gatto che corre tra il giorno e la notte.",
        fr: "l'homme voit le chat qui court entre le jour et la nuit.",
        de: 'der Mann sieht den Kater, der zwischen dem Tag und der Nacht läuft.',
        es: 'el hombre ve el gato que corre entre el día y la noche.',
        pt: 'o homem vê o gato que corre entre o dia e a noite.',
        ja: '男は日と夜の間に走る猫を見ます。',
      });
    });
  });
});

// A337. "heure" opens on an h muet, so French elides the article before it as before a vowel:
// "l'heure". Unlike a vowel, an h says nothing about its sound, so the lexeme must say so
// (`elides: '1'`, as "homme" and "histoire" do); HOUR does not, and comes out "la heure".
describe('known bugs: French HOUR does not elide (A337)', () => {
  const during = (concept: string) => sayAll(clause(np('CAT'), 'RUN', {
    complements: { temporal: { phrase: np(concept), specifiers: [{ kind: 'temporal', value: 'during' }] } },
  }));

  test('the hour as a subject', () => {
    expect(sayAll(clause(np('HOUR'), 'RUN')).fr).toBe("l'heure court.");
  });

  test('the hour as a time', () => {
    expect(during('HOUR').fr).toBe("le chat court pendant l'heure.");
    expect(sayAll(clause(np('CAT'), 'RUN', {
      complements: {
        temporal: { phrase: { conjuncts: [np('DAY'), np('HOUR')], conjunction: 'and' }, specifiers: [{ kind: 'temporal', value: 'between' }] },
      },
    })).fr).toBe("le chat court entre le jour et l'heure.");
  });

  test('regression: a vowel-initial time elides, and HOUR is right in the other languages', () => {
    expect(sayAll(clause(np('YEAR'), 'RUN')).fr).toBe("l'année court.");
    expect(during('YEAR').fr).toBe("le chat court pendant l'année.");
    expect(sayAll(clause(np('HOUR', { definiteness: 'this' }), 'RUN')).fr).toBe('cette heure court.');
    expect(during('HOUR')).toMatchObject({
      en: 'the cat runs during the hour.',
      it: "il gatto corre durante l'ora.",
      de: 'der Kater läuft während der Stunde.',
      es: 'el gato corre durante la hora.',
      pt: 'o gato corre durante a hora.',
      ja: '猫は時間の間に走ります。',
    });
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

// A322. A Japanese measure noun whose counter is the noun itself (HOUR 時間, DAY 日: `counter_is_head`)
// says "one" with the numeral (一時間, 一日), and an article says nothing in Japanese. So the
// indefinite "within an hour" / "for an hour" is 一時間以内に / 一時間走ります, as `numeral: 1` already
// renders. The indefinite drops the count instead and leaves the bare noun: 時間以内に, 時間走ります,
// 日以内に, 日走ります, which read "within time" / "runs time". Two P09-E34/E35 tests above pin that
// output ('within an hour', 'for an hour') and move with the fix.
describe('known bugs: a Japanese indefinite measure noun drops its count (A322)', () => {
  test.fails('within an hour', () => {
    expect(runsAt('within', 'HOUR', 'indefinite').ja).toBe('猫は一時間以内に走ります。');
  });

  test.fails('for an hour', () => {
    expect(runsAt('for', 'HOUR', 'indefinite').ja).toBe('猫は一時間走ります。');
  });

  test.fails('within a day', () => {
    expect(runsAt('within', 'DAY', 'indefinite').ja).toBe('猫は一日以内に走ります。');
  });

  test.fails('for a day', () => {
    expect(runsAt('for', 'DAY', 'indefinite').ja).toBe('猫は一日走ります。');
  });

  test('regression: the numeral one, and the six languages that say the article', () => {
    const withOne = (value: TemporalRelation, concept: string) => sayAll(clause(np('CAT'), 'RUN', {
      complements: { temporal: { phrase: np(concept, { definiteness: 'bare', numeral: 1 }), specifiers: [{ kind: 'temporal', value }] } },
    })).ja;
    expect(withOne('within', 'HOUR')).toBe('猫は一時間以内に走ります。');
    expect(withOne('for', 'HOUR')).toBe('猫は一時間走ります。');
    expect(withOne('within', 'DAY')).toBe('猫は一日以内に走ります。');
    expect(runsAt('for', 'HOUR', 'indefinite')).toMatchObject({
      en: 'the cat runs for an hour.', it: "il gatto corre per un'ora.", fr: 'le chat court pendant une heure.',
      de: 'der Kater läuft eine Stunde.', es: 'el gato corre durante una hora.', pt: 'o gato corre por uma hora.',
    });
  });
});
