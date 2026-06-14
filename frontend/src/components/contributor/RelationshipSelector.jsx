"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getContributorRelationshipDraft,
  saveContributorRelationship,
} from "@/services/contributorService.js";
import { CONTRIBUTOR_RELATIONSHIP_OTHER } from "@/lib/contribute/relationshipOptions.js";
import {
  CONTRIBUTOR_FAMILY_OPTIONS,
  CONTRIBUTOR_RELATIONSHIP_CATEGORIES,
} from "@/lib/contribute/relationshipCategories.js";
import ContributorShell from "@/components/contributor/shell/ContributorShell.jsx";
import BoxSelection from "@/components/contributor/shell/BoxSelection.jsx";
import ContributorButton from "@/components/contributor/shell/ContributorButton.jsx";
import {
  ContributorErrorState,
  ContributorLoadingState,
  ContributorPageHeader,
} from "@/components/contributor/shell/ContributorStates.jsx";

const relationshipErrorCopy = {
  invalid: {
    title: "This invitation link is not available",
    body: "Please check the link or ask the memorial organizer to send a new invitation.",
  },
  expired: {
    title: "This invitation has expired",
    body: "The contribution window for this link has passed.",
  },
  closed: {
    title: "Contributions are closed",
    body: "This memorial is not accepting new contributions right now.",
  },
  error: {
    title: "We could not open your contribution",
    body: "Please return to the invitation page and try again.",
  },
  missing: {
    title: "We could not find your contribution draft",
    body: "Please return to the invitation page and enter your name before choosing your relationship.",
  },
};

function RelationshipErrorState({ status, inviteToken }) {
  const copy = relationshipErrorCopy[status] ?? relationshipErrorCopy.invalid;
  return (
    <ContributorErrorState
      title={copy.title}
      body={copy.body}
      actionHref={status === "missing" ? `/contribute/${inviteToken}` : undefined}
      actionLabel="Return to invitation"
    />
  );
}

function resolveBackHref(inviteToken, session) {
  const contributorName = session?.contributorName?.trim();
  if (contributorName && contributorName !== "Anonymous contributor") {
    return `/contribute/${inviteToken}/public-contributor`;
  }
  return `/contribute/${inviteToken}/privacy`;
}

export default function RelationshipSelector({ inviteToken }) {
  const router = useRouter();
  const [draft, setDraft] = useState(null);
  const [view, setView] = useState("categories");
  const [relationshipType, setRelationshipType] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDraft() {
      setIsLoading(true);
      let relationshipDraft;

      try {
        relationshipDraft = await getContributorRelationshipDraft(inviteToken);
      } catch (error) {
        console.error("Failed to load contributor relationship draft.", error);
        relationshipDraft = { status: "error", invite: null, session: null };
      }

      if (!isMounted) return;

      setDraft(relationshipDraft);
      const savedType = relationshipDraft?.relationship_type ?? "";
      setRelationshipType(savedType);
      setCustomLabel(relationshipDraft?.relationship_custom_label ?? "");

      if (CONTRIBUTOR_FAMILY_OPTIONS.includes(savedType)) {
        setView("family");
      }

      setIsLoading(false);
    }

    loadDraft();
    return () => {
      isMounted = false;
    };
  }, [inviteToken]);

  const isOtherSelected = relationshipType === CONTRIBUTOR_RELATIONSHIP_OTHER;
  const selectedCategoryId = CONTRIBUTOR_RELATIONSHIP_CATEGORIES.find(
    (category) =>
      category.value === relationshipType ||
      (category.id === "family" && CONTRIBUTOR_FAMILY_OPTIONS.includes(relationshipType)),
  )?.id;

  const validate = () => {
    const nextErrors = {};

    if (!relationshipType) {
      nextErrors.relationshipType = "Please choose the relationship that fits best.";
    }

    if (isOtherSelected && !customLabel.trim()) {
      nextErrors.customLabel = "Please share a short label for your relationship.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCategorySelect = (category) => {
    setSubmitError("");
    setErrors({});

    if (category.hasSubOptions) {
      setView("family");
      setRelationshipType("");
      setCustomLabel("");
      return;
    }

    if (category.value === CONTRIBUTOR_RELATIONSHIP_OTHER) {
      setView("categories");
      setRelationshipType(CONTRIBUTOR_RELATIONSHIP_OTHER);
      return;
    }

    setView("categories");
    setRelationshipType(category.value);
    setCustomLabel("");
  };

  const handleFamilySelect = (option) => {
    setRelationshipType(option);
    setCustomLabel("");
    setErrors({});
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setIsSaving(true);
    setSubmitError("");

    try {
      await saveContributorRelationship(inviteToken, {
        relationshipType,
        relationshipCustomLabel: customLabel,
      });
      router.push(`/contribute/${inviteToken}/intro`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not save your relationship yet. Please try again.",
      );
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <ContributorLoadingState message="Opening your contribution..." />;
  }

  if (!draft || draft.status !== "ready") {
    return <RelationshipErrorState status={draft?.status ?? "invalid"} inviteToken={inviteToken} />;
  }

  const privacyBackHref = resolveBackHref(inviteToken, draft.session);

  return (
    <ContributorShell
      backHref={view === "family" ? undefined : privacyBackHref}
      onBack={view === "family" ? () => setView("categories") : undefined}
      contentClassName="items-center gap-16"
    >
      <ContributorPageHeader
        title={
          view === "family"
            ? "Which family relationship fits best?"
            : "Your relationship"
        }
        subtitle={
          view === "family"
            ? `Choose how you are related to ${draft.invite.deceased.name}.`
            : `Help us understand your connection to ${draft.invite.deceased.name}.`
        }
      />

      <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[886px] flex-col gap-8">
        {view === "categories" ? (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            role="radiogroup"
            aria-invalid={Boolean(errors.relationshipType)}
            aria-describedby={errors.relationshipType ? "contributor-relationship-error" : undefined}
          >
            {CONTRIBUTOR_RELATIONSHIP_CATEGORIES.map((category) => (
              <BoxSelection
                key={category.id}
                title={category.label}
                compact
                selected={selectedCategoryId === category.id}
                onSelect={() => handleCategorySelect(category)}
              />
            ))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            role="radiogroup"
            aria-invalid={Boolean(errors.relationshipType)}
          >
            {CONTRIBUTOR_FAMILY_OPTIONS.map((option) => (
              <BoxSelection
                key={option}
                title={option}
                compact
                selected={relationshipType === option}
                onSelect={() => handleFamilySelect(option)}
              />
            ))}
          </div>
        )}

        {isOtherSelected ? (
          <div className="mx-auto flex w-full max-w-[434px] flex-col gap-2.5">
            <label htmlFor="contributor-relationship-custom" className="text-h3 font-medium text-r-text">
              Relationship label
            </label>
            <input
              id="contributor-relationship-custom"
              name="relationshipCustomLabel"
              type="text"
              value={customLabel}
              onChange={(event) => {
                setCustomLabel(event.target.value);
                setErrors((current) => ({ ...current, customLabel: "" }));
                setSubmitError("");
              }}
              placeholder="For example, former student"
              aria-invalid={Boolean(errors.customLabel)}
              className={`h-[63px] rounded-[13px] border bg-white px-5 text-body text-r-text outline-none transition placeholder:text-r-secondary focus:border-r-border-focus focus:ring-2 focus:ring-r-card ${
                errors.customLabel ? "border-r-danger" : "border-r-muted"
              }`}
            />
            {errors.customLabel ? (
              <p className="text-body-2 text-r-danger">{errors.customLabel}</p>
            ) : null}
          </div>
        ) : null}

        {errors.relationshipType ? (
          <p id="contributor-relationship-error" className="text-center text-body-2 text-r-danger">
            {errors.relationshipType}
          </p>
        ) : null}

        {submitError ? (
          <p className="text-center text-body-2 text-r-danger" role="alert">
            {submitError}
          </p>
        ) : null}

        <ContributorButton type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Continue"}
        </ContributorButton>
      </form>
    </ContributorShell>
  );
}
