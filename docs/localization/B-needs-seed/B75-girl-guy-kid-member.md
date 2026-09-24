# B75. Girl, guy, kid and member — the people words of COCA ranks 201–400

_(from the [P09-E24](../../features/P-planning/P09-core-vocabulary/Z-done/P09-E24-ranks-201-400.md)
coverage check of 2026-09-24: *guy* (rank 203), *kid* (275), *girl* (313) and *member* (341) of the
COCA lemma list. None of the four is a concept at 1229928. Two ship a gloss, two are register words
and are literal by design on the MOM/DAD precedent. None goes to a C ticket.)_

## Seed first

Proposed forms, for the seed author to check. Every noun row was **seeded in memory and rendered**
(see *Probe renders*).

| concept | role | sense | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|---|---|
| GIRL | noun | **E24**, rank 313. Human, `isA: 'PERSON'`, BOY's counterpart (BOY is *ragazzo, garçon, Junge, niño*, 男の子, *menino*) | girl / girls | ragazza / ragazze *f* | fille / filles *f* | Mädchen / Mädchen *n* | niña / niñas *f* | 女の子 (おんなのこ) | menina / meninas *f* |
| GUY | noun | **E24**, rank 203. A man, informal. Human, `isA: 'MAN'`, `synonym: 'informal'` | guy / guys | tipo / tipi *m* | type / types *m* | Typ / Typen *m* (weak) | tipo / tipos *m* | やつ | cara / caras *m* |
| KID | noun | **E24**, rank 275. A child, informal. Human, `isA: 'CHILD'`, `synonym: 'informal'` | kid / kids | ragazzino / ragazzini *m* | gamin / gamins *m* | Kind / Kinder *n* | chico / chicos *m* | 子 (こ) | garoto / garotos *m* |
| MEMBER | noun | **E24**, rank 341. One of what a group is made of, person or not (a country is a member too) | member / members | membro / membri *m* | membre / membres *m* | Mitglied / Mitglieder *n* | miembro / miembros *m* | 一員 (いちいん) | membro / membros *m* |

- **GUY and KID are register words.** Every language has an informal word for them: *tipo, type,
  Typ, cara* and やつ for a man, *gamin, garoto* for a child. That is why they get concepts of their
  own rather than MAN and CHILD covering them (P09 D1). The precedent is P11's MOM and DAD, which
  were seeded for the same reason and are literal by design
  ([B68](../done/B68-the-family.md)). German has no everyday informal word for a child, so KID's German
  is *Kind*, the same as CHILD's. Japanese 子 is also CHILD's 子供 in short. The two collide by design.
- **German *Typ* is a weak masculine** (*den Typen*, *dem Typen*). The probe's accusative came out
  *einen Typ*, which is colloquial but not standard. The seed needs whatever flag the corpus's weak
  nouns carry ([A270](../../bugs/fixed/A270-german-feminine-of-a-weak-noun-takes-the-weak-ending.md)
  and its neighbours). Check it with a dative before shipping.
- **Japanese やつ is pejorative in some contexts.** 男の人 (おとこのひと) is the neutral alternative, and
  it is what the author should pick if the picker ever shows the word unglossed next to MAN.
- **MEMBER** is the word P08 asked for alongside GROUP ("Seed first: `GROUP` … and `MEMBER`",
  [P08](../../features/P-planning/P08-collective-nouns/README.md)). GROUP is seeded and MEMBER is not.
  It is not `human`: a state can be a member of a union.

## Unlocks

| concept | plan | gloss (en) |
|---|---|---|
| GIRL | `glossOf('PERSON', 'YOUNG', 'FEMALE')` | a young female person |
| MEMBER | `partOfGloss('GROUP')` | a part of a group |

**Two of four.** GUY and KID are literal by design (reading 3).

## Probe renders (2026-09-24, engine source at 1229928, lexicon seeded in memory with the forms above)

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GIRL | a young female person | una giovane persona femminile | une jeune personne féminine | eine junge weibliche Person | una persona joven y femenina | 若い女性の人 | uma pessoa jovem e feminina |
| MEMBER | a part of a group | una parte di un gruppo | une partie d'un groupe | ein Teil einer Gruppe | una parte de un grupo | グループの部分 | uma parte de um grupo |

The words themselves, in a sentence ("the cat sees a …" and "the big …s seem good"):

| concept | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GIRL | the cat sees a girl | il gatto vede una ragazza | le chat voit une fille | der Kater sieht ein Mädchen | el gato ve a una niña | 猫は女の子を見ます | o gato vê uma menina |
| GUY | the cat sees a guy | il gatto vede un tipo | le chat voit un type | der Kater sieht einen Typ | el gato ve a un tipo | 猫はやつを見ます | o gato vê um cara |
| KID | the cat sees a kid | il gatto vede un ragazzino | le chat voit un gamin | der Kater sieht ein Kind | el gato ve a un chico | 猫は子を見ます | o gato vê um garoto |
| MEMBER | the cat sees a member | il gatto vede un membro | le chat voit un membre | der Kater sieht ein Mitglied | el gato ve un miembro | 猫は一員を見ます | o gato vê um membro |
| GIRL pl | the big girls seem good | le grandi ragazze sembrano buone | les grandes filles semblent bonnes | die großen Mädchen scheinen gut | las niñas grandes parecen buenas | 大きい女の子は良く思えます | as meninas grandes parecem boas |
| GUY pl | the big guys seem good | i grandi tipi sembrano buoni | les grands types semblent bons | die großen Typen scheinen gut | los tipos grandes parecen buenos | 大きいやつは良く思えます | os caras grandes parecem bons |

The leads that were not taken:

| lead | en | it | fr | de | es | ja | pt |
|---|---|---|---|---|---|---|---|
| GIRL: `glossOf('CHILD', 'FEMALE')` | a female child | un bambino femminile | un enfant féminin | ein weibliches Kind | un niño femenino | 女性の子供 | uma criança feminina |
| GUY: `glossOf('MAN')` | a man | un uomo | un homme | ein Mann | un hombre | 男 | um homem |
| KID: `glossOf('CHILD')` | a child | un bambino | un enfant | ein Kind | un niño | 子供 | uma criança |
| MEMBER: PERSON who BE a part of a group | a person who is a part of a group | una persona che è una parte di un gruppo | une personne qui est une partie d'un groupe | eine Person, die ein Teil einer Gruppe ist | una persona que es una parte de un grupo | グループの部分である人 | uma pessoa que é uma parte de um grupo |

Readings to judge on authoring:

1. **GIRL shares YOUNG_WOMAN's gloss, character for character, in all seven**, just as BOY shares
   YOUNG_MAN's today. `sweep-definitions.test.ts` allows that pair by design (`GLOSSES_SHARED_BY_DESIGN`:
   "the two ages of a young male person differ by a degree no adjective carries"). GIRL and YOUNG_WOMAN
   need the same row. The only lead that tells them apart, "a female child", fails in Italian and
   Spanish, because CHILD's word is masculine and FEMALE does not feminize it (*un bambino femminile*,
   *un niño femenino*). A gender-aware head would fix that, but it would be a C-ticket's work.
2. **MEMBER, "a part of a group"**, is `partOfGloss` on the genus P08 hangs every collective under.
   It restates no shipped gloss. NODE ships "a part that one connects", and ROW and KEY ship "a part of
   a list / keyboard". The lead with a PERSON head says less, because a member is not always a person.
3. **GUY and KID are literal by design.** Their leads restate MAN and CHILD's own words, and none of
   the leads carries the register. The ruling follows MOM and DAD, which differ from MOTHER and
   FATHER only in register.

## Not solved by this seed

1. **The register itself.** Nothing in a plan can ask for the informal word, so GUY and KID are
   picked by hand like MOM and DAD. P09-E23 in the same batch (secondary lexemes) is the other way to
   let "guy" find MAN. If it lands first, the author can drop GUY and KID and make them non-primary
   lexemes of MAN and CHILD. The price is their French, German, Portuguese and Japanese register.
2. **Counterparts not in the band**: *woman* is seeded. *Lady* and *gentleman* are not in ranks
   201–400.

## Coverage

One row in [e2e/definition-tooltip.spec.ts](../../../e2e/definition-tooltip.spec.ts) once authored:
MEMBER in German and Japanese (*ein Teil einer Gruppe*, グループの部分).
