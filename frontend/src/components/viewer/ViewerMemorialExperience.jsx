"use client";

import ConstellationGraph from "@/components/output/constellation";
import StorySlideshow from "@/components/output/StorySlideshow";
import PhotoArchiveSection from "@/components/viewer/PhotoArchiveSection";
import ViewerVoicesSection from "@/components/viewer/ViewerVoicesSection";

function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <p className="text-h3 text-r-text">{title}</p>
      <p className="mt-2 max-w-xs text-body-2 text-r-muted">{description}</p>
    </div>
  );
}

export default function ViewerMemorialExperience({
  activeTab,
  output,
  memorial,
  contributors = [],
  graphWidth = 1250,
  graphHeight = 800,
}) {
  if (activeTab === "Slideshow") {
    if (!output?.story?.length) {
      return (
        <EmptyState
          title="Slideshow"
          description="The memorial slideshow will appear here once generated."
        />
      );
    }
    return (
      <div className="mx-auto w-full max-w-[960px]">
        <StorySlideshow output={output} story={output?.story} />
      </div>
    );
  }

  if (activeTab === "Themes") {
    if (!output?.constellation) {
      return (
        <EmptyState
          title="Themes"
          description="Themes will appear here once the memorial has been generated."
        />
      );
    }
    return (
      <div className="py-4">
        <ConstellationGraph
          ai_output={output}
          memorial={memorial}
          contributor={contributors}
          width={graphWidth}
          height={graphHeight}
          lockedTab="Themes"
        />
      </div>
    );
  }

  if (activeTab === "Relationships") {
    if (!output?.constellation) {
      return (
        <EmptyState
          title="Relationships"
          description="Relationships will appear here once the memorial has been generated."
        />
      );
    }
    return (
      <div className="py-4">
        <ConstellationGraph
          ai_output={output}
          memorial={memorial}
          contributor={contributors}
          width={graphWidth}
          height={graphHeight}
          lockedTab="Relationships"
        />
      </div>
    );
  }

  if (activeTab === "Voices") {
    return <ViewerVoicesSection voices={output?.voices} />;
  }

  if (activeTab === "Photo Archive") {
    return <PhotoArchiveSection output={output} contributors={contributors} />;
  }

  return null;
}
