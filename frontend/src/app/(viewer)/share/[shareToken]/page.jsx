"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getShareToken } from "@/lib/api";
import { mockMemorials } from "@/data/mockMemorials.js";
import ViewerNav from "@/components/viewer/shell/ViewerNav";
import ViewerShell from "@/components/viewer/shell/ViewerShell";
import ViewerButton from "@/components/viewer/shell/ViewerButton";
import ViewerBottomNav from "@/components/viewer/shell/ViewerBottomNav";
import { ViewerLandingProfile, ViewerCompactProfile } from "@/components/viewer/shell/ViewerProfileHeader";
import ViewerMemorialExperience from "@/components/viewer/ViewerMemorialExperience";

function experienceStorageKey(shareToken) {
  return `remember-viewer-started-${shareToken}`;
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto mt-24 flex max-w-[886px] animate-pulse flex-col items-center gap-[50px]">
      <div className="size-[220px] rounded-full bg-r-card sm:size-[314px]" />
      <div className="w-full max-w-[433px] space-y-4">
        <div className="mx-auto h-10 w-3/4 rounded bg-r-card" />
        <div className="mx-auto h-4 w-1/3 rounded bg-r-card" />
        <div className="mx-auto h-16 w-full rounded bg-r-card" />
      </div>
    </div>
  );
}

function InvalidToken({ message }) {
  return (
    <ViewerShell>
      <main className="px-6 py-10 sm:px-[50px]">
        <div className="mx-auto max-w-[680px]">
          <ViewerNav />
          <div className="mt-24 flex flex-col items-center text-center">
            <div className="relative mx-auto mb-8 h-14 w-20">
              <div className="absolute left-0 top-0 h-14 w-14 rounded-full bg-r-card" />
              <div className="absolute right-0 top-2 h-10 w-10 rounded-full bg-r-border" />
            </div>
            <h2 className="mb-2 text-h3 text-r-text">This link is no longer available</h2>
            <p className="max-w-xs text-body-2 leading-relaxed text-r-muted">{message}</p>
          </div>
        </div>
      </main>
    </ViewerShell>
  );
}

export default function SharePage() {
  const { shareToken } = useParams();
  const [activeTab, setActiveTab] = useState("Slideshow");
  const [output, setOutput] = useState(null);
  const [memorial, setMemorial] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [experienceStarted, setExperienceStarted] = useState(false);

  useEffect(() => {
    if (!shareToken || typeof window === "undefined") return;
    setExperienceStarted(window.sessionStorage.getItem(experienceStorageKey(shareToken)) === "1");
  }, [shareToken]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getShareToken(shareToken);
        setOutput(data);
        setContributors(data.contributors || data.contributor || []);
        setMemorial(data.memorial || mockMemorials[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shareToken]);

  function handleStart() {
    setExperienceStarted(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(experienceStorageKey(shareToken), "1");
    }
  }

  if (error) return <InvalidToken message={error} />;

  if (!experienceStarted) {
    return (
      <ViewerShell>
        <main className="px-6 py-10 sm:px-[50px]">
          <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-[1340px] flex-col">
            <ViewerNav showAuthLinks />
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-[50px] pb-16">
                <ViewerLandingProfile memorial={memorial} />
                <ViewerButton onClick={handleStart}>Start</ViewerButton>
              </div>
            )}
          </div>
        </main>
      </ViewerShell>
    );
  }

  return (
    <ViewerShell className="pb-24">
      <main className="px-6 py-10 sm:px-[50px]">
        <div className="mx-auto max-w-[1340px]">
          <ViewerNav showAuthLinks />
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="mt-10 flex flex-col gap-10">
              {activeTab === "Slideshow" ? <ViewerCompactProfile memorial={memorial} /> : null}
              <ViewerMemorialExperience
                activeTab={activeTab}
                output={output}
                memorial={memorial}
                contributors={contributors}
                graphWidth={800}
                graphHeight={800}
              />
            </div>
          )}
        </div>
      </main>
      <ViewerBottomNav active={activeTab} onChange={setActiveTab} />
    </ViewerShell>
  );
}
