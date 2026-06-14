"use client";

import Image from "next/image";
import Link from "next/link";

export default function OrganizerNav({ backHref, onBack }) {
  return (
    <nav className="flex h-10 w-full items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-5">
        <Image
          src="/brand/remember-logo.png"
          alt=""
          width={34}
          height={36}
          className="h-9 w-[34px] object-contain"
          unoptimized
        />
        <span className="font-[family-name:var(--font-boska)] text-2xl font-medium text-r-text">
          Remember
        </span>
      </Link>
      {backHref ? (
        <Link
          href={backHref}
          className="flex items-center gap-2.5 text-body-2 text-r-text transition-opacity hover:opacity-70"
        >
          <BackIcon />
          Back
        </Link>
      ) : onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2.5 text-body-2 text-r-text transition-opacity hover:opacity-70"
        >
          <BackIcon />
          Back
        </button>
      ) : null}
    </nav>
  );
}

function BackIcon() {
  return (
    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
