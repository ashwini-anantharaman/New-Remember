"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  beginContributorDraft,
  validateContributorInvite,
} from "@/services/contributorService.js";
import ContributorShell from "@/components/contributor/shell/ContributorShell.jsx";
import ContributorButton from "@/components/contributor/shell/ContributorButton.jsx";
import {
  ContributorErrorState,
  ContributorLoadingState,
  ContributorPageHeader,
} from "@/components/contributor/shell/ContributorStates.jsx";

export default function PublicContributorPage() {
  const router = useRouter();
  const { inviteToken } = useParams();
  const [invite, setInvite] = useState(null);
  const [contributorName, setContributorName] = useState("");
  const [nameError, setNameError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedName = contributorName.trim();
    if (!trimmedName) {
      setNameError("Please enter your name.");
      return;
    }

    setNameError("");
    setSubmitError("");
    setIsSubmitting(true);

    try {
      await beginContributorDraft(inviteToken, trimmedName);
      router.push(`/contribute/${inviteToken}/relationship`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "We could not save your name. Please try again.",
      );
      setIsSubmitting(false);
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
    <ContributorShell backHref={`/contribute/${inviteToken}/privacy`} contentClassName="items-center">
      <ContributorPageHeader
        title="Contribution privacy"
        subtitle="Write the name that will be displayed with your contributions."
      />

      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[434px] flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <label htmlFor="contributor-name" className="text-h3 font-medium text-r-text">
            Your name
          </label>
          <input
            id="contributor-name"
            type="text"
            value={contributorName}
            onChange={(event) => {
              setContributorName(event.target.value);
              setNameError("");
            }}
            placeholder="Enter your name"
            className={`h-[63px] rounded-[13px] border bg-white px-5 text-body text-r-text outline-none transition placeholder:text-r-secondary focus:border-r-border-focus focus:ring-2 focus:ring-r-card ${
              nameError ? "border-r-danger" : "border-r-muted"
            }`}
          />
          {nameError ? <p className="text-body-2 text-r-danger">{nameError}</p> : null}
        </div>

        {submitError ? (
          <p className="text-center text-body-2 text-r-danger" role="alert">
            {submitError}
          </p>
        ) : null}

        <ContributorButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Continue"}
        </ContributorButton>
      </form>
    </ContributorShell>
  );
}
