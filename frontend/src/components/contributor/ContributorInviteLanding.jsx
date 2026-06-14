"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateContributorInvite } from "@/services/contributorService.js";
import ContributorShell from "@/components/contributor/shell/ContributorShell.jsx";
import ContributorButton from "@/components/contributor/shell/ContributorButton.jsx";
import {
  ContributorErrorState,
  ContributorLoadingState,
  ContributorPageHeader,
} from "@/components/contributor/shell/ContributorStates.jsx";

const inviteErrorCopy = {
  invalid: {
    title: "This invitation link is not available",
    body: "Please check the link or ask the memorial organizer to send a new invitation.",
  },
  expired: {
    title: "This invitation has expired",
    body: "The contribution window for this link has passed. The organizer can share a new link if they are still collecting memories.",
  },
  closed: {
    title: "Contributions are closed",
    body: "This memorial is not accepting new contributions right now. Thank you for wanting to share a memory.",
  },
  network_error: {
    title: "We could not open this invitation",
    body: "Please check your connection and try again in a moment.",
  },
  missing_data: {
    title: "This invitation is missing memorial details",
    body: "The invitation was found, but the memorial information is incomplete.",
  },
  error: {
    title: "We could not open this invitation",
    body: "Something went wrong while checking this invitation. Please try again in a moment.",
  },
};

export default function ContributorInviteLanding({ inviteToken }) {
  const router = useRouter();
  const [invite, setInvite] = useState(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function validateInvite() {
      setIsValidating(true);
      const validation = await validateContributorInvite(inviteToken);
      if (isMounted) {
        setInvite(validation);
        setIsValidating(false);
      }
    }

    validateInvite();
    return () => {
      isMounted = false;
    };
  }, [inviteToken]);

  if (isValidating) {
    return <ContributorLoadingState />;
  }

  if (!invite || invite.status !== "valid") {
    const copy = inviteErrorCopy[invite?.status ?? "invalid"] ?? inviteErrorCopy.invalid;
    return <ContributorErrorState title={copy.title} body={copy.body} />;
  }

  return (
    <ContributorShell contentClassName="items-center">
      <ContributorPageHeader
        title="Welcome to Remember"
        subtitle="A digital platform where you can create a private, dignified space where family and friends can share memories of your loved one."
      />

      <div className="flex w-full max-w-[476px] flex-col items-center gap-5 rounded-[20px] border border-r-muted px-6 py-10 text-center">
        <div className="relative size-[100px] overflow-hidden rounded-full bg-r-card">
          {invite.deceased.photoUrl ? (
            <Image
              src={invite.deceased.photoUrl}
              alt={`Photo of ${invite.deceased.name}`}
              fill
              className="object-cover"
              sizes="100px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-[family-name:var(--font-boska)] text-3xl text-r-muted">
              {invite.deceased.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <p className="font-[family-name:var(--font-boska)] text-2xl font-medium text-r-text">
          You&apos;ve been invited to contribute memories of {invite.deceased.name}.
        </p>
        <p className="text-body text-r-secondary">
          Share photos, videos, voice recordings, and written memories that celebrate the life and
          legacy of someone special.
        </p>
      </div>

      <ContributorButton onClick={() => router.push(`/contribute/${inviteToken}/onboarding`)}>
        Start
      </ContributorButton>
    </ContributorShell>
  );
}
