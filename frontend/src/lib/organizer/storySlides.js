function formatRelationship(relationshipType) {
  if (!relationshipType) return "";
  return relationshipType
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStorySource(output, story) {
  if (Array.isArray(story)) return story;
  if (Array.isArray(story?.slides)) return story.slides;
  if (Array.isArray(output?.story)) return output.story;
  if (Array.isArray(output?.story?.slides)) return output.story.slides;
  return [];
}

function buildPhotoLookup(output) {
  const albums = Array.isArray(output?.photos) ? output.photos : [];
  if (output?.photos?.albums) {
    return output.photos.albums.reduce((lookup, album) => {
      (album.photos || []).forEach((photo) => {
        if (photo?.id) lookup[photo.id] = photo;
      });
      return lookup;
    }, {});
  }

  return albums.reduce((lookup, album) => {
    (album.photos || []).forEach((photo) => {
      if (photo?.id) lookup[photo.id] = photo;
    });
    return lookup;
  }, {});
}

function formatSubmittedDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function normalizeOrganizerStorySlides(output, story) {
  const photoLookup = buildPhotoLookup(output);

  return getStorySource(output, story)
    .map((slide, index) => {
      const matchedPhoto = photoLookup[slide.photo_id] || {};
      const photoUrl = slide.photo_url || slide.url || matchedPhoto.url || matchedPhoto.photo_url || null;
      const caption =
        slide.quote ||
        slide.matched_quote ||
        slide.narration ||
        slide.caption ||
        slide.memory ||
        slide.intro_line ||
        "";
      const takenAt = slide.taken_at || matchedPhoto.taken_at || null;

      return {
        id: slide.id || slide.photo_id || `slide-${index}`,
        orderIndex: Number.isFinite(Number(slide.order_index)) ? Number(slide.order_index) : index,
        photoUrl,
        caption,
        title: slide.title || slide.story_title || `Story ${index + 1}`,
        submittedLabel: formatSubmittedDate(takenAt) ? `Submitted ${formatSubmittedDate(takenAt)}` : "Submitted",
        aiTag: slide.theme_label || slide.ai_category || slide.ai_tag || "AI tag",
        relationshipLabel: formatRelationship(slide.relationship_type || matchedPhoto.relationship_type),
      };
    })
    .filter((slide) => slide.photoUrl || slide.caption || slide.id)
    .sort((a, b) => a.orderIndex - b.orderIndex);
}
