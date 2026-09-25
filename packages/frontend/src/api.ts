import type {
  Concept,
  GrammaticalRole,
  PhrasePlan,
  SavePhraseRequest,
  SavedPhraseKind,
  SavedPhraseRecord,
  SavedPhraseSummary,
  SavedPhrasesResponse,
  TranslateRequest,
  Translation,
  UiStrings,
  UiStringsResponse,
} from '@signi/shared';

const BASE = '/api';

export async function fetchConcepts(role?: GrammaticalRole): Promise<Concept[]> {
  const url = role ? `${BASE}/concepts?role=${role}` : `${BASE}/concepts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch concepts');
  const data = await res.json() as { concepts: Concept[] };
  return data.concepts;
}

// `phrase` asks for one phrase of the plan, resolved in its clause, rather than the period (P11-E7 D5).
export async function fetchTranslation(plan: PhrasePlan, phrase?: TranslateRequest["phrase"]): Promise<Translation[]> {
  const res = await fetch(`${BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(phrase ? { plan, phrase } : { plan }),
  });
  if (!res.ok) throw new Error('Translation failed');
  const data = await res.json() as { translations: Translation[] };
  return data.translations;
}

// Every engine-rendered UI string (tagline, headings, language names…) in every language,
// keyed. The plans that define them live in @signi/shared (uiStrings.ts) and the backend
// renders the catalog once at startup, so the frontend fetches the lot in one request and
// reads it through useUiString().
export async function fetchUiStrings(): Promise<UiStrings> {
  const res = await fetch(`${BASE}/ui-strings`);
  if (!res.ok) throw new Error('Failed to fetch UI strings');
  const data = await res.json() as UiStringsResponse;
  return data.strings;
}

// ── Saved phrases ────────────────────────────────────────────────────────────

export async function listSavedPhrases(
  kind?: SavedPhraseKind,
): Promise<SavedPhraseSummary[]> {
  const url = kind ? `${BASE}/phrases?kind=${kind}` : `${BASE}/phrases`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load saved phrases');
  const data = await res.json() as SavedPhrasesResponse;
  return data.phrases;
}

export async function fetchSavedPhrase(id: string): Promise<SavedPhraseRecord> {
  const res = await fetch(`${BASE}/phrases/${id}`);
  if (!res.ok) throw new Error('Failed to load phrase');
  return await res.json() as SavedPhraseRecord;
}

export async function savePhrase(body: SavePhraseRequest): Promise<SavedPhraseRecord> {
  const res = await fetch(`${BASE}/phrases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to save phrase');
  return await res.json() as SavedPhraseRecord;
}

export async function deleteSavedPhrase(id: string): Promise<void> {
  const res = await fetch(`${BASE}/phrases/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete phrase');
}
