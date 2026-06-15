"use client";

import OrganizerStorySlideshow from "@/components/organizer/outputs/OrganizerStorySlideshow";
import OrganizerThemesOutput from "@/components/organizer/outputs/OrganizerThemesOutput";
import OrganizerRelationshipsOutput from "@/components/organizer/outputs/OrganizerRelationshipsOutput";
import PhotoArchiveSection from "@/components/viewer/PhotoArchiveSection";
import ViewerVoicesSection from "@/components/viewer/ViewerVoicesSection";

function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-r-muted bg-white py-32 text-center">
      <p className="font-[family-name:var(--font-boska)] text-h3 text-r-text">{title}</p>
      <p className="mt-2 max-w-xs text-body-2 text-r-muted">{description}</p>
    </div>
  );
}

const TAB_HEADINGS = {
  Slideshow: "Stories",
  Themes: "Constellations | Themes",
  Relationships: "Constellations | Relationships",
  Voices: "Voices",
  "Photo Archive": "All Photos",
};

export default function ViewerMemorialExperience({
  activeTab,
  output,
  memorial,
  contributors = [],
}) {
  const heading = TAB_HEADINGS[activeTab] || activeTab;

  if (!output) {
    return (
      <EmptyState
        title={heading}
        description="This section will appear once the memorial has been generated."
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-[30px]">
      <h2 className="font-[family-name:var(--font-boska)] text-h2 italic text-r-secondary">{heading}</h2>

      {activeTab === "Slideshow" ? (
        <OrganizerStorySlideshow output={output} story={output?.story} />
      ) : null}

      {activeTab === "Themes" ? (
        <OrganizerThemesOutput output={output} memorial={memorial} />
      ) : null}

      {activeTab === "Relationships" ? (
        <OrganizerRelationshipsOutput
          output={output}
          memorial={memorial}
          contributors={contributors}
        />
      ) : null}

      {activeTab === "Voices" ? <ViewerVoicesSection voices={output?.voices} /> : null}

      {activeTab === "Photo Archive" ? (
        <PhotoArchiveSection output={output} contributors={contributors} />
      ) : null}
    </div>
  );
}
