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

## Resolved

2026-09-25. A378 reuses A376's subject hook: the translator's
[genericSubject.ts](../../../packages/engine/src/translator/functions/genericSubject.ts), which already
sees the clause's grammatical subject in every slot it comes from (a passive's patient, the thing
*piacere* likes, a relative clause's subject), now flags an Italian indefinite plural count subject
`partitive`, and Italian [artFor.ts](../../../packages/engine/src/languages/it/artFor.ts) spells the flag
as *di* + the definite article: `dei gatti corrono.`, `delle donne corrono.`, `degli amici corrono.`,
`dei gatti e delle donne corrono.`, `dei topi sono visti dal gatto.`, `al gatto piacciono dei topi.`

**Decision: the experiencer's dative stays bare** (`a gatti piace il topo`), since *a dei gatti* reads worse;
`genericSubject` takes a `dative` flag at the two experiencer call sites
([resolvePhrase.ts](../../../packages/engine/src/translator/functions/resolvePhrase.ts),
[resolveRelativeClause.ts](../../../packages/engine/src/translator/functions/resolveRelativeClause.ts)).
An object stays bare (`il gatto vede topi`), as does a numeral (`due gatti corrono`). The indefinite
mass subject was not pinned and is unchanged.

The shipped definitions re-render on their own: UNIVERSITY is now *una scuola dove delle persone adulte
imparano*, WAR *un periodo dove delle nazioni uccidono*.

Guarded by `subject.test.ts` → *known bugs: Italian writes an indefinite plural subject bare (A378)*: the
former `test.fails`, now a plain test, a new test for *degli*, a group, a passive and *piacere*, a
dative-and-numeral regression, and the original regression. Colocated cases are in
`translator/functions/genericSubject.test.ts` and `it/artFor.test.ts`. The Italian pins that held the bare
subject moved to the partitive: `government-and-institutions.test.ts` (UNIVERSITY, WAR),
`subject.test.ts`, `adjectives.test.ts`, `core-adjectives-e24.test.ts`, `intensifiers.test.ts`,
`pluralia-tantum.test.ts` and `time-and-degree-words.test.ts`.
