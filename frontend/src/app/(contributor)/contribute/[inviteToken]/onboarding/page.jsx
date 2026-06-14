"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { validateContributorInvite } from "@/services/contributorService.js";
import ContributorShell from "@/components/contributor/shell/ContributorShell.jsx";
import ContributorButton from "@/components/contributor/shell/ContributorButton.jsx";
import {
  ContributorErrorState,
  ContributorLoadingState,
  ContributorPageHeader,
} from "@/components/contributor/shell/ContributorStates.jsx";

export default function ContributorOnboardingPage() {
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

  if (isLoading) return <ContributorLoadingState message="Loading memorial details..." />;
  if (!invite || invite.status !== "valid") {
    return (
      <ContributorErrorState
        title="This invitation is not available"
        body="Please return to your invitation link and try again."
        actionHref={`/contribute/${inviteToken}`}
      />
    );
  }

  const biography =
    invite.memorial?.biography?.trim() ||
    `This is a space to share what you remember about ${invite.deceased.name}.`;

  return (
    <ContributorShell backHref={`/contribute/${inviteToken}`} contentClassName="items-center">
      <ContributorPageHeader
        title={`Remembering ${invite.deceased.name}`}
        subtitle={`You've been invited to share your memories to contribute to their memorial. Remember will learn who ${invite.deceased.name} was through your perspective and guide you through sharing photos, stories, and voice recordings.`}
      />

      <div className="flex w-full max-w-[886px] flex-col items-center gap-10 lg:flex-row lg:items-center">
        <div className="relative size-[220px] shrink-0 overflow-hidden rounded-full bg-r-card lg:size-[314px]">
          {invite.deceased.photoUrl ? (
            <Image
              src={invite.deceased.photoUrl}
              alt={`Photo of ${invite.deceased.name}`}
              fill
              className="object-cover"
              sizes="314px"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-[family-name:var(--font-boska)] text-6xl text-r-muted">
              {invite.deceased.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="max-w-[433px] text-left">
          <h2 className="font-[family-name:var(--font-boska)] text-3xl font-medium text-r-text">
            {invite.deceased.name}
          </h2>
          {invite.memorial?.date_of_birth || invite.memorial?.date_of_passing ? (
            <p className="mt-4 text-body-2 text-r-secondary">
              {invite.memorial?.date_of_birth
                ? new Date(invite.memorial.date_of_birth).getFullYear()
                : ""}
              {invite.memorial?.date_of_birth && invite.memorial?.date_of_passing ? " - " : ""}
              {invite.memorial?.date_of_passing
                ? new Date(invite.memorial.date_of_passing).getFullYear()
                : ""}
            </p>
          ) : null}
          <p className="mt-4 text-body text-r-secondary">{biography}</p>
        </div>
      </div>

      <ContributorButton onClick={() => router.push(`/contribute/${inviteToken}/privacy`)}>
        Continue
      </ContributorButton>
    </ContributorShell>
  );
}
