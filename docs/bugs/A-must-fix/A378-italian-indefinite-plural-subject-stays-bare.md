# A378. Italian writes an indefinite plural subject bare

**Language:** Italian

Italian `artFor` gives the indefinite plural no article, which is fine for an object ("il gatto vede
topi"). Before the verb it is not: a preverbal subject cannot go bare in Italian, as
[A376](../fixed/A376-romance-bare-plural-subject-loses-its-article.md) found for the bare plural. The
indefinite plural takes the partitive article, *dei gatti*, *delle donne*, as French takes *des* and
Spanish / Portuguese *unos* / *uns*.

| Case | Now | Want |
|---|---|---|
| CAT (indefinite, plural) RUN | `gatti corrono.` | `dei gatti corrono.` |
| WOMAN (indefinite, plural) RUN | `donne corrono.` | `delle donne corrono.` |
| past | `gatti corsero.` | `dei gatti corsero.` |

The **Want** column is written by hand.

**Already right.** `des chats courent.`, `unos gatos corren.`, `uns gatos correm.` An indefinite plural
object, `il gatto vede topi.`

**Tests that pin the bug as right** and need to change with the fix:
[government-and-institutions.test.ts](../../../packages/engine/test/government-and-institutions.test.ts),
UNIVERSITY (*una scuola dove persone adulte imparano*) and WAR (*un periodo dove nazioni uccidono*).
Both are shipped definitions: re-render them after the fix.

**Decisions for the fixer.**
- **The experiencer dative**, "a gatti piace il topo": *a dei gatti* is awkward. Probe it; leave it if
  the partitive reads worse.
- **An indefinite mass subject** ("acqua scorre", and Spanish / Portuguese "agua fluye", "água flui")
  has the same problem, but Spanish and Portuguese have no partitive article to give it. Not pinned.

**Found by** the A376 lane (2026-09-25), which checked UNIVERSITY's definition.

| | |
|---|---|
| **Test** | `subject.test.ts` → *known bugs: Italian writes an indefinite plural subject bare (A378)* (1 `test.fails`: masculine, feminine, past; plus a regression test for fr / es / pt and the object) |
