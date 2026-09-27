import { useState } from "react";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import type { UiStringKey } from "@signi/shared";
import { useUiString } from "../i18n/useUiString.ts";
import { pressControl } from "../keyboard/controls.ts";

/**
 * The header's controls on a phone (P17), folded into one ⋯ button. Save, load, export and import
 * press the toolbar's own buttons, which stay mounted (hidden) and own their dialogs — the same way
 * the app's keys press them — so there is one save, not two.
 */
export function AppMenu({
  empty,
  wordsOpen,
  onToggleWords,
  onOpenHelp,
}: {
  /** Nothing on the canvas yet: nothing to save or export. */
  empty: boolean;
  wordsOpen: boolean;
  onToggleWords: () => void;
  onOpenHelp: () => void;
}) {
  const t = useUiString();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);

  const items: { key: string; label: UiStringKey; icon: React.ReactNode; run: () => void; disabled?: boolean; selected?: boolean }[] = [
    { key: "save", label: "action.save", icon: <SaveOutlinedIcon />, run: () => pressControl("save-workspace"), disabled: empty },
    { key: "load", label: "action.load", icon: <FolderOpenOutlinedIcon />, run: () => pressControl("load-workspace") },
    { key: "export", label: "action.export.tooltip", icon: <FileDownloadOutlinedIcon />, run: () => pressControl("export-workspace"), disabled: empty },
    { key: "import", label: "action.import.tooltip", icon: <FileUploadOutlinedIcon />, run: () => pressControl("import-workspace") },
    { key: "words", label: "words.heading", icon: <MenuBookIcon />, run: onToggleWords, selected: wordsOpen },
    { key: "help", label: "help.heading", icon: <HelpOutlineIcon />, run: onOpenHelp },
  ];

  return (
    <>
      <IconButton
        data-testid="app-menu"
        aria-label={t("app.menu")}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ width: 44, height: 44, color: "primary.main" }}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
        {items.map((item) => (
          <MenuItem
            key={item.key}
            data-testid={`app-menu-${item.key}`}
            disabled={item.disabled}
            selected={item.selected}
            // Pressed before the menu closes, inside the tap: a file picker opens only from a gesture.
            onClick={() => {
              item.run();
              close();
            }}
            sx={{ minHeight: 48 }}
          >
            <ListItemIcon sx={{ color: "primary.main" }}>{item.icon}</ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontFamily: '"Inter", sans-serif', fontSize: "0.95rem" }}>
              {t(item.label)}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
