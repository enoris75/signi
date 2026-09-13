# A107. The Portuguese imperative misbuilds dar, ir, começar, nomear and tornar-se

**Language:** Portuguese

`imperativeForm` (`mood.ts`) builds every Portuguese command, affirmative and negative alike, from the
present subjunctive in `subjPresent`. The stem is the stored `1sg_present` minus a final `-o`. The
ending is `-e` / `-emos` / `-em` when the base ends in `-ar`, and `-a` / `-amos` / `-am` otherwise.
Only BE and KNOW are overridden. A sweep of the seeded verbs finds five where the rule breaks:

- **dar, ir:** the 1sg (`dou`, `vou`) has no `-o` to strip, so the ending is glued on whole.
- **começar:** `arSubjStem` respells `g` → `gu` and `c` → `qu` before `-e` but not `ç` → `c`.
  (Its `z` → `c` is Spanish-only; Portuguese keeps `z`, as in `cruze`. No seeded verb reaches it.)
- **nomear:** an `-ear` verb inserts `i` only in the stressed forms (`nomeie`, `nomeiem`). The rule
  copies the 1sg `nomei-` into the unstressed 1pl as well.
- **tornar-se:** the stored 1sg is `me torno`, so the stem carries the 1st-person reflexive. The base
  ends in `-ar-se`, not `-ar`, so the verb takes the `-a` endings.

| Verb | Now | Want |
|---|---|---|
| GIVE | `doue.` / `douemos.` / `douem.` | `dê.` / `demos.` / `deem.` |
| GO | `voua.` / `vouamos.` / `vouam.` | `vá.` / `vamos.` / `vão.` |
| START | `começe.` | `comece.` |
| NAME, 1st plural | `nomeiemos.` | `nomeemos.` |
| BECOME + STRONG | `me torna forte.` | `torne-se forte.` |
| BECOME + STRONG, negative | `não me torna forte.` | `não se torne forte.` |

(The three GIVE / GO forms are 2sg / 1pl / 2pl. The negative commands carry the same wrong stems:
`não doue.`, `não voua.`, `não começe.`)

Already right: the other 49 seeded non-modal verbs (a modal cannot head a command), among them the irregular stems the 1sg already carries
(`faça`, `veja`, `leia`, `venha`, `contenha`, `possua`), and the `gu` / `qu` respellings (`carregue`,
`clique`, `apague`).

## Shape of the fix

In `subjPresent`, for Portuguese:

- add `GIVE` (`dê` / `demos` / `deem`) and `GO` (`vá` / `vamos` / `vão`) to `PT_SUBJ_OVERRIDE`;
- respell `ç` → `c` before `-e`, and keep `z` (drop the Spanish `z` → `c` for Portuguese);
- for an `-ear` stem, drop the `i` in the 1pl (`nomeie` but `nomeemos`);
- for a pronominal verb, strip the reflexive off the stored form and the `-se` off the base, choose the
  class from the bare infinitive, and re-attach the reflexive in the addressee's person: `se`
  (você / vocês) or `nos`. It goes after an affirmative command (`torne-se`, `tornemo-nos`) and
  before a negative one (`não se torne`).

| | |
|---|---|
| **Test** | `imperative.test.ts` → *known bugs: Portuguese imperative stems* (1 `test.fails`) |
