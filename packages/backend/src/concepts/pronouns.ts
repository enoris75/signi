import type { ConceptSeed } from './types.js';

// A grammatical person's definition: *the* nth person, a definite noun phrase. These name a fixed,
// identifiable category of the grammar rather than one of several, so they read with the definite
// article. `/subj ( PERSON_GRAMMAR /adj FIRST )` → en "the first person", it "la prima persona", de
// "die erste Person", ja "第一の人称". PERSON_GRAMMAR is the grammar sense of the word (ja 人称, not
// 人), and FIRST / SECOND / THIRD are the seeded ordinals the chooser's person row already names
// itself with — so the tooltip and the option under it are the same two words.

export const pronouns: ConceptSeed[] = [
  // ── PRONOUNS ────────────────────────────────────────────────────
  // Three concepts (1st / 2nd / 3rd person). Number and gender are
  // selected at phrase-build time via UI toggles; only the singular
  // base form is stored as `number` in the DB. Extra forms are kept
  // as form_key rows so the translator can synthesise the right surface.
  {
    id: 'FIRST_PERSON',
    role: 'pronoun',
    description: '1st Person',
    definition: '/subj ( PERSON_GRAMMAR /adj FIRST )',
    emoji: '🧍',
    forms: {
      // disjunctive = tonic/oblique form used after a preposition ("because of me/us").
      // object = accusative direct-object form (English "me"); in Romance the proclitic that moves
      // in front of the finite verb ("mi vede"). German's is the accusative, distinct from the
      // dative disjunctive ("mich" vs "mir").
      // reflexive = English's object when it is the subject itself ("I see myself", A177). The
      // other languages need none: their object form doubles as the reflexive ("mi vedo").
      // dative = the Romance indirect-object clitic, where it differs from the accusative one: only
      // the 3rd person does (it gli/le, fr lui/leur, es le/les — P09-E43's dative controller, "le
      // permite correr"), so only that concept carries the keys and the
      // 1st and 2nd fall back to `object` ("mi telefona", "me téléphone" — A240).
      en: { base: 'I',        person: '1', number: 'singular', plural: 'we',  disjunctive: 'me',   disjunctive_plural: 'us', object: 'me', object_plural: 'us', reflexive: 'myself', reflexive_plural: 'ourselves' },
      it: { base: 'io',       person: '1', number: 'singular', plural: 'noi', disjunctive: 'me',   disjunctive_plural: 'noi', object: 'mi', object_plural: 'ci' },
      fr: { base: 'je',       person: '1', number: 'singular', plural: 'nous', disjunctive: 'moi', disjunctive_plural: 'nous', object: 'me', object_plural: 'nous' },
      de: { base: 'ich',      person: '1', number: 'singular', plural: 'wir', disjunctive: 'mir',  disjunctive_plural: 'uns', object: 'mich', object_plural: 'uns' },
      // Spanish carries the feminine through the plural paradigm (nosotras / vosotras / ellas):
      // plural_fem is the feminine-plural subject surface and disjunctive_plural_fem the tonic one,
      // which are the same word here (A205). French/Portuguese "nous"/"nós" have neither.
      es: { base: 'yo',       person: '1', number: 'singular', plural: 'nosotros', plural_fem: 'nosotras', disjunctive: 'mí', disjunctive_plural: 'nosotros', disjunctive_plural_fem: 'nosotras', object: 'me', object_plural: 'nos' },
      ja: { base: '私',       person: '1', number: 'singular', plural: '私たち', reading: 'わたし', plural_reading: 'わたしたち' },
      pt: { base: 'eu',       person: '1', number: 'singular', plural: 'nós', disjunctive: 'mim',  disjunctive_plural: 'nós', object: 'me', object_plural: 'nos' },
    },
  },
  {
    id: 'SECOND_PERSON',
    role: 'pronoun',
    description: '2nd Person',
    definition: '/subj ( PERSON_GRAMMAR /adj SECOND )',
    emoji: '👉',
    forms: {
      en: { base: 'you',      person: '2', number: 'singular', plural: 'you',  disjunctive: 'you', disjunctive_plural: 'you', object: 'you', object_plural: 'you', reflexive: 'yourself', reflexive_plural: 'yourselves' },
      it: { base: 'tu',       person: '2', number: 'singular', plural: 'voi',  disjunctive: 'te',  disjunctive_plural: 'voi', object: 'ti', object_plural: 'vi' },
      fr: { base: 'tu',       person: '2', number: 'singular', plural: 'vous', disjunctive: 'toi', disjunctive_plural: 'vous', object: 'te', object_plural: 'vous' },
      de: { base: 'du',       person: '2', number: 'singular', plural: 'ihr',  disjunctive: 'dir', disjunctive_plural: 'euch', object: 'dich', object_plural: 'euch' },
      es: { base: 'tú',       person: '2', number: 'singular', plural: 'vosotros', plural_fem: 'vosotras', disjunctive: 'ti', disjunctive_plural: 'vosotros', disjunctive_plural_fem: 'vosotras', object: 'te', object_plural: 'os' },
      ja: { base: 'あなた',   person: '2', number: 'singular', plural: 'あなたたち' },
      pt: { base: 'você',     person: '2', number: 'singular', plural: 'vocês', disjunctive: 'você', disjunctive_plural: 'vocês', object: 'te', object_plural: 'vos' },
    },
  },
  {
    id: 'THIRD_PERSON',
    role: 'pronoun',
    description: '3rd Person',
    definition: '/subj ( PERSON_GRAMMAR /adj THIRD )',
    emoji: '👤',
    forms: {
      // base = default masc singular; singular_fem/singular_neut and plural stored as extra forms
      en: { base: 'he',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'she',    singular_neut: 'it',   plural: 'they',  disjunctive: 'him', disjunctive_fem: 'her',  disjunctive_neut: 'it',   disjunctive_plural: 'them', object: 'him', object_fem: 'her', object_neut: 'it', object_plural: 'them' },
      it: { base: 'lui',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'lei',    singular_neut: 'esso', plural: 'loro',  disjunctive: 'lui', disjunctive_fem: 'lei',  disjunctive_neut: 'esso', disjunctive_plural: 'loro', object: 'lo', object_fem: 'la', object_neut: 'lo', object_plural: 'li', object_plural_fem: 'le', dative: 'gli', dative_fem: 'le', dative_neut: 'gli', dative_plural: 'gli' },
      fr: { base: 'il',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'elle',   singular_neut: 'cela', plural: 'ils',   plural_fem: 'elles', disjunctive: 'lui', disjunctive_fem: 'elle', disjunctive_neut: 'cela', disjunctive_plural: 'eux', disjunctive_plural_fem: 'elles', object: 'le', object_fem: 'la', object_neut: 'le', object_plural: 'les', dative: 'lui', dative_fem: 'lui', dative_neut: 'lui', dative_plural: 'leur' },
      de: { base: 'er',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'sie',    singular_neut: 'es',   plural: 'sie',   disjunctive: 'ihm', disjunctive_fem: 'ihr',  disjunctive_neut: 'ihm',  disjunctive_plural: 'ihnen', object: 'ihn', object_fem: 'sie', object_neut: 'es', object_plural: 'sie' },
      es: { base: 'él',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella',   singular_neut: 'ello', plural: 'ellos', plural_fem: 'ellas', disjunctive: 'él',  disjunctive_fem: 'ella', disjunctive_neut: 'ello', disjunctive_plural: 'ellos', disjunctive_plural_fem: 'ellas', object: 'lo', object_fem: 'la', object_neut: 'lo', object_plural: 'los', object_plural_fem: 'las', dative: 'le', dative_plural: 'les' },
      // 彼ら and 彼女ら are people; それら is the plural of それ and is what a group of THINGS is called
      // (A200). Both neuter rows are kana, so their readings equal their text and no furigana is drawn.
      ja: { base: '彼',   person: '3', number: 'singular', gender: 'masc', singular_fem: '彼女',   singular_neut: 'それ', plural: '彼ら', plural_fem: '彼女ら', plural_neut: 'それら', reading: 'かれ', singular_fem_reading: 'かのじょ', singular_neut_reading: 'それ', plural_reading: 'かれら', plural_fem_reading: 'かのじょら', plural_neut_reading: 'それら' },
      pt: { base: 'ele',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'ela',    singular_neut: 'isso', plural: 'eles',  plural_fem: 'elas', disjunctive: 'ele', disjunctive_fem: 'ela',  disjunctive_neut: 'isso', disjunctive_plural: 'eles', disjunctive_plural_fem: 'elas', object: 'o', object_fem: 'a', object_neut: 'o', object_plural: 'os', object_plural_fem: 'as' },
    },
  },
  {
    // The generic / impersonal subject — "one eats", "a thing one eats". Agreement is
    // 3rd-person singular everywhere, but the surface splits three ways (the `generic` flag lets
    // the engines tell it apart from a deictic 3rd person):
    //   · en/de/fr place it as an ordinary subject word — "one" / "man" / "on" (French elides,
    //     "qu'on"); nothing more than this seed is needed there.
    //   · it/es/pt render it as a preverbal impersonal clitic — "si" / "se" / "se" — with no
    //     subject word ("una cosa che si mangia"); the engines read `base` as that clitic.
    //   · ja drops it, leaving the bare prenominal clause (食べる物 "a thing one eats"); 人 is kept
    //     only so the picker shows a word.
    id: 'GENERIC_PERSON',
    role: 'pronoun',
    description: 'one (generic person)',
    synonym: 'one',
    emoji: '🫥',
    forms: {
      // `generic_reflexive` is what Spanish and Portuguese say instead when the verb is itself
      // reflexive: their impersonal "se" cannot stand beside the verb's own ("*se se mueve"), so the
      // generic subject is spelled out as a word (A152). Spanish has the standard pronoun "uno";
      // Portuguese has no single form, and takes the colloquial "a gente" that the engine's "você"
      // paradigm (A108) already leans towards. The other five have no clash to resolve.
      // `disjunctive` is the generic's dative, where the language has one (A316): German *einem* ("es
      // geht einem gut"), Spanish *uno* ("el gato le gusta a uno"). Italian *si* has none settled.
      en: { base: 'one', person: '3', number: 'singular', generic: '1' },
      it: { base: 'si',  person: '3', number: 'singular', generic: '1' },
      fr: { base: 'on',  person: '3', number: 'singular', generic: '1' },
      de: { base: 'man', person: '3', number: 'singular', generic: '1', disjunctive: 'einem' },
      es: { base: 'se',  person: '3', number: 'singular', generic: '1', generic_reflexive: 'uno', disjunctive: 'uno' },
      ja: { base: '人',  person: '3', number: 'singular', generic: '1', reading: 'ひと' },
      pt: { base: 'se',  person: '3', number: 'singular', generic: '1', generic_reflexive: 'a gente' },
    },
  },
  {
    // P09's *something* (localization C32): a pronoun that stands for an unnamed **thing**, where the
    // three persons and GENERIC_PERSON all stand for people. What makes it a pronoun of its own is
    // that it has two forms, not one: under negation every language swaps the word outright —
    // English to *anything* (beside "not"), and the other six to the negative pronoun that carries
    // the negation with it (`negative`, see `negativePolarity`). Japanese writes 何 and lets the
    // も…ない circumfix the `no` determiner already builds close it: 何も食べません.
    //
    // It is 3rd singular and never a person, so it agrees as "it" does and takes no reflexive.
    id: 'SOMETHING',
    role: 'pronoun',
    slot: 'indefinite',
    description: 'an unknown thing',
    // A genus+differentia gloss on THING, the only shape a pronoun of this kind takes: "an unknown
    // thing". The negative half of the word is not glossed separately — it is the same concept.
    definition: '/subj ( THING /adj UNKNOWN /a )',
    synonym: 'something',
    emoji: '❔',
    forms: {
      en: { base: 'something', person: '3', number: 'singular', gender: 'neut', thing: '1', object: 'something', disjunctive: 'something', negative: 'anything', negative_subject: 'nothing' },
      it: { base: 'qualcosa', person: '3', number: 'singular', thing: '1', object: 'qualcosa', disjunctive: 'qualcosa', negative: 'niente', with_other: "qualcos'altro", negative_with_other: "nient'altro" },
      fr: { base: 'quelque chose', person: '3', number: 'singular', thing: '1', object: 'quelque chose', disjunctive: 'quelque chose', negative: 'rien', with_other: 'autre chose' },
      de: { base: 'etwas', person: '3', number: 'singular', gender: 'neut', thing: '1', object: 'etwas', disjunctive: 'etwas', negative: 'nichts' },
      es: { base: 'algo', person: '3', number: 'singular', thing: '1', object: 'algo', disjunctive: 'algo', negative: 'nada', with_other: 'otra cosa', negative_with_other: 'nada más' },
      ja: { base: '何か', person: '3', number: 'singular', thing: '1', reading: 'なにか', negative: '何', negative_reading: 'なに', negative_modified: 'もの' },
      pt: { base: 'algo', person: '3', number: 'singular', thing: '1', object: 'algo', disjunctive: 'algo', negative: 'nada', with_other: 'outra coisa', negative_with_other: 'nada mais' },
    },
  },
  {
    // P09-E24's *everything* (localization B90): SOMETHING's universal, a thing pronoun with the same
    // `indefinite` slot and `thing` flag, so it stays a phrase ("vede tutto", not a clitic). Unlike
    // SOMETHING it has **no negative form**: it does not swap under negation ("does not see
    // everything" is *not all*, "non vede tutto"). German alles is neuter; Italian, Spanish and
    // Portuguese agree in the masculine. Japanese すべて takes を and は as a noun does.
    //
    // With OTHER it is a fused phrase in five languages (`with_other`), as SOMETHING's *autre chose*
    // is: *tutto il resto*, *tout le reste*, *todo lo demás*, *todo o resto*, and German *alles
    // andere*, which declines (*mit allem anderen*) and so names its dative (`with_other_disjunctive`).
    // English "everything else" is OTHER's own `after_pronoun`.
    //
    // Glossed as SOMETHING's genus under `all`, EVERYWHERE's "in all places": "all things", a
    // countable plural where the word itself is the mass pronoun.
    id: 'EVERYTHING',
    role: 'pronoun',
    slot: 'indefinite',
    description: 'all things; the whole of what there is',
    definition: '/subj ( THING /pl /all )',
    synonym: 'everything',
    emoji: '🌐',
    forms: {
      en: { base: 'everything', person: '3', number: 'singular', gender: 'neut', thing: '1', object: 'everything', disjunctive: 'everything' },
      it: { base: 'tutto', person: '3', number: 'singular', gender: 'masc', thing: '1', object: 'tutto', disjunctive: 'tutto', with_other: 'tutto il resto' },
      fr: { base: 'tout', person: '3', number: 'singular', gender: 'masc', thing: '1', object: 'tout', disjunctive: 'tout', with_other: 'tout le reste' },
      de: { base: 'alles', person: '3', number: 'singular', gender: 'neut', thing: '1', object: 'alles', disjunctive: 'allem', with_other: 'alles andere', with_other_disjunctive: 'allem anderen' },
      es: { base: 'todo', person: '3', number: 'singular', gender: 'masc', thing: '1', object: 'todo', disjunctive: 'todo', with_other: 'todo lo demás' },
      ja: { base: 'すべて', person: '3', number: 'singular', thing: '1' },
      pt: { base: 'tudo', person: '3', number: 'singular', gender: 'masc', thing: '1', object: 'tudo', disjunctive: 'tudo', with_other: 'todo o resto' },
    },
  },
  {
    // P09-E40's *someone*: SOMETHING's person counterpart. It is a full phrase for the same reason
    // SOMETHING is — the concept's `slot: 'indefinite'`, which the lexicon hands the engines as the
    // `indefinite` form (see `isPronounElement`) — and it carries no `thing`, so it is a person where
    // that matters: the Spanish and Portuguese personal *a* ("ve a alguien"), and the Japanese
    // animacy of `isAnimate`. Its negative forms follow SOMETHING's: English *anyone* beside "not"
    // and *nobody* where it absorbs the negation as the subject; one negative word elsewhere.
    //
    // German declines it (D2): `object` is the accusative *jemanden* the direct object takes and
    // `disjunctive` the dative *jemandem* a preposition governs (see `tonicPronounDe`); its negative
    // half declines alike, `negative_object` *niemanden* and `negative_disjunctive` *niemandem*.
    // It is grammatically masculine in the languages that agree with it (*qualcuno è arrivato*,
    // *jemand, der …*).
    id: 'SOMEONE',
    role: 'pronoun',
    slot: 'indefinite',
    human: true,
    description: 'an unknown person',
    // SOMETHING's gloss on PERSON: "an unknown person".
    definition: '/subj ( PERSON /adj UNKNOWN /a )',
    synonym: 'somebody',
    emoji: '🕵️',
    forms: {
      en: { base: 'someone', person: '3', number: 'singular', object: 'someone', disjunctive: 'someone', negative: 'anyone', negative_subject: 'nobody' },
      it: { base: 'qualcuno', person: '3', number: 'singular', gender: 'masc', object: 'qualcuno', disjunctive: 'qualcuno', negative: 'nessuno', with_other: 'qualcun altro', negative_with_other: 'nessun altro' },
      fr: { base: "quelqu'un", person: '3', number: 'singular', gender: 'masc', object: "quelqu'un", disjunctive: "quelqu'un", negative: 'personne' },
      de: { base: 'jemand', person: '3', number: 'singular', gender: 'masc', object: 'jemanden', disjunctive: 'jemandem', negative: 'niemand', negative_object: 'niemanden', negative_disjunctive: 'niemandem' },
      es: { base: 'alguien', person: '3', number: 'singular', gender: 'masc', object: 'alguien', disjunctive: 'alguien', negative: 'nadie' },
      ja: { base: '誰か', person: '3', number: 'singular', reading: 'だれか', negative: '誰', negative_reading: 'だれ', negative_modified: '人', negative_modified_reading: 'ひと' },
      pt: { base: 'alguém', person: '3', number: 'singular', gender: 'masc', object: 'alguém', disjunctive: 'alguém', negative: 'ninguém', with_other: 'outra pessoa', negative_with_other: 'ninguém mais' },
    },
  },
];
