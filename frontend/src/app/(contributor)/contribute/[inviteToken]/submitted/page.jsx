"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MemorialCoverImage from "@/components/memorial/MemorialCoverImage.jsx";
import { getContributorSubmittedDraft } from "@/services/contributorService.js";
import ContributorShell from "@/components/contributor/shell/ContributorShell.jsx";
import ContributorButton from "@/components/contributor/shell/ContributorButton.jsx";
import {
  ContributorErrorState,
  ContributorLoadingState,
  ContributorPageHeader,
} from "@/components/contributor/shell/ContributorStates.jsx";

const submittedErrorCopy = {
  invalid: { title: "This invitation link is not available", body: "Please check the link or ask the memorial organizer to send a new invitation." },
  expired: { title: "This invitation has expired", body: "The contribution window for this link has passed." },
  closed: { title: "Contributions are closed", body: "This memorial is not accepting new contributions right now." },
  missing: { title: "We could not find your contribution draft", body: "Please return to the invitation page and enter your name before submitting memories." },
  error: { title: "We could not open this confirmation", body: "Something went wrong while loading this page." },
};

function SubmittedErrorState({ status, inviteToken }) {
  const copy = submittedErrorCopy[status] ?? submittedErrorCopy.error;
  return (
    <ContributorErrorState
      title={copy.title}
      body={copy.body}
      actionHref={status === "missing" ? `/contribute/${inviteToken}` : undefined}
    />
  );
}

function MemorialAvatar({ name, photoUrl }) {
  return (
    <div className="relative size-[180px] overflow-hidden rounded-full">
      <MemorialCoverImage
        src={photoUrl}
        name={name}
        fill
        className="h-full w-full text-[52px] sm:text-[60px]"
        fallbackClassName="bg-r-shape text-white text-[52px] font-medium"
      />
    </div>
  );
}

export default function SubmittedPage() {
  const { inviteToken } = useParams();
  const [draft, setDraft] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSubmitted() {
      setIsLoading(true);
      try {
        const submittedDraft = await getContributorSubmittedDraft(inviteToken);
        if (isMounted) setDraft(submittedDraft);
      } catch {
        if (isMounted) setDraft({ status: "error", invite: null, session: null });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSubmitted();
    return () => { isMounted = false; };
  }, [inviteToken]);

  if (isLoading) return <ContributorLoadingState message="Opening confirmation..." />;
  if (!draft || draft.status !== "ready") {
    return <SubmittedErrorState status={draft?.status ?? "error"} inviteToken={inviteToken} />;
  }

  const subjectName = draft.invite.deceased.name;

  return (
    <ContributorShell contentClassName="items-center gap-16">
      <ContributorPageHeader
        title="Submission completed"
        subtitle="Thank you for sharing these precious moments. Your memories will be treasured and help keep their spirit alive."
      />

      <MemorialAvatar name={subjectName} photoUrl={draft.invite.deceased.photoUrl} />

      <ContributorButton href={`/contribute/${inviteToken}/upload`}>
        Upload more memories
      </ContributorButton>
    </ContributorShell>
  );
}
