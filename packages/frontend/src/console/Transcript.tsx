import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import TouchAppOutlinedIcon from "@mui/icons-material/TouchAppOutlined";
import type { PhrasePlan } from "@signi/shared";
import { nounConjuncts } from "@signi/shared";
import { fetchTranslation } from "../api.ts";
import { useUiLanguage } from "../i18n/LanguageContext.tsx";
import { styleTokens } from "./language/parse.ts";
import { ECHO_PARTS } from "./language/diff.ts";
import { MONO, Token } from "./tokens.tsx";
import type { TranscriptEntry } from "./usePhraseConsole.ts";

/**
 * What has happened, newest last: each line typed (›), each change made on the canvas written back as
 * the command it equals (a pointer, then `/past · eat`), and each mistake. The right-hand column is
 * the period's sentence in the interface language after the change — the console teaching its own
 * language to whoever is using the mouse.
 */
export function Transcript({ entries }: { entries: TranscriptEntry[] }) {
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
              <TouchAppOutlinedIcon sx={{ fontSize: 15, verticalAlign: "-2px" }} titleAccess="from the canvas" />
            ) : entry.kind === "error" ? (
              <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>
                !
              </Box>
            ) : (
              "›"
            )}
          </Box>
          <Box sx={{ fontFamily: MONO, fontSize: "0.88rem", overflowWrap: "anywhere" }}>
            {entry.kind === "echo" ? <Echo entry={entry} /> : <Line text={entry.text} />}
            {entry.kind === "error" && (
              <Box sx={{ fontFamily: '"Inter", sans-serif', fontSize: "0.78rem", color: "error.main" }}>{entry.message}</Box>
            )}
            {entry.kind === "info" && entry.detail && (
              <Box sx={{ fontFamily: '"Inter", sans-serif', fontSize: "0.78rem", color: "text.secondary" }}>{entry.detail}</Box>
            )}
          </Box>
          <Box>{(entry.kind === "typed" || entry.kind === "echo") && entry.plan && <Sentence plan={entry.plan} />}</Box>
        </Box>
      ))}
      <div ref={end} />
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
