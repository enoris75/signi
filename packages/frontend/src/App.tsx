import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Divider,
  Alert,
} from "@mui/material";
import type { Concept, PhrasePlan } from "@signi/shared";
import ConceptPalette from "./components/ConceptPalette.tsx";
import {
  PhraseBuilder,
  getActiveSlots,
} from "./components/PhraseBuilder/PhraseBuilder.tsx";
import { type SlotKey } from "./components/PhraseBuilder/interfaces.ts";
import { type GenderSlot } from "./components/PhraseBuilder/interfaces.ts";
import { type NumberSlot } from "./components/PhraseBuilder/interfaces.ts";
import { type PhraseSelection } from "./components/PhraseBuilder/interfaces.ts";
import TranslationPanel from "./components/TranslationPanel.tsx";
import { useTranslation } from "./hooks/useTranslation.ts";

export default function App() {
  const [selection, setSelection] = useState<PhraseSelection>({});
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>("verb");

  const plan: Partial<PhrasePlan> = {
    subject: selection.subject?.id,
    subjectNumber: selection.subjectNumber,
    subjectGender: selection.subjectGender,
    subjectAdjective: selection.subjectAdjective?.id,
    verb: selection.verb?.id,
    directObject: selection.directObject?.id,
    directObjectNumber: selection.directObjectNumber,
    directObjectGender: selection.directObjectGender,
    indirectObject: selection.indirectObject?.id,
    indirectObjectNumber: selection.indirectObjectNumber,
    indirectObjectGender: selection.indirectObjectGender,
    modifier: selection.modifier?.id,
  };

  const { data: translations, isLoading, isError } = useTranslation(plan);
  const isReady = Boolean(plan.subject && plan.verb);

  const visibleSlots = getActiveSlots(
    selection.verb?.transitivity,
    selection.subject?.role,
  );
  const activeSlotConfig =
    visibleSlots.find((s) => s.key === activeSlot) ?? null;

  function handleConceptSelect(concept: Concept, targetSlot?: SlotKey) {
    const slot = targetSlot ?? activeSlot;
    if (!slot) return;

    setSelection((prev) => {
      const next = { ...prev, [slot]: concept };
      if (slot === "verb") {
        const nowVisible = getActiveSlots(
          concept.transitivity,
          prev.subject?.role,
        ).map((s) => s.key);
        if (!nowVisible.includes("directObject")) {
          delete next.directObject;
          delete next.directObjectNumber;
        }
        if (!nowVisible.includes("indirectObject")) {
          delete next.indirectObject;
          delete next.indirectObjectNumber;
        }
        if (!nowVisible.includes("subjectAdjective"))
          delete next.subjectAdjective;
      }
      if (slot === "subject") {
        delete next.subjectAdjective;
        if (concept.role === "pronoun") {
          next.subjectNumber = "singular";
          if (concept.person === "3") {
            next.subjectGender = prev.subjectGender ?? "masc";
          } else {
            delete next.subjectGender;
          }
        } else if (concept.role === "noun") {
          if (concept.gendered) {
            next.subjectGender = prev.subjectGender ?? "masc";
          } else {
            delete next.subjectGender;
          }
        } else {
          delete next.subjectNumber;
          delete next.subjectGender;
        }
      }
      if (slot === "directObject") {
        if (concept.gendered) {
          next.directObjectGender = prev.directObjectGender ?? "masc";
        } else {
          delete next.directObjectGender;
        }
      }
      if (slot === "indirectObject") {
        if (concept.gendered) {
          next.indirectObjectGender = prev.indirectObjectGender ?? "masc";
        } else {
          delete next.indirectObjectGender;
        }
      }
      return next;
    });

    // Auto-advance to next empty slot
    const slots =
      slot === "verb"
        ? getActiveSlots(concept.transitivity, selection.subject?.role)
        : visibleSlots;
    if (slot === "verb") {
      const subjectEmpty = !selection.subject;
      setActiveSlot(
        subjectEmpty
          ? "subject"
          : (slots.find((s) => s.key !== "verb" && !selection[s.key])?.key ??
              null),
      );
    } else {
      const currentIdx = slots.findIndex((s) => s.key === slot);
      const nextSlot = slots
        .slice(currentIdx + 1)
        .find((s) => !selection[s.key]);
      if (nextSlot) setActiveSlot(nextSlot.key);
    }
  }

  function handleSlotClick(slot: SlotKey) {
    setActiveSlot(slot);
  }

  function handleClear(slot: SlotKey) {
    setSelection((prev) => {
      const next = { ...prev };
      delete next[slot];
      if (slot === "verb") {
        delete next.directObject;
        delete next.directObjectNumber;
        delete next.directObjectGender;
        delete next.indirectObject;
        delete next.indirectObjectNumber;
        delete next.indirectObjectGender;
        delete next.subjectAdjective;
      }
      if (slot === "subject") {
        delete next.subjectAdjective;
        delete next.subjectNumber;
        delete next.subjectGender;
      }
      if (slot === "directObject") {
        delete next.directObjectNumber;
        delete next.directObjectGender;
      }
      if (slot === "indirectObject") {
        delete next.indirectObjectNumber;
        delete next.indirectObjectGender;
      }
      return next;
    });
    if (slot === "verb") setActiveSlot("verb");
  }

  function handleToggleNumber(which: NumberSlot) {
    const key = `${which}Number` as keyof PhraseSelection;
    setSelection((prev) => ({
      ...prev,
      [key]: prev[key] === "plural" ? "singular" : "plural",
    }));
  }

  function handleToggleGender(which: GenderSlot) {
    const key = `${which}Gender` as keyof PhraseSelection;
    setSelection((prev) => ({
      ...prev,
      [key]: prev[key] === "fem" ? "masc" : "fem",
    }));
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderTop: "3px solid",
          borderBottom: "1px solid",
          borderColor: "primary.main",
          borderBottomColor: "divider",
          py: 2,
          px: 3,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 800,
              lineHeight: 1,
              color: "text.primary",
            }}
          >
            Signi
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            Semantic phrase translator · 7 languages
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Left: phrase diagram with inline word palette sidebar */}
          <Grid item xs={12} md={7}>
            <PhraseBuilder
              selection={selection}
              activeSlot={activeSlot}
              onSlotClick={handleSlotClick}
              onClear={handleClear}
              onToggleNumber={handleToggleNumber}
              onToggleGender={handleToggleGender}
              onConceptSelect={(slot, concept) =>
                handleConceptSelect(concept, slot)
              }
              sidebar={
                <Box>
                  <Typography
                    sx={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "text.secondary",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    {activeSlotConfig ? activeSlotConfig.label : "Words"}
                  </Typography>
                  {activeSlotConfig ? (
                    activeSlotConfig.roles.map((role) => (
                      <ConceptPalette
                        key={role}
                        role={role}
                        onSelect={handleConceptSelect}
                        selectedId={selection[activeSlot as SlotKey]?.id}
                      />
                    ))
                  ) : (
                    <>
                      <Typography
                        color="text.secondary"
                        sx={{ fontSize: "0.72rem", fontStyle: "italic", mb: 1 }}
                      >
                        Click a slot to filter.
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      {visibleSlots.map((slot) =>
                        slot.roles.map((role) => (
                          <ConceptPalette
                            key={`${slot.key}-${role}`}
                            role={role}
                            onSelect={(c) => {
                              setActiveSlot(slot.key);
                              setSelection((prev) => ({
                                ...prev,
                                [slot.key]: c,
                              }));
                            }}
                            selectedId={selection[slot.key]?.id}
                          />
                        )),
                      )}
                    </>
                  )}
                </Box>
              }
            />
          </Grid>

          {/* Right: translations */}
          <Grid item xs={12} md={5}>
            {isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Could not reach the translation server.
              </Alert>
            )}
            <TranslationPanel
              translations={translations}
              isLoading={isLoading}
              isReady={isReady}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
