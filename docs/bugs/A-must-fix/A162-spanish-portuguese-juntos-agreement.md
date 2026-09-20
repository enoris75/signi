# A162. Spanish and Portuguese "juntos" does not agree with the subject

**Languages:** Spanish, Portuguese

TOGETHER is seeded as an ordinary adverb — one invariant `base` per language — and five languages
have exactly that: *insieme*, *ensemble*, *zusammen*, "together", 一緒に. Spanish and Portuguese do
not. Their word is **juntos**, a predicative adjective agreeing with the subject in gender and
number, so a feminine subject must take *juntas*.

| Plan | Now | Want |
|---|---|---|
| the cats (fem, plural) EAT + TOGETHER | es `las gatas comen juntos.` | `las gatas comen juntas.` |
| " | pt `as gatas comem juntos.` | `as gatas comem juntas.` |
| the cats (masc, plural) EAT + TOGETHER | es `los gatos comen juntos.` | already right |

Found while glossing COORDINATE as "to cause people to act together"
([localization C08](../../localization/done/C08-copular-and-genus-verbs.md)), where it renders
*inducir **personas** a actuar **juntos*** — PERSON is feminine in both languages. The definition
shipped with the masculine form.

## Shape of the fix

The adverb slot has no agreement machinery: `predicateText` (es/pt) emits `modifier.forms['base']`
and nothing selects a form. Two ways, and the choice is a product decision about the lexicon's shape:

1. **Agreeing adverbs.** Give the lexeme the adjective's forms (`fem`, `plural`, `fem_plural`) and a
   flag saying it agrees, then have the two engines resolve it against the clause's subject — the
   same features `agreeAdj` already reads. It generalises: any Romance "adverb" that is really a
   predicative adjective (*solo* / *solos*, *sólo*) would work.
2. **An invariant phrase in the lexeme.** es *en conjunto*, pt *em conjunto* — correct everywhere and
   free, but stilted next to the everyday *juntos* in the ordinary case ("los gatos comen juntos").

Whichever lands, the concept stays an adverb: what it modifies is the acting, not the actors.

| | |
|---|---|
| **Test** | `adverb.test.ts` → *known bugs: Spanish and Portuguese "juntos" does not agree with the subject* (1 `test.fails`) |
