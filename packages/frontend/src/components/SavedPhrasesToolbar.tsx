import { useId, useRef, useState } from "react";
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
import { conceptsQuery } from "../hooks/useConcepts.ts";
import { useUiString } from "../i18n/useUiString.ts";
import { useUiLanguage } from "../i18n/LanguageContext.tsx";
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
} from "./PhraseBuilder/phraseSerialize/index.ts";
import type { SavedPhrase, SavedPhraseRecord, SerializedWorkspace } from "@signi/shared";

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
  // Prefixes the ids that tie each row's delete button to the name it deletes.
  const rowIdPrefix = useId();
  // Saved items are dated in the UI language, not the browser's.
  const { uiLanguage } = useUiLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const [name, setName] = useState("");
  const [toast, setToast] = useState<{
    severity: "success" | "error" | "info";
    msg: string;
    // A toast may offer the way back from what it is announcing (a deletion), which is put back
    // by saving it again rather than by the workspace's own undo — it never left the workspace.
    undo?: () => void;
  } | null>(
    null,
  );

  const empty = isEmpty(containers, links);

  // Rehydrate a serialized workspace against the catalog and hand it to the app. The catalog is
  // awaited, not read off a hook: a phrase loaded before it arrives would find none of its words.
  async function applyWorkspace(workspace: SerializedWorkspace) {
    const catalog = await queryClient.ensureQueryData(conceptsQuery());
    const { containers: hydrated, links: hydratedLinks, missing } = hydrateWorkspace(
      workspace,
      catalog,
    );
    onLoad(hydrated, hydratedLinks);
    if (missing.length > 0) {
      setToast({
        severity: "error",
        msg: `Loaded, but ${missing.length} word(s) are no longer in the catalog: ${missing.join(", ")}`,
      });
    } else {
      setToast({ severity: "success", msg: t("toast.phraseLoaded") });
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
      setToast({ severity: "success", msg: t("toast.phraseSaved") });
    },
    onError: () => setToast({ severity: "error", msg: "Could not save the phrase." }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSavedPhrase(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedPhrases"] }),
  });

  /**
   * Delete a saved phrase, and offer it back.
   *
   * The deletion happens at once — no dialog asking whether it was meant — and the toast holds
   * what it was, so putting it back is saving it again. It comes back under a new id, which
   * nothing refers to: a saved phrase is named by its name.
   */
  async function handleDelete(id: string, name: string) {
    let record: SavedPhraseRecord | undefined;
    // Read it before it goes, or there is nothing to put back.
    try {
      record = await fetchSavedPhrase(id);
    } catch {
      // Unreadable: the row is still deleted, only without the way back.
    }
    deleteMutation.mutate(id);
    setToast({
      severity: "info",
      msg: `${t("action.deleteSavedPhrase")} — ${name}`,
      undo: record
        ? () => {
            savePhrase({
              name: record!.name,
              kind: record!.kind,
              workspace: record!.workspace,
            })
              .then(() => queryClient.invalidateQueries({ queryKey: ["savedPhrases"] }))
              .catch(() => setToast({ severity: "error", msg: "Could not put it back." }));
          }
        : undefined,
    });
  }

  async function handleLoad(id: string) {
    try {
      const record = await fetchSavedPhrase(id);
      await applyWorkspace(record.workspace);
      setLoadOpen(false);
    } catch {
      setToast({ severity: "error", msg: "Could not load that phrase." });
    }
  }

  function handleExport() {
    downloadSavedPhrase(toSavedPhrase(name.trim() || t("phrase.untitled"), containers, links));
  }

  async function handleImportFile(file: File) {
    let doc: SavedPhrase;
    try {
      doc = await readSavedPhraseFile(file);
    } catch (err) {
      // Every reason a file is refused comes down to one thing the user can act on: pick another. The
      // particular reason (not JSON, not a Signi file, no version…) goes to the console.
      console.warn(err);
      setToast({ severity: "error", msg: `${t("toast.importFailed")} — ${t("toast.invalidFile")}` });
      return;
    }
    try {
      await applyWorkspace(doc.workspace);
    } catch {
      setToast({ severity: "error", msg: t("toast.importFailed") });
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
            data-kb-control="save-workspace"
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
          data-kb-control="load-workspace"
          onClick={() => setLoadOpen(true)}
          sx={{ textTransform: "none" }}
        >
          {t("action.load")}
        </Button>
      </Tooltip>
      <Tooltip title={t("action.export.tooltip")}>
        {/* The span lets the tooltip show while the button is disabled, but takes the tooltip's
            label with it, so the button is named in its own right. */}
        <span>
          <IconButton
            size="small"
            data-kb-control="export-workspace"
            onClick={handleExport}
            disabled={empty}
            aria-label={t("action.export.tooltip")}
          >
            <FileDownloadOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("action.import.tooltip")}>
        <IconButton
          size="small"
          data-kb-control="import-workspace"
          onClick={() => fileInputRef.current?.click()}
        >
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
        <DialogTitle>{t("action.save.tooltip")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t("field.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && name.trim() && !saveMutation.isPending) {
                saveMutation.mutate();
              }
            }}
            sx={{ mt: 1 }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
            <Button onClick={() => setSaveOpen(false)} sx={{ textTransform: "none" }}>
              {t("action.cancel")}
            </Button>
            <Button
              variant="contained"
              disableElevation
              disabled={!name.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
              sx={{ textTransform: "none" }}
            >
              {t("action.save")}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Load dialog: pick from saved phrases, or delete one. */}
      <Dialog open={loadOpen} onClose={() => setLoadOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{t("action.load.tooltip")}</DialogTitle>
        <DialogContent>
          {listQuery.isLoading && <Typography color="text.secondary">{t("status.loading")}…</Typography>}
          {listQuery.isError && <Alert severity="error">Could not load saved phrases.</Alert>}
          {listQuery.data && listQuery.data.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2 }}>
              {t("saved.noPhrases")}
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
                    onClick={() => void handleDelete(p.id, p.name)}
                    // The label says what the button does; the row's name, which a plan cannot
                    // carry, is read out as its description.
                    aria-label={t("action.deleteSavedPhrase")}
                    aria-describedby={`${rowIdPrefix}-name-${p.id}`}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => void handleLoad(p.id)}>
                  <ListItemText
                    primary={p.name}
                    primaryTypographyProps={{ id: `${rowIdPrefix}-name-${p.id}` }}
                    secondary={`${p.author} · ${new Date(p.updatedAt).toLocaleString(uiLanguage)}`}
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
          <Alert
            severity={toast.severity}
            onClose={() => setToast(null)}
            variant="filled"
            action={
              toast.undo ? (
                <Button
                  size="small"
                  color="inherit"
                  data-testid="undo-delete"
                  onClick={() => {
                    toast.undo!();
                    setToast(null);
                  }}
                  sx={{ textTransform: "none" }}
                >
                  Undo
                </Button>
              ) : undefined
            }
          >
            {toast.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
