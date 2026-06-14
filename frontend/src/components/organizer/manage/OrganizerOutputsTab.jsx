"use client";

import { useState } from "react";
import OrganizerStorySlideshow from "@/components/organizer/outputs/OrganizerStorySlideshow";
import OrganizerThemesOutput from "@/components/organizer/outputs/OrganizerThemesOutput";
import OrganizerRelationshipsOutput from "@/components/organizer/outputs/OrganizerRelationshipsOutput";
import ViewerVoicesSection from "@/components/viewer/ViewerVoicesSection";
import PhotoArchiveSection from "@/components/viewer/PhotoArchiveSection";
import OrganizerOutputToolbar from "@/components/organizer/manage/OrganizerOutputToolbar";
import { ORGANIZER_OUTPUT_PAGES } from "@/lib/organizer/outputPages";
import { PreGenerationEmpty, TabError, TabLoading } from "@/components/organizer/manage/OrganizerTabStates";

export default function OrganizerOutputsTab({
  memorial,
  contributors,
  output,
  loading,
  error,
  onRetry,
  canGenerate,
  disabledMessage,
  generationError,
  generating,
  onGenerate,
}) {
  const [pageIndex, setPageIndex] = useState(0);
  const page = ORGANIZER_OUTPUT_PAGES[pageIndex];

  if (loading) return <TabLoading />;

  if (error) {
    return (
      <TabError
        title="Unable to load outputs"
        message="The generated memorial output could not be loaded. Archive and Contributions are still available."
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="flex flex-col gap-[30px] pt-6">
      <OrganizerOutputToolbar
        page={page}
        pageIndex={pageIndex}
        totalPages={ORGANIZER_OUTPUT_PAGES.length}
        onPrev={() => setPageIndex((index) => Math.max(0, index - 1))}
        onNext={() => setPageIndex((index) => Math.min(ORGANIZER_OUTPUT_PAGES.length - 1, index + 1))}
        onGenerate={onGenerate}
        generating={generating}
        canGenerate={canGenerate}
      />

      {!output ? (
        <PreGenerationEmpty
          canGenerate={canGenerate}
          disabledMessage={disabledMessage}
          generationError={generationError}
          generating={generating}
          onGenerate={onGenerate}
        />
      ) : (
        <div className="w-full">
          {page.id === "stories" ? <OrganizerStorySlideshow output={output} story={output?.story} /> : null}
          {page.id === "themes" ? <OrganizerThemesOutput output={output} memorial={memorial} /> : null}
          {page.id === "relationships" ? (
            <OrganizerRelationshipsOutput
              output={output}
              memorial={memorial}
              contributors={contributors}
            />
          ) : null}
          {page.id === "voices" ? <ViewerVoicesSection voices={output?.voices} /> : null}
          {page.id === "photos" ? <PhotoArchiveSection output={output} contributors={contributors} /> : null}
        </div>
      )}
    </div>
  );
}
