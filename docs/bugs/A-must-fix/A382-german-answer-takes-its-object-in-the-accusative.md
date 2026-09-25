# A382. German ANSWER takes its object in the accusative, which antworten has no slot for

**Languages:** German, Swiss German (preview)

ANSWER's `directObject` is what is answered, and its `terminus` is the person answered. German
*antworten* takes the person in the dative (*der Frau antworten*, already right) and no accusative at
all: what is answered is *auf* + accusative, *auf die Frage antworten*. The engine hands it a bare
accusative object, so every German clause of ANSWER with an object is ungrammatical: *der Mann
antwortet das Wort*, *ihr antwortetet mich*. Swiss German *antworte* is the same, with *uf*.

| Case | Now | Want |
|---|---|---|
| de: the MAN ANSWERs the WORD | `der Mann antwortet das Wort.` | `der Mann antwortet auf das Wort.` |
| de: … ANSWERs me | `der Mann antwortet mich.` | `der Mann antwortet auf mich.` |
| de: … the WORD, to the WOMAN | `der Mann antwortet der Frau das Wort.` | `der Mann antwortet der Frau auf das Wort.` |
| de: perfect | `der Mann hat das Wort geantwortet.` | `der Mann hat auf das Wort geantwortet.` |
| de: relative on the object | `das Wort, das der Mann antwortet, brennt.` | `das Wort, auf das der Mann antwortet, brennt.` |
| de: you (pl) ANSWERed me, past (the random phrase's condition, as a statement) | `ihr antwortetet mich.` | `ihr antwortetet auf mich.` |
| gsw: the MAN ANSWERs the WORD | `de Maa antwortet s Wort.` | `de Maa antwortet uf s Wort.` |
| gsw: perfect | `de Maa hät s Wort gantwortet.` | `de Maa hät uf s Wort gantwortet.` |
| gsw: relative on the object | `s Wort, wo de Maa antwortet, brennt.` | `s Wort, wo de Maa druf antwortet, brennt.` |

The **Want** column was rendered, not written by hand: a throwaway copy of HEAD with `object_prep:
'auf'` on the German lexeme and `'uf'` on the Swiss German one prints exactly these. There, the only
test that moves in the engine suite is the one named below.

**The passive is the fixer's decision, and is not pinned.** A verb with an `object_prep` never
passivizes: `resolveVoice` ([resolveVerbPhrase.ts](../../../packages/engine/src/translator/functions/resolveVerbPhrase.ts))
turns it back to active, as A139 decided for CLICK. With *auf*, then, the passive of phrase 8 would
come out active. Today it is a passive of a verb that has none: *jene Phrase würde gerade vom Kater
… geantwortet werden wollen*. The alternative is *beantworten*, which takes the accusative and
passivizes (*das Wort wird vom Mann beantwortet*). But it is a second lemma, which the lexeme cannot
hold today, and *beantworten* with the person alone (*der Frau beantworten*) is wrong. So it would
have to be chosen only where there is an object.

**Already right.** The person alone in the dative (`der Mann antwortet der Frau.`), the bare verb
(`der Mann antwortet.`), and English, Italian, Spanish, Portuguese and Japanese in the active (French's
`répond le mot` is pinned too, but see *Not filed*). Italian, Spanish and Portuguese take what is
answered as a direct object (`risponde la parola`, `responde la palabra`, `responde a palavra`).
Japanese takes it with を (単語を答えます). English "answers the word".

**Not filed with it.** French *répondre* in the passive (*être en train d'être répondue*, from the same
phrase) is a separate question: the active `répond le mot` is pinned, and the French passive of an
indirect-transitive verb is its own topic. Japanese 私を答えた for a person object follows the same
frame (what is answered takes を), and a person as the thing answered is the plan's nonsense, not the
grammar's.

**Found by** random phrase seed 19035 (`npm run phrases:random -- 1 --seed 19035`): *wenn jene Jungen
oder ihr mich antworten würdet, würde sie wie die interessante Wand oder wie jenes neue Wasser stehen
bleiben.* Seed 19036 has the passive: *würde jene Phrase gerade vom Kater, vom Gebäude und von der
Sprache überall dank allen guten leeren Klingen geantwortet werden wollen.*

## Shape of the fix

Name the preposition on the lexemes, as A139 did for CLICK and WAIT has: `object_prep: 'auf'` on
ANSWER's German forms in [verbs/transitive.ts](../../../packages/backend/src/concepts/verbs/transitive.ts),
`object_prep: 'uf'` on its Swiss German forms in
[gsw/verbsTransitive.ts](../../../packages/backend/src/concepts/gsw/verbsTransitive.ts). No engine
change: German and Swiss German already render a prepositional object, its relative (*auf das*,
*druf*) and its place among the complements. Reseed `signi.db` for the running app.

**Decisions for the fixer:**

- **The passive**, as above: accept A139's fallback to active, or pick *beantworten* where the clause
  has an object.
- **The pin that moves:** `sweep-definitions.test.ts` → *the sweep's verbs: a present clause in
  every language* → `ANSWER` asserts `der Mann antwortet das Wort.`, the defect itself. It is a
  passing test that pins the wrong German, and it changes to `der Mann antwortet auf das Wort.` with
  the fix. The user ruled this one a bug (2026-09-25).

| | |
|---|---|
| **Test** | `saying-verbs.test.ts` → *known bugs: German ANSWER takes its object in the accusative (A382)* (1 `test.fails`: an object, a pronoun, an object beside the dative person, the perfect and a relative on the object, in de and gsw; plus a regression test for the dative person alone, the bare verb and the five languages that take a direct object). Moves with the fix: the `ANSWER` row of `sweep-definitions.test.ts` |
