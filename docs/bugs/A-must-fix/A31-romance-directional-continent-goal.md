# A31. Directional continent goal: wrong preposition, and the article is kept (Italian, French)

**Language:** Romance / Iberian coordination

The `direction` goal of a motion picks its adposition by the goal's animacy (`a`/`à` a place,
`da`/`vers` a person — see A29's sibling for the locative). A **continent** needs a third choice:
Italian and French use *in* / *en*, and with **no** article — `va in Antartide`, `va en
Antarctique`. The engine applies the default inanimate-goal adposition *and* keeps the proper
noun's fixed article (correct only as a subject, `l'Antartide è fredda`), so it emits `va
all'Antartide` / `va à l'Antarctique`. This is A29's article defect (there for the *locative*)
**plus** a preposition-selection error unique to the goal. Spanish and Portuguese genuinely keep
the article (`a la Antártida`, `à Antártida`) and are right; German `zur Antarktis` is acceptable.
The fix needs continent-awareness in the two engines — `ANTARCTICA isA CONTINENT`, which the goal
preposition can key off.

| | Now | Want |
|---|---|---|
| Italian | `il gatto va all'Antartide.` | `il gatto va in Antartide.` |
| French | `le chat va à l'Antarctique.` | `le chat va en Antarctique.` |

| | |
|---|---|
| **Test** | `complements/direction.test.ts` → *known bugs: direction* (1 test) |
