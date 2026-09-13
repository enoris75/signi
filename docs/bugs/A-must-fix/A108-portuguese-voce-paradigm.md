# A108. Portuguese 2nd person mixes tu / vós forms into the você / vocês paradigm

**Language:** Portuguese

The engine models the Portuguese 2nd person as **você / vocês**, which agree like the 3rd person.
The rest of the engine assumes this:

- the pronoun seed spells SECOND_PERSON `você` / `vocês`, including its tonic form (`por causa de você`);
- the possessive maps 2sg and 2pl to `seu` / `sua` ("the seed's você is grammatically 3rd person",
  `possessive.ts`);
- `imperativeForm` builds the command on the 3rd-person present subjunctive (`coma`, `comam`), "the
  seed stores 2sg = 3sg and 2pl = 3pl morphology" (`mood.ts`);
- 48 of the 57 seeded verbs store 3rd-person forms in the `2sg_*` / `2pl_*` cells, so a coordinated
  subject reads `você e o gato comem` and a plain one `come.`

Several tables still carry **tu / vós** forms, so a 2nd-person subject agrees as `és`, `sois`,
`estás` or `comesses`, depending on the verb and the tense:

- **Corpus** (`backend/src/concepts/verbs/`): MUST, CAN and WILL (every 2nd-person cell: `deves`,
  `deveste`, `deverás`, `deveis`…); BE (every cell: `és`, `foste`, `serás`, `sois`, `fostes`,
  `sereis`); GIVE (present `dás` / `dais`); BECOME (singular `te tornas` / `te tornaste` /
  `te tornarás`); SHOW, SEEM and APPEAR (present singular `mostras` / `pareces` / `apareces`).
- **`languages/pt/pt.consts.ts`**: the aspect auxiliaries `ESTAR_PT` (`estás`, `estais`,
  `estavas`…) and `TER_PT` (`tens`, `tinhas`, `terás`…), and the copular `ESTAR_COPULA` (A47:
  `estás`, `estiveste`, `estarás`…).
- **`mood.ts`**: `PT_COND` (`-ias`, `-íeis`) and `PT_SUBJ` (`-sses`, `-sseis`), so every verb takes
  a tu / vós form in a hypothetical.
- **`languages/pt/complementsPhrase.ts`**: the negative pronoun cause hard-codes `tua` / `vossa`
  (`por tua culpa`) instead of the `seu` / `sua` that `possessivePt` gives.

| Plan (2nd-person subject) | Now | Want |
|---|---|---|
| BE + STRONG | `és forte.` | `é forte.` |
| BE + STRONG, plural | `sois fortes.` | `são fortes.` |
| BE + TIRED (estar) | `estás cansado.` | `está cansado.` |
| EAT, progressive | `estás comendo.` | `está comendo.` |
| EAT, past resultative | `tinhas comido.` | `tinha comido.` |
| MUST + EAT | `deves comer.` | `deve comer.` |
| GIVE the book to the dog | `dás o livro ao cão.` | `dá o livro ao cão.` |
| BECOME + STRONG | `te tornas forte.` | `se torna forte.` |
| relative: the book you show | `o livro que você mostras arde.` | `o livro que você mostra arde.` |
| condition clause | `se comesses, o cão correria.` | `se comesse, o cão correria.` |
| main clause under a condition | `se o gato comesse, correrias.` | `se o gato comesse, correria.` |
| negative cause, singular | `o gato chora por tua culpa.` | `o gato chora por sua culpa.` |
| negative cause, plural | `o gato chora por vossa culpa.` | `o gato chora por sua culpa.` |

Already right: the 48 other verbs in the plain tenses (`come.`, `vai.`, `comem.`), the imperative
(`coma.`, `comam.`), the possessive (`o seu cão corre.`) and the tonic pronoun (`por causa de você`).
The accusative clitic `te` (`o gato te vê`) is the usual Brazilian pairing with `você` and is not part
of this defect. The plural clitic `vos` (`o gato vos vê.`) is a vós remnant too, but there is no single
standard target for it (`os vê` / `vê vocês`), so it is not pinned.

## Shape of the fix

This is a data fix in four places. It needs no new logic:

1. **Corpus:** in the nine verbs, set every `2sg_*` cell to the `3sg_*` form and every `2pl_*` cell to
   the `3pl_*` form, as the other 48 do.
2. **`pt.consts.ts`:** the same in `ESTAR_PT`, `TER_PT` and `ESTAR_COPULA` (`está` / `estão`,
   `tinha` / `tinham`, `esteve` / `estiveram`).
3. **`mood.ts`:** `PT_COND` `2sg: 'ia'`, `2pl: 'iam'`; `PT_SUBJ` `2sg: 'sse'`, `2pl: 'ssem'`.
4. **`complementsPhrase.ts`:** build the negative pronoun cause's possessive with `possessivePt`
   (agreeing with feminine `culpa`) instead of the local `minha` / `tua` / `vossa` table.

The `2nd singular` / `2nd plural` blocks of `test/__snapshots__/verb.conjugation.test.ts.snap`
record the tu / vós forms (`estás adicionando.`, `apareces.`, `estais aparecendo.`…). They must be
re-baselined with the fix. `languages/pt/pt.fixtures.ts` copies the same seeded forms for the unit
tests (`és`, `sois`, `te tornas`, `deves`…).

| | |
|---|---|
| **Test** | `pronoun.test.ts` → *known bugs: Portuguese você agreement* (2 `test.fails`) |
