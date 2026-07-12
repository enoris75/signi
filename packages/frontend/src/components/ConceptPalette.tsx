import {
  Box,
  Typography,
  Skeleton,
  Stack,
  Tooltip,
} from '@mui/material';
import type { Concept, GrammaticalRole } from '@signi/shared';
import { useConcepts } from '../hooks/useConcepts.ts';
import { ConceptWord } from '../i18n/ConceptWord.tsx';
import { useUiString } from '../i18n/useUiString.ts';

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
                title={concept.description}
                placement="right"
                arrow
                enterDelay={400}
                slotProps={{ tooltip: { sx: { fontSize: '0.72rem', maxWidth: 200 } } }}
              >
              <Box
                onClick={() => disabledIds.includes(concept.id) ? undefined : onSelect(concept)}
                sx={{
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
                  bgcolor: selectedId === concept.id ? `${config.color}.50` : 'transparent',
                  fontWeight: selectedId === concept.id ? 700 : 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '&:hover': disabledIds.includes(concept.id) ? {} : {
                    bgcolor: selectedId === concept.id ? `${config.color}.100` : 'action.hover',
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
