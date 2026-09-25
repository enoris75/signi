# A376. A bare plural subject loses its article in Italian, French, Spanish and Portuguese

**Language:** Italian, French, Spanish, Portuguese

English leaves a generic plural subject bare: "cats run", "time flies like an arrow". The Romance
languages cannot put a bare plural before the verb. Their generic takes the definite article: *i gatti
corrono*, *les chats courent*, *los gatos corren*, *os gatos correm*. With an experiencer verb the
article joins the dative preposition: *ai gatti piace*, *a los gatos les gusta*.

The engine keeps the plan's `bare` determiner in the subject too. Each engine's `artFor` returns no
article for `bare`, which is right for an object (*il gatto vede topi*; French writes *des* there
through `objectArtFor`, A149) and wrong before the verb.

| Plan | Language | Now | Want |
|---|---|---|---|
| CAT (bare, plural) RUN | Italian | `gatti corrono.` | `i gatti corrono.` |
| | French | `chats courent.` | `les chats courent.` |
| | Spanish | `gatos corren.` | `los gatos corren.` |
| | Portuguese | `gatos correm.` | `os gatos correm.` |
| CAT (bare, plural) LIKE a MOUSE | Italian | `a gatti piace un topo.` | `ai gatti piace un topo.` |
| | French | `chats aiment une souris.` | `les chats aiment une souris.` |
| | Spanish | `a gatos les gusta un ratón.` | `a los gatos les gusta un ratón.` |
| | Portuguese | `gatos gostam de um rato.` | `os gatos gostam de um rato.` |
| FLY_INSECT (bare, plural; TIME, domain) LIKE an ARROW_PROJECTILE | Italian | `a mosche del tempo piace una freccia.` | `alle mosche del tempo piace una freccia.` |

The last row is the console line `/subj ( fly /adj ( time /domain ) /pl /zero ) /verb ( like ) /obj ( arrow /a )`.

**Shape of the fix.** In the subject slot of each of the four engines (`subjectPhrase.ts` /
`subjectText.ts`), read a `bare` count plural as the definite before the article is chosen, the way a
proper noun already overrides the picked determiner in `artFor`. The object and complement slots stay
as they are.

**Decisions for the fixer.**
- **Generic or existential.** The definite is the generic reading, which is what an English bare plural
  subject of a simple present nearly always means. An existential reading ("cats are running in the
  garden") would want the indefinite plural instead (*dei gatti*, *des chats*, *unos gatos*). B76 chose
  that reading for WAR's definition. The plan does not say which is meant; this ticket asks for the
  generic one.
- **A bare mass subject** ("water flows") has the same problem. Probe it and fix it in the same place
  if the result matches.
- **A relative clause's subject** takes the rule too, which changes shipped definitions. UNIVERSITY
  reads *una scuola dove persone adulte imparano* ([B77](../../localization/done/B77-teams-institutions-and-business.md)).
  Re-render the definitions after the fix.
- **Brazilian Portuguese** accepts *gatos gostam de ratos*. The Portuguese here is European (*cão*), so
  it takes *os*.

**Tests that pin the bug as right** and need to change with the fix:
[subject.test.ts](../../../packages/engine/test/subject.test.ts), *FEELING pluralises* (*sentimenti corrono.*,
*sentiments courent.*, *sentimentos correm.*, a subject standing in for FEEL's bare object), and
[adjectives.test.ts](../../../packages/engine/test/adjectives.test.ts), *"less", "equally" and a bare comparative*
(*cani più grandi corrono.*, *perros más grandes corren.*). P09-E33's French *animaux comme le chat
courent* is the same construct.

**Already right.** English, German and Japanese (*cats run*, *Kater laufen*, 猫は走ります). A bare plural
object (*il gatto vede topi*, *le chat voit des souris*).

**Not filed with it.** `/adj ( time )` defaults to the *feature* relation, which Italian writes *a*
(*mosche a tempo*, like *contratto a tempo*). That is a correct rendering of a relation the author did
not mean. *Flies of time* is `/domain` (*del tempo*).

**Found by** a console line checked by hand (2026-09-25), at 7a392187. It was reported before as
[B76](../../localization/done/B76-government-and-the-law.md) reading 5 and P09-E24's follow-up 4,
and not filed.

| | |
|---|---|
| **Test** | `subject.test.ts` → *known bugs: a bare plural subject loses its article in it / fr / es / pt (A376)* (1 `test.fails`: three plans; plus a regression test for en / de / ja and the bare object) |

## Resolved

**2026-09-25.** The translator now reads a clause's bare plural or mass subject as the generic in
Italian, French, Spanish and Portuguese, and gives it the definite article before any engine chooses
one: [genericSubject.ts](../../../packages/engine/src/translator/functions/genericSubject.ts), applied in
[resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts) and
[resolveRelativeClause.ts](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts).
It works at resolution rather than in each engine's `subjectPhrase`, because the experiencer's dative
(*ai gatti piace*) is built from the plan's subject but rendered as a complement.

Decisions taken:
- **Generic reading**: the definite article (*i gatti corrono*, *les chats courent*, *los gatos
  corren*, *os gatos correm*); European Portuguese *os*.
- **Bare mass subject**: same defect, same fix — *l'acqua scorre*, *l'eau coule*, *el agua fluye*,
  *a água flui*.
- **What counts as the subject**: the clause's grammatical subject, whichever slot of the plan it came
  from — a passive's promoted patient (*i topi sono mangiati dal gatto*) and *piacere* / *gustar*'s
  thing liked (*al gatto piacciono i topi*) too — and an experiencer's dative. A relative clause's own
  subject takes it (*il topo che i gatti vedono*). A passive's agent, the object and the complements
  keep the plan's determiner (*il topo è mangiato da gatti*, *il gatto vede topi*).
- **Not changed**: a bare the plan did not pick — a numeral's dropped article (*due gatti corrono*), a
  personal name (*Pietro*), a pronoun, Spanish/Portuguese *otros* standing for the indefinite article
  (*otros gatos corren*) — a bare count singular, and a verbless period, which is a label (*gatti.*).
- **Shipped definitions and UI strings**: none change. Every definition and UI string was rendered
  before and after the fix, with no difference. UNIVERSITY's *una scuola dove persone adulte imparano*
  is an **indefinite** plural, not a bare one. Italian writes no indefinite plural article, so it reads
  the same as a bare plural, but it is a different construct and is not covered by this fix.

Tests: [subject.test.ts](../../../packages/engine/test/subject.test.ts), *known bugs: a bare plural
subject loses its article in it / fr / es / pt (A376)*. The former `test.fails` now passes, and new
tests cover the mass subject, the passive / experiencer / agent slots, the relative / coordination /
question / past cases, and the cases that stay bare. The function has its own tests in
[genericSubject.test.ts](../../../packages/engine/src/translator/functions/genericSubject.test.ts). The
pins that recorded the bug were corrected: *FEELING pluralises* (subject.test.ts), *"less", "equally"
and a bare comparative* (adjectives.test.ts), P09-E33's *such as* subjects (nounPhrase.test.ts), and the
e2e expectations in [console.spec.ts](../../../e2e/console.spec.ts) and
[noun-phrase.spec.ts](../../../e2e/noun-phrase.spec.ts).
