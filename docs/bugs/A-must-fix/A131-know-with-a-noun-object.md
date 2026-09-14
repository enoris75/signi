# A131. KNOW with a noun object takes the knowing-a-fact verb

**Language:** Italian, French, Spanish, Portuguese, German

These five languages each have two verbs for "know":

- **Knowing a fact:** *sapere* / *savoir* / *saber* / *wissen*. It takes a clause ("sa che…"), no object
  ("lo sa"), or a piece of information (*la risposta*, *il nome*).
- **Knowing by acquaintance:** *conoscere* / *connaître* / *conocer* / *conhecer* / *kennen*. It takes a
  person, animal, place, thing or idea.

`KNOW` is seeded with only the first verb (`concepts/verbs/transitive.ts`), and its only argument is a
noun direct object. The builder therefore produces the second case in nearly every sentence with
KNOW, and every one of them uses the wrong verb.

Found while filing A130 (`il gatto seppe il cane`).

| Plan | Now | Want |
|---|---|---|
| CAT KNOW the boy | `il gatto sa il ragazzo.` · `le chat sait le garçon.` · `der Kater weiß den Jungen.` | `il gatto conosce il ragazzo.` · `le chat connaît le garçon.` · `der Kater kennt den Jungen.` |
| CAT KNOW the house | `el gato sabe la casa.` · `o gato sabe a casa.` | `el gato conoce la casa.` · `o gato conhece a casa.` |
| CAT KNOW the concept | `il gatto sa il concetto.` · `der Kater weiß den Begriff.` | `il gatto conosce il concetto.` · `der Kater kennt den Begriff.` |
| CAT KNOW me | `il gatto mi sa.` · `le chat me sait.` · `der Kater weiß mich.` | `il gatto mi conosce.` · `le chat me connaît.` · `der Kater kennt mich.` |
| CATS KNOW the house | `sanno` · `savent` · `saben` · `sabem` · `wissen` | `conoscono` · `connaissent` · `conocen` · `conhecem` · `kennen` |
| CAT KNOW the boy, negative | `le chat ne sait pas le garçon.` | `le chat ne connaît pas le garçon.` |
| CAT KNOW the house, future | `saprà` · `saura` · `sabrá` · `saberá` · `wird … wissen` | `conoscerà` · `connaîtra` · `conocerá` · `conhecerá` · `wird … kennen` |
| CAT MUST KNOW the house | `deve sapere` · `doit savoir` · `muss das Haus wissen` | `deve conoscere` · `doit connaître` · `muss das Haus kennen` |
| the cat that KNOW the boy runs | `der Kater, der den Jungen weiß, läuft.` | `der Kater, der den Jungen kennt, läuft.` |

In every row the only word that changes is the verb. The pinned rows are present and future tense, so
they don't overlap with A130's past-tense fix.

Already right: KNOW with no object (`il gatto sa.`, `der Kater weiß nicht.`), English "know", and
Japanese 知る (`猫は男の子を知っています`), which covers both senses.

Not pinned:

- **Information nouns.** *sapere* is right with nouns such as *la risposta*, *il nome* and *la verità*,
  and with a language in Italian and Spanish (*sa l'italiano*, *sabe italiano*). The corpus has no
  answer or name nouns. WORD and LANGUAGE accept either verb, so they are deliberately not pinned.
- **A DOG object in Spanish.** It mixes this defect with personal *a* on animals (`conoce al perro`),
  so it is left out.
- **The past and the resultative.** With A130, the past is the imperfect (*conosceva*). The perfective
  and the resultative of the acquaintance verb mean "met" (*conobbe*, *ha conosciuto*), just as *seppe*
  means "found out".
- **A clause complement** ("know that…"). KNOW has none yet. When it gets one, that complement stays
  with *sapere*.

## Shape of the fix

Follow A47's `ESTAR_COPULA`. Keep the user's concept (`KNOW`), and let the finite and non-finite verb
switch to an acquaintance verb whenever the plan has a `directObject`. Where that verb's forms live is
the decision:

- **A hidden seeded concept (recommended).** Seed something like `KNOW_ACQUAINTED`, kept out of the
  main-verb picker the way `modal: true` keeps the modals out, with full forms: *conoscere* /
  *connaître* / *conocer* / *conhecer* / *kennen* / 知る. The mood, participle, gerund, imperative and
  subjunctive machinery then reads it like any verb, and the conjugation snapshot covers it.
  The translator's `resolveVerbPhrase` swaps the concept when it resolves the verb.
- **Engine constants per language**, like `ESTAR_COPULA`. This is lighter to start with, but it
  repeats a whole regular paradigm five times.

Do not split KNOW into two user-facing senses. English has one "know", so the user shouldn't have to
choose. The object decides.

| | |
|---|---|
| **Test** | `verb.test.ts` → *known bugs: KNOW with a noun object* (1 `test.fails`) |
