"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMemorials } from "@/services/memorialService.js";
import OrganizerShell from "@/components/organizer/shell/OrganizerShell.jsx";
import OrganizerPageHeader from "@/components/organizer/shell/OrganizerPageHeader.jsx";
import AccountProfileCard, { CreateMemorialCard } from "./_components/account-profile-card";
import { SkeletonCard, SkeletonText } from "@/components/ui-components/skeleton-loader";

export default function AccountBoardPage() {
  const [memorials, setMemorials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadMemorials() {
      try {
        const nextMemorials = await getMemorials();
        if (!isCancelled) {
          setMemorials(nextMemorials);
          setLoadError("");
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(error.message || "Unable to load your memorials right now.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMemorials();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <OrganizerShell backHref="/" contentClassName="items-center gap-[100px]">
      <OrganizerPageHeader
        title="Your Memorials"
        subtitle="All memorials you created will be stored here"
      />

      <section
        className="grid w-full grid-cols-1 gap-5 lg:grid-cols-3"
        aria-label="Memorial profiles"
      >
        <CreateMemorialCard />

        {isLoading
          ? [...Array(2)].map((_, index) => (
              <div
                key={index}
                className="rounded-[20px] border border-r-muted px-5 py-5"
              >
                <SkeletonCard className="mb-4 h-[200px] w-full rounded-[20px]" />
                <SkeletonText lines={2} />
              </div>
            ))
          : null}

        {!isLoading && loadError ? (
          <article className="flex min-h-[350px] items-center justify-center rounded-[20px] border border-r-danger/30 px-8 text-center text-body-2 text-r-danger lg:col-span-2">
            {loadError}
          </article>
        ) : null}

        {!isLoading && !loadError && memorials.length === 0 ? (
          <article className="flex min-h-[350px] items-center justify-center rounded-[20px] border border-r-muted px-8 text-center text-body text-r-secondary lg:col-span-2">
            You haven&apos;t created any memorials yet.
          </article>
        ) : null}

        {!isLoading && !loadError
          ? memorials.map((memorial) => (
              <Link
                key={memorial.id}
                href={`/memorial/${memorial.id}/manage`}
                className="rounded-[20px] transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-r-border-focus"
              >
                <AccountProfileCard memorial={memorial} />
              </Link>
            ))
          : null}
      </section>
    </OrganizerShell>
  );
}
