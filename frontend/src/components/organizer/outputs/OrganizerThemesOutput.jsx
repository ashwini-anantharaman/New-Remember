"use client";

import { useMemo, useState } from "react";
import OrganizerConstellationDiagram from "@/components/organizer/outputs/OrganizerConstellationDiagram";
import OrganizerConstellationNodeModal from "@/components/organizer/outputs/OrganizerConstellationNodeModal";
import { mapThemeNodes } from "@/lib/organizer/constellationData";

function ThemeCard({ theme, checked, onToggle }) {
  return (
    <article className="flex items-start justify-between gap-6 rounded-[10px] border border-r-muted p-[30px]">
      <div className="flex flex-1 items-start gap-[70px]">
        <label className="shrink-0 pt-1">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="size-[18px] cursor-pointer accent-r-text"
          />
        </label>
        <div className="max-w-[430px]">
          <h3 className="font-[family-name:var(--font-boska)] text-h3 text-r-text">{theme.name}</h3>
          <p className="mt-2 text-body-2 text-r-text">
            {theme.summary || "This section would contain a few sentences about this theme that the AI has surfaced."}
          </p>
          <p className="mt-2 text-caption text-r-secondary">
            {theme.contributions} tagged photo{theme.contributions === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="grid w-[600px] shrink-0 grid-cols-1 gap-4">
        {(theme.photo_urls?.length ? theme.photo_urls : [null, null]).slice(0, 2).map((photoUrl, index) => (
          <div key={index} className="overflow-hidden rounded-[10px] bg-r-btn">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="h-[258px] w-full object-cover" />
            ) : (
              <div className="h-[258px] w-full bg-r-btn" />
            )}
          </div>
        ))}
      </div>
    </article>
  );
}

export default function OrganizerThemesOutput({ output, memorial }) {
  const themes = useMemo(
    () => mapThemeNodes(output?.constellation?.nodes),
    [output?.constellation?.nodes],
  );
  const [hiddenThemes, setHiddenThemes] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);

  const visibleThemes = themes.filter((theme) => !hiddenThemes[theme.id]);
  const diagramNodes = visibleThemes.map((theme) => ({
    id: theme.id,
    label: theme.name,
    prominence: theme.prominence,
    summary: theme.summary,
    discoveryAngle: theme.discoveryAngle,
    quotes: theme.quotes,
    photo_urls: theme.photo_urls,
    category: theme.category,
  }));

  const modalNode = selectedNode
    ? {
        ...selectedNode,
        label: selectedNode.label || selectedNode.name,
      }
    : null;

  return (
    <div className="flex flex-col gap-[30px]">
      <OrganizerConstellationDiagram
        mode="themes"
        satellites={diagramNodes}
        centerLabel={memorial?.subject_name || memorial?.deceased_name || null}
        selectedNodeId={selectedNode?.id || null}
        onNodeClick={(node) => setSelectedNode(node)}
      />

      <OrganizerConstellationNodeModal
        mode="themes"
        node={modalNode}
        onClose={() => setSelectedNode(null)}
      />

      <div className="flex flex-col gap-[30px]">
        <h3 className="font-[family-name:var(--font-boska)] text-h2 italic text-r-secondary">Themes</h3>
        <div className="flex flex-col gap-[30px]">
          {themes.length ? (
            themes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                checked={!hiddenThemes[theme.id]}
                onToggle={() =>
                  setHiddenThemes((prev) => ({
                    ...prev,
                    [theme.id]: !prev[theme.id],
                  }))
                }
              />
            ))
          ) : (
            <p className="text-body-2 text-r-secondary">Themes will appear here once the memorial has been generated.</p>
          )}
        </div>
      </div>
    </div>
  );
}
