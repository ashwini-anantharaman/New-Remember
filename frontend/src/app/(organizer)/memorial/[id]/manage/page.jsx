"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { generateMemorialOutput, getGenerationJobStatus, getMemorialOutput } from "@/services/memorialService";
import { getMemorialContributors } from "@/services/contributorService";
import { getMemorial } from "@/lib/api";
import { getAuthToken } from "@/lib/api.js";
import ProcessingTextSequence from "@/components/dashboard/ProcessingTextSequence";
import OrganizerShell from "@/components/organizer/shell/OrganizerShell.jsx";
import OrganizerTabBar from "@/components/organizer/shell/OrganizerTabBar.jsx";
import MemorialManageHeader from "@/components/organizer/shell/MemorialManageHeader.jsx";
import OrganizerArchiveTab from "@/components/organizer/manage/OrganizerArchiveTab.jsx";
import OrganizerContributionsTab from "@/components/organizer/manage/OrganizerContributionsTab.jsx";
import OrganizerOutputsTab from "@/components/organizer/manage/OrganizerOutputsTab.jsx";
import OrganizerShareModal from "@/components/organizer/manage/OrganizerShareModal.jsx";

const MAIN_TABS = ["Archive", "Contributions", "Outputs"];
const GENERATION_POLL_INTERVAL_MS = 1500;
const GENERATION_MAX_POLL_ATTEMPTS = 60;
const GENERATION_SUCCESS_STATUSES = new Set(["complete", "completed", "succeeded", "success"]);
const GENERATION_FAILURE_STATUSES = new Set(["failed", "error"]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function MemorialManagePage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Outputs");
  const [output, setOutput] = useState(null);
  const [outputLoading, setOutputLoading] = useState(true);
  const [outputError, setOutputError] = useState(null);
  const [contributorsLoading, setContributorsLoading] = useState(true);
  const [contributorsError, setContributorsError] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [contributors, setContributors] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const [generationJob, setGenerationJob] = useState(null);
  const [memorial, setMemorial] = useState(null);

  const loadMemorial = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getMemorial(id);
      const m = data?.memorial ?? data;
      if (!m) return;
      setMemorial({
        id: m.id,
        subject_name: m.subject_name || m.deceased_name,
        cover_photo_url: m.cover_photo_url || m.profile_photo_url || null,
        date_of_birth: m.date_of_birth || m.birth_date || null,
        date_of_passing: m.date_of_passing || m.death_date || null,
        bio: m.brief_biography || m.short_description || m.biography || null,
        status: m.status || null,
      });
    } catch {
      setMemorial(null);
    }
  }, [id]);

  const loadContributors = useCallback(async () => {
    if (!id) return;
    setContributorsLoading(true);
    setContributorsError(null);
    try {
      const token = await getAuthToken();
      const result = await getMemorialContributors(id, token);
      setContributors(result.contributors ?? []);
      await loadMemorial();
    } catch (err) {
      setContributorsError(err instanceof Error ? err.message : "Failed to fetch contributors");
      setContributors([]);
    } finally {
      setContributorsLoading(false);
    }
  }, [id, loadMemorial]);

  const loadOutput = useCallback(async (options = {}) => {
    if (!id) return;
    setOutputLoading(true);
    setOutputError(null);
    try {
      const token = await getAuthToken();
      const data = await getMemorialOutput(id, token, options);
      setOutput(data);
      return data;
    } catch (err) {
      setOutputError(err instanceof Error ? err.message : "Failed to fetch memorial output");
      setOutput(null);
      return null;
    } finally {
      setOutputLoading(false);
    }
  }, [id]);

  const handleGenerate = useCallback(async () => {
    if (!id || generating) return;
    setGenerating(true);
    setGenerationError(null);
    setGenerationJob(null);
    const token = await getAuthToken();
    try {
      const generation = await generateMemorialOutput(id, token);
      const initialJob = generation?.job ?? null;
      setGenerationJob(initialJob);

      if (initialJob?.id) {
        let latestJob = initialJob;
        for (let attempt = 0; attempt < GENERATION_MAX_POLL_ATTEMPTS; attempt += 1) {
          const status = String(latestJob?.status || "").toLowerCase();
          if (GENERATION_SUCCESS_STATUSES.has(status)) break;
          if (GENERATION_FAILURE_STATUSES.has(status)) {
            throw new Error(latestJob?.error_message || "Generation failed. Please try again.");
          }
          await sleep(GENERATION_POLL_INTERVAL_MS);
          const jobStatus = await getGenerationJobStatus(initialJob.id, token);
          latestJob = jobStatus?.job ?? latestJob;
          setGenerationJob(latestJob);
        }
        const finalStatus = String(latestJob?.status || "").toLowerCase();
        if (!GENERATION_SUCCESS_STATUSES.has(finalStatus)) {
          throw new Error("Generation is taking longer than expected. Please try refreshing the outputs shortly.");
        }
      }

      await loadOutput({ fallbackToMock: process.env.NODE_ENV !== "production" });
    } catch (err) {
      setGenerationError(err instanceof Error ? err.message : "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [generating, id, loadOutput]);

  const submittedContributionCount = contributors.filter((contributor) => {
    const status = String(contributor?.status || "").toLowerCase();
    return status === "submitted" || Boolean(contributor?.submitted_at);
  }).length;

  const canGenerate = !contributorsLoading && !contributorsError && submittedContributionCount > 0;
  const generationDisabledMessage = contributorsLoading
    ? "Checking submitted contributions..."
    : contributorsError
      ? "Contributor data could not be loaded, so generation is unavailable right now."
      : submittedContributionCount === 0
        ? "Generation is available after at least one contributor submits a memory."
        : "";

  useEffect(() => {
    queueMicrotask(loadMemorial);
  }, [loadMemorial]);

  useEffect(() => {
    queueMicrotask(loadContributors);
  }, [loadContributors]);

  useEffect(() => {
    queueMicrotask(loadOutput);
  }, [loadOutput]);

  return (
    <OrganizerShell backHref="/dashboard" contentClassName="gap-[100px]">
      <MemorialManageHeader
        memorial={memorial}
        onShare={() => setShowShare(true)}
        contributionCount={submittedContributionCount}
      />

      <section className="flex w-full flex-col gap-[50px]">
        <OrganizerTabBar tabs={MAIN_TABS} active={activeTab} onChange={setActiveTab} />

        {generating ? (
          <div className="rounded-[20px] border border-r-muted bg-r-modal/40 px-6 py-4" aria-live="polite">
            <p className="text-body-2 text-r-secondary">
              {generationJob?.current_step || "Preparing generation..."}
            </p>
            <ProcessingTextSequence />
          </div>
        ) : null}

        <div>
          {activeTab === "Archive" ? <OrganizerArchiveTab contributors={contributors} /> : null}
          {activeTab === "Contributions" ? (
            <OrganizerContributionsTab
              contributors={contributors}
              loading={contributorsLoading}
              error={contributorsError}
              onRetry={loadContributors}
            />
          ) : null}
          {activeTab === "Outputs" ? (
            <OrganizerOutputsTab
              memorial={memorial}
              contributors={contributors}
              canGenerate={canGenerate}
              disabledMessage={generationDisabledMessage}
              generationError={generationError}
              generating={generating}
              onGenerate={handleGenerate}
              output={output}
              loading={outputLoading}
              error={outputError}
              onRetry={loadOutput}
            />
          ) : null}
        </div>
      </section>

      {showShare ? <OrganizerShareModal onClose={() => setShowShare(false)} memorialId={id} /> : null}
    </OrganizerShell>
  );
}
