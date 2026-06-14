"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { validateContributorInvite } from "@/services/contributorService.js";
import ContributorShell from "@/components/contributor/shell/ContributorShell.jsx";
import BoxSelection from "@/components/contributor/shell/BoxSelection.jsx";
import ContributorButton from "@/components/contributor/shell/ContributorButton.jsx";
import {
  ContributorErrorState,
  ContributorLoadingState,
  ContributorPageHeader,
} from "@/components/contributor/shell/ContributorStates.jsx";

const MEDIA_TYPES = [
  {
    id: "photo",
    label: "Photo",
    description: "Share images from your camera roll",
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "audio",
    label: "Audio",
    description: "Upload a voice memo or recording",
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
      </svg>
    ),
  },
  {
    id: "story",
    label: "Story (text)",
    description: "Write a written memory in your own words",
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function UploadSelectorPage() {
  const router = useRouter();
  const { inviteToken } = useParams();
  const [invite, setInvite] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    validateContributorInvite(inviteToken).then((result) => {
      if (isMounted) {
        setInvite(result);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [inviteToken]);

  function handleSelect(type) {
    if (type === "photo") router.push(`/contribute/${inviteToken}/photos`);
    if (type === "audio") router.push(`/contribute/${inviteToken}/voice`);
    if (type === "story") router.push(`/contribute/${inviteToken}/story`);
  }

  if (isLoading) return <ContributorLoadingState message="Loading upload options..." />;
  if (!invite || invite.status !== "valid") {
    return (
      <ContributorErrorState
        title="This invitation is not available"
        body="Please return to your invitation link and try again."
        actionHref={`/contribute/${inviteToken}`}
      />
    );
  }

  return (
    <ContributorShell backHref={`/contribute/${inviteToken}/questions`} contentClassName="items-center gap-16">
      <ContributorPageHeader
        title="Upload your memories"
        subtitle={`Select the media type to begin uploading your fondest memories of ${invite.deceased.name}.`}
      />

      <div className="grid w-full max-w-[886px] grid-cols-1 gap-5 md:grid-cols-3">
        {MEDIA_TYPES.map((type) => (
          <BoxSelection
            key={type.id}
            title={type.label}
            description={type.description}
            onSelect={() => handleSelect(type.id)}
          >
            <span className="mb-4 text-r-muted">{type.icon}</span>
          </BoxSelection>
        ))}
      </div>

      <ContributorButton href={`/contribute/${inviteToken}/review`}>
        Review contributions
      </ContributorButton>
    </ContributorShell>
  );
}
