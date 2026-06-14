"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  beginContributorDraft,
  validateContributorInvite,
} from "@/services/contributorService.js";
import ContributorShell from "@/components/contributor/shell/ContributorShell.jsx";
import BoxSelection from "@/components/contributor/shell/BoxSelection.jsx";
import ContributorButton from "@/components/contributor/shell/ContributorButton.jsx";
import {
  ContributorErrorState,
  ContributorLoadingState,
  ContributorPageHeader,
} from "@/components/contributor/shell/ContributorStates.jsx";

export default function ContributorPrivacyPage() {
  const router = useRouter();
  const { inviteToken } = useParams();
  const [invite, setInvite] = useState(null);
  const [choice, setChoice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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

  async function handleContinue() {
    if (!choice) {
      setError("Please choose whether to include your name.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      if (choice === "named") {
        router.push(`/contribute/${inviteToken}/public-contributor`);
        return;
      }

      await beginContributorDraft(inviteToken, "Anonymous contributor");
      router.push(`/contribute/${inviteToken}/relationship`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We could not continue. Please try again.",
      );
      setIsSaving(false);
    }
  }

  if (isLoading) return <ContributorLoadingState />;
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
    <ContributorShell backHref={`/contribute/${inviteToken}/onboarding`} contentClassName="items-center">
      <ContributorPageHeader
        title="Contribution privacy"
        subtitle="Would you like to include your name in your contributions for viewers of the memorial to see?"
      />

      <div className="grid w-full max-w-[886px] grid-cols-1 gap-5 md:grid-cols-2">
        <BoxSelection
          title="Include my name"
          description="Your name will appear alongside the memories you share."
          selected={choice === "named"}
          onSelect={() => setChoice("named")}
        />
        <BoxSelection
          title="Stay anonymous"
          description="Your memories will be shared without displaying your name."
          selected={choice === "anonymous"}
          onSelect={() => setChoice("anonymous")}
        />
      </div>

      {error ? (
        <p className="text-center text-body-2 text-r-danger" role="alert">
          {error}
        </p>
      ) : null}

      <ContributorButton disabled={isSaving} onClick={handleContinue}>
        {isSaving ? "Continuing..." : "Continue"}
      </ContributorButton>
    </ContributorShell>
  );
}
