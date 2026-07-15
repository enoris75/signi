# A11. Modal chains stack suffixes into non-words (`できたい`, `たいこと`)

**Language:** Japanese

Japanese modality is suffixal, so a **chain** has to nest suffixes; the engine glues them naively.
`WILL`+`CAN` → `できたい` (`たい` is an i-adjective and cannot suffix `できる`); `CAN`+`WILL` →
`食べたいことができます`.

| | |
|---|---|
| **Want** | Asserted negatively (idiomatic form, e.g. `食べられるようになりたい`, is a design call): the output must not contain `できたい` / `たいこと`. |
| **Test** | `modals.test.ts` → *known bugs: modals* (2 tests) |
