"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MemorialContributionApproval from "@/components/output/contribution-awaiting";
import OrganizerDropdown from "@/components/organizer/shell/OrganizerDropdown.jsx";
import { TabEmpty, TabError, TabLoading } from "@/components/organizer/manage/OrganizerTabStates";

function ContributorCard({ contributor }) {
  const isSubmitted =
    String(contributor?.status || "").toLowerCase() === "submitted" || Boolean(contributor?.submitted_at);

  return (
    <div className="flex min-h-[279px] flex-col justify-center rounded-[20px] border border-r-muted px-[50px] py-10">
      <div className="flex flex-col gap-2.5">
        <p className="font-[family-name:var(--font-boska)] text-h3 text-r-text">{contributor.name}</p>
        <p className="text-h4 text-r-secondary">{isSubmitted ? "Submitted" : "In progress"}</p>
        <p className="text-body-2 text-r-text">
          Last submitted{" "}
          {contributor.submitted_at
            ? new Date(contributor.submitted_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : "No date provided"}
        </p>
        <span className="mt-2 inline-flex h-[50px] w-fit min-w-[207px] items-center justify-center rounded-[14px] bg-[#B7C19A] px-4 text-caption text-r-text">
          {contributor.relationship_type || "No relationship"}
        </span>
      </div>
    </div>
  );
}

function ContributionHistoryItem({ contributor, type = "photos" }) {
  const label =
    type === "photos"
      ? `${contributor.name} added photos`
      : type === "audio"
        ? `${contributor.name} added 1 audio`
        : `${contributor.name} added 1 story`;

  return (
    <div className="rounded-[20px] border border-r-muted p-[30px]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex items-start gap-4 lg:w-[350px]">
          <div className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-r-card text-caption uppercase text-r-secondary">
            {type === "photos" ? "P" : type === "audio" ? "A" : "S"}
          </div>
          <div>
            <p className="text-body-2 text-r-text">{label}</p>
            <p className="mt-2 text-caption text-r-secondary">
              Submitted{" "}
              {contributor.submitted_at
                ? new Date(contributor.submitted_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
        <div className="flex-1">
          {type === "photos" ? (
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((slot) => (
                <div key={slot} className="aspect-square rounded-[10px] bg-r-card" />
              ))}
            </div>
          ) : type === "audio" ? (
            <div className="flex items-center gap-3">
              <div className="flex size-[50px] items-center justify-center rounded-full bg-r-btn text-r-btn-text">▶</div>
              <div className="flex h-[50px] flex-1 items-end gap-1">
                {[...Array(16)].map((_, index) => (
                  <div key={index} className="w-1.5 rounded-full bg-r-colleague" style={{ height: `${14 + (index % 5) * 6}px` }} />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <p className="font-[family-name:var(--font-boska)] text-h3 text-r-text">Story Title</p>
              <p className="mt-2 text-body-2 text-r-secondary">
                An AI generated summary of the story will be featured here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrganizerContributionsTab({
  contributors = [],
  loading,
  error,
  onRetry,
}) {
  const [view, setView] = useState("contributors");
  const submissions = contributors.filter((contributor) => {
    const status = String(contributor?.status || "").toLowerCase();
    return status === "submitted" || Boolean(contributor?.submitted_at);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = submissions[currentIndex];

  return (
    <div className="flex flex-col gap-[50px] pt-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <OrganizerDropdown
          value={view}
          onChange={setView}
          ariaLabel="Contributions view"
          className="max-w-[434px]"
          options={[
            { value: "contributors", label: "Contributors" },
            { value: "awaiting", label: "Awaiting approval" },
            { value: "history", label: "Contribution history" },
          ]}
        />

        {view === "awaiting" && submissions.length > 0 ? (
          <div className="flex items-center gap-4 text-body-2 text-r-secondary">
            <button type="button" onClick={() => setCurrentIndex((index) => (index === 0 ? submissions.length - 1 : index - 1))} className="rounded p-1 hover:bg-r-card">
              <ChevronLeft size={18} />
            </button>
            <span>
              {currentIndex + 1}/{submissions.length}
            </span>
            <button type="button" onClick={() => setCurrentIndex((index) => (index === submissions.length - 1 ? 0 : index + 1))} className="rounded p-1 hover:bg-r-card">
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}

        {view === "history" ? (
          <div className="flex gap-3">
            <OrganizerDropdown value="filter" onChange={() => {}} ariaLabel="Filter history" className="min-w-[206px]" options={[{ value: "filter", label: "Filter" }]} />
            <OrganizerDropdown value="sort" onChange={() => {}} ariaLabel="Sort history" className="min-w-[206px]" options={[{ value: "sort", label: "Sort" }]} />
          </div>
        ) : null}
      </div>

      {view === "contributors" && loading ? <TabLoading /> : null}
      {view === "contributors" && !loading && error ? (
        <TabError title="Unable to load contributors" message={error} onRetry={onRetry} />
      ) : null}
      {view === "contributors" && !loading && !error && contributors.length === 0 ? (
        <TabEmpty title="No contributors yet" message="Contributors will appear here once people begin sharing memories." />
      ) : null}
      {view === "contributors" && !loading && !error && contributors.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {contributors.map((contributor) => (
            <ContributorCard key={contributor.id} contributor={contributor} />
          ))}
        </div>
      ) : null}

      {view === "awaiting" ? (
        submissions.length ? (
          <MemorialContributionApproval contributors={current} gallery={submissions.length} />
        ) : (
          <TabEmpty title="Nothing awaiting approval" message="Submitted contributions will appear here for review." />
        )
      ) : null}

      {view === "history" ? (
        <div className="flex flex-col gap-5">
          {submissions.length ? (
            submissions.flatMap((contributor, index) => [
              <ContributionHistoryItem key={`${contributor.id}-photos`} contributor={contributor} type="photos" />,
              index === 0 ? <ContributionHistoryItem key={`${contributor.id}-audio`} contributor={contributor} type="audio" /> : null,
              index === 0 ? <ContributionHistoryItem key={`${contributor.id}-story`} contributor={contributor} type="story" /> : null,
            ]).filter(Boolean)
          ) : (
            <TabEmpty title="No contribution history yet" message="A timeline of submitted photos, audio, and stories will appear here." />
          )}
        </div>
      ) : null}
    </div>
  );
}
