# A129. A relative on an alarm cry takes a plain object relativizer in Italian and French

**Language:** Italian, French

A124 made an alarm cry the a / à complement of CRY_OUT: `il ragazzo gridò al lupo`, `le garçon cria au
loup`. A relative clause whose head is that alarm (`headRole: 'directObject'`) still relativises it as a
plain direct object, with `che` / `que`. With the alarm frame that is ungrammatical. The gap is the
a / à complement, so the relative takes the preposition and the relativizer a complement gap takes
(A62): `al quale`, `auquel`.

| Plan | Language | Now | Want |
|---|---|---|---|
| the WOLF that BOY CRY_OUT (past) runs | it | `il lupo che il ragazzo gridò corre.` | `il lupo al quale il ragazzo gridò corre.` |
| | fr | `le loup que le garçon cria court.` | `le loup auquel le garçon cria court.` |
| same, plural | it | `i lupi che il ragazzo gridò corrono.` | `i lupi ai quali il ragazzo gridò corrono.` |
| | fr | `les loups que le garçon cria courent.` | `les loups auxquels le garçon cria courent.` |
| the FIRE that BOY CRY_OUT (past) burns | it | `il fuoco che il ragazzo gridò brucia.` | `il fuoco al quale il ragazzo gridò brucia.` |
| | fr | `le feu que le garçon cria brûle.` | `le feu auquel le garçon cria brûle.` |

The reading is marginal even in English (`the wolf that the boy cried`). The want is the one the frame
forces.

Found while fixing A124.

Already right: a relative on a plain cry (`la parola che il ragazzo gridò`, `le mot que le garçon cria`),
and a relative on CRY_OUT's recipient (`il lupo al quale il ragazzo gridò la parola`).

Not pinned: a pronoun alarm (`il ragazzo lo gridò`), whose clitic would be `ci` / `y`, and the French
preceding-object agreement, which an à complement must not trigger.

## Shape of the fix

In each engine's `relativeText`, test the gap before choosing the relativizer. When the head fills the
direct object of an alarm cry (`alarmCry(verb, head)`), render the relativizer through the
`terminus` complement path rather than as `che` / `que`. `relativeGapComplement` does that for a
complement gap, and its fused head is the one `alarmCryText` renders. French must also pass no preceding
object to `predicateText`, since the à complement is not a direct object.

| | |
|---|---|
| **Test** | `pangram.test.ts` → *known bugs: a relative on the alarm a cry raises* (1 `test.fails`) |

## Resolved

Fixed 2026-09-14, with the shape above. A new shared helper,
[`relativeAlarmHead`](../../../packages/engine/src/functions/relativeAlarmHead.ts), tells a head that
is the alarm of its relative's cry. It returns the relativizer stand-in `relativeGapComplement` builds
for a terminus gap. Each engine renders that stand-in through its `alarmCryText`, which gives `al quale` /
`ai quali` and `auquel` / `auxquels`.

- **Engine:** [`it/relativeText.ts`](../../../packages/engine/src/languages/it/relativeText.ts) also keeps
  an impersonal si from agreeing with the alarm (`i lupi ai quali si grida`).
  [`fr/relativeText.ts`](../../../packages/engine/src/languages/fr/relativeText.ts) passes no preceding
  object, so the participle does not agree (`les loups auxquels le garçon a crié`).
- **Tests:** [`pangram.test.ts`](../../../packages/engine/test/pangram.test.ts) → *known bugs: a relative
  on the alarm a cry raises*. The pinning `test.fails` is now a passing `test`. A new case covers the
  present, the resultative, the negative, a modal and the impersonal subject. The regression guard adds
  the plain cry's participle agreement and the recipient relative.
- Unit tests: `relativeAlarmHead.test.ts`, and new cases in `relativeText.test.ts` (it, fr).

Still not pinned: a pronoun alarm (`ci` / `y`).
