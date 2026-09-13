# A70. French, Spanish and Portuguese put an object pronoun before the verb where it must follow

**Language:** French, Spanish, Portuguese

Each engine places an object clitic before the verb (`frCliticize`, `esCliticize`, `ptCliticize`). An affirmative command and, in Spanish and Portuguese, an infinitive attach it after the verb instead (`vois-moi`, `cómelo`, `comê-lo`), and standard Portuguese also avoids a clause-initial 3rd-person clitic.

## French

In an affirmative command the object pronoun follows the verb, joined by a hyphen, and `me`/`te`
become `moi`/`toi`: `vois-moi`, `ajoute-le`, `effondre-toi`. The negative command keeps the proclitic
(`ne me vois pas`). The imperative branch of `predicateText` (`languages/fr/predicateText.ts`)
calls the proclitic `frCliticize` for both polarities. A reflexive verb has a second problem:
`imperativeForm` (`mood.ts`) builds its imperative from the present forms, which carry the reflexive
clitic in front (`t'effondres` → `t'effondre`).

| Command | Now | Want |
|---|---|---|
| SEE + FIRST_PERSON (tu) | `me vois.` | `vois-moi.` |
| SEE + THIRD_PERSON (tu) | `le vois.` | `vois-le.` |
| SEE + FIRST_PERSON (vous) | `me voyez.` | `voyez-moi.` |
| ADD + THIRD_PERSON (tu) | `l'ajoute.` | `ajoute-le.` |
| COLLAPSE (tu) | `t'effondre.` | `effondre-toi.` |
| COLLAPSE (vous) | `vous effondrez.` | `effondrez-vous.` |
| COLLAPSE (nous) | `nous effondrons.` | `effondrons-nous.` |

Already right: the negative command (`ne me vois pas.`, `ne t'effondre pas.`) and the instruction
register (`le voir.`).

### Shape of the fix

In the affirmative imperative, strip a leading reflexive clitic from the verb form, then append
`-` + the enclitic form: `moi`/`toi` for me/te, and `le`/`la`/`les`/`nous`/`vous` otherwise. The
negative path is unchanged.

## Spanish

A Spanish object pronoun attaches to the end of an infinitive (`comerlo`) and of an affirmative
command (`cómelo`). It comes first only before a finite verb and in a negative command (`no lo
comas`). `predicateText` (`languages/es/predicateText.ts`) passes the infinitive, instruction and
imperative branches through `esCliticize`, which only ever puts the clitic in front. The infinitive
branch's comment says "an object pronoun attaches enclitically ("consumirlo"), via esCliticize", but
that is not what the code does.

| Clause | Now | Want |
|---|---|---|
| infinitive | `lo comer.` | `comerlo.` |
| infinitive, negative | `no lo comer.` | `no comerlo.` |
| infinitive, FIRST_PERSON | `me ver.` | `verme.` |
| instruction | `lo cargar.` | `cargarlo.` |
| command, tú | `lo come.` | `cómelo.` |
| command, nosotros | `lo comamos.` | `comámoslo.` |
| command, vosotros | `lo comed.` | `comedlo.` |

The same happens for `nos ved.` (want `vednos.`) and inside a coordinated command (`lo come, y
corre.`). Already right: the negative command (`no lo comas.`), finite verbs (`el gato lo come.`),
the modal (`el gato lo debe comer.`), and the aspects (`lo está comiendo`, `lo ha comido`).

### Shape of the fix

Add an enclitic attach helper and use it in the infinitive and instruction branches (negative too:
`no comerlo`) and in the affirmative imperative. `esCliticize` stays for the negative imperative
and finite verbs. The helper writes the stress accent when attaching the clitic makes the stress
fall three or more syllables from the end (`come` → `cómelo`, `comamos` → `comámoslo`). An infinitive
never needs one (`comerlo`), and a one-syllable command with one clitic doesn't either (`veme`).
A100 (Spanish reflexive imperative) needs the same helper, together with the `-s`/`-d` loss before
`nos`/`os`.

## Portuguese

`ptCliticize` (`languages/pt/ptCliticize.ts`) places every object clitic before the verb, after a
leading `não`. `predicateText` calls it on all three branches: finite, imperative and infinitive.
Its comment on the infinitive branch promises enclisis ("an object pronoun attaches enclitically
(`consumi-lo`), via ptCliticize"), but `ptCliticize` only ever does proclisis.

Proclisis is the Brazilian order after a subject or `não` (`o gato o vê`, `não o coma`), and `me` /
`te` may open a clause colloquially (`me veja`). A 3rd-person `o` / `a` / `os` / `as` cannot open a
clause in either norm. It follows the verb:

- in an affirmative command;
- in the instruction register and the citation infinitive;
- in a clause whose pronoun subject has been dropped (A40), where the verb is now first.

After an infinitive's `-r` the clitic becomes `-lo` and the verb takes an accent (`comê-lo`, `vê-lo`).
After a 1pl `-mos` it also becomes `-lo`, and the `-s` drops (`comamo-lo`).

| Plan (object THIRD_PERSON) | Now | Want |
|---|---|---|
| imperative SEE | `o veja.` | `veja-o.` |
| imperative SEE, feminine object | `a veja.` | `veja-a.` |
| imperative EAT, 1st plural | `o comamos.` | `comamo-lo.` |
| instruction SEE | `o ver.` | `vê-lo.` |
| infinitive EAT, plural object | `os comer.` | `comê-los.` |
| FIRST_PERSON sees him | `o vejo.` | `vejo-o.` |
| FIRST_PERSON, CAN + SEE | `o posso ver.` | `posso vê-lo.` |

Already right: a clitic after a noun subject (`o gato o vê.`) or after `não` (`não o coma.`,
`não o comer.`, `não o vejo.`). Not part of this defect: a clause-initial `me` / `te` / `nos` (`me
veja.`, `me comer.`), which is standard colloquial Brazilian Portuguese.

### Shape of the fix

Give `ptCliticize` the context it needs: whether anything precedes the verb (a subject, `não`, a
fronted `nunca`), and whether the verb is an infinitive. When nothing precedes and the clitic is
3rd-person, attach it after the verb with a hyphen. Apply the enclitic allomorphs:

- `-r` → `-lo` with an accent on the stem vowel (`comê-lo`, `dá-lo`, `consumi-lo`);
- `-s` → `-lo` (`comamo-lo`);
- a nasal ending → `-no` (`comem-no`).

When nothing precedes a modal, the clitic goes onto the governed infinitive (`posso vê-lo`).

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: French affirmative imperative enclisis*; `objectPronoun.test.ts` → *known bugs: Spanish enclitic object pronoun*; `objectPronoun.test.ts` → *known bugs: Portuguese clitic enclisis* (4 `test.fails`) |

## Resolved

Fixed 2026-09-13 as the shapes of the fix proposed.

- **French.** The new [`frEnclitic.ts`](../../../packages/engine/src/languages/fr/frEnclitic.ts)
  hyphenates an affirmative command's pronouns after the verb, with `me` / `te` as `moi` / `toi`. A
  reflexive verb's leading clitic is stripped and moved behind the verb by person (`effondre-toi`,
  `effondrons-nous`, `effondrez-vous`).
  [`predicateText.ts`](../../../packages/engine/src/languages/fr/predicateText.ts) uses it for the
  affirmative command. The negative command and the instruction keep `frCliticize` (`ne le vois pas`,
  `ne t'effondre pas`, `le voir`). A resumed group follows too (`vois-nous, lui et moi`).
- **Spanish.** The new [`esEnclitic.ts`](../../../packages/engine/src/languages/es/esEnclitic.ts)
  attaches the clitic and applies the accent rules to the longer word. It adds an accent when the
  stress now falls three syllables from the end (`cómelo`, `comámoslo`) and drops one the verb no
  longer needs (`está` → `estate`).
  [`predicateText.ts`](../../../packages/engine/src/languages/es/predicateText.ts) uses it for the
  infinitive and the instruction, negative included (`comerlo`, `no comerlo`, `cargarlo`), and for the
  affirmative command (`cómelo`, `comedlo`, `vela`, `venos a él y a mí`). The negative command and
  finite verbs keep `esCliticize`.
- **Portuguese.** The new [`ptEnclitic.ts`](../../../packages/engine/src/languages/pt/ptEnclitic.ts)
  writes the enclitic allomorphs: `-r` / `-z` → `-lo` with the accent (`comê-lo`, `vê-lo`), `-s` →
  `-lo` (`comamo-lo`), a nasal → `-no` (`comem-no`, `comam-nos`).
  [`predicateText.ts`](../../../packages/engine/src/languages/pt/predicateText.ts) uses it for a
  3rd-person clitic in:
  - an affirmative command and a non-negative instruction or infinitive;
  - a finite clause whose verb leads. The new `verbLeads` flag is set by
    [`renderClause.ts`](../../../packages/engine/src/languages/pt/renderClause.ts) when a pronoun
    subject is dropped, and never for the `se` protasis, which its conjunction leads.

  The clitic hangs on the last verb of the group that can carry it, never a participle (`vejo-o`, `vi-o`,
  `tinha-o visto`, `estou vendo-o`, `posso vê-lo`, `vemo-lo`, and `e vejo-o` after a coordinator). Anything
  ahead of the verb keeps proclisis (`não o vejo`, `nunca o vejo`, `o gato o vê`, `o cão que o vê`,
  `se o visse`). `me` / `te` / `nos` stay in front, as the bug file allows.

Every table row now renders as wanted.

Not changed here:

- A clause-initial synthetic future or conditional in Portuguese would need mesoclisis (`vê-lo-ei`).
  That is not modelled, so it keeps the clitic in front (`o verei`).
- A negated French instruction still reads `ne le pas charger`. That is the infinitive-negation
  defect, not clitic placement.
- The Spanish nosotros command's `-s` loss before `nos` / `os` belongs to A100.

- **Tests:**
  - [`imperative.test.ts`](../../../packages/engine/test/imperative.test.ts) → *known bugs: French
    affirmative imperative enclisis*;
  - [`objectPronoun.test.ts`](../../../packages/engine/test/objectPronoun.test.ts) → *known bugs:
    Spanish enclitic object pronoun* / *Portuguese clitic enclisis*.
  - The four pinning `test.fails` are now passing `test`s. New cases cover the plural, adverb, group
    and coordinated commands, and the Portuguese allomorphs and verb hosts. Guards cover proclisis
    wherever something precedes the verb.
- Unit tests:
  - the new `frEnclitic.test.ts`, `esEnclitic.test.ts` and `ptEnclitic.test.ts`;
  - `predicateText.test.ts` (fr, es, pt) and `renderClause.test.ts` (pt).
