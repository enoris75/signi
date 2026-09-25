# C43. TELL_ORDER and BE_FARING — two lexical senses no picker offers

**Kind:** **deliberately left on the English literal**, the verdict
[C28](../done/C28-verb-roots-without-a-gloss.md) gave the two senses before them, EAT_ANIMAL and
KNOW_ACQUAINTED. TELL_ORDER and BE_FARING are `senseOf` concepts: the translator selects each in
place of the verb the user picked (TELL with an infinitive, `infinitive_sense`; BE under a predicate
that names a `copula`, `lexicalCopula`), so no picker lists them and **no tooltip can show a gloss
for them** (see [Where the tooltip shows](#where-the-tooltip-shows)). Every lead was probed anyway,
as C28 probed EAT_ANIMAL's and KNOW_ACQUAINTED's, and each fails on its own terms.

_(filed on 2026-09-24 for the concepts [P09-E24–E43](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
seeded with no `definition`. TELL_ORDER came with
[P09-E43](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E43-allow-to.md) (Done item 4),
BE_FARING with [P09-E31](../../features/Z-Done/P09-core-vocabulary/Z-done/P09-E31-state-predicate-okay.md)
(Done item 1); neither Done section mentions a gloss.)_

## The concepts

| concept | sense of | words | description | verdict |
|---|---|---|---|---|
| TELL_ORDER | TELL | tell, dire (di), dire (de), sagen, mandar, 言う (ように), dizer (para) | "to instruct someone to do something" | **literal by design** |
| BE_FARING | BE | fare, stare, aller, gehen, estar, 過ごす, estar | "to get on; to be in a state of well-being" | **literal by design** |

## Where the tooltip shows

**Nowhere, for either.** `/api/concepts` selects `WHERE … sense_of IS NULL`
([index.ts:166–180](../../../packages/backend/src/index.ts#L166)), with and without a `role`, so a
sense is never sent to the client and no picker, console completion or word map can show its
definition; [index.test.ts](../../../packages/backend/src/index.test.ts) pins that
("leaves a lexical sense out, whatever the role asked for"). `buildConceptDefinitions` would still
render a sense's plan at boot, since it walks every concept, and would then serve it to nobody. EAT_ANIMAL
and KNOW_ACQUAINTED are in the same position; C28 ruled them on their leads without saying so, and
this file records it for all four.

## Probe renders (2026-09-24, engine source at 2c4cee46, lexicon seeded in memory)

Every row was checked against all 497 shipped definitions in all seven languages; none collides.
The * row uses ORDER_VERB, which is not seeded (forms below).

### TELL_ORDER

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| TELL + object-controlled ACT (the sense's own frame) | to tell a person to act | dire a una persona di agire | dire à une personne d'agir | einer Person sagen zu handeln | mandar a una persona actuar | 人に行動するように言う | dizer a uma pessoa para agir |
| SAY + recipient + infinitive ACT | to say to a person to act | dire a una persona agire | dire à une personne agir | einer Person sagen zu handeln | decir a una persona actuar | 行動することを人に言う | dizer a uma pessoa agir |
| GIVE an ORDER + recipient | to give an order to a person | dare un ordine a una persona | donner un ordre à une personne | einer Person einen Befehl geben | dar una orden a una persona | 人に命令をあげる | dar uma ordem a uma pessoa |
| GIVE ORDERS, plural | to give orders | dare ordini | donner des ordres | Befehle geben | dar órdenes | 命令をあげる | dar ordens |
| SAY an ORDER + recipient | to say an order to a person | dire un ordine a una persona | dire un ordre à une personne | einer Person einen Befehl sagen | decir una orden a una persona | 人に命令を言う | dizer uma ordem a uma pessoa |
| EXPRESS an ORDER | to express an order | esprimere un ordine | exprimer un ordre | einen Befehl vermitteln | expresar una orden | 命令を表す | exprimir uma ordem |
| `causativeGloss` a PERSON, ACT | to cause a person to act | indurre una persona ad agire | induire une personne à agir | eine Person veranlassen zu handeln | inducir a una persona a actuar | 人が行動するようにする | induzir uma pessoa a agir |
| ORDER_VERB + object-controlled ACT * | to order a person to act | ordinare a una persona di agire | ordonner à une personne d'agir | einer Person befehlen zu handeln | ordenar a una persona actuar | 人に行動するように命じる | ordenar a uma pessoa agir |

- **TELL with an infinitive is the circle**: `infinitive_sense` swaps TELL_ORDER in, so the gloss
  is the concept's own word in all seven (*dire di, dire de, sagen, mandar*, 言う…ように, *dizer
  para*).
- **SAY has no `infinitive_link`**, so the Romance rows lose *di / de / para* (*dire a una persona
  agire*); giving SAY the links would make them TELL_ORDER's words again (*dire di, dire de, dizer
  para*), and German is *sagen … zu* already.
- **GIVE is あげる in Japanese**, the verb of a gift, and 命令をあげる is not said (命令を出す is); the
  obstacle SET met in C28.
- **SAY an ORDER** is not the collocation anywhere but Japanese (*dire un ordine, dire un ordre,
  einen Befehl sagen*; the verbs are *dare, donner, geben*).
- **EXPRESS** is *vermitteln* (convey) in German and 表す (represent) in Japanese; an order is given,
  not expressed.
- **The causative** renders in all seven and says *make someone act*, every causative's meaning
  (LET is "to cause a person to be allowed to act", CALL "to cause a person to come"); it has no word
  for the telling, so it fails the C05 test.
- **ORDER_VERB** is the one clean row: *ordinare di, ordonner de, befehlen zu, ordenar*, 命じる…ように
  take the same frame and none is TELL_ORDER's word (Spanish *mandar* is TELL_ORDER's, and *ordenar*
  is not). It is a synonym, the weakest kind of gloss, and seeding a seven-language verb for a
  tooltip no one can see buys nothing ("seed only what a gloss in the batch uses"). Its forms are
  kept below for whoever gives senses a surface.

### BE_FARING

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| BE + predicate OKAY | to be okay | stare bene | aller bien | gut gehen | estar bien | 大丈夫である | estar bem |
| BE + locative a good STATE | to be in a good state | essere in un buono stato | être dans un bon état | in einem guten Zustand sein | estar en un estado bueno | 良い状態にいる | estar em um estado bom |
| LIVE_ALIVE + WELL | to live well | vivere bene | bien vivre | gut leben | vivir bien | よく生きる | viver bem |
| HAVE PROBLEMS, negated | not to have problems | non avere problemi | ne pas avoir de problèmes | keine Probleme haben | no tener problemas | 問題を持たない | não ter problemas |

- **BE + OKAY is the circle**: OKAY's lexemes name BE_FARING as their `copula`, so `lexicalCopula`
  swaps it in and the gloss is BE_FARING's own word in five languages (*stare, aller, gehen, estar,
  estar*).
- **"To be in a good state" says the word back in Spanish and Portuguese.** BE_FARING *is* *estar*
  there, and BE takes *estar* before a locative, so the gloss opens on the concept's own word. It
  also bakes in the *good* that the predicate supplies: BE_FARING is the neutral *fare* (*sta bene,
  sta male*), and OKAY's gloss ([A33](A33-okay.md)) already says the good half.
- **"To live well"** is to lead a good life (*vivere bene, gut leben*), not to be all right today.
- **"Not to have problems"** is OKAY's meaning, not the verb's, and Japanese 問題を持たない is not said
  (問題がない is).

## Candidate forms used above (not seeded)

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| ORDER_VERB | verb, object-controlled infinitive, dative controller | order | ordinare (`infinitive_link: 'di'`) | ordonner (`'de'`) | befehlen (`object_case: 'dat'`) | ordenar | 命じる (めいじる, `infinitive_link: 'ように'`) | ordenar |

Not proposed for seeding (see TELL_ORDER's last reading).

## Mutual definitions

None of the leads is a circle except the two marked: TELL + infinitive and BE + OKAY each render the
sense itself.

## What would re-open it

A surface that shows senses: a tooltip for the word the translator actually chose (on the rendered
translation, say), rather than the picker's. That is a frontend feature with no ticket, and it
would re-open EAT_ANIMAL and KNOW_ACQUAINTED too. Until then a gloss for any of the four is invisible,
and the leads above are the record.

## Retires

To [`done/`](../done/) once the verdict is accepted, beside C28.

## Done

2026-09-24. **Literal by design** for both senses, verdict accepted beside
[C28](C28-verb-roots-without-a-gloss.md). Re-verified against the current engine and seed:
TELL_ORDER (sense of TELL) and BE_FARING (sense of BE) are seeded with no `definition`;
`/api/concepts` still selects `sense_of IS NULL` in both its queries
([index.ts](../../../packages/backend/src/index.ts)), so no surface can show a sense's tooltip;
ORDER_VERB is still not seeded; and the two circles hold (TELL + infinitive swaps TELL_ORDER in,
BE + OKAY swaps BE_FARING in). OKAY's own gloss shipped as [A33](A33-okay.md) ("that does not have
problems") without naming BE_FARING. No file changed but this one; no engine change. Re-opens with a
surface that shows senses (see [What would re-open it](#what-would-re-open-it)).
