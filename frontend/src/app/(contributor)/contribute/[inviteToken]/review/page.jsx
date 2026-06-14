"use client";

// frontend/src/app/(contributor)/contribute/[inviteToken]/review/page.jsx

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { deletePhoto, deleteVoice } from "@/lib/api.js";
import { getContributorReviewDraft, submitContributorDraft } from "@/services/contributorService.js";
import ContributorShell from "@/components/contributor/shell/ContributorShell.jsx";
import ContributorButton from "@/components/contributor/shell/ContributorButton.jsx";
import {
  ContributorErrorState,
  ContributorLoadingState,
  ContributorPageHeader,
} from "@/components/contributor/shell/ContributorStates.jsx";

// ─── Error copy ───────────────────────────────────────────────────────────────

const reviewErrorCopy = {
  invalid: { title: "This invitation link is not available", body: "Please check the link or ask the memorial organizer to send a new invitation." },
  expired: { title: "This invitation has expired", body: "The contribution window for this link has passed. The organizer can share a new link if they are still collecting memories." },
  closed: { title: "Contributions are closed", body: "This memorial is not accepting new contributions right now. Thank you for wanting to share a memory." },
  missing: { title: "We could not find your contribution draft", body: "Please return to the invitation page and enter your name before reviewing your memories." },
  missing_data: { title: "This invitation is missing memorial details", body: "The invitation was found, but the memorial information is incomplete. Please ask the organizer to review the memorial and invitation." },
  error: { title: "We could not open your review", body: "Something went wrong while loading your contribution. Please try again in a moment." },
};

function ReviewErrorState({ status, inviteToken }) {
  const copy = reviewErrorCopy[status] ?? reviewErrorCopy.error;
  return (
    <ContributorErrorState
      title={copy.title}
      body={copy.body}
      actionHref={status === "missing" ? `/contribute/${inviteToken}` : undefined}
    />
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function formatRelationship(contributor) {
  const relationshipType = contributor?.relationship_type;
  const relationshipLabel = contributor?.relationship_label;
  if (!relationshipType && !relationshipLabel) return "Not provided";
  if (relationshipType === "Other" && relationshipLabel) return relationshipLabel;
  return relationshipLabel || relationshipType;
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function ReviewSection({ title, actionHref, actionLabel, children }) {
  return (
    <section className="rounded-[20px] border border-r-muted bg-transparent p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-[family-name:var(--font-boska)] text-h3 text-r-text">{title}</h2>
        {actionHref ? (
          <a href={actionHref} className="shrink-0 text-body-2 font-medium text-r-secondary transition hover:text-r-text">
            {actionLabel}
          </a>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptySummary({ children }) {
  return <p className="text-caption text-r-muted">{children}</p>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewPage() {
  const router = useRouter();
  const { inviteToken } = useParams();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadReview() {
      setIsLoading(true);
      try {
        const reviewDraft = await getContributorReviewDraft(inviteToken);
        if (isMounted) setDraft(reviewDraft);
      } catch {
        if (isMounted) setDraft({ status: "error", invite: null, session: null, summary: null });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadReview();
    return () => { isMounted = false; };
  }, [inviteToken]);

  async function handleDeletePhoto(assetId) {
    try {
      await deletePhoto(inviteToken, assetId);
      setDraft((d) => ({ ...d, summary: { ...d.summary, photos: d.summary.photos.filter((p) => p.id !== assetId) } }));
    } catch { setSubmitError("We could not remove that photo. Please try again."); }
  }

  async function handleDeleteVoice(recordingId) {
    try {
      await deleteVoice(inviteToken, recordingId);
      setDraft((d) => ({ ...d, summary: { ...d.summary, voice: d.summary.voice.filter((r) => r.id !== recordingId) } }));
    } catch { setSubmitError("We could not remove that recording. Please try again."); }
  }

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await submitContributorDraft(inviteToken);
      router.push(`/contribute/${inviteToken}/submitted`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "We could not submit your contribution. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <ContributorLoadingState message="Opening your review..." />;
  if (!draft || draft.status !== "ready") {
    return <ReviewErrorState status={draft?.status ?? "error"} inviteToken={inviteToken} />;
  }

  const { invite, summary } = draft;
  const answerCount = summary.responses.filter((r) => r.response_text.trim()).length;
  const photoCount = summary.photos.length;
  const voiceCount = summary.voice.length;

  return (
    <ContributorShell backHref={`/contribute/${inviteToken}/upload`} contentClassName="gap-10">
      <ContributorPageHeader
        title="Review contributions"
        subtitle={`Please review your contribution before submitting it for ${invite.deceased.name}.`}
      />

      <div className="page-shell">

        {/* Contributor */}
        <ReviewSection title="Contributor" actionHref={`/contribute/${inviteToken}/relationship`} actionLabel="Edit">
          <div className="flex flex-col gap-1">
            <p className="text-body-2 font-medium text-r-text">{summary.contributor.name}</p>
            <p className="text-caption text-r-muted">{formatRelationship(summary.contributor)}</p>
          </div>
        </ReviewSection>

        {/* Questionnaire answers combined with final review */}
        <ReviewSection title={`Interview answers (${answerCount})`} actionHref={`/contribute/${inviteToken}/questions`} actionLabel="Edit">
          {answerCount > 0 ? (
            <div className="flex flex-col gap-4">
              {summary.responses.map((response) =>
                response.response_text.trim() ? (
                  <div key={response.question_text} className="flex flex-col gap-1">
                    <p className="text-body-2 font-medium text-r-text">{response.question_text}</p>
                    <p className="text-caption text-r-muted">{response.response_text}</p>
                  </div>
                ) : null
              )}
            </div>
          ) : (
            <EmptySummary>No questionnaire answers have been saved in this browser yet.</EmptySummary>
          )}
        </ReviewSection>

        {/* Photos */}
        <ReviewSection title={`Uploaded photos (${photoCount})`} actionHref={`/contribute/${inviteToken}/photos`} actionLabel={photoCount > 0 ? "Edit" : "Add"}>
          {photoCount > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {summary.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl bg-r-card">
                  {photo.previewUrl || photo.url ? (
                    <Image src={photo.previewUrl || photo.url} alt={photo.file_name} fill sizes="(min-width: 640px) 200px, 30vw" className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-2 text-center text-caption text-r-muted">{photo.file_name}</div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute right-2 top-2 rounded-full p-1.5 shadow-sm transition"
                    style={{ backgroundColor: "rgba(240,234,226,0.9)" }}
                    aria-label={`Remove ${photo.file_name}`}
                  >
                    <svg width="12" height="12" fill="none" stroke="var(--color-r-danger)" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1H5" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptySummary>No photos have been added. You can submit without photos.</EmptySummary>
          )}
        </ReviewSection>

        {/* Audio */}
        <ReviewSection title={`Uploaded audio (${voiceCount})`} actionHref={`/contribute/${inviteToken}/voice`} actionLabel={voiceCount > 0 ? "Edit" : "Add"}>
          {voiceCount > 0 ? (
            <div className="flex flex-col gap-4">
              {summary.voice.map((recording) => (
                <div key={recording.id} className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--color-r-text)' }}>
                    <svg width="14" height="14" fill="white" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-2 font-medium text-r-text">{recording.contributor_title}</p>
                    <p className="text-caption text-r-muted">{recording.file_name} - {formatDuration(recording.duration_seconds)}</p>
                  </div>
                  <button type="button" onClick={() => handleDeleteVoice(recording.id)} className="p-1.5 transition-colors text-r-danger" aria-label={`Remove ${recording.contributor_title}`}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0a1 1 0 00-1-1h-4a1 1 0 00-1 1H5" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptySummary>No voice recordings have been added. You can submit without audio.</EmptySummary>
          )}
        </ReviewSection>

        <p className="text-center text-caption text-r-muted">
          By submitting, you confirm that these memories may be shared with the memorial organizer and handled with care and respect.
        </p>

        {submitError ? (
          <p className="rounded-[13px] px-4 py-3 text-center text-caption bg-red-50 text-r-danger" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ContributorButton href={`/contribute/${inviteToken}/upload`} variant="secondary">
            Upload more
          </ContributorButton>
          <ContributorButton onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : submitError ? "Retry submit" : "Submit"}
          </ContributorButton>
        </div>

      </div>
    </ContributorShell>
  );
}
