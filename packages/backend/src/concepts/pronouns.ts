import type { ConceptSeed } from './types.js';

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
    emoji: '🧍',
    forms: {
      // disjunctive = tonic/oblique form used after a preposition ("because of me/us").
      // object = accusative direct-object form (English "me"); in Romance the proclitic that moves
      // in front of the finite verb ("mi vede"). German's is the accusative, distinct from the
      // dative disjunctive ("mich" vs "mir").
      en: { base: 'I',        person: '1', number: 'singular', plural: 'we',  disjunctive: 'me',   disjunctive_plural: 'us', object: 'me', object_plural: 'us' },
      it: { base: 'io',       person: '1', number: 'singular', plural: 'noi', disjunctive: 'me',   disjunctive_plural: 'noi', object: 'mi', object_plural: 'ci' },
      fr: { base: 'je',       person: '1', number: 'singular', plural: 'nous', disjunctive: 'moi', disjunctive_plural: 'nous', object: 'me', object_plural: 'nous' },
      de: { base: 'ich',      person: '1', number: 'singular', plural: 'wir', disjunctive: 'mir',  disjunctive_plural: 'uns', object: 'mich', object_plural: 'uns' },
      es: { base: 'yo',       person: '1', number: 'singular', plural: 'nosotros', disjunctive: 'mí', disjunctive_plural: 'nosotros', object: 'me', object_plural: 'nos' },
      ja: { base: '私',       person: '1', number: 'singular', plural: '私たち', reading: 'わたし', plural_reading: 'わたしたち' },
      pt: { base: 'eu',       person: '1', number: 'singular', plural: 'nós', disjunctive: 'mim',  disjunctive_plural: 'nós', object: 'me', object_plural: 'nos' },
    },
  },
  {
    id: 'SECOND_PERSON',
    role: 'pronoun',
    description: '2nd Person',
    emoji: '👉',
    forms: {
      en: { base: 'you',      person: '2', number: 'singular', plural: 'you',  disjunctive: 'you', disjunctive_plural: 'you', object: 'you', object_plural: 'you' },
      it: { base: 'tu',       person: '2', number: 'singular', plural: 'voi',  disjunctive: 'te',  disjunctive_plural: 'voi', object: 'ti', object_plural: 'vi' },
      fr: { base: 'tu',       person: '2', number: 'singular', plural: 'vous', disjunctive: 'toi', disjunctive_plural: 'vous', object: 'te', object_plural: 'vous' },
      de: { base: 'du',       person: '2', number: 'singular', plural: 'ihr',  disjunctive: 'dir', disjunctive_plural: 'euch', object: 'dich', object_plural: 'euch' },
      es: { base: 'tú',       person: '2', number: 'singular', plural: 'vosotros', disjunctive: 'ti', disjunctive_plural: 'vosotros', object: 'te', object_plural: 'os' },
      ja: { base: 'あなた',   person: '2', number: 'singular', plural: 'あなたたち' },
      pt: { base: 'você',     person: '2', number: 'singular', plural: 'vocês', disjunctive: 'você', disjunctive_plural: 'vocês', object: 'te', object_plural: 'vos' },
    },
  },
  {
    id: 'THIRD_PERSON',
    role: 'pronoun',
    description: '3rd Person',
    emoji: '👤',
    forms: {
      // base = default masc singular; singular_fem/singular_neut and plural stored as extra forms
      en: { base: 'he',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'she',    singular_neut: 'it',   plural: 'they',  disjunctive: 'him', disjunctive_fem: 'her',  disjunctive_neut: 'it',   disjunctive_plural: 'them', object: 'him', object_fem: 'her', object_neut: 'it', object_plural: 'them' },
      it: { base: 'lui',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'lei',    singular_neut: 'esso', plural: 'loro',  disjunctive: 'lui', disjunctive_fem: 'lei',  disjunctive_neut: 'esso', disjunctive_plural: 'loro', object: 'lo', object_fem: 'la', object_neut: 'lo', object_plural: 'li' },
      fr: { base: 'il',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'elle',   singular_neut: 'cela', plural: 'ils',   disjunctive: 'lui', disjunctive_fem: 'elle', disjunctive_neut: 'cela', disjunctive_plural: 'eux', object: 'le', object_fem: 'la', object_neut: 'le', object_plural: 'les' },
      de: { base: 'er',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'sie',    singular_neut: 'es',   plural: 'sie',   disjunctive: 'ihm', disjunctive_fem: 'ihr',  disjunctive_neut: 'ihm',  disjunctive_plural: 'ihnen', object: 'ihn', object_fem: 'sie', object_neut: 'es', object_plural: 'sie' },
      es: { base: 'él',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella',   singular_neut: 'ello', plural: 'ellos', disjunctive: 'él',  disjunctive_fem: 'ella', disjunctive_neut: 'ello', disjunctive_plural: 'ellos', object: 'lo', object_fem: 'la', object_neut: 'lo', object_plural: 'los' },
      ja: { base: '彼',   person: '3', number: 'singular', gender: 'masc', singular_fem: '彼女',   singular_neut: 'それ', plural: '彼ら', reading: 'かれ', singular_fem_reading: 'かのじょ', singular_neut_reading: 'それ', plural_reading: 'かれら' },
      pt: { base: 'ele',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'ela',    singular_neut: 'isso', plural: 'eles',  disjunctive: 'ele', disjunctive_fem: 'ela',  disjunctive_neut: 'isso', disjunctive_plural: 'eles', object: 'o', object_fem: 'a', object_neut: 'o', object_plural: 'os' },
    },
  },
];
