import Link from "next/link";
import MemorialCoverImage from "@/components/memorial/MemorialCoverImage.jsx";
import MemorialStatusTag from "@/components/organizer/shell/MemorialStatusTag.jsx";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatLastUpdated(dateString) {
  if (!dateString) return "Recently updated";
  return dateFormatter.format(new Date(dateString));
}

function MemorialPreview({ memorial }) {
  return (
    <div className="relative h-[200px] w-full overflow-hidden rounded-[20px] border border-r-muted bg-r-card">
      <MemorialCoverImage
        src={memorial.cover_photo_url}
        name={memorial.subject_name}
        alt={`Cover photo for ${memorial.subject_name}`}
        fill
        className="h-full w-full object-cover"
        fallbackClassName="bg-r-card text-r-muted text-4xl"
      />
    </div>
  );
}

export default function AccountProfileCard({ memorial }) {
  return (
    <article className="flex h-[350px] flex-col gap-2.5 rounded-[20px] border border-r-muted bg-transparent">
      <MemorialPreview memorial={memorial} />
      <div className="flex flex-1 items-start justify-between gap-4 px-5 pb-5">
        <div className="flex min-w-0 flex-col justify-between self-stretch">
          <p className="font-[family-name:var(--font-boska)] text-h3 text-r-text">
            {memorial.subject_name}
          </p>
          <p className="text-h4 text-r-secondary">
            Last Updated: {formatLastUpdated(memorial.updated_at ?? memorial.created_at)}
          </p>
        </div>
        <MemorialStatusTag status={memorial.status} className="shrink-0" />
      </div>
    </article>
  );
}

export function CreateMemorialCard() {
  return (
    <Link
      href="/memorial/create"
      className="flex h-[350px] flex-col items-center justify-center rounded-[20px] border border-r-muted px-8 text-center transition hover:border-r-text hover:bg-r-card/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-r-border-focus"
    >
      <span className="flex size-[50px] items-center justify-center text-r-text">
        <svg width="50" height="50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span className="mt-2.5 font-[family-name:var(--font-boska)] text-h3 text-r-text">Create new</span>
    </Link>
  );
}
