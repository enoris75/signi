# A127. A German object pronoun follows the adverb, "nicht" and "gerade"

**Language:** German

An unstressed personal pronoun leads the German Mittelfeld. It comes before any adverb, before "nicht"
and before the progressive's "gerade": "der Kater sieht ihn immer", "sieht ihn nicht immer", "sieht ihn
gerade". A full noun object may follow the adverb ("sieht immer den Hund"). A pronoun after it is
stressed and contrastive ("sieht immer IHN", "always sees *him*").

`renderClause` (`languages/de/renderClause.ts`) builds every clause order from one Mittelfeld list:
`[aspectMid, neg.beforeAdverb, modalAdverbs, modifier, dative, directObject, …]`. The direct object is
placed after the adverb whether it is a noun or a pronoun. The command and the instruction lists have
the same order.

| Plan | Now | Want |
|---|---|---|
| CAT SEE him, ALWAYS | `der Kater sieht immer ihn.` | `der Kater sieht ihn immer.` |
| CAT SEE him, NEVER | `der Kater sieht nie ihn.` | `der Kater sieht ihn nie.` |
| CAT SEE him, FAST | `der Kater sieht schnell ihn.` | `der Kater sieht ihn schnell.` |
| CAT SEE him, ALWAYS, negative | `der Kater sieht nicht immer ihn.` | `der Kater sieht ihn nicht immer.` |
| CAT SEE me, ALWAYS | `der Kater sieht immer mich.` | `der Kater sieht mich immer.` |
| CAT SEE him, progressive | `der Kater sieht gerade ihn.` | `der Kater sieht ihn gerade.` |
| CAT WILL SEE him, ALWAYS | `der Kater will immer ihn sehen.` | `der Kater will ihn immer sehen.` |
| CAT SEE him, ALWAYS, resultative | `der Kater hat immer ihn gesehen.` | `der Kater hat ihn immer gesehen.` |
| if CAT SEE him ALWAYS, DOG RUN | `wenn der Kater immer ihn sehen würde, …` | `wenn der Kater ihn immer sehen würde, …` |
| command: see him, ALWAYS | `sieh immer ihn.` | `sieh ihn immer.` |
| infinitive: see him, ALWAYS | `immer ihn sehen.` | `ihn immer sehen.` |
| CAT BE happy, but DOG BE, ALWAYS | `…, aber der Hund ist immer es.` | `…, aber der Hund ist es immer.` |

The last row is A121's pro-form "es", which takes the direct-object slot.

Found while fixing A121.

Already right: the relative clause, which `subordinateClause` orders on its own (`der Hund, der ihn immer
sieht, läuft`), and a noun object (`der Kater sieht immer den Hund`).

Not pinned: the prospective's zu-infinitive group (`ist im Begriff, immer ihn zu sehen`, want `ihn immer
zu sehen`), and a dative pronoun recipient, which does not render as a pronoun at all yet.

## Shape of the fix

Split the direct object by kind in each Mittelfeld list. A pronoun object (`isPronounElement`) moves to
the head of the Mittelfeld, ahead of `aspectMid` ("gerade"), "nicht" and the adverbs. In the declarative
that gives `[subj, verb, pronoun, gerade, nicht, adverbs, …]`. A noun object keeps its place. A121's `proObject` ("es") belongs with the pronouns. `prospectiveFrame` needs the same split
inside its zu-infinitive group.

| | |
|---|---|
| **Test** | `objectPronoun.test.ts` → *known bugs: German object pronoun before an adverb* (1 `test.fails`) |
