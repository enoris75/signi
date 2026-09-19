# P02. Phrase console — type the phrase, see it on the canvas, and back

**Feature:** a terminal-like console docked under the page, where a period is built with a small
command language — `/subj ( cat /adj brown /pl ) /verb ( eat /past ) /obj ( food )` — with
type-ahead and completion at every position. The console and the canvas are **two views of one phrase**: typing
previews on the canvas, and every canvas action is written back to the console as the command it
equals.
**Shape:** a pure text ⇄ selection layer (parse, complete, apply, print) over the existing reducers,
and one console component. No change to the engine, the API or the saved-phrase format.
**Relation to [P01](../P01-keyboard-first-ux/README.md):** P01 keeps the canvas itself fully reachable from
the keyboard (cursor, focus ring, key tips, box letters). The console is the fast path, and it
replaces P01's command palette and hint bar.
**Status:** phases 1–6 shipped — the console builds, previews and edits every
part of a phrase the canvas can, and writes every canvas change back as the command it equals. See
[Phases](#6-phases) for what each covered, and the notes under the table for what the plan left open.
**Drawings:** [`artwork/`](artwork/) — six images exported from page *Phrase console (P02)* of
the [design canvas](https://claude.ai/code/artifact/7a68e65c-9f8b-44c0-b02c-8e4c4224dc8f), embedded in
the sections they illustrate. They show the flat lines of phases 1–5; the bracketed lines of phase 6
are described in the text.

---

## Decisions

Settled on 2026-09-13:

| # | Decision | Consequence in this plan |
|---|---|---|
| 1 | The console follows the **page theme** (paper), not a dark terminal. | Same tokens as the rest of the app; slot colours used exactly as the boxes use them. |
| 2 | **No bare words.** Every line starts with a command (or a `#reference`). | Words appear only as arguments. Typing a word without a command is met by completion, not parsed (§2.4). |
| 3 | **Command names are English** for every interface language. | Long English aliases exist; aliases in the interface language may come later. |
| 4 | The text form is **not a save format** for now. | Saved phrases stay JSON; no `.signi` files until the feature has matured. Multi-line paste still works. |
| 5 | **Type-ahead and command completion** are part of the console, not polish. | §2.4; shipped in phase 2 with the first console. |
| 6 | **<kbd>&#96;</kbd> shows and hides the console.** | §2.1. Matched by key position (the key below <kbd>esc</kbd>), so it works on layouts without a backtick. Once shown, the console stays shown until it is hidden. |
| 7 | **Structured lines** (2026-09-19). Every word of the period is written in its own bracket, with what describes it. The bracket's shape says what it holds: `( )` a word, `[ ]` a noun phrase hanging off a noun, `{ }` a period of its own. | §3. The console opens brackets itself and any bracket key types the right one, so none needs AltGr. Inside a bracket, completion offers only what fits there. Flat lines still read, so old pastes keep working. |

## Why

- **The canvas shows structure; typing is fastest to compose.** Today a word is typed but
  everything around it is clicked. Letter shortcuts (P01) help, but they must be memorised per box
  type and still take one action per control.
- **Commands take arguments.** An adjective is `/adj brown` — not "reveal the adjective box, open its
  picker, type, choose". A whole noun phrase is one line.
- **Discoverable without memorising.** Completion lists what fits at the caret, with current values.
  No modifier chords, so nothing differs between macOS, Windows and Linux, or between keyboard layouts.
- **It is plain text in a text field** — the most accessible input there is.

## 1. How it feels

| Typed in the console | What the canvas does | What the console shows |
|---|---|---|
| <kbd>&#96;</kbd> | The console slides up under the page. | The caret is in the prompt. |
| `/su` <kbd>⇥</kbd> `ca` <kbd>⇥</kbd> | Nothing yet. | `/` opens the command list; `/subj cat` — each <kbd>⇥</kbd> accepts the ghost. |
| ` /adj br` <kbd>⇥</kbd> ` /pl` | *cat* and *brown* appear as dashed preview boxes; translations preview. | The ghost and list follow every keystroke. |
| <kbd>↵</kbd> | The boxes become real; the cursor moves to the Verb. | `› /subj cat /adj brown /pl` — *the brown cats.* |
| `/verb eat /obj food` <kbd>↵</kbd> | Verb and object filled. | *the brown cats eat the food.* |
| *(click the polarity control on eat)* | eat turns negative. | `⌖ /not · eat` — *the brown cats do not eat the food.* |
| `/modal ca` <kbd>⇥</kbd> <kbd>↵</kbd> | A modal box *can*, previewed then committed. | *the brown cats cannot eat the food.* |
| `/subj /rel obj ( /subj dog /verb see )` <kbd>↵</kbd> | A second period appears, already linked to *cats* as a relative clause. | *the brown cats that the dog sees cannot eat the food.* |
| <kbd>↑</kbd> | — | The previous line comes back from history. |
| <kbd>esc</kbd> <kbd>&#96;</kbd> | The page gets its full height back; the cursor is on the canvas again. | esc clears the line; &#96; hides the console. |

(Sentences are sample renderings.)

## 2. The console

### 2.1 Placement and states — *artboard "Console and canvas together"*

![The console docked under the page, previewing a modal on the canvas, with completion open](artwork/01-console-and-canvas.png)

Docked to the bottom of the viewport, full page width (stopping at the words panel when it is open),
on the page's paper with the source strip on the canvas colour. The page gains bottom padding equal
to the console's height so nothing hides under it.

- **<kbd>&#96;</kbd> shows and hides it.** From anywhere, <kbd>&#96;</kbd> shows the console and puts the caret
  in its prompt. If the console is shown but focus is elsewhere, <kbd>&#96;</kbd> takes focus instead of
  hiding it (so a keystroke never hides what you meant to type into). If the prompt already has focus,
  <kbd>&#96;</kbd> hides the console and gives focus back to the canvas cursor.
- **<kbd>/</kbd>** outside a text field does what <kbd>&#96;</kbd> does, with `/` already typed and the command
  list open.
- **Shown:** title row, transcript, source strip and prompt. It stays shown when focus goes back to the
  canvas; its prompt line then doubles as P01's hint line, listing the keys of the box under the
  cursor. The grip resizes it. Height and shown/hidden are remembered (`signi:consoleHeight`,
  `signi:consoleOpen`, like `signi:graphHeight`); it is shown on the first visit.
- **Hidden:** nothing is docked and the page gets its full height back. The header's Console button
  carries the <kbd>&#96;</kbd> keycap and toggles it for mouse users.
- **The key is physical.** <kbd>&#96;</kbd> is matched by `event.code === "Backquote"` — the key below
  <kbd>esc</kbd> — not by the character typed, because many layouts have no plain backtick (Italian) or
  make it a dead key (German, French, Spanish). On macOS with ISO keyboards browsers report that key
  as `IntlBackslash`, so both codes are accepted there (to verify on real keyboards in QA). The key is left alone while focus is in any
  other text field (a picker, the save dialog), where it still types its character.

```
╭─ grip ─────────────────────────────────────────────────────────────────────────────────╮
│ ▣ CONSOLE  period 1                                     [`] hide  [esc] back   ⌄      │  title
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ›  /subj cat /adj brown /pl                                   the brown cats.          │  transcript
│ ›  /verb eat /obj food                                        the brown cats eat the food.
│ ⌖  /not   from the canvas · eat                    ┌─────────────────────┐ do not eat…  │
├────────────────────────────────────────────────────│ MODALS FOR EAT      │─────────────┤
│ 1 │ /subj cat /adj brown /pl ▒/verb eat /not▒ /obj  │ can      ability    │  /edit      │  source strip
├────────────────────────────────────────────────────│ must     obligation │─────────────┤
│ 1 · VERB eat ›  /modal ca▏n                         │ want     volition   │  [⇥] [↵]    │  prompt + list
╰────────────────────────────────────────────────────└─────────────────────┘─────────────╯
```

### 2.2 Anatomy — *artboard "The console"*

![The console's states: at rest, typing, a mistake, editing the source, picking a link; token colours](artwork/04-the-console.png)

- **Context chip** `1 · VERB eat ›` — where the next command will attach: the console's equivalent
  of a working directory. It follows the canvas cursor and moves it. Inside brackets it shows the path
  in: `1 › rel › 2 · OBJ cat ›` (§3, Subordinate phrases).
- **Prompt** — syntax-coloured as you type, with the type-ahead ghost after the caret (§2.4).
- **Diagnostics** — a wavy underline and one line saying what is wrong and how to fix it:
  *`/past` sets a verb's tense, and food is a noun. Put it after eat, or write `/verb /past`.*
  The valid part before the error still previews; <kbd>↵</kbd> is refused until the line parses.
- **Transcript** — typed lines (`›`), echoes of canvas actions (pointer glyph), errors; the right
  column is the period's sentence in the interface language after the change.
- **Source strip** — the focused period's canonical text, on the canvas colour. The cursor's box is
  washed; hovering a token lights its box and vice versa; clicking a token moves the cursor.
  `/edit`, or a click on the strip, loads the whole source into the prompt; <kbd>↵</kbd> replaces the period.

### 2.3 Tokens wear their box's colour

| Token | Colour (from `slots.ts`) |
|---|---|
| `/subj` and its word | primary `#2c4a6e` / word `#1a2f46` |
| `/verb`, `/modal` and words | secondary `#8b3e2a` / `#5e2a1c` |
| `/obj` and its word | success `#3a6e3a` / `#294d29` |
| complements (`/loc`, `/dir`, …) | warning `#8b6914` / `#61490e` |
| `/adj` and its word | error `#8b1a1a` / `#611212` |
| `/adv` and its word | info `#2a6e7c` / `#1d4d57` |
| settings (`/pl`, `/past`, `/the`) | text.secondary `#6b6459` |
| references (`#2.obj`) | info, dotted underline |

Type: **IBM Plex Mono** (added to `index.html` next to Lora / Playfair / Inter), words in its italic.

### 2.4 Completion and type-ahead — *artboard "Completion and type-ahead"*

![Completion and type-ahead at each caret position, history, and the console's keys](artwork/03-completion-and-type-ahead.png)

The console completes at every keystroke. Two things show at once:

- **The ghost** — the single best completion, drawn faintly after the caret (`/modal ca▏n`).
- **The list** — every candidate for the token at the caret, in a popover above it, narrowed as you
  type. It opens by itself after `/`, after a role command and its space, after `#`, and after a
  command that takes a value; <kbd>⇥</kbd> opens it anywhere else.

#### What is offered where

| Caret is at… | Candidates | Source |
|---|---|---|
| `/` or `/partial` | Commands valid for the context: a noun gets `/adj /pl /fem /the /poss /rel /and …`, a verb gets `/modal /adv /past /not …`, a period gets `/command /if /join …`; app commands always. Each row shows the current value it would change (*`/pl` plural · now singular*). | `language/commands.ts` filtered by context kind and `when` (the same availability as `Satellite.available`) |
| the argument of a role command (`/adj b`) | Words of that role in the interface language: nouns for `/obj`, adjectives for `/adj`, modals for `/modal`, nouns *and* pronouns for `/subj` and `/cause`. Hovering a row shows its definition, as in the pickers. | `useConcepts(role)` + `useConceptSearch` + `slotCategories` — the pickers' own data and matcher |
| the argument of a value command (`/join `, `/command `, `/level `, `/lang `, `/load `, `/help `) | The allowed values — only the four conjunctions two commands can take when the period is a command; saved-phrase names for `/load`. | `COORD_CONJUNCTION_OPTIONS` / `coordConjunctionOptions`, `ABSTRACTION_LEVELS`, languages, saved phrases |
| after `/rel `, `/if `, `/inst `, `/join and `, `/poss `, `/and ` | New phrases first — `subj (` and `obj (` for `/rel` (*new clause · child is its subject*), `(` for the others — then the existing periods the link rules allow, numbered. | `commands.ts` + `linkRules.ts` |
| inside a bracket | What fits there: in a word's `( … )` that word's commands, in `[ … ]` a noun's, in `{ … }` a period's. The first word of `( … )` or `[ … ]` is the command's word, completed as its role's. The ghost offers the closer, in its shape, where the line has left one open. | the bracket stack from the lexer; the frames `apply` leaves |
| `#` or `#2.` | Periods, then their nouns — for link commands only the targets the link rules allow, numbered (*1 #2.subj dog*, *2 #2.obj cat*); a digit picks. | `linkRules.ts` (extracted from `useWorkspaceLinks`) |
| a word typed without a command (`ca`) | *Did you mean* — the role command for the box under the cursor: `/subj cat`. The line itself never keeps a bare word. | context + that role's vocabulary |
| an empty prompt, ↑ / ↓ | Earlier lines from history (§ History). | `history.ts` |

#### Ranking

1. exact match → prefix of the canonical name → prefix of an alias (`/plural` finds `/pl`; choosing it
   inserts `/pl`) → word-start → subsequence;
2. then commands used recently in this session;
3. then the order the canvas uses (reading order for references, menu order for values, the
   vocabulary's order for words).

The ghost is the top candidate. If the vocabulary has nothing better, the ghost offers the most
recent history line starting with what was typed.

**Before anything is typed** (just `/`, or ⇥ between commands), the commands come **topic by topic**
instead, each topic headed. The closest word's topics come first, then the other words', then the
period's words, the period, and the workspace. Within a topic:
- A setting's command comes first (`/tense`, showing what the verb holds now).
- Its shortcuts follow in their natural order, each saying what it is short for: `/past`
  `= /tense past`.

The help overlay's reference uses the same topics. The topics are defined in the catalogue
(`TOPICS`, `topicOf`, `shortcutOf`).

#### Keys inside the console

| Keys | Action |
|---|---|
| *type* | Type-ahead: the ghost updates and the list narrows |
| <kbd>⇥</kbd> | Accept the ghost or the highlighted row. When several candidates share a start, complete the shared part and open the list. With nothing typed at the caret, or a word selected, go to the next command or word and select it, or step past the next closing bracket. At the end of the line, open the list. On an empty line, offer the pinned and recent lines. |
| <kbd>⇧⇥</kbd> | Go to the previous command or word |
| <kbd>→</kbd> in front of the rest | Accept the ghost (at the end of the line, or with only closing brackets after the caret) |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Move in the list · move between the rows of a wrapped line · walk history from its first or last row |
| <kbd>↵</kbd> | Choose the highlighted row · run the line when no list is open |
| <kbd>⇧↵</kbd> | Break the line: inside a bracket it is a space, outside one it starts the next period |
| <kbd>1</kbd>–<kbd>9</kbd> | Pick a numbered reference (while a reference list is open) |
| <kbd>esc</kbd> | Close the list · then clear the line · then return to the canvas (the console stays shown) |
| <kbd>&#96;</kbd> | Hide the console; from outside it, show it or take focus (§2.1) |
| <kbd>/</kbd> | From outside the console: show it with a command started |

#### History

- Each line run from the console is kept; canvas echoes are not.
- Stored per browser in `localStorage["signi:consoleHistory"]`, newest first, the last 100, with
  consecutive duplicates collapsed.
- <kbd>↑</kbd> on a prompt with no list open walks back; a tag shows the position (*history · 2 of 14*).
  Editing a recalled line leaves history untouched.

#### How it is built

`language/complete.ts` is pure:

```ts
complete(text: string, caret: number, ctx: ConsoleContext, state: WorkspaceState, vocab: Vocabulary)
  → { replace: [from: number, to: number], candidates: Candidate[], ghost?: string }
```

It reuses the lexer's spans to find the token at the caret and what kind of argument that position
expects, so completion and parsing can never disagree about the grammar. The vocabulary is the
react-query cache the pickers already fill, so completion needs no extra request and runs
synchronously on every keystroke.

---

## 3. The language — *artboard "The phrase language"*

![Reference sheet of the phrase language: shape, examples and commands](artwork/05-the-phrase-language.png)

### Shape

```
line        = item …
item        = /command [argument]  ·  #reference
argument    = a word (the text up to the next / or #)  ·  a value  ·  a #reference  ·  bracket
bracket     = ( [word] line )  ·  [ [word] line ]  ·  { line }
#reference  = #2  ·  #2.obj  ·  #1.subj.poss
```

**Every word of the period is written in its own bracket, with what describes it** (phase 6):

```
/subj ( man /that ) /verb ( love /adv never /past /prosp ) /obj ( cat /this /pl )
```

| Shape | Holds | Written after | Inside, the list offers |
|---|---|---|---|
| `( … )` | A word and what describes it | A role (`/subj`, `/verb`, `/obj`, complements), or an adjective or modal that has settings of its own (`/adj ( big /more )`, `/modal ( can /adv never )`) | That word's commands: a noun's adjectives, number, determiner, possessor, conjuncts, relative clause; a verb's adverb, modals, tense, aspect, polarity. Nothing of the period's. |
| `[ … ]` | A noun phrase hanging off a noun, its head word first | `/poss`, `/and`, `/or` | A noun's commands |
| `{ … }` | A period of its own | `/rel subj`, `/rel obj`, `/if`, `/join <conjunction>`, `/inst` | A period's commands |

The command says what the bracket holds, and the shape only shows it. The parser reads any shape
after any command, so `(` does for all three, and a keyboard that puts `[ ] { }` behind AltGr never
needs them. The console writes each bracket in its own shape. A line break inside a bracket is a
space; outside every bracket it ends the period. A long period may therefore run over several lines.

### The one rule

> **A command attaches to the closest word before it that can take it.**
> The box under the cursor counts as the word just before the line.

So `/subj cat /adj brown /pl /verb eat /past` gives *brown* and plural to *cat* and past to *eat*;
`/subj cat /verb eat /obj food /past` still lands `/past` on *eat*; and `/past` typed on its own with
the cursor on the verb sets that verb's tense. Settings **set** a value rather than toggling it, so a
line means the same whatever the period held before — which makes preview, replay and paste safe.

**Brackets bound the rule.** Inside a bracket, a command reaches the bracket's words alone. A
command that belongs to the period (`/verb` inside `/subj ( … )`) is refused until the bracket
closes. Once a period word's bracket closes, nothing before it is the closest word:
`/subj ( cat ) /pl` is refused, with the bracket to write it in. So a bracketed line has one reading.
The rule still decides flat lines, and a command typed on its own with the cursor on a box.

### Words

- A word argument runs to the next `/` or `#`, so multi-word labels need no quotes. It is matched
  in the interface language with the pickers' search (`useConceptSearch`), filtered by the role's
  categories (`slotCategories`).
- Concept ids work everywhere (`/subj CAT`).
- Pronouns: `/subj 1st | 2nd | 3rd | one`, with `/pl` and `/fem` as usual. Typed pronoun forms
  (*I, you, she, we, they, one*) are accepted and offered by completion.

### Commands

Names are English for every interface language. The short name is canonical (what the console
prints); each command also has long aliases (`/subject`, `/plural`, `/progressive`) that completion
matches. "Code" is the existing function each one reaches.

**Roles** — take a word; alone they only move the context

| Command | Meaning | Code |
|---|---|---|
| `/subj` `/verb` `/obj` | subject, verb, direct object | `applyConceptSelect` |
| `/pred` `/term` `/manner` | subject complement, terminus, manner | `applyConceptSelect` |
| `/loc` `/dir` `/src` `/route` `/cause` | place, direction, source, route, cause | `applyConceptSelect` |
| `/inst #n` · `/inst { … }` | instrumental: period *n*, or a new one | instrumental link (`useWorkspaceLinks`) |
| `/adj` | adjective on the closest noun (next of 3); on a noun modifier, its own adjective | `applyConceptSelect` / `setModifierAdjective` |
| `/adv` | adverb of the verb, or of the closest modal | `applyConceptSelect` (`modifier`, `verbModal*Adverb`) |
| `/modal` | modal (next of 2) | `applyConceptSelect` (`verbModal`, `verbModal2`) |
| `/poss` · `/poss [ … ]` | possessor phrase — or, with `#n.role`, a possessor that refers to a noun | nested selection / `setPossessorRef` |
| `/and` `/or` · `/and [ … ]` | coordinate another phrase | `addConjunct` + conjunction |

**Noun**

| Command | Meaning | Code |
|---|---|---|
| `/sg` `/pl` | number | `setNumber` *(new; `toggleNumber` today)* |
| `/masc` `/fem` `/neut` | gender | `setGender` *(new)* |
| `/the` `/a` `/zero` `/this` `/that` | article, demonstrative | `setDefiniteness` |
| `/some` `/no` `/many` `/few` `/all` | quantifier | `setDefiniteness` |
| `/rel #n.role` · `/rel subj\|obj { … }` | relative clause on an existing period, or a new one with the head as its subject or object | relative link (+ `addContainer`) |
| `/in` `/through` `/under` `/over` `/around` `/behind` `/front` | spatial relation (locative, route) | `setSpecifier` |
| `/because` `/fault` `/thanks` | sentiment (cause) | `setSentiment` |

**Verb**

| Command | Meaning | Code |
|---|---|---|
| `/present` `/past` `/future` | tense | `setTense` *(new; `cycleTense` today)* |
| `/neutral` `/prog` `/prosp` `/result` | aspect | `setAspect` *(new)* |
| `/tense past\|present\|future` · `/aspect neutral\|progressive\|prospective\|resultative` | the same, the setting named and its value the argument (`/aspect prog` reads too); the printer keeps the short form | `setTense` · `setAspect` |
| `/not` `/pos` | polarity | `setNegative` *(new)* |

**Adjective**

| Command | Meaning | Code |
|---|---|---|
| `/more` `/most` `/less` `/least` `/equally` | degree | `setDegree` *(new)* |
| `/feature` `/purpose` `/material` | relation of a noun modifier | `setModifierRelation` *(new)* |

**Period**

| Command | Meaning | Code |
|---|---|---|
| `/new` | new period; context on its subject | `addContainer` |
| `#n` | go to period *n* | cursor |
| `/command [you\|lets\|youall] [order\|instruction]` | command mood and addressee | `setImperative` *(new)*, `setImperativePerson`, `setImperativeRegister` |
| `/inf` · `/statement` | infinitive · back to a plain statement | `setInfinitive` *(new)* |
| `/if #n` · `/if { … }` | if-condition: an existing period, or a new one | conditional link (+ `addContainer`) |
| `/join and\|or\|but\|thatis\|therefore\|then #n` · `… { … }` | coordination with an existing or a new period | coordinative link (+ `addContainer`) |
| `/level process\|concept\|object` | reification of an instrument period | `instrumental.onLevelChange` |
| `/edit` | load this period's source into the prompt | console |
| `/del [adj 2 \| obj \| rel \| period …]` | remove what the context names | `applyClear`, `removePossessor`, `removeConjunct`, link removal, `removeContainer` |

**Workspace**

| Command | Meaning |
|---|---|
| `/save name` · `/load name` | saved phrases (JSON, as today) |
| `/export` · `/import` | JSON file (as the header buttons) |
| `/lang it` | interface language |
| `/undo` · `/redo` | history (P01 phase 5) |
| `/words` · `/help [command]` | words panel · help |

New grammar features add a command in the same change — e.g. [A01 passive voice](../../A-ready/A01-passive-voice/README.md) would add `/passive` · `/active`.

### Subordinate phrases — *artboard "Subordinate phrases"*

![Subordinate phrases: a relative clause typed in brackets, previewed as a new linked period, with forms, completion and rules](artwork/06-subordinate-phrases.png)

A clause can be written where it belongs. Braces after a link command create the new period, link
it, and hand the line back to the head when they close. A possessor or a conjunct is a noun phrase
in square brackets, its head word first:

```
/subj ( child /rel subj { /verb ( love ) /obj ( cat ) } ) /verb ( read ) /obj ( book )
→ the child who loves the cat reads the book.

/subj ( cat /rel obj { /subj ( dog ) /verb ( see ) } ) /verb ( run )
→ the cat that the dog sees runs.

/subj ( dog ) /verb ( run ) /if { /subj ( cat ) /verb ( eat ) }
→ if the cat ate, the dog would run.

/subj ( child ) /verb ( eat ) /obj ( food ) /inst { /subj ( stick ) }
→ the child eats the food with a stick.

/subj ( child /poss [ man /adj old ] /pl ) /verb ( run )
→ the old man's children run.

/subj ( dog ) /verb ( run ) /if { /subj ( cat /rel subj { /verb ( see ) /obj ( child ) } ) /verb ( eat ) }
→ if the cat that sees the child ate, the dog would run.
```

(Sample renderings.)

- **`{`** after `/rel subj`, `/rel obj`, `/if`, `/inst` or `/join` opens a new period already
  linked to the command before it. **`[`** after `/poss`, `/and` or `/or` opens a nested noun
  phrase. Where nothing but a new period may follow, the console opens the braces itself.
- **Inside**, commands attach within the brackets. The closer ends them, and what follows attaches
  to the head again: in the possessor line, `/pl` lands on *child*, not *man*.
- **`/rel subj` or `/rel obj` names the gap:** that box of the new clause takes the head's word and
  becomes the link target, exactly as a pick on the canvas makes it.
- **Brackets nest**, and <kbd>↵</kbd> closes any that are still open, so a line may end inside one.
- **The link rules still apply** (no cycles, one subordinate role per period, mood rules): a bracket
  that would break one is underlined with the rule's message, as for a `#reference`.
- **Colour:** brackets take their link's colour — relative and possessor primary, if warning,
  instrument secondary, join info — the colours of the canvas connectors.
- **Preview:** while a bracket is open, the new period is drawn as a dashed card with a dashed link to
  the head, and translations preview the whole sentence.
- **Existing periods** are still linked with references (`/rel #2.subj`); completion offers both.

### Canonical printing

`print(period)` is deterministic: subject → verb (adverb, modals, tense, aspect, polarity) →
object → complements in `COMPLEMENT_RENDER_ORDER` → period relations. Within a noun, the order is
word → adjectives → number → gender → determiner → possessor → conjuncts → relative link. Only
non-default values are printed.
- **Brackets.** Every period word is printed in its own bracket. An adjective or a modal gets a
  bracket only when something describes it in turn. A noun modifier gets one whenever anything
  follows it, so what follows stays the head's.
- **Clauses** are periods of their own, so each prints on its own line and links print as references
  (`/rel #2.subj`), never as braces.
- **Nested phrases** that live inside a period (possessors, and conjuncts carrying settings) print in
  square brackets: `/poss [ man /adj old ]`. The printer also returns a span per token →
`{containerId, slotKey}`, which drives highlighting in both directions.

**Invariant:** for every reachable state, `apply(empty, parse(print(state))) ≡ state`.

---

## 4. Keeping the two views in sync — *artboard "One phrase, two views"*

![Storyboard: type to preview, enter to commit, click to echo, point to highlight](artwork/02-one-phrase-two-views.png)

The state stays where it is: `containers` and `links` in `App.tsx`. The console never keeps its own
copy of the phrase; it derives text from state and turns text into state changes.

```
                 parse · resolve · apply (pure)
   prompt text ──────────────────────────────────▶  preview state ──▶ canvas (dashed boxes)
        ▲    ▲                                          │                translations (Preview)
        │    └── complete (pure): ghost + list     ↵ commit
        │                                               ▼
   source strip ◀──── print (pure) ◀─────────────  App state: containers + links
   transcript   ◀──── diff(print before, after) ◀──── canvas clicks
```

1. **Preview (typing).** Every change of the prompt runs `parse → resolve → apply` on the current
   state. The result is handed to the workspace and translations as a *display* state; boxes whose
   value differs from the committed state render in a new `preview` style (dashed, no halo, a
   ↵ tag). Translations for previewed periods are requested debounced (200 ms) and labelled
   *Preview*. A bracketed clause previews as a new dashed period card with a dashed link. Clearing
   the line drops the preview.
2. **Commit (↵ with no list open).** The preview becomes the state — one undo step. The typed line
   goes to the transcript and to history, with the resulting sentence, and the context advances like
   the pickers' auto-advance.
3. **Echo (canvas → console).** After any change that did not come from the console, each period's
   printed tokens before and after are diffed; the difference is written to the transcript with the
   pointer glyph (`⌖ /past · eat`; removals as `/del …`). This needs no change to the canvas
   handlers — it works from state alone.
4. **Cursor.** The canvas cursor (P01) and the console context are one value. A role command or a
   `#n` moves the ring on the canvas without taking focus from the console; clicking a box or a
   token moves both. Hover highlighting uses the printer's spans.

**A click while a line is pending** re-runs its preview and its completion on the new state. Because
settings set values, the line keeps its meaning; if its context disappeared (the box was deleted), it
shows a diagnostic.

---

## 5. Architecture

### New module — `packages/frontend/src/console/`

| File | Role |
|---|---|
| `language/commands.ts` | The catalogue: name, aliases, where it applies, argument kind (word of a role · value · reference), `apply`, `print`, description, current-value label. |
| `language/lex.ts`, `parse.ts` | Tokens with spans and a bracket stack; error recovery so the valid prefix still previews. A bracket becomes a nested op list owned by its link command. |
| `language/resolve.ts` | Words → concepts (vocabulary for the role, interface language, ids); references → `NounAddress` / container ids. |
| `language/complete.ts` | Candidates, ranking and the ghost for a caret position (§2.4). |
| `language/apply.ts` | Pure: ops + `{containers, links}` → new `{containers, links}`, via `phraseReducers` and the extracted link rules; a bracketed clause adds a container and its link in one step. |
| `language/print.ts` | Pure: state → canonical text + token spans. |
| `language/diff.ts` | Echo diffs. |
| `history.ts` | The persisted line history. |
| `PhraseConsole.tsx` | The docked panel: grip, title, transcript, source strip, prompt; shown / hidden state and the <kbd>&#96;</kbd> toggle. |
| `ConsolePrompt.tsx` | A real `<input>` with a highlighted mirror layer behind it (colours and ghost), so native editing, IME and screen readers keep working; `aria-autocomplete="both"` and `aria-activedescendant` for the list. |
| `CompletionList.tsx`, `SourceStrip.tsx`, `Transcript.tsx` | The parts. `CompletionList` reuses `ConceptOption` for word rows. |
| `useConsoleSync.ts` | Preview, commit, echo, cursor and hover mapping. |

The `language/` layer imports no React and is fully unit-testable.

### Changes to existing code

| File | Change |
|---|---|
| [`phraseReducers.ts`](../../../../packages/frontend/src/components/PhraseBuilder/phraseReducers.ts) | Set-value reducers next to today's toggles and cycles: `setNumber`, `setGender`, `setNegative`, `setTense`, `setAspect`, `setDegree`, `setModifierRelation`, `setModifierNumber`, `setImperative`, `setInfinitive`, `setNounConjunction`. The toggles become thin wrappers over them. |
| [`hooks/useWorkspaceLinks.ts`](../../../../packages/frontend/src/components/PhraseBuilder/hooks/useWorkspaceLinks.ts) | Extract the link rules (no cycles, one subordinate role per period, mood rules) into a pure `linkRules.ts`, so `apply.ts` and `complete.ts` accept exactly what a pick accepts. |
| [`App.tsx`](../../../../packages/frontend/src/App.tsx) | Own the console state and the preview; pass the display state to `PhraseWorkspace` and `useTranslations`; render `PhraseConsole`; bottom padding; the header's Console button. |
| [`PhraseWorkspace.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/PhraseWorkspace.tsx), [`PhraseBuilder.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/PhraseBuilder.tsx) | Accept `previewKeys` and `highlightKeys` per container; report and accept cursor moves. |
| [`Boxes.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/Boxes.tsx) | `SlotBox` gains `preview` and hover-`highlight` states. |
| [`ConceptOption.tsx`](../../../../packages/frontend/src/components/PhraseBuilder/ConceptOption.tsx) | Reused as the word row of the completion list. |
| [`TranslationPanel.tsx`](../../../../packages/frontend/src/components/TranslationPanel.tsx) | *Preview* label on previewed rows. |
| [`index.html`](../../../../packages/frontend/index.html) | Add IBM Plex Mono to the Google Fonts link. |
| [`phraseSerialize/`](../../../../packages/frontend/src/components/PhraseBuilder/phraseSerialize/index.ts) | Unchanged — saved phrases stay JSON (decision 4). |
| i18n | Console captions, list titles and messages through the UI-string catalogue. Command names are not translated (decision 3). |

---

## 6. Phases

| Phase | Scope | Done when |
|---|---|---|
| **1 · Language core** ✅ | Catalogue for subject, verb, object, adjectives, adverbs, modals, noun and verb settings; lex / parse / resolve / complete / apply / print; set-value reducers. No UI. | The round-trip invariant holds on generated states and on every saved-phrase fixture those commands cover; completion golden tests pass for every position kind. |
| **2 · Console with completion** ✅ | Docked console, coloured prompt, **ghost type-ahead and the completion list** (commands, role words, values), history, transcript with sentences, source strip, context chip; ↵ applies; echo of canvas actions. | A period can be built from the console alone without typing any name in full, and clicking on the canvas shows up in the console. |
| **3 · Live preview and cursor** ✅ | Preview state, dashed boxes, preview translations, diagnostics, shared cursor, hover highlight both ways, token click, `/edit`. | Typing a line previews on the canvas before ↵; esc leaves the state untouched. |
| **4 · The whole language** ✅ | Complements and relations, possessors, conjuncts, moods, periods (`/new`, `#n`), links with references and numbered completion, bracketed subordinate phrases, `/del`, workspace commands, multi-line paste. | Every control on the canvas has a command (coverage test), and a pasted multi-period script rebuilds the workspace. |
| **5 · Polish** ✅ | Recency ranking, `/help` pages, pinning, interface-language aliases if wanted. | Every command has a help page whose example the tests run; a pinned line survives a reload and comes back first. |
| **6 · Structured lines** ✅ | Every word of the period in its own bracket; `( ) [ ] { }` by what they hold; completion scoped to the bracket; brackets opened, stepped over and removed as the line is typed; commands moved out of a bracket they do not belong in; a prompt that wraps and grows, with ⇧↵; ⇥ / ⇧⇥ from word to word; the editing chip following the caret. | The round trip holds in the bracketed form (5,000 seeds); a flat line typed straight through comes out bracketed; the old flat and `( … )` lines still read. |

**What phase 1 shipped, beside the table.** The language is pure TypeScript under
`console/language/`: the files §5 names, plus `words.ts` (which kind of word each box holds, and which
commands it can take — each satellite's own `available`, restated) and `normalize.ts` (what a
workspace *says*, defaults and ids taken out, which is what "the same state" means for the round trip).
The grammar was built whole in this phase rather than in phase 4, since print and apply have to
agree on all of it for the invariant to mean anything. The set-value reducers are in `phraseReducers`,
the canvas's toggles and cycles now thin wrappers over them, and the link rules are pure functions in
`linkRules.ts` that `useWorkspaceLinks` calls — so a pick and a command accept the same links.

The round trip is tested by a random walk of the canvas's own reducers and link rules from an empty
workspace (400 walks in each of two interface languages; stress-tested at 6,000), not over the
saved-phrase fixtures: those are serialisation fixtures, and not reachable states (a modal that is no
modal verb, an adjective chain with a gap, a place the verb does not license). Several printing rules
came out of it: a noun's own number is written before its adjectives when one of them is a noun
modifier, which takes a number of its own; a bare role command re-anchors an adjective that a noun
modifier without an adjective would otherwise take; a verb's own adverb is written before its modals; a
conjunct heading a relative clause is written in brackets; an empty period after the first is `/new`;
an ambiguous word is written as its id, and an id in capitals wins over a label that reads the same.
Links are made last, in the order written, so a line may name a period a later line fills; a
possessor pointing at another noun is resolved last for the same reason.

It found two defects in the canvas, fixed here: a gendered noun replacing a 3rd-person pronoun kept the
pronoun's neuter, which no noun control offers (it is masculine now); and the rule of one subordinate
role per period held only one way round — a relative clause's gap could still be made an if-clause, a
coordinate or an instrument. It can no longer.

Decided where the plan was silent: `/and dog` and `/poss man` are phrases of their own, as if
bracketed, so what follows them goes back to the head; `/plain` puts a degree back (the plan listed
none); a reference to a conjunct counts the group's nouns, `#1.subj.and2` being the second; a script's
first line applies where the context is and each later line starts a period, unless it begins with
`#n` or `/new`; a pronoun takes the genders its chooser offers in any slot. A few states the canvas can
leave behind are not rebuilt by their printed text — a link whose word was re-picked after the link was
made, so that no pick could make it now (a relative clause on a word since re-picked as a pronoun; an
instrument lowered to a thing after its act was given a verb). The console holds to the pick's rules
and refuses them. A possessor pointing at a noun since removed, and a setting left on a word of the
other kind, render nothing, and are left out.

**What phases 2 and 3 shipped, beside the table.** The console is `PhraseConsole` and its parts, its
state in `usePhraseConsole`; `ConsoleMarks` carries what it shows on the canvas (preview, hover, its
cursor, numbered targets) down to the boxes, and `CursorBridge` carries the canvas cursor up. The key
below esc is a keymap entry like any other: `matchKey` gained a physical-key spec, `Code:Backquote`
(and `IntlBackslash` on a Mac), and both console keys are withheld inside every other text field. The
prompt line is P01's hint line, so the standalone strip is gone; with the console hidden nothing is
docked. F6 visits the console last. A picker mounting while the prompt has the keyboard no longer
takes it — the preview mounts one at almost every keystroke. Translations preview 200 ms behind the
keys, labelled *Preview*.

Behaviour the plan did not pin down, settled in use: an action on the canvas moves the console's
context to the box it changed (in §1, the click on *eat*'s polarity is what lets `/modal can` land on
*eat*); a digit picks a numbered target only before anything is typed for the argument, since once a
`#` is typed digits are the reference's own text; and a word still being typed, with words in the list
for it, is shown as unfinished rather than as a mistake until ↵ is pressed on it. A values command
takes as many values as it can use — one level, one language, an addressee and a register for a
command — and further values are offered on ⇥ only, so ↵ after one runs the line. The preview and
completion run during render at every keystroke, where nothing would catch an exception: should the
language ever throw, the line says it could not be read, and the page and its phrase stay up. While an
input method composes, its keys are its own; the Japanese keyboard's 半角/全角, which sits where the
backtick does, switches the input method and not the console.

**What phase 4 shipped, beside the table.** The grammar was already whole (phase 1); this phase is
its surface. A paste of several lines runs as one step, each line a period. `/save name` and
`/load name` save and load by name; alone, they open the header's dialogs, as `/export` and
`/import` do. The coverage test holds every satellite, every reducer that edits the phrase, and every
key the app binds to a command, or to an explicit note that the key only moves the cursor or the view.

**What phase 5 shipped, beside the table.**
- **Recency ranking.** Among the commands matching what was typed, those used lately rank first.
  The whole list, before anything is typed, keeps its topics' order.
- **Help pages.** `/help rel` puts the command's page in the transcript: how it is written, what it
  does, its aliases and values, and an example. The sentence the example builds is shown in the
  right-hand column. The page ends with what the command would act on at the cursor ("Here: on cat,
  now singular."). Each example lives in `help.ts` and starts from an empty period; a test runs every
  one, so a page cannot teach a line that fails. In the help overlay, the console's rows are buttons
  that close the overlay and show the page.
- **Pinning** is per line rather than per command:
  - A line is pinned from its pin in the transcript, or with `/pin` (the line it is written in, or
    alone, the line run before it).
  - ⇥ on an empty prompt offers the pinned lines, then the recent ones.
  - A pinned line is the ghost's first choice.
  - Pins are kept per browser (`signi:consolePins`) and history never pushes them out.
- **Interface-language aliases find a command, and nothing more.** In Italian, `/plurale` finds
  `/pl`. Choosing it writes `/pl`, so a line reads the same in every language (decision 3). The
  aliases are the command descriptions the UI-string catalogue already translates. They match from
  their start, ignoring accents and case.

**What phase 6 shipped, beside the table.** It came from using the console, 2026-09-19 (decision 7).
Four problems: a single-line prompt cut long lines short; a clause that needed brackets got a
message instead of the brackets; there was no way to move from keyword to keyword while editing; and
in a flat line it was hard to tell which word a setting belonged to.
- **Grammar.** The parser takes a word written first inside a bracket as its command's word (its
  *lead*). Apply gives each word's bracket a frame of its own, an `element`: commands inside reach its
  words only, and the period's commands are refused there. The printer writes the bracketed form.
  The round trip holds at 5,000 seeds.
- **Editing.** `edit.ts` is pure, and each keystroke goes through it:
  - Finishing a period word's command opens its bracket.
  - Where nothing but a new period may follow, the braces open (`/rel subj `, or `/if ` with no
    period to name).
  - Any opening bracket key types the pair its command takes.
  - A closer steps over the one already there.
  - ⌫ on an empty bracket removes its closer.
  - A command that does not fit its bracket moves out to the level it fits, checked against the
    state the line has built so far (`/obj` fits once this line gives the verb).
  - Typing the line flat (`/subj man /that /verb love …`) therefore comes out bracketed.
- **The prompt** is a textarea over a mirror that wraps the same way. It grows to eight rows. The
  ghost is drawn at the caret, so it also shows in front of closers.
- **A paste** now lands in the prompt and previews there. ↵ runs it, as for any line. Before, a paste
  of several lines ran at once.
- **⇥** selects the next command or word, so typing replaces it. Past a closer, the caret steps out
  of the bracket.
- **The chip** reads the end of the selection. While editing, it names the word the caret is on:
  `EDITING PERIOD 1 › VERB love ›`.

**Left open.** Every new caption, title and message is an English literal marked for `/localize`
(command descriptions already come from the catalogue where the words are seeded). The IME slashes
(`・`, `／`) and the ISO backtick are in, and still to be tried on real input methods and keyboards.
The transcript lives for the session.

## 7. Testing

- **Round trip (vitest):** generate states from the slot and value lists (a small hand-rolled
  generator, or `fast-check` as a dev dependency) and assert the invariant; also run it over the
  existing saved-phrase fixtures.
- **Golden tests** per command: parse, apply, print, and the diagnostic for its common misuse.
- **Bracket tests:** each form above creates the right container and link; `)` returns attachment to
  the head; nesting; <kbd>↵</kbd> closes open brackets; a bracket that breaks a link rule is refused;
  the printed result uses references and still round-trips.
- **Completion tests** per position kind (command, role word, value, reference, word without a
  command, history): candidates, order, ghost and replace range for a given text and caret —
  including aliases (`/plural` → `/pl`) and the command-only conjunctions.
- **Coverage test:** every `Satellite` key from `buildSatellites` and every exported reducer is reached
  by at least one command — the guard against the two views drifting apart.
- **Component:** typing and <kbd>⇥</kbd> in `PhraseConsole` produce the ghost, the list, the preview
  and the commit; an external state change produces the echo.
- **End to end (Playwright):** the §1 session typed into the console using <kbd>⇥</kbd> completion,
  asserting the boxes and all seven translations; clicking canvas controls and asserting the source
  strip; pasting a two-period script.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Two editors drift apart | The coverage test and the round-trip invariant; new features add their command in the same change. |
| A word is ambiguous (same label, two concepts) | Role filtering first; if still ambiguous, the list shows both with their glosses and the choice inserts the id-backed word. |
| Completion feels slow on a large vocabulary | Pure and synchronous over the cached vocabulary; the list renders at most 50 rows. |
| English command names in a seven-language interface | Decision 3; completion descriptions are localised, so the list explains each command in the interface language. |
| Japanese input turns `/` into `・` | Accept `・` and `／` as the command prefix. |
| Preview translations cost a request per pause | 200 ms debounce; react-query cancels superseded requests. |
| Small screens | Hidden by default below 600px width. |
| The backtick key differs across layouts and keyboards | Match the physical key (`Backquote`, and `IntlBackslash` on macOS ISO keyboards); never intercept it inside other text fields; the header button toggles too. |

## Open questions

None for now. Showing and hiding with <kbd>&#96;</kbd> settled the last one: the console stays shown until it is hidden.
