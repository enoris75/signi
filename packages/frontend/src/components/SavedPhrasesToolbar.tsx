import { useRef, useState } from "react";
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
  Tooltip,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteSavedPhrase,
  fetchSavedPhrase,
  listSavedPhrases,
  savePhrase,
} from "../api.ts";
import { useConcepts } from "../hooks/useConcepts.ts";
import { useUiString } from "../i18n/useUiString.ts";
import type {
  PhraseContainer,
  PhraseLink,
} from "./PhraseBuilder/interfaces.ts";
import {
  downloadSavedPhrase,
  hydrateWorkspace,
  readSavedPhraseFile,
  serializeWorkspace,
  toSavedPhrase,
} from "./PhraseBuilder/phraseSerialize.ts";
import type { SerializedWorkspace } from "@signi/shared";

interface Props {
  containers: PhraseContainer[];
  links: PhraseLink[];
  onLoad: (containers: PhraseContainer[], links: PhraseLink[]) => void;
}

// The builder is empty when it's just one blank container and no links — nothing worth
// saving or exporting yet.
const isEmpty = (containers: PhraseContainer[], links: PhraseLink[]): boolean =>
  links.length === 0 &&
  containers.every((c) => Object.keys(c.selection).length === 0);

export function SavedPhrasesToolbar({ containers, links, onLoad }: Props) {
  const t = useUiString();
  const queryClient = useQueryClient();
  const { data: concepts } = useConcepts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [name, setName] = useState("");
  const [toast, setToast] = useState<{ severity: "success" | "error"; msg: string } | null>(
    null,
  );

  const empty = isEmpty(containers, links);

  // Rehydrate a serialized workspace against the live catalog and hand it to the app.
  function applyWorkspace(workspace: SerializedWorkspace) {
    const { containers: hydrated, links: hydratedLinks, missing } = hydrateWorkspace(
      workspace,
      concepts ?? [],
    );
    onLoad(hydrated, hydratedLinks);
    if (missing.length > 0) {
      setToast({
        severity: "error",
        msg: `Loaded, but ${missing.length} word(s) are no longer in the catalog: ${missing.join(", ")}`,
      });
    } else {
      setToast({ severity: "success", msg: "Phrase loaded." });
    }
  }

  const listQuery = useQuery({
    queryKey: ["savedPhrases", "phrase"],
    queryFn: () => listSavedPhrases("phrase"),
    enabled: loadOpen,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      savePhrase({
        name: name.trim(),
        kind: "phrase",
        workspace: serializeWorkspace(containers, links),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedPhrases"] });
      setSaveOpen(false);
      setName("");
      setToast({ severity: "success", msg: "Phrase saved." });
    },
    onError: () => setToast({ severity: "error", msg: "Could not save the phrase." }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSavedPhrase(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedPhrases"] }),
  });

  async function handleLoad(id: string) {
    try {
      const record = await fetchSavedPhrase(id);
      applyWorkspace(record.workspace);
      setLoadOpen(false);
    } catch {
      setToast({ severity: "error", msg: "Could not load that phrase." });
    }
  }

  function handleExport() {
    downloadSavedPhrase(toSavedPhrase(name.trim() || "Untitled phrase", containers, links));
  }

  async function handleImportFile(file: File) {
    try {
      const doc = await readSavedPhraseFile(file);
      applyWorkspace(doc.workspace);
    } catch (err) {
      setToast({ severity: "error", msg: err instanceof Error ? err.message : "Import failed." });
    }
  }

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Tooltip title={t("action.save.tooltip")}>
        <span>
          <Button
            variant="outlined"
            size="small"
            disableElevation
            startIcon={<SaveOutlinedIcon />}
            onClick={() => setSaveOpen(true)}
            disabled={empty}
            sx={{ textTransform: "none" }}
          >
            {t("action.save")}
          </Button>
        </span>
      </Tooltip>
      <Tooltip title={t("action.load.tooltip")}>
        <Button
          variant="outlined"
          size="small"
          disableElevation
          startIcon={<FolderOpenOutlinedIcon />}
          onClick={() => setLoadOpen(true)}
          sx={{ textTransform: "none" }}
        >
          {t("action.load")}
        </Button>
      </Tooltip>
      <Tooltip title={t("action.export.tooltip")}>
        <span>
          <IconButton size="small" onClick={handleExport} disabled={empty}>
            <FileDownloadOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("action.import.tooltip")}>
        <IconButton size="small" onClick={() => fileInputRef.current?.click()}>
          <FileUploadOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImportFile(file);
          e.target.value = ""; // allow re-picking the same file
        }}
      />

      {/* Save dialog: name the phrase before persisting it to the DB. */}
      <Dialog open={saveOpen} onClose={() => setSaveOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Save phrase</DialogTitle>
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
            <Button onClick={() => setSaveOpen(false)} sx={{ textTransform: "none" }}>
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

      {/* Load dialog: pick from saved phrases, or delete one. */}
      <Dialog open={loadOpen} onClose={() => setLoadOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Load phrase</DialogTitle>
        <DialogContent>
          {listQuery.isLoading && <Typography color="text.secondary">Loading…</Typography>}
          {listQuery.isError && <Alert severity="error">Could not load saved phrases.</Alert>}
          {listQuery.data && listQuery.data.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              No saved phrases yet.
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
    </Box>
  );
}
