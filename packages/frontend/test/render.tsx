import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import type { Concept, GrammaticalRole, LanguageCode, UiStringKey } from '@signi/shared';
import { LanguageProvider } from '../src/i18n/LanguageContext.tsx';

export type SeededStrings = Partial<Record<UiStringKey, Partial<Record<LanguageCode, string>>>>;

export interface Seed {
  // The UI-string bundle. Empty leaves every string on its static English fallback, exactly as
  // the app renders before the backend answers.
  strings?: SeededStrings;
  // The concept lists useConcepts(role) returns, by role.
  concepts?: Partial<Record<GrammaticalRole, Concept[]>>;
}

// Components read the backend through react-query and the UI language through its context. The
// query cache is seeded rather than fetched, so no request goes out. The providers wrap `ui` as a
// Testing Library `wrapper`, so `rerender` keeps them.
export function renderWithProviders(ui: ReactElement, { strings = {}, concepts = {} }: Seed = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(['ui-strings'], strings);
  for (const [role, list] of Object.entries(concepts)) {
    client.setQueryData(['concepts', role], list);
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <LanguageProvider>{children}</LanguageProvider>
    </QueryClientProvider>
  );
  return render(ui, { wrapper });
}
