// The localStorage keys the phrase builder remembers its view sizes under. Each is read where the
// builder starts and written where a drag ends, in another component, so both sides take the key from
// here. Renaming one forgets every user's saved size.

/** The full-view canvas height, in px (see PhraseBuilder, PeriodCard). */
export const GRAPH_HEIGHT_KEY = "signi:graphHeight";

/** The words panel's width, in px (see PhraseBuilder, PhraseSidebar). */
export const SIDEBAR_WIDTH_KEY = "signi:phraseBuilderSidebarWidth";
