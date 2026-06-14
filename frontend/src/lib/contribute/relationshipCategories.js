import { CONTRIBUTOR_RELATIONSHIP_OTHER } from "./relationshipOptions.js";

export const CONTRIBUTOR_FAMILY_OPTIONS = [
  "Parent",
  "Child",
  "Sibling",
  "Partner / Spouse",
  "Grandparent",
  "Grandchild",
  "Extended family",
];

export const CONTRIBUTOR_RELATIONSHIP_CATEGORIES = [
  { id: "family", label: "Family", hasSubOptions: true },
  { id: "friend", label: "Friend", value: "Friend" },
  { id: "colleague", label: "Colleague", value: "Colleague" },
  { id: "classmate", label: "Classmate", value: "Classmate" },
  { id: "neighbor", label: "Neighbor", value: "Neighbor" },
  { id: "community", label: "Community member", value: "Community member" },
  { id: "other", label: CONTRIBUTOR_RELATIONSHIP_OTHER, value: CONTRIBUTOR_RELATIONSHIP_OTHER },
];
