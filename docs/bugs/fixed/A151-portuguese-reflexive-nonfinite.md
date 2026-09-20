# A151. A Portuguese reflexive verb's non-finite forms keep a fixed `se`, and its compound tenses lose it

**Language:** Portuguese

Portuguese reflexivity is lexical, as Spanish is. BECOME is `tornar-se` and MOVE_ONESELF is
`mover-se`, and their stored finite forms carry the clitic (`me movo`, `se move`). The stored
non-finite forms carry the 3rd-person clitic, attached (`mover-se`, `movendo-se`), or none at all
(`movido`). The finite tenses, the moods (A137) and the command are right. Nothing agrees or places
the clitic in the non-finite verb group:

- `aspectVerb` (`languages/pt/aspectVerb.ts`) uses the stored gerund and infinitive as they are, so
  any subject other than the 3rd person gets `se`. Its past and future resultative is `ter` + the
  participle with no clitic at all.
- `verbGroupInfinitive` (`languages/pt/verbGroupInfinitive.ts`), which a modal governs, gets no
  subject forms. It emits the stored `mover-se` / `estar movendo-se` for every person, and `ter
  movido` with no clitic.

| Clause | Now | Want |
|---|---|---|
| progressive, 1sg | `estou movendo-se.` | `estou movendo-me.` |
| prospective, 1pl | `estamos prestes a mover-se.` | `estamos prestes a mover-nos.` |
| MUST, 1sg | `devo mover-se.` | `devo mover-me.` |
| MUST + progressive, 1sg | `devo estar movendo-se.` | `devo estar movendo-me.` |
| past resultative, 3sg | `o gato tinha movido.` | `o gato se tinha movido.` |
| future resultative, 3sg | `o gato terá movido.` | `o gato se terá movido.` |
| MUST + resultative, 3sg | `a gata deve ter movido.` | `a gata deve ter-se movido.` |

Without the clitic, `tinha movido` is the pluperfect of the transitive *mover* ("had moved
something"), and `tinha tornado` of *tornar* ("had returned"), not of the reflexive verb.

Already right: the present resultative, which is the pretérito perfeito and carries the stored
clitic (`o gato se moveu`, A9); the hypothetical moods (`se o gato se movesse`, A137); the command
(`mova-se`, `movamo-nos`); every 3rd-person non-finite form except the compound ones.

The targets keep the clitic attached to the non-finite verb, as the engine already does in the 3rd
person (`deve mover-se`) and as the hypothetical test pins (`se o gato devesse tornar-se feliz`).
Brazilian usage puts it before the non-finite verb instead (`estou me movendo`, `devo me mover`,
`tinha se movido`). Either is standard, but one should be chosen for the whole engine.

The verb.conjugation snapshot (`test/__snapshots__/verb.conjugation.test.ts.snap`, BECOME) records
the wrong forms (`estou tornando-se.`, `estou prestes a tornar-se.`, `tinha tornado.`, `terei
tornado.` and their persons). They change with the fix.

Found while seeding MOVE_ONESELF for localization C17.

## Shape of the fix

Mirror Spanish ([A102](../fixed/A102-spanish-reflexive-nonfinite.md), [A30](../fixed/A30-romance-pronominal-clitic-compound-past.md)):

- A `reflexiveNonfinite(form, verbForms, subjectForms)` that strips the stored `-se` from an infinitive
  or gerund and attaches `reflexiveClitic(verbForms, subjectForms)` with a hyphen (`mover` + `me`).
  `ter` takes it the same way in a modal's perfect (`ter-se movido`).
- `aspectVerb` uses it for the progressive and the prospective, and puts the clitic before `ter` in
  the past and future resultative (`se tinha movido`), where Spanish puts it before `haber`.
- `verbGroupInfinitive` takes the subject forms from `predicateText` and uses the helper.

| | |
|---|---|
| **Test** | `reflexive.test.ts` → *known bugs: Portuguese reflexive verb in a non-finite verb group* (3 `test.fails`, plus a regression test for the finite tense, the present resultative and the command) |

## Resolved

Fixed on 2026-09-20, mirroring Spanish's A102 and A30:

- New [`pt/reflexiveNonfinite.ts`](../../../packages/engine/src/languages/pt/reflexiveNonfinite.ts)
  strips the stored 3rd-person '-se' and re-attaches the subject's clitic with a hyphen
  ('mover-me', 'movendo-nos'); a form with no '-se' takes it the same way, which is how 'ter'
  carries it in a modal's perfect ('ter-se movido').
- [`aspectVerb`](../../../packages/engine/src/languages/pt/aspectVerb.ts) uses it for the
  progressive and the prospective, and puts the clitic before the finite 'ter' in the past and
  future resultative ('se tinha movido'), where Spanish puts it before 'haber'.
- [`verbGroupInfinitive`](../../../packages/engine/src/languages/pt/verbGroupInfinitive.ts) takes the
  subject forms from `predicateText` and uses the helper throughout.

The clitic stays **attached** to the non-finite verb, which is what the engine already did in the 3rd
person ('deve mover-se') and what `hypothetical.test.ts` pins; Brazilian usage would put it in front
('devo me mover'). Both are standard, and the engine now says so in one place.

Guarded by `reflexive.test.ts` → *known bugs: Portuguese reflexive verb in a non-finite verb group*:
the three former `test.fails` now pass, plus every person, a modal over each aspect, the future
perfect, a negation and a relative clause, with regressions that the finite tenses, the present
resultative, the command and the 3rd person are unchanged and that a non-reflexive verb takes no
clitic. `reflexiveNonfinite.test.ts` and `verbGroupInfinitive.test.ts` pin the helper directly.

Expected re-record: `verb.conjugation.test.ts.snap` held 24 BECOME lines with the wrong forms
('estou tornando-se.', 'tinha tornado.'); all 24 are the fix.
