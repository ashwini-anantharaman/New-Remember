export const ORGANIZER_OUTPUT_PAGES = [
  { id: "stories", primary: "Stories", secondary: null },
  { id: "themes", primary: "Constellations", secondary: "Themes" },
  { id: "relationships", primary: "Constellations", secondary: "Relationships" },
  { id: "voices", primary: "Voices", secondary: null },
  { id: "photos", primary: "All Photos", secondary: null },
];

export function getOutputPageLabel(page) {
  if (page.secondary) {
    return { primary: page.primary, secondary: page.secondary };
  }
  return { primary: page.primary, secondary: null };
}
