# B7. Japanese drops `aspect` under a modal

**Documented simplification — do NOT fix without a product decision.**

| | |
|---|---|
| **Behaviour** | Japanese drops `aspect` under a modal: `猫は食べる必要があります` renders identically whatever the aspect |
| **Correct target / rationale** | `ja.ts`: "Known gap: `aspect` is dropped under a modal. Stacking `〜ています` inside `〜必要がある` is not built." The other six compose the two ("must have eaten"). |
| **Test** | `modals.test.ts` → *documented simplifications: modals* (1) |
