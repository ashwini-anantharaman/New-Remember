import MemorialCoverImage from "@/components/memorial/MemorialCoverImage.jsx";

function formatYearRange(memorial) {
  const birthYear = memorial?.date_of_birth ? new Date(memorial.date_of_birth).getFullYear() : null;
  const passingYear = memorial?.date_of_passing ? new Date(memorial.date_of_passing).getFullYear() : null;
  if (!birthYear && !passingYear) return null;
  return `${birthYear ?? ""}${birthYear && passingYear ? " - " : ""}${passingYear ?? ""}`;
}

export function ViewerLandingProfile({ memorial }) {
  const yearRange = formatYearRange(memorial);

  return (
    <div className="flex w-full max-w-[886px] flex-col items-center gap-[50px] text-center">
      <div className="relative size-[220px] shrink-0 overflow-hidden rounded-full sm:size-[314px]">
        <MemorialCoverImage
          src={memorial?.cover_photo_url}
          name={memorial?.subject_name || memorial?.deceased_name}
          fill
          className="h-full w-full object-cover"
          fallbackClassName="bg-r-card text-r-muted text-6xl"
        />
      </div>
      <div className="max-w-[433px]">
        <h1 className="font-[family-name:var(--font-boska)] text-h1 font-bold text-r-text">
          {memorial?.subject_name || memorial?.deceased_name || "Memorial"}
        </h1>
        {yearRange ? <p className="mt-3.5 text-body-2 text-r-secondary">{yearRange}</p> : null}
        {(memorial?.brief_biography || memorial?.short_description || memorial?.bio) ? (
          <p className="mt-3.5 text-body text-r-secondary">
            {memorial.brief_biography || memorial.short_description || memorial.bio}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function ViewerCompactProfile({ memorial }) {
  const yearRange = formatYearRange(memorial);

  return (
    <header className="mx-auto flex w-full max-w-[886px] flex-col items-center gap-3.5 text-center">
      <h1 className="font-[family-name:var(--font-boska)] text-h1 font-bold text-r-text">
        {memorial?.subject_name || memorial?.deceased_name || "Memorial"}
      </h1>
      {yearRange ? <p className="text-body-2 text-r-secondary">{yearRange}</p> : null}
    </header>
  );
}
