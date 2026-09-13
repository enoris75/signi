# A90. French "ou" subjects of different persons: the verb and the resumptive clitic disagree

**Language:** French (the shared agreement rule may affect Italian, Spanish and Portuguese too; see below)

Subjects of different persons joined by `ou` take a plural verb in the prevailing person, as with
`et` (Grevisse, *Le Bon Usage*; OQLF *Banque de dépannage linguistique*): `toi ou moi, nous
mangeons`. Two pieces of code disagree here:

- **Agreement:** the shared `groupAgreement` (`packages/engine/src/translator.ts`) makes every `or`
  group agree with its last conjunct, singular.
- **Resumption:** French `subjectText` (`languages/fr/subjectText.ts`) resumes any 1st- or 2nd-person
  group with the plural clitic `nous`/`vous`, assuming the group is plural as under `et`.

The result is a plural clitic with a singular verb, or no plural at all when the 1st person comes
first.

| Subject | Now | Want |
|---|---|---|
| FIRST_PERSON or SECOND_PERSON | `moi ou toi, vous manges.` | `moi ou toi, nous mangeons.` |
| SECOND_PERSON or FIRST_PERSON | `toi ou moi, nous mange.` | `toi ou moi, nous mangeons.` |
| CAT or FIRST_PERSON | `le chat ou moi, nous mange.` | `le chat ou moi, nous mangeons.` |
| FIRST_PERSON or CAT | `moi ou le chat mange.` | `moi ou le chat, nous mangeons.` |

Already right: `et` groups (`moi et toi, nous mangeons.`) and `ou` groups of the same person
(`le chat ou le chien court.`).

The last-conjunct rule is documented in `translator.ts` as common to all six languages. For mixed
persons the Italian and Spanish outputs look questionable too (`io o tu mangi.`, `yo o tú comes.`),
but only French shows an internal contradiction, and only French is pinned.

## Shape of the fix

For an `or` group whose conjuncts differ in person, French resolves like `and`: plural, lowest person.
Do this in `groupAgreement` behind a per-language switch, or re-resolve the agreement in the French
engine before `predicateText`. `subjectText` then resumes as it already does. An `or` group of a
single person keeps the nearest-conjunct rule.

| | |
|---|---|
| **Test** | `coordination.test.ts` → *known bugs: French disjunction of different persons* (1 `test.fails`) |

## Resolved

Fixed 2026-09-13 with the first shape the fix proposed: a per-language switch in `groupAgreement`
([`translator.ts`](../../../packages/engine/src/translator.ts)). The new `OR_RESOLVES_MIXED_PERSONS`
lists `fr`. For those languages, an `or` group whose conjuncts differ in person resolves as `and` does:
plural, the lowest person, and feminine only if every conjunct is. French `subjectText` then resumes
the group with `nous` / `vous` unchanged, so the clitic and the verb agree.

Every row now renders as wanted. The fix also covers:

- the second person (`toi ou le chat, vous mangez`);
- gender (`toi ou la femme, vous êtes fatiguées`);
- the compound past (`moi ou toi, nous sommes allés`);
- negation;
- a resumed object (`le chat nous a vus, toi ou moi`).

An `or` group of one person keeps the nearest-conjunct rule (`le chat ou le chien court`, `le chat ou
les chiens courent`).

Italian, Spanish and Portuguese are untouched, still `io o tu mangi.`. The bug file flagged that output
as questionable but pinned only French, so it is not asserted either way.

- **Tests:** [`packages/engine/test/coordination.test.ts`](../../../packages/engine/test/coordination.test.ts)
  → *known bugs: French disjunction of different persons*. The pinning `test.fails` is now a passing
  `test`. New cases cover the second person, gender, the compound past, negation and the resumed
  object, with a guard for a group of one person.
- No colocated unit test: `groupAgreement` is private to `translator.ts`, which has no unit test file.
  The sentence-level tests drive it through `translate`.
