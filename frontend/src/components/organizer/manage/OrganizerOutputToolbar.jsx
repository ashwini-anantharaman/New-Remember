"use client";

import OrganizerButton from "@/components/organizer/shell/OrganizerButton.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getOutputPageLabel } from "@/lib/organizer/outputPages";

export default function OrganizerOutputToolbar({
  page,
  pageIndex,
  totalPages,
  onPrev,
  onNext,
  onGenerate,
  generating,
  canGenerate,
}) {
  const { primary, secondary } = getOutputPageLabel(page);

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <h2 className="font-[family-name:var(--font-boska)] text-h2 italic text-r-secondary">
        {secondary ? (
          <>
            <span>{primary} </span>
            <span className="font-[family-name:var(--font-boska)] font-medium not-italic">| </span>
            <span>{secondary}</span>
          </>
        ) : (
          primary
        )}
      </h2>

      <div className="flex w-full max-w-[433px] items-center justify-between gap-4">
        <OrganizerButton
          variant="compact"
          className="max-w-[207px] shrink-0"
          onClick={onGenerate}
          disabled={!canGenerate || generating}
        >
          {generating ? "Generating..." : "Generate"}
        </OrganizerButton>

        <div className="flex items-center gap-4 text-r-text">
          <button
            type="button"
            onClick={onPrev}
            disabled={pageIndex <= 0}
            className="rounded p-1 transition hover:bg-r-card disabled:opacity-30"
            aria-label="Previous output"
          >
            <ChevronLeft size={22} />
          </button>
          <span className="font-[family-name:var(--font-boska)] text-h3 text-r-text">
            {pageIndex + 1}/{totalPages}
          </span>
          <button
            type="button"
            onClick={onNext}
            disabled={pageIndex >= totalPages - 1}
            className="rounded p-1 transition hover:bg-r-card disabled:opacity-30"
            aria-label="Next output"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
