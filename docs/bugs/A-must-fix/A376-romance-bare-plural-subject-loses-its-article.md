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
