"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { validateContributorInvite } from "@/services/contributorService.js";
import ContributorShell from "@/components/contributor/shell/ContributorShell.jsx";
import ContributorButton from "@/components/contributor/shell/ContributorButton.jsx";
import AiOrb from "@/components/contributor/shell/AiOrb.jsx";
import {
  ContributorErrorState,
  ContributorLoadingState,
  ContributorPageHeader,
} from "@/components/contributor/shell/ContributorStates.jsx";

export default function ContributorIntroPage() {
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

  if (isLoading) return <ContributorLoadingState message="Preparing your questions..." />;
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
    <ContributorShell backHref={`/contribute/${inviteToken}/relationship`} contentClassName="items-center">
      <ContributorPageHeader
        title="AI interview"
        subtitle={`Answer a few questions to help us understand who ${invite.deceased.name} was from your perspective.`}
      />

      <AiOrb />

      <ContributorButton onClick={() => router.push(`/contribute/${inviteToken}/questions`)}>
        Begin interview
      </ContributorButton>
    </ContributorShell>
  );
}
