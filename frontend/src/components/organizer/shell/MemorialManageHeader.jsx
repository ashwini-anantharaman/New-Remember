"use client";

import Link from "next/link";
import MemorialCoverImage from "@/components/memorial/MemorialCoverImage.jsx";
import MemorialStatusTag from "./MemorialStatusTag.jsx";
import OrganizerButton from "./OrganizerButton.jsx";

function IconButton({ href, onClick, label, children }) {
  const className =
    "flex size-[50px] items-center justify-center rounded-full text-r-text transition hover:bg-r-card";

  if (href) {
    return (
      <Link href={href} className={className} aria-label={label}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      {children}
    </button>
  );
}

function ShareIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

export default function MemorialManageHeader({
  memorial,
  onShare,
  contributionCount,
}) {
  const birthYear = memorial?.date_of_birth ? new Date(memorial.date_of_birth).getFullYear() : null;
  const passingYear = memorial?.date_of_passing ? new Date(memorial.date_of_passing).getFullYear() : null;
  const yearRange =
    birthYear || passingYear
      ? `${birthYear ?? ""}${birthYear && passingYear ? " - " : ""}${passingYear ?? ""}`
      : null;

  return (
    <header className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center">
        <div className="relative size-[220px] shrink-0 overflow-hidden rounded-full lg:size-[314px]">
          <MemorialCoverImage
            src={memorial?.cover_photo_url}
            name={memorial?.subject_name}
            fill
            className="h-full w-full"
            fallbackClassName="bg-r-card text-r-muted text-6xl"
          />
        </div>
        <div className="max-w-[433px] text-center lg:text-left">
          <h1 className="font-[family-name:var(--font-boska)] text-h2 italic text-r-secondary">
            {memorial?.subject_name || "Memorial"}
          </h1>
          {yearRange ? <p className="mt-3.5 text-body-2 text-r-text">{yearRange}</p> : null}
          {memorial?.bio ? (
            <p className="mt-3.5 text-body text-r-secondary">{memorial.bio}</p>
          ) : null}
          {contributionCount != null ? (
            <p className="mt-3.5 text-body-2 text-r-secondary">
              {contributionCount} contribution{contributionCount === 1 ? "" : "s"}
            </p>
          ) : null}
          <div className="mt-5 flex justify-center lg:justify-start">
            <MemorialStatusTag status={memorial?.status} className="min-w-[207px] h-[50px]" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 lg:items-end lg:py-[30px]">
        <div className="flex w-full max-w-[208px] flex-col gap-5">
          <OrganizerButton variant="compact" className="w-full max-w-none" disabled>
            Upload Memories
          </OrganizerButton>
          <OrganizerButton
            variant="compact"
            className="w-full max-w-none"
            href={memorial?.id ? `/memorial/${memorial.id}/output` : undefined}
            disabled={!memorial?.id}
          >
            View Memorial
          </OrganizerButton>
        </div>
        <div className="flex items-center gap-[30px]">
          <IconButton onClick={onShare} label="Share memorial">
            <ShareIcon />
          </IconButton>
          <IconButton
            href={memorial?.id ? `/memorial/${memorial.id}/manage/settings` : undefined}
            label="Memorial settings"
          >
            <SettingsIcon />
          </IconButton>
        </div>
      </div>
    </header>
  );
}
