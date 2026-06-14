const FAMILY_TYPES = new Set([
  "parent",
  "child",
  "sibling",
  "partner / spouse",
  "partner",
  "spouse",
  "grandparent",
  "grandchild",
  "extended family",
  "cousin",
  "aunt/uncle",
  "aunt",
  "uncle",
  "family",
]);

const TOP_LEVEL_TYPES = [
  { id: "family", label: "Family", match: (value) => FAMILY_TYPES.has(value) || value.includes("family") },
  { id: "friend", label: "Friend", match: (value) => value === "friend" },
  { id: "colleague", label: "Colleague", match: (value) => value === "colleague" },
  { id: "other", label: "Other", match: () => true },
];

export const RELATIONSHIP_LEGEND = [
  { id: "family", label: "Family", color: "var(--color-r-family)" },
  { id: "friend", label: "Friend", color: "var(--color-r-friend)" },
  { id: "colleague", label: "Colleague", color: "var(--color-r-colleague)" },
  { id: "other", label: "Other", color: "var(--color-r-muted)" },
];

function normalizeType(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");
}

export function getTopLevelRelationshipType(relationshipType) {
  const value = normalizeType(relationshipType);
  const match = TOP_LEVEL_TYPES.find((type) => type.id !== "other" && type.match(value));
  return match?.id || "other";
}

export function getRelationshipLabel(relationshipType) {
  const value = String(relationshipType || "").trim();
  if (!value) return "Other";
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function buildRelationshipFilterGroups(contributors = []) {
  const groups = TOP_LEVEL_TYPES.map((type) => ({
    id: type.id,
    label: type.label,
    count: 0,
    subtypes: [],
  }));

  const subtypeIndex = new Map();

  contributors.forEach((contributor) => {
    const rawType = contributor.relationship_type || "Other";
    const bucketId = getTopLevelRelationshipType(rawType);
    const group = groups.find((item) => item.id === bucketId) || groups.find((item) => item.id === "other");
    group.count += 1;

    const subtypeLabel = getRelationshipLabel(rawType);
    const subtypeKey = `${group.id}:${subtypeLabel.toLowerCase()}`;
    if (!subtypeIndex.has(subtypeKey)) {
      const subtype = {
        id: subtypeKey,
        label: subtypeLabel,
        count: 0,
        contributorIds: [],
      };
      subtypeIndex.set(subtypeKey, subtype);
      group.subtypes.push(subtype);
    }
    const subtype = subtypeIndex.get(subtypeKey);
    subtype.count += 1;
    subtype.contributorIds.push(contributor.id);
  });

  return groups.filter((group) => group.count > 0 || group.id !== "other");
}

export function subtypeFilterKey(relationshipType, subtypeLabel) {
  const bucketId = getTopLevelRelationshipType(relationshipType);
  return `${bucketId}:${String(subtypeLabel || "Other").toLowerCase()}`;
}

export function mapThemeNodes(constellationNodes = []) {
  return constellationNodes.map((theme, index) => ({
    id: theme.id || `theme-${index}`,
    name: theme.label || theme.name || "Theme",
    prominence: Number(theme.prominence_score) || 0.5 + (index % 3) * 0.1,
    summary: theme.summary || "",
    discoveryAngle: theme.discovery_angle || "",
    category: theme.category || "",
    photo_urls: theme.photo_urls || [],
    coverPhotoUrl: theme.cover_photo_url || theme.photo_urls?.[0] || null,
    quotes: theme.quotes || [],
    contributions: theme.photo_count ?? (theme.photo_urls || []).length,
  }));
}

export function mapRelationshipTypeNodes(
  contributors = [],
  typeInsights = {},
  contributorInsights = {},
) {
  const groups = buildRelationshipFilterGroups(contributors);

  return groups
    .filter((group) => group.count > 0)
    .map((group) => {
      let insight = typeInsights[group.id] || {};
      if (!insight.summary && !insight.extracted_quote) {
        const firstContributor = contributors.find(
          (contributor) => getTopLevelRelationshipType(contributor.relationship_type) === group.id,
        );
        if (firstContributor) {
          insight = contributorInsights[firstContributor.id] || insight;
        }
      }

      const legend = RELATIONSHIP_LEGEND.find((item) => item.id === group.id);
      const members = contributors
        .filter((contributor) => getTopLevelRelationshipType(contributor.relationship_type) === group.id)
        .map((contributor) => {
          const memberInsight = contributorInsights[contributor.id] || {};
          return {
            id: contributor.id,
            name: contributor.name || "Contributor",
            relationshipLabel: getRelationshipLabel(contributor.relationship_type),
            extractedQuote: memberInsight.extracted_quote || "",
            summary: memberInsight.summary || "",
          };
        });

      return {
        id: group.id,
        label: group.label,
        relationshipType: group.id,
        prominence: 0.45 + Math.min(group.count * 0.08, 0.35),
        count: group.count,
        summary: insight.summary || "",
        extractedQuote: insight.extracted_quote || "",
        fillColor: legend?.color || "#B7C19A",
        members,
      };
    });
}

export function filterRelationshipTypeNodes(typeNodes, hiddenTypes = {}) {
  return typeNodes.filter((node) => !hiddenTypes[node.relationshipType]);
}

/** @deprecated use mapRelationshipTypeNodes for organizer relationship diagram */
export function mapRelationshipSatellites(contributors = [], memorial, relationshipInsights = {}) {
  return (contributors || []).map((contributor, index) => ({
    id: contributor.id,
    relationshipType: getTopLevelRelationshipType(contributor.relationship_type),
    subtype: getRelationshipLabel(contributor.relationship_type),
    prominence: 0.45 + (index % 4) * 0.08,
    name: contributor.name,
    summary: relationshipInsights[contributor.id]?.summary || "",
    extractedQuote: relationshipInsights[contributor.id]?.extracted_quote || "",
  }));
}

export function filterSatellites(satellites, hiddenTypes = {}, hiddenSubtypes = {}) {
  return satellites.filter((node) => {
    if (hiddenTypes[node.relationshipType]) return false;
    const subtypeKey = subtypeFilterKey(node.relationshipType, node.subtype);
    if (hiddenSubtypes[subtypeKey]) return false;
    return true;
  });
}
