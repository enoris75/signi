# P04-E9. Sursilvan's predicative adjective — *il paun ei buns*

**Feature:** a Sursilvan adjective in predicate position takes its predicative form (*buns*), and the
attributive form everywhere else (*in paun bun*).
**Shape:** a new axis in the adjective model: the engine knows, for each adjective it renders, whether it
is attributive or predicative, and a language may give the two different forms.
**Scope:** shared engine types, the translator's resolution of the predicate, `rm-sursilv` only for
forms. Every other engine unchanged.
**Status:** open. Filed 2026-09-27 from P04's second engineering argument and phase 1. Depends on E5
(`predicative_masc_sg`) and E8.

| plan | `rm-rumgr` | `rm-sursilv` *(verify)* |
|---|---|---|
| a good bread | in paun bun | in paun **bun** |
| the bread is good | il paun è bun | il paun ei **buns** |
| the bread becomes good | il paun daventa bun | il paun daventa **buns** *(verify)* |
| I find the bread good (object predicative) | … | *?* |

## Why

P04: *"No existing engine distinguishes attributive from predicative adjective forms … This is a new
axis in the adjective model, and it is why Sursilvan cannot be a lexical column on an RG engine."* It is
the one genuinely new piece of grammar in P04.

## Today

Verified at HEAD (98a65a47), 2026-09-27.

- P04's link to `types.ts:290` is stale. The adjective agreement an engine reads comes through
  `renderWord` and the resolved forms ([`types.ts:575-588`](../../../../packages/engine/src/types.ts#L575-L588));
  nothing on a resolved adjective says where it stands.
- The translator already resolves **predicative** complements separately
  (`translator/functions/predicativeGovernor.ts`, `resolvePhrase.ts`) — the position is known at
  resolution; it is not handed to the engine's adjective form choice.

## Design

### D1. Where the flag lives

**Recommendation:** a `position?: 'predicative'` on the resolved adjective, set by the translator
wherever it builds a predicate (copula, BECOME, object predicative) and absent everywhere else, so the
seven ready engines need no change and read nothing new. `rm-sursilv`'s `agreeAdj` fork reads it and
picks `predicative_masc_sg` for a masculine singular.

### D2. Which predicates

Copula and BECOME for certain. **Open points for the reviewer (E19):** the object predicative (*I find
it good*), the predicative complement of §2.3, and whether the masculine plural differs. Each unknown
case renders the attributive form and is pinned `test.fails`.

### D3. Not an RG or Vallader feature

Unless E3's sources say otherwise, only `rm-sursilv` reads the flag. If a source shows Vallader or RG
has a trace of it, file it on that variety's suite; do not generalise here.

## Tests

- A translator unit test: the flag is set on copula and BECOME predicates and nowhere else.
- `rm-sursilv.test.ts`: the table above.
- The seven ready languages' exhaustive tests unchanged — the proof no engine read the flag.

## Verification

Engine suite green; the Sursilvan row reads *il paun ei buns*, the RG row *il paun è bun*.

## Out of scope

Copula forms themselves (E10). Any other variety's predicative agreement.
