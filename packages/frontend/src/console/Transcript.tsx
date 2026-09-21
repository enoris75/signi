import { Box, IconButton, Tooltip } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import type { PhrasePlan } from "@signi/shared";
import { nounConjuncts } from "@signi/shared";
import { fetchTranslation } from "../api.ts";
import { useUiLanguage } from "../i18n/LanguageContext.tsx";
import { styleTokens } from "./language/parse.ts";
import { ECHO_PARTS } from "./language/diff.ts";
import { exampleIn, helpPage } from "./language/help.ts";
import type { Vocabulary } from "./language/types.ts";
import { useUiString } from "../i18n/useUiString.ts";
import { MONO, Token, tokenColor } from "./tokens.tsx";
import type { TranscriptEntry } from "./usePhraseConsole.ts";

/**
 * What has happened, newest last: each line typed (›), each change made on the canvas written back as
 * the command it equals (a pointer, then `/past · eat`), and each mistake. The right-hand column is
 * the period's sentence in the interface language after the change — the console teaching its own
 * language to whoever is using the mouse.
 */
export function Transcript({
  entries,
  pins,
  onPin,
  vocab,
}: {
  entries: TranscriptEntry[];
  /** The lines pinned; a typed line wears a pin to pin or unpin itself. */
  pins: readonly string[];
  onPin: (line: string, pinned: boolean) => void;
  /** The interface language's words, which a help page writes its example in. */
  vocab: Vocabulary;
}) {
  const t = useUiString();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [entries.length]);

  return (
    <Box
      data-testid="console-transcript"
      role="log"
      aria-live="polite"
      sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 0.5 }}
    >
      {entries.map((entry) => (
        <Box
          key={entry.id}
          className="transcript-row"
          data-testid={`transcript-${entry.kind}`}
          sx={{
            display: "grid",
            gridTemplateColumns: "20px minmax(0, 1fr) minmax(0, 0.8fr)",
            alignItems: "baseline",
            columnGap: 1.5,
            px: 2,
            py: 0.4,
          }}
        >
          <Box component="span" sx={{ color: "text.disabled", fontFamily: MONO, fontSize: "0.85rem", textAlign: "center" }}>
            {entry.kind === "echo" ? (
              // Named by its source: the canvas wrote this line.
              <TouchAppOutlinedIcon sx={{ fontSize: 15, verticalAlign: "-2px" }} titleAccess={t("console.fromCanvas")} />
            ) : entry.kind === "error" ? (
              <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>
                !
              </Box>
            ) : (
              "›"
            )}
          </Box>
          <Box sx={{ fontFamily: MONO, fontSize: "0.88rem", overflowWrap: "anywhere" }}>
            {entry.kind === "help" ? (
              <HelpPage name={entry.name} here={entry.here} vocab={vocab} />
            ) : entry.kind === "echo" ? (
              <Echo entry={entry} />
            ) : (
              <Line text={entry.text} />
            )}
            {entry.kind === "typed" && (
              <PinToggle pinned={pins.includes(entry.text)} onPin={(pinned) => onPin(entry.text, pinned)} />
            )}
            {entry.kind === "error" && (
              <Box sx={{ fontFamily: '"Inter", sans-serif', fontSize: "0.78rem", color: "error.main" }}>
                {entry.messageKey ? t(entry.messageKey) : entry.message}
              </Box>
            )}
            {entry.kind === "info" && (entry.detail || entry.detailKey) && (
              <Box sx={{ fontFamily: '"Inter", sans-serif', fontSize: "0.78rem", color: "text.secondary" }}>
                {entry.detailKey ? t(entry.detailKey) : entry.detail}
              </Box>
            )}
          </Box>
          <Box>
            {(entry.kind === "typed" || entry.kind === "echo" || entry.kind === "help") && entry.plan && (
              <Sentence plan={entry.plan} />
            )}
          </Box>
        </Box>
      ))}
      <div ref={end} />
    </Box>
  );
}

/** The pin a typed line wears: shown on hover or focus, and always once pinned. */
function PinToggle({ pinned, onPin }: { pinned: boolean; onPin: (pinned: boolean) => void }) {
  const t = useUiString();
  const label = pinned ? t("action.unpinLine") : t("action.pinLine");
  return (
    <Tooltip title={label}>
      <IconButton
        size="small"
        aria-label={label}
        aria-pressed={pinned}
        data-testid="pin-line"
        onClick={() => onPin(!pinned)}
        sx={{
          ml: 1,
          p: 0.25,
          verticalAlign: "-3px",
          color: pinned ? "primary.main" : "text.disabled",
          opacity: pinned ? 1 : 0,
          ".transcript-row:hover &, &:focus-visible": { opacity: 1 },
        }}
      >
        {pinned ? <PushPinIcon sx={{ fontSize: 14 }} /> : <PushPinOutlinedIcon sx={{ fontSize: 14 }} />}
      </IconButton>
    </Tooltip>
  );
}

/**
 * A command's help page: how it is written, what it does and what it acts on, its other names, the
 * values it takes, its example (whose sentence sits in the right-hand column), and what it would act
 * on where the page was asked from. Read from the catalogue as it is drawn, so it follows the
 * interface language — the usage line's placeholders, and the example's words, which are printed as
 * the source strip prints them.
 */
function HelpPage({ name, here, vocab }: { name: string; here?: string; vocab: Vocabulary }) {
  const t = useUiString();
  const page = helpPage(name, {
    word: t("console.usage.word"),
    name: t("console.usage.name"),
    command: t("console.usage.command"),
  });
  const written = page?.example;
  const example = useMemo(() => (written === undefined ? undefined : exampleIn(written, vocab)), [written, vocab]);
  if (!page || example === undefined) return null;
  const { def, usage } = page;
  const prose = { fontFamily: '"Inter", sans-serif', fontSize: "0.8rem", color: "text.secondary", lineHeight: 1.6 };
  return (
    <Box data-testid="help-page" sx={{ py: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
        <Box component="span" sx={{ fontWeight: 600, color: tokenColor(def.color) }}>
          /{def.name}
        </Box>
        <Box component="span" sx={{ ...prose, color: "text.primary" }}>
          {def.descriptionKey ? t(def.descriptionKey) : def.description}
          {def.purposeKey ? ` — ${t(def.purposeKey)}` : ""}
        </Box>
      </Box>
      {/* Each label before a colon, the value after it as the console writes it: "Usage: /pl · alias /plural". */}
      <Box sx={prose} data-testid="help-usage-line">
        {t("console.help.usage")}:{" "}
        <Box component="span" data-testid="help-usage" sx={{ fontFamily: MONO, color: "text.primary" }}>
          {usage}
        </Box>
        {def.aliases.length > 0 && (
          <Box component="span" data-testid="help-aliases">
            {" · "}
            {t(def.aliases.length === 1 ? "console.alias.singular" : "console.alias.plural")}{" "}
            {def.aliases.map((a) => `/${a}`).join(" ")}
          </Box>
        )}
      </Box>
      {def.arg.kind === "values" && (
        <Box sx={prose}>
          {def.arg.values.map((v, i) => (
            <Box component="span" key={v.name}>
              {i > 0 && " · "}
              <Box component="span" sx={{ fontFamily: MONO, color: "text.primary" }}>
                {v.name}
              </Box>{" "}
              {v.descriptionKey ? t(v.descriptionKey) : v.description}
            </Box>
          ))}
        </Box>
      )}
      <Box sx={{ ...prose, mt: 0.25 }} data-testid="help-example-line">
        {t("console.help.example")}:{" "}
        <Box component="span" data-testid="help-example" sx={{ fontFamily: MONO, fontSize: "0.85rem" }}>
          <Line text={example} />
        </Box>
      </Box>
      {here && <Box sx={{ ...prose, fontStyle: "italic" }}>{here}</Box>}
    </Box>
  );
}

/** A typed line, in its colours. */
function Line({ text }: { text: string }) {
  const styled = styleTokens(text);
  return (
    <>
      {styled.map((tok, i) => (
        <Box component="span" key={i}>
          {i > 0 && " "}
          <Token style={tok.style} italic={tok.italic}>
            {text.slice(tok.from, tok.to)}
          </Token>
        </Box>
      ))}
    </>
  );
}

/** A canvas change: `/past · eat`, several of them in a row, trailing off after a few. */
function Echo({ entry }: { entry: Extract<TranscriptEntry, { kind: "echo" }> }) {
  const shown = entry.parts.slice(0, ECHO_PARTS);
  return (
    <>
      {shown.map((part, i) => (
        <Box component="span" key={i} sx={{ mr: 2 }}>
          <Line text={part.text} />
          {part.owner && (
            <Box component="span" sx={{ fontFamily: '"Inter", sans-serif', fontSize: "0.78rem", color: "text.secondary" }}>
              {" "}
              · {part.owner}
            </Box>
          )}
        </Box>
      ))}
      {entry.parts.length > ECHO_PARTS && <Box component="span" sx={{ color: "text.disabled" }}>…</Box>}
    </>
  );
}

/**
 * The sentence a period belongs to, in the interface language — read from the same translation
 * cache the panel fills, so a sentence the panel already has costs no request.
 */
function Sentence({ plan }: { plan: Partial<PhrasePlan> }) {
  const { uiLanguage } = useUiLanguage();
  const ready = Boolean(plan.subject && nounConjuncts(plan.subject)[0]?.concept);
  const { data } = useQuery({
    queryKey: ["translation", plan],
    queryFn: () => fetchTranslation(plan as PhrasePlan),
    enabled: ready,
    staleTime: 1000 * 60,
  });
  const text = data?.find((t) => t.language === uiLanguage)?.text;
  if (!text) return null;
  return (
    <Box
      data-testid="transcript-sentence"
      sx={{ fontFamily: '"Lora", Georgia, serif', fontStyle: "italic", fontSize: "0.9rem", color: "text.secondary" }}
    >
      {text}
    </Box>
  );
}
