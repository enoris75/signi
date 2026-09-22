# C38. MR — a title before a name, and the corpus has no names

**Kind:** blocked on a construct. P09's *Mr* ranks high only because the frequency list is
news-heavy, and it cannot be used without a personal name to precede.

_(from the P09 core-vocabulary sweep of 2026-09-22; [P09](../../features/P-planning/P09-core-vocabulary/README.md)
§3, **E11**.)_

## The concept

| concept | role | proposed forms (suggestions, not renders) |
|---|---|---|
| MR | noun (a title) | Mr, signor(e), M. / monsieur, Herr, señor, 〜さん (after the name), senhor |

## Blocked on

**Personal names.** The corpus's proper nouns are the continents, the countries and the languages;
no person has a name, so there is nothing for a title to precede, and nothing to probe. The title
itself also behaves unlike any seeded noun:

- it **fuses** with the name as one noun phrase, taking the name's role and the title's agreement;
- Italian drops its final *-e* before a name (*il signor Rossi*, but *il signore*);
- Spanish and Portuguese put the article before it when speaking *of* the person (*el señor García*,
  *o senhor Silva*) and drop it in address;
- Japanese puts it **after** the name, as a suffix (田中さん), and uses it for any person, not only
  men.

## What would move it

Personal names first — proper nouns with the `human` flag, which the builder can place like any
noun — and then a title modifier on a proper noun phrase with the four behaviours above. MR's gloss
would then be probed. "A title before a man's name" would stand on TITLE, which
[C23](../done/C23-participial-state-adjectives.md) seeded as a saved phrase's name (for UNTITLED):
check that each language's word also means a form of address before using it.
