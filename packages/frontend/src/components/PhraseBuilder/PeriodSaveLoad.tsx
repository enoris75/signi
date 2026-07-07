import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteSavedPhrase,
  fetchSavedPhrase,
  listSavedPhrases,
  savePhrase,
} from "../../api.ts";
import { useConcepts } from "../../hooks/useConcepts.ts";
import type { PhraseContainer, PhraseSelection } from "./interfaces.ts";
import { hydrateWorkspace, serializePeriod } from "./phraseSerialize.ts";

interface Props {
  // The container whose clause is being saved (dialog open while non-null).
  saveTarget: PhraseContainer | null;
  onCloseSave: () => void;
  // The period picker (load-into-a-new-container).
  loadOpen: boolean;
  onCloseLoad: () => void;
  // Append a loaded period's clause as a new container (the workspace assigns its id).
  onAppendPeriod: (selection: PhraseSelection) => void;
}

// Dialogs + queries for saving a single period and loading one into a new container. A
// period is one clause: no cross-container links, but its nested possessors travel with it.
export function PeriodSaveLoad({
  saveTarget,
  onCloseSave,
  loadOpen,
  onCloseLoad,
  onAppendPeriod,
}: Props) {
  const queryClient = useQueryClient();
  const { data: concepts } = useConcepts();
  const [name, setName] = useState("");
  const [toast, setToast] = useState<{ severity: "success" | "error"; msg: string } | null>(
    null,
  );

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!saveTarget) throw new Error("No period to save");
      return savePhrase({
        name: name.trim(),
        kind: "period",
        workspace: serializePeriod(saveTarget),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedPhrases"] });
      setName("");
      onCloseSave();
      setToast({ severity: "success", msg: "Period saved." });
    },
    onError: () => setToast({ severity: "error", msg: "Could not save the period." }),
  });

  const listQuery = useQuery({
    queryKey: ["savedPhrases", "period"],
    queryFn: () => listSavedPhrases("period"),
    enabled: loadOpen,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSavedPhrase(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedPhrases"] }),
  });

  async function handleLoad(id: string) {
    try {
      const record = await fetchSavedPhrase(id);
      const { containers, missing } = hydrateWorkspace(record.workspace, concepts ?? []);
      const selection = containers[0]?.selection;
      if (!selection) throw new Error("empty period");
      onAppendPeriod(selection);
      onCloseLoad();
      setToast(
        missing.length > 0
          ? {
              severity: "error",
              msg: `Loaded, but ${missing.length} word(s) are no longer in the catalog: ${missing.join(", ")}`,
            }
          : { severity: "success", msg: "Period added." },
      );
    } catch {
      setToast({ severity: "error", msg: "Could not load that period." });
    }
  }

  return (
    <>
      {/* Save dialog: name the period before persisting it. */}
      <Dialog open={Boolean(saveTarget)} onClose={onCloseSave} fullWidth maxWidth="xs">
        <DialogTitle>Save period</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim()) saveMutation.mutate();
            }}
            sx={{ mt: 1 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button onClick={onCloseSave} sx={{ textTransform: "none" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disableElevation
              disabled={!name.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              sx={{ textTransform: "none" }}
            >
              Save
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Load dialog: pick a saved period to append as a new container. */}
      <Dialog open={loadOpen} onClose={onCloseLoad} fullWidth maxWidth="xs">
        <DialogTitle>Add saved period</DialogTitle>
        <DialogContent>
          {listQuery.isLoading && <Typography color="text.secondary">Loading…</Typography>}
          {listQuery.isError && <Alert severity="error">Could not load saved periods.</Alert>}
          {listQuery.data && listQuery.data.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No saved periods yet — use the save icon on a phrase container.
            </Typography>
          )}
          <List dense>
            {listQuery.data?.map((p) => (
              <ListItem
                key={p.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => deleteMutation.mutate(p.id)}
                    aria-label={`Delete ${p.name}`}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => void handleLoad(p.id)}>
                  <ListItemText
                    primary={p.name}
                    secondary={`${p.author} · ${new Date(p.updatedAt).toLocaleString()}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} variant="filled">
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}
