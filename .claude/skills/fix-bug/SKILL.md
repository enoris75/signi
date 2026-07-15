---
name: fix-bug
description: Fix one catalogued engine-grammar defect by its id (e.g. A25). Verifies the bug file and its pinning test still describe a live defect, fixes the engine, updates and extends the tests, then retires the bug file to docs/bugs/fixed/ and updates the index. Use when the user says "fix bug A25", "/fix-bug A9", "resolve defect A17", or names a bug id from docs/bugs/.
---

# Fixing a catalogued grammar defect

Every known engine defect is catalogued one-per-file under [docs/bugs/](../../docs/bugs/) and pinned
by a `test.fails` in [packages/engine/test/](../../packages/engine/test/). This skill takes **one bug
id** (e.g. `A25`, or a range like `A2-A4`) and drives it from "documented defect" to "fixed, tested,
and retired from the catalogue."

Read [docs/bugs/engine-grammar-bugs.md](../../docs/bugs/engine-grammar-bugs.md) first — it is the
index and explains the encoding. The essentials:

- Each defect is a `test.fails` asserting the **correct** output. The suite is green today because
  the assertions are expected to fail. **When you fix the engine, Vitest reports the test as
  *"expected to fail but passed"* — that is the signal to delete the `.fails` marker**, turning it
  into an ordinary passing test. Never delete the test itself, and never weaken an assertion to make
  it pass.
- Defects are classified by the id prefix and the `describe` block name:
  - **`A*` → `A-must-fix/`** (`known bugs: …` blocks) — genuine defects. **These are the only ones
    this skill fixes.**
  - **`B*` → `B-can-fix/`** (`documented simplifications: …`) — the engine does this **on purpose**.
    **Do not "fix" these without a product decision.**
  - **`C*` → `C-do-not-fix/`** — looks wrong, is right. Verified correct.

## Guardrails — check the class before touching anything

1. **`B*` or `C*` id** → **stop.** Do not fix it. Tell the user this is a documented simplification
   (B) or verified-correct behaviour (C), quote the file's rationale, and ask them to confirm a
   product decision before proceeding. B and C are not bugs.
2. **Unknown id** → the file does not exist under any subdirectory. Stop and say so; list the nearby
   ids from the index so the user can correct the reference.
3. **Already fixed** → the file is already in `docs/bugs/fixed/`, or its test no longer carries
   `.fails`. Report it as already resolved; do not redo it.

## Steps

### 1. Locate and read the bug file
Resolve the id to a file: `docs/bugs/A-must-fix/<id>-*.md` (the id is zero-padded in the filename,
e.g. `A25` → `A25-english-superlative-indefinite-article.md`; `A2-A4` →
`A02-A04-…`). If it is not under `A-must-fix/`, apply the guardrails above. Read the file — the
**Want** row is the correct target, the **Test** row names the test file and the `describe` block
(and how many `test.fails` back this defect). Note that one file can pin several tests (e.g. `A2-A4`,
`A29`).

### 2. Confirm the defect is still live
Run the pinning test(s) and confirm they still fail as expected:

```
npm run typecheck            # from repo root — Vitest does NOT typecheck; a bad literal takes a fallback path and lies
npm run test:unit            # whole suite (~300ms), or: npx vitest run <the named test file>
```

The suite should be **green** (every `test.fails` failing as designed). If the named test already
passes without `.fails`, the bug is already fixed — stop and report that (guardrail 3). If typecheck
fails, fix that first; a plan built on an invalid literal makes a working feature look broken.

### 3. Fix the engine
The engine is [packages/engine/src/](../../packages/engine/src/): one module per language
(`languages/{en,it,fr,es,pt,de,ja}.ts`), with shared plumbing in `translator.ts` (resolves a
`PhrasePlan` into per-language `ConceptForms`) and `mood.ts`; the plan model is typed in
[packages/shared/src/index.ts](../../packages/shared/src/index.ts). Edit the language module named by
the bug's **Language** row. Make the **Want** row true; change nothing else. A few defects (A7, A8,
A21) need a corpus/schema change, not just an engine edit — the bug file says so; follow it.

### 4. Verify, then flip the marker
```
npm run typecheck && npm run test:unit
```
The fixed test now reports **"expected to fail but passed"**. Delete only its `.fails` marker
(`test.fails(` → `test(`), leaving the assertion untouched. If the file pins several tests, flip each
one that now passes. Re-run `npm run test:unit`: it must be **green** with no `.fails`-passed
warnings and no collateral failures in other tests.

### 5. Extend the tests
Add coverage the original `test.fails` did not — the point is that the fix stays fixed. Put new
`test(...)` cases (not `test.fails`) in the **same `describe` block / test file**, asserting the
*actual* rendered output (run first, read what the engine produces, then assert it — never guess
foreign-language strings).

> **Reading engine output:** Vitest swallows `console.log`. To see what the engine actually renders
> for a plan, drop a throwaway test in `packages/engine/test/` that asserts the value against a
> sentinel — `expect(sayAll(...)).toBe('SHOW')` (or `expect({...bag of cases}).toBe('SHOW')`) — and
> read the real strings out of the assertion diff. Delete the throwaway file before moving on.

Good extensions: the sibling forms the fix should also cover (other
degrees, persons, genders, the other Romance languages if the defect was Romance-wide), and a
regression guard that the previously-correct neighbouring behaviour is unchanged. Match the depth of
the neighbouring cases. If the defect is genuinely a single output with nothing to generalise, say so
rather than padding.

### 6. Retire the bug file
- Create `docs/bugs/fixed/` if it does not exist, and **move** the bug file there (preserve its
  filename): `git mv docs/bugs/A-must-fix/<file> docs/bugs/fixed/<file>`.
- Append a resolution note to the moved file: an `## Resolved` section with the date
  (today is available in context), the engine file(s) changed, and the tests now guarding it.
  **Fix the relative-link depth for the new location:** a file in `fixed/` is one directory below
  `docs/bugs/`, so links back to the repo root need `../../../` (e.g.
  `../../../packages/engine/src/languages/en.ts`), not the `../../` an `A-must-fix/` file would use.
- Update [docs/bugs/engine-grammar-bugs.md](../../docs/bugs/engine-grammar-bugs.md): remove the
  defect's row from the **Part A** table and add it to a **"Fixed"** section (create the section if
  absent) with a link to its new `fixed/` path. Keep the running count in the prose accurate (the
  intro says "76 of them" / "31" Part-A entries — decrement Part A). If the id appears in the
  "Suggested order" prose, leave that history alone.

## Definition of done

- `npm run typecheck && npm run test:unit` both pass, with **no** `test.fails`-passed warnings and no
  new failures anywhere in the suite.
- The formerly-`.fails` test(s) for this id are now plain passing `test(...)`, with the assertions
  unchanged, plus at least one added test where the fix generalises.
- The bug file lives in `docs/bugs/fixed/` with a `## Resolved` note, and no longer appears in the
  Part A table of the index; the index's Part A count is decremented and a Fixed entry links to it.
- Only the one defect was addressed. No assertion was weakened, no other bug's test was touched, and
  no B/C defect was "fixed".
