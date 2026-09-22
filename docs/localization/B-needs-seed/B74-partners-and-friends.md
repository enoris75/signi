# B74. Partners and friends — five words, five glosses, and the Japanese gap that needs an adverb

_(from the P11 family-and-relationships sweep of 2026-09-22. The people one chooses rather than is
born to, [P11](../../features/P-planning/P11-family-and-relationships/README.md) §4: PARTNER,
BOYFRIEND, GIRLFRIEND, FIANCE and FRIEND. All five gloss. Four surfaces collide with concepts the
corpus already has — de *Freund*, it *ragazzo* and *compagno*, fr *compagnon* — and these tooltips
are what tell them apart.)_

## Seed first

Proposed forms, for the seed author to check — suggestions, not renders.

| concept | role | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|
| PARTNER | noun, isA PERSON | partner | compagno, fem compagna | compagnon, fem compagne | Partner, fem Partnerin | pareja *f* | パートナー | companheiro, fem companheira |
| BOYFRIEND | noun, isA PARTNER | boyfriend | ragazzo | petit ami, pl. petits amis | Freund | novio | 彼氏 (かれし) | namorado |
| GIRLFRIEND | noun, isA PARTNER | girlfriend | ragazza *f* | petite amie *f*, pl. petites amies | Freundin *f* | novia *f* | 彼女 (かのじょ) | namorada *f* |
| FIANCE | noun, isA PARTNER | fiancé, fem fiancée | fidanzato, fem fidanzata | fiancé, fem fiancée | Verlobt- (adjectival, D8) | prometido, fem prometida | 婚約者 (こんやくしゃ) | noivo, fem noiva |
| FRIEND | noun, isA PERSON | friend | amico, pl. amici; fem amica, pl. amiche | ami, fem amie | Freund, fem Freundin | amigo, fem amiga | 友達 (ともだち) | amigo, fem amiga |

Three things for the seed author:

- **Spanish *pareja* is feminine whoever the partner is**, so its agreement follows the word ("mi
  pareja está cansada") and the gloss below reads *una pareja masculina* for BOYFRIEND. That is
  Spanish, not a defect.
- **German FIANCE is the adjectival noun** *Verlobter* / *die Verlobte* (P11 D8), which the engine
  cannot decline yet — P11 §3's work. No gloss here reads it: FIANCE's own gloss has PERSON as its
  head, and BOYFRIEND's and GIRLFRIEND's have PARTNER. Its **picker label** does, so the label is
  wrong until §3 lands even though the tooltip is right.
- **The colliding surfaces**: de *Freund* is FRIEND and BOYFRIEND, it *ragazzo* is BOY and
  BOYFRIEND, it *compagno* and fr *compagnon* are COMPANION and PARTNER. The picker separates them
  by `synonym` and by these tooltips; none of the five collides with a shipped gloss in any language.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| PARTNER | `{ subject: { concept: 'PERSON', definiteness: 'indefinite', relative: { headRole: 'comitative', subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'LIVE', modifier: 'TOGETHER' } } } }` | a person with whom one lives together |
| BOYFRIEND | `glossOf('PARTNER', 'MALE')` | a male partner |
| GIRLFRIEND | `{ subject: { concept: 'PARTNER', definiteness: 'indefinite', gender: 'fem', adjectives: ['FEMALE'] } }` | a female partner |
| FIANCE | `{ subject: { concept: 'PERSON', definiteness: 'indefinite', relative: { headRole: 'directObject', subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'MARRY', aspect: 'prospective' } } } }` | a person who one is about to marry |
| FRIEND | `{ subject: { concept: 'PERSON', definiteness: 'indefinite', relative: { headRole: 'directObject', subject: { concept: 'GENERIC_PERSON' }, verbPhrase: { verb: 'KNOW', modifier: 'WELL' } } } }` | a person who one knows well |

All five. FIANCE reads [B70](B70-spouses-and-marriage.md)'s MARRY, so author that one first.

## Probe renders (2026-09-22, engine source at HEAD in a detached worktree, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| PARTNER | a person with whom one lives together | una persona con la quale si abita insieme | une personne avec laquelle on habite ensemble | eine Person, mit der man zusammen wohnt | una persona con la que se vive junto | 一緒に住む人 | uma pessoa com a qual se mora junto |
| BOYFRIEND | a male partner | un compagno maschile | un compagnon masculin | ein männlicher Partner | una pareja masculina | 男性のパートナー | um companheiro masculino |
| GIRLFRIEND | a female partner | una compagna femminile | une compagne féminine | eine weibliche Partnerin | una pareja femenina | 女性のパートナー | uma companheira feminina |
| FIANCE | a person who one is about to marry | una persona che si sta per sposare | une personne qu'on est sur le point d'épouser | eine Person, die man im Begriff zu heiraten ist | una persona con la que uno está a punto de casarse | 結婚しようとしている人 | uma pessoa com a qual se está prestes a casar |
| FRIEND | a person who one knows well | una persona che si conosce bene | une personne qu'on connaît bien | eine Person, die man gut kennt | una persona que se conoce bien | よく知る人 | uma pessoa que se conhece bem |

No proposed render collides with a shipped gloss or with another in the P11 batch, in any language.
Four readings to judge on authoring:

1. **TOGETHER is in PARTNER's gloss for Japanese alone.** Without it the six European languages still
   say *with whom* (*con la quale*, *mit der*), and Japanese renders 住む人 — "a person who lives",
   with the comitative gap unmarked, because a Japanese relative clause marks no gap role. That is
   the accepted limitation of [C26](../done/C26-root-nouns-on-the-literal.md)'s instrument gloss
   (EYE is 見る器官, "an organ that sees"), but here it loses the whole differentia. The adverb puts
   it back: 一緒に住む人. The cost is Spanish, where the impersonal *se* leaves *junto* uninflected
   (*se vive junto*); A162 made *juntos* agree with its subject, and an impersonal subject gives it
   nothing to agree with. Judge the trade on authoring — the Japanese loss is the worse of the two.
2. **BOYFRIEND and GIRLFRIEND say the sex, not the absence of a marriage.** "A male partner" is what
   renders; what the words mean is a partner one is *not married to*, and the negated lead renders
   too ("a male partner who one does not marry", in **Not solved**). The short one is proposed
   because the long one says something subtly false — one may well marry one's boyfriend — and
   because MARRIED, the adjective that would say it properly, is a P11 follow-up.
3. **FIANCE is the prospective aspect inside a relative clause**, which the engine already builds:
   *sta per sposare*, *est sur le point d'épouser*, 結婚しようとしている. German is the clumsy one
   (*die man im Begriff zu heiraten ist*); if it reads badly enough to block, the fallback is the
   same clause with no aspect, which then says SPOUSE's gloss and collides.
4. **FRIEND is knowledge, not affection.** Both leads render (see **Not solved**), and the affection
   one is the better definition — except in Japanese, where the terminus gap goes unmarked and
   愛情を感じる人 reads "a person who feels affection", the wrong participant. *Knows well* has no
   such reading in any of the seven.

## Not solved by this seed

1. **The sharper BOYFRIEND and GIRLFRIEND**, and the affection route for FRIEND:

   | plan | en | it | fr | de | es | ja | pt |
   |---|---|---|---|---|---|---|---|
   | a MALE PARTNER that one does not MARRY | a male partner who one does not marry | un compagno maschile che non si sposa | un compagnon masculin qu'on n'épouse pas | ein männlicher Partner, den man nicht heiratet | una pareja masculina con la que uno no se casa | 結婚しない男性のパートナー | um companheiro masculino com o qual não se casa |
   | a MALE PERSON that one LOVEs | a male person who one loves | una persona maschile che si ama | une personne masculine qu'on aime | eine männliche Person, die man liebt | una persona masculina que se ama | 愛する男性の人 | uma pessoa masculina que se ama |
   | FRIEND: a PERSON to whom one FEELs AFFECTION | a person to whom one feels affection | una persona alla quale si prova affetto | une personne à laquelle on éprouve de l'affection | eine Person, der man Zuneigung fühlt | una persona a la que se siente afecto | 愛情を感じる人 | uma pessoa à qual se sente afeto |

   The second is true of a son as much as a boyfriend. The third is reading 4.
2. **MARRIED**, the state that would let BOYFRIEND say what it means, is P11's own follow-up
   ("MARRIED, SINGLE, DIVORCE"); [B70](B70-spouses-and-marriage.md) records it beside MARRY.
3. **German's *ein Freund von mir***, the way the language says "a friend" as opposed to "my
   boyfriend", is a possessive rule of P11's follow-ups, not a definition's problem.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
PARTNER in Japanese (一緒に住む人), which pins reading 1 — the adverb that keeps the comitative in a
language that cannot mark the gap.
