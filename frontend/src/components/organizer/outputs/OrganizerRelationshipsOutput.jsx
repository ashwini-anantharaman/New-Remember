"use client";

import { useMemo, useState } from "react";
import OrganizerConstellationDiagram from "@/components/organizer/outputs/OrganizerConstellationDiagram";
import OrganizerConstellationNodeModal from "@/components/organizer/outputs/OrganizerConstellationNodeModal";
import {
  buildRelationshipFilterGroups,
  filterRelationshipTypeNodes,
  getRelationshipLabel,
  getTopLevelRelationshipType,
  mapRelationshipTypeNodes,
  subtypeFilterKey,
} from "@/lib/organizer/constellationData";

function RelationshipFilters({
  groups,
  activeGroupId,
  onActiveGroupChange,
  hiddenTypes,
  hiddenSubtypes,
  onToggleType,
  onToggleSubtype,
}) {
  const activeGroup = groups.find((group) => group.id === activeGroupId) || groups[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-6">
        {groups.map((group) => (
          <label key={group.id} className="flex items-center gap-3 text-body-2 text-r-text">
            <input
              type="checkbox"
              checked={!hiddenTypes[group.id]}
              onChange={() => onToggleType(group.id)}
              className="size-[18px] cursor-pointer accent-r-text"
            />
            <button
              type="button"
              onClick={() => onActiveGroupChange(group.id)}
              className={`text-left ${activeGroupId === group.id ? "font-medium" : ""}`}
            >
              {group.count} {group.label}
            </button>
          </label>
        ))}
      </div>

      {activeGroup?.subtypes?.length ? (
        <div className="rounded-[10px] border border-r-muted bg-white p-[30px]">
          <p className="mb-4 font-[family-name:var(--font-boska)] text-h3 text-r-text">{activeGroup.label}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeGroup.subtypes.map((subtype) => (
              <label key={subtype.id} className="flex items-center gap-3 text-body-2 text-r-text">
                <input
                  type="checkbox"
                  checked={!hiddenSubtypes[subtype.id]}
                  onChange={() => onToggleSubtype(subtype.id)}
                  className="size-[18px] cursor-pointer accent-r-text"
                />
                <span>
                  {subtype.count} {subtype.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ContributorList({ contributors, hiddenTypes, hiddenSubtypes }) {
  const visibleContributors = contributors.filter((contributor) => {
    const bucketId = getTopLevelRelationshipType(contributor.relationship_type);
    if (hiddenTypes[bucketId]) return false;

    const subtypeKey = subtypeFilterKey(
      contributor.relationship_type,
      getRelationshipLabel(contributor.relationship_type),
    );
    if (hiddenSubtypes[subtypeKey]) return false;

    return true;
  });

  if (!visibleContributors.length) {
    return (
      <p className="text-body-2 text-r-secondary">
        No contributors match the current filters.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {visibleContributors.map((contributor) => (
        <div
          key={contributor.id}
          className="flex items-center gap-4 rounded-[10px] border border-r-muted bg-white px-6 py-4"
        >
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-r-btn font-[family-name:var(--font-boska)] text-h3 text-r-text">
            {(contributor.name || "?").charAt(0)}
          </div>
          <div>
            <p className="font-[family-name:var(--font-boska)] text-h3 text-r-text">{contributor.name || "Contributor"}</p>
            <p className="text-body-2 capitalize text-r-secondary">
              {contributor.relationship_type?.replace(/[_-]/g, " ") || "Other"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrganizerRelationshipsOutput({ output, memorial, contributors }) {
  const typeInsights = output?.constellation?.relationship_type_insights || {};
  const contributorInsights = output?.constellation?.relationship_insights || {};
  const typeNodes = useMemo(
    () => mapRelationshipTypeNodes(contributors, typeInsights, contributorInsights),
    [contributors, typeInsights, contributorInsights],
  );
  const groups = useMemo(() => buildRelationshipFilterGroups(contributors), [contributors]);
  const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id || "family");
  const [hiddenTypes, setHiddenTypes] = useState({});
  const [hiddenSubtypes, setHiddenSubtypes] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);

  const visibleTypeNodes = filterRelationshipTypeNodes(typeNodes, hiddenTypes);

  return (
    <div className="flex flex-col gap-[30px]">
      <OrganizerConstellationDiagram
        mode="relationships"
        satellites={visibleTypeNodes}
        showLegend
        centerLabel={memorial?.subject_name || memorial?.deceased_name || null}
        selectedNodeId={selectedNode?.id || null}
        onNodeClick={(node) => setSelectedNode(node)}
      />

      <OrganizerConstellationNodeModal
        mode="relationships"
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      <div className="flex flex-col gap-[30px]">
        <h3 className="font-[family-name:var(--font-boska)] text-h2 italic text-r-secondary">Relationships</h3>
        <RelationshipFilters
          groups={groups}
          activeGroupId={activeGroupId}
          onActiveGroupChange={setActiveGroupId}
          hiddenTypes={hiddenTypes}
          hiddenSubtypes={hiddenSubtypes}
          onToggleType={(typeId) =>
            setHiddenTypes((prev) => ({
              ...prev,
              [typeId]: !prev[typeId],
            }))
          }
          onToggleSubtype={(subtypeId) =>
            setHiddenSubtypes((prev) => ({
              ...prev,
              [subtypeId]: !prev[subtypeId],
            }))
          }
        />
        <ContributorList
          contributors={contributors}
          hiddenTypes={hiddenTypes}
          hiddenSubtypes={hiddenSubtypes}
        />
      </div>
    </div>
  );
}
