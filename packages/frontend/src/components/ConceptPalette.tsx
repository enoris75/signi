import {
  alpha,
  Box,
  Typography,
  Skeleton,
  Stack,
  Tooltip,
} from '@mui/material';
import type { Concept, GrammaticalRole } from '@signi/shared';
import { useConcepts } from '../hooks/useConcepts.ts';
import { ConceptWord } from '../i18n/ConceptWord.tsx';
import { useConceptDefinition } from '../i18n/useConceptLabel.ts';
import { useUiString } from '../i18n/useUiString.ts';
import { focusRing } from '../keyboard/focusRing.ts';

const ROLE_CONFIG: Record<GrammaticalRole, { color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' }> = {
  pronoun: { color: 'primary' },
  noun: { color: 'success' },
  verb: { color: 'secondary' },
  adjective: { color: 'warning' },
  adverb: { color: 'info' },
};

interface Props {
  role: GrammaticalRole;
  onSelect: (concept: Concept) => void;
  selectedId?: string;
  disabledIds?: string[];
}

export default function ConceptPalette({ role, onSelect, selectedId, disabledIds = [] }: Props) {
  const { data: concepts, isLoading } = useConcepts(role);
  const t = useUiString();
  // The word's definition in the UI language, as every other word list shows it on hover — not the
  // seed's English `description`, which the hook falls back to only when no definition was rendered.
  const definition = useConceptDefinition();
  const config = ROLE_CONFIG[role];

  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        sx={{
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.58rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          display: 'block',
          mb: 0.75,
        }}
      >
        {t(`palette.${role}`)}
      </Typography>
      <Stack direction="column" gap={0}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="text" width="90%" height={28} />
            ))
          : concepts?.map((concept) => (
              <Tooltip
                key={concept.id}
                title={definition(concept)}
                placement="right"
                arrow
                enterDelay={400}
                slotProps={{ tooltip: { sx: { fontSize: '0.72rem', maxWidth: 200 } } }}
              >
              <Box
                // A real button: the panel is a list of words to choose from, and choosing one
                // with ↵ is the whole point of reaching it by key (see PhraseSidebar).
                component="button"
                type="button"
                data-kb-word={concept.id}
                disabled={disabledIds.includes(concept.id)}
                onClick={() => disabledIds.includes(concept.id) ? undefined : onSelect(concept)}
                sx={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  appearance: 'none',
                  border: 'none',
                  ...focusRing(config.color),
                  px: 1,
                  py: 0.35,
                  borderRadius: 1,
                  cursor: disabledIds.includes(concept.id) ? 'default' : 'pointer',
                  fontFamily: '"Lora", Georgia, serif',
                  fontSize: '0.82rem',
                  fontStyle: 'italic',
                  color: disabledIds.includes(concept.id)
                    ? 'text.disabled'
                    : selectedId === concept.id
                      ? `${config.color}.dark`
                      : 'text.primary',
                  // The theme has no 50…900 scale, so the selected wash is derived from `main`.
                  bgcolor: selectedId === concept.id
                    ? (t) => alpha(t.palette[config.color].main, t.palette.action.selectedOpacity)
                    : 'transparent',
                  fontWeight: selectedId === concept.id ? 700 : 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '&:hover': disabledIds.includes(concept.id) ? {} : {
                    bgcolor: selectedId === concept.id
                      ? (t) =>
                          alpha(
                            t.palette[config.color].main,
                            t.palette.action.selectedOpacity + t.palette.action.hoverOpacity,
                          )
                      : 'action.hover',
                  },
                }}
              >
                <ConceptWord concept={concept} />
              </Box>
              </Tooltip>
            ))}
      </Stack>
    </Box>
  );
}
