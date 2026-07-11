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
      en: { base: 'I',        person: '1', number: 'singular', plural: 'we',  disjunctive: 'me',   disjunctive_plural: 'us' },
      it: { base: 'io',       person: '1', number: 'singular', plural: 'noi', disjunctive: 'me',   disjunctive_plural: 'noi' },
      fr: { base: 'je',       person: '1', number: 'singular', plural: 'nous', disjunctive: 'moi', disjunctive_plural: 'nous' },
      de: { base: 'ich',      person: '1', number: 'singular', plural: 'wir', disjunctive: 'mir',  disjunctive_plural: 'uns' },
      es: { base: 'yo',       person: '1', number: 'singular', plural: 'nosotros', disjunctive: 'mí', disjunctive_plural: 'nosotros' },
      ja: { base: '私',       person: '1', number: 'singular', plural: '私たち', reading: 'わたし', plural_reading: 'わたしたち' },
      pt: { base: 'eu',       person: '1', number: 'singular', plural: 'nós', disjunctive: 'mim',  disjunctive_plural: 'nós' },
    },
  },
  {
    id: 'SECOND_PERSON',
    role: 'pronoun',
    description: '2nd Person',
    emoji: '👉',
    forms: {
      en: { base: 'you',      person: '2', number: 'singular', plural: 'you',  disjunctive: 'you', disjunctive_plural: 'you' },
      it: { base: 'tu',       person: '2', number: 'singular', plural: 'voi',  disjunctive: 'te',  disjunctive_plural: 'voi' },
      fr: { base: 'tu',       person: '2', number: 'singular', plural: 'vous', disjunctive: 'toi', disjunctive_plural: 'vous' },
      de: { base: 'du',       person: '2', number: 'singular', plural: 'ihr',  disjunctive: 'dir', disjunctive_plural: 'euch' },
      es: { base: 'tú',       person: '2', number: 'singular', plural: 'vosotros', disjunctive: 'ti', disjunctive_plural: 'vosotros' },
      ja: { base: 'あなた',   person: '2', number: 'singular', plural: 'あなたたち' },
      pt: { base: 'você',     person: '2', number: 'singular', plural: 'vocês', disjunctive: 'você', disjunctive_plural: 'vocês' },
    },
  },
  {
    id: 'THIRD_PERSON',
    role: 'pronoun',
    description: '3rd Person',
    emoji: '👤',
    forms: {
      // base = default masc singular; singular_fem/singular_neut and plural stored as extra forms
      en: { base: 'he',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'she',    singular_neut: 'it',   plural: 'they',  disjunctive: 'him', disjunctive_fem: 'her',  disjunctive_neut: 'it',   disjunctive_plural: 'them' },
      it: { base: 'lui',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'lei',    singular_neut: 'esso', plural: 'loro',  disjunctive: 'lui', disjunctive_fem: 'lei',  disjunctive_neut: 'esso', disjunctive_plural: 'loro' },
      fr: { base: 'il',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'elle',   singular_neut: 'cela', plural: 'ils',   disjunctive: 'lui', disjunctive_fem: 'elle', disjunctive_neut: 'cela', disjunctive_plural: 'eux' },
      de: { base: 'er',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'sie',    singular_neut: 'es',   plural: 'sie',   disjunctive: 'ihm', disjunctive_fem: 'ihr',  disjunctive_neut: 'ihm',  disjunctive_plural: 'ihnen' },
      es: { base: 'él',   person: '3', number: 'singular', gender: 'masc', singular_fem: 'ella',   singular_neut: 'ello', plural: 'ellos', disjunctive: 'él',  disjunctive_fem: 'ella', disjunctive_neut: 'ello', disjunctive_plural: 'ellos' },
      ja: { base: '彼',   person: '3', number: 'singular', gender: 'masc', singular_fem: '彼女',   singular_neut: 'それ', plural: '彼ら', reading: 'かれ', singular_fem_reading: 'かのじょ', singular_neut_reading: 'それ', plural_reading: 'かれら' },
      pt: { base: 'ele',  person: '3', number: 'singular', gender: 'masc', singular_fem: 'ela',    singular_neut: 'isso', plural: 'eles',  disjunctive: 'ele', disjunctive_fem: 'ela',  disjunctive_neut: 'isso', disjunctive_plural: 'eles' },
    },
  },
];
