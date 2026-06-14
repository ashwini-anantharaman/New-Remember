"use client";

import OrganizerDropdown from "@/components/organizer/shell/OrganizerDropdown.jsx";

function ArchivePhotoCard({ photo }) {
  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-[10px] border border-r-muted sm:w-[432px]">
      {photo?.url ? (
        <img src={photo.url} alt={photo.caption || ""} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-r-card text-body-2 text-r-secondary">
          Photo
        </div>
      )}
    </div>
  );
}

function ArchiveAudioCard() {
  return (
    <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-[10px] border border-r-muted bg-r-modal/40 px-8 text-center sm:w-[432px]">
      <p className="font-[family-name:var(--font-boska)] text-h3 text-r-text">Input title</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex size-[50px] items-center justify-center rounded-full bg-r-btn text-r-btn-text">
          ▶
        </div>
        <div className="flex h-[50px] flex-1 items-end gap-1">
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              className="w-2 rounded-full bg-r-colleague"
              style={{ height: `${18 + (index % 4) * 8}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArchiveStoryCard({ contributor }) {
  return (
    <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-[10px] border border-r-muted bg-r-modal/40 px-8 text-center sm:w-[432px]">
      <p className="font-[family-name:var(--font-boska)] text-h3 text-r-text">Story title</p>
      <p className="mt-2 text-caption text-r-secondary">
        Submitted by {contributor?.name || "Contributor"}
      </p>
    </div>
  );
}

export default function OrganizerArchiveTab({ contributors = [] }) {
  const submitted = contributors.filter((contributor) => {
    const status = String(contributor?.status || "").toLowerCase();
    return status === "submitted" || Boolean(contributor?.submitted_at);
  });
  const featuredPhoto = submitted[0];

  return (
    <div className="flex flex-col gap-[50px] pt-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 items-center gap-4 rounded-[13px] border border-r-muted bg-white px-4 py-2">
          <span className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-r-card text-r-secondary">
            AI
          </span>
          <input
            type="text"
            placeholder="Show me happy memories"
            className="h-[47px] w-full bg-transparent text-body-2 text-r-text outline-none placeholder:text-r-secondary"
          />
        </div>
        <div className="flex gap-3">
          <OrganizerDropdown
            value="filter"
            onChange={() => {}}
            ariaLabel="Filter archive"
            className="min-w-[206px]"
            options={[{ value: "filter", label: "Filter" }]}
          />
          <OrganizerDropdown
            value="sort"
            onChange={() => {}}
            ariaLabel="Sort archive"
            className="min-w-[206px]"
            options={[{ value: "sort", label: "Sort" }]}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:flex-wrap">
        <ArchivePhotoCard photo={featuredPhoto?.cover_photo_url ? { url: featuredPhoto.cover_photo_url } : null} />
        <ArchiveAudioCard />
        <ArchiveStoryCard contributor={submitted[0]} />
      </div>
    </div>
  );
}
