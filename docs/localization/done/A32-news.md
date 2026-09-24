# A32. NEWS — facts that one has told recently

_(filed on 2026-09-24 for the concepts [P09-E24–E43](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
seeded with no `definition`. NEWS was seeded by
[P09-E41](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E41-pluralia-tantum.md) with the
plural-only construct, and its Done item 5 left it on the literal ("reports of recent events")
because INFORMATION, the word a gloss was expected to stand on, is not seeded
([B81](B81-ideas-reasons-and-information.md)). The gloss does not need it: FACT, TELL
and RECENTLY are all seeded. No new word, no new construct. It was filed with PROBABILITY, the other
root noun of the batch, and split from it here: PROBABILITY is a dimension root on the literal by
design, [C42](C42-probability.md).)_

## Plan

Inline on the NEWS block in [concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts).
There is no helper for a bare plural head over an object-gap clause with an aspect and an adverb,
so the plan is written out (`patientGloss` takes neither the plural nor the verb's parts):

| concept | plan | gloss (en) |
|---|---|---|
| NEWS | FACT, `definiteness: 'bare'`, `number: 'plural'`, `relative: { headRole: 'directObject', subject: GENERIC_PERSON, verbPhrase: { verb: 'TELL', aspect: 'resultative', modifier: 'RECENTLY' } }` | facts that one has told recently |

```ts
definition: {
  subject: {
    concept: 'FACT', definiteness: 'bare', number: 'plural',
    relative: {
      headRole: 'directObject',
      subject: { concept: 'GENERIC_PERSON' },
      verbPhrase: { verb: 'TELL', aspect: 'resultative', modifier: 'RECENTLY' },
    },
  },
},
```

## Vocabulary

All seeded: FACT (it *fatto*, fr *fait*, de *Tatsache*, es *hecho*, ja 事実, pt *fato*), TELL
([B60](../done/B60-saying-and-thinking-verbs.md); "to say facts to a person", *raccontare, raconter,
erzählen, contar*, 伝える, *contar*), the adverb RECENTLY (*di recente, récemment, kürzlich,
recientemente*, 最近, *recentemente*, which NEW's shipped gloss already uses) and the generic subject.

## Probe renders (2026-09-24, engine source at 2c4cee46, lexicon seeded in memory)

Every row was checked against all 497 shipped definitions in all seven languages; none collides.

| candidate | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| **facts that one has told recently** (proposed) | facts that one has told recently | fatti che si sono raccontati di recente | faits qu'on a racontés récemment | Tatsachen, die man kürzlich erzählt hat | hechos que se han contado recientemente | 最近伝えた事実 | fatos que se contaram recentemente |
| new facts that one tells | new facts that one tells | nuovi fatti che si raccontano | nouveaux faits qu'on raconte | neue Tatsachen, die man erzählt | nuevos hechos que se cuentan | 伝える新しい事実 | novos fatos que se contam |
| new facts | new facts | nuovi fatti | nouveaux faits | neue Tatsachen | nuevos hechos | 新しい事実 | novos fatos |
| facts that one tells | facts that one tells | fatti che si raccontano | faits qu'on raconte | Tatsachen, die man erzählt | hechos que se cuentan | 伝える事実 | fatos que se contam |
| recent facts | recent facts | fatti recenti | faits récents | zuletzt verwendete Tatsachen | hechos recientes | 最近使用された事実 | fatos recentes |
| new facts that one learns | new facts that one learns | nuovi fatti che si imparano | nouveaux faits qu'on apprend | neue Tatsachen, die man lernt | nuevos hechos que se aprenden | 学ぶ新しい事実 | novos fatos que se aprendem |
| new information (INFORMATION *not seeded*, B81's forms) | new information | nuova informazione | nouvelle information | neue Information | nueva información | 新しい情報 | nova informação |

Readings to judge on authoring:

1. **Both halves are needed.** "Facts that one tells" is any report, old or new, and "new facts"
   is any discovery, a scientific finding as much as the news. The proposed row says the report
   and its recency, which is the seed's "reports of recent events" without EVENT (not seeded) or
   RECENT (reading 5).
2. **It does not say the word back.** No rendering contains its own word (*news, notizie,
   nouvelles, Nachrichten, noticias*, ニュース, *notícias*). The runner-up "new facts that one tells"
   does not either, but its English *new* and French *nouveaux* share a root with *news* and
   *nouvelles*; the proposed row avoids the echo, which is why it is preferred. Either may ship.
3. **The plural head suits the word.** NEWS is plural-only in five languages (E41), and the gloss's
   bare plural *fatti, faits, Tatsachen, hechos, fatos* matches it; English *facts* beside the mass
   *news* is the ordinary dictionary plural.
4. **TELL narrates**, and German *erzählen* of facts is a little literary (*berichten* is the news
   word); 伝える in Japanese is exactly "report". TELL is the verb the corpus has, and its own gloss is
   "to say facts to a person", so the two agree. Portuguese writes the simple past for the
   resultative (*se contaram*), as it does in every shipped resultative gloss.
5. **RECENT is the UI sense** ("recently used", *zuletzt verwendet*, 最近使用された), which is why the
   seed's "recent" cannot be said with it. **LEARN** reads *lernen* and 学ぶ, study, not find out.
   **INFORMATION** would give "new information", a B route through B81; A32 does not need it.

## Mutual definitions

NEWS stands on FACT (no definition), TELL (on SAY, FACT and PERSON) and RECENTLY (no definition). None of them
names NEWS, so no circle. The runner-up adds NEW (on MAKE and RECENTLY), which does not either.

## Not solved

Nothing: NEWS is the ticket's one concept.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored
(NEWS in English and German, *Tatsachen, die man kürzlich erzählt hat*), and a unit pin beside NEWS's
paradigm in [pluralia-tantum.test.ts](../../../packages/engine/test/pluralia-tantum.test.ts).
[sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts) must pass.

## Done

2026-09-24. Shipped the proposed row, **facts that one has told recently**, written out inline on
the NEWS block in [concepts/nouns.ts](../../../packages/backend/src/concepts/nouns.ts) exactly as the
Plan gives it (FACT bare plural, object-gap relative, generic subject, TELL resultative + RECENTLY).
Re-probed against the current engine: every language matches the probe table.

| en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|
| facts that one has told recently | fatti che si sono raccontati di recente | faits qu'on a racontés récemment | Tatsachen, die man kürzlich erzählt hat | hechos que se han contado recientemente | 最近伝えた事実 | fatos que se contaram recentemente |

- The backend boots clean with it (`buildConceptDefinitions`), and `/api/concepts` serves all seven.
- Unit pin: "NEWS's definition" in
  [pluralia-tantum.test.ts](../../../packages/engine/test/pluralia-tantum.test.ts).
- e2e: "a bare plural head over an object gap (localize-seed A32: NEWS)" in
  [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts), English and German.
- [sweep-definitions.test.ts](../../../packages/engine/test/sweep-definitions.test.ts) passes (no
  collision). No engine change.
