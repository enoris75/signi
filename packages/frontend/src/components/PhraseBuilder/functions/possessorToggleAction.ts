import { POSSESSOR_KEY, POSSESSOR_REF_KEY, type NounKey, type PhraseSelection } from "../interfaces.ts";

/**
 * What the possessor control on a noun's dotted ring does when clicked. One control fills the owner
 * either way: opening it draws an empty owner ring — its word picker, to name the owner — and lights
 * up the nouns it could point to instead (`openAndPick`). Once named, the control folds the owner's
 * ring away and back like any satellite, keeping the owner (`fold`, `open`); a pointed-to owner has no
 * ring to fold, so the control takes it away (`remove`).
 *
 * `open` is whether the user opened (true) or folded away (false) the owner; unset, a named owner
 * shows and an empty one doesn't.
 */
export function possessorToggleAction(
  selection: PhraseSelection,
  which: NounKey,
  open: boolean | undefined,
): "remove" | "fold" | "open" | "openAndPick" {
  if (selection[POSSESSOR_REF_KEY(which)]) return "remove";
  const named = Boolean((selection[POSSESSOR_KEY(which)] as PhraseSelection | undefined)?.subject);
  if (open ?? named) return "fold";
  return named ? "open" : "openAndPick";
}
