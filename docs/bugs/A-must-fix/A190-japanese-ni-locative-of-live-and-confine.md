# A190. Japanese 住む and 閉じ込める mark their place with で instead of に

**Language:** Japanese

A Japanese locative takes `で`, the place where something happens (`家で走ります`, `家でネズミを食べます`).
A few verbs take `に` instead, because the place is where something is or ends up, not where an act
goes on. The existential いる / ある is one ([A109](../fixed/A109-japanese-be-locative-existential.md)).
住む, "live, reside", is the textbook other one: `東京に住む`, never `東京で住む`. 閉じ込める, "shut in",
names where the confined thing ends up: `犬を家に閉じ込める`. With `で` it says where the act of
shutting in took place, and leaves out what it was shut in.

[`complementSegs`](../../../packages/engine/src/languages/ja/complementSegs.ts) gives a locative `に`
only when [`predicateSegs`](../../../packages/engine/src/languages/ja/predicateSegs.ts) passes
`existential`, which is true only for the copula and for HAVE with an inanimate owner. Every other
verb gets `PARTICLE.locative`, `で`. LIVE and CONFINE were seeded for B32's place glosses (`住む場所`,
where the locative is gapped and takes no particle), so nothing rendered one with its place until
now.

| Case | Now | Want |
|---|---|---|
| CAT LIVE in the HOUSE | `猫は家で住みます。` | `猫は家に住みます。` |
| … past | `猫は家で住みました。` | `猫は家に住みました。` |
| … progressive | `猫は家で住んでいます。` | `猫は家に住んでいます。` |
| … negative | `猫は家で住みません。` | `猫は家に住みません。` |
| … MUST | `猫は家で住む必要があります。` | `猫は家に住む必要があります。` |
| … under the HOUSE | `猫は家の下で住みます。` | `猫は家の下に住みます。` |
| … behind the HOUSE | `猫は家の後ろで住みます。` | `猫は家の後ろに住みます。` |
| … in no HOUSE | `猫はどの家でも住みません。` | `猫はどの家にも住みません。` |
| command | `家で住んでください。` | `家に住んでください。` |
| relative clause: the DOG that lives in the HOUSE runs | `家で住む犬は走ります。` | `家に住む犬は走ります。` |
| CAT CONFINE the DOG in the HOUSE | `猫は家で犬を閉じ込めます。` | `猫は家に犬を閉じ込めます。` |
| … past | `猫は家で犬を閉じ込めました。` | `猫は家に犬を閉じ込めました。` |
| the random phrase | `彼女はいくつかのボタンで住んでいました。` | `彼女はいくつかのボタンに住んでいました。` |

Every **Want** was rendered by a trial fix applied to a throwaway copy of HEAD, not written by hand.

**Already right.** The other six languages (`the cat lives in the house.`, `der Kater wohnt im Haus.`,
`il gatto abita nella casa.`). The verbs of action, which keep `で` (`猫は家で走ります。`,
`猫は家でネズミを食べます。`). BE's existential (`猫は家にいます。`). The gapped locative of the HOME and
HOUSE glosses (`住む場所`, `住む建物`).

Found by the random phrase "she had lived in some buttons." (seed 502398).

## Shape of the fix

Verified by applying it to a throwaway copy of HEAD. It renders every **Want** above and leaves the
engine and backend suites green. No passing test moves.

Let the verb's Japanese lexeme say which particle its locative takes. The trial seeds
`locative_particle: 'に'` on the ja forms of LIVE
([`intransitive.ts`](../../../packages/backend/src/concepts/verbs/intransitive.ts)) and CONFINE
([`transitive.ts`](../../../packages/backend/src/concepts/verbs/transitive.ts)), the way `seeming`
and `state_verb` sit on a lexeme. `predicateSegs` passes `existential || verb.forms['locative_particle']
=== 'に'` to the three `complementSegs(adjunctComplements, …)` calls in place of `existential`. The
relational nouns, the `no` circumfix (`どの家にも`) and the relative clause then compose as they do for
BE.

**Decisions for the fixer:**

- **The flag's name and reach.** `existential` also means "the verb is いる / ある" in the comment on
  `complementSegs`. Rename the parameter to what it now decides (the locative's particle), or pass the
  particle itself.
- **`through`.** The trial's `に` wins over [A176](../fixed/A176-japanese-locative-through.md)'s
  `家を通って`, as BE's existential already does: "lives through the house" renders `猫は家に住みます。`.
  Not pinned.
- **HIDE.** 隠す puts the hidden thing somewhere, and `家に本を隠す` is the usual phrasing. But `家で本を
  隠す` ("hides the book while at home") is also Japanese, and `locative.test.ts` pins `で` for HIDE in
  *takes its locative the same way*. It is left as it is. Not pinned.

| | |
|---|---|
| **Test** | `complements/locative.test.ts` → *known bugs: Japanese 住む and 閉じ込める mark their place with に* (1 `test.fails`, plus a regression test for the other six languages, the verbs of action and BE) |
