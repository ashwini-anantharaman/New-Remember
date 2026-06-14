export function normalizePhotos(photos) {
  if (!photos) return [];
  if (photos.albums) {
    return photos.albums.map((album) => ({
      album_name: album.name || album.album_name,
      cover_photo_url: album.cover_photo_url || null,
      photos: (album.photos || []).map((photo) => ({
        id: photo.id,
        url: photo.url || null,
        caption: photo.caption || null,
        taken_at: photo.taken_at || null,
        contributor_name: photo.contributor_name || null,
      })),
    }));
  }
  return photos;
}

export function flattenPhotos(albums) {
  return (albums || []).flatMap((album) =>
    (album.photos || []).map((photo) => ({
      ...photo,
      album_name: album.album_name || album.name,
    })),
  );
}
