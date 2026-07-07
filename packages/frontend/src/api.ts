import type {
  Concept,
  GrammaticalRole,
  PhrasePlan,
  SavePhraseRequest,
  SavedPhraseRecord,
  SavedPhraseSummary,
  SavedPhrasesResponse,
  Translation,
} from '@signi/shared';

const BASE = '/api';

export async function fetchConcepts(role?: GrammaticalRole): Promise<Concept[]> {
  const url = role ? `${BASE}/concepts?role=${role}` : `${BASE}/concepts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch concepts');
  const data = await res.json() as { concepts: Concept[] };
  return data.concepts;
}

export async function fetchTranslation(plan: PhrasePlan): Promise<Translation[]> {
  const res = await fetch(`${BASE}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new Error('Translation failed');
  const data = await res.json() as { translations: Translation[] };
  return data.translations;
}

// ── Saved phrases ────────────────────────────────────────────────────────────

export async function listSavedPhrases(): Promise<SavedPhraseSummary[]> {
  const res = await fetch(`${BASE}/phrases`);
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
