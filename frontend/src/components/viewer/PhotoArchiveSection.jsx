"use client";

import { useEffect, useState } from "react";
import { flattenPhotos, normalizePhotos } from "@/lib/viewer/normalizePhotos";

function relationshipColor(type) {
  const value = (type || "").toLowerCase();
  if (value === "family") return "var(--color-r-family)";
  if (value === "friend") return "var(--color-r-friend)";
  if (value === "colleague") return "var(--color-r-colleague)";
  return "var(--color-r-muted)";
}

function Lightbox({ photo, onClose, onPrev, onNext }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-800">
          {photo.url ? (
            <img src={photo.url} alt={photo.caption || ""} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-700">
              <span className="text-sm text-neutral-500">No image</span>
            </div>
          )}
        </div>
        <div className="mt-3 px-1">
          {photo.caption ? <p className="text-sm font-medium text-white">{photo.caption}</p> : null}
          <p className="mt-0.5 text-xs text-neutral-400">
            {photo.contributor_name}
            {photo.taken_at ? ` · ${new Date(photo.taken_at).getFullYear()}` : ""}
          </p>
        </div>
        <button type="button" onClick={onPrev} className="absolute left-[-48px] top-1/2 -translate-y-1/2 p-2 text-white hover:text-neutral-300">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button type="button" onClick={onNext} className="absolute right-[-48px] top-1/2 -translate-y-1/2 p-2 text-white hover:text-neutral-300">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button type="button" onClick={onClose} className="absolute -top-10 right-0 p-2 text-white hover:text-neutral-300">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AlbumView({ albums }) {
  const [openAlbum, setOpenAlbum] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const currentPhotos = openAlbum?.photos || [];

  function openLightbox(photo, index) {
    setLightboxPhoto(photo);
    setLightboxIndex(index);
  }

  function prevPhoto() {
    const index = (lightboxIndex - 1 + currentPhotos.length) % currentPhotos.length;
    setLightboxIndex(index);
    setLightboxPhoto(currentPhotos[index]);
  }

  function nextPhoto() {
    const index = (lightboxIndex + 1) % currentPhotos.length;
    setLightboxIndex(index);
    setLightboxPhoto(currentPhotos[index]);
  }

  if (!albums?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-body-2 font-medium text-r-text">No photos yet</p>
        <p className="mt-1 max-w-xs text-body-2 text-r-muted">
          Photos will appear here once contributors have submitted and the memorial has been generated.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-caption font-medium text-r-muted">Albums</p>
      <div className="mb-8 grid grid-cols-3 gap-4">
        {albums.map((album) => (
          <button
            key={album.album_name}
            type="button"
            onClick={() => setOpenAlbum(openAlbum?.album_name === album.album_name ? null : album)}
            className="group overflow-hidden rounded-2xl bg-r-card text-left transition-all"
            style={{ border: `1px solid ${openAlbum?.album_name === album.album_name ? "var(--color-r-text)" : "var(--color-r-border)"}` }}
          >
            <div className="aspect-[4/3] overflow-hidden">
              {album.photos?.[0]?.url ? (
                <img src={album.photos[0].url} alt={album.album_name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-r-card px-2 text-center">
                  <span className="text-caption text-r-muted">{album.album_name}</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-body-2 font-medium text-r-text">{album.album_name}</p>
              <p className="mt-0.5 text-caption text-r-muted">{album.photos?.length || 0} photos</p>
            </div>
          </button>
        ))}
      </div>
      {openAlbum ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-caption font-medium text-r-muted">Photos</p>
            <button type="button" onClick={() => setOpenAlbum(null)} className="text-caption text-r-muted hover:opacity-70">
              Close
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {openAlbum.photos?.map((photo, index) => (
              <button
                key={photo.id || index}
                type="button"
                onClick={() => openLightbox(photo, index)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-r-card"
              >
                {photo.url ? (
                  <img src={photo.url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full bg-r-card" />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {lightboxPhoto ? (
        <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} onPrev={prevPhoto} onNext={nextPhoto} />
      ) : null}
    </div>
  );
}

function ContributorsView({ contributors }) {
  const [expanded, setExpanded] = useState(null);

  if (!contributors?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-body-2 font-medium text-r-text">No contributors yet</p>
        <p className="mt-1 max-w-xs text-body-2 text-r-muted">Contributors will appear here once people have submitted memories.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {contributors.map((contributor) => (
        <div key={contributor.id} className="overflow-hidden rounded-2xl border border-r-border">
          <div className="flex items-stretch">
            <div className="flex w-[220px] shrink-0 flex-col justify-between bg-r-card p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-r-border" />
                <div className="min-w-0">
                  <p className="text-body-2 font-medium text-r-text">{contributor.name}</p>
                  <p className="mt-0.5 text-caption text-r-muted">
                    {contributor.submitted_at
                      ? `Last submitted ${new Date(contributor.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                      : "In progress"}
                  </p>
                </div>
              </div>
              <span
                className="mt-3 inline-block self-start rounded-full bg-r-bg px-3 py-1 text-caption"
                style={{ border: "1px solid var(--color-r-border)", color: relationshipColor(contributor.relationship_type) }}
              >
                {contributor.relationship_type || "No relationship provided"}
              </span>
            </div>
            <div className="flex flex-1">
              {[0, 1].map((slot) => (
                <div key={slot} className="relative flex-1 overflow-hidden bg-r-card">
                  <div className="h-full w-full" style={{ backgroundColor: "#D0C8C0" }} />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setExpanded(expanded === contributor.id ? null : contributor.id)}
              className="flex w-10 shrink-0 items-center justify-center text-r-text transition-opacity hover:opacity-70"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d={expanded === contributor.id ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
              </svg>
            </button>
          </div>
          {expanded === contributor.id ? (
            <div className="bg-r-bg p-4" style={{ borderTop: "1px solid var(--color-r-border)" }}>
              <p className="text-caption text-r-muted">Photos will appear here once the memorial has been generated.</p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MasonryView({ photos }) {
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function openLightbox(photo, index) {
    setLightboxPhoto(photo);
    setLightboxIndex(index);
  }

  function prevPhoto() {
    const index = (lightboxIndex - 1 + photos.length) % photos.length;
    setLightboxIndex(index);
    setLightboxPhoto(photos[index]);
  }

  function nextPhoto() {
    const index = (lightboxIndex + 1) % photos.length;
    setLightboxIndex(index);
    setLightboxPhoto(photos[index]);
  }

  if (!photos?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-body-2 font-medium text-r-text">No photos yet</p>
        <p className="mt-1 max-w-xs text-body-2 text-r-muted">Photos will appear here once the memorial has been generated.</p>
      </div>
    );
  }

  const heights = [200, 280, 180, 260, 220, 300, 190, 240, 210, 270];

  return (
    <div>
      <div style={{ columnCount: 3, columnGap: "12px" }}>
        {photos.map((photo, index) => (
          <button
            key={photo.id || index}
            type="button"
            onClick={() => openLightbox(photo, index)}
            className="group relative mb-3 block w-full overflow-hidden rounded-xl bg-r-card"
            style={{ breakInside: "avoid", height: `${heights[index % heights.length]}px` }}
          >
            {photo.url ? (
              <img src={photo.url} alt={photo.caption || ""} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <div className="h-full w-full bg-r-card" />
            )}
          </button>
        ))}
      </div>
      {lightboxPhoto ? (
        <Lightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} onPrev={prevPhoto} onNext={nextPhoto} />
      ) : null}
    </div>
  );
}

export default function PhotoArchiveSection({ output, contributors }) {
  const [view, setView] = useState("Album");
  const albums = normalizePhotos(output?.photos);
  const allPhotos = flattenPhotos(albums);

  return (
    <div>
      <h2 className="mb-6 text-h1 text-r-text">Photo archive</h2>
      <div className="mb-6 flex items-center justify-between">
        <div className="relative">
          <select
            value={view}
            onChange={(event) => setView(event.target.value)}
            className="cursor-pointer appearance-none rounded-xl bg-r-bg px-4 py-2 pr-10 text-h4 text-r-text focus:outline-none"
            style={{ border: "1px solid var(--color-r-border)" }}
          >
            <option value="Album">Album</option>
            <option value="Contributors">Contributors</option>
            <option value="All Photos">All Photos</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-caption text-r-text">▼</span>
        </div>
        {view === "Contributors" ? (
          <div className="relative">
            <select
              className="cursor-pointer appearance-none rounded-xl bg-r-bg px-4 py-2 pr-10 text-h4 text-r-text focus:outline-none"
              style={{ border: "1px solid var(--color-r-border)" }}
              defaultValue="tags"
            >
              <option value="tags">Tags</option>
              <option value="family">Family</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-caption text-r-text">▼</span>
          </div>
        ) : null}
      </div>
      {view === "Album" ? <AlbumView albums={albums} /> : null}
      {view === "Contributors" ? <ContributorsView contributors={contributors} /> : null}
      {view === "All Photos" ? <MasonryView photos={allPhotos} /> : null}
    </div>
  );
}
